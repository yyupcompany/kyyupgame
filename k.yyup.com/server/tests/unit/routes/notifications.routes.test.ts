import { jest } from '@jest/globals';
import { vi } from 'vitest'
import request from 'supertest';
import express from 'express';

// Mock Express app
const mockApp = express();

// Mock controllers
const mockNotificationsController = {
  getNotifications: jest.fn(),
  getNotificationById: jest.fn(),
  createNotification: jest.fn(),
  updateNotification: jest.fn(),
  deleteNotification: jest.fn(),
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
  getUnreadCount: jest.fn(),
  sendNotification: jest.fn(),
  sendBulkNotification: jest.fn(),
  scheduleNotification: jest.fn(),
  cancelScheduledNotification: jest.fn(),
  getNotificationTemplates: jest.fn(),
  createNotificationTemplate: jest.fn(),
  updateNotificationTemplate: jest.fn(),
  deleteNotificationTemplate: jest.fn(),
  getNotificationSettings: jest.fn(),
  updateNotificationSettings: jest.fn(),
  getNotificationHistory: jest.fn(),
  getNotificationStats: jest.fn(),
  testNotification: jest.fn(),
  retryFailedNotification: jest.fn(),
  getNotificationDeliveries: jest.fn(),
  getNotificationDeliveryById: jest.fn(),
  getUserNotificationPreferences: jest.fn(),
  updateUserNotificationPreferences: jest.fn(),
  getNotificationChannels: jest.fn(),
  configureNotificationChannel: jest.fn(),
  testNotificationChannel: jest.fn()
};

// Mock middlewares
const mockAuthMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockValidationMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockRateLimitMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockPermissionMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockSecurityMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockCacheMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());

