// Mock dependencies
jest.mock('../../../src/controllers/ai/openai-compatible.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { chatCompletion } from '../../../src/controllers/ai/openai-compatible.controller';
import { getModels } from '../../../src/controllers/ai/openai-compatible.controller';
import { getEmbeddings } from '../../../src/controllers/ai/openai-compatible.controller';
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

describe('AI OpenAI Compatible Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('chatCompletion', () => {
    it('应该成功聊天补全', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'user', content: '你好' }
          ],
          temperature: 0.7
        };

      await chatCompletion(req as Request, res as Response);

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
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'user', content: '你好' }
          ],
          temperature: 0.7
        };
      req.user = null;

      await chatCompletion(req as Request, res as Response);

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
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'user', content: '你好' }
          ],
          temperature: 0.7
        };

      // 模拟错误
      const originalChatCompletion = chatCompletion;
      (chatCompletion as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await chatCompletion(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (chatCompletion as jest.Mock).mockImplementation(originalChatCompletion);
    });
  });
  describe('getModels', () => {
    it('应该成功获取模型列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      

      await getModels(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      
      req.user = null;

      await getModels(req as Request, res as Response);

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
      

      // 模拟错误
      const originalGetModels = getModels;
      (getModels as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getModels(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getModels as jest.Mock).mockImplementation(originalGetModels);
    });
  });
  describe('getEmbeddings', () => {
    it('应该成功获取嵌入向量', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          input: '这是一个测试文本',
          model: 'text-embedding-ada-002'
        };

      await getEmbeddings(req as Request, res as Response);

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
          input: '这是一个测试文本',
          model: 'text-embedding-ada-002'
        };
      req.user = null;

      await getEmbeddings(req as Request, res as Response);

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
          input: '这是一个测试文本',
          model: 'text-embedding-ada-002'
        };

      // 模拟错误
      const originalGetEmbeddings = getEmbeddings;
      (getEmbeddings as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getEmbeddings(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getEmbeddings as jest.Mock).mockImplementation(originalGetEmbeddings);
    });
  });
});