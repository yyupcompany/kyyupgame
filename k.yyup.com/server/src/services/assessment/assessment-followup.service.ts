import { AssessmentRecord } from '../../models/assessment-record.model';
import { Notification } from '../../models/notification.model';
import { NotificationType, NotificationStatus } from '../../models/notification.model';
import { Op } from 'sequelize';
import notificationService from '../system/notification.service';

/**
 * 测评自动跟进服务
 */
export class AssessmentFollowupService {
  /**
   * 测评完成后自动跟进
   */
  async followupAfterAssessment(recordId: number): Promise<void> {
    try {
      const record = await AssessmentRecord.findByPk(recordId, {
        include: [
          { association: 'user' },
          { association: 'parent' }
        ]
      });

      if (!record || record.status !== 'completed') {
        return;
      }

      // 获取家长用户ID
      let parentUserId: number | undefined;
      if (record.parentId) {
        const Parent = require('../../models/parent.model').Parent;
        const parent = await Parent.findByPk(record.parentId, {
          include: [{ association: 'user' }]
        });
        if (parent?.user) {
          parentUserId = parent.user.id;
        }
      } else if (record.userId) {
        parentUserId = record.userId;
      }

      if (!parentUserId) {
        // 如果没有用户ID，可能是匿名测评，稍后通过手机号跟进
        if (record.phone) {
          await this.schedulePhoneFollowup(record);
        }
        return;
      }

      // 发送测评完成通知
      await this.sendAssessmentCompleteNotification(parentUserId, record);

      // 发送成长建议通知（延迟发送）
      setTimeout(() => {
        this.sendGrowthSuggestionNotification(parentUserId!, record).catch(console.error);
      }, 3000);

      // 检查是否需要发送优惠券
      const assessmentCount = await AssessmentRecord.count({
        where: {
          userId: parentUserId,
          status: 'completed'
        }
      });

      // 如果这是第一次完成测评，发送欢迎优惠
      if (assessmentCount === 1) {
        await this.sendWelcomeCoupon(parentUserId, record);
      }

      // 如果已完成3次测评，发送忠诚度优惠
      if (assessmentCount === 3) {
        await this.sendLoyaltyReward(parentUserId, record);
      }

      // 如果距离上次测评超过30天，发送提醒
      const lastAssessment = await AssessmentRecord.findOne({
        where: {
          userId: parentUserId,
          status: 'completed',
          id: { [Op.ne]: recordId }
        },
        order: [['createdAt', 'DESC']]
      });

      if (lastAssessment) {
        const daysSinceLastAssessment = Math.floor(
          (new Date().getTime() - new Date(lastAssessment.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceLastAssessment >= 30) {
          await this.sendAssessmentReminder(parentUserId, record, daysSinceLastAssessment);
        }
      }

    } catch (error) {
      console.error('自动跟进失败:', error);
      // 不抛出错误，避免影响主流程
    }
  }

  /**
   * 发送测评完成通知
   */
  private async sendAssessmentCompleteNotification(userId: number, record: AssessmentRecord): Promise<void> {
    try {
      const dq = record.developmentQuotient || 0;
      const dqLevel = dq >= 130 ? '优秀' : dq >= 115 ? '良好' : dq >= 100 ? '正常' : '需要关注';

      await notificationService.createNotification({
        userId,
        title: '测评完成通知',
        content: `恭喜！您的孩子"${record.childName}"的发育商测评已完成。\n\n发育商：${dq}（${dqLevel}）\n\n点击查看详细报告和成长建议。`,
        type: NotificationType.SYSTEM,
        status: NotificationStatus.UNREAD,
        sourceId: record.id,
        sourceType: 'assessment'
      });
    } catch (error) {
      console.error('发送测评完成通知失败:', error);
    }
  }

  /**
   * 发送成长建议通知
   */
  private async sendGrowthSuggestionNotification(userId: number, record: AssessmentRecord): Promise<void> {
    try {
      const dq = record.developmentQuotient || 0;
      let suggestion = '';

      if (dq >= 130) {
        suggestion = '您的孩子表现优秀！建议继续保持良好的成长环境，可以尝试更具挑战性的活动。';
      } else if (dq >= 115) {
        suggestion = '您的孩子表现良好！建议继续关注孩子的发展，定期进行测评追踪成长。';
      } else if (dq >= 100) {
        suggestion = '您的孩子发育正常。建议关注孩子的优势领域，同时加强薄弱环节的练习。';
      } else {
        suggestion = '建议您关注孩子的成长发展，可以咨询我们的专业老师，获得个性化的成长建议。';
      }

      await notificationService.createNotification({
        userId,
        title: '成长建议',
        content: `根据"${record.childName}"的测评结果，我们为您准备了专业的成长建议：\n\n${suggestion}\n\n点击查看详细报告。`,
        type: NotificationType.MESSAGE,
        status: NotificationStatus.UNREAD,
        sourceId: record.id,
        sourceType: 'assessment'
      });
    } catch (error) {
      console.error('发送成长建议通知失败:', error);
    }
  }

  /**
   * 发送欢迎优惠券
   */
  private async sendWelcomeCoupon(userId: number, record: AssessmentRecord): Promise<void> {
    try {
      await notificationService.createNotification({
        userId,
        title: '🎉 欢迎加入！专属优惠已送达',
        content: `恭喜您完成首次测评！为了感谢您的信任，我们为您准备了专属优惠：\n\n✨ 体验课8折优惠券\n✨ 免费成长咨询一次\n✨ 价值200元的成长礼包\n\n有效期：30天\n\n点击查看详情并领取。`,
        type: NotificationType.MESSAGE,
        status: NotificationStatus.UNREAD,
        sourceId: record.id,
        sourceType: 'coupon'
      });
    } catch (error) {
      console.error('发送欢迎优惠券失败:', error);
    }
  }

  /**
   * 发送忠诚度奖励
   */
  private async sendLoyaltyReward(userId: number, record: AssessmentRecord): Promise<void> {
    try {
      await notificationService.createNotification({
        userId,
        title: '🎁 忠诚用户专属奖励',
        content: `感谢您对我们的信任！您已完成3次测评，我们为您准备了专属奖励：\n\n🎁 免费专业成长报告\n🎁 一对一成长咨询（价值500元）\n🎁 优先参与线下活动\n\n点击查看详情。`,
        type: NotificationType.MESSAGE,
        status: NotificationStatus.UNREAD,
        sourceId: record.id,
        sourceType: 'reward'
      });
    } catch (error) {
      console.error('发送忠诚度奖励失败:', error);
    }
  }

  /**
   * 发送测评提醒
   */
  private async sendAssessmentReminder(
    userId: number,
    record: AssessmentRecord,
    daysSinceLastAssessment: number
  ): Promise<void> {
    try {
      await notificationService.createNotification({
        userId,
        title: '📊 该做新的测评了',
        content: `距离"${record.childName}"上次测评已经过去${daysSinceLastAssessment}天了。\n\n定期测评可以更好地追踪孩子的成长轨迹，发现变化和进步。\n\n现在预约测评，享受专属优惠！`,
        type: NotificationType.SYSTEM,
        status: NotificationStatus.UNREAD,
        sourceId: record.id,
        sourceType: 'assessment'
      });
    } catch (error) {
      console.error('发送测评提醒失败:', error);
    }
  }

  /**
   * 安排手机号跟进（用于匿名测评）
   */
  private async schedulePhoneFollowup(record: AssessmentRecord): Promise<void> {
    try {
      // 这里可以集成短信服务或第三方跟进系统
      // 暂时记录到日志，后续可以扩展
      console.log(`安排手机号跟进: ${record.phone}, 记录ID: ${record.id}`);
      
      // TODO: 实现短信发送或集成CRM系统
    } catch (error) {
      console.error('安排手机号跟进失败:', error);
    }
  }

  /**
   * 批量跟进（定时任务）
   */
  async batchFollowup(): Promise<void> {
    try {
      // 查找30天前完成测评但未再次测评的用户
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const records = await AssessmentRecord.findAll({
        where: {
          status: 'completed',
          createdAt: {
            [Op.between]: [thirtyDaysAgo, new Date()]
          },
          userId: { [Op.ne]: null }
        },
        include: [
          { association: 'user' }
        ]
      });

      for (const record of records) {
        if (!record.userId) continue;

        // 检查是否已有新的测评
        const hasNewAssessment = await AssessmentRecord.findOne({
          where: {
            userId: record.userId,
            status: 'completed',
            id: { [Op.ne]: record.id },
            createdAt: { [Op.gt]: record.createdAt }
          }
        });

        if (!hasNewAssessment) {
          // 发送提醒
          await this.sendAssessmentReminder(
            record.userId,
            record,
            30
          );
        }
      }
    } catch (error) {
      console.error('批量跟进失败:', error);
    }
  }
}

export default new AssessmentFollowupService();

