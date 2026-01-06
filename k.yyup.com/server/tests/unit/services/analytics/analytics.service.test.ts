import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock models
const mockUserModel = {
  count: jest.fn(),
  findAll: jest.fn(),
  findAndCountAll: jest.fn()
};

const mockStudentModel = {
  count: jest.fn(),
  findAll: jest.fn()
};

const mockTeacherModel = {
  count: jest.fn(),
  findAll: jest.fn()
};

const mockClassModel = {
  count: jest.fn(),
  findAll: jest.fn()
};

const mockActivityModel = {
  count: jest.fn(),
  findAll: jest.fn()
};

const mockEnrollmentModel = {
  count: jest.fn(),
  findAll: jest.fn()
};

// Mock database connection
const mockSequelize = {
  query: jest.fn(),
  literal: jest.fn((sql) => ({ val: sql })),
  fn: jest.fn((fn, col) => ({ fn, col })),
  col: jest.fn((col) => ({ col }))
};

// Mock logger
const mockLogger = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// Mock cache
const mockCache = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  keys: jest.fn()
};

// Mock chart generation library
const mockChartJS = {
  Chart: {
    register: jest.fn()
  },
  CategoryScale: {},
  LinearScale: {},
  BarElement: {},
  Title: {},
  Tooltip: {},
  Legend: {}
};

// Mock PDF generation
const mockPDFKit = jest.fn(() => ({
  fontSize: jest.fn().mockReturnThis(),
  text: jest.fn().mockReturnThis(),
  moveDown: jest.fn().mockReturnThis(),
  addPage: jest.fn().mockReturnThis(),
  end: jest.fn(),
  pipe: jest.fn()
}));

// Mock imports
jest.unstable_mockModule('../../../../../../src/models/user.model', () => ({
  default: mockUserModel
}));

jest.unstable_mockModule('../../../../../../src/models/student.model', () => ({
  default: mockStudentModel
}));

jest.unstable_mockModule('../../../../../../src/models/teacher.model', () => ({
  default: mockTeacherModel
}));

jest.unstable_mockModule('../../../../../../src/models/class.model', () => ({
  default: mockClassModel
}));

jest.unstable_mockModule('../../../../../../src/models/activity.model', () => ({
  default: mockActivityModel
}));

jest.unstable_mockModule('../../../../../../src/models/enrollment.model', () => ({
  default: mockEnrollmentModel
}));

jest.unstable_mockModule('../../../../../../src/config/database', () => ({
  default: mockSequelize
}));

jest.unstable_mockModule('../../../../../../src/utils/logger', () => ({
  default: mockLogger
}));

jest.unstable_mockModule('../../../../../../src/utils/cache', () => ({
  default: mockCache
}));

jest.unstable_mockModule('chart.js', () => mockChartJS);

jest.unstable_mockModule('pdfkit', () => ({
  default: mockPDFKit
}));


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

