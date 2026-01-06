import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import AsyncComponentWrapper from '@/components/common/AsyncComponentWrapper.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import ErrorFallback from '@/components/common/ErrorFallback.vue'
import ElementPlus from 'element-plus'

// Mock async-component-loader utility
vi.mock('@/utils/async-component-loader', () => ({
  createAsyncComponent: vi.fn(() => ({
    template: '<div class="mock-async-component">Mock Component</div>'
  })),
  useAsyncData: vi.fn(() => ({
    data: { value: null },
    loading: { value: false },
    error: { value: null },
    hasError: { value: false },
    loadData: vi.fn(),
    refresh: vi.fn()
  }))
}))

describe('AsyncComponentWrapper.vue', () => {
  let wrapper: any

  const createWrapper = (props: any = {}) => {
    return mount(AsyncComponentWrapper, {
      props: {
        componentConfig: {
          loader: () => Promise.resolve({ template: '<div>Test Component</div>' })
        },
        ...props
      },
      global: {
        plugins: [ElementPlus],
        stubs: {
          LoadingState: true,
          ErrorFallback: true,
          Suspense: {
            template: '<div><slot name="default" /></div>'
          }
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('组件渲染测试', () => {
    it('应该正确渲染异步组件包装器', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.async-component-wrapper').exists()).toBe(true)
      expect(wrapper.find('.mock-async-component').exists()).toBe(true)
    })

    it('应该使用Suspense模式时显示fallback', () => {
      wrapper = createWrapper({ useSuspense: true })
      
      expect(wrapper.find('.suspense-fallback').exists()).toBe(true)
      expect(wrapper.findComponent(LoadingState).exists()).toBe(true)
    })

    it('应该不使用Suspense模式时直接渲染组件', () => {
      wrapper = createWrapper({ useSuspense: false })
      
      expect(wrapper.find('.suspense-fallback').exists()).toBe(false)
      expect(wrapper.find('.mock-async-component').exists()).toBe(true)
    })

    it('应该显示数据加载状态', async () => {
      const mockUseAsyncData = require('@/utils/async-component-loader').useAsyncData
      mockUseAsyncData.mockReturnValue({
        data: { value: null },
        loading: { value: true },
        error: { value: null },
        hasError: { value: false },
        loadData: vi.fn(),
        refresh: vi.fn()
      })

      wrapper = createWrapper({
        dataConfig: {
          loader: () => Promise.resolve({ data: 'test' })
        },
        showDataLoading: true
      })

      await nextTick()
      expect(wrapper.find('.data-loading-overlay').exists()).toBe(true)
      expect(wrapper.findComponent(LoadingState).exists()).toBe(true)
    })

    it('应该显示错误状态', async () => {
      const mockUseAsyncData = require('@/utils/async-component-loader').useAsyncData
      mockUseAsyncData.mockReturnValue({
        data: { value: null },
        loading: { value: false },
        error: { value: new Error('Test error') },
        hasError: { value: true },
        loadData: vi.fn(),
        refresh: vi.fn()
      })

      wrapper = createWrapper({
        dataConfig: {
          loader: () => Promise.reject(new Error('Test error'))
        },
        showError: true
      })

      await nextTick()
      expect(wrapper.find('.error-overlay').exists()).toBe(true)
      expect(wrapper.findComponent(ErrorFallback).exists()).toBe(true)
    })
  })

  describe('props传递测试', () => {
    it('应该正确接收componentConfig prop', () => {
      const componentConfig = {
        loader: () => Promise.resolve({ template: '<div>Test</div>' })
      }
      wrapper = createWrapper({ componentConfig })

      expect(wrapper.props('componentConfig')).toEqual(componentConfig)
    })

    it('应该正确接收componentProps prop', () => {
      const componentProps = { title: 'Test', count: 10 }
      wrapper = createWrapper({ componentProps })

      expect(wrapper.props('componentProps')).toEqual(componentProps)
    })

    it('应该正确接收useSuspense prop', () => {
      wrapper = createWrapper({ useSuspense: true })

      expect(wrapper.props('useSuspense')).toBe(true)
    })

    it('应该使用默认的useSuspense值', () => {
      wrapper = createWrapper()

      expect(wrapper.props('useSuspense')).toBe(false)
    })

    it('应该正确接收loadingText和loadingTip props', () => {
      wrapper = createWrapper({
        loadingText: '自定义加载文本',
        loadingTip: '自定义提示'
      })

      expect(wrapper.props('loadingText')).toBe('自定义加载文本')
      expect(wrapper.props('loadingTip')).toBe('自定义提示')
    })

    it('应该使用默认的loadingText和loadingTip值', () => {
      wrapper = createWrapper()

      expect(wrapper.props('loadingText')).toBe('正在加载组件...')
      expect(wrapper.props('loadingTip')).toBe('请稍候')
    })

    it('应该正确接收showProgress prop', () => {
      wrapper = createWrapper({ showProgress: true })

      expect(wrapper.props('showProgress')).toBe(true)
    })

    it('应该正确接收showDataLoading prop', () => {
      wrapper = createWrapper({ showDataLoading: false })

      expect(wrapper.props('showDataLoading')).toBe(false)
    })

    it('应该正确接收showError和showErrorDetails props', () => {
      wrapper = createWrapper({
        showError: false,
        showErrorDetails: true
      })

      expect(wrapper.props('showError')).toBe(false)
      expect(wrapper.props('showErrorDetails')).toBe(true)
    })

    it('应该正确接收cancelable prop', () => {
      wrapper = createWrapper({ cancelable: true })

      expect(wrapper.props('cancelable')).toBe(true)
    })

    it('应该正确接收preloadDelay prop', () => {
      wrapper = createWrapper({ preloadDelay: 1000 })

      expect(wrapper.props('preloadDelay')).toBe(1000)
    })
  })

  describe('事件发射测试', () => {
    it('应该发射loading事件', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.handleLoading(true)
      expect(wrapper.emitted('loading')).toBeTruthy()
      expect(wrapper.emitted('loading')[0]).toEqual([true])
    })

    it('应该发射error事件', async () => {
      wrapper = createWrapper()
      const testError = new Error('Test error')
      
      await wrapper.vm.handleError(testError)
      expect(wrapper.emitted('error')).toBeTruthy()
      expect(wrapper.emitted('error')[0]).toEqual([testError])
    })

    it('应该发射loaded事件', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.handleLoaded()
      expect(wrapper.emitted('loaded')).toBeTruthy()
    })

    it('应该发射dataLoaded事件', async () => {
      const mockUseAsyncData = require('@/utils/async-component-loader').useAsyncData
      const mockData = { value: { test: 'data' } }
      mockUseAsyncData.mockReturnValue({
        data: mockData,
        loading: { value: false },
        error: { value: null },
        hasError: { value: false },
        loadData: vi.fn(),
        refresh: vi.fn()
      })

      wrapper = createWrapper({
        dataConfig: {
          loader: () => Promise.resolve({ data: 'test' })
        }
      })

      await nextTick()
      expect(wrapper.emitted('dataLoaded')).toBeTruthy()
      expect(wrapper.emitted('dataLoaded')[0]).toEqual([mockData.value])
    })

    it('应该发射cancelled事件', async () => {
      wrapper = createWrapper({ cancelable: true })
      
      await wrapper.vm.handleCancelDataLoading()
      expect(wrapper.emitted('cancelled')).toBeTruthy()
    })
  })

  describe('方法测试', () => {
    it('应该正确处理重试逻辑', async () => {
      const mockRefresh = vi.fn()
      const mockUseAsyncData = require('@/utils/async-component-loader').useAsyncData
      mockUseAsyncData.mockReturnValue({
        data: { value: null },
        loading: { value: false },
        error: { value: new Error('Test error') },
        hasError: { value: true },
        loadData: vi.fn(),
        refresh: mockRefresh
      })

      wrapper = createWrapper({
        dataConfig: {
          loader: () => Promise.reject(new Error('Test error'))
        }
      })

      await wrapper.vm.handleRetry()
      expect(mockRefresh).toHaveBeenCalled()
    })

    it('应该正确处理错误报告', async () => {
      const consoleSpy = vi.spyOn(console, 'log')
      wrapper = createWrapper()
      const testError = new Error('Test error')
      
      await wrapper.vm.handleReportError(testError)
      expect(consoleSpy).toHaveBeenCalledWith('报告错误:', testError)
      
      consoleSpy.mockRestore()
    })

    it('应该正确取消数据加载', async () => {
      wrapper = createWrapper({ cancelable: true })
      
      // 模拟AbortController
      const mockAbortController = {
        abort: vi.fn()
      }
      wrapper.vm.dataLoadingController = mockAbortController
      
      await wrapper.vm.handleCancelDataLoading()
      expect(mockAbortController.abort).toHaveBeenCalled()
      expect(wrapper.emitted('cancelled')).toBeTruthy()
    })

    it('应该正确获取数据', async () => {
      const mockData = { test: 'data' }
      const mockUseAsyncData = require('@/utils/async-component-loader').useAsyncData
      mockUseAsyncData.mockReturnValue({
        data: { value: mockData },
        loading: { value: false },
        error: { value: null },
        hasError: { value: false },
        loadData: vi.fn(),
        refresh: vi.fn()
      })

      wrapper = createWrapper({
        dataConfig: {
          loader: () => Promise.resolve(mockData)
        }
      })

      expect(wrapper.vm.getData()).toEqual(mockData)
    })
  })

  describe('生命周期测试', () => {
    it('应该在mounted时预加载数据', async () => {
      const mockLoadData = vi.fn()
      const mockUseAsyncData = require('@/utils/async-component-loader').useAsyncData
      mockUseAsyncData.mockReturnValue({
        data: { value: null },
        loading: { value: false },
        error: { value: null },
        hasError: { value: false },
        loadData: mockLoadData,
        refresh: vi.fn()
      })

      wrapper = createWrapper({
        dataConfig: {
          loader: () => Promise.resolve({ data: 'test' })
        }
      })

      await nextTick()
      expect(mockLoadData).toHaveBeenCalled()
    })

    it('应该在unmounted时清理AbortController', async () => {
      const mockAbortController = {
        abort: vi.fn()
      }
      
      wrapper = createWrapper({
        dataConfig: {
          loader: () => Promise.resolve({ data: 'test' })
        }
      })
      
      wrapper.vm.dataLoadingController = mockAbortController
      await wrapper.unmount()
      
      expect(mockAbortController.abort).toHaveBeenCalled()
    })
  })

  describe('进度模拟测试', () => {
    it('应该模拟加载进度', async () => {
      wrapper = createWrapper({ showProgress: true })
      
      expect(wrapper.vm.loadingProgress).toBe(0)
      
      // 快进时间
      vi.advanceTimersByTime(1000)
      await nextTick()
      
      expect(wrapper.vm.loadingProgress).toBeGreaterThan(0)
    })

    it('不应该在没有showProgress时模拟进度', async () => {
      wrapper = createWrapper({ showProgress: false })
      
      expect(wrapper.vm.loadingProgress).toBe(0)
      
      // 快进时间
      vi.advanceTimersByTime(1000)
      await nextTick()
      
      expect(wrapper.vm.loadingProgress).toBe(0)
    })
  })

  describe('边界条件测试', () => {
    it('应该处理没有dataConfig的情况', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.dataLoading).toBe(false)
      expect(wrapper.vm.hasDataError).toBe(false)
    })

    it('应该处理空componentProps', () => {
      wrapper = createWrapper({ componentProps: undefined })
      
      expect(wrapper.props('componentProps')).toEqual({})
    })

    it('应该处理预加载延迟', async () => {
      const mockLoadData = vi.fn()
      const mockUseAsyncData = require('@/utils/async-component-loader').useAsyncData
      mockUseAsyncData.mockReturnValue({
        data: { value: null },
        loading: { value: false },
        error: { value: null },
        hasError: { value: false },
        loadData: mockLoadData,
        refresh: vi.fn()
      })

      wrapper = createWrapper({
        dataConfig: {
          loader: () => Promise.resolve({ data: 'test' })
        },
        preloadDelay: 1000
      })

      // 在延迟前不应该调用loadData
      expect(mockLoadData).not.toHaveBeenCalled()
      
      // 快进时间超过延迟
      vi.advanceTimersByTime(1500)
      await nextTick()
      
      expect(mockLoadData).toHaveBeenCalled()
    })

    it('应该处理AbortError', async () => {
      const mockLoadData = vi.fn()
      const mockUseAsyncData = require('@/utils/async-component-loader').useAsyncData
      mockUseAsyncData.mockReturnValue({
        data: { value: null },
        loading: { value: false },
        error: { value: null },
        hasError: { value: false },
        loadData: mockLoadData.mockRejectedValue(new Error('AbortError')),
        refresh: vi.fn()
      })

      const consoleSpy = vi.spyOn(console, 'error')
      
      wrapper = createWrapper({
        dataConfig: {
          loader: () => Promise.reject(new Error('AbortError'))
        }
      })

      await nextTick()
      
      // AbortError不应该被记录到控制台
      expect(consoleSpy).not.toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })
  })

  describe('样式测试', () => {
    it('应该包含正确的CSS类', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.async-component-wrapper').exists()).toBe(true)
    })

    it('应该在Suspense模式下显示fallback样式', () => {
      wrapper = createWrapper({ useSuspense: true })
      
      expect(wrapper.find('.suspense-fallback').exists()).toBe(true)
    })

    it('应该在数据加载时显示overlay样式', async () => {
      const mockUseAsyncData = require('@/utils/async-component-loader').useAsyncData
      mockUseAsyncData.mockReturnValue({
        data: { value: null },
        loading: { value: true },
        error: { value: null },
        hasError: { value: false },
        loadData: vi.fn(),
        refresh: vi.fn()
      })

      wrapper = createWrapper({
        dataConfig: {
          loader: () => Promise.resolve({ data: 'test' })
        },
        showDataLoading: true
      })

      await nextTick()
      expect(wrapper.find('.data-loading-overlay').exists()).toBe(true)
    })

    it('应该在错误时显示error-overlay样式', async () => {
      const mockUseAsyncData = require('@/utils/async-component-loader').useAsyncData
      mockUseAsyncData.mockReturnValue({
        data: { value: null },
        loading: { value: false },
        error: { value: new Error('Test error') },
        hasError: { value: true },
        loadData: vi.fn(),
        refresh: vi.fn()
      })

      wrapper = createWrapper({
        dataConfig: {
          loader: () => Promise.reject(new Error('Test error'))
        },
        showError: true
      })

      await nextTick()
      expect(wrapper.find('.error-overlay').exists()).toBe(true)
    })
  })
})