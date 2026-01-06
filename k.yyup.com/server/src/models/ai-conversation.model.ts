import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, Sequelize } from 'sequelize';

/**
 * @openapi
 * components:
 *   schemas:
 *     Conversation:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "conv-12345-abcde"
 *           description: 会话唯一标识符 (UUID)
 *         userId:
 *           type: integer
 *           description: 关联的用户ID
 *           example: 1001
 *         title:
 *           type: string
 *           nullable: true
 *           description: 会话标题
 *           example: "教学计划讨论"
 *         summary:
 *           type: string
 *           nullable: true
 *           description: 会话摘要
 *           example: "关于下学期教学计划的讨论"
 *         lastMessageAt:
 *           type: string
 *           format: date-time
 *           description: 最后消息时间
 *           example: "2023-06-15T09:45:10Z"
 *         messageCount:
 *           type: integer
 *           description: 消息数量
 *           example: 15
 *         isArchived:
 *           type: boolean
 *           description: 是否归档
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *           example: "2023-06-14T10:20:30Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *           example: "2023-06-15T09:45:10Z"
 *       required:
 *         - userId
 *     ConversationListResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Conversation'
 *         meta:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *               example: 1
 *             pageSize:
 *               type: integer
 *               example: 10
 *             totalItems:
 *               type: integer
 *               example: 35
 *             totalPages:
 *               type: integer
 *               example: 4
 */

/**
 * AI会话模型
 * 此模型用于管理用户与AI之间的会话。
 * 类型定义遵循现代Sequelize规范。
 */

export class AIConversation extends Model<
  InferAttributes<AIConversation>,
  InferCreationAttributes<AIConversation>
> {
  declare id: CreationOptional<string>;
  declare userId: number;
  declare title: string | null;
  declare summary: string | null;
  declare lastMessageAt: CreationOptional<Date>;
  declare messageCount: CreationOptional<number>;
  declare isArchived: CreationOptional<boolean>;

  // TOKEN优化：页面感知缓存字段
  declare lastPagePath: string | null;
  declare pageContext: string | null;
  declare lastPageUpdateAt: Date | null;
  declare usedMemoryIds: number[] | null;

  // 会话元数据字段（用于存储机构现状加载状态等）
  declare metadata: Record<string, any> | null;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

export const initAIConversation = (sequelize: Sequelize) => {
  AIConversation.init(
    {
      id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        comment: '会话ID (UUID)',
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '关联的用户ID',
        field: 'external_user_id',
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '会话标题',
      },
      summary: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '会话摘要',
      },
      lastMessageAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '最后消息时间',
        field: 'last_message_at',
      },
      messageCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '消息数量',
        field: 'message_count',
      },
      isArchived: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '是否归档',
        field: 'is_archived',
      },
      // TOKEN优化：页面感知缓存字段
      lastPagePath: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '最后访问的页面路径',
        field: 'last_page_path',
      },
      pageContext: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '缓存的页面上下文信息',
        field: 'page_context',
      },
      lastPageUpdateAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '页面上下文最后更新时间',
        field: 'last_page_update_at',
      },
      usedMemoryIds: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: '已使用的记忆ID列表',
        field: 'used_memory_ids',
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: '会话元数据（如机构现状加载状态）',
        field: 'metadata',
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
      tableName: 'ai_conversations',
      timestamps: true,
      underscored: true, // 使用underscored会自动将所有驼峰字段映射到下划线，无需单独设置field
      indexes: [
        {
          name: 'external_user_id_idx',
          fields: ['external_user_id'],
        },
        {
          name: 'last_message_at_idx',
          fields: ['last_message_at'],
        },
        {
          name: 'is_archived_idx',
          fields: ['is_archived'],
        },
      ],
      comment: '存储AI会话记录',
    }
  );

  return AIConversation;
};

export const initAIConversationAssociations = () => {
  // 会话与消息的关联
  // 在这里设置关联关系，避免循环依赖
  // 关联关系将在 models/index.ts 中统一处理
};
