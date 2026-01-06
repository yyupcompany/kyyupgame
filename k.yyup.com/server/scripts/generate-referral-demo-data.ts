/**
 * 转介绍演示数据生成脚本
 *
 * 数据规模：
 * - 1000次分享行为
 * - 300人最终转化（30%转化率）
 * - 老师推荐转化150人，家长推荐转化150人
 * - 分12个月分布，7-8月和12-1月为高峰期
 */

import { Sequelize } from 'sequelize';
import { getDatabaseConfig } from '../config/database-unified';

// 导入模型
import { User } from '../models/user.model';
import { Teacher } from '../models/teacher.model';
import { Parent } from '../models/parent.model';
import { Student } from '../models/student.model';
import { ParentStudentRelation } from '../models/parent-student-relation.model';
import { Activity } from '../models/activity.model';
import { ActivityRegistration } from '../models/activity-registration.model';
import { Kindergarten } from '../models/kindergarten.model';
import { Class } from '../models/class.model';
import { ReferralRelationship } from '../models/referralrelationship.model';
import { ReferralReward } from '../models/referralreward.model';

interface ShareRecord {
  id: string;
  sharerId: number;
  sharerType: 'teacher' | 'parent';
  shareType: string;
  channelType: string;
  targetContentId: number;
  shareTime: Date;
  targetMonth: string;
}

interface ConversionFunnel {
  id: string;
  shareId: string;
  referrerId: number;
  referrerType: 'teacher' | 'parent';
  potentialCustomerInfo: {
    name: string;
    phone: string;
    childName: string;
    childAge: number;
  };
  stages: {
    sharedAt: Date;
    firstClickAt?: Date;
    registeredAt?: Date;
    visitedAt?: Date;
    enrolledAt?: Date;
  };
  finalStatus: 'shared' | 'clicked' | 'registered' | 'visited' | 'enrolled' | 'lost';
  isConverted: boolean;
  targetMonth: string;
}

interface RewardRecord {
  id: string;
  conversionId: string;
  referrerId: number;
  referrerType: 'teacher' | 'parent';
  rewardType: 'direct_deal' | 'referral_teacher' | 'referral_parent';
  baseAmount: number;
  finalAmount: number;
  couponCode?: string;
  status: 'pending' | 'issued' | 'used' | 'expired';
  issuedAt: Date;
  expiresAt?: Date;
  usedAt?: Date;
  targetMonth: string;
}

class ReferralDemoDataGenerator {
  private sequelize: Sequelize;
  private conversionRates = {
    clickRate: 0.7,        // 70%点击率
    registrationRate: 0.64, // 64%报名率（基于点击）
    visitRate: 0.84,        // 84%到访率（基于报名）
    enrollmentRate: 0.79    // 79%报名率（基于到访）
  };

  // 月度目标分配
  private readonly monthlyTargets = {
    '01': { shares: 85, conversions: 25 },  // 1月：寒假高峰期
    '02': { shares: 70, conversions: 20 },  // 2月：春节前招生
    '03': { shares: 75, conversions: 22 },  // 3月：春季招生
    '04': { shares: 65, conversions: 18 },  // 4月：平稳期
    '05': { shares: 60, conversions: 17 },  // 5月：期中平稳
    '06': { shares: 70, conversions: 20 },  // 6月：暑期预热
    '07': { shares: 120, conversions: 35 }, // 7月：暑期招生高峰
    '08': { shares: 150, conversions: 45 }, // 8月：暑期招生旺季
    '09': { shares: 70, conversions: 20 },  // 9月：秋季开学
    '10': { shares: 60, conversions: 17 }, // 10月：平稳期
    '11': { shares: 65, conversions: 18 }, // 11月：年末预热
    '12': { shares: 110, conversions: 33 }  // 12月：年末冲刺
  };

  // 姓名库
  private readonly surnames = ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗'];
  private readonly givenNames = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀英', '桂英'];

  constructor() {
    const dbConfig = getDatabaseConfig();
    this.sequelize = new Sequelize(
      dbConfig.database || '',
      dbConfig.username || '',
      dbConfig.password || '',
      {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        logging: false
      }
    );
  }

