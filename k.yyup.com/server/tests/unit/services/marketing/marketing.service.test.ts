import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock models
const mockMarketingCampaignModel = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  count: jest.fn(),
  findAndCountAll: jest.fn()
};

const mockLeadModel = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  count: jest.fn(),
  findAndCountAll: jest.fn()
};

const mockMarketingEventModel = {
  findAll: jest.fn(),
  create: jest.fn(),
  destroy: jest.fn()
};

const mockStudentModel = {
  findAll: jest.fn(),
  count: jest.fn()
};

const mockEnrollmentModel = {
  findAll: jest.fn(),
  count: jest.fn()
};

// Mock services
const mockEmailService = {
  sendEmail: jest.fn(),
  sendBulkEmail: jest.fn(),
  sendCampaignEmail: jest.fn(),
  sendWelcomeEmail: jest.fn(),
  sendFollowUpEmail: jest.fn()
};

const mockSMSService = {
  sendSMS: jest.fn(),
  sendBulkSMS: jest.fn(),
  sendCampaignSMS: jest.fn()
};

const mockAnalyticsService = {
  trackEvent: jest.fn(),
  trackConversion: jest.fn(),
  getMetrics: jest.fn(),
  generateReport: jest.fn()
};

const mockValidationService = {
  validateCampaignData: jest.fn(),
  validateLeadData: jest.fn(),
  validateEmail: jest.fn(),
  validatePhone: jest.fn()
};

const mockFileService = {
  uploadFile: jest.fn(),
  deleteFile: jest.fn(),
  getFileUrl: jest.fn()
};

// Mock utilities
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
};

const mockRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  exists: jest.fn()
};

// Mock database transaction
const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn()
};

const mockSequelize = {
  transaction: jest.fn().mockResolvedValue(mockTransaction),
  Op: {
    and: Symbol('and'),
    or: Symbol('or'),
    in: Symbol('in'),
    like: Symbol('like'),
    between: Symbol('between'),
    gte: Symbol('gte'),
    lte: Symbol('lte')
  }
};

// Mock imports
jest.unstable_mockModule('../../../../../../src/models/marketing-campaign.model', () => ({
  default: mockMarketingCampaignModel
}));

jest.unstable_mockModule('../../../../../../src/models/lead.model', () => ({
  default: mockLeadModel
}));

jest.unstable_mockModule('../../../../../../src/models/marketing-event.model', () => ({
  default: mockMarketingEventModel
}));

jest.unstable_mockModule('../../../../../../src/models/student.model', () => ({
  default: mockStudentModel
}));

jest.unstable_mockModule('../../../../../../src/models/enrollment.model', () => ({
  default: mockEnrollmentModel
}));

jest.unstable_mockModule('../../../../../../src/services/email/email.service', () => ({
  default: mockEmailService
}));

jest.unstable_mockModule('../../../../../../src/services/sms/sms.service', () => ({
  default: mockSMSService
}));

jest.unstable_mockModule('../../../../../../src/services/analytics/analytics.service', () => ({
  default: mockAnalyticsService
}));

jest.unstable_mockModule('../../../../../../src/services/validation/validation.service', () => ({
  default: mockValidationService
}));

jest.unstable_mockModule('../../../../../../src/services/file/file.service', () => ({
  default: mockFileService
}));

jest.unstable_mockModule('../../../../../../src/utils/logger', () => ({
  default: mockLogger
}));

jest.unstable_mockModule('../../../../../../src/config/redis', () => ({
  default: mockRedisClient
}));

jest.unstable_mockModule('../../../../../../src/config/database', () => ({
  default: mockSequelize
}));


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

