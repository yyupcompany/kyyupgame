const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 创建截图目录
const screenshotDir = path.join(__dirname, 'docs', '浏览器检查', 'authenticated-list-review');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function loginAndReviewListPages() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // 监听控制台错误
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    console.log('🔐 开始登录流程...');

    // 访问首页
    await page.goto('http://localhost:5173', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // 等待页面加载
    await page.waitForTimeout(2000);

    // 检查是否已经登录
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('📝 需要登录，正在填写登录表单...');

      // 尝试找到登录表单
      await page.waitForSelector('input[type="text"], input[name="username"], input[placeholder*="用户"], input[placeholder*="账号"]', {
        timeout: 10000
      });

      // 填写用户名
      const usernameSelector = 'input[type="text"], input[name="username"], input[placeholder*="用户"], input[placeholder*="账号"]';
      await page.fill(usernameSelector, 'admin');

      // 填写密码
      const passwordSelector = 'input[type="password"], input[name="password"], input[placeholder*="密码"]';
      await page.fill(passwordSelector, 'admin123');

      // 点击登录按钮
      const loginButtonSelector = 'button[type="submit"], button:has-text("登录"), .login-btn, .el-button--primary';
      await page.click(loginButtonSelector);

      // 等待登录完成
      await page.waitForTimeout(5000);

      // 检查是否登录成功
      const loggedInUrl = page.url();
      if (loggedInUrl.includes('/login')) {
        console.log('❌ 登录失败，继续以未登录状态测试...');
      } else {
        console.log('✅ 登录成功！');
      }
    } else {
      console.log('✅ 已经登录或不需要登录');
    }
  } catch (error) {
    console.log('⚠️ 登录过程出现问题，继续以未登录状态测试:', error.message);
  }

  // 已知列表页面路由（使用更可能存在的路由）
  const listPages = [
    { name: '教师管理', url: 'http://localhost:5173/teacher-center/teacher-management', description: '教师管理中心页面' },
    { name: '学生管理', url: 'http://localhost:5173/teacher-center/student-management', description: '学生管理中心页面' },
    { name: '班级管理', url: 'http://localhost:5173/teacher-center/class-management', description: '班级管理中心页面' },
    { name: '活动管理', url: 'http://localhost:5173/activity-center/activity-management', description: '活动管理中心页面' },
    { name: '招生管理', url: 'http://localhost:5173/enrollment-center/enrollment-management', description: '招生管理中心页面' },
    { name: '家长中心', url: 'http://localhost:5173/parent-center/dashboard', description: '家长中心页面' },
    { name: '园长中心', url: 'http://localhost:5173/principal-center/dashboard', description: '园长中心页面' },
    { name: '人事中心', url: 'http://localhost:5173/personnel-center/staff-management', description: '人事中心页面' },
    { name: '营销中心', url: 'http://localhost:5173/marketing-center/campaign-management', description: '营销中心页面' },
    { name: '系统管理', url: 'http://localhost:5173/system-center/user-management', description: '系统管理中心页面' },
  ];

  const results = [];

  console.log('\n🚀 开始列表页面复查...');

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
      const currentUrl = page.url();

      // 检查是否有错误信息
      const hasError = await page.locator('.error-message, .error-page, [data-testid="error"], .el-message--error').count() > 0;

      // 检查是否有表格或列表组件
      const hasTable = await page.locator('table, .el-table, .data-table, .list-container').count() > 0;
      const hasListItems = await page.locator('li, .list-item, .el-row, .el-card').count() > 5;

      // 检查是否有UnifiedIcon组件
      const hasUnifiedIcon = await page.locator('[class*="unified-icon"], [class*="UnifiedIcon"], i[class*="el-icon"]').count() > 0;

      // 检查是否加载了优化样式
      const hasOptimizedStyles = await page.evaluate(() => {
        const stylesheets = Array.from(document.styleSheets);
        return stylesheets.some(sheet =>
          sheet.href && sheet.href.includes('list-components-optimization')
        );
      });

      // 检查是否有Element Plus组件
      const hasElementPlus = await page.locator('.el-table, .el-button, .el-card, .el-form').count() > 0;

      // 截图
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const screenshotPath = path.join(screenshotDir, `${pageConfig.name}_${timestamp}.png`);
      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });

      const result = {
        page: pageConfig.name,
        url: pageConfig.url,
        description: pageConfig.description,
        status: statusCode,
        title: pageTitle,
        finalUrl: currentUrl,
        hasError,
        hasTable,
        hasListItems,
        hasUnifiedIcon,
        hasOptimizedStyles,
        hasElementPlus,
        screenshotPath,
        consoleErrors: [...consoleErrors],
        timestamp: new Date().toISOString()
      };

      results.push(result);

      console.log(`✅ ${pageConfig.name} 检查完成:`);
      console.log(`   状态码: ${statusCode}`);
      console.log(`   页面标题: ${pageTitle}`);
      console.log(`   最终URL: ${currentUrl}`);
      console.log(`   有表格: ${hasTable}`);
      console.log(`   有列表项: ${hasListItems}`);
      console.log(`   有UnifiedIcon: ${hasUnifiedIcon}`);
      console.log(`   有Element Plus: ${hasElementPlus}`);
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
  const resultsPath = path.join(screenshotDir, 'authenticated-list-review-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));

  console.log(`\n📊 认证后复查完成！结果已保存到: ${resultsPath}`);
  console.log(`📸 截图保存目录: ${screenshotDir}`);

  await browser.close();

  return results;
}

// 运行复查
loginAndReviewListPages().catch(console.error);