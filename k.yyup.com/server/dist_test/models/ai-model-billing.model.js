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
exports.initAIModelBilling = exports.AIModelBilling = exports.BillingType = exports.BillingCycle = void 0;
var sequelize_1 = require("sequelize");
/**
 * @openapi
 * components:
 *   schemas:
 *     ModelBilling:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *           description: 计费规则唯一标识符
 *         modelId:
 *           type: integer
 *           description: 关联的模型ID
 *           example: 1
 *         billingType:
 *           type: string
 *           enum: [token, subscription, one-time]
 *           description: 计费类型
 *           example: "token"
 *         inputTokenPrice:
 *           type: number
 *           format: float
 *           description: 输入token价格
 *           example: 0.00001
 *         outputTokenPrice:
 *           type: number
 *           format: float
 *           description: 输出token价格
 *           example: 0.00002
 *         imageGenerationPrice:
 *           type: number
 *           format: float
 *           description: 图像生成价格
 *           example: 0.02
 *         audioTranscriptionPrice:
 *           type: number
 *           format: float
 *           description: 音频转录价格
 *           example: 0.006
 *         currencyCode:
 *           type: string
 *           description: 货币代码
 *           example: "USD"
 *         effectiveFrom:
 *           type: string
 *           format: date-time
 *           description: 生效日期
 *           example: "2023-06-01T00:00:00Z"
 *         effectiveTo:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: 失效日期
 *           example: null
 *         isActive:
 *           type: boolean
 *           description: 是否激活
 *           example: true
 *         discountTiers:
 *           type: object
 *           nullable: true
 *           description: 折扣层级
 *           example: {"tier1": {"threshold": 1000000, "discount": 0.1}, "tier2": {"threshold": 10000000, "discount": 0.2}}
 *         billingCycle:
 *           type: string
 *           enum: [monthly, yearly, on-demand]
 *           description: 计费周期
 *           example: "on-demand"
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
 *         - modelId
 *         - billingType
 *         - effectiveFrom
 */
/**
 * AI模型计费模型
 * 此模型用于存储不同AI模型的计费标准
 */
// 定义计费周期枚举
var BillingCycle;
(function (BillingCycle) {
    BillingCycle["HOURLY"] = "hourly";
    BillingCycle["DAILY"] = "daily";
    BillingCycle["MONTHLY"] = "monthly";
})(BillingCycle = exports.BillingCycle || (exports.BillingCycle = {}));
// 定义计费类型枚举
var BillingType;
(function (BillingType) {
    BillingType["TOKEN_BASED"] = "token_based";
    BillingType["CALL_BASED"] = "call_based";
})(BillingType = exports.BillingType || (exports.BillingType = {}));
/**
 * AI模型计费模型
 */
var AIModelBilling = /** @class */ (function (_super) {
    __extends(AIModelBilling, _super);
    function AIModelBilling() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return AIModelBilling;
}(sequelize_1.Model));
exports.AIModelBilling = AIModelBilling;
var initAIModelBilling = function (sequelize) {
    AIModelBilling.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        modelId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '模型ID'
        },
        billingType: {
            type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(BillingType)),
            allowNull: false,
            comment: '计费类型'
        },
        inputTokenPrice: {
            type: sequelize_1.DataTypes.DECIMAL(12, 8),
            defaultValue: 0.0,
            comment: '输入token价格',
            field: 'input_token_price'
        },
        outputTokenPrice: {
            type: sequelize_1.DataTypes.DECIMAL(12, 8),
            defaultValue: 0.0,
            comment: '输出token价格',
            field: 'output_token_price'
        },
        callPrice: {
            type: sequelize_1.DataTypes.DECIMAL(10, 4),
            defaultValue: 0.0,
            comment: '调用价格',
            field: 'call_price'
        },
        discountTiers: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            comment: '折扣层级',
            field: 'discount_tiers'
        },
        billingCycle: {
            type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(BillingCycle)),
            defaultValue: BillingCycle.MONTHLY,
            comment: '计费周期',
            field: 'billing_cycle'
        },
        balanceAlertThreshold: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: true,
            comment: '余额警告阈值',
            field: 'balance_alert_threshold'
        },
        tenantId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '租户ID',
            field: 'tenant_id'
        },
        isActive: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: true,
            comment: '是否激活',
            field: 'is_active'
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
        tableName: 'ai_model_billing',
        timestamps: true,
        underscored: true,
        comment: '存储AI模型计费标准'
    });
    return AIModelBilling;
};
exports.initAIModelBilling = initAIModelBilling;
