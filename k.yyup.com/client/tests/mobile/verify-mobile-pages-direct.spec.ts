import { test, expect } from '@playwright/test';
import { MobilePageDebugger } from './mcp-mobile-debug-utils';

const DEBUG_PORT = 5174;
const DEBUG_URL = `http://localhost:${DEBUG_PORT}`;

test.describe('移动端页面直接访问测试', () => {
  let pageDebugger: MobilePageDebugger;

  test.beforeEach(async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });

    // 创建调试器实例
    pageDebugger = new MobilePageDebugger(page);
  });

  test('测试1: 管理员登录和Dashboard', async ({ page }) => {
    console.log('\n═══════════════════════════════════════════════');
    console.log('🧪 测试: 管理员登录和Dashboard访问');
    console.log('═══════════════════════════════════════════════\n');

    // 访问移动端登录页
    console.log('📱 访问移动端登录页...');
    await page.goto(`${DEBUG_URL}/mobile/login`);
    await page.waitForLoadState('networkidle');

    // 点击管理员快速登录
    console.log('🔐 点击管理员快速登录...');
    await page.click('text=超级管理员登录');
    await page.waitForLoadState('networkidle');

    // 验证已跳转到Dashboard
    const currentUrl = page.url();
    console.log(`✅ 已登录，当前路径: ${currentUrl.replace(DEBUG_URL, '')}`);

    // 捕获并验证Dashboard页面
    const dashboardResult = await pageDebugger.capturePageErrors();

    // 验证结果
    expect(currentUrl).toContain('/mobile/dashboard');
    expect(dashboardResult.errors).toHaveLength(0);
    expect(dashboardResult.hasBlankPage).toBe(false);

    console.log('✅ Dashboard页面加载成功，无错误\n');
  });

  test('测试2: 教师中心页面', async ({ page }) => {
    console.log('\n═══════════════════════════════════════════════');
    console.log('🧪 测试: 教师中心页面');
    console.log('═══════════════════════════════════════════════\n');

    // 直接访问教师中心
    console.log('📱 访问教师中心...');
    await page.goto(`${DEBUG_URL}/mobile/centers/teacher-center`);
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    console.log(`✅ 当前路径: ${currentUrl.replace(DEBUG_URL, '')}`);

    // 捕获页面数据
    const result = await pageDebugger.capturePageErrors();

    // 验证是占位页面但有有效内容
    expect(currentUrl).toContain('/mobile/centers/teacher-center');
    expect(result.errors).toHaveLength(0);
    expect(result.pageMetrics.totalContentLength).toBeGreaterThan(100);

    console.log('✅ 教师中心页面访问正常\n');
  });

  test('测试3: 家长中心Dashboard', async ({ page }) => {
    console.log('\n═══════════════════════════════════════════════');
    console.log('🧪 测试: 家长中心Dashboard');
    console.log('═══════════════════════════════════════════════\n');

    // 访问登录页
    await page.goto(`${DEBUG_URL}/mobile/login`);
    await page.waitForLoadState('networkidle');

    // 点击家长快速登录
    console.log('👨‍👩‍👧‍👦 点击家长快速登录...');
    await page.click('text=家长登录');
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    console.log(`✅ 已登录，当前路径: ${currentUrl.replace(DEBUG_URL, '')}`);

    // 验证页面加载
    expect(currentUrl).toContain('/mobile/parent-center/dashboard');

    const result = await pageDebugger.capturePageErrors();
    expect(result.errors).toHaveLength(0);

    console.log('✅ 家长中心Dashboard访问正常\n');
  });

  test('测试4: 学生管理页面', async ({ page }) => {
    console.log('\n═══════════════════════════════════════════════');
    console.log('🧪 测试: 学生管理页面');
    console.log('═══════════════════════════════════════════════\n');

    // 直接访问学生管理页面
    console.log('📱 访问学生管理页面...');
    await page.goto(`${DEBUG_URL}/mobile/centers/student-center`);
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    console.log(`✅ 当前路径: ${currentUrl.replace(DEBUG_URL, '')}`);

    // 捕获页面数据
    const result = await pageDebugger.capturePageErrors();

    // 验证页面有内容（学生管理有真实数据）
    expect(currentUrl).toContain('/mobile/centers/student-center');
    expect(result.errors).toHaveLength(0);
    expect(result.pageMetrics.totalContentLength).toBeGreaterThan(1000);

    console.log('✅ 学生管理页面访问正常\n');
  });

  test('测试5: 通知中心页面', async ({ page }) => {
    console.log('\n═══════════════════════════════════════════════');
    console.log('🧪 测试: 通知中心页面');
    console.log('═══════════════════════════════════════════════\n');

    // 访问通知中心
    console.log('📱 访问通知中心...');
    await page.goto(`${DEBUG_URL}/mobile/centers/notification-center`);
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    console.log(`✅ 当前路径: ${currentUrl.replace(DEBUG_URL, '')}`);

    // 捕获数据
    const result = await pageDebugger.capturePageErrors();

    expect(currentUrl).toContain('/mobile/centers/notification-center');
    expect(result.errors).toHaveLength(0);

    console.log('✅ 通知中心页面访问正常\n');
  });

  test('测试6: 考勤中心页面', async ({ page }) => {
    console.log('\n═══════════════════════════════════════════════');
    console.log('🧪 测试: 考勤中心页面');
    console.log('═══════════════════════════════════════════════\n');

    // 访问考勤中心
    console.log('📱 访问考勤中心...');
    await page.goto(`${DEBUG_URL}/mobile/centers/attendance-center`);
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    console.log(`✅ 当前路径: ${currentUrl.replace(DEBUG_URL, '')}`);

    const result = await pageDebugger.capturePageErrors();

    expect(currentUrl).toContain('/mobile/centers/attendance-center');
    expect(result.errors).toHaveLength(0);

    console.log('✅ 考勤中心页面访问正常\n');
  });

  test('测试7: 教学管理中心页面（已开发）', async ({ page }) => {
    console.log('\n═══════════════════════════════════════════════');
    console.log('🧪 测试: 教学管理中心页面');
    console.log('═══════════════════════════════════════════════\n');

    // 访问教学管理中心
    console.log('📱 访问教学管理中心...');
    await page.goto(`${DEBUG_URL}/mobile/centers/teaching-center`);
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    console.log(`✅ 当前路径: ${currentUrl.replace(DEBUG_URL, '')}`);

    const result = await pageDebugger.capturePageErrors();

    expect(currentUrl).toContain('/mobile/centers/teaching-center');
    expect(result.errors).toHaveLength(0);

    console.log('✅ 教学管理中心页面访问正常\n');
  });

  test('测试8: 教师工作台页面', async ({ page }) => {
    console.log('\n═══════════════════════════════════════════════');
    console.log('🧪 测试: 教师工作台页面');
    console.log('═══════════════════════════════════════════════\n');

    // 登录为教师
    await page.goto(`${DEBUG_URL}/mobile/login`);
    await page.waitForLoadState('networkidle');
    await page.click('text=老师登录');
    await page.waitForLoadState('networkidle');

    // 直接访问教师工作台
    console.log('📱 访问教师工作台...');
    await page.goto(`${DEBUG_URL}/mobile/teacher-center`);
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    console.log(`✅ 当前路径: ${currentUrl.replace(DEBUG_URL, '')}`);

    const result = await pageDebugger.capturePageErrors();

    expect(currentUrl).toContain('/mobile/teacher-center');
    expect(result.errors).toHaveLength(0);

    console.log('✅ 教师工作台页面访问正常\n');
  });

  test('测试9: 家长孩子列表页面', async ({ page }) => {
    console.log('\n═══════════════════════════════════════════════');
    console.log('🧪 测试: 家长孩子列表页面');
    console.log('═══════════════════════════════════════════════\n');

    // 登录为家长
    await page.goto(`${DEBUG_URL}/mobile/login`);
    await page.waitForLoadState('networkidle');
    await page.click('text=家长登录');
    await page.waitForLoadState('networkidle');

    // 访问孩子列表
    console.log('📱 访问孩子列表页面...');
    await page.goto(`${DEBUG_URL}/mobile/parent-center/children`);
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    console.log(`✅ 当前路径: ${currentUrl.replace(DEBUG_URL, '')}`);

    const result = await pageDebugger.capturePageErrors();

    expect(currentUrl).toContain('/mobile/parent-center/children');
    expect(result.errors).toHaveLength(0);
    expect(result.pageMetrics.totalContentLength).toBeGreaterThan(500);

    console.log('✅ 孩子列表页面访问正常\n');
  });

  test('测试10: 家长成长记录页面', async ({ page }) => {
    console.log('\n═══════════════════════════════════════════════');
    console.log('🧪 测试: 家长成长记录页面');
    console.log('═══════════════════════════════════════════════\n');

    // 登录为家长
    await page.goto(`${DEBUG_URL}/mobile/login`);
    await page.waitForLoadState('networkidle');
    await page.click('text=家长登录');
    await page.waitForLoadState('networkidle');

    // 访问成长记录
    console.log('📱 访问成长记录页面...');
    await page.goto(`${DEBUG_URL}/mobile/parent-center/child-growth`);
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    console.log(`✅ 当前路径: ${currentUrl.replace(DEBUG_URL, '')}`);

    const result = await pageDebugger.capturePageErrors();

    expect(currentUrl).toContain('/mobile/parent-center/child-growth');
    expect(result.errors).toHaveLength(0);

    console.log('✅ 成长记录页面访问正常\n');
  });
});
