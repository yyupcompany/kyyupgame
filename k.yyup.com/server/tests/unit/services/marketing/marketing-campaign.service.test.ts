import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock Sequelize
const mockSequelize = {
  transaction: jest.fn(),
  query: jest.fn(),
  authenticate: jest.fn(),
  define: jest.fn(),
  sync: jest.fn()
};

const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn(),
  finished: 'pending'
};

// Mock models
const mockMarketingCampaign = {
  create: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  count: jest.fn()
};

const mockKindergarten = {
  findByPk: jest.fn()
};

const mockUser = {
  findByPk: jest.fn()
};

const mockChannelTracking = {
  create: jest.fn(),
  findAll: jest.fn()
};

const mockConversionTracking = {
  create: jest.fn(),
  findAll: jest.fn()
};

// Mock imports
jest.unstable_mockModule('../../../../../../src/init', () => ({
  sequelize: mockSequelize
}));

jest.unstable_mockModule('../../../../../../src/services/marketing/marketing-campaign.service', () => ({
  MarketingCampaignService: jest.fn().mockImplementation(() => ({
    createCampaign: jest.fn(),
    getCampaignById: jest.fn(),
    getCampaigns: jest.fn(),
    updateCampaign: jest.fn(),
    deleteCampaign: jest.fn(),
    launchCampaign: jest.fn(),
    pauseCampaign: jest.fn(),
    getCampaignStatistics: jest.fn(),
    getCampaignPerformance: jest.fn()
  }))
}));

jest.unstable_mockModule('../../../../../../src/models/marketing-campaign.model', () => ({
  MarketingCampaign: mockMarketingCampaign
}));

jest.unstable_mockModule('../../../../../../src/models/kindergarten.model', () => ({
  Kindergarten: mockKindergarten
}));

jest.unstable_mockModule('../../../../../../src/models/user.model', () => ({
  User: mockUser
}));

jest.unstable_mockModule('../../../../../../src/models/channel-tracking.model', () => ({
  ChannelTracking: mockChannelTracking
}));

jest.unstable_mockModule('../../../../../../src/models/conversion-tracking.model', () => ({
  ConversionTracking: mockConversionTracking
}));

