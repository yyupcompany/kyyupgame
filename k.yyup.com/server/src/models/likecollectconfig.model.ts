/**
 * LikeCollectConfig 模型
 * 对应数据库表: like_collect_config
 * 自动生成 - 2025-07-20T21:41:47.087Z
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../init';

// 定义模型属性接口
export interface LikeCollectConfigAttributes {
  id: number;
  activity_id: number;
  target_likes: string;
  reward_type: string;
  reward_amount: string;
  status: string;
  created_at: string;
  updated_at: Date;
}

// 定义创建时的可选属性
export interface LikeCollectConfigCreationAttributes extends Optional<LikeCollectConfigAttributes, 'id' | 'created_at' | 'updated_at'> {}

// 定义模型类
export class LikeCollectConfig extends Model<LikeCollectConfigAttributes, LikeCollectConfigCreationAttributes>
  implements LikeCollectConfigAttributes {
  public id!: number;
  public activity_id!: number;
  public target_likes!: string;
  public reward_type!: string;
  public reward_amount!: string;
  public status!: string;
  public created_at!: string;
  public updated_at!: Date;

  // 时间戳
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// 初始化模型
LikeCollectConfig.init(
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
  target_likes: {
    type: DataTypes.STRING,
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
  status: {
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
    tableName: 'like_collect_config',
    modelName: 'LikeCollectConfig',
    timestamps: true,
    underscored: true,
    paranoid: true, // 软删除
  }
);

export default LikeCollectConfig;
