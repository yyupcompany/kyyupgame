// Mock dependencies
jest.mock('../../../src/controllers/poster-upload.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { uploadPoster } from '../../../src/controllers/poster-upload.controller';
import { getPosters } from '../../../src/controllers/poster-upload.controller';
import { deletePoster } from '../../../src/controllers/poster-upload.controller';
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

describe('Poster Upload Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadPoster', () => {
    it('应该成功上传海报', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.file = {
          originalname: 'poster.jpg',
          buffer: Buffer.from('test'),
          mimetype: 'image/jpeg'
        };
        req.body = { title: '活动海报' };

      await uploadPoster(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.file = {
          originalname: 'poster.jpg',
          buffer: Buffer.from('test'),
          mimetype: 'image/jpeg'
        };
        req.body = { title: '活动海报' };
      req.user = null;

      await uploadPoster(req as Request, res as Response);

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
      req.file = {
          originalname: 'poster.jpg',
          buffer: Buffer.from('test'),
          mimetype: 'image/jpeg'
        };
        req.body = { title: '活动海报' };

      // 模拟错误
      const originalUploadPoster = uploadPoster;
      (uploadPoster as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await uploadPoster(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (uploadPoster as jest.Mock).mockImplementation(originalUploadPoster);
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