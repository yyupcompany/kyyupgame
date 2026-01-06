// Mock dependencies
jest.mock('../../../src/controllers/script-category.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { createCategory } from '../../../src/controllers/script-category.controller';
import { getCategories } from '../../../src/controllers/script-category.controller';
import { updateCategory } from '../../../src/controllers/script-category.controller';
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

describe('Script Category Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCategory', () => {
    it('应该成功创建脚本分类', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          name: '活动脚本',
          description: '活动相关脚本'
        };

      await createCategory(req as Request, res as Response);

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
          name: '活动脚本',
          description: '活动相关脚本'
        };
      req.user = null;

      await createCategory(req as Request, res as Response);

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
          name: '活动脚本',
          description: '活动相关脚本'
        };

      // 模拟错误
      const originalCreateCategory = createCategory;
      (createCategory as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await createCategory(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (createCategory as jest.Mock).mockImplementation(originalCreateCategory);
    });
  });
  describe('getCategories', () => {
    it('应该成功获取分类列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      
      req.query = { page: '1', limit: '10' };

      await getCategories(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    

    

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      
      req.query = { page: '1', limit: '10' };

      // 模拟错误
      const originalGetCategories = getCategories;
      (getCategories as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getCategories(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getCategories as jest.Mock).mockImplementation(originalGetCategories);
    });
  });
  describe('updateCategory', () => {
    it('应该成功更新分类', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.params = { id: '1' };
        req.body = { name: '更新后的分类' };

      await updateCategory(req as Request, res as Response);

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
        req.body = { name: '更新后的分类' };
      req.user = null;

      await updateCategory(req as Request, res as Response);

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
        req.body = { name: '更新后的分类' };

      // 模拟错误
      const originalUpdateCategory = updateCategory;
      (updateCategory as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await updateCategory(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (updateCategory as jest.Mock).mockImplementation(originalUpdateCategory);
    });
  });
});