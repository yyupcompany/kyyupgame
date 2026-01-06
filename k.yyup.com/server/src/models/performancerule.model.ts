/**
 * PerformanceRule 模型
 * 对应数据库表: performance_rules
 * 自动生成 - 2025-07-20T21:41:47.101Z
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../init';

// 定义模型属性接口
export interface PerformanceRuleAttributes {
  id: number;
  name: string;
  description: string;
  calculation_method: string;
  target_value: string;
  bonus_amount: string;
  start_date: Date;
  end_date: Date;
  is_active: string;
  kindergarten_id: number;
  creator_id: number;
  updater_id: number;
  created_at: string;
  updated_at: Date;
}

// 定义创建时的可选属性
export interface PerformanceRuleCreationAttributes extends Optional<PerformanceRuleAttributes, 'id' | 'created_at' | 'updated_at'> {}

// 定义模型类
export class PerformanceRule extends Model<PerformanceRuleAttributes, PerformanceRuleCreationAttributes>
  implements PerformanceRuleAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
  public calculation_method!: string;
  public target_value!: string;
  public bonus_amount!: string;
  public start_date!: Date;
  public end_date!: Date;
  public is_active!: string;
  public kindergarten_id!: number;
  public creator_id!: number;
  public updater_id!: number;
  public created_at!: string;
  public updated_at!: Date;

  // 时间戳
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// 初始化模型
PerformanceRule.init(
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
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  calculation_method: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  target_value: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bonus_amount: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  kindergarten_id: {
    type: DataTypes.INTEGER,
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
  },
  {
    sequelize,
    tableName: 'performance_rules',
    modelName: 'PerformanceRule',
    timestamps: true,
    underscored: true,
    paranoid: true, // 软删除
  }
);

export default PerformanceRule;
