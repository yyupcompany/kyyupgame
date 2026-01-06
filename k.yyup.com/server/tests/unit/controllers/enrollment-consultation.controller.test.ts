// Mock dependencies
jest.mock('../../../src/controllers/enrollment-consultation.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { createConsultation } from '../../../src/controllers/enrollment-consultation.controller';
import { getConsultations } from '../../../src/controllers/enrollment-consultation.controller';
import { updateConsultation } from '../../../src/controllers/enrollment-consultation.controller';
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

describe('Enrollment Consultation Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createConsultation', () => {
    it('应该成功创建咨询', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          parentId: 1,
          studentName: '小明',
          contactPhone: '13800138000',
          consultationTime: new Date()
        };

      await createConsultation(req as Request, res as Response);

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
          parentId: 1,
          studentName: '小明',
          contactPhone: '13800138000',
          consultationTime: new Date()
        };
      req.user = null;

      await createConsultation(req as Request, res as Response);

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
          parentId: 1,
          studentName: '小明',
          contactPhone: '13800138000',
          consultationTime: new Date()
        };

      // 模拟错误
      const originalCreateConsultation = createConsultation;
      (createConsultation as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await createConsultation(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (createConsultation as jest.Mock).mockImplementation(originalCreateConsultation);
    });
  });
  describe('getConsultations', () => {
    it('应该成功获取咨询列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { page: '1', limit: '10' };

      await getConsultations(req as Request, res as Response);

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

      await getConsultations(req as Request, res as Response);

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
      const originalGetConsultations = getConsultations;
      (getConsultations as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getConsultations(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getConsultations as jest.Mock).mockImplementation(originalGetConsultations);
    });
  });
  describe('updateConsultation', () => {
    it('应该成功更新咨询', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.params = { id: '1' };
        req.body = { status: 'completed' };

      await updateConsultation(req as Request, res as Response);

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
        req.body = { status: 'completed' };
      req.user = null;

      await updateConsultation(req as Request, res as Response);

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
        req.body = { status: 'completed' };

      // 模拟错误
      const originalUpdateConsultation = updateConsultation;
      (updateConsultation as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await updateConsultation(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (updateConsultation as jest.Mock).mockImplementation(originalUpdateConsultation);
    });
  });
});