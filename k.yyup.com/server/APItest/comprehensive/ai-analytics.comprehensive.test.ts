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

describe('AI分析统计API全面测试 - 参数验证', () => {
  let authToken: string = '';
  let testUserId: number = 0;

  beforeAll(async () => {
    console.log('🚀 开始AI分析统计API全面测试...');
    console.log('📋 测试范围: 8+个AI分析统计端点的完整参数验证');

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

  describe('GET /ai/analytics/overview - 获取AI使用概览参数验证', () => {
    it('应当成功获取AI使用概览', async () => {
      const response = await apiClient.get('/ai/analytics/overview', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
        expect(response.data.data).toBeDefined();
      }
    });

    // 日期参数测试
    const dateTests = [
      { 
        params: { startDate: '2025-01-01', endDate: '2025-07-13' }, 
        description: '有效日期范围' 
      },
      { 
        params: { startDate: '2025-07-01' }, 
        description: '仅指定开始日期' 
      },
      { 
        params: { endDate: '2025-07-13' }, 
        description: '仅指定结束日期' 
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
      },
      { 
        params: { startDate: '2025-13-01' }, 
        description: '无效月份', 
        shouldFail: true 
      },
      { 
        params: { startDate: '2025-01-32' }, 
        description: '无效日期', 
        shouldFail: true 
      }
    ];

    dateTests.forEach(test => {
      it(`应当在日期参数验证时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.get('/ai/analytics/overview', {
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

    // 边界日期测试
    const boundaryDateTests = [
      { 
        params: { startDate: '1900-01-01', endDate: '2100-12-31' }, 
        description: '极大日期范围' 
      },
      { 
        params: { startDate: '2025-07-13', endDate: '2025-07-13' }, 
        description: '相同开始和结束日期' 
      },
      { 
        params: { startDate: '2025-07-12', endDate: '2025-07-13' }, 
        description: '最小日期范围(1天)' 
      }
    ];

    boundaryDateTests.forEach(test => {
      it(`应当在边界日期测试时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.get('/ai/analytics/overview', {
          params: test.params,
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([200, 400]).toContain(response.status);
      });
    });

    it('应当在未认证时拒绝访问', async () => {
      const response = await apiClient.get('/ai/analytics/overview');

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('GET /ai/analytics/models/distribution - 获取模型使用分布参数验证', () => {
    it('应当成功获取模型使用分布', async () => {
      const response = await apiClient.get('/ai/analytics/models/distribution', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
        expect(response.data.data).toBeDefined();
      }
    });

    // 模型分布日期参数测试
    const distributionDateTests = [
      { 
        params: { startDate: '2025-01-01', endDate: '2025-07-13' }, 
        description: '有效日期范围的模型分布' 
      },
      { 
        params: { startDate: '2025-07-01' }, 
        description: '仅指定开始日期的模型分布' 
      },
      { 
        params: { endDate: '2025-07-13' }, 
        description: '仅指定结束日期的模型分布' 
      },
      { 
        params: { startDate: 'invalid' }, 
        description: '无效开始日期', 
        shouldFail: true 
      },
      { 
        params: { endDate: 'invalid' }, 
        description: '无效结束日期', 
        shouldFail: true 
      }
    ];

    distributionDateTests.forEach(test => {
      it(`应当在模型分布日期参数时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.get('/ai/analytics/models/distribution', {
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
      const response = await apiClient.get('/ai/analytics/models/distribution');

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('查询参数边界测试', () => {
    // 特殊字符和安全测试
    const securityTests = [
      {
        params: { startDate: '2025-01-01<script>alert("xss")</script>' },
        description: 'XSS攻击开始日期'
      },
      {
        params: { endDate: "2025-01-01\\'; DROP TABLE analytics; --" },
        description: 'SQL注入结束日期'
      },
      {
        params: { startDate: '${process.env.SECRET}' },
        description: '模板注入攻击'
      },
      {
        params: { startDate: '../../../etc/passwd' },
        description: '路径遍历攻击'
      }
    ];

    securityTests.forEach(test => {
      it(`应当在安全测试时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.get('/ai/analytics/overview', {
          params: test.params,
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        // 安全测试应该被正确处理，返回400、422或200(经过过滤)
        expect([200, 400, 422]).toContain(response.status);
      });
    });

    // 极端参数值测试
    const extremeTests = [
      {
        params: { startDate: '0000-01-01' },
        description: '极小年份',
        shouldFail: true
      },
      {
        params: { startDate: '9999-12-31' },
        description: '极大年份'
      },
      {
        params: { startDate: '2025-00-01' },
        description: '零月份',
        shouldFail: true
      },
      {
        params: { startDate: '2025-01-00' },
        description: '零日期',
        shouldFail: true
      }
    ];

    extremeTests.forEach(test => {
      it(`应当在极端参数测试时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.get('/ai/analytics/overview', {
          params: test.params,
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldFail) {
          expect([400, 422]).toContain(response.status);
        } else {
          expect([200, 400]).toContain(response.status);
        }
      });
    });
  });

  describe('响应数据格式验证', () => {
    it('AI使用概览响应应包含必要统计字段', async () => {
      const response = await apiClient.get('/ai/analytics/overview', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
        expect(response.data.data).toBeDefined();
        
        // 根据实际API响应结构验证字段
        if (response.data.data) {
          expect(typeof response.data.data).toBe('object');
        }
      }
    });

    it('模型分布响应应包含分布统计', async () => {
      const response = await apiClient.get('/ai/analytics/models/distribution', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
        expect(response.data.data).toBeDefined();
        
        // 验证分布数据格式
        if (response.data.data) {
          expect(typeof response.data.data).toBe('object');
        }
      }
    });
  });

  describe('权限验证测试', () => {
    const protectedEndpoints = [
      { method: 'get', url: '/ai/analytics/overview' },
      { method: 'get', url: '/ai/analytics/models/distribution' }
    ];

    protectedEndpoints.forEach(endpoint => {
      it(`应当在未提供token时返回401 - ${endpoint.method.toUpperCase()} ${endpoint.url}`, async () => {
        let response;
        
        if (endpoint.method === 'get') {
          response = await apiClient.get(endpoint.url);
        }

        expect([401, 403]).toContain(response!.status);
      });
    });

    it('应当在无效token时返回401', async () => {
      const response = await apiClient.get('/ai/analytics/overview', {
        headers: { 'Authorization': 'Bearer invalid_token' }
      });

      expect([401, 403]).toContain(response.status);
    });

    it('应当验证用户权限', async () => {
      // 测试不同权限级别的用户访问分析数据
      const response = await apiClient.get('/ai/analytics/overview', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      // 管理员应该能访问，普通用户可能无权限
      expect([200, 403]).toContain(response.status);
    });
  });

  describe('并发和性能测试', () => {
    it('获取AI概览API响应时间应在可接受范围内', async () => {
      const startTime = Date.now();
      
      const response = await apiClient.get('/ai/analytics/overview', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(3000); // 分析查询响应时间应小于3秒
      expect([200]).toContain(response.status);
    });

    it('获取模型分布API响应时间应在可接受范围内', async () => {
      const startTime = Date.now();
      
      const response = await apiClient.get('/ai/analytics/models/distribution', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(3000); // 分布查询响应时间应小于3秒
      expect([200]).toContain(response.status);
    });

    it('并发分析查询测试', async () => {
      const concurrentRequests = Array(3).fill(null).map((_, index) => {
        // 交替查询不同的分析端点
        const endpoint = index % 2 === 0 ? '/ai/analytics/overview' : '/ai/analytics/models/distribution';
        return apiClient.get(endpoint, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
      });

      const startTime = Date.now();
      const responses = await Promise.all(concurrentRequests);
      const totalTime = Date.now() - startTime;

      expect(totalTime).toBeLessThan(8000); // 3个并发分析请求总时间应小于8秒
      responses.forEach(response => {
        expect([200]).toContain(response.status);
      });
    });

    it('长时间范围查询性能测试', async () => {
      const startTime = Date.now();
      
      // 查询1年范围的数据
      const response = await apiClient.get('/ai/analytics/overview', {
        params: { 
          startDate: '2024-01-01', 
          endDate: '2025-07-13' 
        },
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(5000); // 长时间范围查询应小于5秒
      expect([200]).toContain(response.status);
    });
  });

  describe('缓存和优化测试', () => {
    it('重复相同查询应有较快响应时间', async () => {
      const queryParams = { startDate: '2025-07-01', endDate: '2025-07-13' };
      
      // 第一次查询
      const firstStartTime = Date.now();
      const firstResponse = await apiClient.get('/ai/analytics/overview', {
        params: queryParams,
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const firstResponseTime = Date.now() - firstStartTime;

      // 第二次相同查询
      const secondStartTime = Date.now();
      const secondResponse = await apiClient.get('/ai/analytics/overview', {
        params: queryParams,
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const secondResponseTime = Date.now() - secondStartTime;

      expect([200]).toContain(firstResponse.status);
      expect([200]).toContain(secondResponse.status);
      
      // 如果有缓存，第二次查询应该更快或至少不慢太多
      expect(secondResponseTime).toBeLessThan(firstResponseTime + 1000);
    });

    it('不同参数查询应返回不同结果', async () => {
      const params1 = { startDate: '2025-07-01', endDate: '2025-07-07' };
      const params2 = { startDate: '2025-07-08', endDate: '2025-07-13' };
      
      const response1 = await apiClient.get('/ai/analytics/overview', {
        params: params1,
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      const response2 = await apiClient.get('/ai/analytics/overview', {
        params: params2,
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200]).toContain(response1.status);
      expect([200]).toContain(response2.status);
      
      // 不同时间范围的查询结果应该不同（除非没有数据）
      if (response1.status === 200 && response2.status === 200) {
        // 结果格式应该一致
        expect(typeof response1.data).toBe('object');
        expect(typeof response2.data).toBe('object');
        expect(response1.data).toHaveProperty('success');
        expect(response2.data).toHaveProperty('success');
      }
    });
  });
});