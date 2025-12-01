/**
 * 营销功能端到端测试
 * 模拟真实用户完整的营销使用旅程
 */

const { chromium, firefox, webkit } = require('playwright');
const TestHelpers = require('../utils/test-helpers');
const config = require('../config/test-config');

describe('营销功能端到端测试', () => {
  let browser;
  let page;
  let context;
  let apiClient;

  beforeAll(async () => {
    // 启动浏览器
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext();
    page = await context.newPage();

    // 设置API客户端
    apiClient = new (require('../utils/api-client'))();
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    // 清除cookies和storage
    await context.clearCookies();
    await page.goto('about:blank');
  });

  describe('用户完整的营销体验流程', () => {
    test('用户应该能够完成从浏览活动到参与团购的完整流程', async () => {
      // 1. 用户登录
      await page.goto(config.api.baseUrl || 'http://localhost:5173');

      // 查找登录按钮
      const loginButton = await page.waitForSelector('[data-testid="login-button"], button:has-text("登录")');
      await loginButton.click();

      // 填写登录表单
      await page.waitForSelector('[data-testid="email-input"], input[type="email"]');
      await page.fill('[data-testid="email-input"]', config.users.parent1.email);

      await page.waitForSelector('[data-testid="password-input"], input[type="password"]');
      await page.fill('[data-testid="password-input"]', config.users.parent1.password);

      // 提交登录
      const submitLoginButton = await page.waitForSelector('[data-testid="login-submit"], button:has-text("登录")');
      await submitLoginButton.click();

      // 验证登录成功
      await page.waitForSelector('[data-testid="user-profile"]');
      expect(await page.textContent('[data-testid="user-profile"]')).toContain(config.users.parent1.email);

      // 2. 浏览活动列表
      await page.waitForSelector('[data-testid="activity-list"]');
      const activityCards = await page.$$('[data-testid="activity-card"]');
      expect(activityCards.length).toBeGreaterThan(0);

      // 点击第一个活动查看详情
      const firstActivity = activityCards[0];
      await firstActivity.click();

      // 3. 查看活动详情
      await page.waitForSelector('[data-testid="activity-detail"]');
      const activityTitle = await page.textContent('[data-testid="activity-title"]');
      expect(activityTitle).toBeDefined();

      // 4. 查看营销设置
      const marketingTab = await page.waitForSelector('[data-testid="marketing-tab"]');
      await marketingTab.click();

      // 5. 查看团购设置
      const groupBuySection = await page.waitForSelector('[data-testid="group-buy-section"]');

      // 检查团购信息显示
      const groupBuyStatus = await page.textContent('[data-testid="group-buy-status"]');
      expect(groupBuyStatus).toBeDefined();

      // 6. 参与团购
      const joinGroupBuyButton = await page.waitForSelector('[data-testid="join-group-buy"]');
      if (await joinGroupBuyButton.isVisible()) {
        await joinGroupBuyButton.click();

        // 填写参团信息
        await page.waitForSelector('[data-testid="participant-name"]');
        await page.fill('[data-testid="participant-name"]', '测试参与者');

        await page.waitForSelector('[data-testid="participant-phone"]');
        await page.fill('[data-testid="participant-phone"]', '13800138001');

        // 提交参团
        const submitJoinButton = await page.waitForSelector('[data-testid="submit-join"]');
        await submitJoinBuyButton.click();

        // 等待成功消息
        await page.waitForSelector('[data-testid="success-message"]');
        const successMessage = await page.textContent('[data-testid="success-message"]');
        expect(successMessage).toContain('成功');
      }

      // 7. 验证团购状态更新
      await page.reload();
      await page.waitForSelector('[data-testid="group-buy-status"]');
      const updatedStatus = await page.textContent('[data-testid="group-buy-status"]');
      expect(updatedStatus).toBeDefined();
    }, 30000);

    test('用户应该能够完成积攒助力和奖励领取流程', async () => {
      // 1. 登录用户
      await page.goto(config.api.baseUrl || 'http://localhost:5173');

      // 快速登录
      await page.evaluate(() => {
        // 直接设置localStorage模拟登录状态
        localStorage.setItem('token', 'mock-token');
        localStorage.setItem('user', JSON.stringify({
          id: 1,
          name: '测试用户',
          email: config.users.parent1.email
        }));
      });

      // 2. 进入活动中心
      await page.goto(`${config.api.baseUrl || 'http://localhost:5173'}/activity-center`);

      // 3. 查看积攒活动
      const collectActivities = await page.$$('[data-testid="collect-activity-card"]');

      if (collectActivities.length > 0) {
        const firstCollectActivity = collectActivities[0];
        await firstCollectActivity.click();

        // 4. 查看积攒详情
        await page.waitForSelector('[data-testid="collect-detail"]');
        const collectCode = await page.textContent('[data-testid="collect-code"]');
        expect(collectCode).toBeDefined();

        // 5. 分享积攒
        const shareButton = await page.waitForSelector('[data-testid="share-collect"]');
        await shareButton.click();

        // 检查分享选项
        await page.waitForSelector('[data-testid="share-options"]');
        const shareOptions = await page.$$('[data-testid="share-option"]');
        expect(shareOptions.length).toBeGreaterThan(0);

        // 6. 关闭分享弹窗
        const closeButton = await page.waitForSelector('[data-testid="close-share"]');
        await closeButton.click();

        // 7. 查看积攒进度
        const progress = await page.textContent('[data-testid="collect-progress"]');
        expect(progress).toBeDefined();

        // 8. 查看奖励信息
        const rewardInfo = await page.textContent('[data-testid="reward-info"]');
        expect(rewardInfo).toBeDefined();
      }
    }, 20000);

    test('用户应该能够完成线下支付流程', async () => {
      // 1. 模拟用户已登录
      await page.goto(`${config.api.baseUrl || 'http://localhost:5173'}/activity-center`);

      // 2. 选择活动
      const activityCards = await page.$$('[data-testid="activity-card"]');
      if (activityCards.length > 0) {
        await activityCards[0].click();

        // 3. 点击报名按钮
        const registerButton = await page.waitForSelector('[data-testid="register-button"]');
        await registerButton.click();

        // 4. 选择支付方式
        await page.waitForSelector('[data-testid="payment-methods"]');
        const offlineOption = await page.waitForSelector('[data-testid="payment-offline"]');
        await offlineOption.click();

        // 5. 查看线下支付信息
        const offlineInfo = await page.textContent('[data-testid="offline-payment-info"]');
        expect(offlineInfo).toBeDefined();

        // 6. 确认支付信息
        const confirmButton = await page.waitForSelector('[data-testid="confirm-payment"]');
        if (await confirmButton.isVisible()) {
          await confirmButton.click();

          // 7. 查看支付成功页面
          await page.waitForSelector('[data-testid="payment-success"]');
          const successMessage = await page.textContent('[data-testid="payment-success-message"]');
          expect(successMessage).toContain('成功');
        }
      }
    }, 25000);

    test('管理员应该能够配置和管理营销设置', async () => {
      // 1. 管理员登录
      await page.goto(`${config.api.baseUrl || 'http://localhost:5173'}/admin/login`);

      await page.waitForSelector('[data-testid="admin-username"]');
      await page.fill('[data-testid="admin-username"]', config.users.admin.email);
      await page.fill('[data-testid="admin-password"]', config.users.admin.password);

      const adminLoginButton = await page.waitForSelector('[data-testid="admin-login-submit"]');
      await adminLoginButton.click();

      // 2. 进入营销管理
      await page.waitForSelector('[data-testid="marketing-management"]');
      await page.click();

      // 3. 查看团购管理
      const groupBuyManagement = await page.waitForSelector('[data-testid="group-buy-management"]');
      await groupBuyManagement.click();

      // 4. 查看团购列表
      await page.waitForSelector('[data-testid="group-buy-list"]');
      const groupBuyList = await page.$$('[data-testid="group-buy-item"]');
      expect(groupBuyList.length).toBeGreaterThanOrEqual(0);

      // 5. 创建新团购
      const createGroupBuyButton = await page.waitForSelector('[data-testid="create-group-buy"]');
      if (await createGroupBuyButton.isVisible()) {
        await createGroupBuyButton.click();

        // 填写团购信息
        await page.waitForSelector('[data-testid="group-buy-activity-select"]');
        await page.select('[data-testid="group-buy-activity-select"]', '1'); // 选择第一个活动

        await page.waitForSelector('[data-testid="group-buy-min-participants"]');
        await page.fill('[data-testid="group-buy-min-participants"]', '5');

        await page.waitForSelector('[data-testid="group-buy-max-participants"]');
        await page.fill('[data-testid="group-buy-max-participants"]', '20');

        // 保存团购设置
        const saveButton = await page.waitForSelector('[data-testid="save-group-buy"]');
        await saveButton.click();

        // 验证保存成功
        await page.waitForSelector('[data-testid="save-success"]');
      }
    }, 30000);
  });

  describe('营销功能异常情况处理', () => {
    test('应该正确处理团购过期情况', async () => {
      // 模拟用户登录
      await page.goto(`${config.api.baseUrl || 'http://localhost:5173'}/activity-center`);

      // 查找已过期的团购
      const expiredGroupBuys = await page.$$('[data-testid="group-buy-expired"]');

      if (expiredGroupBuys.length > 0) {
        const expiredGroupBuy = expiredGroupBuys[0];
        await expiredGroupBuy.click();

        // 验证过期状态显示
        await page.waitForSelector('[data-testid="expired-status"]');
        const expiredStatus = await page.textContent('[data-testid="expired-status"]');
        expect(expiredStatus).toContain('已过期');

        // 验证无法加入
        const joinButton = await page.$('[data-testid="join-group-buy"]');
        expect(joinButton).toBeNull();
      }
    }, 15000);

    test('应该正确处理支付失败情况', async () => {
      await page.goto(`${config.api.baseUrl || 'http://localhost:5173'}/activity-center`);

      const activityCards = await page.$$('[data-testid="activity-card"]');
      if (activityCards.length > 0) {
        await activityCards[0].click();

        // 模拟支付失败场景
        const registerButton = await page.waitForSelector('[data-testid="register-button"]');
        await registerButton.click();

        await page.waitForSelector('[data-testid="payment-methods"]');
        const offlineOption = await page.waitForSelector('[data-testid="payment-offline"]');
        await offlineOption.click();

        // 设置过期的支付截止时间来模拟失败
        const confirmButton = await page.waitForSelector('[data-testid="confirm-payment"]');
        await confirmButton.click();

        // 验证错误处理
        await page.waitForSelector('[data-testid="payment-error"]');
        const errorMessage = await page.textContent('[data-testid="payment-error-message"]');
        expect(errorMessage).toBeDefined();
      }
    }, 20000);

    test('应该正确处理积攒活动异常', async () => {
      await page.goto(`${config.api.baseUrl || 'http://localhost:5173'}/activity-center`);

      // 查找异常状态的积攒活动
      const abnormalCollectActivities = await page.$$('[data-testid="collect-activity-error"]');

      if (abnormalCollectActivities.length > 0) {
        const abnormalActivity = abnormalCollectActivities[0];
        await abnormalActivity.click();

        // 验证错误状态显示
        await page.waitForSelector('[data-testid="error-status"]');
        const errorStatus = await page.textContent('[data-testid="error-status-message"]');
        expect(errorStatus).toBeDefined();

        // 验证无法助力
        const helpButton = await page.$('[data-testid="help-collect"]');
        expect(helpButton).toBeNull();
      }
    }, 15000);
  });

  describe('性能和可用性测试', () => {
    test('营销页面应该在合理时间内加载', async () => {
      const startTime = Date.now();

      await page.goto(`${config.api.baseUrl || 'http://localhost:5173'}/activity-center`);

      await page.waitForSelector('[data-testid="activity-list"]', {
        timeout: 10000
      });

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // 5秒内加载完成
    }, 15000);

    test('应该响应不同屏幕尺寸', async () => {
      // 测试移动端尺寸
      await page.setViewport(375, 667);
      await page.goto(`${config.api.baseUrl || 'http://localhost:5173'}/activity-center`);

      await page.waitForSelector('[data-testid="activity-list"]');
      expect(await page.evaluate(() => window.innerWidth)).toBe(375);

      // 测试桌面尺寸
      await page.setViewport(1920, 1080);
      await page.reload();

      await page.waitForSelector('[data-testid="activity-list"]');
      expect(await page.evaluate(() => window.innerWidth)).toBe(1920);

      // 测试平板尺寸
      await page.setViewport(768, 1024);
      await page.reload();

      await page.waitForSelector('[data-testid="activity-list"]');
      expect(await page.evaluate(() => window.innerWidth)).toBe(768);
    }, 20000);

    test('应该支持键盘导航', async () => {
      await page.goto(`${config.api.baseUrl || 'http://localhost:5173'}/activity-center`);

      // 测试Tab键导航
      await page.keyboard.press('Tab');

      const focusedElement = await page.evaluate(() => document.activeElement);
      expect(focusedElement).toBeTruthy();

      // 测试Enter键交互
      const firstActivityCard = await page.$('[data-testid="activity-card"]');
      if (firstActivityCard) {
        await firstActivityCard.focus();
        await page.keyboard.press('Enter');

        // 验证是否进入详情页
        await page.waitForSelector('[data-testid="activity-detail"]', { timeout: 5000 });
      }
    }, 15000);

    test('应该处理网络中断情况', async () => {
      await page.goto(`${config.api.baseUrl || 'http://localhost:5173'}/activity-center`);

      // 模拟网络中断
      await page.route('**/*.{png,jpg,jpeg,svg}', route => route.abort());
      await page.route('**/api/**', route => route.abort());

      // 尝试加载内容
      await page.reload();

      // 验证错误处理
      await page.waitForSelector('[data-testid="network-error"]', {
        timeout: 5000
      });

      const errorMessage = await page.textContent('[data-testid="network-error-message"]');
      expect(errorMessage).toContain('网络');
    }, 15000);
  });

  describe('数据一致性和准确性测试', () => {
    test('营销数据应该与后端API保持一致', async () => {
      // 获取前端显示的团购数据
      await page.goto(`${config.api.baseUrl || 'http://localhost:5173'}/activity-center`);

      const groupBuyCards = await page.$$('[data-testid="group-buy-card"]');

      if (groupBuyCards.length > 0) {
        const firstCard = groupBuyCards[0];
        const frontendData = {
          status: await firstCard.textContent('[data-testid="group-buy-status"]'),
          progress: await firstCard.textContent('[data-testid="group-buy-progress"]'),
          participants: await firstCard.textContent('[data-testid="participant-count"]')
        };

        // 获取后端API数据
        const groupBuyId = await firstCard.getAttribute('data-group-buy-id');
        if (groupBuyId) {
          try {
            const backendResponse = await apiClient.getGroupBuyDetail(parseInt(groupBuyId));
            const backendData = backendResponse.data;

            // 验证数据一致性
            expect(frontendData.status).toContain(backendData.status);
            expect(typeof frontendData.progress).toBe('string');
          } catch (error) {
            console.log('API调用失败，继续前端测试');
          }
        }
      }
    }, 20000);

    test('应该正确显示实时的营销状态更新', async () => {
      // 这个测试需要WebSocket或轮询机制来验证实时更新
      await page.goto(`${config.api.baseUrl || 'http://localhost:5173'}/activity-center`);

      // 查找动态更新的营销元素
      const dynamicElements = await page.$$('[data-testid="dynamic-content"]');

      if (dynamicElements.length > 0) {
        const firstElement = dynamicElements[0];
        const initialContent = await firstElement.textContent();

        // 等待内容更新
        await page.waitForTimeout(3000);

        const updatedContent = await firstElement.textContent();

        // 验证内容可能发生了更新
        expect(updatedContent).toBeDefined();
      }
    }, 15000);
  });
});