const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function checkParentCenterPagesLoggedIn() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('🔐 首先登录系统...');

  try {
    // 访问登录页面
    await page.goto('http://localhost:5173/login', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // 等待登录表单加载
    await page.waitForSelector('#username, input[placeholder*="用户名"], input[placeholder*="账号"]', { timeout: 10000 });

    // 填写登录信息
    await page.type('#username, input[placeholder*="用户名"], input[placeholder*="账号"]', 'parent');
    await page.type('#password, input[placeholder*="密码"]', '123456');

    // 点击登录按钮
    await page.click('button[type="submit"], .login-btn, .el-button--primary');

    // 等待登录完成
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });

    console.log('✅ 登录成功');

    // 家长中心重要页面列表
    const pages = [
      { name: '家长中心首页', path: '/parent-center' },
      { name: '家长中心工作台', path: '/parent-center/dashboard' },
      { name: '孩子管理', path: '/parent-center/children' },
      { name: '游戏大厅', path: '/parent-center/games/index' },
      { name: '游戏成就', path: '/parent-center/games/achievements' },
      { name: '游戏记录', path: '/parent-center/games/records' },
      { name: '评估主页', path: '/parent-center/assessment' },
      { name: '评估开始页面', path: '/parent-center/assessment/index' },
      { name: '活动中心', path: '/parent-center/activities' },
      { name: '家校沟通', path: '/parent-center/communication' },
      { name: '通知中心', path: '/parent-center/notifications' },
      { name: '个人资料', path: '/parent-center/profile' },
      { name: '相册管理', path: '/parent-center/photo-album' },
      { name: 'AI助手', path: '/parent-center/ai-assistant' }
    ];

    console.log('\n🚀 开始检查家长中心页面...\n');

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

        // 清空之前的控制台错误
        const consoleErrors = [];
        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
          }
        });

        // 等待页面加载
        await new Promise(resolve => setTimeout(resolve, 3000));

        const result = {
          name: pageInfo.name,
          path: pageInfo.path,
          status: response?.status() || 'unknown',
          success: response?.status() === 200,
          error: null,
          screenshot: null,
          content: null,
          consoleErrors: [...consoleErrors]
        };

        // 检查是否是登录页面（重定向）
        const isLoginPage = await page.evaluate(() => {
          const title = document.title;
          const hasLoginForm = document.querySelector('form') &&
                             document.querySelector('input[type="password"]');
          return title.includes('登录') || hasLoginForm;
        });

        if (isLoginPage) {
          result.isRedirectedToLogin = true;
          console.log(`   ⚠️  页面重定向到登录页面`);
        }

        // 截图
        const screenshotPath = path.join(__dirname, 'screenshots-logged-in', `${pageInfo.name.replace(/\s+/g, '_')}.png`);
        const screenshotDir = path.dirname(screenshotPath);

        if (!fs.existsSync(screenshotDir)) {
          fs.mkdirSync(screenshotDir, { recursive: true });
        }

        await page.screenshot({
          path: screenshotPath,
          fullPage: true
        });
        result.screenshot = screenshotPath;

        // 获取页面内容
        const content = await page.evaluate(() => {
          const body = document.body;
          if (body) {
            return {
              title: document.title,
              hasContent: body.innerText.length > 100,
              contentPreview: body.innerText.substring(0, 300),
              url: window.location.href,
              mainElements: {
                h1: document.querySelector('h1')?.innerText || '',
                h2: Array.from(document.querySelectorAll('h2')).map(h => h.innerText).slice(0, 3),
                buttons: Array.from(document.querySelectorAll('button')).length,
                cards: Array.from(document.querySelectorAll('[class*="card"]')).length,
                hasSidebar: !!document.querySelector('[class*="sidebar"]'),
                hasHeader: !!document.querySelector('[class*="header"]'),
                hasGameGrid: !!document.querySelector('[class*="game-grid"]'),
                hasGameCards: Array.from(document.querySelectorAll('[class*="game-card"]')).length
              }
            };
          }
          return null;
        });

        result.content = content;

        console.log(`   ✅ 状态码: ${result.status}`);
        if (content) {
          console.log(`   📋 页面标题: ${content.title}`);
          console.log(`   🧩 主要元素: H1="${content.mainElements.h1}"`);
          console.log(`   📊 组件统计: 按钮${content.mainElements.buttons}个, 卡片${content.mainElements.cards}个`);
          if (content.mainElements.hasGameCards > 0) {
            console.log(`   🎮 游戏卡片: ${content.mainElements.hasGameCards}个`);
          }
          console.log(`   🏗️  布局: 侧边栏${content.mainElements.hasSidebar ? '✅' : '❌'}, 头部${content.mainElements.hasHeader ? '✅' : '❌'}`);
        }

        if (consoleErrors.length > 0) {
          console.log(`   ⚠️  控制台错误: ${consoleErrors.length}个`);
          consoleErrors.slice(0, 2).forEach(error => {
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
        success: results.filter(r => r.success && !r.isRedirectedToLogin).length,
        failed: results.filter(r => !r.success).length,
        redirectedToLogin: results.filter(r => r.isRedirectedToLogin).length,
        withErrors: results.filter(r => r.consoleErrors.length > 0).length
      },
      details: results
    };

    // 保存报告
    const reportPath = path.join(__dirname, 'parent-center-logged-in-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // 生成Markdown报告
    const markdownReport = generateMarkdownReport(report);
    const markdownPath = path.join(__dirname, 'parent-center-logged-in-report.md');
    fs.writeFileSync(markdownPath, markdownReport);

    console.log(`\n✅ 检查完成！`);
    console.log(`📈 成功访问: ${report.summary.success}/${report.summary.total} 页面`);
    console.log(`🔄 重定向到登录: ${report.summary.redirectedToLogin} 页面`);
    console.log(`💾 详细报告: ${markdownPath}`);
    console.log(`📸 截图保存在: ${path.join(__dirname, 'screenshots-logged-in')}`);

    return report;

  } catch (error) {
    console.error('❌ 登录失败:', error.message);
    await browser.close();
    throw error;
  }
}

