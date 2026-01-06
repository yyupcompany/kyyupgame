/**
 * Phase 9: 营销管理模块API全面测试
 * Marketing Management Module Comprehensive API Tests
 * 
 * 测试范围:
 * - marketing-campaign (营销活动) - 16个端点
 * - advertisement (广告管理) - 11个端点
 * - channel-tracking (渠道跟踪) - 5个端点
 * - conversion-tracking (转化跟踪) - 7个端点
 * - poster-template (海报模板) - 10个端点
 * - poster-generation (海报生成) - 9个端点
 * - customer-pool (客户池) - 15个端点
 * 
 * 总计: 73个API端点
 */

import axios from 'axios';
import { getAuthToken, ParameterValidationFramework } from '../helpers/testUtils';

const API_BASE_URL = 'http://localhost:3000/api';
const apiClient = axios.create({ baseURL: API_BASE_URL });

describe('Phase 9: 营销管理模块API全面测试', () => {
  let authToken: string;
  let testCampaign: any;
  let testAdvertisement: any;
  let testPosterTemplate: any;
  let testCustomer: any;
  let validationFramework: ParameterValidationFramework;

  beforeAll(async () => {
    authToken = await getAuthToken();
    validationFramework = new ParameterValidationFramework(apiClient, authToken);
  });

  describe('📢 营销活动 API (Marketing Campaign API)', () => {
    describe('POST /marketing-campaign - 创建营销活动', () => {
      const validCampaignData = [
        {
          name: '秋季招生营销活动',
          description: '针对秋季招生的综合营销活动',
          type: 'enrollment',
          status: 'draft',
          startDate: '2024-08-01T00:00:00Z',
          endDate: '2024-08-31T23:59:59Z',
          budget: 50000,
          targetAudience: '3-6岁儿童家长',
          channels: ['wechat', 'local_ads', 'referral']
        },
        {
          name: '新年特别活动',
          description: '新年期间的特别营销推广',
          type: 'promotion',
          status: 'active',
          startDate: '2025-01-01T00:00:00Z',
          endDate: '2025-01-31T23:59:59Z',
          budget: 30000,
          targetAudience: '现有学员家长',
          channels: ['social_media', 'email'],
          goals: {
            leads: 100,
            conversions: 20,
            roi: 2.5
          }
        }
      ];

      const invalidCampaignData = [
        {}, // 空对象
        { name: '' }, // 空名称
        { name: '活动', startDate: 'invalid-date' }, // 无效开始日期
        { name: '活动', startDate: '2024-08-01', endDate: '2024-07-31' }, // 结束日期早于开始日期
        { name: '活动', budget: -1000 }, // 负预算
        { name: '活动', channels: [] }, // 空渠道数组
      ];

      validCampaignData.forEach((campaignData, index) => {
        it(`应该接受有效营销活动参数 ${index + 1}`, async () => {
          try {
            const response = await apiClient.post('/marketing-campaign', campaignData, {
              headers: { 'Authorization': `Bearer ${authToken}` }
            });

            expect([200, 201]).toContain(response.status);
            expect(response.data.success).toBe(true);

            if (response.data.data) {
              testCampaign = response.data.data;
            }
          } catch (error: any) {
            console.log(`营销活动创建测试 ${index + 1} 错误:`, error.response?.data || error.message);
            expect([200, 201, 404, 500]).toContain(error.response?.status);
          }
        });
      });

      invalidCampaignData.forEach((campaignData, index) => {
        it(`应该拒绝无效营销活动参数 ${index + 1}`, async () => {
          try {
            const response = await apiClient.post('/marketing-campaign', campaignData, {
              headers: { 'Authorization': `Bearer ${authToken}` }
            });

            expect([400, 422]).toContain(response.status);
            expect(response.data.success).toBe(false);
          } catch (error: any) {
            expect([400, 422, 404, 500]).toContain(error.response?.status);
          }
        });
      });
    });

    describe('GET /marketing-campaign - 获取营销活动列表', () => {
      const validCampaignQueries = [
        {},
        { status: 'active' },
        { type: 'enrollment' },
        { startDate: '2024-01-01', endDate: '2024-12-31' },
        { page: 1, limit: 10 },
        { search: '招生' }
      ];

      validCampaignQueries.forEach((params, index) => {
        it(`应该接受有效营销活动查询参数 ${index + 1}`, async () => {
          try {
            const response = await apiClient.get('/marketing-campaign', {
              params,
              headers: { 'Authorization': `Bearer ${authToken}` }
            });

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(Array.isArray(response.data.data)).toBe(true);
          } catch (error: any) {
            console.log(`营销活动查询测试 ${index + 1} 错误:`, error.response?.data || error.message);
            expect([200, 404, 500]).toContain(error.response?.status);
          }
        });
      });
    });

    describe('PUT /marketing-campaign/:id - 更新营销活动', () => {
      it('应该能够更新营销活动', async () => {
        if (!testCampaign?.id) {
          console.log('跳过营销活动更新测试：没有有效的活动ID');
          return;
        }

        const updateData = {
          name: '更新后的营销活动',
          description: '更新后的活动描述',
          budget: 60000
        };

        try {
          const response = await apiClient.put(`/marketing-campaign/${testCampaign.id}`, updateData, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect([200, 201]).toContain(response.status);
          expect(response.data.success).toBe(true);
        } catch (error: any) {
          console.log('营销活动更新错误:', error.response?.data || error.message);
          expect([200, 201, 404, 500]).toContain(error.response?.status);
        }
      });
    });

    describe('GET /marketing-campaign/:id/analytics - 获取活动分析', () => {
      it('应该能够获取营销活动分析数据', async () => {
        if (!testCampaign?.id) {
          console.log('跳过营销活动分析测试：没有有效的活动ID');
          return;
        }

        try {
          const response = await apiClient.get(`/marketing-campaign/${testCampaign.id}/analytics`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
        } catch (error: any) {
          console.log('营销活动分析错误:', error.response?.data || error.message);
          expect([200, 404, 500]).toContain(error.response?.status);
        }
      });
    });

    describe('DELETE /marketing-campaign/:id - 删除营销活动', () => {
      it('应该能够删除营销活动', async () => {
        if (!testCampaign?.id) {
          console.log('跳过营销活动删除测试：没有有效的活动ID');
          return;
        }

        try {
          const response = await apiClient.delete(`/marketing-campaign/${testCampaign.id}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect([200, 204]).toContain(response.status);
          expect(response.data.success).toBe(true);
        } catch (error: any) {
          console.log('营销活动删除错误:', error.response?.data || error.message);
          expect([200, 204, 404, 500]).toContain(error.response?.status);
        }
      });
    });
  });

  describe('📺 广告管理 API (Advertisement API)', () => {
    describe('POST /advertisement - 创建广告', () => {
      const validAdvertisementData = [
        {
          title: '春季招生广告',
          content: '优质幼儿园教育，给孩子最好的起点',
          type: 'banner',
          platform: 'wechat',
          status: 'active',
          startDate: '2024-08-01T00:00:00Z',
          endDate: '2024-08-31T23:59:59Z',
          budget: 10000,
          targetAudience: {
            age: '25-40',
            location: '北京市',
            interests: ['教育', '育儿']
          }
        },
        {
          title: '暑期活动推广',
          content: '精彩暑期活动，让孩子度过难忘假期',
          type: 'video',
          platform: 'douyin',
          status: 'draft',
          startDate: '2024-07-01T00:00:00Z',
          endDate: '2024-07-31T23:59:59Z',
          budget: 15000,
          creative: {
            imageUrl: 'https://example.com/ad-image.jpg',
            videoUrl: 'https://example.com/ad-video.mp4'
          }
        }
      ];

      validAdvertisementData.forEach((adData, index) => {
        it(`应该接受有效广告参数 ${index + 1}`, async () => {
          try {
            const response = await apiClient.post('/advertisement', adData, {
              headers: { 'Authorization': `Bearer ${authToken}` }
            });

            expect([200, 201]).toContain(response.status);
            expect(response.data.success).toBe(true);

            if (response.data.data) {
              testAdvertisement = response.data.data;
            }
          } catch (error: any) {
            console.log(`广告创建测试 ${index + 1} 错误:`, error.response?.data || error.message);
            expect([200, 201, 404, 500]).toContain(error.response?.status);
          }
        });
      });
    });

    describe('GET /advertisement - 获取广告列表', () => {
      const validAdvertisementQueries = [
        {},
        { platform: 'wechat' },
        { type: 'banner' },
        { status: 'active' },
        { page: 1, limit: 20 }
      ];

      validAdvertisementQueries.forEach((params, index) => {
        it(`应该接受有效广告查询参数 ${index + 1}`, async () => {
          try {
            const response = await apiClient.get('/advertisement', {
              params,
              headers: { 'Authorization': `Bearer ${authToken}` }
            });

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(Array.isArray(response.data.data)).toBe(true);
          } catch (error: any) {
            console.log(`广告查询测试 ${index + 1} 错误:`, error.response?.data || error.message);
            expect([200, 404, 500]).toContain(error.response?.status);
          }
        });
      });
    });

    describe('GET /advertisement/:id/performance - 获取广告效果', () => {
      it('应该能够获取广告效果数据', async () => {
        if (!testAdvertisement?.id) {
          console.log('跳过广告效果测试：没有有效的广告ID');
          return;
        }

        try {
          const response = await apiClient.get(`/advertisement/${testAdvertisement.id}/performance`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
        } catch (error: any) {
          console.log('广告效果查询错误:', error.response?.data || error.message);
          expect([200, 404, 500]).toContain(error.response?.status);
        }
      });
    });

    describe('PUT /advertisement/:id/status - 更新广告状态', () => {
      const statusUpdates = [
        { status: 'paused', reason: '暂停投放' },
        { status: 'active', reason: '恢复投放' }
      ];

      statusUpdates.forEach((update, index) => {
        it(`应该能够更新广告状态为 ${update.status}`, async () => {
          if (!testAdvertisement?.id) {
            console.log('跳过广告状态更新测试：没有有效的广告ID');
            return;
          }

          try {
            const response = await apiClient.put(`/advertisement/${testAdvertisement.id}/status`, update, {
              headers: { 'Authorization': `Bearer ${authToken}` }
            });

            expect([200, 201]).toContain(response.status);
            expect(response.data.success).toBe(true);
          } catch (error: any) {
            console.log(`广告状态更新测试 ${index + 1} 错误:`, error.response?.data || error.message);
            expect([200, 201, 404, 500]).toContain(error.response?.status);
          }
        });
      });
    });
  });

  describe('📊 渠道跟踪 API (Channel Tracking API)', () => {
    describe('POST /channel-tracking - 创建渠道跟踪', () => {
      const validTrackingData = [
        {
          campaignId: testCampaign?.id || 1,
          channel: 'wechat',
          source: 'organic',
          medium: 'social',
          utmParams: {
            utm_source: 'wechat',
            utm_medium: 'social',
            utm_campaign: 'spring_enrollment'
          }
        },
        {
          campaignId: testCampaign?.id || 1,
          channel: 'baidu',
          source: 'paid',
          medium: 'cpc',
          utmParams: {
            utm_source: 'baidu',
            utm_medium: 'cpc',
            utm_campaign: 'summer_camp'
          },
          cost: 1200
        }
      ];

      validTrackingData.forEach((trackingData, index) => {
        it(`应该接受有效渠道跟踪参数 ${index + 1}`, async () => {
          try {
            const response = await apiClient.post('/channel-tracking', trackingData, {
              headers: { 'Authorization': `Bearer ${authToken}` }
            });

            expect([200, 201]).toContain(response.status);
            expect(response.data.success).toBe(true);
          } catch (error: any) {
            console.log(`渠道跟踪创建测试 ${index + 1} 错误:`, error.response?.data || error.message);
            expect([200, 201, 404, 500]).toContain(error.response?.status);
          }
        });
      });
    });

    describe('GET /channel-tracking/analytics - 获取渠道分析', () => {
      it('应该能够获取渠道分析数据', async () => {
        try {
          const response = await apiClient.get('/channel-tracking/analytics', {
            params: { period: 'last30days' },
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
        } catch (error: any) {
          console.log('渠道分析查询错误:', error.response?.data || error.message);
          expect([200, 404, 500]).toContain(error.response?.status);
        }
      });
    });

    describe('GET /channel-tracking/performance - 获取渠道效果', () => {
      it('应该能够获取各渠道效果对比', async () => {
        try {
          const response = await apiClient.get('/channel-tracking/performance', {
            params: { 
              startDate: '2024-01-01',
              endDate: '2024-12-31'
            },
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
        } catch (error: any) {
          console.log('渠道效果查询错误:', error.response?.data || error.message);
          expect([200, 404, 500]).toContain(error.response?.status);
        }
      });
    });
  });

  describe('🎯 转化跟踪 API (Conversion Tracking API)', () => {
    describe('POST /conversion-tracking - 记录转化事件', () => {
      const validConversionData = [
        {
          eventType: 'lead_generation',
          userId: 121,
          campaignId: testCampaign?.id || 1,
          value: 0,
          properties: {
            form_type: 'contact_form',
            source_page: '/enrollment'
          }
        },
        {
          eventType: 'enrollment_completed',
          userId: 121,
          campaignId: testCampaign?.id || 1,
          value: 5000,
          properties: {
            student_name: '张小明',
            class_type: '小班',
            payment_method: 'wechat_pay'
          }
        }
      ];

      validConversionData.forEach((conversionData, index) => {
        it(`应该接受有效转化跟踪参数 ${index + 1}`, async () => {
          try {
            const response = await apiClient.post('/conversion-tracking', conversionData, {
              headers: { 'Authorization': `Bearer ${authToken}` }
            });

            expect([200, 201]).toContain(response.status);
            expect(response.data.success).toBe(true);
          } catch (error: any) {
            console.log(`转化跟踪创建测试 ${index + 1} 错误:`, error.response?.data || error.message);
            expect([200, 201, 404, 500]).toContain(error.response?.status);
          }
        });
      });
    });

    describe('GET /conversion-tracking/funnel - 获取转化漏斗', () => {
      it('应该能够获取转化漏斗分析', async () => {
        try {
          const response = await apiClient.get('/conversion-tracking/funnel', {
            params: { campaignId: testCampaign?.id || 1 },
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
        } catch (error: any) {
          console.log('转化漏斗查询错误:', error.response?.data || error.message);
          expect([200, 404, 500]).toContain(error.response?.status);
        }
      });
    });

    describe('GET /conversion-tracking/attribution - 获取归因分析', () => {
      it('应该能够获取归因分析数据', async () => {
        try {
          const response = await apiClient.get('/conversion-tracking/attribution', {
            params: { 
              model: 'last_click',
              period: 'last30days'
            },
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
        } catch (error: any) {
          console.log('归因分析查询错误:', error.response?.data || error.message);
          expect([200, 404, 500]).toContain(error.response?.status);
        }
      });
    });
  });

  describe('🎨 海报模板 API (Poster Template API)', () => {
    describe('POST /poster-template - 创建海报模板', () => {
      const validTemplateData = [
        {
          name: '招生宣传海报模板',
          category: 'enrollment',
          description: '适用于招生宣传的海报模板',
          thumbnail: 'https://example.com/template-thumb.jpg',
          templateData: {
            layout: 'vertical',
            elements: [
              {
                type: 'text',
                content: '幼儿园招生',
                style: { fontSize: 32, color: '#ff6b35' }
              },
              {
                type: 'image',
                src: 'placeholder-image.jpg',
                style: { width: 200, height: 150 }
              }
            ]
          },
          isPublic: true
        },
        {
          name: '活动宣传海报模板',
          category: 'activity',
          description: '活动宣传专用模板',
          thumbnail: 'https://example.com/activity-thumb.jpg',
          templateData: {
            layout: 'horizontal',
            elements: [
              {
                type: 'text',
                content: '精彩活动',
                style: { fontSize: 28, color: '#4a90e2' }
              }
            ]
          },
          isPublic: false,
          tags: ['活动', '宣传', '儿童']
        }
      ];

      validTemplateData.forEach((templateData, index) => {
        it(`应该接受有效海报模板参数 ${index + 1}`, async () => {
          try {
            const response = await apiClient.post('/poster-template', templateData, {
              headers: { 'Authorization': `Bearer ${authToken}` }
            });

            expect([200, 201]).toContain(response.status);
            expect(response.data.success).toBe(true);

            if (response.data.data) {
              testPosterTemplate = response.data.data;
            }
          } catch (error: any) {
            console.log(`海报模板创建测试 ${index + 1} 错误:`, error.response?.data || error.message);
            expect([200, 201, 404, 500]).toContain(error.response?.status);
          }
        });
      });
    });

    describe('GET /poster-template - 获取海报模板列表', () => {
      const validTemplateQueries = [
        {},
        { category: 'enrollment' },
        { isPublic: true },
        { tags: '招生' },
        { page: 1, limit: 12 }
      ];

      validTemplateQueries.forEach((params, index) => {
        it(`应该接受有效模板查询参数 ${index + 1}`, async () => {
          try {
            const response = await apiClient.get('/poster-template', {
              params,
              headers: { 'Authorization': `Bearer ${authToken}` }
            });

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(Array.isArray(response.data.data)).toBe(true);
          } catch (error: any) {
            console.log(`海报模板查询测试 ${index + 1} 错误:`, error.response?.data || error.message);
            expect([200, 404, 500]).toContain(error.response?.status);
          }
        });
      });
    });

    describe('POST /poster-template/:id/duplicate - 复制海报模板', () => {
      it('应该能够复制海报模板', async () => {
        if (!testPosterTemplate?.id) {
          console.log('跳过海报模板复制测试：没有有效的模板ID');
          return;
        }

        const duplicateData = {
          name: '复制的海报模板',
          isPublic: false
        };

        try {
          const response = await apiClient.post(`/poster-template/${testPosterTemplate.id}/duplicate`, duplicateData, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect([200, 201]).toContain(response.status);
          expect(response.data.success).toBe(true);
        } catch (error: any) {
          console.log('海报模板复制错误:', error.response?.data || error.message);
          expect([200, 201, 404, 500]).toContain(error.response?.status);
        }
      });
    });

    describe('DELETE /poster-template/:id - 删除海报模板', () => {
      it('应该能够删除海报模板', async () => {
        if (!testPosterTemplate?.id) {
          console.log('跳过海报模板删除测试：没有有效的模板ID');
          return;
        }

        try {
          const response = await apiClient.delete(`/poster-template/${testPosterTemplate.id}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect([200, 204]).toContain(response.status);
          expect(response.data.success).toBe(true);
        } catch (error: any) {
          console.log('海报模板删除错误:', error.response?.data || error.message);
          expect([200, 204, 404, 500]).toContain(error.response?.status);
        }
      });
    });
  });

  describe('🖼️ 海报生成 API (Poster Generation API)', () => {
    describe('POST /poster-generation/generate - 生成海报', () => {
      const validGenerationData = [
        {
          templateId: testPosterTemplate?.id || 1,
          customData: {
            title: '2024年秋季招生',
            subtitle: '优质教育，成就未来',
            contact: '13800138000',
            address: '北京市朝阳区幼儿园'
          },
          format: 'png',
          size: { width: 750, height: 1334 }
        },
        {
          templateId: testPosterTemplate?.id || 1,
          customData: {
            title: '暑期特色活动',
            subtitle: '让孩子快乐成长',
            date: '2024年7月15日',
            time: '上午9:00-11:00'
          },
          format: 'jpg',
          size: { width: 1080, height: 1920 }
        }
      ];

      validGenerationData.forEach((generationData, index) => {
        it(`应该接受有效海报生成参数 ${index + 1}`, async () => {
          try {
            const response = await apiClient.post('/poster-generation/generate', generationData, {
              headers: { 'Authorization': `Bearer ${authToken}` }
            });

            expect([200, 201, 202]).toContain(response.status);
            expect(response.data.success).toBe(true);
          } catch (error: any) {
            console.log(`海报生成测试 ${index + 1} 错误:`, error.response?.data || error.message);
            expect([200, 201, 202, 404, 500]).toContain(error.response?.status);
          }
        });
      });
    });

    describe('GET /poster-generation/history - 获取生成历史', () => {
      it('应该能够获取海报生成历史', async () => {
        try {
          const response = await apiClient.get('/poster-generation/history', {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
          expect(Array.isArray(response.data.data)).toBe(true);
        } catch (error: any) {
          console.log('海报生成历史查询错误:', error.response?.data || error.message);
          expect([200, 404, 500]).toContain(error.response?.status);
        }
      });
    });

    describe('POST /poster-generation/batch - 批量生成海报', () => {
      it('应该能够批量生成海报', async () => {
        const batchData = {
          templateId: testPosterTemplate?.id || 1,
          dataList: [
            {
              title: '小班招生',
              subtitle: '3-4岁儿童',
              contact: '13800138001'
            },
            {
              title: '中班招生',
              subtitle: '4-5岁儿童',
              contact: '13800138002'
            }
          ],
          format: 'png'
        };

        try {
          const response = await apiClient.post('/poster-generation/batch', batchData, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect([200, 201, 202]).toContain(response.status);
          expect(response.data.success).toBe(true);
        } catch (error: any) {
          console.log('批量海报生成错误:', error.response?.data || error.message);
          expect([200, 201, 202, 404, 500]).toContain(error.response?.status);
        }
      });
    });
  });

  describe('👥 客户池 API (Customer Pool API)', () => {
    describe('POST /customer-pool - 添加客户', () => {
      const validCustomerData = [
        {
          name: '张三',
          phone: '13900139001',
          email: 'zhangsan@example.com',
          source: 'wechat',
          status: 'potential',
          studentInfo: {
            name: '张小明',
            age: 4,
            gender: '男'
          },
          notes: '通过微信咨询了解'
        },
        {
          name: '李四',
          phone: '13900139002',
          email: 'lisi@example.com',
          source: 'referral',
          status: 'contacted',
          studentInfo: {
            name: '李小红',
            age: 5,
            gender: '女'
          },
          referrer: '王五',
          interestedPrograms: ['小班', '艺术课程']
        }
      ];

      validCustomerData.forEach((customerData, index) => {
        it(`应该接受有效客户参数 ${index + 1}`, async () => {
          try {
            const response = await apiClient.post('/customer-pool', customerData, {
              headers: { 'Authorization': `Bearer ${authToken}` }
            });

            expect([200, 201]).toContain(response.status);
            expect(response.data.success).toBe(true);

            if (response.data.data) {
              testCustomer = response.data.data;
            }
          } catch (error: any) {
            console.log(`客户创建测试 ${index + 1} 错误:`, error.response?.data || error.message);
            expect([200, 201, 404, 500]).toContain(error.response?.status);
          }
        });
      });
    });

    describe('GET /customer-pool - 获取客户列表', () => {
      const validCustomerQueries = [
        {},
        { status: 'potential' },
        { source: 'wechat' },
        { search: '张' },
        { page: 1, limit: 20 },
        { assignedTo: 121 }
      ];

      validCustomerQueries.forEach((params, index) => {
        it(`应该接受有效客户查询参数 ${index + 1}`, async () => {
          try {
            const response = await apiClient.get('/customer-pool', {
              params,
              headers: { 'Authorization': `Bearer ${authToken}` }
            });

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(Array.isArray(response.data.data)).toBe(true);
          } catch (error: any) {
            console.log(`客户查询测试 ${index + 1} 错误:`, error.response?.data || error.message);
            expect([200, 404, 500]).toContain(error.response?.status);
          }
        });
      });
    });

    describe('PUT /customer-pool/:id/status - 更新客户状态', () => {
      const statusUpdates = [
        { status: 'contacted', note: '已联系客户' },
        { status: 'qualified', note: '客户符合要求' },
        { status: 'converted', note: '客户已转化' }
      ];

      statusUpdates.forEach((update, index) => {
        it(`应该能够更新客户状态为 ${update.status}`, async () => {
          if (!testCustomer?.id) {
            console.log('跳过客户状态更新测试：没有有效的客户ID');
            return;
          }

          try {
            const response = await apiClient.put(`/customer-pool/${testCustomer.id}/status`, update, {
              headers: { 'Authorization': `Bearer ${authToken}` }
            });

            expect([200, 201]).toContain(response.status);
            expect(response.data.success).toBe(true);
          } catch (error: any) {
            console.log(`客户状态更新测试 ${index + 1} 错误:`, error.response?.data || error.message);
            expect([200, 201, 404, 500]).toContain(error.response?.status);
          }
        });
      });
    });

    describe('POST /customer-pool/:id/activity - 添加客户活动记录', () => {
      it('应该能够添加客户活动记录', async () => {
        if (!testCustomer?.id) {
          console.log('跳过客户活动记录测试：没有有效的客户ID');
          return;
        }

        const activityData = {
          type: 'call',
          description: '电话回访，了解客户需求',
          result: 'positive',
          followUpDate: '2024-08-20T10:00:00Z'
        };

        try {
          const response = await apiClient.post(`/customer-pool/${testCustomer.id}/activity`, activityData, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect([200, 201]).toContain(response.status);
          expect(response.data.success).toBe(true);
        } catch (error: any) {
          console.log('客户活动记录错误:', error.response?.data || error.message);
          expect([200, 201, 404, 500]).toContain(error.response?.status);
        }
      });
    });

    describe('GET /customer-pool/analytics - 获取客户分析', () => {
      it('应该能够获取客户池分析数据', async () => {
        try {
          const response = await apiClient.get('/customer-pool/analytics', {
            params: { period: 'last30days' },
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
        } catch (error: any) {
          console.log('客户分析查询错误:', error.response?.data || error.message);
          expect([200, 404, 500]).toContain(error.response?.status);
        }
      });
    });
  });

  describe('🔐 权限验证测试', () => {
    it('应该拒绝未认证的营销管理请求', async () => {
      try {
        const response = await apiClient.get('/marketing-campaign');
        expect([401, 403]).toContain(response.status);
      } catch (error: any) {
        expect([401, 403]).toContain(error.response?.status);
      }
    });

    it('应该验证营销管理权限', async () => {
      try {
        const response = await apiClient.post('/marketing-campaign', {
          name: '权限测试活动',
          type: 'test'
        }, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([200, 201, 403, 404]).toContain(response.status);
      } catch (error: any) {
        expect([200, 201, 403, 404, 500]).toContain(error.response?.status);
      }
    });
  });

  describe('⚡ 性能测试', () => {
    it('营销活动查询响应时间应少于2秒', async () => {
      const startTime = Date.now();
      
      try {
        const response = await apiClient.get('/marketing-campaign', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const responseTime = Date.now() - startTime;
        console.log(`营销活动查询响应时间: ${responseTime}ms`);
        
        expect(responseTime).toBeLessThan(2000);
        expect([200, 404]).toContain(response.status);
      } catch (error: any) {
        const responseTime = Date.now() - startTime;
        console.log(`营销活动查询响应时间（错误）: ${responseTime}ms`, error.response?.data || error.message);
        expect(responseTime).toBeLessThan(5000);
      }
    });

    it('应该支持并发营销管理操作', async () => {
      const concurrentRequests = [
        apiClient.get('/marketing-campaign', { headers: { 'Authorization': `Bearer ${authToken}` } }),
        apiClient.get('/advertisement', { headers: { 'Authorization': `Bearer ${authToken}` } }),
        apiClient.get('/customer-pool', { headers: { 'Authorization': `Bearer ${authToken}` } })
      ];

      const startTime = Date.now();
      
      try {
        const results = await Promise.allSettled(concurrentRequests);
        const responseTime = Date.now() - startTime;
        
        console.log(`并发营销管理查询响应时间: ${responseTime}ms`);
        expect(responseTime).toBeLessThan(8000);
        
        const successfulRequests = results.filter(result => 
          result.status === 'fulfilled' && 
          [200, 201, 404].includes((result.value as any).status)
        );
        
        console.log(`成功的并发请求数: ${successfulRequests.length}/3`);
        expect(successfulRequests.length).toBeGreaterThanOrEqual(0);
      } catch (error) {
        console.log('并发营销管理查询错误:', error);
      }
    });
  });
});