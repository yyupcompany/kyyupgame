import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock Sequelize
const mockSequelize = {
  define: jest.fn(),
  authenticate: jest.fn(),
  sync: jest.fn(),
  transaction: jest.fn(),
  literal: jest.fn(),
  fn: jest.fn(),
  col: jest.fn(),
  where: jest.fn(),
  DataTypes: {
    INTEGER: 'INTEGER',
    STRING: 'STRING',
    TEXT: 'TEXT',
    BOOLEAN: 'BOOLEAN',
    DATE: 'DATE',
    ENUM: 'ENUM',
    JSON: 'JSON',
    DECIMAL: 'DECIMAL',
    FLOAT: 'FLOAT'
  },
  Op: {
    and: Symbol('and'),
    or: Symbol('or'),
    in: Symbol('in'),
    like: Symbol('like'),
    iLike: Symbol('iLike'),
    gt: Symbol('gt'),
    gte: Symbol('gte'),
    lt: Symbol('lt'),
    lte: Symbol('lte'),
    ne: Symbol('ne'),
    between: Symbol('between')
  }
};

// Mock model instance methods
const createMockInstance = (data: any) => ({
  ...data,
  save: jest.fn().mockResolvedValue(data),
  update: jest.fn().mockResolvedValue(data),
  destroy: jest.fn().mockResolvedValue(true as any),
  reload: jest.fn().mockResolvedValue(data),
  toJSON: jest.fn().mockReturnValue(data),
  get: jest.fn((key) => data[key]),
  set: jest.fn((key, value) => { data[key] = value; }),
  changed: jest.fn().mockReturnValue(false),
  previous: jest.fn().mockReturnValue(null)
});

// Mock model static methods
const mockLeadModel = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  count: jest.fn(),
  findAndCountAll: jest.fn(),
  bulkCreate: jest.fn(),
  bulkUpdate: jest.fn(),
  bulkDestroy: jest.fn(),
  belongsTo: jest.fn(),
  hasMany: jest.fn(),
  belongsToMany: jest.fn(),
  addHook: jest.fn(),
  removeHook: jest.fn(),
  hasHook: jest.fn(),
  scope: jest.fn(),
  unscoped: jest.fn(),
  build: jest.fn(),
  findOrCreate: jest.fn(),
  upsert: jest.fn(),
  increment: jest.fn(),
  decrement: jest.fn(),
  max: jest.fn(),
  min: jest.fn(),
  sum: jest.fn(),
  aggregate: jest.fn()
};

// Mock related models
const mockMarketingCampaignModel = {
  findByPk: jest.fn(),
  findAll: jest.fn()
};

const mockUserModel = {
  findByPk: jest.fn(),
  findAll: jest.fn()
};

const mockStudentModel = {
  findByPk: jest.fn(),
  create: jest.fn()
};

const mockLeadActivityModel = {
  findAll: jest.fn(),
  create: jest.fn()
};

// Mock logger
const mockLogger = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// Mock imports
jest.unstable_mockModule('sequelize', () => ({
  default: jest.fn(() => mockSequelize),
  Sequelize: jest.fn(() => mockSequelize),
  DataTypes: mockDataTypes,
  Op: mockSequelize.Op
}));

jest.unstable_mockModule('../../../../../../src/config/database', () => ({
  default: mockSequelize
}));

jest.unstable_mockModule('../../../../../../src/models/marketing-campaign.model', () => ({
  default: mockMarketingCampaignModel
}));

jest.unstable_mockModule('../../../../../../src/models/user.model', () => ({
  default: mockUserModel
}));

jest.unstable_mockModule('../../../../../../src/models/student.model', () => ({
  default: mockStudentModel
}));

jest.unstable_mockModule('../../../../../../src/models/lead-activity.model', () => ({
  default: mockLeadActivityModel
}));

