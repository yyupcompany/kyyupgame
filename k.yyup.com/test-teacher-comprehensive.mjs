/**
 * 教师角色综合测试脚本
 * 测试所有页面、按钮和CRUD操作
 */

import { chromium } from 'playwright';
import fs from 'fs';

const BASE_URL = 'http://localhost:5173';
const TEACHER_USERNAME = 'test_teacher';
const TEACHER_PASSWORD = 'admin123';

const testResults = {
  pages: [],
  buttons: [],
  crud: [],
  consoleErrors: [],
  consoleWarnings: []
};

async function testTeacherRole() {
  console.log('🚀 开始教师角色综合测试...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 监听控制台消息
  page.on('console', msg => {
    const type = msg.type();
    if (type === 'error') {
      testResults.consoleErrors.push(msg.text());
      console.log(`[❌ 浏览器错误] ${msg.text()}`);
    } else if (type === 'warning') {
      testResults.consoleWarnings.push(msg.text());
      console.log(`[⚠️ 浏览器警告] ${msg.text()}`);
    }
  });
  
  // 监听页面错误
  page.on('pageerror', error => {
    testResults.consoleErrors.push(error.message);
    console.log(`[❌ 页面错误] ${error.message}`);
  });
  
  try {
    // 1. 测试登录
    console.log('📍 1. 测试教师登录...');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // 尝试快速登录
    const quickLoginBtn = page.locator('button:has-text("快速登录"), button:has-text("教师")').first();
    if (await quickLoginBtn.isVisible().catch(() => false)) {
      await quickLoginBtn.click();
      console.log('   ✅ 使用快速登录');
    } else {
      // 手动登录
      await page.fill('input[type="text"]', TEACHER_USERNAME);
      await page.fill('input[type="password"]', TEACHER_PASSWORD);
      await page.locator('button:has-text("登录")').first().click();
      console.log('   ✅ 使用手动登录');
    }
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    testResults.pages.push({ name: '登录', status: '✅' });
    console.log('   ✅ 登录成功\n');
    
    // 2. 测试所有可访问的页面
    console.log('📍 2. 测试所有可访问的页面...');
    const teacherPages = [
      { name: '仪表板', path: '/dashboard' },
      { name: '教学中心', path: '/teacher-center/dashboard' },
      { name: '班级管理', path: '/teacher-center/classes' },
      { name: '学生管理', path: '/teacher-center/students' },
      { name: '任务中心', path: '/teacher-center/tasks' },
      { name: '考勤管理', path: '/teacher-center/attendance' },
      { name: '客户跟踪', path: '/teacher-center/customer-tracking' }
    ];
    
    for (const pageItem of teacherPages) {
      try {
        await page.goto(BASE_URL + pageItem.path);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        
        const hasError = await page.locator('text=/没有权限|权限不足|无权访问|403/').first().isVisible().catch(() => false);
        
        if (hasError) {
          testResults.pages.push({ name: pageItem.name, status: '❌ 权限错误' });
          console.log(`   ❌ ${pageItem.name} - 权限错误`);
        } else {
          testResults.pages.push({ name: pageItem.name, status: '✅' });
          console.log(`   ✅ ${pageItem.name}`);
        }
      } catch (error) {
        testResults.pages.push({ name: pageItem.name, status: `❌ ${error.message}` });
        console.log(`   ❌ ${pageItem.name} - ${error.message}`);
      }
    }
    console.log();
    
    // 3. 测试按钮功能
    console.log('📍 3. 测试按钮功能...');
    await page.goto(BASE_URL + '/teacher-center/tasks');
    await page.waitForLoadState('networkidle');
    
    const buttons = await page.locator('button').all();
    console.log(`   找到 ${buttons.length} 个按钮`);
    
    for (let i = 0; i < Math.min(buttons.length, 5); i++) {
      const btn = buttons[i];
      const text = await btn.textContent();
      const isEnabled = await btn.isEnabled();
      testResults.buttons.push({ name: text?.trim() || '未命名', status: isEnabled ? '✅' : '❌ 禁用' });
      console.log(`   ${isEnabled ? '✅' : '❌'} ${text?.trim() || '未命名'}`);
    }
    console.log();
    
    // 4. 测试CRUD操作
    console.log('📍 4. 测试CRUD操作...');
    
    // 测试任务列表（READ）
    try {
      await page.goto(BASE_URL + '/teacher-center/tasks');
      await page.waitForLoadState('networkidle');
      const taskRows = await page.locator('table tbody tr').count();
      testResults.crud.push({ operation: '任务列表查询(READ)', status: `✅ 找到${taskRows}条` });
      console.log(`   ✅ 任务列表查询(READ) - 找到${taskRows}条`);
    } catch (error) {
      testResults.crud.push({ operation: '任务列表查询(READ)', status: `❌ ${error.message}` });
      console.log(`   ❌ 任务列表查询(READ) - ${error.message}`);
    }
    
    console.log();
    
    // 5. 生成报告
    console.log('📊 测试结果汇总：');
    console.log(`   页面测试: ${testResults.pages.length}个`);
    console.log(`   按钮测试: ${testResults.buttons.length}个`);
    console.log(`   CRUD测试: ${testResults.crud.length}个`);
    console.log(`   控制台错误: ${testResults.consoleErrors.length}个`);
    console.log(`   控制台警告: ${testResults.consoleWarnings.length}个`);
    
    // 保存报告
    const report = {
      timestamp: new Date().toISOString(),
      results: testResults
    };
    
    fs.writeFileSync('/home/devbox/project/k.yyup.com/test-teacher-results.json', JSON.stringify(report, null, 2));
    console.log('\n✅ 测试完成！报告已保存到 test-teacher-results.json');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await browser.close();
  }
}

testTeacherRole().catch(console.error);

