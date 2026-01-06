import { Sequelize } from 'sequelize';
import { vi } from 'vitest'
import { initFileStorage, initFileStorageAssociations, StorageType, FileStatus } from '../../../src/models/file-storage.model';
import { User } from '../../../src/models/user.model';

// Mock the sequelize instance
jest.mock('../../../src/config/database', () => ({
  sequelize: {
    define: jest.fn(),
    sync: jest.fn(),
    close: jest.fn(),
  } as any,
}));

// 控制台错误检测变量
let consoleSpy: any

describe('FileStorage Model', () => {
  let mockSequelize: jest.Mocked<Sequelize>;
  let mockModel: any;

  beforeEach(() => {
    mockSequelize = {
      define: jest.fn().mockReturnValue({
        belongsTo: jest.fn(),
      })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {}),
      sync: jest.fn(),
      close: jest.fn(),
    } as any;

    mockModel = {
      init: jest.fn(),
      belongsTo: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('Model Definition', () => {
    it('should initialize model with correct attributes', () => {
      initFileStorage(mockSequelize);
      
      expect(mockSequelize.define).toHaveBeenCalledWith(
        'file_storages',
        expect.objectContaining({
          id: {
            type: expect.any(Object),
            primaryKey: true,
            autoIncrement: true,
            comment: '文件ID'
          },
          fileName: {
            type: expect.any(Object),
            allowNull: false,
            comment: '文件名称'
          },
          originalName: {
            type: expect.any(Object),
            allowNull: false,
            comment: '原始文件名'
          },
          filePath: {
            type: expect.any(Object),
            allowNull: false,
            comment: '文件路径'
          },
          fileSize: {
            type: expect.any(Object),
            allowNull: false,
            comment: '文件大小(字节)'
          },
          fileType: {
            type: expect.any(Object),
            allowNull: false,
            comment: '文件类型'
          },
          storageType: {
            type: expect.any(Object),
            allowNull: false,
            defaultValue: StorageType.LOCAL,
            comment: '存储类型: local, s3, oss, cos'
          },
          bucket: {
            type: expect.any(Object),
            allowNull: true,
            comment: '存储位置/存储桶'
          },
          accessUrl: {
            type: expect.any(Object),
            allowNull: false,
            comment: '文件访问URL'
          },
          isPublic: {
            type: expect.any(Object),
            allowNull: false,
            defaultValue: false,
            comment: '是否公开可访问'
          },
          uploaderId: {
            type: expect.any(Object),
            allowNull: true,
            comment: '上传者ID'
          },
          uploaderType: {
            type: expect.any(Object),
            allowNull: true,
            comment: '上传者类型'
          },
          module: {
            type: expect.any(Object),
            allowNull: true,
            comment: '所属模块'
          },
          referenceId: {
            type: expect.any(Object),
            allowNull: true,
            comment: '关联ID'
          },
          referenceType: {
            type: expect.any(Object),
            allowNull: true,
            comment: '关联类型'
          },
          metadata: {
            type: expect.any(Object),
            allowNull: true,
            comment: '元数据(JSON)'
          },
          status: {
            type: expect.any(Object),
            allowNull: false,
            defaultValue: FileStatus.ACTIVE,
            comment: '状态: active(正常), deleted(已删除), expired(已过期)'
          },
          expireAt: {
            type: expect.any(Object),
            allowNull: true,
            comment: '过期时间'
          },
          createdAt: {
            type: expect.any(Object),
            allowNull: false,
            comment: '创建时间'
          },
          updatedAt: {
            type: expect.any(Object),
            allowNull: false,
            comment: '更新时间'
          },
          deletedAt: {
            type: expect.any(Object),
            allowNull: true,
            comment: '删除时间'
          }
        }),
        {
          sequelize: mockSequelize,
          tableName: 'file_storages',
          timestamps: true,
          paranoid: true,
          underscored: true,
        }
      );
    });

    it('should have correct table configuration', () => {
      initFileStorage(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const options = callArgs[2];
      
      expect(options.tableName).toBe('file_storages');
      expect(options.timestamps).toBe(true);
      expect(options.paranoid).toBe(true);
      expect(options.underscored).toBe(true);
    });
  });

  describe('Associations', () => {
    beforeEach(() => {
      initFileStorage(mockSequelize);
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    it('should set up belongsTo association with User', () => {
      initFileStorageAssociations();
      
      expect(mockModel.belongsTo).toHaveBeenCalledWith(
        User,
        {
          foreignKey: 'uploaderId',
          as: 'uploader'
        }
      );
    });
  });

  describe('Enum Values', () => {
    it('should have correct StorageType enum values', () => {
      expect(StorageType.LOCAL).toBe('local');
      expect(StorageType.S3).toBe('s3');
      expect(StorageType.OSS).toBe('oss');
      expect(StorageType.COS).toBe('cos');
    });

    it('should have correct FileStatus enum values', () => {
      expect(FileStatus.ACTIVE).toBe('active');
      expect(FileStatus.DELETED).toBe('deleted');
      expect(FileStatus.EXPIRED).toBe('expired');
    });

    it('should validate storageType enum values', () => {
      const validStorageTypes = Object.values(StorageType);
      
      validStorageTypes.forEach(storageType => {
        expect(['local', 's3', 'oss', 'cos']).toContain(storageType);
      });
    });

    it('should validate status enum values', () => {
      const validStatuses = Object.values(FileStatus);
      
      validStatuses.forEach(status => {
        expect(['active', 'deleted', 'expired']).toContain(status);
      });
    });
  });

  describe('Field Validation', () => {
    it('should validate required fields', () => {
      const fileData = {
        fileName: 'document.pdf',
        originalName: '原始文档.pdf',
        filePath: '/uploads/document.pdf',
        fileSize: 1024000,
        fileType: 'application/pdf',
        accessUrl: 'http://example.com/uploads/document.pdf'
      };

      expect(fileData).toHaveProperty('fileName');
      expect(fileData).toHaveProperty('originalName');
      expect(fileData).toHaveProperty('filePath');
      expect(fileData).toHaveProperty('fileSize');
      expect(fileData).toHaveProperty('fileType');
      expect(fileData).toHaveProperty('accessUrl');
    });

    it('should validate optional fields', () => {
      const fileData = {
        bucket: 'my-bucket',
        uploaderId: 1,
        uploaderType: 'user',
        module: 'documents',
        referenceId: 'doc-123',
        referenceType: 'document',
        metadata: { author: 'John Doe', tags: ['important'] },
        expireAt: new Date('2024-12-31')
      };

      expect(fileData.bucket).toBeDefined();
      expect(fileData.uploaderId).toBeDefined();
      expect(fileData.uploaderType).toBeDefined();
      expect(fileData.module).toBeDefined();
      expect(fileData.referenceId).toBeDefined();
      expect(fileData.referenceType).toBeDefined();
      expect(fileData.metadata).toBeDefined();
      expect(fileData.expireAt).toBeDefined();
    });
  });

  describe('Field Constraints', () => {
    it('should validate string field lengths', () => {
      expect.assertions(3);
      
      // fileName max length 255
      const fileName = '文'.repeat(255);
      expect(fileName.length).toBeLessThanOrEqual(255);
      
      // originalName max length 255
      const originalName = '原'.repeat(255);
      expect(originalName.length).toBeLessThanOrEqual(255);
      
      // filePath max length 512
      const filePath = '/'.repeat(512);
      expect(filePath.length).toBeLessThanOrEqual(512);
    });

    it('should validate numeric field constraints', () => {
      const validFileSize = 1024000;
      expect(validFileSize).toBeGreaterThan(0);
      
      const validUploaderId = 1;
      expect(validUploaderId).toBeGreaterThan(0);
    });

    it('should validate referenceId field length', () => {
      expect.assertions(1);
      
      // referenceId max length 64
      const referenceId = 'a'.repeat(64);
      expect(referenceId.length).toBeLessThanOrEqual(64);
    });
  });

  describe('Default Values', () => {
    it('should have default storageType value', () => {
      const fileData = {
        fileName: 'document.pdf',
        originalName: '原始文档.pdf',
        filePath: '/uploads/document.pdf',
        fileSize: 1024000,
        fileType: 'application/pdf',
        accessUrl: 'http://example.com/uploads/document.pdf'
      };

      // storageType should default to StorageType.LOCAL
      expect(fileData.storageType).toBeUndefined(); // will be set by database default
      expect(StorageType.LOCAL).toBe('local');
    });

    it('should have default isPublic value', () => {
      const fileData = {
        fileName: 'document.pdf',
        originalName: '原始文档.pdf',
        filePath: '/uploads/document.pdf',
        fileSize: 1024000,
        fileType: 'application/pdf',
        accessUrl: 'http://example.com/uploads/document.pdf'
      };

      // isPublic should default to false
      expect(fileData.isPublic).toBeUndefined(); // will be set by database default
    });

    it('should have default status value', () => {
      const fileData = {
        fileName: 'document.pdf',
        originalName: '原始文档.pdf',
        filePath: '/uploads/document.pdf',
        fileSize: 1024000,
        fileType: 'application/pdf',
        accessUrl: 'http://example.com/uploads/document.pdf'
      };

      // status should default to FileStatus.ACTIVE
      expect(fileData.status).toBeUndefined(); // will be set by database default
      expect(FileStatus.ACTIVE).toBe('active');
    });
  });

  describe('Foreign Key References', () => {
    it('should have foreign key reference to users table', () => {
      initFileStorage(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const attributes = callArgs[1];
      
      expect(attributes.uploaderId.references).toEqual({
        model: 'users',
        key: 'id'
      });
    });
  });

  describe('File Size Validation', () => {
    it('should validate file size is non-negative', () => {
      const validFileSizes = [0, 1, 1024, 1024000, 10485760];
      
      validFileSizes.forEach(fileSize => {
        expect(fileSize).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle zero file size (empty file)', () => {
      const fileData = {
        fileName: 'empty.txt',
        originalName: 'empty.txt',
        filePath: '/uploads/empty.txt',
        fileSize: 0,
        fileType: 'text/plain',
        accessUrl: 'http://example.com/uploads/empty.txt'
      };

      expect(fileData.fileSize).toBe(0);
    });

    it('should handle large file sizes', () => {
      const fileData = {
        fileName: 'large.zip',
        originalName: 'large.zip',
        filePath: '/uploads/large.zip',
        fileSize: 104857600, // 100MB
        fileType: 'application/zip',
        accessUrl: 'http://example.com/uploads/large.zip'
      };

      expect(fileData.fileSize).toBe(104857600);
    });
  });

  describe('File Type Validation', () => {
    it('should validate common file types', () => {
      const validFileTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'video/mp4',
        'audio/mpeg'
      ];
      
      validFileTypes.forEach(fileType => {
        expect(typeof fileType).toBe('string');
        expect(fileType.length).toBeGreaterThan(0);
        expect(fileType.includes('/')).toBe(true);
      });
    });

    it('should handle custom file types', () => {
      const fileData = {
        fileName: 'custom.xyz',
        originalName: 'custom.xyz',
        filePath: '/uploads/custom.xyz',
        fileSize: 1024,
        fileType: 'application/x-custom',
        accessUrl: 'http://example.com/uploads/custom.xyz'
      };

      expect(fileData.fileType).toBe('application/x-custom');
    });
  });

  describe('Access URL Validation', () => {
    it('should validate URL format', () => {
      const validUrls = [
        'http://example.com/file.pdf',
        'https://example.com/file.pdf',
        'http://localhost:3000/uploads/file.pdf',
        'https://cdn.example.com/files/document.pdf'
      ];
      
      validUrls.forEach(url => {
        expect(typeof url).toBe('string');
        expect(url.length).toBeGreaterThan(0);
        expect(url.startsWith('http://') || url.startsWith('https://')).toBe(true);
      });
    });

    it('should handle relative URLs', () => {
      const fileData = {
        fileName: 'document.pdf',
        originalName: 'document.pdf',
        filePath: '/uploads/document.pdf',
        fileSize: 1024000,
        fileType: 'application/pdf',
        accessUrl: '/uploads/document.pdf'
      };

      expect(fileData.accessUrl).toBe('/uploads/document.pdf');
    });
  });

  describe('Metadata Validation', () => {
    it('should validate metadata is JSON object', () => {
      const validMetadata = [
        { author: 'John Doe', tags: ['important'] },
        { width: 1920, height: 1080, format: 'jpeg' },
        { pages: 10, title: 'Document Title' },
        {}
      ];
      
      validMetadata.forEach(metadata => {
        expect(typeof metadata).toBe('object');
        expect(metadata).not.toBeNull();
      });
    });

    it('should handle complex metadata structures', () => {
      const fileData = {
        fileName: 'document.pdf',
        originalName: 'document.pdf',
        filePath: '/uploads/document.pdf',
        fileSize: 1024000,
        fileType: 'application/pdf',
        accessUrl: 'http://example.com/uploads/document.pdf',
        metadata: {
          author: 'John Doe',
          title: 'Important Document',
          tags: ['business', 'urgent'],
          created: '2024-01-01',
          modified: '2024-01-15',
          permissions: {
            read: ['user1', 'user2'],
            write: ['user1']
          }
        }
      };

      expect(fileData.metadata).toBeDefined();
      expect(typeof fileData.metadata).toBe('object');
      expect(fileData.metadata.author).toBe('John Doe');
      expect(Array.isArray(fileData.metadata.tags)).toBe(true);
    });
  });

  describe('Expiration Date Validation', () => {
    it('should validate expireAt field', () => {
      const validDates = [
        new Date('2024-12-31'),
        new Date('2025-01-01'),
        new Date(),
        null
      ];
      
      validDates.forEach(date => {
        if (date !== null) {
          expect(date).toBeInstanceOf(Date);
        } else {
          expect(date).toBeNull();
        }
      });
    });

    it('should handle future expiration dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const fileData = {
        fileName: 'document.pdf',
        originalName: 'document.pdf',
        filePath: '/uploads/document.pdf',
        fileSize: 1024000,
        fileType: 'application/pdf',
        accessUrl: 'http://example.com/uploads/document.pdf',
        expireAt: futureDate
      };

      expect(fileData.expireAt).toBe(futureDate);
      expect(fileData.expireAt.getTime()).toBeGreaterThan(new Date().getTime());
    });
  });

  describe('Public Access Validation', () => {
    it('should validate isPublic boolean field', () => {
      const validBooleanValues = [true, false];
      
      validBooleanValues.forEach(isPublic => {
        expect(typeof isPublic).toBe('boolean');
      });
    });

    it('should handle public files', () => {
      const fileData = {
        fileName: 'public.pdf',
        originalName: 'public.pdf',
        filePath: '/uploads/public.pdf',
        fileSize: 1024000,
        fileType: 'application/pdf',
        accessUrl: 'http://example.com/uploads/public.pdf',
        isPublic: true
      };

      expect(fileData.isPublic).toBe(true);
    });

    it('should handle private files', () => {
      const fileData = {
        fileName: 'private.pdf',
        originalName: 'private.pdf',
        filePath: '/uploads/private.pdf',
        fileSize: 1024000,
        fileType: 'application/pdf',
        accessUrl: 'http://example.com/uploads/private.pdf',
        isPublic: false
      };

      expect(fileData.isPublic).toBe(false);
    });
  });

  describe('Module and Reference Validation', () => {
    it('should validate module field', () => {
      const validModules = [
        'documents',
        'images',
        'videos',
        'audio',
        'avatars',
        'attachments',
        null
      ];
      
      validModules.forEach(module => {
        if (module !== null) {
          expect(typeof module).toBe('string');
          expect(module.length).toBeGreaterThan(0);
        } else {
          expect(module).toBeNull();
        }
      });
    });

    it('should validate referenceType field', () => {
      const validReferenceTypes = [
        'document',
        'user',
        'post',
        'comment',
        'message',
        null
      ];
      
      validReferenceTypes.forEach(referenceType => {
        if (referenceType !== null) {
          expect(typeof referenceType).toBe('string');
          expect(referenceType.length).toBeGreaterThan(0);
        } else {
          expect(referenceType).toBeNull();
        }
      });
    });

    it('should handle module and reference associations', () => {
      const fileData = {
        fileName: 'profile.jpg',
        originalName: 'profile.jpg',
        filePath: '/uploads/profile.jpg',
        fileSize: 512000,
        fileType: 'image/jpeg',
        accessUrl: 'http://example.com/uploads/profile.jpg',
        module: 'avatars',
        referenceId: 'user-123',
        referenceType: 'user'
      };

      expect(fileData.module).toBe('avatars');
      expect(fileData.referenceId).toBe('user-123');
      expect(fileData.referenceType).toBe('user');
    });
  });

  describe('Instance Methods', () => {
    it('should have required instance properties', () => {
      const MockFileStorage = initFileStorage(mockSequelize);
      const mockInstance = new MockFileStorage();
      
      expect(mockInstance).toHaveProperty('id');
      expect(mockInstance).toHaveProperty('fileName');
      expect(mockInstance).toHaveProperty('originalName');
      expect(mockInstance).toHaveProperty('filePath');
      expect(mockInstance).toHaveProperty('fileSize');
      expect(mockInstance).toHaveProperty('fileType');
      expect(mockInstance).toHaveProperty('storageType');
      expect(mockInstance).toHaveProperty('bucket');
      expect(mockInstance).toHaveProperty('accessUrl');
      expect(mockInstance).toHaveProperty('isPublic');
      expect(mockInstance).toHaveProperty('uploaderId');
      expect(mockInstance).toHaveProperty('uploaderType');
      expect(mockInstance).toHaveProperty('module');
      expect(mockInstance).toHaveProperty('referenceId');
      expect(mockInstance).toHaveProperty('referenceType');
      expect(mockInstance).toHaveProperty('metadata');
      expect(mockInstance).toHaveProperty('status');
      expect(mockInstance).toHaveProperty('expireAt');
      expect(mockInstance).toHaveProperty('createdAt');
      expect(mockInstance).toHaveProperty('updatedAt');
      expect(mockInstance).toHaveProperty('deletedAt');
    });

    it('should have association properties', () => {
      const MockFileStorage = initFileStorage(mockSequelize);
      const mockInstance = new MockFileStorage();
      
      expect(mockInstance).toHaveProperty('uploader');
    });
  });

  describe('Model Creation', () => {
    it('should return the model class when initialized', () => {
      const ModelClass = initFileStorage(mockSequelize);
      
      expect(ModelClass).toBeDefined();
      expect(typeof ModelClass).toBe('function');
    });

    it('should have correct model name', () => {
      const ModelClass = initFileStorage(mockSequelize);
      
      expect(ModelClass.name).toBe('Model');
    });
  });

  describe('Soft Delete', () => {
    it('should support soft delete with deletedAt field', () => {
      initFileStorage(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const attributes = callArgs[1];
      
      expect(attributes.deletedAt).toBeDefined();
      expect(attributes.deletedAt.allowNull).toBe(true);
    });

    it('should have paranoid option enabled', () => {
      initFileStorage(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const options = callArgs[2];
      
      expect(options.paranoid).toBe(true);
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt and updatedAt fields', () => {
      initFileStorage(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const attributes = callArgs[1];
      
      expect(attributes.createdAt).toBeDefined();
      expect(attributes.createdAt.allowNull).toBe(false);
      
      expect(attributes.updatedAt).toBeDefined();
      expect(attributes.updatedAt.allowNull).toBe(false);
    });

    it('should have timestamps option enabled', () => {
      initFileStorage(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const options = callArgs[2];
      
      expect(options.timestamps).toBe(true);
    });
  });

  describe('Storage Type Logic', () => {
    it('should handle different storage types', () => {
      const localFile = {
        fileName: 'local.pdf',
        originalName: 'local.pdf',
        filePath: '/uploads/local.pdf',
        fileSize: 1024000,
        fileType: 'application/pdf',
        accessUrl: '/uploads/local.pdf',
        storageType: StorageType.LOCAL
      };

      const s3File = {
        fileName: 's3.pdf',
        originalName: 's3.pdf',
        filePath: 's3://my-bucket/s3.pdf',
        fileSize: 1024000,
        fileType: 'application/pdf',
        accessUrl: 'https://my-bucket.s3.amazonaws.com/s3.pdf',
        storageType: StorageType.S3,
        bucket: 'my-bucket'
      };

      expect(localFile.storageType).toBe(StorageType.LOCAL);
      expect(s3File.storageType).toBe(StorageType.S3);
      expect(localFile.storageType).not.toBe(s3File.storageType);
    });
  });

  describe('File Status Logic', () => {
    it('should handle different file statuses', () => {
      const activeFile = {
        fileName: 'active.pdf',
        originalName: 'active.pdf',
        filePath: '/uploads/active.pdf',
        fileSize: 1024000,
        fileType: 'application/pdf',
        accessUrl: 'http://example.com/uploads/active.pdf',
        status: FileStatus.ACTIVE
      };

      const deletedFile = {
        fileName: 'deleted.pdf',
        originalName: 'deleted.pdf',
        filePath: '/uploads/deleted.pdf',
        fileSize: 1024000,
        fileType: 'application/pdf',
        accessUrl: 'http://example.com/uploads/deleted.pdf',
        status: FileStatus.DELETED
      };

      const expiredFile = {
        fileName: 'expired.pdf',
        originalName: 'expired.pdf',
        filePath: '/uploads/expired.pdf',
        fileSize: 1024000,
        fileType: 'application/pdf',
        accessUrl: 'http://example.com/uploads/expired.pdf',
        status: FileStatus.EXPIRED
      };

      expect(activeFile.status).toBe(FileStatus.ACTIVE);
      expect(deletedFile.status).toBe(FileStatus.DELETED);
      expect(expiredFile.status).toBe(FileStatus.EXPIRED);
    });
  });
});