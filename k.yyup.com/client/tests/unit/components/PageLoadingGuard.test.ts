import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import PageLoadingGuard from '@/components/PageLoadingGuard.vue'

// Mock Vue Router
const mockPush = vi.fn()
const mockRouter = {
  push: mockPush
}

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter
}))

// Mock navigation timeout fix
vi.mock('../utils/navigation-timeout-fix', () => ({
  navigationTimeoutFix: {}
}))

// 控制台错误检测变量
let consoleSpy: any

describe('PageLoadingGuard', () => {
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
  let wrapper: any
  let originalLocation: Location

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    
    // Mock window.location
    originalLocation = window.location
    Object.defineProperty(window, 'location', {
      value: {
        hostname: 'localhost',
        reload: vi.fn()
      },
      writable: true
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    wrapper = mount(PageLoadingGuard, {
      props: {
        timeout: 1500,
        showProgress: true
      },
      slots: {
        default: '<div class="test-content">Page Content</div>'
      }
    })
  })

  afterEach(() => {
    if (wrapper) => {
      wrapper.unmount()
    }
    vi.useRealTimers()
    window.location = originalLocation
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  it('renders properly with default props', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.page-loading-guard').exists()).toBe(true)
  })

  it('shows loading state initially', () => {
    expect(wrapper.vm.isLoading).toBe(true)
    expect(wrapper.vm.hasError).toBe(false)
    expect(wrapper.find('.loading-container').exists()).toBe(true)
    expect(wrapper.find('.error-container').exists()).toBe(false)
  })

  it('shows default loading text', () => {
    expect(wrapper.vm.loadingText).toBe('正在加载...')
    expect(wrapper.find('.loading-text').text()).toBe('正在加载...')
  })

  it('shows spinner animation', () => {
    expect(wrapper.find('.spinner').exists()).toBe(true)
    expect(wrapper.find('.loading-progress').exists()).toBe(true)
    expect(wrapper.find('.progress-bar').exists()).toBe(true)
  })

  it('shows loading tips after delay', async () => {
    expect(wrapper.vm.showTips).toBe(false)
    
    vi.advanceTimersByTime(1000)
    await nextTick()
    
    expect(wrapper.vm.showTips).toBe(true)
    expect(wrapper.vm.currentTip).toBe('正在连接服务器...')
    expect(wrapper.find('.loading-tips').exists()).toBe(true)
  })

  it('cycles through loading tips', async () => {
    vi.advanceTimersByTime(1000)
    await nextTick()
    
    expect(wrapper.vm.currentTip).toBe('正在连接服务器...')
    
    vi.advanceTimersByTime(800)
    await nextTick()
    
    expect(wrapper.vm.currentTip).toBe('正在验证用户权限...')
    
    vi.advanceTimersByTime(800)
    await nextTick()
    
    expect(wrapper.vm.currentTip).toBe('正在加载页面数据...')
  })

  it('updates progress bar when showProgress is true', async () => {
    expect(wrapper.vm.progress).toBe(0)
    
    vi.advanceTimersByTime(200)
    await nextTick()
    
    expect(wrapper.vm.progress).toBeGreaterThan(0)
    expect(wrapper.vm.progress).toBeLessThanOrEqual(90)
  })

  it('does not show progress bar when showProgress is false', async () => {
    wrapper = mount(PageLoadingGuard, {
      props: {
        timeout: 1500,
        showProgress: false
      },
      slots: {
        default: '<div>Content</div>'
      }
    })
    
    expect(wrapper.find('.loading-progress').exists()).toBe(false)
  })

  it('finishes loading and shows content', async () => {
    wrapper.vm.finishLoading()
    await nextTick()
    
    expect(wrapper.vm.isLoading).toBe(false)
    expect(wrapper.vm.hasError).toBe(false)
    expect(wrapper.find('.loading-container').exists()).toBe(false)
    expect(wrapper.find('.test-content').exists()).toBe(true)
    expect(wrapper.emitted('loaded')).toBeTruthy()
  })

  it('handles timeout and shows error state', async () => {
    vi.advanceTimersByTime(1500)
    await nextTick()
    
    expect(wrapper.vm.isLoading).toBe(false)
    expect(wrapper.vm.hasError).toBe(true)
    expect(wrapper.find('.error-container').exists()).toBe(true)
    expect(wrapper.find('.loading-container').exists()).toBe(false)
    expect(wrapper.emitted('timeout')).toBeTruthy()
  })

  it('shows error content with correct text', async () => {
    vi.advanceTimersByTime(1500)
    await nextTick()
    
    expect(wrapper.find('.error-content h3').text()).toBe('页面加载超时')
    expect(wrapper.find('.error-content p').text()).toContain('页面加载时间过长')
  })

  it('shows error solutions list', async () => {
    vi.advanceTimersByTime(1500)
    await nextTick()
    
    const solutions = wrapper.findAll('.error-solutions li')
    expect(solutions.length).toBe(3)
    expect(solutions[0].text()).toBe('刷新页面重试')
    expect(solutions[1].text()).toBe('检查网络连接')
    expect(solutions[2].text()).toBe('返回首页')
  })

  it('handles retry action', async () => {
    vi.advanceTimersByTime(1500)
    await nextTick()
    
    const retryButton = wrapper.find('.retry-btn')
    await retryButton.trigger('click')
    
    expect(wrapper.vm.hasError).toBe(false)
    expect(wrapper.emitted('retry')).toBeTruthy()
    expect(window.location.reload).toHaveBeenCalled()
  })

  it('handles go home action', async () => {
    vi.advanceTimersByTime(1500)
    await nextTick()
    
    const homeButton = wrapper.find('.home-btn')
    await homeButton.trigger('click')
    
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('uses shorter timeout for localhost:5173 hostname', async () => {
    Object.defineProperty(window, 'location', {
      value: {
        hostname: 'localhost:5173',
        reload: vi.fn()
      },
      writable: true
    })
    
    wrapper = mount(PageLoadingGuard, {
      props: {
        timeout: 1500,
        showProgress: true
      },
      slots: {
        default: '<div>Content</div>'
      }
    })
    
    // Should timeout faster for localhost:5173
    vi.advanceTimersByTime(800)
    await nextTick()
    
    expect(wrapper.vm.hasError).toBe(true)
  })

  it('finishes loading faster for localhost:5173 hostname', async () => {
    Object.defineProperty(window, 'location', {
      value: {
        hostname: 'localhost:5173',
        reload: vi.fn()
      },
      writable: true
    })
    
    wrapper = mount(PageLoadingGuard, {
      props: {
        timeout: 1500,
        showProgress: true
      },
      slots: {
        default: '<div>Content</div>'
      }
    })
    
    vi.advanceTimersByTime(100)
    await nextTick()
    
    expect(wrapper.vm.isLoading).toBe(false)
    expect(wrapper.find('.test-content').exists()).toBe(true)
  })

  it('finishes loading faster for other hostnames', async () => {
    Object.defineProperty(window, 'location', {
      value: {
        hostname: 'localhost',
        reload: vi.fn()
      },
      writable: true
    })
    
    wrapper = mount(PageLoadingGuard, {
      props: {
        timeout: 1500,
        showProgress: true
      },
      slots: {
        default: '<div>Content</div>'
      }
    })
    
    vi.advanceTimersByTime(500)
    await nextTick()
    
    expect(wrapper.vm.isLoading).toBe(false)
    expect(wrapper.find('.test-content').exists()).toBe(true)
  })

  it('clears all timers on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
    
    wrapper.unmount()
    
    // Should clear timers even if they exist
    expect(clearTimeoutSpy).toHaveBeenCalled()
    expect(clearIntervalSpy).toHaveBeenCalled()
  })

  it('clears all timers when finishing loading', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
    
    wrapper.vm.finishLoading()
    
    expect(clearTimeoutSpy).toHaveBeenCalled()
    expect(clearIntervalSpy).toHaveBeenCalled()
  })

  it('clears all timers on timeout', async () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
    
    vi.advanceTimersByTime(1500)
    await nextTick()
    
    expect(clearTimeoutSpy).toHaveBeenCalled()
    expect(clearIntervalSpy).toHaveBeenCalled()
  })

  it('has correct default props', () => {
    expect(wrapper.vm.timeout).toBe(1500)
    expect(wrapper.vm.showProgress).toBe(true)
  })

  it('has correct initial state', () => {
    expect(wrapper.vm.isLoading).toBe(true)
    expect(wrapper.vm.hasError).toBe(false)
    expect(wrapper.vm.loadingText).toBe('正在加载...')
    expect(wrapper.vm.progress).toBe(0)
    expect(wrapper.vm.showTips).toBe(false)
    expect(wrapper.vm.currentTip).toBe('')
  })

  it('has correct loading tips array', () => {
    expect(wrapper.vm.loadingTips).toEqual([
      '正在连接服务器...',
      '正在验证用户权限...',
      '正在加载页面数据...',
      '正在优化显示效果...'
    ])
  })

  it('applies correct CSS classes', () => {
    expect(wrapper.find('.page-loading-guard').exists()).toBe(true)
    expect(wrapper.find('.loading-spinner').exists()).toBe(true)
    expect(wrapper.find('.spinner').exists()).toBe(true)
  })

  it('shows slot content when not loading and no error', async () => {
    wrapper.vm.finishLoading()
    await nextTick()
    
    expect(wrapper.find('.test-content').exists()).toBe(true)
    expect(wrapper.find('.test-content').text()).toBe('Page Content')
  })

  it('does not show slot content when loading', () => {
    expect(wrapper.find('.test-content').exists()).toBe(false)
  })

  it('does not show slot content when has error', async () => {
    vi.advanceTimersByTime(1500)
    await nextTick()
    
    expect(wrapper.find('.test-content').exists()).toBe(false)
  })

  it('sets progress to 100 when finishing loading', async () => {
    expect(wrapper.vm.progress).toBeLessThan(100)
    
    wrapper.vm.finishLoading()
    await nextTick()
    
    expect(wrapper.vm.progress).toBe(100)
  })

  it('handles missing window.location gracefully', () => {
    const originalLocation = window.location
    delete (window as any).location
    
    expect(() => {
      wrapper = mount(PageLoadingGuard, {
        props: {
          timeout: 1500,
          showProgress: true
        },
        slots: {
          default: '<div>Content</div>'
        }
      })
    }).not.toThrow()
    
    window.location = originalLocation
  })

  it('handles missing router gracefully', () => {
    vi.mock('vue-router', () => ({
      useRouter: () => null
    }))
    
    wrapper = mount(PageLoadingGuard, {
      props: {
        timeout: 1500,
        showProgress: true
      },
      slots: {
        default: '<div>Content</div>'
      }
    })
    
    expect(wrapper.vm.handleGoHome).toBeDefined()
    expect(typeof wrapper.vm.handleGoHome).toBe('function')
  })
})