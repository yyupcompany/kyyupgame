#!/usr/bin/env node

/**
 * AI字典关键词数据库验证脚本
 * 检查AI字典模板文件中的关键词是否与实际数据库表结构匹配
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

// 数据库连接配置
const dbConfig = {
  host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
  port: parseInt(process.env.DB_PORT || '43906'),
  database: process.env.DB_NAME || 'kargerdensales',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'pwk5ls7j',
  charset: 'utf8mb4'
};

// AI字典文件路径
const dictionaryPath = path.join(__dirname, '../src/config/ai-dictionaries');

// 结果统计
const results = {
  total: 0,
  valid: 0,
  invalid: 0,
  validQueries: [],
  invalidQueries: [],
  tableStatus: {}
};

/**
 * 读取所有AI字典文件
 */
function loadDictionaryFiles() {
  const files = fs.readdirSync(dictionaryPath).filter(file => file.endsWith('.json'));
  const dictionaries = {};
  
  files.forEach(file => {
    const filePath = path.join(dictionaryPath, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    dictionaries[file] = content;
  });
  
  return dictionaries;
}

/**
 * 提取查询模板中的表名
 */
function extractTablesFromQuery(queryData) {
  const tables = new Set();
  
  if (queryData.table) {
    if (queryData.table === 'multiple') {
      // 从SQL中提取表名
      if (queryData.sql) {
        const tableMatches = queryData.sql.match(/FROM\s+(\w+)/gi);
        if (tableMatches) {
          tableMatches.forEach(match => {
            const tableName = match.replace(/FROM\s+/i, '').trim();
            tables.add(tableName);
          });
        }
      }
    } else {
      tables.add(queryData.table);
    }
  }
  
  // 从joins中提取表名
  if (queryData.joins && Array.isArray(queryData.joins)) {
    queryData.joins.forEach(table => tables.add(table));
  }
  
  // 从SQL语句中提取更多表名
  if (queryData.sql) {
    const joinMatches = queryData.sql.match(/JOIN\s+(\w+)/gi);
    if (joinMatches) {
      joinMatches.forEach(match => {
        const tableName = match.replace(/JOIN\s+/i, '').trim();
        tables.add(tableName);
      });
    }
  }
  
  return Array.from(tables);
}

/**
 * 检查数据库中是否存在表
 */
async function checkTableExists(connection, tableName) {
  try {
    const [rows] = await connection.execute(
      'SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = ?',
      [dbConfig.database, tableName]
    );
    return rows[0].count > 0;
  } catch (error) {
    console.error(`检查表 ${tableName} 时出错:`, error.message);
    return false;
  }
}

/**
 * 检查表中是否有数据
 */
async function checkTableHasData(connection, tableName) {
  try {
    const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM \`${tableName}\``);
    return rows[0].count > 0;
  } catch (error) {
    console.error(`检查表 ${tableName} 数据时出错:`, error.message);
    return false;
  }
}

/**
 * 执行SQL查询测试
 */
