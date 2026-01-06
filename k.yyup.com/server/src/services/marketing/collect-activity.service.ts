import { NotificationType } from '../../models/notification.model';
/**
 * 积攒活动服务
 * 处理积攒发起、助力、奖励发放等业务逻辑
 */

import { Op } from 'sequelize';
import { CollectActivity, CollectRecord } from '../../models';
import { Activity } from '../../models/activity.model';
import { User } from '../../models/user.model';
import { logger } from '../../utils/logger';
import { generateCollectCode } from '../../utils/code-generator';
import notificationService from '../system/notification.service';
import { getClientIP } from '../../utils/ip';

export interface CreateCollectActivityParams {
  activityId: number;
  userId: number;
  targetCount?: number;
  maxCount?: number;
  rewardType?: 'discount' | 'gift' | 'free' | 'points';
  rewardValue?: string;
  deadlineHours?: number;
}

export interface CollectHelpParams {
  collectCode: string;
  helperId: number;
  inviterId?: number;
  ip?: string;
  userAgent?: string;
}

export interface CollectListParams {
  activityId?: number;
  userId?: number;
  status?: string;
  page?: number;
  pageSize?: number;
}

export class CollectActivityService {
  /**
   * 创建积攒活动
   */
  async createCollectActivity(params: CreateCollectActivityParams): Promise<CollectActivity> {
    try {
      const { activityId, userId, targetCount = 10, maxCount = 1000, deadlineHours = 72 } = params;

      // 检查活动是否存在且支持积攒
      const activity = await Activity.findByPk(activityId);
      if (!activity) {
        throw new Error('活动不存在');
      }

      const marketingConfig = activity.marketingConfig || {};
      const collectConfig = marketingConfig.collect || {};

      if (!collectConfig.enabled) {
        throw new Error('该活动不支持积攒');
      }

      // 检查用户是否已经为该活动发过积攒
      const existingCollect = await CollectActivity.findOne({
        where: {
          activityId,
          userId,
          status: ['active', 'completed'],
        },
      });

      if (existingCollect) {
        throw new Error('您已经为该活动发过积攒了');
      }

      // 创建积攒活动
      const rewardType = params.rewardType || collectConfig.rewardType || 'discount';
      const rewardValue = params.rewardValue || collectConfig.discountPercent?.toString() || '10';
      const deadline = new Date(Date.now() + (deadlineHours || 72) * 60 * 60 * 1000);

      const collectActivity = await CollectActivity.create({
        activityId,
        userId,
        collectCode: generateCollectCode(),
        targetCount: collectConfig.target || targetCount,
        currentCount: 0,
        maxCount: maxCount,
        deadline,
        status: 'active',
        rewardType,
        rewardValue,
      });

      // 发起通知
      await notificationService.createNotification({
        userId,
        type: NotificationType.COLLECT_CREATED,
        title: '积攒活动创建成功',
        content: `您的积攒活动已创建，积攒码：${collectActivity.collectCode}`,
        data: {
          collectActivityId: collectActivity.id,
          collectCode: collectActivity.collectCode,
        },
      });

      logger.info('积攒活动创建成功', {
        collectActivityId: collectActivity.id,
        activityId,
        userId,
        collectCode: collectActivity.collectCode,
      });

      return collectActivity;
    } catch (error) {
      logger.error('创建积攒活动失败', error);
      throw error;
    }
  }

