import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock Request and Response objects
const createMockRequest = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  user: { id: 1, role: 'admin' },
  file: null,
  files: null,
  ...overrides
});

const createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis()
  };
  return res;
};

const mockNext = jest.fn();

// Mock services
const mockMarketingService = {
  createCampaign: jest.fn(),
  getCampaigns: jest.fn(),
  getCampaignById: jest.fn(),
  updateCampaign: jest.fn(),
  deleteCampaign: jest.fn(),
  startCampaign: jest.fn(),
  pauseCampaign: jest.fn(),
  stopCampaign: jest.fn(),
  getCampaignStats: jest.fn(),
  getCampaignAnalytics: jest.fn(),
  duplicateCampaign: jest.fn(),
  exportCampaignData: jest.fn(),
  getTargetAudience: jest.fn(),
  createTargetAudience: jest.fn(),
  updateTargetAudience: jest.fn(),
  deleteTargetAudience: jest.fn(),
  getLeads: jest.fn(),
  createLead: jest.fn(),
  updateLead: jest.fn(),
  deleteLead: jest.fn(),
  convertLead: jest.fn(),
  getLeadStats: jest.fn(),
  getChannels: jest.fn(),
  createChannel: jest.fn(),
  updateChannel: jest.fn(),
  deleteChannel: jest.fn(),
  getChannelPerformance: jest.fn(),
  getTemplates: jest.fn(),
  createTemplate: jest.fn(),
  updateTemplate: jest.fn(),
  deleteTemplate: jest.fn(),
  previewTemplate: jest.fn(),
  sendTestEmail: jest.fn(),
  getEmailStats: jest.fn(),
  getSMSStats: jest.fn(),
  getROIAnalysis: jest.fn(),
  getConversionFunnel: jest.fn(),
  getCustomerJourney: jest.fn(),
  getMarketingDashboard: jest.fn()
};

const mockEmailService = {
  sendEmail: jest.fn(),
  sendBulkEmail: jest.fn(),
  getEmailTemplate: jest.fn()
};

const mockSMSService = {
  sendSMS: jest.fn(),
  sendBulkSMS: jest.fn(),
  getSMSTemplate: jest.fn()
};

const mockAnalyticsService = {
  trackEvent: jest.fn(),
  getEventStats: jest.fn(),
  generateReport: jest.fn()
};

// Mock imports
jest.unstable_mockModule('../../../../../src/services/marketing/marketing.service', () => ({
  MarketingService: mockMarketingService
}));

jest.unstable_mockModule('../../../../../src/services/email.service', () => mockEmailService);
jest.unstable_mockModule('../../../../../src/services/sms.service', () => mockSMSService);
jest.unstable_mockModule('../../../../../src/services/analytics.service', () => mockAnalyticsService);


// 控制台错误检测
let consoleSpy: any

