/**
 * TC-046: 家长完整使用流程E2E测试
 * 验证家长用户从注册到日常使用的完整业务流程
 */

import { test, expect } from '@playwright/test';
import { BasePage } from '../page-objects/base-page';

/**
 * 家长端页面对象
 */
class ParentPage extends BasePage {
  // 注册页面元素
  readonly registerButton = this.page.locator('[data-testid="register-button"], button:has-text("注册")');
  readonly phoneInput = this.page.locator('[data-testid="phone-input"], input[placeholder*="手机"]');
  readonly verificationCodeInput = this.page.locator('[data-testid="verification-code-input"], input[placeholder*="验证码"]');
  readonly passwordInput = this.page.locator('[data-testid="password-input"], input[type="password"]');
  readonly sendCodeButton = this.page.locator('[data-testid="send-code-button"], button:has-text("发送验证码")');
  readonly submitRegisterButton = this.page.locator('[data-testid="submit-register"], button:has-text("提交注册")');
  
  // 登录页面元素
  readonly loginButton = this.page.locator('[data-testid="login-button"], button:has-text("登录")');
  readonly usernameInput = this.page.locator('[data-testid="username-input"], input[placeholder*="账号"]');
  readonly loginPasswordInput = this.page.locator('[data-testid="login-password-input"], input[placeholder*="密码"]');
  readonly loginSubmitButton = this.page.locator('[data-testid="login-submit"], button:has-text("登录")');
  
  // 主页面元素
  readonly homeTab = this.page.locator('[data-testid="home-tab"], .tab:has-text("首页")');
  readonly childrenTab = this.page.locator('[data-testid="children-tab"], .tab:has-text("子女")');
  readonly notificationsTab = this.page.locator('[data-testid="notifications-tab"], .tab:has-text("通知")');
  readonly profileTab = this.page.locator('[data-testid="profile-tab"], .tab:has-text("我的")');
  
  // 子女管理元素
  readonly addChildButton = this.page.locator('[data-testid="add-child-button"], button:has-text("添加子女")');
  readonly childNameInput = this.page.locator('[data-testid="child-name-input"], input[placeholder*="姓名"]');
  readonly childClassSelect = this.page.locator('[data-testid="child-class-select"], select');
  readonly childSubmitButton = this.page.locator('[data-testid="child-submit"], button:has-text("提交")');
  readonly childCard = this.page.locator('[data-testid="child-card"], .child-card');
  
  // 通知元素
  readonly notificationItem = this.page.locator('[data-testid="notification-item"], .notification-item');
  readonly markAsReadButton = this.page.locator('[data-testid="mark-as-read"], button:has-text("标记已读")');
  
  // 活动元素
  readonly activityTab = this.page.locator('[data-testid="activity-tab"], .tab:has-text("活动")');
  readonly activityCard = this.page.locator('[data-testid="activity-card"], .activity-card');
  readonly joinActivityButton = this.page.locator('[data-testid="join-activity"], button:has-text("参加")');
  
  // 费用元素
  readonly feesTab = this.page.locator('[data-testid="fees-tab"], .tab:has-text("费用")');
  readonly paymentCard = this.page.locator('[data-testid="payment-card"], .payment-card');
  readonly payButton = this.page.locator('[data-testid="pay-button"], button:has-text("支付")');
  
  // AI助手元素
  readonly aiAssistantButton = this.page.locator('[data-testid="ai-assistant-button"], button:has-text("AI助手")');
  readonly aiChatInput = this.page.locator('[data-testid="ai-chat-input"], textarea[placeholder*="输入"]');
  readonly aiSendButton = this.page.locator('[data-testid="ai-send"], button:has-text("发送")');
  readonly aiMessage = this.page.locator('[data-testid="ai-message"], .ai-message');

  constructor(page: any) {
    super(page);
  }

  /**
   * 执行完整的注册流程
   */
  async completeRegistration(phone: string, password: string): Promise<void> {
    await this.safeClick(this.registerButton);
    await this.waitForPageLoad();
    
    // 输入手机号
    await this.safeType(this.phoneInput, phone);
    
    // 发送验证码
    await this.safeClick(this.sendCodeButton);
    await this.wait(2000); // 等待验证码发送
    
    // 输入验证码（模拟）
    await this.safeType(this.verificationCodeInput, '123456');
    
    // 输入密码
    await this.safeType(this.passwordInput, password);
    
    // 提交注册
    await this.safeClick(this.submitRegisterButton);
    await this.waitForPageLoad();
    
    // 验证注册成功
    await this.expectSuccessMessage('注册成功');
  }

  /**
   * 执行登录流程
   */
  async login(username: string, password: string): Promise<void> {
    if (await this.registerButton.isVisible()) {
      await this.safeClick(this.loginButton);
    }
    
    await this.safeType(this.usernameInput, username);
    await this.safeType(this.loginPasswordInput, password);
    await this.safeClick(this.loginSubmitButton);
    await this.waitForPageLoad();
    
    // 验证登录成功 - 应该看到底部导航
    await this.expectElementVisible(this.bottomNav);
  }

