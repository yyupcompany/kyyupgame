// Mock dependencies
jest.mock('../../../src/init');
jest.mock('../../../src/utils/apiResponse');
jest.mock('../../../src/utils/apiError');

import { Request, Response } from 'express';
import { vi } from 'vitest'
import { EnrollmentPlanController } from '../../../src/controllers/enrollment-plan.controller';
import { sequelize } from '../../../src/init';
import { ApiResponse } from '../../../src/utils/apiResponse';
import { ApiError } from '../../../src/utils/apiError';

// Mock implementations
const mockSequelize = {
  query: jest.fn(),
  transaction: jest.fn()
};

const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn()
};

const mockApiResponse = {
  success: jest.fn(),
  error: jest.fn(),
  handleError: jest.fn()
};

const mockApiError = {
  unauthorized: jest.fn(),
  badRequest: jest.fn(),
  notFound: jest.fn(),
  conflict: jest.fn()
};

// Setup mocks
(sequelize as any) = mockSequelize;
(ApiResponse.success as any) = mockApiResponse.success;
(ApiResponse.error as any) = mockApiResponse.error;
(ApiResponse.handleError as any) = mockApiResponse.handleError;
(ApiError.unauthorized as any) = mockApiError.unauthorized;
(ApiError.badRequest as any) = mockApiError.badRequest;
(ApiError.notFound as any) = mockApiError.notFound;
(ApiError.conflict as any) = mockApiError.conflict;

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

