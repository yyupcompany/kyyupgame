#!/usr/bin/env node

/**
 * 数据库表全面分析脚本
 * 提取所有表的完整信息，包括字段结构、关联关系、数据统计
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
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

/**
 * 获取所有表的基本信息
 */
async function getAllTablesInfo(connection) {
  const [tables] = await connection.execute(`
    SELECT 
      table_name,
      table_rows,
      table_comment,
      create_time,
      update_time,
      table_collation,
      engine
    FROM information_schema.tables 
    WHERE table_schema = ?
    ORDER BY table_name
  `, [dbConfig.database]);
  
  return tables;
}

/**
 * 获取表的详细字段信息
 */
async function getTableColumns(connection, tableName) {
  const [columns] = await connection.execute(`
    SELECT 
      column_name,
      data_type,
      column_type,
      is_nullable,
      column_default,
      column_comment,
      column_key,
      extra,
      ordinal_position
    FROM information_schema.columns 
    WHERE table_schema = ? AND table_name = ?
    ORDER BY ordinal_position
  `, [dbConfig.database, tableName]);
  
  return columns;
}

/**
 * 获取表的外键关系
 */
async function getTableForeignKeys(connection, tableName) {
  const [foreignKeys] = await connection.execute(`
    SELECT 
      column_name,
      referenced_table_name,
      referenced_column_name,
      constraint_name
    FROM information_schema.key_column_usage 
    WHERE table_schema = ? 
      AND table_name = ? 
      AND referenced_table_name IS NOT NULL
  `, [dbConfig.database, tableName]);
  
  return foreignKeys;
}

/**
 * 获取表的索引信息
 */
async function getTableIndexes(connection, tableName) {
  const [indexes] = await connection.execute(`
    SELECT 
      index_name,
      column_name,
      non_unique,
      index_type
    FROM information_schema.statistics 
    WHERE table_schema = ? AND table_name = ?
    ORDER BY index_name, seq_in_index
  `, [dbConfig.database, tableName]);
  
  return indexes;
}

/**
 * 获取表的数据样本
 */
