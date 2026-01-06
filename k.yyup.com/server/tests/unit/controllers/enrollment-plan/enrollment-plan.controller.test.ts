// Mock dependencies
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { 
  createEnrollmentPlan, 
  getEnrollmentPlans, 
  getEnrollmentPlanById, 
  updateEnrollmentPlan, 
  deleteEnrollmentPlan,
  approveEnrollmentPlan,
  getEnrollmentPlanStats
} from '../../../src/controllers/enrollment-plan/enrollment-plan.controller';
import { ApiError } from '../../../src/utils/apiError';
import { ApiResponse } from '../../../src/utils/apiResponse';

const mockRequest = () => ({
  body: {},
  query: {},
  params: {},
  user: null
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

describe('Enrollment Plan Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createEnrollmentPlan', () => {
    it('应该成功创建招生计划', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        title: '2024年春季招生计划',
        description: '春季招生详细计划',
        academicYear: '2024',
        semester: 'spring',
        totalQuota: 100,
        startDate: '2024-03-01',
        endDate: '2024-03-31'
      };
      req.user = { id: 1 };

      await createEnrollmentPlan(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的创建请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        title: '2024年春季招生计划'
      };
      req.user = null;

      await createEnrollmentPlan(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          code: 'UNAUTHORIZED'
        })
      );
    });

    it('应该验证计划标题不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        // 缺少title
        description: '春季招生详细计划',
        academicYear: '2024'
      };
      req.user = { id: 1 };

      await createEnrollmentPlan(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          code: 'BAD_REQUEST'
        })
      );
    });

    it('应该验证学年不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        title: '2024年春季招生计划',
        description: '春季招生详细计划'
        // 缺少academicYear
      };
      req.user = { id: 1 };

      await createEnrollmentPlan(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          code: 'BAD_REQUEST'
        })
      );
    });

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        title: '2024年春季招生计划',
        academicYear: '2024'
      };
      req.user = { id: 1 };

      // 模拟错误
      const originalCreateEnrollmentPlan = createEnrollmentPlan;
      (createEnrollmentPlan as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await createEnrollmentPlan(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));

      // 恢复原始函数
      (createEnrollmentPlan as jest.Mock).mockImplementation(originalCreateEnrollmentPlan);
    });
  });

  describe('getEnrollmentPlans', () => {
    it('应该成功获取招生计划列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        page: '1',
        limit: '10',
        academicYear: '2024',
        status: 'active'
      };
      req.user = { id: 1 };

      await getEnrollmentPlans(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该使用默认分页参数', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {}; // 缺少分页参数
      req.user = { id: 1 };

      await getEnrollmentPlans(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = { page: '1', limit: '10' };
      req.user = { id: 1 };

      // 模拟错误
      const originalGetEnrollmentPlans = getEnrollmentPlans;
      (getEnrollmentPlans as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getEnrollmentPlans(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));

      // 恢复原始函数
      (getEnrollmentPlans as jest.Mock).mockImplementation(originalGetEnrollmentPlans);
    });
  });

  describe('getEnrollmentPlanById', () => {
    it('应该成功获取招生计划详情', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.user = { id: 1 };

      await getEnrollmentPlanById(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该验证计划ID不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = {}; // 缺少id
      req.user = { id: 1 };

      await getEnrollmentPlanById(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          code: 'BAD_REQUEST'
        })
      );
    });

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.user = { id: 1 };

      // 模拟错误
      const originalGetEnrollmentPlanById = getEnrollmentPlanById;
      (getEnrollmentPlanById as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getEnrollmentPlanById(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));

      // 恢复原始函数
      (getEnrollmentPlanById as jest.Mock).mockImplementation(originalGetEnrollmentPlanById);
    });
  });

  describe('updateEnrollmentPlan', () => {
    it('应该成功更新招生计划', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        title: '更新后的招生计划',
        totalQuota: 120,
        status: 'active'
      };
      req.user = { id: 1 };

      await updateEnrollmentPlan(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的更新请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = { title: '更新后的招生计划' };
      req.user = null;

      await updateEnrollmentPlan(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          code: 'UNAUTHORIZED'
        })
      );
    });

    it('应该验证计划ID不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = {}; // 缺少id
      req.body = { title: '更新后的招生计划' };
      req.user = { id: 1 };

      await updateEnrollmentPlan(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          code: 'BAD_REQUEST'
        })
      );
    });

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = { title: '更新后的招生计划' };
      req.user = { id: 1 };

      // 模拟错误
      const originalUpdateEnrollmentPlan = updateEnrollmentPlan;
      (updateEnrollmentPlan as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await updateEnrollmentPlan(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));

      // 恢复原始函数
      (updateEnrollmentPlan as jest.Mock).mockImplementation(originalUpdateEnrollmentPlan);
    });
  });

  describe('deleteEnrollmentPlan', () => {
    it('应该成功删除招生计划', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.user = { id: 1 };

      await deleteEnrollmentPlan(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的删除请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.user = null;

      await deleteEnrollmentPlan(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          code: 'UNAUTHORIZED'
        })
      );
    });

    it('应该验证计划ID不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = {}; // 缺少id
      req.user = { id: 1 };

      await deleteEnrollmentPlan(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          code: 'BAD_REQUEST'
        })
      );
    });

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.user = { id: 1 };

      // 模拟错误
      const originalDeleteEnrollmentPlan = deleteEnrollmentPlan;
      (deleteEnrollmentPlan as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await deleteEnrollmentPlan(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));

      // 恢复原始函数
      (deleteEnrollmentPlan as jest.Mock).mockImplementation(originalDeleteEnrollmentPlan);
    });
  });

  describe('approveEnrollmentPlan', () => {
    it('应该成功审批招生计划', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        status: 'approved',
        comments: '计划合理，同意执行'
      };
      req.user = { id: 1 };

      await approveEnrollmentPlan(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的审批请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = { status: 'approved' };
      req.user = null;

      await approveEnrollmentPlan(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          code: 'UNAUTHORIZED'
        })
      );
    });

    it('应该验证计划ID不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = {}; // 缺少id
      req.body = { status: 'approved' };
      req.user = { id: 1 };

      await approveEnrollmentPlan(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          code: 'BAD_REQUEST'
        })
      );
    });

    it('应该验证审批状态不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        // 缺少status
        comments: '计划合理，同意执行'
      };
      req.user = { id: 1 };

      await approveEnrollmentPlan(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          code: 'BAD_REQUEST'
        })
      );
    });

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = { status: 'approved' };
      req.user = { id: 1 };

      // 模拟错误
      const originalApproveEnrollmentPlan = approveEnrollmentPlan;
      (approveEnrollmentPlan as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await approveEnrollmentPlan(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));

      // 恢复原始函数
      (approveEnrollmentPlan as jest.Mock).mockImplementation(originalApproveEnrollmentPlan);
    });
  });

  describe('getEnrollmentPlanStats', () => {
    it('应该成功获取招生计划统计', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        academicYear: '2024',
        semester: 'spring'
      };
      req.user = { id: 1 };

      await getEnrollmentPlanStats(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该使用默认参数', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {}; // 缺少参数
      req.user = { id: 1 };

      await getEnrollmentPlanStats(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = { academicYear: '2024' };
      req.user = { id: 1 };

      // 模拟错误
      const originalGetEnrollmentPlanStats = getEnrollmentPlanStats;
      (getEnrollmentPlanStats as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getEnrollmentPlanStats(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));

      // 恢复原始函数
      (getEnrollmentPlanStats as jest.Mock).mockImplementation(originalGetEnrollmentPlanStats);
    });
  });
});