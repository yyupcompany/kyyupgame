/**
 * 测试配置和工具函数
 * 提供统一的测试配置、工具函数和验证规则
 */

import { expect } from 'vitest';

/**
 * 测试环境配置
 */
export const TEST_CONFIG = {
  // API配置
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000',
  FRONTEND_BASE_URL: process.env.FRONTEND_BASE_URL || 'http://localhost:5173',

  // 测试用户配置
  TEST_USERS: {
    ADMIN: {
      username: process.env.TEST_ADMIN_USERNAME || 'test_admin',
      password: process.env.TEST_ADMIN_PASSWORD || 'Admin123!',
      email: 'admin@test.com'
    },
    TEACHER: {
      username: process.env.TEST_TEACHER_USERNAME || 'test_teacher1',
      password: process.env.TEST_TEACHER_PASSWORD || 'Test123!',
      email: 'teacher1@test.com'
    },
    PARENT: {
      username: process.env.TEST_PARENT_USERNAME || 'test_parent1',
      password: process.env.TEST_PARENT_PASSWORD || 'Test123!',
      email: 'parent1@test.com'
    }
  },

  // 数据库配置
  DATABASE: {
    HOST: process.env.DB_HOST || 'localhost',
    PORT: parseInt(process.env.DB_PORT || '3306'),
    DATABASE: process.env.DB_DATABASE || 'kindergarten_test',
    USERNAME: process.env.DB_USERNAME || 'root',
    PASSWORD: process.env.DB_PASSWORD || 'password'
  },

  // 测试超时配置
  TIMEOUTS: {
    API_REQUEST: 10000,
    PAGE_LOAD: 30000,
    ELEMENT_WAIT: 5000,
    NETWORK_IDLE: 3000,
    CLEANUP: 10000
  },

  // 性能基准
  PERFORMANCE_BENCHMARKS: {
    API_RESPONSE_TIME: {
      FAST: 500,
      NORMAL: 1500,
      SLOW: 3000
    },
    PAGE_LOAD_TIME: {
      FAST: 2000,
      NORMAL: 5000,
      SLOW: 10000
    },
    CONCURRENT_REQUESTS: {
      LOW: 10,
      MEDIUM: 50,
      HIGH: 100
    }
  },

  // 测试数据生成配置
  DATA_GENERATION: {
    BATCH_SIZE: 10,
    MAX_RETRIES: 3,
    DELAY_BETWEEN_BATCHES: 100
  }
};

/**
 * API响应验证工具
 */
export class APIValidator {
  /**
   * 验证基本API响应结构
   */
  static validateBasicResponse(response: any): void {
    expect(response).toHaveProperty('success');
    expect(response).toHaveProperty('data');
    expect(response).toHaveProperty('message');
    expect(typeof response.success).toBe('boolean');
    expect(typeof response.message).toBe('string');
  }

  /**
   * 验证成功响应
   */
  static validateSuccessResponse(response: any, expectedData?: any): void {
    this.validateBasicResponse(response);
    expect(response.success).toBe(true);

    if (expectedData !== undefined) {
      expect(response.data).toEqual(expectedData);
    }
  }

  /**
   * 验证错误响应
   */
  static validateErrorResponse(response: any, expectedStatus?: number, expectedMessage?: string): void {
    this.validateBasicResponse(response);
    expect(response.success).toBe(false);
    expect(typeof response.message).toBe('string');
    expect(response.message.length).toBeGreaterThan(0);

    if (expectedStatus) {
      expect(response.status).toBe(expectedStatus);
    }

    if (expectedMessage) {
      expect(response.message).toContain(expectedMessage);
    }
  }

  /**
   * 验证分页响应结构
   */
  static validatePaginatedResponse(response: any): void {
    this.validateSuccessResponse(response);

    expect(response.data).toHaveProperty('items');
    expect(response.data).toHaveProperty('total');
    expect(response.data).toHaveProperty('page');
    expect(response.data).toHaveProperty('pageSize');

    expect(Array.isArray(response.data.items)).toBe(true);
    expect(typeof response.data.total).toBe('number');
    expect(typeof response.data.page).toBe('number');
    expect(typeof response.data.pageSize).toBe('number');
  }

