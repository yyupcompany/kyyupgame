// Mock dependencies
jest.mock('../../../src/services/principal.service');
jest.mock('../../../src/controllers/base.controller');

import { Request, Response } from 'express';
import { vi } from 'vitest'
import { PrincipalController } from '../../../src/controllers/principal.controller';
import { PrincipalService } from '../../../src/services/principal.service';
import { BaseController } from '../../../src/controllers/base.controller';

// Mock implementations
const mockPrincipalService = {
  getCampusOverview: jest.fn(),
  getApprovalList: jest.fn(),
  processApproval: jest.fn(),
  getDashboardStats: jest.fn(),
  getTeacherPerformance: jest.fn(),
  getStudentStatistics: jest.fn(),
  getFinancialSummary: jest.fn(),
  getRecentActivities: jest.fn(),
  getSystemAlerts: jest.fn(),
  exportReport: jest.fn(),
  updateSettings: jest.fn(),
  getAuditLogs: jest.fn()
};

const mockBaseController = {
  handleSuccess: jest.fn(),
  handleError: jest.fn(),
  validateRequest: jest.fn(),
  checkPermission: jest.fn()
};

// Setup mocks
(PrincipalService as jest.MockedClass<typeof PrincipalService>).mockImplementation(() => mockPrincipalService as any);
(BaseController as jest.MockedClass<typeof BaseController>).mockImplementation(() => mockBaseController as any);

const mockRequest = () => ({
  body: {},
  query: {},
  params: {},
  user: { id: 1, username: 'principal', role: 'principal' }
} as Partial<Request>);

const mockResponse = () => {
  const res = {} as Partial<Response>;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};


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

