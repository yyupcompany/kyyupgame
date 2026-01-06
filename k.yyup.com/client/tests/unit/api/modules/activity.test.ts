import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';
import {
  validateRequiredFields,
  validateFieldTypes
} from '../../../utils/data-validation';

// Mock dependencies
vi.mock('@/utils/request', () => {
  const mockGet = vi.fn();
  const mockPost = vi.fn();
  const mockPut = vi.fn();
  const mockDel = vi.fn();
  const mockRequest = {
    get: mockGet,
    post: mockPost,
    put: mockPut,
    del: mockDel
  };

  return {
    default: mockRequest,
    get: mockGet,
    post: mockPost,
    put: mockPut,
    del: mockDel,
    request: mockRequest
  };
});

vi.mock('@/utils/dataTransform', () => ({
  transformActivityData: vi.fn(data => data),
  transformActivityRegistrationData: vi.fn(data => data),
  transformListResponse: vi.fn(response => response),
  transformActivityFormData: vi.fn(data => data),
  transformActivityRegistrationFormData: vi.fn(data => data)
}));

vi.mock('@/api/endpoints/activity', () => ({
  ACTIVITY_EVALUATION_ENDPOINTS: {
    BASE: '/activity-evaluations',
    GET_BY_ID: (id: number | string) => `/activity-evaluations/${id}`
  }
}));

// Import after mocks
import * as activityApi from '@/api/modules/activity';
import { get as mockedGet, post as mockedPost, put as mockedPut, del as mockedDel, request } from '@/utils/request';

const mockedRequest = vi.mocked(request);

// 控制台错误检测变量
let consoleSpy: any

