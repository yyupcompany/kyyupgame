import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock models
const mockActivity = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  count: jest.fn(),
  findAndCountAll: jest.fn(),
  bulkCreate: jest.fn(),
  scope: jest.fn().mockReturnThis()
};

const mockActivityRegistration = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  count: jest.fn(),
  bulkCreate: jest.fn()
};

const mockStudent = {
  findByPk: jest.fn(),
  findAll: jest.fn()
};

const mockKindergarten = {
  findByPk: jest.fn()
};

const mockClass = {
  findByPk: jest.fn()
};

// Mock services
const mockEmailService = {
  sendEmail: jest.fn(),
  sendBulkEmail: jest.fn()
};

const mockSMSService = {
  sendSMS: jest.fn(),
  sendBulkSMS: jest.fn()
};

const mockNotificationService = {
  createNotification: jest.fn(),
  sendPushNotification: jest.fn()
};

// Mock database transaction
const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn()
};

const mockSequelize = {
  transaction: jest.fn().mockResolvedValue(mockTransaction)
};

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
};

// Mock imports
jest.unstable_mockModule('../../../../../src/models/activity.model', () => ({
  default: mockActivity
}));

jest.unstable_mockModule('../../../../../src/models/activity-registration.model', () => ({
  default: mockActivityRegistration
}));

jest.unstable_mockModule('../../../../../src/models/student.model', () => ({
  default: mockStudent
}));

jest.unstable_mockModule('../../../../../src/models/kindergarten.model', () => ({
  default: mockKindergarten
}));

jest.unstable_mockModule('../../../../../src/models/class.model', () => ({
  default: mockClass
}));

jest.unstable_mockModule('../../../../../src/services/email/email.service', () => ({
  default: mockEmailService
}));

jest.unstable_mockModule('../../../../../src/services/sms/sms.service', () => ({
  default: mockSMSService
}));

jest.unstable_mockModule('../../../../../src/services/notification/notification.service', () => ({
  default: mockNotificationService
}));

jest.unstable_mockModule('../../../../../src/config/database', () => ({
  default: mockSequelize
}));

