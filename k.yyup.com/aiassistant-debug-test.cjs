/**
 * AI助手页面调试测试
 * 直接检查页面HTML内容和JavaScript错误
 */

const { chromium } = require('playwright');

(async () => {
  console.log('🔍 开始AI助手页面调试测试...\n');

  const browser = await chromium.launch({
    headless: true,
    devtools: false
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // 收集所有控制台日志和网络错误
  const logs = [];
  page.on('console', msg => {
    logs.push(`[${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', error => {
    logs.push(`[PAGE_ERROR] ${error.message}`);
  });

  page.on('requestfailed', request => {
    logs.push(`[REQUEST_FAILED] ${request.method()} ${request.url()} - ${request.failure().errorText}`);
  });

  try {
    // 1. 访问AI助手页面（无需登录）
    console.log('📍 步骤1: 访问AI助手页面');
    await page.goto('http://localhost:5173/aiassistant', {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });

    // 等待一下让页面完全加载
    await page.waitForTimeout(3000);

    console.log('✅ 页面加载完成\n');

    // 2. 检查当前URL
    const url = page.url();
    console.log('📍 步骤2: 当前URL:', url, '\n');

    // 3. 检查页面HTML
    console.log('📍 步骤3: 检查页面HTML');
    const html = await page.content();
    console.log('HTML长度:', html.length);

    // 4. 检查是否有重定向到登录页
    if (html.includes('login') || url.includes('login')) {
      console.log('⚠️ 页面被重定向到登录页，需要先登录\n');
    } else {
      console.log('✅ 页面未重定向到登录页\n');
    }

    // 5. 检查页面标题
    console.log('📍 步骤4: 检查页面标题');
    const title = await page.title();
    console.log('页面标题:', title, '\n');

    // 6. 检查body内容
    console.log('📍 步骤5: 检查body内容');
    const bodyText = await page.textContent('body');
    console.log('body文本长度:', bodyText.length);
    console.log('body前200字符:', bodyText.substring(0, 200), '\n');

    // 7. 检查是否有Vue应用
    console.log('📍 步骤6: 检查Vue应用');
    const hasVue = await page.evaluate(() => {
      return !!window.Vue || !!document.querySelector('#app') || !!document.querySelector('.v-application');
    });
    console.log('是否有Vue应用:', hasVue, '\n');

    // 8. 检查关键元素
    console.log('📍 步骤7: 检查关键元素');
    const elements = await page.evaluate(() => {
      const selectors = [
        '.ai-assistant-page',
        '.sidebar',
        '.page-container',
        '.page-header',
        '.main-content',
        '.message-card',
        '.input-card',
        '#app'
      ];

      const results = {};
      selectors.forEach(sel => {
        const el = document.querySelector(sel);
        results[sel] = {
          exists: !!el,
          text: el ? el.textContent.substring(0, 100) : null,
          visible: el ? el.offsetParent !== null : false
        };
      });

      return results;
    });

    console.log('关键元素检查:');
    console.log(JSON.stringify(elements, null, 2), '\n');

    // 9. 截图
    console.log('📍 步骤8: 截图');
    await page.screenshot({
      path: '/home/zhgue/kyyupgame/k.yyup.com/aiassistant-debug.png',
      fullPage: true
    });
    console.log('✅ 调试截图已保存: aiassistant-debug.png\n');

    // 10. 打印控制台日志
    console.log('📍 步骤9: 控制台日志');
    if (logs.length > 0) {
      logs.forEach(log => console.log('  ', log));
      console.log('');
    } else {
      console.log('✅ 没有控制台错误\n');
    }

    // 11. 检查网络请求
    console.log('📍 步骤10: 检查网络请求');
    const responses = [];
    page.on('response', response => {
      if (response.url().includes('/aiassistant') || response.url().includes('ai-assistant')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          ok: response.ok()
        });
      }
    });

    await page.waitForTimeout(2000);

    if (responses.length > 0) {
      console.log('相关网络请求:');
      responses.forEach(resp => console.log('  ', resp));
      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 AI助手页面调试测试完成！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);

    // 尝试截图错误页面
    try {
      await page.screenshot({
        path: '/home/zhgue/kyyupgame/k.yyup.com/aiassistant-debug-error.png',
        fullPage: true
      });
      console.log('✅ 错误截图已保存\n');
    } catch (screenshotError) {
      console.error('截图失败:', screenshotError.message);
    }

    // 打印错误堆栈
    if (error.stack) {
      console.error('错误堆栈:', error.stack, '\n');
    }
  } finally {
    await browser.close();
  }
})();
