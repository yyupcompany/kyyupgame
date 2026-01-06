/**
 * 语音配置模型
 * 支持VOS和SIP两种配置模式，用户只能选择其中一种
 */

import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

export type VoiceConfigType = 'vos' | 'sip';

export interface VoiceConfigAttributes {
  id: number;
  name: string;                    // 配置名称
  description?: string;            // 配置描述

  // 配置类型
  configType: VoiceConfigType;      // 'vos' 或 'sip'

  // ========== VOS配置 ==========
  vosServerHost?: string;           // VOS服务器地址
  vosServerPort?: number;           // VOS服务器端口
  vosApiKey?: string;               // VOS API密钥
  vosDidNumbers?: string;           // VOS DID号码列表，JSON格式
  vosDefaultDidNumber?: string;     // VOS默认DID号码
  vosMaxConcurrentCalls?: number;   // VOS最大并发通话数

  // ========== SIP配置 ==========
  sipServerHost?: string;           // SIP服务器地址
  sipServerPort?: number;           // SIP服务器端口
  sipProtocol?: 'udp' | 'tcp' | 'tls'; // SIP传输协议
  sipRealm?: string;               // SIP域/Realm
  sipUsername?: string;             // SIP用户名
  sipPassword?: string;             // SIP密码
  sipDidNumbers?: string;           // SIP DID号码列表，JSON格式
  sipDefaultDidNumber?: string;     // SIP默认DID号码
  sipAudioCodecs?: string;          // SIP音频编解码器，JSON格式
  sipRtpPortStart?: number;         // RTP端口起始
  sipRtpPortEnd?: number;           // RTP端口结束

  // ========== 通用配置 ==========
  isActive: boolean;               // 是否激活
  isDefault: boolean;             // 是否默认配置
  status: 'active' | 'inactive' | 'testing' | 'error';  // 状态
  lastConnectedAt?: Date;          // 最后连接时间
  lastTestedAt?: Date;             // 最后测试时间
  lastErrorMessage?: string;       // 最后错误信息
  createdBy?: number;              // 创建者ID
  updatedBy?: number;              // 更新者ID
  createdAt: Date;
  updatedAt: Date;
}