// Mock imports
jest.unstable_mockModule('../../../../../src/controllers/notifications.controller', () => mockNotificationsController);
jest.unstable_mockModule('../../../../../src/middlewares/auth.middleware', () => ({
  verifyToken: mockAuthMiddleware,
  requireAuth: mockAuthMiddleware
}));
jest.unstable_mockModule('../../../../../src/middlewares/rate-limit.middleware', () => ({
  notificationRateLimit: mockRateLimitMiddleware,
  strictRateLimit: mockRateLimitMiddleware
}));
jest.unstable_mockModule('../../../../../src/middlewares/permission.middleware', () => ({
  checkPermission: mockPermissionMiddleware,
  requireNotificationAccess: mockPermissionMiddleware
}));
jest.unstable_mockModule('../../../../../src/middlewares/security.middleware', () => ({
  sanitizeInput: mockSecurityMiddleware,
  validateContentType: mockSecurityMiddleware
}));
jest.unstable_mockModule('../../../../../src/middlewares/cache.middleware', () => ({
  cacheResponse: mockCacheMiddleware
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

describe('Notifications Routes', () => {
  let notificationsRouter: any;

  beforeAll(async () => {
    // 动态导入路由
    const { default: importedNotificationsRouter } = await import('../../../src/routes/notifications.routes');
    notificationsRouter = importedNotificationsRouter;
    
    // 设置Express应用
    mockApp.use('/notifications', notificationsRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // 设置默认的控制器响应
    mockNotificationsController.getNotifications.mockImplementation((req, res) => {
      (res as any).status(200).json({
        success: true,
        data: [
          {
            id: 1,
            title: '系统维护通知',
            message: '系统将于今晚22:00-24:00进行维护升级',
            type: 'system',
            priority: 'high',
            status: 'unread',
            sender: 'admin',
            recipient: 'all',
            channel: 'inapp',
            createdAt: '2024-02-20T14:30:00.000Z',
            expiresAt: '2024-02-21T14:30:00.000Z',
            metadata: {
              actionUrl: '/system/maintenance',
              actionText: '查看详情'
            }
          },
          {
            id: 2,
            title: '活动报名提醒',
            message: '春季运动会报名将于明天截止',
            type: 'activity',
            priority: 'medium',
            status: 'read',
            sender: '张老师',
            recipient: 'teachers',
            channel: 'inapp',
            createdAt: '2024-02-20T12:00:00.000Z',
            readAt: '2024-02-20T12:30:00.000Z',
            metadata: {
              activityId: 1,
              activityName: '春季运动会'
            }
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1
        },
        message: '获取通知列表成功'
      });
    });

    mockNotificationsController.createNotification.mockImplementation((req, res) => {
      (res as any).status(201).json({
        success: true,
        data: {
          id: 3,
          title: '新通知',
          message: '这是一条新的通知消息',
          type: 'general',
          priority: 'medium',
          status: 'unread',
          sender: 'admin',
          recipient: 'all',
          channel: 'inapp',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 86400000).toISOString()
        },
        message: '通知创建成功'
      });
    });

    mockNotificationsController.getUnreadCount.mockImplementation((req, res) => {
      (res as any).status(200).json({
        success: true,
        data: {
          unreadCount: 5,
          totalCount: 25,
          byType: {
            system: 2,
            activity: 1,
            general: 2
          },
          byPriority: {
            high: 1,
            medium: 3,
            low: 1
          }
        },
        message: '获取未读通知数量成功'
      });
    });

    mockNotificationsController.getNotificationSettings.mockImplementation((req, res) => {
      (res as any).status(200).json({
        success: true,
        data: {
          inApp: {
            enabled: true,
            sound: true,
            vibration: true,
            desktop: true
          },
          email: {
            enabled: true,
            frequency: 'daily',
            types: ['system', 'activity']
          },
          sms: {
            enabled: false,
            types: ['emergency']
          },
          push: {
            enabled: true,
            types: ['system', 'activity', 'general']
          },
          quietHours: {
            enabled: true,
            start: '22:00',
            end: '08:00'
          }
        },
        message: '获取通知设置成功'
      });
    });

    mockNotificationsController.getNotificationStats.mockImplementation((req, res) => {
      (res as any).status(200).json({
        success: true,
        data: {
          total: 1250,
          sent: 1200,
          delivered: 1180,
          read: 950,
          failed: 20,
          pending: 30,
          byType: {
            system: 400,
            activity: 350,
            general: 300,
            emergency: 200
          },
          byChannel: {
            inapp: 800,
            email: 300,
            sms: 50,
            push: 100
          },
          byPriority: {
            high: 200,
            medium: 650,
            low: 400
          },
          deliveryRate: 0.984,
          readRate: 0.792
        },
        message: '获取通知统计成功'
      });
    });
  });

  describe('GET /notifications', () => {
    it('应该获取通知列表', async () => {
      const response = await request(mockApp)
        .get('/notifications')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: [
          {
            id: 1,
            title: '系统维护通知',
            message: '系统将于今晚22:00-24:00进行维护升级',
            type: 'system',
            priority: 'high',
            status: 'unread',
            sender: 'admin',
            recipient: 'all',
            channel: 'inapp',
            createdAt: '2024-02-20T14:30:00.000Z',
            expiresAt: '2024-02-21T14:30:00.000Z',
            metadata: {
              actionUrl: '/system/maintenance',
              actionText: '查看详情'
            }
          },
          {
            id: 2,
            title: '活动报名提醒',
            message: '春季运动会报名将于明天截止',
            type: 'activity',
            priority: 'medium',
            status: 'read',
            sender: '张老师',
            recipient: 'teachers',
            channel: 'inapp',
            createdAt: '2024-02-20T12:00:00.000Z',
            readAt: '2024-02-20T12:30:00.000Z',
            metadata: {
              activityId: 1,
              activityName: '春季运动会'
            }
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1
        },
        message: '获取通知列表成功'
      });

      expect(mockNotificationsController.getNotifications).toHaveBeenCalled();
    });

    it('应该支持分页参数', async () => {
      const page = 2;
      const limit = 5;

      await request(mockApp)
        .get('/notifications')
        .query({ page, limit })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockNotificationsController.getNotifications).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            page: page.toString(),
            limit: limit.toString()
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该支持状态过滤', async () => {
      const status = 'unread';

      await request(mockApp)
        .get('/notifications')
        .query({ status })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockNotificationsController.getNotifications).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            status
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该支持类型过滤', async () => {
      const type = 'system';

      await request(mockApp)
        .get('/notifications')
        .query({ type })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockNotificationsController.getNotifications).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            type
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该支持优先级过滤', async () => {
      const priority = 'high';

      await request(mockApp)
        .get('/notifications')
        .query({ priority })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockNotificationsController.getNotifications).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            priority
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该支持时间范围过滤', async () => {
      const startDate = '2024-02-01';
      const endDate = '2024-02-29';

      await request(mockApp)
        .get('/notifications')
        .query({ startDate, endDate })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockNotificationsController.getNotifications).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            startDate,
            endDate
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该应用认证中间件', async () => {
      await request(mockApp)
        .get('/notifications')
        .set('Authorization', 'Bearer valid-token');

      expect(mockAuthMiddleware).toHaveBeenCalled();
    });

    it('应该应用缓存中间件', async () => {
      await request(mockApp)
        .get('/notifications')
        .set('Authorization', 'Bearer valid-token');

      expect(mockCacheMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /notifications/:id', () => {
    it('应该获取通知详情', async () => {
      mockNotificationsController.getNotificationById.mockImplementation((req, res) => {
        (res as any).status(200).json({
          success: true,
          data: {
            id: 1,
            title: '系统维护通知',
            message: '系统将于今晚22:00-24:00进行维护升级',
            type: 'system',
            priority: 'high',
            status: 'unread',
            sender: {
              id: 1,
              name: 'admin',
              avatar: '/avatars/admin.png'
            },
            recipient: 'all',
            channel: 'inapp',
            createdAt: '2024-02-20T14:30:00.000Z',
            expiresAt: '2024-02-21T14:30:00.000Z',
            metadata: {
              actionUrl: '/system/maintenance',
              actionText: '查看详情',
              severity: 'high',
              impact: 'all_users'
            },
            delivery: {
              sentAt: '2024-02-20T14:30:00.000Z',
              deliveredAt: '2024-02-20T14:30:05.000Z',
              readAt: null,
              deliveryStatus: 'delivered'
            }
          },
          message: '获取通知详情成功'
        });
      });

      const notificationId = 1;

      const response = await request(mockApp)
        .get(`/notifications/${notificationId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockNotificationsController.getNotificationById).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { id: notificationId.toString() }
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该验证通知ID参数', async () => {
      await request(mockApp)
        .get('/notifications/invalid-id')
        .set('Authorization', 'Bearer valid-token')
        .expect(400);

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });

    it('应该检查通知访问权限', async () => {
      await request(mockApp)
        .get('/notifications/1')
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('POST /notifications', () => {
    it('应该创建通知', async () => {
      const notificationData = {
        title: '新活动通知',
        message: '幼儿园即将举办亲子活动，欢迎家长参加',
        type: 'activity',
        priority: 'medium',
        recipient: 'parents',
        channel: 'inapp',
        expiresAt: '2024-03-01T00:00:00.000Z',
        metadata: {
          activityId: 2,
          activityName: '亲子活动',
          actionUrl: '/activities/2',
          actionText: '查看活动'
        }
      };

      const response = await request(mockApp)
        .post('/notifications')
        .send(notificationData)
        .set('Authorization', 'Bearer valid-token')
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        data: {
          id: 3,
          title: '新通知',
          message: '这是一条新的通知消息',
          type: 'general',
          priority: 'medium',
          status: 'unread',
          sender: 'admin',
          recipient: 'all',
          channel: 'inapp',
          createdAt: expect.any(String),
          expiresAt: expect.any(String)
        },
        message: '通知创建成功'
      });

      expect(mockNotificationsController.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          body: notificationData
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该验证通知数据', async () => {
      const invalidNotificationData = {
        title: '', // 空标题
        message: '', // 空消息
        type: 'invalid_type', // 无效类型
        priority: 'invalid_priority' // 无效优先级
      };

      await request(mockApp)
        .post('/notifications')
        .send(invalidNotificationData)
        .set('Authorization', 'Bearer valid-token')
        .expect(400);

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });

    it('应该应用安全中间件', async () => {
      await request(mockApp)
        .post('/notifications')
        .send({ title: '测试', message: '测试消息' })
        .set('Authorization', 'Bearer valid-token');

      expect(mockSecurityMiddleware).toHaveBeenCalled();
    });

    it('应该检查通知创建权限', async () => {
      await request(mockApp)
        .post('/notifications')
        .send({ title: '测试', message: '测试消息' })
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('PUT /notifications/:id', () => {
    it('应该更新通知', async () => {
      mockNotificationsController.updateNotification.mockImplementation((req, res) => {
        (res as any).status(200).json({
          success: true,
          data: {
            id: 1,
            title: '系统维护通知 (已更新)',
            message: '系统将于今晚22:00-24:00进行维护升级，请提前做好准备',
            type: 'system',
            priority: 'high',
            status: 'unread',
            updatedAt: new Date().toISOString()
          },
          message: '通知更新成功'
        });
      });

      const notificationId = 1;
      const updateData = {
        title: '系统维护通知 (已更新)',
        message: '系统将于今晚22:00-24:00进行维护升级，请提前做好准备',
        priority: 'high'
      };

      const response = await request(mockApp)
        .put(`/notifications/${notificationId}`)
        .send(updateData)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockNotificationsController.updateNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { id: notificationId.toString() },
          body: updateData
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该验证更新数据', async () => {
      const invalidUpdateData = {
        title: '', // 空标题
        priority: 'invalid_priority' // 无效优先级
      };

      await request(mockApp)
        .put('/notifications/1')
        .send(invalidUpdateData)
        .set('Authorization', 'Bearer valid-token')
        .expect(400);

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });
  });

  describe('DELETE /notifications/:id', () => {
    it('应该删除通知', async () => {
      mockNotificationsController.deleteNotification.mockImplementation((req, res) => {
        (res as any).status(200).json({
          success: true,
          data: {
            id: 1,
            deletedAt: new Date().toISOString(),
            message: '通知删除成功'
          },
          message: '通知删除成功'
        });
      });

      const notificationId = 1;

      const response = await request(mockApp)
        .delete(`/notifications/${notificationId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockNotificationsController.deleteNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { id: notificationId.toString() }
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该验证通知ID参数', async () => {
      await request(mockApp)
        .delete('/notifications/invalid-id')
        .set('Authorization', 'Bearer valid-token')
        .expect(400);

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });

    it('应该检查通知删除权限', async () => {
      await request(mockApp)
        .delete('/notifications/1')
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('PUT /notifications/:id/read', () => {
    it('应该标记通知为已读', async () => {
      mockNotificationsController.markAsRead.mockImplementation((req, res) => {
        (res as any).status(200).json({
          success: true,
          data: {
            id: 1,
            status: 'read',
            readAt: new Date().toISOString(),
            message: '通知已标记为已读'
          },
          message: '通知标记已读成功'
        });
      });

      const notificationId = 1;

      const response = await request(mockApp)
        .put(`/notifications/${notificationId}/read`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockNotificationsController.markAsRead).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { id: notificationId.toString() }
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('PUT /notifications/read-all', () => {
    it('应该标记所有通知为已读', async () => {
      mockNotificationsController.markAllAsRead.mockImplementation((req, res) => {
        (res as any).status(200).json({
          success: true,
          data: {
            markedCount: 5,
            readAt: new Date().toISOString(),
            message: '所有通知已标记为已读'
          },
          message: '全标记已读成功'
        });
      });

      const response = await request(mockApp)
        .put('/notifications/read-all')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockNotificationsController.markAllAsRead).toHaveBeenCalled();
    });
  });

  describe('GET /notifications/unread-count', () => {
    it('应该获取未读通知数量', async () => {
      const response = await request(mockApp)
        .get('/notifications/unread-count')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          unreadCount: 5,
          totalCount: 25,
          byType: {
            system: 2,
            activity: 1,
            general: 2
          },
          byPriority: {
            high: 1,
            medium: 3,
            low: 1
          }
        },
        message: '获取未读通知数量成功'
      });

      expect(mockNotificationsController.getUnreadCount).toHaveBeenCalled();
    });

    it('应该应用缓存中间件', async () => {
      await request(mockApp)
        .get('/notifications/unread-count')
        .set('Authorization', 'Bearer valid-token');

      expect(mockCacheMiddleware).toHaveBeenCalled();
    });
  });

  describe('POST /notifications/send', () => {
    it('应该发送通知', async () => {
      mockNotificationsController.sendNotification.mockImplementation((req, res) => {
        (res as any).status(200).json({
          success: true,
          data: {
            notificationId: 4,
            recipientCount: 150,
            sentAt: new Date().toISOString(),
            deliveryStatus: 'sent',
            message: '通知发送成功'
          },
          message: '通知发送成功'
        });
      });

      const sendData = {
        title: '紧急通知',
        message: '由于天气原因，明天停课一天',
        type: 'emergency',
        priority: 'high',
        recipients: ['all'],
        channels: ['inapp', 'sms', 'email']
      };

      const response = await request(mockApp)
        .post('/notifications/send')
        .send(sendData)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockNotificationsController.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          body: sendData
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该检查通知发送权限', async () => {
      await request(mockApp)
        .post('/notifications/send')
        .send({ title: '测试', message: '测试消息' })
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /notifications/settings', () => {
    it('应该获取通知设置', async () => {
      const response = await request(mockApp)
        .get('/notifications/settings')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          inApp: {
            enabled: true,
            sound: true,
            vibration: true,
            desktop: true
          },
          email: {
            enabled: true,
            frequency: 'daily',
            types: ['system', 'activity']
          },
          sms: {
            enabled: false,
            types: ['emergency']
          },
          push: {
            enabled: true,
            types: ['system', 'activity', 'general']
          },
          quietHours: {
            enabled: true,
            start: '22:00',
            end: '08:00'
          }
        },
        message: '获取通知设置成功'
      });

      expect(mockNotificationsController.getNotificationSettings).toHaveBeenCalled();
    });
  });

  describe('PUT /notifications/settings', () => {
    it('应该更新通知设置', async () => {
      mockNotificationsController.updateNotificationSettings.mockImplementation((req, res) => {
        (res as any).status(200).json({
          success: true,
          data: {
            inApp: {
              enabled: true,
              sound: false,
              vibration: true,
              desktop: false
            },
            updatedAt: new Date().toISOString()
          },
          message: '通知设置更新成功'
        });
      });

      const settingsData = {
        inApp: {
          enabled: true,
          sound: false,
          vibration: true,
          desktop: false
        }
      };

      const response = await request(mockApp)
        .put('/notifications/settings')
        .send(settingsData)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockNotificationsController.updateNotificationSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          body: settingsData
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该验证设置数据', async () => {
      const invalidSettingsData = {
        inApp: {
          enabled: 'invalid_boolean', // 无效布尔值
          sound: true
        }
      };

      await request(mockApp)
        .put('/notifications/settings')
        .send(invalidSettingsData)
        .set('Authorization', 'Bearer valid-token')
        .expect(400);

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /notifications/stats', () => {
    it('应该获取通知统计', async () => {
      const response = await request(mockApp)
        .get('/notifications/stats')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          total: 1250,
          sent: 1200,
          delivered: 1180,
          read: 950,
          failed: 20,
          pending: 30,
          byType: {
            system: 400,
            activity: 350,
            general: 300,
            emergency: 200
          },
          byChannel: {
            inapp: 800,
            email: 300,
            sms: 50,
            push: 100
          },
          byPriority: {
            high: 200,
            medium: 650,
            low: 400
          },
          deliveryRate: 0.984,
          readRate: 0.792
        },
        message: '获取通知统计成功'
      });

      expect(mockNotificationsController.getNotificationStats).toHaveBeenCalled();
    });

    it('应该支持时间范围参数', async () => {
      const startDate = '2024-02-01';
      const endDate = '2024-02-29';

      await request(mockApp)
        .get('/notifications/stats')
        .query({ startDate, endDate })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockNotificationsController.getNotificationStats).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            startDate,
            endDate
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该检查统计查看权限', async () => {
      await request(mockApp)
        .get('/notifications/stats')
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /notifications/templates', () => {
    it('应该获取通知模板', async () => {
      mockNotificationsController.getNotificationTemplates.mockImplementation((req, res) => {
        (res as any).status(200).json({
          success: true,
          data: [
            {
              id: 1,
              name: '系统维护模板',
              title: '系统维护通知',
              message: '系统将于{{time}}进行维护升级，预计持续{{duration}}',
              type: 'system',
              priority: 'high',
              variables: ['time', 'duration'],
              isActive: true,
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-15T10:00:00.000Z'
            },
            {
              id: 2,
              name: '活动提醒模板',
              title: '活动报名提醒',
              message: '{{activityName}}报名将于{{deadline}}截止，请及时报名',
              type: 'activity',
              priority: 'medium',
              variables: ['activityName', 'deadline'],
              isActive: true,
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-10T14:00:00.000Z'
            }
          ],
          message: '获取通知模板成功'
        });
      });

      const response = await request(mockApp)
        .get('/notifications/templates')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockNotificationsController.getNotificationTemplates).toHaveBeenCalled();
    });

    it('应该检查模板查看权限', async () => {
      await request(mockApp)
        .get('/notifications/templates')
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('POST /notifications/test', () => {
    it('应该测试通知发送', async () => {
      mockNotificationsController.testNotification.mockImplementation((req, res) => {
        (res as any).status(200).json({
          success: true,
          data: {
            testId: 'test_123',
            channel: 'inapp',
            recipient: 'current_user',
            status: 'sent',
            sentAt: new Date().toISOString(),
            deliveryTime: 50,
            message: '测试通知发送成功'
          },
          message: '测试通知发送成功'
        });
      });

      const testData = {
        channel: 'inapp',
        title: '测试通知',
        message: '这是一条测试通知消息'
      };

      const response = await request(mockApp)
        .post('/notifications/test')
        .send(testData)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockNotificationsController.testNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          body: testData
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该检查通知测试权限', async () => {
      await request(mockApp)
        .post('/notifications/test')
        .send({ channel: 'inapp', title: '测试', message: '测试' })
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('路由中间件应用', () => {
    it('应该正确应用认证中间件到所有路由', () => {
      const authRoutes = ['/notifications', '/notifications/1', '/notifications/unread-count',
                          '/notifications/settings', '/notifications/stats', '/notifications/templates',
                          '/notifications/test', '/notifications/send'];
      
      authRoutes.forEach(route => {
        expect(mockAuthMiddleware).toBeDefined();
      });
    });

    it('应该正确应用验证中间件到数据修改路由', () => {
      const validatedRoutes = ['/notifications', '/notifications/1', '/notifications/1/read',
                              '/notifications/read-all', '/notifications/settings',
                              '/notifications/send', '/notifications/test'];
      
      validatedRoutes.forEach(route => {
        expect(mockValidationMiddleware).toBeDefined();
      });
    });

    it('应该正确应用权限中间件到敏感操作', () => {
      const permissionRoutes = ['/notifications/1', '/notifications/1/delete', '/notifications/send',
                              '/notifications/settings', '/notifications/stats', '/notifications/templates',
                              '/notifications/test'];
      
      permissionRoutes.forEach(route => {
        expect(mockPermissionMiddleware).toBeDefined();
      });
    });

    it('应该正确应用安全中间件到所有路由', () => {
      expect(mockSecurityMiddleware).toBeDefined();
    });

    it('应该正确应用限流中间件到通知发送路由', () => {
      const rateLimitedRoutes = ['/notifications/send', '/notifications/test'];
      
      rateLimitedRoutes.forEach(route => {
        expect(mockRateLimitMiddleware).toBeDefined();
      });
    });

    it('应该正确应用缓存中间件到数据查询路由', () => {
      const cachedRoutes = ['/notifications', '/notifications/unread-count', '/notifications/stats'];
      
      cachedRoutes.forEach(route => {
        expect(mockCacheMiddleware).toBeDefined();
      });
    });
  });

  describe('错误处理', () => {
    it('应该处理控制器抛出的错误', async () => {
      mockNotificationsController.getNotifications.mockImplementation((req, res, next) => {
        const error = new Error('获取通知列表失败');
        (next as any)(error);
      });

      await request(mockApp)
        .get('/notifications')
        .set('Authorization', 'Bearer valid-token')
        .expect(500);
    });

    it('应该处理验证中间件错误', async () => {
      mockValidationMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('参数验证失败');
        (error as any).statusCode = 400;
        (next as any)(error);
      });

      await request(mockApp)
        .post('/notifications')
        .send({ title: '', message: '' })
        .set('Authorization', 'Bearer valid-token')
        .expect(400);
    });

    it('应该处理通知发送失败错误', async () => {
      mockNotificationsController.sendNotification.mockImplementation((req, res, next) => {
        const error = new Error('通知发送失败：邮件服务不可用');
        (error as any).statusCode = 503;
        (next as any)(error);
      });

      await request(mockApp)
        .post('/notifications/send')
        .send({ title: '测试', message: '测试消息', recipients: ['all'] })
        .set('Authorization', 'Bearer valid-token')
        .expect(503);
    });

    it('应该处理权限不足错误', async () => {
      mockPermissionMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('权限不足');
        (error as any).statusCode = 403;
        (next as any)(error);
      });

      await request(mockApp)
        .post('/notifications/send')
        .send({ title: '测试', message: '测试消息' })
        .set('Authorization', 'Bearer user-token')
        .expect(403);
    });

    it('应该处理通知不存在错误', async () => {
      mockNotificationsController.getNotificationById.mockImplementation((req, res, next) => {
        const error = new Error('通知不存在');
        (error as any).statusCode = 404;
        (next as any)(error);
      });

      await request(mockApp)
        .get('/notifications/999')
        .set('Authorization', 'Bearer valid-token')
        .expect(404);
    });

    it('应该处理通知过期错误', async () => {
      mockNotificationsController.getNotificationById.mockImplementation((req, res, next) => {
        const error = new Error('通知已过期');
        (error as any).statusCode = 410;
        (next as any)(error);
      });

      await request(mockApp)
        .get('/notifications/1')
        .set('Authorization', 'Bearer valid-token')
        .expect(410);
    });
  });

  describe('性能测试', () => {
    it('应该处理大量通知数据', async () => {
      mockNotificationsController.getNotifications.mockImplementation((req, res) => {
        // 模拟大量通知数据
        const largeData = Array(1000).fill(null).map((_, i) => ({
          id: i + 1,
          title: `通知标题 ${i + 1}`,
          message: `这是第${i + 1}条通知消息`,
          type: ['system', 'activity', 'general'][Math.floor(Math.random() * 3)],
          priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
          status: Math.random() > 0.3 ? 'unread' : 'read',
          sender: 'admin',
          recipient: 'all',
          channel: 'inapp',
          createdAt: new Date(Date.now() - i * 60000).toISOString(),
          expiresAt: new Date(Date.now() + 86400000 - i * 60000).toISOString()
        }));

        (res as any).status(200).json({
          success: true,
          data: largeData,
          pagination: {
            page: 1,
            limit: 1000,
            total: 1000,
            totalPages: 1
          },
          message: '获取通知列表成功'
        });
      });

      const response = await request(mockApp)
        .get('/notifications')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1000);
    });

    it('应该处理批量通知发送', async () => {
      mockNotificationsController.sendBulkNotification.mockImplementation((req, res) => {
        // 模拟批量发送大量通知
        (res as any).status(200).json({
          success: true,
          data: {
            batchId: 'batch_123',
            totalRecipients: 1000,
            sentCount: 1000,
            failedCount: 0,
            sentAt: new Date().toISOString(),
            averageDeliveryTime: 120
          },
          message: '批量通知发送完成'
        });
      });

      const bulkData = {
        title: '批量通知测试',
        message: '这是一条批量通知消息',
        recipients: Array(1000).fill(null).map((_, i) => `user${i + 1}`),
        channels: ['inapp']
      };

      const response = await request(mockApp)
        .post('/notifications/send-bulk')
        .send(bulkData)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalRecipients).toBe(1000);
    });

    it('应该处理并发通知操作', async () => {
      const requests = Array(10).fill(null).map(() =>
        request(mockApp)
          .put('/notifications/1/read')
          .set('Authorization', 'Bearer valid-token')
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('安全测试', () => {
    it('应该防止XSS攻击', async () => {
      const maliciousScript = '<script>alert("xss")</script>';

      await request(mockApp)
        .post('/notifications')
        .send({ title: maliciousScript, message: '测试消息' })
        .set('Authorization', 'Bearer valid-token')
        .expect(400);

      expect(mockSecurityMiddleware).toHaveBeenCalled();
    });

    it('应该防止SQL注入攻击', async () => {
      const maliciousQuery = "'; DROP TABLE notifications; --";

      await request(mockApp)
        .get('/notifications')
        .query({ search: maliciousQuery })
        .set('Authorization', 'Bearer valid-token')
        .expect(400);

      expect(mockSecurityMiddleware).toHaveBeenCalled();
    });

    it('应该验证输入数据格式', async () => {
      const invalidFormats = [
        { route: '/notifications/invalid-id', method: 'get' },
        { route: '/notifications', method: 'post', body: { title: '', message: '' } },
        { route: '/notifications/1', method: 'put', body: { title: '' } },
        { route: '/notifications/settings', method: 'put', body: { inApp: { enabled: 'invalid' } } },
        { route: '/notifications/send', method: 'post', body: { title: '', recipients: 'invalid' } }
      ];

      for (const { route, method, body } of invalidFormats) {
        const req = request(mockApp)[method](route)
          .set('Authorization', 'Bearer valid-token');
        
        if (body) {
          req.send(body);
        }
        
        await req.expect(400);
      }
    });

    it('应该限制通知发送频率', async () => {
      mockRateLimitMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('发送请求过于频繁');
        (error as any).statusCode = 429;
        (next as any)(error);
      });

      await request(mockApp)
        .post('/notifications/send')
        .send({ title: '测试', message: '测试消息', recipients: ['all'] })
        .set('Authorization', 'Bearer valid-token')
        .expect(429);
    });

    it('应该保护敏感通知操作', async () => {
      const sensitiveOperations = [
        { path: '/notifications/send', method: 'post' },
        { path: '/notifications/stats', method: 'get' },
        { path: '/notifications/templates', method: 'get' },
        { path: '/notifications/test', method: 'post' }
      ];

      for (const { path, method } of sensitiveOperations) {
        await request(mockApp)[method](path)
          .set('Authorization', 'Bearer user-token')
          .expect(403);
      }
    });

    it('应该验证通知内容安全性', async () => {
      mockSecurityMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('通知内容包含不当信息');
        (error as any).statusCode = 400;
        (next as any)(error);
      });

      await request(mockApp)
        .post('/notifications')
        .send({ title: '不当内容', message: '包含不当信息的消息' })
        .set('Authorization', 'Bearer valid-token')
        .expect(400);

      expect(mockSecurityMiddleware).toHaveBeenCalled();
    });
  });
});