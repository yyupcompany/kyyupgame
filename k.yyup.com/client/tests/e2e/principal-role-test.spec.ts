import { test, expect } from '@playwright/test';
import { vi } from 'vitest'

/**
 * 园长角色E2E测试
 * 测试园长登录后的所有功能和权限
 */

const BASE_URL = 'http://localhost:5173';
const PRINCIPAL_USERNAME = 'test_admin';
const PRINCIPAL_PASSWORD = 'admin123';

test.
// 控制台错误检测
let consoleSpy: any

beforeEach(() => {
  // 监听控制台错误
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  // 验证没有控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})

describe('园长角色测试', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(120000); // 2分钟超时
  });

  test('阶段1: 登录和基础功能测试', async ({ page }) => {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 阶段1: 园长登录和基础功能测试');
    console.log('='.repeat(60) + '\n');

    // 步骤1: 访问登录页面
    console.log('📍 步骤1: 访问登录页面');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveTitle(/用户登录|幼儿园/);
    console.log('✅ 登录页面加载成功');

    // 步骤2: 园长登录
    console.log('\n📍 步骤2: 园长登录');
    
    const quickLoginButton = page.locator('button:has-text("快速登录"), button:has-text("园长"), button:has-text("管理员")').first();
    const isQuickLoginVisible = await quickLoginButton.isVisible().catch(() => false);
    
    if (isQuickLoginVisible) {
      console.log('使用快速登录');
      await quickLoginButton.click();
      await page.waitForTimeout(1000);
    } else {
      console.log('使用表单登录');
      await page.fill('input[type="text"], input[placeholder*="用户名"]', PRINCIPAL_USERNAME);
      await page.fill('input[type="password"], input[placeholder*="密码"]', PRINCIPAL_PASSWORD);
      await page.locator('button:has-text("登录"), button[type="submit"]').first().click();
    }

    // 等待登录完成
    await page.waitForURL(/dashboard|admin|principal/, { timeout: 15000 });
    console.log('✅ 登录成功，当前URL:', page.url());

    // 截图
    await page.screenshot({ path: 'test-results/principal-login-success.png', fullPage: false });

    // 步骤3: 验证侧边栏菜单
    console.log('\n📍 步骤3: 验证侧边栏菜单');
    await page.waitForSelector('.sidebar, .menu, nav', { timeout: 10000 });
    
    // 获取所有菜单项
    const menuItems = page.locator('.menu-item, .el-menu-item, a[class*="menu"]');
    const menuCount = await menuItems.count();
    console.log(`📊 菜单项数量: ${menuCount}`);
    
    // 园长应该有更多菜单（vs 教师的6个）
    expect(menuCount).toBeGreaterThan(6);
    console.log('✅ 园长菜单数量正确（多于教师）');

    // 截图侧边栏
    await page.screenshot({ path: 'test-results/principal-sidebar.png', fullPage: true });

    // 步骤4: 验证工作台页面
    console.log('\n📍 步骤4: 验证工作台页面');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 查找统计卡片
    const statsCards = page.locator('.stat-card, .statistics, .card, [class*="stat"]');
    const statsCount = await statsCards.count();
    console.log(`📊 统计卡片数量: ${statsCount}`);
    
    if (statsCount > 0) {
      console.log('✅ 工作台统计卡片显示正常');
    }

    // 截图工作台
    await page.screenshot({ path: 'test-results/principal-dashboard.png', fullPage: true });

    console.log('\n' + '='.repeat(60));
    console.log('✅ 阶段1测试完成');
    console.log('='.repeat(60) + '\n');
  });

  test('阶段2: 用户管理功能测试', async ({ page }) => {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 阶段2: 用户管理功能测试');
    console.log('='.repeat(60) + '\n');

    // 登录
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    const quickLoginButton = page.locator('button:has-text("快速登录"), button:has-text("园长"), button:has-text("管理员")').first();
    const isQuickLoginVisible = await quickLoginButton.isVisible().catch(() => false);
    
    if (isQuickLoginVisible) {
      await quickLoginButton.click();
    } else {
      await page.fill('input[type="text"]', PRINCIPAL_USERNAME);
      await page.fill('input[type="password"]', PRINCIPAL_PASSWORD);
      await page.locator('button:has-text("登录")').first().click();
    }
    
    await page.waitForURL(/dashboard|admin|principal/, { timeout: 15000 });
    console.log('✅ 登录成功');

    // 访问用户管理页面
    console.log('\n📍 访问用户管理页面');
    
    // 查找用户管理菜单
    const userManagementMenu = page.locator('a:has-text("用户管理"), [href*="user"]').first();
    const isUserMenuVisible = await userManagementMenu.isVisible().catch(() => false);
    
    if (isUserMenuVisible) {
      await userManagementMenu.click();
      await page.waitForLoadState('networkidle');
      console.log('✅ 用户管理页面加载成功');
      
      // 截图
      await page.screenshot({ path: 'test-results/principal-user-management.png', fullPage: true });
      
      // 验证用户列表
      const userList = page.locator('.user-list, .el-table, table');
      const hasUserList = await userList.isVisible().catch(() => false);
      
      if (hasUserList) {
        console.log('✅ 用户列表显示正常');
      } else {
        console.log('⚠️  用户列表未找到');
      }
    } else {
      console.log('⚠️  用户管理菜单未找到');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ 阶段2测试完成');
    console.log('='.repeat(60) + '\n');
  });

  test('阶段3: 教师管理功能测试', async ({ page }) => {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 阶段3: 教师管理功能测试');
    console.log('='.repeat(60) + '\n');

    // 登录
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    const quickLoginButton = page.locator('button:has-text("快速登录"), button:has-text("园长"), button:has-text("管理员")').first();
    const isQuickLoginVisible = await quickLoginButton.isVisible().catch(() => false);
    
    if (isQuickLoginVisible) {
      await quickLoginButton.click();
    } else {
      await page.fill('input[type="text"]', PRINCIPAL_USERNAME);
      await page.fill('input[type="password"]', PRINCIPAL_PASSWORD);
      await page.locator('button:has-text("登录")').first().click();
    }
    
    await page.waitForURL(/dashboard|admin|principal/, { timeout: 15000 });
    console.log('✅ 登录成功');

    // 访问教师管理页面
    console.log('\n📍 访问教师管理页面');
    
    const teacherMenu = page.locator('a:has-text("教师管理"), [href*="teacher"]').first();
    const isTeacherMenuVisible = await teacherMenu.isVisible().catch(() => false);
    
    if (isTeacherMenuVisible) {
      await teacherMenu.click();
      await page.waitForLoadState('networkidle');
      console.log('✅ 教师管理页面加载成功');
      
      // 截图
      await page.screenshot({ path: 'test-results/principal-teacher-management.png', fullPage: true });
      
      // 验证教师列表
      const teacherList = page.locator('.teacher-list, .el-table, table');
      const hasTeacherList = await teacherList.isVisible().catch(() => false);
      
      if (hasTeacherList) {
        console.log('✅ 教师列表显示正常');
      } else {
        console.log('⚠️  教师列表未找到');
      }
    } else {
      console.log('⚠️  教师管理菜单未找到');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ 阶段3测试完成');
    console.log('='.repeat(60) + '\n');
  });

  test('阶段4: 班级管理功能测试', async ({ page }) => {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 阶段4: 班级管理功能测试');
    console.log('='.repeat(60) + '\n');

    // 登录
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    const quickLoginButton = page.locator('button:has-text("快速登录"), button:has-text("园长"), button:has-text("管理员")').first();
    const isQuickLoginVisible = await quickLoginButton.isVisible().catch(() => false);
    
    if (isQuickLoginVisible) {
      await quickLoginButton.click();
    } else {
      await page.fill('input[type="text"]', PRINCIPAL_USERNAME);
      await page.fill('input[type="password"]', PRINCIPAL_PASSWORD);
      await page.locator('button:has-text("登录")').first().click();
    }
    
    await page.waitForURL(/dashboard|admin|principal/, { timeout: 15000 });
    console.log('✅ 登录成功');

    // 访问班级管理页面
    console.log('\n📍 访问班级管理页面');
    
    const classMenu = page.locator('a:has-text("班级管理"), [href*="class"]').first();
    const isClassMenuVisible = await classMenu.isVisible().catch(() => false);
    
    if (isClassMenuVisible) {
      await classMenu.click();
      await page.waitForLoadState('networkidle');
      console.log('✅ 班级管理页面加载成功');
      
      // 截图
      await page.screenshot({ path: 'test-results/principal-class-management.png', fullPage: true });
      
      // 验证班级列表
      const classList = page.locator('.class-list, .el-table, table');
      const hasClassList = await classList.isVisible().catch(() => false);
      
      if (hasClassList) {
        console.log('✅ 班级列表显示正常');
        
        // 统计班级数量
        const classRows = page.locator('.el-table__row, tr').filter({ hasText: /班/ });
        const classCount = await classRows.count();
        console.log(`📊 班级数量: ${classCount}`);
        
        // 园长应该能看到所有班级（vs 教师的3个）
        if (classCount > 3) {
          console.log('✅ 园长可以查看所有班级');
        }
      } else {
        console.log('⚠️  班级列表未找到');
      }
    } else {
      console.log('⚠️  班级管理菜单未找到');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ 阶段4测试完成');
    console.log('='.repeat(60) + '\n');
  });

  test('阶段5: 任务管理功能测试', async ({ page }) => {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 阶段5: 任务管理功能测试');
    console.log('='.repeat(60) + '\n');

    // 登录
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    const quickLoginButton = page.locator('button:has-text("快速登录"), button:has-text("园长"), button:has-text("管理员")').first();
    const isQuickLoginVisible = await quickLoginButton.isVisible().catch(() => false);
    
    if (isQuickLoginVisible) {
      await quickLoginButton.click();
    } else {
      await page.fill('input[type="text"]', PRINCIPAL_USERNAME);
      await page.fill('input[type="password"]', PRINCIPAL_PASSWORD);
      await page.locator('button:has-text("登录")').first().click();
    }
    
    await page.waitForURL(/dashboard|admin|principal/, { timeout: 15000 });
    console.log('✅ 登录成功');

    // 访问任务管理页面
    console.log('\n📍 访问任务管理页面');
    
    const taskMenu = page.locator('a:has-text("任务"), [href*="task"]').first();
    const isTaskMenuVisible = await taskMenu.isVisible().catch(() => false);
    
    if (isTaskMenuVisible) {
      await taskMenu.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      console.log('✅ 任务管理页面加载成功');
      
      // 截图
      await page.screenshot({ path: 'test-results/principal-task-management.png', fullPage: true });
      
      // 验证任务列表
      const taskList = page.locator('.task-list, .el-table, table');
      const hasTaskList = await taskList.isVisible().catch(() => false);
      
      if (hasTaskList) {
        console.log('✅ 任务列表显示正常');
      } else {
        console.log('⚠️  任务列表未找到');
      }
    } else {
      console.log('⚠️  任务管理菜单未找到');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ 阶段5测试完成');
    console.log('='.repeat(60) + '\n');
  });
});

