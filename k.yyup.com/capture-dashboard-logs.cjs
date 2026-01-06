const { chromium } = require('playwright');

async function captureDashboardLogs() {
  const browser = await chromium.launch({
    headless: true,
    devtools: false
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // 存储控制台日志
  const consoleLogs = [];

  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push({
      type: msg.type(),
      text: text,
      timestamp: new Date().toISOString()
    });
  });

  try {
    console.log('🚀 第一步：登录系统...');

    // 先访问登录页面
    await page.goto('http://localhost:5173/login', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // 等待登录页面加载
    await page.waitForTimeout(2000);

    // 查找并点击admin快捷登录按钮
    console.log('🔑 使用admin账号快捷登录...');

    // 尝试点击admin快捷登录按钮
    const adminButton = await page.locator('text=admin').first();
    if (await adminButton.isVisible()) {
      await adminButton.click();
      console.log('✅ 已点击admin快捷登录按钮');
      await page.waitForTimeout(3000);
    } else {
      console.log('⚠️ 未找到admin快捷登录按钮，尝试手动输入...');
      // 手动输入登录信息
      await page.fill('input[type="text"]', 'admin');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    }

    console.log('🚀 第二步：访问 dashboard 页面...');

    // 访问dashboard页面
    await page.goto('http://localhost:5173/dashboard', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // 等待页面加载完成
    await page.waitForTimeout(5000);

    console.log('\n📋 控制台日志记录:\n');
    console.log('='.repeat(80));

    // 查找特定的日志
    const menuSuccessLogs = consoleLogs.filter(log =>
      log.text.includes('✅ 菜单获取成功')
    );

    const menuDetailLogs = consoleLogs.filter(log =>
      log.text.includes('🔍 菜单数据详情')
    );

    const menuGroupsCalledLogs = consoleLogs.filter(log =>
      log.text.includes('🔍 menuGroups计算属性被调用')
    );

    const menuGroupsCompleteLogs = consoleLogs.filter(log =>
      log.text.includes('✅ menuGroups生成完成')
    );

    // 输出结果
    if (menuSuccessLogs.length > 0) {
      console.log('\n1️⃣ 菜单获取成功日志:');
      menuSuccessLogs.forEach(log => {
        console.log(`   ${log.text}`);
      });
    }

    if (menuDetailLogs.length > 0) {
      console.log('\n2️⃣ 菜单数据详情日志:');
      menuDetailLogs.forEach(log => {
        console.log(`   ${log.text}`);
      });
    }

    if (menuGroupsCalledLogs.length > 0) {
      console.log('\n3️⃣ menuGroups计算属性被调用日志:');
      menuGroupsCalledLogs.forEach(log => {
        console.log(`   ${log.text}`);
      });
    }

    if (menuGroupsCompleteLogs.length > 0) {
      console.log('\n4️⃣ menuGroups生成完成日志:');
      menuGroupsCompleteLogs.forEach(log => {
        console.log(`   ${log.text}`);
      });
    }

    console.log('\n📊 所有控制台日志:');
    console.log('='.repeat(80));
    consoleLogs.forEach((log, index) => {
      console.log(`\n[${index + 1}] [${log.type.toUpperCase()}] ${log.text}`);
    });

    console.log('\n='.repeat(80));
    console.log(`\n✅ 共捕获 ${consoleLogs.length} 条控制台日志`);

  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await browser.close();
  }
}

captureDashboardLogs();
