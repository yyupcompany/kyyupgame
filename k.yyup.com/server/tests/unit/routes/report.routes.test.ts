import { jest } from '@jest/globals';
import { vi } from 'vitest'
import request from 'supertest';
import express from 'express';

// Mock controllers
const mockReportController = {
  getReports: jest.fn(),
  getReportById: jest.fn(),
  generateReport: jest.fn(),
  downloadReport: jest.fn(),
  deleteReport: jest.fn(),
  getReportTemplates: jest.fn(),
  createReportTemplate: jest.fn(),
  updateReportTemplate: jest.fn(),
  deleteReportTemplate: jest.fn(),
  scheduleReport: jest.fn(),
  getScheduledReports: jest.fn(),
  updateScheduledReport: jest.fn(),
  cancelScheduledReport: jest.fn(),
  getReportStatistics: jest.fn(),
  shareReport: jest.fn(),
  getSharedReports: jest.fn()
};

// Mock middlewares
const mockAuthMiddleware = {
  authenticate: jest.fn((req, res, next) => {
    req.user = {
      id: 1,
      email: 'admin@example.com',
      role: 'admin'
    };
    next();
  }),
  requireAuth: jest.fn((req, res, next) => next())
};

const mockPermissionMiddleware = {
  requirePermission: jest.fn(() => (req, res, next) => next()),
  requireRole: jest.fn(() => (req, res, next) => next()),
  checkResourceAccess: jest.fn(() => (req, res, next) => next())
};

const mockValidationMiddleware = {
  validateReportGeneration: jest.fn((req, res, next) => next()),
  validateReportTemplate: jest.fn((req, res, next) => next()),
  validateScheduleReport: jest.fn((req, res, next) => next()),
  validateQuery: jest.fn((req, res, next) => next())
};

const mockRateLimitMiddleware = {
  reportGenerationLimit: jest.fn((req, res, next) => next()),
  downloadLimit: jest.fn((req, res, next) => next())
};

