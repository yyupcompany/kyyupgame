#!/usr/bin/env node

/**
 * 创建租户数据库脚本 (CommonJS版本)
 * 手动创建租户数据库并复制结构
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  charset: 'utf8mb4'
};

// 颜色输出
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logInfo(message) {
  colorLog('blue', `[INFO] ${message}`);
}

function logSuccess(message) {
  colorLog('green', `[SUCCESS] ${message}`);
}

function logError(message) {
  colorLog('red', `[ERROR] ${message}`);
}

function logWarning(message) {
  colorLog('yellow', `[WARNING] ${message}`);
}

/**
 * 创建租户数据库
 */
async function createTenantDatabase(tenantCode) {
  const databaseName = `tenant_${tenantCode}`;

  logInfo(`🚀 开始创建租户数据库: ${databaseName}`);

  const connection = await mysql.createConnection(dbConfig);

  try {
    // 1. 创建数据库
    logInfo(`📝 创建数据库: ${databaseName}`);
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    logSuccess(`✅ 数据库创建成功: ${databaseName}`);

    // 2. 复制数据库结构（从kargerdensales模板）
    logInfo(`📋 复制数据库结构...`);

    // 获取模板数据库的所有表
    const [tables] = await connection.execute(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'kargerdensales' AND TABLE_TYPE = 'BASE TABLE'`
    );

    logInfo(`📊 找到 ${tables.length} 个表需要复制`);

    let successCount = 0;
    let failCount = 0;

    // 为每个表创建结构
    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      logInfo(`  📝 创建表: ${tableName}`);

      try {
        // 获取创建表的SQL
        const [createTableResult] = await connection.execute(
          `SHOW CREATE TABLE kargerdensales.\`${tableName}\``
        );

        const createSQL = createTableResult[0]['Create Table'];
        // 修改数据库名为租户数据库
        const tenantCreateSQL = createSQL.replace(/`kargerdensales`\./g, `\`${databaseName}\`.`);

        await connection.execute(tenantCreateSQL);
        logSuccess(`    ✅ 表创建成功: ${tableName}`);
        successCount++;
      } catch (error) {
        logError(`    ❌ 表创建失败: ${tableName} - ${error.message}`);
        failCount++;
      }
    }

    logSuccess(`✅ 租户数据库创建完成: ${databaseName} (${successCount} 成功, ${failCount} 失败)`);

  } catch (error) {
    logError(`❌ 创建租户数据库失败: ${databaseName}`, error);
    throw error;
  } finally {
    await connection.end();
  }
}

/**
 * 验证数据库创建
 */
async function verifyTenantDatabase(tenantCode) {
  const databaseName = `tenant_${tenantCode}`;

  logInfo(`🔍 验证数据库: ${databaseName}`);

  const connection = await mysql.createConnection(dbConfig);

  try {
    // 检查数据库是否存在
    const [databases] = await connection.execute(
      'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?',
      [databaseName]
    );

    if (databases.length === 0) {
      logWarning(`❌ 数据库不存在: ${databaseName}`);
      return false;
    }

    // 检查表数量
    const [tables] = await connection.execute(
      'SELECT COUNT(*) as table_count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = "BASE TABLE"',
      [databaseName]
    );

    const tableCount = tables[0]?.table_count || 0;
    logSuccess(`✅ 数据库验证成功: ${databaseName} (${tableCount} 个表)`);

    return true;

  } catch (error) {
    logError(`❌ 数据库验证失败: ${databaseName}`, error);
    return false;
  } finally {
    await connection.end();
  }
}

// 主函数
async function main() {
  const tenantCode = process.argv[2];

  if (!tenantCode) {
    logError('❌ 请提供租户代码');
    console.log('使用方法: node create-tenant-database.cjs <tenant_code>');
    console.log('示例: node create-tenant-database.cjs k001');
    process.exit(1);
  }

  try {
    logInfo(`🏗️ 开始创建租户: ${tenantCode}`);

    // 1. 创建租户数据库
    await createTenantDatabase(tenantCode);

    // 2. 验证数据库
    const success = await verifyTenantDatabase(tenantCode);

    if (success) {
      console.log(`\n🎉 租户 ${tenantCode} 创建成功！`);
      console.log(`📊 数据库名称: tenant_${tenantCode}`);
      console.log(`🌐 域名访问: k${tenantCode}.yyup.cc`);
      console.log(`\n下一步: 启动k.yyup.com服务并测试域名访问`);
    } else {
      logError(`\n❌ 租户 ${tenantCode} 创建失败！`);
      process.exit(1);
    }

  } catch (error) {
    logError(`❌ 脚本执行失败:`, error);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    logError(`❌ 脚本执行失败:`, error);
    process.exit(1);
  });
}