import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, Sequelize } from 'sequelize';

/**
 * @openapi
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "msg-12345-abcde"
 *           description: 消息唯一标识符 (UUID)
 *         conversationId:
 *           type: string
 *           format: uuid
 *           description: 关联的会话ID
 *           example: "conv-12345-abcde"
 *         userId:
 *           type: integer
 *           description: 关联的用户ID
 *           example: 1001
 *         role:
 *           type: string
 *           enum: [user, assistant, system]
 *           description: 消息发送者角色
 *           example: "user"
 *         content:
 *           type: string
 *           description: 消息内容
 *           example: "我想了解更多关于AI的知识"
 *         messageType:
 *           type: string
 *           enum: [text, image, audio, video, file]
 *           description: 消息类型
 *           example: "text"
 *         mediaUrl:
 *           type: string
 *           nullable: true
 *           description: 媒体文件URL（仅适用于非文本消息）
 *           example: null
 *         metadata:
 *           type: object
 *           nullable: true
 *           description: 元数据，可存储额外信息
 *           example: null
 *         tokens:
 *           type: integer
 *           description: 令牌数（用于计算使用量）
 *           example: 15
 *         status:
 *           type: string
 *           enum: [sending, delivered, failed]
 *           description: 消息状态
 *           example: "delivered"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *           example: "2023-06-15T09:45:10Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *           example: "2023-06-15T09:45:10Z"
 *       required:
 *         - conversationId
 *         - userId
 *         - role
 *         - content
 *     MessageListResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Message'
 *         meta:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *               example: 1
 *             pageSize:
 *               type: integer
 *               example: 20
 *             totalItems:
 *               type: integer
 *               example: 35
 *             totalPages:
 *               type: integer
 *               example: 2
 */

/**
 * AI消息模型
 * 此模型用于存储用户和AI之间的对话消息
 * 每个文件独立定义自己的类型，不使用共享类型
 */

// 定义消息角色枚举
export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
  TOOL = 'tool', // 工具调用结果消息
}

// 定义消息类型枚举
export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  FILE = 'file',
}

// 定义消息状态枚举
export enum MessageStatus {
  SENDING = 'sending',
  DELIVERED = 'delivered',
  FAILED = 'failed',
}

/**
 * AI消息模型
 * 用于存储用户和AI之间的对话消息
 */
export class AIMessage extends Model<
  InferAttributes<AIMessage>,
  InferCreationAttributes<AIMessage>
> {
  declare id: CreationOptional<number>;
  declare conversationId: string;
  declare userId: number;
  declare role: MessageRole;
  declare content: string;
  declare messageType: CreationOptional<MessageType>;
  declare mediaUrl: CreationOptional<string | null>;
  declare metadata: CreationOptional<any | null>;
  declare tokens: CreationOptional<number>;
  declare status: CreationOptional<MessageStatus>;
  declare isDeleted: CreationOptional<boolean>;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  static initModel(sequelize: Sequelize) {
    return initAIMessage(sequelize);
  }
}

export const initAIMessage = (sequelize: Sequelize) => {
  AIMessage.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '消息ID (自增)',
      },
      conversationId: {
        type: DataTypes.STRING(36),
        allowNull: false,
        field: 'conversation_id',
        comment: '会话ID',
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        comment: '关联的用户ID',
      },
      role: {
        type: DataTypes.ENUM(...Object.values(MessageRole)),
        allowNull: false,
        comment: '消息角色(用户/助手/系统)',
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '消息内容',
      },
      messageType: {
        type: DataTypes.ENUM(...Object.values(MessageType)),
        allowNull: false,
        defaultValue: MessageType.TEXT,
        field: 'message_type',
        comment: '消息类型',
      },
      mediaUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'media_url',
        comment: '媒体文件URL',
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
        comment: '消息元数据',
      },
      tokens: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '令牌数',
      },
      status: {
        type: DataTypes.ENUM(...Object.values(MessageStatus)),
        allowNull: false,
        defaultValue: MessageStatus.DELIVERED,
        comment: '消息状态',
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_deleted',
        comment: '是否删除',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
      },
    },
    {
      sequelize,
      tableName: 'ai_messages',
      timestamps: true,
      underscored: false,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }
  );
  return AIMessage;
};

export const initAIMessageAssociations = () => {
  // 在这里设置关联关系，避免循环依赖
  // 关联关系将在 models/index.ts 中统一处理
};

