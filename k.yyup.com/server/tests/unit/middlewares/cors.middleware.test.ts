import { jest } from '@jest/globals';
import { vi } from 'vitest'
import { Request, Response, NextFunction } from 'express';

// Mock dependencies
const mockConfigService = {
  get: jest.fn(),
  set: jest.fn()
};

const mockLoggerService = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
};

// Mock imports
jest.unstable_mockModule('../../../../../src/services/config.service', () => mockConfigService);
jest.unstable_mockModule('../../../../../src/services/logger.service', () => mockLoggerService);

// Mock request and response objects
const createMockRequest = (overrides = {}): Partial<Request> => ({
  method: 'GET',
  url: '/api/test',
  path: '/api/test',
  headers: {
    'origin': 'https://example.com',
    'access-control-request-method': 'POST',
    'access-control-request-headers': 'content-type,authorization'
  },
  ...overrides
});

const createMockResponse = (): Partial<Response> => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
  setHeader: jest.fn().mockReturnThis(),
  header: jest.fn().mockReturnThis(),
  end: jest.fn().mockReturnThis()
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

describe('CORS Middleware', () => {
  let corsMiddleware: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/middlewares/cors.middleware');
    corsMiddleware = imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockConfigService.get.mockImplementation((key) => {
      const config = {
        'cors.enabled': true,
        'cors.origin': ['https://app.yyup.com', 'https://admin.yyup.com'],
        'cors.methods': ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        'cors.allowedHeaders': ['Content-Type', 'Authorization', 'X-Requested-With'],
        'cors.exposedHeaders': ['X-Total-Count', 'X-Page-Count'],
        'cors.credentials': true,
        'cors.maxAge': 86400,
        'cors.preflightContinue': false,
        'cors.optionsSuccessStatus': 204,
        'cors.dynamic.enabled': true,
        'cors.whitelist.enabled': true,
        'cors.logging.enabled': true
      };
      return config[key];
    });
  });

  describe('基本CORS功能', () => {
    it('应该为允许的源设置CORS头', async () => {
      const req = createMockRequest({
        headers: { origin: 'https://app.yyup.com' }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const middleware = corsMiddleware.corsHandler();
      await middleware(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', 'https://app.yyup.com');
      expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Credentials', 'true');
      expect(res.setHeader).toHaveBeenCalledWith(
        'Access-Control-Allow-Methods',
        'GET,POST,PUT,DELETE,OPTIONS'
      );
      expect(res.setHeader).toHaveBeenCalledWith(
        'Access-Control-Allow-Headers',
        'Content-Type,Authorization,X-Requested-With'
      );
      expect(next).toHaveBeenCalled();
    });

    it('应该拒绝不在白名单的源', async () => {
      const req = createMockRequest({
        headers: { origin: 'https://malicious.com' }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const middleware = corsMiddleware.corsHandler();
      await middleware(req, res, next);

      expect(res.setHeader).not.toHaveBeenCalledWith(
        'Access-Control-Allow-Origin',
        'https://malicious.com'
      );
      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        'CORS请求被拒绝',
        expect.objectContaining({
          origin: 'https://malicious.com',
          path: '/api/test'
        })
      );
    });

    it('应该处理预检请求', async () => {
      const req = createMockRequest({
        method: 'OPTIONS',
        headers: {
          origin: 'https://app.yyup.com',
          'access-control-request-method': 'POST',
          'access-control-request-headers': 'content-type,authorization'
        }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const middleware = corsMiddleware.corsHandler();
      await middleware(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', 'https://app.yyup.com');
      expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'POST');
      expect(res.setHeader).toHaveBeenCalledWith(
        'Access-Control-Allow-Headers',
        'content-type,authorization'
      );
      expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Max-Age', '86400');
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.end).toHaveBeenCalled();
    });

    it('应该设置暴露的响应头', async () => {
      const req = createMockRequest({
        headers: { origin: 'https://app.yyup.com' }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const middleware = corsMiddleware.corsHandler();
      await middleware(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith(
        'Access-Control-Expose-Headers',
        'X-Total-Count,X-Page-Count'
      );
    });

    it('应该处理没有Origin头的请求', async () => {
      const req = createMockRequest({
        headers: {} // 没有origin头
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const middleware = corsMiddleware.corsHandler();
      await middleware(req, res, next);

      expect(res.setHeader).not.toHaveBeenCalledWith(
        'Access-Control-Allow-Origin',
        expect.any(String)
      );
      expect(next).toHaveBeenCalled();
    });
  });

  describe('动态CORS配置', () => {
    it('应该支持动态源验证', async () => {
      const req = createMockRequest({
        headers: { origin: 'https://tenant1.yyup.com' }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      // Mock动态源验证函数
      const dynamicOriginValidator = jest.fn().mockResolvedValue(undefined);
      const middleware = corsMiddleware.corsHandler({
        dynamicOrigin: dynamicOriginValidator
      });

      await middleware(req, res, next);

      expect(dynamicOriginValidator).toHaveBeenCalledWith('https://tenant1.yyup.com', req);
      expect(res.setHeader).toHaveBeenCalledWith(
        'Access-Control-Allow-Origin',
        'https://tenant1.yyup.com'
      );
    });

    it('应该支持基于请求的动态配置', async () => {
      const req = createMockRequest({
        headers: { 
          origin: 'https://app.yyup.com',
          'x-tenant-id': 'tenant1'
        }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const dynamicConfigProvider = jest.fn().mockResolvedValue({
        allowedMethods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'X-Tenant-ID']
      });

      const middleware = corsMiddleware.corsHandler({
        dynamicConfig: dynamicConfigProvider
      });

      await middleware(req, res, next);

      expect(dynamicConfigProvider).toHaveBeenCalledWith(req);
      expect(res.setHeader).toHaveBeenCalledWith(
        'Access-Control-Allow-Methods',
        'GET,POST'
      );
      expect(res.setHeader).toHaveBeenCalledWith(
        'Access-Control-Allow-Headers',
        'Content-Type,X-Tenant-ID'
      );
    });

    it('应该支持子域名通配符', async () => {
      mockConfigService.get.mockImplementation((key) => {
        if (key === 'cors.origin') return ['https://*.yyup.com'];
        return null;
      });

      const req = createMockRequest({
        headers: { origin: 'https://subdomain.yyup.com' }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const middleware = corsMiddleware.corsHandler();
      await middleware(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith(
        'Access-Control-Allow-Origin',
        'https://subdomain.yyup.com'
      );
    });
  });

  describe('安全特性', () => {
    it('应该验证请求方法', async () => {
      const req = createMockRequest({
        method: 'OPTIONS',
        headers: {
          origin: 'https://app.yyup.com',
          'access-control-request-method': 'PATCH' // 不在允许列表中
        }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const middleware = corsMiddleware.corsHandler();
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith({
        error: '方法不被允许',
        message: 'PATCH方法不被CORS策略允许'
      });
    });

    it('应该验证请求头', async () => {
      const req = createMockRequest({
        method: 'OPTIONS',
        headers: {
          origin: 'https://app.yyup.com',
          'access-control-request-method': 'POST',
          'access-control-request-headers': 'content-type,x-custom-header' // x-custom-header不在允许列表中
        }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const middleware = corsMiddleware.corsHandler();
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: '请求头不被允许',
        message: '请求头x-custom-header不被CORS策略允许'
      });
    });

    it('应该防止CORS攻击', async () => {
      const req = createMockRequest({
        headers: {
          origin: 'https://app.yyup.com',
          'access-control-request-headers': 'content-type,<script>alert("xss")</script>'
        }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const middleware = corsMiddleware.corsHandler();
      await middleware(req, res, next);

      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        '可疑的CORS请求',
        expect.objectContaining({
          origin: 'https://app.yyup.com',
          suspiciousHeaders: expect.any(String)
        })
      );
    });

    it('应该限制预检请求频率', async () => {
      const req = createMockRequest({
        method: 'OPTIONS',
        headers: {
          origin: 'https://app.yyup.com',
          'x-forwarded-for': '192.168.1.100'
        }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      // Mock频率限制检查
      const rateLimitChecker = jest.fn().mockResolvedValue(undefined); // 超出限制
      const middleware = corsMiddleware.corsHandler({
        preflightRateLimit: rateLimitChecker
      });

      await middleware(req, res, next);

      expect(rateLimitChecker).toHaveBeenCalledWith('192.168.1.100');
      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({
        error: '请求过于频繁',
        message: '预检请求频率超出限制'
      });
    });
  });

  describe('缓存和性能', () => {
    it('应该缓存预检响应', async () => {
      const req = createMockRequest({
        method: 'OPTIONS',
        headers: {
          origin: 'https://app.yyup.com',
          'access-control-request-method': 'POST'
        }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const middleware = corsMiddleware.corsHandler();
      await middleware(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Max-Age', '86400');
      expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'public, max-age=86400');
    });

    it('应该优化重复的CORS检查', async () => {
      const req = createMockRequest({
        headers: { origin: 'https://app.yyup.com' }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      // Mock缓存的CORS结果
      const corsCache = new Map();
      corsCache.set('https://app.yyup.com', {
        allowed: true,
        headers: {
          'Access-Control-Allow-Origin': 'https://app.yyup.com',
          'Access-Control-Allow-Credentials': 'true'
        }
      });

      const middleware = corsMiddleware.corsHandler({
        cache: corsCache
      });

      await middleware(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith(
        'Access-Control-Allow-Origin',
        'https://app.yyup.com'
      );
    });

    it('应该支持Vary头优化', async () => {
      const req = createMockRequest({
        headers: { origin: 'https://app.yyup.com' }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const middleware = corsMiddleware.corsHandler();
      await middleware(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('Vary', 'Origin');
    });
  });

  describe('日志和监控', () => {
    it('应该记录CORS请求', async () => {
      const req = createMockRequest({
        headers: { origin: 'https://app.yyup.com' }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const middleware = corsMiddleware.corsHandler();
      await middleware(req, res, next);

      expect(mockLoggerService.debug).toHaveBeenCalledWith(
        'CORS请求处理',
        expect.objectContaining({
          origin: 'https://app.yyup.com',
          method: 'GET',
          path: '/api/test',
          allowed: true
        })
      );
    });

    it('应该记录被拒绝的CORS请求', async () => {
      const req = createMockRequest({
        headers: { origin: 'https://malicious.com' }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const middleware = corsMiddleware.corsHandler();
      await middleware(req, res, next);

      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        'CORS请求被拒绝',
        expect.objectContaining({
          origin: 'https://malicious.com',
          reason: 'origin_not_allowed'
        })
      );
    });

    it('应该统计CORS使用情况', async () => {
      const req = createMockRequest({
        headers: { origin: 'https://app.yyup.com' }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const statsCollector = jest.fn();
      const middleware = corsMiddleware.corsHandler({
        statsCollector: statsCollector
      });

      await middleware(req, res, next);

      expect(statsCollector).toHaveBeenCalledWith({
        origin: 'https://app.yyup.com',
        method: 'GET',
        allowed: true,
        timestamp: expect.any(Number)
      });
    });
  });

  describe('配置管理', () => {
    it('应该支持禁用CORS', async () => {
      mockConfigService.get.mockImplementation((key) => {
        if (key === 'cors.enabled') return false;
        return null;
      });

      const req = createMockRequest({
        headers: { origin: 'https://app.yyup.com' }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const middleware = corsMiddleware.corsHandler();
      await middleware(req, res, next);

      expect(res.setHeader).not.toHaveBeenCalledWith(
        'Access-Control-Allow-Origin',
        expect.any(String)
      );
      expect(next).toHaveBeenCalled();
    });

    it('应该支持开发模式配置', async () => {
      mockConfigService.get.mockImplementation((key) => {
        if (key === 'app.env') return 'development';
        if (key === 'cors.origin') return '*'; // 开发模式允许所有源
        return null;
      });

      const req = createMockRequest({
        headers: { origin: 'http://localhost:3000' }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const middleware = corsMiddleware.corsHandler();
      await middleware(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
    });

    it('应该支持环境特定配置', async () => {
      mockConfigService.get.mockImplementation((key) => {
        const envConfig = {
          'cors.origin.production': ['https://app.yyup.com'],
          'cors.origin.staging': ['https://staging.yyup.com'],
          'cors.origin.development': ['http://localhost:3000'],
          'app.env': 'staging'
        };
        return envConfig[key];
      });

      const req = createMockRequest({
        headers: { origin: 'https://staging.yyup.com' }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const middleware = corsMiddleware.corsHandler();
      await middleware(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith(
        'Access-Control-Allow-Origin',
        'https://staging.yyup.com'
      );
    });
  });

  describe('错误处理', () => {
    it('应该处理配置加载错误', async () => {
      mockConfigService.get.mockImplementation(() => {
        throw new Error('配置服务不可用');
      });

      const req = createMockRequest({
        headers: { origin: 'https://app.yyup.com' }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const middleware = corsMiddleware.corsHandler();
      await middleware(req, res, next);

      expect(mockLoggerService.error).toHaveBeenCalledWith(
        'CORS配置加载失败',
        expect.objectContaining({
          error: '配置服务不可用'
        })
      );

      // 应该使用默认的安全配置
      expect(res.setHeader).not.toHaveBeenCalledWith(
        'Access-Control-Allow-Origin',
        expect.any(String)
      );
    });

    it('应该处理动态验证器错误', async () => {
      const req = createMockRequest({
        headers: { origin: 'https://app.yyup.com' }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const dynamicOriginValidator = jest.fn().mockRejectedValue(
        new Error('验证器服务错误')
      );

      const middleware = corsMiddleware.corsHandler({
        dynamicOrigin: dynamicOriginValidator
      });

      await middleware(req, res, next);

      expect(mockLoggerService.error).toHaveBeenCalledWith(
        'CORS动态验证失败',
        expect.objectContaining({
          origin: 'https://app.yyup.com',
          error: '验证器服务错误'
        })
      );

      // 验证失败时应该拒绝请求
      expect(res.setHeader).not.toHaveBeenCalledWith(
        'Access-Control-Allow-Origin',
        'https://app.yyup.com'
      );
    });
  });
});
