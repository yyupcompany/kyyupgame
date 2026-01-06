/**
 * Vitest 全局清理
 * 在所有测试结束后执行的清理
 */

import { execSync } from 'child_process';

export default async function globalTeardown() {
  console.log('🧹 开始前端全局测试清理...');

  try {
    // 停止开发服务器（如果启动了）
    if (process.env.STOP_DEV_SERVER === 'true') {
      console.log('🛑 停止开发服务器...');
      try {
        // 查找并终止开发服务器进程
        execSync('pkill -f "vite.*5173" || true', { stdio: 'inherit' });
        console.log('✅ 开发服务器已停止');
      } catch (error) {
        console.warn('⚠️ 停止开发服务器失败:', error);
      }
    }

    // 清理临时文件
    try {
      execSync('rm -rf ./temp-test-files', { stdio: 'inherit' });
      execSync('rm -rf ./.vitest-cache', { stdio: 'inherit' });
      console.log('✅ 临时文件清理完成');
    } catch (error) {
      console.warn('⚠️ 临时文件清理失败:', error);
    }

    // 清理浏览器缓存和数据
    try {
      execSync('rm -rf ./test-results/playwright-output', { stdio: 'inherit' });
      console.log('✅ 浏览器测试数据清理完成');
    } catch (error) {
      console.warn('⚠️ 浏览器测试数据清理失败:', error);
    }

    // 生成测试报告摘要
    try {
      await generateTestSummary();
      console.log('✅ 测试报告摘要生成完成');
    } catch (error) {
      console.warn('⚠️ 测试报告摘要生成失败:', error);
    }

    console.log('✅ 前端全局测试清理完成');

  } catch (error) {
    console.error('❌ 前端全局测试清理失败:', error);
    // 不抛出错误，避免影响测试结果
  }
}

/**
 * 生成测试报告摘要
 */
async function generateTestSummary(): Promise<void> {
  const fs = require('fs').promises;
  const path = require('path');

  try {
    const testResultsDir = './test-results';
    const summaryFile = path.join(testResultsDir, 'test-summary.json');

    // 收集测试结果
    const summary = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      results: {
        unit: await getTestResults('./test-results/vitest-results.json'),
        e2e: await getTestResults('./test-results/playwright-results.json'),
        coverage: await getCoverageResults('./coverage/coverage-summary.json')
      }
    };

    // 写入摘要文件
    await fs.writeFile(summaryFile, JSON.stringify(summary, null, 2));
    console.log(`📊 测试摘要已保存到: ${summaryFile}`);

  } catch (error) {
    console.warn('生成测试摘要时出错:', error);
  }
}

/**
 * 获取测试结果
 */
async function getTestResults(filePath: string): Promise<any> {
  const fs = require('fs').promises;
  
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { error: `无法读取测试结果: ${filePath}` };
  }
}

/**
 * 获取覆盖率结果
 */
async function getCoverageResults(filePath: string): Promise<any> {
  const fs = require('fs').promises;
  
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { error: `无法读取覆盖率结果: ${filePath}` };
  }
}
