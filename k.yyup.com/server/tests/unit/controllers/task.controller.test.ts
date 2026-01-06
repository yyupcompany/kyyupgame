// Mock dependencies
jest.mock('../../../src/controllers/task.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { createTask } from '../../../src/controllers/task.controller';
import { getTasks } from '../../../src/controllers/task.controller';
import { updateTask } from '../../../src/controllers/task.controller';
import { completeTask } from '../../../src/controllers/task.controller';
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

describe('Task Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('应该成功创建任务', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          title: '系统维护任务',
          description: '定期系统维护',
          assigneeId: 1,
          dueDate: new Date()
        };

      await createTask(req as Request, res as Response);

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
          title: '系统维护任务',
          description: '定期系统维护',
          assigneeId: 1,
          dueDate: new Date()
        };
      req.user = null;

      await createTask(req as Request, res as Response);

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
          title: '系统维护任务',
          description: '定期系统维护',
          assigneeId: 1,
          dueDate: new Date()
        };

      // 模拟错误
      const originalCreateTask = createTask;
      (createTask as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await createTask(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (createTask as jest.Mock).mockImplementation(originalCreateTask);
    });
  });
  describe('getTasks', () => {
    it('应该成功获取任务列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { 
          status: 'pending',
          assigneeId: '1',
          page: '1',
          limit: '10'
        };

      await getTasks(req as Request, res as Response);

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
          status: 'pending',
          assigneeId: '1',
          page: '1',
          limit: '10'
        };
      req.user = null;

      await getTasks(req as Request, res as Response);

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
          status: 'pending',
          assigneeId: '1',
          page: '1',
          limit: '10'
        };

      // 模拟错误
      const originalGetTasks = getTasks;
      (getTasks as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getTasks(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getTasks as jest.Mock).mockImplementation(originalGetTasks);
    });
  });
  describe('updateTask', () => {
    it('应该成功更新任务', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.params = { id: '1' };
        req.body = { status: 'in_progress' };

      await updateTask(req as Request, res as Response);

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
        req.body = { status: 'in_progress' };
      req.user = null;

      await updateTask(req as Request, res as Response);

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
        req.body = { status: 'in_progress' };

      // 模拟错误
      const originalUpdateTask = updateTask;
      (updateTask as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await updateTask(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (updateTask as jest.Mock).mockImplementation(originalUpdateTask);
    });
  });
  describe('completeTask', () => {
    it('应该成功完成任务', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.params = { id: '1' };

      await completeTask(req as Request, res as Response);

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

      await completeTask(req as Request, res as Response);

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
      const originalCompleteTask = completeTask;
      (completeTask as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await completeTask(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (completeTask as jest.Mock).mockImplementation(originalCompleteTask);
    });
  });
});