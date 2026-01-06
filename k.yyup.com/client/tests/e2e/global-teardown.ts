/**
 * Playwright E2E测试全局清理
 */

import { chromium, FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 开始E2E测试全局清理...');

  try {
    // 清理测试数据
    await cleanupTestData();
    
    // 清理测试文件
    await cleanupTestFiles();
    
    // 生成测试报告摘要
    await generateTestSummary();
    
    console.log('✅ E2E测试全局清理完成');
  } catch (error) {
    console.error('❌ E2E测试清理失败:', error);
  }
}

/**
 * 清理测试数据
 */
async function cleanupTestData() {
  console.log('🗑️ 清理E2E测试数据...');
  
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    const apiBaseUrl = process.env.E2E_API_BASE_URL || 'http://localhost:3001';
    
    // 管理员登录获取token
    const loginResponse = await page.request.post(`${apiBaseUrl}/api/auth/login`, {
      data: {
        username: 'admin',
        password: 'admin123'
      }
    });
    
    if (!loginResponse.ok()) {
      console.log('⚠️ 管理员登录失败，跳过数据清理');
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.data?.token;
    
    if (!token) {
      console.log('⚠️ 未获取到认证token，跳过数据清理');
      return;
    }
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 清理测试活动
    await cleanupTestActivities(page, headers, apiBaseUrl);
    
    // 清理测试学生
    await cleanupTestStudents(page, headers, apiBaseUrl);
    
    // 清理测试班级
    await cleanupTestClasses(page, headers, apiBaseUrl);
    
    // 清理测试用户（保留管理员）
    await cleanupTestUsers(page, headers, apiBaseUrl);
    
    console.log('✅ E2E测试数据清理完成');
  } catch (error) {
    console.error('❌ 清理测试数据失败:', error);
  } finally {
    await browser.close();
  }
}

/**
 * 清理测试活动
 */
async function cleanupTestActivities(page: any, headers: any, apiBaseUrl: string) {
  try {
    const response = await page.request.get(`${apiBaseUrl}/api/activities`, { headers });
    
    if (response.ok()) {
      const data = await response.json();
      const activities = data.data?.items || [];
      
      for (const activity of activities) {
        if (activity.title?.includes('E2E测试') || activity.title?.includes('测试')) {
          await page.request.delete(`${apiBaseUrl}/api/activities/${activity.id}`, { headers });
          console.log(`🗑️ 删除测试活动: ${activity.title}`);
        }
      }
    }
  } catch (error) {
    console.log('⚠️ 清理测试活动失败:', error.message);
  }
}

/**
 * 清理测试学生
 */
async function cleanupTestStudents(page: any, headers: any, apiBaseUrl: string) {
  try {
    const response = await page.request.get(`${apiBaseUrl}/api/students`, { headers });
    
    if (response.ok()) {
      const data = await response.json();
      const students = data.data?.items || [];
      
      for (const student of students) {
        if (student.name?.includes('E2E测试') || student.name?.includes('测试')) {
          await page.request.delete(`${apiBaseUrl}/api/students/${student.id}`, { headers });
          console.log(`🗑️ 删除测试学生: ${student.name}`);
        }
      }
    }
  } catch (error) {
    console.log('⚠️ 清理测试学生失败:', error.message);
  }
}

/**
 * 清理测试班级
 */
async function cleanupTestClasses(page: any, headers: any, apiBaseUrl: string) {
  try {
    const response = await page.request.get(`${apiBaseUrl}/api/classes`, { headers });
    
    if (response.ok()) {
      const data = await response.json();
      const classes = data.data?.items || [];
      
      for (const cls of classes) {
        if (cls.name?.includes('E2E测试') || cls.name?.includes('测试')) {
          await page.request.delete(`${apiBaseUrl}/api/classes/${cls.id}`, { headers });
          console.log(`🗑️ 删除测试班级: ${cls.name}`);
        }
      }
    }
  } catch (error) {
    console.log('⚠️ 清理测试班级失败:', error.message);
  }
}

/**
 * 清理测试用户
 */
async function cleanupTestUsers(page: any, headers: any, apiBaseUrl: string) {
  try {
    const response = await page.request.get(`${apiBaseUrl}/api/users`, { headers });
    
    if (response.ok()) {
      const data = await response.json();
      const users = data.data?.items || [];
      
      for (const user of users) {
        // 保留管理员和系统用户
        if (user.username === 'admin' || user.role === 'system') {
          continue;
        }
        
        if (user.username?.includes('test_') || 
            user.name?.includes('测试') || 
            user.email?.includes('@test.com')) {
          await page.request.delete(`${apiBaseUrl}/api/users/${user.id}`, { headers });
          console.log(`🗑️ 删除测试用户: ${user.username}`);
        }
      }
    }
  } catch (error) {
    console.log('⚠️ 清理测试用户失败:', error.message);
  }
}

/**
 * 清理测试文件
 */
async function cleanupTestFiles() {
  console.log('🗂️ 清理测试文件...');
  
  const tempDirs = [
    'test-results/temp',
    'test-results/screenshots',
    'test-results/videos',
    'test-results/traces'
  ];
  
  for (const dir of tempDirs) {
    try {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`🗑️ 清理目录: ${dir}`);
      }
    } catch (error) {
      console.log(`⚠️ 清理目录失败: ${dir}`, error.message);
    }
  }
  
  // 清理过期的测试结果文件
  const testResultsDir = 'test-results';
  if (fs.existsSync(testResultsDir)) {
    const files = fs.readdirSync(testResultsDir);
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7天
    
    for (const file of files) {
      const filePath = path.join(testResultsDir, file);
      try {
        const stats = fs.statSync(filePath);
        if (now - stats.mtime.getTime() > maxAge) {
          fs.rmSync(filePath, { recursive: true, force: true });
          console.log(`🗑️ 清理过期文件: ${file}`);
        }
      } catch (error) {
        console.log(`⚠️ 清理文件失败: ${file}`, error.message);
      }
    }
  }
}

/**
 * 生成测试报告摘要
 */
async function generateTestSummary() {
  console.log('📊 生成测试报告摘要...');
  
  try {
    const resultsFile = 'test-results/e2e-results.json';
    
    if (!fs.existsSync(resultsFile)) {
      console.log('⚠️ 测试结果文件不存在，跳过报告生成');
      return;
    }
    
    const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
    
    const summary = {
      timestamp: new Date().toISOString(),
      total: results.stats?.total || 0,
      passed: results.stats?.passed || 0,
      failed: results.stats?.failed || 0,
      skipped: results.stats?.skipped || 0,
      duration: results.stats?.duration || 0,
      success: (results.stats?.failed || 0) === 0
    };
    
    // 保存摘要
    const summaryFile = 'test-results/e2e-summary.json';
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
    
    // 输出摘要到控制台
    console.log('📈 E2E测试结果摘要:');
    console.log(`   总计: ${summary.total}`);
    console.log(`   通过: ${summary.passed}`);
    console.log(`   失败: ${summary.failed}`);
    console.log(`   跳过: ${summary.skipped}`);
    console.log(`   耗时: ${Math.round(summary.duration / 1000)}秒`);
    console.log(`   状态: ${summary.success ? '✅ 成功' : '❌ 失败'}`);
    
  } catch (error) {
    console.log('⚠️ 生成测试报告摘要失败:', error.message);
  }
}

export default globalTeardown;
