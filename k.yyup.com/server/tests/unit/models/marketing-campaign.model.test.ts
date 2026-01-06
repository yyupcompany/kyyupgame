import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock Sequelize
const mockSequelize = {
  define: jest.fn(),
  authenticate: jest.fn(),
  sync: jest.fn(),
  transaction: jest.fn(),
  Op: {
    eq: Symbol('eq'),
    ne: Symbol('ne'),
    in: Symbol('in'),
    notIn: Symbol('notIn'),
    like: Symbol('like'),
    iLike: Symbol('iLike'),
    gt: Symbol('gt'),
    gte: Symbol('gte'),
    lt: Symbol('lt'),
    lte: Symbol('lte'),
    between: Symbol('between'),
    and: Symbol('and'),
    or: Symbol('or')
  },
  DataTypes: {
    INTEGER: 'INTEGER',
    STRING: 'STRING',
    TEXT: 'TEXT',
    BOOLEAN: 'BOOLEAN',
    DATE: 'DATE',
    ENUM: 'ENUM',
    JSON: 'JSON',
    DECIMAL: 'DECIMAL'
  }
};

// Mock model instance
const createMockMarketingCampaign = (overrides = {}) => ({
  id: 1,
  name: '春季招生活动',
  description: '2024年春季招生宣传活动',
  type: 'enrollment',
  status: 'draft',
  priority: 'high',
  targetAudience: {
    ageRange: { min: 3, max: 6 },
    location: ['北京市', '上海市'],
    interests: ['教育', '亲子'],
    demographics: {
      income: 'middle_high',
      education: 'bachelor_above'
    }
  },
  channels: ['email', 'sms', 'social_media', 'website'],
  budget: {
    total: 50000.00,
    allocated: {
      email: 10000.00,
      sms: 15000.00,
      social_media: 20000.00,
      website: 5000.00
    },
    spent: 0.00
  },
  schedule: {
    startDate: new Date('2024-04-01T00:00:00Z'),
    endDate: new Date('2024-04-30T23:59:59Z'),
    timezone: 'Asia/Shanghai'
  },
  content: {
    title: '优质幼儿教育，从这里开始',
    subtitle: '专业师资，温馨环境，全面发展',
    description: '我们致力于为孩子提供最优质的学前教育...',
    images: ['/images/campaign/spring-2024-1.jpg'],
    videos: ['/videos/campaign/intro.mp4'],
    callToAction: {
      text: '立即报名',
      url: '/enrollment/apply',
      style: 'primary'
    }
  },
  metrics: {
    impressions: 0,
    clicks: 0,
    conversions: 0,
    cost: 0.00,
    ctr: 0.00, // Click Through Rate
    cpc: 0.00, // Cost Per Click
    cpa: 0.00, // Cost Per Acquisition
    roi: 0.00  // Return on Investment
  },
  settings: {
    autoOptimize: true,
    frequencyCap: 3,
    bidStrategy: 'maximize_conversions',
    trackingEnabled: true,
    abTestEnabled: false
  },
  createdBy: 1,
  approvedBy: null,
  approvedAt: null,
  launchedAt: null,
  pausedAt: null,
  completedAt: null,
  createdAt: new Date('2024-03-15T10:00:00Z'),
  updatedAt: new Date('2024-03-15T10:00:00Z'),
  
  // Mock methods
  save: jest.fn().mockResolvedValue(this),
  destroy: jest.fn().mockResolvedValue(true as any),
  reload: jest.fn().mockResolvedValue(this),
  update: jest.fn().mockImplementation((data) => {
    Object.assign(this, data);
    return Promise.resolve(this);
  }),
  toJSON: jest.fn().mockImplementation(() => {
    const { save, destroy, reload, update, toJSON, ...data } = this;
    return data;
  }),
  
  // Association methods
  getCreator: jest.fn(),
  setCreator: jest.fn(),
  getApprover: jest.fn(),
  setApprover: jest.fn(),
  getKindergartens: jest.fn(),
  addKindergarten: jest.fn(),
  removeKindergarten: jest.fn(),
  getLeads: jest.fn(),
  addLead: jest.fn(),
  getAnalytics: jest.fn(),
  
  // Instance methods
  canLaunch: jest.fn().mockReturnValue(true),
  canPause: jest.fn().mockReturnValue(true),
  canResume: jest.fn().mockReturnValue(true),
  canComplete: jest.fn().mockReturnValue(true),
  launch: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  complete: jest.fn(),
  calculateROI: jest.fn().mockReturnValue(2.5),
  calculateCTR: jest.fn().mockReturnValue(0.025),
  calculateCPC: jest.fn().mockReturnValue(1.25),
  calculateCPA: jest.fn().mockReturnValue(50.00),
  updateMetrics: jest.fn(),
  optimizeBudget: jest.fn(),
  generateReport: jest.fn(),
  cloneCampaign: jest.fn(),
  
  ...overrides
});