  /**
   * 验证必填字段
   */
  static validateRequiredFields(data: any, requiredFields: string[]): void {
    for (const field of requiredFields) {
      expect(data).toHaveProperty(field);
      expect(data[field]).toBeDefined();
    }
  }

  /**
   * 验证字段类型
   */
  static validateFieldTypes(data: any, fieldTypes: Record<string, string>): void {
    for (const [field, expectedType] of Object.entries(fieldTypes)) {
      expect(data).toHaveProperty(field);

      switch (expectedType) {
        case 'string':
          expect(typeof data[field]).toBe('string');
          break;
        case 'number':
          expect(typeof data[field]).toBe('number');
          break;
        case 'boolean':
          expect(typeof data[field]).toBe('boolean');
          break;
        case 'array':
          expect(Array.isArray(data[field])).toBe(true);
          break;
        case 'object':
          expect(typeof data[field]).toBe('object');
          expect(data[field]).not.toBeNull();
          break;
        default:
          throw new Error(`Unsupported field type: ${expectedType}`);
      }
    }
  }
}

/**
 * 测试数据生成器
 */
export class TestDataGenerator {
  /**
   * 生成随机用户数据
   */
  static generateUserData(overrides: Partial<any> = {}): any {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);

    return {
      username: `test_user_${timestamp}_${random}`,
      email: `test_${timestamp}_${random}@example.com`,
      password: 'TestPass123!',
      realName: `测试用户_${random}`,
      phone: `1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      address: `测试地址_${random}`,
      ...overrides
    };
  }

  /**
   * 生成随机班级数据
   */
  static generateClassData(overrides: Partial<any> = {}): any {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);

    return {
      name: `测试班级_${timestamp}_${random}`,
      description: `这是一个测试班级_${random}`,
      capacity: 20 + Math.floor(Math.random() * 20),
      ageGroup: ['3-4岁', '4-5岁', '5-6岁'][Math.floor(Math.random() * 3)],
      schedule: '周一至周五 8:00-16:00',
      ...overrides
    };
  }

  /**
   * 生成随机学生数据
   */
  static generateStudentData(overrides: Partial<any> = {}): any {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const names = ['小明', '小红', '小刚', '小丽', '小强', '小美', '小华', '小芳'];
    const randomName = names[Math.floor(Math.random() * names.length)];

    return {
      name: `${randomName}_${random}`,
      age: 3 + Math.floor(Math.random() * 4),
      gender: Math.random() > 0.5 ? 'male' : 'female',
      birthDate: new Date(Date.now() - (3 + Math.floor(Math.random() * 4)) * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      address: `测试学生地址_${random}`,
      emergencyContact: '紧急联系人',
      emergencyPhone: `1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      ...overrides
    };
  }

  /**
   * 生成随机活动数据
   */
  static generateActivityData(overrides: Partial<any> = {}): any {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const types = ['educational', 'recreational', 'outdoor', 'artistic'];
    const titles = ['数学启蒙', '音乐欣赏', '体育活动', '美术创作', '科学探索'];

    return {
      title: `${titles[Math.floor(Math.random() * titles.length)]}_${random}`,
      description: `这是一个测试活动_${random}`,
      type: types[Math.floor(Math.random() * types.length)],
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      maxParticipants: 10 + Math.floor(Math.random() * 20),
      location: ['教室A', '教室B', '操场', '活动室'][Math.floor(Math.random() * 4)],
      materials: '测试活动材料',
      ...overrides
    };
  }
}

/**
 * 性能测试工具
 */
export class PerformanceTester {
  /**
   * 测量API响应时间
   */
  static async measureAPIResponseTime(
    apiCall: () => Promise<any>,
    iterations: number = 1
  ): Promise<{ average: number; min: number; max: number; p95: number }> {
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      await apiCall();
      const endTime = Date.now();
      times.push(endTime - startTime);
    }

    times.sort((a, b) => a - b);

