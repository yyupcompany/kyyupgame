const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function checkParentCenterPages() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 设置视口大小
  await page.setViewport({ width: 1920, height: 1080 });

  // 家长中心重要页面列表
  const pages = [
    { name: '家长中心首页', path: '/parent-center' },
    { name: '家长中心工作台', path: '/parent-center/dashboard' },
    { name: '孩子管理', path: '/parent-center/children' },
    { name: '游戏大厅', path: '/parent-center/games/index' },
    { name: '游戏成就', path: '/parent-center/games/achievements' },
    { name: '游戏记录', path: '/parent-center/games/records' },
    { name: '评估主页', path: '/parent-center/assessment' },
    { name: '活动中心', path: '/parent-center/activities' },
    { name: '家校沟通', path: '/parent-center/communication' },
    { name: '通知中心', path: '/parent-center/notifications' },
    { name: '个人资料', path: '/parent-center/profile' },
    { name: '相册管理', path: '/parent-center/photo-album' },
    { name: 'AI助手', path: '/parent-center/ai-assistant' }
  ];

  console.log('🚀 开始检查家长中心页面...\n');

  const results = [];

  for (let i = 0; i < pages.length; i++) {
    const pageInfo = pages[i];
    console.log(`\n📄 检查页面 ${i + 1}/${pages.length}: ${pageInfo.name}`);
    console.log(`🔗 URL: http://localhost:5173${pageInfo.path}`);

    try {
      // 访问页面
      const response = await page.goto(`http://localhost:5173${pageInfo.path}`, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      const result = {
        name: pageInfo.name,
        path: pageInfo.path,
        status: response?.status() || 'unknown',
        success: response?.status() === 200,
        error: null,
        screenshot: null,
        content: null,
        consoleErrors: []
      };

      // 检查控制台错误
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          result.consoleErrors.push(msg.text());
        }
      });

      // 等待页面加载
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 截图
      const screenshotPath = path.join(__dirname, 'screenshots', `${pageInfo.name.replace(/\s+/g, '_')}.png`);
      const screenshotDir = path.dirname(screenshotPath);

      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }

      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });
      result.screenshot = screenshotPath;

      // 获取页面标题和内容摘要
      const title = await page.title();
      const content = await page.evaluate(() => {
        const body = document.body;
        if (body) {
          return {
            title: document.title,
            hasContent: body.innerText.length > 100,
            contentPreview: body.innerText.substring(0, 200),
            mainElements: {
              h1: document.querySelector('h1')?.innerText || '',
              h2: Array.from(document.querySelectorAll('h2')).map(h => h.innerText).slice(0, 3),
              buttons: Array.from(document.querySelectorAll('button')).length,
              cards: Array.from(document.querySelectorAll('[class*="card"]')).length,
              hasSidebar: !!document.querySelector('[class*="sidebar"]'),
              hasHeader: !!document.querySelector('[class*="header"]')
            }
          };
        }
        return null;
      });

      result.content = content;

      console.log(`   ✅ 状态码: ${result.status}`);
      console.log(`   📋 页面标题: ${title}`);
      if (content?.mainElements) {
        console.log(`   🧩 主要元素: H1="${content.mainElements.h1}"`);
        console.log(`   📊 组件统计: 按钮${content.mainElements.buttons}个, 卡片${content.mainElements.cards}个`);
        console.log(`   🏗️  布局: 侧边栏${content.mainElements.hasSidebar ? '✅' : '❌'}, 头部${content.mainElements.hasHeader ? '✅' : '❌'}`);
      }

      if (result.consoleErrors.length > 0) {
        console.log(`   ⚠️  控制台错误: ${result.consoleErrors.length}个`);
        result.consoleErrors.slice(0, 3).forEach(error => {
          console.log(`      - ${error.substring(0, 100)}`);
        });
      }

      results.push(result);

    } catch (error) {
      console.error(`   ❌ 访问失败: ${error.message}`);
      results.push({
        name: pageInfo.name,
        path: pageInfo.path,
        status: 'error',
        success: false,
        error: error.message,
        screenshot: null,
        content: null,
        consoleErrors: []
      });
    }
  }

  await browser.close();

  // 生成报告
  console.log('\n\n📊 生成检查报告...');

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: pages.length,
      success: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      withErrors: results.filter(r => r.consoleErrors.length > 0).length
    },
    details: results
  };

  // 保存报告
  const reportPath = path.join(__dirname, 'parent-center-page-check-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // 生成Markdown报告
  const markdownReport = generateMarkdownReport(report);
  const markdownPath = path.join(__dirname, 'parent-center-page-check-report.md');
  fs.writeFileSync(markdownPath, markdownReport);

  console.log(`\n✅ 检查完成！`);
  console.log(`📈 成功: ${report.summary.success}/${report.summary.total} 页面`);
  console.log(`💾 详细报告: ${markdownPath}`);
  console.log(`📸 截图保存在: ${path.join(__dirname, 'screenshots')}`);

  return report;
}

function generateMarkdownReport(report) {
  const { summary, details } = report;

  let markdown = `# 家长中心页面检查报告\n\n`;
  markdown += `**检查时间**: ${new Date(report.timestamp).toLocaleString('zh-CN')}\n\n`;

  markdown += `## 📊 检查摘要\n\n`;
  markdown += `- **总页面数**: ${summary.total}\n`;
  markdown += `- **成功访问**: ${summary.success}\n`;
  markdown += `- **访问失败**: ${summary.failed}\n`;
  markdown += `- **有控制台错误**: ${summary.withErrors}\n\n`;

  markdown += `## 📋 页面详情\n\n`;

  details.forEach((page, index) => {
    markdown += `### ${index + 1}. ${page.name}\n\n`;
    markdown += `- **路径**: \`${page.path}\`\n`;
    markdown += `- **状态**: ${page.success ? '✅ 成功' : '❌ 失败'} (${page.status})\n`;

    if (page.error) {
      markdown += `- **错误**: ${page.error}\n`;
    }

    if (page.content) {
      markdown += `- **页面标题**: ${page.content.title}\n`;
      if (page.content.mainElements.h1) {
        markdown += `- **主标题**: ${page.content.mainElements.h1}\n`;
      }
      markdown += `- **布局**: 侧边栏${page.content.mainElements.hasSidebar ? '✅' : '❌'} | 头部${page.content.mainElements.hasHeader ? '✅' : '❌'}\n`;
      markdown += `- **交互元素**: 按钮${page.content.mainElements.buttons}个, 卡片${page.content.mainElements.cards}个\n`;
    }

    if (page.consoleErrors.length > 0) {
      markdown += `- **控制台错误**: ${page.consoleErrors.length}个\n`;
      page.consoleErrors.slice(0, 2).forEach(error => {
        markdown += `  - \`${error.substring(0, 150)}\`\n`;
      });
    }

    if (page.screenshot) {
      markdown += `- **截图**: [查看截图](${page.screenshot})\n`;
    }

    markdown += `\n`;
  });

  return markdown;
}

// 运行检查
checkParentCenterPages().catch(console.error);