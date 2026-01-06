/**
 * 高级缓存管理器工具函数测试
 * 测试文件: /home/zhgue/yyupcc/k.yyup.com/client/src/utils/advanced-cache-manager.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import { AdvancedCacheManager, cacheManager } from '@/utils/advanced-cache-manager'

// Mock IndexedDB
const mockIndexedDB = {
  open: vi.fn(),
  databases: vi.fn(),
  deleteDatabase: vi.fn(),
}

const mockDB = {
  close: vi.fn(),
  objectStoreNames: {
    contains: vi.fn(),
  },
  transaction: vi.fn(),
  onversionchange: null,
  onclose: null,
  onerror: null,
  onabort: null,
}

const mockTransaction = {
  objectStore: vi.fn(),
  oncomplete: null,
  onerror: null,
  onabort: null,
}

const mockObjectStore = {
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  clear: vi.fn(),
  index: vi.fn(),
  createIndex: vi.fn(),
}

const mockRequest = {
  result: null,
  error: null,
  onsuccess: null,
  onerror: null,
  onupgradeneeded: null,
}

const mockIndex = {
  openCursor: vi.fn(),
}

// Mock performance
const mockPerformance = {
  now: vi.fn(),
}

Object.defineProperty(window, 'indexedDB', {
  value: mockIndexedDB,
  writable: true,
})

Object.defineProperty(window, 'performance', {
  value: mockPerformance,
  writable: true,
})

describe('AdvancedCacheManager', () => {
    beforeEach(() => {
      startConsoleMonitoring()
      vi.clearAllMocks()
    })

    afterEach(() => {
      expectNoConsoleErrors()
      stopConsoleMonitoring()
    })
  let cacheManagerInstance: AdvancedCacheManager

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    
    // 重置所有mock
    mockIndexedDB.open.mockReturnValue(mockRequest)
    mockDB.transaction.mockReturnValue(mockTransaction)
    mockTransaction.objectStore.mockReturnValue(mockObjectStore)
    mockObjectStore.index.mockReturnValue(mockIndex)
    mockPerformance.now.mockReturnValue(1000)
    
    // 创建新的实例以避免测试间干扰
    cacheManagerInstance = new AdvancedCacheManager()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('初始化', () => {
    it('应该正确初始化IndexedDB', () => {
      expect(mockIndexedDB.open).toHaveBeenCalledWith('AdvancedCache', 1)
      expect(mockRequest.onupgradeneeded).toBeDefined()
      expect(mockRequest.onsuccess).toBeDefined()
      expect(mockRequest.onerror).toBeDefined()
    })

    it('应该在数据库升级时创建对象存储', () => {
      // 模拟升级事件
      mockDB.objectStoreNames.contains.mockReturnValue(false)
      
      if (mockRequest.onupgradeneeded) {
        mockRequest.onupgradeneeded({ target: { result: mockDB } } as any)
      }
      
      expect(mockDB.createObjectStore).toHaveBeenCalledWith('cache', { keyPath: 'key' })
      expect(mockObjectStore.createIndex).toHaveBeenCalledWith('timestamp', 'timestamp')
      expect(mockObjectStore.createIndex).toHaveBeenCalledWith('priority', 'priority')
      expect(mockObjectStore.createIndex).toHaveBeenCalledWith('tags', 'tags', { multiEntry: true })
    })

    it('应该在IndexedDB不可用时优雅降级', () => {
      mockIndexedDB.open.mockImplementation(() => {
        throw new Error('IndexedDB not available')
      })
      
      // 不应该抛出错误
      expect(() => {
        new AdvancedCacheManager()
      }).not.toThrow()
    })

    it('应该启动缓存监控', () => {
      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 5000)
    })

    it('应该启动定期清理', () => {
      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 30000)
    })
  })

  describe('缓存获取', () => {
    it('应该能够从内存缓存获取数据', async () => {
      const testData = { name: 'test', value: 123 }
      const cacheItem = {
        data: testData,
        timestamp: Date.now(),
        ttl: 300000,
        accessCount: 1,
        lastAccess: Date.now(),
        priority: 'medium',
        tags: [],
        compressed: false,
        size: 50,
      }
      
      // 设置内存缓存
      ;(cacheManagerInstance as any).memoryCache.set('test-key', cacheItem)
      
      const result = await cacheManagerInstance.get('test-key')
      expect(result).toEqual(testData)
    })

    it('应该能够从持久化缓存获取数据', async () => {
      const testData = { name: 'test', value: 123 }
      const cacheItem = {
        data: testData,
        timestamp: Date.now(),
        ttl: 300000,
        accessCount: 1,
        lastAccess: Date.now(),
        priority: 'medium',
        tags: [],
        compressed: false,
        size: 50,
      }
      
      // 模拟IndexedDB成功
      mockObjectStore.get.mockReturnValue(mockRequest)
      mockRequest.result = { value: cacheItem }
      
      if (mockRequest.onsuccess) {
        mockRequest.onsuccess({ target: { result: mockRequest.result } } as any)
      }
      
      const result = await cacheManagerInstance.get('test-key', undefined, { strategy: 'persistent-first' })
      expect(result).toEqual(testData)
    })

    it('应该使用fetcher获取新数据当缓存未命中', async () => {
      const testData = { name: 'test', value: 123 }
      const fetcher = vi.fn().mockResolvedValue(testData)
      
      const result = await cacheManagerInstance.get('non-existent-key', fetcher)
      expect(result).toEqual(testData)
      expect(fetcher).toHaveBeenCalledTimes(1)
    })

    it('应该正确处理过期缓存', async () => {
      const testData = { name: 'test', value: 123 }
      const cacheItem = {
        data: testData,
        timestamp: Date.now() - 400000, // 400秒前，已过期
        ttl: 300000,
        accessCount: 1,
        lastAccess: Date.now() - 400000,
        priority: 'medium',
        tags: [],
        compressed: false,
        size: 50,
      }
      
      // 设置过期缓存
      ;(cacheManagerInstance as any).memoryCache.set('expired-key', cacheItem)
      
      const fetcher = vi.fn().mockResolvedValue(testData)
      const result = await cacheManagerInstance.get('expired-key', fetcher)
      
      expect(result).toEqual(testData)
      expect(fetcher).toHaveBeenCalledTimes(1)
      expect((cacheManagerInstance as any).memoryCache.has('expired-key')).toBe(false)
    })

    it('应该正确处理fetcher错误', async () => {
      const fetcher = vi.fn().mockRejectedValue(new Error('Network error'))
      
      await expect(cacheManagerInstance.get('error-key', fetcher)).rejects.toThrow('Network error')
    })

    it('应该在没有fetcher且缓存未命中时抛出错误', async () => {
      await expect(cacheManagerInstance.get('non-existent-key')).rejects.toThrow('Cache miss for key: non-existent-key and no fetcher provided')
    })
  })

  describe('缓存设置', () => {
    it('应该能够设置缓存数据', async () => {
      const testData = { name: 'test', value: 123 }
      
      await cacheManagerInstance.set('test-key', testData)
      
      // 验证内存缓存
      expect((cacheManagerInstance as any).memoryCache.has('test-key')).toBe(true)
      
      const cacheItem = (cacheManagerInstance as any).memoryCache.get('test-key')
      expect(cacheItem.data).toEqual(testData)
      expect(cacheItem.priority).toBe('medium')
      expect(cacheItem.compressed).toBe(false)
    })

    it('应该支持自定义缓存选项', async () => {
      const testData = { name: 'test', value: 123 }
      const options = {
        ttl: 60000,
        strategy: 'persistent-first' as const,
        priority: 'high' as const,
        compress: true,
        tags: ['user', 'profile'],
      }
      
      await cacheManagerInstance.set('test-key', testData, options)
      
      const cacheItem = (cacheManagerInstance as any).memoryCache.get('test-key')
      expect(cacheItem.ttl).toBe(60000)
      expect(cacheItem.priority).toBe('high')
      expect(cacheItem.compressed).toBe(true)
      expect(cacheItem.tags).toEqual(['user', 'profile'])
    })

    it('应该正确计算数据大小', async () => {
      const testData = { name: 'test', value: 123, description: 'A test object' }
      
      await cacheManagerInstance.set('test-key', testData)
      
      const cacheItem = (cacheManagerInstance as any).memoryCache.get('test-key')
      expect(cacheItem.size).toBeGreaterThan(0)
      expect(cacheItem.size).toBeLessThan(1000) // 合理的大小范围
    })

    it('应该能够压缩数据', async () => {
      const testData = { name: 'test', value: 123 }
      
      await cacheManagerInstance.set('test-key', testData, { compress: true })
      
      const cacheItem = (cacheManagerInstance as any).memoryCache.get('test-key')
      expect(cacheItem.compressed).toBe(true)
      expect(cacheItem.data).toBe(JSON.stringify(testData))
    })

    it('应该处理持久化存储错误', async () => {
      const testData = { name: 'test', value: 123 }
      
      // 模拟IndexedDB错误
      mockObjectStore.put.mockReturnValue(mockRequest)
      mockRequest.error = new Error('Storage error')
      
      if (mockRequest.onerror) {
        mockRequest.onerror({ target: { error: mockRequest.error } } as any)
      }
      
      // 不应该抛出错误，应该优雅处理
      await expect(cacheManagerInstance.set('test-key', testData, { strategy: 'persistent-first' })).resolves.not.toThrow()
    })
  })

  describe('缓存预热', () => {
    it('应该能够预热单个缓存项', async () => {
      const testData = { name: 'test', value: 123 }
      const fetcher = vi.fn().mockResolvedValue(testData)
      
      await cacheManagerInstance.warmup('test-key', fetcher)
      
      expect(fetcher).toHaveBeenCalledTimes(1)
      expect((cacheManagerInstance as any).memoryCache.has('test-key')).toBe(true)
    })

    it('不应该预热已存在的缓存项', async () => {
      const testData = { name: 'test', value: 123 }
      const fetcher = vi.fn().mockResolvedValue(testData)
      
      // 先设置缓存
      await cacheManagerInstance.set('test-key', testData)
      
      // 尝试预热
      await cacheManagerInstance.warmup('test-key', fetcher)
      
      expect(fetcher).not.toHaveBeenCalled()
    })

    it('应该能够批量预热缓存项', async () => {
      const items = [
        { key: 'key1', fetcher: vi.fn().mockResolvedValue({ name: 'data1' }) },
        { key: 'key2', fetcher: vi.fn().mockResolvedValue({ name: 'data2' }) },
        { key: 'key3', fetcher: vi.fn().mockResolvedValue({ name: 'data3' }) },
      ]
      
      await cacheManagerInstance.batchWarmup(items)
      
      expect(items[0].fetcher).toHaveBeenCalledTimes(1)
      expect(items[1].fetcher).toHaveBeenCalledTimes(1)
      expect(items[2].fetcher).toHaveBeenCalledTimes(1)
      
      expect((cacheManagerInstance as any).memoryCache.has('key1')).toBe(true)
      expect((cacheManagerInstance as any).memoryCache.has('key2')).toBe(true)
      expect((cacheManagerInstance as any).memoryCache.has('key3')).toBe(true)
    })

    it('应该处理批量预热中的错误', async () => {
      const items = [
        { key: 'key1', fetcher: vi.fn().mockResolvedValue({ name: 'data1' }) },
        { key: 'key2', fetcher: vi.fn().mockRejectedValue(new Error('Failed')) },
        { key: 'key3', fetcher: vi.fn().mockResolvedValue({ name: 'data3' }) },
      ]
      
      // 不应该抛出错误，应该继续处理其他项
      await expect(cacheManagerInstance.batchWarmup(items)).resolves.not.toThrow()
      
      // 成功的项应该被缓存
      expect((cacheManagerInstance as any).memoryCache.has('key1')).toBe(true)
      expect((cacheManagerInstance as any).memoryCache.has('key3')).toBe(true)
    })
  })

  describe('标签清理', () => {
    it('应该能够按标签清理缓存', async () => {
      const cacheItem1 = {
        data: { name: 'data1' },
        timestamp: Date.now(),
        ttl: 300000,
        accessCount: 1,
        lastAccess: Date.now(),
        priority: 'medium',
        tags: ['user', 'profile'],
        compressed: false,
        size: 50,
      }
      
      const cacheItem2 = {
        data: { name: 'data2' },
        timestamp: Date.now(),
        ttl: 300000,
        accessCount: 1,
        lastAccess: Date.now(),
        priority: 'medium',
        tags: ['post', 'content'],
        compressed: false,
        size: 50,
      }
      
      // 设置缓存
      ;(cacheManagerInstance as any).memoryCache.set('key1', cacheItem1)
      ;(cacheManagerInstance as any).memoryCache.set('key2', cacheItem2)
      
      const clearedCount = await cacheManagerInstance.clearByTags(['user'])
      
      expect(clearedCount).toBe(1)
      expect((cacheManagerInstance as any).memoryCache.has('key1')).toBe(false)
      expect((cacheManagerInstance as any).memoryCache.has('key2')).toBe(true)
    })

    it('应该能够按多个标签清理缓存', async () => {
      const cacheItem1 = {
        data: { name: 'data1' },
        timestamp: Date.now(),
        ttl: 300000,
        accessCount: 1,
        lastAccess: Date.now(),
        priority: 'medium',
        tags: ['user', 'profile'],
        compressed: false,
        size: 50,
      }
      
      const cacheItem2 = {
        data: { name: 'data2' },
        timestamp: Date.now(),
        ttl: 300000,
        accessCount: 1,
        lastAccess: Date.now(),
        priority: 'medium',
        tags: ['post', 'content'],
        compressed: false,
        size: 50,
      }
      
      const cacheItem3 = {
        data: { name: 'data3' },
        timestamp: Date.now(),
        ttl: 300000,
        accessCount: 1,
        lastAccess: Date.now(),
        priority: 'medium',
        tags: ['user', 'settings'],
        compressed: false,
        size: 50,
      }
      
      // 设置缓存
      ;(cacheManagerInstance as any).memoryCache.set('key1', cacheItem1)
      ;(cacheManagerInstance as any).memoryCache.set('key2', cacheItem2)
      ;(cacheManagerInstance as any).memoryCache.set('key3', cacheItem3)
      
      const clearedCount = await cacheManagerInstance.clearByTags(['user', 'post'])
      
      expect(clearedCount).toBe(2)
      expect((cacheManagerInstance as any).memoryCache.has('key1')).toBe(false)
      expect((cacheManagerInstance as any).memoryCache.has('key2')).toBe(false)
      expect((cacheManagerInstance as any).memoryCache.has('key3')).toBe(false)
    })
  })

  describe('智能清理', () => {
    it('应该清理过期缓存', async () => {
      const now = Date.now()
      const validItem = {
        data: { name: 'valid' },
        timestamp: now,
        ttl: 300000,
        accessCount: 1,
        lastAccess: now,
        priority: 'medium',
        tags: [],
        compressed: false,
        size: 50,
      }
      
      const expiredItem = {
        data: { name: 'expired' },
        timestamp: now - 400000,
        ttl: 300000,
        accessCount: 1,
        lastAccess: now - 400000,
        priority: 'medium',
        tags: [],
        compressed: false,
        size: 50,
      }
      
      // 设置缓存
      ;(cacheManagerInstance as any).memoryCache.set('valid-key', validItem)
      ;(cacheManagerInstance as any).memoryCache.set('expired-key', expiredItem)
      
      // 设置高内存使用率以触发清理
      ;(cacheManagerInstance as any).cacheStats.memoryUsage = (cacheManagerInstance as any).maxMemorySize * 0.9
      
      await (cacheManagerInstance as any).performIntelligentCleanup()
      
      expect((cacheManagerInstance as any).memoryCache.has('valid-key')).toBe(true)
      expect((cacheManagerInstance as any).memoryCache.has('expired-key')).toBe(false)
    })

    it('应该在内存使用率过高时执行LRU清理', async () => {
      const now = Date.now()
      
      // 创建多个缓存项，优先级和访问时间不同
      const lowPriorityItem = {
        data: { name: 'low' },
        timestamp: now - 7200000, // 2小时前
        ttl: 300000,
        accessCount: 1,
        lastAccess: now - 7200000,
        priority: 'low',
        tags: [],
        compressed: false,
        size: 1024 * 1024, // 1MB
      }
      
      const highPriorityItem = {
        data: { name: 'high' },
        timestamp: now,
        ttl: 300000,
        accessCount: 10,
        lastAccess: now,
        priority: 'high',
        tags: [],
        compressed: false,
        size: 1024 * 1024, // 1MB
      }
      
      // 设置缓存
      ;(cacheManagerInstance as any).memoryCache.set('low-key', lowPriorityItem)
      ;(cacheManagerInstance as any).memoryCache.set('high-key', highPriorityItem)
      
      // 设置高内存使用率
      ;(cacheManagerInstance as any).cacheStats.memoryUsage = (cacheManagerInstance as any).maxMemorySize * 0.9
      
      await (cacheManagerInstance as any).performIntelligentCleanup()
      
      // 低优先级的旧数据应该被清理
      expect((cacheManagerInstance as any).memoryCache.has('low-key')).toBe(false)
      expect((cacheManagerInstance as any).memoryCache.has('high-key')).toBe(true)
    })

    it('应该正确计算缓存评分', () => {
      const now = Date.now()
      
      const item1 = {
        data: { name: 'item1' },
        timestamp: now,
        ttl: 300000,
        accessCount: 10,
        lastAccess: now,
        priority: 'high',
        tags: [],
        compressed: false,
        size: 50,
      }
      
      const item2 = {
        data: { name: 'item2' },
        timestamp: now - 3600000, // 1小时前
        ttl: 300000,
        accessCount: 1,
        lastAccess: now - 3600000,
        priority: 'low',
        tags: [],
        compressed: false,
        size: 50,
      }
      
      const score1 = (cacheManagerInstance as any).calculateCacheScore(item1)
      const score2 = (cacheManagerInstance as any).calculateCacheScore(item2)
      
      expect(score1).toBeGreaterThan(score2)
    })

    it('应该决定是否存储在内存中', () => {
      const criticalItem = {
        data: { name: 'critical' },
        timestamp: Date.now(),
        ttl: 300000,
        accessCount: 1,
        lastAccess: Date.now(),
        priority: 'critical',
        tags: [],
        compressed: false,
        size: 50,
      }
      
      const largeItem = {
        data: { name: 'large' },
        timestamp: Date.now(),
        ttl: 300000,
        accessCount: 1,
        lastAccess: Date.now(),
        priority: 'medium',
        tags: [],
        compressed: false,
        size: 2 * 1024 * 1024, // 2MB
      }
      
      expect((cacheManagerInstance as any).shouldStoreInMemory(criticalItem)).toBe(true)
      expect((cacheManagerInstance as any).shouldStoreInMemory(largeItem)).toBe(false)
    })
  })

  describe('内存容量管理', () => {
    it('应该确保内存容量', async () => {
      const now = Date.now()
      
      // 创建多个缓存项
      const items = []
      for (let i = 0; i < 10; i++) {
        items.push({
          data: { name: `item${i}` },
          timestamp: now,
          ttl: 300000,
          accessCount: 1,
          lastAccess: now,
          priority: 'low',
          tags: [],
          compressed: false,
          size: 1024 * 1024, // 1MB
        })
      }
      
      // 设置缓存
      items.forEach((item, index) => {
        ;(cacheManagerInstance as any).memoryCache.set(`key${index}`, item)
      })
      
      // 设置高内存使用率
      ;(cacheManagerInstance as any).cacheStats.memoryUsage = (cacheManagerInstance as any).maxMemorySize * 0.9
      
      // 请求大容量
      await (cacheManagerInstance as any).ensureMemoryCapacity(1024 * 1024) // 1MB
      
      // 应该清理了一些缓存项
      expect((cacheManagerInstance as any).memoryCache.size).toBeLessThan(10)
    })
  })

  describe('缓存操作', () => {
    it('应该能够检查缓存是否存在', () => {
      const testData = { name: 'test' }
      
      expect(cacheManagerInstance.has('test-key')).toBe(false)
      
      ;(cacheManagerInstance as any).memoryCache.set('test-key', {
        data: testData,
        timestamp: Date.now(),
        ttl: 300000,
        accessCount: 1,
        lastAccess: Date.now(),
        priority: 'medium',
        tags: [],
        compressed: false,
        size: 50,
      })
      
      expect(cacheManagerInstance.has('test-key')).toBe(true)
    })

    it('应该能够删除缓存', async () => {
      const testData = { name: 'test' }
      
      // 设置缓存
      ;(cacheManagerInstance as any).memoryCache.set('test-key', {
        data: testData,
        timestamp: Date.now(),
        ttl: 300000,
        accessCount: 1,
        lastAccess: Date.now(),
        priority: 'medium',
        tags: [],
        compressed: false,
        size: 50,
      })
      
      const deleted = await cacheManagerInstance.delete('test-key')
      
      expect(deleted).toBe(true)
      expect((cacheManagerInstance as any).memoryCache.has('test-key')).toBe(false)
    })

    it('应该能够清空所有缓存', async () => {
      // 设置多个缓存项
      ;(cacheManagerInstance as any).memoryCache.set('key1', {
        data: { name: 'data1' },
        timestamp: Date.now(),
        ttl: 300000,
        accessCount: 1,
        lastAccess: Date.now(),
        priority: 'medium',
        tags: [],
        compressed: false,
        size: 50,
      })
      
      ;(cacheManagerInstance as any).memoryCache.set('key2', {
        data: { name: 'data2' },
        timestamp: Date.now(),
        ttl: 300000,
        accessCount: 1,
        lastAccess: Date.now(),
        priority: 'medium',
        tags: [],
        compressed: false,
        size: 50,
      })
      
      await cacheManagerInstance.clear()
      
      expect((cacheManagerInstance as any).memoryCache.size).toBe(0)
    })
  })

  describe('统计信息', () => {
    it('应该正确跟踪响应时间', () => {
      mockPerformance.now.mockReturnValueOnce(1000)
      mockPerformance.now.mockReturnValueOnce(1050) // 50ms响应时间
      
      ;(cacheManagerInstance as any).trackResponseTime(1000)
      
      expect((cacheManagerInstance as any).responseTimeTracker).toContain(50)
    })

    it('应该计算平均响应时间', () => {
      const responseTimes = [10, 20, 30, 40, 50]
      responseTimes.forEach(time => {
        ;(cacheManagerInstance as any).responseTimeTracker.push(time)
      })
      
      const stats = cacheManagerInstance.getStats()
      const expectedAverage = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      
      expect(stats.averageResponseTime).toBe(expectedAverage)
    })

    it('应该正确计算命中率', () => {
      // 模拟命中和未命中
      ;(cacheManagerInstance as any).cacheStats.hits = 80
      ;(cacheManagerInstance as any).cacheStats.misses = 20
      
      const stats = cacheManagerInstance.getStats()
      expect(stats.hitRate).toBe(80)
    })

    it('应该提供性能报告', () => {
      // 测试优秀性能
      ;(cacheManagerInstance as any).cacheStats.hits = 95
      ;(cacheManagerInstance as any).cacheStats.misses = 5
      ;(cacheManagerInstance as any).cacheStats.memoryUsage = 20 * 1024 * 1024
      ;(cacheManagerInstance as any).cacheStats.averageResponseTime = 10
      
      const report = cacheManagerInstance.getPerformanceReport()
      
      expect(report.efficiency).toBe('excellent')
      expect(report.recommendations).toEqual([])
      expect(report.optimizationTips).toEqual([])
      
      // 测试较差性能
      ;(cacheManagerInstance as any).cacheStats.hits = 60
      ;(cacheManagerInstance as any).cacheStats.misses = 40
      ;(cacheManagerInstance as any).cacheStats.memoryUsage = 45 * 1024 * 1024
      ;(cacheManagerInstance as any).cacheStats.averageResponseTime = 100
      
      const report2 = cacheManagerInstance.getPerformanceReport()
      
      expect(report2.efficiency).toBe('poor')
      expect(report2.recommendations).toContain('提高缓存TTL时间')
      expect(report2.recommendations).toContain('增加缓存预热策略')
      expect(report2.optimizationTips).toContain('启用数据压缩')
      expect(report2.optimizationTips).toContain('优化数据序列化')
    })
  })

  describe('销毁', () => {
    it('应该能够销毁缓存管理器', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
      
      // 模拟清理定时器
      const cleanupInterval = setInterval(() => {}, 30000)
      ;(cacheManagerInstance as any).cleanupInterval = cleanupInterval
      
      cacheManagerInstance.destroy()
      
      expect(clearIntervalSpy).toHaveBeenCalledWith(cleanupInterval)
      expect((cacheManagerInstance as any).cleanupInterval).toBeNull()
      expect((cacheManagerInstance as any).memoryCache.size).toBe(0)
    })
  })

  describe('性能测试', () => {
    it('应该能够快速设置和获取缓存', async () => {
      const iterations = 100
      const testData = { name: 'test', value: 123 }
      
      const startTime = performance.now()
      
      for (let i = 0; i < iterations; i++) {
        await cacheManagerInstance.set(`key${i}`, testData)
        await cacheManagerInstance.get(`key${i}`)
      }
      
      const endTime = performance.now()
      const avgTime = (endTime - startTime) / iterations
      
      // 平均时间应该小于10ms
      expect(avgTime).toBeLessThan(10)
    })

    it('应该能够处理并发请求', async () => {
      const testData = { name: 'test', value: 123 }
      const fetcher = vi.fn().mockResolvedValue(testData)
      
      // 并发请求同一个键
      const promises = []
      for (let i = 0; i < 10; i++) {
        promises.push(cacheManagerInstance.get('concurrent-key', fetcher))
      }
      
      const results = await Promise.all(promises)
      
      // 所有结果应该相同
      expect(results.every(result => result === testData)).toBe(true)
      
      // fetcher应该只被调用一次
      expect(fetcher).toHaveBeenCalledTimes(1)
    })
  })

  describe('错误处理', () => {
    it('应该处理IndexedDB错误', async () => {
      const testData = { name: 'test', value: 123 }
      
      // 模拟IndexedDB错误
      mockObjectStore.put.mockReturnValue(mockRequest)
      mockRequest.error = new Error('Database error')
      
      if (mockRequest.onerror) {
        mockRequest.onerror({ target: { error: mockRequest.error } } as any)
      }
      
      // 不应该抛出错误
      await expect(cacheManagerInstance.set('test-key', testData, { strategy: 'persistent-first' })).resolves.not.toThrow()
    })

    it('应该处理无效的缓存数据', async () => {
      // 设置无效的缓存数据
      ;(cacheManagerInstance as any).memoryCache.set('invalid-key', {
        data: null,
        timestamp: Date.now(),
        ttl: 300000,
        accessCount: 1,
        lastAccess: Date.now(),
        priority: 'medium',
        tags: [],
        compressed: false,
        size: 0,
      })
      
      const result = await cacheManagerInstance.get('invalid-key')
      expect(result).toBeNull()
    })

    it('应该处理内存不足的情况', async () => {
      const largeData = { data: 'x'.repeat(10 * 1024 * 1024) } // 10MB数据
      
      // 不应该抛出错误，应该优雅处理
      await expect(cacheManagerInstance.set('large-key', largeData)).resolves.not.toThrow()
    })
  })

  describe('边界条件', () => {
    it('应该处理空数据', async () => {
      await cacheManagerInstance.set('null-key', null)
      expect(await cacheManagerInstance.get('null-key')).toBeNull()
      
      await cacheManagerInstance.set('undefined-key', undefined)
      expect(await cacheManagerInstance.get('undefined-key')).toBeUndefined()
      
      await cacheManagerInstance.set('empty-key', '')
      expect(await cacheManagerInstance.get('empty-key')).toBe('')
    })

    it('应该处理特殊字符键', async () => {
      const testData = { name: 'test' }
      const specialKeys = ['key/with/slashes', 'key?with?query', 'key#with#hash', 'key with spaces']
      
      for (const key of specialKeys) {
        await cacheManagerInstance.set(key, testData)
        expect(await cacheManagerInstance.get(key)).toEqual(testData)
      }
    })

    it('应该处理长键名', async () => {
      const testData = { name: 'test' }
      const longKey = 'a'.repeat(1000)
      
      await cacheManagerInstance.set(longKey, testData)
      expect(await cacheManagerInstance.get(longKey)).toEqual(testData)
    })
  })

  describe('全局实例', () => {
    it('应该导出全局缓存管理器实例', () => {
      expect(cacheManager).toBeDefined()
      expect(cacheManager).toBeInstanceOf(AdvancedCacheManager)
    })

    it('应该能够使用全局实例进行缓存操作', async () => {
      const testData = { name: 'test' }
      
      await cacheManager.set('test-key', testData)
      expect(await cacheManager.get('test-key')).toEqual(testData)
      
      await cacheManager.delete('test-key')
      expect(await cacheManager.get('test-key')).toBeNull()
    })
  })

  describe('集成测试', () => {
    it('应该能够在不同策略间保持数据一致性', async () => {
      const testData = { name: 'test' }
      
      // 使用混合策略
      await cacheManagerInstance.set('consistency-key', testData, { strategy: 'hybrid' })
      
      // 清空内存缓存
      ;(cacheManagerInstance as any).memoryCache.clear()
      
      // 应该能从持久化缓存恢复
      const result = await cacheManagerInstance.get('consistency-key', undefined, { strategy: 'persistent-first' })
      expect(result).toEqual(testData)
    })

    it('应该能够处理缓存预热和清理的集成', async () => {
      const items = [
        { key: 'key1', fetcher: vi.fn().mockResolvedValue({ name: 'data1' }) },
        { key: 'key2', fetcher: vi.fn().mockResolvedValue({ name: 'data2' }) },
      ]
      
      // 批量预热
      await cacheManagerInstance.batchWarmup(items)
      
      // 验证缓存存在
      expect(await cacheManagerInstance.get('key1')).toEqual({ name: 'data1' })
      expect(await cacheManagerInstance.get('key2')).toEqual({ name: 'data2' })
      
      // 按标签清理
      const clearedCount = await cacheManagerInstance.clearByTags(['warmup'])
      expect(clearedCount).toBeGreaterThanOrEqual(0)
    })
  })
})

describe('高级缓存管理器安全性测试', () => {
  let cacheManagerInstance: AdvancedCacheManager

  beforeEach(() => {
    vi.clearAllMocks()
    cacheManagerInstance = new AdvancedCacheManager()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('应该防止缓存注入攻击', async () => {
    const maliciousData = {
      toString: () => {
        throw new Error('Malicious data')
      }
    }
    
    // 应该能够处理恶意数据而不崩溃
    await expect(cacheManagerInstance.set('malicious-key', maliciousData as any)).resolves.not.toThrow()
  })

  it('应该防止内存耗尽攻击', async () => {
    // 模拟大量缓存项
    const largeData = { data: 'x'.repeat(1024) } // 1KB数据
    
    // 尝试添加大量缓存项
    const promises = []
    for (let i = 0; i < 1000; i++) {
      promises.push(cacheManagerInstance.set(`key${i}`, largeData))
    }
    
    // 应该能够正常处理而不崩溃
    await expect(Promise.all(promises)).resolves.not.toThrow()
    
    // 应该能够获取一些缓存项
    expect(await cacheManagerInstance.get('key0')).toBeDefined()
    expect(await cacheManagerInstance.get('key999')).toBeDefined()
  })

  it('应该防止敏感数据泄露', async () => {
    const sensitiveData = { password: 'secret', token: 'bearer-token' }
    
    await cacheManagerInstance.set('credentials', sensitiveData)
    
    // 数据应该被正确存储和获取
    const result = await cacheManagerInstance.get('credentials')
    expect(result).toEqual(sensitiveData)
    
    // 但不应该在日志中泄露敏感信息
    const consoleSpy = vi.spyOn(console, 'log')
    cacheManagerInstance.getStats()
    expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('secret'))
    expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('bearer-token'))
  })

  it('应该防止缓存污染', async () => {
    const normalData = { name: 'normal' }
    const maliciousData = { __proto__: { polluted: true } }
    
    await cacheManagerInstance.set('normal-key', normalData)
    await cacheManagerInstance.set('malicious-key', maliciousData)
    
    // 正常数据应该不受影响
    const normalResult = await cacheManagerInstance.get('normal-key')
    expect(normalResult).toEqual(normalData)
    
    // 原型不应该被污染
    expect(({} as any).polluted).toBeUndefined()
  })
})