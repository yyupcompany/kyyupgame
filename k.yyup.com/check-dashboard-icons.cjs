const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    devtools: false
  });

  const page = await browser.newPage();

  // 监听控制台消息
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
  });

  // 监听页面错误
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.message);
  });

  console.log('正在访问 http://localhost:5173/dashboard...');
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle', timeout: 30000 });

  // 等待页面加载完成
  await page.waitForTimeout(3000);

  // 检查图标元素
  const iconElements = await page.$$eval('[class*="icon"], svg, i[class*="icon"], .el-icon', (elements) => {
    return elements.map(el => ({
      tagName: el.tagName,
      className: el.className,
      innerHTML: el.innerHTML.substring(0, 100),
      hasContent: el.innerHTML.trim().length > 0,
      computedStyle: window.getComputedStyle(el)
    }));
  });

  // 检查Vue组件是否正确渲染
  const vueWarnings = consoleMessages.filter(msg =>
    msg.text.includes('Vue') ||
    msg.text.includes('currentColor') ||
    msg.text.includes('icon') ||
    msg.text.includes('警告') ||
    msg.text.includes('warning')
  );

  // 截图
  await page.screenshot({
    path: '/tmp/dashboard_icons_after_fix.png',
    fullPage: true
  });

  console.log('=== 图标检查结果 ===');
  console.log(`总图标元素数量: ${iconElements.length}`);
  console.log(`有效图标数量: ${iconElements.filter(icon => icon.hasContent).length}`);
  console.log(`空图标数量: ${iconElements.filter(icon => !icon.hasContent).length}`);

  console.log('\n=== 控制台消息 ===');
  consoleMessages.forEach(msg => {
    console.log(`[${msg.type}] ${msg.text}`);
  });

  console.log('\n=== Vue警告信息 ===');
  vueWarnings.forEach(warning => {
    console.log(`[Vue Warning] ${warning.text}`);
  });

  console.log('\n=== 页面错误 ===');
  if (pageErrors.length > 0) {
    pageErrors.forEach(error => console.log(`[Error] ${error}`));
  } else {
    console.log('无页面错误');
  }

  await browser.close();
  console.log('\n✅ 检查完成，截图已保存到 /tmp/dashboard_icons_after_fix.png');
})();
