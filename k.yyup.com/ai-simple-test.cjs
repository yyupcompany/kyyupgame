const puppeteer = require('puppeteer');

async function simpleTest() {
  console.log('🎯 开始简单AI功能测试');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // 1. 访问前端
    console.log('🌐 访问前端页面...');
    await page.goto('http://localhost:5173', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    console.log('✅ 页面加载成功');

    // 2. 获取页面标题
    const title = await page.title();
    console.log('页面标题:', title);

    // 3. 查找所有按钮
    const buttons = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).map(btn => ({
        text: btn.textContent?.trim(),
        className: btn.className
      }));
    });

    console.log('找到的按钮:', buttons.length);
    buttons.forEach((btn, index) => {
      console.log(`  ${index + 1}. "${btn.text}"`);
    });

    // 4. 查找AI相关元素
    const aiElements = await page.evaluate(() => {
      const elements = [];
      const allElements = document.querySelectorAll('*');

      allElements.forEach(el => {
        const text = el.textContent?.trim() || '';
        const className = el.className || '';
        const id = el.id || '';

        if (text.includes('AI') || text.includes('智能') || text.includes('助手') ||
            className.toLowerCase().includes('ai') || id.toLowerCase().includes('ai')) {
          elements.push({
            tag: el.tagName,
            text: text.substring(0, 50),
            className: className.substring(0, 100)
          });
        }
      });

      return elements;
    });

    console.log('找到的AI元素:', aiElements.length);
    aiElements.forEach((el, index) => {
      console.log(`  ${index + 1}. [${el.tag}] ${el.text}`);
    });

    console.log('✅ 测试完成');
    return true;

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

simpleTest().then(success => {
  console.log('\n📋 测试结果:', success ? '成功' : '失败');
  process.exit(success ? 0 : 1);
});