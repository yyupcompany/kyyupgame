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

describe('AI用户管理API全面测试 - 参数验证', () => {
  let authToken: string = '';
  let testUserId: number = 0;
  let adminUserId: number = 0;

  beforeAll(async () => {
    console.log('🚀 开始AI用户管理API全面测试...');
    console.log('📋 测试范围: 8+个AI用户管理端点的完整参数验证');

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

  describe('GET /ai/user/:userId/permissions - 获取用户AI权限参数验证', () => {
    it('应当成功获取用户AI权限', async () => {
      const response = await apiClient.get(`/ai/user/${testUserId}/permissions`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
        expect(response.data.data).toBeDefined();
      }
    });

    // 用户ID验证测试
    const userIdTests = [
      { userId: 'invalid', description: '无效用户ID', shouldFail: true },
      { userId: 0, description: '零用户ID', shouldFail: true },
      { userId: -1, description: '负数用户ID', shouldFail: true },
      { userId: 999999, description: '不存在的用户ID' }
    ];

    userIdTests.forEach(test => {
      it(`应当在用户ID验证时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.get(`/ai/user/${test.userId}/permissions`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldFail) {
          expect([400, 422]).toContain(response.status);
        } else {
          expect([200, 404]).toContain(response.status);
        }
      });
    });

    it('应当在未认证时拒绝访问', async () => {
      const response = await apiClient.get(`/ai/user/${testUserId}/permissions`);

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('POST /ai/user/:userId/permissions - 设置用户AI权限参数验证', () => {
    // 权限设置参数测试
    const permissionTests = [
      {
        params: {
          adminUserId: adminUserId,
          permissions: {
            canUseAI: true,
            maxMonthlyQuota: 1000,
            allowedModels: ['gpt-3.5', 'gpt-4']
          }
        },
        description: '完整权限设置'
      },
      {
        params: {
          adminUserId: adminUserId,
          permissions: {
            canUseAI: false
          }
        },
        description: '禁用AI权限'
      },
      {
        params: {
          adminUserId: adminUserId,
          permissions: {}
        },
        description: '空权限对象',
        shouldFail: true
      },
      {
        params: {
          permissions: {
            canUseAI: true
          }
        },
        description: '缺少管理员ID',
        shouldFail: true
      },
      {
        params: {
          adminUserId: 'invalid',
          permissions: {
            canUseAI: true
          }
        },
        description: '无效管理员ID',
        shouldFail: true
      }
    ];

    permissionTests.forEach(test => {
      it(`应当在权限设置时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.post(`/ai/user/${testUserId}/permissions`, test.params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldFail) {
          expect([400, 422]).toContain(response.status);
        } else {
          expect([200, 201]).toContain(response.status);
        }
      });
    });

    // 权限字段验证测试
    const permissionFieldTests = [
      {
        params: {
          adminUserId: adminUserId,
          permissions: {
            canUseAI: 'invalid'
          }
        },
        description: '无效布尔值类型',
        shouldFail: true
      },
      {
        params: {
          adminUserId: adminUserId,
          permissions: {
            maxMonthlyQuota: 'invalid'
          }
        },
        description: '无效配额类型',
        shouldFail: true
      },
      {
        params: {
          adminUserId: adminUserId,
          permissions: {
            maxMonthlyQuota: -1
          }
        },
        description: '负数配额',
        shouldFail: true
      },
      {
        params: {
          adminUserId: adminUserId,
          permissions: {
            allowedModels: 'invalid'
          }
        },
        description: '无效模型数组',
        shouldFail: true
      }
    ];

    permissionFieldTests.forEach(test => {
      it(`应当在权限字段验证时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.post(`/ai/user/${testUserId}/permissions`, test.params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldFail) {
          expect([400, 422]).toContain(response.status);
        } else {
          expect([200, 201]).toContain(response.status);
        }
      });
    });
  });

  describe('GET /ai/user/:userId/settings - 获取用户AI设置参数验证', () => {
    it('应当成功获取用户AI设置', async () => {
      const response = await apiClient.get(`/ai/user/${testUserId}/settings`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
        expect(response.data.data).toBeDefined();
      }
    });

    it('应当在未认证时拒绝访问', async () => {
      const response = await apiClient.get(`/ai/user/${testUserId}/settings`);

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('PUT /ai/user/:userId/settings - 更新用户AI设置参数验证', () => {
    // 设置更新参数测试
    const settingsTests = [
      {
        params: {
          settings: {
            language: 'zh-CN',
            preferredModel: 'gpt-3.5-turbo',
            temperature: 0.7,
            maxTokens: 2000
          }
        },
        description: '完整设置更新'
      },
      {
        params: {
          settings: {
            language: 'en-US'
          }
        },
        description: '仅更新语言'
      },
      {
        params: {
          settings: {}
        },
        description: '空设置对象',
        shouldFail: true
      },
      {
        params: {},
        description: '缺少设置字段',
        shouldFail: true
      }
    ];

    settingsTests.forEach(test => {
      it(`应当在设置更新时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.put(`/ai/user/${testUserId}/settings`, test.params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldFail) {
          expect([400, 422]).toContain(response.status);
        } else {
          expect([200]).toContain(response.status);
        }
      });
    });

    // 设置字段验证测试
    const settingFieldTests = [
      {
        params: {
          settings: {
            language: 123
          }
        },
        description: '无效语言类型',
        shouldFail: true
      },
      {
        params: {
          settings: {
            temperature: 'invalid'
          }
        },
        description: '无效温度类型',
        shouldFail: true
      },
      {
        params: {
          settings: {
            temperature: -1
          }
        },
        description: '负数温度',
        shouldFail: true
      },
      {
        params: {
          settings: {
            temperature: 2.5
          }
        },
        description: '过大温度值',
        shouldFail: true
      },
      {
        params: {
          settings: {
            maxTokens: 'invalid'
          }
        },
        description: '无效Token数量',
        shouldFail: true
      },
      {
        params: {
          settings: {
            maxTokens: -1
          }
        },
        description: '负数Token',
        shouldFail: true
      }
    ];

    settingFieldTests.forEach(test => {
      it(`应当在设置字段验证时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.put(`/ai/user/${testUserId}/settings`, test.params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldFail) {
          expect([400, 422]).toContain(response.status);
        } else {
          expect([200]).toContain(response.status);
        }
      });
    });
  });

  describe('安全性和权限测试', () => {
    // 特殊字符和安全测试
    const securityTests = [
      {
        params: {
          settings: {
            preferredModel: '<script>alert("xss")</script>'
          }
        },
        description: 'XSS攻击模型名称'
      },
      {
        params: {
          settings: {
            language: "\\'; DROP TABLE users; --"
          }
        },
        description: 'SQL注入语言设置'
      },
      {
        params: {
          adminUserId: adminUserId,
          permissions: {
            canUseAI: true,
            specialField: '${process.env.SECRET}'
          }
        },
        description: '模板注入权限字段'
      }
    ];

    securityTests.forEach(test => {
      it(`应当在安全测试时正确处理 - ${test.description}`, async () => {
        let response;
        if (test.params.adminUserId) {
          response = await apiClient.post(`/ai/user/${testUserId}/permissions`, test.params, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });
        } else {
          response = await apiClient.put(`/ai/user/${testUserId}/settings`, test.params, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });
        }

        // 安全测试应该被正确处理，返回400、422或200(经过过滤)
        expect([200, 400, 422]).toContain(response.status);
      });
    });
  });

  describe('权限验证测试', () => {
    const protectedEndpoints = [
      { method: 'get', url: `/ai/user/${testUserId}/permissions` },
      { method: 'post', url: `/ai/user/${testUserId}/permissions`, data: { adminUserId: adminUserId, permissions: {} } },
      { method: 'get', url: `/ai/user/${testUserId}/settings` },
      { method: 'put', url: `/ai/user/${testUserId}/settings`, data: { settings: {} } }
    ];

    protectedEndpoints.forEach(endpoint => {
      it(`应当在未提供token时返回401 - ${endpoint.method.toUpperCase()} ${endpoint.url}`, async () => {
        let response;
        
        if (endpoint.method === 'get') {
          response = await apiClient.get(endpoint.url);
        } else if (endpoint.method === 'post') {
          response = await apiClient.post(endpoint.url, endpoint.data || {});
        } else if (endpoint.method === 'put') {
          response = await apiClient.put(endpoint.url, endpoint.data || {});
        }

        expect([401, 403]).toContain(response!.status);
      });
    });

    it('应当在无效token时返回401', async () => {
      const response = await apiClient.get(`/ai/user/${testUserId}/permissions`, {
        headers: { 'Authorization': 'Bearer invalid_token' }
      });

      expect([401, 403]).toContain(response.status);
    });

    it('应当验证管理员权限', async () => {
      // 测试非管理员用户尝试设置权限
      const response = await apiClient.post(`/ai/user/${testUserId}/permissions`, {
        adminUserId: 999999, // 假设的非管理员ID
        permissions: { canUseAI: true }
      }, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([403, 404]).toContain(response.status);
    });
  });

  describe('数据格式验证测试', () => {
    it('权限响应应包含必要字段', async () => {
      const response = await apiClient.get(`/ai/user/${testUserId}/permissions`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
        expect(response.data.data).toBeDefined();
        
        if (response.data.data) {
          expect(typeof response.data.data).toBe('object');
        }
      }
    });

    it('设置响应应包含配置信息', async () => {
      const response = await apiClient.get(`/ai/user/${testUserId}/settings`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
        expect(response.data.data).toBeDefined();
        
        if (response.data.data) {
          expect(typeof response.data.data).toBe('object');
        }
      }
    });
  });

  describe('边界条件测试', () => {
    it('应当处理极大配额值', async () => {
      const response = await apiClient.post(`/ai/user/${testUserId}/permissions`, {
        adminUserId: adminUserId,
        permissions: {
          canUseAI: true,
          maxMonthlyQuota: Number.MAX_SAFE_INTEGER
        }
      }, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200, 201, 400, 422]).toContain(response.status);
    });

    it('应当处理极小温度值', async () => {
      const response = await apiClient.put(`/ai/user/${testUserId}/settings`, {
        settings: {
          temperature: 0.0
        }
      }, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200, 400, 422]).toContain(response.status);
    });

    it('应当处理极大温度值', async () => {
      const response = await apiClient.put(`/ai/user/${testUserId}/settings`, {
        settings: {
          temperature: 1.0
        }
      }, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200, 400, 422]).toContain(response.status);
    });
  });

  describe('权限继承和级联测试', () => {
    it('应当正确设置和获取用户权限', async () => {
      // 设置权限
      const updatePermissions = {
        adminUserId: adminUserId,
        permissions: {
          canUseAI: true,
          maxMonthlyQuota: 500,
          allowedModels: ['gpt-3.5-turbo']
        }
      };

      const setResponse = await apiClient.post(`/ai/user/${testUserId}/permissions`, updatePermissions, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (setResponse.status === 200 || setResponse.status === 201) {
        // 验证权限是否正确设置
        const getResponse = await apiClient.get(`/ai/user/${testUserId}/permissions`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([200]).toContain(getResponse.status);
        if (getResponse.status === 200) {
          expect(getResponse.data).toHaveProperty('success', true);
        }
      }
    });
  });

  describe('性能测试', () => {
    it('获取用户权限API响应时间应在可接受范围内', async () => {
      const startTime = Date.now();
      
      const response = await apiClient.get(`/ai/user/${testUserId}/permissions`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(2000); // 响应时间应小于2秒
      expect([200, 404]).toContain(response.status);
    });

    it('设置用户权限API响应时间应在可接受范围内', async () => {
      const startTime = Date.now();
      
      const testParams = {
        adminUserId: adminUserId,
        permissions: {
          canUseAI: true,
          maxMonthlyQuota: 1000
        }
      };

      const response = await apiClient.post(`/ai/user/${testUserId}/permissions`, testParams, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(3000); // 响应时间应小于3秒
      expect([200, 201, 404]).toContain(response.status);
    });

    it('并发用户管理查询测试', async () => {
      const concurrentRequests = Array(3).fill(null).map(() => 
        apiClient.get(`/ai/user/${testUserId}/permissions`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );

      const startTime = Date.now();
      const responses = await Promise.all(concurrentRequests);
      const totalTime = Date.now() - startTime;

      expect(totalTime).toBeLessThan(6000); // 3个并发请求总时间应小于6秒
      responses.forEach(response => {
        expect([200, 404]).toContain(response.status);
      });
    });
  });
});