import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

/**
 * 提醒日志状态枚举
 */
export enum ReminderLogStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed'
}

/**
 * 提醒日志属性接口
 */
export interface ReminderLogAttributes {
  id: number;
  inspectionPlanId: number;
  reminderId: number;
  sentTo: number;
  channel: string;
  message?: string;
  status: ReminderLogStatus;
  sentAt?: Date;
  errorMessage?: string;
  createdAt?: Date;
}

/**
 * 提醒日志创建属性接口
 */
export interface ReminderLogCreationAttributes extends Optional<ReminderLogAttributes, 'id' | 'message' | 'sentAt' | 'errorMessage' | 'createdAt'> {}

/**
 * 提醒日志模型
 */
export class ReminderLog extends Model<ReminderLogAttributes, ReminderLogCreationAttributes> implements ReminderLogAttributes {
  public id!: number;
  public inspectionPlanId!: number;
  public reminderId!: number;
  public sentTo!: number;
  public channel!: string;
  public message?: string;
  public status!: ReminderLogStatus;
  public sentAt?: Date;
  public errorMessage?: string;
  public createdAt!: Date;

  // 关联
  public inspectionPlan?: any;
  public reminder?: any;
  public recipient?: any;

  /**
   * 初始化模型
   */
  public static initModel(sequelize: Sequelize): typeof ReminderLog {
    ReminderLog.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
          comment: '日志ID'
        },
        inspectionPlanId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'inspection_plan_id',
          comment: '检查计划ID'
        },
        reminderId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'reminder_id',
          comment: '提醒配置ID'
        },
        sentTo: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'sent_to',
          comment: '接收人ID'
        },
        channel: {
          type: DataTypes.STRING(20),
          allowNull: false,
          comment: '通知渠道(system/email/sms)'
        },
        message: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: '消息内容'
        },
        status: {
          type: DataTypes.ENUM('pending', 'sent', 'failed'),
          allowNull: false,
          defaultValue: 'pending',
          comment: '发送状态'
        },
        sentAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'sent_at',
          comment: '发送时间'
        },
        errorMessage: {
          type: DataTypes.TEXT,
          allowNull: true,
          field: 'error_message',
          comment: '错误信息'
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'created_at',
          comment: '创建时间'
        }
      },
      {
        sequelize,
        tableName: 'reminder_logs',
        timestamps: false,
        underscored: true,
        comment: '提醒记录表'
      }
    );

    return ReminderLog;
  }
}

export default ReminderLog;

