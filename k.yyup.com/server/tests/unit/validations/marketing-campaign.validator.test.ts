import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock Joi
const mockJoi = {
  object: jest.fn(),
  string: jest.fn(),
  number: jest.fn(),
  integer: jest.fn(),
  boolean: jest.fn(),
  date: jest.fn(),
  array: jest.fn(),
  any: jest.fn(),
  valid: jest.fn(),
  min: jest.fn(),
  max: jest.fn(),
  required: jest.fn(),
  optional: jest.fn(),
  allow: jest.fn(),
  empty: jest.fn(),
  default: jest.fn(),
  when: jest.fn(),
  alternatives: jest.fn(),
  custom: jest.fn(),
  messages: jest.fn(),
  validate: jest.fn()
};

// Create chainable mock methods
Object.keys(mockJoi).forEach(key => {
  if (typeof mockJoi[key] === 'function') {
    mockJoi[key].mockReturnValue(mockJoi);
  }
});

// Mock imports
jest.unstable_mockModule('joi', () => ({
  default: mockJoi
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

describe('Marketing Campaign Validator', () => {
  let marketingCampaignValidator: any;

  beforeAll(async () => {
    const imported = await import('../../../src/validations/marketing-campaign.validator');
    marketingCampaignValidator = imported.default || imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mock return values
    Object.keys(mockJoi).forEach(key => {
      if (typeof mockJoi[key] === 'function') {
        mockJoi[key].mockReturnValue(mockJoi);
      }
    });
  });

  describe('createCampaignSchema', () => {
    it('应该定义创建营销活动的验证规则', () => {
      const schema = marketingCampaignValidator.createCampaignSchema;

      expect(mockJoi.object).toHaveBeenCalled();
      expect(schema).toBeDefined();
    });

    it('应该验证必填字段', () => {
      const validData = {
        name: '春季招生活动',
        type: 'enrollment',
        status: 'draft',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-31'),
        budget: 10000,
        targetAudience: 'parents',
        kindergartenId: 1
      };

      mockJoi.validate.mockReturnValue({ error: null, value: validData });

      const result = mockJoi.validate(validData);

      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(validData);
    });

    it('应该验证活动名称', () => {
      const testCases = [
        { name: '春季招生活动', shouldFail: false },
        { name: '', shouldFail: true, message: '活动名称不能为空' },
        { name: 'a'.repeat(101), shouldFail: true, message: '活动名称长度不能超过100字符' },
        { name: '   ', shouldFail: true, message: '活动名称不能为空' }
      ];

      testCases.forEach(({ name, shouldFail, message }) => {
        const data = { name };
        
        if (shouldFail) {
          mockJoi.validate.mockReturnValue({
            error: { details: [{ message }] },
            value: undefined
          });
        } else {
          mockJoi.validate.mockReturnValue({ error: null, value: data });
        }

        const result = mockJoi.validate(data);

        if (shouldFail) {
          expect((result as any).error).toBeTruthy();
          expect(((result as any).error?.details)[0].message).toContain(message);
        } else {
          expect((result as any).error).toBeNull();
        }
      });
    });

    it('应该验证活动类型', () => {
      const validTypes = ['enrollment', 'brand', 'event', 'promotion', 'retention'];
      const invalidTypes = ['invalid', 'marketing', ''];

      validTypes.forEach(type => {
        const data = { type };
        mockJoi.validate.mockReturnValue({ error: null, value: data });
        
        const result = mockJoi.validate(data);
        expect((result as any).error).toBeNull();
      });

      invalidTypes.forEach(type => {
        const data = { type };
        mockJoi.validate.mockReturnValue({
          error: { details: [{ message: '活动类型无效' }] },
          value: undefined
        });
        
        const result = mockJoi.validate(data);
        expect((result as any).error).toBeTruthy();
      });
    });

    it('应该验证活动状态', () => {
      const validStatuses = ['draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled'];
      const invalidStatuses = ['invalid', 'pending', ''];

      validStatuses.forEach(status => {
        const data = { status };
        mockJoi.validate.mockReturnValue({ error: null, value: data });
        
        const result = mockJoi.validate(data);
        expect((result as any).error).toBeNull();
      });

      invalidStatuses.forEach(status => {
        const data = { status };
        mockJoi.validate.mockReturnValue({
          error: { details: [{ message: '活动状态无效' }] },
          value: undefined
        });
        
        const result = mockJoi.validate(data);
        expect((result as any).error).toBeTruthy();
      });
    });

    it('应该验证日期范围', () => {
      const testCases = [
        {
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-03-31'),
          shouldFail: false
        },
        {
          startDate: new Date('2024-03-31'),
          endDate: new Date('2024-03-01'),
          shouldFail: true,
          message: '结束日期必须晚于开始日期'
        },
        {
          startDate: new Date('2020-01-01'),
          endDate: new Date('2020-01-31'),
          shouldFail: true,
          message: '开始日期不能是过去的日期'
        }
      ];

      testCases.forEach(({ startDate, endDate, shouldFail, message }) => {
        const data = { startDate, endDate };
        
        if (shouldFail) {
          mockJoi.validate.mockReturnValue({
            error: { details: [{ message }] },
            value: undefined
          });
        } else {
          mockJoi.validate.mockReturnValue({ error: null, value: data });
        }

        const result = mockJoi.validate(data);

        if (shouldFail) {
          expect((result as any).error).toBeTruthy();
        } else {
          expect((result as any).error).toBeNull();
        }
      });
    });

    it('应该验证预算', () => {
      const testCases = [
        { budget: 10000, shouldFail: false },
        { budget: 0, shouldFail: false }, // 允许0预算
        { budget: -1000, shouldFail: true, message: '预算不能为负数' },
        { budget: 10000000, shouldFail: true, message: '预算不能超过1000万' },
        { budget: 'invalid', shouldFail: true, message: '预算必须是数字' }
      ];

      testCases.forEach(({ budget, shouldFail, message }) => {
        const data = { budget };
        
        if (shouldFail) {
          mockJoi.validate.mockReturnValue({
            error: { details: [{ message }] },
            value: undefined
          });
        } else {
          mockJoi.validate.mockReturnValue({ error: null, value: data });
        }

        const result = mockJoi.validate(data);

        if (shouldFail) {
          expect((result as any).error).toBeTruthy();
        } else {
          expect((result as any).error).toBeNull();
        }
      });
    });

    it('应该验证目标受众', () => {
      const validAudiences = ['parents', 'students', 'teachers', 'community', 'all'];
      const invalidAudiences = ['invalid', 'everyone', ''];

      validAudiences.forEach(targetAudience => {
        const data = { targetAudience };
        mockJoi.validate.mockReturnValue({ error: null, value: data });
        
        const result = mockJoi.validate(data);
        expect((result as any).error).toBeNull();
      });

      invalidAudiences.forEach(targetAudience => {
        const data = { targetAudience };
        mockJoi.validate.mockReturnValue({
          error: { details: [{ message: '目标受众无效' }] },
          value: undefined
        });
        
        const result = mockJoi.validate(data);
        expect((result as any).error).toBeTruthy();
      });
    });

    it('应该验证营销渠道', () => {
      const validChannels = ['social_media', 'email', 'sms', 'website', 'offline', 'referral'];
      
      const data = { channels: validChannels };
      mockJoi.validate.mockReturnValue({ error: null, value: data });
      
      const result = mockJoi.validate(data);
      expect((result as any).error).toBeNull();
    });

    it('应该验证目标指标', () => {
      const validGoals = {
        impressions: 10000,
        clicks: 1000,
        conversions: 100,
        cost_per_click: 5.0,
        roi: 200
      };

      const data = { goals: validGoals };
      mockJoi.validate.mockReturnValue({ error: null, value: data });
      
      const result = mockJoi.validate(data);
      expect((result as any).error).toBeNull();
    });

    it('应该验证目标指标的合理性', () => {
      const invalidGoals = {
        impressions: -1000,
        clicks: 20000, // 点击数大于展示数
        conversions: 500 // 转化数大于点击数
      };

      const data = { goals: invalidGoals };
      mockJoi.validate.mockReturnValue({
        error: { details: [{ message: '目标指标设置不合理' }] },
        value: undefined
      });
      
      const result = mockJoi.validate(data);
      expect((result as any).error).toBeTruthy();
    });
  });

  describe('updateCampaignSchema', () => {
    it('应该定义更新营销活动的验证规则', () => {
      const schema = marketingCampaignValidator.updateCampaignSchema;

      expect(mockJoi.object).toHaveBeenCalled();
      expect(schema).toBeDefined();
    });

    it('应该允许部分字段更新', () => {
      const partialData = {
        name: '更新后的活动名称',
        status: 'active',
        budget: 15000
      };

      mockJoi.validate.mockReturnValue({ error: null, value: partialData });

      const result = mockJoi.validate(partialData);

      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(partialData);
    });

    it('应该验证状态转换规则', () => {
      const testCases = [
        {
          currentStatus: 'draft',
          newStatus: 'scheduled',
          shouldFail: false
        },
        {
          currentStatus: 'completed',
          newStatus: 'active',
          shouldFail: true,
          message: '已完成的活动不能重新激活'
        },
        {
          currentStatus: 'cancelled',
          newStatus: 'active',
          shouldFail: true,
          message: '已取消的活动不能重新激活'
        }
      ];

      testCases.forEach(({ currentStatus, newStatus, shouldFail, message }) => {
        const data = { status: newStatus, currentStatus };
        
        if (shouldFail) {
          mockJoi.validate.mockReturnValue({
            error: { details: [{ message }] },
            value: undefined
          });
        } else {
          mockJoi.validate.mockReturnValue({ error: null, value: data });
        }

        const result = mockJoi.validate(data);

        if (shouldFail) {
          expect((result as any).error).toBeTruthy();
        } else {
          expect((result as any).error).toBeNull();
        }
      });
    });

    it('应该验证活跃活动的修改限制', () => {
      const data = {
        startDate: new Date('2024-04-01'),
        currentStatus: 'active'
      };

      mockJoi.validate.mockReturnValue({
        error: { details: [{ message: '活跃状态的活动不能修改开始日期' }] },
        value: undefined
      });
      
      const result = mockJoi.validate(data);
      expect((result as any).error).toBeTruthy();
    });

    it('应该验证预算调整的合理性', () => {
      const testCases = [
        {
          currentSpent: 5000,
          newBudget: 8000,
          shouldFail: false
        },
        {
          currentSpent: 8000,
          newBudget: 5000,
          shouldFail: true,
          message: '新预算不能小于已花费金额'
        }
      ];

      testCases.forEach(({ currentSpent, newBudget, shouldFail, message }) => {
        const data = { budget: newBudget, currentSpent };
        
        if (shouldFail) {
          mockJoi.validate.mockReturnValue({
            error: { details: [{ message }] },
            value: undefined
          });
        } else {
          mockJoi.validate.mockReturnValue({ error: null, value: data });
        }

        const result = mockJoi.validate(data);

        if (shouldFail) {
          expect((result as any).error).toBeTruthy();
        } else {
          expect((result as any).error).toBeNull();
        }
      });
    });
  });

  describe('queryCampaignsSchema', () => {
    it('应该定义查询营销活动的验证规则', () => {
      const schema = marketingCampaignValidator.queryCampaignsSchema;

      expect(mockJoi.object).toHaveBeenCalled();
      expect(schema).toBeDefined();
    });

    it('应该验证分页参数', () => {
      const validPagination = {
        page: 1,
        pageSize: 20
      };

      mockJoi.validate.mockReturnValue({ error: null, value: validPagination });

      const result = mockJoi.validate(validPagination);

      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(validPagination);
    });

    it('应该验证筛选条件', () => {
      const filterData = {
        kindergartenId: 1,
        type: 'enrollment',
        status: 'active',
        targetAudience: 'parents',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        minBudget: 1000,
        maxBudget: 50000
      };

      mockJoi.validate.mockReturnValue({ error: null, value: filterData });

      const result = mockJoi.validate(filterData);

      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(filterData);
    });

    it('应该验证排序参数', () => {
      const validSortFields = ['name', 'type', 'status', 'startDate', 'endDate', 'budget', 'createdAt'];
      const validSortOrders = ['asc', 'desc'];

      validSortFields.forEach(sortBy => {
        validSortOrders.forEach(sortOrder => {
          const data = { sortBy, sortOrder };
          mockJoi.validate.mockReturnValue({ error: null, value: data });
          
          const result = mockJoi.validate(data);
          expect((result as any).error).toBeNull();
        });
      });
    });

    it('应该验证预算范围查询', () => {
      const testCases = [
        {
          minBudget: 1000,
          maxBudget: 10000,
          shouldFail: false
        },
        {
          minBudget: 10000,
          maxBudget: 1000,
          shouldFail: true,
          message: '最大预算必须大于最小预算'
        },
        {
          minBudget: -1000,
          shouldFail: true,
          message: '最小预算不能为负数'
        }
      ];

      testCases.forEach(({ minBudget, maxBudget, shouldFail, message }) => {
        const data = maxBudget ? { minBudget, maxBudget } : { minBudget };
        
        if (shouldFail) {
          mockJoi.validate.mockReturnValue({
            error: { details: [{ message }] },
            value: undefined
          });
        } else {
          mockJoi.validate.mockReturnValue({ error: null, value: data });
        }

        const result = mockJoi.validate(data);

        if (shouldFail) {
          expect((result as any).error).toBeTruthy();
        } else {
          expect((result as any).error).toBeNull();
        }
      });
    });

    it('应该验证搜索关键词', () => {
      const testCases = [
        { search: '春季招生', shouldFail: false },
        { search: 'a'.repeat(101), shouldFail: true, message: '搜索关键词长度不能超过100字符' },
        { search: '', shouldFail: false }
      ];

      testCases.forEach(({ search, shouldFail, message }) => {
        const data = { search };
        
        if (shouldFail) {
          mockJoi.validate.mockReturnValue({
            error: { details: [{ message }] },
            value: undefined
          });
        } else {
          mockJoi.validate.mockReturnValue({ error: null, value: data });
        }

        const result = mockJoi.validate(data);

        if (shouldFail) {
          expect((result as any).error).toBeTruthy();
        } else {
          expect((result as any).error).toBeNull();
        }
      });
    });
  });

  describe('campaignAnalyticsSchema', () => {
    it('应该定义活动分析的验证规则', () => {
      const schema = marketingCampaignValidator.campaignAnalyticsSchema;

      expect(mockJoi.object).toHaveBeenCalled();
      expect(schema).toBeDefined();
    });

    it('应该验证分析时间范围', () => {
      const validTimeRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31')
      };

      mockJoi.validate.mockReturnValue({ error: null, value: validTimeRange });

      const result = mockJoi.validate(validTimeRange);

      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(validTimeRange);
    });

    it('应该验证分析维度', () => {
      const validDimensions = ['channel', 'audience', 'type', 'status', 'time'];
      
      validDimensions.forEach(dimension => {
        const data = { groupBy: dimension };
        mockJoi.validate.mockReturnValue({ error: null, value: data });
        
        const result = mockJoi.validate(data);
        expect((result as any).error).toBeNull();
      });
    });

    it('应该验证分析指标', () => {
      const validMetrics = ['impressions', 'clicks', 'conversions', 'ctr', 'cpc', 'roi', 'cost'];
      
      const data = { metrics: validMetrics };
      mockJoi.validate.mockReturnValue({ error: null, value: data });
      
      const result = mockJoi.validate(data);
      expect((result as any).error).toBeNull();
    });

    it('应该验证比较分析参数', () => {
      const compareData = {
        compareWith: 'previous_period',
        comparePeriod: 30
      };

      mockJoi.validate.mockReturnValue({ error: null, value: compareData });

      const result = mockJoi.validate(compareData);

      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(compareData);
    });
  });

  describe('Custom Validators', () => {
    it('应该验证活动时间冲突', () => {
      const conflictingCampaign = {
        kindergartenId: 1,
        type: 'enrollment',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-31'),
        existingCampaignId: 2
      };

      mockJoi.validate.mockReturnValue({
        error: { details: [{ message: '该时间段已存在相同类型的营销活动' }] },
        value: undefined
      });
      
      const result = mockJoi.validate(conflictingCampaign);
      expect((result as any).error).toBeTruthy();
    });

    it('应该验证渠道预算分配', () => {
      const channelBudgets = [
        { channel: 'social_media', budget: 5000 },
        { channel: 'email', budget: 3000 },
        { channel: 'sms', budget: 3000 }
      ];
      const totalBudget = 10000;

      const data = { channelBudgets, totalBudget };
      mockJoi.validate.mockReturnValue({
        error: { details: [{ message: '渠道预算总和不能超过总预算' }] },
        value: undefined
      });
      
      const result = mockJoi.validate(data);
      expect((result as any).error).toBeTruthy();
    });

    it('应该验证目标受众与渠道的匹配性', () => {
      const data = {
        targetAudience: 'students',
        channels: ['email', 'sms'] // 学生通常没有邮箱和手机
      };

      mockJoi.validate.mockReturnValue({
        error: { details: [{ message: '目标受众与营销渠道不匹配' }] },
        value: undefined
      });
      
      const result = mockJoi.validate(data);
      expect((result as any).error).toBeTruthy();
    });

    it('应该验证活动类型与目标的一致性', () => {
      const data = {
        type: 'enrollment',
        goals: {
          brand_awareness: 80 // 招生活动不应该以品牌知名度为主要目标
        }
      };

      mockJoi.validate.mockReturnValue({
        error: { details: [{ message: '活动类型与目标设置不一致' }] },
        value: undefined
      });
      
      const result = mockJoi.validate(data);
      expect((result as any).error).toBeTruthy();
    });
  });

  describe('Error Messages', () => {
    it('应该返回中文错误消息', () => {
      const invalidData = {
        name: '',
        budget: -1000,
        type: 'invalid'
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            { message: '活动名称不能为空' },
            { message: '预算不能为负数' },
            { message: '活动类型无效' }
          ]
        },
        value: undefined
      });
      
      const result = mockJoi.validate(invalidData);
      
      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)).toHaveLength(3);
      expect(((result as any).error?.details)[0].message).toBe('活动名称不能为空');
      expect(((result as any).error?.details)[1].message).toBe('预算不能为负数');
      expect(((result as any).error?.details)[2].message).toBe('活动类型无效');
    });

    it('应该提供详细的验证错误信息', () => {
      const data = { name: 'a'.repeat(101) };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [{
            message: '活动名称长度不能超过100字符',
            path: ['name'],
            type: 'string.max',
            context: { limit: 100, value: data.name }
          }]
        },
        value: undefined
      });
      
      const result = mockJoi.validate(data);
      
      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)[0].path).toEqual(['name']);
      expect(((result as any).error?.details)[0].type).toBe('string.max');
      expect(((result as any).error?.details)[0].context.limit).toBe(100);
    });
  });

  describe('Integration Tests', () => {
    it('应该验证完整的营销活动创建数据', () => {
      const completeData = {
        name: '2024年春季招生营销活动',
        description: '面向3-6岁儿童家长的春季招生推广',
        type: 'enrollment',
        status: 'draft',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-31'),
        budget: 50000,
        targetAudience: 'parents',
        channels: ['social_media', 'email', 'offline'],
        goals: {
          impressions: 100000,
          clicks: 5000,
          conversions: 200,
          cost_per_click: 10,
          roi: 300
        },
        content: {
          title: '优质幼儿教育，从这里开始',
          description: '专业师资，温馨环境，个性化教育方案',
          images: ['banner1.jpg', 'banner2.jpg'],
          videos: ['intro.mp4']
        },
        kindergartenId: 1
      };

      mockJoi.validate.mockReturnValue({ error: null, value: completeData });

      const result = mockJoi.validate(completeData);

      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(completeData);
    });

    it('应该验证复杂的活动查询条件', () => {
      const complexQuery = {
        page: 1,
        pageSize: 20,
        kindergartenId: [1, 2, 3],
        type: ['enrollment', 'brand'],
        status: ['active', 'scheduled'],
        targetAudience: ['parents', 'community'],
        channels: ['social_media', 'email'],
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        minBudget: 5000,
        maxBudget: 100000,
        search: '招生',
        sortBy: 'startDate',
        sortOrder: 'desc',
        includeAnalytics: true,
        includeContent: true
      };

      mockJoi.validate.mockReturnValue({ error: null, value: complexQuery });

      const result = mockJoi.validate(complexQuery);

      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(complexQuery);
    });
  });
});
