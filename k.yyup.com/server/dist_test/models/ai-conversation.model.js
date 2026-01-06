"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.initAIConversationAssociations = exports.initAIConversation = exports.AIConversation = void 0;
var sequelize_1 = require("sequelize");
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
var AIConversation = /** @class */ (function (_super) {
    __extends(AIConversation, _super);
    function AIConversation() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return AIConversation;
}(sequelize_1.Model));
exports.AIConversation = AIConversation;
var initAIConversation = function (sequelize) {
    AIConversation.init({
        id: {
            type: sequelize_1.DataTypes.STRING(36),
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            comment: '会话ID (UUID)'
        },
        userId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '关联的用户ID',
            field: 'external_user_id'
        },
        title: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            comment: '会话标题'
        },
        summary: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '会话摘要'
        },
        lastMessageAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
            comment: '最后消息时间',
            field: 'last_message_at'
        },
        messageCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '消息数量',
            field: 'message_count'
        },
        isArchived: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: '是否归档',
            field: 'is_archived'
        },
        // TOKEN优化：页面感知缓存字段
        lastPagePath: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
            comment: '最后访问的页面路径',
            field: 'last_page_path'
        },
        pageContext: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '缓存的页面上下文信息',
            field: 'page_context'
        },
        lastPageUpdateAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: '页面上下文最后更新时间',
            field: 'last_page_update_at'
        },
        usedMemoryIds: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            comment: '已使用的记忆ID列表',
            field: 'used_memory_ids'
        },
        metadata: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            comment: '会话元数据（如机构现状加载状态）',
            field: 'metadata'
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
            field: 'created_at'
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
            field: 'updated_at'
        }
    }, {
        sequelize: sequelize,
        tableName: 'ai_conversations',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                name: 'external_user_id_idx',
                fields: ['external_user_id']
            },
            {
                name: 'last_message_at_idx',
                fields: ['last_message_at']
            },
            {
                name: 'is_archived_idx',
                fields: ['is_archived']
            },
        ],
        comment: '存储AI会话记录'
    });
    return AIConversation;
};
exports.initAIConversation = initAIConversation;
var initAIConversationAssociations = function () {
    // 目前没有定义关联
};
exports.initAIConversationAssociations = initAIConversationAssociations;
