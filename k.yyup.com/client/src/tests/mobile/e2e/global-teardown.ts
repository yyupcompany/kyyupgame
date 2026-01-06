/**
 * E2E测试全局清理
 * 在所有测试运行后执行的清理操作
 */

import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 开始E2E测试全局清理...');
  
  try {
    // 清理测试结果目录中的临时文件
    const tempDirs = [
      'test-results',
      'playwright-report',
      '.playwright'
    ];

    for (const dir of tempDirs) {
      const fullPath = path.resolve(process.cwd(), dir);
      if (fs.existsSync(fullPath)) {
        console.log(`📁 清理目录: ${fullPath}`);
        
        // 清理超过7天的临时文件
        const files = fs.readdirSync(fullPath);
        const now = Date.now();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;

        for (const file of files) {
          const filePath = path.join(fullPath, file);
          const stats = fs.statSync(filePath);
          
          if (now - stats.mtime.getTime() > sevenDays) {
            if (stats.isDirectory()) {
              fs.rmSync(filePath, { recursive: true, force: true });
              console.log(`🗑️  删除旧目录: ${filePath}`);
            } else {
              fs.unlinkSync(filePath);
              console.log(`🗑️  删除旧文件: ${filePath}`);
            }
          }
        }
      }
    }

    // 清理浏览器缓存
    const cacheDirs = [
      path.resolve(process.cwd(), '.cache'),
      path.resolve(process.cwd(), 'node_modules/.cache')
    ];

    for (const dir of cacheDirs) {
      if (fs.existsSync(dir)) {
        console.log(`🗑️  清理缓存目录: ${dir}`);
        try {
          fs.rmSync(dir, { recursive: true, force: true });
        } catch (error) {
          console.warn(`⚠️  无法清理缓存目录 ${dir}:`, error);
        }
      }
    }

    console.log('✅ E2E测试全局清理完成');
    
    // 生成测试摘要报告
    await generateTestSummary();
    
  } catch (error) {
    console.error('❌ E2E测试全局清理失败:', error);
    throw error;
  }
}

/**
 * 生成测试摘要报告
 */
async function generateTestSummary() {
  const summaryPath = path.resolve(process.cwd(), 'test-results', 'test-summary.json');
  
  try {
    const summary = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      config: {
        headless: true,
        baseUrl: process.env.BASE_URL || 'http://localhost:5173',
      },
      results: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
      }
    };

    // 尝试读取详细的测试结果
    const resultsPath = path.resolve(process.cwd(), 'test-results.json');
    if (fs.existsSync(resultsPath)) {
      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
      summary.results = {
        total: results.suites?.reduce((sum: number, suite: any) => 
          sum + suite.specs?.reduce((specSum: number, spec: any) => 
            specSum + spec.tests?.length || 0, 0), 0) || 0,
        passed: results.suites?.reduce((sum: number, suite: any) => 
          sum + suite.specs?.reduce((specSum: number, spec: any) => 
            specSum + (spec.tests?.filter((test: any) => test.results?.[0]?.status === 'passed')?.length || 0), 0), 0) || 0,
        failed: results.suites?.reduce((sum: number, suite: any) => 
          sum + suite.specs?.reduce((specSum: number, spec: any) => 
            specSum + (spec.tests?.filter((test: any) => test.results?.[0]?.status === 'failed')?.length || 0), 0), 0) || 0,
        skipped: results.suites?.reduce((sum: number, suite: any) => 
          sum + suite.specs?.reduce((specSum: number, spec: any) => 
            specSum + (spec.tests?.filter((test: any) => test.results?.[0]?.status === 'skipped')?.length || 0), 0), 0) || 0,
      };
    }

    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`📊 测试摘要已生成: ${summaryPath}`);
    
    // 输出简要统计
    console.log('\n📋 测试执行摘要:');
    console.log(`   总计: ${summary.results.total}`);
    console.log(`   通过: ${summary.results.passed}`);
    console.log(`   失败: ${summary.results.failed}`);
    console.log(`   跳过: ${summary.results.skipped}`);
    
    const passRate = summary.results.total > 0 
      ? ((summary.results.passed / summary.results.total) * 100).toFixed(1)
      : '0.0';
    console.log(`   通过率: ${passRate}%`);
    
  } catch (error) {
    console.warn('⚠️  无法生成测试摘要:', error);
  }
}

export default globalTeardown;