// Mock imports
jest.unstable_mockModule('../../../../../src/controllers/report.controller', () => mockReportController);
jest.unstable_mockModule('../../../../../src/middlewares/auth.middleware', () => ({
jest.unstable_mockModule('../../../../../src/middlewares/validate.middleware', () => mockValidationMiddleware);
jest.unstable_mockModule('../../../../../src/middlewares/rate-limit.middleware', () => mockRateLimitMiddleware);


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

describe('Report Routes', () => {
  let app: express.Application;
  let reportRouter: any;

  beforeAll(async () => {
    // Import the router after mocking
    const imported = await import('../../../../../src/routes/report.routes');
    reportRouter = imported.default || imported.reportRouter;

    // Create Express app and use the router
    app = express();
    app.use(express.json());
    app.use('/api/reports', reportRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/reports', () => {
    it('应该获取报告列表', async () => {
      const mockReports = [
        {
          id: 1,
          title: '学生出勤报告',
          type: 'attendance',
          status: 'completed',
          createdAt: '2024-04-15T10:00:00Z',
          generatedBy: '管理员'
        },
        {
          id: 2,
          title: '财务月报',
          type: 'financial',
          status: 'generating',
          createdAt: '2024-04-15T11:00:00Z',
          generatedBy: '财务主管'
        }
      ];

      mockReportController.getReports.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: mockReports,
          total: 2,
          page: 1,
          pageSize: 10
        });
      });

      const response = await request(app)
        .get('/api/reports')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockReports,
        total: 2,
        page: 1,
        pageSize: 10
      });
      expect(mockAuthMiddleware.authenticate).toHaveBeenCalled();
      expect(mockPermissionMiddleware.requirePermission).toHaveBeenCalledWith('report:read');
      expect(mockReportController.getReports).toHaveBeenCalled();
    });

    it('应该支持筛选和搜索', async () => {
      mockReportController.getReports.mockImplementation((req, res) => {
        expect(req.query).toEqual({
          type: 'attendance',
          status: 'completed',
          startDate: '2024-04-01',
          endDate: '2024-04-30',
          search: '出勤',
          page: '1',
          pageSize: '20'
        });
        res.status(200).json({
          success: true,
          data: [],
          total: 0
        });
      });

      await request(app)
        .get('/api/reports')
        .query({
          type: 'attendance',
          status: 'completed',
          startDate: '2024-04-01',
          endDate: '2024-04-30',
          search: '出勤',
          page: 1,
          pageSize: 20
        })
        .expect(200);

      expect(mockValidationMiddleware.validateQuery).toHaveBeenCalled();
    });
  });

  describe('GET /api/reports/:id', () => {
    it('应该获取指定报告详情', async () => {
      const mockReport = {
        id: 1,
        title: '学生出勤报告',
        type: 'attendance',
        status: 'completed',
        parameters: {
          dateRange: {
            start: '2024-04-01',
            end: '2024-04-30'
          },
          classes: [1, 2, 3]
        },
        data: {
          totalStudents: 120,
          averageAttendance: 0.95,
          details: []
        },
        createdAt: '2024-04-15T10:00:00Z',
        completedAt: '2024-04-15T10:05:00Z',
        generatedBy: '管理员'
      };

      mockReportController.getReportById.mockImplementation((req, res) => {
        expect(req.params.id).toBe('1');
        res.status(200).json({
          success: true,
          data: mockReport
        });
      });

      const response = await request(app)
        .get('/api/reports/1')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockReport
      });
      expect(mockPermissionMiddleware.checkResourceAccess).toHaveBeenCalled();
    });

    it('应该处理报告不存在的情况', async () => {
      mockReportController.getReportById.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          error: '报告不存在'
        });
      });

      const response = await request(app)
        .get('/api/reports/999')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: '报告不存在'
      });
    });
  });

  describe('POST /api/reports/generate', () => {
    it('应该生成新报告', async () => {
      const reportData = {
        title: '自定义学生报告',
        type: 'student',
        templateId: 1,
        parameters: {
          dateRange: {
            start: '2024-04-01',
            end: '2024-04-30'
          },
          studentIds: [1, 2, 3],
          includeGrades: true,
          includeAttendance: true,
          includeActivities: false
        },
        format: 'pdf',
        schedule: null
      };

      const mockGeneratedReport = {
        id: 3,
        title: '自定义学生报告',
        type: 'student',
        status: 'generating',
        parameters: reportData.parameters,
        format: 'pdf',
        estimatedCompletionTime: '2024-04-15T10:10:00Z',
        createdAt: '2024-04-15T10:00:00Z',
        generatedBy: '管理员'
      };

      mockReportController.generateReport.mockImplementation((req, res) => {
        expect(req.body).toEqual(reportData);
        res.status(202).json({
          success: true,
          data: mockGeneratedReport,
          message: '报告生成中，请稍后查看'
        });
      });

      const response = await request(app)
        .post('/api/reports/generate')
        .send(reportData)
        .expect(202);

      expect(response.body).toEqual({
        success: true,
        data: mockGeneratedReport,
        message: '报告生成中，请稍后查看'
      });
      expect(mockPermissionMiddleware.requirePermission).toHaveBeenCalledWith('report:generate');
      expect(mockValidationMiddleware.validateReportGeneration).toHaveBeenCalled();
      expect(mockRateLimitMiddleware.reportGenerationLimit).toHaveBeenCalled();
    });

    it('应该验证报告生成参数', async () => {
      const invalidData = {
        title: '', // 空标题
        type: 'invalid_type', // 无效类型
        parameters: {} // 缺少必需参数
      };

      mockValidationMiddleware.validateReportGeneration.mockImplementation((req, res, next) => {
        res.status(400).json({
          success: false,
          error: '验证失败',
          details: [
            '报告标题不能为空',
            '报告类型无效',
            '缺少必需的参数'
          ]
        });
      });

      const response = await request(app)
        .post('/api/reports/generate')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('验证失败');
    });

    it('应该处理生成限流', async () => {
      const reportData = {
        title: '测试报告',
        type: 'student',
        parameters: {}
      };

      mockRateLimitMiddleware.reportGenerationLimit.mockImplementation((req, res, next) => {
        res.status(429).json({
          success: false,
          error: '生成频率过高',
          message: '请稍后再试',
          retryAfter: 60
        });
      });

      const response = await request(app)
        .post('/api/reports/generate')
        .send(reportData)
        .expect(429);

      expect(response.body.error).toBe('生成频率过高');
      expect(response.body.retryAfter).toBe(60);
    });
  });

  describe('GET /api/reports/:id/download', () => {
    it('应该下载完成的报告', async () => {
      mockReportController.downloadReport.mockImplementation((req, res) => {
        expect(req.params.id).toBe('1');
        res.status(200);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="report_1.pdf"');
        res.send(Buffer.from('PDF content'));
      });

      const response = await request(app)
        .get('/api/reports/1/download')
        .expect(200);

      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(mockRateLimitMiddleware.downloadLimit).toHaveBeenCalled();
    });

    it('应该处理报告未完成的情况', async () => {
      mockReportController.downloadReport.mockImplementation((req, res) => {
        res.status(409).json({
          success: false,
          error: '报告尚未生成完成',
          status: 'generating',
          progress: 75
        });
      });

      const response = await request(app)
        .get('/api/reports/2/download')
        .expect(409);

      expect(response.body.error).toBe('报告尚未生成完成');
      expect(response.body.progress).toBe(75);
    });

    it('应该处理下载限流', async () => {
      mockRateLimitMiddleware.downloadLimit.mockImplementation((req, res, next) => {
        res.status(429).json({
          success: false,
          error: '下载频率过高',
          message: '请稍后再试'
        });
      });

      const response = await request(app)
        .get('/api/reports/1/download')
        .expect(429);

      expect(response.body.error).toBe('下载频率过高');
    });
  });

  describe('DELETE /api/reports/:id', () => {
    it('应该删除报告', async () => {
      mockReportController.deleteReport.mockImplementation((req, res) => {
        expect(req.params.id).toBe('1');
        res.status(200).json({
          success: true,
          message: '报告删除成功'
        });
      });

      const response = await request(app)
        .delete('/api/reports/1')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '报告删除成功'
      });
      expect(mockPermissionMiddleware.requirePermission).toHaveBeenCalledWith('report:delete');
    });

    it('应该要求管理员权限删除他人报告', async () => {
      mockPermissionMiddleware.checkResourceAccess.mockImplementation(() => (req, res, next) => {
        res.status(403).json({
          success: false,
          error: '权限不足',
          message: '只能删除自己创建的报告或需要管理员权限'
        });
      });

      const response = await request(app)
        .delete('/api/reports/1')
        .expect(403);

      expect(response.body.message).toBe('只能删除自己创建的报告或需要管理员权限');
    });
  });

  describe('GET /api/reports/templates', () => {
    it('应该获取报告模板列表', async () => {
      const mockTemplates = [
        {
          id: 1,
          name: '学生出勤模板',
          type: 'attendance',
          description: '用于生成学生出勤统计报告',
          parameters: [
            { name: 'dateRange', type: 'dateRange', required: true },
            { name: 'classes', type: 'array', required: false }
          ],
          isActive: true
        },
        {
          id: 2,
          name: '财务报表模板',
          type: 'financial',
          description: '用于生成财务收支报表',
          parameters: [
            { name: 'period', type: 'string', required: true },
            { name: 'includeDetails', type: 'boolean', required: false }
          ],
          isActive: true
        }
      ];

      mockReportController.getReportTemplates.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: mockTemplates
        });
      });

      const response = await request(app)
        .get('/api/reports/templates')
        .expect(200);

      expect(response.body.data).toEqual(mockTemplates);
      expect(mockPermissionMiddleware.requirePermission).toHaveBeenCalledWith('report:read');
    });

    it('应该支持按类型筛选模板', async () => {
      mockReportController.getReportTemplates.mockImplementation((req, res) => {
        expect(req.query.type).toBe('attendance');
        res.status(200).json({
          success: true,
          data: []
        });
      });

      await request(app)
        .get('/api/reports/templates')
        .query({ type: 'attendance' })
        .expect(200);
    });
  });

  describe('POST /api/reports/templates', () => {
    it('应该创建报告模板', async () => {
      const templateData = {
        name: '自定义学生报告模板',
        type: 'student',
        description: '包含成绩、出勤、活动的综合学生报告',
        parameters: [
          { name: 'studentIds', type: 'array', required: true },
          { name: 'includeGrades', type: 'boolean', required: false, default: true },
          { name: 'includeAttendance', type: 'boolean', required: false, default: true }
        ],
        template: {
          sections: ['header', 'grades', 'attendance', 'activities', 'footer'],
          styling: { theme: 'default', colors: ['#333', '#666'] }
        },
        isActive: true
      };

      const mockCreatedTemplate = {
        id: 3,
        ...templateData,
        createdAt: '2024-04-15T10:00:00Z',
        createdBy: '管理员'
      };

      mockReportController.createReportTemplate.mockImplementation((req, res) => {
        expect(req.body).toEqual(templateData);
        res.status(201).json({
          success: true,
          data: mockCreatedTemplate,
          message: '报告模板创建成功'
        });
      });

      const response = await request(app)
        .post('/api/reports/templates')
        .send(templateData)
        .expect(201);

      expect(response.body.data).toEqual(mockCreatedTemplate);
      expect(mockPermissionMiddleware.requirePermission).toHaveBeenCalledWith('report:template:write');
      expect(mockValidationMiddleware.validateReportTemplate).toHaveBeenCalled();
    });
  });

  describe('PUT /api/reports/templates/:id', () => {
    it('应该更新报告模板', async () => {
      const updateData = {
        name: '更新的学生报告模板',
        description: '更新的描述',
        parameters: [
          { name: 'studentIds', type: 'array', required: true },
          { name: 'includeGrades', type: 'boolean', required: false, default: false }
        ]
      };

      const mockUpdatedTemplate = {
        id: 1,
        name: '更新的学生报告模板',
        type: 'student',
        description: '更新的描述',
        parameters: updateData.parameters,
        updatedAt: '2024-04-15T11:00:00Z'
      };

      mockReportController.updateReportTemplate.mockImplementation((req, res) => {
        expect(req.params.id).toBe('1');
        expect(req.body).toEqual(updateData);
        res.status(200).json({
          success: true,
          data: mockUpdatedTemplate,
          message: '报告模板更新成功'
        });
      });

      const response = await request(app)
        .put('/api/reports/templates/1')
        .send(updateData)
        .expect(200);

      expect(response.body.data).toEqual(mockUpdatedTemplate);
    });
  });

  describe('DELETE /api/reports/templates/:id', () => {
    it('应该删除报告模板', async () => {
      mockReportController.deleteReportTemplate.mockImplementation((req, res) => {
        expect(req.params.id).toBe('1');
        res.status(200).json({
          success: true,
          message: '报告模板删除成功'
        });
      });

      const response = await request(app)
        .delete('/api/reports/templates/1')
        .expect(200);

      expect(response.body.message).toBe('报告模板删除成功');
      expect(mockPermissionMiddleware.requirePermission).toHaveBeenCalledWith('report:template:delete');
    });
  });

  describe('POST /api/reports/schedule', () => {
    it('应该创建定时报告', async () => {
      const scheduleData = {
        name: '每月出勤报告',
        templateId: 1,
        parameters: {
          dateRange: 'last_month',
          classes: 'all'
        },
        schedule: {
          type: 'monthly',
          dayOfMonth: 1,
          time: '09:00'
        },
        recipients: ['admin@example.com', 'teacher@example.com'],
        format: 'pdf',
        isActive: true
      };

      const mockScheduledReport = {
        id: 1,
        ...scheduleData,
        nextRunTime: '2024-05-01T09:00:00Z',
        createdAt: '2024-04-15T10:00:00Z',
        createdBy: '管理员'
      };

      mockReportController.scheduleReport.mockImplementation((req, res) => {
        expect(req.body).toEqual(scheduleData);
        res.status(201).json({
          success: true,
          data: mockScheduledReport,
          message: '定时报告创建成功'
        });
      });

      const response = await request(app)
        .post('/api/reports/schedule')
        .send(scheduleData)
        .expect(201);

      expect(response.body.data).toEqual(mockScheduledReport);
      expect(mockPermissionMiddleware.requirePermission).toHaveBeenCalledWith('report:schedule');
      expect(mockValidationMiddleware.validateScheduleReport).toHaveBeenCalled();
    });
  });

  describe('GET /api/reports/scheduled', () => {
    it('应该获取定时报告列表', async () => {
      const mockScheduledReports = [
        {
          id: 1,
          name: '每月出勤报告',
          templateId: 1,
          templateName: '学生出勤模板',
          schedule: { type: 'monthly', dayOfMonth: 1, time: '09:00' },
          nextRunTime: '2024-05-01T09:00:00Z',
          lastRunTime: '2024-04-01T09:00:00Z',
          isActive: true
        }
      ];

      mockReportController.getScheduledReports.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: mockScheduledReports,
          total: 1
        });
      });

      const response = await request(app)
        .get('/api/reports/scheduled')
        .expect(200);

      expect(response.body.data).toEqual(mockScheduledReports);
    });
  });

  describe('POST /api/reports/:id/share', () => {
    it('应该分享报告', async () => {
      const shareData = {
        recipients: ['parent@example.com', 'teacher@example.com'],
        message: '请查看最新的学生报告',
        expiresAt: '2024-04-30T23:59:59Z',
        allowDownload: true
      };

      const mockShareResult = {
        shareId: 'share_123',
        shareUrl: 'https://example.com/shared/reports/share_123',
        recipients: shareData.recipients,
        expiresAt: shareData.expiresAt,
        createdAt: '2024-04-15T10:00:00Z'
      };

      mockReportController.shareReport.mockImplementation((req, res) => {
        expect(req.params.id).toBe('1');
        expect(req.body).toEqual(shareData);
        res.status(200).json({
          success: true,
          data: mockShareResult,
          message: '报告分享成功'
        });
      });

      const response = await request(app)
        .post('/api/reports/1/share')
        .send(shareData)
        .expect(200);

      expect(response.body.data).toEqual(mockShareResult);
      expect(mockPermissionMiddleware.requirePermission).toHaveBeenCalledWith('report:share');
    });
  });

  describe('GET /api/reports/statistics', () => {
    it('应该获取报告统计信息', async () => {
      const mockStatistics = {
        totalReports: 150,
        completedReports: 140,
        failedReports: 5,
        generatingReports: 5,
        byType: [
          { type: 'attendance', count: 60 },
          { type: 'financial', count: 40 },
          { type: 'student', count: 30 },
          { type: 'activity', count: 20 }
        ],
        byStatus: [
          { status: 'completed', count: 140 },
          { status: 'generating', count: 5 },
          { status: 'failed', count: 5 }
        ],
        generationTrend: [
          { date: '2024-04-01', count: 5 },
          { date: '2024-04-02', count: 8 },
          { date: '2024-04-03', count: 6 }
        ],
        averageGenerationTime: 120, // seconds
        mostPopularTemplates: [
          { templateId: 1, templateName: '学生出勤模板', count: 45 },
          { templateId: 2, templateName: '财务报表模板', count: 30 }
        ]
      };

      mockReportController.getReportStatistics.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: mockStatistics
        });
      });

      const response = await request(app)
        .get('/api/reports/statistics')
        .expect(200);

      expect(response.body.data).toEqual(mockStatistics);
      expect(mockPermissionMiddleware.requirePermission).toHaveBeenCalledWith('report:statistics');
    });

    it('应该支持日期范围筛选', async () => {
      mockReportController.getReportStatistics.mockImplementation((req, res) => {
        expect(req.query).toEqual({
          startDate: '2024-04-01',
          endDate: '2024-04-30'
        });
        res.status(200).json({
          success: true,
          data: {}
        });
      });

      await request(app)
        .get('/api/reports/statistics')
        .query({
          startDate: '2024-04-01',
          endDate: '2024-04-30'
        })
        .expect(200);
    });
  });

  describe('权限控制', () => {
    it('应该要求认证才能访问', async () => {
      mockAuthMiddleware.authenticate.mockImplementation((req, res, next) => {
        res.status(401).json({
          success: false,
          error: '未认证',
          message: '请先登录'
        });
      });

      const response = await request(app)
        .get('/api/reports')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('应该检查报告访问权限', async () => {
      mockPermissionMiddleware.checkResourceAccess.mockImplementation(() => (req, res, next) => {
        res.status(403).json({
          success: false,
          error: '权限不足',
          message: '您没有访问此报告的权限'
        });
      });

      const response = await request(app)
        .get('/api/reports/1')
        .expect(403);

      expect(response.body.message).toBe('您没有访问此报告的权限');
    });

    it('应该限制模板管理权限', async () => {
      mockPermissionMiddleware.requirePermission.mockImplementation(() => (req, res, next) => {
        res.status(403).json({
          success: false,
          error: '权限不足',
          message: '只有管理员可以管理报告模板'
        });
      });

      const response = await request(app)
        .post('/api/reports/templates')
        .send({})
        .expect(403);

      expect(response.body.message).toBe('只有管理员可以管理报告模板');
    });
  });

  describe('错误处理', () => {
    it('应该处理控制器错误', async () => {
      mockReportController.getReports.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          error: '服务器内部错误',
          message: '获取报告列表失败'
        });
      });

      const response = await request(app)
        .get('/api/reports')
        .expect(500);

      expect(response.body.success).toBe(false);
    });

    it('应该处理验证错误', async () => {
      mockValidationMiddleware.validateReportGeneration.mockImplementation((req, res, next) => {
        res.status(400).json({
          success: false,
          error: '验证失败',
          details: {
            title: '报告标题不能为空',
            type: '报告类型无效',
            parameters: '缺少必需的参数'
          }
        });
      });

      const response = await request(app)
        .post('/api/reports/generate')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('验证失败');
      expect(response.body.details).toBeDefined();
    });

    it('应该处理报告生成失败', async () => {
      const reportData = {
        title: '测试报告',
        type: 'student',
        parameters: {}
      };

      mockReportController.generateReport.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          error: '报告生成失败',
          message: '数据源不可用或参数错误'
        });
      });

      const response = await request(app)
        .post('/api/reports/generate')
        .send(reportData)
        .expect(500);

      expect(response.body.message).toBe('数据源不可用或参数错误');
    });
  });
});
