// Mock dependencies
jest.mock('../../../src/controllers/script.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { createScript } from '../../../src/controllers/script.controller';
import { getScripts } from '../../../src/controllers/script.controller';
import { executeScript } from '../../../src/controllers/script.controller';
import { ApiError } from '../../../src/utils/apiError';
import { ApiResponse } from '../../../src/utils/apiResponse';

const mockRequest = () => ({
  body: {},
  query: {},
  params: {},
  user: null
} as Partial<Request>);

const mockResponse = () => {
  const res = {} as Partial<Response>;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn() as NextFunction;


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

describe('Script Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createScript', () => {
    it('应该成功创建脚本', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          name: '数据同步脚本',
          content: 'console.log("Hello World");',
          categoryId: 1
        };

      await createScript(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
          name: '数据同步脚本',
          content: 'console.log("Hello World");',
          categoryId: 1
        };
      req.user = null;

      await createScript(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 401
      });
    });

    

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          name: '数据同步脚本',
          content: 'console.log("Hello World");',
          categoryId: 1
        };

      // 模拟错误
      const originalCreateScript = createScript;
      (createScript as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await createScript(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (createScript as jest.Mock).mockImplementation(originalCreateScript);
    });
  });
  describe('getScripts', () => {
    it('应该成功获取脚本列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { categoryId: '1', page: '1', limit: '10' };

      await getScripts(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = { categoryId: '1', page: '1', limit: '10' };
      req.user = null;

      await getScripts(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 401
      });
    });

    

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { categoryId: '1', page: '1', limit: '10' };

      // 模拟错误
      const originalGetScripts = getScripts;
      (getScripts as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getScripts(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getScripts as jest.Mock).mockImplementation(originalGetScripts);
    });
  });
  describe('executeScript', () => {
    it('应该成功执行脚本', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.params = { id: '1' };

      await executeScript(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.user = null;

      await executeScript(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 401
      });
    });

    

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.params = { id: '1' };

      // 模拟错误
      const originalExecuteScript = executeScript;
      (executeScript as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await executeScript(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (executeScript as jest.Mock).mockImplementation(originalExecuteScript);
    });
  });
});