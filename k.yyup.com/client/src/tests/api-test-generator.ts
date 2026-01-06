/**
 * API 测试用例生成器
 * 从 Swagger 文档自动生成测试用例
 * 用于在前端测试所有后端 API 端点
 */

interface ApiTestCase {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
  expectedStatus: number;
  expectedResponse?: any;
  tags: string[];
}

interface ApiTestResult {
  testId: string;
  testName: string;
  method: string;
  path: string;
  status: number;
  statusText: string;
  duration: number;
  passed: boolean;
  error?: string;
  response?: any;
  timestamp: string;
}

/**
 * API 测试套件
 */
export class ApiTestSuite {
  private testCases: ApiTestCase[] = [];
  private results: ApiTestResult[] = [];
  private baseUrl: string;
  private token?: string;

  constructor(baseUrl: string = 'http://localhost:4000') {
    this.baseUrl = baseUrl;
    this.initializeTestCases();
  }

  /**
   * 初始化测试用例
   */
  private initializeTestCases(): void {
    // 认证测试
    this.addTestCase({
      id: 'auth-login',
      name: '用户登录',
      method: 'POST',
      path: '/auth/login',
      description: '测试用户登录功能',
      body: {
        email: 'test@example.com',
        password: 'password123'
      },
      expectedStatus: 200,
      tags: ['auth', 'critical']
    });

    // 用户管理测试
    this.addTestCase({
      id: 'user-list',
      name: '获取用户列表',
      method: 'GET',
      path: '/users',
      description: '测试获取用户列表',
      params: { page: 1, pageSize: 10 },
      expectedStatus: 200,
      tags: ['users', 'list']
    });

    this.addTestCase({
      id: 'user-create',
      name: '创建用户',
      method: 'POST',
      path: '/users',
      description: '测试创建新用户',
      body: {
        name: '张三',
        email: 'zhangsan@example.com',
        phone: '+86 13800138000',
        role: 'teacher'
      },
      expectedStatus: 201,
      tags: ['users', 'create']
    });

    this.addTestCase({
      id: 'user-get',
      name: '获取用户详情',
      method: 'GET',
      path: '/users/1',
      description: '测试获取单个用户详情',
      expectedStatus: 200,
      tags: ['users', 'get']
    });

    this.addTestCase({
      id: 'user-update',
      name: '更新用户',
      method: 'PUT',
      path: '/users/1',
      description: '测试更新用户信息',
      body: {
        name: '张三（已更新）',
        phone: '+86 13800138001'
      },
      expectedStatus: 200,
      tags: ['users', 'update']
    });

    this.addTestCase({
      id: 'user-delete',
      name: '删除用户',
      method: 'DELETE',
      path: '/users/1',
      description: '测试删除用户',
      expectedStatus: 200,
      tags: ['users', 'delete']
    });

    // 活动管理测试
    this.addTestCase({
      id: 'activity-list',
      name: '获取活动列表',
      method: 'GET',
      path: '/activities',
      description: '测试获取活动列表',
      params: { page: 1, pageSize: 10 },
      expectedStatus: 200,
      tags: ['activities', 'list']
    });

    this.addTestCase({
      id: 'activity-get',
      name: '获取活动详情',
      method: 'GET',
      path: '/activities/1',
      description: '测试获取单个活动详情',
      expectedStatus: 200,
      tags: ['activities', 'get']
    });

    this.addTestCase({
      id: 'activity-create',
      name: '创建活动',
      method: 'POST',
      path: '/activities',
      description: '测试创建新活动',
      body: {
        name: '春季运动会',
        description: '全校师生参加的春季运动会',
        startDate: new Date().toISOString(),
        capacity: 100
      },
      expectedStatus: 201,
      tags: ['activities', 'create']
    });

    // 招生管理测试
    this.addTestCase({
      id: 'enrollment-list',
      name: '获取招生申请列表',
      method: 'GET',
      path: '/enrollment',
      description: '测试获取招生申请列表',
      params: { page: 1, pageSize: 10 },
      expectedStatus: 200,
      tags: ['enrollment', 'list']
    });

    this.addTestCase({
      id: 'enrollment-create',
      name: '提交招生申请',
      method: 'POST',
      path: '/enrollment',
      description: '测试提交招生申请',
      body: {
        studentName: '小明',
        studentAge: 4,
        parentName: '王女士',
        parentPhone: '+86 13900139000'
      },
      expectedStatus: 201,
      tags: ['enrollment', 'create']
    });

    this.addTestCase({
      id: 'enrollment-get',
      name: '获取招生申请详情',
      method: 'GET',
      path: '/enrollment/1',
      description: '测试获取招生申请详情',
      expectedStatus: 200,
      tags: ['enrollment', 'get']
    });

    // 班级测试
    this.addTestCase({
      id: 'class-list',
      name: '获取班级列表',
      method: 'GET',
      path: '/classes',
      description: '测试获取班级列表',
      expectedStatus: 200,
      tags: ['classes', 'list']
    });

    // 幼儿园测试
    this.addTestCase({
      id: 'kindergarten-list',
      name: '获取幼儿园列表',
      method: 'GET',
      path: '/kindergartens',
      description: '测试获取幼儿园列表',
      expectedStatus: 200,
      tags: ['kindergartens', 'list']
    });

    // AI 计费测试
    this.addTestCase({
      id: 'ai-billing-stats',
      name: '获取 AI 计费统计',
      method: 'GET',
      path: '/ai-billing/statistics',
      description: '测试获取 AI 计费统计',
      expectedStatus: 200,
      tags: ['ai-billing', 'statistics']
    });

    this.addTestCase({
      id: 'ai-billing-list',
      name: '获取 AI 计费记录',
      method: 'GET',
      path: '/ai-billing/bills',
      description: '测试获取 AI 计费记录',
      params: { page: 1, pageSize: 10 },
      expectedStatus: 200,
      tags: ['ai-billing', 'list']
    });

    // 权限和角色测试
    this.addTestCase({
      id: 'role-list',
      name: '获取角色列表',
      method: 'GET',
      path: '/roles',
      description: '测试获取角色列表',
      expectedStatus: 200,
      tags: ['roles', 'list']
    });

    this.addTestCase({
      id: 'permission-list',
      name: '获取权限列表',
      method: 'GET',
      path: '/permissions',
      description: '测试获取权限列表',
      expectedStatus: 200,
      tags: ['permissions', 'list']
    });
  }

