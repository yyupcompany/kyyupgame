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

describe('AI模型管理API全面测试 - 参数验证', () => {
  let authToken: string = '';
  let testUserId: number = 0;

  beforeAll(async () => {
    console.log('🚀 开始AI模型管理API全面测试...');
    console.log('📋 测试范围: 10+个AI模型管理端点的完整参数验证');

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

  describe('GET /ai/models - 获取AI模型列表参数验证', () => {
    it('应当成功获取模型列表', async () => {
      const response = await apiClient.get('/ai/models', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
        expect(Array.isArray(response.data.data)).toBe(true);
      }
    });

    // 模型类型过滤测试
    const typeFilterTests = [
      { type: 'text', description: '文本模型过滤' },
      { type: 'speech', description: '语音模型过滤' },
      { type: 'image', description: '图像模型过滤' },
      { type: 'video', description: '视频模型过滤' },
      { type: 'multimodal', description: '多模态模型过滤' },
      { type: 'invalid', description: '无效模型类型', shouldFail: true }
    ];

    typeFilterTests.forEach(test => {
      it(`应当在模型类型过滤时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.get('/ai/models', {
          params: { type: test.type },
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldFail) {
          expect([400, 422]).toContain(response.status);
        } else {
          expect([200]).toContain(response.status);
          if (response.status === 200) {
            expect(response.data).toHaveProperty('success', true);
            expect(Array.isArray(response.data.data)).toBe(true);
          }
        }
      });
    });

    // 模型状态过滤测试
    const statusFilterTests = [
      { status: 'active', description: '活跃模型过滤' },
      { status: 'inactive', description: '非活跃模型过滤' },
      { status: 'testing', description: '测试中模型过滤' },
      { status: 'invalid', description: '无效模型状态', shouldFail: true }
    ];

    statusFilterTests.forEach(test => {
      it(`应当在模型状态过滤时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.get('/ai/models', {
          params: { status: test.status },
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldFail) {
          expect([400, 422]).toContain(response.status);
        } else {
          expect([200]).toContain(response.status);
          if (response.status === 200) {
            expect(response.data).toHaveProperty('success', true);
            expect(Array.isArray(response.data.data)).toBe(true);
          }
        }
      });
    });

    // 组合过滤测试
    it('应当支持类型和状态组合过滤', async () => {
      const response = await apiClient.get('/ai/models', {
        params: { type: 'text', status: 'active' },
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
        expect(Array.isArray(response.data.data)).toBe(true);
      }
    });

    it('应当在未认证时拒绝访问', async () => {
      const response = await apiClient.get('/ai/models');

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('GET /ai/models/default - 获取默认AI模型参数验证', () => {
    it('应当成功获取默认模型', async () => {
      const response = await apiClient.get('/ai/models/default', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
        expect(response.data.data).toHaveProperty('id');
        expect(response.data.data).toHaveProperty('name');
        expect(response.data.data).toHaveProperty('type');
      }
    });

    it('应当在未认证时拒绝访问', async () => {
      const response = await apiClient.get('/ai/models/default');

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('GET /ai/models/:modelId/billing - 获取模型计费规则参数验证', () => {
    // 模型ID验证测试
    const modelIdTests = [
      { modelId: 1, description: '有效模型ID' },
      { modelId: 999999, description: '不存在的模型ID', shouldFail: true },
      { modelId: 'invalid', description: '无效模型ID格式', shouldFail: true },
      { modelId: 0, description: '零模型ID', shouldFail: true },
      { modelId: -1, description: '负数模型ID', shouldFail: true }
    ];

    modelIdTests.forEach(test => {
      it(`应当在模型ID验证时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.get(`/ai/models/${test.modelId}/billing`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldFail) {
          expect([400, 404, 422]).toContain(response.status);
        } else {
          expect([200, 404]).toContain(response.status);
          if (response.status === 200) {
            expect(response.data).toHaveProperty('success', true);
            expect(Array.isArray(response.data.data)).toBe(true);
          }
        }
      });
    });

    it('应当在未认证时拒绝访问', async () => {
      const response = await apiClient.get('/ai/models/1/billing');

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('GET /ai/model-management - 模型管理中间件API测试', () => {
    it('应当获取可用模型列表', async () => {
      const response = await apiClient.get('/ai/model-management', {
        headers: { 'Authorization': `Bearer ${authToken}` },
        data: { userId: testUserId }
      });

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toBeDefined();
      }
    });

    it('应当在缺少用户ID时返回错误', async () => {
      const response = await apiClient.get('/ai/model-management', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([400, 422]).toContain(response.status);
    });
  });

  describe('GET /ai/model-management/:modelId - 获取模型详情参数验证', () => {
    const modelDetailTests = [
      { modelId: 1, description: '有效模型详情查询' },
      { modelId: 'invalid', description: '无效模型ID', shouldFail: true },
      { modelId: 0, description: '零模型ID', shouldFail: true },
      { modelId: -1, description: '负数模型ID', shouldFail: true }
    ];

    modelDetailTests.forEach(test => {
      it(`应当在模型详情查询时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.get(`/ai/model-management/${test.modelId}`, {
          headers: { 'Authorization': `Bearer ${authToken}` },
          data: { userId: testUserId }
        });

        if (test.shouldFail) {
          expect([400, 404, 422]).toContain(response.status);
        } else {
          expect([200, 404]).toContain(response.status);
        }
      });
    });
  });

  describe('GET /ai/model-management/stats/:modelId - 获取模型使用统计参数验证', () => {
    it('应当成功获取模型使用统计', async () => {
      const response = await apiClient.get('/ai/model-management/stats/1', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toBeDefined();
      }
    });

    // 日期参数测试
    const dateTests = [
      { 
        params: { startDate: '2025-01-01', endDate: '2025-07-13' }, 
        description: '有效日期范围' 
      },
      { 
        params: { startDate: '2025-07-13', endDate: '2025-01-01' }, 
        description: '开始日期晚于结束日期', 
        shouldFail: true 
      },
      { 
        params: { startDate: 'invalid-date' }, 
        description: '无效开始日期格式', 
        shouldFail: true 
      },
      { 
        params: { endDate: 'invalid-date' }, 
        description: '无效结束日期格式', 
        shouldFail: true 
      }
    ];

    dateTests.forEach(test => {
      it(`应当在日期参数验证时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.get('/ai/model-management/stats/1', {
          params: test.params,
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldFail) {
          expect([400, 422]).toContain(response.status);
        } else {
          expect([200, 404]).toContain(response.status);
        }
      });
    });

    const statsModelIdTests = [
      { modelId: 'invalid', description: '无效模型ID', shouldFail: true },
      { modelId: 0, description: '零模型ID', shouldFail: true },
      { modelId: -1, description: '负数模型ID', shouldFail: true },
      { modelId: 999999, description: '不存在的模型ID' }
    ];

    statsModelIdTests.forEach(test => {
      it(`应当在统计模型ID验证时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.get(`/ai/model-management/stats/${test.modelId}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldFail) {
          expect([400, 422]).toContain(response.status);
        } else {
          expect([200, 404]).toContain(response.status);
        }
      });
    });
  });

  describe('PUT /ai/model-management/preferences/user/:userId/model/:modelId - 更新用户模型偏好参数验证', () => {
    const preferenceTests = [
      { 
        userId: testUserId, 
        modelId: 1, 
        description: '有效用户和模型ID' 
      },
      { 
        userId: 'invalid', 
        modelId: 1, 
        description: '无效用户ID', 
        shouldFail: true 
      },
      { 
        userId: testUserId, 
        modelId: 'invalid', 
        description: '无效模型ID', 
        shouldFail: true 
      },
      { 
        userId: 0, 
        modelId: 1, 
        description: '零用户ID', 
        shouldFail: true 
      },
      { 
        userId: testUserId, 
        modelId: 0, 
        description: '零模型ID', 
        shouldFail: true 
      },
      { 
        userId: -1, 
        modelId: 1, 
        description: '负数用户ID', 
        shouldFail: true 
      },
      { 
        userId: testUserId, 
        modelId: -1, 
        description: '负数模型ID', 
        shouldFail: true 
      }
    ];

    preferenceTests.forEach(test => {
      it(`应当在更新用户模型偏好时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.put(`/ai/model-management/preferences/user/${test.userId}/model/${test.modelId}`, {}, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldFail) {
          expect([400, 422]).toContain(response.status);
        } else {
          expect([200, 404]).toContain(response.status);
        }
      });
    });

    it('应当在不存在的用户时返回错误', async () => {
      const response = await apiClient.put('/ai/model-management/preferences/user/999999/model/1', {}, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([404]).toContain(response.status);
    });

    it('应当在不存在的模型时返回错误', async () => {
      const response = await apiClient.put(`/ai/model-management/preferences/user/${testUserId}/model/999999`, {}, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([404]).toContain(response.status);
    });
  });

  describe('权限验证测试', () => {
    const protectedEndpoints = [
      { method: 'get', url: '/ai/models' },
      { method: 'get', url: '/ai/models/default' },
      { method: 'get', url: '/ai/models/1/billing' },
      { method: 'get', url: '/ai/model-management' },
      { method: 'get', url: '/ai/model-management/1' },
      { method: 'get', url: '/ai/model-management/stats/1' },
      { method: 'put', url: `/ai/model-management/preferences/user/${testUserId}/model/1`, data: {} }
    ];

    protectedEndpoints.forEach(endpoint => {
      it(`应当在未提供token时返回401 - ${endpoint.method.toUpperCase()} ${endpoint.url}`, async () => {
        let response;
        
        if (endpoint.method === 'get') {
          response = await apiClient.get(endpoint.url);
        } else if (endpoint.method === 'put') {
          response = await apiClient.put(endpoint.url, endpoint.data || {});
        }

        expect([401, 403]).toContain(response!.status);
      });
    });

    it('应当在无效token时返回401', async () => {
      const response = await apiClient.get('/ai/models', {
        headers: { 'Authorization': 'Bearer invalid_token' }
      });

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('数据格式验证测试', () => {
    it('模型列表响应应包含必要字段', async () => {
      const response = await apiClient.get('/ai/models', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.status === 200 && response.data.data.length > 0) {
        const model = response.data.data[0];
        expect(model).toHaveProperty('id');
        expect(model).toHaveProperty('name');
        expect(model).toHaveProperty('type');
        expect(typeof model.id).toBe('number');
        expect(typeof model.name).toBe('string');
        expect(typeof model.type).toBe('string');
      }
    });

    it('默认模型响应应包含完整配置', async () => {
      const response = await apiClient.get('/ai/models/default', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.status === 200) {
        expect(response.data.data).toHaveProperty('id');
        expect(response.data.data).toHaveProperty('name');
        expect(response.data.data).toHaveProperty('type');
        expect(typeof response.data.data.id).toBe('number');
        expect(typeof response.data.data.name).toBe('string');
      }
    });

    it('计费规则响应应包含费率信息', async () => {
      const response = await apiClient.get('/ai/models/1/billing', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.status === 200 && response.data.data.length > 0) {
        const billing = response.data.data[0];
        expect(billing).toHaveProperty('model_id');
        expect(billing).toHaveProperty('pricing_type');
        expect(typeof billing.model_id).toBe('number');
        expect(typeof billing.pricing_type).toBe('string');
      }
    });
  });

  describe('性能测试', () => {
    it('获取模型列表API响应时间应在可接受范围内', async () => {
      const startTime = Date.now();
      
      const response = await apiClient.get('/ai/models', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(2000); // 响应时间应小于2秒
      expect([200]).toContain(response.status);
    });

    it('获取默认模型API响应时间应在可接受范围内', async () => {
      const startTime = Date.now();
      
      const response = await apiClient.get('/ai/models/default', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(1500); // 响应时间应小于1.5秒
      expect([200, 404]).toContain(response.status);
    });

    it('并发模型查询测试', async () => {
      const concurrentRequests = Array(3).fill(null).map(() => 
        apiClient.get('/ai/models', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );

      const startTime = Date.now();
      const responses = await Promise.all(concurrentRequests);
      const totalTime = Date.now() - startTime;

      expect(totalTime).toBeLessThan(5000); // 3个并发请求总时间应小于5秒
      responses.forEach(response => {
        expect([200]).toContain(response.status);
      });
    });

    it('模型统计查询性能测试', async () => {
      const startTime = Date.now();
      
      const response = await apiClient.get('/ai/model-management/stats/1', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(3000); // 统计查询响应时间应小于3秒
      expect([200, 404]).toContain(response.status);
    });
  });
});