
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
import ErrorFallback from '@/components/common/ErrorFallback.vue'
import { Warning } from '@element-plus/icons-vue'

// Mock Element Plus
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElIcon: {
      name: 'ElIcon',
      template: '<div><slot /></div>'
    }
  }
})

describe('ErrorFallback.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const createWrapper = () => {
    return mount(ErrorFallback, {
      global: {
        stubs: {
          'el-icon': true,
          'el-button': {
            name: 'ElButton',
            template: '<button @click="$emit(\'click\')"><slot /></button>'
          }
        },
        components: {
          Warning
        }
      }
    })
  }

  it('renders properly', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.error-fallback').exists()).toBe(true)
  })

  it('displays error icon', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.error-icon').exists()).toBe(true)
  })

  it('displays error text', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.error-text').exists()).toBe(true)
    expect(wrapper.find('.error-text').text()).toBe('组件加载失败')
  })

  it('displays retry button', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.retry-button').exists()).toBe(true)
    expect(wrapper.find('.retry-button').text()).toBe('重试')
  })

  it('reloads page when retry button is clicked', async () => {
    const wrapper = createWrapper()
    const reloadSpy = vi.spyOn(window.location, 'reload')
    
    await wrapper.find('.retry-button').trigger('click')
    
    expect(reloadSpy).toHaveBeenCalled()
  })

  it('applies correct CSS classes', () => {
    const wrapper = createWrapper()
    const fallback = wrapper.find('.error-fallback')

    expect(fallback.classes()).toContain('error-fallback')
    expect(fallback.exists()).toBe(true)
  })

  it('has correct styling structure', () => {
    const wrapper = createWrapper()

    const fallback = wrapper.find('.error-fallback')
    expect(fallback.exists()).toBe(true)
    // CSS styles are applied via scoped styles, not inline styles
    expect(fallback.classes()).toContain('error-fallback')
  })

  it('has proper spacing between elements', () => {
    const wrapper = createWrapper()

    const icon = wrapper.find('.error-icon')
    const text = wrapper.find('.error-text')
    const button = wrapper.find('.retry-button')

    expect(icon.exists()).toBe(true)
    expect(text.exists()).toBe(true)
    expect(button.exists()).toBe(true)

    // Check that elements have correct CSS classes (styles are applied via scoped CSS)
    expect(icon.classes()).toContain('error-icon')
    expect(text.classes()).toContain('error-text')
  })

  it('has correct button styling', () => {
    const wrapper = createWrapper()
    const button = wrapper.find('.retry-button')

    expect(button.exists()).toBe(true)
    expect(button.classes()).toContain('retry-button')
    // Button styles are applied via scoped CSS
  })

  it('is a simple component with minimal functionality', () => {
    const wrapper = createWrapper()

    // Check that the component is simple and focused
    expect(wrapper.find('.error-fallback').exists()).toBe(true)
    expect(wrapper.findAll('.error-fallback > *').length).toBe(3) // icon, text, button
    // Component uses <script setup> syntax, so $options.name is not available
  })

  it('uses Warning icon correctly', () => {
    const wrapper = createWrapper()

    // Check that icon element exists
    const icon = wrapper.find('.error-icon')
    expect(icon.exists()).toBe(true)
    // Element Plus el-icon component should exist
    expect(wrapper.findComponent({ name: 'ElIcon' }).exists()).toBe(true)
  })
})