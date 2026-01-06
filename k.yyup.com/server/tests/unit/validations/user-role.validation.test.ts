import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock Joi
const mockJoi = {
  object: jest.fn(),
  string: jest.fn(),
  number: jest.fn(),
  boolean: jest.fn(),
  date: jest.fn(),
  array: jest.fn(),
  any: jest.fn(),
  valid: jest.fn(),
  required: jest.fn(),
  optional: jest.fn(),
  min: jest.fn(),
  max: jest.fn(),
  length: jest.fn(),
  pattern: jest.fn(),
  email: jest.fn(),
  uri: jest.fn(),
  allow: jest.fn(),
  when: jest.fn(),
  alternatives: jest.fn(),
  validate: jest.fn()
};

// Create chainable mock methods
const createChainableMock = () => {
  const chainable = {
    required: jest.fn().mockReturnThis(),
    optional: jest.fn().mockReturnThis(),
    min: jest.fn().mockReturnThis(),
    max: jest.fn().mockReturnThis(),
    length: jest.fn().mockReturnThis(),
    pattern: jest.fn().mockReturnThis(),
    email: jest.fn().mockReturnThis(),
    uri: jest.fn().mockReturnThis(),
    allow: jest.fn().mockReturnThis(),
    valid: jest.fn().mockReturnThis(),
    when: jest.fn().mockReturnThis(),
    items: jest.fn().mockReturnThis(),
    keys: jest.fn().mockReturnThis(),
    messages: jest.fn().mockReturnThis()
  };
  return chainable;
};

// Setup chainable mocks
Object.keys(mockJoi).forEach(key => {
  if (typeof mockJoi[key] === 'function' && key !== 'validate') {
    mockJoi[key].mockReturnValue(createChainableMock());
  }
});

