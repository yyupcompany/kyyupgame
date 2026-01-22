/**
 * MCP移动端测试工具函数库
 * 提供浏览器启动、登录、数据检测、API捕获等功能
 */

import { chromium, Browser, BrowserContext, Page } from '@playwright/test';
import { PageDetectionMetrics, TestRole, MCPTesntReport } from './mcp-types';

/**
 * 启动移动端浏览器
 * @returns 返回浏览器、上下文和页面对象
 */
export async function launchMobileBrowser() {
  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 375, height: 667 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1'
  });

  const page = await context.newPage();

  return { browser, context, page };
}

/**
 * 以指定角色登录
 * @param page - Playwright页面对象
 * @param role - 测试角色（parent或teacher）
 * @returns 登录结果
 */
export async function loginAsRole(page: Page, role: TestRole) {
  const selectors = {
    parent: '.parent-btn',
    teacher: '.teacher-btn'
  };

  await page.goto('http://localhost:5173/login');
  await page.waitForSelector(selectors[role], { timeout: 5000 });
  await page.click(selectors[role]);

  // 等待页面跳转
  await page.waitForURL(/\/(mobile|parent-center|teacher-center)/, { timeout: 10000 });

  return {
    success: true,
    currentUrl: page.url(),
    role
  };
}

export async function AdminLogin(page: Page, role: 'parent' | 'teacher' | 'admin') {
  // 快速登录：直接点击对应的登录按钮
  const selectors = {
    parent: '.parent-btn',
    teacher: '.teacher-btn',
    admin: '.admin-btn, .van-button--primary' // 管理员可能使用不同的选择器
  };

  const selector = selectors[role] || selectors.parent;

  try {
    await page.goto('http://localhost:5173/mobile');
    await page.waitForSelector(selector, { timeout: 5000 });
    await page.click(selector);
    await page.waitForTimeout(2000);
    return { success: true };
  } catch (error) {
    console.log(`登录失败: ${error.message}`);
    return { success: false, error };
  }
}

/**
 * 动态检测页面数据
 * 使用JavaScript在页面上下文中执行检测脚本
 * @param page - Playwright页面对象
 * @returns 页面检测指标
 */
export async function detectPageData(page: Page): Promise<PageDetectionMetrics> {
  return await page.evaluate(() => {
    const metrics: any = {
      summary: {
        url: window.location.href,
        title: document.title,
        loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart
      },
      components: {
        statsCards: {
          count: document.querySelectorAll('.stats-grid .van-grid-item').length,
          texts: Array.from(document.querySelectorAll('.stat-value')).map(v => v?.textContent?.trim())
        },
        contentCards: {
          count: document.querySelectorAll('.content-card').length,
          titles: Array.from(document.querySelectorAll('.card-title')).map(t => t?.textContent?.trim())
        },
        buttons: {
          primary: document.querySelectorAll('.van-button--primary').length,
          disabled: document.querySelectorAll('.van-button--disabled').length
        },
        lists: {
          itemCount: document.querySelectorAll('.list-item').length,
          hasData: document.querySelectorAll('.list-item').length > 0
        }
      },
      errors: {
        has404: document.body.textContent.includes('404') || document.body.textContent.includes('Page Not Found'),
        has500: document.body.textContent.includes('500') || document.body.textContent.includes('服务器错误')
      }
    };
    return metrics;
  });
}

/**
 * 捕获所有API响应
 * @param page - Playwright页面对象
 * @returns API响应数组
 */
export async function captureAPIData(page: Page) {
  const apiResponses = [];

  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/api/')) {
      try {
        const body = await response.json();
        apiResponses.push({
          url,
          status: response.status(),
          hasData: !!body?.data,
          latency: response.request()?.timing()
        });
      } catch (e) {
        // JSON解析失败
      }
    }
  });

  // 等待一点时间让API请求完成
  await page.waitForTimeout(2000);

  return apiResponses;
}

/**
 * 获取页面上所有可点击链接
 * @param page - Playwright页面对象
 * @returns 可点击元素数组
 */
