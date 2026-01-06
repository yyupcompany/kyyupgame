import { jest } from '@jest/globals';
import { vi } from 'vitest'
import { Request, Response, NextFunction } from 'express';

// Mock dependencies
const mockLoggerService = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
};

const mockConfigService = {
  get: jest.fn(),
  set: jest.fn()
};

const mockNotificationService = {
  sendErrorNotification: jest.fn(),
  sendCriticalAlert: jest.fn()
};

const mockMonitoringService = {
  recordError: jest.fn(),
  incrementErrorCount: jest.fn(),
  trackErrorRate: jest.fn()
};

// Mock imports
jest.unstable_mockModule('../../../../../src/services/logger.service', () => mockLoggerService);
jest.unstable_mockModule('../../../../../src/services/config.service', () => mockConfigService);
jest.unstable_mockModule('../../../../../src/services/notification.service', () => mockNotificationService);
jest.unstable_mockModule('../../../../../src/services/monitoring.service', () => mockMonitoringService);

// Mock request and response objects
const createMockRequest = (overrides = {}): Partial<Request> => ({
  method: 'GET',
  url: '/api/test',
  path: '/api/test',
  originalUrl: '/api/test?param=value',
  ip: '192.168.1.100',
  headers: {
    'user-agent': 'Mozilla/5.0',
    'accept': 'application/json'
  },
  user: {
    id: 1,
    email: 'user@example.com',
    role: 'teacher'
  },
  body: {},
  query: {},
  params: {},
  requestId: 'req_123456789',
  ...overrides
});

const createMockResponse = (): Partial<Response> => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
  setHeader: jest.fn().mockReturnThis(),
  headersSent: false
});

const createMockNext = (): NextFunction => jest.fn();


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