async function testQuery(connection, sql, queryName) {
  try {
    const [rows] = await connection.execute(sql);
    return {
      success: true,
      rowCount: rows.length,
      data: rows.length > 0 ? rows[0] : null
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 主检查函数
 */
async function checkDictionaries() {
  let connection;
  
  try {
    // 连接数据库
    console.log('连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('数据库连接成功');
    
    // 加载字典文件
    console.log('加载AI字典文件...');
    const dictionaries = loadDictionaryFiles();
    
    // 检查每个字典文件
    for (const [fileName, dictionary] of Object.entries(dictionaries)) {
      console.log(`\n检查文件: ${fileName}`);
      
      if ((fileName === '05-query-templates.json' || fileName.includes('-templates.json')) && dictionary.queryTemplates) {
        // 检查查询模板
        for (const [queryName, queryData] of Object.entries(dictionary.queryTemplates)) {
          if (typeof queryData === 'string' || queryName.startsWith('//')) {
            continue; // 跳过注释
          }
          
          results.total++;
          
          const tables = extractTablesFromQuery(queryData);
          let isValid = true;
          let validationDetails = {
            queryName,
            fileName,
            tables,
            tableStatus: {},
            sqlTest: null
          };
          
          // 检查每个表
          for (const tableName of tables) {
            const tableExists = await checkTableExists(connection, tableName);
            const hasData = tableExists ? await checkTableHasData(connection, tableName) : false;
            
            validationDetails.tableStatus[tableName] = {
              exists: tableExists,
              hasData: hasData
            };
            
            if (!results.tableStatus[tableName]) {
              results.tableStatus[tableName] = {
                exists: tableExists,
                hasData: hasData,
                usedInQueries: []
              };
            }
            results.tableStatus[tableName].usedInQueries.push(queryName);
            
            if (!tableExists || !hasData) {
              isValid = false;
            }
          }
          
          // 测试SQL查询
          if (queryData.sql && isValid) {
            const sqlTest = await testQuery(connection, queryData.sql, queryName);
            validationDetails.sqlTest = sqlTest;
            if (!sqlTest.success) {
              isValid = false;
            }
          }
          
          if (isValid) {
            results.valid++;
            results.validQueries.push(validationDetails);
          } else {
            results.invalid++;
            results.invalidQueries.push(validationDetails);
          }
        }
      }
      
      // 检查其他字典文件中的表引用
      if (dictionary.tableFields) {
        for (const [tableName, tableData] of Object.entries(dictionary.tableFields)) {
          if (typeof tableData === 'string' || tableName.startsWith('//')) {
            continue;
          }
          
          const actualTableName = tableData.tableName || tableName;
          const tableExists = await checkTableExists(connection, actualTableName);
          const hasData = tableExists ? await checkTableHasData(connection, actualTableName) : false;
          
          if (!results.tableStatus[actualTableName]) {
            results.tableStatus[actualTableName] = {
              exists: tableExists,
              hasData: hasData,
              usedInQueries: []
            };
          }
        }
      }
    }
    
    // 生成报告
    generateReport();
    
  } catch (error) {
    console.error('检查过程中出错:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

/**
 * 生成检查报告
 */
function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log('AI字典关键词数据库验证报告');
  console.log('='.repeat(80));
  
  console.log(`\n总查询数: ${results.total}`);
  console.log(`有效查询: ${results.valid} (${(results.valid/results.total*100).toFixed(1)}%)`);
  console.log(`无效查询: ${results.invalid} (${(results.invalid/results.total*100).toFixed(1)}%)`);
  
  console.log('\n数据库表状态:');
  console.log('-'.repeat(60));
  for (const [tableName, status] of Object.entries(results.tableStatus)) {
    const statusText = status.exists 
      ? (status.hasData ? '✓ 存在且有数据' : '⚠ 存在但无数据') 
      : '✗ 不存在';
    console.log(`${tableName.padEnd(25)} ${statusText.padEnd(15)} (被${status.usedInQueries.length}个查询使用)`);
  }
  
  if (results.invalidQueries.length > 0) {
    console.log('\n无效查询详情:');
    console.log('-'.repeat(60));
    results.invalidQueries.forEach((query, index) => {
      console.log(`${index + 1}. ${query.queryName}`);
      console.log(`   文件: ${query.fileName}`);
      console.log(`   表状态:`);
      for (const [tableName, status] of Object.entries(query.tableStatus)) {
        const statusText = status.exists 
          ? (status.hasData ? '✓ 存在且有数据' : '⚠ 存在但无数据') 
          : '✗ 不存在';
        console.log(`     ${tableName}: ${statusText}`);
      }
      if (query.sqlTest && !query.sqlTest.success) {
        console.log(`   SQL错误: ${query.sqlTest.error}`);
      }
      console.log('');
    });
  }
  
  // 保存详细报告到文件
  const reportPath = path.join(__dirname, '../reports/ai-dictionary-validation-report.json');
  const reportDir = path.dirname(reportPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      total: results.total,
      valid: results.valid,
      invalid: results.invalid,
      validPercentage: (results.valid/results.total*100).toFixed(1)
    },
    tableStatus: results.tableStatus,
    validQueries: results.validQueries,
    invalidQueries: results.invalidQueries
  }, null, 2));
  
  console.log(`\n详细报告已保存到: ${reportPath}`);
}

// 运行检查
if (require.main === module) {
  checkDictionaries().catch(console.error);
}

module.exports = { checkDictionaries };
