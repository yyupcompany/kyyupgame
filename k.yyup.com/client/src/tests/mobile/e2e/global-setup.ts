/**
 * E2E测试全局设置
 * 在所有测试运行前执行的初始化操作
 */

import { chromium, FullConfig } from '@playwright/test';
import path from 'path';

async function globalSetup(config: FullConfig) {
  console.log('🚀 开始E2E测试全局设置...');
  
  const { baseURL, headless } = config.projects[0].use;
  
  if (!baseURL) {
    throw new Error('BASE_URL环境变量未设置');
  }

  // 验证无头浏览器模式
  if (headless !== true) {
    console.warn('⚠️  警告: 检测到非无头模式配置，Playwright测试必须使用headless: true');
    throw new Error('Playwright测试必须使用无头浏览器模式 (headless: true)');
  }

  console.log(`✅ 无头浏览器模式配置正确: ${headless}`);
  console.log(`🌐 测试基础URL: ${baseURL}`);

  // 启动临时浏览器进行环境检查
  const browser = await chromium.launch({
    headless: true, // 强制无头模式
    devtools: false, // 禁用开发工具
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
    });

    const page = await context.newPage();

    // 设置请求拦截器用于监控
    await page.route('**/*', async (route) => {
      const request = route.request();
      const url = request.url();
      
      // 记录API调用
      if (url.includes('/api/')) {
        console.log(`📡 API调用: ${request.method()} ${url}`);
      }
      
      await route.continue();
    });

    // 监听控制台输出
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log(`❌ 页面错误: ${msg.text()}`);
      } else if (msg.type() === 'warning') {
        console.log(`⚠️  页面警告: ${msg.text()}`);
      }
    });

    // 监听页面错误
    page.on('pageerror', (error) => {
      console.log(`💥 页面异常: ${error.message}`);
    });

    // 访问基础URL验证环境
    console.log('🔍 验证测试环境...');
    const response = await page.goto(baseURL, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });

    if (!response) {
      throw new Error('无法访问测试环境');
    }

    const status = response.status();
    if (status < 200 || status >= 400) {
      throw new Error(`测试环境响应异常: HTTP ${status}`);
    }

    console.log(`✅ 测试环境验证成功: HTTP ${status}`);

    // 检查关键元素是否存在
    await page.waitForSelector('body', { timeout: 10000 });
    
    // 检查是否为移动端应用
    const isMobileApp = await page.evaluate(() => {
      return window.innerWidth <= 768 || 
             navigator.userAgent.includes('Mobile') ||
             navigator.userAgent.includes('iPhone');
    });

    if (!isMobileApp) {
      console.log('⚠️  警告: 当前页面可能不是移动端视图');
    } else {
      console.log('✅ 移动端视图检测正常');
    }

    // 等待页面完全加载
    await page.waitForLoadState('networkidle', { timeout: 15000 });

    console.log('✅ E2E测试环境准备完成');

    await context.close();
  } catch (error) {
    console.error('❌ E2E测试环境设置失败:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;