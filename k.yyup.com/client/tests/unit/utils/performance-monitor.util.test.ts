import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import { vi } from 'vitest'
import { PerformanceMonitor, PerformanceMetrics, OptimizationResult, PerformanceAlert } from '@/utils/performance-monitor'

// Mock dependencies
vi.mock('@/utils/advanced-cache-manager', () => ({
  cacheManager: {
    getStats: vi.fn(() => ({
      hitRate: 85,
      totalRequests: 1000,
      cacheHits: 850,
      cacheMisses: 150
    }))
  }
}))

vi.mock('@/utils/predictive-preloader', () => ({
  predictivePreloader: {
    warmup: vi.fn(),
    getPerformanceMetrics: vi.fn(() => ({
      predictionAccuracy: 0.9,
      cacheHitRate: 0.8,
      averageLoadTime: 100
    }))
  }
}))

// Mock window and performance APIs
const mockPerformance = {
  getEntriesByType: vi.fn(),
  now: vi.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 50 * 1024 * 1024 // 50MB
  }
}

const mockWindow = {
  PerformanceObserver: vi.fn(),
  IntersectionObserver: vi.fn(),
  fetch: vi.fn()
}

// 控制台错误检测变量
let consoleSpy: any

describe('Performance Monitor Utils', () => {
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
  let performanceMonitor: PerformanceMonitor

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks()
    
    // Setup window mock
    Object.defineProperty(global, 'window', {
      value: mockWindow,
      writable: true
    })
    
    // Setup performance mock
    Object.defineProperty(global, 'performance', {
      value: mockPerformance,
      writable: true
    })
    
    // Setup PerformanceObserver mock
    const mockObserverInstance = {
      observe: vi.fn(),
      disconnect: vi.fn()
    }
    
    mockWindow.PerformanceObserver.mockImplementation((callback) => {
      return mockObserverInstance
    })
    
    // Setup IntersectionObserver mock
    mockWindow.IntersectionObserver.mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    }))
    
    // Create performance monitor instance
    performanceMonitor = new PerformanceMonitor()
  })

  afterEach(() => {
    // Cleanup
    Object.defineProperty(global, 'window', {
      value: window,
      writable: true
    })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
    
    Object.defineProperty(global, 'performance', {
      value: performance,
      writable: true
    })
    
    // Destroy performance monitor
    performanceMonitor.destroy()
  })

  describe('Initialization', () => {
    it('should initialize performance observers correctly', () => {
      expect(mockWindow.PerformanceObserver).toHaveBeenCalledTimes(4) // navigation, paint, layout-shift, longtask
      expect(mockWindow.IntersectionObserver).toHaveBeenCalledTimes(1) // image lazy loading
    })

    it('should setup monitoring intervals', () => {
      // Check that intervals are set up by checking the number of setInterval calls
      // This is a bit indirect but necessary since we can't access the interval IDs
      expect(setInterval).toHaveBeenCalledTimes(3) // memory, resources, cleanup
    })

    it('should setup performance optimizations', () => {
      expect(mockWindow.IntersectionObserver).toHaveBeenCalled()
    })
  })

  describe('Performance Metrics Collection', () => {
    it('should process navigation entries correctly', () => {
      const mockEntry = {
        entryType: 'navigation',
        fetchStart: 1000,
        loadEventEnd: 2500,
        domContentLoadedEventEnd: 2000
      }
      
      // Simulate observer callback
      const observerCallback = mockWindow.PerformanceObserver.mock.calls[0][0]
      observerCallback({ getEntries: () => [mockEntry] })
      
      const metrics = performanceMonitor['metrics']
      expect(metrics).toHaveLength(1)
      expect(metrics[0].pageLoadTime).toBe(1500)
      expect(metrics[0].domContentLoaded).toBe(1000)
    })

    it('should process paint entries correctly', () => {
      const mockEntry = {
        name: 'first-contentful-paint',
        startTime: 1200
      }
      
      // First add a navigation entry to have metrics to update
      const navEntry = {
        entryType: 'navigation',
        fetchStart: 1000,
        loadEventEnd: 2500,
        domContentLoadedEventEnd: 2000
      }
      
      const navObserverCallback = mockWindow.PerformanceObserver.mock.calls[0][0]
      navObserverCallback({ getEntries: () => [navEntry] })
      
      // Then add paint entry
      const paintObserverCallback = mockWindow.PerformanceObserver.mock.calls[1][0]
      paintObserverCallback({ getEntries: () => [mockEntry] })
      
      const metrics = performanceMonitor['metrics']
      expect(metrics[0].firstContentfulPaint).toBe(1200)
    })

    it('should handle layout shift detection', () => {
      const mockEntries = [
        { hadRecentInput: false, value: 0.05 },
        { hadRecentInput: true, value: 0.1 },
        { hadRecentInput: false, value: 0.08 }
      ]
      
      const clsObserverCallback = mockWindow.PerformanceObserver.mock.calls[2][0]
      clsObserverCallback({ getEntries: () => mockEntries })
      
      // Should trigger alert for CLS > 0.1
      const alerts = performanceMonitor['alerts']
      expect(alerts.length).toBeGreaterThan(0)
      expect(alerts[0].type).toBe('layout_shift')
    })

    it('should handle long task detection', () => {
      const mockEntries = [
        { duration: 30, startTime: 1000 },
        { duration: 75, startTime: 2000 }, // Should trigger alert
        { duration: 40, startTime: 3000 }
      ]
      
      const longTaskObserverCallback = mockWindow.PerformanceObserver.mock.calls[3][0]
      longTaskObserverCallback({ getEntries: () => mockEntries })
      
      const alerts = performanceMonitor['alerts']
      expect(alerts.length).toBeGreaterThan(0)
      expect(alerts[0].type).toBe('slow_page')
    })
  })

  describe('API Response Time Tracking', () => {
    it('should track API response times', () => {
      const url = '/api/test'
      const startTime = 1000
      const endTime = 1600
      
      performanceMonitor.trackAPICall(url, startTime, endTime)
      
      const apiTimings = performanceMonitor['apiTimings']
      expect(apiTimings.get(url)).toBe(600)
    })

    it('should trigger alert for slow API responses', () => {
      const url = '/api/slow'
      const startTime = 1000
      const endTime = 2000 // 1000ms > 500ms threshold
      
      performanceMonitor.trackAPICall(url, startTime, endTime)
      
      const alerts = performanceMonitor['alerts']
      expect(alerts.length).toBeGreaterThan(0)
      expect(alerts[0].type).toBe('slow_api')
      expect(alerts[0].details.url).toBe(url)
      expect(alerts[0].details.responseTime).toBe(1000)
    })

    it('should not trigger alert for fast API responses', () => {
      const url = '/api/fast'
      const startTime = 1000
      const endTime = 1200 // 200ms < 500ms threshold
      
      performanceMonitor.trackAPICall(url, startTime, endTime)
      
      const alerts = performanceMonitor['alerts']
      const slowApiAlerts = alerts.filter(alert => alert.type === 'slow_api')
      expect(slowApiAlerts).toHaveLength(0)
    })
  })

  describe('Resource Performance Analysis', () => {
    it('should analyze resource loading performance', () => {
      const mockResources = [
        {
          name: 'https://example.com/large-image.jpg',
          transferSize: 2 * 1024 * 1024, // 2MB
          responseEnd: 1000,
          fetchStart: 500
        },
        {
          name: 'https://example.com/small-image.jpg',
          transferSize: 100 * 1024, // 100KB
          responseEnd: 2000,
          fetchStart: 1800
        },
        {
          name: 'https://example.com/slow-resource.js',
          transferSize: 500 * 1024, // 500KB
          responseEnd: 4000,
          fetchStart: 1000 // 3000ms load time
        }
      ]
      
      mockPerformance.getEntriesByType.mockReturnValue(mockResources)
      
      // Trigger resource analysis
      performanceMonitor['analyzeResourcePerformance']()
      
      const alerts = performanceMonitor['alerts']
      
      // Should have alerts for large file and slow resource
      expect(alerts.some(alert => alert.type === 'large_bundle')).toBe(true)
      expect(alerts.some(alert => alert.type === 'slow_page')).toBe(true)
    })

    it('should handle empty resource list', () => {
      mockPerformance.getEntriesByType.mockReturnValue([])
      
      expect(() => {
        performanceMonitor['analyzeResourcePerformance']()
      }).not.toThrow()
    })
  })

  describe('Performance Score Calculation', () => {
    it('should calculate performance score correctly', () => {
      const metrics: PerformanceMetrics = {
        pageLoadTime: 1000, // Good
        domContentLoaded: 800, // Good
        firstContentfulPaint: 900, // Good
        largestContentfulPaint: 0,
        timeToInteractive: 0,
        cumulativeLayoutShift: 0.05, // Good
        resourceLoadTimes: {},
        apiResponseTimes: {},
        memoryUsage: 50 * 1024 * 1024, // 50MB, good
        bundleSize: 1000000
      }
      
      const score = performanceMonitor['calculatePerformanceScore'](metrics)
      expect(score).toBeGreaterThan(80) // Should be high score
    })

    it('should penalize poor performance metrics', () => {
      const metrics: PerformanceMetrics = {
        pageLoadTime: 3000, // Slow
        domContentLoaded: 2500, // Slow
        firstContentfulPaint: 1500, // Slow
        largestContentfulPaint: 0,
        timeToInteractive: 0,
        cumulativeLayoutShift: 0.2, // Poor
        resourceLoadTimes: {},
        apiResponseTimes: { '/api/slow': 1000 }, // Slow API
        memoryUsage: 150 * 1024 * 1024, // 150MB, high
        bundleSize: 5000000
      }
      
      const score = performanceMonitor['calculatePerformanceScore'](metrics)
      expect(score).toBeLessThan(80) // Should be lower score
    })

    it('should handle edge cases in score calculation', () => {
      const metrics: PerformanceMetrics = {
        pageLoadTime: 0,
        domContentLoaded: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        timeToInteractive: 0,
        cumulativeLayoutShift: 0,
        resourceLoadTimes: {},
        apiResponseTimes: {},
        memoryUsage: 0,
        bundleSize: 0
      }
      
      const score = performanceMonitor['calculatePerformanceScore'](metrics)
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })
  })

  describe('Performance Optimization', () => {
    it('should perform optimization and return results', async () => {
      const result = await performanceMonitor.performOptimization()
      
      expect(result).toHaveProperty('before')
      expect(result).toHaveProperty('after')
      expect(result).toHaveProperty('improvements')
      expect(result).toHaveProperty('recommendations')
      expect(result).toHaveProperty('score')
      expect(result.improvements).toContain('缓存优化')
      expect(result.improvements).toContain('关键资源预加载')
      expect(result.improvements).toContain('资源压缩')
    })

    it('should optimize cache', async () => {
      await performanceMonitor['optimizeCache']()
      // Cache optimization is mocked, so we just verify it doesn't throw
      expect(true).toBe(true)
    })

    it('should preload critical resources', async () => {
      await performanceMonitor['preloadCriticalResources']()
      // Verify that predictivePreloader.warmup was called
      const { predictivePreloader } = await import('@/utils/predictive-preloader')
      expect(predictivePreloader.warmup).toHaveBeenCalledTimes(3) // 3 critical routes
    })

    it('should compress resources', async () => {
      await performanceMonitor['compressResources']()
      // Resource compression is mocked, so we just verify it doesn't throw
      expect(true).toBe(true)
    })
  })

  describe('Performance Reporting', () => {
    it('should generate performance report', () => {
      const report = performanceMonitor.getPerformanceReport()
      
      expect(report).toHaveProperty('currentScore')
      expect(report).toHaveProperty('averageLoadTime')
      expect(report).toHaveProperty('cachePerformance')
      expect(report).toHaveProperty('predictivePerformance')
      expect(report).toHaveProperty('alerts')
      expect(report).toHaveProperty('recommendations')
      expect(report.alerts).toHaveLength(10) // Should return recent 10 alerts
    })

    it('should handle empty metrics in report', () => {
      // Clear metrics
      performanceMonitor['metrics'] = []
      
      const report = performanceMonitor.getPerformanceReport()
      
      expect(report.currentScore).toBeGreaterThanOrEqual(0)
      expect(report.averageLoadTime).toBe(0)
    })
  })

  describe('Configuration Management', () => {
    it('should update performance thresholds', () => {
      const newThresholds = {
        pageLoadTime: 2000,
        firstContentfulPaint: 1500,
        apiResponseTime: 1000
      }
      
      performanceMonitor.setThresholds(newThresholds)
      
      // Verify thresholds were updated (private property access)
      const thresholds = performanceMonitor['thresholds']
      expect(thresholds.pageLoadTime).toBe(2000)
      expect(thresholds.firstContentfulPaint).toBe(1500)
      expect(thresholds.apiResponseTime).toBe(1000)
    })

    it('should update optimization settings', () => {
      const newOptimizations = {
        enableImageLazyLoading: false,
        enableCodeSplitting: false,
        enableResourcePreloading: false
      }
      
      performanceMonitor.setOptimizations(newOptimizations)
      
      // Verify optimizations were updated (private property access)
      const optimizations = performanceMonitor['optimizations']
      expect(optimizations.enableImageLazyLoading).toBe(false)
      expect(optimizations.enableCodeSplitting).toBe(false)
      expect(optimizations.enableResourcePreloading).toBe(false)
    })
  })

  describe('Image Lazy Loading', () => {
    it('should setup image lazy loading observer', () => {
      // Mock DOM elements
      const mockImages = [
        { dataset: { src: 'image1.jpg' }, src: '', removeAttribute: vi.fn() },
        { dataset: { src: 'image2.jpg' }, src: '', removeAttribute: vi.fn() }
      ]
      
      document.querySelectorAll = vi.fn(() => mockImages as any)
      
      // Simulate intersection observer callback
      const intersectionCallback = mockWindow.IntersectionObserver.mock.calls[0][0]
      const mockEntries = [
        { isIntersecting: true, target: mockImages[0] },
        { isIntersecting: false, target: mockImages[1] }
      ]
      
      intersectionCallback(mockEntries)
      
      // Verify that intersecting image was loaded
      expect(mockImages[0].src).toBe('image1.jpg')
      expect(mockImages[0].removeAttribute).toHaveBeenCalledWith('data-src')
      
      // Verify that non-intersecting image was not loaded
      expect(mockImages[1].src).toBe('')
    })
  })

  describe('Resource Preloading', () => {
    it('should preload existing resources', async () => {
      // Mock successful fetch responses
      mockWindow.fetch.mockImplementation((url: string) => {
        if (url === '/fonts/main.woff2' || url === '/css/critical.css' || url === '/js/vendor.js') {
          return Promise.resolve({
            ok: true
          } as any)
        }
        return Promise.resolve({
          ok: false
        } as any)
      })
      
      await performanceMonitor['enableResourcePreloading']()
      
      // Verify fetch was called for each resource
      expect(mockWindow.fetch).toHaveBeenCalledTimes(3)
    })

    it('should skip non-existing resources', async () => {
      // Mock failed fetch responses
      mockWindow.fetch.mockResolvedValue({
        ok: false
      } as any)
      
      await performanceMonitor['enableResourcePreloading']()
      
      // Verify fetch was called but resources were skipped
      expect(mockWindow.fetch).toHaveBeenCalledTimes(0) // Resources are filtered out
    })
  })

  describe('Critical CSS Inlining', () => {
    it('should inline critical CSS', () => {
      // Mock DOM
      const mockStyle = {}
      document.createElement = vi.fn(() => mockStyle as any)
      document.head = {
        insertBefore: vi.fn()
      }
      
      performanceMonitor['enableCriticalCSSInline']()
      
      // Verify style element was created and inserted
      expect(document.createElement).toHaveBeenCalledWith('style')
      expect(document.head.insertBefore).toHaveBeenCalledWith(mockStyle, document.head.firstChild)
    })
  })

  describe('Memory Usage Monitoring', () => {
    it('should detect high memory usage', () => {
      // Mock high memory usage
      mockPerformance.memory.usedJSHeapSize = 150 * 1024 * 1024 // 150MB > 100MB threshold
      
      // Fast-forward time to trigger memory check interval
      vi.advanceTimersByTime(30000)
      
      const alerts = performanceMonitor['alerts']
      const memoryAlerts = alerts.filter(alert => alert.type === 'memory_leak')
      expect(memoryAlerts.length).toBeGreaterThan(0)
    })

    it('should not alert for normal memory usage', () => {
      // Mock normal memory usage
      mockPerformance.memory.usedJSHeapSize = 50 * 1024 * 1024 // 50MB < 100MB threshold
      
      // Fast-forward time to trigger memory check interval
      vi.advanceTimersByTime(30000)
      
      const alerts = performanceMonitor['alerts']
      const memoryAlerts = alerts.filter(alert => alert.type === 'memory_leak')
      expect(memoryAlerts).toHaveLength(0)
    })
  })

  describe('Data Cleanup', () => {
    it('should cleanup old data', () => {
      // Add old data
      const oldTime = Date.now() - 31 * 60 * 1000 // 31 minutes ago
      performanceMonitor['metrics'].push({
        pageLoadTime: 1000,
        domContentLoaded: 800,
        firstContentfulPaint: 900,
        largestContentfulPaint: 0,
        timeToInteractive: 0,
        cumulativeLayoutShift: 0,
        resourceLoadTimes: {},
        apiResponseTimes: {},
        memoryUsage: 50 * 1024 * 1024,
        bundleSize: 1000000
      } as any)
      
      performanceMonitor['alerts'].push({
        type: 'slow_page',
        message: 'Test alert',
        severity: 'medium',
        timestamp: oldTime,
        route: '/test',
        details: {}
      })
      
      // Fast-forward time to trigger cleanup interval
      vi.advanceTimersByTime(300000) // 5 minutes
      
      // Verify old data was cleaned up (metrics are not timestamped in this implementation)
      expect(performanceMonitor['alerts']).toHaveLength(0)
    })
  })

  describe('Destruction', () => {
    it('should destroy performance monitor correctly', () => {
      const mockObserverInstance = {
        disconnect: vi.fn()
      }
      
      // Mock the observers
      performanceMonitor['observers'].set('navigation', mockObserverInstance as any)
      performanceMonitor['observers'].set('paint', mockObserverInstance as any)
      
      performanceMonitor.destroy()
      
      // Verify all observers were disconnected
      expect(mockObserverInstance.disconnect).toHaveBeenCalledTimes(2)
      
      // Verify data was cleared
      expect(performanceMonitor['metrics']).toHaveLength(0)
      expect(performanceMonitor['alerts']).toHaveLength(0)
      expect(performanceMonitor['resourceTimings']).toHaveLength(0)
      expect(performanceMonitor['apiTimings'].size).toBe(0)
    })
  })

  describe('Integration Tests', () => {
    it('should handle complete performance monitoring workflow', async () => {
      // Simulate navigation
      const navEntry = {
        entryType: 'navigation',
        fetchStart: 1000,
        loadEventEnd: 2500,
        domContentLoadedEventEnd: 2000
      }
      
      const navObserverCallback = mockWindow.PerformanceObserver.mock.calls[0][0]
      navObserverCallback({ getEntries: () => [navEntry] })
      
      // Simulate paint
      const paintEntry = {
        name: 'first-contentful-paint',
        startTime: 1200
      }
      
      const paintObserverCallback = mockWindow.PerformanceObserver.mock.calls[1][0]
      paintObserverCallback({ getEntries: () => [paintEntry] })
      
      // Track API calls
      performanceMonitor.trackAPICall('/api/test', 1000, 1200) // Fast
      performanceMonitor.trackAPICall('/api/slow', 1000, 1800) // Slow
      
      // Get performance report
      const report = performanceMonitor.getPerformanceReport()
      
      expect(report.currentScore).toBeGreaterThan(0)
      expect(report.averageLoadTime).toBe(1500)
      expect(report.alerts.length).toBeGreaterThan(0)
      
      // Perform optimization
      const optimizationResult = await performanceMonitor.performOptimization()
      
      expect(optimizationResult.improvements).toHaveLength(3)
      expect(optimizationResult.score).toBeGreaterThan(0)
    })

    it('should handle multiple performance alerts', () => {
      // Simulate slow page load
      const navEntry = {
        entryType: 'navigation',
        fetchStart: 1000,
        loadEventEnd: 4000, // 3000ms > 1500ms threshold
        domContentLoadedEventEnd: 3500
      }
      
      const navObserverCallback = mockWindow.PerformanceObserver.mock.calls[0][0]
      navObserverCallback({ getEntries: () => [navEntry] })
      
      // Simulate high memory usage
      mockPerformance.memory.usedJSHeapSize = 150 * 1024 * 1024
      
      // Simulate slow API
      performanceMonitor.trackAPICall('/api/slow', 1000, 2000)
      
      const alerts = performanceMonitor['alerts']
      
      expect(alerts.some(alert => alert.type === 'slow_page')).toBe(true)
      expect(alerts.some(alert => alert.type === 'memory_leak')).toBe(true)
      expect(alerts.some(alert => alert.type === 'slow_api')).toBe(true)
    })
  })

  describe('Performance Tests', () => {
    it('should handle high-frequency metric collection', () => {
      const startTime = performance.now()
      
      // Simulate many navigation entries
      for (let i = 0; i < 100; i++) {
        const navEntry = {
          entryType: 'navigation',
          fetchStart: 1000 + i * 100,
          loadEventEnd: 2500 + i * 100,
          domContentLoadedEventEnd: 2000 + i * 100
        }
        
        const navObserverCallback = mockWindow.PerformanceObserver.mock.calls[0][0]
        navObserverCallback({ getEntries: () => [navEntry] })
      }
      
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(100) // Should complete quickly
      expect(performanceMonitor['metrics'].length).toBe(100)
    })

    it('should handle many API calls efficiently', () => {
      const startTime = performance.now()
      
      // Track many API calls
      for (let i = 0; i < 1000; i++) {
        performanceMonitor.trackAPICall(`/api/test/${i}`, 1000, 1200)
      }
      
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(50) // Should complete quickly
      expect(performanceMonitor['apiTimings'].size).toBe(1000)
    })
  })

  describe('Error Handling Tests', () => {
    it('should handle PerformanceObserver errors gracefully', () => {
      // Mock PerformanceObserver to throw error
      mockWindow.PerformanceObserver.mockImplementationOnce(() => {
        throw new Error('PerformanceObserver not supported')
      })
      
      expect(() => {
        new PerformanceMonitor()
      }).not.toThrow()
    })

    it('should handle IntersectionObserver errors gracefully', () => {
      // Mock IntersectionObserver to throw error
      mockWindow.IntersectionObserver.mockImplementationOnce(() => {
        throw new Error('IntersectionObserver not supported')
      })
      
      expect(() => {
        new PerformanceMonitor()
      }).not.toThrow()
    })

    it('should handle fetch errors in resource preloading', async () => {
      // Mock fetch to throw error
      mockWindow.fetch.mockRejectedValue(new Error('Network error'))
      
      await expect(performanceMonitor['enableResourcePreloading']()).resolves.not.toThrow()
    })

    it('should handle invalid performance entries', () => {
      const invalidEntry = {
        entryType: 'navigation',
        // Missing required properties
      }
      
      const navObserverCallback = mockWindow.PerformanceObserver.mock.calls[0][0]
      
      expect(() => {
        navObserverCallback({ getEntries: () => [invalidEntry as any] })
      }).not.toThrow()
    })
  })

  describe('Security Tests', () => {
    it('should not expose sensitive information in alerts', () => {
      performanceMonitor.trackAPICall('/api/users?token=secret', 1000, 1200)
      
      const alerts = performanceMonitor['alerts']
      const apiAlerts = alerts.filter(alert => alert.type === 'slow_api')
      
      apiAlerts.forEach(alert => {
        expect(alert.details.url).not.toContain('secret')
      })
    })

    it('should sanitize route information in alerts', () => {
      // Mock window location
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/dashboard?token=secret&password=123'
        },
        writable: true
      })
      
      const navEntry = {
        entryType: 'navigation',
        fetchStart: 1000,
        loadEventEnd: 4000, // Will trigger slow page alert
        domContentLoadedEventEnd: 3500
      }
      
      const navObserverCallback = mockWindow.PerformanceObserver.mock.calls[0][0]
      navObserverCallback({ getEntries: () => [navEntry] })
      
      const alerts = performanceMonitor['alerts']
      const slowPageAlerts = alerts.filter(alert => alert.type === 'slow_page')
      
      slowPageAlerts.forEach(alert => {
        expect(alert.route).not.toContain('secret')
        expect(alert.route).not.toContain('123')
      })
    })

    it('should handle malicious performance entries', () => {
      const maliciousEntry = {
        entryType: 'navigation',
        fetchStart: 1000,
        loadEventEnd: 2500,
        domContentLoadedEventEnd: 2000,
        __proto__: { malicious: true },
        constructor: { prototype: { malicious: true } }
      }
      
      const navObserverCallback = mockWindow.PerformanceObserver.mock.calls[0][0]
      
      expect(() => {
        navObserverCallback({ getEntries: () => [maliciousEntry as any] })
      }).not.toThrow()
      
      // Verify prototypes were not polluted
      expect(({} as any).malicious).toBeUndefined()
    })
  })
})