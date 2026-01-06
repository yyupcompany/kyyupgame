import { jest } from '@jest/globals';
import { vi } from 'vitest'
import { Request, Response } from 'express';
import multer from 'multer';

// Mock services
const mockStorageService = {
  upload: jest.fn(),
  uploadMultiple: jest.fn(),
  delete: jest.fn(),
  getUrl: jest.fn(),
  exists: jest.fn(),
  getMetadata: jest.fn(),
  resize: jest.fn(),
  compress: jest.fn()
};

const mockFileValidationService = {
  validateFile: jest.fn(),
  validateFileType: jest.fn(),
  validateFileSize: jest.fn(),
  scanForVirus: jest.fn(),
  generateThumbnail: jest.fn()
};

const mockConfigService = {
  get: jest.fn(),
  set: jest.fn()
};

const mockLoggerService = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
};

const mockAuditService = {
  log: jest.fn(),
  logFileUpload: jest.fn()
};

const mockUserService = {
  updateStorageUsage: jest.fn(),
  getStorageQuota: jest.fn(),
  checkStorageLimit: jest.fn()
};

// Mock multer
const mockMulter = {
  single: jest.fn(),
  array: jest.fn(),
  fields: jest.fn(),
  any: jest.fn(),
  none: jest.fn()
};

// Mock imports
jest.unstable_mockModule('../../../../../src/services/storage.service', () => mockStorageService);
jest.unstable_mockModule('../../../../../src/services/file-validation.service', () => mockFileValidationService);
jest.unstable_mockModule('../../../../../src/services/config.service', () => mockConfigService);
jest.unstable_mockModule('../../../../../src/services/logger.service', () => mockLoggerService);
jest.unstable_mockModule('../../../../../src/services/audit.service', () => mockAuditService);
jest.unstable_mockModule('../../../../../src/services/user.service', () => mockUserService);
jest.unstable_mockModule('multer', () => mockMulter);

// Mock request and response objects
const createMockRequest = (overrides = {}): Partial<Request> => ({
  user: {
    id: 1,
    email: 'user@example.com',
    role: 'teacher',
    storageUsed: 1024 * 1024 * 50, // 50MB
    storageQuota: 1024 * 1024 * 500 // 500MB
  },
  file: {
    fieldname: 'file',
    originalname: 'test-image.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024 * 100, // 100KB
    buffer: Buffer.from('fake image data'),
    destination: '/tmp/uploads',
    filename: 'test-image-123.jpg',
    path: '/tmp/uploads/test-image-123.jpg'
  } as Express.Multer.File,
  files: [],
  body: {},
  query: {},
  params: {},
  headers: {},
  ...overrides
});

const createMockResponse = (): Partial<Response> => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
  download: jest.fn().mockReturnThis(),
  setHeader: jest.fn().mockReturnThis()
});


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

