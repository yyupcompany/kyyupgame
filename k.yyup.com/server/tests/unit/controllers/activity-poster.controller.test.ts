// Mock dependencies
jest.mock('../../../src/controllers/activity-poster.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { createPoster } from '../../../src/controllers/activity-poster.controller';
import { getPosters } from '../../../src/controllers/activity-poster.controller';
import { getPosterById } from '../../../src/controllers/activity-poster.controller';
import { updatePoster } from '../../../src/controllers/activity-poster.controller';
import { deletePoster } from '../../../src/controllers/activity-poster.controller';
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

describe('Activity Poster Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPoster', () => {
    it('应该成功创建活动海报', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          title: '活动海报',
          description: '海报描述',
          imageUrl: 'http://example.com/image.jpg'
        };

      await createPoster(req as Request, res as Response);

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
          title: '活动海报',
          description: '海报描述',
          imageUrl: 'http://example.com/image.jpg'
        };
      req.user = null;

      await createPoster(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 401
      });
    });

    
    it('应该验证标题不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
              // 缺少title
              description: '海报描述',
              imageUrl: 'http://example.com/image.jpg'
            };

      await createPoster(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: '标题不能为空',
        statusCode: 400
      });
    });

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          title: '活动海报',
          description: '海报描述',
          imageUrl: 'http://example.com/image.jpg'
        };

      // 模拟错误
      const originalCreatePoster = createPoster;
      (createPoster as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await createPoster(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (createPoster as jest.Mock).mockImplementation(originalCreatePoster);
    });
  });
  describe('getPosters', () => {
    it('应该成功获取海报列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      
      req.query = { page: '1', limit: '10' };

      await getPosters(req as Request, res as Response);

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
      const originalGetPosters = getPosters;
      (getPosters as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getPosters(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getPosters as jest.Mock).mockImplementation(originalGetPosters);
    });
  });
  describe('getPosterById', () => {
    it('应该成功获取海报详情', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      
      req.params = { id: '1' };

      await getPosterById(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    

    
    it('应该验证ID不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      
      req.params = {};

      await getPosterById(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: '海报ID不能为空',
        statusCode: 400
      });
    });

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      
      req.params = { id: '1' };

      // 模拟错误
      const originalGetPosterById = getPosterById;
      (getPosterById as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getPosterById(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getPosterById as jest.Mock).mockImplementation(originalGetPosterById);
    });
  });
  describe('updatePoster', () => {
    it('应该成功更新海报', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.params = { id: '1' };
        req.body = { title: '更新后的海报' };

      await updatePoster(req as Request, res as Response);

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
        req.body = { title: '更新后的海报' };
      req.user = null;

      await updatePoster(req as Request, res as Response);

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
        req.body = { title: '更新后的海报' };

      // 模拟错误
      const originalUpdatePoster = updatePoster;
      (updatePoster as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await updatePoster(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (updatePoster as jest.Mock).mockImplementation(originalUpdatePoster);
    });
  });
  describe('deletePoster', () => {
    it('应该成功删除海报', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.params = { id: '1' };

      await deletePoster(req as Request, res as Response);

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

      await deletePoster(req as Request, res as Response);

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
      const originalDeletePoster = deletePoster;
      (deletePoster as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await deletePoster(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (deletePoster as jest.Mock).mockImplementation(originalDeletePoster);
    });
  });
});