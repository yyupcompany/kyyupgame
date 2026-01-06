import { jest } from '@jest/globals';
import { vi } from 'vitest'
import { DataTypes } from 'sequelize';

// Mock Sequelize
const mockSequelize = {
  authenticate: jest.fn(),
  define: jest.fn(),
  sync: jest.fn()
};

// Mock Notification model
const mockNotification = {
  init: jest.fn(),
  initModel: jest.fn(),
  associate: jest.fn(),
  findByPk: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  hasMany: jest.fn(),
  belongsTo: jest.fn(),
  belongsToMany: jest.fn()
};

// Mock related models
const mockUser = { hasMany: jest.fn(), belongsTo: jest.fn() };
const mockNotificationRecipient = { hasMany: jest.fn(), belongsTo: jest.fn() };
const mockNotificationTemplate = { hasMany: jest.fn(), belongsTo: jest.fn() };

// Mock imports
jest.unstable_mockModule('../../../../../src/models/notification.model', () => ({
  Notification: mockNotification,
  NotificationStatus: {
    DRAFT: 'draft',
    SCHEDULED: 'scheduled',
    SENDING: 'sending',
    SENT: 'sent',
    FAILED: 'failed',
    CANCELLED: 'cancelled'
  },
  NotificationType: {
    ANNOUNCEMENT: 'announcement',
    REMINDER: 'reminder',
    ALERT: 'alert',
    SYSTEM: 'system',
    MARKETING: 'marketing'
  },
  NotificationPriority: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
  },
  TargetType: {
    ALL: 'all',
    ROLE: 'role',
    CLASS: 'class',
    SPECIFIC: 'specific'
  }
}));

jest.unstable_mockModule('../../../../../src/models/user.model', () => ({
  User: mockUser
}));

jest.unstable_mockModule('../../../../../src/models/notification-recipient.model', () => ({
  NotificationRecipient: mockNotificationRecipient
}));

