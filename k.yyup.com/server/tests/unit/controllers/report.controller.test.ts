import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock Request and Response objects
const createMockRequest = (overrides = {}) => ({
  user: { id: 1, role: 'admin' },
  params: {},
  query: {},
  body: {},
  ...overrides
});

const createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    attachment: jest.fn().mockReturnThis()
  };
  return res;
};

const mockNext = jest.fn();

// Mock services
const mockReportService = {
  generateStudentReport: jest.fn(),
  generateTeacherReport: jest.fn(),
  generateClassReport: jest.fn(),
  generateActivityReport: jest.fn(),
  generateFinancialReport: jest.fn(),
  generateAttendanceReport: jest.fn(),
  generateEnrollmentReport: jest.fn(),
  generateCustomReport: jest.fn(),
  getReportList: jest.fn(),
  getReportById: jest.fn(),
  deleteReport: jest.fn(),
  scheduleReport: jest.fn(),
  cancelScheduledReport: jest.fn(),
  getReportTemplates: jest.fn(),
  createReportTemplate: jest.fn(),
  updateReportTemplate: jest.fn(),
  deleteReportTemplate: jest.fn(),
  exportReport: jest.fn(),
  shareReport: jest.fn()
};

// Mock imports
jest.unstable_mockModule('../../../../../src/services/report.service', () => mockReportService);


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

