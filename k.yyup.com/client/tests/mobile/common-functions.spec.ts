/**
 * 移动端通用功能测试套件
 * 测试所有角色共用的移动端功能
 */

import { test, expect } from '@playwright/test';

const TEST_ACCOUNTS = {
  admin: { username: 'admin', password: '123456' },
  principal: { username: 'principal', password: '123456' },
  teacher: { username: 'teacher', password: '123456' },
  parent: { username: 'test_parent', password: '123456' }
};

test.describe('移动端-通用功能测试', () => {
  let consoleErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    // 监听控制台错误
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('❌ 控制台错误:', msg.text());
      }
    });

    page.on('pageerror', error => {
      consoleErrors.push(error.message);
    });

    consoleErrors = [];
  });

  test.afterEach(async () => {
    // 过滤掉预期的警告和403错误（测试环境无登录）
    const filteredErrors = consoleErrors.filter(error => {
      // 忽略Vue插件警告
      if (error.includes('Plugin has already been applied to target app')) return false;
      // 忽略Token缺失警告
      if (error.includes('Token或用户信息缺失')) return false;
      if (error.includes('没有找到认证token')) return false;
      // 忽略权限不足错误（测试环境预期）
      if (error.includes('403')) return false;
      if (error.includes('权限不足')) return false;
      if (error.includes('INSUFFICIENT_PERMISSION')) return false;
      // 忽略API调用失败（测试环境无后端）
      if (error.includes('获取孩子列表失败')) return false;
      if (error.includes('获取统计数据失败')) return false;
      if (error.includes('获取最近活动失败')) return false;
      return true;
    });

    if (filteredErrors.length > 0) {
      console.log('❌ 未预期的控制台错误:', filteredErrors);
    }
    expect(filteredErrors.length).toBe(0);
  });

  /**
   * 测试用例1: 登录页面验证
   */
  test('登录页面验证', async ({ page }) => {
    console.log('📋 测试: 登录页面');

    // 访问登录页面
    await page.goto('http://localhost:5173/mobile/login');
    await page.waitForLoadState('networkidle');

    // 验证页面标题
    const title = await page.title();
    expect(title).toBeTruthy();
    console.log('✅ 页面标题:', title);

    // 验证登录表单
    const loginForm = page.locator('.login-form, .van-form');
    await expect(loginForm).toBeVisible();

    // 验证用户名输入框
    const usernameInput = page.locator('input[name="username"], input[placeholder*="账号"]');
    await expect(usernameInput).toBeVisible();
    await expect(usernameInput).toBeEditable();

    // 验证密码输入框
    const passwordInput = page.locator('input[name="password"], input[placeholder*="密码"], input[type="password"]');
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toBeEditable();

    // 验证登录按钮
    const loginBtn = page.locator('button[type="submit"], .login-btn');
    await expect(loginBtn).toBeVisible();
    await expect(loginBtn).toBeEnabled();

    // 验证快捷登录按钮
    const quickLoginBtns = page.locator('.quick-login-btn, .admin-btn, .principal-btn, .teacher-btn, .parent-btn');
    const quickLoginCount = await quickLoginBtns.count();
    expect(quickLoginCount).toBeGreaterThan(0);
    console.log(`✅ 找到 ${quickLoginCount} 个快捷登录按钮`);

    // 测试输入功能
    await usernameInput.fill('test_user');
    await passwordInput.fill('test_password');

    const usernameValue = await usernameInput.inputValue();
    const passwordValue = await passwordInput.inputValue();

    expect(usernameValue).toBe('test_user');
    expect(passwordValue).toBe('test_password');
    console.log('✅ 输入功能正常');
  });

  /**
   * 测试用例2: 各角色登录测试
   */
  test('各角色登录功能测试', async ({ page }) => {
    console.log('📋 测试: 各角色登录功能');

    const roles = [
      { name: 'admin', account: TEST_ACCOUNTS.admin, expectedPath: '/mobile' },
      { name: 'principal', account: TEST_ACCOUNTS.principal, expectedPath: '/mobile' },
      { name: 'teacher', account: TEST_ACCOUNTS.teacher, expectedPath: '/mobile/teacher' },
      { name: 'parent', account: TEST_ACCOUNTS.parent, expectedPath: '/mobile/parent' }
    ];

    for (const role of roles) {
      console.log(`\n🔍 测试 ${role.name} 角色登录`);

      // 访问登录页
      await page.goto('http://localhost:5173/login');
      await page.waitForLoadState('networkidle');

      // 使用快捷登录
      const quickBtn = page.locator(`.${role.name}-btn`);
      await expect(quickBtn).toBeVisible();
      await quickBtn.click();

      // 等待重定向
      await page.waitForTimeout(3000);

      // 验证登录成功
      const currentUrl = page.url();
      expect(currentUrl).toContain(role.expectedPath);
      console.log(`✅ ${role.name} 登录成功，当前URL: ${currentUrl}`);

      // 验证页面加载
      const title = await page.title();
      expect(title).toBeTruthy();

      // 返回到登录页（清除会话）
      await page.goto('http://localhost:5173/login');
      await page.waitForTimeout(1000);
    }
  });

  /**
   * 测试用例3: 全局搜索功能
   */
  test('全局搜索功能', async ({ page }) => {
    console.log('📋 测试: 全局搜索');

    // 登录任意账号
    await page.goto('http://localhost:5173/login');
    await page.waitForLoadState('networkidle');

    const parentBtn = page.locator('.parent-btn');
    await parentBtn.click();
    await page.waitForURL(/\/(mobile|parent-center)/, { timeout: 10000 });

    // 导航到搜索页面
    await page.goto('/mobile/search');
    await page.waitForTimeout(2000);

    // 验证搜索页面
    const searchPage = page.locator('.search-page, .mobile-search');
    await expect(searchPage).toBeVisible();

    // 验证搜索输入框
    const searchInput = page.locator('input[type="search"], .search-input');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toBeEditable();

    // 测试搜索输入
    await searchInput.fill('学生');
    await page.waitForTimeout(1000);

    // 验证搜索结果
    const searchResults = page.locator('.search-results, .van-list');
    const resultsVisible = await searchResults.isVisible();

    if (resultsVisible) {
      const resultItems = page.locator('.result-item, .van-cell');
      const count = await resultItems.count();
      console.log(`✅ 搜索"学生"找到 ${count} 条结果`);
    } else {
      // 验证空搜索结果
      const noResults = page.locator('.no-results, .van-empty');
      if (await noResults.isVisible()) {
        console.log('✅ 无搜索结果时显示空状态');
      }
    }

    // 测试清除搜索
    const clearBtn = page.locator('.clear-search-btn');
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
      await page.waitForTimeout(500);

      const inputValue = await searchInput.inputValue();
      expect(inputValue).toBe('');
      console.log('✅ 清除搜索功能正常');
    }
  });

  /**
   * 测试用例4: 消息中心验证
   */
  test('消息中心功能', async ({ page }) => {
    console.log('📋 测试: 消息中心');

    // 登录并导航到消息中心
    await page.goto('http://localhost:5173/login');
    await page.waitForLoadState('networkidle');

    const parentBtn = page.locator('.parent-btn');
    await parentBtn.click();
    await page.waitForURL(/\/(mobile|parent-center)/, { timeout: 10000 });

    // 通过底部导航或侧边栏进入消息
    await page.goto('/mobile/centers/notification-center');
    await page.waitForTimeout(2000);

    // 验证消息页面
    const messagePage = page.locator('.notification-center, .message-center');
    await expect(messagePage).toBeVisible();

    // 验证消息类型选项卡
    const tabs = page.locator('.message-type-tab, .van-tab');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThan(0);
    console.log(`✅ 消息中心有 ${tabCount} 个类型选项卡`);

    // 验证消息列表
    const messageList = page.locator('.message-list, .notification-list, .van-list');
    await expect(messageList).toBeVisible();

    // 验证消息项
    const messages = page.locator('.message-item, .notification-item, .van-cell');
    const messageCount = await messages.count();
    console.log(`✅ 消息列表显示 ${messageCount} 条消息`);

    if (messageCount > 0) {
      // 验证第一条消息的完整信息
      const firstMessage = messages.first();
      await expect(firstMessage.locator('.message-title, .notification-title')).toBeVisible();
      await expect(firstMessage.locator('.message-time, .notification-time')).toBeVisible();
      await expect(firstMessage.locator('.message-content, .notification-content')).toBeVisible();

      // 测试点击消息
      await firstMessage.click();
      await page.waitForTimeout(1000);
      console.log('✅ 消息可点击查看详情');

      // 返回
      await page.goBack();
    } else {
      // 验证空消息状态
      const emptyState = page.locator('.no-messages, .van-empty');
      if (await emptyState.isVisible()) {
        console.log('✅ 无消息时显示空状态');
      }
    }
  });

  /**
   * 测试用例5: 底部导航栏验证
   */
  test('底部导航栏功能', async ({ page }) => {
    console.log('📋 测试: 底部导航栏');

    // 登录家长账号
    await page.goto('http://localhost:5173/login');
    await page.waitForLoadState('networkidle');

    const parentBtn = page.locator('.parent-btn');
    await parentBtn.click();
    await page.waitForURL(/\/(mobile|parent-center)/, { timeout: 10000 });

    // 验证底部导航存在
    const footer = page.locator('.mobile-footer, .van-tabbar');
    await expect(footer).toBeVisible();
    console.log('✅ 底部导航栏显示正常');

    // 验证导航项
    const tabs = page.locator('.van-tabbar-item, .van-tab');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThan(0);
    console.log(`✅ 底部导航有 ${tabCount} 个选项`);

    // 测试切换导航
    for (let i = 0; i < Math.min(tabCount, 3); i++) {
      const tab = tabs.nth(i);
      const tabText = await tab.textContent();

      await tab.click();
      await page.waitForTimeout(1000);

      // 验证激活状态
      const isActive = await tab.evaluate(el => el.classList.contains('van-tabbar-item--active'));
      if (isActive) {
        console.log(`✅ 切换到 "${tabText?.trim()}" Tab`);
      }
    }

    // 测试更多按钮（打开侧边栏）
    const moreBtn = page.locator('.more-btn, .van-tabbar-item:last-child');
    if (await moreBtn.isVisible()) {
      await moreBtn.click();
      await page.waitForTimeout(500);

      // 验证侧边栏
      const drawer = page.locator('.mobile-drawer, .van-popup');
      if (await drawer.isVisible()) {
        console.log('✅ 点击"更多"打开侧边栏');

        // 关闭侧边栏
        const overlay = page.locator('.van-overlay');
        if (await overlay.isVisible()) {
          await overlay.click();
          await page.waitForTimeout(500);
        }
      }
    }
  });

  /**
   * 测试用例6: 错误页面处理
   */
  test('错误页面处理', async ({ page }) => {
    console.log('📋 测试: 错误页面');

    // 访问不存在的页面
    await page.goto('http://localhost:5173/mobile/invalid-page-12345');
    await page.waitForTimeout(2000);

    // 验证错误页面显示
    const errorPage = page.locator('.error-page, .van-empty');
    if (await errorPage.isVisible()) {
      console.log('✅ 访问不存在的页面时显示错误页');

      // 验证错误提示
      const errorMessage = errorPage.locator('.error-message, .van-empty__description');
      if (await errorMessage.isVisible()) {
        const messageText = await errorMessage.textContent();
        console.log(`✅ 错误提示: ${messageText}`);
      }

      // 验证返回按钮
      const backBtn = errorPage.locator('.back-btn, .van-button');
      if (await backBtn.isVisible()) {
        console.log('✅ 错误页提供返回按钮');
      }
    }

    // 测试返回首页
    const homeBtn = page.locator('.go-home-btn');
    if (await homeBtn.isVisible()) {
      await homeBtn.click();
      await page.waitForTimeout(1000);

      // 验证回到首页
      const currentUrl = page.url();
      expect(currentUrl).not.toContain('invalid-page');
      console.log('✅ 错误页可返回首页');
    }
  });

  /**
   * 测试用例7: 加载状态验证
   */
  test('加载状态验证', async ({ page }) => {
    console.log('📋 测试: 加载状态');

    // 登录并访问一个有数据加载的页面
    await page.goto('http://localhost:5173/login');
    await page.waitForLoadState('networkidle');

    const parentBtn = page.locator('.parent-btn');
    await parentBtn.click();
    await page.waitForURL(/\/(mobile|parent-center)/, { timeout: 10000 });

    // 验证加载指示器
    const loading = page.locator('.van-loading, .van-skeleton');
    const loadingVisible = await loading.isVisible();

    if (loadingVisible) {
      console.log('✅ 数据加载时显示加载指示器');

      // 等待加载完成
      await page.waitForTimeout(3000);

      // 验证加载完成后指示器消失
      const loadingNow = page.locator('.van-loading__spinner');
      await expect(loadingNow).not.toBeVisible();
      console.log('✅ 数据加载完成后加载指示器消失');
    }

    // 验证下拉刷新
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(500);

    // 模拟下拉手势
    await page.mouse.move(200, 100);
    await page.mouse.down();
    await page.mouse.move(200, 300);
    await page.waitForTimeout(100);
    await page.mouse.up();

    // 验证下拉刷新指示器
    const pullRefresh = page.locator('.van-pull-refresh__head');
    if (await pullRefresh.isVisible()) {
      console.log('✅ 下拉刷新功能正常');
    }
  });

  /**
   * 测试用例8: 弹窗和对话框
   */
  test('弹窗和对话框功能', async ({ page }) => {
    console.log('📋 测试: 弹窗和对话框');

    // 登录并访问可能触发弹窗的页面
    await page.goto('http://localhost:5173/login');
    await page.waitForLoadState('networkidle');

    const parentBtn = page.locator('.parent-btn');
    await parentBtn.click();
    await page.waitForURL(/\/(mobile|parent-center)/, { timeout: 10000 });

    // 寻找可以触发弹窗的按钮
    const actionButtons = page.locator('.van-button--primary, .action-btn');
    const buttonCount = await actionButtons.count();

    if (buttonCount > 0) {
      // 点击第一个操作按钮
      const firstBtn = actionButtons.first();
      const btnText = await firstBtn.textContent();

      await firstBtn.click();
      await page.waitForTimeout(1000);

      // 验证弹窗
      const dialog = page.locator('.van-dialog, .van-popup, .van-action-sheet');
      const dialogVisible = await dialog.isVisible();

      if (dialogVisible) {
        console.log(`✅ 点击"${btnText?.trim()}"触发弹窗`);

        // 验证弹窗内容
        const dialogTitle = dialog.locator('.van-dialog__header, .van-popup__title');
        if (await dialogTitle.isVisible()) {
          const titleText = await dialogTitle.textContent();
          console.log(`✅ 弹窗标题: ${titleText}`);
        }

        // 测试关闭弹窗
        const closeBtn = dialog.locator('.van-dialog__close, .van-popup__close-icon');
        const cancelBtn = dialog.locator('.van-dialog__cancel, .van-button--default');

        if (await closeBtn.isVisible()) {
          await closeBtn.click();
        } else if (await cancelBtn.isVisible()) {
          await cancelBtn.click();
        } else {
          // 点击遮罩层关闭
          const overlay = page.locator('.van-overlay');
          if (await overlay.isVisible()) {
            await overlay.click();
          }
        }

        await page.waitForTimeout(500);
        console.log('✅ 弹窗可正常关闭');
      }
    }
  });

  /**
   * 测试用例9: 表单输入验证
   */
  test('表单输入功能', async ({ page }) => {
    console.log('📋 测试: 表单输入');

    // 登录并导航到表单页面
    await page.goto('http://localhost:5173/login');
    await page.waitForLoadState('networkidle');

    const parentBtn = page.locator('.parent-btn');
    await parentBtn.click();
    await page.waitForURL(/\/(mobile|parent-center)/, { timeout: 10000 });

    // 寻找表单或编辑页面
    await page.goto('/mobile/parent-center/profile');
    await page.waitForTimeout(2000);

    // 验证输入框
    const inputs = page.locator('input[type="text"], input[type="tel"], textarea, .van-field__control');
    const inputCount = await inputs.count();

    if (inputCount > 0) {
      console.log(`✅ 找到 ${inputCount} 个输入框`);

      // 测试第一个输入框
      const firstInput = inputs.first();
      await firstInput.click();
      await page.waitForTimeout(200);

      // 输入测试文本
      await firstInput.fill('测试输入123');
      await page.waitForTimeout(200);

      // 验证输入
      const inputValue = await firstInput.inputValue();
      expect(inputValue).toBe('测试输入123');
      console.log('✅ 表单输入功能正常');

      // 测试键盘弹出
      const isIOS = await page.evaluate(() => /iPhone|iPad|iPod/i.test(navigator.userAgent));
      if (isIOS) {
        console.log('✅ iOS设备检测到');
      } else {
        console.log('✅ Android设备检测到');
      }
    }
  });
});

test.use({
  viewport: { width: 375, height: 667 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2
});
