import { Op } from 'sequelize';
import { TeacherReward, TeacherRewardStatus, TeacherRewardType } from '../models/index';
import { User } from '../models/index';

console.log('[DEBUG] TeacherRewardService module loaded. TeacherReward:', TeacherReward?.name);

/**
 * 教师奖励服务
 */
export class TeacherRewardService {

  /**
   * 获取教师奖励列表和统计信息
   */
  static async getRewardsList(params: {
    teacherId: number;
    status?: string;
    type?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    try {
      console.log('[TeacherRewardService] 开始获取奖励列表, params:', JSON.stringify(params));

      const {
        teacherId,
        status,
        type,
        page = 1,
        pageSize = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = params;

      const where: any = { teacherId };

      if (status) {
        where.status = status;
      }

      if (type) {
        where.type = type;
      }

      console.log('[TeacherRewardService] 查询条件:', where);

      // Convert camelCase to snake_case for database columns
      const sortByMapping: { [key: string]: string } = {
        'createdAt': 'created_at',
        'updatedAt': 'updated_at',
        'expiryDate': 'expiry_date',
        'usedAt': 'used_at'
      };

      const dbSortBy = sortByMapping[sortBy] || sortBy;

      const { count, rows } = await TeacherReward.findAndCountAll({
        where,
        order: [[dbSortBy, sortOrder.toUpperCase()]],
        limit: pageSize,
        offset: (page - 1) * pageSize
      });

      console.log('[TeacherRewardService] 查询结果:', { count, rowsLength: rows?.length });

      // 获取统计信息
      console.log('[TeacherRewardService] 开始获取统计信息...');
      const stats = await this.getRewardStats(teacherId);

      console.log('[TeacherRewardService] 统计信息:', stats);

      return {
        list: rows,
        total: count,
        page,
        pageSize,
        stats
      };
    } catch (error) {
      console.error('[TeacherRewardService] 获取奖励列表时出错:', error);
      throw error;
    }
  }

  /**
   * 获取奖励统计信息
   */
  static async getRewardStats(teacherId: number) {
    try {
      console.log('[TeacherRewardService] 开始获取奖励统计, teacherId:', teacherId);

      const [available, used, expired] = await Promise.all([
        TeacherReward.count({ where: { teacherId, status: TeacherRewardStatus.AVAILABLE } }),
        TeacherReward.count({ where: { teacherId, status: TeacherRewardStatus.USED } }),
        TeacherReward.count({ where: { teacherId, status: TeacherRewardStatus.EXPIRED } })
      ]);

      console.log('[TeacherRewardService] 奖励数量统计:', { available, used, expired });

      const total = available + used + expired;

      // 计算价值统计
      console.log('[TeacherRewardService] 开始查询奖励价值...');
      const rewards = await TeacherReward.findAll({
        where: { teacherId },
        attributes: ['status', 'value']
      });

      console.log('[TeacherRewardService] 查询到奖励记录数:', rewards?.length || 0);

      let totalValue = 0;
      let availableValue = 0;
      let usedValue = 0;

      if (rewards && Array.isArray(rewards)) {
        rewards.forEach(reward => {
          // 安全处理：确保reward和reward.value存在
          if (reward && reward.value !== null && reward.value !== undefined) {
            const value = Number(reward.value) || 0;
            totalValue += value;

            if (reward.status === TeacherRewardStatus.AVAILABLE) {
              availableValue += value;
            } else if (reward.status === TeacherRewardStatus.USED) {
              usedValue += value;
            }
          }
        });
      }

      return {
        availableRewards: available,
        usedRewards: used,
        expiredRewards: expired,
        totalRewards: total,
        totalValue,
        availableValue,
        usedValue
      };
    } catch (error) {
      console.error('[TeacherRewardService] 获取奖励统计时出错:', error);
      throw error;
    }
  }

  /**
   * 获取单个奖励详情
   */
  static async getRewardDetail(id: number, teacherId: number) {
    const reward = await TeacherReward.findOne({
      where: { id, teacherId }
    });

    if (!reward) {
      throw new Error('奖励不存在');
    }

    return reward;
  }

  /**
   * 使用代金券
   */
  static async useVoucher(id: number, teacherId: number, params: {
    useLocation: string;
    notes?: string;
  }) {
    const reward = await TeacherReward.findOne({
      where: { id, teacherId }
    });

    if (!reward) {
      throw new Error('奖励不存在');
    }

    if (!reward.isAvailable()) {
      throw new Error('奖励不可用');
    }

    await reward.update({
      status: TeacherRewardStatus.USED,
      usedAt: new Date(),
      usedBy: teacherId,
      usageLocation: params.useLocation,
      usageNotes: params.notes
    });

    return { success: true, message: '使用成功' };
  }

  /**
   * 获取转介绍分享带来的线索信息
   */
  static async getReferralLeads(rewardId: number, teacherId: number) {
    const reward = await TeacherReward.findOne({
      where: { id: rewardId, teacherId }
    });

    if (!reward) {
      throw new Error('奖励不存在');
    }

    // 这里需要关联查询转介绍线索，暂时返回空数组
    return [];
  }

  /**
   * 获取教师转介绍统计数据
   */
  static async getReferralStats(teacherId: number) {
    // 暂时返回默认值
    return {
      totalReferrals: 0,
      convertedReferrals: 0,
      pendingReferrals: 0,
      totalRewards: 0,
      conversionRate: 0,
      monthlyStats: []
    };
  }
}

export default TeacherRewardService;
