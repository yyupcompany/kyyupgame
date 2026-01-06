/**
 * ReferralStatistic 模型
 * 对应数据库表: referral_statistics
 * 自动生成 - 2025-07-20T21:41:47.143Z
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../init';

// 定义模型属性接口
export interface ReferralStatisticAttributes {
  id: number;
  user_id: number;
  activity_id: number;
  total_referrals: string;
  successful_referrals: string;
  total_rewards: string;
  total_points: string;
  last_referral_at: string;
  created_at: string;
  updated_at: Date;
}

// 定义创建时的可选属性
export interface ReferralStatisticCreationAttributes extends Optional<ReferralStatisticAttributes, 'id' | 'created_at' | 'updated_at'> {}

// 定义模型类
export class ReferralStatistic extends Model<ReferralStatisticAttributes, ReferralStatisticCreationAttributes>
  implements ReferralStatisticAttributes {
  public id!: number;
  public user_id!: number;
  public activity_id!: number;
  public total_referrals!: string;
  public successful_referrals!: string;
  public total_rewards!: string;
  public total_points!: string;
  public last_referral_at!: string;
  public created_at!: string;
  public updated_at!: Date;

  // 时间戳
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// 初始化模型
ReferralStatistic.init(
  {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  activity_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  total_referrals: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  successful_referrals: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  total_rewards: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  total_points: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  last_referral_at: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  },
  {
    sequelize,
    tableName: 'referral_statistics',
    modelName: 'ReferralStatistic',
    timestamps: true,
    underscored: true,
    paranoid: true, // 软删除
  }
);

export default ReferralStatistic;
