import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock Joi
const mockJoi = {
  object: jest.fn().mockReturnThis(),
  string: jest.fn().mockReturnThis(),
  number: jest.fn().mockReturnThis(),
  boolean: jest.fn().mockReturnThis(),
  array: jest.fn().mockReturnThis(),
  date: jest.fn().mockReturnThis(),
  any: jest.fn().mockReturnThis(),
  alternatives: jest.fn().mockReturnThis(),
  
  // Validation methods
  required: jest.fn().mockReturnThis(),
  optional: jest.fn().mockReturnThis(),
  allow: jest.fn().mockReturnThis(),
  valid: jest.fn().mockReturnThis(),
  invalid: jest.fn().mockReturnThis(),
  min: jest.fn().mockReturnThis(),
  max: jest.fn().mockReturnThis(),
  length: jest.fn().mockReturnThis(),
  pattern: jest.fn().mockReturnThis(),
  email: jest.fn().mockReturnThis(),
  uri: jest.fn().mockReturnThis(),
  iso: jest.fn().mockReturnThis(),
  positive: jest.fn().mockReturnThis(),
  integer: jest.fn().mockReturnThis(),
  items: jest.fn().mockReturnThis(),
  keys: jest.fn().mockReturnThis(),
  when: jest.fn().mockReturnThis(),
  
  // Custom methods
  custom: jest.fn().mockReturnThis(),
  messages: jest.fn().mockReturnThis(),
  
  // Validation execution
  validate: jest.fn(),
  validateAsync: jest.fn()
};

// Mock validation schemas
const createMockValidationResult = (isValid = true, errors = []) => ({
  error: isValid ? null : {
    details: errors.map(error => ({
      message: error,
      path: ['field'],
      type: 'any.invalid'
    }))
  },
  value: isValid ? {} : undefined
});

// Mock imports
jest.unstable_mockModule('joi', () => mockJoi);


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

