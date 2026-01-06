/**
 * 积攒活动模型
 * 支持积攒、助力、奖励等功能
 */

import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface CollectActivityAttributes {
  id: number;
  activityId: number;
  userId: number; // 发起者ID
  collectCode: string; // 积攒码
  targetCount: number; // 目标积攒数
  currentCount: number; // 当前积攒数
  maxCount: number; // 最大积攒数
  deadline: Date; // 截止时间
  status: 'active' | 'completed' | 'expired' | 'cancelled'; // 积攒状态
  rewardType: 'discount' | 'gift' | 'free' | 'points'; // 奖励类型
  rewardValue: string; // 奖励值（折扣比例、礼品ID等）
  shareCount: number; // 分享次数
  viewCount: number; // 浏览次数
  createdAt: Date;
  updatedAt: Date;
}

export interface CollectActivityCreationAttributes extends Optional<CollectActivityAttributes, 'id' | 'currentCount' | 'shareCount' | 'viewCount' | 'createdAt' | 'updatedAt'> {}

export class CollectActivity extends Model<CollectActivityAttributes, CollectActivityCreationAttributes> implements CollectActivityAttributes {
  public id!: number;
  public activityId!: number;
  public userId!: number;
  public collectCode!: string;
  public targetCount!: number;
  public currentCount!: number;
  public maxCount!: number;
  public deadline!: Date;
  public status!: 'active' | 'completed' | 'expired' | 'cancelled';
  public rewardType!: 'discount' | 'gift' | 'free' | 'points';
  public rewardValue!: string;
  public shareCount!: number;
  public viewCount!: number;
  public createdAt!: Date;
  public updatedAt!: Date;

  // 实例方法
  public isCompleted(): boolean {
    return this.currentCount >= this.targetCount;
  }

  public isExpired(): boolean {
    return new Date() > this.deadline;
  }

  public canCollect(): boolean {
    return this.status === 'active' &&
           this.currentCount < this.maxCount &&
           !this.isExpired();
  }

  public getProgress(): number {
    return Math.min((this.currentCount / this.targetCount) * 100, 100);
  }

  public getRemainingTime(): number {
    return Math.max(this.deadline.getTime() - Date.now(), 0);
  }

  public getRewardDescription(): string {
    switch (this.rewardType) {
      case 'discount':
        return `${this.rewardValue}% 折扣优惠`;
      case 'gift':
        return `赠送礼品`;
      case 'free':
        return `免费参与`;
      case 'points':
        return `${this.rewardValue} 积分`;
      default:
        return '神秘奖励';
    }
  }

  public static initModel(sequelize: Sequelize): typeof CollectActivity {
    CollectActivity.init({
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
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '积攒发起者用户ID',
  },
  collectCode: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: '积攒唯一标识码',
  },
  targetCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10,
    comment: '积攒目标人数',
  },
  currentCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '当前积攒人数',
  },
  maxCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1000,
    comment: '最大积攒人数',
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '积攒截止时间',
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'expired', 'cancelled'),
    allowNull: false,
    defaultValue: 'active',
    comment: '积攒状态',
  },
  rewardType: {
    type: DataTypes.ENUM('discount', 'gift', 'free', 'points'),
    allowNull: false,
    defaultValue: 'discount',
    comment: '奖励类型',
  },
  rewardValue: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: '10',
    comment: '奖励值',
  },
  shareCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '分享次数',
  },
  viewCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '浏览次数',
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
  modelName: 'CollectActivity',
  tableName: 'collect_activities',
  timestamps: true,
  indexes: [
    {
      fields: ['activityId'],
    },
    {
      fields: ['userId'],
    },
    {
      fields: ['collectCode'],
      unique: true,
    },
    {
      fields: ['status'],
    },
    {
      fields: ['deadline'],
    },
  ],
});
    
    return CollectActivity;
  }
}

export const initCollectActivity = (sequelize: Sequelize): typeof CollectActivity => {
  return CollectActivity.initModel(sequelize);
};

export const initCollectActivityAssociations = (): void => {
  // 关联将在模型的index.ts文件中设置
};

export default CollectActivity;