/**
 * 专家咨询数据模型
 * 支持多智能体专家咨询系统
 */

import { DataTypes, Model, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

/**
 * 专家咨询会话模型
 */
export class ExpertConsultation extends Model<
  InferAttributes<ExpertConsultation>,
  InferCreationAttributes<ExpertConsultation>
> {
  declare id: CreationOptional<string>;
  declare userId: number;
  declare topic: string;
  declare description: string;
  declare urgency: 'low' | 'medium' | 'high' | 'critical';
  declare expectedExperts: string[];
  declare context: object;
  declare status: 'pending' | 'active' | 'completed' | 'cancelled';
  declare progressPercentage: CreationOptional<number>;
  declare totalExperts: CreationOptional<number>;
  declare currentRound: CreationOptional<number>;
  declare maxRounds: CreationOptional<number>;
  
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

/**
 * 专家发言记录模型
 */
export class ExpertSpeech extends Model<
  InferAttributes<ExpertSpeech>,
  InferCreationAttributes<ExpertSpeech>
> {
  declare id: CreationOptional<string>;
  declare consultationId: string;
  declare expertType: string;
  declare expertName: string;
  declare content: string;
  declare round: number;
  declare order: number;
  declare confidence: CreationOptional<number>;
  declare keywords: CreationOptional<string[]>;
  
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

/**
 * 行动计划模型
 */
export class ActionPlan extends Model<
  InferAttributes<ActionPlan>,
  InferCreationAttributes<ActionPlan>
> {
  declare id: CreationOptional<string>;
  declare consultationId: string;
  declare planType: 'immediate' | 'short-term' | 'long-term';
  declare priority: 'low' | 'medium' | 'high';
  declare title: string;
  declare description: string;
  declare timeline: string;
  declare resources: string[];
  declare constraints: CreationOptional<string[]>;
  declare expectedOutcome: CreationOptional<string>;
  declare successMetrics: CreationOptional<string[]>;
  declare status: CreationOptional<'pending' | 'in-progress' | 'completed' | 'cancelled'>;
  
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

/**
 * 咨询汇总模型
 */
export class ConsultationSummary extends Model<
  InferAttributes<ConsultationSummary>,
  InferCreationAttributes<ConsultationSummary>
> {
  declare id: CreationOptional<string>;
  declare consultationId: string;
  declare executiveSummary: string;
  declare keyInsights: string[];
  declare consensusPoints: string[];
  declare conflictingViews: CreationOptional<string[]>;
  declare recommendations: string[];
  declare nextSteps: CreationOptional<string[]>;
  declare participatingExperts: string[];
  declare confidenceScore: CreationOptional<number>;
  
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

/**
 * 初始化专家咨询模型
 */
export const initExpertConsultationModels = (sequelize: Sequelize) => {
  // 初始化专家咨询会话模型
  ExpertConsultation.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        comment: '咨询会话ID'
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '用户ID',
        references: {
          model: 'users',
          key: 'id'
        }
      },
      topic: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: '咨询主题'
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '问题描述'
      },
      urgency: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
        defaultValue: 'medium',
        comment: '紧急程度'
      },
      expectedExperts: {
        type: DataTypes.JSON,
        defaultValue: '[]',
        comment: '期望的专家类型列表'
      },
      context: {
        type: DataTypes.JSON,
        defaultValue: '{}',
        comment: '背景信息和上下文'
      },
      status: {
        type: DataTypes.ENUM('pending', 'active', 'completed', 'cancelled'),
        defaultValue: 'pending',
        comment: '会话状态'
      },
      progressPercentage: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 100
        },
        comment: '进度百分比'
      },
      totalExperts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '参与专家总数'
      },
      currentRound: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        comment: '当前轮次'
      },
      maxRounds: {
        type: DataTypes.INTEGER,
        defaultValue: 5,
        comment: '最大轮次'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
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
    }
  );

  // 初始化专家发言记录模型
  ExpertSpeech.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        comment: '发言记录ID'
      },
      consultationId: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: '咨询会话ID',
        references: {
          model: 'expert_consultations',
          key: 'id'
        }
      },
      expertType: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '专家类型'
      },
      expertName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: '专家名称'
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '发言内容'
      },
      round: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: '发言轮次'
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '在该轮次中的发言顺序'
      },
      confidence: {
        type: DataTypes.FLOAT,
        defaultValue: 0.8,
        validate: {
          min: 0.0,
          max: 1.0
        },
        comment: '发言置信度'
      },
      keywords: {
        type: DataTypes.JSON,
        defaultValue: '[]',
        comment: '关键词标签'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
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
    }
  );

  // 初始化行动计划模型
  ActionPlan.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        comment: '行动计划ID'
      },
      consultationId: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: '咨询会话ID',
        references: {
          model: 'expert_consultations',
          key: 'id'
        }
      },
      planType: {
        type: DataTypes.ENUM('immediate', 'short-term', 'long-term'),
        allowNull: false,
        comment: '计划类型'
      },
      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high'),
        defaultValue: 'medium',
        comment: '优先级'
      },
      title: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: '计划标题'
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '计划描述'
      },
      timeline: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: '时间规划'
      },
      resources: {
        type: DataTypes.JSON,
        defaultValue: '[]',
        comment: '所需资源'
      },
      constraints: {
        type: DataTypes.JSON,
        defaultValue: '[]',
        comment: '约束条件'
      },
      expectedOutcome: {
        type: DataTypes.TEXT,
        comment: '预期结果'
      },
      successMetrics: {
        type: DataTypes.JSON,
        defaultValue: '[]',
        comment: '成功指标'
      },
      status: {
        type: DataTypes.ENUM('pending', 'in-progress', 'completed', 'cancelled'),
        defaultValue: 'pending',
        comment: '执行状态'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
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
    }
  );

  // 初始化咨询汇总模型
  ConsultationSummary.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        comment: '汇总ID'
      },
      consultationId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        comment: '咨询会话ID',
        references: {
          model: 'expert_consultations',
          key: 'id'
        }
      },
      executiveSummary: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '执行摘要'
      },
      keyInsights: {
        type: DataTypes.JSON,
        defaultValue: '[]',
        comment: '关键洞察'
      },
      consensusPoints: {
        type: DataTypes.JSON,
        defaultValue: '[]',
        comment: '一致观点'
      },
      conflictingViews: {
        type: DataTypes.JSON,
        defaultValue: '[]',
        comment: '分歧观点'
      },
      recommendations: {
        type: DataTypes.JSON,
        defaultValue: '[]',
        comment: '建议事项'
      },
      nextSteps: {
        type: DataTypes.JSON,
        defaultValue: '[]',
        comment: '后续步骤'
      },
      participatingExperts: {
        type: DataTypes.JSON,
        defaultValue: '[]',
        comment: '参与专家'
      },
      confidenceScore: {
        type: DataTypes.FLOAT,
        defaultValue: 0.8,
        validate: {
          min: 0.0,
          max: 1.0
        },
        comment: '整体置信度'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
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
    }
  );

  return {
    ExpertConsultation,
    ExpertSpeech,
    ActionPlan,
    ConsultationSummary
  };
};

/**
 * 设置模型关联关系
 */
export const setupExpertConsultationAssociations = () => {
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

// 导出所有模型

// 导出类型定义
export interface ConsultationParams {
  userId: number;
  topic: string;
  description: string;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  expectedExperts?: string[];
  context?: object;
}

export interface ExpertSpeechParams {
  consultationId: string;
  expertType: string;
  expertName: string;
  content: string;
  round: number;
  order: number;
  confidence?: number;
  keywords?: string[];
}

export interface ActionPlanParams {
  consultationId: string;
  planType: 'immediate' | 'short-term' | 'long-term';
  priority?: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  timeline: string;
  resources?: string[];
  constraints?: string[];
  expectedOutcome?: string;
  successMetrics?: string[];
}

export interface ConsultationSummaryParams {
  consultationId: string;
  executiveSummary: string;
  keyInsights?: string[];
  consensusPoints?: string[];
  conflictingViews?: string[];
  recommendations?: string[];
  nextSteps?: string[];
  participatingExperts?: string[];
  confidenceScore?: number;
}