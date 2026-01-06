import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock dependencies
const mockRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  exists: jest.fn(),
  expire: jest.fn(),
  ttl: jest.fn(),
  keys: jest.fn(),
  hget: jest.fn(),
  hset: jest.fn(),
  hdel: jest.fn(),
  hgetall: jest.fn(),
  zadd: jest.fn(),
  zrange: jest.fn(),
  zrem: jest.fn(),
  zcard: jest.fn(),
  pipeline: jest.fn(),
  multi: jest.fn(),
  exec: jest.fn()
};

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
};

const mockCrypto = {
  createHash: jest.fn(),
  randomBytes: jest.fn()
};

const mockAIQueryLogModel = {
  create: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn()
};

const mockAIQueryCacheModel = {
  create: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn()
};

const mockMetricsService = {
  recordCacheHit: jest.fn(),
  recordCacheMiss: jest.fn(),
  recordCacheWrite: jest.fn(),
  recordQueryLatency: jest.fn(),
  getCacheMetrics: jest.fn()
};

const mockCompressionService = {
  compress: jest.fn(),
  decompress: jest.fn(),
  shouldCompress: jest.fn()
};

// Mock imports
jest.unstable_mockModule('../../../../../../src/config/redis', () => ({
  default: mockRedisClient
}));

jest.unstable_mockModule('../../../../../../src/utils/logger', () => ({
  default: mockLogger
}));

jest.unstable_mockModule('crypto', () => mockCrypto);

jest.unstable_mockModule('../../../../../../src/models/ai-query-log.model', () => ({
  default: mockAIQueryLogModel
}));

jest.unstable_mockModule('../../../../../../src/models/ai-query-cache.model', () => ({
  default: mockAIQueryCacheModel
}));

jest.unstable_mockModule('../../../../../../src/services/metrics.service', () => ({
  default: mockMetricsService
}));

jest.unstable_mockModule('../../../../../../src/services/compression.service', () => ({
  default: mockCompressionService
}));


// 控制台错误检测
let consoleSpy: any

