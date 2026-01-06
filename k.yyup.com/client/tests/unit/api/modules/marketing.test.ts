import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import {
  getMarketingActivityList,
  getMarketingActivityDetail,
  createMarketingActivity,
  updateMarketingActivity,
  deleteMarketingActivity,
  updateMarketingActivityStatus,
  updateMarketingActivityResults,
  getMarketingChannelList,
  createMarketingChannel,
  updateMarketingChannel,
  deleteMarketingChannel,
  getMarketingAnalytics,
  exportMarketingActivityData,
  exportMarketingAnalyticsReport
} from '@/api/modules/marketing';
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';
import {
  validateRequiredFields,
  validateFieldTypes,
  validateEnumValue
} from '../../../utils/data-validation';

// Mock the request module
vi.mock('@/utils/request', () => ({
  request: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    del: vi.fn(),
    request: vi.fn()
  }
}));

import { request } from '@/utils/request';
const mockRequest = request as any;

// 控制台错误检测变量
let consoleSpy: any

describe('Marketing API', () => {
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

  describe('Marketing Activity Management', () => {
    describe('getMarketingActivityList', () => {
      it('should call request.get with correct endpoint and params', async () => {
        const mockParams = {
          keyword: 'open day',
          type: 'OPEN_DAY',
          status: 'ONGOING',
          page: 1,
          pageSize: 10
        };
        const mockResponse = {
          items: [{
            id: '1',
            title: 'Open Day Event',
            type: 'OPEN_DAY',
            status: 'ONGOING',
            startDate: '2024-01-01',
            endDate: '2024-01-31'
          }],
          total: 1,
          page: 1,
          pageSize: 10
        };

        mockRequest.get.mockResolvedValue(mockResponse);

        const result = await getMarketingActivityList(mockParams);

        // 验证API调用
        expect(mockRequest.get).toHaveBeenCalledWith('/activities', { params: mockParams });

        // 验证响应结构
        expect(result).toBeDefined();
        expect(Array.isArray(result.items)).toBe(true);

        // 验证分页字段
        const paginationValidation = validateRequiredFields(result, ['items', 'total']);
        expect(paginationValidation.valid).toBe(true);

        // 验证列表项
        if (result.items.length > 0) {
          const itemValidation = validateRequiredFields(result.items[0], ['id', 'title', 'type', 'status']);
          expect(itemValidation.valid).toBe(true);

          const itemTypeValidation = validateFieldTypes(result.items[0], {
            id: 'string',
            title: 'string',
            type: 'string',
            status: 'string'
          });
          expect(itemTypeValidation.valid).toBe(true);
        }
      });

      it('should handle empty params', async () => {
        const mockResponse = {
          items: [],
          total: 0
        };
        
        mockRequest.get.mockResolvedValue(mockResponse);

        const result = await getMarketingActivityList();

        expect(mockRequest.get).toHaveBeenCalledWith('/activities', { params: undefined });
        expect(result).toEqual(mockResponse);
      });
    });

    describe('getMarketingActivityDetail', () => {
      it('should call request.get with correct endpoint and id', async () => {
        const mockId = '123';
        const mockResponse = {
          id: mockId,
          title: 'Open Day Event',
          type: 'OPEN_DAY',
          status: 'ONGOING',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          budget: 10000,
          actualCost: 8000
        };

        mockRequest.get.mockResolvedValue(mockResponse);

        const result = await getMarketingActivityDetail(mockId);

        // 验证API调用
        expect(mockRequest.get).toHaveBeenCalledWith(`/activities/${mockId}`);

        // 验证响应结构
        expect(result).toBeDefined();

        // 验证必填字段
        const validation = validateRequiredFields(result, ['id', 'title', 'type', 'status']);
        expect(validation.valid).toBe(true);

        // 验证字段类型
        const typeValidation = validateFieldTypes(result, {
          id: 'string',
          title: 'string',
          type: 'string',
          status: 'string',
          budget: 'number',
          actualCost: 'number'
        });
        expect(typeValidation.valid).toBe(true);
      });
    });

    describe('createMarketingActivity', () => {
      it('should call request.post with correct endpoint and data', async () => {
        const mockData = {
          title: 'New Open Day',
          description: 'Open house event for prospective parents',
          type: 'OPEN_DAY',
          status: 'PLANNED',
          startDate: '2024-03-01',
          endDate: '2024-03-01',
          budget: 5000,
          targetAudience: 'Prospective parents',
          estimatedParticipants: 50,
          organizer: 'Marketing Team'
        };
        const mockResponse = {
          id: '123',
          ...mockData
        };
        
        mockRequest.post.mockResolvedValue(mockResponse);

        const result = await createMarketingActivity(mockData);

        expect(mockRequest.post).toHaveBeenCalledWith('/activities', mockData);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('updateMarketingActivity', () => {
      it('should call request.put with correct endpoint, id and data', async () => {
        const mockId = '123';
        const mockData = {
          title: 'Updated Open Day',
          budget: 6000
        };
        const mockResponse = {
          id: mockId,
          ...mockData
        };
        
        mockRequest.put.mockResolvedValue(mockResponse);

        const result = await updateMarketingActivity(mockId, mockData);

        expect(mockRequest.put).toHaveBeenCalledWith(`/activities/${mockId}`, mockData);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('deleteMarketingActivity', () => {
      it('should call request.del with correct endpoint and id', async () => {
        const mockId = '123';
        
        mockRequest.del.mockResolvedValue({});

        const result = await deleteMarketingActivity(mockId);

        expect(mockRequest.del).toHaveBeenCalledWith(`/activities/${mockId}`);
        expect(result).toEqual({});
      });
    });

    describe('updateMarketingActivityStatus', () => {
      it('should call request.put with correct endpoint, id and status', async () => {
        const mockId = '123';
        const mockStatus = 'COMPLETED';
        const mockResponse = {
          id: mockId,
          status: mockStatus
        };
        
        mockRequest.put.mockResolvedValue(mockResponse);

        const result = await updateMarketingActivityStatus(mockId, mockStatus);

        expect(mockRequest.put).toHaveBeenCalledWith(`/activities/${mockId}/status`, { status: mockStatus });
        expect(result).toEqual(mockResponse);
      });
    });

    describe('updateMarketingActivityResults', () => {
      it('should call request.patch with correct endpoint, id and results data', async () => {
        const mockId = '123';
        const mockData = {
          actualParticipants: 45,
          leadCount: 30,
          conversionCount: 15,
          expenditure: 4500
        };
        const mockResponse = {
          id: mockId,
          ...mockData
        };
        
        mockRequest.patch.mockResolvedValue(mockResponse);

        const result = await updateMarketingActivityResults(mockId, mockData);

        expect(mockRequest.patch).toHaveBeenCalledWith(`/activities/${mockId}/results`, mockData);
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('Marketing Channel Management', () => {
    describe('getMarketingChannelList', () => {
      it('should call request.get with correct endpoint', async () => {
        const mockResponse = [
          {
            id: '1',
            name: 'Website',
            type: 'ONLINE',
            description: 'Official website',
            cost: 1000,
            leadCount: 50,
            conversionCount: 10,
            conversionRate: 20,
            active: true
          }
        ];
        
        mockRequest.get.mockResolvedValue(mockResponse);

        const result = await getMarketingChannelList();

        expect(mockRequest.get).toHaveBeenCalledWith('/marketing/channels');
        expect(result).toEqual(mockResponse);
      });
    });

    describe('createMarketingChannel', () => {
      it('should call request.post with correct endpoint and data', async () => {
        const mockData = {
          name: 'Social Media',
          type: 'SOCIAL',
          description: 'Social media marketing',
          cost: 2000
        };
        const mockResponse = {
          id: '2',
          ...mockData
        };
        
        mockRequest.post.mockResolvedValue(mockResponse);

        const result = await createMarketingChannel(mockData);

        expect(mockRequest.post).toHaveBeenCalledWith('/marketing/channels', mockData);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('updateMarketingChannel', () => {
      it('should call request.patch with correct endpoint, id and data', async () => {
        const mockId = '1';
        const mockData = {
          name: 'Updated Website',
          cost: 1500,
          active: false
        };
        const mockResponse = {
          id: mockId,
          ...mockData
        };
        
        mockRequest.patch.mockResolvedValue(mockResponse);

        const result = await updateMarketingChannel(mockId, mockData);

        expect(mockRequest.patch).toHaveBeenCalledWith(`/marketing/channels/${mockId}`, mockData);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('deleteMarketingChannel', () => {
      it('should call request.del with correct endpoint and id', async () => {
        const mockId = '1';
        
        mockRequest.del.mockResolvedValue({});

        const result = await deleteMarketingChannel(mockId);

        expect(mockRequest.del).toHaveBeenCalledWith(`/marketing/channels/${mockId}`);
        expect(result).toEqual({});
      });
    });
  });

  describe('Marketing Analytics', () => {
    describe('getMarketingAnalytics', () => {
      it('should call request.get with correct endpoint and params', async () => {
        const mockParams = {
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          channelId: '1',
          activityType: 'OPEN_DAY'
        };
        const mockResponse = {
          totalActivities: 10,
          ongoingActivities: 3,
          totalLeads: 500,
          totalConversions: 100,
          conversionRate: 20,
          totalExpenditure: 50000,
          budgetUtilization: 75,
          costPerLead: 100,
          costPerConversion: 500,
          channelPerformance: [],
          activityPerformance: [],
          trendsData: []
        };
        
        mockRequest.get.mockResolvedValue(mockResponse);

        const result = await getMarketingAnalytics(mockParams);

        expect(mockRequest.get).toHaveBeenCalledWith('/marketing/analytics', { params: mockParams });
        expect(result).toEqual(mockResponse);
      });

      it('should handle empty params', async () => {
        const mockResponse = {
          totalActivities: 0,
          ongoingActivities: 0,
          totalLeads: 0,
          totalConversions: 0,
          conversionRate: 0,
          totalExpenditure: 0,
          budgetUtilization: 0,
          costPerLead: 0,
          costPerConversion: 0,
          channelPerformance: [],
          activityPerformance: [],
          trendsData: []
        };
        
        mockRequest.get.mockResolvedValue(mockResponse);

        const result = await getMarketingAnalytics();

        expect(mockRequest.get).toHaveBeenCalledWith('/marketing/analytics', { params: {} });
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('Export Functions', () => {
    describe('exportMarketingActivityData', () => {
      it('should call request.request with correct method, endpoint, params and response type', async () => {
        const mockId = '123';
        const mockFormat = 'excel';
        const mockBlob = new Blob(['test data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        mockRequest.request.mockResolvedValue(mockBlob);

        const result = await exportMarketingActivityData(mockId, mockFormat);

        expect(mockRequest.request).toHaveBeenCalledWith({
          url: `/activities/${mockId}/export`,
          method: 'get',
          params: { format: mockFormat },
          responseType: 'blob'
        });
        expect(result).toBe(mockBlob);
      });
    });

    describe('exportMarketingAnalyticsReport', () => {
      it('should call request.request with correct method, endpoint, params and response type', async () => {
        const mockParams = {
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          channelId: '1',
          activityType: 'OPEN_DAY'
        };
        const mockFormat = 'pdf';
        const mockBlob = new Blob(['test data'], { type: 'application/pdf' });
        
        mockRequest.request.mockResolvedValue(mockBlob);

        const result = await exportMarketingAnalyticsReport(mockParams, mockFormat);

        expect(mockRequest.request).toHaveBeenCalledWith({
          url: '/marketing/analytics/export',
          method: 'get',
          params: { ...mockParams, format: mockFormat },
          responseType: 'blob'
        });
        expect(result).toBe(mockBlob);
      });

      it('should handle empty params with default format', async () => {
        const mockBlob = new Blob(['test data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        mockRequest.request.mockResolvedValue(mockBlob);

        const result = await exportMarketingAnalyticsReport({}, 'excel');

        expect(mockRequest.request).toHaveBeenCalledWith({
          url: '/marketing/analytics/export',
          method: 'get',
          params: { format: 'excel' },
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

      await expect(getMarketingActivityList()).rejects.toThrow('Network error');
    });

    it('should handle validation errors', async () => {
      const mockResponse = {
        success: false,
        message: 'Invalid activity data',
        data: null
      };
      mockRequest.post.mockResolvedValue(mockResponse);

      const result = await createMarketingActivity({} as any);
      expect(result).toEqual(mockResponse);
    });

    it('should handle not found errors', async () => {
      const mockResponse = {
        success: false,
        message: 'Activity not found',
        data: null
      };
      mockRequest.get.mockResolvedValue(mockResponse);

      const result = await getMarketingActivityDetail('nonexistent');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Parameter Validation', () => {
    it('should handle invalid activity IDs', async () => {
      const invalidIds = ['', null, undefined];
      
      for (const invalidId of invalidIds) {
        mockRequest.get.mockResolvedValue({});
        await expect(getMarketingActivityDetail(invalidId as string)).resolves.not.toThrow();
      }
    });

    it('should handle invalid export formats', async () => {
      const mockBlob = new Blob(['test']);
      mockRequest.request.mockResolvedValue(mockBlob);

      await expect(exportMarketingActivityData('123', 'invalid' as any)).resolves.not.toThrow();
    });
  });
});