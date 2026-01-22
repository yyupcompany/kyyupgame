/**
 * 测试教学中心页面
 * 使用Playwright进行E2E测试
 */
const { chromium } = require('playwright');

async function testTeachingCenter() {
  console.log('🔄 启动浏览器...');
  const browser = await chromium.launch({
    headless: true,
    devtools: false
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // 收集控制台消息
  const consoleMessages = [];
  const consoleErrors = [];

  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push({ type: msg.type(), text });
    if (msg.type() === 'error') {
      consoleErrors.push(text);
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.message);
  });

  try {
    console.log('📱 访问应用...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('✅ 页面加载完成');

    // 点击"教师"快捷登录按钮
    console.log('👨‍🏫 点击教师登录按钮...');
    await page.click('button:has-text("教师")');
    await page.waitForTimeout(3000);
    console.log('✅ 教师登录成功');

    // 点击侧边栏的"教学中心"
    console.log('📚 点击"教学中心"...');
    const teachingCenterLink = await page.locator('a:has-text("教学中心")').first();
    if (await teachingCenterLink.isVisible()) {
      await teachingCenterLink.click();
      await page.waitForTimeout(5000);
      console.log('✅ 教学中心页面加载完成');
    } else {
      console.log('⚠️ 教学中心链接不可见，尝试其他方式...');
      await page.goto('http://localhost:5173/teacher-center/teaching', { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
    }

    // 检查页面状态
    const title = await page.title();
    console.log('📄 页面标题:', title);

    // 等待页面完全加载
    await page.waitForTimeout(2000);

    // 检查控制台错误
    console.log('\n📊 控制台消息统计:');
    console.log(`  - 总消息数: ${consoleMessages.length}`);
    console.log(`  - 错误数: ${consoleErrors.length}`);

    if (consoleErrors.length > 0) {
      console.log('\n❌ 控制台错误:');
      consoleErrors.forEach((err, i) => {
        console.log(`  ${i + 1}. ${err}`);
      });
    } else {
      console.log('\n✅ 无控制台错误');
    }

    // 检查页面内容
    const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
    console.log('\n📋 页面内容预览:');
    console.log(bodyText);

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    await browser.close();
    console.log('\n🎉 测试完成');
  }
}

testTeachingCenter().catch(console.error);
