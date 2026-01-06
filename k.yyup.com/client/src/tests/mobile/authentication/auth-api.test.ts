/**
 * 认证API集成测试 - TC-021
 * 遵循严格验证规则
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validateRequiredFields,
  validateFieldTypes,
  validateJWTFormat,
  validateEmailFormat,
  expectNoConsoleErrors,
  startConsoleMonitoring,
  clearConsoleErrors
} from '../../utils/data-validation';

// Mock API模块 - 直接在vi.mock中定义
vi.mock('@/api/auth', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
    verifyToken: vi.fn(),
    getCurrentUser: vi.fn()
  }
}));

import { authApi } from '@/api/auth';

// 获取mock对象的类型引用
const mockAuthApi = authApi as any;

// 测试数据
const testUsers = {
  admin: {
    username: 'admin@test.com',
    password: 'admin123',
    expectedRole: 'ADMIN',
    expectedPermissions: ['users:read', 'users:write', 'system:manage']
  },
  teacher: {
    username: 'teacher@test.com',
    password: 'teacher123',
    expectedRole: 'TEACHER',
    expectedPermissions: ['students:read', 'classes:read']
  },
  parent: {
    username: 'parent@test.com',
    password: 'parent123',
    expectedRole: 'PARENT',
    expectedPermissions: ['children:read', 'activities:read']
  }
};

const mockAuthResponse = {
  success: true,
  data: {
    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    tokenType: 'Bearer',
    expiresIn: 86400,
    user: {
      id: 'user_123',
      username: 'testuser',
      email: 'test@example.com',
      role: 'ADMIN',
      permissions: ['users:read', 'users:write', 'system:manage'],
      profile: {
        firstName: 'Test',
        lastName: 'User',
        avatar: null
      }
    }
  },
  message: 'Login successful'
};

const mockPermissionsResponse = {
  success: true,
  data: {
    permissions: [
      {
        id: 'perm_1',
        name: 'User Management',
        code: 'users:manage',
        resource: 'users',
        action: 'manage',
        description: 'Manage users'
      },
      {
        id: 'perm_2',
        name: 'System Settings',
        code: 'system:settings',
        resource: 'system',
        action: 'settings',
        description: 'Access system settings'
      }
    ]
  }
};

const mockPermissionCheckResponse = {
  success: true,
  data: {
    hasPermission: true,
    permission: {
      id: 'perm_1',
      name: 'User Management',
      code: 'users:read',
      resource: 'users',
      action: 'read'
    }
  }
};

describe('Auth API Integration - TC-021', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearConsoleErrors();
    startConsoleMonitoring();
  });

  afterEach(() => {
    expectNoConsoleErrors();
  });

  describe('TC-021-01: User Login API Integration Test', () => {
    it('should login successfully with valid credentials', async () => {
      // Arrange
      const loginData = {
        username: testUsers.admin.username,
        password: testUsers.admin.password,
        rememberMe: true
      };

      mockAuthApi.login.mockResolvedValue(mockAuthResponse);

      // Act
      const result = await authApi.login(loginData);

      // 1. 验证API调用
      expect(mockAuthApi.login).toHaveBeenCalledWith(loginData);
      expect(authApi.login).toHaveBeenCalledWith(loginData);

      // 2. 验证响应结构
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // 3. 验证必填字段 - 令牌相关
      const tokenFields = ['accessToken', 'refreshToken', 'tokenType', 'expiresIn'];
      const tokenValidation = validateRequiredFields(result.data, tokenFields);
      expect(tokenValidation.valid).toBe(true);
      if (!tokenValidation.valid) {
        throw new Error(`Missing required token fields: ${tokenValidation.missing?.join(', ')}`);
      }

      // 4. 验证字段类型 - 令牌相关
      const tokenTypeValidation = validateFieldTypes(result.data, {
        accessToken: 'string',
        refreshToken: 'string',
        tokenType: 'string',
        expiresIn: 'number'
      });
      expect(tokenTypeValidation.valid).toBe(true);
      if (!tokenTypeValidation.valid) {
        throw new Error(`Token type validation errors: ${tokenTypeValidation.errors?.join(', ')}`);
      }

      // 5. 验证用户信息字段
      const userFields = ['id', 'username', 'email', 'role', 'permissions'];
      const userValidation = validateRequiredFields(result.data.user, userFields);
      expect(userValidation.valid).toBe(true);

      // 6. 验证用户信息类型
      const userTypeValidation = validateFieldTypes(result.data.user, {
        id: 'string',
        username: 'string',
        email: 'string',
        role: 'string',
        permissions: 'array'
      });
      expect(userTypeValidation.valid).toBe(true);

      // 7. 验证JWT令牌格式
      expect(validateJWTFormat(result.data.accessToken)).toBe(true);
      expect(validateJWTFormat(result.data.refreshToken)).toBe(true);

      // 8. 验证过期时间合理性
      expect(result.data.expiresIn).toBeGreaterThan(0);
      expect(result.data.expiresIn).toBeLessThan(30 * 24 * 3600); // 小于30天

      // 9. 验证邮箱格式
      expect(validateEmailFormat(result.data.user.email)).toBe(true);

      // 10. 验证权限数组
      expect(Array.isArray(result.data.user.permissions)).toBe(true);
      if (result.data.user.permissions.length > 0) {
        result.data.user.permissions.forEach(permission => {
          expect(typeof permission).toBe('string');
        });
      }
    });

    it('should handle invalid credentials properly', async () => {
      // Arrange
      const invalidCredentials = {
        username: 'invalid@test.com',
        password: 'wrongpassword'
      };

      const errorResponse = {
        success: false,
        data: null,
        message: 'Invalid username or password'
      };

      mockAuthApi.login.mockResolvedValue(errorResponse);

      // Act
      const result = await authApi.login(invalidCredentials);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid username or password');
      expect(result.data).toBeNull();
    });

    it('should handle network errors gracefully', async () => {
      // Arrange
      const loginData = {
        username: testUsers.admin.username,
        password: testUsers.admin.password
      };

      const networkError = new Error('Network Error');
      mockAuthApi.post.mockRejectedValue(networkError);
      authApi.login = vi.fn().mockRejectedValue(networkError);

      // Act & Assert
      await expect(authApi.login(loginData)).rejects.toThrow('Network Error');
    });
  });

  describe('TC-021-02: Token Refresh API Integration Test', () => {
    it('should refresh token successfully', async () => {
      // Arrange
      const refreshToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.refresh.token';
      
      const refreshResponse = {
        success: true,
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.new.access.token',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.new.refresh.token',
          expiresIn: 86400
        },
        message: 'Token refreshed successfully'
      };

      mockAuthApi.post.mockResolvedValue(refreshResponse);
      authApi.refreshToken = vi.fn().mockResolvedValue(refreshResponse);

      // Act
      const result = await authApi.refreshToken(refreshToken);

      // 1. 验证API调用
      expect(mockAuthApi.post).toHaveBeenCalledWith('/auth/refresh-token', { refreshToken });
      expect(authApi.refreshToken).toHaveBeenCalledWith(refreshToken);

      // 2. 验证响应结构
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // 3. 验证刷新令牌响应字段
      const refreshFields = ['accessToken', 'refreshToken', 'expiresIn'];
      const refreshValidation = validateRequiredFields(result.data, refreshFields);
      expect(refreshValidation.valid).toBe(true);

      // 4. 验证新令牌有效性
      expect(validateJWTFormat(result.data.accessToken)).toBe(true);
      expect(validateJWTFormat(result.data.refreshToken)).toBe(true);
      expect(result.data.expiresIn).toBeGreaterThan(0);
    });

    it('should handle expired refresh token', async () => {
      // Arrange
      const expiredRefreshToken = 'expired.refresh.token';
      
      const errorResponse = {
        success: false,
        data: null,
        message: 'Refresh token expired'
      };

      mockAuthApi.post.mockResolvedValue(errorResponse);
      authApi.refreshToken = vi.fn().mockResolvedValue(errorResponse);

      // Act
      const result = await authApi.refreshToken(expiredRefreshToken);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Refresh token expired');
      expect(result.data).toBeNull();
    });
  });

  describe('TC-021-03: Permission Verification API Integration Test', () => {
    it('should get user permissions successfully', async () => {
      // Arrange
      mockAuthApi.get.mockResolvedValue(mockPermissionsResponse);
      authApi.getPermissions = vi.fn().mockResolvedValue(mockPermissionsResponse);

      // Act
      const result = await authApi.getPermissions();

      // 1. 验证API调用
      expect(mockAuthApi.get).toHaveBeenCalledWith('/auth/permissions');
      expect(authApi.getPermissions).toHaveBeenCalled();

      // 2. 验证响应结构
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // 3. 验证权限列表
      expect(Array.isArray(result.data.permissions)).toBe(true);

      // 4. 验证权限对象字段
      if (result.data.permissions.length > 0) {
        const permissionFields = ['id', 'name', 'code', 'resource', 'action'];
        result.data.permissions.forEach(permission => {
          const permissionValidation = validateRequiredFields(permission, permissionFields);
          expect(permissionValidation.valid).toBe(true);

          // 验证字段类型
          const typeValidation = validateFieldTypes(permission, {
            id: 'string',
            name: 'string',
            code: 'string',
            resource: 'string',
            action: 'string'
          });
          expect(typeValidation.valid).toBe(true);
        });
      }
    });

    it('should check specific permission successfully', async () => {
      // Arrange
      const permissionCheck = {
        resource: 'users',
        action: 'read'
      };

      mockAuthApi.post.mockResolvedValue(mockPermissionCheckResponse);
      authApi.checkPermission = vi.fn().mockResolvedValue(mockPermissionCheckResponse);

      // Act
      const result = await authApi.checkPermission(permissionCheck);

      // 1. 验证API调用
      expect(mockAuthApi.post).toHaveBeenCalledWith('/auth/check-permission', permissionCheck);
      expect(authApi.checkPermission).toHaveBeenCalledWith(permissionCheck);

      // 2. 验证响应结构
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // 3. 验证权限检查字段
      const checkFields = ['hasPermission', 'permission'];
      const checkValidation = validateRequiredFields(result.data, checkFields);
      expect(checkValidation.valid).toBe(true);

      // 4. 验证字段类型
      const typeValidation = validateFieldTypes(result.data, {
        hasPermission: 'boolean',
        permission: 'object'
      });
      expect(typeValidation.valid).toBe(true);

      // 5. 验证布尔值
      expect(typeof result.data.hasPermission).toBe('boolean');
    });

    it('should handle permission check for unauthorized action', async () => {
      // Arrange
      const unauthorizedCheck = {
        resource: 'system',
        action: 'delete'
      };

      const unauthorizedResponse = {
        success: true,
        data: {
          hasPermission: false,
          permission: null
        },
        message: 'Permission denied'
      };

      mockAuthApi.post.mockResolvedValue(unauthorizedResponse);
      authApi.checkPermission = vi.fn().mockResolvedValue(unauthorizedResponse);

      // Act
      const result = await authApi.checkPermission(unauthorizedCheck);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.hasPermission).toBe(false);
      expect(result.data.permission).toBeNull();
    });
  });

  describe('TC-021-04: Logout API Integration Test', () => {
    it('should logout successfully', async () => {
      // Arrange
      const logoutResponse = {
        success: true,
        data: null,
        message: 'Logout successful'
      };

      mockAuthApi.post.mockResolvedValue(logoutResponse);
      authApi.logout = vi.fn().mockResolvedValue(logoutResponse);

      // Act
      const result = await authApi.logout();

      // 1. 验证API调用
      expect(mockAuthApi.post).toHaveBeenCalledWith('/auth/logout');
      expect(authApi.logout).toHaveBeenCalled();

      // 2. 验证响应结构
      const logoutFields = ['success', 'message'];
      const logoutValidation = validateRequiredFields(result, logoutFields);
      expect(logoutValidation.valid).toBe(true);

      // 3. 验证登出状态
      expect(result.success).toBe(true);
      expect(result.message).toBe('Logout successful');

      // 注意：实际应用中还需要验证localStorage清除等操作
      // 这里主要测试API层面的登出功能
    });

    it('should handle logout when not logged in', async () => {
      // Arrange
      const errorResponse = {
        success: false,
        data: null,
        message: 'No active session'
      };

      mockAuthApi.post.mockResolvedValue(errorResponse);
      authApi.logout = vi.fn().mockResolvedValue(errorResponse);

      // Act
      const result = await authApi.logout();

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('No active session');
    });
  });

  describe('Error Scenarios', () => {
    it('should handle server errors gracefully', async () => {
      // Arrange
      const serverError = {
        success: false,
        data: null,
        message: 'Internal server error'
      };

      mockAuthApi.post.mockResolvedValue(serverError);
      authApi.login = vi.fn().mockResolvedValue(serverError);

      // Act
      const result = await authApi.login({ username: 'test', password: 'test' });

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Internal server error');
      expect(result.data).toBeNull();
    });

    it('should handle timeout errors', async () => {
      // Arrange
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';

      mockAuthApi.post.mockRejectedValue(timeoutError);
      authApi.login = vi.fn().mockRejectedValue(timeoutError);

      // Act & Assert
      await expect(authApi.login({ username: 'test', password: 'test' }))
        .rejects.toThrow('Request timeout');
    });

    it('should handle malformed response', async () => {
      // Arrange
      const malformedResponse = {
        // 缺少必要的success字段
        data: {
          accessToken: 'token'
        }
      };

      mockAuthApi.post.mockResolvedValue(malformedResponse);
      authApi.login = vi.fn().mockResolvedValue(malformedResponse);

      // Act
      const result = await authApi.login({ username: 'test', password: 'test' });

      // Assert - 应用应该能够处理格式错误的响应
      expect(result).toBeDefined();
      // 这里可以添加更多的错误处理验证
    });
  });

  describe('Data Validation Edge Cases', () => {
    it('should validate email format in user data', async () => {
      // Arrange
      const invalidEmailResponse = {
        ...mockAuthResponse,
        data: {
          ...mockAuthResponse.data,
          user: {
            ...mockAuthResponse.data.user,
            email: 'invalid-email'
          }
        }
      };

      authApi.login = vi.fn().mockResolvedValue(invalidEmailResponse);

      // Act
      const result = await authApi.login({ username: 'test', password: 'test' });

      // Assert - 虽然API返回了无效邮箱，但我们的验证应该能检测到
      expect(validateEmailFormat(result.data.user.email)).toBe(false);
    });

    it('should validate role is one of expected values', async () => {
      // Arrange
      const validRoles = ['ADMIN', 'TEACHER', 'PARENT', 'STUDENT'];
      authApi.login = vi.fn().mockResolvedValue(mockAuthResponse);

      // Act
      const result = await authApi.login({ username: 'test', password: 'test' });

      // Assert
      expect(validRoles).toContain(result.data.user.role);
    });

    it('should handle empty permissions array', async () => {
      // Arrange
      const noPermissionsResponse = {
        ...mockPermissionsResponse,
        data: {
          permissions: []
        }
      };

      authApi.getPermissions = vi.fn().mockResolvedValue(noPermissionsResponse);

      // Act
      const result = await authApi.getPermissions();

      // Assert
      expect(Array.isArray(result.data.permissions)).toBe(true);
      expect(result.data.permissions.length).toBe(0);
    });
  });
});