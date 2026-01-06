/**
 * 团购成员模型
 * 记录参与团购的用户信息
 */

import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface GroupBuyMemberAttributes {
  id: number;
  groupBuyId: number;
  userId: number;
  joinTime: Date;
  status: 'pending' | 'confirmed' | 'cancelled'; // 参团状态
  paymentStatus: 'unpaid' | 'paid' | 'refunded'; // 支付状态
  paymentAmount: number; // 支付金额
  paymentTime?: Date; // 支付时间
  refundAmount?: number; // 退款金额
  refundTime?: Date; // 退款时间
  inviteCode?: string; // 邀请码（如果有）
  inviterId?: number; // 邀请人ID
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupBuyMemberCreationAttributes extends Optional<GroupBuyMemberAttributes, 'id' | 'paymentTime' | 'refundAmount' | 'refundTime' | 'inviteCode' | 'inviterId' | 'createdAt' | 'updatedAt'> {}

export class GroupBuyMember extends Model<GroupBuyMemberAttributes, GroupBuyMemberCreationAttributes> implements GroupBuyMemberAttributes {
  public id!: number;
  public groupBuyId!: number;
  public userId!: number;
  public joinTime!: Date;
  public status!: 'pending' | 'confirmed' | 'cancelled';
  public paymentStatus!: 'unpaid' | 'paid' | 'refunded';
  public paymentAmount!: number;
  public paymentTime?: Date;
  public refundAmount?: number;
  public refundTime?: Date;
  public inviteCode?: string;
  public inviterId?: number;
  public createdAt!: Date;
  public updatedAt!: Date;

  // 实例方法
  public isConfirmed(): boolean {
    return this.status === 'confirmed' && this.paymentStatus === 'paid';
  }

  public canRefund(): boolean {
    return this.paymentStatus === 'paid' && !this.refundAmount;
  }

  public getRefundAmount(originalPrice: number, groupPrice: number): number {
    if (this.status === 'confirmed' && this.paymentStatus === 'paid') {
      return Math.max(0, this.paymentAmount - groupPrice);
    }
    return 0;
  }

  public static initModel(sequelize: Sequelize): typeof GroupBuyMember {
    GroupBuyMember.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  groupBuyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'group_buys',
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '参团用户ID',
  },
  joinTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '参团时间',
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
    comment: '参团状态',
  },
  paymentStatus: {
    type: DataTypes.ENUM('unpaid', 'paid', 'refunded'),
    allowNull: false,
    defaultValue: 'unpaid',
    comment: '支付状态',
  },
  paymentAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: '支付金额',
  },
  paymentTime: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '支付时间',
  },
  refundAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: '退款金额',
  },
  refundTime: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '退款时间',
  },
  inviteCode: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '邀请码',
  },
  inviterId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '邀请人ID',
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
  modelName: 'GroupBuyMember',
  tableName: 'group_buy_members',
  timestamps: true,
  indexes: [
    {
      fields: ['groupBuyId'],
    },
    {
      fields: ['userId'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['paymentStatus'],
    },
    {
      fields: ['joinTime'],
    },
    {
      unique: true,
      fields: ['groupBuyId', 'userId'],
    },
  ],
});
    
    return GroupBuyMember;
  }
}

export const initGroupBuyMember = (sequelize: Sequelize): typeof GroupBuyMember => {
  return GroupBuyMember.initModel(sequelize);
};

export const initGroupBuyMemberAssociations = (): void => {
  // 关联将在模型的index.ts文件中设置
};

export default GroupBuyMember;