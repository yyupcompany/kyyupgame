/**
 * 阶梯奖励控制器
 * 处理阶梯奖励相关的HTTP请求
 */

import { Request, Response } from 'express';
import { tieredRewardService } from '../../services/marketing/tiered-reward.service';
import { successResponse, errorResponse } from '../../utils/response-handler';
import { logger } from '../../utils/logger';

export class TieredRewardController {
  /**
   * 创建阶梯奖励
   * POST /api/marketing/tiered-reward
   */
  static async createTieredReward(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return errorResponse(res, '用户未登录', 401);
      }

      const {
        activityId,
        type,
        tier,
        targetValue,
        rewardType,
        rewardValue,
        rewardDescription,
        isActive,
        maxWinners,
        expiryDate
      } = req.body;

      // 参数验证
      if (!activityId || !type || !tier || !targetValue || !rewardType || !rewardValue || !rewardDescription) {
        return errorResponse(res, '缺少必要参数');
      }

      if (!['registration', 'group_buy', 'collect_reward', 'referral'].includes(type)) {
        return errorResponse(res, '奖励类型无效');
      }

      if (!['discount', 'gift', 'cashback', 'points', 'free'].includes(rewardType)) {
        return errorResponse(res, '奖励内容类型无效');
      }

      if (tier <= 0 || targetValue <= 0) {
        return errorResponse(res, '层级和目标值必须大于0');
      }

      const tieredReward = await tieredRewardService.createTieredReward({
        activityId,
        type,
        tier,
        targetValue,
        rewardType,
        rewardValue,
        rewardDescription,
        isActive,
        maxWinners,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      });

      logger.info('创建阶梯奖励成功', {
        userId,
        tieredRewardId: tieredReward.id,
        activityId,
        type,
        tier,
      });