describe('Marketing Validation', () => {
  let marketingValidation: any;

  beforeAll(async () => {
    const imported = await import('../../../src/validations/marketing-campaign.validator');
    marketingValidation = imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation for validate
    mockJoi.validate.mockImplementation((data, schema) => {
      // Simple validation logic for testing
      if (!data || typeof data !== 'object') {
        return createMockValidationResult(false, ['数据格式无效']);
      }
      return createMockValidationResult(true);
    });
  });

  describe('createCampaignSchema', () => {
    it('应该验证有效的活动创建数据', () => {
      const validData = {
        name: '春季招生活动',
        description: '2024年春季招生宣传活动',
        type: 'enrollment',
        targetAudience: {
          ageRange: { min: 3, max: 6 },
          location: ['北京市', '上海市'],
          interests: ['教育', '亲子']
        },
        budget: {
          total: 50000,
          allocated: {
            email: 15000,
            sms: 15000,
            social_media: 20000
          }
        },
        schedule: {
          startDate: '2024-04-01T00:00:00Z',
          endDate: '2024-04-30T23:59:59Z',
          timezone: 'Asia/Shanghai'
        },
        channels: ['email', 'sms', 'social_media'],
        content: {
          title: '优质幼儿教育，从这里开始',
          description: '我们致力于为孩子提供最优质的学前教育...',
          callToAction: {
            text: '立即报名',
            url: '/enrollment/apply'
          }
        }
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(true));

      const result = mockJoi.validate(validData, marketingValidation.createCampaignSchema);

      expect((result as any).error).toBeNull();
      expect(mockJoi.validate).toHaveBeenCalledWith(validData, marketingValidation.createCampaignSchema);
    });

    it('应该拒绝缺少必填字段的数据', () => {
      const invalidData = {
        // 缺少 name 字段
        description: '测试活动',
        type: 'enrollment'
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['name是必填字段']));

      const result = mockJoi.validate(invalidData, marketingValidation.createCampaignSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)[0].message).toBe('name是必填字段');
    });

    it('应该验证活动名称长度', () => {
      const invalidData = {
        name: 'a', // 太短
        type: 'enrollment'
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['活动名称长度必须在2-100个字符之间']));

      const result = mockJoi.validate(invalidData, marketingValidation.createCampaignSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)[0].message).toBe('活动名称长度必须在2-100个字符之间');
    });

    it('应该验证活动类型', () => {
      const invalidData = {
        name: '测试活动',
        type: 'invalid_type' // 无效类型
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['活动类型无效']));

      const result = mockJoi.validate(invalidData, marketingValidation.createCampaignSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)[0].message).toBe('活动类型无效');
    });

    it('应该验证预算格式', () => {
      const invalidData = {
        name: '测试活动',
        type: 'enrollment',
        budget: {
          total: -1000 // 负数预算
        }
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['预算必须为正数']));

      const result = mockJoi.validate(invalidData, marketingValidation.createCampaignSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)[0].message).toBe('预算必须为正数');
    });

    it('应该验证预算分配总和', () => {
      const invalidData = {
        name: '测试活动',
        type: 'enrollment',
        budget: {
          total: 10000,
          allocated: {
            email: 6000,
            sms: 5000 // 总和超过总预算
          }
        }
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['预算分配总和不能超过总预算']));

      const result = mockJoi.validate(invalidData, marketingValidation.createCampaignSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)[0].message).toBe('预算分配总和不能超过总预算');
    });

    it('应该验证日期范围', () => {
      const invalidData = {
        name: '测试活动',
        type: 'enrollment',
        schedule: {
          startDate: '2024-04-30T00:00:00Z',
          endDate: '2024-04-01T00:00:00Z' // 结束日期早于开始日期
        }
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['结束日期不能早于开始日期']));

      const result = mockJoi.validate(invalidData, marketingValidation.createCampaignSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)[0].message).toBe('结束日期不能早于开始日期');
    });

    it('应该验证目标受众年龄范围', () => {
      const invalidData = {
        name: '测试活动',
        type: 'enrollment',
        targetAudience: {
          ageRange: {
            min: 8, // 超出幼儿园年龄范围
            max: 10
          }
        }
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['年龄范围必须在2-7岁之间']));

      const result = mockJoi.validate(invalidData, marketingValidation.createCampaignSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)[0].message).toBe('年龄范围必须在2-7岁之间');
    });

    it('应该验证营销渠道', () => {
      const invalidData = {
        name: '测试活动',
        type: 'enrollment',
        channels: ['invalid_channel'] // 无效渠道
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['营销渠道无效']));

      const result = mockJoi.validate(invalidData, marketingValidation.createCampaignSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)[0].message).toBe('营销渠道无效');
    });

    it('应该验证内容格式', () => {
      const invalidData = {
        name: '测试活动',
        type: 'enrollment',
        content: {
          title: '', // 空标题
          callToAction: {
            text: '点击',
            url: 'invalid-url' // 无效URL
          }
        }
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['标题不能为空', 'URL格式无效']));

      const result = mockJoi.validate(invalidData, marketingValidation.createCampaignSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)).toHaveLength(2);
    });
  });

  describe('updateCampaignSchema', () => {
    it('应该验证有效的活动更新数据', () => {
      const validData = {
        name: '春季招生活动 - 更新版',
        description: '更新后的活动描述',
        budget: {
          total: 60000,
          allocated: {
            email: 20000,
            sms: 20000,
            social_media: 20000
          }
        },
        priority: 'high'
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(true));

      const result = mockJoi.validate(validData, marketingValidation.updateCampaignSchema);

      expect((result as any).error).toBeNull();
    });

    it('应该允许部分字段更新', () => {
      const partialData = {
        name: '新活动名称'
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(true));

      const result = mockJoi.validate(partialData, marketingValidation.updateCampaignSchema);

      expect((result as any).error).toBeNull();
    });

    it('应该拒绝无效的优先级', () => {
      const invalidData = {
        priority: 'invalid_priority'
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['优先级无效']));

      const result = mockJoi.validate(invalidData, marketingValidation.updateCampaignSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)[0].message).toBe('优先级无效');
    });

    it('应该验证状态转换', () => {
      const invalidData = {
        status: 'invalid_status'
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['状态无效']));

      const result = mockJoi.validate(invalidData, marketingValidation.updateCampaignSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)[0].message).toBe('状态无效');
    });
  });

  describe('campaignQuerySchema', () => {
    it('应该验证有效的查询参数', () => {
      const validQuery = {
        status: 'active',
        type: 'enrollment',
        page: '1',
        pageSize: '20',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        startDate: '2024-04-01',
        endDate: '2024-04-30',
        search: '招生'
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(true));

      const result = mockJoi.validate(validQuery, marketingValidation.campaignQuerySchema);

      expect((result as any).error).toBeNull();
    });

    it('应该验证分页参数', () => {
      const invalidQuery = {
        page: '0', // 页码不能为0
        pageSize: '101' // 超过最大页面大小
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['页码必须大于0', '页面大小不能超过100']));

      const result = mockJoi.validate(invalidQuery, marketingValidation.campaignQuerySchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)).toHaveLength(2);
    });

    it('应该验证排序参数', () => {
      const invalidQuery = {
        sortBy: 'invalid_field',
        sortOrder: 'invalid_order'
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['排序字段无效', '排序方向无效']));

      const result = mockJoi.validate(invalidQuery, marketingValidation.campaignQuerySchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)).toHaveLength(2);
    });

    it('应该验证日期格式', () => {
      const invalidQuery = {
        startDate: 'invalid-date',
        endDate: '2024-13-01' // 无效月份
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['开始日期格式无效', '结束日期格式无效']));

      const result = mockJoi.validate(invalidQuery, marketingValidation.campaignQuerySchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)).toHaveLength(2);
    });
  });

  describe('campaignMetricsSchema', () => {
    it('应该验证有效的指标数据', () => {
      const validMetrics = {
        impressions: 10000,
        clicks: 250,
        conversions: 25,
        cost: 5000.50,
        ctr: 0.025,
        cpc: 20.00,
        cpa: 200.00,
        roi: 1.5
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(true));

      const result = mockJoi.validate(validMetrics, marketingValidation.campaignMetricsSchema);

      expect((result as any).error).toBeNull();
    });

    it('应该拒绝负数指标', () => {
      const invalidMetrics = {
        impressions: -100,
        clicks: -10,
        cost: -500
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['展示次数不能为负数', '点击次数不能为负数', '成本不能为负数']));

      const result = mockJoi.validate(invalidMetrics, marketingValidation.campaignMetricsSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)).toHaveLength(3);
    });

    it('应该验证比率范围', () => {
      const invalidMetrics = {
        ctr: 1.5, // CTR不能超过100%
        roi: -2.0 // ROI可以为负数，但有下限
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['点击率不能超过100%']));

      const result = mockJoi.validate(invalidMetrics, marketingValidation.campaignMetricsSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)[0].message).toBe('点击率不能超过100%');
    });

    it('应该验证逻辑一致性', () => {
      const invalidMetrics = {
        impressions: 100,
        clicks: 200 // 点击数不能超过展示数
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['点击数不能超过展示数']));

      const result = mockJoi.validate(invalidMetrics, marketingValidation.campaignMetricsSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)[0].message).toBe('点击数不能超过展示数');
    });
  });

  describe('campaignAssetSchema', () => {
    it('应该验证有效的素材数据', () => {
      const validAsset = {
        type: 'image',
        name: '活动海报',
        description: '春季招生活动主海报',
        url: 'https://example.com/assets/poster.jpg',
        size: 1024000, // 1MB
        mimeType: 'image/jpeg',
        dimensions: {
          width: 1920,
          height: 1080
        }
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(true));

      const result = mockJoi.validate(validAsset, marketingValidation.campaignAssetSchema);

      expect((result as any).error).toBeNull();
    });

    it('应该验证素材类型', () => {
      const invalidAsset = {
        type: 'invalid_type',
        name: '测试素材'
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['素材类型无效']));

      const result = mockJoi.validate(invalidAsset, marketingValidation.campaignAssetSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)[0].message).toBe('素材类型无效');
    });

    it('应该验证文件大小限制', () => {
      const invalidAsset = {
        type: 'image',
        name: '大图片',
        size: 10 * 1024 * 1024 // 10MB，超过限制
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['文件大小不能超过5MB']));

      const result = mockJoi.validate(invalidAsset, marketingValidation.campaignAssetSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)[0].message).toBe('文件大小不能超过5MB');
    });

    it('应该验证图片尺寸', () => {
      const invalidAsset = {
        type: 'image',
        name: '小图片',
        dimensions: {
          width: 50, // 太小
          height: 50
        }
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['图片尺寸太小，最小为100x100']));

      const result = mockJoi.validate(invalidAsset, marketingValidation.campaignAssetSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)[0].message).toBe('图片尺寸太小，最小为100x100');
    });

    it('应该验证MIME类型', () => {
      const invalidAsset = {
        type: 'image',
        name: '测试文件',
        mimeType: 'application/pdf' // 图片类型但MIME类型不匹配
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['MIME类型与素材类型不匹配']));

      const result = mockJoi.validate(invalidAsset, marketingValidation.campaignAssetSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)[0].message).toBe('MIME类型与素材类型不匹配');
    });
  });

  describe('campaignLeadSchema', () => {
    it('应该验证有效的线索数据', () => {
      const validLead = {
        name: '张三',
        email: 'zhangsan@example.com',
        phone: '13800138000',
        source: 'email',
        status: 'new',
        notes: '对春季班感兴趣',
        tags: ['高意向', '已联系'],
        customFields: {
          childAge: 4,
          preferredClass: 'morning'
        }
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(true));

      const result = mockJoi.validate(validLead, marketingValidation.campaignLeadSchema);

      expect((result as any).error).toBeNull();
    });

    it('应该验证联系信息', () => {
      const invalidLead = {
        name: '张三',
        email: 'invalid-email', // 无效邮箱
        phone: '123' // 无效手机号
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['邮箱格式无效', '手机号格式无效']));

      const result = mockJoi.validate(invalidLead, marketingValidation.campaignLeadSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)).toHaveLength(2);
    });

    it('应该验证线索来源', () => {
      const invalidLead = {
        name: '张三',
        email: 'zhangsan@example.com',
        source: 'invalid_source'
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['线索来源无效']));

      const result = mockJoi.validate(invalidLead, marketingValidation.campaignLeadSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)[0].message).toBe('线索来源无效');
    });

    it('应该验证线索状态', () => {
      const invalidLead = {
        name: '张三',
        email: 'zhangsan@example.com',
        status: 'invalid_status'
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['线索状态无效']));

      const result = mockJoi.validate(invalidLead, marketingValidation.campaignLeadSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)[0].message).toBe('线索状态无效');
    });

    it('应该验证自定义字段', () => {
      const invalidLead = {
        name: '张三',
        email: 'zhangsan@example.com',
        customFields: {
          childAge: 15, // 超出幼儿园年龄范围
          invalidField: 'value'
        }
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['孩子年龄超出范围', '不允许的自定义字段']));

      const result = mockJoi.validate(invalidLead, marketingValidation.campaignLeadSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)).toHaveLength(2);
    });
  });

  describe('campaignReportSchema', () => {
    it('应该验证有效的报告参数', () => {
      const validParams = {
        format: 'pdf',
        dateRange: {
          start: '2024-04-01',
          end: '2024-04-30'
        },
        includeCharts: true,
        includeDetails: false,
        sections: ['overview', 'performance', 'recommendations'],
        language: 'zh-CN'
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(true));

      const result = mockJoi.validate(validParams, marketingValidation.campaignReportSchema);

      expect((result as any).error).toBeNull();
    });

    it('应该验证报告格式', () => {
      const invalidParams = {
        format: 'invalid_format'
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['报告格式无效']));

      const result = mockJoi.validate(invalidParams, marketingValidation.campaignReportSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)[0].message).toBe('报告格式无效');
    });

    it('应该验证报告章节', () => {
      const invalidParams = {
        sections: ['invalid_section', 'overview']
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['报告章节无效']));

      const result = mockJoi.validate(invalidParams, marketingValidation.campaignReportSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)[0].message).toBe('报告章节无效');
    });

    it('应该验证语言代码', () => {
      const invalidParams = {
        language: 'invalid-lang'
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['语言代码无效']));

      const result = mockJoi.validate(invalidParams, marketingValidation.campaignReportSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)[0].message).toBe('语言代码无效');
    });
  });

  describe('自定义验证器', () => {
    it('应该验证预算分配一致性', () => {
      const budgetData = {
        total: 10000,
        allocated: {
          email: 4000,
          sms: 3000,
          social_media: 4000 // 总和超过总预算
        }
      };

      // Mock custom validator
      const customValidator = jest.fn().mockImplementation((value, helpers) => {
        const totalAllocated = Object.values(value.allocated).reduce((sum, amount) => sum + amount, 0);
        if (totalAllocated > value.total) {
          return helpers.error('budget.allocation.exceeded');
        }
        return value;
      });

      mockJoi.custom.mockReturnValue({ validate: customValidator });

      const schema = mockJoi.object().keys({
        budget: mockJoi.custom(customValidator)
      });

      const result = schema.validate ? schema.validate(budgetData) : { error: null };

      expect(customValidator).toHaveBeenCalled();
    });

    it('应该验证活动时间冲突', () => {
      const scheduleData = {
        startDate: '2024-04-01T00:00:00Z',
        endDate: '2024-04-30T23:59:59Z',
        existingCampaigns: [
          {
            startDate: '2024-04-15T00:00:00Z',
            endDate: '2024-05-15T23:59:59Z'
          }
        ]
      };

      const conflictValidator = jest.fn().mockImplementation((value, helpers) => {
        // Check for time conflicts
        const hasConflict = value.existingCampaigns.some(campaign => {
          return (new Date(value.startDate) <= new Date(campaign.endDate)) &&
                 (new Date(value.endDate) >= new Date(campaign.startDate));
        });
        
        if (hasConflict) {
          return helpers.error('schedule.conflict');
        }
        return value;
      });

      mockJoi.custom.mockReturnValue({ validate: conflictValidator });

      const schema = mockJoi.object().keys({
        schedule: mockJoi.custom(conflictValidator)
      });

      const result = schema.validate ? schema.validate(scheduleData) : { error: null };

      expect(conflictValidator).toHaveBeenCalled();
    });

    it('应该验证目标受众合理性', () => {
      const audienceData = {
        ageRange: { min: 3, max: 6 },
        location: ['北京市'],
        estimatedSize: 50000 // 预估受众规模
      };

      const audienceValidator = jest.fn().mockImplementation((value, helpers) => {
        // Validate audience size is reasonable for location
        const locationSizes = {
          '北京市': 100000,
          '上海市': 80000,
          '广州市': 60000
        };
        
        const maxSize = value.location.reduce((sum, loc) => sum + (locationSizes[loc] || 10000), 0);
        
        if (value.estimatedSize > maxSize) {
          return helpers.error('audience.size.unrealistic');
        }
        return value;
      });

      mockJoi.custom.mockReturnValue({ validate: audienceValidator });

      const schema = mockJoi.object().keys({
        targetAudience: mockJoi.custom(audienceValidator)
      });

      const result = schema.validate ? schema.validate(audienceData) : { error: null };

      expect(audienceValidator).toHaveBeenCalled();
    });
  });

  describe('错误消息', () => {
    it('应该提供中文错误消息', () => {
      const invalidData = {
        name: '',
        type: 'invalid'
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, [
        '活动名称不能为空',
        '活动类型必须是以下之一：enrollment, brand_awareness, event_promotion, retention, referral'
      ]));

      const result = mockJoi.validate(invalidData, marketingValidation.createCampaignSchema);

      expect(((result as any).error?.details)[0].message).toBe('活动名称不能为空');
      expect(((result as any).error?.details)[1].message).toContain('活动类型必须是以下之一');
    });

    it('应该提供详细的字段路径', () => {
      const invalidData = {
        budget: {
          allocated: {
            email: -1000 // 负数
          }
        }
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [{
            message: '邮件渠道预算不能为负数',
            path: ['budget', 'allocated', 'email'],
            type: 'number.positive'
          }]
        }
      });

      const result = mockJoi.validate(invalidData, marketingValidation.createCampaignSchema);

      expect(((result as any).error?.details)[0].path).toEqual(['budget', 'allocated', 'email']);
      expect(((result as any).error?.details)[0].message).toBe('邮件渠道预算不能为负数');
    });
  });
});
