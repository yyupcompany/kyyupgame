// Mock dependencies
jest.mock('../../../src/controllers/kindergarten-basic-info.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { getBasicInfo } from '../../../src/controllers/kindergarten-basic-info.controller';
import { updateBasicInfo } from '../../../src/controllers/kindergarten-basic-info.controller';
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

describe('Kindergarten Basic Info Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBasicInfo', () => {
    it('应该成功获取基本信息', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      
      

      await getBasicInfo(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    

    

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      
      

      // 模拟错误
      const originalGetBasicInfo = getBasicInfo;
      (getBasicInfo as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getBasicInfo(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getBasicInfo as jest.Mock).mockImplementation(originalGetBasicInfo);
    });
  });
  describe('updateBasicInfo', () => {
    it('应该成功更新基本信息', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          name: '阳光幼儿园',
          address: '北京市朝阳区',
          phone: '010-12345678'
        };

      await updateBasicInfo(req as Request, res as Response);

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
          name: '阳光幼儿园',
          address: '北京市朝阳区',
          phone: '010-12345678'
        };
      req.user = null;

      await updateBasicInfo(req as Request, res as Response);

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
          name: '阳光幼儿园',
          address: '北京市朝阳区',
          phone: '010-12345678'
        };

      // 模拟错误
      const originalUpdateBasicInfo = updateBasicInfo;
      (updateBasicInfo as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await updateBasicInfo(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (updateBasicInfo as jest.Mock).mockImplementation(originalUpdateBasicInfo);
    });
  });
});