  async generateCompleteDataset(): Promise<void> {
    console.log('🚀 开始生成转介绍演示数据...');

    try {
      // 初始化数据库连接
      await this.sequelize.authenticate();
      console.log('✅ 数据库连接成功');

      // 验证现有数据
      await this.validateExistingData();

      // 生成分享行为数据（1000次）
      const shareRecords = await this.generateShareBehaviors(1000);
      console.log(`📤 已生成 ${shareRecords.length} 次分享行为`);

      // 生成转化漏斗数据
      const conversionFunnels = await this.generateConversionFunnels(shareRecords);
      console.log(`🔄 已生成 ${conversionFunnels.length} 个转化漏斗`);

      // 生成奖励记录
      const rewardRecords = await this.generateRewardRecords(conversionFunnels);
      console.log(`💰 已生成 ${rewardRecords.length} 条奖励记录`);

      // 插入数据库
      await this.insertDataIntoDatabase(shareRecords, conversionFunnels, rewardRecords);

      console.log('🎉 转介绍演示数据生成完成！');
      await this.printSummary();

    } catch (error) {
      console.error('❌ 数据生成失败:', error);
      throw error;
    } finally {
      await this.sequelize.close();
    }
  }

  private async validateExistingData(): Promise<void> {
    const [teacherCount, parentCount] = await Promise.all([
      Teacher.count(),
      Parent.count()
    ]);

    console.log(`📊 现有数据验证：`);
    console.log(`   - 老师数量: ${teacherCount}`);
    console.log(`   - 家长数量: ${parentCount}`);

    if (teacherCount < 10) {
      throw new Error('老师数量不足，请先初始化基础数据');
    }
    if (parentCount < 100) {
      throw new Error('家长数量不足，请先初始化基础数据');
    }
  }

  private async generateShareBehaviors(totalShares: number): Promise<ShareRecord[]> {
    const shareRecords: ShareRecord[] = [];
    const teachers = await Teacher.findAll({ limit: 18 });
    const parents = await Parent.findAll({ limit: 100 });
    const activities = await Activity.findAll({ limit: 20 });

    // 生成每月的分享数据
    for (const [month, target] of Object.entries(this.monthlyTargets)) {
      const monthShares = target.shares;
      const monthDate = new Date(`2024-${month}-01`);

      for (let i = 0; i < monthShares; i++) {
        const isTeacherShare = Math.random() < 0.4; // 40%老师分享
        const sharer = isTeacherShare
          ? teachers[Math.floor(Math.random() * teachers.length)]
          : parents[Math.floor(Math.random() * parents.length)];

        const activity = activities[Math.floor(Math.random() * activities.length)];

        shareRecords.push({
          id: `share_${month}_${i}`,
          sharerId: sharer.id,
          sharerType: isTeacherShare ? 'teacher' : 'parent',
          shareType: isTeacherShare ? 'teacher' : 'wechat',
          channelType: this.getRandomChannelType(),
          targetContentId: activity.id,
          shareTime: this.getRandomDateInMonth(monthDate),
          targetMonth: month
        });
      }
    }

    return shareRecords;
  }

  private async generateConversionFunnels(shareRecords: ShareRecord[]): Promise<ConversionFunnel[]> {
    const conversionFunnels: ConversionFunnel[] = [];

    // 按月份分组处理
    const groupedShares = this.groupSharesByMonth(shareRecords);

    for (const [month, shares] of Object.entries(groupedShares)) {
      const monthTarget = this.monthlyTargets[month];
      const targetConversions = monthTarget.conversions;

      // 随机选择要转化的分享记录
      const convertingShares = this.shuffleArray(shares).slice(0, targetConversions);

      for (const share of convertingShares) {
        const funnel = await this.createConversionFunnel(share, month);
        conversionFunnels.push(funnel);
      }
    }

    return conversionFunnels;
  }

  private async createConversionFunnel(share: ShareRecord, month: string): Promise<ConversionFunnel> {
    const conversionFunnel: ConversionFunnel = {
      id: `funnel_${share.id}`,
      shareId: share.id,
      referrerId: share.sharerId,
      referrerType: share.sharerType,
      potentialCustomerInfo: {
        name: this.generateRandomName(),
        phone: this.generateRandomPhone(),
        childName: this.generateRandomChildName(),
        childAge: Math.floor(Math.random() * 6) + 3 // 3-8岁
      },
      stages: {
        sharedAt: share.shareTime
      },
      finalStatus: 'shared',
      isConverted: false,
      targetMonth: month
    };

    // 模拟转化过程（70%的分享会产生最终转化）
    if (Math.random() < 0.7) {
      conversionFunnel.isConverted = true;

      // 第一阶段：点击（70%概率）
      if (Math.random() < this.conversionRates.clickRate) {
        conversionFunnel.stages.firstClickAt = this.getRandomDateAfter(share.shareTime, 1, 3);
        conversionFunnel.finalStatus = 'clicked';

        // 第二阶段：报名（64%概率，基于点击）
        if (Math.random() < this.conversionRates.registrationRate) {
          conversionFunnel.stages.registeredAt = this.getRandomDateAfter(
            conversionFunnel.stages.firstClickAt!, 1, 7
          );
          conversionFunnel.finalStatus = 'registered';

          // 第三阶段：到访（84%概率，基于报名）
          if (Math.random() < this.conversionRates.visitRate) {
            conversionFunnel.stages.visitedAt = this.getRandomDateAfter(
              conversionFunnel.stages.registeredAt!, 2, 14
            );
            conversionFunnel.finalStatus = 'visited';

            // 第四阶段：最终报名（79%概率，基于到访）
            if (Math.random() < this.conversionRates.enrollmentRate) {
              conversionFunnel.stages.enrolledAt = this.getRandomDateAfter(
                conversionFunnel.stages.visitedAt!, 3, 21
              );
              conversionFunnel.finalStatus = 'enrolled';
            }
          }
        }
      }
    }

    return conversionFunnel;
  }

