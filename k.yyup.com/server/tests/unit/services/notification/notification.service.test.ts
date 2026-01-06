import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock models
const mockNotification = {
  create: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  count: jest.fn(),
  bulkCreate: jest.fn()
};

const mockUser = {
  findAll: jest.fn(),
  findByPk: jest.fn()
};

const mockNotificationRecipient = {
  create: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  bulkCreate: jest.fn()
};

const mockSequelize = {
  transaction: jest.fn(),
  literal: jest.fn(),
  fn: jest.fn(),
  col: jest.fn(),
  where: jest.fn()
};

const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn()
};

// Mock external services
const mockEmailService = {
  sendEmail: jest.fn(),
  sendBulkEmail: jest.fn()
};

const mockSMSService = {
  sendSMS: jest.fn(),
  sendBulkSMS: jest.fn()
};

const mockPushService = {
  sendPushNotification: jest.fn(),
  sendBulkPushNotification: jest.fn()
};

// Mock imports
jest.unstable_mockModule('../../../../../src/models/notification.model', () => ({
  Notification: mockNotification
}));

jest.unstable_mockModule('../../../../../src/models/user.model', () => ({
  User: mockUser
}));

jest.unstable_mockModule('../../../../../src/models/notification-recipient.model', () => ({
  NotificationRecipient: mockNotificationRecipient
}));

jest.unstable_mockModule('../../../../../src/config/database', () => ({
  sequelize: mockSequelize
}));

jest.unstable_mockModule('../../../../../src/services/email.service', () => mockEmailService);
jest.unstable_mockModule('../../../../../src/services/sms.service', () => mockSMSService);
jest.unstable_mockModule('../../../../../src/services/push.service', () => mockPushService);


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

