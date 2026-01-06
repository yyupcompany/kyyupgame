const { chromium } = require('playwright');

async function debug403Issue() {
  console.log('🔍 调试403页面问题...');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 监听控制台输出
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      });
    });

    // 监听网络请求
    const networkRequests = [];
    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers()
      });
    });

    // 访问根页面，看看是否正常
    console.log('\n📍 访问根页面...');
    await page.goto('http://localhost:5173/', { timeout: 10000 });
    await page.waitForTimeout(3000);

    let rootPageTitle = await page.title();
    console.log(`📄 根页面标题: ${rootPageTitle}`);

    // 检查localStorage中的用户信息
    const localStorage = await page.evaluate(() => {
      return {
        token: localStorage.getItem('kindergarten_token'),
        userInfo: localStorage.getItem('kindergarten_user_info')
      };
    });
    console.log('🔐 localStorage用户信息:', localStorage);

    // 访问403页面
    console.log('\n📍 访问403页面...');
    await page.goto('http://localhost:5173/403', { timeout: 10000 });
    await page.waitForTimeout(2000);

    const page403Title = await page.title();
    console.log(`📄 403页面标题: ${page403Title}`);

    // 检查403页面内容
    const has403Content = await page.locator('text=403').count() > 0;
    const hasPermissionError = await page.locator('text=权限不足').count() > 0;

    console.log('🔍 403页面检查:');
    console.log(`  - 有403内容: ${has403Content}`);
    console.log(`  - 有权限错误: ${hasPermissionError}`);

    // 访问受保护的页面
    console.log('\n📍 访问受保护页面 /dashboard...');
    await page.goto('http://localhost:5173/dashboard', { timeout: 10000 });
    await page.waitForTimeout(3000);

    const finalUrl = page.url();
    console.log(`📍 最终URL: ${finalUrl}`);

    // 如果被重定向到登录页，说明权限守卫正常工作
    if (finalUrl.includes('/login')) {
      console.log('✅ 权限守卫正常工作 - 未登录用户被重定向到登录页');
    } else if (finalUrl.includes('/403')) {
      console.log('⚠️ 用户已登录但权限不足');
    } else {
      console.log('❌ 权限守卫可能有问题');
    }

    // 输出控制台信息
    console.log('\n📋 控制台输出:');
    consoleMessages.slice(-5).forEach((msg, index) => {
      console.log(`  [${msg.type}] ${msg.text}`);
    });

    // 输出网络请求
    console.log('\n🌐 网络请求:');
    const apiRequests = networkRequests.filter(req => req.url.includes('/api'));
    apiRequests.forEach(req => {
      console.log(`  ${req.method} ${req.url}`);
    });

    return {
      rootPageTitle,
      page403Title,
      localStorage,
      finalUrl,
      has403Content,
      consoleMessages: consoleMessages.slice(-10),
      networkRequests: apiRequests
    };

  } finally {
    await browser.close();
  }
}

async function main() {
  console.log('🚀 开始403页面调试');
  console.log('=' .repeat(60));

  const result = await debug403Issue();

  console.log('=' .repeat(60));
  console.log('📊 调试结果总结:');
  console.log(`根页面: ${result.rootPageTitle}`);
  console.log(`403页面: ${result.page403Title}`);
  console.log(`最终URL: ${result.finalUrl}`);
  console.log(`用户Token: ${result.localStorage.token ? '存在' : '不存在'}`);
  console.log(`用户信息: ${result.localStorage.userInfo ? '存在' : '不存在'}`);

  if (result.finalUrl.includes('/login')) {
    console.log('🎯 分析: 权限守卫工作正常，未登录用户正确被重定向');
  } else if (result.finalUrl.includes('/403')) {
    console.log('🎯 分析: 用户已登录但权限不足，或权限检查有问题');
  } else {
    console.log('🎯 分析: 可能存在权限守卫逻辑问题');
  }
}

main().catch(console.error);