/**
 * Admin角色权限综合测试套件
 *
 * 测试覆盖：
 * - Admin角色权限验证
 * - 功能访问控制
 * - API权限端点测试
 * - 严格验证标准
 */

import { test, expect, type Page } from '@playwright/test';
import { strictApiValidation } from '../utils/strict-api-validation';

test.describe('Admin角色权限综合测试', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({
      headless: true,
      viewport: { width: 1920, height: 1080 }
    });

    // 设置控制台错误监听
    strictApiValidation.setupConsoleErrorCapture(page);
  });

  test.beforeEach(async () => {
    // 清除控制台错误记录
    strictApiValidation.clearConsoleErrors();

    // 使用Admin角色登录
    await page.goto('http://localhost:5173/login');
    await page.fill('[data-testid="username-input"]', 'admin');
    await page.fill('[data-testid="password-input"]', 'admin123');
    await page.click('[data-testid="login-btn"]');

    // 等待登录完成
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

  test.describe('用户管理权限测试', () => {

    test('Admin用户CRUD完整权限验证', async () => {
      // 1. 导航到用户管理页面
      await page.click('[data-testid="nav-user-management"]');
      await page.waitForURL('**/system/user');

      // 2. 验证用户列表查看权限
      const listResponse = await page.waitForResponse('**/api/users');
      strictApiValidation.validateApiResponse(listResponse, {
        requiredFields: ['items', 'total'],
        fieldTypes: {
          items: 'array',
          total: 'number'
        }
      });

      // 3. 验证创建用户权限
      await page.click('[data-testid="add-user-btn"]');
      await expect(page.locator('[data-testid="user-dialog"]')).toBeVisible();

      // 4. 验证必填字段验证
      await page.fill('[data-testid="username-input"]', 'testuser');
      await page.fill('[data-testid="realname-input"]', '测试用户');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="mobile-input"]', '13800138000');
      await page.fill('[data-testid="password-input"]', 'password123');

      // 5. 验证角色分配权限
      const roleSelect = page.locator('[data-testid="role-select"]');
      await expect(roleSelect).toBeVisible();
      await roleSelect.click();
      await page.click('[data-testid="role-option-admin"]'); // Admin可以分配admin角色

      // 6. 测试保存用户API权限
      await page.click('[data-testid="save-user-btn"]');

      // 监听创建用户API调用
      const createResponse = await page.waitForResponse('**/api/users', { timeout: 10000 });
      strictApiValidation.validateApiResponse(createResponse, {
        requiredFields: ['success', 'data'],
        fieldTypes: {
          success: 'boolean',
          data: 'object'
        }
      });

      // 7. 验证编辑用户权限
      const firstUserRow = page.locator('[data-testid="user-table"] tbody tr:first-child');
      await firstUserRow.locator('[data-testid="edit-user-btn"]').click();
      await expect(page.locator('[data-testid="user-dialog"]')).toBeVisible();

      // 8. 验证删除用户权限
      await page.click('[data-testid="cancel-user-btn"]'); // 关闭编辑对话框
      await firstUserRow.locator('[data-testid="delete-user-btn"]').click();
      await expect(page.locator('[data-testid="confirm-delete-dialog"]')).toBeVisible();

      // 关闭删除确认对话框
      await page.keyboard.press('Escape');
    });

    test('Admin用户状态管理权限验证', async () => {
      await page.click('[data-testid="nav-user-management"]');
      await page.waitForURL('**/system/user');

      // 获取第一个用户行
      const firstUserRow = page.locator('[data-testid="user-table"] tbody tr:first-child');

      // 查找状态切换按钮（启用/禁用）
      const statusToggle = firstUserRow.locator('[data-testid="toggle-user-status-btn"]');
      if (await statusToggle.count() > 0) {
        await statusToggle.click();

        // 验证状态更新API调用
        const statusResponse = await page.waitForResponse('**/api/users/*/status');
        strictApiValidation.validateApiResponse(statusResponse, {
          requiredFields: ['success'],
          fieldTypes: {
            success: 'boolean'
          }
        });
      }
    });

  });

  test.describe('角色管理权限测试', () => {

    test('Admin角色CRUD完整权限验证', async () => {
      // 1. 导航到角色管理页面
      await page.click('[data-testid="nav-role-management"]');
      await page.waitForURL('**/system/role');

      // 2. 验证角色列表查看权限
      const listResponse = await page.waitForResponse('**/api/roles');
      strictApiValidation.validateApiResponse(listResponse, {
        requiredFields: ['items', 'total'],
        fieldTypes: {
          items: 'array',
          total: 'number'
        }
      });

      // 3. 验证创建角色权限
      await page.click('[data-testid="add-role-btn"]');
      await expect(page.locator('[data-testid="role-dialog"]')).toBeVisible();

      // 4. 填写角色信息
      await page.fill('[data-testid="role-name-input"]', '测试角色');
      await page.fill('[data-testid="role-code-input"]', 'TEST_ROLE');
      await page.fill('[data-testid="role-description-input"]', '这是一个测试角色');

      // 5. 测试保存角色API权限
      await page.click('[data-testid="save-role-btn"]');

      const createResponse = await page.waitForResponse('**/api/roles', { timeout: 10000 });
      strictApiValidation.validateApiResponse(createResponse, {
        requiredFields: ['success', 'data'],
        fieldTypes: {
          success: 'boolean',
          data: 'object'
        }
      });

      // 6. 验证编辑角色权限
      const firstRoleRow = page.locator('[data-testid="role-table"] tbody tr:first-child');
      await firstRoleRow.locator('[data-testid="edit-role-btn"]').click();
      await expect(page.locator('[data-testid="role-dialog"]')).toBeVisible();

      // 7. 验证删除角色权限
      await page.click('[data-testid="cancel-role-btn"]'); // 关闭编辑对话框
      await firstRoleRow.locator('[data-testid="delete-role-btn"]').click();
      await expect(page.locator('[data-testid="confirm-delete-dialog"]')).toBeVisible();

      // 关闭删除确认对话框
      await page.keyboard.press('Escape');
    });

    test('Admin权限分配特殊权限验证', async () => {
      await page.click('[data-testid="nav-role-management"]');
      await page.waitForURL('**/system/role');

      // Admin应该能够分配系统级权限
      const firstRoleRow = page.locator('[data-testid="role-table"] tbody tr:first-child');
      await firstRoleRow.locator('[data-testid="edit-role-btn"]').click();

      // 验证权限选择器可见
      await expect(page.locator('[data-testid="permission-selector"]')).toBeVisible();

      // 验证系统级权限选项可用
      const systemPermissions = page.locator('[data-testid^="permission-system-"]');
      const systemPermissionCount = await systemPermissions.count();

      if (systemPermissionCount > 0) {
        await expect(systemPermissions.first()).toBeVisible();
      }

      await page.click('[data-testid="cancel-role-btn"]');
    });

  });

  test.describe('权限管理权限测试', () => {

    test('Admin权限CRUD完整权限验证', async () => {
      // 1. 导航到权限管理页面
      await page.click('[data-testid="nav-permission-management"]');
      await page.waitForURL('**/system/permission');

      // 2. 验证权限列表查看权限
      const listResponse = await page.waitForResponse('**/api/permissions');
      strictApiValidation.validateApiResponse(listResponse, {
        requiredFields: ['items', 'total'],
        fieldTypes: {
          items: 'array',
          total: 'number'
        }
      });

      // 3. 验证创建权限权限
      await page.click('[data-testid="add-permission-btn"]');
      await expect(page.locator('[data-testid="permission-dialog"]')).toBeVisible();

      // 4. 填写权限信息
      await page.fill('[data-testid="permission-name-input"]', '测试权限');
      await page.fill('[data-testid="permission-code-input"]', 'TEST_PERMISSION');
      await page.selectOption('[data-testid="permission-type-select"]', 'menu');
      await page.fill('[data-testid="permission-path-input"]', '/test-path');

      // 5. 测试保存权限API权限
      await page.click('[data-testid="save-permission-btn"]');

      const createResponse = await page.waitForResponse('**/api/permissions', { timeout: 10000 });
      strictApiValidation.validateApiResponse(createResponse, {
        requiredFields: ['success', 'data'],
        fieldTypes: {
          success: 'boolean',
          data: 'object'
        }
      });

      // 6. 验证编辑权限权限
      const firstPermissionRow = page.locator('[data-testid="permission-table"] tbody tr:first-child');
      await firstPermissionRow.locator('[data-testid="edit-permission-btn"]').click();
      await expect(page.locator('[data-testid="permission-dialog"]')).toBeVisible();

      // 7. 验证删除权限权限
      await page.click('[data-testid="cancel-permission-btn"]'); // 关闭编辑对话框
      await firstPermissionRow.locator('[data-testid="delete-permission-btn"]').click();
      await expect(page.locator('[data-testid="confirm-delete-dialog"]')).toBeVisible();

      // 关闭删除确认对话框
      await page.keyboard.press('Escape');
    });

  });

  test.describe('系统设置权限测试', () => {

    test('Admin系统设置完整权限验证', async () => {
      // 1. 导航到系统设置页面
      await page.click('[data-testid="nav-system-settings"]');
      await page.waitForURL('**/system/settings');

      // 2. 验证系统设置查看权限
      const settingsResponse = await page.waitForResponse('**/api/system/settings');
      strictApiValidation.validateApiResponse(settingsResponse, {
        requiredFields: ['siteName', 'version'],
        fieldTypes: {
          siteName: 'string',
          version: 'string'
        }
      });

      // 3. 测试基本设置修改权限
      await page.click('[data-testid="basic-settings-tab"]');

      // 尝试修改站点名称
      const siteNameInput = page.locator('[data-testid="site-name-input"]');
      if (await siteNameInput.count() > 0) {
        await siteNameInput.fill('幼儿园管理系统-测试');

        // 测试保存设置API权限
        await page.click('[data-testid="save-basic-settings-btn"]');

        const saveResponse = await page.waitForResponse('**/api/system/settings', { timeout: 10000 });
        strictApiValidation.validateApiResponse(saveResponse, {
          requiredFields: ['success'],
          fieldTypes: {
            success: 'boolean'
          }
        });
      }

      // 4. 测试安全设置修改权限
      await page.click('[data-testid="security-settings-tab"]');

      const sessionTimeoutInput = page.locator('[data-testid="session-timeout-input"]');
      if (await sessionTimeoutInput.count() > 0) {
        await sessionTimeoutInput.fill('7200'); // 2小时

        await page.click('[data-testid="save-security-settings-btn"]');
      }

      // 5. 测试邮件设置修改权限
      await page.click('[data-testid="email-settings-tab"]');

      const emailNotificationsToggle = page.locator('[data-testid="email-notifications-toggle"]');
      if (await emailNotificationsToggle.count() > 0) {
        await emailNotificationsToggle.click();

        await page.click('[data-testid="save-email-settings-btn"]');
      }

      // 6. 测试AI快捷方式配置权限
      await page.click('[data-testid="ai-shortcuts-tab"]');
      await expect(page.locator('[data-testid="ai-shortcuts-config"]')).toBeVisible();
    });

  });

  test.describe('系统日志权限测试', () => {

    test('Admin系统日志管理权限验证', async () => {
      // 1. 导航到系统日志页面
      await page.click('[data-testid="nav-system-log"]');
      await page.waitForURL('**/system/log');

      // 2. 验证系统日志查看权限
      const logResponse = await page.waitForResponse('**/api/system/logs');
      strictApiValidation.validateApiResponse(logResponse, {
        requiredFields: ['items', 'total'],
        fieldTypes: {
          items: 'array',
          total: 'number'
        }
      });

      // 3. 验证日志搜索权限
      await page.selectOption('[data-testid="log-level-select"]', 'error');
      await page.fill('[data-testid="log-keyword-input"]', 'test');
      await page.click('[data-testid="search-log-btn"]');

      // 4. 验证日志导出权限
      const exportButton = page.locator('[data-testid="export-log-btn"]');
      if (await exportButton.count() > 0) {
        // 设置下载监听器
        const downloadPromise = page.waitForEvent('download');
        await exportButton.click();
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toContain('logs');
      }

      // 5. 验证日志删除权限
      await page.click('[data-testid="log-table"] thead input[type="checkbox"]'); // 全选
      await page.click('[data-testid="batch-delete-log-btn"]');
      await expect(page.locator('[data-testid="confirm-delete-dialog"]')).toBeVisible();

      // 关闭删除确认对话框
      await page.keyboard.press('Escape');

      // 6. 验证日志清空权限
      const clearButton = page.locator('[data-testid="clear-log-btn"]');
      if (await clearButton.count() > 0) {
        await clearButton.click();
        await expect(page.locator('[data-testid="clear-log-dialog"]')).toBeVisible();

        // 关闭清空日志对话框
        await page.keyboard.press('Escape');
      }
    });

  });

  test.describe('高级功能权限测试', () => {

    test('Admin AI配置权限验证', async () => {
      // 1. 导航到AI模型配置页面
      await page.click('[data-testid="nav-ai-model-config"]');
      await page.waitForURL('**/system/ai-model-config');

      // 2. 验证AI配置查看权限
      const aiConfigResponse = await page.waitForResponse('**/api/system/ai-config');
      strictApiValidation.validateApiResponse(aiConfigResponse, {
        requiredFields: ['models', 'currentModel'],
        fieldTypes: {
          models: 'array',
          currentModel: 'string'
        }
      });

      // 3. 验证AI模型修改权限
      await page.selectOption('[data-testid="model-select"]', 'gpt-4');
      await page.fill('[data-testid="api-key-input"]', 'test-api-key');
      await page.click('[data-testid="save-ai-config-btn"]');

      const saveResponse = await page.waitForResponse('**/api/system/ai-config', { timeout: 10000 });
      strictApiValidation.validateApiResponse(saveResponse, {
        requiredFields: ['success'],
        fieldTypes: {
          success: 'boolean'
        }
      });

      // 4. 验证AI快捷方式配置权限
      await page.click('[data-testid="nav-ai-shortcuts"]');
      await page.waitForURL('**/system/ai-shortcuts');

      await expect(page.locator('[data-testid="ai-shortcuts-page"]')).toBeVisible();
      await expect(page.locator('[data-testid="add-shortcut-btn"]')).toBeVisible();
    });

    test('Admin VOS配置权限验证', async () => {
      // 1. 导航到VOS配置页面
      await page.click('[data-testid="nav-vos-config"]');
      await page.waitForURL('**/system/vos-config');

      // 2. 验证VOS配置查看权限
      const vosConfigResponse = await page.waitForResponse('**/api/system/vos-config');
      strictApiValidation.validateApiResponse(vosConfigResponse, {
        requiredFields: ['server', 'port'],
        fieldTypes: {
          server: 'string',
          port: 'number'
        }
      });

      // 3. 验证VOS配置修改权限
      await page.fill('[data-testid="vos-server-input"]', 'test.vos.example.com');
      await page.fill('[data-testid="vos-port-input"]', '8080');
      await page.click('[data-testid="save-vos-config-btn"]');

      const saveResponse = await page.waitForResponse('**/api/system/vos-config', { timeout: 10000 });
      strictApiValidation.validateApiResponse(saveResponse, {
        requiredFields: ['success'],
        fieldTypes: {
          success: 'boolean'
        }
      });
    });

  });

  test.describe('Admin专用功能权限测试', () => {

    test('Admin图片替换管理权限验证', async () => {
      // 1. 导航到图片替换管理器页面
      await page.click('[data-testid="nav-image-replacement-manager"]');
      await page.waitForURL('**/admin/image-replacement-manager');

      // 2. 验证页面访问权限
      await expect(page.locator('[data-testid="image-replacement-manager-page"]')).toBeVisible();

      // 3. 验证图片上传权限
      const uploadButton = page.locator('[data-testid="upload-image-btn"]');
      if (await uploadButton.count() > 0) {
        await expect(uploadButton).toBeVisible();

        // 测试文件上传API权限（仅验证按钮可点击，不上传实际文件）
        await uploadButton.click();
        await expect(page.locator('[data-testid="file-upload-dialog"]')).toBeVisible();
        await page.keyboard.press('Escape');
      }

      // 4. 验证图片列表查看权限
      const imageListResponse = await page.waitForResponse('**/api/admin/images');
      strictApiValidation.validateApiResponse(imageListResponse, {
        requiredFields: ['images', 'total'],
        fieldTypes: {
          images: 'array',
          total: 'number'
        }
      });
    });

    test('Admin图片替换执行权限验证', async () => {
      // 1. 导航到图片替换页面
      await page.click('[data-testid="nav-image-replacement"]');
      await page.waitForURL('**/admin/image-replacement');

      // 2. 验证页面访问权限
      await expect(page.locator('[data-testid="image-replacement-page"]')).toBeVisible();

      // 3. 验证图片替换操作权限
      const sourceSelect = page.locator('[data-testid="image-source-select"]');
      const targetSelect = page.locator('[data-testid="image-target-select"]');

      if (await sourceSelect.count() > 0 && await targetSelect.count() > 0) {
        await expect(sourceSelect).toBeVisible();
        await expect(targetSelect).toBeVisible();
        await expect(page.locator('[data-testid="execute-replacement-btn"]')).toBeVisible();
      }

      // 4. 验证替换历史查看权限
      const historyResponse = await page.waitForResponse('**/api/admin/replacement-history');
      strictApiValidation.validateApiResponse(historyResponse, {
        requiredFields: ['replacements', 'total'],
        fieldTypes: {
          replacements: 'array',
          total: 'number'
        }
      });
    });

  });

  test.describe('Admin权限API端点测试', () => {

    test('Admin权限检查API验证', async () => {
      // 测试用户权限检查端点
      const permissionResponse = await page.evaluate(async () => {
        const response = await fetch('/api/dynamic-permissions/user-permissions');
        return response.json();
      });

      strictApiValidation.validateAPIResponse(permissionResponse, {
        requiredFields: ['success', 'permissions'],
        fieldTypes: {
          success: 'boolean',
          permissions: 'array'
        },
        customValidators: {
          permissions: (permissions: any[]) => {
            // Admin应该拥有所有权限
            return permissions.length > 0;
          }
        }
      });

      // 验证Admin特有权限
      const permissions = permissionResponse.permissions || [];
      const adminPermissions = [
        'system.manage',
        'user.manage',
        'role.manage',
        'permission.manage',
        'system.settings',
        'system.logs'
      ];

      for (const requiredPermission of adminPermissions) {
        const hasPermission = permissions.some((p: any) =>
          p.code === requiredPermission || p.name === requiredPermission
        );

        if (!hasPermission) {
          throw new Error(`Admin角色缺少必要权限: ${requiredPermission}`);
        }
      }
    });

    test('Admin动态路由权限验证', async () => {
      // 测试动态路由API
      const routesResponse = await page.evaluate(async () => {
        const response = await fetch('/api/dynamic-permissions/dynamic-routes');
        return response.json();
      });

      strictApiValidation.validateAPIResponse(routesResponse, {
        requiredFields: ['success', 'routes'],
        fieldTypes: {
          success: 'boolean',
          routes: 'array'
        }
      });

      const routes = routesResponse.routes || [];

      // 验证Admin可以访问所有管理路由
      const adminRoutes = routes.filter((route: any) =>
        route.path?.includes('/system') ||
        route.path?.includes('/admin') ||
        route.meta?.requiresAdmin
      );

      if (adminRoutes.length === 0) {
        throw new Error('Admin角色应该能够访问系统管理路由');
      }
    });

  });

});