/**
 * Auth Middleware 单元测试
 * 测试认证中间件的各种功能
 */

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { verifyToken, checkPermission, checkRole } from '../../../src/middlewares/auth';
import { testUtils } from '../../setup';

// Mock the dependencies
jest.mock('jsonwebtoken');
jest.mock('../../../src/models/index');
jest.mock('../../../src/init', () => ({
  sequelize: {
    query: jest.fn()
  }
}));

const jwt = require('jsonwebtoken');
const { sequelize } = require('../../../src/init');


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

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = testUtils.mockRequest();
    mockResponse = testUtils.mockResponse();
    mockNext = testUtils.mockNext();
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('verifyToken', () => {
    it('should call next() when valid Bearer token is provided', async () => {
      // Setup
      const mockToken = 'valid-jwt-token';
      const mockDecoded = { userId: 121 };
      const mockUserRows = [{ 
        id: 121, 
        username: 'admin', 
        email: 'admin@example.com',
        real_name: '管理员',
        phone: '13800138000',
        status: 'active'
      }];
      const mockRoleRows = [{ role_code: 'admin', role_name: '管理员' }];
      const mockKindergartenRows = [{ id: 1 }];

      mockRequest.headers = { authorization: `Bearer ${mockToken}` };

      // Mock JWT verification
      jwt.verify.mockReturnValue(mockDecoded);
      
      // Mock database queries
      sequelize.query
        .mockResolvedValueOnce([mockUserRows]) // User query
        .mockResolvedValueOnce([mockRoleRows]) // Role query
        .mockResolvedValueOnce([mockKindergartenRows]); // Kindergarten query

      // Execute
      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(mockToken, process.env.JWT_SECRET);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.user).toEqual({
        id: 121,
        username: 'admin',
        role: 'admin' as any,
        email: 'admin@example.com',
        realName: '管理员',
        phone: '13800138000',
        status: 'active',
        isAdmin: true,
        kindergartenId: 1
      });
    });

    it('should return 401 when no authorization header is provided', async () => {
      // Setup
      mockRequest.headers = {};

      // Execute
      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '未提供认证令牌'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header does not start with Bearer', async () => {
      // Setup
      mockRequest.headers = { authorization: 'Invalid-Token-Format' };

      // Execute
      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '未提供认证令牌'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when JWT verification fails', async () => {
      // Setup
      const mockToken = 'invalid-jwt-token';
      mockRequest.headers = { authorization: `Bearer ${mockToken}` };

      // Mock JWT verification to throw error
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Execute
      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(mockToken, process.env.JWT_SECRET);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '无效的认证令牌'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when user does not exist in database', async () => {
      // Setup
      const mockToken = 'valid-jwt-token';
      const mockDecoded = { userId: 999 };
      const mockUserRows = []; // Empty result - user not found

      mockRequest.headers = { authorization: `Bearer ${mockToken}` };

      // Mock JWT verification
      jwt.verify.mockReturnValue(mockDecoded);
      
      // Mock database queries
      sequelize.query.mockResolvedValueOnce([mockUserRows]);

      // Execute
      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '用户不存在或已被禁用'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle database connection errors gracefully', async () => {
      // Setup
      const mockToken = 'valid-jwt-token';
      const mockDecoded = { userId: 121 };

      mockRequest.headers = { authorization: `Bearer ${mockToken}` };

      // Mock JWT verification
      jwt.verify.mockReturnValue(mockDecoded);
      
      // Mock database query to throw error
      sequelize.query.mockRejectedValue(new Error('Database connection failed'));

      // Execute
      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.user).toEqual({
        id: 121,
        username: 'admin',
        role: 'admin' as any,
        email: 'admin@example.com',
        realName: '管理员',
        phone: '13800138000',
        status: 'active',
        isAdmin: true,
        kindergartenId: 1
      });
    });

    it('should handle role query errors gracefully', async () => {
      // Setup
      const mockToken = 'valid-jwt-token';
      const mockDecoded = { userId: 121 };
      const mockUserRows = [{ 
        id: 121, 
        username: 'admin', 
        email: 'admin@example.com',
        real_name: '管理员',
        phone: '13800138000',
        status: 'active'
      }];

      mockRequest.headers = { authorization: `Bearer ${mockToken}` };

      // Mock JWT verification
      jwt.verify.mockReturnValue(mockDecoded);
      
      // Mock database queries
      sequelize.query
        .mockResolvedValueOnce([mockUserRows]) // User query succeeds
        .mockRejectedValue(new Error('Role query failed')); // Role query fails

      // Execute
      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.user).toEqual({
        id: 121,
        username: 'admin',
        role: 'admin' as any,
        email: 'admin@example.com',
        realName: '管理员',
        phone: '13800138000',
        status: 'active',
        isAdmin: true,
        kindergartenId: 1
      });
    });

    it('should use default role when no roles are found', async () => {
      // Setup
      const mockToken = 'valid-jwt-token';
      const mockDecoded = { userId: 121 };
      const mockUserRows = [{ 
        id: 121, 
        username: 'user', 
        email: 'user@example.com',
        real_name: '普通用户',
        phone: '13800138001',
        status: 'active'
      }];
      const mockRoleRows = []; // No roles found

      mockRequest.headers = { authorization: `Bearer ${mockToken}` };

      // Mock JWT verification
      jwt.verify.mockReturnValue(mockDecoded);
      
      // Mock database queries
      sequelize.query
        .mockResolvedValueOnce([mockUserRows]) // User query
        .mockResolvedValueOnce([mockRoleRows]); // Role query returns empty

      // Execute
      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.user).toEqual({
        id: 121,
        username: 'user',
        role: 'user',
        email: 'user@example.com',
        realName: '普通用户',
        phone: '13800138001',
        status: 'active',
        isAdmin: false,
        kindergartenId: null
      });
    });
  });

  describe('checkPermission', () => {
    it('should call next() when user is admin', async () => {
      // Setup
      const permissionCode = 'manage_users';
      mockRequest.user = { id: 121, isAdmin: true };

      // Execute
      await checkPermission(permissionCode)(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(sequelize.query).not.toHaveBeenCalled(); // Admin bypasses permission check
    });

    it('should call next() when user has the required permission', async () => {
      // Setup
      const permissionCode = 'view_students';
      const mockPermissionRows = [{ count: 1 }];
      
      mockRequest.user = { id: 121, isAdmin: false };

      // Mock database query
      sequelize.query.mockResolvedValue([mockPermissionRows]);

      // Execute
      await checkPermission(permissionCode)(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COUNT(*) as count'),
        { replacements: [121, permissionCode] }
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', async () => {
      // Setup
      const permissionCode = 'view_students';
      mockRequest.user = undefined;

      // Execute
      await checkPermission(permissionCode)(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '用户未认证'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when user does not have the required permission', async () => {
      // Setup
      const permissionCode = 'manage_users';
      const mockPermissionRows = [{ count: 0 }];
      
      mockRequest.user = { id: 121, isAdmin: false };

      // Mock database query
      sequelize.query.mockResolvedValue([mockPermissionRows]);

      // Execute
      await checkPermission(permissionCode)(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '权限不足'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully in development mode', async () => {
      // Setup
      const permissionCode = 'view_students';
      process.env.NODE_ENV = 'development';
      mockRequest.headers = { host: 'localhost:3000' };
      mockRequest.user = { id: 121, isAdmin: false };

      // Mock database query to throw error
      sequelize.query.mockRejectedValue(new Error('Database connection failed'));

      // Execute
      await checkPermission(permissionCode)(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled(); // Development mode allows permission on error
    });

    it('should return 500 when database query fails in production', async () => {
      // Setup
      const permissionCode = 'view_students';
      process.env.NODE_ENV = 'production';
      mockRequest.user = { id: 121, isAdmin: false };

      // Mock database query to throw error
      sequelize.query.mockRejectedValue(new Error('Database connection failed'));

      // Execute
      await checkPermission(permissionCode)(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '服务器内部错误'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('checkRole', () => {
    it('should call next() when user has the required role', () => {
      // Setup
      const allowedRoles = ['admin', 'principal'];
      mockRequest.user = { role: 'admin' };

      // Execute
      checkRole(allowedRoles)(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', () => {
      // Setup
      const allowedRoles = ['admin'];
      mockRequest.user = undefined;

      // Execute
      checkRole(allowedRoles)(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '用户未认证'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when user does not have the required role', () => {
      // Setup
      const allowedRoles = ['admin', 'principal'];
      mockRequest.user = { role: 'teacher' };

      // Execute
      checkRole(allowedRoles)(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '角色权限不足'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should work with single role array', () => {
      // Setup
      const allowedRoles = ['admin'];
      mockRequest.user = { role: 'admin' };

      // Execute
      checkRole(allowedRoles)(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle role checking errors gracefully', () => {
      // Setup
      const allowedRoles = ['admin'];
      mockRequest.user = { role: 'admin' };

      // Mock next to throw error
      mockNext.mockImplementation(() => {
        throw new Error('Next middleware error');
      });

      // Execute & Assert
      expect(() => {
        checkRole(allowedRoles)(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow('Next middleware error');
    });
  });
});