beforeEach(() => {
  // 监听控制台错误
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  // 验证没有控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})

describe('AIQueryCacheService', () => {
  let aiQueryCacheService: any;

  beforeAll(async () => {
    const imported = await import('../../../../../../src/services/ai/ai-query-cache.service');
    aiQueryCacheService = imported.default || imported.AIQueryCacheService || imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockCrypto.createHash.mockReturnValue({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue('abc123def456')
    });
  });

  describe('查询缓存管理', () => {
    it('应该缓存AI查询结果', async () => {
      const query = '请帮我分析一下学生的学习情况';
      const context = {
        userId: 1,
        modelId: 'gpt-4',
        temperature: 0.7,
        maxTokens: 1000
      };
      const response = {
        content: '根据数据分析，学生整体学习情况良好...',
        usage: {
          promptTokens: 50,
          completionTokens: 200,
          totalTokens: 250
        },
        model: 'gpt-4',
        timestamp: Date.now()
      };

      mockRedisClient.get.mockResolvedValue(null); // 缓存未命中
      mockRedisClient.set.mockResolvedValue('OK');
      mockCompressionService.shouldCompress.mockReturnValue(true);
      mockCompressionService.compress.mockReturnValue(JSON.stringify(response));

      const cacheKey = await aiQueryCacheService.cacheQuery(query, context, response);

      expect(mockRedisClient.get).toHaveBeenCalledWith(expect.stringMatching(/^ai:query:/));
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        expect.stringMatching(/^ai:query:/),
        expect.any(String),
        'EX',
        3600 // 默认1小时过期
      );
      expect(mockMetricsService.recordCacheWrite).toHaveBeenCalledWith('ai_query', cacheKey);
      expect(cacheKey).toMatch(/^ai:query:[a-f0-9]{12}$/);
    });

    it('应该从缓存中获取查询结果', async () => {
      const query = '今天有哪些活动安排？';
      const context = {
        userId: 2,
        modelId: 'gpt-3.5-turbo',
        temperature: 0.5
      };
      const cachedResponse = {
        content: '今天安排了以下活动：1. 晨间运动...',
        usage: { promptTokens: 30, completionTokens: 150, totalTokens: 180 },
        model: 'gpt-3.5-turbo',
        cached: true,
        cacheTimestamp: Date.now() - 1800000 // 30分钟前缓存
      };

      mockRedisClient.get.mockResolvedValue(JSON.stringify(cachedResponse));
      mockCompressionService.decompress.mockReturnValue(JSON.stringify(cachedResponse));

      const result = await aiQueryCacheService.getCachedQuery(query, context);

      expect(mockRedisClient.get).toHaveBeenCalledWith(expect.stringMatching(/^ai:query:/));
      expect(mockCompressionService.decompress).toHaveBeenCalled();
      expect(mockMetricsService.recordCacheHit).toHaveBeenCalledWith('ai_query', expect.any(String));
      expect(result).toEqual(cachedResponse);
      expect(result.cached).toBe(true);
    });

    it('应该处理缓存未命中', async () => {
      const query = '新的查询内容';
      const context = { userId: 3, modelId: 'claude-3' };

      mockRedisClient.get.mockResolvedValue(null);

      const result = await aiQueryCacheService.getCachedQuery(query, context);

      expect(mockRedisClient.get).toHaveBeenCalled();
      expect(mockMetricsService.recordCacheMiss).toHaveBeenCalledWith('ai_query', expect.any(String));
      expect(result).toBeNull();
    });

    it('应该生成一致的缓存键', () => {
      const query = '测试查询';
      const context1 = { userId: 1, modelId: 'gpt-4', temperature: 0.7 };
      const context2 = { userId: 1, modelId: 'gpt-4', temperature: 0.7 };

      const key1 = aiQueryCacheService.generateCacheKey(query, context1);
      const key2 = aiQueryCacheService.generateCacheKey(query, context2);

      expect(key1).toBe(key2);
      expect(key1).toMatch(/^ai:query:[a-f0-9]{12}$/);
    });

    it('应该为不同查询生成不同的缓存键', () => {
      const query1 = '查询1';
      const query2 = '查询2';
      const context = { userId: 1, modelId: 'gpt-4' };

      const key1 = aiQueryCacheService.generateCacheKey(query1, context);
      const key2 = aiQueryCacheService.generateCacheKey(query2, context);

      expect(key1).not.toBe(key2);
    });
  });

  describe('智能缓存策略', () => {
    it('应该根据查询类型设置不同的过期时间', async () => {
      const testCases = [
        {
          query: '今天的天气如何？',
          expectedTTL: 1800, // 30分钟（时效性强）
          type: 'weather'
        },
        {
          query: '什么是机器学习？',
          expectedTTL: 86400, // 24小时（知识性问题）
          type: 'knowledge'
        },
        {
          query: '学生张三的成绩如何？',
          expectedTTL: 3600, // 1小时（个人数据）
          type: 'personal'
        }
      ];

      for (const testCase of testCases) {
        const context = { userId: 1, modelId: 'gpt-4' };
        const response = { content: '测试回答', usage: {} };

        mockRedisClient.set.mockResolvedValue('OK');

        await aiQueryCacheService.cacheQuery(testCase.query, context, response);

        expect(mockRedisClient.set).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(String),
          'EX',
          testCase.expectedTTL
        );
      }
    });

    it('应该实现LRU缓存淘汰策略', async () => {
      const maxCacheSize = 1000;
      const currentCacheSize = 1050;

      mockRedisClient.zcard.mockResolvedValue(currentCacheSize);
      mockRedisClient.zrange.mockResolvedValue([
        'ai:query:old1',
        'ai:query:old2',
        'ai:query:old3'
      ]);
      mockRedisClient.del.mockResolvedValue(3);
      mockRedisClient.zrem.mockResolvedValue(3);

      const evictedCount = await aiQueryCacheService.evictLRU(maxCacheSize);

      expect(mockRedisClient.zcard).toHaveBeenCalledWith('ai:query:lru');
      expect(mockRedisClient.zrange).toHaveBeenCalledWith('ai:query:lru', 0, 49); // 淘汰50个最旧的
      expect(mockRedisClient.del).toHaveBeenCalledWith('ai:query:old1', 'ai:query:old2', 'ai:query:old3');
      expect(evictedCount).toBe(3);
      expect(mockLogger.info).toHaveBeenCalledWith(
        `Evicted ${evictedCount} cache entries using LRU strategy`
      );
    });

    it('应该根据查询频率调整缓存优先级', async () => {
      const query = '常见问题：如何注册？';
      const context = { userId: 1, modelId: 'gpt-4' };

      // 模拟高频查询
      mockRedisClient.hget.mockResolvedValue('15'); // 查询频率
      mockRedisClient.hset.mockResolvedValue(1);
      mockRedisClient.zadd.mockResolvedValue(1);

      await aiQueryCacheService.updateQueryFrequency(query, context);

      expect(mockRedisClient.hget).toHaveBeenCalledWith('ai:query:frequency', expect.any(String));
      expect(mockRedisClient.hset).toHaveBeenCalledWith('ai:query:frequency', expect.any(String), '16');
      expect(mockRedisClient.zadd).toHaveBeenCalledWith(
        'ai:query:priority',
        16, // 新的频率分数
        expect.any(String)
      );
    });

    it('应该实现查询相似性检测', async () => {
      const query1 = '学生的学习情况如何？';
      const query2 = '学生学习状况怎么样？';
      const context = { userId: 1, modelId: 'gpt-4' };

      const similarity = await aiQueryCacheService.calculateQuerySimilarity(query1, query2);

      expect(similarity).toBeGreaterThan(0.8); // 高相似度
      expect(typeof similarity).toBe('number');
      expect(similarity).toBeLessThanOrEqual(1.0);
    });

    it('应该为相似查询复用缓存', async () => {
      const originalQuery = '今天有什么活动？';
      const similarQuery = '今日活动安排是什么？';
      const context = { userId: 1, modelId: 'gpt-4' };
      const cachedResponse = {
        content: '今天的活动安排...',
        usage: {},
        similarity: 0.85
      };

      // 模拟找到相似查询的缓存
      mockRedisClient.keys.mockResolvedValue(['ai:query:abc123']);
      mockRedisClient.get.mockResolvedValue(JSON.stringify(cachedResponse));

      const result = await aiQueryCacheService.findSimilarCachedQuery(similarQuery, context);

      expect(result).toEqual(cachedResponse);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Found similar cached query',
        expect.objectContaining({ similarity: 0.85 })
      );
    });
  });

  describe('缓存分析和优化', () => {
    it('应该分析缓存命中率', async () => {
      const timeRange = {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24小时前
        end: new Date()
      };

      mockMetricsService.getCacheMetrics.mockResolvedValue({
        hits: 850,
        misses: 150,
        writes: 200,
        evictions: 50
      });

      const analysis = await aiQueryCacheService.analyzeCachePerformance(timeRange);

      expect(analysis).toEqual({
        hitRate: 0.85,
        missRate: 0.15,
        totalRequests: 1000,
        cacheEfficiency: 'good',
        recommendations: expect.any(Array),
        timeRange
      });
      expect(mockMetricsService.getCacheMetrics).toHaveBeenCalledWith('ai_query', timeRange);
    });

    it('应该识别热点查询', async () => {
      const hotQueries = [
        { query: '今天天气', frequency: 50, cacheKey: 'ai:query:weather1' },
        { query: '学生成绩', frequency: 35, cacheKey: 'ai:query:grades1' },
        { query: '活动安排', frequency: 28, cacheKey: 'ai:query:activities1' }
      ];

      mockRedisClient.zrange.mockResolvedValue([
        'ai:query:weather1',
        'ai:query:grades1',
        'ai:query:activities1'
      ]);
      mockRedisClient.hgetall.mockResolvedValue({
        'ai:query:weather1': '50',
        'ai:query:grades1': '35',
        'ai:query:activities1': '28'
      });

      const result = await aiQueryCacheService.identifyHotQueries(10);

      expect(mockRedisClient.zrange).toHaveBeenCalledWith(
        'ai:query:priority',
        -10, -1, // 获取前10个高频查询
        'WITHSCORES'
      );
      expect(result).toHaveLength(3);
      expect(result[0].frequency).toBe(50);
      expect(result[0].cacheKey).toBe('ai:query:weather1');
    });

    it('应该优化缓存配置', async () => {
      const currentConfig = {
        maxSize: 1000,
        defaultTTL: 3600,
        compressionThreshold: 1024
      };

      const performanceData = {
        hitRate: 0.65, // 较低的命中率
        avgResponseSize: 2048,
        evictionRate: 0.3
      };

      mockMetricsService.getCacheMetrics.mockResolvedValue(performanceData);

      const optimizedConfig = await aiQueryCacheService.optimizeCacheConfig(currentConfig);

      expect(optimizedConfig.maxSize).toBeGreaterThan(currentConfig.maxSize);
      expect(optimizedConfig.defaultTTL).toBeGreaterThan(currentConfig.defaultTTL);
      expect(optimizedConfig.compressionThreshold).toBeLessThan(currentConfig.compressionThreshold);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Cache configuration optimized',
        expect.any(Object)
      );
    });

    it('应该生成缓存使用报告', async () => {
      const reportPeriod = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31')
      };

      mockMetricsService.getCacheMetrics.mockResolvedValue({
        totalRequests: 10000,
        hits: 7500,
        misses: 2500,
        writes: 3000,
        evictions: 500,
        avgLatency: 25
      });

      mockRedisClient.zcard.mockResolvedValue(800); // 当前缓存条目数

      const report = await aiQueryCacheService.generateUsageReport(reportPeriod);

      expect(report).toEqual({
        period: reportPeriod,
        totalRequests: 10000,
        hitRate: 0.75,
        avgLatency: 25,
        currentCacheSize: 800,
        topQueries: expect.any(Array),
        recommendations: expect.any(Array),
        costSavings: expect.any(Number)
      });
    });
  });

  describe('缓存持久化', () => {
    it('应该将热点查询持久化到数据库', async () => {
      const hotQuery = {
        query: '学生考试成绩统计',
        context: { userId: 1, modelId: 'gpt-4' },
        response: { content: '统计结果...', usage: {} },
        frequency: 25,
        lastAccessed: new Date()
      };

      mockAIQueryCacheModel.create.mockResolvedValue({
        id: 1,
        ...hotQuery
      });

      const result = await aiQueryCacheService.persistHotQuery(hotQuery);

      expect(mockAIQueryCacheModel.create).toHaveBeenCalledWith({
        queryHash: expect.any(String),
        query: hotQuery.query,
        context: JSON.stringify(hotQuery.context),
        response: JSON.stringify(hotQuery.response),
        frequency: hotQuery.frequency,
        lastAccessed: hotQuery.lastAccessed,
        isPersistent: true
      });
      expect(result.id).toBe(1);
    });

    it('应该从数据库恢复持久化缓存', async () => {
      const persistentCaches = [
        {
          id: 1,
          queryHash: 'hash1',
          query: '常见问题1',
          context: '{"userId":1}',
          response: '{"content":"答案1"}',
          frequency: 30
        },
        {
          id: 2,
          queryHash: 'hash2',
          query: '常见问题2',
          context: '{"userId":2}',
          response: '{"content":"答案2"}',
          frequency: 25
        }
      ];

      mockAIQueryCacheModel.findAll.mockResolvedValue(persistentCaches);
      mockRedisClient.set.mockResolvedValue('OK');

      const restoredCount = await aiQueryCacheService.restorePersistentCache();

      expect(mockAIQueryCacheModel.findAll).toHaveBeenCalledWith({
        where: { isPersistent: true },
        order: [['frequency', 'DESC']]
      });
      expect(mockRedisClient.set).toHaveBeenCalledTimes(2);
      expect(restoredCount).toBe(2);
      expect(mockLogger.info).toHaveBeenCalledWith(
        `Restored ${restoredCount} persistent cache entries`
      );
    });

    it('应该清理过期的持久化缓存', async () => {
      const expiredCaches = [
        { id: 1, queryHash: 'expired1' },
        { id: 2, queryHash: 'expired2' }
      ];

      mockAIQueryCacheModel.findAll.mockResolvedValue(expiredCaches);
      mockAIQueryCacheModel.destroy.mockResolvedValue(2);

      const cleanedCount = await aiQueryCacheService.cleanExpiredPersistentCache();

      expect(mockAIQueryCacheModel.findAll).toHaveBeenCalledWith({
        where: {
          lastAccessed: {
            [expect.any(Symbol)]: expect.any(Date) // 30天前
          }
        }
      });
      expect(mockAIQueryCacheModel.destroy).toHaveBeenCalledWith({
        where: {
          id: { [expect.any(Symbol)]: [1, 2] }
        }
      });
      expect(cleanedCount).toBe(2);
    });
  });

  describe('错误处理', () => {
    it('应该处理Redis连接失败', async () => {
      const query = '测试查询';
      const context = { userId: 1, modelId: 'gpt-4' };

      mockRedisClient.get.mockRejectedValue(new Error('Redis connection failed'));

      const result = await aiQueryCacheService.getCachedQuery(query, context);

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Cache get operation failed',
        expect.any(Object)
      );
    });

    it('应该处理缓存数据损坏', async () => {
      const query = '损坏数据查询';
      const context = { userId: 1, modelId: 'gpt-4' };

      mockRedisClient.get.mockResolvedValue('invalid-json-data');
      mockCompressionService.decompress.mockImplementation(() => {
        throw new Error('Decompression failed');
      });

      const result = await aiQueryCacheService.getCachedQuery(query, context);

      expect(result).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Cache data corrupted, removing entry',
        expect.any(Object)
      );
      expect(mockRedisClient.del).toHaveBeenCalled();
    });

    it('应该处理缓存写入失败', async () => {
      const query = '写入失败查询';
      const context = { userId: 1, modelId: 'gpt-4' };
      const response = { content: '测试回答', usage: {} };

      mockRedisClient.set.mockRejectedValue(new Error('Write failed'));

      const result = await aiQueryCacheService.cacheQuery(query, context, response);

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Cache write operation failed',
        expect.any(Object)
      );
    });

    it('应该处理数据库持久化失败', async () => {
      const hotQuery = {
        query: '持久化失败查询',
        context: { userId: 1 },
        response: { content: '回答' },
        frequency: 20
      };

      mockAIQueryCacheModel.create.mockRejectedValue(new Error('Database error'));

      const result = await aiQueryCacheService.persistHotQuery(hotQuery);

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to persist hot query',
        expect.any(Object)
      );
    });
  });

  describe('性能监控', () => {
    it('应该记录缓存操作延迟', async () => {
      const query = '性能测试查询';
      const context = { userId: 1, modelId: 'gpt-4' };

      mockRedisClient.get.mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve(null), 50); // 50ms延迟
        });
      });

      const startTime = Date.now();
      await aiQueryCacheService.getCachedQuery(query, context);
      const endTime = Date.now();

      expect(mockMetricsService.recordQueryLatency).toHaveBeenCalledWith(
        'cache_get',
        expect.any(Number)
      );
    });

    it('应该监控缓存内存使用', async () => {
      mockRedisClient.keys.mockResolvedValue(Array(500).fill('ai:query:test'));

      const memoryUsage = await aiQueryCacheService.getMemoryUsage();

      expect(memoryUsage).toEqual({
        totalKeys: 500,
        estimatedMemory: expect.any(Number),
        compressionRatio: expect.any(Number),
        efficiency: expect.any(String)
      });
    });
  });
});
