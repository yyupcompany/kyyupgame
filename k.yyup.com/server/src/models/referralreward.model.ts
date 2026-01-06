/**
 * ReferralReward 模型
 * 对应数据库表: referral_rewards
 * 自动生成 - 2025-07-20T21:41:47.136Z
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../init';

// 定义模型属性接口
export interface ReferralRewardAttributes {
  id: number;
  referral_id: number;
  reward_type: string;
  reward_amount: string;
  reward_points: string;
  coupon_id: number;
  coupon_code: string;
  status: string;
  issued_at: string;
  used_at: string;
  expires_at: string;
  created_at: string;
  description: string;
}

// 定义创建时的可选属性
export interface ReferralRewardCreationAttributes extends Optional<ReferralRewardAttributes, 'id'> {}

// 定义模型类
export class ReferralReward extends Model<ReferralRewardAttributes, ReferralRewardCreationAttributes>
  implements ReferralRewardAttributes {
  public id!: number;
  public referral_id!: number;
  public reward_type!: string;
  public reward_amount!: string;
  public reward_points!: string;
  public coupon_id!: number;
  public coupon_code!: string;
  public status!: string;
  public issued_at!: string;
  public used_at!: string;
  public expires_at!: string;
  public created_at!: string;
  public description!: string;

  // 时间戳
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// 初始化模型
ReferralReward.init(
  {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  referral_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  reward_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  reward_amount: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  reward_points: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  coupon_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  coupon_code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  issued_at: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  used_at: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  expires_at: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  },
  {
    sequelize,
    tableName: 'referral_rewards',
    modelName: 'ReferralReward',
    timestamps: true,
    underscored: true,
    paranoid: true, // 软删除
  }
);

export default ReferralReward;
