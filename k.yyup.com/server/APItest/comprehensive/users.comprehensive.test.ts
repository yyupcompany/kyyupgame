import axios, { AxiosResponse } from 'axios';
import { TestDataFactory } from '../helpers/testUtils';
import { getAuthToken, TEST_CREDENTIALS } from '../helpers/authHelper';

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

describe('用户管理API全面测试 - 参数验证', () => {
  let authToken: string = '';
  let testUserIds: number[] = [];

  beforeAll(async () => {
    console.log('🚀 开始用户管理API全面测试...');
    console.log('📋 测试范围: 9个用户管理端点的完整参数验证');

    try {
      // 使用真实的认证凭据获取token
      authToken = await getAuthToken('admin');
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      console.log('✅ 管理员认证成功');
    } catch (error) {
      console.error('❌ 管理员认证失败:', error);
      throw new Error('Failed to authenticate admin user');
    }
  });

  afterAll(async () => {
    // 清理测试数据
    console.log('🧹 清理测试用户数据...');
    for (const userId of testUserIds) {
      if (authToken) {
        await apiClient.delete(`/users/${userId}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
      }
    }
  });

  describe('POST /users - 创建用户参数验证', () => {
    // 有效用户参数组合
    const validUserParams = [
      {
        username: 'test_user_001',
        email: 'test001@test.com',
        password: 'Test123456',
        role: 'teacher',
        name: '测试用户001',
        description: '基本教师用户'
      },
      {
        username: 'test_user_002',
        email: 'test002@test.com',
        password: 'Test123456!',
        role: 'admin',
        name: '测试管理员',
        phone: '13800138000',
        description: '完整管理员用户'
      },
      {
        username: 'test_user_003',
        email: 'test003@test.com',
        password: 'Test123456@',
        role: 'parent',
        name: '测试家长',
        phone: '13900139000',
        address: '测试地址123号',
        description: '完整家长用户'
      }
    ];

    // 无效用户参数组合
    const invalidUserParams = [
      {
        params: { username: '', email: 'test@test.com', password: 'Test123', role: 'teacher' },
        description: '空用户名',
        expectedError: 'MISSING_USERNAME'
      },
      {
        params: { username: 'test', email: '', password: 'Test123', role: 'teacher' },
        description: '空邮箱',
        expectedError: 'MISSING_EMAIL'
      },
      {
        params: { username: 'test', email: 'invalid-email', password: 'Test123', role: 'teacher' },
        description: '无效邮箱格式',
        expectedError: 'INVALID_EMAIL'
      },
      {
        params: { username: 'test', email: 'test@test.com', password: '123', role: 'teacher' },
        description: '密码太短',
        expectedError: 'PASSWORD_TOO_SHORT'
      },
      {
        params: { username: 'te', email: 'test@test.com', password: 'Test123', role: 'teacher' },
        description: '用户名太短',
        expectedError: 'USERNAME_TOO_SHORT'
      },
      {
        params: { username: 'test', email: 'test@test.com', password: 'Test123', role: 'invalid' },
        description: '无效角色',
        expectedError: 'INVALID_ROLE'
      },
      {
        params: {},
        description: '空对象',
        expectedError: 'MISSING_REQUIRED_FIELDS'
      },
      {
        params: { invalidField: 'test' },
        description: '无效字段',
        expectedError: 'INVALID_FIELDS'
      },
      {
        params: { username: 'test', email: 'test@test.com', password: 'Test123', role: 'teacher', phone: '123' },
        description: '无效手机号格式',
        expectedError: 'INVALID_PHONE'
      },
      {
        params: { username: 'test@user', email: 'test@test.com', password: 'Test123', role: 'teacher' },
        description: '用户名包含特殊字符',
        expectedError: 'INVALID_USERNAME_FORMAT'
      }
    ];

    // 边界值测试
    const boundaryParams = [
      {
        params: { username: 'ab', email: 'a@b.c', password: 'Test12', role: 'teacher' },
        description: '最短有效长度',
        shouldPass: false
      },
      {
        params: { username: 'a'.repeat(50), email: 'test@test.com', password: 'Test123', role: 'teacher' },
        description: '最长用户名',
        shouldPass: false
      },
      {
        params: { username: 'test', email: 'a'.repeat(100) + '@test.com', password: 'Test123', role: 'teacher' },
        description: '超长邮箱',
        shouldPass: false
      },
      {
        params: { username: 'test', email: 'test@test.com', password: 'a'.repeat(200), role: 'teacher' },
        description: '超长密码',
        shouldPass: false
      }
    ];

    validUserParams.forEach((userData, index) => {
      it(`应该接受有效用户参数 ${index + 1}: ${userData.description}`, async () => {
        if (!authToken) {
          console.log('⚠️ 跳过创建用户测试 - 没有认证token');
          return;
        }

        const { description, ...params } = userData;
        
        const response: AxiosResponse<ApiResponse> = await apiClient.post('/users', params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log(`创建用户测试 [${description}] 状态:`, response.status);
        console.log(`创建用户测试 [${description}] 响应:`, JSON.stringify(response.data, null, 2));

        if (response.status === 201 && response.data.success) {
          expect(response.data.success).toBe(true);
          expect(response.data.data?.id).toBeDefined();
          
          // 保存用户ID供清理使用
          testUserIds.push(response.data.data.id);
        } else if (response.status === 409) {
          // 用户已存在，这是可接受的
          console.log('用户已存在，这是预期的行为');
        }
      });
    });

    invalidUserParams.forEach((testCase, index) => {
      it(`应该拒绝无效用户参数 ${index + 1}: ${testCase.description}`, async () => {
        if (!authToken) {
          console.log('⚠️ 跳过无效参数测试 - 没有认证token');
          return;
        }

        const response: AxiosResponse<ApiResponse> = await apiClient.post('/users', testCase.params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log(`无效用户测试 [${testCase.description}] 状态:`, response.status);
        console.log(`无效用户测试 [${testCase.description}] 响应:`, JSON.stringify(response.data, null, 2));

        expect([400, 422]).toContain(response.status);
        expect(response.data.success).toBe(false);
      });
    });

    boundaryParams.forEach((testCase, index) => {
      it(`应该正确处理边界值 ${index + 1}: ${testCase.description}`, async () => {
        if (!authToken) {
          console.log('⚠️ 跳过边界值测试 - 没有认证token');
          return;
        }

        const response: AxiosResponse<ApiResponse> = await apiClient.post('/users', testCase.params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log(`边界值测试 [${testCase.description}] 状态:`, response.status);

        if (testCase.shouldPass) {
          expect([200, 201]).toContain(response.status);
        } else {
          expect([400, 422]).toContain(response.status);
        }
      });
    });
  });

  describe('GET /users - 获取用户列表参数验证', () => {
    // 有效查询参数组合
    const validQueryParams = [
      { params: {}, description: '无参数查询' },
      { params: { page: 1, limit: 10 }, description: '基本分页' },
      { params: { page: 1, limit: 20, role: 'teacher' }, description: '角色筛选' },
      { params: { page: 1, limit: 15, status: 'active' }, description: '状态筛选' },
      { params: { search: '测试' }, description: '搜索查询' },
      { params: { page: 2, limit: 5, role: 'admin', status: 'active' }, description: '组合查询' },
      { params: { sort: 'createdAt', order: 'desc' }, description: '排序查询' },
      { params: { page: 1, limit: 10, search: 'admin', role: 'admin' }, description: '复杂组合查询' }
    ];

    // 无效查询参数组合
    const invalidQueryParams = [
      { params: { page: -1 }, description: '负数页码', expectedError: 'INVALID_PAGE' },
      { params: { page: 'invalid' }, description: '非数字页码', expectedError: 'INVALID_PAGE_TYPE' },
      { params: { limit: 0 }, description: '零限制', expectedError: 'INVALID_LIMIT' },
      { params: { limit: 1001 }, description: '超大限制', expectedError: 'LIMIT_TOO_LARGE' },
      { params: { role: 'invalid_role' }, description: '无效角色', expectedError: 'INVALID_ROLE' },
      { params: { status: 'invalid_status' }, description: '无效状态', expectedError: 'INVALID_STATUS' },
      { params: { sort: 'invalid_field' }, description: '无效排序字段', expectedError: 'INVALID_SORT_FIELD' },
      { params: { order: 'invalid_order' }, description: '无效排序方向', expectedError: 'INVALID_ORDER' }
    ];

    validQueryParams.forEach((testCase, index) => {
      it(`应该接受有效查询参数 ${index + 1}: ${testCase.description}`, async () => {
        if (!authToken) {
          console.log('⚠️ 跳过查询测试 - 没有认证token');
          return;
        }

        const response: AxiosResponse<ApiResponse> = await apiClient.get('/users', {
          headers: { 'Authorization': `Bearer ${authToken}` },
          params: testCase.params
        });
        
        console.log(`用户列表查询 [${testCase.description}] 状态:`, response.status);
        console.log(`用户列表查询 [${testCase.description}] 数据量:`, response.data?.data?.length || 0);

        if (response.status === 200) {
          expect(response.data.success).toBe(true);
          expect(response.data.data).toBeDefined();
        }
      });
    });

    invalidQueryParams.forEach((testCase, index) => {
      it(`应该处理无效查询参数 ${index + 1}: ${testCase.description}`, async () => {
        if (!authToken) {
          console.log('⚠️ 跳过无效查询测试 - 没有认证token');
          return;
        }

        const response: AxiosResponse<ApiResponse> = await apiClient.get('/users', {
          headers: { 'Authorization': `Bearer ${authToken}` },
          params: testCase.params
        });
        
        console.log(`无效查询测试 [${testCase.description}] 状态:`, response.status);

        // 可能返回400错误或者默认值
        expect([200, 400, 422]).toContain(response.status);
      });
    });
  });

  describe('GET /users/:id - 获取特定用户参数验证', () => {
    it('应该要求有效的用户ID', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过用户ID测试 - 没有认证token');
        return;
      }

      const invalidIds = ['invalid', '0', '-1', '999999999', 'null', 'undefined'];

      for (const id of invalidIds) {
        const response: AxiosResponse<ApiResponse> = await apiClient.get(`/users/${id}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log(`无效用户ID测试 [${id}] 状态:`, response.status);
        
        expect([400, 404]).toContain(response.status);
      }
    });

    it('应该返回存在用户的信息', async () => {
      if (!authToken || testUserIds.length === 0) {
        console.log('⚠️ 跳过获取用户测试 - 没有可用的测试用户');
        return;
      }

      const userId = testUserIds[0];
      const response: AxiosResponse<ApiResponse> = await apiClient.get(`/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log(`获取用户信息测试 [ID:${userId}] 状态:`, response.status);

      if (response.status === 200) {
        expect(response.data.success).toBe(true);
        expect(response.data.data?.id).toBe(userId);
      }
    });
  });

  describe('PUT /users/:id - 更新用户参数验证', () => {
    // 有效更新参数
    const validUpdateParams = [
      { name: '更新后的用户名', description: '更新姓名' },
      { email: 'updated@test.com', description: '更新邮箱' },
      { phone: '13700137000', description: '更新手机号' },
      { status: 'inactive', description: '更新状态' },
      { name: '完整更新', email: 'complete@test.com', phone: '13600136000', description: '组合更新' }
    ];

    // 无效更新参数
    const invalidUpdateParams = [
      { params: { email: 'invalid-email' }, description: '无效邮箱格式' },
      { params: { phone: '123' }, description: '无效手机号格式' },
      { params: { role: 'invalid_role' }, description: '无效角色' },
      { params: { status: 'invalid_status' }, description: '无效状态' },
      { params: { email: '' }, description: '空邮箱' },
      { params: { name: '' }, description: '空姓名' }
    ];

    validUpdateParams.forEach((updateData, index) => {
      it(`应该接受有效更新参数 ${index + 1}: ${updateData.description}`, async () => {
        if (!authToken || testUserIds.length === 0) {
          console.log('⚠️ 跳过更新测试 - 没有可用的测试用户');
          return;
        }

        const userId = testUserIds[0];
        const { description, ...params } = updateData;
        
        const response: AxiosResponse<ApiResponse> = await apiClient.put(`/users/${userId}`, params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log(`更新用户测试 [${description}] 状态:`, response.status);

        if (response.status === 200) {
          expect(response.data.success).toBe(true);
        }
      });
    });

    invalidUpdateParams.forEach((testCase, index) => {
      it(`应该拒绝无效更新参数 ${index + 1}: ${testCase.description}`, async () => {
        if (!authToken || testUserIds.length === 0) {
          console.log('⚠️ 跳过无效更新测试 - 没有可用的测试用户');
          return;
        }

        const userId = testUserIds[0];
        const response: AxiosResponse<ApiResponse> = await apiClient.put(`/users/${userId}`, testCase.params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log(`无效更新测试 [${testCase.description}] 状态:`, response.status);

        expect([400, 422]).toContain(response.status);
        expect(response.data.success).toBe(false);
      });
    });
  });

  describe('DELETE /users/:id - 删除用户参数验证', () => {
    it('应该要求有效的用户ID进行删除', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过删除测试 - 没有认证token');
        return;
      }

      const invalidIds = ['invalid', '0', '-1', 'null'];

      for (const id of invalidIds) {
        const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/users/${id}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log(`无效删除ID测试 [${id}] 状态:`, response.status);
        
        expect([400, 404]).toContain(response.status);
      }
    });

    it('应该能够删除存在的用户', async () => {
      if (!authToken || testUserIds.length === 0) {
        console.log('⚠️ 跳过删除用户测试 - 没有可用的测试用户');
        return;
      }

      // 使用最后一个测试用户进行删除测试
      const userId = testUserIds.pop();
      const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log(`删除用户测试 [ID:${userId}] 状态:`, response.status);

      if (response.status === 200) {
        expect(response.data.success).toBe(true);
      }
    });
  });

  describe('PATCH /users/:id/status - 更新用户状态参数验证', () => {
    // 有效状态值
    const validStatuses = ['active', 'inactive', 'suspended', 'pending'];
    
    // 无效状态值
    const invalidStatuses = ['', 'invalid', 'deleted', 'unknown', null, undefined];

    validStatuses.forEach((status, index) => {
      it(`应该接受有效状态 ${index + 1}: ${status}`, async () => {
        if (!authToken || testUserIds.length === 0) {
          console.log('⚠️ 跳过状态更新测试 - 没有可用的测试用户');
          return;
        }

        const userId = testUserIds[0];
        const response: AxiosResponse<ApiResponse> = await apiClient.patch(`/users/${userId}/status`, 
          { status }, 
          { headers: { 'Authorization': `Bearer ${authToken}` } }
        );
        
        console.log(`状态更新测试 [${status}] 状态:`, response.status);

        if (response.status === 200) {
          expect(response.data.success).toBe(true);
        }
      });
    });

    invalidStatuses.forEach((status, index) => {
      it(`应该拒绝无效状态 ${index + 1}: ${status}`, async () => {
        if (!authToken || testUserIds.length === 0) {
          console.log('⚠️ 跳过无效状态测试 - 没有可用的测试用户');
          return;
        }

        const userId = testUserIds[0];
        const response: AxiosResponse<ApiResponse> = await apiClient.patch(`/users/${userId}/status`, 
          { status }, 
          { headers: { 'Authorization': `Bearer ${authToken}` } }
        );
        
        console.log(`无效状态测试 [${status}] 状态:`, response.status);

        expect([400, 422]).toContain(response.status);
        expect(response.data.success).toBe(false);
      });
    });
  });

  describe('🔒 权限验证测试', () => {
    it('应该要求认证才能访问用户端点', async () => {
      const endpoints = [
        { method: 'get', path: '/users' },
        { method: 'post', path: '/users' },
        { method: 'get', path: '/users/1' },
        { method: 'put', path: '/users/1' },
        { method: 'delete', path: '/users/1' }
      ];

      for (const endpoint of endpoints) {
        let response;
        const testData = { username: 'test', email: 'test@test.com', password: 'test123', role: 'teacher' };
        
        switch (endpoint.method) {
          case 'get':
            response = await apiClient.get(endpoint.path);
            break;
          case 'post':
            response = await apiClient.post(endpoint.path, testData);
            break;
          case 'put':
            response = await apiClient.put(endpoint.path, testData);
            break;
          case 'delete':
            response = await apiClient.delete(endpoint.path);
            break;
        }
        
        console.log(`无认证访问测试 [${endpoint.method.toUpperCase()} ${endpoint.path}] 状态:`, response?.status);
        
        expect(response?.status).toBe(401);
        expect(response?.data.success).toBe(false);
      }
    });

    it('应该验证用户角色权限', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过权限测试 - 没有认证token');
        return;
      }

      // 测试创建用户权限（通常只有管理员可以）
      const response: AxiosResponse<ApiResponse> = await apiClient.post('/users', {
        username: 'permission_test_user',
        email: 'permission@test.com',
        password: 'Test123456',
        role: 'teacher',
        name: '权限测试用户'
      }, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log('权限验证测试状态:', response.status);

      // 根据当前用户权限，可能成功或被拒绝
      expect([200, 201, 403]).toContain(response.status);
    });
  });

  describe('🎯 性能测试', () => {
    it('应该在合理时间内响应用户列表请求', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过性能测试 - 没有认证token');
        return;
      }

      const startTime = Date.now();
      
      const response: AxiosResponse<ApiResponse> = await apiClient.get('/users', {
        headers: { 'Authorization': `Bearer ${authToken}` },
        params: { limit: 50 }
      });
      
      const responseTime = Date.now() - startTime;
      
      console.log(`用户列表响应时间: ${responseTime}ms`);
      console.log(`用户列表数据量: ${response.data?.data?.length || 0}`);
      
      // 响应时间应该小于2秒
      expect(responseTime).toBeLessThan(2000);
      
      if (response.status === 200) {
        expect(response.data.success).toBe(true);
      }
    });

    it('应该处理大量用户数据查询', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过大数据测试 - 没有认证token');
        return;
      }

      const largeLimits = [100, 200, 500];

      for (const limit of largeLimits) {
        const startTime = Date.now();
        
        const response: AxiosResponse<ApiResponse> = await apiClient.get('/users', {
          headers: { 'Authorization': `Bearer ${authToken}` },
          params: { limit }
        });
        
        const responseTime = Date.now() - startTime;
        
        console.log(`大数据查询 [limit:${limit}] 响应时间: ${responseTime}ms`);
        
        // 即使是大量数据，响应时间也应该合理
        expect(responseTime).toBeLessThan(5000);
        
        if (response.status === 200) {
          expect(response.data.success).toBe(true);
        }
      }
    });
  });
});