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
exports.initAIMessageAssociations = exports.initAIMessage = exports.AIMessage = exports.MessageStatus = exports.MessageType = exports.MessageRole = void 0;
var sequelize_1 = require("sequelize");
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
var MessageRole;
(function (MessageRole) {
    MessageRole["USER"] = "user";
    MessageRole["ASSISTANT"] = "assistant";
    MessageRole["SYSTEM"] = "system";
    MessageRole["TOOL"] = "tool";
})(MessageRole = exports.MessageRole || (exports.MessageRole = {}));
// 定义消息类型枚举
var MessageType;
(function (MessageType) {
    MessageType["TEXT"] = "text";
    MessageType["IMAGE"] = "image";
    MessageType["AUDIO"] = "audio";
    MessageType["VIDEO"] = "video";
    MessageType["FILE"] = "file";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
// 定义消息状态枚举
var MessageStatus;
(function (MessageStatus) {
    MessageStatus["SENDING"] = "sending";
    MessageStatus["DELIVERED"] = "delivered";
    MessageStatus["FAILED"] = "failed";
})(MessageStatus = exports.MessageStatus || (exports.MessageStatus = {}));
/**
 * AI消息模型
 * 用于存储用户和AI之间的对话消息
 */
var AIMessage = /** @class */ (function (_super) {
    __extends(AIMessage, _super);
    function AIMessage() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return AIMessage;
}(sequelize_1.Model));
exports.AIMessage = AIMessage;
var initAIMessage = function (sequelize) {
    AIMessage.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: '消息ID (自增)'
        },
        conversationId: {
            type: sequelize_1.DataTypes.STRING(36),
            allowNull: false,
            field: 'conversation_id',
            comment: '会话ID'
        },
        userId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            field: 'user_id',
            comment: '关联的用户ID'
        },
        role: {
            type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(MessageRole)),
            allowNull: false,
            comment: '消息角色(用户/助手/系统)'
        },
        content: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
            comment: '消息内容'
        },
        messageType: {
            type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(MessageType)),
            allowNull: false,
            defaultValue: MessageType.TEXT,
            field: 'message_type',
            comment: '消息类型'
        },
        mediaUrl: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
            field: 'media_url',
            comment: '媒体文件URL'
        },
        metadata: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            defaultValue: {},
            comment: '消息元数据'
        },
        tokens: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '令牌数'
        },
        status: {
            type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(MessageStatus)),
            allowNull: false,
            defaultValue: MessageStatus.DELIVERED,
            comment: '消息状态'
        },
        isDeleted: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_deleted',
            comment: '是否删除'
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
        tableName: 'ai_messages',
        timestamps: true,
        underscored: false,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    });
    return AIMessage;
};
exports.initAIMessage = initAIMessage;
var initAIMessageAssociations = function () {
    // 目前没有定义关联
};
exports.initAIMessageAssociations = initAIMessageAssociations;
