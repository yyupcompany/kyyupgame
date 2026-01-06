import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../init';
import { User } from './user.model';

/**
 * AI查询模板属性接口
 */
export interface AIQueryTemplateAttributes {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  category?: string;
  templateSql: string;
  parameters?: {
    [key: string]: {
      type: string;
      required: boolean;
      description: string;
      defaultValue?: any;
      options?: any[];
    };
  };
  exampleQueries: string[];
  keywords: string[];
  businessDomain?: string;
  allowedRoles: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  usageCount: number;
  successRate: number;
  avgExecutionTime: number;
  isActive: boolean;
  creatorId?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * AI查询模板创建属性接口
 */
export interface AIQueryTemplateCreationAttributes extends Optional<AIQueryTemplateAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * AI查询模板模型类
 */
export class AIQueryTemplate extends Model<AIQueryTemplateAttributes, AIQueryTemplateCreationAttributes> implements AIQueryTemplateAttributes {
  public id!: number;
  public name!: string;
  public displayName!: string;
  public description?: string;
  public category?: string;
  public templateSql!: string;
  public parameters?: AIQueryTemplateAttributes['parameters'];
  public exampleQueries!: string[];
  public keywords!: string[];
  public businessDomain?: string;
  public allowedRoles!: string[];
  public difficulty!: 'easy' | 'medium' | 'hard';
  public usageCount!: number;
  public successRate!: number;
  public avgExecutionTime!: number;
  public isActive!: boolean;
  public creatorId?: number;

  // 时间戳
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 关联方法
  public getCreator!: () => Promise<User>;

  /**
   * 检查用户角色是否可以使用此模板
   */
  public canUseByRole(userRole: string): boolean {
    return this.allowedRoles.includes(userRole) || this.allowedRoles.includes('all');
  }

  /**
   * 计算查询与模板的匹配分数
   */
  public matchesKeywords(query: string): number {
    const queryLower = query.toLowerCase();
    let matchCount = 0;
    
    for (const keyword of this.keywords) {
      if (queryLower.includes(keyword.toLowerCase())) {
        matchCount++;
      }
    }
    
    return this.keywords.length > 0 ? matchCount / this.keywords.length : 0;
  }

  /**
   * 获取难度等级的中文描述
   */
  public getDifficultyText(): string {
    const difficultyMap = {
      easy: '简单',
      medium: '中等',
      hard: '困难'
    };
    return difficultyMap[this.difficulty] || '未知';
  }

  /**
   * 获取成功率等级
   */
  public getSuccessRateLevel(): string {
    if (this.successRate >= 0.9) return '优秀';
    if (this.successRate >= 0.7) return '良好';
    if (this.successRate >= 0.5) return '一般';
    return '较低';
  }

  /**
   * 增加使用次数
   */
  public async incrementUsage(): Promise<void> {
    this.usageCount += 1;
    await this.save();
  }

  /**
   * 更新成功率
   */
  public async updateSuccessRate(isSuccess: boolean): Promise<void> {
    const totalAttempts = this.usageCount;
    const previousSuccesses = Math.round(this.successRate * totalAttempts);
    const newSuccesses = isSuccess ? previousSuccesses + 1 : previousSuccesses;
    this.successRate = totalAttempts > 0 ? newSuccesses / totalAttempts : 0;
    await this.save();
  }

  /**
   * 更新平均执行时间
   */
  public async updateAvgExecutionTime(executionTime: number): Promise<void> {
    const totalAttempts = this.usageCount;
    if (totalAttempts === 1) {
      this.avgExecutionTime = executionTime;
    } else {
      this.avgExecutionTime = ((this.avgExecutionTime * (totalAttempts - 1)) + executionTime) / totalAttempts;
    }
    await this.save();
  }

  /**
   * 填充模板参数
   */
  public fillTemplate(params: Record<string, any>): string {
    let sql = this.templateSql;
    
    // 替换模板中的参数占位符
    Object.entries(params).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      if (typeof value === 'string') {
        sql = sql.replace(new RegExp(placeholder, 'g'), `'${value}'`);
      } else {
        sql = sql.replace(new RegExp(placeholder, 'g'), String(value));
      }
    });
    
    return sql;
  }
}

// 初始化模型的函数
export const initAIQueryTemplate = (sequelizeInstance: any) => {
  AIQueryTemplate.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  displayName: {
    type: DataTypes.STRING(200),
    allowNull: false,
    field: 'display_name',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  templateSql: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'template_sql',
  },
  parameters: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  exampleQueries: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    field: 'example_queries',
  },
  keywords: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },
  businessDomain: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'business_domain',
  },
  allowedRoles: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: ['all'],
    field: 'allowed_roles',
  },
  difficulty: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    allowNull: false,
    defaultValue: 'medium',
  },
  usageCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'usage_count',
  },
  successRate: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: false,
    defaultValue: 0,
    field: 'success_rate',
  },
  avgExecutionTime: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'avg_execution_time',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active',
  },
  creatorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'creator_id',
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
  modelName: 'AIQueryTemplate',
  tableName: 'ai_query_templates',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['name']
    },
    {
      fields: ['category']
    },
    {
      fields: ['business_domain']
    },
    {
      fields: ['difficulty']
    },
    {
      fields: ['usage_count']
    },
    {
      fields: ['success_rate']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['creator_id']
    }
  ]
});

  // 设置关联关系
  AIQueryTemplate.belongsTo(User, {
    foreignKey: 'creatorId',
    as: 'creator'
  });

  return AIQueryTemplate;
};

