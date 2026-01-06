// 单页面快速测试脚本
import { chromium } from 'playwright';
import fs from 'fs';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('📋 用法: node test-single-page.mjs <页面名称> [页面URL]');
  console.log('');
  console.log('支持的页面:');
  console.log('  business        /centers/business');
  console.log('  activity        /centers/activity');
  console.log('  script          /centers/script');
  console.log('  system          /centers/system');
  console.log('  analytics       /centers/analytics');
  console.log('  finance         /centers/finance');
  console.log('  marketing       /centers/marketing');
  console.log('  personnel       /centers/personnel');
  console.log('  call            /centers/call');
  console.log('  customer        /centers/customer');
  console.log('  teaching        /centers/teaching');
  console.log('  inspection      /centers/inspection');
  console.log('  media           /centers/media');
  console.log('  attendance      /centers/attendance');
  console.log('  task            /centers/task');
  console.log('  enrollment      /centers/enrollment');
  console.log('  assessment      /centers/assessment');
  process.exit(0);
}

const pageName = args[0];
const pageUrl = args[1] || getPageUrl(pageName);

function getPageUrl(name) {
  const urlMap = {
    'business': '/centers/business',
    'activity': '/centers/activity',
    'script': '/centers/script',
    'system': '/centers/system',
    'analytics': '/centers/analytics',
    'finance': '/centers/finance',
    'marketing': '/centers/marketing',
    'personnel': '/centers/personnel',
    'call': '/centers/call',
    'customer': '/centers/customer',
    'teaching': '/centers/teaching',
    'inspection': '/centers/inspection',
    'media': '/centers/media',
    'attendance': '/centers/attendance',
    'task': '/centers/task',
    'enrollment': '/centers/enrollment',
    'assessment': '/centers/assessment'
  };
  return urlMap[name] || `/centers/${name}`;
}

(async () => {
  console.log(`🚀 测试单个页面: ${pageName} (${pageUrl})\n`);

  const browser = await chromium.launch({
    headless: true,
    devtools: false
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // 收集控制台消息
  const allErrors = [];
  const allConsoleMsgs = [];

  page.on('console', msg => {
    const text = msg.text();
    allConsoleMsgs.push({
      type: msg.type(),
      text: text,
      timestamp: new Date().toISOString()
    });

    if (msg.type() === 'error') {
      allErrors.push({
        type: 'console',
        text: text,
        timestamp: new Date().toISOString()
      });
    }
  });

  // 收集网络错误
  page.on('response', response => {
    if (!response.ok()) {
      allErrors.push({
        type: 'network',
        url: response.url(),
        status: response.status(),
        timestamp: new Date().toISOString()
      });
    }
  });

  try {
    const startTime = Date.now();

    // 访问页面
    const response = await page.goto(`http://localhost:5173${pageUrl}`, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    const status = response.status();
    console.log(`  ✅ HTTP状态码: ${status}`);

    // 等待页面加载
    await page.waitForTimeout(2000);

    // 检查页面内容
    const bodyText = await page.textContent('body');
    const has404Text = bodyText.includes('404') || bodyText.includes('Not Found');
    const hasApp = await page.$('#app') !== null;
    const hasContent = bodyText.trim().length > 0;

    console.log(`  📦 #app元素: ${hasApp ? '存在' : '不存在'}`);
    console.log(`  📄 页面内容: ${hasContent ? '有内容' : '空白'}`);
    console.log(`  ⚠️  包含404文本: ${has404Text ? '是' : '否'}`);

    const loadTime = Date.now() - startTime;
    console.log(`  ⏱️  加载时间: ${loadTime}ms`);

    // 截取页面截图
    await page.screenshot({
      path: `./test-results/single-${pageName}-${Date.now()}.png`
    });

    // 统计错误
    console.log(`  🚨 错误数量: ${allErrors.length} 个`);

    if (allErrors.length > 0) {
      console.log('    错误详情:');
      allErrors.slice(0, 5).forEach((err, index) => {
        if (err.type === 'network') {
          console.log(`      ${index + 1}. [NETWORK ${err.status}] ${err.url}`);
        } else {
          console.log(`      ${index + 1}. [${err.type}] ${err.text}`);
        }
      });
      if (allErrors.length > 5) {
        console.log(`      ... 还有 ${allErrors.length - 5} 个错误`);
      }
    }

    // 保存单页报告
    const report = {
      timestamp: new Date().toISOString(),
      page: {
        name: pageName,
        url: pageUrl,
        status: status,
        has404Text: has404Text,
        hasApp: hasApp,
        hasContent: hasContent,
        loadTime: loadTime
      },
      errors: allErrors,
      consoleMessages: allConsoleMsgs
    };

    if (!fs.existsSync('./test-results')) {
      fs.mkdirSync('./test-results');
    }

    fs.writeFileSync(
      `./test-results/single-${pageName}-report.json`,
      JSON.stringify(report, null, 2)
    );

    console.log(`\n📄 详细报告已保存到 ./test-results/single-${pageName}-report.json`);
    console.log(`📸 截图已保存到 ./test-results/single-${pageName}-${Date.now()}.png`);

  } catch (error) {
    console.log(`  ❌ 加载失败: ${error.message}`);
  }

  await browser.close();
})();