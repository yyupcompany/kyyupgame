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
  url: '/test',
  path: '/test'
} as Request;

const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
  end: jest.fn().mockReturnThis(),
  locals: {}
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

describe('Async Handler Middleware', () => {
  let asyncHandler: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/middlewares/async-handler');
    asyncHandler = imported.default || imported.asyncHandler || imported;
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

  describe('asyncHandler function', () => {
    it('应该是一个函数', () => {
      expect(typeof asyncHandler).toBe('function');
    });

    it('应该返回一个中间件函数', () => {
      const middleware = asyncHandler(async (req: Request, res: Response) => {
        res.json({ success: true });
      });

      expect(typeof middleware).toBe('function');
      expect(middleware.length).toBe(3); // req, res, next
    });

    it('应该处理成功的异步函数', async () => {
      const asyncFunction = jest.fn().mockResolvedValue(undefined);
      const middleware = asyncHandler(asyncFunction);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(asyncFunction).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('应该捕获异步函数中的错误', async () => {
      const error = new Error('异步操作失败');
      const asyncFunction = jest.fn().mockRejectedValue(error);
      const middleware = asyncHandler(asyncFunction);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(asyncFunction).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('应该处理同步函数抛出的错误', async () => {
      const error = new Error('同步操作失败');
      const syncFunction = jest.fn().mockImplementation(() => {
        throw error;
      });
      const middleware = asyncHandler(syncFunction);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(syncFunction).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('应该处理返回Promise的函数', async () => {
      const promiseFunction = jest.fn().mockImplementation(() => {
        return Promise.resolve({ data: 'test' });
      });
      const middleware = asyncHandler(promiseFunction);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(promiseFunction).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('应该处理返回rejected Promise的函数', async () => {
      const error = new Error('Promise rejected');
      const promiseFunction = jest.fn().mockImplementation(() => {
        return Promise.reject(error);
      });
      const middleware = asyncHandler(promiseFunction);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(promiseFunction).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('错误处理', () => {
    it('应该处理网络错误', async () => {
      const networkError = new Error('网络连接失败');
      networkError.name = 'NetworkError';
      const asyncFunction = jest.fn().mockRejectedValue(networkError);
      const middleware = asyncHandler(asyncFunction);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(networkError);
    });

    it('应该处理数据库错误', async () => {
      const dbError = new Error('数据库连接失败');
      dbError.name = 'SequelizeConnectionError';
      const asyncFunction = jest.fn().mockRejectedValue(dbError);
      const middleware = asyncHandler(asyncFunction);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(dbError);
    });

    it('应该处理验证错误', async () => {
      const validationError = new Error('数据验证失败');
      validationError.name = 'ValidationError';
      const asyncFunction = jest.fn().mockRejectedValue(validationError);
      const middleware = asyncHandler(asyncFunction);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(validationError);
    });

    it('应该处理权限错误', async () => {
      const authError = new Error('权限不足');
      authError.name = 'UnauthorizedError';
      const asyncFunction = jest.fn().mockRejectedValue(authError);
      const middleware = asyncHandler(asyncFunction);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(authError);
    });

    it('应该处理未知错误', async () => {
      const unknownError = new Error('未知错误');
      const asyncFunction = jest.fn().mockRejectedValue(unknownError);
      const middleware = asyncHandler(asyncFunction);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(unknownError);
    });
  });

  describe('性能测试', () => {
    it('应该快速处理简单的异步函数', async () => {
      const startTime = Date.now();
      const simpleAsyncFunction = jest.fn().mockResolvedValue(undefined);
      const middleware = asyncHandler(simpleAsyncFunction);

      await middleware(mockRequest, mockResponse, mockNext);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(10); // 应该在10ms内完成
      expect(simpleAsyncFunction).toHaveBeenCalled();
    });

    it('应该处理长时间运行的异步函数', async () => {
      const longRunningFunction = jest.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return 'completed';
      });
      const middleware = asyncHandler(longRunningFunction);

      const startTime = Date.now();
      await middleware(mockRequest, mockResponse, mockNext);
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThanOrEqual(100);
      expect(longRunningFunction).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('应该处理并发请求', async () => {
      const concurrentFunction = jest.fn().mockResolvedValue(undefined);
      const middleware = asyncHandler(concurrentFunction);

      const promises = Array.from({ length: 10 }, (_, i) => {
        const req = { ...mockRequest, id: i };
        return middleware(req, mockResponse, mockNext);
      });

      await Promise.all(promises);

      expect(concurrentFunction).toHaveBeenCalledTimes(10);
    });
  });

  describe('内存管理', () => {
    it('应该正确清理资源', async () => {
      const resourceCleanupFunction = jest.fn().mockImplementation(async (req, res, next) => {
        const resource = { data: 'test' };
        res.locals.resource = resource;
        // 模拟资源清理
        delete res.locals.resource;
      });
      const middleware = asyncHandler(resourceCleanupFunction);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(resourceCleanupFunction).toHaveBeenCalled();
      expect(mockResponse.locals.resource).toBeUndefined();
    });

    it('应该处理内存泄漏情况', async () => {
      const memoryLeakFunction = jest.fn().mockImplementation(async () => {
        // 模拟可能的内存泄漏
        const largeArray = new Array(1000000).fill('data');
        return largeArray.length;
      });
      const middleware = asyncHandler(memoryLeakFunction);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(memoryLeakFunction).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('边界情况', () => {
    it('应该处理null函数', () => {
      expect(() => {
        asyncHandler(null as any);
      }).toThrow();
    });

    it('应该处理undefined函数', () => {
      expect(() => {
        asyncHandler(undefined as any);
      }).toThrow();
    });

    it('应该处理非函数参数', () => {
      expect(() => {
        asyncHandler('not a function' as any);
      }).toThrow();
    });

    it('应该处理空的异步函数', async () => {
      const emptyFunction = jest.fn().mockResolvedValue(undefined);
      const middleware = asyncHandler(emptyFunction);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(emptyFunction).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('应该处理返回null的异步函数', async () => {
      const nullFunction = jest.fn().mockResolvedValue(null);
      const middleware = asyncHandler(nullFunction);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(nullFunction).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('集成测试', () => {
    it('应该与Express路由集成', async () => {
      const routeHandler = jest.fn().mockImplementation(async (req, res) => {
        res.json({ message: 'success', data: req.params });
      });
      const middleware = asyncHandler(routeHandler);

      mockRequest.params = { id: '123' };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(routeHandler).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('应该与其他中间件链式调用', async () => {
      const firstMiddleware = jest.fn().mockImplementation(async (req, res, next) => {
        req.body.processed = true;
        next();
      });
      const secondMiddleware = jest.fn().mockImplementation(async (req, res) => {
        res.json({ processed: req.body.processed });
      });

      const wrappedFirst = asyncHandler(firstMiddleware);
      const wrappedSecond = asyncHandler(secondMiddleware);

      await wrappedFirst(mockRequest, mockResponse, mockNext);
      expect(mockNext).toHaveBeenCalled();

      mockNext.mockClear();
      await wrappedSecond(mockRequest, mockResponse, mockNext);

      expect(firstMiddleware).toHaveBeenCalled();
      expect(secondMiddleware).toHaveBeenCalled();
    });

    it('应该处理复杂的业务逻辑', async () => {
      const complexBusinessLogic = jest.fn().mockImplementation(async (req, res) => {
        // 模拟复杂的业务逻辑
        const data = await Promise.resolve({ id: 1, name: 'test' });
        const processedData = { ...data, processed: true };
        res.json(processedData);
      });
      const middleware = asyncHandler(complexBusinessLogic);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(complexBusinessLogic).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('应该处理数据库操作', async () => {
      const databaseOperation = jest.fn().mockImplementation(async (req, res) => {
        // 模拟数据库操作
        const result = await Promise.resolve([
          { id: 1, name: 'item1' },
          { id: 2, name: 'item2' }
        ]);
        res.json({ data: result, count: result.length });
      });
      const middleware = asyncHandler(databaseOperation);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(databaseOperation).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('应该处理文件操作', async () => {
      const fileOperation = jest.fn().mockImplementation(async (req, res) => {
        // 模拟文件操作
        const fileContent = await Promise.resolve('file content');
        res.json({ content: fileContent, size: fileContent.length });
      });
      const middleware = asyncHandler(fileOperation);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(fileOperation).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('错误恢复', () => {
    it('应该从临时错误中恢复', async () => {
      let callCount = 0;
      const flakyFunction = jest.fn().mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          throw new Error('临时错误');
        }
        return 'success';
      });
      const middleware = asyncHandler(flakyFunction);

      // 第一次调用应该失败
      await middleware(mockRequest, mockResponse, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));

      // 重置mock
      mockNext.mockClear();

      // 第二次调用应该成功
      await middleware(mockRequest, mockResponse, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('应该处理重试逻辑', async () => {
      const retryFunction = jest.fn()
        .mockRejectedValueOnce(new Error('第一次失败'))
        .mockRejectedValueOnce(new Error('第二次失败'))
        .mockResolvedValueOnce('第三次成功');

      // 模拟重试逻辑
      for (let i = 0; i < 3; i++) {
        const middleware = asyncHandler(retryFunction);
        await middleware(mockRequest, mockResponse, mockNext);
        
        if (i < 2) {
          expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
          mockNext.mockClear();
        } else {
          expect(mockNext).not.toHaveBeenCalled();
        }
      }

      expect(retryFunction).toHaveBeenCalledTimes(3);
    });
  });
});
