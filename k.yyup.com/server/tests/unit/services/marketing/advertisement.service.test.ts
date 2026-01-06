import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock dependencies
const mockAdvertisementModel = {
  create: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  count: jest.fn(),
  findAndCountAll: jest.fn(),
  findByPk: jest.fn()
};

const mockAdvertisementClickModel = {
  create: jest.fn(),
  findAll: jest.fn(),
  count: jest.fn()
};

const mockAdvertisementImpressionModel = {
  create: jest.fn(),
  findAll: jest.fn(),
  count: jest.fn()
};

const mockUserModel = {
  findByPk: jest.fn(),
  findAll: jest.fn()
};

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
};

const mockFileUploadService = {
  uploadImage: jest.fn(),
  deleteFile: jest.fn(),
  generateThumbnail: jest.fn(),
  optimizeImage: jest.fn()
};

const mockAnalyticsService = {
  trackEvent: jest.fn(),
  recordImpression: jest.fn(),
  recordClick: jest.fn(),
  generateReport: jest.fn()
};

const mockTargetingService = {
  getTargetAudience: jest.fn(),
  calculateRelevanceScore: jest.fn(),
  filterByDemographics: jest.fn(),
  filterByBehavior: jest.fn()
};

const mockBidService = {
  calculateBid: jest.fn(),
  optimizeBidding: jest.fn(),
  getBudgetStatus: jest.fn()
};

const mockContentModerationService = {
  moderateContent: jest.fn(),
  checkCompliance: jest.fn(),
  flagInappropriate: jest.fn()
};

const mockSchedulerService = {
  schedule: jest.fn(),
  cancel: jest.fn(),
  reschedule: jest.fn()
};

const mockRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  exists: jest.fn(),
  expire: jest.fn(),
  zadd: jest.fn(),
  zrange: jest.fn(),
  zrem: jest.fn(),
  incr: jest.fn(),
  decr: jest.fn()
};

const mockSequelize = {
  transaction: jest.fn(),
  Op: {
    and: Symbol('and'),
    or: Symbol('or'),
    in: Symbol('in'),
    between: Symbol('between'),
    gte: Symbol('gte'),
    lte: Symbol('lte'),
    like: Symbol('like')
  }
};

// Mock imports
jest.unstable_mockModule('../../../../../../src/models/advertisement.model', () => ({
  default: mockAdvertisementModel
}));

jest.unstable_mockModule('../../../../../../src/models/advertisement-click.model', () => ({
  default: mockAdvertisementClickModel
}));

jest.unstable_mockModule('../../../../../../src/models/advertisement-impression.model', () => ({
  default: mockAdvertisementImpressionModel
}));

jest.unstable_mockModule('../../../../../../src/models/user.model', () => ({
  default: mockUserModel
}));

jest.unstable_mockModule('../../../../../../src/utils/logger', () => ({
  default: mockLogger
}));

jest.unstable_mockModule('../../../../../../src/services/file/file-upload.service', () => ({
  default: mockFileUploadService
}));

jest.unstable_mockModule('../../../../../../src/services/analytics/analytics.service', () => ({
  default: mockAnalyticsService
}));

jest.unstable_mockModule('../../../../../../src/services/marketing/targeting.service', () => ({
  default: mockTargetingService
}));

jest.unstable_mockModule('../../../../../../src/services/marketing/bid.service', () => ({
  default: mockBidService
}));

jest.unstable_mockModule('../../../../../../src/services/content-moderation.service', () => ({
  default: mockContentModerationService
}));

