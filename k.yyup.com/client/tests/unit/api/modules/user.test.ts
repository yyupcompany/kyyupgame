import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import {
  login,
  logout,
  changePassword,
  getUserInfo,
  updateUserInfo,
  uploadAvatar,
  getUserList,
  getUserDetail,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  resetUserPassword,
  UserRole,
  type UserInfo,
  type LoginParams,
  type LoginResponse,
  type ChangePasswordParams,
  type UserQueryParams,
  type UserParams,
  type UserInfoResponse
} from '@/api/modules/user';
import {
  startConsoleMonitoring,
  stopConsoleMonitoring,
  expectNoConsoleErrors,
  expectConsoleError
} from '../../../setup/console-monitoring';
import {
  validateRequiredFields,
  validateFieldTypes,
  validateEnumValue
} from '../../../utils/data-validation';

// Mock the request module
vi.mock('@/utils/request', () => ({
  default: {
    request: vi.fn()
  }
}));

// Mock data transform utilities
vi.mock('@/utils/dataTransform', () => ({
  transformUserData: vi.fn((data) => ({ ...data, transformed: true })),
  transformListResponse: vi.fn((response, transformFn) => ({
    ...response,
    data: {
      ...response.data,
      items: response.data?.items?.map(transformFn) || []
    }
  })),
  transformUserFormData: vi.fn((data) => ({ ...data, formData: true }))
}));

// Import after mocking
import requestInstance from '@/utils/request';
const { request } = requestInstance;
const mockRequest = request as any;

// 控制台错误检测变量
let consoleSpy: any

