#!/usr/bin/env node
/**
 * 简单的MySQL命令行客户端
 * 使用方法: node mysql-cli.js "SQL命令"
 */

import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// 数据库配置 - 从环境变量或命令行参数读取
const config = {
  host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
  port: parseInt(process.env.DB_PORT || '43906'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'pwk5ls7j',
  database: process.env.DB_NAME || 'kargerdensales'
};

// 支持命令行参数覆盖配置
const args = process.argv.slice(2);
let sql = '';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '-h' || args[i] === '--host') {
    config.host = args[i + 1];
    i++;
  } else if (args[i] === '-P' || args[i] === '--port') {
    config.port = parseInt(args[i + 1]);
    i++;
  } else if (args[i] === '-u' || args[i] === '--user') {
    config.user = args[i + 1];
    i++;
  } else if (args[i] === '-p' || args[i] === '--password') {
    config.password = args[i + 1];
    i++;
  } else if (args[i] === '-D' || args[i] === '--database') {
    config.database = args[i + 1];
    i++;
  } else if (!sql) {
    sql = args[i];
  }
}

async function executeSQL(sql) {
  let connection;
  try {
    console.log('🔗 连接数据库...');
    connection = await mysql.createConnection(config);
    
    console.log(`🔧 执行SQL: ${sql}`);
    const [rows, fields] = await connection.execute(sql);
    
    // 如果是查询结果
    if (Array.isArray(rows)) {
      if (rows.length === 0) {
        console.log('📭 查询结果为空');
      } else {
        console.log(`📊 查询结果 (${rows.length} 行):`);
        console.table(rows);
      }
    } else {
      // 如果是INSERT、UPDATE、DELETE等操作
      console.log('✅ 操作成功');
      if (rows.affectedRows) {
        console.log(`📊 影响行数: ${rows.affectedRows}`);
      }
      if (rows.insertId) {
        console.log(`🆔 插入ID: ${rows.insertId}`);
      }
    }
    
  } catch (error) {
    console.error('❌ SQL执行失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔚 数据库连接已关闭');
    }
  }
}

if (!sql) {
  console.log('🔧 MySQL客户端使用方法:');
  console.log('  node mysql-cli.js "SQL命令"');
  console.log('');
  console.log('📋 参数选项:');
  console.log('  -h, --host      数据库主机 (默认: dbconn.sealoshzh.site)');
  console.log('  -P, --port      端口 (默认: 43906)');
  console.log('  -u, --user      用户名 (默认: root)');
  console.log('  -p, --password  密码');
  console.log('  -D, --database  数据库名 (默认: kargerdensales)');
  console.log('');
  console.log('🌍 环境变量:');
  console.log('  DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME');
  console.log('');
  console.log('💡 使用示例:');
  console.log('  node mysql-cli.js "SHOW TABLES"');
  console.log('  node mysql-cli.js "DESCRIBE ai_memories"');
  console.log('  node mysql-cli.js -h localhost -u myuser -p mypass "SELECT 1"');
  console.log('');
  console.log('🔒 当前配置:');
  console.log(`  主机: ${config.host}:${config.port}`);
  console.log(`  用户: ${config.user}`);
  console.log(`  密码: ${config.password ? '***已设置***' : '未设置'}`);
  console.log(`  数据库: ${config.database}`);
  process.exit(1);
}

executeSQL(sql);