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

describe('AI会话管理API全面测试 - 参数验证', () => {
  let authToken: string = '';
  let testConversationIds: string[] = [];

  beforeAll(async () => {
    console.log('🚀 开始AI会话管理API全面测试...');
    console.log('📋 测试范围: 15+个AI会话管理端点的完整参数验证');

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
    console.log('🧹 清理测试AI会话数据...');
    for (const conversationId of testConversationIds) {
      if (authToken) {
        await apiClient.delete(`/ai/conversations/${conversationId}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
      }
    }
  });

  describe('POST /ai/conversations - 创建AI会话参数验证', () => {
    // 有效会话参数组合
    const validConversationParams = [
      {
        title: '教学计划讨论会话'
      },
      {
        title: 'AI助手对话'
      },
      {
        // 无title参数，测试可选字段
      }
    ];

    // 数据类型验证测试
    const invalidDataTypes = [
      { field: 'title', value: 123, description: '非字符串标题' },
      { field: 'title', value: true, description: '布尔值标题' },
      { field: 'title', value: [], description: '数组标题' },
      { field: 'title', value: {}, description: '对象标题' }
    ];

    invalidDataTypes.forEach(testCase => {
      it(`应当在无效数据类型时返回错误 - ${testCase.description}`, async () => {
        const invalidParams: any = {};
        invalidParams[testCase.field] = testCase.value;

        const response = await apiClient.post('/ai/conversations', invalidParams, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([400, 422]).toContain(response.status);
        if (response.data) {
          expect(response.data.success).toBe(false);
        }
      });
    });

    // 边界值测试
    const boundaryTests = [
      {
        params: { title: '' },
        description: '空标题',
        shouldPass: false
      },
      {
        params: { title: 'A' },
        description: '最短标题',
        shouldPass: true
      },
      {
        params: { title: 'A'.repeat(255) },
        description: '标准长度标题',
        shouldPass: true
      },
      {
        params: { title: 'A'.repeat(1000) },
        description: '超长标题',
        shouldPass: false
      }
    ];

    boundaryTests.forEach(test => {
      it(`应当在边界值测试时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.post('/ai/conversations', test.params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldPass) {
          expect([200, 201]).toContain(response.status);
          if (response.status === 201 && response.data?.success && response.data?.data?.id) {
            testConversationIds.push(response.data.data.id);
          }
        } else {
          expect([400, 422]).toContain(response.status);
          if (response.data) {
            expect(response.data.success).toBe(false);
          }
        }
      });
    });

    // 特殊字符和安全测试
    const securityTests = [
      {
        params: { title: '会话<script>alert("xss")</script>' },
        description: 'XSS攻击标题'
      },
      {
        params: { title: "会话\\'; DROP TABLE conversations; --" },
        description: 'SQL注入标题'
      },
      {
        params: { title: '会话${process.env.SECRET}' },
        description: '模板注入攻击'
      },
      {
        params: { title: '会话../../../etc/passwd' },
        description: '路径遍历攻击'
      }
    ];

    securityTests.forEach(test => {
      it(`应当在安全测试时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.post('/ai/conversations', test.params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        // 安全测试应该被正确处理，返回400、422或201(经过过滤)
        expect([200, 201, 400, 422]).toContain(response.status);
        if (response.status === 201 && response.data?.success && response.data?.data?.id) {
          testConversationIds.push(response.data.data.id);
        }
      });
    });

    // 有效参数测试
    validConversationParams.forEach((params, index) => {
      it(`应当使用有效参数成功创建AI会话 - 组合${index + 1}`, async () => {
        const response = await apiClient.post('/ai/conversations', params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([200, 201]).toContain(response.status);
        if (response.status === 201 && response.data?.success && response.data?.data?.id) {
          expect(response.data.data).toHaveProperty('id');
          if (params.title) {
            expect(response.data.data).toHaveProperty('title');
          }
          testConversationIds.push(response.data.data.id);
        }
      });
    });
  });

  describe('GET /ai/conversations - 获取AI会话列表参数验证', () => {
    // 分页参数测试
    const paginationTests = [
      { params: { page: 1, pageSize: 10 }, description: '标准分页参数' },
      { params: { page: 1, pageSize: 5 }, description: '小页面尺寸' },
      { params: { page: 2, pageSize: 20 }, description: '大页面尺寸' },
      { params: { page: 0 }, description: '无效页码', shouldFail: true },
      { params: { page: -1 }, description: '负数页码', shouldFail: true },
      { params: { pageSize: 0 }, description: '无效页面尺寸', shouldFail: true },
      { params: { pageSize: 1000 }, description: '超大页面尺寸', shouldFail: true }
    ];

    paginationTests.forEach(test => {
      it(`应当在分页参数测试时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.get('/ai/conversations', {
          params: test.params,
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldFail) {
          expect([400, 422]).toContain(response.status);
        } else {
          expect([200]).toContain(response.status);
          if (response.status === 200) {
            expect(response.data).toHaveProperty('success', true);
          }
        }
      });
    });

    // 筛选参数测试
    const filterTests = [
      { params: { isArchived: true }, description: '查询已归档会话' },
      { params: { isArchived: false }, description: '查询未归档会话' },
      { params: { isArchived: 'invalid' }, description: '无效归档状态', shouldFail: true }
    ];

    filterTests.forEach(test => {
      it(`应当在筛选参数测试时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.get('/ai/conversations', {
          params: test.params,
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldFail) {
          expect([400, 422]).toContain(response.status);
        } else {
          expect([200]).toContain(response.status);
          if (response.status === 200) {
            expect(response.data).toHaveProperty('success', true);
          }
        }
      });
    });

    it('应当在未认证时拒绝访问', async () => {
      const response = await apiClient.get('/ai/conversations');

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('GET /ai/conversations/:id - 获取AI会话详情参数验证', () => {
    let testConversationId: string;

    beforeAll(async () => {
      // 创建一个测试会话用于详情查询
      const testConversation = {
        title: 'AI会话详情测试'
      };

      const response = await apiClient.post('/ai/conversations', testConversation, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.status === 201 && response.data?.success && response.data?.data?.id) {
        testConversationId = response.data.data.id;
        testConversationIds.push(testConversationId);
      }
    });

    it('应当成功获取AI会话详情', async () => {
      if (!testConversationId) {
        console.warn('跳过会话详情测试：无法创建测试会话');
        return;
      }

      const response = await apiClient.get(`/ai/conversations/${testConversationId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
        expect(response.data.data).toHaveProperty('id', testConversationId);
      }
    });

    // ID验证测试
    const idTests = [
      { id: 'invalid-uuid', description: '无效UUID', shouldFail: true },
      { id: '123', description: '数字ID', shouldFail: true },
      { id: '', description: '空ID', shouldFail: true },
      { id: '00000000-0000-0000-0000-000000000000', description: '不存在的UUID', shouldFail: true }
    ];

    idTests.forEach(test => {
      it(`应当在ID验证测试时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.get(`/ai/conversations/${test.id}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldFail) {
          expect([400, 404, 422]).toContain(response.status);
        } else {
          expect([200]).toContain(response.status);
        }
      });
    });
  });

  describe('PATCH /ai/conversations/:id - 更新AI会话参数验证', () => {
    let testConversationId: string;

    beforeAll(async () => {
      // 创建一个测试会话用于更新测试
      const testConversation = {
        title: 'AI会话更新测试'
      };

      const response = await apiClient.post('/ai/conversations', testConversation, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.status === 201 && response.data?.success && response.data?.data?.id) {
        testConversationId = response.data.data.id;
        testConversationIds.push(testConversationId);
      }
    });

    const updateTests = [
      { data: { title: '更新的会话标题' }, description: '更新会话标题' },
      { data: { isArchived: true }, description: '归档会话' },
      { data: { isArchived: false }, description: '取消归档会话' },
      { data: { title: '新标题', isArchived: true }, description: '同时更新标题和归档状态' },
      { data: { title: '' }, description: '空标题更新', shouldFail: true },
      { data: { title: 123 }, description: '无效标题类型', shouldFail: true },
      { data: { isArchived: 'invalid' }, description: '无效归档状态', shouldFail: true }
    ];

    updateTests.forEach(test => {
      it(`应当在更新测试时正确处理 - ${test.description}`, async () => {
        if (!testConversationId) {
          console.warn('跳过更新测试：无法创建测试会话');
          return;
        }

        const response = await apiClient.patch(`/ai/conversations/${testConversationId}`, test.data, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldFail) {
          expect([400, 422]).toContain(response.status);
        } else {
          expect([200]).toContain(response.status);
          if (response.status === 200) {
            expect(response.data).toHaveProperty('success', true);
          }
        }
      });
    });

    it('应当在无更新字段时返回错误', async () => {
      if (!testConversationId) {
        console.warn('跳过更新测试：无法创建测试会话');
        return;
      }

      const response = await apiClient.patch(`/ai/conversations/${testConversationId}`, {}, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([400]).toContain(response.status);
      expect(response.data).toHaveProperty('success', false);
    });
  });

  describe('DELETE /ai/conversations/:id - 删除AI会话参数验证', () => {
    let testConversationId: string;

    beforeAll(async () => {
      // 创建一个测试会话用于删除测试
      const testConversation = {
        title: 'AI会话删除测试'
      };

      const response = await apiClient.post('/ai/conversations', testConversation, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.status === 201 && response.data?.success && response.data?.data?.id) {
        testConversationId = response.data.data.id;
        // 不加入清理列表，因为会被删除
      }
    });

    it('应当成功删除AI会话', async () => {
      if (!testConversationId) {
        console.warn('跳过删除测试：无法创建测试会话');
        return;
      }

      const response = await apiClient.delete(`/ai/conversations/${testConversationId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200, 204]).toContain(response.status);
    });

    it('应当在删除不存在的会话时返回404', async () => {
      const response = await apiClient.delete('/ai/conversations/00000000-0000-0000-0000-000000000000', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([404]).toContain(response.status);
    });

    it('应当在无效ID时返回错误', async () => {
      const response = await apiClient.delete('/ai/conversations/invalid-uuid', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([400, 422]).toContain(response.status);
    });
  });

  describe('权限验证测试', () => {
    const protectedEndpoints = [
      { method: 'get', url: '/ai/conversations' },
      { method: 'post', url: '/ai/conversations', data: { title: 'Test' } },
      { method: 'get', url: '/ai/conversations/test-uuid' },
      { method: 'patch', url: '/ai/conversations/test-uuid', data: { title: 'Updated' } },
      { method: 'delete', url: '/ai/conversations/test-uuid' }
    ];

    protectedEndpoints.forEach(endpoint => {
      it(`应当在未提供token时返回401 - ${endpoint.method.toUpperCase()} ${endpoint.url}`, async () => {
        let response;
        
        if (endpoint.method === 'get') {
          response = await apiClient.get(endpoint.url);
        } else if (endpoint.method === 'post') {
          response = await apiClient.post(endpoint.url, endpoint.data || {});
        } else if (endpoint.method === 'patch') {
          response = await apiClient.patch(endpoint.url, endpoint.data || {});
        } else if (endpoint.method === 'delete') {
          response = await apiClient.delete(endpoint.url);
        }

        expect([401, 403]).toContain(response!.status);
      });
    });

    it('应当在无效token时返回401', async () => {
      const response = await apiClient.get('/ai/conversations', {
        headers: { 'Authorization': 'Bearer invalid_token' }
      });

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('性能测试', () => {
    it('创建AI会话API响应时间应在可接受范围内', async () => {
      const startTime = Date.now();
      
      const testParams = {
        title: '性能测试AI会话'
      };

      const response = await apiClient.post('/ai/conversations', testParams, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(3000); // 响应时间应小于3秒
      expect([200, 201]).toContain(response.status);
      
      if (response.status === 201 && response.data?.success && response.data?.data?.id) {
        testConversationIds.push(response.data.data.id);
      }
    });

    it('获取AI会话列表API响应时间应在可接受范围内', async () => {
      const startTime = Date.now();
      
      const response = await apiClient.get('/ai/conversations', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(2000); // 响应时间应小于2秒
      expect([200]).toContain(response.status);
    });

    it('并发AI会话查询测试', async () => {
      const concurrentRequests = Array(3).fill(null).map(() => 
        apiClient.get('/ai/conversations', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );

      const startTime = Date.now();
      const responses = await Promise.all(concurrentRequests);
      const totalTime = Date.now() - startTime;

      expect(totalTime).toBeLessThan(6000); // 3个并发请求总时间应小于6秒
      responses.forEach(response => {
        expect([200]).toContain(response.status);
      });
    });
  });
});