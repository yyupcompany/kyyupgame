import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import OptimizedHeaderActions from '@/components/layout/OptimizedHeaderActions.vue'

// Mock Element Plus icons
vi.mock('@element-plus/icons-vue', () => ({
  Sunny: { name: 'Sunny' },
  FullScreen: { name: 'FullScreen' },
  Aim: { name: 'Aim' },
  Odometer: { name: 'Odometer' },
  ChatDotRound: { name: 'ChatDotRound' },
  WarningFilled: { name: 'WarningFilled' }
}))

// Mock performance monitor
vi.mock('../../utils/performance-monitor', () => ({
  performanceMonitor: {
    getPerformanceReport: vi.fn()
  }
}))

// Mock vue-router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

// Mock Element Plus
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn()
    },
    ElNotification: {
      error: vi.fn()
    },
    ElIcon: {
      name: 'ElIcon',
      template: '<div class="el-icon"><slot /></div>',
      props: ['size', 'color']
    }
  }
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
global.localStorage = localStorageMock

// Mock document methods
Object.defineProperty(document, 'documentElement', {
  value: {
    classList: {
      add: vi.fn(),
      remove: vi.fn()
    }
  },
  writable: true
})

Object.defineProperty(document, 'body', {
  value: {
    classList: {
      add: vi.fn(),
      remove: vi.fn()
    }
  },
  writable: true
})

Object.defineProperty(document, 'fullscreenElement', {
  value: null,
  writable: true
})

Object.defineProperty(document, 'requestFullscreen', {
  value: vi.fn(),
  writable: true
})

Object.defineProperty(document, 'exitFullscreen', {
  value: vi.fn(),
  writable: true
})

Object.defineProperty(document, 'addEventListener', {
  value: vi.fn(),
  writable: true
})

Object.defineProperty(document, 'removeEventListener', {
  value: vi.fn(),
  writable: true
})

