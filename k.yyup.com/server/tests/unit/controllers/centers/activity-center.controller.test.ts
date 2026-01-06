// Mock dependencies
jest.mock('../../../src/controllers/centers/activity-center.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { getActivityDashboard } from '../../../src/controllers/centers/activity-center.controller';
import { getActivityStats } from '../../../src/controllers/centers/activity-center.controller';
import { getRecentActivities } from '../../../src/controllers/centers/activity-center.controller';
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

describe('Activity Center Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getActivityDashboard', () => {
    it('应该成功获取活动中心仪表板', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      

      await getActivityDashboard(req as Request, res as Response);

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

      await getActivityDashboard(req as Request, res as Response);

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
      const originalGetActivityDashboard = getActivityDashboard;
      (getActivityDashboard as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getActivityDashboard(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getActivityDashboard as jest.Mock).mockImplementation(originalGetActivityDashboard);
    });
  });
  describe('getActivityStats', () => {
    it('应该成功获取活动统计', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { 
          timeRange: 'month',
          activityType: 'all'
        };

      await getActivityStats(req as Request, res as Response);

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
          timeRange: 'month',
          activityType: 'all'
        };
      req.user = null;

      await getActivityStats(req as Request, res as Response);

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
          timeRange: 'month',
          activityType: 'all'
        };

      // 模拟错误
      const originalGetActivityStats = getActivityStats;
      (getActivityStats as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getActivityStats(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getActivityStats as jest.Mock).mockImplementation(originalGetActivityStats);
    });
  });
  describe('getRecentActivities', () => {
    it('应该成功获取最近活动', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { 
          limit: '10',
          status: 'active'
        };

      await getRecentActivities(req as Request, res as Response);

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
          limit: '10',
          status: 'active'
        };
      req.user = null;

      await getRecentActivities(req as Request, res as Response);

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
          limit: '10',
          status: 'active'
        };

      // 模拟错误
      const originalGetRecentActivities = getRecentActivities;
      (getRecentActivities as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getRecentActivities(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getRecentActivities as jest.Mock).mockImplementation(originalGetRecentActivities);
    });
  });
});