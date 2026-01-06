/**
 * AI模型使用记录模型 - 简化版占位符
 */

import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../init';

// AI使用类型枚举
export enum AIUsageType {
  TEXT = 'text',
  CHAT = 'chat',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  EMBEDDING = 'embedding',
  SEARCH = 'search'
}

// AI使用状态枚举
export enum AIUsageStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending'
}

export interface AIModelUsageAttributes {
  id?: number;
  userId: number;
  modelId: string;
  tokensUsed: number;
  totalTokens?: number;
  inputTokens?: number;
  outputTokens?: number;
  cost: number;
  requestId: string;
  usageType?: string;
  status?: string;
  timestamp?: Date;
  requestTimestamp?: Date;
  responseTimestamp?: Date;
  processingTime?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AIModelUsageCreationAttributes extends Optional<AIModelUsageAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class AIModelUsage extends Model<AIModelUsageAttributes, AIModelUsageCreationAttributes> implements AIModelUsageAttributes {
  public id!: number;
  public userId!: number;
  public modelId!: string;
  public tokensUsed!: number;
  public totalTokens?: number;
  public inputTokens?: number;
  public outputTokens?: number;
  public cost!: number;
  public requestId!: string;
  public usageType?: string;
  public status?: string;
  public timestamp?: Date;
  public requestTimestamp?: Date;
  public responseTimestamp?: Date;
  public processingTime?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 关联
  public modelConfig?: any;
}

AIModelUsage.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  modelId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tokensUsed: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  totalTokens: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  inputTokens: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  outputTokens: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  cost: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  requestTimestamp: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  responseTimestamp: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  processingTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  requestId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  usageType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'AIModelUsage',
  tableName: 'ai_model_usage',
  timestamps: true,
});

// 命名导出
export { AIModelUsage };

// 默认导出
export default AIModelUsage;
