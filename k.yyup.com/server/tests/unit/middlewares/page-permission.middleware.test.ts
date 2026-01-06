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
  url: '/admin/users',
  path: '/admin/users',
  originalUrl: '/admin/users?page=1',
  route: { path: '/admin/users' }
} as Request;

const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
  end: jest.fn().mockReturnThis(),
  redirect: jest.fn(),
  locals: {}
} as unknown as Response;

const mockNext = jest.fn() as NextFunction;

// Mock models
const mockPage = {
  findOne: jest.fn(),
  findAll: jest.fn()
};

const mockUserPagePermission = {
  findAll: jest.fn(),
  findOne: jest.fn()
};

const mockRolePagePermission = {
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
jest.unstable_mockModule('../../../../../src/models/page.model', () => ({
  default: mockPage
}));

jest.unstable_mockModule('../../../../../src/models/user-page-permission.model', () => ({
  default: mockUserPagePermission
}));

jest.unstable_mockModule('../../../../../src/models/role-page-permission.model', () => ({
  default: mockRolePagePermission
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

describe('Page Permission Middleware', () => {
  let pagePermission: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/middlewares/page-permission.middleware');
    pagePermission = imported.default || imported.pagePermission || imported;
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

  describe('基础功能', () => {
    it('应该是一个函数', () => {
      expect(typeof pagePermission).toBe('function');
    });

    it('应该返回中间件函数', () => {
      const middleware = pagePermission('admin.users');
      expect(typeof middleware).toBe('function');
      expect(middleware.length).toBe(3); // req, res, next
    });

    it('应该拒绝未认证的用户', async () => {
      const middleware = pagePermission('admin.users');
      
      mockRequest.user = null;

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required',
        redirectTo: '/login'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('页面权限检查', () => {
    it('应该允许有页面权限的用户访问', async () => {
      const middleware = pagePermission('admin.users');
      
      mockRequest.user = {
        id: 1,
        username: 'admin',
        role: 'admin'
      };

      mockCache.get.mockResolvedValue(['admin.users', 'admin.dashboard']);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('应该拒绝没有页面权限的用户', async () => {
      const middleware = pagePermission('admin.users');
      
      mockRequest.user = {
        id: 2,
        username: 'teacher',
        role: 'teacher'
      };

      mockCache.get.mockResolvedValue(['teacher.dashboard', 'teacher.classes']);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied to this page',
        page: 'admin.users',
        redirectTo: '/dashboard'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('应该处理多个页面权限检查', async () => {
      const middleware = pagePermission(['admin.users', 'admin.roles']);
      
      mockRequest.user = {
        id: 1,
        username: 'admin',
        role: 'admin'
      };

      mockCache.get.mockResolvedValue(['admin.users', 'admin.dashboard']);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该拒绝没有任何所需页面权限的用户', async () => {
      const middleware = pagePermission(['admin.users', 'admin.roles']);
      
      mockRequest.user = {
        id: 2,
        username: 'teacher',
        role: 'teacher'
      };

      mockCache.get.mockResolvedValue(['teacher.dashboard', 'teacher.classes']);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied to this page',
        pages: ['admin.users', 'admin.roles'],
        redirectTo: '/dashboard'
      });
    });
  });

  describe('动态页面权限', () => {
    it('应该根据URL路径动态确定页面权限', async () => {
      const middleware = pagePermission();
      
      mockRequest.user = {
        id: 1,
        username: 'admin',
        role: 'admin'
      };
      mockRequest.path = '/admin/kindergartens/1/edit';

      mockPage.findOne.mockResolvedValue({
        id: 1,
        path: '/admin/kindergartens/:id/edit',
        permission: 'admin.kindergartens.edit'
      });

      mockCache.get.mockResolvedValue(['admin.kindergartens.edit', 'admin.dashboard']);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该处理参数化路径', async () => {
      const middleware = pagePermission();
      
      mockRequest.user = {
        id: 1,
        username: 'teacher',
        role: 'teacher',
        kindergartenId: 1
      };
      mockRequest.path = '/teacher/classes/10/students';
      mockRequest.params = { classId: '10' };

      mockPage.findOne.mockResolvedValue({
        id: 2,
        path: '/teacher/classes/:classId/students',
        permission: 'teacher.classes.students',
        contextCheck: 'class_ownership'
      });

      mockCache.get.mockResolvedValue(['teacher.classes.students']);

      // 模拟班级所有权检查
      const mockClass = {
        findByPk: jest.fn().mockResolvedValue({
          id: 10,
          teacherId: 1,
          kindergartenId: 1
        })
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该拒绝上下文不匹配的访问', async () => {
      const middleware = pagePermission();
      
      mockRequest.user = {
        id: 1,
        username: 'teacher',
        role: 'teacher',
        kindergartenId: 1
      };
      mockRequest.path = '/teacher/classes/20/students';
      mockRequest.params = { classId: '20' };

      mockPage.findOne.mockResolvedValue({
        id: 2,
        path: '/teacher/classes/:classId/students',
        permission: 'teacher.classes.students',
        contextCheck: 'class_ownership'
      });

      mockCache.get.mockResolvedValue(['teacher.classes.students']);

      // 模拟班级不属于该教师
      const mockClass = {
        findByPk: jest.fn().mockResolvedValue({
          id: 20,
          teacherId: 2, // 不同的教师
          kindergartenId: 1
        })
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied: context mismatch',
        context: 'class_ownership'
      });
    });
  });

  describe('角色基础权限', () => {
    it('应该基于用户角色检查页面权限', async () => {
      const middleware = pagePermission('admin.system');
      
      mockRequest.user = {
        id: 1,
        username: 'superadmin',
        role: 'superadmin'
      };

      mockCache.get.mockResolvedValue(null);
      mockRolePagePermission.findAll.mockResolvedValue([
        { roleId: 1, pagePermission: 'admin.system' },
        { roleId: 1, pagePermission: 'admin.users' }
      ]);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockCache.set).toHaveBeenCalledWith(
        `user_page_permissions:${mockRequest.user.id}`,
        expect.any(Array),
        expect.any(Number)
      );
    });

    it('应该处理用户特定的页面权限覆盖', async () => {
      const middleware = pagePermission('admin.reports');
      
      mockRequest.user = {
        id: 2,
        username: 'manager',
        role: 'manager'
      };

      mockCache.get.mockResolvedValue(null);
      
      // 角色权限不包含admin.reports
      mockRolePagePermission.findAll.mockResolvedValue([
        { roleId: 2, pagePermission: 'manager.dashboard' }
      ]);
      
      // 但用户有特定权限
      mockUserPagePermission.findAll.mockResolvedValue([
        { userId: 2, pagePermission: 'admin.reports', granted: true }
      ]);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该处理用户权限撤销', async () => {
      const middleware = pagePermission('manager.finance');
      
      mockRequest.user = {
        id: 3,
        username: 'manager',
        role: 'manager'
      };

      mockCache.get.mockResolvedValue(null);
      
      // 角色权限包含manager.finance
      mockRolePagePermission.findAll.mockResolvedValue([
        { roleId: 3, pagePermission: 'manager.finance' }
      ]);
      
      // 但用户权限被撤销
      mockUserPagePermission.findAll.mockResolvedValue([
        { userId: 3, pagePermission: 'manager.finance', granted: false }
      ]);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied: permission revoked',
        page: 'manager.finance'
      });
    });
  });

  describe('时间基础权限', () => {
    it('应该检查时间限制的页面权限', async () => {
      const middleware = pagePermission('admin.maintenance');
      
      mockRequest.user = {
        id: 1,
        username: 'admin',
        role: 'admin'
      };

      const now = new Date();
      const startTime = new Date(now.getTime() - 3600000); // 1小时前
      const endTime = new Date(now.getTime() + 3600000); // 1小时后

      mockCache.get.mockResolvedValue(null);
      mockUserPagePermission.findAll.mockResolvedValue([
        {
          userId: 1,
          pagePermission: 'admin.maintenance',
          granted: true,
          startTime,
          endTime
        }
      ]);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该拒绝过期的时间限制权限', async () => {
      const middleware = pagePermission('admin.maintenance');
      
      mockRequest.user = {
        id: 1,
        username: 'admin',
        role: 'admin'
      };

      const now = new Date();
      const startTime = new Date(now.getTime() - 7200000); // 2小时前
      const endTime = new Date(now.getTime() - 3600000); // 1小时前（已过期）

      mockCache.get.mockResolvedValue(null);
      mockUserPagePermission.findAll.mockResolvedValue([
        {
          userId: 1,
          pagePermission: 'admin.maintenance',
          granted: true,
          startTime,
          endTime
        }
      ]);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied: time-based permission expired',
        page: 'admin.maintenance',
        expiredAt: endTime.toISOString()
      });
    });

    it('应该处理工作时间限制', async () => {
      const middleware = pagePermission('teacher.grades', {
        workingHoursOnly: true,
        workingHours: { start: '08:00', end: '18:00' }
      });
      
      mockRequest.user = {
        id: 1,
        username: 'teacher',
        role: 'teacher'
      };

      // 模拟当前时间为工作时间外（晚上10点）
      const mockDate = new Date();
      mockDate.setHours(22, 0, 0, 0);
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      mockCache.get.mockResolvedValue(['teacher.grades']);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied: outside working hours',
        workingHours: { start: '08:00', end: '18:00' },
        currentTime: '22:00'
      });

      jest.restoreAllMocks();
    });
  });

  describe('IP和地理位置限制', () => {
    it('应该检查IP白名单', async () => {
      const middleware = pagePermission('admin.system', {
        ipWhitelist: ['192.168.1.0/24', '10.0.0.1']
      });
      
      mockRequest.user = {
        id: 1,
        username: 'admin',
        role: 'admin'
      };
      mockRequest.ip = '192.168.1.100';

      mockCache.get.mockResolvedValue(['admin.system']);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该拒绝不在IP白名单的访问', async () => {
      const middleware = pagePermission('admin.system', {
        ipWhitelist: ['192.168.1.0/24']
      });
      
      mockRequest.user = {
        id: 1,
        username: 'admin',
        role: 'admin'
      };
      mockRequest.ip = '203.0.113.1'; // 外部IP

      mockCache.get.mockResolvedValue(['admin.system']);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied: IP not allowed',
        ip: '203.0.113.1',
        allowedRanges: ['192.168.1.0/24']
      });
    });

    it('应该检查地理位置限制', async () => {
      const middleware = pagePermission('admin.sensitive', {
        geoRestriction: {
          allowedCountries: ['CN', 'US'],
          allowedCities: ['Beijing', 'Shanghai']
        }
      });
      
      mockRequest.user = {
        id: 1,
        username: 'admin',
        role: 'admin'
      };
      mockRequest.ip = '203.0.113.1';

      // 模拟地理位置查询
      const mockGeoLocation = {
        country: 'CN',
        city: 'Beijing'
      };

      mockCache.get.mockResolvedValue(['admin.sensitive']);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('设备和浏览器限制', () => {
    it('应该检查设备类型限制', async () => {
      const middleware = pagePermission('admin.mobile', {
        deviceRestriction: ['mobile', 'tablet']
      });
      
      mockRequest.user = {
        id: 1,
        username: 'admin',
        role: 'admin'
      };
      mockRequest.headers['user-agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';

      mockCache.get.mockResolvedValue(['admin.mobile']);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该拒绝不允许的设备类型', async () => {
      const middleware = pagePermission('admin.desktop', {
        deviceRestriction: ['desktop']
      });
      
      mockRequest.user = {
        id: 1,
        username: 'admin',
        role: 'admin'
      };
      mockRequest.headers['user-agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';

      mockCache.get.mockResolvedValue(['admin.desktop']);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied: device not allowed',
        deviceType: 'mobile',
        allowedDevices: ['desktop']
      });
    });

    it('应该检查浏览器限制', async () => {
      const middleware = pagePermission('admin.secure', {
        browserRestriction: ['chrome', 'firefox', 'safari']
      });
      
      mockRequest.user = {
        id: 1,
        username: 'admin',
        role: 'admin'
      };
      mockRequest.headers['user-agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

      mockCache.get.mockResolvedValue(['admin.secure']);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('审计和日志', () => {
    it('应该记录页面访问尝试', async () => {
      const middleware = pagePermission('admin.users', {
        auditAccess: true
      });
      
      mockRequest.user = {
        id: 1,
        username: 'admin',
        role: 'admin'
      };

      mockCache.get.mockResolvedValue(['admin.users']);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Page access granted'),
        expect.objectContaining({
          userId: 1,
          username: 'admin',
          page: 'admin.users',
          ip: expect.any(String),
          userAgent: expect.any(String),
          timestamp: expect.any(Number)
        })
      );
    });

    it('应该记录访问拒绝', async () => {
      const middleware = pagePermission('admin.users');
      
      mockRequest.user = {
        id: 2,
        username: 'teacher',
        role: 'teacher'
      };

      mockCache.get.mockResolvedValue(['teacher.dashboard']);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Page access denied'),
        expect.objectContaining({
          userId: 2,
          username: 'teacher',
          page: 'admin.users',
          reason: 'insufficient_permissions'
        })
      );
    });

    it('应该记录安全事件', async () => {
      const middleware = pagePermission('admin.system', {
        ipWhitelist: ['192.168.1.0/24']
      });
      
      mockRequest.user = {
        id: 1,
        username: 'admin',
        role: 'admin'
      };
      mockRequest.ip = '203.0.113.1'; // 外部IP

      mockCache.get.mockResolvedValue(['admin.system']);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Security violation: unauthorized IP access'),
        expect.objectContaining({
          userId: 1,
          ip: '203.0.113.1',
          page: 'admin.system',
          severity: 'high'
        })
      );
    });
  });

  describe('错误处理', () => {
    it('应该处理数据库查询错误', async () => {
      const middleware = pagePermission('admin.users');
      
      mockRequest.user = {
        id: 1,
        username: 'admin',
        role: 'admin'
      };

      const dbError = new Error('Database connection failed');
      mockCache.get.mockResolvedValue(null);
      mockRolePagePermission.findAll.mockRejectedValue(dbError);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Database error in page permission check'),
        expect.objectContaining({
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
      const middleware = pagePermission('admin.users');
      
      mockRequest.user = {
        id: 1,
        username: 'admin',
        role: 'admin'
      };

      const cacheError = new Error('Cache service unavailable');
      mockCache.get.mockRejectedValue(cacheError);
      mockRolePagePermission.findAll.mockResolvedValue([
        { roleId: 1, pagePermission: 'admin.users' }
      ]);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Cache error in page permission middleware'),
        expect.objectContaining({
          error: cacheError.message
        })
      );
      // 应该继续执行，不依赖缓存
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('集成测试', () => {
    it('应该与认证中间件集成', async () => {
      const middleware = pagePermission('admin.dashboard');
      
      mockRequest.user = {
        id: 1,
        username: 'admin',
        role: 'admin'
      };
      mockRequest.headers.authorization = 'Bearer valid-token';

      mockCache.get.mockResolvedValue(['admin.dashboard', 'admin.users']);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该处理复杂的权限场景', async () => {
      const middleware = pagePermission('teacher.class.grades', {
        contextCheck: true,
        workingHoursOnly: true,
        workingHours: { start: '08:00', end: '18:00' },
        auditAccess: true
      });
      
      mockRequest.user = {
        id: 1,
        username: 'teacher',
        role: 'teacher',
        kindergartenId: 1
      };
      mockRequest.params = { classId: '10' };

      // 模拟工作时间内
      const mockDate = new Date();
      mockDate.setHours(14, 0, 0, 0);
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      mockCache.get.mockResolvedValue(['teacher.class.grades']);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Page access granted'),
        expect.any(Object)
      );
      expect(mockNext).toHaveBeenCalledWith();

      jest.restoreAllMocks();
    });
  });
});
