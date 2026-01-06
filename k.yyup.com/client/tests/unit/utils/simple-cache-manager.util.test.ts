import { describe, it, expect, beforeEach, vi } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import { vi } from 'vitest'
import { CacheManager } from '@/utils/cacheManager'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
})

// 控制台错误检测变量
let consoleSpy: any

describe('简化缓存管理器测试', () => {
    beforeEach(() => {
      startConsoleMonitoring()
      vi.clearAllMocks()
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    afterEach(() => {
      expectNoConsoleErrors()
      stopConsoleMonitoring()
    })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
  let cacheManager: CacheManager

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    cacheManager = new CacheManager()
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  describe('基本缓存操作', () => {
    it('应该能够设置和获取缓存数据', () => {
      const data = { name: 'test', value: 123 }
      
      cacheManager.set('test', 'key1', data)
      const result = cacheManager.get('test', 'key1')
      
      expect(result).toEqual(data)
    })

    it('应该能够处理带参数的缓存键', () => {
      const data = { name: 'test' }
      const params = { id: 1, type: 'user' }
      
      cacheManager.set('test', 'key1', data, undefined, params)
      const result = cacheManager.get('test', 'key1', params)
      
      expect(result).toEqual(data)
    })

    it('应该返回null对于不存在的缓存', () => {
      const result = cacheManager.get('test', 'nonexistent-key')
      expect(result).toBeNull()
    })

    it('应该能够删除指定缓存', () => {
      const data = { name: 'test' }
      
      cacheManager.set('test', 'key1', data)
      expect(cacheManager.get('test', 'key1')).toEqual(data)
      
      cacheManager.delete('test', 'key1')
      expect(cacheManager.get('test', 'key1')).toBeNull()
    })

    it('应该能够清空指定命名空间的缓存', () => {
      cacheManager.set('test1', 'key1', { data: 'test1' })
      cacheManager.set('test1', 'key2', { data: 'test2' })
      cacheManager.set('test2', 'key1', { data: 'test3' })
      
      cacheManager.clearNamespace('test1')
      
      expect(cacheManager.get('test1', 'key1')).toBeNull()
      expect(cacheManager.get('test1', 'key2')).toBeNull()
      expect(cacheManager.get('test2', 'key1')).toEqual({ data: 'test3' })
    })

    it('应该能够清空所有缓存', () => {
      cacheManager.set('test1', 'key1', { data: 'test1' })
      cacheManager.set('test2', 'key1', { data: 'test2' })
      
      cacheManager.clearAll()
      
      expect(cacheManager.get('test1', 'key1')).toBeNull()
      expect(cacheManager.get('test2', 'key1')).toBeNull()
    })

    it('应该能够检查缓存是否存在', () => {
      expect(cacheManager.has('test', 'key1')).toBe(false)
      
      cacheManager.set('test', 'key1', { data: 'test' })
      expect(cacheManager.has('test', 'key1')).toBe(true)
    })
  })

  describe('缓存配置', () => {
    it('应该使用默认配置', () => {
      const data = { name: 'test' }
      cacheManager.set('test', 'key1', data)
      
      const result = cacheManager.get('test', 'key1')
      expect(result).toEqual(data)
    })

    it('应该能够自定义TTL', () => {
      vi.useFakeTimers()
      
      const data = { name: 'test' }
      const config = { ttl: 1000 } // 1秒
      
      cacheManager.set('test', 'key1', data, config)
      
      // 立即获取应该成功
      expect(cacheManager.get('test', 'key1')).toEqual(data)
      
      // 等待过期
      vi.advanceTimersByTime(1100)
      
      // 过期后应该返回null
      expect(cacheManager.get('test', 'key1')).toBeNull()
      
      vi.useRealTimers()
    })

    it('应该支持版本控制', () => {
      const data1 = { name: 'test1' }
      const data2 = { name: 'test2' }
      
      cacheManager.set('test', 'key1', data1, { version: '1.0' })
      cacheManager.set('test', 'key1', data2, { version: '2.0' })
      
      // 新版本应该覆盖旧版本
      expect(cacheManager.get('test', 'key1')).toEqual(data2)
    })
  })

  describe('缓存统计', () => {
    it('应该正确统计缓存命中率', () => {
      const data = { name: 'test' }
      
      // 设置缓存
      cacheManager.set('test', 'key1', data)
      
      // 命中缓存
      cacheManager.get('test', 'key1')
      cacheManager.get('test', 'key1')
      
      // 未命中缓存
      cacheManager.get('test', 'key2')
      
      const stats = cacheManager.getStats()
      expect(stats.totalHits).toBe(2)
      expect(stats.totalMisses).toBe(1)
      expect(stats.hitRate).toBeCloseTo(66.67, 2)
    })

    it('应该正确统计内存大小', () => {
      const stats1 = cacheManager.getStats()
      const initialSize = stats1.memorySize
      
      cacheManager.set('test', 'key1', { data: 'test' })
      
      const stats2 = cacheManager.getStats()
      expect(stats2.memorySize).toBeGreaterThan(initialSize)
    })

    it('应该能够获取缓存键列表', () => {
      cacheManager.set('test1', 'key1', { data: 'test1' })
      cacheManager.set('test1', 'key2', { data: 'test2' })
      cacheManager.set('test2', 'key1', { data: 'test3' })
      
      const keys = cacheManager.getKeys()
      expect(keys.length).toBeGreaterThanOrEqual(3)
      expect(keys).toContain('test1:key1:0')
      expect(keys).toContain('test1:key2:0')
      expect(keys).toContain('test2:key1:0')
    })
  })

  describe('错误处理', () => {
    it('应该处理空数据', () => {
      expect(() => {
        cacheManager.set('test', 'key1', null)
      }).not.toThrow()
      
      expect(cacheManager.get('test', 'key1')).toBeNull()
    })

    it('应该处理特殊字符键', () => {
      const specialKey = 'key:with/special\\chars'
      const data = { name: 'test' }
      
      cacheManager.set('test', specialKey, data)
      expect(cacheManager.get('test', specialKey)).toEqual(data)
    })

    it('应该处理长键名', () => {
      const longKey = 'a'.repeat(1000)
      const data = { name: 'test' }
      
      cacheManager.set('test', longKey, data)
      expect(cacheManager.get('test', longKey)).toEqual(data)
    })

    it('应该处理循环引用数据', () => {
      const circularData: any = { name: 'test' }
      circularData.self = circularData
      
      expect(() => {
        cacheManager.set('test', 'key1', circularData)
      }).not.toThrow()
    })
  })

  describe('性能测试', () => {
    it('应该能够快速设置和获取缓存', () => {
      const startTime = performance.now()
      
      // 执行100次操作
      for (let i = 0; i < 100; i++) {
        cacheManager.set('test', `key${i}`, { value: i })
        cacheManager.get('test', `key${i}`)
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // 应该在合理时间内完成（100ms内）
      expect(duration).toBeLessThan(100)
    })

    it('应该能够处理适量缓存项', () => {
      const itemCount = 100
      
      // 设置缓存项
      for (let i = 0; i < itemCount; i++) {
        cacheManager.set('test', `key${i}`, { value: i })
      }
      
      // 验证统计信息
      const stats = cacheManager.getStats()
      expect(stats.memorySize).toBeGreaterThanOrEqual(itemCount)
      
      // 验证能够获取所有项
      for (let i = 0; i < itemCount; i++) {
        const result = cacheManager.get('test', `key${i}`)
        expect(result).toEqual({ value: i })
      }
    })
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
      const key = (cacheManager as any).generateKey('test', 'key1')
      expect(key).toBe('test:key1:0')
    })

    it('应该为相同参数生成相同的键', () => {
      const params = { id: 1, name: 'test' }
      const key1 = (cacheManager as any).generateKey('test', 'key1', params)
      const key2 = (cacheManager as any).generateKey('test', 'key1', params)
      
      expect(key1).toBe(key2)
    })

    it('应该为不同参数生成不同的键', () => {
      const params1 = { id: 1, name: 'test1' }
      const params2 = { id: 2, name: 'test2' }
      
      const key1 = (cacheManager as any).generateKey('test', 'key1', params1)
      const key2 = (cacheManager as any).generateKey('test', 'key1', params2)
      
      expect(key1).not.toBe(key2)
    })

    it('应该正确处理空参数', () => {
      const key1 = (cacheManager as any).generateKey('test', 'key1')
      const key2 = (cacheManager as any).generateKey('test', 'key1', null)
      const key3 = (cacheManager as any).generateKey('test', 'key1', undefined)

      // 这些应该生成相同的键，因为都会产生空字符串
      expect(key1).toBe(key2)
      expect(key1).toBe(key3)
      expect(key2).toBe(key3)

      // 空对象会产生不同的哈希
      const key4 = (cacheManager as any).generateKey('test', 'key1', {})
      expect(key1).not.toBe(key4)
    })
  })
})