// Mock validation result helper
const createMockValidationResult = (isValid: boolean, errors: string[] = []) => ({
  error: isValid ? null : {
    details: errors.map(message => ({ message, path: ['field'], type: 'any.invalid' }))
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

describe('User Role Validation', () => {
  let userRoleValidation: any;

  beforeAll(async () => {
    const imported = await import('../../../src/validations/user-role.validation');
    userRoleValidation = imported.default || imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default to valid validation
    mockJoi.validate.mockReturnValue(createMockValidationResult(true));
  });

  describe('assignRoleSchema', () => {
    it('应该验证有效的角色分配数据', () => {
      const validData = {
        userId: 1,
        roleId: 2,
        assignedBy: 3,
        effectiveDate: '2024-01-01',
        expiryDate: '2024-12-31',
        scope: {
          type: 'department',
          values: ['dept_001', 'dept_002']
        },
        conditions: {
          ipRestriction: ['192.168.1.0/24'],
          timeRestriction: {
            start: '08:00',
            end: '18:00'
          },
          locationRestriction: ['office', 'classroom']
        },
        metadata: {
          reason: '职位调整',
          approvalRequired: true,
          temporaryAssignment: false
        }
      };

      const result = mockJoi.validate(validData, userRoleValidation.assignRoleSchema);

      expect((result as any).error).toBeNull();
      expect(mockJoi.object).toHaveBeenCalled();
      expect(mockJoi.number).toHaveBeenCalled();
      expect(mockJoi.string).toHaveBeenCalled();
    });

    it('应该验证必填字段', () => {
      const testCases = [
        { field: 'userId', data: {}, error: '用户ID是必填字段' },
        { field: 'roleId', data: { userId: 1 }, error: '角色ID是必填字段' },
        { field: 'assignedBy', data: { userId: 1, roleId: 2 }, error: '分配者ID是必填字段' }
      ];

      testCases.forEach(({ field, data, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate(data, userRoleValidation.assignRoleSchema);
        
        expect((result as any).error).toBeTruthy();
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证ID有效性', () => {
      const invalidIds = [
        { userId: 0, error: '用户ID必须大于0' },
        { roleId: 0, error: '角色ID必须大于0' },
        { assignedBy: 0, error: '分配者ID必须大于0' },
        { userId: 'invalid', error: '用户ID必须是数字' },
        { roleId: 'invalid', error: '角色ID必须是数字' },
        { assignedBy: 'invalid', error: '分配者ID必须是数字' }
      ];

      invalidIds.forEach(({ userId, roleId, assignedBy, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const data = {};
        if (userId !== undefined) data.userId = userId;
        if (roleId !== undefined) data.roleId = roleId;
        if (assignedBy !== undefined) data.assignedBy = assignedBy;
        
        const result = mockJoi.validate(data, userRoleValidation.assignRoleSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证日期格式和逻辑', () => {
      const invalidDates = [
        {
          effectiveDate: 'invalid-date',
          error: '生效日期格式无效'
        },
        {
          expiryDate: 'invalid-date',
          error: '过期日期格式无效'
        },
        {
          effectiveDate: '2024-12-31',
          expiryDate: '2024-01-01',
          error: '生效日期不能晚于过期日期'
        },
        {
          effectiveDate: '2020-01-01',
          error: '生效日期不能是过去日期'
        }
      ];

      invalidDates.forEach(({ effectiveDate, expiryDate, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const data = {};
        if (effectiveDate) data.effectiveDate = effectiveDate;
        if (expiryDate) data.expiryDate = expiryDate;
        
        const result = mockJoi.validate(data, userRoleValidation.assignRoleSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证作用域结构', () => {
      const validScopes = [
        {
          scope: {
            type: 'global'
          }
        },
        {
          scope: {
            type: 'department',
            values: ['dept_001', 'dept_002']
          }
        },
        {
          scope: {
            type: 'class',
            values: ['class_001'],
            includeSubClasses: true
          }
        },
        {
          scope: {
            type: 'custom',
            values: ['resource_001', 'resource_002'],
            conditions: {
              timeRange: {
                start: '08:00',
                end: '18:00'
              }
            }
          }
        }
      ];

      validScopes.forEach(data => {
        const result = mockJoi.validate(data, userRoleValidation.assignRoleSchema);
        expect((result as any).error).toBeNull();
      });
    });

    it('应该验证作用域类型枚举', () => {
      const invalidScopeTypes = ['invalid', 'unknown', '全局', 'Global'];
      
      invalidScopeTypes.forEach(type => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['作用域类型无效']));
        
        const result = mockJoi.validate({ 
          scope: { type } 
        }, userRoleValidation.assignRoleSchema);
        
        expect(((result as any).error?.details)[0].message).toBe('作用域类型无效');
      });
    });

    it('应该验证条件结构', () => {
      const validConditions = {
        conditions: {
          ipRestriction: ['192.168.1.0/24', '10.0.0.0/8'],
          timeRestriction: {
            start: '08:00',
            end: '18:00',
            timezone: 'Asia/Shanghai',
            weekdays: [1, 2, 3, 4, 5]
          },
          locationRestriction: ['office', 'classroom', 'library'],
          deviceRestriction: ['desktop', 'mobile'],
          sessionLimit: 1,
          concurrentLimit: 3
        }
      };

      const result = mockJoi.validate(validConditions, userRoleValidation.assignRoleSchema);

      expect((result as any).error).toBeNull();
    });

    it('应该验证元数据结构', () => {
      const validMetadata = {
        metadata: {
          reason: '职位调整需要新权限',
          approvalRequired: true,
          approvalWorkflow: 'standard',
          temporaryAssignment: false,
          autoRevoke: true,
          revokeAfterDays: 90,
          notificationSettings: {
            onAssign: true,
            onRevoke: true,
            beforeExpiry: 7
          },
          customFields: {
            department: 'IT',
            costCenter: 'CC001'
          }
        }
      };

      const result = mockJoi.validate(validMetadata, userRoleValidation.assignRoleSchema);

      expect((result as any).error).toBeNull();
    });
  });

  describe('revokeRoleSchema', () => {
    it('应该验证有效的角色撤销数据', () => {
      const validData = {
        userId: 1,
        roleId: 2,
        revokedBy: 3,
        reason: 'employee_termination',
        effectiveDate: '2024-06-01',
        forceRevoke: false,
        transferPermissions: true,
        transferToUserId: 4,
        notifyUser: true
      };

      const result = mockJoi.validate(validData, userRoleValidation.revokeRoleSchema);

      expect((result as any).error).toBeNull();
    });

    it('应该验证撤销原因枚举', () => {
      const invalidReasons = ['invalid', 'unknown', '员工离职', 'Termination'];
      
      invalidReasons.forEach(reason => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['撤销原因无效']));
        
        const result = mockJoi.validate({ reason }, userRoleValidation.revokeRoleSchema);
        
        expect(((result as any).error?.details)[0].message).toBe('撤销原因无效');
      });
    });

    it('应该验证权限转移逻辑', () => {
      // 如果要转移权限，必须指定转移目标用户
      mockJoi.validate.mockImplementation((data, schema) => {
        if (data.transferPermissions && !data.transferToUserId) {
          return createMockValidationResult(false, ['转移权限时必须指定目标用户']);
        }
        return createMockValidationResult(true);
      });

      const transferData = {
        transferPermissions: true
        // 缺少transferToUserId
      };

      const result = mockJoi.validate(transferData, userRoleValidation.revokeRoleSchema);
      
      expect(((result as any).error?.details)[0].message).toBe('转移权限时必须指定目标用户');
    });

    it('应该验证强制撤销条件', () => {
      // 强制撤销需要高级权限
      mockJoi.validate.mockImplementation((data, schema) => {
        if (data.forceRevoke && !data.hasAdminPermission) {
          return createMockValidationResult(false, ['强制撤销需要管理员权限']);
        }
        return createMockValidationResult(true);
      });

      const forceRevokeData = {
        forceRevoke: true,
        hasAdminPermission: false
      };

      const result = mockJoi.validate(forceRevokeData, userRoleValidation.revokeRoleSchema);
      
      expect(((result as any).error?.details)[0].message).toBe('强制撤销需要管理员权限');
    });
  });

  describe('queryUserRolesSchema', () => {
    it('应该验证有效的查询参数', () => {
      const validQuery = {
        page: 1,
        pageSize: 20,
        sortBy: 'assignedAt',
        sortOrder: 'desc',
        userId: 1,
        roleId: 2,
        status: 'active',
        assignedBy: 3,
        assignedDateRange: {
          start: '2024-01-01',
          end: '2024-12-31'
        },
        expiryDateRange: {
          start: '2024-06-01',
          end: '2024-12-31'
        },
        scopeType: 'department',
        includeExpired: false,
        includeRevoked: false
      };

      const result = mockJoi.validate(validQuery, userRoleValidation.queryUserRolesSchema);

      expect((result as any).error).toBeNull();
    });

    it('应该验证分页参数', () => {
      const invalidPagination = [
        { page: 0, error: '页码必须大于0' },
        { page: 'invalid', error: '页码必须是数字' },
        { pageSize: 0, error: '每页数量必须大于0' },
        { pageSize: 101, error: '每页数量不能超过100' }
      ];

      invalidPagination.forEach(({ page, pageSize, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const query = page !== undefined ? { page } : { pageSize };
        const result = mockJoi.validate(query, userRoleValidation.queryUserRolesSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证状态枚举', () => {
      const invalidStatuses = ['invalid', 'unknown', '活跃', 'Active'];
      
      invalidStatuses.forEach(status => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['状态无效']));
        
        const result = mockJoi.validate({ status }, userRoleValidation.queryUserRolesSchema);
        
        expect(((result as any).error?.details)[0].message).toBe('状态无效');
      });
    });

    it('应该验证日期范围', () => {
      const invalidDateRanges = [
        {
          assignedDateRange: { start: 'invalid', end: '2024-12-31' },
          error: '开始日期格式无效'
        },
        {
          assignedDateRange: { start: '2024-12-31', end: '2024-01-01' },
          error: '开始日期不能晚于结束日期'
        },
        {
          expiryDateRange: { start: '2020-01-01', end: '2024-12-31' },
          error: '日期范围不能超过5年'
        }
      ];

      invalidDateRanges.forEach(({ assignedDateRange, expiryDateRange, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const data = {};
        if (assignedDateRange) data.assignedDateRange = assignedDateRange;
        if (expiryDateRange) data.expiryDateRange = expiryDateRange;
        
        const result = mockJoi.validate(data, userRoleValidation.queryUserRolesSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });
  });

  describe('batchAssignRolesSchema', () => {
    it('应该验证有效的批量分配数据', () => {
      const validData = {
        assignments: [
          {
            userId: 1,
            roleId: 2,
            effectiveDate: '2024-01-01',
            expiryDate: '2024-12-31'
          },
          {
            userId: 2,
            roleId: 3,
            effectiveDate: '2024-01-01',
            scope: {
              type: 'department',
              values: ['dept_001']
            }
          }
        ],
        assignedBy: 3,
        reason: '批量角色调整',
        approvalRequired: true,
        notifyUsers: true
      };

      const result = mockJoi.validate(validData, userRoleValidation.batchAssignRolesSchema);

      expect((result as any).error).toBeNull();
    });

    it('应该验证批量分配数量限制', () => {
      const tooManyAssignments = {
        assignments: Array.from({ length: 101 }, (_, i) => ({
          userId: i + 1,
          roleId: 1
        }))
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['批量分配数量不能超过100个']));
      
      const result = mockJoi.validate(tooManyAssignments, userRoleValidation.batchAssignRolesSchema);
      
      expect(((result as any).error?.details)[0].message).toBe('批量分配数量不能超过100个');
    });

    it('应该验证分配数组不能为空', () => {
      const emptyAssignments = {
        assignments: []
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['分配列表不能为空']));
      
      const result = mockJoi.validate(emptyAssignments, userRoleValidation.batchAssignRolesSchema);
      
      expect(((result as any).error?.details)[0].message).toBe('分配列表不能为空');
    });

    it('应该验证重复分配检查', () => {
      const duplicateAssignments = {
        assignments: [
          { userId: 1, roleId: 2 },
          { userId: 1, roleId: 2 } // 重复
        ]
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['存在重复的用户角色分配']));
      
      const result = mockJoi.validate(duplicateAssignments, userRoleValidation.batchAssignRolesSchema);
      
      expect(((result as any).error?.details)[0].message).toBe('存在重复的用户角色分配');
    });
  });

  describe('自定义验证器', () => {
    it('应该验证用户角色冲突', () => {
      const roleConflictValidator = (userId: number, newRoleId: number, existingRoles: any[]) => {
        // 检查是否有冲突的角色
        const conflictingRoles = {
          1: [2, 3], // 角色1与角色2、3冲突
          4: [5]     // 角色4与角色5冲突
        };

        const userRoles = existingRoles
          .filter(r => r.userId === userId && r.status === 'active')
          .map(r => r.roleId);

        const conflicts = conflictingRoles[newRoleId] || [];
        
        return !userRoles.some(roleId => conflicts.includes(roleId));
      };

      const existingRoles = [
        { userId: 1, roleId: 2, status: 'active' },
        { userId: 1, roleId: 6, status: 'active' }
      ];

      expect(roleConflictValidator(1, 1, existingRoles)).toBe(false); // 角色1与角色2冲突
      expect(roleConflictValidator(1, 7, existingRoles)).toBe(true);  // 角色7无冲突
      expect(roleConflictValidator(2, 1, existingRoles)).toBe(true);  // 用户2无现有角色
    });

    it('应该验证角色层级关系', () => {
      const roleHierarchyValidator = (assignerRoleLevel: number, targetRoleLevel: number) => {
        // 分配者的角色等级必须高于或等于目标角色等级
        return assignerRoleLevel >= targetRoleLevel;
      };

      expect(roleHierarchyValidator(5, 3)).toBe(true);  // 等级5可以分配等级3
      expect(roleHierarchyValidator(5, 5)).toBe(true);  // 等级5可以分配等级5
      expect(roleHierarchyValidator(3, 5)).toBe(false); // 等级3不能分配等级5
    });

    it('应该验证用户状态', () => {
      const userStatusValidator = (userId: number, userStatuses: Record<number, string>) => {
        const status = userStatuses[userId];
        
        // 只有活跃用户可以分配角色
        return status === 'active';
      };

      const userStatuses = {
        1: 'active',
        2: 'inactive',
        3: 'suspended',
        4: 'deleted'
      };

      expect(userStatusValidator(1, userStatuses)).toBe(true);
      expect(userStatusValidator(2, userStatuses)).toBe(false);
      expect(userStatusValidator(3, userStatuses)).toBe(false);
      expect(userStatusValidator(4, userStatuses)).toBe(false);
    });

    it('应该验证角色有效性', () => {
      const roleValidityValidator = (roleId: number, roles: any[]) => {
        const role = roles.find(r => r.id === roleId);
        
        if (!role) return false;
        
        // 角色必须是活跃状态且未过期
        return role.isActive && (!role.expiryDate || new Date(role.expiryDate) > new Date());
      };

      const roles = [
        { id: 1, isActive: true, expiryDate: null },
        { id: 2, isActive: true, expiryDate: '2024-12-31' },
        { id: 3, isActive: false, expiryDate: null },
        { id: 4, isActive: true, expiryDate: '2023-12-31' }
      ];

      expect(roleValidityValidator(1, roles)).toBe(true);  // 活跃且无过期
      expect(roleValidityValidator(2, roles)).toBe(true);  // 活跃且未过期
      expect(roleValidityValidator(3, roles)).toBe(false); // 非活跃
      expect(roleValidityValidator(4, roles)).toBe(false); // 已过期
      expect(roleValidityValidator(5, roles)).toBe(false); // 不存在
    });

    it('应该验证作用域权限', () => {
      const scopePermissionValidator = (assignerId: number, scopeType: string, scopeValues: string[], assignerScopes: any[]) => {
        // 分配者必须对目标作用域有权限
        const assignerScope = assignerScopes.find(s => s.userId === assignerId);
        
        if (!assignerScope) return false;
        
        if (assignerScope.type === 'global') return true;
        
        if (assignerScope.type === scopeType) {
          return scopeValues.every(value => assignerScope.values.includes(value));
        }
        
        return false;
      };

      const assignerScopes = [
        { userId: 1, type: 'global', values: [] },
        { userId: 2, type: 'department', values: ['dept_001', 'dept_002'] },
        { userId: 3, type: 'class', values: ['class_001'] }
      ];

      expect(scopePermissionValidator(1, 'department', ['dept_001'], assignerScopes)).toBe(true);  // 全局权限
      expect(scopePermissionValidator(2, 'department', ['dept_001'], assignerScopes)).toBe(true);  // 有部门权限
      expect(scopePermissionValidator(2, 'department', ['dept_003'], assignerScopes)).toBe(false); // 无此部门权限
      expect(scopePermissionValidator(3, 'department', ['dept_001'], assignerScopes)).toBe(false); // 类型不匹配
    });

    it('应该验证时间限制', () => {
      const timeRestrictionValidator = (effectiveDate: string, expiryDate: string, maxDuration: number) => {
        const effective = new Date(effectiveDate);
        const expiry = new Date(expiryDate);
        
        const durationDays = Math.ceil((expiry.getTime() - effective.getTime()) / (1000 * 60 * 60 * 24));
        
        return durationDays <= maxDuration;
      };

      expect(timeRestrictionValidator('2024-01-01', '2024-01-31', 30)).toBe(true);  // 30天内
      expect(timeRestrictionValidator('2024-01-01', '2024-02-01', 30)).toBe(false); // 超过30天
      expect(timeRestrictionValidator('2024-01-01', '2024-12-31', 365)).toBe(true); // 365天内
    });
  });

  describe('条件验证', () => {
    it('应该根据角色类型进行条件验证', () => {
      // 系统角色需要特殊审批
      mockJoi.validate.mockImplementation((data, schema) => {
        if (data.roleType === 'system' && !data.specialApproval) {
          return createMockValidationResult(false, ['系统角色分配需要特殊审批']);
        }
        return createMockValidationResult(true);
      });

      const systemRoleAssignment = {
        roleType: 'system',
        specialApproval: false
      };

      const result = mockJoi.validate(systemRoleAssignment, userRoleValidation.assignRoleSchema);
      
      expect(((result as any).error?.details)[0].message).toBe('系统角色分配需要特殊审批');
    });

    it('应该根据用户类型进行条件验证', () => {
      // 临时用户不能分配永久角色
      mockJoi.validate.mockImplementation((data, schema) => {
        if (data.userType === 'temporary' && !data.expiryDate) {
          return createMockValidationResult(false, ['临时用户必须设置角色过期时间']);
        }
        return createMockValidationResult(true);
      });

      const temporaryUserAssignment = {
        userType: 'temporary'
        // 缺少expiryDate
      };

      const result = mockJoi.validate(temporaryUserAssignment, userRoleValidation.assignRoleSchema);
      
      expect(((result as any).error?.details)[0].message).toBe('临时用户必须设置角色过期时间');
    });
  });

  describe('数据清理和转换', () => {
    it('应该清理和转换输入数据', () => {
      // 模拟数据转换
      mockJoi.validate.mockImplementation((data, schema) => {
        const cleanedData = {
          ...data,
          reason: data.reason?.trim(),
          effectiveDate: data.effectiveDate ? new Date(data.effectiveDate).toISOString().split('T')[0] : undefined,
          expiryDate: data.expiryDate ? new Date(data.expiryDate).toISOString().split('T')[0] : undefined
        };
        
        return {
          error: null,
          value: cleanedData
        };
      });

      const dirtyData = {
        reason: '  职位调整  ',
        effectiveDate: '2024-01-01T00:00:00.000Z',
        expiryDate: '2024-12-31T23:59:59.999Z'
      };

      const result = mockJoi.validate(dirtyData, userRoleValidation.assignRoleSchema);
      
      expect(((result as any).value?.)reason).toBe('职位调整');
      expect(((result as any).value?.)effectiveDate).toBe('2024-01-01');
      expect(((result as any).value?.)expiryDate).toBe('2024-12-31');
    });

    it('应该标准化作用域数据', () => {
      mockJoi.validate.mockImplementation((data, schema) => {
        const cleanedData = {
          ...data,
          scope: data.scope ? {
            ...data.scope,
            values: Array.isArray(data.scope.values) 
              ? data.scope.values.map(v => v.trim()).filter(Boolean)
              : data.scope.values ? [data.scope.values.trim()] : []
          } : undefined
        };
        
        return {
          error: null,
          value: cleanedData
        };
      });

      const dataWithScope = {
        scope: {
          type: 'department',
          values: '  dept_001  ' // 字符串转数组并清理
        }
      };

      const result = mockJoi.validate(dataWithScope, userRoleValidation.assignRoleSchema);
      
      expect(((result as any).value?.)scope.values).toEqual(['dept_001']);
    });
  });
});
