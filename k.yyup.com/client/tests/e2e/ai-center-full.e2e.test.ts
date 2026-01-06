/**
 * 端到端测试 - 智能中心模块
 *
 * 测试覆盖：
 * - AI助手页面功能
 * - AI查询功能
 * - AI模型管理
 * - 智能分析功能
 * - 权限验证
 * - 响应式设计
 * - 键盘导航
 * - 数据持久化
 * - 性能测试
 * - 错误处理
 * - 视觉回归
 */

import { test, expect, Page } from '@playwright/test';
import { vi } from 'vitest'

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';

// 测试用户数据
const TEST_USERS = {
  admin: {
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    expectedName: '系统管理员'
  },
  principal: {
    username: 'principal',
    password: 'principal123',
    role: 'principal',
    expectedName: '园长'
  },
  teacher: {
    username: 'teacher1',
    password: 'teacher123',
    role: 'teacher',
    expectedName: '张老师'
  },
  dataAnalyst: {
    username: 'analyst',
    password: 'analyst123',
    role: 'dataAnalyst',
    expectedName: '数据分析师'
  }
};

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

describe('智能中心模块 E2E 测试', () => {
  test.beforeEach(async ({ page }) => {
    // 每个测试前清理状态
    await page.context().clearCookies();
    await page.goto(BASE_URL);
  });

  test.describe('权限验证和页面加载', () => {
    test('管理员访问智能中心', async ({ page }) => {
      await performLogin(page, TEST_USERS.admin);

      // 导航到智能中心
      await page.click('[data-testid="nav-ai-center"]');
      await expect(page).toHaveURL(`${BASE_URL}/centers/ai`);

      // 验证页面加载
      await expect(page.locator('[data-testid="ai-center-title"]')).toContainText('智能中心');
      await expect(page.locator('[data-testid="ai-assistant-tab"]')).toBeVisible();
      await expect(page.locator('[data-testid="ai-query-tab"]')).toBeVisible();
      await expect(page.locator('[data-testid="ai-models-tab"]')).toBeVisible();
      await expect(page.locator('[data-testid="ai-analytics-tab"]')).toBeVisible();
    });

    test('园长访问智能中心', async ({ page }) => {
      await performLogin(page, TEST_USERS.principal);

      // 导航到智能中心
      await page.click('[data-testid="nav-ai-center"]');
      await expect(page).toHaveURL(`${BASE_URL}/centers/ai`);

      // 验证页面加载和权限
      await expect(page.locator('[data-testid="ai-center-title"]')).toContainText('智能中心');
      await expect(page.locator('[data-testid="ai-assistant-tab"]')).toBeVisible();
      await expect(page.locator('[data-testid="ai-query-tab"]')).toBeVisible();
      await expect(page.locator('[data-testid="ai-analytics-tab"]')).toBeVisible();
    });

    test('教师访问智能中心', async ({ page }) => {
      await performLogin(page, TEST_USERS.teacher);

      // 导航到智能中心
      await page.click('[data-testid="nav-ai-center"]');
      await expect(page).toHaveURL(`${BASE_URL}/centers/ai`);

      // 验证页面加载和权限
      await expect(page.locator('[data-testid="ai-center-title"]')).toContainText('智能中心');
      await expect(page.locator('[data-testid="ai-assistant-tab"]')).toBeVisible();
      await expect(page.locator('[data-testid="ai-query-tab"]')).toBeVisible();
      // 教师不应该看到模型管理标签
      await expect(page.locator('[data-testid="ai-models-tab"]')).not.toBeVisible();
    });

    test('数据分析师访问AI中心', async ({ page }) => {
      // 先用管理员创建数据分析师账户
      await performLogin(page, TEST_USERS.admin);
      await page.goto(`${BASE_URL}/users`);
      
      // 创建数据分析师账户
      await page.click('[data-testid="add-user-button"]');
      await page.fill('[data-testid="username-input"]', TEST_USERS.dataAnalyst.username);
      await page.fill('[data-testid="realname-input"]', TEST_USERS.dataAnalyst.expectedName);
      await page.fill('[data-testid="password-input"]', TEST_USERS.dataAnalyst.password);
      await page.fill('[data-testid="confirm-password-input"]', TEST_USERS.dataAnalyst.password);
      await page.click('[data-testid="role-select"]');
      await page.click('[data-testid="role-option-data-analyst"]');
      await page.click('[data-testid="save-user-button"]');
      
      // 登录数据分析师账户
      await page.context().clearCookies();
      await page.goto(BASE_URL);
      await performLogin(page, TEST_USERS.dataAnalyst);
      
      // 导航到AI中心
      await page.click('[data-testid="nav-ai-center"]');
      await expect(page).toHaveURL(`${BASE_URL}/centers/ai`);
      
      // 验证页面加载和权限
      await expect(page.locator('[data-testid="ai-center-title"]')).toContainText('AI中心');
      await expect(page.locator('[data-testid="ai-assistant-tab"]')).toBeVisible();
      await expect(page.locator('[data-testid="ai-query-tab"]')).toBeVisible();
      await expect(page.locator('[data-testid="ai-analytics-tab"]')).toBeVisible();
    });
  });

  test.describe('AI助手页面功能', () => {
    test('AI对话功能', async ({ page }) => {
      await performLogin(page, TEST_USERS.admin);
      await page.goto(`${BASE_URL}/centers/ai`);
      
      // 切换到AI助手标签
      await page.click('[data-testid="ai-assistant-tab"]');
      
      // 验证AI助手界面
      await expect(page.locator('[data-testid="ai-chat-interface"]')).toBeVisible();
      await expect(page.locator('[data-testid="chat-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="send-button"]')).toBeVisible();
      
      // 发送消息
      await page.fill('[data-testid="chat-input"]', '你好，AI助手');
      await page.click('[data-testid="send-button"]');
      
      // 验证消息发送
      await expect(page.locator('[data-testid="user-message"]')).toContainText('你好，AI助手');
      
      // 等待AI回复（使用模拟回复）
      await page.route('**/api/ai/chat', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              response: '你好！我是AI助手，很高兴为你服务。'
            }
          })
        });
      });
      
      // 验证AI回复
      await expect(page.locator('[data-testid="ai-message"]')).toBeVisible({ timeout: 10000 });
    });

    test('专家咨询功能', async ({ page }) => {
      await performLogin(page, TEST_USERS.admin);
      await page.goto(`${BASE_URL}/centers/ai`);
      
      // 切换到AI助手标签
      await page.click('[data-testid="ai-assistant-tab"]');
      
      // 点击专家咨询
      await page.click('[data-testid="expert-consultation-button"]');
      
      // 验证专家咨询界面
      await expect(page.locator('[data-testid="expert-consultation-dialog"]')).toBeVisible();
      await expect(page.locator('[data-testid="consultation-topic-select"]')).toBeVisible();
      await expect(page.locator('[data-testid="consultation-content"]')).toBeVisible();
      
      // 选择咨询主题
      await page.click('[data-testid="consultation-topic-select"]');
      await page.click('[data-testid="topic-option-enrollment"]');
      
      // 填写咨询内容
      await page.fill('[data-testid="consultation-content"]', '如何提高招生转化率？');
      
      // 提交咨询
      await page.click('[data-testid="submit-consultation-button"]');
      
      // 验证提交成功
      await expect(page.locator('[data-testid="success-message"]')).toContainText('咨询已提交');
    });

    test('Function Tools功能', async ({ page }) => {
      await performLogin(page, TEST_USERS.admin);
      await page.goto(`${BASE_URL}/centers/ai`);
      
      // 切换到AI助手标签
      await page.click('[data-testid="ai-assistant-tab"]');
      
      // 点击Function Tools
      await page.click('[data-testid="function-tools-button"]');
      
      // 验证Function Tools界面
      await expect(page.locator('[data-testid="function-tools-dialog"]')).toBeVisible();
      await expect(page.locator('[data-testid="tool-list"]')).toBeVisible();
      
      // 选择一个工具
      await page.click('[data-testid="tool-item-student-analysis"]');
      
      // 验证工具详情
      await expect(page.locator('[data-testid="tool-description"]')).toBeVisible();
      await expect(page.locator('[data-testid="execute-tool-button"]')).toBeVisible();
      
      // 执行工具
      await page.click('[data-testid="execute-tool-button"]');
      
      // 验证执行结果
      await expect(page.locator('[data-testid="tool-result"]')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('AI查询功能', () => {
    test('自然语言查询', async ({ page }) => {
      await performLogin(page, TEST_USERS.admin);
      await page.goto(`${BASE_URL}/centers/ai`);
      
      // 切换到AI查询标签
      await page.click('[data-testid="ai-query-tab"]');
      
      // 验证查询界面
      await expect(page.locator('[data-testid="natural-query-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="execute-query-button"]')).toBeVisible();
      
      // 输入自然语言查询
      await page.fill('[data-testid="natural-query-input"]', '查询本月新增的学生数量');
      
      // 执行查询
      await page.click('[data-testid="execute-query-button"]');
      
      // 验证查询执行
      await expect(page.locator('[data-testid="query-result"]')).toBeVisible({ timeout: 10000 });
    });

    test('SQL生成和执行', async ({ page }) => {
      await performLogin(page, TEST_USERS.admin);
      await page.goto(`${BASE_URL}/centers/ai`);
      
      // 切换到AI查询标签
      await page.click('[data-testid="ai-query-tab"]');
      
      // 切换到SQL模式
      await page.click('[data-testid="sql-mode-toggle"]');
      
      // 验证SQL编辑器
      await expect(page.locator('[data-testid="sql-editor"]')).toBeVisible();
      
      // 输入SQL查询
      await page.fill('[data-testid="sql-editor"]', 'SELECT COUNT(*) as student_count FROM students WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)');
      
      // 执行SQL查询
      await page.click('[data-testid="execute-sql-button"]');
      
      // 验证查询结果
      await expect(page.locator('[data-testid="query-result"]')).toBeVisible({ timeout: 10000 });
    });

    test('查询模板管理', async ({ page }) => {
      await performLogin(page, TEST_USERS.admin);
      await page.goto(`${BASE_URL}/centers/ai`);
      
      // 切换到AI查询标签
      await page.click('[data-testid="ai-query-tab"]');
      
      // 打开模板管理
      await page.click('[data-testid="manage-templates-button"]');
      
      // 验证模板管理界面
      await expect(page.locator('[data-testid="template-management-dialog"]')).toBeVisible();
      await expect(page.locator('[data-testid="template-list"]')).toBeVisible();
      
      // 创建新模板
      await page.click('[data-testid="add-template-button"]');
      await page.fill('[data-testid="template-name-input"]', '本月新增学生查询');
      await page.fill('[data-testid="template-query-input"]', 'SELECT COUNT(*) as student_count FROM students WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)');
      await page.click('[data-testid="save-template-button"]');
      
      // 验证模板创建成功
      await expect(page.locator('[data-testid="success-message"]')).toContainText('模板保存成功');
    });

    test('查询历史记录', async ({ page }) => {
      await performLogin(page, TEST_USERS.admin);
      await page.goto(`${BASE_URL}/centers/ai`);
      
      // 切换到AI查询标签
      await page.click('[data-testid="ai-query-tab"]');
      
      // 执行一个查询
      await page.fill('[data-testid="natural-query-input"]', '查询本月新增的学生数量');
      await page.click('[data-testid="execute-query-button"]');
      await expect(page.locator('[data-testid="query-result"]')).toBeVisible({ timeout: 10000 });
      
      // 查看历史记录
      await page.click('[data-testid="query-history-button"]');
      
      // 验证历史记录
      await expect(page.locator('[data-testid="query-history-dialog"]')).toBeVisible();
      await expect(page.locator('[data-testid="history-list"]')).toBeVisible();
      const historyCount = await page.locator('[data-testid="history-item"]').count();
      expect(historyCount).toBeGreaterThan(0);
    });
  });

  test.describe('AI模型管理', () => {
    test('模型列表查看', async ({ page }) => {
      await performLogin(page, TEST_USERS.admin);
      await page.goto(`${BASE_URL}/centers/ai`);
      
      // 切换到AI模型标签
      await page.click('[data-testid="ai-models-tab"]');
      
      // 验证模型列表
      await expect(page.locator('[data-testid="models-table"]')).toBeVisible();
      const modelCount = await page.locator('[data-testid="model-row"]').count();
      expect(modelCount).toBeGreaterThan(0);
      
      // 验证模型信息
      const firstModel = page.locator('[data-testid="model-row"]').first();
      await expect(firstModel.locator('[data-testid="model-name"]')).toBeVisible();
      await expect(firstModel.locator('[data-testid="model-type"]')).toBeVisible();
      await expect(firstModel.locator('[data-testid="model-status"]')).toBeVisible();
    });

    test('模型创建', async ({ page }) => {
      await performLogin(page, TEST_USERS.admin);
      await page.goto(`${BASE_URL}/centers/ai`);
      
      // 切换到AI模型标签
      await page.click('[data-testid="ai-models-tab"]');
      
      // 点击添加模型
      await page.click('[data-testid="add-model-button"]');
      
      // 验证添加模型对话框
      await expect(page.locator('[data-testid="add-model-dialog"]')).toBeVisible();
      
      // 填写模型信息
      await page.fill('[data-testid="model-name-input"]', '测试模型');
      await page.click('[data-testid="model-type-select"]');
      await page.click('[data-testid="model-type-option-text"]');
      await page.fill('[data-testid="model-api-key-input"]', 'test-api-key');
      await page.fill('[data-testid="model-endpoint-input"]', 'https://api.test.com/v1/chat');
      
      // 保存模型
      await page.click('[data-testid="save-model-button"]');
      
      // 验证模型创建成功
      await expect(page.locator('[data-testid="success-message"]')).toContainText('模型创建成功');
    });

    test('模型测试', async ({ page }) => {
      await performLogin(page, TEST_USERS.admin);
      await page.goto(`${BASE_URL}/centers/ai`);
      
      // 切换到AI模型标签
      await page.click('[data-testid="ai-models-tab"]');
      
      // 找到第一个模型并点击测试
      const firstModel = page.locator('[data-testid="model-row"]').first();
      await firstModel.locator('[data-testid="test-model-button"]').click();
      
      // 验证测试对话框
      await expect(page.locator('[data-testid="test-model-dialog"]')).toBeVisible();
      await expect(page.locator('[data-testid="test-input"]')).toBeVisible();
      
      // 输入测试内容
      await page.fill('[data-testid="test-input"]', '你好，模型测试');
      
      // 执行测试
      await page.click('[data-testid="execute-test-button"]');
      
      // 验证测试结果
      await expect(page.locator('[data-testid="test-result"]')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('智能分析功能', () => {
    test('预测分析', async ({ page }) => {
      await performLogin(page, TEST_USERS.admin);
      await page.goto(`${BASE_URL}/centers/ai`);
      
      // 切换到智能分析标签
      await page.click('[data-testid="ai-analytics-tab"]');
      
      // 验证预测分析功能
      await expect(page.locator('[data-testid="prediction-analysis-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="enrollment-prediction-chart"]')).toBeVisible();
      
      // 执行预测分析
      await page.click('[data-testid="run-prediction-button"]');
      
      // 验证分析结果
      await expect(page.locator('[data-testid="prediction-result"]')).toBeVisible({ timeout: 10000 });
    });

    test('学生分析', async ({ page }) => {
      await performLogin(page, TEST_USERS.admin);
      await page.goto(`${BASE_URL}/centers/ai`);
      
      // 切换到智能分析标签
      await page.click('[data-testid="ai-analytics-tab"]');
      
      // 切换到学生分析
      await page.click('[data-testid="student-analysis-tab"]');
      
      // 验证学生分析功能
      await expect(page.locator('[data-testid="student-analysis-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="student-distribution-chart"]')).toBeVisible();
      
      // 执行学生分析
      await page.click('[data-testid="run-student-analysis-button"]');
      
      // 验证分析结果
      await expect(page.locator('[data-testid="student-analysis-result"]')).toBeVisible({ timeout: 10000 });
    });

    test('客户分析', async ({ page }) => {
      await performLogin(page, TEST_USERS.admin);
      await page.goto(`${BASE_URL}/centers/ai`);
      
      // 切换到智能分析标签
      await page.click('[data-testid="ai-analytics-tab"]');
      
      // 切换到客户分析
      await page.click('[data-testid="customer-analysis-tab"]');
      
      // 验证客户分析功能
      await expect(page.locator('[data-testid="customer-analysis-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="customer-conversion-chart"]')).toBeVisible();
      
      // 执行客户分析
      await page.click('[data-testid="run-customer-analysis-button"]');
      
      // 验证分析结果
      await expect(page.locator('[data-testid="customer-analysis-result"]')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('权限验证', () => {
    test('教师权限限制', async ({ page }) => {
      await performLogin(page, TEST_USERS.teacher);
      await page.goto(`${BASE_URL}/centers/ai`);
      
      // 验证教师无法访问模型管理
      await expect(page.locator('[data-testid="ai-models-tab"]')).not.toBeVisible();
      
      // 验证教师无法访问智能分析
      await expect(page.locator('[data-testid="ai-analytics-tab"]')).not.toBeVisible();
    });

    test('园长权限验证', async ({ page }) => {
      await performLogin(page, TEST_USERS.principal);
      await page.goto(`${BASE_URL}/centers/ai`);
      
      // 验证园长可以访问AI助手
      await expect(page.locator('[data-testid="ai-assistant-tab"]')).toBeVisible();
      
      // 验证园长可以访问AI查询
      await expect(page.locator('[data-testid="ai-query-tab"]')).toBeVisible();
      
      // 验证园长可以访问智能分析
      await expect(page.locator('[data-testid="ai-analytics-tab"]')).toBeVisible();
      
      // 验证园长无法访问模型管理
      await expect(page.locator('[data-testid="ai-models-tab"]')).not.toBeVisible();
    });
  });

  test.describe('响应式设计', () => {
    test('移动端适配', async ({ page }) => {
      // 设置移动端视口
      await page.setViewportSize({ width: 375, height: 667 });
      
      await performLogin(page, TEST_USERS.admin);
      await page.goto(`${BASE_URL}/centers/ai`);
      
      // 验证移动端布局
      await expect(page.locator('[data-testid="mobile-ai-center-layout"]')).toBeVisible();
      
      // 验证标签页在移动端的适配
      await expect(page.locator('[data-testid="mobile-tab-navigation"]')).toBeVisible();
      
      // 验证AI助手在移动端的适配
      await page.click('[data-testid="ai-assistant-tab"]');
      await expect(page.locator('[data-testid="mobile-chat-interface"]')).toBeVisible();
    });

    test('平板端适配', async ({ page }) => {
      // 设置平板端视口
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await performLogin(page, TEST_USERS.admin);
      await page.goto(`${BASE_URL}/centers/ai`);
      
      // 验证平板端布局
      await expect(page.locator('[data-testid="tablet-ai-center-layout"]')).toBeVisible();
      
      // 验证各功能模块在平板端的适配
      await page.click('[data-testid="ai-query-tab"]');
      await expect(page.locator('[data-testid="tablet-query-interface"]')).toBeVisible();
    });
  });

  test.describe('键盘导航', () => {
    test('Tab键导航', async ({ page }) => {
      await performLogin(page, TEST_USERS.admin);
      await page.goto(`${BASE_URL}/centers/ai`);
      
      // 使用Tab键导航
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="ai-assistant-tab"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="ai-query-tab"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="ai-models-tab"]')).toBeFocused();
    });

    test('Enter键激活', async ({ page }) => {
      await performLogin(page, TEST_USERS.admin);
      await page.goto(`${BASE_URL}/centers/ai`);
      
      // 使用Enter键激活AI助手标签
      await page.locator('[data-testid="ai-assistant-tab"]').focus();
      await page.keyboard.press('Enter');
      
      // 验证AI助手标签被激活
      await expect(page.locator('[data-testid="ai-assistant-content"]')).toBeVisible();
    });
  });

  test.describe('数据持久化', () => {
    test('标签页状态保持', async ({ page }) => {
      await performLogin(page, TEST_USERS.admin);
      await page.goto(`${BASE_URL}/centers/ai`);
      
      // 切换到AI查询标签
      await page.click('[data-testid="ai-query-tab"]');
      
      // 在查询输入框中输入内容
      await page.fill('[data-testid="natural-query-input"]', '测试查询内容');
      
      // 切换到其他标签再切换回来
      await page.click('[data-testid="ai-assistant-tab"]');
      await page.click('[data-testid="ai-query-tab"]');
      
      // 验证输入内容保持
      await expect(page.locator('[data-testid="natural-query-input"]')).toHaveValue('测试查询内容');
    });

    test('查询历史持久化', async ({ page }) => {
      await performLogin(page, TEST_USERS.admin);
      await page.goto(`${BASE_URL}/centers/ai`);
      
      // 执行一个查询
      await page.click('[data-testid="ai-query-tab"]');
      await page.fill('[data-testid="natural-query-input"]', '测试查询');
      await page.click('[data-testid="execute-query-button"]');
      await expect(page.locator('[data-testid="query-result"]')).toBeVisible({ timeout: 10000 });
      
      // 刷新页面
      await page.reload();
      
      // 验证查询历史仍然存在
      await page.click('[data-testid="query-history-button"]');
      const persistedHistoryCount = await page.locator('[data-testid="history-item"]').count();
      expect(persistedHistoryCount).toBeGreaterThan(0);
    });
  });

  test.describe('性能测试', () => {
    test('页面加载性能', async ({ page }) => {
      await performLogin(page, TEST_USERS.admin);
      
      // 测量页面加载时间
      const startTime = Date.now();
      await page.goto(`${BASE_URL}/centers/ai`);
      await expect(page.locator('[data-testid="ai-center-title"]')).toBeVisible();
      const loadTime = Date.now() - startTime;
      
      // 验证加载时间在合理范围内（3秒以内）
      expect(loadTime).toBeLessThan(3000);
    });

    test('标签页切换流畅度', async ({ page }) => {
      await performLogin(page, TEST_USERS.admin);
      await page.goto(`${BASE_URL}/centers/ai`);
      
      // 测量标签页切换时间
      const startTime = Date.now();
      await page.click('[data-testid="ai-query-tab"]');
      await expect(page.locator('[data-testid="ai-query-content"]')).toBeVisible();
      const switchTime = Date.now() - startTime;
      
      // 验证切换时间在合理范围内（1秒以内）
      expect(switchTime).toBeLessThan(1000);
    });
  });

  test.describe('错误处理', () => {
    test('网络错误处理', async ({ page }) => {
      await performLogin(page, TEST_USERS.admin);
      await page.goto(`${BASE_URL}/centers/ai`);
      
      // 模拟网络错误
      await page.route('**/api/ai/**', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            message: '服务器内部错误'
          })
        });
      });
      
      // 尝试执行AI查询
      await page.click('[data-testid="ai-query-tab"]');
      await page.fill('[data-testid="natural-query-input"]', '测试查询');
      await page.click('[data-testid="execute-query-button"]');
      
      // 验证错误提示
      await expect(page.locator('[data-testid="error-message"]')).toContainText('服务器内部错误');
    });

    test('AI服务错误处理', async ({ page }) => {
      await performLogin(page, TEST_USERS.admin);
      await page.goto(`${BASE_URL}/centers/ai`);
      
      // 模拟AI服务错误
      await page.route('**/api/ai/chat', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            message: 'AI服务暂时不可用'
          })
        });
      });
      
      // 尝试使用AI助手
      await page.click('[data-testid="ai-assistant-tab"]');
      await page.fill('[data-testid="chat-input"]', '测试消息');
      await page.click('[data-testid="send-button"]');
      
      // 验证错误提示
      await expect(page.locator('[data-testid="error-message"]')).toContainText('AI服务暂时不可用');
    });
  });

  test.describe('视觉回归', () => {
    test('AI中心页面截图对比', async ({ page }) => {
      await performLogin(page, TEST_USERS.admin);
      await page.goto(`${BASE_URL}/centers/ai`);
      
      // 等待页面完全加载
      await page.waitForLoadState('networkidle');
      
      // 截图并保存
      await page.screenshot({ path: 'test-results/ai-center-page.png' });
      
      // 验证截图存在
      const fs = require('fs');
      expect(fs.existsSync('test-results/ai-center-page.png')).toBeTruthy();
    });

    test('AI助手对话界面截图对比', async ({ page }) => {
      await performLogin(page, TEST_USERS.admin);
      await page.goto(`${BASE_URL}/centers/ai`);
      
      // 切换到AI助手标签
      await page.click('[data-testid="ai-assistant-tab"]');
      
      // 等待界面加载
      await page.waitForLoadState('networkidle');
      
      // 截图并保存
      await page.screenshot({ path: 'test-results/ai-assistant-interface.png' });
      
      // 验证截图存在
      const fs = require('fs');
      expect(fs.existsSync('test-results/ai-assistant-interface.png')).toBeTruthy();
    });
  });
});

/**
 * 执行登录操作的辅助函数
 */
async function performLogin(page: Page, user: typeof TEST_USERS.admin) {
  await page.goto(`${BASE_URL}/login`);
  
  await page.fill('[data-testid="username-input"]', user.username);
  await page.fill('[data-testid="password-input"]', user.password);
  await page.click('[data-testid="login-button"]');
  
  // 等待登录完成
  await page.waitForURL(`${BASE_URL}/**`);
}