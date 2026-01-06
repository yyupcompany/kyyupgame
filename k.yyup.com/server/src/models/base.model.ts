/**
 * Base 模型
 * 对应数据库表: base
 * 自动生成 - 2025-07-20T21:41:47.059Z
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../init';

// 定义模型属性接口
export interface BaseAttributes {
  id: number;
  creator_id: number;
  updater_id: number;
  created_at: string;
  updated_at: Date;
  deleted_at: string;
  is_system: string;
}

// 定义创建时的可选属性
export interface BaseCreationAttributes extends Optional<BaseAttributes, 'id' | 'created_at' | 'updated_at'> {}

// 定义模型类
export class Base extends Model<BaseAttributes, BaseCreationAttributes>
  implements BaseAttributes {
  public id!: number;
  public creator_id!: number;
  public updater_id!: number;
  public created_at!: string;
  public updated_at!: Date;
  public deleted_at!: string;
  public is_system!: string;

  // 时间戳
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// 初始化模型
Base.init(
  {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  creator_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  updater_id: {
    type: DataTypes.INTEGER,
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
  is_system: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  },
  {
    sequelize,
    tableName: 'base',
    modelName: 'Base',
    timestamps: true,
    underscored: true,
    paranoid: true, // 软删除
  }
);

export default Base;
