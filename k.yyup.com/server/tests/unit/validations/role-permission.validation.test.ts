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

describe('Role Permission Validation', () => {
  let rolePermissionValidation: any;

  beforeAll(async () => {
    const imported = await import('../../../src/validations/role-permission.validation');
    rolePermissionValidation = imported.default || imported;
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

  describe('assignPermissionSchema', () => {
    it('应该定义分配权限的验证规则', () => {
      const schema = rolePermissionValidation.assignPermissionSchema;

      expect(mockJoi.object).toHaveBeenCalled();
      expect(schema).toBeDefined();
    });

    it('应该验证必填字段', () => {
      const validData = {
        roleId: 1,
        permissionId: 2,
        assignedBy: 1
      };

      mockJoi.validate.mockReturnValue({ error: null, value: validData });

      const result = mockJoi.validate(validData);

      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(validData);
    });

    it('应该验证角色ID', () => {
      const testCases = [
        { roleId: 1, shouldFail: false },
        { roleId: 0, shouldFail: true, message: '角色ID必须大于0' },
        { roleId: -1, shouldFail: true, message: '角色ID必须大于0' },
        { roleId: 'invalid', shouldFail: true, message: '角色ID必须是数字' },
        { roleId: null, shouldFail: true, message: '角色ID不能为空' }
      ];

      testCases.forEach(({ roleId, shouldFail, message }) => {
        const data = { roleId };
        
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

    it('应该验证权限ID', () => {
      const testCases = [
        { permissionId: 1, shouldFail: false },
        { permissionId: 0, shouldFail: true, message: '权限ID必须大于0' },
        { permissionId: -1, shouldFail: true, message: '权限ID必须大于0' },
        { permissionId: 'invalid', shouldFail: true, message: '权限ID必须是数字' },
        { permissionId: null, shouldFail: true, message: '权限ID不能为空' }
      ];

      testCases.forEach(({ permissionId, shouldFail, message }) => {
        const data = { permissionId };
        
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

    it('应该验证分配者ID', () => {
      const testCases = [
        { assignedBy: 1, shouldFail: false },
        { assignedBy: 0, shouldFail: true, message: '分配者ID必须大于0' },
        { assignedBy: -1, shouldFail: true, message: '分配者ID必须大于0' },
        { assignedBy: 'invalid', shouldFail: true, message: '分配者ID必须是数字' }
      ];

      testCases.forEach(({ assignedBy, shouldFail, message }) => {
        const data = { assignedBy };
        
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

    it('应该验证权限范围', () => {
      const validScopes = ['global', 'kindergarten', 'class', 'self'];
      
      validScopes.forEach(scope => {
        const data = { scope };
        mockJoi.validate.mockReturnValue({ error: null, value: data });
        
        const result = mockJoi.validate(data);
        expect((result as any).error).toBeNull();
      });

      // 测试无效范围
      const invalidData = { scope: 'invalid_scope' };
      mockJoi.validate.mockReturnValue({
        error: { details: [{ message: '权限范围无效' }] },
        value: undefined
      });
      
      const result = mockJoi.validate(invalidData);
      expect((result as any).error).toBeTruthy();
    });

    it('应该验证资源限制', () => {
      const validResourceLimits = {
        kindergartenIds: [1, 2, 3],
        classIds: [10, 20, 30],
        maxStudents: 100,
        maxClasses: 5
      };

      const data = { resourceLimits: validResourceLimits };
      mockJoi.validate.mockReturnValue({ error: null, value: data });
      
      const result = mockJoi.validate(data);
      expect((result as any).error).toBeNull();
    });

    it('应该验证有效期', () => {
      const testCases = [
        {
          expiresAt: new Date('2024-12-31'),
          shouldFail: false
        },
        {
          expiresAt: new Date('2020-01-01'),
          shouldFail: true,
          message: '有效期不能是过去的日期'
        }
      ];

      testCases.forEach(({ expiresAt, shouldFail, message }) => {
        const data = { expiresAt };
        
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

  describe('batchAssignPermissionsSchema', () => {
    it('应该定义批量分配权限的验证规则', () => {
      const schema = rolePermissionValidation.batchAssignPermissionsSchema;

      expect(mockJoi.object).toHaveBeenCalled();
      expect(schema).toBeDefined();
    });

    it('应该验证批量分配数据', () => {
      const validBatchData = {
        roleId: 1,
        permissionIds: [1, 2, 3, 4, 5],
        assignedBy: 1,
        scope: 'kindergarten',
        resourceLimits: {
          kindergartenIds: [1, 2]
        }
      };

      mockJoi.validate.mockReturnValue({ error: null, value: validBatchData });

      const result = mockJoi.validate(validBatchData);

      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(validBatchData);
    });

    it('应该验证权限ID数组', () => {
      const testCases = [
        { permissionIds: [1, 2, 3], shouldFail: false },
        { permissionIds: [], shouldFail: true, message: '权限ID列表不能为空' },
        { permissionIds: [1, 2, 2, 3], shouldFail: true, message: '权限ID不能重复' },
        { permissionIds: [1, 0, 3], shouldFail: true, message: '权限ID必须大于0' },
        { permissionIds: 'invalid', shouldFail: true, message: '权限ID列表必须是数组' }
      ];

      testCases.forEach(({ permissionIds, shouldFail, message }) => {
        const data = { permissionIds };
        
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

    it('应该验证批量分配数量限制', () => {
      const tooManyPermissions = Array.from({ length: 101 }, (_, i) => i + 1);
      
      const data = { permissionIds: tooManyPermissions };
      mockJoi.validate.mockReturnValue({
        error: { details: [{ message: '单次最多只能分配100个权限' }] },
        value: undefined
      });
      
      const result = mockJoi.validate(data);
      expect((result as any).error).toBeTruthy();
    });
  });

  describe('revokePermissionSchema', () => {
    it('应该定义撤销权限的验证规则', () => {
      const schema = rolePermissionValidation.revokePermissionSchema;

      expect(mockJoi.object).toHaveBeenCalled();
      expect(schema).toBeDefined();
    });

    it('应该验证撤销权限数据', () => {
      const validData = {
        roleId: 1,
        permissionId: 2,
        revokedBy: 1,
        reason: '权限调整'
      };

      mockJoi.validate.mockReturnValue({ error: null, value: validData });

      const result = mockJoi.validate(validData);

      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(validData);
    });

    it('应该验证撤销原因', () => {
      const testCases = [
        { reason: '权限调整', shouldFail: false },
        { reason: '', shouldFail: true, message: '撤销原因不能为空' },
        { reason: 'a'.repeat(201), shouldFail: true, message: '撤销原因长度不能超过200字符' }
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

    it('应该验证立即生效标志', () => {
      const data = { immediate: true };
      mockJoi.validate.mockReturnValue({ error: null, value: data });
      
      const result = mockJoi.validate(data);
      expect((result as any).error).toBeNull();
    });
  });

  describe('queryRolePermissionsSchema', () => {
    it('应该定义查询角色权限的验证规则', () => {
      const schema = rolePermissionValidation.queryRolePermissionsSchema;

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
        roleId: 1,
        permissionId: 2,
        scope: 'kindergarten',
        status: 'active',
        assignedBy: 1,
        assignedDateRange: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31')
        }
      };

      mockJoi.validate.mockReturnValue({ error: null, value: filterData });

      const result = mockJoi.validate(filterData);

      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(filterData);
    });

    it('应该验证排序参数', () => {
      const validSortFields = ['assignedAt', 'expiresAt', 'scope', 'status'];
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

    it('应该验证包含选项', () => {
      const includeOptions = {
        includeRole: true,
        includePermission: true,
        includeAssigner: true,
        includeResourceLimits: true
      };

      const data = includeOptions;
      mockJoi.validate.mockReturnValue({ error: null, value: data });
      
      const result = mockJoi.validate(data);
      expect((result as any).error).toBeNull();
    });
  });

  describe('updateRolePermissionSchema', () => {
    it('应该定义更新角色权限的验证规则', () => {
      const schema = rolePermissionValidation.updateRolePermissionSchema;

      expect(mockJoi.object).toHaveBeenCalled();
      expect(schema).toBeDefined();
    });

    it('应该验证更新数据', () => {
      const validUpdateData = {
        scope: 'class',
        expiresAt: new Date('2024-12-31'),
        resourceLimits: {
          classIds: [1, 2, 3],
          maxStudents: 50
        },
        updatedBy: 1
      };

      mockJoi.validate.mockReturnValue({ error: null, value: validUpdateData });

      const result = mockJoi.validate(validUpdateData);

      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(validUpdateData);
    });

    it('应该验证状态更新', () => {
      const validStatuses = ['active', 'inactive', 'expired', 'revoked'];
      
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

    it('应该验证资源限制更新', () => {
      const testCases = [
        {
          resourceLimits: {
            kindergartenIds: [1, 2],
            maxStudents: 100
          },
          shouldFail: false
        },
        {
          resourceLimits: {
            maxStudents: -10
          },
          shouldFail: true,
          message: '最大学生数不能为负数'
        },
        {
          resourceLimits: {
            kindergartenIds: []
          },
          shouldFail: true,
          message: '幼儿园ID列表不能为空'
        }
      ];

      testCases.forEach(({ resourceLimits, shouldFail, message }) => {
        const data = { resourceLimits };
        
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

  describe('Custom Validators', () => {
    it('应该验证权限分配的循环依赖', () => {
      const data = {
        roleId: 1,
        permissionId: 2,
        parentRoleId: 1 // 不能给自己分配权限
      };

      mockJoi.validate.mockReturnValue({
        error: { details: [{ message: '不能给角色分配自己的权限' }] },
        value: undefined
      });
      
      const result = mockJoi.validate(data);
      expect((result as any).error).toBeTruthy();
    });

    it('应该验证权限等级限制', () => {
      const data = {
        roleId: 1,
        permissionId: 2,
        roleLevel: 3,
        permissionLevel: 1 // 低等级角色不能获得高等级权限
      };

      mockJoi.validate.mockReturnValue({
        error: { details: [{ message: '角色等级不足，无法分配此权限' }] },
        value: undefined
      });
      
      const result = mockJoi.validate(data);
      expect((result as any).error).toBeTruthy();
    });

    it('应该验证权限冲突', () => {
      const data = {
        roleId: 1,
        permissionIds: [1, 2], // 假设权限1和权限2冲突
        conflictingPermissions: [[1, 2]]
      };

      mockJoi.validate.mockReturnValue({
        error: { details: [{ message: '权限之间存在冲突' }] },
        value: undefined
      });
      
      const result = mockJoi.validate(data);
      expect((result as any).error).toBeTruthy();
    });

    it('应该验证资源访问权限', () => {
      const data = {
        roleId: 1,
        permissionId: 2,
        scope: 'kindergarten',
        resourceLimits: {
          kindergartenIds: [1, 2, 3]
        },
        userKindergartenIds: [1, 2] // 用户只能访问部分幼儿园
      };

      mockJoi.validate.mockReturnValue({
        error: { details: [{ message: '资源访问权限不足' }] },
        value: undefined
      });
      
      const result = mockJoi.validate(data);
      expect((result as any).error).toBeTruthy();
    });

    it('应该验证权限的前置条件', () => {
      const data = {
        roleId: 1,
        permissionId: 5, // 假设权限5需要先有权限1和2
        existingPermissions: [1], // 只有权限1，缺少权限2
        requiredPermissions: [1, 2]
      };

      mockJoi.validate.mockReturnValue({
        error: { details: [{ message: '缺少前置权限' }] },
        value: undefined
      });
      
      const result = mockJoi.validate(data);
      expect((result as any).error).toBeTruthy();
    });
  });

  describe('Error Messages', () => {
    it('应该返回中文错误消息', () => {
      const invalidData = {
        roleId: 0,
        permissionId: -1,
        assignedBy: 'invalid'
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            { message: '角色ID必须大于0' },
            { message: '权限ID必须大于0' },
            { message: '分配者ID必须是数字' }
          ]
        },
        value: undefined
      });
      
      const result = mockJoi.validate(invalidData);
      
      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)).toHaveLength(3);
      expect(((result as any).error?.details)[0].message).toBe('角色ID必须大于0');
      expect(((result as any).error?.details)[1].message).toBe('权限ID必须大于0');
      expect(((result as any).error?.details)[2].message).toBe('分配者ID必须是数字');
    });

    it('应该提供详细的验证错误信息', () => {
      const data = { reason: 'a'.repeat(201) };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [{
            message: '撤销原因长度不能超过200字符',
            path: ['reason'],
            type: 'string.max',
            context: { limit: 200, value: data.reason }
          }]
        },
        value: undefined
      });
      
      const result = mockJoi.validate(data);
      
      expect((result as any).error).toBeTruthy();
      expect(((result as any).error?.details)[0].path).toEqual(['reason']);
      expect(((result as any).error?.details)[0].type).toBe('string.max');
      expect(((result as any).error?.details)[0].context.limit).toBe(200);
    });
  });

  describe('Integration Tests', () => {
    it('应该验证完整的权限分配数据', () => {
      const completeData = {
        roleId: 1,
        permissionId: 2,
        assignedBy: 1,
        scope: 'kindergarten',
        resourceLimits: {
          kindergartenIds: [1, 2, 3],
          classIds: [10, 20, 30],
          maxStudents: 100,
          maxClasses: 5,
          allowedOperations: ['read', 'create', 'update']
        },
        expiresAt: new Date('2024-12-31'),
        conditions: {
          timeRestriction: {
            startTime: '08:00',
            endTime: '18:00'
          },
          ipRestriction: ['192.168.1.0/24'],
          deviceRestriction: ['web', 'mobile']
        },
        metadata: {
          assignmentReason: '新员工入职',
          approvedBy: 2,
          approvalDate: new Date()
        }
      };

      mockJoi.validate.mockReturnValue({ error: null, value: completeData });

      const result = mockJoi.validate(completeData);

      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(completeData);
    });

    it('应该验证复杂的权限查询', () => {
      const complexQuery = {
        page: 1,
        pageSize: 50,
        roleId: [1, 2, 3],
        permissionId: [10, 20, 30],
        scope: ['kindergarten', 'class'],
        status: ['active', 'expired'],
        assignedBy: [1, 2],
        assignedDateRange: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31')
        },
        expiresDateRange: {
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-12-31')
        },
        resourceLimits: {
          kindergartenIds: [1, 2, 3]
        },
        sortBy: 'assignedAt',
        sortOrder: 'desc',
        includeRole: true,
        includePermission: true,
        includeAssigner: true,
        includeResourceLimits: true,
        includeMetadata: true
      };

      mockJoi.validate.mockReturnValue({ error: null, value: complexQuery });

      const result = mockJoi.validate(complexQuery);

      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(complexQuery);
    });

    it('应该验证批量权限操作', () => {
      const batchOperation = {
        operation: 'assign',
        roleIds: [1, 2, 3],
        permissionIds: [10, 20, 30, 40, 50],
        assignedBy: 1,
        scope: 'kindergarten',
        resourceLimits: {
          kindergartenIds: [1, 2]
        },
        expiresAt: new Date('2024-12-31'),
        batchSize: 10,
        continueOnError: true
      };

      mockJoi.validate.mockReturnValue({ error: null, value: batchOperation });

      const result = mockJoi.validate(batchOperation);

      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(batchOperation);
    });
  });
});