describe('Activity API', () => {
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

  describe('getActivityList', () => {
    it('should get activity list with params', async () => {
      const mockParams = { page: 1, size: 10, status: 1 };
      const mockResponse = {
        success: true,
        data: {
          items: [
            { id: 1, title: 'Test Activity', status: 1 },
            { id: 2, title: 'Another Activity', status: 2 }
          ],
          total: 2,
          page: 1,
          pageSize: 10,
          totalPages: 1
        }
      };

      mockedGet.mockResolvedValue(mockResponse);

      const result = await activityApi.getActivityList(mockParams);

      // 验证API调用
      expect(mockedGet).toHaveBeenCalledWith('/activities', mockParams);

      // 验证响应结构
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data.items)).toBe(true);

      // 验证分页字段
      const paginationValidation = validateRequiredFields(result.data, ['items', 'total', 'page', 'pageSize']);
      expect(paginationValidation.valid).toBe(true);

      // 验证列表项
      if (result.data.items.length > 0) {
        const itemValidation = validateRequiredFields(result.data.items[0], ['id', 'title', 'status']);
        expect(itemValidation.valid).toBe(true);

        const itemTypeValidation = validateFieldTypes(result.data.items[0], {
          id: 'number',
          title: 'string',
          status: 'number'
        });
        expect(itemTypeValidation.valid).toBe(true);
      }
    });

    it('should get activity list without params', async () => {
      const mockResponse = { success: true, data: { items: [], total: 0 } };
      mockedGet.mockResolvedValue(mockResponse);

      await activityApi.getActivityList();

      expect(mockedGet).toHaveBeenCalledWith('/activities', undefined);
    });
  });

  describe('getActivityDetail', () => {
    it('should get activity detail by id', async () => {
      const mockResponse = {
        success: true,
        data: { id: 1, title: 'Test Activity', status: 1 }
      };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await activityApi.getActivityDetail(1);

      expect(mockedRequest.get).toHaveBeenCalledWith('/activities/1');
      expect(result).toEqual(mockResponse);
    });

    it('should get activity detail by string id', async () => {
      const mockResponse = { success: true, data: { id: '1', title: 'Test Activity' } };
      mockedRequest.get.mockResolvedValue(mockResponse);

      await activityApi.getActivityDetail('1');

      expect(mockedRequest.get).toHaveBeenCalledWith('/activities/1');
    });
  });

  describe('getActivityStatistics', () => {
    it('should get activity statistics', async () => {
      const mockResponse = {
        success: true,
        data: {
          total_activities: 10,
          active: 5,
          completed: 3,
          cancelled: 2,
          this_month: 2,
          last_month: 3,
          participation_rate: 75.5
        }
      };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await activityApi.getActivityStatistics();

      expect(mockedRequest.get).toHaveBeenCalledWith('/activities/statistics');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Activity Plans Management', () => {
    describe('getActivityPlans', () => {
      it('should get activity plans', async () => {
        const mockParams = { page: 1, size: 10 };
        const mockResponse = {
          success: true,
          data: {
            items: [{ id: 1, title: 'Plan 1' }],
            total: 1,
            page: 1,
            pageSize: 10,
            totalPages: 1
          }
        };

        mockedRequest.get.mockResolvedValue(mockResponse);

        const result = await activityApi.getActivityPlans(mockParams);

        expect(mockedRequest.get).toHaveBeenCalledWith('/activity-plans', mockParams);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('createActivityPlan', () => {
      it('should create activity plan', async () => {
        const mockData = {
          title: 'New Activity Plan',
          activityType: 1,
          startTime: '2024-01-01T10:00:00',
          endTime: '2024-01-01T12:00:00'
        };
        const mockResponse = {
          success: true,
          data: { id: 1, ...mockData }
        };

        mockedRequest.post.mockResolvedValue(mockResponse);

        const result = await activityApi.createActivityPlan(mockData);

        expect(mockedRequest.post).toHaveBeenCalledWith('/activity-plans', mockData);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('updateActivityPlan', () => {
      it('should update activity plan', async () => {
        const mockData = { title: 'Updated Activity Plan' };
        const mockResponse = {
          success: true,
          data: { id: 1, ...mockData }
        };

        mockedRequest.put.mockResolvedValue(mockResponse);

        const result = await activityApi.updateActivityPlan(1, mockData);

        expect(mockedRequest.put).toHaveBeenCalledWith('/activity-plans/1', mockData);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('deleteActivityPlan', () => {
      it('should delete activity plan', async () => {
        const mockResponse = { success: true, data: null };

        mockedRequest.del.mockResolvedValue(mockResponse);

        const result = await activityApi.deleteActivityPlan(1);

        expect(mockedRequest.del).toHaveBeenCalledWith('/activity-plans/1');
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('Activity Registration Management', () => {
    describe('getActivityRegistrations', () => {
      it('should get activity registrations', async () => {
        const mockParams = { page: 1, limit: 10, activityId: 1 };
        const mockResponse = {
          success: true,
          data: {
            items: [{ id: 1, activityId: 1, contactName: 'John Doe' }],
            total: 1,
            page: 1,
            pageSize: 10,
            totalPages: 1
          }
        };

        mockedRequest.get.mockResolvedValue(mockResponse);

        const result = await activityApi.getActivityRegistrations(mockParams);

        expect(mockedRequest.get).toHaveBeenCalledWith('/activity-registrations', mockParams);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('createRegistration', () => {
      it('should create activity registration', async () => {
        const mockData = {
          activityId: 1,
          contactName: 'John Doe',
          contactPhone: '1234567890',
          attendeeCount: 1
        };
        const mockResponse = {
          success: true,
          data: { id: 1, ...mockData }
        };

        mockedRequest.post.mockResolvedValue(mockResponse);

        const result = await activityApi.createRegistration(mockData);

        expect(mockedRequest.post).toHaveBeenCalledWith('/activity-registrations', mockData);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('updateRegistration', () => {
      it('should update activity registration', async () => {
        const mockData = { contactName: 'Updated Name' };
        const mockResponse = {
          success: true,
          data: { id: 1, ...mockData }
        };

        mockedRequest.put.mockResolvedValue(mockResponse);

        const result = await activityApi.updateRegistration(1, mockData);

        expect(mockedRequest.put).toHaveBeenCalledWith('/activity-registrations/1', mockData);
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('Activity Check-in Management', () => {
    describe('getActivityCheckins', () => {
      it('should get activity check-ins', async () => {
        const mockParams = { page: 1, size: 10, activityId: 1 };
        const mockResponse = {
          success: true,
          data: {
            items: [{ id: 1, activityId: 1, checkinTime: '2024-01-01T10:00:00' }],
            total: 1,
            page: 1,
            pageSize: 10,
            totalPages: 1
          }
        };

        mockedRequest.get.mockResolvedValue(mockResponse);

        const result = await activityApi.getActivityCheckins(mockParams);

        expect(mockedRequest.get).toHaveBeenCalledWith('/activity-checkins', mockParams);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('batchCreateCheckins', () => {
      it('should batch create check-ins', async () => {
        const mockData = {
          activityId: 1,
          registrationIds: [1, 2, 3],
          checkinMethod: 1,
          checkinLocation: 'Main Hall'
        };
        const mockResponse = {
          success: true,
          data: [
            { id: 1, activityId: 1, registrationId: 1 },
            { id: 2, activityId: 1, registrationId: 2 },
            { id: 3, activityId: 1, registrationId: 3 }
          ]
        };

        mockedRequest.post.mockResolvedValue(mockResponse);

        const result = await activityApi.batchCreateCheckins(mockData);

        expect(mockedRequest.post).toHaveBeenCalledWith('/activity-checkins/batch', mockData);
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('Activity Evaluation Management', () => {
    describe('getActivityEvaluations', () => {
      it('should get activity evaluations', async () => {
        const mockParams = { page: 1, size: 10, activityId: 1 };
        const mockResponse = {
          success: true,
          data: {
            items: [{ id: 1, activityId: 1, rating: 5 }],
            total: 1,
            page: 1,
            pageSize: 10,
            totalPages: 1
          }
        };

        mockedRequest.get.mockResolvedValue(mockResponse);

        const result = await activityApi.getActivityEvaluations(mockParams);

        expect(mockedRequest.get).toHaveBeenCalledWith('/activity-evaluations', mockParams);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('createEvaluation', () => {
      it('should create activity evaluation', async () => {
        const mockData = {
          activityId: 1,
          registrationId: 1,
          rating: 5,
          content: 'Great activity!',
          tags: ['fun', 'educational'],
          isAnonymous: 0
        };
        const mockResponse = {
          success: true,
          data: { id: 1, ...mockData }
        };

        mockedRequest.post.mockResolvedValue(mockResponse);

        const result = await activityApi.createEvaluation(mockData);

        expect(mockedRequest.post).toHaveBeenCalledWith('/activity-evaluations', {
          ...mockData,
          tags: JSON.stringify(mockData.tags)
        });
        expect(result).toEqual(mockResponse);
      });
    });

    describe('updateEvaluation', () => {
      it('should update activity evaluation', async () => {
        const mockData = {
          rating: 4,
          tags: ['good', 'interesting']
        };
        const mockResponse = {
          success: true,
          data: { id: 1, ...mockData }
        };

        mockedRequest.put.mockResolvedValue(mockResponse);

        const result = await activityApi.updateEvaluation(1, mockData);

        expect(mockedRequest.put).toHaveBeenCalledWith('/activity-evaluations/1', {
          ...mockData,
          tags: JSON.stringify(mockData.tags)
        });
        expect(result).toEqual(mockResponse);
      });
    });

    describe('deleteEvaluation', () => {
      it('should delete activity evaluation', async () => {
        const mockResponse = { success: true, data: null };

        mockedRequest.del.mockResolvedValue(mockResponse);

        const result = await activityApi.deleteEvaluation(1);

        expect(mockedRequest.del).toHaveBeenCalledWith('/activity-evaluations/1');
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('Compatibility APIs', () => {
    it('should export deprecated functions as aliases', () => {
      expect(activityApi.createActivity).toBe(activityApi.createActivityPlan);
      expect(activityApi.updateActivity).toBe(activityApi.updateActivityPlan);
      expect(activityApi.deleteActivity).toBe(activityApi.deleteActivityPlan);
      expect(activityApi.getActivityRegistrationsOld).toBe(activityApi.getActivityPlanRegistrations);
    });

    describe('updateActivityStatus', () => {
      it('should update activity status', async () => {
        const mockResponse = {
          success: true,
          data: { id: 1, status: 2 }
        };

        mockedRequest.put.mockResolvedValue(mockResponse);

        const result = await activityApi.updateActivityStatus(1, 2);

        expect(mockedRequest.put).toHaveBeenCalledWith('/activity-plans/1', { status: 2 });
        expect(result).toEqual(mockResponse);
      });
    });
  });
});