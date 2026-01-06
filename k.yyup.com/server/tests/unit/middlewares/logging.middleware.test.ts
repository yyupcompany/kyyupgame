import { jest } from '@jest/globals';
import { vi } from 'vitest'
import { Request, Response, NextFunction } from 'express';

// Mock logger service
const mockLoggerService = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  http: jest.fn(),
  createChildLogger: jest.fn()
};

// Mock configuration service
const mockConfigService = {
  get: jest.fn(),
  set: jest.fn()
};

// Mock performance monitoring
const mockPerformanceMonitor = {
  startTimer: jest.fn(),
  endTimer: jest.fn(),
  recordMetric: jest.fn(),
  getMetrics: jest.fn()
};

// Mock request ID generator
const mockRequestIdGenerator = {
  generate: jest.fn(),
  validate: jest.fn()
};

// Mock IP utils
const mockIpUtils = {
  getClientIp: jest.fn(),
  getIpInfo: jest.fn(),
  isInternalIp: jest.fn()
};

// Mock user agent parser
const mockUserAgentParser = {
  parse: jest.fn(),
  getBrowser: jest.fn(),
  getOS: jest.fn(),
  getDevice: jest.fn()
};

// Mock imports
jest.unstable_mockModule('../../../../../src/services/logger.service', () => mockLoggerService);
jest.unstable_mockModule('../../../../../src/services/config.service', () => mockConfigService);
jest.unstable_mockModule('../../../../../src/services/performance.service', () => mockPerformanceMonitor);
jest.unstable_mockModule('../../../../../src/utils/request-id.utils', () => mockRequestIdGenerator);
jest.unstable_mockModule('../../../../../src/utils/ip.utils', () => mockIpUtils);
jest.unstable_mockModule('../../../../../src/utils/user-agent.utils', () => mockUserAgentParser);

// Mock request and response objects
const createMockRequest = (overrides = {}): Partial<Request> => ({
  method: 'GET',
  url: '/api/test',
  path: '/api/test',
  originalUrl: '/api/test?param=value',
  ip: '192.168.1.100',
  headers: {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'accept': 'application/json',
    'content-type': 'application/json',
    'x-forwarded-for': '203.0.113.1, 192.168.1.100',
    'referer': 'https://example.com/previous-page'
  },
  user: {
    id: 1,
    email: 'user@example.com',
    role: 'teacher'
  },
  body: { test: 'data' },
  query: { param: 'value' },
  params: { id: '123' },
  ...overrides
});

