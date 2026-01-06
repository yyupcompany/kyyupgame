#!/usr/bin/env node

const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  database: 'kargerdensales',
  user: 'root',
  password: 'pwk5ls7j',
  charset: 'utf8mb4'
};

async function checkTableFields() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    const tables = ['teachers', 'kindergartens', 'parents', 'parent_student_relations', 'parent_followups'];
    
    for (const table of tables) {
      console.log(`\n=== ${table} 表结构 ===`);
      const [columns] = await connection.execute(`DESCRIBE ${table}`);
      columns.forEach(col => {
        console.log(`${col.Field.padEnd(25)} ${col.Type.padEnd(20)} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
      
      // 查看样本数据
      console.log(`\n${table} 样本数据:`);
      const [rows] = await connection.execute(`SELECT * FROM ${table} LIMIT 2`);
      if (rows.length > 0) {
        console.log('字段:', Object.keys(rows[0]).join(', '));
      }
    }
    
  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkTableFields();
