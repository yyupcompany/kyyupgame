// Mock dependencies
jest.mock('../../../../../src/init');
jest.mock('../../../../../src/models/activity.model');
jest.mock('../../../../../src/models/kindergarten.model');
jest.mock('../../../../../src/models/user.model');
jest.mock('../../../../../src/utils/apiError');

import { ActivityService } from '../../../../../src/services/activity/activity.service';
import { vi } from 'vitest'
import { Activity, ActivityStatus, ActivityType } from '../../../../../src/models/activity.model';
import { Kindergarten } from '../../../../../src/models/kindergarten.model';
import { User } from '../../../../../src/models/user.model';
import { ApiError } from '../../../../../src/utils/apiError';
import { sequelize } from '../../../../../src/init';

// Mock instances
const mockSequelize = {
  transaction: jest.fn(),
  query: jest.fn()
};

const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn()
};

// Mock model instances
const mockActivityModel = {
  create: jest.fn(),
  findByPk: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn()
};

const mockKindergartenModel = {
  findByPk: jest.fn()
};

const mockUserModel = {
  findByPk: jest.fn()
};

// Setup mocks
(sequelize as any) = mockSequelize;
(Activity as any) = mockActivityModel;
(Kindergarten as any) = mockKindergartenModel;
(User as any) = mockUserModel;


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