  /**
   * 助力积攒
   */
  async helpCollect(params: CollectHelpParams): Promise<CollectRecord> {
    try {
      const { collectCode, helperId, inviterId, ip, userAgent } = params;

      // 查找积攒活动
      const collectActivity = await CollectActivity.findOne({
        where: {
          collectCode,
          status: 'active',
        },
        include: [
          {
            model: Activity,
            attributes: ['id', 'title'],
          },
        ],
      });

      if (!collectActivity) {
        throw new Error('积攒活动不存在或已结束');
      }

      if (!collectActivity.canCollect()) {
        throw new Error('积攒活动不可助力');
      }

      // 检查用户是否已经助力过
      const existingRecord = await CollectRecord.findOne({
        where: {
          collectActivityId: collectActivity.id,
          helperId,
        },
      });

      if (existingRecord) {
        throw new Error('您已经助力过该积攒活动');
      }

      // 检查是否自己助力自己的积攒
      if (collectActivity.userId === helperId) {
        throw new Error('不能助力自己的积攒活动');
      }

      // 创建助力记录
      const record = await CollectRecord.create({
        collectActivityId: collectActivity.id,
        helperId,
        inviterId: inviterId || collectActivity.userId,
        ip: ip || getClientIP(),
        userAgent: userAgent || '',
      });

      // 更新积攒数量
      await CollectActivity.update(
        {
          currentCount: collectActivity.currentCount + 1,
        },
        {
          where: { id: collectActivity.id },
        }
      );

      // 检查是否达到目标
      if (collectActivity.currentCount + 1 >= collectActivity.targetCount) {
        await this.completeCollectActivity(collectActivity.id);
      }

      // 发送助力通知
      await notificationService.createNotification({
        userId: collectActivity.userId,
        type: NotificationType.COLLECT_HELPED,
        title: '收到新的助力',
        content: `您的积攒活动 ${collectActivity.collectCode} 收到新的助力`,
        data: {
          collectActivityId: collectActivity.id,
          collectCode: collectActivity.collectCode,
          helperId,
        },
      });

      // 发送助力成功通知给助力者
      await notificationService.createNotification({
        userId: helperId,
        type: NotificationType.COLLECT_HELP_SUCCESS,
        title: '助力成功',
        content: `您已成功助力积攒活动 ${collectActivity.collectCode}`,
        data: {
          collectActivityId: collectActivity.id,
          collectCode: collectActivity.collectCode,
        },
      });

      logger.info('积攒助力成功', {
        collectActivityId: collectActivity.id,
        helperId,
        collectCode,
      });

      return record;
    } catch (error) {
      logger.error('积攒助力失败', error);
      throw error;
    }
  }

  /**
   * 完成积攒活动
   */
  async completeCollectActivity(collectActivityId: number): Promise<void> {
    try {
      const collectActivity = await CollectActivity.findByPk(collectActivityId);
      if (!collectActivity) {
        return;
      }

      if (collectActivity.status === 'completed') {
        return;
      }

      // 更新状态为已完成
      await CollectActivity.update(
        {
          status: 'completed',
        },
        {
          where: { id: collectActivityId },
        }
      );

      // 发放奖励给发起者
      await this.grantReward(collectActivity);

      // 发送完成通知给发起者
      await notificationService.createNotification({
        userId: collectActivity.userId,
        type: NotificationType.COLLECT_COMPLETED,
        title: '积攒活动完成',
        content: `恭喜！积攒活动 ${collectActivity.collectCode} 已完成`,
        data: {
          collectActivityId,
          collectCode: collectActivity.collectCode,
          reward: collectActivity.getRewardDescription(),
        },
      });

      logger.info('积攒活动完成', {
        collectActivityId,
        collectCode: collectActivity.collectCode,
        userId: collectActivity.userId,
      });
    } catch (error) {
      logger.error('完成积攒活动失败', error);
      throw error;
    }
  }

  /**
   * 发放奖励
   */
  private async grantReward(collectActivity: CollectActivity): Promise<void> {
    try {
      // TODO: 根据奖励类型发放实际奖励
      switch (collectActivity.rewardType) {
        case 'discount':
          // 发放优惠券或折扣码
          logger.info('发放折扣奖励', {
            userId: collectActivity.userId,
            discountPercent: collectActivity.rewardValue,
          });
          break;

        case 'gift':
          // 发放礼品
          logger.info('发放礼品奖励', {
            userId: collectActivity.userId,
            giftId: collectActivity.rewardValue,
          });
          break;

        case 'free':
          // 免费参与活动
          logger.info('发放免费参与奖励', {
            userId: collectActivity.userId,
            activityId: collectActivity.activityId,
          });
          break;

        case 'points':
          // 发放积分
          logger.info('发放积分奖励', {
            userId: collectActivity.userId,
            points: collectActivity.rewardValue,
          });
          break;
      }
    } catch (error) {
      logger.error('发放奖励失败', error);
    }
  }

