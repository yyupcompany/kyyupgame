// Mock dependencies
jest.mock('../../../src/init');
jest.mock('../../../src/services/enrollment/enrollment-application.service');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');
jest.mock('../../../src/utils/data-formatter');
jest.mock('../../../src/utils/param-validator');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  approveApplication,
  rejectApplication,
  getApplicationsByParent,
  getApplicationStatistics
} from '../../../src/controllers/enrollment-application.controller';
import { sequelize } from '../../../src/init';
import enrollmentApplicationService from '../../../src/services/enrollment/enrollment-application.service';
import { ApiError } from '../../../src/utils/apiError';
import { ApiResponse } from '../../../src/utils/apiResponse';
import { formatPaginationResponse, safelyGetArrayFromQuery } from '../../../src/utils/data-formatter';
import { parseId, parsePage, parsePageSize } from '../../../src/utils/param-validator';

// Mock implementations
const mockSequelize = {
  query: jest.fn(),
  transaction: jest.fn()
};

const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn()
};

const mockEnrollmentApplicationService = {
  create: jest.fn(),
  getList: jest.fn(),
  getById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  approve: jest.fn(),
  reject: jest.fn(),
  getByParentId: jest.fn(),
  getStatistics: jest.fn(),
  checkDuplicateApplication: jest.fn()
};

const mockApiResponse = {
  success: jest.fn(),
  error: jest.fn(),
  handleError: jest.fn()
};

const mockDataFormatter = {
  formatPaginationResponse: jest.fn(),
  safelyGetArrayFromQuery: jest.fn()
};

const mockParamValidator = {
  parseId: jest.fn(),
  parsePage: jest.fn(),
  parsePageSize: jest.fn()
};

// Setup mocks
(sequelize as any) = mockSequelize;
(enrollmentApplicationService as any) = mockEnrollmentApplicationService;
(ApiResponse.success as any) = mockApiResponse.success;
(ApiResponse.error as any) = mockApiResponse.error;
(ApiResponse.handleError as any) = mockApiResponse.handleError;
(formatPaginationResponse as any) = mockDataFormatter.formatPaginationResponse;
(safelyGetArrayFromQuery as any) = mockDataFormatter.safelyGetArrayFromQuery;
(parseId as any) = mockParamValidator.parseId;
(parsePage as any) = mockParamValidator.parsePage;
(parsePageSize as any) = mockParamValidator.parsePageSize;

const mockRequest = () => ({
  body: {},
  query: {},
  params: {},
  user: { id: 1, username: 'testuser' }
} as Partial<Request>);