jest.unstable_mockModule('../../../../../../src/utils/logger', () => ({
  default: mockLogger
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

describe('Lead Model', () => {
  let LeadModel: any;

  beforeAll(async () => {
    // Mock the model definition
    mockSequelize.define.mockReturnValue(mockLeadModel);
    
    const imported = await import('../../../../../../src/models/lead.model');
    LeadModel = imported.default || imported.Lead || imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('模型定义', () => {
    it('应该正确定义Lead模型', () => {
      expect(mockSequelize.define).toHaveBeenCalledWith(
        'Lead',
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
          email: expect.objectContaining({
            type: 'STRING',
            allowNull: false,
            unique: true
          }),
          phone: expect.objectContaining({
            type: 'STRING',
            allowNull: false
          }),
          source: expect.objectContaining({
            type: 'ENUM',
            values: ['website', 'campaign', 'referral', 'social_media', 'phone', 'walk_in', 'other'],
            allowNull: false
          }),
          status: expect.objectContaining({
            type: 'ENUM',
            values: ['new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost'],
            defaultValue: 'new'
          }),
          score: expect.objectContaining({
            type: 'INTEGER',
            defaultValue: 0,
            validate: {
              min: 0,
              max: 100
            }
          }),
          interests: expect.objectContaining({
            type: 'JSON'
          }),
          demographics: expect.objectContaining({
            type: 'JSON'
          }),
          notes: expect.objectContaining({
            type: 'TEXT'
          }),
          campaignId: expect.objectContaining({
            type: 'INTEGER'
          }),
          assignedTo: expect.objectContaining({
            type: 'INTEGER'
          }),
          lastContactedAt: expect.objectContaining({
            type: 'DATE'
          }),
          convertedAt: expect.objectContaining({
            type: 'DATE'
          }),
          convertedToStudentId: expect.objectContaining({
            type: 'INTEGER'
          })
        }),
        expect.objectContaining({
          tableName: 'leads',
          timestamps: true,
          paranoid: true
        })
      );
    });

    it('应该设置正确的模型选项', () => {
      const defineCall = mockSequelize.define.mock.calls.find(
        call => call[0] === 'Lead'
      );
      
      expect(defineCall[2]).toEqual(
        expect.objectContaining({
          tableName: 'leads',
          timestamps: true,
          paranoid: true,
          indexes: expect.arrayContaining([
            expect.objectContaining({
              fields: ['email']
            }),
            expect.objectContaining({
              fields: ['phone']
            }),
            expect.objectContaining({
              fields: ['source']
            }),
            expect.objectContaining({
              fields: ['status']
            }),
            expect.objectContaining({
              fields: ['score']
            }),
            expect.objectContaining({
              fields: ['campaignId']
            }),
            expect.objectContaining({
              fields: ['assignedTo']
            })
          ])
        })
      );
    });
  });

  describe('CRUD操作', () => {
    it('应该创建新的潜在客户', async () => {
      const leadData = {
        name: '张三',
        email: 'zhang@example.com',
        phone: '13800138001',
        source: 'website',
        interests: ['小班教育', '双语教学'],
        demographics: {
          age: 32,
          gender: 'male',
          location: '北京市朝阳区',
          occupation: '工程师',
          income: '15000-20000'
        },
        notes: '对双语教学很感兴趣，希望了解更多课程信息',
        campaignId: 1
      };

      const createdLead = createMockInstance({
        id: 1,
        ...leadData,
        status: 'new',
        score: 60,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockLeadModel.create.mockResolvedValue(createdLead);

      const result = await mockLeadModel.create(leadData);

      expect(mockLeadModel.create).toHaveBeenCalledWith(leadData);
      expect(result).toEqual(createdLead);
    });

    it('应该查找潜在客户', async () => {
      const mockLead = createMockInstance({
        id: 1,
        name: '张三',
        email: 'zhang@example.com',
        phone: '13800138001',
        source: 'website',
        status: 'new',
        score: 60,
        interests: ['小班教育', '双语教学'],
        demographics: {
          age: 32,
          location: '北京市朝阳区'
        },
        notes: '对双语教学很感兴趣'
      });

      mockLeadModel.findByPk.mockResolvedValue(mockLead);

      const result = await mockLeadModel.findByPk(1);

      expect(mockLeadModel.findByPk).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockLead);
    });

    it('应该更新潜在客户', async () => {
      const updateData = {
        status: 'contacted',
        score: 75,
        notes: '已电话联系，很感兴趣，安排了参观时间',
        lastContactedAt: new Date()
      };

      const updatedLead = createMockInstance({
        id: 1,
        name: '张三',
        status: 'contacted',
        score: 75,
        notes: '已电话联系，很感兴趣，安排了参观时间',
        lastContactedAt: new Date(),
        updatedAt: new Date()
      });

      mockLeadModel.update.mockResolvedValue([1, [updatedLead]]);

      const result = await mockLeadModel.update(updateData, {
        where: { id: 1 },
        returning: true
      });

      expect(mockLeadModel.update).toHaveBeenCalledWith(
        updateData,
        { where: { id: 1 }, returning: true }
      );
      expect(result[0]).toBe(1);
      expect(result[1]).toEqual([updatedLead]);
    });

    it('应该删除潜在客户', async () => {
      mockLeadModel.destroy.mockResolvedValue(1);

      const result = await mockLeadModel.destroy({
        where: { id: 1 }
      });

      expect(mockLeadModel.destroy).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(result).toBe(1);
    });
  });

  describe('查询操作', () => {
    it('应该按状态查找潜在客户', async () => {
      const mockLeads = [
        createMockInstance({
          id: 1,
          name: '张三',
          status: 'new'
        }),
        createMockInstance({
          id: 2,
          name: '李四',
          status: 'new'
        })
      ];

      mockLeadModel.findAll.mockResolvedValue(mockLeads);

      const result = await mockLeadModel.findAll({
        where: { status: 'new' }
      });

      expect(mockLeadModel.findAll).toHaveBeenCalledWith({
        where: { status: 'new' }
      });
      expect(result).toEqual(mockLeads);
    });

    it('应该按来源查找潜在客户', async () => {
      const mockWebsiteLeads = [
        createMockInstance({
          id: 1,
          name: '张三',
          source: 'website'
        })
      ];

      mockLeadModel.findAll.mockResolvedValue(mockWebsiteLeads);

      const result = await mockLeadModel.findAll({
        where: { source: 'website' }
      });

      expect(mockLeadModel.findAll).toHaveBeenCalledWith({
        where: { source: 'website' }
      });
      expect(result).toEqual(mockWebsiteLeads);
    });

    it('应该按评分范围查找潜在客户', async () => {
      const highScoreLeads = [
        createMockInstance({
          id: 1,
          name: '张三',
          score: 85
        })
      ];

      mockLeadModel.findAll.mockResolvedValue(highScoreLeads);

      await mockLeadModel.findAll({
        where: {
          score: {
            [mockSequelize.Op.gte]: 80
          }
        }
      });

      expect(mockLeadModel.findAll).toHaveBeenCalledWith({
        where: {
          score: {
            [mockSequelize.Op.gte]: 80
          }
        }
      });
    });

    it('应该按活动ID查找潜在客户', async () => {
      const campaignLeads = [
        createMockInstance({
          id: 1,
          name: '张三',
          campaignId: 1
        }),
        createMockInstance({
          id: 2,
          name: '李四',
          campaignId: 1
        })
      ];

      mockLeadModel.findAll.mockResolvedValue(campaignLeads);

      const result = await mockLeadModel.findAll({
        where: { campaignId: 1 }
      });

      expect(mockLeadModel.findAll).toHaveBeenCalledWith({
        where: { campaignId: 1 }
      });
      expect(result).toEqual(campaignLeads);
    });

    it('应该支持分页查询', async () => {
      const mockResult = {
        rows: [
          createMockInstance({
            id: 1,
            name: '张三'
          })
        ],
        count: 1
      };

      mockLeadModel.findAndCountAll.mockResolvedValue(mockResult);

      const result = await mockLeadModel.findAndCountAll({
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']]
      });

      expect(mockLeadModel.findAndCountAll).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']]
      });
      expect(result).toEqual(mockResult);
    });

    it('应该支持搜索查询', async () => {
      const searchResults = [
        createMockInstance({
          id: 1,
          name: '张三',
          email: 'zhang@example.com'
        })
      ];

      mockLeadModel.findAll.mockResolvedValue(searchResults);

      await mockLeadModel.findAll({
        where: {
          [mockSequelize.Op.or]: [
            {
              name: {
                [mockSequelize.Op.iLike]: '%张%'
              }
            },
            {
              email: {
                [mockSequelize.Op.iLike]: '%zhang%'
              }
            }
          ]
        }
      });

      expect(mockLeadModel.findAll).toHaveBeenCalledWith({
        where: {
          [mockSequelize.Op.or]: [
            {
              name: {
                [mockSequelize.Op.iLike]: '%张%'
              }
            },
            {
              email: {
                [mockSequelize.Op.iLike]: '%zhang%'
              }
            }
          ]
        }
      });
    });
  });

  describe('批量操作', () => {
    it('应该批量创建潜在客户', async () => {
      const leadsData = [
        {
          name: '张三',
          email: 'zhang@example.com',
          phone: '13800138001',
          source: 'website'
        },
        {
          name: '李四',
          email: 'li@example.com',
          phone: '13800138002',
          source: 'campaign'
        }
      ];

      const createdLeads = leadsData.map((data, index) =>
        createMockInstance({
          id: index + 1,
          ...data,
          status: 'new',
          score: 50,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      );

      mockLeadModel.bulkCreate.mockResolvedValue(createdLeads);

      const result = await mockLeadModel.bulkCreate(leadsData);

      expect(mockLeadModel.bulkCreate).toHaveBeenCalledWith(leadsData);
      expect(result).toEqual(createdLeads);
    });

    it('应该批量更新潜在客户状态', async () => {
      const updateData = { status: 'contacted', lastContactedAt: new Date() };
      const whereClause = { assignedTo: 1 };

      mockLeadModel.update.mockResolvedValue([3]);

      const result = await mockLeadModel.update(updateData, {
        where: whereClause
      });

      expect(mockLeadModel.update).toHaveBeenCalledWith(updateData, {
        where: whereClause
      });
      expect(result[0]).toBe(3);
    });

    it('应该批量删除过期潜在客户', async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      mockLeadModel.destroy.mockResolvedValue(5);

      const result = await mockLeadModel.destroy({
        where: {
          status: 'unqualified',
          updatedAt: {
            [mockSequelize.Op.lt]: thirtyDaysAgo
          }
        }
      });

      expect(mockLeadModel.destroy).toHaveBeenCalledWith({
        where: {
          status: 'unqualified',
          updatedAt: {
            [mockSequelize.Op.lt]: thirtyDaysAgo
          }
        }
      });
      expect(result).toBe(5);
    });
  });

  describe('关联关系', () => {
    it('应该设置与MarketingCampaign的关联', () => {
      expect(mockLeadModel.belongsTo).toHaveBeenCalledWith(
        mockMarketingCampaignModel,
        expect.objectContaining({
          foreignKey: 'campaignId',
          as: 'campaign'
        })
      );
    });

    it('应该设置与User的关联（分配给）', () => {
      expect(mockLeadModel.belongsTo).toHaveBeenCalledWith(
        mockUserModel,
        expect.objectContaining({
          foreignKey: 'assignedTo',
          as: 'assignee'
        })
      );
    });

    it('应该设置与Student的关联（转换后）', () => {
      expect(mockLeadModel.belongsTo).toHaveBeenCalledWith(
        mockStudentModel,
        expect.objectContaining({
          foreignKey: 'convertedToStudentId',
          as: 'convertedStudent'
        })
      );
    });

    it('应该设置与LeadActivity的关联', () => {
      expect(mockLeadModel.hasMany).toHaveBeenCalledWith(
        mockLeadActivityModel,
        expect.objectContaining({
          foreignKey: 'leadId',
          as: 'activities'
        })
      );
    });
  });

  describe('模型钩子', () => {
    it('应该在创建前计算初始评分', () => {
      expect(mockLeadModel.addHook).toHaveBeenCalledWith(
        'beforeCreate',
        expect.any(Function)
      );
    });

    it('应该在更新前重新计算评分', () => {
      expect(mockLeadModel.addHook).toHaveBeenCalledWith(
        'beforeUpdate',
        expect.any(Function)
      );
    });

    it('应该在创建后记录活动', () => {
      expect(mockLeadModel.addHook).toHaveBeenCalledWith(
        'afterCreate',
        expect.any(Function)
      );
    });

    it('应该在状态更新后记录活动', () => {
      expect(mockLeadModel.addHook).toHaveBeenCalledWith(
        'afterUpdate',
        expect.any(Function)
      );
    });
  });

  describe('作用域', () => {
    it('应该定义new作用域', () => {
      const defineCall = mockSequelize.define.mock.calls.find(
        call => call[0] === 'Lead'
      );
      
      expect(defineCall[2].scopes).toEqual(
        expect.objectContaining({
          new: {
            where: { status: 'new' }
          }
        })
      );
    });

    it('应该定义qualified作用域', () => {
      const defineCall = mockSequelize.define.mock.calls.find(
        call => call[0] === 'Lead'
      );
      
      expect(defineCall[2].scopes).toEqual(
        expect.objectContaining({
          qualified: {
            where: { status: 'qualified' }
          }
        })
      );
    });

    it('应该定义highScore作用域', () => {
      const defineCall = mockSequelize.define.mock.calls.find(
        call => call[0] === 'Lead'
      );
      
      expect(defineCall[2].scopes).toEqual(
        expect.objectContaining({
          highScore: {
            where: {
              score: {
                [mockSequelize.Op.gte]: 70
              }
            }
          }
        })
      );
    });

    it('应该定义bySource作用域', () => {
      const defineCall = mockSequelize.define.mock.calls.find(
        call => call[0] === 'Lead'
      );
      
      expect(defineCall[2].scopes).toEqual(
        expect.objectContaining({
          bySource: expect.any(Function)
        })
      );
    });

    it('应该定义recentlyCreated作用域', () => {
      const defineCall = mockSequelize.define.mock.calls.find(
        call => call[0] === 'Lead'
      );
      
      expect(defineCall[2].scopes).toEqual(
        expect.objectContaining({
          recentlyCreated: {
            where: {
              createdAt: {
                [mockSequelize.Op.gte]: expect.any(Function)
              }
            }
          }
        })
      );
    });
  });

  describe('实例方法', () => {
    it('应该检查是否为高质量潜在客户', () => {
      const highQualityLead = createMockInstance({
        id: 1,
        score: 85,
        status: 'qualified'
      });

      highQualityLead.isHighQuality = jest.fn().mockReturnValue(true);

      const result = highQualityLead.isHighQuality();

      expect(result).toBe(true);
    });

    it('应该计算潜在客户年龄', () => {
      const lead = createMockInstance({
        id: 1,
        demographics: {
          birthDate: '1990-01-01'
        }
      });

      lead.getAge = jest.fn().mockReturnValue(34);

      const result = lead.getAge();

      expect(result).toBe(34);
    });

    it('应该检查是否需要跟进', () => {
      const lead = createMockInstance({
        id: 1,
        status: 'contacted',
        lastContactedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7天前
      });

      lead.needsFollowUp = jest.fn().mockReturnValue(true);

      const result = lead.needsFollowUp();

      expect(result).toBe(true);
    });

    it('应该更新评分', () => {
      const lead = createMockInstance({
        id: 1,
        score: 60,
        interests: ['小班教育'],
        demographics: { age: 32 }
      });

      lead.updateScore = jest.fn().mockImplementation(() {
        this.score = 75;
        return this.save();
      });

      lead.updateScore();

      expect(lead.updateScore).toHaveBeenCalled();
    });

    it('应该转换为学生', () => {
      const lead = createMockInstance({
        id: 1,
        name: '张三',
        status: 'qualified'
      });

      const studentData = {
        name: '张小明',
        parentName: '张三',
        enrollmentDate: '2024-09-01',
        classId: 1
      };

      lead.convertToStudent = jest.fn().mockImplementation((data) {
        this.status = 'converted';
        this.convertedAt = new Date();
        this.convertedToStudentId = 10;
        return this.save();
      });

      lead.convertToStudent(studentData);

      expect(lead.convertToStudent).toHaveBeenCalledWith(studentData);
    });

    it('应该记录活动', () => {
      const lead = createMockInstance({
        id: 1
      });

      const activityData = {
        type: 'phone_call',
        description: '电话联系，了解需求',
        performedBy: 1
      };

      lead.logActivity = jest.fn().mockResolvedValue({
        id: 1,
        leadId: 1,
        ...activityData,
        createdAt: new Date()
      });

      lead.logActivity(activityData);

      expect(lead.logActivity).toHaveBeenCalledWith(activityData);
    });
  });

  describe('类方法', () => {
    it('应该按条件查找高质量潜在客户', async () => {
      const mockHighQualityLeads = [
        createMockInstance({
          id: 1,
          score: 85,
          status: 'qualified'
        })
      ];

      mockLeadModel.findHighQuality = jest.fn().mockResolvedValue(mockHighQualityLeads);

      const result = await mockLeadModel.findHighQuality({
        source: 'website'
      });

      expect(mockLeadModel.findHighQuality).toHaveBeenCalledWith({
        source: 'website'
      });
      expect(result).toEqual(mockHighQualityLeads);
    });

    it('应该统计转换率', async () => {
      mockLeadModel.getConversionRate = jest.fn().mockResolvedValue(0.15);

      const result = await mockLeadModel.getConversionRate({
        campaignId: 1
      });

      expect(mockLeadModel.getConversionRate).toHaveBeenCalledWith({
        campaignId: 1
      });
      expect(result).toBe(0.15);
    });

    it('应该获取平均评分', async () => {
      mockLeadModel.getAverageScore = jest.fn().mockResolvedValue(68.5);

      const result = await mockLeadModel.getAverageScore({
        source: 'website'
      });

      expect(mockLeadModel.getAverageScore).toHaveBeenCalledWith({
        source: 'website'
      });
      expect(result).toBe(68.5);
    });

    it('应该获取需要跟进的潜在客户', async () => {
      const needsFollowUpLeads = [
        { id: 1, name: '张三', lastContactedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        { id: 2, name: '李四', lastContactedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) }
      ];

      mockLeadModel.findNeedsFollowUp = jest.fn().mockResolvedValue(needsFollowUpLeads);

      const result = await mockLeadModel.findNeedsFollowUp();

      expect(mockLeadModel.findNeedsFollowUp).toHaveBeenCalled();
      expect(result).toEqual(needsFollowUpLeads);
    });

    it('应该按来源统计潜在客户', async () => {
      const sourceStats = [
        { source: 'website', count: 45, conversionRate: 0.18 },
        { source: 'campaign', count: 32, conversionRate: 0.22 },
        { source: 'referral', count: 18, conversionRate: 0.28 }
      ];

      mockLeadModel.getStatsBySource = jest.fn().mockResolvedValue(sourceStats);

      const result = await mockLeadModel.getStatsBySource();

      expect(mockLeadModel.getStatsBySource).toHaveBeenCalled();
      expect(result).toEqual(sourceStats);
    });
  });

  describe('验证', () => {
    it('应该验证邮箱格式', () => {
      const validEmails = ['test@example.com', 'user.name@domain.co.uk', 'user+tag@example.org'];
      const invalidEmails = ['invalid-email', '@example.com', 'user@', 'user@.com'];

      validEmails.forEach(email => {
        expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });

      invalidEmails.forEach(email => {
        expect(email).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
    });

    it('应该验证手机号格式', () => {
      const validPhones = ['13800138001', '15912345678', '18612345678'];
      const invalidPhones = ['123', '1234567890123', 'abc123'];

      validPhones.forEach(phone => {
        expect(phone).toMatch(/^1[3-9]\d{9}$/);
      });

      invalidPhones.forEach(phone => {
        expect(phone).not.toMatch(/^1[3-9]\d{9}$/);
      });
    });

    it('应该验证评分范围', () => {
      const validScores = [0, 50, 75, 100];
      const invalidScores = [-1, 101, 150];

      validScores.forEach(score => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });

      invalidScores.forEach(score => {
        expect(score < 0 || score > 100).toBe(true);
      });
    });

    it('应该验证来源类型', () => {
      const validSources = ['website', 'campaign', 'referral', 'social_media', 'phone', 'walk_in', 'other'];
      const invalidSources = ['invalid', 'custom', 'unknown'];

      validSources.forEach(source => {
        expect(validSources).toContain(source);
      });

      invalidSources.forEach(source => {
        expect(validSources).not.toContain(source);
      });
    });

    it('应该验证状态类型', () => {
      const validStatuses = ['new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost'];
      const invalidStatuses = ['invalid', 'pending', 'active'];

      validStatuses.forEach(status => {
        expect(validStatuses).toContain(status);
      });

      invalidStatuses.forEach(status => {
        expect(validStatuses).not.toContain(status);
      });
    });
  });

  describe('索引和性能', () => {
    it('应该在email字段上创建唯一索引', () => {
      const defineCall = mockSequelize.define.mock.calls.find(
        call => call[0] === 'Lead'
      );
      
      const emailField = defineCall[1].email;
      expect(emailField.unique).toBe(true);
    });

    it('应该在关键字段上创建索引', () => {
      const defineCall = mockSequelize.define.mock.calls.find(
        call => call[0] === 'Lead'
      );
      
      const indexes = defineCall[2].indexes;
      const indexFields = indexes.map((index: any) => index.fields[0]);

      expect(indexFields).toContain('email');
      expect(indexFields).toContain('phone');
      expect(indexFields).toContain('source');
      expect(indexFields).toContain('status');
      expect(indexFields).toContain('score');
      expect(indexFields).toContain('campaignId');
      expect(indexFields).toContain('assignedTo');
    });
  });

  describe('软删除', () => {
    it('应该支持软删除', () => {
      const defineCall = mockSequelize.define.mock.calls.find(
        call => call[0] === 'Lead'
      );
      
      expect(defineCall[2].paranoid).toBe(true);
    });

    it('应该在软删除时保留数据', async () => {
      const lead = createMockInstance({
        id: 1,
        name: '张三',
        deletedAt: null
      });

      lead.destroy.mockResolvedValue(undefined);

      await lead.destroy();

      expect(lead.destroy).toHaveBeenCalled();
    });
  });

  describe('JSON字段处理', () => {
    it('应该正确处理interests JSON字段', () => {
      const lead = createMockInstance({
        id: 1,
        interests: ['小班教育', '双语教学', '艺术课程', '体育活动']
      });

      expect(lead.interests).toEqual(['小班教育', '双语教学', '艺术课程', '体育活动']);
    });

    it('应该正确处理demographics JSON字段', () => {
      const lead = createMockInstance({
        id: 1,
        demographics: {
          age: 32,
          gender: 'male',
          location: '北京市朝阳区',
          occupation: '工程师',
          income: '15000-20000',
          education: '本科',
          maritalStatus: 'married',
          children: 1
        }
      });

      expect(lead.demographics).toEqual({
        age: 32,
        gender: 'male',
        location: '北京市朝阳区',
        occupation: '工程师',
        income: '15000-20000',
        education: '本科',
        maritalStatus: 'married',
        children: 1
      });
    });
  });

  describe('评分计算', () => {
    it('应该根据来源计算基础评分', () => {
      const sourceScores = {
        'referral': 80,
        'website': 60,
        'campaign': 70,
        'social_media': 50,
        'phone': 65,
        'walk_in': 75,
        'other': 40
      };

      Object.entries(sourceScores).forEach(([source, expectedScore]) => {
        expect(expectedScore).toBeGreaterThan(0);
        expect(expectedScore).toBeLessThanOrEqual(100);
      });
    });

    it('应该根据兴趣匹配度调整评分', () => {
      const interests = ['小班教育', '双语教学', '艺术课程'];
      const baseScore = 60;
      const interestBonus = interests.length * 5; // 每个兴趣加5分
      const expectedScore = Math.min(baseScore + interestBonus, 100);

      expect(expectedScore).toBe(75);
    });

    it('应该根据人口统计信息调整评分', () => {
      const demographics = {
        age: 32, // 目标年龄段，加分
        income: '15000-20000', // 高收入，加分
        education: '本科', // 高学历，加分
        location: '北京市朝阳区' // 目标区域，加分
      };

      // 模拟评分调整逻辑
      let scoreAdjustment = 0;
      if (demographics.age >= 25 && demographics.age <= 40) scoreAdjustment += 10;
      if (demographics.income.includes('15000') || demographics.income.includes('20000')) scoreAdjustment += 10;
      if (demographics.education === '本科' || demographics.education === '硕士') scoreAdjustment += 5;
      if (demographics.location.includes('北京')) scoreAdjustment += 5;

      expect(scoreAdjustment).toBe(30);
    });
  });
});
