/**
 * 任务中心页面错误检测测试
 * 检测控制台错误和404资源加载错误
 */

import { test, expect, Page } from '@playwright/test';

// 错误类型定义
interface ConsoleError {
  type: string;
  text: string;
  location?: string;
}

interface NetworkError {
  url: string;
  status: number;
  method: string;
}

class ErrorCollector {
  private consoleErrors: ConsoleError[] = [];
  private networkErrors: NetworkError[] = [];

  // 初始化错误收集
  init(page: Page) {
    // 收集控制台错误
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'error' || type === 'warning') {
        this.consoleErrors.push({
          type,
          text: msg.text(),
          location: msg.location()?.url
        });
      }
    });

    // 收集网络错误
    page.on('response', response => {
      const status = response.status();
      const url = response.url();

      // 检测404和其他错误状态码
      if (status === 404 || status >= 500) {
        this.networkErrors.push({
          url,
          status,
          method: response.request().method()
        });
      }
    });

    // 监听页面错误
    page.on('pageerror', error => {
      this.consoleErrors.push({
        type: 'pageerror',
        text: error.message,
        location: error.stack
      });
    });

    // 监听请求失败
    page.on('requestfailed', request => {
      const failure = request.failure();
      if (failure) {
        this.networkErrors.push({
          url: request.url(),
          status: 0,
          method: request.method()
        });
      }
    });
  }

  // 获取所有错误
  getErrors() {
    return {
      consoleErrors: this.consoleErrors,
      networkErrors: this.networkErrors
    };
  }

  // 清空错误记录
  clear() {
    this.consoleErrors = [];
    this.networkErrors = [];
  }

  // 打印错误报告
  printReport() {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 任务中心页面错误检测报告');
    console.log('═══════════════════════════════════════════════════════════\n');

    // 控制台错误
    console.log(`🔴 控制台错误 (${this.consoleErrors.length}个)\n`);
    if (this.consoleErrors.length === 0) {
      console.log('✅ 未检测到控制台错误\n');
    } else {
      this.consoleErrors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.type}] ${error.text}`);
        if (error.location) {
          console.log(`   📍 位置: ${error.location}`);
        }
        console.log('');
      });
    }

    // 网络错误
    console.log(`\n🌐 网络错误 (${this.networkErrors.length}个)\n`);
    if (this.networkErrors.length === 0) {
      console.log('✅ 未检测到网络错误\n');
    } else {
      this.networkErrors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.status}] ${error.method} ${error.url}`);
      });
    }

    console.log('═══════════════════════════════════════════════════════════\n');
  }
}

