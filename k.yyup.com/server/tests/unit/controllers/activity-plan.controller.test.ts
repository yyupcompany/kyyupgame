// Mock dependencies
jest.mock('../../../src/init');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');
jest.mock('../../../src/models/activity.model');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { 
  createActivityPlan, 
  getActivityPlanById, 
  updateActivityPlan, 
  deleteActivityPlan,
  getActivityPlans,
  updateActivityStatus,
  cancelActivity,
  getActivityStatistics
} from '../../../src/controllers/activity-plan.controller';
import { sequelize } from '../../../src/init';
import { ApiError } from '../../../src/utils/apiError';
import { ApiResponse } from '../../../src/utils/apiResponse';
import { ActivityStatus } from '../../../src/models/activity.model';
import { QueryTypes } from 'sequelize';

// Mock implementations
const mockSequelize = {
  query: jest.fn()
};

// Setup mocks
(sequelize as any) = mockSequelize;

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

describe('Activity Plan Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createActivityPlan', () => {
    it('应该成功创建活动计划', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        title: '春季亲子活动',
        description: '户外亲子互动活动'
      };
      req.user = { id: 1 };

      await createActivityPlan(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          title: '春季亲子活动',
          description: '户外亲子互动活动',
          status: ActivityStatus.PLANNED,
          creatorId: 1,
          createdAt: expect.any(Date),
          id: expect.any(Number)
        }),
        message: '创建活动计划成功'
      });
    });

    it('应该使用默认值创建活动计划', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {}; // 空body
      req.user = { id: 1 };

      await createActivityPlan(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          title: '新活动计划',
          description: '活动描述',
          status: ActivityStatus.PLANNED,
          creatorId: 1
        }),
        message: '创建活动计划成功'
      });
    });

    it('应该拒绝未登录用户的创建请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        title: '春季亲子活动'
      };
      req.user = null;

      await createActivityPlan(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          code: 'UNAUTHORIZED',
          message: '未登录或登录已过期'
        })
      );
    });

    it('应该处理错误并调用next', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        title: '春季亲子活动'
      };
      req.user = { id: 1 };

      // 模拟错误
      const originalCreateActivityPlan = createActivityPlan;
      (createActivityPlan as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Database error');
      });

      await createActivityPlan(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));

      // 恢复原始函数
      (createActivityPlan as jest.Mock).mockImplementation(originalCreateActivityPlan);
    });
  });

  describe('getActivityPlanById', () => {
    it('应该成功从数据库获取活动计划详情', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      const mockActivity = [{
        id: 1,
        title: '春季亲子活动',
        description: '户外亲子互动活动',
        status: ActivityStatus.REGISTRATION_OPEN,
        created_at: new Date()
      }];

      mockSequelize.query.mockResolvedValue(mockActivity);

      await getActivityPlanById(req as Request, res as Response, mockNext);

      expect(mockSequelize.query).toHaveBeenCalledWith(
        'SELECT * FROM activities WHERE id = ? AND deleted_at IS NULL',
        {
          replacements: [1],
          type: 'SELECT'
        }
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockActivity[0],
        message: '获取活动计划详情成功'
      });
    });

    it('应该在数据库查询失败时返回模拟数据', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      mockSequelize.query.mockRejectedValue(new Error('Database connection failed'));

      await getActivityPlanById(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: 1,
          title: '示例活动计划',
          description: '这是一个示例活动计划',
          status: ActivityStatus.REGISTRATION_OPEN,
          createdAt: expect.any(Date)
        }),
        message: '获取活动计划详情成功'
      });
    });

    it('应该在数据库返回空结果时返回模拟数据', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '999' };

      mockSequelize.query.mockResolvedValue([]); // 空结果

      await getActivityPlanById(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: 999,
          title: '示例活动计划'
        }),
        message: '获取活动计划详情成功'
      });
    });

    it('应该处理无效的ID参数', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: 'invalid' };

      mockSequelize.query.mockRejectedValue(new Error('Database connection failed'));

      await getActivityPlanById(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: 0,
          title: '示例活动计划'
        }),
        message: '获取活动计划详情成功'
      });
    });

    it('应该处理错误并调用next', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      // 模拟错误
      const originalGetActivityPlanById = getActivityPlanById;
      (getActivityPlanById as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Unexpected error');
      });

      await getActivityPlanById(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));

      // 恢复原始函数
      (getActivityPlanById as jest.Mock).mockImplementation(originalGetActivityPlanById);
    });
  });

  describe('updateActivityPlan', () => {
    it('应该成功更新活动计划', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        title: '更新的春季亲子活动',
        description: '更新的活动描述',
        status: ActivityStatus.IN_PROGRESS
      };
      req.user = { id: 1 };

      await updateActivityPlan(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: 1,
          title: '更新的春季亲子活动',
          description: '更新的活动描述',
          status: ActivityStatus.IN_PROGRESS,
          updaterId: 1,
          updatedAt: expect.any(Date)
        }),
        message: '更新活动计划成功'
      });
    });

    it('应该使用默认值更新活动计划', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {}; // 空body
      req.user = { id: 1 };

      await updateActivityPlan(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: 1,
          title: '更新的活动计划',
          description: '更新的活动描述',
          status: ActivityStatus.REGISTRATION_OPEN,
          updaterId: 1
        }),
        message: '更新活动计划成功'
      });
    });

    it('应该拒绝未登录用户的更新请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        title: '更新的活动'
      };
      req.user = null;

      await updateActivityPlan(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          code: 'UNAUTHORIZED',
          message: '未登录或登录已过期'
        })
      );
    });

    it('应该处理无效的ID参数', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: 'invalid' };
      req.body = {
        title: '更新的活动'
      };
      req.user = { id: 1 };

      await updateActivityPlan(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: 0,
          title: '更新的活动计划'
        }),
        message: '更新活动计划成功'
      });
    });

    it('应该处理错误并调用next', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        title: '更新的活动'
      };
      req.user = { id: 1 };

      // 模拟错误
      const originalUpdateActivityPlan = updateActivityPlan;
      (updateActivityPlan as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Database error');
      });

      await updateActivityPlan(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));

      // 恢复原始函数
      (updateActivityPlan as jest.Mock).mockImplementation(originalUpdateActivityPlan);
    });
  });

  describe('deleteActivityPlan', () => {
    it('应该成功删除活动计划', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      await deleteActivityPlan(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message: '删除活动计划成功'
      });
    });

    it('应该处理无效的ID参数', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: 'invalid' };

      await deleteActivityPlan(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message: '删除活动计划成功'
      });
    });

    it('应该处理错误并调用next', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      // 模拟错误
      const originalDeleteActivityPlan = deleteActivityPlan;
      (deleteActivityPlan as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Database error');
      });

      await deleteActivityPlan(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));

      // 恢复原始函数
      (deleteActivityPlan as jest.Mock).mockImplementation(originalDeleteActivityPlan);
    });
  });

  describe('getActivityPlans', () => {
    it('应该成功从数据库获取活动计划列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        page: '1',
        size: '10'
      };

      const mockActivities = [
        {
          id: 1,
          title: '春季亲子活动',
          description: '户外亲子互动活动',
          status: ActivityStatus.REGISTRATION_OPEN,
          created_at: new Date()
        },
        {
          id: 2,
          title: '夏季游泳课程',
          description: '儿童游泳培训课程',
          status: ActivityStatus.IN_PROGRESS,
          created_at: new Date()
        }
      ];

      const mockCountResult = [{ total: 2 }];

      mockSequelize.query
        .mockResolvedValueOnce(mockActivities) // 查询活动列表
        .mockResolvedValueOnce(mockCountResult); // 查询总数

      await getActivityPlans(req as Request, res as Response, mockNext);

      expect(mockSequelize.query).toHaveBeenCalledTimes(2);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          data: mockActivities,
          pagination: expect.objectContaining({
            page: 1,
            size: 10,
            total: 2,
            totalPages: 1
          })
        }),
        message: '获取活动计划列表成功'
      });
    });

    it('应该在数据库查询失败时返回模拟数据', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        page: '1',
        size: '10'
      };

      mockSequelize.query.mockRejectedValue(new Error('Database connection failed'));

      await getActivityPlans(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              id: 1,
              title: '春季亲子活动',
              status: ActivityStatus.REGISTRATION_OPEN
            }),
            expect.objectContaining({
              id: 2,
              title: '夏季游泳课程',
              status: ActivityStatus.IN_PROGRESS
            })
          ]),
          pagination: expect.objectContaining({
            page: 1,
            size: 10,
            total: 2,
            totalPages: 1
          })
        }),
        message: '获取活动计划列表成功'
      });
    });

    it('应该使用默认的分页参数', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {}; // 缺少分页参数

      mockSequelize.query.mockRejectedValue(new Error('Database connection failed'));

      await getActivityPlans(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          pagination: expect.objectContaining({
            page: 1,
            size: 10
          })
        }),
        message: '获取活动计划列表成功'
      });
    });

    it('应该处理空结果的情况', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        page: '1',
        size: '10'
      };

      const mockActivities = [];
      const mockCountResult = [{ total: 0 }];

      mockSequelize.query
        .mockResolvedValueOnce(mockActivities)
        .mockResolvedValueOnce(mockCountResult);

      await getActivityPlans(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          data: [],
          pagination: expect.objectContaining({
            page: 1,
            size: 10,
            total: 0,
            totalPages: 0
          })
        }),
        message: '获取活动计划列表成功'
      });
    });

    it('应该处理错误并调用next', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        page: '1',
        size: '10'
      };

      // 模拟错误
      const originalGetActivityPlans = getActivityPlans;
      (getActivityPlans as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Unexpected error');
      });

      await getActivityPlans(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));

      // 恢复原始函数
      (getActivityPlans as jest.Mock).mockImplementation(originalGetActivityPlans);
    });
  });

  describe('updateActivityStatus', () => {
    it('应该成功更新活动状态', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        status: ActivityStatus.IN_PROGRESS
      };
      req.user = { id: 1 };

      await updateActivityStatus(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: 1,
          status: ActivityStatus.IN_PROGRESS,
          updaterId: 1,
          updatedAt: expect.any(Date)
        }),
        message: '更新活动状态成功'
      });
    });

    it('应该拒绝未登录用户的更新请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        status: ActivityStatus.IN_PROGRESS
      };
      req.user = null;

      await updateActivityStatus(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          code: 'UNAUTHORIZED',
          message: '未登录或登录已过期'
        })
      );
    });

    it('应该处理无效的ID参数', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: 'invalid' };
      req.body = {
        status: ActivityStatus.IN_PROGRESS
      };
      req.user = { id: 1 };

      await updateActivityStatus(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: 0,
          status: ActivityStatus.IN_PROGRESS
        }),
        message: '更新活动状态成功'
      });
    });

    it('应该处理错误并调用next', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        status: ActivityStatus.IN_PROGRESS
      };
      req.user = { id: 1 };

      // 模拟错误
      const originalUpdateActivityStatus = updateActivityStatus;
      (updateActivityStatus as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Database error');
      });

      await updateActivityStatus(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));

      // 恢复原始函数
      (updateActivityStatus as jest.Mock).mockImplementation(originalUpdateActivityStatus);
    });
  });

  describe('cancelActivity', () => {
    it('应该成功取消活动', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        cancelReason: '天气原因取消'
      };
      req.user = { id: 1 };

      await cancelActivity(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: 1,
          status: ActivityStatus.CANCELLED,
          cancelReason: '天气原因取消',
          updaterId: 1,
          updatedAt: expect.any(Date)
        }),
        message: '取消活动成功'
      });
    });

    it('应该拒绝未登录用户的取消请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        cancelReason: '天气原因取消'
      };
      req.user = null;

      await cancelActivity(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          code: 'UNAUTHORIZED',
          message: '未登录或登录已过期'
        })
      );
    });

    it('应该验证取消原因不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        // 缺少cancelReason
      };
      req.user = { id: 1 };

      await cancelActivity(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          code: 'BAD_REQUEST',
          message: '取消原因不能为空'
        })
      );
    });

    it('应该验证取消原因不能为空字符串', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        cancelReason: '' // 空字符串
      };
      req.user = { id: 1 };

      await cancelActivity(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          code: 'BAD_REQUEST',
          message: '取消原因不能为空'
        })
      );
    });

    it('应该处理无效的ID参数', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: 'invalid' };
      req.body = {
        cancelReason: '天气原因取消'
      };
      req.user = { id: 1 };

      await cancelActivity(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: 0,
          status: ActivityStatus.CANCELLED,
          cancelReason: '天气原因取消'
        }),
        message: '取消活动成功'
      });
    });

    it('应该处理错误并调用next', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        cancelReason: '天气原因取消'
      };
      req.user = { id: 1 };

      // 模拟错误
      const originalCancelActivity = cancelActivity;
      (cancelActivity as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Database error');
      });

      await cancelActivity(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));

      // 恢复原始函数
      (cancelActivity as jest.Mock).mockImplementation(originalCancelActivity);
    });
  });

  describe('getActivityStatistics', () => {
    it('应该成功获取活动统计数据', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      await getActivityStatistics(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          activityId: 1,
          totalRegistrations: 25,
          confirmedRegistrations: 20,
          pendingRegistrations: 3,
          cancelledRegistrations: 2,
          checkInCount: 18,
          conversionRate: 0.72
        }),
        message: '获取活动统计数据成功'
      });
    });

    it('应该处理无效的ID参数', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: 'invalid' };

      await getActivityStatistics(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          activityId: 0,
          totalRegistrations: 25
        }),
        message: '获取活动统计数据成功'
      });
    });

    it('应该处理错误并调用next', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      // 模拟错误
      const originalGetActivityStatistics = getActivityStatistics;
      (getActivityStatistics as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Database error');
      });

      await getActivityStatistics(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));

      // 恢复原始函数
      (getActivityStatistics as jest.Mock).mockImplementation(originalGetActivityStatistics);
    });
  });
});