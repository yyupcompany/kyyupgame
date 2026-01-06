/**
 * 招生计划模块API测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';
import {
  validateRequiredFields,
  validateFieldTypes
} from '../../../utils/data-validation';

// Mock request module
vi.mock('@/utils/request', () => {
  const mockGet = vi.fn();
  const mockPost = vi.fn();
  const mockPut = vi.fn();
  const mockDelete = vi.fn();
  const mockDel = vi.fn();
  const mockRequest = {
    get: mockGet,
    post: mockPost,
    put: mockPut,
    delete: mockDelete,
    del: mockDel
  };
  return {
    default: mockRequest,
    request: mockRequest,
    get: mockGet,
    post: mockPost,
    put: mockPut,
    delete: mockDelete,
    del: mockDel
  };
});

// Import after mocks
import {
  getEnrollmentPlanList,
  getEnrollmentPlanDetail,
  createEnrollmentPlan,
  updateEnrollmentPlan,
  deleteEnrollmentPlan,
  getEnrollmentQuotas,
  createEnrollmentQuota,
  batchCreateEnrollmentQuotas,
  updateEnrollmentQuota,
  deleteEnrollmentQuota,
  getEnrollmentAnalytics,
  updateEnrollmentPlanStatus,
  exportEnrollmentPlanData,
  enrollmentPlanApi,
  adaptEnrollmentPlan,
  adaptEnrollmentPlanList,
  EnrollmentPlanStatus,
  EnrollmentPlanType
} from '@/api/modules/enrollment-plan';
import request from '@/utils/request';

const mockedRequest = vi.mocked(request);
const mockedGet = mockedRequest.get;
const mockedPost = mockedRequest.post;
const mockedPut = mockedRequest.put;
const mockedDelete = mockedRequest.delete;
const mockedDel = mockedRequest.del;

// 控制台错误检测变量
let consoleSpy: any

describe('Enrollment Plan API', () => {
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

  describe('getEnrollmentPlanList', () => {
    it('should get enrollment plan list with query parameters', async () => {
      const params = {
        page: 1,
        pageSize: 10,
        status: 'ACTIVE',
        type: 'STANDARD',
        startDateFrom: '2024-09-01',
        startDateTo: '2024-12-31'
      };
      const mockResponse = {
        success: true,
        data: {
          items: [
            {
              id: 1,
              name: '2024年秋季招生计划',
              code: 'ENROLL2024FALL',
              year: 2024,
              term: '秋季',
              startDate: '2024-09-01',
              endDate: '2024-12-31',
              targetCount: 100,
              enrolledCount: 45,
              status: 'ACTIVE'
            }
          ],
          total: 1,
          page: 1,
          pageSize: 10
        }
      };

      mockedGet.mockResolvedValue(mockResponse);
      const result = await getEnrollmentPlanList(params);

      // 验证API调用 - API会转换参数名
      expect(mockedGet).toHaveBeenCalledWith('/enrollment-plans', {
        page: 1,
        pageSize: 10,
        status: 'ACTIVE',
        type: 'STANDARD',
        startDate: '2024-09-01',
        endDate: '2024-12-31'
      });

      // 验证响应结构 - API返回{data: {data: [], total, page, size}}
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data.data)).toBe(true);

      // 验证分页字段 - API使用data/size而非items/pageSize
      const paginationValidation = validateRequiredFields(result.data, ['data', 'total', 'page', 'size']);
      expect(paginationValidation.valid).toBe(true);

      // 验证列表项
      if (result.data.data.length > 0) {
        const itemValidation = validateRequiredFields(result.data.data[0], ['id', 'name', 'year', 'term', 'status']);
        expect(itemValidation.valid).toBe(true);

        const itemTypeValidation = validateFieldTypes(result.data.data[0], {
          id: 'number',
          name: 'string',
          year: 'number',
          term: 'string',
          status: 'string'
        });
        expect(itemTypeValidation.valid).toBe(true);
      }
    });

    it('should get enrollment plan list without parameters', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 10
        }
      };

      mockedGet.mockResolvedValue(mockResponse);
      const result = await getEnrollmentPlanList();

      expect(mockedGet).toHaveBeenCalledWith('/enrollment-plans', {});
      expect(result.data.data).toHaveLength(0);
    });

    it('should handle empty response data', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 10
        }
      };

      mockedGet.mockResolvedValue(mockResponse);
      const result = await getEnrollmentPlanList();

      expect(result.data.data).toHaveLength(0);
      expect(result.data.total).toBe(0);
    });
  });

  describe('getEnrollmentPlanDetail', () => {
    it('should get enrollment plan detail by ID', async () => {
      const planId = '1';
      const mockResponse = {
        success: true,
        data: {
          id: 1,
          name: '2024年秋季招生计划',
          code: 'ENROLL2024FALL',
          year: 2024,
          term: '秋季',
          startDate: '2024-09-01',
          endDate: '2024-12-31',
          targetCount: 100,
          enrolledCount: 45,
          status: 'ACTIVE',
          description: '2024年秋季学期招生计划',
          quotaDetails: [
            {
              id: 1,
              className: '小班一班',
              ageRange: '3-4岁',
              totalQuota: 30,
              usedQuota: 15,
              remainingQuota: 15
            }
          ]
        }
      };

      mockedGet.mockResolvedValue(mockResponse);
      const result = await getEnrollmentPlanDetail(planId);

      expect(mockedGet).toHaveBeenCalledWith(`/enrollment-plans/${planId}`);
      expect(result.success).toBe(true);
      expect(result.data.id).toBe(1);
      expect(result.data.name).toBe('2024年秋季招生计划');
    });
  });

  describe('createEnrollmentPlan', () => {
    it('should create a new enrollment plan', async () => {
      const planData = {
        name: '2025年春季招生计划',
        code: 'ENROLL2025SPRING',
        year: 2025,
        term: '春季',
        startDate: '2025-03-01',
        endDate: '2025-06-30',
        targetCount: 120,
        description: '2025年春季学期招生计划',
        ageRequirement: '3-6岁'
      };
      const mockResponse = {
        success: true,
        data: {
          id: 2,
          ...planData,
          status: 'DRAFT'
        }
      };

      mockedPost.mockResolvedValue(mockResponse);
      const result = await createEnrollmentPlan(planData);

      expect(mockedPost).toHaveBeenCalledWith('/enrollment-plans', planData);
      expect(result.success).toBe(true);
      expect(result.data.id).toBe(2);
    });
  });

  describe('updateEnrollmentPlan', () => {
    it('should update enrollment plan', async () => {
      const planId = '1';
      const updateData = {
        name: '2024年秋季招生计划 (更新)',
        targetCount: 110,
        description: '更新后的招生计划描述'
      };
      const mockResponse = {
        success: true,
        data: {
          id: 1,
          ...updateData
        }
      };

      mockedPut.mockResolvedValue(mockResponse);
      const result = await updateEnrollmentPlan(planId, updateData);

      expect(mockedPut).toHaveBeenCalledWith(`/enrollment-plans/${planId}`, updateData);
      expect(result.success).toBe(true);
    });
  });

  describe('deleteEnrollmentPlan', () => {
    it('should delete enrollment plan', async () => {
      const planId = '1';
      const mockResponse = {
        success: true,
        data: null
      };

      mockedDel.mockResolvedValue(mockResponse);
      const result = await deleteEnrollmentPlan(planId);

      expect(mockedDel).toHaveBeenCalledWith(`/enrollment-plans/${planId}`);
      expect(result.success).toBe(true);
    });
  });

  describe('getEnrollmentQuotas', () => {
    it('should get enrollment quotas for a plan', async () => {
      const planId = '1';
      const params = {
        page: 1,
        pageSize: 20
      };
      const mockResponse = {
        success: true,
        data: {
          items: [
            {
              id: 1,
              className: '小班一班',
              ageRange: '3-4岁',
              totalQuota: 30,
              usedQuota: 15,
              remainingQuota: 15
            }
          ],
          total: 1,
          page: 1,
          pageSize: 20
        }
      };

      mockedGet.mockResolvedValue(mockResponse);
      const result = await getEnrollmentQuotas(planId, params);

      expect(mockedGet).toHaveBeenCalledWith(`/enrollment-plans/${planId}/quotas`, params);
      expect(result.success).toBe(true);
      expect(result.data.items).toHaveLength(1);
    });
  });

  describe('createEnrollmentQuota', () => {
    it('should create enrollment quota', async () => {
      const quotaData = {
        planId: 1,
        className: '小班二班',
        ageRange: '3-4岁',
        totalQuota: 25
      };
      const mockResponse = {
        success: true,
        data: {
          id: 2,
          ...quotaData,
          usedQuota: 0,
          remainingQuota: 25
        }
      };

      mockedPost.mockResolvedValue(mockResponse);
      const result = await createEnrollmentQuota(quotaData);

      expect(mockedPost).toHaveBeenCalledWith('/enrollment-quotas', quotaData);
      expect(result.success).toBe(true);
    });
  });

  describe('batchCreateEnrollmentQuotas', () => {
    it('should batch create enrollment quotas', async () => {
      const batchData = {
        planId: 1,
        quotas: [
          {
            className: '小班一班',
            ageRange: '3-4岁',
            totalQuota: 30
          },
          {
            className: '小班二班',
            ageRange: '3-4岁',
            totalQuota: 25
          }
        ]
      };
      const mockResponse = {
        success: true,
        data: [
          {
            id: 1,
            className: '小班一班',
            totalQuota: 30,
            usedQuota: 0,
            remainingQuota: 30
          },
          {
            id: 2,
            className: '小班二班',
            totalQuota: 25,
            usedQuota: 0,
            remainingQuota: 25
          }
        ]
      };

      mockedPost.mockResolvedValue(mockResponse);
      const result = await batchCreateEnrollmentQuotas(batchData);

      expect(mockedPost).toHaveBeenCalledWith('/enrollment-quotas/batch', batchData);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });
  });

  describe('updateEnrollmentQuota', () => {
    it('should update enrollment quota', async () => {
      const quotaId = '1';
      const updateData = {
        totalQuota: 35,
        className: '小班一班 (更新)'
      };
      const mockResponse = {
        success: true,
        data: {
          id: 1,
          ...updateData
        }
      };

      mockedPut.mockResolvedValue(mockResponse);
      const result = await updateEnrollmentQuota(quotaId, updateData);

      expect(mockedPut).toHaveBeenCalledWith(`/enrollment-quotas/${quotaId}`, updateData);
      expect(result.success).toBe(true);
    });
  });

  describe('deleteEnrollmentQuota', () => {
    it('should delete enrollment quota', async () => {
      const quotaId = '1';
      const mockResponse = {
        success: true,
        data: null
      };

      mockedDel.mockResolvedValue(mockResponse);
      const result = await deleteEnrollmentQuota(quotaId);

      expect(mockedDel).toHaveBeenCalledWith(`/enrollment-quotas/${quotaId}`);
      expect(result.success).toBe(true);
    });
  });

  describe('getEnrollmentAnalytics', () => {
    it('should get enrollment analytics', async () => {
      const mockResponse = {
        success: true,
        data: {
          totalPlans: 12,
          activePlans: 5,
          completedPlans: 7,
          totalTarget: 1200,
          totalEnrolled: 980,
          enrollmentRate: 81.7,
          plansByType: {
            STANDARD: 8,
            SUMMER: 2,
            WINTER: 1,
            SPECIAL: 1
          },
          monthlyEnrollment: [
            { month: '2024-09', count: 120 },
            { month: '2024-10', count: 95 },
            { month: '2024-11', count: 85 }
          ]
        }
      };

      mockedGet.mockResolvedValue(mockResponse);
      const result = await getEnrollmentAnalytics();

      expect(mockedGet).toHaveBeenCalledWith('/enrollment-plans/analytics');
      expect(result.success).toBe(true);
      expect(result.data.totalPlans).toBe(12);
      expect(result.data.enrollmentRate).toBe(81.7);
    });
  });

  describe('updateEnrollmentPlanStatus', () => {
    it('should update enrollment plan status', async () => {
      const planId = '1';
      const status = EnrollmentPlanStatus.PAUSED;
      const mockResponse = {
        success: true,
        data: {
          id: 1,
          status: 'PAUSED'
        }
      };

      mockedPut.mockResolvedValue(mockResponse);
      const result = await updateEnrollmentPlanStatus(planId, status);

      expect(mockedPut).toHaveBeenCalledWith(`/enrollment-plans/${planId}/status`, { status });
      expect(result.success).toBe(true);
    });
  });

  describe('exportEnrollmentPlanData', () => {
    it('should export enrollment plan data', async () => {
      const planId = '1';
      const mockBlob = new Blob(['test data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const mockResponse = {
        success: true,
        data: mockBlob
      };

      mockedGet.mockResolvedValue(mockResponse);
      const result = await exportEnrollmentPlanData(planId);

      expect(mockedGet).toHaveBeenCalledWith(`/enrollment-plans/${planId}/export`, {}, { responseType: 'blob' });
      expect(result.success).toBe(true);
      expect(result.data).toBe(mockBlob);
    });
  });

  describe('enrollmentPlanApi object', () => {
    it('should provide unified API interface', async () => {
      const mockResponse = { success: true, data: { items: [], total: 0 } };

      // Test getList - API puts page/limit in URL, other params in params object
      mockedGet.mockResolvedValue(mockResponse);
      await enrollmentPlanApi.getList({ page: 1, limit: 10 });
      expect(mockedGet).toHaveBeenCalledWith('/enrollment-plans?page=1&limit=10', { params: {} });

      // Test getById
      mockedGet.mockClear();
      mockedGet.mockResolvedValue(mockResponse);
      await enrollmentPlanApi.getById('1');
      expect(mockedGet).toHaveBeenCalledWith('/enrollment-plans/1');

      // Test create
      mockedPost.mockResolvedValue(mockResponse);
      await enrollmentPlanApi.create({ name: 'Test Plan' });
      expect(mockedPost).toHaveBeenCalledWith('/enrollment-plans', { name: 'Test Plan' });

      // Test update
      mockedPut.mockResolvedValue(mockResponse);
      await enrollmentPlanApi.update('1', { name: 'Updated' });
      expect(mockedPut).toHaveBeenCalledWith('/enrollment-plans/1', { name: 'Updated' });

      // Test delete - API uses request.delete not request.del
      mockedDelete.mockResolvedValue(mockResponse);
      await enrollmentPlanApi.delete('1');
      expect(mockedDelete).toHaveBeenCalledWith('/enrollment-plans/1');

      // Test getStatistics
      mockedGet.mockClear();
      mockedGet.mockResolvedValue(mockResponse);
      await enrollmentPlanApi.getStatistics();
      expect(mockedGet).toHaveBeenCalledWith('/enrollment-plans/statistics');
    });
  });

  describe('Data Transformation Functions', () => {
    it('should adapt backend enrollment plan to frontend format', () => {
      const backendData = {
        id: 1,
        name: '2024年秋季招生计划',
        code: 'ENROLL2024FALL',
        year: 2024,
        term: '秋季',
        startDate: '2024-09-01',
        endDate: '2024-12-31',
        targetCount: 100,
        enrolledCount: 45,
        status: 'ACTIVE',
        description: '测试描述',
        ageRequirement: '3-6岁',
        createdAt: '2024-09-01T00:00:00Z',
        updatedAt: '2024-09-01T00:00:00Z'
      };

      const result = adaptEnrollmentPlan(backendData);

      expect(result.id).toBe(1);
      expect(result.name).toBe('2024年秋季招生计划');
      expect(result.code).toBe('ENROLL2024FALL');
      expect(result.year).toBe(2024);
      expect(result.term).toBe('秋季');
      expect(result.targetCount).toBe(100);
      expect(result.actualCount).toBe(45);
      expect(result.kindergartenId).toBe(0);
      expect(result.kindergartenName).toBe('');
      expect(result.status).toBe(EnrollmentPlanStatus.ACTIVE);
    });

    it('should adapt backend enrollment plan list to frontend format', () => {
      const backendData = {
        items: [
          {
            id: 1,
            name: '计划1',
            year: 2024,
            term: '秋季',
            targetCount: 100,
            enrolledCount: 45,
            status: 'ACTIVE'
          }
        ],
        total: 1,
        page: 1,
        pageSize: 10
      };

      const result = adaptEnrollmentPlanList(backendData);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.size).toBe(10);
      expect(result.data[0].id).toBe(1);
      expect(result.data[0].actualCount).toBe(45);
    });

    it('should handle undefined data in list adaptation', () => {
      const result = adaptEnrollmentPlanList(undefined);

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
      expect(result.size).toBe(10);
    });
  });

  describe('Enum Testing', () => {
    it('should handle EnrollmentPlanStatus enum values', () => {
      expect(EnrollmentPlanStatus.DRAFT).toBe('DRAFT');
      expect(EnrollmentPlanStatus.ACTIVE).toBe('ACTIVE');
      expect(EnrollmentPlanStatus.PAUSED).toBe('PAUSED');
      expect(EnrollmentPlanStatus.COMPLETED).toBe('COMPLETED');
      expect(EnrollmentPlanStatus.CANCELLED).toBe('CANCELLED');
    });

    it('should handle EnrollmentPlanType enum values', () => {
      expect(EnrollmentPlanType.STANDARD).toBe('STANDARD');
      expect(EnrollmentPlanType.SUMMER).toBe('SUMMER');
      expect(EnrollmentPlanType.WINTER).toBe('WINTER');
      expect(EnrollmentPlanType.SPECIAL).toBe('SPECIAL');
    });

    it('should accept enum values in API calls', async () => {
      const mockResponse = { success: true, data: {} };
      mockedPut.mockResolvedValue(mockResponse);

      await updateEnrollmentPlanStatus('1', EnrollmentPlanStatus.PAUSED);

      expect(mockedPut).toHaveBeenCalledWith('/enrollment-plans/1/status', { status: 'PAUSED' });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const errorMessage = 'Network Error';
      mockedGet.mockRejectedValue(new Error(errorMessage));

      await expect(getEnrollmentPlanList()).rejects.toThrow(errorMessage);
    });

    it('should handle validation errors', async () => {
      const mockResponse = {
        success: false,
        message: 'Validation failed: Name is required'
      };

      mockedPost.mockResolvedValue(mockResponse);
      const result = await createEnrollmentPlan({} as any);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Name is required');
    });

    it('should handle not found errors', async () => {
      const mockResponse = {
        success: false,
        message: 'Enrollment plan not found'
      };

      mockedGet.mockResolvedValue(mockResponse);
      const result = await getEnrollmentPlanDetail('999');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Enrollment plan not found');
    });
  });

  describe('Data Structure Validation', () => {
    it('should validate enrollment plan structure', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 1,
          name: '2024年秋季招生计划',
          code: 'ENROLL2024FALL',
          year: 2024,
          term: '秋季',
          startDate: '2024-09-01',
          endDate: '2024-12-31',
          targetCount: 100,
          enrolledCount: 45,
          status: 'ACTIVE',
          description: '测试描述',
          createdAt: '2024-09-01T00:00:00Z',
          updatedAt: '2024-09-01T00:00:00Z'
        }
      };

      mockedGet.mockResolvedValue(mockResponse);
      const result = await getEnrollmentPlanDetail('1');

      expect(result.data).toHaveProperty('id');
      expect(result.data).toHaveProperty('name');
      expect(result.data).toHaveProperty('code');
      expect(result.data).toHaveProperty('year');
      expect(result.data).toHaveProperty('term');
      expect(result.data).toHaveProperty('startDate');
      expect(result.data).toHaveProperty('endDate');
      expect(result.data).toHaveProperty('targetCount');
      // API converts enrolledCount to actualCount
      expect(result.data).toHaveProperty('actualCount');
      expect(result.data).toHaveProperty('status');
      expect(typeof result.data.id).toBe('number');
      expect(typeof result.data.year).toBe('number');
      expect(typeof result.data.targetCount).toBe('number');
      expect(typeof result.data.actualCount).toBe('number');
    });

    it('should validate analytics structure', async () => {
      const mockResponse = {
        success: true,
        data: {
          totalPlans: 12,
          activePlans: 5,
          completedPlans: 7,
          totalTarget: 1200,
          totalEnrolled: 980,
          enrollmentRate: 81.7,
          plansByType: {
            STANDARD: 8,
            SUMMER: 2,
            WINTER: 1,
            SPECIAL: 1
          },
          monthlyEnrollment: [
            { month: '2024-09', count: 120 },
            { month: '2024-10', count: 95 }
          ]
        }
      };

      mockedGet.mockResolvedValue(mockResponse);
      const result = await getEnrollmentAnalytics();

      expect(result.data).toHaveProperty('totalPlans');
      expect(result.data).toHaveProperty('activePlans');
      expect(result.data).toHaveProperty('completedPlans');
      expect(result.data).toHaveProperty('totalTarget');
      expect(result.data).toHaveProperty('totalEnrolled');
      expect(result.data).toHaveProperty('enrollmentRate');
      expect(result.data).toHaveProperty('plansByType');
      expect(result.data).toHaveProperty('monthlyEnrollment');
      expect(typeof result.data.enrollmentRate).toBe('number');
      expect(Array.isArray(result.data.monthlyEnrollment)).toBe(true);
    });
  });
});