/**
 * AI模型配置模型 - 简化版占位符
 */

import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../init';

// 模型类型枚举
export enum ModelType {
  TEXT = 'text',
  CHAT = 'chat',
  VISION = 'vision',
  AUDIO = 'audio',
  EMBEDDING = 'embedding',
  SPEECH = 'speech',
  IMAGE = 'image'
}

// 模型状态枚举
export enum ModelStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance'
}

export interface AIModelConfigAttributes {
  id?: number;
  name: string;
  displayName?: string;
  provider: string;
  // modelId: string;  // 数据库中不存在此字段，已移除
  // config: any;  // 数据库中不存在此字段，已移除
  modelParameters?: any;
  // isActive: boolean;  // 数据库中不存在此字段，使用status代替
  status?: string;
  isDefault?: boolean;
  modelType?: string;
  endpointUrl?: string;
  apiKey?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AIModelConfigCreationAttributes extends Optional<AIModelConfigAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class AIModelConfig extends Model<AIModelConfigAttributes, AIModelConfigCreationAttributes> implements AIModelConfigAttributes {
  public id!: number;
  public name!: string;
  public displayName?: string;
  public provider!: string;
  // public modelId!: string;  // 数据库中不存在此字段，已移除
  // public config!: any;  // 数据库中不存在此字段，已移除
  public modelParameters?: any;
  // public isActive!: boolean;  // 数据库中不存在此字段，使用status代替
  public status?: string;
  public isDefault?: boolean;
  public modelType?: string;
  public endpointUrl?: string;
  public apiKey?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AIModelConfig.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: false,  // 数据库中定义为 NO
  },
  provider: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'doubao',
  },
  // modelId: {  // 数据库中不存在此字段，已移除
  //   type: DataTypes.STRING,
  //   allowNull: false,
  // },
  // config: {  // 数据库中不存在此字段，已移除
  //   type: DataTypes.JSON,
  //   allowNull: true,
  // },
  modelParameters: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  // isActive: {  // 数据库中不存在此字段，使用status代替
  //   type: DataTypes.BOOLEAN,
  //   defaultValue: true,
  // },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'deprecated'),
    defaultValue: 'active',
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  modelType: {
    type: DataTypes.STRING,
    defaultValue: 'text',
  },
  endpointUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  apiKey: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'AIModelConfig',
  tableName: 'ai_model_config',  // 修复：使用实际数据库表名（单数）
  timestamps: true,
  underscored: true,  // 修复：启用下划线转换，匹配数据库字段命名
});

// 命名导出
export { AIModelConfig };

// 默认导出
export default AIModelConfig;