function generateMarkdownReport(report) {
  const { summary, details } = report;

  let markdown = `# 家长中心页面检查报告（已登录）\n\n`;
  markdown += `**检查时间**: ${new Date(report.timestamp).toLocaleString('zh-CN')}\n\n`;

  markdown += `## 📊 检查摘要\n\n`;
  markdown += `- **总页面数**: ${summary.total}\n`;
  markdown += `- **成功访问**: ${summary.success}\n`;
  markdown += `- **访问失败**: ${summary.failed}\n`;
  markdown += `- **重定向到登录**: ${summary.redirectedToLogin}\n`;
  markdown += `- **有控制台错误**: ${summary.withErrors}\n\n`;

  markdown += `## 📋 页面详情\n\n`;

  details.forEach((page, index) => {
    markdown += `### ${index + 1}. ${page.name}\n\n`;
    markdown += `- **路径**: \`${page.path}\`\n`;
    markdown += `- **状态**: ${page.success ? '✅ 成功' : '❌ 失败'} (${page.status})\n`;

    if (page.isRedirectedToLogin) {
      markdown += `- **⚠️ 重定向**: 页面重定向到登录页面\n`;
    }

    if (page.error) {
      markdown += `- **错误**: ${page.error}\n`;
    }

    if (page.content) {
      markdown += `- **页面标题**: ${page.content.title}\n`;
      if (page.content.mainElements.h1) {
        markdown += `- **主标题**: ${page.content.mainElements.h1}\n`;
      }
      if (page.content.mainElements.hasGameCards > 0) {
        markdown += `- **🎮 游戏卡片数量**: ${page.content.mainElements.hasGameCards}\n`;
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
checkParentCenterPagesLoggedIn().catch(console.error);