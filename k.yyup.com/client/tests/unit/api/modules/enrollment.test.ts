import { 
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

describe, it, expect, vi, beforeEach } from 'vitest';
import { enrollmentApi } from '@/api/modules/enrollment';
import { get, post, put, del } from '@/utils/request';
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';

// Mock the request module
vi.mock('@/utils/request', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}));

describe('Enrollment API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getApplications', () => {
    it('should call get with correct endpoint and params', async () => {
      const mockParams = {
        page: 1,
        pageSize: 10,
        status: 'PENDING'
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
      
      vi.mocked(get).mockResolvedValue(mockResponse);

      const result = await enrollmentApi.getApplications(mockParams);

      expect(get).toHaveBeenCalledWith('/enrollment/list', { params: mockParams });
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty params', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 10
        }
      };
      
      vi.mocked(get).mockResolvedValue(mockResponse);

      const result = await enrollmentApi.getApplications();

      expect(get).toHaveBeenCalledWith('/enrollment/list', { params: undefined });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getApplication', () => {
    it('should call get with correct endpoint and id', async () => {
      const mockId = '123';
      const mockResponse = {
        success: true,
        data: {
          id: mockId,
          studentName: 'Test Student',
          status: 'PENDING'
        }
      };
      
      vi.mocked(get).mockResolvedValue(mockResponse);

      const result = await enrollmentApi.getApplication(mockId);

      expect(get).toHaveBeenCalledWith(`/enrollment/applications/${mockId}`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createApplication', () => {
    it('should call post with correct endpoint and data', async () => {
      const mockData = {
        studentName: 'Test Student',
        parentName: 'Test Parent',
        parentPhone: '1234567890',
        age: 5,
        gender: 'male'
      };
      const mockResponse = {
        success: true,
        data: {
          id: '123',
          ...mockData,
          status: 'PENDING'
        }
      };
      
      vi.mocked(post).mockResolvedValue(mockResponse);

      const result = await enrollmentApi.createApplication(mockData);

      expect(post).toHaveBeenCalledWith('/enrollment/applications', mockData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateApplication', () => {
    it('should call put with correct endpoint, id and data', async () => {
      const mockId = '123';
      const mockData = {
        studentName: 'Updated Student'
      };
      const mockResponse = {
        success: true,
        data: {
          id: mockId,
          ...mockData
        }
      };
      
      vi.mocked(put).mockResolvedValue(mockResponse);

      const result = await enrollmentApi.updateApplication(mockId, mockData);

      expect(put).toHaveBeenCalledWith(`/enrollment/applications/${mockId}`, mockData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteApplication', () => {
    it('should call del with correct endpoint and id', async () => {
      const mockId = '123';
      const mockResponse = {
        success: true,
        message: 'Application deleted successfully'
      };
      
      vi.mocked(del).mockResolvedValue(mockResponse);

      const result = await enrollmentApi.deleteApplication(mockId);

      expect(del).toHaveBeenCalledWith(`/enrollment/applications/${mockId}`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('reviewApplication', () => {
    it('should call put with correct endpoint, id and review data', async () => {
      const mockId = '123';
      const mockReviewData = {
        status: 'APPROVED',
        notes: 'Good application'
      };
      const mockResponse = {
        success: true,
        data: {
          id: mockId,
          status: 'APPROVED'
        }
      };
      
      vi.mocked(put).mockResolvedValue(mockResponse);

      const result = await enrollmentApi.reviewApplication(mockId, mockReviewData);

      expect(put).toHaveBeenCalledWith(`/enrollment/applications/${mockId}/review`, mockReviewData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('batchReviewApplications', () => {
    it('should call post with correct endpoint and batch data', async () => {
      const mockBatchData = {
        applicationIds: ['123', '456'],
        status: 'APPROVED',
        notes: 'Batch approval'
      };
      const mockResponse = {
        success: true,
        message: 'Applications reviewed successfully'
      };
      
      vi.mocked(post).mockResolvedValue(mockResponse);

      const result = await enrollmentApi.batchReviewApplications(mockBatchData);

      expect(post).toHaveBeenCalledWith('/enrollment/applications/batch-review', mockBatchData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Error handling', () => {
    it('should handle API errors gracefully', async () => {
      const mockError = new Error('Network error');
      vi.mocked(get).mockRejectedValue(mockError);

      await expect(enrollmentApi.getApplications()).rejects.toThrow('Network error');
    });

    it('should handle validation errors', async () => {
      const mockResponse = {
        success: false,
        message: 'Validation error',
        data: null
      };
      vi.mocked(post).mockResolvedValue(mockResponse);

      const result = await enrollmentApi.createApplication({} as any);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Compatibility exports', () => {
    it('should export compatibility functions that point to the main API methods', () => {
      expect(typeof enrollmentApi.getApplications).toBe('function');
      expect(typeof enrollmentApi.getApplication).toBe('function');
      expect(typeof enrollmentApi.createApplication).toBe('function');
      expect(typeof enrollmentApi.updateApplication).toBe('function');
      expect(typeof enrollmentApi.deleteApplication).toBe('function');
      expect(typeof enrollmentApi.reviewApplication).toBe('function');
    });
  });
});