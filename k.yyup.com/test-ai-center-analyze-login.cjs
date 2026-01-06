const { chromium } = require('playwright');

async function analyzeLoginPage() {
  console.log('🔍 分析登录页面结构...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    // 访问主页
    console.log('📍 访问主页...');
    await page.goto('http://localhost:5173', {
      waitUntil: 'networkidle',
      timeout: 10000
    });

    await page.waitForTimeout(2000);

    // 截图当前状态
    await page.screenshot({ path: 'docs/浏览器检查/login-page-analysis.png', fullPage: true });

    // 分析页面内容
    const pageContent = await page.content();
    console.log('\n📋 页面包含的内容:');

    // 检查各种可能的登录元素
    const checks = [
      'admin',
      '家长',
      '园长',
      '老师',
      '用户名',
      '密码',
      'username',
      'password',
      'input',
      'button',
      'form',
      '登录',
      'login'
    ];

    for (const check of checks) {
      if (pageContent.includes(check)) {
        console.log(`  ✅ 包含: ${check}`);
      }
    }

    // 查找所有输入框
    const inputs = await page.$$eval('input', inputs =>
      inputs.map(input => ({
        type: input.type,
        name: input.name,
        placeholder: input.placeholder,
        id: input.id,
        className: input.className
      }))
    );

    console.log('\n🔧 输入框元素:');
    inputs.forEach((input, index) => {
      console.log(`  ${index + 1}. type="${input.type}", name="${input.name}", placeholder="${input.placeholder}"`);
    });

    // 查找所有按钮
    const buttons = await page.$$eval('button, .el-button, [role="button"]', buttons =>
      buttons.map(button => ({
        text: button.textContent?.trim(),
        type: button.type,
        className: button.className
      }))
    );

    console.log('\n🔘 按钮元素:');
    buttons.forEach((button, index) => {
      console.log(`  ${index + 1}. text="${button.text}", type="${button.type}", class="${button.className}"`);
    });

    // 查找所有链接
    const links = await page.$$eval('a', links =>
      links.map(link => ({
        text: link.textContent?.trim(),
        href: link.href,
        className: link.className
      }))
    );

    console.log('\n🔗 链接元素:');
    links.forEach((link, index) => {
      if (link.text && link.text.length > 0) {
        console.log(`  ${index + 1}. text="${link.text}", href="${link.href}"`);
      }
    });

    // 尝试找到快捷登录相关的类名
    const quickLoginElements = await page.$$('[class*="quick"], [class*="fast"], [class*="shortcut"]');
    console.log(`\n⚡ 快捷登录相关元素: ${quickLoginElements.length} 个`);

    // 查找可能的角色选择器
    const roleElements = await page.$$('[class*="role"], [class*="user"], [class*="account"]');
    console.log(`\n👤 角色相关元素: ${roleElements.length} 个`);

    // 等待一下看看是否有动态加载的内容
    console.log('\n⏳ 等待动态内容加载...');
    await page.waitForTimeout(5000);

    // 再次截图检查是否有新内容
    await page.screenshot({ path: 'docs/浏览器检查/login-page-after-wait.png', fullPage: true });

    // 检查控制台是否有脚本错误
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text()
      });
    });

    await page.waitForTimeout(2000);

    if (consoleMessages.length > 0) {
      console.log('\n📋 控制台消息:');
      consoleMessages.forEach((msg, index) => {
        if (msg.type === 'error' || msg.type === 'warning') {
          console.log(`  ${index + 1}. [${msg.type.toUpperCase()}] ${msg.text}`);
        }
      });
    }

    // 尝试模拟用户登录（如果找到用户名密码输入框）
    if (inputs.length >= 2) {
      console.log('\n🔐 尝试模拟登录...');

      // 假设第一个是用户名，第二个是密码
      const usernameInput = await page.$('input[type="text"], input[name*="user"], input[placeholder*="用户"], input[placeholder*="账号"]');
      const passwordInput = await page.$('input[type="password"], input[name*="pass"], input[placeholder*="密码"]');
      const loginButton = await page.$('button:has-text("登录"), button[type="submit"], .el-button:has-text("登录")');

      if (usernameInput && passwordInput && loginButton) {
        console.log('  ✅ 找到登录表单元素');

        await usernameInput.fill('admin');
        await passwordInput.fill('admin123');
        await loginButton.click();

        await page.waitForTimeout(3000);

        const currentUrl = page.url();
        console.log(`  登录后URL: ${currentUrl}`);

        await page.screenshot({ path: 'docs/浏览器检查/after-login-attempt.png', fullPage: true });
      } else {
        console.log('  ❌ 未找到完整的登录表单元素');
        console.log(`    用户名输入框: ${usernameInput ? '✅' : '❌'}`);
        console.log(`    密码输入框: ${passwordInput ? '✅' : '❌'}`);
        console.log(`    登录按钮: ${loginButton ? '✅' : '❌'}`);
      }
    }

  } catch (error) {
    console.error('❌ 分析过程中发生错误:', error);
  } finally {
    await browser.close();
  }
}

// 执行分析
analyzeLoginPage();