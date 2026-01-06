
// 使用全局表单引用Mock
beforeEach(() => {
  // 设置表单引用Mock
  if (typeof formRef !== 'undefined' && formRef.value) => {
    Object.assign(formRef.value, global.mockFormRef)
  }
  if (typeof editInput !== 'undefined' && editInput.value) {
    Object.assign(editInput.value, global.mockInputRef)
  }
})
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})


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
import FormModal from '@/components/centers/FormModal.vue'

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

const mockFormData = {
  name: '',
  email: '',
  phone: ''
}

const mockFormFields = [
  {
    key: 'name',
    label: '姓名',
    type: 'input',
    placeholder: '请输入姓名',
    rules: [{ required: true, message: '请输入姓名', trigger: 'blur' }]
  },
  {
    key: 'email',
    label: '邮箱',
    type: 'input',
    placeholder: '请输入邮箱',
    rules: [{ required: true, message: '请输入邮箱', trigger: 'blur' }]
  },
  {
    key: 'phone',
    label: '电话',
    type: 'input',
    placeholder: '请输入电话'
  }
]

// 控制台错误检测变量
let consoleSpy: any

describe('FormModal.vue', () => {
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

    wrapper = mount(FormModal, {
      props: {
        title: '表单对话框',
        visible: true,
        formData: mockFormData,
        formFields: mockFormFields,
        width: '500px'
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
    expect(wrapper.props('title')).toBe('表单对话框')
  })

  it('显示表单字段', () => {
    expect(wrapper.props('formFields')).toEqual(mockFormFields)
  })

  it('处理表单提交', async () => {
    const mockValidate = vi.fn().mockResolvedValue(true)
    wrapper.vm.formRef = { validate: mockValidate }
    
    await wrapper.vm.handleSubmit()
    
    expect(mockValidate).toHaveBeenCalled()
    expect(wrapper.emitted('submit')).toBeTruthy()
  })

  it('处理表单验证失败', async () => {
    const mockValidate = vi.fn().mockRejectedValue(new Error('验证失败'))
    wrapper.vm.formRef = { validate: mockValidate }
    
    await wrapper.vm.handleSubmit()
    
    expect(ElMessage.error).toHaveBeenCalledWith('请检查表单输入')
  })

  it('处理取消操作', () => {
    wrapper.vm.handleCancel()
    expect(wrapper.emitted('update:visible')).toBeTruthy()
    expect(wrapper.emitted('update:visible')[0]).toEqual([false])
  })

  it('重置表单', () => {
    wrapper.vm.resetForm()
    expect(wrapper.emitted('reset')).toBeTruthy()
  })

  it('暴露公共方法', () => {
    expect(wrapper.vm.validate).toBeDefined()
    expect(wrapper.vm.resetForm).toBeDefined()
    expect(wrapper.vm.getFormData).toBeDefined()
  })
})