jest.unstable_mockModule('../../../../../../src/utils/apiError', () => ({
  ApiError: jest.fn().mockImplementation((message, statusCode) => {
    const error = new Error(message);
    (error as any).statusCode = statusCode;
    return error;
  })
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

describe('Marketing Campaign Service', () => {
  let marketingCampaignService: any;
  let MarketingCampaignService: any;

  beforeAll(async () => {
    const { MarketingCampaignService: ImportedMarketingCampaignService } = await import('../../../../../../src/services/marketing/marketing-campaign.service');
    MarketingCampaignService = ImportedMarketingCampaignService;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockSequelize.transaction.mockResolvedValue(mockTransaction);
    marketingCampaignService = new MarketingCampaignService();
  });

  describe('createCampaign', () => {
    it('应该成功创建营销活动', async () => {
      const campaignData = {
        name: '春季招生活动',
        description: '针对春季招生的营销推广活动',
        type: 'enrollment',
        kindergartenId: 1,
        createdBy: 1,
        startDate: '2024-03-01',
        endDate: '2024-03-31',
        budget: 10000,
        targetAudience: 'parents',
        channels: ['wechat', 'website', 'offline'],
        objectives: {
          leads: 100,
          conversions: 20,
          roi: 3.0
        }
      };

      const mockCreatedCampaign = {
        id: 1,
        ...campaignData,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockKindergarten.findByPk.mockResolvedValue({ id: 1, name: '阳光幼儿园' });
      mockUser.findByPk.mockResolvedValue({ id: 1, realName: '张三' });
      mockMarketingCampaign.create.mockResolvedValue(mockCreatedCampaign);

      const result = await marketingCampaignService.createCampaign(campaignData);

      expect(result).toEqual(mockCreatedCampaign);
      expect(mockKindergarten.findByPk).toHaveBeenCalledWith(1, { transaction: mockTransaction });
      expect(mockUser.findByPk).toHaveBeenCalledWith(1, { transaction: mockTransaction });
      expect(mockMarketingCampaign.create).toHaveBeenCalledWith(campaignData, { transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('应该处理幼儿园不存在的情况', async () => {
      const campaignData = {
        name: '测试活动',
        kindergartenId: 999,
        createdBy: 1
      };

      mockKindergarten.findByPk.mockResolvedValue(null);

      await expect(marketingCampaignService.createCampaign(campaignData)).rejects.toThrow('幼儿园不存在');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('应该处理创建者不存在的情况', async () => {
      const campaignData = {
        name: '测试活动',
        kindergartenId: 1,
        createdBy: 999
      };

      mockKindergarten.findByPk.mockResolvedValue({ id: 1 });
      mockUser.findByPk.mockResolvedValue(null);

      await expect(marketingCampaignService.createCampaign(campaignData)).rejects.toThrow('创建者不存在');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('getCampaignById', () => {
    it('应该成功获取营销活动信息', async () => {
      const campaignId = 1;
      const mockCampaignData = {
        id: 1,
        name: '春季招生活动',
        status: 'active',
        budget: 10000,
        kindergarten: {
          id: 1,
          name: '阳光幼儿园'
        },
        creator: {
          id: 1,
          realName: '张三'
        }
      };

      mockMarketingCampaign.findByPk.mockResolvedValue(mockCampaignData);

      const result = await marketingCampaignService.getCampaignById(campaignId);

      expect(result).toEqual(mockCampaignData);
      expect(mockMarketingCampaign.findByPk).toHaveBeenCalledWith(campaignId, {
        include: expect.arrayContaining([
          expect.objectContaining({
            model: expect.anything(),
            attributes: expect.any(Array)
          })
        ])
      });
    });

    it('应该处理活动不存在的情况', async () => {
      const campaignId = 999;
      mockMarketingCampaign.findByPk.mockResolvedValue(null);

      await expect(marketingCampaignService.getCampaignById(campaignId)).rejects.toThrow('营销活动不存在');
    });
  });

  describe('getCampaigns', () => {
    it('应该成功获取营销活动列表', async () => {
      const queryParams = {
        page: 1,
        pageSize: 10,
        kindergartenId: 1,
        status: 'active',
        type: 'enrollment'
      };

      const mockCampaigns = [
        {
          id: 1,
          name: '春季招生活动',
          status: 'active',
          type: 'enrollment',
          budget: 10000
        },
        {
          id: 2,
          name: '夏季体验活动',
          status: 'active',
          type: 'experience',
          budget: 5000
        }
      ];

      mockMarketingCampaign.findAll.mockResolvedValue(mockCampaigns);
      mockMarketingCampaign.count.mockResolvedValue(2);

      const result = await marketingCampaignService.getCampaigns(queryParams);

      expect(result).toEqual({
        campaigns: mockCampaigns,
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1
      });

      expect(mockMarketingCampaign.findAll).toHaveBeenCalledWith({
        where: expect.objectContaining({
          kindergartenId: 1,
          status: 'active',
          type: 'enrollment'
        }),
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']],
        include: expect.any(Array)
      });
    });

    it('应该支持搜索功能', async () => {
      const queryParams = {
        page: 1,
        pageSize: 10,
        search: '招生'
      };

      mockMarketingCampaign.findAll.mockResolvedValue([]);
      mockMarketingCampaign.count.mockResolvedValue(0);

      await marketingCampaignService.getCampaigns(queryParams);

      expect(mockMarketingCampaign.findAll).toHaveBeenCalledWith({
        where: expect.objectContaining({
          [expect.any(Symbol)]: expect.arrayContaining([
            expect.objectContaining({
              name: expect.objectContaining({
                [expect.any(Symbol)]: '%招生%'
              })
            })
          ])
        }),
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']],
        include: expect.any(Array)
      });
    });
  });

  describe('launchCampaign', () => {
    it('应该成功启动营销活动', async () => {
      const campaignId = 1;
      const mockCampaign = {
        id: 1,
        name: '春季招生活动',
        status: 'draft',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-31'),
        budget: 10000,
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockMarketingCampaign.findByPk.mockResolvedValue(mockCampaign);

      const result = await marketingCampaignService.launchCampaign(campaignId);

      expect(result).toBe(true);
      expect(mockMarketingCampaign.findByPk).toHaveBeenCalledWith(campaignId, { transaction: mockTransaction });
      expect(mockCampaign.update).toHaveBeenCalledWith({
        status: 'active',
        launchedAt: expect.any(Date)
      }, { transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('应该处理活动已启动的情况', async () => {
      const campaignId = 1;
      const mockCampaign = {
        id: 1,
        status: 'active'
      };

      mockMarketingCampaign.findByPk.mockResolvedValue(mockCampaign);

      await expect(marketingCampaignService.launchCampaign(campaignId)).rejects.toThrow('活动已启动');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('应该处理活动时间未到的情况', async () => {
      const campaignId = 1;
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);

      const mockCampaign = {
        id: 1,
        status: 'draft',
        startDate: futureDate
      };

      mockMarketingCampaign.findByPk.mockResolvedValue(mockCampaign);

      await expect(marketingCampaignService.launchCampaign(campaignId)).rejects.toThrow('活动开始时间未到');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('getCampaignStatistics', () => {
    it('应该成功获取活动统计数据', async () => {
      const campaignId = 1;
      const mockStatistics = {
        impressions: 10000,
        clicks: 500,
        leads: 50,
        conversions: 10,
        cost: 8000,
        ctr: 5.0,
        cpl: 160,
        cpc: 16,
        roi: 2.5
      };

      mockChannelTracking.findAll.mockResolvedValue([
        { channel: 'wechat', impressions: 6000, clicks: 300, cost: 4800 },
        { channel: 'website', impressions: 4000, clicks: 200, cost: 3200 }
      ]);

      mockConversionTracking.findAll.mockResolvedValue([
        { type: 'lead', count: 50 },
        { type: 'conversion', count: 10 }
      ]);

      const result = await marketingCampaignService.getCampaignStatistics(campaignId);

      expect(result).toEqual(expect.objectContaining({
        impressions: expect.any(Number),
        clicks: expect.any(Number),
        leads: expect.any(Number),
        conversions: expect.any(Number),
        cost: expect.any(Number),
        ctr: expect.any(Number),
        roi: expect.any(Number)
      }));

      expect(mockChannelTracking.findAll).toHaveBeenCalledWith({
        where: { campaignId }
      });

      expect(mockConversionTracking.findAll).toHaveBeenCalledWith({
        where: { campaignId }
      });
    });

    it('应该处理无统计数据的情况', async () => {
      const campaignId = 1;

      mockChannelTracking.findAll.mockResolvedValue([]);
      mockConversionTracking.findAll.mockResolvedValue([]);

      const result = await marketingCampaignService.getCampaignStatistics(campaignId);

      expect(result).toEqual({
        impressions: 0,
        clicks: 0,
        leads: 0,
        conversions: 0,
        cost: 0,
        ctr: 0,
        cpl: 0,
        cpc: 0,
        roi: 0
      });
    });
  });

  describe('pauseCampaign', () => {
    it('应该成功暂停营销活动', async () => {
      const campaignId = 1;
      const mockCampaign = {
        id: 1,
        status: 'active',
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockMarketingCampaign.findByPk.mockResolvedValue(mockCampaign);

      const result = await marketingCampaignService.pauseCampaign(campaignId);

      expect(result).toBe(true);
      expect(mockCampaign.update).toHaveBeenCalledWith({
        status: 'paused',
        pausedAt: expect.any(Date)
      }, { transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('应该处理活动未启动的情况', async () => {
      const campaignId = 1;
      const mockCampaign = {
        id: 1,
        status: 'draft'
      };

      mockMarketingCampaign.findByPk.mockResolvedValue(mockCampaign);

      await expect(marketingCampaignService.pauseCampaign(campaignId)).rejects.toThrow('活动未启动');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });
});
