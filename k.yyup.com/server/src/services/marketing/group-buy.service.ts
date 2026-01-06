import { NotificationType } from '../../models/notification.model';
/**
 * 团购服务
 * 处理开团、参团、成团等团购业务逻辑
 */

import { Op } from 'sequelize';
import { GroupBuy, GroupBuyMember } from '../../models';
import { Activity } from '../../models/activity.model';
import { User } from '../../models/user.model';
import { logger } from '../../utils/logger';
import { generateGroupCode } from '../../utils/code-generator';
import notificationService from '../system/notification.service';

export interface CreateGroupBuyParams {
  activityId: number;
  groupLeaderId: number;
  targetPeople?: number;
  maxPeople?: number;
  groupPrice?: number;
  deadlineHours?: number;
}

export interface JoinGroupBuyParams {
  groupBuyId: number;
  userId: number;
  inviteCode?: string;
  inviterId?: number;
}

export interface GroupBuyListParams {
  activityId?: number;
  userId?: number;
  status?: string;
  page?: number;
  pageSize?: number;
}

export class GroupBuyService {
  /**
   * 创建团购（开团）
   */
  async createGroupBuy(params: CreateGroupBuyParams): Promise<GroupBuy> {
    try {
      const { activityId, groupLeaderId, targetPeople = 2, maxPeople = 50, deadlineHours = 24 } = params;

      // 检查活动是否存在且支持团购
      const activity = await Activity.findByPk(activityId);
      if (!activity) {
        throw new Error('活动不存在');
      }

      const marketingConfig = activity.marketingConfig || {};
      const groupBuyConfig = marketingConfig.groupBuy || {};

      if (!groupBuyConfig.enabled) {
        throw new Error('该活动不支持团购');
      }

      // 检查用户是否已经为该活动开过团
      const existingGroupBuy = await GroupBuy.findOne({
        where: {
          activityId,
          groupLeaderId,
          status: ['pending', 'in_progress'],
        },
      });

      if (existingGroupBuy) {
        throw new Error('您已经为该活动开过团购了');
      }

      // 创建团购
      const groupPrice = params.groupPrice || groupBuyConfig.price;
      const deadline = new Date(Date.now() + (deadlineHours || groupBuyConfig.deadlineHours || 24) * 60 * 60 * 1000);

      const groupBuy = await GroupBuy.create({
        activityId,
        groupLeaderId,
        groupCode: generateGroupCode(),
        targetPeople: groupBuyConfig.minPeople || targetPeople,
        currentPeople: 1, // 开团者自动成为第一个成员
        maxPeople: groupBuyConfig.maxPeople || maxPeople,
        groupPrice,
        originalPrice: groupBuyConfig.originalPrice || 0,
        deadline,
        status: 'in_progress',
      });

      // 自动创建开团者成员记录
      await GroupBuyMember.create({
        groupBuyId: groupBuy.id,
        userId: groupLeaderId,
        status: 'confirmed',
        paymentStatus: 'unpaid', // 开团者也需要支付
        paymentAmount: groupPrice,
      });

      // 发送开团通知
      await notificationService.createNotification({
        userId: groupLeaderId,
        type: NotificationType.GROUP_BUY_CREATED,
        title: '开团成功',
        content: `您已成功创建团购，团购码：${groupBuy.groupCode}`,
        data: {
          groupBuyId: groupBuy.id,
          groupCode: groupBuy.groupCode,
        },
      });

      logger.info('团购创建成功', {
        groupBuyId: groupBuy.id,
        activityId,
        groupLeaderId,
        groupCode: groupBuy.groupCode,
      });

      return groupBuy;
    } catch (error) {
      logger.error('创建团购失败', error);
      throw error;
    }
  }

  /**
   * 参与团购
   */
  async joinGroupBuy(params: JoinGroupBuyParams): Promise<GroupBuyMember> {
    try {
      const { groupBuyId, userId, inviteCode, inviterId } = params;

      // 检查团购是否存在且可以参与
      const groupBuy = await GroupBuy.findByPk(groupBuyId);
      if (!groupBuy) {
        throw new Error('团购不存在');
      }

      if (!groupBuy.canJoin()) {
        throw new Error('团购不可参与');
      }

      // 检查用户是否已经参与过该团购
      const existingMember = await GroupBuyMember.findOne({
        where: {
          groupBuyId,
          userId,
        },
      });

      if (existingMember) {
        throw new Error('您已经参与过该团购');
      }

      // 创建参团记录
      const member = await GroupBuyMember.create({
        groupBuyId,
        userId,
        status: 'pending',
        paymentStatus: 'unpaid',
        paymentAmount: groupBuy.groupPrice,
        inviteCode,
        inviterId,
      });

      // 更新团购人数
      await GroupBuy.update(
        {
          currentPeople: groupBuy.currentPeople + 1,
        },
        {
          where: { id: groupBuyId },
        }
      );

      // 检查是否达到成团人数
      if (groupBuy.currentPeople + 1 >= groupBuy.targetPeople) {
        await this.completeGroupBuy(groupBuyId);
      }

      // 发送参团通知
      await notificationService.createNotification({
        userId,
        type: NotificationType.GROUP_BUY_JOINED,
        title: '参团成功',
        content: `您已成功参与团购，团购码：${groupBuy.groupCode}`,
        data: {
          groupBuyId,
          groupCode: groupBuy.groupCode,
        },
      });

      logger.info('参团成功', {
        groupBuyId,
        userId,
        groupCode: groupBuy.groupCode,
      });

      return member;
    } catch (error) {
      logger.error('参团失败', error);
      throw error;
    }
  }

