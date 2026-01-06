const { chromium } = require('playwright');

async function diagnosePagePerformance() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const report = {
    timestamp: new Date().toISOString(),
    url: 'http://localhost:5173/',
    metrics: {},
    components: {},
    resources: [],
    bottlenecks: [],
    recommendations: []
  };

  try {
    // 监听所有网络请求
    const requests = [];
    page.on('request', (request) => {
      requests.push({
        url: request.url(),
        method: request.method(),
        startTime: Date.now()
      });
    });

    page.on('response', (response) => {
      const req = requests.find(r => r.url === response.url());
      if (req) {
        req.endTime = Date.now();
        req.status = response.status();
        req.type = response.request().resourceType();
      }
    });

    // 收集性能指标
    await page.goto(report.url, { waitUntil: 'networkidle', timeout: 60000 });

    // 使用 performance API 获取详细指标
    const performanceData = await page.evaluate(() => {
      const timing = performance.timing;
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      const resources = performance.getEntriesByType('resource');

      // 计算关键指标
      const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
      const domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
      const domInteractive = timing.domInteractive - timing.navigationStart;
      const firstPaint = paint.find(p => p.name === 'first-paint');
      const firstContentfulPaint = paint.find(p => p.name === 'first-contentful-paint');

      // 计算 FCP
      const fcp = firstContentfulPaint ? firstContentfulPaint.startTime : 0;

      // 估算 LCP（通过检查 LCP 元素）
      let lcpTime = 0;
      const lcpEntry = performance.getEntriesByType('largest-contentful-paint')[0];
      if (lcpEntry) {
        lcpTime = lcpEntry.startTime;
      }

      // 估算 TTI
      const tti = timing.domInteractive - timing.navigationStart;

      // 计算 TBT（简化估算）
      const tbt = timing.domContentLoadedEventEnd - timing.domInteractive;

      return {
        pageLoadTime,
        domContentLoaded,
        domInteractive,
        fcp,
        lcpTime: lcpTime || fcp + 500, // 如果没有 LCP API，使用估算
        tti,
        tbt: Math.max(0, tbt),
        ttfb: timing.responseStart - timing.requestStart,
        serverConnect: timing.connectEnd - timing.connectStart,
        domComplete: timing.domComplete - timing.navigationStart
      };
    });

    report.metrics = {
      pageLoadTime: performanceData.pageLoadTime,
      ttfb: performanceData.ttfb,
      serverConnect: performanceData.serverConnect,
      domInteractive: performanceData.domInteractive,
      domContentLoaded: performanceData.domContentLoaded,
      domComplete: performanceData.domComplete,
      fcp: performanceData.fcp,
      lcp: performanceData.lcpTime,
      tti: performanceData.tti,
      tbt: performanceData.tbt
    };

    // 分析 Vue 组件
    const componentAnalysis = await page.evaluate(() => {
      const components = [];

      // 尝试检测 Vue 组件
      if (window.__vueApp__) {
        // Vue 3
        const app = window.__vueApp__;
        components.push({
          version: 3,
          name: 'Vue 3 App'
        });
      }

      if (window.Vue) {
        components.push({
          version: window.Vue.version,
          name: 'Vue ' + window.Vue.version.charAt(0)
        });
      }

      // 统计 DOM 元素数量
      const elementCount = {
        total: document.querySelectorAll('*').length,
        divs: document.querySelectorAll('div').length,
        scripts: document.querySelectorAll('script').length,
        styles: document.querySelectorAll('style, link[rel="stylesheet"]').length,
        images: document.querySelectorAll('img').length,
        iframes: document.querySelectorAll('iframe').length,
        components: document.querySelectorAll('[class*="vue"], [class*="component"]').length
      };

      // 检查大文件
      const scripts = Array.from(document.querySelectorAll('script[src]'))
        .map(s => s.src)
        .filter(s => s);

      const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
        .map(s => s.href)
        .filter(s => s);

      const images = Array.from(document.querySelectorAll('img[src]'))
        .map(img => ({
          src: img.src,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight
        }))
        .filter(img => img.src);

      return {
        detected: components,
        elementCount,
        scripts,
        styles,
        images,
        largeImages: images.filter(img =>
          img.naturalWidth > 1000 || img.naturalHeight > 1000
        )
      };
    });

    report.components = componentAnalysis;

    // 分析资源加载情况
    report.resources = requests.map(req => ({
      url: req.url,
      method: req.method,
      status: req.status || 'pending',
      type: req.type || 'unknown',
      duration: req.endTime && req.startTime ? req.endTime - req.startTime : 0
    })).sort((a, b) => b.duration - a.duration);

    // 识别瓶颈
    const metrics = report.metrics;

    if (metrics.ttfb > 2000) {
      report.bottlenecks.push({
        type: 'TTFB',
        severity: 'high',
        message: `TTFB (首字节时间) 过长: ${metrics.ttfb}ms`,
        suggestion: '考虑优化服务器响应速度或使用 CDN'
      });
    }

    if (metrics.fcp > 3000) {
      report.bottlenecks.push({
        type: 'FCP',
        severity: 'high',
        message: `FCP (首次内容绘制) 过长: ${metrics.fcp}ms`,
        suggestion: '减少首屏渲染需要的 JavaScript/CSS 负载，或使用代码分割'
      });
    }

    if (metrics.lcp > 4000) {
      report.bottlenecks.push({
        type: 'LCP',
        severity: 'high',
        message: `LCP (最大内容绘制) 过长: ${metrics.lcp}ms`,
        suggestion: '优化大图片加载，预加载关键资源'
      });
    }

    if (metrics.tbt > 500) {
      report.bottlenecks.push({
        type: 'TBT',
        severity: 'medium',
        message: `TBT (总阻塞时间) 过长: ${metrics.tbt}ms`,
        suggestion: '减少主线程阻塞操作，拆分长任务'
      });
    }

    if (componentAnalysis.elementCount.scripts > 20) {
      report.bottlenecks.push({
        type: 'Scripts',
        severity: 'medium',
        message: `脚本数量过多: ${componentAnalysis.elementCount.scripts} 个`,
        suggestion: '考虑合并脚本或使用按需加载'
      });
    }

    // 生成优化建议
    report.recommendations = [
      {
        priority: 'high',
        action: '优化 TTFB',
        detail: '后端响应时间过长，考虑优化数据库查询、增加缓存'
      },
      {
        priority: 'high',
        action: '优化首屏渲染',
        detail: 'FCP 超过 3 秒，考虑减少 JavaScript 负载或使用服务端渲染'
      },
      {
        priority: 'medium',
        action: '图片优化',
        detail: `检测到 ${componentAnalysis.images.length} 张图片，${componentAnalysis.largeImages.length} 张大图片`,
        suggestion: '使用 WebP 格式、懒加载、响应式图片'
      },
      {
        priority: 'medium',
        action: '资源合并',
        detail: `检测到 ${componentAnalysis.scripts.length} 个脚本，考虑合并或按需加载`
      },
      {
        priority: 'medium',
        action: 'CSS 优化',
        detail: `检测到 ${componentAnalysis.styles.length} 个样式表`,
        suggestion: '考虑使用 CSS-in-JS 或关键 CSS 内联'
      }
    ];

    // 时间分布分析
    report.timeDistribution = {
      serverResponse: metrics.ttfb,
      domConstruction: metrics.domInteractive - metrics.ttfb,
      resourceLoading: metrics.fcp - metrics.domInteractive,
      pageReady: metrics.pageLoadTime - metrics.fcp
    };

  } catch (error) {
    report.error = error.message;
  } finally {
    await browser.close();
  }

  return report;
}

