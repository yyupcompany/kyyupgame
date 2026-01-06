/**
 * 团购活动模型
 * 支持开团、参团、成团状态管理
 */

import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface GroupBuyAttributes {
  id: number;
  activityId: number;
  groupLeaderId: number; // 开团者ID
  groupCode: string; // 团购码
  targetPeople: number; // 目标人数
  currentPeople: number; // 当前人数
  maxPeople: number; // 最大人数
  groupPrice: number; // 团购价格
  originalPrice: number; // 原价
  deadline: Date; // 截止时间
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'expired'; // 团购状态
  shareCount: number; // 分享次数
  viewCount: number; // 浏览次数
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupBuyCreationAttributes extends Optional<GroupBuyAttributes, 'id' | 'currentPeople' | 'shareCount' | 'viewCount' | 'createdAt' | 'updatedAt'> {}

export class GroupBuy extends Model<GroupBuyAttributes, GroupBuyCreationAttributes> implements GroupBuyAttributes {
  public id!: number;
  public activityId!: number;
  public groupLeaderId!: number;
  public groupCode!: string;
  public targetPeople!: number;
  public currentPeople!: number;
  public maxPeople!: number;
  public groupPrice!: number;
  public originalPrice!: number;
  public deadline!: Date;
  public status!: 'pending' | 'in_progress' | 'completed' | 'failed' | 'expired';
  public shareCount!: number;
  public viewCount!: number;
  public createdAt!: Date;
  public updatedAt!: Date;

  // 实例方法
  public isSuccessful(): boolean {
    return this.currentPeople >= this.targetPeople;
  }

  public isExpired(): boolean {
    return new Date() > this.deadline;
  }

  public canJoin(): boolean {
    return this.status === 'in_progress' &&
           this.currentPeople < this.maxPeople &&
           !this.isExpired();
  }

  public getProgress(): number {
    return Math.min((this.currentPeople / this.targetPeople) * 100, 100);
  }

  public getRemainingTime(): number {
    return Math.max(this.deadline.getTime() - Date.now(), 0);
  }

  public static initModel(sequelize: Sequelize): typeof GroupBuy {
    GroupBuy.init({
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
  groupLeaderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '开团者用户ID',
  },
  groupCode: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: '团购唯一标识码',
  },
  targetPeople: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 2,
    comment: '成团目标人数',
  },
  currentPeople: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: '当前参团人数（含开团者）',
  },
  maxPeople: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 50,
    comment: '最大参团人数',
  },
  groupPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '团购价格',
  },
  originalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '原价',
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '团购截止时间',
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'failed', 'expired'),
    allowNull: false,
    defaultValue: 'pending',
    comment: '团购状态',
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
  modelName: 'GroupBuy',
  tableName: 'group_buys',
  timestamps: true,
  indexes: [
    {
      fields: ['activityId'],
    },
    {
      fields: ['groupLeaderId'],
    },
    {
      fields: ['groupCode'],
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
    
    return GroupBuy;
  }
}

export const initGroupBuy = (sequelize: Sequelize): typeof GroupBuy => {
  return GroupBuy.initModel(sequelize);
};

export const initGroupBuyAssociations = (): void => {
  // 关联将在模型的index.ts文件中设置
};

export default GroupBuy;