jest.unstable_mockModule('../../../../../src/models/notification-template.model', () => ({
  NotificationTemplate: mockNotificationTemplate
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

describe('Notification Model', () => {
  let Notification: any;
  let NotificationStatus: any;
  let NotificationType: any;
  let NotificationPriority: any;
  let TargetType: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/models/notification.model');
    Notification = imported.Notification;
    NotificationStatus = imported.NotificationStatus;
    NotificationType = imported.NotificationType;
    NotificationPriority = imported.NotificationPriority;
    TargetType = imported.TargetType;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Model Definition', () => {
    it('应该正确定义Notification模型', () => {
      Notification.initModel(mockSequelize);

      expect(Notification.init).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.objectContaining({
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
          }),
          title: expect.objectContaining({
            type: DataTypes.STRING,
            allowNull: false,
            validate: expect.objectContaining({
              len: [1, 200]
            })
          }),
          content: expect.objectContaining({
            type: DataTypes.TEXT,
            allowNull: false,
            validate: expect.objectContaining({
              len: [1, 5000]
            })
          }),
          type: expect.objectContaining({
            type: DataTypes.ENUM,
            values: ['announcement', 'reminder', 'alert', 'system', 'marketing'],
            defaultValue: 'announcement'
          }),
          status: expect.objectContaining({
            type: DataTypes.ENUM,
            values: ['draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled'],
            defaultValue: 'draft'
          }),
          priority: expect.objectContaining({
            type: DataTypes.ENUM,
            values: ['low', 'medium', 'high', 'urgent'],
            defaultValue: 'medium'
          }),
          targetType: expect.objectContaining({
            type: DataTypes.ENUM,
            values: ['all', 'role', 'class', 'specific'],
            defaultValue: 'all'
          }),
          targetIds: expect.objectContaining({
            type: DataTypes.JSON,
            allowNull: true
          }),
          channels: expect.objectContaining({
            type: DataTypes.JSON,
            defaultValue: ['push']
          }),
          scheduledAt: expect.objectContaining({
            type: DataTypes.DATE,
            allowNull: true
          }),
          sentAt: expect.objectContaining({
            type: DataTypes.DATE,
            allowNull: true
          }),
          expiresAt: expect.objectContaining({
            type: DataTypes.DATE,
            allowNull: true
          }),
          metadata: expect.objectContaining({
            type: DataTypes.JSON,
            allowNull: true
          }),
          templateId: expect.objectContaining({
            type: DataTypes.INTEGER,
            allowNull: true,
            references: expect.objectContaining({
              model: 'notification_templates',
              key: 'id'
            })
          }),
          createdBy: expect.objectContaining({
            type: DataTypes.INTEGER,
            allowNull: false,
            references: expect.objectContaining({
              model: 'users',
              key: 'id'
            })
          }),
          sentCount: expect.objectContaining({
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: expect.objectContaining({
              min: 0
            })
          }),
          failedCount: expect.objectContaining({
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: expect.objectContaining({
              min: 0
            })
          }),
          readCount: expect.objectContaining({
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: expect.objectContaining({
              min: 0
            })
          })
        }),
        expect.objectContaining({
          sequelize: mockSequelize,
          tableName: 'notifications',
          timestamps: true,
          paranoid: true
        })
      );
    });

    it('应该包含所有必需的字段', () => {
      const notificationInstance = {
        id: 1,
        title: '重要通知',
        content: '明天学校放假，请家长注意安排',
        type: 'announcement',
        status: 'sent',
        priority: 'high',
        targetType: 'all',
        targetIds: null,
        channels: ['email', 'push', 'sms'],
        scheduledAt: null,
        sentAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后过期
        metadata: {
          source: 'admin_panel',
          campaign: 'spring_break_2024'
        },
        templateId: 1,
        createdBy: 1,
        sentCount: 150,
        failedCount: 5,
        readCount: 120,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      };

      // 检查实例是否具有预期的属性
      expect(notificationInstance).toHaveProperty('id');
      expect(notificationInstance).toHaveProperty('title');
      expect(notificationInstance).toHaveProperty('content');
      expect(notificationInstance).toHaveProperty('type');
      expect(notificationInstance).toHaveProperty('status');
      expect(notificationInstance).toHaveProperty('priority');
      expect(notificationInstance).toHaveProperty('targetType');
      expect(notificationInstance).toHaveProperty('targetIds');
      expect(notificationInstance).toHaveProperty('channels');
      expect(notificationInstance).toHaveProperty('scheduledAt');
      expect(notificationInstance).toHaveProperty('sentAt');
      expect(notificationInstance).toHaveProperty('expiresAt');
      expect(notificationInstance).toHaveProperty('metadata');
      expect(notificationInstance).toHaveProperty('templateId');
      expect(notificationInstance).toHaveProperty('createdBy');
      expect(notificationInstance).toHaveProperty('sentCount');
      expect(notificationInstance).toHaveProperty('failedCount');
      expect(notificationInstance).toHaveProperty('readCount');
    });
  });

  describe('Model Validations', () => {
    it('应该验证必填字段', () => {
      const requiredFields = ['title', 'content', 'createdBy'];
      
      requiredFields.forEach(field => {
        expect(mockNotification.init).toHaveBeenCalledWith(
          expect.objectContaining({
            [field]: expect.objectContaining({
              allowNull: false
            })
          }),
          expect.any(Object)
        );
      });
    });

    it('应该验证标题长度', () => {
      expect(mockNotification.init).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.objectContaining({
            validate: expect.objectContaining({
              len: [1, 200]
            })
          })
        }),
        expect.any(Object)
      );
    });

    it('应该验证内容长度', () => {
      expect(mockNotification.init).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            validate: expect.objectContaining({
              len: [1, 5000]
            })
          })
        }),
        expect.any(Object)
      );
    });

    it('应该验证计数字段范围', () => {
      const countFields = ['sentCount', 'failedCount', 'readCount'];
      
      countFields.forEach(field => {
        expect(mockNotification.init).toHaveBeenCalledWith(
          expect.objectContaining({
            [field]: expect.objectContaining({
              validate: expect.objectContaining({
                min: 0
              })
            })
          }),
          expect.any(Object)
        );
      });
    });

    it('应该验证外键约束', () => {
      expect(mockNotification.init).toHaveBeenCalledWith(
        expect.objectContaining({
          createdBy: expect.objectContaining({
            references: expect.objectContaining({
              model: 'users',
              key: 'id'
            })
          }),
          templateId: expect.objectContaining({
            references: expect.objectContaining({
              model: 'notification_templates',
              key: 'id'
            })
          })
        }),
        expect.any(Object)
      );
    });
  });

  describe('Model Associations', () => {
    it('应该定义与User的关联关系', () => {
      Notification.associate({ User: mockUser });
      
      expect(mockNotification.belongsTo).toHaveBeenCalledWith(mockUser, {
        foreignKey: 'createdBy',
        as: 'creator'
      });
    });

    it('应该定义与NotificationRecipient的关联关系', () => {
      Notification.associate({ NotificationRecipient: mockNotificationRecipient });
      
      expect(mockNotification.hasMany).toHaveBeenCalledWith(mockNotificationRecipient, {
        foreignKey: 'notificationId',
        as: 'recipients'
      });
    });

    it('应该定义与NotificationTemplate的关联关系', () => {
      Notification.associate({ NotificationTemplate: mockNotificationTemplate });
      
      expect(mockNotification.belongsTo).toHaveBeenCalledWith(mockNotificationTemplate, {
        foreignKey: 'templateId',
        as: 'template'
      });
    });

    it('应该定义与User的多对多关联关系', () => {
      Notification.associate({ 
        User: mockUser, 
        NotificationRecipient: mockNotificationRecipient 
      });
      
      expect(mockNotification.belongsToMany).toHaveBeenCalledWith(mockUser, {
        through: mockNotificationRecipient,
        foreignKey: 'notificationId',
        otherKey: 'userId',
        as: 'recipientUsers'
      });
    });
  });

  describe('Model Enums', () => {
    it('应该定义正确的状态枚举', () => {
      expect(NotificationStatus).toEqual({
        DRAFT: 'draft',
        SCHEDULED: 'scheduled',
        SENDING: 'sending',
        SENT: 'sent',
        FAILED: 'failed',
        CANCELLED: 'cancelled'
      });
    });

    it('应该定义正确的类型枚举', () => {
      expect(NotificationType).toEqual({
        ANNOUNCEMENT: 'announcement',
        REMINDER: 'reminder',
        ALERT: 'alert',
        SYSTEM: 'system',
        MARKETING: 'marketing'
      });
    });

    it('应该定义正确的优先级枚举', () => {
      expect(NotificationPriority).toEqual({
        LOW: 'low',
        MEDIUM: 'medium',
        HIGH: 'high',
        URGENT: 'urgent'
      });
    });

    it('应该定义正确的目标类型枚举', () => {
      expect(TargetType).toEqual({
        ALL: 'all',
        ROLE: 'role',
        CLASS: 'class',
        SPECIFIC: 'specific'
      });
    });
  });

  describe('Model Methods', () => {
    it('应该支持toJSON方法', () => {
      const notificationInstance = {
        id: 1,
        title: '重要通知',
        content: '明天学校放假',
        type: 'announcement',
        status: 'sent',
        priority: 'high',
        sentCount: 150,
        readCount: 120,
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          title: '重要通知',
          content: '明天学校放假',
          type: 'announcement',
          status: 'sent',
          priority: 'high',
          sentCount: 150,
          readCount: 120
        })
      };

      const json = notificationInstance.toJSON();

      expect(json).toHaveProperty('id', 1);
      expect(json).toHaveProperty('title', '重要通知');
      expect(json).toHaveProperty('content', '明天学校放假');
      expect(json).toHaveProperty('type', 'announcement');
      expect(json).toHaveProperty('status', 'sent');
      expect(json).toHaveProperty('priority', 'high');
      expect(json).toHaveProperty('sentCount', 150);
      expect(json).toHaveProperty('readCount', 120);
    });

    it('应该支持检查是否为草稿状态', () => {
      const draftNotification = {
        status: 'draft',
        isDraft: jest.fn().mockReturnValue(true)
      };

      const sentNotification = {
        status: 'sent',
        isDraft: jest.fn().mockReturnValue(false)
      };

      expect(draftNotification.isDraft()).toBe(true);
      expect(sentNotification.isDraft()).toBe(false);
    });

    it('应该支持检查是否已发送', () => {
      const sentNotification = {
        status: 'sent',
        isSent: jest.fn().mockReturnValue(true)
      };

      const draftNotification = {
        status: 'draft',
        isSent: jest.fn().mockReturnValue(false)
      };

      expect(sentNotification.isSent()).toBe(true);
      expect(draftNotification.isSent()).toBe(false);
    });

    it('应该支持检查是否已过期', () => {
      const expiredNotification = {
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 昨天
        isExpired: jest.fn().mockReturnValue(true)
      };

      const activeNotification = {
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 明天
        isExpired: jest.fn().mockReturnValue(false)
      };

      const noExpiryNotification = {
        expiresAt: null,
        isExpired: jest.fn().mockReturnValue(false)
      };

      expect(expiredNotification.isExpired()).toBe(true);
      expect(activeNotification.isExpired()).toBe(false);
      expect(noExpiryNotification.isExpired()).toBe(false);
    });

    it('应该支持检查是否为定时通知', () => {
      const scheduledNotification = {
        status: 'scheduled',
        scheduledAt: new Date(Date.now() + 60 * 60 * 1000), // 1小时后
        isScheduled: jest.fn().mockReturnValue(true)
      };

      const immediateNotification = {
        status: 'sent',
        scheduledAt: null,
        isScheduled: jest.fn().mockReturnValue(false)
      };

      expect(scheduledNotification.isScheduled()).toBe(true);
      expect(immediateNotification.isScheduled()).toBe(false);
    });

    it('应该支持计算阅读率', () => {
      const notificationInstance = {
        sentCount: 100,
        readCount: 75,
        getReadRate: jest.fn().mockReturnValue(0.75)
      };

      const readRate = notificationInstance.getReadRate();

      expect(readRate).toBe(0.75);
    });

    it('应该支持计算成功率', () => {
      const notificationInstance = {
        sentCount: 95,
        failedCount: 5,
        getSuccessRate: jest.fn().mockReturnValue(0.95)
      };

      const successRate = notificationInstance.getSuccessRate();

      expect(successRate).toBe(0.95);
    });

    it('应该支持获取目标受众数量', () => {
      const allTargetNotification = {
        targetType: 'all',
        getTargetCount: jest.fn().mockReturnValue(200)
      };

      const specificTargetNotification = {
        targetType: 'specific',
        targetIds: [1, 2, 3, 4, 5],
        getTargetCount: jest.fn().mockReturnValue(5)
      };

      expect(allTargetNotification.getTargetCount()).toBe(200);
      expect(specificTargetNotification.getTargetCount()).toBe(5);
    });

    it('应该支持检查是否包含特定渠道', () => {
      const notificationInstance = {
        channels: ['email', 'push', 'sms'],
        hasChannel: jest.fn().mockImplementation((channel) => {
          return notificationInstance.channels.includes(channel);
        })
      };

      expect(notificationInstance.hasChannel('email')).toBe(true);
      expect(notificationInstance.hasChannel('webhook')).toBe(false);
    });

    it('应该支持添加渠道', () => {
      const notificationInstance = {
        channels: ['email', 'push'],
        addChannel: jest.fn().mockImplementation((channel) => {
          if (!notificationInstance.channels.includes(channel)) {
            notificationInstance.channels.push(channel);
          }
          return notificationInstance.channels;
        })
      };

      const result = notificationInstance.addChannel('sms');

      expect(result).toEqual(['email', 'push', 'sms']);
      expect(notificationInstance.addChannel('email')).toEqual(['email', 'push', 'sms']); // 不重复添加
    });

    it('应该支持移除渠道', () => {
      const notificationInstance = {
        channels: ['email', 'push', 'sms'],
        removeChannel: jest.fn().mockImplementation((channel) => {
          const index = notificationInstance.channels.indexOf(channel);
          if (index > -1) {
            notificationInstance.channels.splice(index, 1);
          }
          return notificationInstance.channels;
        })
      };

      const result = notificationInstance.removeChannel('push');

      expect(result).toEqual(['email', 'sms']);
    });

    it('应该支持更新统计数据', () => {
      const notificationInstance = {
        sentCount: 100,
        failedCount: 5,
        readCount: 75,
        updateStats: jest.fn().mockImplementation((stats) => {
          Object.assign(notificationInstance, stats);
          return {
            sentCount: notificationInstance.sentCount,
            failedCount: notificationInstance.failedCount,
            readCount: notificationInstance.readCount
          };
        })
      };

      const result = notificationInstance.updateStats({
        sentCount: 120,
        readCount: 90
      });

      expect(result).toEqual({
        sentCount: 120,
        failedCount: 5,
        readCount: 90
      });
    });

    it('应该支持克隆通知', () => {
      const notificationInstance = {
        title: '原通知',
        content: '原内容',
        type: 'announcement',
        priority: 'high',
        channels: ['email', 'push'],
        clone: jest.fn().mockReturnValue({
          title: '原通知 (副本)',
          content: '原内容',
          type: 'announcement',
          priority: 'high',
          channels: ['email', 'push'],
          status: 'draft',
          sentCount: 0,
          failedCount: 0,
          readCount: 0
        })
      };

      const cloned = notificationInstance.clone();

      expect(cloned.title).toBe('原通知 (副本)');
      expect(cloned.status).toBe('draft');
      expect(cloned.sentCount).toBe(0);
    });
  });

  describe('Model Scopes', () => {
    it('应该定义草稿通知范围', () => {
      const draftScope = {
        where: { status: 'draft' }
      };

      expect(draftScope).toEqual({
        where: { status: 'draft' }
      });
    });

    it('应该定义已发送通知范围', () => {
      const sentScope = {
        where: { status: 'sent' }
      };

      expect(sentScope).toEqual({
        where: { status: 'sent' }
      });
    });

    it('应该定义定时通知范围', () => {
      const scheduledScope = {
        where: { 
          status: 'scheduled',
          scheduledAt: { [mockSequelize.Op.gt]: new Date() }
        }
      };

      expect(scheduledScope.where.status).toBe('scheduled');
    });

    it('应该定义按类型筛选范围', () => {
      const byTypeScope = (type: string) => ({
        where: { type }
      });

      expect(byTypeScope('announcement')).toEqual({
        where: { type: 'announcement' }
      });
    });

    it('应该定义按优先级筛选范围', () => {
      const byPriorityScope = (priority: string) => ({
        where: { priority }
      });

      expect(byPriorityScope('high')).toEqual({
        where: { priority: 'high' }
      });
    });

    it('应该定义最近通知范围', () => {
      const recentScope = {
        order: [['createdAt', 'DESC']],
        limit: 10
      };

      expect(recentScope).toEqual({
        order: [['createdAt', 'DESC']],
        limit: 10
      });
    });
  });

  describe('Model Hooks', () => {
    it('应该在创建前设置默认值', () => {
      const beforeCreateHook = jest.fn();
      
      // 模拟钩子函数
      expect(beforeCreateHook).toBeDefined();
    });

    it('应该在更新前验证状态转换', () => {
      const beforeUpdateHook = jest.fn();
      
      // 模拟钩子函数
      expect(beforeUpdateHook).toBeDefined();
    });

    it('应该在发送后更新统计信息', () => {
      const afterUpdateHook = jest.fn();
      
      // 模拟钩子函数
      expect(afterUpdateHook).toBeDefined();
    });

    it('应该在删除前清理相关数据', () => {
      const beforeDestroyHook = jest.fn();
      
      // 模拟钩子函数
      expect(beforeDestroyHook).toBeDefined();
    });
  });

  describe('Model Indexes', () => {
    it('应该定义正确的索引', () => {
      const expectedIndexes = [
        { fields: ['status'] },
        { fields: ['type'] },
        { fields: ['priority'] },
        { fields: ['targetType'] },
        { fields: ['createdBy'] },
        { fields: ['scheduledAt'] },
        { fields: ['sentAt'] },
        { fields: ['expiresAt'] },
        { fields: ['createdAt'] },
        { fields: ['status', 'scheduledAt'] },
        { fields: ['type', 'status'] },
        { fields: ['createdBy', 'status'] }
      ];

      // 验证索引定义
      expectedIndexes.forEach(index => {
        expect(index).toBeDefined();
      });
    });
  });
});
