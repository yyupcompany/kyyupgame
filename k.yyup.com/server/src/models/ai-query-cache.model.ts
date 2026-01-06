import { DataTypes, Model, Optional, Op } from 'sequelize';
import { sequelize } from '../init';
import * as crypto from 'crypto';

/**
 * AI查询缓存属性接口
 */
export interface AIQueryCacheAttributes {
  id: number;
  queryHash: string;
  naturalQuery: string;
  contextHash: string;
  generatedSql: string;
  resultData: any[];
  resultMetadata: {
    totalRows: number;
    columnsInfo: Array<{
      name: string;
      type: string;
      description?: string;
    }>;
    executionTime: number;
    warnings?: string[];
  };
  hitCount: number;
  lastHitAt?: Date;
  expiresAt: Date;
  isValid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * AI查询缓存创建属性接口
 */
export interface AIQueryCacheCreationAttributes extends Optional<AIQueryCacheAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * AI查询缓存模型类
 */
export class AIQueryCache extends Model<AIQueryCacheAttributes, AIQueryCacheCreationAttributes> implements AIQueryCacheAttributes {
  public id!: number;
  public queryHash!: string;
  public naturalQuery!: string;
  public contextHash!: string;
  public generatedSql!: string;
  public resultData!: any[];
  public resultMetadata!: AIQueryCacheAttributes['resultMetadata'];
  public hitCount!: number;
  public lastHitAt?: Date;
  public expiresAt!: Date;
  public isValid!: boolean;

  // 时间戳
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /**
   * 生成查询哈希
   */
  public static generateQueryHash(naturalQuery: string, contextHash: string): string {
    const combined = `${naturalQuery.toLowerCase().trim()}:${contextHash}`;
    return crypto.createHash('sha256').update(combined).digest('hex');
  }

  /**
   * 生成上下文哈希
   */
  public static generateContextHash(context: any): string {
    const contextString = JSON.stringify(context, Object.keys(context).sort());
    return crypto.createHash('md5').update(contextString).digest('hex');
  }

  /**
   * 检查缓存是否有效
   */
  public isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  /**
   * 增加命中次数
   */
  public async incrementHit(): Promise<void> {
    this.hitCount += 1;
    this.lastHitAt = new Date();
    await this.save();
  }

  /**
   * 标记缓存为无效
   */
  public async markInvalid(): Promise<void> {
    this.isValid = false;
    await this.save();
  }

  /**
   * 获取缓存命中率相关统计
   */
  public static async getCacheStats(): Promise<{
    totalCaches: number;
    validCaches: number;
    expiredCaches: number;
    totalHits: number;
    avgHitsPerCache: number;
  }> {
    const allCaches = await AIQueryCache.findAll({
      where: {
        expiresAt: {
          [Op.gt]: new Date()
        }
      }
    });

    const validCaches = allCaches.filter(cache => cache.isValid);
    const expiredCaches = allCaches.filter(cache => cache.isExpired());
    const totalHits = allCaches.reduce((sum, cache) => sum + cache.hitCount, 0);

    return {
      totalCaches: allCaches.length,
      validCaches: validCaches.length,
      expiredCaches: expiredCaches.length,
      totalHits,
      avgHitsPerCache: allCaches.length > 0 ? totalHits / allCaches.length : 0
    };
  }

  /**
   * 清理过期缓存
   */
  public static async cleanupExpired(): Promise<number> {
    const result = await AIQueryCache.destroy({
      where: {
        expiresAt: {
          [Op.lt]: new Date()
        }
      }
    });
    return result;
  }

  /**
   * 清理无效缓存
   */
  public static async cleanupInvalid(): Promise<number> {
    const result = await AIQueryCache.destroy({
      where: {
        isValid: false,
        expiresAt: {
          [Op.lt]: new Date()
        }
      }
    });
    return result;
  }

  /**
   * 获取热门查询缓存
   */
  public static async getPopularCaches(limit: number = 10): Promise<AIQueryCache[]> {
    return AIQueryCache.findAll({
      where: {
        isValid: true,
        expiresAt: {
          [Op.gt]: new Date()
        }
      },
      order: [['hitCount', 'DESC'], ['lastHitAt', 'DESC']],
      limit
    });
  }

  /**
   * 根据查询和上下文查找缓存
   */
  public static async findByQuery(naturalQuery: string, context: any): Promise<AIQueryCache | null> {
    const contextHash = this.generateContextHash(context);
    const queryHash = this.generateQueryHash(naturalQuery, contextHash);

    return AIQueryCache.findOne({
      where: {
        queryHash,
        isValid: true,
        expiresAt: {
          [Op.gt]: new Date()
        }
      }
    });
  }
}

// 初始化模型
AIQueryCache.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  queryHash: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true,
    field: 'query_hash',
  },
  naturalQuery: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'natural_query',
  },
  contextHash: {
    type: DataTypes.STRING(32),
    allowNull: false,
    field: 'context_hash',
  },
  generatedSql: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'generated_sql',
  },
  resultData: {
    type: DataTypes.JSON,
    allowNull: false,
    field: 'result_data',
  },
  resultMetadata: {
    type: DataTypes.JSON,
    allowNull: false,
    field: 'result_metadata',
  },
  hitCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'hit_count',
  },
  lastHitAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_hit_at',
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at',
  },
  isValid: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_valid',
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
  modelName: 'AIQueryCache',
  tableName: 'ai_query_cache',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['query_hash'],
      unique: true
    },
    {
      fields: ['context_hash']
    },
    {
      fields: ['expires_at']
    },
    {
      fields: ['is_valid']
    },
    {
      fields: ['hit_count']
    },
    {
      fields: ['last_hit_at']
    },
    {
      fields: ['created_at']
    }
  ]
});