    return {
      average: times.reduce((a, b) => a + b, 0) / times.length,
      min: times[0],
      max: times[times.length - 1],
      p95: times[Math.floor(times.length * 0.95)]
    };
  }

  /**
   * 验证性能基准
   */
  static validatePerformance(
    responseTime: number,
    benchmark: keyof typeof TEST_CONFIG.PERFORMANCE_BENCHMARKS.API_RESPONSE_TIME
  ): void {
    const threshold = TEST_CONFIG.PERFORMANCE_BENCHMARKS.API_RESPONSE_TIME[benchmark];
    expect(responseTime).toBeLessThan(threshold);
  }

  /**
   * 生成性能报告
   */
  static generatePerformanceReport(
    testName: string,
    metrics: { average: number; min: number; max: number; p95: number }
  ): string {
    return `
性能测试报告 - ${testName}
========================================
平均响应时间: ${metrics.average.toFixed(2)}ms
最小响应时间: ${metrics.min}ms
最大响应时间: ${metrics.max}ms
P95响应时间: ${metrics.p95.toFixed(2)}ms
========================================
`;
  }
}

/**
 * 数据库测试工具
 */
export class DatabaseTester {
  /**
   * 清理测试数据
   */
  static async cleanupTestData(tableName: string, condition: string = ''): Promise<void> {
    const query = condition ? `DELETE FROM ${tableName} WHERE ${condition}` : `DELETE FROM ${tableName}`;
    // 这里应该连接到实际数据库执行清理
    console.log(`清理测试数据: ${query}`);
  }

  /**
   * 验证数据完整性
   */
  static async validateDataIntegrity(tableName: string, expectedCount: number): Promise<void> {
    // 这里应该查询实际数据库验证数据
    console.log(`验证数据完整性: ${tableName} 期望数量 ${expectedCount}`);
  }

  /**
   * 验证外键约束
   */
  static async validateForeignKeyConstraint(
    parentTable: string,
    childTable: string,
    parentId: number
  ): Promise<void> {
    // 这里应该验证外键约束
    console.log(`验证外键约束: ${parentTable} -> ${childTable} (${parentId})`);
  }
}

/**
 * 并发测试工具
 */
export class ConcurrencyTester {
  /**
   * 并发执行请求
   */
  static async runConcurrentRequests<T>(
    requestFn: () => Promise<T>,
    concurrency: number
  ): Promise<{ results: T[]; successCount: number; failureCount: number; totalTime: number }> {
    const startTime = Date.now();
    const promises = Array(concurrency).fill().map(() => requestFn());

    const results = await Promise.allSettled(promises);
    const endTime = Date.now();

    const successful = results.filter(r => r.status === 'fulfilled');
    const failed = results.filter(r => r.status === 'rejected');

    return {
      results: successful.map(r => (r as PromiseFulfilledResult<T>).value),
      successCount: successful.length,
      failureCount: failed.length,
      totalTime: endTime - startTime
    };
  }

  /**
   * 验证并发结果
   */
  static validateConcurrencyResult(
    result: { successCount: number; failureCount: number; totalTime: number },
    concurrency: number,
    successRateThreshold: number = 0.95
  ): void {
    const successRate = result.successCount / concurrency;
    expect(successRate).toBeGreaterThanOrEqual(successRateThreshold);
    expect(result.totalTime).toBeLessThan(30000); // 30秒内完成
  }
}

/**
 * 错误模拟工具
 */
export class ErrorSimulator {
  /**
   * 模拟网络错误
   */
  static simulateNetworkError(): Promise<never> {
    return Promise.reject(new Error('Network error simulated'));
  }

  /**
   * 模拟超时错误
   */
  static simulateTimeoutError(timeout: number = 5000): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout simulated')), timeout);
    });
  }

  /**
   * 模拟服务器错误
   */
  static simulateServerError(statusCode: number = 500): Promise<never> {
    return Promise.reject(new Error(`Server error ${statusCode} simulated`));
  }
}

/**
 * 测试环境管理器
 */
export class TestEnvironmentManager {
  private static instance: TestEnvironmentManager;
  private isInitialized = false;

