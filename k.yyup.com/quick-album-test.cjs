const { chromium } = require('playwright');

async function quickAlbumTest() {
  console.log('快速访问相册中心测试...');
  let browser;

  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    // 直接访问媒体中心页面
    console.log('访问媒体中心页面...');
    await page.goto('http://localhost:5173/media-center', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    // 截图保存
    await page.screenshot({ path: 'media-center-page.png', fullPage: true });
    console.log('已保存媒体中心页面截图: media-center-page.png');

    // 获取页面文本内容
    const pageText = await page.textContent('body');
    console.log('\n页面内容长度:', pageText.length);

    // 查找统计数据
    const statsElements = await page.$$eval('[class*="stat"], [class*="count"], [class*="number"], .el-statistic', elements =>
      elements.map(el => ({
        text: el.textContent?.trim(),
        class: el.className
      }))
    );
    console.log('\n找到的统计元素:', statsElements.length);
    statsElements.forEach((el, i) => {
      console.log(`  ${i+1}. ${el.text} (class: ${el.class.substring(0, 50)})`);
    });

    // 查找所有卡片元素
    const cardElements = await page.$$eval('.card, [class*="card"], .stat-card, [class*="stat-card"]', elements =>
      elements.map(el => ({
        text: el.textContent?.trim().substring(0, 100),
        class: el.className
      }))
    );
    console.log('\n找到的卡片元素:', cardElements.length);
    cardElements.forEach((el, i) => {
      console.log(`  ${i+1}. ${el.text} (class: ${el.class.substring(0, 50)})`);
    });

    // 查找包含数字的元素
    const numberElements = await page.$$eval('*', elements =>
      elements
        .filter(el => {
          const text = el.textContent?.trim();
          return text && /\d+/.test(text) && el.children.length === 0; // 只取叶子节点
        })
        .map(el => ({
          text: el.textContent?.trim(),
          tag: el.tagName,
          class: el.className
        }))
        .filter((el, i, arr) => arr.findIndex(x => x.text === el.text) === i) // 去重
        .slice(0, 20) // 只取前20个
    );
    console.log('\n包含数字的元素:');
    numberElements.forEach((el, i) => {
      if (el.text.length < 100) {
        console.log(`  ${i+1}. [${el.tag}] ${el.text}`);
      }
    });

    // 检查是否有错误信息
    const hasError = await page.$$eval('.error, .error-message, [class*="error"]', els =>
      els.map(el => el.textContent?.trim())
    );
    if (hasError.length > 0) {
      console.log('\n发现错误信息:');
      hasError.forEach((err, i) => {
        console.log(`  ${i+1}. ${err}`);
      });
    }

    // 检查是否有加载状态
    const hasLoading = await page.$$eval('.loading, [class*="loading"]', els =>
      els.map(el => el.textContent?.trim())
    );
    if (hasLoading.length > 0) {
      console.log('\n发现加载状态:');
      hasLoading.forEach((load, i) => {
        console.log(`  ${i+1}. ${load}`);
      });
    }

  } catch (error) {
    console.error('测试失败:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

quickAlbumTest().then(() => {
  console.log('\n测试完成');
}).catch(error => {
  console.error('测试失败:', error);
});