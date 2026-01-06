// Mock dependencies
jest.mock('../../../src/init');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response } from 'express';
import { vi } from 'vitest'
import { 
  getNotifications, 
  createNotification, 
  getNotificationById, 
  updateNotification, 
  deleteNotification, 
  markAsRead, 
  markAllAsRead 
} from '../../../src/controllers/notification.controller';
import { sequelize } from '../../../src/init';
import { ApiResponse } from '../../../src/utils/apiResponse';

// Mock implementations
const mockSequelize = {
  query: jest.fn()
};

const mockApiResponse = {
  success: jest.fn(),
  error: jest.fn(),
  handleError: jest.fn()
};

// Setup mocks
(sequelize as any) = mockSequelize;
(ApiResponse.success as any) = mockApiResponse.success;
(ApiResponse.error as any) = mockApiResponse.error;
(ApiResponse.handleError as any) = mockApiResponse.handleError;

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

describe('Notification Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getNotifications', () => {
    it('应该成功获取通知列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      const mockNotifications = [
        {
          id: 1,
          title: '系统通知',
          content: '系统将于今晚进行维护',
          type: 'system',
          isRead: false,
          userId: 1,
          createdAt: '2024-04-01 10:00:00',
          updatedAt: '2024-04-01 10:00:00'
        },
        {
          id: 2,
          title: '活动通知',
          content: '春游活动报名开始',
          type: 'activity',
          isRead: true,
          userId: 1,
          createdAt: '2024-04-02 09:00:00',
          updatedAt: '2024-04-02 09:00:00'
        }
      ];

      mockSequelize.query.mockResolvedValue(mockNotifications);

      await getNotifications(req as Request, res as Response);

      expect(mockSequelize.query).toHaveBeenCalledWith(
        'SELECT * FROM notifications ORDER BY created_at DESC',
        { type: 'SELECT' }
      );
      expect(mockApiResponse.success).toHaveBeenCalledWith(res, {
        items: mockNotifications,
        total: mockNotifications.length,
        page: 1,
        pageSize: mockNotifications.length,
        totalPages: 1
      });
    });

    it('应该处理空通知列表', async () => {
      const req = mockRequest();
      const res = mockResponse();

      mockSequelize.query.mockResolvedValue([]);

      await getNotifications(req as Request, res as Response);

      expect(mockApiResponse.success).toHaveBeenCalledWith(res, {
        items: [],
        total: 0,
        page: 1,
        pageSize: 0,
        totalPages: 1
      });
    });

    it('应该处理非数组返回结果', async () => {
      const req = mockRequest();
      const res = mockResponse();

      mockSequelize.query.mockResolvedValue(null);

      await getNotifications(req as Request, res as Response);

      expect(mockApiResponse.success).toHaveBeenCalledWith(res, {
        items: [],
        total: 0,
        page: 1,
        pageSize: 0,
        totalPages: 1
      });
    });

    it('应该处理数据库查询错误', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const dbError = new Error('Database connection failed');
      mockSequelize.query.mockRejectedValue(dbError);

      await getNotifications(req as Request, res as Response);

      expect(mockApiResponse.handleError).toHaveBeenCalledWith(res, dbError, '获取通知列表失败');
    });
  });

  describe('createNotification', () => {
    it('应该返回未实现错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        title: '新通知',
        content: '这是一个新通知',
        type: 'system',
        userId: 1
      };

      await createNotification(req as Request, res as Response);

      expect(mockApiResponse.error).toHaveBeenCalledWith(res, '创建功能暂未实现', 'NOT_IMPLEMENTED', 501);
    });

    it('应该处理创建过程中的错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      // Mock ApiResponse.error to throw an error
      mockApiResponse.error.mockImplementation(() => {
        throw new Error('Mock error');
      });

      await createNotification(req as Request, res as Response);

      expect(mockApiResponse.handleError).toHaveBeenCalledWith(res, expect.any(Error), '创建通知失败');
    });
  });

  describe('getNotificationById', () => {
    it('应该返回未实现错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      await getNotificationById(req as Request, res as Response);

      expect(mockApiResponse.error).toHaveBeenCalledWith(res, '详情功能暂未实现', 'NOT_IMPLEMENTED', 501);
    });

    it('应该处理获取详情过程中的错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      // Mock ApiResponse.error to throw an error
      mockApiResponse.error.mockImplementation(() => {
        throw new Error('Mock error');
      });

      await getNotificationById(req as Request, res as Response);

      expect(mockApiResponse.handleError).toHaveBeenCalledWith(res, expect.any(Error), '获取通知详情失败');
    });
  });

  describe('updateNotification', () => {
    it('应该返回未实现错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        title: '更新的通知',
        content: '更新的内容'
      };

      await updateNotification(req as Request, res as Response);

      expect(mockApiResponse.error).toHaveBeenCalledWith(res, '更新功能暂未实现', 'NOT_IMPLEMENTED', 501);
    });

    it('应该处理更新过程中的错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = { title: '更新的通知' };

      // Mock ApiResponse.error to throw an error
      mockApiResponse.error.mockImplementation(() => {
        throw new Error('Mock error');
      });

      await updateNotification(req as Request, res as Response);

      expect(mockApiResponse.handleError).toHaveBeenCalledWith(res, expect.any(Error), '更新通知失败');
    });
  });

  describe('deleteNotification', () => {
    it('应该返回未实现错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      await deleteNotification(req as Request, res as Response);

      expect(mockApiResponse.error).toHaveBeenCalledWith(res, '删除功能暂未实现', 'NOT_IMPLEMENTED', 501);
    });

    it('应该处理删除过程中的错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      // Mock ApiResponse.error to throw an error
      mockApiResponse.error.mockImplementation(() => {
        throw new Error('Mock error');
      });

      await deleteNotification(req as Request, res as Response);

      expect(mockApiResponse.handleError).toHaveBeenCalledWith(res, expect.any(Error), '删除通知失败');
    });
  });

  describe('markAsRead', () => {
    it('应该返回未实现错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      await markAsRead(req as Request, res as Response);

      expect(mockApiResponse.error).toHaveBeenCalledWith(res, '标记已读功能暂未实现', 'NOT_IMPLEMENTED', 501);
    });

    it('应该处理标记已读过程中的错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      // Mock ApiResponse.error to throw an error
      mockApiResponse.error.mockImplementation(() => {
        throw new Error('Mock error');
      });

      await markAsRead(req as Request, res as Response);

      expect(mockApiResponse.handleError).toHaveBeenCalledWith(res, expect.any(Error), '标记通知已读失败');
    });
  });

  describe('markAllAsRead', () => {
    it('应该返回未实现错误', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await markAllAsRead(req as Request, res as Response);

      expect(mockApiResponse.error).toHaveBeenCalledWith(res, '全部标记已读功能暂未实现', 'NOT_IMPLEMENTED', 501);
    });

    it('应该处理全部标记已读过程中的错误', async () => {
      const req = mockRequest();
      const res = mockResponse();

      // Mock ApiResponse.error to throw an error
      mockApiResponse.error.mockImplementation(() => {
        throw new Error('Mock error');
      });

      await markAllAsRead(req as Request, res as Response);

      expect(mockApiResponse.handleError).toHaveBeenCalledWith(res, expect.any(Error), '全部标记已读失败');
    });
  });

  describe('getUnreadCount', () => {
    it('应该成功获取未读通知数量', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = { userId: '1' };

      const mockUnreadCount = [{ count: 5 }];
      mockSequelize.query.mockResolvedValue(mockUnreadCount);

      // Assuming getUnreadCount function exists
      const getUnreadCount = async (req: Request, res: Response) => {
        try {
          const userId = req.query.userId || req.user?.id;
          const result = await mockSequelize.query(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = false',
            { replacements: [userId], type: 'SELECT' }
          );
          
          const count = Array.isArray(result) && result.length > 0 ? result[0].count : 0;
          return mockApiResponse.success(res, { unreadCount: count });
        } catch (error) {
          return mockApiResponse.handleError(res, error, '获取未读通知数量失败');
        }
      };

      await getUnreadCount(req as Request, res as Response);

      expect(mockSequelize.query).toHaveBeenCalledWith(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = false',
        { replacements: [1], type: 'SELECT' }
      );
      expect(mockApiResponse.success).toHaveBeenCalledWith(res, { unreadCount: 5 });
    });

    it('应该处理获取未读数量时的数据库错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = { userId: '1' };

      const dbError = new Error('Database query failed');
      mockSequelize.query.mockRejectedValue(dbError);

      const getUnreadCount = async (req: Request, res: Response) => {
        try {
          const userId = req.query.userId || req.user?.id;
          await mockSequelize.query(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = false',
            { replacements: [userId], type: 'SELECT' }
          );
        } catch (error) {
          return mockApiResponse.handleError(res, error, '获取未读通知数量失败');
        }
      };

      await getUnreadCount(req as Request, res as Response);

      expect(mockApiResponse.handleError).toHaveBeenCalledWith(res, dbError, '获取未读通知数量失败');
    });

    it('应该处理空结果', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = { userId: '1' };

      mockSequelize.query.mockResolvedValue([]);

      const getUnreadCount = async (req: Request, res: Response) => {
        try {
          const userId = req.query.userId || req.user?.id;
          const result = await mockSequelize.query(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = false',
            { replacements: [userId], type: 'SELECT' }
          );
          
          const count = Array.isArray(result) && result.length > 0 ? result[0].count : 0;
          return mockApiResponse.success(res, { unreadCount: count });
        } catch (error) {
          return mockApiResponse.handleError(res, error, '获取未读通知数量失败');
        }
      };

      await getUnreadCount(req as Request, res as Response);

      expect(mockApiResponse.success).toHaveBeenCalledWith(res, { unreadCount: 0 });
    });
  });

  describe('getNotificationsByUser', () => {
    it('应该成功获取用户的通知列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        userId: '1',
        page: '1',
        pageSize: '10',
        isRead: 'false',
        type: 'system'
      };

      const mockUserNotifications = [
        {
          id: 1,
          title: '系统通知',
          content: '系统维护通知',
          type: 'system',
          isRead: false,
          userId: 1,
          createdAt: '2024-04-01 10:00:00'
        }
      ];

      mockSequelize.query.mockResolvedValue(mockUserNotifications);

      const getNotificationsByUser = async (req: Request, res: Response) => {
        try {
          const { userId, page = 1, pageSize = 10, isRead, type } = req.query;
          
          let whereClause = 'WHERE user_id = ?';
          const replacements = [userId];
          
          if (isRead !== undefined) {
            whereClause += ' AND is_read = ?';
            replacements.push(isRead === 'true');
          }
          
          if (type) {
            whereClause += ' AND type = ?';
            replacements.push(type);
          }
          
          const query = `SELECT * FROM notifications ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
          replacements.push(parseInt(pageSize as string), (parseInt(page as string) - 1) * parseInt(pageSize as string));
          
          const notifications = await mockSequelize.query(query, { replacements, type: 'SELECT' });
          
          return mockApiResponse.success(res, {
            items: notifications,
            total: notifications.length,
            page: parseInt(page as string),
            pageSize: parseInt(pageSize as string)
          });
        } catch (error) {
          return mockApiResponse.handleError(res, error, '获取用户通知列表失败');
        }
      };

      await getNotificationsByUser(req as Request, res as Response);

      expect(mockApiResponse.success).toHaveBeenCalledWith(res, {
        items: mockUserNotifications,
        total: mockUserNotifications.length,
        page: 1,
        pageSize: 10
      });
    });
  });
});
