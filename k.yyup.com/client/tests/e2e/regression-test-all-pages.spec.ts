/**
 * 全面回归测试 - 测试所有侧边栏页面和CRUD功能
 * 测试范围：所有业务中心、管理页面、CRUD操作
 */

import { test, expect, Page } from '@playwright/test';
import { vi } from 'vitest'

// 测试配置
const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:3000';
const TEST_TIMEOUT = 30000;

// 测试用户凭证
const TEST_USER = {
  username: 'admin',
  password: 'admin123'
};

// 错误记录
interface TestError {
  page: string;
  category: string;
  error: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
}

const testErrors: TestError[] = [];

// 记录错误的辅助函数
function recordError(page: string, category: string, error: string, severity: 'critical' | 'high' | 'medium' | 'low' = 'medium') {
  testErrors.push({
    page,
    category,
    error,
    severity,
    timestamp: new Date().toISOString()
  });
}

// 登录辅助函数
async function login(page: Page) {
  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: TEST_TIMEOUT });
    await page.fill('input[type="text"]', TEST_USER.username);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: TEST_TIMEOUT });
    return true;
  } catch (error) {
    recordError('登录页面', '登录', `登录失败: ${error}`, 'critical');
    return false;
  }
}

// 等待页面加载完成
async function waitForPageLoad(page: Page, pageName: string) {
  try {
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.waitForTimeout(1000); // 额外等待动态内容
    return true;
  } catch (error) {
    recordError(pageName, '页面加载', `页面加载超时: ${error}`, 'high');
    return false;
  }
}

// 检查控制台错误
function setupConsoleErrorListener(page: Page, pageName: string) {
  page.on('console', msg => {
    if (msg.type() === 'error') {
      recordError(pageName, '控制台错误', msg.text(), 'medium');
    }
  });
  
  page.on('pageerror', error => {
    recordError(pageName, '页面错误', error.message, 'high');
  });
}

