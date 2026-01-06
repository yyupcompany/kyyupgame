/**
 * 积攒活动控制器
 * 处理积攒活动相关的HTTP请求
 */

import { Request, Response } from 'express';
import { collectActivityService } from '../../services/marketing/collect-activity.service';
import { successResponse, errorResponse } from '../../utils/response-handler';
import { logger } from '../../utils/logger';
import { getClientIP } from '../../utils/ip';

export class CollectActivityController {
  /**
   * 创建积攒活动
   * POST /api/marketing/collect-activity
   */
  static async createCollectActivity(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return errorResponse(res, '用户未登录', 401);
      }

      const { activityId, targetCount, maxCount, rewardType, rewardValue, deadlineHours } = req.body;

      // 参数验证
      if (!activityId) {
        return errorResponse(res, '活动ID不能为空');
      }

      const collectActivity = await collectActivityService.createCollectActivity({
        activityId,
        userId,
        targetCount,
        maxCount,
        rewardType,
        rewardValue,
        deadlineHours,
      });

      logger.info('创建积攒活动成功', {
        userId,
        activityId,
        collectActivityId: collectActivity.id,
        collectCode: collectActivity.collectCode,
      });

      successResponse(res, {
        message: '创建积攒活动成功',
        data: collectActivity,
      });
    } catch (error: any) {
      logger.error('创建积攒活动失败', error);
      errorResponse(res, error.message || '创建积攒活动失败');
    }
  }

  /**
   * 助力积攒
   * POST /api/marketing/collect-activity/help
   */
  static async helpCollect(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return errorResponse(res, '用户未登录', 401);
      }

      const { collectCode, inviterId } = req.body;

      // 参数验证
      if (!collectCode) {
        return errorResponse(res, '积攒码不能为空');
      }

      const record = await collectActivityService.helpCollect({
        collectCode,
        helperId: userId,
        inviterId,
        ip: getClientIP(req),
        userAgent: req.headers['user-agent'],
      });

      logger.info('助力积攒成功', {
        userId,
        collectCode,
        recordId: record.id,
      });

      successResponse(res, {
        message: '助力成功',
        data: record,
      });
    } catch (error: any) {
      logger.error('助力积攒失败', error);
      errorResponse(res, error.message || '助力失败');
    }
  }

  /**
   * 获取积攒活动列表
   * GET /api/marketing/collect-activity
   */
  static async getCollectActivityList(req: Request, res: Response): Promise<void> {
    try {
      const { activityId, userId, status, page = 1, pageSize = 20 } = req.query;

      const result = await collectActivityService.getCollectActivityList({
        activityId: activityId ? parseInt(activityId as string) : undefined,
        userId: userId ? parseInt(userId as string) : undefined,
        status: status as string,
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string),
      });

      successResponse(res, {
        message: '获取积攒活动列表成功',
        data: result,
      });
    } catch (error: any) {
      logger.error('获取积攒活动列表失败', error);
      errorResponse(res, error.message || '获取积攒活动列表失败');
    }
  }

  /**
   * 获取积攒活动详情
   * GET /api/marketing/collect-activity/:id
   */
  static async getCollectActivityDetail(req: Request, res: Response): Promise<void> {
    try {
      const { id: collectActivityId } = req.params;

      if (!collectActivityId) {
        return errorResponse(res, '积攒活动ID不能为空');
      }

      const detail = await collectActivityService.getCollectActivityDetail(parseInt(collectActivityId));

      // 增加浏览次数
      await collectActivityService.incrementViewCount(parseInt(collectActivityId));

      successResponse(res, {
        message: '获取积攒活动详情成功',
        data: detail,
      });
    } catch (error: any) {
      logger.error('获取积攒活动详情失败', error);
      errorResponse(res, error.message || '获取积攒活动详情失败');
    }
  }

  /**
   * 分享积攒活动
   * POST /api/marketing/collect-activity/:id/share
   */
  static async shareCollectActivity(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { id: collectActivityId } = req.params;
      const { shareChannel } = req.body;

      if (!collectActivityId) {
        return errorResponse(res, '积攒活动ID不能为空');
      }

      // 增加分享次数
      await collectActivityService.incrementShareCount(parseInt(collectActivityId));

      // 记录分享行为
      logger.info('分享积攒活动', {
        userId,
        collectActivityId,
        shareChannel,
      });

      successResponse(res, {
        message: '分享成功',
        data: {
          shareUrl: `${process.env.FRONTEND_URL}/activity/collect/${collectActivityId}`,
          shareQrCode: `${process.env.API_URL}/api/qrcode/collect/${collectActivityId}`,
        },
      });
    } catch (error: any) {
      logger.error('分享积攒活动失败', error);
      errorResponse(res, error.message || '分享失败');
    }
  }

  /**
   * 我的积攒活动
   * GET /api/marketing/collect-activity/my
   */
  static async getMyCollectActivities(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return errorResponse(res, '用户未登录', 401);
      }

      const { status, page = 1, pageSize = 20 } = req.query;

      const result = await collectActivityService.getMyCollectActivities(userId, {
        status: status as string,
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string),
      });

      successResponse(res, {
        message: '获取我的积攒活动成功',
        data: result,
      });
    } catch (error: any) {
      logger.error('获取我的积攒活动失败', error);
      errorResponse(res, error.message || '获取我的积攒活动失败');
    }
  }

  /**
   * 活动积攒列表
   * GET /api/marketing/collect-activity/activity/:activityId
   */
  static async getActivityCollectActivities(req: Request, res: Response): Promise<void> {
    try {
      const { activityId } = req.params;
      const { status, page = 1, pageSize = 20 } = req.query;

      if (!activityId) {
        return errorResponse(res, '活动ID不能为空');
      }

      const result = await collectActivityService.getCollectActivityList({
        activityId: parseInt(activityId),
        status: status as string,
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string),
      });

      successResponse(res, {
        message: '获取活动积攒列表成功',
        data: result,
      });
    } catch (error: any) {
      logger.error('获取活动积攒列表失败', error);
      errorResponse(res, error.message || '获取活动积攒列表失败');
    }
  }

  /**
   * 根据积攒码获取信息
   * GET /api/marketing/collect-activity/code/:code
   */
  static async getCollectActivityByCode(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.params;

      if (!code) {
        return errorResponse(res, '积攒码不能为空');
      }

      const result = await collectActivityService.getCollectActivityList({
        status: 'active',
        pageSize: 1,
      });

      const collectActivity = result.items.find(item => item.collectCode === code);

      if (!collectActivity) {
        return errorResponse(res, '积攒码不存在或已过期', 404);
      }

      // 增加浏览次数
      await collectActivityService.incrementViewCount(collectActivity.id);

      successResponse(res, {
        message: '获取积攒活动信息成功',
        data: collectActivity,
      });
    } catch (error: any) {
      logger.error('获取积攒活动信息失败', error);
      errorResponse(res, error.message || '获取积攒活动信息失败');
    }
  }

  /**
   * 检查过期积攒活动
   * POST /api/marketing/collect-activity/check-expired
   */
  static async checkExpiredCollectActivities(req: Request, res: Response): Promise<void> {
    try {
      await collectActivityService.checkExpiredCollectActivities();

      successResponse(res, {
        message: '检查积攒活动状态完成',
      });
    } catch (error: any) {
      logger.error('检查积攒活动状态失败', error);
      errorResponse(res, error.message || '检查积攒活动状态失败');
    }
  }
}

export default CollectActivityController;