export async function getAllClickableElements(page: Page) {
  return await page.$$eval(
    'a[href], button, .van-tabbar-item, .van-cell',
    (elements) => elements.map(el => {
      const anchor = el as HTMLAnchorElement;
      const button = el as HTMLButtonElement;

      return {
        tag: el.tagName,
        type: (el as HTMLButtonElement).type,
        href: anchor.href,
        text: el.textContent?.trim(),
        className: el.className,
        disabled: (el as HTMLButtonElement).disabled,
        clickable: !el.hasAttribute('disabled') && !el.classList.contains('van-button--disabled')
      };
    })
  );
}

/**
 * 验证API响应数据结构
 * @param response - API响应
 * @param expectedSchema - 期望的数据结构
 * @returns 验证结果
 */
export function validateApiResponse(response: any, expectedSchema?: any) {
  const errors = [];

  // 必需字段验证
  if (!response.success) {
    errors.push('Missing required field: success');
  }

  if (!response.data) {
    errors.push('Missing required field: data');
  }

  // 数据类型验证
  if (response.data && Array.isArray(response.data.items)) {
    // 验证数组项结构
    response.data.items.forEach((item: any, index: number) => {
      if (!item.id) {
        errors.push(`Item ${index} missing required field: id`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 验证DOM渲染数据与API数据一致
 * @param page - Playwright页面对象
 * @param apiData - API响应数据
 * @param selector - DOM元素选择器
 * @returns 验证结果
 */
export async function verifyDataRendering(
  page: Page,
  apiData: any,
  selector: string
) {
  const domElements = await page.$$(selector);
  const domCount = domElements.length;
  const apiCount = apiData.items?.length || 0;

  return {
    consistent: domCount === apiCount,
    domCount,
    apiCount,
    missing: Math.abs(domCount - apiCount),
    message: domCount === apiCount
      ? '数据渲染一致'
      : `数据不一致：DOM有${domCount}个，API有${apiCount}个`
  };
}

/**
 * 记录测试日志
 * @param message - 日志消息
 * @param level - 日志级别
 */
export function log(message: string, level: 'info' | 'error' | 'warning' = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '✅',
    error: '❌',
    warning: '⚠️'
  }[level];

  console.log(`[${timestamp}] ${prefix} ${message}`);
}

/**
 * 生成测试报告
 * @param results - 测试结果数组
 * @returns 格式化的测试报告
 */
export function generateTestReport(results: any[]): string {
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const total = results.length;

  const report = `═══════════════════════════════════════════════════════════
   移动端MCP动态测试报告
═══════════════════════════════════════════════════════════

📊 测试摘要:
   总测试数: ${total}
   ✅ 通过: ${passed} (${((passed / total) * 100).toFixed(1)}%)
   ❌ 失败: ${failed} (${((failed / total) * 100).toFixed(1)}%)

🔍 失败详情:
${results
  .filter(r => !r.success)
  .map((r, i) => `   ${i + 1}. ${r.description}\n      错误: ${r.error}`)
  .join('\n')
}

═══════════════════════════════════════════════════════════
`;

  return report;
}

/**
 * 等待所有页面加载完成
 * @param page - Playwright页面对象
 * @param timeout - 超时时间（毫秒）
 */
export async function waitForPageReady(page: Page, timeout = 10000) {
  await Promise.all([
    page.waitForLoadState('domcontentloaded'),
    page.waitForLoadState('networkidle'),
    page.waitForTimeout(1000)
  ]);
}

/**
 * 设置页面错误监听
 * @param page - Playwright页面对象
 * @returns 错误数组
 */
export function setupErrorListeners(page: Page) {
  const errors: any[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push({
        type: 'console',
        text: msg.text(),
        timestamp: new Date().toISOString()
      });
    }
  });

  page.on('pageerror', error => {
    errors.push({
      type: 'page',
      text: error.message,
      timestamp: new Date().toISOString()
    });
  });

  return errors;
}
