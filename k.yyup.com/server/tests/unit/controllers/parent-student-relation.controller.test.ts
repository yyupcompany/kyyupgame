// Mock dependencies
jest.mock('../../../src/controllers/parent-student-relation.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { createRelation } from '../../../src/controllers/parent-student-relation.controller';
import { getRelations } from '../../../src/controllers/parent-student-relation.controller';
import { updateRelation } from '../../../src/controllers/parent-student-relation.controller';
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

describe('Parent Student Relation Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createRelation', () => {
    it('应该成功创建家长学生关系', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          parentId: 1,
          studentId: 1,
          relationship: '父亲'
        };

      await createRelation(req as Request, res as Response);

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
          studentId: 1,
          relationship: '父亲'
        };
      req.user = null;

      await createRelation(req as Request, res as Response);

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
          studentId: 1,
          relationship: '父亲'
        };

      // 模拟错误
      const originalCreateRelation = createRelation;
      (createRelation as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await createRelation(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (createRelation as jest.Mock).mockImplementation(originalCreateRelation);
    });
  });
  describe('getRelations', () => {
    it('应该成功获取关系列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { parentId: '1' };

      await getRelations(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = { parentId: '1' };
      req.user = null;

      await getRelations(req as Request, res as Response);

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
      req.query = { parentId: '1' };

      // 模拟错误
      const originalGetRelations = getRelations;
      (getRelations as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getRelations(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getRelations as jest.Mock).mockImplementation(originalGetRelations);
    });
  });
  describe('updateRelation', () => {
    it('应该成功更新关系', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.params = { id: '1' };
        req.body = { relationship: '母亲' };

      await updateRelation(req as Request, res as Response);

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
        req.body = { relationship: '母亲' };
      req.user = null;

      await updateRelation(req as Request, res as Response);

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
        req.body = { relationship: '母亲' };

      // 模拟错误
      const originalUpdateRelation = updateRelation;
      (updateRelation as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await updateRelation(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (updateRelation as jest.Mock).mockImplementation(originalUpdateRelation);
    });
  });
});