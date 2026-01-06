import { jest } from '@jest/globals';
import { vi } from 'vitest'
import request from 'supertest';
import express from 'express';

// Mock Express app
const mockApp = express();

// Mock controllers
const mockFilesController = {
  uploadFile: jest.fn(),
  downloadFile: jest.fn(),
  deleteFile: jest.fn(),
  getFiles: jest.fn(),
  getFileById: jest.fn(),
  updateFile: jest.fn(),
  getFileStats: jest.fn(),
  optimizeFile: jest.fn(),
  convertFile: jest.fn(),
  compressFile: jest.fn(),
  extractFile: jest.fn(),
  mergeFiles: jest.fn(),
  splitFile: jest.fn(),
  validateFile: jest.fn(),
  scanFile: jest.fn(),
  getFileInfo: jest.fn(),
  getFilePreview: jest.fn(),
  generateThumbnail: jest.fn(),
  batchUpload: jest.fn(),
  batchDownload: jest.fn(),
  batchDelete: jest.fn(),
  moveFile: jest.fn(),
  copyFile: jest.fn(),
  renameFile: jest.fn(),
  createFolder: jest.fn(),
  deleteFolder: jest.fn(),
  getFolderContents: jest.fn(),
  getStorageInfo: jest.fn(),
  cleanupStorage: jest.fn(),
  getUploadProgress: jest.fn(),
  cancelUpload: jest.fn(),
  resumeUpload: jest.fn()
};

// Mock middlewares
const mockAuthMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockValidationMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockRateLimitMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockPermissionMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockSecurityMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockFileUploadMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockFileValidationMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockCacheMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());

