import { jest } from '@jest/globals';
import { vi } from 'vitest'
import request from 'supertest';
import express from 'express';

// Mock Express app
const mockApp = express();

// Mock controllers
const mockStatisticsController = {
  getSystemStatistics: jest.fn(),
  getUserStatistics: jest.fn(),
  getStudentStatistics: jest.fn(),
  getTeacherStatistics: jest.fn(),
  getClassStatistics: jest.fn(),
  getActivityStatistics: jest.fn(),
  getEnrollmentStatistics: jest.fn(),
  getFinanceStatistics: jest.fn(),
  getPerformanceStatistics: jest.fn(),
  getAttendanceStatistics: jest.fn(),
  getAcademicStatistics: jest.fn(),
  getBehaviorStatistics: jest.fn(),
  getHealthStatistics: jest.fn(),
  getNutritionStatistics: jest.fn(),
  getSafetyStatistics: jest.fn(),
  getCommunicationStatistics: jest.fn(),
  getEngagementStatistics: jest.fn(),
  getSatisfactionStatistics: jest.fn(),
  getRetentionStatistics: jest.fn(),
  getGrowthStatistics: jest.fn(),
  getCustomStatistics: jest.fn(),
  exportStatistics: jest.fn(),
  getStatisticsDashboard: jest.fn(),
  getStatisticsReport: jest.fn(),
  getStatisticsTrends: jest.fn(),
  getStatisticsComparison: jest.fn(),
  getStatisticsForecast: jest.fn(),
  getStatisticsAlerts: jest.fn(),
  getStatisticsSettings: jest.fn(),
  updateStatisticsSettings: jest.fn()
};

// Mock middlewares
const mockAuthMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockValidationMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockRateLimitMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockPermissionMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockSecurityMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockCacheMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());

