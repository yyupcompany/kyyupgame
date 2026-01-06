import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock models
const mockReport = {
  create: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  count: jest.fn()
};

const mockUser = {
  findAll: jest.fn(),
  findByPk: jest.fn()
};

const mockStudent = {
  findAll: jest.fn(),
  findByPk: jest.fn()
};

const mockTeacher = {
  findAll: jest.fn(),
  findByPk: jest.fn()
};

const mockActivity = {
  findAll: jest.fn(),
  findByPk: jest.fn()
};

const mockClass = {
  findAll: jest.fn(),
  findByPk: jest.fn()
};

const mockSequelize = {
  transaction: jest.fn(),
  literal: jest.fn(),
  fn: jest.fn(),
  col: jest.fn(),
  where: jest.fn(),
  Op: {
    between: Symbol('between'),
    gte: Symbol('gte'),
    lte: Symbol('lte'),
    like: Symbol('like'),
    in: Symbol('in')
  }
};

const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn()
};

// Mock external services
const mockExcelService = {
  createWorkbook: jest.fn(),
  addWorksheet: jest.fn(),
  saveWorkbook: jest.fn()
};

const mockPDFService = {
  generatePDF: jest.fn(),
  addPage: jest.fn(),
  savePDF: jest.fn()
};

const mockEmailService = {
  sendEmail: jest.fn(),
  sendBulkEmail: jest.fn()
};

// Mock imports
jest.unstable_mockModule('../../../../../src/models/report.model', () => ({
  Report: mockReport
}));

jest.unstable_mockModule('../../../../../src/models/user.model', () => ({
  User: mockUser
}));

jest.unstable_mockModule('../../../../../src/models/student.model', () => ({
  Student: mockStudent
}));

jest.unstable_mockModule('../../../../../src/models/teacher.model', () => ({
  Teacher: mockTeacher
}));

jest.unstable_mockModule('../../../../../src/models/activity.model', () => ({
  Activity: mockActivity
}));

jest.unstable_mockModule('../../../../../src/models/class.model', () => ({
  Class: mockClass
}));

jest.unstable_mockModule('../../../../../src/config/database', () => ({
  sequelize: mockSequelize
}));

jest.unstable_mockModule('../../../../../src/services/excel.service', () => mockExcelService);
jest.unstable_mockModule('../../../../../src/services/pdf.service', () => mockPDFService);
jest.unstable_mockModule('../../../../../src/services/email.service', () => mockEmailService);


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

