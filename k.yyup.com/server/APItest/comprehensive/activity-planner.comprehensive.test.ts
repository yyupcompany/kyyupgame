import axios, { AxiosResponse } from 'axios';
import { TestDataFactory } from '../helpers/testUtils';
import { getAuthToken, TEST_CREDENTIALS } from '../helpers/authHelper';

// 真实API基地址
const API_BASE_URL = 'http://localhost:3000/api';

// API客户端配置
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // AI生成需要更长时间
  validateStatus: () => true,
});

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
}

describe('活动策划AI智能体API全面测试 - 参数验证', () => {
  let authToken: string = '';
  let testUserId: number = 0;
  let generatedPlanIds: string[] = [];

  beforeAll(async () => {
    console.log('🚀 开始活动策划AI智能体API全面测试...');
    console.log('📋 测试范围: 活动策划AI智能体的完整参数验证和功能性测试');

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
    // 清理生成的策划方案数据
    console.log('🧹 清理测试活动策划数据...');
    // 注意：实际环境中可能需要删除生成的文件和数据库记录
  });

  describe('POST /activity-planner/generate - AI活动策划方案生成参数验证', () => {
    // 有效策划请求参数组合
    const validPlanningParams = [
      {
        activityType: '儿童生日派对',
        targetAudience: '3-6岁儿童',
        budget: 5000,
        duration: '2小时',
        location: '室内游乐场',
        requirements: ['需要摄影', '准备生日蛋糕'],
        preferredStyle: 'fun'
      },
      {
        activityType: '团队建设活动',
        targetAudience: '公司员工',
        budget: 10000,
        duration: '半天',
        location: '户外拓展基地',
        requirements: ['团队协作游戏', '午餐安排'],
        preferredStyle: 'professional'
      },
      {
        activityType: '科学实验课',
        targetAudience: '小学生',
        budget: 3000,
        duration: '1.5小时',
        location: '学校实验室',
        requirements: ['安全实验', '教具准备'],
        preferredStyle: 'educational'
      },
      {
        activityType: '艺术创作工作坊',
        targetAudience: '艺术爱好者',
        budget: 8000,
        duration: '3小时',
        location: '艺术工作室',
        requirements: ['提供画材', '作品展示'],
        preferredStyle: 'creative'
      }
    ];

    // 必填字段验证测试
    const requiredFieldTests = [
      {
        field: 'activityType',
        params: { targetAudience: '3-6岁儿童' },
        description: '缺少活动类型'
      },
      {
        field: 'targetAudience', 
        params: { activityType: '生日派对' },
        description: '缺少目标受众'
      }
    ];

    requiredFieldTests.forEach(test => {
      it(`应当在缺少必填字段时返回错误 - ${test.description}`, async () => {
        const response = await apiClient.post('/activity-planner/generate', test.params, {
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
      { field: 'activityType', value: 123, description: '非字符串活动类型' },
      { field: 'targetAudience', value: [], description: '非字符串目标受众' },
      { field: 'budget', value: 'invalid', description: '非数字预算' },
      { field: 'duration', value: 123, description: '非字符串时长' },
      { field: 'location', value: true, description: '非字符串地点' },
      { field: 'requirements', value: 'string', description: '非数组要求' },
      { field: 'preferredStyle', value: 123, description: '非字符串风格' }
    ];

    invalidDataTypes.forEach(testCase => {
      it(`应当在无效数据类型时返回错误 - ${testCase.description}`, async () => {
        const invalidParams: any = {
          activityType: '测试活动',
          targetAudience: '测试受众'
        };
        invalidParams[testCase.field] = testCase.value;

        const response = await apiClient.post('/activity-planner/generate', invalidParams, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([400, 422]).toContain(response.status);
        if (response.data) {
          expect(response.data.success).toBe(false);
        }
      });
    });

    // 风格参数验证测试
    const styleTests = [
      { style: 'professional', description: '专业风格', shouldPass: true },
      { style: 'creative', description: '创意风格', shouldPass: true },
      { style: 'fun', description: '趣味风格', shouldPass: true },
      { style: 'educational', description: '教育风格', shouldPass: true },
      { style: 'invalid', description: '无效风格', shouldPass: false },
      { style: 'casual', description: '不支持的风格', shouldPass: false }
    ];

    styleTests.forEach(test => {
      it(`应当在风格参数验证时正确处理 - ${test.description}`, async () => {
        const params = {
          activityType: '测试活动',
          targetAudience: '测试受众',
          preferredStyle: test.style
        };

        const response = await apiClient.post('/activity-planner/generate', params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldPass) {
          expect([200, 201]).toContain(response.status);
        } else {
          expect([400, 422]).toContain(response.status);
        }
      });
    });

    // 边界值测试
    const boundaryTests = [
      {
        params: { 
          activityType: '',
          targetAudience: '测试受众'
        },
        description: '空活动类型',
        shouldPass: false
      },
      {
        params: {
          activityType: 'A',
          targetAudience: '测试受众'
        },
        description: '最短活动类型',
        shouldPass: true
      },
      {
        params: {
          activityType: 'A'.repeat(1000),
          targetAudience: '测试受众'
        },
        description: '超长活动类型',
        shouldPass: false
      },
      {
        params: {
          activityType: '测试活动',
          targetAudience: '测试受众',
          budget: -1
        },
        description: '负数预算',
        shouldPass: false
      },
      {
        params: {
          activityType: '测试活动',
          targetAudience: '测试受众',
          budget: 0
        },
        description: '零预算',
        shouldPass: true
      },
      {
        params: {
          activityType: '测试活动',
          targetAudience: '测试受众',
          budget: Number.MAX_SAFE_INTEGER
        },
        description: '极大预算',
        shouldPass: true
      }
    ];

    boundaryTests.forEach(test => {
      it(`应当在边界值测试时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.post('/activity-planner/generate', test.params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldPass) {
          expect([200, 201]).toContain(response.status);
          if (response.status === 201 && response.data?.success && response.data?.data?.planId) {
            generatedPlanIds.push(response.data.data.planId);
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
          activityType: '活动<script>alert("xss")</script>',
          targetAudience: '测试受众'
        },
        description: 'XSS攻击活动类型'
      },
      {
        params: {
          activityType: '测试活动',
          targetAudience: "受众\\'; DROP TABLE activities; --"
        },
        description: 'SQL注入目标受众'
      },
      {
        params: {
          activityType: '测试活动',
          targetAudience: '测试受众',
          location: '${process.env.SECRET}'
        },
        description: '模板注入地点'
      },
      {
        params: {
          activityType: '测试活动',
          targetAudience: '测试受众',
          requirements: ['<img src=x onerror=alert("xss")>']
        },
        description: 'XSS攻击要求数组'
      }
    ];

    securityTests.forEach(test => {
      it(`应当在安全测试时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.post('/activity-planner/generate', test.params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        // 安全测试应该被正确处理，返回400、422或200(经过过滤)
        expect([200, 201, 400, 422]).toContain(response.status);
        if (response.status === 201 && response.data?.success && response.data?.data?.planId) {
          generatedPlanIds.push(response.data.data.planId);
        }
      });
    });

    // 有效参数测试
    validPlanningParams.forEach((params, index) => {
      it(`应当使用有效参数成功生成活动策划方案 - 组合${index + 1}`, async () => {
        const response = await apiClient.post('/activity-planner/generate', params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([200, 201]).toContain(response.status);
        if (response.status === 201 && response.data?.success) {
          expect(response.data.data).toHaveProperty('planId');
          expect(response.data.data).toHaveProperty('title');
          expect(response.data.data).toHaveProperty('description');
          
          if (response.data.data.planId) {
            generatedPlanIds.push(response.data.data.planId);
          }
        }
      });
    });

    it('应当在未认证时拒绝访问', async () => {
      const response = await apiClient.post('/activity-planner/generate', {
        activityType: '测试活动',
        targetAudience: '测试受众'
      });

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('GET /activity-planner/stats - 活动策划统计参数验证', () => {
    // 天数参数测试
    const daysTests = [
      { days: 1, description: '1天统计', shouldPass: true },
      { days: 7, description: '7天统计', shouldPass: true },
      { days: 30, description: '30天统计', shouldPass: true },
      { days: 365, description: '365天统计', shouldPass: true },
      { days: 0, description: '0天统计', shouldPass: false },
      { days: -1, description: '负数天数', shouldPass: false },
      { days: 366, description: '超过最大天数', shouldPass: false }
    ];

    daysTests.forEach(test => {
      it(`应当在天数参数验证时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.get('/activity-planner/stats', {
          params: { days: test.days },
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldPass) {
          expect([200]).toContain(response.status);
          if (response.status === 200) {
            expect(response.data).toHaveProperty('success', true);
            expect(response.data.data).toBeDefined();
          }
        } else {
          expect([400, 422]).toContain(response.status);
        }
      });
    });

    it('应当使用默认天数参数', async () => {
      const response = await apiClient.get('/activity-planner/stats', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
        expect(response.data.data).toBeDefined();
      }
    });

    // 天数参数类型测试
    const invalidDaysTests = [
      { days: 'invalid', description: '非数字天数' },
      { days: 30.5, description: '浮点数天数' },
      { days: '30abc', description: '混合字符天数' }
    ];

    invalidDaysTests.forEach(test => {
      it(`应当在无效天数类型时返回错误 - ${test.description}`, async () => {
        const response = await apiClient.get('/activity-planner/stats', {
          params: { days: test.days },
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([400, 422]).toContain(response.status);
      });
    });

    it('应当在未认证时拒绝访问', async () => {
      const response = await apiClient.get('/activity-planner/stats');

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('GET /activity-planner/models - AI模型列表参数验证', () => {
    it('应当成功获取AI模型列表', async () => {
      const response = await apiClient.get('/activity-planner/models', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
        expect(response.data.data).toBeDefined();
        expect(response.data.data).toHaveProperty('textModels');
        expect(response.data.data).toHaveProperty('imageModels');
        expect(response.data.data).toHaveProperty('speechModels');
      }
    });

    it('应当返回正确的模型数据结构', async () => {
      const response = await apiClient.get('/activity-planner/models', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.status === 200 && response.data.data) {
        const { textModels, imageModels, speechModels } = response.data.data;
        
        // 验证数组结构
        expect(Array.isArray(textModels)).toBe(true);
        expect(Array.isArray(imageModels)).toBe(true);
        expect(Array.isArray(speechModels)).toBe(true);

        // 验证模型对象结构（如果有模型数据）
        if (textModels.length > 0) {
          const model = textModels[0];
          expect(model).toHaveProperty('id');
          expect(model).toHaveProperty('name');
          expect(model).toHaveProperty('displayName');
          expect(model).toHaveProperty('provider');
          expect(model).toHaveProperty('isDefault');
        }
      }
    });

    it('应当在未认证时拒绝访问', async () => {
      const response = await apiClient.get('/activity-planner/models');

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('权限验证测试', () => {
    const protectedEndpoints = [
      { method: 'post', url: '/activity-planner/generate', data: { activityType: '测试', targetAudience: '测试' } },
      { method: 'get', url: '/activity-planner/stats' },
      { method: 'get', url: '/activity-planner/models' }
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
      const response = await apiClient.get('/activity-planner/stats', {
        headers: { 'Authorization': 'Bearer invalid_token' }
      });

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('响应数据格式验证', () => {
    it('策划生成响应应包含必要字段', async () => {
      const response = await apiClient.post('/activity-planner/generate', {
        activityType: '响应格式测试活动',
        targetAudience: '测试受众',
        preferredStyle: 'professional'
      }, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.status === 201) {
        expect(response.data).toHaveProperty('success', true);
        expect(response.data).toHaveProperty('message');
        expect(response.data.data).toBeDefined();
        
        const planData = response.data.data;
        expect(planData).toHaveProperty('planId');
        expect(planData).toHaveProperty('title');
        expect(planData).toHaveProperty('description');
        
        // 验证planId格式
        expect(typeof planData.planId).toBe('string');
        expect(planData.planId.length).toBeGreaterThan(0);
        
        if (planData.planId) {
          generatedPlanIds.push(planData.planId);
        }
      }
    });

    it('统计响应应包含统计字段', async () => {
      const response = await apiClient.get('/activity-planner/stats', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
        expect(response.data.data).toBeDefined();
        
        const statsData = response.data.data;
        expect(typeof statsData).toBe('object');
        
        // 验证基本统计字段（根据实际API响应调整）
        if (statsData.totalPlans !== undefined) {
          expect(typeof statsData.totalPlans).toBe('number');
        }
      }
    });

    it('模型列表响应应包含模型信息', async () => {
      const response = await apiClient.get('/activity-planner/models', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
        expect(response.data.data).toBeDefined();
        
        const modelsData = response.data.data;
        expect(modelsData).toHaveProperty('textModels');
        expect(modelsData).toHaveProperty('imageModels'); 
        expect(modelsData).toHaveProperty('speechModels');
        
        expect(Array.isArray(modelsData.textModels)).toBe(true);
        expect(Array.isArray(modelsData.imageModels)).toBe(true);
        expect(Array.isArray(modelsData.speechModels)).toBe(true);
      }
    });
  });

  describe('性能和并发测试', () => {
    it('AI策划生成API响应时间应在可接受范围内', async () => {
      const startTime = Date.now();
      
      const testParams = {
        activityType: '性能测试活动',
        targetAudience: '测试受众',
        preferredStyle: 'professional'
      };

      const response = await apiClient.post('/activity-planner/generate', testParams, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(60000); // AI生成响应时间应小于60秒
      expect([200, 201]).toContain(response.status);
      
      if (response.status === 201 && response.data?.success && response.data?.data?.planId) {
        generatedPlanIds.push(response.data.data.planId);
      }
    });

    it('统计查询API响应时间应在可接受范围内', async () => {
      const startTime = Date.now();
      
      const response = await apiClient.get('/activity-planner/stats', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(3000); // 统计查询响应时间应小于3秒
      expect([200]).toContain(response.status);
    });

    it('模型列表查询API响应时间应在可接受范围内', async () => {
      const startTime = Date.now();
      
      const response = await apiClient.get('/activity-planner/models', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(2000); // 模型查询响应时间应小于2秒
      expect([200]).toContain(response.status);
    });

    it('并发统计查询测试', async () => {
      const concurrentRequests = Array(3).fill(null).map(() => 
        apiClient.get('/activity-planner/stats', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );

      const startTime = Date.now();
      const responses = await Promise.all(concurrentRequests);
      const totalTime = Date.now() - startTime;

      expect(totalTime).toBeLessThan(8000); // 3个并发请求总时间应小于8秒
      responses.forEach(response => {
        expect([200]).toContain(response.status);
      });
    });
  });

  describe('AI功能特定测试', () => {
    it('应当正确处理多种活动类型', async () => {
      const activityTypes = [
        '儿童生日派对',
        '企业年会',
        '学术讲座',
        '艺术展览',
        '体育比赛',
        '音乐会',
        '慈善活动',
        '产品发布会'
      ];

      for (const activityType of activityTypes.slice(0, 3)) { // 限制测试数量避免超时
        const response = await apiClient.post('/activity-planner/generate', {
          activityType,
          targetAudience: '相关受众',
          preferredStyle: 'professional'
        }, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([200, 201]).toContain(response.status);
        if (response.status === 201 && response.data?.success && response.data?.data?.planId) {
          generatedPlanIds.push(response.data.data.planId);
        }
      }
    });

    it('应当正确处理不同的风格偏好', async () => {
      const styles = ['professional', 'creative', 'fun', 'educational'];

      for (const style of styles) {
        const response = await apiClient.post('/activity-planner/generate', {
          activityType: '风格测试活动',
          targetAudience: '测试受众',
          preferredStyle: style
        }, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([200, 201]).toContain(response.status);
        if (response.status === 201 && response.data?.success && response.data?.data?.planId) {
          generatedPlanIds.push(response.data.data.planId);
        }
      }
    });

    it('应当处理复杂的需求数组', async () => {
      const complexRequirements = [
        '需要专业摄影师进行全程拍摄',
        '提供儿童友好的健康饮食',
        '确保所有活动道具符合安全标准',
        '安排双语主持人（中英文）',
        '预留家长观摩区域',
        '准备雨天备选方案'
      ];

      const response = await apiClient.post('/activity-planner/generate', {
        activityType: '复杂需求测试活动',
        targetAudience: '5-8岁儿童及家长',
        budget: 15000,
        duration: '4小时',
        location: '综合活动中心',
        requirements: complexRequirements,
        preferredStyle: 'professional'
      }, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200, 201]).toContain(response.status);
      if (response.status === 201 && response.data?.success && response.data?.data?.planId) {
        generatedPlanIds.push(response.data.data.planId);
      }
    });
  });
});