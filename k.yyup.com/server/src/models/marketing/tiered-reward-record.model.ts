/**
 * 阶梯奖励获奖记录模型
 * 记录用户获得阶梯奖励的详细信息
 */

import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface TieredRewardRecordAttributes {
  id: number;
  tieredRewardId: number; // 阶梯奖励ID
  userId: number; // 获奖用户ID
  activityId: number; // 活动ID
  awardValue: string; // 实际发放的奖励值（JSON格式）
  awardDescription: string; // 奖励描述
  status: 'pending' | 'awarded' | 'expired' | 'cancelled'; // 发放状态
  awardedAt?: Date; // 发放时间
  expiryAt?: Date; // 过期时间
  usedAt?: Date; // 使用时间
  remarks?: string; // 备注
  createdAt: Date;
  updatedAt: Date;
}

export interface TieredRewardRecordCreationAttributes extends Optional<TieredRewardRecordAttributes, 'id' | 'awardedAt' | 'expiryAt' | 'usedAt' | 'remarks' | 'createdAt' | 'updatedAt'> {}

export class TieredRewardRecord extends Model<TieredRewardRecordAttributes, TieredRewardRecordCreationAttributes> implements TieredRewardRecordAttributes {
  public id!: number;
  public tieredRewardId!: number;
  public userId!: number;
  public activityId!: number;
  public awardValue!: string;
  public awardDescription!: string;
  public status!: 'pending' | 'awarded' | 'expired' | 'cancelled';
  public awardedAt?: Date;
  public expiryAt?: Date;
  public usedAt?: Date;
  public remarks?: string;
  public createdAt!: Date;
  public updatedAt!: Date;

  // 实例方法
  public isPending(): boolean {
    return this.status === 'pending';
  }

  public isAwarded(): boolean {
    return this.status === 'awarded';
  }

  public isExpired(): boolean {
    return this.status === 'expired' || (this.expiryAt && this.expiryAt < new Date());
  }

  public isUsed(): boolean {
    return this.usedAt !== null;
  }

  public canUse(): boolean {
    return this.isAwarded() && !this.isUsed() && !this.isExpired();
  }

  public getAwardDetails(): any {
    try {
      return JSON.parse(this.awardValue);
    } catch (error) {
      return null;
    }
  }

  public async markAsAwarded(): Promise<void> {
    this.status = 'awarded';
    this.awardedAt = new Date();
    await this.save();
  }

  public async markAsUsed(): Promise<void> {
    if (this.canUse()) {
      this.usedAt = new Date();
      await this.save();
    }
  }

  public async markAsExpired(): Promise<void> {
    this.status = 'expired';
    await this.save();
  }

  public async markAsCancelled(reason?: string): Promise<void> {
    this.status = 'cancelled';
    if (reason) {
      this.remarks = reason;
    }
    await this.save();
  }

  public static initModel(sequelize: Sequelize): typeof TieredRewardRecord {
    TieredRewardRecord.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      tieredRewardId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'tiered_rewards',
          key: 'id',
        },
        comment: '阶梯奖励ID',
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        comment: '获奖用户ID',
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
      awardValue: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '实际发放的奖励值（JSON格式）',
      },
      awardDescription: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: '奖励描述',
      },
      status: {
        type: DataTypes.ENUM('pending', 'awarded', 'expired', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
        comment: '发放状态',
      },
      awardedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '发放时间',
      },
      expiryAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '过期时间',
      },
      usedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '使用时间',
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '备注',
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
      modelName: 'TieredRewardRecord',
      tableName: 'tiered_reward_records',
      timestamps: true,
      indexes: [
        {
          fields: ['tieredRewardId'],
        },
        {
          fields: ['userId'],
        },
        {
          fields: ['activityId'],
        },
        {
          fields: ['status'],
        },
        {
          fields: ['awardedAt'],
        },
        {
          fields: ['expiryAt'],
        },
        {
          fields: ['userId', 'activityId'],
        },
      ],
    });
    
    return TieredRewardRecord;
  }
}

export const initTieredRewardRecord = (sequelize: any): typeof TieredRewardRecord => {
  TieredRewardRecord.initModel(sequelize);
  return TieredRewardRecord;
};

export const initTieredRewardRecordAssociations = (): void => {
  // 关联将在模型的index.ts文件中设置
};