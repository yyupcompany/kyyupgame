/**
 * Playwright E2E测试全局设置
 */

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 开始E2E测试全局设置...');

  // 设置环境变量
  process.env.NODE_ENV = 'test';
  process.env.E2E_BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';
  process.env.E2E_API_BASE_URL = process.env.E2E_API_BASE_URL || 'http://localhost:3000';

  // 等待服务器启动
  await waitForServer(process.env.E2E_BASE_URL);
  await waitForServer(process.env.E2E_API_BASE_URL);

  // 创建测试数据
  await setupTestData();

  console.log('✅ E2E测试全局设置完成');
}

/**
 * 等待服务器启动
 */
async function waitForServer(url: string, timeout = 60000) {
  console.log(`⏳ 等待服务器启动: ${url}`);
  
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status === 404) {
        console.log(`✅ 服务器已启动: ${url}`);
        return;
      }
    } catch (error) {
      // 服务器还未启动，继续等待
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error(`❌ 服务器启动超时: ${url}`);
}

/**
 * 设置测试数据
 */
async function setupTestData() {
  console.log('📝 创建E2E测试数据...');
  
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 创建测试用户
    await createTestUsers(page);
    
    // 创建测试数据
    await createTestData(page);
    
    console.log('✅ E2E测试数据创建完成');
  } catch (error) {
    console.error('❌ 创建测试数据失败:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * 创建测试用户
 */
async function createTestUsers(page: any) {
  const apiBaseUrl = process.env.E2E_API_BASE_URL;
  
  const testUsers = [
    {
      username: 'admin',
      password: 'admin123',
      email: 'admin@test.com',
      name: '系统管理员',
      role: 'admin'
    },
    {
      username: 'teacher1',
      password: 'teacher123',
      email: 'teacher1@test.com',
      name: '张老师',
      role: 'teacher'
    },
    {
      username: 'parent1',
      password: 'parent123',
      email: 'parent1@test.com',
      name: '李家长',
      role: 'parent'
    }
  ];

  for (const user of testUsers) {
    try {
      const response = await page.request.post(`${apiBaseUrl}/api/auth/register`, {
        data: user
      });
      
      if (response.ok()) {
        console.log(`✅ 创建测试用户: ${user.username}`);
      } else {
        // 用户可能已存在，尝试更新
        console.log(`ℹ️ 用户可能已存在: ${user.username}`);
      }
    } catch (error) {
      console.log(`⚠️ 创建用户失败: ${user.username}`, error.message);
    }
  }
}

/**
 * 创建测试数据
 */
async function createTestData(page: any) {
  const apiBaseUrl = process.env.E2E_API_BASE_URL;
  
  // 管理员登录获取token
  const loginResponse = await page.request.post(`${apiBaseUrl}/api/auth/login`, {
    data: {
      username: 'admin',
      password: 'admin123'
    }
  });
  
  if (!loginResponse.ok()) {
    console.log('⚠️ 管理员登录失败，跳过测试数据创建');
    return;
  }
  
  const loginData = await loginResponse.json();
  const token = loginData.data?.token;
  
  if (!token) {
    console.log('⚠️ 未获取到认证token，跳过测试数据创建');
    return;
  }
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // 创建测试班级
  try {
    const classResponse = await page.request.post(`${apiBaseUrl}/api/classes`, {
      headers,
      data: {
        name: 'E2E测试班级',
        description: '用于E2E测试的班级',
        capacity: 30,
        ageGroup: '3-4岁'
      }
    });
    
    if (classResponse.ok()) {
      console.log('✅ 创建测试班级');
    }
  } catch (error) {
    console.log('⚠️ 创建测试班级失败:', error.message);
  }

  // 创建测试学生
  try {
    const studentResponse = await page.request.post(`${apiBaseUrl}/api/students`, {
      headers,
      data: {
        name: 'E2E测试学生',
        gender: '男',
        birthDate: '2020-01-01',
        parentName: '测试家长',
        parentPhone: '13800138000'
      }
    });
    
    if (studentResponse.ok()) {
      console.log('✅ 创建测试学生');
    }
  } catch (error) {
    console.log('⚠️ 创建测试学生失败:', error.message);
  }

  // 创建测试活动
  try {
    const activityResponse = await page.request.post(`${apiBaseUrl}/api/activities`, {
      headers,
      data: {
        title: 'E2E测试活动',
        description: '用于E2E测试的活动',
        activityType: '户外活动',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 明天
        endTime: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
        capacity: 20
      }
    });
    
    if (activityResponse.ok()) {
      console.log('✅ 创建测试活动');
    }
  } catch (error) {
    console.log('⚠️ 创建测试活动失败:', error.message);
  }
}

export default globalSetup;
