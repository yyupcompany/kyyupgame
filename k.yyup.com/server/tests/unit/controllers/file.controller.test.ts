// Mock dependencies
jest.mock('../../../src/utils/apiResponse');
jest.mock('../../../src/utils/param-validator');
jest.mock('multer');
jest.mock('path');
jest.mock('fs');

import { Request, Response } from 'express';
import { vi } from 'vitest'
import { FileController } from '../../../src/controllers/file.controller';
import { ApiResponse } from '../../../src/utils/apiResponse';
import { parseId, parsePage, parsePageSize, parseBoolean } from '../../../src/utils/param-validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Mock implementations
const mockApiResponse = {
  success: jest.fn(),
  error: jest.fn()
};

const mockParamValidator = {
  parseId: jest.fn(),
  parsePage: jest.fn(),
  parsePageSize: jest.fn(),
  parseBoolean: jest.fn()
};

const mockMulter = {
  diskStorage: jest.fn(),
  single: jest.fn(),
  array: jest.fn()
};

const mockPath = {
  join: jest.fn(),
  extname: jest.fn(),
  basename: jest.fn(),
  dirname: jest.fn()
};

const mockFs = {
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  unlinkSync: jest.fn(),
  statSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn()
};

// Setup mocks
(ApiResponse.success as any) = mockApiResponse.success;
(ApiResponse.error as any) = mockApiResponse.error;
(parseId as any) = mockParamValidator.parseId;
(parsePage as any) = mockParamValidator.parsePage;
(parsePageSize as any) = mockParamValidator.parsePageSize;
(parseBoolean as any) = mockParamValidator.parseBoolean;
(multer as any) = mockMulter;
(multer.diskStorage as any) = mockMulter.diskStorage;
(path.join as any) = mockPath.join;
(path.extname as any) = mockPath.extname;
(path.basename as any) = mockPath.basename;
(path.dirname as any) = mockPath.dirname;
(fs.existsSync as any) = mockFs.existsSync;
(fs.mkdirSync as any) = mockFs.mkdirSync;
(fs.unlinkSync as any) = mockFs.unlinkSync;
(fs.statSync as any) = mockFs.statSync;
(fs.readFileSync as any) = mockFs.readFileSync;
(fs.writeFileSync as any) = mockFs.writeFileSync;

const mockRequest = () => ({
  body: {},
  query: {},
  params: {},
  user: { id: 1, username: 'testuser' },
  file: undefined,
  files: undefined
} as Partial<Request>);

const mockResponse = () => {
  const res = {} as Partial<Response>;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.sendFile = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res;
};


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