export interface VoiceConfigCreationAttributes extends Optional<VoiceConfigAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class VoiceConfig extends Model<
  InferAttributes<VoiceConfig>,
  InferCreationAttributes<VoiceConfig>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare description?: string;
  declare configType: VoiceConfigType;

  // VOS配置
  declare vosServerHost?: string;
  declare vosServerPort?: number;
  declare vosApiKey?: string;
  declare vosDidNumbers?: string;
  declare vosDefaultDidNumber?: string;
  declare vosMaxConcurrentCalls?: number;

  // SIP配置
  declare sipServerHost?: string;
  declare sipServerPort?: number;
  declare sipProtocol?: 'udp' | 'tcp' | 'tls';
  declare sipRealm?: string;
  declare sipUsername?: string;
  declare sipPassword?: string;
  declare sipDidNumbers?: string;
  declare sipDefaultDidNumber?: string;
  declare sipAudioCodecs?: string;
  declare sipRtpPortStart?: number;
  declare sipRtpPortEnd?: number;

  // 通用配置
  declare isActive: boolean;
  declare isDefault: boolean;
  declare status: 'active' | 'inactive' | 'testing' | 'error';
  declare lastConnectedAt?: Date;
  declare lastTestedAt?: Date;
  declare lastErrorMessage?: string;
  declare createdBy?: number;
  declare updatedBy?: number;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  // 方便访问的属性
  declare didNumbersArray?: string[];
  declare audioCodecsArray?: string[];

  // 实例方法实现
  getDidNumbersArray(): string[] {
    if (this.configType === 'vos') {
      const numbers = this.vosDidNumbers;
      if (typeof numbers === 'string') {
        return JSON.parse(numbers);
      }
      return numbers || [];
    } else if (this.configType === 'sip') {
      const numbers = this.sipDidNumbers;
      if (typeof numbers === 'string') {
        return JSON.parse(numbers);
      }
      return numbers || [];
    }
    return [];
  }

  setDidNumbers(numbers: string[]): void {
    if (this.configType === 'vos') {
      this.vosDidNumbers = JSON.stringify(numbers);
    } else if (this.configType === 'sip') {
      this.sipDidNumbers = JSON.stringify(numbers);
    }
  }

  getDefaultDidNumber(): string | null {
    if (this.configType === 'vos') {
      return this.vosDefaultDidNumber || null;
    } else if (this.configType === 'sip') {
      return this.sipDefaultDidNumber || null;
    }
    return null;
  }

  setDefaultDidNumber(number: string): void {
    if (this.configType === 'vos') {
      this.vosDefaultDidNumber = number;
    } else if (this.configType === 'sip') {
      this.sipDefaultDidNumber = number;
    }
  }

  getMaxConcurrentCalls(): number {
    if (this.configType === 'vos') {
      return this.vosMaxConcurrentCalls || 10;
    } else if (this.configType === 'sip') {
      return 50; // SIP通常支持更多并发
    }
    return 10;
  }

  validateConfig(): { isValid: boolean; errors: string[] } {
    const errors = [];

    if (this.configType === 'vos') {
      if (!this.vosServerHost) {
        errors.push('VOS服务器地址不能为空');
      }
      if (!this.vosApiKey) {
        errors.push('VOS API密钥不能为空');
      }
    } else if (this.configType === 'sip') {
      if (!this.sipServerHost) {
        errors.push('SIP服务器地址不能为空');
      }
      if (!this.sipUsername) {
        errors.push('SIP用户名不能为空');
      }
      if (!this.sipPassword) {
        errors.push('SIP密码不能为空');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  getConfigSummary(): any {
    if (this.configType === 'vos') {
      return {
        type: 'VOS',
        server: `${this.vosServerHost}:${this.vosServerPort}`,
        didCount: this.getDidNumbersArray().length,
        defaultDid: this.getDefaultDidNumber(),
        maxCalls: this.getMaxConcurrentCalls()
      };
    } else if (this.configType === 'sip') {
      return {
        type: 'SIP',
        server: `${this.sipServerHost}:${this.sipServerPort}`,
        realm: this.sipRealm,
        username: this.sipUsername,
        didCount: this.getDidNumbersArray().length,
        defaultDid: this.getDefaultDidNumber(),
        codecs: this.sipAudioCodecs
      };
    }
    return null;
  }
}

export const initVoiceConfig = (sequelize: Sequelize) => {
  VoiceConfig.init(
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
      configType: {
        type: DataTypes.ENUM('vos', 'sip'),
        allowNull: false,
        comment: '配置类型：vos或sip'
      },

      // VOS配置字段
      vosServerHost: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'VOS服务器地址'
      },
      vosServerPort: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 443,
        comment: 'VOS服务器端口'
      },
      vosApiKey: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'VOS API密钥'
      },
      vosDidNumbers: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'VOS DID号码列表（JSON数组）'
      },
      vosDefaultDidNumber: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'VOS默认DID号码'
      },
      vosMaxConcurrentCalls: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 10,
        comment: 'VOS最大并发通话数'
      },

      // SIP配置字段
      sipServerHost: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'SIP服务器地址'
      },
      sipServerPort: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 5060,
        comment: 'SIP服务器端口'
      },
      sipProtocol: {
        type: DataTypes.ENUM('udp', 'tcp', 'tls'),
        allowNull: true,
        defaultValue: 'udp',
        comment: 'SIP传输协议'
      },
      sipRealm: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'SIP域/Realm'
      },
      sipUsername: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'SIP用户名'
      },
      sipPassword: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'SIP密码'
      },
      sipDidNumbers: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'SIP DID号码列表（JSON数组）'
      },
      sipDefaultDidNumber: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'SIP默认DID号码'
      },
      sipAudioCodecs: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: ['PCMU', 'PCMA'],
        comment: 'SIP音频编解码器（JSON数组）'
      },
      sipRtpPortStart: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 10000,
        comment: 'SIP RTP端口起始'
      },
      sipRtpPortEnd: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 20000,
        comment: 'SIP RTP端口结束'
      },

      // 通用字段
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
      lastConnectedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '最后连接时间'
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
      modelName: 'VoiceConfig',
      tableName: 'voice_configs',
      timestamps: true,
      indexes: [
        { fields: ['name'], unique: true },
        { fields: ['configType'] },
        { fields: ['isActive'] },
        { fields: ['status'] },
        { fields: ['isDefault'] }
      ]
    }
  );
};

export default VoiceConfig;