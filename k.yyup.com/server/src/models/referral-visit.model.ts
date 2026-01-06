/**
 * ReferralVisit 模型
 * 对应数据库表: referral_visits
 * 转介绍访问记录表
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../init';

// 访问来源枚举
export enum VisitSource {
  QRCODE = 'qrcode',
  LINK = 'link',
  OTHER = 'other'
}

// 定义模型属性接口
export interface ReferralVisitAttributes {
  id: number;
  referral_code: string;
  referrer_id: number;
  visitor_ip?: string;
  visitor_ua?: string;
  source: VisitSource;
  visit_time?: Date;
}

// 定义创建时的可选属性
export interface ReferralVisitCreationAttributes 
  extends Optional<ReferralVisitAttributes, 'id' | 'visitor_ip' | 'visitor_ua' | 'visit_time'> {}

// 定义模型类
export class ReferralVisit extends Model<ReferralVisitAttributes, ReferralVisitCreationAttributes>
  implements ReferralVisitAttributes {
  public id!: number;
  public referral_code!: string;
  public referrer_id!: number;
  public visitor_ip?: string;
  public visitor_ua?: string;
  public source!: VisitSource;

  // 时间戳
  public readonly visit_time!: Date;
}

// 初始化模型
ReferralVisit.init(
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
    visitor_ip: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '访客IP'
    },
    visitor_ua: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '访客User Agent'
    },
    source: {
      type: DataTypes.ENUM(...Object.values(VisitSource)),
      allowNull: false,
      defaultValue: VisitSource.LINK,
      comment: '访问来源'
    },
    visit_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: '访问时间'
    }
  },
  {
    sequelize,
    tableName: 'referral_visits',
    modelName: 'ReferralVisit',
    timestamps: false
  }
);

export default ReferralVisit;

