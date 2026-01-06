import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock dependencies
const mockNotificationModel = {
  create: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  count: jest.fn(),
  findAndCountAll: jest.fn(),
  bulkCreate: jest.fn()
};

const mockUserModel = {
  findByPk: jest.fn(),
  findAll: jest.fn()
};

const mockNotificationTemplateModel = {
  findOne: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn()
};

const mockNotificationPreferenceModel = {
  findOne: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn()
};

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
};

const mockEmailService = {
  sendEmail: jest.fn(),
  sendBulkEmail: jest.fn(),
  validateEmail: jest.fn()
};

const mockSMSService = {
  sendSMS: jest.fn(),
  sendBulkSMS: jest.fn(),
  validatePhoneNumber: jest.fn()
};

const mockPushNotificationService = {
  sendPushNotification: jest.fn(),
  sendBulkPushNotification: jest.fn(),
  registerDevice: jest.fn()
};

const mockWebSocketService = {
  sendToUser: jest.fn(),
  sendToRoom: jest.fn(),
  broadcast: jest.fn()
};

const mockTemplateEngine = {
  render: jest.fn(),
  compile: jest.fn(),
  registerHelper: jest.fn()
};

const mockScheduler = {
  schedule: jest.fn(),
  cancel: jest.fn(),
  reschedule: jest.fn()
};

const mockRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  exists: jest.fn(),
  expire: jest.fn(),
  zadd: jest.fn(),
  zrange: jest.fn(),
  zrem: jest.fn()
};

const mockSequelize = {
  transaction: jest.fn(),
  Op: {
    and: Symbol('and'),
    or: Symbol('or'),
    in: Symbol('in'),
    between: Symbol('between'),
    gte: Symbol('gte'),
    lte: Symbol('lte')
  }
};

// Mock imports
jest.unstable_mockModule('../../../../../../src/models/notification.model', () => ({
  default: mockNotificationModel
}));

jest.unstable_mockModule('../../../../../../src/models/user.model', () => ({
  default: mockUserModel
}));

jest.unstable_mockModule('../../../../../../src/models/notification-template.model', () => ({
  default: mockNotificationTemplateModel
}));

jest.unstable_mockModule('../../../../../../src/models/notification-preference.model', () => ({
  default: mockNotificationPreferenceModel
}));

jest.unstable_mockModule('../../../../../../src/utils/logger', () => ({
  default: mockLogger
}));

jest.unstable_mockModule('../../../../../../src/services/email.service', () => ({
  default: mockEmailService
}));

jest.unstable_mockModule('../../../../../../src/services/sms.service', () => ({
  default: mockSMSService
}));

jest.unstable_mockModule('../../../../../../src/services/push-notification.service', () => ({
  default: mockPushNotificationService
}));

jest.unstable_mockModule('../../../../../../src/services/websocket.service', () => ({
  default: mockWebSocketService
}));

jest.unstable_mockModule('../../../../../../src/services/template-engine.service', () => ({
  default: mockTemplateEngine
}));

jest.unstable_mockModule('../../../../../../src/services/scheduler.service', () => ({
  default: mockScheduler
}));

jest.unstable_mockModule('../../../../../../src/config/redis', () => ({
  default: mockRedisClient
}));

