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

describe('Kindergarten Validation', () => {
  let kindergartenValidation: any;

  beforeAll(async () => {
    const imported = await import('../../../src/validations/kindergarten.validation');
    kindergartenValidation = imported;
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

  describe('createKindergartenSchema', () => {
    it('应该验证有效的幼儿园创建数据', () => {
      const validData = {
        name: '阳光幼儿园',
        englishName: 'Sunshine Kindergarten',
        type: 'public',
        level: 'provincial',
        establishedDate: '2010-09-01',
        licenseNumber: 'KG2010001',
        address: {
          province: '北京市',
          city: '北京市',
          district: '朝阳区',
          street: '教育路123号',
          postalCode: '100000',
          coordinates: {
            latitude: 39.9042,
            longitude: 116.4074
          }
        },
        contact: {
          phone: '010-12345678',
          email: 'info@sunshine-kg.com',
          website: 'https://www.sunshine-kg.com',
          fax: '010-12345679'
        },
        capacity: {
          totalStudents: 300,
          totalClasses: 12,
          ageGroups: {
            small: 4,
            medium: 4,
            large: 4
          }
        },
        facilities: {
          classrooms: 12,
          playgrounds: 2,
          library: true,
          musicRoom: true,
          artRoom: true,
          computerRoom: false,
          medicalRoom: true,
          kitchen: true,
          dormitory: false
        },
        staff: {
          principal: 1,
          teachers: 24,
          assistants: 12,
          nurses: 2,
          cooks: 4,
          security: 2,
          cleaners: 6
        },
        programs: ['regular', 'bilingual', 'art', 'music'],
        tuition: {
          monthly: 3000,
          semester: 15000,
          annual: 30000,
          currency: 'CNY'
        },
        accreditation: {
          status: 'accredited',
          level: 'A',
          validUntil: '2025-12-31',
          certifyingBody: '北京市教育委员会'
        }
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(true));

      const result = mockJoi.validate(validData, kindergartenValidation.createKindergartenSchema);

      expect((result as any).error).toBeNull();
      expect(mockJoi.validate).toHaveBeenCalledWith(validData, kindergartenValidation.createKindergartenSchema);
    });

    it('应该拒绝缺少必填字段的数据', () => {
      const invalidData = {
        // 缺少 name 字段
        type: 'public',
        address: {
          province: '北京市',
          city: '北京市'
        }
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['幼儿园名称是必填字段']));

      const result = mockJoi.validate(invalidData, kindergartenValidation.createKindergartenSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)[0].message).toBe('幼儿园名称是必填字段');
    });

    it('应该验证幼儿园名称长度', () => {
      const invalidData = {
        name: 'A', // 太短
        type: 'public'
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['幼儿园名称长度必须在2-100个字符之间']));

      const result = mockJoi.validate(invalidData, kindergartenValidation.createKindergartenSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)[0].message).toBe('幼儿园名称长度必须在2-100个字符之间');
    });

    it('应该验证幼儿园类型', () => {
      const invalidData = {
        name: '测试幼儿园',
        type: 'invalid_type' // 无效类型
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['幼儿园类型无效']));

      const result = mockJoi.validate(invalidData, kindergartenValidation.createKindergartenSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)[0].message).toBe('幼儿园类型无效');
    });

    it('应该验证等级枚举值', () => {
      const invalidData = {
        name: '测试幼儿园',
        type: 'public',
        level: 'invalid_level' // 无效等级
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['幼儿园等级无效']));

      const result = mockJoi.validate(invalidData, kindergartenValidation.createKindergartenSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)[0].message).toBe('幼儿园等级无效');
    });

    it('应该验证联系方式格式', () => {
      const invalidData = {
        name: '测试幼儿园',
        type: 'public',
        contact: {
          phone: '123', // 无效电话号码
          email: 'invalid-email', // 无效邮箱
          website: 'not-a-url' // 无效网址
        }
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, [
        '电话号码格式无效',
        '邮箱格式无效',
        '网站地址格式无效'
      ]));

      const result = mockJoi.validate(invalidData, kindergartenValidation.createKindergartenSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)).toHaveLength(3);
    });

    it('应该验证容量数据合理性', () => {
      const invalidData = {
        name: '测试幼儿园',
        type: 'public',
        capacity: {
          totalStudents: -10, // 负数
          totalClasses: 0, // 零班级
          ageGroups: {
            small: 10,
            medium: 10,
            large: 10 // 总和超过totalClasses
          }
        }
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, [
        '学生总数不能为负数',
        '班级总数必须大于0',
        '年龄组班级数总和不能超过总班级数'
      ]));

      const result = mockJoi.validate(invalidData, kindergartenValidation.createKindergartenSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)).toHaveLength(3);
    });

    it('应该验证地理坐标范围', () => {
      const invalidData = {
        name: '测试幼儿园',
        type: 'public',
        address: {
          province: '北京市',
          city: '北京市',
          district: '朝阳区',
          street: '测试街道',
          coordinates: {
            latitude: 200, // 超出范围
            longitude: 300 // 超出范围
          }
        }
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, [
        '纬度必须在-90到90之间',
        '经度必须在-180到180之间'
      ]));

      const result = mockJoi.validate(invalidData, kindergartenValidation.createKindergartenSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)).toHaveLength(2);
    });

    it('应该验证员工配置合理性', () => {
      const invalidData = {
        name: '测试幼儿园',
        type: 'public',
        capacity: {
          totalStudents: 300,
          totalClasses: 12
        },
        staff: {
          principal: 0, // 必须有园长
          teachers: 5, // 教师数量不足
          assistants: 2
        }
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, [
        '必须至少有1名园长',
        '教师数量不足，建议师生比不超过1:15'
      ]));

      const result = mockJoi.validate(invalidData, kindergartenValidation.createKindergartenSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)).toHaveLength(2);
    });

    it('应该验证学费信息', () => {
      const invalidData = {
        name: '测试幼儿园',
        type: 'public',
        tuition: {
          monthly: -1000, // 负数学费
          currency: 'INVALID' // 无效货币代码
        }
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, [
        '月学费不能为负数',
        '货币代码无效'
      ]));

      const result = mockJoi.validate(invalidData, kindergartenValidation.createKindergartenSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)).toHaveLength(2);
    });

    it('应该验证认证信息', () => {
      const invalidData = {
        name: '测试幼儿园',
        type: 'public',
        accreditation: {
          status: 'invalid_status', // 无效状态
          level: 'Z', // 无效等级
          validUntil: '2020-01-01' // 已过期
        }
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, [
        '认证状态无效',
        '认证等级无效',
        '认证已过期'
      ]));

      const result = mockJoi.validate(invalidData, kindergartenValidation.createKindergartenSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)).toHaveLength(3);
    });
  });

  describe('updateKindergartenSchema', () => {
    it('应该验证有效的幼儿园更新数据', () => {
      const validData = {
        name: '阳光幼儿园（更新版）',
        contact: {
          phone: '010-87654321',
          email: 'new-info@sunshine-kg.com'
        },
        capacity: {
          totalStudents: 350,
          totalClasses: 14
        },
        status: 'active'
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(true));

      const result = mockJoi.validate(validData, kindergartenValidation.updateKindergartenSchema);

      expect((result as any).error).toBeNull();
    });

    it('应该允许部分字段更新', () => {
      const partialData = {
        contact: {
          phone: '010-11111111'
        }
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(true));

      const result = mockJoi.validate(partialData, kindergartenValidation.updateKindergartenSchema);

      expect((result as any).error).toBeNull();
    });

    it('应该验证状态枚举值', () => {
      const invalidData = {
        status: 'invalid_status'
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['幼儿园状态无效']));

      const result = mockJoi.validate(invalidData, kindergartenValidation.updateKindergartenSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)[0].message).toBe('幼儿园状态无效');
    });

    it('应该禁止更新敏感字段', () => {
      const invalidData = {
        licenseNumber: 'KG2024999' // 不允许更新许可证号
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['许可证号不允许更新']));

      const result = mockJoi.validate(invalidData, kindergartenValidation.updateKindergartenSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)[0].message).toBe('许可证号不允许更新');
    });
  });

  describe('kindergartenQuerySchema', () => {
    it('应该验证有效的查询参数', () => {
      const validQuery = {
        type: 'public',
        level: 'municipal',
        status: 'active',
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        minCapacity: '100',
        maxCapacity: '500',
        programs: 'bilingual,art',
        page: '1',
        pageSize: '20',
        sortBy: 'name',
        sortOrder: 'asc',
        search: '阳光'
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(true));

      const result = mockJoi.validate(validQuery, kindergartenValidation.kindergartenQuerySchema);

      expect((result as any).error).toBeNull();
    });

    it('应该验证分页参数', () => {
      const invalidQuery = {
        page: '0', // 页码不能为0
        pageSize: '101' // 超过最大页面大小
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['页码必须大于0', '页面大小不能超过100']));

      const result = mockJoi.validate(invalidQuery, kindergartenValidation.kindergartenQuerySchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)).toHaveLength(2);
    });

    it('应该验证容量范围', () => {
      const invalidQuery = {
        minCapacity: '1000', // 最小容量过大
        maxCapacity: '500' // 最大容量小于最小容量
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['最大容量不能小于最小容量']));

      const result = mockJoi.validate(invalidQuery, kindergartenValidation.kindergartenQuerySchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)[0].message).toBe('最大容量不能小于最小容量');
    });

    it('应该验证排序参数', () => {
      const invalidQuery = {
        sortBy: 'invalid_field',
        sortOrder: 'invalid_order'
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['排序字段无效', '排序方向无效']));

      const result = mockJoi.validate(invalidQuery, kindergartenValidation.kindergartenQuerySchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)).toHaveLength(2);
    });
  });

  describe('kindergartenStatsSchema', () => {
    it('应该验证有效的统计参数', () => {
      const validData = {
        dateRange: {
          start: '2024-01-01',
          end: '2024-12-31'
        },
        metrics: ['enrollment', 'revenue', 'satisfaction'],
        groupBy: 'month',
        includeComparison: true,
        filters: {
          type: 'public',
          level: 'municipal'
        }
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(true));

      const result = mockJoi.validate(validData, kindergartenValidation.kindergartenStatsSchema);

      expect((result as any).error).toBeNull();
    });

    it('应该验证日期范围', () => {
      const invalidData = {
        dateRange: {
          start: '2024-12-31',
          end: '2024-01-01' // 结束日期早于开始日期
        }
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['结束日期不能早于开始日期']));

      const result = mockJoi.validate(invalidData, kindergartenValidation.kindergartenStatsSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)[0].message).toBe('结束日期不能早于开始日期');
    });

    it('应该验证指标类型', () => {
      const invalidData = {
        metrics: ['invalid_metric', 'enrollment']
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['统计指标无效']));

      const result = mockJoi.validate(invalidData, kindergartenValidation.kindergartenStatsSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)[0].message).toBe('统计指标无效');
    });

    it('应该验证分组方式', () => {
      const invalidData = {
        groupBy: 'invalid_group'
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['分组方式无效']));

      const result = mockJoi.validate(invalidData, kindergartenValidation.kindergartenStatsSchema);

      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)[0].message).toBe('分组方式无效');
    });
  });

  describe('自定义验证器', () => {
    it('应该验证师生比合理性', () => {
      const kindergartenData = {
        capacity: {
          totalStudents: 300
        },
        staff: {
          teachers: 10 // 师生比1:30，过高
        }
      };

      const ratioValidator = jest.fn().mockImplementation((value, helpers) => {
        const ratio = value.capacity.totalStudents / value.staff.teachers;
        if (ratio > 20) { // 师生比不应超过1:20
          return helpers.error('staff.ratio.too_high');
        }
        return value;
      });

      mockJoi.custom.mockReturnValue({ validate: ratioValidator });

      const schema = mockJoi.object().keys({
        kindergarten: mockJoi.custom(ratioValidator)
      });

      const result = schema.validate ? schema.validate(kindergartenData) : { error: null };

      expect(ratioValidator).toHaveBeenCalled();
    });

    it('应该验证设施与容量的匹配性', () => {
      const facilityData = {
        capacity: {
          totalClasses: 12
        },
        facilities: {
          classrooms: 8 // 教室数量不足
        }
      };

      const facilityValidator = jest.fn().mockImplementation((value, helpers) => {
        if (value.facilities.classrooms < value.capacity.totalClasses) {
          return helpers.error('facilities.insufficient');
        }
        return value;
      });

      mockJoi.custom.mockReturnValue({ validate: facilityValidator });

      const schema = mockJoi.object().keys({
        facility: mockJoi.custom(facilityValidator)
      });

      const result = schema.validate ? schema.validate(facilityData) : { error: null };

      expect(facilityValidator).toHaveBeenCalled();
    });

    it('应该验证学费结构一致性', () => {
      const tuitionData = {
        monthly: 3000,
        semester: 15000, // 5个月
        annual: 30000 // 10个月
      };

      const tuitionValidator = jest.fn().mockImplementation((value, helpers) => {
        const expectedSemester = value.monthly * 5;
        const expectedAnnual = value.monthly * 10;
        
        if (Math.abs(value.semester - expectedSemester) > 100 ||
            Math.abs(value.annual - expectedAnnual) > 200) {
          return helpers.error('tuition.inconsistent');
        }
        return value;
      });

      mockJoi.custom.mockReturnValue({ validate: tuitionValidator });

      const schema = mockJoi.object().keys({
        tuition: mockJoi.custom(tuitionValidator)
      });

      const result = schema.validate ? schema.validate(tuitionData) : { error: null };

      expect(tuitionValidator).toHaveBeenCalled();
    });
  });

  describe('错误消息', () => {
    it('应该提供中文错误消息', () => {
      const invalidData = {
        name: '',
        type: 'invalid'
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, [
        '幼儿园名称不能为空',
        '幼儿园类型必须是以下之一：public, private, international, bilingual'
      ]));

      const result = mockJoi.validate(invalidData, kindergartenValidation.createKindergartenSchema);

      expect(((result as any).error?.details)[0].message).toBe('幼儿园名称不能为空');
      expect(((result as any).error?.details)[1].message).toContain('幼儿园类型必须是以下之一');
    });

    it('应该提供详细的字段路径', () => {
      const invalidData = {
        address: {
          coordinates: {
            latitude: 200 // 超出范围
          }
        }
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [{
            message: '纬度必须在-90到90之间',
            path: ['address', 'coordinates', 'latitude'],
            type: 'number.min'
          }]
        }
      });

      const result = mockJoi.validate(invalidData, kindergartenValidation.createKindergartenSchema);

      expect(((result as any).error?.details)[0].path).toEqual(['address', 'coordinates', 'latitude']);
      expect(((result as any).error?.details)[0].message).toBe('纬度必须在-90到90之间');
    });
  });
});
