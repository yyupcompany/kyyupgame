/**
 * RoleBackup 模型
 * 对应数据库表: roles_backup
 * 自动生成 - 2025-07-20T21:41:47.150Z
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../init';

// 定义模型属性接口
export interface RoleBackupAttributes {
  id: number;
  name: string;
  code: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: Date;
}

// 定义创建时的可选属性
export interface RoleBackupCreationAttributes extends Optional<RoleBackupAttributes, 'id' | 'created_at' | 'updated_at'> {}

// 定义模型类
export class RoleBackup extends Model<RoleBackupAttributes, RoleBackupCreationAttributes>
  implements RoleBackupAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public description!: string;
  public status!: string;
  public created_at!: string;
  public updated_at!: Date;

  // 时间戳
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// 初始化模型
RoleBackup.init(
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
  code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
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
    tableName: 'roles_backup',
    modelName: 'RoleBackup',
    timestamps: true,
    underscored: true,
    paranoid: true, // 软删除
  }
);

export default RoleBackup;