  /**
   * 添加子女信息
   */
  async addChild(childName: string, className: string): Promise<void> {
    await this.safeClick(this.childrenTab);
    await this.safeClick(this.addChildButton);
    
    await this.safeType(this.childNameInput, childName);
    await this.safeClick(this.childClassSelect);
    await this.page.selectOption('[data-testid="child-class-select"]', className);
    
    await this.safeClick(this.childSubmitButton);
    await this.waitForPageLoad();
    
    // 验证添加成功
    await this.expectSuccessMessage('添加成功');
    await this.expectElementVisible(this.childCard);
  }

  /**
   * 查看和处理通知
   */
  async handleNotifications(): Promise<void> {
    await this.safeClick(this.notificationsTab);
    await this.waitForPageLoad();
    
    // 如果有未读通知
    if (await this.notificationItem.first().isVisible()) {
      const unreadCount = await this.notificationItem.count();
      console.log(`发现 ${unreadCount} 条通知`);
      
      // 标记第一条为已读
      await this.safeClick(this.markAsReadButton.first());
      await this.wait(1000);
    }
  }

  /**
   * 参加活动
   */
  async joinActivity(): Promise<void> {
    await this.safeClick(this.activityTab);
    await this.waitForPageLoad();
    
    if (await this.activityCard.first().isVisible()) {
      await this.safeClick(this.joinActivityButton.first());
      await this.wait(2000);
      
      // 验证报名成功
      await this.expectSuccessMessage('报名成功');
    }
  }

  /**
   * 处理费用支付
   */
  async handlePayment(): Promise<void> {
    await this.safeClick(this.feesTab);
    await this.waitForPageLoad();
    
    if (await this.paymentCard.first().isVisible()) {
      const paymentText = await this.getElementText(this.paymentCard.first());
      console.log(`费用信息: ${paymentText}`);
      
      // 注意：这里只模拟点击支付按钮，不实际完成支付
      await this.safeClick(this.payButton.first());
      await this.wait(1000);
      
      // 验证进入支付页面
      const paymentTitle = this.page.locator('h1, h2:has-text("支付")');
      await this.expectElementVisible(paymentTitle);
      
      // 返回
      await this.goBack();
    }
  }

  /**
   * 使用AI助手
   */
  async useAIAssistant(question: string): Promise<void> {
    await this.safeClick(this.aiAssistantButton);
    await this.waitForPageLoad();
    
    await this.safeType(this.aiChatInput, question);
    await this.safeClick(this.aiSendButton);
    
    // 等待AI回复
    await this.wait(3000);
    
    // 验证AI回复
    await this.expectElementVisible(this.aiMessage);
    const aiResponse = await this.getElementText(this.aiMessage.last());
    console.log(`AI回复: ${aiResponse.substring(0, 100)}...`);
    
    expect(aiResponse).toBeTruthy();
    expect(aiResponse.length).toBeGreaterThan(10);
  }
}