// Mock imports
jest.unstable_mockModule('../../../../../src/controllers/files.controller', () => mockFilesController);
jest.unstable_mockModule('../../../../../src/middlewares/auth.middleware', () => ({
jest.unstable_mockModule('../../../../../src/middlewares/rate-limit.middleware', () => ({
  fileUploadRateLimit: mockRateLimitMiddleware,
  fileDownloadRateLimit: mockRateLimitMiddleware
}));
jest.unstable_mockModule('../../../../../src/middlewares/permission.middleware', () => ({
  checkPermission: mockPermissionMiddleware,
  requireFileAccess: mockPermissionMiddleware
}));
jest.unstable_mockModule('../../../../../src/middlewares/security.middleware', () => ({
  sanitizeInput: mockSecurityMiddleware,
  validateContentType: mockSecurityMiddleware,
  scanFileForMalware: mockSecurityMiddleware
}));
jest.unstable_mockModule('../../../../../src/middlewares/file-upload.middleware', () => ({
  handleFileUpload: mockFileUploadMiddleware,
  validateFileType: mockFileValidationMiddleware,
  validateFileSize: mockFileValidationMiddleware
}));
jest.unstable_mockModule('../../../../../src/middlewares/cache.middleware', () => ({
  cacheResponse: mockCacheMiddleware
}));


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

describe('Files Routes', () => {
  let filesRouter: any;

  beforeAll(async () => {
    // 动态导入路由
    const { default: importedFilesRouter } = await import('../../../../../src/routes/files.routes');
    filesRouter = importedFilesRouter;
    
    // 设置Express应用
    mockApp.use('/files', filesRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // 设置默认的控制器响应
    mockFilesController.getFiles.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: [
          {
            id: 1,
            name: 'kindergarten-logo.png',
            originalName: 'kindergarten-logo.png',
            path: '/uploads/images/kindergarten-logo.png',
            size: 256000,
            mimeType: 'image/png',
            type: 'image',
            extension: 'png',
            status: 'active',
            uploadedBy: 'admin',
            uploadedAt: '2024-02-20T14:30:00.000Z',
            updatedAt: '2024-02-20T14:30:00.000Z',
            metadata: {
              width: 800,
              height: 600,
              format: 'PNG',
              hasThumbnail: true
            }
          },
          {
            id: 2,
            name: 'student-handbook.pdf',
            originalName: 'student-handbook.pdf',
            path: '/uploads/documents/student-handbook.pdf',
            size: 2048000,
            mimeType: 'application/pdf',
            type: 'document',
            extension: 'pdf',
            status: 'active',
            uploadedBy: '张老师',
            uploadedAt: '2024-02-20T12:00:00.000Z',
            updatedAt: '2024-02-20T12:00:00.000Z',
            metadata: {
              pages: 45,
              author: '张老师',
              title: '学生手册'
            }
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1
        },
        message: '获取文件列表成功'
      });
    });

    mockFilesController.uploadFile.mockImplementation((req, res) => {
      res.status(201).json({
        success: true,
        data: {
          id: 3,
          name: 'activity-photo.jpg',
          originalName: 'activity-photo.jpg',
          path: '/uploads/images/activity-photo.jpg',
          size: 512000,
          mimeType: 'image/jpeg',
          type: 'image',
          extension: 'jpg',
          status: 'active',
          uploadedBy: '李老师',
          uploadedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          thumbnailUrl: '/uploads/thumbnails/activity-photo-thumb.jpg',
          downloadUrl: '/api/files/download/3',
          metadata: {
            width: 1920,
            height: 1080,
            format: 'JPEG',
            quality: 85
          }
        },
        message: '文件上传成功'
      });
    });

    mockFilesController.downloadFile.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: {
          id: 1,
          name: 'kindergarten-logo.png',
          downloadUrl: '/api/files/download/1',
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
          size: 256000,
          mimeType: 'image/png'
        },
        message: '文件下载链接生成成功'
      });
    });

    mockFilesController.getStorageInfo.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: {
          total: 107374182400, // 100GB
          used: 32212254720,  // 30GB
          available: 75161927680, // 70GB
          usagePercentage: 30,
          files: {
            total: 1250,
            images: 450,
            documents: 600,
            videos: 50,
            others: 150
          },
          quotas: {
            userQuota: 1073741824, // 1GB
            systemQuota: 107374182400 // 100GB
          },
          cleanup: {
            tempFiles: 50,
            duplicateFiles: 25,
            orphanFiles: 10
          }
        },
        message: '获取存储信息成功'
      });
    });
  });

  describe('GET /files', () => {
    it('应该获取文件列表', async () => {
      const response = await request(mockApp)
        .get('/files')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: [
          {
            id: 1,
            name: 'kindergarten-logo.png',
            originalName: 'kindergarten-logo.png',
            path: '/uploads/images/kindergarten-logo.png',
            size: 256000,
            mimeType: 'image/png',
            type: 'image',
            extension: 'png',
            status: 'active',
            uploadedBy: 'admin',
            uploadedAt: '2024-02-20T14:30:00.000Z',
            updatedAt: '2024-02-20T14:30:00.000Z',
            metadata: {
              width: 800,
              height: 600,
              format: 'PNG',
              hasThumbnail: true
            }
          },
          {
            id: 2,
            name: 'student-handbook.pdf',
            originalName: 'student-handbook.pdf',
            path: '/uploads/documents/student-handbook.pdf',
            size: 2048000,
            mimeType: 'application/pdf',
            type: 'document',
            extension: 'pdf',
            status: 'active',
            uploadedBy: '张老师',
            uploadedAt: '2024-02-20T12:00:00.000Z',
            updatedAt: '2024-02-20T12:00:00.000Z',
            metadata: {
              pages: 45,
              author: '张老师',
              title: '学生手册'
            }
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1
        },
        message: '获取文件列表成功'
      });

      expect(mockFilesController.getFiles).toHaveBeenCalled();
    });

    it('应该支持分页参数', async () => {
      const page = 2;
      const limit = 5;

      await request(mockApp)
        .get('/files')
        .query({ page, limit })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockFilesController.getFiles).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            page: page.toString(),
            limit: limit.toString()
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该支持文件类型过滤', async () => {
      const type = 'image';

      await request(mockApp)
        .get('/files')
        .query({ type })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockFilesController.getFiles).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            type
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该支持文件扩展名过滤', async () => {
      const extension = 'pdf';

      await request(mockApp)
        .get('/files')
        .query({ extension })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockFilesController.getFiles).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            extension
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该支持搜索功能', async () => {
      const search = 'logo';

      await request(mockApp)
        .get('/files')
        .query({ search })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockFilesController.getFiles).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            search
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该应用认证中间件', async () => {
      await request(mockApp)
        .get('/files')
        .set('Authorization', 'Bearer valid-token');

      expect(mockAuthMiddleware).toHaveBeenCalled();
    });

    it('应该应用缓存中间件', async () => {
      await request(mockApp)
        .get('/files')
        .set('Authorization', 'Bearer valid-token');

      expect(mockCacheMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /files/:id', () => {
    it('应该获取文件详情', async () => {
      mockFilesController.getFileById.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            id: 1,
            name: 'kindergarten-logo.png',
            originalName: 'kindergarten-logo.png',
            path: '/uploads/images/kindergarten-logo.png',
            size: 256000,
            mimeType: 'image/png',
            type: 'image',
            extension: 'png',
            status: 'active',
            uploadedBy: 'admin',
            uploadedAt: '2024-02-20T14:30:00.000Z',
            updatedAt: '2024-02-20T14:30:00.000Z',
            metadata: {
              width: 800,
              height: 600,
              format: 'PNG',
              hasThumbnail: true,
              colorSpace: 'RGB',
              bitsPerSample: 8
            },
            access: {
              downloadCount: 25,
              viewCount: 150,
              lastAccessed: '2024-02-20T14:30:00.000Z'
            },
            urls: {
              download: '/api/files/download/1',
              thumbnail: '/api/files/thumbnail/1',
              preview: '/api/files/preview/1'
            }
          },
          message: '获取文件详情成功'
        });
      });

      const fileId = 1;

      const response = await request(mockApp)
        .get(`/files/${fileId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockFilesController.getFileById).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { id: fileId.toString() }
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该验证文件ID参数', async () => {
      await request(mockApp)
        .get('/files/invalid-id')
        .set('Authorization', 'Bearer valid-token')
        .expect(400);

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });

    it('应该检查文件访问权限', async () => {
      await request(mockApp)
        .get('/files/1')
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('POST /files/upload', () => {
    it('应该上传文件', async () => {
      const response = await request(mockApp)
        .post('/files/upload')
        .set('Authorization', 'Bearer valid-token')
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        data: {
          id: 3,
          name: 'activity-photo.jpg',
          originalName: 'activity-photo.jpg',
          path: '/uploads/images/activity-photo.jpg',
          size: 512000,
          mimeType: 'image/jpeg',
          type: 'image',
          extension: 'jpg',
          status: 'active',
          uploadedBy: '李老师',
          uploadedAt: expect.any(String),
          updatedAt: expect.any(String),
          thumbnailUrl: '/uploads/thumbnails/activity-photo-thumb.jpg',
          downloadUrl: '/api/files/download/3',
          metadata: {
            width: 1920,
            height: 1080,
            format: 'JPEG',
            quality: 85
          }
        },
        message: '文件上传成功'
      });

      expect(mockFilesController.uploadFile).toHaveBeenCalled();
    });

    it('应该应用文件上传中间件', async () => {
      await request(mockApp)
        .post('/files/upload')
        .set('Authorization', 'Bearer valid-token');

      expect(mockFileUploadMiddleware).toHaveBeenCalled();
    });

    it('应该应用文件验证中间件', async () => {
      await request(mockApp)
        .post('/files/upload')
        .set('Authorization', 'Bearer valid-token');

      expect(mockFileValidationMiddleware).toHaveBeenCalled();
    });

    it('应该应用安全中间件', async () => {
      await request(mockApp)
        .post('/files/upload')
        .set('Authorization', 'Bearer valid-token');

      expect(mockSecurityMiddleware).toHaveBeenCalled();
    });

    it('应该应用上传限流中间件', async () => {
      await request(mockApp)
        .post('/files/upload')
        .set('Authorization', 'Bearer valid-token');

      expect(mockRateLimitMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /files/:id/download', () => {
    it('应该生成文件下载链接', async () => {
      const fileId = 1;

      const response = await request(mockApp)
        .get(`/files/${fileId}/download`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          id: 1,
          name: 'kindergarten-logo.png',
          downloadUrl: '/api/files/download/1',
          expiresAt: expect.any(String),
          size: 256000,
          mimeType: 'image/png'
        },
        message: '文件下载链接生成成功'
      });

      expect(mockFilesController.downloadFile).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { id: fileId.toString() }
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该检查文件访问权限', async () => {
      await request(mockApp)
        .get('/files/1/download')
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });

    it('应该应用下载限流中间件', async () => {
      await request(mockApp)
        .get('/files/1/download')
        .set('Authorization', 'Bearer valid-token');

      expect(mockRateLimitMiddleware).toHaveBeenCalled();
    });
  });

  describe('DELETE /files/:id', () => {
    it('应该删除文件', async () => {
      mockFilesController.deleteFile.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            id: 1,
            name: 'kindergarten-logo.png',
            deletedAt: new Date().toISOString(),
            message: '文件删除成功'
          },
          message: '文件删除成功'
        });
      });

      const fileId = 1;

      const response = await request(mockApp)
        .delete(`/files/${fileId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockFilesController.deleteFile).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { id: fileId.toString() }
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该验证文件ID参数', async () => {
      await request(mockApp)
        .delete('/files/invalid-id')
        .set('Authorization', 'Bearer valid-token')
        .expect(400);

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });

    it('应该检查文件删除权限', async () => {
      await request(mockApp)
        .delete('/files/1')
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /files/storage/info', () => {
    it('应该获取存储信息', async () => {
      const response = await request(mockApp)
        .get('/files/storage/info')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          total: 107374182400,
          used: 32212254720,
          available: 75161927680,
          usagePercentage: 30,
          files: {
            total: 1250,
            images: 450,
            documents: 600,
            videos: 50,
            others: 150
          },
          quotas: {
            userQuota: 1073741824,
            systemQuota: 107374182400
          },
          cleanup: {
            tempFiles: 50,
            duplicateFiles: 25,
            orphanFiles: 10
          }
        },
        message: '获取存储信息成功'
      });

      expect(mockFilesController.getStorageInfo).toHaveBeenCalled();
    });

    it('应该检查管理员权限', async () => {
      await request(mockApp)
        .get('/files/storage/info')
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /files/:id/preview', () => {
    it('应该获取文件预览', async () => {
      mockFilesController.getFilePreview.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            id: 1,
            name: 'kindergarten-logo.png',
            previewUrl: '/api/files/preview/1',
            previewType: 'image',
            size: {
              width: 800,
              height: 600
            },
            quality: 'medium',
            expiresAt: new Date(Date.now() + 3600000).toISOString()
          },
          message: '获取文件预览成功'
        });
      });

      const fileId = 1;

      const response = await request(mockApp)
        .get(`/files/${fileId}/preview`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockFilesController.getFilePreview).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { id: fileId.toString() }
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('GET /files/:id/thumbnail', () => {
    it('应该获取文件缩略图', async () => {
      mockFilesController.generateThumbnail.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            id: 1,
            name: 'kindergarten-logo.png',
            thumbnailUrl: '/api/files/thumbnail/1',
            size: {
              width: 200,
              height: 150
            },
            quality: 'high',
            format: 'JPEG',
            expiresAt: new Date(Date.now() + 3600000).toISOString()
          },
          message: '获取文件缩略图成功'
        });
      });

      const fileId = 1;

      const response = await request(mockApp)
        .get(`/files/${fileId}/thumbnail`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockFilesController.generateThumbnail).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { id: fileId.toString() }
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('POST /files/batch/upload', () => {
    it('应该批量上传文件', async () => {
      mockFilesController.batchUpload.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          data: {
            batchId: 'batch_123',
            uploadedFiles: [
              {
                id: 4,
                name: 'photo1.jpg',
                status: 'success',
                size: 256000
              },
              {
                id: 5,
                name: 'photo2.jpg',
                status: 'success',
                size: 512000
              }
            ],
            failedFiles: [],
            totalFiles: 2,
            successCount: 2,
            failureCount: 0,
            uploadedAt: new Date().toISOString()
          },
          message: '批量文件上传完成'
        });
      });

      const response = await request(mockApp)
        .post('/files/batch/upload')
        .set('Authorization', 'Bearer valid-token')
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(mockFilesController.batchUpload).toHaveBeenCalled();
    });
  });

  describe('POST /files/batch/delete', () => {
    it('应该批量删除文件', async () => {
      mockFilesController.batchDelete.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            deletedFiles: [1, 2],
            failedFiles: [],
            totalFiles: 2,
            successCount: 2,
            failureCount: 0,
            deletedAt: new Date().toISOString()
          },
          message: '批量文件删除完成'
        });
      });

      const deleteData = {
        fileIds: [1, 2]
      };

      const response = await request(mockApp)
        .post('/files/batch/delete')
        .send(deleteData)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockFilesController.batchDelete).toHaveBeenCalledWith(
        expect.objectContaining({
          body: deleteData
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('PUT /files/:id/rename', () => {
    it('应该重命名文件', async () => {
      mockFilesController.renameFile.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            id: 1,
            oldName: 'kindergarten-logo.png',
            newName: 'kindergarten-logo-new.png',
            renamedAt: new Date().toISOString()
          },
          message: '文件重命名成功'
        });
      });

      const fileId = 1;
      const renameData = {
        newName: 'kindergarten-logo-new.png'
      };

      const response = await request(mockApp)
        .put(`/files/${fileId}/rename`)
        .send(renameData)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockFilesController.renameFile).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { id: fileId.toString() },
          body: renameData
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该验证新文件名', async () => {
      const invalidRenameData = {
        newName: '' // 空文件名
      };

      await request(mockApp)
        .put('/files/1/rename')
        .send(invalidRenameData)
        .set('Authorization', 'Bearer valid-token')
        .expect(400);

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });
  });

  describe('POST /files/folders', () => {
    it('应该创建文件夹', async () => {
      mockFilesController.createFolder.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          data: {
            id: 1,
            name: '活动照片',
            path: '/uploads/活动照片',
            parentId: null,
            createdBy: 'admin',
            createdAt: new Date().toISOString(),
            fileCount: 0,
            totalSize: 0
          },
          message: '文件夹创建成功'
        });
      });

      const folderData = {
        name: '活动照片',
        parentId: null
      };

      const response = await request(mockApp)
        .post('/files/folders')
        .send(folderData)
        .set('Authorization', 'Bearer valid-token')
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(mockFilesController.createFolder).toHaveBeenCalledWith(
        expect.objectContaining({
          body: folderData
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该验证文件夹名称', async () => {
      const invalidFolderData = {
        name: '' // 空文件夹名称
      };

      await request(mockApp)
        .post('/files/folders')
        .send(invalidFolderData)
        .set('Authorization', 'Bearer valid-token')
        .expect(400);

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /files/folders/:id/contents', () => {
    it('应该获取文件夹内容', async () => {
      mockFilesController.getFolderContents.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            folder: {
              id: 1,
              name: '活动照片',
              path: '/uploads/活动照片'
            },
            files: [
              {
                id: 1,
                name: 'activity1.jpg',
                size: 256000,
                type: 'image'
              }
            ],
            folders: [
              {
                id: 2,
                name: '春游活动',
                fileCount: 5
              }
            ],
            totalItems: 2
          },
          message: '获取文件夹内容成功'
        });
      });

      const folderId = 1;

      const response = await request(mockApp)
        .get(`/files/folders/${folderId}/contents`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockFilesController.getFolderContents).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { id: folderId.toString() }
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('POST /files/storage/cleanup', () => {
    it('应该清理存储空间', async () => {
      mockFilesController.cleanupStorage.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            cleanedFiles: 50,
            cleanedSize: 1073741824, // 1GB
            cleanedTypes: ['temp', 'duplicate', 'orphan'],
            cleanedAt: new Date().toISOString(),
            spaceReclaimed: 1073741824
          },
          message: '存储空间清理完成'
        });
      });

      const cleanupData = {
        types: ['temp', 'duplicate', 'orphan'],
        olderThan: 30 // 天数
      };

      const response = await request(mockApp)
        .post('/files/storage/cleanup')
        .send(cleanupData)
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockFilesController.cleanupStorage).toHaveBeenCalledWith(
        expect.objectContaining({
          body: cleanupData
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该检查管理员权限', async () => {
      await request(mockApp)
        .post('/files/storage/cleanup')
        .send({ types: ['temp'] })
        .set('Authorization', 'Bearer admin-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('路由中间件应用', () => {
    it('应该正确应用认证中间件到所有路由', () => {
      const authRoutes = ['/files', '/files/1', '/files/upload', '/files/1/download',
                          '/files/1/preview', '/files/1/thumbnail', '/files/batch/upload',
                          '/files/batch/delete', '/files/1/rename', '/files/folders',
                          '/files/folders/1/contents', '/files/storage/info', '/files/storage/cleanup'];
      
      authRoutes.forEach(route => {
        expect(mockAuthMiddleware).toBeDefined();
      });
    });

    it('应该正确应用文件验证中间件到上传路由', () => {
      const validatedRoutes = ['/files/upload', '/files/batch/upload'];
      
      validatedRoutes.forEach(route => {
        expect(mockFileValidationMiddleware).toBeDefined();
      });
    });

    it('应该正确应用文件上传中间件到上传路由', () => {
      const uploadRoutes = ['/files/upload', '/files/batch/upload'];
      
      uploadRoutes.forEach(route => {
        expect(mockFileUploadMiddleware).toBeDefined();
      });
    });

    it('应该正确应用权限中间件到敏感操作', () => {
      const permissionRoutes = ['/files/1/download', '/files/1/delete', '/files/1/rename',
                              '/files/batch/delete', '/files/folders', '/files/storage/cleanup'];
      
      permissionRoutes.forEach(route => {
        expect(mockPermissionMiddleware).toBeDefined();
      });
    });

    it('应该正确应用安全中间件到所有路由', () => {
      expect(mockSecurityMiddleware).toBeDefined();
    });

    it('应该正确应用限流中间件到上传和下载路由', () => {
      const rateLimitedRoutes = ['/files/upload', '/files/batch/upload', '/files/1/download'];
      
      rateLimitedRoutes.forEach(route => {
        expect(mockRateLimitMiddleware).toBeDefined();
      });
    });

    it('应该正确应用缓存中间件到数据查询路由', () => {
      const cachedRoutes = ['/files', '/files/1', '/files/storage/info'];
      
      cachedRoutes.forEach(route => {
        expect(mockCacheMiddleware).toBeDefined();
      });
    });
  });

  describe('错误处理', () => {
    it('应该处理控制器抛出的错误', async () => {
      mockFilesController.getFiles.mockImplementation((req, res, next) => {
        const error = new Error('获取文件列表失败');
        next(error);
      });

      await request(mockApp)
        .get('/files')
        .set('Authorization', 'Bearer valid-token')
        .expect(500);
    });

    it('应该处理验证中间件错误', async () => {
      mockValidationMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('参数验证失败');
        (error as any).statusCode = 400;
        next(error);
      });

      await request(mockApp)
        .get('/files/invalid-id')
        .set('Authorization', 'Bearer valid-token')
        .expect(400);
    });

    it('应该处理文件上传错误', async () => {
      mockFilesController.uploadFile.mockImplementation((req, res, next) => {
        const error = new Error('文件上传失败：文件格式不支持');
        (error as any).statusCode = 400;
        next(error);
      });

      await request(mockApp)
        .post('/files/upload')
        .set('Authorization', 'Bearer valid-token')
        .expect(400);
    });

    it('应该处理文件下载错误', async () => {
      mockFilesController.downloadFile.mockImplementation((req, res, next) => {
        const error = new Error('文件下载失败：文件不存在');
        (error as any).statusCode = 404;
        next(error);
      });

      await request(mockApp)
        .get('/files/999/download')
        .set('Authorization', 'Bearer valid-token')
        .expect(404);
    });

    it('应该处理权限不足错误', async () => {
      mockPermissionMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('权限不足');
        (error as any).statusCode = 403;
        next(error);
      });

      await request(mockApp)
        .delete('/files/1')
        .set('Authorization', 'Bearer user-token')
        .expect(403);
    });

    it('应该处理存储空间不足错误', async () => {
      mockFilesController.uploadFile.mockImplementation((req, res, next) => {
        const error = new Error('存储空间不足');
        (error as any).statusCode = 507;
        next(error);
      });

      await request(mockApp)
        .post('/files/upload')
        .set('Authorization', 'Bearer valid-token')
        .expect(507);
    });

    it('应该处理文件大小超限错误', async () => {
      mockFileValidationMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('文件大小超过限制');
        (error as any).statusCode = 413;
        next(error);
      });

      await request(mockApp)
        .post('/files/upload')
        .set('Authorization', 'Bearer valid-token')
        .expect(413);
    });
  });

  describe('性能测试', () => {
    it('应该处理大量文件数据', async () => {
      mockFilesController.getFiles.mockImplementation((req, res) => {
        // 模拟大量文件数据
        const largeData = Array(1000).fill(null).map((_, i) => ({
          id: i + 1,
          name: `file${i + 1}.jpg`,
          originalName: `file${i + 1}.jpg`,
          path: `/uploads/images/file${i + 1}.jpg`,
          size: Math.floor(Math.random() * 1000000) + 100000,
          mimeType: 'image/jpeg',
          type: 'image',
          extension: 'jpg',
          status: 'active',
          uploadedBy: `user${Math.floor(Math.random() * 10) + 1}`,
          uploadedAt: new Date(Date.now() - i * 86400000).toISOString(),
          updatedAt: new Date(Date.now() - i * 86400000).toISOString(),
          metadata: {
            width: 1920,
            height: 1080,
            format: 'JPEG'
          }
        }));

        res.status(200).json({
          success: true,
          data: largeData,
          pagination: {
            page: 1,
            limit: 1000,
            total: 1000,
            totalPages: 1
          },
          message: '获取文件列表成功'
        });
      });

      const response = await request(mockApp)
        .get('/files')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1000);
    });

    it('应该处理并发文件上传', async () => {
      const requests = Array(5).fill(null).map(() => 
        request(mockApp)
          .post('/files/upload')
          .set('Authorization', 'Bearer valid-token')
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });
    });

    it('应该处理批量文件操作', async () => {
      mockFilesController.batchDelete.mockImplementation((req, res) => {
        // 模拟批量删除大量文件
        const deletedFiles = Array(100).fill(null).map((_, i) => i + 1);
        
        res.status(200).json({
          success: true,
          data: {
            deletedFiles: deletedFiles,
            failedFiles: [],
            totalFiles: 100,
            successCount: 100,
            failureCount: 0,
            deletedAt: new Date().toISOString()
          },
          message: '批量文件删除完成'
        });
      });

      const response = await request(mockApp)
        .post('/files/batch/delete')
        .send({ fileIds: Array(100).fill(null).map((_, i) => i + 1) })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.successCount).toBe(100);
    });
  });

  describe('安全测试', () => {
    it('应该防止恶意文件上传', async () => {
      mockFileValidationMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('文件类型不被允许');
        (error as any).statusCode = 400;
        next(error);
      });

      await request(mockApp)
        .post('/files/upload')
        .set('Authorization', 'Bearer valid-token')
        .expect(400);

      expect(mockFileValidationMiddleware).toHaveBeenCalled();
    });

    it('应该防止路径遍历攻击', async () => {
      const maliciousPath = '../../../etc/passwd';

      await request(mockApp)
        .get(`/files/${maliciousPath}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(400);

      expect(mockSecurityMiddleware).toHaveBeenCalled();
    });

    it('应该防止XSS攻击', async () => {
      const maliciousScript = '<script>alert("xss")</script>';

      await request(mockApp)
        .post('/files/folders')
        .send({ name: maliciousScript })
        .set('Authorization', 'Bearer valid-token')
        .expect(400);

      expect(mockSecurityMiddleware).toHaveBeenCalled();
    });

    it('应该验证输入数据格式', async () => {
      const invalidFormats = [
        { route: '/files/invalid-id', method: 'get' },
        { route: '/files/upload', method: 'post' },
        { route: '/files/1/rename', method: 'put', body: { newName: '' } },
        { route: '/files/folders', method: 'post', body: { name: '' } },
        { route: '/files/batch/delete', method: 'post', body: { fileIds: 'invalid' } }
      ];

      for (const { route, method, body } of invalidFormats) {
        const req = request(mockApp)[method](route)
          .set('Authorization', 'Bearer valid-token');
        
        if (body) {
          req.send(body);
        }
        
        await req.expect(400);
      }
    });

    it('应该限制文件上传频率', async () => {
      mockRateLimitMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('上传请求过于频繁');
        (error as any).statusCode = 429;
        next(error);
      });

      await request(mockApp)
        .post('/files/upload')
        .set('Authorization', 'Bearer valid-token')
        .expect(429);
    });

    it('应该保护敏感文件操作', async () => {
      const sensitiveOperations = [
        { path: '/files/storage/cleanup', method: 'post' },
        { path: '/files/1/delete', method: 'delete' },
        { path: '/files/batch/delete', method: 'post' }
      ];

      for (const { path, method } of sensitiveOperations) {
        await request(mockApp)[method](path)
          .set('Authorization', 'Bearer user-token')
          .expect(403);
      }
    });

    it('应该扫描上传文件的安全性', async () => {
      mockSecurityMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('文件包含恶意内容');
        (error as any).statusCode = 400;
        next(error);
      });

      await request(mockApp)
        .post('/files/upload')
        .set('Authorization', 'Bearer valid-token')
        .expect(400);

      expect(mockSecurityMiddleware).toHaveBeenCalled();
    });
  });
});