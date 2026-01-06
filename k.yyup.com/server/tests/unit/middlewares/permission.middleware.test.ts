import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock Request and Response objects
const createMockRequest = (overrides = {}) => ({
  user: {
    id: 1,
    roles: ['user'],
    permissions: ['USER_READ']
  },
  params: {},
  query: {},
  body: {},
  headers: {},
  ...overrides
});

const createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    locals: {}
  };
  return res;
};

const mockNext = jest.fn();

// Mock models
const mockUser = {
  findByPk: jest.fn(),
  findOne: jest.fn()
};

const mockRole = {
  findAll: jest.fn(),
  findByPk: jest.fn()
};

const mockPermission = {
  findAll: jest.fn(),
  findOne: jest.fn()
};

// Mock imports
jest.unstable_mockModule('../../../../../src/models/user.model', () => ({
  User: mockUser
}));

jest.unstable_mockModule('../../../../../src/models/role.model', () => ({
  Role: mockRole
}));

jest.unstable_mockModule('../../../../../src/models/permission.model', () => ({
  Permission: mockPermission
}));

jest.unstable_mockModule('../../../../../src/utils/apiError', () => ({
  ApiError: jest.fn().mockImplementation((message, statusCode) => {
    const error = new Error(message);
    (error as any).statusCode = statusCode;
    return error;
  })
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

describe('Permission Middleware', () => {
  let permissionMiddleware: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/middlewares/permission.middleware');
    permissionMiddleware = imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requirePermission', () => {
    it('应该允许具有所需权限的用户访问', async () => {
      const req = createMockRequest({
        user: {
          id: 1,
          permissions: ['USER_READ', 'USER_WRITE']
        }
      });
      const res = createMockResponse();

      const middleware = permissionMiddleware.requirePermission('USER_READ');
      await middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('应该拒绝没有所需权限的用户', async () => {
      const req = createMockRequest({
        user: {
          id: 1,
          permissions: ['USER_READ']
        }
      });
      const res = createMockResponse();

      const middleware = permissionMiddleware.requirePermission('USER_DELETE');
      await middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '权限不足',
        error: 'INSUFFICIENT_PERMISSIONS'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('应该处理多个权限要求（需要全部）', async () => {
      const req = createMockRequest({
        user: {
          id: 1,
          permissions: ['USER_READ', 'USER_WRITE']
        }
      });
      const res = createMockResponse();

      const middleware = permissionMiddleware.requirePermission(['USER_READ', 'USER_WRITE'], 'all');
      await middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该处理多个权限要求（需要任一）', async () => {
      const req = createMockRequest({
        user: {
          id: 1,
          permissions: ['USER_READ']
        }
      });
      const res = createMockResponse();

      const middleware = permissionMiddleware.requirePermission(['USER_READ', 'USER_WRITE'], 'any');
      await middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该在用户未认证时返回401', async () => {
      const req = createMockRequest({
        user: null
      });
      const res = createMockResponse();

      const middleware = permissionMiddleware.requirePermission('USER_READ');
      await middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '未认证',
        error: 'UNAUTHORIZED'
      });
    });

    it('应该支持动态权限检查', async () => {
      const req = createMockRequest({
        user: {
          id: 1,
          permissions: ['USER_READ_OWN']
        },
        params: { userId: '1' }
      });
      const res = createMockResponse();

      const dynamicPermissionCheck = (req: any) => {
        return req.user.id.toString() === req.params.userId ? 'USER_READ_OWN' : 'USER_READ_ALL';
      };

      const middleware = permissionMiddleware.requirePermission(dynamicPermissionCheck);
      await middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('requireRole', () => {
    it('应该允许具有所需角色的用户访问', async () => {
      const req = createMockRequest({
        user: {
          id: 1,
          roles: ['admin', 'teacher']
        }
      });
      const res = createMockResponse();

      const middleware = permissionMiddleware.requireRole('admin');
      await middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该拒绝没有所需角色的用户', async () => {
      const req = createMockRequest({
        user: {
          id: 1,
          roles: ['teacher']
        }
      });
      const res = createMockResponse();

      const middleware = permissionMiddleware.requireRole('admin');
      await middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '角色权限不足',
        error: 'INSUFFICIENT_ROLE'
      });
    });

    it('应该处理多个角色要求', async () => {
      const req = createMockRequest({
        user: {
          id: 1,
          roles: ['teacher']
        }
      });
      const res = createMockResponse();

      const middleware = permissionMiddleware.requireRole(['admin', 'teacher']);
      await middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('checkResourceOwnership', () => {
    it('应该允许资源所有者访问', async () => {
      const req = createMockRequest({
        user: {
          id: 1,
          permissions: ['USER_READ_OWN']
        },
        params: { id: '1' }
      });
      const res = createMockResponse();

      const mockResource = { id: 1, userId: 1, name: '测试资源' };
      mockUser.findByPk.mockResolvedValue(mockResource);

      const middleware = permissionMiddleware.checkResourceOwnership('User', 'userId');
      await middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(req.resource).toEqual(mockResource);
    });

    it('应该拒绝非资源所有者访问', async () => {
      const req = createMockRequest({
        user: {
          id: 1,
          permissions: ['USER_READ_OWN']
        },
        params: { id: '2' }
      });
      const res = createMockResponse();

      const mockResource = { id: 2, userId: 2, name: '其他用户资源' };
      mockUser.findByPk.mockResolvedValue(mockResource);

      const middleware = permissionMiddleware.checkResourceOwnership('User', 'userId');
      await middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '无权访问此资源',
        error: 'RESOURCE_ACCESS_DENIED'
      });
    });

    it('应该在资源不存在时返回404', async () => {
      const req = createMockRequest({
        user: { id: 1 },
        params: { id: '999' }
      });
      const res = createMockResponse();

      mockUser.findByPk.mockResolvedValue(null);

      const middleware = permissionMiddleware.checkResourceOwnership('User', 'userId');
      await middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '资源不存在',
        error: 'RESOURCE_NOT_FOUND'
      });
    });

    it('应该允许管理员访问任何资源', async () => {
      const req = createMockRequest({
        user: {
          id: 1,
          roles: ['admin'],
          permissions: ['USER_READ_ALL']
        },
        params: { id: '2' }
      });
      const res = createMockResponse();

      const mockResource = { id: 2, userId: 2, name: '其他用户资源' };
      mockUser.findByPk.mockResolvedValue(mockResource);

      const middleware = permissionMiddleware.checkResourceOwnership('User', 'userId', {
        adminRoles: ['admin']
      });
      await middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(req.resource).toEqual(mockResource);
    });
  });

  describe('optionalPermission', () => {
    it('应该在有权限时设置用户信息', async () => {
      const req = createMockRequest({
        user: {
          id: 1,
          permissions: ['USER_READ']
        }
      });
      const res = createMockResponse();

      const middleware = permissionMiddleware.optionalPermission('USER_READ');
      await middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(res.locals.hasPermission).toBe(true);
    });

    it('应该在无权限时继续执行但标记无权限', async () => {
      const req = createMockRequest({
        user: {
          id: 1,
          permissions: ['USER_READ']
        }
      });
      const res = createMockResponse();

      const middleware = permissionMiddleware.optionalPermission('USER_DELETE');
      await middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(res.locals.hasPermission).toBe(false);
    });

    it('应该在未认证时继续执行', async () => {
      const req = createMockRequest({
        user: null
      });
      const res = createMockResponse();

      const middleware = permissionMiddleware.optionalPermission('USER_READ');
      await middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(res.locals.hasPermission).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('应该在有任一权限时允许访问', async () => {
      const req = createMockRequest({
        user: {
          id: 1,
          permissions: ['USER_READ']
        }
      });
      const res = createMockResponse();

      const middleware = permissionMiddleware.hasAnyPermission(['USER_READ', 'USER_WRITE', 'USER_DELETE']);
      await middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该在没有任何权限时拒绝访问', async () => {
      const req = createMockRequest({
        user: {
          id: 1,
          permissions: ['STUDENT_READ']
        }
      });
      const res = createMockResponse();

      const middleware = permissionMiddleware.hasAnyPermission(['USER_READ', 'USER_WRITE', 'USER_DELETE']);
      await middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '权限不足',
        error: 'INSUFFICIENT_PERMISSIONS'
      });
    });
  });

  describe('hasAllPermissions', () => {
    it('应该在有所有权限时允许访问', async () => {
      const req = createMockRequest({
        user: {
          id: 1,
          permissions: ['USER_READ', 'USER_WRITE', 'USER_DELETE']
        }
      });
      const res = createMockResponse();

      const middleware = permissionMiddleware.hasAllPermissions(['USER_READ', 'USER_WRITE']);
      await middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该在缺少任一权限时拒绝访问', async () => {
      const req = createMockRequest({
        user: {
          id: 1,
          permissions: ['USER_READ']
        }
      });
      const res = createMockResponse();

      const middleware = permissionMiddleware.hasAllPermissions(['USER_READ', 'USER_WRITE']);
      await middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '权限不足',
        error: 'INSUFFICIENT_PERMISSIONS'
      });
    });
  });

  describe('checkPermissionLevel', () => {
    it('应该在权限级别足够时允许访问', async () => {
      const req = createMockRequest({
        user: {
          id: 1,
          permissionLevel: 8
        }
      });
      const res = createMockResponse();

      const middleware = permissionMiddleware.checkPermissionLevel(5);
      await middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该在权限级别不足时拒绝访问', async () => {
      const req = createMockRequest({
        user: {
          id: 1,
          permissionLevel: 3
        }
      });
      const res = createMockResponse();

      const middleware = permissionMiddleware.checkPermissionLevel(5);
      await middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '权限级别不足',
        error: 'INSUFFICIENT_PERMISSION_LEVEL'
      });
    });
  });

  describe('conditionalPermission', () => {
    it('应该在条件满足时检查权限', async () => {
      const req = createMockRequest({
        user: {
          id: 1,
          permissions: ['USER_WRITE']
        },
        method: 'PUT'
      });
      const res = createMockResponse();

      const condition = (req: any) => req.method === 'PUT';
      const middleware = permissionMiddleware.conditionalPermission(condition, 'USER_WRITE');
      await middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该在条件不满足时跳过权限检查', async () => {
      const req = createMockRequest({
        user: {
          id: 1,
          permissions: []
        },
        method: 'GET'
      });
      const res = createMockResponse();

      const condition = (req: any) => req.method === 'PUT';
      const middleware = permissionMiddleware.conditionalPermission(condition, 'USER_WRITE');
      await middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该在条件满足但权限不足时拒绝访问', async () => {
      const req = createMockRequest({
        user: {
          id: 1,
          permissions: ['USER_READ']
        },
        method: 'PUT'
      });
      const res = createMockResponse();

      const condition = (req: any) => req.method === 'PUT';
      const middleware = permissionMiddleware.conditionalPermission(condition, 'USER_WRITE');
      await middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('refreshUserPermissions', () => {
    it('应该刷新用户权限', async () => {
      const req = createMockRequest({
        user: {
          id: 1,
          permissions: ['USER_READ']
        }
      });
      const res = createMockResponse();

      const mockUserWithRoles = {
        id: 1,
        roles: [
          {
            permissions: [
              { code: 'USER_READ' },
              { code: 'USER_WRITE' }
            ]
          }
        ]
      };

      mockUser.findByPk.mockResolvedValue(mockUserWithRoles);

      const middleware = permissionMiddleware.refreshUserPermissions();
      await middleware(req, res, mockNext);

      expect(req.user.permissions).toEqual(['USER_READ', 'USER_WRITE']);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该处理用户不存在的情况', async () => {
      const req = createMockRequest({
        user: { id: 999 }
      });
      const res = createMockResponse();

      mockUser.findByPk.mockResolvedValue(null);

      const middleware = permissionMiddleware.refreshUserPermissions();
      await middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '用户不存在',
        error: 'USER_NOT_FOUND'
      });
    });
  });

  describe('logPermissionCheck', () => {
    it('应该记录权限检查日志', async () => {
      const req = createMockRequest({
        user: {
          id: 1,
          permissions: ['USER_READ']
        },
        path: '/api/users',
        method: 'GET'
      });
      const res = createMockResponse();

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const middleware = permissionMiddleware.logPermissionCheck('USER_READ');
      await middleware(req, res, mockNext);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Permission check'),
        expect.objectContaining({
          userId: 1,
          permission: 'USER_READ',
          path: '/api/users',
          method: 'GET',
          result: 'granted'
        })
      );

      consoleSpy.mockRestore();
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('错误处理', () => {
    it('应该处理权限检查过程中的错误', async () => {
      const req = createMockRequest({
        user: { id: 1 }
      });
      const res = createMockResponse();

      mockUser.findByPk.mockRejectedValue(new Error('数据库错误'));

      const middleware = permissionMiddleware.refreshUserPermissions();
      await middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '权限检查失败',
        error: 'PERMISSION_CHECK_ERROR'
      });
    });

    it('应该处理无效的权限配置', async () => {
      const req = createMockRequest({
        user: {
          id: 1,
          permissions: ['USER_READ']
        }
      });
      const res = createMockResponse();

      const middleware = permissionMiddleware.requirePermission(null);
      await middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '权限配置错误',
        error: 'INVALID_PERMISSION_CONFIG'
      });
    });
  });
});
