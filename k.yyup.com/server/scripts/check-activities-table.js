#!/usr/bin/env node

/**
 * 检查activities表结构的脚本
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

async function checkActivitiesTable() {
  let connection;
  
  try {
    console.log('连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('数据库连接成功');
    
    // 查看activities表结构
    console.log('\n=== Activities表结构 ===');
    const [columns] = await connection.execute(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        column_comment
      FROM information_schema.columns 
      WHERE table_schema = ? AND table_name = 'activities'
      ORDER BY ordinal_position
    `, [dbConfig.database]);
    
    columns.forEach(col => {
      const colName = col.column_name || col.COLUMN_NAME || '';
      const dataType = col.data_type || col.DATA_TYPE || '';
      const nullable = (col.is_nullable || col.IS_NULLABLE) === 'YES' ? 'NULL' : 'NOT NULL';
      const comment = col.column_comment || col.COLUMN_COMMENT || '';
      console.log(`${colName.padEnd(25)} ${dataType.padEnd(15)} ${nullable.padEnd(8)} ${comment}`);
    });
    
    // 查看activities表的样本数据
    console.log('\n=== Activities表样本数据 ===');
    const [rows] = await connection.execute('SELECT * FROM activities LIMIT 3');
    
    if (rows.length > 0) {
      console.log('字段名:', Object.keys(rows[0]).join(', '));
      rows.forEach((row, index) => {
        console.log(`\n样本 ${index + 1}:`);
        for (const [key, value] of Object.entries(row)) {
          console.log(`  ${key}: ${value}`);
        }
      });
    } else {
      console.log('表中没有数据');
    }
    
    // 检查是否有type字段的替代字段
    console.log('\n=== 可能的type字段替代 ===');
    const typeFields = columns.filter(col => {
      const colName = (col.column_name || col.COLUMN_NAME || '').toLowerCase();
      return colName.includes('type') ||
             colName.includes('category') ||
             colName.includes('kind');
    });
    
    if (typeFields.length > 0) {
      console.log('找到可能的type字段替代:');
      typeFields.forEach(field => {
        const colName = field.column_name || field.COLUMN_NAME || '';
        const dataType = field.data_type || field.DATA_TYPE || '';
        console.log(`  - ${colName} (${dataType})`);
      });
    } else {
      console.log('没有找到type相关字段');
    }
    
    // 检查participant_count字段
    console.log('\n=== 参与人数相关字段 ===');
    const participantFields = columns.filter(col => {
      const colName = (col.column_name || col.COLUMN_NAME || '').toLowerCase();
      return colName.includes('participant') ||
             colName.includes('count') ||
             colName.includes('registered') ||
             colName.includes('capacity');
    });
    
    if (participantFields.length > 0) {
      console.log('找到参与人数相关字段:');
      participantFields.forEach(field => {
        const colName = field.column_name || field.COLUMN_NAME || '';
        const dataType = field.data_type || field.DATA_TYPE || '';
        console.log(`  - ${colName} (${dataType})`);
      });
    } else {
      console.log('没有找到参与人数相关字段');
    }
    
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
  checkActivitiesTable().catch(console.error);
}

module.exports = { checkActivitiesTable };
