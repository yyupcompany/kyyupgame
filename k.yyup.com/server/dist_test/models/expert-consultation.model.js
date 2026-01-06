"use strict";
/**
 * 专家咨询数据模型
 * 支持多智能体专家咨询系统
 */
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
exports.setupExpertConsultationAssociations = exports.initExpertConsultationModels = exports.ConsultationSummary = exports.ActionPlan = exports.ExpertSpeech = exports.ExpertConsultation = void 0;
var sequelize_1 = require("sequelize");
/**
 * 专家咨询会话模型
 */
var ExpertConsultation = /** @class */ (function (_super) {
    __extends(ExpertConsultation, _super);
    function ExpertConsultation() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ExpertConsultation;
}(sequelize_1.Model));
exports.ExpertConsultation = ExpertConsultation;
/**
 * 专家发言记录模型
 */
var ExpertSpeech = /** @class */ (function (_super) {
    __extends(ExpertSpeech, _super);
    function ExpertSpeech() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ExpertSpeech;
}(sequelize_1.Model));
exports.ExpertSpeech = ExpertSpeech;
/**
 * 行动计划模型
 */
var ActionPlan = /** @class */ (function (_super) {
    __extends(ActionPlan, _super);
    function ActionPlan() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ActionPlan;
}(sequelize_1.Model));
exports.ActionPlan = ActionPlan;
/**
 * 咨询汇总模型
 */
var ConsultationSummary = /** @class */ (function (_super) {
    __extends(ConsultationSummary, _super);
    function ConsultationSummary() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ConsultationSummary;
}(sequelize_1.Model));
exports.ConsultationSummary = ConsultationSummary;
/**
 * 初始化专家咨询模型
 */
