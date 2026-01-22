/**
 * 测试框架配置
 *
 * 提供单元测试和集成测试的配置和工具
 */

import { Sequelize } from 'sequelize';
import { Request, Response } from 'express';

/**
 * 测试类型
 */
export enum TestType {
  UNIT = 'unit',
  INTEGRATION = 'integration',
  E2E = 'e2e'
}

/**
 * 测试环境
 */
export enum TestEnvironment {
  DEVELOPMENT = 'development',
  TEST = 'test',
  CI = 'ci'
}

/**
 * 测试配置
 */
export interface TestConfig {
  type: TestType;
  environment: TestEnvironment;
  coverage: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
  timeout: number;
  verbose: boolean;
  bail: boolean;
  parallel?: boolean;
}

/**
 * 默认测试配置
 */
export const DEFAULT_TEST_CONFIG: TestConfig = {
  type: TestType.UNIT,
  environment: TestEnvironment.TEST,
  coverage: {
    statements: 80,
    branches: 75,
    functions: 80,
    lines: 80
  },
  timeout: 10000,
  verbose: true,
  bail: false,
  parallel: false
};

/**
 * Mock数据生成器
 */
export class MockDataGenerator {
  /**
   * 生成随机字符串
   */
  static randomString(length: number = 10): string {
    return Math.random().toString(36).substring(2, 2 + length);
  }

