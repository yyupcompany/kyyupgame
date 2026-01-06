#!/usr/bin/env node

/**
 * 检查所有关键表结构的脚本
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

async function checkTableStructure(connection, tableName) {
  console.log(`\n=== ${tableName}表结构 ===`);
  
  try {
    const [columns] = await connection.execute(`
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
    
    if (columns.length === 0) {
      console.log(`表 ${tableName} 不存在`);
      return;
    }
    
    columns.forEach(col => {
      const colName = col.column_name || col.COLUMN_NAME || '';
      const dataType = col.data_type || col.DATA_TYPE || '';
      const nullable = (col.is_nullable || col.IS_NULLABLE) === 'YES' ? 'NULL' : 'NOT NULL';
      const comment = col.column_comment || col.COLUMN_COMMENT || '';
      console.log(`${colName.padEnd(25)} ${dataType.padEnd(15)} ${nullable.padEnd(8)} ${comment}`);
    });
    
    // 查看样本数据
    const [rows] = await connection.execute(`SELECT * FROM \`${tableName}\` LIMIT 1`);
    if (rows.length > 0) {
      console.log('\n样本数据字段:', Object.keys(rows[0]).join(', '));
    }
    
  } catch (error) {
    console.error(`检查表 ${tableName} 时出错:`, error.message);
  }
}

async function checkAllKeyTables() {
  let connection;
  
  try {
    console.log('连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('数据库连接成功');
    
    const keyTables = ['students', 'teachers', 'classes', 'activities', 'enrollment_applications', 'users'];
    
    for (const tableName of keyTables) {
      await checkTableStructure(connection, tableName);
    }
    
    // 检查AI字典中可能有问题的字段映射
    console.log('\n=== 字段映射检查 ===');
    
    // 检查students表的status字段值
    console.log('\n--- Students表status字段值 ---');
    try {
      const [statusRows] = await connection.execute('SELECT DISTINCT status FROM students LIMIT 10');
      console.log('status字段的值:', statusRows.map(row => row.status));
    } catch (error) {
      console.error('检查students status字段时出错:', error.message);
    }
    
    // 检查teachers表的status字段值
    console.log('\n--- Teachers表status字段值 ---');
    try {
      const [teacherStatusRows] = await connection.execute('SELECT DISTINCT status FROM teachers LIMIT 10');
      console.log('status字段的值:', teacherStatusRows.map(row => row.status));
    } catch (error) {
      console.error('检查teachers status字段时出错:', error.message);
    }
    
    // 检查classes表的status字段值
    console.log('\n--- Classes表status字段值 ---');
    try {
      const [classStatusRows] = await connection.execute('SELECT DISTINCT status FROM classes LIMIT 10');
      console.log('status字段的值:', classStatusRows.map(row => row.status));
    } catch (error) {
      console.error('检查classes status字段时出错:', error.message);
    }
    
    // 检查activities表的status字段值
    console.log('\n--- Activities表status字段值 ---');
    try {
      const [activityStatusRows] = await connection.execute('SELECT DISTINCT status FROM activities LIMIT 10');
      console.log('status字段的值:', activityStatusRows.map(row => row.status));
    } catch (error) {
      console.error('检查activities status字段时出错:', error.message);
    }
    
    // 检查enrollment_applications表的status字段值
    console.log('\n--- Enrollment_applications表status字段值 ---');
    try {
      const [enrollmentStatusRows] = await connection.execute('SELECT DISTINCT status FROM enrollment_applications LIMIT 10');
      console.log('status字段的值:', enrollmentStatusRows.map(row => row.status));
    } catch (error) {
      console.error('检查enrollment_applications status字段时出错:', error.message);
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
  checkAllKeyTables().catch(console.error);
}

module.exports = { checkAllKeyTables };
