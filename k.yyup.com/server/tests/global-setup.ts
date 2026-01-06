/**
 * Jest 全局设置
 * 在所有测试开始前执行的设置
 */

import { config } from 'dotenv';
import { Sequelize } from 'sequelize';
import { execSync } from 'child_process';

// 加载测试环境变量
config({ path: '.env.test' });

export default async function globalSetup() {
  console.log('🚀 开始全局测试设置...');

  // 设置测试环境变量
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_for_testing';
  process.env.DB_HOST = process.env.DB_HOST || 'localhost';
  process.env.DB_PORT = process.env.DB_PORT || '3306';
  process.env.DB_NAME = process.env.DB_NAME || 'test_database';
  process.env.DB_USER = process.env.DB_USER || 'test_user';
  process.env.DB_PASS = process.env.DB_PASS || 'test_password';

  try {
    // 尝试创建测试数据库连接（可选）
    if (process.env.ENABLE_DB_TESTS === 'true') {
      const testDb = new Sequelize({
        dialect: 'mysql',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306'),
        database: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        logging: false,
        define: {
          timestamps: true,
          underscored: true
        }
      });

      try {
        // 测试数据库连接
        await testDb.authenticate();
        console.log('✅ 测试数据库连接成功');

        // 运行数据库迁移
        try {
          execSync('npm run db:migrate:test', { stdio: 'inherit' });
          console.log('✅ 数据库迁移完成');
        } catch (error) {
          console.warn('⚠️ 数据库迁移失败，可能是首次运行:', error);
        }

        // 运行数据库种子
        try {
          execSync('npm run db:seed:test', { stdio: 'inherit' });
          console.log('✅ 测试数据种子完成');
        } catch (error) {
          console.warn('⚠️ 测试数据种子失败:', error);
        }

        await testDb.close();
      } catch (dbError) {
        console.warn('⚠️ 数据库连接失败，跳过数据库相关测试:', (dbError as Error).message || dbError);
        await testDb.close().catch(() => {});
      }
    } else {
      console.log('ℹ️ 数据库测试已禁用，跳过数据库设置');
    }

    // 启动测试服务器（如果需要）
    if (process.env.START_TEST_SERVER === 'true') {
      console.log('🚀 启动测试服务器...');
      // 这里可以启动测试服务器
    }

    console.log('✅ 全局测试设置完成');

  } catch (error) {
    console.error('❌ 全局测试设置失败:', error);
    throw error;
  }
}
