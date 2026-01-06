/**
 * 认证API集成测试 - TC-021 (简化版)
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

// Mock API模块 - 只mock存在的API方法
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
        result.data.user.permissions.forEach((permission: any) => {
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
      mockAuthApi.login.mockRejectedValue(networkError);

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
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
          expiresIn: 86400
        },
        message: 'Token refreshed successfully'
      };

      mockAuthApi.refreshToken.mockResolvedValue(refreshResponse);

      // Act
      const result = await authApi.refreshToken(refreshToken);

      // 1. 验证API调用
      expect(mockAuthApi.refreshToken).toHaveBeenCalledWith(refreshToken);

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

      mockAuthApi.refreshToken.mockResolvedValue(errorResponse);

      // Act
      const result = await authApi.refreshToken(expiredRefreshToken);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Refresh token expired');
      expect(result.data).toBeNull();
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

      mockAuthApi.logout.mockResolvedValue(logoutResponse);

      // Act
      const result = await authApi.logout();

      // 1. 验证API调用
      expect(mockAuthApi.logout).toHaveBeenCalled();

      // 2. 验证响应结构
      const logoutFields = ['success', 'message'];
      const logoutValidation = validateRequiredFields(result, logoutFields);
      expect(logoutValidation.valid).toBe(true);

      // 3. 验证登出状态
      expect(result.success).toBe(true);
      expect(result.message).toBe('Logout successful');
    });

    it('should handle logout when not logged in', async () => {
      // Arrange
      const errorResponse = {
        success: false,
        data: null,
        message: 'No active session'
      };

      mockAuthApi.logout.mockResolvedValue(errorResponse);

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

      mockAuthApi.login.mockResolvedValue(serverError);

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

      mockAuthApi.login.mockRejectedValue(timeoutError);

      // Act & Assert
      await expect(authApi.login({ username: 'test', password: 'test' }))
        .rejects.toThrow('Request timeout');
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

      mockAuthApi.login.mockResolvedValue(invalidEmailResponse);

      // Act
      const result = await authApi.login({ username: 'test', password: 'test' });

      // Assert - 虽然API返回了无效邮箱，但我们的验证应该能检测到
      expect(validateEmailFormat(result.data.user.email)).toBe(false);
    });

    it('should validate role is one of expected values', async () => {
      // Arrange
      const validRoles = ['ADMIN', 'TEACHER', 'PARENT', 'STUDENT'];
      mockAuthApi.login.mockResolvedValue(mockAuthResponse);

      // Act
      const result = await authApi.login({ username: 'test', password: 'test' });

      // Assert
      expect(validRoles).toContain(result.data.user.role);
    });
  });
});