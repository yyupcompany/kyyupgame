
// 使用全局表单引用Mock
beforeEach(() => {
  // 设置表单引用Mock
  if (typeof formRef !== 'undefined' && formRef.value) {
    Object.assign(formRef.value, global.mockFormRef)
  }
  if (typeof editInput !== 'undefined' && editInput.value) {
    Object.assign(editInput.value, global.mockInputRef)
  }
})


// Element Plus Mock for form validation
const mockFormRef = {
  clearValidate: vi.fn(),
  resetFields: vi.fn(),
  validate: vi.fn(() => Promise.resolve(true)),
  validateField: vi.fn()
}

const mockInputRef = {
  focus: vi.fn(),
  blur: vi.fn(),
  select: vi.fn()
}

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElForm: {
    name: 'ElForm',
    template: '<form><slot /></form>'
  },
  ElFormItem: {
    name: 'ElFormItem',
    template: '<div><slot /></div>'
  },
  ElInput: {
    name: 'ElInput',
    template: '<input />'
  },
  ElButton: {
    name: 'ElButton',
    template: '<button><slot /></button>'
  }
}))

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
import PageLoadingGuard from '@/components/common/PageLoadingGuard.vue'
import { Loading } from '@element-plus/icons-vue'

// Mock Element Plus
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElIcon: {
      name: 'ElIcon',
      template: '<div><slot /></div>'
    },
    ElProgress: {
      name: 'ElProgress',
      props: ['percentage', 'showText'],
      template: '<div class="mock-progress"></div>'
    }
  }
})