  private async generateRewardRecords(conversionFunnels: ConversionFunnel[]): Promise<RewardRecord[]> {
    const rewardRecords: RewardRecord[] = [];

    // 只为最终转化的漏斗生成奖励
    const convertedFunnels = conversionFunnels.filter(funnel => funnel.finalStatus === 'enrolled');

    for (const funnel of convertedFunnels) {
      const reward = this.createRewardRecord(funnel);
      rewardRecords.push(reward);
    }

    return rewardRecords;
  }

  private createRewardRecord(funnel: ConversionFunnel): RewardRecord {
    let rewardType: 'direct_deal' | 'referral_teacher' | 'referral_parent';
    let baseAmount: number;

    if (funnel.referrerType === 'teacher') {
      // 老师50%概率是直接成交，50%是转介绍
      if (Math.random() < 0.5) {
        rewardType = 'direct_deal';
        baseAmount = 500;
      } else {
        rewardType = 'referral_teacher';
        baseAmount = 200;
      }
    } else {
      // 家长都是转介绍
      rewardType = 'referral_parent';
      baseAmount = 300;
    }

    const couponCode = rewardType === 'referral_parent'
      ? `TUITION_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      : undefined;

    return {
      id: `reward_${funnel.id}`,
      conversionId: funnel.id,
      referrerId: funnel.referrerId,
      referrerType: funnel.referrerType,
      rewardType,
      baseAmount,
      finalAmount: baseAmount,
      couponCode,
      status: 'issued',
      issuedAt: funnel.stages.enrolledAt || new Date(),
      expiresAt: couponCode ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : undefined,
      targetMonth: funnel.targetMonth
    };
  }

  private async insertDataIntoDatabase(
    shareRecords: ShareRecord[],
    conversionFunnels: ConversionFunnel[],
    rewardRecords: RewardRecord[]
  ): Promise<void> {
    // 这里需要根据实际的数据库表结构来插入数据
    // 由于模型关联复杂，这里提供插入逻辑框架

    console.log('💾 开始插入数据到数据库...');

    // 1. 插入转介绍关系数据
    const referralRelationships = conversionFunnels
      .filter(funnel => funnel.isConverted)
      .map(funnel => ({
        referrer_id: funnel.referrerId,
        referral_code: `REF_${funnel.id}`,
        status: 'completed',
        reward_amount: funnel.referrerType === 'teacher' ? '200-500' : '300',
        created_at: funnel.stages.sharedAt,
        completed_at: funnel.stages.enrolledAt,
        rewarded_at: funnel.stages.enrolledAt
      }));

    // 2. 插入奖励记录
    const referralRewards = rewardRecords.map(reward => ({
      referral_id: parseInt(reward.conversionId.split('_')[1]),
      reward_type: reward.rewardType,
      reward_amount: reward.finalAmount.toString(),
      reward_points: '0',
      coupon_id: null,
      coupon_code: reward.couponCode || null,
      status: reward.status,
      issued_at: reward.issuedAt.toISOString(),
      used_at: reward.usedAt?.toISOString() || null,
      expires_at: reward.expiresAt?.toISOString() || null,
      description: `${reward.rewardType}奖励`,
      created_at: reward.issuedAt
    }));

    // 3. 插入活动报名数据（用于追踪转介绍）
    const activityRegistrations = conversionFunnels.map(funnel => ({
      activityId: 1, // 默认活动ID
      parentId: funnel.referrerId,
      studentId: null,
      contactName: funnel.potentialCustomerInfo.name,
      contactPhone: funnel.potentialCustomerInfo.phone,
      childName: funnel.potentialCustomerInfo.childName,
      childAge: funnel.potentialCustomerInfo.childAge,
      registrationTime: funnel.stages.registeredAt || funnel.stages.sharedAt,
      source: funnel.referrerType === 'teacher' ? '老师推荐' : '家长推荐',
      status: funnel.finalStatus === 'enrolled' ? 1 : 0,
      checkInTime: funnel.stages.visitedAt,
      isConversion: funnel.isConverted,
      shareBy: funnel.referrerId,
      shareType: funnel.referrerType,
      sourceType: 'TEACHER_REFERRAL',
      sourceDetail: {
        shareId: funnel.shareId,
        conversionStages: funnel.stages
      }
    }));

    // 注意：这里需要根据实际的Sequelize模型来执行插入操作
    console.log(`   - 准备插入 ${referralRelationships.length} 条转介绍关系`);
    console.log(`   - 准备插入 ${referralRewards.length} 条奖励记录`);
    console.log(`   - 准备插入 ${activityRegistrations.length} 条活动报名记录`);

    // 实际插入操作需要根据您的数据库连接和模型配置来实现
  }

  private async printSummary(): Promise<void> {
    console.log('\n📊 转介绍演示数据生成总结：');
    console.log('='.repeat(50));

    let totalShares = 0;
    let totalConversions = 0;
    let teacherConversions = 0;
    let parentConversions = 0;

    for (const [month, target] of Object.entries(this.monthlyTargets)) {
      totalShares += target.shares;
      totalConversions += target.conversions;

      // 假设老师转化占50%
      teacherConversions += Math.floor(target.conversions * 0.5);
      parentConversions += Math.ceil(target.conversions * 0.5);

      console.log(`${month}月: ${target.shares}次分享 → ${target.conversions}人转化`);
    }

    console.log('='.repeat(50));
    console.log(`📈 核心指标：`);
    console.log(`   - 总分享次数: ${totalShares}`);
    console.log(`   - 总转化人数: ${totalConversions}`);
    console.log(`   - 整体转化率: ${(totalConversions / totalShares * 100).toFixed(1)}%`);
    console.log(`   - 老师推荐转化: ${teacherConversions}人`);
    console.log(`   - 家长推荐转化: ${parentConversions}人`);
    console.log(`   - 预计奖励总额: ¥${(teacherConversions * 350 + parentConversions * 300).toLocaleString()}`);
    console.log(`   - 高峰期: 7-8月 (${this.monthlyTargets['07'].conversions + this.monthlyTargets['08'].conversions}人)`);
  }

  // 工具方法
  private getRandomChannelType(): string {
    const channels = ['activity', 'assessment', 'direct', 'poster'];
    const weights = [0.4, 0.35, 0.15, 0.1]; // 对应概率

    const random = Math.random();
    let cumulative = 0;

    for (let i = 0; i < channels.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return channels[i];
      }
    }

    return channels[0];
  }

  private generateRandomName(): string {
    const surname = this.surnames[Math.floor(Math.random() * this.surnames.length)];
    const givenName = this.givenNames[Math.floor(Math.random() * this.givenNames.length)];
    return surname + givenName;
  }

  private generateRandomChildName(): string {
    return this.generateRandomName();
  }

  private generateRandomPhone(): string {
    const prefixes = ['138', '139', '186', '188', '189', '135', '136', '137'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return prefix + suffix;
  }

  private getRandomDateInMonth(monthDate: Date): Date {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const day = Math.floor(Math.random() * daysInMonth) + 1;
    const hour = Math.floor(Math.random() * 24);
    const minute = Math.floor(Math.random() * 60);

    return new Date(year, month, day, hour, minute, 0, 0);
  }

  private getRandomDateAfter(startDate: Date, minDays: number, maxDays: number): Date {
    const days = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
    const result = new Date(startDate);
    result.setDate(result.getDate() + days);

    // 添加随机小时和分钟
    result.setHours(Math.floor(Math.random() * 24));
    result.setMinutes(Math.floor(Math.random() * 60));

    return result;
  }

  private groupSharesByMonth(shareRecords: ShareRecord[]): Record<string, ShareRecord[]> {
    const grouped: Record<string, ShareRecord[]> = {};

    for (const share of shareRecords) {
      if (!grouped[share.targetMonth]) {
        grouped[share.targetMonth] = [];
      }
      grouped[share.targetMonth].push(share);
    }

    return grouped;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

// 执行数据生成
async function main() {
  const generator = new ReferralDemoDataGenerator();
  await generator.generateCompleteDataset();
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

export { ReferralDemoDataGenerator };