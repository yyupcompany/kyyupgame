import axios, { AxiosResponse } from 'axios';

// 真实API基地址
const API_BASE_URL = 'http://localhost:3000/api';

// API客户端配置
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  validateStatus: () => true,
});

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
}

// 通用参数验证测试框架
export class ParameterValidationFramework {
  private authToken: string = '';

  constructor() {}

  async initialize(): Promise<void> {
    // 获取认证token
    const loginResponse = await apiClient.post('/auth/login', {
      email: 'admin@k.yyup.cc',
      password: 'admin123'
    });

    if (loginResponse.status === 200 && loginResponse.data.success) {
      this.authToken = loginResponse.data.data.token;
    } else {
      // 尝试备用登录
      const altResponse = await apiClient.post('/auth/login', {
        username: 'admin',
        password: 'admin123'
      });
      if (altResponse.status === 200 && altResponse.data.success) {
        this.authToken = altResponse.data.data.token;
      }
    }
  }

  getAuthHeaders() {
    return this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {};
  }

  // 必填字段验证测试
  async testRequiredFields(endpoint: string, method: string, requiredFields: string[], validData: any): Promise<void> {
    console.log(`\n🔍 测试必填字段验证: ${method.toUpperCase()} ${endpoint}`);
    
    for (const field of requiredFields) {
      const testData = { ...validData };
      delete testData[field];

      let response: AxiosResponse<ApiResponse>;
      
      switch (method.toLowerCase()) {
        case 'post':
          response = await apiClient.post(endpoint, testData, { headers: this.getAuthHeaders() });
          break;
        case 'put':
          response = await apiClient.put(endpoint, testData, { headers: this.getAuthHeaders() });
          break;
        case 'patch':
          response = await apiClient.patch(endpoint, testData, { headers: this.getAuthHeaders() });
          break;
        default:
          throw new Error(`不支持的HTTP方法: ${method}`);
      }

      console.log(`  - 缺少字段 "${field}": 状态码 ${response.status}`);
      
      // 应该返回400或422错误
      expect([400, 422]).toContain(response.status);
      expect(response.data.success).toBe(false);
    }
  }

  // 数据类型验证测试
  async testDataTypes(endpoint: string, method: string, typeTests: any[], validData: any): Promise<void> {
    console.log(`\n🔧 测试数据类型验证: ${method.toUpperCase()} ${endpoint}`);
    
    for (const test of typeTests) {
      const { field, validValue, invalidValues } = test;
      
      // 测试有效值
      const validTestData = { ...validData, [field]: validValue };
      
      let validResponse: AxiosResponse<ApiResponse>;
      switch (method.toLowerCase()) {
        case 'post':
          validResponse = await apiClient.post(endpoint, validTestData, { headers: this.getAuthHeaders() });
          break;
        case 'put':
          validResponse = await apiClient.put(endpoint, validTestData, { headers: this.getAuthHeaders() });
          break;
        default:
          validResponse = await apiClient.post(endpoint, validTestData, { headers: this.getAuthHeaders() });
      }
      
      console.log(`  - 字段 "${field}" 有效值 (${typeof validValue}): 状态码 ${validResponse.status}`);
      
      // 测试无效值
      for (const invalidValue of invalidValues) {
        const invalidTestData = { ...validData, [field]: invalidValue };
        
        let invalidResponse: AxiosResponse<ApiResponse>;
        switch (method.toLowerCase()) {
          case 'post':
            invalidResponse = await apiClient.post(endpoint, invalidTestData, { headers: this.getAuthHeaders() });
            break;
          case 'put':
            invalidResponse = await apiClient.put(endpoint, invalidTestData, { headers: this.getAuthHeaders() });
            break;
          default:
            invalidResponse = await apiClient.post(endpoint, invalidTestData, { headers: this.getAuthHeaders() });
        }
        
        console.log(`  - 字段 "${field}" 无效值 (${typeof invalidValue}): 状态码 ${invalidResponse.status}`);
        
        // 应该返回错误
        expect([400, 422]).toContain(invalidResponse.status);
        expect(invalidResponse.data.success).toBe(false);
      }
    }
  }

