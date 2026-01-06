/**
 * EnrollmentInterview 模型
 * 对应数据库表: enrollment_interviews
 * 自动生成 - 2025-07-20T21:41:47.080Z
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../init';

// 定义模型属性接口
export interface EnrollmentInterviewAttributes {
  id: number;
  application_id: number;
  interview_date: Date;
  interviewer_id: number;
  location: string;
  status: string;
  score: string;
  feedback: string;
  notes: string;
  duration_minutes: string;
  created_by: string;
  created_at: string;
  updated_at: Date;
  deleted_at: string;
}

// 定义创建时的可选属性
export interface EnrollmentInterviewCreationAttributes extends Optional<EnrollmentInterviewAttributes, 'id' | 'created_at' | 'updated_at'> {}

// 定义模型类
export class EnrollmentInterview extends Model<EnrollmentInterviewAttributes, EnrollmentInterviewCreationAttributes>
  implements EnrollmentInterviewAttributes {
  public id!: number;
  public application_id!: number;
  public interview_date!: Date;
  public interviewer_id!: number;
  public location!: string;
  public status!: string;
  public score!: string;
  public feedback!: string;
  public notes!: string;
  public duration_minutes!: string;
  public created_by!: string;
  public created_at!: string;
  public updated_at!: Date;
  public deleted_at!: string;

  // 时间戳
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// 初始化模型
EnrollmentInterview.init(
  {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  application_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  interview_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  interviewer_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  score: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  feedback: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  notes: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  duration_minutes: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  created_by: {
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
    tableName: 'enrollment_interviews',
    modelName: 'EnrollmentInterview',
    timestamps: true,
    underscored: true,
    paranoid: true, // 软删除
  }
);

export default EnrollmentInterview;
