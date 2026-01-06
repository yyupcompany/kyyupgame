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
  path: '/api/users'
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
const mockRole = {
  findByPk: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn()
};

const mockUserRole = {
  findAll: jest.fn(),
  findOne: jest.fn()
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
jest.unstable_mockModule('../../../../../src/models/role.model', () => ({
  default: mockRole
}));

jest.unstable_mockModule('../../../../../src/models/user-role.model', () => ({
  default: mockUserRole
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

describe('Role Middleware', () => {
  let roleMiddleware: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/middlewares/role.middleware');
    roleMiddleware = imported.default || imported.role || imported;
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

  describe('requireRole', () => {
    it('应该是一个函数', () => {
      expect(typeof roleMiddleware.requireRole).toBe('function');
    });

    it('应该允许有正确角色的用户访问', async () => {
      const user = {
        id: 1,
        username: 'admin',
        roles: [
          { id: 1, name: 'admin', level: 1 }
        ]
      };

      mockRequest.user = user;
      mockCache.get.mockResolvedValue(['admin']);

      const middleware = roleMiddleware.requireRole('admin');
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('应该拒绝没有正确角色的用户', async () => {
      const user = {
        id: 1,
        username: 'user',
        roles: [
          { id: 2, name: 'user', level: 5 }
        ]
      };

      mockRequest.user = user;
      mockCache.get.mockResolvedValue(['user']);

      const middleware = roleMiddleware.requireRole('admin');
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient role privileges',
        required: 'admin',
        current: ['user']
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('应该拒绝未认证的用户', async () => {
      mockRequest.user = null;

      const middleware = roleMiddleware.requireRole('admin');
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('应该处理多个角色要求（OR逻辑）', async () => {
      const user = {
        id: 1,
        username: 'editor',
        roles: [
          { id: 3, name: 'editor', level: 3 }
        ]
      };

      mockRequest.user = user;
      mockCache.get.mockResolvedValue(['editor']);

      const middleware = roleMiddleware.requireRole(['admin', 'editor']);
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

      const middleware = roleMiddleware.requireRole('admin', { minLevel: 1 });
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该拒绝等级不足的角色', async () => {
      const user = {
        id: 1,
        username: 'user',
        roles: [
          { id: 5, name: 'user', level: 5 }
        ]
      };

      mockRequest.user = user;
      mockCache.get.mockResolvedValue(null);
      mockUserRole.findAll.mockResolvedValue([
        { roleId: 5, userId: 1 }
      ]);
      mockRole.findAll.mockResolvedValue([
        { id: 5, name: 'user', level: 5 }
      ]);

      const middleware = roleMiddleware.requireRole('admin', { minLevel: 2 });
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient role level',
        required: 'admin',
        minLevel: 2,
        currentLevel: 5
      });
    });
  });

  describe('hasRole', () => {
    it('应该检查用户是否有指定角色', async () => {
      const user = {
        id: 1,
        username: 'teacher',
        roles: [
          { id: 6, name: 'teacher', level: 4 }
        ]
      };

      mockRequest.user = user;
      mockCache.get.mockResolvedValue(['teacher']);

      const hasRole = await roleMiddleware.hasRole(mockRequest, 'teacher');

      expect(hasRole).toBe(true);
    });

    it('应该返回false如果用户没有指定角色', async () => {
      const user = {
        id: 1,
        username: 'student',
        roles: [
          { id: 7, name: 'student', level: 6 }
        ]
      };

      mockRequest.user = user;
      mockCache.get.mockResolvedValue(['student']);

      const hasRole = await roleMiddleware.hasRole(mockRequest, 'teacher');

      expect(hasRole).toBe(false);
    });

    it('应该处理多个角色检查', async () => {
      const user = {
        id: 1,
        username: 'admin',
        roles: [
          { id: 1, name: 'admin', level: 1 },
          { id: 3, name: 'editor', level: 3 }
        ]
      };

      mockRequest.user = user;
      mockCache.get.mockResolvedValue(['admin', 'editor']);

      const hasAnyRole = await roleMiddleware.hasRole(mockRequest, ['admin', 'teacher']);
      const hasAllRoles = await roleMiddleware.hasRole(mockRequest, ['admin', 'editor'], 'AND');

      expect(hasAnyRole).toBe(true);
      expect(hasAllRoles).toBe(true);
    });
  });

  describe('getRoles', () => {
    it('应该获取用户的所有角色', async () => {
      const user = {
        id: 1,
        username: 'admin'
      };

      mockRequest.user = user;
      mockCache.get.mockResolvedValue(null);
      mockUserRole.findAll.mockResolvedValue([
        { roleId: 1, userId: 1 },
        { roleId: 3, userId: 1 }
      ]);
      mockRole.findAll.mockResolvedValue([
        { id: 1, name: 'admin', level: 1, description: '系统管理员' },
        { id: 3, name: 'editor', level: 3, description: '内容编辑' }
      ]);

      const roles = await roleMiddleware.getRoles(mockRequest);

      expect(roles).toEqual([
        { id: 1, name: 'admin', level: 1, description: '系统管理员' },
        { id: 3, name: 'editor', level: 3, description: '内容编辑' }
      ]);
      expect(mockCache.set).toHaveBeenCalledWith(
        `user_roles:${user.id}`,
        expect.any(Array),
        expect.any(Number)
      );
    });

    it('应该使用缓存的角色数据', async () => {
      const user = { id: 1, username: 'admin' };
      const cachedRoles = [
        { id: 1, name: 'admin', level: 1 }
      ];

      mockRequest.user = user;
      mockCache.get.mockResolvedValue(cachedRoles);

      const roles = await roleMiddleware.getRoles(mockRequest);

      expect(roles).toEqual(cachedRoles);
      expect(mockUserRole.findAll).not.toHaveBeenCalled();
    });

    it('应该处理没有角色的用户', async () => {
      const user = { id: 1, username: 'newuser' };

      mockRequest.user = user;
      mockCache.get.mockResolvedValue(null);
      mockUserRole.findAll.mockResolvedValue([]);

      const roles = await roleMiddleware.getRoles(mockRequest);

      expect(roles).toEqual([]);
    });
  });

  describe('roleHierarchy', () => {
    it('应该检查角色层级关系', async () => {
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

      const canManage = await roleMiddleware.canManageRole(mockRequest, 'user'); // level 5
      const cannotManage = await roleMiddleware.canManageRole(mockRequest, 'admin'); // level 1

      expect(canManage).toBe(true);
      expect(cannotManage).toBe(false);
    });

    it('应该处理相同等级的角色', async () => {
      const user = {
        id: 1,
        username: 'editor1',
        roles: [
          { id: 3, name: 'editor', level: 3 }
        ]
      };

      mockRequest.user = user;
      mockCache.get.mockResolvedValue(null);
      mockUserRole.findAll.mockResolvedValue([
        { roleId: 3, userId: 1 }
      ]);
      mockRole.findAll.mockResolvedValue([
        { id: 3, name: 'editor', level: 3 }
      ]);

      const canManage = await roleMiddleware.canManageRole(mockRequest, 'editor', {
        allowSameLevel: true
      });
      const cannotManage = await roleMiddleware.canManageRole(mockRequest, 'editor', {
        allowSameLevel: false
      });

      expect(canManage).toBe(true);
      expect(cannotManage).toBe(false);
    });
  });

  describe('contextualRoles', () => {
    it('应该处理上下文相关的角色检查', async () => {
      const user = {
        id: 1,
        username: 'teacher',
        kindergartenId: 1
      };

      mockRequest.user = user;
      mockRequest.params = { kindergartenId: '1' };

      const middleware = roleMiddleware.requireRole('teacher', {
        context: 'kindergarten',
        contextField: 'kindergartenId'
      });

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该拒绝上下文不匹配的角色', async () => {
      const user = {
        id: 1,
        username: 'teacher',
        kindergartenId: 1
      };

      mockRequest.user = user;
      mockRequest.params = { kindergartenId: '2' }; // 不同的幼儿园

      const middleware = roleMiddleware.requireRole('teacher', {
        context: 'kindergarten',
        contextField: 'kindergartenId'
      });

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Role context mismatch',
        required: 'teacher',
        context: 'kindergarten'
      });
    });

    it('应该处理复杂的上下文检查', async () => {
      const user = {
        id: 1,
        username: 'teacher',
        kindergartenId: 1,
        classIds: [10, 20, 30]
      };

      mockRequest.user = user;
      mockRequest.params = { classId: '20' };

      const contextChecker = (req: Request) => {
        const classId = parseInt(req.params.classId);
        return req.user?.classIds?.includes(classId);
      };

      const middleware = roleMiddleware.requireRole('teacher', {
        contextChecker
      });

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('roleAssignment', () => {
    it('应该验证角色分配权限', async () => {
      const user = {
        id: 1,
        username: 'admin',
        roles: [
          { id: 1, name: 'admin', level: 1 }
        ]
      };

      mockRequest.user = user;
      mockRequest.body = {
        userId: 2,
        roleId: 3 // editor role
      };

      mockRole.findByPk.mockResolvedValue({
        id: 3,
        name: 'editor',
        level: 3
      });

      const middleware = roleMiddleware.canAssignRole();
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该拒绝分配更高等级的角色', async () => {
      const user = {
        id: 1,
        username: 'manager',
        roles: [
          { id: 4, name: 'manager', level: 2 }
        ]
      };

      mockRequest.user = user;
      mockRequest.body = {
        userId: 2,
        roleId: 1 // admin role
      };

      mockRole.findByPk.mockResolvedValue({
        id: 1,
        name: 'admin',
        level: 1
      });

      const middleware = roleMiddleware.canAssignRole();
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Cannot assign higher level role',
        userLevel: 2,
        targetLevel: 1
      });
    });

    it('应该处理批量角色分配', async () => {
      const user = {
        id: 1,
        username: 'admin',
        roles: [
          { id: 1, name: 'admin', level: 1 }
        ]
      };

      mockRequest.user = user;
      mockRequest.body = {
        userIds: [2, 3, 4],
        roleIds: [3, 4, 5] // editor, manager, user
      };

      mockRole.findAll.mockResolvedValue([
        { id: 3, name: 'editor', level: 3 },
        { id: 4, name: 'manager', level: 2 },
        { id: 5, name: 'user', level: 5 }
      ]);

      const middleware = roleMiddleware.canAssignRole({ bulk: true });
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('temporaryRoles', () => {
    it('应该处理临时角色', async () => {
      const user = {
        id: 1,
        username: 'user',
        roles: [
          { id: 5, name: 'user', level: 5 }
        ],
        temporaryRoles: [
          {
            id: 3,
            name: 'editor',
            level: 3,
            expiresAt: new Date(Date.now() + 3600000) // 1小时后过期
          }
        ]
      };

      mockRequest.user = user;

      const middleware = roleMiddleware.requireRole('editor');
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该拒绝过期的临时角色', async () => {
      const user = {
        id: 1,
        username: 'user',
        roles: [
          { id: 5, name: 'user', level: 5 }
        ],
        temporaryRoles: [
          {
            id: 3,
            name: 'editor',
            level: 3,
            expiresAt: new Date(Date.now() - 3600000) // 1小时前过期
          }
        ]
      };

      mockRequest.user = user;

      const middleware = roleMiddleware.requireRole('editor');
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Expired temporary role'),
        expect.objectContaining({
          userId: user.id,
          role: 'editor'
        })
      );
    });
  });

  describe('roleInheritance', () => {
    it('应该处理角色继承', async () => {
      const user = {
        id: 1,
        username: 'manager',
        roles: [
          {
            id: 4,
            name: 'manager',
            level: 2,
            inherits: ['editor', 'user']
          }
        ]
      };

      mockRequest.user = user;
      mockCache.get.mockResolvedValue(['manager', 'editor', 'user']);

      const middleware = roleMiddleware.requireRole('editor');
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该处理复杂的角色继承链', async () => {
      const user = {
        id: 1,
        username: 'admin',
        roles: [
          {
            id: 1,
            name: 'admin',
            level: 1,
            inherits: ['manager']
          }
        ]
      };

      mockRequest.user = user;
      mockCache.get.mockResolvedValue(null);

      // 模拟角色继承解析
      const roleHierarchy = {
        admin: ['manager', 'editor', 'user'],
        manager: ['editor', 'user'],
        editor: ['user'],
        user: []
      };

      mockUserRole.findAll.mockResolvedValue([
        { roleId: 1, userId: 1 }
      ]);
      mockRole.findAll.mockResolvedValue([
        {
          id: 1,
          name: 'admin',
          level: 1,
          inherits: roleHierarchy.admin
        }
      ]);

      const middleware = roleMiddleware.requireRole('user');
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('错误处理', () => {
    it('应该处理角色查询错误', async () => {
      const user = { id: 1, username: 'user' };
      mockRequest.user = user;

      const dbError = new Error('Database connection failed');
      mockCache.get.mockResolvedValue(null);
      mockUserRole.findAll.mockRejectedValue(dbError);

      const middleware = roleMiddleware.requireRole('admin');
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Role check failed'),
        expect.objectContaining({
          userId: user.id,
          error: dbError.message
        })
      );
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Role verification failed'
      });
    });

    it('应该处理缓存错误', async () => {
      const user = { id: 1, username: 'user' };
      mockRequest.user = user;

      const cacheError = new Error('Cache service unavailable');
      mockCache.get.mockRejectedValue(cacheError);
      mockUserRole.findAll.mockResolvedValue([]);

      const middleware = roleMiddleware.requireRole('admin');
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Cache error in role middleware'),
        expect.objectContaining({
          error: cacheError.message
        })
      );
      // 应该继续执行，不依赖缓存
      expect(mockUserRole.findAll).toHaveBeenCalled();
    });

    it('应该处理无效的角色配置', async () => {
      const user = { id: 1, username: 'user' };
      mockRequest.user = user;

      const middleware = roleMiddleware.requireRole(null as any);
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Invalid role configuration')
      );
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe('性能优化', () => {
    it('应该缓存角色查询结果', async () => {
      const user = { id: 1, username: 'admin' };
      mockRequest.user = user;

      mockCache.get.mockResolvedValue(null);
      mockUserRole.findAll.mockResolvedValue([{ roleId: 1, userId: 1 }]);
      mockRole.findAll.mockResolvedValue([
        { id: 1, name: 'admin', level: 1 }
      ]);

      const middleware = roleMiddleware.requireRole('admin');
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockCache.set).toHaveBeenCalledWith(
        `user_roles:${user.id}`,
        expect.any(Array),
        expect.any(Number)
      );
    });

    it('应该批量查询用户角色', async () => {
      const userIds = [1, 2, 3];

      const roles = await roleMiddleware.batchGetUserRoles(userIds);

      expect(mockUserRole.findAll).toHaveBeenCalledWith({
        where: { userId: { [Symbol.for('in')]: userIds } }
      });
      expect(roles).toHaveProperty('1');
      expect(roles).toHaveProperty('2');
      expect(roles).toHaveProperty('3');
    });

    it('应该预加载用户角色', async () => {
      const userId = 1;

      await roleMiddleware.preloadUserRoles(userId);

      expect(mockCache.set).toHaveBeenCalledWith(
        `user_roles:${userId}`,
        expect.any(Array),
        expect.any(Number)
      );
    });
  });

  describe('集成测试', () => {
    it('应该与认证中间件集成', async () => {
      const user = {
        id: 1,
        username: 'admin',
        roles: [{ id: 1, name: 'admin', level: 1 }]
      };
      mockRequest.user = user;
      mockRequest.headers.authorization = 'Bearer valid-token';

      mockCache.get.mockResolvedValue(['admin']);

      const middleware = roleMiddleware.requireRole('admin');
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该与权限中间件集成', async () => {
      const user = {
        id: 1,
        username: 'editor',
        roles: [{ id: 3, name: 'editor', level: 3 }]
      };
      mockRequest.user = user;

      mockCache.get.mockResolvedValue(['editor']);

      const middleware = roleMiddleware.requireRole('editor', {
        checkPermissions: true
      });
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockResponse.locals.userRoles).toEqual(['editor']);
    });

    it('应该处理复杂的业务场景', async () => {
      const user = {
        id: 1,
        username: 'principal',
        kindergartenId: 1,
        roles: [{ id: 8, name: 'principal', level: 2 }]
      };
      mockRequest.user = user;
      mockRequest.params = { kindergartenId: '1', action: 'manage_teachers' };

      const contextualMiddleware = roleMiddleware.requireRole('principal', {
        context: 'kindergarten',
        contextField: 'kindergartenId',
        actions: ['manage_teachers', 'manage_students']
      });

      mockCache.get.mockResolvedValue(['principal']);

      await contextualMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });
});
