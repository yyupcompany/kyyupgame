import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PageLoadingGuard from '@/components/PageLoadingGuard.vue'
import { useRouter } from 'vue-router'

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: vi.fn()
}))

// Mock navigation timeout fix utility
vi.mock('../utils/navigation-timeout-fix', () => ({
  navigationTimeoutFix: vi.fn()
}))

describe('PageLoadingGuard.vue', () => {
  let pinia: any
  let mockRouter: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    // Mock router
    mockRouter = {
      push: vi.fn()
    }
    ;(useRouter as any).mockReturnValue(mockRouter)
    
    // Mock timers
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('组件渲染', () => {
    it('应该正确渲染基本组件', () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 1500,
          showProgress: true
        }
      })

      expect(wrapper.find('.page-loading-guard').exists()).toBe(true)
      expect(wrapper.vm.isLoading).toBe(true)
      expect(wrapper.vm.hasError).toBe(false)
    })

    it('应该渲染加载状态', () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 1500,
          showProgress: true
        }
      })

      expect(wrapper.find('.loading-container').exists()).toBe(true)
      expect(wrapper.find('.loading-spinner').exists()).toBe(true)
      expect(wrapper.find('.spinner').exists()).toBe(true)
      expect(wrapper.find('.loading-text').exists()).toBe(true)
    })

    it('应该渲染进度条', () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 1500,
          showProgress: true
        }
      })

      expect(wrapper.find('.loading-progress').exists()).toBe(true)
      expect(wrapper.find('.progress-bar').exists()).toBe(true)
    })

    it('应该渲染加载提示', () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 1500,
          showProgress: true
        }
      })

      expect(wrapper.find('.loading-tips').exists()).toBe(true)
    })

    it('应该渲染错误状态', async () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 100,
          showProgress: true
        }
      })

      // Fast forward to trigger timeout
      vi.advanceTimersByTime(150)

      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.hasError).toBe(true)
      expect(wrapper.find('.error-container').exists()).toBe(true)
      expect(wrapper.find('.error-content').exists()).toBe(true)
    })

    it('应该渲染默认插槽内容', () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 1500,
          showProgress: true
        },
        slots: {
          default: '<div class="test-content">页面内容</div>'
        }
      })

      // Initially, loading state should be true, so slot content should not be visible
      expect(wrapper.find('.test-content').exists()).toBe(false)
    })

    it('应该在加载完成后显示默认插槽内容', async () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 1500,
          showProgress: true
        },
        slots: {
          default: '<div class="test-content">页面内容</div>'
        }
      })

      // Trigger finish loading
      wrapper.vm.finishLoading()
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.isLoading).toBe(false)
      expect(wrapper.find('.test-content').exists()).toBe(true)
      expect(wrapper.find('.test-content').text()).toBe('页面内容')
    })
  })

  describe('Props 测试', () => {
    it('应该正确接收和处理 props', () => {
      const props = {
        timeout: 2000,
        showProgress: false
      }

      const wrapper = mount(PageLoadingGuard, { props })
      expect(wrapper.props()).toEqual(props)
    })

    it('应该使用默认 props 值', () => {
      const wrapper = mount(PageLoadingGuard)
      expect(wrapper.props('timeout')).toBe(1500)
      expect(wrapper.props('showProgress')).toBe(true)
    })
  })

  describe('事件测试', () => {
    it('应该触发 loaded 事件', () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 1500,
          showProgress: true
        }
      })

      wrapper.vm.finishLoading()
      expect(wrapper.emitted('loaded')).toBeTruthy()
    })

    it('应该触发 timeout 事件', async () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 100,
          showProgress: true
        }
      })

      // Fast forward to trigger timeout
      vi.advanceTimersByTime(150)
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('timeout')).toBeTruthy()
    })

    it('应该触发 retry 事件', () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 1500,
          showProgress: true
        }
      })

      wrapper.vm.handleRetry()
      expect(wrapper.emitted('retry')).toBeTruthy()
    })
  })

  describe('方法测试', () => {
    it('应该正确启动加载', () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 1500,
          showProgress: true
        }
      })

      wrapper.vm.startLoading()
      
      expect(wrapper.vm.isLoading).toBe(true)
      expect(wrapper.vm.hasError).toBe(false)
      expect(wrapper.vm.progress).toBe(0)
    })

    it('应该正确完成加载', () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 1500,
          showProgress: true
        }
      })

      wrapper.vm.finishLoading()
      
      expect(wrapper.vm.isLoading).toBe(false)
      expect(wrapper.vm.progress).toBe(100)
    })

    it('应该正确处理超时', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 100,
          showProgress: true
        }
      })

      wrapper.vm.handleTimeout()
      
      expect(wrapper.vm.isLoading).toBe(false)
      expect(wrapper.vm.hasError).toBe(true)
      expect(consoleSpy).toHaveBeenCalledWith('⚠️ PageLoadingGuard: 页面加载超时')
      
      consoleSpy.mockRestore()
    })

    it('应该清除所有定时器', () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 1500,
          showProgress: true
        }
      })

      // Simulate setting timers
      wrapper.vm.timeoutId = setTimeout(() => {}, 1000)
      wrapper.vm.progressInterval = setInterval(() => {}, 200)
      wrapper.vm.tipInterval = setInterval(() => {}, 800)

      wrapper.vm.clearAllTimers()
      
      expect(wrapper.vm.timeoutId).toBe(null)
      expect(wrapper.vm.progressInterval).toBe(null)
      expect(wrapper.vm.tipInterval).toBe(null)
    })

    it('应该处理重试操作', () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 1500,
          showProgress: true
        }
      })

      const reloadSpy = vi.spyOn(window.location, 'reload').mockImplementation(() => {})
      
      wrapper.vm.handleRetry()
      
      expect(wrapper.vm.hasError).toBe(false)
      expect(wrapper.emitted('retry')).toBeTruthy()
      expect(reloadSpy).toHaveBeenCalled()
      
      reloadSpy.mockRestore()
    })

    it('应该处理返回首页操作', () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 1500,
          showProgress: true
        }
      })

      wrapper.vm.handleGoHome()
      
      expect(mockRouter.push).toHaveBeenCalledWith('/')
    })
  })

  describe('生命周期测试', () => {
    it('应该在 onMounted 时启动加载', () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 1500,
          showProgress: true
        }
      })

      expect(wrapper.vm.isLoading).toBe(true)
      expect(wrapper.vm.hasError).toBe(false)
    })

    it('应该在 onMounted 时检查快速加载', () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 1500,
          showProgress: true
        }
      })

      // checkFastLoad should be called
      expect(wrapper.vm.isLoading).toBe(true)
    })

    it('应该在 onUnmounted 时清除定时器', () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 1500,
          showProgress: true
        }
      })

      const clearTimersSpy = vi.spyOn(wrapper.vm, 'clearAllTimers')
      
      wrapper.unmount()
      
      expect(clearTimersSpy).toHaveBeenCalled()
    })
  })

  describe('进度条测试', () => {
    it('应该正确更新进度条', async () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 1500,
          showProgress: true
        }
      })

      expect(wrapper.vm.progress).toBe(0)
      
      // Fast forward to let progress update
      vi.advanceTimersByTime(300)
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.progress).toBeGreaterThan(0)
      expect(wrapper.vm.progress).toBeLessThanOrEqual(90)
    })

    it('应该在进度达到90%时停止增长', async () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 1500,
          showProgress: true
        }
      })

      // Fast forward enough time to reach max progress
      vi.advanceTimersByTime(2000)
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.progress).toBeLessThanOrEqual(90)
    })

    it('应该在 showProgress 为 false 时不显示进度条', () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 1500,
          showProgress: false
        }
      })

      expect(wrapper.find('.loading-progress').exists()).toBe(false)
    })
  })

  describe('加载提示测试', () => {
    it('应该正确轮换加载提示', async () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 1500,
          showProgress: true
        }
      })

      expect(wrapper.vm.showTips).toBe(false)
      
      // Fast forward to show tips
      vi.advanceTimersByTime(1200)
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.showTips).toBe(true)
      expect(wrapper.vm.currentTip).toBe('正在连接服务器...')
      
      // Fast forward to rotate tips
      vi.advanceTimersByTime(900)
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.currentTip).toBe('正在验证用户权限...')
    })

    it('应该包含所有预定义的加载提示', () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 1500,
          showProgress: true
        }
      })

      const expectedTips = [
        '正在连接服务器...',
        '正在验证用户权限...',
        '正在加载页面数据...',
        '正在优化显示效果...'
      ]

      expect(wrapper.vm.loadingTips).toEqual(expectedTips)
    })
  })

  describe('快速加载测试', () => {
    it('应该在 localhost:5173 环境下快速完成加载', async () => {
      // Mock localhost:5173 hostname
      const originalHostname = window.location.hostname
      Object.defineProperty(window.location, 'hostname', {
        value: 'localhost:5173',
        writable: true
      })

      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 1500,
          showProgress: true
        }
      })

      // Fast forward to trigger quick load
      vi.advanceTimersByTime(150)
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.isLoading).toBe(false)

      // Restore hostname
      Object.defineProperty(window.location, 'hostname', {
        value: originalHostname,
        writable: true
      })
    })

    it('应该在非 localhost:5173 环境下正常快速加载', async () => {
      // Mock non-localhost:5173 hostname
      const originalHostname = window.location.hostname
      Object.defineProperty(window.location, 'hostname', {
        value: 'example.com',
        writable: true
      })

      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 1500,
          showProgress: true
        }
      })

      // Fast forward to trigger quick load
      vi.advanceTimersByTime(600)
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.isLoading).toBe(false)

      // Restore hostname
      Object.defineProperty(window.location, 'hostname', {
        value: originalHostname,
        writable: true
      })
    })
  })

  describe('错误处理测试', () => {
    it('应该显示错误信息', async () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 100,
          showProgress: true
        }
      })

      // Trigger timeout
      vi.advanceTimersByTime(150)
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.error-container').exists()).toBe(true)
      expect(wrapper.text()).toContain('页面加载超时')
      expect(wrapper.text()).toContain('抱歉，页面加载时间过长')
    })

    it('应该显示解决方案列表', async () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 100,
          showProgress: true
        }
      })

      // Trigger timeout
      vi.advanceTimersByTime(150)
      await wrapper.vm.$nextTick()

      const solutions = wrapper.find('.error-solutions')
      expect(solutions.exists()).toBe(true)
      
      const solutionItems = solutions.findAll('li')
      expect(solutionItems.length).toBe(3)
      expect(solutionItems[0].text()).toContain('刷新页面重试')
      expect(solutionItems[1].text()).toContain('检查网络连接')
      expect(solutionItems[2].text()).toContain('返回首页')
    })

    it('应该显示错误操作按钮', async () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 100,
          showProgress: true
        }
      })

      // Trigger timeout
      vi.advanceTimersByTime(150)
      await wrapper.vm.$nextTick()

      const errorActions = wrapper.find('.error-actions')
      expect(errorActions.exists()).toBe(true)
      
      const buttons = errorActions.findAll('button')
      expect(buttons.length).toBe(2)
      expect(buttons[0].text()).toBe('重试')
      expect(buttons[1].text()).toBe('返回首页')
    })
  })

  describe('边界情况测试', () => {
    it('应该处理超时时间为0的情况', () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 0,
          showProgress: true
        }
      })

      expect(wrapper.props('timeout')).toBe(0)
    })

    it('应该处理负的超时时间', () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: -100,
          showProgress: true
        }
      })

      expect(wrapper.props('timeout')).toBe(-100)
    })

    it('应该处理非常大的超时时间', () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 999999,
          showProgress: true
        }
      })

      expect(wrapper.props('timeout')).toBe(999999)
    })

    it('应该处理定时器清理时的空值', () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 1500,
          showProgress: true
        }
      })

      // Set timers to null
      wrapper.vm.timeoutId = null
      wrapper.vm.progressInterval = null
      wrapper.vm.tipInterval = null

      expect(() => {
        wrapper.vm.clearAllTimers()
      }).not.toThrow()
    })
  })

  describe('性能测试', () => {
    it('应该快速渲染组件', () => {
      const start = performance.now()
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 1500,
          showProgress: true
        }
      })
      const end = performance.now()

      expect(wrapper.find('.page-loading-guard').exists()).toBe(true)
      expect(end - start).toBeLessThan(100) // 应该在100ms内完成渲染
    })

    it('应该高效处理进度更新', async () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 1500,
          showProgress: true
        }
      })

      const startTime = performance.now()
      
      // Simulate multiple progress updates
      for (let i = 0; i < 10; i++) {
        vi.advanceTimersByTime(200)
        await wrapper.vm.$nextTick()
      }
      
      const endTime = performance.now()
      
      expect(wrapper.vm.progress).toBeGreaterThan(0)
      expect(endTime - startTime).toBeLessThan(1000) // 应该在1秒内完成
    })
  })

  describe('可访问性测试', () => {
    it('应该有适当的语义化结构', () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 1500,
          showProgress: true
        }
      })

      expect(wrapper.find('.page-loading-guard').exists()).toBe(true)
      expect(wrapper.find('.loading-container').exists()).toBe(true)
      expect(wrapper.find('.loading-spinner').exists()).toBe(true)
    })

    it('应该支持键盘导航', async () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 100,
          showProgress: true
        }
      })

      // Trigger error state
      vi.advanceTimersByTime(150)
      await wrapper.vm.$nextTick()

      const retryButton = wrapper.find('.retry-btn')
      await retryButton.trigger('keydown', { key: 'Enter' })
      
      expect(wrapper.emitted('retry')).toBeTruthy()
    })

    it('应该有适当的按钮文本', async () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 100,
          showProgress: true
        }
      })

      // Trigger error state
      vi.advanceTimersByTime(150)
      await wrapper.vm.$nextTick()

      const retryButton = wrapper.find('.retry-btn')
      const homeButton = wrapper.find('.home-btn')
      
      expect(retryButton.text()).toBe('重试')
      expect(homeButton.text()).toBe('返回首页')
    })
  })

  describe('样式测试', () => {
    it('应该应用正确的CSS类', () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 1500,
          showProgress: true
        }
      })

      expect(wrapper.find('.page-loading-guard').exists()).toBe(true)
      expect(wrapper.find('.loading-container').exists()).toBe(true)
      expect(wrapper.find('.loading-spinner').exists()).toBe(true)
      expect(wrapper.find('.spinner').exists()).toBe(true)
      expect(wrapper.find('.loading-text').exists()).toBe(true)
    })

    it('应该有正确的加载动画', () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 1500,
          showProgress: true
        }
      })

      const spinner = wrapper.find('.spinner')
      expect(spinner.exists()).toBe(true)
    })

    it('应该有正确的进度条样式', () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 1500,
          showProgress: true
        }
      })

      const progressBar = wrapper.find('.progress-bar')
      expect(progressBar.exists()).toBe(true)
    })

    it('应该有正确的错误样式', async () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 100,
          showProgress: true
        }
      })

      // Trigger error state
      vi.advanceTimersByTime(150)
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.error-container').exists()).toBe(true)
      expect(wrapper.find('.error-content').exists()).toBe(true)
      expect(wrapper.find('.error-solutions').exists()).toBe(true)
      expect(wrapper.find('.error-actions').exists()).toBe(true)
    })
  })

  describe('集成测试', () => {
    it('应该与路由器正确集成', () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 1500,
          showProgress: true
        }
      })

      wrapper.vm.handleGoHome()
      expect(mockRouter.push).toHaveBeenCalledWith('/')
    })

    it('应该与 window.location 正确集成', () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 1500,
          showProgress: true
        }
      })

      const reloadSpy = vi.spyOn(window.location, 'reload').mockImplementation(() => {})
      
      wrapper.vm.handleRetry()
      
      expect(reloadSpy).toHaveBeenCalled()
      
      reloadSpy.mockRestore()
    })

    it('应该与定时器系统正确集成', () => {
      const wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 1500,
          showProgress: true
        }
      })

      // Verify that timers are set up correctly
      expect(wrapper.vm.timeoutId).not.toBeNull()
      expect(wrapper.vm.progressInterval).not.toBeNull()
      expect(wrapper.vm.tipInterval).not.toBeNull()

      wrapper.vm.clearAllTimers()

      expect(wrapper.vm.timeoutId).toBeNull()
      expect(wrapper.vm.progressInterval).toBeNull()
      expect(wrapper.vm.tipInterval).toBeNull()
    })
  })
})