describe('ActivityService', () => {
  let activityService: ActivityService;

  beforeEach(() => {
    jest.clearAllMocks();
    activityService = new ActivityService();
    mockSequelize.transaction.mockResolvedValue(mockTransaction);
  });

  describe('createActivity', () => {
    it('should create activity successfully', async () => {
      const dto = {
        kindergartenId: 1,
        title: '春游活动',
        activityType: ActivityType.OUTDOOR,
        startTime: '2024-04-01T09:00:00',
        endTime: '2024-04-01T16:00:00',
        location: '公园',
        capacity: 50,
        registrationStartTime: '2024-03-15T00:00:00',
        registrationEndTime: '2024-03-31T23:59:59',
        needsApproval: true,
        description: '幼儿园春游活动'
      };

      const mockKindergarten = { id: 1, name: '阳光幼儿园' };
      const mockCreatedActivity = { id: 1, ...dto };

      mockKindergartenModel.findByPk.mockResolvedValue(mockKindergarten);
      mockActivityModel.create.mockResolvedValue(mockCreatedActivity);
      jest.spyOn(activityService, 'getActivityById' as any).mockResolvedValue(mockCreatedActivity);

      const result = await activityService.createActivity(dto, 1);

      expect(result).toEqual(mockCreatedActivity);
      expect(mockKindergartenModel.findByPk).toHaveBeenCalledWith(dto.kindergartenId, { transaction: mockTransaction });
      expect(mockActivityModel.create).toHaveBeenCalledWith({
        ...dto,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        registrationStartTime: new Date(dto.registrationStartTime),
        registrationEndTime: new Date(dto.registrationEndTime),
        registeredCount: 0,
        checkedInCount: 0,
        fee: 0,
        needsApproval: true,
        status: ActivityStatus.PLANNED,
        creatorId: 1,
        updaterId: 1
      }, { transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('should throw error if kindergarten does not exist', async () => {
      const dto = {
        kindergartenId: 999,
        title: '测试活动',
        startTime: '2024-04-01T09:00:00',
        endTime: '2024-04-01T16:00:00',
        registrationStartTime: '2024-03-15T00:00:00',
        registrationEndTime: '2024-03-31T23:59:59'
      };

      mockKindergartenModel.findByPk.mockResolvedValue(null);

      await expect(activityService.createActivity(dto, 1)).rejects.toThrow('指定的幼儿园不存在');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should throw error if start time is after end time', async () => {
      const dto = {
        kindergartenId: 1,
        title: '测试活动',
        startTime: '2024-04-01T16:00:00',
        endTime: '2024-04-01T09:00:00',
        registrationStartTime: '2024-03-15T00:00:00',
        registrationEndTime: '2024-03-31T23:59:59'
      };

      mockKindergartenModel.findByPk.mockResolvedValue({ id: 1 });

      await expect(activityService.createActivity(dto, 1)).rejects.toThrow('活动结束时间必须晚于开始时间');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should throw error if registration ends after activity starts', async () => {
      const dto = {
        kindergartenId: 1,
        title: '测试活动',
        startTime: '2024-04-01T09:00:00',
        endTime: '2024-04-01T16:00:00',
        registrationStartTime: '2024-03-15T00:00:00',
        registrationEndTime: '2024-04-02T00:00:00'
      };

      mockKindergartenModel.findByPk.mockResolvedValue({ id: 1 });

      await expect(activityService.createActivity(dto, 1)).rejects.toThrow('报名必须在活动开始前结束');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('getActivities', () => {
    it('should return activities with filters', async () => {
      const filters = {
        page: 1,
        pageSize: 10,
        keyword: '春游',
        kindergartenId: 1,
        activityType: ActivityType.OUTDOOR,
        status: ActivityStatus.PLANNED,
        sortBy: 'start_time',
        sortOrder: 'ASC' as const
      };

      const mockCountResult = [{ total: 2 }];
      const mockDataResult = [
        { id: 1, title: '春游活动', kindergarten_name: '阳光幼儿园' },
        { id: 2, title: '春季运动会', kindergarten_name: '阳光幼儿园' }
      ];

      mockSequelize.query
        .mockResolvedValueOnce(mockCountResult)
        .mockResolvedValueOnce(mockDataResult);

      const result = await activityService.getActivities(filters);

      expect(result).toEqual({
        rows: mockDataResult,
        count: 2
      });
    });

    it('should handle pagination parameters correctly', async () => {
      const filters = {
        page: 0,
        pageSize: 150
      };

      const mockCountResult = [{ total: 0 }];
      const mockDataResult = [];

      mockSequelize.query
        .mockResolvedValueOnce(mockCountResult)
        .mockResolvedValueOnce(mockDataResult);

      await activityService.getActivities(filters);

      // Should normalize invalid pagination values
      expect(mockSequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT :limit OFFSET :offset'),
        expect.objectContaining({
          replacements: expect.objectContaining({
            limit: 100, // Max page size
            offset: 0   // Page 1 (since page 0 becomes 1)
          })
        })
      );
    });

    it('should handle empty filters', async () => {
      const filters = {};

      const mockCountResult = [{ total: 0 }];
      const mockDataResult = [];

      mockSequelize.query
        .mockResolvedValueOnce(mockCountResult)
        .mockResolvedValueOnce(mockDataResult);

      const result = await activityService.getActivities(filters);

      expect(result).toEqual({
        rows: [],
        count: 0
      });
    });
  });

  describe('getActivityById', () => {
    it('should return activity by id', async () => {
      const activityId = 1;
      const mockActivity = [{
        id: 1,
        title: '春游活动',
        kindergarten_name: '阳光幼儿园',
        creator_name: '管理员'
      }];

      mockSequelize.query.mockResolvedValue(mockActivity);

      const result = await activityService.getActivityById(activityId);

      expect(result).toEqual(mockActivity[0]);
      expect(mockSequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE a.id = :id'),
        { replacements: { id: activityId } }
      );
    });

    it('should throw error if activity not found', async () => {
      mockSequelize.query.mockResolvedValue([]);

      await expect(activityService.getActivityById(999)).rejects.toThrow('活动不存在');
    });
  });

  describe('updateActivity', () => {
    it('should update activity successfully', async () => {
      const activityId = 1;
      const dto = {
        title: '更新的春游活动',
        capacity: 60,
        description: '更新后的活动描述'
      };

      const mockActivity = {
        id: 1,
        title: '春游活动',
        startTime: '2024-04-01T09:00:00',
        endTime: '2024-04-01T16:00:00',
        update: jest.fn().mockResolvedValue([1])
      };

      const mockUpdatedActivity = { id: 1, ...dto };

      mockActivityModel.findByPk.mockResolvedValue(mockActivity);
      jest.spyOn(activityService, 'getActivityById' as any).mockResolvedValue(mockUpdatedActivity);

      const result = await activityService.updateActivity(activityId, dto, 1);

      expect(result).toEqual(mockUpdatedActivity);
      expect(mockActivity.update).toHaveBeenCalledWith({
        title: '更新的春游活动',
        capacity: 60,
        description: '更新后的活动描述',
        updaterId: 1,
        updatedAt: expect.any(Date)
      }, { transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('should throw error if activity not found', async () => {
      mockActivityModel.findByPk.mockResolvedValue(null);

      await expect(activityService.updateActivity(999, {}, 1)).rejects.toThrow('活动不存在');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should throw error if start time is after end time in update', async () => {
      const dto = {
        startTime: '2024-04-01T16:00:00',
        endTime: '2024-04-01T09:00:00'
      };

      const mockActivity = {
        id: 1,
        startTime: '2024-04-01T09:00:00',
        endTime: '2024-04-01T16:00:00'
      };

      mockActivityModel.findByPk.mockResolvedValue(mockActivity);

      await expect(activityService.updateActivity(1, dto, 1)).rejects.toThrow('活动结束时间必须晚于开始时间');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('deleteActivity', () => {
    it('should delete activity successfully', async () => {
      const activityId = 1;
      const mockActivity = {
        id: 1,
        deletedAt: null,
        update: jest.fn().mockResolvedValue([1])
      };

      mockActivityModel.findByPk.mockResolvedValue(mockActivity);
      mockSequelize.query.mockResolvedValue([{ count: 0 }]); // No registrations

      await expect(activityService.deleteActivity(activityId)).resolves.not.toThrow();
      expect(mockActivity.update).toHaveBeenCalledWith({
        deletedAt: expect.any(Date)
      }, { transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('should throw error if activity not found', async () => {
      mockActivityModel.findByPk.mockResolvedValue(null);

      await expect(activityService.deleteActivity(999)).rejects.toThrow('活动不存在');
    });

    it('should throw error if activity has registrations', async () => {
      const mockActivity = { id: 1, deletedAt: null };

      mockActivityModel.findByPk.mockResolvedValue(mockActivity);
      mockSequelize.query.mockResolvedValue([{ count: 5 }]); // Has registrations

      await expect(activityService.deleteActivity(1)).rejects.toThrow('该活动已有报名记录，无法删除');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('updateActivityStatus', () => {
    it('should update activity status successfully', async () => {
      const activityId = 1;
      const newStatus = ActivityStatus.REGISTRATION_OPEN;
      const mockActivity = {
        id: 1,
        status: ActivityStatus.PLANNED,
        update: jest.fn().mockResolvedValue([1])
      };

      const mockUpdatedActivity = { id: 1, status: newStatus };

      mockActivityModel.findByPk.mockResolvedValue(mockActivity);
      jest.spyOn(activityService, 'getActivityById' as any).mockResolvedValue(mockUpdatedActivity);

      const result = await activityService.updateActivityStatus(activityId, newStatus, 1);

      expect(result).toEqual(mockUpdatedActivity);
      expect(mockActivity.update).toHaveBeenCalledWith({
        status: newStatus,
        updaterId: 1,
        updatedAt: expect.any(Date)
      }, { transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('should throw error for invalid status transition', async () => {
      const mockActivity = {
        id: 1,
        status: ActivityStatus.FINISHED
      };

      mockActivityModel.findByPk.mockResolvedValue(mockActivity);

      await expect(activityService.updateActivityStatus(1, ActivityStatus.PLANNED, 1))
        .rejects.toThrow('无法从状态 5 转换到 1');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should throw error if activity not found', async () => {
      mockActivityModel.findByPk.mockResolvedValue(null);

      await expect(activityService.updateActivityStatus(999, ActivityStatus.PLANNED, 1))
        .rejects.toThrow('活动不存在');
    });
  });

  describe('getActivityStatistics', () => {
    it('should return activity statistics', async () => {
      const mockStats = [{
        total_activities: 50,
        planned: 10,
        registration_open: 15,
        full: 5,
        in_progress: 8,
        finished: 10,
        cancelled: 2,
        total_registrations: 200,
        total_check_ins: 180,
        avg_registration_rate: 75.5
      }];

      mockSequelize.query.mockResolvedValue(mockStats);

      const result = await activityService.getActivityStatistics(1);

      expect(result).toEqual({
        totalActivities: 50,
        statusDistribution: {
          planned: 10,
          registrationOpen: 15,
          full: 5,
          inProgress: 8,
          finished: 10,
          cancelled: 2
        },
        totalRegistrations: 200,
        totalCheckIns: 180,
        avgRegistrationRate: 75.5
      });
    });

    it('should return statistics without kindergarten filter', async () => {
      const mockStats = [{
        total_activities: 100,
        planned: 20,
        registration_open: 30,
        full: 10,
        in_progress: 15,
        finished: 20,
        cancelled: 5,
        total_registrations: 400,
        total_check_ins: 360,
        avg_registration_rate: 80.0
      }];

      mockSequelize.query.mockResolvedValue(mockStats);

      const result = await activityService.getActivityStatistics();

      expect(result).toEqual({
        totalActivities: 100,
        statusDistribution: {
          planned: 20,
          registrationOpen: 30,
          full: 10,
          inProgress: 15,
          finished: 20,
          cancelled: 5
        },
        totalRegistrations: 400,
        totalCheckIns: 360,
        avgRegistrationRate: 80.0
      });
    });

    it('should handle empty statistics', async () => {
      const mockStats = [{
        total_activities: 0,
        planned: 0,
        registration_open: 0,
        full: 0,
        in_progress: 0,
        finished: 0,
        cancelled: 0,
        total_registrations: 0,
        total_check_ins: 0,
        avg_registration_rate: 0
      }];

      mockSequelize.query.mockResolvedValue(mockStats);

      const result = await activityService.getActivityStatistics();

      expect(result).toEqual({
        totalActivities: 0,
        statusDistribution: {
          planned: 0,
          registrationOpen: 0,
          full: 0,
          inProgress: 0,
          finished: 0,
          cancelled: 0
        },
        totalRegistrations: 0,
        totalCheckIns: 0,
        avgRegistrationRate: 0
      });
    });
  });
});