const { chromium } = require('playwright');

async function testHeadlessPerformance() {
  console.log('⚡ 无头模式性能测试开始...');
  
  let browser;
  const performanceMetrics = {
    startTime: Date.now(),
    browserLaunch: 0,
    pageCreate: 0,
    pageLoad: 0,
    loginProcess: 0,
    totalTime: 0
  };
  
  try {
    console.log('🚀 启动无头浏览器...');
    const browserStartTime = Date.now();
    
    browser = await chromium.launch({
      headless: true, // 无头模式
      // 性能优化选项
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    
    performanceMetrics.browserLaunch = Date.now() - browserStartTime;
    console.log(`✅ 浏览器启动耗时: ${performanceMetrics.browserLaunch}ms`);
    
    const pageStartTime = Date.now();
    const page = await browser.newPage();
    
    // 优化页面配置
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // 禁用不必要的功能以提升性能
    await page.route('**/*', (route) => {
      const resourceType = route.request().resourceType();
      if (['font', 'image', 'media'].includes(resourceType)) {
        route.abort();
      } else {
        route.continue();
      }
    });
    
    performanceMetrics.pageCreate = Date.now() - pageStartTime;
    console.log(`✅ 页面创建耗时: ${performanceMetrics.pageCreate}ms`);
    
    console.log('🌐 访问登录页面...');
    const loadStartTime = Date.now();
    
    await page.goto('http://localhost:5173/', {
      waitUntil: 'domcontentloaded', // 更快的等待条件
      timeout: 30000
    });
    
    performanceMetrics.pageLoad = Date.now() - loadStartTime;
    console.log(`✅ 页面加载耗时: ${performanceMetrics.pageLoad}ms`);
    
    // 快速登录测试
    console.log('⚡ 执行快速登录...');
    const loginStartTime = Date.now();
    
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // 等待页面响应
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    performanceMetrics.loginProcess = Date.now() - loginStartTime;
    console.log(`✅ 登录流程耗时: ${performanceMetrics.loginProcess}ms`);
    
    // 验证结果
    const currentUrl = page.url();
    const pageContent = await page.content();
    const hasLoginForm = pageContent.includes('form');
    
    console.log('📊 测试结果分析:');
    console.log(`   - 最终URL: ${currentUrl}`);
    console.log(`   - 仍有登录表单: ${hasLoginForm}`);
    console.log(`   - 页面大小: ${pageContent.length} 字符`);
    
    // 截图（即使是无头模式也可以截图）
    await page.screenshot({ 
      path: 'headless-performance-test.png',
      fullPage: true 
    });
    console.log('📸 已保存性能测试截图: headless-performance-test.png');
    
    performanceMetrics.totalTime = Date.now() - performanceMetrics.startTime;
    
    console.log('\n⚡ 性能指标汇总:');
    console.log(`   - 浏览器启动: ${performanceMetrics.browserLaunch}ms`);
    console.log(`   - 页面创建: ${performanceMetrics.pageCreate}ms`);
    console.log(`   - 页面加载: ${performanceMetrics.pageLoad}ms`);
    console.log(`   - 登录流程: ${performanceMetrics.loginProcess}ms`);
    console.log(`   - 总耗时: ${performanceMetrics.totalTime}ms`);
    console.log(`   - 平均每步耗时: ${Math.round(performanceMetrics.totalTime / 4)}ms`);
    
    // 性能评级
    let performanceGrade = 'A+';
    if (performanceMetrics.totalTime > 10000) performanceGrade = 'A';
    if (performanceMetrics.totalTime > 15000) performanceGrade = 'B';
    if (performanceMetrics.totalTime > 20000) performanceGrade = 'C';
    
    console.log(`🏆 性能评级: ${performanceGrade}`);
    
  } catch (error) {
    console.error('❌ 性能测试失败:', error.message);
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔄 浏览器已关闭');
    }
    console.log('✅ 无头模式性能测试完成');
  }
}

// 运行测试
testHeadlessPerformance().catch(console.error);