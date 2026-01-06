
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
import DetailPanel from '@/components/centers/DetailPanel.vue'
import { Edit, Check, Close, Expand, Fold } from '@element-plus/icons-vue'

// 模拟Element Plus图标
vi.mock('@element-plus/icons-vue', () => ({
  Edit: vi.fn(),
  Check: vi.fn(),
  Close: vi.fn(),
  Expand: vi.fn(),
  Fold: vi.fn()
}))

// 模拟lodash-es
vi.mock('lodash-es', () => ({
  cloneDeep: (obj: any) => JSON.parse(JSON.stringify(obj))
}))

// 模拟dayjs
vi.mock('dayjs', () => ({
  default: vi.fn().mockReturnValue({
    format: vi.fn().mockReturnValue('2024-01-01')
  })
}))

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
    ElButton: {
      name: 'ElButton',
      template: '<button @click="$emit(\'click\')"><slot></slot></button>'
    },
    ElTag: {
      name: 'ElTag',
      template: '<span><slot></slot></span>'
    },
    ElScrollbar: {
      name: 'ElScrollbar',
      template: '<div><slot></slot></div>'
    },
    ElSkeleton: {
      name: 'ElSkeleton',
      template: '<div class="skeleton"><slot></slot></div>'
    },
    ElEmpty: {
      name: 'ElEmpty',
      template: '<div class="empty"><slot></slot></div>'
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
    ElSelect: {
      name: 'ElSelect',
      template: '<select @change="$emit(\'update:modelValue\', $event.target.value)"><slot></slot></select>'
    },
    ElOption: {
      name: 'ElOption',
      template: '<option :value="value"><slot></slot></option>'
    },
    ElDatePicker: {
      name: 'ElDatePicker',
      template: '<input @input="$emit(\'update:modelValue\', $event.target.value)" />'
    }
  }
})

const mockData = {
  id: 1,
  name: '张三',
  age: 25,
  email: 'zhangsan@example.com',
  status: 'active',
  createdAt: '2024-01-01T00:00:00'
}

const mockSections = [
  {
    title: '基本信息',
    fields: [
      { key: 'name', label: '姓名' },
      { key: 'age', label: '年龄' },
      { key: 'email', label: '邮箱' }
    ]
  },
  {
    title: '其他信息',
    fields: [
      { key: 'status', label: '状态' },
      { key: 'createdAt', label: '创建时间', type: 'date', format: 'YYYY-MM-DD' }
    ]
  }
]

const mockEditableFields = [
  { key: 'name', label: '姓名', type: 'input', placeholder: '请输入姓名' },
  { key: 'age', label: '年龄', type: 'input', placeholder: '请输入年龄' },
  { key: 'email', label: '邮箱', type: 'input', placeholder: '请输入邮箱' }
]

const mockRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }]
}

// 控制台错误检测变量
let consoleSpy: any

