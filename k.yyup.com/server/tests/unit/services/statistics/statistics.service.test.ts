import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock models
const mockUser = {
  count: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn()
};

const mockStudent = {
  count: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn()
};

const mockTeacher = {
  count: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn()
};

const mockClass = {
  count: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn()
};

const mockActivity = {
  count: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn()
};

const mockEnrollmentApplication = {
  count: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn()
};

const mockSequelize = {
  query: jest.fn(),
  literal: jest.fn(),
  fn: jest.fn(),
  col: jest.fn(),
  where: jest.fn(),
  Op: {
    between: Symbol('between'),
    gte: Symbol('gte'),
    lte: Symbol('lte'),
    like: Symbol('like'),
    in: Symbol('in'),
    and: Symbol('and'),
    or: Symbol('or')
  }
};

// Mock external services
const mockCacheService = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  exists: jest.fn()
};

const mockAnalyticsService = {
  trackEvent: jest.fn(),
  getEventStats: jest.fn(),
  generateReport: jest.fn()
};

// Mock imports
jest.unstable_mockModule('../../../../../src/models/user.model', () => ({
  User: mockUser
}));

jest.unstable_mockModule('../../../../../src/models/student.model', () => ({
  Student: mockStudent
}));

jest.unstable_mockModule('../../../../../src/models/teacher.model', () => ({
  Teacher: mockTeacher
}));

jest.unstable_mockModule('../../../../../src/models/class.model', () => ({
  Class: mockClass
}));

jest.unstable_mockModule('../../../../../src/models/activity.model', () => ({
  Activity: mockActivity
}));

jest.unstable_mockModule('../../../../../src/models/enrollment-application.model', () => ({
  EnrollmentApplication: mockEnrollmentApplication
}));

jest.unstable_mockModule('../../../../../src/config/database', () => ({
  sequelize: mockSequelize
}));

jest.unstable_mockModule('../../../../../src/services/cache.service', () => mockCacheService);
jest.unstable_mockModule('../../../../../src/services/analytics.service', () => mockAnalyticsService);


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

