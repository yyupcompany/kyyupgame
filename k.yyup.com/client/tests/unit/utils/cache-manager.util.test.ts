/**
 * 缓存管理器工具函数测试
 * 测试文件: /home/zhgue/yyupcc/k.yyup.com/client/src/utils/cacheManager.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import { CacheManager, cacheManager, cached, useCache, CACHE_CONFIGS } from '@/utils/cacheManager'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock window.event
Object.defineProperty(window, 'addEventListener', {
  value: vi.fn(),
})

describe('CacheManager', () => {
    beforeEach(() => {
      startConsoleMonitoring()
      vi.clearAllMocks()
    })

    afterEach(() => {
      expectNoConsoleErrors()
      stopConsoleMonitoring()
    })
  let cacheManagerInstance: CacheManager

  beforeEach(() => {
    // 重置所有mock
    vi.clearAllMocks()
    
    // 创建新的实例以避免测试间干扰
    cacheManagerInstance = new (CacheManager as any)()
    
    // 重置localStorage mock
    localStorageMock.getItem.mockReturnValue(null)
    localStorageMock.setItem.mockImplementation(() => {})
    localStorageMock.removeItem.mockImplementation(() => {})
    localStorageMock.clear.mockImplementation(() => {})
    localStorageMock.length = 0
    localStorageMock.key.mockReturnValue(null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('单例模式', () => {
    it('应该返回同一个实例', () => {
      const instance1 = CacheManager.getInstance()
      const instance2 = CacheManager.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('缓存键生成', () => {
    it('应该正确生成带命名空间的缓存键', () => {
      const key = (cacheManagerInstance as any).generateKey('user', 'profile', { id: 123 })
      expect(key).toMatch(/^user:profile:[a-f0-9]+$/)
    })

    it('应该为相同参数生成相同的键', () => {
      const params = { id: 123, name: 'test' }
      const key1 = (cacheManagerInstance as any).generateKey('user', 'profile', params)
      const key2 = (cacheManagerInstance as any).generateKey('user', 'profile', params)
      expect(key1).toBe(key2)
    })

    it('应该为不同参数生成不同的键', () => {
      const key1 = (cacheManagerInstance as any).generateKey('user', 'profile', { id: 123 })
      const key2 = (cacheManagerInstance as any).generateKey('user', 'profile', { id: 456 })
      expect(key1).not.toBe(key2)
    })

    it('应该正确处理空参数', () => {
      const key1 = (cacheManagerInstance as any).generateKey('user', 'profile')
      const key2 = (cacheManagerInstance as any).generateKey('user', 'profile', null)
      const key3 = (cacheManagerInstance as any).generateKey('user', 'profile', undefined)
      expect(key1).toBe(key2)
      expect(key1).toBe(key3)
    })
  })

  describe('哈希函数', () => {
    it('应该为相同字符串生成相同的哈希值', () => {
      const str = 'test-string'
      const hash1 = (cacheManagerInstance as any).hashCode(str)
      const hash2 = (cacheManagerInstance as any).hashCode(str)
      expect(hash1).toBe(hash2)
    })

    it('应该为不同字符串生成不同的哈希值', () => {
      const hash1 = (cacheManagerInstance as any).hashCode('string1')
      const hash2 = (cacheManagerInstance as any).hashCode('string2')
      expect(hash1).not.toBe(hash2)
    })

    it('应该正确处理空字符串', () => {
      const hash = (cacheManagerInstance as any).hashCode('')
      expect(hash).toBe('0')
    })
  })

  describe('过期检查', () => {
    it('应该正确识别未过期的缓存项', () => {
      const now = Date.now()
      const item = {
        data: 'test',
        timestamp: now,
        expiry: now + 60000, // 1分钟后过期
        key: 'test'
      }
      expect((cacheManagerInstance as any).isExpired(item)).toBe(false)
    })

    it('应该正确识别已过期的缓存项', () => {
      const now = Date.now()
      const item = {
        data: 'test',
        timestamp: now - 120000, // 2分钟前创建
        expiry: now - 60000, // 1分钟前过期
        key: 'test'
      }
      expect((cacheManagerInstance as any).isExpired(item)).toBe(true)
    })

    it('应该正确处理即将过期的缓存项', () => {
      const now = Date.now()
      const item = {
        data: 'test',
        timestamp: now - 59999, // 差1分钟到过期时间
        expiry: now + 1, // 即将过期
        key: 'test'
      }
      expect((cacheManagerInstance as any).isExpired(item)).toBe(false)
    })
  })

  describe('localStorage操作', () => {
    it('应该能够从localStorage获取缓存', () => {
      const mockItem = {
        data: 'test-data',
        timestamp: Date.now(),
        expiry: Date.now() + 60000,
        key: 'test-key'
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockItem))
      
      const result = (cacheManagerInstance as any).getFromStorage('test-key')
      expect(result).toEqual(mockItem)
      expect(localStorageMock.getItem).toHaveBeenCalledWith('cache:test-key')
    })

    it('应该处理localStorage中不存在的缓存', () => {
      localStorageMock.getItem.mockReturnValue(null)
      
      const result = (cacheManagerInstance as any).getFromStorage('non-existent')
      expect(result).toBeNull()
    })

    it('应该处理localStorage中的过期缓存', () => {
      const expiredItem = {
        data: 'expired-data',
        timestamp: Date.now() - 120000,
        expiry: Date.now() - 60000,
        key: 'expired-key'
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredItem))
      
      const result = (cacheManagerInstance as any).getFromStorage('expired-key')
      expect(result).toBeNull()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cache:expired-key')
    })

    it('应该能够保存到localStorage', () => {
      const item = {
        data: 'test-data',
        timestamp: Date.now(),
        expiry: Date.now() + 60000,
        key: 'test-key'
      };

      (cacheManagerInstance as any).saveToStorage('test-key', item)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cache:test-key',
        JSON.stringify(item)
      )
    })

    it('应该处理localStorage保存失败的情况', () => {
      const item = {
        data: 'test-data',
        timestamp: Date.now(),
        expiry: Date.now() + 60000,
        key: 'test-key'
      }
      
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage full')
      })
      
      // 不应该抛出错误，应该优雅处理
      expect(() => {
        (cacheManagerInstance as any).saveToStorage('test-key', item)
      }).not.toThrow()
    })

    it('应该能够从localStorage删除缓存', () => {
      (cacheManagerInstance as any).removeFromStorage('test-key')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cache:test-key')
    })

    it('应该处理localStorage删除失败的情况', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Delete failed')
      })
      
      // 不应该抛出错误，应该优雅处理
      expect(() => {
        (cacheManagerInstance as any).removeFromStorage('test-key')
      }).not.toThrow()
    })
  })

  describe('缓存清理', () => {
    it('应该清理内存中的过期缓存', () => {
      const now = Date.now()
      const validItem = {
        data: 'valid',
        timestamp: now,
        expiry: now + 60000,
        key: 'valid-key'
      }
      const expiredItem = {
        data: 'expired',
        timestamp: now - 120000,
        expiry: now - 60000,
        key: 'expired-key'
      }
      
      // 设置测试数据
      ;(cacheManagerInstance as any).memoryCache.set('valid-key', validItem)
      ;(cacheManagerInstance as any).memoryCache.set('expired-key', expiredItem)
      
      (cacheManagerInstance as any).cleanupMemory()
      
      expect((cacheManagerInstance as any).memoryCache.has('valid-key')).toBe(true)
      expect((cacheManagerInstance as any).memoryCache.has('expired-key')).toBe(false)
    })

    it('应该在缓存过多时删除最旧的项', () => {
      const maxSize = 2
      ;(cacheManagerInstance as any).defaultConfig.maxSize = maxSize
      
      const now = Date.now()
      const oldItem = {
        data: 'old',
        timestamp: now - 10000,
        expiry: now + 60000,
        key: 'old-key'
      }
      const newItem = {
        data: 'new',
        timestamp: now,
        expiry: now + 60000,
        key: 'new-key'
      }
      const newestItem = {
        data: 'newest',
        timestamp: now + 1000,
        expiry: now + 60000,
        key: 'newest-key'
      }
      
      ;(cacheManagerInstance as any).memoryCache.set('old-key', oldItem)
      ;(cacheManagerInstance as any).memoryCache.set('new-key', newItem)
      ;(cacheManagerInstance as any).memoryCache.set('newest-key', newestItem)
      
      (cacheManagerInstance as any).cleanupMemory()
      
      // 应该保留最新的两个项
      expect((cacheManagerInstance as any).memoryCache.has('old-key')).toBe(false)
      expect((cacheManagerInstance as any).memoryCache.has('new-key')).toBe(true)
      expect((cacheManagerInstance as any).memoryCache.has('newest-key')).toBe(true)
    })

    it('应该清理localStorage中的过期缓存', () => {
      const now = Date.now()
      const validItem = {
        data: 'valid',
        timestamp: now,
        expiry: now + 60000,
        key: 'valid-key'
      }
      const expiredItem = {
        data: 'expired',
        timestamp: now - 120000,
        expiry: now - 60000,
        key: 'expired-key'
      }
      
      localStorageMock.length = 2
      localStorageMock.key.mockImplementation((index) => {
        return index === 0 ? 'cache:valid-key' : 'cache:expired-key'
      })
      
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'cache:valid-key') return JSON.stringify(validItem)
        if (key === 'cache:expired-key') return JSON.stringify(expiredItem)
        return null
      })
      
      (cacheManagerInstance as any).cleanupStorage()
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cache:expired-key')
      expect(localStorageMock.removeItem).not.toHaveBeenCalledWith('cache:valid-key')
    })

    it('应该处理localStorage清理失败的情况', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Access denied')
      })
      
      // 不应该抛出错误，应该优雅处理
      expect(() => {
        (cacheManagerInstance as any).cleanupStorage()
      }).not.toThrow()
    })
  })

  describe('基本缓存操作', () => {
    it('应该能够设置和获取缓存数据', () => {
      const data = { name: 'test', value: 123 }
      cacheManagerInstance.set('test', 'key1', data)
      
      const result = cacheManagerInstance.get('test', 'key1')
      expect(result).toEqual(data)
    })

    it('应该能够处理带参数的缓存键', () => {
      const data = { name: 'test', value: 123 }
      const params = { id: 456, type: 'user' }
      
      cacheManagerInstance.set('test', 'key1', data, {}, params)
      const result = cacheManagerInstance.get('test', 'key1', params)
      
      expect(result).toEqual(data)
    })

    it('应该返回null对于不存在的缓存', () => {
      const result = cacheManagerInstance.get('test', 'non-existent')
      expect(result).toBeNull()
    })

    it('应该能够删除指定缓存', () => {
      const data = { name: 'test' }
      cacheManagerInstance.set('test', 'key1', data)
      
      expect(cacheManagerInstance.get('test', 'key1')).toEqual(data)
      
      cacheManagerInstance.delete('test', 'key1')
      expect(cacheManagerInstance.get('test', 'key1')).toBeNull()
    })

    it('应该能够清空指定命名空间的缓存', () => {
      cacheManagerInstance.set('user', 'profile1', { name: 'user1' })
      cacheManagerInstance.set('user', 'profile2', { name: 'user2' })
      cacheManagerInstance.set('post', 'post1', { title: 'post1' })
      
      cacheManagerInstance.clearNamespace('user')
      
      expect(cacheManagerInstance.get('user', 'profile1')).toBeNull()
      expect(cacheManagerInstance.get('user', 'profile2')).toBeNull()
      expect(cacheManagerInstance.get('post', 'post1')).toEqual({ title: 'post1' })
    })

    it('应该能够清空所有缓存', () => {
      cacheManagerInstance.set('user', 'profile1', { name: 'user1' })
      cacheManagerInstance.set('post', 'post1', { title: 'post1' })
      
      cacheManagerInstance.clearAll()
      
      expect(cacheManagerInstance.get('user', 'profile1')).toBeNull()
      expect(cacheManagerInstance.get('post', 'post1')).toBeNull()
    })

    it('应该能够检查缓存是否存在', () => {
      const data = { name: 'test' }
      
      expect(cacheManagerInstance.has('test', 'key1')).toBe(false)
      
      cacheManagerInstance.set('test', 'key1', data)
      expect(cacheManagerInstance.has('test', 'key1')).toBe(true)
      
      cacheManagerInstance.delete('test', 'key1')
      expect(cacheManagerInstance.has('test', 'key1')).toBe(false)
    })
  })

  describe('缓存配置', () => {
    it('应该使用默认配置', () => {
      const data = { name: 'test' }
      cacheManagerInstance.set('test', 'key1', data)
      
      const result = cacheManagerInstance.get('test', 'key1')
      expect(result).toEqual(data)
    })

    it('应该能够自定义TTL', () => {
      vi.useFakeTimers()

      const data = { name: 'test' }
      const config = { ttl: 1000 } // 1秒

      cacheManagerInstance.set('test', 'key1', data, config)

      // 立即获取应该成功
      expect(cacheManagerInstance.get('test', 'key1')).toEqual(data)

      // 等待过期
      vi.advanceTimersByTime(1100)

      // 过期后应该返回null
      expect(cacheManagerInstance.get('test', 'key1')).toBeNull()

      vi.useRealTimers()
    })

    it('应该支持不同的存储策略', () => {
      const data = { name: 'test' }
      
      // 测试仅内存存储
      cacheManagerInstance.set('test', 'memory-key', data, { storage: 'memory' })
      expect(cacheManagerInstance.get('test', 'memory-key')).toEqual(data)
      
      // 测试仅localStorage存储
      cacheManagerInstance.set('test', 'storage-key', data, { storage: 'localStorage' })
      expect(cacheManagerInstance.get('test', 'storage-key')).toEqual(data)
      
      // 测试双重存储
      cacheManagerInstance.set('test', 'both-key', data, { storage: 'both' })
      expect(cacheManagerInstance.get('test', 'both-key')).toEqual(data)
    })

    it('应该支持版本控制', () => {
      const data1 = { name: 'test-v1' }
      const data2 = { name: 'test-v2' }
      
      cacheManagerInstance.set('test', 'key1', data1, { version: 'v1' })
      cacheManagerInstance.set('test', 'key1', data2, { version: 'v2' })
      
      // 应该获取到最新版本
      expect(cacheManagerInstance.get('test', 'key1')).toEqual(data2)
    })
  })

  describe('缓存统计', () => {
    it('应该正确统计缓存命中率', () => {
      const data = { name: 'test' }
      
      // 初始状态
      let stats = cacheManagerInstance.getStats()
      expect(stats.hitRate).toBe(0)
      expect(stats.totalHits).toBe(0)
      expect(stats.totalMisses).toBe(0)
      
      // 添加缓存
      cacheManagerInstance.set('test', 'key1', data)
      
      // 缓存命中
      cacheManagerInstance.get('test', 'key1')
      stats = cacheManagerInstance.getStats()
      expect(stats.totalHits).toBe(1)
      expect(stats.totalMisses).toBe(0)
      expect(stats.hitRate).toBe(100)
      
      // 缓存未命中
      cacheManagerInstance.get('test', 'non-existent')
      stats = cacheManagerInstance.getStats()
      expect(stats.totalHits).toBe(1)
      expect(stats.totalMisses).toBe(1)
      expect(stats.hitRate).toBe(50)
    })

    it('应该正确统计内存和存储大小', () => {
      cacheManagerInstance.set('test', 'key1', { name: 'test1' })
      cacheManagerInstance.set('test', 'key2', { name: 'test2' })
      
      const stats = cacheManagerInstance.getStats()
      expect(stats.memorySize).toBe(2)
      expect(stats.storageSize).toBeGreaterThanOrEqual(0)
    })

    it('应该能够获取缓存键列表', () => {
      cacheManagerInstance.set('user', 'profile1', { name: 'user1' })
      cacheManagerInstance.set('user', 'profile2', { name: 'user2' })
      cacheManagerInstance.set('post', 'post1', { title: 'post1' })
      
      const allKeys = cacheManagerInstance.getKeys()
      expect(allKeys.length).toBe(3)
      
      const userKeys = cacheManagerInstance.getKeys('user')
      expect(userKeys.length).toBe(2)
      expect(userKeys.every(key => key.startsWith('user:'))).toBe(true)
      
      const postKeys = cacheManagerInstance.getKeys('post')
      expect(postKeys.length).toBe(1)
      expect(postKeys[0]).toMatch(/^post:post1:/)
    })
  })

  describe('缓存预热', () => {
    it('应该能够批量预热缓存', () => {
      const items = [
        { namespace: 'user', key: 'profile1', data: { name: 'user1' } },
        { namespace: 'user', key: 'profile2', data: { name: 'user2' } },
        { namespace: 'post', key: 'post1', data: { title: 'post1' } }
      ]
      
      cacheManagerInstance.warmup(items)
      
      expect(cacheManagerInstance.get('user', 'profile1')).toEqual({ name: 'user1' })
      expect(cacheManagerInstance.get('user', 'profile2')).toEqual({ name: 'user2' })
      expect(cacheManagerInstance.get('post', 'post1')).toEqual({ title: 'post1' })
    })

    it('应该支持预热时的自定义配置', () => {
      const items = [
        { 
          namespace: 'user', 
          key: 'profile1', 
          data: { name: 'user1' },
          config: { ttl: 60000, storage: 'memory' }
        }
      ]
      
      cacheManagerInstance.warmup(items)
      
      expect(cacheManagerInstance.get('user', 'profile1')).toEqual({ name: 'user1' })
    })
  })

  describe('存储事件处理', () => {
    it('应该处理localStorage变化事件', () => {
      const data = { name: 'test' }
      cacheManagerInstance.set('test', 'key1', data, { storage: 'both' })
      
      // 模拟存储事件
      const event = {
        key: 'cache:test:key1',
        newValue: null,
        oldValue: JSON.stringify({
          data,
          timestamp: Date.now(),
          expiry: Date.now() + 60000,
          key: 'test:key1'
        })
      }
      
      // 触发事件处理
      ;(cacheManagerInstance as any).handleStorageChange(event)
      
      // 内存中的缓存应该被删除
      expect(cacheManagerInstance.get('test', 'key1')).toBeNull()
    })

    it('应该忽略非缓存相关的存储事件', () => {
      const data = { name: 'test' }
      cacheManagerInstance.set('test', 'key1', data)
      
      // 模拟非缓存相关的存储事件
      const event = {
        key: 'other-key',
        newValue: 'value',
        oldValue: null
      }
      
      // 触发事件处理
      ;(cacheManagerInstance as any).handleStorageChange(event)
      
      // 缓存应该保持不变
      expect(cacheManagerInstance.get('test', 'key1')).toEqual(data)
    })
  })

  describe('错误处理', () => {
    it('应该处理JSON解析错误', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json')
      
      const result = (cacheManagerInstance as any).getFromStorage('test-key')
      expect(result).toBeNull()
    })

    it('应该处理localStorage访问错误', () => {
      // 模拟localStorage不可用
      const originalLocalStorage = window.localStorage
      delete (window as any).localStorage
      
      // 不应该抛出错误
      expect(() => {
        cacheManagerInstance.set('test', 'key1', { name: 'test' })
      }).not.toThrow()
      
      // 恢复localStorage
      window.localStorage = originalLocalStorage
    })

    it('应该处理大对象存储', () => {
      const largeData = { data: 'x'.repeat(1024 * 1024) } // 1MB数据
      
      // 不应该抛出错误
      expect(() => {
        cacheManagerInstance.set('test', 'large-data', largeData)
      }).not.toThrow()
    })
  })

  describe('性能测试', () => {
    it('应该能够快速设置和获取缓存', () => {
      const iterations = 1000
      const data = { name: 'test', value: 123 }
      
      const startTime = performance.now()
      
      for (let i = 0; i < iterations; i++) {
        cacheManagerInstance.set('test', `key${i}`, data)
        cacheManagerInstance.get('test', `key${i}`)
      }
      
      const endTime = performance.now()
      const avgTime = (endTime - startTime) / iterations
      
      // 平均时间应该小于1ms
      expect(avgTime).toBeLessThan(1)
    })

    it('应该能够处理大量缓存项', () => {
      const itemCount = 1000
      const data = { name: 'test', value: 123 }
      
      // 批量添加缓存
      for (let i = 0; i < itemCount; i++) {
        cacheManagerInstance.set('test', `key${i}`, data)
      }
      
      // 验证统计信息
      const stats = cacheManagerInstance.getStats()
      expect(stats.memorySize).toBe(itemCount)
      
      // 验证能够获取所有项
      for (let i = 0; i < itemCount; i++) {
        expect(cacheManagerInstance.get('test', `key${i}`)).toEqual(data)
      }
    })
  })

  describe('缓存装饰器', () => {
    it('应该正确缓存同步函数结果', () => {
      const mockFn = vi.fn().mockReturnValue('result')

      class TestClass {
        testMethod(arg: string) {
          return mockFn(arg)
        }
      }

      // 手动应用装饰器
      const descriptor = Object.getOwnPropertyDescriptor(TestClass.prototype, 'testMethod')!
      cached('test')(TestClass.prototype, 'testMethod', descriptor)
      Object.defineProperty(TestClass.prototype, 'testMethod', descriptor)

      const instance = new TestClass()

      // 第一次调用，应该执行原函数
      const result1 = instance.testMethod('arg1')
      expect(result1).toBe('result')
      expect(mockFn).toHaveBeenCalledTimes(1)
      
      // 第二次调用相同参数，应该返回缓存结果
      const result2 = instance.testMethod('arg1')
      expect(result2).toBe('result')
      expect(mockFn).toHaveBeenCalledTimes(1)
      
      // 不同参数，应该执行原函数
      const result3 = instance.testMethod('arg2')
      expect(result3).toBe('result')
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('应该正确缓存异步函数结果', async () => {
      const mockFn = vi.fn().mockResolvedValue('async-result')

      class TestClass {
        async testMethod(arg: string) {
          return mockFn(arg)
        }
      }

      // 手动应用装饰器
      const descriptor = Object.getOwnPropertyDescriptor(TestClass.prototype, 'testMethod')!
      cached('test')(TestClass.prototype, 'testMethod', descriptor)
      Object.defineProperty(TestClass.prototype, 'testMethod', descriptor)

      const instance = new TestClass()
      
      // 第一次调用，应该执行原函数
      const result1 = await instance.testMethod('arg1')
      expect(result1).toBe('async-result')
      expect(mockFn).toHaveBeenCalledTimes(1)
      
      // 第二次调用相同参数，应该返回缓存结果
      const result2 = await instance.testMethod('arg1')
      expect(result2).toBe('async-result')
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('应该支持自定义键生成器', () => {
      const mockFn = vi.fn().mockReturnValue('result')

      const keyGenerator = (arg: string) => `custom-key-${arg}`

      class TestClass {
        testMethod(arg: string) {
          return mockFn(arg)
        }
      }

      // 手动应用装饰器
      const descriptor = Object.getOwnPropertyDescriptor(TestClass.prototype, 'testMethod')!
      cached('test', keyGenerator)(TestClass.prototype, 'testMethod', descriptor)
      Object.defineProperty(TestClass.prototype, 'testMethod', descriptor)

      const instance = new TestClass()
      
      instance.testMethod('arg1')
      instance.testMethod('arg1')
      
      expect(mockFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('组合式函数', () => {
    it('应该提供缓存相关的组合式函数', () => {
      const { cache, cachedRequest, invalidateCache, preloadData, getStats, clearAll } = useCache()
      
      expect(cache).toBeDefined()
      expect(cachedRequest).toBeDefined()
      expect(invalidateCache).toBeDefined()
      expect(preloadData).toBeDefined()
      expect(getStats).toBeDefined()
      expect(clearAll).toBeDefined()
    })

    it('应该能够使用cachedRequest', async () => {
      const { cachedRequest } = useCache()
      const mockRequestFn = vi.fn().mockResolvedValue({ data: 'test' })
      
      const result = await cachedRequest(mockRequestFn, 'test', 'key1')
      
      expect(result).toEqual({ data: 'test' })
      expect(mockRequestFn).toHaveBeenCalledTimes(1)
      
      // 第二次调用应该使用缓存
      const result2 = await cachedRequest(mockRequestFn, 'test', 'key1')
      expect(result2).toEqual({ data: 'test' })
      expect(mockRequestFn).toHaveBeenCalledTimes(1)
    })

    it('应该能够使用invalidateCache', () => {
      const { cache, invalidateCache } = useCache()
      
      cache.set('test', 'key1', { data: 'test' })
      expect(cache.get('test', 'key1')).toEqual({ data: 'test' })
      
      invalidateCache('test', 'key1')
      expect(cache.get('test', 'key1')).toBeNull()
    })

    it('应该能够使用preloadData', async () => {
      const { cache, preloadData } = useCache()
      const mockRequestFn = vi.fn().mockResolvedValue({ data: 'test' })
      
      await preloadData(mockRequestFn, 'test', 'key1')
      
      expect(cache.get('test', 'key1')).toEqual({ data: 'test' })
      expect(mockRequestFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('预定义配置', () => {
    it('应该提供预定义的缓存配置', () => {
      expect(CACHE_CONFIGS.SHORT).toBeDefined()
      expect(CACHE_CONFIGS.MEDIUM).toBeDefined()
      expect(CACHE_CONFIGS.LONG).toBeDefined()
      expect(CACHE_CONFIGS.USER_DATA).toBeDefined()
      expect(CACHE_CONFIGS.DICTIONARY).toBeDefined()
      expect(CACHE_CONFIGS.LIST_DATA).toBeDefined()
    })

    it('应该有合理的默认TTL值', () => {
      expect(CACHE_CONFIGS.SHORT.ttl).toBe(1 * 60 * 1000) // 1分钟
      expect(CACHE_CONFIGS.MEDIUM.ttl).toBe(5 * 60 * 1000) // 5分钟
      expect(CACHE_CONFIGS.LONG.ttl).toBe(30 * 60 * 1000) // 30分钟
      expect(CACHE_CONFIGS.USER_DATA.ttl).toBe(10 * 60 * 1000) // 10分钟
      expect(CACHE_CONFIGS.DICTIONARY.ttl).toBe(60 * 60 * 1000) // 1小时
      expect(CACHE_CONFIGS.LIST_DATA.ttl).toBe(3 * 60 * 1000) // 3分钟
    })

    it('应该有合理的存储策略', () => {
      expect(CACHE_CONFIGS.SHORT.storage).toBe('memory')
      expect(CACHE_CONFIGS.MEDIUM.storage).toBe('both')
      expect(CACHE_CONFIGS.LONG.storage).toBe('both')
      expect(CACHE_CONFIGS.USER_DATA.storage).toBe('both')
      expect(CACHE_CONFIGS.DICTIONARY.storage).toBe('both')
      expect(CACHE_CONFIGS.LIST_DATA.storage).toBe('memory')
    })
  })

  describe('全局实例', () => {
    it('应该导出全局缓存管理器实例', () => {
      expect(cacheManager).toBeDefined()
      expect(cacheManager).toBeInstanceOf(CacheManager)
    })

    it('应该能够使用全局实例进行缓存操作', () => {
      const data = { name: 'test' }
      
      cacheManager.set('test', 'global-key', data)
      expect(cacheManager.get('test', 'global-key')).toEqual(data)
      
      cacheManager.delete('test', 'global-key')
      expect(cacheManager.get('test', 'global-key')).toBeNull()
    })
  })

  describe('边界条件', () => {
    it('应该处理空数据', () => {
      cacheManagerInstance.set('test', 'null-key', null)
      expect(cacheManagerInstance.get('test', 'null-key')).toBeNull()
      
      cacheManagerInstance.set('test', 'undefined-key', undefined)
      expect(cacheManagerInstance.get('test', 'undefined-key')).toBeUndefined()
      
      cacheManagerInstance.set('test', 'empty-key', '')
      expect(cacheManagerInstance.get('test', 'empty-key')).toBe('')
    })

    it('应该处理特殊字符键', () => {
      const data = { name: 'test' }
      const specialKeys = ['key/with/slashes', 'key?with?query', 'key#with#hash', 'key with spaces']
      
      specialKeys.forEach(key => {
        cacheManagerInstance.set('test', key, data)
        expect(cacheManagerInstance.get('test', key)).toEqual(data)
      })
    })

    it('应该处理长键名', () => {
      const data = { name: 'test' }
      const longKey = 'a'.repeat(1000)
      
      cacheManagerInstance.set('test', longKey, data)
      expect(cacheManagerInstance.get('test', longKey)).toEqual(data)
    })

    it('应该处理循环引用数据', () => {
      const data: any = { name: 'test' }
      data.self = data
      
      // 应该能够处理循环引用（可能抛出错误，但应该优雅处理）
      expect(() => {
        cacheManagerInstance.set('test', 'circular-key', data)
      }).not.toThrow()
    })
  })

  describe('集成测试', () => {
    it('应该在不同存储策略间保持数据一致性', () => {
      const data = { name: 'test' }
      
      // 使用both策略
      cacheManagerInstance.set('test', 'consistency-key', data, { storage: 'both' })
      
      // 清空内存缓存
      ;(cacheManagerInstance as any).memoryCache.clear()
      
      // 应该能从localStorage恢复
      const result = cacheManagerInstance.get('test', 'consistency-key')
      expect(result).toEqual(data)
    })

    it('应该能够处理跨标签页的缓存同步', () => {
      const data = { name: 'test' }
      
      // 模拟第一个标签页设置缓存
      cacheManagerInstance.set('test', 'sync-key', data, { storage: 'both' })
      
      // 模拟第二个标签页（新实例）
      const cacheManager2 = new (CacheManager as any)()
      
      // 应该能获取到缓存
      const result = cacheManager2.get('test', 'sync-key')
      expect(result).toEqual(data)
    })
  })
})

describe('缓存管理器安全性测试', () => {
  let cacheManagerInstance: CacheManager

  beforeEach(() => {
    vi.clearAllMocks()
    cacheManagerInstance = new (CacheManager as any)()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('应该防止缓存注入攻击', () => {
    const maliciousData = {
      toString: () => {
        throw new Error('Malicious data')
      }
    }
    
    // 应该能够处理恶意数据而不崩溃
    expect(() => {
      cacheManagerInstance.set('test', 'malicious-key', maliciousData as any)
    }).not.toThrow()
  })

  it('应该防止键名冲突攻击', () => {
    const data1 = { name: 'data1' }
    const data2 = { name: 'data2' }
    
    // 使用可能冲突的键名
    cacheManagerInstance.set('test', 'key:1', data1)
    cacheManagerInstance.set('test', 'key:1:extra', data2)
    
    expect(cacheManagerInstance.get('test', 'key:1')).toEqual(data1)
    expect(cacheManagerInstance.get('test', 'key:1', { extra: true })).toEqual(data2)
  })

  it('应该防止内存耗尽攻击', () => {
    // 模拟大量缓存项
    const largeData = { data: 'x'.repeat(1024) } // 1KB数据
    
    // 尝试添加大量缓存项
    for (let i = 0; i < 10000; i++) {
      cacheManagerInstance.set('test', `key${i}`, largeData)
    }
    
    // 应该能够正常操作而不崩溃
    expect(cacheManagerInstance.get('test', 'key0')).toBeDefined()
    expect(cacheManagerInstance.get('test', 'key9999')).toBeDefined()
  })

  it('应该防止敏感数据泄露', () => {
    const sensitiveData = { password: 'secret', token: 'bearer-token' }
    
    cacheManagerInstance.set('user', 'credentials', sensitiveData)
    
    // 数据应该被正确存储和获取
    const result = cacheManagerInstance.get('user', 'credentials')
    expect(result).toEqual(sensitiveData)
    
    // 但不应该在日志中泄露敏感信息
    const consoleSpy = vi.spyOn(console, 'log')
    cacheManagerInstance.getStats()
    expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('secret'))
    expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('bearer-token'))
  })
})