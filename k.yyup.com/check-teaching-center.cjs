const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 教学中心页面列表
const TEACHING_CENTER_PAGES = [
  {
    name: '教学中心主页',
    url: 'http://localhost:5173/teaching-center',
    description: '教学中心主页面'
  },
  {
    name: '课程管理',
    url: 'http://localhost:5173/teaching-center/course-management',
    description: '课程管理页面'
  },
  {
    name: '教学计划',
    url: 'http://localhost:5173/teaching-center/teaching-plan',
    description: '教学计划页面'
  },
  {
    name: '教学资源',
    url: 'http://localhost:5173/teaching-center/teaching-resources',
    description: '教学资源页面'
  },
  {
    name: '教学评估',
    url: 'http://localhost:5173/teaching-center/teaching-evaluation',
    description: '教学评估页面'
  },
  {
    name: '教师发展',
    url: 'http://localhost:5173/teaching-center/teacher-development',
    description: '教师发展页面'
  },
  {
    name: '教学检查',
    url: 'http://localhost:5173/teaching-center/teaching-inspection',
    description: '教学检查页面'
  }
];

async function checkTeachingCenterPages() {
  const browser = await chromium.launch({
    headless: false, // 显示浏览器窗口
    slowMo: 1000 // 慢速执行以便观察
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const results = [];

  // 创建截图目录
  const screenshotDir = path.join(__dirname, 'teaching-center-screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  for (const page of TEACHING_CENTER_PAGES) {
    console.log(`\n🔍 检查页面: ${page.name}`);
    console.log(`📝 URL: ${page.url}`);

    const pageInstance = await context.newPage();

    try {
      // 监听控制台消息和错误
      const consoleMessages = [];
      const consoleErrors = [];
      const networkErrors = [];

      pageInstance.on('console', msg => {
        const message = {
          type: msg.type(),
          text: msg.text(),
          location: msg.location(),
          timestamp: new Date().toISOString()
        };
        consoleMessages.push(message);

        if (msg.type() === 'error') {
          consoleErrors.push(message);
          console.error(`  ❌ Console Error: ${msg.text()}`);
        }
      });

      pageInstance.on('pageerror', error => {
        const errorMessage = {
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        };
        consoleErrors.push(errorMessage);
        console.error(`  ❌ Page Error: ${error.message}`);
      });

      pageInstance.on('response', response => {
        if (response.status() >= 400) {
          const errorInfo = {
            url: response.url(),
            status: response.status(),
            statusText: response.statusText(),
            timestamp: new Date().toISOString()
          };
          networkErrors.push(errorInfo);
          console.error(`  ❌ Network Error: ${response.status()} ${response.url()}`);
        }
      });

      // 设置超时时间
      pageInstance.setDefaultTimeout(30000);

      // 访问页面
      console.log(`  🚀 正在访问页面...`);
      await pageInstance.goto(page.url, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // 等待页面加载
      await pageInstance.waitForTimeout(3000);

      // 截图
      const screenshotPath = path.join(screenshotDir, `${page.name.replace(/\s+/g, '-')}.png`);
      await pageInstance.screenshot({
        path: screenshotPath,
        fullPage: true
      });
      console.log(`  📸 截图已保存: ${screenshotPath}`);

      // 获取页面标题
      const title = await pageInstance.title();

      // 检查页面是否正常加载（检查错误页面或空白页面）
      const bodyContent = await pageInstance.textContent('body');
      const hasErrorKeywords = bodyContent && (
        bodyContent.includes('404') ||
        bodyContent.includes('500') ||
        bodyContent.includes('页面不存在') ||
        bodyContent.includes('Internal Server Error') ||
        bodyContent.includes('Cannot GET') ||
        bodyContent.length < 100
      );

      // 记录结果
      const result = {
        page: page.name,
        url: page.url,
        title: title,
        loadStatus: hasErrorKeywords ? 'ERROR' : 'SUCCESS',
        consoleMessages: consoleMessages,
        consoleErrors: consoleErrors,
        networkErrors: networkErrors,
        screenshotPath: screenshotPath,
        timestamp: new Date().toISOString()
      };

      results.push(result);

      console.log(`  📊 结果统计:`);
      console.log(`    - 控制台消息: ${consoleMessages.length}`);
      console.log(`    - 控制台错误: ${consoleErrors.length}`);
      console.log(`    - 网络错误: ${networkErrors.length}`);
      console.log(`    - 页面状态: ${result.loadStatus}`);

    } catch (error) {
      console.error(`  ❌ 访问页面时出错: ${error.message}`);

      const errorResult = {
        page: page.name,
        url: page.url,
        loadStatus: 'FAILED',
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      };

      results.push(errorResult);

    } finally {
      await pageInstance.close();
    }

    // 页面间等待
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  await browser.close();

  // 生成详细报告
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalPages: TEACHING_CENTER_PAGES.length,
      successfulPages: results.filter(r => r.loadStatus === 'SUCCESS').length,
      errorPages: results.filter(r => r.loadStatus !== 'SUCCESS').length,
      totalConsoleErrors: results.reduce((sum, r) => sum + (r.consoleErrors?.length || 0), 0),
      totalNetworkErrors: results.reduce((sum, r) => sum + (r.networkErrors?.length || 0), 0)
    },
    results: results
  };

  // 保存报告
  const reportPath = path.join(__dirname, 'teaching-center-error-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('\n📋 检查完成！');
  console.log(`📊 统计信息:`);
  console.log(`  - 总页面数: ${report.summary.totalPages}`);
  console.log(`  - 成功页面: ${report.summary.successfulPages}`);
  console.log(`  - 错误页面: ${report.summary.errorPages}`);
  console.log(`  - 控制台错误: ${report.summary.totalConsoleErrors}`);
  console.log(`  - 网络错误: ${report.summary.totalNetworkErrors}`);
  console.log(`📄 详细报告已保存: ${reportPath}`);

  return report;
}

// 如果直接运行此脚本
if (require.main === module) {
  checkTeachingCenterPages().catch(console.error);
}

module.exports = { checkTeachingCenterPages };