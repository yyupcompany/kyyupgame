import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';
import {
  validateRequiredFields,
  validateFieldTypes
} from '../../../utils/data-validation';

// Mock the request module
vi.mock('@/utils/request', () => {
  const mockFn = vi.fn();
  return {
    request: {
      get: vi.fn(),
      post: vi.fn(),
      del: vi.fn(),
      delete: vi.fn(),
      request: mockFn
    }
  };
});

// Import after mocks
import {
  getSystemLogList,
  getSystemLogDetail,
  deleteSystemLog,
  batchDeleteSystemLogs,
  clearSystemLogs,
  exportSystemLogs,
  getLogs,
  getLogDetail,
  deleteLog,
  batchDeleteLogs,
  clearLogs,
  exportLogs
} from '@/api/modules/log';
import { request } from '@/utils/request';
const mockRequest = request as any;

// 控制台错误检测变量
let consoleSpy: any

describe('Log API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    expectNoConsoleErrors();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('System Log Functions', () => {
    describe('getSystemLogList', () => {
      it('should call request.get with correct endpoint and params', async () => {
        const mockParams = {
          page: 1,
          pageSize: 10,
          level: 'ERROR',
          module: 'auth'
        };
        const mockResponse = {
          success: true,
          data: {
            items: [{
              id: '1',
              level: 'ERROR',
              module: 'auth',
              message: 'Test error',
              timestamp: '2024-01-01T00:00:00Z'
            }],
            total: 1
          }
        };

        mockRequest.get.mockResolvedValue(mockResponse);

        const result = await getSystemLogList(mockParams);

        // 验证API调用
        expect(mockRequest.get).toHaveBeenCalledWith('/system-logs', { params: mockParams });

        // 验证响应结构
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data.items)).toBe(true);

        // 验证分页字段
        const validation = validateRequiredFields(result.data, ['items', 'total']);
        expect(validation.valid).toBe(true);

        // 验证列表项
        if (result.data.items.length > 0) {
          const itemValidation = validateRequiredFields(result.data.items[0], ['id', 'level', 'module', 'message']);
          expect(itemValidation.valid).toBe(true);

          const itemTypeValidation = validateFieldTypes(result.data.items[0], {
            id: 'string',
            level: 'string',
            module: 'string',
            message: 'string'
          });
          expect(itemTypeValidation.valid).toBe(true);
        }
      });

      it('should handle empty params', async () => {
        const mockResponse = {
          success: true,
          data: {
            items: [],
            total: 0
          }
        };
        
        mockRequest.get.mockResolvedValue(mockResponse);

        const result = await getSystemLogList();

        expect(mockRequest.get).toHaveBeenCalledWith('/system-logs', { params: undefined });
        expect(result).toEqual(mockResponse);
      });
    });

    describe('getSystemLogDetail', () => {
      it('should call request.get with correct endpoint and id', async () => {
        const mockId = '123';
        const mockResponse = {
          success: true,
          data: {
            id: mockId,
            level: 'ERROR',
            message: 'Test error message'
          }
        };
        
        mockRequest.get.mockResolvedValue(mockResponse);

        const result = await getSystemLogDetail(mockId);

        expect(mockRequest.get).toHaveBeenCalledWith(`/system-logs/${mockId}`);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('deleteSystemLog', () => {
      it('should call request.del with correct endpoint and id', async () => {
        const mockId = '123';
        const mockResponse = {
          success: true,
          data: {
            success: true
          }
        };
        
        mockRequest.del.mockResolvedValue(mockResponse);

        const result = await deleteSystemLog(mockId);

        expect(mockRequest.del).toHaveBeenCalledWith(`/system-logs/${mockId}`);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('batchDeleteSystemLogs', () => {
      it('should call request.del with correct endpoint and data', async () => {
        const mockIds = ['123', '456', '789'];
        const mockResponse = {
          success: true,
          data: {
            success: true,
            count: 3
          }
        };
        
        mockRequest.del.mockResolvedValue(mockResponse);

        const result = await batchDeleteSystemLogs(mockIds);

        expect(mockRequest.del).toHaveBeenCalledWith('/system-logs/batch', { data: { ids: mockIds } });
        expect(result).toEqual(mockResponse);
      });
    });

    describe('clearSystemLogs', () => {
      it('should call request.del with correct endpoint and params', async () => {
        const mockParams = {
          level: 'ERROR',
          module: 'auth',
          beforeDate: '2024-01-01'
        };
        const mockResponse = {
          success: true,
          data: {
            success: true,
            count: 100
          }
        };
        
        mockRequest.del.mockResolvedValue(mockResponse);

        const result = await clearSystemLogs(mockParams);

        expect(mockRequest.del).toHaveBeenCalledWith('/system-logs/clear', { data: mockParams });
        expect(result).toEqual(mockResponse);
      });

      it('should handle empty params', async () => {
        const mockResponse = {
          success: true,
          data: {
            success: true,
            count: 100
          }
        };
        
        mockRequest.del.mockResolvedValue(mockResponse);

        const result = await clearSystemLogs();

        expect(mockRequest.del).toHaveBeenCalledWith('/system-logs/clear', { data: undefined });
        expect(result).toEqual(mockResponse);
      });
    });

    describe('exportSystemLogs', () => {
      it('should call request.get with correct endpoint and params', async () => {
        const mockParams = {
          level: 'ERROR',
          module: 'auth',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          keyword: 'test'
        };
        const mockResponse = {
          success: true,
          data: {
            fileUrl: '/exports/logs-2024-01-01.pdf'
          }
        };
        
        mockRequest.get.mockResolvedValue(mockResponse);

        const result = await exportSystemLogs(mockParams);

        expect(mockRequest.get).toHaveBeenCalledWith('/system-logs/export', { 
          params: mockParams,
          responseType: 'blob'
        });
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('Enhanced Log Functions', () => {
    describe('getLogs', () => {
      it('should call request.get with correct endpoint and params', async () => {
        const mockParams = {
          page: 1,
          pageSize: 10,
          type: 'login',
          username: 'testuser',
          status: 'success'
        };
        const mockResponse = {
          success: true,
          data: {
            items: [],
            total: 0,
            page: 1,
            pageSize: 10
          }
        };
        
        mockRequest.get.mockResolvedValue(mockResponse);

        const result = await getLogs(mockParams);

        expect(mockRequest.get).toHaveBeenCalledWith('/system-logs', { params: mockParams });
        expect(result).toEqual(mockResponse);
      });
    });

    describe('getLogDetail', () => {
      it('should call request.get with correct endpoint and id', async () => {
        const mockId = 123;
        const mockResponse = {
          success: true,
          data: {
            id: mockId,
            type: 'login',
            username: 'testuser',
            status: 'success'
          }
        };
        
        mockRequest.get.mockResolvedValue(mockResponse);

        const result = await getLogDetail(mockId);

        expect(mockRequest.get).toHaveBeenCalledWith(`/system-logs/${mockId}`);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('deleteLog', () => {
      it('should call request.del with correct endpoint and id', async () => {
        const mockId = 123;
        const mockResponse = {
          success: true,
          data: null
        };
        
        mockRequest.del.mockResolvedValue(mockResponse);

        const result = await deleteLog(mockId);

        expect(mockRequest.del).toHaveBeenCalledWith(`/system-logs/${mockId}`);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('batchDeleteLogs', () => {
      it('should call request.request with correct method and data', async () => {
        const mockIds = [123, 456, 789];
        const mockResponse = {
          success: true,
          data: null
        };
        
        mockRequest.request.mockResolvedValue(mockResponse);

        const result = await batchDeleteLogs(mockIds);

        expect(mockRequest.request).toHaveBeenCalledWith({
          url: '/system-logs/batch',
          method: 'delete',
          data: { ids: mockIds }
        });
        expect(result).toEqual(mockResponse);
      });
    });

    describe('clearLogs', () => {
      it('should call request.request with correct method and data', async () => {
        const mockParams = {
          type: 'login',
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        };
        const mockResponse = {
          success: true,
          data: null
        };
        
        mockRequest.request.mockResolvedValue(mockResponse);

        const result = await clearLogs(mockParams);

        expect(mockRequest.request).toHaveBeenCalledWith({
          url: '/system-logs/clear',
          method: 'delete',
          data: mockParams
        });
        expect(result).toEqual(mockResponse);
      });
    });

    describe('exportLogs', () => {
      it('should call request.request with correct method, params and response type', async () => {
        const mockParams = {
          type: 'login',
          username: 'testuser',
          status: 'success'
        };
        const mockBlob = new Blob(['test data'], { type: 'text/csv' });
        const mockResponse = mockBlob;
        
        mockRequest.request.mockResolvedValue(mockResponse);

        const result = await exportLogs(mockParams);

        expect(mockRequest.request).toHaveBeenCalledWith({
          url: '/system-logs/export',
          method: 'get',
          params: mockParams,
          responseType: 'blob'
        });
        expect(result).toBe(mockBlob);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const mockError = new Error('Network error');
      mockRequest.get.mockRejectedValue(mockError);

      await expect(getSystemLogList()).rejects.toThrow('Network error');
    });

    it('should handle validation errors', async () => {
      const mockResponse = {
        success: false,
        message: 'Invalid parameters',
        data: null
      };
      mockRequest.get.mockResolvedValue(mockResponse);

      const result = await getSystemLogList();
      expect(result).toEqual(mockResponse);
    });

    it('should handle not found errors', async () => {
      const mockResponse = {
        success: false,
        message: 'Log not found',
        data: null
      };
      mockRequest.get.mockResolvedValue(mockResponse);

      const result = await getSystemLogDetail('nonexistent');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Parameter Validation', () => {
    it('should handle invalid log IDs', async () => {
      const invalidIds = ['', null, undefined];
      
      for (const invalidId of invalidIds) {
        await expect(getSystemLogDetail(invalidId as string)).resolves.not.toThrow();
      }
    });

    it('should handle empty batch operations', async () => {
      const mockResponse = {
        success: true,
        data: {
          success: true,
          count: 0
        }
      };
      
      mockRequest.del.mockResolvedValue(mockResponse);

      const result = await batchDeleteSystemLogs([]);
      expect(result).toEqual(mockResponse);
    });
  });
});