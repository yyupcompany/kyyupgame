// Mock dependencies
jest.mock('../../../src/controllers/activity-registration.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { register } from '../../../src/controllers/activity-registration.controller';
import { getRegistrations } from '../../../src/controllers/activity-registration.controller';
import { getRegistrationById } from '../../../src/controllers/activity-registration.controller';
import { updateRegistration } from '../../../src/controllers/activity-registration.controller';
import { cancelRegistration } from '../../../src/controllers/activity-registration.controller';
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

describe('Activity Registration Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('应该成功活动报名', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          activityId: 1,
          contactName: '张三',
          contactPhone: '13800138000',
          childName: '小明',
          childAge: 5
        };

      await register(req as Request, res as Response);

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
          activityId: 1,
          contactName: '张三',
          contactPhone: '13800138000',
          childName: '小明',
          childAge: 5
        };
      req.user = null;

      await register(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 401
      });
    });

    
    it('应该验证活动ID不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
              // 缺少activityId
              contactName: '张三',
              contactPhone: '13800138000'
            };

      await register(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: '活动ID不能为空',
        statusCode: 400
      });
    });

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          activityId: 1,
          contactName: '张三',
          contactPhone: '13800138000',
          childName: '小明',
          childAge: 5
        };

      // 模拟错误
      const originalRegister = register;
      (register as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await register(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (register as jest.Mock).mockImplementation(originalRegister);
    });
  });
  describe('getRegistrations', () => {
    it('应该成功获取报名列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      
      req.query = { activityId: '1', page: '1', limit: '10' };

      await getRegistrations(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    

    

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      
      req.query = { activityId: '1', page: '1', limit: '10' };

      // 模拟错误
      const originalGetRegistrations = getRegistrations;
      (getRegistrations as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getRegistrations(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getRegistrations as jest.Mock).mockImplementation(originalGetRegistrations);
    });
  });
  describe('getRegistrationById', () => {
    it('应该成功获取报名详情', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      
      req.params = { id: '1' };

      await getRegistrationById(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    

    

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      
      req.params = { id: '1' };

      // 模拟错误
      const originalGetRegistrationById = getRegistrationById;
      (getRegistrationById as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getRegistrationById(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getRegistrationById as jest.Mock).mockImplementation(originalGetRegistrationById);
    });
  });
  describe('updateRegistration', () => {
    it('应该成功更新报名信息', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.params = { id: '1' };
        req.body = { contactName: '李四' };

      await updateRegistration(req as Request, res as Response);

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
        req.body = { contactName: '李四' };
      req.user = null;

      await updateRegistration(req as Request, res as Response);

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
        req.body = { contactName: '李四' };

      // 模拟错误
      const originalUpdateRegistration = updateRegistration;
      (updateRegistration as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await updateRegistration(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (updateRegistration as jest.Mock).mockImplementation(originalUpdateRegistration);
    });
  });
  describe('cancelRegistration', () => {
    it('应该成功取消报名', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.params = { id: '1' };

      await cancelRegistration(req as Request, res as Response);

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

      await cancelRegistration(req as Request, res as Response);

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
      const originalCancelRegistration = cancelRegistration;
      (cancelRegistration as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await cancelRegistration(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (cancelRegistration as jest.Mock).mockImplementation(originalCancelRegistration);
    });
  });
});