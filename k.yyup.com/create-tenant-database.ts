#!/usr/bin/env ts-node

/**
 * 创建租户数据库脚本
 * 手动创建租户数据库并复制结构
 */

import mysql from 'mysql2/promise';
import { config } from 'dotenv';
// import { logger } from './server/src/utils/logger';

// 加载环境变量
config();

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  charset: 'utf8mb4'
};

/**
 * 创建租户数据库
 */
async function createTenantDatabase(tenantCode: string): Promise<void> {
  const databaseName = `tenant_${tenantCode}`;

  console.log(`🚀 开始创建租户数据库: ${databaseName}`);

  const connection = await mysql.createConnection(dbConfig);

  try {
    // 1. 创建数据库
    console.log(`📝 创建数据库: ${databaseName}`);
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ 数据库创建成功: ${databaseName}`);

    // 2. 复制数据库结构（从kargerdensales模板）
    console.log(`📋 复制数据库结构...`);

    // 获取模板数据库的所有表
    const [tables] = await connection.execute(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'kargerdensales' AND TABLE_TYPE = 'BASE TABLE'`
    );

    console.log(`📊 找到 ${(tables as any[]).length} 个表需要复制`);

    // 为每个表创建结构
    for (const table of tables as any[]) {
      const tableName = table.TABLE_NAME;
      console.log(`  📝 创建表: ${tableName}`);

      // 获取创建表的SQL
      const [createTableResult] = await connection.execute(
        `SHOW CREATE TABLE kargerdensales.\`${tableName}\``
      );

      const createSQL = (createTableResult as any)[0]['Create Table'];
      // 修改数据库名为租户数据库
      const tenantCreateSQL = createSQL.replace(/`kargerdensales`\./g, `\`${databaseName}\`.`);

      try {
        await connection.execute(tenantCreateSQL);
        console.log(`    ✅ 表创建成功: ${tableName}`);
      } catch (error) {
        console.error(`    ❌ 表创建失败: ${tableName} - ${error}`);
      }
    }

    console.log(`✅ 租户数据库创建完成: ${databaseName}`);

  } catch (error) {
    console.error(`❌ 创建租户数据库失败: ${databaseName}`, error);
    throw error;
  } finally {
    await connection.end();
  }
}

/**
 * 验证数据库创建
 */
async function verifyTenantDatabase(tenantCode: string): Promise<boolean> {
  const databaseName = `tenant_${tenantCode}`;

  console.log(`🔍 验证数据库: ${databaseName}`);

  const connection = await mysql.createConnection(dbConfig);

  try {
    // 检查数据库是否存在
    const [databases] = await connection.execute(
      'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?',
      [databaseName]
    );

    if ((databases as any[]).length === 0) {
      console.log(`❌ 数据库不存在: ${databaseName}`);
      return false;
    }

    // 检查表数量
    const [tables] = await connection.execute(
      'SELECT COUNT(*) as table_count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = "BASE TABLE"',
      [databaseName]
    );

    const tableCount = (tables as any)[0]?.table_count || 0;
    console.log(`✅ 数据库验证成功: ${databaseName} (${tableCount} 个表)`);

    return true;

  } catch (error) {
    console.error(`❌ 数据库验证失败: ${databaseName}`, error);
    return false;
  } finally {
    await connection.end();
  }
}

// 主函数
async function main() {
  const tenantCode = process.argv[2];

  if (!tenantCode) {
    console.error('❌ 请提供租户代码');
    console.log('使用方法: ts-node create-tenant-database.ts <tenant_code>');
    console.log('示例: ts-node create-tenant-database.ts k001');
    process.exit(1);
  }

  try {
    console.log(`🏗️ 开始创建租户: ${tenantCode}`);

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
      console.error(`\n❌ 租户 ${tenantCode} 创建失败！`);
      process.exit(1);
    }

  } catch (error) {
    console.error(`❌ 脚本执行失败:`, error);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    console.error(`❌ 脚本执行失败:`, error);
    process.exit(1);
  });
}