test.describe('TC-046: 家长完整使用流程E2E测试', () => {
  let parentPage: ParentPage;
  const testUser = {
    phone: '13800138001',
    username: 'parent_test_001',
    password: 'Test123456',
    childName: '张小明',
    className: '大班A班'
  };

  test.beforeEach(async ({ page }) => {
    parentPage = new ParentPage(page);
    
    // 设置移动端viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 监听控制台错误
    const errors = await parentPage.listenForConsoleErrors();
    
    // 测试结束后验证无控制台错误
    test.afterEach(async () => {
      await parentPage.expectNoConsoleErrors(errors);
    });
  });

  test('TC-046-01: 新用户注册完整流程', async ({ page }) => {
    console.log('🚀 开始测试新用户注册流程');
    
    // 访问应用
    await page.goto('/');
    await parentPage.waitForPageLoad();
    
    // 执行注册
    await parentPage.completeRegistration(testUser.phone, testUser.password);
    
    // 验证注册后状态
    await parentPage.expectElementVisible(parentPage.bottomNav);
    
    // 验证页面性能
    await parentPage.expectPageLoadPerformance(5000);
    
    console.log('✅ 注册流程测试完成');
  });

  test('TC-046-02: 登录和身份验证', async ({ page }) => {
    console.log('🔐 开始测试登录验证流程');
    
    await page.goto('/');
    await parentPage.waitForPageLoad();
    
    // 执行登录
    await parentPage.login(testUser.username, testUser.password);
    
    // 验证登录成功
    await parentPage.expectElementVisible(parentPage.homeTab);
    await parentPage.expectElementVisible(parentPage.childrenTab);
    await parentPage.expectElementVisible(parentPage.notificationsTab);
    await parentPage.expectElementVisible(parentPage.profileTab);
    
    console.log('✅ 登录验证流程测试完成');
  });

  test('TC-046-03: 子女信息管理', async ({ page }) => {
    console.log('👶 开始测试子女信息管理');
    
    await page.goto('/');
    await parentPage.login(testUser.username, testUser.password);
    
    // 添加子女
    await parentPage.addChild(testUser.childName, testUser.className);
    
    // 验证子女卡片信息
    await parentPage.expectElementContainsText(parentPage.childCard.first(), testUser.childName);
    
    console.log('✅ 子女信息管理测试完成');
  });

  test('TC-046-04: 通知消息处理', async ({ page }) => {
    console.log('📬 开始测试通知消息处理');
    
    await page.goto('/');
    await parentPage.login(testUser.username, testUser.password);
    
    // 处理通知
    await parentPage.handleNotifications();
    
    console.log('✅ 通知消息处理测试完成');
  });

  test('TC-046-05: 活动参与功能', async ({ page }) => {
    console.log('🎉 开始测试活动参与功能');
    
    await page.goto('/');
    await parentPage.login(testUser.username, testUser.password);
    
    // 参与活动
    await parentPage.joinActivity();
    
    console.log('✅ 活动参与功能测试完成');
  });

  test('TC-046-06: 费用查询和支付', async ({ page }) => {
    console.log('💰 开始测试费用查询和支付');
    
    await page.goto('/');
    await parentPage.login(testUser.username, testUser.password);
    
    // 处理费用支付
    await parentPage.handlePayment();
    
    console.log('✅ 费用查询和支付测试完成');
  });

  test('TC-046-07: AI助手交互', async ({ page }) => {
    console.log('🤖 开始测试AI助手交互');
    
    await page.goto('/');
    await parentPage.login(testUser.username, testUser.password);
    
    // 使用AI助手
    await parentPage.useAIAssistant('如何帮助孩子提高学习兴趣？');
    
    console.log('✅ AI助手交互测试完成');
  });

  test('TC-046-08: 完整用户旅程综合测试', async ({ page }) => {
    console.log('🔄 开始完整用户旅程综合测试');
    
    const startTime = Date.now();
    
    // 访问应用
    await page.goto('/');
    await parentPage.waitForPageLoad();
    
    // 登录
    await parentPage.login(testUser.username, testUser.password);
    
    // 添加子女
    await parentPage.addChild(testUser.childName, testUser.className);
    
    // 处理通知
    await parentPage.handleNotifications();
    
    // 参与活动
    await parentPage.joinActivity();
    
    // 查看费用
    await parentPage.handlePayment();
    
    // 使用AI助手
    await parentPage.useAIAssistant('今天有什么育儿建议吗？');
    
    // 验证页面性能
    await parentPage.expectPageLoadPerformance(6000);
    
    const totalTime = Date.now() - startTime;
    console.log(`⏱️  完整流程耗时: ${totalTime}ms`);
    
    // 验证总耗时合理（应该在2分钟内完成）
    expect(totalTime).toBeLessThan(120000);
    
    // 返回首页
    await parentPage.safeClick(parentPage.homeTab);
    await parentPage.waitForPageLoad();
    
    // 验证应用状态正常
    await parentPage.expectElementVisible(parentPage.bottomNav);
    await parentPage.expectOnlineStatus(); // 确保在线状态
    
    console.log('✅ 完整用户旅程综合测试完成');
  });

  test('TC-046-09: 网络异常场景测试', async ({ page }) => {
    console.log('🌐 开始测试网络异常场景');
    
    await page.goto('/');
    await parentPage.login(testUser.username, testUser.password);
    
    // 模拟网络断开
    await parentPage.simulateNetworkCondition(true);
    
    // 验证离线提示
    await parentPage.expectOfflineBanner();
    
    // 尝试操作应该显示离线提示
    await parentPage.safeClick(parentPage.childrenTab);
    
    // 恢复网络
    await parentPage.simulateNetworkCondition(false);
    
    // 等待网络恢复
    await parentPage.wait(2000);
    
    // 验证网络恢复
    await parentPage.expectOnlineStatus();
    
    console.log('✅ 网络异常场景测试完成');
  });

  test('TC-046-10: 设备方向变化测试', async ({ page }) => {
    console.log('📱 开始测试设备方向变化');
    
    await page.goto('/');
    await parentPage.login(testUser.username, testUser.password);
    
    // 测试竖屏模式
    await parentPage.simulateOrientation('portrait');
    await parentPage.waitForPageLoad();
    await parentPage.expectElementVisible(parentPage.bottomNav);
    
    // 测试横屏模式
    await parentPage.simulateOrientation('landscape');
    await parentPage.waitForPageLoad();
    await parentPage.expectElementVisible(parentPage.bottomNav);
    
    // 验证布局适应
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeGreaterThan(viewport?.height!);
    
    console.log('✅ 设备方向变化测试完成');
  });
});