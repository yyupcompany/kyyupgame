import { jest } from '@jest/globals';
import { vi } from 'vitest'
import { Request, Response, NextFunction } from 'express';

// Mock Express types
const mockRequest = {
  params: {},
  query: {},
  body: {},
  headers: {},
  user: null,
  method: 'GET',
  url: '/api/users',
  path: '/api/users',
  route: { path: '/api/users' }
} as Request;

const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
  end: jest.fn().mockReturnThis(),
  locals: {}
} as unknown as Response;

const mockNext = jest.fn() as NextFunction;

// Mock models
const mockUser = {
  findByPk: jest.fn(),
  findOne: jest.fn()
};

const mockRole = {
  findByPk: jest.fn(),
  findAll: jest.fn()
};

const mockPermission = {
  findAll: jest.fn()
};

const mockUserRole = {
  findAll: jest.fn()
};

const mockRolePermission = {
  findAll: jest.fn()
};

// Mock logger
const mockLogger = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// Mock cache
const mockCache = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn()
};

// Mock imports
jest.unstable_mockModule('../../../../../src/models/user.model', () => ({
  default: mockUser
}));

jest.unstable_mockModule('../../../../../src/models/role.model', () => ({
  default: mockRole
}));

jest.unstable_mockModule('../../../../../src/models/permission.model', () => ({
  default: mockPermission
}));

jest.unstable_mockModule('../../../../../src/models/user-role.model', () => ({
  default: mockUserRole
}));

jest.unstable_mockModule('../../../../../src/models/role-permission.model', () => ({
  default: mockRolePermission
}));

jest.unstable_mockModule('../../../../../src/utils/logger', () => ({
  default: mockLogger
}));

