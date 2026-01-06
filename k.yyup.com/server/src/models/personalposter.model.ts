/**
 * PersonalPoster 模型
 * 对应数据库表: personal_posters
 * 自动生成 - 2025-07-20T21:41:47.114Z
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../init';

// 定义模型属性接口
export interface PersonalPosterAttributes {
  id: number;
  user_id: number;
  activity_id: number;
  referral_code: string;
  template_id: number;
  poster_url: string;
  thumbnail_url: string;
  qr_code_url: string;
  custom_data: string;
  view_count: string;
  share_count: string;
  download_count: string;
  created_at: string;
  updated_at: Date;
}

// 定义创建时的可选属性
export interface PersonalPosterCreationAttributes extends Optional<PersonalPosterAttributes, 'id' | 'created_at' | 'updated_at'> {}

// 定义模型类
export class PersonalPoster extends Model<PersonalPosterAttributes, PersonalPosterCreationAttributes>
  implements PersonalPosterAttributes {
  public id!: number;
  public user_id!: number;
  public activity_id!: number;
  public referral_code!: string;
  public template_id!: number;
  public poster_url!: string;
  public thumbnail_url!: string;
  public qr_code_url!: string;
  public custom_data!: string;
  public view_count!: string;
  public share_count!: string;
  public download_count!: string;
  public created_at!: string;
  public updated_at!: Date;

  // 时间戳
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// 初始化模型
PersonalPoster.init(
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
  referral_code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  template_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  poster_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  thumbnail_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  qr_code_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  custom_data: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  view_count: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  share_count: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  download_count: {
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
    tableName: 'personal_posters',
    modelName: 'PersonalPoster',
    timestamps: true,
    underscored: true,
    paranoid: true, // 软删除
  }
);

export default PersonalPoster;
