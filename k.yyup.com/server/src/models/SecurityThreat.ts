/**
 * 安全威胁模型
 * 用于存储系统检测到的安全威胁信息
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../init';

export interface SecurityThreatAttributes {
  id: number;
  threatType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'ignored' | 'blocked';
  sourceIp?: string;
  targetResource?: string;
  description: string;
  detectionMethod: string;
  riskScore: number;
  handledBy?: number;
  handledAt?: Date;
  notes?: string;
  metadata?: string; // JSON格式的额外信息
  createdAt: Date;
  updatedAt: Date;
}

export interface SecurityThreatCreationAttributes 
  extends Optional<SecurityThreatAttributes, 'id' | 'handledBy' | 'handledAt' | 'notes' | 'metadata' | 'createdAt' | 'updatedAt'> {}

export class SecurityThreat extends Model<SecurityThreatAttributes, SecurityThreatCreationAttributes>
  implements SecurityThreatAttributes {
  
  public id!: number;
  public threatType!: string;
  public severity!: 'low' | 'medium' | 'high' | 'critical';
  public status!: 'active' | 'resolved' | 'ignored' | 'blocked';
  public sourceIp?: string;
  public targetResource?: string;
  public description!: string;
  public detectionMethod!: string;
  public riskScore!: number;
  public handledBy?: number;
  public handledAt?: Date;
  public notes?: string;
  public metadata?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SecurityThreat.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  threatType: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '威胁类型：如SQL注入、XSS、暴力破解等'
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: false,
    defaultValue: 'medium',
    comment: '威胁严重程度'
  },
  status: {
    type: DataTypes.ENUM('active', 'resolved', 'ignored', 'blocked'),
    allowNull: false,
    defaultValue: 'active',
    comment: '威胁状态'
  },
  sourceIp: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: '威胁来源IP地址'
  },
  targetResource: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '目标资源'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '威胁描述'
  },
  detectionMethod: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '检测方法：如规则引擎、AI检测、手动报告等'
  },
  riskScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    },
    comment: '风险评分 (0-100)'
  },
  handledBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '处理人员ID'
  },
  handledAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '处理时间'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '处理备注'
  },
  metadata: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '额外元数据（JSON格式）'
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
  tableName: 'security_threats',
  timestamps: true,
  underscored: false, // 禁用下划线转换
  freezeTableName: true, // 冻结表名
  indexes: [
    {
      fields: ['status']
    },
    {
      fields: ['severity']
    },
    {
      fields: ['threatType']
    },
    {
      fields: ['sourceIp']
    },
    {
      fields: ['createdAt']
    }
  ],
  comment: '安全威胁表'
});

export default SecurityThreat;
