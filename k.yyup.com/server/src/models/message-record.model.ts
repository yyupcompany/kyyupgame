import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from 'sequelize';
import { User } from './user.model';
import { MessageTemplate } from './message-template.model';

/**
 * 发送者类型
 */
export enum SenderType {
  USER = 'user',
  SYSTEM = 'system',
  ADMIN = 'admin',
}

/**
 * 接收者类型
 */
export enum ReceiverType {
  USER = 'user',
  ADMIN = 'admin',
  GROUP = 'group',
}

/**
 * 消息类型
 */
export enum MessageType {
  SMS = 'sms',
  EMAIL = 'email',
  WECHAT = 'wechat',
  PUSH = 'push',
  INTERNAL = 'internal',
}

/**
 * 消息状态
 */
export enum MessageStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  READ = 'read',
}

export class MessageRecord extends Model<
  InferAttributes<MessageRecord>,
  InferCreationAttributes<MessageRecord>
> {
  declare id: CreationOptional<number>;
  declare senderId: ForeignKey<User['id']>;
  declare senderType: SenderType;
  declare receiverId: ForeignKey<User['id']>;
  declare receiverType: ReceiverType;
  declare messageType: MessageType;
  declare templateId: ForeignKey<MessageTemplate['id']> | null;
  declare title: string | null;
  declare content: string;
  declare variables: any | null;
  declare attachments: any | null;
  declare status: CreationOptional<MessageStatus>;
  declare errorMessage: string | null;
  declare provider: string | null;
  declare externalId: string | null;
  declare sentAt: Date | null;
  declare deliveredAt: Date | null;
  declare readAt: Date | null;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  // Associations
  public readonly sender?: User;
  public readonly receiver?: User;
  public readonly template?: MessageTemplate;
}

export const initMessageRecord = (sequelize: Sequelize) => {
  MessageRecord.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        comment: '记录ID',
      },
      senderId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: '发送者ID',
      },
      senderType: {
        type: DataTypes.ENUM(...Object.values(SenderType)),
        allowNull: false,
        defaultValue: SenderType.SYSTEM,
        comment: '发送者类型：user, system, admin',
      },
      receiverId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: '接收者ID',
      },
      receiverType: {
        type: DataTypes.ENUM(...Object.values(ReceiverType)),
        allowNull: false,
        defaultValue: ReceiverType.USER,
        comment: '接收者类型：user, admin, group',
      },
      messageType: {
        type: DataTypes.ENUM(...Object.values(MessageType)),
        allowNull: false,
        comment: '消息类型：sms, email, wechat, push, internal',
      },
      templateId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: '消息模板ID',
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '消息标题',
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '消息内容',
      },
      variables: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: '消息变量(JSON)',
      },
      attachments: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: '消息附件(JSON)',
      },
      status: {
        type: DataTypes.ENUM(...Object.values(MessageStatus)),
        allowNull: false,
        defaultValue: MessageStatus.PENDING,
        comment: '消息状态：pending, sent, delivered, failed, read',
      },
      errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '错误信息',
      },
      provider: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '服务提供商',
      },
      externalId: {
        type: DataTypes.STRING(64),
        allowNull: true,
        comment: '外部ID/追踪ID',
      },
      sentAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '发送时间',
      },
      deliveredAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '送达时间',
      },
      readAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '阅读时间',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'message_records',
      timestamps: true,
      underscored: true,
    }
  );
  return MessageRecord;
};

export const initMessageRecordAssociations = () => {
  MessageRecord.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
  MessageRecord.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });
  MessageRecord.belongsTo(MessageTemplate, {
    foreignKey: 'templateId',
    as: 'template',
  });
};
