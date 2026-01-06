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
exports.initAIModelConfigAssociations = exports.initAIModelConfig = exports.AIModelConfig = exports.ModelStatus = exports.ModelType = void 0;
var sequelize_1 = require("sequelize");
/**
 * @openapi
 * components:
 *   schemas:
 *     ModelConfig:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *           description: 模型配置唯一标识符
 *         name:
 *           type: string
 *           example: "gpt-4"
 *           description: 模型名称
 *         displayName:
 *           type: string
 *           example: "GPT-4"
 *           description: 显示名称
 *         provider:
 *           type: string
 *           example: "OpenAI"
 *           description: 模型提供商
 *         modelType:
 *           type: string
 *           enum: [text, speech, image, video, multimodal]
 *           description: 模型类型
 *           example: "text"
 *         apiVersion:
 *           type: string
 *           example: "v1"
 *           description: API版本
 *         endpointUrl:
 *           type: string
 *           example: "https://api.openai.com/v1/chat/completions"
 *           description: 模型API端点URL
 *         modelParameters:
 *           type: object
 *           nullable: true
 *           description: 模型参数配置
 *           example: {"temperature": 0.7, "maxTokens": 4096}
 *         isDefault:
 *           type: boolean
 *           description: 是否为默认模型
 *           example: true
 *         status:
 *           type: string
 *           enum: [active, inactive, testing]
 *           description: 模型状态
 *           example: "active"
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
 *         - name
 *         - displayName
 *         - provider
 *         - modelType
 *         - endpointUrl
 */
/**
 * AI模型配置模型
 * 此模型用于存储不同AI模型的配置信息
 * 每个文件独立定义自己的类型，不使用共享类型
 */
// 定义模型类型枚举
var ModelType;
(function (ModelType) {
    ModelType["TEXT"] = "text";
    ModelType["SPEECH"] = "speech";
    ModelType["IMAGE"] = "image";
    ModelType["VIDEO"] = "video";
    ModelType["MULTIMODAL"] = "multimodal";
    ModelType["EMBEDDING"] = "embedding";
    ModelType["SEARCH"] = "search";
})(ModelType = exports.ModelType || (exports.ModelType = {}));
// 定义模型状态枚举
var ModelStatus;
(function (ModelStatus) {
    ModelStatus["ACTIVE"] = "active";
    ModelStatus["INACTIVE"] = "inactive";
    ModelStatus["TESTING"] = "testing";
})(ModelStatus = exports.ModelStatus || (exports.ModelStatus = {}));
/**
 * AI模型配置模型
 */
var AIModelConfig = /** @class */ (function (_super) {
    __extends(AIModelConfig, _super);
    function AIModelConfig() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return AIModelConfig;
}(sequelize_1.Model));
exports.AIModelConfig = AIModelConfig;
var initAIModelConfig = function (sequelize) {
    AIModelConfig.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            comment: '模型名称'
        },
        displayName: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            comment: '显示名称'
        },
        provider: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            comment: '提供商'
        },
        modelType: {
            type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(ModelType)),
            allowNull: false,
            comment: '模型类型'
        },
        apiVersion: {
            type: sequelize_1.DataTypes.STRING(20),
            defaultValue: 'v1',
            comment: 'API版本'
        },
        endpointUrl: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
            comment: '端点URL'
        },
        apiKey: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
            comment: 'API密钥(应加密存储)'
        },
        modelParameters: {
            type: sequelize_1.DataTypes.JSON,
            comment: '模型参数'
        },
        isDefault: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: false,
            comment: '是否为默认模型'
        },
        status: {
            type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(ModelStatus)),
            defaultValue: ModelStatus.INACTIVE,
            comment: '状态'
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            comment: '模型描述'
        },
        capabilities: {
            type: sequelize_1.DataTypes.JSON,
            comment: '模型能力列表'
        },
        maxTokens: {
            type: sequelize_1.DataTypes.INTEGER,
            comment: '最大令牌数'
        },
        creatorId: {
            type: sequelize_1.DataTypes.INTEGER,
            comment: '创建者ID'
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
        tableName: 'ai_model_config',
        timestamps: true,
        underscored: true,
        comment: '存储AI模型配置信息',
        indexes: [
            { unique: true, fields: ['name', 'provider'] },
            { fields: ['model_type'] },
            { fields: ['status'] },
        ]
    });
    return AIModelConfig;
};
exports.initAIModelConfig = initAIModelConfig;
var initAIModelConfigAssociations = function () {
    // 目前没有定义关联
};
exports.initAIModelConfigAssociations = initAIModelConfigAssociations;
