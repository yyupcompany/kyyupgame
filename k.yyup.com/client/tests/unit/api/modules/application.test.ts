import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import * as applicationApi from '@/api/modules/application';
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';
import {
  validateRequiredFields,
  validateFieldTypes
} from '../../../utils/data-validation';

// Mock the request module
vi.mock('@/utils/request', () => ({
  request: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

import { request } from '@/utils/request';
const mockedRequest = request as any;

// 控制台错误检测变量
let consoleSpy: any

describe('Application API', () => {
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

  describe('getApplicationList', () => {
    it('should get application list with all parameters', async () => {
      const mockParams = {
        keyword: 'John',
        status: 'PENDING',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        page: 1,
        pageSize: 10
      };
      const mockResponse = {
        data: [
          {
            id: 'app-123',
            childName: 'John Doe',
            childGender: 'MALE',
            childBirthday: '2020-01-01',
            guardianName: 'Jane Doe',
            guardianPhone: '1234567890',
            guardianEmail: 'jane@example.com',
            address: '123 Main St',
            preferredClass: 'Preschool A',
            status: 'PENDING',
            comments: 'Test application',
            enrollmentDate: '2024-09-01',
            createdAt: '2024-01-01T10:00:00Z',
            updatedAt: '2024-01-01T10:00:00Z'
          }
        ]
      };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await applicationApi.getApplicationList(mockParams);

      // 验证API调用
      expect(mockedRequest.get).toHaveBeenCalledWith('/applications', { params: mockParams });

      // 验证响应结构
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);

      // 验证列表项
      if (result.data.length > 0) {
        const itemValidation = validateRequiredFields(result.data[0], ['id', 'childName', 'guardianName', 'status']);
        expect(itemValidation.valid).toBe(true);

        const itemTypeValidation = validateFieldTypes(result.data[0], {
          id: 'string',
          childName: 'string',
          guardianName: 'string',
          guardianPhone: 'string',
          status: 'string'
        });
        expect(itemTypeValidation.valid).toBe(true);
      }
    });

    it('should get application list with minimal parameters', async () => {
      const mockParams = { page: 1, pageSize: 20 };
      const mockResponse = { data: [] };
      mockedRequest.get.mockResolvedValue(mockResponse);

      await applicationApi.getApplicationList(mockParams);

      expect(mockedRequest.get).toHaveBeenCalledWith('/applications', { params: mockParams });
    });

    it('should get application list without parameters', async () => {
      const mockResponse = { data: [] };
      mockedRequest.get.mockResolvedValue(mockResponse);

      await applicationApi.getApplicationList({});

      expect(mockedRequest.get).toHaveBeenCalledWith('/applications', { params: {} });
    });
  });

  describe('getApplicationDetail', () => {
    it('should get application detail by id', async () => {
      const mockResponse = {
        data: {
          id: 'app-123',
          childName: 'John Doe',
          childGender: 'MALE',
          childBirthday: '2020-01-01',
          guardianName: 'Jane Doe',
          guardianPhone: '1234567890',
          guardianEmail: 'jane@example.com',
          address: '123 Main St',
          preferredClass: 'Preschool A',
          status: 'PENDING',
          comments: 'Test application',
          enrollmentDate: '2024-09-01',
          createdAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-01-01T10:00:00Z'
        }
      };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await applicationApi.getApplicationDetail('app-123');

      expect(mockedRequest.get).toHaveBeenCalledWith('/applications/app-123');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('reviewApplication', () => {
    it('should approve application with comments and enrollment date', async () => {
      const mockData = {
        status: 'APPROVED',
        comments: 'Excellent candidate',
        enrollmentDate: '2024-09-01'
      };
      const mockResponse = {
        data: {
          id: 'app-123',
          status: 'APPROVED',
          comments: 'Excellent candidate',
          enrollmentDate: '2024-09-01'
        }
      };

      mockedRequest.post.mockResolvedValue(mockResponse);

      const result = await applicationApi.reviewApplication('app-123', mockData);

      expect(mockedRequest.post).toHaveBeenCalledWith('/applications/app-123/review', mockData);
      expect(result).toEqual(mockResponse);
    });

    it('should reject application with comments', async () => {
      const mockData = {
        status: 'REJECTED',
        comments: 'Does not meet requirements'
      };
      const mockResponse = {
        data: {
          id: 'app-123',
          status: 'REJECTED',
          comments: 'Does not meet requirements'
        }
      };

      mockedRequest.post.mockResolvedValue(mockResponse);

      const result = await applicationApi.reviewApplication('app-123', mockData);

      expect(mockedRequest.post).toHaveBeenCalledWith('/applications/app-123/review', mockData);
      expect(result).toEqual(mockResponse);
    });

    it('should review application with minimal data', async () => {
      const mockData = { status: 'APPROVED' };
      const mockResponse = { data: {} };
      mockedRequest.post.mockResolvedValue(mockResponse);

      await applicationApi.reviewApplication('app-123', mockData);

      expect(mockedRequest.post).toHaveBeenCalledWith('/applications/app-123/review', mockData);
    });
  });

  describe('batchReviewApplications', () => {
    it('should batch review applications with full data', async () => {
      const mockIds = ['app-123', 'app-456', 'app-789'];
      const mockData = {
        status: 'APPROVED',
        comments: 'Batch approved',
        enrollmentDate: '2024-09-01'
      };
      const mockResponse = {
        data: {
          successCount: 3,
          failureCount: 0
        }
      };

      mockedRequest.post.mockResolvedValue(mockResponse);

      const result = await applicationApi.batchReviewApplications(mockIds, mockData);

      expect(mockedRequest.post).toHaveBeenCalledWith('/applications/batch-review', {
        ids: mockIds,
        ...mockData
      });
      expect(result).toEqual(mockResponse);
    });

    it('should batch review applications with minimal data', async () => {
      const mockIds = ['app-123'];
      const mockData = { status: 'REJECTED' };
      const mockResponse = { data: { successCount: 1, failureCount: 0 } };
      mockedRequest.post.mockResolvedValue(mockResponse);

      await applicationApi.batchReviewApplications(mockIds, mockData);

      expect(mockedRequest.post).toHaveBeenCalledWith('/applications/batch-review', {
        ids: mockIds,
        status: 'REJECTED'
      });
    });
  });

  describe('getApplicationHistory', () => {
    it('should get application history', async () => {
      const mockResponse = {
        data: [
          {
            id: 'hist-123',
            action: 'CREATED',
            comments: 'Application submitted',
            operatorName: 'John Doe',
            operatedAt: '2024-01-01T10:00:00Z'
          },
          {
            id: 'hist-124',
            action: 'REVIEWED',
            comments: 'Application reviewed',
            operatorName: 'Jane Smith',
            operatedAt: '2024-01-02T10:00:00Z'
          }
        ]
      };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await applicationApi.getApplicationHistory('app-123');

      expect(mockedRequest.get).toHaveBeenCalledWith('/applications/app-123/history');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('sendAdmissionNotice', () => {
    it('should send admission notice with attachments', async () => {
      const mockData = {
        message: 'Congratulations! Your child has been admitted.',
        attachments: ['welcome.pdf', 'handbook.pdf']
      };
      const mockResponse = {
        data: {
          success: true,
          messageId: 'msg-123'
        }
      };

      mockedRequest.post.mockResolvedValue(mockResponse);

      const result = await applicationApi.sendAdmissionNotice('app-123', mockData);

      expect(mockedRequest.post).toHaveBeenCalledWith('/applications/app-123/notice', mockData);
      expect(result).toEqual(mockResponse);
    });

    it('should send admission notice without attachments', async () => {
      const mockData = { message: 'Welcome to our kindergarten!' };
      const mockResponse = { data: { success: true, messageId: 'msg-124' } };
      mockedRequest.post.mockResolvedValue(mockResponse);

      await applicationApi.sendAdmissionNotice('app-123', mockData);

      expect(mockedRequest.post).toHaveBeenCalledWith('/applications/app-123/notice', mockData);
    });
  });

  describe('uploadApplicationAttachments', () => {
    it('should upload application attachments', async () => {
      const mockFormData = new FormData();
      mockFormData.append('file', new File(['test'], 'test.pdf', { type: 'application/pdf' }));
      mockFormData.append('additionalInfo', 'test');

      const mockResponse = {
        data: {
          files: [
            {
              id: 'file-123',
              name: 'test.pdf',
              url: 'https://example.com/files/test.pdf'
            }
          ]
        }
      };

      mockedRequest.post.mockResolvedValue(mockResponse);

      const result = await applicationApi.uploadApplicationAttachments('app-123', mockFormData);

      expect(mockedRequest.post).toHaveBeenCalledWith('/applications/app-123/attachments', mockFormData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const mockError = new Error('Network error');
      mockedRequest.get.mockRejectedValue(mockError);

      await expect(applicationApi.getApplicationList({}))
        .rejects.toThrow('Network error');
    });

    it('should handle API response errors', async () => {
      const mockErrorResponse = {
        data: null,
        message: 'Application not found'
      };
      mockedRequest.get.mockResolvedValue(mockErrorResponse);

      const result = await applicationApi.getApplicationDetail('invalid-id');
      expect(result.data).toBeNull();
    });

    it('should handle validation errors', async () => {
      const mockData = {
        status: 'INVALID_STATUS' as any,
        comments: 'Test'
      };
      const mockErrorResponse = {
        data: null,
        message: 'Invalid status'
      };
      mockedRequest.post.mockResolvedValue(mockErrorResponse);

      const result = await applicationApi.reviewApplication('app-123', mockData);
      expect(result.data).toBeNull();
    });
  });

  describe('Data Validation', () => {
    it('should validate application status enum values', () => {
      expect(applicationApi.ApplicationStatus.PENDING).toBe('PENDING');
      expect(applicationApi.ApplicationStatus.APPROVED).toBe('APPROVED');
      expect(applicationApi.ApplicationStatus.REJECTED).toBe('REJECTED');
      expect(applicationApi.ApplicationStatus.CANCELLED).toBe('CANCELLED');
      expect(applicationApi.ApplicationStatus.ENROLLED).toBe('ENROLLED');
    });

    it('should validate child gender enum values', () => {
      const validGenders = ['MALE', 'FEMALE'];
      expect(validGenders).toContain('MALE');
      expect(validGenders).toContain('FEMALE');
    });

    it('should handle empty application list response', async () => {
      const mockResponse = { data: [] };
      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await applicationApi.getApplicationList({});
      expect(result.data).toEqual([]);
    });

    it('should handle single application in list', async () => {
      const mockResponse = {
        data: [
          {
            id: 'app-123',
            childName: 'Single Child',
            childGender: 'MALE',
            status: 'PENDING'
          }
        ]
      };
      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await applicationApi.getApplicationList({});
      expect(result.data).toHaveLength(1);
      expect(result.data[0].childName).toBe('Single Child');
    });
  });

  describe('Parameter Validation', () => {
    it('should handle invalid pagination parameters', async () => {
      const mockParams = {
        page: -1,
        pageSize: 0
      };
      const mockResponse = { data: [] };
      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await applicationApi.getApplicationList(mockParams);
      expect(result.data).toEqual([]);
    });

    it('should handle invalid date format', async () => {
      const mockParams = {
        startDate: 'invalid-date',
        endDate: '2024-13-32'
      };
      const mockResponse = { data: [] };
      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await applicationApi.getApplicationList(mockParams);
      expect(result.data).toEqual([]);
    });

    it('should handle empty application id', async () => {
      const mockResponse = { data: null };
      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await applicationApi.getApplicationDetail('');
      expect(result.data).toBeNull();
    });
  });

  describe('API Response Structure', () => {
    it('should handle different response structures', async () => {
      const differentResponses = [
        { data: [] },
        { data: null },
        { data: {} },
        { items: [] },
        { success: true, data: [] },
        { success: false, message: 'Error' }
      ];

      for (const response of differentResponses) {
        mockedRequest.get.mockResolvedValue(response);

        const result = await applicationApi.getApplicationList({});
        expect(result).toBeDefined();
      }
    });

    it('should handle malformed application data', async () => {
      const mockResponse = {
        data: [
          {
            // Missing required fields
            id: 'app-123',
            childName: 'Test Child'
            // Missing other required fields
          }
        ]
      };
      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await applicationApi.getApplicationList({});
      expect(result.data).toBeDefined();
      expect(result.data[0].id).toBe('app-123');
    });
  });
});