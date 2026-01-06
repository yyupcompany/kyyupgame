// Mock dependencies
jest.mock('../../../src/controllers/teacher-customers.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { getCustomers } from '../../../src/controllers/teacher-customers.controller';
import { addCustomer } from '../../../src/controllers/teacher-customers.controller';
import { updateCustomer } from '../../../src/controllers/teacher-customers.controller';
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

describe('Teacher Customers Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCustomers', () => {
    it('应该成功获取客户列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { 
          teacherId: '1',
          page: '1',
          limit: '10'
        };

      await getCustomers(req as Request, res as Response);

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
          teacherId: '1',
          page: '1',
          limit: '10'
        };
      req.user = null;

      await getCustomers(req as Request, res as Response);

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
          teacherId: '1',
          page: '1',
          limit: '10'
        };

      // 模拟错误
      const originalGetCustomers = getCustomers;
      (getCustomers as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getCustomers(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getCustomers as jest.Mock).mockImplementation(originalGetCustomers);
    });
  });
  describe('addCustomer', () => {
    it('应该成功添加客户', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          teacherId: 1,
          customerName: '张三',
          customerPhone: '13800138000',
          customerType: 'potential'
        };

      await addCustomer(req as Request, res as Response);

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
          teacherId: 1,
          customerName: '张三',
          customerPhone: '13800138000',
          customerType: 'potential'
        };
      req.user = null;

      await addCustomer(req as Request, res as Response);

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
          teacherId: 1,
          customerName: '张三',
          customerPhone: '13800138000',
          customerType: 'potential'
        };

      // 模拟错误
      const originalAddCustomer = addCustomer;
      (addCustomer as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await addCustomer(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (addCustomer as jest.Mock).mockImplementation(originalAddCustomer);
    });
  });
  describe('updateCustomer', () => {
    it('应该成功更新客户', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.params = { id: '1' };
        req.body = { customerType: 'converted' };

      await updateCustomer(req as Request, res as Response);

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
        req.body = { customerType: 'converted' };
      req.user = null;

      await updateCustomer(req as Request, res as Response);

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
        req.body = { customerType: 'converted' };

      // 模拟错误
      const originalUpdateCustomer = updateCustomer;
      (updateCustomer as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await updateCustomer(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (updateCustomer as jest.Mock).mockImplementation(originalUpdateCustomer);
    });
  });
});