jest.unstable_mockModule('../../../../../src/utils/logger', () => ({
  default: mockLogger
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

describe('Activity Management Service', () => {
  let activityManagementService: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/services/activity/activity-management.service');
    activityManagementService = imported.default || imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createActivity', () => {
    it('应该成功创建活动', async () => {
      const activityData = {
        title: '春季运动会',
        description: '全园春季运动会，增强孩子们的体质',
        type: 'sports',
        category: 'outdoor',
        kindergartenId: 1,
        targetAgeGroups: [3, 4, 5],
        maxParticipants: 100,
        startDate: '2024-05-01T09:00:00Z',
        endDate: '2024-05-01T16:00:00Z',
        location: '幼儿园操场',
        requirements: ['运动服', '运动鞋'],
        materials: ['彩带', '奖牌', '音响设备'],
        instructors: ['张老师', '李老师'],
        fee: 50,
        registrationDeadline: '2024-04-25T23:59:59Z'
      };

      const mockCreatedActivity = {
        id: 1,
        ...activityData,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockKindergarten.findByPk.mockResolvedValue({ id: 1, name: '阳光幼儿园' });
      mockActivity.create.mockResolvedValue(mockCreatedActivity);

      const result = await activityManagementService.createActivity(activityData);

      expect(mockKindergarten.findByPk).toHaveBeenCalledWith(1);
      expect(mockActivity.create).toHaveBeenCalledWith(activityData);
      expect(result).toEqual(mockCreatedActivity);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('活动创建成功'),
        expect.objectContaining({ activityId: 1 })
      );
    });

    it('应该处理幼儿园不存在', async () => {
      const activityData = {
        title: '测试活动',
        kindergartenId: 999
      };

      mockKindergarten.findByPk.mockResolvedValue(null);

      await expect(activityManagementService.createActivity(activityData))
        .rejects.toThrow('指定的幼儿园不存在');

      expect(mockActivity.create).not.toHaveBeenCalled();
    });

    it('应该验证活动时间冲突', async () => {
      const activityData = {
        title: '测试活动',
        kindergartenId: 1,
        startDate: '2024-05-01T09:00:00Z',
        endDate: '2024-05-01T16:00:00Z'
      };

      mockKindergarten.findByPk.mockResolvedValue({ id: 1 });
      mockActivity.findOne.mockResolvedValue({ id: 2, title: '冲突活动' });

      await expect(activityManagementService.createActivity(activityData))
        .rejects.toThrow('活动时间与现有活动冲突');
    });

    it('应该验证必填字段', async () => {
      const invalidData = {
        // 缺少必填字段
        description: '测试描述'
      };

      await expect(activityManagementService.createActivity(invalidData))
        .rejects.toThrow('活动标题是必填字段');
    });

    it('应该验证日期逻辑', async () => {
      const invalidData = {
        title: '测试活动',
        kindergartenId: 1,
        startDate: '2024-05-01T16:00:00Z',
        endDate: '2024-05-01T09:00:00Z' // 结束时间早于开始时间
      };

      mockKindergarten.findByPk.mockResolvedValue({ id: 1 });

      await expect(activityManagementService.createActivity(invalidData))
        .rejects.toThrow('结束时间不能早于开始时间');
    });

    it('应该验证报名截止时间', async () => {
      const invalidData = {
        title: '测试活动',
        kindergartenId: 1,
        startDate: '2024-05-01T09:00:00Z',
        endDate: '2024-05-01T16:00:00Z',
        registrationDeadline: '2024-05-02T00:00:00Z' // 报名截止时间晚于活动开始时间
      };

      mockKindergarten.findByPk.mockResolvedValue({ id: 1 });

      await expect(activityManagementService.createActivity(invalidData))
        .rejects.toThrow('报名截止时间不能晚于活动开始时间');
    });
  });

  describe('getActivities', () => {
    it('应该获取活动列表', async () => {
      const filters = {
        kindergartenId: 1,
        status: 'published',
        type: 'sports',
        startDate: '2024-05-01',
        endDate: '2024-05-31',
        page: 1,
        pageSize: 10
      };

      const mockActivities = {
        rows: [
          {
            id: 1,
            title: '春季运动会',
            type: 'sports',
            status: 'published',
            startDate: '2024-05-01T09:00:00Z',
            registrationCount: 25,
            maxParticipants: 100
          },
          {
            id: 2,
            title: '艺术展览',
            type: 'art',
            status: 'published',
            startDate: '2024-05-15T14:00:00Z',
            registrationCount: 15,
            maxParticipants: 50
          }
        ],
        count: 2
      };

      mockActivity.findAndCountAll.mockResolvedValue(mockActivities);

      const result = await activityManagementService.getActivities(filters);

      expect(mockActivity.findAndCountAll).toHaveBeenCalledWith({
        where: expect.objectContaining({
          kindergartenId: 1,
          status: 'published',
          type: 'sports'
        }),
        limit: 10,
        offset: 0,
        order: [['startDate', 'ASC']],
        include: expect.any(Array)
      });

      expect(result).toEqual({
        activities: mockActivities.rows,
        pagination: {
          page: 1,
          pageSize: 10,
          total: 2,
          totalPages: 1
        }
      });
    });

    it('应该支持多种排序方式', async () => {
      const filters = {
        sortBy: 'registrationCount',
        sortOrder: 'desc'
      };

      await activityManagementService.getActivities(filters);

      expect(mockActivity.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          order: [['registrationCount', 'DESC']]
        })
      );
    });

    it('应该支持关键词搜索', async () => {
      const filters = {
        search: '运动会'
      };

      await activityManagementService.getActivities(filters);

      expect(mockActivity.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            [Symbol.for('or')]: expect.any(Array)
          })
        })
      );
    });

    it('应该支持年龄组筛选', async () => {
      const filters = {
        ageGroup: 4
      };

      await activityManagementService.getActivities(filters);

      expect(mockActivity.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            targetAgeGroups: expect.objectContaining({
              [Symbol.for('contains')]: [4]
            })
          })
        })
      );
    });
  });

  describe('getActivityById', () => {
    it('应该获取活动详情', async () => {
      const activityId = 1;

      const mockActivity = {
        id: 1,
        title: '春季运动会',
        description: '全园春季运动会',
        type: 'sports',
        status: 'published',
        startDate: '2024-05-01T09:00:00Z',
        endDate: '2024-05-01T16:00:00Z',
        maxParticipants: 100,
        registrations: [
          { id: 1, studentId: 1, status: 'confirmed' },
          { id: 2, studentId: 2, status: 'confirmed' }
        ],
        kindergarten: {
          id: 1,
          name: '阳光幼儿园'
        }
      };

      mockActivity.findByPk.mockResolvedValue(mockActivity);

      const result = await activityManagementService.getActivityById(activityId);

      expect(mockActivity.findByPk).toHaveBeenCalledWith(activityId, {
        include: expect.any(Array)
      });
      expect(result).toEqual(mockActivity);
    });

    it('应该处理活动不存在', async () => {
      const activityId = 999;

      mockActivity.findByPk.mockResolvedValue(null);

      const result = await activityManagementService.getActivityById(activityId);

      expect(result).toBeNull();
    });

    it('应该包含统计信息', async () => {
      const activityId = 1;

      const mockActivityWithStats = {
        id: 1,
        title: '春季运动会',
        registrations: [
          { status: 'confirmed' },
          { status: 'confirmed' },
          { status: 'pending' }
        ],
        getRegistrationStats: jest.fn().mockReturnValue({
          total: 3,
          confirmed: 2,
          pending: 1,
          cancelled: 0
        })
      };

      mockActivity.findByPk.mockResolvedValue(mockActivityWithStats);

      const result = await activityManagementService.getActivityById(activityId, { includeStats: true });

      expect(result.registrationStats).toEqual({
        total: 3,
        confirmed: 2,
        pending: 1,
        cancelled: 0
      });
    });
  });

  describe('updateActivity', () => {
    it('应该成功更新活动', async () => {
      const activityId = 1;
      const updateData = {
        title: '春季运动会（更新）',
        description: '更新后的描述',
        maxParticipants: 120
      };

      const mockExistingActivity = {
        id: 1,
        title: '春季运动会',
        status: 'draft',
        update: jest.fn().mockResolvedValue(undefined),
        reload: jest.fn().mockResolvedValue({
          id: 1,
          ...updateData,
          updatedAt: new Date().toISOString()
        })
      };

      mockActivity.findByPk.mockResolvedValue(mockExistingActivity);

      const result = await activityManagementService.updateActivity(activityId, updateData);

      expect(mockActivity.findByPk).toHaveBeenCalledWith(activityId);
      expect(mockExistingActivity.update).toHaveBeenCalledWith(updateData);
      expect(mockExistingActivity.reload).toHaveBeenCalled();
      expect(result.title).toBe('春季运动会（更新）');
    });

    it('应该处理活动不存在', async () => {
      const activityId = 999;
      const updateData = { title: '更新标题' };

      mockActivity.findByPk.mockResolvedValue(null);

      await expect(activityManagementService.updateActivity(activityId, updateData))
        .rejects.toThrow('活动不存在');
    });

    it('应该处理已发布活动的限制更新', async () => {
      const activityId = 1;
      const updateData = {
        startDate: '2024-06-01T09:00:00Z' // 尝试修改已发布活动的开始时间
      };

      const mockPublishedActivity = {
        id: 1,
        status: 'published',
        registrations: [{ id: 1 }] // 已有报名
      };

      mockActivity.findByPk.mockResolvedValue(mockPublishedActivity);

      await expect(activityManagementService.updateActivity(activityId, updateData))
        .rejects.toThrow('已发布且有报名的活动不能修改关键信息');
    });

    it('应该验证更新数据', async () => {
      const activityId = 1;
      const invalidData = {
        maxParticipants: -10 // 无效的参与人数
      };

      const mockActivity = {
        id: 1,
        status: 'draft'
      };

      mockActivity.findByPk.mockResolvedValue(mockActivity);

      await expect(activityManagementService.updateActivity(activityId, invalidData))
        .rejects.toThrow('最大参与人数必须大于0');
    });

    it('应该处理减少参与人数限制', async () => {
      const activityId = 1;
      const updateData = {
        maxParticipants: 50 // 减少到50人
      };

      const mockActivity = {
        id: 1,
        status: 'published',
        maxParticipants: 100,
        registrations: Array.from({ length: 60 }, (_, i) => ({ id: i + 1, status: 'confirmed' }))
      };

      mockActivity.findByPk.mockResolvedValue(mockActivity);

      await expect(activityManagementService.updateActivity(activityId, updateData))
        .rejects.toThrow('当前确认报名人数超过新的参与人数限制');
    });
  });

  describe('deleteActivity', () => {
    it('应该成功删除草稿状态的活动', async () => {
      const activityId = 1;

      const mockActivity = {
        id: 1,
        status: 'draft',
        registrations: [],
        destroy: jest.fn().mockResolvedValue(undefined)
      };

      mockActivity.findByPk.mockResolvedValue(mockActivity);

      const result = await activityManagementService.deleteActivity(activityId);

      expect(mockActivity.findByPk).toHaveBeenCalledWith(activityId, {
        include: expect.any(Array)
      });
      expect(mockActivity.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('活动删除成功'),
        expect.objectContaining({ activityId: 1 })
      );
    });

    it('应该处理活动不存在', async () => {
      const activityId = 999;

      mockActivity.findByPk.mockResolvedValue(null);

      await expect(activityManagementService.deleteActivity(activityId))
        .rejects.toThrow('活动不存在');
    });

    it('应该处理有报名的活动删除限制', async () => {
      const activityId = 1;

      const mockActivity = {
        id: 1,
        status: 'published',
        registrations: [{ id: 1, status: 'confirmed' }]
      };

      mockActivity.findByPk.mockResolvedValue(mockActivity);

      await expect(activityManagementService.deleteActivity(activityId))
        .rejects.toThrow('有报名记录的活动不能删除');
    });

    it('应该支持强制删除', async () => {
      const activityId = 1;
      const options = { force: true };

      const mockActivity = {
        id: 1,
        status: 'published',
        registrations: [{ id: 1, status: 'confirmed' }],
        destroy: jest.fn().mockResolvedValue(undefined)
      };

      mockActivity.findByPk.mockResolvedValue(mockActivity);
      mockActivityRegistration.destroy.mockResolvedValue(1);

      const result = await activityManagementService.deleteActivity(activityId, options);

      expect(mockActivityRegistration.destroy).toHaveBeenCalledWith({
        where: { activityId: 1 }
      });
      expect(mockActivity.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('publishActivity', () => {
    it('应该成功发布活动', async () => {
      const activityId = 1;

      const mockActivity = {
        id: 1,
        status: 'draft',
        title: '春季运动会',
        startDate: new Date(Date.now() + 86400000), // 明天
        registrationDeadline: new Date(Date.now() + 43200000), // 12小时后
        update: jest.fn().mockResolvedValue(undefined),
        reload: jest.fn().mockResolvedValue({
          id: 1,
          status: 'published',
          publishedAt: new Date().toISOString()
        })
      };

      mockActivity.findByPk.mockResolvedValue(mockActivity);

      const result = await activityManagementService.publishActivity(activityId);

      expect(mockActivity.update).toHaveBeenCalledWith({
        status: 'published',
        publishedAt: expect.any(Date)
      });
      expect(result.status).toBe('published');
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('活动发布成功'),
        expect.objectContaining({ activityId: 1 })
      );
    });

    it('应该处理活动不存在', async () => {
      const activityId = 999;

      mockActivity.findByPk.mockResolvedValue(null);

      await expect(activityManagementService.publishActivity(activityId))
        .rejects.toThrow('活动不存在');
    });

    it('应该处理已发布的活动', async () => {
      const activityId = 1;

      const mockActivity = {
        id: 1,
        status: 'published'
      };

      mockActivity.findByPk.mockResolvedValue(mockActivity);

      await expect(activityManagementService.publishActivity(activityId))
        .rejects.toThrow('活动已经发布');
    });

    it('应该验证活动信息完整性', async () => {
      const activityId = 1;

      const mockIncompleteActivity = {
        id: 1,
        status: 'draft',
        title: '测试活动',
        // 缺少必要信息
        startDate: null
      };

      mockActivity.findByPk.mockResolvedValue(mockIncompleteActivity);

      await expect(activityManagementService.publishActivity(activityId))
        .rejects.toThrow('活动信息不完整，无法发布');
    });

    it('应该验证活动时间', async () => {
      const activityId = 1;

      const mockPastActivity = {
        id: 1,
        status: 'draft',
        title: '过期活动',
        startDate: new Date(Date.now() - 86400000), // 昨天
        registrationDeadline: new Date(Date.now() - 43200000)
      };

      mockActivity.findByPk.mockResolvedValue(mockPastActivity);

      await expect(activityManagementService.publishActivity(activityId))
        .rejects.toThrow('不能发布已过期的活动');
    });
  });

  describe('registerForActivity', () => {
    it('应该成功报名活动', async () => {
      const registrationData = {
        activityId: 1,
        studentId: 1,
        parentId: 1,
        notes: '孩子对运动很感兴趣'
      };

      const mockActivity = {
        id: 1,
        status: 'published',
        maxParticipants: 100,
        registrationDeadline: new Date(Date.now() + 86400000),
        registrations: Array.from({ length: 50 }, (_, i) => ({ id: i + 1, status: 'confirmed' }))
      };

      const mockStudent = {
        id: 1,
        name: '张小明',
        age: 4,
        kindergartenId: 1
      };

      const mockRegistration = {
        id: 1,
        ...registrationData,
        status: 'confirmed',
        registrationNumber: 'REG202400001',
        createdAt: new Date().toISOString()
      };

      mockActivity.findByPk.mockResolvedValue(mockActivity);
      mockStudent.findByPk.mockResolvedValue(mockStudent);
      mockActivityRegistration.findOne.mockResolvedValue(null); // 没有重复报名
      mockActivityRegistration.create.mockResolvedValue(mockRegistration);

      const result = await activityManagementService.registerForActivity(registrationData);

      expect(mockActivity.findByPk).toHaveBeenCalledWith(1);
      expect(mockStudent.findByPk).toHaveBeenCalledWith(1);
      expect(mockActivityRegistration.findOne).toHaveBeenCalledWith({
        where: { activityId: 1, studentId: 1 }
      });
      expect(mockActivityRegistration.create).toHaveBeenCalledWith(registrationData);
      expect(result).toEqual(mockRegistration);
    });

    it('应该处理活动不存在', async () => {
      const registrationData = {
        activityId: 999,
        studentId: 1
      };

      mockActivity.findByPk.mockResolvedValue(null);

      await expect(activityManagementService.registerForActivity(registrationData))
        .rejects.toThrow('活动不存在');
    });

    it('应该处理活动未发布', async () => {
      const registrationData = {
        activityId: 1,
        studentId: 1
      };

      const mockDraftActivity = {
        id: 1,
        status: 'draft'
      };

      mockActivity.findByPk.mockResolvedValue(mockDraftActivity);

      await expect(activityManagementService.registerForActivity(registrationData))
        .rejects.toThrow('活动尚未发布，无法报名');
    });

    it('应该处理报名截止', async () => {
      const registrationData = {
        activityId: 1,
        studentId: 1
      };

      const mockExpiredActivity = {
        id: 1,
        status: 'published',
        registrationDeadline: new Date(Date.now() - 86400000) // 昨天截止
      };

      mockActivity.findByPk.mockResolvedValue(mockExpiredActivity);

      await expect(activityManagementService.registerForActivity(registrationData))
        .rejects.toThrow('报名已截止');
    });

    it('应该处理名额已满', async () => {
      const registrationData = {
        activityId: 1,
        studentId: 1
      };

      const mockFullActivity = {
        id: 1,
        status: 'published',
        maxParticipants: 50,
        registrationDeadline: new Date(Date.now() + 86400000),
        registrations: Array.from({ length: 50 }, (_, i) => ({ id: i + 1, status: 'confirmed' }))
      };

      mockActivity.findByPk.mockResolvedValue(mockFullActivity);

      await expect(activityManagementService.registerForActivity(registrationData))
        .rejects.toThrow('活动名额已满');
    });

    it('应该处理重复报名', async () => {
      const registrationData = {
        activityId: 1,
        studentId: 1
      };

      const mockActivity = {
        id: 1,
        status: 'published',
        maxParticipants: 100,
        registrationDeadline: new Date(Date.now() + 86400000),
        registrations: []
      };

      const mockStudent = { id: 1, kindergartenId: 1 };
      const mockExistingRegistration = { id: 1, status: 'confirmed' };

      mockActivity.findByPk.mockResolvedValue(mockActivity);
      mockStudent.findByPk.mockResolvedValue(mockStudent);
      mockActivityRegistration.findOne.mockResolvedValue(mockExistingRegistration);

      await expect(activityManagementService.registerForActivity(registrationData))
        .rejects.toThrow('学生已报名此活动');
    });

    it('应该验证学生年龄要求', async () => {
      const registrationData = {
        activityId: 1,
        studentId: 1
      };

      const mockActivity = {
        id: 1,
        status: 'published',
        targetAgeGroups: [4, 5, 6], // 只允许4-6岁
        maxParticipants: 100,
        registrationDeadline: new Date(Date.now() + 86400000),
        registrations: []
      };

      const mockYoungStudent = {
        id: 1,
        age: 3, // 3岁，不符合要求
        kindergartenId: 1
      };

      mockActivity.findByPk.mockResolvedValue(mockActivity);
      mockStudent.findByPk.mockResolvedValue(mockYoungStudent);

      await expect(activityManagementService.registerForActivity(registrationData))
        .rejects.toThrow('学生年龄不符合活动要求');
    });

    it('应该发送报名确认通知', async () => {
      const registrationData = {
        activityId: 1,
        studentId: 1,
        parentId: 1
      };

      const mockActivity = {
        id: 1,
        title: '春季运动会',
        status: 'published',
        maxParticipants: 100,
        registrationDeadline: new Date(Date.now() + 86400000),
        registrations: []
      };

      const mockStudent = { id: 1, name: '张小明', kindergartenId: 1 };
      const mockRegistration = { id: 1, registrationNumber: 'REG202400001' };

      mockActivity.findByPk.mockResolvedValue(mockActivity);
      mockStudent.findByPk.mockResolvedValue(mockStudent);
      mockActivityRegistration.findOne.mockResolvedValue(null);
      mockActivityRegistration.create.mockResolvedValue(mockRegistration);

      await activityManagementService.registerForActivity(registrationData);

      expect(mockNotificationService.createNotification).toHaveBeenCalledWith({
        userId: 1,
        type: 'activity_registration',
        title: '活动报名成功',
        content: expect.stringContaining('春季运动会'),
        data: { activityId: 1, registrationId: 1 }
      });
    });
  });

  describe('cancelRegistration', () => {
    it('应该成功取消报名', async () => {
      const registrationId = 1;
      const reason = '时间冲突，无法参加';

      const mockRegistration = {
        id: 1,
        activityId: 1,
        studentId: 1,
        status: 'confirmed',
        update: jest.fn().mockResolvedValue(undefined),
        activity: {
          id: 1,
          title: '春季运动会',
          startDate: new Date(Date.now() + 86400000) // 明天开始
        }
      };

      mockActivityRegistration.findByPk.mockResolvedValue(mockRegistration);

      const result = await activityManagementService.cancelRegistration(registrationId, reason);

      expect(mockActivityRegistration.findByPk).toHaveBeenCalledWith(registrationId, {
        include: expect.any(Array)
      });
      expect(mockRegistration.update).toHaveBeenCalledWith({
        status: 'cancelled',
        cancelledAt: expect.any(Date),
        cancellationReason: reason
      });
      expect(result).toBe(true);
    });

    it('应该处理报名不存在', async () => {
      const registrationId = 999;

      mockActivityRegistration.findByPk.mockResolvedValue(null);

      await expect(activityManagementService.cancelRegistration(registrationId))
        .rejects.toThrow('报名记录不存在');
    });

    it('应该处理已取消的报名', async () => {
      const registrationId = 1;

      const mockCancelledRegistration = {
        id: 1,
        status: 'cancelled'
      };

      mockActivityRegistration.findByPk.mockResolvedValue(mockCancelledRegistration);

      await expect(activityManagementService.cancelRegistration(registrationId))
        .rejects.toThrow('报名已经取消');
    });

    it('应该处理活动已开始的取消限制', async () => {
      const registrationId = 1;

      const mockRegistration = {
        id: 1,
        status: 'confirmed',
        activity: {
          id: 1,
          startDate: new Date(Date.now() - 3600000) // 1小时前开始
        }
      };

      mockActivityRegistration.findByPk.mockResolvedValue(mockRegistration);

      await expect(activityManagementService.cancelRegistration(registrationId))
        .rejects.toThrow('活动已开始，无法取消报名');
    });

    it('应该处理取消截止时间', async () => {
      const registrationId = 1;

      const mockRegistration = {
        id: 1,
        status: 'confirmed',
        activity: {
          id: 1,
          startDate: new Date(Date.now() + 3600000), // 1小时后开始
          cancellationDeadline: new Date(Date.now() - 1800000) // 30分钟前截止取消
        }
      };

      mockActivityRegistration.findByPk.mockResolvedValue(mockRegistration);

      await expect(activityManagementService.cancelRegistration(registrationId))
        .rejects.toThrow('已超过取消报名的截止时间');
    });
  });

  describe('getActivityStatistics', () => {
    it('应该获取活动统计信息', async () => {
      const kindergartenId = 1;
      const timeRange = {
        start: '2024-01-01',
        end: '2024-12-31'
      };

      const mockStatistics = {
        totalActivities: 25,
        publishedActivities: 20,
        draftActivities: 5,
        totalRegistrations: 450,
        averageParticipation: 0.75,
        typeDistribution: {
          sports: 8,
          art: 6,
          science: 4,
          music: 2
        },
        monthlyTrends: [
          { month: '2024-01', activities: 3, registrations: 45 },
          { month: '2024-02', activities: 2, registrations: 38 }
        ],
        popularActivities: [
          { id: 1, title: '春季运动会', registrations: 95 },
          { id: 2, title: '艺术展览', registrations: 78 }
        ]
      };

      mockActivity.count.mockResolvedValueOnce(25); // total
      mockActivity.count.mockResolvedValueOnce(20); // published
      mockActivity.count.mockResolvedValueOnce(5);  // draft
      mockActivityRegistration.count.mockResolvedValue(450);

      // Mock complex queries
      mockActivity.findAll.mockResolvedValue([
        { type: 'sports', count: 8 },
        { type: 'art', count: 6 }
      ]);

      const result = await activityManagementService.getActivityStatistics(kindergartenId, timeRange);

      expect(result).toEqual(expect.objectContaining({
        totalActivities: expect.any(Number),
        publishedActivities: expect.any(Number),
        totalRegistrations: expect.any(Number)
      }));
    });

    it('应该处理无数据情况', async () => {
      const kindergartenId = 999;

      mockActivity.count.mockResolvedValue(0);
      mockActivityRegistration.count.mockResolvedValue(0);

      const result = await activityManagementService.getActivityStatistics(kindergartenId);

      expect(result.totalActivities).toBe(0);
      expect(result.totalRegistrations).toBe(0);
      expect(result.averageParticipation).toBe(0);
    });
  });

  describe('sendActivityReminders', () => {
    it('应该发送活动提醒', async () => {
      const activityId = 1;
      const reminderType = 'before_activity';

      const mockActivity = {
        id: 1,
        title: '春季运动会',
        startDate: new Date(Date.now() + 86400000),
        registrations: [
          {
            id: 1,
            student: { id: 1, name: '张小明' },
            parent: { id: 1, name: '张爸爸', phone: '13800138001', email: 'parent1@example.com' }
          },
          {
            id: 2,
            student: { id: 2, name: '李小红' },
            parent: { id: 2, name: '李妈妈', phone: '13800138002', email: 'parent2@example.com' }
          }
        ]
      };

      mockActivity.findByPk.mockResolvedValue(mockActivity);
      mockEmailService.sendBulkEmail.mockResolvedValue({ sent: 2, failed: 0 });
      mockSMSService.sendBulkSMS.mockResolvedValue({ sent: 2, failed: 0 });

      const result = await activityManagementService.sendActivityReminders(activityId, reminderType);

      expect(mockActivity.findByPk).toHaveBeenCalledWith(activityId, {
        include: expect.any(Array)
      });
      expect(mockEmailService.sendBulkEmail).toHaveBeenCalled();
      expect(mockSMSService.sendBulkSMS).toHaveBeenCalled();
      expect(result).toEqual({
        totalRecipients: 2,
        emailsSent: 2,
        smsSent: 2,
        failed: 0
      });
    });

    it('应该处理活动不存在', async () => {
      const activityId = 999;

      mockActivity.findByPk.mockResolvedValue(null);

      await expect(activityManagementService.sendActivityReminders(activityId, 'before_activity'))
        .rejects.toThrow('活动不存在');
    });

    it('应该处理无报名记录', async () => {
      const activityId = 1;

      const mockActivityWithoutRegistrations = {
        id: 1,
        title: '无人报名的活动',
        registrations: []
      };

      mockActivity.findByPk.mockResolvedValue(mockActivityWithoutRegistrations);

      const result = await activityManagementService.sendActivityReminders(activityId, 'before_activity');

      expect(result).toEqual({
        totalRecipients: 0,
        emailsSent: 0,
        smsSent: 0,
        failed: 0
      });
    });
  });

  describe('Error Handling', () => {
    it('应该处理数据库事务失败', async () => {
      const activityData = {
        title: '测试活动',
        kindergartenId: 1
      };

      mockKindergarten.findByPk.mockResolvedValue({ id: 1 });
      mockActivity.create.mockRejectedValue(new Error('数据库连接失败'));

      await expect(activityManagementService.createActivity(activityData))
        .rejects.toThrow('数据库连接失败');

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('创建活动失败'),
        expect.objectContaining({
          error: '数据库连接失败'
        })
      );
    });

    it('应该处理并发报名冲突', async () => {
      const registrationData = {
        activityId: 1,
        studentId: 1
      };

      const mockActivity = {
        id: 1,
        status: 'published',
        maxParticipants: 50,
        registrationDeadline: new Date(Date.now() + 86400000),
        registrations: Array.from({ length: 49 }, (_, i) => ({ id: i + 1 }))
      };

      mockActivity.findByPk.mockResolvedValue(mockActivity);
      mockStudent.findByPk.mockResolvedValue({ id: 1, kindergartenId: 1 });
      mockActivityRegistration.findOne.mockResolvedValue(null);
      
      // 模拟并发情况下名额被占满
      mockActivityRegistration.create.mockRejectedValue(new Error('名额已满'));

      await expect(activityManagementService.registerForActivity(registrationData))
        .rejects.toThrow('名额已满');
    });

    it('应该处理通知发送失败', async () => {
      const activityId = 1;

      const mockActivity = {
        id: 1,
        registrations: [
          { parent: { email: 'invalid-email' } }
        ]
      };

      mockActivity.findByPk.mockResolvedValue(mockActivity);
      mockEmailService.sendBulkEmail.mockRejectedValue(new Error('邮件服务不可用'));

      const result = await activityManagementService.sendActivityReminders(activityId, 'before_activity');

      expect(result.failed).toBeGreaterThan(0);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('部分提醒发送失败')
      );
    });
  });

  describe('Performance Optimization', () => {
    it('应该支持批量操作', async () => {
      const activityIds = [1, 2, 3, 4, 5];
      const updateData = { status: 'published' };

      mockActivity.update.mockResolvedValue([5]); // 5 rows affected

      const result = await activityManagementService.batchUpdateActivities(activityIds, updateData);

      expect(mockActivity.update).toHaveBeenCalledWith(
        updateData,
        { where: { id: { [Symbol.for('in')]: activityIds } } }
      );
      expect(result.updated).toBe(5);
    });

    it('应该实现查询缓存', async () => {
      const filters = { kindergartenId: 1, status: 'published' };

      // 第一次查询
      const mockActivities = { rows: [], count: 0 };
      mockActivity.findAndCountAll.mockResolvedValue(mockActivities);

      await activityManagementService.getActivities(filters);
      await activityManagementService.getActivities(filters); // 第二次相同查询

      // 验证缓存是否生效（具体实现取决于缓存策略）
      expect(mockActivity.findAndCountAll).toHaveBeenCalledTimes(1);
    });

    it('应该优化大量数据的分页查询', async () => {
      const filters = {
        page: 100,
        pageSize: 50
      };

      await activityManagementService.getActivities(filters);

      expect(mockActivity.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 50,
          offset: 4950 // (100-1) * 50
        })
      );
    });
  });
});