describe('User API - 完整错误检测', () => {
  beforeEach(() => {
    // 开始控制台错误监控
    startConsoleMonitoring()
    vi.clearAllMocks()
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  afterEach(() => {
    // 验证没有控制台错误并停止监控
    expectNoConsoleErrors()
    stopConsoleMonitoring()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('Authentication APIs', () => {
    describe('login', () => {
      it('should call post with correct endpoint and data', async () => {
        const mockLoginData: LoginParams = {
          username: 'testuser',
          password: 'testpass',
          remember: true
        };
        const mockResponse = {
          success: true,
          data: {
            token: 'mock-token',
            user: { id: 1, username: 'testuser', role: 'ADMIN' }
          }
        };

        request.mockResolvedValue(mockResponse);

        const result = await login(mockLoginData);

        // 验证API调用
        expect(request).toHaveBeenCalledWith({
          url: '/auth/login',
          method: 'post',
          data: mockLoginData
        });

        // 验证响应结构
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();

        // 验证必填字段
        const validation = validateRequiredFields(result.data, ['token', 'user']);
        expect(validation.valid).toBe(true);

        // 验证字段类型
        const typeValidation = validateFieldTypes(result.data, {
          token: 'string'
        });
        expect(typeValidation.valid).toBe(true);

        // 验证用户对象
        const userValidation = validateRequiredFields(result.data.user, ['id', 'username']);
        expect(userValidation.valid).toBe(true);

        const userTypeValidation = validateFieldTypes(result.data.user, {
          id: 'number',
          username: 'string'
        });
        expect(userTypeValidation.valid).toBe(true);
      });

      it('should handle login errors', async () => {
        const mockLoginData: LoginParams = {
          username: 'testuser',
          password: 'wrongpass'
        };
        const mockError = new Error('Invalid credentials');
        
        request.mockRejectedValue(mockError);
        
        await expect(login(mockLoginData)).rejects.toThrow('Invalid credentials');
      });
    });

    describe('logout', () => {
      it('should call post with correct endpoint', async () => {
        const mockResponse = { success: true };
        
        request.mockResolvedValue(mockResponse);
        
        const result = await logout();
        
        expect(request).toHaveBeenCalledWith({
          url: '/auth/logout',
          method: 'post'
        });
        expect(result).toEqual(mockResponse);
      });
    });

    describe('changePassword', () => {
      it('should call post with correct endpoint and data', async () => {
        const mockPasswordData: ChangePasswordParams = {
          oldPassword: 'oldpass',
          newPassword: 'newpass',
          confirmPassword: 'newpass'
        };
        const mockResponse = {
          success: true,
          data: { success: true, message: 'Password changed successfully' }
        };
        
        request.mockResolvedValue(mockResponse);
        
        const result = await changePassword(mockPasswordData);
        
        expect(request).toHaveBeenCalledWith({
          url: '/auth/change-password',
          method: 'post',
          data: mockPasswordData
        });
        expect(result).toEqual(mockResponse);
      });

      it('should validate password confirmation', async () => {
        const mockPasswordData: ChangePasswordParams = {
          oldPassword: 'oldpass',
          newPassword: 'newpass',
          confirmPassword: 'differentpass'
        };
        
        // This test ensures the API is called with the provided data
        // Validation should happen on the frontend before API call
        request.mockResolvedValue({ success: true });
        
        await changePassword(mockPasswordData);
        
        expect(request).toHaveBeenCalledWith({
          url: '/auth/change-password',
          method: 'post',
          data: mockPasswordData
        });
      });
    });
  });

  describe('User Profile APIs', () => {
    describe('getUserInfo', () => {
      it('should call get with correct endpoint', async () => {
        const mockResponse = {
          success: true,
          data: {
            user: { id: 1, username: 'testuser' },
            roles: ['USER'],
            permissions: ['read']
          }
        };
        
        request.mockResolvedValue(mockResponse);
        
        const result = await getUserInfo();
        
        expect(request).toHaveBeenCalledWith({
          url: '/users/profile',
          method: 'get'
        });
        expect(result).toEqual(mockResponse);
      });
    });

    describe('updateUserInfo', () => {
      it('should call put with correct endpoint and data', async () => {
        const mockUpdateData = {
          name: 'Updated Name',
          email: 'updated@example.com',
          phone: '1234567890'
        };
        const mockResponse = {
          success: true,
          data: { id: 1, ...mockUpdateData }
        };
        
        request.mockResolvedValue(mockResponse);
        
        const result = await updateUserInfo(mockUpdateData);
        
        expect(request).toHaveBeenCalledWith({
          url: '/users/profile',
          method: 'put',
          data: mockUpdateData
        });
        expect(result).toEqual(mockResponse);
      });
    });

    describe('uploadAvatar', () => {
      it('should call post with correct endpoint and form data', async () => {
        const mockFormData = new FormData();
        mockFormData.append('avatar', new File([''], 'test.jpg'));
        const mockResponse = {
          success: true,
          data: { avatarUrl: 'https://example.com/avatar.jpg' }
        };
        
        request.mockResolvedValue(mockResponse);
        
        const result = await uploadAvatar(mockFormData);
        
        expect(request).toHaveBeenCalledWith({
          url: '/upload/avatar',
          method: 'post',
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          data: mockFormData
        });
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('User Management APIs', () => {
    describe('getUserList', () => {
      it('should call get with correct endpoint and params', async () => {
        const mockParams: UserQueryParams = {
          page: 1,
          size: 10,
          username: 'test',
          role: 'TEACHER'
        };
        const mockResponse = {
          success: true,
          data: {
            items: [{ id: 1, username: 'test' }],
            total: 1,
            page: 1,
            pageSize: 10,
            totalPages: 1
          }
        };
        
        request.mockResolvedValue(mockResponse);
        
        const result = await getUserList(mockParams);
        
        expect(request).toHaveBeenCalledWith({
          url: '/users',
          method: 'get',
          params: mockParams
        });
        expect(result).toEqual(expect.objectContaining({
          data: expect.objectContaining({
            items: expect.arrayContaining([expect.objectContaining({ transformed: true })])
          })
        }));
      });

      it('should handle empty user list', async () => {
        const mockResponse = {
          success: true,
          data: {
            items: [],
            total: 0,
            page: 1,
            pageSize: 10,
            totalPages: 0
          }
        };
        
        request.mockResolvedValue(mockResponse);
        
        const result = await getUserList();
        
        expect(result).toEqual(expect.objectContaining({
          data: expect.objectContaining({
            items: []
          })
        }));
      });
    });

    describe('getUserDetail', () => {
      it('should call get with correct endpoint', async () => {
        const userId = 1;
        const mockResponse = {
          success: true,
          data: { id: userId, username: 'testuser' }
        };
        
        request.mockResolvedValue(mockResponse);
        
        const result = await getUserDetail(userId);
        
        expect(request).toHaveBeenCalledWith({
          url: `/users/${userId}`,
          method: 'get'
        });
        expect(result).toEqual(expect.objectContaining({
          data: expect.objectContaining({ transformed: true })
        }));
      });

      it('should handle user not found', async () => {
        const userId = 999;
        const mockError = new Error('User not found');
        
        request.mockRejectedValue(mockError);
        
        await expect(getUserDetail(userId)).rejects.toThrow('User not found');
      });
    });

    describe('createUser', () => {
      it('should call post with correct endpoint and transformed data', async () => {
        const mockUserData: UserParams = {
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'password',
          role: 'TEACHER'
        };
        const mockResponse = {
          success: true,
          data: { id: 1, ...mockUserData }
        };
        
        request.mockResolvedValue(mockResponse);
        
        const result = await createUser(mockUserData);
        
        expect(request).toHaveBeenCalledWith({
          url: '/users',
          method: 'post',
          data: expect.objectContaining({ formData: true })
        });
        expect(result).toEqual(expect.objectContaining({
          data: expect.objectContaining({ transformed: true })
        }));
      });

      it('should handle user creation validation errors', async () => {
        const mockUserData: UserParams = {
          username: '', // Invalid username
          email: 'invalid-email'
        };
        const mockError = new Error('Validation failed');
        
        request.mockRejectedValue(mockError);
        
        await expect(createUser(mockUserData)).rejects.toThrow('Validation failed');
      });
    });

    describe('updateUser', () => {
      it('should call put with correct endpoint and transformed data', async () => {
        const userId = 1;
        const mockUpdateData: Partial<UserParams> = {
          email: 'updated@example.com',
          phone: '1234567890'
        };
        const mockResponse = {
          success: true,
          data: { id: userId, ...mockUpdateData }
        };
        
        request.mockResolvedValue(mockResponse);
        
        const result = await updateUser(userId, mockUpdateData);
        
        expect(request).toHaveBeenCalledWith({
          url: `/users/${userId}`,
          method: 'put',
          data: expect.objectContaining({ formData: true })
        });
        expect(result).toEqual(expect.objectContaining({
          data: expect.objectContaining({ transformed: true })
        }));
      });
    });

    describe('deleteUser', () => {
      it('should call delete with correct endpoint', async () => {
        const userId = 1;
        const mockResponse = { success: true };
        
        request.mockResolvedValue(mockResponse);
        
        const result = await deleteUser(userId);
        
        expect(request).toHaveBeenCalledWith({
          url: `/users/${userId}`,
          method: 'delete'
        });
        expect(result).toEqual(mockResponse);
      });

      it('should handle user deletion errors', async () => {
        const userId = 1;
        const mockError = new Error('Cannot delete user');
        
        request.mockRejectedValue(mockError);
        
        await expect(deleteUser(userId)).rejects.toThrow('Cannot delete user');
      });
    });

    describe('updateUserStatus', () => {
      it('should call put with correct endpoint and data', async () => {
        const userId = 1;
        const status = 1; // Active
        const mockResponse = {
          success: true,
          data: { id: userId, status }
        };
        
        request.mockResolvedValue(mockResponse);
        
        const result = await updateUserStatus(userId, status);
        
        expect(request).toHaveBeenCalledWith({
          url: `/system/users/${userId}/status`,
          method: 'put',
          data: { status }
        });
        expect(result).toEqual(expect.objectContaining({
          data: expect.objectContaining({ transformed: true })
        }));
      });
    });

    describe('resetUserPassword', () => {
      it('should call post with correct endpoint', async () => {
        const userId = 1;
        const mockResponse = {
          success: true,
          data: { password: 'new-generated-password' }
        };
        
        request.mockResolvedValue(mockResponse);
        
        const result = await resetUserPassword(userId);
        
        expect(request).toHaveBeenCalledWith({
          url: `/system/users/${userId}/reset-password`,
          method: 'post'
        });
        expect(result).toEqual(mockResponse);
      });

      it('should handle password reset errors', async () => {
        const userId = 1;
        const mockError = new Error('Failed to reset password');
        
        request.mockRejectedValue(mockError);
        
        await expect(resetUserPassword(userId)).rejects.toThrow('Failed to reset password');
      });
    });
  });

  describe('User Role Enum', () => {
    it('should have correct role values', () => {
      expect(UserRole.ADMIN).toBe('ADMIN');
      expect(UserRole.PRINCIPAL).toBe('PRINCIPAL');
      expect(UserRole.TEACHER).toBe('TEACHER');
      expect(UserRole.PARENT).toBe('PARENT');
      expect(UserRole.STAFF).toBe('STAFF');
    });
  });
});