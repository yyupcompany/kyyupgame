import { Model, DataTypes, Optional, Sequelize } from 'sequelize';
import { User } from './user.model';

export enum NotificationType {
  SYSTEM = 'system',
  MESSAGE = 'message',
  ACTIVITY = 'activity',
  COLLECT_CREATED = 'collect_created',
  COLLECT_HELPED = 'collect_helped',
  COLLECT_HELP_SUCCESS = 'collect_help_success',
  COLLECT_COMPLETED = 'collect_completed',
  COLLECT_EXPIRED = 'collect_expired',
  GROUP_BUY_CREATED = 'group_buy_created',
  GROUP_BUY_JOINED = 'group_buy_joined',
  GROUP_BUY_COMPLETED = 'group_buy_completed',
  GROUP_BUY_EXPIRED = 'group_buy_expired',
  TIERED_REWARD_AWARDED = 'tiered_reward_awarded',
}

export enum NotificationStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  UNREAD = 'unread',
  READ = 'read',
  DELETED = 'deleted',
}

export interface NotificationAttributes {
  id: number; // 通知ID
  title: string; // 通知标题
  content: string; // 通知内容
  type: NotificationType; // 通知类型
  status: NotificationStatus; // 通知状态
  userId: number; // 接收用户ID
  sourceId: number | null; // 关联的源数据ID
  sourceType: string | null; // 关联的源数据类型
  data: any | null; // 额外数据
  readAt: Date | null; // 读取时间
  createdAt?: Date; // 创建时间
  updatedAt?: Date; // 更新时间
  deletedAt?: Date | null; // 删除时间
  totalCount: number; // 通知总接收人数
  readCount: number; // 已读人数
  cancelledAt: Date | null; // 取消时间
  cancelledBy: number | null; // 取消人ID
  cancelReason: string | null; // 取消原因
  sendAt: Date | null; // 发送时间
  senderId: number | null; // 发送人ID
}

export type NotificationCreationAttributes = Optional<NotificationAttributes, 'id' | 'status' | 'sourceId' | 'sourceType' | 'data' | 'readAt' | 'totalCount' | 'readCount' | 'cancelledAt' | 'cancelledBy' | 'cancelReason' | 'sendAt' | 'senderId' | 'createdAt' | 'updatedAt' | 'deletedAt'>;

export class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationAttributes {
  public id!: number;
 
  public title!: string;
 
  public content!: string;
 
  public type!: NotificationType;
 
  public status!: NotificationStatus;
 
  public userId!: number;
 
  public sourceId!: number | null;
 
  public sourceType!: string | null;

  public data!: any | null;

  public readAt!: Date | null;
 
  public readonly createdAt!: Date;
 
  public readonly updatedAt!: Date;
 
  public deletedAt!: Date | null;
 
  public totalCount!: number;
 
  public readCount!: number;
 
  public cancelledAt!: Date | null;
 
  public cancelledBy!: number | null;
 
  public cancelReason!: string | null;
 
  public sendAt!: Date | null;
 
  public senderId!: number | null;
 

  // Instance methods

  public async markAsRead(): Promise<void> {
    this.status = NotificationStatus.READ;
    this.readAt = new Date();
    await this.save();
  }

  public async markAsDeleted(): Promise<void> {
    this.status = NotificationStatus.DELETED;
    await this.save();
  }


  // Static methods
  static initModel(sequelize: Sequelize): void {
    Notification.init(
      {
        id: {
          type: DataTypes.INTEGER,
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
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'user_id',
          comment: '接收用户ID',
        },
        sourceId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: 'source_id',
          comment: '关联的源数据ID',
        },
        sourceType: {
          type: DataTypes.STRING(50),
          allowNull: true,
          field: 'source_type',
          comment: '关联的源数据类型',
        },
        data: {
          type: DataTypes.JSON,
          allowNull: true,
          comment: '额外数据',
        },
        readAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'read_at',
          comment: '读取时间',
        },
        totalCount: {
          type: DataTypes.INTEGER,
          field: 'total_count',
          allowNull: false,
          defaultValue: 0,
          comment: '通知总接收人数'
        },
        readCount: {
          type: DataTypes.INTEGER,
          field: 'read_count',
          allowNull: false,
          defaultValue: 0,
          comment: '已读人数'
        },
        cancelledAt: {
          type: DataTypes.DATE,
          field: 'cancelled_at',
          allowNull: true,
          comment: '取消时间'
        },
        cancelledBy: {
          type: DataTypes.INTEGER,
          field: 'cancelled_by',
          allowNull: true,
          comment: '取消人ID'
        },
        cancelReason: {
          type: DataTypes.STRING(255),
          field: 'cancel_reason',
          allowNull: true,
          comment: '取消原因'
        },
        sendAt: {
          type: DataTypes.DATE,
          field: 'send_at',
          allowNull: true,
          comment: '发送时间'
        },
        senderId: {
          type: DataTypes.INTEGER,
          field: 'sender_id',
          allowNull: true,
          comment: '发送人ID'
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'created_at',
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'updated_at',
        },
        deletedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'deleted_at',
        }
      },
      {
        sequelize,
        tableName: 'notifications',
        timestamps: true,
        paranoid: true,
        underscored: true,
      }
    );
  }

  static initAssociations(): void {
    Notification.belongsTo(User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    Notification.belongsTo(User, {
      foreignKey: 'sender_id',
      as: 'sender'
    });
    Notification.belongsTo(User, {
      foreignKey: 'cancelled_by',
      as: 'cancellingUser'
    });
  }
}

export default Notification;
