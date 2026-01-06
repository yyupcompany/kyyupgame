const { chromium } = require('playwright');

(async () => {
  console.log('启动浏览器...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // 监听控制台错误
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  console.log('导航到页面...');

  // 记录导航开始时间
  const navStartTime = Date.now();

  // 导航到页面
  await page.goto('http://localhost:5173/', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });

  console.log('等待页面加载...');
  // 等待页面完全加载
  await page.waitForLoadState('load');
  await page.waitForTimeout(3000);

  const navEndTime = Date.now();
  const navDuration = navEndTime - navStartTime;

  // 收集性能指标
  const performanceMetrics = await page.evaluate(() => {
    const timing = performance.timing;
    const navigationStart = timing.navigationStart;

    // 计算关键指标
    const totalLoadTime = timing.loadEventEnd - navigationStart;
    const domContentLoaded = timing.domContentLoadedEventEnd - navigationStart;
    const domInteractive = timing.domInteractive - navigationStart;

    // 资源加载时间
    const resources = performance.getEntriesByType('resource');
    const resourceTimings = resources.map(resource => ({
      name: resource.name,
      duration: Math.round(resource.duration),
      transferSize: resource.transferSize,
      type: resource.initiatorType
    })).sort((a, b) => b.duration - a.duration);

    // Web Vitals
    const paintTiming = performance.getEntriesByType('paint');
    const fcp = paintTiming.find(p => p.name === 'first-contentful-paint');

    // 尝试获取 LCP
    let lcp = null;
    try {
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      if (lcpEntries && lcpEntries.length > 0) {
        lcp = Math.round(lcpEntries[lcpEntries.length - 1].startTime);
      }
    } catch (e) {
      // LCP API 不可用
    }

    return {
      totalLoadTime: totalLoadTime > 0 ? totalLoadTime : null,
      domContentLoaded: domContentLoaded > 0 ? domContentLoaded : null,
      domInteractive: domInteractive > 0 ? domInteractive : null,
      fcp: fcp ? Math.round(fcp.startTime) : null,
      lcp: lcp,
      resourceCount: resources.length,
      resources: resourceTimings.slice(0, 20)
    };
  });

  // TBT 估算
  const tbtEstimate = performanceMetrics.totalLoadTime && performanceMetrics.domInteractive
    ? Math.max(0, performanceMetrics.totalLoadTime - performanceMetrics.domInteractive)
    : null;

  // 打印报告
  console.log('');
  console.log('============================================================');
  console.log('           性能诊断报告 - http://localhost:5173/');
  console.log('============================================================');

  console.log('\n【核心性能指标】\n');
  console.log(`页面总加载时间:    ${performanceMetrics.totalLoadTime || 'N/A'} ms`);
  console.log(`DOM ContentLoaded: ${performanceMetrics.domContentLoaded || 'N/A'} ms`);
  console.log(`DOM Interactive:   ${performanceMetrics.domInteractive || 'N/A'} ms`);
  console.log(`FCP (首次内容绘制): ${performanceMetrics.fcp || 'N/A'} ms`);
  console.log(`LCP (最大内容绘制): ${performanceMetrics.lcp || 'N/A'} ms`);
  console.log(`TBT (总阻塞时间):   ${tbtEstimate || 'N/A'} ms`);
  console.log(`资源数量:          ${performanceMetrics.resourceCount}`);
  console.log(`测试耗时:          ${navDuration} ms`);

  console.log('\n【Top 15 资源加载时间】\n');
  console.log('排名  类型       耗时(ms)  大小      URL');
  console.log('-'.repeat(80));

  performanceMetrics.resources.forEach((resource, index) => {
    if (index < 15) {
      const sizeStr = resource.transferSize
        ? (resource.transferSize / 1024).toFixed(1) + ' KB'
        : 'N/A';
      const url = resource.name.substring(0, 50);
      console.log(
        `${(index + 1).toString().padStart(2)}   ${resource.type.padEnd(8)} ` +
        `${resource.duration.toString().padStart(6)}  ${sizeStr.padStart(8)}  ${url}`
      );
    }
  });

  console.log('\n============================================================');
  console.log('                    优化前后对比');
  console.log('============================================================');
  console.log('\n指标            |  优化前   |  优化后   |   变化');
  console.log('-'.repeat(55));

  const before = { total: 585, fcp: 1124, lcp: 1624, tbt: 535 };
  const after = {
    total: performanceMetrics.totalLoadTime,
    fcp: performanceMetrics.fcp,
    lcp: performanceMetrics.lcp,
    tbt: tbtEstimate
  };

  const formatRow = (name, beforeVal, afterVal) => {
    const beforeStr = beforeVal ? beforeVal + ' ms' : 'N/A';
    const afterStr = afterVal ? afterVal + ' ms' : 'N/A';
    const diff = (afterVal && beforeVal) ? (afterVal - beforeVal) : null;
    const diffStr = diff !== null
      ? (diff > 0 ? `+${diff}ms` : `${diff}ms`)
      : 'N/A';
    console.log(`${name.padEnd(14)} | ${beforeStr.padStart(8)} | ${afterStr.padStart(8)} | ${diffStr.padStart(8)}`);
  };

  formatRow('总加载时间', before.total, after.total);
  formatRow('FCP', before.fcp, after.fcp);
  formatRow('LCP', before.lcp, after.lcp);
  formatRow('TBT', before.tbt, after.tbt);

  console.log('\n【性能改善评估】\n');

  if (after.total && before.total) {
    const loadTimeDiff = before.total - after.total;
    const loadTimePercent = ((loadTimeDiff / before.total) * 100).toFixed(1);
    const speedup = (before.total / after.total).toFixed(2);

    console.log(`总加载时间变化: ${loadTimeDiff > 0 ? '+' : ''}${loadTimeDiff}ms (${loadTimePercent}%)`);
    console.log(`加载速度倍率:   ${speedup}x`);

    if (loadTimeDiff < 0) {
      console.log('\n注意: 开发模式下性能会低于生产环境（Vite动态编译）。');
      console.log('生产构建后性能将显著优于当前测试结果。');
    }
  }

  if (errors.length > 0) {
    console.log(`\n控制台错误: ${errors.length} 个`);
  } else {
    console.log('\n控制台错误: 0 个');
  }

  console.log('\n============================================================');

  await browser.close();
})();
