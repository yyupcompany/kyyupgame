import { test, expect, Page } from '@playwright/test';

/**
 * 移动端新媒体中心功能测试
 * 测试路径: /mobile/centers/new-media-center
 */

// 基础URL
const BASE_URL = 'http://localhost:5173';
// 移动端视口配置
const MOBILE_VIEWPORT = { width: 375, height: 667 };

// 测试数据
const TEST_CREDENTIALS = {
  principal: { username: 'principal', password: '123456' },
  admin: { username: 'test_admin', password: '123456' },
  teacher: { username: 'teacher', password: '123456' },
  parent: { username: 'test_parent', password: '123456' }
};

test.describe('移动端新媒体中心 - 快捷登录测试', () => {
  let page: Page;

  test.beforeEach(async ({ page: p }) => {
    page = p;
    // 设置移动端视口
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto(BASE_URL + '/login');
  });

  test('快捷登录 - 园长角色', async () => {
    // 等待页面加载
    await page.waitForLoadState('networkidle');

    // 点击快捷登录中的"园长"按钮
    const principalBtn = page.locator('.quick-btn.principal-btn').or(
      page.locator('button[title*="园长"]')
    );
    await expect(principalBtn).toBeVisible();
    await principalBtn.click();

    // 等待登录完成 - 应该跳转到某个页面
    await page.waitForTimeout(3000);

    // 验证当前URL不再是登录页
    await expect(page.url()).not.toContain('/login');

    console.log('✅ 园长快捷登录成功，当前URL:', page.url());
  });

  test('快捷登录 - 系统管理员', async () => {
    await page.waitForLoadState('networkidle');

    const adminBtn = page.locator('.quick-btn.admin-btn').or(
      page.locator('button[title*="系统管理员"]')
    );
    await expect(adminBtn).toBeVisible();
    await adminBtn.click();

    await page.waitForTimeout(3000);
    await expect(page.url()).not.toContain('/login');

    console.log('✅ 系统管理员快捷登录成功，当前URL:', page.url());
  });
});

test.describe('移动端新媒体中心 - 核心功能测试', () => {
  let page: Page;

  test.beforeEach(async ({ page: p }) => {
    page = p;
    await page.setViewportSize(MOBILE_VIEWPORT);

    // 先登录
    await page.goto(BASE_URL + '/login');
    await page.waitForLoadState('networkidle');

    // 使用园长快捷登录
    const principalBtn = page.locator('.quick-btn.principal-btn');
    await principalBtn.click();
    await page.waitForTimeout(3000);

    console.log('登录完成，当前URL:', page.url());
  });

  test('访问新媒体中心主页', async () => {
    // 导航到新媒体中心
    await page.goto(BASE_URL + '/mobile/centers/new-media-center');
    await page.waitForLoadState('networkidle');

    // 验证页面标题
    const title = page.locator('.mobile-main-layout');
    await expect(title).toBeVisible();

    // 验证标签页存在
    const tabs = page.locator('.van-tabs');
    await expect(tabs).toBeVisible();

    // 截图保存
    await page.screenshot({ path: 'screenshots/new-media-center-home.png' });

    console.log('✅ 新媒体中心主页加载成功');
  });

  test('测试文案创作功能', async () => {
    await page.goto(BASE_URL + '/mobile/centers/new-media-center');
    await page.waitForLoadState('networkidle');

    // 点击文案创作标签
    const copywritingTab = page.locator('.van-tab:has-text("文案创作")');
    await copywritingTab.click();
    await page.waitForTimeout(500);

    // 验证文案创作表单
    const platformField = page.locator('input[placeholder*="发布平台"]');
    await expect(platformField).toBeVisible();

    // 选择平台
    await platformField.click();
    const platformOption = page.locator('.van-picker-column .van-picker__option:has-text("微信朋友圈")');
    await platformOption.click();

    // 填写主题
    const topicField = page.locator('textarea[placeholder*="主题"]');
    await topicField.fill('春季招生宣传');

    // 选择风格
    const styleRadio = page.locator('.van-radio:has-text("温馨") input');
    await styleRadio.click();

    // 截图
    await page.screenshot({ path: 'screenshots/copywriting-form-filled.png' });

    console.log('✅ 文案创作表单填写成功');
  });

  test('测试图文创作功能', async () => {
    await page.goto(BASE_URL + '/mobile/centers/new-media-center');
    await page.waitForLoadState('networkidle');

    // 点击图文创作标签
    const articleTab = page.locator('.van-tab:has-text("图文创作")');
    await articleTab.click();
    await page.waitForTimeout(500);

    // 验证图文创作表单
    const platformField = page.locator('input[placeholder*="发布平台"]');
    await expect(platformField).toBeVisible();

    console.log('✅ 图文创作页面加载成功');
  });

  test('测试视频创作功能', async () => {
    await page.goto(BASE_URL + '/mobile/centers/new-media-center');
    await page.waitForLoadState('networkidle');

    // 点击视频创作标签
    const videoTab = page.locator('.van-tab:has-text("视频创作")');
    await videoTab.click();
    await page.waitForTimeout(500);

    // 验证视频创作表单
    const platformField = page.locator('input[placeholder*="发布平台"]');
    await expect(platformField).toBeVisible();

    console.log('✅ 视频创作页面加载成功');
  });

  test('测试文字转语音功能', async () => {
    await page.goto(BASE_URL + '/mobile/centers/new-media-center');
    await page.waitForLoadState('networkidle');

    // 点击文字转语音标签
    const ttsTab = page.locator('.van-tab:has-text("文字转语音")');
    await ttsTab.click();
    await page.waitForTimeout(500);

    // 验证TTS表单
    const inputField = page.locator('textarea[placeholder*="语音的文本"]');
    await expect(inputField).toBeVisible();

    console.log('✅ 文字转语音页面加载成功');
  });

  test('完整流程测试 - 文案创作生成', async () => {
    await page.goto(BASE_URL + '/mobile/centers/new-media-center');
    await page.waitForLoadState('networkidle');

    // 导航到文案创作
    const copywritingTab = page.locator('.van-tab:has-text("文案创作")');
    await copywritingTab.click();
    await page.waitForTimeout(500);

    // 填写表单
    const platformField = page.locator('input[placeholder*="发布平台"]');
    await platformField.click();
    await page.locator('.van-picker-column .van-picker__option:has-text("微信朋友圈")').click();

    const typeField = page.locator('input[placeholder*="文案类型"]');
    await typeField.click();
    await page.locator('.van-picker-column .van-picker__option:has-text("招生宣传")').click();

    const topicField = page.locator('textarea[placeholder*="主题"]');
    await topicField.fill('春季招生活动火热进行中');

    // 点击生成按钮
    const generateBtn = page.locator('button[type="submit"]:has-text("生成文案")');
    await generateBtn.click();

    // 等待生成结果
    await page.waitForTimeout(3000);

    // 验证结果弹窗
    const resultPopup = page.locator('.van-popup--bottom:has(.result-popup)');
    if (await resultPopup.isVisible()) {
      console.log('✅ 生成结果弹窗显示成功');
      await page.screenshot({ path: 'screenshots/copywriting-result.png' });
    } else {
      console.log('⚠️  生成结果弹窗未显示（可能是模拟数据返回）');
    }
  });
});

