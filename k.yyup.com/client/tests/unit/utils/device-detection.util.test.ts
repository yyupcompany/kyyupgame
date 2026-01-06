
vi.mock('../../../src/utils/device-detection', () => ({
  default: {},
  getDeviceInfo: vi.fn(() => ({ type: 'pc', os: 'windows' })),
  getDeviceType: vi.fn(() => 'pc')
}))

vi.mock('@/utils/device-detection', () => ({
  default: {},
  getDeviceInfo: vi.fn(() => ({ type: 'pc', os: 'windows' })),
  getDeviceType: vi.fn(() => 'pc')
}))

/**
 * 设备检测工具函数测试
 * 测试文件: /home/zhgue/yyupcc/k.yyup.com/client/src/utils/device-detection.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import { vi } from 'vitest'
import {
  getDeviceInfo,
  isMobileDevice,
  isPcDevice,
  setForceDesktopMode,
  isForceDesktopMode,
  getDeviceType,
  getDeviceBasedRoute,
  createDeviceRedirectMiddleware,
  useDeviceDetection
} from '@/utils/device-detection'

// Mock DOM APIs
const mockNavigator = {
  userAgent: '',
  maxTouchPoints: 0
}

const mockWindow = {
  innerWidth: 1920,
  innerHeight: 1080,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  location: {
    search: '',
    href: 'http://localhost:3000/'
  }
}

const mockDocument = {
  documentElement: {
    clientWidth: 1920,
    clientHeight: 1080
  }
}

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

// Mock console
const consoleMock = {
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn()
}

// 控制台错误检测变量
let consoleSpy: any

describe('Device Detection Utility', () => {
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
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup mocks
    Object.defineProperty(global, 'navigator', {
      value: mockNavigator,
      writable: true,
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    Object.defineProperty(global, 'window', {
      value: mockWindow,
      writable: true,
    })
    
    Object.defineProperty(global, 'document', {
      value: mockDocument,
      writable: true,
    })
    
    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    })
    
    Object.defineProperty(global, 'console', {
      value: consoleMock,
      writable: true,
    })
    
    // Reset default values
    mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    mockWindow.innerWidth = 1920
    mockWindow.innerHeight = 1080
    mockWindow.location.search = ''
    mockDocument.documentElement.clientWidth = 1920
    mockDocument.documentElement.clientHeight = 1080
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('getDeviceInfo', () => {
    it('应该正确检测PC设备', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      mockWindow.innerWidth = 1920
      mockWindow.innerHeight = 1080
      
      const deviceInfo = getDeviceInfo()
      
      expect(deviceInfo.isMobile).toBe(false)
      expect(deviceInfo.isTablet).toBe(false)
      expect(deviceInfo.isPc).toBe(true)
      expect(deviceInfo.isIos).toBe(false)
      expect(deviceInfo.isAndroid).toBe(false)
      expect(deviceInfo.screenWidth).toBe(1920)
      expect(deviceInfo.screenHeight).toBe(1080)
    })

    it('应该正确检测iOS移动设备', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      mockWindow.innerWidth = 375
      mockWindow.innerHeight = 812
      
      const deviceInfo = getDeviceInfo()
      
      expect(deviceInfo.isMobile).toBe(true)
      expect(deviceInfo.isTablet).toBe(false)
      expect(deviceInfo.isPc).toBe(false)
      expect(deviceInfo.isIos).toBe(true)
      expect(deviceInfo.isAndroid).toBe(false)
      expect(deviceInfo.screenWidth).toBe(375)
      expect(deviceInfo.screenHeight).toBe(812)
    })

    it('应该正确检测Android移动设备', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36'
      mockWindow.innerWidth = 412
      mockWindow.innerHeight = 915
      
      const deviceInfo = getDeviceInfo()
      
      expect(deviceInfo.isMobile).toBe(true)
      expect(deviceInfo.isTablet).toBe(false)
      expect(deviceInfo.isPc).toBe(false)
      expect(deviceInfo.isIos).toBe(false)
      expect(deviceInfo.isAndroid).toBe(true)
      expect(deviceInfo.screenWidth).toBe(412)
      expect(deviceInfo.screenHeight).toBe(915)
    })

    it('应该正确检测iPad平板设备', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      mockWindow.innerWidth = 768
      mockWindow.innerHeight = 1024
      
      const deviceInfo = getDeviceInfo()
      
      expect(deviceInfo.isMobile).toBe(false)
      expect(deviceInfo.isTablet).toBe(true)
      expect(deviceInfo.isPc).toBe(false)
      expect(deviceInfo.isIos).toBe(true)
      expect(deviceInfo.isAndroid).toBe(false)
    })

    it('应该正确检测Android平板设备', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Linux; Android 11; Nexus 10) AppleWebKit/537.36'
      mockWindow.innerWidth = 800
      mockWindow.innerHeight = 1280
      
      const deviceInfo = getDeviceInfo()
      
      expect(deviceInfo.isMobile).toBe(false)
      expect(deviceInfo.isTablet).toBe(true)
      expect(deviceInfo.isPc).toBe(false)
      expect(deviceInfo.isIos).toBe(false)
      expect(deviceInfo.isAndroid).toBe(true)
    })

    it('应该通过屏幕尺寸和触摸支持检测平板', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Linux; Android 11; SM-X900) AppleWebKit/537.36'
      mockWindow.innerWidth = 800
      mockWindow.innerHeight = 1200
      mockNavigator.maxTouchPoints = 5
      
      const deviceInfo = getDeviceInfo()
      
      expect(deviceInfo.isTablet).toBe(true)
    })

    it('应该正确检测Windows Phone', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows Phone 10.0; Android 6.0.1; Microsoft; Lumia 950) AppleWebKit/537.36'
      mockWindow.innerWidth = 360
      mockWindow.innerHeight = 640
      
      const deviceInfo = getDeviceInfo()
      
      expect(deviceInfo.isMobile).toBe(true)
      expect(deviceInfo.isTablet).toBe(false)
      expect(deviceInfo.isPc).toBe(false)
    })

    it('应该正确检测BlackBerry', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (BB10; Touch) AppleWebKit/537.10+'
      mockWindow.innerWidth = 720
      mockWindow.innerHeight = 720
      
      const deviceInfo = getDeviceInfo()
      
      expect(deviceInfo.isMobile).toBe(true)
      expect(deviceInfo.isTablet).toBe(false)
      expect(deviceInfo.isPc).toBe(false)
    })

    it('应该记录调试信息', () => {
      getDeviceInfo()
      
      expect(consoleMock.log).toHaveBeenCalledWith(
        '🔍 设备检测详情:',
        expect.objectContaining({
          userAgent: expect.any(String),
          screenWidth: expect.any(Number),
          screenHeight: expect.any(Number),
          isMobileByUA: expect.any(Boolean),
          isDesktopBrowser: expect.any(Boolean),
          isMobile: expect.any(Boolean),
          isTablet: expect.any(Boolean),
          isPc: expect.any(Boolean)
        })
      )
    })

    it('应该处理没有innerWidth的情况', () => {
      mockWindow.innerWidth = undefined as any
      
      const deviceInfo = getDeviceInfo()
      
      expect(deviceInfo.screenWidth).toBe(1920) // 使用documentElement.clientWidth
    })

    it('应该处理没有innerHeight的情况', () => {
      mockWindow.innerHeight = undefined as any
      
      const deviceInfo = getDeviceInfo()
      
      expect(deviceInfo.screenHeight).toBe(1080) // 使用documentElement.clientHeight
    })
  })

  describe('isMobileDevice', () => {
    it('应该为移动设备返回true', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      mockWindow.innerWidth = 375
      
      expect(isMobileDevice()).toBe(true)
    })

    it('应该为平板设备返回true', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      mockWindow.innerWidth = 768
      
      expect(isMobileDevice()).toBe(true)
    })

    it('应该为PC设备返回false', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      mockWindow.innerWidth = 1920
      
      expect(isMobileDevice()).toBe(false)
    })
  })

  describe('isPcDevice', () => {
    it('应该为PC设备返回true', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      mockWindow.innerWidth = 1920
      
      expect(isPcDevice()).toBe(true)
    })

    it('应该为移动设备返回false', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      mockWindow.innerWidth = 375
      
      expect(isPcDevice()).toBe(false)
    })

    it('应该为平板设备返回false', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      mockWindow.innerWidth = 768
      
      expect(isPcDevice()).toBe(false)
    })
  })

  describe('Force Desktop Mode', () => {
    describe('setForceDesktopMode', () => {
      it('应该能够启用强制桌面模式', () => {
        setForceDesktopMode(true)
        
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('forceDesktop', 'true')
        expect(consoleMock.log).toHaveBeenCalledWith('🖥️ 已启用强制桌面模式')
      })

      it('应该能够禁用强制桌面模式', () => {
        setForceDesktopMode(false)
        
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('forceDesktop')
        expect(consoleMock.log).toHaveBeenCalledWith('📱 已禁用强制桌面模式')
      })

      it('应该处理localStorage错误', () => {
        mockLocalStorage.setItem.mockImplementation(() => {
          throw new Error('Storage error')
        })
        
        expect(() => {
          setForceDesktopMode(true)
        }).not.toThrow()
        
        expect(consoleMock.warn).toHaveBeenCalledWith(
          '⚠️ 无法设置强制桌面模式:',
          expect.any(Error)
        )
      })
    })

    describe('isForceDesktopMode', () => {
      it('应该通过URL参数检测强制桌面模式', () => {
        mockWindow.location.search = '?forceDesktop=1'
        
        expect(isForceDesktopMode()).toBe(true)
      })

      it('应该通过localStorage检测强制桌面模式', () => {
        mockLocalStorage.getItem.mockReturnValue('true')
        
        expect(isForceDesktopMode()).toBe(true)
      })

      it('应该在URL参数优先于localStorage', () => {
        mockWindow.location.search = '?forceDesktop=1'
        mockLocalStorage.getItem.mockReturnValue('false')
        
        expect(isForceDesktopMode()).toBe(true)
      })

      it('应该在没有设置时返回false', () => {
        mockWindow.location.search = ''
        mockLocalStorage.getItem.mockReturnValue(null)
        
        expect(isForceDesktopMode()).toBe(false)
      })

      it('应该处理URL解析错误', () => {
        mockWindow.location.search = 'invalid-url'
        
        expect(isForceDesktopMode()).toBe(false)
      })

      it('应该处理localStorage访问错误', () => {
        mockLocalStorage.getItem.mockImplementation(() => {
          throw new Error('Storage error')
        })
        
        expect(isForceDesktopMode()).toBe(false)
      })
    })
  })

  describe('getDeviceType', () => {
    it('应该在强制桌面模式下返回pc', () => {
      mockLocalStorage.getItem.mockReturnValue('true')
      
      expect(getDeviceType()).toBe('pc')
      expect(consoleMock.log).toHaveBeenCalledWith('🖥️ 强制桌面模式已启用')
    })

    it('应该为移动设备返回mobile', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      mockWindow.innerWidth = 375
      
      expect(getDeviceType()).toBe('mobile')
    })

    it('应该为平板设备返回tablet', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      mockWindow.innerWidth = 768
      
      expect(getDeviceType()).toBe('tablet')
    })

    it('应该为PC设备返回pc', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      mockWindow.innerWidth = 1920
      
      expect(getDeviceType()).toBe('pc')
    })
  })

  describe('getDeviceBasedRoute', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockReturnValue(null)
      mockWindow.location.search = ''
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    it('应该在强制桌面模式下返回原始路径', () => {
      mockLocalStorage.getItem.mockReturnValue('true')
      
      expect(getDeviceBasedRoute('/mobile/dashboard')).toBe('/mobile/dashboard')
      expect(consoleMock.log).toHaveBeenCalledWith('🖥️ 强制桌面模式，跳过移动端重定向')
    })

    it('应该为PC设备返回原始路径', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      mockWindow.innerWidth = 1920
      
      expect(getDeviceBasedRoute('/dashboard')).toBe('/dashboard')
    })

    it('应该为移动设备重定向到移动端路由', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      mockWindow.innerWidth = 375
      
      expect(getDeviceBasedRoute('/dashboard')).toBe('/mobile')
      expect(getDeviceBasedRoute('/login')).toBe('/mobile/login')
      expect(getDeviceBasedRoute('/student')).toBe('/mobile')
      expect(getDeviceBasedRoute('/ai')).toBe('/mobile')
    })

    it('应该为平板设备重定向到移动端路由', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      mockWindow.innerWidth = 768
      
      expect(getDeviceBasedRoute('/dashboard')).toBe('/mobile')
    })

    it('应该保持已有的移动端路由不变', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      mockWindow.innerWidth = 375
      
      expect(getDeviceBasedRoute('/mobile')).toBe('/mobile')
      expect(getDeviceBasedRoute('/mobile/login')).toBe('/mobile/login')
    })

    it('应该处理动态路由映射', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      mockWindow.innerWidth = 375
      
      expect(getDeviceBasedRoute('/student/detail/123')).toBe('/mobile/students/123')
      expect(getDeviceBasedRoute('/class/detail/456')).toBe('/mobile/classes/456')
      expect(getDeviceBasedRoute('/teacher/detail/789')).toBe('/mobile/teachers/789')
      expect(getDeviceBasedRoute('/activity/detail/101')).toBe('/mobile/activities/101')
      expect(getDeviceBasedRoute('/parent/202')).toBe('/mobile/children/202')
    })

    it('应该为PC设备处理移动端路由的逆向映射', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      mockWindow.innerWidth = 1920
      
      expect(getDeviceBasedRoute('/mobile/dashboard')).toBe('/dashboard')
      expect(getDeviceBasedRoute('/mobile/ai')).toBe('/ai')
      expect(getDeviceBasedRoute('/mobile/students')).toBe('/student')
      expect(getDeviceBasedRoute('/mobile/classes')).toBe('/class')
    })

    it('应该在forceMobile参数下保持移动端路由', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      mockWindow.innerWidth = 1920
      mockWindow.location.search = '?forceMobile=1'
      
      expect(getDeviceBasedRoute('/mobile/dashboard')).toBe('/mobile/dashboard')
    })

    it('应该为没有匹配的路由提供默认重定向', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      mockWindow.innerWidth = 375
      
      expect(getDeviceBasedRoute('/unknown/route')).toBe('/mobile/dashboard')
    })

    it('应该为PC设备处理没有匹配的移动端路由', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      mockWindow.innerWidth = 1920
      
      expect(getDeviceBasedRoute('/mobile/unknown')).toBe('/dashboard')
    })
  })

  describe('createDeviceRedirectMiddleware', () => {
    it('应该创建设备重定向中间件', () => {
      const middleware = createDeviceRedirectMiddleware()
      
      expect(typeof middleware).toBe('function')
    })

    it('应该正确处理设备重定向', () => {
      const middleware = createDeviceRedirectMiddleware()
      const to = { path: '/dashboard' }
      const from = { path: '/' }
      const next = vi.fn()
      
      // Mock移动设备
      mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      mockWindow.innerWidth = 375
      
      middleware(to, from, next)
      
      expect(consoleMock.log).toHaveBeenCalledWith('🔍 设备检测: / -> /dashboard')
      expect(consoleMock.log).toHaveBeenCalledWith('📱 设备类型: mobile')
      expect(consoleMock.log).toHaveBeenCalledWith('🎯 目标路径: /dashboard -> /mobile')
      expect(consoleMock.log).toHaveBeenCalledWith('🔀 设备重定向: /dashboard -> /mobile')
      expect(next).toHaveBeenCalledWith({ path: '/mobile', replace: true })
    })

    it('应该在不需要重定向时直接调用next', () => {
      const middleware = createDeviceRedirectMiddleware()
      const to = { path: '/dashboard' }
      const from = { path: '/' }
      const next = vi.fn()
      
      // Mock PC设备
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      mockWindow.innerWidth = 1920
      
      middleware(to, from, next)
      
      expect(consoleMock.log).toHaveBeenCalledWith('🔍 设备检测: / -> /dashboard')
      expect(consoleMock.log).toHaveBeenCalledWith('📱 设备类型: pc')
      expect(consoleMock.log).toHaveBeenCalledWith('🎯 目标路径: /dashboard -> /dashboard')
      expect(next).toHaveBeenCalledWith()
    })
  })

  describe('useDeviceDetection', () => {
    it('应该在服务端渲染环境下提供降级处理', () => {
      // Mock服务端环境
      const originalWindow = global.window
      delete (global as any).window
      
      const result = useDeviceDetection()
      
      expect(result.deviceInfo.isMobile).toBe(false)
      expect(result.deviceInfo.isTablet).toBe(false)
      expect(result.deviceInfo.isPc).toBe(true)
      expect(result.isMobile).toBe(false)
      expect(result.isPc).toBe(true)
      expect(result.deviceType).toBe('pc')
      expect(typeof result.getDeviceBasedRoute).toBe('function')
      expect(typeof result.cleanup).toBe('function')
      
      // 恢复window
      global.window = originalWindow
    })

    it('应该在客户端环境下提供完整的设备检测功能', () => {
      const result = useDeviceDetection()
      
      expect(result.deviceInfo).toBeDefined()
      expect(typeof result.isMobile).toBe('boolean')
      expect(typeof result.isPc).toBe('boolean')
      expect(['mobile', 'tablet', 'pc']).toContain(result.deviceType)
      expect(typeof result.getDeviceBasedRoute).toBe('function')
      expect(typeof result.cleanup).toBe('function')
    })

    it('应该添加事件监听器', () => {
      useDeviceDetection()
      
      expect(mockWindow.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
      expect(mockWindow.addEventListener).toHaveBeenCalledWith('orientationchange', expect.any(Function))
    })

    it('应该提供清理函数', () => {
      const result = useDeviceDetection()
      
      expect(typeof result.cleanup).toBe('function')
      
      // 调用清理函数
      result.cleanup()
      
      expect(mockWindow.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
      expect(mockWindow.removeEventListener).toHaveBeenCalledWith('orientationchange', expect.any(Function))
    })
  })

  describe('边界条件', () => {
    it('应该处理空的userAgent', () => {
      mockNavigator.userAgent = ''
      
      const deviceInfo = getDeviceInfo()
      
      expect(deviceInfo.isMobile).toBe(false)
      expect(deviceInfo.isTablet).toBe(false)
      expect(deviceInfo.isPc).toBe(true)
    })

    it('应该处理未定义的window对象', () => {
      const originalWindow = global.window
      delete (global as any).window
      
      expect(() => {
        getDeviceType()
      }).not.toThrow()
      
      // 恢复window
      global.window = originalWindow
    })

    it('应该处理未定义的navigator对象', () => {
      const originalNavigator = global.navigator
      delete (global as any).navigator
      
      expect(() => {
        getDeviceInfo()
      }).not.toThrow()
      
      // 恢复navigator
      global.navigator = originalNavigator
    })

    it('应该处理极小的屏幕尺寸', () => {
      mockWindow.innerWidth = 1
      mockWindow.innerHeight = 1
      
      const deviceInfo = getDeviceInfo()
      
      expect(deviceInfo.screenWidth).toBe(1)
      expect(deviceInfo.screenHeight).toBe(1)
    })

    it('应该处理极大的屏幕尺寸', () => {
      mockWindow.innerWidth = 10000
      mockWindow.innerHeight = 10000
      
      const deviceInfo = getDeviceInfo()
      
      expect(deviceInfo.screenWidth).toBe(10000)
      expect(deviceInfo.screenHeight).toBe(10000)
    })
  })

  describe('性能测试', () => {
    it('应该能够快速检测设备信息', () => {
      const iterations = 1000
      
      const startTime = performance.now()
      
      for (let i = 0; i < iterations; i++) {
        getDeviceInfo()
      }
      
      const endTime = performance.now()
      const avgTime = (endTime - startTime) / iterations
      
      // 平均检测时间应该小于0.1ms
      expect(avgTime).toBeLessThan(0.1)
    })

    it('应该能够快速获取设备类型', () => {
      const iterations = 1000
      
      const startTime = performance.now()
      
      for (let i = 0; i < iterations; i++) {
        getDeviceType()
      }
      
      const endTime = performance.now()
      const avgTime = (endTime - startTime) / iterations
      
      // 平均获取时间应该小于0.05ms
      expect(avgTime).toBeLessThan(0.05)
    })

    it('应该能够快速进行路由映射', () => {
      const iterations = 1000
      const testPaths = ['/dashboard', '/student/detail/123', '/mobile/dashboard']
      
      const startTime = performance.now()
      
      for (let i = 0; i < iterations; i++) {
        testPaths.forEach(path => getDeviceBasedRoute(path))
      }
      
      const endTime = performance.now()
      const avgTime = (endTime - startTime) / (iterations * testPaths.length)
      
      // 平均映射时间应该小于0.01ms
      expect(avgTime).toBeLessThan(0.01)
    })
  })

  describe('集成测试', () => {
    it('应该能够在设备类型变化时正确响应', () => {
      // 初始为PC设备
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      mockWindow.innerWidth = 1920
      
      expect(getDeviceType()).toBe('pc')
      expect(getDeviceBasedRoute('/dashboard')).toBe('/dashboard')
      
      // 切换为移动设备
      mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      mockWindow.innerWidth = 375
      
      expect(getDeviceType()).toBe('mobile')
      expect(getDeviceBasedRoute('/dashboard')).toBe('/mobile')
    })

    it('应该能够在强制桌面模式下覆盖设备检测', () => {
      // 设置为移动设备
      mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      mockWindow.innerWidth = 375
      
      expect(getDeviceType()).toBe('mobile')
      
      // 启用强制桌面模式
      mockLocalStorage.getItem.mockReturnValue('true')
      
      expect(getDeviceType()).toBe('pc')
      expect(getDeviceBasedRoute('/dashboard')).toBe('/dashboard')
    })

    it('应该能够正确处理中间件流程', () => {
      const middleware = createDeviceRedirectMiddleware()
      const to = { path: '/dashboard' }
      const from = { path: '/' }
      const next = vi.fn()
      
      // 测试移动设备重定向
      mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      mockWindow.innerWidth = 375
      
      middleware(to, from, next)
      
      expect(next).toHaveBeenCalledWith({ path: '/mobile', replace: true })
    })
  })
})

describe('Device Detection Security Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        maxTouchPoints: 0
      },
      writable: true,
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    Object.defineProperty(global, 'window', {
      value: {
        innerWidth: 1920,
        innerHeight: 1080,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        location: {
          search: '',
          href: 'http://localhost:3000/'
        }
      },
      writable: true,
    })
    
    Object.defineProperty(global, 'document', {
      value: {
        documentElement: {
          clientWidth: 1920,
          clientHeight: 1080
        }
      },
      writable: true,
    })
    
    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      },
      writable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('应该防止userAgent注入攻击', () => {
    const maliciousUserAgent = '<script>alert("xss")</script>'
    
    // 不应该抛出错误，应该安全处理
    expect(() => {
      navigator.userAgent = maliciousUserAgent
      getDeviceInfo()
    }).not.toThrow()
    
    // 验证恶意脚本没有被执行
    expect(document.documentElement.setAttribute).not.toHaveBeenCalled()
  })

  it('应该防止URL参数注入攻击', () => {
    const maliciousUrl = '?forceDesktop=1<script>alert("xss")</script>'
    
    window.location.search = maliciousUrl
    
    // 不应该抛出错误，应该安全处理
    expect(() => {
      isForceDesktopMode()
    }).not.toThrow()
  })

  it('应该防止localStorage数据篡改', () => {
    const maliciousData = JSON.stringify({
      forceDesktop: true,
      malicious: '<script>alert("xss")</script>'
    })
    
    localStorage.getItem.mockReturnValue(maliciousData)
    
    // 不应该抛出错误，应该安全处理
    expect(() => {
      isForceDesktopMode()
    }).not.toThrow()
  })

  it('应该防止路由路径注入攻击', () => {
    const maliciousPath = '/dashboard<script>alert("xss")</script>'
    
    // 不应该抛出错误，应该安全处理
    expect(() => {
      getDeviceBasedRoute(maliciousPath)
    }).not.toThrow()
  })

  it('应该验证路由路径的合法性', () => {
    const invalidPaths = [
      '/dashboard/../../../etc/passwd',
      '/dashboard/..\\..\\..\\windows\\system32',
      '/dashboard/javascript:alert("xss")',
      '/dashboard/data:text/html,<script>alert("xss")</script>'
    ]
    
    invalidPaths.forEach(path => {
      // 不应该抛出错误，应该安全处理
      expect(() => {
        getDeviceBasedRoute(path)
      }).not.toThrow()
    })
  })

  it('应该防止事件监听器滥用', () => {
    const result = useDeviceDetection()
    
    // 验证事件监听器被正确添加
    expect(window.addEventListener).toHaveBeenCalledTimes(2)
    
    // 清理应该正确移除监听器
    result.cleanup()
    
    expect(window.removeEventListener).toHaveBeenCalledTimes(2)
  })

  it('应该处理内存攻击', () => {
    // 模拟大量设备检测调用
    const iterations = 10000
    
    expect(() => {
      for (let i = 0; i < iterations; i++) {
        getDeviceInfo()
        getDeviceType()
        getDeviceBasedRoute('/dashboard')
      }
    }).not.toThrow()
  })
})