import crypto from 'crypto';
import AIQueryHistory from '../models/AIQueryHistory';
import { Op } from 'sequelize';

/**
 * AI查询缓存服务
 * 实现1小时内重复查询的缓存机制
 */
export class AIQueryCacheService {
  private static instance: AIQueryCacheService;
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1小时缓存时间

  private constructor() {}

  public static getInstance(): AIQueryCacheService {
    if (!AIQueryCacheService.instance) {
      AIQueryCacheService.instance = new AIQueryCacheService();
    }
    return AIQueryCacheService.instance;
  }

  /**
   * 生成查询内容的哈希值
   */
  private generateQueryHash(queryText: string, userId: number): string {
    const content = `${userId}:${queryText.trim().toLowerCase()}`;
    return crypto.createHash('md5').update(content, 'utf8').digest('hex');
  }

  /**
   * 检查是否有1小时内的缓存记录
   */
  public async getCachedResult(queryText: string, userId: number): Promise<any | null> {
    try {
      const queryHash = this.generateQueryHash(queryText, userId);
      const oneHourAgo = new Date(Date.now() - this.CACHE_DURATION);

      console.log(`🔍 检查缓存: 用户${userId}, 哈希${queryHash.substring(0, 8)}...`);

      const cachedRecord = await AIQueryHistory.findOne({
        where: {
          userId,
          queryHash,
          createdAt: {
            [Op.gte]: oneHourAgo
          }
        },
        order: [['createdAt', 'DESC']]
      });

      if (cachedRecord) {
        console.log(`✅ 命中缓存: ${cachedRecord.queryType}, 创建时间${cachedRecord.createdAt}`);
        
        // 构造缓存响应
        if (cachedRecord.queryType === 'data_query') {
          return {
            success: true,
            type: 'data_query',
            data: cachedRecord.responseData?.data || [],
            metadata: {
              totalRows: cachedRecord.responseData?.metadata?.totalRows || 0,
              executionTime: cachedRecord.executionTime || 0,
              generatedSQL: cachedRecord.generatedSQL,
              usedModel: cachedRecord.modelUsed,
              cacheHit: true,
              cachedAt: cachedRecord.createdAt,
              columns: cachedRecord.responseData?.metadata?.columns || []
            },
            visualization: cachedRecord.responseData?.visualization,
            sessionId: cachedRecord.sessionId,
            queryLogId: cachedRecord.id
          };
        } else {
          return {
            type: 'ai_response',
            response: cachedRecord.responseText,
            isDataQuery: false,
            sessionId: cachedRecord.sessionId,
            cacheHit: true,
            cachedAt: cachedRecord.createdAt
          };
        }
      }

      console.log(`❌ 未命中缓存: 1小时内无相同查询记录`);
      return null;
    } catch (error) {
      console.error('❌ 缓存检查失败:', error);
      return null;
    }
  }

  /**
   * 保存查询结果到历史记录
   */
  public async saveQueryResult(
    queryText: string,
    userId: number,
    queryType: 'data_query' | 'ai_response',
    result: any,
    sessionId?: string,
    modelUsed?: string,
    executionTime?: number
  ): Promise<void> {
    try {
      const queryHash = this.generateQueryHash(queryText, userId);

      console.log(`💾 保存查询记录: 用户${userId}, 类型${queryType}, 哈希${queryHash.substring(0, 8)}...`);

      const historyData: any = {
        userId,
        queryText,
        queryHash,
        queryType,
        sessionId,
        modelUsed,
        executionTime,
        cacheHit: false
      };

      if (queryType === 'data_query') {
        historyData.responseData = {
          data: result.data,
          metadata: result.metadata,
          visualization: result.visualization
        };
        historyData.generatedSQL = result.metadata?.generatedSQL;
      } else {
        historyData.responseText = result.response;
      }

      await AIQueryHistory.create(historyData);
      console.log(`✅ 查询记录保存成功`);
    } catch (error) {
      console.error('❌ 保存查询记录失败:', error);
    }
  }

