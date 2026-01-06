// Mock dependencies
jest.mock('../../../src/controllers/ai/conversation.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { startConversation } from '../../../src/controllers/ai/conversation.controller';
import { sendMessage } from '../../../src/controllers/ai/conversation.controller';
import { getConversationHistory } from '../../../src/controllers/ai/conversation.controller';
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

describe('AI Conversation Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('startConversation', () => {
    it('应该成功开始对话', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          type: 'consultation',
          initialMessage: '我想了解招生信息'
        };

      await startConversation(req as Request, res as Response);

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
          type: 'consultation',
          initialMessage: '我想了解招生信息'
        };
      req.user = null;

      await startConversation(req as Request, res as Response);

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
          type: 'consultation',
          initialMessage: '我想了解招生信息'
        };

      // 模拟错误
      const originalStartConversation = startConversation;
      (startConversation as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await startConversation(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (startConversation as jest.Mock).mockImplementation(originalStartConversation);
    });
  });
  describe('sendMessage', () => {
    it('应该成功发送消息', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          conversationId: 1,
          message: '请问学费是多少？',
          messageType: 'text'
        };

      await sendMessage(req as Request, res as Response);

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
          conversationId: 1,
          message: '请问学费是多少？',
          messageType: 'text'
        };
      req.user = null;

      await sendMessage(req as Request, res as Response);

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
          conversationId: 1,
          message: '请问学费是多少？',
          messageType: 'text'
        };

      // 模拟错误
      const originalSendMessage = sendMessage;
      (sendMessage as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await sendMessage(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (sendMessage as jest.Mock).mockImplementation(originalSendMessage);
    });
  });
  describe('getConversationHistory', () => {
    it('应该成功获取对话历史', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { 
          conversationId: '1',
          limit: '50'
        };

      await getConversationHistory(req as Request, res as Response);

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
          conversationId: '1',
          limit: '50'
        };
      req.user = null;

      await getConversationHistory(req as Request, res as Response);

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
          conversationId: '1',
          limit: '50'
        };

      // 模拟错误
      const originalGetConversationHistory = getConversationHistory;
      (getConversationHistory as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getConversationHistory(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getConversationHistory as jest.Mock).mockImplementation(originalGetConversationHistory);
    });
  });
});