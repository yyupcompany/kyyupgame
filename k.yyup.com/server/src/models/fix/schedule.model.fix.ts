import { DataTypes, Sequelize, Model } from 'sequelize';
import { BaseModelFix } from './base.model.fix';

export enum ScheduleFrequency {
  ONCE = 'ONCE',        // 一次性
  DAILY = 'DAILY',      // 每天
  WEEKLY = 'WEEKLY',    // 每周
  MONTHLY = 'MONTHLY',  // 每月
}

export enum ScheduleStatus {
  ACTIVE = 'ACTIVE',      // 活跃
  COMPLETED = 'COMPLETED', // 已完成
  CANCELLED = 'CANCELLED', // 已取消
  PENDING = 'PENDING'      // 待定
}

export interface ScheduleAttributes {
  id: number;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date | null;
  location: string | null;
  frequency: ScheduleFrequency;
  status: ScheduleStatus;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export class ScheduleFix extends Model<ScheduleAttributes> {
  public id!: number;
  public title!: string;
  public description!: string | null;
  public startTime!: Date;
  public endTime!: Date | null;
  public location!: string | null;
  public frequency!: ScheduleFrequency;
  public status!: ScheduleStatus;
  public userId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /**
   * 初始化模型
   */
  static initializeModel(sequelize: Sequelize): typeof ScheduleFix {
    return ScheduleFix.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        title: {
          type: DataTypes.STRING(255),
          allowNull: false,
          comment: '日程标题',
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: '日程描述',
        },
        startTime: {
          type: DataTypes.DATE,
          allowNull: false,
          comment: '开始时间',
        },
        endTime: {
          type: DataTypes.DATE,
          allowNull: true,
          comment: '结束时间',
        },
        location: {
          type: DataTypes.STRING(255),
          allowNull: true,
          comment: '地点',
        },
        frequency: {
          type: DataTypes.ENUM(...Object.values(ScheduleFrequency)),
          allowNull: false,
          defaultValue: ScheduleFrequency.ONCE,
          comment: '频率',
        },
        status: {
          type: DataTypes.ENUM(...Object.values(ScheduleStatus)),
          allowNull: false,
          defaultValue: ScheduleStatus.PENDING,
          comment: '状态',
        },
        userId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          comment: '用户ID',
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: 'schedules',
        timestamps: true,
        indexes: [
          {
            name: 'schedules_user_id_idx',
            fields: ['userId'],
          },
          {
            name: 'schedules_status_idx',
            fields: ['status'],
          },
          {
            name: 'schedules_start_time_idx',
            fields: ['startTime'],
          },
        ],
      }
    );
  }
} 