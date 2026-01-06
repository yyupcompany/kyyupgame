/**
 * PermissionBackup 模型
 * 对应数据库表: permissions_backup
 * 自动生成 - 2025-07-20T21:41:47.107Z
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../init';

// 定义模型属性接口
export interface PermissionBackupAttributes {
  id: number;
  name: string;
  code: string;
  type: string;
  parent_id: number;
  path: string;
  component: string;
  permission: string;
  icon: string;
  sort: string;
  status: string;
  created_at: string;
  updated_at: Date;
}

// 定义创建时的可选属性
export interface PermissionBackupCreationAttributes extends Optional<PermissionBackupAttributes, 'id' | 'created_at' | 'updated_at'> {}

// 定义模型类
export class PermissionBackup extends Model<PermissionBackupAttributes, PermissionBackupCreationAttributes>
  implements PermissionBackupAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public type!: string;
  public parent_id!: number;
  public path!: string;
  public component!: string;
  public permission!: string;
  public icon!: string;
  public sort!: string;
  public status!: string;
  public created_at!: string;
  public updated_at!: Date;

  // 时间戳
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// 初始化模型
PermissionBackup.init(
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
  type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  path: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  component: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  permission: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  sort: {
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
    tableName: 'permissions_backup',
    modelName: 'PermissionBackup',
    timestamps: true,
    underscored: true,
    paranoid: true, // 软删除
  }
);

export default PermissionBackup;