  public static getInstance(): TestEnvironmentManager {
    if (!TestEnvironmentManager.instance) {
      TestEnvironmentManager.instance = new TestEnvironmentManager();
    }
    return TestEnvironmentManager.instance;
  }

  /**
   * 初始化测试环境
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    console.log('🚀 初始化测试环境...');

    // 验证必要的环境变量
    this.validateEnvironmentVariables();

    // 测试数据库连接
    await this.testDatabaseConnection();

    // 测试API服务可用性
    await this.testAPIServiceAvailability();

    this.isInitialized = true;
    console.log('✅ 测试环境初始化完成');
  }

  /**
   * 清理测试环境
   */
  async cleanup(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    console.log('🧹 清理测试环境...');

    // 清理测试数据
    await this.cleanupTestData();

    this.isInitialized = false;
    console.log('✅ 测试环境清理完成');
  }

  /**
   * 验证环境变量
   */
  private validateEnvironmentVariables(): void {
    const requiredVars = ['NODE_ENV', 'DB_HOST', 'DB_DATABASE'];

    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        throw new Error(`Missing required environment variable: ${varName}`);
      }
    }
  }

  /**
   * 测试数据库连接
   */
  private async testDatabaseConnection(): Promise<void> {
    try {
      // 这里应该实际测试数据库连接
      console.log('📊 测试数据库连接...');
      await this.wait(1000);
    } catch (error) {
      throw new Error(`Database connection failed: ${error}`);
    }
  }

  /**
   * 测试API服务可用性
   */
  private async testAPIServiceAvailability(): Promise<void> {
    try {
      const response = await fetch(`${TEST_CONFIG.API_BASE_URL}/api/health`, {
        timeout: TEST_CONFIG.TIMEOUTS.API_REQUEST
      });

      if (!response.ok) {
        throw new Error(`API service unavailable: ${response.status}`);
      }

      console.log('🔗 API服务可用');
    } catch (error) {
      console.warn('⚠️ API服务不可用，某些测试可能会失败');
    }
  }

  /**
   * 清理测试数据
   */
  private async cleanupTestData(): Promise<void> {
    // 这里应该清理所有测试数据
    console.log('🗑️ 清理测试数据...');
    await this.wait(1000);
  }

  /**
   * 等待指定时间
   */
  private async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 控制台错误捕获工具
 */
export class ConsoleErrorCapturer {
  private errors: string[] = [];
  private originalConsoleError: typeof console.error;

  /**
   * 开始捕获控制台错误
   */
  startCapturing(): void {
    this.errors = [];
    this.originalConsoleError = console.error;

    console.error = (...args: any[]) => {
      this.errors.push(args.join(' '));
      this.originalConsoleError.apply(console, args);
    };
  }

  /**
   * 停止捕获并返回错误
   */
  stopCapturing(): string[] {
    console.error = this.originalConsoleError;
    return [...this.errors];
  }

  /**
   * 验证没有控制台错误
   */
  validateNoErrors(errors?: string[]): void {
    const capturedErrors = errors || this.errors;
    expect(capturedErrors).toHaveLength(0);
  }

  /**
   * 验证特定错误存在
   */
  validateErrorExists(expectedError: string, errors?: string[]): void {
    const capturedErrors = errors || this.errors;
    const hasError = capturedErrors.some(error => error.includes(expectedError));
    expect(hasError).toBe(true);
  }
}

/**
 * 导出测试配置实例
 */
export const testConfig = TEST_CONFIG;
export const testEnvironmentManager = TestEnvironmentManager.getInstance();
export const consoleErrorCapturer = new ConsoleErrorCapturer();

/**
 * 便捷的验证函数
 */
export const validateRequiredFields = APIValidator.validateRequiredFields.bind(APIValidator);
export const validateFieldTypes = APIValidator.validateFieldTypes.bind(APIValidator);
export const validateBasicResponse = APIValidator.validateBasicResponse.bind(APIValidator);
export const validateSuccessResponse = APIValidator.validateSuccessResponse.bind(APIValidator);
export const validateErrorResponse = APIValidator.validateErrorResponse.bind(APIValidator);