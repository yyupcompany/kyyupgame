#!/usr/bin/env node

/**
 * 数据库连接测试脚本
 * 用于验证远端数据库连接是否正常
 */

import mysql from 'mysql2/promise';

// 数据库配置
const dbConfig = {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  user: 'root',
  password: 'pwk5ls7j',
  database: 'kargerdensales',
  timezone: '+08:00'
};

async function testConnection() {
  let connection;

  try {
    console.log('🔌 正在连接到远端MySQL数据库...');
    console.log(`📍 主机: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`🗄️ 数据库: ${dbConfig.database}`);

    connection = await mysql.createConnection(dbConfig);

    console.log('✅ 数据库连接成功！');

    // 测试基本查询
    const [rows] = await connection.execute('SELECT NOW()');
    console.log(`🕐 当前时间: ${rows[0][Object.keys(rows[0])[0]]}`);

    // 检查主要表是否存在
    const [tables] = await connection.execute('SHOW TABLES LIKE "users"');
    console.log(`📋 用户表存在: ${tables.length > 0 ? '是' : '否'}`);

    if (tables.length > 0) {
      const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
      console.log(`👥 用户总数: ${userCount[0].count}`);
    }

    return { success: true, message: '数据库连接测试成功' };

  } catch (error) {
    console.error('❌ 数据库连接失败:');
    console.error(`错误代码: ${error.code}`);
    console.error(`错误信息: ${error.message}`);

    return {
      success: false,
      error: error.message,
      code: error.code,
      message: '数据库连接测试失败'
    };

  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  testConnection()
    .then(result => {
      console.log('\n📊 测试结果:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('\n💥 测试过程中发生异常:', error);
      process.exit(1);
    });
}

export { testConnection, dbConfig };