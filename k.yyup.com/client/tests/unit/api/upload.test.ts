import { describe, it, expect, vi, beforeEach } from 'vitest';
import { vi } from 'vitest'
import { 
  uploadFile, 
  uploadMultipleFiles, 
  uploadImage, 
  uploadAvatar, 
  uploadDocument,
  getFileList,
  getFileById,
  updateFile,
  deleteFile,
  getDownloadUrl,
  downloadFile,
  getFileStatistics,
  validateFileType,
  validateFileSize,
  formatFileSize,
  generateFileName
} from '@/api/upload';

// Mock the request module
vi.mock('@/utils/request', () => ({
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn()
}));

// Import the mocked request
import { request, get, post, put, del } from '@/utils/request';

// 控制台错误检测变量
let consoleSpy: any

describe('Upload API Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  describe('uploadFile', () => {
    it('should upload a single file successfully', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const mockResponse = {
        code: 200,
        message: 'Upload successful',
        data: {
          id: 1,
          fileName: 'test.txt',
          originalName: 'test.txt',
          filePath: '/uploads/test.txt',
          fileSize: 12,
          fileType: 'text/plain',
          uploadedAt: new Date().toISOString()
        }
      };

      (post as any).mockResolvedValue(mockResponse);

      const params = {
        folder: 'documents',
        isPublic: true,
        description: 'Test file'
      };

      const result = await uploadFile(mockFile, params);

      expect(post).toHaveBeenCalledWith('/api/upload', expect.any(FormData));
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle upload error', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const mockError = {
        code: 400,
        message: 'Upload failed',
        data: null
      };

      (post as any).mockResolvedValue(mockError);

      const result = await uploadFile(mockFile);

      expect(result).toBeNull();
    });
  });

  describe('uploadMultipleFiles', () => {
    it('should upload multiple files successfully', async () => {
      const mockFiles = [
        new File(['content1'], 'file1.txt', { type: 'text/plain' }),
        new File(['content2'], 'file2.txt', { type: 'text/plain' })
      ];
      const mockResponse = {
        code: 200,
        message: 'Upload successful',
        data: [
          {
            id: 1,
            fileName: 'file1.txt',
            originalName: 'file1.txt',
            filePath: '/uploads/file1.txt',
            fileSize: 8,
            fileType: 'text/plain',
            uploadedAt: new Date().toISOString()
          },
          {
            id: 2,
            fileName: 'file2.txt',
            originalName: 'file2.txt',
            filePath: '/uploads/file2.txt',
            fileSize: 8,
            fileType: 'text/plain',
            uploadedAt: new Date().toISOString()
          }
        ]
      };

      (post as any).mockResolvedValue(mockResponse);

      const params = {
        folder: 'documents',
        isPublic: true
      };

      const result = await uploadMultipleFiles(mockFiles, params);

      expect(post).toHaveBeenCalledWith('/api/upload/multiple', expect.any(FormData));
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle empty file list', async () => {
      const result = await uploadMultipleFiles([]);
      expect(result).toEqual([]);
    });
  });

  describe('uploadImage', () => {
    it('should upload image with compression options', async () => {
      const mockImage = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse = {
        code: 200,
        message: 'Upload successful',
        data: {
          id: 1,
          fileName: 'test.jpg',
          originalName: 'test.jpg',
          filePath: '/uploads/test.jpg',
          fileSize: 1024,
          fileType: 'image/jpeg',
          uploadedAt: new Date().toISOString()
        }
      };

      (post as any).mockResolvedValue(mockResponse);

      const options = {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.8,
        format: 'jpeg'
      };

      const result = await uploadImage(mockImage, options);

      expect(post).toHaveBeenCalledWith('/api/upload/image', expect.any(FormData));
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('uploadAvatar', () => {
    it('should upload avatar with square cropping', async () => {
      const mockAvatar = new File(['avatar content'], 'avatar.jpg', { type: 'image/jpeg' });
      const mockResponse = {
        code: 200,
        message: 'Upload successful',
        data: {
          id: 1,
          fileName: 'avatar.jpg',
          originalName: 'avatar.jpg',
          filePath: '/uploads/avatar.jpg',
          fileSize: 512,
          fileType: 'image/jpeg',
          uploadedAt: new Date().toISOString()
        }
      };

      (post as any).mockResolvedValue(mockResponse);

      const options = {
        size: 200,
        quality: 0.9
      };

      const result = await uploadAvatar(mockAvatar, options);

      expect(post).toHaveBeenCalledWith('/api/upload/avatar', expect.any(FormData));
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('uploadDocument', () => {
    it('should upload document with metadata', async () => {
      const mockDocument = new File(['document content'], 'document.pdf', { type: 'application/pdf' });
      const mockResponse = {
        code: 200,
        message: 'Upload successful',
        data: {
          id: 1,
          fileName: 'document.pdf',
          originalName: 'document.pdf',
          filePath: '/uploads/document.pdf',
          fileSize: 2048,
          fileType: 'application/pdf',
          uploadedAt: new Date().toISOString()
        }
      };

      (post as any).mockResolvedValue(mockResponse);

      const metadata = {
        title: 'Test Document',
        author: 'John Doe',
        keywords: ['test', 'document']
      };

      const result = await uploadDocument(mockDocument, metadata);

      expect(post).toHaveBeenCalledWith('/api/upload/document', expect.any(FormData));
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getFileList', () => {
    it('should get file list with pagination', async () => {
      const mockResponse = {
        code: 200,
        message: 'Success',
        data: {
          files: [
            {
              id: 1,
              fileName: 'file1.txt',
              originalName: 'file1.txt',
              filePath: '/uploads/file1.txt',
              fileSize: 1024,
              fileType: 'text/plain',
              uploadedAt: new Date().toISOString()
            }
          ],
          total: 1,
          page: 1,
          pageSize: 10
        }
      };

      (get as any).mockResolvedValue(mockResponse);

      const params = {
        page: 1,
        pageSize: 10,
        fileType: 'text/plain',
        folder: 'documents'
      };

      const result = await getFileList(params);

      expect(get).toHaveBeenCalledWith('/api/upload/list', params);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getFileById', () => {
    it('should get file by ID', async () => {
      const mockResponse = {
        code: 200,
        message: 'Success',
        data: {
          id: 1,
          fileName: 'file1.txt',
          originalName: 'file1.txt',
          filePath: '/uploads/file1.txt',
          fileSize: 1024,
          fileType: 'text/plain',
          uploadedAt: new Date().toISOString()
        }
      };

      (get as any).mockResolvedValue(mockResponse);

      const result = await getFileById(1);

      expect(get).toHaveBeenCalledWith('/api/upload/1');
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle file not found', async () => {
      const mockResponse = {
        code: 404,
        message: 'File not found',
        data: null
      };

      (get as any).mockResolvedValue(mockResponse);

      const result = await getFileById(999);

      expect(result).toBeNull();
    });
  });

  describe('updateFile', () => {
    it('should update file metadata', async () => {
      const mockResponse = {
        code: 200,
        message: 'Update successful',
        data: {
          id: 1,
          fileName: 'updated.txt',
          originalName: 'file1.txt',
          filePath: '/uploads/file1.txt',
          fileSize: 1024,
          fileType: 'text/plain',
          uploadedAt: new Date().toISOString()
        }
      };

      (put as any).mockResolvedValue(mockResponse);

      const updateData = {
        fileName: 'updated.txt',
        description: 'Updated description'
      };

      const result = await updateFile(1, updateData);

      expect(put).toHaveBeenCalledWith('/api/upload/1', updateData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      const mockResponse = {
        code: 200,
        message: 'Delete successful',
        data: true
      };

      (del as any).mockResolvedValue(mockResponse);

      const result = await deleteFile(1);

      expect(del).toHaveBeenCalledWith('/api/upload/1');
      expect(result).toBe(true);
    });

    it('should handle delete failure', async () => {
      const mockResponse = {
        code: 400,
        message: 'Delete failed',
        data: false
      };

      (del as any).mockResolvedValue(mockResponse);

      const result = await deleteFile(1);

      expect(result).toBe(false);
    });
  });

  describe('getDownloadUrl', () => {
    it('should generate download URL', () => {
      const url = getDownloadUrl(1);
      expect(url).toBe('/api/upload/1/download');
    });

    it('should generate download URL with filename', () => {
      const url = getDownloadUrl(1, 'test.txt');
      expect(url).toBe('/api/upload/1/download?filename=test.txt');
    });
  });

  describe('downloadFile', () => {
    it('should download file successfully', async () => {
      const mockBlob = new Blob(['file content'], { type: 'text/plain' });
      const mockResponse = {
        code: 200,
        message: 'Success',
        data: mockBlob
      };

      (get as any).mockResolvedValue(mockResponse);

      const result = await downloadFile(1);

      expect(get).toHaveBeenCalledWith('/api/upload/1/download', { responseType: 'blob' });
      expect(result).toEqual(mockBlob);
    });
  });

  describe('getFileStatistics', () => {
    it('should get file statistics', async () => {
      const mockResponse = {
        code: 200,
        message: 'Success',
        data: {
          totalFiles: 100,
          totalSize: 1048576,
          fileTypeDistribution: {
            'image/jpeg': 50,
            'text/plain': 30,
            'application/pdf': 20
          },
          uploadTrend: [
            { date: '2023-01-01', count: 10 },
            { date: '2023-01-02', count: 15 }
          ]
        }
      };

      (get as any).mockResolvedValue(mockResponse);

      const result = await getFileStatistics();

      expect(get).toHaveBeenCalledWith('/api/upload/statistics');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('validateFileType', () => {
    it('should validate allowed file types', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const allowedTypes = ['image/jpeg', 'image/png'];
      
      expect(validateFileType(file, allowedTypes)).toBe(true);
    });

    it('should reject disallowed file types', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const allowedTypes = ['image/jpeg', 'image/png'];
      
      expect(validateFileType(file, allowedTypes)).toBe(false);
    });
  });

  describe('validateFileSize', () => {
    it('should validate file size within limit', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB
      
      expect(validateFileSize(file, 2 * 1024 * 1024)).toBe(true); // 2MB limit
    });

    it('should reject file size over limit', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      Object.defineProperty(file, 'size', { value: 3 * 1024 * 1024 }); // 3MB
      
      expect(validateFileSize(file, 2 * 1024 * 1024)).toBe(false); // 2MB limit
    });
  });

  describe('formatFileSize', () => {
    it('should format file size in bytes', () => {
      expect(formatFileSize(500)).toBe('500 B');
    });

    it('should format file size in KB', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('should format file size in MB', () => {
      expect(formatFileSize(1572864)).toBe('1.5 MB');
    });

    it('should format file size in GB', () => {
      expect(formatFileSize(1610612736)).toBe('1.5 GB');
    });
  });

  describe('generateFileName', () => {
    it('should generate unique filename', () => {
      const fileName = generateFileName('test.txt');
      expect(fileName).toMatch(/^\d{13}_test\.txt$/);
    });

    it('should handle file without extension', () => {
      const fileName = generateFileName('test');
      expect(fileName).toMatch(/^\d{13}_test$/);
    });
  });

  describe('File Upload Network Error Scenarios', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      // Mock console methods to avoid test output noise
      vi.spyOn(console, 'error').mockImplementation(() => {})
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

    it('should handle file upload timeout errors', async () => {
      const largeFile = new File(['x'.repeat(10 * 1024 * 1024)], 'large-file.txt', {
        type: 'text/plain'
      });

      // 模拟上传超时
      (post as any).mockImplementation(() =>
        new Promise((_, reject) => {
          setTimeout(() => {
            const timeoutError = new Error('Upload timeout of 300000ms exceeded');
            timeoutError.code = 'ECONNABORTED';
            reject(timeoutError);
          }, 350000); // 超过5分钟超时
        })
      );

      const startTime = Date.now();

      try {
        await uploadFile(largeFile);
        fail('Should have thrown timeout error');
      } catch (error) {
        const endTime = Date.now();
        const duration = endTime - startTime;

        expect(error.message).toContain('timeout');
        expect(error.code).toBe('ECONNABORTED');
        expect(duration).toBeGreaterThan(300000);
      }
    }, 400000); // 增加测试超时时间

    it('should handle network disconnection during file upload', async () => {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });

      // 模拟网络断开
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      (post as any).mockRejectedValue({
        code: 'NETWORK_ERROR',
        message: 'Network request failed during upload',
        config: { url: '/api/upload/file' }
      });

      try {
        await uploadFile(file);
        fail('Should have thrown network error');
      } catch (error) {
        expect(error.message).toContain('upload failed');
        expect(error.code).toBe('NETWORK_ERROR');
      }
    });

    it('should handle server storage full error', async () => {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });

      (post as any).mockRejectedValue({
        response: {
          status: 507,
          statusText: 'Insufficient Storage',
          data: {
            success: false,
            error: 'STORAGE_FULL',
            message: '服务器存储空间不足',
            storage_info: {
              used_space: '9.8GB',
              total_space: '10GB',
              available_space: '200MB'
            }
          }
        }
      });

      try {
        await uploadFile(file);
        fail('Should have thrown storage full error');
      } catch (error) {
        expect(error.response.status).toBe(507);
        expect(error.response.data.error).toBe('STORAGE_FULL');
        expect(error.response.data.storage_info.used_space).toBe('9.8GB');
      }
    });

    it('should handle file size limit exceeded error', async () => {
      const oversizedFile = new File(['x'.repeat(50 * 1024 * 1024)], 'oversized.txt', {
        type: 'text/plain'
      });

      (post as any).mockRejectedValue({
        response: {
          status: 413,
          statusText: 'Payload Too Large',
          data: {
            success: false,
            error: 'FILE_TOO_LARGE',
            message: '上传文件大小超过限制',
            limits: {
              max_file_size: '10MB',
              uploaded_file_size: '50MB',
              remaining_quota: '5MB'
            }
          }
        }
      });

      try {
        await uploadFile(oversizedFile);
        fail('Should have thrown file size limit error');
      } catch (error) {
        expect(error.response.status).toBe(413);
        expect(error.response.data.error).toBe('FILE_TOO_LARGE');
        expect(error.response.data.limits.max_file_size).toBe('10MB');
      }
    });

    it('should handle unsupported file type error', async () => {
      const unsupportedFile = new File(['executable content'], 'malware.exe', {
        type: 'application/x-executable'
      });

      (post as any).mockRejectedValue({
        response: {
          status: 415,
          statusText: 'Unsupported Media Type',
          data: {
            success: false,
            error: 'UNSUPPORTED_FILE_TYPE',
            message: '不支持的文件类型',
            file_info: {
              detected_type: 'application/x-executable',
              allowed_types: ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'],
          safety_scan: {
            blocked: true,
            reason: 'Potentially dangerous file type'
          }
            }
          }
        }
      });

      try {
        await uploadFile(unsupportedFile);
        fail('Should have thrown unsupported file type error');
      } catch (error) {
        expect(error.response.status).toBe(415);
        expect(error.response.data.error).toBe('UNSUPPORTED_FILE_TYPE');
        expect(error.response.data.safety_scan.blocked).toBe(true);
      }
    });

    it('should handle concurrent upload conflicts', async () => {
      const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' });
      const file2 = new File(['content2'], 'file2.txt', { type: 'text/plain' });
      let uploadCount = 0;

      (post as any).mockImplementation(async (url, formData) => {
        uploadCount++;
        const fileName = formData.get('file')?.name;

        if (uploadCount === 1) {
          // 第一个上传延迟
          await new Promise(resolve => setTimeout(resolve, 1000));
          return {
            data: {
              success: true,
              data: {
                id: uploadCount,
                fileName: fileName,
                filePath: `/uploads/${fileName}`
              }
            }
          };
        } else if (uploadCount === 2 && fileName === 'conflict.txt') {
          // 第二个上传文件名冲突
          throw {
            response: {
              status: 409,
              data: {
                success: false,
                error: 'FILE_NAME_CONFLICT',
                message: '文件名已存在',
                conflict_info: {
                  existing_file: 'conflict.txt',
                  existing_path: '/uploads/conflict.txt',
                  upload_time: new Date().toISOString(),
                  suggested_name: 'conflict_1.txt'
                }
              }
            }
          };
        }

        return {
          data: {
            success: true,
            data: {
              id: uploadCount,
              fileName: fileName,
              filePath: `/uploads/${fileName}`
            }
          }
        };
      });

      // 同时上传两个文件
      const uploadPromises = [
        uploadFile(file1),
        uploadFile(file2)
      ];

      const results = await Promise.allSettled(uploadPromises);

      expect(uploadCount).toBe(2);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('fulfilled');
    });

    it('should implement upload retry mechanism for transient errors', async () => {
      const file = new File(['test content'], 'retry-test.txt', { type: 'text/plain' });
      let retryCount = 0;

      (post as any).mockImplementation(async () => {
        retryCount++;
        if (retryCount <= 2) {
          // 前两次失败
          throw {
            code: 'ECONNRESET',
            message: 'Connection reset during upload'
          };
        }
        // 第三次成功
        return {
          data: {
            success: true,
            data: {
              id: 1,
              fileName: 'retry-test.txt',
              filePath: '/uploads/retry-test.txt'
            }
          }
        };
      });

      // 实现带重试的上传
      const uploadWithRetry = async (file, maxRetries = 3) => {
        for (let i = 0; i <= maxRetries; i++) {
          try {
            return await uploadFile(file);
          } catch (error) {
            if (i === maxRetries || !isUploadRetryableError(error)) {
              throw error;
            }
            // 指数退避
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 2000));
          }
        }
      };

      const isUploadRetryableError = (error) => {
        const retryableCodes = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'NETWORK_ERROR'];
        return retryableCodes.includes(error.code);
      };

      const startTime = Date.now();
      const result = await uploadWithRetry(file);
      const endTime = Date.now();

      expect(retryCount).toBe(3);
      expect(result.fileName).toBe('retry-test.txt');
      expect(endTime - startTime).toBeGreaterThan(6000); // 2+4秒延迟
    });

    it('should handle upload progress interruption', async () => {
      const file = new File(['x'.repeat(1024 * 1024)], 'large.txt', { type: 'text/plain' });

      // 模拟进度跟踪和中断
      let progressCallback = null;

      (post as any).mockImplementation((url, formData, config) => {
        progressCallback = config?.onUploadProgress;

        return new Promise((resolve, reject) => {
          // 模拟进度中断
          setTimeout(() => {
            if (progressCallback) {
              progressCallback({ loaded: 512, total: 1024 });
            }
          }, 500);

          setTimeout(() => {
            reject({
              code: 'ECONNABORTED',
              message: 'Upload interrupted by user or network'
            });
          }, 800);
        });
      });

      try {
        await uploadFile(file, {
          onUploadProgress: (progress) => {
            expect(progress.loaded).toBe(512);
            expect(progress.total).toBe(1024);
          }
        });
        fail('Should have thrown upload interrupted error');
      } catch (error) {
        expect(error.code).toBe('ECONNABORTED');
        expect(error.message).toContain('interrupted');
      }
    });

    it('should handle virus scan failure during upload', async () => {
      const suspiciousFile = new File(['suspicious content'], 'scan-me.txt', { type: 'text/plain' });

      (post as any).mockRejectedValue({
        response: {
          status: 422,
          statusText: 'Unprocessable Entity',
          data: {
            success: false,
            error: 'VIRUS_DETECTED',
            message: '文件安全扫描检测到威胁',
            scan_result: {
              scanner: 'ClamAV',
              threats_found: ['Trojan.Generic'],
              file_cleaned: false,
              quarantine: true,
              scan_time: new Date().toISOString()
            }
          }
        }
      });

      try {
        await uploadFile(suspiciousFile);
        fail('Should have thrown virus detection error');
      } catch (error) {
        expect(error.response.status).toBe(422);
        expect(error.response.data.error).toBe('VIRUS_DETECTED');
        expect(error.response.data.scan_result.threats_found).toContain('Trojan.Generic');
        expect(error.response.data.scan_result.quarantine).toBe(true);
      }
    });

    it('should handle multipart upload boundary errors', async () => {
      const file = new File(['test content'], 'boundary-test.txt', { type: 'text/plain' });

      (post as any).mockRejectedValue({
        message: 'Multipart boundary not found',
        config: {
          headers: {
            'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundary'
          }
        }
      });

      try {
        await uploadFile(file);
        fail('Should have thrown multipart boundary error');
      } catch (error) {
        expect(error.message).toContain('upload failed');
        expect(error.config?.headers?.['Content-Type']).toContain('multipart/form-data');
      }
    });

    it('should handle upload quota exceeded', async () => {
      const file = new File(['test content'], 'quota-test.txt', { type: 'text/plain' });

      (post as any).mockRejectedValue({
        response: {
          status: 429,
          statusText: 'Too Many Requests',
          data: {
            success: false,
            error: 'UPLOAD_QUOTA_EXCEEDED',
            message: '上传配额已用完',
            quota_info: {
              daily_limit: '100MB',
              daily_used: '100MB',
              daily_remaining: '0MB',
              reset_time: new Date(Date.now() + 86400000).toISOString()
            }
          }
        }
      });

      try {
        await uploadFile(file);
        fail('Should have thrown quota exceeded error');
      } catch (error) {
        expect(error.response.status).toBe(429);
        expect(error.response.data.error).toBe('UPLOAD_QUOTA_EXCEEDED');
        expect(error.response.data.quota_info.daily_used).toBe('100MB');
        expect(error.response.data.quota_info.reset_time).toBeDefined();
      }
    });
  });
});