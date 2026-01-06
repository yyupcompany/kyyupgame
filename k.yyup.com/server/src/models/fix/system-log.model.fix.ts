import { DataTypes, Sequelize, Model } from 'sequelize';
import { BaseModelFix } from './base.model.fix';

export enum LogLevel {
  INFO = 'INFO',         // 信息
  WARN = 'WARN',         // 警告
  ERROR = 'ERROR',       // 错误
  DEBUG = 'DEBUG',       // 调试
  CRITICAL = 'CRITICAL'  // 严重
}

export enum LogModule {
  AUTH = 'AUTH',               // 认证
  USER = 'USER',               // 用户
  ACTIVITY = 'ACTIVITY',       // 活动
  ENROLLMENT = 'ENROLLMENT',   // 招生
  MARKETING = 'MARKETING',     // 营销
  SYSTEM = 'SYSTEM',           // 系统
  API = 'API',                 // API
  OTHER = 'OTHER'              // 其他
}

export interface SystemLogAttributes {
  id: number;
  level: LogLevel;
  module: LogModule;
  action: string;
  message: string;
  details?: object | null;
  ipAddress?: string | null;
  userId?: number | null;
  userAgent?: string | null;
  duration?: number | null;
  createdAt: Date;
}

export class SystemLogFix extends Model<SystemLogAttributes> {
  public id!: number;
  public level!: LogLevel;
  public module!: LogModule;
  public action!: string;
  public message!: string;
  public details?: object | null;
  public ipAddress?: string | null;
  public userId?: number | null;
  public userAgent?: string | null;
  public duration?: number | null;
  public readonly createdAt!: Date;

  /**
   * 初始化模型
   */
  static initializeModel(sequelize: Sequelize): typeof SystemLogFix {
    return SystemLogFix.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        level: {
          type: DataTypes.ENUM(...Object.values(LogLevel)),
          allowNull: false,
          defaultValue: LogLevel.INFO,
          comment: '日志级别',
        },
        module: {
          type: DataTypes.ENUM(...Object.values(LogModule)),
          allowNull: false,
          defaultValue: LogModule.OTHER,
          comment: '模块',
        },
        action: {
          type: DataTypes.STRING(100),
          allowNull: false,
          comment: '操作',
        },
        message: {
          type: DataTypes.TEXT,
          allowNull: false,
          comment: '日志消息',
        },
        details: {
          type: DataTypes.JSON,
          allowNull: true,
          comment: '详细信息',
        },
        ipAddress: {
          type: DataTypes.STRING(50),
          allowNull: true,
          comment: 'IP地址',
        },
        userId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
          comment: '用户ID',
        },
        userAgent: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: '用户代理',
        },
        duration: {
          type: DataTypes.INTEGER,
          allowNull: true,
          comment: '持续时间(毫秒)',
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        }
      },
      {
        sequelize,
        tableName: 'system_logs',
        timestamps: true,
        updatedAt: false,
        indexes: [
          {
            name: 'system_logs_level_idx',
            fields: ['level'],
          },
          {
            name: 'system_logs_module_idx',
            fields: ['module'],
          },
          {
            name: 'system_logs_user_id_idx',
            fields: ['userId'],
          },
          {
            name: 'system_logs_created_at_idx',
            fields: ['createdAt'],
          },
        ],
      }
    );
  }
} 