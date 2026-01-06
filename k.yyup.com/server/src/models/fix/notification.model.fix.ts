import { DataTypes, Sequelize, Model } from 'sequelize';
import { BaseModelFix } from './base.model.fix';

export enum NotificationType {
  SYSTEM = 'SYSTEM',        // 系统通知
  ACTIVITY = 'ACTIVITY',    // 活动通知
  SCHEDULE = 'SCHEDULE',    // 日程通知
  MESSAGE = 'MESSAGE',      // 消息通知
  OTHER = 'OTHER'           // 其他
}

export enum NotificationStatus {
  UNREAD = 'UNREAD',        // 未读
  READ = 'READ',            // 已读
  DELETED = 'DELETED'       // 已删除
}

export interface NotificationAttributes {
  id: number;
  title: string;
  content: string;
  type: NotificationType;
  status: NotificationStatus;
  userId: number;
  sourceId?: number | null; // 关联的源数据ID（如活动ID等）
  sourceType?: string | null; // 关联的源数据类型
  createdAt: Date;
  updatedAt: Date;
  readAt?: Date | null;
}

export class NotificationFix extends Model<NotificationAttributes> {
  public id!: number;
  public title!: string;
  public content!: string;
  public type!: NotificationType;
  public status!: NotificationStatus;
  public userId!: number;
  public sourceId?: number | null;
  public sourceType?: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readAt?: Date | null;

  /**
   * 初始化模型
   */
  static initializeModel(sequelize: Sequelize): typeof NotificationFix {
    return NotificationFix.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        title: {
          type: DataTypes.STRING(255),
          allowNull: false,
          comment: '通知标题',
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
          comment: '通知内容',
        },
        type: {
          type: DataTypes.ENUM(...Object.values(NotificationType)),
          allowNull: false,
          defaultValue: NotificationType.SYSTEM,
          comment: '通知类型',
        },
        status: {
          type: DataTypes.ENUM(...Object.values(NotificationStatus)),
          allowNull: false,
          defaultValue: NotificationStatus.UNREAD,
          comment: '通知状态',
        },
        userId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          comment: '接收用户ID',
        },
        sourceId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
          comment: '关联的源数据ID',
        },
        sourceType: {
          type: DataTypes.STRING(50),
          allowNull: true,
          comment: '关联的源数据类型',
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
        readAt: {
          type: DataTypes.DATE,
          allowNull: true,
          comment: '读取时间',
        },
      },
      {
        sequelize,
        tableName: 'notifications',
        timestamps: true,
        indexes: [
          {
            name: 'notifications_user_id_idx',
            fields: ['userId'],
          },
          {
            name: 'notifications_status_idx',
            fields: ['status'],
          },
          {
            name: 'notifications_type_idx',
            fields: ['type'],
          },
        ],
      }
    );
  }
} 