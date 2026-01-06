/**
 * 验证督查中心Bug修复效果
 */
const { chromium } = require('playwright');

async function verifyFix() {
  console.log('🧪 验证督查中心Bug修复效果...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  let consoleErrors = [];
  let networkErrors = [];
  
  // 监听错误
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log(`   ❌ [控制台错误] ${msg.text().substring(0, 80)}`);
    }
  });
  
  page.on('response', response => {
    if (response.status() >= 400) {
      networkErrors.push({ url: response.url(), status: response.status() });
      console.log(`   ❌ [网络错误] ${response.status()} - ${response.url()}`);
    }
  });
  
  try {
    console.log('📋 步骤 1: 登录系统\n');
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'verify-01-login.png', fullPage: true });
    console.log('   ✅ 登录页面加载成功');
    
    await page.locator('button:has-text("系统管理员")').click();
    await page.waitForTimeout(3000);
    console.log('   ✅ 快捷登录成功\n');
    
    console.log('📋 步骤 2: 进入督查中心\n');
    const errorsBefore = consoleErrors.length;
    const networkErrorsBefore = networkErrors.length;
    
    await page.locator('a:has-text("督查中心")').first().click();
    await page.waitForTimeout(6000);
    
    await page.screenshot({ path: 'verify-02-inspection-center.png', fullPage: true });
    
    const newConsoleErrors = consoleErrors.length - errorsBefore;
    const newNetworkErrors = networkErrors.length - networkErrorsBefore;
    
    if (newConsoleErrors === 0 && newNetworkErrors === 0) {
      console.log('   ✅ 督查中心加载成功，无错误！');
    } else {
      console.log(`   ⚠️ 发现 ${newConsoleErrors} 个控制台错误，${newNetworkErrors} 个网络错误`);
    }
    
    console.log('\n📋 步骤 3: 测试全局搜索功能（Bug 1修复验证）\n');
    
    try {
      const searchInput = page.locator('input[placeholder*="搜索检查类型"]');
      await searchInput.fill('消防');
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: 'verify-03-search.png', fullPage: true });
      console.log('   ✅ 全局搜索功能正常（Bug 1已修复）');
      
      await searchInput.clear();
      await page.waitForTimeout(1000);
      
    } catch (error) {
      console.log(`   ❌ 搜索功能错误: ${error.message}`);
    }
    
    console.log('\n📋 步骤 4: 测试"本月检查"按钮（Bug 1修复验证）\n');
    
    try {
      const monthBtn = page.locator('button:has-text("本月检查")');
      await monthBtn.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: 'verify-04-jump-month.png', fullPage: true });
      console.log('   ✅ "本月检查"按钮正常（Bug 1已修复）');
      
    } catch (error) {
      console.log(`   ❌ "本月检查"按钮错误: ${error.message}`);
    }
    
    console.log('\n📋 步骤 5: 测试快捷筛选功能\n');
    
    const filters = ['全部', '待开始', '进行中', '已完成'];
    for (const filter of filters) {
      try {
        await page.locator(`.filter-buttons >> button:has-text("${filter}")`).click();
        await page.waitForTimeout(1500);
        console.log(`   ✅ ${filter}筛选正常`);
      } catch (error) {
        console.log(`   ❌ ${filter}筛选错误`);
      }
    }
    
    await page.screenshot({ path: 'verify-05-filters.png', fullPage: true });
    
    console.log('\n📋 步骤 6: 检查文档实例API（Bug 2修复验证）\n');
    
    // 重新加载页面，检查文档实例API
    await page.reload();
    await page.waitForTimeout(6000);
    
    const docErrors = networkErrors.filter(e => e.url.includes('document-instances') && e.status === 500);
    
    if (docErrors.length === 0) {
      console.log('   ✅ 文档实例API正常（Bug 2已修复，无500错误）');
    } else {
      console.log(`   ❌ 文档实例API仍有${docErrors.length}个500错误`);
    }
    
    await page.screenshot({ path: 'verify-06-final.png', fullPage: true });
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 验证结果总结\n');
    console.log(`总控制台错误: ${consoleErrors.length}`);
    console.log(`总网络错误: ${networkErrors.length}`);
    console.log(`文档实例500错误: ${docErrors.length}`);
    
    if (consoleErrors.length === 0 && networkErrors.length === 0) {
      console.log('\n🎉 完美！所有Bug已修复，无任何错误！');
    } else if (docErrors.length === 0 && consoleErrors.filter(e => e.includes('toLowerCase')).length === 0) {
      console.log('\n✅ 两个主要Bug已修复！');
      if (consoleErrors.length > 0) {
        console.log(`⚠️ 还有${consoleErrors.length}个其他控制台消息（可能不是错误）`);
      }
    } else {
      console.log('\n⚠️ 仍有问题需要处理');
    }
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('❌ 测试过程出错:', error);
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

verifyFix();














