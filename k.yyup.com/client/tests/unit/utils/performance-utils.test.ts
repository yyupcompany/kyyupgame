import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import * as performanceUtils from '../../../src/utils/performance-utils'

// Mock performance API
const mockPerformance = {
  now: vi.fn(),
  mark: vi.fn(),
  measure: vi.fn(),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn(),
  getEntries: vi.fn(),
  getEntriesByType: vi.fn(),
  getEntriesByName: vi.fn(),
  setResourceTimingBufferSize: vi.fn(),
  toJSON: vi.fn(),
  timeOrigin: 0,
  timing: {
    navigationStart: 0,
    unloadEventStart: 0,
    unloadEventEnd: 0,
    redirectStart: 0,
    redirectEnd: 0,
    fetchStart: 0,
    domainLookupStart: 0,
    domainLookupEnd: 0,
    connectStart: 0,
    connectEnd: 0,
    secureConnectionStart: 0,
    requestStart: 0,
    responseStart: 0,
    responseEnd: 0,
    domLoading: 0,
    domInteractive: 0,
    domContentLoadedEventStart: 0,
    domContentLoadedEventEnd: 0,
    domComplete: 0,
    loadEventStart: 0,
    loadEventEnd: 0
  },
  navigation: {
    type: 'navigate',
    redirectCount: 0
  },
  memory: {
    usedJSHeapSize: 0,
    totalJSHeapSize: 0,
    jsHeapSizeLimit: 0
  }
}

// Mock requestAnimationFrame
const mockRequestAnimationFrame = vi.fn()
const mockCancelAnimationFrame = vi.fn()

// Mock IntersectionObserver
const mockIntersectionObserver = {
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn()
}

// Mock ResizeObserver
const mockResizeObserver = {
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}