  /**
   * 添加测试用例
   */
  private addTestCase(testCase: ApiTestCase): void {
    this.testCases.push(testCase);
  }

  /**
   * 设置认证 Token
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * 获取所有测试用例
   */
  getTestCases(): ApiTestCase[] {
    return this.testCases;
  }

  /**
   * 按标签过滤测试用例
   */
  filterByTag(tag: string): ApiTestCase[] {
    return this.testCases.filter(tc => tc.tags.includes(tag));
  }

  /**
   * 执行单个测试用例
   */
  async runTestCase(testCase: ApiTestCase): Promise<ApiTestResult> {
    const startTime = Date.now();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...testCase.headers
    };

    try {
      const url = new URL(`${this.baseUrl}/api${testCase.path}`);

      // 添加查询参数
      if (testCase.params) {
        Object.entries(testCase.params).forEach(([key, value]) => {
          url.searchParams.append(key, String(value));
        });
      }

      const options: RequestInit = {
        method: testCase.method,
        headers,
        ...(testCase.body && { body: JSON.stringify(testCase.body) })
      };

      const response = await fetch(url.toString(), options);
      const data = await response.json();
      const duration = Date.now() - startTime;

      const result: ApiTestResult = {
        testId: testCase.id,
        testName: testCase.name,
        method: testCase.method,
        path: testCase.path,
        status: response.status,
        statusText: response.statusText,
        duration,
        passed: response.status === testCase.expectedStatus,
        response: data,
        timestamp: new Date().toISOString()
      };

      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      return {
        testId: testCase.id,
        testName: testCase.name,
        method: testCase.method,
        path: testCase.path,
        status: 0,
        statusText: 'Network Error',
        duration,
        passed: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 执行所有测试
   */
  async runAllTests(): Promise<ApiTestResult[]> {
    console.log('🚀 开始执行 API 测试套件...\n');
    this.results = [];

    for (const testCase of this.testCases) {
      const result = await this.runTestCase(testCase);
      this.results.push(result);

      // 打印进度
      const status = result.passed ? '✅' : '❌';
      console.log(
        `${status} [${result.method}] ${result.path} - ${result.status} (${result.duration}ms)`
      );
    }

    return this.results;
  }

  /**
   * 生成测试报告
   */
  generateReport(): string {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    let report = `
╔════════════════════════════════════════════════════════════════╗
║                    API 测试报告                               ║
╚════════════════════════════════════════════════════════════════╝

📊 测试统计:
  • 总测试数: ${total}
  • 通过: ${passed} ✅
  • 失败: ${failed} ❌
  • 成功率: ${((passed / total) * 100).toFixed(2)}%
  • 总耗时: ${totalDuration}ms
  • 平均耗时: ${(totalDuration / total).toFixed(2)}ms

📋 详细结果:
`;

    const successTests = this.results.filter(r => r.passed);
    const failedTests = this.results.filter(r => !r.passed);

    if (successTests.length > 0) {
      report += '\n✅ 通过的测试:\n';
      successTests.forEach(r => {
        report += `  • [${r.method}] ${r.path} (${r.status}) - ${r.duration}ms\n`;
      });
    }

    if (failedTests.length > 0) {
      report += '\n❌ 失败的测试:\n';
      failedTests.forEach(r => {
        report += `  • [${r.method}] ${r.path} - ${r.error || `期望 ${this.testCases.find(tc => tc.id === r.testId)?.expectedStatus}, 实际 ${r.status}`}\n`;
      });
    }

    report += '\n' + '━'.repeat(66) + '\n';

    return report;
  }

  /**
   * 获取测试结果
   */
  getResults(): ApiTestResult[] {
    return this.results;
  }
}

export default ApiTestSuite;



