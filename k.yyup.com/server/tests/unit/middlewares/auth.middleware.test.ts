/**
 * 认证中间件测试
 */

import { jest } from '@jest/globals';
import { vi } from 'vitest'
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyToken, checkRole, mockAuthMiddleware } from '../../../src/middlewares/auth.middleware';
import { JWT_SECRET } from '../../../src/config/jwt.config';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../../src/models/index', () => ({
  User: {
    findByPk: jest.fn(),
    findOne: jest.fn()
  },
  UserRole: {
    findAll: jest.fn()
  }
}));

jest.mock('../../../src/init', () => ({
  sequelize: {
    query: jest.fn()
  }
}));


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
    jest.clearAllMocks();
    
    mockRequest = {
      headers: {},
      path: '/api/test',
      user: undefined
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis() as any,
      json: jest.fn().mockReturnThis() as any,
      setHeader: jest.fn() as any,
      removeHeader: jest.fn() as any
    };
    
    mockNext = jest.fn();
  });

  describe('verifyToken', () => {
    it('应该拒绝没有Authorization头的请求', async () => {
      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '未提供认证令牌'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('应该拒绝格式错误的Authorization头', async () => {
      mockRequest.headers!.authorization = 'InvalidFormat token123';
      
      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '未提供认证令牌'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('应该验证有效的JWT令牌', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
        status: 'active'
      };

      const mockDecodedToken = {
        userId: 1,
        username: 'testuser',
        type: 'access'
      };

      mockRequest.headers!.authorization = 'Bearer validtoken123';
      
      (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);
      
      const { User } = require('../../../src/models/index');
      User.findByPk.mockResolvedValue(mockUser);
      
      const { sequelize } = require('../../../src/init');
      sequelize.query.mockResolvedValue([[{ role_name: 'user' }]]);

      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(jwt.verify).toHaveBeenCalledWith('validtoken123', JWT_SECRET);
      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(mockRequest.user).toEqual(expect.objectContaining({
        id: 1,
        username: 'testuser',
        role: 'user'
      }));
      expect(mockNext).toHaveBeenCalled();
    });

    it('应该拒绝无效的JWT令牌', async () => {
      mockRequest.headers!.authorization = 'Bearer invalidtoken';
      
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // 模拟非开发环境
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '无效的认证令牌'
      });
      expect(mockNext).not.toHaveBeenCalled();

      // 恢复环境变量
      process.env.NODE_ENV = originalEnv;
    });

    it('应该在开发环境使用模拟认证', async () => {
      mockRequest.headers!.authorization = 'Bearer invalidtoken';
      mockRequest.headers!.host = 'localhost:3000';
      
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // 模拟开发环境
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockRequest.user).toEqual(expect.objectContaining({
        id: 121,
        username: 'admin',
        role: 'admin'
      }));
      expect(mockNext).toHaveBeenCalled();

      // 恢复环境变量
      process.env.NODE_ENV = originalEnv;
    });

    it('应该处理用户不存在的情况', async () => {
      const mockDecodedToken = {
        userId: 999,
        username: 'nonexistent',
        type: 'access'
      };

      mockRequest.headers!.authorization = 'Bearer validtoken123';
      
      (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);
      
      const { User } = require('../../../src/models/index');
      User.findByPk.mockResolvedValue(null);

      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '用户不存在'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('checkRole', () => {
    it('应该允许具有正确角色的用户访问', () => {
      mockRequest.user = {
        id: 1,
        username: 'admin',
        role: 'admin'
      } as any;

      const roleMiddleware = checkRole(['admin', 'manager']);
      roleMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('应该拒绝没有正确角色的用户', () => {
      mockRequest.user = {
        id: 1,
        username: 'user',
        role: 'user'
      } as any;

      const roleMiddleware = checkRole(['admin', 'manager']);
      roleMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '角色权限不足'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('应该拒绝未认证的用户', () => {
      mockRequest.user = undefined;

      const roleMiddleware = checkRole(['admin']);
      roleMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '用户未认证'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('mockAuthMiddleware', () => {
    it('应该直接调用next函数', () => {
      mockAuthMiddleware(mockRequest, mockResponse, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });

    it('应该不修改请求或响应对象', () => {
      const originalRequest = { ...mockRequest };
      const originalResponse = { ...mockResponse };
      
      mockAuthMiddleware(mockRequest, mockResponse, mockNext);
      
      expect(mockRequest).toEqual(originalRequest);
      expect(mockResponse).toEqual(originalResponse);
    });
  });

  describe('边界情况和错误处理', () => {
    it('应该处理空的Authorization头', async () => {
      mockRequest.headers!.authorization = '';
      
      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('应该处理只有Bearer的Authorization头', async () => {
      mockRequest.headers!.authorization = 'Bearer ';
      
      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('应该处理数据库查询错误', async () => {
      const mockDecodedToken = {
        userId: 1,
        username: 'testuser',
        type: 'access'
      };

      mockRequest.headers!.authorization = 'Bearer validtoken123';
      
      (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);
      
      const { User } = require('../../../src/models/index');
      User.findByPk.mockRejectedValue(new Error('Database error'));

      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '服务器内部错误'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