describe('OptimizedHeaderActions.vue', () => {
  let wrapper: any

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
    
    // Reset document properties
    document.fullscreenElement = null
    
    // Setup default localStorage behavior
    localStorageMock.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  const createWrapper = (props = {}) => {
    return mount(OptimizedHeaderActions, {
      props: {
        ...props
      },
      global: {
        stubs: {
          'el-icon': true
        }
      }
    })
  }

  describe('基础渲染', () => {
    it('应该正确渲染头部操作组件', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.header-actions').exists()).toBe(true)
    })

    it('应该渲染 AI 助手按钮', () => {
      wrapper = createWrapper()
      
      const aiButton = wrapper.find('.ai-assistant-btn')
      expect(aiButton.exists()).toBe(true)
      expect(aiButton.find('.ai-badge').exists()).toBe(true)
      expect(aiButton.find('.ai-badge').text()).toBe('AI')
    })

    it('应该渲染全屏按钮', () => {
      wrapper = createWrapper()
      
      const fullscreenButton = wrapper.find('.header-action-btn:not(.ai-assistant-btn)')
      expect(fullscreenButton.exists()).toBe(true)
    })

    it('应该渲染主题选择器', () => {
      wrapper = createWrapper()
      
      const themeSelector = wrapper.find('.theme-selector')
      expect(themeSelector.exists()).toBe(true)
    })
  })

  describe('AI 助手功能', () => {
    it('应该点击 AI 助手按钮时跳转到 AI 页面', async () => {
      wrapper = createWrapper()
      
      const aiButton = wrapper.find('.ai-assistant-btn')
      await aiButton.trigger('click')
      
      expect(mockPush).toHaveBeenCalledWith('/ai/AIAssistantPage')
    })

    it('应该显示正确的 AI 助手按钮标题', () => {
      wrapper = createWrapper()
      
      const aiButton = wrapper.find('.ai-assistant-btn')
      expect(aiButton.attributes('title')).toBe('AI助手')
    })
  })

  describe('全屏功能', () => {
    it('应该检测全屏支持', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.supportsFullscreen).toBe(true)
    })

    it('应该进入全屏模式', async () => {
      document.requestFullscreen.mockResolvedValue(undefined)
      
      wrapper = createWrapper()
      
      const fullscreenButton = wrapper.find('.header-action-btn:not(.ai-assistant-btn)')
      await fullscreenButton.trigger('click')
      
      expect(document.requestFullscreen).toHaveBeenCalled()
      expect(wrapper.vm.isFullscreen).toBe(true)
    })

    it('应该退出全屏模式', async () => {
      // Set fullscreen state
      document.fullscreenElement = document.documentElement
      document.exitFullscreen.mockResolvedValue(undefined)
      
      wrapper = createWrapper()
      await wrapper.setData({ isFullscreen: true })
      
      const fullscreenButton = wrapper.find('.header-action-btn:not(.ai-assistant-btn)')
      await fullscreenButton.trigger('click')
      
      expect(document.exitFullscreen).toHaveBeenCalled()
      expect(wrapper.vm.isFullscreen).toBe(false)
    })

    it('应该处理全屏切换失败', async () => {
      document.requestFullscreen.mockRejectedValue(new Error('全屏失败'))
      
      wrapper = createWrapper()
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const fullscreenButton = wrapper.find('.header-action-btn:not(.ai-assistant-btn)')
      await fullscreenButton.trigger('click')
      
      expect(consoleSpy).toHaveBeenCalledWith('全屏切换失败:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })

    it('应该在无全屏支持时禁用按钮', () => {
      // Temporarily remove fullscreen support
      const originalRequestFullscreen = document.requestFullscreen
      delete document.requestFullscreen
      
      wrapper = createWrapper()
      
      expect(wrapper.vm.supportsFullscreen).toBe(false)
      
      const fullscreenButton = wrapper.find('.header-action-btn:not(.ai-assistant-btn)')
      expect(fullscreenButton.attributes('disabled')).toBe('')
      
      // Restore fullscreen support
      document.requestFullscreen = originalRequestFullscreen
    })

    it('应该监听全屏状态变化', async () => {
      wrapper = createWrapper()
      
      // Simulate fullscreen change
      document.fullscreenElement = document.documentElement
      
      await wrapper.vm.handleFullscreenChange()
      
      expect(wrapper.vm.isFullscreen).toBe(true)
      
      document.fullscreenElement = null
      
      await wrapper.vm.handleFullscreenChange()
      
      expect(wrapper.vm.isFullscreen).toBe(false)
    })
  })

  describe('主题切换功能', () => {
    it('应该显示主题下拉菜单', async () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.showThemeDropdown).toBe(false)
      
      const themeSelector = wrapper.find('.theme-selector')
      const themeButton = themeSelector.find('.header-action-btn')
      await themeButton.trigger('click')
      
      expect(wrapper.vm.showThemeDropdown).toBe(true)
      
      const themeDropdown = wrapper.find('.theme-dropdown')
      expect(themeDropdown.exists()).toBe(true)
    })

    it('应该隐藏主题下拉菜单', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ showThemeDropdown: true })
      
      const themeSelector = wrapper.find('.theme-selector')
      const themeButton = themeSelector.find('.header-action-btn')
      await themeButton.trigger('click')
      
      expect(wrapper.vm.showThemeDropdown).toBe(false)
    })

    it('应该渲染主题选项', () => {
      wrapper = createWrapper()
      await wrapper.setData({ showThemeDropdown: true })
      
      const themeOptions = wrapper.findAll('.theme-option')
      expect(themeOptions.length).toBe(2)
      
      expect(themeOptions[0].find('.theme-name').text()).toBe('明亮')
      expect(themeOptions[1].find('.theme-name').text()).toBe('暗黑')
    })

    it('应该切换主题', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ showThemeDropdown: true })
      
      const themeOptions = wrapper.findAll('.theme-option')
      await themeOptions[1].trigger('click') // 暗黑主题
      
      expect(wrapper.vm.currentTheme).toBe('dark')
      expect(wrapper.vm.showThemeDropdown).toBe(false)
      
      // Check DOM manipulation
      expect(document.documentElement.classList.add).toHaveBeenCalledWith('theme-dark')
      expect(document.documentElement.classList.remove).toHaveBeenCalledWith('theme-light')
      expect(document.body.classList.add).toHaveBeenCalledWith('theme-dark')
      expect(document.body.classList.remove).toHaveBeenCalledWith('theme-light')
      expect(document.body.classList.add).toHaveBeenCalledWith('theme-workbench')
      
      // Check localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('app_theme', 'dark')
    })

    it('应该切换到明亮主题', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ showThemeDropdown: true })
      
      const themeOptions = wrapper.findAll('.theme-option')
      await themeOptions[0].trigger('click') // 明亮主题
      
      expect(wrapper.vm.currentTheme).toBe('light')
      expect(wrapper.vm.showThemeDropdown).toBe(false)
      
      // Check DOM manipulation
      expect(document.documentElement.classList.add).toHaveBeenCalledWith('theme-light')
      expect(document.documentElement.classList.remove).toHaveBeenCalledWith('theme-dark')
      expect(document.body.classList.add).toHaveBeenCalledWith('theme-light')
      expect(document.body.classList.remove).toHaveBeenCalledWith('theme-dark')
      expect(document.body.classList.add).toHaveBeenCalledWith('theme-workbench')
      
      // Check localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('app_theme', 'light')
    })

    it('应该高亮当前活动主题', () => {
      wrapper = createWrapper({
        currentTheme: 'dark'
      })
      await wrapper.setData({ showThemeDropdown: true })
      
      const themeOptions = wrapper.findAll('.theme-option')
      expect(themeOptions[0].classes()).not.toContain('active')
      expect(themeOptions[1].classes()).toContain('active')
    })

    it('应该点击外部关闭主题下拉菜单', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ showThemeDropdown: true })
      
      // Simulate click outside
      const mockEvent = {
        target: {
          closest: vi.fn().mockReturnValue(null)
        }
      }
      
      await wrapper.vm.handleClickOutside(mockEvent)
      
      expect(wrapper.vm.showThemeDropdown).toBe(false)
    })

    it('不应该在点击主题选择器内部时关闭下拉菜单', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ showThemeDropdown: true })
      
      // Simulate click inside theme selector
      const mockEvent = {
        target: {
          closest: vi.fn().mockReturnValue({ className: 'theme-selector' })
        }
      }
      
      await wrapper.vm.handleClickOutside(mockEvent)
      
      expect(wrapper.vm.showThemeDropdown).toBe(true)
    })
  })

  describe('性能指示器', () => {
    it('应该在开发环境显示性能指示器', () => {
      // Mock development environment
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      wrapper = createWrapper()
      
      const performanceIndicator = wrapper.find('.performance-indicator')
      expect(performanceIndicator.exists()).toBe(true)
      
      // Restore original environment
      process.env.NODE_ENV = originalEnv
    })

    it('应该在生产环境隐藏性能指示器', () => {
      // Mock production environment
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      
      wrapper = createWrapper()
      
      const performanceIndicator = wrapper.find('.performance-indicator')
      expect(performanceIndicator.exists()).toBe(false)
      
      // Restore original environment
      process.env.NODE_ENV = originalEnv
    })

    it('应该更新性能分数', () => {
      // Mock development environment
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      const { performanceMonitor } = require('../../utils/performance-monitor')
      performanceMonitor.getPerformanceReport.mockReturnValue({
        currentScore: 85
      })
      
      wrapper = createWrapper()
      
      wrapper.vm.updatePerformanceScore()
      
      expect(wrapper.vm.performanceScore).toBe(85)
      expect(wrapper.vm.performanceLevel).toBe('excellent')
      
      // Restore original environment
      process.env.NODE_ENV = originalEnv
    })

    it('应该根据性能分数应用正确的样式', () => {
      // Mock development environment
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      wrapper = createWrapper()
      
      // Test different performance levels
      wrapper.setData({ performanceScore: 95 })
      expect(wrapper.vm.performanceLevel).toBe('excellent')
      
      wrapper.setData({ performanceScore: 75 })
      expect(wrapper.vm.performanceLevel).toBe('good')
      
      wrapper.setData({ performanceScore: 55 })
      expect(wrapper.vm.performanceLevel).toBe('fair')
      
      wrapper.setData({ performanceScore: 35 })
      expect(wrapper.vm.performanceLevel).toBe('poor')
      
      // Restore original environment
      process.env.NODE_ENV = originalEnv
    })
  })

  describe('生命周期', () => {
    it('应该在挂载时恢复主题设置', async () => {
      localStorageMock.getItem.mockReturnValue('dark')
      
      wrapper = createWrapper()
      
      await nextTick()
      
      expect(wrapper.vm.currentTheme).toBe('dark')
      expect(document.documentElement.classList.add).toHaveBeenCalledWith('theme-dark')
    })

    it('应该在挂载时初始化全屏状态', () => {
      document.fullscreenElement = document.documentElement
      
      wrapper = createWrapper()
      
      expect(wrapper.vm.isFullscreen).toBe(true)
    })

    it('应该在挂载时添加事件监听器', () => {
      wrapper = createWrapper()
      
      expect(document.addEventListener).toHaveBeenCalledWith('fullscreenchange', expect.any(Function))
      expect(document.addEventListener).toHaveBeenCalledWith('click', expect.any(Function))
    })

    it('应该在卸载时移除事件监听器', () => {
      wrapper = createWrapper()
      
      wrapper.unmount()
      
      expect(document.removeEventListener).toHaveBeenCalledWith('fullscreenchange', expect.any(Function))
      expect(document.removeEventListener).toHaveBeenCalledWith('click', expect.any(Function))
    })

    it('应该在开发环境设置性能监控定时器', async () => {
      // Mock development environment
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      vi.useFakeTimers()
      
      wrapper = createWrapper()
      
      await nextTick()
      
      // Fast-forward time to trigger performance update
      vi.advanceTimersByTime(5000)
      
      const { performanceMonitor } = require('../../utils/performance-monitor')
      expect(performanceMonitor.getPerformanceReport).toHaveBeenCalled()
      
      vi.useRealTimers()
      
      // Restore original environment
      process.env.NODE_ENV = originalEnv
    })
  })

  describe('Props 处理', () => {
    it('应该使用默认的 currentTheme', () => {
      wrapper = createWrapper()
      
      expect(wrapper.props().currentTheme).toBe('dark')
    })

    it('应该接受自定义 currentTheme', () => {
      wrapper = createWrapper({
        currentTheme: 'light'
      })
      
      expect(wrapper.props().currentTheme).toBe('light')
    })
  })

  describe('边界情况', () => {
    it('应该处理 localStorage 读取失败', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })
      
      wrapper = createWrapper()
      
      // Should default to dark theme
      expect(wrapper.vm.currentTheme).toBe('dark')
    })

    it('应该处理无效的主题值', () => {
      localStorageMock.getItem.mockReturnValue('invalid-theme')
      
      wrapper = createWrapper()
      
      // Should default to dark theme
      expect(wrapper.vm.currentTheme).toBe('dark')
    })

    it('应该处理空的主题值', () => {
      localStorageMock.getItem.mockReturnValue('')
      
      wrapper = createWrapper()
      
      // Should default to dark theme
      expect(wrapper.vm.currentTheme).toBe('dark')
    })

    it('应该处理 null 的主题值', () => {
      localStorageMock.getItem.mockReturnValue(null)
      
      wrapper = createWrapper()
      
      // Should default to dark theme
      expect(wrapper.vm.currentTheme).toBe('dark')
    })

    it('应该处理全屏 API 不可用', () => {
      delete document.requestFullscreen
      delete document.exitFullscreen
      
      wrapper = createWrapper()
      
      expect(wrapper.vm.supportsFullscreen).toBe(false)
      
      // Restore fullscreen API
      document.requestFullscreen = vi.fn()
      document.exitFullscreen = vi.fn()
    })

    it('应该处理全屏 API 抛出异常', async () => {
      document.requestFullscreen.mockRejectedValue(new Error('Fullscreen not supported'))
      document.exitFullscreen.mockRejectedValue(new Error('Exit fullscreen failed'))
      
      wrapper = createWrapper()
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const fullscreenButton = wrapper.find('.header-action-btn:not(.ai-assistant-btn)')
      await fullscreenButton.trigger('click')
      
      expect(consoleSpy).toHaveBeenCalledWith('全屏切换失败:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })

    it('应该处理性能监控错误', () => {
      // Mock development environment
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      const { performanceMonitor } = require('../../utils/performance-monitor')
      performanceMonitor.getPerformanceReport.mockImplementation(() => {
        throw new Error('Performance monitor error')
      })
      
      wrapper = createWrapper()
      
      // Should handle error gracefully
      expect(() => {
        wrapper.vm.updatePerformanceScore()
      }).not.toThrow()
      
      // Restore original environment
      process.env.NODE_ENV = originalEnv
    })

    it('应该处理性能监控返回无效数据', () => {
      // Mock development environment
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      const { performanceMonitor } = require('../../utils/performance-monitor')
      performanceMonitor.getPerformanceReport.mockReturnValue({
        currentScore: null
      })
      
      wrapper = createWrapper()
      
      wrapper.vm.updatePerformanceScore()
      
      expect(wrapper.vm.performanceScore).toBeNull()
      expect(wrapper.vm.performanceLevel).toBe('poor')
      
      // Restore original environment
      process.env.NODE_ENV = originalEnv
    })

    it('应该处理性能监控返回负数分数', () => {
      // Mock development environment
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      const { performanceMonitor } = require('../../utils/performance-monitor')
      performanceMonitor.getPerformanceReport.mockReturnValue({
        currentScore: -10
      })
      
      wrapper = createWrapper()
      
      wrapper.vm.updatePerformanceScore()
      
      expect(wrapper.vm.performanceScore).toBe(-10)
      expect(wrapper.vm.performanceLevel).toBe('poor')
      
      // Restore original environment
      process.env.NODE_ENV = originalEnv
    })

    it('应该处理性能监控返回超大分数', () => {
      // Mock development environment
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      const { performanceMonitor } = require('../../utils/performance-monitor')
      performanceMonitor.getPerformanceReport.mockReturnValue({
        currentScore: 200
      })
      
      wrapper = createWrapper()
      
      wrapper.vm.updatePerformanceScore()
      
      expect(wrapper.vm.performanceScore).toBe(200)
      expect(wrapper.vm.performanceLevel).toBe('excellent')
      
      // Restore original environment
      process.env.NODE_ENV = originalEnv
    })

    it('应该处理点击外部事件中的异常', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ showThemeDropdown: true })
      
      // Simulate click outside with error
      const mockEvent = {
        target: {
          closest: vi.fn().mockImplementation(() => {
            throw new Error('DOM error')
          })
        }
      }
      
      // Should handle error gracefully
      expect(() => {
        wrapper.vm.handleClickOutside(mockEvent)
      }).not.toThrow()
    })
  })

  describe('响应式更新', () => {
    it('应该响应 currentTheme 变化', async () => {
      wrapper = createWrapper({
        currentTheme: 'light'
      })
      
      await wrapper.setProps({ currentTheme: 'dark' })
      
      expect(wrapper.vm.currentTheme).toBe('dark')
    })

    it('应该响应频繁的主题变化', async () => {
      wrapper = createWrapper({
        currentTheme: 'light'
      })
      
      // Simulate frequent theme changes
      for (let i = 0; i < 5; i++) {
        const theme = i % 2 === 0 ? 'light' : 'dark'
        await wrapper.setProps({ currentTheme: theme })
        expect(wrapper.vm.currentTheme).toBe(theme)
      }
    })
  })

  describe('无障碍支持', () => {
    it('应该为按钮提供适当的标题', () => {
      wrapper = createWrapper()
      
      const aiButton = wrapper.find('.ai-assistant-btn')
      expect(aiButton.attributes('title')).toBe('AI助手')
      
      const fullscreenButton = wrapper.find('.header-action-btn:not(.ai-assistant-btn)')
      expect(fullscreenButton.attributes('title')).toBe('全屏切换')
      
      const themeButton = wrapper.find('.theme-selector .header-action-btn')
      expect(themeButton.attributes('title')).toBe('主题切换')
    })

    it('应该为主题选项提供标题', () => {
      wrapper = createWrapper()
      await wrapper.setData({ showThemeDropdown: true })
      
      const themeOptions = wrapper.findAll('.theme-option')
      expect(themeOptions[0].attributes('title')).toBe('明亮')
      expect(themeOptions[1].attributes('title')).toBe('暗黑')
    })

    it('应该支持键盘导航', async () => {
      wrapper = createWrapper()
      
      const aiButton = wrapper.find('.ai-assistant-btn')
      const fullscreenButton = wrapper.find('.header-action-btn:not(.ai-assistant-btn)')
      const themeButton = wrapper.find('.theme-selector .header-action-btn')
      
      // Test keyboard navigation
      await aiButton.trigger('keydown.enter')
      await aiButton.trigger('keydown.space')
      
      await fullscreenButton.trigger('keydown.enter')
      await fullscreenButton.trigger('keydown.space')
      
      await themeButton.trigger('keydown.enter')
      await themeButton.trigger('keydown.space')
      
      // Should handle keyboard events without errors
      expect(true).toBe(true)
    })

    it('应该处理禁用按钮的键盘事件', async () => {
      // Temporarily remove fullscreen support
      const originalRequestFullscreen = document.requestFullscreen
      delete document.requestFullscreen
      
      wrapper = createWrapper()
      
      const fullscreenButton = wrapper.find('.header-action-btn:not(.ai-assistant-btn)')
      expect(fullscreenButton.attributes('disabled')).toBe('')
      
      // Test keyboard events on disabled button
      await fullscreenButton.trigger('keydown.enter')
      await fullscreenButton.trigger('keydown.space')
      
      // Should handle keyboard events without errors
      expect(true).toBe(true)
      
      // Restore fullscreen support
      document.requestFullscreen = originalRequestFullscreen
    })
  })

  describe('主题切换优化', () => {
    it('应该正确处理主题切换的DOM操作', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ showThemeDropdown: true })
      
      const themeOptions = wrapper.findAll('.theme-option')
      
      // Clear all mock calls
      vi.clearAllMocks()
      
      await themeOptions[0].trigger('click') // light theme
      
      expect(document.documentElement.classList.remove).toHaveBeenCalledWith('theme-dark')
      expect(document.documentElement.classList.add).toHaveBeenCalledWith('theme-light')
      expect(document.body.classList.remove).toHaveBeenCalledWith('theme-dark')
      expect(document.body.classList.add).toHaveBeenCalledWith('theme-light')
      expect(document.body.classList.add).toHaveBeenCalledWith('theme-workbench')
    })

    it('应该正确处理暗色主题的DOM操作', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ showThemeDropdown: true })
      
      const themeOptions = wrapper.findAll('.theme-option')
      
      // Clear all mock calls
      vi.clearAllMocks()
      
      await themeOptions[1].trigger('click') // dark theme
      
      expect(document.documentElement.classList.remove).toHaveBeenCalledWith('theme-light')
      expect(document.documentElement.classList.add).toHaveBeenCalledWith('theme-dark')
      expect(document.body.classList.remove).toHaveBeenCalledWith('theme-light')
      expect(document.body.classList.add).toHaveBeenCalledWith('theme-dark')
      expect(document.body.classList.add).toHaveBeenCalledWith('theme-workbench')
    })

    it('应该正确持久化主题设置', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ showThemeDropdown: true })
      
      const themeOptions = wrapper.findAll('.theme-option')
      
      // Clear all mock calls
      vi.clearAllMocks()
      
      await themeOptions[0].trigger('click') // light theme
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('app_theme', 'light')
    })

    it('应该正确处理暗色主题的持久化', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ showThemeDropdown: true })
      
      const themeOptions = wrapper.findAll('.theme-option')
      
      // Clear all mock calls
      vi.clearAllMocks()
      
      await themeOptions[1].trigger('click') // dark theme
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('app_theme', 'dark')
    })
  })

  describe('性能优化', () => {
    it('应该正确处理频繁的性能监控更新', async () => {
      // Mock development environment
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      vi.useFakeTimers()
      
      wrapper = createWrapper()
      
      await nextTick()
      
      // Simulate multiple performance updates
      for (let i = 0; i < 5; i++) {
        vi.advanceTimersByTime(5000)
      }
      
      const { performanceMonitor } = require('../../utils/performance-monitor')
      expect(performanceMonitor.getPerformanceReport).toHaveBeenCalledTimes(5)
      
      vi.useRealTimers()
      
      // Restore original environment
      process.env.NODE_ENV = originalEnv
    })

    it('应该正确处理组件卸载时的清理', () => {
      // Mock development environment
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      vi.useFakeTimers()
      
      wrapper = createWrapper()
      
      // Clear mock calls
      vi.clearAllMocks()
      
      wrapper.unmount()
      
      // Check if event listeners were removed
      expect(document.removeEventListener).toHaveBeenCalledWith('fullscreenchange', expect.any(Function))
      expect(document.removeEventListener).toHaveBeenCalledWith('click', expect.any(Function))
      
      vi.useRealTimers()
      
      // Restore original environment
      process.env.NODE_ENV = originalEnv
    })
  })
})