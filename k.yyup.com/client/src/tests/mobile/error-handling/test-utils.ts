/**
 * 移动端错误处理测试工具函数
 * 提供严格的验证规则和测试辅助功能
 */

import { expect, vi } from 'vitest';

/**
 * 严格验证工具类
 */
export class StrictValidator {
  /**
   * 验证必填字段
   */
  static validateRequiredFields<T>(
    data: any,
    requiredFields: (keyof T)[]
  ): { valid: boolean; missing: string[] } {
    if (!data || typeof data !== 'object') {
      return { valid: false, missing: requiredFields.map(String) };
    }

    const missing: string[] = [];
    
    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        missing.push(String(field));
      }
    }

    return {
      valid: missing.length === 0,
      missing
    };
  }

  /**
   * 验证字段类型
   */
  static validateFieldTypes<T>(
    data: any,
    fieldTypes: Partial<Record<keyof T, string>>
  ): { valid: boolean; errors: string[] } {
    if (!data || typeof data !== 'object') {
      return { valid: false, errors: ['Data is not an object'] };
    }

    const errors: string[] = [];
    
    for (const [field, expectedType] of Object.entries(fieldTypes)) {
      const value = data[field];
      
      if (value === undefined || value === null) {
        continue; // Skip null/undefined values - let required field validation handle these
      }

      let actualType = typeof value;
      
      // 特殊类型处理
      if (expectedType === 'array') {
        actualType = Array.isArray(value) ? 'array' : typeof value;
      } else if (expectedType === 'date') {
        actualType = value instanceof Date ? 'date' : typeof value;
      }

      if (actualType !== expectedType) {
        errors.push(`Field '${field}' expected type '${expectedType}' but got '${actualType}'`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 验证枚举值
   */
  static validateEnumValue<T extends Record<string, string | number>>(
    value: any,
    enumObject: T
  ): boolean {
    return Object.values(enumObject).includes(value);
  }

  /**
   * 验证日期格式
   */
  static validateDateFormat(dateString: string): boolean {
    if (!dateString) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * 验证数值范围
   */
  static validateNumberRange(
    value: number,
    min?: number,
    max?: number
  ): { valid: boolean; error?: string } {
    if (typeof value !== 'number' || isNaN(value)) {
      return { valid: false, error: 'Value is not a valid number' };
    }

    if (min !== undefined && value < min) {
      return { valid: false, error: `Value ${value} is less than minimum ${min}` };
    }

    if (max !== undefined && value > max) {
      return { valid: false, error: `Value ${value} is greater than maximum ${max}` };
    }

    return { valid: true };
  }
}

/**
 * 控制台错误监控工具
 */
export class ConsoleErrorMonitor {
  private consoleErrors: string[] = [];
  private originalConsole: Partial<Console> = {};

  constructor() {
    this.setupErrorCapture();
  }

  /**
   * 设置错误捕获
   */
  private setupErrorCapture(): void {
    // 保存原始方法
    this.originalConsole.error = console.error;
    this.originalConsole.warn = console.warn;

    // 重写方法以捕获错误
    console.error = (...args: any[]) => {
      this.consoleErrors.push(`ERROR: ${args.join(' ')}`);
      this.originalConsole.error?.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      this.consoleErrors.push(`WARN: ${args.join(' ')}`);
      this.originalConsole.warn?.apply(console, args);
    };
  }

  /**
   * 获取捕获的错误
   */
  getErrors(): string[] {
    return [...this.consoleErrors];
  }

  /**
   * 清除错误记录
   */
  clearErrors(): void {
    this.consoleErrors = [];
  }

  /**
   * 期望没有控制台错误
   */
  expectNoConsoleErrors(): void {
    if (this.consoleErrors.length > 0) {
      const errorDetails = this.consoleErrors.join('\n');
      expect(this.consoleErrors.length).toBe(0, 
        `Expected no console errors, but got:\n${errorDetails}`
      );
    }
  }

  /**
   * 恢复原始控制台
   */
  restore(): void {
    if (this.originalConsole.error) {
      console.error = this.originalConsole.error;
    }
    if (this.originalConsole.warn) {
      console.warn = this.originalConsole.warn;
    }
  }
}

/**
 * 网络错误模拟工具
 */
export class NetworkErrorSimulator {
  private originalFetch: typeof globalThis.fetch;
  private errorScenarios: Map<string, () => Promise<Response>> = new Map();

  constructor() {
    this.originalFetch = globalThis.fetch;
    this.setupFetchMock();
  }

  /**
   * 设置fetch模拟
   */
  private setupFetchMock(): void {
    globalThis.fetch = vi.fn().mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      
      // 检查是否有匹配的错误场景
      for (const [pattern, errorScenario] of this.errorScenarios) {
        if (url.includes(pattern)) {
          return errorScenario();
        }
      }

      // 默认成功响应
      return new Response(JSON.stringify({ success: true, data: {} }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    });
  }

  /**
   * 添加错误场景
   */
  addErrorScenario(pattern: string, response: () => Promise<Response>): void {
    this.errorScenarios.set(pattern, response);
  }

  /**
   * 移除错误场景
   */
  removeErrorScenario(pattern: string): void {
    this.errorScenarios.delete(pattern);
  }

  /**
   * 恢复原始fetch
   */
  restore(): void {
    globalThis.fetch = this.originalFetch;
  }
}

/**
 * 移动端特定测试工具
 */
export class MobileTestUtils {
  /**
   * 模拟触摸事件
   */
  static simulateTouchEvent(
    element: HTMLElement,
    eventType: string,
    options: TouchEventInit = {}
  ): void {
    const touch = new Touch({
      identifier: Date.now(),
      target: element,
      clientX: options.clientX || 0,
      clientY: options.clientY || 0,
      ...options
    });

    const touchEvent = new TouchEvent(eventType, {
      touches: [touch],
      changedTouches: [touch],
      ...options
    });

    element.dispatchEvent(touchEvent);
  }

  /**
   * 模拟设备方向变化
   */
  static simulateOrientationChange(orientation: 'portrait' | 'landscape'): void {
    Object.defineProperty(window.screen, 'orientation', {
      value: {
        angle: orientation === 'portrait' ? 0 : 90,
        type: `${orientation}-primary`
      },
      writable: true
    });

    window.dispatchEvent(new Event('orientationchange'));
  }

  /**
   * 模拟网络状态变化
   */
  static simulateNetworkChange(
    connectionType: 'wifi' | 'cellular' | 'none',
    effectiveType?: 'slow-2g' | '2g' | '3g' | '4g'
  ): void {
    const mockConnection = {
      effectiveType: effectiveType || '4g',
      type: connectionType,
      downlink: 10,
      rtt: 100
    };

    Object.defineProperty(navigator, 'connection', {
      value: mockConnection,
      writable: true
    });

    window.dispatchEvent(new Event('online'));
    if (connectionType === 'none') {
      window.dispatchEvent(new Event('offline'));
    }
  }

  /**
   * 模拟地理位置
   */
  static simulateGeolocation(
    latitude: number,
    longitude: number,
    accuracy: number = 10
  ): void {
    const mockPosition = {
      coords: {
        latitude,
        longitude,
        accuracy,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null
      },
      timestamp: Date.now()
    };

    Object.defineProperty(navigator.geolocation, 'getCurrentPosition', {
      value: (success: PositionCallback) => success(mockPosition),
      writable: true
    });
  }
}

/**
 * 性能监控工具
 */
export class PerformanceMonitor {
  private startTime: number = 0;
  private measurements: Map<string, number> = new Map();

  /**
   * 开始性能测量
   */
  start(): void {
    this.startTime = performance.now();
  }

  /**
   * 结束测量并返回耗时
   */
  end(label: string): number {
    const duration = performance.now() - this.startTime;
    this.measurements.set(label, duration);
    return duration;
  }

  /**
   * 获取测量结果
   */
  getMeasurements(): Record<string, number> {
    return Object.fromEntries(this.measurements);
  }

  /**
   * 验证性能指标
   */
  expectPerformanceUnder(label: string, maxMs: number): void {
    const duration = this.measurements.get(label);
    if (duration === undefined) {
      throw new Error(`No measurement found for label: ${label}`);
    }

    expect(duration).toBeLessThan(maxMs, 
      `Performance for '${label}' exceeded ${maxMs}ms (actual: ${duration}ms)`
    );
  }

  /**
   * 清除测量记录
   */
  clear(): void {
    this.measurements.clear();
  }
}

/**
 * 测试数据生成器
 */
export class TestDataGenerator {
  /**
   * 生成测试用户数据
   */
  static generateTestUser(overrides: Partial<any> = {}): any {
    return {
      id: `user_${Date.now()}`,
      username: `testuser_${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      phone: `1380013${String(Date.now()).slice(-4)}`,
      name: '测试用户',
      role: 'parent',
      active: true,
      createdAt: new Date().toISOString(),
      ...overrides
    };
  }

  /**
   * 生成测试API响应
   */
  static generateApiResponse<T>(
    data: T,
    overrides: Partial<{ success: boolean; message: string }> = {}
  ): any {
    return {
      success: true,
      data,
      message: 'Success',
      timestamp: new Date().toISOString(),
      ...overrides
    };
  }

  /**
   * 生成错误响应
   */
  static generateErrorResponse(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    status: number = 500
  ): any {
    return {
      success: false,
      error: {
        code,
        message,
        timestamp: new Date().toISOString()
      },
      status
    };
  }

  /**
   * 生成分页数据
   */
  static generatePaginatedData<T>(
    items: T[],
    page: number = 1,
    pageSize: number = 10,
    total?: number
  ): any {
    const actualTotal = total ?? items.length;
    const totalPages = Math.ceil(actualTotal / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = items.slice(startIndex, endIndex);

    return {
      items: paginatedItems,
      pagination: {
        page,
        pageSize,
        total: actualTotal,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }
}

/**
 * 断言助手
 */
export class AssertionHelpers {
  /**
   * 断言API响应结构
   */
  static assertApiResponseStructure(response: any): void {
    expect(response).toBeDefined();
    expect(typeof response).toBe('object');
    expect(response).toHaveProperty('success');
    expect(typeof response.success).toBe('boolean');
    
    if (response.success) {
      expect(response).toHaveProperty('data');
    } else {
      expect(response).toHaveProperty('error');
      expect(response.error).toHaveProperty('message');
    }
  }

  /**
   * 断言分页响应结构
   */
  static assertPaginatedResponseStructure(response: any): void {
    this.assertApiResponseStructure(response);
    
    if (response.success) {
      expect(response.data).toHaveProperty('items');
      expect(Array.isArray(response.data.items)).toBe(true);
      expect(response.data).toHaveProperty('pagination');
      expect(response.data.pagination).toHaveProperty('page');
      expect(response.data.pagination).toHaveProperty('pageSize');
      expect(response.data.pagination).toHaveProperty('total');
    }
  }

  /**
   * 断言元素存在且可见
   */
  static assertElementVisible(element: HTMLElement | null): void {
    expect(element).not.toBeNull();
    expect(element!.style.display).not.toBe('none');
    expect(element!.offsetHeight).toBeGreaterThan(0);
    expect(element!.offsetWidth).toBeGreaterThan(0);
  }

  /**
   * 断言元素包含文本
   */
  static assertElementContainsText(element: HTMLElement | null, text: string): void {
    this.assertElementVisible(element);
    expect(element!.textContent).toContain(text);
  }
}

/**
 * 测试环境清理工具
 */
export class TestCleanup {
  private cleanupTasks: (() => void)[] = [];

  /**
   * 添加清理任务
   */
  addCleanup(task: () => void): void {
    this.cleanupTasks.push(task);
  }

  /**
   * 执行所有清理任务
   */
  cleanup(): void {
    for (const task of this.cleanupTasks) {
      try {
        task();
      } catch (error) {
        console.error('Cleanup task failed:', error);
      }
    }
    this.cleanupTasks = [];
  }

  /**
   * 创建自动清理的测试环境
   */
  static create(): TestCleanup {
    const cleanup = new TestCleanup();
    
    // 在测试结束后自动清理
    afterEach(() => {
      cleanup.cleanup();
    });

    return cleanup;
  }
}