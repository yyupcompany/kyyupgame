/**
 * ReferralConversion 模型
 * 对应数据库表: referral_conversions
 * 转介绍转化记录表
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../init';

// 转化状态枚举
export enum ConversionStatus {
  VISITED = 'visited',
  REGISTERED = 'registered',
  ENROLLED = 'enrolled',
  PAID = 'paid'
}

// 定义模型属性接口
export interface ReferralConversionAttributes {
  id: number;
  referral_code: string;
  referrer_id: number;
  visitor_name?: string;
  visitor_phone?: string;
  visitor_id?: number;
  status: ConversionStatus;
  enrolled_activity_id?: number;
  enrolled_activity_name?: string;
  enrolled_time?: Date;
  reward: number;
  created_at?: Date;
  updated_at?: Date;
}

// 定义创建时的可选属性
export interface ReferralConversionCreationAttributes 
  extends Optional<ReferralConversionAttributes, 'id' | 'visitor_name' | 'visitor_phone' | 'visitor_id' | 
    'enrolled_activity_id' | 'enrolled_activity_name' | 'enrolled_time' | 'reward' | 'created_at' | 'updated_at'> {}

// 定义模型类
export class ReferralConversion extends Model<ReferralConversionAttributes, ReferralConversionCreationAttributes>
  implements ReferralConversionAttributes {
  public id!: number;
  public referral_code!: string;
  public referrer_id!: number;
  public visitor_name?: string;
  public visitor_phone?: string;
  public visitor_id?: number;
  public status!: ConversionStatus;
  public enrolled_activity_id?: number;
  public enrolled_activity_name?: string;
  public enrolled_time?: Date;
  public reward!: number;

  // 时间戳
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// 初始化模型
ReferralConversion.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: '主键ID'
    },
    referral_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '推广码'
    },
    referrer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '推荐人ID'
    },
    visitor_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '访客姓名'
    },
    visitor_phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '访客手机'
    },
    visitor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '访客用户ID（如果注册了）'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ConversionStatus)),
      allowNull: false,
      defaultValue: ConversionStatus.VISITED,
      comment: '状态'
    },
    enrolled_activity_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '报名活动ID'
    },
    enrolled_activity_name: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '报名活动名称'
    },
    enrolled_time: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '报名时间'
    },
    reward: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '奖励金额'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: '创建时间'
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: '更新时间'
    }
  },
  {
    sequelize,
    tableName: 'referral_conversions',
    modelName: 'ReferralConversion',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default ReferralConversion;