describe('Report Service', () => {
  let reportService: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/services/report/report.service');
    reportService = imported.ReportService;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockSequelize.transaction.mockResolvedValue(mockTransaction);
  });

  describe('generateStudentReport', () => {
    it('应该成功生成学生报告', async () => {
      const reportData = {
        studentIds: [1, 2, 3],
        reportType: 'academic_performance',
        dateRange: {
          startDate: '2024-01-01',
          endDate: '2024-06-30'
        },
        includeDetails: true
      };

      const mockStudents = [
        {
          id: 1,
          name: '张三',
          age: 5,
          class: { name: '小班A' },
          grades: [
            { subject: '语言', score: 88 },
            { subject: '数学', score: 85 }
          ]
        },
        {
          id: 2,
          name: '李四',
          age: 4,
          class: { name: '小班B' },
          grades: [
            { subject: '语言', score: 82 },
            { subject: '数学', score: 80 }
          ]
        },
        {
          id: 3,
          name: '王五',
          age: 5,
          class: { name: '小班A' },
          grades: [
            { subject: '语言', score: 87 },
            { subject: '数学', score: 89 }
          ]
        }
      ];

      const mockCreatedReport = {
        id: 1,
        title: '学生学业表现报告',
        type: 'student_report',
        status: 'completed',
        data: {
          totalStudents: 3,
          averageScore: 85.5,
          students: mockStudents.map(s => ({
            id: s.id,
            name: s.name,
            averageScore: s.grades.reduce((sum, g) => sum + g.score, 0) / s.grades.length
          }))
        },
        generatedAt: new Date(),
        filePath: '/reports/student_report_1.pdf'
      };

      mockStudent.findAll.mockResolvedValue(mockStudents);
      mockReport.create.mockResolvedValue(mockCreatedReport);
      mockPDFService.generatePDF.mockResolvedValue('/reports/student_report_1.pdf');

      const result = await reportService.generateStudentReport(reportData);

      expect(mockStudent.findAll).toHaveBeenCalledWith({
        where: { id: { [mockSequelize.Op.in]: [1, 2, 3] } },
        include: expect.any(Array)
      });
      expect(mockReport.create).toHaveBeenCalled();
      expect(result).toEqual(mockCreatedReport);
    });

    it('应该处理空学生列表', async () => {
      const reportData = {
        studentIds: [999],
        reportType: 'academic_performance'
      };

      mockStudent.findAll.mockResolvedValue([]);

      await expect(reportService.generateStudentReport(reportData))
        .rejects.toThrow('未找到指定的学生');
    });

    it('应该处理生成报告时的错误', async () => {
      const reportData = {
        studentIds: [1, 2, 3],
        reportType: 'academic_performance'
      };

      const error = new Error('数据库错误');
      mockStudent.findAll.mockRejectedValue(error);

      await expect(reportService.generateStudentReport(reportData))
        .rejects.toThrow('数据库错误');
    });
  });

  describe('generateTeacherReport', () => {
    it('应该成功生成教师报告', async () => {
      const reportData = {
        teacherIds: [1, 2],
        reportType: 'performance_evaluation',
        dateRange: {
          startDate: '2024-01-01',
          endDate: '2024-06-30'
        }
      };

      const mockTeachers = [
        {
          id: 1,
          name: '张老师',
          subject: '语言',
          classes: [{ name: '小班A' }],
          evaluations: [
            { rating: 4.5, date: '2024-03-01' },
            { rating: 4.3, date: '2024-06-01' }
          ]
        },
        {
          id: 2,
          name: '李老师',
          subject: '数学',
          classes: [{ name: '小班B' }],
          evaluations: [
            { rating: 3.9, date: '2024-03-01' },
            { rating: 4.1, date: '2024-06-01' }
          ]
        }
      ];

      const mockCreatedReport = {
        id: 2,
        title: '教师绩效评估报告',
        type: 'teacher_report',
        status: 'completed',
        data: {
          totalTeachers: 2,
          averageRating: 4.2,
          teachers: mockTeachers.map(t => ({
            id: t.id,
            name: t.name,
            rating: t.evaluations.reduce((sum, e) => sum + e.rating, 0) / t.evaluations.length
          }))
        },
        generatedAt: new Date()
      };

      mockTeacher.findAll.mockResolvedValue(mockTeachers);
      mockReport.create.mockResolvedValue(mockCreatedReport);

      const result = await reportService.generateTeacherReport(reportData);

      expect(mockTeacher.findAll).toHaveBeenCalledWith({
        where: { id: { [mockSequelize.Op.in]: [1, 2] } },
        include: expect.any(Array)
      });
      expect(result).toEqual(mockCreatedReport);
    });
  });

  describe('generateClassReport', () => {
    it('应该成功生成班级报告', async () => {
      const reportData = {
        classIds: [1, 2],
        reportType: 'class_overview',
        includeStudents: true,
        includeActivities: true
      };

      const mockClasses = [
        {
          id: 1,
          name: '小班A',
          students: Array(20).fill(null).map((_, i) => ({ id: i + 1, name: `学生${i + 1}` })),
          teachers: [
            { id: 1, name: '张老师' },
            { id: 2, name: '李老师' }
          ],
          activities: Array(5).fill(null).map((_, i) => ({ id: i + 1, name: `活动${i + 1}` }))
        },
        {
          id: 2,
          name: '小班B',
          students: Array(25).fill(null).map((_, i) => ({ id: i + 21, name: `学生${i + 21}` })),
          teachers: [
            { id: 3, name: '王老师' },
            { id: 4, name: '赵老师' }
          ],
          activities: Array(6).fill(null).map((_, i) => ({ id: i + 6, name: `活动${i + 6}` }))
        }
      ];

      const mockCreatedReport = {
        id: 3,
        title: '班级概况报告',
        type: 'class_report',
        status: 'completed',
        data: {
          totalClasses: 2,
          totalStudents: 45,
          classes: mockClasses.map(c => ({
            id: c.id,
            name: c.name,
            studentCount: c.students.length,
            teacherCount: c.teachers.length,
            activities: c.activities.length
          }))
        },
        generatedAt: new Date()
      };

      mockClass.findAll.mockResolvedValue(mockClasses);
      mockReport.create.mockResolvedValue(mockCreatedReport);

      const result = await reportService.generateClassReport(reportData);

      expect(mockClass.findAll).toHaveBeenCalledWith({
        where: { id: { [mockSequelize.Op.in]: [1, 2] } },
        include: expect.any(Array)
      });
      expect(result).toEqual(mockCreatedReport);
    });
  });

  describe('generateActivityReport', () => {
    it('应该成功生成活动报告', async () => {
      const reportData = {
        activityIds: [1, 2, 3],
        reportType: 'participation_analysis',
        dateRange: {
          startDate: '2024-01-01',
          endDate: '2024-06-30'
        }
      };

      const mockActivities = [
        {
          id: 1,
          name: '春游',
          date: '2024-05-01',
          registrations: Array(45).fill(null).map((_, i) => ({
            id: i + 1,
            status: 'confirmed',
            feedback: { rating: 4.8 }
          }))
        },
        {
          id: 2,
          name: '运动会',
          date: '2024-05-15',
          registrations: Array(38).fill(null).map((_, i) => ({
            id: i + 46,
            status: 'confirmed',
            feedback: { rating: 4.6 }
          }))
        },
        {
          id: 3,
          name: '艺术节',
          date: '2024-06-01',
          registrations: Array(37).fill(null).map((_, i) => ({
            id: i + 84,
            status: 'confirmed',
            feedback: { rating: 4.9 }
          }))
        }
      ];

      const mockCreatedReport = {
        id: 4,
        title: '活动参与分析报告',
        type: 'activity_report',
        status: 'completed',
        data: {
          totalActivities: 3,
          totalParticipants: 120,
          averageParticipation: 0.85,
          activities: mockActivities.map(a => ({
            id: a.id,
            name: a.name,
            participants: a.registrations.length,
            satisfaction: a.registrations.reduce((sum, r) => sum + r.feedback.rating, 0) / a.registrations.length
          }))
        },
        generatedAt: new Date()
      };

      mockActivity.findAll.mockResolvedValue(mockActivities);
      mockReport.create.mockResolvedValue(mockCreatedReport);

      const result = await reportService.generateActivityReport(reportData);

      expect(mockActivity.findAll).toHaveBeenCalledWith({
        where: {
          id: { [mockSequelize.Op.in]: [1, 2, 3] },
          date: { [mockSequelize.Op.between]: ['2024-01-01', '2024-06-30'] }
        },
        include: expect.any(Array)
      });
      expect(result).toEqual(mockCreatedReport);
    });
  });

  describe('generateFinancialReport', () => {
    it('应该成功生成财务报告', async () => {
      const reportData = {
        reportType: 'monthly_summary',
        dateRange: {
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        },
        includeDetails: true
      };

      // Mock financial data
      const mockFinancialData = {
        income: [
          { category: 'tuition', amount: 120000 },
          { category: 'activities', amount: 20000 },
          { category: 'other', amount: 10000 }
        ],
        expenses: [
          { category: 'salaries', amount: 80000 },
          { category: 'utilities', amount: 15000 },
          { category: 'supplies', amount: 25000 }
        ]
      };

      const mockCreatedReport = {
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

      // Mock database queries for financial data
      mockSequelize.literal.mockReturnValue('SUM(amount)');
      mockReport.create.mockResolvedValue(mockCreatedReport);

      const result = await reportService.generateFinancialReport(reportData);

      expect(result).toEqual(mockCreatedReport);
    });
  });

  describe('getReportList', () => {
    it('应该获取报告列表', async () => {
      const queryOptions = {
        page: 1,
        pageSize: 10,
        type: 'student_report',
        status: 'completed'
      };

      const mockReports = [
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
      ];

      mockReport.findAll.mockResolvedValue(mockReports);
      mockReport.count.mockResolvedValue(2);

      const result = await reportService.getReportList(queryOptions);

      expect(mockReport.findAll).toHaveBeenCalledWith({
        where: {
          type: 'student_report',
          status: 'completed'
        },
        limit: 10,
        offset: 0,
        order: [['generatedAt', 'DESC']],
        include: expect.any(Array)
      });

      expect(result).toEqual({
        reports: mockReports,
        total: 2,
        page: 1,
        pageSize: 10
      });
    });

    it('应该支持搜索功能', async () => {
      const queryOptions = {
        page: 1,
        pageSize: 10,
        search: '学生'
      };

      mockReport.findAll.mockResolvedValue([]);
      mockReport.count.mockResolvedValue(0);

      await reportService.getReportList(queryOptions);

      expect(mockReport.findAll).toHaveBeenCalledWith({
        where: {
          title: { [mockSequelize.Op.like]: '%学生%' }
        },
        limit: 10,
        offset: 0,
        order: [['generatedAt', 'DESC']],
        include: expect.any(Array)
      });
    });
  });

  describe('getReportById', () => {
    it('应该获取指定报告详情', async () => {
      const reportId = 1;
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

      mockReport.findByPk.mockResolvedValue(mockReport);

      const result = await reportService.getReportById(reportId);

      expect(mockReport.findByPk).toHaveBeenCalledWith(reportId, {
        include: expect.any(Array)
      });
      expect(result).toEqual(mockReport);
    });

    it('应该在报告不存在时返回null', async () => {
      const reportId = 999;

      mockReport.findByPk.mockResolvedValue(null);

      const result = await reportService.getReportById(reportId);

      expect(result).toBeNull();
    });
  });

  describe('deleteReport', () => {
    it('应该成功删除报告', async () => {
      const reportId = 1;

      const mockExistingReport = {
        id: 1,
        status: 'completed',
        filePath: '/reports/student_report_1.pdf',
        destroy: jest.fn().mockResolvedValue(undefined)
      };

      mockReport.findByPk.mockResolvedValue(mockExistingReport);

      const result = await reportService.deleteReport(reportId);

      expect(mockReport.findByPk).toHaveBeenCalledWith(reportId);
      expect(mockExistingReport.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('应该在报告不存在时返回false', async () => {
      const reportId = 999;

      mockReport.findByPk.mockResolvedValue(null);

      const result = await reportService.deleteReport(reportId);

      expect(result).toBe(false);
    });

    it('应该阻止删除正在生成的报告', async () => {
      const reportId = 1;

      const mockGeneratingReport = {
        id: 1,
        status: 'generating'
      };

      mockReport.findByPk.mockResolvedValue(mockGeneratingReport);

      await expect(reportService.deleteReport(reportId))
        .rejects.toThrow('无法删除正在生成的报告');
    });
  });

  describe('exportReport', () => {
    it('应该成功导出报告为Excel格式', async () => {
      const reportId = 1;
      const format = 'excel';

      const mockReport = {
        id: 1,
        title: '学生学业表现报告',
        type: 'student_report',
        data: {
          students: [
            { id: 1, name: '张三', score: 88 },
            { id: 2, name: '李四', score: 82 }
          ]
        }
      };

      const mockExportResult = {
        filename: 'student_report_1.xlsx',
        path: '/exports/student_report_1.xlsx',
        size: 2048000
      };

      mockReport.findByPk.mockResolvedValue(mockReport);
      mockExcelService.createWorkbook.mockResolvedValue(mockExportResult);

      const result = await reportService.exportReport(reportId, format);

      expect(mockReport.findByPk).toHaveBeenCalledWith(reportId);
      expect(mockExcelService.createWorkbook).toHaveBeenCalled();
      expect(result).toEqual(mockExportResult);
    });

    it('应该成功导出报告为PDF格式', async () => {
      const reportId = 1;
      const format = 'pdf';

      const mockReport = {
        id: 1,
        title: '学生学业表现报告',
        filePath: '/reports/student_report_1.pdf'
      };

      const mockExportResult = {
        filename: 'student_report_1.pdf',
        path: '/reports/student_report_1.pdf',
        size: 1024000
      };

      mockReport.findByPk.mockResolvedValue(mockReport);

      const result = await reportService.exportReport(reportId, format);

      expect(result).toEqual(mockExportResult);
    });

    it('应该在报告不存在时抛出错误', async () => {
      const reportId = 999;
      const format = 'excel';

      mockReport.findByPk.mockResolvedValue(null);

      await expect(reportService.exportReport(reportId, format))
        .rejects.toThrow('报告不存在');
    });
  });

  describe('shareReport', () => {
    it('应该成功分享报告', async () => {
      const reportId = 1;
      const shareData = {
        recipients: ['user1@example.com', 'user2@example.com'],
        message: '请查看附件中的报告',
        expiresAt: '2024-05-01T00:00:00Z'
      };

      const mockReport = {
        id: 1,
        title: '学生学业表现报告',
        filePath: '/reports/student_report_1.pdf'
      };

      const mockShareResult = {
        shareId: 'share_123456',
        shareUrl: 'https://example.com/reports/share/share_123456',
        expiresAt: '2024-05-01T00:00:00Z',
        recipients: ['user1@example.com', 'user2@example.com']
      };

      mockReport.findByPk.mockResolvedValue(mockReport);
      mockEmailService.sendBulkEmail.mockResolvedValue({ success: 2, failed: 0 });

      const result = await reportService.shareReport(reportId, shareData);

      expect(mockReport.findByPk).toHaveBeenCalledWith(reportId);
      expect(mockEmailService.sendBulkEmail).toHaveBeenCalled();
      expect(result).toEqual(mockShareResult);
    });
  });

  describe('错误处理', () => {
    it('应该处理数据库连接错误', async () => {
      const error = new Error('数据库连接失败');
      mockReport.findAll.mockRejectedValue(error);

      await expect(reportService.getReportList({}))
        .rejects.toThrow('数据库连接失败');
    });

    it('应该处理事务回滚', async () => {
      const reportData = {
        studentIds: [1, 2, 3],
        reportType: 'academic_performance'
      };

      const error = new Error('生成失败');
      mockStudent.findAll.mockRejectedValue(error);
      mockTransaction.rollback.mockResolvedValue(undefined);

      await expect(reportService.generateStudentReport(reportData))
        .rejects.toThrow('生成失败');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('应该处理文件生成错误', async () => {
      const reportData = {
        studentIds: [1, 2, 3],
        reportType: 'academic_performance'
      };

      const mockStudents = [{ id: 1, name: '张三' }];

      mockStudent.findAll.mockResolvedValue(mockStudents);
      mockPDFService.generatePDF.mockRejectedValue(new Error('PDF生成失败'));

      await expect(reportService.generateStudentReport(reportData))
        .rejects.toThrow('PDF生成失败');
    });
  });
});
