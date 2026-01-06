import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import {
  statisticsApi,
  StatisticsPeriod,
  type StatisticsQueryParams,
  type EnrollmentStatistics,
  type StudentStatistics,
  type RevenueStatistics,
  type ActivityStatistics,
  type DashboardStatistics
} from '@/api/modules/statistics';
import { get, post } from '@/utils/request';
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';
import {
  validateRequiredFields,
  validateFieldTypes
} from '../../../utils/data-validation';

// Mock the request module
vi.mock('@/utils/request', () => ({
  get: vi.fn(),
  post: vi.fn()
}));

// 控制台错误检测变量
let consoleSpy: any

describe('Statistics API', () => {
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

  describe('getDashboardStatistics', () => {
    it('should call get with correct endpoint and params', async () => {
      const mockParams: StatisticsQueryParams = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        period: StatisticsPeriod.MONTHLY,
        kindergartenId: '1'
      };
      const mockResponse = {
        success: true,
        data: {
          enrollment: {
            total: 100,
            approved: 80,
            pending: 15,
            rejected: 5,
            trends: []
          },
          students: {
            total: 200,
            byAge: {},
            byGender: {},
            byClass: {},
            trends: []
          },
          revenue: {
            total: 1000000,
            byMonth: [],
            bySource: {},
            trends: []
          },
          activities: {
            total: 50,
            published: 40,
            draft: 10,
            participation: []
          }
        }
      };

      vi.mocked(get).mockResolvedValue(mockResponse);

      const result = await statisticsApi.getDashboardStatistics(mockParams);

      // 验证API调用
      expect(get).toHaveBeenCalledWith('/statistics/dashboard', mockParams);

      // 验证响应结构
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // 验证统计数据结构
      const validation = validateRequiredFields(result.data, ['enrollment', 'students', 'revenue', 'activities']);
      expect(validation.valid).toBe(true);

      // 验证enrollment统计
      const enrollmentValidation = validateRequiredFields(result.data.enrollment, ['total', 'approved', 'pending', 'rejected']);
      expect(enrollmentValidation.valid).toBe(true);

      const enrollmentTypeValidation = validateFieldTypes(result.data.enrollment, {
        total: 'number',
        approved: 'number',
        pending: 'number',
        rejected: 'number'
      });
      expect(enrollmentTypeValidation.valid).toBe(true);

      // 验证数值范围
      expect(result.data.enrollment.total).toBeGreaterThanOrEqual(0);
      expect(result.data.students.total).toBeGreaterThanOrEqual(0);
      expect(result.data.revenue.total).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty params', async () => {
      const mockResponse = {
        success: true,
        data: {
          enrollment: { total: 0, approved: 0, pending: 0, rejected: 0, trends: [] },
          students: { total: 0, byAge: {}, byGender: {}, byClass: {}, trends: [] },
          revenue: { total: 0, byMonth: [], bySource: {}, trends: [] },
          activities: { total: 0, published: 0, draft: 0, participation: [] }
        }
      };
      
      vi.mocked(get).mockResolvedValue(mockResponse);

      const result = await statisticsApi.getDashboardStatistics();

      expect(get).toHaveBeenCalledWith('/statistics/dashboard', undefined);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getEnrollmentStatistics', () => {
    it('should call get with correct endpoint and params', async () => {
      const mockParams: StatisticsQueryParams = {
        period: StatisticsPeriod.MONTHLY,
        classId: 'class1'
      };
      const mockResponse = {
        success: true,
        data: {
          total: 100,
          approved: 80,
          pending: 15,
          rejected: 5,
          trends: [
            { date: '2024-01', value: 10 },
            { date: '2024-02', value: 15 }
          ]
        }
      };
      
      vi.mocked(get).mockResolvedValue(mockResponse);

      const result = await statisticsApi.getEnrollmentStatistics(mockParams);

      expect(get).toHaveBeenCalledWith('/statistics/enrollment', mockParams);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getStudentStatistics', () => {
    it('should call get with correct endpoint and params', async () => {
      const mockParams: StatisticsQueryParams = {
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      };
      const mockResponse = {
        success: true,
        data: {
          total: 200,
          byAge: { '3-4': 50, '4-5': 100, '5-6': 50 },
          byGender: { 'MALE': 110, 'FEMALE': 90 },
          byClass: { 'class1': 25, 'class2': 30 },
          trends: [
            { date: '2024-01', value: 180 },
            { date: '2024-02', value: 200 }
          ]
        }
      };
      
      vi.mocked(get).mockResolvedValue(mockResponse);

      const result = await statisticsApi.getStudentStatistics(mockParams);

      expect(get).toHaveBeenCalledWith('/statistics/students', mockParams);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getRevenueStatistics', () => {
    it('should call get with correct endpoint and params', async () => {
      const mockParams: StatisticsQueryParams = {
        period: StatisticsPeriod.YEARLY
      };
      const mockResponse = {
        success: true,
        data: {
          total: 1000000,
          byMonth: [
            { date: '2024-01', value: 80000 },
            { date: '2024-02', value: 85000 }
          ],
          bySource: { 'tuition': 800000, 'fees': 200000 },
          trends: [
            { date: '2024-01', value: 80000 },
            { date: '2024-02', value: 85000 }
          ]
        }
      };
      
      vi.mocked(get).mockResolvedValue(mockResponse);

      const result = await statisticsApi.getRevenueStatistics(mockParams);

      expect(get).toHaveBeenCalledWith('/statistics/revenue', mockParams);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getActivityStatistics', () => {
    it('should call get with correct endpoint and params', async () => {
      const mockParams: StatisticsQueryParams = {
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      };
      const mockResponse = {
        success: true,
        data: {
          total: 50,
          published: 40,
          draft: 10,
          participation: [
            { date: '2024-01', value: 200 },
            { date: '2024-02', value: 250 }
          ]
        }
      };
      
      vi.mocked(get).mockResolvedValue(mockResponse);

      const result = await statisticsApi.getActivityStatistics(mockParams);

      expect(get).toHaveBeenCalledWith('/statistics/activities', mockParams);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('generateReport', () => {
    it('should call post with correct endpoint and data', async () => {
      const mockData = {
        type: 'enrollment',
        format: 'pdf',
        params: {
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          period: StatisticsPeriod.MONTHLY
        }
      };
      const mockResponse = {
        success: true,
        data: {
          downloadUrl: '/reports/enrollment-2024.pdf'
        }
      };
      
      vi.mocked(post).mockResolvedValue(mockResponse);

      const result = await statisticsApi.generateReport(mockData);

      expect(post).toHaveBeenCalledWith('/statistics/reports', mockData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle different report types and formats', async () => {
      const testCases = [
        { type: 'student', format: 'excel' },
        { type: 'revenue', format: 'pdf' },
        { type: 'activity', format: 'excel' }
      ];

      for (const testCase of testCases) {
        const mockData = {
          type: testCase.type,
          format: testCase.format,
          params: { startDate: '2024-01-01' }
        };
        const mockResponse = {
          success: true,
          data: { downloadUrl: `/reports/${testCase.type}-2024.${testCase.format}` }
        };
        
        vi.mocked(post).mockResolvedValue(mockResponse);

        const result = await statisticsApi.generateReport(mockData as any);

        expect(post).toHaveBeenCalledWith('/statistics/reports', mockData);
        expect(result.data.downloadUrl).toContain(testCase.type);
      }
    });
  });

  describe('getRealTimeStatistics', () => {
    it('should call get with correct endpoint', async () => {
      const mockResponse = {
        success: true,
        data: {
          onlineUsers: 150,
          todayEnrollments: 5,
          todayRevenue: 25000,
          systemLoad: 65
        }
      };
      
      vi.mocked(get).mockResolvedValue(mockResponse);

      const result = await statisticsApi.getRealTimeStatistics();

      expect(get).toHaveBeenCalledWith('/statistics/realtime');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const mockError = new Error('Network error');
      vi.mocked(get).mockRejectedValue(mockError);

      await expect(statisticsApi.getDashboardStatistics()).rejects.toThrow('Network error');
    });

    it('should handle validation errors', async () => {
      const mockResponse = {
        success: false,
        message: 'Invalid statistics parameters',
        data: null
      };
      vi.mocked(get).mockResolvedValue(mockResponse);

      const result = await statisticsApi.getEnrollmentStatistics();
      expect(result).toEqual(mockResponse);
    });

    it('should handle malformed response data', async () => {
      const mockResponse = {
        success: true,
        data: null
      };
      vi.mocked(get).mockResolvedValue(mockResponse);

      const result = await statisticsApi.getStudentStatistics();
      expect(result.data).toBeNull();
    });
  });

  describe('Parameter Validation', () => {
    it('should handle invalid date ranges', async () => {
      const invalidParams = {
        startDate: 'invalid-date',
        endDate: '2024-01-01'
      };
      
      const mockResponse = {
        success: true,
        data: {
          total: 0,
          approved: 0,
          pending: 0,
          rejected: 0,
          trends: []
        }
      };
      
      vi.mocked(get).mockResolvedValue(mockResponse);

      const result = await statisticsApi.getEnrollmentStatistics(invalidParams as any);
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty period parameter', async () => {
      const mockResponse = {
        success: true,
        data: {
          total: 0,
          byMonth: [],
          bySource: {},
          trends: []
        }
      };
      
      vi.mocked(get).mockResolvedValue(mockResponse);

      const result = await statisticsApi.getRevenueStatistics({});
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Compatibility Exports', () => {
    it('should export compatibility functions', () => {
      expect(typeof statisticsApi.getDashboardStatistics).toBe('function');
      expect(typeof statisticsApi.getEnrollmentStatistics).toBe('function');
      expect(typeof statisticsApi.getStudentStatistics).toBe('function');
      expect(typeof statisticsApi.getRevenueStatistics).toBe('function');
      expect(typeof statisticsApi.getActivityStatistics).toBe('function');
    });
  });
});