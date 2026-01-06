/**
 * SIP配置模型
 * 用于存储SIP（Session Initiation Protocol）语音服务配置信息
 */

import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

export interface SIPConfigAttributes {
  id: number;
  name: string;                    // 配置名称
  description?: string;            // 配置描述

  // SIP服务器配置
  sipServerHost: string;           // SIP服务器地址
  sipServerPort: number;           // SIP服务器端口 (通常5060)
  sipProtocol: 'udp' | 'tcp' | 'tls' | 'ws' | 'wss';  // SIP传输协议
  sipRealm?: string;               // SIP域/Realm
  sipTransport: 'udp' | 'tcp' | 'tls';  // SIP传输层

  // SIP认证配置
  sipUsername: string;             // SIP用户名
  sipPassword: string;             // SIP密码
  sipAuthUsername?: string;        // SIP认证用户名（可选）
  sipAuthPassword?: string;        // SIP认证密码（可选）

  // DID号码配置 (主叫号码)
  didNumbers: string;              // DID号码列表，JSON格式存储
  defaultDidNumber?: string;       // 默认DID号码

  // 编解码器配置
  audioCodecs: string;             // 支持的音频编解码器，JSON格式
  videoCodecs?: string;            // 支持的视频编解码器，JSON格式（可选）

  // RTP配置
  rtpPortStart: number;            // RTP端口范围起始
  rtpPortEnd: number;              // RTP端口范围结束
  dtmfMode: 'rfc2833' | 'info' | 'inband';  // DTMF模式

  // 媒体服务器配置
  mediaServerHost?: string;        // 媒体服务器地址
  mediaServerPort?: number;        // 媒体服务器端口

  // STUN/TURN配置（NAT穿透）
  stunServer?: string;             // STUN服务器地址
  turnServer?: string;             // TURN服务器地址
  turnUsername?: string;           // TURN用户名
  turnPassword?: string;           // TURN密码

  // 限制和超时配置
  maxConcurrentCalls: number;      // 最大并发通话数
  callTimeout: number;             // 通话超时时间（秒）
  registerTimeout: number;         // 注册超时时间（秒）

  // 其他配置
  enabledFeatures: string;         // 启用的功能，JSON格式
  customHeaders?: string;          // 自定义SIP头，JSON格式（可选）

  // 状态字段
  isActive: boolean;               // 是否激活
  isDefault: boolean;             // 是否默认配置
  status: 'active' | 'inactive' | 'testing' | 'error';  // 状态
  lastRegisteredAt?: Date;         // 最后注册时间
  lastTestedAt?: Date;             // 最后测试时间
  lastErrorMessage?: string;       // 最后错误信息
  createdBy?: number;              // 创建者ID
  updatedBy?: number;              // 更新者ID
  createdAt: Date;
  updatedAt: Date;
}

export interface SIPConfigCreationAttributes extends Optional<SIPConfigAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class SIPConfig extends Model<
  InferAttributes<SIPConfig>,
  InferCreationAttributes<SIPConfig>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare description?: string;

  // SIP服务器配置
  declare sipServerHost: string;
  declare sipServerPort: number;
  declare sipProtocol: 'udp' | 'tcp' | 'tls' | 'ws' | 'wss';
  declare sipRealm?: string;
  declare sipTransport: 'udp' | 'tcp' | 'tls';

  // SIP认证配置
  declare sipUsername: string;
  declare sipPassword: string;
  declare sipAuthUsername?: string;
  declare sipAuthPassword?: string;

  // DID号码配置
  declare didNumbers: string;              // JSON格式
  declare defaultDidNumber?: string;

  // 编解码器配置
  declare audioCodecs: string;             // JSON格式
  declare videoCodecs?: string;            // JSON格式

  // RTP配置
  declare rtpPortStart: number;
  declare rtpPortEnd: number;
  declare dtmfMode: 'rfc2833' | 'info' | 'inband';

  // 媒体服务器配置
  declare mediaServerHost?: string;
  declare mediaServerPort?: number;

  // STUN/TURN配置
  declare stunServer?: string;
  declare turnServer?: string;
  declare turnUsername?: string;
  declare turnPassword?: string;

  // 限制和超时配置
  declare maxConcurrentCalls: number;
  declare callTimeout: number;
  declare registerTimeout: number;

  // 其他配置
  declare enabledFeatures: string;         // JSON格式
  declare customHeaders?: string;          // JSON格式

  // 状态字段
  declare isActive: boolean;
  declare isDefault: boolean;
  declare status: 'active' | 'inactive' | 'testing' | 'error';
  declare lastRegisteredAt?: Date;
  declare lastTestedAt?: Date;
  declare lastErrorMessage?: string;
  declare createdBy?: number;
  declare updatedBy?: number;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  // 方便访问的属性
  declare didNumbersArray?: string[];
  declare audioCodecsArray?: string[];
  declare enabledFeaturesArray?: string[];

  // 实例方法（在init后定义实现）
  getDidNumbersArray!: () => string[];
  getAudioCodecsArray!: () => string[];
  getEnabledFeaturesArray!: () => string[];
  setDidNumbers!: (numbers: string[]) => void;
  setAudioCodecs!: (codecs: string[]) => void;
  setEnabledFeatures!: (features: string[]) => void;
}

