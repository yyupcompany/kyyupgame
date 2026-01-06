import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建截图目录
const screenshotDir = path.join(__dirname, 'docs', '浏览器检查', 'list-components-review');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function reviewListPages() {
  const browser = await chromium.launch({
    headless: false, // 设置为false以便观察过程
    slowMo: 1000
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // 已知列表页面路由
  const listPages = [
    { name: '教师列表', url: 'http://localhost:5173/teacher', description: '教师管理列表页面' },
    { name: '学生列表', url: 'http://localhost:5173/student', description: '学生管理列表页面' },
    { name: '活动列表', url: 'http://localhost:5173/activity', description: '活动管理列表页面' },
    { name: '班级列表', url: 'http://localhost:5173/class', description: '班级管理列表页面' },
    { name: '用户管理', url: 'http://localhost:5173/users', description: '用户管理列表页面' },
    { name: '家长列表', url: 'http://localhost:5173/parent', description: '家长管理列表页面' },
    { name: '课程列表', url: 'http://localhost:5173/course', description: '课程管理列表页面' },
    { name: '招生管理', url: 'http://localhost:5173/enrollment', description: '招生管理列表页面' },
    { name: '营销活动', url: 'http://localhost:5173/marketing', description: '营销活动列表页面' },
    { name: '系统设置', url: 'http://localhost:5173/system', description: '系统设置页面' },
  ];

  const results = [];

  console.log('🚀 开始列表页面复查...');

  for (const pageConfig of listPages) {
    try {
      console.log(`\n📄 正在访问: ${pageConfig.name} - ${pageConfig.url}`);

      // 访问页面
      const response = await page.goto(pageConfig.url, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // 等待页面加载
      await page.waitForTimeout(3000);

      // 检查页面是否成功加载
      const statusCode = response.status();
      const pageTitle = await page.title();

      // 检查是否有错误信息
      const hasError = await page.locator('.error-message, .error-page, [data-testid="error"]').count() > 0;

      // 检查是否有表格或列表组件
      const hasTable = await page.locator('table, .el-table, .data-table, .list-container').count() > 0;
      const hasListItems = await page.locator('li, .list-item, .el-row').count() > 5;

      // 检查是否有UnifiedIcon组件
      const hasUnifiedIcon = await page.locator('[class*="unified-icon"], [class*="UnifiedIcon"]').count() > 0;

      // 检查是否加载了优化样式
      const hasOptimizedStyles = await page.evaluate(() => {
        const stylesheets = Array.from(document.styleSheets);
        return stylesheets.some(sheet =>
          sheet.href && sheet.href.includes('list-components-optimization')
        );
      });

      // 截图
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const screenshotPath = path.join(screenshotDir, `${pageConfig.name}_${timestamp}.png`);
      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });

      // 检查控制台错误
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      const result = {
        page: pageConfig.name,
        url: pageConfig.url,
        description: pageConfig.description,
        status: statusCode,
        title: pageTitle,
        hasError,
        hasTable,
        hasListItems,
        hasUnifiedIcon,
        hasOptimizedStyles,
        screenshotPath,
        consoleErrors,
        timestamp: new Date().toISOString()
      };

      results.push(result);

      console.log(`✅ ${pageConfig.name} 检查完成:`);
      console.log(`   状态码: ${statusCode}`);
      console.log(`   有表格: ${hasTable}`);
      console.log(`   有列表项: ${hasListItems}`);
      console.log(`   有UnifiedIcon: ${hasUnifiedIcon}`);
      console.log(`   有优化样式: ${hasOptimizedStyles}`);
      console.log(`   截图保存: ${screenshotPath}`);

    } catch (error) {
      console.error(`❌ ${pageConfig.name} 访问失败:`, error.message);

      const result = {
        page: pageConfig.name,
        url: pageConfig.url,
        description: pageConfig.description,
        error: error.message,
        timestamp: new Date().toISOString()
      };

      results.push(result);
    }
  }

  // 保存结果到JSON文件
  const resultsPath = path.join(screenshotDir, 'list-pages-review-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));

  console.log(`\n📊 复查完成！结果已保存到: ${resultsPath}`);
  console.log(`📸 截图保存目录: ${screenshotDir}`);

  await browser.close();

  return results;
}

// 运行复查
reviewListPages().catch(console.error);