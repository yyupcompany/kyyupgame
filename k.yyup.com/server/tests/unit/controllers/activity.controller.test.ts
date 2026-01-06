// Mock dependencies
jest.mock('../../../src/services/activity/activity.service');
jest.mock('../../../src/utils/apiResponse');
jest.mock('../../../src/utils/apiError');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { ActivityController } from '../../../src/controllers/activity.controller';
import { activityService } from '../../../src/services/activity/activity.service';
import { ApiResponse } from '../../../src/utils/apiResponse';
import { ApiError } from '../../../src/utils/apiError';
import { ActivityStatus, ActivityType } from '../../../src/models/activity.model';

// Mock implementations
const mockActivityService = {
  createActivity: jest.fn(),
  getActivities: jest.fn(),
  getActivityById: jest.fn(),
  updateActivity: jest.fn(),
  deleteActivity: jest.fn(),
  updateStatus: jest.fn(),
  getActivityStatistics: jest.fn()
};

// Setup mocks
(activityService as any) = mockActivityService;

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

describe('Activity Controller', () => {
  let activityController: ActivityController;

  beforeEach(() => {
    jest.clearAllMocks();
    activityController = new ActivityController();
  });

  describe('create', () => {
    it('应该成功创建活动', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        title: '春游活动',
        description: '幼儿园春游活动',
        activityType: ActivityType.OUTDOOR,
        kindergartenId: 1,
        startTime: '2024-04-01 09:00:00',
        endTime: '2024-04-01 16:00:00',
        location: '公园',
        maxParticipants: 50
      };

      const mockCreatedActivity = {
        id: 1,
        title: '春游活动',
        description: '幼儿园春游活动',
        activityType: ActivityType.OUTDOOR,
        kindergartenId: 1,
        creatorId: 1,
        status: ActivityStatus.DRAFT
      };

      mockActivityService.createActivity.mockResolvedValue(mockCreatedActivity);

      await activityController.create(req as Request, res as Response, mockNext);

      expect(mockActivityService.createActivity).toHaveBeenCalledWith(req.body, 1);
      expect(ApiResponse.success).toHaveBeenCalledWith(res, mockCreatedActivity, '创建活动成功');
    });

    it('应该处理未登录用户', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = null;
      req.body = { title: '测试活动' };

      await activityController.create(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '用户未登录'
        })
      );
    });

    it('应该处理服务层错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = { title: '测试活动' };

      const serviceError = new Error('Service error');
      mockActivityService.createActivity.mockRejectedValue(serviceError);

      await activityController.create(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('getList', () => {
    it('应该成功获取活动列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        page: '1',
        pageSize: '10',
        keyword: '春游',
        kindergartenId: '1',
        activityType: '1',
        status: '1'
      };

      const mockActivityList = {
        rows: [
          { id: 1, title: '春游活动', activityType: ActivityType.OUTDOOR },
          { id: 2, title: '春季运动会', activityType: ActivityType.SPORTS }
        ],
        count: 2
      };

      mockActivityService.getActivities.mockResolvedValue(mockActivityList);

      await activityController.getList(req as Request, res as Response, mockNext);

      expect(mockActivityService.getActivities).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        keyword: '春游',
        kindergartenId: 1,
        planId: undefined,
        activityType: 1,
        status: 1,
        startDate: undefined,
        endDate: undefined,
        sortBy: 'created_at',
        sortOrder: 'DESC'
      });
      expect(ApiResponse.success).toHaveBeenCalledWith(res, {
        items: mockActivityList.rows,
        total: mockActivityList.count,
        page: 1,
        pageSize: 10
      });
    });

    it('应该使用默认查询参数', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const mockEmptyList = { rows: [], count: 0 };
      mockActivityService.getActivities.mockResolvedValue(mockEmptyList);

      await activityController.getList(req as Request, res as Response, mockNext);

      expect(mockActivityService.getActivities).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        keyword: undefined,
        kindergartenId: undefined,
        planId: undefined,
        activityType: undefined,
        status: undefined,
        startDate: undefined,
        endDate: undefined,
        sortBy: 'created_at',
        sortOrder: 'DESC'
      });
    });

    it('应该处理日期范围查询', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        startDate: '2024-04-01',
        endDate: '2024-04-30',
        sortBy: 'start_time',
        sortOrder: 'ASC'
      };

      const mockActivityList = { rows: [], count: 0 };
      mockActivityService.getActivities.mockResolvedValue(mockActivityList);

      await activityController.getList(req as Request, res as Response, mockNext);

      expect(mockActivityService.getActivities).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        keyword: undefined,
        kindergartenId: undefined,
        planId: undefined,
        activityType: undefined,
        status: undefined,
        startDate: '2024-04-01',
        endDate: '2024-04-30',
        sortBy: 'start_time',
        sortOrder: 'ASC'
      });
    });

    it('应该处理无效的查询参数', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        page: 'invalid',
        pageSize: 'invalid',
        kindergartenId: 'invalid',
        activityType: 'undefined',
        status: 'undefined'
      };

      const mockActivityList = { rows: [], count: 0 };
      mockActivityService.getActivities.mockResolvedValue(mockActivityList);

      await activityController.getList(req as Request, res as Response, mockNext);

      expect(mockActivityService.getActivities).toHaveBeenCalledWith({
        page: 1, // 默认值
        pageSize: 10, // 默认值
        keyword: undefined,
        kindergartenId: undefined, // NaN转为undefined
        planId: undefined,
        activityType: undefined, // 'undefined'字符串转为undefined
        status: undefined, // 'undefined'字符串转为undefined
        startDate: undefined,
        endDate: undefined,
        sortBy: 'created_at',
        sortOrder: 'DESC'
      });
    });

    it('应该处理服务层错误', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const serviceError = new Error('Database error');
      mockActivityService.getActivities.mockRejectedValue(serviceError);

      await activityController.getList(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('getById', () => {
    it('应该成功获取活动详情', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      const mockActivity = {
        id: 1,
        title: '春游活动',
        description: '幼儿园春游活动',
        activityType: ActivityType.OUTDOOR,
        kindergartenId: 1,
        status: ActivityStatus.PUBLISHED,
        startTime: '2024-04-01 09:00:00',
        endTime: '2024-04-01 16:00:00',
        location: '公园',
        maxParticipants: 50,
        currentParticipants: 25
      };

      mockActivityService.getActivityById.mockResolvedValue(mockActivity);

      await activityController.getById(req as Request, res as Response, mockNext);

      expect(mockActivityService.getActivityById).toHaveBeenCalledWith(1);
      expect(ApiResponse.success).toHaveBeenCalledWith(res, mockActivity);
    });

    it('应该处理活动不存在的情况', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '999' };

      mockActivityService.getActivityById.mockResolvedValue(null);

      await activityController.getById(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '活动不存在'
        })
      );
    });

    it('应该处理无效的活动ID', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: 'invalid' };

      const error = new Error('Invalid ID');
      mockActivityService.getActivityById.mockRejectedValue(error);

      await activityController.getById(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('update', () => {
    it('应该成功更新活动', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        title: '更新的春游活动',
        description: '更新的活动描述',
        location: '新公园',
        maxParticipants: 60
      };

      const mockUpdatedActivity = {
        id: 1,
        title: '更新的春游活动',
        description: '更新的活动描述',
        location: '新公园',
        maxParticipants: 60
      };

      mockActivityService.updateActivity.mockResolvedValue(mockUpdatedActivity);

      await activityController.update(req as Request, res as Response, mockNext);

      expect(mockActivityService.updateActivity).toHaveBeenCalledWith(1, req.body);
      expect(ApiResponse.success).toHaveBeenCalledWith(res, mockUpdatedActivity, '更新活动成功');
    });

    it('应该处理更新不存在的活动', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '999' };
      req.body = { title: '不存在的活动' };

      const error = new Error('Activity not found');
      mockActivityService.updateActivity.mockRejectedValue(error);

      await activityController.update(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('delete', () => {
    it('应该成功删除活动', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      mockActivityService.deleteActivity.mockResolvedValue(undefined);

      await activityController.delete(req as Request, res as Response, mockNext);

      expect(mockActivityService.deleteActivity).toHaveBeenCalledWith(1);
      expect(ApiResponse.success).toHaveBeenCalledWith(res, null, '删除活动成功');
    });

    it('应该处理删除失败', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      const error = new Error('Delete failed');
      mockActivityService.deleteActivity.mockRejectedValue(error);

      await activityController.delete(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateStatus', () => {
    it('应该成功更新活动状态', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = { status: ActivityStatus.PUBLISHED };

      const mockUpdatedActivity = {
        id: 1,
        title: '春游活动',
        status: ActivityStatus.PUBLISHED
      };

      mockActivityService.updateStatus.mockResolvedValue(mockUpdatedActivity);

      await activityController.updateStatus(req as Request, res as Response, mockNext);

      expect(mockActivityService.updateStatus).toHaveBeenCalledWith(1, ActivityStatus.PUBLISHED);
      expect(ApiResponse.success).toHaveBeenCalledWith(res, mockUpdatedActivity, '更新活动状态成功');
    });

    it('应该处理无效的状态值', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = { status: 'invalid_status' };

      const error = new Error('Invalid status');
      mockActivityService.updateStatus.mockRejectedValue(error);

      await activityController.updateStatus(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getStatistics', () => {
    it('应该成功获取活动统计信息', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        kindergartenId: '1',
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      };

      const mockStatistics = {
        totalActivities: 50,
        publishedActivities: 35,
        draftActivities: 10,
        cancelledActivities: 5,
        totalParticipants: 1250,
        averageParticipants: 25,
        activitiesByType: {
          [ActivityType.OUTDOOR]: 15,
          [ActivityType.INDOOR]: 20,
          [ActivityType.SPORTS]: 10,
          [ActivityType.ARTS]: 5
        },
        activitiesByMonth: [
          { month: '2024-01', count: 5 },
          { month: '2024-02', count: 8 },
          { month: '2024-03', count: 12 }
        ]
      };

      mockActivityService.getActivityStatistics.mockResolvedValue(mockStatistics);

      await activityController.getStatistics(req as Request, res as Response, mockNext);

      expect(mockActivityService.getActivityStatistics).toHaveBeenCalledWith(1);
      expect(ApiResponse.success).toHaveBeenCalledWith(res, mockStatistics, '获取活动统计成功');
    });

    it('应该处理无查询参数的统计请求', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const mockStatistics = {
        totalActivities: 0,
        publishedActivities: 0,
        draftActivities: 0,
        cancelledActivities: 0
      };

      mockActivityService.getActivityStatistics.mockResolvedValue(mockStatistics);

      await activityController.getStatistics(req as Request, res as Response, mockNext);

      expect(mockActivityService.getActivityStatistics).toHaveBeenCalledWith(undefined);
      expect(ApiResponse.success).toHaveBeenCalledWith(res, mockStatistics, '获取活动统计成功');
    });

    it('应该处理统计服务错误', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const serviceError = new Error('Statistics service error');
      mockActivityService.getActivityStatistics.mockRejectedValue(serviceError);

      await activityController.getStatistics(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('publish', () => {
    it('应该成功发布活动', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      const mockPublishedActivity = {
        id: 1,
        title: '春游活动',
        status: ActivityStatus.REGISTRATION_OPEN
      };

      mockActivityService.updateActivityStatus.mockResolvedValue(mockPublishedActivity);

      await activityController.publish(req as Request, res as Response, mockNext);

      expect(mockActivityService.updateActivityStatus).toHaveBeenCalledWith(
        1,
        ActivityStatus.REGISTRATION_OPEN,
        1
      );
      expect(ApiResponse.success).toHaveBeenCalledWith(res, mockPublishedActivity, '发布活动成功');
    });

    it('应该处理未登录用户发布活动', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.user = null;

      await activityController.publish(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '用户未登录'
        })
      );
    });

    it('应该处理发布失败', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      const serviceError = new Error('Publish failed');
      mockActivityService.updateActivityStatus.mockRejectedValue(serviceError);

      await activityController.publish(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });
  });
});
