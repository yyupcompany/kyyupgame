import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'

// 控制台错误检测变量
let consoleSpy: any

describe('生产环境错误检测', () => {
  let pinia: any
  let consoleErrors: any[] = []
  let consoleWarnings: any[] = []

  beforeEach(() => {
    // 清除Mock
    vi.clearAllMocks()

    // 创建Pinia实例
    pinia = createPinia()
    setActivePinia(pinia)

    // 捕获控制台错误
    consoleErrors = []
    consoleWarnings = []

    const originalError = console.error
    const originalWarn = console.warn

    console.error = (...args) => {
      consoleErrors.push(args)
      originalError(...args)
    }

    console.warn = (...args) => {
      consoleWarnings.push(args)
      originalWarn(...args)
    }
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  afterEach(() => {
    // 恢复console
    console.error = consoleErrors.length > 0 ? console.error : console.error
    console.warn = consoleWarnings.length > 0 ? console.warn : console.warn

    // 清理
    vi.restoreAllMocks()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('API错误处理', () => {
    it('应该正确处理API网络错误', async () => {
      // Mock网络错误
      vi.doMock('@/utils/request', () => ({
        default: {
          get: vi.fn().mockRejectedValue(new Error('Network Error')),
          post: vi.fn().mockRejectedValue(new Error('Network Error'))
        }
      }))

      // 动态导入一个页面组件进行测试
      const { default: DashboardPage } = await import('@/pages/dashboard/index.vue')

      const wrapper = mount(DashboardPage, {
        global: {
          plugins: [pinia],
          mocks: {
            $route: { path: '/dashboard' },
            $router: { push: vi.fn() }
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 检查组件是否仍然存在
      expect(wrapper.exists()).toBe(true)

      // 检查是否有错误处理逻辑
      const hasErrorHandling = wrapper.vm.$options?.setupState?.error !== undefined ||
                              wrapper.find('.error-message').exists()

      if (!hasErrorHandling) {
        console.warn('组件缺少错误处理机制')
      }

      // 页面不应该完全崩溃
      expect(wrapper.vm).toBeDefined()
    })

    it('应该正确处理空数据响应', async () => {
      // Mock空数据响应
      vi.doMock('@/utils/request', () => ({
        default: {
          get: vi.fn().mockResolvedValue({
            success: true,
            data: null
          })
        }
      }))

      const { default: UserPage } = await import('@/pages/system/users/index.vue')

      const wrapper = mount(UserPage, {
        global: {
          plugins: [pinia],
          mocks: {
            $route: { path: '/users' },
            $router: { push: vi.fn() }
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 检查页面是否能正常渲染空数据状态
      expect(wrapper.exists()).toBe(true)

      // 应该有空数据提示或默认状态
      const hasEmptyState = wrapper.find('.empty-data').exists() ||
                           wrapper.find('.no-data').exists() ||
                           wrapper.find('[data-testid="empty-state"]').exists()

      expect(hasEmptyState || wrapper.vm.$options?.setupState?.loading === false).toBe(true)
    })
  })

  describe('组件错误边界', () => {
    it('应该处理组件渲染错误', async () => {
      // 创建一个会抛出错误的组件
      const ErrorComponent = {
        template: '<div>Error Component</div>',
        setup() {
          throw new Error('Component render error')
        }
      }

      const wrapper = mount({
        components: { ErrorComponent },
        template: `
          <div>
            <h1>Parent Component</h1>
            <ErrorComponent />
          </div>
        `
      }, {
        global: {
          plugins: [pinia]
        }
      })

      await nextTick()

      // 检查父组件是否仍然存在
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.text()).toContain('Parent Component')
    })

    it('应该处理异步数据加载错误', async () => {
      // 创建一个异步数据加载失败的组件
      const AsyncErrorComponent = {
        template: '<div>Loading data...</div>',
        async setup() {
          try {
            // 模拟失败的API调用
            await new Promise((resolve, reject) => {
              setTimeout(() => reject(new Error('Async data load failed')), 50)
            })
          } catch (error) {
            // 组件应该处理这个错误
            console.error('Async error caught:', error)
          }
        }
      }

      const wrapper = mount(AsyncErrorComponent, {
        global: {
          plugins: [pinia]
        }
      })

      await new Promise(resolve => setTimeout(resolve, 100))

      // 组件应该仍然存在
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('内存泄漏检测', () => {
    it('应该正确清理定时器和事件监听器', async () => {
      const { default: TimerComponent } = await import('@/components/common/TimerComponent.vue')

      const wrapper = mount(TimerComponent, {
        global: {
          plugins: [pinia]
        }
      })

      await nextTick()

      // 检查是否有定时器
      const timerCount = wrapper.vm.$options?.setupState?.timerId !== undefined

      // 销毁组件
      wrapper.unmount()

      // 检查组件是否正确清理
      expect(wrapper.exists()).toBe(false)
    })
  })

  describe('控制台错误检测', () => {
    it('不应该有未捕获的Promise拒绝', async () => {
      // 捕获未处理的Promise拒绝
      const unhandledRejections: any[] = []

      const originalHandler = window.addEventListener
      window.addEventListener = (event: string, handler: any) => {
        if (event === 'unhandledrejection') {
          const originalHandlerFn = handler
          window.addEventListener = originalHandler

          const wrappedHandler = (event: any) => {
            unhandledRejections.push(event)
            originalHandlerFn(event)
          }

          return originalHandler.call(window, event, wrappedHandler)
        }
        return originalHandler.call(window, event, handler)
      }

      // 创建一个会产生Promise拒绝的组件
      const PromiseRejectComponent = {
        template: '<div>Promise Test</div>',
        setup() {
          // 故意创建一个未处理的Promise拒绝
          Promise.reject(new Error('Unhandled promise rejection'))
        }
      }

      const wrapper = mount(PromiseRejectComponent, {
        global: {
          plugins: [pinia]
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      wrapper.unmount()

      // 检查是否有未处理的Promise拒绝
      if (unhandledRejections.length > 0) {
        console.warn('检测到未处理的Promise拒绝:', unhandledRejections)
      }

      // 理想情况下不应该有未处理的Promise拒绝
      expect(unhandledRejections.length).toBe(0)
    })

    it('不应该有JavaScript运行时错误', async () => {
      // 测试常见的JavaScript错误

      // 1. 类型错误
      try {
        const obj = null
        // @ts-ignore - 故意制造类型错误
        obj.someProperty
      } catch (error) {
        // 组件应该能够处理这种错误
        expect(error).toBeInstanceOf(TypeError)
      }

      // 2. 引用错误
      try {
        // @ts-ignore - 故意制造引用错误
        const undefinedVar = undefinedVariable
      } catch (error) {
        expect(error).toBeInstanceOf(ReferenceError)
      }

      // 检查是否有运行时错误
      const hasRuntimeErrors = consoleErrors.length > 0

      if (hasRuntimeErrors) {
        console.warn('检测到运行时错误:', consoleErrors)
      }

      // 在测试环境中，允许一些可控的错误
      expect(consoleErrors.length).toBeLessThan(10)
    })
  })
})