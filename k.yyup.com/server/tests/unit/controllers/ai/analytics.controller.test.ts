// Mock dependencies
jest.mock('../../../src/controllers/ai/analytics.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { analyzeData } from '../../../src/controllers/ai/analytics.controller';
import { generateReport } from '../../../src/controllers/ai/analytics.controller';
import { getInsights } from '../../../src/controllers/ai/analytics.controller';
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

describe('AI Analytics Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeData', () => {
    it('应该成功分析数据', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          dataSource: 'enrollment_data',
          analysisType: 'trend_analysis',
          parameters: { timeRange: '6months' }
        };

      await analyzeData(req as Request, res as Response);

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
          dataSource: 'enrollment_data',
          analysisType: 'trend_analysis',
          parameters: { timeRange: '6months' }
        };
      req.user = null;

      await analyzeData(req as Request, res as Response);

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
          dataSource: 'enrollment_data',
          analysisType: 'trend_analysis',
          parameters: { timeRange: '6months' }
        };

      // 模拟错误
      const originalAnalyzeData = analyzeData;
      (analyzeData as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await analyzeData(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (analyzeData as jest.Mock).mockImplementation(originalAnalyzeData);
    });
  });
  describe('generateReport', () => {
    it('应该成功生成报告', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          reportType: 'enrollment_summary',
          format: 'pdf',
          parameters: { includeCharts: true }
        };

      await generateReport(req as Request, res as Response);

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
          reportType: 'enrollment_summary',
          format: 'pdf',
          parameters: { includeCharts: true }
        };
      req.user = null;

      await generateReport(req as Request, res as Response);

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
          reportType: 'enrollment_summary',
          format: 'pdf',
          parameters: { includeCharts: true }
        };

      // 模拟错误
      const originalGenerateReport = generateReport;
      (generateReport as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await generateReport(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (generateReport as jest.Mock).mockImplementation(originalGenerateReport);
    });
  });
  describe('getInsights', () => {
    it('应该成功获取洞察', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { 
          category: 'enrollment',
          timeRange: 'month'
        };

      await getInsights(req as Request, res as Response);

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
          category: 'enrollment',
          timeRange: 'month'
        };
      req.user = null;

      await getInsights(req as Request, res as Response);

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
          category: 'enrollment',
          timeRange: 'month'
        };

      // 模拟错误
      const originalGetInsights = getInsights;
      (getInsights as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getInsights(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getInsights as jest.Mock).mockImplementation(originalGetInsights);
    });
  });
});