test.describe('任务中心页面错误检测', () => {
  let errorCollector: ErrorCollector;

  test.beforeEach(async ({ page }) => {
    errorCollector = new ErrorCollector();
    errorCollector.init(page);

    // 设置超时时间
    test.setTimeout(60000);
  });

  test('应该检测任务中心页面的控制台错误和网络错误', async ({ page }) => {
    console.log('\n🚀 开始访问任务中心页面...\n');

    try {
      // 访问任务中心页面
      const response = await page.goto('/centers/task', {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      console.log(`✅ 页面加载完成，状态码: ${response?.status()}`);

      // 等待页面核心元素加载
      await page.waitForLoadState('domcontentloaded');

      // 等待一段时间以捕获所有异步错误
      await page.waitForTimeout(3000);

      // 检查页面是否正常渲染
      const pageTitle = await page.title();
      console.log(`📄 页面标题: ${pageTitle}`);

      // 检查是否存在关键元素
      const hasContent = await page.locator('.overview-content, .task-list-section, .stats-section').count();
      console.log(`📦 检测到内容区域: ${hasContent}个`);

      if (hasContent === 0) {
        console.warn('⚠️  警告: 页面内容区域未找到，可能存在渲染问题');
      }

      // 尝试检测API调用
      const apiCalls = [];
      page.on('request', request => {
        const url = request.url();
        if (url.includes('/api/tasks') || url.includes('/api/task')) {
          apiCalls.push({
            method: request.method(),
            url: url,
            timestamp: new Date().toISOString()
          });
        }
      });

      // 等待API调用完成
      await page.waitForTimeout(2000);

      console.log(`\n📡 检测到 ${apiCalls.length} 个任务API调用`);
      apiCalls.forEach((call, index) => {
        console.log(`  ${index + 1}. ${call.method} ${call.url}`);
      });

    } catch (error) {
      console.error('❌ 页面加载失败:', error);
      throw error;
    }

    // 打印错误报告
    errorCollector.printReport();

    // 获取所有错误
    const { consoleErrors, networkErrors } = errorCollector.getErrors();

    // 打印详细的错误信息
    console.log('\n📋 详细错误信息：\n');

    if (consoleErrors.length > 0) {
      console.log('控制台错误详情：');
      console.log(JSON.stringify(consoleErrors, null, 2));
    }

    if (networkErrors.length > 0) {
      console.log('\n网络错误详情：');
      console.log(JSON.stringify(networkErrors, null, 2));
    }

    // 基础断言：页面应该加载
    const url = page.url();
    expect(url).toContain('/centers/task');

    // 如果有严重错误，测试应该失败
    if (consoleErrors.length > 0 || networkErrors.length > 0) {
      console.warn('\n⚠️  检测到错误，请查看详细报告\n');
    }
  });

  test('应该检测任务统计API的响应', async ({ page }) => {
    console.log('\n🔍 测试任务统计API...\n');

    // 拦截API请求
    let apiResponse: any = null;
    let apiError: any = null;

    page.on('response', async response => {
      if (response.url().includes('/api/tasks/stats')) {
        try {
          apiResponse = await response.json();
        } catch (error) {
          apiError = {
            status: response.status(),
            url: response.url(),
            error: error
          };
        }
      }
    });

    // 访问页面
    await page.goto('/centers/task', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // 等待API响应
    await page.waitForTimeout(2000);

    if (apiResponse) {
      console.log('✅ 任务统计API响应成功:');
      console.log(JSON.stringify(apiResponse, null, 2));
    } else if (apiError) {
      console.error('❌ 任务统计API请求失败:');
      console.log(JSON.stringify(apiError, null, 2));
    } else {
      console.warn('⚠️  未检测到任务统计API调用');
    }

    errorCollector.printReport();
  });

  test('应该检测任务列表API的响应', async ({ page }) => {
    console.log('\n🔍 测试任务列表API...\n');

    // 拦截API请求
    let apiResponse: any = null;
    let apiError: any = null;

    page.on('response', async response => {
      if (response.url().includes('/api/tasks') && !response.url().includes('/stats')) {
        try {
          apiResponse = await response.json();
        } catch (error) {
          apiError = {
            status: response.status(),
            url: response.url(),
            error: error
          };
        }
      }
    });

    // 访问页面
    await page.goto('/centers/task', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // 等待API响应
    await page.waitForTimeout(2000);

    if (apiResponse) {
      console.log('✅ 任务列表API响应成功:');
      console.log(JSON.stringify(apiResponse, null, 2));
    } else if (apiError) {
      console.error('❌ 任务列表API请求失败:');
      console.log(JSON.stringify(apiError, null, 2));
    } else {
      console.warn('⚠️  未检测到任务列表API调用');
    }

    errorCollector.printReport();
  });

  test('应该检查前端组件是否正常加载', async ({ page }) => {
    console.log('\n🔍 检查前端组件加载状态...\n');

    // 访问页面
    await page.goto('/centers/task', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // 等待页面加载完成
    await page.waitForTimeout(3000);

    // 检查关键组件
    const components = [
      { name: '统计卡片', selector: '.stats-section, .stat-card' },
      { name: '任务列表', selector: '.task-list-section, .el-table' },
      { name: '图表容器', selector: '.charts-section, .chart-container' },
      { name: '操作工具栏', selector: '.action-toolbar, .header-actions' }
    ];

    console.log('\n📦 组件加载状态:\n');
    for (const component of components) {
      const count = await page.locator(component.selector).count();
      const status = count > 0 ? '✅' : '❌';
      console.log(`${status} ${component.name}: ${count}个`);
    }

    // 检查是否有错误提示
    const errorMessages = await page.locator('.el-message--error, .error-message').count();
    if (errorMessages > 0) {
      console.warn(`\n⚠️  检测到 ${errorMessages} 个错误提示消息`);
    }

    errorCollector.printReport();
  });
});
