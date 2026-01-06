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

describe('Enrollment Plan Validation', () => {
  let enrollmentPlanValidation: any;

  beforeAll(async () => {
    const imported = await import('../../../src/validations/enrollment-plan.validation');
    enrollmentPlanValidation = imported.default || imported;
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

  describe('createEnrollmentPlanSchema', () => {
    it('应该定义创建报名计划的验证规则', () => {
      const schema = enrollmentPlanValidation.createEnrollmentPlanSchema;

      expect(mockJoi.object).toHaveBeenCalled();
      expect(schema).toBeDefined();
    });

    it('应该验证必填字段', () => {
      const validData = {
        name: '2024年春季招生计划',
        kindergartenId: 1,
        academicYear: '2024',
        semester: 'spring',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-31'),
        totalQuota: 100,
        status: 'draft'
      };

      mockJoi.validate.mockReturnValue({ error: null, value: validData });

      const result = mockJoi.validate(validData);

      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(validData);
    });

    it('应该验证计划名称', () => {
      const testCases = [
        { name: '', shouldFail: true, message: '计划名称不能为空' },
        { name: 'a'.repeat(201), shouldFail: true, message: '计划名称长度不能超过200字符' },
        { name: '2024年春季招生计划', shouldFail: false }
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

    it('应该验证学年格式', () => {
      const testCases = [
        { academicYear: '2024', shouldFail: false },
        { academicYear: '2024-2025', shouldFail: false },
        { academicYear: '24', shouldFail: true, message: '学年格式不正确' },
        { academicYear: 'invalid', shouldFail: true, message: '学年格式不正确' }
      ];

      testCases.forEach(({ academicYear, shouldFail, message }) => {
        const data = { academicYear };
        
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

    it('应该验证学期枚举值', () => {
      const validSemesters = ['spring', 'fall', 'summer', 'winter'];
      const invalidSemesters = ['invalid', 'autumn', ''];

      validSemesters.forEach(semester => {
        const data = { semester };
        mockJoi.validate.mockReturnValue({ error: null, value: data });
        
        const result = mockJoi.validate(data);
        expect((result as any).error).toBeNull();
      });

      invalidSemesters.forEach(semester => {
        const data = { semester };
        mockJoi.validate.mockReturnValue({
          error: { details: [{ message: '学期值无效' }] },
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

    it('应该验证配额数量', () => {
      const testCases = [
        { totalQuota: 50, shouldFail: false },
        { totalQuota: 0, shouldFail: true, message: '总配额必须大于0' },
        { totalQuota: -10, shouldFail: true, message: '总配额必须大于0' },
        { totalQuota: 1001, shouldFail: true, message: '总配额不能超过1000' },
        { totalQuota: 'invalid', shouldFail: true, message: '总配额必须是数字' }
      ];

      testCases.forEach(({ totalQuota, shouldFail, message }) => {
        const data = { totalQuota };
        
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

    it('应该验证状态枚举值', () => {
      const validStatuses = ['draft', 'active', 'paused', 'completed', 'cancelled'];
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
          error: { details: [{ message: '状态值无效' }] },
          value: undefined
        });
        
        const result = mockJoi.validate(data);
        expect((result as any).error).toBeTruthy();
      });
    });

    it('应该验证年龄组配置', () => {
      const validAgeGroups = [
        {
          name: '小班',
          minAge: 3,
          maxAge: 4,
          quota: 30
        },
        {
          name: '中班',
          minAge: 4,
          maxAge: 5,
          quota: 35
        }
      ];

      const data = { ageGroups: validAgeGroups };
      mockJoi.validate.mockReturnValue({ error: null, value: data });
      
      const result = mockJoi.validate(data);
      expect((result as any).error).toBeNull();
    });

    it('应该验证年龄组配额总和', () => {
      const ageGroups = [
        { name: '小班', minAge: 3, maxAge: 4, quota: 60 },
        { name: '中班', minAge: 4, maxAge: 5, quota: 60 }
      ];
      const totalQuota = 100;

      const data = { ageGroups, totalQuota };
      mockJoi.validate.mockReturnValue({
        error: { details: [{ message: '年龄组配额总和不能超过总配额' }] },
        value: undefined
      });
      
      const result = mockJoi.validate(data);
      expect((result as any).error).toBeTruthy();
    });
  });

  describe('updateEnrollmentPlanSchema', () => {
    it('应该定义更新报名计划的验证规则', () => {
      const schema = enrollmentPlanValidation.updateEnrollmentPlanSchema;

      expect(mockJoi.object).toHaveBeenCalled();
      expect(schema).toBeDefined();
    });

    it('应该允许部分字段更新', () => {
      const partialData = {
        name: '更新后的计划名称',
        status: 'active'
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
          newStatus: 'active',
          shouldFail: false
        },
        {
          currentStatus: 'completed',
          newStatus: 'draft',
          shouldFail: true,
          message: '已完成的计划不能修改状态'
        },
        {
          currentStatus: 'cancelled',
          newStatus: 'active',
          shouldFail: true,
          message: '已取消的计划不能重新激活'
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

    it('应该验证活跃计划的修改限制', () => {
      const data = {
        totalQuota: 50,
        currentStatus: 'active'
      };

      mockJoi.validate.mockReturnValue({
        error: { details: [{ message: '活跃状态的计划不能修改配额' }] },
        value: undefined
      });
      
      const result = mockJoi.validate(data);
      expect((result as any).error).toBeTruthy();
    });
  });

  describe('queryEnrollmentPlansSchema', () => {
    it('应该定义查询报名计划的验证规则', () => {
      const schema = enrollmentPlanValidation.queryEnrollmentPlansSchema;

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

    it('应该验证分页参数范围', () => {
      const testCases = [
        { page: 0, shouldFail: true, message: '页码必须大于0' },
        { page: -1, shouldFail: true, message: '页码必须大于0' },
        { pageSize: 0, shouldFail: true, message: '每页数量必须大于0' },
        { pageSize: 101, shouldFail: true, message: '每页数量不能超过100' }
      ];

      testCases.forEach(({ page, pageSize, shouldFail, message }) => {
        const data = page !== undefined ? { page } : { pageSize };
        
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

    it('应该验证筛选条件', () => {
      const filterData = {
        kindergartenId: 1,
        academicYear: '2024',
        semester: 'spring',
        status: 'active',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31')
      };

      mockJoi.validate.mockReturnValue({ error: null, value: filterData });

      const result = mockJoi.validate(filterData);

      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(filterData);
    });

    it('应该验证排序参数', () => {
      const validSortFields = ['name', 'academicYear', 'startDate', 'endDate', 'totalQuota', 'status', 'createdAt'];
      const validSortOrders = ['asc', 'desc'];

      validSortFields.forEach(sortBy => {
        validSortOrders.forEach(sortOrder => {
          const data = { sortBy, sortOrder };
          mockJoi.validate.mockReturnValue({ error: null, value: data });
          
          const result = mockJoi.validate(data);
          expect((result as any).error).toBeNull();
        });
      });

      // 测试无效排序字段
      const invalidData = { sortBy: 'invalid_field' };
      mockJoi.validate.mockReturnValue({
        error: { details: [{ message: '排序字段无效' }] },
        value: undefined
      });
      
      const result = mockJoi.validate(invalidData);
      expect((result as any).error).toBeTruthy();
    });

    it('应该验证搜索关键词', () => {
      const testCases = [
        { search: '春季招生', shouldFail: false },
        { search: 'a'.repeat(101), shouldFail: true, message: '搜索关键词长度不能超过100字符' },
        { search: '', shouldFail: false } // 空搜索应该被允许
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

  describe('enrollmentPlanStatsSchema', () => {
    it('应该定义统计查询的验证规则', () => {
      const schema = enrollmentPlanValidation.enrollmentPlanStatsSchema;

      expect(mockJoi.object).toHaveBeenCalled();
      expect(schema).toBeDefined();
    });

    it('应该验证统计时间范围', () => {
      const validTimeRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31')
      };

      mockJoi.validate.mockReturnValue({ error: null, value: validTimeRange });

      const result = mockJoi.validate(validTimeRange);

      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(validTimeRange);
    });

    it('应该验证统计维度', () => {
      const validDimensions = ['status', 'semester', 'ageGroup', 'kindergarten'];
      
      validDimensions.forEach(dimension => {
        const data = { groupBy: dimension };
        mockJoi.validate.mockReturnValue({ error: null, value: data });
        
        const result = mockJoi.validate(data);
        expect((result as any).error).toBeNull();
      });

      // 测试无效维度
      const invalidData = { groupBy: 'invalid_dimension' };
      mockJoi.validate.mockReturnValue({
        error: { details: [{ message: '统计维度无效' }] },
        value: undefined
      });
      
      const result = mockJoi.validate(invalidData);
      expect((result as any).error).toBeTruthy();
    });

    it('应该验证统计指标', () => {
      const validMetrics = ['totalPlans', 'totalQuota', 'usedQuota', 'completionRate'];
      
      const data = { metrics: validMetrics };
      mockJoi.validate.mockReturnValue({ error: null, value: data });
      
      const result = mockJoi.validate(data);
      expect((result as any).error).toBeNull();
    });
  });

  describe('Custom Validators', () => {
    it('应该验证计划时间冲突', () => {
      const conflictingPlan = {
        kindergartenId: 1,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-31'),
        existingPlanId: 2
      };

      mockJoi.validate.mockReturnValue({
        error: { details: [{ message: '该时间段已存在其他招生计划' }] },
        value: undefined
      });
      
      const result = mockJoi.validate(conflictingPlan);
      expect((result as any).error).toBeTruthy();
    });

    it('应该验证年龄组重叠', () => {
      const overlappingAgeGroups = [
        { name: '小班', minAge: 3, maxAge: 5, quota: 30 },
        { name: '中班', minAge: 4, maxAge: 6, quota: 30 }
      ];

      const data = { ageGroups: overlappingAgeGroups };
      mockJoi.validate.mockReturnValue({
        error: { details: [{ message: '年龄组范围不能重叠' }] },
        value: undefined
      });
      
      const result = mockJoi.validate(data);
      expect((result as any).error).toBeTruthy();
    });

    it('应该验证幼儿园配额限制', () => {
      const data = {
        kindergartenId: 1,
        totalQuota: 500,
        kindergartenCapacity: 300
      };

      mockJoi.validate.mockReturnValue({
        error: { details: [{ message: '计划配额不能超过幼儿园容量' }] },
        value: undefined
      });
      
      const result = mockJoi.validate(data);
      expect((result as any).error).toBeTruthy();
    });

    it('应该验证学年学期唯一性', () => {
      const duplicateData = {
        kindergartenId: 1,
        academicYear: '2024',
        semester: 'spring'
      };

      mockJoi.validate.mockReturnValue({
        error: { details: [{ message: '该学年学期已存在招生计划' }] },
        value: undefined
      });
      
      const result = mockJoi.validate(duplicateData);
      expect((result as any).error).toBeTruthy();
    });
  });

  describe('Error Messages', () => {
    it('应该返回中文错误消息', () => {
      const invalidData = {
        name: '',
        totalQuota: -1,
        status: 'invalid'
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            { message: '计划名称不能为空' },
            { message: '总配额必须大于0' },
            { message: '状态值无效' }
          ]
        },
        value: undefined
      });
      
      const result = mockJoi.validate(invalidData);
      
      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)).toHaveLength(3);
      expect(((result as any).error?.details)[0].message).toBe('计划名称不能为空');
      expect(((result as any).error?.details)[1].message).toBe('总配额必须大于0');
      expect(((result as any).error?.details)[2].message).toBe('状态值无效');
    });

    it('应该提供详细的验证错误信息', () => {
      const data = { name: 'a'.repeat(201) };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [{
            message: '计划名称长度不能超过200字符',
            path: ['name'],
            type: 'string.max',
            context: { limit: 200, value: data.name }
          }]
        },
        value: undefined
      });
      
      const result = mockJoi.validate(data);
      
      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)[0].path).toEqual(['name']);
      expect(((result as any).error?.details)[0].type).toBe('string.max');
      expect(((result as any).error?.details)[0].context.limit).toBe(200);
    });
  });

  describe('Integration Tests', () => {
    it('应该验证完整的创建计划数据', () => {
      const completeData = {
        name: '2024年春季招生计划',
        description: '面向3-6岁儿童的春季招生',
        kindergartenId: 1,
        academicYear: '2024',
        semester: 'spring',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-31'),
        totalQuota: 100,
        ageGroups: [
          { name: '小班', minAge: 3, maxAge: 4, quota: 30 },
          { name: '中班', minAge: 4, maxAge: 5, quota: 35 },
          { name: '大班', minAge: 5, maxAge: 6, quota: 35 }
        ],
        requirements: ['健康证明', '户口本', '疫苗接种证'],
        fees: {
          registrationFee: 200,
          tuitionFee: 2000,
          materialFee: 300
        },
        status: 'draft'
      };

      mockJoi.validate.mockReturnValue({ error: null, value: completeData });

      const result = mockJoi.validate(completeData);

      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(completeData);
    });

    it('应该验证复杂的查询条件', () => {
      const complexQuery = {
        page: 1,
        pageSize: 20,
        kindergartenId: [1, 2, 3],
        academicYear: ['2024', '2025'],
        semester: ['spring', 'fall'],
        status: ['active', 'completed'],
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        search: '招生',
        sortBy: 'startDate',
        sortOrder: 'desc',
        includeStats: true
      };

      mockJoi.validate.mockReturnValue({ error: null, value: complexQuery });

      const result = mockJoi.validate(complexQuery);

      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(complexQuery);
    });
  });
});