  /**
   * 获取用户的查询历史记录
   */
  public async getUserQueryHistory(
    userId: number,
    page: number = 1,
    pageSize: number = 20,
    queryType?: 'data_query' | 'ai_response'
  ): Promise<{
    data: any[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    try {
      const offset = (page - 1) * pageSize;
      const whereCondition: any = { userId };
      
      if (queryType) {
        whereCondition.queryType = queryType;
      }

      const { count, rows } = await AIQueryHistory.findAndCountAll({
        where: whereCondition,
        order: [['createdAt', 'DESC']],
        limit: pageSize,
        offset,
        attributes: [
          'id',
          'queryText',
          'queryType',
          'generatedSQL',
          'executionTime',
          'modelUsed',
          'sessionId',
          'cacheHit',
          'createdAt'
        ]
      });

      const totalPages = Math.ceil(count / pageSize);

      return {
        data: rows.map(row => ({
          id: row.id,
          naturalQuery: row.queryText,
          queryType: row.queryType,
          generatedSQL: row.generatedSQL,
          executionTime: row.executionTime,
          modelUsed: row.modelUsed,
          sessionId: row.sessionId,
          cacheHit: row.cacheHit,
          createdAt: row.createdAt,
          // 为了兼容前端接口
          executionStatus: 'success',
          resultCount: row.queryType === 'data_query' ? 1 : 0
        })),
        total: count,
        page,
        pageSize,
        totalPages
      };
    } catch (error) {
      console.error('❌ 获取查询历史失败:', error);
      return {
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0
      };
    }
  }

  /**
   * 获取查询详情
   */
  public async getQueryDetail(queryId: number, userId: number): Promise<any | null> {
    try {
      const record = await AIQueryHistory.findOne({
        where: {
          id: queryId,
          userId
        }
      });

      if (!record) {
        return null;
      }

      return {
        id: record.id,
        naturalQuery: record.queryText,
        queryType: record.queryType,
        responseData: record.responseData,
        responseText: record.responseText,
        generatedSQL: record.generatedSQL,
        executionTime: record.executionTime,
        modelUsed: record.modelUsed,
        sessionId: record.sessionId,
        cacheHit: record.cacheHit,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
      };
    } catch (error) {
      console.error('❌ 获取查询详情失败:', error);
      return null;
    }
  }

  /**
   * 清理过期的缓存记录（可以定期调用）
   */
  public async cleanupExpiredCache(): Promise<number> {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const deletedCount = await AIQueryHistory.destroy({
        where: {
          createdAt: {
            [Op.lt]: sevenDaysAgo
          }
        }
      });

      console.log(`🧹 清理过期缓存记录: ${deletedCount} 条`);
      return deletedCount;
    } catch (error) {
      console.error('❌ 清理缓存失败:', error);
      return 0;
    }
  }

  /**
   * 获取缓存统计信息
   */
  public async getCacheStats(userId?: number): Promise<any> {
    try {
      const whereCondition = userId ? { userId } : {};
      const oneHourAgo = new Date(Date.now() - this.CACHE_DURATION);

      const [totalCount, recentCount, cacheHitCount] = await Promise.all([
        AIQueryHistory.count({ where: whereCondition }),
        AIQueryHistory.count({
          where: {
            ...whereCondition,
            createdAt: { [Op.gte]: oneHourAgo }
          }
        }),
        AIQueryHistory.count({
          where: {
            ...whereCondition,
            cacheHit: true
          }
        })
      ]);

      return {
        totalQueries: totalCount,
        recentQueries: recentCount,
        cacheHits: cacheHitCount,
        cacheHitRate: totalCount > 0 ? ((cacheHitCount / totalCount) * 100).toFixed(2) + '%' : '0%'
      };
    } catch (error) {
      console.error('❌ 获取缓存统计失败:', error);
      return {
        totalQueries: 0,
        recentQueries: 0,
        cacheHits: 0,
        cacheHitRate: '0%'
      };
    }
  }
}

export default AIQueryCacheService.getInstance();