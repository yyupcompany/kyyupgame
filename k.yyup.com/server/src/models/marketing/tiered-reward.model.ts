/**
 * 阶梯奖励模型
 * 用于管理活动的阶梯奖励机制
 */

import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface TieredRewardAttributes {
  id: number;
  activityId: number; // 活动ID
  type: 'registration' | 'group_buy' | 'collect_reward' | 'referral'; // 奖励类型
  tier: number; // 阶梯层级，从1开始
  targetValue: number; // 达到目标值（人数、金额等）
  rewardType: 'discount' | 'gift' | 'cashback' | 'points' | 'free'; // 奖励类型
  rewardValue: string; // 奖励值（JSON格式，存储具体奖励内容）
  rewardDescription: string; // 奖励描述
  isActive: boolean; // 是否启用
  maxWinners?: number; // 最大获奖人数限制
  currentWinners: number; // 当前获奖人数
  expiryDate?: Date; // 奖励过期时间
  createdAt: Date;
  updatedAt: Date;
}

export interface TieredRewardCreationAttributes extends Optional<TieredRewardAttributes, 'id' | 'maxWinners' | 'currentWinners' | 'expiryDate' | 'createdAt' | 'updatedAt'> {}

export class TieredReward extends Model<TieredRewardAttributes, TieredRewardCreationAttributes> implements TieredRewardAttributes {
  public id!: number;
  public activityId!: number;
  public type!: 'registration' | 'group_buy' | 'collect_reward' | 'referral';
  public tier!: number;
  public targetValue!: number;
  public rewardType!: 'discount' | 'gift' | 'cashback' | 'points' | 'free';
  public rewardValue!: string;
  public rewardDescription!: string;
  public isActive!: boolean;
  public maxWinners?: number;
  public currentWinners!: number;
  public expiryDate?: Date;
  public createdAt!: Date;
  public updatedAt!: Date;

  // 实例方法
  public isAvailable(): boolean {
    if (!this.isActive) return false;
    if (this.expiryDate && this.expiryDate < new Date()) return false;
    if (this.maxWinners && this.currentWinners >= this.maxWinners) return false;
    return true;
  }

  public canAward(): boolean {
    return this.isAvailable() && (!this.maxWinners || this.currentWinners < this.maxWinners);
  }

  public getProgress(currentValue: number): number {
    return Math.min((currentValue / this.targetValue) * 100, 100);
  }

  public isAchieved(currentValue: number): boolean {
    return currentValue >= this.targetValue;
  }

  public getRewardDetails(): any {
    try {
      return JSON.parse(this.rewardValue);
    } catch (error) {
      return null;
    }
  }

  public async incrementWinners(): Promise<void> {
    this.currentWinners += 1;
    await this.save();
  }

  public async decrementWinners(): Promise<void> {
    if (this.currentWinners > 0) {
      this.currentWinners -= 1;
      await this.save();
    }
  }

  public static initModel(sequelize: Sequelize): typeof TieredReward {
    TieredReward.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      activityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'activities',
          key: 'id',
        },
        comment: '活动ID',
      },
      type: {
        type: DataTypes.ENUM('registration', 'group_buy', 'collect_reward', 'referral'),
        allowNull: false,
        comment: '奖励类型',
      },
      tier: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: '阶梯层级（最多2级）',
        validate: {
          min: 1,
          max: 2
        }
      },
      targetValue: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '目标值',
      },
      rewardType: {
        type: DataTypes.ENUM('discount', 'gift', 'cashback', 'points', 'free'),
        allowNull: false,
        comment: '奖励类型',
      },
      rewardValue: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '奖励值（JSON格式）',
      },
      rewardDescription: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: '奖励描述',
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: '是否启用',
      },
      maxWinners: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '最大获奖人数',
      },
      currentWinners: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '当前获奖人数',
      },
      expiryDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '奖励过期时间',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    }, {
      sequelize,
      modelName: 'TieredReward',
      tableName: 'tiered_rewards',
      timestamps: true,
      indexes: [
        {
          fields: ['activityId'],
        },
        {
          fields: ['type'],
        },
        {
          fields: ['activityId', 'type'],
        },
        {
          fields: ['isActive'],
        },
        {
          fields: ['expiryDate'],
        },
      ],
    });
    
    return TieredReward;
  }
}

export const initTieredReward = (sequelize: any): typeof TieredReward => {
  TieredReward.initModel(sequelize);
  return TieredReward;
};

export const initTieredRewardAssociations = (): void => {
  // 关联将在模型的index.ts文件中设置
};