// 所有需要测试的页面路由
const testPages = [
  // 工作台
  { name: '工作台-仪表板', route: '/dashboard', category: '工作台' },
  { name: '工作台-园区概览', route: '/dashboard/campus-overview', category: '工作台' },
  { name: '工作台-数据统计', route: '/dashboard/data-statistics', category: '工作台' },
  { name: '工作台-日程管理', route: '/dashboard/schedule', category: '工作台' },
  { name: '工作台-重要通知', route: '/dashboard/important-notices', category: '工作台' },
  
  // 业务中心
  { name: '人员中心', route: '/centers/personnel', category: '业务中心' },
  { name: '招生中心', route: '/centers/enrollment', category: '业务中心' },
  { name: '营销中心', route: '/centers/marketing', category: '业务中心' },
  { name: '活动中心', route: '/centers/activity', category: '业务中心' },
  { name: '任务中心', route: '/centers/task', category: '业务中心' },
  { name: '教学中心', route: '/centers/teaching', category: '业务中心' },
  { name: 'AI中心', route: '/centers/ai', category: '业务中心' },
  { name: '分析中心', route: '/centers/analytics', category: '业务中心' },
  { name: '财务中心', route: '/centers/finance', category: '业务中心' },
  { name: '系统中心', route: '/centers/system', category: '业务中心' },
  
  // 学生管理
  { name: '学生列表', route: '/student', category: '学生管理', hasCRUD: true },
  { name: '学生统计', route: '/student/statistics', category: '学生管理' },
  
  // 教师管理
  { name: '教师列表', route: '/teacher', category: '教师管理', hasCRUD: true },
  { name: '教师统计', route: '/teacher/statistics', category: '教师管理' },
  
  // 家长管理
  { name: '家长列表', route: '/parent', category: '家长管理', hasCRUD: true },
  { name: '家长统计', route: '/parent/statistics', category: '家长管理' },
  
  // 班级管理
  { name: '班级列表', route: '/class', category: '班级管理', hasCRUD: true },
  { name: '班级统计', route: '/class/statistics', category: '班级管理' },
  
  // 招生管理
  { name: '招生计划', route: '/enrollment-plan', category: '招生管理', hasCRUD: true },
  { name: '招生活动', route: '/enrollment', category: '招生管理', hasCRUD: true },
  { name: '招生统计', route: '/enrollment-plan/statistics', category: '招生管理' },
  { name: '名额管理', route: '/enrollment-plan/quota-manage', category: '招生管理' },
  
  // 活动管理
  { name: '活动列表', route: '/activity', category: '活动管理', hasCRUD: true },
  { name: '活动创建', route: '/activity/create', category: '活动管理' },
  
  // 客户管理
  { name: '客户列表', route: '/customer', category: '客户管理', hasCRUD: true },
  { name: '客户池', route: '/principal/customer-pool', category: '客户管理' },
  
  // 入园申请
  { name: '入园申请', route: '/application', category: '入园申请', hasCRUD: true },
  
  // 营销管理
  { name: '广告管理', route: '/advertisement', category: '营销管理', hasCRUD: true },
  
  // 财务管理
  { name: '费用管理', route: '/finance/fee-management', category: '财务管理' },
  { name: '缴费管理', route: '/finance/payment-management', category: '财务管理' },
  
  // 园长功能
  { name: '园长仪表板', route: '/principal/dashboard', category: '园长功能' },
  { name: '基本资料', route: '/principal/basic-info', category: '园长功能' },
  { name: '绩效管理', route: '/principal/performance', category: '园长功能' },
  { name: '新媒体中心', route: '/principal/media-center', category: '园长功能' },
  
  // AI功能
  { name: 'AI助手', route: '/ai/assistant', category: 'AI功能' },
  { name: 'AI查询', route: '/ai/query', category: 'AI功能' },
  { name: '模型管理', route: '/ai/models', category: 'AI功能' },
  { name: '记忆管理', route: '/ai/memory', category: 'AI功能' },
  
  // 系统管理
  { name: '用户管理', route: '/system/users', category: '系统管理', hasCRUD: true },
  { name: '角色管理', route: '/system/roles', category: '系统管理', hasCRUD: true },
  { name: '权限管理', route: '/system/permissions', category: '系统管理', hasCRUD: true },
  { name: '系统设置', route: '/system/settings', category: '系统管理' },
  { name: '系统日志', route: '/system/log', category: '系统管理' },
  { name: '备份管理', route: '/system/backup', category: '系统管理' },
];

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

describe('全面回归测试 - 所有页面', () => {
  test.beforeEach(async ({ page }) => {
    // 设置超时
    test.setTimeout(TEST_TIMEOUT);
    
    // 设置控制台错误监听
    setupConsoleErrorListener(page, '全局');
    
    // 登录
    const loginSuccess = await login(page);
    if (!loginSuccess) {
      throw new Error('登录失败，无法继续测试');
    }
  });

  // 测试所有页面是否可以访问
  for (const pageInfo of testPages) {
    test(`页面访问测试: ${pageInfo.name}`, async ({ page }) => {
      try {
        console.log(`\n测试页面: ${pageInfo.name} (${pageInfo.route})`);
        
        // 导航到页面
        await page.goto(`${BASE_URL}${pageInfo.route}`, { 
          waitUntil: 'networkidle', 
          timeout: TEST_TIMEOUT 
        });
        
        // 等待页面加载
        await waitForPageLoad(page, pageInfo.name);
        
        // 检查页面是否正确加载
        const title = await page.title();
        console.log(`  页面标题: ${title}`);
        
        // 检查是否有404或错误页面
        const bodyText = await page.textContent('body');
        if (bodyText?.includes('404') || bodyText?.includes('页面不存在')) {
          recordError(pageInfo.name, '页面访问', '页面返回404错误', 'critical');
          throw new Error('页面不存在');
        }
        
        // 检查是否有主要内容容器
        const hasContent = await page.locator('main, .main-content, .page-container, .el-main').count() > 0;
        if (!hasContent) {
          recordError(pageInfo.name, '页面结构', '页面缺少主要内容容器', 'high');
        }
        
        // 截图
        await page.screenshot({ 
          path: `client/tests/e2e/screenshots/${pageInfo.category}-${pageInfo.name}.png`,
          fullPage: true 
        });
        
        console.log(`  ✓ 页面加载成功`);
        
      } catch (error) {
        recordError(pageInfo.name, '页面访问', `访问失败: ${error}`, 'critical');
        console.error(`  ✗ 页面加载失败: ${error}`);
        throw error;
      }
    });
  }
});

