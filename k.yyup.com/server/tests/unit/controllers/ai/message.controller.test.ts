// Mock dependencies
jest.mock('../../../src/controllers/ai/message.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { sendMessage } from '../../../src/controllers/ai/message.controller';
import { getMessages } from '../../../src/controllers/ai/message.controller';
import { deleteMessage } from '../../../src/controllers/ai/message.controller';
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

describe('AI Message Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('应该成功发送消息', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          recipientId: 2,
          content: '您好，我想咨询一下',
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
          recipientId: 2,
          content: '您好，我想咨询一下',
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
          recipientId: 2,
          content: '您好，我想咨询一下',
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
  describe('getMessages', () => {
    it('应该成功获取消息列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { 
          conversationId: '1',
          page: '1',
          limit: '20'
        };

      await getMessages(req as Request, res as Response);

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
          page: '1',
          limit: '20'
        };
      req.user = null;

      await getMessages(req as Request, res as Response);

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
          page: '1',
          limit: '20'
        };

      // 模拟错误
      const originalGetMessages = getMessages;
      (getMessages as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getMessages(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getMessages as jest.Mock).mockImplementation(originalGetMessages);
    });
  });
  describe('deleteMessage', () => {
    it('应该成功删除消息', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.params = { id: '1' };

      await deleteMessage(req as Request, res as Response);

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

      await deleteMessage(req as Request, res as Response);

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
      const originalDeleteMessage = deleteMessage;
      (deleteMessage as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await deleteMessage(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (deleteMessage as jest.Mock).mockImplementation(originalDeleteMessage);
    });
  });
});