  /**
   * 获取积攒活动列表
   */
  async getCollectActivityList(params: CollectListParams): Promise<{
    items: CollectActivity[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    try {
      const { activityId, userId, status, page = 1, pageSize = 20 } = params;

      const where: any = {};

      if (activityId) {
        where.activityId = activityId;
      }

      if (userId) {
        where.userId = userId;
      }

      if (status) {
        where.status = status;
      }

      const { rows, count } = await CollectActivity.findAndCountAll({
        where,
        include: [
          {
            model: Activity,
            attributes: ['id', 'title'],
          },
          {
            model: User,
            attributes: ['id', 'name', 'phone'],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });

      return {
        items: rows,
        total: count,
        page,
        pageSize,
      };
    } catch (error) {
      logger.error('获取积攒活动列表失败', error);
      throw error;
    }
  }

  /**
   * 获取积攒活动详情
   */
  async getCollectActivityDetail(collectActivityId: number): Promise<any> {
    try {
      const collectActivity = await CollectActivity.findByPk(collectActivityId, {
        include: [
          {
            model: Activity,
            attributes: ['id', 'title', 'description', 'startTime', 'endTime'],
          },
          {
            model: User,
            attributes: ['id', 'name', 'phone', 'avatar'],
          },
          {
            model: CollectRecord,
            include: [
              {
                model: User,
                attributes: ['id', 'name', 'phone', 'avatar'],
              },
            ],
          },
        ],
      });

      if (!collectActivity) {
        throw new Error('积攒活动不存在');
      }

      return collectActivity;
    } catch (error) {
      logger.error('获取积攒活动详情失败', error);
      throw error;
    }
  }

  /**
   * 检查并更新过期积攒活动
   */
  async checkExpiredCollectActivities(): Promise<void> {
    try {
      const expiredActivities = await CollectActivity.findAll({
        where: {
          status: 'active',
          deadline: {
            [Op.lt]: new Date(),
          },
        },
      });

      for (const activity of expiredActivities) {
        await CollectActivity.update(
          {
            status: 'expired',
          },
          {
            where: { id: activity.id },
          }
        );

        // 发送过期通知
        await notificationService.createNotification({
          userId: activity.userId,
          type: NotificationType.COLLECT_EXPIRED,
          title: '积攒活动已过期',
          content: `积攒活动 ${activity.collectCode} 因未达到目标人数已过期`,
          data: {
            collectActivityId: activity.id,
            collectCode: activity.collectCode,
          },
        });
      }

      logger.info('检查过期积攒活动完成', {
        expiredCount: expiredActivities.length,
      });
    } catch (error) {
      logger.error('检查过期积攒活动失败', error);
    }
  }

  /**
   * 增加积攒活动浏览次数
   */
  async incrementViewCount(collectActivityId: number): Promise<void> {
    try {
      await CollectActivity.increment('viewCount', {
        where: { id: collectActivityId },
      });
    } catch (error) {
      logger.error('增加积攒活动浏览次数失败', error);
    }
  }

  /**
   * 增加积攒活动分享次数
   */
  async incrementShareCount(collectActivityId: number): Promise<void> {
    try {
      await CollectActivity.increment('shareCount', {
        where: { id: collectActivityId },
      });
    } catch (error) {
      logger.error('增加积攒活动分享次数失败', error);
    }
  }

  /**
   * 我的积攒活动
   */
  async getMyCollectActivities(userId: number, params: {
    status?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<{
    items: CollectActivity[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    return this.getCollectActivityList({
      userId,
      ...params,
    });
  }
}

export const collectActivityService = new CollectActivityService();
export default collectActivityService;