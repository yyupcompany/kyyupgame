const { chromium } = require('playwright');

async function testSidebarLinks() {
  console.log('🚀 开始测试侧边栏链接...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // 监听控制台消息
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
    if (msg.type() === 'error') {
      console.log(`❌ 控制台错误: ${msg.text()}`);
      console.log(`   位置: ${msg.location().url}:${msg.location().lineNumber}`);
    }
  });

  // 监听页面错误
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push({
      message: error.message,
      stack: error.stack
    });
    console.log(`💥 页面错误: ${error.message}`);
  });

  try {
    // 访问首页
    console.log('📱 访问应用首页...');
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // 等待应用完全加载

    // 使用有效的测试账号进行登录
    console.log('🔑 使用测试账号登录...');

    // 等待登录表单加载
    await page.waitForSelector('input[type="text"], input[type="username"], input[placeholder*="用户名"]', { timeout: 5000 });
    await page.waitForTimeout(1000);

    // 填写登录信息
    const usernameInput = await page.$('input[type="text"], input[type="username"], input[placeholder*="用户名"]');
    const passwordInput = await page.$('input[type="password"], input[placeholder*="密码"]');

    if (usernameInput && passwordInput) {
      await usernameInput.fill('unauthorized');
      await passwordInput.fill('123456');

      // 查找并点击登录按钮
      const loginBtn = await page.$('button:has-text("登录"), .login-btn, button[type="submit"]');
      if (loginBtn) {
        console.log('🔑 点击登录按钮...');
        await loginBtn.click();
        await page.waitForTimeout(3000);
      }
    }

    // 等待页面完全加载并检查是否登录成功
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 设置localStorage中的token，使用有效的管理员token
    await page.evaluate(() => {
      localStorage.setItem('kindergarten_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIxLCJwaG9uZSI6IjE4NjExMTQxMTMxIiwicm9sZSI6ImFkbWluIiwiaXNEZW1vIjp0cnVlLCJpYXQiOjE3NjQ4NzY3MjUsImV4cCI6MTc2NTQ4MTUyNX0.smEzm1fsfO4NJQjISduC8srAHLdbgIZPGanoTsyvb_E');
      localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIxLCJwaG9uZSI6IjE4NjExMTQxMTMxIiwicm9sZSI6ImFkbWluIiwiaXNEZW1vIjp0cnVlLCJpYXQiOjE3NjQ4NzY3MjUsImV4cCI6MTc2NTQ4MTUyNX0.smEzm1fsfO4NJQjISduC8srAHLdbgIZPGanoTsyvb_E');
      localStorage.setItem('userInfo', JSON.stringify({
        "id": 121,
        "username": "admin",
        "email": "admin@test.com",
        "realName": "admin",
        "phone": "18611141131",
        "role": "admin",
        "isAdmin": true,
        "status": "active"
      }));
    });

    console.log('✅ 登录token已设置');

    // 刷新页面确保登录状态生效
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 查找侧边栏
    console.log('📋 查找侧边栏...');
    const sidebar = await page.$('.sidebar, aside, [class*="sidebar"]');

    if (sidebar) {
      console.log('✅ 找到侧边栏');

      // 查找所有链接
      const links = await page.$$eval('a[href]', links =>
        links.map(link => ({
          href: link.href,
          text: link.textContent?.trim(),
          className: link.className
        }))
      );

      console.log(`🔗 找到 ${links.length} 个链接`);

      // 过滤出侧边栏相关的链接
      const sidebarLinks = links.filter(link =>
        link.href.includes('parent-center') ||
        link.href.includes('teacher-center') ||
        link.href.includes('principal-center') ||
        link.href.includes('admin-center') ||
        link.href.includes('/dashboard')
      );

      console.log(`📊 侧边栏链接数量: ${sidebarLinks.length}`);

      // 点击每个侧边栏链接并检查错误
      for (let i = 0; i < sidebarLinks.length; i++) {
        const link = sidebarLinks[i];
        console.log(`\n🔗 测试链接 ${i + 1}/${sidebarLinks.length}: ${link.text} (${link.href})`);

        try {
          // 记录点击前的控制台消息数量
          const consoleErrorsBefore = consoleMessages.filter(msg => msg.type === 'error').length;
          const pageErrorsBefore = pageErrors.length;

          // 点击链接
          await page.goto(link.href, { waitUntil: 'networkidle' });
          await page.waitForTimeout(2000); // 等待页面加载

          // 检查是否有新的错误
          const newConsoleErrors = consoleMessages.slice(consoleErrorsBefore);
          const newPageErrors = pageErrors.slice(pageErrorsBefore);

          if (newConsoleErrors.length > 0 || newPageErrors.length > 0) {
            console.log(`❌ 发现错误:`);
            newConsoleErrors.forEach(error => {
              console.log(`   控制台: ${error.text}`);
            });
            newPageErrors.forEach(error => {
              console.log(`   页面: ${error.message}`);
            });
          } else {
            console.log(`✅ 无错误`);
          }

          // 返回首页继续测试下一个链接
          await page.goto('http://localhost:5173');
          await page.waitForTimeout(1000);

        } catch (error) {
          console.log(`💥 链接访问失败: ${error.message}`);
        }
      }

    } else {
      console.log('❌ 未找到侧边栏');
    }

  } catch (error) {
    console.error('💥 测试过程出错:', error.message);
  } finally {
    await browser.close();

    // 输出总结
    console.log('\n📊 测试总结:');
    console.log(`- 总共控制台消息: ${consoleMessages.length}`);
    console.log(`- 控制台错误: ${consoleMessages.filter(msg => msg.type === 'error').length}`);
    console.log(`- 页面错误: ${pageErrors.length}`);

    if (consoleMessages.filter(msg => msg.type === 'error').length > 0 || pageErrors.length > 0) {
      console.log('\n❌ 发现错误的链接:');
      consoleMessages.filter(msg => msg.type === 'error').forEach(msg => {
        console.log(`- ${msg.text} (位置: ${msg.location?.url}:${msg.location?.lineNumber})`);
      });
      pageErrors.forEach(error => {
        console.log(`- ${error.message}`);
      });
    } else {
      console.log('✅ 所有链接测试通过，无错误发现');
    }
  }
}

testSidebarLinks().catch(console.error);