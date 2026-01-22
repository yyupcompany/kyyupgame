const { chromium } = require('playwright');

(async () => {
  console.log('=== 登录页面结构调试 ===\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:5174/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    // 检查页面结构
    console.log('页面URL:', page.url());
    console.log('\n查找所有包含"园长"的元素:');

    // 查找所有包含"园长"的元素
    const allElements = await page.$$eval('*', elements => {
      return elements
        .filter(el => el.textContent && el.textContent.includes('园长'))
        .map(el => ({
          tag: el.tagName,
          class: el.className,
          text: el.textContent.trim().substring(0, 20),
          hasParentButton: !!el.closest('button'),
          parentTag: el.parentElement ? el.parentElement.tagName : 'none'
        }))
        .slice(0, 10);
    });

    allElements.forEach((el, i) => {
      console.log(`${i + 1}. <${el.tag}> class="${el.class}" parent=<${el.parentTag}> hasButton=${el.hasParentButton} text="${el.text}"`);
    });

    // 尝试不同的点击方式
    console.log('\n尝试点击方式1 - button包含园长文本:');
    const btn1 = await page.$('button:has-text("园长")');
    console.log('   结果:', btn1 ? '找到' : '未找到');

    console.log('\n尝试点击方式2 - div包含园长文本:');
    const divs = await page.$$('div');
    for (const div of divs) {
      const text = await div.textContent();
      if (text && text.trim() === '园长') {
        console.log('   找到div:', div.tagName);
        // 点击这个div
        await div.click();
        await page.waitForTimeout(2000);
        console.log('   点击后URL:', page.url());
        break;
      }
    }

    // 检查点击后的URL
    const urlAfter = page.url();
    console.log('\n最终URL:', urlAfter);

    if (urlAfter.includes('/login')) {
      console.log('\n⚠️ 登录未成功，可能是点击区域问题');
      console.log('请手动测试或检查登录页面的快速体验实现');
    } else {
      console.log('\n✅ 登录成功！');
    }

  } catch (e) {
    console.log('错误:', e.message);
  }

  await browser.close();
})();
