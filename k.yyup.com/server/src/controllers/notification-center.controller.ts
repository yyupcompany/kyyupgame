import { Request, Response } from 'express';
import { NotificationCenterService } from '../services/notification-center.service';
import { ApiResponse } from '../utils/apiResponse';

/**
 * 通知中心控制器（园长专用）
 * 提供通知统计和阅读详情功能
 */
export class NotificationCenterController {
  private notificationCenterService: NotificationCenterService;

  constructor() {
    this.notificationCenterService = new NotificationCenterService();
  }

  /**
   * 获取通知统计列表
   * GET /api/principal/notifications/statistics
   */
  async getNotificationStatistics(req: Request, res: Response) {
    try {
      const {
        page = 1,
        pageSize = 20,
        type,
        startDate,
        endDate,
        keyword
      } = req.query;

      const params = {
        page: Number(page),
        pageSize: Number(pageSize),
        type: type as string,
        startDate: startDate as string,
        endDate: endDate as string,
        keyword: keyword as string
      };

      const result = await this.notificationCenterService.getNotificationStatistics(params);

      return ApiResponse.success(res, result, '获取通知统计成功');
    } catch (error) {
      console.error('获取通知统计失败:', error);
      return ApiResponse.handleError(res, error, '获取通知统计失败');
    }
  }

  /**
   * 获取通知阅读详情
   * GET /api/principal/notifications/:notificationId/readers
   */
  async getNotificationReaders(req: Request, res: Response) {
    try {
      const { notificationId } = req.params;
      const {
        status = 'all',
        page = 1,
        pageSize = 10
      } = req.query;

      if (!notificationId) {
        return ApiResponse.error(res, '通知ID不能为空', 'VALIDATION_ERROR', 400);
      }

      const params = {
        status: status as 'read' | 'unread' | 'all',
        page: Number(page),
        pageSize: Number(pageSize)
      };

      const result = await this.notificationCenterService.getNotificationReaders(
        Number(notificationId),
        params
      );

      return ApiResponse.success(res, result, '获取阅读详情成功');
    } catch (error) {
      console.error('获取阅读详情失败:', error);
      return ApiResponse.handleError(res, error, '获取阅读详情失败');
    }
  }

  /**
   * 获取通知统计概览
   * GET /api/principal/notifications/overview
   */
  async getNotificationOverview(req: Request, res: Response) {
    try {
      const result = await this.notificationCenterService.getNotificationOverview();
      return ApiResponse.success(res, result, '获取统计概览成功');
    } catch (error) {
      console.error('获取统计概览失败:', error);
      return ApiResponse.handleError(res, error, '获取统计概览失败');
    }
  }

  /**
   * 导出通知阅读报告
   * POST /api/principal/notifications/:notificationId/export
   */
  async exportNotificationReport(req: Request, res: Response) {
    try {
      const { notificationId } = req.params;

      if (!notificationId) {
        return ApiResponse.error(res, '通知ID不能为空', 'VALIDATION_ERROR', 400);
      }

      const result = await this.notificationCenterService.exportNotificationReport(
        Number(notificationId)
      );

      return ApiResponse.success(res, result, '导出报告成功');
    } catch (error) {
      console.error('导出报告失败:', error);
      return ApiResponse.handleError(res, error, '导出报告失败');
    }
  }

  /**
   * 创建并发送通知
   * POST /api/principal/notifications
   */
  async createAndSendNotification(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return ApiResponse.error(res, '用户未登录', 'UNAUTHORIZED', 401);
      }

      const {
        title,
        content,
        type,
        priority,
        recipients
      } = req.body;

      // 验证必填字段
      if (!title || !content || !type || !recipients) {
        return ApiResponse.error(res, '缺少必填字段', 'VALIDATION_ERROR', 400);
      }

      const notificationData = {
        title,
        content,
        type,
        priority: priority || 'normal',
        recipients,
        senderId: userId
      };

      const result = await this.notificationCenterService.createAndSendNotification(
        notificationData
      );

      return ApiResponse.success(res, result, '通知发送成功');
    } catch (error) {
      console.error('发送通知失败:', error);
      return ApiResponse.handleError(res, error, '发送通知失败');
    }
  }
}

// 导出控制器实例
export const notificationCenterController = new NotificationCenterController();

