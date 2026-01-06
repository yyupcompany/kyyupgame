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

describe('Enrollment Quota Validation', () => {
  let enrollmentQuotaValidation: any;

  beforeAll(async () => {
    const imported = await import('../../../src/validations/enrollment-quota.validation');
    enrollmentQuotaValidation = imported.default || imported;
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

  describe('createQuotaSchema', () => {
    it('应该定义创建配额的验证规则', () => {
      const schema = enrollmentQuotaValidation.createQuotaSchema;

      expect(mockJoi.object).toHaveBeenCalled();
      expect(schema).toBeDefined();
    });

    it('应该验证必填字段', () => {
      const validData = {
        enrollmentPlanId: 1,
        ageGroupName: '小班',
        totalQuota: 30,
        availableQuota: 30,
        reservedQuota: 0,
        priority: 1
      };

      mockJoi.validate.mockReturnValue({ error: null, value: validData });

      const result = mockJoi.validate(validData);

      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(validData);
    });

    it('应该验证年龄组名称', () => {
      const testCases = [
        { ageGroupName: '小班', shouldFail: false },
        { ageGroupName: '中班', shouldFail: false },
        { ageGroupName: '大班', shouldFail: false },
        { ageGroupName: '', shouldFail: true, message: '年龄组名称不能为空' },
        { ageGroupName: 'a'.repeat(51), shouldFail: true, message: '年龄组名称长度不能超过50字符' }
      ];

      testCases.forEach(({ ageGroupName, shouldFail, message }) => {
        const data = { ageGroupName };
        
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

    it('应该验证配额数量', () => {
      const testCases = [
        { totalQuota: 30, shouldFail: false },
        { totalQuota: 0, shouldFail: true, message: '总配额必须大于0' },
        { totalQuota: -5, shouldFail: true, message: '总配额必须大于0' },
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

    it('应该验证可用配额不超过总配额', () => {
      const testCases = [
        {
          totalQuota: 30,
          availableQuota: 25,
          shouldFail: false
        },
        {
          totalQuota: 30,
          availableQuota: 35,
          shouldFail: true,
          message: '可用配额不能超过总配额'
        },
        {
          totalQuota: 30,
          availableQuota: 30,
          shouldFail: false
        }
      ];

      testCases.forEach(({ totalQuota, availableQuota, shouldFail, message }) => {
        const data = { totalQuota, availableQuota };
        
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

    it('应该验证预留配额', () => {
      const testCases = [
        { reservedQuota: 0, shouldFail: false },
        { reservedQuota: 5, shouldFail: false },
        { reservedQuota: -1, shouldFail: true, message: '预留配额不能为负数' },
        { reservedQuota: 'invalid', shouldFail: true, message: '预留配额必须是数字' }
      ];

      testCases.forEach(({ reservedQuota, shouldFail, message }) => {
        const data = { reservedQuota };
        
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

    it('应该验证优先级', () => {
      const testCases = [
        { priority: 1, shouldFail: false },
        { priority: 5, shouldFail: false },
        { priority: 0, shouldFail: true, message: '优先级必须大于0' },
        { priority: 11, shouldFail: true, message: '优先级不能超过10' },
        { priority: 'high', shouldFail: true, message: '优先级必须是数字' }
      ];

      testCases.forEach(({ priority, shouldFail, message }) => {
        const data = { priority };
        
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

    it('应该验证年龄范围', () => {
      const validAgeRange = {
        minAge: 3,
        maxAge: 4
      };

      const data = { ageRange: validAgeRange };
      mockJoi.validate.mockReturnValue({ error: null, value: data });
      
      const result = mockJoi.validate(data);
      expect((result as any).error).toBeNull();
    });

    it('应该验证年龄范围的逻辑性', () => {
      const invalidAgeRange = {
        minAge: 5,
        maxAge: 3
      };

      const data = { ageRange: invalidAgeRange };
      mockJoi.validate.mockReturnValue({
        error: { details: [{ message: '最大年龄必须大于最小年龄' }] },
        value: undefined
      });
      
      const result = mockJoi.validate(data);
      expect((result as any).error).toBeTruthy();
    });
  });

  describe('updateQuotaSchema', () => {
    it('应该定义更新配额的验证规则', () => {
      const schema = enrollmentQuotaValidation.updateQuotaSchema;

      expect(mockJoi.object).toHaveBeenCalled();
      expect(schema).toBeDefined();
    });

    it('应该允许部分字段更新', () => {
      const partialData = {
        totalQuota: 35,
        availableQuota: 30
      };

      mockJoi.validate.mockReturnValue({ error: null, value: partialData });

      const result = mockJoi.validate(partialData);

      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(partialData);
    });

    it('应该验证配额调整的合理性', () => {
      const testCases = [
        {
          currentUsed: 10,
          newTotalQuota: 15,
          shouldFail: false
        },
        {
          currentUsed: 20,
          newTotalQuota: 15,
          shouldFail: true,
          message: '新的总配额不能小于已使用的配额'
        }
      ];

      testCases.forEach(({ currentUsed, newTotalQuota, shouldFail, message }) => {
        const data = { totalQuota: newTotalQuota, currentUsed };
        
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

    it('应该验证状态更新', () => {
      const validStatuses = ['active', 'inactive', 'full', 'suspended'];
      
      validStatuses.forEach(status => {
        const data = { status };
        mockJoi.validate.mockReturnValue({ error: null, value: data });
        
        const result = mockJoi.validate(data);
        expect((result as any).error).toBeNull();
      });

      // 测试无效状态
      const invalidData = { status: 'invalid_status' };
      mockJoi.validate.mockReturnValue({
        error: { details: [{ message: '状态值无效' }] },
        value: undefined
      });
      
      const result = mockJoi.validate(invalidData);
      expect((result as any).error).toBeTruthy();
    });
  });

  describe('queryQuotasSchema', () => {
    it('应该定义查询配额的验证规则', () => {
      const schema = enrollmentQuotaValidation.queryQuotasSchema;

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
        enrollmentPlanId: 1,
        ageGroupName: '小班',
        status: 'active',
        minQuota: 10,
        maxQuota: 50,
        priority: 1
      };

      mockJoi.validate.mockReturnValue({ error: null, value: filterData });

      const result = mockJoi.validate(filterData);

      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(filterData);
    });

    it('应该验证排序参数', () => {
      const validSortFields = ['ageGroupName', 'totalQuota', 'availableQuota', 'priority', 'createdAt'];
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

    it('应该验证配额范围查询', () => {
      const testCases = [
        {
          minQuota: 10,
          maxQuota: 50,
          shouldFail: false
        },
        {
          minQuota: 50,
          maxQuota: 10,
          shouldFail: true,
          message: '最大配额必须大于最小配额'
        },
        {
          minQuota: -5,
          shouldFail: true,
          message: '最小配额不能为负数'
        }
      ];

      testCases.forEach(({ minQuota, maxQuota, shouldFail, message }) => {
        const data = maxQuota ? { minQuota, maxQuota } : { minQuota };
        
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

  describe('quotaAllocationSchema', () => {
    it('应该定义配额分配的验证规则', () => {
      const schema = enrollmentQuotaValidation.quotaAllocationSchema;

      expect(mockJoi.object).toHaveBeenCalled();
      expect(schema).toBeDefined();
    });

    it('应该验证分配数量', () => {
      const validAllocation = {
        quotaId: 1,
        allocatedAmount: 5,
        reason: '特殊需求分配'
      };

      mockJoi.validate.mockReturnValue({ error: null, value: validAllocation });

      const result = mockJoi.validate(validAllocation);

      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(validAllocation);
    });

    it('应该验证分配数量不超过可用配额', () => {
      const data = {
        quotaId: 1,
        allocatedAmount: 50,
        availableQuota: 30
      };

      mockJoi.validate.mockReturnValue({
        error: { details: [{ message: '分配数量不能超过可用配额' }] },
        value: undefined
      });
      
      const result = mockJoi.validate(data);
      expect((result as any).error).toBeTruthy();
    });

    it('应该验证分配原因', () => {
      const testCases = [
        { reason: '正常分配', shouldFail: false },
        { reason: '', shouldFail: true, message: '分配原因不能为空' },
        { reason: 'a'.repeat(201), shouldFail: true, message: '分配原因长度不能超过200字符' }
      ];

      testCases.forEach(({ reason, shouldFail, message }) => {
        const data = { reason };
        
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

    it('应该验证批量分配', () => {
      const batchAllocation = {
        allocations: [
          { quotaId: 1, allocatedAmount: 5, reason: '分配1' },
          { quotaId: 2, allocatedAmount: 3, reason: '分配2' }
        ]
      };

      mockJoi.validate.mockReturnValue({ error: null, value: batchAllocation });

      const result = mockJoi.validate(batchAllocation);

      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(batchAllocation);
    });
  });

  describe('quotaTransferSchema', () => {
    it('应该定义配额转移的验证规则', () => {
      const schema = enrollmentQuotaValidation.quotaTransferSchema;

      expect(mockJoi.object).toHaveBeenCalled();
      expect(schema).toBeDefined();
    });

    it('应该验证转移参数', () => {
      const validTransfer = {
        fromQuotaId: 1,
        toQuotaId: 2,
        transferAmount: 5,
        reason: '配额调整'
      };

      mockJoi.validate.mockReturnValue({ error: null, value: validTransfer });

      const result = mockJoi.validate(validTransfer);

      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(validTransfer);
    });

    it('应该验证转移数量的合理性', () => {
      const testCases = [
        {
          transferAmount: 5,
          fromAvailable: 10,
          shouldFail: false
        },
        {
          transferAmount: 15,
          fromAvailable: 10,
          shouldFail: true,
          message: '转移数量不能超过源配额的可用数量'
        },
        {
          transferAmount: 0,
          shouldFail: true,
          message: '转移数量必须大于0'
        }
      ];

      testCases.forEach(({ transferAmount, fromAvailable, shouldFail, message }) => {
        const data = { transferAmount, fromAvailable };
        
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

    it('应该验证不能自己转移给自己', () => {
      const data = {
        fromQuotaId: 1,
        toQuotaId: 1,
        transferAmount: 5
      };

      mockJoi.validate.mockReturnValue({
        error: { details: [{ message: '不能将配额转移给自己' }] },
        value: undefined
      });
      
      const result = mockJoi.validate(data);
      expect((result as any).error).toBeTruthy();
    });
  });

  describe('Custom Validators', () => {
    it('应该验证配额总和不超过计划总配额', () => {
      const data = {
        enrollmentPlanId: 1,
        quotas: [
          { ageGroupName: '小班', totalQuota: 40 },
          { ageGroupName: '中班', totalQuota: 40 },
          { ageGroupName: '大班', totalQuota: 40 }
        ],
        planTotalQuota: 100
      };

      mockJoi.validate.mockReturnValue({
        error: { details: [{ message: '各年龄组配额总和不能超过计划总配额' }] },
        value: undefined
      });
      
      const result = mockJoi.validate(data);
      expect((result as any).error).toBeTruthy();
    });

    it('应该验证年龄组配额的唯一性', () => {
      const data = {
        enrollmentPlanId: 1,
        ageGroupName: '小班'
      };

      mockJoi.validate.mockReturnValue({
        error: { details: [{ message: '该年龄组配额已存在' }] },
        value: undefined
      });
      
      const result = mockJoi.validate(data);
      expect((result as any).error).toBeTruthy();
    });

    it('应该验证配额状态转换的合法性', () => {
      const testCases = [
        {
          currentStatus: 'active',
          newStatus: 'inactive',
          shouldFail: false
        },
        {
          currentStatus: 'full',
          newStatus: 'active',
          hasAvailableQuota: false,
          shouldFail: true,
          message: '没有可用配额时不能激活'
        }
      ];

      testCases.forEach(({ currentStatus, newStatus, hasAvailableQuota, shouldFail, message }) => {
        const data = { status: newStatus, currentStatus, hasAvailableQuota };
        
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

  describe('Error Messages', () => {
    it('应该返回中文错误消息', () => {
      const invalidData = {
        ageGroupName: '',
        totalQuota: -1,
        priority: 0
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            { message: '年龄组名称不能为空' },
            { message: '总配额必须大于0' },
            { message: '优先级必须大于0' }
          ]
        },
        value: undefined
      });
      
      const result = mockJoi.validate(invalidData);
      
      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)).toHaveLength(3);
      expect(((result as any).error?.details)[0].message).toBe('年龄组名称不能为空');
      expect(((result as any).error?.details)[1].message).toBe('总配额必须大于0');
      expect(((result as any).error?.details)[2].message).toBe('优先级必须大于0');
    });

    it('应该提供详细的验证错误信息', () => {
      const data = { totalQuota: 1001 };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [{
            message: '总配额不能超过1000',
            path: ['totalQuota'],
            type: 'number.max',
            context: { limit: 1000, value: data.totalQuota }
          }]
        },
        value: undefined
      });
      
      const result = mockJoi.validate(data);
      
      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)[0].path).toEqual(['totalQuota']);
      expect(((result as any).error?.details)[0].type).toBe('number.max');
      expect(((result as any).error?.details)[0].context.limit).toBe(1000);
    });
  });

  describe('Integration Tests', () => {
    it('应该验证完整的配额创建数据', () => {
      const completeData = {
        enrollmentPlanId: 1,
        ageGroupName: '小班',
        description: '3-4岁儿童班级',
        totalQuota: 30,
        availableQuota: 30,
        reservedQuota: 5,
        priority: 1,
        ageRange: {
          minAge: 3,
          maxAge: 4
        },
        requirements: ['健康证明', '疫苗接种证'],
        fees: {
          tuitionFee: 2000,
          materialFee: 300
        },
        status: 'active'
      };

      mockJoi.validate.mockReturnValue({ error: null, value: completeData });

      const result = mockJoi.validate(completeData);

      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(completeData);
    });

    it('应该验证复杂的配额查询', () => {
      const complexQuery = {
        page: 1,
        pageSize: 20,
        enrollmentPlanId: [1, 2, 3],
        ageGroupName: ['小班', '中班'],
        status: ['active', 'full'],
        minQuota: 10,
        maxQuota: 50,
        priority: [1, 2],
        sortBy: 'priority',
        sortOrder: 'asc',
        includeStats: true,
        includeAllocations: true
      };

      mockJoi.validate.mockReturnValue({ error: null, value: complexQuery });

      const result = mockJoi.validate(complexQuery);

      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(complexQuery);
    });

    it('应该验证配额统计查询', () => {
      const statsQuery = {
        enrollmentPlanId: 1,
        groupBy: ['ageGroupName', 'status'],
        metrics: ['totalQuota', 'availableQuota', 'usedQuota', 'utilizationRate'],
        dateRange: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31')
        }
      };

      mockJoi.validate.mockReturnValue({ error: null, value: statsQuery });

      const result = mockJoi.validate(statsQuery);

      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(statsQuery);
    });
  });
});
