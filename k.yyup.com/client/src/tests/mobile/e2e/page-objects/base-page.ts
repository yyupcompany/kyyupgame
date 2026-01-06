/**
 * 移动端E2E测试基础页面类
 * 提供通用的页面操作和验证方法
 */

import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  protected page: Page;
  
  // 通用选择器
  readonly loadingIndicator = this.page.locator('[data-testid="loading-spinner"], .loading, .spinner');
  readonly errorMessage = this.page.locator('[data-testid="error-message"], .error-message, .alert-error');
  readonly successMessage = this.page.locator('[data-testid="success-message"], .success-message, .alert-success');
  readonly offlineBanner = this.page.locator('[data-testid="offline-banner"], .offline-banner');
  readonly retryButton = this.page.locator('[data-testid="retry-button"], .retry-btn, button:has-text("重试")');
  
  // 导航元素
  readonly bottomNav = this.page.locator('[data-testid="bottom-nav"], .bottom-navigation, .tab-bar');
  readonly backButton = this.page.locator('[data-testid="back-button"], .back-btn, button:has-text("返回")');
  readonly menuButton = this.page.locator('[data-testid="menu-button"], .menu-btn, .hamburger');

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * 等待页面加载完成
   */
  async waitForPageLoad(timeout: number = 30000): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout });
    await this.page.waitForSelector('body', { state: 'attached', timeout });
  }

  /**
   * 等待加载指示器消失
   */
  async waitForLoadingComplete(timeout: number = 15000): Promise<void> {
    try {
      await this.loadingIndicator.waitFor({ state: 'hidden', timeout });
    } catch (error) {
      // 如果加载指示器不存在，认为加载已完成
      console.log('加载指示器不存在，认为加载已完成');
    }
  }

  /**
   * 验证元素可见性
   */
  async expectElementVisible(locator: Locator, timeout: number = 10000): Promise<void> {
    await expect(locator).toBeVisible({ timeout });
  }

  /**
   * 验证元素包含文本
   */
  async expectElementContainsText(locator: Locator, text: string, timeout: number = 10000): Promise<void> {
    await expect(locator).toContainText(text, { timeout });
  }

  /**
   * 验证元素存在
   */
  async expectElementExists(locator: Locator, timeout: number = 10000): Promise<void> {
    await expect(locator).toBeAttached({ timeout });
  }

  /**
   * 验证元素隐藏
   */
  async expectElementHidden(locator: Locator, timeout: number = 10000): Promise<void> {
    await expect(locator).toBeHidden({ timeout });
  }

  /**
   * 安全点击元素（等待元素可见并可点击）
   */
  async safeClick(locator: Locator, timeout: number = 10000): Promise<void> {
    await this.expectElementVisible(locator, timeout);
    await locator.click();
  }

  /**
   * 安全填写输入框
   */
  async safeType(locator: Locator, text: string, clearFirst: boolean = true, timeout: number = 10000): Promise<void> {
    await this.expectElementVisible(locator, timeout);
    
    if (clearFirst) {
      await locator.clear();
    }
    
    await locator.fill(text);
  }

  /**
   * 滚动到元素
   */
  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * 滚动到页面底部
   */
  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
  }

  /**
   * 模拟移动端触摸操作
   */
  async tap(locator: Locator): Promise<void> {
    await locator.tap();
  }

  /**
   * 模拟滑动操作
   */
  async swipe(startX: number, startY: number, endX: number, endY: number): Promise<void> {
    await this.page.touchscreen.tap(startX, startY);
    await this.page.touchscreen.move(endX, endY);
    await this.page.touchscreen.up();
  }

  /**
   * 等待并点击返回按钮
   */
  async goBack(): Promise<void> {
    if (await this.backButton.isVisible()) {
      await this.safeClick(this.backButton);
    } else {
      await this.page.goBack();
    }
  }

  /**
   * 验证是否显示错误消息
   */
  async expectErrorMessage(expectedMessage?: string): Promise<void> {
    await this.expectElementVisible(this.errorMessage);
    
    if (expectedMessage) {
      await this.expectElementContainsText(this.errorMessage, expectedMessage);
    }
  }

  /**
   * 验证是否显示成功消息
   */
  async expectSuccessMessage(expectedMessage?: string): Promise<void> {
    await this.expectElementVisible(this.successMessage);
    
    if (expectedMessage) {
      await this.expectElementContainsText(this.successMessage, expectedMessage);
    }
  }

  /**
   * 验证是否显示离线横幅
   */
  async expectOfflineBanner(): Promise<void> {
    await this.expectElementVisible(this.offlineBanner);
  }

  /**
   * 验证是否显示在线状态
   */
  async expectOnlineStatus(): Promise<void> {
    await this.expectElementHidden(this.offlineBanner);
  }

  /**
   * 等待网络请求完成
   */
  async waitForNetworkIdle(timeout: number = 30000): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * 拦截并验证API请求
   */
  async interceptAPIRequest(
    urlPattern: string | RegExp,
    response?: { status: number; body?: any }
  ): Promise<void> {
    await this.page.route(urlPattern, async (route) => {
      if (response) {
        await route.fulfill({
          status: response.status,
          contentType: 'application/json',
          body: JSON.stringify(response.body || {})
        });
      } else {
        await route.continue();
      }
    });
  }

  /**
   * 监听控制台错误
   */
  async listenForConsoleErrors(): Promise<string[]> {
    const errors: string[] = [];
    
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    this.page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    return errors;
  }

  /**
   * 验证没有控制台错误
   */
  async expectNoConsoleErrors(errors: string[]): Promise<void> {
    expect(errors).toHaveLength(0);
    if (errors.length > 0) {
      console.error('检测到控制台错误:', errors);
      throw new Error(`检测到 ${errors.length} 个控制台错误`);
    }
  }

  /**
   * 获取页面性能指标
   */
  async getPerformanceMetrics(): Promise<any> {
    return await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime || 0,
      };
    });
  }

  /**
   * 验证页面加载性能
   */
  async expectPageLoadPerformance(maxLoadTime: number = 3000): Promise<void> {
    const metrics = await this.getPerformanceMetrics();
    
    expect(metrics.domContentLoaded).toBeLessThan(maxLoadTime);
    expect(metrics.loadComplete).toBeLessThan(maxLoadTime);
    expect(metrics.firstContentfulPaint).toBeLessThan(maxLoadTime);
  }

  /**
   * 模拟网络状态变化
   */
  async simulateNetworkCondition(offline: boolean = false): Promise<void> {
    const context = this.page.context();
    await context.setOffline(offline);
  }

  /**
   * 模拟设备方向
   */
  async simulateOrientation(orientation: 'portrait' | 'landscape'): Promise<void> {
    const viewport = orientation === 'portrait' 
      ? { width: 375, height: 667 }
      : { width: 667, height: 375 };
    
    await this.page.setViewportSize(viewport);
  }

  /**
   * 截取屏幕截图
   */
  async takeScreenshot(options?: { path?: string; fullPage?: boolean }): Promise<void> {
    await this.page.screenshot({
      path: options?.path,
      fullPage: options?.fullPage || false,
    });
  }

  /**
   * 等待特定时间（仅在必要时使用）
   */
  async wait(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }

  /**
   * 获取元素文本内容
   */
  async getElementText(locator: Locator): Promise<string> {
    await this.expectElementVisible(locator);
    return await locator.textContent() || '';
  }

  /**
   * 验证元素数量
   */
  async expectElementCount(locator: Locator, expectedCount: number): Promise<void> {
    await expect(locator).toHaveCount(expectedCount);
  }

  /**
   * 验证元素属性值
   */
  async expectElementAttribute(locator: Locator, attribute: string, value: string): Promise<void> {
    await expect(locator).toHaveAttribute(attribute, value);
  }

  /**
   * 验证元素是否禁用
   */
  async expectElementDisabled(locator: Locator): Promise<void> {
    await expect(locator).toBeDisabled();
  }

  /**
   * 验证元素是否启用
   */
  async expectElementEnabled(locator: Locator): Promise<void> {
    await expect(locator).toBeEnabled();
  }
}