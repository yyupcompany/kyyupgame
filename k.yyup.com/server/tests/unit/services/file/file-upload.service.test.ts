import { jest } from '@jest/globals';
import { vi } from 'vitest'
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

// Mock file system
const mockFs = {
  access: jest.fn(),
  mkdir: jest.fn(),
  unlink: jest.fn(),
  stat: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
  copyFile: jest.fn(),
  readdir: jest.fn()
};

// Mock sharp image processing
const mockSharp = {
  resize: jest.fn().mockReturnThis(),
  jpeg: jest.fn().mockReturnThis(),
  png: jest.fn().mockReturnThis(),
  webp: jest.fn().mockReturnThis(),
  toFile: jest.fn().mockResolvedValue({ size: 1024 }),
  metadata: jest.fn().mockResolvedValue({
    width: 1920,
    height: 1080,
    format: 'jpeg',
    size: 2048000
  }),
  toBuffer: jest.fn().mockResolvedValue(Buffer.from('processed-image'))
};

// Mock multer file object
const mockMulterFile = {
  fieldname: 'avatar',
  originalname: 'test-image.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  size: 1024000,
  destination: '/tmp/uploads',
  filename: 'test-image-123456.jpg',
  path: '/tmp/uploads/test-image-123456.jpg',
  buffer: Buffer.from('test-image-data')
};

// Mock services
const mockVirusScanService = {
  scanFile: jest.fn(),
  scanBuffer: jest.fn()
};

const mockCloudStorageService = {
  uploadFile: jest.fn(),
  deleteFile: jest.fn(),
  getFileUrl: jest.fn(),
  getSignedUrl: jest.fn()
};

const mockRedisService = {
  set: jest.fn(),
  get: jest.fn(),
  del: jest.fn(),
  exists: jest.fn()
};

// Mock models
const mockFile = {
  create: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn()
};

const mockUser = {
  findByPk: jest.fn(),
  update: jest.fn()
};

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
};

// Mock crypto
const mockCrypto = {
  randomUUID: jest.fn().mockReturnValue('uuid-123456'),
  createHash: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue('hash-value')
  })
};

// Mock imports
jest.unstable_mockModule('fs/promises', () => mockFs);
jest.unstable_mockModule('sharp', () => ({ default: jest.fn(() => mockSharp) }));
jest.unstable_mockModule('crypto', () => ({ default: mockCrypto }));

jest.unstable_mockModule('../../../../../src/services/virus-scan/virus-scan.service', () => ({
  default: mockVirusScanService
}));

jest.unstable_mockModule('../../../../../src/services/cloud-storage/cloud-storage.service', () => ({
  default: mockCloudStorageService
}));

jest.unstable_mockModule('../../../../../src/services/redis/redis.service', () => ({
  default: mockRedisService
}));

jest.unstable_mockModule('../../../../../src/models/file.model', () => ({
  default: mockFile
}));

jest.unstable_mockModule('../../../../../src/models/user.model', () => ({
  default: mockUser
}));

