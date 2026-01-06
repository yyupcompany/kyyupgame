#!/usr/bin/env node

/**
 * 自动化测试详情页脚本
 * 使用Playwright自动测试所有列表页面的详情功能
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://k.yyup.cc';

// 测试用户凭证
const TEST_USERS = {
  principal: { username: 'principal', password: '123456', role: '园长' },
  admin: { username: 'admin', password: 'admin123', role: '管理员' }
};

// 需要测试的页面列表
const TEST_PAGES = [
  {
    name: '学生管理',
    listUrl: '/personnel/students',
    listSelector: '.student-list',
    detailButtonSelector: 'button:has-text("查看"), button:has-text("详情")',
    detailUrlPattern: /\/student\/detail|\/student\/\d+/
  },
  {
    name: '教师管理',
    listUrl: '/personnel/teachers',
    listSelector: '.teacher-list',
    detailButtonSelector: 'button:has-text("查看"), button:has-text("详情")',
    detailUrlPattern: /\/teacher\/detail|\/teacher\/\d+/
  },
  {
    name: '班级管理',
    listUrl: '/teaching/classes',
    listSelector: '.class-list',
    detailButtonSelector: 'button:has-text("查看"), button:has-text("详情")',
    detailUrlPattern: /\/class\/detail|\/class\/\d+/
  },
  {
    name: '家长管理',
    listUrl: '/personnel/parents',
    listSelector: '.parent-list',
    detailButtonSelector: 'button:has-text("查看"), button:has-text("详情")',
    detailUrlPattern: /\/parent\/detail|\/parent\/\d+/
  },
  {
    name: '活动管理',
    listUrl: '/activity',
    listSelector: '.activity-list',
    detailButtonSelector: 'button:has-text("查看"), button:has-text("详情")',
    detailUrlPattern: /\/activity\/detail|\/activity\/\d+/
  },
  {
    name: '招生申请',
    listUrl: '/enrollment/applications',
    listSelector: '.application-list',
    detailButtonSelector: 'button:has-text("查看"), button:has-text("详情")',
    detailUrlPattern: /\/application\/detail|\/application\/\d+/
  }
];

// 测试结果
const testResults = [];

async function login(page, user) {
  console.log(`\n🔐 登录用户: ${user.username} (${user.role})`);

  try {
    console.log(`   访问: ${BASE_URL}`);
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });

    // 等待页面加载
    await page.waitForTimeout(3000);

    // 截图查看登录页面
    await page.screenshot({ path: 'screenshots/login-page.png', fullPage: true });
    console.log('   📸 登录页面截图: screenshots/login-page.png');

    // 检查页面标题
    const title = await page.title();
    console.log(`   页面标题: ${title}`);

    // 使用快捷登录按钮
    console.log('   查找快捷登录按钮...');
    const quickLoginSelector = user.username === 'admin' ? '.admin-btn' : '.principal-btn';

    // 等待快捷登录按钮出现
    try {
      await page.waitForSelector(quickLoginSelector, { timeout: 10000 });
      console.log('   ✅ 找到快捷登录按钮');
    } catch (e) {
      console.log('   ⚠️  未找到快捷登录按钮，尝试手动登录...');

      // 手动填写表单
      await page.fill('[data-testid="username-input"]', user.username);
      await page.fill('[data-testid="password-input"]', user.password);
      await page.click('[data-testid="login-button"]');

      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screenshots/after-login-click.png', fullPage: true });

      await page.waitForURL(/\/dashboard|\/home/, { timeout: 15000 });
      console.log('   ✅ 手动登录成功');
      return true;
    }

    await page.click(quickLoginSelector);
    console.log('   点击快捷登录按钮');

    // 等待登录成功
    await page.waitForURL(/\/dashboard|\/home/, { timeout: 15000 });

    console.log('   ✅ 登录成功');
    return true;
  } catch (error) {
    console.log(`   ❌ 登录失败: ${error.message}`);
    await page.screenshot({ path: 'screenshots/login-error.png', fullPage: true });
    console.log('   📸 错误截图: screenshots/login-error.png');
    return false;
  }
}

async function testDetailPage(page, testCase) {
  console.log(`\n📄 测试: ${testCase.name}`);
  console.log(`   URL: ${testCase.listUrl}`);
  
  const result = {
    name: testCase.name,
    listUrl: testCase.listUrl,
    success: false,
    error: null,
    detailPageFound: false,
    detailPageBlank: false,
    screenshot: null
  };
  
  try {
    // 访问列表页
    await page.goto(BASE_URL + testCase.listUrl, { waitUntil: 'networkidle', timeout: 10000 });
    console.log('   ✅ 列表页加载成功');
    
    // 等待列表加载
    await page.waitForTimeout(2000);
    
    // 查找详情按钮
    const detailButtons = await page.$$(testCase.detailButtonSelector);
    
    if (detailButtons.length === 0) {
      console.log('   ⚠️  未找到详情按钮');
      result.error = '未找到详情按钮';
      return result;
    }
    
    console.log(`   ✅ 找到 ${detailButtons.length} 个详情按钮`);
    
    // 点击第一个详情按钮
    await detailButtons[0].click();
    console.log('   ✅ 点击详情按钮');
    
    // 等待页面变化
    await page.waitForTimeout(2000);
    
    // 检查是否跳转到详情页
    const currentUrl = page.url();
    const isDetailPage = testCase.detailUrlPattern.test(currentUrl);
    
    if (isDetailPage) {
      console.log('   ✅ 跳转到详情页');
      result.detailPageFound = true;
      
      // 检查页面内容
      const bodyText = await page.textContent('body');
      const hasContent = bodyText.trim().length > 100;
      
      if (!hasContent) {
        console.log('   ❌ 详情页内容为空');
        result.detailPageBlank = true;
        result.error = '详情页内容为空';
      } else {
        console.log('   ✅ 详情页有内容');
        result.success = true;
      }
      
      // 截图
      const screenshotPath = `screenshots/${testCase.name.replace(/\s+/g, '-')}-detail.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      result.screenshot = screenshotPath;
      console.log(`   📸 截图保存: ${screenshotPath}`);
      
    } else {
      // 可能是对话框形式的详情
      const dialogVisible = await page.isVisible('.el-dialog, .el-drawer');
      
      if (dialogVisible) {
        console.log('   ✅ 详情以对话框形式显示');
        result.detailPageFound = true;
        result.success = true;
      } else {
        console.log('   ❌ 未跳转到详情页，也未显示对话框');
        result.error = '未跳转到详情页';
      }
    }
    
  } catch (error) {
    console.log(`   ❌ 测试失败: ${error.message}`);
    result.error = error.message;
  }
  
  return result;
}

async function runTests() {
  console.log('🚀 开始自动化测试详情页功能\n');
  console.log('=' .repeat(60));
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  try {
    // 登录
    const loginSuccess = await login(page, TEST_USERS.principal);
    
    if (!loginSuccess) {
      console.log('\n❌ 登录失败，无法继续测试');
      return;
    }
    
    // 测试每个页面
    for (const testCase of TEST_PAGES) {
      const result = await testDetailPage(page, testCase);
      testResults.push(result);
      
      // 返回首页
      await page.goto(BASE_URL + '/dashboard', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
    }
    
  } finally {
    await browser.close();
  }
  
  // 生成测试报告
  generateReport();
}

function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试报告\n');
  
  const total = testResults.length;
  const success = testResults.filter(r => r.success).length;
  const failed = testResults.filter(r => !r.success).length;
  const blank = testResults.filter(r => r.detailPageBlank).length;
  
  console.log(`总测试数: ${total}`);
  console.log(`成功: ${success} ✅`);
  console.log(`失败: ${failed} ❌`);
  console.log(`详情页空白: ${blank} ⚠️\n`);
  
  console.log('详细结果:\n');
  
  testResults.forEach((result, index) => {
    console.log(`${index + 1}. ${result.name}`);
    console.log(`   URL: ${result.listUrl}`);
    console.log(`   状态: ${result.success ? '✅ 成功' : '❌ 失败'}`);
    
    if (result.detailPageBlank) {
      console.log(`   ⚠️  详情页空白`);
    }
    
    if (result.error) {
      console.log(`   错误: ${result.error}`);
    }
    
    if (result.screenshot) {
      console.log(`   截图: ${result.screenshot}`);
    }
    
    console.log('');
  });
  
  // 列出需要修复的页面
  const needsFix = testResults.filter(r => !r.success || r.detailPageBlank);
  
  if (needsFix.length > 0) {
    console.log('\n🔧 需要修复的页面:\n');
    needsFix.forEach((result, index) => {
      console.log(`${index + 1}. ${result.name} - ${result.error || '详情页空白'}`);
    });
  }
  
  console.log('\n✨ 测试完成！');
}

// 运行测试
runTests().catch(console.error);