// Mock static methods
const mockMarketingCampaignModel = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  count: jest.fn(),
  findAndCountAll: jest.fn(),
  bulkCreate: jest.fn(),
  bulkUpdate: jest.fn(),
  
  // Associations
  belongsTo: jest.fn(),
  hasMany: jest.fn(),
  belongsToMany: jest.fn(),
  
  // Scopes
  scope: jest.fn().mockReturnThis(),
  addScope: jest.fn(),
  
  // Hooks
  beforeCreate: jest.fn(),
  afterCreate: jest.fn(),
  beforeUpdate: jest.fn(),
  afterUpdate: jest.fn(),
  beforeDestroy: jest.fn(),
  afterDestroy: jest.fn(),
  
  // Custom static methods
  findByStatus: jest.fn(),
  findByType: jest.fn(),
  findActive: jest.fn(),
  findByDateRange: jest.fn(),
  getPerformanceStats: jest.fn(),
  getBudgetSummary: jest.fn(),
  getTopPerformers: jest.fn(),
  bulkLaunch: jest.fn(),
  bulkPause: jest.fn(),
  
  // Analytics methods
  generateAnalyticsReport: jest.fn(),
  comparePerformance: jest.fn(),
  predictPerformance: jest.fn()
};

// Mock imports
jest.unstable_mockModule('sequelize', () => ({
  Sequelize: jest.fn().mockImplementation(() => mockSequelize),
  DataTypes: mockDataTypes,
  Op: mockSequelize.Op
}));

