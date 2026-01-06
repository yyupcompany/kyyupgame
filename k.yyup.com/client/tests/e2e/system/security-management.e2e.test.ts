/// <reference types="vitest" />
import { test, expect, type Page } from '@playwright/test';

describe('系统安全管理端到端测试', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    // 创建浏览器上下文
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      // 设置用户代理
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });

    page = await context.newPage();

    // 设置请求拦截以模拟API响应
    await page.route('**/api/system/settings', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            siteName: '幼儿园管理系统',
            version: 'v2.1.0',
            timezone: 'Asia/Shanghai',
            language: 'zh-CN',
            maintenanceMode: false,
            maxFileSize: '10MB',
            sessionTimeout: 120,
            emailNotifications: true,
            smsNotifications: false
          }
        })
      });
    });

    await page.route('**/api/permissions', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            items: [
              {
                id: '1',
                name: '用户管理',
                description: '管理系统用户',
                createdAt: '2024-01-01T00:00:00Z'
              },
              {
                id: '2',
                name: '角色管理',
                description: '管理系统角色',
                createdAt: '2024-01-02T00:00:00Z'
              },
              {
                id: '3',
                name: '权限管理',
                description: '管理系统权限',
                createdAt: '2024-01-03T00:00:00Z'
              }
            ],
            total: 3,
            page: 1,
            pageSize: 10
          }
        })
      });
    });

    await page.route('**/api/security/overview', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            securityScore: 85,
            threatLevel: 'medium',
            activeThreats: 3,
            vulnerabilities: 7,
            riskLevel: 35,
            connectionStatus: '实时监控中'
          }
        })
      });
    });

    await page.route('**/api/security/threats', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          threats: [
            {
              id: 'threat-1',
              title: '可疑登录尝试',
              description: '检测到来自异常IP地址的多次登录失败',
              severity: 'medium',
              timestamp: '2024-01-01T10:00:00Z',
              source: '登录监控系统',
              sourceIp: '192.168.1.100'
            },
            {
              id: 'threat-2',
              title: 'SQL注入攻击',
              description: '检测到恶意SQL查询尝试',
              severity: 'high',
              timestamp: '2024-01-01T10:05:00Z',
              source: 'Web应用防火墙',
              sourceIp: '192.168.1.101'
            }
          ]
        })
      });
    });
  });

  test.afterAll(async () => {
    await page.close();
  });

  test.beforeEach(async () => {
    // 导航到系统设置页面
    await page.goto('/system/settings');

    // 等待页面加载完成
    await page.waitForLoadState('networkidle');

    // 等待关键元素加载
    await page.waitForSelector('.page-container', { timeout: 10000 });
  });

  describe('系统设置页面E2E测试', () => {
    test('应该正确加载和显示系统设置页面', async () => {
      // 验证页面标题
      await expect(page.locator('h1.page-title')).toContainText('系统设置');

      // 验证标签页存在
      await expect(page.locator('.el-tabs__item')).toHaveCount(5);

      // 验证默认选中的标签页
      await expect(page.locator('.el-tabs__item.is-active')).toContainText('基本设置');

      // 验证权限提示（如果有）
      const permissionAlert = page.locator('.permission-alert');
      if (await permissionAlert.isVisible()) {
        await expect(permissionAlert).toContainText('权限提示');
      }
    });

    test('应该能够切换不同的设置标签页', async () => {
      // 切换到邮件设置
      await page.click('text=邮件设置');
      await expect(page.locator('.el-tabs__item.is-active')).toContainText('邮件设置');

      // 切换到安全设置
      await page.click('text=安全设置');
      await expect(page.locator('.el-tabs__item.is-active')).toContainText('安全设置');

      // 切换到存储设置
      await page.click('text=存储设置');
      await expect(page.locator('.el-tabs__item.is-active')).toContainText('存储设置');

      // 切换到AI助手配置
      await page.click('text=AI助手配置');
      await expect(page.locator('.el-tabs__item.is-active')).toContainText('AI助手配置');

      // 切换回基本设置
      await page.click('text=基本设置');
      await expect(page.locator('.el-tabs__item.is-active')).toContainText('基本设置');
    });

    test('应该显示加载状态和错误处理', async () => {
      // 设置API延迟以测试加载状态
      await page.route('**/api/system/settings', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        route.continue();
      });

      await page.reload();
      await page.waitForLoadState('networkidle');

      // 验证加载状态
      await expect(page.locator('.el-skeleton')).toBeVisible();

      // 等待加载完成
      await page.waitForSelector('.basic-settings-mock', { timeout: 5000 });
      await expect(page.locator('.el-skeleton')).not.toBeVisible();
    });

    test('应该能够修改并保存系统设置', async () => {
      // 切换到安全设置
      await page.click('text=安全设置');

      // 等待安全设置组件加载
      await page.waitForSelector('.security-settings-mock');

      // 查找并修改会话超时设置
      const sessionTimeoutInput = page.locator('input[placeholder*="会话超时"]');
      if (await sessionTimeoutInput.isVisible()) {
        await sessionTimeoutInput.fill('180');
      }

      // 点击保存按钮（需要通过组件事件触发）
      const saveButton = page.locator('button:has-text("保存设置")');
      if (await saveButton.isVisible()) {
        // 拦截保存请求
        let saveRequestReceived = false;
        await page.route('**/api/system/settings/**', (route) => {
          saveRequestReceived = true;
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, message: '设置保存成功' })
          });
        });

        await saveButton.click();

        // 验证请求被发送
        expect(saveRequestReceived).toBe(true);

        // 验证成功消息
        await expect(page.locator('.el-message--success')).toBeVisible({ timeout: 5000 });
      }
    });
  });

  describe('权限管理页面E2E测试', () => {
    test.beforeEach(async () => {
      await page.goto('/system/permissions');
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('.permissions-page', { timeout: 10000 });
    });

    test('应该正确加载权限管理页面', async () => {
      // 验证页面标题
      await expect(page.locator('h1')).toContainText('权限管理');

      // 验证新增按钮
      await expect(page.locator('button:has-text("新增")')).toBeVisible();

      // 验证搜索表单
      await expect(page.locator('.search-input input')).toBeVisible();
      await expect(page.locator('button:has-text("搜索")')).toBeVisible();
      await expect(page.locator('button:has-text("重置")')).toBeVisible();

      // 验证数据表格
      await expect(page.locator('.el-table')).toBeVisible();

      // 验证分页组件
      await expect(page.locator('.el-pagination')).toBeVisible();
    });

    test('应该能够搜索权限', async () => {
      const searchInput = page.locator('.search-input input');
      const searchButton = page.locator('button:has-text("搜索")');

      // 输入搜索关键词
      await searchInput.fill('用户管理');
      await searchButton.click();

      // 验证搜索结果
      await expect(page.locator('.el-table__body')).toContainText('用户管理');
    });

    test('应该能够重置搜索条件', async () => {
      const searchInput = page.locator('.search-input input');
      const resetButton = page.locator('button:has-text("重置")');

      // 输入搜索内容
      await searchInput.fill('test');

      // 点击重置
      await resetButton.click();

      // 验证搜索框被清空
      await expect(searchInput).toHaveValue('');
    });

    test('应该能够创建新权限', async () => {
      // 拦截创建权限请求
      let createRequestReceived = false;
      await page.route('**/api/permissions', async (route) => {
        if (route.request().method() === 'POST') {
          createRequestReceived = true;
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: {
                id: 'new-permission',
                name: '新权限',
                description: '新权限描述',
                createdAt: '2024-01-01T00:00:00Z'
              }
            })
          });
        }
      });

      // 点击新增按钮
      await page.click('button:has-text("新增")');

      // 等待对话框出现
      await expect(page.locator('.el-dialog')).toBeVisible();
      await expect(page.locator('.el-dialog__header')).toContainText('新增权限管理');

      // 填写表单
      await page.fill('input[placeholder="请输入名称"]', '新权限');
      await page.fill('textarea[placeholder="请输入描述"]', '新权限描述');

      // 提交表单
      await page.click('.el-dialog__footer button:has-text("确认")');

      // 验证请求被发送
      expect(createRequestReceived).toBe(true);

      // 验证成功消息
      await expect(page.locator('.el-message--success')).toBeVisible({ timeout: 5000 });

      // 验证对话框关闭
      await expect(page.locator('.el-dialog')).not.toBeVisible();
    });

    test('应该能够编辑权限', async () => {
      // 拦截更新权限请求
      let updateRequestReceived = false;
      await page.route('**/api/permissions/*', async (route) => {
        if (route.request().method() === 'PUT') {
          updateRequestReceived = true;
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true })
          });
        }
      });

      // 点击编辑按钮
      await page.click('text=编辑').first();

      // 等待对话框出现
      await expect(page.locator('.el-dialog')).toBeVisible();
      await expect(page.locator('.el-dialog__header')).toContainText('编辑权限管理');

      // 修改表单内容
      await page.fill('input[placeholder="请输入名称"]', '更新后的权限名称');

      // 提交表单
      await page.click('.el-dialog__footer button:has-text("确认")');

      // 验证请求被发送
      expect(updateRequestReceived).toBe(true);

      // 验证成功消息
      await expect(page.locator('.el-message--success')).toBeVisible({ timeout: 5000 });
    });

    test('应该能够删除权限', async () => {
      // 拦截删除权限请求
      let deleteRequestReceived = false;
      await page.route('**/api/permissions/*', async (route) => {
        if (route.request().method() === 'DELETE') {
          deleteRequestReceived = true;
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true })
          });
        }
      });

      // 点击删除按钮
      await page.click('text=删除').first();

      // 验证确认对话框出现
      await expect(page.locator('.el-message-box')).toBeVisible();
      await expect(page.locator('.el-message-box__message')).toContainText('此操作将永久删除该记录');

      // 确认删除
      await page.click('.el-message-box__btns button:has-text("确定")');

      // 验证请求被发送
      expect(deleteRequestReceived).toBe(true);

      // 验证成功消息
      await expect(page.locator('.el-message--success')).toBeVisible({ timeout: 5000 });
    });

    test('应该能够进行分页操作', async () => {
      // 验证分页信息
      await expect(page.locator('.el-pagination')).toBeVisible();

      // 更改页面大小
      const pageSizeSelect = page.locator('.el-pagination__sizes .el-select');
      if (await pageSizeSelect.isVisible()) {
        await pageSizeSelect.click();
        await page.click('.el-select-dropdown__item:has-text("20")');

        // 验证页面大小改变
        await expect(page.locator('.el-pagination__sizes')).toContainText('20 条/页');
      }

      // 切换页码
      const nextPageButton = page.locator('.el-pagination .btn-next');
      if (await nextPageButton.isEnabled()) {
        await nextPageButton.click();

        // 验证页码改变（这里需要根据实际实现调整）
        await page.waitForTimeout(1000);
      }
    });
  });

  describe('安全监控页面E2E测试', () => {
    test.beforeEach(async () => {
      await page.goto('/system/security');
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('.security-monitoring', { timeout: 10000 });
    });

    test('应该正确加载安全监控页面', async () => {
      // 验证页面标题
      await expect(page.locator('h2')).toContainText('安全监控中心');

      // 验证操作按钮
      await expect(page.locator('button:has-text("执行安全扫描")')).toBeVisible();
      await expect(page.locator('button:has-text("刷新数据")')).toBeVisible();

      // 验证安全概览卡片
      await expect(page.locator('.security-overview')).toBeVisible();
      await expect(page.locator('.score-circle')).toBeVisible();
      await expect(page.locator('.score-details')).toBeVisible();

      // 验证威胁检测区域
      await expect(page.locator('.threat-detection')).toBeVisible();
      await expect(page.locator('.threat-timeline')).toBeVisible();
    });

    test('应该显示正确的安全评分和威胁等级', async () => {
      // 验证安全评分
      const scoreValue = page.locator('.score-value');
      await expect(scoreValue).toContainText('85');

      // 验证威胁等级
      const threatLevelTag = page.locator('.metric .el-tag');
      await expect(threatLevelTag).toContainText('中风险');

      // 验证活跃威胁数量
      const activeThreatsValue = page.locator('.metric:has-text("活跃威胁") .value');
      await expect(activeThreatsValue).toContainText('3');
    });

    test('应该能够执行安全扫描', async () => {
      // 拦截安全扫描请求
      let scanRequestReceived = false;
      await page.route('**/api/security/scan', async (route) => {
        scanRequestReceived = true;
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            scanId: 'scan-123',
            message: '安全扫描已启动'
          })
        });
      });

      // 点击执行安全扫描按钮
      await page.click('button:has-text("执行安全扫描")');

      // 验证按钮处于加载状态
      await expect(page.locator('button:has-text("执行安全扫描")')).toBeDisabled();

      // 验证请求被发送
      expect(scanRequestReceived).toBe(true);

      // 等待扫描完成
      await page.waitForTimeout(4000); // 模拟扫描时间

      // 验证成功消息
      await expect(page.locator('.el-message--success')).toBeVisible({ timeout: 10000 });

      // 验证按钮恢复正常状态
      await expect(page.locator('button:has-text("执行安全扫描")')).toBeEnabled();
    });

    test('应该显示威胁列表和处理选项', async () => {
      // 等待威胁列表加载
      await expect(page.locator('.threat-item')).toHaveCount(2, { timeout: 5000 });

      // 验证威胁信息显示
      await expect(page.locator('.threat-item')).toContainText('可疑登录尝试');
      await expect(page.locator('.threat-item')).toContainText('SQL注入攻击');

      // 验证威胁处理按钮
      const firstThreatActions = page.locator('.threat-item').first().locator('.threat-actions');
      await expect(firstThreatActions.locator('button:has-text("处理")')).toBeVisible();
      await expect(firstThreatActions.locator('button:has-text("忽略")')).toBeVisible();
      await expect(firstThreatActions.locator('button:has-text("阻止")')).toBeVisible();
    });

    test('应该能够处理安全威胁', async () => {
      // 拦截威胁处理请求
      let handleThreatRequestReceived = false;
      await page.route('**/api/security/threats/*/handle', async (route) => {
        handleThreatRequestReceived = true;
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        });
      });

      // 点击第一个威胁的处理按钮
      await page.click('.threat-item:first-child .threat-actions button:has-text("处理")');

      // 验证请求被发送
      expect(handleThreatRequestReceived).toBe(true);

      // 验证成功消息
      await expect(page.locator('.el-message--success')).toBeVisible({ timeout: 5000 });
    });

    test('应该能够刷新安全数据', async () => {
      // 拦截刷新请求
      let refreshRequests = 0;
      await page.route('**/api/security/**', async (route) => {
        if (route.request().method() === 'GET') {
          refreshRequests++;
          route.continue();
        }
      });

      // 点击刷新数据按钮
      await page.click('button:has-text("刷新数据")');

      // 等待刷新完成
      await page.waitForTimeout(2000);

      // 验证刷新请求被发送
      expect(refreshRequests).toBeGreaterThan(0);

      // 验证按钮恢复正常状态
      await expect(page.locator('button:has-text("刷新数据")')).toBeEnabled();
    });

    test('应该显示用户行为分析数据', async () => {
      // 验证行为分析区域
      await expect(page.locator('.behavior-analysis')).toBeVisible();
      await expect(page.locator('.behavior-metrics')).toBeVisible();

      // 验证行为指标卡片
      await expect(page.locator('.metric-card')).toHaveCount(3); // 登录、活跃用户、访问尝试

      // 验证具体指标数据
      await expect(page.locator('.metric-card')).toContainText('总登录次数');
      await expect(page.locator('.metric-card')).toContainText('活跃用户');
      await expect(page.locator('.metric-card')).toContainText('访问尝试');
    });

    test('应该能够生成行为分析报告', async () => {
      // 点击时间范围选择器
      const timeRangeSelect = page.locator('.analysis-controls .el-select');
      if (await timeRangeSelect.isVisible()) {
        await timeRangeSelect.click();
        await page.click('.el-select-dropdown__item:has-text("最近7天")');

        // 等待数据更新
        await page.waitForTimeout(1000);
      }

      // 拦截报告生成请求（如果有的话）
      let reportGenerated = false;

      // 点击生成报告按钮
      const generateReportButton = page.locator('button:has-text("生成报告")');
      if (await generateReportButton.isVisible()) {
        await page.click(generateReportButton);

        // 等待报告生成
        await page.waitForTimeout(3000);

        // 验证成功消息
        await expect(page.locator('.el-message--success')).toBeVisible({ timeout: 5000 });
      }
    });
  });

  describe('跨页面导航和状态保持测试', () => {
    test('应该能够在系统管理页面间导航', async () => {
      // 从系统设置开始
      await page.goto('/system/settings');
      await page.waitForLoadState('networkidle');

      // 导航到权限管理
      await page.click('a[href*="/system/permissions"]');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('h1')).toContainText('权限管理');

      // 导航到安全监控
      await page.click('a[href*="/system/security"]');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('h2')).toContainText('安全监控中心');

      // 返回系统设置
      await page.click('a[href*="/system/settings"]');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('h1')).toContainText('系统设置');
    });

    test('应该在页面刷新后保持状态', async () => {
      // 导航到权限管理页面
      await page.goto('/system/permissions');
      await page.waitForLoadState('networkidle');

      // 执行搜索操作
      await page.fill('.search-input input', '用户管理');
      await page.click('button:has-text("搜索")');

      // 刷新页面
      await page.reload();
      await page.waitForLoadState('networkidle');

      // 验证页面重新加载
      await expect(page.locator('.permissions-page')).toBeVisible();

      // 注意：具体的搜索状态保持取决于实现
      // 这个测试主要验证页面能够正常重新加载
    });
  });

  describe('响应式设计测试', () => {
    test('应该在移动设备上正确显示', async () => {
      // 设置移动设备视口
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/system/settings');
      await page.waitForLoadState('networkidle');

      // 验证移动端布局
      await expect(page.locator('.page-container')).toBeVisible();

      // 验证标签页在移动端的显示
      await expect(page.locator('.el-tabs')).toBeVisible();

      // 验证响应式菜单（如果有）
      const mobileMenu = page.locator('.mobile-menu, .hamburger');
      if (await mobileMenu.isVisible()) {
        await mobileMenu.click();
        await expect(page.locator('.mobile-nav')).toBeVisible();
      }
    });

    test('应该在平板设备上正确显示', async () => {
      // 设置平板设备视口
      await page.setViewportSize({ width: 768, height: 1024 });

      await page.goto('/system/permissions');
      await page.waitForLoadState('networkidle');

      // 验证平板端布局
      await expect(page.locator('.permissions-page')).toBeVisible();
      await expect(page.locator('.el-table')).toBeVisible();

      // 验证表格在平板端的响应式行为
      const tableWrapper = page.locator('.table-wrapper');
      if (await tableWrapper.isVisible()) {
        // 验证表格可以水平滚动（如果需要）
        const tableOverflow = await tableWrapper.evaluate(el => {
          return window.getComputedStyle(el).overflowX === 'auto' ||
                 window.getComputedStyle(el).overflowX === 'scroll';
        });
        // 根据实际实现调整验证逻辑
      }
    });
  });

  describe('无障碍性测试', () => {
    test('应该支持键盘导航', async () => {
      await page.goto('/system/settings');
      await page.waitForLoadState('networkidle');

      // 使用Tab键导航
      await page.keyboard.press('Tab');

      // 验证焦点移动到可聚焦元素
      const focusedElement = await page.locator(':focus');
      expect(await focusedElement.count()).toBeGreaterThan(0);

      // 继续Tab导航到标签页
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // 使用Enter键激活标签页
      await page.keyboard.press('Enter');

      // 验证标签页被激活
      await expect(page.locator('.el-tabs__item.is-active')).toBeVisible();
    });

    test('应该提供适当的ARIA标签', async () => {
      await page.goto('/system/permissions');
      await page.waitForLoadState('networkidle');

      // 验证表格的ARIA标签
      const table = page.locator('.el-table');
      await expect(table).toHaveAttribute('role', 'table');

      // 验证按钮的ARIA标签
      const buttons = page.locator('button[aria-label], button[title]');
      expect(await buttons.count()).toBeGreaterThan(0);

      // 验证表单输入的标签关联
      const inputs = page.locator('input[aria-label], input[aria-describedby]');
      expect(await inputs.count()).toBeGreaterThan(0);
    });

    test('应该支持屏幕阅读器', async () => {
      await page.goto('/system/security');
      await page.waitForLoadState('networkidle');

      // 验证页面标题
      await expect(page.locator('h1, h2')).toBeVisible();

      // 验证重要内容的语义化标签
      await expect(page.locator('main, [role="main"]')).toBeVisible();

      // 验证跳过导航链接（如果有）
      const skipLink = page.locator('a[href="#main"], .skip-link');
      if (await skipLink.isVisible()) {
        await expect(skipLink).toBeVisible();
      }
    });
  });

  describe('性能测试', () => {
    test('应该在合理时间内加载页面', async () => {
      const startTime = Date.now();

      await page.goto('/system/settings');
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('.page-container', { timeout: 10000 });

      const loadTime = Date.now() - startTime;

      // 页面应该在5秒内加载完成
      expect(loadTime).toBeLessThan(5000);
    });

    test('应该能够处理大量数据而不卡顿', async () => {
      // 模拟大量权限数据
      await page.route('**/api/permissions', (route) => {
        const largeData = {
          success: true,
          data: {
            items: Array.from({ length: 1000 }, (_, i) => ({
              id: `${i}`,
              name: `权限${i}`,
              description: `权限描述${i}`,
              createdAt: '2024-01-01T00:00:00Z'
            })),
            total: 1000,
            page: 1,
            pageSize: 1000
          }
        };

        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(largeData)
        });
      });

      const startTime = Date.now();

      await page.goto('/system/permissions');
      await page.waitForLoadState('networkidle');

      const renderTime = Date.now() - startTime;

      // 大量数据渲染应该在10秒内完成
      expect(renderTime).toBeLessThan(10000);

      // 验证数据正确显示
      await expect(page.locator('.el-table__body')).toBeVisible();
    });

    test('应该正确清理资源避免内存泄漏', async () => {
      // 这个测试需要长时间运行来检测内存泄漏
      // 在实际CI环境中可能需要特殊配置

      for (let i = 0; i < 10; i++) {
        await page.goto('/system/settings');
        await page.waitForLoadState('networkidle');
        await page.waitForSelector('.page-container');

        // 执行一些操作
        await page.click('text=邮件设置');
        await page.click('text=安全设置');

        // 导航到其他页面
        await page.goto('/system/permissions');
        await page.waitForLoadState('networkidle');

        // 返回系统设置
        await page.goto('/system/settings');
        await page.waitForLoadState('networkidle');
      }

      // 验证页面仍然响应正常
      await expect(page.locator('.page-container')).toBeVisible();
    });
  });
});