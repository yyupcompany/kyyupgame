import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';
import {
  validateRequiredFields,
  validateFieldTypes
} from '../../../utils/data-validation';

// Mock the request module
vi.mock('@/utils/request', () => ({
  request: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    del: vi.fn(),
    delete: vi.fn()
  }
}));

// Import after mocks
import {
  getNotificationList,
  getNotificationDetail,
  createNotification,
  updateNotification,
  deleteNotification,
  sendNotification,
  getNotificationReadStatus,
  cancelNotification,
  uploadNotificationAttachments
} from '@/api/modules/notification';
import { request } from '@/utils/request';
const mockRequest = request as any;

// 控制台错误检测变量
let consoleSpy: any

describe('Notification API', () => {
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

  describe('getNotificationList', () => {
    it('should call request.get with correct endpoint and params', async () => {
      const mockParams = {
        keyword: 'important',
        type: 'ANNOUNCEMENT',
        status: 'SENT',
        page: 1,
        pageSize: 10
      };
      const mockResponse = {
        items: [{
          id: '1',
          title: 'Test Notification',
          type: 'ANNOUNCEMENT',
          status: 'SENT'
        }],
        total: 1
      };

      mockRequest.get.mockResolvedValue(mockResponse);

      const result = await getNotificationList(mockParams);

      // 验证API调用
      expect(mockRequest.get).toHaveBeenCalledWith('/notifications', { params: mockParams });

      // 验证响应结构
      expect(result).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);

      // 验证分页字段
      const validation = validateRequiredFields(result, ['items', 'total']);
      expect(validation.valid).toBe(true);

      // 验证列表项
      if (result.items.length > 0) {
        const itemValidation = validateRequiredFields(result.items[0], ['id', 'title', 'type', 'status']);
        expect(itemValidation.valid).toBe(true);
      }
    });
  });

  describe('getNotificationDetail', () => {
    it('should call request.get with correct endpoint and id', async () => {
      const mockId = '123';
      const mockResponse = {
        id: mockId,
        title: 'Test Notification',
        type: 'ANNOUNCEMENT',
        status: 'SENT'
      };
      
      mockRequest.get.mockResolvedValue(mockResponse);

      const result = await getNotificationDetail(mockId);

      expect(mockRequest.get).toHaveBeenCalledWith(`/notifications/${mockId}`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createNotification', () => {
    it('should call request.post with correct endpoint and data', async () => {
      const mockData = {
        title: 'New Announcement',
        content: 'Important announcement content',
        type: 'ANNOUNCEMENT',
        recipientType: 'ALL',
        scheduledTime: '2024-03-01T10:00:00Z'
      };
      const mockResponse = {
        id: '123',
        ...mockData
      };
      
      mockRequest.post.mockResolvedValue(mockResponse);

      const result = await createNotification(mockData);

      expect(mockRequest.post).toHaveBeenCalledWith('/notifications', mockData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateNotification', () => {
    it('should call request.put with correct endpoint, id and data', async () => {
      const mockId = '123';
      const mockData = {
        title: 'Updated Announcement',
        content: 'Updated content'
      };
      const mockResponse = {
        id: mockId,
        ...mockData
      };
      
      mockRequest.put.mockResolvedValue(mockResponse);

      const result = await updateNotification(mockId, mockData);

      expect(mockRequest.put).toHaveBeenCalledWith(`/notifications/${mockId}`, mockData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteNotification', () => {
    it('should call request.del with correct endpoint and id', async () => {
      const mockId = '123';
      
      mockRequest.del.mockResolvedValue({});

      const result = await deleteNotification(mockId);

      expect(mockRequest.del).toHaveBeenCalledWith(`/notifications/${mockId}`);
      expect(result).toEqual({});
    });
  });

  describe('sendNotification', () => {
    it('should call request.post with correct endpoint and id', async () => {
      const mockId = '123';
      const mockResponse = {
        success: true,
        sentCount: 100
      };
      
      mockRequest.post.mockResolvedValue(mockResponse);

      const result = await sendNotification(mockId);

      expect(mockRequest.post).toHaveBeenCalledWith(`/notifications/${mockId}/send`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getNotificationReadStatus', () => {
    it('should call request.get with correct endpoint and id', async () => {
      const mockId = '123';
      const mockResponse = [
        {
          recipientId: 'user1',
          recipientName: 'User One',
          readTime: '2024-03-01T10:30:00Z'
        }
      ];
      
      mockRequest.get.mockResolvedValue(mockResponse);

      const result = await getNotificationReadStatus(mockId);

      expect(mockRequest.get).toHaveBeenCalledWith(`/notifications/${mockId}/read-status`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('cancelNotification', () => {
    it('should call request.post with correct endpoint and id', async () => {
      const mockId = '123';
      const mockResponse = {
        success: true
      };
      
      mockRequest.post.mockResolvedValue(mockResponse);

      const result = await cancelNotification(mockId);

      expect(mockRequest.post).toHaveBeenCalledWith(`/notifications/${mockId}/cancel`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('uploadNotificationAttachments', () => {
    it('should call request.post with correct endpoint and form data', async () => {
      const mockFormData = new FormData();
      mockFormData.append('file', new File(['test'], 'test.pdf'));
      
      const mockResponse = {
        files: [
          {
            id: 'file1',
            name: 'test.pdf',
            url: '/uploads/test.pdf',
            size: 1024
          }
        ]
      };
      
      mockRequest.post.mockResolvedValue(mockResponse);

      const result = await uploadNotificationAttachments(mockFormData);

      expect(mockRequest.post).toHaveBeenCalledWith('/upload/notification-attachments', mockFormData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const mockError = new Error('Network error');
      mockRequest.get.mockRejectedValue(mockError);

      await expect(getNotificationList()).rejects.toThrow('Network error');
    });

    it('should handle validation errors', async () => {
      const mockResponse = {
        success: false,
        message: 'Invalid notification data',
        data: null
      };
      mockRequest.post.mockResolvedValue(mockResponse);

      const result = await createNotification({} as any);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Parameter Validation', () => {
    it('should handle invalid notification IDs', async () => {
      const invalidIds = ['', null, undefined];
      
      for (const invalidId of invalidIds) {
        mockRequest.get.mockResolvedValue({});
        await expect(getNotificationDetail(invalidId as string)).resolves.not.toThrow();
      }
    });

    it('should handle empty form data', async () => {
      const emptyFormData = new FormData();
      const mockResponse = {
        files: []
      };
      
      mockRequest.post.mockResolvedValue(mockResponse);

      const result = await uploadNotificationAttachments(emptyFormData);
      expect(result).toEqual(mockResponse);
    });
  });
});