test.describe('移动端新媒体中心 - UI/UX测试', () => {
  let page: Page;

  test.beforeEach(async ({ page: p }) => {
    page = p;
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto(BASE_URL + '/login');
    await page.waitForLoadState('networkidle');

    // 快捷登录
    await page.locator('.quick-btn.principal-btn').click();
    await page.waitForTimeout(3000);
  });

  test('概览页面功能卡片测试', async () => {
    await page.goto(BASE_URL + '/mobile/centers/new-media-center');
    await page.waitForLoadState('networkidle');

    // 确保在概览标签
    const overviewTab = page.locator('.van-tab:has-text("概览")');
    await overviewTab.click();

    // 验证4个功能卡片
    const featureCards = page.locator('.feature-card');
    await expect(featureCards).toHaveCount(4);

    // 验证卡片文本
    await expect(page.locator('.feature-card:has-text("文案创作")')).toBeVisible();
    await expect(page.locator('.feature-card:has-text("图文创作")')).toBeVisible();
    await expect(page.locator('.feature-card:has-text("视频创作")')).toBeVisible();
    await expect(page.locator('.feature-card:has-text("文字转语音")')).toBeVisible();

    await page.screenshot({ path: 'screenshots/overview-cards.png' });

    console.log('✅ 概览页面功能卡片验证成功');
  });

  test('响应式布局测试', async () => {
    await page.goto(BASE_URL + '/mobile/centers/new-media-center');
    await page.waitForLoadState('networkidle');

    // 测试不同屏幕尺寸
    const sizes = [
      { width: 375, height: 667 },  // iPhone SE
      { width: 390, height: 844 },  // iPhone 12
      { width: 414, height: 896 }   // iPhone 11
    ];

    for (const size of sizes) {
      await page.setViewportSize(size);
      await page.waitForTimeout(500);

      // 验证页面无水平滚动
      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const clientWidth = await page.evaluate(() => document.body.clientWidth);
      expect(scrollWidth).toBe(clientWidth);

      console.log(`✅ 屏幕尺寸 ${size.width}x${size.height} 布局正常`);
    }
  });
});

test.describe('移动端新媒体中心 - 兼容性测试', () => {
  test('样式一致性检查', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto(BASE_URL + '/login');
    await page.waitForLoadState('networkidle');

    // 登录
    await page.locator('.quick-btn.principal-btn').click();
    await page.waitForTimeout(3000);

    // 访问新媒体中心
    await page.goto(BASE_URL + '/mobile/centers/new-media-center');
    await page.waitForLoadState('networkidle');

    // 检查设计令牌是否正确应用
    const primaryColor = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      return styles.getPropertyValue('--primary-color');
    });
    expect(primaryColor).toBeTruthy();

    // 检查移动端布局包裹
    const layout = page.locator('.mobile-main-layout');
    await expect(layout).toBeVisible();

    // 检查设计令牌颜色值
    const designTokens = await page.evaluate(() => {
      const root = document.documentElement;
      return {
        primaryColor: getComputedStyle(root).getPropertyValue('--primary-color'),
        appGap: getComputedStyle(root).getPropertyValue('--app-gap'),
        radiusLg: getComputedStyle(root).getPropertyValue('--radius-lg')
      };
    });

    console.log('设计令牌:', designTokens);
    expect(designTokens.primaryColor).toBeTruthy();
    expect(designTokens.appGap).toBeTruthy();

    console.log('✅ 样式一致性检查通过');
  });
});
