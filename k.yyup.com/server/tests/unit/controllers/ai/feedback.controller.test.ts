// Mock dependencies
jest.mock('../../../src/controllers/ai/feedback.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { submitFeedback } from '../../../src/controllers/ai/feedback.controller';
import { getFeedbackStats } from '../../../src/controllers/ai/feedback.controller';
import { analyzeFeedback } from '../../../src/controllers/ai/feedback.controller';
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

describe('AI Feedback Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('submitFeedback', () => {
    it('应该成功提交反馈', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          type: 'ai_response',
          rating: 5,
          content: 'AI回答很准确',
          sessionId: 'session_123'
        };

      await submitFeedback(req as Request, res as Response);

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
          type: 'ai_response',
          rating: 5,
          content: 'AI回答很准确',
          sessionId: 'session_123'
        };
      req.user = null;

      await submitFeedback(req as Request, res as Response);

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
          type: 'ai_response',
          rating: 5,
          content: 'AI回答很准确',
          sessionId: 'session_123'
        };

      // 模拟错误
      const originalSubmitFeedback = submitFeedback;
      (submitFeedback as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await submitFeedback(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (submitFeedback as jest.Mock).mockImplementation(originalSubmitFeedback);
    });
  });
  describe('getFeedbackStats', () => {
    it('应该成功获取反馈统计', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { 
          type: 'ai_response',
          timeRange: 'week'
        };

      await getFeedbackStats(req as Request, res as Response);

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
          type: 'ai_response',
          timeRange: 'week'
        };
      req.user = null;

      await getFeedbackStats(req as Request, res as Response);

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
          type: 'ai_response',
          timeRange: 'week'
        };

      // 模拟错误
      const originalGetFeedbackStats = getFeedbackStats;
      (getFeedbackStats as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getFeedbackStats(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getFeedbackStats as jest.Mock).mockImplementation(originalGetFeedbackStats);
    });
  });
  describe('analyzeFeedback', () => {
    it('应该成功分析反馈', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          feedbackIds: [1, 2, 3],
          analysisType: 'sentiment'
        };

      await analyzeFeedback(req as Request, res as Response);

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
          feedbackIds: [1, 2, 3],
          analysisType: 'sentiment'
        };
      req.user = null;

      await analyzeFeedback(req as Request, res as Response);

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
          feedbackIds: [1, 2, 3],
          analysisType: 'sentiment'
        };

      // 模拟错误
      const originalAnalyzeFeedback = analyzeFeedback;
      (analyzeFeedback as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await analyzeFeedback(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (analyzeFeedback as jest.Mock).mockImplementation(originalAnalyzeFeedback);
    });
  });
});