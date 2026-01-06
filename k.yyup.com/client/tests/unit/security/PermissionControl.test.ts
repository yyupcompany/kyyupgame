
vi.mock('@/components/security/PermissionControl.vue', () => ({
  default: {
    name: 'PermissionControl',
    template: '<div>Mocked security/PermissionControl</div>'
  }
}))

import { 
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

describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import PermissionControl from '@/components/security/PermissionControl.vue';
import { useAuthStore } from '@/stores/auth';
import { usePermissionStore } from '@/stores/permission';
import { useRoleStore } from '@/stores/role';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

describe('PermissionControl', () => {
  let wrapper: any;
  let authStore: any;
  let permissionStore: any;
  let roleStore: any;

  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
    authStore = useAuthStore();
    permissionStore = usePermissionStore();
    roleStore = useRoleStore();

    // Mock initial data
    authStore.user = null;
    permissionStore.permissions = [];
    roleStore.roles = [];

    wrapper = mount(PermissionControl, {
      global: {
        stubs: ['el-card', 'el-table', 'el-button', 'el-tag', 'el-dialog', 'el-form', 'el-form-item', 'el-input', 'el-select', 'el-option', 'el-tree', 'el-checkbox', 'el-checkbox-group'],
        plugins: []
      }
    });
  });

  describe('Role-Based Access Control (RBAC)', () => {
    it('should validate user permissions based on role', async () => {
      const user = {
        id: 1,
        username: 'admin',
        role: 'admin',
        permissions: ['user:read', 'user:write', 'user:delete', 'system:manage']
      };

      authStore.user = user;

      const canReadUsers = await wrapper.vm.hasPermission('user:read');
      const canWriteUsers = await wrapper.vm.hasPermission('user:write');
      const canDeleteUsers = await wrapper.vm.hasPermission('user:delete');
      const canManageSystem = await wrapper.vm.hasPermission('system:manage');
      const canAccessFinance = await wrapper.vm.hasPermission('finance:read');

      expect(canReadUsers).toBe(true);
      expect(canWriteUsers).toBe(true);
      expect(canDeleteUsers).toBe(true);
      expect(canManageSystem).toBe(true);
      expect(canAccessFinance).toBe(false);
    });

    it('should handle hierarchical role permissions', async () => {
      const roles = [
        {
          id: 1,
          name: 'admin',
          permissions: ['*'], // Wildcard for all permissions
          level: 3
        },
        {
          id: 2,
          name: 'manager',
          permissions: ['user:read', 'user:write', 'finance:read', 'finance:write'],
          level: 2
        },
        {
          id: 3,
          name: 'teacher',
          permissions: ['student:read', 'student:write', 'course:read'],
          level: 1
        }
      ];

      roleStore.roles = roles;

      const adminPermissions = await wrapper.vm.getRolePermissions('admin');
      const managerPermissions = await wrapper.vm.getRolePermissions('manager');
      const teacherPermissions = await wrapper.vm.getRolePermissions('teacher');

      expect(adminPermissions).toContain('*');
      expect(managerPermissions).toContain('user:read');
      expect(managerPermissions).not.toContain('system:manage');
      expect(teacherPermissions).toContain('student:read');
      expect(teacherPermissions).not.toContain('finance:read');
    });

    it('should validate permission inheritance', async () => {
      const roleHierarchy = {
        admin: ['manager', 'teacher'],
        manager: ['teacher'],
        teacher: []
      };

      const userRole = 'manager';
      const inheritedPermissions = await wrapper.vm.getInheritedPermissions(userRole, roleHierarchy);
      
      expect(inheritedPermissions).toContain('manager');
      expect(inheritedPermissions).toContain('teacher');
      expect(inheritedPermissions).not.toContain('admin');
    });
  });

  describe('Permission Management', () => {
    it('should create new permissions', async () => {
      const newPermission = {
        name: 'analytics:read',
        description: 'Access to analytics data',
        resource: 'analytics',
        action: 'read'
      };

      mockedAxios.post.mockResolvedValue({
        data: {
          success: true,
          permission: newPermission
        }
      });

      const result = await wrapper.vm.createPermission(newPermission);
      expect(result.success).toBe(true);
      expect(result.permission.name).toBe('analytics:read');
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/permissions', newPermission);
    });

    it('should update existing permissions', async () => {
      const permissionId = 1;
      const updatedPermission = {
        name: 'user:manage',
        description: 'Full user management access',
        resource: 'user',
        action: 'manage'
      };

      mockedAxios.put.mockResolvedValue({
        data: {
          success: true,
          permission: updatedPermission
        }
      });

      const result = await wrapper.vm.updatePermission(permissionId, updatedPermission);
      expect(result.success).toBe(true);
      expect(mockedAxios.put).toHaveBeenCalledWith(`/api/permissions/${permissionId}`, updatedPermission);
    });

    it('should delete permissions', async () => {
      const permissionId = 1;

      mockedAxios.delete.mockResolvedValue({
        data: {
          success: true
        }
      });

      const result = await wrapper.vm.deletePermission(permissionId);
      expect(result.success).toBe(true);
      expect(mockedAxios.delete).toHaveBeenCalledWith(`/api/permissions/${permissionId}`);
    });

    it('should list all permissions', async () => {
      const mockPermissions = [
        { id: 1, name: 'user:read', description: 'Read user data' },
        { id: 2, name: 'user:write', description: 'Write user data' },
        { id: 3, name: 'finance:read', description: 'Read financial data' }
      ];

      mockedAxios.get.mockResolvedValue({
        data: {
          success: true,
          permissions: mockPermissions
        }
      });

      const result = await wrapper.vm.listPermissions();
      expect(result.success).toBe(true);
      expect(result.permissions.length).toBe(3);
      expect(result.permissions[0].name).toBe('user:read');
    });
  });

  describe('Role Management', () => {
    it('should create new roles', async () => {
      const newRole = {
        name: 'analyst',
        description: 'Data analyst role',
        permissions: ['analytics:read', 'reports:read'],
        level: 1
      };

      mockedAxios.post.mockResolvedValue({
        data: {
          success: true,
          role: newRole
        }
      });

      const result = await wrapper.vm.createRole(newRole);
      expect(result.success).toBe(true);
      expect(result.role.name).toBe('analyst');
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/roles', newRole);
    });

    it('should assign permissions to roles', async () => {
      const roleId = 1;
      const permissionIds = [1, 2, 3];

      mockedAxios.post.mockResolvedValue({
        data: {
          success: true
        }
      });

      const result = await wrapper.vm.assignPermissionsToRole(roleId, permissionIds);
      expect(result.success).toBe(true);
      expect(mockedAxios.post).toHaveBeenCalledWith(`/api/roles/${roleId}/permissions`, { permissionIds });
    });

    it('should remove permissions from roles', async () => {
      const roleId = 1;
      const permissionId = 2;

      mockedAxios.delete.mockResolvedValue({
        data: {
          success: true
        }
      });

      const result = await wrapper.vm.removePermissionFromRole(roleId, permissionId);
      expect(result.success).toBe(true);
      expect(mockedAxios.delete).toHaveBeenCalledWith(`/api/roles/${roleId}/permissions/${permissionId}`);
    });

    it('should get role permissions', async () => {
      const roleId = 1;
      const mockPermissions = [
        { id: 1, name: 'user:read' },
        { id: 2, name: 'user:write' }
      ];

      mockedAxios.get.mockResolvedValue({
        data: {
          success: true,
          permissions: mockPermissions
        }
      });

      const result = await wrapper.vm.getRolePermissions(roleId);
      expect(result.success).toBe(true);
      expect(result.permissions.length).toBe(2);
    });
  });

  describe('User Permission Assignment', () => {
    it('should assign roles to users', async () => {
      const userId = 1;
      const roleIds = [1, 2];

      mockedAxios.post.mockResolvedValue({
        data: {
          success: true
        }
      });

      const result = await wrapper.vm.assignRolesToUser(userId, roleIds);
      expect(result.success).toBe(true);
      expect(mockedAxios.post).toHaveBeenCalledWith(`/api/users/${userId}/roles`, { roleIds });
    });

    it('should assign specific permissions to users', async () => {
      const userId = 1;
      const permissionIds = [1, 2, 3];

      mockedAxios.post.mockResolvedValue({
        data: {
          success: true
        }
      });

      const result = await wrapper.vm.assignPermissionsToUser(userId, permissionIds);
      expect(result.success).toBe(true);
      expect(mockedAxios.post).toHaveBeenCalledWith(`/api/users/${userId}/permissions`, { permissionIds });
    });

    it('should get user permissions', async () => {
      const userId = 1;
      const mockUserPermissions = [
        { id: 1, name: 'user:read' },
        { id: 2, name: 'student:read' },
        { id: 3, name: 'course:read' }
      ];

      mockedAxios.get.mockResolvedValue({
        data: {
          success: true,
          permissions: mockUserPermissions
        }
      });

      const result = await wrapper.vm.getUserPermissions(userId);
      expect(result.success).toBe(true);
      expect(result.permissions.length).toBe(3);
    });

    it('should check if user has specific permission', async () => {
      const userId = 1;
      const permissionName = 'user:read';

      mockedAxios.get.mockResolvedValue({
        data: {
          success: true,
          hasPermission: true
        }
      });

      const result = await wrapper.vm.checkUserPermission(userId, permissionName);
      expect(result.success).toBe(true);
      expect(result.hasPermission).toBe(true);
    });
  });

  describe('Permission Validation and Authorization', () => {
    it('should validate route access based on permissions', async () => {
      const routePermissions = {
        '/users': ['user:read'],
        '/users/create': ['user:write'],
        '/finance': ['finance:read'],
        '/system': ['system:manage']
      };

      const userPermissions = ['user:read', 'finance:read'];

      const canAccessUsers = await wrapper.vm.validateRouteAccess('/users', userPermissions, routePermissions);
      const canAccessUsersCreate = await wrapper.vm.validateRouteAccess('/users/create', userPermissions, routePermissions);
      const canAccessFinance = await wrapper.vm.validateRouteAccess('/finance', userPermissions, routePermissions);
      const canAccessSystem = await wrapper.vm.validateRouteAccess('/system', userPermissions, routePermissions);

      expect(canAccessUsers).toBe(true);
      expect(canAccessUsersCreate).toBe(false);
      expect(canAccessFinance).toBe(true);
      expect(canAccessSystem).toBe(false);
    });

    it('should validate component access based on permissions', async () => {
      const componentPermissions = {
        'UserTable': ['user:read'],
        'UserForm': ['user:write'],
        'FinanceDashboard': ['finance:read'],
        'SystemSettings': ['system:manage']
      };

      const userPermissions = ['user:read', 'finance:read'];

      const canSeeUserTable = await wrapper.vm.validateComponentAccess('UserTable', userPermissions, componentPermissions);
      const canSeeUserForm = await wrapper.vm.validateComponentAccess('UserForm', userPermissions, componentPermissions);
      const canSeeFinanceDashboard = await wrapper.vm.validateComponentAccess('FinanceDashboard', userPermissions, componentPermissions);
      const canSeeSystemSettings = await wrapper.vm.validateComponentAccess('SystemSettings', userPermissions, componentPermissions);

      expect(canSeeUserTable).toBe(true);
      expect(canSeeUserForm).toBe(false);
      expect(canSeeFinanceDashboard).toBe(true);
      expect(canSeeSystemSettings).toBe(false);
    });

    it('should validate API endpoint access', async () => {
      const apiPermissions = {
        'GET /api/users': ['user:read'],
        'POST /api/users': ['user:write'],
        'GET /api/finance': ['finance:read'],
        'PUT /api/users/:id': ['user:write']
      };

      const userPermissions = ['user:read', 'finance:read'];

      const canGetUsers = await wrapper.vm.validateApiAccess('GET', '/api/users', userPermissions, apiPermissions);
      const canPostUsers = await wrapper.vm.validateApiAccess('POST', '/api/users', userPermissions, apiPermissions);
      const canGetFinance = await wrapper.vm.validateApiAccess('GET', '/api/finance', userPermissions, apiPermissions);
      const canPutUser = await wrapper.vm.validateApiAccess('PUT', '/api/users/1', userPermissions, apiPermissions);

      expect(canGetUsers).toBe(true);
      expect(canPostUsers).toBe(false);
      expect(canGetFinance).toBe(true);
      expect(canPutUser).toBe(false);
    });
  });

  describe('Permission Caching and Performance', () => {
    it('should cache user permissions for performance', async () => {
      const userId = 1;
      const mockPermissions = ['user:read', 'finance:read'];

      mockedAxios.get.mockResolvedValue({
        data: {
          success: true,
          permissions: mockPermissions
        }
      });

      // First call should hit API
      const result1 = await wrapper.vm.getUserPermissions(userId);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const result2 = await wrapper.vm.getUserPermissions(userId);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1); // Still 1, not 2

      expect(result1.permissions).toEqual(result2.permissions);
    });

    it('should invalidate permission cache when permissions change', async () => {
      const userId = 1;
      
      // Load initial permissions
      await wrapper.vm.getUserPermissions(userId);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);

      // Simulate permission change
      await wrapper.vm.invalidateUserPermissionCache(userId);

      // Next call should hit API again
      await wrapper.vm.getUserPermissions(userId);
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });

    it('should handle permission cache expiration', async () => {
      const userId = 1;
      const mockPermissions = ['user:read'];

      mockedAxios.get.mockResolvedValue({
        data: {
          success: true,
          permissions: mockPermissions
        }
      });

      // Load permissions
      await wrapper.vm.getUserPermissions(userId);

      // Simulate cache expiration
      vi.advanceTimersByTime(3600000); // 1 hour

      // Next call should hit API again
      await wrapper.vm.getUserPermissions(userId);
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling and Validation', () => {
    it('should handle permission validation errors gracefully', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Permission validation failed'));

      const result = await wrapper.vm.getUserPermissions(1);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should validate permission name format', async () => {
      const validPermissions = [
        'user:read',
        'user:write',
        'finance:read',
        'system:manage',
        'analytics:export'
      ];

      const invalidPermissions = [
        'user',
        'user:',
        ':read',
        'user:read:extra',
        '',
        'user read',
        'user-read'
      ];

      for (const permission of validPermissions) {
        const isValid = await wrapper.vm.validatePermissionName(permission);
        expect(isValid).toBe(true);
      }

      for (const permission of invalidPermissions) {
        const isValid = await wrapper.vm.validatePermissionName(permission);
        expect(isValid).toBe(false);
      }
    });

    it('should prevent permission escalation attacks', async () => {
      const maliciousPermissionRequests = [
        { userId: 1, targetUserId: 2, permission: 'system:manage' },
        { userId: 1, targetUserId: 2, role: 'admin' },
        { userId: 1, targetUserId: 2, permissions: ['*'] }
      ];

      for (const request of maliciousPermissionRequests) {
        const isAllowed = await wrapper.vm.validatePermissionChangeRequest(request);
        expect(isAllowed).toBe(false);
      }
    });
  });

  describe('Audit Logging', () => {
    it('should log permission changes', async () => {
      const permissionChange = {
        userId: 1,
        action: 'assign',
        permission: 'user:write',
        timestamp: Date.now(),
        ipAddress: '192.168.1.100'
      };

      await wrapper.vm.logPermissionChange(permissionChange);
      expect(permissionStore.auditLogs.length).toBeGreaterThan(0);
      expect(permissionStore.auditLogs[0].action).toBe('assign');
    });

    it('should log role assignments', async () => {
      const roleAssignment = {
        userId: 1,
        action: 'assign_role',
        role: 'manager',
        timestamp: Date.now(),
        ipAddress: '192.168.1.100'
      };

      await wrapper.vm.logRoleAssignment(roleAssignment);
      expect(permissionStore.auditLogs.length).toBeGreaterThan(0);
      expect(permissionStore.auditLogs[0].action).toBe('assign_role');
    });

    it('should log access denied events', async () => {
      const accessDenied = {
        userId: 1,
        resource: '/system/settings',
        requiredPermission: 'system:manage',
        timestamp: Date.now(),
        ipAddress: '192.168.1.100'
      };

      await wrapper.vm.logAccessDenied(accessDenied);
      expect(permissionStore.auditLogs.length).toBeGreaterThan(0);
      expect(permissionStore.auditLogs[0].action).toBe('access_denied');
    });
  });

  describe('Bulk Operations', () => {
    it('should handle bulk permission assignment', async () => {
      const bulkAssignment = {
        userIds: [1, 2, 3],
        permissionIds: [1, 2, 3]
      };

      mockedAxios.post.mockResolvedValue({
        data: {
          success: true,
          results: [
            { userId: 1, success: true },
            { userId: 2, success: true },
            { userId: 3, success: true }
          ]
        }
      });

      const result = await wrapper.vm.bulkAssignPermissions(bulkAssignment);
      expect(result.success).toBe(true);
      expect(result.results.length).toBe(3);
      expect(result.results.every(r => r.success)).toBe(true);
    });

    it('should handle bulk role assignment', async () => {
      const bulkRoleAssignment = {
        userIds: [1, 2, 3],
        roleIds: [1, 2]
      };

      mockedAxios.post.mockResolvedValue({
        data: {
          success: true,
          results: [
            { userId: 1, success: true },
            { userId: 2, success: false, error: 'Invalid role' },
            { userId: 3, success: true }
          ]
        }
      });

      const result = await wrapper.vm.bulkAssignRoles(bulkRoleAssignment);
      expect(result.success).toBe(true);
      expect(result.results.length).toBe(3);
      expect(result.results.filter(r => r.success).length).toBe(2);
    });
  });
});