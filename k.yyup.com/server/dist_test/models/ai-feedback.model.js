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
exports.initAIFeedbackAssociations = exports.initAIFeedback = exports.AIFeedback = exports.FeedbackStatus = exports.FeedbackSource = exports.FeedbackType = void 0;
var sequelize_1 = require("sequelize");
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
var FeedbackType;
(function (FeedbackType) {
    FeedbackType["GENERAL"] = "general";
    FeedbackType["RESPONSE"] = "response";
    FeedbackType["SUGGESTION"] = "suggestion";
    FeedbackType["BUG"] = "bug";
    FeedbackType["FEATURE"] = "feature";
})(FeedbackType = exports.FeedbackType || (exports.FeedbackType = {}));
// 定义反馈来源枚举
var FeedbackSource;
(function (FeedbackSource) {
    FeedbackSource["CONVERSATION"] = "conversation";
    FeedbackSource["MESSAGE"] = "message";
    FeedbackSource["APPLICATION"] = "application";
    FeedbackSource["SYSTEM"] = "system";
})(FeedbackSource = exports.FeedbackSource || (exports.FeedbackSource = {}));
// 定义反馈状态枚举
var FeedbackStatus;
(function (FeedbackStatus) {
    FeedbackStatus["PENDING"] = "pending";
    FeedbackStatus["REVIEWED"] = "reviewed";
    FeedbackStatus["RESOLVED"] = "resolved";
    FeedbackStatus["IGNORED"] = "ignored";
})(FeedbackStatus = exports.FeedbackStatus || (exports.FeedbackStatus = {}));
/**
 * AI反馈模型
 * 用于存储用户对AI系统功能和响应的反馈信息
 */
var AIFeedback = /** @class */ (function (_super) {
    __extends(AIFeedback, _super);
    function AIFeedback() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return AIFeedback;
}(sequelize_1.Model));
exports.AIFeedback = AIFeedback;
var initAIFeedback = function (sequelize) {
    AIFeedback.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        userId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '提交反馈的用户ID'
        },
        feedbackType: {
            type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(FeedbackType)),
            allowNull: false,
            comment: '反馈类型'
        },
        sourceType: {
            type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(FeedbackSource)),
            allowNull: false,
            comment: '反馈来源类型'
        },
        sourceId: {
            type: sequelize_1.DataTypes.STRING(64),
            allowNull: true,
            comment: '反馈来源ID'
        },
        content: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
            comment: '反馈内容'
        },
        rating: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '反馈评分（1-5）',
            validate: { min: 1, max: 5 }
        },
        status: {
            type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(FeedbackStatus)),
            defaultValue: FeedbackStatus.PENDING,
            comment: '反馈状态'
        },
        adminNotes: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '管理员处理备注'
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW
        }
    }, {
        sequelize: sequelize,
        tableName: 'ai_feedbacks',
        timestamps: true,
        underscored: true,
        comment: '存储用户对AI系统的反馈',
        indexes: [
            { fields: ['user_id'] },
            { fields: ['status'] },
            { fields: ['source_type', 'source_id'] },
        ]
    });
    return AIFeedback;
};
exports.initAIFeedback = initAIFeedback;
var initAIFeedbackAssociations = function () {
    // 目前没有定义关联
};
exports.initAIFeedbackAssociations = initAIFeedbackAssociations;
