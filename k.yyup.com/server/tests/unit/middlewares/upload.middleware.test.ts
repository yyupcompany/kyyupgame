import { jest } from '@jest/globals';
import { vi } from 'vitest'
import path from 'path';
import fs from 'fs';

// Mock Request and Response objects
const createMockRequest = (overrides = {}) => ({
  file: null,
  files: null,
  body: {},
  params: {},
  query: {},
  headers: {},
  ...overrides
});

const createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis()
  };
  return res;
};

const mockNext = jest.fn();

// Mock multer
const mockMulter = {
  diskStorage: jest.fn(),
  memoryStorage: jest.fn(),
  single: jest.fn(),
  array: jest.fn(),
  fields: jest.fn(),
  any: jest.fn(),
  none: jest.fn()
};

// Mock fs
const mockFs = {
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  unlinkSync: jest.fn(),
  statSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn()
};

// Mock path
const mockPath = {
  join: jest.fn(),
  extname: jest.fn(),
  basename: jest.fn(),
  dirname: jest.fn()
};

// Mock sharp (image processing)
const mockSharp = jest.fn().mockReturnValue({
  resize: jest.fn().mockReturnThis(),
  jpeg: jest.fn().mockReturnThis(),
  png: jest.fn().mockReturnThis(),
  webp: jest.fn().mockReturnThis(),
  toBuffer: jest.fn().mockResolvedValue(Buffer.from('processed image')),
  toFile: jest.fn().mockResolvedValue({ size: 1024 })
});

// Mock imports
jest.unstable_mockModule('multer', () => mockMulter);
jest.unstable_mockModule('fs', () => mockFs);
jest.unstable_mockModule('path', () => mockPath);
jest.unstable_mockModule('sharp', () => mockSharp);


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

