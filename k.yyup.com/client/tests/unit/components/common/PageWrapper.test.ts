import { 
// 控制台错误检测
let consoleSpy: any

beforeEach(() => {
  // 监听控制台错误
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  // 验证没有控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})

describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useRouter, useRoute } from 'vue-router'
import PageWrapper from '@/components/common/PageWrapper.vue'
import ErrorBoundary from '@/components/common/ErrorBoundary.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import EmptyState from '@/components/common/EmptyState.vue'

// Mock Vue Router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  }),
  useRoute: () => ({
    fullPath: '/test-route'
  })
}))

// Mock composables
vi.mock('@/composables/usePageState', () => ({
  usePageState: vi.fn(() => ({
    emptyStateConfig: ref(null),
    resetState: vi.fn()
  }))
}))

// Mock Element Plus
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElButton: {
      name: 'ElButton',
      template: '<button @click="$emit(\'click\')"><slot /></button>'
    }
  }
})

describe('PageWrapper.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const createWrapper = (props = {}, slots = {}) => {
    return mount(PageWrapper, {
      props: {
        title: '',
        subtitle: '',
        showHeader: true,
        showDetails: true,
        autoRetry: false,
        maxRetries: 3,
        retryDelay: 1000,
        showNotification: true,
        pageLoading: false,
        loadingVariant: 'page',
        loadingSize: 'medium',
        loadingText: '',
        loadingTip: '',
        spinnerType: 'default',
        cancelable: false,
        showProgress: false,
        progress: 0,
        autoEmptyState: true,
        entityName: '数据',
        ...props
      },
      slots: {
        default: '<div class="test-content">Test Content</div>',
        actions: '<button class="test-action">Test Action</button>',
        footer: '<div class="test-footer">Footer Content</div>',
        ...slots
      },
      global: {
        stubs: {
          'error-boundary': ErrorBoundary,
          'loading-state': LoadingState,
          'empty-state': EmptyState,
          'el-button': true
        },
        provide: {
          pageState: {
            emptyStateConfig: ref(null),
            resetState: vi.fn()
          }
        }
      }
    })
  }

  it('renders properly with default props', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.page-wrapper').exists()).toBe(true)
  })

  it('shows loading state when pageLoading is true', () => {
    const wrapper = createWrapper({ pageLoading: true })
    expect(wrapper.findComponent(LoadingState).exists()).toBe(true)
    expect(wrapper.find('.test-content').exists()).toBe(false)
  })

  it('shows page content when pageLoading is false', () => {
    const wrapper = createWrapper({ pageLoading: false })
    expect(wrapper.findComponent(LoadingState).exists()).toBe(false)
    expect(wrapper.find('.test-content').exists()).toBe(true)
  })

  it('shows page header when showHeader is true', () => {
    const wrapper = createWrapper({ showHeader: true, title: 'Test Page' })
    expect(wrapper.find('.page-header').exists()).toBe(true)
    expect(wrapper.find('.page-title').text()).toBe('Test Page')
  })

  it('hides page header when showHeader is false', () => {
    const wrapper = createWrapper({ showHeader: false })
    expect(wrapper.find('.page-header').exists()).toBe(false)
  })

  it('shows subtitle when provided', () => {
    const wrapper = createWrapper({ 
      showHeader: true, 
      title: 'Test Page',
      subtitle: 'This is a subtitle' 
    })
    expect(wrapper.find('.page-subtitle').exists()).toBe(true)
    expect(wrapper.find('.page-subtitle').text()).toBe('This is a subtitle')
  })

  it('hides subtitle when not provided', () => {
    const wrapper = createWrapper({ 
      showHeader: true, 
      title: 'Test Page',
      subtitle: '' 
    })
    expect(wrapper.find('.page-subtitle').exists()).toBe(false)
  })

  it('shows actions slot content', () => {
    const wrapper = createWrapper({ showHeader: true })
    expect(wrapper.find('.test-action').exists()).toBe(true)
    expect(wrapper.find('.test-action').text()).toBe('Test Action')
  })

  it('hides actions section when no actions slot content', () => {
    const wrapper = createWrapper({ showHeader: true }, { actions: '' })
    expect(wrapper.find('.page-actions').exists()).toBe(false)
  })

  it('shows footer slot content', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.test-footer').exists()).toBe(true)
    expect(wrapper.find('.test-footer').text()).toBe('Footer Content')
  })

  it('hides footer when no footer slot content', () => {
    const wrapper = createWrapper({}, { footer: '' })
    expect(wrapper.find('.page-footer').exists()).toBe(false)
  })

  it('shows empty state when showEmptyState is true', () => {
    const wrapper = createWrapper({ 
      pageLoading: false,
      emptyStateConfig: { type: 'no-data', title: 'No Data' }
    })
    expect(wrapper.findComponent(EmptyState).exists()).toBe(true)
    expect(wrapper.find('.test-content').exists()).toBe(false)
  })

  it('hides empty state when showEmptyState is false', () => {
    const wrapper = createWrapper({ 
      pageLoading: false,
      emptyStateConfig: null
    })
    expect(wrapper.findComponent(EmptyState).exists()).toBe(false)
    expect(wrapper.find('.test-content').exists()).toBe(true)
  })

  it('computes showEmptyState correctly', () => {
    const wrapper = createWrapper({ 
      pageLoading: false,
      autoEmptyState: true,
      emptyStateConfig: { type: 'no-data' }
    })
    expect(wrapper.vm.showEmptyState).toBe(true)
    
    const wrapper2 = createWrapper({ 
      pageLoading: true,
      autoEmptyState: true,
      emptyStateConfig: { type: 'no-data' }
    })
    expect(wrapper2.vm.showEmptyState).toBe(false)
  })

  it('computes finalEmptyStateConfig correctly', () => {
    const customConfig = { type: 'no-data', title: 'Custom Empty' }
    const wrapper = createWrapper({ 
      pageLoading: false,
      emptyStateConfig: customConfig
    })
    expect(wrapper.vm.finalEmptyStateConfig).toEqual(customConfig)
  })

  it('handles error events correctly', () => {
    const wrapper = createWrapper()
    const mockError = new Error('Test error')
    
    wrapper.vm.handleError(mockError, {})
    
    expect(wrapper.emitted('error')).toBeTruthy()
    expect(wrapper.emitted('error')[0]).toEqual([mockError, {}])
  })

  it('handles recover events correctly', () => {
    const wrapper = createWrapper()
    
    wrapper.vm.handleRecover()
    
    expect(wrapper.emitted('recover')).toBeTruthy()
  })

  it('handles retry events correctly', () => {
    const wrapper = createWrapper()
    
    wrapper.vm.handleRetry(1)
    
    expect(wrapper.emitted('retry')).toBeTruthy()
    expect(wrapper.emitted('retry')[0]).toEqual([1])
  })

  it('handles cancel events correctly', () => {
    const wrapper = createWrapper()
    
    wrapper.vm.handleCancel()
    
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('handles empty state action events correctly', () => {
    const wrapper = createWrapper()
    
    wrapper.vm.handleEmptyPrimaryAction()
    expect(wrapper.emitted('emptyPrimaryAction')).toBeTruthy()
    
    wrapper.vm.handleEmptySecondaryAction()
    expect(wrapper.emitted('emptySecondaryAction')).toBeTruthy()
    
    wrapper.vm.handleEmptyExtraAction(0, {})
    expect(wrapper.emitted('emptyExtraAction')).toBeTruthy()
    expect(wrapper.emitted('emptyExtraAction')[0]).toEqual([0, {}])
  })

  it('passes correct props to ErrorBoundary', () => {
    const wrapper = createWrapper({
      showDetails: false,
      autoRetry: true,
      maxRetries: 5,
      retryDelay: 2000,
      showNotification: false
    })
    
    const errorBoundary = wrapper.findComponent(ErrorBoundary)
    expect(errorBoundary.props('showDetails')).toBe(false)
    expect(errorBoundary.props('autoRetry')).toBe(true)
    expect(errorBoundary.props('maxRetries')).toBe(5)
    expect(errorBoundary.props('retryDelay')).toBe(2000)
    expect(errorBoundary.props('showNotification')).toBe(false)
  })

  it('passes correct props to LoadingState', () => {
    const wrapper = createWrapper({
      pageLoading: true,
      loadingVariant: 'card',
      loadingSize: 'large',
      loadingText: 'Loading...',
      loadingTip: 'Please wait',
      spinnerType: 'dots',
      cancelable: true,
      showProgress: true,
      progress: 75
    })
    
    const loadingState = wrapper.findComponent(LoadingState)
    expect(loadingState.props('variant')).toBe('card')
    expect(loadingState.props('size')).toBe('large')
    expect(loadingState.props('text')).toBe('Loading...')
    expect(loadingState.props('tip')).toBe('Please wait')
    expect(loadingState.props('spinnerType')).toBe('dots')
    expect(loadingState.props('cancelable')).toBe(true)
    expect(loadingState.props('showProgress')).toBe(true)
    expect(loadingState.props('progress')).toBe(75)
  })

  it('passes correct props to EmptyState', () => {
    const emptyConfig = { type: 'no-data', title: 'No Data', description: 'No data available' }
    const wrapper = createWrapper({
      pageLoading: false,
      emptyStateConfig: emptyConfig
    })
    
    const emptyState = wrapper.findComponent(EmptyState)
    expect(emptyState.props('type')).toBe('no-data')
    expect(emptyState.props('title')).toBe('No Data')
    expect(emptyState.props('description')).toBe('No data available')
  })

  it('provides pageState to child components', () => {
    const wrapper = createWrapper()
    
    expect(wrapper.vm.provide).toHaveBeenCalled()
    expect(wrapper.vm.provide).toHaveBeenCalledWith('pageState', expect.any(Object))
  })

  it('provides pageWrapper methods to child components', () => {
    const wrapper = createWrapper()
    
    expect(wrapper.vm.provide).toHaveBeenCalledWith('pageWrapper', expect.objectContaining({
      showError: expect.any(Function),
      clearError: expect.any(Function),
      retry: expect.any(Function)
    }))
  })

  it('exposes methods correctly', () => {
    const wrapper = createWrapper()
    
    expect(wrapper.vm.pageState).toBeDefined()
    expect(wrapper.vm.showError).toBeDefined()
    expect(wrapper.vm.clearError).toBeDefined()
    expect(wrapper.vm.retry).toBeDefined()
  })

  it('has correct layout structure', () => {
    const wrapper = createWrapper()
    
    const pageWrapper = wrapper.find('.page-wrapper')
    const pageContent = wrapper.find('.page-content')
    const pageBody = wrapper.find('.page-body')
    const pageMain = wrapper.find('.page-main')
    
    expect(pageWrapper.classes()).toContain('display-flex')
    expect(pageWrapper.classes()).toContain('flex-direction-column')
    expect(pageContent.classes()).toContain('flex-1')
    expect(pageContent.classes()).toContain('display-flex')
    expect(pageContent.classes()).toContain('flex-direction-column')
    expect(pageBody.classes()).toContain('flex-1')
    expect(pageMain.classes()).toContain('flex-1')
  })

  it('has responsive design classes', () => {
    const wrapper = createWrapper()
    
    expect(wrapper.find('.page-wrapper').classes()).toContain('width-100')
    expect(wrapper.find('.page-wrapper').classes()).toContain('height-100')
  })

  it('handles different loading variants', () => {
    const variants = ['default', 'minimal', 'card', 'page']
    
    variants.forEach(variant => {
      const wrapper = createWrapper({ pageLoading: true, loadingVariant: variant })
      const loadingState = wrapper.findComponent(LoadingState)
      expect(loadingState.props('variant')).toBe(variant)
    })
  })

  it('handles different loading sizes', () => {
    const sizes = ['small', 'medium', 'large']
    
    sizes.forEach(size => {
      const wrapper = createWrapper({ pageLoading: true, loadingSize: size })
      const loadingState = wrapper.findComponent(LoadingState)
      expect(loadingState.props('size')).toBe(size)
    })
  })

  it('handles different spinner types', () => {
    const spinnerTypes = ['default', 'dots', 'circle', 'pulse', 'bars']
    
    spinnerTypes.forEach(type => {
      const wrapper = createWrapper({ pageLoading: true, spinnerType: type })
      const loadingState = wrapper.findComponent(LoadingState)
      expect(loadingState.props('spinnerType')).toBe(type)
    })
  })

  it('maintains proper spacing and layout', () => {
    const wrapper = createWrapper({ showHeader: true })
    
    const header = wrapper.find('.page-header')
    const body = wrapper.find('.page-body')
    const footer = wrapper.find('.page-footer')
    
    expect(header.classes()).toContain('margin-bottom-1.5rem')
    expect(body.classes()).toContain('flex-1')
    expect(footer.classes()).toContain('margin-top-1.5rem')
  })

  it('is a comprehensive page wrapper component', () => {
    const wrapper = createWrapper()
    
    expect(wrapper.vm.$options.name).toBeDefined()
    expect(wrapper.find('.page-wrapper').exists()).toBe(true)
    expect(wrapper.findComponent(ErrorBoundary).exists()).toBe(true)
  })
})