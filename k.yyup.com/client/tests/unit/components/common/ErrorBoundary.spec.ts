import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createRouter, createWebHistory, Router } from 'vue-router'
import ErrorBoundary from '@/components/common/ErrorBoundary.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ElementPlus, { ElMessage, ElNotification } from 'element-plus'

// Mock error handler utility
vi.mock('@/utils/errorHandler', () => ({
  ErrorHandler: {
    parseError: vi.fn((error) => ({
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'Unknown error',
      type: error.name || 'Error'
    })),
    createUserFriendlyMessage: vi.fn((error) => error.message || 'An error occurred')
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

// Mock Element Plus message and notification
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
    }
  }
})

// 控制台错误检测变量
let consoleSpy: any

describe('ErrorBoundary.vue', () => {
  let wrapper: any
  let router: Router

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
        { path: '/login', name: 'login', component: { template: '<div>Login</div>' } }
      ]
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  const createWrapper = (props: any = {}, slots: any = {}) => {
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
        default: '<div class="test-content">Test Content</div>',
        ...slots
      },
      global: {
        plugins: [router, ElementPlus],
        stubs: {
          EmptyState: true,
          'el-collapse': true,
          'el-collapse-item': true
        }
      }
    })
  }

  describe('组件渲染测试', () => {
    it('应该正确渲染错误边界组件', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.error-boundary').exists()).toBe(true)
      expect(wrapper.find('.error-boundary-content').exists()).toBe(true)
      expect(wrapper.find('.test-content').exists()).toBe(true)
    })

    it('应该显示错误界面当有错误时', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ hasError: true })
      
      expect(wrapper.find('.error-container').exists()).toBe(true)
      expect(wrapper.findComponent(EmptyState).exists()).toBe(true)
      expect(wrapper.find('.error-boundary-content').exists()).toBe(false)
    })

    it('应该显示正常内容当没有错误时', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.error-boundary-content').exists()).toBe(true)
      expect(wrapper.find('.test-content').exists()).toBe(true)
      expect(wrapper.find('.error-container').exists()).toBe(false)
    })

    it('应该显示错误详情当showDetails为true时', async () => {
      wrapper = createWrapper({ showDetails: true })
      await wrapper.setData({ hasError: true })
      
      expect(wrapper.find('.error-details').exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'ElCollapse' }).exists()).toBe(true)
    })

    it('应该隐藏错误详情当showDetails为false时', async () => {
      wrapper = createWrapper({ showDetails: false })
      await wrapper.setData({ hasError: true })
      
      expect(wrapper.find('.error-details').exists()).toBe(false)
    })
  })

  describe('props传递测试', () => {
    it('应该正确接收showDetails prop', () => {
      wrapper = createWrapper({ showDetails: false })
      
      expect(wrapper.props('showDetails')).toBe(false)
    })

    it('应该正确接收autoRetry prop', () => {
      wrapper = createWrapper({ autoRetry: true })
      
      expect(wrapper.props('autoRetry')).toBe(true)
    })

    it('应该正确接收maxRetries prop', () => {
      wrapper = createWrapper({ maxRetries: 5 })
      
      expect(wrapper.props('maxRetries')).toBe(5)
    })

    it('应该正确接收retryDelay prop', () => {
      wrapper = createWrapper({ retryDelay: 2000 })
      
      expect(wrapper.props('retryDelay')).toBe(2000)
    })

    it('应该正确接收showNotification prop', () => {
      wrapper = createWrapper({ showNotification: false })
      
      expect(wrapper.props('showNotification')).toBe(false)
    })

    it('应该正确接收onError和onRecover回调', () => {
      const onError = vi.fn()
      const onRecover = vi.fn()
      
      wrapper = createWrapper({ onError, onRecover })
      
      expect(wrapper.props('onError')).toBe(onError)
      expect(wrapper.props('onRecover')).toBe(onRecover)
    })

    it('应该使用默认的props值', () => {
      wrapper = createWrapper()
      
      expect(wrapper.props('showDetails')).toBe(true)
      expect(wrapper.props('autoRetry')).toBe(false)
      expect(wrapper.props('maxRetries')).toBe(3)
      expect(wrapper.props('retryDelay')).toBe(1000)
      expect(wrapper.props('showNotification')).toBe(true)
    })
  })

  describe('错误处理测试', () => {
    it('应该捕获组件错误', async () => {
      const mockError = new Error('Test error')
      const mockParseError = require('@/utils/errorHandler').ErrorHandler.parseError
      mockParseError.mockReturnValue({
        code: 'NETWORK_ERROR',
        message: 'Network error occurred',
        type: 'NetworkError'
      })

      wrapper = createWrapper()
      
      // 模拟错误捕获
      await wrapper.vm.onErrorCaptured(mockError, null, 'component info')
      
      expect(wrapper.vm.hasError).toBe(true)
      expect(wrapper.vm.errorInfo.code).toBe('NETWORK_ERROR')
      expect(wrapper.vm.errorInfo.message).toBe('Network error occurred')
      expect(wrapper.emitted('error')).toBeTruthy()
    })

    it('应该显示错误通知', async () => {
      const mockError = new Error('Test error')
      const mockParseError = require('@/utils/errorHandler').ErrorHandler.parseError
      mockParseError.mockReturnValue({
        code: 'NETWORK_ERROR',
        message: 'Network error occurred',
        type: 'NetworkError'
      })

      wrapper = createWrapper({ showNotification: true })
      
      await wrapper.vm.onErrorCaptured(mockError, null, 'component info')
      
      expect(ElNotification.error).toHaveBeenCalledWith({
        title: '连接错误',
        message: '网络连接出现问题，请检查网络后重试',
        duration: 5000,
        showClose: true
      })
    })

    it('应该处理非网络错误的通知', async () => {
      const mockError = new Error('Validation error')
      const mockParseError = require('@/utils/errorHandler').ErrorHandler.parseError
      mockParseError.mockReturnValue({
        code: 'VALIDATION_ERROR',
        message: 'Validation error occurred',
        type: 'ValidationError'
      })

      wrapper = createWrapper({ showNotification: true })
      
      await wrapper.vm.onErrorCaptured(mockError, null, 'component info')
      
      expect(ElNotification.error).toHaveBeenCalledWith({
        title: '页面错误',
        message: 'Validation error occurred',
        duration: 4000,
        showClose: true
      })
    })

    it('应该调用自定义错误处理器', async () => {
      const onError = vi.fn()
      const mockError = new Error('Test error')
      
      wrapper = createWrapper({ onError })
      
      await wrapper.vm.onErrorCaptured(mockError, null, 'component info')
      
      expect(onError).toHaveBeenCalledWith(mockError, wrapper.vm.errorInfo)
    })
  })

  describe('错误类型计算测试', () => {
    it('应该正确计算网络错误的类型', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ 
        hasError: true,
        errorInfo: { code: 'NETWORK_ERROR' }
      })
      
      expect(wrapper.vm.errorType).toBe('network')
    })

    it('应该正确计算超时错误的类型', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ 
        hasError: true,
        errorInfo: { code: 'TIMEOUT' }
      })
      
      expect(wrapper.vm.errorType).toBe('network')
    })

    it('应该正确计算未授权错误的类型', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ 
        hasError: true,
        errorInfo: { code: 'UNAUTHORIZED' }
      })
      
      expect(wrapper.vm.errorType).toBe('forbidden')
    })

    it('应该正确计算权限不足错误的类型', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ 
        hasError: true,
        errorInfo: { code: 'INSUFFICIENT_PERMISSION' }
      })
      
      expect(wrapper.vm.errorType).toBe('forbidden')
    })

    it('应该正确计算默认错误的类型', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ 
        hasError: true,
        errorInfo: { code: 'UNKNOWN_ERROR' }
      })
      
      expect(wrapper.vm.errorType).toBe('error')
    })
  })

  describe('错误信息计算测试', () => {
    it('应该正确计算网络错误的标题', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ 
        hasError: true,
        errorInfo: { code: 'NETWORK_ERROR' }
      })
      
      expect(wrapper.vm.errorTitle).toBe('网络连接异常')
    })

    it('应该正确计算超时错误的标题', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ 
        hasError: true,
        errorInfo: { code: 'TIMEOUT' }
      })
      
      expect(wrapper.vm.errorTitle).toBe('请求超时')
    })

    it('应该正确计算未授权错误的标题', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ 
        hasError: true,
        errorInfo: { code: 'UNAUTHORIZED' }
      })
      
      expect(wrapper.vm.errorTitle).toBe('未授权访问')
    })

    it('应该正确计算权限不足错误的标题', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ 
        hasError: true,
        errorInfo: { code: 'INSUFFICIENT_PERMISSION' }
      })
      
      expect(wrapper.vm.errorTitle).toBe('权限不足')
    })

    it('应该正确计算默认错误的标题', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ 
        hasError: true,
        errorInfo: { code: 'UNKNOWN_ERROR' }
      })
      
      expect(wrapper.vm.errorTitle).toBe('页面出现错误')
    })

    it('应该正确计算错误描述', async () => {
      const mockCreateUserFriendlyMessage = require('@/utils/errorHandler').ErrorHandler.createUserFriendlyMessage
      mockCreateUserFriendlyMessage.mockReturnValue('用户友好的错误消息')
      
      wrapper = createWrapper()
      await wrapper.setData({ 
        hasError: true,
        errorInfo: { code: 'NETWORK_ERROR', userMessage: '自定义用户消息' }
      })
      
      expect(wrapper.vm.errorDescription).toBe('自定义用户消息')
    })
  })

  describe('操作按钮测试', () => {
    it('应该为网络错误显示重试按钮', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ 
        hasError: true,
        errorInfo: { code: 'NETWORK_ERROR' }
      })
      
      expect(wrapper.vm.primaryAction.text).toBe('重试')
    })

    it('应该为超时错误显示重试按钮', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ 
        hasError: true,
        errorInfo: { code: 'TIMEOUT' }
      })
      
      expect(wrapper.vm.primaryAction.text).toBe('重试')
    })

    it('应该为未授权错误显示重新登录按钮', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ 
        hasError: true,
        errorInfo: { code: 'UNAUTHORIZED' }
      })
      
      expect(wrapper.vm.primaryAction.text).toBe('重新登录')
    })

    it('应该为默认错误显示重新加载按钮', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ 
        hasError: true,
        errorInfo: { code: 'UNKNOWN_ERROR' }
      })
      
      expect(wrapper.vm.primaryAction.text).toBe('重新加载')
    })

    it('应该始终显示返回首页按钮', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ 
        hasError: true,
        errorInfo: { code: 'NETWORK_ERROR' }
      })
      
      expect(wrapper.vm.secondaryAction.text).toBe('返回首页')
    })
  })

  describe('错误处理操作测试', () => {
    it('应该处理重新认证操作', async () => {
      const localStorageRemoveSpy = vi.spyOn(localStorage, 'removeItem')
      
      wrapper = createWrapper()
      await wrapper.setData({ 
        hasError: true,
        errorInfo: { code: 'UNAUTHORIZED' }
      })
      
      await wrapper.vm.handlePrimaryAction('UNAUTHORIZED')
      
      expect(localStorageRemoveSpy).toHaveBeenCalledWith('token')
      expect(localStorageRemoveSpy).toHaveBeenCalledWith('refreshToken')
      expect(localStorageRemoveSpy).toHaveBeenCalledWith('userInfo')
    })

    it('应该处理重试操作', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ 
        hasError: true,
        errorInfo: { code: 'NETWORK_ERROR' }
      })
      
      await wrapper.vm.handleRetry()
      
      expect(wrapper.vm.retryCount).toBe(1)
      expect(wrapper.emitted('retry')).toBeTruthy()
      expect(ElMessage.success).toHaveBeenCalledWith('正在重试...')
    })

    it('应该处理达到最大重试次数的情况', async () => {
      wrapper = createWrapper({ maxRetries: 1 })
      await wrapper.setData({ 
        hasError: true,
        errorInfo: { code: 'NETWORK_ERROR' },
        retryCount: 1
      })
      
      await wrapper.vm.handleRetry()
      
      expect(ElMessage.warning).toHaveBeenCalledWith('已达到最大重试次数')
    })

    it('应该处理刷新操作', () => {
      const locationReloadSpy = vi.spyOn(window.location, 'reload')
      
      wrapper = createWrapper()
      
      wrapper.vm.handleRefresh()
      
      expect(locationReloadSpy).toHaveBeenCalled()
    })
  })

  describe('自动重试机制测试', () => {
    it('应该在mounted时自动重试网络错误', async () => {
      wrapper = createWrapper({ 
        autoRetry: true,
        showNotification: false
      })
      
      await wrapper.setData({ 
        hasError: true,
        errorInfo: { code: 'NETWORK_ERROR' }
      })
      
      await wrapper.vm.$nextTick()
      
      // 快进时间
      vi.advanceTimersByTime(1500)
      
      expect(wrapper.vm.retryCount).toBe(1)
    })

    it('不应该自动重试非网络错误', async () => {
      wrapper = createWrapper({ 
        autoRetry: true,
        showNotification: false
      })
      
      await wrapper.setData({ 
        hasError: true,
        errorInfo: { code: 'VALIDATION_ERROR' }
      })
      
      await wrapper.vm.$nextTick()
      
      // 快进时间
      vi.advanceTimersByTime(1500)
      
      expect(wrapper.vm.retryCount).toBe(0)
    })
  })

  describe('暴露方法测试', () => {
    it('应该暴露captureError方法', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.captureError).toBeDefined()
      expect(typeof wrapper.vm.captureError).toBe('function')
    })

    it('应该暴露clearError方法', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.clearError).toBeDefined()
      expect(typeof wrapper.vm.clearError).toBe('function')
    })

    it('应该暴露retry方法', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.retry).toBeDefined()
      expect(typeof wrapper.vm.retry).toBe('function')
    })

    it('应该暴露hasError方法', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.hasError).toBeDefined()
      expect(typeof wrapper.vm.hasError).toBe('function')
    })

    it('应该正确使用captureError方法', async () => {
      const mockError = new Error('Test error')
      const mockParseError = require('@/utils/errorHandler').ErrorHandler.parseError
      mockParseError.mockReturnValue({
        code: 'NETWORK_ERROR',
        message: 'Network error occurred',
        type: 'NetworkError'
      })

      wrapper = createWrapper()
      
      await wrapper.vm.captureError(mockError)
      
      expect(wrapper.vm.hasError).toBe(true)
      expect(wrapper.vm.errorInfo.code).toBe('NETWORK_ERROR')
    })

    it('应该正确使用clearError方法', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ 
        hasError: true,
        errorInfo: { code: 'NETWORK_ERROR' },
        retryCount: 2
      })
      
      await wrapper.vm.clearError()
      
      expect(wrapper.vm.hasError).toBe(false)
      expect(wrapper.vm.errorInfo).toEqual({})
      expect(wrapper.vm.retryCount).toBe(0)
    })
  })

  describe('边界条件测试', () => {
    it('应该处理没有错误信息的情况', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ 
        hasError: true,
        errorInfo: {}
      })
      
      expect(wrapper.vm.errorType).toBe('error')
      expect(wrapper.vm.errorTitle).toBe('页面出现错误')
    })

    it('应该处理开发环境判断', () => {
      // 模拟开发环境
      const originalImportMeta = import.meta.env
      import.meta.env = { ...importMeta.env, DEV: true }
      
      wrapper = createWrapper()
      
      expect(wrapper.vm.isDev).toBe(true)
      
      // 恢复原始环境
      import.meta.env = originalImportMeta
    })

    it('应该处理生产环境判断', () => {
      // 模拟生产环境
      const originalImportMeta = import.meta.env
      import.meta.env = { ...importMeta.env, DEV: false }
      
      wrapper = createWrapper()
      
      expect(wrapper.vm.isDev).toBe(false)
      
      // 恢复原始环境
      import.meta.env = originalImportMeta
    })

    it('应该处理没有自定义用户消息的情况', async () => {
      const mockCreateUserFriendlyMessage = require('@/utils/errorHandler').ErrorHandler.createUserFriendlyMessage
      mockCreateUserFriendlyMessage.mockReturnValue('默认用户消息')
      
      wrapper = createWrapper()
      await wrapper.setData({ 
        hasError: true,
        errorInfo: { code: 'NETWORK_ERROR' }
      })
      
      expect(wrapper.vm.errorDescription).toBe('默认用户消息')
    })
  })

  describe('样式测试', () => {
    it('应该包含正确的CSS类', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.error-boundary').exists()).toBe(true)
    })

    it('应该在有错误时显示错误容器样式', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ hasError: true })
      
      expect(wrapper.find('.error-container').exists()).toBe(true)
    })

    it('应该在无错误时显示内容容器样式', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.error-boundary-content').exists()).toBe(true)
    })

    it('应该在显示详情时显示错误详情样式', async () => {
      wrapper = createWrapper({ showDetails: true })
      await wrapper.setData({ hasError: true })
      
      expect(wrapper.find('.error-details').exists()).toBe(true)
    })
  })
})