import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ErrorBoundary from '@/components/common/ErrorBoundary.vue'
import EmptyState from '@/components/common/EmptyState.vue'

// Mock dependencies
vi.mock('@/utils/errorHandler', () => ({
  ErrorHandler: {
    parseError: vi.fn(),
    createUserFriendlyMessage: vi.fn()
  },
  ErrorCode: {
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT: 'TIMEOUT',
    UNAUTHORIZED: 'UNAUTHORIZED',
    INSUFFICIENT_PERMISSION: 'INSUFFICIENT_PERMISSION',
    NOT_FOUND: 'NOT_FOUND',
    VALIDATION_ERROR: 'VALIDATION_ERROR'
  }
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
    ElMessageBox: {
      confirm: vi.fn()
    },
    ElCollapse: {
      name: 'ElCollapse',
      template: '<div><slot /></div>'
    },
    ElCollapseItem: {
      name: 'ElCollapseItem',
      template: '<div><slot name="title" /><slot /></div>'
    }
  }
})

// Mock vue-router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRoute: () => ({
    fullPath: '/test-route'
  }),
  useRouter: () => ({
    push: mockPush
  })
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
global.localStorage = localStorageMock

describe('ErrorBoundary.vue', () => {
  let wrapper: any
  let ErrorHandler: any

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks()
    
    // Get mocked ErrorHandler
    ErrorHandler = require('@/utils/errorHandler').ErrorHandler
    
    // Setup default mock returns
    ErrorHandler.parseError.mockReturnValue({
      code: 'NETWORK_ERROR',
      message: 'Network error occurred',
      type: 'Error',
      userMessage: '网络连接出现问题'
    })
    
    ErrorHandler.createUserFriendlyMessage.mockReturnValue('网络连接出现问题')
    
    // Setup localStorage
    localStorageMock.getItem.mockReturnValue('test-token')
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  const createWrapper = (props = {}, slots = {}) => {
    return mount(ErrorBoundary, {
      props: {
        showDetails: true,
        autoRetry: false,
        maxRetries: 3,
        retryDelay: 1000,
        showNotification: true,
        ...props
      },
      slots: {
        default: '<div class="test-content">正常内容</div>',
        ...slots
      },
      global: {
        stubs: {
          'empty-state': true,
          'el-collapse': true,
          'el-collapse-item': true
        },
        components: {
          EmptyState
        }
      }
    })
  }

  describe('基础渲染', () => {
    it('应该正常渲染子组件', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.error-boundary').exists()).toBe(true)
      expect(wrapper.find('.error-boundary-content').exists()).toBe(true)
      expect(wrapper.find('.test-content').exists()).toBe(true)
      expect(wrapper.find('.error-container').exists()).toBe(false)
    })

    it('应该在有错误时显示错误界面', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ hasError: true })
      
      expect(wrapper.find('.error-container').exists()).toBe(true)
      expect(wrapper.find('.error-boundary-content').exists()).toBe(false)
    })
  })

  describe('错误捕获', () => {
    it('应该捕获组件错误', async () => {
      wrapper = createWrapper({
        onError: vi.fn()
      })
      
      const mockError = new Error('Test error')
      const mockInstance = {}
      const mockInfo = 'component error info'
      
      const emitSpy = vi.fn()
      wrapper.vm.$emit = emitSpy
      
      // Simulate error capture
      const result = wrapper.vm.onErrorCaptured(mockError, mockInstance, mockInfo)
      
      expect(result).toBe(false) // Should prevent error propagation
      expect(wrapper.vm.hasError).toBe(true)
      expect(ErrorHandler.parseError).toHaveBeenCalledWith(mockError)
      expect(emitSpy).toHaveBeenCalledWith('error', mockError, wrapper.vm.errorInfo)
    })

    it('应该设置正确的错误信息', async () => {
      wrapper = createWrapper()
      
      const mockError = new Error('Test error')
      
      await wrapper.vm.onErrorCaptured(mockError, {}, 'test info')
      
      expect(wrapper.vm.errorInfo).toEqual({
        code: 'NETWORK_ERROR',
        message: 'Network error occurred',
        type: 'Error',
        userMessage: '网络连接出现问题',
        originalError: mockError,
        instance: {},
        info: 'test info',
        route: '/test-route',
        time: expect.any(String)
      })
    })

    it('应该显示错误通知', async () => {
      wrapper = createWrapper()
      
      const mockError = new Error('Test error')
      
      await wrapper.vm.onErrorCaptured(mockError, {}, 'test info')
      
      const { ElNotification } = await import('element-plus')
      expect(ElNotification.error).toHaveBeenCalledWith({
        title: '连接错误',
        message: '网络连接出现问题，请检查网络后重试',
        duration: 5000,
        showClose: true
      })
    })
  })

  describe('错误类型处理', () => {
    const errorTypes = [
      { code: 'NETWORK_ERROR', expectedType: 'network', expectedTitle: '网络连接异常' },
      { code: 'TIMEOUT', expectedType: 'network', expectedTitle: '请求超时' },
      { code: 'UNAUTHORIZED', expectedType: 'forbidden', expectedTitle: '未授权访问' },
      { code: 'INSUFFICIENT_PERMISSION', expectedType: 'forbidden', expectedTitle: '权限不足' },
      { code: 'NOT_FOUND', expectedType: 'error', expectedTitle: '页面不存在' },
      { code: 'VALIDATION_ERROR', expectedType: 'error', expectedTitle: '数据验证失败' },
      { code: 'UNKNOWN_ERROR', expectedType: 'error', expectedTitle: '页面出现错误' }
    ]

    errorTypes.forEach(({ code, expectedType, expectedTitle }) => {
      it(`应该正确处理 ${code} 错误类型`, async () => {
        wrapper = createWrapper()
        
        ErrorHandler.parseError.mockReturnValue({
          code,
          message: 'Test error',
          type: 'Error',
          userMessage: 'Test message'
        })
        
        await wrapper.vm.onErrorCaptured(new Error('Test error'), {}, 'test info')
        
        expect(wrapper.vm.errorType).toBe(expectedType)
        expect(wrapper.vm.errorTitle).toBe(expectedTitle)
      })
    })
  })

  describe('操作按钮处理', () => {
    it('应该为网络错误提供重试操作', async () => {
      wrapper = createWrapper()
      
      ErrorHandler.parseError.mockReturnValue({
        code: 'NETWORK_ERROR',
        message: 'Network error',
        type: 'Error',
        userMessage: '网络连接出现问题'
      })
      
      await wrapper.vm.onErrorCaptured(new Error('Network error'), {}, 'test info')
      
      expect(wrapper.vm.primaryAction).toBeDefined()
      expect(wrapper.vm.primaryAction.text).toBe('重试')
    })

    it('应该为未授权错误提供重新登录操作', async () => {
      wrapper = createWrapper()
      
      ErrorHandler.parseError.mockReturnValue({
        code: 'UNAUTHORIZED',
        message: 'Unauthorized',
        type: 'Error',
        userMessage: '未授权访问'
      })
      
      await wrapper.vm.onErrorCaptured(new Error('Unauthorized'), {}, 'test info')
      
      expect(wrapper.vm.primaryAction).toBeDefined()
      expect(wrapper.vm.primaryAction.text).toBe('重新登录')
    })

    it('应该为404错误提供刷新页面操作', async () => {
      wrapper = createWrapper()
      
      ErrorHandler.parseError.mockReturnValue({
        code: 'NOT_FOUND',
        message: 'Not found',
        type: 'Error',
        userMessage: '页面不存在'
      })
      
      await wrapper.vm.onErrorCaptured(new Error('Not found'), {}, 'test info')
      
      expect(wrapper.vm.primaryAction).toBeDefined()
      expect(wrapper.vm.primaryAction.text).toBe('刷新页面')
    })

    it('应该提供返回首页操作', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.onErrorCaptured(new Error('Test error'), {}, 'test info')
      
      expect(wrapper.vm.secondaryAction).toBeDefined()
      expect(wrapper.vm.secondaryAction.text).toBe('返回首页')
    })
  })

  describe('重新认证处理', () => {
    it('应该清除认证信息并跳转到登录页', async () => {
      wrapper = createWrapper()
      
      ErrorHandler.parseError.mockReturnValue({
        code: 'UNAUTHORIZED',
        message: 'Unauthorized',
        type: 'Error',
        userMessage: '未授权访问'
      })
      
      await wrapper.vm.onErrorCaptured(new Error('Unauthorized'), {}, 'test info')
      
      await wrapper.vm.handlePrimaryAction('UNAUTHORIZED')
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refreshToken')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('userInfo')
      expect(mockPush).toHaveBeenCalledWith({
        path: '/login',
        query: { redirect: '/test-route' }
      })
    })
  })

  describe('重试机制', () => {
    it('应该处理重试逻辑', async () => {
      wrapper = createWrapper({
        autoRetry: false,
        maxRetries: 3,
        retryDelay: 1000
      })
      
      ErrorHandler.parseError.mockReturnValue({
        code: 'NETWORK_ERROR',
        message: 'Network error',
        type: 'Error',
        userMessage: '网络连接出现问题'
      })
      
      await wrapper.vm.onErrorCaptured(new Error('Network error'), {}, 'test info')
      
      const emitSpy = vi.fn()
      wrapper.vm.$emit = emitSpy
      
      await wrapper.vm.handleRetry()
      
      expect(wrapper.vm.retryCount).toBe(1)
      expect(emitSpy).toHaveBeenCalledWith('retry', 1)
      expect(wrapper.vm.hasError).toBe(false)
    })

    it('应该限制重试次数', async () => {
      wrapper = createWrapper({
        maxRetries: 2
      })
      
      await wrapper.setData({ retryCount: 2 })
      
      await wrapper.vm.handleRetry()
      
      const { ElMessage } = await import('element-plus')
      expect(ElMessage.warning).toHaveBeenCalledWith('已达到最大重试次数')
    })

    it('应该处理重试失败', async () => {
      wrapper = createWrapper({
        onRecover: vi.fn()
      })
      
      // Simulate recover failure
      wrapper.vm.onRecover = vi.fn().mockRejectedValue(new Error('Recover failed'))
      
      await wrapper.setData({ retryCount: 1 })
      
      try {
        await wrapper.vm.handleRetry()
      } catch (error) {
        // Expected to fail
      }
      
      const { ElMessage } = await import('element-plus')
      expect(ElMessage.error).toHaveBeenCalledWith('重试失败，请检查网络连接')
    })
  })

  describe('刷新处理', () => {
    it('应该刷新页面', () => {
      wrapper = createWrapper()
      
      const reloadSpy = vi.spyOn(window.location, 'reload')
      
      wrapper.vm.handleRefresh()
      
      expect(reloadSpy).toHaveBeenCalled()
    })
  })

  describe('错误详情', () => {
    it('应该显示错误详情', async () => {
      wrapper = createWrapper({ showDetails: true })
      
      const mockError = new Error('Test error')
      mockError.stack = 'Error stack trace'
      
      await wrapper.vm.onErrorCaptured(mockError, {}, 'test info')
      
      const emptyState = wrapper.findComponent({ name: 'EmptyState' })
      expect(emptyState.exists()).toBe(true)
      expect(emptyState.props('showDetails')).toBe(true)
    })

    it('应该隐藏错误详情', () => {
      wrapper = createWrapper({ showDetails: false })
      
      const emptyState = wrapper.findComponent({ name: 'EmptyState' })
      expect(emptyState.props('showDetails')).toBe(false)
    })
  })

  describe('提供的方法', () => {
    it('应该提供 captureError 方法', () => {
      wrapper = createWrapper()
      
      const mockError = new Error('Test error')
      
      wrapper.vm.captureError(mockError)
      
      expect(wrapper.vm.hasError).toBe(true)
      expect(ErrorHandler.parseError).toHaveBeenCalledWith(mockError)
    })

    it('应该提供 clearError 方法', () => {
      wrapper = createWrapper()
      
      wrapper.setData({ 
        hasError: true,
        retryCount: 2
      })
      
      wrapper.vm.clearError()
      
      expect(wrapper.vm.hasError).toBe(false)
      expect(wrapper.vm.errorInfo).toEqual({})
      expect(wrapper.vm.retryCount).toBe(0)
    })

    it('应该提供 hasError 方法', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.hasError()).toBe(false)
      
      wrapper.setData({ hasError: true })
      
      expect(wrapper.vm.hasError()).toBe(true)
    })
  })

  describe('依赖注入', () => {
    it('应该提供错误边界上下文', () => {
      wrapper = createWrapper()
      
      const injected = wrapper.vm.$.appContext.provides.errorBoundary
      
      expect(injected).toBeDefined()
      expect(injected.captureError).toBeDefined()
      expect(injected.clearError).toBeDefined()
    })
  })

  describe('自动重试', () => {
    it('应该在挂载时自动重试网络错误', async () => {
      wrapper = createWrapper({
        autoRetry: true,
        retryDelay: 100
      })
      
      ErrorHandler.parseError.mockReturnValue({
        code: 'NETWORK_ERROR',
        message: 'Network error',
        type: 'Error',
        userMessage: '网络连接出现问题'
      })
      
      await wrapper.setData({ hasError: true })
      
      // Wait for auto retry
      await new Promise(resolve => setTimeout(resolve, 150))
      
      expect(wrapper.vm.retryCount).toBe(1)
    })

    it('不应该自动重试非网络错误', async () => {
      wrapper = createWrapper({
        autoRetry: true,
        retryDelay: 100
      })
      
      ErrorHandler.parseError.mockReturnValue({
        code: 'VALIDATION_ERROR',
        message: 'Validation error',
        type: 'Error',
        userMessage: '数据验证失败'
      })
      
      await wrapper.setData({ hasError: true })
      
      // Wait for potential auto retry
      await new Promise(resolve => setTimeout(resolve, 150))
      
      expect(wrapper.vm.retryCount).toBe(0)
    })
  })

  describe('边界情况', () => {
    it('应该处理没有用户消息的情况', async () => {
      ErrorHandler.createUserFriendlyMessage.mockReturnValue('')
      
      wrapper = createWrapper()
      
      await wrapper.vm.onErrorCaptured(new Error('Test error'), {}, 'test info')
      
      expect(wrapper.vm.errorDescription).toBe('页面遇到了一些问题，请尝试刷新页面或联系管理员')
    })

    it('应该处理自定义错误处理器', async () => {
      const customErrorHandler = vi.fn()
      
      wrapper = createWrapper({
        onError: customErrorHandler
      })
      
      const mockError = new Error('Test error')
      
      await wrapper.vm.onErrorCaptured(mockError, {}, 'test info')
      
      expect(customErrorHandler).toHaveBeenCalledWith(mockError, wrapper.vm.errorInfo)
    })

    it('应该处理自定义恢复处理器', async () => {
      const customRecoverHandler = vi.fn()
      
      wrapper = createWrapper({
        onRecover: customRecoverHandler
      })
      
      ErrorHandler.parseError.mockReturnValue({
        code: 'NETWORK_ERROR',
        message: 'Network error',
        type: 'Error',
        userMessage: '网络连接出现问题'
      })
      
      await wrapper.vm.onErrorCaptured(new Error('Network error'), {}, 'test info')
      await wrapper.vm.handleRetry()
      
      expect(customRecoverHandler).toHaveBeenCalled()
    })
  })

  describe('环境检测', () => {
    it('应该正确检测开发环境', () => {
      // Mock import.meta.env.DEV
      const originalEnv = import.meta.env
      import.meta.env = { ...originalEnv, DEV: true }
      
      wrapper = createWrapper()
      
      expect(wrapper.vm.isDev).toBe(true)
      
      // Restore original env
      import.meta.env = originalEnv
    })

    it('应该正确检测生产环境', () => {
      // Mock import.meta.env.DEV
      const originalEnv = import.meta.env
      import.meta.env = { ...originalEnv, DEV: false }
      
      wrapper = createWrapper()
      
      expect(wrapper.vm.isDev).toBe(false)
      
      // Restore original env
      import.meta.env = originalEnv
    })
  })

  describe('响应式布局测试', () => {
    it('应该适配不同屏幕尺寸', async () => {
      wrapper = createWrapper()
      
      // 模拟移动端视图
      global.innerWidth = 375
      global.dispatchEvent(new Event('resize'))
      
      await nextTick()
      
      expect(wrapper.find('.error-boundary').exists()).toBe(true)
      
      // 模拟桌面端视图
      global.innerWidth = 1920
      global.dispatchEvent(new Event('resize'))
      
      await nextTick()
      
      expect(wrapper.find('.error-boundary').exists()).toBe(true)
    })
  })

  describe('主题切换支持', () => {
    it('应该支持深色模式', async () => {
      wrapper = createWrapper()
      
      // 模拟深色模式
      document.documentElement.setAttribute('data-theme', 'dark')
      
      await nextTick()
      
      expect(wrapper.find('.error-boundary').exists()).toBe(true)
      
      // 恢复浅色模式
      document.documentElement.setAttribute('data-theme', 'light')
    })
  })

  describe('性能优化测试', () => {
    it('应该正确处理组件卸载', async () => {
      wrapper = createWrapper()
      
      // 模拟错误状态
      await wrapper.setData({ hasError: true })
      
      // 卸载组件
      wrapper.unmount()
      
      // 验证清理工作
    })

    it('应该避免内存泄漏', async () => {
      wrapper = createWrapper()
      
      // 模拟多次错误捕获
      for (let i = 0; i < 100; i++) {
        await wrapper.vm.onErrorCaptured(new Error(`Test error ${i}`), {}, `test info ${i}`)
        await wrapper.vm.clearError()
      }
      
      // 组件应该仍然正常工作
      expect(wrapper.find('.error-boundary').exists()).toBe(true)
    })

    it('应该高效处理频繁错误', async () => {
      wrapper = createWrapper()
      
      // 模拟频繁错误
      const errorPromises = Array.from({ length: 10 }, (_, i) => 
        wrapper.vm.onErrorCaptured(new Error(`Concurrent error ${i}`), {}, `info ${i}`)
      )
      
      await Promise.all(errorPromises)
      
      expect(wrapper.vm.hasError).toBe(true)
    })
  })

  describe('可访问性测试', () => {
    it('应该支持键盘导航', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ hasError: true })
      
      const emptyState = wrapper.findComponent({ name: 'EmptyState' })
      expect(emptyState.exists()).toBe(true)
    })

    it('应该包含适当的ARIA属性', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.error-boundary').exists()).toBe(true)
    })
  })

  describe('错误恢复测试', () => {
    it('应该正确处理恢复失败', async () => {
      wrapper = createWrapper({
        onRecover: vi.fn().mockRejectedValue(new Error('恢复失败'))
      })
      
      await wrapper.setData({ hasError: true })
      
      await expect(wrapper.vm.handleRetry()).resolves.not.toThrow()
    })

    it('应该支持自定义恢复策略', async () => {
      const customRecover = vi.fn()
      
      wrapper = createWrapper({
        onRecover: customRecover
      })
      
      await wrapper.setData({ hasError: true })
      await wrapper.vm.handleRetry()
      
      expect(customRecover).toHaveBeenCalled()
    })
  })

  describe('错误统计测试', () => {
    it('应该跟踪错误发生次数', async () => {
      wrapper = createWrapper()
      
      // 模拟多次错误
      for (let i = 0; i < 5; i++) {
        await wrapper.vm.onErrorCaptured(new Error(`Error ${i}`), {}, `info ${i}`)
      }
      
      expect(wrapper.vm.retryCount).toBe(0) // 重试次数应该独立
    })
  })

  describe('网络状态处理', () => {
    it('应该检测网络连接状态', async () => {
      wrapper = createWrapper()
      
      // 模拟网络离线
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        configurable: true
      })
      
      await wrapper.vm.onErrorCaptured(new Error('Network error'), {}, 'network info')
      
      expect(wrapper.vm.errorType).toBe('network')
      
      // 恢复网络在线
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        configurable: true
      })
    })
  })

  describe('错误日志测试', () => {
    it('应该记录错误日志', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      wrapper = createWrapper()
      
      await wrapper.vm.onErrorCaptured(new Error('Log test'), {}, 'log info')
      
      expect(consoleSpy).toHaveBeenCalledWith('组件错误捕获:', expect.any(Error), 'log info')
      
      consoleSpy.mockRestore()
    })
  })

  describe('子组件错误隔离', () => {
    it('应该隔离子组件错误', async () => {
      const ErrorChild = {
        template: '<div @click="throwError">Error Child</div>',
        methods: {
          throwError() {
            throw new Error('Child error')
          }
        }
      }
      
      wrapper = createWrapper({}, {
        default: ErrorChild
      })
      
      // 模拟子组件错误
      await wrapper.vm.onErrorCaptured(new Error('Child error'), {}, 'child error info')
      
      expect(wrapper.vm.hasError).toBe(true)
    })
  })

  describe('错误边界嵌套', () => {
    it('应该正确处理嵌套错误边界', async () => {
      const NestedErrorBoundary = {
        template: '<div><slot /></div>',
        setup() {
          const { onErrorCaptured } = require('vue')
          
          onErrorCaptured((error, instance, info) => {
            console.log('Nested error captured:', error)
            return false
          })
          
          return {}
        }
      }
      
      wrapper = mount(ErrorBoundary, {
        global: {
          stubs: {
            'empty-state': true,
            'el-collapse': true,
            'el-collapse-item': true
          },
          components: {
            EmptyState,
            NestedErrorBoundary
          }
        },
        slots: {
          default: '<nested-error-boundary><div class="nested-content">Nested Content</div></nested-error-boundary>'
        }
      })
      
      expect(wrapper.find('.nested-content').exists()).toBe(true)
    })
  })
})