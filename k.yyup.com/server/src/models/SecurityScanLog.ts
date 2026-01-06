/**
 * 安全扫描日志模型
 * 用于记录安全扫描的执行历史和结果
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../init';

export interface SecurityScanLogAttributes {
  id: number;
  scanType: string;
  targets?: string; // JSON格式的扫描目标
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedBy?: number;
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // 扫描耗时（秒）
  threatsFound?: number;
  vulnerabilitiesFound?: number;
  results?: string; // JSON格式的扫描结果
  errorMessage?: string;
  metadata?: string; // JSON格式的额外信息
  createdAt: Date;
  updatedAt: Date;
}

export interface SecurityScanLogCreationAttributes 
  extends Optional<SecurityScanLogAttributes, 'id' | 'targets' | 'startedBy' | 'completedAt' | 'duration' | 'threatsFound' | 'vulnerabilitiesFound' | 'results' | 'errorMessage' | 'metadata' | 'createdAt' | 'updatedAt'> {}

export class SecurityScanLog extends Model<SecurityScanLogAttributes, SecurityScanLogCreationAttributes>
  implements SecurityScanLogAttributes {
  
  public id!: number;
  public scanType!: string;
  public targets?: string;
  public status!: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  public startedBy?: number;
  public startedAt!: Date;
  public completedAt?: Date;
  public duration?: number;
  public threatsFound?: number;
  public vulnerabilitiesFound?: number;
  public results?: string;
  public errorMessage?: string;
  public metadata?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SecurityScanLog.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  scanType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '扫描类型：如quick、full、custom等'
  },
  targets: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '扫描目标（JSON格式）'
  },
  status: {
    type: DataTypes.ENUM('pending', 'running', 'completed', 'failed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
    comment: '扫描状态'
  },
  startedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '启动扫描的用户ID'
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '扫描开始时间'
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '扫描完成时间'
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '扫描耗时（秒）'
  },
  threatsFound: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: '发现的威胁数量'
  },
  vulnerabilitiesFound: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: '发现的漏洞数量'
  },
  results: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '扫描结果（JSON格式）'
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '错误信息'
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
  tableName: 'security_scan_logs',
  timestamps: true,
  underscored: false, // 禁用下划线转换
  freezeTableName: true, // 冻结表名
  indexes: [
    {
      fields: ['status']
    },
    {
      fields: ['scanType']
    },
    {
      fields: ['startedBy']
    },
    {
      fields: ['startedAt']
    }
  ],
  comment: '安全扫描日志表'
});

export default SecurityScanLog;
