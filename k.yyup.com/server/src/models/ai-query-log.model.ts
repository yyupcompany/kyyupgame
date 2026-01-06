import { DataTypes, Model, Optional, Op, Sequelize } from 'sequelize';
import { sequelize } from '../init';
import { User } from './user.model';

/**
 * AI查询日志属性接口
 */
export interface AIQueryLogAttributes {
  id: number;
  userId: number;
  sessionId?: string;
  naturalQuery: string;
  intentAnalysis?: {
    type: 'SELECT' | 'COUNT' | 'SUM' | 'AVG' | 'GROUP_BY' | 'FILTER';
    confidence: number;
    entities: Array<{
      type: 'TABLE' | 'COLUMN' | 'VALUE' | 'CONDITION';
      value: string;
      confidence: number;
      mappedName?: string;
    }>;
    keywords: string[];
    businessDomain?: string;
  };
  generatedSql?: string;
  finalSql?: string;
  executionStatus: 'pending' | 'success' | 'failed' | 'cancelled';
  executionTime: number;
  aiProcessingTime: number;
  resultData?: any[];
  resultMetadata?: {
    totalRows: number;
    columnsInfo: Array<{
      name: string;
      type: string;
      description?: string;
    }>;
    executionPlan?: any;
    warnings?: string[];
  };
  errorMessage?: string;
  errorType?: 'sql_error' | 'permission_error' | 'ai_error' | 'system_error';
  tokensUsed: number;
  modelUsed?: string;
  cacheHit: boolean;
  queryComplexity: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * AI查询日志创建属性接口
 */
export interface AIQueryLogCreationAttributes extends Optional<AIQueryLogAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * AI查询日志模型类
 */
export class AIQueryLog extends Model<AIQueryLogAttributes, AIQueryLogCreationAttributes> implements AIQueryLogAttributes {
  public id!: number;
  public userId!: number;
  public sessionId?: string;
  public naturalQuery!: string;
  public intentAnalysis?: AIQueryLogAttributes['intentAnalysis'];
  public generatedSql?: string;
  public finalSql?: string;
  public executionStatus!: 'pending' | 'success' | 'failed' | 'cancelled';
  public executionTime!: number;
  public aiProcessingTime!: number;
  public resultData?: any[];
  public resultMetadata?: AIQueryLogAttributes['resultMetadata'];
  public errorMessage?: string;
  public errorType?: 'sql_error' | 'permission_error' | 'ai_error' | 'system_error';
  public tokensUsed!: number;
  public modelUsed?: string;
  public cacheHit!: boolean;
  public queryComplexity!: number;

  // 时间戳
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 关联方法
  public getUser!: () => Promise<User>;

  /**
   * 获取查询执行状态的中文描述
   */
  public getStatusText(): string {
    const statusMap = {
      pending: '执行中',
      success: '成功',
      failed: '失败',
      cancelled: '已取消'
    };
    return statusMap[this.executionStatus] || '未知';
  }

  /**
   * 获取错误类型的中文描述
   */
  public getErrorTypeText(): string {
    if (!this.errorType) return '';
    const errorTypeMap = {
      sql_error: 'SQL语法错误',
      permission_error: '权限不足',
      ai_error: 'AI处理错误',
      system_error: '系统错误'
    };
    return errorTypeMap[this.errorType] || '未知错误';
  }

  /**
   * 获取查询复杂度等级
   */
  public getComplexityLevel(): string {
    if (this.queryComplexity <= 3) return '简单';
    if (this.queryComplexity <= 6) return '中等';
    if (this.queryComplexity <= 9) return '复杂';
    return '极复杂';
  }

  /**
   * 获取执行性能等级
   */
  public getPerformanceLevel(): string {
    if (this.executionTime <= 100) return '优秀';
    if (this.executionTime <= 500) return '良好';
    if (this.executionTime <= 1000) return '一般';
    return '较慢';
  }
}

// 初始化模型的函数
export const initAIQueryLog = (sequelizeInstance: Sequelize) => {
  AIQueryLog.init({
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
  },
  sessionId: {
    type: DataTypes.STRING(36),
    allowNull: true,
    field: 'session_id',
  },
  naturalQuery: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'natural_query',
  },
  intentAnalysis: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'intent_analysis',
  },
  generatedSql: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'generated_sql',
  },
  finalSql: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'final_sql',
  },
  executionStatus: {
    type: DataTypes.ENUM('pending', 'success', 'failed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
    field: 'execution_status',
  },
  executionTime: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'execution_time',
  },
  aiProcessingTime: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'ai_processing_time',
  },
  resultData: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'result_data',
  },
  resultMetadata: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'result_metadata',
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'error_message',
  },
  errorType: {
    type: DataTypes.ENUM('sql_error', 'permission_error', 'ai_error', 'system_error'),
    allowNull: true,
    field: 'error_type',
  },
  tokensUsed: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'tokens_used',
  },
  modelUsed: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'model_used',
  },
  cacheHit: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'cache_hit',
  },
  queryComplexity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'query_complexity',
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
  sequelize: sequelizeInstance,
  modelName: 'AIQueryLog',
  tableName: 'ai_query_logs',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['session_id']
    },
    {
      fields: ['execution_status']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['model_used']
    },
    {
      fields: ['cache_hit']
    }
  ]
});

  return AIQueryLog;
};

// 设置关联关系
export const initAIQueryLogAssociations = () => {
  AIQueryLog.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });
};