// 运行诊断并输出报告
diagnosePagePerformance()
  .then(report => {
    console.log('\n' + '='.repeat(80));
    console.log('           页面性能诊断报告');
    console.log('='.repeat(80));
    console.log(`\n诊断时间: ${report.timestamp}`);
    console.log(`诊断URL: ${report.url}`);

    if (report.error) {
      console.log(`\n错误: ${report.error}`);
      return;
    }

    console.log('\n' + '-'.repeat(40));
    console.log('一、关键性能指标');
    console.log('-'.repeat(40));
    console.log(`  总页面加载时间:      ${report.metrics.pageLoadTime}ms`);
    console.log(`  TTFB (首字节时间):   ${report.metrics.ttfb}ms`);
    console.log(`  FCP (首次内容绘制):  ${report.metrics.fcp}ms`);
    console.log(`  LCP (最大内容绘制):  ${report.metrics.lcp}ms`);
    console.log(`  TTI (可交互时间):    ${report.metrics.tti}ms`);
    console.log(`  TBT (总阻塞时间):    ${report.metrics.tbt}ms`);
    console.log(`  DOM 可交互时间:      ${report.metrics.domInteractive}ms`);
    console.log(`  DOM 内容加载完成:    ${report.metrics.domContentLoaded}ms`);

    console.log('\n' + '-'.repeat(40));
    console.log('二、时间分布分析');
    console.log('-'.repeat(40));
    const dist = report.timeDistribution;
    console.log(`  服务器响应时间:      ${dist.serverResponse}ms (${((dist.serverResponse/report.metrics.pageLoadTime)*100).toFixed(1)}%)`);
    console.log(`  DOM 构建时间:        ${dist.domConstruction}ms (${((dist.domConstruction/report.metrics.pageLoadTime)*100).toFixed(1)}%)`);
    console.log(`  资源加载时间:        ${dist.resourceLoading}ms (${((dist.resourceLoading/report.metrics.pageLoadTime)*100).toFixed(1)}%)`);
    console.log(`  页面就绪时间:        ${dist.pageReady}ms (${((dist.pageReady/report.metrics.pageLoadTime)*100).toFixed(1)}%)`);

    console.log('\n' + '-'.repeat(40));
    console.log('三、组件分析');
    console.log('-'.repeat(40));
    const comp = report.components;
    console.log(`  Vue 版本:           ${comp.detected.map(d => d.version).join(', ') || '未检测到'}`);
    console.log(`  DOM 元素总数:       ${comp.elementCount.total}`);
    console.log(`  DIV 元素数量:       ${comp.elementCount.divs}`);
    console.log(`  脚本数量:           ${comp.elementCount.scripts}`);
    console.log(`  样式表数量:         ${comp.elementCount.styles}`);
    console.log(`  图片数量:           ${comp.elementCount.images}`);
    console.log(`  Iframe 数量:        ${comp.elementCount.iframes}`);

    console.log('\n' + '-'.repeat(40));
    console.log('四、检测到的性能瓶颈');
    console.log('-'.repeat(40));
    if (report.bottlenecks.length === 0) {
      console.log('  未发现明显性能瓶颈');
    } else {
      report.bottlenecks.forEach((b, i) => {
        console.log(`  ${i + 1}. [${b.severity.toUpperCase()}] ${b.type}`);
        console.log(`     ${b.message}`);
        console.log(`     建议: ${b.suggestion}`);
      });
    }

    console.log('\n' + '-'.repeat(40));
    console.log('五、优化建议');
    console.log('-'.repeat(40));
    report.recommendations.forEach((r, i) => {
      console.log(`  ${i + 1}. [${r.priority.toUpperCase()}] ${r.action}`);
      console.log(`     ${r.detail}`);
      if (r.suggestion) console.log(`     ${r.suggestion}`);
    });

    console.log('\n' + '-'.repeat(40));
    console.log('六、加载最慢的资源 (Top 10)');
    console.log('-'.repeat(40));
    report.resources.slice(0, 10).forEach((r, i) => {
      const url = r.url.length > 60 ? r.url.substring(0, 60) + '...' : r.url;
      console.log(`  ${i + 1}. [${r.status}] ${r.duration}ms - ${url}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('                    诊断报告结束');
    console.log('='.repeat(80) + '\n');
  })
  .catch(console.error);