describe('PageLoadingGuard.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const createWrapper = (props = {}) => {
    return mount(PageLoadingGuard, {
      props: {
        loadingText: '页面加载中...',
        showProgress: false,
        progress: 0,
        ...props
      },
      global: {
        stubs: {
          'el-icon': true,
          'el-progress': true
        },
        components: {
          Loading
        }
      }
    })
  }

  it('renders properly with default props', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.page-loading-guard').exists()).toBe(true)
  })

  it('displays loading text correctly', () => {
    const wrapper = createWrapper({ loadingText: '正在加载中...' })
    expect(wrapper.find('.loading-text').text()).toBe('正在加载中...')
  })

  it('displays default loading text when not provided', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.loading-text').text()).toBe('页面加载中...')
  })

  it('shows loading icon correctly', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.loading-icon').exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'Loading' }).exists()).toBe(true)
  })

  it('applies correct icon size', () => {
    const wrapper = createWrapper()
    const icon = wrapper.findComponent({ name: 'Loading' })
    expect(icon.props('size')).toBe(48)
  })

  it('shows progress when showProgress is true', () => {
    const wrapper = createWrapper({ showProgress: true, progress: 75 })
    expect(wrapper.find('.loading-progress').exists()).toBe(true)
  })

  it('hides progress when showProgress is false', () => {
    const wrapper = createWrapper({ showProgress: false })
    expect(wrapper.find('.loading-progress').exists()).toBe(false)
  })

  it('passes correct progress value to progress component', () => {
    const wrapper = createWrapper({ showProgress: true, progress: 65 })
    const progress = wrapper.findComponent({ name: 'ElProgress' })
    expect(progress.props('percentage')).toBe(65)
  })

  it('hides progress text when showText is false', () => {
    const wrapper = createWrapper({ 
      showProgress: true, 
      progress: 50,
      showProgressText: false 
    })
    const progress = wrapper.findComponent({ name: 'ElProgress' })
    expect(progress.props('showText')).toBe(false)
  })

  it('has correct container positioning', () => {
    const wrapper = createWrapper()
    const container = wrapper.find('.page-loading-guard')
    
    expect(container.classes()).toContain('position-fixed')
    expect(container.classes()).toContain('top-0')
    expect(container.classes()).toContain('left-0')
    expect(container.classes()).toContain('right-0')
    expect(container.classes()).toContain('bottom-0')
  })

  it('has correct background styling', () => {
    const wrapper = createWrapper()
    const container = wrapper.find('.page-loading-guard')
    
    expect(container.attributes('style')).toContain('background: rgba(255, 255, 255, 0.9)')
    expect(container.attributes('style')).toContain('backdrop-filter: blur(4px)')
  })

  it('has correct z-index', () => {
    const wrapper = createWrapper()
    const container = wrapper.find('.page-loading-guard')
    
    expect(container.classes()).toContain('z-index-9999')
  })

  it('has correct content centering', () => {
    const wrapper = createWrapper()
    const container = wrapper.find('.page-loading-guard')
    
    expect(container.classes()).toContain('display-flex')
    expect(container.classes()).toContain('align-items-center')
    expect(container.classes()).toContain('justify-content-center')
  })

  it('has correct loading content styling', () => {
    const wrapper = createWrapper()
    const content = wrapper.find('.loading-content')
    
    expect(content.classes()).toContain('text-align-center')
    expect(content.classes()).toContain('padding-var(--spacing-xl)')
    expect(content.classes()).toContain('background-var(--bg-card)')
    expect(content.classes()).toContain('border-radius-var(--border-radius-lg)')
    expect(content.classes()).toContain('box-shadow-var(--shadow-lg)')
  })

  it('has correct icon styling', () => {
    const wrapper = createWrapper()
    const icon = wrapper.find('.loading-icon')
    
    expect(icon.classes()).toContain('color-var(--color-primary)')
    expect(icon.classes()).toContain('animation-spin')
    expect(icon.classes()).toContain('margin-bottom-var(--spacing-md)')
  })

  it('has correct text styling', () => {
    const wrapper = createWrapper()
    const text = wrapper.find('.loading-text')
    
    expect(text.classes()).toContain('margin-0-0-var(--spacing-md)-0')
    expect(text.classes()).toContain('color-var(--text-primary)')
    expect(text.classes()).toContain('font-size-var(--font-size-md)')
  })

  it('has correct progress section styling', () => {
    const wrapper = createWrapper({ showProgress: true })
    const progress = wrapper.find('.loading-progress')
    
    expect(progress.classes()).toContain('margin-top-var(--spacing-md)')
  })

  it('applies animation to icon', () => {
    const wrapper = createWrapper()
    const icon = wrapper.find('.loading-icon')
    
    expect(icon.classes()).toContain('animation-spin')
    expect(icon.classes()).toContain('1s')
    expect(icon.classes()).toContain('linear')
    expect(icon.classes()).toContain('infinite')
  })

  it('has correct minimum width for content', () => {
    const wrapper = createWrapper()
    const content = wrapper.find('.loading-content')
    
    expect(content.classes()).toContain('min-width-200px')
  })

  it('is a simple, focused component', () => {
    const wrapper = createWrapper()
    
    // Check that the component is simple and focused
    expect(wrapper.vm.$options.name).toBe('PageLoadingGuard')
    expect(wrapper.find('.page-loading-guard').exists()).toBe(true)
    expect(wrapper.find('.loading-content').exists()).toBe(true)
    expect(wrapper.find('.loading-icon').exists()).toBe(true)
    expect(wrapper.find('.loading-text').exists()).toBe(true)
  })

  it('accepts all props correctly', () => {
    const props = {
      loadingText: '自定义加载文本',
      showProgress: true,
      progress: 85,
      showProgressText: true,
      progressStrokeWidth: 10
    }
    
    const wrapper = createWrapper(props)
    
    expect(wrapper.vm.loadingText).toBe('自定义加载文本')
    expect(wrapper.vm.showProgress).toBe(true)
    expect(wrapper.vm.progress).toBe(85)
    expect(wrapper.vm.showProgressText).toBe(true)
    expect(wrapper.vm.progressStrokeWidth).toBe(10)
  })

  it('handles different progress values', () => {
    const progressValues = [0, 25, 50, 75, 100]
    
    progressValues.forEach(progress => {
      const wrapper = createWrapper({ showProgress: true, progress })
      const progressComponent = wrapper.findComponent({ name: 'ElProgress' })
      expect(progressComponent.props('percentage')).toBe(progress)
    })
  })

  it('handles different loading texts', () => {
    const loadingTexts = [
      '页面加载中...',
      '正在处理数据...',
      '请稍候...',
      '加载中...',
      '正在连接服务器...'
    ]
    
    loadingTexts.forEach(text => {
      const wrapper = createWrapper({ loadingText: text })
      expect(wrapper.find('.loading-text').text()).toBe(text)
    })
  })

  it('maintains proper structure with all elements', () => {
    const wrapper = createWrapper({ showProgress: true })
    
    const container = wrapper.find('.page-loading-guard')
    const content = wrapper.find('.loading-content')
    const icon = wrapper.find('.loading-icon')
    const text = wrapper.find('.loading-text')
    const progress = wrapper.find('.loading-progress')
    
    expect(container.exists()).toBe(true)
    expect(content.exists()).toBe(true)
    expect(icon.exists()).toBe(true)
    expect(text.exists()).toBe(true)
    expect(progress.exists()).toBe(true)
  })

  it('maintains proper structure without progress', () => {
    const wrapper = createWrapper({ showProgress: false })
    
    const container = wrapper.find('.page-loading-guard')
    const content = wrapper.find('.loading-content')
    const icon = wrapper.find('.loading-icon')
    const text = wrapper.find('.loading-text')
    
    expect(container.exists()).toBe(true)
    expect(content.exists()).toBe(true)
    expect(icon.exists()).toBe(true)
    expect(text.exists()).toBe(true)
    expect(wrapper.find('.loading-progress').exists()).toBe(false)
  })
})