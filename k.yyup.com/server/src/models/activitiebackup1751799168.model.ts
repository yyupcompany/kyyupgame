/**
 * ActivitieBackup1751799168 模型
 * 对应数据库表: activities_backup_1751799168
 * 自动生成 - 2025-07-20T21:41:47.042Z
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../init';

// 定义模型属性接口
export interface ActivitieBackup1751799168Attributes {
  id: number;
  kindergarten_id: number;
  plan_id: number;
  title: string;
  activity_type: string;
  cover_image: string;
  start_time: Date;
  end_time: Date;
  location: string;
  capacity: string;
  registered_count: string;
  checked_in_count: string;
  fee: string;
  description: string;
  agenda: string;
  registration_start_time: Date;
  registration_end_time: Date;
  needs_approval: string;
  status: string;
  remark: string;
  creator_id: number;
  updater_id: number;
  created_at: string;
  updated_at: Date;
  deleted_at: string;
}

// 定义创建时的可选属性
export interface ActivitieBackup1751799168CreationAttributes extends Optional<ActivitieBackup1751799168Attributes, 'id' | 'created_at' | 'updated_at'> {}

// 定义模型类
export class ActivitieBackup1751799168 extends Model<ActivitieBackup1751799168Attributes, ActivitieBackup1751799168CreationAttributes>
  implements ActivitieBackup1751799168Attributes {
  public id!: number;
  public kindergarten_id!: number;
  public plan_id!: number;
  public title!: string;
  public activity_type!: string;
  public cover_image!: string;
  public start_time!: Date;
  public end_time!: Date;
  public location!: string;
  public capacity!: string;
  public registered_count!: string;
  public checked_in_count!: string;
  public fee!: string;
  public description!: string;
  public agenda!: string;
  public registration_start_time!: Date;
  public registration_end_time!: Date;
  public needs_approval!: string;
  public status!: string;
  public remark!: string;
  public creator_id!: number;
  public updater_id!: number;
  public created_at!: string;
  public updated_at!: Date;
  public deleted_at!: string;

  // 时间戳
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// 初始化模型
ActivitieBackup1751799168.init(
  {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  kindergarten_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  plan_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  activity_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cover_image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  capacity: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  registered_count: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  checked_in_count: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  fee: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  agenda: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  registration_start_time: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  registration_end_time: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  needs_approval: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  remark: {
    type: DataTypes.STRING,
    allowNull: true,
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
  },
  {
    sequelize,
    tableName: 'activities_backup_1751799168',
    modelName: 'ActivitieBackup1751799168',
    timestamps: true,
    underscored: true,
    paranoid: true, // 软删除
  }
);

export default ActivitieBackup1751799168;