jest.unstable_mockModule('../../../../../../src/config/database', () => ({
  default: mockSequelize
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

describe('NotificationService', () => {
  let notificationService: any;

  beforeAll(async () => {
    const imported = await import('../../../../../../src/services/system/notification.service');
    notificationService = imported.default || imported.NotificationService || imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup transaction mock
    mockSequelize.transaction.mockImplementation((callback) => {
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      return callback(transaction);
    });
  });

  describe('通知发送', () => {
    it('应该发送单个通知', async () => {
      const notificationData = {
        userId: 1,
        title: '活动提醒',
        content: '您报名的活动将在明天开始',
        type: 'activity_reminder',
        channels: ['email', 'push'],
        priority: 'normal',
        metadata: {
          activityId: 123,
          activityName: '英语课'
        }
      };

      const mockUser = {
        id: 1,
        name: '张三',
        email: 'zhang@example.com',
        phone: '13800138001',
        deviceTokens: ['device_token_123']
      };

      const mockTemplate = {
        id: 1,
        type: 'activity_reminder',
        emailTemplate: '您好 {{userName}}，{{content}}',
        pushTemplate: '{{title}}: {{content}}'
      };

      const mockNotification = {
        id: 1,
        ...notificationData,
        status: 'sent',
        sentAt: new Date()
      };

      mockUserModel.findByPk.mockResolvedValue(mockUser);
      mockNotificationTemplateModel.findOne.mockResolvedValue(mockTemplate);
      mockTemplateEngine.render.mockImplementation((template, data) => 
        template.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] || match)
      );
      mockEmailService.sendEmail.mockResolvedValue({ success: true, messageId: 'email_123' });
      mockPushNotificationService.sendPushNotification.mockResolvedValue({ success: true, messageId: 'push_123' });
      mockNotificationModel.create.mockResolvedValue(mockNotification);

      const result = await notificationService.sendNotification(notificationData);

      expect(mockUserModel.findByPk).toHaveBeenCalledWith(1);
      expect(mockNotificationTemplateModel.findOne).toHaveBeenCalledWith({
        where: { type: 'activity_reminder' }
      });
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith({
        to: 'zhang@example.com',
        subject: '活动提醒',
        html: '您好 张三，您报名的活动将在明天开始'
      });
      expect(mockPushNotificationService.sendPushNotification).toHaveBeenCalledWith({
        deviceTokens: ['device_token_123'],
        title: '活动提醒',
        body: '活动提醒: 您报名的活动将在明天开始'
      });
      expect(mockNotificationModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          title: '活动提醒',
          status: 'sent'
        })
      );
      expect(result.success).toBe(true);
      expect(result.notification).toEqual(mockNotification);
    });

    it('应该处理用户偏好设置', async () => {
      const notificationData = {
        userId: 2,
        title: '系统通知',
        content: '系统维护通知',
        type: 'system_maintenance',
        channels: ['email', 'sms', 'push']
      };

      const mockUser = {
        id: 2,
        name: '李四',
        email: 'li@example.com',
        phone: '13800138002'
      };

      const mockPreferences = {
        userId: 2,
        emailEnabled: true,
        smsEnabled: false, // 用户禁用了短信
        pushEnabled: true,
        quietHours: {
          start: '22:00',
          end: '08:00'
        }
      };

      mockUserModel.findByPk.mockResolvedValue(mockUser);
      mockNotificationPreferenceModel.findOne.mockResolvedValue(mockPreferences);
      mockNotificationTemplateModel.findOne.mockResolvedValue({
        emailTemplate: '{{content}}',
        pushTemplate: '{{content}}'
      });
      mockEmailService.sendEmail.mockResolvedValue({ success: true });
      mockPushNotificationService.sendPushNotification.mockResolvedValue({ success: true });
      mockNotificationModel.create.mockResolvedValue({ id: 2, status: 'sent' });

      const result = await notificationService.sendNotification(notificationData);

      expect(mockEmailService.sendEmail).toHaveBeenCalled();
      expect(mockPushNotificationService.sendPushNotification).toHaveBeenCalled();
      expect(mockSMSService.sendSMS).not.toHaveBeenCalled(); // 用户禁用了短信
      expect(result.success).toBe(true);
    });

    it('应该处理静默时间', async () => {
      const notificationData = {
        userId: 3,
        title: '非紧急通知',
        content: '普通通知内容',
        type: 'general',
        channels: ['push'],
        priority: 'low'
      };

      const mockUser = {
        id: 3,
        name: '王五',
        deviceTokens: ['device_token_456']
      };

      const mockPreferences = {
        userId: 3,
        pushEnabled: true,
        quietHours: {
          start: '22:00',
          end: '08:00'
        }
      };

      // 模拟当前时间在静默时间内
      const originalDate = Date;
      const mockDate = new Date('2024-01-01T23:30:00'); // 23:30，在静默时间内
      global.Date = jest.fn(() => mockDate) as any;
      global.Date.now = jest.fn(() => mockDate.getTime());

      mockUserModel.findByPk.mockResolvedValue(mockUser);
      mockNotificationPreferenceModel.findOne.mockResolvedValue(mockPreferences);
      mockScheduler.schedule.mockResolvedValue({ jobId: 'scheduled_123' });
      mockNotificationModel.create.mockResolvedValue({
        id: 3,
        status: 'scheduled',
        scheduledFor: new Date('2024-01-02T08:00:00')
      });

      const result = await notificationService.sendNotification(notificationData);

      expect(mockScheduler.schedule).toHaveBeenCalledWith(
        expect.any(Date), // 08:00
        expect.any(Function)
      );
      expect(mockPushNotificationService.sendPushNotification).not.toHaveBeenCalled();
      expect(result.status).toBe('scheduled');

      // 恢复原始Date
      global.Date = originalDate;
    });

    it('应该处理高优先级通知忽略静默时间', async () => {
      const notificationData = {
        userId: 4,
        title: '紧急通知',
        content: '系统故障，请立即处理',
        type: 'emergency',
        channels: ['push', 'sms'],
        priority: 'urgent'
      };

      const mockUser = {
        id: 4,
        name: '赵六',
        phone: '13800138004',
        deviceTokens: ['device_token_789']
      };

      const mockPreferences = {
        userId: 4,
        pushEnabled: true,
        smsEnabled: true,
        quietHours: {
          start: '22:00',
          end: '08:00'
        }
      };

      // 模拟当前时间在静默时间内
      const mockDate = new Date('2024-01-01T01:00:00'); // 凌晨1点
      global.Date = jest.fn(() => mockDate) as any;

      mockUserModel.findByPk.mockResolvedValue(mockUser);
      mockNotificationPreferenceModel.findOne.mockResolvedValue(mockPreferences);
      mockNotificationTemplateModel.findOne.mockResolvedValue({
        pushTemplate: '紧急：{{content}}',
        smsTemplate: '紧急通知：{{content}}'
      });
      mockPushNotificationService.sendPushNotification.mockResolvedValue({ success: true });
      mockSMSService.sendSMS.mockResolvedValue({ success: true });
      mockNotificationModel.create.mockResolvedValue({ id: 4, status: 'sent' });

      const result = await notificationService.sendNotification(notificationData);

      expect(mockPushNotificationService.sendPushNotification).toHaveBeenCalled();
      expect(mockSMSService.sendSMS).toHaveBeenCalled();
      expect(mockScheduler.schedule).not.toHaveBeenCalled(); // 不延迟发送
      expect(result.success).toBe(true);
    });
  });

  describe('批量通知', () => {
    it('应该发送批量通知', async () => {
      const bulkNotificationData = {
        userIds: [1, 2, 3],
        title: '活动取消通知',
        content: '由于天气原因，今天的户外活动取消',
        type: 'activity_cancellation',
        channels: ['email', 'push']
      };

      const mockUsers = [
        { id: 1, name: '用户1', email: 'user1@example.com', deviceTokens: ['token1'] },
        { id: 2, name: '用户2', email: 'user2@example.com', deviceTokens: ['token2'] },
        { id: 3, name: '用户3', email: 'user3@example.com', deviceTokens: ['token3'] }
      ];

      const mockTemplate = {
        emailTemplate: '{{content}}',
        pushTemplate: '{{title}}: {{content}}'
      };

      mockUserModel.findAll.mockResolvedValue(mockUsers);
      mockNotificationTemplateModel.findOne.mockResolvedValue(mockTemplate);
      mockEmailService.sendBulkEmail.mockResolvedValue({
        success: true,
        results: [
          { email: 'user1@example.com', success: true },
          { email: 'user2@example.com', success: true },
          { email: 'user3@example.com', success: true }
        ]
      });
      mockPushNotificationService.sendBulkPushNotification.mockResolvedValue({
        success: true,
        results: [
          { deviceToken: 'token1', success: true },
          { deviceToken: 'token2', success: true },
          { deviceToken: 'token3', success: true }
        ]
      });
      mockNotificationModel.bulkCreate.mockResolvedValue([
        { id: 1, userId: 1, status: 'sent' },
        { id: 2, userId: 2, status: 'sent' },
        { id: 3, userId: 3, status: 'sent' }
      ]);

      const result = await notificationService.sendBulkNotification(bulkNotificationData);

      expect(mockUserModel.findAll).toHaveBeenCalledWith({
        where: { id: { [mockSequelize.Op.in]: [1, 2, 3] } }
      });
      expect(mockEmailService.sendBulkEmail).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ to: 'user1@example.com' }),
          expect.objectContaining({ to: 'user2@example.com' }),
          expect.objectContaining({ to: 'user3@example.com' })
        ])
      );
      expect(result.totalSent).toBe(3);
      expect(result.successCount).toBe(3);
      expect(result.failureCount).toBe(0);
    });

    it('应该处理批量发送中的部分失败', async () => {
      const bulkNotificationData = {
        userIds: [1, 2, 3],
        title: '测试通知',
        content: '测试内容',
        type: 'test',
        channels: ['email']
      };

      const mockUsers = [
        { id: 1, name: '用户1', email: 'user1@example.com' },
        { id: 2, name: '用户2', email: 'invalid-email' },
        { id: 3, name: '用户3', email: 'user3@example.com' }
      ];

      mockUserModel.findAll.mockResolvedValue(mockUsers);
      mockNotificationTemplateModel.findOne.mockResolvedValue({
        emailTemplate: '{{content}}'
      });
      mockEmailService.sendBulkEmail.mockResolvedValue({
        success: false,
        results: [
          { email: 'user1@example.com', success: true },
          { email: 'invalid-email', success: false, error: 'Invalid email format' },
          { email: 'user3@example.com', success: true }
        ]
      });
      mockNotificationModel.bulkCreate.mockResolvedValue([
        { id: 1, userId: 1, status: 'sent' },
        { id: 2, userId: 2, status: 'failed' },
        { id: 3, userId: 3, status: 'sent' }
      ]);

      const result = await notificationService.sendBulkNotification(bulkNotificationData);

      expect(result.totalSent).toBe(3);
      expect(result.successCount).toBe(2);
      expect(result.failureCount).toBe(1);
      expect(result.failures).toEqual([
        { userId: 2, email: 'invalid-email', error: 'Invalid email format' }
      ]);
    });
  });

  describe('通知模板管理', () => {
    it('应该创建通知模板', async () => {
      const templateData = {
        type: 'enrollment_confirmation',
        name: '报名确认通知',
        emailTemplate: '恭喜您，{{studentName}} 已成功报名 {{activityName}}',
        smsTemplate: '报名成功：{{studentName}} - {{activityName}}',
        pushTemplate: '报名确认：{{activityName}}',
        variables: ['studentName', 'activityName', 'enrollmentDate']
      };

      const mockTemplate = {
        id: 1,
        ...templateData,
        createdAt: new Date()
      };

      mockNotificationTemplateModel.create.mockResolvedValue(mockTemplate);

      const result = await notificationService.createTemplate(templateData);

      expect(mockNotificationTemplateModel.create).toHaveBeenCalledWith(templateData);
      expect(result).toEqual(mockTemplate);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Notification template created',
        expect.objectContaining({ type: 'enrollment_confirmation' })
      );
    });

    it('应该渲染模板', async () => {
      const templateType = 'activity_reminder';
      const channel = 'email';
      const variables = {
        userName: '张三',
        activityName: '英语课',
        activityDate: '2024-01-15',
        activityTime: '09:00'
      };

      const mockTemplate = {
        type: 'activity_reminder',
        emailTemplate: '亲爱的 {{userName}}，您报名的 {{activityName}} 将在 {{activityDate}} {{activityTime}} 开始。'
      };

      mockNotificationTemplateModel.findOne.mockResolvedValue(mockTemplate);
      mockTemplateEngine.render.mockReturnValue(
        '亲爱的 张三，您报名的 英语课 将在 2024-01-15 09:00 开始。'
      );

      const result = await notificationService.renderTemplate(templateType, channel, variables);

      expect(mockNotificationTemplateModel.findOne).toHaveBeenCalledWith({
        where: { type: 'activity_reminder' }
      });
      expect(mockTemplateEngine.render).toHaveBeenCalledWith(
        mockTemplate.emailTemplate,
        variables
      );
      expect(result).toBe('亲爱的 张三，您报名的 英语课 将在 2024-01-15 09:00 开始。');
    });

    it('应该验证模板变量', async () => {
      const templateType = 'payment_reminder';
      const variables = {
        userName: '李四',
        amount: '1500'
        // 缺少必需的 dueDate 变量
      };

      const mockTemplate = {
        type: 'payment_reminder',
        variables: ['userName', 'amount', 'dueDate'],
        emailTemplate: '{{userName}}，您有 {{amount}} 元费用将在 {{dueDate}} 到期。'
      };

      mockNotificationTemplateModel.findOne.mockResolvedValue(mockTemplate);

      await expect(notificationService.validateTemplateVariables(templateType, variables))
        .rejects.toThrow('Missing required template variables: dueDate');
    });
  });

  describe('通知偏好管理', () => {
    it('应该更新用户通知偏好', async () => {
      const userId = 1;
      const preferences = {
        emailEnabled: true,
        smsEnabled: false,
        pushEnabled: true,
        quietHours: {
          start: '22:00',
          end: '07:00'
        },
        categories: {
          activity_reminders: true,
          payment_reminders: true,
          system_notifications: false,
          marketing: false
        }
      };

      const mockExistingPreferences = {
        id: 1,
        userId: 1,
        emailEnabled: false,
        smsEnabled: true
      };

      const mockUpdatedPreferences = {
        id: 1,
        userId: 1,
        ...preferences
      };

      mockNotificationPreferenceModel.findOne.mockResolvedValue(mockExistingPreferences);
      mockNotificationPreferenceModel.update.mockResolvedValue([1]);
      mockNotificationPreferenceModel.findOne.mockResolvedValueOnce(mockExistingPreferences)
                                              .mockResolvedValueOnce(mockUpdatedPreferences);

      const result = await notificationService.updateUserPreferences(userId, preferences);

      expect(mockNotificationPreferenceModel.findOne).toHaveBeenCalledWith({
        where: { userId: 1 }
      });
      expect(mockNotificationPreferenceModel.update).toHaveBeenCalledWith(
        preferences,
        { where: { userId: 1 } }
      );
      expect(result).toEqual(mockUpdatedPreferences);
    });

    it('应该为新用户创建默认偏好', async () => {
      const userId = 2;
      const preferences = {
        emailEnabled: true,
        pushEnabled: true
      };

      const mockDefaultPreferences = {
        id: 2,
        userId: 2,
        emailEnabled: true,
        smsEnabled: true,
        pushEnabled: true,
        quietHours: null,
        categories: {
          activity_reminders: true,
          payment_reminders: true,
          system_notifications: true,
          marketing: false
        }
      };

      mockNotificationPreferenceModel.findOne.mockResolvedValue(null); // 不存在
      mockNotificationPreferenceModel.create.mockResolvedValue(mockDefaultPreferences);

      const result = await notificationService.updateUserPreferences(userId, preferences);

      expect(mockNotificationPreferenceModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 2,
          emailEnabled: true,
          pushEnabled: true
        })
      );
      expect(result).toEqual(mockDefaultPreferences);
    });
  });

  describe('通知历史和统计', () => {
    it('应该获取用户通知历史', async () => {
      const userId = 1;
      const options = {
        page: 1,
        pageSize: 20,
        status: 'sent',
        type: 'activity_reminder'
      };

      const mockNotifications = [
        {
          id: 1,
          userId: 1,
          title: '活动提醒',
          content: '您的活动即将开始',
          type: 'activity_reminder',
          status: 'sent',
          sentAt: new Date('2024-01-10T09:00:00'),
          readAt: new Date('2024-01-10T09:15:00')
        },
        {
          id: 2,
          userId: 1,
          title: '缴费提醒',
          content: '您有费用即将到期',
          type: 'payment_reminder',
          status: 'sent',
          sentAt: new Date('2024-01-09T10:00:00'),
          readAt: null
        }
      ];

      mockNotificationModel.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: mockNotifications
      });

      const result = await notificationService.getUserNotificationHistory(userId, options);

      expect(mockNotificationModel.findAndCountAll).toHaveBeenCalledWith({
        where: {
          userId: 1,
          status: 'sent',
          type: 'activity_reminder'
        },
        order: [['sentAt', 'DESC']],
        limit: 20,
        offset: 0
      });
      expect(result.notifications).toEqual(mockNotifications);
      expect(result.total).toBe(2);
      expect(result.unreadCount).toBe(1);
    });

    it('应该标记通知为已读', async () => {
      const notificationId = 1;
      const userId = 1;

      const mockNotification = {
        id: 1,
        userId: 1,
        title: '测试通知',
        readAt: null
      };

      const mockUpdatedNotification = {
        ...mockNotification,
        readAt: new Date()
      };

      mockNotificationModel.findOne.mockResolvedValue(mockNotification);
      mockNotificationModel.update.mockResolvedValue([1]);
      mockNotificationModel.findOne.mockResolvedValueOnce(mockNotification)
                                   .mockResolvedValueOnce(mockUpdatedNotification);

      const result = await notificationService.markAsRead(notificationId, userId);

      expect(mockNotificationModel.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 }
      });
      expect(mockNotificationModel.update).toHaveBeenCalledWith(
        { readAt: expect.any(Date) },
        { where: { id: 1, userId: 1 } }
      );
      expect(result.readAt).toBeDefined();
    });

    it('应该生成通知统计报告', async () => {
      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31')
      };

      const mockStats = [
        { type: 'activity_reminder', status: 'sent', count: 150 },
        { type: 'activity_reminder', status: 'failed', count: 5 },
        { type: 'payment_reminder', status: 'sent', count: 80 },
        { type: 'payment_reminder', status: 'failed', count: 2 },
        { type: 'system_notification', status: 'sent', count: 30 }
      ];

      mockNotificationModel.findAll.mockResolvedValue(mockStats);

      const report = await notificationService.generateStatisticsReport(dateRange);

      expect(mockNotificationModel.findAll).toHaveBeenCalledWith({
        attributes: ['type', 'status', [expect.any(Object), 'count']],
        where: {
          createdAt: {
            [mockSequelize.Op.between]: [dateRange.start, dateRange.end]
          }
        },
        group: ['type', 'status']
      });
      expect(report.totalSent).toBe(260);
      expect(report.totalFailed).toBe(7);
      expect(report.successRate).toBeCloseTo(0.974);
      expect(report.byType).toHaveProperty('activity_reminder');
      expect(report.byType).toHaveProperty('payment_reminder');
    });
  });

  describe('实时通知', () => {
    it('应该发送实时WebSocket通知', async () => {
      const notificationData = {
        userId: 1,
        title: '新消息',
        content: '您有一条新消息',
        type: 'message',
        realtime: true
      };

      const mockUser = {
        id: 1,
        name: '张三',
        isOnline: true
      };

      mockUserModel.findByPk.mockResolvedValue(mockUser);
      mockWebSocketService.sendToUser.mockResolvedValue({ success: true });
      mockNotificationModel.create.mockResolvedValue({
        id: 1,
        ...notificationData,
        status: 'delivered'
      });

      const result = await notificationService.sendRealtimeNotification(notificationData);

      expect(mockWebSocketService.sendToUser).toHaveBeenCalledWith(1, {
        type: 'notification',
        data: expect.objectContaining({
          title: '新消息',
          content: '您有一条新消息'
        })
      });
      expect(result.success).toBe(true);
      expect(result.deliveredRealtime).toBe(true);
    });

    it('应该广播系统通知', async () => {
      const broadcastData = {
        title: '系统维护通知',
        content: '系统将在今晚进行维护',
        type: 'system_maintenance',
        targetRoles: ['teacher', 'admin']
      };

      mockWebSocketService.broadcast.mockResolvedValue({ success: true, recipientCount: 25 });

      const result = await notificationService.broadcastNotification(broadcastData);

      expect(mockWebSocketService.broadcast).toHaveBeenCalledWith({
        type: 'system_notification',
        data: broadcastData,
        filter: { roles: ['teacher', 'admin'] }
      });
      expect(result.success).toBe(true);
      expect(result.recipientCount).toBe(25);
    });
  });

  describe('错误处理', () => {
    it('应该处理邮件发送失败', async () => {
      const notificationData = {
        userId: 1,
        title: '测试通知',
        content: '测试内容',
        channels: ['email']
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com'
      };

      mockUserModel.findByPk.mockResolvedValue(mockUser);
      mockNotificationTemplateModel.findOne.mockResolvedValue({
        emailTemplate: '{{content}}'
      });
      mockEmailService.sendEmail.mockRejectedValue(new Error('SMTP server unavailable'));
      mockNotificationModel.create.mockResolvedValue({
        id: 1,
        status: 'failed',
        error: 'SMTP server unavailable'
      });

      const result = await notificationService.sendNotification(notificationData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('SMTP server unavailable');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Notification sending failed',
        expect.any(Object)
      );
    });

    it('应该处理用户不存在的情况', async () => {
      const notificationData = {
        userId: 999,
        title: '测试通知',
        content: '测试内容'
      };

      mockUserModel.findByPk.mockResolvedValue(null);

      await expect(notificationService.sendNotification(notificationData))
        .rejects.toThrow('User not found');

      expect(mockNotificationModel.create).not.toHaveBeenCalled();
    });

    it('应该处理模板不存在的情况', async () => {
      const notificationData = {
        userId: 1,
        title: '测试通知',
        content: '测试内容',
        type: 'non_existent_type'
      };

      mockUserModel.findByPk.mockResolvedValue({ id: 1 });
      mockNotificationTemplateModel.findOne.mockResolvedValue(null);

      // 应该使用默认模板
      mockNotificationModel.create.mockResolvedValue({
        id: 1,
        status: 'sent'
      });

      const result = await notificationService.sendNotification(notificationData);

      expect(result.success).toBe(true);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Template not found, using default',
        expect.objectContaining({ type: 'non_existent_type' })
      );
    });
  });

  describe('性能优化', () => {
    it('应该批量处理通知', async () => {
      const notifications = Array.from({ length: 100 }, (_, i) => ({
        userId: i + 1,
        title: `通知 ${i + 1}`,
        content: `内容 ${i + 1}`,
        type: 'bulk_test'
      }));

      mockNotificationModel.bulkCreate.mockResolvedValue(
        notifications.map((n, i) => ({ id: i + 1, ...n, status: 'queued' }))
      );

      const result = await notificationService.queueBulkNotifications(notifications);

      expect(mockNotificationModel.bulkCreate).toHaveBeenCalledWith(
        expect.arrayContaining(notifications.map(n => 
          expect.objectContaining({ status: 'queued' })
        ))
      );
      expect(result.queuedCount).toBe(100);
    });

    it('应该缓存用户偏好', async () => {
      const userId = 1;

      const mockPreferences = {
        userId: 1,
        emailEnabled: true,
        pushEnabled: true
      };

      // 第一次调用
      mockNotificationPreferenceModel.findOne.mockResolvedValue(mockPreferences);
      mockRedisClient.set.mockResolvedValue('OK');

      await notificationService.getUserPreferences(userId);

      // 第二次调用应该从缓存获取
      mockRedisClient.get.mockResolvedValue(JSON.stringify(mockPreferences));

      const cachedResult = await notificationService.getUserPreferences(userId);

      expect(mockRedisClient.get).toHaveBeenCalledWith(`user_preferences:${userId}`);
      expect(cachedResult).toEqual(mockPreferences);
    });
  });
});