  /**
   * 生成随机数字
   */
  static randomNumber(min: number = 0, max: number = 100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * 生成随机邮箱
   */
  static randomEmail(): string {
    return `test_${Date.now()}@example.com`;
  }

  /**
   * 生成随机手机号
   */
  static randomPhone(): string {
    return `1${Math.floor(Math.random() * 9) + 3}${Math.random().toString().substring(2, 11)}`;
  }

  /**
   * 生成随机日期
   */
  static randomDate(start: Date = new Date(2020, 0, 1), end: Date = new Date()): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  /**
   * 生成随机布尔值
   */
  static randomBoolean(): boolean {
    return Math.random() < 0.5;
  }

  /**
   * 从数组中随机选择
   */
  static randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * 生成Mock用户
   */
  static mockUser(overrides: Partial<any> = {}): any {
    return {
      id: this.randomNumber(1, 10000),
      username: this.randomString(8),
      email: this.randomEmail(),
      phone: this.randomPhone(),
      password: 'password123',
      role: 'teacher',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  }

  /**
   * 生成Mock学生
   */
  static mockStudent(overrides: Partial<any> = {}): any {
    return {
      id: this.randomNumber(1, 10000),
      name: `学生_${this.randomString(6)}`,
      age: this.randomNumber(3, 6),
      gender: this.randomChoice(['male', 'female']),
      classId: this.randomNumber(1, 10),
      parentId: this.randomNumber(1, 100),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  }

  /**
   * 生成Mock班级
   */
  static mockClass(overrides: Partial<any> = {}): any {
    return {
      id: this.randomNumber(1, 100),
      name: `${this.randomNumber(1, 6)}年级${this.randomNumber(1, 10)}班`,
      teacherId: this.randomNumber(1, 100),
      capacity: this.randomNumber(20, 40),
      currentCount: this.randomNumber(10, 35),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  }

  /**
   * 生成Mock分页数据
   */
  static mockPaginatedData<T>(data: T[], page: number = 1, pageSize: number = 10): any {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      data: data.slice(start, end),
      pagination: {
        page,
        pageSize,
        total: data.length,
        totalPages: Math.ceil(data.length / pageSize)
      }
    };
  }

  /**
   * 生成Mock API响应
   */
  static mockApiResponse<T>(data: T, success: boolean = true): any {
    return {
      success,
      data,
      error: success ? undefined : { message: 'Error occurred' }
    };
  }
}

/**
 * 测试数据库工具
 */
export class TestDatabaseUtil {
  private sequelize: Sequelize;
  private models: any;

  constructor(sequelize: Sequelize, models: any) {
    this.sequelize = sequelize;
    this.models = models;
  }

  /**
   * 同步数据库结构
   */
  async sync(force: boolean = false): Promise<void> {
    await this.sequelize.sync({ force });
  }

  /**
   * 清空所有表
   */
  async truncateAll(): Promise<void> {
    const [rows] = await this.sequelize.query("SHOW TABLES");
    const tableNames = (rows as any[]).map((row: any) => Object.values(row)[0]);

    for (const tableName of tableNames) {
      if (tableName !== 'migrations') {
        await this.sequelize.query(`SET FOREIGN_KEY_CHECKS = 0`);
        await this.sequelize.query(`TRUNCATE TABLE ${tableName}`);
        await this.sequelize.query(`SET FOREIGN_KEY_CHECKS = 1`);
      }
    }
  }

  /**
   * 创建测试数据
   */
  async seedData(modelName: string, count: number, dataFactory?: () => any): Promise<any[]> {
    const Model = this.models[modelName];
    const data: any[] = [];

    for (let i = 0; i < count; i++) {
      const mockData = dataFactory ? dataFactory() : {};
      const instance = await Model.create(mockData);
      data.push(instance.toJSON());
    }

    return data;
  }

  /**
   * 开始事务
   */
  async startTransaction(): Promise<any> {
    return await this.sequelize.transaction();
  }

  /**
   * 回滚事务
   */
  async rollback(transaction: any): Promise<void> {
    await transaction.rollback();
  }

  /**
   * 提交事务
   */
  async commit(transaction: any): Promise<void> {
    await transaction.commit();
  }

  /**
   * 关闭数据库连接
   */
  async close(): Promise<void> {
    await this.sequelize.close();
  }
}

/**
 * HTTP测试工具
 */
export class HttpTestUtil {
  /**
   * 创建Mock Request
   */
  static mockRequest(overrides: Partial<Request> = {}): Partial<Request> {
    return {
      body: {},
      query: {},
      params: {},
      headers: {},
      user: null,
      ip: '127.0.0.1',
      ...overrides
    };
  }

  /**
   * 创建Mock Response
   */
  static mockResponse(): {
    res: Partial<Response>;
    status: jest.Mock;
    json: jest.Mock;
    send: jest.Mock;
    getStatus: () => number;
    getJson: () => any;
  } {
    const res: Partial<Response> = {};
    const statusMock = jest.fn().mockReturnValue(res);
    const jsonMock = jest.fn().mockReturnValue(res);
    const sendMock = jest.fn().mockReturnValue(res);

    res.status = statusMock as any;
    res.json = jsonMock as any;
    res.send = sendMock as any;

    return {
      res,
      status: statusMock,
      json: jsonMock,
      send: sendMock,
      getStatus: () => statusMock.mock.calls[statusMock.mock.calls.length - 1]?.[0] || 200,
      getJson: () => jsonMock.mock.calls[jsonMock.mock.calls.length - 1]?.[0]
    };
  }

  /**
   * 创建Mock Next函数
   */
  static mockNext(): jest.Mock {
    return jest.fn();
  }
}

/**
 * 断言工具
 */
export class AssertionUtil {
  /**
   * 验证API响应结构
   */
  static assertApiResponse(response: any): void {
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
   * 验证分页响应
   */
  static assertPaginatedResponse(response: any): void {
    expect(response).toHaveProperty('data');
    expect(Array.isArray(response.data)).toBe(true);

    expect(response).toHaveProperty('pagination');
    expect(response.pagination).toHaveProperty('page');
    expect(response.pagination).toHaveProperty('pageSize');
    expect(response.pagination).toHaveProperty('total');
    expect(response.pagination).toHaveProperty('totalPages');
  }

  /**
   * 验证错误响应
   */
  static assertErrorResponse(response: any, statusCode: number = 500): void {
    expect(response.success).toBe(false);
    expect(response).toHaveProperty('error');
    expect(response.error).toHaveProperty('message');
  }

  /**
   * 验证必填字段
   */
  static assertRequiredFields(obj: any, requiredFields: string[]): void {
    requiredFields.forEach(field => {
      expect(obj).toHaveProperty(field);
    });
  }

  /**
   * 验证字段类型
   */
  static assertFieldTypes(obj: any, fieldTypes: Record<string, string>): void {
    Object.entries(fieldTypes).forEach(([field, expectedType]) => {
      const actualType = typeof obj[field];
      expect(actualType).toBe(expectedType);
    });
  }
}

/**
 * 测试运行器
 */
export class TestRunner {
  private tests: Map<string, () => Promise<void>> = new Map();

  /**
   * 注册测试
   */
  registerTest(name: string, testFn: () => Promise<void>): void {
    this.tests.set(name, testFn);
  }

  /**
   * 运行所有测试
   */
  async runAll(): Promise<{
    passed: string[];
    failed: Array<{ name: string; error: any }>;
  }> {
    const passed: string[] = [];
    const failed: Array<{ name: string; error: any }> = [];

    for (const [name, testFn] of this.tests) {
      try {
        await testFn();
        passed.push(name);
      } catch (error) {
        failed.push({ name, error });
      }
    }

    return { passed, failed };
  }

  /**
   * 清除所有测试
   */
  clear(): void {
    this.tests.clear();
  }
}

/**
 * 性能测试工具
 */
export class PerformanceTestUtil {
  /**
   * 测量函数执行时间
   */
  static async measureTime(fn: () => Promise<void>): Promise<number> {
    const start = Date.now();
    await fn();
    return Date.now() - start;
  }

  /**
   * 验证函数执行时间
   */
  static async assertExecutionTime(
    fn: () => Promise<void>,
    maxTime: number
  ): Promise<void> {
    const executionTime = await this.measureTime(fn);
    expect(executionTime).toBeLessThanOrEqual(maxTime);
  }

  /**
   * 重复执行并统计
   */
  static async benchmark(
    fn: () => Promise<void>,
    iterations: number = 100
  ): Promise<{ avgTime: number; minTime: number; maxTime: number }> {
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const time = await this.measureTime(fn);
      times.push(time);
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    return { avgTime, minTime, maxTime };
  }
}

/**
 * 创建测试数据库工具
 */
export function createTestDatabaseUtil(sequelize: Sequelize, models: any): TestDatabaseUtil {
  return new TestDatabaseUtil(sequelize, models);
}

/**
 * 导出配置
 */
export default {
  TestType,
  TestEnvironment,
  DEFAULT_TEST_CONFIG,
  MockDataGenerator,
  TestDatabaseUtil,
  HttpTestUtil,
  AssertionUtil,
  TestRunner,
  PerformanceTestUtil,
  createTestDatabaseUtil
};