async function getTableSample(connection, tableName, limit = 2) {
  try {
    const [rows] = await connection.execute(`SELECT * FROM \`${tableName}\` LIMIT ?`, [limit]);
    return rows;
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * 分析表的业务类型
 */
function analyzeTableBusinessType(tableName, columns, comment) {
  const name = tableName.toLowerCase();
  const commentLower = (comment || '').toLowerCase();
  
  // 系统表
  if (name.includes('sequelize') || name.includes('migration') || name.includes('meta')) {
    return 'system';
  }
  
  // 用户权限相关
  if (name.includes('user') || name.includes('role') || name.includes('permission')) {
    return 'auth';
  }
  
  // 核心业务表
  if (name.includes('student') || name.includes('teacher') || name.includes('class') || 
      name.includes('kindergarten') || name.includes('parent')) {
    return 'core_business';
  }
  
  // 活动相关
  if (name.includes('activity') || name.includes('event')) {
    return 'activity';
  }
  
  // 招生相关
  if (name.includes('enrollment') || name.includes('admission') || name.includes('application')) {
    return 'enrollment';
  }
  
  // AI相关
  if (name.includes('ai_') || commentLower.includes('ai')) {
    return 'ai';
  }
  
  // 营销相关
  if (name.includes('marketing') || name.includes('campaign') || name.includes('referral')) {
    return 'marketing';
  }
  
  // 配置相关
  if (name.includes('config') || name.includes('setting') || name.includes('template')) {
    return 'config';
  }
  
  // 日志相关
  if (name.includes('log') || name.includes('tracking') || name.includes('record')) {
    return 'log';
  }
  
  return 'other';
}

/**
 * 分析表的查询优先级
 */
function analyzeQueryPriority(tableName, rowCount, businessType) {
  // 高优先级：核心业务表且有数据
  if (businessType === 'core_business' && rowCount > 0) {
    return 'high';
  }
  
  // 中优先级：活动、招生相关且有数据
  if ((businessType === 'activity' || businessType === 'enrollment') && rowCount > 0) {
    return 'medium';
  }
  
  // 低优先级：配置、日志、AI相关
  if (['config', 'log', 'ai'].includes(businessType)) {
    return 'low';
  }
  
  // 忽略：系统表或无数据表
  if (businessType === 'system' || rowCount === 0) {
    return 'ignore';
  }
  
  return 'medium';
}

/**
 * 主分析函数
 */
async function analyzeDatabaseTables() {
  let connection;
  
  try {
    console.log('连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('数据库连接成功');
    
    console.log('获取所有表信息...');
    const tables = await getAllTablesInfo(connection);
    
    console.log(`发现 ${tables.length} 个表，开始详细分析...`);
    
    const analysisResults = {
      timestamp: new Date().toISOString(),
      database: dbConfig.database,
      totalTables: tables.length,
      tableAnalysis: [],
      businessTypeStats: {},
      priorityStats: {},
      summary: {}
    };
    
    for (const table of tables) {
      const tableName = table.table_name || table.TABLE_NAME;
      const rowCount = table.table_rows || table.TABLE_ROWS || 0;
      const comment = table.table_comment || table.TABLE_COMMENT || '';
      
      console.log(`分析表: ${tableName} (${rowCount} 行)`);
      
      try {
        // 获取详细信息
        const columns = await getTableColumns(connection, tableName);
        const foreignKeys = await getTableForeignKeys(connection, tableName);
        const indexes = await getTableIndexes(connection, tableName);
        const sample = await getTableSample(connection, tableName);
        
        // 业务分析
        const businessType = analyzeTableBusinessType(tableName, columns, comment);
        const priority = analyzeQueryPriority(tableName, rowCount, businessType);
        
        const tableAnalysis = {
          tableName,
          rowCount,
          comment,
          businessType,
          priority,
          columnCount: columns.length,
          hasData: rowCount > 0,
          hasForeignKeys: foreignKeys.length > 0,
          columns: columns.map(col => ({
            name: col.column_name || col.COLUMN_NAME,
            type: col.data_type || col.DATA_TYPE,
            nullable: (col.is_nullable || col.IS_NULLABLE) === 'YES',
            key: col.column_key || col.COLUMN_KEY,
            comment: col.column_comment || col.COLUMN_COMMENT
          })),
          foreignKeys: foreignKeys.map(fk => ({
            column: fk.column_name,
            referencedTable: fk.referenced_table_name,
            referencedColumn: fk.referenced_column_name
          })),
          indexes: indexes.map(idx => ({
            name: idx.index_name,
            column: idx.column_name,
            unique: idx.non_unique === 0
          })),
          sampleData: Array.isArray(sample) ? sample.slice(0, 1) : null
        };
        
        analysisResults.tableAnalysis.push(tableAnalysis);
        
        // 统计
        analysisResults.businessTypeStats[businessType] = 
          (analysisResults.businessTypeStats[businessType] || 0) + 1;
        analysisResults.priorityStats[priority] = 
          (analysisResults.priorityStats[priority] || 0) + 1;
        
      } catch (error) {
        console.error(`分析表 ${tableName} 时出错:`, error.message);
        analysisResults.tableAnalysis.push({
          tableName,
          error: error.message,
          businessType: 'unknown',
          priority: 'ignore'
        });
      }
    }
    
    // 生成汇总
    analysisResults.summary = {
      tablesWithData: analysisResults.tableAnalysis.filter(t => t.hasData).length,
      tablesWithoutData: analysisResults.tableAnalysis.filter(t => !t.hasData).length,
      highPriorityTables: analysisResults.tableAnalysis.filter(t => t.priority === 'high').length,
      mediumPriorityTables: analysisResults.tableAnalysis.filter(t => t.priority === 'medium').length,
      lowPriorityTables: analysisResults.tableAnalysis.filter(t => t.priority === 'low').length,
      ignoreTables: analysisResults.tableAnalysis.filter(t => t.priority === 'ignore').length
    };
    
    // 保存分析结果
    const reportPath = path.join(__dirname, '../reports/database-tables-analysis.json');
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(analysisResults, null, 2));
    
    console.log('\n' + '='.repeat(80));
    console.log('数据库表分析完成');
    console.log('='.repeat(80));
    console.log(`总表数: ${analysisResults.totalTables}`);
    console.log(`有数据表: ${analysisResults.summary.tablesWithData}`);
    console.log(`无数据表: ${analysisResults.summary.tablesWithoutData}`);
    console.log('\n优先级分布:');
    console.log(`  高优先级: ${analysisResults.summary.highPriorityTables} 个`);
    console.log(`  中优先级: ${analysisResults.summary.mediumPriorityTables} 个`);
    console.log(`  低优先级: ${analysisResults.summary.lowPriorityTables} 个`);
    console.log(`  忽略: ${analysisResults.summary.ignoreTables} 个`);
    console.log('\n业务类型分布:');
    Object.entries(analysisResults.businessTypeStats).forEach(([type, count]) => {
      console.log(`  ${type}: ${count} 个`);
    });
    
    console.log(`\n详细分析报告已保存到: ${reportPath}`);
    
    return analysisResults;
    
  } catch (error) {
    console.error('分析过程中出错:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 运行分析
if (require.main === module) {
  analyzeDatabaseTables().catch(console.error);
}

module.exports = { analyzeDatabaseTables };
