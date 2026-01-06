/**
 * 数据库连接和模型初始化调试脚本
 * 
 * 此脚本用于详细记录数据库连接和模型初始化过程，帮助诊断问题
 */

import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// 设置日志文件
const logFile = path.join(__dirname, '../db-debug.log');
fs.writeFileSync(logFile, `=== 数据库调试开始 ${new Date().toISOString()} ===\n`);

// 日志函数
function log(message: string): void {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  // 输出到控制台
  console.log(message);
  
  // 写入日志文件
  fs.appendFileSync(logFile, logMessage);
}

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../.env') });
log('环境变量加载完成');

// 打印环境变量信息
log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
log(`DB_HOST: ${process.env.DB_HOST || 'dbconn.sealoshzh.site'}`);
log(`DB_PORT: ${process.env.DB_PORT || '43906'}`);
log(`DB_NAME: ${process.env.DB_NAME || 'kargerdensales'}`);
log(`DB_USER: ${process.env.DB_USER || 'root'}`);
log(`DB_PASSWORD: ${process.env.DB_PASSWORD ? '已设置' : '未设置'}`);

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
  port: parseInt(process.env.DB_PORT || '43906'),
  database: process.env.DB_NAME || 'kargerdensales',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'pwk5ls7j',
  dialect: 'mysql' as const,
  timezone: '+08:00',
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    timestamps: true,
    underscored: true,
    freezeTableName: true, // 避免自动复数化
  },
  logging: (msg: string) => log(`SQL: ${msg}`)
};

log('数据库配置准备完成');

// 创建Sequelize实例
log('正在创建Sequelize实例...');
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    timezone: dbConfig.timezone,
    define: dbConfig.define,
    logging: (msg: string) => log(`SQL: ${msg}`)
  }
);
log('Sequelize实例创建完成');

// 测试数据库连接
async function testConnection(): Promise<void> {
  try {
    log('正在测试数据库连接...');
    await sequelize.authenticate();
    log('数据库连接测试成功!');
    
    // 获取数据库中的表信息
    log('正在获取数据库表信息...');
    const [tables] = await sequelize.query(`SHOW TABLES`);
    log(`数据库中的表: ${JSON.stringify(tables)}`);
    
    // 获取每个表的结构
    for (const tableObj of tables as Array<any>) {
      const tableName = Object.values(tableObj)[0];
      log(`正在获取表 ${tableName} 的结构...`);
      
      try {
        const [columns] = await sequelize.query(`DESCRIBE \`${tableName}\``);
        log(`表 ${tableName} 的列信息: ${JSON.stringify(columns)}`);
      } catch (error) {
        log(`获取表 ${tableName} 结构失败: ${error}`);
      }
    }
    
    // 检查是否可以执行简单查询
    log('执行简单测试查询...');
    const [result] = await sequelize.query('SELECT 1+1 as result');
    log(`简单查询结果: ${JSON.stringify(result)}`);
    
    log('数据库诊断完成，一切正常');
  } catch (error) {
    log(`数据库连接测试失败: ${error}`);
    if (error instanceof Error) {
      log(`错误栈: ${error.stack}`);
    }
  } finally {
    try {
      await sequelize.close();
      log('数据库连接已关闭');
    } catch (closeError) {
      log(`关闭数据库连接时出错: ${closeError}`);
    }
  }
}

// 执行测试
log('开始执行数据库诊断...');
testConnection()
  .then(() => {
    log('调试脚本执行完成');
    log(`详细日志已写入 ${logFile}`);
    process.exit(0);
  })
  .catch((error) => {
    log(`调试脚本执行失败: ${error}`);
    process.exit(1);
  }); 