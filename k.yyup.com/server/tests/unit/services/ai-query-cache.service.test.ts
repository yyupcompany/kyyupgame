import { vi } from 'vitest'
/**
 * AI Query Cache Service Test
 * AI查询缓存服务测试
 * 
 * 测试覆盖范围：
 * - 单例模式实现
 * - 查询哈希生成
 * - 缓存结果检索
 * - 查询结果保存
 * - 用户查询历史获取
 * - 查询详情获取
 * - 过期缓存清理
 * - 缓存统计信息
 * - 数据查询缓存
 * - AI响应缓存
 * - 分页功能
 * - 错误处理
 * - 数据类型转换
 * - 缓存命中检测
 */

import { AIQueryCacheService } from '../../../src/services/ai-query-cache.service'
import AIQueryHistory from '../../../src/models/AIQueryHistory'
import { Op } from 'sequelize'

// Mock dependencies
jest.mock('../../../src/models/AIQueryHistory')
const MockedAIQueryHistory = AIQueryHistory as jest.MockedClass<typeof AIQueryHistory>


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
  let aiQueryCacheService: AIQueryCacheService

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    
    // Create service instance
    aiQueryCacheService = AIQueryCacheService.getInstance()
  })

  describe('单例模式', () => {
    it('应该返回相同的实例', () => {
      const instance1 = AIQueryCacheService.getInstance()
      const instance2 = AIQueryCacheService.getInstance()
      
      expect(instance1).toBe(instance2)
    })

    it('应该只创建一个实例', () => {
      const getInstanceSpy = jest.spyOn(AIQueryCacheService.prototype as any, 'constructor')
      
      const instance1 = AIQueryCacheService.getInstance()
      const instance2 = AIQueryCacheService.getInstance()
      
      expect(getInstanceSpy).toHaveBeenCalledTimes(1)
      expect(instance1).toBe(instance2)
      
      getInstanceSpy.mockRestore()
    })
  })

  describe('generateQueryHash', () => {
    it('应该为相同的查询和用户生成相同的哈希值', () => {
      const service = aiQueryCacheService as any
      const queryText = 'test query'
      const userId = 1

      const hash1 = service.generateQueryHash(queryText, userId)
      const hash2 = service.generateQueryHash(queryText, userId)

      expect(hash1).toBe(hash2)
    })

    it('应该为不同的查询生成不同的哈希值', () => {
      const service = aiQueryCacheService as any
      const userId = 1

      const hash1 = service.generateQueryHash('query 1', userId)
      const hash2 = service.generateQueryHash('query 2', userId)

      expect(hash1).not.toBe(hash2)
    })

    it('应该为不同的用户生成不同的哈希值', () => {
      const service = aiQueryCacheService as any
      const queryText = 'test query'

      const hash1 = service.generateQueryHash(queryText, 1)
      const hash2 = service.generateQueryHash(queryText, 2)

      expect(hash1).not.toBe(hash2)
    })

    it('应该忽略查询文本的大小写和前后空格', () => {
      const service = aiQueryCacheService as any
      const userId = 1

      const hash1 = service.generateQueryHash('Test Query', userId)
      const hash2 = service.generateQueryHash('test query', userId)
      const hash3 = service.generateQueryHash('  test query  ', userId)

      expect(hash1).toBe(hash2)
      expect(hash2).toBe(hash3)
    })
  })

  describe('getCachedResult', () => {
    it('应该返回缓存的数据查询结果', async () => {
      const mockRecord = {
        id: 1,
        queryType: 'data_query',
        responseData: {
          data: [{ id: 1, name: 'test' }],
          metadata: {
            totalRows: 1,
            columns: ['id', 'name']
          },
          visualization: { type: 'chart' }
        },
        generatedSQL: 'SELECT * FROM test',
        executionTime: 100,
        modelUsed: 'test-model',
        sessionId: 'session-123',
        createdAt: new Date()
      }

      MockedAIQueryHistory.findOne.mockResolvedValue(mockRecord)

      const queryText = 'test query'
      const userId = 1

      const result = await aiQueryCacheService.getCachedResult(queryText, userId)

      expect(result).toEqual({
        success: true,
        type: 'data_query',
        data: [{ id: 1, name: 'test' }],
        metadata: {
          totalRows: 1,
          executionTime: 100,
          generatedSQL: 'SELECT * FROM test',
          usedModel: 'test-model',
          cacheHit: true,
          cachedAt: mockRecord.createdAt,
          columns: ['id', 'name']
        },
        visualization: { type: 'chart' },
        sessionId: 'session-123',
        queryLogId: 1
      })

      expect(MockedAIQueryHistory.findOne).toHaveBeenCalledWith({
        where: {
          userId,
          queryHash: expect.any(String),
          createdAt: {
            [Op.gte]: expect.any(Date)
          }
        },
        order: [['createdAt', 'DESC']]
      })
    })

    it('应该返回缓存的AI响应结果', async () => {
      const mockRecord = {
        id: 1,
        queryType: 'ai_response',
        responseText: 'This is an AI response',
        sessionId: 'session-123',
        createdAt: new Date()
      }

      MockedAIQueryHistory.findOne.mockResolvedValue(mockRecord)

      const queryText = 'test query'
      const userId = 1

      const result = await aiQueryCacheService.getCachedResult(queryText, userId)

      expect(result).toEqual({
        type: 'ai_response',
        response: 'This is an AI response',
        isDataQuery: false,
        sessionId: 'session-123',
        cacheHit: true,
        cachedAt: mockRecord.createdAt
      })
    })

    it('应该在无缓存时返回null', async () => {
      MockedAIQueryHistory.findOne.mockResolvedValue(null)

      const result = await aiQueryCacheService.getCachedResult('test query', 1)

      expect(result).toBeNull()
    })

    it('应该处理缓存检查失败的情况', async () => {
      MockedAIQueryHistory.findOne.mockRejectedValue(new Error('Database error'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const result = await aiQueryCacheService.getCachedResult('test query', 1)

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith('❌ 缓存检查失败:', expect.any(Error))

      consoleSpy.mockRestore()
    })

    it('应该正确处理缺少响应数据的缓存记录', async () => {
      const mockRecord = {
        id: 1,
        queryType: 'data_query',
        responseData: null,
        generatedSQL: 'SELECT * FROM test',
        executionTime: 100,
        modelUsed: 'test-model',
        sessionId: 'session-123',
        createdAt: new Date()
      }

      MockedAIQueryHistory.findOne.mockResolvedValue(mockRecord)

      const result = await aiQueryCacheService.getCachedResult('test query', 1)

      expect(result).toEqual({
        success: true,
        type: 'data_query',
        data: [],
        metadata: {
          totalRows: 0,
          executionTime: 100,
          generatedSQL: 'SELECT * FROM test',
          usedModel: 'test-model',
          cacheHit: true,
          cachedAt: mockRecord.createdAt,
          columns: []
        },
        visualization: undefined,
        sessionId: 'session-123',
        queryLogId: 1
      })
    })
  })

  describe('saveQueryResult', () => {
    it('应该保存数据查询结果', async () => {
      const mockCreate = jest.fn().mockResolvedValue({ id: 1 })
      MockedAIQueryHistory.create = mockCreate

      const queryText = 'test query'
      const userId = 1
      const result = {
        data: [{ id: 1, name: 'test' }],
        metadata: {
          totalRows: 1,
          generatedSQL: 'SELECT * FROM test',
          columns: ['id', 'name']
        },
        visualization: { type: 'chart' }
      }

      await aiQueryCacheService.saveQueryResult(
        queryText,
        userId,
        'data_query',
        result,
        'session-123',
        'test-model',
        100
      )

      expect(mockCreate).toHaveBeenCalledWith({
        userId,
        queryText,
        queryHash: expect.any(String),
        queryType: 'data_query',
        sessionId: 'session-123',
        modelUsed: 'test-model',
        executionTime: 100,
        cacheHit: false,
        responseData: {
          data: [{ id: 1, name: 'test' }],
          metadata: {
            totalRows: 1,
            generatedSQL: 'SELECT * FROM test',
            columns: ['id', 'name']
          },
          visualization: { type: 'chart' }
        },
        generatedSQL: 'SELECT * FROM test'
      })
    })

    it('应该保存AI响应结果', async () => {
      const mockCreate = jest.fn().mockResolvedValue({ id: 1 })
      MockedAIQueryHistory.create = mockCreate

      const queryText = 'test query'
      const userId = 1
      const result = {
        response: 'This is an AI response'
      }

      await aiQueryCacheService.saveQueryResult(
        queryText,
        userId,
        'ai_response',
        result,
        'session-123',
        'test-model'
      )

      expect(mockCreate).toHaveBeenCalledWith({
        userId,
        queryText,
        queryHash: expect.any(String),
        queryType: 'ai_response',
        sessionId: 'session-123',
        modelUsed: 'test-model',
        cacheHit: false,
        responseText: 'This is an AI response'
      })
    })

    it('应该处理保存失败的情况', async () => {
      MockedAIQueryHistory.create.mockRejectedValue(new Error('Database error'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      await aiQueryCacheService.saveQueryResult(
        'test query',
        1,
        'data_query',
        { data: [] }
      )

      expect(consoleSpy).toHaveBeenCalledWith('❌ 保存查询记录失败:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })

  describe('getUserQueryHistory', () => {
    it('应该返回用户的查询历史记录', async () => {
      const mockRows = [
        {
          id: 1,
          queryText: 'test query 1',
          queryType: 'data_query',
          generatedSQL: 'SELECT * FROM test',
          executionTime: 100,
          modelUsed: 'test-model',
          sessionId: 'session-123',
          cacheHit: false,
          createdAt: new Date()
        },
        {
          id: 2,
          queryText: 'test query 2',
          queryType: 'ai_response',
          generatedSQL: null,
          executionTime: null,
          modelUsed: 'test-model',
          sessionId: 'session-456',
          cacheHit: true,
          createdAt: new Date()
        }
      ]

      MockedAIQueryHistory.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: mockRows
      })

      const result = await aiQueryCacheService.getUserQueryHistory(1, 1, 10)

      expect(result).toEqual({
        data: [
          {
            id: 1,
            naturalQuery: 'test query 1',
            queryType: 'data_query',
            generatedSQL: 'SELECT * FROM test',
            executionTime: 100,
            modelUsed: 'test-model',
            sessionId: 'session-123',
            cacheHit: false,
            createdAt: mockRows[0].createdAt,
            executionStatus: 'success',
            resultCount: 1
          },
          {
            id: 2,
            naturalQuery: 'test query 2',
            queryType: 'ai_response',
            generatedSQL: null,
            executionTime: null,
            modelUsed: 'test-model',
            sessionId: 'session-456',
            cacheHit: true,
            createdAt: mockRows[1].createdAt,
            executionStatus: 'success',
            resultCount: 0
          }
        ],
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1
      })

      expect(MockedAIQueryHistory.findAndCountAll).toHaveBeenCalledWith({
        where: { userId: 1 },
        order: [['createdAt', 'DESC']],
        limit: 10,
        offset: 0,
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
      })
    })

    it('应该根据查询类型过滤历史记录', async () => {
      MockedAIQueryHistory.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [{
          id: 1,
          queryText: 'test query',
          queryType: 'data_query',
          generatedSQL: 'SELECT * FROM test',
          executionTime: 100,
          modelUsed: 'test-model',
          sessionId: 'session-123',
          cacheHit: false,
          createdAt: new Date()
        }]
      })

      const result = await aiQueryCacheService.getUserQueryHistory(1, 1, 10, 'data_query')

      expect(MockedAIQueryHistory.findAndCountAll).toHaveBeenCalledWith({
        where: { userId: 1, queryType: 'data_query' },
        order: [['createdAt', 'DESC']],
        limit: 10,
        offset: 0,
        attributes: expect.any(Array)
      })
    })

    it('应该处理获取历史记录失败的情况', async () => {
      MockedAIQueryHistory.findAndCountAll.mockRejectedValue(new Error('Database error'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const result = await aiQueryCacheService.getUserQueryHistory(1, 1, 10)

      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0
      })

      expect(consoleSpy).toHaveBeenCalledWith('❌ 获取查询历史失败:', expect.any(Error))

      consoleSpy.mockRestore()
    })

    it('应该正确计算总页数', async () => {
      MockedAIQueryHistory.findAndCountAll.mockResolvedValue({
        count: 25,
        rows: []
      })

      const result = await aiQueryCacheService.getUserQueryHistory(1, 1, 10)

      expect(result.totalPages).toBe(3) // 25 / 10 = 2.5 -> 3 pages
    })
  })

  describe('getQueryDetail', () => {
    it('应该返回查询详情', async () => {
      const mockRecord = {
        id: 1,
        queryText: 'test query',
        queryType: 'data_query',
        responseData: { data: [{ id: 1 }] },
        responseText: null,
        generatedSQL: 'SELECT * FROM test',
        executionTime: 100,
        modelUsed: 'test-model',
        sessionId: 'session-123',
        cacheHit: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      MockedAIQueryHistory.findOne.mockResolvedValue(mockRecord)

      const result = await aiQueryCacheService.getQueryDetail(1, 1)

      expect(result).toEqual({
        id: 1,
        naturalQuery: 'test query',
        queryType: 'data_query',
        responseData: { data: [{ id: 1 }] },
        responseText: null,
        generatedSQL: 'SELECT * FROM test',
        executionTime: 100,
        modelUsed: 'test-model',
        sessionId: 'session-123',
        cacheHit: false,
        createdAt: mockRecord.createdAt,
        updatedAt: mockRecord.updatedAt
      })

      expect(MockedAIQueryHistory.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
          userId: 1
        }
      })
    })

    it('应该在查询不存在时返回null', async () => {
      MockedAIQueryHistory.findOne.mockResolvedValue(null)

      const result = await aiQueryCacheService.getQueryDetail(999, 1)

      expect(result).toBeNull()
    })

    it('应该处理获取查询详情失败的情况', async () => {
      MockedAIQueryHistory.findOne.mockRejectedValue(new Error('Database error'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const result = await aiQueryCacheService.getQueryDetail(1, 1)

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith('❌ 获取查询详情失败:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })

  describe('cleanupExpiredCache', () => {
    it('应该清理过期的缓存记录', async () => {
      MockedAIQueryHistory.destroy.mockResolvedValue(5)

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      const result = await aiQueryCacheService.cleanupExpiredCache()

      expect(result).toBe(5)
      expect(MockedAIQueryHistory.destroy).toHaveBeenCalledWith({
        where: {
          createdAt: {
            [Op.lt]: expect.any(Date)
          }
        }
      })
      expect(consoleSpy).toHaveBeenCalledWith('🧹 清理过期缓存记录: 5 条')

      consoleSpy.mockRestore()
    })

    it('应该处理清理失败的情况', async () => {
      MockedAIQueryHistory.destroy.mockRejectedValue(new Error('Database error'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const result = await aiQueryCacheService.cleanupExpiredCache()

      expect(result).toBe(0)
      expect(consoleSpy).toHaveBeenCalledWith('❌ 清理缓存失败:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })

  describe('getCacheStats', () => {
    it('应该返回缓存统计信息', async () => {
      MockedAIQueryHistory.count
        .mockResolvedValueOnce(100)  // totalCount
        .mockResolvedValueOnce(20)   // recentCount
        .mockResolvedValueOnce(30)   // cacheHitCount

      const result = await aiQueryCacheService.getCacheStats()

      expect(result).toEqual({
        totalQueries: 100,
        recentQueries: 20,
        cacheHits: 30,
        cacheHitRate: '30.00%'
      })
    })

    it('应该返回指定用户的缓存统计信息', async () => {
      MockedAIQueryHistory.count
        .mockResolvedValueOnce(50)   // totalCount for user
        .mockResolvedValueOnce(10)   // recentCount for user
        .mockResolvedValueOnce(15)   // cacheHitCount for user

      const result = await aiQueryCacheService.getCacheStats(1)

      expect(result).toEqual({
        totalQueries: 50,
        recentQueries: 10,
        cacheHits: 15,
        cacheHitRate: '30.00%'
      })

      // Verify that userId was passed in where condition
      expect(MockedAIQueryHistory.count).toHaveBeenCalledWith({
        where: { userId: 1 }
      })
    })

    it('应该处理总查询数为0的情况', async () => {
      MockedAIQueryHistory.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)

      const result = await aiQueryCacheService.getCacheStats()

      expect(result.cacheHitRate).toBe('0%')
    })

    it('应该处理获取统计信息失败的情况', async () => {
      MockedAIQueryHistory.count.mockRejectedValue(new Error('Database error'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const result = await aiQueryCacheService.getCacheStats()

      expect(result).toEqual({
        totalQueries: 0,
        recentQueries: 0,
        cacheHits: 0,
        cacheHitRate: '0%'
      })

      expect(consoleSpy).toHaveBeenCalledWith('❌ 获取缓存统计失败:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })
})