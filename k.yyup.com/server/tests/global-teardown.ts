/**
 * Jest 全局清理
 * 在所有测试结束后执行的清理
 */

import { Sequelize } from 'sequelize';
import { execSync } from 'child_process';

export default async function globalTeardown() {
  console.log('🧹 开始全局测试清理...');

  try {
    // 清理测试数据库
    if (process.env.CLEAN_TEST_DB === 'true') {
      const testDb = new Sequelize({
        dialect: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        database: process.env.DB_NAME || 'test_database',
        username: process.env.DB_USER || 'test_user',
        password: process.env.DB_PASS || 'test_password',
        logging: false
      });

      try {
        await testDb.authenticate();
        
        // 获取所有表
        const queryInterface = testDb.getQueryInterface();
        const tables = await queryInterface.showAllTables();
        
        // 清空所有表
        for (const table of tables) {
          try {
            await queryInterface.bulkDelete(table, {});
            console.log(`✅ 清理表: ${table}`);
          } catch (error) {
            console.warn(`⚠️ 清理表失败 ${table}:`, error);
          }
        }

        await testDb.close();
        console.log('✅ 测试数据库清理完成');
      } catch (error) {
        console.warn('⚠️ 测试数据库清理失败:', error);
      }
    }

    // 停止测试服务器（如果启动了）
    if (process.env.STOP_TEST_SERVER === 'true') {
      console.log('🛑 停止测试服务器...');
      // 这里可以停止测试服务器
    }

    // 清理临时文件
    try {
      execSync('rm -rf ./temp-test-files', { stdio: 'inherit' });
      console.log('✅ 临时文件清理完成');
    } catch (error) {
      console.warn('⚠️ 临时文件清理失败:', error);
    }

    // 清理测试缓存
    try {
      execSync('rm -rf ./.jest-cache', { stdio: 'inherit' });
      console.log('✅ 测试缓存清理完成');
    } catch (error) {
      console.warn('⚠️ 测试缓存清理失败:', error);
    }

    console.log('✅ 全局测试清理完成');

  } catch (error) {
    console.error('❌ 全局测试清理失败:', error);
    // 不抛出错误，避免影响测试结果
  }
}
