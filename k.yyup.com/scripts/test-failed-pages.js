/**
 * 测试失败的页面 - 教学中心和话术中心
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:3000';

const TEST_USER = {
  username: 'principal',
  password: '123456'
};

const FAILED_PAGES = [
  { name: '教学中心', path: '/centers/teaching' },
  { name: '话术中心', path: '/centers/script' }
];

async function login(page) {
  console.log('🔐 开始登录...');
  
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('.login-form', { timeout: 10000 });
  
  await page.fill('input[placeholder="请输入用户名"]', TEST_USER.username);
  await page.fill('input[placeholder="请输入密码"]', TEST_USER.password);
  
  await Promise.all([
    page.waitForNavigation({ timeout: 15000 }).catch(() => null),
    page.click('button[type="submit"]')
  ]);
  
  await page.waitForTimeout(2000);
  
  const currentUrl = page.url();
  if (currentUrl.includes('/login')) {
    throw new Error('登录失败');
  }
  
  console.log(`✅ 登录成功\n`);
}

async function testPage(page, center) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📋 测试: ${center.name}`);
  console.log(`🔗 路径: ${center.path}`);
  console.log(`${'='.repeat(80)}\n`);
  
  try {
    // 1. 权限验证
    console.log('🔍 步骤1: 权限验证...');
    const permissionStart = Date.now();
    
    const permissionResponse = await page.request.post(`${API_URL}/api/dynamic-permissions/check-permission`, {
      data: { path: center.path },
      headers: {
        'Authorization': `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`
      }
    });
    
    const permissionTime = Date.now() - permissionStart;
    const permissionData = await permissionResponse.json();
    
    console.log(`   权限验证: ${permissionData.success && permissionData.data.hasPermission ? '✅ 通过' : '❌ 失败'} (${permissionTime}ms)`);
    
    if (!permissionData.success || !permissionData.data.hasPermission) {
      console.log(`   原因: ${permissionData.message || '无权限'}`);
      return;
    }
    
    // 2. 页面加载
    console.log('\n🌐 步骤2: 页面加载...');
    
    await page.goto(`${BASE_URL}${center.path}`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // 检查是否跳转到403
    const currentUrl = page.url();
    console.log(`   当前URL: ${currentUrl}`);
    
    if (currentUrl.includes('/403')) {
      console.log('❌ 页面加载失败: 跳转到403权限不足页面');
      
      // 截图
      const screenshotPath = `/tmp/${center.name}-403错误.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`   截图已保存: ${screenshotPath}`);
      
      return;
    }
    
    console.log('✅ 页面加载成功');
    
    // 3. 检查页面内容
    console.log('\n📊 步骤3: 页面内容检查...');
    
    await page.waitForTimeout(2000);
    
    const pageTitle = await page.title();
    console.log(`   页面标题: ${pageTitle}`);
    
    // 检查是否有错误提示
    const errorElements = await page.$$('.el-message--error, .error-message');
    if (errorElements.length > 0) {
      const errorText = await errorElements[0].textContent();
      console.log(`⚠️  发现错误提示: ${errorText}`);
    }
    
    // 检查主要内容
    const mainContent = await page.$('.main-content, .page-container, .center-container');
    if (mainContent) {
      console.log('✅ 主要内容区域已加载');
    } else {
      console.log('⚠️  未找到主要内容区域');
    }
    
    // 截图
    const screenshotPath = `/tmp/${center.name}-成功加载.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`\n📸 截图已保存: ${screenshotPath}`);
    
    console.log(`\n✅ ${center.name}测试完成`);
    
  } catch (error) {
    console.log(`\n❌ ${center.name}测试失败: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 测试失败的页面 - 教学中心和话术中心\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  // 监听控制台消息
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`   [浏览器错误]: ${msg.text()}`);
    }
  });
  
  try {
    await login(page);
    
    for (const center of FAILED_PAGES) {
      await testPage(page, center);
      await page.waitForTimeout(1000);
    }
    
  } catch (error) {
    console.error('❌ 测试执行失败:', error);
  } finally {
    await browser.close();
  }
}

main();

