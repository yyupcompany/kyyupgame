import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock models
const mockActivityRegistration = {
  findByPk: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  count: jest.fn()
};

const mockActivity = {
  findByPk: jest.fn(),
  findAll: jest.fn()
};

const mockStudent = {
  findByPk: jest.fn(),
  findAll: jest.fn()
};

const mockParent = {
  findByPk: jest.fn(),
  findAll: jest.fn()
};

// Mock Sequelize transaction
const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn()
};

const mockSequelize = {
  transaction: jest.fn().mockResolvedValue(mockTransaction),
  Op: {
    gte: Symbol('gte'),
    lte: Symbol('lte'),
    between: Symbol('between'),
    in: Symbol('in'),
    like: Symbol('like'),
    ne: Symbol('ne')
  },
  fn: jest.fn(),
  col: jest.fn()
};

// Mock imports
jest.unstable_mockModule('../../../../../src/models/activity-registration.model', () => ({
  ActivityRegistration: mockActivityRegistration,
  RegistrationStatus: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed'
  }
}));

jest.unstable_mockModule('../../../../../src/models/activity.model', () => ({
  Activity: mockActivity
}));

jest.unstable_mockModule('../../../../../src/models/student.model', () => ({
  Student: mockStudent
}));

jest.unstable_mockModule('../../../../../src/models/parent.model', () => ({
  Parent: mockParent
}));

jest.unstable_mockModule('../../../../../src/config/database', () => ({
  sequelize: mockSequelize
}));

jest.unstable_mockModule('../../../../../src/utils/apiError', () => ({
  ApiError: jest.fn().mockImplementation((message, statusCode) => {
    const error = new Error(message);
    (error as any).statusCode = statusCode;
    return error;
  })
}));


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