describe('Upload Middleware', () => {
  let uploadMiddleware: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/middlewares/upload.middleware');
    uploadMiddleware = imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // 设置默认的mock行为
    mockPath.join.mockImplementation((...args) => args.join('/'));
    mockPath.extname.mockImplementation((filename) => {
      const parts = filename.split('.');
      return parts.length > 1 ? '.' + parts[parts.length - 1] : '';
    });
    mockPath.basename.mockImplementation((filename) => filename.split('/').pop());
    mockFs.existsSync.mockReturnValue(true);
    mockFs.mkdirSync.mockReturnValue(undefined);
  });

  describe('uploadAvatar', () => {
    it('应该成功上传头像', async () => {
      const req = createMockRequest({
        file: {
          fieldname: 'avatar',
          originalname: 'avatar.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          buffer: Buffer.from('fake image data'),
          size: 1024000
        },
        user: { id: 1 }
      });
      const res = createMockResponse();

      const mockUploadSingle = jest.fn((req, res, next) => {
        req.file = {
          fieldname: 'avatar',
          originalname: 'avatar.jpg',
          mimetype: 'image/jpeg',
          buffer: Buffer.from('fake image data'),
          size: 1024000
        };
        next();
      });

      mockMulter.single.mockReturnValue(mockUploadSingle);
      mockSharp.mockReturnValue({
        resize: jest.fn().mockReturnThis(),
        jpeg: jest.fn().mockReturnThis(),
        toFile: jest.fn().mockResolvedValue({ size: 512000 })
      });

      const middleware = uploadMiddleware.uploadAvatar();
      await middleware(req, res, mockNext);

      expect(mockMulter.single).toHaveBeenCalledWith('avatar');
      expect(mockNext).toHaveBeenCalled();
    });

    it('应该验证文件类型', async () => {
      const req = createMockRequest({
        file: {
          fieldname: 'avatar',
          originalname: 'document.pdf',
          mimetype: 'application/pdf',
          buffer: Buffer.from('fake pdf data'),
          size: 1024000
        }
      });
      const res = createMockResponse();

      const middleware = uploadMiddleware.uploadAvatar();
      await middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '只支持图片文件格式 (jpg, jpeg, png, gif, webp)'
      });
    });

    it('应该验证文件大小', async () => {
      const req = createMockRequest({
        file: {
          fieldname: 'avatar',
          originalname: 'large-image.jpg',
          mimetype: 'image/jpeg',
          buffer: Buffer.from('fake large image data'),
          size: 10 * 1024 * 1024 // 10MB
        }
      });
      const res = createMockResponse();

      const middleware = uploadMiddleware.uploadAvatar();
      await middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '文件大小不能超过 5MB'
      });
    });

    it('应该处理图片压缩', async () => {
      const req = createMockRequest({
        file: {
          fieldname: 'avatar',
          originalname: 'avatar.jpg',
          mimetype: 'image/jpeg',
          buffer: Buffer.from('fake image data'),
          size: 2 * 1024 * 1024 // 2MB
        },
        user: { id: 1 }
      });
      const res = createMockResponse();

      mockSharp.mockReturnValue({
        resize: jest.fn().mockReturnThis(),
        jpeg: jest.fn().mockReturnThis(),
        toFile: jest.fn().mockResolvedValue({ size: 512000 })
      });

      const middleware = uploadMiddleware.uploadAvatar();
      await middleware(req, res, mockNext);

      expect(mockSharp).toHaveBeenCalledWith(req.file.buffer);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('uploadPhotos', () => {
    it('应该成功上传多张照片', async () => {
      const req = createMockRequest({
        files: [
          {
            fieldname: 'photos',
            originalname: 'photo1.jpg',
            mimetype: 'image/jpeg',
            buffer: Buffer.from('fake image data 1'),
            size: 1024000
          },
          {
            fieldname: 'photos',
            originalname: 'photo2.png',
            mimetype: 'image/png',
            buffer: Buffer.from('fake image data 2'),
            size: 2048000
          }
        ]
      });
      const res = createMockResponse();

      const mockUploadArray = jest.fn((req, res, next) => {
        req.files = [
          {
            fieldname: 'photos',
            originalname: 'photo1.jpg',
            mimetype: 'image/jpeg',
            buffer: Buffer.from('fake image data 1'),
            size: 1024000
          },
          {
            fieldname: 'photos',
            originalname: 'photo2.png',
            mimetype: 'image/png',
            buffer: Buffer.from('fake image data 2'),
            size: 2048000
          }
        ];
        next();
      });

      mockMulter.array.mockReturnValue(mockUploadArray);

      const middleware = uploadMiddleware.uploadPhotos(5);
      await middleware(req, res, mockNext);

      expect(mockMulter.array).toHaveBeenCalledWith('photos', 5);
      expect(mockNext).toHaveBeenCalled();
    });

    it('应该限制上传文件数量', async () => {
      const req = createMockRequest({
        files: Array(10).fill({
          fieldname: 'photos',
          originalname: 'photo.jpg',
          mimetype: 'image/jpeg',
          buffer: Buffer.from('fake image data'),
          size: 1024000
        })
      });
      const res = createMockResponse();

      const middleware = uploadMiddleware.uploadPhotos(5);
      await middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '最多只能上传 5 个文件'
      });
    });

    it('应该验证所有文件类型', async () => {
      const req = createMockRequest({
        files: [
          {
            fieldname: 'photos',
            originalname: 'photo1.jpg',
            mimetype: 'image/jpeg',
            buffer: Buffer.from('fake image data'),
            size: 1024000
          },
          {
            fieldname: 'photos',
            originalname: 'document.pdf',
            mimetype: 'application/pdf',
            buffer: Buffer.from('fake pdf data'),
            size: 1024000
          }
        ]
      });
      const res = createMockResponse();

      const middleware = uploadMiddleware.uploadPhotos(5);
      await middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '文件 document.pdf 不是支持的图片格式'
      });
    });
  });

  describe('uploadDocument', () => {
    it('应该成功上传文档', async () => {
      const req = createMockRequest({
        file: {
          fieldname: 'document',
          originalname: 'report.pdf',
          mimetype: 'application/pdf',
          buffer: Buffer.from('fake pdf data'),
          size: 2 * 1024 * 1024 // 2MB
        }
      });
      const res = createMockResponse();

      const mockUploadSingle = jest.fn((req, res, next) => {
        req.file = {
          fieldname: 'document',
          originalname: 'report.pdf',
          mimetype: 'application/pdf',
          buffer: Buffer.from('fake pdf data'),
          size: 2 * 1024 * 1024
        };
        next();
      });

      mockMulter.single.mockReturnValue(mockUploadSingle);

      const middleware = uploadMiddleware.uploadDocument();
      await middleware(req, res, mockNext);

      expect(mockMulter.single).toHaveBeenCalledWith('document');
      expect(mockNext).toHaveBeenCalled();
    });

    it('应该验证文档文件类型', async () => {
      const req = createMockRequest({
        file: {
          fieldname: 'document',
          originalname: 'image.jpg',
          mimetype: 'image/jpeg',
          buffer: Buffer.from('fake image data'),
          size: 1024000
        }
      });
      const res = createMockResponse();

      const middleware = uploadMiddleware.uploadDocument();
      await middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '只支持文档文件格式 (pdf, doc, docx, xls, xlsx, ppt, pptx, txt)'
      });
    });

    it('应该验证文档文件大小', async () => {
      const req = createMockRequest({
        file: {
          fieldname: 'document',
          originalname: 'large-document.pdf',
          mimetype: 'application/pdf',
          buffer: Buffer.from('fake large pdf data'),
          size: 50 * 1024 * 1024 // 50MB
        }
      });
      const res = createMockResponse();

      const middleware = uploadMiddleware.uploadDocument();
      await middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '文件大小不能超过 20MB'
      });
    });
  });

  describe('uploadExcel', () => {
    it('应该成功上传Excel文件', async () => {
      const req = createMockRequest({
        file: {
          fieldname: 'excel',
          originalname: 'data.xlsx',
          mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          buffer: Buffer.from('fake excel data'),
          size: 1024000
        }
      });
      const res = createMockResponse();

      const mockUploadSingle = jest.fn((req, res, next) => {
        req.file = {
          fieldname: 'excel',
          originalname: 'data.xlsx',
          mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          buffer: Buffer.from('fake excel data'),
          size: 1024000
        };
        next();
      });

      mockMulter.single.mockReturnValue(mockUploadSingle);

      const middleware = uploadMiddleware.uploadExcel();
      await middleware(req, res, mockNext);

      expect(mockMulter.single).toHaveBeenCalledWith('excel');
      expect(mockNext).toHaveBeenCalled();
    });

    it('应该验证Excel文件类型', async () => {
      const req = createMockRequest({
        file: {
          fieldname: 'excel',
          originalname: 'document.pdf',
          mimetype: 'application/pdf',
          buffer: Buffer.from('fake pdf data'),
          size: 1024000
        }
      });
      const res = createMockResponse();

      const middleware = uploadMiddleware.uploadExcel();
      await middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '只支持Excel文件格式 (xls, xlsx)'
      });
    });
  });

  describe('createUploadPath', () => {
    it('应该创建上传路径', () => {
      const uploadType = 'avatars';
      const userId = 1;

      mockFs.existsSync.mockReturnValue(false);
      mockPath.join.mockReturnValue('/uploads/avatars/2024/04');

      const result = uploadMiddleware.createUploadPath(uploadType, userId);

      expect(mockFs.mkdirSync).toHaveBeenCalledWith('/uploads/avatars/2024/04', { recursive: true });
      expect(result).toBe('/uploads/avatars/2024/04');
    });

    it('应该跳过已存在的路径创建', () => {
      const uploadType = 'photos';
      const userId = 1;

      mockFs.existsSync.mockReturnValue(true);
      mockPath.join.mockReturnValue('/uploads/photos/2024/04');

      const result = uploadMiddleware.createUploadPath(uploadType, userId);

      expect(mockFs.mkdirSync).not.toHaveBeenCalled();
      expect(result).toBe('/uploads/photos/2024/04');
    });
  });

  describe('generateFileName', () => {
    it('应该生成唯一文件名', () => {
      const originalName = 'avatar.jpg';
      const userId = 1;

      mockPath.extname.mockReturnValue('.jpg');

      const result = uploadMiddleware.generateFileName(originalName, userId);

      expect(result).toMatch(/^user_1_\d+\.jpg$/);
    });

    it('应该处理没有扩展名的文件', () => {
      const originalName = 'document';
      const userId = 1;

      mockPath.extname.mockReturnValue('');

      const result = uploadMiddleware.generateFileName(originalName, userId);

      expect(result).toMatch(/^user_1_\d+$/);
    });
  });

  describe('validateFileType', () => {
    it('应该验证图片文件类型', () => {
      const imageFile = {
        mimetype: 'image/jpeg',
        originalname: 'photo.jpg'
      };

      const result = uploadMiddleware.validateFileType(imageFile, 'image');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('应该拒绝无效的图片文件类型', () => {
      const invalidFile = {
        mimetype: 'application/pdf',
        originalname: 'document.pdf'
      };

      const result = uploadMiddleware.validateFileType(invalidFile, 'image');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('只支持图片文件格式 (jpg, jpeg, png, gif, webp)');
    });

    it('应该验证文档文件类型', () => {
      const documentFile = {
        mimetype: 'application/pdf',
        originalname: 'report.pdf'
      };

      const result = uploadMiddleware.validateFileType(documentFile, 'document');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('应该验证Excel文件类型', () => {
      const excelFile = {
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        originalname: 'data.xlsx'
      };

      const result = uploadMiddleware.validateFileType(excelFile, 'excel');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  describe('validateFileSize', () => {
    it('应该验证文件大小在限制内', () => {
      const file = {
        size: 2 * 1024 * 1024, // 2MB
        originalname: 'photo.jpg'
      };

      const result = uploadMiddleware.validateFileSize(file, 5 * 1024 * 1024); // 5MB limit

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('应该拒绝超过大小限制的文件', () => {
      const file = {
        size: 10 * 1024 * 1024, // 10MB
        originalname: 'large-file.jpg'
      };

      const result = uploadMiddleware.validateFileSize(file, 5 * 1024 * 1024); // 5MB limit

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('文件大小不能超过 5MB');
    });
  });

  describe('processImage', () => {
    it('应该处理图片压缩', async () => {
      const imageBuffer = Buffer.from('fake image data');
      const options = {
        width: 300,
        height: 300,
        quality: 80,
        format: 'jpeg'
      };

      mockSharp.mockReturnValue({
        resize: jest.fn().mockReturnThis(),
        jpeg: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(Buffer.from('processed image'))
      });

      const result = await uploadMiddleware.processImage(imageBuffer, options);

      expect(mockSharp).toHaveBeenCalledWith(imageBuffer);
      expect(result).toEqual(Buffer.from('processed image'));
    });

    it('应该处理图片格式转换', async () => {
      const imageBuffer = Buffer.from('fake image data');
      const options = {
        format: 'webp',
        quality: 90
      };

      mockSharp.mockReturnValue({
        webp: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(Buffer.from('webp image'))
      });

      const result = await uploadMiddleware.processImage(imageBuffer, options);

      expect(mockSharp).toHaveBeenCalledWith(imageBuffer);
      expect(result).toEqual(Buffer.from('webp image'));
    });
  });

  describe('deleteFile', () => {
    it('应该删除文件', () => {
      const filePath = '/uploads/avatars/user_1_123456.jpg';

      mockFs.existsSync.mockReturnValue(true);
      mockFs.unlinkSync.mockReturnValue(undefined);

      const result = uploadMiddleware.deleteFile(filePath);

      expect(mockFs.existsSync).toHaveBeenCalledWith(filePath);
      expect(mockFs.unlinkSync).toHaveBeenCalledWith(filePath);
      expect(result).toBe(true);
    });

    it('应该处理文件不存在的情况', () => {
      const filePath = '/uploads/avatars/nonexistent.jpg';

      mockFs.existsSync.mockReturnValue(false);

      const result = uploadMiddleware.deleteFile(filePath);

      expect(mockFs.existsSync).toHaveBeenCalledWith(filePath);
      expect(mockFs.unlinkSync).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('应该处理删除文件时的错误', () => {
      const filePath = '/uploads/avatars/locked.jpg';

      mockFs.existsSync.mockReturnValue(true);
      mockFs.unlinkSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const result = uploadMiddleware.deleteFile(filePath);

      expect(result).toBe(false);
    });
  });

  describe('getFileInfo', () => {
    it('应该获取文件信息', () => {
      const filePath = '/uploads/avatars/user_1_123456.jpg';

      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue({
        size: 1024000,
        mtime: new Date('2024-04-01T10:00:00Z'),
        isFile: () => true
      });
      mockPath.basename.mockReturnValue('user_1_123456.jpg');
      mockPath.extname.mockReturnValue('.jpg');

      const result = uploadMiddleware.getFileInfo(filePath);

      expect(result).toEqual({
        exists: true,
        size: 1024000,
        lastModified: new Date('2024-04-01T10:00:00Z'),
        filename: 'user_1_123456.jpg',
        extension: '.jpg',
        isFile: true
      });
    });

    it('应该处理文件不存在的情况', () => {
      const filePath = '/uploads/avatars/nonexistent.jpg';

      mockFs.existsSync.mockReturnValue(false);

      const result = uploadMiddleware.getFileInfo(filePath);

      expect(result).toEqual({
        exists: false,
        size: null,
        lastModified: null,
        filename: null,
        extension: null,
        isFile: false
      });
    });
  });

  describe('错误处理', () => {
    it('应该处理multer错误', async () => {
      const req = createMockRequest();
      const res = createMockResponse();

      const mockUploadSingle = jest.fn((req, res, next) => {
        const error = new Error('Multer error');
        error.code = 'LIMIT_FILE_SIZE';
        next(error);
      });

      mockMulter.single.mockReturnValue(mockUploadSingle);

      const middleware = uploadMiddleware.uploadAvatar();
      await middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '文件上传失败',
        error: 'LIMIT_FILE_SIZE'
      });
    });

    it('应该处理图片处理错误', async () => {
      const req = createMockRequest({
        file: {
          fieldname: 'avatar',
          originalname: 'avatar.jpg',
          mimetype: 'image/jpeg',
          buffer: Buffer.from('invalid image data'),
          size: 1024000
        }
      });
      const res = createMockResponse();

      mockSharp.mockImplementation(() => {
        throw new Error('Invalid image format');
      });

      const middleware = uploadMiddleware.uploadAvatar();
      await middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '图片处理失败',
        error: 'Invalid image format'
      });
    });

    it('应该处理文件系统错误', async () => {
      const req = createMockRequest({
        file: {
          fieldname: 'avatar',
          originalname: 'avatar.jpg',
          mimetype: 'image/jpeg',
          buffer: Buffer.from('fake image data'),
          size: 1024000
        }
      });
      const res = createMockResponse();

      mockFs.mkdirSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const middleware = uploadMiddleware.uploadAvatar();
      await middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '文件上传失败',
        error: 'Permission denied'
      });
    });
  });
});
