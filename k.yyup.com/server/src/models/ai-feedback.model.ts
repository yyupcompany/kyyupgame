import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, Sequelize } from 'sequelize';

/**
 * @openapi
 * components:
 *   schemas:
 *     Feedback:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *           description: 反馈唯一标识符
 *         userId:
 *           type: integer
 *           description: 提交反馈的用户ID
 *           example: 1001
 *         feedbackType:
 *           type: string
 *           enum: [general, response, suggestion, bug, feature]
 *           description: 反馈类型
 *           example: "suggestion"
 *         sourceType:
 *           type: string
 *           enum: [conversation, message, application, system]
 *           description: 反馈来源类型
 *           example: "conversation"
 *         sourceId:
 *           type: string
 *           nullable: true
 *           description: 反馈来源ID（如会话ID、消息ID）
 *           example: "conv-12345-abcde"
 *         content:
 *           type: string
 *           description: 反馈内容
 *           example: "希望能增加更多的模型选择"
 *         rating:
 *           type: integer
 *           nullable: true
 *           minimum: 1
 *           maximum: 5
 *           description: 反馈评分（1-5分）
 *           example: 4
 *         status:
 *           type: string
 *           enum: [pending, reviewed, resolved, ignored]
 *           description: 反馈处理状态
 *           example: "pending"
 *         adminNotes:
 *           type: string
 *           nullable: true
 *           description: 管理员处理备注
 *           example: null
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
 *         - userId
 *         - feedbackType
 *         - sourceType
 *         - content
 */

/**
 * AI反馈模型
 * 用于存储用户对AI系统功能和响应的反馈信息
 * 每个文件独立定义自己的类型，不使用共享类型
 */

// 定义反馈类型枚举
export enum FeedbackType {
  GENERAL = 'general',
  RESPONSE = 'response',
  SUGGESTION = 'suggestion',
  BUG = 'bug',
  FEATURE = 'feature',
}

// 定义反馈来源枚举
export enum FeedbackSource {
  CONVERSATION = 'conversation',
  MESSAGE = 'message',
  APPLICATION = 'application',
  SYSTEM = 'system',
}

// 定义反馈状态枚举
export enum FeedbackStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  RESOLVED = 'resolved',
  IGNORED = 'ignored',
}

/**
 * AI反馈模型
 * 用于存储用户对AI系统功能和响应的反馈信息
 */
export class AIFeedback extends Model<
  InferAttributes<AIFeedback>,
  InferCreationAttributes<AIFeedback>
> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare messageId: number | null;
  declare conversationId: string | null;
  declare feedbackType: FeedbackType;
  declare sourceType: FeedbackSource;
  declare sourceId: string | null;
  declare content: string;
  declare rating: number | null;
  declare status: CreationOptional<FeedbackStatus>;
  declare adminNotes: string | null;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

export const initAIFeedback = (sequelize: Sequelize) => {
  AIFeedback.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '提交反馈的用户ID',
      },
      messageId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '关联的消息ID',
        field: 'message_id',
      },
      conversationId: {
        type: DataTypes.STRING(36),
        allowNull: true,
        comment: '关联的会话ID',
        field: 'conversation_id',
      },
      feedbackType: {
        type: DataTypes.ENUM(...Object.values(FeedbackType)),
        allowNull: false,
        comment: '反馈类型',
        field: 'feedback_type',
      },
      sourceType: {
        type: DataTypes.ENUM(...Object.values(FeedbackSource)),
        allowNull: false,
        comment: '反馈来源类型',
        field: 'source_type',
      },
      sourceId: {
        type: DataTypes.STRING(64),
        allowNull: true,
        comment: '反馈来源ID',
        field: 'source_id',
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '反馈内容',
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '反馈评分（1-5）',
        validate: { min: 1, max: 5 },
      },
      status: {
        type: DataTypes.ENUM(...Object.values(FeedbackStatus)),
        defaultValue: FeedbackStatus.PENDING,
        comment: '反馈状态',
      },
      adminNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '管理员处理备注',
        field: 'admin_notes',
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
      tableName: 'ai_feedbacks',
      timestamps: true,
      underscored: true,
      comment: '存储用户对AI系统的反馈',
      indexes: [
        { fields: ['user_id'] },
        { fields: ['status'] },
        { fields: ['source_type', 'source_id'] },
        { fields: ['message_id'] },
        { fields: ['conversation_id'] },
      ],
    }
  );

  return AIFeedback;
};

export const initAIFeedbackAssociations = () => {
  // 目前没有定义关联
}; 