describe('Activity Registration Service', () => {
  let ActivityRegistrationService: any;
  let activityRegistrationService: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/services/activity/activity-registration.service');
    ActivityRegistrationService = imported.ActivityRegistrationService;
    activityRegistrationService = new ActivityRegistrationService();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockSequelize.transaction.mockResolvedValue(mockTransaction);
  });

  describe('registerForActivity', () => {
    it('应该成功注册活动', async () => {
      const registrationData = {
        activityId: 1,
        studentId: 1,
        parentId: 1,
        registrationDate: new Date(),
        notes: '希望参加这个活动',
        emergencyContact: {
          name: '张三',
          phone: '13800138000',
          relationship: '父亲'
        }
      };

      const mockActivity = {
        id: 1,
        name: '春游活动',
        maxParticipants: 30,
        currentParticipants: 15,
        registrationDeadline: new Date(Date.now() + 86400000), // 明天截止
        status: 'active'
      };

      const mockStudent = {
        id: 1,
        name: '小明',
        age: 5,
        status: 'active'
      };

      const mockParent = {
        id: 1,
        name: '张父',
        phone: '13800138001'
      };

      const mockCreatedRegistration = {
        id: 1,
        ...registrationData,
        status: 'pending',
        registrationNumber: 'REG_2024_001',
        createdAt: new Date()
      };

      mockActivity.findByPk.mockResolvedValue(mockActivity);
      mockStudent.findByPk.mockResolvedValue(mockStudent);
      mockParent.findByPk.mockResolvedValue(mockParent);
      mockActivityRegistration.findOne.mockResolvedValue(null); // 没有重复注册
      mockActivityRegistration.create.mockResolvedValue(mockCreatedRegistration);

      const result = await activityRegistrationService.registerForActivity(registrationData);

      expect(mockActivity.findByPk).toHaveBeenCalledWith(1);
      expect(mockStudent.findByPk).toHaveBeenCalledWith(1);
      expect(mockParent.findByPk).toHaveBeenCalledWith(1);
      expect(mockActivityRegistration.findOne).toHaveBeenCalledWith({
        where: {
          activityId: 1,
          studentId: 1,
          status: {
            [mockSequelize.Op.ne]: 'cancelled'
          }
        }
      });
      expect(mockActivityRegistration.create).toHaveBeenCalledWith(
        expect.objectContaining({
          activityId: 1,
          studentId: 1,
          parentId: 1,
          status: 'pending',
          registrationNumber: expect.any(String)
        }),
        { transaction: mockTransaction }
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toEqual(mockCreatedRegistration);
    });

    it('应该在活动不存在时抛出错误', async () => {
      const registrationData = {
        activityId: 999,
        studentId: 1,
        parentId: 1
      };

      mockActivity.findByPk.mockResolvedValue(null);

      await expect(activityRegistrationService.registerForActivity(registrationData))
        .rejects
        .toThrow('活动不存在');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('应该在活动已满员时抛出错误', async () => {
      const registrationData = {
        activityId: 1,
        studentId: 1,
        parentId: 1
      };

      const mockFullActivity = {
        id: 1,
        maxParticipants: 30,
        currentParticipants: 30, // 已满员
        status: 'active'
      };

      mockActivity.findByPk.mockResolvedValue(mockFullActivity);

      await expect(activityRegistrationService.registerForActivity(registrationData))
        .rejects
        .toThrow('活动已满员');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('应该在注册截止后抛出错误', async () => {
      const registrationData = {
        activityId: 1,
        studentId: 1,
        parentId: 1
      };

      const mockExpiredActivity = {
        id: 1,
        maxParticipants: 30,
        currentParticipants: 15,
        registrationDeadline: new Date(Date.now() - 86400000), // 昨天截止
        status: 'active'
      };

      mockActivity.findByPk.mockResolvedValue(mockExpiredActivity);

      await expect(activityRegistrationService.registerForActivity(registrationData))
        .rejects
        .toThrow('注册已截止');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('应该在重复注册时抛出错误', async () => {
      const registrationData = {
        activityId: 1,
        studentId: 1,
        parentId: 1
      };

      const mockActivity = {
        id: 1,
        maxParticipants: 30,
        currentParticipants: 15,
        registrationDeadline: new Date(Date.now() + 86400000),
        status: 'active'
      };

      const mockExistingRegistration = {
        id: 1,
        activityId: 1,
        studentId: 1,
        status: 'confirmed'
      };

      mockActivity.findByPk.mockResolvedValue(mockActivity);
      mockStudent.findByPk.mockResolvedValue({ id: 1 });
      mockParent.findByPk.mockResolvedValue({ id: 1 });
      mockActivityRegistration.findOne.mockResolvedValue(mockExistingRegistration);

      await expect(activityRegistrationService.registerForActivity(registrationData))
        .rejects
        .toThrow('学生已注册此活动');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('getRegistrationById', () => {
    it('应该成功获取注册详情', async () => {
      const registrationId = 1;
      const mockRegistration = {
        id: 1,
        activityId: 1,
        studentId: 1,
        parentId: 1,
        status: 'confirmed',
        registrationNumber: 'REG_2024_001',
        activity: { id: 1, name: '春游活动' },
        student: { id: 1, name: '小明' },
        parent: { id: 1, name: '张父' }
      };

      mockActivityRegistration.findByPk.mockResolvedValue(mockRegistration);

      const result = await activityRegistrationService.getRegistrationById(registrationId);

      expect(mockActivityRegistration.findByPk).toHaveBeenCalledWith(registrationId, {
        include: [
          {
            model: mockActivity,
            as: 'activity',
            attributes: ['id', 'name', 'date', 'location', 'description']
          },
          {
            model: mockStudent,
            as: 'student',
            attributes: ['id', 'name', 'age', 'class']
          },
          {
            model: mockParent,
            as: 'parent',
            attributes: ['id', 'name', 'phone', 'email']
          }
        ]
      });
      expect(result).toEqual(mockRegistration);
    });

    it('应该在注册不存在时抛出错误', async () => {
      const registrationId = 999;

      mockActivityRegistration.findByPk.mockResolvedValue(null);

      await expect(activityRegistrationService.getRegistrationById(registrationId))
        .rejects
        .toThrow('注册记录不存在');
    });
  });

  describe('getRegistrationList', () => {
    it('应该成功获取注册列表', async () => {
      const options = {
        page: 1,
        pageSize: 10,
        activityId: 1,
        status: 'confirmed',
        studentId: 1
      };

      const mockRegistrations = [
        {
          id: 1,
          activityId: 1,
          studentId: 1,
          status: 'confirmed',
          registrationNumber: 'REG_2024_001'
        },
        {
          id: 2,
          activityId: 1,
          studentId: 2,
          status: 'confirmed',
          registrationNumber: 'REG_2024_002'
        }
      ];

      mockActivityRegistration.findAll.mockResolvedValue(mockRegistrations);
      mockActivityRegistration.count.mockResolvedValue(2);

      const result = await activityRegistrationService.getRegistrationList(options);

      expect(mockActivityRegistration.findAll).toHaveBeenCalledWith({
        where: {
          activityId: 1,
          status: 'confirmed',
          studentId: 1
        },
        include: [
          {
            model: mockActivity,
            as: 'activity',
            attributes: ['id', 'name', 'date', 'location']
          },
          {
            model: mockStudent,
            as: 'student',
            attributes: ['id', 'name', 'age']
          },
          {
            model: mockParent,
            as: 'parent',
            attributes: ['id', 'name', 'phone']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: 10,
        offset: 0
      });

      expect(result).toEqual({
        registrations: mockRegistrations,
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1
      });
    });

    it('应该支持搜索功能', async () => {
      const options = {
        search: '小明'
      };

      await activityRegistrationService.getRegistrationList(options);

      expect(mockActivityRegistration.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.arrayContaining([
            expect.objectContaining({
              model: mockStudent,
              where: {
                name: { [mockSequelize.Op.like]: '%小明%' }
              }
            })
          ])
        })
      );
    });

    it('应该支持时间范围筛选', async () => {
      const options = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      };

      await activityRegistrationService.getRegistrationList(options);

      expect(mockActivityRegistration.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            registrationDate: {
              [mockSequelize.Op.between]: [options.startDate, options.endDate]
            }
          })
        })
      );
    });
  });

  describe('updateRegistrationStatus', () => {
    it('应该成功更新注册状态', async () => {
      const registrationId = 1;
      const status = 'confirmed';
      const notes = '确认参加活动';

      const mockRegistration = {
        id: 1,
        status: 'pending',
        activityId: 1,
        update: jest.fn().mockResolvedValue(undefined)
      };

      const mockActivity = {
        id: 1,
        currentParticipants: 15,
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockActivityRegistration.findByPk.mockResolvedValue(mockRegistration);
      mockActivity.findByPk.mockResolvedValue(mockActivity);

      const result = await activityRegistrationService.updateRegistrationStatus(registrationId, status, notes);

      expect(mockActivityRegistration.findByPk).toHaveBeenCalledWith(registrationId);
      expect(mockRegistration.update).toHaveBeenCalledWith({
        status: 'confirmed',
        notes: '确认参加活动',
        confirmedAt: expect.any(Date)
      });

      // 确认状态时应该增加活动参与人数
      expect(mockActivity.findByPk).toHaveBeenCalledWith(1);
      expect(mockActivity.update).toHaveBeenCalledWith({
        currentParticipants: 16
      });

      expect(result).toBe(true);
    });

    it('应该在注册不存在时抛出错误', async () => {
      const registrationId = 999;
      const status = 'confirmed';

      mockActivityRegistration.findByPk.mockResolvedValue(null);

      await expect(activityRegistrationService.updateRegistrationStatus(registrationId, status))
        .rejects
        .toThrow('注册记录不存在');
    });

    it('应该处理取消注册', async () => {
      const registrationId = 1;
      const status = 'cancelled';
      const notes = '家长取消';

      const mockRegistration = {
        id: 1,
        status: 'confirmed',
        activityId: 1,
        update: jest.fn().mockResolvedValue(undefined)
      };

      const mockActivity = {
        id: 1,
        currentParticipants: 16,
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockActivityRegistration.findByPk.mockResolvedValue(mockRegistration);
      mockActivity.findByPk.mockResolvedValue(mockActivity);

      await activityRegistrationService.updateRegistrationStatus(registrationId, status, notes);

      expect(mockRegistration.update).toHaveBeenCalledWith({
        status: 'cancelled',
        notes: '家长取消',
        cancelledAt: expect.any(Date)
      });

      // 取消状态时应该减少活动参与人数
      expect(mockActivity.update).toHaveBeenCalledWith({
        currentParticipants: 15
      });
    });
  });

  describe('cancelRegistration', () => {
    it('应该成功取消注册', async () => {
      const registrationId = 1;
      const reason = '时间冲突';

      const mockRegistration = {
        id: 1,
        status: 'confirmed',
        activityId: 1,
        update: jest.fn().mockResolvedValue(undefined)
      };

      const mockActivity = {
        id: 1,
        currentParticipants: 16,
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockActivityRegistration.findByPk.mockResolvedValue(mockRegistration);
      mockActivity.findByPk.mockResolvedValue(mockActivity);

      const result = await activityRegistrationService.cancelRegistration(registrationId, reason);

      expect(mockActivityRegistration.findByPk).toHaveBeenCalledWith(registrationId);
      expect(mockRegistration.update).toHaveBeenCalledWith({
        status: 'cancelled',
        cancelReason: '时间冲突',
        cancelledAt: expect.any(Date)
      });
      expect(mockActivity.update).toHaveBeenCalledWith({
        currentParticipants: 15
      });
      expect(result).toBe(true);
    });

    it('应该在注册不存在时抛出错误', async () => {
      const registrationId = 999;
      const reason = '时间冲突';

      mockActivityRegistration.findByPk.mockResolvedValue(null);

      await expect(activityRegistrationService.cancelRegistration(registrationId, reason))
        .rejects
        .toThrow('注册记录不存在');
    });

    it('应该在注册已取消时抛出错误', async () => {
      const registrationId = 1;
      const reason = '时间冲突';

      const mockRegistration = {
        id: 1,
        status: 'cancelled'
      };

      mockActivityRegistration.findByPk.mockResolvedValue(mockRegistration);

      await expect(activityRegistrationService.cancelRegistration(registrationId, reason))
        .rejects
        .toThrow('注册已取消');
    });
  });

  describe('getRegistrationStats', () => {
    it('应该成功获取注册统计', async () => {
      const options = {
        activityId: 1,
        timeRange: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31')
        }
      };

      const mockStats = [
        { status: 'confirmed', count: 25 },
        { status: 'pending', count: 5 },
        { status: 'cancelled', count: 3 }
      ];

      mockActivityRegistration.findAll.mockResolvedValue(mockStats);

      const result = await activityRegistrationService.getRegistrationStats(options);

      expect(mockActivityRegistration.findAll).toHaveBeenCalledWith({
        where: {
          activityId: 1,
          registrationDate: {
            [mockSequelize.Op.between]: [options.timeRange.startDate, options.timeRange.endDate]
          }
        },
        attributes: [
          'status',
          [mockSequelize.fn('COUNT', '*'), 'count']
        ],
        group: ['status']
      });

      expect(result).toEqual({
        activityId: options.activityId,
        timeRange: options.timeRange,
        stats: mockStats,
        summary: expect.objectContaining({
          totalRegistrations: expect.any(Number),
          confirmedCount: expect.any(Number),
          pendingCount: expect.any(Number),
          cancelledCount: expect.any(Number),
          confirmationRate: expect.any(Number)
        })
      });
    });
  });

  describe('bulkUpdateStatus', () => {
    it('应该成功批量更新注册状态', async () => {
      const registrationIds = [1, 2, 3];
      const status = 'confirmed';
      const notes = '批量确认';

      mockActivityRegistration.update.mockResolvedValue([3]); // 更新了3条记录

      const result = await activityRegistrationService.bulkUpdateStatus(registrationIds, status, notes);

      expect(mockActivityRegistration.update).toHaveBeenCalledWith(
        {
          status: 'confirmed',
          notes: '批量确认',
          confirmedAt: expect.any(Date)
        },
        {
          where: {
            id: {
              [mockSequelize.Op.in]: registrationIds
            }
          },
          transaction: mockTransaction
        }
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toEqual({
        updatedCount: 3,
        registrationIds: registrationIds,
        status: status
      });
    });

    it('应该处理批量更新错误', async () => {
      const registrationIds = [1, 2, 3];
      const status = 'confirmed';

      mockActivityRegistration.update.mockRejectedValue(new Error('批量更新失败'));

      await expect(activityRegistrationService.bulkUpdateStatus(registrationIds, status))
        .rejects
        .toThrow('批量更新失败');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('exportRegistrations', () => {
    it('应该成功导出注册数据', async () => {
      const exportOptions = {
        activityId: 1,
        format: 'csv',
        fields: ['registrationNumber', 'studentName', 'parentName', 'status', 'registrationDate']
      };

      const mockRegistrations = [
        {
          registrationNumber: 'REG_2024_001',
          student: { name: '小明' },
          parent: { name: '张父' },
          status: 'confirmed',
          registrationDate: '2024-01-01'
        },
        {
          registrationNumber: 'REG_2024_002',
          student: { name: '小红' },
          parent: { name: '李母' },
          status: 'pending',
          registrationDate: '2024-01-02'
        }
      ];

      mockActivityRegistration.findAll.mockResolvedValue(mockRegistrations);

      const result = await activityRegistrationService.exportRegistrations(exportOptions);

      expect(mockActivityRegistration.findAll).toHaveBeenCalledWith({
        where: { activityId: 1 },
        include: [
          {
            model: mockStudent,
            as: 'student',
            attributes: ['name', 'age', 'class']
          },
          {
            model: mockParent,
            as: 'parent',
            attributes: ['name', 'phone', 'email']
          },
          {
            model: mockActivity,
            as: 'activity',
            attributes: ['name', 'date', 'location']
          }
        ],
        order: [['registrationDate', 'ASC']]
      });

      expect(result).toEqual({
        format: exportOptions.format,
        data: mockRegistrations,
        totalRecords: mockRegistrations.length,
        exportedAt: expect.any(Date)
      });
    });
  });

  describe('sendNotification', () => {
    it('应该成功发送通知', async () => {
      const registrationId = 1;
      const notificationType = 'confirmation';
      const message = '您的活动注册已确认';

      const mockRegistration = {
        id: 1,
        parent: { phone: '13800138000', email: 'parent@example.com' },
        student: { name: '小明' },
        activity: { name: '春游活动', date: '2024-05-01' }
      };

      mockActivityRegistration.findByPk.mockResolvedValue(mockRegistration);

      // Mock通知服务
      const mockNotificationService = {
        sendSMS: jest.fn().mockResolvedValue(undefined),
        sendEmail: jest.fn().mockResolvedValue(undefined)
      };

      activityRegistrationService.notificationService = mockNotificationService;

      const result = await activityRegistrationService.sendNotification(registrationId, notificationType, message);

      expect(mockActivityRegistration.findByPk).toHaveBeenCalledWith(registrationId, {
        include: [
          { model: mockParent, as: 'parent' },
          { model: mockStudent, as: 'student' },
          { model: mockActivity, as: 'activity' }
        ]
      });

      expect(result).toEqual({
        registrationId: registrationId,
        notificationType: notificationType,
        sentAt: expect.any(Date),
        channels: expect.arrayContaining(['sms', 'email'])
      });
    });

    it('应该在注册不存在时抛出错误', async () => {
      const registrationId = 999;
      const notificationType = 'confirmation';

      mockActivityRegistration.findByPk.mockResolvedValue(null);

      await expect(activityRegistrationService.sendNotification(registrationId, notificationType))
        .rejects
        .toThrow('注册记录不存在');
    });
  });
});
