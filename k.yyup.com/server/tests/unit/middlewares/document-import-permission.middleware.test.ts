import { jest } from '@jest/globals';
import { vi } from 'vitest'
import { Request, Response, NextFunction } from 'express';

// Mock Express types
const mockRequest = {
  params: {},
  query: {},
  body: {},
  headers: {},
  user: null,
  method: 'POST',
  url: '/api/documents/import',
  path: '/api/documents/import',
  file: null,
  files: null
} as unknown as Request;

const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
  end: jest.fn().mockReturnThis(),
  locals: {}
} as unknown as Response;

const mockNext = jest.fn() as NextFunction;

// Mock models
const mockUser = {
  findByPk: jest.fn()
};

const mockDocument = {
  findAll: jest.fn(),
  count: jest.fn()
};

const mockKindergarten = {
  findByPk: jest.fn()
};

// Mock logger
const mockLogger = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// Mock file system
const mockFs = {
  statSync: jest.fn(),
  existsSync: jest.fn()
};

// Mock imports
jest.unstable_mockModule('../../../../../src/models/user.model', () => ({
  default: mockUser
}));

jest.unstable_mockModule('../../../../../src/models/document.model', () => ({
  default: mockDocument
}));

jest.unstable_mockModule('../../../../../src/models/kindergarten.model', () => ({
  default: mockKindergarten
}));

jest.unstable_mockModule('../../../../../src/utils/logger', () => ({
  default: mockLogger
}));

jest.unstable_mockModule('fs', () => mockFs);


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

