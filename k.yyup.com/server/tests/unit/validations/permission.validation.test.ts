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

describe('Permission Validation', () => {
  let permissionValidation: any;

  beforeAll(async () => {
    const imported = await import('../../../src/validations/permission.validation');
    permissionValidation = imported.default || imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default to valid validation
    mockJoi.validate.mockReturnValue(createMockValidationResult(true));
  });

  describe('createPermissionSchema', () => {
    it('应该验证有效的权限创建数据', () => {
      const validData = {
        code: 'user:read',
        name: '用户查看',
        description: '查看用户信息的权限',
        resource: 'user',
        action: 'read',
        category: 'basic',
        level: 1,
        conditions: {
          own: true,
          department: ['education', 'administration'],
          timeRange: {
            start: '08:00',
            end: '18:00'
          }
        },
        metadata: {
          riskLevel: 'low',
          auditRequired: false,
          ipRestriction: false
        }
      };

      const result = mockJoi.validate(validData, permissionValidation.createPermissionSchema);

      expect((result as any).error).toBeNull();
      expect(mockJoi.object).toHaveBeenCalled();
      expect(mockJoi.string).toHaveBeenCalled();
      expect(mockJoi.number).toHaveBeenCalled();
    });

    it('应该验证必填字段', () => {
      const testCases = [
        { field: 'code', data: {}, error: '权限代码是必填字段' },
        { field: 'name', data: { code: 'user:read' }, error: '权限名称是必填字段' },
        { field: 'resource', data: { code: 'user:read', name: '用户查看' }, error: '资源类型是必填字段' },
        { field: 'action', data: { code: 'user:read', name: '用户查看', resource: 'user' }, error: '操作类型是必填字段' }
      ];

      testCases.forEach(({ field, data, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate(data, permissionValidation.createPermissionSchema);
        
        expect((result as any).error).toBeTruthy();
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证权限代码格式', () => {
      const invalidCodes = [
        { code: '', error: '权限代码不能为空' },
        { code: 'invalid', error: '权限代码格式无效，应为 resource:action 格式' },
        { code: 'user:', error: '权限代码格式无效，应为 resource:action 格式' },
        { code: ':read', error: '权限代码格式无效，应为 resource:action 格式' },
        { code: 'User:Read', error: '权限代码必须是小写字母' },
        { code: 'user-profile:read', error: '权限代码只能包含字母、数字和下划线' },
        { code: 'a'.repeat(101), error: '权限代码长度不能超过100个字符' }
      ];

      invalidCodes.forEach(({ code, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ code }, permissionValidation.createPermissionSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证权限名称格式', () => {
      const invalidNames = [
        { name: '', error: '权限名称不能为空' },
        { name: 'a', error: '权限名称长度必须在2-100个字符之间' },
        { name: 'a'.repeat(101), error: '权限名称长度必须在2-100个字符之间' }
      ];

      invalidNames.forEach(({ name, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ name }, permissionValidation.createPermissionSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证资源类型枚举', () => {
      const invalidResources = ['invalid', 'unknown', '用户', 'User'];
      
      invalidResources.forEach(resource => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['资源类型无效']));
        
        const result = mockJoi.validate({ resource }, permissionValidation.createPermissionSchema);
        
        expect(((result as any).error?.details)[0].message).toBe('资源类型无效');
      });
    });

    it('应该验证操作类型枚举', () => {
      const invalidActions = ['invalid', 'unknown', '读取', 'Read'];
      
      invalidActions.forEach(action => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['操作类型无效']));
        
        const result = mockJoi.validate({ action }, permissionValidation.createPermissionSchema);
        
        expect(((result as any).error?.details)[0].message).toBe('操作类型无效');
      });
    });

    it('应该验证权限类别枚举', () => {
      const invalidCategories = ['invalid', 'unknown', '基础', 'Basic'];
      
      invalidCategories.forEach(category => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['权限类别无效']));
        
        const result = mockJoi.validate({ category }, permissionValidation.createPermissionSchema);
        
        expect(((result as any).error?.details)[0].message).toBe('权限类别无效');
      });
    });

    it('应该验证权限等级范围', () => {
      const invalidLevels = [
        { level: 0, error: '权限等级必须在1-10之间' },
        { level: 11, error: '权限等级必须在1-10之间' },
        { level: -1, error: '权限等级必须在1-10之间' },
        { level: 'high', error: '权限等级必须是数字' }
      ];

      invalidLevels.forEach(({ level, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ level }, permissionValidation.createPermissionSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证权限条件结构', () => {
      const validConditions = {
        conditions: {
          own: true,
          department: ['education', 'administration'],
          role: ['teacher', 'principal'],
          timeRange: {
            start: '08:00',
            end: '18:00'
          },
          ipRange: ['192.168.1.0/24'],
          location: ['office', 'classroom'],
          dataScope: {
            type: 'department',
            values: ['dept_001', 'dept_002']
          }
        }
      };

      const result = mockJoi.validate(validConditions, permissionValidation.createPermissionSchema);

      expect((result as any).error).toBeNull();
    });

    it('应该验证元数据结构', () => {
      const validMetadata = {
        metadata: {
          riskLevel: 'medium',
          auditRequired: true,
          ipRestriction: true,
          sessionTimeout: 3600,
          maxConcurrentSessions: 1,
          requireMFA: false,
          allowedDevices: ['desktop', 'mobile'],
          customFields: {
            businessUnit: 'education',
            costCenter: 'CC001'
          }
        }
      };

      const result = mockJoi.validate(validMetadata, permissionValidation.createPermissionSchema);

      expect((result as any).error).toBeNull();
    });

    it('应该验证描述长度', () => {
      const invalidDescriptions = [
        { description: 'a'.repeat(501), error: '描述不能超过500个字符' }
      ];

      invalidDescriptions.forEach(({ description, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ description }, permissionValidation.createPermissionSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });
  });

  describe('updatePermissionSchema', () => {
    it('应该验证有效的权限更新数据', () => {
      const validUpdateData = {
        name: '用户管理',
        description: '管理用户信息的权限',
        level: 2,
        conditions: {
          own: false,
          department: ['education']
        },
        metadata: {
          riskLevel: 'high',
          auditRequired: true
        }
      };

      const result = mockJoi.validate(validUpdateData, permissionValidation.updatePermissionSchema);

      expect((result as any).error).toBeNull();
    });

    it('应该允许部分字段更新', () => {
      const partialUpdateData = {
        name: '新权限名称'
      };

      const result = mockJoi.validate(partialUpdateData, permissionValidation.updatePermissionSchema);

      expect((result as any).error).toBeNull();
    });

    it('应该禁止更新某些敏感字段', () => {
      const sensitiveFields = [
        { field: 'id', value: 999, error: '不能更新权限ID' },
        { field: 'code', value: 'new_code', error: '不能更新权限代码' },
        { field: 'resource', value: 'new_resource', error: '不能更新资源类型' },
        { field: 'action', value: 'new_action', error: '不能更新操作类型' },
        { field: 'createdAt', value: new Date(), error: '不能更新创建时间' }
      ];

      sensitiveFields.forEach(({ field, value, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ [field]: value }, permissionValidation.updatePermissionSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证系统权限更新限制', () => {
      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['系统权限不能修改']));
      
      const result = mockJoi.validate({
        isSystem: true,
        name: '新名称'
      }, permissionValidation.updatePermissionSchema);
      
      expect(((result as any).error?.details)[0].message).toBe('系统权限不能修改');
    });

    it('应该验证权限等级提升限制', () => {
      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['不能提升权限等级']));
      
      const result = mockJoi.validate({
        currentLevel: 3,
        level: 5
      }, permissionValidation.updatePermissionSchema);
      
      expect(((result as any).error?.details)[0].message).toBe('不能提升权限等级');
    });
  });

  describe('queryPermissionsSchema', () => {
    it('应该验证有效的查询参数', () => {
      const validQuery = {
        page: 1,
        pageSize: 20,
        sortBy: 'level',
        sortOrder: 'desc',
        search: 'user',
        resource: 'user',
        action: 'read',
        category: 'basic',
        level: {
          min: 1,
          max: 5
        },
        isActive: true,
        isSystem: false,
        riskLevel: 'low'
      };

      const result = mockJoi.validate(validQuery, permissionValidation.queryPermissionsSchema);

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
        const result = mockJoi.validate(query, permissionValidation.queryPermissionsSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证排序参数', () => {
      const validSortFields = ['code', 'name', 'resource', 'action', 'level', 'createdAt'];
      const invalidSort = [
        { sortBy: 'invalid_field', error: '排序字段无效' },
        { sortOrder: 'invalid', error: '排序方向必须是 asc 或 desc' }
      ];

      invalidSort.forEach(({ sortBy, sortOrder, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const query = sortBy ? { sortBy } : { sortOrder };
        const result = mockJoi.validate(query, permissionValidation.queryPermissionsSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证等级范围', () => {
      const invalidLevelRanges = [
        { 
          level: { min: 10, max: 5 }, 
          error: '最小等级不能大于最大等级' 
        },
        { 
          level: { min: 0, max: 5 }, 
          error: '等级不能小于1' 
        },
        { 
          level: { min: 1, max: 15 }, 
          error: '等级不能大于10' 
        }
      ];

      invalidLevelRanges.forEach(({ level, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ level }, permissionValidation.queryPermissionsSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证搜索关键词长度', () => {
      const invalidSearch = [
        { search: 'a', error: '搜索关键词至少需要2个字符' },
        { search: 'a'.repeat(101), error: '搜索关键词不能超过100个字符' }
      ];

      invalidSearch.forEach(({ search, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ search }, permissionValidation.queryPermissionsSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });
  });

  describe('permissionCheckSchema', () => {
    it('应该验证有效的权限检查数据', () => {
      const validCheck = {
        userId: 1,
        permissions: ['user:read', 'class:write'],
        resource: 'student',
        action: 'read',
        context: {
          resourceId: 123,
          department: 'education',
          location: 'classroom_a',
          timeOfDay: '10:30'
        }
      };

      const result = mockJoi.validate(validCheck, permissionValidation.permissionCheckSchema);

      expect((result as any).error).toBeNull();
    });

    it('应该验证用户ID', () => {
      const invalidUserIds = [
        { userId: 0, error: '用户ID必须大于0' },
        { userId: 'invalid', error: '用户ID必须是数字' },
        { userId: -1, error: '用户ID必须大于0' }
      ];

      invalidUserIds.forEach(({ userId, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ userId }, permissionValidation.permissionCheckSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证权限数组', () => {
      const invalidPermissions = [
        { permissions: 'not-array', error: '权限必须是数组' },
        { permissions: [], error: '至少需要一个权限' },
        { permissions: [''], error: '权限不能为空' },
        { permissions: ['invalid'], error: '权限格式无效' },
        { permissions: Array.from({ length: 51 }, (_, i) => `perm_${i}:read`), error: '权限数量不能超过50个' }
      ];

      invalidPermissions.forEach(({ permissions, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ permissions }, permissionValidation.permissionCheckSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证上下文信息', () => {
      const validContexts = [
        {
          context: {
            resourceId: 123,
            department: 'education',
            role: 'teacher'
          }
        },
        {
          context: {
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0...',
            sessionId: 'sess_123456'
          }
        },
        {
          context: {
            timeRange: {
              start: '08:00',
              end: '18:00'
            },
            location: 'office'
          }
        }
      ];

      validContexts.forEach(data => {
        const result = mockJoi.validate(data, permissionValidation.permissionCheckSchema);
        expect((result as any).error).toBeNull();
      });
    });
  });

  describe('自定义验证器', () => {
    it('应该验证权限代码唯一性', () => {
      const permissionCodeValidator = (code: string, existingCodes: string[]) => {
        return !existingCodes.includes(code);
      };

      const existingCodes = ['user:read', 'user:write', 'class:read'];

      expect(permissionCodeValidator('student:read', existingCodes)).toBe(true);
      expect(permissionCodeValidator('user:read', existingCodes)).toBe(false);
    });

    it('应该验证权限代码格式', () => {
      const permissionCodeFormatValidator = (code: string) => {
        const codeRegex = /^[a-z_]+:(read|write|delete|create|update|\*)$/;
        return codeRegex.test(code);
      };

      expect(permissionCodeFormatValidator('user:read')).toBe(true);
      expect(permissionCodeFormatValidator('user_profile:write')).toBe(true);
      expect(permissionCodeFormatValidator('admin:*')).toBe(true);
      expect(permissionCodeFormatValidator('invalid')).toBe(false);
      expect(permissionCodeFormatValidator('user:')).toBe(false);
      expect(permissionCodeFormatValidator(':read')).toBe(false);
      expect(permissionCodeFormatValidator('User:Read')).toBe(false);
    });

    it('应该验证权限层级关系', () => {
      const permissionHierarchyValidator = (level: number, parentLevel?: number) => {
        if (parentLevel === undefined) return true;
        
        // 子权限等级必须低于或等于父权限
        return level <= parentLevel;
      };

      expect(permissionHierarchyValidator(3, 5)).toBe(true); // 子权限等级3，父权限等级5
      expect(permissionHierarchyValidator(5, 5)).toBe(true); // 相同等级
      expect(permissionHierarchyValidator(7, 5)).toBe(false); // 子权限等级7，父权限等级5
      expect(permissionHierarchyValidator(5)).toBe(true); // 没有父权限
    });

    it('应该验证权限与资源操作匹配', () => {
      const resourceActionValidator = (resource: string, action: string, allowedActions: Record<string, string[]>) => {
        const actions = allowedActions[resource];
        if (!actions) return false;
        
        return actions.includes(action) || actions.includes('*');
      };

      const allowedActions = {
        user: ['read', 'write', 'delete'],
        class: ['read', 'write'],
        student: ['read'],
        admin: ['*']
      };

      expect(resourceActionValidator('user', 'read', allowedActions)).toBe(true);
      expect(resourceActionValidator('user', 'delete', allowedActions)).toBe(true);
      expect(resourceActionValidator('class', 'delete', allowedActions)).toBe(false);
      expect(resourceActionValidator('student', 'write', allowedActions)).toBe(false);
      expect(resourceActionValidator('admin', 'anything', allowedActions)).toBe(true);
    });

    it('应该验证权限风险等级', () => {
      const riskLevelValidator = (action: string, resource: string) => {
        const highRiskActions = ['delete', 'create', '*'];
        const sensitiveResources = ['user', 'role', 'permission', 'system'];
        
        const isHighRiskAction = highRiskActions.includes(action);
        const isSensitiveResource = sensitiveResources.includes(resource);
        
        if (isHighRiskAction || isSensitiveResource) {
          return 'high';
        } else if (action === 'write') {
          return 'medium';
        } else {
          return 'low';
        }
      };

      expect(riskLevelValidator('read', 'student')).toBe('low');
      expect(riskLevelValidator('write', 'class')).toBe('medium');
      expect(riskLevelValidator('delete', 'student')).toBe('high');
      expect(riskLevelValidator('read', 'user')).toBe('high');
      expect(riskLevelValidator('*', 'anything')).toBe('high');
    });

    it('应该验证权限条件完整性', () => {
      const conditionValidator = (conditions: any, action: string) => {
        // 写操作需要更严格的条件
        if (['write', 'delete', 'create'].includes(action)) {
          // 必须有部门限制或者只能操作自己的数据
          return conditions.department || conditions.own === true;
        }
        
        return true;
      };

      expect(conditionValidator({ own: true }, 'write')).toBe(true);
      expect(conditionValidator({ department: ['education'] }, 'delete')).toBe(true);
      expect(conditionValidator({}, 'read')).toBe(true);
      expect(conditionValidator({}, 'write')).toBe(false);
    });
  });

  describe('条件验证', () => {
    it('应该根据权限类别进行条件验证', () => {
      // 系统权限必须有高等级
      mockJoi.validate.mockImplementation((data, schema) => {
        if (data.category === 'system' && data.level < 8) {
          return createMockValidationResult(false, ['系统权限等级不能低于8']);
        }
        return createMockValidationResult(true);
      });

      const systemPermission = {
        category: 'system',
        level: 5 // 等级太低
      };

      const result = mockJoi.validate(systemPermission, permissionValidation.createPermissionSchema);
      
      expect(((result as any).error?.details)[0].message).toBe('系统权限等级不能低于8');
    });

    it('应该根据操作类型进行条件验证', () => {
      // 删除操作必须有审计要求
      mockJoi.validate.mockImplementation((data, schema) => {
        if (data.action === 'delete' && !data.metadata?.auditRequired) {
          return createMockValidationResult(false, ['删除操作必须启用审计']);
        }
        return createMockValidationResult(true);
      });

      const deletePermission = {
        action: 'delete',
        metadata: {
          auditRequired: false // 未启用审计
        }
      };

      const result = mockJoi.validate(deletePermission, permissionValidation.createPermissionSchema);
      
      expect(((result as any).error?.details)[0].message).toBe('删除操作必须启用审计');
    });

    it('应该根据风险等级进行条件验证', () => {
      // 高风险权限必须有IP限制
      mockJoi.validate.mockImplementation((data, schema) => {
        if (data.metadata?.riskLevel === 'high' && !data.metadata?.ipRestriction) {
          return createMockValidationResult(false, ['高风险权限必须启用IP限制']);
        }
        return createMockValidationResult(true);
      });

      const highRiskPermission = {
        metadata: {
          riskLevel: 'high',
          ipRestriction: false // 未启用IP限制
        }
      };

      const result = mockJoi.validate(highRiskPermission, permissionValidation.createPermissionSchema);
      
      expect(((result as any).error?.details)[0].message).toBe('高风险权限必须启用IP限制');
    });
  });

  describe('数据清理和转换', () => {
    it('应该清理和转换输入数据', () => {
      // 模拟数据转换
      mockJoi.validate.mockImplementation((data, schema) => {
        const cleanedData = {
          ...data,
          code: data.code?.toLowerCase().trim(),
          name: data.name?.trim(),
          resource: data.resource?.toLowerCase().trim(),
          action: data.action?.toLowerCase().trim(),
          description: data.description?.trim()
        };
        
        return {
          error: null,
          value: cleanedData
        };
      });

      const dirtyData = {
        code: '  USER:READ  ',
        name: '  用户查看权限  ',
        resource: '  USER  ',
        action: '  READ  ',
        description: '  查看用户信息的权限  '
      };

      const result = mockJoi.validate(dirtyData, permissionValidation.createPermissionSchema);
      
      expect(((result as any).value?.)code).toBe('user:read');
      expect(((result as any).value?.)name).toBe('用户查看权限');
      expect(((result as any).value?.)resource).toBe('user');
      expect(((result as any).value?.)action).toBe('read');
      expect(((result as any).value?.)description).toBe('查看用户信息的权限');
    });

    it('应该标准化权限条件', () => {
      mockJoi.validate.mockImplementation((data, schema) => {
        const cleanedData = {
          ...data,
          conditions: data.conditions ? {
            ...data.conditions,
            department: Array.isArray(data.conditions.department) 
              ? data.conditions.department 
              : data.conditions.department ? [data.conditions.department] : undefined,
            role: Array.isArray(data.conditions.role)
              ? data.conditions.role
              : data.conditions.role ? [data.conditions.role] : undefined
          } : undefined
        };
        
        return {
          error: null,
          value: cleanedData
        };
      });

      const dataWithConditions = {
        conditions: {
          department: 'education', // 字符串转数组
          role: ['teacher', 'principal'], // 已经是数组
          own: true
        }
      };

      const result = mockJoi.validate(dataWithConditions, permissionValidation.createPermissionSchema);
      
      expect(((result as any).value?.)conditions.department).toEqual(['education']);
      expect(((result as any).value?.)conditions.role).toEqual(['teacher', 'principal']);
      expect(((result as any).value?.)conditions.own).toBe(true);
    });
  });

  describe('错误消息国际化', () => {
    it('应该支持中文错误消息', () => {
      const chineseMessages = {
        'string.empty': '{{#label}}不能为空',
        'string.pattern.base': '{{#label}}格式无效',
        'number.min': '{{#label}}不能小于{{#limit}}',
        'number.max': '{{#label}}不能大于{{#limit}}',
        'any.required': '{{#label}}是必填字段',
        'any.only': '{{#label}}必须是{{#valids}}中的一个'
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['权限代码不能为空']));
      
      const result = mockJoi.validate({ code: '' }, permissionValidation.createPermissionSchema);
      
      expect(((result as any).error?.details)[0].message).toBe('权限代码不能为空');
    });

    it('应该支持英文错误消息', () => {
      const englishMessages = {
        'string.empty': '{{#label}} cannot be empty',
        'string.pattern.base': '{{#label}} format is invalid',
        'any.required': '{{#label}} is required'
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['Permission code cannot be empty']));
      
      const result = mockJoi.validate({ code: '' }, permissionValidation.createPermissionSchema);
      
      expect(((result as any).error?.details)[0].message).toBe('Permission code cannot be empty');
    });
  });
});