describe('Error Handler Middleware', () => {
  let errorHandler: any;
  let notFoundHandler: any;
  let asyncErrorHandler: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/middlewares/error-handler.middleware');
    errorHandler = imported.errorHandler;
    notFoundHandler = imported.notFoundHandler;
    asyncErrorHandler = imported.asyncErrorHandler;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockConfigService.get.mockImplementation((key) => {
      const config = {
        'error.logging.enabled': true,
        'error.monitoring.enabled': true,
        'error.notification.enabled': true,
        'error.notification.critical.enabled': true,
        'error.response.includeStack': false,
        'error.response.includeDetails': true,
        'app.env': 'development',
        'error.rate.threshold': 10,
        'error.rate.window': 60000
      };
      return config[key];
    });
  });

  describe('errorHandler', () => {
    it('应该处理一般错误', async () => {
      const error = new Error('测试错误');
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      expect(mockLoggerService.error).toHaveBeenCalledWith(
        '请求处理错误',
        expect.objectContaining({
          error: {
            name: 'Error',
            message: '测试错误',
            stack: expect.any(String)
          },
          request: expect.objectContaining({
            method: 'GET',
            url: '/api/test',
            ip: '192.168.1.100'
          })
        })
      );

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: '内部服务器错误',
        message: '服务器遇到了一个错误',
        timestamp: expect.any(String),
        requestId: 'req_123456789'
      });
    });

    it('应该处理HTTP错误', async () => {
      const error = new Error('资源未找到') as any;
      error.status = 404;
      error.statusCode = 404;

      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: '资源未找到',
        message: '资源未找到',
        timestamp: expect.any(String),
        requestId: 'req_123456789'
      });
    });

    it('应该处理验证错误', async () => {
      const error = new Error('验证失败') as any;
      error.name = 'ValidationError';
      error.details = [
        { field: 'email', message: '邮箱格式无效' },
        { field: 'password', message: '密码长度不足' }
      ];

      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: '验证错误',
        message: '请求数据验证失败',
        details: [
          { field: 'email', message: '邮箱格式无效' },
          { field: 'password', message: '密码长度不足' }
        ],
        timestamp: expect.any(String),
        requestId: 'req_123456789'
      });
    });

    it('应该处理数据库错误', async () => {
      const error = new Error('数据库连接失败') as any;
      error.name = 'SequelizeConnectionError';
      error.original = {
        code: 'ECONNREFUSED',
        errno: -61,
        syscall: 'connect'
      };

      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith({
        error: '服务不可用',
        message: '数据库服务暂时不可用',
        timestamp: expect.any(String),
        requestId: 'req_123456789'
      });

      expect(mockNotificationService.sendCriticalAlert).toHaveBeenCalledWith({
        type: 'database_error',
        message: '数据库连接失败',
        severity: 'critical'
      });
    });

    it('应该处理JWT错误', async () => {
      const error = new Error('jwt malformed') as any;
      error.name = 'JsonWebTokenError';

      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: '认证失败',
        message: '无效的访问令牌',
        timestamp: expect.any(String),
        requestId: 'req_123456789'
      });
    });

    it('应该处理权限错误', async () => {
      const error = new Error('权限不足') as any;
      error.name = 'ForbiddenError';
      error.permission = 'admin:write';

      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: '权限不足',
        message: '您没有执行此操作的权限',
        required: 'admin:write',
        timestamp: expect.any(String),
        requestId: 'req_123456789'
      });
    });

    it('应该在开发环境包含堆栈信息', async () => {
      mockConfigService.get.mockImplementation((key) => {
        if (key === 'app.env') return 'development';
        if (key === 'error.response.includeStack') return true;
        return null;
      });

      const error = new Error('开发环境错误');
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stack: expect.any(String)
        })
      );
    });

    it('应该在生产环境隐藏敏感信息', async () => {
      mockConfigService.get.mockImplementation((key) => {
        if (key === 'app.env') return 'production';
        if (key === 'error.response.includeStack') return false;
        if (key === 'error.response.includeDetails') return false;
        return null;
      });

      const error = new Error('生产环境敏感错误');
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        error: '内部服务器错误',
        message: '服务器遇到了一个错误',
        timestamp: expect.any(String),
        requestId: 'req_123456789'
      });

      expect(res.json).not.toHaveBeenCalledWith(
        expect.objectContaining({
          stack: expect.any(String)
        })
      );
    });

    it('应该记录错误监控指标', async () => {
      const error = new Error('监控测试错误');
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      expect(mockMonitoringService.recordError).toHaveBeenCalledWith({
        error: error,
        request: req,
        statusCode: 500
      });

      expect(mockMonitoringService.incrementErrorCount).toHaveBeenCalledWith({
        path: '/api/test',
        method: 'GET',
        statusCode: 500
      });
    });

    it('应该处理已发送响应的情况', async () => {
      const error = new Error('响应已发送错误');
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      res.headersSent = true;

      await errorHandler(error, req, res, next);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });

    it('应该过滤敏感信息', async () => {
      const error = new Error('包含敏感信息的错误') as any;
      error.password = 'secret123';
      error.token = 'jwt-token-secret';
      error.apiKey = 'api-key-secret';

      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      expect(mockLoggerService.error).toHaveBeenCalledWith(
        '请求处理错误',
        expect.objectContaining({
          error: expect.objectContaining({
            password: '[REDACTED]',
            token: '[REDACTED]',
            apiKey: '[REDACTED]'
          })
        })
      );
    });
  });

  describe('notFoundHandler', () => {
    it('应该处理404错误', async () => {
      const req = createMockRequest({
        method: 'GET',
        url: '/api/nonexistent'
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await notFoundHandler(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: '资源未找到',
        message: '请求的资源不存在',
        path: '/api/nonexistent',
        method: 'GET',
        timestamp: expect.any(String),
        requestId: 'req_123456789'
      });
    });

    it('应该记录404请求', async () => {
      const req = createMockRequest({
        url: '/api/missing'
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await notFoundHandler(req, res, next);

      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        '404 - 资源未找到',
        expect.objectContaining({
          path: '/api/missing',
          method: 'GET',
          ip: '192.168.1.100'
        })
      );
    });

    it('应该提供API建议', async () => {
      const req = createMockRequest({
        url: '/api/user' // 应该是 /api/users
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await notFoundHandler(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          suggestions: expect.arrayContaining([
            expect.stringContaining('/api/users')
          ])
        })
      );
    });
  });

  describe('asyncErrorHandler', () => {
    it('应该包装异步函数并捕获错误', async () => {
      const asyncFunction = jest.fn().mockRejectedValue(new Error('异步错误'));
      const wrappedFunction = asyncErrorHandler(asyncFunction);

      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await wrappedFunction(req, res, next);

      expect(asyncFunction).toHaveBeenCalledWith(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('应该正常传递成功的异步函数', async () => {
      const asyncFunction = jest.fn().mockResolvedValue('success');
      const wrappedFunction = asyncErrorHandler(asyncFunction);

      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await wrappedFunction(req, res, next);

      expect(asyncFunction).toHaveBeenCalledWith(req, res, next);
      expect(next).not.toHaveBeenCalled();
    });

    it('应该处理同步错误', async () => {
      const syncFunction = jest.fn().mockImplementation(() => {
        throw new Error('同步错误');
      });
      const wrappedFunction = asyncErrorHandler(syncFunction);

      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await wrappedFunction(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('错误率监控', () => {
    it('应该跟踪错误率', async () => {
      const error = new Error('错误率测试');
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      expect(mockMonitoringService.trackErrorRate).toHaveBeenCalledWith({
        path: '/api/test',
        method: 'GET'
      });
    });

    it('应该在错误率过高时发送警报', async () => {
      mockMonitoringService.trackErrorRate.mockResolvedValue({
        rate: 0.15, // 15% 错误率
        threshold: 0.10 // 10% 阈值
      });

      const error = new Error('高错误率测试');
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      expect(mockNotificationService.sendCriticalAlert).toHaveBeenCalledWith({
        type: 'high_error_rate',
        message: '错误率过高',
        rate: 0.15,
        threshold: 0.10,
        path: '/api/test'
      });
    });
  });

  describe('特殊错误类型', () => {
    it('应该处理超时错误', async () => {
      const error = new Error('请求超时') as any;
      error.code = 'ETIMEDOUT';

      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(408);
      expect(res.json).toHaveBeenCalledWith({
        error: '请求超时',
        message: '请求处理时间过长',
        timestamp: expect.any(String),
        requestId: 'req_123456789'
      });
    });

    it('应该处理文件大小错误', async () => {
      const error = new Error('文件过大') as any;
      error.code = 'LIMIT_FILE_SIZE';
      error.limit = 1024 * 1024; // 1MB

      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(413);
      expect(res.json).toHaveBeenCalledWith({
        error: '文件过大',
        message: '上传的文件超过大小限制',
        limit: 1024 * 1024,
        timestamp: expect.any(String),
        requestId: 'req_123456789'
      });
    });

    it('应该处理速率限制错误', async () => {
      const error = new Error('请求过于频繁') as any;
      error.name = 'RateLimitError';
      error.retryAfter = 60;

      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.setHeader).toHaveBeenCalledWith('Retry-After', 60);
      expect(res.json).toHaveBeenCalledWith({
        error: '请求过于频繁',
        message: '请稍后再试',
        retryAfter: 60,
        timestamp: expect.any(String),
        requestId: 'req_123456789'
      });
    });
  });

  describe('配置管理', () => {
    it('应该根据配置启用/禁用错误日志', async () => {
      mockConfigService.get.mockImplementation((key) => {
        if (key === 'error.logging.enabled') return false;
        return null;
      });

      const error = new Error('日志测试错误');
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      expect(mockLoggerService.error).not.toHaveBeenCalled();
    });

    it('应该根据配置启用/禁用错误通知', async () => {
      mockConfigService.get.mockImplementation((key) => {
        if (key === 'error.notification.enabled') return false;
        return null;
      });

      const error = new Error('数据库连接失败') as any;
      error.name = 'SequelizeConnectionError';

      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      expect(mockNotificationService.sendCriticalAlert).not.toHaveBeenCalled();
    });

    it('应该根据配置启用/禁用错误监控', async () => {
      mockConfigService.get.mockImplementation((key) => {
        if (key === 'error.monitoring.enabled') return false;
        return null;
      });

      const error = new Error('监控测试错误');
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      expect(mockMonitoringService.recordError).not.toHaveBeenCalled();
      expect(mockMonitoringService.incrementErrorCount).not.toHaveBeenCalled();
    });
  });
});
