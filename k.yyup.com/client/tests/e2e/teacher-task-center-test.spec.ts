import { test, expect } from '@playwright/test';
import { vi } from 'vitest'

/**
 * 教师任务中心E2E测试
 * 测试教师登录后访问任务中心，验证任务列表和统计数据
 */

const BASE_URL = 'http://localhost:5173';
const TEST_TEACHER_USERNAME = 'test_teacher';
const TEST_TEACHER_PASSWORD = 'admin123';

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

describe('教师任务中心测试', () => {
  test.beforeEach(async ({ page }) => {
    // 设置较长的超时时间
    test.setTimeout(60000);
  });

  test('完整流程：登录 → 访问任务中心 → 验证数据', async ({ page }) => {
    console.log('🚀 开始教师任务中心E2E测试');

    // 步骤1: 访问登录页面
    console.log('📍 步骤1: 访问登录页面');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // 验证登录页面加载（使用更宽松的标题匹配）
    await expect(page).toHaveTitle(/用户登录|幼儿园/);
    console.log('✅ 登录页面加载成功');

    // 步骤2: 教师登录
    console.log('📍 步骤2: 教师登录');
    
    // 尝试查找快速登录按钮
    const quickLoginButton = page.locator('button:has-text("快速登录"), button:has-text("教师")').first();
    const isQuickLoginVisible = await quickLoginButton.isVisible().catch(() => false);
    
    if (isQuickLoginVisible) {
      console.log('使用快速登录');
      await quickLoginButton.click();
      await page.waitForTimeout(1000);
    } else {
      console.log('使用表单登录');
      // 填写登录表单
      await page.fill('input[type="text"], input[placeholder*="用户名"]', TEST_TEACHER_USERNAME);
      await page.fill('input[type="password"], input[placeholder*="密码"]', TEST_TEACHER_PASSWORD);
      
      // 点击登录按钮
      const loginButton = page.locator('button:has-text("登录"), button[type="submit"]').first();
      await loginButton.click();
    }

    // 等待登录完成并跳转
    await page.waitForURL(/teacher-center|dashboard/, { timeout: 10000 });
    console.log('✅ 登录成功，当前URL:', page.url());

    // 步骤3: 访问任务中心
    console.log('📍 步骤3: 访问任务中心');
    
    // 等待侧边栏加载
    await page.waitForSelector('.sidebar, .menu, nav', { timeout: 10000 });
    
    // 查找任务中心菜单
    const taskCenterMenu = page.locator('a:has-text("任务中心"), [href*="tasks"]').first();
    
    // 如果当前不在任务中心页面，点击菜单
    if (!page.url().includes('/tasks')) {
      await taskCenterMenu.click();
      await page.waitForURL(/tasks/, { timeout: 10000 });
    }
    
    console.log('✅ 任务中心页面加载成功，当前URL:', page.url());

    // 步骤4: 等待页面加载完成
    console.log('📍 步骤4: 等待页面数据加载');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // 等待API请求完成

    // 步骤5: 验证任务统计
    console.log('📍 步骤5: 验证任务统计');
    
    // 查找统计卡片
    const statsCards = page.locator('.stat-card, .statistics, .card').first();
    await expect(statsCards).toBeVisible({ timeout: 10000 });
    
    // 截图保存统计区域
    await page.screenshot({ 
      path: 'test-results/teacher-task-stats.png',
      fullPage: false 
    });
    console.log('✅ 任务统计区域已截图');

    // 步骤6: 验证任务列表
    console.log('📍 步骤6: 验证任务列表');
    
    // 查找任务列表容器
    const taskListContainer = page.locator('.task-list, .table, .el-table, [class*="list"]').first();
    
    // 等待列表加载
    await page.waitForTimeout(2000);
    
    // 检查是否有"暂无数据"提示
    const noDataText = await page.locator('text=/暂无数据|无数据|No Data/i').count();
    
    if (noDataText > 0) {
      console.log('⚠️  任务列表显示"暂无数据"');
      
      // 检查API调用
      console.log('🔍 检查Network请求...');
      
      // 截图保存
      await page.screenshot({ 
        path: 'test-results/teacher-task-no-data.png',
        fullPage: true 
      });
      
      // 打印页面内容用于调试
      const pageContent = await page.content();
      console.log('📄 页面HTML长度:', pageContent.length);
      
      // 检查Console错误
      page.on('console', msg => {
        if (msg.type() === 'error') {
          console.log('❌ Console错误:', msg.text());
        }
      });
      
    } else {
      console.log('✅ 任务列表有数据');
      
      // 查找任务项
      const taskItems = page.locator('.task-item, .el-table__row, tr').filter({ hasText: /任务|Task/i });
      const taskCount = await taskItems.count();
      
      console.log(`📊 找到 ${taskCount} 个任务项`);
      
      if (taskCount > 0) {
        // 验证第一个任务
        const firstTask = taskItems.first();
        await expect(firstTask).toBeVisible();
        
        const taskText = await firstTask.textContent();
        console.log('📝 第一个任务内容:', taskText);
        
        // 截图保存任务列表
        await page.screenshot({ 
          path: 'test-results/teacher-task-list.png',
          fullPage: true 
        });
        console.log('✅ 任务列表已截图');
      }
    }

    // 步骤7: 检查API调用
    console.log('📍 步骤7: 检查API调用');
    
    // 监听API请求
    const apiCalls: string[] = [];
    page.on('response', response => {
      const url = response.url();
      if (url.includes('/api/teacher-dashboard/tasks')) {
        apiCalls.push(url);
        console.log('📡 API调用:', url, '状态:', response.status());
      }
    });

    // 刷新页面触发API调用
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('📊 API调用记录:', apiCalls);

    // 步骤8: 最终截图
    console.log('📍 步骤8: 保存最终截图');
    await page.screenshot({ 
      path: 'test-results/teacher-task-center-final.png',
      fullPage: true 
    });
    console.log('✅ 最终截图已保存');

    // 测试总结
    console.log('\n' + '='.repeat(60));
    console.log('🎉 教师任务中心E2E测试完成');
    console.log('='.repeat(60));
    console.log('📊 测试结果:');
    console.log('  ✅ 登录成功');
    console.log('  ✅ 任务中心页面加载');
    console.log('  ✅ 页面截图已保存');
    console.log('  📁 截图位置: test-results/');
    console.log('='.repeat(60) + '\n');
  });

  test('验证任务统计API', async ({ page }) => {
    console.log('🧪 测试任务统计API');
    
    // 登录
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // 快速登录或表单登录
    const quickLoginButton = page.locator('button:has-text("快速登录"), button:has-text("教师")').first();
    const isQuickLoginVisible = await quickLoginButton.isVisible().catch(() => false);
    
    if (isQuickLoginVisible) {
      await quickLoginButton.click();
    } else {
      await page.fill('input[type="text"]', TEST_TEACHER_USERNAME);
      await page.fill('input[type="password"]', TEST_TEACHER_PASSWORD);
      await page.locator('button:has-text("登录")').first().click();
    }
    
    await page.waitForURL(/teacher-center|dashboard/, { timeout: 10000 });

    // 直接调用API
    const response = await page.evaluate(async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/teacher-dashboard/tasks/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return res.json();
    });

    console.log('📊 任务统计API响应:', JSON.stringify(response, null, 2));
    
    // 验证响应
    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(response.data.total).toBeGreaterThanOrEqual(0);
    
    console.log('✅ 任务统计API验证通过');
  });

  test('验证任务列表API', async ({ page }) => {
    console.log('🧪 测试任务列表API');
    
    // 登录
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    const quickLoginButton = page.locator('button:has-text("快速登录"), button:has-text("教师")').first();
    const isQuickLoginVisible = await quickLoginButton.isVisible().catch(() => false);
    
    if (isQuickLoginVisible) {
      await quickLoginButton.click();
    } else {
      await page.fill('input[type="text"]', TEST_TEACHER_USERNAME);
      await page.fill('input[type="password"]', TEST_TEACHER_PASSWORD);
      await page.locator('button:has-text("登录")').first().click();
    }
    
    await page.waitForURL(/teacher-center|dashboard/, { timeout: 10000 });

    // 直接调用API
    const response = await page.evaluate(async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/teacher-dashboard/tasks?page=1&pageSize=20', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return res.json();
    });

    console.log('📊 任务列表API响应:', JSON.stringify(response, null, 2));
    
    // 验证响应
    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(response.data.list).toBeDefined();
    expect(Array.isArray(response.data.list)).toBe(true);
    
    if (response.data.list.length > 0) {
      console.log('✅ 任务列表有数据:', response.data.list.length, '条');
      console.log('📝 第一个任务:', response.data.list[0].title);
    } else {
      console.log('⚠️  任务列表为空');
    }
    
    console.log('✅ 任务列表API验证通过');
  });
});