jest.unstable_mockModule('../../../../../../src/services/scheduler.service', () => ({
  default: mockSchedulerService
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

describe('AdvertisementService', () => {
  let advertisementService: any;

  beforeAll(async () => {
    const imported = await import('../../../../../../src/services/marketing/advertisement.service');
    advertisementService = imported.default || imported.AdvertisementService || imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup transaction mock
    mockSequelize.transaction.mockImplementation((callback) => {
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      return callback(transaction);
    });
  });

  describe('广告创建和管理', () => {
    it('应该创建新的广告', async () => {
      const adData = {
        title: '春季招生优惠',
        description: '现在报名享受8折优惠，名额有限！',
        type: 'banner',
        format: 'image',
        content: {
          imageUrl: 'https://example.com/ad-image.jpg',
          linkUrl: 'https://example.com/enrollment',
          callToAction: '立即报名'
        },
        targeting: {
          ageRange: [3, 6],
          location: ['北京', '上海'],
          interests: ['早教', '双语教学']
        },
        budget: {
          total: 5000,
          dailyLimit: 200,
          bidType: 'cpc',
          maxBid: 2.5
        },
        schedule: {
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-03-31'),
          timeSlots: [
            { start: '09:00', end: '12:00' },
            { start: '14:00', end: '18:00' }
          ]
        },
        status: 'draft'
      };

      const mockCreatedAd = {
        id: 1,
        ...adData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockContentModerationService.moderateContent.mockResolvedValue({
        approved: true,
        score: 0.95,
        flags: []
      });
      mockFileUploadService.optimizeImage.mockResolvedValue({
        optimizedUrl: 'https://example.com/ad-image-optimized.jpg',
        thumbnailUrl: 'https://example.com/ad-image-thumb.jpg'
      });
      mockAdvertisementModel.create.mockResolvedValue(mockCreatedAd);

      const result = await advertisementService.createAdvertisement(adData);

      expect(mockContentModerationService.moderateContent).toHaveBeenCalledWith({
        title: adData.title,
        description: adData.description,
        imageUrl: adData.content.imageUrl
      });
      expect(mockFileUploadService.optimizeImage).toHaveBeenCalledWith(
        adData.content.imageUrl
      );
      expect(mockAdvertisementModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '春季招生优惠',
          status: 'draft',
          moderationStatus: 'approved'
        })
      );
      expect(result).toEqual(mockCreatedAd);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Advertisement created successfully',
        expect.objectContaining({ adId: 1 })
      );
    });

    it('应该拒绝不当内容的广告', async () => {
      const adData = {
        title: '不当广告标题',
        description: '包含不当内容的描述',
        type: 'banner',
        content: {
          imageUrl: 'https://example.com/inappropriate-image.jpg'
        }
      };

      mockContentModerationService.moderateContent.mockResolvedValue({
        approved: false,
        score: 0.3,
        flags: ['inappropriate_content', 'misleading_claims']
      });

      await expect(advertisementService.createAdvertisement(adData))
        .rejects.toThrow('Advertisement content violates community guidelines');

      expect(mockAdvertisementModel.create).not.toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Advertisement rejected due to content moderation',
        expect.objectContaining({
          flags: ['inappropriate_content', 'misleading_claims']
        })
      );
    });

    it('应该更新广告状态', async () => {
      const adId = 1;
      const statusUpdate = {
        status: 'active',
        activatedAt: new Date()
      };

      const mockExistingAd = {
        id: 1,
        title: '测试广告',
        status: 'draft',
        budget: { total: 1000, spent: 0 }
      };

      const mockUpdatedAd = {
        ...mockExistingAd,
        ...statusUpdate
      };

      mockAdvertisementModel.findByPk.mockResolvedValue(mockExistingAd);
      mockAdvertisementModel.update.mockResolvedValue([1]);
      mockAdvertisementModel.findByPk.mockResolvedValueOnce(mockExistingAd)
                                     .mockResolvedValueOnce(mockUpdatedAd);

      const result = await advertisementService.updateAdvertisementStatus(adId, 'active');

      expect(mockAdvertisementModel.findByPk).toHaveBeenCalledWith(1);
      expect(mockAdvertisementModel.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'active' }),
        { where: { id: 1 } }
      );
      expect(result.status).toBe('active');
    });

    it('应该暂停预算耗尽的广告', async () => {
      const adId = 2;

      const mockAd = {
        id: 2,
        title: '预算耗尽广告',
        status: 'active',
        budget: { total: 1000, spent: 1000, dailyLimit: 100 }
      };

      mockAdvertisementModel.findByPk.mockResolvedValue(mockAd);
      mockBidService.getBudgetStatus.mockResolvedValue({
        budgetExhausted: true,
        remainingBudget: 0,
        dailyBudgetExhausted: true
      });
      mockAdvertisementModel.update.mockResolvedValue([1]);

      await advertisementService.checkAndUpdateBudgetStatus(adId);

      expect(mockAdvertisementModel.update).toHaveBeenCalledWith(
        { status: 'paused', pauseReason: 'budget_exhausted' },
        { where: { id: 2 } }
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Advertisement paused due to budget exhaustion',
        expect.objectContaining({ adId: 2 })
      );
    });
  });

  describe('广告投放和定向', () => {
    it('应该获取符合条件的广告', async () => {
      const targetingCriteria = {
        userId: 101,
        location: '北京',
        age: 5,
        interests: ['早教', '英语'],
        deviceType: 'mobile',
        timeOfDay: '10:00'
      };

      const mockUser = {
        id: 101,
        age: 30,
        location: '北京',
        interests: ['早教', '英语', '音乐'],
        children: [{ age: 5 }]
      };

      const mockAds = [
        {
          id: 1,
          title: '英语启蒙课程',
          type: 'banner',
          targeting: {
            ageRange: [3, 6],
            location: ['北京'],
            interests: ['早教', '英语']
          },
          budget: { maxBid: 3.0 },
          status: 'active'
        },
        {
          id: 2,
          title: '音乐培训班',
          type: 'native',
          targeting: {
            ageRange: [4, 8],
            location: ['北京', '上海'],
            interests: ['音乐', '艺术']
          },
          budget: { maxBid: 2.5 },
          status: 'active'
        }
      ];

      mockUserModel.findByPk.mockResolvedValue(mockUser);
      mockAdvertisementModel.findAll.mockResolvedValue(mockAds);
      mockTargetingService.calculateRelevanceScore
        .mockResolvedValueOnce(0.85) // 第一个广告
        .mockResolvedValueOnce(0.65); // 第二个广告
      mockBidService.calculateBid
        .mockResolvedValueOnce(2.8)
        .mockResolvedValueOnce(2.3);

      const result = await advertisementService.getTargetedAds(targetingCriteria, 3);

      expect(mockUserModel.findByPk).toHaveBeenCalledWith(101);
      expect(mockTargetingService.calculateRelevanceScore).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1); // 更高相关性的广告排在前面
      expect(result[0].relevanceScore).toBe(0.85);
      expect(result[0].bidAmount).toBe(2.8);
    });

    it('应该过滤已展示过的广告', async () => {
      const targetingCriteria = {
        userId: 102,
        location: '上海'
      };

      const mockRecentImpressions = [
        { advertisementId: 1, createdAt: new Date(Date.now() - 30 * 60 * 1000) }, // 30分钟前
        { advertisementId: 2, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) } // 2小时前
      ];

      const mockAds = [
        { id: 1, title: '广告1', status: 'active' },
        { id: 2, title: '广告2', status: 'active' },
        { id: 3, title: '广告3', status: 'active' }
      ];

      mockAdvertisementImpressionModel.findAll.mockResolvedValue(mockRecentImpressions);
      mockAdvertisementModel.findAll.mockResolvedValue(mockAds);
      mockTargetingService.calculateRelevanceScore.mockResolvedValue(0.7);
      mockBidService.calculateBid.mockResolvedValue(2.0);

      const result = await advertisementService.getTargetedAds(targetingCriteria, 5);

      expect(mockAdvertisementImpressionModel.findAll).toHaveBeenCalledWith({
        where: {
          userId: 102,
          createdAt: {
            [mockSequelize.Op.gte]: expect.any(Date) // 过去24小时
          }
        }
      });
      expect(result).toHaveLength(1); // 只返回广告3，因为1和2已经展示过
      expect(result[0].id).toBe(3);
    });

    it('应该根据时间段过滤广告', async () => {
      const targetingCriteria = {
        userId: 103,
        timeOfDay: '02:00' // 凌晨2点
      };

      const mockAds = [
        {
          id: 1,
          title: '白天广告',
          schedule: {
            timeSlots: [
              { start: '09:00', end: '18:00' }
            ]
          },
          status: 'active'
        },
        {
          id: 2,
          title: '全天广告',
          schedule: {
            timeSlots: [
              { start: '00:00', end: '23:59' }
            ]
          },
          status: 'active'
        }
      ];

      mockAdvertisementModel.findAll.mockResolvedValue(mockAds);
      mockTargetingService.calculateRelevanceScore.mockResolvedValue(0.7);
      mockBidService.calculateBid.mockResolvedValue(2.0);

      const result = await advertisementService.getTargetedAds(targetingCriteria, 5);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2); // 只有全天广告符合时间条件
    });
  });

  describe('广告展示和点击跟踪', () => {
    it('应该记录广告展示', async () => {
      const impressionData = {
        advertisementId: 1,
        userId: 101,
        location: '北京',
        deviceType: 'mobile',
        userAgent: 'Mozilla/5.0...',
        referrer: 'https://example.com/page',
        position: 'top_banner',
        context: {
          pageType: 'home',
          sessionId: 'session_123'
        }
      };

      const mockImpression = {
        id: 1,
        ...impressionData,
        createdAt: new Date()
      };

      mockAdvertisementImpressionModel.create.mockResolvedValue(mockImpression);
      mockAnalyticsService.recordImpression.mockResolvedValue({ success: true });
      mockRedisClient.incr.mockResolvedValue(1);

      const result = await advertisementService.recordImpression(impressionData);

      expect(mockAdvertisementImpressionModel.create).toHaveBeenCalledWith(impressionData);
      expect(mockAnalyticsService.recordImpression).toHaveBeenCalledWith({
        adId: 1,
        userId: 101,
        timestamp: expect.any(Date)
      });
      expect(mockRedisClient.incr).toHaveBeenCalledWith('ad:1:impressions:daily');
      expect(result).toEqual(mockImpression);
    });

    it('应该记录广告点击', async () => {
      const clickData = {
        advertisementId: 2,
        userId: 102,
        impressionId: 1,
        clickedAt: new Date(),
        location: '上海',
        deviceType: 'desktop'
      };

      const mockClick = {
        id: 1,
        ...clickData,
        createdAt: new Date()
      };

      const mockAd = {
        id: 2,
        title: '测试广告',
        budget: { maxBid: 2.5 }
      };

      mockAdvertisementClickModel.create.mockResolvedValue(mockClick);
      mockAdvertisementModel.findByPk.mockResolvedValue(mockAd);
      mockAnalyticsService.recordClick.mockResolvedValue({ success: true });
      mockRedisClient.incr.mockResolvedValue(1);
      mockBidService.calculateBid.mockResolvedValue(2.3);

      const result = await advertisementService.recordClick(clickData);

      expect(mockAdvertisementClickModel.create).toHaveBeenCalledWith(clickData);
      expect(mockAnalyticsService.recordClick).toHaveBeenCalledWith({
        adId: 2,
        userId: 102,
        cost: 2.3,
        timestamp: expect.any(Date)
      });
      expect(mockRedisClient.incr).toHaveBeenCalledWith('ad:2:clicks:daily');
      expect(result.click).toEqual(mockClick);
      expect(result.cost).toBe(2.3);
    });

    it('应该计算点击率', async () => {
      const adId = 1;
      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31')
      };

      mockAdvertisementImpressionModel.count.mockResolvedValue(1000);
      mockAdvertisementClickModel.count.mockResolvedValue(25);

      const ctr = await advertisementService.calculateClickThroughRate(adId, dateRange);

      expect(mockAdvertisementImpressionModel.count).toHaveBeenCalledWith({
        where: {
          advertisementId: 1,
          createdAt: {
            [mockSequelize.Op.between]: [dateRange.start, dateRange.end]
          }
        }
      });
      expect(mockAdvertisementClickModel.count).toHaveBeenCalledWith({
        where: {
          advertisementId: 1,
          createdAt: {
            [mockSequelize.Op.between]: [dateRange.start, dateRange.end]
          }
        }
      });
      expect(ctr).toBe(0.025); // 25/1000 = 2.5%
    });

    it('应该防止点击欺诈', async () => {
      const clickData = {
        advertisementId: 3,
        userId: 103,
        impressionId: 2
      };

      // 模拟短时间内多次点击
      const recentClicks = [
        { id: 1, createdAt: new Date(Date.now() - 30000) }, // 30秒前
        { id: 2, createdAt: new Date(Date.now() - 60000) }, // 1分钟前
        { id: 3, createdAt: new Date(Date.now() - 90000) }  // 1.5分钟前
      ];

      mockAdvertisementClickModel.findAll.mockResolvedValue(recentClicks);

      await expect(advertisementService.recordClick(clickData))
        .rejects.toThrow('Suspicious click activity detected');

      expect(mockAdvertisementClickModel.create).not.toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Click fraud detected',
        expect.objectContaining({
          userId: 103,
          adId: 3,
          recentClickCount: 3
        })
      );
    });
  });

  describe('广告性能分析', () => {
    it('应该生成广告性能报告', async () => {
      const adId = 1;
      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31')
      };

      const mockAd = {
        id: 1,
        title: '测试广告',
        budget: { total: 5000, spent: 3200 }
      };

      const mockImpressions = 15000;
      const mockClicks = 450;
      const mockConversions = 25;
      const mockTotalCost = 3200;

      mockAdvertisementModel.findByPk.mockResolvedValue(mockAd);
      mockAdvertisementImpressionModel.count.mockResolvedValue(mockImpressions);
      mockAdvertisementClickModel.count.mockResolvedValue(mockClicks);
      mockAnalyticsService.generateReport.mockResolvedValue({
        conversions: mockConversions,
        totalCost: mockTotalCost,
        averageCPC: 7.11,
        averageCPM: 213.33,
        conversionRate: 0.056
      });

      const report = await advertisementService.generatePerformanceReport(adId, dateRange);

      expect(report).toEqual({
        adId: 1,
        title: '测试广告',
        period: dateRange,
        impressions: 15000,
        clicks: 450,
        conversions: 25,
        ctr: 0.03, // 450/15000
        conversionRate: 0.056,
        totalCost: 3200,
        averageCPC: 7.11,
        averageCPM: 213.33,
        budgetUtilization: 0.64, // 3200/5000
        roi: expect.any(Number)
      });
    });

    it('应该识别表现最佳的广告', async () => {
      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31')
      };

      const mockTopAds = [
        {
          id: 1,
          title: '最佳广告1',
          impressions: 20000,
          clicks: 800,
          conversions: 40,
          cost: 2000,
          ctr: 0.04,
          conversionRate: 0.05,
          roi: 2.5
        },
        {
          id: 2,
          title: '最佳广告2',
          impressions: 15000,
          clicks: 600,
          conversions: 35,
          cost: 1800,
          ctr: 0.04,
          conversionRate: 0.058,
          roi: 2.2
        }
      ];

      mockAnalyticsService.generateReport.mockResolvedValue({
        topPerformingAds: mockTopAds
      });

      const result = await advertisementService.getTopPerformingAds(dateRange, 5);

      expect(mockAnalyticsService.generateReport).toHaveBeenCalledWith({
        type: 'top_performing',
        dateRange,
        limit: 5,
        sortBy: 'roi'
      });
      expect(result).toEqual(mockTopAds);
    });

    it('应该提供优化建议', async () => {
      const adId = 1;

      const mockPerformanceData = {
        ctr: 0.015, // 低点击率
        conversionRate: 0.02, // 低转化率
        averageCPC: 5.5,
        budgetUtilization: 0.3, // 低预算利用率
        impressions: 10000,
        clicks: 150
      };

      const suggestions = await advertisementService.generateOptimizationSuggestions(
        adId,
        mockPerformanceData
      );

      expect(suggestions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'low_ctr',
            message: expect.stringContaining('点击率较低'),
            recommendation: expect.stringContaining('优化广告创意')
          }),
          expect.objectContaining({
            type: 'low_conversion_rate',
            message: expect.stringContaining('转化率较低'),
            recommendation: expect.stringContaining('优化落地页')
          }),
          expect.objectContaining({
            type: 'low_budget_utilization',
            message: expect.stringContaining('预算利用率较低'),
            recommendation: expect.stringContaining('增加出价')
          })
        ])
      );
    });
  });

  describe('A/B测试', () => {
    it('应该创建A/B测试', async () => {
      const testData = {
        name: '标题优化测试',
        description: '测试不同标题对点击率的影响',
        variants: [
          {
            name: 'A版本',
            title: '春季招生开始啦！',
            description: '现在报名享受优惠',
            weight: 50
          },
          {
            name: 'B版本',
            title: '限时优惠！春季班火热招生中',
            description: '立即报名，享受8折优惠',
            weight: 50
          }
        ],
        trafficSplit: 0.2, // 20%的流量参与测试
        duration: 14, // 14天
        successMetric: 'ctr'
      };

      const mockTest = {
        id: 1,
        ...testData,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      };

      mockAdvertisementModel.create.mockResolvedValue(mockTest);
      mockSchedulerService.schedule.mockResolvedValue({ jobId: 'test_end_job_1' });

      const result = await advertisementService.createABTest(testData);

      expect(mockAdvertisementModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'ab_test',
          status: 'active',
          testConfig: testData
        })
      );
      expect(mockSchedulerService.schedule).toHaveBeenCalledWith(
        expect.any(Date), // 结束时间
        expect.any(Function) // 结束测试的回调
      );
      expect(result).toEqual(mockTest);
    });

    it('应该分配测试流量', async () => {
      const testId = 1;
      const userId = 101;

      const mockTest = {
        id: 1,
        testConfig: {
          variants: [
            { name: 'A', weight: 60 },
            { name: 'B', weight: 40 }
          ],
          trafficSplit: 0.3
        },
        status: 'active'
      };

      mockAdvertisementModel.findByPk.mockResolvedValue(mockTest);
      mockRedisClient.get.mockResolvedValue(null); // 用户未分配过

      // 模拟随机数生成，使用户被分配到测试组
      const originalMath = Math.random;
      Math.random = jest.fn()
        .mockReturnValueOnce(0.2) // 小于0.3，进入测试
        .mockReturnValueOnce(0.7); // 大于0.6，分配到B组

      const variant = await advertisementService.assignTestVariant(testId, userId);

      expect(variant).toBe('B');
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        `ab_test:${testId}:user:${userId}`,
        'B',
        'EX',
        expect.any(Number)
      );

      // 恢复原始Math.random
      Math.random = originalMath;
    });

    it('应该分析A/B测试结果', async () => {
      const testId = 1;

      const mockTestResults = {
        variants: {
          A: {
            impressions: 5000,
            clicks: 200,
            conversions: 15,
            ctr: 0.04,
            conversionRate: 0.075
          },
          B: {
            impressions: 5000,
            clicks: 250,
            conversions: 20,
            ctr: 0.05,
            conversionRate: 0.08
          }
        }
      };

      mockAnalyticsService.generateReport.mockResolvedValue(mockTestResults);

      const analysis = await advertisementService.analyzeABTestResults(testId);

      expect(analysis).toEqual({
        testId: 1,
        results: mockTestResults.variants,
        winner: 'B',
        significance: expect.any(Number),
        improvement: {
          ctr: 0.25, // (0.05 - 0.04) / 0.04 = 25%提升
          conversionRate: 0.067 // (0.08 - 0.075) / 0.075 ≈ 6.7%提升
        },
        recommendation: expect.stringContaining('B版本')
      });
    });
  });

  describe('错误处理', () => {
    it('应该处理文件上传失败', async () => {
      const adData = {
        title: '测试广告',
        content: {
          imageUrl: 'https://example.com/invalid-image.jpg'
        }
      };

      mockContentModerationService.moderateContent.mockResolvedValue({
        approved: true,
        score: 0.9
      });
      mockFileUploadService.optimizeImage.mockRejectedValue(
        new Error('Image optimization failed')
      );

      await expect(advertisementService.createAdvertisement(adData))
        .rejects.toThrow('Image optimization failed');

      expect(mockAdvertisementModel.create).not.toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Advertisement creation failed',
        expect.any(Object)
      );
    });

    it('应该处理数据库连接错误', async () => {
      const impressionData = {
        advertisementId: 1,
        userId: 101
      };

      mockAdvertisementImpressionModel.create.mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(advertisementService.recordImpression(impressionData))
        .rejects.toThrow('Database connection failed');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to record impression',
        expect.any(Object)
      );
    });

    it('应该处理广告不存在的情况', async () => {
      const adId = 999;

      mockAdvertisementModel.findByPk.mockResolvedValue(null);

      await expect(advertisementService.updateAdvertisementStatus(adId, 'active'))
        .rejects.toThrow('Advertisement not found');

      expect(mockAdvertisementModel.update).not.toHaveBeenCalled();
    });
  });

  describe('性能优化', () => {
    it('应该缓存广告数据', async () => {
      const adId = 1;

      const mockAd = {
        id: 1,
        title: '缓存测试广告',
        status: 'active'
      };

      // 第一次调用
      mockAdvertisementModel.findByPk.mockResolvedValue(mockAd);
      mockRedisClient.set.mockResolvedValue('OK');

      await advertisementService.getAdvertisement(adId);

      // 第二次调用应该从缓存获取
      mockRedisClient.get.mockResolvedValue(JSON.stringify(mockAd));

      const cachedResult = await advertisementService.getAdvertisement(adId);

      expect(mockRedisClient.get).toHaveBeenCalledWith(`ad:${adId}`);
      expect(cachedResult).toEqual(mockAd);
    });

    it('应该批量处理展示记录', async () => {
      const impressions = Array.from({ length: 100 }, (_, i) => ({
        advertisementId: Math.floor(i / 10) + 1,
        userId: i + 1,
        timestamp: new Date()
      }));

      mockAdvertisementImpressionModel.bulkCreate.mockResolvedValue(
        impressions.map((imp, i) => ({ id: i + 1, ...imp }))
      );

      const result = await advertisementService.batchRecordImpressions(impressions);

      expect(mockAdvertisementImpressionModel.bulkCreate).toHaveBeenCalledWith(impressions);
      expect(result.recordedCount).toBe(100);
    });
  });
});
