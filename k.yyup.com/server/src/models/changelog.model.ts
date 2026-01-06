/**
 * ChangeLog 模型
 * 对应数据库表: change_log
 * 自动生成 - 2025-07-20T21:41:47.066Z
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../init';

// 定义模型属性接口
export interface ChangeLogAttributes {
  id: number;
  table_name: string;
  record_id: number;
  operation: string;
  changed_at: string;
  user_id: number;
}

// 定义创建时的可选属性
export interface ChangeLogCreationAttributes extends Optional<ChangeLogAttributes, 'id'> {}

// 定义模型类
export class ChangeLog extends Model<ChangeLogAttributes, ChangeLogCreationAttributes>
  implements ChangeLogAttributes {
  public id!: number;
  public table_name!: string;
  public record_id!: number;
  public operation!: string;
  public changed_at!: string;
  public user_id!: number;

  // 时间戳
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// 初始化模型
ChangeLog.init(
  {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  table_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  record_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  operation: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  changed_at: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  },
  {
    sequelize,
    tableName: 'change_log',
    modelName: 'ChangeLog',
    timestamps: true,
    underscored: true,
    paranoid: true, // 软删除
  }
);

export default ChangeLog;