export const initSIPConfig = (sequelize: Sequelize) => {
  SIPConfig.init(
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

      // SIP服务器配置
      sipServerHost: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'SIP服务器地址'
      },
      sipServerPort: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5060,
        comment: 'SIP服务器端口'
      },
      sipProtocol: {
        type: DataTypes.ENUM('udp', 'tcp', 'tls', 'ws', 'wss'),
        allowNull: false,
        defaultValue: 'udp',
        comment: 'SIP传输协议'
      },
      sipRealm: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'SIP域/Realm'
      },
      sipTransport: {
        type: DataTypes.ENUM('udp', 'tcp', 'tls'),
        allowNull: false,
        defaultValue: 'udp',
        comment: 'SIP传输层'
      },

      // SIP认证配置
      sipUsername: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'SIP用户名'
      },
      sipPassword: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'SIP密码'
      },
      sipAuthUsername: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'SIP认证用户名（可选）'
      },
      sipAuthPassword: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'SIP认证密码（可选）'
      },

      // DID号码配置
      didNumbers: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
        comment: 'DID号码列表（JSON数组）'
      },
      defaultDidNumber: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: '默认DID号码'
      },

      // 编解码器配置
      audioCodecs: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: ['PCMA', 'PCMU', 'G729'],
        comment: '支持的音频编解码器（JSON数组）'
      },
      videoCodecs: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: ['H264', 'VP8'],
        comment: '支持的视频编解码器（JSON数组）'
      },

      // RTP配置
      rtpPortStart: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10000,
        comment: 'RTP端口范围起始'
      },
      rtpPortEnd: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 20000,
        comment: 'RTP端口范围结束'
      },
      dtmfMode: {
        type: DataTypes.ENUM('rfc2833', 'info', 'inband'),
        allowNull: false,
        defaultValue: 'rfc2833',
        comment: 'DTMF模式'
      },

      // 媒体服务器配置
      mediaServerHost: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '媒体服务器地址'
      },
      mediaServerPort: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '媒体服务器端口'
      },

      // STUN/TURN配置
      stunServer: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'STUN服务器地址'
      },
      turnServer: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'TURN服务器地址'
      },
      turnUsername: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'TURN用户名'
      },
      turnPassword: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'TURN密码'
      },

      // 限制和超时配置
      maxConcurrentCalls: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 100,
        comment: '最大并发通话数'
      },
      callTimeout: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 300,
        comment: '通话超时时间（秒）'
      },
      registerTimeout: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3600,
        comment: '注册超时时间（秒）'
      },

      // 其他配置
      enabledFeatures: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: ['call', 'answer', 'transfer', 'hold'],
        comment: '启用的功能（JSON数组）'
      },
      customHeaders: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
        comment: '自定义SIP头（JSON对象）'
      },

      // 状态字段
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: '是否激活'
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '是否默认配置'
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'testing', 'error'),
        allowNull: false,
        defaultValue: 'inactive',
        comment: '状态'
      },
      lastRegisteredAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '最后注册时间'
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
      modelName: 'SIPConfig',
      tableName: 'sip_configs',
      timestamps: true,
      indexes: [
        { fields: ['name'], unique: true },
        { fields: ['isActive'] },
        { fields: ['status'] },
        { fields: ['isDefault'] },
        { fields: ['sipServerHost'] },
        { fields: ['sipUsername'] }
      ]
    }
  );

  // 添加实例方法
  SIPConfig.prototype.getDidNumbersArray = function() {
    if (typeof this.didNumbers === 'string') {
      return JSON.parse(this.didNumbers);
    }
    return this.didNumbers || [];
  };

  SIPConfig.prototype.getAudioCodecsArray = function() {
    if (typeof this.audioCodecs === 'string') {
      return JSON.parse(this.audioCodecs);
    }
    return this.audioCodecs || [];
  };

  SIPConfig.prototype.getEnabledFeaturesArray = function() {
    if (typeof this.enabledFeatures === 'string') {
      return JSON.parse(this.enabledFeatures);
    }
    return this.enabledFeatures || [];
  };

  SIPConfig.prototype.setDidNumbers = function(numbers: string[]) {
    this.didNumbers = JSON.stringify(numbers);
  };

  SIPConfig.prototype.setAudioCodecs = function(codecs: string[]) {
    this.audioCodecs = JSON.stringify(codecs);
  };

  SIPConfig.prototype.setEnabledFeatures = function(features: string[]) {
    this.enabledFeatures = JSON.stringify(features);
  };
};

export default SIPConfig;