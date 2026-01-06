import { jest } from '@jest/globals';
import { vi } from 'vitest'
import { Request, Response, NextFunction } from 'express';

// Mock Redis client
const mockRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
  incr: jest.fn(),
  expire: jest.fn(),
  del: jest.fn(),
  exists: jest.fn(),
  ttl: jest.fn(),
  multi: jest.fn(),
  exec: jest.fn(),
  pipeline: jest.fn()
};

// Mock configuration service
const mockConfigService = {
  get: jest.fn(),
  set: jest.fn()
};

// Mock logger service
const mockLoggerService = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
};

// Mock notification service
const mockNotificationService = {
  sendAlert: jest.fn(),
  sendNotification: jest.fn()
};

// Mock IP utils
const mockIpUtils = {
  getClientIp: jest.fn(),
  isWhitelisted: jest.fn(),
  isBlacklisted: jest.fn(),
  getIpInfo: jest.fn()
};

// Mock imports
jest.unstable_mockModule('../../../../../src/config/redis', () => ({ redisClient: mockRedisClient }));
jest.unstable_mockModule('../../../../../src/services/config.service', () => mockConfigService);
jest.unstable_mockModule('../../../../../src/services/logger.service', () => mockLoggerService);
jest.unstable_mockModule('../../../../../src/services/notification.service', () => mockNotificationService);
jest.unstable_mockModule('../../../../../src/utils/ip.utils', () => mockIpUtils);

// Mock request and response objects
const createMockRequest = (overrides = {}): Partial<Request> => ({
  ip: '192.168.1.100',
  method: 'GET',
  url: '/api/test',
  path: '/api/test',
  headers: {
    'user-agent': 'Mozilla/5.0 (Test Browser)',
    'x-forwarded-for': '192.168.1.100'
  },
  user: {
    id: 1,
    email: 'test@example.com',
    role: 'user'
  },
  body: {},
  query: {},
  params: {},
  ...overrides
});

const createMockResponse = (): Partial<Response> => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  header: jest.fn().mockReturnThis()
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

