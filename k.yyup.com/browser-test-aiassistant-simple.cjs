/**
 * 简单浏览器测试 - 直接测试AI助手页面可访问性
 */

const puppeteer = require('puppeteer');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  console.log('🚀 简单测试 AI助手页面可访问性');
  console.log('='.repeat(60));

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    console.log('\n📍 步骤 1: 直接访问AI助手页面');
    await page.goto('http://localhost:5173/aiassistant', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(3000);

    console.log('\n📋 页面访问测试结果');
    console.log('-'.repeat(60));

    // 1. 检查当前URL
    const currentUrl = page.url();
    console.log(`✅ 当前URL: ${currentUrl}`);

    // 2. 检查页面标题
    const title = await page.title();
    console.log(`✅ 页面标题: ${title}`);

    // 3. 检查是否重定向到登录页
    if (currentUrl.includes('/login')) {
      console.log('⚠️  页面重定向到登录页，需要登录认证');
    } else if (currentUrl.includes('/aiassistant')) {
      console.log('✅ 页面成功访问AI助手路由');

      // 4. 检查Vue组件是否挂载
      const vueMounted = await page.evaluate(() => {
        const app = document.querySelector('#app');
        return app && app.innerHTML.length > 100;
      });
      console.log(`✅ Vue应用已挂载: ${vueMounted}`);

      // 5. 检查是否有错误信息
      const errorMsg = await page.$('.error-message, .unauthorized, .login-required');
      if (errorMsg) {
        console.log('⚠️  页面显示错误/未登录信息');
      } else {
        console.log('✅ 无明显错误信息');
      }

      // 6. 查找任何AI相关元素
      const aiElements = await page.evaluate(() => {
        const selectors = [
          '.ai-assistant',
          '.ai-assistant-container',
          '[data-testid*="ai"]',
          '[class*="ai-assistant"]',
          '.top-bar',
          '.sidebar',
          '.chat-container'
        ];
        const found = [];
        selectors.forEach(sel => {
          const el = document.querySelector(sel);
          if (el) found.push(sel);
        });
        return found;
      });

      if (aiElements.length > 0) {
        console.log(`✅ 找到 ${aiElements.length} 个AI相关元素:`);
        aiElements.forEach(el => console.log(`   - ${el}`));
      } else {
        console.log('⚠️  未找到AI助手相关元素（可能需要登录）');
      }
    }

    // 7. 页面内容快照
    console.log('\n📄 页面内容快照:');
    console.log('-'.repeat(60));
    const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 300));
    console.log(bodyText);

    // 8. 检查控制台错误
    console.log('\n🚨 控制台错误:');
    console.log('-'.repeat(60));
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    await sleep(1000);

    if (errors.length > 0) {
      console.log(`⚠️  发现 ${errors.length} 个错误:`);
      errors.slice(0, 3).forEach((err, i) => {
        console.log(`   ${i + 1}. ${err.substring(0, 100)}`);
      });
    } else {
      console.log('✅ 无控制台错误');
    }

    // 9. 截图
    console.log('\n📸 截图:');
    console.log('-'.repeat(60));
    const screenshotPath = '/home/zhgue/kyyupgame/k.yyup.com/aiassistant-simple-test.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`✅ 截图已保存: ${screenshotPath}`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ 简单测试完成！');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
  } finally {
    if (browser) await browser.close();
  }
})();
