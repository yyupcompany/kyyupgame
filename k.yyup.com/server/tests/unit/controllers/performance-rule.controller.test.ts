// Mock dependencies
jest.mock('../../../src/controllers/performance-rule.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { createRule } from '../../../src/controllers/performance-rule.controller';
import { getRules } from '../../../src/controllers/performance-rule.controller';
import { updateRule } from '../../../src/controllers/performance-rule.controller';
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

describe('Performance Rule Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createRule', () => {
    it('应该成功创建绩效规则', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          name: '教学评分规则',
          description: '教师教学绩效评分规则',
          criteria: ['教学质量', '学生反馈', '课堂管理']
        };

      await createRule(req as Request, res as Response);

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
          name: '教学评分规则',
          description: '教师教学绩效评分规则',
          criteria: ['教学质量', '学生反馈', '课堂管理']
        };
      req.user = null;

      await createRule(req as Request, res as Response);

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
          name: '教学评分规则',
          description: '教师教学绩效评分规则',
          criteria: ['教学质量', '学生反馈', '课堂管理']
        };

      // 模拟错误
      const originalCreateRule = createRule;
      (createRule as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await createRule(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (createRule as jest.Mock).mockImplementation(originalCreateRule);
    });
  });
  describe('getRules', () => {
    it('应该成功获取规则列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { page: '1', limit: '10' };

      await getRules(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = { page: '1', limit: '10' };
      req.user = null;

      await getRules(req as Request, res as Response);

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
      req.query = { page: '1', limit: '10' };

      // 模拟错误
      const originalGetRules = getRules;
      (getRules as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getRules(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getRules as jest.Mock).mockImplementation(originalGetRules);
    });
  });
  describe('updateRule', () => {
    it('应该成功更新规则', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.params = { id: '1' };
        req.body = { name: '更新后的规则' };

      await updateRule(req as Request, res as Response);

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
        req.body = { name: '更新后的规则' };
      req.user = null;

      await updateRule(req as Request, res as Response);

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
        req.body = { name: '更新后的规则' };

      // 模拟错误
      const originalUpdateRule = updateRule;
      (updateRule as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await updateRule(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (updateRule as jest.Mock).mockImplementation(originalUpdateRule);
    });
  });
});