  /**
   * 完成团购（成团）
   */
  async completeGroupBuy(groupBuyId: number): Promise<void> {
    try {
      const groupBuy = await GroupBuy.findByPk(groupBuyId);
      if (!groupBuy) {
        return;
      }

      if (groupBuy.status === 'completed') {
        return;
      }

      // 更新团购状态为已完成
      await GroupBuy.update(
        {
          status: 'completed',
        },
        {
          where: { id: groupBuyId },
        }
      );

      // 更新所有成员状态为已确认
      await GroupBuyMember.update(
        {
          status: 'confirmed',
        },
        {
          where: {
            groupBuyId,
            status: 'pending',
          },
        }
      );

      // 发送成团通知给所有成员
      const members = await GroupBuyMember.findAll({
        where: { groupBuyId },
      });

      for (const member of members) {
        await notificationService.createNotification({
          userId: member.userId,
          type: NotificationType.GROUP_BUY_COMPLETED,
          title: '团购成团成功',
          content: `恭喜！团购 ${groupBuy.groupCode} 已成功成团`,
          data: {
            groupBuyId,
            groupCode: groupBuy.groupCode,
            discount: groupBuy.originalPrice - groupBuy.groupPrice,
          },
        });
      }

      logger.info('团购成功完成', {
        groupBuyId,
        groupCode: groupBuy.groupCode,
        memberCount: members.length,
      });
    } catch (error) {
      logger.error('完成团购失败', error);
      throw error;
    }
  }

  /**
   * 获取团购列表
   */
  async getGroupBuyList(params: GroupBuyListParams): Promise<{
    items: GroupBuy[];
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
        where.groupLeaderId = userId;
      }

      if (status) {
        where.status = status;
      }

      const { rows, count } = await GroupBuy.findAndCountAll({
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
      logger.error('获取团购列表失败', error);
      throw error;
    }
  }

  /**
   * 获取团购详情
   */
  async getGroupBuyDetail(groupBuyId: number): Promise<any> {
    try {
      const groupBuy = await GroupBuy.findByPk(groupBuyId, {
        include: [
          {
            model: Activity,
            attributes: ['id', 'title', 'description', 'startTime', 'endTime'],
          },
          {
            model: GroupBuyMember,
            include: [
              {
                model: User,
                attributes: ['id', 'name', 'phone', 'avatar'],
              },
            ],
          },
        ],
      });

      if (!groupBuy) {
        throw new Error('团购不存在');
      }

      return groupBuy;
    } catch (error) {
      logger.error('获取团购详情失败', error);
      throw error;
    }
  }

  /**
   * 检查并更新过期团购
   */
  async checkExpiredGroupBuys(): Promise<void> {
    try {
      const expiredGroupBuys = await GroupBuy.findAll({
        where: {
          status: 'in_progress',
          deadline: {
            [Op.lt]: new Date(),
          },
        },
      });

      for (const groupBuy of expiredGroupBuys) {
        await GroupBuy.update(
          {
            status: 'expired',
          },
          {
            where: { id: groupBuy.id },
          }
        );

        // 退还已支付用户的款项
        const paidMembers = await GroupBuyMember.findAll({
          where: {
            groupBuyId: groupBuy.id,
            paymentStatus: 'paid',
          },
        });

        for (const member of paidMembers) {
          await this.refundMember(member.id, member.paymentAmount);
        }

        // 发送团购过期通知
        const allMembers = await GroupBuyMember.findAll({
          where: { groupBuyId: groupBuy.id },
        });

        for (const member of allMembers) {
          await notificationService.createNotification({
            userId: member.userId,
            type: NotificationType.GROUP_BUY_EXPIRED,
            title: '团购已过期',
            content: `团购 ${groupBuy.groupCode} 因未达到成团人数已过期`,
            data: {
              groupBuyId: groupBuy.id,
              groupCode: groupBuy.groupCode,
            },
          });
        }
      }

      logger.info('检查过期团购完成', {
        expiredCount: expiredGroupBuys.length,
      });
    } catch (error) {
      logger.error('检查过期团购失败', error);
    }
  }

  /**
   * 退款成员
   */
  private async refundMember(memberId: number, amount: number): Promise<void> {
    try {
      await GroupBuyMember.update(
        {
          paymentStatus: 'refunded',
          refundAmount: amount,
          refundTime: new Date(),
        },
        {
          where: { id: memberId },
        }
      );

      // TODO: 集成实际支付退款逻辑
      logger.info('成员退款成功', {
        memberId,
        amount,
      });
    } catch (error) {
      logger.error('成员退款失败', error);
    }
  }

  /**
   * 增加团购浏览次数
   */
  async incrementViewCount(groupBuyId: number): Promise<void> {
    try {
      await GroupBuy.increment('viewCount', {
        where: { id: groupBuyId },
      });
    } catch (error) {
      logger.error('增加团购浏览次数失败', error);
    }
  }

  /**
   * 增加团购分享次数
   */
  async incrementShareCount(groupBuyId: number): Promise<void> {
    try {
      await GroupBuy.increment('shareCount', {
        where: { id: groupBuyId },
      });
    } catch (error) {
      logger.error('增加团购分享次数失败', error);
    }
  }
}

export const groupBuyService = new GroupBuyService();
export default groupBuyService;