describe('MarketingService', () => {
  let marketingService: any;

  beforeAll(async () => {
    const imported = await import('../../../../../../src/services/marketing/marketing.service');
    marketingService = imported.default || imported.MarketingService || imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCampaign', () => {
    it('应该成功创建营销活动', async () => {
      const campaignData = {
        name: '春季招生活动',
        description: '针对3-6岁儿童的春季招生推广活动',
        type: 'enrollment',
        status: 'draft',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-04-30'),
        budget: 10000.00,
        targetAudience: {
          ageRange: '3-6',
          location: ['朝阳区', '海淀区'],
          interests: ['早教', '双语教学']
        },
        channels: ['email', 'sms', 'social_media'],
        content: {
          title: '春季招生优惠',
          message: '现在报名享受8折优惠',
          images: ['/uploads/campaigns/spring-enrollment.jpg']
        },
        goals: {
          leads: 500,
          conversions: 50,
          revenue: 150000.00
        },
        kindergartenId: 1,
        createdBy: 1
      };

      const mockCreatedCampaign = {
        id: 1,
        ...campaignData,
        metrics: {
          impressions: 0,
          clicks: 0,
          leads: 0,
          conversions: 0,
          cost: 0,
          revenue: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockValidationService.validateCampaignData.mockResolvedValue({ isValid: true });
      mockMarketingCampaignModel.create.mockResolvedValue(mockCreatedCampaign);
      mockAnalyticsService.trackEvent.mockResolvedValue(undefined);

      const result = await marketingService.createCampaign(campaignData);

      expect(mockValidationService.validateCampaignData).toHaveBeenCalledWith(campaignData);
      expect(mockMarketingCampaignModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: '春季招生活动',
          type: 'enrollment',
          status: 'draft'
        }),
        { transaction: mockTransaction }
      );
      expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('campaign_created', {
        campaignId: 1,
        type: 'enrollment'
      });
      expect(result).toEqual(expect.objectContaining({
        id: 1,
        name: '春季招生活动',
        status: 'draft'
      }));
    });

    it('应该验证活动数据', async () => {
      const invalidData = {
        name: '',
        type: 'invalid_type',
        startDate: new Date('2024-04-30'),
        endDate: new Date('2024-03-01'), // 结束日期早于开始日期
        budget: -1000
      };

      mockValidationService.validateCampaignData.mockResolvedValue({
        isValid: false,
        errors: [
          'Campaign name is required',
          'Invalid campaign type',
          'End date must be after start date',
          'Budget must be positive'
        ]
      });

      await expect(marketingService.createCampaign(invalidData))
        .rejects.toThrow('Campaign validation failed');

      expect(mockValidationService.validateCampaignData).toHaveBeenCalledWith(invalidData);
      expect(mockMarketingCampaignModel.create).not.toHaveBeenCalled();
    });

    it('应该处理文件上传', async () => {
      const campaignData = {
        name: '夏季活动',
        type: 'event',
        content: {
          images: [
            { file: 'base64imagedata1', filename: 'summer1.jpg' },
            { file: 'base64imagedata2', filename: 'summer2.jpg' }
          ]
        }
      };

      const uploadedImages = [
        '/uploads/campaigns/summer1.jpg',
        '/uploads/campaigns/summer2.jpg'
      ];

      mockValidationService.validateCampaignData.mockResolvedValue({ isValid: true });
      mockFileService.uploadFile.mockImplementation((file, filename) => 
        Promise.resolve(`/uploads/campaigns/${filename}`)
      );
      mockMarketingCampaignModel.create.mockResolvedValue({
        id: 1,
        ...campaignData,
        content: { ...campaignData.content, images: uploadedImages }
      });

      const result = await marketingService.createCampaign(campaignData);

      expect(mockFileService.uploadFile).toHaveBeenCalledTimes(2);
      expect(result.content.images).toEqual(uploadedImages);
    });
  });

  describe('launchCampaign', () => {
    it('应该成功启动营销活动', async () => {
      const campaignId = 1;
      const launchOptions = {
        scheduleTime: new Date('2024-03-01T09:00:00'),
        testGroup: false,
        autoOptimize: true
      };

      const mockCampaign = {
        id: 1,
        name: '春季招生活动',
        status: 'draft',
        channels: ['email', 'sms'],
        targetAudience: { ageRange: '3-6' },
        content: { title: '春季招生优惠', message: '现在报名享受8折优惠' },
        update: jest.fn().mockResolvedValue({
          id: 1,
          status: 'active',
          launchedAt: new Date()
        })
      };

      const mockTargetLeads = [
        { id: 1, email: 'parent1@example.com', phone: '13800138001' },
        { id: 2, email: 'parent2@example.com', phone: '13800138002' }
      ];

      mockMarketingCampaignModel.findByPk.mockResolvedValue(mockCampaign);
      mockLeadModel.findAll.mockResolvedValue(mockTargetLeads);
      mockEmailService.sendCampaignEmail.mockResolvedValue({ sent: 2, failed: 0 });
      mockSMSService.sendCampaignSMS.mockResolvedValue({ sent: 2, failed: 0 });

      const result = await marketingService.launchCampaign(campaignId, launchOptions);

      expect(mockMarketingCampaignModel.findByPk).toHaveBeenCalledWith(campaignId);
      expect(mockLeadModel.findAll).toHaveBeenCalledWith({
        where: expect.objectContaining({
          ageRange: '3-6'
        })
      });
      expect(mockEmailService.sendCampaignEmail).toHaveBeenCalledWith(
        mockTargetLeads,
        expect.objectContaining({
          title: '春季招生优惠',
          message: '现在报名享受8折优惠'
        })
      );
      expect(mockSMSService.sendCampaignSMS).toHaveBeenCalledWith(
        mockTargetLeads,
        expect.any(String)
      );
      expect(mockCampaign.update).toHaveBeenCalledWith({
        status: 'active',
        launchedAt: expect.any(Date)
      });
      expect(result.status).toBe('launched');
      expect(result.emailsSent).toBe(2);
      expect(result.smsSent).toBe(2);
    });

    it('应该检查活动状态', async () => {
      const campaignId = 1;

      const mockActiveCampaign = {
        id: 1,
        status: 'active'
      };

      mockMarketingCampaignModel.findByPk.mockResolvedValue(mockActiveCampaign);

      await expect(marketingService.launchCampaign(campaignId, {}))
        .rejects.toThrow('Campaign is already active');

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Attempted to launch already active campaign',
        expect.any(Object)
      );
    });

    it('应该处理目标受众为空的情况', async () => {
      const campaignId = 1;

      const mockCampaign = {
        id: 1,
        status: 'draft',
        targetAudience: { ageRange: '7-8' } // 没有匹配的潜在客户
      };

      mockMarketingCampaignModel.findByPk.mockResolvedValue(mockCampaign);
      mockLeadModel.findAll.mockResolvedValue([]);

      await expect(marketingService.launchCampaign(campaignId, {}))
        .rejects.toThrow('No target audience found for this campaign');

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Campaign has no target audience',
        expect.any(Object)
      );
    });
  });

  describe('trackCampaignMetrics', () => {
    it('应该跟踪活动指标', async () => {
      const campaignId = 1;
      const metrics = {
        impressions: 1000,
        clicks: 50,
        leads: 10,
        conversions: 2,
        cost: 500.00,
        revenue: 6000.00
      };

      const mockCampaign = {
        id: 1,
        metrics: {
          impressions: 500,
          clicks: 25,
          leads: 5,
          conversions: 1,
          cost: 250.00,
          revenue: 3000.00
        },
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockMarketingCampaignModel.findByPk.mockResolvedValue(mockCampaign);

      const result = await marketingService.trackCampaignMetrics(campaignId, metrics);

      expect(mockMarketingCampaignModel.findByPk).toHaveBeenCalledWith(campaignId);
      expect(mockCampaign.update).toHaveBeenCalledWith({
        metrics: {
          impressions: 1500, // 累加
          clicks: 75,
          leads: 15,
          conversions: 3,
          cost: 750.00,
          revenue: 9000.00
        }
      });
      expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('campaign_metrics_updated', {
        campaignId: 1,
        metrics: expect.any(Object)
      });
      expect(result.success).toBe(true);
    });

    it('应该计算转化率和ROI', async () => {
      const campaignId = 1;
      const metrics = {
        impressions: 1000,
        clicks: 100,
        leads: 20,
        conversions: 5,
        cost: 1000.00,
        revenue: 15000.00
      };

      const mockCampaign = {
        id: 1,
        metrics: { impressions: 0, clicks: 0, leads: 0, conversions: 0, cost: 0, revenue: 0 },
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockMarketingCampaignModel.findByPk.mockResolvedValue(mockCampaign);

      const result = await marketingService.trackCampaignMetrics(campaignId, metrics);

      expect(result.calculatedMetrics).toEqual({
        clickThroughRate: 0.1, // 100/1000
        conversionRate: 0.25, // 5/20
        costPerLead: 50.00, // 1000/20
        costPerConversion: 200.00, // 1000/5
        returnOnInvestment: 14.0 // (15000-1000)/1000
      });
    });
  });

  describe('createLead', () => {
    it('应该成功创建潜在客户', async () => {
      const leadData = {
        name: '张三',
        email: 'zhang@example.com',
        phone: '13800138001',
        source: 'website',
        campaign: 'spring_enrollment',
        interests: ['小班教育', '双语教学'],
        childInfo: {
          name: '张小明',
          age: 4,
          gender: 'male'
        },
        contactPreference: 'email',
        notes: '对双语教学很感兴趣',
        kindergartenId: 1
      };

      const mockCreatedLead = {
        id: 1,
        ...leadData,
        status: 'new',
        score: 75,
        lastContactAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockValidationService.validateLeadData.mockResolvedValue({ isValid: true });
      mockLeadModel.create.mockResolvedValue(mockCreatedLead);
      mockEmailService.sendWelcomeEmail.mockResolvedValue(undefined);
      mockAnalyticsService.trackEvent.mockResolvedValue(undefined);

      const result = await marketingService.createLead(leadData);

      expect(mockValidationService.validateLeadData).toHaveBeenCalledWith(leadData);
      expect(mockLeadModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: '张三',
          email: 'zhang@example.com',
          status: 'new',
          score: expect.any(Number)
        }),
        { transaction: mockTransaction }
      );
      expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith(
        'zhang@example.com',
        expect.any(Object)
      );
      expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('lead_created', {
        leadId: 1,
        source: 'website'
      });
      expect(result).toEqual(expect.objectContaining({
        id: 1,
        name: '张三',
        status: 'new'
      }));
    });

    it('应该验证潜在客户数据', async () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        phone: '123',
        childInfo: {
          age: -1
        }
      };

      mockValidationService.validateLeadData.mockResolvedValue({
        isValid: false,
        errors: [
          'Name is required',
          'Invalid email format',
          'Invalid phone number',
          'Child age must be positive'
        ]
      });

      await expect(marketingService.createLead(invalidData))
        .rejects.toThrow('Lead validation failed');

      expect(mockValidationService.validateLeadData).toHaveBeenCalledWith(invalidData);
      expect(mockLeadModel.create).not.toHaveBeenCalled();
    });

    it('应该计算潜在客户评分', async () => {
      const leadData = {
        name: '李四',
        email: 'li@example.com',
        phone: '13800138002',
        source: 'referral', // 高分来源
        interests: ['小班教育', '双语教学', '艺术教育'], // 多个兴趣
        childInfo: { age: 4 }, // 目标年龄段
        contactPreference: 'phone'
      };

      mockValidationService.validateLeadData.mockResolvedValue({ isValid: true });
      mockLeadModel.create.mockImplementation((data) => {
        // 模拟评分计算
        let score = 50; // 基础分
        if (data.source === 'referral') score += 20;
        if (data.interests && data.interests.length > 2) score += 15;
        if (data.childInfo && data.childInfo.age >= 3 && data.childInfo.age <= 6) score += 10;
        
        return Promise.resolve({
          id: 2,
          ...data,
          score,
          status: 'new'
        });
      });

      const result = await marketingService.createLead(leadData);

      expect(result.score).toBe(95); // 50 + 20 + 15 + 10
    });

    it('应该处理重复邮箱', async () => {
      const leadData = {
        name: '王五',
        email: 'zhang@example.com', // 已存在的邮箱
        phone: '13800138003'
      };

      const existingLead = {
        id: 1,
        email: 'zhang@example.com',
        status: 'contacted'
      };

      mockValidationService.validateLeadData.mockResolvedValue({ isValid: true });
      mockLeadModel.findOne.mockResolvedValue(existingLead);

      const result = await marketingService.createLead(leadData);

      expect(mockLeadModel.findOne).toHaveBeenCalledWith({
        where: { email: 'zhang@example.com' }
      });
      expect(result.isDuplicate).toBe(true);
      expect(result.existingLead).toEqual(existingLead);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Duplicate lead detected',
        expect.any(Object)
      );
    });
  });

  describe('nurtureLead', () => {
    it('应该培育潜在客户', async () => {
      const leadId = 1;
      const nurtureOptions = {
        type: 'follow_up',
        channel: 'email',
        content: {
          subject: '关于您孩子的教育需求',
          message: '我们想了解更多关于您孩子的教育需求...'
        },
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时后
      };

      const mockLead = {
        id: 1,
        name: '张三',
        email: 'zhang@example.com',
        phone: '13800138001',
        status: 'new',
        score: 75,
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockLeadModel.findByPk.mockResolvedValue(mockLead);
      mockEmailService.sendFollowUpEmail.mockResolvedValue(undefined);
      mockMarketingEventModel.create.mockResolvedValue({
        id: 1,
        leadId: 1,
        type: 'follow_up',
        channel: 'email',
        status: 'sent'
      });

      const result = await marketingService.nurtureLead(leadId, nurtureOptions);

      expect(mockLeadModel.findByPk).toHaveBeenCalledWith(leadId);
      expect(mockEmailService.sendFollowUpEmail).toHaveBeenCalledWith(
        'zhang@example.com',
        expect.objectContaining({
          subject: '关于您孩子的教育需求',
          message: expect.any(String)
        })
      );
      expect(mockMarketingEventModel.create).toHaveBeenCalledWith({
        leadId: 1,
        type: 'follow_up',
        channel: 'email',
        status: 'sent',
        content: expect.any(Object),
        scheduledAt: expect.any(Date),
        executedAt: expect.any(Date)
      });
      expect(mockLead.update).toHaveBeenCalledWith({
        status: 'contacted',
        lastContactAt: expect.any(Date)
      });
      expect(result.success).toBe(true);
    });

    it('应该处理不同的培育渠道', async () => {
      const leadId = 1;
      const smsNurture = {
        type: 'reminder',
        channel: 'sms',
        content: { message: '别忘了我们的开放日活动' }
      };

      const mockLead = {
        id: 1,
        phone: '13800138001',
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockLeadModel.findByPk.mockResolvedValue(mockLead);
      mockSMSService.sendSMS.mockResolvedValue(undefined);

      const result = await marketingService.nurtureLead(leadId, smsNurture);

      expect(mockSMSService.sendSMS).toHaveBeenCalledWith(
        '13800138001',
        '别忘了我们的开放日活动'
      );
      expect(result.success).toBe(true);
    });

    it('应该处理潜在客户不存在的情况', async () => {
      const leadId = 999;

      mockLeadModel.findByPk.mockResolvedValue(null);

      await expect(marketingService.nurtureLead(leadId, {}))
        .rejects.toThrow('Lead not found');

      expect(mockLeadModel.findByPk).toHaveBeenCalledWith(leadId);
    });
  });

  describe('convertLead', () => {
    it('应该成功转化潜在客户', async () => {
      const leadId = 1;
      const conversionData = {
        type: 'enrollment',
        value: 3000.00,
        enrollmentId: 1,
        notes: '成功报名小班A'
      };

      const mockLead = {
        id: 1,
        name: '张三',
        email: 'zhang@example.com',
        status: 'contacted',
        score: 85,
        campaign: 'spring_enrollment',
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockLeadModel.findByPk.mockResolvedValue(mockLead);
      mockMarketingEventModel.create.mockResolvedValue({
        id: 2,
        leadId: 1,
        type: 'conversion',
        value: 3000.00
      });

      const result = await marketingService.convertLead(leadId, conversionData);

      expect(mockLeadModel.findByPk).toHaveBeenCalledWith(leadId);
      expect(mockLead.update).toHaveBeenCalledWith({
        status: 'converted',
        convertedAt: expect.any(Date),
        conversionValue: 3000.00
      });
      expect(mockMarketingEventModel.create).toHaveBeenCalledWith({
        leadId: 1,
        type: 'conversion',
        value: 3000.00,
        enrollmentId: 1,
        notes: '成功报名小班A',
        createdAt: expect.any(Date)
      });
      expect(mockAnalyticsService.trackConversion).toHaveBeenCalledWith({
        leadId: 1,
        campaign: 'spring_enrollment',
        value: 3000.00,
        type: 'enrollment'
      });
      expect(result.success).toBe(true);
      expect(result.conversionValue).toBe(3000.00);
    });

    it('应该处理已转化的潜在客户', async () => {
      const leadId = 1;

      const mockConvertedLead = {
        id: 1,
        status: 'converted',
        convertedAt: new Date()
      };

      mockLeadModel.findByPk.mockResolvedValue(mockConvertedLead);

      await expect(marketingService.convertLead(leadId, {}))
        .rejects.toThrow('Lead is already converted');

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Attempted to convert already converted lead',
        expect.any(Object)
      );
    });
  });

  describe('getCampaignAnalytics', () => {
    it('应该获取活动分析数据', async () => {
      const campaignId = 1;
      const dateRange = {
        startDate: '2024-03-01',
        endDate: '2024-03-31'
      };

      const mockCampaign = {
        id: 1,
        name: '春季招生活动',
        metrics: {
          impressions: 10000,
          clicks: 500,
          leads: 100,
          conversions: 15,
          cost: 5000.00,
          revenue: 45000.00
        }
      };

      const mockLeadStats = {
        total: 100,
        new: 20,
        contacted: 50,
        qualified: 15,
        converted: 15
      };

      const mockConversionFunnel = [
        { stage: 'impression', count: 10000 },
        { stage: 'click', count: 500 },
        { stage: 'lead', count: 100 },
        { stage: 'qualified', count: 15 },
        { stage: 'conversion', count: 15 }
      ];

      mockMarketingCampaignModel.findByPk.mockResolvedValue(mockCampaign);
      mockLeadModel.count.mockImplementation(({ where }) => {
        if (where.status === 'new') return Promise.resolve(20);
        if (where.status === 'contacted') return Promise.resolve(50);
        if (where.status === 'qualified') return Promise.resolve(15);
        if (where.status === 'converted') return Promise.resolve(15);
        return Promise.resolve(100);
      });

      const result = await marketingService.getCampaignAnalytics(campaignId, dateRange);

      expect(mockMarketingCampaignModel.findByPk).toHaveBeenCalledWith(campaignId);
      expect(result).toEqual(expect.objectContaining({
        campaign: mockCampaign,
        metrics: expect.objectContaining({
          impressions: 10000,
          clicks: 500,
          leads: 100,
          conversions: 15,
          clickThroughRate: 0.05, // 500/10000
          conversionRate: 0.15, // 15/100
          costPerLead: 50.00, // 5000/100
          returnOnInvestment: 8.0 // (45000-5000)/5000
        }),
        leadStats: mockLeadStats,
        conversionFunnel: mockConversionFunnel
      }));
    });

    it('应该按时间段分析数据', async () => {
      const campaignId = 1;
      const options = {
        groupBy: 'day',
        startDate: '2024-03-01',
        endDate: '2024-03-07'
      };

      const mockDailyMetrics = [
        { date: '2024-03-01', impressions: 1000, clicks: 50, leads: 10 },
        { date: '2024-03-02', impressions: 1200, clicks: 60, leads: 12 },
        { date: '2024-03-03', impressions: 800, clicks: 40, leads: 8 }
      ];

      mockMarketingCampaignModel.findByPk.mockResolvedValue({ id: 1 });
      mockAnalyticsService.getMetrics.mockResolvedValue(mockDailyMetrics);

      const result = await marketingService.getCampaignAnalytics(campaignId, options);

      expect(mockAnalyticsService.getMetrics).toHaveBeenCalledWith({
        campaignId: 1,
        groupBy: 'day',
        startDate: '2024-03-01',
        endDate: '2024-03-07'
      });
      expect(result.timeSeriesData).toEqual(mockDailyMetrics);
    });
  });

  describe('getLeadAnalytics', () => {
    it('应该获取潜在客户分析数据', async () => {
      const filters = {
        source: 'website',
        status: 'new',
        dateRange: {
          startDate: '2024-03-01',
          endDate: '2024-03-31'
        }
      };

      const mockLeadStats = {
        total: 150,
        bySource: [
          { source: 'website', count: 80 },
          { source: 'referral', count: 40 },
          { source: 'social_media', count: 30 }
        ],
        byStatus: [
          { status: 'new', count: 50 },
          { status: 'contacted', count: 60 },
          { status: 'qualified', count: 25 },
          { status: 'converted', count: 15 }
        ],
        averageScore: 72.5,
        conversionRate: 0.10, // 15/150
        averageTimeToConversion: 14 // 天
      };

      mockLeadModel.count.mockResolvedValue(150);
      mockLeadModel.findAll.mockImplementation(({ attributes, group }) => {
        if (group && group.includes('source')) {
          return Promise.resolve(mockLeadStats.bySource);
        }
        if (group && group.includes('status')) {
          return Promise.resolve(mockLeadStats.byStatus);
        }
        return Promise.resolve([]);
      });

      const result = await marketingService.getLeadAnalytics(filters);

      expect(result).toEqual(expect.objectContaining({
        total: 150,
        bySource: mockLeadStats.bySource,
        byStatus: mockLeadStats.byStatus,
        averageScore: expect.any(Number),
        conversionRate: expect.any(Number)
      }));
    });

    it('应该分析潜在客户质量', async () => {
      const mockLeads = [
        { id: 1, score: 90, status: 'converted', source: 'referral' },
        { id: 2, score: 75, status: 'qualified', source: 'website' },
        { id: 3, score: 60, status: 'contacted', source: 'social_media' },
        { id: 4, score: 45, status: 'new', source: 'website' }
      ];

      mockLeadModel.findAll.mockResolvedValue(mockLeads);

      const result = await marketingService.getLeadQualityAnalysis();

      expect(result).toEqual(expect.objectContaining({
        highQuality: expect.any(Number), // score >= 80
        mediumQuality: expect.any(Number), // score 60-79
        lowQuality: expect.any(Number), // score < 60
        qualityBySource: expect.any(Array),
        recommendations: expect.any(Array)
      }));
    });
  });

  describe('generateMarketingReport', () => {
    it('应该生成营销报告', async () => {
      const reportOptions = {
        type: 'monthly',
        period: '2024-03',
        format: 'pdf',
        includeCharts: true,
        sections: ['campaigns', 'leads', 'conversions', 'roi']
      };

      const mockReportData = {
        period: '2024-03',
        campaigns: {
          total: 5,
          active: 3,
          completed: 2,
          totalSpend: 25000.00,
          totalRevenue: 150000.00
        },
        leads: {
          total: 500,
          new: 150,
          converted: 75,
          conversionRate: 0.15
        },
        roi: {
          overall: 5.0,
          byCampaign: [
            { campaignId: 1, roi: 8.0 },
            { campaignId: 2, roi: 3.5 }
          ]
        }
      };

      mockAnalyticsService.generateReport.mockResolvedValue({
        data: mockReportData,
        charts: ['conversion_funnel.png', 'roi_chart.png'],
        filename: 'marketing_report_2024_03.pdf'
      });

      const result = await marketingService.generateMarketingReport(reportOptions);

      expect(mockAnalyticsService.generateReport).toHaveBeenCalledWith({
        type: 'marketing',
        ...reportOptions
      });
      expect(result).toEqual(expect.objectContaining({
        data: mockReportData,
        charts: expect.any(Array),
        filename: expect.stringMatching(/marketing_report_.*\.pdf/)
      }));
    });

    it('应该支持不同的报告格式', async () => {
      const excelOptions = {
        type: 'weekly',
        format: 'excel',
        period: '2024-W12'
      };

      mockAnalyticsService.generateReport.mockResolvedValue({
        data: {},
        filename: 'marketing_report_2024_W12.xlsx',
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const result = await marketingService.generateMarketingReport(excelOptions);

      expect(result.filename).toMatch(/\.xlsx$/);
      expect(result.contentType).toContain('spreadsheetml');
    });
  });

  describe('optimizeCampaign', () => {
    it('应该优化活动性能', async () => {
      const campaignId = 1;
      const optimizationOptions = {
        autoAdjustBudget: true,
        optimizeTargeting: true,
        testVariations: true
      };

      const mockCampaign = {
        id: 1,
        metrics: {
          impressions: 10000,
          clicks: 200, // 低点击率
          leads: 20,
          conversions: 2, // 低转化率
          cost: 5000.00
        },
        targetAudience: { ageRange: '3-6' },
        budget: 10000.00
      };

      const mockOptimizationSuggestions = [
        {
          type: 'targeting',
          suggestion: 'Narrow age range to 4-5 years for better conversion',
          impact: 'medium',
          estimatedImprovement: '25%'
        },
        {
          type: 'budget',
          suggestion: 'Reduce daily budget by 20% due to low performance',
          impact: 'high',
          estimatedSavings: 1000.00
        },
        {
          type: 'content',
          suggestion: 'Test new ad creative with stronger call-to-action',
          impact: 'high',
          estimatedImprovement: '40%'
        }
      ];

      mockMarketingCampaignModel.findByPk.mockResolvedValue(mockCampaign);

      const result = await marketingService.optimizeCampaign(campaignId, optimizationOptions);

      expect(result).toEqual(expect.objectContaining({
        campaignId: 1,
        currentPerformance: expect.objectContaining({
          clickThroughRate: 0.02, // 200/10000
          conversionRate: 0.10, // 2/20
          costPerLead: 250.00, // 5000/20
          performance: 'poor'
        }),
        suggestions: expect.arrayContaining([
          expect.objectContaining({
            type: 'targeting',
            impact: expect.any(String)
          }),
          expect.objectContaining({
            type: 'budget',
            impact: expect.any(String)
          })
        ]),
        autoApplied: expect.any(Array)
      }));
    });

    it('应该自动应用优化建议', async () => {
      const campaignId = 1;
      const options = { autoApply: true, maxBudgetChange: 0.2 };

      const mockCampaign = {
        id: 1,
        budget: 10000.00,
        metrics: { cost: 8000.00, conversions: 5 },
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockMarketingCampaignModel.findByPk.mockResolvedValue(mockCampaign);

      const result = await marketingService.optimizeCampaign(campaignId, options);

      expect(mockCampaign.update).toHaveBeenCalledWith(
        expect.objectContaining({
          budget: expect.any(Number) // 调整后的预算
        })
      );
      expect(result.autoApplied).toContain('budget_adjustment');
    });
  });

  describe('错误处理', () => {
    it('应该记录详细的错误信息', async () => {
      const campaignData = {
        name: '测试活动',
        type: 'enrollment'
      };

      const error = new Error('Database connection failed');
      mockValidationService.validateCampaignData.mockRejectedValue(error);

      await expect(marketingService.createCampaign(campaignData))
        .rejects.toThrow('Database connection failed');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to create campaign',
        expect.objectContaining({
          error: error.message,
          stack: error.stack,
          campaignData: expect.any(Object)
        })
      );
    });

    it('应该处理邮件发送失败', async () => {
      const leadId = 1;
      const nurtureOptions = {
        type: 'follow_up',
        channel: 'email',
        content: { subject: '测试', message: '测试消息' }
      };

      const mockLead = {
        id: 1,
        email: 'test@example.com',
        update: jest.fn()
      };

      mockLeadModel.findByPk.mockResolvedValue(mockLead);
      mockEmailService.sendFollowUpEmail.mockRejectedValue(
        new Error('Email service unavailable')
      );

      const result = await marketingService.nurtureLead(leadId, nurtureOptions);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email service unavailable');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to send nurture email',
        expect.any(Object)
      );
    });

    it('应该在事务失败时回滚', async () => {
      const campaignData = {
        name: '测试活动',
        type: 'enrollment'
      };

      mockValidationService.validateCampaignData.mockResolvedValue({ isValid: true });
      mockMarketingCampaignModel.create.mockRejectedValue(new Error('Database error'));

      await expect(marketingService.createCampaign(campaignData))
        .rejects.toThrow('Database error');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('缓存和性能优化', () => {
    it('应该缓存活动分析数据', async () => {
      const campaignId = 1;
      const cacheKey = `campaign_analytics_${campaignId}`;

      // 第一次调用 - 从数据库获取
      mockRedisClient.get.mockResolvedValue(null);
      mockMarketingCampaignModel.findByPk.mockResolvedValue({ id: 1, metrics: {} });
      mockRedisClient.set.mockResolvedValue('OK');

      await marketingService.getCampaignAnalytics(campaignId);

      expect(mockRedisClient.get).toHaveBeenCalledWith(cacheKey);
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        cacheKey,
        expect.any(String),
        'EX',
        3600 // 1小时缓存
      );

      // 第二次调用 - 从缓存获取
      const cachedData = JSON.stringify({ campaign: { id: 1 }, metrics: {} });
      mockRedisClient.get.mockResolvedValue(cachedData);

      const result = await marketingService.getCampaignAnalytics(campaignId);

      expect(mockMarketingCampaignModel.findByPk).toHaveBeenCalledTimes(1); // 只调用一次
      expect(result).toEqual(expect.objectContaining({ campaign: { id: 1 } }));
    });

    it('应该批量处理潜在客户操作', async () => {
      const leadIds = [1, 2, 3, 4, 5];
      const updateData = { status: 'contacted' };

      mockLeadModel.update.mockResolvedValue([5]);

      const result = await marketingService.bulkUpdateLeads(leadIds, updateData);

      expect(mockLeadModel.update).toHaveBeenCalledWith(
        updateData,
        {
          where: {
            id: {
              [mockSequelize.Op.in]: leadIds
            }
          }
        }
      );
      expect(result.updatedCount).toBe(5);
    });
  });
});
