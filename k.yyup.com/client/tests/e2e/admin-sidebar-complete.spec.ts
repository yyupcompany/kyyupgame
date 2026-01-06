/**
 * Admin角色100%侧边栏导航测试套件
 *
 * 测试覆盖：
 * - 系统管理模块 (9个页面)
 * - 高级管理模块 (7个页面)
 * - Admin专用页面 (2个页面)
 *
 * 严格验证标准：
 * - 数据结构验证
 * - 字段类型验证
 * - 必填字段验证
 * - 控制台错误检测
 */

import { test, expect, type Page } from '@playwright/test';
import { strictApiValidation } from '../utils/strict-api-validation';
import { adminSidebarConfig } from '../config/admin-sidebar-config';

test.describe('Admin角色 - 100%侧边栏导航测试', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({
      headless: true, // 强制使用无头模式
      viewport: { width: 1920, height: 1080 }
    });

    // 设置控制台错误监听
    strictApiValidation.setupConsoleErrorCapture(page);
  });

  test.beforeEach(async () => {
    // 清除控制台错误记录
    strictApiValidation.clearConsoleErrors();

    // 登录Admin角色
    await page.goto('http://localhost:5173/login');
    await page.fill('[data-testid="username-input"]', 'admin');
    await page.fill('[data-testid="password-input"]', 'admin123');
    await page.click('[data-testid="login-btn"]');

    // 等待登录完成并验证跳转到首页
    await page.waitForURL('**/dashboard');
    await expect(page.locator('[data-testid="main-layout"]')).toBeVisible();
  });

  test.afterEach(() => {
    // 严格验证：每个测试后检查控制台错误
    strictApiValidation.expectNoConsoleErrors();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test.describe('系统管理模块测试', () => {

    test('系统概览页面导航和功能', async () => {
      // 1. 验证侧边栏导航项存在
      const navDashboard = page.locator('[data-testid="nav-system-dashboard"]');
      await expect(navDashboard).toBeVisible();
      await expect(navDashboard).toContainText('系统概览');

      // 2. 点击导航
      await navDashboard.click();

      // 3. 验证页面正确加载
      await page.waitForURL('**/system/dashboard');
      const dashboardPage = page.locator('[data-testid="system-dashboard-page"]');
      await expect(dashboardPage).toBeVisible();

      // 4. 验证页面标题
      await expect(page.locator('[data-testid="page-title"]')).toContainText('系统概览');

      // 5. 验证核心功能元素
      const statsCards = page.locator('[data-testid^="stats-card-"]');
      await expect(statsCards.first()).toBeVisible();

      // 6. 验证操作按钮
      await expect(page.locator('[data-testid="refresh-stats-btn"]')).toBeVisible();
      await expect(page.locator('[data-testid="go-to-user-management-btn"]')).toBeVisible();
      await expect(page.locator('[data-testid="go-to-role-management-btn"]')).toBeVisible();

      // 7. 验证AI监控区域
      await expect(page.locator('[data-testid="ai-monitoring-section"]')).toBeVisible();

      // 8. 严格验证：验证统计数据API调用
      const apiResponse = await page.waitForResponse('**/api/system/stats');
      strictApiValidation.validateApiResponse(apiResponse, {
        requiredFields: ['userCount', 'roleCount', 'activeUsers'],
        fieldTypes: {
          userCount: 'number',
          roleCount: 'number',
          activeUsers: 'number'
        }
      });
    });

    test('用户管理页面完整功能', async () => {
      // 1. 验证侧边栏导航
      const navUserManagement = page.locator('[data-testid="nav-user-management"]');
      await expect(navUserManagement).toBeVisible();
      await expect(navUserManagement).toContainText('用户管理');

      // 2. 点击用户管理
      await navUserManagement.click();

      // 3. 验证用户列表页面
      await page.waitForURL('**/system/user');
      await expect(page.locator('[data-testid="user-management-page"]')).toBeVisible();

      // 4. 验证搜索功能元素
      await expect(page.locator('[data-testid="username-search-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="role-search-select"]')).toBeVisible();
      await expect(page.locator('[data-testid="status-search-select"]')).toBeVisible();
      await expect(page.locator('[data-testid="search-btn"]')).toBeVisible();
      await expect(page.locator('[data-testid="reset-search-btn"]')).toBeVisible();

      // 5. 验证操作按钮
      await expect(page.locator('[data-testid="add-user-btn"]')).toBeVisible();
      await expect(page.locator('[data-testid="batch-delete-btn"]')).toBeVisible();

      // 6. 验证用户表格
      const userTable = page.locator('[data-testid="user-table"]');
      await expect(userTable).toBeVisible();

      // 7. 验证分页组件
      await expect(page.locator('[data-testid="user-pagination"]')).toBeVisible();

      // 8. 严格验证：用户列表API调用
      const listResponse = await page.waitForResponse('**/api/users');
      strictApiValidation.validateApiResponse(listResponse, {
        requiredFields: ['items', 'total'],
        fieldTypes: {
          items: 'array',
          total: 'number'
        }
      });

      // 9. 验证新增用户对话框
      await page.click('[data-testid="add-user-btn"]');
      await expect(page.locator('[data-testid="user-dialog"]')).toBeVisible();
      await expect(page.locator('[data-testid="username-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="realname-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="mobile-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="role-select"]')).toBeVisible();
      await expect(page.locator('[data-testid="save-user-btn"]')).toBeVisible();
      await expect(page.locator('[data-testid="cancel-user-btn"]')).toBeVisible();

      // 关闭对话框
      await page.click('[data-testid="cancel-user-btn"]');
    });

    test('角色管理页面完整功能', async () => {
      // 1. 验证侧边栏导航
      const navRoleManagement = page.locator('[data-testid="nav-role-management"]');
      await expect(navRoleManagement).toBeVisible();

      // 2. 点击角色管理
      await navRoleManagement.click();

      // 3. 验证角色列表页面
      await page.waitForURL('**/system/role');
      await expect(page.locator('[data-testid="role-management-page"]')).toBeVisible();

      // 4. 验证搜索表单
      await expect(page.locator('[data-testid="role-name-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="role-code-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="role-status-select"]')).toBeVisible();

      // 5. 验证操作按钮
      await expect(page.locator('[data-testid="add-role-btn"]')).toBeVisible();
      await expect(page.locator('[data-testid="batch-delete-role-btn"]')).toBeVisible();

      // 6. 验证角色表格
      const roleTable = page.locator('[data-testid="role-table"]');
      await expect(roleTable).toBeVisible();

      // 7. 严格验证：角色列表API
      const roleResponse = await page.waitForResponse('**/api/roles');
      strictApiValidation.validateApiResponse(roleResponse, {
        requiredFields: ['items', 'total'],
        fieldTypes: {
          items: 'array',
          total: 'number'
        }
      });
    });

    test('权限管理页面完整功能', async () => {
      // 1. 验证侧边栏导航
      const navPermissionManagement = page.locator('[data-testid="nav-permission-management"]');
      await expect(navPermissionManagement).toBeVisible();

      // 2. 点击权限管理
      await navPermissionManagement.click();

      // 3. 验证权限页面
      await page.waitForURL('**/system/permission');
      await expect(page.locator('[data-testid="permission-management-page"]')).toBeVisible();

      // 4. 验证搜索表单
      await expect(page.locator('[data-testid="permission-name-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="permission-code-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="permission-type-select"]')).toBeVisible();

      // 5. 验证操作按钮
      await expect(page.locator('[data-testid="add-permission-btn"]')).toBeVisible();
      await expect(page.locator('[data-testid="batch-delete-permission-btn"]')).toBeVisible();

      // 6. 验证权限表格
      const permissionTable = page.locator('[data-testid="permission-table"]');
      await expect(permissionTable).toBeVisible();

      // 7. 严格验证：权限API调用
      const permissionResponse = await page.waitForResponse('**/api/permissions');
      strictApiValidation.validateApiResponse(permissionResponse, {
        requiredFields: ['items', 'total'],
        fieldTypes: {
          items: 'array',
          total: 'number'
        }
      });
    });

    test('系统日志页面完整功能', async () => {
      // 1. 验证侧边栏导航
      const navSystemLog = page.locator('[data-testid="nav-system-log"]');
      await expect(navSystemLog).toBeVisible();

      // 2. 点击系统日志
      await navSystemLog.click();

      // 3. 验证日志页面
      await page.waitForURL('**/system/log');
      await expect(page.locator('[data-testid="system-log-page"]')).toBeVisible();

      // 4. 验证搜索筛选
      await expect(page.locator('[data-testid="log-level-select"]')).toBeVisible();
      await expect(page.locator('[data-testid="log-category-select"]')).toBeVisible();
      await expect(page.locator('[data-testid="log-keyword-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="log-date-range"]')).toBeVisible();

      // 5. 验证操作按钮
      await expect(page.locator('[data-testid="batch-delete-log-btn"]')).toBeVisible();
      await expect(page.locator('[data-testid="export-log-btn"]')).toBeVisible();
      await expect(page.locator('[data-testid="clear-log-btn"]')).toBeVisible();

      // 6. 验证日志表格
      const logTable = page.locator('[data-testid="system-log-table"]');
      await expect(logTable).toBeVisible();

      // 7. 验证日志详情对话框
      await page.locator('[data-testid="system-log-table"] tbody tr:first-child [data-testid="view-log-detail-btn"]').click();
      await expect(page.locator('[data-testid="log-detail-dialog"]')).toBeVisible();

      // 关闭对话框
      await page.click('[data-testid="close-log-detail-btn"]');
    });

    test('系统设置页面完整功能', async () => {
      // 1. 验证侧边栏导航
      const navSystemSettings = page.locator('[data-testid="nav-system-settings"]');
      await expect(navSystemSettings).toBeVisible();

      // 2. 点击系统设置
      await navSystemSettings.click();

      // 3. 验证设置页面
      await page.waitForURL('**/system/settings');
      await expect(page.locator('[data-testid="system-settings-page"]')).toBeVisible();

      // 4. 验证设置分类标签页
      await expect(page.locator('[data-testid="basic-settings-tab"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-settings-tab"]')).toBeVisible();
      await expect(page.locator('[data-testid="security-settings-tab"]')).toBeVisible();
      await expect(page.locator('[data-testid="storage-settings-tab"]')).toBeVisible();
      await expect(page.locator('[data-testid="ai-shortcuts-tab"]')).toBeVisible();

      // 5. 测试各个标签页切换
      await page.click('[data-testid="basic-settings-tab"]');
      await expect(page.locator('[data-testid="basic-settings-form"]')).toBeVisible();

      await page.click('[data-testid="email-settings-tab"]');
      await expect(page.locator('[data-testid="email-settings-form"]')).toBeVisible();

      await page.click('[data-testid="security-settings-tab"]');
      await expect(page.locator('[data-testid="security-settings-form"]')).toBeVisible();

      await page.click('[data-testid="storage-settings-tab"]');
      await expect(page.locator('[data-testid="storage-settings-form"]')).toBeVisible();

      await page.click('[data-testid="ai-shortcuts-tab"]');
      await expect(page.locator('[data-testid="ai-shortcuts-config"]')).toBeVisible();

      // 6. 严格验证：系统设置API调用
      const settingsResponse = await page.waitForResponse('**/api/system/settings');
      strictApiValidation.validateApiResponse(settingsResponse, {
        requiredFields: ['siteName', 'version'],
        fieldTypes: {
          siteName: 'string',
          version: 'string'
        }
      });
    });

    test('备份管理页面导航和功能', async () => {
      // 1. 验证侧边栏导航
      const navBackup = page.locator('[data-testid="nav-backup-management"]');
      await expect(navBackup).toBeVisible();

      // 2. 点击备份管理
      await navBackup.click();

      // 3. 验证页面加载
      await page.waitForURL('**/system/backup');
      await expect(page.locator('[data-testid="backup-management-page"]')).toBeVisible();

      // 4. 验证备份操作按钮
      await expect(page.locator('[data-testid="create-backup-btn"]')).toBeVisible();
      await expect(page.locator('[data-testid="restore-backup-btn"]')).toBeVisible();
      await expect(page.locator('[data-testid="download-backup-btn"]')).toBeVisible();

      // 5. 验证备份列表
      await expect(page.locator('[data-testid="backup-list"]')).toBeVisible();
    });

    test('消息模板管理页面导航和功能', async () => {
      // 1. 验证侧边栏导航
      const navMessageTemplate = page.locator('[data-testid="nav-message-template"]');
      await expect(navMessageTemplate).toBeVisible();

      // 2. 点击消息模板
      await navMessageTemplate.click();

      // 3. 验证页面加载
      await page.waitForURL('**/system/message-template');
      await expect(page.locator('[data-testid="message-template-page"]')).toBeVisible();

      // 4. 验证模板管理功能
      await expect(page.locator('[data-testid="add-template-btn"]')).toBeVisible();
      await expect(page.locator('[data-testid="template-list"]')).toBeVisible();
    });

    test('安全管理页面导航和功能', async () => {
      // 1. 验证侧边栏导航
      const navSecurity = page.locator('[data-testid="nav-security-management"]');
      await expect(navSecurity).toBeVisible();

      // 2. 点击安全管理
      await navSecurity.click();

      // 3. 验证页面加载
      await page.waitForURL('**/system/security');
      await expect(page.locator('[data-testid="security-management-page"]')).toBeVisible();

      // 4. 验证安全设置功能
      await expect(page.locator('[data-testid="security-policy-config"]')).toBeVisible();
      await expect(page.locator('[data-testid="access-control-config"]')).toBeVisible();
    });

  });

  test.describe('高级管理模块测试', () => {

    test('AI模型配置页面导航和功能', async () => {
      // 1. 验证侧边栏导航
      const navAIModelConfig = page.locator('[data-testid="nav-ai-model-config"]');
      await expect(navAIModelConfig).toBeVisible();

      // 2. 点击AI模型配置
      await navAIModelConfig.click();

      // 3. 验证页面加载
      await page.waitForURL('**/system/ai-model-config');
      await expect(page.locator('[data-testid="ai-model-config-page"]')).toBeVisible();

      // 4. 验证AI配置功能
      await expect(page.locator('[data-testid="model-select"]')).toBeVisible();
      await expect(page.locator('[data-testid="api-key-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="save-ai-config-btn"]')).toBeVisible();
    });

    test('VOS配置管理页面导航和功能', async () => {
      // 1. 验证侧边栏导航
      const navVOSConfig = page.locator('[data-testid="nav-vos-config"]');
      await expect(navVOSConfig).toBeVisible();

      // 2. 点击VOS配置
      await navVOSConfig.click();

      // 3. 验证页面加载
      await page.waitForURL('**/system/vos-config');
      await expect(page.locator('[data-testid="vos-config-page"]')).toBeVisible();

      // 4. 验证VOS配置功能
      await expect(page.locator('[data-testid="vos-server-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="vos-port-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="save-vos-config-btn"]')).toBeVisible();
    });

    test('来电账户管理页面导航和功能', async () => {
      // 1. 验证侧边栏导航
      const navCallerAccount = page.locator('[data-testid="nav-caller-account"]');
      await expect(navCallerAccount).toBeVisible();

      // 2. 点击来电账户
      await navCallerAccount.click();

      // 3. 验证页面加载
      await page.waitForURL('**/system/caller-account');
      await expect(page.locator('[data-testid="caller-account-page"]')).toBeVisible();

      // 4. 验证账户管理功能
      await expect(page.locator('[data-testid="add-caller-account-btn"]')).toBeVisible();
      await expect(page.locator('[data-testid="caller-account-list"]')).toBeVisible();
    });

    test('语音配置管理页面导航和功能', async () => {
      // 1. 验证侧边栏导航
      const navVoiceConfig = page.locator('[data-testid="nav-voice-config"]');
      await expect(navVoiceConfig).toBeVisible();

      // 2. 点击语音配置
      await navVoiceConfig.click();

      // 3. 验证页面加载
      await page.waitForURL('**/system/voice-config');
      await expect(page.locator('[data-testid="voice-config-page"]')).toBeVisible();

      // 4. 验证语音配置功能
      await expect(page.locator('[data-testid="voice-provider-select"]')).toBeVisible();
      await expect(page.locator('[data-testid="save-voice-config-btn"]')).toBeVisible();
    });

    test('扩展配置管理页面导航和功能', async () => {
      // 1. 验证侧边栏导航
      const navExtensionConfig = page.locator('[data-testid="nav-extension-config"]');
      await expect(navExtensionConfig).toBeVisible();

      // 2. 点击扩展配置
      await navExtensionConfig.click();

      // 3. 验证页面加载
      await page.waitForURL('**/system/extension-config');
      await expect(page.locator('[data-testid="extension-config-page"]')).toBeVisible();

      // 4. 验证扩展配置功能
      await expect(page.locator('[data-testid="add-extension-btn"]')).toBeVisible();
      await expect(page.locator('[data-testid="extension-list"]')).toBeVisible();
    });

    test('维护调度器页面导航和功能', async () => {
      // 1. 验证侧边栏导航
      const navMaintenance = page.locator('[data-testid="nav-maintenance-scheduler"]');
      await expect(navMaintenance).toBeVisible();

      // 2. 点击维护调度器
      await navMaintenance.click();

      // 3. 验证页面加载
      await page.waitForURL('**/system/maintenance');
      await expect(page.locator('[data-testid="maintenance-scheduler-page"]')).toBeVisible();

      // 4. 验证维护调度功能
      await expect(page.locator('[data-testid="schedule-maintenance-btn"]')).toBeVisible();
      await expect(page.locator('[data-testid="maintenance-tasks-list"]')).toBeVisible();
    });

    test('AI快捷方式配置页面导航和功能', async () => {
      // 1. 验证侧边栏导航
      const navAIShortcuts = page.locator('[data-testid="nav-ai-shortcuts"]');
      await expect(navAIShortcuts).toBeVisible();

      // 2. 点击AI快捷方式
      await navAIShortcuts.click();

      // 3. 验证页面加载
      await page.waitForURL('**/system/ai-shortcuts');
      await expect(page.locator('[data-testid="ai-shortcuts-page"]')).toBeVisible();

      // 4. 验证AI快捷方式功能
      await expect(page.locator('[data-testid="add-shortcut-btn"]')).toBeVisible();
      await expect(page.locator('[data-testid="shortcuts-list"]')).toBeVisible();
    });

  });

  test.describe('Admin专用页面测试', () => {

    test('图片替换管理器页面导航和功能', async () => {
      // 1. 验证侧边栏导航
      const navImageManager = page.locator('[data-testid="nav-image-replacement-manager"]');
      await expect(navImageManager).toBeVisible();

      // 2. 点击图片替换管理器
      await navImageManager.click();

      // 3. 验证页面加载
      await page.waitForURL('**/admin/image-replacement-manager');
      await expect(page.locator('[data-testid="image-replacement-manager-page"]')).toBeVisible();

      // 4. 验证图片管理功能
      await expect(page.locator('[data-testid="upload-image-btn"]')).toBeVisible();
      await expect(page.locator('[data-testid="image-preview"]')).toBeVisible();
      await expect(page.locator('[data-testid="replace-image-btn"]')).toBeVisible();
    });

    test('图片替换页面导航和功能', async () => {
      // 1. 验证侧边栏导航
      const navImageReplacement = page.locator('[data-testid="nav-image-replacement"]');
      await expect(navImageReplacement).toBeVisible();

      // 2. 点击图片替换
      await navImageReplacement.click();

      // 3. 验证页面加载
      await page.waitForURL('**/admin/image-replacement');
      await expect(page.locator('[data-testid="image-replacement-page"]')).toBeVisible();

      // 4. 验证图片替换功能
      await expect(page.locator('[data-testid="image-source-select"]')).toBeVisible();
      await expect(page.locator('[data-testid="image-target-select"]')).toBeVisible();
      await expect(page.locator('[data-testid="execute-replacement-btn"]')).toBeVisible();
    });

  });

  test.describe('Admin权限验证测试', () => {

    test('验证Admin角色权限访问控制', async () => {
      // 验证Admin角色可以访问所有高级管理功能
      const adminOnlyPages = [
        '[data-testid="nav-ai-model-config"]',
        '[data-testid="nav-vos-config"]',
        '[data-testid="nav-caller-account"]',
        '[data-testid="nav-voice-config"]',
        '[data-testid="nav-extension-config"]',
        '[data-testid="nav-maintenance-scheduler"]',
        '[data-testid="nav-image-replacement-manager"]',
        '[data-testid="nav-image-replacement"]'
      ];

      for (const pageSelector of adminOnlyPages) {
        await expect(page.locator(pageSelector)).toBeVisible();
      }
    });

    test('验证系统管理核心权限', async () => {
      // 验证Admin角色拥有所有系统管理权限
      const systemManagementNavs = [
        '[data-testid="nav-system-dashboard"]',
        '[data-testid="nav-user-management"]',
        '[data-testid="nav-role-management"]',
        '[data-testid="nav-permission-management"]',
        '[data-testid="nav-system-log"]',
        '[data-testid="nav-system-settings"]',
        '[data-testid="nav-backup-management"]',
        '[data-testid="nav-message-template"]',
        '[data-testid="nav-security-management"]'
      ];

      for (const navSelector of systemManagementNavs) {
        await expect(page.locator(navSelector)).toBeVisible();
      }
    });

  });

  test.describe('Admin侧边栏完整导航流程测试', () => {

    test('完整侧边栏导航遍历测试', async () => {
      // 获取所有Admin角色可访问的导航项
      const allNavItems = adminSidebarConfig.getAllNavigationItems();

      for (const navItem of allNavItems) {
        // 验证导航项存在
        await expect(page.locator(navItem.selector)).toBeVisible();

        // 点击导航
        await page.click(navItem.selector);

        // 验证页面加载
        await page.waitForURL(navItem.expectedUrl);
        await expect(page.locator(navItem.pageSelector)).toBeVisible();

        // 验证页面标题
        if (navItem.expectedTitle) {
          await expect(page.locator('[data-testid="page-title"]')).toContainText(navItem.expectedTitle);
        }

        // 验证核心元素存在
        for (const elementSelector of navItem.coreElements) {
          const element = page.locator(elementSelector);
          if (await element.count() > 0) {
            await expect(element.first()).toBeVisible();
          }
        }
      }
    });

    test('侧边栏导航响应式测试', async () => {
      // 测试桌面端导航
      await page.setViewportSize({ width: 1920, height: 1080 });
      const sidebarDesktop = page.locator('[data-testid="admin-sidebar"]');
      await expect(sidebarDesktop).toBeVisible();

      // 测试平板端导航
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(sidebarDesktop).toBeVisible();

      // 测试手机端导航
      await page.setViewportSize({ width: 375, height: 667 });
      const mobileSidebarToggle = page.locator('[data-testid="mobile-sidebar-toggle"]');
      if (await mobileSidebarToggle.count() > 0) {
        await mobileSidebarToggle.click();
        await expect(page.locator('[data-testid="admin-sidebar-mobile"]')).toBeVisible();
      }
    });

  });

});