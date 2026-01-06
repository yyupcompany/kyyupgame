// Mock dependencies
jest.mock('../../../src/controllers/enrollment-interview.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { scheduleInterview } from '../../../src/controllers/enrollment-interview.controller';
import { getInterviews } from '../../../src/controllers/enrollment-interview.controller';
import { updateInterviewResult } from '../../../src/controllers/enrollment-interview.controller';
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

describe('Enrollment Interview Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('scheduleInterview', () => {
    it('应该成功安排面试', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          applicationId: 1,
          interviewTime: new Date(),
          interviewerId: 1
        };

      await scheduleInterview(req as Request, res as Response);

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
          interviewTime: new Date(),
          interviewerId: 1
        };
      req.user = null;

      await scheduleInterview(req as Request, res as Response);

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
          interviewTime: new Date(),
          interviewerId: 1
        };

      // 模拟错误
      const originalScheduleInterview = scheduleInterview;
      (scheduleInterview as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await scheduleInterview(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (scheduleInterview as jest.Mock).mockImplementation(originalScheduleInterview);
    });
  });
  describe('getInterviews', () => {
    it('应该成功获取面试列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { page: '1', limit: '10' };

      await getInterviews(req as Request, res as Response);

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

      await getInterviews(req as Request, res as Response);

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
      const originalGetInterviews = getInterviews;
      (getInterviews as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getInterviews(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getInterviews as jest.Mock).mockImplementation(originalGetInterviews);
    });
  });
  describe('updateInterviewResult', () => {
    it('应该成功更新面试结果', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.params = { id: '1' };
        req.body = { result: 'passed', comments: '表现优秀' };

      await updateInterviewResult(req as Request, res as Response);

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
        req.body = { result: 'passed', comments: '表现优秀' };
      req.user = null;

      await updateInterviewResult(req as Request, res as Response);

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
        req.body = { result: 'passed', comments: '表现优秀' };

      // 模拟错误
      const originalUpdateInterviewResult = updateInterviewResult;
      (updateInterviewResult as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await updateInterviewResult(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (updateInterviewResult as jest.Mock).mockImplementation(originalUpdateInterviewResult);
    });
  });
});