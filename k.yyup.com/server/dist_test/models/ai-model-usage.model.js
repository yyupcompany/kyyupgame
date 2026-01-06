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
exports.initAIModelUsageAssociations = exports.initAIModelUsage = exports.AIModelUsage = exports.PaymentStatus = exports.AIUsageStatus = exports.AIUsageType = void 0;
var sequelize_1 = require("sequelize");
var user_model_1 = require("./user.model");
var ai_model_config_model_1 = require("./ai-model-config.model");
/**
 * AI模型使用类型
 */
var AIUsageType;
(function (AIUsageType) {
    AIUsageType["TEXT"] = "text";
    AIUsageType["IMAGE"] = "image";
    AIUsageType["AUDIO"] = "audio";
    AIUsageType["VIDEO"] = "video";
    AIUsageType["EMBEDDING"] = "embedding";
})(AIUsageType = exports.AIUsageType || (exports.AIUsageType = {}));
/**
 * AI模型使用状态
 */
var AIUsageStatus;
(function (AIUsageStatus) {
    AIUsageStatus["PENDING"] = "pending";
    AIUsageStatus["SUCCESS"] = "success";
    AIUsageStatus["FAILED"] = "failed";
    AIUsageStatus["THROTTLED"] = "throttled";
})(AIUsageStatus = exports.AIUsageStatus || (exports.AIUsageStatus = {}));
/**
 * AI模型使用记录支付状态
 */
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["PAID"] = "paid";
    PaymentStatus["FAILED"] = "failed";
})(PaymentStatus = exports.PaymentStatus || (exports.PaymentStatus = {}));
/**
 * AI模型使用统计模型
 * 此模型用于记录和统计各AI模型的使用情况。
 * 遵循单一职责原则，仅定义数据模型和关联关系。
 */
var AIModelUsage = /** @class */ (function (_super) {
    __extends(AIModelUsage, _super);
    function AIModelUsage() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return AIModelUsage;
}(sequelize_1.Model));
exports.AIModelUsage = AIModelUsage;
var initAIModelUsage = function (sequelize) {
    AIModelUsage.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: '记录ID'
        },
        userId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            field: 'external_user_id',
            comment: '用户ID',
            references: {
                model: 'users',
                key: 'id'
            }
        },
        modelId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '模型ID',
            references: {
                model: 'ai_model_config',
                key: 'id'
            }
        },
        sessionId: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
            comment: '会话ID，用于追踪连续对话'
        },
        requestId: {
            type: sequelize_1.DataTypes.STRING(255),
            unique: true,
            allowNull: false,
            comment: '唯一请求ID'
        },
        usageType: {
            type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(AIUsageType)),
            allowNull: false,
            field: 'request_type',
            comment: '使用类型 (文本, 图像等)'
        },
        inputTokens: {
            type: sequelize_1.DataTypes.INTEGER,
            defaultValue: 0,
            field: 'tokens_input',
            comment: '输入token数量'
        },
        outputTokens: {
            type: sequelize_1.DataTypes.INTEGER,
            defaultValue: 0,
            field: 'tokens_output',
            comment: '输出token数量'
        },
        totalTokens: {
            type: sequelize_1.DataTypes.INTEGER,
            defaultValue: 0,
            comment: '总token数量'
        },
        processingTime: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'duration_ms',
            comment: '处理时间 (毫秒)'
        },
        cost: {
            type: sequelize_1.DataTypes.DECIMAL(10, 6),
            allowNull: true,
            defaultValue: 0.0,
            comment: '本次请求费用'
        },
        status: {
            type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(AIUsageStatus)),
            defaultValue: AIUsageStatus.PENDING,
            comment: '请求状态'
        },
        errorMessage: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '错误信息 (如果请求失败)'
        },
        requestTimestamp: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            comment: '请求时间戳'
        },
        responseTimestamp: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: '响应时间戳'
        },
        paymentStatus: {
            type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(PaymentStatus)),
            defaultValue: PaymentStatus.PENDING,
            comment: '支付状态'
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
        tableName: 'ai_model_usage',
        timestamps: true,
        underscored: true,
        comment: 'AI模型使用情况统计表',
        indexes: [
            { fields: ['user_id'] },
            { fields: ['model_id'] },
            { fields: ['session_id'] },
            { fields: ['request_timestamp'] },
        ]
    });
    return AIModelUsage;
};
exports.initAIModelUsage = initAIModelUsage;
var initAIModelUsageAssociations = function () {
    // 一个使用记录属于一个用户
    AIModelUsage.belongsTo(user_model_1.User, {
        foreignKey: 'userId',
        as: 'user'
    });
    // 一个使用记录关联一个AI模型配置
    AIModelUsage.belongsTo(ai_model_config_model_1.AIModelConfig, {
        foreignKey: 'modelId',
        as: 'modelConfig'
    });
};
exports.initAIModelUsageAssociations = initAIModelUsageAssociations;
