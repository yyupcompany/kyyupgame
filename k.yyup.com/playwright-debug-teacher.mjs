/**
 * 使用Playwright调试教师页面
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';

async function debugTeacherPages() {
  console.log('🎭 启动Playwright浏览器调试...\n');
  
  // 启动浏览器（非无头模式，方便观察）
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000, // 慢速执行
    devtools: true // 打开开发者工具
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: './videos/',
      size: { width: 1920, height: 1080 }
    }
  });
  
  const page = await context.newPage();
  
  // 收集控制台消息
  const consoleMessages = [];
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    consoleMessages.push({ type, text, timestamp: new Date().toISOString() });
    
    if (type === 'error') {
      console.log(`❌ [控制台错误] ${text}`);
    } else if (type === 'warning') {
      console.log(`⚠️  [控制台警告] ${text}`);
    }
  });
  
  // 收集页面错误
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push({ message: error.message, stack: error.stack, timestamp: new Date().toISOString() });
    console.log(`❌ [页面错误] ${error.message}`);
  });
  
  // 收集网络请求
  const failedRequests = [];
  page.on('response', response => {
    if (!response.ok()) {
      failedRequests.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        timestamp: new Date().toISOString()
      });
      console.log(`❌ [请求失败] ${response.status()} ${response.url()}`);
    }
  });
  
  try {
    // 1. 访问首页
    console.log('📍 步骤1: 访问首页...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    console.log('✅ 首页加载完成\n');
    
    // 截图
    await page.screenshot({ path: 'screenshots/01-homepage.png', fullPage: true });
    
    // 2. 尝试使用快捷登录
    console.log('📍 步骤2: 尝试快捷登录...');

    // 查找教师快捷登录按钮
    const teacherQuickBtn = page.locator('button.teacher-btn, .quick-btn.teacher-btn, button:has-text("教师")').first();
    const hasQuickLogin = await teacherQuickBtn.isVisible().catch(() => false);

    if (hasQuickLogin) {
      console.log('找到教师快捷登录按钮，点击登录...');

      // 截图
      await page.screenshot({ path: 'screenshots/02-quick-login-buttons.png', fullPage: true });

      // 点击教师快捷登录
      await teacherQuickBtn.click();
      console.log('✅ 已点击教师快捷登录按钮');

      // 等待登录完成
      await page.waitForTimeout(3000);
      await page.waitForLoadState('networkidle');

      // 截图
      await page.screenshot({ path: 'screenshots/03-after-quick-login.png', fullPage: true });

    } else {
      console.log('未找到快捷登录按钮，尝试手动登录...');

      // 查找登录表单
      const emailInput = page.locator('input[type="email"], input[type="text"], input[placeholder*="邮箱"], input[placeholder*="用户名"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      const loginButton = page.locator('button:has-text("登录"), button[type="submit"]').first();

      const hasLoginForm = await emailInput.isVisible().catch(() => false);

      if (hasLoginForm) {
        console.log('找到登录表单，开始登录...');

        // 输入凭据（使用正确的教师账号）
        await emailInput.fill('teacher');
        console.log('✅ 已输入用户名: teacher');

        await passwordInput.fill('teacher123');
        console.log('✅ 已输入密码: teacher123');

        // 截图
        await page.screenshot({ path: 'screenshots/02-login-form.png', fullPage: true });

        // 点击登录
        await loginButton.click();
        console.log('✅ 已点击登录按钮');

        // 等待登录完成
        await page.waitForTimeout(3000);
        await page.waitForLoadState('networkidle');

        // 截图
        await page.screenshot({ path: 'screenshots/03-after-login.png', fullPage: true });
      } else {
        console.log('❌ 未找到登录表单');
      }
    }

    // 检查是否登录成功
    const currentUrl = page.url();
    console.log(`当前URL: ${currentUrl}`);

    if (currentUrl.includes('/login')) {
      console.log('❌ 登录失败，仍在登录页面\n');
    } else {
      console.log('✅ 登录成功\n');
    }
    
    // 3. 检查侧边栏
    console.log('📍 步骤3: 检查侧边栏菜单...');
    await page.waitForTimeout(2000);
    
    // 获取所有菜单项
    const menuItems = await page.locator('.el-menu-item, .el-sub-menu__title').allTextContents();
    console.log('侧边栏菜单项:');
    menuItems.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.trim()}`);
    });
    console.log('');
    
    // 截图
    await page.screenshot({ path: 'screenshots/04-sidebar-menu.png', fullPage: true });
    
    // 4. 查找并点击客户跟踪
    console.log('📍 步骤4: 查找客户跟踪菜单...');
    
    const customerTrackingMenu = page.locator('text=客户跟踪').first();
    const isVisible = await customerTrackingMenu.isVisible().catch(() => false);
    
    if (isVisible) {
      console.log('✅ 找到客户跟踪菜单');
      
      // 点击菜单
      await customerTrackingMenu.click();
      console.log('✅ 已点击客户跟踪菜单');
      
      await page.waitForTimeout(2000);
      await page.waitForLoadState('networkidle');
      
      // 截图
      await page.screenshot({ path: 'screenshots/05-customer-tracking.png', fullPage: true });
      
      // 检查是否有权限错误
      const errorMessages = await page.locator('text=没有权限, text=权限不足, text=无权访问, text=403').allTextContents();
      
      if (errorMessages.length > 0) {
        console.log('❌ 发现权限错误:');
        errorMessages.forEach(msg => console.log(`   ${msg}`));
      } else {
        console.log('✅ 没有权限错误');
      }
      
      // 检查页面内容
      const pageContent = await page.textContent('body');
      console.log(`\n页面内容长度: ${pageContent.length} 字符`);
      
    } else {
      console.log('❌ 未找到客户跟踪菜单\n');
    }
    
    // 5. 直接访问客户跟踪页面
    console.log('\n📍 步骤5: 直接访问客户跟踪页面...');
    await page.goto(BASE_URL + '/teacher-center/customer-tracking', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // 截图
    await page.screenshot({ path: 'screenshots/06-direct-access.png', fullPage: true });

    console.log(`当前URL: ${page.url()}`);

    // 检查页面标题
    const title = await page.title();
    console.log(`页面标题: ${title}`);
    
    // 检查是否有错误提示
    const hasError = await page.locator('text=没有权限, text=权限不足, text=404, text=403').first().isVisible().catch(() => false);
    
    if (hasError) {
      const errorText = await page.locator('text=没有权限, text=权限不足, text=404, text=403').first().textContent();
      console.log(`❌ 页面错误: ${errorText}`);
    } else {
      console.log('✅ 页面正常加载');
    }
    
    // 6. 访问SOP详情页
    console.log('\n📍 步骤6: 访问SOP详情页...');
    await page.goto(BASE_URL + '/teacher-center/customer-tracking/1', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // 截图
    await page.screenshot({ path: 'screenshots/07-sop-detail.png', fullPage: true });
    
    console.log(`当前URL: ${page.url()}`);
    console.log(`页面标题: ${await page.title()}`);
    
    // 检查页面元素
    const elements = {
      '客户信息卡片': await page.locator('.customer-info-card, text=客户信息').first().isVisible().catch(() => false),
      'SOP进度卡片': await page.locator('.sop-progress-card, text=SOP进度').first().isVisible().catch(() => false),
      '成功概率卡片': await page.locator('.success-probability-card, text=成功概率').first().isVisible().catch(() => false),
      'SOP阶段流程': await page.locator('.sop-stage-flow, text=阶段').first().isVisible().catch(() => false),
      '对话记录': await page.locator('text=对话记录').first().isVisible().catch(() => false),
      'AI建议': await page.locator('text=AI建议, text=AI智能').first().isVisible().catch(() => false)
    };
    
    console.log('\n页面元素检查:');
    for (const [name, visible] of Object.entries(elements)) {
      console.log(`  ${visible ? '✅' : '❌'} ${name}`);
    }
    
    // 7. 生成测试报告
    console.log('\n📊 生成测试报告...');
    
    const report = {
      timestamp: new Date().toISOString(),
      consoleErrors: consoleMessages.filter(m => m.type === 'error'),
      consoleWarnings: consoleMessages.filter(m => m.type === 'warning'),
      pageErrors: pageErrors,
      failedRequests: failedRequests,
      screenshots: [
        '01-homepage.png',
        '02-login-form.png',
        '03-after-login.png',
        '04-sidebar-menu.png',
        '05-customer-tracking.png',
        '06-direct-access.png',
        '07-sop-detail.png'
      ]
    };
    
    // 保存报告
    const fs = await import('fs');
    fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
    console.log('✅ 测试报告已保存: test-report.json');
    
    // 打印摘要
    console.log('\n📋 测试摘要:');
    console.log(`  控制台错误: ${report.consoleErrors.length} 个`);
    console.log(`  控制台警告: ${report.consoleWarnings.length} 个`);
    console.log(`  页面错误: ${report.pageErrors.length} 个`);
    console.log(`  失败请求: ${report.failedRequests.length} 个`);
    console.log(`  截图数量: ${report.screenshots.length} 张`);
    
    if (report.consoleErrors.length > 0) {
      console.log('\n❌ 控制台错误详情:');
      report.consoleErrors.slice(0, 5).forEach((err, i) => {
        console.log(`  ${i + 1}. ${err.text}`);
      });
    }
    
    if (report.failedRequests.length > 0) {
      console.log('\n❌ 失败请求详情:');
      report.failedRequests.slice(0, 5).forEach((req, i) => {
        console.log(`  ${i + 1}. ${req.status} ${req.url}`);
      });
    }
    
    console.log('\n✅ 调试完成！');
    console.log('\n💡 浏览器将保持打开，按任意键关闭...');
    
    // 等待用户输入
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });
    
  } catch (error) {
    console.error('❌ 调试失败:', error);
    await page.screenshot({ path: 'screenshots/error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

// 创建截图目录
import { mkdirSync } from 'fs';
try {
  mkdirSync('screenshots', { recursive: true });
  mkdirSync('videos', { recursive: true });
} catch (e) {}

// 运行调试
debugTeacherPages().catch(console.error);

