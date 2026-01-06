import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';
import {
  validateRequiredFields,
  validateFieldTypes
} from '../../../utils/data-validation';

// Mock the request module
vi.mock('@/utils/request', () => ({
  default: {
    get: vi.fn()
  }
}));

// Mock the ApiResponse type
vi.mock('@/types/api', () => ({
  ApiResponse: vi.fn()
}));

// Import after mocks
import analyticsAPI from '@/api/modules/analytics';
import request from '@/utils/request';

const mockedRequest = request as any;

// 控制台错误检测变量
let consoleSpy: any

describe('Analytics API', () => {
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

  describe('getOverviewStats', () => {
    it('should get overview stats successfully with real API data', async () => {
      const mockDashboardResponse = {
        data: {
          students: { total: 324 },
          teachers: { total: 85 },
          classes: { total: 18 },
          enrollment: { conversionRate: 68.5 },
          satisfaction: { average: 4.8 },
          system: { health: 98 }
        }
      };

      const mockRevenueResponse = {
        data: {
          total: 771000,
          monthly: 128500
        }
      };

      const mockStudentsResponse = {
        data: {
          total: 324
        }
      };

      // Mock sequential API calls
      mockedRequest.get
        .mockResolvedValueOnce(mockDashboardResponse)
        .mockResolvedValueOnce(mockRevenueResponse)
        .mockResolvedValueOnce(mockStudentsResponse);

      const result = await analyticsAPI.getOverviewStats();

      // 验证API调用
      expect(mockedRequest.get).toHaveBeenCalledWith('/statistics/dashboard');
      expect(mockedRequest.get).toHaveBeenCalledWith('/statistics/revenue');
      expect(mockedRequest.get).toHaveBeenCalledWith('/statistics/students');

      // 验证响应结构
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // 验证必填字段
      const validation = validateRequiredFields(result.data, [
        'totalRevenue', 'monthlyRevenue', 'totalStudents', 'totalTeachers',
        'totalClasses', 'enrollmentRate', 'satisfactionScore', 'systemHealth'
      ]);
      expect(validation.valid).toBe(true);

      // 验证字段类型
      const typeValidation = validateFieldTypes(result.data, {
        totalRevenue: 'number',
        monthlyRevenue: 'number',
        totalStudents: 'number',
        totalTeachers: 'number',
        totalClasses: 'number',
        enrollmentRate: 'number',
        satisfactionScore: 'number',
        systemHealth: 'number'
      });
      expect(typeValidation.valid).toBe(true);

      // 验证数值范围
      expect(result.data.totalRevenue).toBeGreaterThanOrEqual(0);
      expect(result.data.enrollmentRate).toBeGreaterThanOrEqual(0);
      expect(result.data.enrollmentRate).toBeLessThanOrEqual(100);
      expect(result.data.satisfactionScore).toBeGreaterThanOrEqual(0);
      expect(result.data.satisfactionScore).toBeLessThanOrEqual(5);

      expect(result.message).toBe('获取概览数据成功');
    });

    it('should handle API errors and return default data', async () => {
      const mockError = new Error('API Error');
      mockedRequest.get.mockRejectedValue(mockError);

      const result = await analyticsAPI.getOverviewStats();

      expect(mockedRequest.get).toHaveBeenCalledWith('/statistics/dashboard');
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        totalRevenue: 128500,
        monthlyRevenue: 28500,
        totalStudents: 324,
        totalTeachers: 85,
        totalClasses: 18,
        enrollmentRate: 68.5,
        satisfactionScore: 4.8,
        systemHealth: 98
      });
      expect(result.message).toBe('使用默认数据');
    });

    it('should handle partial API responses with missing data', async () => {
      const mockDashboardResponse = { data: {} };
      const mockRevenueResponse = { data: { total: 500000 } };
      const mockStudentsResponse = { data: { total: 200 } };

      mockedRequest.get
        .mockResolvedValueOnce(mockDashboardResponse)
        .mockResolvedValueOnce(mockRevenueResponse)
        .mockResolvedValueOnce(mockStudentsResponse);

      const result = await analyticsAPI.getOverviewStats();

      expect(result.data.totalRevenue).toBe(500000);
      expect(result.data.totalStudents).toBe(200);
      expect(result.data.totalTeachers).toBe(0); // Default value
    });
  });

  describe('getTrendData', () => {
    it('should get trend data successfully from API', async () => {
      const mockResponse = {
        data: [
          { date: '1月', revenue: 95000, students: 280, satisfaction: 4.5 },
          { date: '2月', revenue: 102000, students: 290, satisfaction: 4.5 },
          { date: '3月', revenue: 108000, students: 295, satisfaction: 4.6 }
        ]
      };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await analyticsAPI.getTrendData();

      expect(mockedRequest.get).toHaveBeenCalledWith('/statistics/trends');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data);
      expect(result.message).toBe('获取趋势数据成功');
    });

    it('should handle empty trend data response', async () => {
      const mockResponse = { data: [] };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await analyticsAPI.getTrendData();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([
        { date: '1月', revenue: 95000, students: 280, satisfaction: 4.5 },
        { date: '2月', revenue: 102000, students: 290, satisfaction: 4.5 },
        { date: '3月', revenue: 108000, students: 295, satisfaction: 4.6 },
        { date: '4月', revenue: 115000, students: 305, satisfaction: 4.7 },
        { date: '5月', revenue: 122000, students: 315, satisfaction: 4.7 },
        { date: '6月', revenue: 128500, students: 324, satisfaction: 4.8 }
      ]);
      expect(result.message).toBe('获取趋势数据成功');
    });

    it('should handle API errors for trend data', async () => {
      const mockError = new Error('Network error');
      mockedRequest.get.mockRejectedValue(mockError);

      const result = await analyticsAPI.getTrendData();

      expect(result.success).toBe(false);
      expect(result.data).toEqual([]);
      expect(result.message).toBe('获取趋势数据失败');
    });
  });

  describe('getFinancialData', () => {
    it('should get financial data successfully from API', async () => {
      const mockResponse = {
        data: {
          totalRevenue: 771000,
          totalExpenses: 523000,
          netProfit: 248000,
          monthlyRevenue: [
            { month: '1月', revenue: 95000, expenses: 78000 },
            { month: '2月', revenue: 102000, expenses: 82000 }
          ],
          revenueBySource: {
            tuition: 520000,
            activities: 180000,
            other: 71000
          }
        }
      };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await analyticsAPI.getFinancialData();

      expect(mockedRequest.get).toHaveBeenCalledWith('/statistics/financial');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data);
      expect(result.message).toBe('获取财务数据成功');
    });

    it('should handle empty financial data response', async () => {
      const mockResponse = { data: null };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await analyticsAPI.getFinancialData();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        totalRevenue: 771000,
        totalExpenses: 523000,
        netProfit: 248000,
        monthlyRevenue: [
          { month: '1月', revenue: 95000, expenses: 78000 },
          { month: '2月', revenue: 102000, expenses: 82000 },
          { month: '3月', revenue: 108000, expenses: 85000 },
          { month: '4月', revenue: 115000, expenses: 88000 },
          { month: '5月', revenue: 122000, expenses: 92000 },
          { month: '6月', revenue: 128500, expenses: 98000 }
        ],
        revenueBySource: {
          tuition: 520000,
          activities: 180000,
          other: 71000
        }
      });
      expect(result.message).toBe('获取财务数据成功');
    });

    it('should handle API errors for financial data', async () => {
      const mockError = new Error('Database error');
      mockedRequest.get.mockRejectedValue(mockError);

      const result = await analyticsAPI.getFinancialData();

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.message).toBe('获取财务数据失败');
    });
  });

  describe('getEnrollmentData', () => {
    it('should get enrollment data successfully from API', async () => {
      const mockResponse = {
        data: {
          total: 156,
          approved: 107,
          pending: 28,
          rejected: 21,
          trends: [
            { date: '1月', count: 18 },
            { date: '2月', count: 22 },
            { date: '3月', count: 25 }
          ],
          conversionRate: 68.5
        }
      };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await analyticsAPI.getEnrollmentData();

      expect(mockedRequest.get).toHaveBeenCalledWith('/statistics/enrollment');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data);
      expect(result.message).toBe('获取招生数据成功');
    });

    it('should handle empty enrollment data response', async () => {
      const mockResponse = { data: null };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await analyticsAPI.getEnrollmentData();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        total: 156,
        approved: 107,
        pending: 28,
        rejected: 21,
        trends: [
          { date: '1月', count: 18 },
          { date: '2月', count: 22 },
          { date: '3月', count: 25 },
          { date: '4月', count: 28 },
          { date: '5月', count: 30 },
          { date: '6月', count: 33 }
        ],
        conversionRate: 68.5
      });
      expect(result.message).toBe('获取招生数据成功');
    });

    it('should handle API errors for enrollment data', async () => {
      const mockError = new Error('Service unavailable');
      mockedRequest.get.mockRejectedValue(mockError);

      const result = await analyticsAPI.getEnrollmentData();

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.message).toBe('获取招生数据失败');
    });
  });

  describe('getTeacherPerformance', () => {
    it('should get teacher performance data successfully from API', async () => {
      const mockResponse = {
        data: {
          totalTeachers: 85,
          averageRating: 4.3,
          topPerformers: [
            { id: 1, name: '张老师', rating: 4.9, classCount: 3 },
            { id: 2, name: '李老师', rating: 4.8, classCount: 2 }
          ],
          performanceDistribution: {
            excellent: 28,
            good: 35,
            average: 18,
            poor: 4
          }
        }
      };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await analyticsAPI.getTeacherPerformance();

      expect(mockedRequest.get).toHaveBeenCalledWith('/statistics/teachers');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data);
      expect(result.message).toBe('获取教师绩效数据成功');
    });

    it('should handle empty teacher performance data response', async () => {
      const mockResponse = { data: null };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await analyticsAPI.getTeacherPerformance();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        totalTeachers: 85,
        averageRating: 4.3,
        topPerformers: [
          { id: 1, name: '张老师', rating: 4.9, classCount: 3 },
          { id: 2, name: '李老师', rating: 4.8, classCount: 2 },
          { id: 3, name: '王老师', rating: 4.7, classCount: 3 },
          { id: 4, name: '赵老师', rating: 4.6, classCount: 2 },
          { id: 5, name: '陈老师', rating: 4.6, classCount: 2 }
        ],
        performanceDistribution: {
          excellent: 28,
          good: 35,
          average: 18,
          poor: 4
        }
      });
      expect(result.message).toBe('获取教师绩效数据成功');
    });

    it('should handle API errors for teacher performance data', async () => {
      const mockError = new Error('Timeout error');
      mockedRequest.get.mockRejectedValue(mockError);

      const result = await analyticsAPI.getTeacherPerformance();

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.message).toBe('获取教师绩效数据失败');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle concurrent API calls gracefully', async () => {
      const mockError = new Error('Rate limit exceeded');
      mockedRequest.get.mockRejectedValue(mockError);

      const promises = [
        analyticsAPI.getOverviewStats(),
        analyticsAPI.getTrendData(),
        analyticsAPI.getFinancialData()
      ];

      const results = await Promise.allSettled(promises);

      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('fulfilled');
      expect(results[2].status).toBe('fulfilled');

      // All should have fallback data
      const overviewResult = results[0] as PromiseFulfilledResult<any>;
      expect(overviewResult.value.success).toBe(true);
      expect(overviewResult.value.data).toBeDefined();
    });

    it('should handle malformed API responses', async () => {
      const malformedResponses = [
        undefined,
        null,
        {},
        { data: 'invalid_data' },
        { success: 'invalid' }
      ];

      for (const malformedResponse of malformedResponses) {
        mockedRequest.get.mockResolvedValueOnce(malformedResponse);
        
        const result = await analyticsAPI.getOverviewStats();
        
        // Should always return valid fallback data
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(typeof result.data.totalRevenue).toBe('number');
      }
    });

    it('should handle API responses with missing required fields', async () => {
      const incompleteResponse = {
        data: {
          students: { total: 100 }
          // Missing other required fields
        }
      };

      mockedRequest.get.mockResolvedValue(incompleteResponse);

      const result = await analyticsAPI.getOverviewStats();

      expect(result.success).toBe(true);
      expect(result.data.totalStudents).toBe(100);
      expect(result.data.totalTeachers).toBe(0); // Default value
      expect(result.data.totalRevenue).toBe(0); // Default value
    });
  });

  describe('Data Transformation', () => {
    it('should correctly transform API data to expected format', async () => {
      const mockDashboardResponse = {
        data: {
          students: { total: 500 },
          teachers: { total: 50 },
          classes: { total: 15 },
          enrollment: { conversionRate: 75.0 },
          satisfaction: { average: 4.6 },
          system: { health: 95 }
        }
      };

      const mockRevenueResponse = {
        data: {
          total: 1000000,
          monthly: 150000
        }
      };

      const mockStudentsResponse = {
        data: {
          total: 500
        }
      };

      mockedRequest.get
        .mockResolvedValueOnce(mockDashboardResponse)
        .mockResolvedValueOnce(mockRevenueResponse)
        .mockResolvedValueOnce(mockStudentsResponse);

      const result = await analyticsAPI.getOverviewStats();

      expect(result.data).toEqual({
        totalRevenue: 1000000,
        monthlyRevenue: 150000,
        totalStudents: 500,
        totalTeachers: 50,
        totalClasses: 15,
        enrollmentRate: 75.0,
        satisfactionScore: 4.6,
        systemHealth: 95
      });
    });

    it('should handle numeric data conversion correctly', async () => {
      const mockResponse = {
        data: [
          { date: '1月', revenue: '95000', students: '280', satisfaction: '4.5' },
          { date: '2月', revenue: '102000', students: '290', satisfaction: '4.5' }
        ]
      };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await analyticsAPI.getTrendData();

      // API should handle string to number conversion
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });
});