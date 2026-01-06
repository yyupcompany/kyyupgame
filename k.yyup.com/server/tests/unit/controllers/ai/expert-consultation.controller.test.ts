// Mock dependencies
jest.mock('../../../src/controllers/ai/expert-consultation.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { requestConsultation } from '../../../src/controllers/ai/expert-consultation.controller';
import { getConsultationStatus } from '../../../src/controllers/ai/expert-consultation.controller';
import { getConsultationHistory } from '../../../src/controllers/ai/expert-consultation.controller';
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

describe('AI Expert Consultation Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestConsultation', () => {
    it('应该成功请求专家咨询', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          topic: '教育咨询',
          question: '如何选择适合的幼儿园？',
          priority: 'normal'
        };

      await requestConsultation(req as Request, res as Response);

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
          topic: '教育咨询',
          question: '如何选择适合的幼儿园？',
          priority: 'normal'
        };
      req.user = null;

      await requestConsultation(req as Request, res as Response);

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
          topic: '教育咨询',
          question: '如何选择适合的幼儿园？',
          priority: 'normal'
        };

      // 模拟错误
      const originalRequestConsultation = requestConsultation;
      (requestConsultation as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await requestConsultation(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (requestConsultation as jest.Mock).mockImplementation(originalRequestConsultation);
    });
  });
  describe('getConsultationStatus', () => {
    it('应该成功获取咨询状态', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.params = { consultationId: '1' };

      await getConsultationStatus(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { consultationId: '1' };
      req.user = null;

      await getConsultationStatus(req as Request, res as Response);

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
      req.params = { consultationId: '1' };

      // 模拟错误
      const originalGetConsultationStatus = getConsultationStatus;
      (getConsultationStatus as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getConsultationStatus(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getConsultationStatus as jest.Mock).mockImplementation(originalGetConsultationStatus);
    });
  });
  describe('getConsultationHistory', () => {
    it('应该成功获取咨询历史', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { 
          userId: '1',
          status: 'completed'
        };

      await getConsultationHistory(req as Request, res as Response);

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
          userId: '1',
          status: 'completed'
        };
      req.user = null;

      await getConsultationHistory(req as Request, res as Response);

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
          userId: '1',
          status: 'completed'
        };

      // 模拟错误
      const originalGetConsultationHistory = getConsultationHistory;
      (getConsultationHistory as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getConsultationHistory(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getConsultationHistory as jest.Mock).mockImplementation(originalGetConsultationHistory);
    });
  });
});