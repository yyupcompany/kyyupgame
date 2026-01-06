/**
 * 仪表盘模块API测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import {
  getDashboardStats,
  getDashboardOverview,
  getTodos,
  getSchedules,
  getClassesOverview,
  getEnrollmentTrends,
  getActivityData,
  getChannelAnalysis,
  getConversionFunnel,
  getRecentActivities
} from '@/api/modules/dashboard';
import request from '@/utils/request';
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';
import {
  validateRequiredFields,
  validateFieldTypes
} from '../../../utils/data-validation';

// Mock request function
vi.mock('@/utils/request', () => ({
  default: {
    get: vi.fn()
  }
}));

// Mock data transform utilities
vi.mock('@/utils/dataTransform', () => ({
  transformListResponse: vi.fn((response, transformFn) => {
    if (response.data && Array.isArray(response.data.items)) {
      response.data.items = response.data.items.map(transformFn);
    }
    return response;
  }),
  transformTodoData: vi.fn((data) => data),
  transformDashboardStats: vi.fn((data) => data),
  transformScheduleData: vi.fn((data) => data),
  transformActivityData: vi.fn((data) => data)
}));

const mockedRequest = vi.mocked(request.get);

// 控制台错误检测变量
let consoleSpy: any

describe('Dashboard API', () => {
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

  describe('getDashboardStats', () => {
    it('should get dashboard statistics', async () => {
      const mockResponse = {
        success: true,
        data: {
          userCount: 150,
          kindergartenCount: 5,
          studentCount: 1200,
          enrollmentCount: 300,
          activityCount: 45,
          teacherCount: 80,
          classCount: 40
        }
      };

      mockedRequest.mockResolvedValue(mockResponse);
      const result = await getDashboardStats();

      // 验证API调用
      expect(mockedRequest).toHaveBeenCalledWith('/dashboard/stats');

      // 验证返回数据结构
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // 验证必填字段
      const requiredFields = ['userCount', 'kindergartenCount', 'studentCount', 'enrollmentCount', 'activityCount', 'teacherCount', 'classCount'];
      const validation = validateRequiredFields(result.data, requiredFields);
      expect(validation.valid).toBe(true);
      if (!validation.valid) {
        throw new Error(`Missing required fields: ${validation.missing.join(', ')}`);
      }

      // 验证字段类型
      const typeValidation = validateFieldTypes(result.data, {
        userCount: 'number',
        kindergartenCount: 'number',
        studentCount: 'number',
        enrollmentCount: 'number',
        activityCount: 'number',
        teacherCount: 'number',
        classCount: 'number'
      });
      expect(typeValidation.valid).toBe(true);
      if (!typeValidation.valid) {
        throw new Error(`Type validation errors: ${typeValidation.errors.join(', ')}`);
      }
    });

    it('should apply data transformation to stats', async () => {
      const rawResponse = {
        success: true,
        data: {
          userCount: 150,
          kindergartenCount: 5,
          studentCount: 1200
        }
      };

      const transformedResponse = {
        success: true,
        data: {
          userCount: 150,
          kindergartenCount: 5,
          studentCount: 1200,
          enrollmentRate: 85.5,
          attendanceRate: 92.3
        }
      };

      mockedRequest.mockResolvedValue(rawResponse);
      // The transform function will be called and modify the response
      const result = await getDashboardStats();

      expect(result).toBeDefined();
      expect(mockedRequest).toHaveBeenCalledWith('/dashboard/stats');
    });
  });

  describe('getDashboardOverview', () => {
    it('should get dashboard overview data', async () => {
      const mockResponse = {
        success: true,
        data: {
          totalUsers: 150,
          totalKindergartens: 5,
          totalStudents: 1200,
          totalApplications: 300,
          recentActivities: [
            {
              id: 1,
              type: 'enrollment',
              description: '新学生报名',
              time: '2024-09-01 10:30'
            }
          ]
        }
      };

      mockedRequest.mockResolvedValue(mockResponse);
      const result = await getDashboardOverview();

      // 验证API调用
      expect(mockedRequest).toHaveBeenCalledWith('/dashboard/overview');

      // 验证响应结构
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // 验证必填字段
      const validation = validateRequiredFields(result.data, ['totalUsers', 'totalKindergartens', 'totalStudents', 'totalApplications']);
      expect(validation.valid).toBe(true);

      // 验证字段类型
      const typeValidation = validateFieldTypes(result.data, {
        totalUsers: 'number',
        totalKindergartens: 'number',
        totalStudents: 'number',
        totalApplications: 'number'
      });
      expect(typeValidation.valid).toBe(true);

      // 验证数组字段
      expect(Array.isArray(result.data.recentActivities)).toBe(true);
    });
  });

  describe('getTodos', () => {
    it('should get todos with query parameters', async () => {
      const params = {
        status: 'pending',
        page: 1,
        pageSize: 10
      };
      const mockResponse = {
        success: true,
        data: {
          items: [
            {
              id: 1,
              title: '完成招生计划',
              content: '制定下学期招生计划',
              status: 'pending',
              priority: 1,
              dueDate: '2024-09-15',
              userId: 1
            }
          ],
          total: 1,
          page: 1,
          pageSize: 10,
          totalPages: 1
        }
      };

      mockedRequest.mockResolvedValue(mockResponse);
      const result = await getTodos(params);

      // 验证API调用
      expect(mockedRequest).toHaveBeenCalledWith('/dashboard/todos', params);

      // 验证列表响应结构
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.items).toBeDefined();
      expect(Array.isArray(result.data.items)).toBe(true);

      // 验证分页字段
      const paginationValidation = validateRequiredFields(result.data, ['items', 'total', 'page', 'pageSize']);
      expect(paginationValidation.valid).toBe(true);

      // 验证列表项字段
      if (result.data.items.length > 0) {
        const itemValidation = validateRequiredFields(result.data.items[0], ['id', 'title', 'status']);
        expect(itemValidation.valid).toBe(true);

        const itemTypeValidation = validateFieldTypes(result.data.items[0], {
          id: 'number',
          title: 'string',
          status: 'string',
          priority: 'number'
        });
        expect(itemTypeValidation.valid).toBe(true);
      }
    });

    it('should get todos without parameters', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 10,
          totalPages: 0
        }
      };

      mockedRequest.mockResolvedValue(mockResponse);
      const result = await getTodos();

      expect(mockedRequest).toHaveBeenCalledWith('/dashboard/todos', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should apply list transformation to todos', async () => {
      const rawResponse = {
        success: true,
        data: {
          items: [
            { id: 1, title: 'Todo 1', status: 'pending' }
          ],
          total: 1
        }
      };

      mockedRequest.mockResolvedValue(rawResponse);
      const result = await getTodos();

      expect(result).toBeDefined();
      expect(mockedRequest).toHaveBeenCalledWith('/dashboard/todos', undefined);
    });
  });

  describe('getSchedules', () => {
    it('should get schedules with date range', async () => {
      const params = {
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-09-30')
      };
      const mockResponse = {
        success: true,
        data: [
          {
            id: 1,
            title: '家长会',
            description: '学期初家长会',
            startTime: new Date('2024-09-15T14:00:00'),
            endTime: new Date('2024-09-15T16:00:00'),
            location: '多功能厅',
            userId: 1
          }
        ]
      };

      mockedRequest.mockResolvedValue(mockResponse);
      const result = await getSchedules(params);

      expect(mockedRequest).toHaveBeenCalledWith('/dashboard/schedules', params);
      expect(result).toEqual(mockResponse);
    });

    it('should get schedules without parameters', async () => {
      const mockResponse = {
        success: true,
        data: []
      };

      mockedRequest.mockResolvedValue(mockResponse);
      const result = await getSchedules();

      expect(mockedRequest).toHaveBeenCalledWith('/dashboard/schedules', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should apply schedule data transformation', async () => {
      const rawResponse = {
        success: true,
        data: [
          { id: 1, title: 'Schedule 1', startTime: '2024-09-01T10:00:00' }
        ]
      };

      mockedRequest.mockResolvedValue(rawResponse);
      const result = await getSchedules();

      expect(result).toBeDefined();
      expect(mockedRequest).toHaveBeenCalledWith('/dashboard/schedules', undefined);
    });
  });

  describe('getClassesOverview', () => {
    it('should get classes overview data', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: '1',
            name: '小班一班',
            capacity: 30,
            enrolled: 25,
            ageGroup: '3-4岁',
            teacherCount: 2
          },
          {
            id: '2',
            name: '中班一班',
            capacity: 35,
            enrolled: 32,
            ageGroup: '4-5岁',
            teacherCount: 2
          }
        ]
      };

      mockedRequest.mockResolvedValue(mockResponse);
      const result = await getClassesOverview();

      expect(mockedRequest).toHaveBeenCalledWith('/dashboard/classes');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getEnrollmentTrends', () => {
    it('should get enrollment trends with period parameter', async () => {
      const params = { period: '6months' };
      const mockResponse = {
        success: true,
        data: {
          trends: [
            { date: '2024-04', count: 45 },
            { date: '2024-05', count: 52 },
            { date: '2024-06', count: 48 },
            { date: '2024-07', count: 55 },
            { date: '2024-08', count: 62 },
            { date: '2024-09', count: 58 }
          ],
          distribution: {
            age3: 15,
            age4: 25,
            age5: 18,
            age6: 12
          }
        }
      };

      mockedRequest.mockResolvedValue(mockResponse);
      const result = await getEnrollmentTrends(params);

      expect(mockedRequest).toHaveBeenCalledWith('/dashboard/enrollment-trends', params);
      expect(result).toEqual(mockResponse);
    });

    it('should get enrollment trends without parameters', async () => {
      const mockResponse = {
        success: true,
        data: {
          trends: [],
          distribution: {
            age3: 0,
            age4: 0,
            age5: 0,
            age6: 0
          }
        }
      };

      mockedRequest.mockResolvedValue(mockResponse);
      const result = await getEnrollmentTrends();

      expect(mockedRequest).toHaveBeenCalledWith('/dashboard/enrollment-trends', undefined);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getActivityData', () => {
    it('should get activity data with period parameter', async () => {
      const params = { period: '3months' };
      const mockResponse = {
        success: true,
        data: [
          {
            activityName: '亲子活动',
            participantCount: 120,
            completionRate: 95.5
          },
          {
            activityName: '户外教学',
            participantCount: 85,
            completionRate: 88.2
          }
        ]
      };

      mockedRequest.mockResolvedValue(mockResponse);
      const result = await getActivityData(params);

      expect(mockedRequest).toHaveBeenCalledWith('/dashboard/activities', params);
      expect(result).toEqual(mockResponse);
    });

    it('should apply activity data transformation', async () => {
      const rawResponse = {
        success: true,
        data: [
          { activityName: 'Activity 1', participantCount: 50 }
        ]
      };

      mockedRequest.mockResolvedValue(rawResponse);
      const result = await getActivityData();

      expect(result).toBeDefined();
      expect(mockedRequest).toHaveBeenCalledWith('/dashboard/activities', undefined);
    });
  });

  describe('getChannelAnalysis', () => {
    it('should get channel analysis with period parameter', async () => {
      const params = { period: 'year' };
      const mockResponse = {
        success: true,
        data: [
          {
            channelName: '线上推广',
            count: 180,
            conversionRate: 12.5
          },
          {
            channelName: '线下活动',
            count: 95,
            conversionRate: 18.3
          },
          {
            channelName: '推荐',
            count: 120,
            conversionRate: 25.7
          }
        ]
      };

      mockedRequest.mockResolvedValue(mockResponse);
      const result = await getChannelAnalysis(params);

      expect(mockedRequest).toHaveBeenCalledWith('/dashboard/channel-analysis', params);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getConversionFunnel', () => {
    it('should get conversion funnel with period parameter', async () => {
      const params = { period: 'quarter' };
      const mockResponse = {
        success: true,
        data: [
          {
            stage: '访问',
            count: 1000,
            conversionRate: 100
          },
          {
            stage: '咨询',
            count: 450,
            conversionRate: 45
          },
          {
            stage: '报名',
            count: 180,
            conversionRate: 40
          },
          {
            stage: '缴费',
            count: 162,
            conversionRate: 90
          },
          {
            stage: '入园',
            count: 156,
            conversionRate: 96.3
          }
        ]
      };

      mockedRequest.mockResolvedValue(mockResponse);
      const result = await getConversionFunnel(params);

      expect(mockedRequest).toHaveBeenCalledWith('/dashboard/conversion-funnel', params);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getRecentActivities', () => {
    it('should get recent activities with limit parameter', async () => {
      const params = { limit: 10 };
      const mockResponse = {
        success: true,
        data: [
          {
            id: 1,
            type: 'enrollment',
            description: '新学生张三完成报名',
            time: '2024-09-14 09:30'
          },
          {
            id: 2,
            type: 'payment',
            description: '学生李四完成缴费',
            time: '2024-09-14 08:45'
          }
        ]
      };

      mockedRequest.mockResolvedValue(mockResponse);
      const result = await getRecentActivities(params);

      expect(mockedRequest).toHaveBeenCalledWith('/dashboard/activities', params);
      expect(result).toEqual(mockResponse);
    });

    it('should apply activity data transformation to recent activities', async () => {
      const rawResponse = {
        success: true,
        data: [
          { id: 1, type: 'activity', description: 'Recent activity' }
        ]
      };

      mockedRequest.mockResolvedValue(rawResponse);
      const result = await getRecentActivities();

      expect(result).toBeDefined();
      expect(mockedRequest).toHaveBeenCalledWith('/dashboard/activities', undefined);
    });
  });

  describe('Enum Testing', () => {
    it('should handle TodoStatus enum values correctly', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [
            { id: 1, status: 'pending' },
            { id: 2, status: 'completed' },
            { id: 3, status: 'cancelled' },
            { id: 4, status: 'in_progress' }
          ],
          total: 4
        }
      };

      mockedRequest.mockResolvedValue(mockResponse);
      const result = await getTodos();

      expect(result.data.items).toHaveLength(4);
      expect(result.data.items[0].status).toBe('pending');
      expect(result.data.items[1].status).toBe('completed');
      expect(result.data.items[2].status).toBe('cancelled');
      expect(result.data.items[3].status).toBe('in_progress');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const errorMessage = 'Network Error';
      mockedRequest.mockRejectedValue(new Error(errorMessage));

      await expect(getDashboardStats()).rejects.toThrow(errorMessage);
    });

    it('should handle empty responses', async () => {
      const mockResponse = {
        success: false,
        message: 'No data available'
      };

      mockedRequest.mockResolvedValue(mockResponse);
      const result = await getDashboardStats();

      expect(result.success).toBe(false);
      expect(result.message).toBe('No data available');
    });

    it('should handle malformed data responses', async () => {
      const mockResponse = {
        success: true,
        data: null
      };

      mockedRequest.mockResolvedValue(mockResponse);
      const result = await getDashboardStats();

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });
  });

  describe('Data Structure Validation', () => {
    it('should validate dashboard stats structure', async () => {
      const mockResponse = {
        success: true,
        data: {
          userCount: 150,
          kindergartenCount: 5,
          studentCount: 1200,
          enrollmentCount: 300,
          activityCount: 45,
          teacherCount: 80,
          classCount: 40,
          enrollmentRate: 85.5,
          attendanceRate: 92.3,
          graduationRate: 95.0
        }
      };

      mockedRequest.mockResolvedValue(mockResponse);
      const result = await getDashboardStats();

      expect(result.data).toHaveProperty('userCount');
      expect(result.data).toHaveProperty('kindergartenCount');
      expect(result.data).toHaveProperty('studentCount');
      expect(result.data).toHaveProperty('enrollmentCount');
      expect(result.data).toHaveProperty('activityCount');
      expect(result.data).toHaveProperty('teacherCount');
      expect(result.data).toHaveProperty('classCount');
      expect(typeof result.data.userCount).toBe('number');
      expect(typeof result.data.enrollmentRate).toBe('number');
    });

    it('should validate todo structure', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [
            {
              id: 1,
              title: 'Test Todo',
              content: 'Test content',
              status: 'pending',
              priority: 1,
              dueDate: '2024-09-15',
              userId: 1,
              createdAt: '2024-09-01',
              updatedAt: '2024-09-01'
            }
          ],
          total: 1,
          page: 1,
          pageSize: 10,
          totalPages: 1
        }
      };

      mockedRequest.mockResolvedValue(mockResponse);
      const result = await getTodos();

      expect(result.data.items[0]).toHaveProperty('id');
      expect(result.data.items[0]).toHaveProperty('title');
      expect(result.data.items[0]).toHaveProperty('status');
      expect(result.data.items[0]).toHaveProperty('priority');
      expect(result.data.items[0]).toHaveProperty('userId');
      expect(typeof result.data.items[0].id).toBe('number');
      expect(typeof result.data.items[0].priority).toBe('number');
    });

    it('should validate schedule structure', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: 1,
            title: 'Test Schedule',
            description: 'Test description',
            startTime: '2024-09-01T10:00:00',
            endTime: '2024-09-01T11:00:00',
            location: 'Test location',
            userId: 1,
            createdAt: '2024-09-01',
            updatedAt: '2024-09-01'
          }
        ]
      };

      mockedRequest.mockResolvedValue(mockResponse);
      const result = await getSchedules();

      expect(result.data[0]).toHaveProperty('id');
      expect(result.data[0]).toHaveProperty('title');
      expect(result.data[0]).toHaveProperty('startTime');
      expect(result.data[0]).toHaveProperty('endTime');
      expect(result.data[0]).toHaveProperty('userId');
    });
  });
});