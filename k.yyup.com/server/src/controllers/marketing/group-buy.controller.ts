/**
 * 团购控制器
 * 处理团购相关的HTTP请求
 */

import { Request, Response } from 'express';
import { groupBuyService } from '../../services/marketing/group-buy.service';
import { successResponse, errorResponse } from '../../utils/response-handler';
import { logger } from '../../utils/logger';

export class GroupBuyController {
  /**
   * 创建团购（开团）
   * POST /api/marketing/group-buy
   */
  static async createGroupBuy(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return errorResponse(res, '用户未登录', 401);
      }

      const { activityId, targetPeople, maxPeople, groupPrice, deadlineHours } = req.body;

      // 参数验证
      if (!activityId) {
        return errorResponse(res, '活动ID不能为空');
      }

      const groupBuy = await groupBuyService.createGroupBuy({
        activityId,
        groupLeaderId: userId,
        targetPeople,
        maxPeople,
        groupPrice,
        deadlineHours,
      });

      logger.info('开团成功', {
        userId,
        activityId,
        groupBuyId: groupBuy.id,
        groupCode: groupBuy.groupCode,
      });

      successResponse(res, {
        message: '开团成功',
        data: groupBuy,
      });
    } catch (error: any) {
      logger.error('开团失败', error);
      errorResponse(res, error.message || '开团失败');
    }
  }

  /**
   * 参与团购
   * POST /api/marketing/group-buy/:id/join
   */
  static async joinGroupBuy(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return errorResponse(res, '用户未登录', 401);
      }

      const { id: groupBuyId } = req.params;
      const { inviteCode, inviterId } = req.body;

      // 参数验证
      if (!groupBuyId) {
        return errorResponse(res, '团购ID不能为空');
      }

      const member = await groupBuyService.joinGroupBuy({
        groupBuyId: parseInt(groupBuyId),
        userId,
        inviteCode,
        inviterId,
      });

      logger.info('参团成功', {
        userId,
        groupBuyId,
        memberId: member.id,
      });

      successResponse(res, {
        message: '参团成功',
        data: member,
      });
    } catch (error: any) {
      logger.error('参团失败', error);
      errorResponse(res, error.message || '参团失败');
    }
  }

  /**
   * 获取团购列表
   * GET /api/marketing/group-buy
   */
  static async getGroupBuyList(req: Request, res: Response): Promise<void> {
    try {
      const { activityId, userId, status, page = 1, pageSize = 20 } = req.query;

      const result = await groupBuyService.getGroupBuyList({
        activityId: activityId ? parseInt(activityId as string) : undefined,
        userId: userId ? parseInt(userId as string) : undefined,
        status: status as string,
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string),
      });

      successResponse(res, {
        message: '获取团购列表成功',
        data: result,
      });
    } catch (error: any) {
      logger.error('获取团购列表失败', error);
      errorResponse(res, error.message || '获取团购列表失败');
    }
  }

  /**
   * 获取团购详情
   * GET /api/marketing/group-buy/:id
   */
  static async getGroupBuyDetail(req: Request, res: Response): Promise<void> {
    try {
      const { id: groupBuyId } = req.params;

      if (!groupBuyId) {
        return errorResponse(res, '团购ID不能为空');
      }

      const detail = await groupBuyService.getGroupBuyDetail(parseInt(groupBuyId));

      // 增加浏览次数
      await groupBuyService.incrementViewCount(parseInt(groupBuyId));

      successResponse(res, {
        message: '获取团购详情成功',
        data: detail,
      });
    } catch (error: any) {
      logger.error('获取团购详情失败', error);
      errorResponse(res, error.message || '获取团购详情失败');
    }
  }

  /**
   * 分享团购
   * POST /api/marketing/group-buy/:id/share
   */
  static async shareGroupBuy(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { id: groupBuyId } = req.params;
      const { shareChannel } = req.body;

      if (!groupBuyId) {
        return errorResponse(res, '团购ID不能为空');
      }

      // 增加分享次数
      await groupBuyService.incrementShareCount(parseInt(groupBuyId));

      // 记录分享行为
      logger.info('团购分享', {
        userId,
        groupBuyId,
        shareChannel,
      });

      successResponse(res, {
        message: '分享成功',
        data: {
          shareUrl: `${process.env.FRONTEND_URL}/activity/group-buy/${groupBuyId}`,
          shareQrCode: `${process.env.API_URL}/api/qrcode/group-buy/${groupBuyId}`,
        },
      });
    } catch (error: any) {
      logger.error('分享团购失败', error);
      errorResponse(res, error.message || '分享失败');
    }
  }

  /**
   * 我的团购
   * GET /api/marketing/group-buy/my
   */
  static async getMyGroupBuys(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return errorResponse(res, '用户未登录', 401);
      }

      const { status, page = 1, pageSize = 20 } = req.query;

      const result = await groupBuyService.getGroupBuyList({
        userId,
        status: status as string,
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string),
      });

      successResponse(res, {
        message: '获取我的团购成功',
        data: result,
      });
    } catch (error: any) {
      logger.error('获取我的团购失败', error);
      errorResponse(res, error.message || '获取我的团购失败');
    }
  }

  /**
   * 活动团购列表
   * GET /api/marketing/group-buy/activity/:activityId
   */
  static async getActivityGroupBuys(req: Request, res: Response): Promise<void> {
    try {
      const { activityId } = req.params;
      const { status, page = 1, pageSize = 20 } = req.query;

      if (!activityId) {
        return errorResponse(res, '活动ID不能为空');
      }

      const result = await groupBuyService.getGroupBuyList({
        activityId: parseInt(activityId),
        status: status as string,
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string),
      });

      successResponse(res, {
        message: '获取活动团购列表成功',
        data: result,
      });
    } catch (error: any) {
      logger.error('获取活动团购列表失败', error);
      errorResponse(res, error.message || '获取活动团购列表失败');
    }
  }

  /**
   * 检查团购状态
   * POST /api/marketing/group-buy/check-expired
   */
  static async checkExpiredGroupBuys(req: Request, res: Response): Promise<void> {
    try {
      await groupBuyService.checkExpiredGroupBuys();

      successResponse(res, {
        message: '检查团购状态完成',
      });
    } catch (error: any) {
      logger.error('检查团购状态失败', error);
      errorResponse(res, error.message || '检查团购状态失败');
    }
  }
}

export default GroupBuyController;