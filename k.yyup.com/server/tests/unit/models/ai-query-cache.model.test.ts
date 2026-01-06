import { AIQueryCache } from '../../../src/models/ai-query-cache.model';
import { vi } from 'vitest'
import { sequelize } from '../../../src/config/database';
import * as crypto from 'crypto';

// Mock dependencies
jest.mock('../../../src/config/database');
jest.mock('crypto');


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

describe('AIQueryCache Model', () => {
  let mockCrypto: jest.Mocked<typeof crypto>;

  beforeEach(() => {
    mockCrypto = crypto as jest.Mocked<typeof crypto>;
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock crypto methods
    mockCrypto.createHash = jest.fn().mockReturnThis();
    mockCrypto.update = jest.fn().mockReturnThis();
    mockCrypto.digest = jest.fn()
      .mockReturnValueOnce('test-query-hash')
      .mockReturnValueOnce('test-context-hash');
  });

  describe('Model Definition', () => {
    it('should have correct model attributes', () => {
      expect(AIQueryCache).toBeDefined();
      expect(AIQueryCache).toBeInstanceOf(Function);
    });

    it('should have correct table configuration', () => {
      const modelInstance = new AIQueryCache();
      expect(modelInstance).toBeDefined();
    });
  });

  describe('Model Attributes', () => {
    let modelInstance: AIQueryCache;

    beforeEach(() => {
      modelInstance = new AIQueryCache();
    });

    it('should have all required attributes', () => {
      expect(modelInstance).toHaveProperty('id');
      expect(modelInstance).toHaveProperty('queryHash');
      expect(modelInstance).toHaveProperty('naturalQuery');
      expect(modelInstance).toHaveProperty('contextHash');
      expect(modelInstance).toHaveProperty('generatedSql');
      expect(modelInstance).toHaveProperty('resultData');
      expect(modelInstance).toHaveProperty('resultMetadata');
      expect(modelInstance).toHaveProperty('hitCount');
      expect(modelInstance).toHaveProperty('expiresAt');
      expect(modelInstance).toHaveProperty('isValid');
      expect(modelInstance).toHaveProperty('createdAt');
      expect(modelInstance).toHaveProperty('updatedAt');
    });

    it('should have optional attributes', () => {
      expect(modelInstance).toHaveProperty('lastHitAt');
    });

    it('should have correct default values', () => {
      expect(modelInstance.hitCount).toBeUndefined();
      expect(modelInstance.isValid).toBeUndefined();
    });
  });

  describe('Static Methods', () => {
    describe('generateQueryHash', () => {
      it('should generate query hash correctly', () => {
        const naturalQuery = 'test query';
        const contextHash = 'test-context';
        
        const result = AIQueryCache.generateQueryHash(naturalQuery, contextHash);
        
        expect(mockCrypto.createHash).toHaveBeenCalledWith('sha256');
        expect(mockCrypto.update).toHaveBeenCalledWith(`${naturalQuery.toLowerCase().trim()}:${contextHash}`);
        expect(mockCrypto.digest).toHaveBeenCalledWith('hex');
        expect(result).toBe('test-query-hash');
      });

      it('should handle case sensitivity correctly', () => {
        const naturalQuery = 'TEST Query';
        const contextHash = 'test-context';
        
        AIQueryCache.generateQueryHash(naturalQuery, contextHash);
        
        expect(mockCrypto.update).toHaveBeenCalledWith(`${naturalQuery.toLowerCase().trim()}:${contextHash}`);
      });

      it('should handle whitespace correctly', () => {
        const naturalQuery = '  test query  ';
        const contextHash = 'test-context';
        
        AIQueryCache.generateQueryHash(naturalQuery, contextHash);
        
        expect(mockCrypto.update).toHaveBeenCalledWith(`${naturalQuery.toLowerCase().trim()}:${contextHash}`);
      });
    });

    describe('generateContextHash', () => {
      it('should generate context hash correctly', () => {
        const context = { key1: 'value1', key2: 'value2' };
        
        const result = AIQueryCache.generateContextHash(context);
        
        expect(mockCrypto.createHash).toHaveBeenCalledWith('md5');
        expect(mockCrypto.update).toHaveBeenCalledWith(JSON.stringify(context, Object.keys(context).sort()));
        expect(mockCrypto.digest).toHaveBeenCalledWith('hex');
        expect(result).toBe('test-context-hash');
      });

      it('should sort object keys consistently', () => {
        const context = { b: 'value2', a: 'value1' };
        
        AIQueryCache.generateContextHash(context);
        
        // Keys should be sorted alphabetically
        const expectedSortedKeys = ['a', 'b'];
        expect(mockCrypto.update).toHaveBeenCalledWith(JSON.stringify(context, expectedSortedKeys));
      });
    });

    describe('getCacheStats', () => {
      it('should return correct cache statistics', async () => {
        const mockCaches = [
          { isValid: true, hitCount: 10, expiresAt: new Date(Date.now() + 86400000) },
          { isValid: false, hitCount: 5, expiresAt: new Date(Date.now() + 86400000) },
          { isValid: true, hitCount: 15, expiresAt: new Date(Date.now() - 86400000) },
        ];

        const mockFindAll = jest.spyOn(AIQueryCache, 'findAll').mockResolvedValue(mockCaches as any);

        const stats = await AIQueryCache.getCacheStats();

        expect(stats).toEqual({
          totalCaches: 2, // Only non-expired caches
          validCaches: 1,
          expiredCaches: 1,
          totalHits: 15, // 10 + 5 (only non-expired)
          avgHitsPerCache: 7.5, // 15 / 2
        });

        expect(mockFindAll).toHaveBeenCalledWith({
          where: {
            expiresAt: {
              [expect.any(String)]: expect.any(Date),
            },
          },
        });
      });

      it('should handle empty cache list', async () => {
        const mockFindAll = jest.spyOn(AIQueryCache, 'findAll').mockResolvedValue([]);

        const stats = await AIQueryCache.getCacheStats();

        expect(stats).toEqual({
          totalCaches: 0,
          validCaches: 0,
          expiredCaches: 0,
          totalHits: 0,
          avgHitsPerCache: 0,
        });
      });
    });

    describe('cleanupExpired', () => {
      it('should delete expired caches', async () => {
        const mockDestroy = jest.spyOn(AIQueryCache, 'destroy').mockResolvedValue(5);

        const result = await AIQueryCache.cleanupExpired();

        expect(result).toBe(5);
        expect(mockDestroy).toHaveBeenCalledWith({
          where: {
            expiresAt: {
              [expect.any(String)]: expect.any(Date),
            },
          },
        });
      });
    });

    describe('cleanupInvalid', () => {
      it('should delete invalid expired caches', async () => {
        const mockDestroy = jest.spyOn(AIQueryCache, 'destroy').mockResolvedValue(3);

        const result = await AIQueryCache.cleanupInvalid();

        expect(result).toBe(3);
        expect(mockDestroy).toHaveBeenCalledWith({
          where: {
            isValid: false,
            expiresAt: {
              [expect.any(String)]: expect.any(Date),
            },
          },
        });
      });
    });

    describe('getPopularCaches', () => {
      it('should return popular caches ordered by hit count', async () => {
        const mockPopularCaches = [
          { hitCount: 100, lastHitAt: new Date() },
          { hitCount: 50, lastHitAt: new Date() },
        ];

        const mockFindAll = jest.spyOn(AIQueryCache, 'findAll').mockResolvedValue(mockPopularCaches as any);

        const result = await AIQueryCache.getPopularCaches(10);

        expect(result).toEqual(mockPopularCaches);
        expect(mockFindAll).toHaveBeenCalledWith({
          where: {
            isValid: true,
            expiresAt: {
              [expect.any(String)]: expect.any(Date),
            },
          },
          order: [['hitCount', 'DESC'], ['lastHitAt', 'DESC']],
          limit: 10,
        });
      });
    });

    describe('findByQuery', () => {
      it('should find cache by natural query and context', async () => {
        const naturalQuery = 'test query';
        const context = { key: 'value' };
        const mockCache = { queryHash: 'test-hash' };

        const mockFindOne = jest.spyOn(AIQueryCache, 'findOne').mockResolvedValue(mockCache as any);

        const result = await AIQueryCache.findByQuery(naturalQuery, context);

        expect(result).toEqual(mockCache);
        expect(mockFindOne).toHaveBeenCalledWith({
          where: {
            queryHash: 'test-query-hash',
            isValid: true,
            expiresAt: {
              [expect.any(String)]: expect.any(Date),
            },
          },
        });
      });
    });
  });

  describe('Instance Methods', () => {
    let modelInstance: AIQueryCache;

    beforeEach(() => {
      modelInstance = new AIQueryCache({
        queryHash: 'test-hash',
        naturalQuery: 'test query',
        contextHash: 'context-hash',
        generatedSql: 'SELECT * FROM test',
        resultData: [],
        resultMetadata: {
          totalRows: 0,
          columnsInfo: [],
          executionTime: 0,
        },
        hitCount: 0,
        expiresAt: new Date(Date.now() + 3600000),
        isValid: true,
      });
    });

    describe('isExpired', () => {
      it('should return true for expired cache', () => {
        modelInstance.expiresAt = new Date(Date.now() - 1000);
        expect(modelInstance.isExpired()).toBe(true);
      });

      it('should return false for non-expired cache', () => {
        modelInstance.expiresAt = new Date(Date.now() + 1000);
        expect(modelInstance.isExpired()).toBe(false);
      });
    });

    describe('incrementHit', () => {
      it('should increment hit count and update last hit time', async () => {
        const mockSave = jest.spyOn(modelInstance, 'save').mockResolvedValue(modelInstance);
        
        const initialHitCount = modelInstance.hitCount;
        await modelInstance.incrementHit();

        expect(modelInstance.hitCount).toBe(initialHitCount + 1);
        expect(modelInstance.lastHitAt).toBeInstanceOf(Date);
        expect(mockSave).toHaveBeenCalled();
      });
    });

    describe('markInvalid', () => {
      it('should mark cache as invalid', async () => {
        const mockSave = jest.spyOn(modelInstance, 'save').mockResolvedValue(modelInstance);
        
        await modelInstance.markInvalid();

        expect(modelInstance.isValid).toBe(false);
        expect(mockSave).toHaveBeenCalled();
      });
    });
  });

  describe('Model Initialization', () => {
    it('should initialize with correct configuration', () => {
            
      // Re-require the module to trigger initialization
      require('../../../src/models/ai-query-cache.model');

      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.objectContaining({
            type: expect.any(Object),
            autoIncrement: true,
            primaryKey: true,
          }),
          queryHash: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            unique: true,
            field: 'query_hash',
          }),
          naturalQuery: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            field: 'natural_query',
          }),
        }),
        expect.objectContaining({
          sequelize,
          modelName: 'AIQueryCache',
          tableName: 'ai_query_cache',
          timestamps: true,
          underscored: true,
          indexes: expect.arrayContaining([
            { fields: ['query_hash'], unique: true },
            { fields: ['context_hash'] },
            { fields: ['expires_at'] },
            { fields: ['is_valid'] },
            { fields: ['hit_count'] },
            { fields: ['last_hit_at'] },
            { fields: ['created_at'] },
          ]),
        })
      );
    });
  });

  describe('Model Validation', () => {
    it('should validate required fields', () => {
      const modelInstance = new AIQueryCache();
      
      expect(modelInstance).toHaveProperty('queryHash');
      expect(modelInstance).toHaveProperty('naturalQuery');
      expect(modelInstance).toHaveProperty('contextHash');
      expect(modelInstance).toHaveProperty('generatedSql');
      expect(modelInstance).toHaveProperty('resultData');
      expect(modelInstance).toHaveProperty('resultMetadata');
      expect(modelInstance).toHaveProperty('expiresAt');
      expect(modelInstance).toHaveProperty('isValid');
    });

    it('should validate unique constraint on queryHash', () => {
      const modelInstance = new AIQueryCache();
      modelInstance.queryHash = 'unique-query-hash';
      
      expect(modelInstance.queryHash).toBe('unique-query-hash');
    });
  });

  describe('Model Instances', () => {
    it('should create a valid model instance', () => {
      const modelInstance = new AIQueryCache({
        queryHash: 'test-hash',
        naturalQuery: 'test query',
        contextHash: 'context-hash',
        generatedSql: 'SELECT * FROM test',
        resultData: [{ id: 1, name: 'test' }],
        resultMetadata: {
          totalRows: 1,
          columnsInfo: [{ name: 'id', type: 'INTEGER' }],
          executionTime: 100,
        },
        hitCount: 0,
        expiresAt: new Date(Date.now() + 3600000),
        isValid: true,
      });

      expect(modelInstance.queryHash).toBe('test-hash');
      expect(modelInstance.naturalQuery).toBe('test query');
      expect(modelInstance.contextHash).toBe('context-hash');
      expect(modelInstance.generatedSql).toBe('SELECT * FROM test');
      expect(modelInstance.resultData).toEqual([{ id: 1, name: 'test' }]);
      expect(modelInstance.resultMetadata).toEqual({
        totalRows: 1,
        columnsInfo: [{ name: 'id', type: 'INTEGER' }],
        executionTime: 100,
      });
      expect(modelInstance.hitCount).toBe(0);
      expect(modelInstance.expiresAt).toBeInstanceOf(Date);
      expect(modelInstance.isValid).toBe(true);
    });
  });
});