jest.unstable_mockModule('../../../../../src/config/database', () => ({
  sequelize: mockSequelize
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

describe('MarketingCampaign Model', () => {
  let MarketingCampaign: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/models/marketing-campaign.model');
    MarketingCampaign = imported.MarketingCampaign || mockMarketingCampaignModel;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('模型定义', () => {
    it('应该定义正确的字段', () => {
      expect(mockSequelize.define).toHaveBeenCalledWith(
        'MarketingCampaign',
        expect.objectContaining({
          id: expect.objectContaining({
            type: 'INTEGER',
            primaryKey: true,
            autoIncrement: true
          }),
          name: expect.objectContaining({
            type: 'STRING',
            allowNull: false
          }),
          type: expect.objectContaining({
            type: 'ENUM',
            values: ['enrollment', 'brand_awareness', 'event_promotion', 'retention', 'referral']
          }),
          status: expect.objectContaining({
            type: 'ENUM',
            values: ['draft', 'pending_approval', 'approved', 'active', 'paused', 'completed', 'cancelled'],
            defaultValue: 'draft'
          }),
          priority: expect.objectContaining({
            type: 'ENUM',
            values: ['low', 'medium', 'high', 'urgent'],
            defaultValue: 'medium'
          }),
          targetAudience: expect.objectContaining({
            type: 'JSON'
          }),
          budget: expect.objectContaining({
            type: 'JSON'
          }),
          metrics: expect.objectContaining({
            type: 'JSON'
          })
        }),
        expect.objectContaining({
          tableName: 'marketing_campaigns',
          timestamps: true,
          paranoid: true
        })
      );
    });

    it('应该定义正确的关联关系', () => {
      expect(MarketingCampaign.belongsTo).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          foreignKey: 'createdBy',
          as: 'creator'
        })
      );

      expect(MarketingCampaign.belongsTo).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          foreignKey: 'approvedBy',
          as: 'approver'
        })
      );

      expect(MarketingCampaign.belongsToMany).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          through: 'campaign_kindergartens',
          as: 'kindergartens'
        })
      );

      expect(MarketingCampaign.hasMany).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          foreignKey: 'campaignId',
          as: 'leads'
        })
      );
    });

    it('应该定义正确的索引', () => {
      expect(mockSequelize.define).toHaveBeenCalledWith(
        'MarketingCampaign',
        expect.any(Object),
        expect.objectContaining({
          indexes: expect.arrayContaining([
            expect.objectContaining({
              fields: ['status']
            }),
            expect.objectContaining({
              fields: ['type']
            }),
            expect.objectContaining({
              fields: ['createdBy']
            }),
            expect.objectContaining({
              fields: ['schedule.startDate', 'schedule.endDate']
            })
          ])
        })
      );
    });
  });

  describe('实例方法', () => {
    let campaign: any;

    beforeEach(() => {
      campaign = createMockMarketingCampaign();
    });

    describe('canLaunch', () => {
      it('应该允许已批准的活动启动', () => {
        campaign.status = 'approved';
        campaign.budget.total = 10000;
        campaign.schedule.startDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 明天
        
        const canLaunch = campaign.canLaunch();
        
        expect(canLaunch).toBe(true);
      });

      it('应该拒绝草稿状态的活动启动', () => {
        campaign.status = 'draft';
        
        const canLaunch = campaign.canLaunch();
        
        expect(canLaunch).toBe(false);
      });

      it('应该拒绝预算为零的活动启动', () => {
        campaign.status = 'approved';
        campaign.budget.total = 0;
        
        const canLaunch = campaign.canLaunch();
        
        expect(canLaunch).toBe(false);
      });

      it('应该拒绝已过期的活动启动', () => {
        campaign.status = 'approved';
        campaign.schedule.endDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 昨天
        
        const canLaunch = campaign.canLaunch();
        
        expect(canLaunch).toBe(false);
      });
    });

    describe('launch', () => {
      it('应该启动活动', async () => {
        campaign.status = 'approved';
        campaign.canLaunch.mockReturnValue(true);
        
        await campaign.launch();
        
        expect(campaign.update).toHaveBeenCalledWith({
          status: 'active',
          launchedAt: expect.any(Date)
        });
      });

      it('应该拒绝启动不符合条件的活动', async () => {
        campaign.status = 'draft';
        campaign.canLaunch.mockReturnValue(false);
        
        await expect(campaign.launch()).rejects.toThrow('活动当前状态不允许启动');
      });
    });

    describe('pause', () => {
      it('应该暂停活动', async () => {
        campaign.status = 'active';
        campaign.canPause.mockReturnValue(true);
        
        await campaign.pause();
        
        expect(campaign.update).toHaveBeenCalledWith({
          status: 'paused',
          pausedAt: expect.any(Date)
        });
      });

      it('应该拒绝暂停非活动状态的活动', async () => {
        campaign.status = 'draft';
        campaign.canPause.mockReturnValue(false);
        
        await expect(campaign.pause()).rejects.toThrow('活动当前状态不允许暂停');
      });
    });

    describe('resume', () => {
      it('应该恢复暂停的活动', async () => {
        campaign.status = 'paused';
        campaign.canResume.mockReturnValue(true);
        
        await campaign.resume();
        
        expect(campaign.update).toHaveBeenCalledWith({
          status: 'active',
          pausedAt: null
        });
      });

      it('应该拒绝恢复非暂停状态的活动', async () => {
        campaign.status = 'active';
        campaign.canResume.mockReturnValue(false);
        
        await expect(campaign.resume()).rejects.toThrow('活动当前状态不允许恢复');
      });
    });

    describe('complete', () => {
      it('应该完成活动', async () => {
        campaign.status = 'active';
        campaign.canComplete.mockReturnValue(true);
        
        await campaign.complete();
        
        expect(campaign.update).toHaveBeenCalledWith({
          status: 'completed',
          completedAt: expect.any(Date)
        });
      });

      it('应该自动完成过期的活动', async () => {
        campaign.status = 'active';
        campaign.schedule.endDate = new Date(Date.now() - 1000); // 1秒前过期
        
        await campaign.complete();
        
        expect(campaign.update).toHaveBeenCalledWith({
          status: 'completed',
          completedAt: expect.any(Date)
        });
      });
    });

    describe('calculateROI', () => {
      it('应该计算投资回报率', () => {
        campaign.budget.spent = 10000;
        campaign.metrics.conversions = 50;
        const averageOrderValue = 500; // 每个转化价值500元
        
        const roi = campaign.calculateROI(averageOrderValue);
        
        expect(roi).toBe(1.5); // (50 * 500 - 10000) / 10000 = 1.5
      });

      it('应该处理零支出的情况', () => {
        campaign.budget.spent = 0;
        campaign.metrics.conversions = 10;
        
        const roi = campaign.calculateROI(100);
        
        expect(roi).toBe(Infinity);
      });

      it('应该处理零转化的情况', () => {
        campaign.budget.spent = 1000;
        campaign.metrics.conversions = 0;
        
        const roi = campaign.calculateROI(100);
        
        expect(roi).toBe(-1); // 完全亏损
      });
    });

    describe('calculateCTR', () => {
      it('应该计算点击率', () => {
        campaign.metrics.impressions = 10000;
        campaign.metrics.clicks = 250;
        
        const ctr = campaign.calculateCTR();
        
        expect(ctr).toBe(0.025); // 2.5%
      });

      it('应该处理零展示的情况', () => {
        campaign.metrics.impressions = 0;
        campaign.metrics.clicks = 10;
        
        const ctr = campaign.calculateCTR();
        
        expect(ctr).toBe(0);
      });
    });

    describe('calculateCPC', () => {
      it('应该计算每次点击成本', () => {
        campaign.budget.spent = 1000;
        campaign.metrics.clicks = 800;
        
        const cpc = campaign.calculateCPC();
        
        expect(cpc).toBe(1.25);
      });

      it('应该处理零点击的情况', () => {
        campaign.budget.spent = 1000;
        campaign.metrics.clicks = 0;
        
        const cpc = campaign.calculateCPC();
        
        expect(cpc).toBe(0);
      });
    });

    describe('calculateCPA', () => {
      it('应该计算每次获客成本', () => {
        campaign.budget.spent = 5000;
        campaign.metrics.conversions = 100;
        
        const cpa = campaign.calculateCPA();
        
        expect(cpa).toBe(50);
      });

      it('应该处理零转化的情况', () => {
        campaign.budget.spent = 1000;
        campaign.metrics.conversions = 0;
        
        const cpa = campaign.calculateCPA();
        
        expect(cpa).toBe(0);
      });
    });

    describe('updateMetrics', () => {
      it('应该更新活动指标', async () => {
        const newMetrics = {
          impressions: 15000,
          clicks: 375,
          conversions: 25,
          cost: 1250
        };
        
        await campaign.updateMetrics(newMetrics);
        
        expect(campaign.update).toHaveBeenCalledWith({
          metrics: expect.objectContaining(newMetrics),
          'budget.spent': 1250
        });
      });

      it('应该自动计算衍生指标', async () => {
        const newMetrics = {
          impressions: 10000,
          clicks: 200,
          conversions: 20,
          cost: 1000
        };
        
        campaign.calculateCTR.mockReturnValue(0.02);
        campaign.calculateCPC.mockReturnValue(5);
        campaign.calculateCPA.mockReturnValue(50);
        
        await campaign.updateMetrics(newMetrics);
        
        expect(campaign.calculateCTR).toHaveBeenCalled();
        expect(campaign.calculateCPC).toHaveBeenCalled();
        expect(campaign.calculateCPA).toHaveBeenCalled();
      });
    });

    describe('optimizeBudget', () => {
      it('应该优化预算分配', async () => {
        campaign.metrics = {
          email: { conversions: 10, cost: 500 },
          sms: { conversions: 5, cost: 300 },
          social_media: { conversions: 20, cost: 800 }
        };
        
        const optimizedBudget = await campaign.optimizeBudget();
        
        expect(optimizedBudget).toEqual(expect.objectContaining({
          recommendations: expect.any(Array),
          projectedImprovement: expect.any(Number)
        }));
      });

      it('应该基于性能重新分配预算', async () => {
        campaign.settings.autoOptimize = true;
        
        await campaign.optimizeBudget();
        
        expect(campaign.update).toHaveBeenCalledWith({
          budget: expect.objectContaining({
            allocated: expect.any(Object)
          })
        });
      });
    });

    describe('generateReport', () => {
      it('应该生成活动报告', async () => {
        const reportOptions = {
          format: 'pdf',
          includeCharts: true,
          dateRange: {
            start: '2024-04-01',
            end: '2024-04-30'
          }
        };
        
        const report = await campaign.generateReport(reportOptions);
        
        expect(report).toEqual(expect.objectContaining({
          campaignId: campaign.id,
          format: 'pdf',
          summary: expect.any(Object),
          metrics: expect.any(Object),
          recommendations: expect.any(Array)
        }));
      });

      it('应该包含性能分析', async () => {
        const report = await campaign.generateReport();
        
        expect(report.analysis).toEqual(expect.objectContaining({
          performance: expect.any(String), // 'excellent', 'good', 'average', 'poor'
          strengths: expect.any(Array),
          weaknesses: expect.any(Array),
          opportunities: expect.any(Array)
        }));
      });
    });

    describe('cloneCampaign', () => {
      it('应该克隆活动', async () => {
        const cloneOptions = {
          name: '春季招生活动 - 副本',
          schedule: {
            startDate: new Date('2024-05-01'),
            endDate: new Date('2024-05-31')
          }
        };
        
        const clonedCampaign = await campaign.cloneCampaign(cloneOptions);
        
        expect(clonedCampaign).toEqual(expect.objectContaining({
          name: '春季招生活动 - 副本',
          status: 'draft',
          metrics: expect.objectContaining({
            impressions: 0,
            clicks: 0,
            conversions: 0
          })
        }));
      });

      it('应该重置克隆活动的指标', async () => {
        const clonedCampaign = await campaign.cloneCampaign();
        
        expect(clonedCampaign.metrics.impressions).toBe(0);
        expect(clonedCampaign.metrics.clicks).toBe(0);
        expect(clonedCampaign.metrics.conversions).toBe(0);
        expect(clonedCampaign.budget.spent).toBe(0);
      });
    });
  });

  describe('静态方法', () => {
    describe('findByStatus', () => {
      it('应该按状态查找活动', async () => {
        const mockCampaigns = [
          createMockMarketingCampaign({ status: 'active' }),
          createMockMarketingCampaign({ status: 'active' })
        ];
        
        MarketingCampaign.findByStatus = jest.fn().mockResolvedValue(mockCampaigns);
        
        const result = await MarketingCampaign.findByStatus('active');
        
        expect(result).toHaveLength(2);
        expect(result[0].status).toBe('active');
        expect(result[1].status).toBe('active');
      });
    });

    describe('findActive', () => {
      it('应该查找活跃的活动', async () => {
        const mockActiveCampaigns = [
          createMockMarketingCampaign({ status: 'active' })
        ];
        
        MarketingCampaign.findActive = jest.fn().mockResolvedValue(mockActiveCampaigns);
        
        const result = await MarketingCampaign.findActive();
        
        expect(result).toHaveLength(1);
        expect(result[0].status).toBe('active');
      });
    });

    describe('getPerformanceStats', () => {
      it('应该获取性能统计', async () => {
        const mockStats = {
          totalCampaigns: 50,
          activeCampaigns: 10,
          totalBudget: 500000,
          totalSpent: 350000,
          totalImpressions: 1000000,
          totalClicks: 25000,
          totalConversions: 1250,
          averageCTR: 0.025,
          averageCPC: 14,
          averageCPA: 280,
          averageROI: 1.8
        };
        
        MarketingCampaign.getPerformanceStats = jest.fn().mockResolvedValue(mockStats);
        
        const result = await MarketingCampaign.getPerformanceStats();
        
        expect(result).toEqual(mockStats);
      });

      it('应该支持时间范围筛选', async () => {
        const dateRange = {
          start: '2024-04-01',
          end: '2024-04-30'
        };
        
        await MarketingCampaign.getPerformanceStats(dateRange);
        
        expect(MarketingCampaign.getPerformanceStats).toHaveBeenCalledWith(dateRange);
      });
    });

    describe('getBudgetSummary', () => {
      it('应该获取预算摘要', async () => {
        const mockBudgetSummary = {
          totalBudget: 100000,
          allocatedBudget: 85000,
          spentBudget: 45000,
          remainingBudget: 40000,
          utilizationRate: 0.53,
          byChannel: {
            email: { allocated: 20000, spent: 12000 },
            sms: { allocated: 25000, spent: 15000 },
            social_media: { allocated: 30000, spent: 18000 },
            website: { allocated: 10000, spent: 0 }
          },
          byType: {
            enrollment: { allocated: 60000, spent: 35000 },
            brand_awareness: { allocated: 25000, spent: 10000 }
          }
        };
        
        MarketingCampaign.getBudgetSummary = jest.fn().mockResolvedValue(mockBudgetSummary);
        
        const result = await MarketingCampaign.getBudgetSummary();
        
        expect(result).toEqual(mockBudgetSummary);
        expect(result.utilizationRate).toBe(0.53);
      });
    });

    describe('getTopPerformers', () => {
      it('应该获取表现最佳的活动', async () => {
        const mockTopPerformers = [
          {
            id: 1,
            name: '春季招生活动',
            roi: 3.2,
            conversions: 150,
            cpa: 45
          },
          {
            id: 2,
            name: '品牌宣传活动',
            roi: 2.8,
            conversions: 120,
            cpa: 52
          }
        ];
        
        MarketingCampaign.getTopPerformers = jest.fn().mockResolvedValue(mockTopPerformers);
        
        const result = await MarketingCampaign.getTopPerformers();
        
        expect(result).toHaveLength(2);
        expect(result[0].roi).toBeGreaterThan(result[1].roi);
      });

      it('应该支持按指标排序', async () => {
        const options = {
          metric: 'conversions',
          limit: 5
        };
        
        await MarketingCampaign.getTopPerformers(options);
        
        expect(MarketingCampaign.getTopPerformers).toHaveBeenCalledWith(options);
      });
    });

    describe('bulkLaunch', () => {
      it('应该批量启动活动', async () => {
        const campaignIds = [1, 2, 3];
        
        MarketingCampaign.bulkLaunch = jest.fn().mockResolvedValue({
          launched: 2,
          failed: 1,
          errors: [
            { id: 3, error: '活动状态不允许启动' }
          ]
        });
        
        const result = await MarketingCampaign.bulkLaunch(campaignIds);
        
        expect(result.launched).toBe(2);
        expect(result.failed).toBe(1);
        expect(result.errors).toHaveLength(1);
      });
    });

    describe('comparePerformance', () => {
      it('应该比较活动性能', async () => {
        const campaignIds = [1, 2];
        
        const mockComparison = {
          campaigns: [
            { id: 1, name: '活动A', roi: 2.5, ctr: 0.03 },
            { id: 2, name: '活动B', roi: 1.8, ctr: 0.025 }
          ],
          winner: { id: 1, metric: 'roi', value: 2.5 },
          insights: [
            '活动A的ROI比活动B高38.9%',
            '活动A的点击率比活动B高20%'
          ]
        };
        
        MarketingCampaign.comparePerformance = jest.fn().mockResolvedValue(mockComparison);
        
        const result = await MarketingCampaign.comparePerformance(campaignIds);
        
        expect(result.winner.id).toBe(1);
        expect(result.insights).toHaveLength(2);
      });
    });

    describe('predictPerformance', () => {
      it('应该预测活动性能', async () => {
        const campaignData = {
          type: 'enrollment',
          budget: 20000,
          targetAudience: { ageRange: { min: 3, max: 6 } },
          channels: ['email', 'social_media']
        };
        
        const mockPrediction = {
          estimatedImpressions: 50000,
          estimatedClicks: 1250,
          estimatedConversions: 62,
          estimatedCTR: 0.025,
          estimatedCPC: 16,
          estimatedCPA: 323,
          estimatedROI: 1.9,
          confidence: 0.78,
          recommendations: [
            '建议增加社交媒体预算分配',
            '考虑添加短信渠道以提高转化率'
          ]
        };
        
        MarketingCampaign.predictPerformance = jest.fn().mockResolvedValue(mockPrediction);
        
        const result = await MarketingCampaign.predictPerformance(campaignData);
        
        expect(result.estimatedROI).toBe(1.9);
        expect(result.confidence).toBe(0.78);
        expect(result.recommendations).toHaveLength(2);
      });
    });
  });

  describe('钩子函数', () => {
    it('应该在创建前验证预算分配', async () => {
      const campaignData = {
        name: '测试活动',
        budget: {
          total: 10000,
          allocated: {
            email: 5000,
            sms: 6000 // 总和超过总预算
          }
        }
      };
      
      MarketingCampaign.beforeCreate = jest.fn().mockImplementation((instance) => {
        const totalAllocated = Object.values(instance.budget.allocated).reduce((sum, amount) => sum + amount, 0);
        if (totalAllocated > instance.budget.total) {
          throw new Error('预算分配总和不能超过总预算');
        }
      });
      
      await expect(MarketingCampaign.create(campaignData)).rejects.toThrow('预算分配总和不能超过总预算');
    });

    it('应该在更新后自动优化预算', async () => {
      const campaign = createMockMarketingCampaign();
      
      MarketingCampaign.afterUpdate = jest.fn().mockImplementation(async (instance) => {
        if (instance.changed('metrics') && instance.settings.autoOptimize) {
          await instance.optimizeBudget();
        }
      });
      
      await campaign.update({ metrics: { conversions: 100 } });
      
      expect(MarketingCampaign.afterUpdate).toHaveBeenCalled();
    });

    it('应该在删除前检查活动状态', async () => {
      const campaign = createMockMarketingCampaign({ status: 'active' });
      
      MarketingCampaign.beforeDestroy = jest.fn().mockImplementation((instance) => {
        if (instance.status === 'active') {
          throw new Error('不能删除活跃的活动');
        }
      });
      
      await expect(campaign.destroy()).rejects.toThrow('不能删除活跃的活动');
    });
  });

  describe('作用域', () => {
    it('应该定义active作用域', () => {
      MarketingCampaign.addScope = jest.fn();
      
      expect(MarketingCampaign.addScope).toHaveBeenCalledWith('active', {
        where: { status: 'active' }
      });
    });

    it('应该定义byType作用域', () => {
      expect(MarketingCampaign.addScope).toHaveBeenCalledWith('byType', expect.any(Function));
    });

    it('应该定义highPerformance作用域', () => {
      expect(MarketingCampaign.addScope).toHaveBeenCalledWith('highPerformance', {
        where: {
          'metrics.roi': { [mockSequelize.Op.gt]: 2.0 }
        }
      });
    });
  });

  describe('验证', () => {
    it('应该验证活动名称唯一性', async () => {
      const duplicateData = {
        name: '春季招生活动' // 已存在的名称
      };
      
      MarketingCampaign.create = jest.fn().mockRejectedValue(
        new Error('活动名称已存在')
      );
      
      await expect(MarketingCampaign.create(duplicateData)).rejects.toThrow('活动名称已存在');
    });

    it('应该验证日期范围', async () => {
      const invalidData = {
        name: '测试活动',
        schedule: {
          startDate: new Date('2024-04-30'),
          endDate: new Date('2024-04-01') // 结束日期早于开始日期
        }
      };
      
      MarketingCampaign.create = jest.fn().mockRejectedValue(
        new Error('结束日期不能早于开始日期')
      );
      
      await expect(MarketingCampaign.create(invalidData)).rejects.toThrow('结束日期不能早于开始日期');
    });

    it('应该验证预算为正数', async () => {
      const invalidData = {
        name: '测试活动',
        budget: {
          total: -1000 // 负数预算
        }
      };
      
      MarketingCampaign.create = jest.fn().mockRejectedValue(
        new Error('预算必须为正数')
      );
      
      await expect(MarketingCampaign.create(invalidData)).rejects.toThrow('预算必须为正数');
    });
  });
});
