import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';
import {
  validateRequiredFields,
  validateFieldTypes,
  validateApiResponseStructure
} from '../../../utils/data-validation';
import {
  UnifiedAuthLoginResponse,
  validateUnifiedAuthUser
} from '../auth/unified-auth.template.test';

// Mock the request module - 适配统一认证中心
vi.mock('@/utils/request', () => ({
  get: vi.fn(),
  post: vi.fn()
}));

// Import after mocks
import * as authPermissionsApi from '@/api/modules/auth-permissions';
import { get, post } from '@/utils/request';

const mockedGet = vi.mocked(get);
const mockedPost = vi.mocked(post);

// 控制台错误检测变量
let consoleSpy: any

describe('Auth Permissions API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    expectNoConsoleErrors();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('getUserPermissions', () => {
    it('should get user permissions successfully from unified auth center', async () => {
      // Mock 统一认证中心的权限响应
      const mockResponse = {
        data: {
          success: true,
          data: {
            permissions: [
              {
                id: 'perm_001',
                name: '用户管理',
                code: 'user:manage',
                resource: 'users',
                action: 'manage',
                description: '用户管理权限',
                category: 'system'
              },
              {
                id: 'perm_002',
                name: '学生管理',
                code: 'student:manage',
                resource: 'students',
                action: 'manage',
                description: '学生管理权限',
                category: 'education'
              },
              {
                id: 'perm_003',
                name: '班级管理',
                code: 'class:read',
                resource: 'classes',
                action: 'read',
                description: '班级查看权限',
                category: 'education'
              }
            ],
            roles: [
              {
                id: 'role_admin',
                name: '系统管理员',
                code: 'ADMIN',
                permissions: ['user:manage', 'student:manage', 'class:read']
              }
            ]
          }
        }
      };

      mockedGet.mockResolvedValue(mockResponse);

      const result = await authPermissionsApi.getUserPermissions();

      // 验证API调用 - 统一认证中心端点
      expect(mockedGet).toHaveBeenCalledWith('/api/auth/permissions');

      // 验证响应结构
      expect(result.data).toBeDefined();
      expect(result.data.success).toBe(true);
      expect(result.data.data).toBeDefined();

      // 验证权限数组
      const { permissions, roles } = result.data.data;
      expect(Array.isArray(permissions)).toBe(true);
      expect(Array.isArray(roles)).toBe(true);

      // 验证权限对象结构
      if (permissions.length > 0) {
        const permission = permissions[0];
        const requiredFields = ['id', 'name', 'code', 'resource', 'action'];
        const validation = validateRequiredFields(permission, requiredFields);
        expect(validation.valid).toBe(true);

        const typeValidation = validateFieldTypes(permission, {
          id: 'string',
          name: 'string',
          code: 'string',
          resource: 'string',
          action: 'string',
          description: 'string',
          category: 'string'
        });
        expect(typeValidation.valid).toBe(true);
      }

      // 验证角色对象结构
      if (roles.length > 0) {
        const role = roles[0];
        const roleValidation = validateRequiredFields(role, ['id', 'name', 'code', 'permissions']);
        expect(roleValidation.valid).toBe(true);

        expect(Array.isArray(role.permissions)).toBe(true);
      }
    });

    it('should handle permissions extracted from unified auth user info', async () => {
      // 测试从统一认证用户信息中提取权限
      const mockUserInfoResponse = {
        data: {
          success: true,
          data: {
            id: 'user_123',
            username: 'admin',
            realName: '系统管理员',
            email: 'admin@kindergarten.com',
            phone: '13800138000',
            status: 'active',
            roles: [
              {
                id: 'role_admin',
                name: '系统管理员',
                code: 'ADMIN',
                permissions: ['system:read', 'system:write', 'user:manage', 'student:read']
              }
            ],
            permissions: ['system:read', 'system:write', 'user:manage', 'student:read'],
            orgInfo: {
              orgId: 'org_001',
              orgName: '智慧幼儿园',
              orgType: 'kindergarten'
            }
          }
        }
      };

      mockedGet.mockResolvedValue(mockUserInfoResponse);

      const result = await authPermissionsApi.getUserPermissions();

      // 验证从用户信息中提取的权限
      const userValidation = validateUnifiedAuthUser(result.data.data);
      expect(userValidation.valid).toBe(true);

      // 验证权限数组
      expect(Array.isArray(result.data.data.permissions)).toBe(true);
      expect(result.data.data.permissions).toContain('system:read');
      expect(result.data.data.permissions).toContain('user:manage');

      // 验证角色权限
      expect(Array.isArray(result.data.data.roles)).toBe(true);
      if (result.data.data.roles.length > 0) {
        const role = result.data.data.roles[0];
        expect(Array.isArray(role.permissions)).toBe(true);
        expect(role.permissions).toContain('system:read');
      }
    });

    it('should handle empty permissions list', async () => {
      const mockResponse = { data: [] };

      mockedGet.mockResolvedValue(mockResponse);

      const result = await authPermissionsApi.getUserPermissions();

      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors for user permissions', async () => {
      const mockError = new Error('Network error');
      mockedGet.mockRejectedValue(mockError);

      await expect(authPermissionsApi.getUserPermissions())
        .rejects.toThrow('Network error');
    });
  });

  describe('getUserMenu', () => {
    it('should get user menu successfully', async () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            name: '仪表盘',
            path: '/dashboard',
            component: 'Dashboard',
            icon: 'dashboard',
            sort: 1,
            children: [
              {
                id: 11,
                name: '数据概览',
                path: '/dashboard/overview',
                component: 'DashboardOverview',
                icon: 'chart',
                sort: 1,
                children: []
              },
              {
                id: 12,
                name: '统计分析',
                path: '/dashboard/analytics',
                component: 'DashboardAnalytics',
                icon: 'analytics',
                sort: 2,
                children: []
              }
            ]
          },
          {
            id: 2,
            name: '用户管理',
            path: '/users',
            component: 'UserManagement',
            icon: 'users',
            sort: 2,
            children: []
          },
          {
            id: 3,
            name: '系统设置',
            path: '/settings',
            component: 'SystemSettings',
            icon: 'settings',
            sort: 3,
            children: [
              {
                id: 31,
                name: '权限管理',
                path: '/settings/permissions',
                component: 'PermissionManagement',
                icon: 'lock',
                sort: 1,
                children: []
              }
            ]
          }
        ]
      };

      mockedGet.mockResolvedValue(mockResponse);

      const result = await authPermissionsApi.getUserMenu();

      expect(mockedGet).toHaveBeenCalledWith('/auth-permissions/menu');
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty menu structure', async () => {
      const mockResponse = { data: [] };

      mockedGet.mockResolvedValue(mockResponse);

      const result = await authPermissionsApi.getUserMenu();

      expect(result).toEqual(mockResponse);
    });

    it('should handle nested menu structure', async () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            name: 'Level 1',
            path: '/level1',
            component: 'Level1',
            icon: 'folder',
            sort: 1,
            children: [
              {
                id: 2,
                name: 'Level 2',
                path: '/level1/level2',
                component: 'Level2',
                icon: 'folder',
                sort: 1,
                children: [
                  {
                    id: 3,
                    name: 'Level 3',
                    path: '/level1/level2/level3',
                    component: 'Level3',
                    icon: 'file',
                    sort: 1,
                    children: []
                  }
                ]
              }
            ]
          }
        ]
      };

      mockedGet.mockResolvedValue(mockResponse);

      const result = await authPermissionsApi.getUserMenu();

      expect(result.data[0].children).toHaveLength(1);
      expect(result.data[0].children[0].children).toHaveLength(1);
      expect(result.data[0].children[0].children[0].name).toBe('Level 3');
    });
  });

  describe('checkPermission', () => {
    it('should check permission for unified auth resource-action format', async () => {
      // 使用统一认证中心的资源-动作格式进行权限检查
      const permissionCheck = {
        resource: 'users',
        action: 'manage'
      };

      const mockResponse = {
        data: {
          success: true,
          data: {
            hasPermission: true,
            permission: {
              id: 'perm_001',
              name: '用户管理',
              code: 'user:manage',
              resource: 'users',
              action: 'manage'
            },
            userId: 'user_123'
          }
        }
      };

      mockedPost.mockResolvedValue(mockResponse);

      const result = await authPermissionsApi.checkPermission(permissionCheck);

      // 验证调用统一认证中心权限检查端点
      expect(mockedPost).toHaveBeenCalledWith('/api/auth/check-permission', permissionCheck);
      expect(result.data.success).toBe(true);
      expect(result.data.data.hasPermission).toBe(true);
      expect(result.data.data.permission.code).toBe('user:manage');
    });

    it('should check permission for unauthorized action', async () => {
      const permissionCheck = {
        resource: 'system',
        action: 'delete'
      };

      const mockResponse = {
        data: {
          success: true,
          data: {
            hasPermission: false,
            permission: null,
            reason: 'Insufficient privileges',
            userId: 'user_123'
          }
        }
      };

      mockedPost.mockResolvedValue(mockResponse);

      const result = await authPermissionsApi.checkPermission(permissionCheck);

      expect(mockedPost).toHaveBeenCalledWith('/api/auth/check-permission', permissionCheck);
      expect(result.data.data.hasPermission).toBe(false);
      expect(result.data.data.permission).toBeNull();
      expect(result.data.data.reason).toBe('Insufficient privileges');
    });

    it('should support legacy path-based permission check', async () => {
      // 向后兼容：支持路径格式的权限检查
      const mockPath = '/users/manage';
      const mockResponse = {
        data: {
          success: true,
          data: {
            hasPermission: true,
            path: '/users/manage',
            userId: 'user_123',
            mappedPermission: {
              resource: 'users',
              action: 'manage'
            }
          }
        }
      };

      mockedPost.mockResolvedValue(mockResponse);

      const result = await authPermissionsApi.checkPermission(mockPath);

      // 应该同时支持新的统一认证中心和旧的路径格式
      expect(mockedPost).toHaveBeenCalledWith('/api/auth/check-permission', { path: mockPath });
      expect(result.data.data.hasPermission).toBe(true);
      expect(result.data.data.mappedPermission.resource).toBe('users');
    });

    it('should handle batch permission checking', async () => {
      // 批量权限检查
      const batchPermissions = [
        { resource: 'users', action: 'read' },
        { resource: 'users', action: 'write' },
        { resource: 'students', action: 'read' },
        { resource: 'system', action: 'delete' }
      ];

      const mockResponse = {
        data: {
          success: true,
          data: {
            results: [
              { resource: 'users', action: 'read', hasPermission: true },
              { resource: 'users', action: 'write', hasPermission: true },
              { resource: 'students', action: 'read', hasPermission: true },
              { resource: 'system', action: 'delete', hasPermission: false }
            ]
          }
        }
      };

      mockedPost.mockResolvedValue(mockResponse);

      const result = await authPermissionsApi.checkPermission(batchPermissions);

      expect(mockedPost).toHaveBeenCalledWith('/api/auth/check-permissions-batch', batchPermissions);
      expect(result.data.data.results).toHaveLength(4);
      expect(result.data.data.results[3].hasPermission).toBe(false);
    });

    it('should handle empty path', async () => {
      const mockPath = '';
      const mockResponse = {
        data: {
          hasPermission: false,
          path: '',
          userId: 1
        }
      };

      mockedPost.mockResolvedValue(mockResponse);

      const result = await authPermissionsApi.checkPermission(mockPath);

      expect(mockedPost).toHaveBeenCalledWith('/dynamic-permissions/check-permission', { path: mockPath });
    });

    it('should handle special characters in path', async () => {
      const mockPath = '/users/manage?filter=active&sort=name';
      const mockResponse = {
        data: {
          hasPermission: true,
          path: mockPath,
          userId: 1
        }
      };

      mockedPost.mockResolvedValue(mockResponse);

      const result = await authPermissionsApi.checkPermission(mockPath);

      expect(mockedPost).toHaveBeenCalledWith('/dynamic-permissions/check-permission', { path: mockPath });
    });
  });

  describe('getUserRoles', () => {
    it('should get user roles successfully', async () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            name: '管理员',
            code: 'admin',
            description: '系统管理员角色',
            status: 1
          },
          {
            id: 2,
            name: '教师',
            code: 'teacher',
            description: '教师角色',
            status: 1
          },
          {
            id: 3,
            name: '家长',
            code: 'parent',
            description: '家长角色',
            status: 1
          }
        ]
      };

      mockedGet.mockResolvedValue(mockResponse);

      const result = await authPermissionsApi.getUserRoles();

      expect(mockedGet).toHaveBeenCalledWith('/auth-permissions/roles');
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty roles list', async () => {
      const mockResponse = { data: [] };

      mockedGet.mockResolvedValue(mockResponse);

      const result = await authPermissionsApi.getUserRoles();

      expect(result).toEqual(mockResponse);
    });

    it('should handle single role', async () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            name: '管理员',
            code: 'admin',
            description: '系统管理员角色',
            status: 1
          }
        ]
      };

      mockedGet.mockResolvedValue(mockResponse);

      const result = await authPermissionsApi.getUserRoles();

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('管理员');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors for all endpoints', async () => {
      const mockError = new Error('Network error');
      mockedGet.mockRejectedValue(mockError);
      mockedPost.mockRejectedValue(mockError);

      await expect(authPermissionsApi.getUserPermissions()).rejects.toThrow('Network error');
      await expect(authPermissionsApi.getUserMenu()).rejects.toThrow('Network error');
      await expect(authPermissionsApi.getUserRoles()).rejects.toThrow('Network error');
      await expect(authPermissionsApi.checkPermission('/test')).rejects.toThrow('Network error');
    });

    it('should handle API response errors', async () => {
      const mockErrorResponse = {
        data: null,
        message: 'Authentication failed'
      };

      mockedGet.mockResolvedValue(mockErrorResponse);
      mockedPost.mockResolvedValue(mockErrorResponse);

      const permissionsResult = await authPermissionsApi.getUserPermissions();
      expect(permissionsResult.data).toBeNull();

      const menuResult = await authPermissionsApi.getUserMenu();
      expect(menuResult.data).toBeNull();

      const rolesResult = await authPermissionsApi.getUserRoles();
      expect(rolesResult.data).toBeNull();

      const permissionCheckResult = await authPermissionsApi.checkPermission('/test');
      expect(permissionCheckResult.data).toBeNull();
    });

    it('should handle malformed responses', async () => {
      const malformedResponses = [
        null,
        {},
        { data: 'invalid_data' },
        { success: 'invalid' }
      ];

      for (const malformedResponse of malformedResponses) {
        mockedGet.mockResolvedValue(malformedResponse);

        const result = await authPermissionsApi.getUserPermissions();
        // API returns whatever the mock returns
        expect(result).toEqual(malformedResponse);
      }

      // Test undefined separately
      mockedGet.mockResolvedValue(undefined);
      const undefinedResult = await authPermissionsApi.getUserPermissions();
      expect(undefinedResult).toBeUndefined();
    });
  });

  describe('Data Validation', () => {
    it('should validate permission interface structure', async () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            name: 'Test Permission',
            code: 'test:permission',
            type: 'menu',
            path: '/test',
            component: 'TestComponent',
            icon: 'test',
            sort: 1,
            status: 1
          }
        ]
      };

      mockedGet.mockResolvedValue(mockResponse);

      const result = await authPermissionsApi.getUserPermissions();

      expect(result.data[0]).toHaveProperty('id');
      expect(result.data[0]).toHaveProperty('name');
      expect(result.data[0]).toHaveProperty('code');
      expect(result.data[0]).toHaveProperty('type');
      expect(result.data[0]).toHaveProperty('path');
      expect(result.data[0]).toHaveProperty('component');
      expect(result.data[0]).toHaveProperty('icon');
      expect(result.data[0]).toHaveProperty('sort');
      expect(result.data[0]).toHaveProperty('status');
    });

    it('should validate menu interface structure', async () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            name: 'Test Menu',
            path: '/test',
            component: 'TestComponent',
            icon: 'test',
            sort: 1,
            children: []
          }
        ]
      };

      mockedGet.mockResolvedValue(mockResponse);

      const result = await authPermissionsApi.getUserMenu();

      expect(result.data[0]).toHaveProperty('id');
      expect(result.data[0]).toHaveProperty('name');
      expect(result.data[0]).toHaveProperty('path');
      expect(result.data[0]).toHaveProperty('component');
      expect(result.data[0]).toHaveProperty('icon');
      expect(result.data[0]).toHaveProperty('sort');
      expect(result.data[0]).toHaveProperty('children');
    });

    it('should validate role interface structure', async () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            name: 'Test Role',
            code: 'test_role',
            description: 'Test role description',
            status: 1
          }
        ]
      };

      mockedGet.mockResolvedValue(mockResponse);

      const result = await authPermissionsApi.getUserRoles();

      expect(result.data[0]).toHaveProperty('id');
      expect(result.data[0]).toHaveProperty('name');
      expect(result.data[0]).toHaveProperty('code');
      expect(result.data[0]).toHaveProperty('description');
      expect(result.data[0]).toHaveProperty('status');
    });

    it('should validate permission check response structure', async () => {
      const mockResponse = {
        data: {
          hasPermission: true,
          path: '/test',
          userId: 1
        }
      };

      mockedPost.mockResolvedValue(mockResponse);

      const result = await authPermissionsApi.checkPermission('/test');

      expect(result.data).toHaveProperty('hasPermission');
      expect(result.data).toHaveProperty('path');
      expect(result.data).toHaveProperty('userId');
    });
  });

  describe('Default Export', () => {
    it('should export default API object with all methods', () => {
      expect(authPermissionsApi.default).toBeDefined();
      expect(authPermissionsApi.default.getUserPermissions).toBe(authPermissionsApi.getUserPermissions);
      expect(authPermissionsApi.default.getUserMenu).toBe(authPermissionsApi.getUserMenu);
      expect(authPermissionsApi.default.checkPermission).toBe(authPermissionsApi.checkPermission);
      expect(authPermissionsApi.default.getUserRoles).toBe(authPermissionsApi.getUserRoles);
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle large permission lists', async () => {
      const largePermissionsList = Array.from({ length: 1000 }, (_, index) => ({
        id: index + 1,
        name: `Permission ${index + 1}`,
        code: `permission:${index + 1}`,
        type: 'menu',
        path: `/permission/${index + 1}`,
        component: `Permission${index + 1}`,
        icon: 'icon',
        sort: index + 1,
        status: 1
      }));

      const mockResponse = { data: largePermissionsList };

      mockedGet.mockResolvedValue(mockResponse);

      const result = await authPermissionsApi.getUserPermissions();

      expect(result.data).toHaveLength(1000);
    });

    it('should handle deeply nested menu structures', async () => {
      const createNestedMenu = (depth: number, parentId = 0): any => {
        if (depth === 0) return null;

        return {
          id: parentId * 10 + 1,
          name: `Menu Level ${depth}`,
          path: `/level${depth}`,
          component: `Level${depth}`,
          icon: 'folder',
          sort: 1,
          children: [
            createNestedMenu(depth - 1, parentId * 10 + 1)
          ].filter(Boolean)
        };
      };

      const nestedMenu = createNestedMenu(5);
      const mockResponse = { data: [nestedMenu] };

      mockedGet.mockResolvedValue(mockResponse);

      const result = await authPermissionsApi.getUserMenu();

      expect(result.data).toHaveLength(1);
    });

    it('should handle concurrent API calls', async () => {
      const mockResponse = { data: [] };
      mockedGet.mockResolvedValue(mockResponse);
      mockedPost.mockResolvedValue(mockResponse);

      const promises = [
        authPermissionsApi.getUserPermissions(),
        authPermissionsApi.getUserMenu(),
        authPermissionsApi.getUserRoles(),
        authPermissionsApi.checkPermission('/test')
      ];

      const results = await Promise.all(promises);
      expect(results).toHaveLength(4);
    });
  });
});