const mockResponse = () => {
  const res = {} as Partial<Response>;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn() as NextFunction;


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

describe('Enrollment Application Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSequelize.transaction.mockResolvedValue(mockTransaction);
  });

  describe('createApplication', () => {
    it('应该成功创建报名申请', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        studentName: '张小明',
        gender: 'male',
        birthDate: '2019-03-15',
        parentId: 1,
        planId: 1,
        contactPhone: '13800138000',
        applicationSource: 'web',
        status: 'pending',
        remarks: '希望能够入学'
      };

      const mockCreatedApplication = {
        id: 1,
        studentName: '张小明',
        gender: 'male',
        birthDate: '2019-03-15',
        parentId: 1,
        planId: 1,
        contactPhone: '13800138000',
        applicationSource: 'web',
        status: 'pending',
        remarks: '希望能够入学',
        applicationNumber: 'APP202404001',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockEnrollmentApplicationService.create.mockResolvedValue(mockCreatedApplication);

      await createApplication(req as Request, res as Response, mockNext);

      expect(mockEnrollmentApplicationService.create).toHaveBeenCalledWith({
        studentName: '张小明',
        gender: 'male',
        birthDate: '2019-03-15',
        parentId: 1,
        planId: 1,
        contactPhone: '13800138000',
        applicationSource: 'web',
        status: 'pending',
        remarks: '希望能够入学',
        userId: 1
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedApplication,
        message: '报名申请创建成功'
      });
    });

    it('应该处理未认证用户', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = null;
      req.body = {
        studentName: '张小明',
        planId: 1
      };

      await createApplication(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '用户未认证'
      });
    });

    it('应该验证必填字段', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        gender: 'male'
        // 缺少studentName和planId
      };

      await createApplication(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '缺少必填字段：studentName, planId'
      });
    });

    it('应该处理兼容字段映射', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        studentName: '李小红',
        planId: 1,
        phone: '13900139000' // 使用兼容字段
      };

      const mockCreatedApplication = {
        id: 2,
        studentName: '李小红',
        contactPhone: '13900139000'
      };

      mockEnrollmentApplicationService.create.mockResolvedValue(mockCreatedApplication);

      await createApplication(req as Request, res as Response, mockNext);

      expect(mockEnrollmentApplicationService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          contactPhone: '13900139000' // 应该映射到contactPhone
        })
      );
    });

    it('应该处理重复申请', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        studentName: '张小明',
        planId: 1,
        contactPhone: '13800138000'
      };

      const duplicateError = new Error('该学生已有待处理的申请');
      mockEnrollmentApplicationService.create.mockRejectedValue(duplicateError);

      await createApplication(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(duplicateError);
    });

    it('应该处理创建失败', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        studentName: '张小明',
        planId: 1
      };

      const serviceError = new Error('Database error');
      mockEnrollmentApplicationService.create.mockRejectedValue(serviceError);

      await createApplication(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('getApplications', () => {
    it('应该成功获取申请列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        page: '1',
        pageSize: '10',
        status: 'pending',
        planId: '1',
        keyword: '张',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      };

      const mockApplications = {
        data: [
          {
            id: 1,
            studentName: '张小明',
            gender: 'male',
            birthDate: '2019-03-15',
            status: 'pending',
            applicationNumber: 'APP202404001',
            contactPhone: '13800138000',
            Parent: { id: 1, name: '张爸爸' },
            EnrollmentPlan: { id: 1, name: '2024年春季招生' },
            createdAt: new Date()
          },
          {
            id: 2,
            studentName: '张小红',
            gender: 'female',
            birthDate: '2019-05-20',
            status: 'pending',
            applicationNumber: 'APP202404002',
            contactPhone: '13900139000',
            Parent: { id: 2, name: '张妈妈' },
            EnrollmentPlan: { id: 1, name: '2024年春季招生' },
            createdAt: new Date()
          }
        ],
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1
      };

      mockParamValidator.parsePage.mockReturnValue(1);
      mockParamValidator.parsePageSize.mockReturnValue(10);
      mockParamValidator.parseId.mockReturnValue(1);
      mockEnrollmentApplicationService.getList.mockResolvedValue(mockApplications);

      await getApplications(req as Request, res as Response, mockNext);

      expect(mockEnrollmentApplicationService.getList).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        status: 'pending',
        planId: 1,
        keyword: '张',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockApplications
      });
    });

    it('应该使用默认查询参数', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const mockEmptyList = {
        data: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0
      };

      mockParamValidator.parsePage.mockReturnValue(1);
      mockParamValidator.parsePageSize.mockReturnValue(20);
      mockEnrollmentApplicationService.getList.mockResolvedValue(mockEmptyList);

      await getApplications(req as Request, res as Response, mockNext);

      expect(mockEnrollmentApplicationService.getList).toHaveBeenCalledWith({
        page: 1,
        pageSize: 20,
        status: undefined,
        planId: undefined,
        keyword: undefined,
        startDate: undefined,
        endDate: undefined,
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      });
    });

    it('应该处理获取列表失败', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const serviceError = new Error('Database query failed');
      mockEnrollmentApplicationService.getList.mockRejectedValue(serviceError);

      await getApplications(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('getApplicationById', () => {
    it('应该成功获取申请详情', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      const mockApplication = {
        id: 1,
        studentName: '张小明',
        gender: 'male',
        birthDate: '2019-03-15',
        status: 'pending',
        applicationNumber: 'APP202404001',
        contactPhone: '13800138000',
        applicationSource: 'web',
        remarks: '希望能够入学',
        Parent: {
          id: 1,
          name: '张爸爸',
          contactPhone: '13800138000',
          User: { id: 2, name: '张爸爸', email: 'father@example.com' }
        },
        EnrollmentPlan: {
          id: 1,
          name: '2024年春季招生',
          startDate: '2024-03-01',
          endDate: '2024-03-31',
          maxStudents: 100,
          currentStudents: 25
        },
        ApplicationLogs: [
          {
            id: 1,
            action: 'created',
            description: '申请已创建',
            operatorId: 1,
            createdAt: new Date()
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockParamValidator.parseId.mockReturnValue(1);
      mockEnrollmentApplicationService.getById.mockResolvedValue(mockApplication);

      await getApplicationById(req as Request, res as Response, mockNext);

      expect(mockEnrollmentApplicationService.getById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockApplication
      });
    });

    it('应该处理申请不存在', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '999' };

      mockParamValidator.parseId.mockReturnValue(999);
      mockEnrollmentApplicationService.getById.mockResolvedValue(null);

      await getApplicationById(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '申请不存在'
      });
    });

    it('应该处理无效的申请ID', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: 'invalid' };

      mockParamValidator.parseId.mockReturnValue(null);

      await getApplicationById(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '无效的申请ID'
      });
    });
  });

  describe('approveApplication', () => {
    it('应该成功审批通过申请', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        remarks: '符合入学条件，同意录取',
        assignedClassId: 1
      };

      const mockApprovedApplication = {
        id: 1,
        studentName: '张小明',
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: 1,
        remarks: '符合入学条件，同意录取',
        assignedClassId: 1
      };

      mockParamValidator.parseId.mockReturnValue(1);
      mockEnrollmentApplicationService.approve.mockResolvedValue(mockApprovedApplication);

      await approveApplication(req as Request, res as Response, mockNext);

      expect(mockEnrollmentApplicationService.approve).toHaveBeenCalledWith(1, {
        remarks: '符合入学条件，同意录取',
        assignedClassId: 1,
        approvedBy: 1
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockApprovedApplication,
        message: '申请审批通过'
      });
    });

    it('应该处理审批不存在的申请', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '999' };
      req.body = { remarks: '审批通过' };

      mockParamValidator.parseId.mockReturnValue(999);
      mockEnrollmentApplicationService.approve.mockResolvedValue(null);

      await approveApplication(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '申请不存在'
      });
    });

    it('应该处理重复审批', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = { remarks: '重复审批' };

      mockParamValidator.parseId.mockReturnValue(1);
      const duplicateError = new Error('申请已经被审批过');
      mockEnrollmentApplicationService.approve.mockRejectedValue(duplicateError);

      await approveApplication(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(duplicateError);
    });
  });

  describe('rejectApplication', () => {
    it('应该成功拒绝申请', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        remarks: '年龄不符合要求',
        rejectReason: 'age_requirement'
      };

      const mockRejectedApplication = {
        id: 1,
        studentName: '张小明',
        status: 'rejected',
        rejectedAt: new Date(),
        rejectedBy: 1,
        remarks: '年龄不符合要求',
        rejectReason: 'age_requirement'
      };

      mockParamValidator.parseId.mockReturnValue(1);
      mockEnrollmentApplicationService.reject.mockResolvedValue(mockRejectedApplication);

      await rejectApplication(req as Request, res as Response, mockNext);

      expect(mockEnrollmentApplicationService.reject).toHaveBeenCalledWith(1, {
        remarks: '年龄不符合要求',
        rejectReason: 'age_requirement',
        rejectedBy: 1
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockRejectedApplication,
        message: '申请已拒绝'
      });
    });

    it('应该处理拒绝不存在的申请', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '999' };
      req.body = { remarks: '拒绝申请' };

      mockParamValidator.parseId.mockReturnValue(999);
      mockEnrollmentApplicationService.reject.mockResolvedValue(null);

      await rejectApplication(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '申请不存在'
      });
    });
  });

  describe('getApplicationStatistics', () => {
    it('应该成功获取申请统计信息', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        planId: '1',
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      };

      const mockStatistics = {
        totalApplications: 150,
        pendingApplications: 45,
        approvedApplications: 85,
        rejectedApplications: 20,
        approvalRate: 0.81,
        applicationsByMonth: [
          { month: '2024-01', count: 25 },
          { month: '2024-02', count: 30 },
          { month: '2024-03', count: 35 }
        ],
        applicationsBySource: {
          web: 80,
          phone: 35,
          visit: 25,
          referral: 10
        },
        averageProcessingTime: 3.5
      };

      mockParamValidator.parseId.mockReturnValue(1);
      mockEnrollmentApplicationService.getStatistics.mockResolvedValue(mockStatistics);

      await getApplicationStatistics(req as Request, res as Response, mockNext);

      expect(mockEnrollmentApplicationService.getStatistics).toHaveBeenCalledWith({
        planId: 1,
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockStatistics
      });
    });

    it('应该处理无查询参数的统计请求', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const mockStatistics = {
        totalApplications: 0,
        pendingApplications: 0,
        approvedApplications: 0,
        rejectedApplications: 0
      };

      mockEnrollmentApplicationService.getStatistics.mockResolvedValue(mockStatistics);

      await getApplicationStatistics(req as Request, res as Response, mockNext);

      expect(mockEnrollmentApplicationService.getStatistics).toHaveBeenCalledWith({
        planId: undefined,
        startDate: undefined,
        endDate: undefined
      });
    });

    it('应该处理统计服务错误', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const serviceError = new Error('Statistics calculation failed');
      mockEnrollmentApplicationService.getStatistics.mockRejectedValue(serviceError);

      await getApplicationStatistics(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });
  });
});