      successResponse(res, {
        message: '创建阶梯奖励成功',
        data: tieredReward,
      });
    } catch (error: any) {
      logger.error('创建阶梯奖励失败', error);
      errorResponse(res, error.message || '创建阶梯奖励失败');
    }
  }

  /**
   * 获取阶梯奖励列表
   * GET /api/marketing/tiered-reward
   */
  static async getTieredRewards(req: Request, res: Response): Promise<void> {
    try {
      const {
        activityId,
        type,
        isActive,
        page = 1,
        pageSize = 20
      } = req.query;

      const result = await tieredRewardService.getTieredRewards({
        activityId: activityId ? parseInt(activityId as string) : undefined,
        type: type as string,
        isActive: isActive ? isActive === 'true' : undefined,
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string),
      });

      successResponse(res, {
        message: '获取阶梯奖励列表成功',
        data: result,
      });
    } catch (error: any) {
      logger.error('获取阶梯奖励列表失败', error);
      errorResponse(res, error.message || '获取阶梯奖励列表失败');
    }
  }

  /**
   * 获取活动的阶梯奖励
   * GET /api/marketing/tiered-reward/activity/:activityId
   */
  static async getActivityTieredRewards(req: Request, res: Response): Promise<void> {
    try {
      const { activityId } = req.params;
      const { type } = req.query;

      if (!activityId) {
        return errorResponse(res, '活动ID不能为空');
      }

      const rewards = await tieredRewardService.getActivityTieredRewards(
        parseInt(activityId),
        type as string
      );

      successResponse(res, {
        message: '获取活动阶梯奖励成功',
        data: rewards,
      });
    } catch (error: any) {
      logger.error('获取活动阶梯奖励失败', error);
      errorResponse(res, error.message || '获取活动阶梯奖励失败');
    }
  }

  /**
   * 获取用户的获奖记录
   * GET /api/marketing/tiered-reward/my-records
   */
  static async getUserRewardRecords(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return errorResponse(res, '用户未登录', 401);
      }

      const {
        activityId,
        status,
        page = 1,
        pageSize = 20
      } = req.query;

      const result = await tieredRewardService.getUserRewardRecords(userId, {
        activityId: activityId ? parseInt(activityId as string) : undefined,
        status: status as string,
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string),
      });

      successResponse(res, {
        message: '获取获奖记录成功',
        data: result,
      });
    } catch (error: any) {
      logger.error('获取获奖记录失败', error);
      errorResponse(res, error.message || '获取获奖记录失败');
    }
  }

  /**
   * 使用奖励
   * POST /api/marketing/tiered-reward/use/:recordId
   */
  static async useReward(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return errorResponse(res, '用户未登录', 401);
      }

      const { recordId } = req.params;

      if (!recordId) {
        return errorResponse(res, '获奖记录ID不能为空');
      }

      await tieredRewardService.useReward(parseInt(recordId), userId);

      logger.info('使用阶梯奖励成功', {
        userId,
        recordId: parseInt(recordId),
      });

      successResponse(res, {
        message: '使用奖励成功',
      });
    } catch (error: any) {
      logger.error('使用阶梯奖励失败', error);
      errorResponse(res, error.message || '使用奖励失败');
    }
  }

  /**
   * 更新阶梯奖励
   * PUT /api/marketing/tiered-reward/:tieredRewardId
   */
  static async updateTieredReward(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return errorResponse(res, '用户未登录', 401);
      }

      const { tieredRewardId } = req.params;
      const updates = req.body;

      if (!tieredRewardId) {
        return errorResponse(res, '阶梯奖励ID不能为空');
      }

      const tieredReward = await tieredRewardService.updateTieredReward(
        parseInt(tieredRewardId),
        updates
      );

      logger.info('更新阶梯奖励成功', {
        userId,
        tieredRewardId: parseInt(tieredRewardId),
        updates,
      });

      successResponse(res, {
        message: '更新阶梯奖励成功',
        data: tieredReward,
      });
    } catch (error: any) {
      logger.error('更新阶梯奖励失败', error);
      errorResponse(res, error.message || '更新阶梯奖励失败');
    }
  }

  /**
   * 删除阶梯奖励
   * DELETE /api/marketing/tiered-reward/:tieredRewardId
   */
  static async deleteTieredReward(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return errorResponse(res, '用户未登录', 401);
      }

      const { tieredRewardId } = req.params;

      if (!tieredRewardId) {
        return errorResponse(res, '阶梯奖励ID不能为空');
      }

      await tieredRewardService.deleteTieredReward(parseInt(tieredRewardId));

      logger.info('删除阶梯奖励成功', {
        userId,
        tieredRewardId: parseInt(tieredRewardId),
      });

      successResponse(res, {
        message: '删除阶梯奖励成功',
      });
    } catch (error: any) {
      logger.error('删除阶梯奖励失败', error);
      errorResponse(res, error.message || '删除阶梯奖励失败');
    }
  }

  /**
   * 获取奖励统计
   * GET /api/marketing/tiered-reward/statistics/:activityId
   */
  static async getRewardStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { activityId } = req.params;

      if (!activityId) {
        return errorResponse(res, '活动ID不能为空');
      }

      const statistics = await tieredRewardService.getRewardStatistics(parseInt(activityId));

      successResponse(res, {
        message: '获取奖励统计成功',
        data: statistics,
      });
    } catch (error: any) {
      logger.error('获取奖励统计失败', error);
      errorResponse(res, error.message || '获取奖励统计失败');
    }
  }

  /**
   * 手动检查并发放奖励
   * POST /api/marketing/tiered-reward/check-awards/:activityId
   */
  static async checkAndAwardRewards(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return errorResponse(res, '用户未登录', 401);
      }

      const { activityId } = req.params;
      const { type, currentValue, targetUserId } = req.body;

      if (!activityId || !type || currentValue === undefined) {
        return errorResponse(res, '缺少必要参数');
      }

      if (!['registration', 'group_buy', 'collect_reward', 'referral'].includes(type)) {
        return errorResponse(res, '奖励类型无效');
      }

      const awardedRecords = await tieredRewardService.checkAndAwardTieredRewards(
        parseInt(activityId),
        type,
        parseInt(currentValue),
        targetUserId
      );

      logger.info('手动检查并发放奖励', {
        userId,
        activityId: parseInt(activityId),
        type,
        currentValue: parseInt(currentValue),
        awardedCount: awardedRecords.length,
      });

      successResponse(res, {
        message: '检查并发放奖励完成',
        data: {
          awardedCount: awardedRecords.length,
          awardedRecords,
        },
      });
    } catch (error: any) {
      logger.error('手动检查并发放奖励失败', error);
      errorResponse(res, error.message || '检查并发放奖励失败');
    }
  }
}

export default TieredRewardController;