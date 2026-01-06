import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../init';
import { User } from './user.model';
import { AIQueryLog } from './ai-query-log.model';

/**
 * AI查询反馈属性接口
 */
export interface AIQueryFeedbackAttributes {
  id: number;
  queryLogId: number;
  userId: number;
  rating: number;
  feedbackType: 'helpful' | 'incorrect' | 'slow' | 'confusing' | 'suggestion';
  comments?: string;
  correctedSql?: string;
  suggestedImprovement?: string;
  isHelpful: boolean;
  adminResponse?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewedAt?: Date;
  reviewedBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * AI查询反馈创建属性接口
 */
export interface AIQueryFeedbackCreationAttributes extends Optional<AIQueryFeedbackAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * AI查询反馈模型类
 */
export class AIQueryFeedback extends Model<AIQueryFeedbackAttributes, AIQueryFeedbackCreationAttributes> implements AIQueryFeedbackAttributes {
  public id!: number;
  public queryLogId!: number;
  public userId!: number;
  public rating!: number;
  public feedbackType!: 'helpful' | 'incorrect' | 'slow' | 'confusing' | 'suggestion';
  public comments?: string;
  public correctedSql?: string;
  public suggestedImprovement?: string;
  public isHelpful!: boolean;
  public adminResponse?: string;
  public status!: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  public reviewedAt?: Date;
  public reviewedBy?: number;

  // 时间戳
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 关联方法
  public getUser!: () => Promise<User>;
  public getQueryLog!: () => Promise<AIQueryLog>;
  public getReviewer!: () => Promise<User>;

  /**
   * 获取反馈类型的中文描述
   */
  public getFeedbackTypeText(): string {
    const typeMap = {
      helpful: '有帮助',
      incorrect: '结果错误',
      slow: '响应缓慢',
      confusing: '结果混乱',
      suggestion: '改进建议'
    };
    return typeMap[this.feedbackType] || '未知';
  }

  /**
   * 获取状态的中文描述
   */
  public getStatusText(): string {
    const statusMap = {
      pending: '待处理',
      reviewed: '已审核',
      resolved: '已解决',
      dismissed: '已忽略'
    };
    return statusMap[this.status] || '未知';
  }

  /**
   * 获取评分等级
   */
  public getRatingLevel(): string {
    if (this.rating >= 4) return '满意';
    if (this.rating >= 3) return '一般';
    if (this.rating >= 2) return '不满意';
    return '很不满意';
  }

  /**
   * 标记为已审核
   */
  public async markAsReviewed(reviewerId: number, adminResponse?: string): Promise<void> {
    this.status = 'reviewed';
    this.reviewedAt = new Date();
    this.reviewedBy = reviewerId;
    if (adminResponse) {
      this.adminResponse = adminResponse;
    }
    await this.save();
  }

  /**
   * 标记为已解决
   */
  public async markAsResolved(reviewerId: number, adminResponse?: string): Promise<void> {
    this.status = 'resolved';
    this.reviewedAt = new Date();
    this.reviewedBy = reviewerId;
    if (adminResponse) {
      this.adminResponse = adminResponse;
    }
    await this.save();
  }

  /**
   * 标记为已忽略
   */
  public async markAsDismissed(reviewerId: number, reason?: string): Promise<void> {
    this.status = 'dismissed';
    this.reviewedAt = new Date();
    this.reviewedBy = reviewerId;
    if (reason) {
      this.adminResponse = reason;
    }
    await this.save();
  }

  /**
   * 获取反馈统计信息
   */
  public static async getFeedbackStats(): Promise<{
    totalFeedbacks: number;
    avgRating: number;
    positiveCount: number;
    negativeCount: number;
    byType: { [key: string]: number };
    byStatus: { [key: string]: number };
  }> {
    const allFeedbacks = await AIQueryFeedback.findAll();

    const totalFeedbacks = allFeedbacks.length;
    const avgRating = totalFeedbacks > 0 
      ? allFeedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks 
      : 0;
    
    const positiveCount = allFeedbacks.filter(f => f.isHelpful).length;
    const negativeCount = totalFeedbacks - positiveCount;

    const byType: { [key: string]: number } = {};
    const byStatus: { [key: string]: number } = {};

    allFeedbacks.forEach(feedback => {
      byType[feedback.feedbackType] = (byType[feedback.feedbackType] || 0) + 1;
      byStatus[feedback.status] = (byStatus[feedback.status] || 0) + 1;
    });

    return {
      totalFeedbacks,
      avgRating,
      positiveCount,
      negativeCount,
      byType,
      byStatus
    };
  }

  /**
   * 获取用户的反馈历史
   */
  public static async getUserFeedbackHistory(userId: number, limit: number = 20): Promise<AIQueryFeedback[]> {
    return AIQueryFeedback.findAll({
      where: { userId },
      include: [
        {
          model: AIQueryLog,
          as: 'queryLog',
          attributes: ['id', 'naturalQuery', 'executionStatus', 'createdAt']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit
    });
  }

  /**
   * 获取待处理的反馈
   */
  public static async getPendingFeedbacks(limit: number = 50): Promise<AIQueryFeedback[]> {
    return AIQueryFeedback.findAll({
      where: { status: 'pending' },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'realName']
        },
        {
          model: AIQueryLog,
          as: 'queryLog',
          attributes: ['id', 'naturalQuery', 'executionStatus', 'createdAt']
        }
      ],
      order: [['createdAt', 'ASC']],
      limit
    });
  }
}

// 初始化模型
AIQueryFeedback.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  queryLogId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'query_log_id',
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  feedbackType: {
    type: DataTypes.ENUM('helpful', 'incorrect', 'slow', 'confusing', 'suggestion'),
    allowNull: false,
    field: 'feedback_type',
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  correctedSql: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'corrected_sql',
  },
  suggestedImprovement: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'suggested_improvement',
  },
  isHelpful: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_helpful',
  },
  adminResponse: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'admin_response',
  },
  status: {
    type: DataTypes.ENUM('pending', 'reviewed', 'resolved', 'dismissed'),
    allowNull: false,
    defaultValue: 'pending',
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'reviewed_at',
  },
  reviewedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'reviewed_by',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at',
  },
}, {
  sequelize,
  modelName: 'AIQueryFeedback',
  tableName: 'ai_query_feedback',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['query_log_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['rating']
    },
    {
      fields: ['feedback_type']
    },
    {
      fields: ['status']
    },
    {
      fields: ['is_helpful']
    },
    {
      fields: ['reviewed_by']
    },
    {
      fields: ['created_at']
    }
  ]
});

// 设置关联关系
AIQueryFeedback.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

AIQueryFeedback.belongsTo(AIQueryLog, {
  foreignKey: 'queryLogId',
  as: 'queryLog'
});

AIQueryFeedback.belongsTo(User, {
  foreignKey: 'reviewedBy',
  as: 'reviewer'
});

