/**
 * ReferralRelationship 模型
 * 对应数据库表: referral_relationships
 * 自动生成 - 2025-07-20T21:41:47.130Z
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../init';

// 定义模型属性接口
export interface ReferralRelationshipAttributes {
  id: number;
  activity_id: number;
  referrer_id: number;
  referee_id: number;
  referral_code: string;
  status: string;
  reward_amount: string;
  created_at: string;
  completed_at: string;
  rewarded_at: string;
}

// 定义创建时的可选属性
export interface ReferralRelationshipCreationAttributes extends Optional<ReferralRelationshipAttributes, 'id'> {}

// 定义模型类
export class ReferralRelationship extends Model<ReferralRelationshipAttributes, ReferralRelationshipCreationAttributes>
  implements ReferralRelationshipAttributes {
  public id!: number;
  public activity_id!: number;
  public referrer_id!: number;
  public referee_id!: number;
  public referral_code!: string;
  public status!: string;
  public reward_amount!: string;
  public created_at!: string;
  public completed_at!: string;
  public rewarded_at!: string;

  // 时间戳
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// 初始化模型
ReferralRelationship.init(
  {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  activity_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  referrer_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  referee_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  referral_code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  reward_amount: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  completed_at: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  rewarded_at: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  },
  {
    sequelize,
    tableName: 'referral_relationships',
    modelName: 'ReferralRelationship',
    timestamps: true,
    underscored: true,
    paranoid: true, // 软删除
  }
);

export default ReferralRelationship;