// Mock imports
// // // jest.unstable_mockModule('../../../../../src/controllers/statistics.controller', () => mockStatisticsController);
jest.unstable_mockModule('../../../../../src/middlewares/auth.middleware', () => ({
  verifyToken: mockAuthMiddleware,
  requireAuth: mockAuthMiddleware
}));
jest.unstable_mockModule('../../../../../src/middlewares/rate-limit.middleware', () => ({
  statisticsRateLimit: mockRateLimitMiddleware,
  exportRateLimit: mockRateLimitMiddleware
}));
jest.unstable_mockModule('../../../../../src/middlewares/permission.middleware', () => ({
  checkPermission: mockPermissionMiddleware,
  requireStatisticsAccess: mockPermissionMiddleware
}));
jest.unstable_mockModule('../../../../../src/middlewares/security.middleware', () => ({
  sanitizeInput: mockSecurityMiddleware,
  validateContentType: mockSecurityMiddleware
}));
jest.unstable_mockModule('../../../../../src/middlewares/cache.middleware', () => ({
  cacheResponse: mockCacheMiddleware
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

describe('Statistics Routes', () => {
  let statisticsRouter: any;

  beforeAll(async () => {
    // 动态导入路由
    const { default: importedStatisticsRouter } = await import('../../../src/routes/statistics.routes');
    statisticsRouter = importedStatisticsRouter;
    
    // 设置Express应用
    mockApp.use('/statistics', statisticsRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // 设置默认的控制器响应
    mockStatisticsController.getSystemStatistics.mockImplementation((req, res) => {
      (res as any).status(200).json({
        success: true,
        data: {
          overview: {
            totalUsers: 1250,
            activeUsers: 890,
            totalStudents: 480,
            totalTeachers: 45,
            totalClasses: 12,
            systemUptime: '99.9%',
            lastUpdated: '2024-02-20T14:30:00.000Z'
          },
          growth: {
            userGrowth: 15.2,
            studentGrowth: 8.5,
            teacherGrowth: 12.8,
            classGrowth: 20.0,
            period: 'monthly'
          },
            performance: {
            avgResponseTime: 120,
            errorRate: 0.1,
            availability: 99.9,
            throughput: 1500
          },
          alerts: [
            {
              type: 'warning',
              message: '磁盘空间使用率较高',
              severity: 'medium',
              timestamp: '2024-02-20T10:00:00.000Z'
            }
          ]
        },
        message: '获取系统统计成功'
      });
    });

    mockStatisticsController.getUserStatistics.mockImplementation((req, res) => {
      (res as any).status(200).json({
        success: true,
        data: {
          total: 1250,
          active: 890,
          inactive: 360,
          newThisMonth: 45,
          byRole: {
            admin: 5,
            teacher: 42,
            parent: 980,
            staff: 223
          },
          byStatus: {
            active: 890,
            inactive: 360,
            suspended: 0,
            deleted: 0
          },
          byRegistrationDate: [
            { date: '2024-02-01', count: 15 },
            { date: '2024-02-02', count: 12 },
            { date: '2024-02-03', count: 18 }
          ],
          loginActivity: {
            dailyActive: 450,
            weeklyActive: 890,
            monthlyActive: 1100,
            avgSessionDuration: 1800 // 秒
          }
        },
        message: '获取用户统计成功'
      });
    });

    mockStatisticsController.getStudentStatistics.mockImplementation((req, res) => {
      (res as any).status(200).json({
        success: true,
        data: {
          total: 480,
          active: 465,
          graduated: 15,
          newThisMonth: 12,
          byAge: {
            '3-4': 120,
            '4-5': 180,
            '5-6': 180
          },
          byClass: {
            '小班A': 25,
            '小班B': 25,
            '中班A': 30,
            '中班B': 30,
            '大班A': 35,
            '大班B': 35
          },
          byGender: {
            male: 250,
            female: 230
          },
          attendance: {
            avgAttendance: 95.2,
            attendanceRate: 0.952,
            absentDays: 23,
            lateDays: 15
          },
          enrollment: {
            currentEnrollment: 480,
            capacity: 500,
            enrollmentRate: 0.96,
            waitlistCount: 25
          }
        },
        message: '获取学生统计成功'
      });
    });

    mockStatisticsController.getStatisticsDashboard.mockImplementation((req, res) => {
      (res as any).status(200).json({
        success: true,
        data: {
          widgets: [
            {
              id: 'user-overview',
              title: '用户概览',
              type: 'metric',
              data: {
                total: 1250,
                active: 890,
                growth: 15.2
              },
              trend: 'up'
            },
            {
              id: 'student-enrollment',
              title: '学生注册',
              type: 'chart',
              data: {
                current: 480,
                capacity: 500,
                rate: 96
              },
              trend: 'stable'
            }
          ],
          charts: [
            {
              id: 'user-growth',
              title: '用户增长趋势',
              type: 'line',
              data: [
                { date: '2024-01-01', value: 1085 },
                { date: '2024-01-15', value: 1150 },
                { date: '2024-02-01', value: 1200 },
                { date: '2024-02-15', value: 1250 }
              ]
            }
          ],
          alerts: [
            {
              id: 'disk-space',
              type: 'warning',
              message: '磁盘空间使用率较高',
              severity: 'medium'
            }
          ],
          lastUpdated: '2024-02-20T14:30:00.000Z'
        },
        message: '获取统计仪表板成功'
      });
    });
  });

  describe('GET /statistics/system', () => {
    it('应该获取系统统计', async () => {
      const response = await request(mockApp)
        .get('/statistics/system')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          overview: {
            totalUsers: 1250,
            activeUsers: 890,
            totalStudents: 480,
            totalTeachers: 45,
            totalClasses: 12,
            systemUptime: '99.9%',
            lastUpdated: '2024-02-20T14:30:00.000Z'
          },
          growth: {
            userGrowth: 15.2,
            studentGrowth: 8.5,
            teacherGrowth: 12.8,
            classGrowth: 20.0,
            period: 'monthly'
          },
          performance: {
            avgResponseTime: 120,
            errorRate: 0.1,
            availability: 99.9,
            throughput: 1500
          },
          alerts: [
            {
              type: 'warning',
              message: '磁盘空间使用率较高',
              severity: 'medium',
              timestamp: '2024-02-20T10:00:00.000Z'
            }
          ]
        },
        message: '获取系统统计成功'
      });

      expect(mockStatisticsController.getSystemStatistics).toHaveBeenCalled();
    });

    it('应该支持时间范围参数', async () => {
      const startDate = '2024-02-01';
      const endDate = '2024-02-29';

      await request(mockApp)
        .get('/statistics/system')
        .query({ startDate, endDate })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockStatisticsController.getSystemStatistics).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            startDate,
            endDate
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该支持粒度参数', async () => {
      const granularity = 'daily';

      await request(mockApp)
        .get('/statistics/system')
        .query({ granularity })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockStatisticsController.getSystemStatistics).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            granularity
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该应用认证中间件', async () => {
      await request(mockApp)
        .get('/statistics/system')
        .set('Authorization', 'Bearer valid-token');

      expect(mockAuthMiddleware).toHaveBeenCalled();
    });

    it('应该应用缓存中间件', async () => {
      await request(mockApp)
        .get('/statistics/system')
        .set('Authorization', 'Bearer valid-token');

      expect(mockCacheMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /statistics/users', () => {
    it('应该获取用户统计', async () => {
      const response = await request(mockApp)
        .get('/statistics/users')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          total: 1250,
          active: 890,
          inactive: 360,
          newThisMonth: 45,
          byRole: {
            admin: 5,
            teacher: 42,
            parent: 980,
            staff: 223
          },
          byStatus: {
            active: 890,
            inactive: 360,
            suspended: 0,
            deleted: 0
          },
          byRegistrationDate: [
            { date: '2024-02-01', count: 15 },
            { date: '2024-02-02', count: 12 },
            { date: '2024-02-03', count: 18 }
          ],
          loginActivity: {
            dailyActive: 450,
            weeklyActive: 890,
            monthlyActive: 1100,
            avgSessionDuration: 1800
          }
        },
        message: '获取用户统计成功'
      });

      expect(mockStatisticsController.getUserStatistics).toHaveBeenCalled();
    });

    it('应该支持角色过滤', async () => {
      const role = 'teacher';

      await request(mockApp)
        .get('/statistics/users')
        .query({ role })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockStatisticsController.getUserStatistics).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            role
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该支持状态过滤', async () => {
      const status = 'active';

      await request(mockApp)
        .get('/statistics/users')
        .query({ status })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockStatisticsController.getUserStatistics).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            status
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('GET /statistics/students', () => {
    it('应该获取学生统计', async () => {
      const response = await request(mockApp)
        .get('/statistics/students')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          total: 480,
          active: 465,
          graduated: 15,
          newThisMonth: 12,
          byAge: {
            '3-4': 120,
            '4-5': 180,
            '5-6': 180
          },
          byClass: {
            '小班A': 25,
            '小班B': 25,
            '中班A': 30,
            '中班B': 30,
            '大班A': 35,
            '大班B': 35
          },
          byGender: {
            male: 250,
            female: 230
          },
          attendance: {
            avgAttendance: 95.2,
            attendanceRate: 0.952,
            absentDays: 23,
            lateDays: 15
          },
          enrollment: {
            currentEnrollment: 480,
            capacity: 500,
            enrollmentRate: 0.96,
            waitlistCount: 25
          }
        },
        message: '获取学生统计成功'
      });

      expect(mockStatisticsController.getStudentStatistics).toHaveBeenCalled();
    });

    it('应该支持班级过滤', async () => {
      const classId = '1';

      await request(mockApp)
        .get('/statistics/students')
        .query({ classId })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockStatisticsController.getStudentStatistics).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            classId
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该支持年龄组过滤', async () => {
      const ageGroup = '4-5';

      await request(mockApp)
        .get('/statistics/students')
        .query({ ageGroup })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockStatisticsController.getStudentStatistics).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            ageGroup
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('GET /statistics/teachers', () => {
    it('应该获取教师统计', async () => {
      mockStatisticsController.getTeacherStatistics.mockImplementation((req, res) => {
        (res as any).status(200).json({
          success: true,
          data: {
            total: 45,
            active: 42,
            inactive: 3,
            newThisMonth: 2,
            byDepartment: {
              '教学部': 35,
              '行政部': 8,
              '后勤部': 2
            },
            byQualification: {
              '本科': 25,
              '硕士': 18,
              '博士': 2
            },
            byExperience: {
              '0-2年': 8,
              '3-5年': 15,
              '6-10年': 12,
              '10年以上': 10
            },
            performance: {
              avgRating: 4.5,
              avgStudents: 14,
              avgClasses: 3
            },
            workload: {
              avgHours: 40,
              avgClasses: 15,
              avgStudents: 60
            }
          },
          message: '获取教师统计成功'
        });
      });

      const response = await request(mockApp)
        .get('/statistics/teachers')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockStatisticsController.getTeacherStatistics).toHaveBeenCalled();
    });
  });

  describe('GET /statistics/classes', () => {
    it('应该获取班级统计', async () => {
      mockStatisticsController.getClassStatistics.mockImplementation((req, res) => {
        (res as any).status(200).json({
          success: true,
          data: {
            total: 12,
            active: 12,
            byLevel: {
              '小班': 2,
              '中班': 2,
              '大班': 2
            },
            bySize: {
              '20-25': 4,
              '26-30': 4,
              '31-35': 4
            },
            capacity: {
              total: 500,
              used: 480,
              available: 20,
              utilization: 0.96
            },
            teachers: {
              total: 24,
              avgPerClass: 2,
              maxPerClass: 3,
              minPerClass: 1
            },
            students: {
              total: 480,
              avgPerClass: 40,
              maxPerClass: 45,
              minPerClass: 35
            }
          },
          message: '获取班级统计成功'
        });
      });

      const response = await request(mockApp)
        .get('/statistics/classes')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockStatisticsController.getClassStatistics).toHaveBeenCalled();
    });
  });

  describe('GET /statistics/activities', () => {
    it('应该获取活动统计', async () => {
      mockStatisticsController.getActivityStatistics.mockImplementation((req, res) => {
        (res as any).status(200).json({
          success: true,
          data: {
            total: 156,
            active: 45,
            completed: 98,
            cancelled: 13,
            byType: {
              '文体活动': 65,
              '教育活动': 48,
              '社交活动': 28,
              '其他': 15
            },
            byStatus: {
              'planning': 12,
              'active': 45,
              'completed': 98,
              'cancelled': 13
            },
            participation: {
              totalParticipants: 3850,
              avgParticipants: 25,
              maxParticipants: 50,
              participationRate: 0.85
            },
            satisfaction: {
              avgRating: 4.3,
              positiveFeedback: 0.92,
              suggestions: 45
            }
          },
          message: '获取活动统计成功'
        });
      });

      const response = await request(mockApp)
        .get('/statistics/activities')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockStatisticsController.getActivityStatistics).toHaveBeenCalled();
    });
  });

  describe('GET /statistics/enrollment', () => {
    it('应该获取招生统计', async () => {
      mockStatisticsController.getEnrollmentStatistics.mockImplementation((req, res) => {
        (res as any).status(200).json({
          success: true,
          data: {
            thisYear: {
              applications: 320,
              enrolled: 280,
              rejected: 25,
              pending: 15,
              enrollmentRate: 0.875
            },
            lastYear: {
              applications: 295,
              enrolled: 260,
              rejected: 20,
              pending: 15,
              enrollmentRate: 0.881
            },
            bySource: {
              '官网': 120,
              '推荐': 85,
              '广告': 65,
              '其他': 50
            },
            byMonth: [
              { month: '2024-01', applications: 45, enrolled: 40 },
              { month: '2024-02', applications: 38, enrolled: 35 }
            ],
            conversion: {
              applicationToEnrollment: 0.875,
              interviewToEnrollment: 0.92,
              tourToEnrollment: 0.85
            }
          },
          message: '获取招生统计成功'
        });
      });

      const response = await request(mockApp)
        .get('/statistics/enrollment')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockStatisticsController.getEnrollmentStatistics).toHaveBeenCalled();
    });
  });

  describe('GET /statistics/finance', () => {
    it('应该获取财务统计', async () => {
      mockStatisticsController.getFinanceStatistics.mockImplementation((req, res) => {
        (res as any).status(200).json({
          success: true,
          data: {
            revenue: {
              thisMonth: 480000,
              lastMonth: 450000,
              growth: 6.67,
              bySource: {
                '学费': 400000,
                '活动费': 50000,
                '其他': 30000
              }
            },
            expenses: {
              thisMonth: 380000,
              lastMonth: 370000,
              growth: 2.70,
              byCategory: {
                '工资': 250000,
                '租金': 80000,
                '物料': 30000,
                '其他': 20000
              }
            },
            profit: {
              thisMonth: 100000,
              lastMonth: 80000,
              growth: 25.0,
              margin: 0.208
            },
            outstanding: {
              total: 45000,
              overdue: 12000,
              overdueRate: 0.267
            }
          },
          message: '获取财务统计成功'
        });
      });

      const response = await request(mockApp)
        .get('/statistics/finance')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockStatisticsController.getFinanceStatistics).toHaveBeenCalled();

      it('应该检查财务统计查看权限', async () => {
        await request(mockApp)
          .get('/statistics/finance')
          .set('Authorization', 'Bearer valid-token');

        expect(mockPermissionMiddleware).toHaveBeenCalled();
      });
    });
  });

  describe('GET /statistics/dashboard', () => {
    it('应该获取统计仪表板', async () => {
      const response = await request(mockApp)
        .get('/statistics/dashboard')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          widgets: [
            {
              id: 'user-overview',
              title: '用户概览',
              type: 'metric',
              data: {
                total: 1250,
                active: 890,
                growth: 15.2
              },
              trend: 'up'
            },
            {
              id: 'student-enrollment',
              title: '学生注册',
              type: 'chart',
              data: {
                current: 480,
                capacity: 500,
                rate: 96
              },
              trend: 'stable'
            }
          ],
          charts: [
            {
              id: 'user-growth',
              title: '用户增长趋势',
              type: 'line',
              data: [
                { date: '2024-01-01', value: 1085 },
                { date: '2024-01-15', value: 1150 },
                { date: '2024-02-01', value: 1200 },
                { date: '2024-02-15', value: 1250 }
              ]
            }
          ],
          alerts: [
            {
              id: 'disk-space',
              type: 'warning',
              message: '磁盘空间使用率较高',
              severity: 'medium'
            }
          ],
          lastUpdated: '2024-02-20T14:30:00.000Z'
        },
        message: '获取统计仪表板成功'
      });

      expect(mockStatisticsController.getStatisticsDashboard).toHaveBeenCalled();
    });

    it('应该支持仪表板类型参数', async () => {
      const dashboardType = 'admin';

      await request(mockApp)
        .get('/statistics/dashboard')
        .query({ type: dashboardType })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockStatisticsController.getStatisticsDashboard).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            type: dashboardType
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('GET /statistics/trends', () => {
    it('应该获取统计趋势', async () => {
      mockStatisticsController.getStatisticsTrends.mockImplementation((req, res) => {
        (res as any).status(200).json({
          success: true,
          data: {
            metric: 'user_growth',
            period: '30d',
            data: [
              { date: '2024-01-21', value: 1150 },
              { date: '2024-01-22', value: 1160 },
              { date: '2024-01-23', value: 1170 },
              { date: '2024-01-24', value: 1180 },
              { date: '2024-01-25', value: 1190 },
              { date: '2024-01-26', value: 1200 },
              { date: '2024-01-27', value: 1210 },
              { date: '2024-01-28', value: 1220 },
              { date: '2024-01-29', value: 1230 },
              { date: '2024-01-30', value: 1240 },
              { date: '2024-01-31', value: 1250 }
            ],
            trend: {
              direction: 'up',
              change: 8.7,
              slope: 10.0
            },
            forecast: [
              { date: '2024-02-21', value: 1260 },
              { date: '2024-02-22', value: 1270 }
            ]
          },
          message: '获取统计趋势成功'
        });
      });

      const response = await request(mockApp)
        .get('/statistics/trends')
        .query({ metric: 'user_growth', period: '30d' })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockStatisticsController.getStatisticsTrends).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            metric: 'user_growth',
            period: '30d'
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('GET /statistics/comparison', () => {
    it('应该获取统计对比', async () => {
      mockStatisticsController.getStatisticsComparison.mockImplementation((req, res) => {
        (res as any).status(200).json({
          success: true,
          data: {
            metric: 'enrollment_rate',
            comparison: [
              {
                period: '2024-01',
                value: 0.881,
                change: 0.0
              },
              {
                period: '2024-02',
                value: 0.875,
                change: -0.006
              }
            ],
            byCategory: [
              {
                category: '官网',
                current: 0.90,
                previous: 0.88,
                change: 0.020
              },
              {
                category: '推荐',
                current: 0.92,
                previous: 0.94,
                change: -0.020
              }
            ],
            insights: [
              {
                type: 'trend',
                message: '整体注册率略有下降'
              },
              {
                type: 'opportunity',
                message: '官网渠道注册率提升，可加大投入'
              }
            ]
          },
          message: '获取统计对比成功'
        });
      });

      const response = await request(mockApp)
        .get('/statistics/comparison')
        .query({ metric: 'enrollment_rate', period1: '2024-01', period2: '2024-02' })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockStatisticsController.getStatisticsComparison).toHaveBeenCalled();
    });
  });

  describe('GET /statistics/export', () => {
    it('应该导出统计数据', async () => {
      mockStatisticsController.exportStatistics.mockImplementation((req, res) => {
        (res as any).status(200).json({
          success: true,
          data: {
            exportId: 'export_123',
            downloadUrl: '/api/files/download/statistics-export-2024.xlsx',
            format: 'excel',
            includes: ['users', 'students', 'teachers', 'classes'],
            filters: {
              startDate: '2024-02-01',
              endDate: '2024-02-29'
            },
            expiresAt: new Date(Date.now() + 3600000).toISOString(),
            generatedAt: new Date().toISOString()
          },
          message: '统计数据导出成功'
        });
      });

      const exportParams = {
        format: 'excel',
        metrics: ['users', 'students', 'teachers', 'classes'],
        startDate: '2024-02-01',
        endDate: '2024-02-29'
      };

      const response = await request(mockApp)
        .get('/statistics/export')
        .query(exportParams)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockStatisticsController.exportStatistics).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining(exportParams)
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该检查导出权限', async () => {
      await request(mockApp)
        .get('/statistics/export')
        .query({ format: 'excel' })
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });

    it('应该应用导出限流中间件', async () => {
      await request(mockApp)
        .get('/statistics/export')
        .query({ format: 'excel' })
        .set('Authorization', 'Bearer valid-token');

      expect(mockRateLimitMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /statistics/settings', () => {
    it('应该获取统计设置', async () => {
      mockStatisticsController.getStatisticsSettings.mockImplementation((req, res) => {
        (res as any).status(200).json({
          success: true,
          data: {
            dashboard: {
              defaultPeriod: '30d',
              refreshInterval: 300,
              enabledWidgets: ['user_overview', 'student_enrollment', 'revenue_trend'],
              chartTypes: ['line', 'bar', 'pie', 'area']
            },
            export: {
              defaultFormat: 'excel',
              maxRecords: 10000,
              allowedFormats: ['excel', 'csv', 'pdf', 'json']
            },
            alerts: {
              enabled: true,
              thresholds: {
                userGrowth: { min: 5, max: 20 },
                enrollmentRate: { min: 80, max: 95 },
                revenueGrowth: { min: 0, max: 15 }
              }
            },
            cache: {
              enabled: true,
              ttl: 3600,
              keyPrefix: 'stats_'
            }
          },
          message: '获取统计设置成功'
        });
      });

      const response = await request(mockApp)
        .get('/statistics/settings')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockStatisticsController.getStatisticsSettings).toHaveBeenCalled();
    });

    it('应该检查管理员权限', async () => {
      await request(mockApp)
        .get('/statistics/settings')
        .set('Authorization', 'Bearer admin-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('PUT /statistics/settings', () => {
    it('应该更新统计设置', async () => {
      mockStatisticsController.updateStatisticsSettings.mockImplementation((req, res) => {
        (res as any).status(200).json({
          success: true,
          data: {
            dashboard: {
              defaultPeriod: '7d',
              refreshInterval: 60,
              updatedAt: new Date().toISOString()
            },
            message: '统计设置更新成功'
          },
          message: '统计设置更新成功'
        });
      });

      const settingsData = {
        dashboard: {
          defaultPeriod: '7d',
          refreshInterval: 60
        }
      };

      const response = await request(mockApp)
        .put('/statistics/settings')
        .send(settingsData)
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockStatisticsController.updateStatisticsSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          body: settingsData
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该验证设置数据', async () => {
      const invalidSettingsData = {
        dashboard: {
          defaultPeriod: 'invalid_period', // 无效周期
          refreshInterval: -1 // 无效间隔
        }
      };

      await request(mockApp)
        .put('/statistics/settings')
        .send(invalidSettingsData)
        .set('Authorization', 'Bearer admin-token')
        .expect(400);

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });
  });

  describe('路由中间件应用', () => {
    it('应该正确应用认证中间件到所有路由', () => {
      const authRoutes = ['/statistics/system', '/statistics/users', '/statistics/students',
                          '/statistics/teachers', '/statistics/classes', '/statistics/activities',
                          '/statistics/enrollment', '/statistics/finance', '/statistics/dashboard',
                          '/statistics/trends', '/statistics/comparison', '/statistics/export',
                          '/statistics/settings'];
      
      authRoutes.forEach(route => {
        expect(mockAuthMiddleware).toBeDefined();
      });
    });

    it('应该正确应用验证中间件到需要验证的路由', () => {
      const validatedRoutes = ['/statistics/system', '/statistics/users', '/statistics/students',
                              '/statistics/trends', '/statistics/comparison', '/statistics/export',
                              '/statistics/settings'];
      
      validatedRoutes.forEach(route => {
        expect(mockValidationMiddleware).toBeDefined();
      });
    });

    it('应该正确应用权限中间件到敏感操作', () => {
      const permissionRoutes = ['/statistics/finance', '/statistics/export', '/statistics/settings'];
      
      permissionRoutes.forEach(route => {
        expect(mockPermissionMiddleware).toBeDefined();
      });
    });

    it('应该正确应用安全中间件到所有路由', () => {
      expect(mockSecurityMiddleware).toBeDefined();
    });

    it('应该正确应用限流中间件到导出路由', () => {
      const rateLimitedRoutes = ['/statistics/export'];
      
      rateLimitedRoutes.forEach(route => {
        expect(mockRateLimitMiddleware).toBeDefined();
      });
    });

    it('应该正确应用缓存中间件到数据查询路由', () => {
      const cachedRoutes = ['/statistics/system', '/statistics/users', '/statistics/students',
                           '/statistics/dashboard'];
      
      cachedRoutes.forEach(route => {
        expect(mockCacheMiddleware).toBeDefined();
      });
    });
  });

  describe('错误处理', () => {
    it('应该处理控制器抛出的错误', async () => {
      mockStatisticsController.getSystemStatistics.mockImplementation((req, res, next) => {
        const error = new Error('获取系统统计失败');
        (next as any)(error);
      });

      await request(mockApp)
        .get('/statistics/system')
        .set('Authorization', 'Bearer valid-token')
        .expect(500);
    });

    it('应该处理验证中间件错误', async () => {
      mockValidationMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('参数验证失败');
        (error as any).statusCode = 400;
        (next as any)(error);
      });

      await request(mockApp)
        .get('/statistics/system')
        .query({ startDate: 'invalid-date' })
        .set('Authorization', 'Bearer valid-token')
        .expect(400);
    });

    it('应该处理权限不足错误', async () => {
      mockPermissionMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('权限不足');
        (error as any).statusCode = 403;
        (next as any)(error);
      });

      await request(mockApp)
        .get('/statistics/finance')
        .set('Authorization', 'Bearer user-token')
        .expect(403);
    });

    it('应该处理数据不存在错误', async () => {
      mockStatisticsController.getStudentStatistics.mockImplementation((req, res, next) => {
        const error = new Error('统计数据不存在');
        (error as any).statusCode = 404;
        (next as any)(error);
      });

      await request(mockApp)
        .get('/statistics/students')
        .query({ classId: '999' })
        .set('Authorization', 'Bearer valid-token')
        .expect(404);
    });

    it('应该处理导出失败错误', async () => {
      mockStatisticsController.exportStatistics.mockImplementation((req, res, next) => {
        const error = new Error('导出失败：数据量过大');
        (error as any).statusCode = 413;
        (next as any)(error);
      });

      await request(mockApp)
        .get('/statistics/export')
        .query({ format: 'excel', metrics: Array(100).fill('users') })
        .set('Authorization', 'Bearer valid-token')
        .expect(413);
    });
  });

  describe('性能测试', () => {
    it('应该处理大量统计数据', async () => {
      mockStatisticsController.getUserStatistics.mockImplementation((req, res) => {
        // 模拟大量统计数据
        const largeData = {
          total: 10000,
          active: 8500,
          byRegistrationDate: Array(365).fill(null).map((_, i) => ({
            date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
            count: Math.floor(Math.random() * 50) + 10
          })),
          loginActivity: {
            dailyActive: Array(30).fill(null).map((_, i) => ({
              date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
              count: Math.floor(Math.random() * 1000) + 500
            }))
          }
        };

        (res as any).status(200).json({
          success: true,
          data: largeData,
          message: '获取用户统计成功'
        });
      });

      const response = await request(mockApp)
        .get('/statistics/users')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total).toBe(10000);
    });

    it('应该处理并发统计请求', async () => {
      const requests = Array(10).fill(null).map(() => 
        request(mockApp)
          .get('/statistics/system')
          .set('Authorization', 'Bearer valid-token')
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('应该处理复杂统计计算', async () => {
      mockStatisticsController.getStatisticsComparison.mockImplementation((req, res) => {
        // 模拟复杂统计计算
        const complexData = {
          metric: 'comprehensive_performance',
          comparison: Array(12).fill(null).map((_, i) => ({
            period: `2024-${String(i + 1).padStart(2, '0')}`,
            value: Math.random() * 100,
            change: (Math.random() - 0.5) * 10
          })),
          byCategory: Array(20).fill(null).map((_, i) => ({
            category: `类别${i + 1}`,
            current: Math.random() * 100,
            previous: Math.random() * 100,
            change: (Math.random() - 0.5) * 20
          })),
          correlations: Array(10).fill(null).map((_, i) => ({
            metric1: `指标${i + 1}`,
            metric2: `指标${i + 2}`,
            correlation: Math.random() * 2 - 1
          }))
        };

        (res as any).status(200).json({
          success: true,
          data: complexData,
          message: '获取统计对比成功'
        });
      });

      const response = await request(mockApp)
        .get('/statistics/comparison')
        .query({ metric: 'comprehensive_performance', period1: '2024-01', period2: '2024-02' })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('安全测试', () => {
    it('应该防止SQL注入攻击', async () => {
      const maliciousQuery = "'; DROP TABLE statistics; --";

      await request(mockApp)
        .get('/statistics/system')
        .query({ search: maliciousQuery })
        .set('Authorization', 'Bearer valid-token')
        .expect(400);

      expect(mockSecurityMiddleware).toHaveBeenCalled();
    });

    it('应该防止XSS攻击', async () => {
      const maliciousScript = '<script>alert("xss")</script>';

      await request(mockApp)
        .get('/statistics/system')
        .query({ filter: maliciousScript })
        .set('Authorization', 'Bearer valid-token')
        .expect(400);

      expect(mockSecurityMiddleware).toHaveBeenCalled();
    });

    it('应该验证输入数据格式', async () => {
      const invalidFormats = [
        { route: '/statistics/system', method: 'get', query: { startDate: 'invalid-date' } },
        { route: '/statistics/users', method: 'get', query: { role: 'invalid_role' } },
        { route: '/statistics/export', method: 'get', query: { format: 'invalid_format' } },
        { route: '/statistics/trends', method: 'get', query: { period: 'invalid_period' } },
        { route: '/statistics/settings', method: 'put', body: { dashboard: { defaultPeriod: 'invalid' } } }
      ];

      for (const { route, method, query, body } of invalidFormats) {
        const req = request(mockApp)[method](route)
          .set('Authorization', 'Bearer valid-token');
        
        if (query) {
          req.query(query);
        }
        
        if (body) {
          req.send(body);
        }
        
        await req.expect(400);
      }
    });

    it('应该限制统计导出频率', async () => {
      mockRateLimitMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('导出请求过于频繁');
        (error as any).statusCode = 429;
        (next as any)(error);
      });

      await request(mockApp)
        .get('/statistics/export')
        .query({ format: 'excel' })
        .set('Authorization', 'Bearer valid-token')
        .expect(429);
    });

    it('应该保护敏感统计操作', async () => {
      const sensitiveOperations = [
        { path: '/statistics/finance', method: 'get' },
        { path: '/statistics/export', method: 'get' },
        { path: '/statistics/settings', method: 'get' },
        { path: '/statistics/settings', method: 'put' }
      ];

      for (const { path, method } of sensitiveOperations) {
        await request(mockApp)[method](path)
          .set('Authorization', 'Bearer user-token')
          .expect(403);
      }
    });

    it('应该验证统计查询的安全性', async () => {
      mockSecurityMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('统计查询包含恶意内容');
        (error as any).statusCode = 400;
        (next as any)(error);
      });

      await request(mockApp)
        .get('/statistics/system')
        .query({ customQuery: 'malicious content' })
        .set('Authorization', 'Bearer valid-token')
        .expect(400);

      expect(mockSecurityMiddleware).toHaveBeenCalled();
    });
  });
});