describe('DetailPanel.vue', () => {
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

    wrapper = mount(DetailPanel, {
      props: {
        title: '详情面板',
        data: mockData,
        sections: mockSections,
        editableFields: mockEditableFields,
        rules: mockRules,
        editable: true,
        collapsible: true,
        closable: true
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-button': true,
          'el-tag': true,
          'el-scrollbar': true,
          'el-skeleton': true,
          'el-empty': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true
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
    expect(wrapper.find('.detail-panel').exists()).toBe(true)
  })

  it('显示面板头部', () => {
    const header = wrapper.find('.panel-header')
    expect(header.exists()).toBe(true)
    expect(header.find('.panel-title').text()).toBe('详情面板')
  })

  it('显示面板内容', () => {
    const content = wrapper.find('.panel-content')
    expect(content.exists()).toBe(true)
  })

  it('正确初始化编辑模式', () => {
    expect(wrapper.vm.editMode).toBe(false)
  })

  it('正确初始化折叠状态', () => {
    expect(wrapper.vm.collapsed).toBe(false)
  })

  it('正确初始化表单数据', () => {
    expect(wrapper.vm.formData).toEqual(mockData)
  })

  it('切换编辑模式', async () => {
    await wrapper.vm.toggleEditMode()
    expect(wrapper.vm.editMode).toBe(true)
    expect(wrapper.emitted('edit-mode-change')).toBeTruthy()
    expect(wrapper.emitted('edit-mode-change')[0]).toEqual([true])
  })

  it('保存表单数据', async () => {
    const mockValidate = vi.fn().mockResolvedValue(true)
    wrapper.vm.formRef = { validate: mockValidate }
    
    await wrapper.vm.toggleEditMode()
    await wrapper.vm.handleSave()
    
    expect(mockValidate).toHaveBeenCalled()
    expect(wrapper.emitted('save')).toBeTruthy()
    expect(wrapper.emitted('save')[0]).toEqual([mockData])
    expect(wrapper.vm.editMode).toBe(false)
  })

  it('保存失败时显示错误信息', async () => {
    const mockValidate = vi.fn().mockRejectedValue(new Error('验证失败'))
    wrapper.vm.formRef = { validate: mockValidate }
    
    await wrapper.vm.toggleEditMode()
    await wrapper.vm.handleSave()
    
    expect(ElMessage.error).toHaveBeenCalledWith('请检查表单输入')
    expect(wrapper.vm.editMode).toBe(true)
  })

  it('取消编辑', async () => {
    await wrapper.vm.toggleEditMode()
    await wrapper.vm.handleCancel()
    
    expect(wrapper.vm.editMode).toBe(false)
    expect(wrapper.emitted('cancel')).toBeTruthy()
    expect(wrapper.emitted('edit-mode-change')[1]).toEqual([false])
  })

  it('切换折叠状态', async () => {
    await wrapper.vm.toggleCollapse()
    expect(wrapper.vm.collapsed).toBe(true)
    expect(wrapper.emitted('collapse-change')).toBeTruthy()
    expect(wrapper.emitted('collapse-change')[0]).toEqual([true])
  })

  it('触发关闭事件', () => {
    const closeButton = wrapper.findAll('.header-right button')[2]
    closeButton.trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('正确格式化字段值', () => {
    const field = { key: 'name', label: '姓名' }
    expect(wrapper.vm.formatFieldValue('张三', field)).toBe('张三')
    expect(wrapper.vm.formatFieldValue(null, field)).toBe('-')
    expect(wrapper.vm.formatFieldValue(undefined, field)).toBe('-')
    expect(wrapper.vm.formatFieldValue('', field)).toBe('-')
  })

  it('使用自定义格式化函数', () => {
    const field = {
      key: 'name',
      label: '姓名',
      formatter: (value: any) => `姓名: ${value}`
    }
    expect(wrapper.vm.formatFieldValue('张三', field)).toBe('姓名: 张三')
  })

  it('格式化日期字段', () => {
    const field = {
      key: 'createdAt',
      label: '创建时间',
      type: 'date',
      format: 'YYYY-MM-DD'
    }
    expect(wrapper.vm.formatFieldValue('2024-01-01T00:00:00', field)).toBe('2024-01-01')
  })

  it('显示加载状态', () => {
    const loadingWrapper = mount(DetailPanel, {
      props: {
        title: '详情面板',
        loading: true
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-button': true,
          'el-tag': true,
          'el-scrollbar': true,
          'el-skeleton': true,
          'el-empty': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true
        }
      }
    })

    expect(loadingWrapper.find('.loading-state').exists()).toBe(true)
    loadingWrapper.unmount()
  })

  it('显示空状态', () => {
    const emptyWrapper = mount(DetailPanel, {
      props: {
        title: '详情面板',
        data: null,
        showEmpty: true
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-button': true,
          'el-tag': true,
          'el-scrollbar': true,
          'el-skeleton': true,
          'el-empty': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true
        }
      }
    })

    expect(emptyWrapper.find('.empty-state').exists()).toBe(true)
    emptyWrapper.unmount()
  })

  it('显示详情内容', () => {
    expect(wrapper.find('.detail-content').exists()).toBe(true)
    expect(wrapper.find('.view-content').exists()).toBe(true)
    expect(wrapper.find('.detail-sections').exists()).toBe(true)
  })

  it('显示编辑表单', async () => {
    await wrapper.vm.toggleEditMode()
    expect(wrapper.find('.edit-form').exists()).toBe(true)
  })

  it('显示副标题', () => {
    const subtitleWrapper = mount(DetailPanel, {
      props: {
        title: '详情面板',
        subtitle: '副标题信息'
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-button': true,
          'el-tag': true,
          'el-scrollbar': true,
          'el-skeleton': true,
          'el-empty': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true
        }
      }
    })

    expect(subtitleWrapper.find('.header-left').find('el-tag').exists()).toBe(true)
    subtitleWrapper.unmount()
  })

  it('监听数据变化', async () => {
    const newData = { ...mockData, name: '李四' }
    await wrapper.setProps({ data: newData })
    
    expect(wrapper.vm.formData.name).toBe('李四')
  })

  it('监听collapsed属性变化', async () => {
    await wrapper.setProps({ collapsed: true })
    expect(wrapper.vm.collapsed).toBe(true)
  })

  it('暴露公共方法', () => {
    expect(wrapper.vm.toggleEditMode).toBeDefined()
    expect(wrapper.vm.toggleCollapse).toBeDefined()
    expect(wrapper.vm.validate).toBeDefined()
    expect(wrapper.vm.resetFields).toBeDefined()
    expect(wrapper.vm.clearValidate).toBeDefined()
    expect(wrapper.vm.getFormData).toBeDefined()
  })

  it('处理无数据时的表单初始化', () => {
    const noDataWrapper = mount(DetailPanel, {
      props: {
        title: '详情面板',
        data: null,
        editableFields: mockEditableFields
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-button': true,
          'el-tag': true,
          'el-scrollbar': true,
          'el-skeleton': true,
          'el-empty': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true
        }
      }
    })

    const expectedFormData = {
      name: '',
      age: '',
      email: ''
    }
    expect(noDataWrapper.vm.formData).toEqual(expectedFormData)
    noDataWrapper.unmount()
  })

  it('显示面板底部', () => {
    const footerWrapper = mount(DetailPanel, {
      props: {
        title: '详情面板'
      },
      slots: {
        footer: '<div class="footer-content">底部内容</div>'
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-button': true,
          'el-tag': true,
          'el-scrollbar': true,
          'el-skeleton': true,
          'el-empty': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true
        }
      }
    })

    expect(footerWrapper.find('.panel-footer').exists()).toBe(true)
    expect(footerWrapper.find('.footer-content').exists()).toBe(true)
    footerWrapper.unmount()
  })

  it('处理可折叠状态下的内容隐藏', async () => {
    await wrapper.vm.toggleCollapse()
    expect(wrapper.find('.panel-content').attributes('style')).toContain('display: none')
  })

  it('处理不可编辑状态', () => {
    const nonEditableWrapper = mount(DetailPanel, {
      props: {
        title: '详情面板',
        editable: false
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-button': true,
          'el-tag': true,
          'el-scrollbar': true,
          'el-skeleton': true,
          'el-empty': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true
        }
      }
    })

    expect(nonEditableWrapper.vm.editable).toBe(false)
    nonEditableWrapper.unmount()
  })

  it('处理不可折叠状态', () => {
    const nonCollapsibleWrapper = mount(DetailPanel, {
      props: {
        title: '详情面板',
        collapsible: false
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-button': true,
          'el-tag': true,
          'el-scrollbar': true,
          'el-skeleton': true,
          'el-empty': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true
        }
      }
    })

    expect(nonCollapsibleWrapper.vm.collapsible).toBe(false)
    nonCollapsibleWrapper.unmount()
  })

  it('处理不可关闭状态', () => {
    const nonClosableWrapper = mount(DetailPanel, {
      props: {
        title: '详情面板',
        closable: false
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-button': true,
          'el-tag': true,
          'el-scrollbar': true,
          'el-skeleton': true,
          'el-empty': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true
        }
      }
    })

    expect(nonClosableWrapper.vm.closable).toBe(false)
    nonClosableWrapper.unmount()
  })
})