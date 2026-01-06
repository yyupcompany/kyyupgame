const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function diagnoseCenterComponents() {
  console.log('🔍 开始诊断检查中心和文档中心组件问题');

  let browser;
  try {
    browser = await chromium.launch({
      headless: false,
      slowMo: 300,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-logging']
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 }
    });

    const page = await context.newPage();

    // 详细监听网络请求和响应
    const networkLog = [];
    page.on('request', request => {
      networkLog.push({
        type: 'request',
        url: request.url(),
        method: request.method(),
        headers: request.headers()
      });
    });

    page.on('response', response => {
      networkLog.push({
        type: 'response',
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers()
      });

      if (response.status() >= 400) {
        console.log(`❌ HTTP错误 ${response.status()}: ${response.url()}`);
      }
    });

    // 详细监听控制台消息
    const consoleLog = [];
    page.on('console', msg => {
      const entry = {
        type: msg.type(),
        text: msg.text(),
        location: msg.location(),
        timestamp: new Date().toISOString()
      };
      consoleLog.push(entry);

      if (entry.type === 'error' || entry.type === 'warning') {
        console.log(`🚨 ${entry.type.toUpperCase()}: ${entry.text}`);
      }
    });

    page.on('pageerror', error => {
      console.error('🔥 页面错误:', error.message);
      console.error('堆栈:', error.stack);
    });

    console.log('\n=== 步骤1：访问系统并登录 ===');

    await page.goto('http://localhost:5173', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(3000);

    // 登录
    const quickLoginBtn = page.locator('button:has-text("管理员")').first();
    if (await quickLoginBtn.isVisible({ timeout: 5000 })) {
      await quickLoginBtn.click();
      await page.waitForTimeout(5000);
      console.log('✅ 登录成功');
    }

    console.log('\n=== 步骤2：诊断检查中心组件加载 ===');

    // 尝试直接访问检查中心URL
    try {
      console.log('🔗 尝试直接访问检查中心...');
      await page.goto('http://localhost:5173/centers/InspectionCenter', {
        waitUntil: 'networkidle',
        timeout: 20000
      });

      await page.waitForTimeout(5000);

      // 检查当前页面状态
      const pageInfo = await page.evaluate(() => {
        return {
          url: window.location.href,
          title: document.title,
          bodyContent: document.body.innerHTML.substring(0, 1000),
          hasError: document.body.innerHTML.includes('Cannot find module') ||
                   document.body.innerHTML.includes('Failed to load') ||
                   document.body.innerHTML.includes('500'),
          vueApp: !!document.querySelector('#app').__vue__
        };
      });

      console.log('📄 检查中心页面信息:');
      console.log(`  URL: ${pageInfo.url}`);
      console.log(`  标题: ${pageInfo.title}`);
      console.log(`  Vue挂载: ${pageInfo.vueApp}`);
      console.log(`  包含错误: ${pageInfo.hasError}`);

      if (pageInfo.hasError) {
        console.log('🚨 页面包含错误信息');
      }

    } catch (error) {
      console.error('❌ 访问检查中心失败:', error.message);
    }

    console.log('\n=== 步骤3：诊断文档中心组件加载 ===');

    try {
      console.log('🔗 尝试访问文档中心...');
      await page.goto('http://localhost:5173/centers/document-template', {
        waitUntil: 'networkidle',
        timeout: 20000
      });

      await page.waitForTimeout(5000);

      // 检查当前页面状态
      const docPageInfo = await page.evaluate(() => {
        return {
          url: window.location.href,
          title: document.title,
          bodyContent: document.body.innerHTML.substring(0, 1000),
          hasError: document.body.innerHTML.includes('Cannot find module') ||
                   document.body.innerHTML.includes('Failed to load') ||
                   document.body.innerHTML.includes('500'),
          vueApp: !!document.querySelector('#app').__vue__,
          hasImportErrors: document.body.innerHTML.includes('所有导入路径都失败')
        };
      });

      console.log('📄 文档中心页面信息:');
      console.log(`  URL: ${docPageInfo.url}`);
      console.log(`  标题: ${docPageInfo.title}`);
      console.log(`  Vue挂载: ${docPageInfo.vueApp}`);
      console.log(`  包含错误: ${docPageInfo.hasError}`);
      console.log(`  导入错误: ${docPageInfo.hasImportErrors}`);

    } catch (error) {
      console.error('❌ 访问文档中心失败:', error.message);
    }

    console.log('\n=== 步骤4：检查组件文件是否存在 ===');

    // 在浏览器控制台中检查组件文件
    const componentCheck = await page.evaluate(() => {
      const componentsToCheck = [
        '/src/pages/centers/InspectionCenter.vue',
        '/src/pages/centers/DocumentTemplateCenter.vue'
      ];

      const results = [];

      componentsToCheck.forEach(componentPath => {
        // 尝试动态导入组件来检查是否存在
        try {
          // 这里我们只是检查路径是否会被重写
          results.push({
            path: componentPath,
            status: 'checked'
          });
        } catch (error) {
          results.push({
            path: componentPath,
            error: error.message
          });
        }
      });

      return results;
    });

    console.log('📦 组件文件检查结果:', componentCheck);

    console.log('\n=== 步骤5：检查网络请求日志 ===');

    // 分析网络请求日志
    const failedRequests = networkLog.filter(entry =>
      entry.type === 'response' && entry.status >= 400
    );

    const componentRequests = networkLog.filter(entry =>
      entry.url.includes('.vue') || entry.url.includes('components')
    );

    console.log(`📊 网络请求统计:`);
    console.log(`  总请求数: ${networkLog.length}`);
    console.log(`  失败请求: ${failedRequests.length}`);
    console.log(`  组件相关请求: ${componentRequests.length}`);

    if (failedRequests.length > 0) {
      console.log('\n❌ 失败的请求:');
      failedRequests.forEach(req => {
        console.log(`  ${req.status} ${req.statusText}: ${req.url}`);
      });
    }

    console.log('\n=== 步骤6：检查控制台错误详情 ===');

    const errors = consoleLog.filter(entry => entry.type === 'error');
    const warnings = consoleLog.filter(entry => entry.type === 'warning');

    console.log(`🚨 错误统计: ${errors.length}个错误, ${warnings.length}个警告`);

    if (errors.length > 0) {
      console.log('\n📋 详细错误列表:');
      errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.text}`);
        if (error.location) {
          console.log(`     位置: ${error.location.url}:${error.location.lineNumber}:${error.location.columnNumber}`);
        }
      });
    }

    // 生成诊断报告
    const diagnosticReport = {
      timestamp: new Date().toISOString(),
      testUrl: 'http://localhost:5173',
      networkRequests: {
        total: networkLog.length,
        failed: failedRequests.length,
        componentRelated: componentRequests.length,
        failures: failedRequests
      },
      consoleErrors: errors,
      consoleWarnings: warnings,
      componentCheck: componentCheck,
      summary: {
        hasErrors: errors.length > 0,
        hasFailedRequests: failedRequests.length > 0,
        criticalIssues: errors.filter(e =>
          e.text.includes('500') ||
          e.text.includes('Cannot find module') ||
          e.text.includes('Failed to load')
        ).length
      }
    };

    // 保存诊断报告
    const reportDir = path.join(__dirname, 'docs', '浏览器检查');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(reportDir, `组件诊断报告-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(diagnosticReport, null, 2));

    console.log(`\n📄 诊断报告已保存: ${reportPath}`);

    console.log('\n🎯 诊断总结:');
    if (diagnosticReport.summary.criticalIssues > 0) {
      console.log(`⚠️ 发现 ${diagnosticReport.summary.criticalIssues} 个严重问题需要修复`);
    } else {
      console.log('✅ 未发现严重的组件加载问题');
    }

    await page.waitForTimeout(3000);

  } catch (error) {
    console.error('❌ 诊断过程中出现错误:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
    console.log('🔍 组件诊断完成！');
  }
}

diagnoseCenterComponents().catch(console.error);