describe('Performance Utils', () => {
    beforeEach(() => {
      startConsoleMonitoring()
      vi.clearAllMocks()
    })

    afterEach(() => {
      expectNoConsoleErrors()
      stopConsoleMonitoring()
    })
  beforeEach(() => {
    vi.stubGlobal('performance', mockPerformance)
    vi.stubGlobal('requestAnimationFrame', mockRequestAnimationFrame)
    vi.stubGlobal('cancelAnimationFrame', mockCancelAnimationFrame)
    vi.stubGlobal('IntersectionObserver', vi.fn().mockImplementation(() => mockIntersectionObserver))
    vi.stubGlobal('ResizeObserver', vi.fn().mockImplementation(() => mockResizeObserver))
    
    // Reset all mock functions
    Object.values(mockPerformance).forEach(value => {
      if (typeof value === 'function') {
        value.mockReset()
      }
    })
    
    mockRequestAnimationFrame.mockReset()
    mockCancelAnimationFrame.mockReset()
    Object.values(mockIntersectionObserver).forEach(value => {
      if (typeof value === 'function') {
        value.mockReset()
      }
    })
    Object.values(mockResizeObserver).forEach(value => {
      if (typeof value === 'function') {
        value.mockReset()
      }
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  describe('Timing Utilities', () => {
    describe('now', () => {
      it('should get current timestamp', () => {
        mockPerformance.now.mockReturnValue(1234.567)
        
        const result = performanceUtils.now()
        
        expect(mockPerformance.now).toHaveBeenCalled()
        expect(result).toBe(1234.567)
      })
    })

    describe('measureTime', () => {
      it('should measure execution time', () => {
        mockPerformance.now.mockReturnValueOnce(1000).mockReturnValueOnce(2000)
        
        const fn = vi.fn()
        const result = performanceUtils.measureTime(fn)
        
        expect(fn).toHaveBeenCalled()
        expect(result).toBe(1000)
      })

      it('should handle async function', async () => {
        mockPerformance.now.mockReturnValueOnce(1000).mockReturnValueOnce(2000)
        
        const asyncFn = vi.fn().mockResolvedValue('result')
        const result = await performanceUtils.measureTime(asyncFn)
        
        expect(asyncFn).toHaveBeenCalled()
        expect(result).toEqual({ time: 1000, result: 'result' })
      })
    })

    describe('debounce', () => {
      it('should debounce function calls', () => {
        vi.useFakeTimers()
        
        const fn = vi.fn()
        const debouncedFn = performanceUtils.debounce(fn, 100)
        
        debouncedFn()
        debouncedFn()
        debouncedFn()
        
        expect(fn).not.toHaveBeenCalled()
        
        vi.advanceTimersByTime(100)
        
        expect(fn).toHaveBeenCalledTimes(1)
        
        vi.useRealTimers()
      })

      it('should pass arguments to debounced function', () => {
        vi.useFakeTimers()
        
        const fn = vi.fn()
        const debouncedFn = performanceUtils.debounce(fn, 100)
        
        debouncedFn('arg1', 'arg2')
        
        vi.advanceTimersByTime(100)
        
        expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
        
        vi.useRealTimers()
      })
    })

    describe('throttle', () => {
      it('should throttle function calls', () => {
        vi.useFakeTimers()
        
        const fn = vi.fn()
        const throttledFn = performanceUtils.throttle(fn, 100)
        
        throttledFn()
        throttledFn()
        throttledFn()
        
        expect(fn).toHaveBeenCalledTimes(1)
        
        vi.advanceTimersByTime(100)
        
        throttledFn()
        
        expect(fn).toHaveBeenCalledTimes(2)
        
        vi.useRealTimers()
      })

      it('should pass arguments to throttled function', () => {
        vi.useFakeTimers()
        
        const fn = vi.fn()
        const throttledFn = performanceUtils.throttle(fn, 100)
        
        throttledFn('arg1', 'arg2')
        
        expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
        
        vi.useRealTimers()
      })
    })

    describe('delay', () => {
      it('should delay execution', async () => {
        vi.useFakeTimers()
        
        const fn = vi.fn()
        performanceUtils.delay(fn, 100)
        
        expect(fn).not.toHaveBeenCalled()
        
        vi.advanceTimersByTime(100)
        
        expect(fn).toHaveBeenCalled()
        
        vi.useRealTimers()
      })
    })

    describe('sleep', () => {
      it('should sleep for specified time', async () => {
        vi.useFakeTimers()
        
        const promise = performanceUtils.sleep(100)
        
        let resolved = false
        promise.then(() => {
          resolved = true
        })
        
        expect(resolved).toBe(false)
        
        vi.advanceTimersByTime(100)
        
        await promise
        
        expect(resolved).toBe(true)
        
        vi.useRealTimers()
      })
    })
  })

  describe('Performance Markers', () => {
    describe('mark', () => {
      it('should create performance mark', () => {
        performanceUtils.mark('test-mark')
        
        expect(mockPerformance.mark).toHaveBeenCalledWith('test-mark')
      })

      it('should create mark with options', () => {
        const options = { detail: 'test detail' }
        
        performanceUtils.mark('test-mark', options)
        
        expect(mockPerformance.mark).toHaveBeenCalledWith('test-mark', options)
      })
    })

    describe('measure', () => {
      it('should create performance measure', () => {
        performanceUtils.measure('test-measure', 'start-mark', 'end-mark')
        
        expect(mockPerformance.measure).toHaveBeenCalledWith('test-measure', 'start-mark', 'end-mark')
      })

      it('should create measure with options', () => {
        const options = { detail: 'test detail' }
        
        performanceUtils.measure('test-measure', 'start-mark', 'end-mark', options)
        
        expect(mockPerformance.measure).toHaveBeenCalledWith('test-measure', 'start-mark', 'end-mark', options)
      })
    })

    describe('clearMarks', () => {
      it('should clear all marks', () => {
        performanceUtils.clearMarks()
        
        expect(mockPerformance.clearMarks).toHaveBeenCalled()
      })

      it('should clear specific mark', () => {
        performanceUtils.clearMarks('test-mark')
        
        expect(mockPerformance.clearMarks).toHaveBeenCalledWith('test-mark')
      })
    })

    describe('clearMeasures', () => {
      it('should clear all measures', () => {
        performanceUtils.clearMeasures()
        
        expect(mockPerformance.clearMeasures).toHaveBeenCalled()
      })

      it('should clear specific measure', () => {
        performanceUtils.clearMeasures('test-measure')
        
        expect(mockPerformance.clearMeasures).toHaveBeenCalledWith('test-measure')
      })
    })

    describe('getMarks', () => {
      it('should get all marks', () => {
        const marks = [{ name: 'mark1' }, { name: 'mark2' }]
        mockPerformance.getEntriesByType.mockReturnValue(marks)
        
        const result = performanceUtils.getMarks()
        
        expect(mockPerformance.getEntriesByType).toHaveBeenCalledWith('mark')
        expect(result).toEqual(marks)
      })
    })

    describe('getMeasures', () => {
      it('should get all measures', () => {
        const measures = [{ name: 'measure1' }, { name: 'measure2' }]
        mockPerformance.getEntriesByType.mockReturnValue(measures)
        
        const result = performanceUtils.getMeasures()
        
        expect(mockPerformance.getEntriesByType).toHaveBeenCalledWith('measure')
        expect(result).toEqual(measures)
      })
    })
  })

  describe('Animation Frame', () => {
    describe('requestAnimationFrame', () => {
      it('should request animation frame', () => {
        const callback = vi.fn()
        
        performanceUtils.requestAnimationFrame(callback)
        
        expect(mockRequestAnimationFrame).toHaveBeenCalledWith(callback)
      })
    })

    describe('cancelAnimationFrame', () => {
      it('should cancel animation frame', () => {
        const id = 123
        
        performanceUtils.cancelAnimationFrame(id)
        
        expect(mockCancelAnimationFrame).toHaveBeenCalledWith(id)
      })
    })

    describe('animate', () => {
      it('should create animation loop', () => {
        const callback = vi.fn()
        const cancelSpy = vi.spyOn(performanceUtils, 'cancelAnimationFrame')
        
        const cancel = performanceUtils.animate(callback)
        
        expect(typeof cancel).toBe('function')
        
        cancel()
        
        expect(cancelSpy).toHaveBeenCalled()
      })
    })
  })

  describe('Intersection Observer', () => {
    describe('createIntersectionObserver', () => {
      it('should create intersection observer', () => {
        const callback = vi.fn()
        const options = { threshold: 0.5 }
        
        const observer = performanceUtils.createIntersectionObserver(callback, options)
        
        expect(observer).toBeDefined()
      })
    })

    describe('observeElement', () => {
      it('should observe element with intersection observer', () => {
        const element = document.createElement('div')
        const callback = vi.fn()
        
        performanceUtils.observeElement(element, callback)
        
        expect(mockIntersectionObserver.observe).toHaveBeenCalledWith(element)
      })
    })

    describe('unobserveElement', () => {
      it('should unobserve element from intersection observer', () => {
        const element = document.createElement('div')
        
        performanceUtils.unobserveElement(element)
        
        expect(mockIntersectionObserver.unobserve).toHaveBeenCalledWith(element)
      })
    })
  })

  describe('Resize Observer', () => {
    describe('createResizeObserver', () => {
      it('should create resize observer', () => {
        const callback = vi.fn()
        
        const observer = performanceUtils.createResizeObserver(callback)
        
        expect(observer).toBeDefined()
      })
    })

    describe('observeResize', () => {
      it('should observe element resize', () => {
        const element = document.createElement('div')
        const callback = vi.fn()
        
        performanceUtils.observeResize(element, callback)
        
        expect(mockResizeObserver.observe).toHaveBeenCalledWith(element)
      })
    })

    describe('unobserveResize', () => {
      it('should unobserve element resize', () => {
        const element = document.createElement('div')
        
        performanceUtils.unobserveResize(element)
        
        expect(mockResizeObserver.unobserve).toHaveBeenCalledWith(element)
      })
    })
  })

  describe('Memory Management', () => {
    describe('getMemoryInfo', () => {
      it('should get memory information', () => {
        mockPerformance.memory = {
          usedJSHeapSize: 1024 * 1024 * 10, // 10MB
          totalJSHeapSize: 1024 * 1024 * 50, // 50MB
          jsHeapSizeLimit: 1024 * 1024 * 100 // 100MB
        }
        
        const result = performanceUtils.getMemoryInfo()
        
        expect(result).toEqual({
          used: 1024 * 1024 * 10,
          total: 1024 * 1024 * 50,
          limit: 1024 * 1024 * 100,
          usedMB: 10,
          totalMB: 50,
          limitMB: 100,
          usagePercentage: 20
        })
      })

      it('should handle when memory info is not available', () => {
        mockPerformance.memory = undefined
        
        const result = performanceUtils.getMemoryInfo()
        
        expect(result).toBeNull()
      })
    })

    describe('getMemoryUsage', () => {
      it('should get memory usage percentage', () => {
        mockPerformance.memory = {
          usedJSHeapSize: 1024 * 1024 * 10,
          totalJSHeapSize: 1024 * 1024 * 50,
          jsHeapSizeLimit: 1024 * 1024 * 100
        }
        
        const result = performanceUtils.getMemoryUsage()
        
        expect(result).toBe(20) // 10MB / 50MB * 100
      })

      it('should return 0 if memory info is not available', () => {
        mockPerformance.memory = undefined
        
        const result = performanceUtils.getMemoryUsage()
        
        expect(result).toBe(0)
      })
    })

    describe('isMemoryUsageHigh', () => {
      it('should return true if memory usage is high', () => {
        mockPerformance.memory = {
          usedJSHeapSize: 1024 * 1024 * 45,
          totalJSHeapSize: 1024 * 1024 * 50,
          jsHeapSizeLimit: 1024 * 1024 * 100
        }
        
        const result = performanceUtils.isMemoryUsageHigh(80)
        
        expect(result).toBe(true)
      })

      it('should return false if memory usage is low', () => {
        mockPerformance.memory = {
          usedJSHeapSize: 1024 * 1024 * 10,
          totalJSHeapSize: 1024 * 1024 * 50,
          jsHeapSizeLimit: 1024 * 1024 * 100
        }
        
        const result = performanceUtils.isMemoryUsageHigh(80)
        
        expect(result).toBe(false)
      })
    })
  })

  describe('Performance Monitoring', () => {
    describe('startMonitoring', () => {
      it('should start performance monitoring', () => {
        const callback = vi.fn()
        
        performanceUtils.startMonitoring(callback)
        
        expect(callback).toHaveBeenCalled()
      })
    })

    describe('stopMonitoring', () => {
      it('should stop performance monitoring', () => {
        performanceUtils.stopMonitoring()
        
        // This test mainly ensures the function doesn't throw
        expect(true).toBe(true)
      })
    })

    describe('getPerformanceMetrics', () => {
      it('should get performance metrics', () => {
        const metrics = {
          timing: {
            loadTime: 1000,
            domReadyTime: 500,
            firstPaint: 200
          },
          memory: {
            used: 1024 * 1024 * 10,
            total: 1024 * 1024 * 50
          },
          navigation: {
            type: 'navigate',
            redirectCount: 0
          }
        }
        
        mockPerformance.timing = {
          loadEventEnd: 1000,
          navigationStart: 0,
          domContentLoadedEventEnd: 500,
          responseEnd: 200
        }
        
        mockPerformance.memory = {
          usedJSHeapSize: 1024 * 1024 * 10,
          totalJSHeapSize: 1024 * 1024 * 50,
          jsHeapSizeLimit: 1024 * 1024 * 100
        }
        
        mockPerformance.navigation = {
          type: 'navigate',
          redirectCount: 0
        }
        
        const result = performanceUtils.getPerformanceMetrics()
        
        expect(result).toBeDefined()
        expect(result.timing).toBeDefined()
        expect(result.memory).toBeDefined()
        expect(result.navigation).toBeDefined()
      })
    })

    describe('logPerformanceMetrics', () => {
      it('should log performance metrics', () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
        
        performanceUtils.logPerformanceMetrics()
        
        expect(consoleSpy).toHaveBeenCalled()
        
        consoleSpy.mockRestore()
      })
    })
  })

  describe('Resource Loading', () => {
    describe('preloadResource', () => {
      it('should preload resource', () => {
        const link = document.createElement('link')
        const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(link)
        const appendChildSpy = vi.spyOn(document.head, 'appendChild').mockImplementation(() => {})
        
        performanceUtils.preloadResource('https://example.com/style.css', 'style')
        
        expect(createElementSpy).toHaveBeenCalledWith('link')
        expect(appendChildSpy).toHaveBeenCalledWith(link)
        
        createElementSpy.mockRestore()
        appendChildSpy.mockRestore()
      })
    })

    describe('prefetchResource', () => {
      it('should prefetch resource', () => {
        const link = document.createElement('link')
        const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(link)
        const appendChildSpy = vi.spyOn(document.head, 'appendChild').mockImplementation(() => {})
        
        performanceUtils.prefetchResource('https://example.com/page.html')
        
        expect(createElementSpy).toHaveBeenCalledWith('link')
        expect(appendChildSpy).toHaveBeenCalledWith(link)
        
        createElementSpy.mockRestore()
        appendChildSpy.mockRestore()
      })
    })

    describe('loadResource', () => {
      it('should load script resource', async () => {
        const script = document.createElement('script')
        const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(script)
        const appendChildSpy = vi.spyOn(document.head, 'appendChild').mockImplementation(() => {
          setTimeout(() => {
            script.onload?.({} as Event)
          }, 10)
        })
        
        const promise = performanceUtils.loadResource('https://example.com/script.js', 'script')
        
        expect(createElementSpy).toHaveBeenCalledWith('script')
        expect(appendChildSpy).toHaveBeenCalledWith(script)
        
        await promise
        
        createElementSpy.mockRestore()
        appendChildSpy.mockRestore()
      })
    })
  })

  describe('Performance Optimization', () => {
    describe('optimizeImages', () => {
      it('should optimize images', () => {
        const images = document.querySelectorAll('img')
        const querySelectorAllSpy = vi.spyOn(document, 'querySelectorAll').mockReturnValue([] as any)
        
        performanceUtils.optimizeImages()
        
        expect(querySelectorAllSpy).toHaveBeenCalledWith('img')
        
        querySelectorAllSpy.mockRestore()
      })
    })

    describe('lazyLoadImages', () => {
      it('should lazy load images', () => {
        const images = document.querySelectorAll('img[data-src]')
        const querySelectorAllSpy = vi.spyOn(document, 'querySelectorAll').mockReturnValue([] as any)
        
        performanceUtils.lazyLoadImages()
        
        expect(querySelectorAllSpy).toHaveBeenCalledWith('img[data-src]')
        
        querySelectorAllSpy.mockRestore()
      })
    })

    describe('deferScripts', () => {
      it('should defer script execution', () => {
        const scripts = document.querySelectorAll('script')
        const querySelectorAllSpy = vi.spyOn(document, 'querySelectorAll').mockReturnValue([] as any)
        
        performanceUtils.deferScripts()
        
        expect(querySelectorAllSpy).toHaveBeenCalledWith('script')
        
        querySelectorAllSpy.mockRestore()
      })
    })

    describe('minifyResources', () => {
      it('should minify resources', () => {
        // This is a placeholder test as minification is complex
        const result = performanceUtils.minifyResources(['style.css', 'script.js'])
        
        expect(Array.isArray(result)).toBe(true)
      })
    })
  })

  describe('Performance Profiling', () => {
    describe('startProfile', () => {
      it('should start performance profile', () => {
        const result = performanceUtils.startProfile('test-profile')
        
        expect(result).toBeDefined()
        expect(typeof result).toBe('object')
      })
    })

    describe('endProfile', () => {
      it('should end performance profile', () => {
        const profile = performanceUtils.startProfile('test-profile')
        const result = performanceUtils.endProfile(profile)
        
        expect(result).toBeDefined()
        expect(result.name).toBe('test-profile')
      })
    })

    describe('getProfileResults', () => {
      it('should get profile results', () => {
        const profile = performanceUtils.startProfile('test-profile')
        performanceUtils.endProfile(profile)
        
        const result = performanceUtils.getProfileResults(profile)
        
        expect(result).toBeDefined()
      })
    })
  })
})