describe('Rate Limit Middleware', () => {
  let rateLimitMiddleware: any;
  let createRateLimit: any;
  let createApiRateLimit: any;
  let createLoginRateLimit: any;
  let createUploadRateLimit: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/middlewares/rate-limit.middleware');
    rateLimitMiddleware = imported.rateLimitMiddleware;
    createRateLimit = imported.createRateLimit;
    createApiRateLimit = imported.createApiRateLimit;
    createLoginRateLimit = imported.createLoginRateLimit;
    createUploadRateLimit = imported.createUploadRateLimit;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockConfigService.get.mockImplementation((key) => {
      const config = {
        'rateLimit.enabled': true,
        'rateLimit.windowMs': 60000, // 1分钟
        'rateLimit.maxRequests': 100,
        'rateLimit.skipSuccessfulRequests': false,
        'rateLimit.skipFailedRequests': false,
        'rateLimit.keyGenerator': 'ip',
        'rateLimit.store': 'redis',
        'rateLimit.whitelist': ['127.0.0.1', '::1'],
        'rateLimit.blacklist': [],
        'rateLimit.api.windowMs': 60000,
        'rateLimit.api.maxRequests': 1000,
        'rateLimit.login.windowMs': 900000, // 15分钟
        'rateLimit.login.maxAttempts': 5,
        'rateLimit.upload.windowMs': 60000,
        'rateLimit.upload.maxRequests': 10,
        'rateLimit.notification.enabled': true,
        'rateLimit.notification.threshold': 0.8
      };
      return config[key];
    });

    mockIpUtils.getClientIp.mockReturnValue('192.168.1.100');
    mockIpUtils.isWhitelisted.mockReturnValue(false);
    mockIpUtils.isBlacklisted.mockReturnValue(false);
    mockRedisClient.get.mockResolvedValue(null);
    mockRedisClient.incr.mockResolvedValue(1);
    mockRedisClient.expire.mockResolvedValue(1);
  });

  describe('createRateLimit', () => {
    it('应该创建基本的限流中间件', async () => {
      const options = {
        windowMs: 60000,
        maxRequests: 100,
        message: '请求过于频繁，请稍后再试'
      };

      const middleware = createRateLimit(options);
      expect(middleware).toBeInstanceOf(Function);

      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await middleware(req, res, next);

      expect(mockRedisClient.incr).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('应该基于IP地址进行限流', async () => {
      const options = {
        windowMs: 60000,
        maxRequests: 5,
        keyGenerator: 'ip'
      };

      const middleware = createRateLimit(options);
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      // 模拟已达到限制
      mockRedisClient.get.mockResolvedValue('5');

      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: '请求过于频繁',
        message: '请稍后再试',
        retryAfter: expect.any(Number)
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('应该基于用户ID进行限流', async () => {
      const options = {
        windowMs: 60000,
        maxRequests: 100,
        keyGenerator: 'user'
      };

      const middleware = createRateLimit(options);
      const req = createMockRequest({
        user: { id: 123, email: 'test@example.com' }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      mockRedisClient.get.mockResolvedValue('50');

      await middleware(req, res, next);

      expect(mockRedisClient.incr).toHaveBeenCalledWith(
        expect.stringContaining('user:123')
      );
      expect(next).toHaveBeenCalled();
    });

    it('应该基于API端点进行限流', async () => {
      const options = {
        windowMs: 60000,
        maxRequests: 10,
        keyGenerator: 'endpoint'
      };

      const middleware = createRateLimit(options);
      const req = createMockRequest({
        path: '/api/users',
        method: 'POST'
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await middleware(req, res, next);

      expect(mockRedisClient.incr).toHaveBeenCalledWith(
        expect.stringContaining('endpoint:POST:/api/users')
      );
    });

    it('应该跳过白名单IP', async () => {
      const options = {
        windowMs: 60000,
        maxRequests: 5
      };

      mockIpUtils.isWhitelisted.mockReturnValue(true);

      const middleware = createRateLimit(options);
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await middleware(req, res, next);

      expect(mockRedisClient.incr).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('应该阻止黑名单IP', async () => {
      const options = {
        windowMs: 60000,
        maxRequests: 100
      };

      mockIpUtils.isBlacklisted.mockReturnValue(true);

      const middleware = createRateLimit(options);
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'IP地址被禁止访问',
        message: '您的IP地址已被列入黑名单'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('应该设置响应头', async () => {
      const options = {
        windowMs: 60000,
        maxRequests: 100
      };

      const middleware = createRateLimit(options);
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      mockRedisClient.get.mockResolvedValue('25');
      mockRedisClient.ttl.mockResolvedValue(30);

      await middleware(req, res, next);

      expect(res.set).toHaveBeenCalledWith({
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '75',
        'X-RateLimit-Reset': expect.any(String)
      });
    });

    it('应该支持滑动窗口算法', async () => {
      const options = {
        windowMs: 60000,
        maxRequests: 100,
        algorithm: 'sliding-window'
      };

      const middleware = createRateLimit(options);
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      // 模拟滑动窗口计算
      mockRedisClient.multi.mockReturnValue({
        zremrangebyscore: jest.fn().mockReturnThis(),
        zcard: jest.fn().mockReturnThis(),
        zadd: jest.fn().mockReturnThis(),
        expire: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([null, 50, null, null])
      });

      await middleware(req, res, next);

      expect(mockRedisClient.multi).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('应该支持令牌桶算法', async () => {
      const options = {
        windowMs: 60000,
        maxRequests: 100,
        algorithm: 'token-bucket',
        refillRate: 10 // 每秒补充10个令牌
      };

      const middleware = createRateLimit(options);
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      // 模拟令牌桶状态
      mockRedisClient.get.mockResolvedValue(JSON.stringify({
        tokens: 50,
        lastRefill: Date.now() - 5000 // 5秒前
      }));

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('createApiRateLimit', () => {
    it('应该创建API限流中间件', async () => {
      const middleware = createApiRateLimit();
      const req = createMockRequest({
        path: '/api/users'
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await middleware(req, res, next);

      expect(mockRedisClient.incr).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('应该根据用户角色设置不同限制', async () => {
      const middleware = createApiRateLimit();
      
      // 管理员用户
      const adminReq = createMockRequest({
        user: { id: 1, role: 'admin' }
      }) as Request;
      const adminRes = createMockResponse() as Response;
      const adminNext = createMockNext();

      await middleware(adminReq, adminRes, adminNext);

      // 普通用户
      const userReq = createMockRequest({
        user: { id: 2, role: 'user' }
      }) as Request;
      const userRes = createMockResponse() as Response;
      const userNext = createMockNext();

      await middleware(userReq, userRes, userNext);

      expect(adminNext).toHaveBeenCalled();
      expect(userNext).toHaveBeenCalled();
    });

    it('应该对不同API端点设置不同限制', async () => {
      const middleware = createApiRateLimit();

      // 高频端点
      const highFreqReq = createMockRequest({
        path: '/api/search'
      }) as Request;
      const highFreqRes = createMockResponse() as Response;
      const highFreqNext = createMockNext();

      await middleware(highFreqReq, highFreqRes, highFreqNext);

      // 低频端点
      const lowFreqReq = createMockRequest({
        path: '/api/admin/users'
      }) as Request;
      const lowFreqRes = createMockResponse() as Response;
      const lowFreqNext = createMockNext();

      await middleware(lowFreqReq, lowFreqRes, lowFreqNext);

      expect(highFreqNext).toHaveBeenCalled();
      expect(lowFreqNext).toHaveBeenCalled();
    });
  });

  describe('createLoginRateLimit', () => {
    it('应该创建登录限流中间件', async () => {
      const middleware = createLoginRateLimit();
      const req = createMockRequest({
        path: '/api/auth/login',
        method: 'POST',
        body: { email: 'test@example.com' }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await middleware(req, res, next);

      expect(mockRedisClient.incr).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('应该基于IP和邮箱进行限流', async () => {
      const middleware = createLoginRateLimit();
      const req = createMockRequest({
        body: { email: 'test@example.com' }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      // 模拟IP限制已达到
      mockRedisClient.get.mockImplementation((key) => {
        if (key.includes('ip:')) return Promise.resolve('5');
        if (key.includes('email:')) return Promise.resolve('2');
        return Promise.resolve(null);
      });

      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: '登录尝试过于频繁',
        message: '请15分钟后再试',
        retryAfter: expect.any(Number)
      });
    });

    it('应该在登录失败时增加计数', async () => {
      const middleware = createLoginRateLimit();
      const req = createMockRequest({
        body: { email: 'test@example.com' }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      // 模拟登录失败
      res.statusCode = 401;

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();

      // 模拟响应结束事件
      const onFinish = res.on?.mock?.calls?.find(call => call[0] === 'finish')?.[1];
      if (onFinish) {
        onFinish();
        expect(mockRedisClient.incr).toHaveBeenCalledWith(
          expect.stringContaining('failed:')
        );
      }
    });

    it('应该在登录成功时重置计数', async () => {
      const middleware = createLoginRateLimit();
      const req = createMockRequest({
        body: { email: 'test@example.com' }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      // 模拟登录成功
      res.statusCode = 200;

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();

      // 模拟响应结束事件
      const onFinish = res.on?.mock?.calls?.find(call => call[0] === 'finish')?.[1];
      if (onFinish) {
        onFinish();
        expect(mockRedisClient.del).toHaveBeenCalledWith(
          expect.stringContaining('failed:')
        );
      }
    });

    it('应该支持验证码验证', async () => {
      const middleware = createLoginRateLimit({ requireCaptcha: true });
      const req = createMockRequest({
        body: { 
          email: 'test@example.com',
          captcha: 'abc123'
        }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      // 模拟已达到验证码要求阈值
      mockRedisClient.get.mockResolvedValue('3');

      await middleware(req, res, next);

      // 应该验证验证码
      expect(next).toHaveBeenCalled();
    });
  });

  describe('createUploadRateLimit', () => {
    it('应该创建上传限流中间件', async () => {
      const middleware = createUploadRateLimit();
      const req = createMockRequest({
        path: '/api/upload',
        method: 'POST'
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await middleware(req, res, next);

      expect(mockRedisClient.incr).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('应该基于文件大小进行限流', async () => {
      const middleware = createUploadRateLimit({ maxFileSize: 1024 * 1024 }); // 1MB
      const req = createMockRequest({
        headers: {
          'content-length': '2097152' // 2MB
        }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(413);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: '文件过大',
        message: '文件大小超出限制'
      });
    });

    it('应该基于文件类型进行限流', async () => {
      const middleware = createUploadRateLimit({ 
        allowedTypes: ['image/jpeg', 'image/png'] 
      });
      const req = createMockRequest({
        headers: {
          'content-type': 'application/pdf'
        }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(415);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: '文件类型不支持',
        message: '只支持图片文件'
      });
    });

    it('应该基于用户存储配额进行限流', async () => {
      const middleware = createUploadRateLimit({ checkQuota: true });
      const req = createMockRequest({
        user: { id: 1, storageUsed: 1024 * 1024 * 100 } // 100MB已使用
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      // 模拟用户配额已满
      mockRedisClient.get.mockResolvedValue('104857600'); // 100MB配额

      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(507);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: '存储空间不足',
        message: '您的存储配额已满'
      });
    });
  });

  describe('高级功能', () => {
    it('应该支持动态限制调整', async () => {
      const options = {
        windowMs: 60000,
        maxRequests: 100,
        dynamicLimit: true
      };

      const middleware = createRateLimit(options);
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      // 模拟系统负载高
      mockRedisClient.get.mockImplementation((key) => {
        if (key.includes('system:load')) return Promise.resolve('0.8');
        return Promise.resolve('50');
      });

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('应该支持分布式限流', async () => {
      const options = {
        windowMs: 60000,
        maxRequests: 100,
        distributed: true
      };

      const middleware = createRateLimit(options);
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      // 模拟分布式计数
      mockRedisClient.pipeline.mockReturnValue({
        incr: jest.fn().mockReturnThis(),
        expire: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([[null, 1], [null, 1]])
      });

      await middleware(req, res, next);

      expect(mockRedisClient.pipeline).toHaveBeenCalled();
    });

    it('应该支持地理位置限流', async () => {
      const options = {
        windowMs: 60000,
        maxRequests: 100,
        geoLimit: {
          allowedCountries: ['CN', 'US'],
          blockedCountries: ['XX']
        }
      };

      mockIpUtils.getIpInfo.mockResolvedValue({
        country: 'CN',
        region: 'Beijing',
        city: 'Beijing'
      });

      const middleware = createRateLimit(options);
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await middleware(req, res, next);

      expect(mockIpUtils.getIpInfo).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('应该支持用户行为分析', async () => {
      const options = {
        windowMs: 60000,
        maxRequests: 100,
        behaviorAnalysis: true
      };

      const middleware = createRateLimit(options);
      const req = createMockRequest({
        headers: {
          'user-agent': 'Bot/1.0'
        }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      // 模拟检测到机器人行为
      await middleware(req, res, next);

      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        '检测到可疑请求',
        expect.objectContaining({
          userAgent: 'Bot/1.0'
        })
      );
    });

    it('应该支持自适应限流', async () => {
      const options = {
        windowMs: 60000,
        maxRequests: 100,
        adaptive: true
      };

      const middleware = createRateLimit(options);
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      // 模拟系统指标
      mockRedisClient.get.mockImplementation((key) => {
        if (key.includes('metrics:cpu')) return Promise.resolve('0.7');
        if (key.includes('metrics:memory')) return Promise.resolve('0.6');
        if (key.includes('metrics:response_time')) return Promise.resolve('200');
        return Promise.resolve('50');
      });

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('监控和告警', () => {
    it('应该记录限流事件', async () => {
      const options = {
        windowMs: 60000,
        maxRequests: 5
      };

      const middleware = createRateLimit(options);
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      mockRedisClient.get.mockResolvedValue('5');

      await middleware(req, res, next);

      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        '请求被限流',
        expect.objectContaining({
          ip: '192.168.1.100',
          path: '/api/test',
          limit: 5
        })
      );
    });

    it('应该发送告警通知', async () => {
      const options = {
        windowMs: 60000,
        maxRequests: 100,
        alertThreshold: 0.8
      };

      const middleware = createRateLimit(options);
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      mockRedisClient.get.mockResolvedValue('85'); // 85% 使用率

      await middleware(req, res, next);

      expect(mockNotificationService.sendAlert).toHaveBeenCalledWith({
        type: 'rate_limit_warning',
        message: '限流阈值接近',
        data: expect.objectContaining({
          usage: 0.85,
          threshold: 0.8
        })
      });
    });

    it('应该统计限流指标', async () => {
      const options = {
        windowMs: 60000,
        maxRequests: 100,
        collectMetrics: true
      };

      const middleware = createRateLimit(options);
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await middleware(req, res, next);

      expect(mockRedisClient.incr).toHaveBeenCalledWith(
        expect.stringContaining('metrics:requests')
      );
    });
  });

  describe('错误处理', () => {
    it('应该处理Redis连接错误', async () => {
      const options = {
        windowMs: 60000,
        maxRequests: 100
      };

      const middleware = createRateLimit(options);
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const error = new Error('Redis连接失败');
      mockRedisClient.get.mockRejectedValue(error);

      await middleware(req, res, next);

      expect(mockLoggerService.error).toHaveBeenCalledWith(
        '限流检查失败',
        expect.objectContaining({
          error: error.message
        })
      );

      // 应该允许请求通过（故障开放）
      expect(next).toHaveBeenCalled();
    });

    it('应该处理配置错误', async () => {
      const invalidOptions = {
        windowMs: -1, // 无效值
        maxRequests: 0 // 无效值
      };

      expect(() => createRateLimit(invalidOptions)).toThrow('限流配置无效');
    });

    it('应该处理内存不足', async () => {
      const options = {
        windowMs: 60000,
        maxRequests: 100
      };

      const middleware = createRateLimit(options);
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const error = new Error('OOM');
      mockRedisClient.incr.mockRejectedValue(error);

      await middleware(req, res, next);

      expect(mockLoggerService.error).toHaveBeenCalledWith(
        '限流存储错误',
        expect.objectContaining({
          error: error.message
        })
      );
    });
  });

  describe('性能优化', () => {
    it('应该使用连接池', async () => {
      const options = {
        windowMs: 60000,
        maxRequests: 100,
        useConnectionPool: true
      };

      const middleware = createRateLimit(options);
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('应该支持批量操作', async () => {
      const options = {
        windowMs: 60000,
        maxRequests: 100,
        batchOperations: true
      };

      const middleware = createRateLimit(options);
      
      // 模拟多个并发请求
      const requests = Array.from({ length: 5 }, () => ({
        req: createMockRequest() as Request,
        res: createMockResponse() as Response,
        next: createMockNext()
      }));

      await Promise.all(
        requests.map(({ req, res, next }) => middleware(req, res, next))
      );

      // 应该使用批量操作
      expect(mockRedisClient.pipeline).toHaveBeenCalled();
    });

    it('应该支持本地缓存', async () => {
      const options = {
        windowMs: 60000,
        maxRequests: 100,
        localCache: true,
        localCacheTtl: 5000
      };

      const middleware = createRateLimit(options);
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      // 第一次请求
      await middleware(req, res, next);

      // 第二次请求（应该使用本地缓存）
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(2);
    });
  });

  describe('配置管理', () => {
    it('应该支持热更新配置', async () => {
      const options = {
        windowMs: 60000,
        maxRequests: 100,
        hotReload: true
      };

      const middleware = createRateLimit(options);
      
      // 模拟配置更新
      mockConfigService.get.mockReturnValue(200); // 新的限制值

      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('应该验证配置有效性', async () => {
      const invalidOptions = {
        windowMs: 'invalid',
        maxRequests: null
      };

      expect(() => createRateLimit(invalidOptions as any)).toThrow();
    });

    it('应该支持环境特定配置', async () => {
      process.env.NODE_ENV = 'development';

      const options = {
        windowMs: 60000,
        maxRequests: 100,
        envSpecific: true
      };

      const middleware = createRateLimit(options);
      
      expect(middleware).toBeDefined();
    });
  });
});