const createMockResponse = (): Partial<Response> => ({
  statusCode: 200,
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
  end: jest.fn().mockReturnThis(),
  getHeader: jest.fn(),
  setHeader: jest.fn().mockReturnThis(),
  on: jest.fn(),
  once: jest.fn(),
  removeListener: jest.fn()
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

describe('Logging Middleware', () => {
  let loggingMiddleware: any;
  let requestLogger: any;
  let errorLogger: any;
  let performanceLogger: any;
  let securityLogger: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/middlewares/logging.middleware');
    loggingMiddleware = imported.loggingMiddleware;
    requestLogger = imported.requestLogger;
    errorLogger = imported.errorLogger;
    performanceLogger = imported.performanceLogger;
    securityLogger = imported.securityLogger;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockConfigService.get.mockImplementation((key) => {
      const config = {
        'logging.enabled': true,
        'logging.level': 'info',
        'logging.requests.enabled': true,
        'logging.requests.includeBody': false,
        'logging.requests.includeHeaders': false,
        'logging.requests.excludePaths': ['/health', '/metrics'],
        'logging.performance.enabled': true,
        'logging.performance.threshold': 1000, // 1秒
        'logging.security.enabled': true,
        'logging.security.logFailedAuth': true,
        'logging.security.logSuspiciousActivity': true,
        'logging.format': 'json',
        'logging.requestId.enabled': true,
        'logging.userAgent.parse': true,
        'logging.ip.resolve': true
      };
      return config[key];
    });

    mockRequestIdGenerator.generate.mockReturnValue('req_123456789');
    mockIpUtils.getClientIp.mockReturnValue('192.168.1.100');
    mockIpUtils.getIpInfo.mockResolvedValue({
      country: 'CN',
      region: 'Beijing',
      city: 'Beijing',
      isp: 'China Telecom'
    });
    mockUserAgentParser.parse.mockReturnValue({
      browser: { name: 'Chrome', version: '91.0.4472.124' },
      os: { name: 'Windows', version: '10' },
      device: { type: 'desktop', vendor: null, model: null }
    });
    mockPerformanceMonitor.startTimer.mockReturnValue('timer_123');
  });

  describe('requestLogger', () => {
    it('应该记录HTTP请求', async () => {
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await requestLogger(req, res, next);

      expect(mockRequestIdGenerator.generate).toHaveBeenCalled();
      expect(req.requestId).toBe('req_123456789');
      expect(mockLoggerService.http).toHaveBeenCalledWith(
        'HTTP Request',
        expect.objectContaining({
          requestId: 'req_123456789',
          method: 'GET',
          url: '/api/test',
          ip: '192.168.1.100',
          userAgent: expect.any(String)
        })
      );
      expect(next).toHaveBeenCalled();
    });

    it('应该记录请求完成', async () => {
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      // Mock response finish event
      let finishCallback: Function;
      res.on = jest.fn().mockImplementation((event, callback) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      });

      await requestLogger(req, res, next);

      // Simulate response finish
      res.statusCode = 200;
      mockPerformanceMonitor.endTimer.mockReturnValue(250); // 250ms
      finishCallback();

      expect(mockLoggerService.http).toHaveBeenCalledWith(
        'HTTP Response',
        expect.objectContaining({
          requestId: 'req_123456789',
          method: 'GET',
          url: '/api/test',
          statusCode: 200,
          responseTime: 250
        })
      );
    });

    it('应该包含用户信息', async () => {
      const req = createMockRequest({
        user: {
          id: 1,
          email: 'user@example.com',
          role: 'admin'
        }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await requestLogger(req, res, next);

      expect(mockLoggerService.http).toHaveBeenCalledWith(
        'HTTP Request',
        expect.objectContaining({
          user: {
            id: 1,
            email: 'user@example.com',
            role: 'admin'
          }
        })
      );
    });

    it('应该解析用户代理', async () => {
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await requestLogger(req, res, next);

      expect(mockUserAgentParser.parse).toHaveBeenCalledWith(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      );
      expect(mockLoggerService.http).toHaveBeenCalledWith(
        'HTTP Request',
        expect.objectContaining({
          browser: { name: 'Chrome', version: '91.0.4472.124' },
          os: { name: 'Windows', version: '10' },
          device: { type: 'desktop', vendor: null, model: null }
        })
      );
    });

    it('应该解析IP地址信息', async () => {
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await requestLogger(req, res, next);

      expect(mockIpUtils.getIpInfo).toHaveBeenCalledWith('192.168.1.100');
      expect(mockLoggerService.http).toHaveBeenCalledWith(
        'HTTP Request',
        expect.objectContaining({
          ipInfo: {
            country: 'CN',
            region: 'Beijing',
            city: 'Beijing',
            isp: 'China Telecom'
          }
        })
      );
    });

    it('应该排除指定路径', async () => {
      const req = createMockRequest({
        path: '/health'
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await requestLogger(req, res, next);

      expect(mockLoggerService.http).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('应该根据配置包含请求体', async () => {
      mockConfigService.get.mockImplementation((key) => {
        if (key === 'logging.requests.includeBody') return true;
        return mockConfigService.get.mockReturnValue(key);
      });

      const req = createMockRequest({
        body: { username: 'test', password: 'secret' }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await requestLogger(req, res, next);

      expect(mockLoggerService.http).toHaveBeenCalledWith(
        'HTTP Request',
        expect.objectContaining({
          body: { username: 'test', password: '[REDACTED]' }
        })
      );
    });

    it('应该根据配置包含请求头', async () => {
      mockConfigService.get.mockImplementation((key) => {
        if (key === 'logging.requests.includeHeaders') return true;
        return mockConfigService.get.mockReturnValue(key);
      });

      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await requestLogger(req, res, next);

      expect(mockLoggerService.http).toHaveBeenCalledWith(
        'HTTP Request',
        expect.objectContaining({
          headers: expect.objectContaining({
            'user-agent': expect.any(String),
            'accept': 'application/json'
          })
        })
      );
    });

    it('应该过滤敏感头信息', async () => {
      mockConfigService.get.mockImplementation((key) => {
        if (key === 'logging.requests.includeHeaders') return true;
        return mockConfigService.get.mockReturnValue(key);
      });

      const req = createMockRequest({
        headers: {
          'authorization': 'Bearer secret-token',
          'cookie': 'session=secret-session',
          'x-api-key': 'secret-api-key',
          'user-agent': 'Mozilla/5.0'
        }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await requestLogger(req, res, next);

      expect(mockLoggerService.http).toHaveBeenCalledWith(
        'HTTP Request',
        expect.objectContaining({
          headers: expect.objectContaining({
            'authorization': '[REDACTED]',
            'cookie': '[REDACTED]',
            'x-api-key': '[REDACTED]',
            'user-agent': 'Mozilla/5.0'
          })
        })
      );
    });
  });

  describe('errorLogger', () => {
    it('应该记录错误', async () => {
      const error = new Error('测试错误');
      error.stack = 'Error: 测试错误\n    at test.js:1:1';
      
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      req.requestId = 'req_123456789';

      await errorLogger(error, req, res, next);

      expect(mockLoggerService.error).toHaveBeenCalledWith(
        '请求处理错误',
        expect.objectContaining({
          requestId: 'req_123456789',
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
      expect(next).toHaveBeenCalledWith(error);
    });

    it('应该记录HTTP错误状态', async () => {
      const error = new Error('未找到资源') as any;
      error.status = 404;
      (error as any).statusCode = 404;
      
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await errorLogger(error, req, res, next);

      expect(mockLoggerService.error).toHaveBeenCalledWith(
        '请求处理错误',
        expect.objectContaining({
          error: expect.objectContaining({
            status: 404,
            statusCode: 404
          })
        })
      );
    });

    it('应该记录验证错误详情', async () => {
      const error = new Error('验证失败') as any;
      error.name = 'ValidationError';
      error.details = [
        { field: 'email', message: '邮箱格式无效' },
        { field: 'password', message: '密码长度不足' }
      ];
      
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await errorLogger(error, req, res, next);

      expect(mockLoggerService.error).toHaveBeenCalledWith(
        '请求处理错误',
        expect.objectContaining({
          error: expect.objectContaining({
            name: 'ValidationError',
            details: [
              { field: 'email', message: '邮箱格式无效' },
              { field: 'password', message: '密码长度不足' }
            ]
          })
        })
      );
    });

    it('应该记录数据库错误', async () => {
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

      await errorLogger(error, req, res, next);

      expect(mockLoggerService.error).toHaveBeenCalledWith(
        '请求处理错误',
        expect.objectContaining({
          error: expect.objectContaining({
            name: 'SequelizeConnectionError',
            original: expect.objectContaining({
              code: 'ECONNREFUSED'
            })
          })
        })
      );
    });

    it('应该过滤敏感信息', async () => {
      const error = new Error('认证失败') as any;
      error.token = 'secret-jwt-token';
      error.password = 'user-password';
      error.apiKey = 'secret-api-key';
      
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await errorLogger(error, req, res, next);

      expect(mockLoggerService.error).toHaveBeenCalledWith(
        '请求处理错误',
        expect.objectContaining({
          error: expect.objectContaining({
            token: '[REDACTED]',
            password: '[REDACTED]',
            apiKey: '[REDACTED]'
          })
        })
      );
    });
  });

  describe('performanceLogger', () => {
    it('应该记录慢请求', async () => {
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      req.requestId = 'req_123456789';

      // Mock slow response
      let finishCallback: Function;
      res.on = jest.fn().mockImplementation((event, callback) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      });

      await performanceLogger(req, res, next);

      // Simulate slow response (2 seconds)
      mockPerformanceMonitor.endTimer.mockReturnValue(2000);
      finishCallback();

      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        '慢请求检测',
        expect.objectContaining({
          requestId: 'req_123456789',
          method: 'GET',
          url: '/api/test',
          responseTime: 2000,
          threshold: 1000
        })
      );
    });

    it('应该记录性能指标', async () => {
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      let finishCallback: Function;
      res.on = jest.fn().mockImplementation((event, callback) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      });

      await performanceLogger(req, res, next);

      mockPerformanceMonitor.endTimer.mockReturnValue(500);
      finishCallback();

      expect(mockPerformanceMonitor.recordMetric).toHaveBeenCalledWith('http_request_duration', 500, {
        method: 'GET',
        path: '/api/test',
        status: 200
      });
    });

    it('应该跳过快速请求的警告', async () => {
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      let finishCallback: Function;
      res.on = jest.fn().mockImplementation((event, callback) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      });

      await performanceLogger(req, res, next);

      // Fast response (200ms)
      mockPerformanceMonitor.endTimer.mockReturnValue(200);
      finishCallback();

      expect(mockLoggerService.warn).not.toHaveBeenCalled();
      expect(mockPerformanceMonitor.recordMetric).toHaveBeenCalled();
    });
  });

  describe('securityLogger', () => {
    it('应该记录认证失败', async () => {
      const req = createMockRequest({
        path: '/api/auth/login',
        body: { email: 'user@example.com', password: 'wrong-password' }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      let finishCallback: Function;
      res.on = jest.fn().mockImplementation((event, callback) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      });

      await securityLogger(req, res, next);

      // Simulate authentication failure
      res.statusCode = 401;
      finishCallback();

      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        '认证失败',
        expect.objectContaining({
          ip: '192.168.1.100',
          path: '/api/auth/login',
          email: 'user@example.com',
          statusCode: 401
        })
      );
    });

    it('应该记录可疑活动', async () => {
      const req = createMockRequest({
        headers: {
          'user-agent': 'sqlmap/1.0',
          'x-forwarded-for': '192.168.1.100'
        },
        url: '/api/users?id=1\' OR \'1\'=\'1'
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await securityLogger(req, res, next);

      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        '可疑活动检测',
        expect.objectContaining({
          type: 'suspicious_user_agent',
          ip: '192.168.1.100',
          userAgent: 'sqlmap/1.0',
          url: '/api/users?id=1\' OR \'1\'=\'1'
        })
      );
    });

    it('应该记录SQL注入尝试', async () => {
      const req = createMockRequest({
        query: {
          id: '1\' OR \'1\'=\'1',
          search: 'test; DROP TABLE users;'
        }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await securityLogger(req, res, next);

      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        '可疑活动检测',
        expect.objectContaining({
          type: 'sql_injection_attempt',
          ip: '192.168.1.100',
          suspiciousParams: expect.any(Object)
        })
      );
    });

    it('应该记录XSS尝试', async () => {
      const req = createMockRequest({
        body: {
          comment: '<script>alert("xss")</script>',
          name: '<img src="x" onerror="alert(1)">'
        }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await securityLogger(req, res, next);

      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        '可疑活动检测',
        expect.objectContaining({
          type: 'xss_attempt',
          ip: '192.168.1.100',
          suspiciousData: expect.any(Object)
        })
      );
    });

    it('应该记录频繁请求', async () => {
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      // Mock rate limit detection
      req.rateLimit = {
        limit: 100,
        current: 95,
        remaining: 5
      };

      await securityLogger(req, res, next);

      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        '频繁请求警告',
        expect.objectContaining({
          ip: '192.168.1.100',
          limit: 100,
          current: 95,
          remaining: 5
        })
      );
    });

    it('应该记录权限提升尝试', async () => {
      const req = createMockRequest({
        path: '/api/admin/users',
        user: { id: 1, role: 'teacher' } // 非管理员尝试访问管理员接口
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      let finishCallback: Function;
      res.on = jest.fn().mockImplementation((event, callback) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      });

      await securityLogger(req, res, next);

      // Simulate access denied
      res.statusCode = 403;
      finishCallback();

      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        '权限提升尝试',
        expect.objectContaining({
          userId: 1,
          userRole: 'teacher',
          attemptedPath: '/api/admin/users',
          statusCode: 403
        })
      );
    });
  });

  describe('配置管理', () => {
    it('应该根据配置启用/禁用日志记录', async () => {
      mockConfigService.get.mockImplementation((key) => {
        if (key === 'logging.enabled') return false;
        return null;
      });

      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await requestLogger(req, res, next);

      expect(mockLoggerService.http).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('应该根据日志级别过滤日志', async () => {
      mockConfigService.get.mockImplementation((key) => {
        if (key === 'logging.level') return 'error';
        return mockConfigService.get.mockReturnValue(key);
      });

      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await requestLogger(req, res, next);

      // info 级别的日志应该被过滤
      expect(mockLoggerService.http).not.toHaveBeenCalled();
    });

    it('应该支持自定义日志格式', async () => {
      mockConfigService.get.mockImplementation((key) => {
        if (key === 'logging.format') return 'text';
        return mockConfigService.get.mockReturnValue(key);
      });

      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await requestLogger(req, res, next);

      expect(mockLoggerService.http).toHaveBeenCalledWith(
        expect.stringMatching(/GET \/api\/test/), // 文本格式
        expect.any(Object)
      );
    });
  });

  describe('错误处理', () => {
    it('应该处理日志服务错误', async () => {
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const logError = new Error('日志服务不可用');
      mockLoggerService.http.mockRejectedValue(logError);

      await requestLogger(req, res, next);

      // 即使日志失败，也应该继续处理请求
      expect(next).toHaveBeenCalled();
    });

    it('应该处理IP解析错误', async () => {
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const ipError = new Error('IP解析失败');
      mockIpUtils.getIpInfo.mockRejectedValue(ipError);

      await requestLogger(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(mockLoggerService.http).toHaveBeenCalledWith(
        'HTTP Request',
        expect.objectContaining({
          ip: '192.168.1.100',
          ipInfo: null // 解析失败时应该为null
        })
      );
    });

    it('应该处理用户代理解析错误', async () => {
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const uaError = new Error('用户代理解析失败');
      mockUserAgentParser.parse.mockRejectedValue(uaError);

      await requestLogger(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(mockLoggerService.http).toHaveBeenCalledWith(
        'HTTP Request',
        expect.objectContaining({
          userAgent: expect.any(String),
          browser: null,
          os: null,
          device: null
        })
      );
    });
  });

  describe('性能优化', () => {
    it('应该使用异步日志记录', async () => {
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const startTime = Date.now();
      await requestLogger(req, res, next);
      const endTime = Date.now();

      // 异步日志记录不应该阻塞请求处理
      expect(endTime - startTime).toBeLessThan(50);
      expect(next).toHaveBeenCalled();
    });

    it('应该批量处理日志', async () => {
      const requests = Array.from({ length: 10 }, () => ({
        req: createMockRequest() as Request,
        res: createMockResponse() as Response,
        next: createMockNext()
      }));

      await Promise.all(
        requests.map(({ req, res, next }) => requestLogger(req, res, next))
      );

      // 所有请求都应该被处理
      requests.forEach(({ next }) => {
        expect(next).toHaveBeenCalled();
      });
    });

    it('应该限制日志大小', async () => {
      const req = createMockRequest({
        body: {
          largeData: 'x'.repeat(10000) // 10KB数据
        }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      mockConfigService.get.mockImplementation((key) => {
        if (key === 'logging.requests.includeBody') return true;
        if (key === 'logging.maxBodySize') return 1000; // 1KB限制
        return mockConfigService.get.mockReturnValue(key);
      });

      await requestLogger(req, res, next);

      expect(mockLoggerService.http).toHaveBeenCalledWith(
        'HTTP Request',
        expect.objectContaining({
          body: expect.objectContaining({
            largeData: expect.stringMatching(/\[TRUNCATED\]$/)
          })
        })
      );
    });
  });
});
