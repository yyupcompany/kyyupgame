import { NotificationType } from '../../models/notification.model';
/**
 * 阶梯奖励服务
 * 处理阶梯奖励的业务逻辑
 */

import { Op } from 'sequelize';
import { TieredReward } from '../../models/marketing/tiered-reward.model';
import { TieredRewardRecord } from '../../models/marketing/tiered-reward-record.model';
import { Activity } from '../../models/activity.model';
import { GroupBuy } from '../../models/marketing/group-buy.model';
import { CollectActivity } from '../../models/marketing/collect-activity.model';
import { logger } from '../../utils/logger';
import notificationService from '../system/notification.service';

export interface CreateTieredRewardParams {
  activityId: number;
  type: 'registration' | 'group_buy' | 'collect_reward' | 'referral';
  tier: number;
  targetValue: number;
  rewardType: 'discount' | 'gift' | 'cashback' | 'points' | 'free';
  rewardValue: string;
  rewardDescription: string;
  isActive?: boolean;
  maxWinners?: number;
  expiryDate?: Date;
}

export interface GetTieredRewardsParams {
  activityId?: number;
  type?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export class TieredRewardService {
  /**
   * 创建阶梯奖励
   */
  async createTieredReward(params: CreateTieredRewardParams): Promise<TieredReward> {
    try {
      const {
        activityId,
        type,
        tier,
        targetValue,
        rewardType,
        rewardValue,
        rewardDescription,
        isActive = true,
        maxWinners,
        expiryDate
      } = params;

      // 验证活动是否存在
      const activity = await Activity.findByPk(activityId);
      if (!activity) {
        throw new Error('活动不存在');
      }

      // 检查同类型同层级的奖励是否已存在
      const existingReward = await TieredReward.findOne({
        where: {
          activityId,
          type,
          tier,
        },
      });

      if (existingReward) {
        throw new Error(`该活动的${type}类型第${tier}阶梯奖励已存在`);
      }

      const tieredReward = await TieredReward.create({
        activityId,
        type,
        tier,
        targetValue,
        rewardType,
        rewardValue,
        rewardDescription,
        isActive,
        maxWinners,
        expiryDate,
      });

      logger.info('创建阶梯奖励成功', {
        tieredRewardId: tieredReward.id,
        activityId,
        type,
        tier,
        targetValue,
      });

      return tieredReward;
    } catch (error) {
      logger.error('创建阶梯奖励失败', error);
      throw error;
    }
  }

  /**
   * 获取阶梯奖励列表
   */
  async getTieredRewards(params: GetTieredRewardsParams): Promise<{
    items: TieredReward[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    try {
      const { activityId, type, isActive, page = 1, pageSize = 20 } = params;

      const where: any = {};

      if (activityId) {
        where.activityId = activityId;
      }

      if (type) {
        where.type = type;
      }

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      const { rows, count } = await TieredReward.findAndCountAll({
        where,
        include: [
          {
            model: Activity,
            attributes: ['id', 'title'],
          },
        ],
        order: [['activityId', 'ASC'], ['tier', 'ASC']],
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
      logger.error('获取阶梯奖励列表失败', error);
      throw error;
    }
  }

  /**
   * 获取活动的阶梯奖励
   */
  async getActivityTieredRewards(activityId: number, type?: string): Promise<TieredReward[]> {
    try {
      const where: any = {
        activityId,
        isActive: true,
      };

      if (type) {
        where.type = type;
      }

      const rewards = await TieredReward.findAll({
        where,
        order: [['tier', 'ASC']],
      });

      return rewards;
    } catch (error) {
      logger.error('获取活动阶梯奖励失败', error);
      throw error;
    }
  }

  /**
   * 检查并发放阶梯奖励
   */
  async checkAndAwardTieredRewards(
    activityId: number,
    type: 'registration' | 'group_buy' | 'collect_reward' | 'referral',
    currentValue: number,
    userId?: number
  ): Promise<TieredRewardRecord[]> {
    try {
      const awardedRecords: TieredRewardRecord[] = [];

      // 获取活动的所有有效阶梯奖励
      const rewards = await TieredReward.findAll({
        where: {
          activityId,
          type,
          isActive: true,
        },
        order: [['tier', 'ASC']],
      });

      for (const reward of rewards) {
        // 检查是否达到目标值
        if (!reward.isAchieved(currentValue)) {
          continue;
        }

        // 检查是否还可以发放奖励
        if (!reward.canAward()) {
          continue;
        }

        // 如果指定了用户ID，检查该用户是否已获得此奖励
        if (userId) {
          const existingRecord = await TieredRewardRecord.findOne({
            where: {
              tieredRewardId: reward.id,
              userId,
              status: ['pending', 'awarded'],
            },
          });

          if (existingRecord) {
            continue;
          }
        }

        // 创建获奖记录
        const awardRecord = await TieredRewardRecord.create({
          tieredRewardId: reward.id,
          userId: userId || 0, // 如果没有指定用户，使用0表示系统奖励
          activityId,
          awardValue: reward.rewardValue,
          awardDescription: reward.rewardDescription,
          status: 'awarded',
          awardedAt: new Date(),
          expiryAt: reward.expiryDate,
        });

        // 更新奖励的获奖人数
        await reward.incrementWinners();

        awardedRecords.push(awardRecord);

        // 如果有指定用户，发送通知
        if (userId) {
          await notificationService.createNotification({
            userId,
            type: NotificationType.TIERED_REWARD_AWARDED,
            title: '恭喜获得阶梯奖励',
            content: `您在活动中获得了第${reward.tier}阶梯奖励：${reward.rewardDescription}`,
            data: {
              activityId,
              tieredRewardId: reward.id,
              tier: reward.tier,
              rewardType: reward.rewardType,
              rewardDescription: reward.rewardDescription,
            },
          });
        }

        logger.info('发放阶梯奖励成功', {
          tieredRewardId: reward.id,
          activityId,
          userId,
          tier: reward.tier,
          currentValue,
        });
      }

      return awardedRecords;
    } catch (error) {
      logger.error('检查并发放阶梯奖励失败', error);
      throw error;
    }
  }

  /**
   * 检查报名阶梯奖励
   */
  async checkRegistrationTieredRewards(activityId: number, registrationCount: number): Promise<void> {
    await this.checkAndAwardTieredRewards(activityId, 'registration', registrationCount);
  }

  /**
   * 检查团购阶梯奖励
   */
  async checkGroupBuyTieredRewards(activityId: number, groupBuyId: number): Promise<void> {
    const groupBuy = await GroupBuy.findByPk(groupBuyId);
    if (!groupBuy) {
      return;
    }

    await this.checkAndAwardTieredRewards(
      activityId,
      'group_buy',
      groupBuy.currentPeople,
      groupBuy.groupLeaderId
    );
  }

  /**
   * 检查积攒阶梯奖励
   */
  async checkCollectTieredRewards(activityId: number, collectActivityId: number): Promise<void> {
    const collectActivity = await CollectActivity.findByPk(collectActivityId);
    if (!collectActivity) {
      return;
    }

    await this.checkAndAwardTieredRewards(
      activityId,
      'collect_reward',
      collectActivity.currentCount,
      collectActivity.userId
    );
  }

  /**
   * 获取用户的获奖记录
   */
  async getUserRewardRecords(userId: number, params: {
    activityId?: number;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{
    items: TieredRewardRecord[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    try {
      const { activityId, status, page = 1, pageSize = 20 } = params;

      const where: any = {
        userId,
      };

      if (activityId) {
        where.activityId = activityId;
      }

      if (status) {
        where.status = status;
      }

      const { rows, count } = await TieredRewardRecord.findAndCountAll({
        where,
        include: [
          {
            model: TieredReward,
            attributes: ['id', 'tier', 'rewardType', 'rewardDescription'],
          },
          {
            model: Activity,
            attributes: ['id', 'title'],
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
      logger.error('获取用户获奖记录失败', error);
      throw error;
    }
  }

  /**
   * 使用奖励
   */
  async useReward(recordId: number, userId: number): Promise<void> {
    try {
      const record = await TieredRewardRecord.findByPk(recordId);

      if (!record) {
        throw new Error('获奖记录不存在');
      }

      if (record.userId !== userId) {
        throw new Error('无权操作此获奖记录');
      }

      if (!record.canUse()) {
        throw new Error('奖励不可使用');
      }

      await record.markAsUsed();

      logger.info('使用阶梯奖励成功', {
        recordId,
        userId,
      });
    } catch (error) {
      logger.error('使用阶梯奖励失败', error);
      throw error;
    }
  }

  /**
   * 更新阶梯奖励
   */
  async updateTieredReward(
    tieredRewardId: number,
    updates: Partial<CreateTieredRewardParams>
  ): Promise<TieredReward> {
    try {
      const tieredReward = await TieredReward.findByPk(tieredRewardId);

      if (!tieredReward) {
        throw new Error('阶梯奖励不存在');
      }

      await tieredReward.update(updates);

      logger.info('更新阶梯奖励成功', {
        tieredRewardId,
        updates,
      });

      return tieredReward;
    } catch (error) {
      logger.error('更新阶梯奖励失败', error);
      throw error;
    }
  }

  /**
   * 删除阶梯奖励
   */
  async deleteTieredReward(tieredRewardId: number): Promise<void> {
    try {
      const tieredReward = await TieredReward.findByPk(tieredRewardId);

      if (!tieredReward) {
        throw new Error('阶梯奖励不存在');
      }

      // 检查是否有获奖记录
      const recordCount = await TieredRewardRecord.count({
        where: {
          tieredRewardId,
          status: ['pending', 'awarded'],
        },
      });

      if (recordCount > 0) {
        throw new Error('该阶梯奖励已有获奖记录，无法删除');
      }

      await tieredReward.destroy();

      logger.info('删除阶梯奖励成功', {
        tieredRewardId,
      });
    } catch (error) {
      logger.error('删除阶梯奖励失败', error);
      throw error;
    }
  }

  /**
   * 获取奖励统计
   */
  async getRewardStatistics(activityId: number): Promise<{
    totalRewards: number;
    activeRewards: number;
    totalWinners: number;
    rewardTypes: Record<string, number>;
  }> {
    try {
      const rewards = await TieredReward.findAll({
        where: { activityId },
      });

      const records = await TieredRewardRecord.findAll({
        where: { activityId },
      });

      const totalRewards = rewards.length;
      const activeRewards = rewards.filter(r => r.isActive).length;
      const totalWinners = records.filter(r => r.status === 'awarded').length;

      const rewardTypes: Record<string, number> = {};
      rewards.forEach(reward => {
        rewardTypes[reward.rewardType] = (rewardTypes[reward.rewardType] || 0) + 1;
      });

      return {
        totalRewards,
        activeRewards,
        totalWinners,
        rewardTypes,
      };
    } catch (error) {
      logger.error('获取奖励统计失败', error);
      throw error;
    }
  }
}

export const tieredRewardService = new TieredRewardService();
export default tieredRewardService;