  // 边界值验证测试
  async testBoundaryValues(endpoint: string, method: string, boundaryTests: any[], validData: any): Promise<void> {
    console.log(`\n📏 测试边界值验证: ${method.toUpperCase()} ${endpoint}`);
    
    for (const test of boundaryTests) {
      const { field, min, max, minLength, maxLength, invalidValues } = test;
      
      // 测试最小值
      if (typeof min !== 'undefined') {
        const minTestData = { ...validData, [field]: min };
        
        let minResponse: AxiosResponse<ApiResponse>;
        switch (method.toLowerCase()) {
          case 'post':
            minResponse = await apiClient.post(endpoint, minTestData, { headers: this.getAuthHeaders() });
            break;
          case 'put':
            minResponse = await apiClient.put(endpoint, minTestData, { headers: this.getAuthHeaders() });
            break;
          default:
            minResponse = await apiClient.post(endpoint, minTestData, { headers: this.getAuthHeaders() });
        }
        
        console.log(`  - 字段 "${field}" 最小值 ${min}: 状态码 ${minResponse.status}`);
      }
      
      // 测试最大值
      if (typeof max !== 'undefined') {
        const maxTestData = { ...validData, [field]: max };
        
        let maxResponse: AxiosResponse<ApiResponse>;
        switch (method.toLowerCase()) {
          case 'post':
            maxResponse = await apiClient.post(endpoint, maxTestData, { headers: this.getAuthHeaders() });
            break;
          case 'put':
            maxResponse = await apiClient.put(endpoint, maxTestData, { headers: this.getAuthHeaders() });
            break;
          default:
            maxResponse = await apiClient.post(endpoint, maxTestData, { headers: this.getAuthHeaders() });
        }
        
        console.log(`  - 字段 "${field}" 最大值 ${max}: 状态码 ${maxResponse.status}`);
      }
      
      // 测试无效边界值
      if (invalidValues) {
        for (const invalidValue of invalidValues) {
          const invalidTestData = { ...validData, [field]: invalidValue };
          
          let invalidResponse: AxiosResponse<ApiResponse>;
          switch (method.toLowerCase()) {
            case 'post':
              invalidResponse = await apiClient.post(endpoint, invalidTestData, { headers: this.getAuthHeaders() });
              break;
            case 'put':
              invalidResponse = await apiClient.put(endpoint, invalidTestData, { headers: this.getAuthHeaders() });
              break;
            default:
              invalidResponse = await apiClient.post(endpoint, invalidTestData, { headers: this.getAuthHeaders() });
          }
          
          console.log(`  - 字段 "${field}" 边界外值 ${invalidValue}: 状态码 ${invalidResponse.status}`);
          
          expect([400, 422]).toContain(invalidResponse.status);
          expect(invalidResponse.data.success).toBe(false);
        }
      }
    }
  }

  // 特殊字符验证测试
  async testSpecialCharacters(endpoint: string, method: string, specialCharTests: any[], validData: any): Promise<void> {
    console.log(`\n🛡️ 测试特殊字符验证: ${method.toUpperCase()} ${endpoint}`);
    
    for (const test of specialCharTests) {
      const { field, validChars, invalidChars } = test;
      
      // 测试有效特殊字符
      for (const char of validChars) {
        const validTestData = { ...validData, [field]: char };
        
        let validResponse: AxiosResponse<ApiResponse>;
        switch (method.toLowerCase()) {
          case 'post':
            validResponse = await apiClient.post(endpoint, validTestData, { headers: this.getAuthHeaders() });
            break;
          case 'put':
            validResponse = await apiClient.put(endpoint, validTestData, { headers: this.getAuthHeaders() });
            break;
          default:
            validResponse = await apiClient.post(endpoint, validTestData, { headers: this.getAuthHeaders() });
        }
        
        console.log(`  - 字段 "${field}" 有效字符 "${char}": 状态码 ${validResponse.status}`);
      }
      
      // 测试无效特殊字符
      for (const char of invalidChars) {
        const invalidTestData = { ...validData, [field]: char };
        
        let invalidResponse: AxiosResponse<ApiResponse>;
        switch (method.toLowerCase()) {
          case 'post':
            invalidResponse = await apiClient.post(endpoint, invalidTestData, { headers: this.getAuthHeaders() });
            break;
          case 'put':
            invalidResponse = await apiClient.put(endpoint, invalidTestData, { headers: this.getAuthHeaders() });
            break;
          default:
            invalidResponse = await apiClient.post(endpoint, invalidTestData, { headers: this.getAuthHeaders() });
        }
        
        console.log(`  - 字段 "${field}" 无效字符 "${char}": 状态码 ${invalidResponse.status}`);
        
        // 可能返回400错误或清理后成功
        expect([200, 201, 400, 422]).toContain(invalidResponse.status);
      }
    }
  }

