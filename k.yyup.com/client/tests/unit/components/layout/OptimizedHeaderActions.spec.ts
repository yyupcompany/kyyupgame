import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory, Router } from 'vue-router'
import OptimizedHeaderActions from '@/components/layout/OptimizedHeaderActions.vue'

// 模拟Element Plus图标
const mockIcons = {
  ChatDotRound: { template: '<div class="mock-icon chat-dot-round"></div>' },
  FullScreen: { template: '<div class="mock-icon full-screen"></div>' },
  Aim: { template: '<div class="mock-icon aim"></div>' },
  Odometer: { template: '<div class="mock-icon odometer"></div>' },
  Sunny: { template: '<div class="mock-icon sunny"></div>' }
}

// 模拟性能监控器
const mockPerformanceMonitor = {
  getPerformanceReport: vi.fn(() => ({
    currentScore: 85
  }))
}

describe('OptimizedHeaderActions.vue', () => {
  let router: Router
  let originalDocument: Document
  let originalLocalStorage: Storage

  beforeEach(() => {
    vi.clearAllMocks()
    
    // 保存原始document和localStorage
    originalDocument = global.document
    originalLocalStorage = global.localStorage
    
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/ai/AIAssistantPage', name: 'AIAssistantPage' }
      ]
    })

    // 模拟document API
    global.document = {
      ...originalDocument,
      documentElement: {
        ...originalDocument.documentElement,
        classList: {
          add: vi.fn(),
          remove: vi.fn(),
          contains: vi.fn()
        }
      },
      body: {
        ...originalDocument.body,
        classList: {
          add: vi.fn(),
          remove: vi.fn(),
          contains: vi.fn()
        }
      },
      fullscreenElement: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      exitFullscreen: vi.fn().mockResolvedValue(undefined)
    } as any

    // 模拟localStorage
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn()
    } as any

    // 模拟performance monitor
    vi.doMock('@/utils/performance-monitor', () => ({
      performanceMonitor: mockPerformanceMonitor
    }))

    // 模拟process.env
    process.env.NODE_ENV = 'development'
  })

  afterEach(() => {
    // 恢复原始document和localStorage
    global.document = originalDocument
    global.localStorage = originalLocalStorage
  })

  const createWrapper = (props = {}) => {
    return mount(OptimizedHeaderActions, {
      global: {
        plugins: [router],
        stubs: {
          'el-icon': mockIcons.ChatDotRound,
          ...mockIcons
        },
        provide: {
          performanceMonitor: mockPerformanceMonitor
        }
      },
      props
    })
  }

  it('组件渲染正确', () => {
    const wrapper = createWrapper()
    
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.header-actions').exists()).toBe(true)
  })

  it('正确显示AI助手按钮', () => {
    const wrapper = createWrapper()
    
    const aiButton = wrapper.find('.ai-assistant-btn')
    expect(aiButton.exists()).toBe(true)
    expect(aiButton.find('.ai-badge').exists()).toBe(true)
    expect(aiButton.find('.ai-badge').text()).toBe('AI')
  })

  it('正确显示全屏按钮', () => {
    const wrapper = createWrapper()
    
    const fullscreenButton = wrapper.find('.header-action-btn')
    expect(fullscreenButton.exists()).toBe(true)
    expect(fullscreenButton.attributes('title')).toBe('全屏切换')
  })

  it('正确显示主题切换按钮', () => {
    const wrapper = createWrapper()
    
    const themeSelector = wrapper.find('.theme-selector')
    expect(themeSelector.exists()).toBe(true)
    
    const themeButton = themeSelector.find('.header-action-btn')
    expect(themeButton.exists()).toBe(true)
    expect(themeButton.attributes('title')).toBe('主题切换')
  })

  it('开发环境下显示性能指示器', () => {
    const wrapper = createWrapper()
    
    const performanceIndicator = wrapper.find('.performance-indicator')
    expect(performanceIndicator.exists()).toBe(true)
    expect(performanceIndicator.classes()).toContain('good') // 85分应该是good级别
  })

  it('生产环境下不显示性能指示器', () => {
    process.env.NODE_ENV = 'production'
    const wrapper = createWrapper()
    
    const performanceIndicator = wrapper.find('.performance-indicator')
    expect(performanceIndicator.exists()).toBe(false)
  })

  it('点击AI助手按钮时跳转到AI助手页面', async () => {
    const wrapper = createWrapper()
    
    const pushSpy = vi.spyOn(router, 'push')
    const aiButton = wrapper.find('.ai-assistant-btn')
    
    await aiButton.trigger('click')
    
    expect(pushSpy).toHaveBeenCalledWith('/ai/AIAssistantPage')
  })

  it('点击全屏按钮时切换全屏状态', async () => {
    const wrapper = createWrapper()
    
    // 模拟支持全屏
    global.document.documentElement.requestFullscreen = vi.fn().mockResolvedValue(undefined)
    
    const fullscreenButton = wrapper.findAll('.header-action-btn')[1] // 第二个按钮是全屏按钮
    await fullscreenButton.trigger('click')
    
    expect(global.document.documentElement.requestFullscreen).toHaveBeenCalled()
  })

  it('不支持全屏时禁用全屏按钮', () => {
    // 模拟不支持全屏
    const originalRequestFullscreen = global.document.documentElement.requestFullscreen
    delete (global.document.documentElement as any).requestFullscreen
    
    const wrapper = createWrapper()
    
    const fullscreenButton = wrapper.findAll('.header-action-btn')[1]
    expect(fullscreenButton.attributes('disabled')).toBe('')
    
    // 恢复原始方法
    global.document.documentElement.requestFullscreen = originalRequestFullscreen
  })

  it('点击主题切换按钮时显示/隐藏主题下拉菜单', async () => {
    const wrapper = createWrapper()
    
    const themeButton = wrapper.find('.theme-selector .header-action-btn')
    const themeDropdown = wrapper.find('.theme-dropdown')
    
    // 初始状态下拉菜单隐藏
    expect(themeDropdown.exists()).toBe(false)
    
    // 点击主题按钮
    await themeButton.trigger('click')
    
    // 下拉菜单应该显示
    expect(wrapper.find('.theme-dropdown').exists()).toBe(true)
    
    // 再次点击主题按钮
    await themeButton.trigger('click')
    
    // 下拉菜单应该隐藏
    expect(wrapper.find('.theme-dropdown').exists()).toBe(false)
  })

  it('点击主题选项时切换主题', async () => {
    const wrapper = createWrapper()
    
    // 显示主题下拉菜单
    const themeButton = wrapper.find('.theme-selector .header-action-btn')
    await themeButton.trigger('click')
    
    // 点击暗黑主题选项
    const darkThemeOption = wrapper.findAll('.theme-option')[1]
    await darkThemeOption.trigger('click')
    
    // 验证主题切换逻辑被调用
    expect(global.localStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
    expect(global.localStorage.setItem).toHaveBeenCalledWith('app_theme', 'dark')
  })

  it('正确渲染主题选项', async () => {
    const wrapper = createWrapper()
    
    // 显示主题下拉菜单
    const themeButton = wrapper.find('.theme-selector .header-action-btn')
    await themeButton.trigger('click')
    
    const themeOptions = wrapper.findAll('.theme-option')
    expect(themeOptions.length).toBe(2)
    
    expect(themeOptions[0].find('.theme-name').text()).toBe('明亮')
    expect(themeOptions[1].find('.theme-name').text()).toBe('暗黑')
  })

  it('正确计算性能等级', () => {
    const wrapper = createWrapper()
    
    // 测试不同性能分数对应的等级
    const vm = wrapper.vm as any
    
    // 修改performanceScore并检查performanceLevel
    vm.performanceScore = 95
    expect(vm.performanceLevel).toBe('excellent')
    
    vm.performanceScore = 75
    expect(vm.performanceLevel).toBe('good')
    
    vm.performanceScore = 55
    expect(vm.performanceLevel).toBe('fair')
    
    vm.performanceScore = 35
    expect(vm.performanceLevel).toBe('poor')
  })

  it('组件挂载时恢复主题设置', () => {
    global.localStorage.getItem = vi.fn().mockReturnValue('dark')
    
    createWrapper()
    
    expect(global.localStorage.getItem).toHaveBeenCalledWith('theme')
    expect(global.localStorage.getItem).toHaveBeenCalledWith('app_theme')
  })

  it('组件挂载时初始化全屏状态', () => {
    global.document.fullscreenElement = document.createElement('div')
    
    const wrapper = createWrapper()
    
    const vm = wrapper.vm as any
    expect(vm.isFullscreen).toBe(true)
  })

  it('组件挂载时添加事件监听器', () => {
    createWrapper()
    
    expect(global.document.addEventListener).toHaveBeenCalledWith('fullscreenchange', expect.any(Function))
    expect(global.document.addEventListener).toHaveBeenCalledWith('click', expect.any(Function))
  })

  it('组件卸载时移除事件监听器', () => {
    const wrapper = createWrapper()
    
    wrapper.unmount()
    
    expect(global.document.removeEventListener).toHaveBeenCalledWith('fullscreenchange', expect.any(Function))
    expect(global.document.removeEventListener).toHaveBeenCalledWith('click', expect.any(Function))
  })

  it('点击外部区域时关闭主题下拉菜单', async () => {
    const wrapper = createWrapper()
    
    // 显示主题下拉菜单
    const themeButton = wrapper.find('.theme-selector .header-action-btn')
    await themeButton.trigger('click')
    
    expect(wrapper.find('.theme-dropdown').exists()).toBe(true)
    
    // 模拟点击外部区域
    const mockEvent = {
      target: {
        closest: vi.fn().mockReturnValue(null)
      }
    }
    
    const vm = wrapper.vm as any
    vm.handleClickOutside(mockEvent)
    
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.theme-dropdown').exists()).toBe(false)
  })

  it('全屏状态变化时更新isFullscreen', () => {
    const wrapper = createWrapper()
    
    const vm = wrapper.vm as any
    
    // 模拟全屏状态变化
    global.document.fullscreenElement = document.createElement('div')
    vm.handleFullscreenChange()
    expect(vm.isFullscreen).toBe(true)
    
    global.document.fullscreenElement = null
    vm.handleFullscreenChange()
    expect(vm.isFullscreen).toBe(false)
  })

  it'开发环境下定期更新性能分数', () => {
    vi.useFakeTimers()
    
    createWrapper()
    
    // 验证定时器被设置
    expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 5000)
    
    vi.useRealTimers()
  })

  it('主题切换时正确应用CSS类', () => {
    const wrapper = createWrapper()
    
    const vm = wrapper.vm as any
    const mockDocumentElement = {
      classList: {
        remove: vi.fn(),
        add: vi.fn()
      }
    }
    const mockBody = {
      classList: {
        remove: vi.fn(),
        add: vi.fn()
      }
    }
    
    global.document.documentElement = mockDocumentElement
    global.document.body = mockBody
    
    vm.changeTheme('dark')
    
    expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith('theme-light', 'theme-dark')
    expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('theme-dark')
    expect(mockBody.classList.remove).toHaveBeenCalledWith('theme-light', 'theme-dark')
    expect(mockBody.classList.add).toHaveBeenCalledWith('theme-dark')
  })

  it('组件样式应用正确', () => {
    const wrapper = createWrapper()
    
    const headerActions = wrapper.find('.header-actions')
    expect(headerActions.classes()).toContain('header-actions')
    
    const aiButton = wrapper.find('.ai-assistant-btn')
    expect(aiButton.classes()).toContain('ai-assistant-btn')
    
    const actionButtons = wrapper.findAll('.header-action-btn')
    expect(actionButtons.length).toBeGreaterThan(0)
    actionButtons.forEach(button => {
      expect(button.classes()).toContain('header-action-btn')
    })
  })

  it('正确处理全屏切换错误', async () => {
    const wrapper = createWrapper()
    
    // 模拟全屏切换失败
    global.document.documentElement.requestFullscreen = vi.fn().mockRejectedValue(new Error('Fullscreen failed'))
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const fullscreenButton = wrapper.findAll('.header-action-btn')[1]
    await fullscreenButton.trigger('click')
    
    expect(consoleSpy).toHaveBeenCalledWith('全屏切换失败:', expect.any(Error))
    
    consoleSpy.mockRestore()
  })
})