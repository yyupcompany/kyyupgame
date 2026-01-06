/**
 * 录取通知控制器测试
 */

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import * as admissionNotificationController from '../../../src/controllers/admission-notification.controller';
import { ApiError } from '../../../src/utils/apiError';
import { ApiResponse } from '../../../src/utils/apiResponse';
import { sequelize } from '../../../src/init';

// 模拟依赖
jest.mock('../../../src/init');
jest.mock('../../../src/utils/apiResponse');
jest.mock('../../../src/utils/apiError');


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

describe('AdmissionNotificationController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonSpy: jest.Mock;
  let statusSpy: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      user: { id: 1 }
    };
    mockNext = jest.fn();
    jsonSpy = jest.fn();
    statusSpy = jest.fn().mockReturnThis();
    mockResponse = {
      json: jsonSpy,
      status: statusSpy
    };

    // 重置所有模拟
    jest.clearAllMocks();
  });

  describe('createNotification', () => {
    it('应该成功创建录取通知', async () => {
      const mockResult = [1]; // 插入ID
      const mockNotification = {
        id: 1,
        kindergarten_id: 1,
        title: '测试通知',
        content: '测试通知内容',
        notification_type: 1,
        is_public: 1,
        status: 1,
        creator_id: 1,
        created_at: expect.any(String),
        updated_at: expect.any(String)
      };

      (sequelize.query as jest.Mock).mockResolvedValue(mockResult);

      mockRequest.body = {
        title: '测试通知',
        content: '测试通知内容',
        notification_type: 1,
        kindergarten_id: 1,
        is_public: 1
      };

      await admissionNotificationController.createNotification(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO admission_notifications'),
        expect.objectContaining({
          replacements: expect.objectContaining({
            kindergarten_id: 1,
            title: '测试通知',
            content: '测试通知内容',
            notification_type: 1,
            is_public: 1,
            creator_id: 1
          }),
          type: 'INSERT'
        })
      );

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining(mockNotification),
        '创建录取通知成功'
      );
    });

    it('应该使用默认值创建通知', async () => {
      const mockResult = [1];

      (sequelize.query as jest.Mock).mockResolvedValue(mockResult);

      mockRequest.body = {}; // 空请求体

      await admissionNotificationController.createNotification(
        mockRequest as Request,
        mockResponse as mockNext
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO admission_notifications'),
        expect.objectContaining({
          replacements: expect.objectContaining({
            kindergarten_id: 1,
            title: '测试通知',
            content: '测试通知内容',
            notification_type: 1,
            is_public: 1
          })
        })
      );
    });

    it('应该处理用户未登录的情况', async () => {
      mockRequest.user = undefined;

      await admissionNotificationController.createNotification(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: '未登录或登录已过期'
        })
      );
    });

    it('应该处理数据库错误', async () => {
      const mockError = new Error('数据库连接失败');
      (sequelize.query as jest.Mock).mockRejectedValue(mockError);

      mockRequest.body = {
        title: '测试通知',
        content: '测试内容'
      };

      await admissionNotificationController.createNotification(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  describe('getNotificationById', () => {
    it('应该成功获取通知详情', async () => {
      const mockNotification = {
        id: 1,
        title: '测试通知',
        content: '测试内容',
        creator_name: '管理员',
        created_at: '2024-01-01'
      };

      (sequelize.query as jest.Mock).mockResolvedValue([mockNotification]);

      mockRequest.params = { id: '1' };

      await admissionNotificationController.getNotificationById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT an.*, u.real_name as creator_name'),
        expect.objectContaining({
          replacements: { id: '1' },
          type: 'SELECT'
        })
      );

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        mockNotification,
        '获取通知详情成功'
      );
    });

    it('应该处理通知不存在的情况', async () => {
      (sequelize.query as jest.Mock).mockResolvedValue([]);

      mockRequest.params = { id: '999' };

      await admissionNotificationController.getNotificationById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: '通知不存在',
        error: { code: 'NOT_FOUND', message: '通知不存在' }
      });
    });

    it('应该处理数据库查询错误', async () => {
      const mockError = new Error('查询失败');
      (sequelize.query as jest.Mock).mockRejectedValue(mockError);

      mockRequest.params = { id: '1' };

      await admissionNotificationController.getNotificationById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  describe('updateNotification', () => {
    it('应该成功更新通知', async () => {
      const existingNotification = [{ id: 1 }];
      const updatedNotification = [{ 
        id: 1, 
        title: '更新的通知', 
        content: '更新的内容',
        updated_at: '2024-01-02'
      }];

      (sequelize.query as jest.Mock)
        .mockResolvedValueOnce(existingNotification)
        .mockResolvedValueOnce(updatedNotification);

      mockRequest.params = { id: '1' };
      mockRequest.body = {
        title: '更新的通知',
        content: '更新的内容'
      };

      await admissionNotificationController.updateNotification(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE admission_notifications'),
        expect.objectContaining({
          replacements: expect.objectContaining({
            id: '1',
            title: '更新的通知',
            content: '更新的内容'
          })
        })
      );

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        updatedNotification[0],
        '更新通知成功'
      );
    });

    it('应该处理通知不存在的情况', async () => {
      (sequelize.query as jest.Mock).mockResolvedValue([]);

      mockRequest.params = { id: '999' };
      mockRequest.body = { title: '更新的通知' };

      await admissionNotificationController.updateNotification(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: '通知不存在',
        error: { code: 'NOT_FOUND', message: '通知不存在' }
      });
    });

    it('应该处理没有更新字段的情况', async () => {
      const existingNotification = [{ id: 1 }];

      (sequelize.query as jest.Mock).mockResolvedValue(existingNotification);

      mockRequest.params = { id: '1' };
      mockRequest.body = {}; // 空更新

      await admissionNotificationController.updateNotification(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: '没有提供要更新的字段',
        error: { code: 'VALIDATION_ERROR', message: '没有提供要更新的字段' }
      });
    });

    it('应该处理用户未登录的情况', async () => {
      mockRequest.user = undefined;

      await admissionNotificationController.updateNotification(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: '未登录或登录已过期'
        })
      );
    });
  });

  describe('deleteNotification', () => {
    it('应该成功删除通知', async () => {
      const existingNotification = [{ id: 1 }];

      (sequelize.query as jest.Mock).mockResolvedValue(existingNotification);

      mockRequest.params = { id: '1' };

      await admissionNotificationController.deleteNotification(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE admission_notifications SET deleted_at = NOW()'),
        expect.objectContaining({
          replacements: { id: '1' },
          type: 'UPDATE'
        })
      );

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        null,
        '删除通知成功'
      );
    });

    it('应该处理通知不存在的情况（幂等操作）', async () => {
      (sequelize.query as jest.Mock).mockResolvedValue([]);

      mockRequest.params = { id: '999' };

      await admissionNotificationController.deleteNotification(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        null,
        '通知已删除或不存在'
      );
    });

    it('应该处理数据库错误', async () => {
      const mockError = new Error('删除失败');
      (sequelize.query as jest.Mock).mockRejectedValue(mockError);

      mockRequest.params = { id: '1' };

      await admissionNotificationController.deleteNotification(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  describe('getNotifications', () => {
    it('应该成功获取通知列表', async () => {
      const mockCount = [{ total: 25 }];
      const mockNotifications = [
        {
          id: 1,
          title: '通知1',
          content: '内容1',
          creator_name: '管理员',
          created_at: '2024-01-01'
        },
        {
          id: 2,
          title: '通知2',
          content: '内容2',
          creator_name: '管理员',
          created_at: '2024-01-02'
        }
      ];

      (sequelize.query as jest.Mock)
        .mockResolvedValueOnce(mockCount)
        .mockResolvedValueOnce(mockNotifications);

      mockRequest.query = {
        page: '2',
        pageSize: '10'
      };

      await admissionNotificationController.getNotifications(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(sequelize.query).toHaveBeenCalledTimes(2);
      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        {
          items: mockNotifications,
          total: 25,
          page: 2,
          pageSize: 10,
          totalPages: 3
        },
        '获取通知列表成功'
      );
    });

    it('应该使用默认分页参数', async () => {
      const mockCount = [{ total: 5 }];
      const mockNotifications = [];

      (sequelize.query as jest.Mock)
        .mockResolvedValueOnce(mockCount)
        .mockResolvedValueOnce(mockNotifications);

      mockRequest.query = {}; // 空查询参数

      await admissionNotificationController.getNotifications(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        {
          items: [],
          total: 5,
          page: 1,
          pageSize: 10,
          totalPages: 1
        },
        '获取通知列表成功'
      );
    });

    it('应该处理数据库错误', async () => {
      const mockError = new Error('查询失败');
      (sequelize.query as jest.Mock).mockRejectedValue(mockError);

      await admissionNotificationController.getNotifications(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  describe('sendNotification', () => {
    it('应该成功发送通知', async () => {
      (sequelize.query as jest.Mock).mockResolvedValue({});

      mockRequest.params = { id: '1' };

      await admissionNotificationController.sendNotification(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE admission_notifications SET status = 2'),
        expect.objectContaining({
          replacements: { id: '1' },
          type: 'UPDATE'
        })
      );

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        { id: '1' },
        '发送通知成功'
      );
    });

    it('应该处理数据库错误', async () => {
      const mockError = new Error('发送失败');
      (sequelize.query as jest.Mock).mockRejectedValue(mockError);

      mockRequest.params = { id: '1' };

      await admissionNotificationController.sendNotification(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  describe('markDelivered', () => {
    it('应该成功标记通知为已送达', async () => {
      (sequelize.query as jest.Mock).mockResolvedValue({});

      mockRequest.params = { id: '1' };

      await admissionNotificationController.markDelivered(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE admission_notifications SET status = 3'),
        expect.objectContaining({
          replacements: { id: '1' },
          type: 'UPDATE'
        })
      );

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        { id: '1' },
        '标记通知为已送达成功'
      );
    });
  });

  describe('markRead', () => {
    it('应该成功标记通知为已读', async () => {
      (sequelize.query as jest.Mock).mockResolvedValue({});

      mockRequest.params = { id: '1' };

      await admissionNotificationController.markRead(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE admission_notifications SET status = 4'),
        expect.objectContaining({
          replacements: { id: '1' },
          type: 'UPDATE'
        })
      );

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        { id: '1' },
        '标记通知为已读成功'
      );
    });
  });

  describe('recordResponse', () => {
    it('应该成功记录通知回复', async () => {
      (sequelize.query as jest.Mock).mockResolvedValue({});

      mockRequest.params = { id: '1' };
      mockRequest.body = { response: '家长回复内容' };

      await admissionNotificationController.recordResponse(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE admission_notifications SET updated_at = NOW()'),
        expect.objectContaining({
          replacements: { id: '1' },
          type: 'UPDATE'
        })
      );

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        { id: '1', response: '家长回复内容' },
        '记录通知回复成功'
      );
    });
  });

  describe('resendNotification', () => {
    it('应该成功重新发送通知', async () => {
      const existingNotification = [{ id: 1 }];

      (sequelize.query as jest.Mock).mockResolvedValue(existingNotification);

      mockRequest.params = { id: '1' };

      await admissionNotificationController.resendNotification(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE admission_notifications SET status = 2'),
        expect.objectContaining({
          replacements: { id: '1' },
          type: 'UPDATE'
        })
      );

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        { id: '1' },
        '重新发送通知成功'
      );
    });

    it('应该处理通知不存在的情况', async () => {
      (sequelize.query as jest.Mock).mockResolvedValue([]);

      mockRequest.params = { id: '999' };

      await admissionNotificationController.resendNotification(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: '通知不存在',
        error: { code: 'NOT_FOUND', message: '通知不存在' }
      });
    });
  });
});