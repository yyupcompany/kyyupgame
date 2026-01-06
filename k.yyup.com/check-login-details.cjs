const { chromium } = require('playwright');

async function checkLoginDetails() {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 导航到登录页面
    await page.goto('http://localhost:5173/Login');

    // 等待页面加载完成
    await page.waitForTimeout(2000);

    // 获取所有按钮
    const buttons = await page.$$('button');
    console.log(`页面上有 ${buttons.length} 个按钮`);

    // 查看所有按钮的详细信息
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const text = await button.textContent();
      const classes = await button.getAttribute('class');
      const type = await button.getAttribute('type');

      console.log(`按钮 ${i+1}: 文本="${text.trim()}", 类="${classes}", 类型="${type}"`);

      // 检查是否是admin快捷登录按钮
      if (text.includes('admin') || text.includes('管理员') || classes.includes('admin')) {
        console.log(`   ⚠️  这可能是admin快捷登录按钮`);
      }
    }

    // 截图保存
    await page.screenshot({ path: 'login-page-full.png' });
    console.log('✅ 完整登录页面截图已保存到 login-page-full.png');

    // 尝试点击第一个快捷登录按钮
    if (buttons.length > 3) { // 前两个是用户名和密码登录的按钮，后面是快捷登录
      const quickButton = buttons[3];
      const buttonText = await quickButton.textContent();

      console.log(`\n尝试点击快捷登录按钮: ${buttonText.trim()}`);

      // 监听导航事件
      page.on('navigatesuccess', (url) => {
        console.log(`✅ 导航成功到: ${url}`);
      });

      // 点击按钮
      await quickButton.click();

      // 等待10秒看是否有反应
      await page.waitForTimeout(10000);

      // 检查当前URL
      const currentUrl = await page.url();
      console.log(`当前URL: ${currentUrl}`);

      if (currentUrl !== 'http://localhost:5173/Login') {
        console.log('✅ 登录成功，已跳转');
      }

      // 截图保存
      await page.screenshot({ path: 'after-login.png' });
    }

  } catch (error) {
    console.error('❌ 执行过程中出错:', error);
  } finally {
    await browser.close();
  }
}

checkLoginDetails();
