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
  flushdb: jest.fn(),
  mget: jest.fn(),
  mset: jest.fn(),
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

const mockAIModelConfigService = {
  getModelConfig: jest.fn(),
  updateModelConfig: jest.fn(),
  getAllModels: jest.fn(),
  getModelsByProvider: jest.fn()
};

const mockMetricsService = {
  recordCacheHit: jest.fn(),
  recordCacheMiss: jest.fn(),
  recordCacheWrite: jest.fn(),
  recordCacheEviction: jest.fn(),
  getCacheStats: jest.fn()
};

const mockCompressionService = {
  compress: jest.fn(),
  decompress: jest.fn(),
  getCompressionRatio: jest.fn()
};

// Mock imports
jest.unstable_mockModule('../../../../../../src/config/redis', () => ({
  default: mockRedisClient
}));

jest.unstable_mockModule('../../../../../../src/utils/logger', () => ({
  default: mockLogger
}));

jest.unstable_mockModule('../../../../../../src/services/ai/ai-model-config.service', () => ({
  default: mockAIModelConfigService
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

describe('AIModelCacheService', () => {
  let aiModelCacheService: any;

  beforeAll(async () => {
    const imported = await import('../../../../../../src/services/ai/ai-model-cache.service');
    aiModelCacheService = imported.default || imported.AIModelCacheService || imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('模型配置缓存', () => {
    it('应该缓存模型配置', async () => {
      const modelId = 'gpt-4';
      const modelConfig = {
        id: 'gpt-4',
        name: 'GPT-4',
        provider: 'openai',
        maxTokens: 8192,
        temperature: 0.7,
        pricing: {
          input: 0.03,
          output: 0.06
        },
        capabilities: ['text', 'chat'],
        status: 'active'
      };

      mockRedisClient.get.mockResolvedValue(null); // 缓存未命中
      mockAIModelConfigService.getModelConfig.mockResolvedValue(modelConfig);
      mockRedisClient.set.mockResolvedValue('OK');
      mockCompressionService.compress.mockReturnValue(JSON.stringify(modelConfig));

      const result = await aiModelCacheService.getModelConfig(modelId);

      expect(mockRedisClient.get).toHaveBeenCalledWith(`model:config:${modelId}`);
      expect(mockAIModelConfigService.getModelConfig).toHaveBeenCalledWith(modelId);
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        `model:config:${modelId}`,
        expect.any(String),
        'EX',
        3600 // 1小时过期
      );
      expect(mockMetricsService.recordCacheMiss).toHaveBeenCalledWith('model_config', modelId);
      expect(mockMetricsService.recordCacheWrite).toHaveBeenCalledWith('model_config', modelId);
      expect(result).toEqual(modelConfig);
    });

    it('应该从缓存中获取模型配置', async () => {
      const modelId = 'gpt-3.5-turbo';
      const cachedConfig = {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        provider: 'openai',
        maxTokens: 4096,
        temperature: 0.7
      };

      mockRedisClient.get.mockResolvedValue(JSON.stringify(cachedConfig));
      mockCompressionService.decompress.mockReturnValue(JSON.stringify(cachedConfig));

      const result = await aiModelCacheService.getModelConfig(modelId);

      expect(mockRedisClient.get).toHaveBeenCalledWith(`model:config:${modelId}`);
      expect(mockAIModelConfigService.getModelConfig).not.toHaveBeenCalled();
      expect(mockMetricsService.recordCacheHit).toHaveBeenCalledWith('model_config', modelId);
      expect(result).toEqual(cachedConfig);
    });

    it('应该处理缓存获取失败', async () => {
      const modelId = 'claude-3';
      const modelConfig = {
        id: 'claude-3',
        name: 'Claude 3',
        provider: 'anthropic'
      };

      mockRedisClient.get.mockRejectedValue(new Error('Redis connection failed'));
      mockAIModelConfigService.getModelConfig.mockResolvedValue(modelConfig);

      const result = await aiModelCacheService.getModelConfig(modelId);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Cache get failed, falling back to database',
        expect.any(Object)
      );
      expect(mockAIModelConfigService.getModelConfig).toHaveBeenCalledWith(modelId);
      expect(result).toEqual(modelConfig);
    });

    it('应该批量缓存模型配置', async () => {
      const modelIds = ['gpt-4', 'gpt-3.5-turbo', 'claude-3'];
      const modelConfigs = [
        { id: 'gpt-4', name: 'GPT-4', provider: 'openai' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai' },
        { id: 'claude-3', name: 'Claude 3', provider: 'anthropic' }
      ];

      mockRedisClient.mget.mockResolvedValue([null, null, null]); // 全部缓存未命中
      mockAIModelConfigService.getModelConfig
        .mockResolvedValueOnce(modelConfigs[0])
        .mockResolvedValueOnce(modelConfigs[1])
        .mockResolvedValueOnce(modelConfigs[2]);
      mockRedisClient.mset.mockResolvedValue('OK');
      mockCompressionService.compress.mockImplementation((data) => data);

      const results = await aiModelCacheService.getModelConfigs(modelIds);

      expect(mockRedisClient.mget).toHaveBeenCalledWith(
        modelIds.map(id => `model:config:${id}`)
      );
      expect(mockAIModelConfigService.getModelConfig).toHaveBeenCalledTimes(3);
      expect(mockRedisClient.mset).toHaveBeenCalled();
      expect(results).toEqual(modelConfigs);
    });
  });

  describe('模型响应缓存', () => {
    it('应该缓存模型响应', async () => {
      const cacheKey = 'response:gpt-4:hash123';
      const response = {
        content: 'This is a test response',
        usage: {
          promptTokens: 10,
          completionTokens: 20,
          totalTokens: 30
        },
        model: 'gpt-4',
        timestamp: Date.now()
      };

      mockRedisClient.set.mockResolvedValue('OK');
      mockCompressionService.compress.mockReturnValue(JSON.stringify(response));

      await aiModelCacheService.cacheResponse(cacheKey, response, 1800); // 30分钟

      expect(mockRedisClient.set).toHaveBeenCalledWith(
        cacheKey,
        expect.any(String),
        'EX',
        1800
      );
      expect(mockCompressionService.compress).toHaveBeenCalledWith(JSON.stringify(response));
      expect(mockMetricsService.recordCacheWrite).toHaveBeenCalledWith('model_response', cacheKey);
    });

    it('应该获取缓存的模型响应', async () => {
      const cacheKey = 'response:gpt-4:hash456';
      const cachedResponse = {
        content: 'Cached response',
        usage: { promptTokens: 15, completionTokens: 25, totalTokens: 40 },
        model: 'gpt-4'
      };

      mockRedisClient.get.mockResolvedValue(JSON.stringify(cachedResponse));
      mockCompressionService.decompress.mockReturnValue(JSON.stringify(cachedResponse));

      const result = await aiModelCacheService.getCachedResponse(cacheKey);

      expect(mockRedisClient.get).toHaveBeenCalledWith(cacheKey);
      expect(mockCompressionService.decompress).toHaveBeenCalled();
      expect(mockMetricsService.recordCacheHit).toHaveBeenCalledWith('model_response', cacheKey);
      expect(result).toEqual(cachedResponse);
    });

    it('应该处理缓存响应未命中', async () => {
      const cacheKey = 'response:gpt-4:hash789';

      mockRedisClient.get.mockResolvedValue(null);

      const result = await aiModelCacheService.getCachedResponse(cacheKey);

      expect(mockRedisClient.get).toHaveBeenCalledWith(cacheKey);
      expect(mockMetricsService.recordCacheMiss).toHaveBeenCalledWith('model_response', cacheKey);
      expect(result).toBeNull();
    });

    it('应该生成响应缓存键', () => {
      const prompt = 'What is the capital of France?';
      const modelId = 'gpt-4';
      const parameters = {
        temperature: 0.7,
        maxTokens: 100,
        topP: 1.0
      };

      const cacheKey = aiModelCacheService.generateResponseCacheKey(prompt, modelId, parameters);

      expect(cacheKey).toMatch(/^response:gpt-4:[a-f0-9]{32}$/);
      expect(typeof cacheKey).toBe('string');
    });

    it('应该为相同输入生成相同的缓存键', () => {
      const prompt = 'Test prompt';
      const modelId = 'gpt-3.5-turbo';
      const parameters = { temperature: 0.5 };

      const key1 = aiModelCacheService.generateResponseCacheKey(prompt, modelId, parameters);
      const key2 = aiModelCacheService.generateResponseCacheKey(prompt, modelId, parameters);

      expect(key1).toBe(key2);
    });

    it('应该为不同输入生成不同的缓存键', () => {
      const prompt1 = 'First prompt';
      const prompt2 = 'Second prompt';
      const modelId = 'gpt-4';
      const parameters = { temperature: 0.7 };

      const key1 = aiModelCacheService.generateResponseCacheKey(prompt1, modelId, parameters);
      const key2 = aiModelCacheService.generateResponseCacheKey(prompt2, modelId, parameters);

      expect(key1).not.toBe(key2);
    });
  });

  describe('缓存管理', () => {
    it('应该清除特定模型的缓存', async () => {
      const modelId = 'gpt-4';
      const cacheKeys = [
        `model:config:${modelId}`,
        `response:${modelId}:hash1`,
        `response:${modelId}:hash2`
      ];

      mockRedisClient.keys.mockResolvedValue(cacheKeys);
      mockRedisClient.del.mockResolvedValue(3);

      const deletedCount = await aiModelCacheService.clearModelCache(modelId);

      expect(mockRedisClient.keys).toHaveBeenCalledWith(`*${modelId}*`);
      expect(mockRedisClient.del).toHaveBeenCalledWith(...cacheKeys);
      expect(deletedCount).toBe(3);
      expect(mockLogger.info).toHaveBeenCalledWith(
        `Cleared ${deletedCount} cache entries for model ${modelId}`
      );
    });

    it('应该清除过期的缓存', async () => {
      const expiredKeys = [
        'response:gpt-4:old1',
        'response:gpt-3.5-turbo:old2',
        'model:config:deprecated'
      ];

      mockRedisClient.keys.mockResolvedValue(expiredKeys);
      mockRedisClient.ttl.mockImplementation((key) => {
        return Promise.resolve(key.includes('old') ? -1 : 300); // -1表示已过期
      });
      mockRedisClient.del.mockResolvedValue(2);

      const cleanedCount = await aiModelCacheService.cleanExpiredCache();

      expect(mockRedisClient.keys).toHaveBeenCalledWith('*');
      expect(mockRedisClient.del).toHaveBeenCalledWith(
        'response:gpt-4:old1',
        'response:gpt-3.5-turbo:old2'
      );
      expect(cleanedCount).toBe(2);
    });

    it('应该获取缓存统计信息', async () => {
      const allKeys = [
        'model:config:gpt-4',
        'model:config:gpt-3.5-turbo',
        'response:gpt-4:hash1',
        'response:gpt-4:hash2',
        'response:gpt-3.5-turbo:hash3'
      ];

      mockRedisClient.keys.mockResolvedValue(allKeys);
      mockMetricsService.getCacheStats.mockResolvedValue({
        hits: 150,
        misses: 50,
        hitRate: 0.75,
        writes: 200
      });

      const stats = await aiModelCacheService.getCacheStats();

      expect(mockRedisClient.keys).toHaveBeenCalledWith('*');
      expect(stats).toEqual({
        totalKeys: 5,
        modelConfigKeys: 2,
        responseKeys: 3,
        hits: 150,
        misses: 50,
        hitRate: 0.75,
        writes: 200
      });
    });

    it('应该预热缓存', async () => {
      const popularModels = ['gpt-4', 'gpt-3.5-turbo', 'claude-3'];
      const modelConfigs = [
        { id: 'gpt-4', name: 'GPT-4' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
        { id: 'claude-3', name: 'Claude 3' }
      ];

      mockAIModelConfigService.getAllModels.mockResolvedValue(modelConfigs);
      mockRedisClient.mset.mockResolvedValue('OK');
      mockCompressionService.compress.mockImplementation((data) => data);

      await aiModelCacheService.warmupCache(popularModels);

      expect(mockAIModelConfigService.getAllModels).toHaveBeenCalled();
      expect(mockRedisClient.mset).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        `Cache warmed up with ${popularModels.length} models`
      );
    });
  });

  describe('缓存优化', () => {
    it('应该压缩大型缓存数据', async () => {
      const modelId = 'large-model';
      const largeConfig = {
        id: modelId,
        name: 'Large Model',
        description: 'A'.repeat(10000), // 大型配置数据
        parameters: { /* 大量参数 */ }
      };

      mockRedisClient.get.mockResolvedValue(null);
      mockAIModelConfigService.getModelConfig.mockResolvedValue(largeConfig);
      mockCompressionService.compress.mockReturnValue('compressed_data');
      mockCompressionService.getCompressionRatio.mockReturnValue(0.3); // 70%压缩率
      mockRedisClient.set.mockResolvedValue('OK');

      await aiModelCacheService.getModelConfig(modelId);

      expect(mockCompressionService.compress).toHaveBeenCalledWith(JSON.stringify(largeConfig));
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        `model:config:${modelId}`,
        'compressed_data',
        'EX',
        3600
      );
      expect(mockLogger.debug).toHaveBeenCalledWith(
        `Compressed cache data for ${modelId}, ratio: 0.3`
      );
    });

    it('应该实现缓存分层', async () => {
      const modelId = 'tiered-model';
      const modelConfig = { id: modelId, name: 'Tiered Model' };

      // L1缓存（内存）未命中，L2缓存（Redis）命中
      mockRedisClient.get.mockResolvedValue(JSON.stringify(modelConfig));
      mockCompressionService.decompress.mockReturnValue(JSON.stringify(modelConfig));

      const result = await aiModelCacheService.getModelConfigWithTiering(modelId);

      expect(result).toEqual(modelConfig);
      expect(mockMetricsService.recordCacheHit).toHaveBeenCalledWith('model_config_l2', modelId);
    });

    it('应该实现缓存预取', async () => {
      const currentModelId = 'gpt-4';
      const relatedModels = ['gpt-3.5-turbo', 'gpt-4-turbo'];

      mockAIModelConfigService.getModelsByProvider.mockResolvedValue([
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' }
      ]);

      await aiModelCacheService.prefetchRelatedModels(currentModelId);

      expect(mockAIModelConfigService.getModelsByProvider).toHaveBeenCalledWith('openai');
      expect(mockLogger.debug).toHaveBeenCalledWith(
        `Prefetched ${relatedModels.length} related models for ${currentModelId}`
      );
    });

    it('应该实现智能缓存淘汰', async () => {
      const cacheKeys = [
        'model:config:rarely-used',
        'response:old-model:hash1',
        'response:popular-model:hash2'
      ];

      mockRedisClient.keys.mockResolvedValue(cacheKeys);
      mockMetricsService.getCacheStats.mockResolvedValue({
        keyUsage: {
          'model:config:rarely-used': { hits: 1, lastAccess: Date.now() - 86400000 }, // 1天前
          'response:old-model:hash1': { hits: 2, lastAccess: Date.now() - 3600000 }, // 1小时前
          'response:popular-model:hash2': { hits: 100, lastAccess: Date.now() - 60000 } // 1分钟前
        }
      });
      mockRedisClient.del.mockResolvedValue(1);

      const evictedCount = await aiModelCacheService.intelligentEviction();

      expect(evictedCount).toBe(1);
      expect(mockRedisClient.del).toHaveBeenCalledWith('model:config:rarely-used');
      expect(mockLogger.info).toHaveBeenCalledWith(
        `Intelligently evicted ${evictedCount} cache entries`
      );
    });
  });

  describe('错误处理', () => {
    it('应该处理Redis连接错误', async () => {
      const modelId = 'test-model';
      const modelConfig = { id: modelId, name: 'Test Model' };

      mockRedisClient.get.mockRejectedValue(new Error('Redis connection failed'));
      mockAIModelConfigService.getModelConfig.mockResolvedValue(modelConfig);

      const result = await aiModelCacheService.getModelConfig(modelId);

      expect(result).toEqual(modelConfig);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Cache operation failed',
        expect.any(Object)
      );
    });

    it('应该处理缓存数据损坏', async () => {
      const modelId = 'corrupted-model';
      const modelConfig = { id: modelId, name: 'Corrupted Model' };

      mockRedisClient.get.mockResolvedValue('invalid-json-data');
      mockCompressionService.decompress.mockImplementation(() => {
        throw new Error('Decompression failed');
      });
      mockAIModelConfigService.getModelConfig.mockResolvedValue(modelConfig);

      const result = await aiModelCacheService.getModelConfig(modelId);

      expect(result).toEqual(modelConfig);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Cache data corrupted, falling back to database',
        expect.any(Object)
      );
    });

    it('应该处理缓存写入失败', async () => {
      const modelId = 'write-fail-model';
      const modelConfig = { id: modelId, name: 'Write Fail Model' };

      mockRedisClient.get.mockResolvedValue(null);
      mockAIModelConfigService.getModelConfig.mockResolvedValue(modelConfig);
      mockRedisClient.set.mockRejectedValue(new Error('Write failed'));

      const result = await aiModelCacheService.getModelConfig(modelId);

      expect(result).toEqual(modelConfig);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Failed to cache model config',
        expect.any(Object)
      );
    });
  });

  describe('性能监控', () => {
    it('应该监控缓存性能', async () => {
      const modelId = 'perf-test-model';
      const startTime = Date.now();

      mockRedisClient.get.mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve(null), 50); // 模拟50ms延迟
        });
      });
      mockAIModelConfigService.getModelConfig.mockResolvedValue({ id: modelId });

      await aiModelCacheService.getModelConfig(modelId);

      expect(mockMetricsService.recordCacheMiss).toHaveBeenCalledWith('model_config', modelId);
      // 验证性能指标记录
    });

    it('应该生成缓存性能报告', async () => {
      mockMetricsService.getCacheStats.mockResolvedValue({
        hits: 800,
        misses: 200,
        hitRate: 0.8,
        avgResponseTime: 15,
        totalRequests: 1000
      });

      const report = await aiModelCacheService.generatePerformanceReport();

      expect(report).toEqual({
        hitRate: 0.8,
        avgResponseTime: 15,
        totalRequests: 1000,
        efficiency: 'good',
        recommendations: expect.any(Array)
      });
    });
  });
});
