// Mock dependencies
jest.mock('../../../src/controllers/system-log.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { getLogs } from '../../../src/controllers/system-log.controller';
import { createLog } from '../../../src/controllers/system-log.controller';
import { clearLogs } from '../../../src/controllers/system-log.controller';
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

describe('System Log Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getLogs', () => {
    it('应该成功获取日志列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { 
          level: 'error',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          page: '1',
          limit: '10'
        };

      await getLogs(req as Request, res as Response);

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
          level: 'error',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          page: '1',
          limit: '10'
        };
      req.user = null;

      await getLogs(req as Request, res as Response);

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
          level: 'error',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          page: '1',
          limit: '10'
        };

      // 模拟错误
      const originalGetLogs = getLogs;
      (getLogs as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getLogs(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getLogs as jest.Mock).mockImplementation(originalGetLogs);
    });
  });
  describe('createLog', () => {
    it('应该成功创建日志', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          level: 'info',
          message: '系统操作日志',
          module: 'user_management'
        };

      await createLog(req as Request, res as Response);

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
          level: 'info',
          message: '系统操作日志',
          module: 'user_management'
        };
      req.user = null;

      await createLog(req as Request, res as Response);

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
          level: 'info',
          message: '系统操作日志',
          module: 'user_management'
        };

      // 模拟错误
      const originalCreateLog = createLog;
      (createLog as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await createLog(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (createLog as jest.Mock).mockImplementation(originalCreateLog);
    });
  });
  describe('clearLogs', () => {
    it('应该成功清除日志', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = { 
          beforeDate: '2024-01-01',
          level: 'info'
        };

      await clearLogs(req as Request, res as Response);

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
          beforeDate: '2024-01-01',
          level: 'info'
        };
      req.user = null;

      await clearLogs(req as Request, res as Response);

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
          beforeDate: '2024-01-01',
          level: 'info'
        };

      // 模拟错误
      const originalClearLogs = clearLogs;
      (clearLogs as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await clearLogs(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (clearLogs as jest.Mock).mockImplementation(originalClearLogs);
    });
  });
});