jest.unstable_mockModule('../../../../../src/utils/logger', () => ({
  default: mockLogger
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

describe('File Upload Service', () => {
  let fileUploadService: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/services/file/file-upload.service');
    fileUploadService = imported.default || imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockFs.access.mockResolvedValue(undefined);
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.stat.mockResolvedValue({ size: 1024000 });
    mockVirusScanService.scanFile.mockResolvedValue({ clean: true });
    mockCloudStorageService.uploadFile.mockResolvedValue({
      url: 'https://cdn.example.com/files/test-image.jpg',
      key: 'files/test-image.jpg'
    });
  });

  describe('uploadFile', () => {
    it('应该成功上传文件', async () => {
      const uploadOptions = {
        userId: 1,
        category: 'avatar',
        allowedTypes: ['image/jpeg', 'image/png'],
        maxSize: 5 * 1024 * 1024, // 5MB
        generateThumbnail: true
      };

      const mockFileRecord = {
        id: 1,
        originalName: 'test-image.jpg',
        filename: 'test-image-123456.jpg',
        mimetype: 'image/jpeg',
        size: 1024000,
        url: 'https://cdn.example.com/files/test-image.jpg',
        category: 'avatar',
        userId: 1,
        createdAt: new Date().toISOString()
      };

      mockFile.create.mockResolvedValue(mockFileRecord);

      const result = await fileUploadService.uploadFile(mockMulterFile, uploadOptions);

      expect(mockVirusScanService.scanFile).toHaveBeenCalledWith(mockMulterFile.path);
      expect(mockCloudStorageService.uploadFile).toHaveBeenCalledWith(
        mockMulterFile.path,
        expect.stringContaining('files/')
      );
      expect(mockFile.create).toHaveBeenCalledWith(
        expect.objectContaining({
          originalName: 'test-image.jpg',
          filename: expect.any(String),
          mimetype: 'image/jpeg',
          size: 1024000,
          userId: 1,
          category: 'avatar'
        })
      );
      expect(result).toEqual(mockFileRecord);
    });

    it('应该处理文件类型验证', async () => {
      const uploadOptions = {
        userId: 1,
        allowedTypes: ['image/png'], // 只允许PNG
        maxSize: 5 * 1024 * 1024
      };

      const jpegFile = {
        ...mockMulterFile,
        mimetype: 'image/jpeg' // JPEG文件
      };

      await expect(fileUploadService.uploadFile(jpegFile, uploadOptions))
        .rejects.toThrow('不支持的文件类型');

      expect(mockVirusScanService.scanFile).not.toHaveBeenCalled();
      expect(mockCloudStorageService.uploadFile).not.toHaveBeenCalled();
    });

    it('应该处理文件大小验证', async () => {
      const uploadOptions = {
        userId: 1,
        allowedTypes: ['image/jpeg'],
        maxSize: 500 * 1024 // 500KB
      };

      const largeFile = {
        ...mockMulterFile,
        size: 1024 * 1024 // 1MB
      };

      await expect(fileUploadService.uploadFile(largeFile, uploadOptions))
        .rejects.toThrow('文件大小超过限制');
    });

    it('应该处理病毒扫描失败', async () => {
      const uploadOptions = {
        userId: 1,
        allowedTypes: ['image/jpeg'],
        maxSize: 5 * 1024 * 1024
      };

      mockVirusScanService.scanFile.mockResolvedValue({
        clean: false,
        threat: 'Trojan.Generic'
      });

      await expect(fileUploadService.uploadFile(mockMulterFile, uploadOptions))
        .rejects.toThrow('文件包含恶意内容');

      expect(mockCloudStorageService.uploadFile).not.toHaveBeenCalled();
    });

    it('应该处理用户存储配额检查', async () => {
      const uploadOptions = {
        userId: 1,
        allowedTypes: ['image/jpeg'],
        maxSize: 5 * 1024 * 1024,
        checkQuota: true
      };

      const mockUser = {
        id: 1,
        storageUsed: 100 * 1024 * 1024, // 100MB已使用
        storageQuota: 100 * 1024 * 1024  // 100MB配额
      };

      mockUser.findByPk.mockResolvedValue(mockUser);

      await expect(fileUploadService.uploadFile(mockMulterFile, uploadOptions))
        .rejects.toThrow('存储空间不足');
    });

    it('应该生成缩略图', async () => {
      const uploadOptions = {
        userId: 1,
        category: 'photo',
        allowedTypes: ['image/jpeg'],
        maxSize: 5 * 1024 * 1024,
        generateThumbnail: true,
        thumbnailSizes: [
          { width: 150, height: 150, suffix: 'thumb' },
          { width: 300, height: 300, suffix: 'medium' }
        ]
      };

      const mockFileRecord = {
        id: 1,
        originalName: 'photo.jpg',
        url: 'https://cdn.example.com/files/photo.jpg',
        thumbnails: {
          thumb: 'https://cdn.example.com/files/photo-thumb.jpg',
          medium: 'https://cdn.example.com/files/photo-medium.jpg'
        }
      };

      mockFile.create.mockResolvedValue(mockFileRecord);

      const result = await fileUploadService.uploadFile(mockMulterFile, uploadOptions);

      expect(mockSharp.resize).toHaveBeenCalledTimes(2);
      expect(mockSharp.resize).toHaveBeenCalledWith(150, 150, expect.any(Object));
      expect(mockSharp.resize).toHaveBeenCalledWith(300, 300, expect.any(Object));
      expect(result.thumbnails).toBeDefined();
    });

    it('应该处理图片压缩', async () => {
      const uploadOptions = {
        userId: 1,
        allowedTypes: ['image/jpeg'],
        maxSize: 5 * 1024 * 1024,
        compress: true,
        quality: 80
      };

      await fileUploadService.uploadFile(mockMulterFile, uploadOptions);

      expect(mockSharp.jpeg).toHaveBeenCalledWith({ quality: 80 });
    });

    it('应该处理文件重命名', async () => {
      const uploadOptions = {
        userId: 1,
        allowedTypes: ['image/jpeg'],
        maxSize: 5 * 1024 * 1024,
        customFilename: 'custom-name'
      };

      await fileUploadService.uploadFile(mockMulterFile, uploadOptions);

      expect(mockCloudStorageService.uploadFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('custom-name')
      );
    });

    it('应该更新用户存储使用量', async () => {
      const uploadOptions = {
        userId: 1,
        allowedTypes: ['image/jpeg'],
        maxSize: 5 * 1024 * 1024,
        updateUserStorage: true
      };

      const mockUser = {
        id: 1,
        storageUsed: 50 * 1024 * 1024,
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockUser.findByPk.mockResolvedValue(mockUser);
      mockFile.create.mockResolvedValue({ id: 1, size: 1024000 });

      await fileUploadService.uploadFile(mockMulterFile, uploadOptions);

      expect(mockUser.update).toHaveBeenCalledWith({
        storageUsed: 50 * 1024 * 1024 + 1024000
      });
    });
  });

  describe('uploadMultipleFiles', () => {
    it('应该批量上传文件', async () => {
      const files = [
        { ...mockMulterFile, originalname: 'file1.jpg' },
        { ...mockMulterFile, originalname: 'file2.jpg' },
        { ...mockMulterFile, originalname: 'file3.jpg' }
      ];

      const uploadOptions = {
        userId: 1,
        allowedTypes: ['image/jpeg'],
        maxSize: 5 * 1024 * 1024,
        maxFiles: 5
      };

      const mockFileRecords = files.map((file, index) => ({
        id: index + 1,
        originalName: file.originalname,
        url: `https://cdn.example.com/files/${file.originalname}`
      }));

      mockFile.create
        .mockResolvedValueOnce(mockFileRecords[0])
        .mockResolvedValueOnce(mockFileRecords[1])
        .mockResolvedValueOnce(mockFileRecords[2]);

      const result = await fileUploadService.uploadMultipleFiles(files, uploadOptions);

      expect(result).toHaveLength(3);
      expect(result[0].originalName).toBe('file1.jpg');
      expect(result[1].originalName).toBe('file2.jpg');
      expect(result[2].originalName).toBe('file3.jpg');
    });

    it('应该处理文件数量限制', async () => {
      const files = Array.from({ length: 6 }, (_, i) => ({
        ...mockMulterFile,
        originalname: `file${i + 1}.jpg`
      }));

      const uploadOptions = {
        userId: 1,
        allowedTypes: ['image/jpeg'],
        maxSize: 5 * 1024 * 1024,
        maxFiles: 5 // 最多5个文件
      };

      await expect(fileUploadService.uploadMultipleFiles(files, uploadOptions))
        .rejects.toThrow('文件数量超过限制');
    });

    it('应该处理部分上传失败', async () => {
      const files = [
        { ...mockMulterFile, originalname: 'file1.jpg' },
        { ...mockMulterFile, originalname: 'file2.txt', mimetype: 'text/plain' }, // 不支持的类型
        { ...mockMulterFile, originalname: 'file3.jpg' }
      ];

      const uploadOptions = {
        userId: 1,
        allowedTypes: ['image/jpeg'],
        maxSize: 5 * 1024 * 1024,
        continueOnError: true
      };

      mockFile.create
        .mockResolvedValueOnce({ id: 1, originalName: 'file1.jpg' })
        .mockResolvedValueOnce({ id: 3, originalName: 'file3.jpg' });

      const result = await fileUploadService.uploadMultipleFiles(files, uploadOptions);

      expect(result.successful).toHaveLength(2);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0].error).toContain('不支持的文件类型');
    });
  });

  describe('deleteFile', () => {
    it('应该成功删除文件', async () => {
      const fileId = 1;
      const userId = 1;

      const mockFileRecord = {
        id: 1,
        filename: 'test-image-123456.jpg',
        url: 'https://cdn.example.com/files/test-image.jpg',
        cloudKey: 'files/test-image.jpg',
        userId: 1,
        size: 1024000,
        destroy: jest.fn().mockResolvedValue(undefined)
      };

      mockFile.findByPk.mockResolvedValue(mockFileRecord);
      mockCloudStorageService.deleteFile.mockResolvedValue(undefined);

      const result = await fileUploadService.deleteFile(fileId, userId);

      expect(mockFile.findByPk).toHaveBeenCalledWith(fileId);
      expect(mockCloudStorageService.deleteFile).toHaveBeenCalledWith('files/test-image.jpg');
      expect(mockFileRecord.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('应该处理文件不存在', async () => {
      const fileId = 999;
      const userId = 1;

      mockFile.findByPk.mockResolvedValue(null);

      await expect(fileUploadService.deleteFile(fileId, userId))
        .rejects.toThrow('文件不存在');
    });

    it('应该处理权限验证', async () => {
      const fileId = 1;
      const userId = 2; // 不同的用户

      const mockFileRecord = {
        id: 1,
        userId: 1 // 文件属于用户1
      };

      mockFile.findByPk.mockResolvedValue(mockFileRecord);

      await expect(fileUploadService.deleteFile(fileId, userId))
        .rejects.toThrow('无权限删除此文件');
    });

    it('应该更新用户存储使用量', async () => {
      const fileId = 1;
      const userId = 1;

      const mockFileRecord = {
        id: 1,
        userId: 1,
        size: 1024000,
        cloudKey: 'files/test.jpg',
        destroy: jest.fn().mockResolvedValue(undefined)
      };

      const mockUser = {
        id: 1,
        storageUsed: 50 * 1024 * 1024,
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockFile.findByPk.mockResolvedValue(mockFileRecord);
      mockUser.findByPk.mockResolvedValue(mockUser);

      await fileUploadService.deleteFile(fileId, userId, { updateUserStorage: true });

      expect(mockUser.update).toHaveBeenCalledWith({
        storageUsed: 50 * 1024 * 1024 - 1024000
      });
    });

    it('应该删除关联的缩略图', async () => {
      const fileId = 1;
      const userId = 1;

      const mockFileRecord = {
        id: 1,
        userId: 1,
        cloudKey: 'files/test.jpg',
        thumbnails: {
          thumb: 'files/test-thumb.jpg',
          medium: 'files/test-medium.jpg'
        },
        destroy: jest.fn().mockResolvedValue(undefined)
      };

      mockFile.findByPk.mockResolvedValue(mockFileRecord);

      await fileUploadService.deleteFile(fileId, userId);

      expect(mockCloudStorageService.deleteFile).toHaveBeenCalledTimes(3); // 原文件 + 2个缩略图
      expect(mockCloudStorageService.deleteFile).toHaveBeenCalledWith('files/test.jpg');
      expect(mockCloudStorageService.deleteFile).toHaveBeenCalledWith('files/test-thumb.jpg');
      expect(mockCloudStorageService.deleteFile).toHaveBeenCalledWith('files/test-medium.jpg');
    });
  });

  describe('getFileInfo', () => {
    it('应该获取文件信息', async () => {
      const fileId = 1;
      const userId = 1;

      const mockFileRecord = {
        id: 1,
        originalName: 'test-image.jpg',
        filename: 'test-image-123456.jpg',
        mimetype: 'image/jpeg',
        size: 1024000,
        url: 'https://cdn.example.com/files/test-image.jpg',
        category: 'avatar',
        userId: 1,
        createdAt: new Date().toISOString(),
        metadata: {
          width: 1920,
          height: 1080,
          format: 'jpeg'
        }
      };

      mockFile.findByPk.mockResolvedValue(mockFileRecord);

      const result = await fileUploadService.getFileInfo(fileId, userId);

      expect(mockFile.findByPk).toHaveBeenCalledWith(fileId);
      expect(result).toEqual(mockFileRecord);
    });

    it('应该处理文件不存在', async () => {
      const fileId = 999;
      const userId = 1;

      mockFile.findByPk.mockResolvedValue(null);

      const result = await fileUploadService.getFileInfo(fileId, userId);

      expect(result).toBeNull();
    });

    it('应该处理权限验证', async () => {
      const fileId = 1;
      const userId = 2;

      const mockFileRecord = {
        id: 1,
        userId: 1,
        isPublic: false
      };

      mockFile.findByPk.mockResolvedValue(mockFileRecord);

      await expect(fileUploadService.getFileInfo(fileId, userId))
        .rejects.toThrow('无权限访问此文件');
    });

    it('应该允许访问公开文件', async () => {
      const fileId = 1;
      const userId = 2;

      const mockFileRecord = {
        id: 1,
        userId: 1,
        isPublic: true,
        originalName: 'public-image.jpg'
      };

      mockFile.findByPk.mockResolvedValue(mockFileRecord);

      const result = await fileUploadService.getFileInfo(fileId, userId);

      expect(result).toEqual(mockFileRecord);
    });
  });

  describe('getUserFiles', () => {
    it('应该获取用户文件列表', async () => {
      const userId = 1;
      const options = {
        category: 'avatar',
        page: 1,
        pageSize: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      const mockFiles = {
        rows: [
          { id: 1, originalName: 'avatar1.jpg', category: 'avatar' },
          { id: 2, originalName: 'avatar2.jpg', category: 'avatar' }
        ],
        count: 2
      };

      mockFile.findAndCountAll.mockResolvedValue(mockFiles);

      const result = await fileUploadService.getUserFiles(userId, options);

      expect(mockFile.findAndCountAll).toHaveBeenCalledWith({
        where: { userId: 1, category: 'avatar' },
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']]
      });
      expect(result).toEqual({
        files: mockFiles.rows,
        pagination: {
          page: 1,
          pageSize: 10,
          total: 2,
          totalPages: 1
        }
      });
    });

    it('应该支持文件类型筛选', async () => {
      const userId = 1;
      const options = {
        mimetype: 'image/jpeg'
      };

      await fileUploadService.getUserFiles(userId, options);

      expect(mockFile.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            mimetype: 'image/jpeg'
          })
        })
      );
    });

    it('应该支持文件名搜索', async () => {
      const userId = 1;
      const options = {
        search: 'avatar'
      };

      await fileUploadService.getUserFiles(userId, options);

      expect(mockFile.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            originalName: expect.objectContaining({
              [Symbol.for('like')]: '%avatar%'
            })
          })
        })
      );
    });
  });

  describe('generateSignedUrl', () => {
    it('应该生成签名URL', async () => {
      const fileId = 1;
      const userId = 1;
      const expiresIn = 3600; // 1小时

      const mockFileRecord = {
        id: 1,
        userId: 1,
        cloudKey: 'files/test-image.jpg'
      };

      const mockSignedUrl = 'https://cdn.example.com/files/test-image.jpg?signature=abc123&expires=1234567890';

      mockFile.findByPk.mockResolvedValue(mockFileRecord);
      mockCloudStorageService.getSignedUrl.mockResolvedValue(mockSignedUrl);

      const result = await fileUploadService.generateSignedUrl(fileId, userId, expiresIn);

      expect(mockFile.findByPk).toHaveBeenCalledWith(fileId);
      expect(mockCloudStorageService.getSignedUrl).toHaveBeenCalledWith(
        'files/test-image.jpg',
        expiresIn
      );
      expect(result).toBe(mockSignedUrl);
    });

    it('应该处理文件不存在', async () => {
      const fileId = 999;
      const userId = 1;

      mockFile.findByPk.mockResolvedValue(null);

      await expect(fileUploadService.generateSignedUrl(fileId, userId))
        .rejects.toThrow('文件不存在');
    });

    it('应该处理权限验证', async () => {
      const fileId = 1;
      const userId = 2;

      const mockFileRecord = {
        id: 1,
        userId: 1,
        isPublic: false
      };

      mockFile.findByPk.mockResolvedValue(mockFileRecord);

      await expect(fileUploadService.generateSignedUrl(fileId, userId))
        .rejects.toThrow('无权限访问此文件');
    });
  });

  describe('getStorageStatistics', () => {
    it('应该获取用户存储统计', async () => {
      const userId = 1;

      const mockUser = {
        id: 1,
        storageUsed: 50 * 1024 * 1024,
        storageQuota: 100 * 1024 * 1024
      };

      const mockFileStats = [
        { category: 'avatar', totalSize: 5 * 1024 * 1024, count: 3 },
        { category: 'document', totalSize: 30 * 1024 * 1024, count: 15 },
        { category: 'photo', totalSize: 15 * 1024 * 1024, count: 8 }
      ];

      mockUser.findByPk.mockResolvedValue(mockUser);
      mockFile.findAll.mockResolvedValue(mockFileStats);

      const result = await fileUploadService.getStorageStatistics(userId);

      expect(result).toEqual({
        totalUsed: 50 * 1024 * 1024,
        totalQuota: 100 * 1024 * 1024,
        usagePercentage: 50,
        availableSpace: 50 * 1024 * 1024,
        byCategory: {
          avatar: { size: 5 * 1024 * 1024, count: 3 },
          document: { size: 30 * 1024 * 1024, count: 15 },
          photo: { size: 15 * 1024 * 1024, count: 8 }
        }
      });
    });

    it('应该处理用户不存在', async () => {
      const userId = 999;

      mockUser.findByPk.mockResolvedValue(null);

      await expect(fileUploadService.getStorageStatistics(userId))
        .rejects.toThrow('用户不存在');
    });
  });

  describe('cleanupTempFiles', () => {
    it('应该清理临时文件', async () => {
      const tempDir = '/tmp/uploads';
      const maxAge = 24 * 60 * 60 * 1000; // 24小时

      const mockTempFiles = [
        { name: 'temp1.jpg', isFile: () => true },
        { name: 'temp2.jpg', isFile: () => true },
        { name: 'subdir', isFile: () => false }
      ];

      const oldDate = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25小时前

      mockFs.readdir.mockResolvedValue(mockTempFiles);
      mockFs.stat.mockResolvedValue({ mtime: oldDate });

      const result = await fileUploadService.cleanupTempFiles(tempDir, maxAge);

      expect(mockFs.readdir).toHaveBeenCalledWith(tempDir, { withFileTypes: true });
      expect(mockFs.unlink).toHaveBeenCalledTimes(2); // 删除2个过期文件
      expect(result.deletedCount).toBe(2);
    });

    it('应该处理清理错误', async () => {
      const tempDir = '/tmp/uploads';

      mockFs.readdir.mockRejectedValue(new Error('目录不存在'));

      const result = await fileUploadService.cleanupTempFiles(tempDir);

      expect(result.deletedCount).toBe(0);
      expect(result.errors).toHaveLength(1);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('应该处理云存储上传失败', async () => {
      const uploadOptions = {
        userId: 1,
        allowedTypes: ['image/jpeg'],
        maxSize: 5 * 1024 * 1024
      };

      mockCloudStorageService.uploadFile.mockRejectedValue(new Error('云存储服务不可用'));

      await expect(fileUploadService.uploadFile(mockMulterFile, uploadOptions))
        .rejects.toThrow('云存储服务不可用');

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('文件上传失败'),
        expect.objectContaining({
          error: '云存储服务不可用'
        })
      );
    });

    it('应该处理图片处理失败', async () => {
      const uploadOptions = {
        userId: 1,
        allowedTypes: ['image/jpeg'],
        maxSize: 5 * 1024 * 1024,
        generateThumbnail: true
      };

      mockSharp.toFile.mockRejectedValue(new Error('图片处理失败'));

      await expect(fileUploadService.uploadFile(mockMulterFile, uploadOptions))
        .rejects.toThrow('图片处理失败');
    });

    it('应该处理数据库保存失败', async () => {
      const uploadOptions = {
        userId: 1,
        allowedTypes: ['image/jpeg'],
        maxSize: 5 * 1024 * 1024
      };

      mockFile.create.mockRejectedValue(new Error('数据库连接失败'));

      await expect(fileUploadService.uploadFile(mockMulterFile, uploadOptions))
        .rejects.toThrow('数据库连接失败');

      // 应该清理已上传的文件
      expect(mockCloudStorageService.deleteFile).toHaveBeenCalled();
    });
  });

  describe('Performance Optimization', () => {
    it('应该实现文件缓存', async () => {
      const fileId = 1;
      const userId = 1;
      const cacheKey = `file_info:${fileId}`;

      // 第一次查询
      mockRedisService.get.mockResolvedValueOnce(null);
      const mockFileRecord = { id: 1, originalName: 'test.jpg' };
      mockFile.findByPk.mockResolvedValue(mockFileRecord);
      mockRedisService.set.mockResolvedValue('OK');

      await fileUploadService.getFileInfo(fileId, userId);

      expect(mockRedisService.set).toHaveBeenCalledWith(
        cacheKey,
        JSON.stringify(mockFileRecord),
        'EX',
        3600 // 1小时缓存
      );

      // 第二次查询应该从缓存获取
      mockRedisService.get.mockResolvedValueOnce(JSON.stringify(mockFileRecord));

      await fileUploadService.getFileInfo(fileId, userId);

      expect(mockFile.findByPk).toHaveBeenCalledTimes(1); // 只调用一次数据库查询
    });

    it('应该支持并发上传', async () => {
      const files = Array.from({ length: 5 }, (_, i) => ({
        ...mockMulterFile,
        originalname: `file${i + 1}.jpg`
      }));

      const uploadOptions = {
        userId: 1,
        allowedTypes: ['image/jpeg'],
        maxSize: 5 * 1024 * 1024,
        concurrent: true
      };

      mockFile.create.mockResolvedValue({ id: 1 });

      const startTime = Date.now();
      await fileUploadService.uploadMultipleFiles(files, uploadOptions);
      const endTime = Date.now();

      // 并发上传应该比串行上传快
      expect(endTime - startTime).toBeLessThan(5000); // 假设串行需要更长时间
    });

    it('应该实现分片上传大文件', async () => {
      const largeFile = {
        ...mockMulterFile,
        size: 100 * 1024 * 1024, // 100MB
        path: '/tmp/large-file.zip'
      };

      const uploadOptions = {
        userId: 1,
        allowedTypes: ['application/zip'],
        maxSize: 500 * 1024 * 1024,
        useChunkedUpload: true,
        chunkSize: 10 * 1024 * 1024 // 10MB chunks
      };

      mockCloudStorageService.uploadFile.mockResolvedValue({
        url: 'https://cdn.example.com/files/large-file.zip',
        key: 'files/large-file.zip'
      });

      const result = await fileUploadService.uploadFile(largeFile, uploadOptions);

      expect(result).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('分片上传完成')
      );
    });
  });

  describe('Security Features', () => {
    it('应该验证文件内容类型', async () => {
      const maliciousFile = {
        ...mockMulterFile,
        mimetype: 'image/jpeg',
        originalname: 'malicious.jpg'
      };

      const uploadOptions = {
        userId: 1,
        allowedTypes: ['image/jpeg'],
        maxSize: 5 * 1024 * 1024,
        validateContent: true
      };

      // 模拟文件内容不匹配MIME类型
      mockFs.readFile.mockResolvedValue(Buffer.from('<?php echo "malicious code"; ?>'));

      await expect(fileUploadService.uploadFile(maliciousFile, uploadOptions))
        .rejects.toThrow('文件内容与声明类型不匹配');
    });

    it('应该生成安全的文件名', async () => {
      const dangerousFile = {
        ...mockMulterFile,
        originalname: '../../../etc/passwd'
      };

      const uploadOptions = {
        userId: 1,
        allowedTypes: ['text/plain'],
        maxSize: 1024
      };

      mockFile.create.mockResolvedValue({ id: 1 });

      await fileUploadService.uploadFile(dangerousFile, uploadOptions);

      expect(mockCloudStorageService.uploadFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.not.stringContaining('../')
      );
    });

    it('应该限制文件访问权限', async () => {
      const fileId = 1;
      const userId = 2;

      const mockPrivateFile = {
        id: 1,
        userId: 1,
        isPublic: false,
        accessLevel: 'private'
      };

      mockFile.findByPk.mockResolvedValue(mockPrivateFile);

      await expect(fileUploadService.getFileInfo(fileId, userId))
        .rejects.toThrow('无权限访问此文件');
    });

    it('应该记录文件操作日志', async () => {
      const uploadOptions = {
        userId: 1,
        allowedTypes: ['image/jpeg'],
        maxSize: 5 * 1024 * 1024,
        logOperations: true
      };

      mockFile.create.mockResolvedValue({ id: 1 });

      await fileUploadService.uploadFile(mockMulterFile, uploadOptions);

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('文件上传成功'),
        expect.objectContaining({
          userId: 1,
          fileId: 1,
          operation: 'upload'
        })
      );
    });
  });
});
