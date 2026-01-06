/**
 * 主题工具函数测试
 * 测试文件: /home/zhgue/yyupcc/k.yyup.com/client/src/utils/theme.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import { vi } from 'vitest'
import { 
  currentTheme, 
  setTheme, 
  initTheme, 
  toggleTheme, 
  getThemeName, 
  isDarkMode,
  type ThemeType 
} from '@/utils/theme'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
}

// Mock DOM APIs
const mockDocument = {
  documentElement: {
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      toggle: vi.fn(),
      contains: vi.fn(),
    },
    setAttribute: vi.fn(),
    removeAttribute: vi.fn(),
    getAttribute: vi.fn(),
  },
  body: {
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      toggle: vi.fn(),
      contains: vi.fn(),
    },
    setAttribute: vi.fn(),
    removeAttribute: vi.fn(),
    getAttribute: vi.fn(),
    style: {},
  },
  querySelectorAll: vi.fn(),
  dispatchEvent: vi.fn(),
}

const mockWindow = {
  dispatchEvent: vi.fn(),
}

// Mock console
const consoleMock = {
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
}

// Mock process
const processMock = {
  env: {
    NODE_ENV: 'test'
  }
}

// 控制台错误检测变量
let consoleSpy: any

describe('Theme Utility', () => {
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
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    Object.defineProperty(window, 'document', {
      value: mockDocument,
      writable: true,
    })
    
    Object.defineProperty(window, 'window', {
      value: mockWindow,
      writable: true,
    })
    
    Object.defineProperty(global, 'console', {
      value: consoleMock,
      writable: true,
    })
    
    Object.defineProperty(global, 'process', {
      value: processMock,
      writable: true,
    })
    
    // Reset mock values
    localStorageMock.getItem.mockReturnValue(null)
    mockDocument.documentElement.classList.contains.mockReturnValue(false)
    mockDocument.documentElement.getAttribute.mockReturnValue(null)
    mockDocument.querySelectorAll.mockReturnValue([])
    mockDocument.body.style.display = ''
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

  describe('currentTheme', () => {
    it('应该初始化为默认主题', () => {
      expect(currentTheme.value).toBe('default')
    })

    it('应该从localStorage加载保存的主题', () => {
      localStorageMock.getItem.mockReturnValueOnce('dark')
      
      // 重新导入模块以测试初始化
      vi.resetModules()
      const { currentTheme: newCurrentTheme } = require('@/utils/theme')
      
      expect(newCurrentTheme.value).toBe('dark')
    })

    it('应该使用app_theme作为备用key', () => {
      localStorageMock.getItem.mockReturnValueOnce(null)
      localStorageMock.getItem.mockReturnValueOnce('custom')
      
      vi.resetModules()
      const { currentTheme: newCurrentTheme } = require('@/utils/theme')
      
      expect(newCurrentTheme.value).toBe('custom')
    })
  })

  describe('setTheme', () => {
    it('应该能够设置默认主题', () => {
      setTheme('default')
      
      expect(currentTheme.value).toBe('default')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('app-theme', 'default')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('app_theme', 'default')
      expect(mockDocument.documentElement.classList.remove).toHaveBeenCalledWith(
        'default-theme', 'dark-theme', 'custom-theme', 'glassmorphism-theme', 'dark-mode-debug'
      )
      expect(mockDocument.documentElement.removeAttribute).toHaveBeenCalledWith('data-theme')
      expect(mockDocument.documentElement.classList.add).toHaveBeenCalledWith('default-theme')
      expect(mockDocument.body.classList.add).toHaveBeenCalledWith('theme-workbench')
      expect(mockDocument.body.classList.toggle).toHaveBeenCalledWith('theme-dark', false)
      expect(mockDocument.body.classList.toggle).toHaveBeenCalledWith('theme-light', true)
    })

    it('应该能够设置暗黑主题', () => {
      setTheme('dark')
      
      expect(currentTheme.value).toBe('dark')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('app-theme', 'dark')
      expect(mockDocument.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark')
      expect(mockDocument.documentElement.classList.add).toHaveBeenCalledWith('dark-theme')
      expect(mockDocument.body.setAttribute).toHaveBeenCalledWith('data-el-theme', 'dark')
      expect(mockDocument.body.classList.add).toHaveBeenCalledWith('el-theme-dark')
      expect(mockDocument.body.classList.add).toHaveBeenCalledWith('theme-workbench')
      expect(mockDocument.body.classList.toggle).toHaveBeenCalledWith('theme-dark', true)
      expect(mockDocument.body.classList.toggle).toHaveBeenCalledWith('theme-light', false)
    })

    it('应该能够设置自定义主题', () => {
      setTheme('custom')
      
      expect(currentTheme.value).toBe('custom')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('app-theme', 'custom')
      expect(mockDocument.documentElement.classList.add).toHaveBeenCalledWith('custom-theme')
      expect(mockDocument.body.classList.add).toHaveBeenCalledWith('theme-workbench')
      expect(mockDocument.body.classList.toggle).toHaveBeenCalledWith('theme-dark', false)
      expect(mockDocument.body.classList.toggle).toHaveBeenCalledWith('theme-light', true)
    })

    it('应该能够设置玻璃态主题', () => {
      setTheme('glassmorphism')
      
      expect(currentTheme.value).toBe('glassmorphism')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('app-theme', 'glassmorphism')
      expect(mockDocument.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'glassmorphism')
      expect(mockDocument.documentElement.classList.add).toHaveBeenCalledWith('glassmorphism-theme')
      expect(mockDocument.body.setAttribute).toHaveBeenCalledWith('data-theme', 'glassmorphism')
      expect(mockDocument.body.classList.add).toHaveBeenCalledWith('theme-workbench')
      expect(mockDocument.body.classList.toggle).toHaveBeenCalledWith('theme-dark', false)
      expect(mockDocument.body.classList.toggle).toHaveBeenCalledWith('theme-light', true)
    })

    it('应该触发主题切换事件', () => {
      const mockEvent = new CustomEvent('theme-changed', { detail: { theme: 'dark' } })
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent')
      
      setTheme('dark')
      
      expect(dispatchEventSpy).toHaveBeenCalledWith(mockEvent)
    })

    it('应该在开发环境下为暗黑主题添加调试类', () => {
      process.env.NODE_ENV = 'development'
      
      setTheme('dark')
      
      expect(mockDocument.documentElement.classList.add).toHaveBeenCalledWith('dark-mode-debug')
    })

    it('应该在生产环境下不为暗黑主题添加调试类', () => {
      process.env.NODE_ENV = 'production'
      
      setTheme('dark')
      
      expect(mockDocument.documentElement.classList.add).not.toHaveBeenCalledWith('dark-mode-debug')
    })

    it('应该为非暗黑主题重置所有暗黑主题样式', () => {
      // 模拟存在一些Element Plus组件
      const mockElements = [
        { classList: { contains: vi.fn().mockReturnValue(true), removeAttribute: vi.fn() } },
        { classList: { contains: vi.fn().mockReturnValue(false), removeAttribute: vi.fn() } }
      ]
      mockDocument.querySelectorAll.mockReturnValue(mockElements)
      
      setTheme('default')
      
      // 第一个元素应该被重置
      expect(mockElements[0].removeAttribute).toHaveBeenCalledWith('style')
      // 第二个元素不应该被重置
      expect(mockElements[1].removeAttribute).not.toHaveBeenCalled()
    })

    it('应该延迟调用updateSidebarLogo', () => {
      vi.useFakeTimers()
      
      setTheme('dark')
      
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 100)
      
      vi.advanceTimersByTime(100)
      
      // 验证updateSidebarLogo被调用（通过console.log检查）
      expect(consoleMock.log).toHaveBeenCalledWith(
        expect.stringContaining('尝试查找侧边栏Logo元素')
      )
      
      vi.useRealTimers()
    })
  })

  describe('initTheme', () => {
    it('应该初始化默认主题', () => {
      localStorageMock.getItem.mockReturnValue('default')
      
      initTheme()
      
      expect(currentTheme.value).toBe('default')
      expect(mockDocument.documentElement.classList.add).toHaveBeenCalledWith('default-theme')
      expect(mockDocument.body.classList.add).toHaveBeenCalledWith('theme-workbench')
      expect(mockDocument.body.classList.toggle).toHaveBeenCalledWith('theme-dark', false)
      expect(mockDocument.body.classList.toggle).toHaveBeenCalledWith('theme-light', true)
    })

    it('应该初始化暗黑主题', () => {
      localStorageMock.getItem.mockReturnValue('dark')
      
      initTheme()
      
      expect(currentTheme.value).toBe('dark')
      expect(mockDocument.documentElement.classList.add).toHaveBeenCalledWith('dark-theme')
      expect(mockDocument.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark')
      expect(mockDocument.body.classList.add).toHaveBeenCalledWith('el-theme-dark')
      expect(mockDocument.body.classList.add).toHaveBeenCalledWith('theme-workbench')
      expect(mockDocument.body.classList.toggle).toHaveBeenCalledWith('theme-dark', true)
      expect(mockDocument.body.classList.toggle).toHaveBeenCalledWith('theme-light', false)
    })

    it('应该正确处理localStorage中没有保存主题的情况', () => {
      localStorageMock.getItem.mockReturnValue(null)
      
      initTheme()
      
      expect(currentTheme.value).toBe('default')
      expect(mockDocument.documentElement.classList.add).toHaveBeenCalledWith('default-theme')
    })

    it('应该为非暗黑主题移除暗黑主题相关类和属性', () => {
      localStorageMock.getItem.mockReturnValue('custom')
      
      initTheme()
      
      expect(mockDocument.documentElement.classList.remove).toHaveBeenCalledWith('dark-theme', 'dark-mode-debug')
      expect(mockDocument.documentElement.removeAttribute).toHaveBeenCalledWith('data-theme')
      expect(mockDocument.body.classList.remove).toHaveBeenCalledWith('el-theme-dark')
      expect(mockDocument.body.removeAttribute).toHaveBeenCalledWith('data-el-theme')
      expect(mockDocument.documentElement.classList.add).toHaveBeenCalledWith('custom-theme')
    })
  })

  describe('toggleTheme', () => {
    it('应该按顺序切换主题', () => {
      // 测试完整循环
      currentTheme.value = 'default'
      toggleTheme()
      expect(currentTheme.value).toBe('dark')
      
      currentTheme.value = 'dark'
      toggleTheme()
      expect(currentTheme.value).toBe('custom')
      
      currentTheme.value = 'custom'
      toggleTheme()
      expect(currentTheme.value).toBe('glassmorphism')
      
      currentTheme.value = 'glassmorphism'
      toggleTheme()
      expect(currentTheme.value).toBe('default')
    })

    it('应该在从暗黑主题切换到默认主题时清除暗黑主题样式', () => {
      currentTheme.value = 'dark'
      process.env.NODE_ENV = 'development'
      
      vi.useFakeTimers()
      toggleTheme()
      
      expect(mockDocument.documentElement.classList.remove).toHaveBeenCalledWith('dark-theme', 'dark-mode-debug')
      expect(mockDocument.documentElement.removeAttribute).toHaveBeenCalledWith('data-theme')
      expect(mockDocument.body.classList.remove).toHaveBeenCalledWith('el-theme-dark')
      expect(mockDocument.body.removeAttribute).toHaveBeenCalledWith('data-el-theme')
      
      vi.advanceTimersByTime(50)
      expect(mockDocument.body.style.display).toBe('')
      
      vi.useRealTimers()
    })

    it('应该在生产环境下从暗黑主题切换到默认主题时不强制刷新', () => {
      currentTheme.value = 'dark'
      process.env.NODE_ENV = 'production'
      
      toggleTheme()
      
      expect(mockDocument.body.style.display).not.toBe('none')
    })
  })

  describe('getThemeName', () => {
    it('应该返回正确的主题名称', () => {
      expect(getThemeName('default')).toBe('默认主题')
      expect(getThemeName('dark')).toBe('暗黑主题')
      expect(getThemeName('custom')).toBe('自定义主题')
      expect(getThemeName('glassmorphism')).toBe('玻璃态主题')
    })

    it('应该为未知主题返回默认名称', () => {
      const unknownTheme = 'unknown' as ThemeType
      expect(getThemeName(unknownTheme)).toBe('未知主题')
    })
  })

  describe('isDarkMode', () => {
    it('应该正确判断暗黑模式', () => {
      currentTheme.value = 'dark'
      expect(isDarkMode()).toBe(true)
      
      currentTheme.value = 'default'
      expect(isDarkMode()).toBe(false)
      
      currentTheme.value = 'custom'
      expect(isDarkMode()).toBe(false)
      
      currentTheme.value = 'glassmorphism'
      expect(isDarkMode()).toBe(false)
    })
  })

  describe('updateSidebarLogo', () => {
    it('应该能够找到并更新侧边栏Logo', () => {
      const mockLogo = {
        classList: {
          add: vi.fn(),
          remove: vi.fn(),
        },
        style: {
          setProperty: vi.fn(),
        },
        querySelector: vi.fn(),
      }
      
      mockDocument.querySelectorAll.mockReturnValue([mockLogo])
      
      // 调用updateSidebarLogo（通过setTheme间接调用）
      vi.useFakeTimers()
      setTheme('dark')
      vi.advanceTimersByTime(100)
      
      expect(mockDocument.querySelectorAll).toHaveBeenCalledWith('.sidebar-logo')
      expect(mockLogo.style.setProperty).toHaveBeenCalledWith('background-color', '#0f172a', 'important')
      expect(mockLogo.style.setProperty).toHaveBeenCalledWith('border-bottom-color', '#374151', 'important')
      expect(mockLogo.classList.add).toHaveBeenCalledWith('sidebar-logo-dark')
      expect(mockLogo.classList.remove).toHaveBeenCalledWith('sidebar-logo-custom', 'sidebar-logo-default')
      
      vi.useRealTimers()
    })

    it('应该尝试多种选择器查找Logo', () => {
      mockDocument.querySelectorAll.mockReturnValueOnce([])
      mockDocument.querySelectorAll.mockReturnValueOnce([])
      mockDocument.querySelectorAll.mockReturnValueOnce([])
      
      vi.useFakeTimers()
      setTheme('dark')
      vi.advanceTimersByTime(100)
      
      expect(mockDocument.querySelectorAll).toHaveBeenCalledWith('.sidebar-logo')
      expect(mockDocument.querySelectorAll).toHaveBeenCalledWith('.sidebar .sidebar-logo')
      expect(mockDocument.querySelectorAll).toHaveBeenCalledWith('[class*="sidebar-logo"]')
      expect(consoleMock.warn).toHaveBeenCalledWith(
        expect.stringContaining('未找到侧边栏Logo元素')
      )
      
      vi.useRealTimers()
    })

    it('应该为不同主题应用不同的Logo样式', () => {
      const mockLogo = {
        classList: {
          add: vi.fn(),
          remove: vi.fn(),
        },
        style: {
          setProperty: vi.fn(),
          removeProperty: vi.fn(),
        },
        querySelector: vi.fn().mockReturnValue(null),
      }
      
      mockDocument.querySelectorAll.mockReturnValue([mockLogo])
      
      vi.useFakeTimers()
      
      // 测试暗黑主题
      setTheme('dark')
      vi.advanceTimersByTime(100)
      
      expect(mockLogo.style.setProperty).toHaveBeenCalledWith('background-color', '#0f172a', 'important')
      expect(mockLogo.classList.add).toHaveBeenCalledWith('sidebar-logo-dark')
      
      // 重置mock
      vi.clearAllMocks()
      mockDocument.querySelectorAll.mockReturnValue([mockLogo])
      
      // 测试自定义主题
      setTheme('custom')
      vi.advanceTimersByTime(100)
      
      expect(mockLogo.style.setProperty).toHaveBeenCalledWith('background-color', '#ffffff', 'important')
      expect(mockLogo.classList.add).toHaveBeenCalledWith('sidebar-logo-custom')
      
      // 重置mock
      vi.clearAllMocks()
      mockDocument.querySelectorAll.mockReturnValue([mockLogo])
      
      // 测试默认主题
      setTheme('default')
      vi.advanceTimersByTime(100)
      
      expect(mockLogo.style.setProperty).toHaveBeenCalledWith('background-color', '#ffffff', 'important')
      expect(mockLogo.classList.add).toHaveBeenCalledWith('sidebar-logo-default')
      
      vi.useRealTimers()
    })

    it('应该处理Logo的子元素', () => {
      const mockLogoText = {
        style: {
          setProperty: vi.fn(),
        }
      }
      
      const mockLogoImg = {
        style: {
          removeProperty: vi.fn(),
        }
      }
      
      const mockCollapseIcon = {
        style: {
          setProperty: vi.fn(),
        }
      }
      
      const mockLogo = {
        classList: {
          add: vi.fn(),
          remove: vi.fn(),
        },
        style: {
          setProperty: vi.fn(),
        },
        querySelector: vi.fn().mockImplementation((selector) => {
          if (selector === '.logo-text') return mockLogoText
          if (selector === '.logo-img') return mockLogoImg
          if (selector === '.collapse-icon') return mockCollapseIcon
          return null
        }),
      }
      
      mockDocument.querySelectorAll.mockReturnValue([mockLogo])
      
      vi.useFakeTimers()
      setTheme('dark')
      vi.advanceTimersByTime(100)
      
      expect(mockLogoText.style.setProperty).toHaveBeenCalledWith('color', '#f9fafb', 'important')
      expect(mockLogoImg.style.setProperty).toHaveBeenCalledWith('filter', 'brightness(1.2) contrast(1.1)', 'important')
      expect(mockCollapseIcon.style.setProperty).toHaveBeenCalledWith('color', '#9ca3af', 'important')
      
      vi.useRealTimers()
    })
  })

  describe('边界条件', () => {
    it('应该处理无效的主题类型', () => {
      const invalidTheme = 'invalid' as ThemeType
      
      // 不应该抛出错误
      expect(() => {
        setTheme(invalidTheme)
      }).not.toThrow()
      
      expect(currentTheme.value).toBe(invalidTheme)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('app-theme', invalidTheme)
    })

    it('应该处理localStorage操作失败', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error')
      })
      
      // 不应该抛出错误
      expect(() => {
        setTheme('dark')
      }).not.toThrow()
    })

    it('应该处理DOM操作失败', () => {
      mockDocument.documentElement.classList.add.mockImplementation(() => {
        throw new Error('DOM error')
      })
      
      // 不应该抛出错误
      expect(() => {
        setTheme('dark')
      }).not.toThrow()
    })

    it('应该处理空的Logo元素列表', () => {
      mockDocument.querySelectorAll.mockReturnValue([])
      
      vi.useFakeTimers()
      setTheme('dark')
      vi.advanceTimersByTime(100)
      
      expect(consoleMock.warn).toHaveBeenCalledWith(
        expect.stringContaining('未找到侧边栏Logo元素')
      )
      
      vi.useRealTimers()
    })

    it('应该处理非HTMLElement的Logo元素', () => {
      const mockLogo = {} // 不是HTMLElement
      
      mockDocument.querySelectorAll.mockReturnValue([mockLogo])
      
      vi.useFakeTimers()
      setTheme('dark')
      vi.advanceTimersByTime(100)
      
      // 不应该抛出错误
      expect(consoleMock.log).toHaveBeenCalledWith(
        expect.stringContaining('找到1个侧边栏Logo元素')
      )
      
      vi.useRealTimers()
    })
  })

  describe('性能测试', () => {
    it('应该能够快速切换主题', () => {
      const iterations = 100
      
      const startTime = performance.now()
      
      for (let i = 0; i < iterations; i++) {
        setTheme('dark')
        setTheme('default')
      }
      
      const endTime = performance.now()
      const avgTime = (endTime - startTime) / (iterations * 2)
      
      // 平均切换时间应该小于5ms
      expect(avgTime).toBeLessThan(5)
    })

    it('应该能够快速检查主题状态', () => {
      const iterations = 1000
      
      const startTime = performance.now()
      
      for (let i = 0; i < iterations; i++) {
        isDarkMode()
        getThemeName('dark')
        getThemeName('default')
      }
      
      const endTime = performance.now()
      const avgTime = (endTime - startTime) / (iterations * 3)
      
      // 平均检查时间应该小于0.01ms
      expect(avgTime).toBeLessThan(0.01)
    })
  })

  describe('集成测试', () => {
    it('应该能够在主题切换后保持一致性', () => {
      // 设置暗黑主题
      setTheme('dark')
      
      // 验证状态
      expect(currentTheme.value).toBe('dark')
      expect(isDarkMode()).toBe(true)
      
      // 切换主题
      toggleTheme()
      
      // 验证新状态
      expect(currentTheme.value).toBe('custom')
      expect(isDarkMode()).toBe(false)
      
      // 验证localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith('app-theme', 'custom')
    })

    it('应该能够正确初始化并应用主题', () => {
      localStorageMock.getItem.mockReturnValue('glassmorphism')
      
      initTheme()
      
      expect(currentTheme.value).toBe('glassmorphism')
      expect(getThemeName('glassmorphism')).toBe('玻璃态主题')
      expect(isDarkMode()).toBe(false)
    })

    it('应该处理主题切换事件的监听', () => {
      const eventHandler = vi.fn()
      window.addEventListener('theme-changed', eventHandler)
      
      setTheme('dark')
      
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: { theme: 'dark' }
        })
      )
      
      window.removeEventListener('theme-changed', eventHandler)
    })
  })
})

describe('Theme Utility Security Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0,
      },
      writable: true,
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    Object.defineProperty(window, 'document', {
      value: {
        documentElement: {
          classList: {
            add: vi.fn(),
            remove: vi.fn(),
            toggle: vi.fn(),
            contains: vi.fn(),
          },
          setAttribute: vi.fn(),
          removeAttribute: vi.fn(),
          getAttribute: vi.fn(),
        },
        body: {
          classList: {
            add: vi.fn(),
            remove: vi.fn(),
            toggle: vi.fn(),
            contains: vi.fn(),
          },
          setAttribute: vi.fn(),
          removeAttribute: vi.fn(),
          getAttribute: vi.fn(),
          style: {},
        },
        querySelectorAll: vi.fn().mockReturnValue([]),
        dispatchEvent: vi.fn(),
      },
      writable: true,
    })
    
    Object.defineProperty(window, 'window', {
      value: {
        dispatchEvent: vi.fn(),
      },
      writable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('应该防止XSS攻击通过主题名称', () => {
    const maliciousTheme = '<script>alert("xss")</script>' as ThemeType
    
    // 不应该抛出错误，但应该安全处理
    expect(() => {
      setTheme(maliciousTheme)
    }).not.toThrow()
    
    // 验证恶意脚本没有被注入到DOM中
    expect(document.documentElement.setAttribute).not.toHaveBeenCalledWith(
      'data-theme',
      expect.stringContaining('<script>')
    )
  })

  it('应该防止CSS注入通过主题样式', () => {
    const mockLogo = {
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
      },
      style: {
        setProperty: vi.fn(),
      },
      querySelector: vi.fn().mockReturnValue(null),
    }
    
    document.querySelectorAll.mockReturnValue([mockLogo])
    
    vi.useFakeTimers()
    
    // 设置主题，应该安全处理样式
    setTheme('dark')
    vi.advanceTimersByTime(100)
    
    // 验证样式属性被正确设置，没有被注入
    expect(mockLogo.style.setProperty).toHaveBeenCalledWith('background-color', '#0f172a', 'important')
    expect(mockLogo.style.setProperty).not.toHaveBeenCalledWith(
      expect.stringContaining('javascript:'),
      expect.anything()
    )
    
    vi.useRealTimers()
  })

  it('应该防止localStorage数据篡改', () => {
    // 模拟localStorage被篡改
    const tamperedData = JSON.stringify({
      theme: 'dark',
      malicious: '<script>alert("xss")</script>'
    })
    
    localStorage.getItem.mockReturnValue(tamperedData)
    
    // 不应该抛出错误，应该安全处理
    expect(() => {
      initTheme()
    }).not.toThrow()
  })

  it('应该防止事件对象篡改', () => {
    const maliciousEvent = {
      detail: {
        theme: 'dark',
        malicious: '<script>alert("xss")</script>'
      }
    }
    
    // 模拟恶意事件
    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent')
    
    setTheme('dark')
    
    // 验证事件被正确分发，但没有包含恶意内容
    expect(dispatchEventSpy).toHaveBeenCalled()
    
    const call = dispatchEventSpy.mock.calls[0][0]
    expect(call.detail.theme).toBe('dark')
    expect(call.detail).not.toHaveProperty('malicious')
  })
})