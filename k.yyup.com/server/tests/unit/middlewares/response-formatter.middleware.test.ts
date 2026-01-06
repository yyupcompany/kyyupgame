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
  locals: {},
  statusCode: 200,
  set: jest.fn(),
  header: jest.fn()
} as unknown as Response;

const mockNext = jest.fn() as NextFunction;

// Mock logger
const mockLogger = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// Mock imports
jest.unstable_mockModule('../../../../../src/utils/logger', () => ({
  default: mockLogger
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

describe('Response Formatter Middleware', () => {
  let responseFormatter: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/middlewares/response-formatter.middleware');
    responseFormatter = imported.default || imported.responseFormatter || imported;
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
  });

  describe('基础功能', () => {
    it('应该是一个函数', () => {
      expect(typeof responseFormatter).toBe('function');
    });

    it('应该返回中间件函数', () => {
      const middleware = responseFormatter();
      expect(typeof middleware).toBe('function');
      expect(middleware.length).toBe(3); // req, res, next
    });

    it('应该添加格式化方法到响应对象', async () => {
      const middleware = responseFormatter();
      
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse).toHaveProperty('success');
      expect(mockResponse).toHaveProperty('error');
      expect(mockResponse).toHaveProperty('paginated');
      expect(typeof (mockResponse as any).success).toBe('function');
      expect(typeof (mockResponse as any).error).toBe('function');
      expect(typeof (mockResponse as any).paginated).toBe('function');
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('成功响应格式化', () => {
    it('应该格式化成功响应', async () => {
      const middleware = responseFormatter();
      
      await middleware(mockRequest, mockResponse, mockNext);

      const data = { id: 1, name: 'John Doe' };
      const message = 'User retrieved successfully';

      (mockResponse as any).success(data, message);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: message,
        data: data,
        timestamp: expect.any(String)
      });
    });

    it('应该处理无数据的成功响应', async () => {
      const middleware = responseFormatter();
      
      await middleware(mockRequest, mockResponse, mockNext);

      const message = 'Operation completed successfully';

      (mockResponse as any).success(null, message);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: message,
        data: null,
        timestamp: expect.any(String)
      });
    });

    it('应该处理默认成功消息', async () => {
      const middleware = responseFormatter();
      
      await middleware(mockRequest, mockResponse, mockNext);

      const data = { id: 1, name: 'John Doe' };

      (mockResponse as any).success(data);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        data: data,
        timestamp: expect.any(String)
      });
    });

    it('应该设置自定义状态码', async () => {
      const middleware = responseFormatter();
      
      await middleware(mockRequest, mockResponse, mockNext);

      const data = { id: 1, name: 'John Doe' };
      const message = 'User created successfully';

      (mockResponse as any).success(data, message, 201);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: message,
        data: data,
        timestamp: expect.any(String)
      });
    });

    it('应该包含请求ID', async () => {
      const middleware = responseFormatter({
        includeRequestId: true
      });
      
      mockResponse.locals.requestId = 'req-123-456';
      
      await middleware(mockRequest, mockResponse, mockNext);

      const data = { id: 1, name: 'John Doe' };

      (mockResponse as any).success(data);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        data: data,
        requestId: 'req-123-456',
        timestamp: expect.any(String)
      });
    });
  });

  describe('错误响应格式化', () => {
    it('应该格式化错误响应', async () => {
      const middleware = responseFormatter();
      
      await middleware(mockRequest, mockResponse, mockNext);

      const message = 'User not found';
      const statusCode = 404;

      (mockResponse as any).error(message, statusCode);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: message,
        error: {
          code: 404,
          message: message
        },
        timestamp: expect.any(String)
      });
    });

    it('应该处理Error对象', async () => {
      const middleware = responseFormatter();
      
      await middleware(mockRequest, mockResponse, mockNext);

      const error = new Error('Database connection failed');
      error.name = 'DatabaseError';

      (mockResponse as any).error(error, 500);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database connection failed',
        error: {
          code: 500,
          message: 'Database connection failed',
          type: 'DatabaseError'
        },
        timestamp: expect.any(String)
      });
    });

    it('应该处理验证错误', async () => {
      const middleware = responseFormatter();
      
      await middleware(mockRequest, mockResponse, mockNext);

      const validationErrors = [
        { field: 'name', message: 'Name is required' },
        { field: 'email', message: 'Email format is invalid' }
      ];

      (mockResponse as any).error('Validation failed', 400, validationErrors);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        error: {
          code: 400,
          message: 'Validation failed',
          details: validationErrors
        },
        timestamp: expect.any(String)
      });
    });

    it('应该处理默认错误状态码', async () => {
      const middleware = responseFormatter();
      
      await middleware(mockRequest, mockResponse, mockNext);

      const message = 'Something went wrong';

      (mockResponse as any).error(message);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: message,
        error: {
          code: 500,
          message: message
        },
        timestamp: expect.any(String)
      });
    });

    it('应该在生产环境中隐藏错误堆栈', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const middleware = responseFormatter();
      
      await middleware(mockRequest, mockResponse, mockNext);

      const error = new Error('Internal server error');
      error.stack = 'Error stack trace...';

      (mockResponse as any).error(error, 500);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
        error: {
          code: 500,
          message: 'Internal server error',
          type: 'Error'
          // stack 不应该包含在生产环境中
        },
        timestamp: expect.any(String)
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('应该在开发环境中包含错误堆栈', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const middleware = responseFormatter();
      
      await middleware(mockRequest, mockResponse, mockNext);

      const error = new Error('Development error');
      error.stack = 'Error: Development error\n    at test.js:1:1';

      (mockResponse as any).error(error, 500);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Development error',
        error: {
          code: 500,
          message: 'Development error',
          type: 'Error',
          stack: 'Error: Development error\n    at test.js:1:1'
        },
        timestamp: expect.any(String)
      });

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('分页响应格式化', () => {
    it('应该格式化分页响应', async () => {
      const middleware = responseFormatter();
      
      await middleware(mockRequest, mockResponse, mockNext);

      const data = [
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' }
      ];
      const pagination = {
        page: 1,
        pageSize: 20,
        total: 50,
        totalPages: 3
      };

      (mockResponse as any).paginated(data, pagination);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Data retrieved successfully',
        data: data,
        pagination: pagination,
        timestamp: expect.any(String)
      });
    });

    it('应该处理自定义分页消息', async () => {
      const middleware = responseFormatter();
      
      await middleware(mockRequest, mockResponse, mockNext);

      const data = [{ id: 1, name: 'User 1' }];
      const pagination = {
        page: 1,
        pageSize: 10,
        total: 1,
        totalPages: 1
      };
      const message = 'Users found';

      (mockResponse as any).paginated(data, pagination, message);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: message,
        data: data,
        pagination: pagination,
        timestamp: expect.any(String)
      });
    });

    it('应该处理空分页结果', async () => {
      const middleware = responseFormatter();
      
      await middleware(mockRequest, mockResponse, mockNext);

      const data: any[] = [];
      const pagination = {
        page: 1,
        pageSize: 20,
        total: 0,
        totalPages: 0
      };

      (mockResponse as any).paginated(data, pagination);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Data retrieved successfully',
        data: data,
        pagination: pagination,
        timestamp: expect.any(String)
      });
    });

    it('应该包含分页元数据', async () => {
      const middleware = responseFormatter({
        includePaginationMeta: true
      });
      
      await middleware(mockRequest, mockResponse, mockNext);

      const data = [{ id: 1, name: 'User 1' }];
      const pagination = {
        page: 2,
        pageSize: 10,
        total: 25,
        totalPages: 3
      };

      (mockResponse as any).paginated(data, pagination);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Data retrieved successfully',
        data: data,
        pagination: {
          ...pagination,
          hasNext: true,
          hasPrev: true,
          nextPage: 3,
          prevPage: 1
        },
        timestamp: expect.any(String)
      });
    });
  });

  describe('响应头设置', () => {
    it('应该设置默认响应头', async () => {
      const middleware = responseFormatter({
        defaultHeaders: {
          'X-API-Version': '1.0',
          'X-Response-Time': '150ms'
        }
      });
      
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.set).toHaveBeenCalledWith('X-API-Version', '1.0');
      expect(mockResponse.set).toHaveBeenCalledWith('X-Response-Time', '150ms');
    });

    it('应该设置CORS头', async () => {
      const middleware = responseFormatter({
        enableCORS: true
      });
      
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.set).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
      expect(mockResponse.set).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      expect(mockResponse.set).toHaveBeenCalledWith('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    });

    it('应该设置安全头', async () => {
      const middleware = responseFormatter({
        securityHeaders: true
      });
      
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.set).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
      expect(mockResponse.set).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
      expect(mockResponse.set).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
    });

    it('应该设置缓存头', async () => {
      const middleware = responseFormatter({
        cacheControl: 'public, max-age=3600'
      });
      
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.set).toHaveBeenCalledWith('Cache-Control', 'public, max-age=3600');
    });
  });

  describe('响应转换', () => {
    it('应该转换响应数据', async () => {
      const transformer = jest.fn((data) => ({
        ...data,
        transformed: true,
        timestamp: new Date().toISOString()
      }));

      const middleware = responseFormatter({
        dataTransformer: transformer
      });
      
      await middleware(mockRequest, mockResponse, mockNext);

      const originalData = { id: 1, name: 'John Doe' };

      (mockResponse as any).success(originalData);

      expect(transformer).toHaveBeenCalledWith(originalData);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        data: {
          id: 1,
          name: 'John Doe',
          transformed: true,
          timestamp: expect.any(String)
        },
        timestamp: expect.any(String)
      });
    });

    it('应该过滤敏感字段', async () => {
      const middleware = responseFormatter({
        sensitiveFields: ['password', 'ssn', 'creditCard']
      });
      
      await middleware(mockRequest, mockResponse, mockNext);

      const data = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'secret123',
        ssn: '123-45-6789'
      };

      (mockResponse as any).success(data);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        data: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com'
          // password 和 ssn 应该被过滤掉
        },
        timestamp: expect.any(String)
      });
    });

    it('应该处理嵌套对象的敏感字段', async () => {
      const middleware = responseFormatter({
        sensitiveFields: ['password', 'token']
      });
      
      await middleware(mockRequest, mockResponse, mockNext);

      const data = {
        user: {
          id: 1,
          name: 'John',
          password: 'secret'
        },
        auth: {
          token: 'jwt-token',
          expiresAt: '2024-12-31'
        }
      };

      (mockResponse as any).success(data);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        data: {
          user: {
            id: 1,
            name: 'John'
            // password 被过滤
          },
          auth: {
            expiresAt: '2024-12-31'
            // token 被过滤
          }
        },
        timestamp: expect.any(String)
      });
    });
  });

  describe('国际化支持', () => {
    it('应该支持多语言消息', async () => {
      const middleware = responseFormatter({
        i18n: true,
        defaultLanguage: 'en'
      });
      
      mockRequest.headers['accept-language'] = 'zh-CN';
      
      await middleware(mockRequest, mockResponse, mockNext);

      const data = { id: 1, name: 'John Doe' };

      (mockResponse as any).success(data, 'user.retrieved');

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: expect.any(String), // 应该是翻译后的消息
        data: data,
        timestamp: expect.any(String)
      });
    });

    it('应该处理语言回退', async () => {
      const middleware = responseFormatter({
        i18n: true,
        defaultLanguage: 'en'
      });
      
      mockRequest.headers['accept-language'] = 'fr-FR'; // 不支持的语言
      
      await middleware(mockRequest, mockResponse, mockNext);

      const data = { id: 1, name: 'John Doe' };

      (mockResponse as any).success(data, 'user.retrieved');

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: expect.any(String), // 应该回退到英语
        data: data,
        timestamp: expect.any(String)
      });
    });
  });

  describe('性能优化', () => {
    it('应该压缩大型响应', async () => {
      const middleware = responseFormatter({
        compression: true,
        compressionThreshold: 1024
      });
      
      await middleware(mockRequest, mockResponse, mockNext);

      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `User ${i}`,
        description: 'A'.repeat(100)
      }));

      (mockResponse as any).success(largeData);

      expect(mockResponse.set).toHaveBeenCalledWith('Content-Encoding', 'gzip');
    });

    it('应该缓存格式化结果', async () => {
      const middleware = responseFormatter({
        cacheFormatting: true
      });
      
      await middleware(mockRequest, mockResponse, mockNext);

      const data = { id: 1, name: 'John Doe' };

      // 第一次调用
      (mockResponse as any).success(data);
      // 第二次调用相同数据
      (mockResponse as any).success(data);

      expect(mockResponse.json).toHaveBeenCalledTimes(2);
      // 缓存逻辑应该减少处理时间
    });
  });

  describe('错误处理', () => {
    it('应该处理格式化错误', async () => {
      const faultyTransformer = jest.fn(() => {
        throw new Error('Transformation failed');
      });

      const middleware = responseFormatter({
        dataTransformer: faultyTransformer
      });
      
      await middleware(mockRequest, mockResponse, mockNext);

      const data = { id: 1, name: 'John Doe' };

      (mockResponse as any).success(data);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Response formatting error'),
        expect.objectContaining({
          error: 'Transformation failed'
        })
      );

      // 应该回退到原始数据
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        data: data,
        timestamp: expect.any(String)
      });
    });

    it('应该处理循环引用', async () => {
      const middleware = responseFormatter();
      
      await middleware(mockRequest, mockResponse, mockNext);

      const circularData: any = { id: 1, name: 'John' };
      circularData.self = circularData; // 创建循环引用

      (mockResponse as any).success(circularData);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Circular reference detected')
      );

      // 应该处理循环引用
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        data: {
          id: 1,
          name: 'John'
          // self 应该被移除或处理
        },
        timestamp: expect.any(String)
      });
    });
  });

  describe('集成测试', () => {
    it('应该与其他中间件协同工作', async () => {
      const middleware = responseFormatter({
        includeRequestId: true,
        defaultHeaders: { 'X-API-Version': '1.0' },
        sensitiveFields: ['password']
      });
      
      mockResponse.locals.requestId = 'req-123';
      
      await middleware(mockRequest, mockResponse, mockNext);

      const data = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'secret'
      };

      (mockResponse as any).success(data, 'User created', 201);

      expect(mockResponse.set).toHaveBeenCalledWith('X-API-Version', '1.0');
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'User created',
        data: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com'
          // password 被过滤
        },
        requestId: 'req-123',
        timestamp: expect.any(String)
      });
    });

    it('应该处理完整的API响应流程', async () => {
      const middleware = responseFormatter({
        includeRequestId: true,
        includePaginationMeta: true,
        securityHeaders: true,
        compression: true
      });
      
      mockResponse.locals.requestId = 'req-456';
      
      await middleware(mockRequest, mockResponse, mockNext);

      // 测试分页响应
      const data = [
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' }
      ];
      const pagination = {
        page: 1,
        pageSize: 10,
        total: 2,
        totalPages: 1
      };

      (mockResponse as any).paginated(data, pagination, 'Users retrieved');

      expect(mockResponse.set).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Users retrieved',
        data: data,
        pagination: {
          ...pagination,
          hasNext: false,
          hasPrev: false,
          nextPage: null,
          prevPage: null
        },
        requestId: 'req-456',
        timestamp: expect.any(String)
      });
    });
  });
});
