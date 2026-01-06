// Mock dependencies
jest.mock('../../../src/controllers/ai/memory.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { createMemory } from '../../../src/controllers/ai/memory.controller';
import { getMemories } from '../../../src/controllers/ai/memory.controller';
import { updateMemory } from '../../../src/controllers/ai/memory.controller';
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

describe('AI Memory Controller (Main)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createMemory', () => {
    it('应该成功创建记忆', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          title: '用户偏好',
          content: '用户喜欢简洁的界面',
          tags: ['preference', 'ui']
        };

      await createMemory(req as Request, res as Response);

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
          title: '用户偏好',
          content: '用户喜欢简洁的界面',
          tags: ['preference', 'ui']
        };
      req.user = null;

      await createMemory(req as Request, res as Response);

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
          title: '用户偏好',
          content: '用户喜欢简洁的界面',
          tags: ['preference', 'ui']
        };

      // 模拟错误
      const originalCreateMemory = createMemory;
      (createMemory as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await createMemory(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (createMemory as jest.Mock).mockImplementation(originalCreateMemory);
    });
  });
  describe('getMemories', () => {
    it('应该成功获取记忆列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { 
          tags: 'preference',
          page: '1',
          limit: '10'
        };

      await getMemories(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = { 
          tags: 'preference',
          page: '1',
          limit: '10'
        };
      req.user = null;

      await getMemories(req as Request, res as Response);

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
      req.query = { 
          tags: 'preference',
          page: '1',
          limit: '10'
        };

      // 模拟错误
      const originalGetMemories = getMemories;
      (getMemories as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getMemories(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getMemories as jest.Mock).mockImplementation(originalGetMemories);
    });
  });
  describe('updateMemory', () => {
    it('应该成功更新记忆', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.params = { id: '1' };
        req.body = { content: '更新后的记忆内容' };

      await updateMemory(req as Request, res as Response);

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
        req.body = { content: '更新后的记忆内容' };
      req.user = null;

      await updateMemory(req as Request, res as Response);

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
        req.body = { content: '更新后的记忆内容' };

      // 模拟错误
      const originalUpdateMemory = updateMemory;
      (updateMemory as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await updateMemory(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (updateMemory as jest.Mock).mockImplementation(originalUpdateMemory);
    });
  });
});