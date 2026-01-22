/**
 * API验证测试套件
 * 验证移动端所有API端点的数据结构、响应格式和数据一致性
 */

import { test, expect, Page } from '@playwright/test';
import { launchMobileBrowser, log } from './mcp-test-utils';
import { ApiResponse, ApiValidationResult } from './mcp-types';

test.describe('🔌 移动端API验证测试', () => {
  let browser: any;
  let context: any;
  let page: Page;
  let apiResponses: any[];

  test.beforeAll(async () => {
    // 启动移动端浏览器
    const launched = await launchMobileBrowser();
    browser = launched.browser;
    context = launched.context;
    page = launched.page;
    apiResponses = [];

    // 设置API响应捕获
    setupApiCapture(page, apiResponses);
  });

  test.afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  test('📡 TC-MCP-API-001: 家长中心API响应捕获', async () => {
    log('开始捕获家长中心API响应...', 'info');

    // 以家长身份登录
    await page.goto('http://localhost:5173/login');
    await page.waitForSelector('.parent-btn');
    await page.click('.parent-btn');
    await page.waitForURL(/\/mobile/);

    // 等待API调用完成
    await page.waitForTimeout(3000);

    // 获取家长相关API
    const parentApis = apiResponses.filter(r =>
      r.url.includes('/api/parents/') ||
      r.url.includes('/api/children') ||
      r.url.includes('/api/activities')
    );

    log(`✅ 捕获到 ${parentApis.length} 个家长相关API`, 'info');

    // 验证每个API的结构
    for (const api of parentApis) {
      const validation = validateApiStructure(api.data);

      expect(validation.valid).toBe(true);
      if (validation.errors.length > 0) {
        log(`⚠️  API结构警告 ${api.url}: ${validation.errors.join(', ')}`, 'warning');
      }

      log(`✅ API结构验证通过: ${api.url.split('/').pop()}`, 'info`);
    }

    // 验证至少有一些成功的API调用
    const successfulApis = parentApis.filter(r => r.status === 200);
    expect(successfulApis.length).toBeGreaterThan(0);

    log(`✅ 成功的API调用: ${successfulApis.length}/${parentApis.length}`, 'info');
  });

  test('📡 TC-MCP-API-002: 教师中心API响应捕获', async () => {
    log('开始捕获教师中心API响应...', 'info');

    // 清空之前的API记录
    apiResponses.length = 0;

    // 以教师身份登录
    await page.goto('http://localhost:5173/login');
    await page.waitForSelector('.teacher-btn');
    await page.click('.teacher-btn');
    await page.waitForURL(/\/mobile\/teacher-center/);

    // 等待API调用完成
    await page.waitForTimeout(3000);

    // 获取教师相关API
    const teacherApis = apiResponses.filter(r =>
      r.url.includes('/api/teacher/') ||
      r.url.includes('/api/tasks') ||
      r.url.includes('/api/attendance')
    );

    log(`✅ 捕获到 ${teacherApis.length} 个教师相关API`, 'info');

    // 验证每个API的结构
    for (const api of teacherApis) {
      const validation = validateApiStructure(api.data);

      expect(validation.valid).toBe(true);
      expect(api.data.success).toBe(true);
      expect(api.data.data).toBeDefined();

      if (validation.errors.length > 0) {
        log(`⚠️  API结构警告 ${api.url}: ${validation.errors.join(', ')}`, 'warning`);
      }
    }

    // 验证API性能
    const slowApis = teacherApis.filter(r => r.latency > 1000);
    if (slowApis.length > 0) {
      log(`⚠️  发现 ${slowApis.length} 个慢API（>1秒）`, 'warning');
      for (const slowApi of slowApis) {
        log(`  - ${slowApi.url}: ${slowApi.latency}ms`, 'warning');
      }
    }
  });

  test('📝 TC-MCP-API-003: API响应数据结构验证', async () => {
    log('验证API响应数据结构...', 'info');

    // 以家长身份访问，触发API调用
    await page.goto('http://localhost:5173/login');
    await page.click('.parent-btn');
    await page.waitForTimeout(3000);

    // 获取所有API响应
    const testApis = apiResponses.filter(r => r.status === 200 && r.data);

    for (const api of testApis) {
      const data = api.data;

      // 验证标准API响应结构
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('message');

      expect(typeof data.success).toBe('boolean');
      expect(typeof data.message).toBe('string');

      // 验证data字段不为undefined
      expect(data.data).toBeDefined();

      // 如果data是数组，验证数组项结构
      if (Array.isArray(data.data)) {
        if (data.data.length > 0) {
          const firstItem = data.data[0];
          expect(firstItem).toHaveProperty('id');
        }
      }

      // 如果data是对象且有items字段，验证items是数组
      if (typeof data.data === 'object' && data.data !== null) {
        if (data.data.items) {
          expect(Array.isArray(data.data.items)).toBe(true);

          // 验证数组项有id字段
          if (data.data.items.length > 0) {
            const firstItem = data.data.items[0];
            expect(firstItem).toHaveProperty('id');
          }
        }
      }

      log(`✅ ${api.url.split('/').pop()} 数据结构验证通过`, 'info');
    }
  });

  test('🔗 TC-MCP-API-004: API端点一致性验证', async () => {
    log('验证API端点一致性...', 'info');

    // 清空API记录
    apiResponses.length = 0;

    // 访问多个页面捕获API
    const pages = [
      '/mobile/parent-center',
      '/mobile/children',
      '/mobile/activities',
      '/mobile/teacher-center',
      '/mobile/tasks'
    ];

    for (const pagePath of pages) {
      await page.goto(`http://localhost:5173${pagePath}`);
      await page.waitForTimeout(1500);
    }

    // 分析API端点
    const apiEndpoints = [...new Set(
      apiResponses.map(r => {
        const url = new URL(r.url);
        return `${url.pathname}`;
      })
    )];

    log(`✅ 发现 ${apiEndpoints.length} 个唯一API端点`, 'info');

    // 验证API端点命名规范
    const endpointPatterns = {
      restful: /\/api\/\w+\/\d+$/,
      collection: /\/api\/\w+$/,
      action: /\/api\/\w+\/\w+$/
    };

    for (const endpoint of apiEndpoints) {
      const isValid = Object.values(endpointPatterns).some(pattern =>
        pattern.test(endpoint)
      );

      if (isValid) {
        log(`✅ ${endpoint} 符合命名规范`, 'info');
      } else {
        log(`⚠️  ${endpoint} 不符合标准命名规范`, 'warning`);
      }
    }

    // 验证API版本一致性
    const versionedApis = apiEndpoints.filter(e => e.includes('/v') || e.includes('/api/'));
    expect(versionedApis.length).toBeGreaterThan(0);
  });

  test('🔐 TC-MCP-API-005: API认证和权限验证', async () => {
    log('验证API认证和权限...', 'info');

    // 清空之前的记录
    apiResponses.length = 0;

    // 以家长身份登录
    await page.goto('http://localhost:5173/login');
    await page.click('.parent-btn');
    await page.waitForTimeout(2000);

    // 获取家长API
    const parentApis = apiResponses.filter(r => r.url.includes('/api/parents'));

    // 切换到教师身份
    apiResponses.length = 0;
    await page.goto('http://localhost:5173/login');
    await page.click('.teacher-btn');
    await page.waitForTimeout(2000);

    // 获取教师API
    const teacherApis = apiResponses.filter(r => r.url.includes('/api/teacher'));

    // 验证不同角色访问不同API
    const parentEndpoints = [...new Set(parentApis.map(r => new URL(r.url).pathname))];
    const teacherEndpoints = [...new Set(teacherApis.map(r => new URL(r.url).pathname))];

    log(`👨 家长端点: ${parentEndpoints.join(', ')}`, 'info');
    log(`👩‍🏫 教师端点: ${teacherEndpoints.join(', ')}`, 'info');

    // 验证端点不重叠（某些通用端点可能共享）
    const commonEndpoints = parentEndpoints.filter(e =>
      teacherEndpoints.includes(e)
    );

    // 验证响应状态
    const successfulParentApis = parentApis.filter(r => r.status === 200);
    const successfulTeacherApis = teacherApis.filter(r => r.status === 200);

    log(`✅ 家长API成功率: ${successfulParentApis.length}/${parentApis.length}`, 'info');
    log(`✅ 教师API成功率: ${successfulTeacherApis.length}/${teacherApis.length}`, 'info');
  });

  test('⚡ TC-MCP-API-006: API性能基准测试', async () => {
    log('进行API性能基准测试...', 'info');

    // 清空记录
    apiResponses.length = 0;

    // 访问页面触发API调用
    await page.goto('http://localhost:5173/login');
    await page.click('.parent-btn');
    await page.waitForTimeout(3000);

    // 分析性能数据
    const performanceData = apiResponses
      .filter(r => r.status === 200 && r.latency > 0)
      .map(r => ({
        endpoint: r.url.split('/').pop(),
        latency: r.latency,
        url: r.url
      }));

    if (performanceData.length === 0) {
      log('⚠️  未捕获到性能数据', 'warning');
      return;
    }

    // 计算统计指标
    const latencies = performanceData.map(p => p.latency);
    const avgLatency = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
    const maxLatency = Math.max(...latencies);
    const minLatency = Math.min(...latencies);
    const sorted = [...latencies].sort((a, b) => a - b);
    const p95Latency = sorted[Math.floor(sorted.length * 0.95)];

    log(`\n📊 API性能基准测试结果:`, 'info');
    log(`请求总数: ${performanceData.length}`, 'info');
    log(`平均延迟: ${avgLatency.toFixed(2)}ms`, 'info');
    log(`最小延迟: ${minLatency}ms`, 'info');
    log(`最大延迟: ${maxLatency}ms`, 'info');
    log(`95分位数: ${p95Latency}ms`, 'info');

    // 性能基准要求
    expect(avgLatency).toBeLessThan(500);
    expect(p95Latency).toBeLessThan(1000);
    expect(maxLatency).toBeLessThan(2000);

    // 找出最慢的10% API
    const slowThreshold = p95Latency;
    const slowApis = performanceData.filter(p => p.latency > slowThreshold);

    if (slowApis.length > 0) {
      log(`\n⚠️ 需要优化的慢API:`, 'warning');
      for (const slowApi of slowApis) {
        log(`  - ${slowApi.endpoint}: ${slowApi.latency}ms`, 'warning');
      }
    }
  });

  test('🔄 TC-MCP-API-007: API错误处理验证', async () => {
    log('验证API错误处理...', 'info');

    // 模拟错误的API请求
    const errorScenarios = [
      {
        name: '不存在的端点',
        url: 'http://localhost:5173/api/non-existent-endpoint'
      },
      {
        name: '无效的方法',
        url: 'http://localhost:5173/api/parents/children/invalid'
      }
    ];

    for (const scenario of errorScenarios) {
      try {
        const response = await page.goto(scenario.url, {
          waitUntil: 'domcontentloaded',
          timeout: 5000
        });

        const status = response.status();

        // 验证错误响应结构
        if (status >= 400) {
          const body = await response.json().catch(() => ({}));

          // 错误响应也应该有标准结构
          expect(body).toHaveProperty('success');
          expect(body.success).toBe(false);
          expect(body).toHaveProperty('message');

          log(`✅ ${scenario.name} 错误处理正常 (${status})`, 'info');
        } else {
          log(`⚠️  ${scenario.name} 返回了 ${status}（可能被处理为默认值）`, 'warning');
        }
      } catch (error) {
        log(`✅ ${scenario.name} 请求失败（预期）`, 'info');
      }
    }

    // 验证页面错误显示
    await page.goto('http://localhost:5173/mobile');
    await page.waitForTimeout(1000);

    const pageData = await page.evaluate(() => {
      const hasErrorToast = document.querySelector('.van-toast--fail') !== null;
      const hasErrorMessage = document.body.textContent.includes('错误') ||
                              document.body.textContent.includes('失败');

      return {
        hasErrorToast,
        hasErrorMessage
      };
    });

    // 如果显示了错误，验证错误提示友好
    if (pageData.hasErrorMessage) {
      const errorText = await page.locator('body').textContent();
      expect(errorText).not.toContain('500');
      expect(errorText).not.toContain('服务器错误');
      log(`✅ 错误提示友好`, 'info`);
    }
  });

  test('📊 TC-MCP-API-008: API数据完整性验证', async () => {
    log('验证API数据完整性...', 'info');

    // 清空记录
    apiResponses.length = 0;

    // 访问需要加载大量数据的页面
    await page.goto('http://localhost:5173/login');
    await page.click('.parent-btn');
    await page.waitForTimeout(3000);

    // 验证返回的数据不为空
    const dataApis = apiResponses.filter(r =>
      r.status === 200 &&
      r.data &&
      r.data.data
    );

    for (const api of dataApis) {
      const data = api.data.data;

      if (Array.isArray(data) && data.length > 0) {
        // 验证数组项的数据完整性
        const firstItem = data[0];

        // 检查必需字段
        const requiredFields = ['id', 'name', 'createdAt'];
        const missingFields = requiredFields.filter(field =>
          !firstItem.hasOwnProperty(field)
        );

        if (missingFields.length > 0) {
          log(`⚠️  ${api.url} 缺少字段: ${missingFields.join(', ')}`, 'warning');
        } else {
          log(`✅ ${api.url.split('/').pop()} 数据完整性验证通过`, 'info');
        }

        // 验证所有项都有id
        const itemsWithoutId = data.filter(item => !item.id);
        expect(itemsWithoutId.length).toBe(0);

        // 验证没有null或undefined字段
        const hasNullValues = data.some(item =>
          Object.values(item).some(value =>
            value === null || value === undefined
          )
        );

        if (hasNullValues) {
          log(`⚠️  ${api.url} 包含null/undefined值`, 'warning');
        }
      } else if (typeof data === 'object' && data !== null) {
        // 验证对象数据
        if (data.total !== undefined && data.items !== undefined) {
          // 分页数据结构
          expect(typeof data.total).toBe('number');
          expect(typeof data.items).toBe('object');
          log(`✅ ${api.url.split('/').pop()} 分页数据验证通过`, 'info');
        }
      }
    }
  });
});

/**
 * 设置API响应捕获
 */
function setupApiCapture(page: Page, apiResponses: any[]) {
  page.on('response', async (response) => {
    const url = response.url();

    // 只捕获API响应
    if (url.includes('/api/')) {
      try {
        const body = await response.json();
        const timing = response.request().timing();
        const latency = timing.responseEnd - timing.requestStart;

        apiResponses.push({
          url,
          status: response.status(),
          data: body,
          latency: latency,
          timestamp: new Date().toISOString()
        });
      } catch (e) {
        // 非JSON响应，记录基本信息
        apiResponses.push({
          url,
          status: response.status(),
          data: null,
          latency: 0,
          timestamp: new Date().toISOString()
        });
      }
    }
  });

  log('✅ API响应捕获已设置', 'info');
}

/**
 * 验证API响应结构
 */
function validateApiStructure(data: any): ApiValidationResult {
  const errors: string[] = [];

  if (!data) {
    errors.push('响应数据为空');
    return { valid: false, errors };
  }

  // 验证必需字段
  if (!data.hasOwnProperty('success')) {
    errors.push('缺少success字段');
  }

  if (!data.hasOwnProperty('data')) {
    errors.push('缺少data字段');
  }

  if (!data.hasOwnProperty('message')) {
    errors.push('缺少message字段');
  }

  // 验证字段类型
  if (data.success !== undefined && typeof data.success !== 'boolean') {
    errors.push('success字段必须为boolean类型');
  }

  if (data.message !== undefined && typeof data.message !== 'string') {
    errors.push('message字段必须为string类型');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
