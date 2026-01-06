/**
 * 教师页面测试脚本 - 使用Playwright
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';
const TEACHER_EMAIL = 'teacher@test.com';
const TEACHER_PASSWORD = '123456';

async function testTeacherPages() {
  console.log('🚀 开始测试教师页面...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 // 慢速执行，方便观察
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 监听控制台消息
  page.on('console', msg => {
    const type = msg.type();
    if (type === 'error' || type === 'warning') {
      console.log(`[浏览器${type}] ${msg.text()}`);
    }
  });
  
  // 监听页面错误
  page.on('pageerror', error => {
    console.log(`[页面错误] ${error.message}`);
  });
  
  try {
    // 1. 访问首页
    console.log('📍 1. 访问首页...');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    console.log('   ✅ 首页加载完成\n');
    
    // 2. 检查是否需要登录
    console.log('📍 2. 检查登录状态...');
    const loginButton = await page.locator('button:has-text("登录")').first();
    
    if (await loginButton.isVisible().catch(() => false)) {
      console.log('   需要登录，开始登录流程...');
      
      // 输入用户名
      await page.fill('input[type="text"], input[placeholder*="用户名"], input[placeholder*="邮箱"]', TEACHER_EMAIL);
      console.log('   ✅ 已输入用户名');
      
      // 输入密码
      await page.fill('input[type="password"]', TEACHER_PASSWORD);
      console.log('   ✅ 已输入密码');
      
      // 点击登录
      await loginButton.click();
      console.log('   ✅ 已点击登录按钮');
      
      // 等待登录完成
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      console.log('   ✅ 登录完成\n');
    } else {
      console.log('   ✅ 已登录\n');
    }
    
    // 3. 检查侧边栏菜单
    console.log('📍 3. 检查侧边栏菜单...');
    await page.waitForTimeout(1000);
    
    // 查找客户跟踪菜单
    const customerTrackingMenu = await page.locator('text=客户跟踪').first();
    const isVisible = await customerTrackingMenu.isVisible().catch(() => false);
    
    if (isVisible) {
      console.log('   ✅ 找到"客户跟踪"菜单\n');
      
      // 4. 点击客户跟踪菜单
      console.log('📍 4. 点击客户跟踪菜单...');
      await customerTrackingMenu.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // 检查是否有权限错误
      const errorText = await page.locator('text=没有权限, text=权限不足, text=无权访问').first().isVisible().catch(() => false);
      
      if (errorText) {
        console.log('   ❌ 显示权限错误！');
        
        // 截图保存
        await page.screenshot({ path: 'permission-error.png', fullPage: true });
        console.log('   📸 已保存错误截图: permission-error.png\n');
      } else {
        console.log('   ✅ 没有权限错误\n');
        
        // 5. 检查页面内容
        console.log('📍 5. 检查客户跟踪页面...');
        const pageTitle = await page.title();
        console.log(`   页面标题: ${pageTitle}`);
        
        // 截图
        await page.screenshot({ path: 'customer-tracking-list.png', fullPage: true });
        console.log('   📸 已保存页面截图: customer-tracking-list.png\n');
      }
    } else {
      console.log('   ❌ 未找到"客户跟踪"菜单');
      console.log('   可能的原因:');
      console.log('   1. 权限未正确配置');
      console.log('   2. 菜单名称不匹配');
      console.log('   3. 需要刷新页面\n');
      
      // 截图保存
      await page.screenshot({ path: 'sidebar-menu.png', fullPage: true });
      console.log('   📸 已保存侧边栏截图: sidebar-menu.png\n');
    }
    
    // 6. 遍历所有教师中心菜单
    console.log('📍 6. 检查所有教师中心菜单...');
    
    const teacherMenus = [
      { name: '教师工作台', path: '/teacher-center/dashboard' },
      { name: '通知中心', path: '/teacher-center/notifications' },
      { name: '任务中心', path: '/teacher-center/tasks' },
      { name: '活动中心', path: '/teacher-center/activities' },
      { name: '招生中心', path: '/teacher-center/enrollment' },
      { name: '教学中心', path: '/teacher-center/teaching' },
      { name: '客户跟踪', path: '/teacher-center/customer-tracking' }
    ];
    
    for (const menu of teacherMenus) {
      console.log(`\n   测试菜单: ${menu.name}`);
      
      try {
        // 直接访问路径
        await page.goto(BASE_URL + menu.path);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        
        // 检查权限错误
        const hasError = await page.locator('text=没有权限, text=权限不足, text=无权访问, text=403').first().isVisible().catch(() => false);
        
        if (hasError) {
          console.log(`   ❌ ${menu.name} - 权限错误`);
        } else {
          console.log(`   ✅ ${menu.name} - 正常访问`);
        }
        
        // 检查控制台错误
        const errors = [];
        page.on('console', msg => {
          if (msg.type() === 'error') {
            errors.push(msg.text());
          }
        });
        
        if (errors.length > 0) {
          console.log(`   ⚠️  控制台错误: ${errors.length}个`);
        }
        
      } catch (error) {
        console.log(`   ❌ ${menu.name} - 访问失败: ${error.message}`);
      }
    }
    
    console.log('\n✅ 测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    // 保持浏览器打开，方便查看
    console.log('\n💡 浏览器将保持打开状态，按Ctrl+C关闭');
    // await browser.close();
  }
}

// 运行测试
testTeacherPages().catch(console.error);

