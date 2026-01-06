// Mock dependencies
jest.mock('../../../src/controllers/enrollment-ai.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { analyzeApplication } from '../../../src/controllers/enrollment-ai.controller';
import { predictEnrollment } from '../../../src/controllers/enrollment-ai.controller';
import { generateRecommendations } from '../../../src/controllers/enrollment-ai.controller';
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

describe('Enrollment AI Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeApplication', () => {
    it('应该成功分析申请', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          applicationId: 1,
          studentInfo: { name: '张三', age: 5 }
        };

      await analyzeApplication(req as Request, res as Response);

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
          applicationId: 1,
          studentInfo: { name: '张三', age: 5 }
        };
      req.user = null;

      await analyzeApplication(req as Request, res as Response);

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
          applicationId: 1,
          studentInfo: { name: '张三', age: 5 }
        };

      // 模拟错误
      const originalAnalyzeApplication = analyzeApplication;
      (analyzeApplication as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await analyzeApplication(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (analyzeApplication as jest.Mock).mockImplementation(originalAnalyzeApplication);
    });
  });
  describe('predictEnrollment', () => {
    it('应该成功预测招生', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          historicalData: [],
          factors: ['location', 'age', 'income']
        };

      await predictEnrollment(req as Request, res as Response);

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
          historicalData: [],
          factors: ['location', 'age', 'income']
        };
      req.user = null;

      await predictEnrollment(req as Request, res as Response);

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
          historicalData: [],
          factors: ['location', 'age', 'income']
        };

      // 模拟错误
      const originalPredictEnrollment = predictEnrollment;
      (predictEnrollment as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await predictEnrollment(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (predictEnrollment as jest.Mock).mockImplementation(originalPredictEnrollment);
    });
  });
  describe('generateRecommendations', () => {
    it('应该成功生成推荐', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.params = { studentId: '1' };

      await generateRecommendations(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { studentId: '1' };
      req.user = null;

      await generateRecommendations(req as Request, res as Response);

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
      req.params = { studentId: '1' };

      // 模拟错误
      const originalGenerateRecommendations = generateRecommendations;
      (generateRecommendations as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await generateRecommendations(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (generateRecommendations as jest.Mock).mockImplementation(originalGenerateRecommendations);
    });
  });
});