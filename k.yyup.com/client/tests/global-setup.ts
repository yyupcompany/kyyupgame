/**
 * Vitest 全局设置
 * 在所有测试开始前执行的设置
 */

import { execSync } from 'child_process';

export default async function globalSetup() {
  console.log('🚀 开始前端全局测试设置...');

  try {
    // 设置测试环境变量
    process.env.NODE_ENV = 'test';
    process.env.VITE_API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000';
    process.env.VITE_APP_TITLE = 'Test App';

    // 清理之前的测试结果
    try {
      execSync('rm -rf ./test-results', { stdio: 'inherit' });
      execSync('rm -rf ./coverage', { stdio: 'inherit' });
      console.log('✅ 清理之前的测试结果');
    } catch (error) {
      console.warn('⚠️ 清理测试结果失败:', error);
    }

    // 创建测试结果目录
    try {
      execSync('mkdir -p ./test-results', { stdio: 'inherit' });
      execSync('mkdir -p ./coverage', { stdio: 'inherit' });
      console.log('✅ 创建测试结果目录');
    } catch (error) {
      console.warn('⚠️ 创建测试结果目录失败:', error);
    }

    // 启动开发服务器（如果需要集成测试）
    if (process.env.START_DEV_SERVER === 'true') {
      console.log('🚀 启动开发服务器用于集成测试...');
      // 这里可以启动开发服务器
      // 注意：通常在CI环境中，服务器会在另一个进程中启动
    }

    // 等待服务器启动
    if (process.env.WAIT_FOR_SERVER === 'true') {
      console.log('⏳ 等待服务器启动...');
      await waitForServer('http://localhost:5173', 30000);
      console.log('✅ 服务器已启动');
    }

    console.log('✅ 前端全局测试设置完成');

  } catch (error) {
    console.error('❌ 前端全局测试设置失败:', error);
    throw error;
  }
}

/**
 * 等待服务器启动
 */
async function waitForServer(url: string, timeout: number): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch (error) {
      // 服务器还未启动，继续等待
    }
    
    // 等待1秒后重试
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error(`服务器在 ${timeout}ms 内未启动: ${url}`);
}