beforeEach(() => {
  // 监听控制台错误
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  // 验证没有控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})

describe('Marketing Controller', () => {
  let marketingController: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/controllers/marketing.controller');
    marketingController = imported.MarketingController;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCampaign', () => {
    it('应该成功创建营销活动', async () => {
      const req = createMockRequest({
        body: {
          name: '春季招生活动',
          type: 'enrollment',
          description: '针对新学期的招生推广活动',
          targetAudience: {
            ageRange: [3, 6],
            location: ['北京', '上海'],
            interests: ['教育', '幼儿发展']
          },
          channels: ['email', 'sms', 'social_media'],
          budget: 50000,
          startDate: '2024-03-01',
          endDate: '2024-04-30',
          goals: {
            leads: 500,
            conversions: 100,
            roi: 3.0
          }
        }
      });
      const res = createMockResponse();

      const mockCampaign = {
        id: 1,
        name: '春季招生活动',
        type: 'enrollment',
        status: 'draft',
        budget: 50000,
        createdAt: new Date(),
        createdBy: 1
      };

      mockMarketingService.createCampaign.mockResolvedValue(mockCampaign);

      await marketingController.createCampaign(req, res, mockNext);

      expect(mockMarketingService.createCampaign).toHaveBeenCalledWith({
        ...req.body,
        createdBy: req.user.id
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCampaign,
        message: '营销活动创建成功'
      });
    });

    it('应该处理创建失败的情况', async () => {
      const req = createMockRequest({
        body: {
          name: '测试活动',
          type: 'enrollment'
        }
      });
      const res = createMockResponse();

      const error = new Error('预算不能为空');
      mockMarketingService.createCampaign.mockRejectedValue(error);

      await marketingController.createCampaign(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('应该验证必填字段', async () => {
      const req = createMockRequest({
        body: {
          type: 'enrollment'
          // 缺少name字段
        }
      });
      const res = createMockResponse();

      const error = new Error('活动名称是必填项');
      mockMarketingService.createCampaign.mockRejectedValue(error);

      await marketingController.createCampaign(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getCampaigns', () => {
    it('应该获取营销活动列表', async () => {
      const req = createMockRequest({
        query: {
          page: '1',
          pageSize: '10',
          status: 'active',
          type: 'enrollment'
        }
      });
      const res = createMockResponse();

      const mockCampaigns = {
        campaigns: [
          {
            id: 1,
            name: '春季招生活动',
            type: 'enrollment',
            status: 'active',
            budget: 50000,
            spent: 25000,
            leads: 250,
            conversions: 50
          },
          {
            id: 2,
            name: '夏令营推广',
            type: 'activity',
            status: 'active',
            budget: 30000,
            spent: 15000,
            leads: 180,
            conversions: 35
          }
        ],
        total: 2,
        page: 1,
        pageSize: 10
      };

      mockMarketingService.getCampaigns.mockResolvedValue(mockCampaigns);

      await marketingController.getCampaigns(req, res, mockNext);

      expect(mockMarketingService.getCampaigns).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        status: 'active',
        type: 'enrollment'
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCampaigns
      });
    });

    it('应该支持搜索功能', async () => {
      const req = createMockRequest({
        query: {
          search: '招生',
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }
      });
      const res = createMockResponse();

      mockMarketingService.getCampaigns.mockResolvedValue({
        campaigns: [],
        total: 0,
        page: 1,
        pageSize: 10
      });

      await marketingController.getCampaigns(req, res, mockNext);

      expect(mockMarketingService.getCampaigns).toHaveBeenCalledWith({
        search: '招生',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
    });
  });

  describe('getCampaignById', () => {
    it('应该获取指定营销活动详情', async () => {
      const req = createMockRequest({
        params: { id: '1' }
      });
      const res = createMockResponse();

      const mockCampaign = {
        id: 1,
        name: '春季招生活动',
        type: 'enrollment',
        status: 'active',
        description: '针对新学期的招生推广活动',
        targetAudience: {
          ageRange: [3, 6],
          location: ['北京', '上海']
        },
        channels: ['email', 'sms'],
        budget: 50000,
        spent: 25000,
        performance: {
          impressions: 10000,
          clicks: 500,
          leads: 250,
          conversions: 50,
          ctr: 0.05,
          conversionRate: 0.2,
          cpa: 500,
          roi: 2.5
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockMarketingService.getCampaignById.mockResolvedValue(mockCampaign);

      await marketingController.getCampaignById(req, res, mockNext);

      expect(mockMarketingService.getCampaignById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCampaign
      });
    });

    it('应该处理活动不存在的情况', async () => {
      const req = createMockRequest({
        params: { id: '999' }
      });
      const res = createMockResponse();

      mockMarketingService.getCampaignById.mockResolvedValue(null);

      await marketingController.getCampaignById(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '营销活动不存在'
      });
    });
  });

  describe('updateCampaign', () => {
    it('应该成功更新营销活动', async () => {
      const req = createMockRequest({
        params: { id: '1' },
        body: {
          name: '春季招生活动（更新）',
          budget: 60000,
          targetAudience: {
            ageRange: [3, 7],
            location: ['北京', '上海', '广州']
          }
        }
      });
      const res = createMockResponse();

      const mockUpdatedCampaign = {
        id: 1,
        name: '春季招生活动（更新）',
        budget: 60000,
        updatedAt: new Date()
      };

      mockMarketingService.updateCampaign.mockResolvedValue(mockUpdatedCampaign);

      await marketingController.updateCampaign(req, res, mockNext);

      expect(mockMarketingService.updateCampaign).toHaveBeenCalledWith(1, req.body);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedCampaign,
        message: '营销活动更新成功'
      });
    });

    it('应该处理更新不存在的活动', async () => {
      const req = createMockRequest({
        params: { id: '999' },
        body: { name: '不存在的活动' }
      });
      const res = createMockResponse();

      mockMarketingService.updateCampaign.mockResolvedValue(null);

      await marketingController.updateCampaign(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '营销活动不存在'
      });
    });
  });

  describe('deleteCampaign', () => {
    it('应该成功删除营销活动', async () => {
      const req = createMockRequest({
        params: { id: '1' }
      });
      const res = createMockResponse();

      mockMarketingService.deleteCampaign.mockResolvedValue(undefined);

      await marketingController.deleteCampaign(req, res, mockNext);

      expect(mockMarketingService.deleteCampaign).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '营销活动删除成功'
      });
    });

    it('应该处理删除不存在的活动', async () => {
      const req = createMockRequest({
        params: { id: '999' }
      });
      const res = createMockResponse();

      mockMarketingService.deleteCampaign.mockResolvedValue(undefined);

      await marketingController.deleteCampaign(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '营销活动不存在'
      });
    });
  });

  describe('startCampaign', () => {
    it('应该成功启动营销活动', async () => {
      const req = createMockRequest({
        params: { id: '1' }
      });
      const res = createMockResponse();

      const mockStartedCampaign = {
        id: 1,
        name: '春季招生活动',
        status: 'active',
        startedAt: new Date()
      };

      mockMarketingService.startCampaign.mockResolvedValue(mockStartedCampaign);

      await marketingController.startCampaign(req, res, mockNext);

      expect(mockMarketingService.startCampaign).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockStartedCampaign,
        message: '营销活动启动成功'
      });
    });

    it('应该处理启动失败的情况', async () => {
      const req = createMockRequest({
        params: { id: '1' }
      });
      const res = createMockResponse();

      const error = new Error('活动配置不完整，无法启动');
      mockMarketingService.startCampaign.mockRejectedValue(error);

      await marketingController.startCampaign(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('pauseCampaign', () => {
    it('应该成功暂停营销活动', async () => {
      const req = createMockRequest({
        params: { id: '1' }
      });
      const res = createMockResponse();

      const mockPausedCampaign = {
        id: 1,
        name: '春季招生活动',
        status: 'paused',
        pausedAt: new Date()
      };

      mockMarketingService.pauseCampaign.mockResolvedValue(mockPausedCampaign);

      await marketingController.pauseCampaign(req, res, mockNext);

      expect(mockMarketingService.pauseCampaign).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockPausedCampaign,
        message: '营销活动暂停成功'
      });
    });
  });

  describe('stopCampaign', () => {
    it('应该成功停止营销活动', async () => {
      const req = createMockRequest({
        params: { id: '1' }
      });
      const res = createMockResponse();

      const mockStoppedCampaign = {
        id: 1,
        name: '春季招生活动',
        status: 'stopped',
        stoppedAt: new Date()
      };

      mockMarketingService.stopCampaign.mockResolvedValue(mockStoppedCampaign);

      await marketingController.stopCampaign(req, res, mockNext);

      expect(mockMarketingService.stopCampaign).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockStoppedCampaign,
        message: '营销活动停止成功'
      });
    });
  });

  describe('getCampaignStats', () => {
    it('应该获取营销活动统计数据', async () => {
      const req = createMockRequest({
        params: { id: '1' },
        query: {
          period: '30d',
          metrics: 'impressions,clicks,conversions'
        }
      });
      const res = createMockResponse();

      const mockStats = {
        campaignId: 1,
        period: '30d',
        metrics: {
          impressions: 15000,
          clicks: 750,
          leads: 375,
          conversions: 75,
          spend: 30000,
          ctr: 0.05,
          conversionRate: 0.2,
          cpa: 400,
          roi: 2.8
        },
        trends: {
          impressions: [500, 600, 550, 700, 800],
          clicks: [25, 30, 28, 35, 40],
          conversions: [5, 6, 5, 7, 8]
        },
        breakdown: {
          byChannel: {
            email: { impressions: 8000, clicks: 400, conversions: 40 },
            sms: { impressions: 4000, clicks: 200, conversions: 20 },
            social_media: { impressions: 3000, clicks: 150, conversions: 15 }
          },
          byAudience: {
            'age_3_4': { impressions: 5000, clicks: 250, conversions: 25 },
            'age_5_6': { impressions: 10000, clicks: 500, conversions: 50 }
          }
        }
      };

      mockMarketingService.getCampaignStats.mockResolvedValue(mockStats);

      await marketingController.getCampaignStats(req, res, mockNext);

      expect(mockMarketingService.getCampaignStats).toHaveBeenCalledWith(1, {
        period: '30d',
        metrics: 'impressions,clicks,conversions'
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockStats
      });
    });
  });

  describe('getCampaignAnalytics', () => {
    it('应该获取营销活动分析数据', async () => {
      const req = createMockRequest({
        params: { id: '1' },
        query: {
          startDate: '2024-03-01',
          endDate: '2024-03-31'
        }
      });
      const res = createMockResponse();

      const mockAnalytics = {
        campaignId: 1,
        period: {
          startDate: '2024-03-01',
          endDate: '2024-03-31'
        },
        performance: {
          totalImpressions: 20000,
          totalClicks: 1000,
          totalLeads: 500,
          totalConversions: 100,
          totalSpend: 40000,
          averageCTR: 0.05,
          averageConversionRate: 0.2,
          averageCPA: 400,
          totalROI: 3.2
        },
        insights: [
          {
            type: 'optimization',
            message: '邮件渠道表现最佳，建议增加预算分配',
            priority: 'high'
          },
          {
            type: 'warning',
            message: '社交媒体渠道转化率偏低，需要优化创意',
            priority: 'medium'
          }
        ],
        recommendations: [
          {
            action: 'increase_budget',
            channel: 'email',
            expectedImprovement: '提升20%转化率'
          },
          {
            action: 'optimize_creative',
            channel: 'social_media',
            expectedImprovement: '提升15%点击率'
          }
        ]
      };

      mockMarketingService.getCampaignAnalytics.mockResolvedValue(mockAnalytics);

      await marketingController.getCampaignAnalytics(req, res, mockNext);

      expect(mockMarketingService.getCampaignAnalytics).toHaveBeenCalledWith(1, {
        startDate: '2024-03-01',
        endDate: '2024-03-31'
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockAnalytics
      });
    });
  });

  describe('duplicateCampaign', () => {
    it('应该成功复制营销活动', async () => {
      const req = createMockRequest({
        params: { id: '1' },
        body: {
          name: '春季招生活动（副本）',
          startDate: '2024-05-01',
          endDate: '2024-06-30'
        }
      });
      const res = createMockResponse();

      const mockDuplicatedCampaign = {
        id: 2,
        name: '春季招生活动（副本）',
        type: 'enrollment',
        status: 'draft',
        budget: 50000,
        startDate: '2024-05-01',
        endDate: '2024-06-30',
        createdAt: new Date()
      };

      mockMarketingService.duplicateCampaign.mockResolvedValue(mockDuplicatedCampaign);

      await marketingController.duplicateCampaign(req, res, mockNext);

      expect(mockMarketingService.duplicateCampaign).toHaveBeenCalledWith(1, req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockDuplicatedCampaign,
        message: '营销活动复制成功'
      });
    });
  });

  describe('exportCampaignData', () => {
    it('应该成功导出营销活动数据', async () => {
      const req = createMockRequest({
        params: { id: '1' },
        query: {
          format: 'excel',
          includeStats: 'true',
          startDate: '2024-03-01',
          endDate: '2024-03-31'
        }
      });
      const res = createMockResponse();

      const mockExportResult = {
        filename: 'campaign_1_data.xlsx',
        downloadUrl: '/downloads/campaign_1_data.xlsx',
        size: 2048000,
        generatedAt: new Date()
      };

      mockMarketingService.exportCampaignData.mockResolvedValue(mockExportResult);

      await marketingController.exportCampaignData(req, res, mockNext);

      expect(mockMarketingService.exportCampaignData).toHaveBeenCalledWith(1, {
        format: 'excel',
        includeStats: true,
        startDate: '2024-03-01',
        endDate: '2024-03-31'
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockExportResult,
        message: '数据导出成功'
      });
    });

    it('应该支持多种导出格式', async () => {
      const req = createMockRequest({
        params: { id: '1' },
        query: { format: 'csv' }
      });
      const res = createMockResponse();

      const mockExportResult = {
        filename: 'campaign_1_data.csv',
        downloadUrl: '/downloads/campaign_1_data.csv',
        size: 1024000
      };

      mockMarketingService.exportCampaignData.mockResolvedValue(mockExportResult);

      await marketingController.exportCampaignData(req, res, mockNext);

      expect(mockMarketingService.exportCampaignData).toHaveBeenCalledWith(1, {
        format: 'csv'
      });
    });
  });

  describe('getLeads', () => {
    it('应该获取潜在客户列表', async () => {
      const req = createMockRequest({
        query: {
          page: '1',
          pageSize: '20',
          status: 'new',
          source: 'campaign_1'
        }
      });
      const res = createMockResponse();

      const mockLeads = {
        leads: [
          {
            id: 1,
            name: '张三',
            phone: '13800138000',
            email: 'zhangsan@example.com',
            source: 'campaign_1',
            status: 'new',
            score: 85,
            createdAt: new Date()
          },
          {
            id: 2,
            name: '李四',
            phone: '13800138001',
            email: 'lisi@example.com',
            source: 'campaign_1',
            status: 'contacted',
            score: 72,
            createdAt: new Date()
          }
        ],
        total: 2,
        page: 1,
        pageSize: 20
      };

      mockMarketingService.getLeads.mockResolvedValue(mockLeads);

      await marketingController.getLeads(req, res, mockNext);

      expect(mockMarketingService.getLeads).toHaveBeenCalledWith({
        page: 1,
        pageSize: 20,
        status: 'new',
        source: 'campaign_1'
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockLeads
      });
    });
  });

  describe('createLead', () => {
    it('应该成功创建潜在客户', async () => {
      const req = createMockRequest({
        body: {
          name: '王五',
          phone: '13800138002',
          email: 'wangwu@example.com',
          source: 'website',
          interests: ['幼儿教育', '艺术培养'],
          notes: '对我们的教学理念很感兴趣'
        }
      });
      const res = createMockResponse();

      const mockLead = {
        id: 3,
        name: '王五',
        phone: '13800138002',
        email: 'wangwu@example.com',
        source: 'website',
        status: 'new',
        score: 60,
        createdAt: new Date()
      };

      mockMarketingService.createLead.mockResolvedValue(mockLead);

      await marketingController.createLead(req, res, mockNext);

      expect(mockMarketingService.createLead).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockLead,
        message: '潜在客户创建成功'
      });
    });
  });

  describe('convertLead', () => {
    it('应该成功转化潜在客户', async () => {
      const req = createMockRequest({
        params: { id: '1' },
        body: {
          conversionType: 'enrollment',
          notes: '已完成入学手续',
          value: 12000
        }
      });
      const res = createMockResponse();

      const mockConvertedLead = {
        id: 1,
        name: '张三',
        status: 'converted',
        conversionType: 'enrollment',
        conversionValue: 12000,
        convertedAt: new Date()
      };

      mockMarketingService.convertLead.mockResolvedValue(mockConvertedLead);

      await marketingController.convertLead(req, res, mockNext);

      expect(mockMarketingService.convertLead).toHaveBeenCalledWith(1, req.body);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockConvertedLead,
        message: '潜在客户转化成功'
      });
    });
  });

  describe('getMarketingDashboard', () => {
    it('应该获取营销仪表盘数据', async () => {
      const req = createMockRequest({
        query: {
          period: '30d'
        }
      });
      const res = createMockResponse();

      const mockDashboard = {
        overview: {
          totalCampaigns: 5,
          activeCampaigns: 3,
          totalLeads: 1250,
          totalConversions: 250,
          totalSpend: 150000,
          totalRevenue: 480000,
          overallROI: 3.2
        },
        performance: {
          topCampaigns: [
            { id: 1, name: '春季招生活动', conversions: 100, roi: 4.2 },
            { id: 2, name: '夏令营推广', conversions: 75, roi: 3.8 }
          ],
          topChannels: [
            { channel: 'email', conversions: 120, roi: 3.9 },
            { channel: 'sms', conversions: 80, roi: 3.2 }
          ]
        },
        trends: {
          leads: [45, 52, 48, 65, 58, 72, 68],
          conversions: [8, 12, 10, 15, 13, 18, 16],
          spend: [5000, 6000, 5500, 7000, 6500, 8000, 7500]
        },
        insights: [
          {
            type: 'success',
            message: '本月转化率提升了15%',
            priority: 'high'
          },
          {
            type: 'opportunity',
            message: '邮件渠道表现优异，建议增加投入',
            priority: 'medium'
          }
        ]
      };

      mockMarketingService.getMarketingDashboard.mockResolvedValue(mockDashboard);

      await marketingController.getMarketingDashboard(req, res, mockNext);

      expect(mockMarketingService.getMarketingDashboard).toHaveBeenCalledWith({
        period: '30d'
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockDashboard
      });
    });
  });

  describe('错误处理', () => {
    it('应该处理服务层错误', async () => {
      const req = createMockRequest({
        body: { name: '测试活动' }
      });
      const res = createMockResponse();

      const error = new Error('数据库连接失败');
      mockMarketingService.createCampaign.mockRejectedValue(error);

      await marketingController.createCampaign(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('应该处理无效的参数', async () => {
      const req = createMockRequest({
        params: { id: 'invalid' }
      });
      const res = createMockResponse();

      const error = new Error('无效的活动ID');
      mockMarketingService.getCampaignById.mockRejectedValue(error);

      await marketingController.getCampaignById(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('应该处理权限不足的情况', async () => {
      const req = createMockRequest({
        user: { id: 2, role: 'teacher' }, // 非管理员用户
        params: { id: '1' }
      });
      const res = createMockResponse();

      const error = new Error('权限不足');
      mockMarketingService.deleteCampaign.mockRejectedValue(error);

      await marketingController.deleteCampaign(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
