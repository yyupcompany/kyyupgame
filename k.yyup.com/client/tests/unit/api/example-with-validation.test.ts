/**
 * 示例测试文件 - 展示如何使用数据验证和控制台监控
 * 
 * 这个文件演示了改进后的测试用例应该如何编写
 */

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
import { 
  validateApiResponse, 
  validateArrayResponse,
  validatePaginatedResponse,
  createValidator 
} from '../../utils/data-validation';
import {
  getConsoleSpy,
  allowConsoleError,
  expectNoConsoleErrors,
  expectConsoleError
} from '../../setup/console-monitoring';

// 模拟API模块
const mockRequest = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn()
};

// 定义接口
interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  phone?: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  PARENT = 'PARENT'
}

// 创建验证器
const userValidator = createValidator<User>({
  requiredFields: ['id', 'username', 'email', 'role', 'status'],
  fieldTypes: {
    id: 'number',
    username: 'string',
    email: 'string',
    role: 'string',
    status: 'number'
  },
  enumFields: {
    role: UserRole
  },
  dateFields: ['createdAt', 'updatedAt']
});

describe('示例: API测试 with 数据验证和控制台监控', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('✅ 正确的测试用例 - 包含数据验证', () => {
    it('should validate single user response structure', async () => {
      // 准备Mock数据
      const mockResponse = {
        success: true,
        data: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          role: 'ADMIN',
          phone: '13800138000',
          status: 1,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      };

      mockRequest.get.mockResolvedValue(mockResponse);

      // 执行API调用
      const result = await mockRequest.get('/api/users/1');

      // 基本断言
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // ✅ 数据结构验证
      const validation = userValidator.validateSingle(result);
      
      expect(validation.valid).toBe(true);
      if (!validation.valid) {
        console.error('Validation errors:', validation.errors);
      }

      // ✅ 控制台错误检查
      expectNoConsoleErrors();
    });

    it('should validate array response structure', async () => {
      // 准备Mock数据
      const mockResponse = {
        success: true,
        data: [
          {
            id: 1,
            username: 'user1',
            email: 'user1@example.com',
            role: 'ADMIN',
            status: 1,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          },
          {
            id: 2,
            username: 'user2',
            email: 'user2@example.com',
            role: 'TEACHER',
            status: 1,
            createdAt: '2024-01-02T00:00:00.000Z',
            updatedAt: '2024-01-02T00:00:00.000Z'
          }
        ]
      };

      mockRequest.get.mockResolvedValue(mockResponse);

      // 执行API调用
      const result = await mockRequest.get('/api/users');

      // 基本断言
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(2);

      // ✅ 数组数据验证
      const validation = userValidator.validateArray(result);
      
      expect(validation.valid).toBe(true);
      if (!validation.valid) {
        console.error('Validation errors:', validation.errors);
      }

      // ✅ 控制台错误检查
      expectNoConsoleErrors();
    });

    it('should validate paginated response structure', async () => {
      // 准备Mock数据
      const mockResponse = {
        success: true,
        data: {
          items: [
            {
              id: 1,
              username: 'user1',
              email: 'user1@example.com',
              role: 'ADMIN',
              status: 1,
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z'
            }
          ],
          total: 1,
          page: 1,
          pageSize: 10
        }
      };

      mockRequest.get.mockResolvedValue(mockResponse);

      // 执行API调用
      const result = await mockRequest.get('/api/users?page=1&pageSize=10');

      // 基本断言
      expect(result.success).toBe(true);
      expect(result.data.items).toBeDefined();
      expect(result.data.total).toBe(1);

      // ✅ 分页数据验证
      const validation = userValidator.validatePaginated(result);
      
      expect(validation.valid).toBe(true);
      if (!validation.valid) {
        console.error('Validation errors:', validation.errors);
      }

      // ✅ 控制台错误检查
      expectNoConsoleErrors();
    });
  });

  describe('✅ 错误处理测试 - 包含控制台监控', () => {
    it('should handle API errors and log to console', async () => {
      // 准备Mock错误
      const mockError = new Error('API Error: User not found');
      mockRequest.get.mockRejectedValue(mockError);

      // 执行API调用并期望抛出错误
      await expect(mockRequest.get('/api/users/999')).rejects.toThrow('API Error');

      // ✅ 验证控制台错误被记录
      // 注意: 如果你的代码会调用console.error,需要验证它
      // expectConsoleError('API Error');
    });

    it('should allow expected console errors', async () => {
      // 准备会产生console.error的场景
      const mockError = new Error('Expected error');
      mockRequest.get.mockRejectedValue(mockError);

      // ✅ 预先允许这个错误
      allowConsoleError('Expected error');

      // 执行API调用
      await expect(mockRequest.get('/api/users/invalid')).rejects.toThrow();

      // 测试不会因为console.error而失败
    });
  });

  describe('❌ 数据验证失败的示例', () => {
    it('should detect missing required fields', async () => {
      // 准备不完整的Mock数据
      const mockResponse = {
        success: true,
        data: {
          id: 1,
          username: 'testuser'
          // 缺少 email, role, status 等必填字段
        }
      };

      mockRequest.get.mockResolvedValue(mockResponse);

      // 执行API调用
      const result = await mockRequest.get('/api/users/1');

      // ✅ 数据验证会失败
      const validation = userValidator.validateSingle(result);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors[0]).toContain('Missing required fields');
    });

    it('should detect invalid field types', async () => {
      // 准备类型错误的Mock数据
      const mockResponse = {
        success: true,
        data: {
          id: '1', // 应该是number,但是string
          username: 'testuser',
          email: 'test@example.com',
          role: 'ADMIN',
          status: '1', // 应该是number,但是string
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      };

      mockRequest.get.mockResolvedValue(mockResponse);

      // 执行API调用
      const result = await mockRequest.get('/api/users/1');

      // ✅ 数据验证会失败
      const validation = userValidator.validateSingle(result);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(err => err.includes('expected type'))).toBe(true);
    });

    it('should detect invalid enum values', async () => {
      // 准备枚举值错误的Mock数据
      const mockResponse = {
        success: true,
        data: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          role: 'INVALID_ROLE', // 不在UserRole枚举中
          status: 1,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      };

      mockRequest.get.mockResolvedValue(mockResponse);

      // 执行API调用
      const result = await mockRequest.get('/api/users/1');

      // ✅ 数据验证会失败
      const validation = userValidator.validateSingle(result);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(err => err.includes('invalid enum value'))).toBe(true);
    });
  });
});

