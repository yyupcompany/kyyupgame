// Mock dependencies
jest.mock('../../../src/controllers/page-guide-section.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { createSection } from '../../../src/controllers/page-guide-section.controller';
import { getSections } from '../../../src/controllers/page-guide-section.controller';
import { updateSection } from '../../../src/controllers/page-guide-section.controller';
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

describe('Page Guide Section Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSection', () => {
    it('应该成功创建指南章节', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          guideId: 1,
          title: '第一章',
          content: '章节内容',
          order: 1
        };

      await createSection(req as Request, res as Response);

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
          guideId: 1,
          title: '第一章',
          content: '章节内容',
          order: 1
        };
      req.user = null;

      await createSection(req as Request, res as Response);

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
          guideId: 1,
          title: '第一章',
          content: '章节内容',
          order: 1
        };

      // 模拟错误
      const originalCreateSection = createSection;
      (createSection as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await createSection(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (createSection as jest.Mock).mockImplementation(originalCreateSection);
    });
  });
  describe('getSections', () => {
    it('应该成功获取章节列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      
      req.query = { guideId: '1' };

      await getSections(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    

    

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      
      req.query = { guideId: '1' };

      // 模拟错误
      const originalGetSections = getSections;
      (getSections as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getSections(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getSections as jest.Mock).mockImplementation(originalGetSections);
    });
  });
  describe('updateSection', () => {
    it('应该成功更新章节', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.params = { id: '1' };
        req.body = { title: '更新后的章节' };

      await updateSection(req as Request, res as Response);

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
        req.body = { title: '更新后的章节' };
      req.user = null;

      await updateSection(req as Request, res as Response);

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
        req.body = { title: '更新后的章节' };

      // 模拟错误
      const originalUpdateSection = updateSection;
      (updateSection as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await updateSection(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (updateSection as jest.Mock).mockImplementation(originalUpdateSection);
    });
  });
});