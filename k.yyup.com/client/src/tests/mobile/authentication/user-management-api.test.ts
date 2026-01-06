/**
 * 用户管理API集成测试 - TC-022
 * 遵循严格验证规则
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  validateRequiredFields,
  validateFieldTypes,
  validateArraySize,
  validateNumberRange,
  validateEmailFormat,
  validatePhoneFormat,
  expectNoConsoleErrors,
  startConsoleMonitoring,
  clearConsoleErrors
} from '../../utils/data-validation';

// Mock API模块
vi.mock('@/api/users', () => ({
  getUserList: vi.fn(),
  getUserDetail: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
  assignClass: vi.fn(),
  removeFromClass: vi.fn()
}));

vi.mock('@/utils/request', () => ({
  request: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

import userApi from '@/api/users';
import { request } from '@/utils/request';
const mockRequest = request as any;

// 测试数据
const mockUserListResponse = {
  success: true,
  data: {
    items: [
      {
        id: 'user_001',
        studentId: 'STU001',
        name: '张三',
        gender: 'MALE',
        age: 5,
        classId: 'class_001',
        className: '小一班',
        status: 'ACTIVE',
        createdAt: '2024-01-15T08:30:00.000Z',
        updatedAt: '2024-01-20T14:20:00.000Z'
      },
      {
        id: 'user_002',
        studentId: 'STU002',
        name: '李四',
        gender: 'FEMALE',
        age: 4,
        classId: 'class_002',
        className: '小二班',
        status: 'ACTIVE',
        createdAt: '2024-01-16T09:15:00.000Z',
        updatedAt: '2024-01-21T10:45:00.000Z'
      }
    ],
    total: 25,
    page: 1,
    pageSize: 20,
    totalPages: 2
  }
};

const mockUserDetailResponse = {
  success: true,
  data: {
    id: 'user_001',
    studentId: 'STU001',
    name: '张三',
    gender: 'MALE',
    birthDate: '2019-03-15',
    age: 5,
    classId: 'class_001',
    className: '小一班',
    status: 'ACTIVE',
    profile: {
      firstName: '三',
      lastName: '张',
      phone: '13800138001',
      address: '北京市朝阳区XXX街道',
      avatar: 'https://example.com/avatar.jpg'
    },
    parents: [
      {
        id: 'parent_001',
        name: '张父',
        relationship: 'FATHER',
        phone: '13800138002'
      },
      {
        id: 'parent_002',
        name: '张母',
        relationship: 'MOTHER',
        phone: '13800138003'
      }
    ],
    permissions: [
      {
        id: 'perm_student_read',
        name: '查看学生信息',
        code: 'student:read'
      },
      {
        id: 'perm_student_update',
        name: '更新学生信息',
        code: 'student:update'
      }
    ],
    createdAt: '2024-01-15T08:30:00.000Z',
    updatedAt: '2024-01-20T14:20:00.000Z',
    lastLoginAt: '2024-01-21T15:30:00.000Z'
  }
};

const mockCreateUserResponse = {
  success: true,
  data: {
    user: {
      id: 'user_003',
      studentId: 'STU003',
      name: '王五',
      gender: 'MALE',
      birthDate: '2019-06-20',
      age: 4,
      classId: 'class_001',
      status: 'ACTIVE',
      profile: {
        firstName: '五',
        lastName: '王',
        phone: '13800138004'
      },
      createdAt: '2024-01-22T11:00:00.000Z'
    },
    message: '用户创建成功'
  }
};

describe('User Management API Integration - TC-022', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearConsoleErrors();
    startConsoleMonitoring();
  });

  afterEach(() => {
    expectNoConsoleErrors();
  });

  describe('TC-022-01: User List API Integration Test', () => {
    it('should get user list with pagination successfully', async () => {
      // Arrange
      const queryParams = {
        page: 1,
        pageSize: 20,
        search: '张',
        status: 'ACTIVE'
      };

      mockRequest.get.mockResolvedValue(mockUserListResponse);
      userApi.getUserList = vi.fn().mockResolvedValue(mockUserListResponse);

      // Act
      const result = await userApi.getUserList(queryParams);

      // 1. 验证API调用
      expect(mockRequest.get).toHaveBeenCalledWith('/users', { params: queryParams });
      expect(userApi.getUserList).toHaveBeenCalledWith(queryParams);

      // 2. 验证响应结构
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // 3. 验证分页字段
      const paginationFields = ['items', 'total', 'page', 'pageSize'];
      const paginationValidation = validateRequiredFields(result.data, paginationFields);
      expect(paginationValidation.valid).toBe(true);
      if (!paginationValidation.valid) {
        throw new Error(`Missing pagination fields: ${paginationValidation.missing?.join(', ')}`);
      }

      // 4. 验证分页字段类型
      const paginationTypeValidation = validateFieldTypes(result.data, {
        items: 'array',
        total: 'number',
        page: 'number',
        pageSize: 'number'
      });
      expect(paginationTypeValidation.valid).toBe(true);

      // 5. 验证数组类型和大小
      expect(Array.isArray(result.data.items)).toBe(true);
      const arrayValidation = validateArraySize(result.data.items, 0, 100);
      expect(arrayValidation.valid).toBe(true);

      // 6. 验证数值范围
      const totalValidation = validateNumberRange(result.data.total, 0);
      expect(totalValidation.valid).toBe(true);
      const pageValidation = validateNumberRange(result.data.page, 1);
      expect(pageValidation.valid).toBe(true);
      const pageSizeValidation = validateNumberRange(result.data.pageSize, 1, 100);
      expect(pageSizeValidation.valid).toBe(true);

      // 7. 验证用户项字段
      if (result.data.items.length > 0) {
        const userFields = ['id', 'studentId', 'name', 'gender', 'age', 'classId'];
        result.data.items.forEach(user => {
          const userValidation = validateRequiredFields(user, userFields);
          expect(userValidation.valid).toBe(true);

          // 验证字段类型
          const userTypeValidation = validateFieldTypes(user, {
            id: 'string',
            studentId: 'string',
            name: 'string',
            gender: 'string',
            age: 'number',
            classId: 'string'
          });
          expect(userTypeValidation.valid).toBe(true);

          // 验证年龄范围
          const ageValidation = validateNumberRange(user.age, 0, 20);
          expect(ageValidation.valid).toBe(true);
        });
      }
    });

    it('should handle empty user list', async () => {
      // Arrange
      const emptyResponse = {
        success: true,
        data: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 20,
          totalPages: 0
        }
      };

      mockRequest.get.mockResolvedValue(emptyResponse);
      userApi.getUserList = vi.fn().mockResolvedValue(emptyResponse);

      // Act
      const result = await userApi.getUserList({ page: 1, pageSize: 20 });

      // Assert
      expect(Array.isArray(result.data.items)).toBe(true);
      expect(result.data.items.length).toBe(0);
      expect(result.data.total).toBe(0);
    });
  });

  describe('TC-022-02: User Detail API Integration Test', () => {
    it('should get user detail successfully', async () => {
      // Arrange
      const userId = 'user_001';

      mockRequest.get.mockResolvedValue(mockUserDetailResponse);
      userApi.getUserDetail = vi.fn().mockResolvedValue(mockUserDetailResponse);

      // Act
      const result = await userApi.getUserDetail(userId);

      // 1. 验证API调用
      expect(mockRequest.get).toHaveBeenCalledWith(`/users/${userId}`);
      expect(userApi.getUserDetail).toHaveBeenCalledWith(userId);

      // 2. 验证响应结构
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // 3. 验证基本信息字段
      const basicFields = ['id', 'studentId', 'name', 'gender', 'age', 'status'];
      const basicValidation = validateRequiredFields(result.data, basicFields);
      expect(basicValidation.valid).toBe(true);

      // 4. 验证详细信息字段
      const detailFields = ['createdAt', 'updatedAt', 'profile', 'parents', 'permissions'];
      const detailValidation = validateRequiredFields(result.data, detailFields);
      expect(detailValidation.valid).toBe(true);

      // 5. 验证字段类型
      const typeValidation = validateFieldTypes(result.data, {
        id: 'string',
        studentId: 'string',
        name: 'string',
        gender: 'string',
        age: 'number',
        status: 'string',
        profile: 'object',
        parents: 'array',
        permissions: 'array'
      });
      expect(typeValidation.valid).toBe(true);

      // 6. 验证权限数据
      if (result.data.permissions && result.data.permissions.length > 0) {
        expect(Array.isArray(result.data.permissions)).toBe(true);
        result.data.permissions.forEach(permission => {
          const permissionFields = ['id', 'name', 'code'];
          const permissionValidation = validateRequiredFields(permission, permissionFields);
          expect(permissionValidation.valid).toBe(true);
        });
      }

      // 7. 验证家长信息
      if (result.data.parents && result.data.parents.length > 0) {
        expect(Array.isArray(result.data.parents)).toBe(true);
        result.data.parents.forEach(parent => {
          const parentFields = ['id', 'name', 'relationship'];
          const parentValidation = validateRequiredFields(parent, parentFields);
          expect(parentValidation.valid).toBe(true);

          // 验证手机号格式
          if (parent.phone) {
            expect(validatePhoneFormat(parent.phone)).toBe(true);
          }
        });
      }

      // 8. 验证联系方式格式
      if (result.data.profile) {
        if (result.data.profile.phone) {
          expect(validatePhoneFormat(result.data.profile.phone)).toBe(true);
        }
      }

      // 9. 验证日期格式
      expect(validateDateFormat(result.data.createdAt)).toBe(true);
      expect(validateDateFormat(result.data.updatedAt)).toBe(true);
      if (result.data.lastLoginAt) {
        expect(validateDateFormat(result.data.lastLoginAt)).toBe(true);
      }
    });

    it('should handle user not found', async () => {
      // Arrange
      const userId = 'nonexistent_user';
      const notFoundResponse = {
        success: false,
        data: null,
        message: 'User not found'
      };

      mockRequest.get.mockResolvedValue(notFoundResponse);
      userApi.getUserDetail = vi.fn().mockResolvedValue(notFoundResponse);

      // Act
      const result = await userApi.getUserDetail(userId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.message).toBe('User not found');
    });
  });

  describe('TC-022-03: User Creation API Integration Test', () => {
    it('should create user successfully', async () => {
      // Arrange
      const newUser = {
        name: '赵六',
        gender: 'FEMALE',
        birthDate: '2019-08-10',
        classId: 'class_002',
        profile: {
          firstName: '六',
          lastName: '赵',
          phone: '13800138005',
          address: '北京市海淀区XXX路'
        },
        parentIds: ['parent_003', 'parent_004']
      };

      mockRequest.post.mockResolvedValue(mockCreateUserResponse);
      userApi.createUser = vi.fn().mockResolvedValue(mockCreateUserResponse);

      // Act
      const result = await userApi.createUser(newUser);

      // 1. 验证API调用
      expect(mockRequest.post).toHaveBeenCalledWith('/users', newUser);
      expect(userApi.createUser).toHaveBeenCalledWith(newUser);

      // 2. 验证响应结构
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // 3. 验证创建用户字段
      const createdFields = ['id', 'studentId', 'name', 'status'];
      const createdValidation = validateRequiredFields(result.data.user, createdFields);
      expect(createdValidation.valid).toBe(true);

      // 4. 验证学号格式
      expect(result.data.user.studentId).toMatch(/^STU\d{3}$/);

      // 5. 验证状态默认值
      expect(result.data.user.status).toBe('ACTIVE');

      // 6. 验证字段类型
      const typeValidation = validateFieldTypes(result.data.user, {
        id: 'string',
        studentId: 'string',
        name: 'string',
        status: 'string'
      });
      expect(typeValidation.valid).toBe(true);

      // 7. 验证创建时间
      expect(validateDateFormat(result.data.user.createdAt)).toBe(true);

      // 8. 验证联系方式格式
      if (result.data.user.profile && result.data.user.profile.phone) {
        expect(validatePhoneFormat(result.data.user.profile.phone)).toBe(true);
      }
    });

    it('should handle validation errors during user creation', async () => {
      // Arrange
      const invalidUser = {
        name: '', // 空名称
        gender: 'INVALID', // 无效性别
        birthDate: 'invalid-date' // 无效日期
      };

      const validationErrorResponse = {
        success: false,
        data: {
          errors: [
            { field: 'name', message: 'Name is required' },
            { field: 'gender', message: 'Invalid gender value' },
            { field: 'birthDate', message: 'Invalid date format' }
          ]
        },
        message: 'Validation failed'
      };

      mockRequest.post.mockResolvedValue(validationErrorResponse);
      userApi.createUser = vi.fn().mockResolvedValue(validationErrorResponse);

      // Act
      const result = await userApi.createUser(invalidUser);

      // Assert
      expect(result.success).toBe(false);
      expect(result.data.errors).toBeDefined();
      expect(Array.isArray(result.data.errors)).toBe(true);
    });
  });

  describe('TC-022-04: User Update API Integration Test', () => {
    it('should update user successfully', async () => {
      // Arrange
      const userId = 'user_001';
      const updateData = {
        name: '张三丰',
        profile: {
          phone: '13800138006',
          address: '北京市西城区XXX街道'
        }
      };

      const updateResponse = {
        success: true,
        data: {
          user: {
            id: userId,
            name: '张三丰',
            profile: {
              phone: '13800138006',
              address: '北京市西城区XXX街道'
            },
            updatedAt: '2024-01-22T16:30:00.000Z'
          },
          message: 'User updated successfully'
        }
      };

      mockRequest.put.mockResolvedValue(updateResponse);
      userApi.updateUser = vi.fn().mockResolvedValue(updateResponse);

      // Act
      const result = await userApi.updateUser(userId, updateData);

      // 1. 验证API调用
      expect(mockRequest.put).toHaveBeenCalledWith(`/users/${userId}`, updateData);
      expect(userApi.updateUser).toHaveBeenCalledWith(userId, updateData);

      // 2. 验证响应结构
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // 3. 验证更新字段
      const updatedFields = ['id', 'name', 'updatedAt'];
      const updatedValidation = validateRequiredFields(result.data.user, updatedFields);
      expect(updatedValidation.valid).toBe(true);

      // 4. 验证字段类型
      const typeValidation = validateFieldTypes(result.data.user, {
        id: 'string',
        name: 'string',
        updatedAt: 'string'
      });
      expect(typeValidation.valid).toBe(true);

      // 5. 验证数据变更
      expect(result.data.user.name).toBe(updateData.name);
      expect(result.data.user.profile.phone).toBe(updateData.profile.phone);

      // 6. 验证更新时间
      expect(validateDateFormat(result.data.user.updatedAt)).toBe(true);

      // 7. 验证联系方式格式
      expect(validatePhoneFormat(result.data.user.profile.phone)).toBe(true);
    });

    it('should handle user not found during update', async () => {
      // Arrange
      const userId = 'nonexistent_user';
      const updateData = { name: 'Updated Name' };

      const notFoundResponse = {
        success: false,
        data: null,
        message: 'User not found'
      };

      mockRequest.put.mockResolvedValue(notFoundResponse);
      userApi.updateUser = vi.fn().mockResolvedValue(notFoundResponse);

      // Act
      const result = await userApi.updateUser(userId, updateData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.message).toBe('User not found');
    });
  });

  describe('TC-022-05: User Deletion API Integration Test', () => {
    it('should delete user successfully', async () => {
      // Arrange
      const userId = 'user_001';

      const deleteResponse = {
        success: true,
        data: {
          deleted: true,
          userId: userId,
          message: 'User deleted successfully'
        }
      };

      mockRequest.delete.mockResolvedValue(deleteResponse);
      userApi.deleteUser = vi.fn().mockResolvedValue(deleteResponse);

      // Act
      const result = await userApi.deleteUser(userId);

      // 1. 验证API调用
      expect(mockRequest.delete).toHaveBeenCalledWith(`/users/${userId}`);
      expect(userApi.deleteUser).toHaveBeenCalledWith(userId);

      // 2. 验证响应结构
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // 3. 验证删除确认字段
      const deleteFields = ['deleted', 'userId'];
      const deleteValidation = validateRequiredFields(result.data, deleteFields);
      expect(deleteValidation.valid).toBe(true);

      // 4. 验证字段类型
      const typeValidation = validateFieldTypes(result.data, {
        deleted: 'boolean',
        userId: 'string'
      });
      expect(typeValidation.valid).toBe(true);

      // 5. 验证删除状态
      expect(result.data.deleted).toBe(true);
      expect(result.data.userId).toBe(userId);
    });

    it('should handle user not found during deletion', async () => {
      // Arrange
      const userId = 'nonexistent_user';

      const notFoundResponse = {
        success: false,
        data: null,
        message: 'User not found'
      };

      mockRequest.delete.mockResolvedValue(notFoundResponse);
      userApi.deleteUser = vi.fn().mockResolvedValue(notFoundResponse);

      // Act
      const result = await userApi.deleteUser(userId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.message).toBe('User not found');
    });
  });

  describe('Error Scenarios', () => {
    it('should handle network errors', async () => {
      // Arrange
      const networkError = new Error('Network Error');
      mockRequest.get.mockRejectedValue(networkError);
      userApi.getUserList = vi.fn().mockRejectedValue(networkError);

      // Act & Assert
      await expect(userApi.getUserList()).rejects.toThrow('Network Error');
    });

    it('should handle server errors', async () => {
      // Arrange
      const serverError = {
        success: false,
        data: null,
        message: 'Internal server error'
      };

      mockRequest.get.mockResolvedValue(serverError);
      userApi.getUserList = vi.fn().mockResolvedValue(serverError);

      // Act
      const result = await userApi.getUserList();

      // Assert
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.message).toBe('Internal server error');
    });

    it('should handle timeout errors', async () => {
      // Arrange
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';

      mockRequest.get.mockRejectedValue(timeoutError);
      userApi.getUserDetail = vi.fn().mockRejectedValue(timeoutError);

      // Act & Assert
      await expect(userApi.getUserDetail('user_001')).rejects.toThrow('Request timeout');
    });
  });

  describe('Data Validation Edge Cases', () => {
    it('should validate phone format in response', async () => {
      // Arrange
      const userWithInvalidPhone = {
        ...mockUserDetailResponse,
        data: {
          ...mockUserDetailResponse.data,
          profile: {
            ...mockUserDetailResponse.data.profile,
            phone: 'invalid-phone'
          }
        }
      };

      userApi.getUserDetail = vi.fn().mockResolvedValue(userWithInvalidPhone);

      // Act
      const result = await userApi.getUserDetail('user_001');

      // Assert
      expect(validatePhoneFormat(result.data.profile.phone)).toBe(false);
    });

    it('should handle null/undefined optional fields', async () => {
      // Arrange
      const userWithOptionalNulls = {
        ...mockUserDetailResponse,
        data: {
          ...mockUserDetailResponse.data,
          profile: {
            ...mockUserDetailResponse.data.profile,
            avatar: null,
            address: undefined
          }
        }
      };

      userApi.getUserDetail = vi.fn().mockResolvedValue(userWithOptionalNulls);

      // Act
      const result = await userApi.getUserDetail('user_001');

      // Assert
      expect(result.data.profile.avatar).toBeNull();
      expect(result.data.profile.address).toBeUndefined();
    });
  });
});