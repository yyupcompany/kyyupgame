/**
 * Channel 模型
 * 对应数据库表: channels
 * 自动生成 - 2025-07-20T21:41:47.073Z
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../init';

// 定义模型属性接口
export interface ChannelAttributes {
  id: number;
  name: string;
  type: string;
  description: string;
  created_at: string;
  updated_at: Date;
  deleted_at: string;
}

// 定义创建时的可选属性
export interface ChannelCreationAttributes extends Optional<ChannelAttributes, 'id' | 'created_at' | 'updated_at'> {}

// 定义模型类
export class Channel extends Model<ChannelAttributes, ChannelCreationAttributes>
  implements ChannelAttributes {
  public id!: number;
  public name!: string;
  public type!: string;
  public description!: string;
  public created_at!: string;
  public updated_at!: Date;
  public deleted_at!: string;

  // 时间戳
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// 初始化模型
Channel.init(
  {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
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
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  },
  {
    sequelize,
    tableName: 'channels',
    modelName: 'Channel',
    timestamps: true,
    underscored: true,
    paranoid: true, // 软删除
  }
);

export default Channel;
