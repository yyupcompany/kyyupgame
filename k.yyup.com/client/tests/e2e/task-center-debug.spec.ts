import { test, expect } from '@playwright/test';

test('任务中心详细调试 - /centers/task', async ({ page }) => {
  const apiErrors: { url: string; status: number }[] = [];
  const consoleErrors: string[] = [];
  const consoleWarnings: string[] = [];

  // 监听所有控制台消息
  page.on('console', (msg) => {
    const text = msg.text();
    const type = msg.type();
    
    if (type === 'error') {
      consoleErrors.push(text);
      console.log(`❌ 控制台错误: ${text}`);
    } else if (type === 'warning') {
      consoleWarnings.push(text);
      console.log(`⚠️  控制台警告: ${text}`);
    }
  });

  // 监听API响应
  page.on('response', (response) => {
    const url = response.url();
    const status = response.status();
    
    if (status >= 400) {
      apiErrors.push({ url, status });
      console.log(`❌ API错误 ${status}: ${url}`);
    }
  });

  // 监听页面错误
  page.on('pageerror', (error) => {
    console.log(`❌ 页面错误: ${error.message}`);
    consoleErrors.push(`Page Error: ${error.message}`);
  });

  // 登录
  console.log('🔐 开始登录...');
  await page.goto('http://localhost:5173/login');
  
  // 等待页面加载完成
  await page.waitForLoadState('networkidle');
  
  // 等待输入框出现
  const usernameInput = page.locator('input[placeholder="请输入用户名"]').or(page.locator('input[type="text"]')).first();
  const passwordInput = page.locator('input[placeholder="请输入密码"]').or(page.locator('input[type="password"]')).first();
  
  await usernameInput.waitFor({ state: 'visible', timeout: 5000 });
  await usernameInput.fill('13800138000');
  await passwordInput.fill('123456');
  
  // 点击登录按钮
  const loginButton = page.getByTestId('login-button');
  await loginButton.click();
  
  // 等待登录完成（可能跳转到dashboard或其他页面）
  await page.waitForTimeout(3000);
  console.log('✅ 登录完成，当前URL:', page.url());

  // 访问任务中心
  console.log('\n📋 访问任务中心: /centers/task');
  await page.goto('http://localhost:5173/centers/task');
  
  // 等待页面加载
  await page.waitForTimeout(5000);

  // 截图
  await page.screenshot({ path: 'test-results/task-center-debug.png' });

  // 输出统计
  console.log('\n📊 测试结果统计:');
  console.log(`   API错误数: ${apiErrors.length}`);
  console.log(`   控制台错误数: ${consoleErrors.length}`);
  console.log(`   控制台警告数: ${consoleWarnings.length}`);

  if (apiErrors.length > 0) {
    console.log('\n❌ API错误详情:');
    apiErrors.forEach(err => {
      console.log(`   ${err.status} - ${err.url}`);
    });
  }

  if (consoleErrors.length > 0) {
    console.log('\n❌ 控制台错误详情:');
    consoleErrors.forEach((err, index) => {
      console.log(`   ${index + 1}. ${err.substring(0, 200)}`);
    });
  }

  // 输出页面信息
  const title = await page.title();
  console.log(`\n📄 页面标题: ${title}`);
  
  const url = page.url();
  console.log(`📍 当前URL: ${url}`);
});
