/**
 * ReferralCode 模型
 * 对应数据库表: referral_codes
 * 更新版本 - 2025-01-12 支持完整的推广码功能
 */

import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { sequelize } from '../init';

// 定义模型属性接口
export interface ReferralCodeAttributes {
  id: number;
  user_id: number;
  activity_id: number | null;
  referral_code: string;
  title: string;
  description: string;
  validity_days: number;
  usage_limit: number;
  usage_count: number;
  expires_at: Date;
  status: 'active' | 'expired' | 'disabled';
  is_custom: boolean;
  qr_code_url: string | null;
  poster_url: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

// 定义创建时的可选属性
export interface ReferralCodeCreationAttributes extends Optional<ReferralCodeAttributes, 'id' | 'usage_count' | 'qr_code_url' | 'poster_url' | 'created_at' | 'updated_at' | 'deleted_at'> {}

// 定义模型类
export class ReferralCode extends Model<ReferralCodeAttributes, ReferralCodeCreationAttributes>
  implements ReferralCodeAttributes {
  public id!: number;
  public user_id!: number;
  public activity_id!: number | null;
  public referral_code!: string;
  public title!: string;
  public description!: string;
  public validity_days!: number;
  public usage_limit!: number;
  public usage_count!: number;
  public expires_at!: Date;
  public status!: 'active' | 'expired' | 'disabled';
  public is_custom!: boolean;
  public qr_code_url!: string | null;
  public poster_url!: string | null;
  public created_at!: Date;
  public updated_at!: Date;
  public deleted_at!: Date | null;

  // 时间戳
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  // 关联方法
  public getUser?: any;
  public getActivity?: any;

  // 定义关联
  public static associate = (models: any) => {
    ReferralCode.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    if (models.Activity) {
      ReferralCode.belongsTo(models.Activity, {
        foreignKey: 'activity_id',
        as: 'activity'
      });
    }
  };

  // 静态方法
  static initModel: (sequelize: Sequelize) => void;
}

/**
 * 初始化ReferralCode模型
 * @param sequelize Sequelize实例
 */
export const initReferralCodeModel = (sequelize: Sequelize): void => {
  ReferralCode.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: '创建用户ID'
      },
      activity_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'activities',
          key: 'id'
        },
        comment: '关联活动ID'
      },
      referral_code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        comment: '推广码，唯一标识'
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '推广标题'
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '推广描述'
      },
      validity_days: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30,
        comment: '有效期天数'
      },
      usage_limit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 100,
        comment: '使用次数限制'
      },
      usage_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '已使用次数'
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '过期时间'
      },
      status: {
        type: DataTypes.ENUM('active', 'expired', 'disabled'),
        allowNull: false,
        defaultValue: 'active',
        comment: '状态'
      },
      is_custom: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '是否为自定义推广'
      },
      qr_code_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: '二维码图片URL'
      },
      poster_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: '推广海报URL'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '软删除时间'
      }
    },
    {
      sequelize,
      tableName: 'referral_codes',
      modelName: 'ReferralCode',
      timestamps: true,
      underscored: true,
      paranoid: true, // 软删除
      indexes: [
        {
          unique: true,
          fields: ['referral_code']
        },
        {
          fields: ['user_id']
        },
        {
          fields: ['activity_id']
        },
        {
          fields: ['status']
        },
        {
          fields: ['expires_at']
        }
      ]
    }
  );
};

// 向后兼容的initModel方法
ReferralCode.initModel = initReferralCodeModel;

export default ReferralCode;
