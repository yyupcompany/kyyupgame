/**
 * Playwright API Service - 综合精简版
 * 包含所有必要功能的单文件实现
 */

import { chromium, Browser, BrowserContext, Page, ConsoleMessage as PWConsoleMessage } from 'playwright';

// ============= 类型定义 =============
export interface ConsoleMessage {
  type: 'log' | 'debug' | 'info' | 'error' | 'warning';
  text: string;
  timestamp: string;
  location?: {
    url: string;
    lineNumber: number;
    columnNumber: number;
  };
}

export interface PageInfo {
  url: string;
  title: string;
  viewport: { width: number; height: number };
}

// ============= 浏览器管理器 =============
class BrowserManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;

  async launch(config: {
    headless?: boolean;
    viewport?: { width: number; height: number };
  } = {}) {
    this.browser = await chromium.launch({
      headless: true, // 强制使用无头模式
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.context = await this.browser.newContext({
      viewport: config.viewport || { width: 1920, height: 1080 }
    });

    this.page = await this.context.newPage();
  }

  getPage(): Page {
    if (!this.page) throw new Error('浏览器未启动');
    return this.page;
  }

  async close() {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
    this.page = null;
    this.context = null;
    this.browser = null;
  }
}

// ============= 页面操作 =============
class PageOperations {
  constructor(private manager: BrowserManager) {}

  async goto(url: string, options: {
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
    timeout?: number;
  } = {}) {
    const page = this.manager.getPage();
    await page.goto(url, {
      waitUntil: options.waitUntil || 'networkidle',
      timeout: options.timeout || 30000
    });
  }

  async wait(milliseconds: number) {
    await new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  async waitForSelector(selector: string, timeout: number = 30000) {
    const page = this.manager.getPage();
    await page.waitForSelector(selector, { timeout });
  }

  async waitForURL(urlPattern: string | RegExp, timeout: number = 30000) {
    const page = this.manager.getPage();
    await page.waitForURL(urlPattern, { timeout });
  }

  async getTitle(): Promise<string> {
    const page = this.manager.getPage();
    return await page.title();
  }

  async getURL(): Promise<string> {
    const page = this.manager.getPage();
    return page.url();
  }

  async getPageInfo(): Promise<PageInfo> {
    const page = this.manager.getPage();
    return {
      url: page.url(),
      title: await page.title(),
      viewport: page.viewportSize() || { width: 0, height: 0 }
    };
  }

  async evaluate<T = any>(script: any): Promise<T> {
    const page = this.manager.getPage();
    return await page.evaluate(script);
  }
}

// ============= 控制台监控 =============
class ConsoleMonitor {
  private messages: ConsoleMessage[] = [];
  private isMonitoring: boolean = false;

  constructor(private manager: BrowserManager) {}

  startMonitoring() {
    if (this.isMonitoring) return;

    const page = this.manager.getPage();
    this.messages = [];

    page.on('console', (msg: PWConsoleMessage) => {
      this.messages.push({
        type: msg.type() as any,
        text: msg.text(),
        timestamp: new Date().toISOString(),
        location: msg.location()
      });
    });

    page.on('pageerror', (error: Error) => {
      this.messages.push({
        type: 'error',
        text: `[PageError] ${error.message}\n${error.stack}`,
        timestamp: new Date().toISOString()
      });
    });

    this.isMonitoring = true;
  }

  stopMonitoring() {
    const page = this.manager.getPage();
    page.removeAllListeners('console');
    page.removeAllListeners('pageerror');
    this.isMonitoring = false;
  }

  getAllMessages(): ConsoleMessage[] {
    return [...this.messages];
  }

  getErrors(): ConsoleMessage[] {
    return this.messages.filter(msg => msg.type === 'error');
  }

  getWarnings(): ConsoleMessage[] {
    return this.messages.filter(msg => msg.type === 'warning');
  }

  getLogs(): ConsoleMessage[] {
    return this.messages.filter(msg => msg.type === 'log');
  }

  clearMessages() {
    this.messages = [];
  }

  getStatistics() {
    return {
      total: this.messages.length,
      errors: this.getErrors().length,
      warnings: this.getWarnings().length,
      logs: this.getLogs().length,
      debug: this.messages.filter(m => m.type === 'debug').length,
      info: this.messages.filter(m => m.type === 'info').length
    };
  }
}

// ============= 截图服务 =============
class ScreenshotService {
  constructor(private manager: BrowserManager) {}

  async takeScreenshot(options: {
    path?: string;
    fullPage?: boolean;
    type?: 'png' | 'jpeg';
  } = {}): Promise<Buffer> {
    const page = this.manager.getPage();
    return await page.screenshot({
      path: options.path,
      fullPage: options.fullPage !== false,
      type: options.type || 'png'
    });
  }

  async saveScreenshot(fileName: string, directory: string = './'): Promise<string> {
    const fs = await import('fs');
    const path = await import('path');

    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fullFileName = `${timestamp}-${fileName}`;
    const fullPath = path.join(directory, fullFileName);

    await this.takeScreenshot({ path: fullPath });

    return fullPath;
  }
}

// ============= 导出单例实例 =============
const browserManager = new BrowserManager();
const pageOperations = new PageOperations(browserManager);
const consoleMonitor = new ConsoleMonitor(browserManager);
const screenshotService = new ScreenshotService(browserManager);

export {
  browserManager,
  pageOperations,
  consoleMonitor,
  screenshotService
};

// 默认导出
export default {
  browserManager,
  pageOperations,
  consoleMonitor,
  screenshotService
};
