/**
 * 安全配置模型
 * 用于存储系统安全配置信息
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../init';

export interface SecurityConfigAttributes {
  id: number;
  configKey: string;
  configValue: string;
  description?: string;
  category: string;
  isActive: boolean;
  updatedBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SecurityConfigCreationAttributes 
  extends Optional<SecurityConfigAttributes, 'id' | 'description' | 'updatedBy' | 'createdAt' | 'updatedAt'> {}

export class SecurityConfig extends Model<SecurityConfigAttributes, SecurityConfigCreationAttributes>
  implements SecurityConfigAttributes {
  
  public id!: number;
  public configKey!: string;
  public configValue!: string;
  public description?: string;
  public category!: string;
  public isActive!: boolean;
  public updatedBy?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SecurityConfig.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  configKey: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: '配置键名'
  },
  configValue: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '配置值（JSON格式）'
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '配置描述'
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'general',
    comment: '配置分类：如password、session、auth等'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: '是否启用'
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '更新人员ID'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  tableName: 'security_configs',
  timestamps: true,
  indexes: [
    {
      fields: ['configKey'],
      unique: true
    },
    {
      fields: ['category']
    },
    {
      fields: ['isActive']
    }
  ],
  comment: '安全配置表'
});

export default SecurityConfig;