jest.unstable_mockModule('../../../../../src/utils/cache', () => ({
  default: mockCache
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

describe('RBAC Middleware', () => {
  let rbacMiddleware: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/middlewares/rbac.middleware');
    rbacMiddleware = imported.default || imported.rbac || imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mock objects
    mockRequest.params = {};
    mockRequest.query = {};
    mockRequest.body = {};
    mockRequest.headers = {};
    mockRequest.user = null;
    mockResponse.locals = {};
  });

  describe('requirePermission', () => {
    it('应该是一个函数', () => {
      expect(typeof rbacMiddleware.requirePermission).toBe('function');
    });

    it('应该允许有权限的用户访问', async () => {
      const user = {
        id: 1,
        username: 'admin',
        roles: [
          {
            id: 1,
            name: 'admin',
            permissions: [
              { id: 1, code: 'user:read', name: '用户查看' }
            ]
          }
        ]
      };

      mockRequest.user = user;
      mockCache.get.mockResolvedValue(null);
      mockUserRole.findAll.mockResolvedValue([
        { roleId: 1, userId: 1 }
      ]);
      mockRolePermission.findAll.mockResolvedValue([
        { roleId: 1, permissionId: 1 }
      ]);
      mockPermission.findAll.mockResolvedValue([
        { id: 1, code: 'user:read', name: '用户查看' }
      ]);

      const middleware = rbacMiddleware.requirePermission('user:read');
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('应该拒绝没有权限的用户', async () => {
      const user = {
        id: 1,
        username: 'user',
        roles: [
          {
            id: 2,
            name: 'user',
            permissions: [
              { id: 2, code: 'profile:read', name: '个人资料查看' }
            ]
          }
        ]
      };

      mockRequest.user = user;
      mockCache.get.mockResolvedValue(null);
      mockUserRole.findAll.mockResolvedValue([
        { roleId: 2, userId: 1 }
      ]);
      mockRolePermission.findAll.mockResolvedValue([
        { roleId: 2, permissionId: 2 }
      ]);
      mockPermission.findAll.mockResolvedValue([
        { id: 2, code: 'profile:read', name: '个人资料查看' }
      ]);

      const middleware = rbacMiddleware.requirePermission('user:write');
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Permission denied',
        required: 'user:write'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('应该拒绝未认证的用户', async () => {
      mockRequest.user = null;

      const middleware = rbacMiddleware.requirePermission('user:read');
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('应该处理多个权限要求（OR逻辑）', async () => {
      const user = {
        id: 1,
        username: 'editor',
        roles: [
          {
            id: 3,
            name: 'editor',
            permissions: [
              { id: 3, code: 'content:write', name: '内容编辑' }
            ]
          }
        ]
      };

      mockRequest.user = user;
      mockCache.get.mockResolvedValue(null);
      mockUserRole.findAll.mockResolvedValue([
        { roleId: 3, userId: 1 }
      ]);
      mockRolePermission.findAll.mockResolvedValue([
        { roleId: 3, permissionId: 3 }
      ]);
      mockPermission.findAll.mockResolvedValue([
        { id: 3, code: 'content:write', name: '内容编辑' }
      ]);

      const middleware = rbacMiddleware.requirePermission(['user:write', 'content:write']);
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该处理多个权限要求（AND逻辑）', async () => {
      const user = {
        id: 1,
        username: 'admin',
        roles: [
          {
            id: 1,
            name: 'admin',
            permissions: [
              { id: 1, code: 'user:read', name: '用户查看' },
              { id: 4, code: 'user:write', name: '用户编辑' }
            ]
          }
        ]
      };

      mockRequest.user = user;
      mockCache.get.mockResolvedValue(null);
      mockUserRole.findAll.mockResolvedValue([
        { roleId: 1, userId: 1 }
      ]);
      mockRolePermission.findAll.mockResolvedValue([
        { roleId: 1, permissionId: 1 },
        { roleId: 1, permissionId: 4 }
      ]);
      mockPermission.findAll.mockResolvedValue([
        { id: 1, code: 'user:read', name: '用户查看' },
        { id: 4, code: 'user:write', name: '用户编辑' }
      ]);

      const middleware = rbacMiddleware.requirePermission(['user:read', 'user:write'], 'AND');
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该使用缓存的权限数据', async () => {
      const user = { id: 1, username: 'admin' };
      const cachedPermissions = ['user:read', 'user:write'];

      mockRequest.user = user;
      mockCache.get.mockResolvedValue(cachedPermissions);

      const middleware = rbacMiddleware.requirePermission('user:read');
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockCache.get).toHaveBeenCalledWith(`user_permissions:${user.id}`);
      expect(mockUserRole.findAll).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('requireRole', () => {
    it('应该允许有角色的用户访问', async () => {
      const user = {
        id: 1,
        username: 'admin',
        roles: [
          { id: 1, name: 'admin', level: 1 }
        ]
      };

      mockRequest.user = user;
      mockCache.get.mockResolvedValue(['admin']);

      const middleware = rbacMiddleware.requireRole('admin');
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该拒绝没有角色的用户', async () => {
      const user = {
        id: 1,
        username: 'user',
        roles: [
          { id: 2, name: 'user', level: 5 }
        ]
      };

      mockRequest.user = user;
      mockCache.get.mockResolvedValue(['user']);

      const middleware = rbacMiddleware.requireRole('admin');
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Role required',
        required: 'admin'
      });
    });

    it('应该处理多个角色要求', async () => {
      const user = {
        id: 1,
        username: 'editor',
        roles: [
          { id: 3, name: 'editor', level: 3 }
        ]
      };

      mockRequest.user = user;
      mockCache.get.mockResolvedValue(['editor']);

      const middleware = rbacMiddleware.requireRole(['admin', 'editor']);
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该处理角色等级检查', async () => {
      const user = {
        id: 1,
        username: 'manager',
        roles: [
          { id: 4, name: 'manager', level: 2 }
        ]
      };

      mockRequest.user = user;
      mockCache.get.mockResolvedValue(null);
      mockUserRole.findAll.mockResolvedValue([
        { roleId: 4, userId: 1 }
      ]);
      mockRole.findAll.mockResolvedValue([
        { id: 4, name: 'manager', level: 2 }
      ]);

      const middleware = rbacMiddleware.requireRole('admin', { minLevel: 1 });
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('resourceOwnership', () => {
    it('应该允许资源所有者访问', async () => {
      const user = { id: 1, username: 'user' };
      mockRequest.user = user;
      mockRequest.params = { userId: '1' };

      const middleware = rbacMiddleware.resourceOwnership('userId');
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该拒绝非资源所有者访问', async () => {
      const user = { id: 1, username: 'user' };
      mockRequest.user = user;
      mockRequest.params = { userId: '2' };

      const middleware = rbacMiddleware.resourceOwnership('userId');
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Resource access denied'
      });
    });

    it('应该支持自定义所有权检查函数', async () => {
      const user = { id: 1, username: 'user', kindergartenId: 1 };
      mockRequest.user = user;
      mockRequest.params = { kindergartenId: '1' };

      const ownershipCheck = (req: Request) => {
        return req.user?.kindergartenId === parseInt(req.params.kindergartenId);
      };

      const middleware = rbacMiddleware.resourceOwnership(ownershipCheck);
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该处理数据库查询的所有权检查', async () => {
      const user = { id: 1, username: 'teacher' };
      mockRequest.user = user;
      mockRequest.params = { classId: '10' };

      const mockClass = {
        findByPk: jest.fn().mockResolvedValue({
          id: 10,
          teacherId: 1,
          name: 'Class A'
        })
      };

      const ownershipCheck = async (req: Request) => {
        const classData = await mockClass.findByPk(req.params.classId);
        return classData?.teacherId === req.user?.id;
      };

      const middleware = rbacMiddleware.resourceOwnership(ownershipCheck);
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('conditionalAccess', () => {
    it('应该根据条件允许访问', async () => {
      const user = { id: 1, username: 'user', status: 'active' };
      mockRequest.user = user;

      const condition = (req: Request) => req.user?.status === 'active';
      const middleware = rbacMiddleware.conditionalAccess(condition);
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该根据条件拒绝访问', async () => {
      const user = { id: 1, username: 'user', status: 'inactive' };
      mockRequest.user = user;

      const condition = (req: Request) => req.user?.status === 'active';
      const middleware = rbacMiddleware.conditionalAccess(condition);
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access condition not met'
      });
    });

    it('应该处理异步条件检查', async () => {
      const user = { id: 1, username: 'user' };
      mockRequest.user = user;

      const asyncCondition = async (req: Request) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return req.user?.id === 1;
      };

      const middleware = rbacMiddleware.conditionalAccess(asyncCondition);
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该处理复杂的业务逻辑条件', async () => {
      const user = { id: 1, username: 'teacher', kindergartenId: 1 };
      mockRequest.user = user;
      mockRequest.params = { studentId: '100' };

      const mockStudent = {
        findByPk: jest.fn().mockResolvedValue({
          id: 100,
          classId: 10,
          class: {
            id: 10,
            kindergartenId: 1
          }
        })
      };

      const businessCondition = async (req: Request) => {
        const student = await mockStudent.findByPk(req.params.studentId);
        return student?.class?.kindergartenId === req.user?.kindergartenId;
      };

      const middleware = rbacMiddleware.conditionalAccess(businessCondition);
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('dynamicPermission', () => {
    it('应该根据动态条件检查权限', async () => {
      const user = { id: 1, username: 'teacher' };
      mockRequest.user = user;
      mockRequest.params = { action: 'edit', resourceType: 'student' };

      const permissionResolver = (req: Request) => {
        return `${req.params.resourceType}:${req.params.action}`;
      };

      mockCache.get.mockResolvedValue(['student:edit', 'student:read']);

      const middleware = rbacMiddleware.dynamicPermission(permissionResolver);
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该处理复杂的权限解析', async () => {
      const user = { id: 1, username: 'teacher', kindergartenId: 1 };
      mockRequest.user = user;
      mockRequest.params = { kindergartenId: '1', action: 'manage' };
      mockRequest.method = 'POST';

      const complexPermissionResolver = (req: Request) => {
        const { kindergartenId, action } = req.params;
        const method = req.method.toLowerCase();
        
        if (kindergartenId === req.user?.kindergartenId.toString()) {
          return `kindergarten:${action}:${method}`;
        }
        return `kindergarten:${action}:${method}:other`;
      };

      mockCache.get.mockResolvedValue(['kindergarten:manage:post']);

      const middleware = rbacMiddleware.dynamicPermission(complexPermissionResolver);
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('Error Handling', () => {
    it('应该处理权限查询错误', async () => {
      const user = { id: 1, username: 'user' };
      mockRequest.user = user;

      const dbError = new Error('Database connection failed');
      mockCache.get.mockResolvedValue(null);
      mockUserRole.findAll.mockRejectedValue(dbError);

      const middleware = rbacMiddleware.requirePermission('user:read');
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('RBAC permission check failed'),
        expect.objectContaining({
          userId: user.id,
          permission: 'user:read',
          error: dbError.message
        })
      );
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Permission check failed'
      });
    });

    it('应该处理缓存错误', async () => {
      const user = { id: 1, username: 'user' };
      mockRequest.user = user;

      const cacheError = new Error('Cache service unavailable');
      mockCache.get.mockRejectedValue(cacheError);
      mockUserRole.findAll.mockResolvedValue([]);

      const middleware = rbacMiddleware.requirePermission('user:read');
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Cache error in RBAC'),
        expect.objectContaining({
          error: cacheError.message
        })
      );
      // 应该继续执行，不依赖缓存
      expect(mockUserRole.findAll).toHaveBeenCalled();
    });

    it('应该处理条件检查错误', async () => {
      const user = { id: 1, username: 'user' };
      mockRequest.user = user;

      const conditionError = new Error('Condition check failed');
      const faultyCondition = () => {
        throw conditionError;
      };

      const middleware = rbacMiddleware.conditionalAccess(faultyCondition);
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Conditional access check failed'),
        expect.objectContaining({
          error: conditionError.message
        })
      );
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe('Performance Optimization', () => {
    it('应该缓存用户权限', async () => {
      const user = { id: 1, username: 'admin' };
      mockRequest.user = user;

      mockCache.get.mockResolvedValue(null);
      mockUserRole.findAll.mockResolvedValue([{ roleId: 1, userId: 1 }]);
      mockRolePermission.findAll.mockResolvedValue([{ roleId: 1, permissionId: 1 }]);
      mockPermission.findAll.mockResolvedValue([
        { id: 1, code: 'user:read', name: '用户查看' }
      ]);

      const middleware = rbacMiddleware.requirePermission('user:read');
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockCache.set).toHaveBeenCalledWith(
        `user_permissions:${user.id}`,
        ['user:read'],
        expect.any(Number)
      );
    });

    it('应该批量查询权限', async () => {
      const users = [
        { id: 1, username: 'user1' },
        { id: 2, username: 'user2' }
      ];

      const permissions = await rbacMiddleware.batchCheckPermissions(users, 'user:read');

      expect(permissions).toHaveProperty('1');
      expect(permissions).toHaveProperty('2');
      expect(mockUserRole.findAll).toHaveBeenCalledWith({
        where: { userId: { [Symbol.for('in')]: [1, 2] } }
      });
    });

    it('应该预加载用户权限', async () => {
      const user = { id: 1, username: 'admin' };

      await rbacMiddleware.preloadUserPermissions(user.id);

      expect(mockCache.set).toHaveBeenCalledWith(
        `user_permissions:${user.id}`,
        expect.any(Array),
        expect.any(Number)
      );
    });
  });

  describe('Integration Tests', () => {
    it('应该与认证中间件集成', async () => {
      const user = { id: 1, username: 'admin' };
      mockRequest.user = user;
      mockRequest.headers.authorization = 'Bearer valid-token';

      mockCache.get.mockResolvedValue(['user:read', 'user:write']);

      const middleware = rbacMiddleware.requirePermission('user:read');
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该与路由参数集成', async () => {
      const user = { id: 1, username: 'teacher', kindergartenId: 1 };
      mockRequest.user = user;
      mockRequest.params = { kindergartenId: '1', classId: '10' };

      const contextualPermission = (req: Request) => {
        if (req.params.kindergartenId === req.user?.kindergartenId.toString()) {
          return 'class:manage:own';
        }
        return 'class:manage:other';
      };

      mockCache.get.mockResolvedValue(['class:manage:own']);

      const middleware = rbacMiddleware.dynamicPermission(contextualPermission);
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该与业务逻辑集成', async () => {
      const user = { id: 1, username: 'parent' };
      mockRequest.user = user;
      mockRequest.params = { studentId: '100' };

      const mockStudent = {
        findByPk: jest.fn().mockResolvedValue({
          id: 100,
          parentIds: [1, 2]
        })
      };

      const parentCheck = async (req: Request) => {
        const student = await mockStudent.findByPk(req.params.studentId);
        return student?.parentIds.includes(req.user?.id);
      };

      const middleware = rbacMiddleware.conditionalAccess(parentCheck);
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('Security Features', () => {
    it('应该记录权限检查日志', async () => {
      const user = { id: 1, username: 'user' };
      mockRequest.user = user;
      mockRequest.ip = '192.168.1.100';

      mockCache.get.mockResolvedValue(['user:read']);

      const middleware = rbacMiddleware.requirePermission('user:write');
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Permission denied'),
        expect.objectContaining({
          userId: user.id,
          username: user.username,
          ip: mockRequest.ip,
          permission: 'user:write',
          userPermissions: ['user:read']
        })
      );
    });

    it('应该检测权限提升攻击', async () => {
      const user = { id: 1, username: 'user', roles: ['user'] };
      mockRequest.user = user;

      // 模拟用户尝试访问管理员功能
      const suspiciousPermissions = [
        'admin:delete',
        'system:config',
        'user:delete:all'
      ];

      for (const permission of suspiciousPermissions) {
        mockCache.get.mockResolvedValue(['user:read', 'profile:edit']);
        
        const middleware = rbacMiddleware.requirePermission(permission);
        await middleware(mockRequest, mockResponse, mockNext);

        expect(mockLogger.warn).toHaveBeenCalledWith(
          expect.stringContaining('Potential privilege escalation attempt'),
          expect.objectContaining({
            userId: user.id,
            attemptedPermission: permission
          })
        );
      }
    });

    it('应该处理会话劫持检测', async () => {
      const user = { id: 1, username: 'admin', lastLoginIP: '192.168.1.100' };
      mockRequest.user = user;
      mockRequest.ip = '10.0.0.1'; // 不同的IP

      const middleware = rbacMiddleware.requirePermission('admin:delete', {
        checkIPConsistency: true
      });
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('IP address mismatch detected'),
        expect.objectContaining({
          userId: user.id,
          lastLoginIP: user.lastLoginIP,
          currentIP: mockRequest.ip
        })
      );
    });
  });
});
