// Mock dependencies
jest.mock('../../../src/controllers/example.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { exampleMethod } from '../../../src/controllers/example.controller';
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

describe('Example Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('exampleMethod', () => {
    it('应该成功示例方法', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      
      

      await exampleMethod(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    

    

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      
      

      // 模拟错误
      const originalExampleMethod = exampleMethod;
      (exampleMethod as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await exampleMethod(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (exampleMethod as jest.Mock).mockImplementation(originalExampleMethod);
    });
  });
});