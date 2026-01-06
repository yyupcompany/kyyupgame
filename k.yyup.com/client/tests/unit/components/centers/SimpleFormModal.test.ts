
vi.mock('vue-i18n', () => ({
  createI18n: vi.fn(() => ({
    global: {
      t: vi.fn((key) => key),
      locale: 'zh-CN'
    }
  })),
  useI18n: vi.fn(() => ({
    t: vi.fn((key) => key),
    locale: ref('zh-CN')
  }))
}))

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import SimpleFormModal from '@/components/centers/SimpleFormModal.vue'

// 模拟Element Plus组件
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn()
    },
    ElDialog: {
      name: 'ElDialog',
      template: '<div><slot></slot><slot name="footer"></slot></div>'
    },
    ElForm: {
      name: 'ElForm',
      template: '<form><slot></slot></form>'
    },
    ElFormItem: {
      name: 'ElFormItem',
      template: '<div><slot></slot><slot name="label"></slot></div>'
    },
    ElInput: {
      name: 'ElInput',
      template: '<input @input="$emit(\'update:modelValue\', $event.target.value)" />'
    },
    ElButton: {
      name: 'ElButton',
      template: '<button @click="$emit(\'click\')"><slot></slot></button>'
    }
  }
})

// 控制台错误检测变量
let consoleSpy: any

describe('SimpleFormModal.vue', () => {
  let wrapper: any
  let i18n: any

  beforeEach(() => {
    i18n = createI18n({
      legacy: false,
      locale: 'zh-CN',
      messages: {
        'zh-CN': {}
      }
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    wrapper = mount(SimpleFormModal, {
      props: {
        title: '简单表单',
        visible: true
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-dialog': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-button': true
        }
      }
    })
  })

  afterEach(() => {
    if (wrapper) => {
      wrapper.unmount()
    }
    vi.clearAllMocks()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  it('正确渲染组件', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('显示对话框标题', () => {
    expect(wrapper.props('title')).toBe('简单表单')
  })

  it('处理确认操作', () => {
    wrapper.vm.handleConfirm()
    expect(wrapper.emitted('confirm')).toBeTruthy()
  })

  it('处理取消操作', () => {
    wrapper.vm.handleCancel()
    expect(wrapper.emitted('update:visible')).toBeTruthy()
    expect(wrapper.emitted('update:visible')[0]).toEqual([false])
  })

  it('暴露公共方法', () => {
    expect(wrapper.vm.validate).toBeDefined()
    expect(wrapper.vm.reset).toBeDefined()
  })
})