describe('Enrollment Plan Controller', () => {
  let enrollmentPlanController: EnrollmentPlanController;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSequelize.transaction.mockResolvedValue(mockTransaction);
    enrollmentPlanController = new EnrollmentPlanController();
  });

  describe('create', () => {
    it('应该成功创建招生计划', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        kindergartenId: 1,
        planName: '2024年春季招生计划',
        planType: 'spring',
        startDate: '2024-03-01',
        endDate: '2024-03-31',
        targetStudents: 100,
        ageRange: '3-6',
        tuitionFee: 3000,
        registrationFee: 500,
        description: '2024年春季招生计划，面向3-6岁儿童',
        requirements: '身体健康，年龄符合要求',
        benefits: '优质教育资源，专业师资团队',
        status: 'draft'
      };

      const expectedPlan = {
        id: expect.any(Number),
        kindergartenId: 1,
        planName: '2024年春季招生计划',
        planType: 'spring',
        startDate: '2024-03-01',
        endDate: '2024-03-31',
        targetStudents: 100,
        ageRange: '3-6',
        tuitionFee: 3000,
        registrationFee: 500,
        description: '2024年春季招生计划，面向3-6岁儿童',
        requirements: '身体健康，年龄符合要求',
        benefits: '优质教育资源，专业师资团队',
        status: 'draft',
        createdBy: 1,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      };

      await enrollmentPlanController.create(req as Request, res as Response);

      expect(mockApiResponse.success).toHaveBeenCalledWith(res, expectedPlan, '创建招生计划成功', 201);
    });

    it('应该处理未认证用户', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = null;
      req.body = {
        planName: '测试计划'
      };

      const unauthorizedError = new Error('未登录或登录已过期');
      mockApiError.unauthorized.mockReturnValue(unauthorizedError);

      await enrollmentPlanController.create(req as Request, res as Response);

      expect(mockApiError.unauthorized).toHaveBeenCalledWith('未登录或登录已过期');
      expect(mockApiResponse.handleError).toHaveBeenCalledWith(res, unauthorizedError, '创建招生计划失败');
    });

    it('应该处理创建过程中的错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        planName: '测试计划'
      };

      // 模拟创建过程中的错误
      const createError = new Error('Database error');
      jest.spyOn(Date, 'now').mockImplementation(() => {
        throw createError;
      });

      await enrollmentPlanController.create(req as Request, res as Response);

      expect(mockApiResponse.handleError).toHaveBeenCalledWith(res, createError, '创建招生计划失败');

      // 恢复Date.now
      jest.restoreAllMocks();
    });
  });

  describe('list', () => {
    it('应该成功获取招生计划列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        page: '1',
        pageSize: '10',
        kindergartenId: '1',
        status: 'active',
        planType: 'spring',
        keyword: '春季'
      };

      const mockPlans = {
        data: [
          {
            id: 1,
            kindergartenId: 1,
            planName: '2024年春季招生计划',
            planType: 'spring',
            startDate: '2024-03-01',
            endDate: '2024-03-31',
            targetStudents: 100,
            currentApplications: 25,
            ageRange: '3-6',
            tuitionFee: 3000,
            registrationFee: 500,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 2,
            kindergartenId: 1,
            planName: '2024年春季特色班招生',
            planType: 'spring',
            startDate: '2024-03-15',
            endDate: '2024-04-15',
            targetStudents: 30,
            currentApplications: 8,
            ageRange: '4-6',
            tuitionFee: 4000,
            registrationFee: 600,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1
      };

      await enrollmentPlanController.list(req as Request, res as Response);

      expect(mockApiResponse.success).toHaveBeenCalledWith(res, expect.objectContaining({
        data: expect.any(Array),
        total: expect.any(Number),
        page: expect.any(Number),
        pageSize: expect.any(Number)
      }));
    });

    it('应该使用默认查询参数', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await enrollmentPlanController.list(req as Request, res as Response);

      expect(mockApiResponse.success).toHaveBeenCalledWith(res, expect.objectContaining({
        data: expect.any(Array),
        page: 1,
        pageSize: 10
      }));
    });

    it('应该处理获取列表失败', async () => {
      const req = mockRequest();
      const res = mockResponse();

      // 模拟获取列表时的错误
      const listError = new Error('Query failed');
      jest.spyOn(enrollmentPlanController, 'list').mockImplementation(async () => {
        throw listError;
      });

      await enrollmentPlanController.list(req as Request, res as Response);

      expect(mockApiResponse.handleError).toHaveBeenCalledWith(res, listError, '获取招生计划列表失败');

      jest.restoreAllMocks();
    });
  });

  describe('getById', () => {
    it('应该成功获取招生计划详情', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      const mockPlan = {
        id: 1,
        kindergartenId: 1,
        planName: '2024年春季招生计划',
        planType: 'spring',
        startDate: '2024-03-01',
        endDate: '2024-03-31',
        targetStudents: 100,
        currentApplications: 25,
        ageRange: '3-6',
        tuitionFee: 3000,
        registrationFee: 500,
        description: '2024年春季招生计划，面向3-6岁儿童',
        requirements: '身体健康，年龄符合要求',
        benefits: '优质教育资源，专业师资团队',
        status: 'active',
        createdBy: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        // 关联数据
        Kindergarten: {
          id: 1,
          name: '阳光幼儿园',
          address: '北京市朝阳区'
        },
        Applications: [
          {
            id: 1,
            studentName: '张小明',
            status: 'pending',
            createdAt: new Date()
          }
        ],
        Statistics: {
          totalApplications: 25,
          approvedApplications: 15,
          rejectedApplications: 5,
          pendingApplications: 5,
          conversionRate: 0.6
        }
      };

      await enrollmentPlanController.getById(req as Request, res as Response);

      expect(mockApiResponse.success).toHaveBeenCalledWith(res, expect.objectContaining({
        id: expect.any(Number),
        planName: expect.any(String),
        status: expect.any(String)
      }));
    });

    it('应该处理计划不存在', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '999' };

      const notFoundError = new Error('招生计划不存在');
      mockApiError.notFound.mockReturnValue(notFoundError);

      // 模拟计划不存在的情况
      jest.spyOn(enrollmentPlanController, 'getById').mockImplementation(async () => {
        throw notFoundError;
      });

      await enrollmentPlanController.getById(req as Request, res as Response);

      expect(mockApiResponse.handleError).toHaveBeenCalledWith(res, notFoundError, '获取招生计划详情失败');

      jest.restoreAllMocks();
    });

    it('应该处理无效的计划ID', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: 'invalid' };

      const badRequestError = new Error('无效的计划ID');
      mockApiError.badRequest.mockReturnValue(badRequestError);

      jest.spyOn(enrollmentPlanController, 'getById').mockImplementation(async () => {
        throw badRequestError;
      });

      await enrollmentPlanController.getById(req as Request, res as Response);

      expect(mockApiResponse.handleError).toHaveBeenCalledWith(res, badRequestError, '获取招生计划详情失败');

      jest.restoreAllMocks();
    });
  });

  describe('update', () => {
    it('应该成功更新招生计划', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        planName: '更新的2024年春季招生计划',
        targetStudents: 120,
        tuitionFee: 3200,
        description: '更新的招生计划描述',
        status: 'active'
      };

      const mockUpdatedPlan = {
        id: 1,
        kindergartenId: 1,
        planName: '更新的2024年春季招生计划',
        planType: 'spring',
        startDate: '2024-03-01',
        endDate: '2024-03-31',
        targetStudents: 120,
        ageRange: '3-6',
        tuitionFee: 3200,
        registrationFee: 500,
        description: '更新的招生计划描述',
        status: 'active',
        updatedBy: 1,
        updatedAt: new Date()
      };

      await enrollmentPlanController.update(req as Request, res as Response);

      expect(mockApiResponse.success).toHaveBeenCalledWith(res, expect.objectContaining({
        id: expect.any(Number),
        planName: expect.any(String),
        updatedAt: expect.any(Date)
      }), '更新招生计划成功');
    });

    it('应该处理更新不存在的计划', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '999' };
      req.body = { planName: '不存在的计划' };

      const notFoundError = new Error('招生计划不存在');
      mockApiError.notFound.mockReturnValue(notFoundError);

      jest.spyOn(enrollmentPlanController, 'update').mockImplementation(async () => {
        throw notFoundError;
      });

      await enrollmentPlanController.update(req as Request, res as Response);

      expect(mockApiResponse.handleError).toHaveBeenCalledWith(res, notFoundError, '更新招生计划失败');

      jest.restoreAllMocks();
    });

    it('应该阻止更新已结束的计划', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = { planName: '尝试更新已结束的计划' };

      const conflictError = new Error('已结束的招生计划无法修改');
      mockApiError.conflict.mockReturnValue(conflictError);

      jest.spyOn(enrollmentPlanController, 'update').mockImplementation(async () => {
        throw conflictError;
      });

      await enrollmentPlanController.update(req as Request, res as Response);

      expect(mockApiResponse.handleError).toHaveBeenCalledWith(res, conflictError, '更新招生计划失败');

      jest.restoreAllMocks();
    });
  });

  describe('delete', () => {
    it('应该成功删除招生计划', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      await enrollmentPlanController.delete(req as Request, res as Response);

      expect(mockApiResponse.success).toHaveBeenCalledWith(res, null, '删除招生计划成功');
    });

    it('应该处理删除不存在的计划', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '999' };

      const notFoundError = new Error('招生计划不存在');
      mockApiError.notFound.mockReturnValue(notFoundError);

      jest.spyOn(enrollmentPlanController, 'delete').mockImplementation(async () => {
        throw notFoundError;
      });

      await enrollmentPlanController.delete(req as Request, res as Response);

      expect(mockApiResponse.handleError).toHaveBeenCalledWith(res, notFoundError, '删除招生计划失败');

      jest.restoreAllMocks();
    });

    it('应该阻止删除有申请的计划', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      const conflictError = new Error('存在申请记录的招生计划无法删除');
      mockApiError.conflict.mockReturnValue(conflictError);

      jest.spyOn(enrollmentPlanController, 'delete').mockImplementation(async () => {
        throw conflictError;
      });

      await enrollmentPlanController.delete(req as Request, res as Response);

      expect(mockApiResponse.handleError).toHaveBeenCalledWith(res, conflictError, '删除招生计划失败');

      jest.restoreAllMocks();
    });
  });

  describe('getStatistics', () => {
    it('应该成功获取招生计划统计信息', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        kindergartenId: '1',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        planType: 'spring'
      };

      const mockStatistics = {
        totalPlans: 5,
        activePlans: 2,
        completedPlans: 2,
        draftPlans: 1,
        totalTargetStudents: 500,
        totalApplications: 320,
        totalApproved: 280,
        overallConversionRate: 0.875,
        plansByType: {
          spring: 2,
          autumn: 2,
          summer: 1
        },
        monthlyStats: [
          { month: '2024-01', applications: 50, approved: 45 },
          { month: '2024-02', applications: 80, approved: 70 },
          { month: '2024-03', applications: 120, approved: 100 }
        ],
        topPerformingPlans: [
          {
            id: 1,
            planName: '2024年春季招生计划',
            applications: 120,
            approved: 100,
            conversionRate: 0.83
          }
        ]
      };

      await enrollmentPlanController.getStatistics(req as Request, res as Response);

      expect(mockApiResponse.success).toHaveBeenCalledWith(res, expect.objectContaining({
        totalPlans: expect.any(Number),
        activePlans: expect.any(Number),
        totalApplications: expect.any(Number)
      }));
    });

    it('应该处理无查询参数的统计请求', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await enrollmentPlanController.getStatistics(req as Request, res as Response);

      expect(mockApiResponse.success).toHaveBeenCalledWith(res, expect.objectContaining({
        totalPlans: expect.any(Number)
      }));
    });

    it('应该处理统计查询失败', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const statisticsError = new Error('Statistics calculation failed');

      jest.spyOn(enrollmentPlanController, 'getStatistics').mockImplementation(async () => {
        throw statisticsError;
      });

      await enrollmentPlanController.getStatistics(req as Request, res as Response);

      expect(mockApiResponse.handleError).toHaveBeenCalledWith(res, statisticsError, '获取招生计划统计失败');

      jest.restoreAllMocks();
    });
  });
});
