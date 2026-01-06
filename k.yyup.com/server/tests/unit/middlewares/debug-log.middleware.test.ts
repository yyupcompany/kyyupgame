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
  ip: '192.168.1.100',
  get: jest.fn()
} as unknown as Request;

const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
  end: jest.fn().mockReturnThis(),
  locals: {},
  statusCode: 200,
  get: jest.fn(),
  getHeaders: jest.fn().mockReturnValue({})
} as unknown as Response;

const mockNext = jest.fn() as NextFunction;

// Mock logger
const mockLogger = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  trace: jest.fn()
};

// Mock performance
const mockPerformance = {
  now: jest.fn().mockReturnValue(1000)
};

// Mock imports
jest.unstable_mockModule('../../../../../src/utils/logger', () => ({
  default: mockLogger
}));

global.performance = mockPerformance as any;


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

describe('Debug Log Middleware', () => {
  let debugLogMiddleware: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/middlewares/debug-log.middleware');
    debugLogMiddleware = imported.default || imported.debugLog || imported;
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
    mockResponse.statusCode = 200;
    
    // Reset performance mock
    mockPerformance.now.mockReturnValue(1000);
  });

  describe('基础功能', () => {
    it('应该是一个函数', () => {
      expect(typeof debugLogMiddleware).toBe('function');
    });

    it('应该返回中间件函数', () => {
      const middleware = debugLogMiddleware();
      expect(typeof middleware).toBe('function');
      expect(middleware.length).toBe(3); // req, res, next
    });

    it('应该记录基础请求信息', async () => {
      const middleware = debugLogMiddleware();
      
      mockRequest.method = 'GET';
      mockRequest.url = '/api/users';
      mockRequest.ip = '192.168.1.100';

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Request started'),
        expect.objectContaining({
          method: 'GET',
          url: '/api/users',
          ip: '192.168.1.100'
        })
      );
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('请求日志记录', () => {
    it('应该记录请求头信息', async () => {
      const middleware = debugLogMiddleware({
        logHeaders: true
      });
      
      mockRequest.headers = {
        'user-agent': 'Mozilla/5.0',
        'authorization': 'Bearer token123',
        'content-type': 'application/json'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Request headers'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'user-agent': 'Mozilla/5.0',
            'authorization': '[REDACTED]', // 敏感信息应该被隐藏
            'content-type': 'application/json'
          })
        })
      );
    });

    it('应该记录请求体信息', async () => {
      const middleware = debugLogMiddleware({
        logBody: true
      });
      
      mockRequest.body = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'secret123'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Request body'),
        expect.objectContaining({
          body: expect.objectContaining({
            name: 'John Doe',
            email: 'john@example.com',
            password: '[REDACTED]' // 密码应该被隐藏
          })
        })
      );
    });

    it('应该记录查询参数', async () => {
      const middleware = debugLogMiddleware({
        logQuery: true
      });
      
      mockRequest.query = {
        page: '1',
        pageSize: '20',
        search: 'john',
        apiKey: 'secret-key'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Query parameters'),
        expect.objectContaining({
          query: expect.objectContaining({
            page: '1',
            pageSize: '20',
            search: 'john',
            apiKey: '[REDACTED]' // API密钥应该被隐藏
          })
        })
      );
    });

    it('应该记录路由参数', async () => {
      const middleware = debugLogMiddleware({
        logParams: true
      });
      
      mockRequest.params = {
        id: '123',
        userId: '456'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Route parameters'),
        expect.objectContaining({
          params: {
            id: '123',
            userId: '456'
          }
        })
      );
    });

    it('应该记录用户信息', async () => {
      const middleware = debugLogMiddleware({
        logUser: true
      });
      
      mockRequest.user = {
        id: 1,
        username: 'john_doe',
        role: 'admin' as any,
        email: 'john@example.com'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('User information'),
        expect.objectContaining({
          user: expect.objectContaining({
            id: 1,
            username: 'john_doe',
            role: 'admin'
            // email可能被过滤掉以保护隐私
          })
        })
      );
    });
  });

  describe('响应日志记录', () => {
    it('应该记录响应状态和时间', async () => {
      const middleware = debugLogMiddleware({
        logResponse: true
      });
      
      // 模拟请求开始时间
      mockPerformance.now.mockReturnValueOnce(1000);
      // 模拟请求结束时间
      mockPerformance.now.mockReturnValueOnce(1150);

      await middleware(mockRequest, mockResponse, mockNext);

      // 模拟响应结束
      const originalEnd = mockResponse.end;
      mockResponse.statusCode = 200;
      
      // 触发响应结束事件
      if (mockResponse.end && typeof mockResponse.end === 'function') {
        (mockResponse.end as jest.Mock).mockImplementation(function(this: any, ...args: any[]) {
          // 模拟响应结束逻辑
          this.emit?.('finish');
          return originalEnd?.apply(this, args);
        });
      }

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Request completed'),
        expect.objectContaining({
          statusCode: expect.any(Number),
          responseTime: expect.any(Number)
        })
      );
    });

    it('应该记录响应头信息', async () => {
      const middleware = debugLogMiddleware({
        logResponseHeaders: true
      });
      
      mockResponse.getHeaders = jest.fn().mockReturnValue({
        'content-type': 'application/json',
        'x-response-time': '150ms',
        'set-cookie': ['session=abc123; HttpOnly']
      });

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Response headers'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'content-type': 'application/json',
            'x-response-time': '150ms',
            'set-cookie': '[REDACTED]' // Cookie应该被隐藏
          })
        })
      );
    });

    it('应该记录响应体信息', async () => {
      const middleware = debugLogMiddleware({
        logResponseBody: true
      });
      
      const responseData = {
        success: true,
        data: { id: 1, name: 'John' },
        token: 'jwt-token-123'
      };

      // 模拟响应体记录
      mockResponse.locals.responseBody = responseData;

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Response body'),
        expect.objectContaining({
          body: expect.objectContaining({
            success: true,
            data: { id: 1, name: 'John' },
            token: '[REDACTED]' // Token应该被隐藏
          })
        })
      );
    });
  });

  describe('性能监控', () => {
    it('应该记录请求处理时间', async () => {
      const middleware = debugLogMiddleware({
        logPerformance: true
      });
      
      let startTime = 1000;
      let endTime = 1250;
      
      mockPerformance.now
        .mockReturnValueOnce(startTime)
        .mockReturnValueOnce(endTime);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Performance metrics'),
        expect.objectContaining({
          responseTime: 250,
          timestamp: expect.any(Number)
        })
      );
    });

    it('应该记录内存使用情况', async () => {
      const middleware = debugLogMiddleware({
        logMemory: true
      });
      
      // Mock process.memoryUsage
      const originalMemoryUsage = process.memoryUsage;
      process.memoryUsage = jest.fn().mockReturnValue({
        rss: 50 * 1024 * 1024, // 50MB
        heapTotal: 30 * 1024 * 1024, // 30MB
        heapUsed: 20 * 1024 * 1024, // 20MB
        external: 5 * 1024 * 1024 // 5MB
      });

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Memory usage'),
        expect.objectContaining({
          memory: expect.objectContaining({
            rss: expect.any(Number),
            heapTotal: expect.any(Number),
            heapUsed: expect.any(Number)
          })
        })
      );

      // 恢复原始函数
      process.memoryUsage = originalMemoryUsage;
    });

    it('应该检测慢请求', async () => {
      const middleware = debugLogMiddleware({
        slowRequestThreshold: 100 // 100ms
      });
      
      mockPerformance.now
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1250); // 250ms响应时间

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Slow request detected'),
        expect.objectContaining({
          responseTime: 250,
          threshold: 100,
          method: 'GET',
          url: '/api/users'
        })
      );
    });
  });

  describe('错误日志记录', () => {
    it('应该记录中间件错误', async () => {
      const middleware = debugLogMiddleware();
      
      const error = new Error('Middleware error');
      mockNext.mockImplementation(() => {
        throw error;
      });

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Middleware error'),
        expect.objectContaining({
          error: error.message,
          stack: error.stack
        })
      );
    });

    it('应该记录请求处理错误', async () => {
      const middleware = debugLogMiddleware({
        logErrors: true
      });
      
      const processingError = new Error('Request processing failed');
      mockResponse.locals.error = processingError;

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Request processing error'),
        expect.objectContaining({
          error: processingError.message,
          method: 'GET',
          url: '/api/users'
        })
      );
    });

    it('应该记录验证错误', async () => {
      const middleware = debugLogMiddleware({
        logValidationErrors: true
      });
      
      const validationError = {
        name: 'ValidationError',
        details: [
          { message: 'Name is required', path: ['name'] },
          { message: 'Email format is invalid', path: ['email'] }
        ]
      };
      mockResponse.locals.validationError = validationError;

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Validation error'),
        expect.objectContaining({
          validationErrors: validationError.details
        })
      );
    });
  });

  describe('敏感信息过滤', () => {
    it('应该过滤敏感的请求头', async () => {
      const middleware = debugLogMiddleware({
        logHeaders: true,
        sensitiveHeaders: ['authorization', 'x-api-key', 'cookie']
      });
      
      mockRequest.headers = {
        'authorization': 'Bearer secret-token',
        'x-api-key': 'api-key-123',
        'cookie': 'session=abc123',
        'user-agent': 'Mozilla/5.0'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Request headers'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'authorization': '[REDACTED]',
            'x-api-key': '[REDACTED]',
            'cookie': '[REDACTED]',
            'user-agent': 'Mozilla/5.0'
          })
        })
      );
    });

    it('应该过滤敏感的请求体字段', async () => {
      const middleware = debugLogMiddleware({
        logBody: true,
        sensitiveFields: ['password', 'ssn', 'creditCard']
      });
      
      mockRequest.body = {
        username: 'john_doe',
        password: 'secret123',
        ssn: '123-45-6789',
        creditCard: '4111-1111-1111-1111',
        email: 'john@example.com'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Request body'),
        expect.objectContaining({
          body: expect.objectContaining({
            username: 'john_doe',
            password: '[REDACTED]',
            ssn: '[REDACTED]',
            creditCard: '[REDACTED]',
            email: 'john@example.com'
          })
        })
      );
    });

    it('应该过滤嵌套对象中的敏感字段', async () => {
      const middleware = debugLogMiddleware({
        logBody: true,
        sensitiveFields: ['password', 'token']
      });
      
      mockRequest.body = {
        user: {
          name: 'John',
          password: 'secret'
        },
        auth: {
          token: 'jwt-token-123',
          refreshToken: 'refresh-token-456'
        }
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Request body'),
        expect.objectContaining({
          body: expect.objectContaining({
            user: expect.objectContaining({
              name: 'John',
              password: '[REDACTED]'
            }),
            auth: expect.objectContaining({
              token: '[REDACTED]',
              refreshToken: 'refresh-token-456'
            })
          })
        })
      );
    });
  });

  describe('条件日志记录', () => {
    it('应该根据环境变量控制日志级别', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const middleware = debugLogMiddleware({
        productionLogging: false
      });

      await middleware(mockRequest, mockResponse, mockNext);

      // 在生产环境中应该减少日志输出
      expect(mockLogger.debug).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith();

      process.env.NODE_ENV = originalEnv;
    });

    it('应该根据用户角色控制日志记录', async () => {
      const middleware = debugLogMiddleware({
        logUser: true,
        adminOnlyLogging: true
      });
      
      mockRequest.user = {
        id: 1,
        username: 'regular_user',
        role: 'user'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      // 非管理员用户的详细信息不应该被记录
      expect(mockLogger.debug).not.toHaveBeenCalledWith(
        expect.stringContaining('User information'),
        expect.objectContaining({
          user: expect.any(Object)
        })
      );
    });

    it('应该根据请求路径控制日志记录', async () => {
      const middleware = debugLogMiddleware({
        excludePaths: ['/health', '/metrics', '/favicon.ico']
      });
      
      mockRequest.path = '/health';

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.debug).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该根据HTTP方法控制日志记录', async () => {
      const middleware = debugLogMiddleware({
        logMethods: ['POST', 'PUT', 'DELETE']
      });
      
      mockRequest.method = 'GET';

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.debug).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('日志格式化', () => {
    it('应该支持自定义日志格式', async () => {
      const customFormatter = jest.fn((data) => ({
        timestamp: new Date().toISOString(),
        level: 'DEBUG',
        message: `${data.method} ${data.url}`,
        details: data
      }));

      const middleware = debugLogMiddleware({
        formatter: customFormatter
      });

      await middleware(mockRequest, mockResponse, mockNext);

      expect(customFormatter).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/api/users'
        })
      );
    });

    it('应该支持结构化日志输出', async () => {
      const middleware = debugLogMiddleware({
        structuredLogging: true
      });

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          timestamp: expect.any(Number),
          requestId: expect.any(String),
          method: 'GET',
          url: '/api/users',
          ip: '192.168.1.100'
        })
      );
    });

    it('应该生成唯一的请求ID', async () => {
      const middleware = debugLogMiddleware({
        generateRequestId: true
      });

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.locals.requestId).toBeDefined();
      expect(typeof mockResponse.locals.requestId).toBe('string');
      expect(mockResponse.locals.requestId.length).toBeGreaterThan(0);
    });
  });

  describe('集成测试', () => {
    it('应该与其他中间件协同工作', async () => {
      const middleware = debugLogMiddleware({
        logHeaders: true,
        logBody: true,
        logResponse: true
      });
      
      // 模拟完整的请求-响应周期
      mockRequest.method = 'POST';
      mockRequest.url = '/api/users';
      mockRequest.headers = { 'content-type': 'application/json' };
      mockRequest.body = { name: 'John', email: 'john@example.com' };
      mockResponse.statusCode = 201;

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.debug).toHaveBeenCalledTimes(3); // headers, body, response
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该处理异步操作', async () => {
      const middleware = debugLogMiddleware({
        logPerformance: true
      });
      
      // 模拟异步next函数
      mockNext.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Request started'),
        expect.any(Object)
      );
    });
  });
});
