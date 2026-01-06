// Mock dependencies
jest.mock('../../../src/controllers/page-guide.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { createGuide } from '../../../src/controllers/page-guide.controller';
import { getGuides } from '../../../src/controllers/page-guide.controller';
import { updateGuide } from '../../../src/controllers/page-guide.controller';
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

describe('Page Guide Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createGuide', () => {
    it('应该成功创建页面指南', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          page: 'dashboard',
          title: '仪表板使用指南',
          content: '仪表板使用说明'
        };

      await createGuide(req as Request, res as Response);

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
          page: 'dashboard',
          title: '仪表板使用指南',
          content: '仪表板使用说明'
        };
      req.user = null;

      await createGuide(req as Request, res as Response);

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
          page: 'dashboard',
          title: '仪表板使用指南',
          content: '仪表板使用说明'
        };

      // 模拟错误
      const originalCreateGuide = createGuide;
      (createGuide as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await createGuide(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (createGuide as jest.Mock).mockImplementation(originalCreateGuide);
    });
  });
  describe('getGuides', () => {
    it('应该成功获取指南列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      
      req.query = { page: 'dashboard' };

      await getGuides(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    

    

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      
      req.query = { page: 'dashboard' };

      // 模拟错误
      const originalGetGuides = getGuides;
      (getGuides as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getGuides(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getGuides as jest.Mock).mockImplementation(originalGetGuides);
    });
  });
  describe('updateGuide', () => {
    it('应该成功更新指南', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.params = { id: '1' };
        req.body = { title: '更新后的指南' };

      await updateGuide(req as Request, res as Response);

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
        req.body = { title: '更新后的指南' };
      req.user = null;

      await updateGuide(req as Request, res as Response);

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
        req.body = { title: '更新后的指南' };

      // 模拟错误
      const originalUpdateGuide = updateGuide;
      (updateGuide as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await updateGuide(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (updateGuide as jest.Mock).mockImplementation(originalUpdateGuide);
    });
  });
});