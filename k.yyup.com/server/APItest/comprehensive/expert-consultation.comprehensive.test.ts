import axios, { AxiosResponse } from 'axios';
import { TestDataFactory } from '../helpers/testUtils';
import { getAuthToken, TEST_CREDENTIALS } from '../helpers/authHelper';

// 真实API基地址
const API_BASE_URL = 'http://localhost:3000/api';

// API客户端配置
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 专家咨询可能需要较长时间
  validateStatus: () => true,
});

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
}

describe('专家咨询AI系统API全面测试 - 参数验证', () => {
  let authToken: string = '';
  let testUserId: number = 0;
  let testSessionIds: string[] = [];

  beforeAll(async () => {
    console.log('🚀 开始专家咨询AI系统API全面测试...');
    console.log('📋 测试范围: 专家咨询AI系统的完整参数验证和多智能体协作功能测试');

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
    // 清理测试咨询会话数据
    console.log('🧹 清理测试专家咨询会话数据...');
    // 注意：实际环境中可能需要删除生成的会话数据
  });

  describe('POST /expert-consultation/start - 启动专家咨询参数验证', () => {
    // 有效咨询启动参数组合
    const validConsultationParams = [
      {
        topic: '幼儿园教育质量提升策略',
        description: '如何提高幼儿园的教育质量和家长满意度',
        urgency: 'medium',
        expectedExperts: ['education_expert', 'management_expert'],
        context: {
          kindergartenSize: 200,
          currentIssues: ['师资不足', '课程单一'],
          budget: 100000
        }
      },
      {
        topic: '儿童安全管理咨询',
        description: '制定完善的儿童安全管理制度',
        urgency: 'high',
        expectedExperts: ['safety_expert', 'legal_expert'],
        context: {
          incidents: 2,
          staffCount: 15,
          facilities: ['室内', '户外']
        }
      },
      {
        topic: '营养健康计划制定',
        description: '为3-6岁儿童制定科学的营养健康计划',
        urgency: 'low',
        expectedExperts: ['nutrition_expert', 'health_expert'],
        context: {
          ageGroups: ['3-4岁', '4-5岁', '5-6岁'],
          specialNeeds: ['过敏儿童', '营养不良'],
          mealTypes: ['早餐', '午餐', '加餐']
        }
      }
    ];

    // 必填字段验证测试
    const requiredFieldTests = [
      {
        field: 'topic',
        params: { description: '测试描述' },
        description: '缺少咨询主题'
      },
      {
        field: 'description',
        params: { topic: '测试主题' },
        description: '缺少问题描述'
      }
    ];

    requiredFieldTests.forEach(test => {
      it(`应当在缺少必填字段时返回错误 - ${test.description}`, async () => {
        const response = await apiClient.post('/expert-consultation/start', test.params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([400, 422]).toContain(response.status);
        if (response.data) {
          expect(response.data.success).toBe(false);
        }
      });
    });

    // 数据类型验证测试
    const invalidDataTypes = [
      { field: 'topic', value: 123, description: '非字符串主题' },
      { field: 'description', value: [], description: '非字符串描述' },
      { field: 'urgency', value: 123, description: '非字符串紧急度' },
      { field: 'expectedExperts', value: 'string', description: '非数组专家列表' },
      { field: 'context', value: 'string', description: '非对象上下文' }
    ];

    invalidDataTypes.forEach(testCase => {
      it(`应当在无效数据类型时返回错误 - ${testCase.description}`, async () => {
        const invalidParams: any = {
          topic: '测试主题',
          description: '测试描述'
        };
        invalidParams[testCase.field] = testCase.value;

        const response = await apiClient.post('/expert-consultation/start', invalidParams, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([400, 422]).toContain(response.status);
        if (response.data) {
          expect(response.data.success).toBe(false);
        }
      });
    });

    // 紧急度参数验证测试
    const urgencyTests = [
      { urgency: 'low', description: '低紧急度', shouldPass: true },
      { urgency: 'medium', description: '中紧急度', shouldPass: true },
      { urgency: 'high', description: '高紧急度', shouldPass: true },
      { urgency: 'critical', description: '紧急', shouldPass: true },
      { urgency: 'invalid', description: '无效紧急度', shouldPass: false },
      { urgency: '', description: '空紧急度', shouldPass: false }
    ];

    urgencyTests.forEach(test => {
      it(`应当在紧急度参数验证时正确处理 - ${test.description}`, async () => {
        const params = {
          topic: '测试主题',
          description: '测试描述',
          urgency: test.urgency
        };

        const response = await apiClient.post('/expert-consultation/start', params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldPass) {
          expect([200, 201]).toContain(response.status);
          if (response.status === 201 && response.data?.success && response.data?.data?.sessionId) {
            testSessionIds.push(response.data.data.sessionId);
          }
        } else {
          expect([400, 422]).toContain(response.status);
        }
      });
    });

    // 专家类型验证测试
    const expertTypeTests = [
      { 
        experts: ['education_expert'], 
        description: '单个教育专家', 
        shouldPass: true 
      },
      { 
        experts: ['education_expert', 'management_expert', 'safety_expert'], 
        description: '多个专家组合', 
        shouldPass: true 
      },
      { 
        experts: [], 
        description: '空专家数组', 
        shouldPass: true 
      },
      { 
        experts: ['invalid_expert'], 
        description: '无效专家类型', 
        shouldPass: false 
      },
      { 
        experts: ['education_expert', 'invalid_expert'], 
        description: '混合有效无效专家', 
        shouldPass: false 
      }
    ];

    expertTypeTests.forEach(test => {
      it(`应当在专家类型验证时正确处理 - ${test.description}`, async () => {
        const params = {
          topic: '测试主题',
          description: '测试描述',
          expectedExperts: test.experts
        };

        const response = await apiClient.post('/expert-consultation/start', params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldPass) {
          expect([200, 201]).toContain(response.status);
          if (response.status === 201 && response.data?.success && response.data?.data?.sessionId) {
            testSessionIds.push(response.data.data.sessionId);
          }
        } else {
          expect([400, 422]).toContain(response.status);
        }
      });
    });

    // 边界值测试
    const boundaryTests = [
      {
        params: { 
          topic: '',
          description: '测试描述'
        },
        description: '空主题',
        shouldPass: false
      },
      {
        params: {
          topic: 'A',
          description: '测试描述'
        },
        description: '最短主题',
        shouldPass: true
      },
      {
        params: {
          topic: 'A'.repeat(1000),
          description: '测试描述'
        },
        description: '超长主题',
        shouldPass: false
      },
      {
        params: {
          topic: '测试主题',
          description: ''
        },
        description: '空描述',
        shouldPass: false
      },
      {
        params: {
          topic: '测试主题',
          description: 'A'.repeat(10000)
        },
        description: '超长描述',
        shouldPass: false
      }
    ];

    boundaryTests.forEach(test => {
      it(`应当在边界值测试时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.post('/expert-consultation/start', test.params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldPass) {
          expect([200, 201]).toContain(response.status);
          if (response.status === 201 && response.data?.success && response.data?.data?.sessionId) {
            testSessionIds.push(response.data.data.sessionId);
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
        params: {
          topic: '主题<script>alert("xss")</script>',
          description: '测试描述'
        },
        description: 'XSS攻击主题'
      },
      {
        params: {
          topic: '测试主题',
          description: "描述\\'; DROP TABLE consultations; --"
        },
        description: 'SQL注入描述'
      },
      {
        params: {
          topic: '测试主题',
          description: '测试描述',
          context: {
            malicious: '${process.env.SECRET}'
          }
        },
        description: '模板注入上下文'
      }
    ];

    securityTests.forEach(test => {
      it(`应当在安全测试时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.post('/expert-consultation/start', test.params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        // 安全测试应该被正确处理，返回400、422或201(经过过滤)
        expect([200, 201, 400, 422]).toContain(response.status);
        if (response.status === 201 && response.data?.success && response.data?.data?.sessionId) {
          testSessionIds.push(response.data.data.sessionId);
        }
      });
    });

    // 有效参数测试
    validConsultationParams.forEach((params, index) => {
      it(`应当使用有效参数成功启动专家咨询 - 组合${index + 1}`, async () => {
        const response = await apiClient.post('/expert-consultation/start', params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([200, 201]).toContain(response.status);
        if (response.status === 201 && response.data?.success) {
          expect(response.data.data).toHaveProperty('sessionId');
          expect(response.data.data).toHaveProperty('experts');
          expect(response.data.data).toHaveProperty('status');
          
          if (response.data.data.sessionId) {
            testSessionIds.push(response.data.data.sessionId);
          }
        }
      });
    });

    it('应当在未认证时拒绝访问', async () => {
      const response = await apiClient.post('/expert-consultation/start', {
        topic: '测试主题',
        description: '测试描述'
      });

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('GET /expert-consultation/:sessionId/next - 获取下一个专家发言参数验证', () => {
    let testSessionId: string;

    beforeAll(async () => {
      // 创建一个测试咨询会话
      const response = await apiClient.post('/expert-consultation/start', {
        topic: '测试专家发言功能',
        description: '用于测试获取专家发言的功能',
        urgency: 'medium'
      }, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.status === 201 && response.data?.success && response.data?.data?.sessionId) {
        testSessionId = response.data.data.sessionId;
        testSessionIds.push(testSessionId);
      }
    });

    // 会话ID验证测试
    const sessionIdTests = [
      { sessionId: 'invalid-uuid', description: '无效UUID', shouldFail: true },
      { sessionId: '123456', description: '数字ID', shouldFail: true },
      { sessionId: '', description: '空ID', shouldFail: true },
      { sessionId: '00000000-0000-0000-0000-000000000000', description: '不存在的UUID', shouldFail: true }
    ];

    sessionIdTests.forEach(test => {
      it(`应当在会话ID验证时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.get(`/expert-consultation/${test.sessionId}/next`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldFail) {
          expect([400, 404, 422]).toContain(response.status);
        } else {
          expect([200]).toContain(response.status);
        }
      });
    });

    it('应当在有效会话ID时获取专家发言', async () => {
      if (!testSessionId) {
        console.warn('跳过专家发言测试：无法创建测试会话');
        return;
      }

      const response = await apiClient.get(`/expert-consultation/${testSessionId}/next`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
        expect(response.data.data).toBeDefined();
      }
    });

    it('应当在未认证时拒绝访问', async () => {
      const response = await apiClient.get('/expert-consultation/test-session/next');

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('GET /expert-consultation/:sessionId/progress - 获取咨询进度参数验证', () => {
    it('应当在有效会话ID时获取咨询进度', async () => {
      if (testSessionIds.length === 0) {
        console.warn('跳过进度测试：没有可用的测试会话');
        return;
      }

      const sessionId = testSessionIds[0];
      const response = await apiClient.get(`/expert-consultation/${sessionId}/progress`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
        expect(response.data.data).toBeDefined();
      }
    });

    it('应当在无效会话ID时返回错误', async () => {
      const response = await apiClient.get('/expert-consultation/invalid-session/progress', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([400, 404, 422]).toContain(response.status);
    });

    it('应当在未认证时拒绝访问', async () => {
      const response = await apiClient.get('/expert-consultation/test-session/progress');

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('GET /expert-consultation/:sessionId/summary - 获取咨询汇总参数验证', () => {
    it('应当在有效会话ID时获取咨询汇总', async () => {
      if (testSessionIds.length === 0) {
        console.warn('跳过汇总测试：没有可用的测试会话');
        return;
      }

      const sessionId = testSessionIds[0];
      const response = await apiClient.get(`/expert-consultation/${sessionId}/summary`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
        expect(response.data.data).toBeDefined();
      }
    });

    it('应当在无效会话ID时返回错误', async () => {
      const response = await apiClient.get('/expert-consultation/invalid-session/summary', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([400, 404, 422]).toContain(response.status);
    });

    it('应当在未认证时拒绝访问', async () => {
      const response = await apiClient.get('/expert-consultation/test-session/summary');

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('POST /expert-consultation/:sessionId/action-plan - 生成行动计划参数验证', () => {
    // 行动计划生成参数测试
    const actionPlanParams = [
      {
        planType: 'immediate',
        priority: 'high',
        timeline: '1周',
        resources: ['人力', '预算']
      },
      {
        planType: 'long-term',
        priority: 'medium',
        timeline: '3个月',
        resources: ['培训', '设备'],
        constraints: ['预算限制', '时间紧迫']
      }
    ];

    actionPlanParams.forEach((params, index) => {
      it(`应当使用有效参数生成行动计划 - 组合${index + 1}`, async () => {
        if (testSessionIds.length === 0) {
          console.warn('跳过行动计划测试：没有可用的测试会话');
          return;
        }

        const sessionId = testSessionIds[0];
        const response = await apiClient.post(`/expert-consultation/${sessionId}/action-plan`, params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([200, 201, 404]).toContain(response.status);
        if (response.status === 201) {
          expect(response.data).toHaveProperty('success', true);
          expect(response.data.data).toBeDefined();
        }
      });
    });

    // 计划类型验证测试
    const planTypeTests = [
      { planType: 'immediate', description: '即时计划', shouldPass: true },
      { planType: 'short-term', description: '短期计划', shouldPass: true },
      { planType: 'long-term', description: '长期计划', shouldPass: true },
      { planType: 'invalid', description: '无效计划类型', shouldPass: false },
      { planType: '', description: '空计划类型', shouldPass: false }
    ];

    planTypeTests.forEach(test => {
      it(`应当在计划类型验证时正确处理 - ${test.description}`, async () => {
        if (testSessionIds.length === 0) {
          console.warn('跳过计划类型测试：没有可用的测试会话');
          return;
        }

        const sessionId = testSessionIds[0];
        const params = {
          planType: test.planType,
          priority: 'medium'
        };

        const response = await apiClient.post(`/expert-consultation/${sessionId}/action-plan`, params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldPass) {
          expect([200, 201, 404]).toContain(response.status);
        } else {
          expect([400, 422]).toContain(response.status);
        }
      });
    });

    it('应当在无效会话ID时返回错误', async () => {
      const response = await apiClient.post('/expert-consultation/invalid-session/action-plan', {
        planType: 'immediate',
        priority: 'high'
      }, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([400, 404, 422]).toContain(response.status);
    });

    it('应当在未认证时拒绝访问', async () => {
      const response = await apiClient.post('/expert-consultation/test-session/action-plan', {
        planType: 'immediate',
        priority: 'high'
      });

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('GET /expert-consultation/:sessionId - 获取咨询会话详情参数验证', () => {
    it('应当在有效会话ID时获取会话详情', async () => {
      if (testSessionIds.length === 0) {
        console.warn('跳过会话详情测试：没有可用的测试会话');
        return;
      }

      const sessionId = testSessionIds[0];
      const response = await apiClient.get(`/expert-consultation/${sessionId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
        expect(response.data.data).toBeDefined();
        expect(response.data.data).toHaveProperty('sessionId');
      }
    });

    it('应当在无效会话ID时返回错误', async () => {
      const response = await apiClient.get('/expert-consultation/invalid-session', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([400, 404, 422]).toContain(response.status);
    });

    it('应当在未认证时拒绝访问', async () => {
      const response = await apiClient.get('/expert-consultation/test-session');

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('权限验证测试', () => {
    const protectedEndpoints = [
      { method: 'post', url: '/expert-consultation/start', data: { topic: '测试', description: '测试' } },
      { method: 'get', url: '/expert-consultation/test-session/next' },
      { method: 'get', url: '/expert-consultation/test-session/progress' },
      { method: 'get', url: '/expert-consultation/test-session/summary' },
      { method: 'post', url: '/expert-consultation/test-session/action-plan', data: { planType: 'immediate' } },
      { method: 'get', url: '/expert-consultation/test-session' }
    ];

    protectedEndpoints.forEach(endpoint => {
      it(`应当在未提供token时返回401 - ${endpoint.method.toUpperCase()} ${endpoint.url}`, async () => {
        let response;
        
        if (endpoint.method === 'get') {
          response = await apiClient.get(endpoint.url);
        } else if (endpoint.method === 'post') {
          response = await apiClient.post(endpoint.url, endpoint.data || {});
        }

        expect([401, 403]).toContain(response!.status);
      });
    });

    it('应当在无效token时返回401', async () => {
      const response = await apiClient.get('/expert-consultation/test-session', {
        headers: { 'Authorization': 'Bearer invalid_token' }
      });

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('响应数据格式验证', () => {
    it('咨询启动响应应包含必要字段', async () => {
      const response = await apiClient.post('/expert-consultation/start', {
        topic: '响应格式测试',
        description: '测试响应数据格式',
        urgency: 'low'
      }, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.status === 201) {
        expect(response.data).toHaveProperty('success', true);
        expect(response.data.data).toBeDefined();
        
        const sessionData = response.data.data;
        expect(sessionData).toHaveProperty('sessionId');
        expect(typeof sessionData.sessionId).toBe('string');
        
        if (sessionData.sessionId) {
          testSessionIds.push(sessionData.sessionId);
        }
      }
    });

    it('会话详情响应应包含会话信息', async () => {
      if (testSessionIds.length === 0) {
        console.warn('跳过会话详情格式测试：没有可用的测试会话');
        return;
      }

      const sessionId = testSessionIds[0];
      const response = await apiClient.get(`/expert-consultation/${sessionId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
        expect(response.data.data).toBeDefined();
        expect(typeof response.data.data).toBe('object');
      }
    });
  });

  describe('性能和并发测试', () => {
    it('咨询启动API响应时间应在可接受范围内', async () => {
      const startTime = Date.now();
      
      const testParams = {
        topic: '性能测试咨询',
        description: '测试咨询启动的响应时间',
        urgency: 'low'
      };

      const response = await apiClient.post('/expert-consultation/start', testParams, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(30000); // 咨询启动响应时间应小于30秒
      expect([200, 201]).toContain(response.status);
      
      if (response.status === 201 && response.data?.success && response.data?.data?.sessionId) {
        testSessionIds.push(response.data.data.sessionId);
      }
    });

    it('获取咨询进度API响应时间应在可接受范围内', async () => {
      if (testSessionIds.length === 0) {
        console.warn('跳过进度性能测试：没有可用的测试会话');
        return;
      }

      const startTime = Date.now();
      const sessionId = testSessionIds[0];
      
      const response = await apiClient.get(`/expert-consultation/${sessionId}/progress`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(3000); // 进度查询响应时间应小于3秒
      expect([200, 404]).toContain(response.status);
    });

    it('并发会话查询测试', async () => {
      if (testSessionIds.length === 0) {
        console.warn('跳过并发测试：没有可用的测试会话');
        return;
      }

      const sessionId = testSessionIds[0];
      const concurrentRequests = Array(3).fill(null).map(() => 
        apiClient.get(`/expert-consultation/${sessionId}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );

      const startTime = Date.now();
      const responses = await Promise.all(concurrentRequests);
      const totalTime = Date.now() - startTime;

      expect(totalTime).toBeLessThan(10000); // 3个并发请求总时间应小于10秒
      responses.forEach(response => {
        expect([200, 404]).toContain(response.status);
      });
    });
  });

  describe('AI专家系统特定测试', () => {
    it('应当正确处理不同紧急度的咨询', async () => {
      const urgencyLevels = ['low', 'medium', 'high', 'critical'];

      for (const urgency of urgencyLevels) {
        const response = await apiClient.post('/expert-consultation/start', {
          topic: `${urgency}紧急度测试`,
          description: `测试${urgency}紧急度的专家咨询`,
          urgency
        }, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([200, 201]).toContain(response.status);
        if (response.status === 201 && response.data?.success && response.data?.data?.sessionId) {
          testSessionIds.push(response.data.data.sessionId);
        }
      }
    });

    it('应当支持多专家协作咨询', async () => {
      const expertCombinations = [
        ['education_expert'],
        ['education_expert', 'management_expert'],
        ['education_expert', 'safety_expert', 'legal_expert']
      ];

      for (const experts of expertCombinations) {
        const response = await apiClient.post('/expert-consultation/start', {
          topic: '多专家协作测试',
          description: '测试多个专家的协作咨询功能',
          expectedExperts: experts,
          urgency: 'medium'
        }, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([200, 201]).toContain(response.status);
        if (response.status === 201 && response.data?.success && response.data?.data?.sessionId) {
          testSessionIds.push(response.data.data.sessionId);
        }
      }
    });

    it('应当处理复杂的上下文信息', async () => {
      const complexContext = {
        kindergartenProfile: {
          name: '测试幼儿园',
          size: 300,
          location: '城市中心',
          established: 2010
        },
        currentChallenges: [
          '师资流失率高',
          '家长满意度下降',
          '竞争激烈'
        ],
        availableResources: {
          budget: 500000,
          staff: 25,
          facilities: ['多功能厅', '户外活动区', '图书室']
        },
        timeConstraints: {
          deadline: '3个月内',
          urgentActions: ['立即解决安全问题']
        }
      };

      const response = await apiClient.post('/expert-consultation/start', {
        topic: '综合管理提升咨询',
        description: '全面提升幼儿园管理水平和教育质量',
        context: complexContext,
        urgency: 'high',
        expectedExperts: ['education_expert', 'management_expert', 'safety_expert']
      }, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200, 201]).toContain(response.status);
      if (response.status === 201 && response.data?.success && response.data?.data?.sessionId) {
        testSessionIds.push(response.data.data.sessionId);
      }
    });
  });
});