/**
 * UserReferralCode 模型
 * 对应数据库表: user_referral_codes
 * 用户推广码表
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../init';

// 定义模型属性接口
export interface UserReferralCodeAttributes {
  id: number;
  user_id: number;
  referral_code: string;
  qr_code_url?: string;
  poster_url?: string;
  created_at?: Date;
  updated_at?: Date;
}

// 定义创建时的可选属性
export interface UserReferralCodeCreationAttributes 
  extends Optional<UserReferralCodeAttributes, 'id' | 'qr_code_url' | 'poster_url' | 'created_at' | 'updated_at'> {}

// 定义模型类
export class UserReferralCode extends Model<UserReferralCodeAttributes, UserReferralCodeCreationAttributes>
  implements UserReferralCodeAttributes {
  public id!: number;
  public user_id!: number;
  public referral_code!: string;
  public qr_code_url?: string;
  public poster_url?: string;

  // 时间戳
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// 初始化模型
UserReferralCode.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: '主键ID'
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      comment: '用户ID'
    },
    referral_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '推广码'
    },
    qr_code_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '二维码URL'
    },
    poster_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '海报URL'
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
    tableName: 'user_referral_codes',
    modelName: 'UserReferralCode',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default UserReferralCode;

