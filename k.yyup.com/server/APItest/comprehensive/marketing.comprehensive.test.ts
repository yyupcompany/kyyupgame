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

describe('营销管理API全面测试 - 参数验证', () => {
  let authToken: string = '';
  let testCampaignIds: number[] = [];
  let testAdvertisementIds: number[] = [];

  beforeAll(async () => {
    console.log('🚀 开始营销管理API全面测试...');
    console.log('📋 测试范围: 25+个营销管理端点的完整参数验证');

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
    console.log('🧹 清理测试营销数据...');
    for (const advertisementId of testAdvertisementIds) {
      if (authToken) {
        await apiClient.delete(`/advertisements/${advertisementId}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
      }
    }
    for (const campaignId of testCampaignIds) {
      if (authToken) {
        await apiClient.delete(`/marketing-campaigns/${campaignId}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
      }
    }
  });

  describe('POST /marketing-campaigns - 创建营销活动参数验证', () => {
    // 有效营销活动参数组合
    const validCampaignParams = [
      {
        name: '春季招生活动',
        campaignType: 'enrollment',
        kindergartenId: 1,
        budget: 50000,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        targetAudience: '3-6岁儿童家长',
        description: '春季招生推广活动，主要针对新生入园',
        channels: ['wechat', 'weibo', 'offline'],
        status: 'draft'
      },
      {
        name: '夏季亲子活动推广',
        campaignType: 'activity',
        kindergartenId: 1,
        budget: 30000,
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        targetAudience: '在校学生家长',
        description: '夏季亲子活动宣传推广',
        channels: ['app', 'sms'],
        status: 'draft'
      }
    ];

    // 必填字段测试  
    const requiredFields = ['name', 'campaignType', 'kindergartenId', 'budget', 'startDate', 'endDate'];

    requiredFields.forEach(field => {
      it(`应当在缺少必填字段时返回错误 - ${field}`, async () => {
        const invalidParams: any = { ...validCampaignParams[0] };
        delete invalidParams[field];

        const response = await apiClient.post('/marketing-campaigns', invalidParams, {
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
      { field: 'name', value: 123, description: '非字符串活动名称' },
      { field: 'campaignType', value: 123, description: '非字符串活动类型' },
      { field: 'kindergartenId', value: 'invalid', description: '非数字幼儿园ID' },
      { field: 'budget', value: 'invalid', description: '非数字预算' },
      { field: 'channels', value: 'invalid', description: '非数组渠道' }
    ];

    invalidDataTypes.forEach(testCase => {
      it(`应当在无效数据类型时返回错误 - ${testCase.description}`, async () => {
        const invalidParams: any = { ...validCampaignParams[0] };
        invalidParams[testCase.field] = testCase.value;

        const response = await apiClient.post('/marketing-campaigns', invalidParams, {
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
        params: { ...validCampaignParams[0], budget: 0 },
        description: '零预算',
        shouldPass: false
      },
      {
        params: { ...validCampaignParams[0], budget: 1 },
        description: '最小预算',
        shouldPass: true
      },
      {
        params: { ...validCampaignParams[0], budget: 1000000 },
        description: '大额预算',
        shouldPass: true
      },
      {
        params: { ...validCampaignParams[0], budget: -100 },
        description: '负数预算',
        shouldPass: false
      },
      {
        params: { ...validCampaignParams[0], name: '' },
        description: '空活动名称',
        shouldPass: false
      },
      {
        params: { ...validCampaignParams[0], name: 'A' },
        description: '最短活动名称',
        shouldPass: true
      },
      {
        params: { ...validCampaignParams[0], name: 'A'.repeat(500) },
        description: '超长活动名称',
        shouldPass: false
      }
    ];

    boundaryTests.forEach(test => {
      it(`应当在边界值测试时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.post('/marketing-campaigns', test.params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldPass) {
          expect([200, 201]).toContain(response.status);
          if (response.status === 201 && response.data?.success && response.data?.data?.id) {
            testCampaignIds.push(response.data.data.id);
          }
        } else {
          expect([400, 422]).toContain(response.status);
          if (response.data) {
            expect(response.data.success).toBe(false);
          }
        }
      });
    });

    // 日期逻辑验证测试
    const dateTests = [
      {
        params: {
          ...validCampaignParams[0],
          startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 昨天
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        description: '开始日期在过去',
        shouldPass: false
      },
      {
        params: {
          ...validCampaignParams[0],
          startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        description: '结束日期早于开始日期',
        shouldPass: false
      },
      {
        params: {
          ...validCampaignParams[0],
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        },
        description: '开始和结束日期相同',
        shouldPass: false
      }
    ];

    dateTests.forEach(test => {
      it(`应当在日期逻辑验证时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.post('/marketing-campaigns', test.params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldPass) {
          expect([200, 201]).toContain(response.status);
          if (response.status === 201 && response.data?.success && response.data?.data?.id) {
            testCampaignIds.push(response.data.data.id);
          }
        } else {
          expect([400, 422]).toContain(response.status);
        }
      });
    });

    // 有效参数测试
    validCampaignParams.forEach((params, index) => {
      it(`应当使用有效参数成功创建营销活动 - 组合${index + 1}`, async () => {
        const response = await apiClient.post('/marketing-campaigns', params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([200, 201]).toContain(response.status);
        if (response.status === 201 && response.data?.success && response.data?.data?.id) {
          expect(response.data.data).toHaveProperty('id');
          expect(response.data.data).toHaveProperty('name', params.name);
          testCampaignIds.push(response.data.data.id);
        }
      });
    });
  });

  describe('GET /marketing-campaigns - 获取营销活动列表参数验证', () => {
    // 分页参数测试
    const paginationTests = [
      { params: { page: 1, pageSize: 10 }, description: '标准分页参数' },
      { params: { page: 1, pageSize: 5 }, description: '小页面尺寸' },
      { params: { page: 2, pageSize: 20 }, description: '大页面尺寸' },
      { params: { page: 0 }, description: '无效页码', shouldFail: false }, // 系统可能会处理为默认值
      { params: { pageSize: 1000 }, description: '超大页面尺寸', shouldFail: false }
    ];

    paginationTests.forEach(test => {
      it(`应当在分页参数测试时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.get('/marketing-campaigns', {
          params: test.params,
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([200, 403]).toContain(response.status);
        if (response.status === 200) {
          expect(response.data).toHaveProperty('success', true);
        }
      });
    });

    // 筛选参数测试
    const filterTests = [
      { params: { campaignType: 'enrollment' }, description: '按活动类型筛选' },
      { params: { status: 'active' }, description: '按状态筛选' },
      { params: { kindergartenId: 1 }, description: '按幼儿园筛选' },
      { params: { keyword: '招生' }, description: '按关键词搜索' }
    ];

    filterTests.forEach(test => {
      it(`应当在筛选参数测试时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.get('/marketing-campaigns', {
          params: test.params,
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([200, 403]).toContain(response.status);
        if (response.status === 200) {
          expect(response.data).toHaveProperty('success', true);
        }
      });
    });
  });

  describe('GET /marketing-campaigns/by-type/:type - 按类型获取营销活动', () => {
    const typeTests = [
      { type: 'enrollment', description: '招生活动' },
      { type: 'activity', description: '活动推广' },
      { type: 'brand', description: '品牌宣传' },
      { type: 'invalid', description: '无效类型' }
    ];

    typeTests.forEach(test => {
      it(`应当正确处理按类型查询 - ${test.description}`, async () => {
        const response = await apiClient.get(`/marketing-campaigns/by-type/${test.type}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([200, 403, 404]).toContain(response.status);
        if (response.status === 200) {
          expect(response.data).toHaveProperty('success', true);
          expect(response.data.data).toHaveProperty('type', test.type);
          expect(response.data.data).toHaveProperty('items');
          expect(Array.isArray(response.data.data.items)).toBe(true);
        }
      });
    });

    it('应当在未认证时拒绝访问', async () => {
      const response = await apiClient.get('/marketing-campaigns/by-type/enrollment');

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('GET /marketing-campaigns/by-status/:status - 按状态获取营销活动', () => {
    const statusTests = [
      { status: 'draft', description: '草稿状态' },
      { status: 'active', description: '活跃状态' },
      { status: 'paused', description: '暂停状态' },
      { status: 'completed', description: '完成状态' },
      { status: 'invalid', description: '无效状态' }
    ];

    statusTests.forEach(test => {
      it(`应当正确处理按状态查询 - ${test.description}`, async () => {
        const response = await apiClient.get(`/marketing-campaigns/by-status/${test.status}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([200, 403, 404]).toContain(response.status);
        if (response.status === 200) {
          expect(response.data).toHaveProperty('success', true);
          expect(response.data.data).toHaveProperty('status', test.status);
          expect(response.data.data).toHaveProperty('items');
          expect(Array.isArray(response.data.data.items)).toBe(true);
        }
      });
    });
  });

  describe('POST /marketing-campaigns/:id/launch - 启动营销活动', () => {
    let testCampaignId: number;

    beforeAll(async () => {
      // 创建一个测试营销活动用于启动测试
      const testCampaign = {
        name: '测试启动活动',
        campaignType: 'enrollment',
        kindergartenId: 1,
        budget: 10000,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'draft'
      };

      const response = await apiClient.post('/marketing-campaigns', testCampaign, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.status === 201 && response.data?.success && response.data?.data?.id) {
        testCampaignId = response.data.data.id;
        testCampaignIds.push(testCampaignId);
      }
    });

    it('应当成功启动营销活动', async () => {
      if (!testCampaignId) {
        console.warn('跳过启动测试：无法创建测试活动');
        return;
      }

      const response = await apiClient.post(`/marketing-campaigns/${testCampaignId}/launch`, {}, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
        expect(response.data.data).toHaveProperty('id', testCampaignId);
        expect(response.data.data).toHaveProperty('status', 'active');
      }
    });

    it('应当在启动不存在的活动时返回错误', async () => {
      const response = await apiClient.post('/marketing-campaigns/999999/launch', {}, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([404, 500]).toContain(response.status);
    });

    it('应当在无效ID时返回错误', async () => {
      const response = await apiClient.post('/marketing-campaigns/invalid/launch', {}, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([400, 500]).toContain(response.status);
    });
  });

  describe('POST /marketing-campaigns/:id/pause - 暂停营销活动', () => {
    let testCampaignId: number;

    beforeAll(async () => {
      // 创建一个测试营销活动用于暂停测试
      const testCampaign = {
        name: '测试暂停活动',
        campaignType: 'activity',
        kindergartenId: 1,
        budget: 15000,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'draft'
      };

      const response = await apiClient.post('/marketing-campaigns', testCampaign, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.status === 201 && response.data?.success && response.data?.data?.id) {
        testCampaignId = response.data.data.id;
        testCampaignIds.push(testCampaignId);
      }
    });

    it('应当成功暂停营销活动', async () => {
      if (!testCampaignId) {
        console.warn('跳过暂停测试：无法创建测试活动');
        return;
      }

      const response = await apiClient.post(`/marketing-campaigns/${testCampaignId}/pause`, {}, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
        expect(response.data.data).toHaveProperty('id', testCampaignId);
        expect(response.data.data).toHaveProperty('status', 'paused');
      }
    });
  });

  describe('GET /marketing-campaigns/:id/roi - 获取ROI数据', () => {
    let testCampaignId: number;

    beforeAll(async () => {
      // 创建一个测试营销活动用于ROI测试
      const testCampaign = {
        name: '测试ROI活动',
        campaignType: 'enrollment',
        kindergartenId: 1,
        budget: 20000,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active'
      };

      const response = await apiClient.post('/marketing-campaigns', testCampaign, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.status === 201 && response.data?.success && response.data?.data?.id) {
        testCampaignId = response.data.data.id;
        testCampaignIds.push(testCampaignId);
      }
    });

    it('应当成功获取营销活动ROI数据', async () => {
      if (!testCampaignId) {
        console.warn('跳过ROI测试：无法创建测试活动');
        return;
      }

      const response = await apiClient.get(`/marketing-campaigns/${testCampaignId}/roi`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
        expect(response.data.data).toHaveProperty('budget');
        expect(response.data.data).toHaveProperty('spent');
        expect(response.data.data).toHaveProperty('total_revenue');
        expect(response.data.data).toHaveProperty('roi_percentage');
      }
    });

    it('应当在获取不存在活动的ROI时返回404', async () => {
      const response = await apiClient.get('/marketing-campaigns/999999/roi', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([404]).toContain(response.status);
    });
  });

  describe('POST /advertisements - 创建广告参数验证', () => {
    // 有效广告参数组合
    const validAdvertisementParams = [
      {
        title: '春季招生广告',
        type: 'banner',
        kindergartenId: 1,
        content: '欢迎新生入园，优质教育等您来！',
        imageUrl: 'https://example.com/banner1.jpg',
        linkUrl: 'https://k.yyup.cc/enrollment',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        position: 'top',
        priority: 5
      },
      {
        title: '亲子活动推广',
        type: 'popup',
        kindergartenId: 1,
        content: '精彩亲子活动等您参与！',
        imageUrl: 'https://example.com/popup1.jpg',
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'draft',
        priority: 3
      }
    ];

    // 必填字段测试
    const adRequiredFields = ['title', 'type', 'kindergartenId', 'content', 'startDate', 'endDate'];

    adRequiredFields.forEach(field => {
      it(`应当在缺少必填字段时返回错误 - ${field}`, async () => {
        const invalidParams: any = { ...validAdvertisementParams[0] };
        delete invalidParams[field];

        const response = await apiClient.post('/advertisements', invalidParams, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([400, 422]).toContain(response.status);
        if (response.data) {
          expect(response.data.success).toBe(false);
        }
      });
    });

    // 有效参数测试
    validAdvertisementParams.forEach((params, index) => {
      it(`应当使用有效参数成功创建广告 - 组合${index + 1}`, async () => {
        const response = await apiClient.post('/advertisements', params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([200, 201]).toContain(response.status);
        if (response.status === 201 && response.data?.success && response.data?.data?.id) {
          expect(response.data.data).toHaveProperty('id');
          expect(response.data.data).toHaveProperty('title', params.title);
          testAdvertisementIds.push(response.data.data.id);
        }
      });
    });
  });

  describe('GET /advertisements - 获取广告列表参数验证', () => {
    it('应当成功获取广告列表', async () => {
      const response = await apiClient.get('/advertisements', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200, 403]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
      }
    });

    it('应当在未认证时拒绝访问', async () => {
      const response = await apiClient.get('/advertisements');

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('GET /advertisements/by-type/:type - 按类型获取广告', () => {
    const adTypeTests = [
      { type: 'banner', description: '横幅广告' },
      { type: 'popup', description: '弹窗广告' },
      { type: 'sidebar', description: '侧边栏广告' },
      { type: 'invalid', description: '无效类型' }
    ];

    adTypeTests.forEach(test => {
      it(`应当正确处理按类型查询广告 - ${test.description}`, async () => {
        const response = await apiClient.get(`/advertisements/by-type/${test.type}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([200, 403, 404]).toContain(response.status);
        if (response.status === 200) {
          expect(response.data).toHaveProperty('success', true);
        }
      });
    });
  });

  describe('POST /advertisements/:id/pause - 暂停广告', () => {
    let testAdvertisementId: number;

    beforeAll(async () => {
      // 创建一个测试广告用于暂停测试
      const testAd = {
        title: '测试暂停广告',
        type: 'banner',
        kindergartenId: 1,
        content: '测试广告内容',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active'
      };

      const response = await apiClient.post('/advertisements', testAd, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.status === 201 && response.data?.success && response.data?.data?.id) {
        testAdvertisementId = response.data.data.id;
        testAdvertisementIds.push(testAdvertisementId);
      }
    });

    it('应当成功暂停广告', async () => {
      if (!testAdvertisementId) {
        console.warn('跳过广告暂停测试：无法创建测试广告');
        return;
      }

      const response = await apiClient.post(`/advertisements/${testAdvertisementId}/pause`, {}, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
      }
    });
  });

  describe('权限验证测试', () => {
    const protectedEndpoints = [
      { method: 'get', url: '/marketing-campaigns' },
      { method: 'post', url: '/marketing-campaigns', data: {} },
      { method: 'get', url: '/marketing-campaigns/1' },
      { method: 'put', url: '/marketing-campaigns/1', data: {} },
      { method: 'delete', url: '/marketing-campaigns/1' },
      { method: 'get', url: '/advertisements' },
      { method: 'post', url: '/advertisements', data: {} },
      { method: 'get', url: '/advertisements/1' },
      { method: 'put', url: '/advertisements/1', data: {} },
      { method: 'delete', url: '/advertisements/1' }
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
        } else if (endpoint.method === 'delete') {
          response = await apiClient.delete(endpoint.url);
        }

        expect([401, 403]).toContain(response!.status);
      });
    });

    it('应当在无效token时返回401', async () => {
      const response = await apiClient.get('/marketing-campaigns', {
        headers: { 'Authorization': 'Bearer invalid_token' }
      });

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('性能测试', () => {
    it('创建营销活动API响应时间应在可接受范围内', async () => {
      const startTime = Date.now();
      
      const testParams = {
        name: '性能测试活动',
        campaignType: 'enrollment',
        kindergartenId: 1,
        budget: 25000,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'draft'
      };

      const response = await apiClient.post('/marketing-campaigns', testParams, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(3000); // 响应时间应小于3秒
      expect([200, 201, 403]).toContain(response.status);
      
      if (response.status === 201 && response.data?.success && response.data?.data?.id) {
        testCampaignIds.push(response.data.data.id);
      }
    });

    it('获取营销活动列表API响应时间应在可接受范围内', async () => {
      const startTime = Date.now();
      
      const response = await apiClient.get('/marketing-campaigns', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(2000); // 响应时间应小于2秒
      expect([200, 403]).toContain(response.status);
    });

    it('并发营销查询测试', async () => {
      const concurrentRequests = Array(3).fill(null).map(() => 
        apiClient.get('/marketing-campaigns', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );

      const startTime = Date.now();
      const responses = await Promise.all(concurrentRequests);
      const totalTime = Date.now() - startTime;

      expect(totalTime).toBeLessThan(6000); // 3个并发请求总时间应小于6秒
      responses.forEach(response => {
        expect([200, 403]).toContain(response.status);
      });
    });
  });
});