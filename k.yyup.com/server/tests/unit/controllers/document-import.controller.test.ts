// Mock dependencies
jest.mock('../../../src/controllers/document-import.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { uploadDocument } from '../../../src/controllers/document-import.controller';
import { processDocument } from '../../../src/controllers/document-import.controller';
import { getDocuments } from '../../../src/controllers/document-import.controller';
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

describe('Document Import Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadDocument', () => {
    it('应该成功上传文档', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.file = {
          originalname: 'document.pdf',
          buffer: Buffer.from('test'),
          mimetype: 'application/pdf'
        };

      await uploadDocument(req as Request, res as Response);

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
          originalname: 'document.pdf',
          buffer: Buffer.from('test'),
          mimetype: 'application/pdf'
        };
      req.user = null;

      await uploadDocument(req as Request, res as Response);

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
          originalname: 'document.pdf',
          buffer: Buffer.from('test'),
          mimetype: 'application/pdf'
        };

      // 模拟错误
      const originalUploadDocument = uploadDocument;
      (uploadDocument as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await uploadDocument(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (uploadDocument as jest.Mock).mockImplementation(originalUploadDocument);
    });
  });
  describe('processDocument', () => {
    it('应该成功处理文档', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.params = { id: '1' };
        req.body = { extractText: true };

      await processDocument(req as Request, res as Response);

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
        req.body = { extractText: true };
      req.user = null;

      await processDocument(req as Request, res as Response);

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
        req.body = { extractText: true };

      // 模拟错误
      const originalProcessDocument = processDocument;
      (processDocument as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await processDocument(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (processDocument as jest.Mock).mockImplementation(originalProcessDocument);
    });
  });
  describe('getDocuments', () => {
    it('应该成功获取文档列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { page: '1', limit: '10' };

      await getDocuments(req as Request, res as Response);

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

      await getDocuments(req as Request, res as Response);

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
      const originalGetDocuments = getDocuments;
      (getDocuments as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getDocuments(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getDocuments as jest.Mock).mockImplementation(originalGetDocuments);
    });
  });
});