describe('Document Import Permission Middleware', () => {
  let documentImportPermission: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/middlewares/document-import-permission.middleware');
    documentImportPermission = imported.default || imported.documentImportPermission || imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mock objects
    mockRequest.params = {};
    mockRequest.query = {};
    mockRequest.body = {};
    mockRequest.headers = {};
    mockRequest.user = null;
    mockRequest.file = null;
    mockRequest.files = null;
    mockResponse.locals = {};
  });

  describe('基础功能', () => {
    it('应该是一个函数', () => {
      expect(typeof documentImportPermission).toBe('function');
    });

    it('应该返回中间件函数', () => {
      const middleware = documentImportPermission();
      expect(typeof middleware).toBe('function');
      expect(middleware.length).toBe(3); // req, res, next
    });

    it('应该拒绝未认证的用户', async () => {
      const middleware = documentImportPermission();
      
      mockRequest.user = null;

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required for document import'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('用户权限检查', () => {
    it('应该允许管理员导入文档', async () => {
      const middleware = documentImportPermission();
      
      mockRequest.user = {
        id: 1,
        username: 'admin',
        role: 'admin' as any,
        permissions: ['document:import', 'document:manage']
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('应该拒绝没有导入权限的用户', async () => {
      const middleware = documentImportPermission();
      
      mockRequest.user = {
        id: 2,
        username: 'user',
        role: 'user',
        permissions: ['document:read']
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient permissions for document import',
        required: 'document:import'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('应该检查特定文档类型的权限', async () => {
      const middleware = documentImportPermission({
        documentType: 'student_records'
      });
      
      mockRequest.user = {
        id: 3,
        username: 'teacher',
        role: 'teacher',
        permissions: ['document:import', 'student_records:import']
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该拒绝没有特定文档类型权限的用户', async () => {
      const middleware = documentImportPermission({
        documentType: 'financial_records'
      });
      
      mockRequest.user = {
        id: 3,
        username: 'teacher',
        role: 'teacher',
        permissions: ['document:import', 'student_records:import']
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient permissions for this document type',
        documentType: 'financial_records',
        required: 'financial_records:import'
      });
    });
  });

  describe('文件验证', () => {
    it('应该验证上传的文件存在', async () => {
      const middleware = documentImportPermission({
        requireFile: true
      });
      
      mockRequest.user = {
        id: 1,
        username: 'admin',
        role: 'admin' as any,
        permissions: ['document:import']
      };
      mockRequest.file = null;

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'No file uploaded for import'
      });
    });

    it('应该验证文件类型', async () => {
      const middleware = documentImportPermission({
        allowedFileTypes: ['.pdf', '.docx', '.xlsx']
      });
      
      mockRequest.user = {
        id: 1,
        username: 'admin',
        role: 'admin' as any,
        permissions: ['document:import']
      };
      mockRequest.file = {
        originalname: 'document.txt',
        mimetype: 'text/plain',
        size: 1024
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid file type for import',
        allowedTypes: ['.pdf', '.docx', '.xlsx'],
        receivedType: '.txt'
      });
    });

    it('应该验证文件大小', async () => {
      const middleware = documentImportPermission({
        maxFileSize: 5 * 1024 * 1024 // 5MB
      });
      
      mockRequest.user = {
        id: 1,
        username: 'admin',
        role: 'admin' as any,
        permissions: ['document:import']
      };
      mockRequest.file = {
        originalname: 'large-document.pdf',
        mimetype: 'application/pdf',
        size: 10 * 1024 * 1024 // 10MB
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'File size exceeds maximum limit',
        maxSize: '5MB',
        fileSize: '10MB'
      });
    });

    it('应该验证多个文件', async () => {
      const middleware = documentImportPermission({
        allowMultipleFiles: true,
        maxFiles: 5
      });
      
      mockRequest.user = {
        id: 1,
        username: 'admin',
        role: 'admin' as any,
        permissions: ['document:import']
      };
      mockRequest.files = Array.from({ length: 7 }, (_, i) => ({
        originalname: `document${i}.pdf`,
        mimetype: 'application/pdf',
        size: 1024
      }));

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Too many files for import',
        maxFiles: 5,
        receivedFiles: 7
      });
    });
  });

  describe('业务规则检查', () => {
    it('应该检查导入频率限制', async () => {
      const middleware = documentImportPermission({
        rateLimitPerHour: 10
      });
      
      mockRequest.user = {
        id: 1,
        username: 'admin',
        role: 'admin' as any,
        permissions: ['document:import']
      };

      // 模拟用户在过去一小时内已导入10个文档
      mockDocument.count.mockResolvedValue(10);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(429);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Import rate limit exceeded',
        limit: 10,
        period: 'hour',
        current: 10
      });
    });

    it('应该检查存储配额', async () => {
      const middleware = documentImportPermission({
        checkStorageQuota: true,
        maxStoragePerUser: 100 * 1024 * 1024 // 100MB
      });
      
      mockRequest.user = {
        id: 1,
        username: 'admin',
        role: 'admin' as any,
        permissions: ['document:import'],
        usedStorage: 95 * 1024 * 1024 // 95MB已使用
      };
      mockRequest.file = {
        originalname: 'document.pdf',
        mimetype: 'application/pdf',
        size: 10 * 1024 * 1024 // 10MB
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(413);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Storage quota exceeded',
        quota: '100MB',
        used: '95MB',
        required: '10MB'
      });
    });

    it('应该检查幼儿园上下文权限', async () => {
      const middleware = documentImportPermission({
        requireKindergartenContext: true
      });
      
      mockRequest.user = {
        id: 1,
        username: 'teacher',
        role: 'teacher',
        kindergartenId: 1,
        permissions: ['document:import']
      };
      mockRequest.params = { kindergartenId: '2' }; // 不同的幼儿园

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Cannot import documents for this kindergarten',
        userKindergarten: 1,
        targetKindergarten: 2
      });
    });

    it('应该检查文档重复性', async () => {
      const middleware = documentImportPermission({
        checkDuplicates: true
      });
      
      mockRequest.user = {
        id: 1,
        username: 'admin',
        role: 'admin' as any,
        permissions: ['document:import']
      };
      mockRequest.file = {
        originalname: 'existing-document.pdf',
        mimetype: 'application/pdf',
        size: 1024
      };

      // 模拟已存在相同文档
      mockDocument.findAll.mockResolvedValue([
        { id: 1, filename: 'existing-document.pdf', checksum: 'abc123' }
      ]);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Document already exists',
        existingDocument: {
          id: 1,
          filename: 'existing-document.pdf'
        }
      });
    });
  });

  describe('安全检查', () => {
    it('应该检查文件内容安全性', async () => {
      const middleware = documentImportPermission({
        scanForMalware: true
      });
      
      mockRequest.user = {
        id: 1,
        username: 'admin',
        role: 'admin' as any,
        permissions: ['document:import']
      };
      mockRequest.file = {
        originalname: 'suspicious.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        path: '/tmp/suspicious.pdf'
      };

      // 模拟恶意软件扫描结果
      const mockVirusScanner = {
        scan: jest.fn().mockResolvedValue({
          isClean: false,
          threats: ['Trojan.Generic']
        })
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Malware detected in uploaded file'),
        expect.objectContaining({
          filename: 'suspicious.pdf',
          threats: expect.any(Array)
        })
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'File contains malicious content',
        threats: ['Trojan.Generic']
      });
    });

    it('应该检查文件名安全性', async () => {
      const middleware = documentImportPermission({
        sanitizeFilenames: true
      });
      
      mockRequest.user = {
        id: 1,
        username: 'admin',
        role: 'admin' as any,
        permissions: ['document:import']
      };
      mockRequest.file = {
        originalname: '../../../etc/passwd',
        mimetype: 'text/plain',
        size: 1024
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid filename detected',
        filename: '../../../etc/passwd',
        reason: 'Path traversal attempt'
      });
    });

    it('应该检查文件内容类型一致性', async () => {
      const middleware = documentImportPermission({
        validateMimeType: true
      });
      
      mockRequest.user = {
        id: 1,
        username: 'admin',
        role: 'admin' as any,
        permissions: ['document:import']
      };
      mockRequest.file = {
        originalname: 'document.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('This is not a PDF file')
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'File content does not match declared type',
        declaredType: 'application/pdf',
        actualType: 'text/plain'
      });
    });
  });

  describe('审计和日志', () => {
    it('应该记录导入尝试', async () => {
      const middleware = documentImportPermission({
        auditImports: true
      });
      
      mockRequest.user = {
        id: 1,
        username: 'admin',
        role: 'admin' as any,
        permissions: ['document:import']
      };
      mockRequest.file = {
        originalname: 'document.pdf',
        mimetype: 'application/pdf',
        size: 1024
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Document import attempt'),
        expect.objectContaining({
          userId: 1,
          username: 'admin',
          filename: 'document.pdf',
          fileSize: 1024,
          timestamp: expect.any(Number)
        })
      );
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该记录权限拒绝', async () => {
      const middleware = documentImportPermission();
      
      mockRequest.user = {
        id: 2,
        username: 'user',
        role: 'user',
        permissions: ['document:read']
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Document import permission denied'),
        expect.objectContaining({
          userId: 2,
          username: 'user',
          requiredPermission: 'document:import',
          userPermissions: ['document:read']
        })
      );
    });

    it('应该记录安全事件', async () => {
      const middleware = documentImportPermission({
        sanitizeFilenames: true
      });
      
      mockRequest.user = {
        id: 1,
        username: 'admin',
        role: 'admin' as any,
        permissions: ['document:import']
      };
      mockRequest.file = {
        originalname: '../../../../etc/shadow',
        mimetype: 'text/plain',
        size: 1024
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Security violation in document import'),
        expect.objectContaining({
          userId: 1,
          filename: '../../../../etc/shadow',
          violationType: 'path_traversal',
          ip: expect.any(String)
        })
      );
    });
  });

  describe('错误处理', () => {
    it('应该处理数据库查询错误', async () => {
      const middleware = documentImportPermission({
        checkDuplicates: true
      });
      
      mockRequest.user = {
        id: 1,
        username: 'admin',
        role: 'admin' as any,
        permissions: ['document:import']
      };

      const dbError = new Error('Database connection failed');
      mockDocument.findAll.mockRejectedValue(dbError);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Database error in document import permission check'),
        expect.objectContaining({
          error: dbError.message
        })
      );
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Permission check failed'
      });
    });

    it('应该处理文件系统错误', async () => {
      const middleware = documentImportPermission({
        validateMimeType: true
      });
      
      mockRequest.user = {
        id: 1,
        username: 'admin',
        role: 'admin' as any,
        permissions: ['document:import']
      };
      mockRequest.file = {
        originalname: 'document.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        path: '/tmp/nonexistent.pdf'
      };

      const fsError = new Error('File not found');
      mockFs.existsSync.mockReturnValue(false);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('File system error in document import'),
        expect.objectContaining({
          error: expect.any(String)
        })
      );
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe('配置选项', () => {
    it('应该支持自定义权限检查器', async () => {
      const customPermissionChecker = jest.fn().mockReturnValue(true);
      
      const middleware = documentImportPermission({
        customPermissionChecker
      });
      
      mockRequest.user = {
        id: 1,
        username: 'custom_user',
        role: 'custom_role'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(customPermissionChecker).toHaveBeenCalledWith(mockRequest.user, mockRequest);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该支持动态配置', async () => {
      const dynamicConfig = jest.fn().mockReturnValue({
        maxFileSize: 10 * 1024 * 1024,
        allowedFileTypes: ['.pdf', '.docx']
      });
      
      const middleware = documentImportPermission({
        dynamicConfig
      });
      
      mockRequest.user = {
        id: 1,
        username: 'admin',
        role: 'admin' as any,
        permissions: ['document:import']
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(dynamicConfig).toHaveBeenCalledWith(mockRequest.user, mockRequest);
    });

    it('应该支持条件性检查', async () => {
      const middleware = documentImportPermission({
        conditionalChecks: {
          rateLimitPerHour: (user: any) => user.role !== 'admin' ? 5 : 100,
          maxFileSize: (user: any) => user.role === 'premium' ? 50 * 1024 * 1024 : 10 * 1024 * 1024
        }
      });
      
      mockRequest.user = {
        id: 1,
        username: 'premium_user',
        role: 'premium',
        permissions: ['document:import']
      };
      mockRequest.file = {
        originalname: 'large-document.pdf',
        mimetype: 'application/pdf',
        size: 30 * 1024 * 1024 // 30MB
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('集成测试', () => {
    it('应该与文件上传中间件集成', async () => {
      const middleware = documentImportPermission({
        requireFile: true,
        allowedFileTypes: ['.pdf'],
        maxFileSize: 5 * 1024 * 1024
      });
      
      mockRequest.user = {
        id: 1,
        username: 'admin',
        role: 'admin' as any,
        permissions: ['document:import']
      };
      mockRequest.file = {
        originalname: 'valid-document.pdf',
        mimetype: 'application/pdf',
        size: 2 * 1024 * 1024
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockResponse.locals.importPermissionGranted).toBe(true);
    });

    it('应该与认证和授权中间件集成', async () => {
      const middleware = documentImportPermission({
        requireKindergartenContext: true,
        documentType: 'student_records'
      });
      
      mockRequest.user = {
        id: 1,
        username: 'teacher',
        role: 'teacher',
        kindergartenId: 1,
        permissions: ['document:import', 'student_records:import']
      };
      mockRequest.params = { kindergartenId: '1' };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该处理完整的导入流程', async () => {
      const middleware = documentImportPermission({
        requireFile: true,
        allowedFileTypes: ['.xlsx'],
        maxFileSize: 10 * 1024 * 1024,
        checkDuplicates: true,
        rateLimitPerHour: 20,
        auditImports: true
      });
      
      mockRequest.user = {
        id: 1,
        username: 'admin',
        role: 'admin' as any,
        permissions: ['document:import']
      };
      mockRequest.file = {
        originalname: 'student-data.xlsx',
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: 5 * 1024 * 1024
      };

      mockDocument.findAll.mockResolvedValue([]); // 无重复文档
      mockDocument.count.mockResolvedValue(5); // 当前小时内导入5个文档

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Document import attempt'),
        expect.any(Object)
      );
      expect(mockNext).toHaveBeenCalledWith();
    });
  });
});
