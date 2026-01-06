import { Model, DataTypes, Optional, Sequelize } from 'sequelize';
import { User } from './user.model';

export enum ScheduleType {
  TASK = 'task',
  MEETING = 'meeting',
  REMINDER = 'reminder',
  EVENT = 'event',
}

export enum ScheduleStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum RepeatType {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export interface ScheduleAttributes {
  id: number; // 日程ID
  title: string; // 日程标题
  description: string | null; // 日程描述
  type: ScheduleType; // 日程类型
  status: ScheduleStatus; // 日程状态
  startTime: Date; // 开始时间
  endTime: Date | null; // 结束时间
  allDay: boolean; // 是否全天
  location: string | null; // 地点
  repeatType: RepeatType; // 重复类型
  userId: number; // 用户ID
  relatedId: number | null; // 关联ID
  relatedType: string | null; // 关联类型
  priority: number; // 优先级 - 1:最高 2:高 3:中 4:低 5:最低
  kindergartenId: number | null; // 幼儿园ID
  metadata: any | null; // 元数据（JSON格式）
  createdAt?: Date; // 创建时间
  updatedAt?: Date; // 更新时间
  deletedAt?: Date | null; // 删除时间
}

export type ScheduleCreationAttributes = Optional<ScheduleAttributes, 'id' | 'description' | 'endTime' | 'allDay' | 'location' | 'repeatType' | 'relatedId' | 'relatedType' | 'priority' | 'kindergartenId' | 'metadata' | 'status' | 'createdAt' | 'updatedAt' | 'deletedAt'>;

export class Schedule extends Model<ScheduleAttributes, ScheduleCreationAttributes> implements ScheduleAttributes {
  public id!: number;
 
  title!: string;
 
  description!: string | null;
 
  type!: ScheduleType;
 
  status!: ScheduleStatus;
 
  startTime!: Date;
 
  endTime!: Date | null;
 
  allDay!: boolean;
 
  location!: string | null;
 
  repeatType!: RepeatType;
 
  userId!: number;
 
  relatedId!: number | null;
 
  relatedType!: string | null;
 
  priority!: number;

  kindergartenId!: number | null;

  metadata!: any | null;
 
  public readonly createdAt!: Date;
 
  public readonly updatedAt!: Date;
 
  public readonly deletedAt!: Date | null;
 

  // Instance methods

  public async markAsCompleted(): Promise<void> {
    this.status = ScheduleStatus.COMPLETED;
    await this.save();
  }

  public async cancel(): Promise<void> {
    this.status = ScheduleStatus.CANCELLED;
    await this.save();
  }


  // Static methods
  static initModel(sequelize: Sequelize): void {
    Schedule.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        title: {
          type: DataTypes.STRING(100),
          allowNull: false,
          comment: '日程标题',
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: '日程描述',
        },
        type: {
          type: DataTypes.ENUM(...Object.values(ScheduleType)),
          allowNull: false,
          defaultValue: ScheduleType.TASK,
          comment: '日程类型',
        },
        status: {
          type: DataTypes.ENUM(...Object.values(ScheduleStatus)),
          allowNull: false,
          defaultValue: ScheduleStatus.PENDING,
          comment: '日程状态',
        },
        startTime: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'start_time',
          comment: '开始时间',
        },
        endTime: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'end_time',
          comment: '结束时间',
        },
        allDay: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          field: 'is_all_day',
          comment: '是否全天',
        },
        location: {
          type: DataTypes.STRING(100),
          allowNull: true,
          comment: '地点',
        },
        repeatType: {
          type: DataTypes.ENUM(...Object.values(RepeatType)),
          allowNull: false,
          defaultValue: RepeatType.NONE,
          field: 'repeat_type',
          comment: '重复类型',
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'user_id',
          comment: '用户ID',
        },
        relatedId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: 'related_id',
          comment: '关联ID',
        },
        relatedType: {
          type: DataTypes.STRING(50),
          allowNull: true,
          field: 'related_type',
          comment: '关联类型',
        },
        priority: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 3,
          comment: '优先级 - 1:最高 2:高 3:中 4:低 5:最低',
        },
        kindergartenId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: 'kindergarten_id',
          comment: '幼儿园ID',
        },
        metadata: {
          type: DataTypes.JSON,
          allowNull: true,
          comment: '元数据（JSON格式）',
        },
      },
      {
        sequelize,
        tableName: 'schedules',
        timestamps: true,
        paranoid: true,
        underscored: true,
      }
    );
  }

  static initAssociations(): void {
    Schedule.belongsTo(User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  }
}

export default Schedule;