describe('Notification Service', () => {
  let notificationService: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/services/notification/notification.service');
    notificationService = imported.NotificationService;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockSequelize.transaction.mockResolvedValue(mockTransaction);
  });

  describe('createNotification', () => {
    it('应该成功创建通知', async () => {
      const notificationData = {
        title: '重要通知',
        content: '明天学校放假',
        type: 'announcement',
        targetType: 'all',
        priority: 'high',
        scheduledAt: new Date('2024-04-01T09:00:00Z')
      };

      const mockCreatedNotification = {
        id: 1,
        ...notificationData,
        status: 'scheduled',
        createdAt: new Date()
      };

      mockNotification.create.mockResolvedValue(mockCreatedNotification);

      const result = await notificationService.createNotification(notificationData);

      expect(mockNotification.create).toHaveBeenCalledWith(notificationData);
      expect(result).toEqual(mockCreatedNotification);
    });

    it('应该处理创建通知时的错误', async () => {
      const notificationData = {
        title: '测试通知',
        content: '测试内容'
      };

      const error = new Error('数据库错误');
      mockNotification.create.mockRejectedValue(error);

      await expect(notificationService.createNotification(notificationData))
        .rejects.toThrow('数据库错误');
    });
  });

  describe('getNotifications', () => {
    it('应该获取通知列表', async () => {
      const queryOptions = {
        page: 1,
        pageSize: 10,
        type: 'announcement',
        status: 'sent'
      };

      const mockNotifications = [
        {
          id: 1,
          title: '通知1',
          content: '内容1',
          type: 'announcement',
          status: 'sent',
          createdAt: new Date()
        },
        {
          id: 2,
          title: '通知2',
          content: '内容2',
          type: 'announcement',
          status: 'sent',
          createdAt: new Date()
        }
      ];

      mockNotification.findAll.mockResolvedValue(mockNotifications);
      mockNotification.count.mockResolvedValue(2);

      const result = await notificationService.getNotifications(queryOptions);

      expect(mockNotification.findAll).toHaveBeenCalledWith({
        where: {
          type: 'announcement',
          status: 'sent'
        },
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']],
        include: expect.any(Array)
      });

      expect(result).toEqual({
        notifications: mockNotifications,
        total: 2,
        page: 1,
        pageSize: 10
      });
    });

    it('应该支持搜索功能', async () => {
      const queryOptions = {
        page: 1,
        pageSize: 10,
        search: '重要'
      };

      mockNotification.findAll.mockResolvedValue([]);
      mockNotification.count.mockResolvedValue(0);

      await notificationService.getNotifications(queryOptions);

      expect(mockNotification.findAll).toHaveBeenCalledWith({
        where: {
          [mockSequelize.Op.or]: [
            { title: { [mockSequelize.Op.like]: '%重要%' } },
            { content: { [mockSequelize.Op.like]: '%重要%' } }
          ]
        },
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']],
        include: expect.any(Array)
      });
    });
  });

  describe('getNotificationById', () => {
    it('应该获取指定通知详情', async () => {
      const notificationId = 1;
      const mockNotification = {
        id: 1,
        title: '重要通知',
        content: '明天学校放假',
        type: 'announcement',
        status: 'sent',
        recipients: [
          { id: 1, name: '张三', status: 'read' },
          { id: 2, name: '李四', status: 'unread' }
        ],
        createdAt: new Date(),
        sentAt: new Date()
      };

      mockNotification.findByPk.mockResolvedValue(mockNotification);

      const result = await notificationService.getNotificationById(notificationId);

      expect(mockNotification.findByPk).toHaveBeenCalledWith(notificationId, {
        include: expect.any(Array)
      });
      expect(result).toEqual(mockNotification);
    });

    it('应该在通知不存在时返回null', async () => {
      const notificationId = 999;

      mockNotification.findByPk.mockResolvedValue(null);

      const result = await notificationService.getNotificationById(notificationId);

      expect(result).toBeNull();
    });
  });

  describe('updateNotification', () => {
    it('应该成功更新通知', async () => {
      const notificationId = 1;
      const updateData = {
        title: '更新后的通知',
        content: '更新后的内容',
        priority: 'medium'
      };

      const mockExistingNotification = {
        id: 1,
        title: '原通知',
        status: 'draft',
        update: jest.fn().mockResolvedValue(undefined)
      };

      const mockUpdatedNotification = {
        id: 1,
        ...updateData,
        status: 'draft',
        updatedAt: new Date()
      };

      mockNotification.findByPk.mockResolvedValue(mockExistingNotification);
      mockExistingNotification.update.mockResolvedValue(mockUpdatedNotification);

      const result = await notificationService.updateNotification(notificationId, updateData);

      expect(mockNotification.findByPk).toHaveBeenCalledWith(notificationId);
      expect(mockExistingNotification.update).toHaveBeenCalledWith(updateData);
      expect(result).toEqual(mockUpdatedNotification);
    });

    it('应该在通知不存在时返回null', async () => {
      const notificationId = 999;
      const updateData = { title: '测试' };

      mockNotification.findByPk.mockResolvedValue(null);

      const result = await notificationService.updateNotification(notificationId, updateData);

      expect(result).toBeNull();
    });

    it('应该阻止更新已发送的通知', async () => {
      const notificationId = 1;
      const updateData = { title: '测试' };

      const mockSentNotification = {
        id: 1,
        status: 'sent'
      };

      mockNotification.findByPk.mockResolvedValue(mockSentNotification);

      await expect(notificationService.updateNotification(notificationId, updateData))
        .rejects.toThrow('无法更新已发送的通知');
    });
  });

  describe('deleteNotification', () => {
    it('应该成功删除通知', async () => {
      const notificationId = 1;

      const mockExistingNotification = {
        id: 1,
        status: 'draft',
        destroy: jest.fn().mockResolvedValue(undefined)
      };

      mockNotification.findByPk.mockResolvedValue(mockExistingNotification);

      const result = await notificationService.deleteNotification(notificationId);

      expect(mockNotification.findByPk).toHaveBeenCalledWith(notificationId);
      expect(mockExistingNotification.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('应该在通知不存在时返回false', async () => {
      const notificationId = 999;

      mockNotification.findByPk.mockResolvedValue(null);

      const result = await notificationService.deleteNotification(notificationId);

      expect(result).toBe(false);
    });

    it('应该阻止删除已发送的通知', async () => {
      const notificationId = 1;

      const mockSentNotification = {
        id: 1,
        status: 'sent'
      };

      mockNotification.findByPk.mockResolvedValue(mockSentNotification);

      await expect(notificationService.deleteNotification(notificationId))
        .rejects.toThrow('无法删除已发送的通知');
    });
  });

  describe('sendNotification', () => {
    it('应该成功发送通知', async () => {
      const notificationId = 1;

      const mockNotification = {
        id: 1,
        title: '重要通知',
        content: '明天学校放假',
        type: 'announcement',
        targetType: 'all',
        channels: ['email', 'push'],
        status: 'draft',
        update: jest.fn()
      };

      const mockRecipients = [
        { id: 1, email: 'user1@example.com', name: '张三' },
        { id: 2, email: 'user2@example.com', name: '李四' }
      ];

      mockNotification.findByPk.mockResolvedValue(mockNotification);
      mockUser.findAll.mockResolvedValue(mockRecipients);
      mockEmailService.sendBulkEmail.mockResolvedValue({ success: 2, failed: 0 });
      mockPushService.sendBulkPushNotification.mockResolvedValue({ success: 2, failed: 0 });
      mockNotificationRecipient.bulkCreate.mockResolvedValue([]);

      const result = await notificationService.sendNotification(notificationId);

      expect(mockNotification.findByPk).toHaveBeenCalledWith(notificationId);
      expect(mockEmailService.sendBulkEmail).toHaveBeenCalled();
      expect(mockPushService.sendBulkPushNotification).toHaveBeenCalled();
      expect(mockNotification.update).toHaveBeenCalledWith({
        status: 'sent',
        sentAt: expect.any(Date)
      });

      expect(result).toEqual({
        success: true,
        sentCount: 2,
        failedCount: 0
      });
    });

    it('应该处理部分发送失败的情况', async () => {
      const notificationId = 1;

      const mockNotification = {
        id: 1,
        title: '重要通知',
        content: '明天学校放假',
        channels: ['email'],
        status: 'draft',
        update: jest.fn()
      };

      const mockRecipients = [
        { id: 1, email: 'user1@example.com' },
        { id: 2, email: 'user2@example.com' }
      ];

      mockNotification.findByPk.mockResolvedValue(mockNotification);
      mockUser.findAll.mockResolvedValue(mockRecipients);
      mockEmailService.sendBulkEmail.mockResolvedValue({ 
        success: 1, 
        failed: 1,
        errors: ['user2@example.com: 邮箱不存在']
      });

      const result = await notificationService.sendNotification(notificationId);

      expect(result).toEqual({
        success: false,
        sentCount: 1,
        failedCount: 1,
        errors: ['user2@example.com: 邮箱不存在']
      });
    });

    it('应该在通知不存在时抛出错误', async () => {
      const notificationId = 999;

      mockNotification.findByPk.mockResolvedValue(null);

      await expect(notificationService.sendNotification(notificationId))
        .rejects.toThrow('通知不存在');
    });

    it('应该阻止重复发送已发送的通知', async () => {
      const notificationId = 1;

      const mockSentNotification = {
        id: 1,
        status: 'sent'
      };

      mockNotification.findByPk.mockResolvedValue(mockSentNotification);

      await expect(notificationService.sendNotification(notificationId))
        .rejects.toThrow('通知已发送');
    });
  });

  describe('sendBulkNotification', () => {
    it('应该成功发送批量通知', async () => {
      const bulkData = {
        title: '批量通知',
        content: '批量通知内容',
        recipients: [1, 2, 3],
        type: 'announcement',
        channels: ['email', 'push']
      };

      const mockCreatedNotification = {
        id: 10,
        ...bulkData,
        status: 'draft'
      };

      const mockRecipients = [
        { id: 1, email: 'user1@example.com' },
        { id: 2, email: 'user2@example.com' },
        { id: 3, email: 'user3@example.com' }
      ];

      mockNotification.create.mockResolvedValue(mockCreatedNotification);
      mockUser.findAll.mockResolvedValue(mockRecipients);
      mockEmailService.sendBulkEmail.mockResolvedValue({ success: 3, failed: 0 });
      mockPushService.sendBulkPushNotification.mockResolvedValue({ success: 3, failed: 0 });

      const result = await notificationService.sendBulkNotification(bulkData);

      expect(mockNotification.create).toHaveBeenCalledWith({
        title: bulkData.title,
        content: bulkData.content,
        type: bulkData.type,
        targetType: 'specific',
        channels: bulkData.channels,
        status: 'draft'
      });

      expect(result).toEqual({
        success: true,
        sentCount: 3,
        failedCount: 0,
        notificationId: 10
      });
    });
  });

  describe('markAsRead', () => {
    it('应该成功标记通知为已读', async () => {
      const notificationId = 1;
      const userId = 1;

      const mockRecipient = {
        id: 1,
        notificationId: 1,
        userId: 1,
        status: 'unread',
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockNotificationRecipient.findOne.mockResolvedValue(mockRecipient);

      const result = await notificationService.markAsRead(notificationId, userId);

      expect(mockNotificationRecipient.findOne).toHaveBeenCalledWith({
        where: { notificationId, userId }
      });
      expect(mockRecipient.update).toHaveBeenCalledWith({
        status: 'read',
        readAt: expect.any(Date)
      });
      expect(result).toBe(true);
    });

    it('应该在接收记录不存在时返回false', async () => {
      const notificationId = 999;
      const userId = 1;

      mockNotificationRecipient.findOne.mockResolvedValue(null);

      const result = await notificationService.markAsRead(notificationId, userId);

      expect(result).toBe(false);
    });
  });

  describe('markAsUnread', () => {
    it('应该成功标记通知为未读', async () => {
      const notificationId = 1;
      const userId = 1;

      const mockRecipient = {
        id: 1,
        notificationId: 1,
        userId: 1,
        status: 'read',
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockNotificationRecipient.findOne.mockResolvedValue(mockRecipient);

      const result = await notificationService.markAsUnread(notificationId, userId);

      expect(mockRecipient.update).toHaveBeenCalledWith({
        status: 'unread',
        readAt: null
      });
      expect(result).toBe(true);
    });
  });

  describe('markAllAsRead', () => {
    it('应该成功标记所有通知为已读', async () => {
      const userId = 1;

      mockNotificationRecipient.update.mockResolvedValue([5]); // 5条记录被更新

      const result = await notificationService.markAllAsRead(userId);

      expect(mockNotificationRecipient.update).toHaveBeenCalledWith(
        {
          status: 'read',
          readAt: expect.any(Date)
        },
        {
          where: {
            userId,
            status: 'unread'
          }
        }
      );
      expect(result).toBe(5);
    });
  });

  describe('getUnreadCount', () => {
    it('应该获取未读通知数量', async () => {
      const userId = 1;

      mockNotificationRecipient.count.mockResolvedValue(5);

      const result = await notificationService.getUnreadCount(userId);

      expect(mockNotificationRecipient.count).toHaveBeenCalledWith({
        where: {
          userId,
          status: 'unread'
        }
      });
      expect(result).toBe(5);
    });
  });

  describe('getNotificationStats', () => {
    it('应该获取通知统计信息', async () => {
      const options = {
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      };

      const mockStats = [
        { status: 'sent', count: 85 },
        { status: 'scheduled', count: 10 },
        { status: 'draft', count: 5 }
      ];

      const mockTypeStats = [
        { type: 'announcement', count: 40 },
        { type: 'reminder', count: 30 },
        { type: 'alert', count: 15 }
      ];

      mockNotification.findAll.mockResolvedValueOnce(mockStats);
      mockNotification.findAll.mockResolvedValueOnce(mockTypeStats);
      mockNotificationRecipient.count.mockResolvedValueOnce(750); // 总接收数
      mockNotificationRecipient.count.mockResolvedValueOnce(563); // 已读数

      const result = await notificationService.getNotificationStats(options);

      expect(result).toEqual({
        totalNotifications: 100,
        sentNotifications: 85,
        scheduledNotifications: 10,
        draftNotifications: 5,
        readRate: 0.75,
        topTypes: mockTypeStats
      });
    });
  });

  describe('scheduleNotification', () => {
    it('应该成功安排定时通知', async () => {
      const scheduleData = {
        title: '定时通知',
        content: '定时通知内容',
        scheduledAt: '2024-04-01T09:00:00Z',
        recipients: [1, 2, 3]
      };

      const mockScheduledNotification = {
        id: 1,
        ...scheduleData,
        status: 'scheduled'
      };

      mockNotification.create.mockResolvedValue(mockScheduledNotification);

      const result = await notificationService.scheduleNotification(scheduleData);

      expect(mockNotification.create).toHaveBeenCalledWith({
        ...scheduleData,
        status: 'scheduled'
      });
      expect(result).toEqual(mockScheduledNotification);
    });
  });

  describe('cancelScheduledNotification', () => {
    it('应该成功取消定时通知', async () => {
      const notificationId = 1;

      const mockScheduledNotification = {
        id: 1,
        status: 'scheduled',
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockNotification.findByPk.mockResolvedValue(mockScheduledNotification);

      const result = await notificationService.cancelScheduledNotification(notificationId);

      expect(mockScheduledNotification.update).toHaveBeenCalledWith({
        status: 'cancelled'
      });
      expect(result).toBe(true);
    });

    it('应该在通知不是定时状态时返回false', async () => {
      const notificationId = 1;

      const mockSentNotification = {
        id: 1,
        status: 'sent'
      };

      mockNotification.findByPk.mockResolvedValue(mockSentNotification);

      const result = await notificationService.cancelScheduledNotification(notificationId);

      expect(result).toBe(false);
    });
  });

  describe('exportNotifications', () => {
    it('应该导出通知数据', async () => {
      const options = {
        format: 'excel',
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      };

      const mockNotifications = [
        {
          id: 1,
          title: '通知1',
          content: '内容1',
          type: 'announcement',
          status: 'sent',
          createdAt: new Date(),
          sentAt: new Date()
        }
      ];

      mockNotification.findAll.mockResolvedValue(mockNotifications);

      // Mock Excel export
      const mockExcelService = {
        createWorkbook: jest.fn().mockReturnValue({
          addWorksheet: jest.fn().mockReturnValue({
            addRow: jest.fn(),
            columns: []
          }),
          xlsx: {
            writeFile: jest.fn()
          }
        })
      };

      const result = await notificationService.exportNotifications(options);

      expect(mockNotification.findAll).toHaveBeenCalledWith({
        where: {
          createdAt: {
            [mockSequelize.Op.between]: [options.startDate, options.endDate]
          }
        },
        order: [['createdAt', 'DESC']]
      });

      expect(result).toEqual({
        filename: expect.stringContaining('notifications_'),
        path: expect.stringContaining('/exports/'),
        size: expect.any(Number)
      });
    });
  });

  describe('错误处理', () => {
    it('应该处理数据库连接错误', async () => {
      const error = new Error('数据库连接失败');
      mockNotification.findAll.mockRejectedValue(error);

      await expect(notificationService.getNotifications({}))
        .rejects.toThrow('数据库连接失败');
    });

    it('应该处理事务回滚', async () => {
      const notificationData = {
        title: '测试通知',
        content: '测试内容'
      };

      const error = new Error('创建失败');
      mockNotification.create.mockRejectedValue(error);
      mockTransaction.rollback.mockResolvedValue(undefined);

      await expect(notificationService.createNotification(notificationData))
        .rejects.toThrow('创建失败');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });
});
