// Mock dependencies
jest.mock('../../../src/controllers/activity-template.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { createTemplate } from '../../../src/controllers/activity-template.controller';
import { getTemplates } from '../../../src/controllers/activity-template.controller';
import { getTemplateById } from '../../../src/controllers/activity-template.controller';
import { updateTemplate } from '../../../src/controllers/activity-template.controller';
import { deleteTemplate } from '../../../src/controllers/activity-template.controller';
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

describe('Activity Template Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTemplate', () => {
    it('应该成功创建活动模板', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          name: '亲子活动模板',
          description: '标准亲子活动模板'
        };

      await createTemplate(req as Request, res as Response);

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
          name: '亲子活动模板',
          description: '标准亲子活动模板'
        };
      req.user = null;

      await createTemplate(req as Request, res as Response);

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
          name: '亲子活动模板',
          description: '标准亲子活动模板'
        };

      // 模拟错误
      const originalCreateTemplate = createTemplate;
      (createTemplate as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await createTemplate(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (createTemplate as jest.Mock).mockImplementation(originalCreateTemplate);
    });
  });
  describe('getTemplates', () => {
    it('应该成功获取模板列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      
      req.query = { page: '1', limit: '10' };

      await getTemplates(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    

    

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      
      req.query = { page: '1', limit: '10' };

      // 模拟错误
      const originalGetTemplates = getTemplates;
      (getTemplates as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getTemplates(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getTemplates as jest.Mock).mockImplementation(originalGetTemplates);
    });
  });
  describe('getTemplateById', () => {
    it('应该成功获取模板详情', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      
      req.params = { id: '1' };

      await getTemplateById(req as Request, res as Response);

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
      const originalGetTemplateById = getTemplateById;
      (getTemplateById as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getTemplateById(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getTemplateById as jest.Mock).mockImplementation(originalGetTemplateById);
    });
  });
  describe('updateTemplate', () => {
    it('应该成功更新模板', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.params = { id: '1' };
        req.body = { name: '更新后的模板' };

      await updateTemplate(req as Request, res as Response);

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
        req.body = { name: '更新后的模板' };
      req.user = null;

      await updateTemplate(req as Request, res as Response);

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
        req.body = { name: '更新后的模板' };

      // 模拟错误
      const originalUpdateTemplate = updateTemplate;
      (updateTemplate as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await updateTemplate(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (updateTemplate as jest.Mock).mockImplementation(originalUpdateTemplate);
    });
  });
  describe('deleteTemplate', () => {
    it('应该成功删除模板', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.params = { id: '1' };

      await deleteTemplate(req as Request, res as Response);

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

      await deleteTemplate(req as Request, res as Response);

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
      const originalDeleteTemplate = deleteTemplate;
      (deleteTemplate as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await deleteTemplate(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (deleteTemplate as jest.Mock).mockImplementation(originalDeleteTemplate);
    });
  });
});