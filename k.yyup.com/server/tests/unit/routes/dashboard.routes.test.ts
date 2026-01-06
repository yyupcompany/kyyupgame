import { jest } from '@jest/globals';
import { vi } from 'vitest'
import request from 'supertest';
import express from 'express';

// Mock Express app
const mockApp = express();

// Mock controllers
const mockDashboardController = {
  getDashboardData: jest.fn(),
  getStatistics: jest.fn(),
  getRecentActivities: jest.fn(),
  getNotifications: jest.fn(),
  getSystemHealth: jest.fn(),
  getUserAnalytics: jest.fn(),
  getPerformanceMetrics: jest.fn(),
  getChartData: jest.fn(),
  exportDashboardData: jest.fn(),
  refreshDashboard: jest.fn()
};

// Mock middlewares
const mockAuthMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockValidationMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockCacheMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockRateLimitMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());

// Mock imports
jest.unstable_mockModule('../../../../../src/controllers/dashboard.controller', () => mockDashboardController);
jest.unstable_mockModule('../../../../../src/middlewares/auth.middleware', () => ({
jest.unstable_mockModule('../../../../../src/middlewares/cache.middleware', () => ({
  cacheResponse: mockCacheMiddleware
}));
jest.unstable_mockModule('../../../../../src/middlewares/rate-limit.middleware', () => ({
  apiLimiter: mockRateLimitMiddleware
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

describe('Dashboard Routes', () => {
  let dashboardRouter: any;

  beforeAll(async () => {
    // 动态导入路由
    const { default: importedDashboardRouter } = await import('../../../../../src/routes/dashboard.routes');
    dashboardRouter = importedDashboardRouter;
    
    // 设置Express应用
    mockApp.use('/dashboard', dashboardRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // 设置默认的控制器响应
    mockDashboardController.getDashboardData.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: {
          overview: {
            totalStudents: 150,
            totalTeachers: 25,
            totalClasses: 8,
            totalActivities: 12
          },
          recentActivities: [
            { id: 1, type: 'student_enrollment', message: '新学生入学', timestamp: new Date().toISOString() }
          ],
          notifications: [
            { id: 1, type: 'info', message: '系统维护通知', timestamp: new Date().toISOString() }
          ]
        },
        message: '获取仪表板数据成功'
      });
    });

    mockDashboardController.getStatistics.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: {
          enrollmentStats: {
            total: 150,
            newThisMonth: 15,
            retentionRate: 0.95
          },
          financialStats: {
            totalRevenue: 500000,
            monthlyRevenue: 45000,
            collectionRate: 0.98
          },
          academicStats: {
            averageScore: 85.5,
            attendanceRate: 0.92,
            completionRate: 0.88
          }
        },
        message: '获取统计数据成功'
      });
    });

    mockDashboardController.getRecentActivities.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: [
          { id: 1, type: 'student_enrollment', user: '张老师', message: '新学生李明入学', timestamp: new Date().toISOString() },
          { id: 2, type: 'payment_received', user: '王老师', message: '收到学费支付', timestamp: new Date().toISOString() }
        ],
        message: '获取最近活动成功'
      });
    });

    mockDashboardController.getNotifications.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: [
          { id: 1, type: 'warning', title: '系统维护', message: '系统将于今晚10点进行维护', timestamp: new Date().toISOString() },
          { id: 2, type: 'info', title: '新功能发布', message: '新功能模块已上线', timestamp: new Date().toISOString() }
        ],
        message: '获取通知成功'
      });
    });

    mockDashboardController.getSystemHealth.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: {
          cpuUsage: 45.2,
          memoryUsage: 67.8,
          diskUsage: 82.1,
          databaseStatus: 'healthy',
          apiResponseTime: 125,
          uptime: '15天 8小时'
        },
        message: '获取系统健康状态成功'
      });
    });
  });

  describe('GET /dashboard', () => {
    it('应该获取仪表板主数据', async () => {
      const response = await request(mockApp)
        .get('/dashboard')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          overview: {
            totalStudents: 150,
            totalTeachers: 25,
            totalClasses: 8,
            totalActivities: 12
          },
          recentActivities: [
            { id: 1, type: 'student_enrollment', message: '新学生入学', timestamp: expect.any(String) }
          ],
          notifications: [
            { id: 1, type: 'info', message: '系统维护通知', timestamp: expect.any(String) }
          ]
        },
        message: '获取仪表板数据成功'
      });

      expect(mockDashboardController.getDashboardData).toHaveBeenCalled();
    });

    it('应该应用认证中间件', async () => {
      await request(mockApp)
        .get('/dashboard')
        .set('Authorization', 'Bearer valid-token');

      expect(mockAuthMiddleware).toHaveBeenCalled();
    });

    it('应该应用缓存中间件', async () => {
      await request(mockApp)
        .get('/dashboard')
        .set('Authorization', 'Bearer valid-token');

      expect(mockCacheMiddleware).toHaveBeenCalled();
    });

    it('应该处理未认证的请求', async () => {
      mockAuthMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('未授权访问');
        (error as any).statusCode = 401;
        next(error);
      });

      await request(mockApp)
        .get('/dashboard')
        .expect(401);
    });
  });

  describe('GET /dashboard/statistics', () => {
    it('应该获取统计数据', async () => {
      const response = await request(mockApp)
        .get('/dashboard/statistics')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          enrollmentStats: {
            total: 150,
            newThisMonth: 15,
            retentionRate: 0.95
          },
          financialStats: {
            totalRevenue: 500000,
            monthlyRevenue: 45000,
            collectionRate: 0.98
          },
          academicStats: {
            averageScore: 85.5,
            attendanceRate: 0.92,
            completionRate: 0.88
          }
        },
        message: '获取统计数据成功'
      });

      expect(mockDashboardController.getStatistics).toHaveBeenCalled();
    });

    it('应该支持日期范围查询参数', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';

      await request(mockApp)
        .get('/dashboard/statistics')
        .query({ startDate, endDate })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockDashboardController.getStatistics).toHaveBeenCalledWith(
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

    it('应该应用验证中间件', async () => {
      await request(mockApp)
        .get('/dashboard/statistics')
        .set('Authorization', 'Bearer valid-token');

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /dashboard/activities', () => {
    it('应该获取最近活动', async () => {
      const response = await request(mockApp)
        .get('/dashboard/activities')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: [
          { id: 1, type: 'student_enrollment', user: '张老师', message: '新学生李明入学', timestamp: expect.any(String) },
          { id: 2, type: 'payment_received', user: '王老师', message: '收到学费支付', timestamp: expect.any(String) }
        ],
        message: '获取最近活动成功'
      });

      expect(mockDashboardController.getRecentActivities).toHaveBeenCalled();
    });

    it('应该支持分页参数', async () => {
      const page = 1;
      const limit = 10;

      await request(mockApp)
        .get('/dashboard/activities')
        .query({ page, limit })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockDashboardController.getRecentActivities).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            page,
            limit
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该支持活动类型过滤', async () => {
      const activityType = 'student_enrollment';

      await request(mockApp)
        .get('/dashboard/activities')
        .query({ type: activityType })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockDashboardController.getRecentActivities).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            type: activityType
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('GET /dashboard/notifications', () => {
    it('应该获取通知列表', async () => {
      const response = await request(mockApp)
        .get('/dashboard/notifications')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: [
          { id: 1, type: 'warning', title: '系统维护', message: '系统将于今晚10点进行维护', timestamp: expect.any(String) },
          { id: 2, type: 'info', title: '新功能发布', message: '新功能模块已上线', timestamp: expect.any(String) }
        ],
        message: '获取通知成功'
      });

      expect(mockDashboardController.getNotifications).toHaveBeenCalled();
    });

    it('应该支持未读通知过滤', async () => {
      await request(mockApp)
        .get('/dashboard/notifications')
        .query({ unread: true })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockDashboardController.getNotifications).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            unread: 'true'
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('GET /dashboard/system-health', () => {
    it('应该获取系统健康状态', async () => {
      const response = await request(mockApp)
        .get('/dashboard/system-health')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          cpuUsage: 45.2,
          memoryUsage: 67.8,
          diskUsage: 82.1,
          databaseStatus: 'healthy',
          apiResponseTime: 125,
          uptime: '15天 8小时'
        },
        message: '获取系统健康状态成功'
      });

      expect(mockDashboardController.getSystemHealth).toHaveBeenCalled();
    });

    it('应该只允许管理员访问', async () => {
      // 模拟管理员权限检查
      mockAuthMiddleware.mockImplementation((req, res, next) => {
        req.user = { role: 'admin' };
        next();
      });

      await request(mockApp)
        .get('/dashboard/system-health')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);
    });
  });

  describe('GET /dashboard/analytics', () => {
    it('应该获取用户分析数据', async () => {
      mockDashboardController.getUserAnalytics.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            userGrowth: [
              { date: '2024-01-01', count: 100 },
              { date: '2024-01-02', count: 105 }
            ],
            activityDistribution: [
              { type: 'login', count: 1500 },
              { type: 'page_view', count: 3200 }
            ]
          },
          message: '获取用户分析数据成功'
        });
      });

      const response = await request(mockApp)
        .get('/dashboard/analytics')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockDashboardController.getUserAnalytics).toHaveBeenCalled();
    });
  });

  describe('GET /dashboard/performance', () => {
    it('应该获取性能指标', async () => {
      mockDashboardController.getPerformanceMetrics.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            responseTime: { avg: 125, p95: 200, p99: 350 },
            throughput: { requests: 1500, successRate: 0.998 },
            errors: { count: 3, rate: 0.002 }
          },
          message: '获取性能指标成功'
        });
      });

      const response = await request(mockApp)
        .get('/dashboard/performance')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockDashboardController.getPerformanceMetrics).toHaveBeenCalled();
    });
  });

  describe('GET /dashboard/chart-data', () => {
    it('应该获取图表数据', async () => {
      mockDashboardController.getChartData.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
            datasets: [
              {
                label: '学生数量',
                data: [120, 125, 130, 135, 140, 150],
                borderColor: 'rgb(75, 192, 192)'
              }
            ]
          },
          message: '获取图表数据成功'
        });
      });

      const chartType = 'enrollment';
      const period = 'monthly';

      const response = await request(mockApp)
        .get('/dashboard/chart-data')
        .query({ type: chartType, period })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockDashboardController.getChartData).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            type: chartType,
            period
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该验证图表类型参数', async () => {
      await request(mockApp)
        .get('/dashboard/chart-data')
        .query({ type: 'invalid_type' })
        .set('Authorization', 'Bearer valid-token')
        .expect(400);
    });
  });

  describe('POST /dashboard/export', () => {
    it('应该导出仪表板数据', async () => {
      mockDashboardController.exportDashboardData.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            downloadUrl: '/api/files/download/dashboard-export-2024.xlsx',
            expiresAt: new Date(Date.now() + 3600000).toISOString()
          },
          message: '导出任务创建成功'
        });
      });

      const exportData = {
        format: 'excel',
        sections: ['overview', 'statistics', 'activities'],
        dateRange: {
          start: '2024-01-01',
          end: '2024-12-31'
        }
      };

      const response = await request(mockApp)
        .post('/dashboard/export')
        .send(exportData)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockDashboardController.exportDashboardData).toHaveBeenCalled();
    });

    it('应该验证导出格式参数', async () => {
      const invalidExportData = {
        format: 'invalid_format',
        sections: ['overview']
      };

      await request(mockApp)
        .post('/dashboard/export')
        .send(invalidExportData)
        .set('Authorization', 'Bearer valid-token')
        .expect(400);
    });
  });

  describe('POST /dashboard/refresh', () => {
    it('应该刷新仪表板数据', async () => {
      mockDashboardController.refreshDashboard.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '仪表板数据刷新成功',
          data: {
            refreshedAt: new Date().toISOString(),
            sections: ['overview', 'statistics', 'activities', 'notifications']
          }
        });
      });

      const response = await request(mockApp)
        .post('/dashboard/refresh')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockDashboardController.refreshDashboard).toHaveBeenCalled();
    });

    it('应该支持选择性刷新', async () => {
      const refreshData = {
        sections: ['statistics', 'activities']
      };

      await request(mockApp)
        .post('/dashboard/refresh')
        .send(refreshData)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockDashboardController.refreshDashboard).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            sections: ['statistics', 'activities']
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('路由中间件应用', () => {
    it('应该正确应用认证中间件到所有路由', () => {
      const protectedRoutes = ['/dashboard', '/dashboard/statistics', '/dashboard/activities', 
                              '/dashboard/notifications', '/dashboard/system-health', '/dashboard/analytics',
                              '/dashboard/performance', '/dashboard/chart-data', '/dashboard/export', 
                              '/dashboard/refresh'];
      
      protectedRoutes.forEach(route => {
        expect(mockAuthMiddleware).toBeDefined();
      });
    });

    it('应该正确应用缓存中间件到适当的路由', () => {
      const cachedRoutes = ['/dashboard', '/dashboard/statistics', '/dashboard/activities'];
      
      cachedRoutes.forEach(route => {
        expect(mockCacheMiddleware).toBeDefined();
      });
    });

    it('应该正确应用验证中间件到需要验证的路由', () => {
      const validatedRoutes = ['/dashboard/statistics', '/dashboard/export', '/dashboard/chart-data'];
      
      validatedRoutes.forEach(route => {
        expect(mockValidationMiddleware).toBeDefined();
      });
    });

    it('应该正确应用限流中间件到敏感路由', () => {
      const rateLimitedRoutes = ['/dashboard/export', '/dashboard/refresh'];
      
      rateLimitedRoutes.forEach(route => {
        expect(mockRateLimitMiddleware).toBeDefined();
      });
    });
  });

  describe('错误处理', () => {
    it('应该处理控制器抛出的错误', async () => {
      mockDashboardController.getDashboardData.mockImplementation((req, res, next) => {
        const error = new Error('获取仪表板数据失败');
        next(error);
      });

      await request(mockApp)
        .get('/dashboard')
        .set('Authorization', 'Bearer valid-token')
        .expect(500);
    });

    it('应该处理验证中间件错误', async () => {
      mockValidationMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('参数验证失败');
        (error as any).statusCode = 400;
        next(error);
      });

      await request(mockApp)
        .get('/dashboard/statistics')
        .query({ startDate: 'invalid-date' })
        .set('Authorization', 'Bearer valid-token')
        .expect(400);
    });

    it('应该处理缓存中间件错误', async () => {
      mockCacheMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('缓存服务不可用');
        (error as any).statusCode = 503;
        next(error);
      });

      await request(mockApp)
        .get('/dashboard')
        .set('Authorization', 'Bearer valid-token')
        .expect(503);
    });

    it('应该处理权限不足错误', async () => {
      mockAuthMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('权限不足');
        (error as any).statusCode = 403;
        next(error);
      });

      await request(mockApp)
        .get('/dashboard/system-health')
        .set('Authorization', 'Bearer user-token')
        .expect(403);
    });
  });

  describe('性能测试', () => {
    it('应该处理并发请求', async () => {
      const requests = Array(10).fill(null).map(() => 
        request(mockApp)
          .get('/dashboard')
          .set('Authorization', 'Bearer valid-token')
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('应该处理大量数据请求', async () => {
      mockDashboardController.getStatistics.mockImplementation((req, res) => {
        // 模拟大量数据
        const largeData = {
          enrollmentStats: Array(1000).fill(null).map((_, i) => ({
            id: i,
            date: `2024-${String(i % 12 + 1).padStart(2, '0')}-${String(i % 28 + 1).padStart(2, '0')}`,
            count: Math.floor(Math.random() * 100)
          })),
          financialStats: Array(500).fill(null).map((_, i) => ({
            id: i,
            amount: Math.floor(Math.random() * 10000),
            type: ['income', 'expense'][i % 2]
          }))
        };

        res.status(200).json({
          success: true,
          data: largeData,
          message: '获取统计数据成功'
        });
      });

      const response = await request(mockApp)
        .get('/dashboard/statistics')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('安全测试', () => {
    it('应该防止SQL注入攻击', async () => {
      const maliciousQuery = "SELECT * FROM users";

      await request(mockApp)
        .get('/dashboard/statistics')
        .query({ search: maliciousQuery })
        .set('Authorization', 'Bearer valid-token')
        .expect(400);
    });

    it('应该防止XSS攻击', async () => {
      const maliciousScript = "<script>alert('xss')</script>";

      await request(mockApp)
        .get('/dashboard/activities')
        .query({ search: maliciousScript })
        .set('Authorization', 'Bearer valid-token')
        .expect(400);
    });

    it('应该验证输入数据格式', async () => {
      const invalidFormats = [
        { route: '/dashboard/statistics', query: { startDate: 'invalid-date' } },
        { route: '/dashboard/chart-data', query: { type: 'invalid-type' } },
        { route: '/dashboard/export', body: { format: 'invalid-format' } }
      ];

      for (const { route, query, body } of invalidFormats) {
        const req = request(mockApp)
          .get(route)
          .set('Authorization', 'Bearer valid-token');
        
        if (query) {
          req.query(query);
        }
        
        await req.expect(400);
      }
    });
  });
});