describe('Upload Controller', () => {
  let uploadController: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/controllers/upload.controller');
    uploadController = imported.UploadController;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockConfigService.get.mockImplementation((key) => {
      const config = {
        'upload.maxFileSize': 10 * 1024 * 1024, // 10MB
        'upload.allowedTypes': ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'],
        'upload.storage.type': 'local',
        'upload.storage.path': '/uploads',
        'upload.virus.scan': true,
        'upload.thumbnail.enabled': true,
        'upload.compression.enabled': true,
        'upload.quota.enabled': true,
        'upload.quota.default': 500 * 1024 * 1024, // 500MB
        'upload.watermark.enabled': false
      };
      return config[key];
    });

    mockFileValidationService.validateFile.mockResolvedValue({ isValid: true });
    mockFileValidationService.scanForVirus.mockResolvedValue({ isClean: true });
    mockStorageService.upload.mockResolvedValue({
      url: '/uploads/test-image-123.jpg',
      path: '/uploads/test-image-123.jpg',
      size: 1024 * 100,
      mimetype: 'image/jpeg'
    });
    mockUserService.checkStorageLimit.mockResolvedValue({ withinLimit: true });
  });

  describe('uploadSingle', () => {
    it('应该上传单个文件', async () => {
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;

      const mockUploadResult = {
        id: 'file_123',
        originalName: 'test-image.jpg',
        filename: 'test-image-123.jpg',
        url: '/uploads/test-image-123.jpg',
        size: 1024 * 100,
        mimetype: 'image/jpeg',
        uploadedAt: new Date(),
        uploadedBy: 1
      };

      mockStorageService.upload.mockResolvedValue(mockUploadResult);

      await uploadController.uploadSingle(req, res);

      expect(mockFileValidationService.validateFile).toHaveBeenCalledWith(req.file);
      expect(mockStorageService.upload).toHaveBeenCalledWith(req.file, expect.any(Object));
      expect(mockAuditService.logFileUpload).toHaveBeenCalledWith({
        userId: 1,
        filename: 'test-image.jpg',
        size: 1024 * 100,
        mimetype: 'image/jpeg'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUploadResult,
        message: '文件上传成功'
      });
    });

    it('应该处理文件验证失败', async () => {
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;

      mockFileValidationService.validateFile.mockResolvedValue({
        isValid: false,
        errors: ['文件类型不支持', '文件大小超出限制']
      });

      await uploadController.uploadSingle(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: '文件验证失败',
        details: ['文件类型不支持', '文件大小超出限制']
      });
    });

    it('应该处理病毒扫描失败', async () => {
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;

      mockFileValidationService.scanForVirus.mockResolvedValue({
        isClean: false,
        threat: 'Trojan.Generic'
      });

      await uploadController.uploadSingle(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: '文件安全检查失败',
        message: '检测到恶意软件，文件已被拒绝'
      });

      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        '文件病毒扫描失败',
        expect.objectContaining({
          filename: 'test-image.jpg',
          threat: 'Trojan.Generic'
        })
      );
    });

    it('应该处理存储配额超限', async () => {
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;

      mockUserService.checkStorageLimit.mockResolvedValue({
        withinLimit: false,
        used: 1024 * 1024 * 490, // 490MB
        quota: 1024 * 1024 * 500, // 500MB
        remaining: 1024 * 1024 * 10 // 10MB
      });

      await uploadController.uploadSingle(req, res);

      expect(res.status).toHaveBeenCalledWith(413);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: '存储配额不足',
        message: '文件大小超出剩余存储空间',
        quota: {
          used: 1024 * 1024 * 490,
          total: 1024 * 1024 * 500,
          remaining: 1024 * 1024 * 10
        }
      });
    });

    it('应该处理没有文件的情况', async () => {
      const req = createMockRequest({ file: undefined }) as Request;
      const res = createMockResponse() as Response;

      await uploadController.uploadSingle(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: '没有文件',
        message: '请选择要上传的文件'
      });
    });

    it('应该支持图片压缩', async () => {
      const req = createMockRequest({
        file: {
          ...createMockRequest().file,
          mimetype: 'image/jpeg',
          size: 1024 * 1024 * 5 // 5MB
        } as Express.Multer.File,
        body: { compress: true }
      }) as Request;
      const res = createMockResponse() as Response;

      mockStorageService.compress.mockResolvedValue({
        originalSize: 1024 * 1024 * 5,
        compressedSize: 1024 * 1024 * 2,
        compressionRatio: 0.6
      });

      await uploadController.uploadSingle(req, res);

      expect(mockStorageService.compress).toHaveBeenCalledWith(req.file);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            compression: {
              originalSize: 1024 * 1024 * 5,
              compressedSize: 1024 * 1024 * 2,
              compressionRatio: 0.6
            }
          })
        })
      );
    });

    it('应该支持生成缩略图', async () => {
      const req = createMockRequest({
        file: {
          ...createMockRequest().file,
          mimetype: 'image/jpeg'
        } as Express.Multer.File,
        body: { generateThumbnail: true }
      }) as Request;
      const res = createMockResponse() as Response;

      mockFileValidationService.generateThumbnail.mockResolvedValue({
        thumbnailUrl: '/uploads/thumbnails/test-image-123-thumb.jpg',
        thumbnailSize: 1024 * 10 // 10KB
      });

      await uploadController.uploadSingle(req, res);

      expect(mockFileValidationService.generateThumbnail).toHaveBeenCalledWith(req.file);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            thumbnail: {
              url: '/uploads/thumbnails/test-image-123-thumb.jpg',
              size: 1024 * 10
            }
          })
        })
      );
    });
  });

  describe('uploadMultiple', () => {
    it('应该上传多个文件', async () => {
      const mockFiles = [
        {
          fieldname: 'files',
          originalname: 'image1.jpg',
          mimetype: 'image/jpeg',
          size: 1024 * 50,
          buffer: Buffer.from('image1 data')
        },
        {
          fieldname: 'files',
          originalname: 'image2.png',
          mimetype: 'image/png',
          size: 1024 * 60,
          buffer: Buffer.from('image2 data')
        }
      ] as Express.Multer.File[];

      const req = createMockRequest({
        files: mockFiles
      }) as Request;
      const res = createMockResponse() as Response;

      const mockUploadResults = [
        {
          id: 'file_123',
          originalName: 'image1.jpg',
          url: '/uploads/image1-123.jpg',
          size: 1024 * 50
        },
        {
          id: 'file_124',
          originalName: 'image2.png',
          url: '/uploads/image2-124.png',
          size: 1024 * 60
        }
      ];

      mockStorageService.uploadMultiple.mockResolvedValue({
        successful: mockUploadResults,
        failed: [],
        total: 2
      });

      await uploadController.uploadMultiple(req, res);

      expect(mockStorageService.uploadMultiple).toHaveBeenCalledWith(mockFiles, expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          successful: mockUploadResults,
          failed: [],
          total: 2,
          successCount: 2,
          failureCount: 0
        },
        message: '文件上传完成'
      });
    });

    it('应该处理部分文件上传失败', async () => {
      const mockFiles = [
        {
          originalname: 'valid-image.jpg',
          mimetype: 'image/jpeg',
          size: 1024 * 50
        },
        {
          originalname: 'invalid-file.exe',
          mimetype: 'application/x-executable',
          size: 1024 * 100
        }
      ] as Express.Multer.File[];

      const req = createMockRequest({
        files: mockFiles
      }) as Request;
      const res = createMockResponse() as Response;

      mockStorageService.uploadMultiple.mockResolvedValue({
        successful: [
          {
            id: 'file_123',
            originalName: 'valid-image.jpg',
            url: '/uploads/valid-image-123.jpg'
          }
        ],
        failed: [
          {
            originalName: 'invalid-file.exe',
            error: '文件类型不支持'
          }
        ],
        total: 2
      });

      await uploadController.uploadMultiple(req, res);

      expect(res.status).toHaveBeenCalledWith(207); // Multi-Status
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          successCount: 1,
          failureCount: 1,
          failed: expect.arrayContaining([
            expect.objectContaining({
              originalName: 'invalid-file.exe',
              error: '文件类型不支持'
            })
          ])
        }),
        message: '部分文件上传成功'
      });
    });

    it('应该处理文件数量限制', async () => {
      const mockFiles = Array.from({ length: 15 }, (_, i) => ({
        originalname: `file${i}.jpg`,
        mimetype: 'image/jpeg',
        size: 1024 * 50
      })) as Express.Multer.File[];

      const req = createMockRequest({
        files: mockFiles
      }) as Request;
      const res = createMockResponse() as Response;

      // 假设最大文件数量限制为10
      mockConfigService.get.mockImplementation((key) => {
        if (key === 'upload.maxFiles') return 10;
        return null;
      });

      await uploadController.uploadMultiple(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: '文件数量超出限制',
        message: '最多只能上传10个文件',
        limit: 10,
        received: 15
      });
    });
  });

  describe('uploadAvatar', () => {
    it('应该上传用户头像', async () => {
      const req = createMockRequest({
        file: {
          ...createMockRequest().file,
          mimetype: 'image/jpeg',
          originalname: 'avatar.jpg'
        } as Express.Multer.File
      }) as Request;
      const res = createMockResponse() as Response;

      const mockAvatarResult = {
        id: 'avatar_123',
        url: '/uploads/avatars/user-1-avatar.jpg',
        thumbnailUrl: '/uploads/avatars/user-1-avatar-thumb.jpg',
        size: 1024 * 80
      };

      mockStorageService.upload.mockResolvedValue(mockAvatarResult);
      mockStorageService.resize.mockResolvedValue({
        resizedUrl: '/uploads/avatars/user-1-avatar.jpg',
        thumbnailUrl: '/uploads/avatars/user-1-avatar-thumb.jpg'
      });

      await uploadController.uploadAvatar(req, res);

      expect(mockStorageService.resize).toHaveBeenCalledWith(req.file, {
        width: 200,
        height: 200,
        crop: true
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockAvatarResult,
        message: '头像上传成功'
      });
    });

    it('应该验证头像文件类型', async () => {
      const req = createMockRequest({
        file: {
          ...createMockRequest().file,
          mimetype: 'application/pdf',
          originalname: 'document.pdf'
        } as Express.Multer.File
      }) as Request;
      const res = createMockResponse() as Response;

      await uploadController.uploadAvatar(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: '文件类型不支持',
        message: '头像只支持 JPG、PNG、GIF 格式'
      });
    });

    it('应该删除旧头像', async () => {
      const req = createMockRequest({
        user: {
          ...createMockRequest().user,
          avatar: '/uploads/avatars/old-avatar.jpg'
        },
        file: {
          ...createMockRequest().file,
          mimetype: 'image/jpeg'
        } as Express.Multer.File
      }) as Request;
      const res = createMockResponse() as Response;

      await uploadController.uploadAvatar(req, res);

      expect(mockStorageService.delete).toHaveBeenCalledWith('/uploads/avatars/old-avatar.jpg');
    });
  });

  describe('deleteFile', () => {
    it('应该删除文件', async () => {
      const req = createMockRequest({
        params: { fileId: 'file_123' }
      }) as Request;
      const res = createMockResponse() as Response;

      const mockFileInfo = {
        id: 'file_123',
        filename: 'test-file.jpg',
        path: '/uploads/test-file.jpg',
        uploadedBy: 1
      };

      mockStorageService.getMetadata.mockResolvedValue(mockFileInfo);
      mockStorageService.delete.mockResolvedValue({ deleted: true });

      await uploadController.deleteFile(req, res);

      expect(mockStorageService.getMetadata).toHaveBeenCalledWith('file_123');
      expect(mockStorageService.delete).toHaveBeenCalledWith('/uploads/test-file.jpg');
      expect(mockAuditService.log).toHaveBeenCalledWith({
        action: 'file_delete',
        userId: 1,
        details: { fileId: 'file_123', filename: 'test-file.jpg' }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '文件删除成功'
      });
    });

    it('应该处理文件不存在', async () => {
      const req = createMockRequest({
        params: { fileId: 'nonexistent' }
      }) as Request;
      const res = createMockResponse() as Response;

      mockStorageService.getMetadata.mockResolvedValue(null);

      await uploadController.deleteFile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: '文件不存在'
      });
    });

    it('应该检查删除权限', async () => {
      const req = createMockRequest({
        params: { fileId: 'file_123' },
        user: { id: 2, role: 'teacher' } // 不是文件上传者
      }) as Request;
      const res = createMockResponse() as Response;

      const mockFileInfo = {
        id: 'file_123',
        uploadedBy: 1 // 不同的用户
      };

      mockStorageService.getMetadata.mockResolvedValue(mockFileInfo);

      await uploadController.deleteFile(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: '权限不足',
        message: '只能删除自己上传的文件'
      });
    });

    it('应该允许管理员删除任何文件', async () => {
      const req = createMockRequest({
        params: { fileId: 'file_123' },
        user: { id: 2, role: 'admin' } // 管理员
      }) as Request;
      const res = createMockResponse() as Response;

      const mockFileInfo = {
        id: 'file_123',
        uploadedBy: 1 // 不同的用户
      };

      mockStorageService.getMetadata.mockResolvedValue(mockFileInfo);
      mockStorageService.delete.mockResolvedValue({ deleted: true });

      await uploadController.deleteFile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '文件删除成功'
      });
    });
  });

  describe('getFileInfo', () => {
    it('应该获取文件信息', async () => {
      const req = createMockRequest({
        params: { fileId: 'file_123' }
      }) as Request;
      const res = createMockResponse() as Response;

      const mockFileInfo = {
        id: 'file_123',
        originalName: 'test-image.jpg',
        filename: 'test-image-123.jpg',
        url: '/uploads/test-image-123.jpg',
        size: 1024 * 100,
        mimetype: 'image/jpeg',
        uploadedAt: new Date(),
        uploadedBy: 1,
        downloads: 5,
        lastAccessed: new Date()
      };

      mockStorageService.getMetadata.mockResolvedValue(mockFileInfo);

      await uploadController.getFileInfo(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockFileInfo
      });
    });

    it('应该处理文件不存在', async () => {
      const req = createMockRequest({
        params: { fileId: 'nonexistent' }
      }) as Request;
      const res = createMockResponse() as Response;

      mockStorageService.getMetadata.mockResolvedValue(null);

      await uploadController.getFileInfo(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: '文件不存在'
      });
    });
  });

  describe('downloadFile', () => {
    it('应该下载文件', async () => {
      const req = createMockRequest({
        params: { fileId: 'file_123' }
      }) as Request;
      const res = createMockResponse() as Response;

      const mockFileInfo = {
        id: 'file_123',
        originalName: 'test-document.pdf',
        path: '/uploads/test-document.pdf',
        mimetype: 'application/pdf',
        size: 1024 * 500
      };

      mockStorageService.getMetadata.mockResolvedValue(mockFileInfo);
      mockStorageService.exists.mockResolvedValue(undefined);

      await uploadController.downloadFile(req, res);

      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="test-document.pdf"');
      expect(res.download).toHaveBeenCalledWith('/uploads/test-document.pdf', 'test-document.pdf');
      expect(mockAuditService.log).toHaveBeenCalledWith({
        action: 'file_download',
        userId: 1,
        details: { fileId: 'file_123', filename: 'test-document.pdf' }
      });
    });

    it('应该处理文件不存在', async () => {
      const req = createMockRequest({
        params: { fileId: 'file_123' }
      }) as Request;
      const res = createMockResponse() as Response;

      mockStorageService.getMetadata.mockResolvedValue({
        id: 'file_123',
        path: '/uploads/missing-file.pdf'
      });
      mockStorageService.exists.mockResolvedValue(undefined);

      await uploadController.downloadFile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: '文件不存在或已被删除'
      });
    });
  });

  describe('getUserFiles', () => {
    it('应该获取用户文件列表', async () => {
      const req = createMockRequest({
        query: {
          page: '1',
          pageSize: '20',
          type: 'image'
        }
      }) as Request;
      const res = createMockResponse() as Response;

      const mockFiles = [
        {
          id: 'file_123',
          originalName: 'image1.jpg',
          url: '/uploads/image1.jpg',
          size: 1024 * 100,
          uploadedAt: new Date()
        },
        {
          id: 'file_124',
          originalName: 'image2.png',
          url: '/uploads/image2.png',
          size: 1024 * 150,
          uploadedAt: new Date()
        }
      ];

      mockStorageService.getUserFiles = jest.fn().mockResolvedValue({
        files: mockFiles,
        total: 2,
        page: 1,
        pageSize: 20
      });

      await uploadController.getUserFiles(req, res);

      expect(mockStorageService.getUserFiles).toHaveBeenCalledWith(1, {
        page: 1,
        pageSize: 20,
        type: 'image'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockFiles,
        pagination: {
          total: 2,
          page: 1,
          pageSize: 20,
          totalPages: 1
        }
      });
    });

    it('应该支持文件类型筛选', async () => {
      const req = createMockRequest({
        query: { type: 'document' }
      }) as Request;
      const res = createMockResponse() as Response;

      mockStorageService.getUserFiles = jest.fn().mockResolvedValue({
        files: [],
        total: 0
      });

      await uploadController.getUserFiles(req, res);

      expect(mockStorageService.getUserFiles).toHaveBeenCalledWith(1, {
        type: 'document'
      });
    });
  });

  describe('getStorageUsage', () => {
    it('应该获取存储使用情况', async () => {
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;

      const mockUsage = {
        used: 1024 * 1024 * 150, // 150MB
        quota: 1024 * 1024 * 500, // 500MB
        remaining: 1024 * 1024 * 350, // 350MB
        percentage: 30,
        fileCount: 25,
        byType: {
          images: { count: 15, size: 1024 * 1024 * 80 },
          documents: { count: 8, size: 1024 * 1024 * 60 },
          others: { count: 2, size: 1024 * 1024 * 10 }
        }
      };

      mockUserService.getStorageUsage = jest.fn().mockResolvedValue(mockUsage);

      await uploadController.getStorageUsage(req, res);

      expect(mockUserService.getStorageUsage).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUsage
      });
    });
  });

  describe('错误处理', () => {
    it('应该处理存储服务错误', async () => {
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;

      const error = new Error('存储服务不可用');
      mockStorageService.upload.mockRejectedValue(error);

      await uploadController.uploadSingle(req, res);

      expect(mockLoggerService.error).toHaveBeenCalledWith(
        '文件上传失败',
        expect.objectContaining({
          error: error.message,
          filename: 'test-image.jpg'
        })
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: '文件上传失败',
        message: '服务器内部错误'
      });
    });

    it('应该处理磁盘空间不足', async () => {
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;

      const error = new Error('ENOSPC: no space left on device');
      mockStorageService.upload.mockRejectedValue(error);

      await uploadController.uploadSingle(req, res);

      expect(res.status).toHaveBeenCalledWith(507);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: '存储空间不足',
        message: '服务器存储空间已满'
      });
    });

    it('应该处理权限错误', async () => {
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;

      const error = new Error('EACCES: permission denied');
      mockStorageService.upload.mockRejectedValue(error);

      await uploadController.uploadSingle(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: '文件上传失败',
        message: '服务器权限错误'
      });
    });
  });

  describe('配置管理', () => {
    it('应该根据配置限制文件大小', async () => {
      mockConfigService.get.mockImplementation((key) => {
        if (key === 'upload.maxFileSize') return 1024 * 1024; // 1MB
        return null;
      });

      const req = createMockRequest({
        file: {
          ...createMockRequest().file,
          size: 1024 * 1024 * 2 // 2MB，超过限制
        } as Express.Multer.File
      }) as Request;
      const res = createMockResponse() as Response;

      await uploadController.uploadSingle(req, res);

      expect(res.status).toHaveBeenCalledWith(413);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: '文件过大',
        message: '文件大小不能超过 1MB',
        maxSize: 1024 * 1024,
        actualSize: 1024 * 1024 * 2
      });
    });

    it('应该根据配置限制文件类型', async () => {
      mockConfigService.get.mockImplementation((key) => {
        if (key === 'upload.allowedTypes') return ['image/jpeg', 'image/png'];
        return null;
      });

      const req = createMockRequest({
        file: {
          ...createMockRequest().file,
          mimetype: 'application/pdf' // 不在允许列表中
        } as Express.Multer.File
      }) as Request;
      const res = createMockResponse() as Response;

      await uploadController.uploadSingle(req, res);

      expect(res.status).toHaveBeenCalledWith(415);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: '文件类型不支持',
        message: '只支持以下文件类型：image/jpeg, image/png',
        allowedTypes: ['image/jpeg', 'image/png'],
        actualType: 'application/pdf'
      });
    });
  });
});