describe('Principal Controller', () => {
  let principalController: PrincipalController;

  beforeEach(() => {
    jest.clearAllMocks();
    principalController = new PrincipalController();
  });

  describe('getCampusOverview', () => {
    it('应该成功获取园区概览', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const mockOverview = {
        totalStudents: 450,
        totalTeachers: 35,
        totalClasses: 18,
        totalStaff: 50,
        campusInfo: {
          name: '阳光幼儿园',
          address: '北京市朝阳区',
          establishedYear: 2010,
          area: '5000平方米',
          capacity: 500
        },
        currentStatus: {
          occupancyRate: 0.9,
          teacherStudentRatio: '1:12.8',
          averageClassSize: 25,
          satisfactionRate: 0.95
        },
        recentMetrics: {
          newEnrollments: 25,
          graduations: 30,
          teacherTurnover: 0.05,
          parentSatisfaction: 4.8
        },
        facilities: [
          { name: '教学楼', status: 'good', lastMaintenance: '2024-01-15' },
          { name: '操场', status: 'excellent', lastMaintenance: '2024-02-01' },
          { name: '食堂', status: 'good', lastMaintenance: '2024-01-20' }
        ]
      };

      mockPrincipalService.getCampusOverview.mockResolvedValue(mockOverview);

      await principalController.getCampusOverview(req as Request, res as Response);

      expect(mockPrincipalService.getCampusOverview).toHaveBeenCalled();
      expect(mockBaseController.handleSuccess).toHaveBeenCalledWith(res, mockOverview, '获取园区概览成功');
    });

    it('应该处理获取园区概览失败', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const serviceError = new Error('Database connection failed');
      mockPrincipalService.getCampusOverview.mockRejectedValue(serviceError);

      await principalController.getCampusOverview(req as Request, res as Response);

      expect(mockBaseController.handleError).toHaveBeenCalledWith(res, serviceError);
    });
  });

  describe('getApprovalList', () => {
    it('应该成功获取待审批列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        status: 'pending',
        type: 'enrollment',
        page: '1',
        pageSize: '10'
      };

      const mockApprovalList = {
        data: [
          {
            id: 1,
            type: 'enrollment',
            title: '张小明入学申请',
            applicant: '张爸爸',
            submitDate: '2024-03-15',
            status: 'pending',
            priority: 'normal',
            description: '申请春季入学',
            documents: ['身份证', '户口本', '体检报告']
          },
          {
            id: 2,
            type: 'teacher',
            title: '李老师入职申请',
            applicant: '李小红',
            submitDate: '2024-03-14',
            status: 'pending',
            priority: 'high',
            description: '申请幼教职位',
            documents: ['简历', '教师资格证', '推荐信']
          }
        ],
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
        summary: {
          pending: 15,
          approved: 45,
          rejected: 8,
          total: 68
        }
      };

      mockPrincipalService.getApprovalList.mockResolvedValue(mockApprovalList);

      await principalController.getApprovalList(req as Request, res as Response);

      expect(mockPrincipalService.getApprovalList).toHaveBeenCalledWith({
        status: 'pending',
        type: 'enrollment',
        page: 1,
        pageSize: 10
      });
      expect(mockBaseController.handleSuccess).toHaveBeenCalledWith(res, mockApprovalList, '获取待审批列表成功');
    });

    it('应该使用默认查询参数', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const mockEmptyList = {
        data: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0
      };

      mockPrincipalService.getApprovalList.mockResolvedValue(mockEmptyList);

      await principalController.getApprovalList(req as Request, res as Response);

      expect(mockPrincipalService.getApprovalList).toHaveBeenCalledWith({
        status: undefined,
        type: undefined,
        page: 1,
        pageSize: 10
      });
    });

    it('应该处理获取审批列表失败', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const serviceError = new Error('Query failed');
      mockPrincipalService.getApprovalList.mockRejectedValue(serviceError);

      await principalController.getApprovalList(req as Request, res as Response);

      expect(mockBaseController.handleError).toHaveBeenCalledWith(res, serviceError);
    });
  });

  describe('processApproval', () => {
    it('应该成功处理审批', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        action: 'approve',
        comments: '申请材料齐全，符合入学条件',
        assignedClass: 'A班',
        startDate: '2024-04-01'
      };

      const mockProcessedApproval = {
        id: 1,
        type: 'enrollment',
        title: '张小明入学申请',
        status: 'approved',
        processedBy: 1,
        processedAt: new Date(),
        comments: '申请材料齐全，符合入学条件',
        result: {
          assignedClass: 'A班',
          startDate: '2024-04-01',
          studentId: 'STU2024001'
        }
      };

      mockPrincipalService.processApproval.mockResolvedValue(mockProcessedApproval);

      await principalController.processApproval(req as Request, res as Response);

      expect(mockPrincipalService.processApproval).toHaveBeenCalledWith(1, {
        action: 'approve',
        comments: '申请材料齐全，符合入学条件',
        assignedClass: 'A班',
        startDate: '2024-04-01',
        processedBy: 1
      });
      expect(mockBaseController.handleSuccess).toHaveBeenCalledWith(res, mockProcessedApproval, '审批处理成功');
    });

    it('应该处理拒绝审批', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '2' };
      req.body = {
        action: 'reject',
        comments: '年龄不符合入学要求',
        reason: 'age_requirement'
      };

      const mockRejectedApproval = {
        id: 2,
        type: 'enrollment',
        title: '李小红入学申请',
        status: 'rejected',
        processedBy: 1,
        processedAt: new Date(),
        comments: '年龄不符合入学要求',
        rejectReason: 'age_requirement'
      };

      mockPrincipalService.processApproval.mockResolvedValue(mockRejectedApproval);

      await principalController.processApproval(req as Request, res as Response);

      expect(mockPrincipalService.processApproval).toHaveBeenCalledWith(2, {
        action: 'reject',
        comments: '年龄不符合入学要求',
        reason: 'age_requirement',
        processedBy: 1
      });
    });

    it('应该处理审批不存在', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '999' };
      req.body = { action: 'approve' };

      const notFoundError = new Error('审批记录不存在');
      mockPrincipalService.processApproval.mockRejectedValue(notFoundError);

      await principalController.processApproval(req as Request, res as Response);

      expect(mockBaseController.handleError).toHaveBeenCalledWith(res, notFoundError);
    });

    it('应该处理无效的审批操作', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = { action: 'invalid_action' };

      const validationError = new Error('无效的审批操作');
      mockPrincipalService.processApproval.mockRejectedValue(validationError);

      await principalController.processApproval(req as Request, res as Response);

      expect(mockBaseController.handleError).toHaveBeenCalledWith(res, validationError);
    });
  });

  describe('getDashboardStats', () => {
    it('应该成功获取仪表板统计', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const mockDashboardStats = {
        overview: {
          totalStudents: 450,
          totalTeachers: 35,
          totalClasses: 18,
          occupancyRate: 0.9
        },
        enrollment: {
          newApplications: 25,
          pendingApprovals: 8,
          thisMonthEnrollments: 15,
          projectedEnrollments: 30
        },
        academic: {
          activeClasses: 18,
          averageAttendance: 0.95,
          upcomingEvents: 5,
          completedActivities: 12
        },
        financial: {
          monthlyRevenue: 450000,
          outstandingFees: 25000,
          expensesBudget: 380000,
          profitMargin: 0.18
        },
        staff: {
          totalStaff: 50,
          presentToday: 48,
          onLeave: 2,
          newHires: 3
        },
        alerts: [
          {
            id: 1,
            type: 'warning',
            message: '食堂设备需要维护',
            priority: 'medium',
            createdAt: new Date()
          },
          {
            id: 2,
            type: 'info',
            message: '下周有家长会',
            priority: 'low',
            createdAt: new Date()
          }
        ]
      };

      mockPrincipalService.getDashboardStats.mockResolvedValue(mockDashboardStats);

      await principalController.getDashboardStats(req as Request, res as Response);

      expect(mockPrincipalService.getDashboardStats).toHaveBeenCalled();
      expect(mockBaseController.handleSuccess).toHaveBeenCalledWith(res, mockDashboardStats, '获取仪表板统计成功');
    });

    it('应该处理获取统计失败', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const serviceError = new Error('Statistics calculation failed');
      mockPrincipalService.getDashboardStats.mockRejectedValue(serviceError);

      await principalController.getDashboardStats(req as Request, res as Response);

      expect(mockBaseController.handleError).toHaveBeenCalledWith(res, serviceError);
    });
  });

  describe('getTeacherPerformance', () => {
    it('应该成功获取教师绩效', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        period: 'month',
        teacherId: '5',
        sortBy: 'rating'
      };

      const mockTeacherPerformance = {
        summary: {
          totalTeachers: 35,
          averageRating: 4.6,
          topPerformers: 8,
          needsImprovement: 3
        },
        teachers: [
          {
            id: 5,
            name: '张老师',
            position: '主班老师',
            class: 'A班',
            rating: 4.8,
            metrics: {
              studentSatisfaction: 4.9,
              parentFeedback: 4.7,
              classManagement: 4.8,
              professionalDevelopment: 4.6
            },
            achievements: ['优秀教师', '创新教学奖'],
            areas_for_improvement: []
          },
          {
            id: 12,
            name: '李老师',
            position: '副班老师',
            class: 'B班',
            rating: 4.5,
            metrics: {
              studentSatisfaction: 4.6,
              parentFeedback: 4.4,
              classManagement: 4.5,
              professionalDevelopment: 4.3
            },
            achievements: ['团队合作奖'],
            areas_for_improvement: ['课堂互动', '家长沟通']
          }
        ],
        trends: {
          ratingTrend: 'increasing',
          satisfactionTrend: 'stable',
          retentionRate: 0.94
        }
      };

      mockPrincipalService.getTeacherPerformance.mockResolvedValue(mockTeacherPerformance);

      await principalController.getTeacherPerformance(req as Request, res as Response);

      expect(mockPrincipalService.getTeacherPerformance).toHaveBeenCalledWith({
        period: 'month',
        teacherId: 5,
        sortBy: 'rating'
      });
      expect(mockBaseController.handleSuccess).toHaveBeenCalledWith(res, mockTeacherPerformance, '获取教师绩效成功');
    });

    it('应该使用默认查询参数', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const mockDefaultPerformance = {
        summary: { totalTeachers: 0 },
        teachers: [],
        trends: {}
      };

      mockPrincipalService.getTeacherPerformance.mockResolvedValue(mockDefaultPerformance);

      await principalController.getTeacherPerformance(req as Request, res as Response);

      expect(mockPrincipalService.getTeacherPerformance).toHaveBeenCalledWith({
        period: undefined,
        teacherId: undefined,
        sortBy: undefined
      });
    });

    it('应该处理获取教师绩效失败', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const serviceError = new Error('Performance data unavailable');
      mockPrincipalService.getTeacherPerformance.mockRejectedValue(serviceError);

      await principalController.getTeacherPerformance(req as Request, res as Response);

      expect(mockBaseController.handleError).toHaveBeenCalledWith(res, serviceError);
    });
  });

  describe('getFinancialSummary', () => {
    it('应该成功获取财务摘要', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        category: 'all'
      };

      const mockFinancialSummary = {
        period: {
          startDate: '2024-01-01',
          endDate: '2024-03-31',
          duration: '3个月'
        },
        revenue: {
          tuitionFees: 1200000,
          registrationFees: 150000,
          extraActivities: 80000,
          meals: 120000,
          total: 1550000
        },
        expenses: {
          salaries: 800000,
          utilities: 60000,
          supplies: 45000,
          maintenance: 25000,
          insurance: 15000,
          other: 35000,
          total: 980000
        },
        profit: {
          gross: 570000,
          margin: 0.368,
          netProfit: 520000,
          netMargin: 0.335
        },
        cashFlow: {
          beginning: 200000,
          inflow: 1550000,
          outflow: 980000,
          ending: 770000
        },
        trends: {
          revenueGrowth: 0.12,
          expenseGrowth: 0.08,
          profitGrowth: 0.18
        },
        breakdown: [
          { month: '2024-01', revenue: 500000, expenses: 320000, profit: 180000 },
          { month: '2024-02', revenue: 520000, expenses: 330000, profit: 190000 },
          { month: '2024-03', revenue: 530000, expenses: 330000, profit: 200000 }
        ]
      };

      mockPrincipalService.getFinancialSummary.mockResolvedValue(mockFinancialSummary);

      await principalController.getFinancialSummary(req as Request, res as Response);

      expect(mockPrincipalService.getFinancialSummary).toHaveBeenCalledWith({
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        category: 'all'
      });
      expect(mockBaseController.handleSuccess).toHaveBeenCalledWith(res, mockFinancialSummary, '获取财务摘要成功');
    });

    it('应该处理获取财务摘要失败', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const serviceError = new Error('Financial data access denied');
      mockPrincipalService.getFinancialSummary.mockRejectedValue(serviceError);

      await principalController.getFinancialSummary(req as Request, res as Response);

      expect(mockBaseController.handleError).toHaveBeenCalledWith(res, serviceError);
    });
  });

  describe('exportReport', () => {
    it('应该成功导出报告', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        reportType: 'comprehensive',
        period: 'quarter',
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        format: 'pdf',
        sections: ['overview', 'enrollment', 'financial', 'staff']
      };

      const mockExportResult = {
        reportId: 'RPT_2024_Q1_001',
        filename: '2024年第一季度综合报告.pdf',
        downloadUrl: '/reports/download/RPT_2024_Q1_001',
        size: '2.5MB',
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小时后过期
        sections: ['overview', 'enrollment', 'financial', 'staff'],
        status: 'completed'
      };

      mockPrincipalService.exportReport.mockResolvedValue(mockExportResult);

      await principalController.exportReport(req as Request, res as Response);

      expect(mockPrincipalService.exportReport).toHaveBeenCalledWith({
        reportType: 'comprehensive',
        period: 'quarter',
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        format: 'pdf',
        sections: ['overview', 'enrollment', 'financial', 'staff'],
        generatedBy: 1
      });
      expect(mockBaseController.handleSuccess).toHaveBeenCalledWith(res, mockExportResult, '报告导出成功');
    });

    it('应该处理导出报告失败', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        reportType: 'comprehensive',
        format: 'pdf'
      };

      const serviceError = new Error('Report generation service unavailable');
      mockPrincipalService.exportReport.mockRejectedValue(serviceError);

      await principalController.exportReport(req as Request, res as Response);

      expect(mockBaseController.handleError).toHaveBeenCalledWith(res, serviceError);
    });

    it('应该验证导出参数', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        // 缺少必填字段
        format: 'pdf'
      };

      const validationError = new Error('缺少必填字段：reportType');
      mockPrincipalService.exportReport.mockRejectedValue(validationError);

      await principalController.exportReport(req as Request, res as Response);

      expect(mockBaseController.handleError).toHaveBeenCalledWith(res, validationError);
    });
  });
});