describe('Analytics Service', () => {
  let analyticsService: any;

  beforeAll(async () => {
    const imported = await import('../../../../../../src/services/analytics/analytics.service');
    analyticsService = imported.default || imported.AnalyticsService || imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOverallStats', () => {
    it('应该获取总体统计数据', async () => {
      mockUserModel.count.mockResolvedValue(150);
      mockStudentModel.count.mockResolvedValue(500);
      mockTeacherModel.count.mockResolvedValue(50);
      mockClassModel.count.mockResolvedValue(25);
      mockActivityModel.count.mockResolvedValue(100);
      mockEnrollmentModel.count.mockResolvedValue(480);

      const result = await analyticsService.getOverallStats();

      expect(result).toEqual({
        totalUsers: 150,
        totalStudents: 500,
        totalTeachers: 50,
        totalClasses: 25,
        totalActivities: 100,
        totalEnrollments: 480,
        averageStudentsPerClass: 20,
        enrollmentRate: 0.96
      });
    });

    it('应该处理零除错误', async () => {
      mockUserModel.count.mockResolvedValue(0);
      mockStudentModel.count.mockResolvedValue(0);
      mockTeacherModel.count.mockResolvedValue(0);
      mockClassModel.count.mockResolvedValue(0);
      mockActivityModel.count.mockResolvedValue(0);
      mockEnrollmentModel.count.mockResolvedValue(0);

      const result = await analyticsService.getOverallStats();

      expect(result).toEqual({
        totalUsers: 0,
        totalStudents: 0,
        totalTeachers: 0,
        totalClasses: 0,
        totalActivities: 0,
        totalEnrollments: 0,
        averageStudentsPerClass: 0,
        enrollmentRate: 0
      });
    });

    it('应该处理数据库错误', async () => {
      const error = new Error('Database connection failed');
      mockUserModel.count.mockRejectedValue(error);

      await expect(analyticsService.getOverallStats()).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error getting overall stats'),
        expect.objectContaining({ error: error.message })
      );
    });
  });

  describe('getUserGrowthTrend', () => {
    it('应该获取用户增长趋势', async () => {
      const mockGrowthData = [
        { date: '2024-01-01', count: 10 },
        { date: '2024-01-02', count: 15 },
        { date: '2024-01-03', count: 12 },
        { date: '2024-01-04', count: 18 },
        { date: '2024-01-05', count: 20 }
      ];

      mockSequelize.query.mockResolvedValue([mockGrowthData]);

      const result = await analyticsService.getUserGrowthTrend({
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-05'),
        period: 'daily'
      });

      expect(mockSequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        expect.objectContaining({
          type: expect.any(String),
          replacements: expect.objectContaining({
            startDate: expect.any(Date),
            endDate: expect.any(Date)
          })
        })
      );
      expect(result).toEqual({
        data: mockGrowthData,
        totalGrowth: 75,
        averageGrowth: 15,
        growthRate: 1.0
      });
    });

    it('应该支持不同时间周期', async () => {
      const mockWeeklyData = [
        { date: '2024-01-01', count: 50 },
        { date: '2024-01-08', count: 65 },
        { date: '2024-01-15', count: 70 }
      ];

      mockSequelize.query.mockResolvedValue([mockWeeklyData]);

      const result = await analyticsService.getUserGrowthTrend({
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-21'),
        period: 'weekly'
      });

      expect(result.data).toEqual(mockWeeklyData);
    });

    it('应该验证日期参数', async () => {
      await expect(analyticsService.getUserGrowthTrend({
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-01'),
        period: 'daily'
      })).rejects.toThrow('Start date must be before end date');
    });
  });

  describe('getEnrollmentAnalytics', () => {
    it('应该获取报名分析数据', async () => {
      const mockEnrollmentData = [
        { status: 'pending', count: 25 },
        { status: 'approved', count: 180 },
        { status: 'rejected', count: 15 },
        { status: 'withdrawn', count: 5 }
      ];

      const mockMonthlyData = [
        { month: '2024-01', count: 45 },
        { month: '2024-02', count: 52 },
        { month: '2024-03', count: 38 }
      ];

      mockSequelize.query
        .mockResolvedValueOnce([mockEnrollmentData])
        .mockResolvedValueOnce([mockMonthlyData]);

      const result = await analyticsService.getEnrollmentAnalytics({
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31')
      });

      expect(result).toEqual({
        byStatus: {
          pending: 25,
          approved: 180,
          rejected: 15,
          withdrawn: 5
        },
        monthlyTrend: mockMonthlyData,
        totalEnrollments: 225,
        approvalRate: 0.8,
        rejectionRate: 0.067
      });
    });

    it('应该处理无数据的情况', async () => {
      mockSequelize.query
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([[]]);

      const result = await analyticsService.getEnrollmentAnalytics({
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      });

      expect(result).toEqual({
        byStatus: {},
        monthlyTrend: [],
        totalEnrollments: 0,
        approvalRate: 0,
        rejectionRate: 0
      });
    });
  });

  describe('getActivityAnalytics', () => {
    it('应该获取活动分析数据', async () => {
      const mockActivityData = [
        { type: 'outdoor', count: 15 },
        { type: 'educational', count: 25 },
        { type: 'art', count: 20 },
        { type: 'sports', count: 10 }
      ];

      const mockParticipationData = [
        { activityId: 1, participantCount: 20 },
        { activityId: 2, participantCount: 25 },
        { activityId: 3, participantCount: 18 }
      ];

      mockSequelize.query
        .mockResolvedValueOnce([mockActivityData])
        .mockResolvedValueOnce([mockParticipationData]);

      const result = await analyticsService.getActivityAnalytics({
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31')
      });

      expect(result).toEqual({
        byType: {
          outdoor: 15,
          educational: 25,
          art: 20,
          sports: 10
        },
        totalActivities: 70,
        averageParticipation: 21,
        participationTrend: mockParticipationData,
        mostPopularType: 'educational'
      });
    });

    it('应该计算参与率统计', async () => {
      const mockActivityData = [
        { type: 'outdoor', count: 10 }
      ];

      const mockParticipationData = [
        { activityId: 1, participantCount: 15 },
        { activityId: 2, participantCount: 25 },
        { activityId: 3, participantCount: 20 }
      ];

      mockSequelize.query
        .mockResolvedValueOnce([mockActivityData])
        .mockResolvedValueOnce([mockParticipationData]);

      const result = await analyticsService.getActivityAnalytics({
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      });

      expect(result.averageParticipation).toBe(20);
    });
  });

  describe('getClassAnalytics', () => {
    it('应该获取班级分析数据', async () => {
      const mockClassData = [
        {
          id: 1,
          name: '小班A',
          capacity: 25,
          currentEnrollment: 22,
          ageGroup: '3-4'
        },
        {
          id: 2,
          name: '中班B',
          capacity: 30,
          currentEnrollment: 28,
          ageGroup: '4-5'
        }
      ];

      mockClassModel.findAll.mockResolvedValue(mockClassData);

      const result = await analyticsService.getClassAnalytics();

      expect(result).toEqual({
        totalClasses: 2,
        totalCapacity: 55,
        totalEnrolled: 50,
        overallOccupancyRate: 0.909,
        byAgeGroup: {
          '3-4': { classes: 1, capacity: 25, enrolled: 22 },
          '4-5': { classes: 1, capacity: 30, enrolled: 28 }
        },
        classDetails: mockClassData.map(cls => ({
          ...cls,
          occupancyRate: cls.currentEnrollment / cls.capacity,
          availableSpots: cls.capacity - cls.currentEnrollment
        }))
      });
    });

    it('应该识别满员和空余班级', async () => {
      const mockClassData = [
        {
          id: 1,
          name: '小班A',
          capacity: 25,
          currentEnrollment: 25,
          ageGroup: '3-4'
        },
        {
          id: 2,
          name: '中班B',
          capacity: 30,
          currentEnrollment: 15,
          ageGroup: '4-5'
        }
      ];

      mockClassModel.findAll.mockResolvedValue(mockClassData);

      const result = await analyticsService.getClassAnalytics();

      const fullClasses = result.classDetails.filter((cls: any) => cls.occupancyRate === 1);
      const underutilizedClasses = result.classDetails.filter((cls: any) => cls.occupancyRate < 0.7);

      expect(fullClasses).toHaveLength(1);
      expect(underutilizedClasses).toHaveLength(1);
    });
  });

  describe('getTeacherAnalytics', () => {
    it('应该获取教师分析数据', async () => {
      const mockTeacherData = [
        {
          id: 1,
          name: '王老师',
          subject: '语言',
          classCount: 2,
          studentCount: 45
        },
        {
          id: 2,
          name: '李老师',
          subject: '数学',
          classCount: 1,
          studentCount: 25
        }
      ];

      mockSequelize.query.mockResolvedValue([mockTeacherData]);

      const result = await analyticsService.getTeacherAnalytics();

      expect(result).toEqual({
        totalTeachers: 2,
        averageClassesPerTeacher: 1.5,
        averageStudentsPerTeacher: 35,
        bySubject: {
          '语言': 1,
          '数学': 1
        },
        teacherWorkload: mockTeacherData.map(teacher => ({
          ...teacher,
          workloadScore: teacher.classCount * 10 + teacher.studentCount * 0.5
        }))
      });
    });

    it('应该识别工作负荷过重的教师', async () => {
      const mockTeacherData = [
        {
          id: 1,
          name: '王老师',
          subject: '语言',
          classCount: 4,
          studentCount: 80
        }
      ];

      mockSequelize.query.mockResolvedValue([mockTeacherData]);

      const result = await analyticsService.getTeacherAnalytics();

      const overloadedTeachers = result.teacherWorkload.filter((teacher: any) => teacher.workloadScore > 60);
      expect(overloadedTeachers).toHaveLength(1);
    });
  });

  describe('generateDashboardData', () => {
    it('应该生成仪表板数据', async () => {
      // Mock all required data
      mockUserModel.count.mockResolvedValue(100);
      mockStudentModel.count.mockResolvedValue(300);
      mockTeacherModel.count.mockResolvedValue(30);
      mockClassModel.count.mockResolvedValue(15);

      mockSequelize.query
        .mockResolvedValueOnce([[{ date: '2024-01-01', count: 10 }]])
        .mockResolvedValueOnce([[{ status: 'approved', count: 250 }]])
        .mockResolvedValueOnce([[{ type: 'educational', count: 20 }]]);

      const result = await analyticsService.generateDashboardData();

      expect(result).toEqual({
        overview: {
          totalUsers: 100,
          totalStudents: 300,
          totalTeachers: 30,
          totalClasses: 15
        },
        userGrowth: expect.any(Array),
        enrollmentStats: expect.any(Object),
        activityStats: expect.any(Object),
        generatedAt: expect.any(Date)
      });
    });

    it('应该使用缓存数据', async () => {
      const cachedData = {
        overview: { totalUsers: 100 },
        generatedAt: new Date(),
        cached: true
      };

      mockCache.get.mockResolvedValue(cachedData);

      const result = await analyticsService.generateDashboardData();

      expect(mockCache.get).toHaveBeenCalledWith('analytics:dashboard');
      expect(result).toEqual(cachedData);
      expect(mockUserModel.count).not.toHaveBeenCalled();
    });

    it('应该在缓存未命中时生成新数据', async () => {
      mockCache.get.mockResolvedValue(null);
      mockUserModel.count.mockResolvedValue(100);
      mockStudentModel.count.mockResolvedValue(300);
      mockTeacherModel.count.mockResolvedValue(30);
      mockClassModel.count.mockResolvedValue(15);

      mockSequelize.query
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([[]]);

      const result = await analyticsService.generateDashboardData();

      expect(mockCache.set).toHaveBeenCalledWith(
        'analytics:dashboard',
        result,
        300 // 5 minutes
      );
    });
  });

  describe('exportAnalyticsReport', () => {
    it('应该导出CSV格式报告', async () => {
      const reportData = {
        overview: { totalUsers: 100, totalStudents: 300 },
        userGrowth: [{ date: '2024-01-01', count: 10 }],
        enrollmentStats: { approved: 250, pending: 25 }
      };

      const result = await analyticsService.exportAnalyticsReport(reportData, 'csv');

      expect(result).toContain('Metric,Value');
      expect(result).toContain('Total Users,100');
      expect(result).toContain('Total Students,300');
    });

    it('应该导出JSON格式报告', async () => {
      const reportData = {
        overview: { totalUsers: 100 },
        generatedAt: new Date('2024-01-15T12:00:00Z')
      };

      const result = await analyticsService.exportAnalyticsReport(reportData, 'json');

      const parsedResult = JSON.parse(result);
      expect(parsedResult).toEqual({
        ...reportData,
        exportedAt: expect.any(String)
      });
    });

    it('应该生成PDF格式报告', async () => {
      const reportData = {
        overview: { totalUsers: 100, totalStudents: 300 },
        userGrowth: [{ date: '2024-01-01', count: 10 }]
      };

      const mockPDFInstance = {
        fontSize: jest.fn().mockReturnThis(),
        text: jest.fn().mockReturnThis(),
        moveDown: jest.fn().mockReturnThis(),
        addPage: jest.fn().mockReturnThis(),
        end: jest.fn(),
        pipe: jest.fn()
      };

      mockPDFKit.mockReturnValue(mockPDFInstance);

      const result = await analyticsService.exportAnalyticsReport(reportData, 'pdf');

      expect(mockPDFKit).toHaveBeenCalled();
      expect(mockPDFInstance.text).toHaveBeenCalledWith(
        expect.stringContaining('Analytics Report')
      );
      expect(result).toBeInstanceOf(Buffer);
    });

    it('应该验证导出格式', async () => {
      const reportData = { overview: {} };

      await expect(analyticsService.exportAnalyticsReport(reportData, 'invalid')).rejects.toThrow(
        'Unsupported export format'
      );
    });
  });

  describe('getCustomAnalytics', () => {
    it('应该执行自定义分析查询', async () => {
      const customQuery = {
        metrics: ['count', 'avg'],
        dimensions: ['date', 'type'],
        filters: { status: 'active' },
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-31')
        }
      };

      const mockQueryResult = [
        { date: '2024-01-01', type: 'A', count: 10, avg: 5.5 },
        { date: '2024-01-02', type: 'B', count: 15, avg: 7.2 }
      ];

      mockSequelize.query.mockResolvedValue([mockQueryResult]);

      const result = await analyticsService.getCustomAnalytics(customQuery);

      expect(mockSequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        expect.objectContaining({
          type: expect.any(String),
          replacements: expect.objectContaining({
            startDate: customQuery.dateRange.start,
            endDate: customQuery.dateRange.end
          })
        })
      );
      expect(result).toEqual({
        data: mockQueryResult,
        query: customQuery,
        executedAt: expect.any(Date)
      });
    });

    it('应该验证自定义查询参数', async () => {
      const invalidQuery = {
        metrics: [],
        dimensions: []
      };

      await expect(analyticsService.getCustomAnalytics(invalidQuery)).rejects.toThrow(
        'Metrics and dimensions are required'
      );
    });

    it('应该防止SQL注入', async () => {
      const maliciousQuery = {
        metrics: ['count; DROP TABLE users; --'],
        dimensions: ['date'],
        filters: {}
      };

      await expect(analyticsService.getCustomAnalytics(maliciousQuery)).rejects.toThrow(
        'Invalid metric or dimension'
      );
    });
  });

  describe('scheduleAnalyticsReport', () => {
    it('应该安排定时分析报告', async () => {
      const schedule = {
        frequency: 'daily',
        time: '09:00',
        recipients: ['admin@test.com'],
        format: 'pdf'
      };

      const result = await analyticsService.scheduleAnalyticsReport(schedule);

      expect(result).toEqual({
        scheduleId: expect.any(String),
        frequency: 'daily',
        time: '09:00',
        recipients: ['admin@test.com'],
        format: 'pdf',
        nextRun: expect.any(Date),
        status: 'active'
      });
    });

    it('应该验证定时报告参数', async () => {
      const invalidSchedule = {
        frequency: 'invalid',
        recipients: []
      };

      await expect(analyticsService.scheduleAnalyticsReport(invalidSchedule)).rejects.toThrow(
        'Invalid frequency or empty recipients'
      );
    });
  });

  describe('性能优化', () => {
    it('应该使用数据库索引优化查询', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      await analyticsService.getUserGrowthTrend({
        startDate,
        endDate,
        period: 'daily'
      });

      expect(mockSequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE created_at BETWEEN'),
        expect.objectContaining({
          type: expect.any(String)
        })
      );
    });

    it('应该批量处理大数据集', async () => {
      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        createdAt: new Date()
      }));

      mockUserModel.findAll.mockResolvedValue(largeDataset);

      const result = await analyticsService.getOverallStats();

      expect(result.totalUsers).toBe(10000);
    });
  });

  describe('错误处理', () => {
    it('应该处理数据库连接超时', async () => {
      const timeoutError = new Error('Connection timeout');
      mockSequelize.query.mockRejectedValue(timeoutError);

      await expect(analyticsService.getUserGrowthTrend({
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        period: 'daily'
      })).rejects.toThrow(timeoutError);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error getting user growth trend'),
        expect.objectContaining({ error: timeoutError.message })
      );
    });

    it('应该处理内存不足错误', async () => {
      const memoryError = new Error('JavaScript heap out of memory');
      mockUserModel.findAll.mockRejectedValue(memoryError);

      await expect(analyticsService.getOverallStats()).rejects.toThrow(memoryError);
    });
  });
});