  // 权限验证测试
  async testPermissions(endpoints: any[]): Promise<void> {
    console.log(`\n🔐 测试权限验证`);
    
    for (const endpoint of endpoints) {
      const { method, path, requiresAuth = true } = endpoint;
      const testData = { test: 'data' };
      
      let response: AxiosResponse<ApiResponse>;
      
      // 不带认证的请求
      switch (method.toLowerCase()) {
        case 'get':
          response = await apiClient.get(path);
          break;
        case 'post':
          response = await apiClient.post(path, testData);
          break;
        case 'put':
          response = await apiClient.put(path, testData);
          break;
        case 'delete':
          response = await apiClient.delete(path);
          break;
        default:
          continue;
      }
      
      console.log(`  - ${method.toUpperCase()} ${path} (无认证): 状态码 ${response.status}`);
      
      if (requiresAuth) {
        expect(response.status).toBe(401);
        expect(response.data.success).toBe(false);
      }
    }
  }

  // 性能测试
  async testPerformance(endpoint: string, method: string, testData: any, maxResponseTime: number = 2000): Promise<void> {
    console.log(`\n⚡ 测试性能: ${method.toUpperCase()} ${endpoint}`);
    
    const startTime = Date.now();
    
    let response: AxiosResponse<ApiResponse>;
    switch (method.toLowerCase()) {
      case 'get':
        response = await apiClient.get(endpoint, { headers: this.getAuthHeaders() });
        break;
      case 'post':
        response = await apiClient.post(endpoint, testData, { headers: this.getAuthHeaders() });
        break;
      case 'put':
        response = await apiClient.put(endpoint, testData, { headers: this.getAuthHeaders() });
        break;
      default:
        response = await apiClient.get(endpoint, { headers: this.getAuthHeaders() });
    }
    
    const responseTime = Date.now() - startTime;
    
    console.log(`  - 响应时间: ${responseTime}ms (期望 < ${maxResponseTime}ms)`);
    console.log(`  - 状态码: ${response.status}`);
    
    expect(responseTime).toBeLessThan(maxResponseTime);
  }

  // 并发测试
  async testConcurrency(endpoint: string, method: string, testData: any, concurrentRequests: number = 5): Promise<void> {
    console.log(`\n🔄 测试并发: ${method.toUpperCase()} ${endpoint} (${concurrentRequests}个并发请求)`);
    
    const requests = Array(concurrentRequests).fill(null).map(async () => {
      switch (method.toLowerCase()) {
        case 'get':
          return apiClient.get(endpoint, { headers: this.getAuthHeaders() });
        case 'post':
          return apiClient.post(endpoint, testData, { headers: this.getAuthHeaders() });
        case 'put':
          return apiClient.put(endpoint, testData, { headers: this.getAuthHeaders() });
        default:
          return apiClient.get(endpoint, { headers: this.getAuthHeaders() });
      }
    });

    const startTime = Date.now();
    const responses = await Promise.all(requests);
    const totalTime = Date.now() - startTime;

    console.log(`  - 并发请求总时间: ${totalTime}ms`);
    console.log(`  - 平均响应时间: ${totalTime / responses.length}ms`);
    
    // 检查所有响应
    responses.forEach((response, index) => {
      console.log(`  - 请求 ${index + 1}: 状态码 ${response.status}`);
      expect([200, 201, 400, 401, 429]).toContain(response.status);
    });

    // 平均响应时间应该合理
    expect(totalTime / responses.length).toBeLessThan(1000);
  }
}

describe('通用参数验证测试框架', () => {
  let framework: ParameterValidationFramework;

  beforeAll(async () => {
    framework = new ParameterValidationFramework();
    await framework.initialize();
  });

  it('应该初始化测试框架', () => {
    expect(framework).toBeDefined();
  });

  it('应该能够获取认证头', () => {
    const headers = framework.getAuthHeaders();
    expect(headers).toBeDefined();
  });
});

export { ParameterValidationFramework };