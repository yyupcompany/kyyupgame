// Mock dependencies
jest.mock('../../../src/init');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');
jest.mock('../../../src/utils/jwt');
jest.mock('../../../src/utils/password');
jest.mock('../../../src/models/index');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import authController from '../../../src/controllers/auth.controller';
import {
  validateRequiredFields,
  validateFieldTypes,
  validateApiResponseStructure
} from '../../../src/utils/data-validation';
import {
  validateJWTToken,
  validateRefreshToken,
  validateUserInfo,
  validateAuthResponse,
  validateLoginRequest,
  createAuthValidationReport
} from '../../../src/utils/auth-validation';

// Console monitoring for server tests
const consoleErrors: string[] = [];
const originalConsoleError = console.error;

beforeAll(() => {
  console.error = (...args: any[]) => {
    consoleErrors.push(args.map(arg =>
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' '));
    originalConsoleError(...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
});

function expectNoConsoleErrors(): void {
  if (consoleErrors.length > 0) {
    const errorMessage = `Console errors detected during test execution:\n${consoleErrors.map((msg, i) => `  ${i + 1}. ${msg}`).join('\n')}`;
    consoleErrors.length = 0; // Clear for next test
    throw new Error(errorMessage);
  }
  consoleErrors.length = 0; // Clear for next test
}

const {
  login,
  logout,
  refreshToken,
  verifyTokenEndpoint,
  getCurrentUser,
  getUserMenu,
  getUserRoles
} = authController;
import { sequelize } from '../../../src/init';
import { ApiError } from '../../../src/utils/apiError';
import { ApiResponse } from '../../../src/utils/apiResponse';
import { generateDynamicToken, verifyToken } from '../../../src/utils/jwt';
import { verifyPassword } from '../../../src/utils/password';
import { User, Role, UserRoleModel, Permission, RolePermission } from '../../../src/models/index';
import { QueryTypes } from 'sequelize';

// Mock implementations
const mockSequelize = {
  query: jest.fn(),
  transaction: jest.fn()
};

// Mock TOKEN_TYPES
const mockTokenTypes = {
  ACCESS: 'access',
  REFRESH: 'refresh'
};

const mockUser = {
  findOne: jest.fn(),
  findByPk: jest.fn(),
  update: jest.fn()
};

const mockRole = {
  findAll: jest.fn()
};

const mockUserRoleModel = {
  findAll: jest.fn()
};

const mockPermission = {
  findAll: jest.fn()
};

const mockRolePermission = {
  findAll: jest.fn()
};

// Setup mocks
(sequelize as any) = mockSequelize;
(User as any) = mockUser;
(Role as any) = mockRole;
(UserRoleModel as any) = mockUserRoleModel;
(Permission as any) = mockPermission;
(RolePermission as any) = mockRolePermission;

const mockRequest = () => ({
  body: {},
  query: {},
  params: {},
  headers: {},
  user: null
} as Partial<Request>);

const mockResponse = () => {
  const res = {} as Partial<Response>;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn() as NextFunction;

// 控制台错误检测变量
let consoleSpy: any

describe('Auth Controller - Strict Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrors.length = 0; // Clear console errors before each test
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    expectNoConsoleErrors(); // Check for console errors after each test
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('login', () => {
    it('应该成功登录用户 - 严格验证', async () => {
      // 1. 验证请求数据结构
      const loginData = {
        username: 'testuser',
        password: 'password123'
      };

      const requestValidation = validateLoginRequest(loginData);
      expect(requestValidation.valid).toBe(true);
      if (!requestValidation.valid) {
        throw new Error(`Login request validation failed: ${requestValidation.errors.join(', ')}`);
      }

      const req = mockRequest();
      const res = mockResponse();

      req.body = loginData;

      const mockUserData = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        status: 1
      };

      // 2. 验证用户数据结构
      const userValidation = validateFieldTypes(mockUserData, {
        id: 'number',
        username: 'string',
        email: 'string',
        password: 'string',
        status: 'number'
      });
      expect(userValidation.valid).toBe(true);

      mockUser.findOne.mockResolvedValue(mockUserData);
      (verifyPassword as jest.Mock).mockResolvedValue(undefined);
      (generateDynamicToken as jest.Mock).mockReturnValue('mock-jwt-token');

      await login(req as Request, res as Response, mockNext);

      // 3. 验证数据库查询调用
      expect(mockUser.findOne).toHaveBeenCalledWith({
        where: {
          username: 'testuser'
        }
      });

      // 4. 验证密码验证调用
      expect(verifyPassword).toHaveBeenCalledWith('password123', 'hashedpassword');

      // 5. 验证令牌生成调用
      expect(generateDynamicToken).toHaveBeenCalledWith({
        userId: 1,
        username: 'testuser',
        email: 'test@example.com'
      });

      // 6. 验证响应结构
      expect(res.status).not.toHaveBeenCalledWith(expect.any(Number)); // 成功时不设置错误状态码
      expect(res.json).toHaveBeenCalled();

      // 7. 获取响应数据进行验证
      const jsonResponse = (res.json as jest.Mock).mock.calls[0][0];

      // 8. 验证API响应结构
      const apiResponseValidation = validateApiResponseStructure(jsonResponse);
      expect(apiResponseValidation.valid).toBe(true);

      // 9. 验证认证响应结构
      const authResponseValidation = validateAuthResponse(jsonResponse, {
        requireToken: true,
        requireUser: true
      });
      expect(authResponseValidation.valid).toBe(true);

      // 10. 验证JWT令牌格式（如果存在）
      if (jsonResponse.token) {
        const tokenValidation = validateJWTToken(jsonResponse.token);
        expect(tokenValidation.valid).toBe(true);
      }

      // 11. 验证用户信息结构（如果存在）
      if (jsonResponse.user) {
        const userValidation = validateUserInfo(jsonResponse.user);
        expect(userValidation.valid).toBe(true);
      }

      // 12. 验证业务逻辑
      expect(jsonResponse.success).toBe(true);
      expect(jsonResponse.user?.username).toBe('testuser');
    });

    it('应该拒绝缺少用户名和邮箱的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        password: 'password123'
      };

      await login(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: '用户名或邮箱不能为空'
      });
    });

    it('应该拒绝缺少密码的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        username: 'testuser'
      };

      await login(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: '密码不能为空'
      });
    });

    it('应该验证邮箱格式', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        email: 'invalid-email',
        password: 'password123'
      };

      await login(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'INVALID_EMAIL_FORMAT',
        message: '邮箱格式不正确'
      });
    });

    it('应该处理用户不存在的情况', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        username: 'nonexistent',
        password: 'password123'
      };

      mockUser.findOne.mockResolvedValue(null);

      await login(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: '用户名或密码错误'
      });
    });

    it('应该处理密码错误的情况', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        username: 'testuser',
        password: 'wrongpassword'
      };

      const mockUserData = {
        id: 1,
        username: 'testuser',
        password: 'hashedpassword',
        status: 1
      };

      mockUser.findOne.mockResolvedValue(mockUserData);
      (verifyPassword as jest.Mock).mockResolvedValue(undefined);

      await login(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: '用户名或密码错误'
      });
    });

    it('应该处理用户状态异常的情况', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        username: 'testuser',
        password: 'password123'
      };

      const mockUserData = {
        id: 1,
        username: 'testuser',
        password: 'hashedpassword',
        status: 0 // 禁用状态
      };

      mockUser.findOne.mockResolvedValue(mockUserData);
      (verifyPassword as jest.Mock).mockResolvedValue(undefined);

      await login(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'USER_DISABLED',
        message: '用户已被禁用'
      });
    });

    it('应该处理数据库错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        username: 'testuser',
        password: 'password123'
      };

      mockUser.findOne.mockRejectedValue(new Error('Database error'));

      await login(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('应该支持邮箱登录', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUserData = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedpassword',
        status: 1
      };

      mockUser.findOne.mockResolvedValue(mockUserData);
      (verifyPassword as jest.Mock).mockResolvedValue(undefined);
      (generateDynamicToken as jest.Mock).mockReturnValue('mock-token');

      await login(req as Request, res as Response, mockNext);

      expect(mockUser.findOne).toHaveBeenCalledWith({
        where: {
          email: 'test@example.com'
        }
      });
    });
  });

  describe('logout', () => {
    it('应该成功登出用户', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        realName: 'Test User',
        phone: '1234567890',
        role: 'user' as any,
        status: 'active' as any
      } as any;

      await logout(req as Request, res as Response, mockNext);

      expect(res.clearCookie).toHaveBeenCalledWith('token');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '登出成功'
      });
    });

    it('应该处理未登录用户的登出请求', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await logout(req as Request, res as Response, mockNext);

      expect(res.clearCookie).toHaveBeenCalledWith('token');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '登出成功'
      });
    });
  });

  describe('refreshToken', () => {
    it('应该成功刷新令牌', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        refreshToken: 'valid-refresh-token'
      };

      const mockTokenPayload = {
        userId: 1,
        username: 'testuser',
        type: 'refresh'
      };

      (verifyToken as jest.Mock).mockReturnValue(mockTokenPayload);
      (generateDynamicToken as jest.Mock).mockReturnValue('new-access-token');

      await refreshToken(req as Request, res as Response, mockNext);

      expect(verifyToken).toHaveBeenCalledWith('valid-refresh-token');
      expect(generateDynamicToken).toHaveBeenCalled();
    });

    it('应该拒绝缺少刷新令牌的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await refreshToken(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'MISSING_REFRESH_TOKEN',
        message: '刷新令牌不能为空'
      });
    });

    it('应该处理无效的刷新令牌', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        refreshToken: 'invalid-refresh-token'
      };

      (verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await refreshToken(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'INVALID_REFRESH_TOKEN',
        message: '刷新令牌无效或已过期'
      });
    });
  });

  describe('verifyTokenEndpoint', () => {
    it('应该成功验证令牌', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        realName: 'Test User',
        phone: '1234567890',
        role: 'user' as any,
        status: 'active' as any
      } as any;

      await verifyTokenEndpoint(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          valid: true,
          user: {
            id: 1,
            username: 'testuser'
          }
        },
        message: 'Token验证成功'
      });
    });

    it('应该处理未登录用户', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await verifyTokenEndpoint(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          code: 'USER_NOT_FOUND'
        })
      );
    });
  });

  describe('getCurrentUser', () => {
    it('应该成功获取当前用户信息', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        realName: 'Test User',
        phone: '1234567890',
        role: 'user' as any,
        status: 'active' as any
      } as any;

      const mockUserData = [{
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        realName: 'Test User',
        phone: '1234567890',
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }];

      const mockRoles = [
        { role_code: 'admin', role_name: '管理员' }
      ];

      mockSequelize.query
        .mockResolvedValueOnce(mockUserData)
        .mockResolvedValueOnce(mockRoles);

      await getCurrentUser(req as Request, res as Response, mockNext);

      expect(mockSequelize.query).toHaveBeenCalledTimes(2);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          realName: 'Test User',
          phone: '1234567890',
          status: 1,
          createdAt: mockUserData[0].createdAt,
          updatedAt: mockUserData[0].updatedAt,
          roles: [{ code: 'admin', name: '管理员' }]
        },
        message: '获取用户信息成功'
      });
    });

    it('应该处理用户不存在的情况', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = {
        id: 999,
        username: 'nonexistent',
        email: 'nonexistent@example.com',
        realName: 'Nonexistent User',
        phone: '0000000000',
        role: 'user' as any,
        status: 'active' as any
      } as any;

      mockSequelize.query.mockResolvedValueOnce([]);

      await getCurrentUser(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          code: 'USER_NOT_FOUND'
        })
      );
    });
  });

  describe('getUserMenu', () => {
    it('应该成功获取用户菜单权限', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        realName: 'Test User',
        phone: '1234567890',
        role: 'user' as any,
        status: 'active' as any
      } as any;

      const mockRoles = [{ role_code: 'admin', role_name: '管理员' }];
      const mockCategories = [
        { id: 1, name: 'Dashboard', chinese_name: '仪表盘', code: 'dashboard', path: '/dashboard', icon: 'dashboard', sort: 1 }
      ];
      const mockMenus = [
        { id: 2, name: 'User List', chinese_name: '用户列表', code: 'user_list', path: '/users', component: 'UserList', icon: 'users', sort: 1, type: 'menu' }
      ];

      mockSequelize.query
        .mockResolvedValueOnce(mockRoles)
        .mockResolvedValueOnce(mockCategories)
        .mockResolvedValueOnce(mockMenus);

      await getUserMenu(req as Request, res as Response, mockNext);

      expect(mockSequelize.query).toHaveBeenCalledTimes(3);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [
          {
            id: 'dashboard',
            name: 'Dashboard',
            chinese_name: '仪表盘',
            title: '仪表盘',
            path: '/dashboard',
            icon: 'dashboard',
            type: 'category',
            sort: 1,
            visible: true,
            children: [
              {
                id: 'user-list',
                name: 'User List',
                chinese_name: '用户列表',
                title: '用户列表',
                path: '/users',
                component: 'UserList',
                icon: 'users',
                type: 'menu',
                sort: 1,
                visible: true
              }
            ]
          }
        ],
        message: '获取菜单权限成功'
      });
    });

    it('应该处理用户未登录的情况', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await getUserMenu(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: '401',
        message: '用户信息不存在'
      });
    });
  });

  describe('getUserRoles', () => {
    it('应该成功获取用户角色信息', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        realName: 'Test User',
        phone: '1234567890',
        role: 'user' as any,
        status: 'active' as any
      } as any;

      const mockRoles = [
        { id: 1, code: 'admin', name: '管理员', description: '系统管理员', permissions: '["user.manage"]' }
      ];

      mockSequelize.query.mockResolvedValue(mockRoles);

      await getUserRoles(req as Request, res as Response, mockNext);

      expect(mockSequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT r.id, r.code, r.name, r.description, r.permissions'),
        expect.objectContaining({
          replacements: { userId: 1 },
          type: QueryTypes.SELECT
        })
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          roles: [
            {
              id: 1,
              code: 'admin',
              name: '管理员',
              description: '系统管理员',
              permissions: ['user.manage']
            }
          ],
          currentRole: { id: 1, code: 'admin', name: '管理员', description: '系统管理员', permissions: ['user.manage'] },
          isAdmin: true
        },
        message: '获取角色信息成功'
      });
    });

    it('应该处理用户未登录的情况', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await getUserRoles(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: '401',
        message: '用户信息不存在'
      });
    });
  });
});
