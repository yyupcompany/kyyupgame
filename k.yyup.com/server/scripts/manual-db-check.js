#!/usr/bin/env node

/**
 * 手动数据库检查脚本
 * 用于验证AI字典中引用的表和字段是否在数据库中存在
 */

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

/**
 * 获取数据库中所有表的信息
 */
async function getAllTables(connection) {
  const [rows] = await connection.execute(`
    SELECT 
      table_name,
      table_rows,
      table_comment
    FROM information_schema.tables 
    WHERE table_schema = ?
    ORDER BY table_name
  `, [dbConfig.database]);
  
  return rows;
}

/**
 * 获取表的字段信息
 */
async function getTableColumns(connection, tableName) {
  const [rows] = await connection.execute(`
    SELECT 
      column_name,
      data_type,
      is_nullable,
      column_default,
      column_comment
    FROM information_schema.columns 
    WHERE table_schema = ? AND table_name = ?
    ORDER BY ordinal_position
  `, [dbConfig.database, tableName]);
  
  return rows;
}

/**
 * 检查表中的数据样本
 */
async function getTableSample(connection, tableName, limit = 3) {
  try {
    const [rows] = await connection.execute(`SELECT * FROM \`${tableName}\` LIMIT ?`, [limit]);
    return rows;
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * 测试AI字典中的关键查询
 */
async function testKeyQueries(connection) {
  const testQueries = [
    {
      name: '学生总数',
      sql: "SELECT COUNT(*) as count FROM students WHERE status = 'active'"
    },
    {
      name: '教师总数',
      sql: "SELECT COUNT(*) as count FROM teachers WHERE status = 'active'"
    },
    {
      name: '班级总数',
      sql: "SELECT COUNT(*) as count FROM classes WHERE status = 'active'"
    },
    {
      name: '活动总数',
      sql: "SELECT COUNT(*) as count FROM activities"
    },
    {
      name: '招生统计',
      sql: "SELECT COUNT(*) as total_applications, COUNT(CASE WHEN status = 1 THEN 1 END) as approved_count FROM enrollment_applications WHERE YEAR(created_at) = YEAR(NOW())"
    },
    {
      name: '系统用户数量',
      sql: "SELECT COUNT(*) as count FROM users WHERE status = 'active'"
    },
    {
      name: '本月新增学生',
      sql: "SELECT COUNT(*) as count FROM students WHERE YEAR(created_at) = YEAR(NOW()) AND MONTH(created_at) = MONTH(NOW())"
    }
  ];
  
  const results = [];
  
  for (const query of testQueries) {
    try {
      const [rows] = await connection.execute(query.sql);
      results.push({
        name: query.name,
        success: true,
        result: rows[0],
        sql: query.sql
      });
    } catch (error) {
      results.push({
        name: query.name,
        success: false,
        error: error.message,
        sql: query.sql
      });
    }
  }
  
  return results;
}

/**
 * 检查AI字典中提到的关键表
 */
async function checkKeyTables(connection) {
  const keyTables = [
    'students', 'teachers', 'classes', 'activities', 
    'enrollment_applications', 'users', 'parents',
    'activity_registrations', 'kindergartens'
  ];
  
  const tableInfo = {};
  
  for (const tableName of keyTables) {
    try {
      // 检查表是否存在
      const [existsRows] = await connection.execute(
        'SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = ?',
        [dbConfig.database, tableName]
      );
      
      const exists = existsRows[0].count > 0;
      
      if (exists) {
        // 获取表信息
        const [tableRows] = await connection.execute(`SELECT COUNT(*) as row_count FROM \`${tableName}\``);
        const columns = await getTableColumns(connection, tableName);
        const sample = await getTableSample(connection, tableName, 2);
        
        tableInfo[tableName] = {
          exists: true,
          rowCount: tableRows[0].row_count,
          columns: columns.map(col => ({
            name: col.column_name,
            type: col.data_type,
            nullable: col.is_nullable === 'YES',
            comment: col.column_comment
          })),
          sampleData: sample
        };
      } else {
        tableInfo[tableName] = {
          exists: false
        };
      }
    } catch (error) {
      tableInfo[tableName] = {
        exists: false,
        error: error.message
      };
    }
  }
  
  return tableInfo;
}

/**
 * 主检查函数
 */
async function performManualCheck() {
  let connection;
  
  try {
    console.log('连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log(`成功连接到数据库: ${dbConfig.database}`);
    
    console.log('\n' + '='.repeat(80));
    console.log('数据库手动检查报告');
    console.log('='.repeat(80));
    
    // 1. 获取所有表
    console.log('\n1. 数据库中的所有表:');
    console.log('-'.repeat(60));
    const allTables = await getAllTables(connection);
    allTables.forEach(table => {
      const tableName = table.table_name || table.TABLE_NAME || '';
      const tableRows = table.table_rows || table.TABLE_ROWS || 0;
      const tableComment = table.table_comment || table.TABLE_COMMENT || '';
      console.log(`${tableName.padEnd(30)} 行数: ${tableRows.toString().padStart(8)} ${tableComment}`);
    });
    
    // 2. 检查关键表
    console.log('\n2. AI字典关键表检查:');
    console.log('-'.repeat(60));
    const keyTableInfo = await checkKeyTables(connection);
    
    for (const [tableName, info] of Object.entries(keyTableInfo)) {
      if (info.exists) {
        console.log(`✓ ${tableName.padEnd(25)} 存在 (${info.rowCount} 行)`);
        if (info.rowCount === 0) {
          console.log(`  ⚠ 警告: 表 ${tableName} 没有数据`);
        }
      } else {
        console.log(`✗ ${tableName.padEnd(25)} 不存在`);
        if (info.error) {
          console.log(`  错误: ${info.error}`);
        }
      }
    }
    
    // 3. 测试关键查询
    console.log('\n3. AI字典关键查询测试:');
    console.log('-'.repeat(60));
    const queryResults = await testKeyQueries(connection);
    
    queryResults.forEach(result => {
      if (result.success) {
        console.log(`✓ ${result.name.padEnd(20)} 成功`);
        console.log(`  结果: ${JSON.stringify(result.result)}`);
      } else {
        console.log(`✗ ${result.name.padEnd(20)} 失败`);
        console.log(`  错误: ${result.error}`);
        console.log(`  SQL: ${result.sql}`);
      }
      console.log('');
    });
    
    // 4. 详细表结构分析
    console.log('\n4. 关键表结构详情:');
    console.log('-'.repeat(60));
    
    const importantTables = ['students', 'teachers', 'classes', 'activities', 'enrollment_applications'];
    
    for (const tableName of importantTables) {
      const info = keyTableInfo[tableName];
      if (info && info.exists) {
        console.log(`\n表: ${tableName} (${info.rowCount} 行)`);
        console.log('字段:');
        info.columns.forEach(col => {
          const colName = col.name || col.column_name || '';
          const colType = col.type || col.data_type || '';
          const nullable = col.nullable ? 'NULL' : 'NOT NULL';
          const comment = col.comment || col.column_comment || '';
          console.log(`  ${colName.padEnd(20)} ${colType.padEnd(15)} ${nullable.padEnd(8)} ${comment}`);
        });
        
        if (info.sampleData && info.sampleData.length > 0) {
          console.log('样本数据:');
          console.log('  ', JSON.stringify(info.sampleData[0], null, 2).split('\n').join('\n  '));
        }
      }
    }
    
    // 5. 生成修复建议
    console.log('\n5. 修复建议:');
    console.log('-'.repeat(60));
    
    const missingTables = Object.entries(keyTableInfo)
      .filter(([name, info]) => !info.exists)
      .map(([name]) => name);
    
    const emptyTables = Object.entries(keyTableInfo)
      .filter(([name, info]) => info.exists && info.rowCount === 0)
      .map(([name]) => name);
    
    if (missingTables.length > 0) {
      console.log('缺失的表:');
      missingTables.forEach(table => {
        console.log(`  - ${table}: 需要创建表或检查表名映射`);
      });
    }
    
    if (emptyTables.length > 0) {
      console.log('空表 (需要添加测试数据):');
      emptyTables.forEach(table => {
        console.log(`  - ${table}: 表存在但没有数据`);
      });
    }
    
    const failedQueries = queryResults.filter(r => !r.success);
    if (failedQueries.length > 0) {
      console.log('失败的查询:');
      failedQueries.forEach(query => {
        console.log(`  - ${query.name}: ${query.error}`);
      });
    }
    
    console.log('\n检查完成!');
    
  } catch (error) {
    console.error('检查过程中出错:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 运行检查
if (require.main === module) {
  performManualCheck().catch(console.error);
}

module.exports = { performManualCheck };