describe('Report Controller', () => {
  let reportController: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/controllers/report.controller');
    reportController = imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateStudentReport', () => {
    it('应该成功生成学生报告', async () => {
      const req = createMockRequest({
        body: {
          studentIds: [1, 2, 3],
          reportType: 'academic_performance',
          dateRange: {
            startDate: '2024-01-01',
            endDate: '2024-06-30'
          },
          includeDetails: true
        }
      });
      const res = createMockResponse();

      const mockReport = {
        id: 1,
        title: '学生学业表现报告',
        type: 'student_report',
        status: 'completed',
        data: {
          totalStudents: 3,
          averageScore: 85.5,
          students: [
            { id: 1, name: '张三', averageScore: 88 },
            { id: 2, name: '李四', averageScore: 82 },
            { id: 3, name: '王五', averageScore: 87 }
          ]
        },
        generatedAt: new Date(),
        filePath: '/reports/student_report_1.pdf'
      };

      mockReportService.generateStudentReport.mockResolvedValue(mockReport);

      await reportController.generateStudentReport(req, res, mockNext);

      expect(mockReportService.generateStudentReport).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '学生报告生成成功',
        data: mockReport
      });
    });

    it('应该处理生成报告时的错误', async () => {
      const req = createMockRequest({
        body: { studentIds: [1, 2, 3] }
      });
      const res = createMockResponse();

      const error = new Error('生成失败');
      mockReportService.generateStudentReport.mockRejectedValue(error);

      await reportController.generateStudentReport(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('generateTeacherReport', () => {
    it('应该成功生成教师报告', async () => {
      const req = createMockRequest({
        body: {
          teacherIds: [1, 2],
          reportType: 'performance_evaluation',
          dateRange: {
            startDate: '2024-01-01',
            endDate: '2024-06-30'
          }
        }
      });
      const res = createMockResponse();

      const mockReport = {
        id: 2,
        title: '教师绩效评估报告',
        type: 'teacher_report',
        status: 'completed',
        data: {
          totalTeachers: 2,
          averageRating: 4.2,
          teachers: [
            { id: 1, name: '张老师', rating: 4.5 },
            { id: 2, name: '李老师', rating: 3.9 }
          ]
        },
        generatedAt: new Date()
      };

      mockReportService.generateTeacherReport.mockResolvedValue(mockReport);

      await reportController.generateTeacherReport(req, res, mockNext);

      expect(mockReportService.generateTeacherReport).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '教师报告生成成功',
        data: mockReport
      });
    });
  });

  describe('generateClassReport', () => {
    it('应该成功生成班级报告', async () => {
      const req = createMockRequest({
        body: {
          classIds: [1, 2],
          reportType: 'class_overview',
          includeStudents: true,
          includeActivities: true
        }
      });
      const res = createMockResponse();

      const mockReport = {
        id: 3,
        title: '班级概况报告',
        type: 'class_report',
        status: 'completed',
        data: {
          totalClasses: 2,
          totalStudents: 45,
          classes: [
            {
              id: 1,
              name: '小班A',
              studentCount: 20,
              teacherCount: 2,
              activities: 5
            },
            {
              id: 2,
              name: '小班B',
              studentCount: 25,
              teacherCount: 2,
              activities: 6
            }
          ]
        },
        generatedAt: new Date()
      };

      mockReportService.generateClassReport.mockResolvedValue(mockReport);

      await reportController.generateClassReport(req, res, mockNext);

      expect(mockReportService.generateClassReport).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '班级报告生成成功',
        data: mockReport
      });
    });
  });

  describe('generateActivityReport', () => {
    it('应该成功生成活动报告', async () => {
      const req = createMockRequest({
        body: {
          activityIds: [1, 2, 3],
          reportType: 'participation_analysis',
          dateRange: {
            startDate: '2024-01-01',
            endDate: '2024-06-30'
          }
        }
      });
      const res = createMockResponse();

      const mockReport = {
        id: 4,
        title: '活动参与分析报告',
        type: 'activity_report',
        status: 'completed',
        data: {
          totalActivities: 3,
          totalParticipants: 120,
          averageParticipation: 0.85,
          activities: [
            { id: 1, name: '春游', participants: 45, satisfaction: 4.8 },
            { id: 2, name: '运动会', participants: 38, satisfaction: 4.6 },
            { id: 3, name: '艺术节', participants: 37, satisfaction: 4.9 }
          ]
        },
        generatedAt: new Date()
      };

      mockReportService.generateActivityReport.mockResolvedValue(mockReport);

      await reportController.generateActivityReport(req, res, mockNext);

      expect(mockReportService.generateActivityReport).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '活动报告生成成功',
        data: mockReport
      });
    });
  });

  describe('generateFinancialReport', () => {
    it('应该成功生成财务报告', async () => {
      const req = createMockRequest({
        body: {
          reportType: 'monthly_summary',
          dateRange: {
            startDate: '2024-01-01',
            endDate: '2024-01-31'
          },
          includeDetails: true
        }
      });
      const res = createMockResponse();

      const mockReport = {
        id: 5,
        title: '月度财务汇总报告',
        type: 'financial_report',
        status: 'completed',
        data: {
          totalIncome: 150000,
          totalExpense: 120000,
          netProfit: 30000,
          incomeBreakdown: {
            tuition: 120000,
            activities: 20000,
            other: 10000
          },
          expenseBreakdown: {
            salaries: 80000,
            utilities: 15000,
            supplies: 25000
          }
        },
        generatedAt: new Date()
      };

      mockReportService.generateFinancialReport.mockResolvedValue(mockReport);

      await reportController.generateFinancialReport(req, res, mockNext);

      expect(mockReportService.generateFinancialReport).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '财务报告生成成功',
        data: mockReport
      });
    });
  });

  describe('generateAttendanceReport', () => {
    it('应该成功生成考勤报告', async () => {
      const req = createMockRequest({
        body: {
          targetType: 'student',
          targetIds: [1, 2, 3],
          dateRange: {
            startDate: '2024-01-01',
            endDate: '2024-01-31'
          }
        }
      });
      const res = createMockResponse();

      const mockReport = {
        id: 6,
        title: '学生考勤报告',
        type: 'attendance_report',
        status: 'completed',
        data: {
          totalDays: 20,
          averageAttendance: 0.92,
          students: [
            { id: 1, name: '张三', attendanceDays: 19, attendanceRate: 0.95 },
            { id: 2, name: '李四', attendanceDays: 18, attendanceRate: 0.90 },
            { id: 3, name: '王五', attendanceDays: 18, attendanceRate: 0.90 }
          ]
        },
        generatedAt: new Date()
      };

      mockReportService.generateAttendanceReport.mockResolvedValue(mockReport);

      await reportController.generateAttendanceReport(req, res, mockNext);

      expect(mockReportService.generateAttendanceReport).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '考勤报告生成成功',
        data: mockReport
      });
    });
  });

  describe('generateEnrollmentReport', () => {
    it('应该成功生成招生报告', async () => {
      const req = createMockRequest({
        body: {
          reportType: 'enrollment_analysis',
          academicYear: '2024-2025',
          includeProjections: true
        }
      });
      const res = createMockResponse();

      const mockReport = {
        id: 7,
        title: '招生分析报告',
        type: 'enrollment_report',
        status: 'completed',
        data: {
          totalApplications: 200,
          totalEnrollments: 150,
          enrollmentRate: 0.75,
          ageGroups: [
            { age: 3, applications: 50, enrollments: 40 },
            { age: 4, applications: 80, enrollments: 60 },
            { age: 5, applications: 70, enrollments: 50 }
          ],
          projections: {
            nextYear: 180,
            confidence: 0.85
          }
        },
        generatedAt: new Date()
      };

      mockReportService.generateEnrollmentReport.mockResolvedValue(mockReport);

      await reportController.generateEnrollmentReport(req, res, mockNext);

      expect(mockReportService.generateEnrollmentReport).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '招生报告生成成功',
        data: mockReport
      });
    });
  });

  describe('generateCustomReport', () => {
    it('应该成功生成自定义报告', async () => {
      const req = createMockRequest({
        body: {
          templateId: 1,
          parameters: {
            dateRange: {
              startDate: '2024-01-01',
              endDate: '2024-06-30'
            },
            filters: {
              kindergartenId: 1,
              classIds: [1, 2]
            }
          },
          format: 'pdf'
        }
      });
      const res = createMockResponse();

      const mockReport = {
        id: 8,
        title: '自定义报告',
        type: 'custom_report',
        status: 'completed',
        templateId: 1,
        data: {
          summary: '根据模板生成的自定义报告',
          charts: [
            { type: 'bar', data: [10, 20, 30] },
            { type: 'pie', data: [40, 30, 30] }
          ]
        },
        generatedAt: new Date(),
        filePath: '/reports/custom_report_8.pdf'
      };

      mockReportService.generateCustomReport.mockResolvedValue(mockReport);

      await reportController.generateCustomReport(req, res, mockNext);

      expect(mockReportService.generateCustomReport).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '自定义报告生成成功',
        data: mockReport
      });
    });
  });

  describe('getReportList', () => {
    it('应该获取报告列表', async () => {
      const req = createMockRequest({
        query: {
          page: '1',
          pageSize: '10',
          type: 'student_report',
          status: 'completed'
        }
      });
      const res = createMockResponse();

      const mockResult = {
        reports: [
          {
            id: 1,
            title: '学生报告1',
            type: 'student_report',
            status: 'completed',
            generatedAt: new Date()
          },
          {
            id: 2,
            title: '学生报告2',
            type: 'student_report',
            status: 'completed',
            generatedAt: new Date()
          }
        ],
        total: 2,
        page: 1,
        pageSize: 10
      };

      mockReportService.getReportList.mockResolvedValue(mockResult);

      await reportController.getReportList(req, res, mockNext);

      expect(mockReportService.getReportList).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        type: 'student_report',
        status: 'completed'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult
      });
    });
  });

  describe('getReportById', () => {
    it('应该获取指定报告详情', async () => {
      const req = createMockRequest({
        params: { id: '1' }
      });
      const res = createMockResponse();

      const mockReport = {
        id: 1,
        title: '学生学业表现报告',
        type: 'student_report',
        status: 'completed',
        data: {
          totalStudents: 3,
          averageScore: 85.5
        },
        generatedAt: new Date(),
        filePath: '/reports/student_report_1.pdf'
      };

      mockReportService.getReportById.mockResolvedValue(mockReport);

      await reportController.getReportById(req, res, mockNext);

      expect(mockReportService.getReportById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockReport
      });
    });

    it('应该处理报告不存在的情况', async () => {
      const req = createMockRequest({
        params: { id: '999' }
      });
      const res = createMockResponse();

      mockReportService.getReportById.mockResolvedValue(null);

      await reportController.getReportById(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '报告不存在'
      });
    });
  });

  describe('deleteReport', () => {
    it('应该成功删除报告', async () => {
      const req = createMockRequest({
        params: { id: '1' }
      });
      const res = createMockResponse();

      mockReportService.deleteReport.mockResolvedValue(undefined);

      await reportController.deleteReport(req, res, mockNext);

      expect(mockReportService.deleteReport).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '报告删除成功'
      });
    });

    it('应该处理删除不存在的报告', async () => {
      const req = createMockRequest({
        params: { id: '999' }
      });
      const res = createMockResponse();

      mockReportService.deleteReport.mockResolvedValue(undefined);

      await reportController.deleteReport(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '报告不存在'
      });
    });
  });

  describe('scheduleReport', () => {
    it('应该成功安排定时报告', async () => {
      const req = createMockRequest({
        body: {
          templateId: 1,
          schedule: {
            frequency: 'monthly',
            dayOfMonth: 1,
            time: '09:00'
          },
          recipients: ['admin@example.com', 'manager@example.com']
        }
      });
      const res = createMockResponse();

      const mockScheduledReport = {
        id: 1,
        templateId: 1,
        schedule: {
          frequency: 'monthly',
          dayOfMonth: 1,
          time: '09:00'
        },
        nextRunAt: new Date('2024-05-01T09:00:00Z'),
        status: 'active'
      };

      mockReportService.scheduleReport.mockResolvedValue(mockScheduledReport);

      await reportController.scheduleReport(req, res, mockNext);

      expect(mockReportService.scheduleReport).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '定时报告安排成功',
        data: mockScheduledReport
      });
    });
  });

  describe('exportReport', () => {
    it('应该成功导出报告', async () => {
      const req = createMockRequest({
        params: { id: '1' },
        query: { format: 'excel' }
      });
      const res = createMockResponse();

      const mockExportResult = {
        filename: 'student_report_1.xlsx',
        path: '/exports/student_report_1.xlsx',
        size: 2048000
      };

      mockReportService.exportReport.mockResolvedValue(mockExportResult);

      await reportController.exportReport(req, res, mockNext);

      expect(mockReportService.exportReport).toHaveBeenCalledWith(1, 'excel');
      expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename=student_report_1.xlsx');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '报告导出成功',
        data: mockExportResult
      });
    });
  });

  describe('shareReport', () => {
    it('应该成功分享报告', async () => {
      const req = createMockRequest({
        params: { id: '1' },
        body: {
          recipients: ['user1@example.com', 'user2@example.com'],
          message: '请查看附件中的报告',
          expiresAt: '2024-05-01T00:00:00Z'
        }
      });
      const res = createMockResponse();

      const mockShareResult = {
        shareId: 'share_123456',
        shareUrl: 'https://example.com/reports/share/share_123456',
        expiresAt: '2024-05-01T00:00:00Z',
        recipients: ['user1@example.com', 'user2@example.com']
      };

      mockReportService.shareReport.mockResolvedValue(mockShareResult);

      await reportController.shareReport(req, res, mockNext);

      expect(mockReportService.shareReport).toHaveBeenCalledWith(1, req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '报告分享成功',
        data: mockShareResult
      });
    });
  });

  describe('错误处理', () => {
    it('应该处理服务层抛出的错误', async () => {
      const req = createMockRequest();
      const res = createMockResponse();

      const error = new Error('服务错误');
      mockReportService.getReportList.mockRejectedValue(error);

      await reportController.getReportList(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('应该处理无效的参数', async () => {
      const req = createMockRequest({
        params: { id: 'invalid' }
      });
      const res = createMockResponse();

      await reportController.getReportById(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '无效的报告ID'
      });
    });
  });
});