describe('File Controller', () => {
  let fileController: FileController;

  beforeEach(() => {
    jest.clearAllMocks();
    fileController = new FileController();
    
    // Setup default mock returns
    mockPath.join.mockReturnValue('/uploads/test.jpg');
    mockPath.extname.mockReturnValue('.jpg');
    mockPath.basename.mockReturnValue('test.jpg');
    mockPath.dirname.mockReturnValue('/uploads');
    mockFs.existsSync.mockReturnValue(true);
  });

  describe('uploadSingle', () => {
    it('应该成功上传单个文件', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.file = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: '/uploads',
        filename: 'test-123.jpg',
        path: '/uploads/test-123.jpg',
        size: 1024000
      } as Express.Multer.File;

      req.body = {
        module: 'avatar',
        isPublic: 'true',
        referenceType: 'user',
        referenceId: '1'
      };

      const mockCreatedFile = {
        id: 1,
        fileName: 'test-123.jpg',
        originalName: 'test.jpg',
        filePath: '/uploads/test-123.jpg',
        fileSize: 1024000,
        fileType: 'image/jpeg',
        storageType: 'local',
        accessUrl: '/api/files/1/download',
        isPublic: true,
        uploaderId: 1,
        uploaderType: 'user',
        module: 'avatar',
        referenceId: '1',
        referenceType: 'user',
        createdAt: new Date()
      };

      mockParamValidator.parseBoolean.mockReturnValue(true);
      mockParamValidator.parseId.mockReturnValue(1);

      // Mock the internal fileService.create method
      const mockFileService = {
        create: jest.fn().mockResolvedValue(mockCreatedFile)
      };
      (fileController as any).fileService = mockFileService;

      await fileController.uploadSingle(req as Request, res as Response);

      expect(mockFileService.create).toHaveBeenCalledWith({
        fileName: 'test-123.jpg',
        originalName: 'test.jpg',
        filePath: '/uploads/test-123.jpg',
        fileSize: 1024000,
        fileType: 'image/jpeg',
        storageType: 'local',
        accessUrl: '/api/files/1/download',
        isPublic: true,
        uploaderId: 1,
        uploaderType: 'user',
        module: 'avatar',
        referenceId: '1',
        referenceType: 'user'
      });
      expect(mockApiResponse.success).toHaveBeenCalledWith(res, mockCreatedFile, '文件上传成功');
    });

    it('应该处理没有文件的情况', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      // req.file 为 undefined

      await fileController.uploadSingle(req as Request, res as Response);

      expect(mockApiResponse.error).toHaveBeenCalledWith(res, '没有文件被上传', 'NO_FILE_UPLOADED', 400);
    });

    it('应该处理文件大小超限', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.file = {
        fieldname: 'file',
        originalname: 'large.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: '/uploads',
        filename: 'large-123.jpg',
        path: '/uploads/large-123.jpg',
        size: 50 * 1024 * 1024 // 50MB
      } as Express.Multer.File;

      await fileController.uploadSingle(req as Request, res as Response);

      expect(mockApiResponse.error).toHaveBeenCalledWith(res, '文件大小超过限制', 'FILE_TOO_LARGE', 400);
    });

    it('应该处理不支持的文件类型', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.file = {
        fieldname: 'file',
        originalname: 'test.exe',
        encoding: '7bit',
        mimetype: 'application/x-msdownload',
        destination: '/uploads',
        filename: 'test-123.exe',
        path: '/uploads/test-123.exe',
        size: 1024
      } as Express.Multer.File;

      await fileController.uploadSingle(req as Request, res as Response);

      expect(mockApiResponse.error).toHaveBeenCalledWith(res, '不支持的文件类型', 'UNSUPPORTED_FILE_TYPE', 400);
    });

    it('应该处理上传失败', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.file = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: '/uploads',
        filename: 'test-123.jpg',
        path: '/uploads/test-123.jpg',
        size: 1024
      } as Express.Multer.File;

      const mockFileService = {
        create: jest.fn().mockRejectedValue(new Error('Database error'))
      };
      (fileController as any).fileService = mockFileService;

      await fileController.uploadSingle(req as Request, res as Response);

      expect(mockApiResponse.error).toHaveBeenCalledWith(res, '文件上传失败', 'UPLOAD_FAILED', 500);
    });
  });

  describe('uploadMultiple', () => {
    it('应该成功上传多个文件', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.files = [
        {
          fieldname: 'files',
          originalname: 'test1.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          destination: '/uploads',
          filename: 'test1-123.jpg',
          path: '/uploads/test1-123.jpg',
          size: 1024
        },
        {
          fieldname: 'files',
          originalname: 'test2.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          destination: '/uploads',
          filename: 'test2-123.jpg',
          path: '/uploads/test2-123.jpg',
          size: 2048
        }
      ] as Express.Multer.File[];

      const mockCreatedFiles = [
        {
          id: 1,
          fileName: 'test1-123.jpg',
          originalName: 'test1.jpg',
          fileSize: 1024
        },
        {
          id: 2,
          fileName: 'test2-123.jpg',
          originalName: 'test2.jpg',
          fileSize: 2048
        }
      ];

      const mockFileService = {
        create: jest.fn()
          .mockResolvedValueOnce(mockCreatedFiles[0])
          .mockResolvedValueOnce(mockCreatedFiles[1])
      };
      (fileController as any).fileService = mockFileService;

      await fileController.uploadMultiple(req as Request, res as Response);

      expect(mockFileService.create).toHaveBeenCalledTimes(2);
      expect(mockApiResponse.success).toHaveBeenCalledWith(res, mockCreatedFiles, '文件上传成功');
    });

    it('应该处理没有文件的情况', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.files = [];

      await fileController.uploadMultiple(req as Request, res as Response);

      expect(mockApiResponse.error).toHaveBeenCalledWith(res, '没有文件被上传', 'NO_FILES_UPLOADED', 400);
    });

    it('应该处理部分文件上传失败', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.files = [
        {
          fieldname: 'files',
          originalname: 'test1.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          destination: '/uploads',
          filename: 'test1-123.jpg',
          path: '/uploads/test1-123.jpg',
          size: 1024
        },
        {
          fieldname: 'files',
          originalname: 'test2.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          destination: '/uploads',
          filename: 'test2-123.jpg',
          path: '/uploads/test2-123.jpg',
          size: 2048
        }
      ] as Express.Multer.File[];

      const mockFileService = {
        create: jest.fn()
          .mockResolvedValueOnce({ id: 1, fileName: 'test1-123.jpg' })
          .mockRejectedValueOnce(new Error('Upload failed'))
      };
      (fileController as any).fileService = mockFileService;

      await fileController.uploadMultiple(req as Request, res as Response);

      expect(mockApiResponse.success).toHaveBeenCalledWith(res, {
        successful: [{ id: 1, fileName: 'test1-123.jpg' }],
        failed: [{ file: 'test2.jpg', error: 'Upload failed' }]
      }, '部分文件上传成功');
    });
  });

  describe('getFileList', () => {
    it('应该成功获取文件列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        page: '1',
        pageSize: '10',
        module: 'avatar',
        fileType: 'image',
        keyword: 'test',
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      };

      const mockFileList = {
        data: [
          {
            id: 1,
            fileName: 'test1.jpg',
            originalName: 'test1.jpg',
            fileSize: 1024,
            fileType: 'image/jpeg',
            createdAt: new Date()
          },
          {
            id: 2,
            fileName: 'test2.jpg',
            originalName: 'test2.jpg',
            fileSize: 2048,
            fileType: 'image/jpeg',
            createdAt: new Date()
          }
        ],
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1
      };

      mockParamValidator.parsePage.mockReturnValue(1);
      mockParamValidator.parsePageSize.mockReturnValue(10);

      const mockFileService = {
        getList: jest.fn().mockResolvedValue(mockFileList)
      };
      (fileController as any).fileService = mockFileService;

      await fileController.getFileList(req as Request, res as Response);

      expect(mockFileService.getList).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        module: 'avatar',
        fileType: 'image',
        keyword: 'test',
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      });
      expect(mockApiResponse.success).toHaveBeenCalledWith(res, mockFileList);
    });

    it('应该使用默认查询参数', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const mockEmptyList = {
        data: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0
      };

      mockParamValidator.parsePage.mockReturnValue(1);
      mockParamValidator.parsePageSize.mockReturnValue(20);

      const mockFileService = {
        getList: jest.fn().mockResolvedValue(mockEmptyList)
      };
      (fileController as any).fileService = mockFileService;

      await fileController.getFileList(req as Request, res as Response);

      expect(mockFileService.getList).toHaveBeenCalledWith({
        page: 1,
        pageSize: 20,
        module: undefined,
        fileType: undefined,
        keyword: undefined,
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      });
    });

    it('应该处理获取列表失败', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const mockFileService = {
        getList: jest.fn().mockRejectedValue(new Error('Database error'))
      };
      (fileController as any).fileService = mockFileService;

      await fileController.getFileList(req as Request, res as Response);

      expect(mockApiResponse.error).toHaveBeenCalledWith(res, '获取文件列表失败', 'GET_LIST_FAILED', 500);
    });
  });

  describe('downloadFile', () => {
    it('应该成功下载文件', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      const mockFile = {
        id: 1,
        fileName: 'test.jpg',
        originalName: 'test.jpg',
        filePath: '/uploads/test.jpg',
        fileType: 'image/jpeg',
        isPublic: true
      };

      mockParamValidator.parseId.mockReturnValue(1);
      mockFs.existsSync.mockReturnValue(true);

      const mockFileService = {
        getById: jest.fn().mockResolvedValue(mockFile)
      };
      (fileController as any).fileService = mockFileService;

      await fileController.downloadFile(req as Request, res as Response);

      expect(mockFileService.getById).toHaveBeenCalledWith(1);
      expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="test.jpg"');
      expect(res.sendFile).toHaveBeenCalledWith('/uploads/test.jpg');
    });

    it('应该处理文件不存在', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '999' };

      mockParamValidator.parseId.mockReturnValue(999);

      const mockFileService = {
        getById: jest.fn().mockResolvedValue(null)
      };
      (fileController as any).fileService = mockFileService;

      await fileController.downloadFile(req as Request, res as Response);

      expect(mockApiResponse.error).toHaveBeenCalledWith(res, '文件不存在', 'FILE_NOT_FOUND', 404);
    });

    it('应该处理物理文件不存在', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      const mockFile = {
        id: 1,
        fileName: 'test.jpg',
        filePath: '/uploads/test.jpg'
      };

      mockParamValidator.parseId.mockReturnValue(1);
      mockFs.existsSync.mockReturnValue(false);

      const mockFileService = {
        getById: jest.fn().mockResolvedValue(mockFile)
      };
      (fileController as any).fileService = mockFileService;

      await fileController.downloadFile(req as Request, res as Response);

      expect(mockApiResponse.error).toHaveBeenCalledWith(res, '文件不存在', 'PHYSICAL_FILE_NOT_FOUND', 404);
    });

    it('应该处理无效的文件ID', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: 'invalid' };

      mockParamValidator.parseId.mockReturnValue(null);

      await fileController.downloadFile(req as Request, res as Response);

      expect(mockApiResponse.error).toHaveBeenCalledWith(res, '无效的文件ID', 'INVALID_FILE_ID', 400);
    });
  });

  describe('deleteFile', () => {
    it('应该成功删除文件', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      const mockFile = {
        id: 1,
        fileName: 'test.jpg',
        filePath: '/uploads/test.jpg'
      };

      mockParamValidator.parseId.mockReturnValue(1);
      mockFs.existsSync.mockReturnValue(true);

      const mockFileService = {
        getById: jest.fn().mockResolvedValue(mockFile),
        delete: jest.fn().mockResolvedValue(undefined)
      };
      (fileController as any).fileService = mockFileService;

      await fileController.deleteFile(req as Request, res as Response);

      expect(mockFileService.getById).toHaveBeenCalledWith(1);
      expect(mockFs.unlinkSync).toHaveBeenCalledWith('/uploads/test.jpg');
      expect(mockFileService.delete).toHaveBeenCalledWith(1);
      expect(mockApiResponse.success).toHaveBeenCalledWith(res, null, '文件删除成功');
    });

    it('应该处理删除不存在的文件', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '999' };

      mockParamValidator.parseId.mockReturnValue(999);

      const mockFileService = {
        getById: jest.fn().mockResolvedValue(null)
      };
      (fileController as any).fileService = mockFileService;

      await fileController.deleteFile(req as Request, res as Response);

      expect(mockApiResponse.error).toHaveBeenCalledWith(res, '文件不存在', 'FILE_NOT_FOUND', 404);
    });

    it('应该处理物理文件删除失败', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      const mockFile = {
        id: 1,
        fileName: 'test.jpg',
        filePath: '/uploads/test.jpg'
      };

      mockParamValidator.parseId.mockReturnValue(1);
      mockFs.existsSync.mockReturnValue(true);
      mockFs.unlinkSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const mockFileService = {
        getById: jest.fn().mockResolvedValue(mockFile)
      };
      (fileController as any).fileService = mockFileService;

      await fileController.deleteFile(req as Request, res as Response);

      expect(mockApiResponse.error).toHaveBeenCalledWith(res, '删除文件失败', 'DELETE_FAILED', 500);
    });
  });
});