describe('Statistics Service', () => {
  let statisticsService: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/services/statistics/statistics.service');
    statisticsService = imported.StatisticsService;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOverviewStats', () => {
    it('应该获取概览统计数据', async () => {
      const mockStats = {
        totalUsers: 150,
        totalStudents: 120,
        totalTeachers: 25,
        totalClasses: 8,
        totalActivities: 45,
        activeEnrollments: 15,
        completedActivities: 38,
        averageClassSize: 15
      };

      mockUser.count.mockResolvedValue(150);
      mockStudent.count.mockResolvedValue(120);
      mockTeacher.count.mockResolvedValue(25);
      mockClass.count.mockResolvedValue(8);
      mockActivity.count.mockResolvedValue(45);
      mockEnrollmentApplication.count.mockResolvedValue(15);
      mockActivity.count.mockResolvedValueOnce(38); // For completed activities

      mockCacheService.get.mockResolvedValue(null);
      mockCacheService.set.mockResolvedValue(undefined);

      const result = await statisticsService.getOverviewStats();

      expect(mockUser.count).toHaveBeenCalled();
      expect(mockStudent.count).toHaveBeenCalled();
      expect(mockTeacher.count).toHaveBeenCalled();
      expect(mockClass.count).toHaveBeenCalled();
      expect(mockActivity.count).toHaveBeenCalled();
      expect(mockEnrollmentApplication.count).toHaveBeenCalled();

      expect(result).toEqual(expect.objectContaining({
        totalUsers: 150,
        totalStudents: 120,
        totalTeachers: 25,
        totalClasses: 8,
        totalActivities: 45
      }));
    });

    it('应该使用缓存数据', async () => {
      const cachedStats = {
        totalUsers: 150,
        totalStudents: 120,
        totalTeachers: 25,
        cachedAt: new Date()
      };

      mockCacheService.get.mockResolvedValue(cachedStats);

      const result = await statisticsService.getOverviewStats();

      expect(mockCacheService.get).toHaveBeenCalledWith('stats:overview');
      expect(result).toEqual(cachedStats);
      expect(mockUser.count).not.toHaveBeenCalled();
    });
  });

  describe('getUserStats', () => {
    it('应该获取用户统计数据', async () => {
      const dateRange = {
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      };

      const mockUserStats = [
        { role: 'admin' as any, count: 5 },
        { role: 'teacher', count: 25 },
        { role: 'parent', count: 120 }
      ];

      const mockRegistrationTrend = [
        { date: '2024-01', count: 10 },
        { date: '2024-02', count: 15 },
        { date: '2024-03', count: 12 }
      ];

      mockSequelize.query.mockResolvedValueOnce([mockUserStats]);
      mockSequelize.query.mockResolvedValueOnce([mockRegistrationTrend]);

      const result = await statisticsService.getUserStats(dateRange);

      expect(mockSequelize.query).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        byRole: mockUserStats,
        registrationTrend: mockRegistrationTrend,
        totalUsers: 150,
        activeUsers: expect.any(Number),
        newUsersThisMonth: expect.any(Number)
      });
    });

    it('应该处理空日期范围', async () => {
      mockSequelize.query.mockResolvedValue([[]]);

      const result = await statisticsService.getUserStats();

      expect(mockSequelize.query).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('getStudentStats', () => {
    it('应该获取学生统计数据', async () => {
      const mockStudentStats = {
        totalStudents: 120,
        byAge: [
          { age: 3, count: 30 },
          { age: 4, count: 35 },
          { age: 5, count: 32 },
          { age: 6, count: 23 }
        ],
        byClass: [
          { className: '小班A', count: 15 },
          { className: '小班B', count: 15 },
          { className: '中班A', count: 18 },
          { className: '中班B', count: 17 }
        ],
        byGender: [
          { gender: 'male', count: 62 },
          { gender: 'female', count: 58 }
        ],
        enrollmentTrend: [
          { month: '2024-01', count: 8 },
          { month: '2024-02', count: 12 },
          { month: '2024-03', count: 10 }
        ]
      };

      mockStudent.count.mockResolvedValue(120);
      mockSequelize.query.mockResolvedValueOnce([mockStudentStats.byAge]);
      mockSequelize.query.mockResolvedValueOnce([mockStudentStats.byClass]);
      mockSequelize.query.mockResolvedValueOnce([mockStudentStats.byGender]);
      mockSequelize.query.mockResolvedValueOnce([mockStudentStats.enrollmentTrend]);

      const result = await statisticsService.getStudentStats();

      expect(mockStudent.count).toHaveBeenCalled();
      expect(mockSequelize.query).toHaveBeenCalledTimes(4);
      expect(result).toEqual(expect.objectContaining({
        totalStudents: 120,
        byAge: mockStudentStats.byAge,
        byClass: mockStudentStats.byClass,
        byGender: mockStudentStats.byGender,
        enrollmentTrend: mockStudentStats.enrollmentTrend
      }));
    });
  });

  describe('getTeacherStats', () => {
    it('应该获取教师统计数据', async () => {
      const mockTeacherStats = {
        totalTeachers: 25,
        bySubject: [
          { subject: '语言', count: 8 },
          { subject: '数学', count: 6 },
          { subject: '艺术', count: 5 },
          { subject: '体育', count: 6 }
        ],
        byExperience: [
          { experienceRange: '0-2年', count: 5 },
          { experienceRange: '3-5年', count: 8 },
          { experienceRange: '6-10年', count: 7 },
          { experienceRange: '10年以上', count: 5 }
        ],
        byEducation: [
          { education: '本科', count: 15 },
          { education: '硕士', count: 8 },
          { education: '博士', count: 2 }
        ],
        performanceStats: {
          averageRating: 4.3,
          topPerformers: [
            { id: 1, name: '张老师', rating: 4.8 },
            { id: 2, name: '李老师', rating: 4.7 }
          ]
        }
      };

      mockTeacher.count.mockResolvedValue(25);
      mockSequelize.query.mockResolvedValueOnce([mockTeacherStats.bySubject]);
      mockSequelize.query.mockResolvedValueOnce([mockTeacherStats.byExperience]);
      mockSequelize.query.mockResolvedValueOnce([mockTeacherStats.byEducation]);
      mockSequelize.query.mockResolvedValueOnce([{ averageRating: 4.3 }]);
      mockTeacher.findAll.mockResolvedValue(mockTeacherStats.performanceStats.topPerformers);

      const result = await statisticsService.getTeacherStats();

      expect(mockTeacher.count).toHaveBeenCalled();
      expect(mockSequelize.query).toHaveBeenCalledTimes(4);
      expect(mockTeacher.findAll).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({
        totalTeachers: 25,
        bySubject: mockTeacherStats.bySubject,
        byExperience: mockTeacherStats.byExperience,
        byEducation: mockTeacherStats.byEducation,
        performanceStats: expect.objectContaining({
          averageRating: 4.3
        })
      }));
    });
  });

  describe('getActivityStats', () => {
    it('应该获取活动统计数据', async () => {
      const dateRange = {
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      };

      const mockActivityStats = {
        totalActivities: 45,
        completedActivities: 38,
        upcomingActivities: 7,
        byType: [
          { type: 'outdoor', count: 15 },
          { type: 'indoor', count: 12 },
          { type: 'educational', count: 10 },
          { type: 'cultural', count: 8 }
        ],
        byStatus: [
          { status: 'completed', count: 38 },
          { status: 'upcoming', count: 7 }
        ],
        participationStats: {
          totalParticipants: 2500,
          averageParticipants: 55.6,
          participationRate: 0.85
        },
        monthlyTrend: [
          { month: '2024-01', count: 4, participants: 180 },
          { month: '2024-02', count: 3, participants: 165 },
          { month: '2024-03', count: 5, participants: 275 }
        ]
      };

      mockActivity.count.mockResolvedValueOnce(45);
      mockActivity.count.mockResolvedValueOnce(38);
      mockActivity.count.mockResolvedValueOnce(7);
      mockSequelize.query.mockResolvedValueOnce([mockActivityStats.byType]);
      mockSequelize.query.mockResolvedValueOnce([mockActivityStats.byStatus]);
      mockSequelize.query.mockResolvedValueOnce([{ totalParticipants: 2500, averageParticipants: 55.6 }]);
      mockSequelize.query.mockResolvedValueOnce([mockActivityStats.monthlyTrend]);

      const result = await statisticsService.getActivityStats(dateRange);

      expect(mockActivity.count).toHaveBeenCalledTimes(3);
      expect(mockSequelize.query).toHaveBeenCalledTimes(4);
      expect(result).toEqual(expect.objectContaining({
        totalActivities: 45,
        completedActivities: 38,
        upcomingActivities: 7,
        byType: mockActivityStats.byType,
        byStatus: mockActivityStats.byStatus,
        participationStats: expect.objectContaining({
          totalParticipants: 2500,
          averageParticipants: 55.6
        }),
        monthlyTrend: mockActivityStats.monthlyTrend
      }));
    });
  });

  describe('getEnrollmentStats', () => {
    it('应该获取招生统计数据', async () => {
      const mockEnrollmentStats = {
        totalApplications: 180,
        pendingApplications: 25,
        approvedApplications: 120,
        rejectedApplications: 35,
        byStatus: [
          { status: 'pending', count: 25 },
          { status: 'approved', count: 120 },
          { status: 'rejected', count: 35 }
        ],
        bySource: [
          { source: 'website', count: 80 },
          { source: 'referral', count: 60 },
          { source: 'social_media', count: 40 }
        ],
        conversionRate: 0.67,
        monthlyTrend: [
          { month: '2024-01', applications: 20, approved: 15 },
          { month: '2024-02', applications: 25, approved: 18 },
          { month: '2024-03', applications: 22, approved: 16 }
        ],
        averageProcessingTime: 5.2
      };

      mockEnrollmentApplication.count.mockResolvedValueOnce(180);
      mockEnrollmentApplication.count.mockResolvedValueOnce(25);
      mockEnrollmentApplication.count.mockResolvedValueOnce(120);
      mockEnrollmentApplication.count.mockResolvedValueOnce(35);
      mockSequelize.query.mockResolvedValueOnce([mockEnrollmentStats.byStatus]);
      mockSequelize.query.mockResolvedValueOnce([mockEnrollmentStats.bySource]);
      mockSequelize.query.mockResolvedValueOnce([mockEnrollmentStats.monthlyTrend]);
      mockSequelize.query.mockResolvedValueOnce([{ averageProcessingTime: 5.2 }]);

      const result = await statisticsService.getEnrollmentStats();

      expect(mockEnrollmentApplication.count).toHaveBeenCalledTimes(4);
      expect(mockSequelize.query).toHaveBeenCalledTimes(4);
      expect(result).toEqual(expect.objectContaining({
        totalApplications: 180,
        pendingApplications: 25,
        approvedApplications: 120,
        rejectedApplications: 35,
        byStatus: mockEnrollmentStats.byStatus,
        bySource: mockEnrollmentStats.bySource,
        conversionRate: expect.any(Number),
        monthlyTrend: mockEnrollmentStats.monthlyTrend,
        averageProcessingTime: 5.2
      }));
    });
  });

  describe('getFinancialStats', () => {
    it('应该获取财务统计数据', async () => {
      const dateRange = {
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      };

      const mockFinancialStats = {
        totalRevenue: 1200000,
        totalExpenses: 800000,
        netProfit: 400000,
        profitMargin: 0.33,
        revenueBySource: [
          { source: 'tuition', amount: 1000000 },
          { source: 'activities', amount: 150000 },
          { source: 'other', amount: 50000 }
        ],
        expensesByCategory: [
          { category: 'salaries', amount: 500000 },
          { category: 'utilities', amount: 100000 },
          { category: 'supplies', amount: 150000 },
          { category: 'other', amount: 50000 }
        ],
        monthlyTrend: [
          { month: '2024-01', revenue: 100000, expenses: 65000 },
          { month: '2024-02', revenue: 105000, expenses: 68000 },
          { month: '2024-03', revenue: 98000, expenses: 62000 }
        ]
      };

      mockSequelize.query.mockResolvedValueOnce([{ totalRevenue: 1200000 }]);
      mockSequelize.query.mockResolvedValueOnce([{ totalExpenses: 800000 }]);
      mockSequelize.query.mockResolvedValueOnce([mockFinancialStats.revenueBySource]);
      mockSequelize.query.mockResolvedValueOnce([mockFinancialStats.expensesByCategory]);
      mockSequelize.query.mockResolvedValueOnce([mockFinancialStats.monthlyTrend]);

      const result = await statisticsService.getFinancialStats(dateRange);

      expect(mockSequelize.query).toHaveBeenCalledTimes(5);
      expect(result).toEqual(expect.objectContaining({
        totalRevenue: 1200000,
        totalExpenses: 800000,
        netProfit: 400000,
        profitMargin: expect.any(Number),
        revenueBySource: mockFinancialStats.revenueBySource,
        expensesByCategory: mockFinancialStats.expensesByCategory,
        monthlyTrend: mockFinancialStats.monthlyTrend
      }));
    });
  });

  describe('getPerformanceMetrics', () => {
    it('应该获取性能指标', async () => {
      const mockMetrics = {
        systemPerformance: {
          averageResponseTime: 120,
          uptime: 0.999,
          errorRate: 0.001,
          throughput: 1000
        },
        userEngagement: {
          dailyActiveUsers: 85,
          weeklyActiveUsers: 140,
          monthlyActiveUsers: 150,
          averageSessionDuration: 1800
        },
        contentMetrics: {
          totalContent: 500,
          contentViews: 15000,
          averageViewsPerContent: 30,
          topContent: [
            { id: 1, title: '数学教学计划', views: 250 },
            { id: 2, title: '艺术活动方案', views: 200 }
          ]
        }
      };

      mockSequelize.query.mockResolvedValueOnce([mockMetrics.systemPerformance]);
      mockSequelize.query.mockResolvedValueOnce([mockMetrics.userEngagement]);
      mockSequelize.query.mockResolvedValueOnce([mockMetrics.contentMetrics]);

      const result = await statisticsService.getPerformanceMetrics();

      expect(mockSequelize.query).toHaveBeenCalledTimes(3);
      expect(result).toEqual(expect.objectContaining({
        systemPerformance: expect.objectContaining({
          averageResponseTime: expect.any(Number),
          uptime: expect.any(Number)
        }),
        userEngagement: expect.objectContaining({
          dailyActiveUsers: expect.any(Number),
          weeklyActiveUsers: expect.any(Number)
        }),
        contentMetrics: expect.objectContaining({
          totalContent: expect.any(Number),
          contentViews: expect.any(Number)
        })
      }));
    });
  });

  describe('generateCustomReport', () => {
    it('应该生成自定义报告', async () => {
      const reportConfig = {
        metrics: ['users', 'students', 'activities'],
        dateRange: {
          startDate: '2024-01-01',
          endDate: '2024-03-31'
        },
        groupBy: 'month',
        filters: {
          userRole: 'teacher',
          activityType: 'educational'
        }
      };

      const mockReportData = {
        reportId: 'report_123',
        config: reportConfig,
        data: {
          users: [
            { month: '2024-01', count: 10 },
            { month: '2024-02', count: 12 },
            { month: '2024-03', count: 8 }
          ],
          students: [
            { month: '2024-01', count: 15 },
            { month: '2024-02', count: 18 },
            { month: '2024-03', count: 12 }
          ],
          activities: [
            { month: '2024-01', count: 3 },
            { month: '2024-02', count: 4 },
            { month: '2024-03', count: 2 }
          ]
        },
        summary: {
          totalUsers: 30,
          totalStudents: 45,
          totalActivities: 9
        },
        generatedAt: new Date()
      };

      mockSequelize.query.mockResolvedValueOnce([mockReportData.data.users]);
      mockSequelize.query.mockResolvedValueOnce([mockReportData.data.students]);
      mockSequelize.query.mockResolvedValueOnce([mockReportData.data.activities]);

      const result = await statisticsService.generateCustomReport(reportConfig);

      expect(mockSequelize.query).toHaveBeenCalledTimes(3);
      expect(result).toEqual(expect.objectContaining({
        config: reportConfig,
        data: expect.objectContaining({
          users: expect.any(Array),
          students: expect.any(Array),
          activities: expect.any(Array)
        }),
        summary: expect.objectContaining({
          totalUsers: expect.any(Number),
          totalStudents: expect.any(Number),
          totalActivities: expect.any(Number)
        }),
        generatedAt: expect.any(Date)
      }));
    });

    it('应该处理无效的报告配置', async () => {
      const invalidConfig = {
        metrics: [], // 空指标数组
        dateRange: {}
      };

      await expect(statisticsService.generateCustomReport(invalidConfig))
        .rejects.toThrow('报告配置无效');
    });
  });

  describe('exportStatistics', () => {
    it('应该导出统计数据', async () => {
      const exportConfig = {
        type: 'overview',
        format: 'excel',
        dateRange: {
          startDate: '2024-01-01',
          endDate: '2024-03-31'
        }
      };

      const mockExportResult = {
        filename: 'statistics_overview_20240101_20240331.xlsx',
        downloadUrl: '/downloads/statistics_overview_20240101_20240331.xlsx',
        size: 2048000,
        generatedAt: new Date()
      };

      // Mock the statistics data
      mockUser.count.mockResolvedValue(150);
      mockStudent.count.mockResolvedValue(120);
      mockTeacher.count.mockResolvedValue(25);

      const result = await statisticsService.exportStatistics(exportConfig);

      expect(result).toEqual(expect.objectContaining({
        filename: expect.stringContaining('statistics_overview'),
        downloadUrl: expect.stringContaining('/downloads/'),
        size: expect.any(Number),
        generatedAt: expect.any(Date)
      }));
    });

    it('应该支持多种导出格式', async () => {
      const formats = ['excel', 'csv', 'pdf', 'json'];

      for (const format of formats) {
        const exportConfig = {
          type: 'overview',
          format,
          dateRange: {
            startDate: '2024-01-01',
            endDate: '2024-03-31'
          }
        };

        mockUser.count.mockResolvedValue(150);

        const result = await statisticsService.exportStatistics(exportConfig);

        expect(result.filename).toContain(format === 'excel' ? 'xlsx' : format);
      }
    });
  });

  describe('错误处理', () => {
    it('应该处理数据库查询错误', async () => {
      const error = new Error('数据库连接失败');
      mockUser.count.mockRejectedValue(error);

      await expect(statisticsService.getOverviewStats())
        .rejects.toThrow('数据库连接失败');
    });

    it('应该处理缓存服务错误', async () => {
      const error = new Error('缓存服务不可用');
      mockCacheService.get.mockRejectedValue(error);

      // 应该降级到直接查询数据库
      mockUser.count.mockResolvedValue(150);
      mockStudent.count.mockResolvedValue(120);
      mockTeacher.count.mockResolvedValue(25);
      mockClass.count.mockResolvedValue(8);
      mockActivity.count.mockResolvedValue(45);
      mockEnrollmentApplication.count.mockResolvedValue(15);

      const result = await statisticsService.getOverviewStats();

      expect(result).toBeDefined();
      expect(mockUser.count).toHaveBeenCalled();
    });

    it('应该处理无效的日期范围', async () => {
      const invalidDateRange = {
        startDate: '2024-12-31',
        endDate: '2024-01-01' // 结束日期早于开始日期
      };

      await expect(statisticsService.getUserStats(invalidDateRange))
        .rejects.toThrow('无效的日期范围');
    });

    it('应该处理空数据结果', async () => {
      mockSequelize.query.mockResolvedValue([[]]);

      const result = await statisticsService.getUserStats();

      expect(result).toBeDefined();
      expect(result.byRole).toEqual([]);
    });
  });

  describe('缓存管理', () => {
    it('应该设置缓存过期时间', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockUser.count.mockResolvedValue(150);
      mockStudent.count.mockResolvedValue(120);
      mockTeacher.count.mockResolvedValue(25);
      mockClass.count.mockResolvedValue(8);
      mockActivity.count.mockResolvedValue(45);
      mockEnrollmentApplication.count.mockResolvedValue(15);

      await statisticsService.getOverviewStats();

      expect(mockCacheService.set).toHaveBeenCalledWith(
        'stats:overview',
        expect.any(Object),
        300 // 5分钟缓存
      );
    });

    it('应该清除过期缓存', async () => {
      await statisticsService.clearStatsCache();

      expect(mockCacheService.del).toHaveBeenCalledWith('stats:*');
    });

    it('应该预热缓存', async () => {
      mockUser.count.mockResolvedValue(150);
      mockStudent.count.mockResolvedValue(120);
      mockTeacher.count.mockResolvedValue(25);
      mockClass.count.mockResolvedValue(8);
      mockActivity.count.mockResolvedValue(45);
      mockEnrollmentApplication.count.mockResolvedValue(15);

      await statisticsService.warmupCache();

      expect(mockCacheService.set).toHaveBeenCalledWith(
        'stats:overview',
        expect.any(Object),
        expect.any(Number)
      );
    });
  });
});