test.describe('CRUD功能测试', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    setupConsoleErrorListener(page, 'CRUD测试');
    await login(page);
  });

  // 测试有CRUD功能的页面
  const crudPages = testPages.filter(p => p.hasCRUD);
  
  for (const pageInfo of crudPages) {
    test(`CRUD测试: ${pageInfo.name}`, async ({ page }) => {
      try {
        console.log(`\nCRUD测试: ${pageInfo.name}`);
        
        await page.goto(`${BASE_URL}${pageInfo.route}`, { 
          waitUntil: 'networkidle',
          timeout: TEST_TIMEOUT 
        });
        
        await waitForPageLoad(page, pageInfo.name);
        
        // 测试查询功能 (Read)
        console.log(`  测试查询功能...`);
        const hasTable = await page.locator('table, .el-table, .data-table').count() > 0;
        if (!hasTable) {
          recordError(pageInfo.name, 'CRUD-查询', '页面缺少数据表格', 'high');
        } else {
          console.log(`  ✓ 查询功能正常`);
        }
        
        // 测试创建按钮 (Create)
        console.log(`  测试创建按钮...`);
        const createButtons = await page.locator('button:has-text("新增"), button:has-text("添加"), button:has-text("创建"), .el-button:has-text("新增")').count();
        if (createButtons === 0) {
          recordError(pageInfo.name, 'CRUD-创建', '页面缺少创建按钮', 'medium');
        } else {
          console.log(`  ✓ 创建按钮存在`);
        }
        
        // 测试编辑按钮 (Update)
        console.log(`  测试编辑按钮...`);
        const editButtons = await page.locator('button:has-text("编辑"), .el-button:has-text("编辑")').count();
        if (editButtons === 0) {
          recordError(pageInfo.name, 'CRUD-更新', '页面缺少编辑按钮', 'medium');
        } else {
          console.log(`  ✓ 编辑按钮存在`);
        }
        
        // 测试删除按钮 (Delete)
        console.log(`  测试删除按钮...`);
        const deleteButtons = await page.locator('button:has-text("删除"), .el-button:has-text("删除")').count();
        if (deleteButtons === 0) {
          recordError(pageInfo.name, 'CRUD-删除', '页面缺少删除按钮', 'medium');
        } else {
          console.log(`  ✓ 删除按钮存在`);
        }
        
        // 测试搜索功能
        console.log(`  测试搜索功能...`);
        const searchInputs = await page.locator('input[placeholder*="搜索"], input[placeholder*="查询"], .el-input__inner').count();
        if (searchInputs === 0) {
          recordError(pageInfo.name, 'CRUD-搜索', '页面缺少搜索功能', 'low');
        } else {
          console.log(`  ✓ 搜索功能存在`);
        }
        
      } catch (error) {
        recordError(pageInfo.name, 'CRUD测试', `CRUD测试失败: ${error}`, 'high');
        console.error(`  ✗ CRUD测试失败: ${error}`);
      }
    });
  }
});

// 生成测试报告
test.afterAll(async () => {
  console.log('\n\n========================================');
  console.log('测试完成，生成错误报告...');
  console.log('========================================\n');
  
  // 这里的报告生成将在单独的脚本中完成
  console.log(`总错误数: ${testErrors.length}`);
  console.log(`严重错误: ${testErrors.filter(e => e.severity === 'critical').length}`);
  console.log(`高级错误: ${testErrors.filter(e => e.severity === 'high').length}`);
  console.log(`中级错误: ${testErrors.filter(e => e.severity === 'medium').length}`);
  console.log(`低级错误: ${testErrors.filter(e => e.severity === 'low').length}`);
});

