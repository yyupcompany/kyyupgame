/**
 * VOS配置模型
 * 用于存储VOS（Voice Over Service）语音服务的配置信息
 */

import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

export interface VOSConfigAttributes {
  id: number;
  name: string;                    // 配置名称
  description?: string;            // 配置描述
  serverHost: string;              // VOS服务器地址
  serverPort: number;              // VOS服务器端口
  protocol: 'http' | 'https' | 'ws' | 'wss';  // 协议
  apiKey: string;                  // API密钥
  apiSecret?: string;              // API密钥（可选）
  appId?: string;                  // 应用ID
  username?: string;               // 用户名
  password?: string;               // 密码
  voiceType?: string;              // 语音类型
  sampleRate?: number;             // 采样率
  format?: string;                 // 音频格式
  language?: string;               // 语言
  modelName?: string;              // 模型名称
  maxConcurrentCalls?: number;     // 最大并发通话数
  timeout?: number;                // 超时时间（毫秒）
  retryCount?: number;             // 重试次数
  isActive: boolean;               // 是否激活
  isDefault?: boolean;             // 是否默认配置
  status: 'active' | 'inactive' | 'testing' | 'error';  // 状态
  lastTestedAt?: Date;             // 最后测试时间
  lastErrorMessage?: string;       // 最后错误信息
  createdBy?: number;              // 创建者ID
  updatedBy?: number;              // 更新者ID
  createdAt: Date;
  updatedAt: Date;
}

export interface VOSConfigCreationAttributes extends Optional<VOSConfigAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class VOSConfig extends Model<
  InferAttributes<VOSConfig>,
  InferCreationAttributes<VOSConfig>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare description?: string;
  declare serverHost: string;
  declare serverPort: number;
  declare protocol: 'http' | 'https' | 'ws' | 'wss';
  declare apiKey: string;
  declare apiSecret?: string;
  declare appId?: string;
  declare username?: string;
  declare password?: string;
  declare voiceType?: string;
  declare sampleRate?: number;
  declare format?: string;
  declare language?: string;
  declare modelName?: string;
  declare maxConcurrentCalls?: number;
  declare timeout?: number;
  declare retryCount?: number;
  declare isActive: boolean;
  declare isDefault?: boolean;
  declare status: 'active' | 'inactive' | 'testing' | 'error';
  declare lastTestedAt?: Date;
  declare lastErrorMessage?: string;
  declare createdBy?: number;
  declare updatedBy?: number;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

export const initVOSConfig = (sequelize: Sequelize) => {
  VOSConfig.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '配置ID'
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment: '配置名称'
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '配置描述'
      },
      serverHost: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'VOS服务器地址'
      },
      serverPort: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 443,
        comment: 'VOS服务器端口'
      },
      protocol: {
        type: DataTypes.ENUM('http', 'https', 'ws', 'wss'),
        allowNull: false,
        defaultValue: 'https',
        comment: '协议'
      },
      apiKey: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'API密钥'
      },
      apiSecret: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'API密钥（可选）'
      },
      appId: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '应用ID'
      },
      username: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '用户名'
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '密码'
      },
      voiceType: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'default',
        comment: '语音类型'
      },
      sampleRate: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 16000,
        comment: '采样率'
      },
      format: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: 'pcm',
        comment: '音频格式'
      },
      language: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: 'zh-CN',
        comment: '语言'
      },
      modelName: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '模型名称'
      },
      maxConcurrentCalls: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 100,
        comment: '最大并发通话数'
      },
      timeout: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 30000,
        comment: '超时时间（毫秒）'
      },
      retryCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 3,
        comment: '重试次数'
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: '是否激活'
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
        comment: '是否默认配置'
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'testing', 'error'),
        allowNull: false,
        defaultValue: 'inactive',
        comment: '状态'
      },
      lastTestedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '最后测试时间'
      },
      lastErrorMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '最后错误信息'
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '创建者ID'
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '更新者ID'
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
    },
    {
      sequelize,
      modelName: 'VOSConfig',
      tableName: 'vos_configs',
      timestamps: true,
      indexes: [
        { fields: ['name'], unique: true },
        { fields: ['isActive'] },
        { fields: ['status'] },
        { fields: ['isDefault'] }
      ]
    }
  );
};

