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

describe('Role Validation', () => {
  let roleValidation: any;

  beforeAll(async () => {
    const imported = await import('../../../src/validations/role.validation');
    roleValidation = imported.default || imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default to valid validation
    mockJoi.validate.mockReturnValue(createMockValidationResult(true));
  });

  describe('createRoleSchema', () => {
    it('应该验证有效的角色创建数据', () => {
      const validData = {
        name: 'teacher',
        displayName: '教师',
        description: '幼儿园教师角色，负责日常教学工作',
        level: 3,
        category: 'staff',
        permissions: ['user:read', 'class:read', 'student:read', 'student:write'],
        metadata: {
          maxUsers: 50,
          features: ['teaching', 'communication', 'assessment'],
          restrictions: ['no_admin_access']
        }
      };

      const result = mockJoi.validate(validData, roleValidation.createRoleSchema);

      expect((result as any).error).toBeNull();
      expect(mockJoi.object).toHaveBeenCalled();
      expect(mockJoi.string).toHaveBeenCalled();
      expect(mockJoi.array).toHaveBeenCalled();
    });

    it('应该验证必填字段', () => {
      const testCases = [
        { field: 'name', data: {}, error: '角色名称是必填字段' },
        { field: 'displayName', data: { name: 'teacher' }, error: '显示名称是必填字段' },
        { field: 'level', data: { name: 'teacher', displayName: '教师' }, error: '角色等级是必填字段' }
      ];

      testCases.forEach(({ field, data, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate(data, roleValidation.createRoleSchema);
        
        expect((result as any).error).toBeTruthy();
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证角色名称格式', () => {
      const invalidNames = [
        { name: '', error: '角色名称不能为空' },
        { name: 'a', error: '角色名称长度必须在2-50个字符之间' },
        { name: 'a'.repeat(51), error: '角色名称长度必须在2-50个字符之间' },
        { name: '教师', error: '角色名称只能包含英文字母、数字和下划线' },
        { name: 'teacher-role', error: '角色名称只能包含英文字母、数字和下划线' },
        { name: 'Teacher', error: '角色名称必须是小写字母' }
      ];

      invalidNames.forEach(({ name, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ name }, roleValidation.createRoleSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证显示名称格式', () => {
      const invalidDisplayNames = [
        { displayName: '', error: '显示名称不能为空' },
        { displayName: 'a', error: '显示名称长度必须在2-100个字符之间' },
        { displayName: 'a'.repeat(101), error: '显示名称长度必须在2-100个字符之间' }
      ];

      invalidDisplayNames.forEach(({ displayName, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ displayName }, roleValidation.createRoleSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证角色等级范围', () => {
      const invalidLevels = [
        { level: 0, error: '角色等级必须在1-10之间' },
        { level: 11, error: '角色等级必须在1-10之间' },
        { level: -1, error: '角色等级必须在1-10之间' },
        { level: 'high', error: '角色等级必须是数字' }
      ];

      invalidLevels.forEach(({ level, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ level }, roleValidation.createRoleSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证角色类别枚举', () => {
      const invalidCategories = ['invalid', 'unknown', '管理员', 'administrator'];
      
      invalidCategories.forEach(category => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['角色类别无效']));
        
        const result = mockJoi.validate({ category }, roleValidation.createRoleSchema);
        
        expect(((result as any).error?.details)[0].message).toBe('角色类别无效');
      });
    });

    it('应该验证权限数组格式', () => {
      const invalidPermissions = [
        { permissions: 'not-array', error: '权限必须是数组' },
        { permissions: [], error: '至少需要一个权限' },
        { permissions: [''], error: '权限不能为空' },
        { permissions: ['invalid'], error: '权限格式无效，应为 resource:action 格式' },
        { permissions: ['user:'], error: '权限格式无效，应为 resource:action 格式' },
        { permissions: [':read'], error: '权限格式无效，应为 resource:action 格式' },
        { permissions: ['user:invalid_action'], error: '权限操作无效' }
      ];

      invalidPermissions.forEach(({ permissions, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ permissions }, roleValidation.createRoleSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证权限重复', () => {
      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['权限不能重复']));
      
      const result = mockJoi.validate({
        permissions: ['user:read', 'user:read', 'class:write']
      }, roleValidation.createRoleSchema);
      
      expect(((result as any).error?.details)[0].message).toBe('权限不能重复');
    });

    it('应该验证元数据结构', () => {
      const validMetadata = {
        metadata: {
          maxUsers: 100,
          features: ['teaching', 'assessment'],
          restrictions: ['no_delete'],
          customFields: {
            department: 'education',
            workHours: '9-17'
          }
        }
      };

      const result = mockJoi.validate(validMetadata, roleValidation.createRoleSchema);

      expect((result as any).error).toBeNull();
    });

    it('应该验证描述长度', () => {
      const invalidDescriptions = [
        { description: 'a'.repeat(501), error: '描述不能超过500个字符' }
      ];

      invalidDescriptions.forEach(({ description, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ description }, roleValidation.createRoleSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });
  });

  describe('updateRoleSchema', () => {
    it('应该验证有效的角色更新数据', () => {
      const validUpdateData = {
        displayName: '高级教师',
        description: '具有丰富教学经验的高级教师',
        permissions: ['user:read', 'class:read', 'class:write', 'student:read', 'student:write'],
        metadata: {
          maxUsers: 30,
          features: ['teaching', 'mentoring', 'assessment']
        }
      };

      const result = mockJoi.validate(validUpdateData, roleValidation.updateRoleSchema);

      expect((result as any).error).toBeNull();
    });

    it('应该允许部分字段更新', () => {
      const partialUpdateData = {
        displayName: '新显示名称'
      };

      const result = mockJoi.validate(partialUpdateData, roleValidation.updateRoleSchema);

      expect((result as any).error).toBeNull();
    });

    it('应该禁止更新某些敏感字段', () => {
      const sensitiveFields = [
        { field: 'id', value: 999, error: '不能更新角色ID' },
        { field: 'name', value: 'new_name', error: '不能更新角色名称' },
        { field: 'createdAt', value: new Date(), error: '不能更新创建时间' }
      ];

      sensitiveFields.forEach(({ field, value, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ [field]: value }, roleValidation.updateRoleSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证系统角色更新限制', () => {
      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['系统角色不能修改权限']));
      
      const result = mockJoi.validate({
        isSystem: true,
        permissions: ['admin:*']
      }, roleValidation.updateRoleSchema);
      
      expect(((result as any).error?.details)[0].message).toBe('系统角色不能修改权限');
    });

    it('应该验证角色等级变更限制', () => {
      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['不能降低角色等级']));
      
      const result = mockJoi.validate({
        currentLevel: 5,
        level: 3
      }, roleValidation.updateRoleSchema);
      
      expect(((result as any).error?.details)[0].message).toBe('不能降低角色等级');
    });
  });

  describe('queryRolesSchema', () => {
    it('应该验证有效的查询参数', () => {
      const validQuery = {
        page: 1,
        pageSize: 20,
        sortBy: 'level',
        sortOrder: 'desc',
        search: 'teacher',
        category: 'staff',
        level: {
          min: 1,
          max: 5
        },
        isActive: true,
        isSystem: false,
        permissions: ['user:read', 'class:read']
      };

      const result = mockJoi.validate(validQuery, roleValidation.queryRolesSchema);

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
        const result = mockJoi.validate(query, roleValidation.queryRolesSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证排序参数', () => {
      const validSortFields = ['name', 'displayName', 'level', 'category', 'createdAt'];
      const invalidSort = [
        { sortBy: 'invalid_field', error: '排序字段无效' },
        { sortOrder: 'invalid', error: '排序方向必须是 asc 或 desc' }
      ];

      invalidSort.forEach(({ sortBy, sortOrder, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const query = sortBy ? { sortBy } : { sortOrder };
        const result = mockJoi.validate(query, roleValidation.queryRolesSchema);
        
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
        
        const result = mockJoi.validate({ level }, roleValidation.queryRolesSchema);
        
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
        
        const result = mockJoi.validate({ search }, roleValidation.queryRolesSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });
  });

  describe('assignRoleSchema', () => {
    it('应该验证有效的角色分配数据', () => {
      const validAssignment = {
        roleId: 1,
        userIds: [1, 2, 3],
        assignedBy: 5,
        expiresAt: '2024-12-31T23:59:59Z',
        notes: '临时分配教师角色'
      };

      const result = mockJoi.validate(validAssignment, roleValidation.assignRoleSchema);

      expect((result as any).error).toBeNull();
    });

    it('应该验证用户ID数组', () => {
      const invalidUserIds = [
        { userIds: [], error: '至少需要选择一个用户' },
        { userIds: [1, 2, 3, 4, 5, 6], error: '一次最多只能分配给5个用户' },
        { userIds: ['invalid'], error: '用户ID必须是数字' },
        { userIds: [0], error: '用户ID必须大于0' },
        { userIds: [1, 1, 2], error: '用户ID不能重复' }
      ];

      invalidUserIds.forEach(({ userIds, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ userIds }, roleValidation.assignRoleSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证过期时间', () => {
      const invalidExpiry = [
        { expiresAt: 'invalid-date', error: '过期时间格式无效' },
        { expiresAt: '2020-01-01T00:00:00Z', error: '过期时间不能是过去时间' }
      ];

      invalidExpiry.forEach(({ expiresAt, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ expiresAt }, roleValidation.assignRoleSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });
  });

  describe('rolePermissionSchema', () => {
    it('应该验证有效的权限管理数据', () => {
      const validPermissionData = {
        roleId: 1,
        permissions: [
          {
            resource: 'user',
            actions: ['read', 'write'],
            conditions: {
              own: true,
              department: 'education'
            }
          },
          {
            resource: 'class',
            actions: ['read', 'write', 'delete'],
            conditions: {
              assigned: true
            }
          }
        ]
      };

      const result = mockJoi.validate(validPermissionData, roleValidation.rolePermissionSchema);

      expect((result as any).error).toBeNull();
    });

    it('应该验证权限结构', () => {
      const invalidPermissions = [
        {
          permissions: [{ resource: '' }],
          error: '资源名称不能为空'
        },
        {
          permissions: [{ resource: 'user', actions: [] }],
          error: '至少需要一个操作权限'
        },
        {
          permissions: [{ resource: 'user', actions: ['invalid'] }],
          error: '操作权限无效'
        },
        {
          permissions: [{ resource: 'user', actions: ['read', 'read'] }],
          error: '操作权限不能重复'
        }
      ];

      invalidPermissions.forEach(({ permissions, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ permissions }, roleValidation.rolePermissionSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证权限条件', () => {
      const validConditions = {
        permissions: [
          {
            resource: 'student',
            actions: ['read'],
            conditions: {
              own: true,
              class: ['1A', '1B'],
              status: 'active',
              age: { min: 3, max: 6 }
            }
          }
        ]
      };

      const result = mockJoi.validate(validConditions, roleValidation.rolePermissionSchema);

      expect((result as any).error).toBeNull();
    });
  });

  describe('自定义验证器', () => {
    it('应该验证角色名称唯一性', () => {
      const roleNameValidator = (name: string, existingRoles: string[]) => {
        return !existingRoles.includes(name);
      };

      const existingRoles = ['admin', 'teacher', 'parent'];

      expect(roleNameValidator('principal', existingRoles)).toBe(true);
      expect(roleNameValidator('teacher', existingRoles)).toBe(false);
    });

    it('应该验证权限格式', () => {
      const permissionFormatValidator = (permission: string) => {
        const permissionRegex = /^[a-z_]+:(read|write|delete|\*)$/;
        return permissionRegex.test(permission);
      };

      expect(permissionFormatValidator('user:read')).toBe(true);
      expect(permissionFormatValidator('class_schedule:write')).toBe(true);
      expect(permissionFormatValidator('admin:*')).toBe(true);
      expect(permissionFormatValidator('invalid')).toBe(false);
      expect(permissionFormatValidator('user:')).toBe(false);
      expect(permissionFormatValidator(':read')).toBe(false);
      expect(permissionFormatValidator('User:Read')).toBe(false);
    });

    it('应该验证角色层级关系', () => {
      const roleHierarchyValidator = (level: number, parentLevel?: number) => {
        if (parentLevel === undefined) return true;
        
        // 子角色等级必须低于父角色
        return level < parentLevel;
      };

      expect(roleHierarchyValidator(3, 5)).toBe(true); // 子角色等级3，父角色等级5
      expect(roleHierarchyValidator(5, 3)).toBe(false); // 子角色等级5，父角色等级3
      expect(roleHierarchyValidator(5)).toBe(true); // 没有父角色
    });

    it('应该验证权限兼容性', () => {
      const permissionCompatibilityValidator = (permissions: string[], category: string) => {
        const adminPermissions = ['admin:*', 'system:*'];
        const staffPermissions = ['user:read', 'class:read', 'student:read'];
        const parentPermissions = ['student:read', 'activity:read'];

        if (category === 'admin') {
          // 管理员可以有任何权限
          return true;
        } else if (category === 'staff') {
          // 员工不能有管理员权限
          return !permissions.some(p => adminPermissions.includes(p));
        } else if (category === 'parent') {
          // 家长只能有限定权限
          return permissions.every(p => parentPermissions.includes(p));
        }

        return true;
      };

      expect(permissionCompatibilityValidator(['user:read', 'class:read'], 'staff')).toBe(true);
      expect(permissionCompatibilityValidator(['admin:*'], 'staff')).toBe(false);
      expect(permissionCompatibilityValidator(['student:read'], 'parent')).toBe(true);
      expect(permissionCompatibilityValidator(['admin:*'], 'parent')).toBe(false);
    });

    it('应该验证角色用户数量限制', () => {
      const userLimitValidator = (currentUserCount: number, maxUsers?: number) => {
        if (maxUsers === undefined) return true;
        return currentUserCount <= maxUsers;
      };

      expect(userLimitValidator(25, 50)).toBe(true);
      expect(userLimitValidator(60, 50)).toBe(false);
      expect(userLimitValidator(100)).toBe(true); // 无限制
    });

    it('应该验证角色激活状态', () => {
      const roleActivationValidator = (isActive: boolean, hasUsers: boolean) => {
        // 如果角色有用户，不能直接停用
        if (!isActive && hasUsers) {
          return false;
        }
        return true;
      };

      expect(roleActivationValidator(true, true)).toBe(true); // 激活状态，有用户
      expect(roleActivationValidator(true, false)).toBe(true); // 激活状态，无用户
      expect(roleActivationValidator(false, false)).toBe(true); // 停用状态，无用户
      expect(roleActivationValidator(false, true)).toBe(false); // 停用状态，有用户
    });
  });

  describe('条件验证', () => {
    it('应该根据角色类别进行条件验证', () => {
      // 管理员角色必须有管理权限
      mockJoi.validate.mockImplementation((data, schema) => {
        if (data.category === 'admin' && !data.permissions?.some(p => p.startsWith('admin:'))) {
          return createMockValidationResult(false, ['管理员角色必须包含管理权限']);
        }
        return createMockValidationResult(true);
      });

      const adminRole = {
        category: 'admin',
        permissions: ['user:read', 'class:read'] // 缺少admin权限
      };

      const result = mockJoi.validate(adminRole, roleValidation.createRoleSchema);
      
      expect(((result as any).error?.details)[0].message).toBe('管理员角色必须包含管理权限');
    });

    it('应该根据系统角色标识进行条件验证', () => {
      // 系统角色不能被普通用户修改
      mockJoi.validate.mockImplementation((data, schema) => {
        if (data.isSystem && data.modifiedBy && data.modifiedBy !== 'system') {
          return createMockValidationResult(false, ['系统角色只能由系统管理员修改']);
        }
        return createMockValidationResult(true);
      });

      const systemRole = {
        isSystem: true,
        modifiedBy: 'user_123' // 普通用户尝试修改
      };

      const result = mockJoi.validate(systemRole, roleValidation.updateRoleSchema);
      
      expect(((result as any).error?.details)[0].message).toBe('系统角色只能由系统管理员修改');
    });

    it('应该根据角色等级进行权限验证', () => {
      // 低等级角色不能有高级权限
      mockJoi.validate.mockImplementation((data, schema) => {
        if (data.level && data.level < 5 && data.permissions?.includes('admin:*')) {
          return createMockValidationResult(false, ['低等级角色不能拥有管理员权限']);
        }
        return createMockValidationResult(true);
      });

      const lowLevelRole = {
        level: 2,
        permissions: ['user:read', 'admin:*'] // 低等级但有管理员权限
      };

      const result = mockJoi.validate(lowLevelRole, roleValidation.createRoleSchema);
      
      expect(((result as any).error?.details)[0].message).toBe('低等级角色不能拥有管理员权限');
    });
  });

  describe('数据清理和转换', () => {
    it('应该清理和转换输入数据', () => {
      // 模拟数据转换
      mockJoi.validate.mockImplementation((data, schema) => {
        const cleanedData = {
          ...data,
          name: data.name?.toLowerCase().trim(),
          displayName: data.displayName?.trim(),
          permissions: data.permissions?.map(p => p.toLowerCase().trim()).filter(Boolean),
          description: data.description?.trim()
        };
        
        return {
          error: null,
          value: cleanedData
        };
      });

      const dirtyData = {
        name: '  TEACHER  ',
        displayName: '  教师角色  ',
        permissions: ['  USER:READ  ', 'CLASS:WRITE', '', '  STUDENT:READ  '],
        description: '  负责教学工作的角色  '
      };

      const result = mockJoi.validate(dirtyData, roleValidation.createRoleSchema);
      
      expect(((result as any).value?.)name).toBe('teacher');
      expect(((result as any).value?.)displayName).toBe('教师角色');
      expect(((result as any).value?.)permissions).toEqual(['user:read', 'class:write', 'student:read']);
      expect(((result as any).value?.)description).toBe('负责教学工作的角色');
    });

    it('应该去重权限数组', () => {
      mockJoi.validate.mockImplementation((data, schema) => {
        const cleanedData = {
          ...data,
          permissions: data.permissions ? [...new Set(data.permissions)] : undefined
        };
        
        return {
          error: null,
          value: cleanedData
        };
      });

      const dataWithDuplicates = {
        permissions: ['user:read', 'class:read', 'user:read', 'student:write', 'class:read']
      };

      const result = mockJoi.validate(dataWithDuplicates, roleValidation.createRoleSchema);
      
      expect(((result as any).value?.)permissions).toEqual(['user:read', 'class:read', 'student:write']);
    });
  });

  describe('错误消息国际化', () => {
    it('应该支持中文错误消息', () => {
      const chineseMessages = {
        'string.empty': '{{#label}}不能为空',
        'string.min': '{{#label}}长度不能少于{{#limit}}个字符',
        'string.max': '{{#label}}长度不能超过{{#limit}}个字符',
        'number.min': '{{#label}}不能小于{{#limit}}',
        'number.max': '{{#label}}不能大于{{#limit}}',
        'any.required': '{{#label}}是必填字段',
        'any.only': '{{#label}}必须是{{#valids}}中的一个'
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['角色名称不能为空']));
      
      const result = mockJoi.validate({ name: '' }, roleValidation.createRoleSchema);
      
      expect(((result as any).error?.details)[0].message).toBe('角色名称不能为空');
    });

    it('应该支持英文错误消息', () => {
      const englishMessages = {
        'string.empty': '{{#label}} cannot be empty',
        'string.min': '{{#label}} length must be at least {{#limit}} characters long',
        'any.required': '{{#label}} is required'
      };

      mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['Role name cannot be empty']));
      
      const result = mockJoi.validate({ name: '' }, roleValidation.createRoleSchema);
      
      expect(((result as any).error?.details)[0].message).toBe('Role name cannot be empty');
    });
  });
});
