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
 * 模板状态
 */
export enum TemplateStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING_REVIEW = 'pending_review',
  REJECTED = 'rejected',
}

export class MessageTemplate extends Model<
  InferAttributes<MessageTemplate>,
  InferCreationAttributes<MessageTemplate>
> {
  declare id: CreationOptional<number>;
  declare templateCode: string;
  declare name: string;
  declare messageType: MessageType;
  declare titleTemplate: string | null;
  declare contentTemplate: string;
  declare variables: CreationOptional<any | null>;
  declare language: CreationOptional<string>;
  declare description: string | null;
  declare category: string | null;
  declare providerTemplateId: string | null;
  declare provider: string | null;
  declare status: CreationOptional<TemplateStatus>;
  declare rejectionReason: string | null;
  declare creatorId: ForeignKey<User['id']> | null;
  declare updaterId: ForeignKey<User['id']> | null;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  // Associations
  public readonly creator?: User;
  public readonly updater?: User;
}

export const initMessageTemplate = (sequelize: Sequelize) => {
  MessageTemplate.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: '模板ID',
      },
      templateCode: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: '模板编码',
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '模板名称',
      },
      messageType: {
        type: DataTypes.ENUM(...Object.values(MessageType)),
        allowNull: false,
        comment: '消息类型: sms, email, wechat, push, internal',
      },
      titleTemplate: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '标题模板',
      },
      contentTemplate: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '内容模板',
      },
      variables: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: '变量(JSON)',
      },
      language: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'zh-CN',
        comment: '语言',
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '描述',
      },
      category: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '分类',
      },
      providerTemplateId: {
        type: DataTypes.STRING(64),
        allowNull: true,
        comment: '供应商模板ID',
      },
      provider: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '供应商',
      },
      status: {
        type: DataTypes.ENUM(...Object.values(TemplateStatus)),
        allowNull: false,
        defaultValue: TemplateStatus.ACTIVE,
        comment: '状态: active, inactive, pending_review, rejected',
      },
      rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '拒绝原因',
      },
      creatorId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: '创建者ID',
      },
      updaterId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: '更新者ID',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '创建时间',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '更新时间',
      },
    },
    {
      sequelize,
      tableName: 'message_templates',
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );
  return MessageTemplate;
};

export const initMessageTemplateAssociations = () => {
  MessageTemplate.belongsTo(User, {
    foreignKey: 'creatorId',
    as: 'creator',
  });
  MessageTemplate.belongsTo(User, {
    foreignKey: 'updaterId',
    as: 'updater',
  });
};