var initExpertConsultationModels = function (sequelize) {
    // 初始化专家咨询会话模型
    ExpertConsultation.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            comment: '咨询会话ID'
        },
        userId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '用户ID',
            references: {
                model: 'users',
                key: 'id'
            }
        },
        topic: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: false,
            comment: '咨询主题'
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
            comment: '问题描述'
        },
        urgency: {
            type: sequelize_1.DataTypes.ENUM('low', 'medium', 'high', 'critical'),
            defaultValue: 'medium',
            comment: '紧急程度'
        },
        expectedExperts: {
            type: sequelize_1.DataTypes.JSON,
            defaultValue: '[]',
            comment: '期望的专家类型列表'
        },
        context: {
            type: sequelize_1.DataTypes.JSON,
            defaultValue: '{}',
            comment: '背景信息和上下文'
        },
        status: {
            type: sequelize_1.DataTypes.ENUM('pending', 'active', 'completed', 'cancelled'),
            defaultValue: 'pending',
            comment: '会话状态'
        },
        progressPercentage: {
            type: sequelize_1.DataTypes.INTEGER,
            defaultValue: 0,
            validate: {
                min: 0,
                max: 100
            },
            comment: '进度百分比'
        },
        totalExperts: {
            type: sequelize_1.DataTypes.INTEGER,
            defaultValue: 0,
            comment: '参与专家总数'
        },
        currentRound: {
            type: sequelize_1.DataTypes.INTEGER,
            defaultValue: 1,
            comment: '当前轮次'
        },
        maxRounds: {
            type: sequelize_1.DataTypes.INTEGER,
            defaultValue: 5,
            comment: '最大轮次'
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
        tableName: 'expert_consultations',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                name: 'expert_consultations_user_id_idx',
                fields: ['user_id']
            },
            {
                name: 'expert_consultations_status_idx',
                fields: ['status']
            },
            {
                name: 'expert_consultations_urgency_idx',
                fields: ['urgency']
            },
            {
                name: 'expert_consultations_created_at_idx',
                fields: ['created_at']
            }
        ],
        comment: '专家咨询会话表'
    });
    // 初始化专家发言记录模型
    ExpertSpeech.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            comment: '发言记录ID'
        },
        consultationId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            comment: '咨询会话ID',
            references: {
                model: 'expert_consultations',
                key: 'id'
            }
        },
        expertType: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            comment: '专家类型'
        },
        expertName: {
            type: sequelize_1.DataTypes.STRING(200),
            allowNull: false,
            comment: '专家名称'
        },
        content: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
            comment: '发言内容'
        },
        round: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            comment: '发言轮次'
        },
        order: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '在该轮次中的发言顺序'
        },
        confidence: {
            type: sequelize_1.DataTypes.FLOAT,
            defaultValue: 0.8,
            validate: {
                min: 0.0,
                max: 1.0
            },
            comment: '发言置信度'
        },
        keywords: {
            type: sequelize_1.DataTypes.JSON,
            defaultValue: '[]',
            comment: '关键词标签'
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
        tableName: 'expert_speeches',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                name: 'expert_speeches_consultation_id_idx',
                fields: ['consultation_id']
            },
            {
                name: 'expert_speeches_round_order_idx',
                fields: ['round', 'order']
            },
            {
                name: 'expert_speeches_expert_type_idx',
                fields: ['expert_type']
            }
        ],
        comment: '专家发言记录表'
    });
    // 初始化行动计划模型
    ActionPlan.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            comment: '行动计划ID'
        },
        consultationId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            comment: '咨询会话ID',
            references: {
                model: 'expert_consultations',
                key: 'id'
            }
        },
        planType: {
            type: sequelize_1.DataTypes.ENUM('immediate', 'short-term', 'long-term'),
            allowNull: false,
            comment: '计划类型'
        },
        priority: {
            type: sequelize_1.DataTypes.ENUM('low', 'medium', 'high'),
            defaultValue: 'medium',
            comment: '优先级'
        },
        title: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: false,
            comment: '计划标题'
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
            comment: '计划描述'
        },
        timeline: {
            type: sequelize_1.DataTypes.STRING(200),
            allowNull: false,
            comment: '时间规划'
        },
        resources: {
            type: sequelize_1.DataTypes.JSON,
            defaultValue: '[]',
            comment: '所需资源'
        },
        constraints: {
            type: sequelize_1.DataTypes.JSON,
            defaultValue: '[]',
            comment: '约束条件'
        },
        expectedOutcome: {
            type: sequelize_1.DataTypes.TEXT,
            comment: '预期结果'
        },
        successMetrics: {
            type: sequelize_1.DataTypes.JSON,
            defaultValue: '[]',
            comment: '成功指标'
        },
        status: {
            type: sequelize_1.DataTypes.ENUM('pending', 'in-progress', 'completed', 'cancelled'),
            defaultValue: 'pending',
            comment: '执行状态'
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
        tableName: 'action_plans',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                name: 'action_plans_consultation_id_idx',
                fields: ['consultation_id']
            },
            {
                name: 'action_plans_plan_type_idx',
                fields: ['plan_type']
            },
            {
                name: 'action_plans_priority_idx',
                fields: ['priority']
            },
            {
                name: 'action_plans_status_idx',
                fields: ['status']
            }
        ],
        comment: '行动计划表'
    });
    // 初始化咨询汇总模型
    ConsultationSummary.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            comment: '汇总ID'
        },
        consultationId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            unique: true,
            comment: '咨询会话ID',
            references: {
                model: 'expert_consultations',
                key: 'id'
            }
        },
        executiveSummary: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
            comment: '执行摘要'
        },
        keyInsights: {
            type: sequelize_1.DataTypes.JSON,
            defaultValue: '[]',
            comment: '关键洞察'
        },
        consensusPoints: {
            type: sequelize_1.DataTypes.JSON,
            defaultValue: '[]',
            comment: '一致观点'
        },
        conflictingViews: {
            type: sequelize_1.DataTypes.JSON,
            defaultValue: '[]',
            comment: '分歧观点'
        },
        recommendations: {
            type: sequelize_1.DataTypes.JSON,
            defaultValue: '[]',
            comment: '建议事项'
        },
        nextSteps: {
            type: sequelize_1.DataTypes.JSON,
            defaultValue: '[]',
            comment: '后续步骤'
        },
        participatingExperts: {
            type: sequelize_1.DataTypes.JSON,
            defaultValue: '[]',
            comment: '参与专家'
        },
        confidenceScore: {
            type: sequelize_1.DataTypes.FLOAT,
            defaultValue: 0.8,
            validate: {
                min: 0.0,
                max: 1.0
            },
            comment: '整体置信度'
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
        tableName: 'consultation_summaries',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                name: 'consultation_summaries_consultation_id_idx',
                fields: ['consultation_id']
            },
            {
                name: 'consultation_summaries_confidence_score_idx',
                fields: ['confidence_score']
            }
        ],
        comment: '咨询汇总表'
    });
    return {
        ExpertConsultation: ExpertConsultation,
        ExpertSpeech: ExpertSpeech,
        ActionPlan: ActionPlan,
        ConsultationSummary: ConsultationSummary
    };
};
exports.initExpertConsultationModels = initExpertConsultationModels;
/**
 * 设置模型关联关系
 */
var setupExpertConsultationAssociations = function () {
    // 专家咨询会话 与 专家发言记录 的关联
    ExpertConsultation.hasMany(ExpertSpeech, {
        foreignKey: 'consultationId',
        as: 'speeches',
        onDelete: 'CASCADE'
    });
    ExpertSpeech.belongsTo(ExpertConsultation, {
        foreignKey: 'consultationId',
        as: 'consultation'
    });
    // 专家咨询会话 与 行动计划 的关联
    ExpertConsultation.hasMany(ActionPlan, {
        foreignKey: 'consultationId',
        as: 'actionPlans',
        onDelete: 'CASCADE'
    });
    ActionPlan.belongsTo(ExpertConsultation, {
        foreignKey: 'consultationId',
        as: 'consultation'
    });
    // 专家咨询会话 与 咨询汇总 的关联
    ExpertConsultation.hasOne(ConsultationSummary, {
        foreignKey: 'consultationId',
        as: 'summary',
        onDelete: 'CASCADE'
    });
    ConsultationSummary.belongsTo(ExpertConsultation, {
        foreignKey: 'consultationId',
        as: 'consultation'
    });
};
exports.setupExpertConsultationAssociations = setupExpertConsultationAssociations;
