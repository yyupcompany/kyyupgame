
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

import { mount } from '@vue/test-utils'
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

describe, it, expect, beforeEach, vi } from 'vitest'
import NotificationForm from '@/components/centers/activity/NotificationForm.vue'

// Mock Element Plus components
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElDialog: {
      name: 'ElDialog',
      template: '<div class="el-dialog"><slot></slot><slot name="footer"></slot></div>',
      props: ['modelValue', 'title', 'width'],
      emits: ['close']
    },
    ElForm: {
      name: 'ElForm',
      template: '<form class="el-form"><slot></slot></form>',
      props: ['model', 'rules'],
      methods: {
        validate: vi.fn(),
        clearValidate: vi.fn()
      }
    },
    ElFormItem: {
      name: 'ElFormItem',
      template: '<div class="el-form-item"><slot></slot><slot name="label"></slot></div>',
      props: ['label', 'prop']
    },
    ElInput: {
      name: 'ElInput',
      template: '<input class="el-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
      props: ['modelValue', 'maxlength', 'showWordLimit', 'type', 'rows', 'placeholder']
    },
    ElSelect: {
      name: 'ElSelect',
      template: '<select class="el-select" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot></slot></select>',
      props: ['modelValue', 'placeholder', 'multiple', 'style']
    },
    ElOption: {
      name: 'ElOption',
      template: '<option class="el-option" :value="value">{{ label }}</option>',
      props: ['value', 'label']
    },
    ElCheckboxGroup: {
      name: 'ElCheckboxGroup',
      template: '<div class="el-checkbox-group" :value="modelValue" @change="$emit(\'update:modelValue\', $event)"><slot></slot></div>',
      props: ['modelValue']
    },
    ElCheckbox: {
      name: 'ElCheckbox',
      template: '<label class="el-checkbox"><input type="checkbox" :value="value" @change="$emit(\'change\', $event.target.checked)" /><slot></slot></label>',
      props: ['value', 'label']
    },
    ElRadioGroup: {
      name: 'ElRadioGroup',
      template: '<div class="el-radio-group" :value="modelValue" @change="$emit(\'update:modelValue\', $event)"><slot></slot></div>',
      props: ['modelValue']
    },
    ElRadio: {
      name: 'ElRadio',
      template: '<label class="el-radio"><input type="radio" :value="value" @change="$emit(\'change\', $event.target.value)" /><slot></slot></label>',
      props: ['value', 'label']
    },
    ElDatePicker: {
      name: 'ElDatePicker',
      template: '<input class="el-date-picker" type="datetime-local" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)" />',
      props: ['modelValue', 'type', 'placeholder', 'style']
    },
    ElButton: {
      name: 'ElButton',
      template: '<button class="el-button" :disabled="disabled" :loading="loading" @click="$emit(\'click\')"><slot></slot></button>',
      props: ['type', 'disabled', 'loading']
    },
    ElMessage: {
      install: (app: any) => {
        app.config.globalProperties.$message = {
          success: vi.fn()
        }
      }
    }
  }
})

describe('NotificationForm.vue', () => {
  let wrapper: any

  const defaultProps = {
    modelValue: true
  }

  const createWrapper = (props = {}) => {
    return mount(NotificationForm, {
      props: {
        ...defaultProps,
        ...props
      },
      global: {
        stubs: {
          'el-dialog': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-checkbox-group': true,
          'el-checkbox': true,
          'el-radio-group': true,
          'el-radio': true,
          'el-date-picker': true,
          'el-button': true
        },
        mocks: {
          $message: {
            success: vi.fn()
          }
        }
      }
    })
  }

  beforeEach(() => {
    wrapper = null
    vi.clearAllMocks()
  })

  describe('组件渲染', () => {
    it('应该正确渲染通知表单对话框', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.el-dialog').exists()).toBe(true)
      expect(wrapper.find('.el-form').exists()).toBe(true)
    })

    it('应该渲染所有表单字段', () => {
      wrapper = createWrapper()
      
      const formItems = wrapper.findAll('.el-form-item')
      expect(formItems.length).toBe(7) // 标题、类型、接收对象、内容、发送方式、发送时间、优先级
      
      const labels = formItems.map(item => item.find('label').text())
      expect(labels).toContain('通知标题')
      expect(labels).toContain('通知类型')
      expect(labels).toContain('接收对象')
      expect(labels).toContain('通知内容')
      expect(labels).toContain('发送方式')
      expect(labels).toContain('发送时间')
      expect(labels).toContain('优先级')
    })

    it('应该渲染底部操作按钮', () => {
      wrapper = createWrapper()
      
      const footerButtons = wrapper.findAll('.el-button')
      expect(footerButtons.length).toBe(2) // 取消和提交按钮
      
      expect(footerButtons[0].text()).toBe('取消')
      expect(footerButtons[1].text()).toBe('发送')
    })

    it('应该根据编辑状态显示不同的提交按钮文本', () => {
      // 新建状态
      wrapper = createWrapper()
      
      let submitButton = wrapper.findAll('.el-button').find(btn => btn.text() === '发送')
      expect(submitButton.exists()).toBe(true)
      
      // 编辑状态
      wrapper = createWrapper({
        data: {
          id: '1',
          title: '测试通知',
          type: 'activity_reminder',
          recipients: ['all_parents'],
          content: '测试内容',
          sendMethod: ['system'],
          sendTimeType: 'now',
          priority: 'medium'
        }
      })
      
      submitButton = wrapper.findAll('.el-button').find(btn => btn.text() === '更新')
      expect(submitButton.exists()).toBe(true)
    })
  })

  describe('表单数据初始化', () => {
    it('应该正确初始化默认表单数据', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.form).toEqual({
        title: '',
        type: '',
        recipients: [],
        content: '',
        sendMethod: ['system'],
        sendTimeType: 'now',
        priority: 'medium'
      })
    })

    it('应该根据传入的数据初始化表单', () => {
      const formData = {
        id: '1',
        title: '测试通知',
        type: 'activity_reminder',
        recipients: ['all_parents', 'registered_parents'],
        content: '测试内容',
        sendMethod: ['system', 'sms'],
        sendTimeType: 'scheduled',
        sendTime: new Date('2024-03-01T10:00:00Z'),
        priority: 'high'
      }
      
      wrapper = createWrapper({ data: formData })
      
      expect(wrapper.vm.form).toEqual({
        id: '1',
        title: '测试通知',
        type: 'activity_reminder',
        recipients: ['all_parents', 'registered_parents'],
        content: '测试内容',
        sendMethod: ['system', 'sms'],
        sendTimeType: 'scheduled',
        sendTime: new Date('2024-03-01T10:00:00Z'),
        priority: 'high'
      })
    })

    it('应该正确处理数据变化时的表单更新', async () => {
      wrapper = createWrapper()
      
      const initialForm = { ...wrapper.vm.form }
      
      const newData = {
        id: '2',
        title: '新的通知',
        type: 'registration_notice',
        recipients: ['all_teachers'],
        content: '新的内容',
        sendMethod: ['email'],
        sendTimeType: 'now',
        priority: 'low'
      }
      
      await wrapper.setProps({ data: newData })
      
      expect(wrapper.vm.form).toEqual({
        id: '2',
        title: '新的通知',
        type: 'registration_notice',
        recipients: ['all_teachers'],
        content: '新的内容',
        sendMethod: ['email'],
        sendTimeType: 'now',
        priority: 'low'
      })
    })

    it('应该在数据为空时重置表单', async () => {
      wrapper = createWrapper({
        data: {
          id: '1',
          title: '测试通知',
          type: 'activity_reminder',
          recipients: ['all_parents'],
          content: '测试内容',
          sendMethod: ['system'],
          sendTimeType: 'now',
          priority: 'medium'
        }
      })
      
      await wrapper.setProps({ data: undefined })
      
      expect(wrapper.vm.form).toEqual({
        title: '',
        type: '',
        recipients: [],
        content: '',
        sendMethod: ['system'],
        sendTimeType: 'now',
        priority: 'medium'
      })
    })
  })

  describe('表单验证规则', () => {
    it('应该设置正确的验证规则', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.rules.title).toHaveLength(1)
      expect(wrapper.vm.rules.title[0].required).toBe(true)
      expect(wrapper.vm.rules.title[0].message).toBe('请输入通知标题')
      expect(wrapper.vm.rules.title[0].trigger).toBe('blur')
      
      expect(wrapper.vm.rules.type).toHaveLength(1)
      expect(wrapper.vm.rules.type[0].required).toBe(true)
      expect(wrapper.vm.rules.type[0].message).toBe('请选择通知类型')
      expect(wrapper.vm.rules.type[0].trigger).toBe('change')
      
      expect(wrapper.vm.rules.recipients).toHaveLength(1)
      expect(wrapper.vm.rules.recipients[0].required).toBe(true)
      expect(wrapper.vm.rules.recipients[0].message).toBe('请选择接收对象')
      expect(wrapper.vm.rules.recipients[0].trigger).toBe('change')
      
      expect(wrapper.vm.rules.content).toHaveLength(1)
      expect(wrapper.vm.rules.content[0].required).toBe(true)
      expect(wrapper.vm.rules.content[0].message).toBe('请输入通知内容')
      expect(wrapper.vm.rules.content[0].trigger).toBe('blur')
      
      expect(wrapper.vm.rules.sendMethod).toHaveLength(1)
      expect(wrapper.vm.rules.sendMethod[0].required).toBe(true)
      expect(wrapper.vm.rules.sendMethod[0].message).toBe('请选择发送方式')
      expect(wrapper.vm.rules.sendMethod[0].trigger).toBe('change')
    })
  })

  describe('用户交互', () => {
    it('应该处理表单字段输入', async () => {
      wrapper = createWrapper()
      
      // 测试标题输入
      const titleInput = wrapper.findComponent({ name: 'ElInput', props: { modelValue: wrapper.vm.form.title } })
      await titleInput.setValue('测试标题')
      expect(wrapper.vm.form.title).toBe('测试标题')
      
      // 测试类型选择
      const typeSelect = wrapper.findComponent({ name: 'ElSelect', props: { modelValue: wrapper.vm.form.type } })
      await typeSelect.setValue('activity_reminder')
      expect(wrapper.vm.form.type).toBe('activity_reminder')
      
      // 测试接收对象选择
      const recipientsSelect = wrapper.findComponent({ name: 'ElSelect', props: { modelValue: wrapper.vm.form.recipients } })
      await recipientsSelect.setValue(['all_parents'])
      expect(wrapper.vm.form.recipients).toEqual(['all_parents'])
      
      // 测试内容输入
      const contentInput = wrapper.findComponent({ name: 'ElInput', props: { modelValue: wrapper.vm.form.content, type: 'textarea' } })
      await contentInput.setValue('测试内容')
      expect(wrapper.vm.form.content).toBe('测试内容')
    })

    it('应该处理发送方式选择', async () => {
      wrapper = createWrapper()
      
      const sendMethodGroup = wrapper.findComponent({ name: 'ElCheckboxGroup', props: { modelValue: wrapper.vm.form.sendMethod } })
      await sendMethodGroup.setValue(['system', 'sms'])
      
      expect(wrapper.vm.form.sendMethod).toEqual(['system', 'sms'])
    })

    it('应该处理发送时间类型选择', async () => {
      wrapper = createWrapper()
      
      const sendTimeTypeGroup = wrapper.findComponent({ name: 'ElRadioGroup', props: { modelValue: wrapper.vm.form.sendTimeType } })
      await sendTimeTypeGroup.setValue('scheduled')
      
      expect(wrapper.vm.form.sendTimeType).toBe('scheduled')
    })

    it('应该处理定时发送时间选择', async () => {
      wrapper = createWrapper()
      
      // 先设置为定时发送
      wrapper.vm.form.sendTimeType = 'scheduled'
      await wrapper.vm.$nextTick()
      
      const datePicker = wrapper.findComponent({ name: 'ElDatePicker', props: { modelValue: wrapper.vm.form.sendTime } })
      const testDate = new Date('2024-03-01T10:00:00Z')
      await datePicker.setValue(testDate)
      
      expect(wrapper.vm.form.sendTime).toEqual(testDate)
    })

    it('应该处理优先级选择', async () => {
      wrapper = createWrapper()
      
      const prioritySelect = wrapper.findComponent({ name: 'ElSelect', props: { modelValue: wrapper.vm.form.priority } })
      await prioritySelect.setValue('high')
      
      expect(wrapper.vm.form.priority).toBe('high')
    })

    it('应该处理表单提交', async () => {
      wrapper = createWrapper()
      
      // 设置表单数据
      wrapper.vm.form = {
        title: '测试通知',
        type: 'activity_reminder',
        recipients: ['all_parents'],
        content: '测试内容',
        sendMethod: ['system'],
        sendTimeType: 'now',
        priority: 'medium'
      }
      
      // Mock 表单验证
      const formRef = { validate: vi.fn().mockResolvedValue(true) }
      wrapper.vm.formRef = formRef
      
      await wrapper.vm.handleSubmit()
      
      expect(formRef.validate).toHaveBeenCalled()
      expect(wrapper.emitted('submit')).toBeTruthy()
      
      const emittedData = wrapper.emitted('submit')[0][0]
      expect(emittedData.title).toBe('测试通知')
      expect(emittedData.type).toBe('activity_reminder')
      expect(emittedData.recipients).toEqual(['all_parents'])
      expect(emittedData.content).toBe('测试内容')
      expect(emittedData.sendMethod).toEqual(['system'])
      expect(emittedData.sendTimeType).toBe('now')
      expect(emittedData.priority).toBe('medium')
      expect(emittedData.sendTime).toBeUndefined() // 立即发送时应该删除 sendTime
    })

    it('应该处理定时发送的表单提交', async () => {
      wrapper = createWrapper()
      
      const testDate = new Date('2024-03-01T10:00:00Z')
      wrapper.vm.form = {
        title: '测试通知',
        type: 'activity_reminder',
        recipients: ['all_parents'],
        content: '测试内容',
        sendMethod: ['system'],
        sendTimeType: 'scheduled',
        sendTime: testDate,
        priority: 'medium'
      }
      
      // Mock 表单验证
      const formRef = { validate: vi.fn().mockResolvedValue(true) }
      wrapper.vm.formRef = formRef
      
      await wrapper.vm.handleSubmit()
      
      const emittedData = wrapper.emitted('submit')[0][0]
      expect(emittedData.sendTime).toEqual(testDate)
    })

    it('应该处理表单验证失败', async () => {
      wrapper = createWrapper()
      
      // Mock 表单验证失败
      const formRef = { validate: vi.fn().mockRejectedValue(new Error('验证失败')) }
      wrapper.vm.formRef = formRef
      
      await wrapper.vm.handleSubmit()
      
      expect(formRef.validate).toHaveBeenCalled()
      expect(wrapper.emitted('submit')).toBeFalsy()
    })

    it('应该处理对话框关闭', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.handleClose()
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false])
    })

    it('应该在关闭时重置表单', async () => {
      wrapper = createWrapper({
        data: {
          id: '1',
          title: '测试通知',
          type: 'activity_reminder',
          recipients: ['all_parents'],
          content: '测试内容',
          sendMethod: ['system'],
          sendTimeType: 'now',
          priority: 'medium'
        }
      })
      
      // Mock 表单引用
      const formRef = { clearValidate: vi.fn() }
      wrapper.vm.formRef = formRef
      
      await wrapper.vm.handleClose()
      
      expect(wrapper.vm.form).toEqual({
        title: '',
        type: '',
        recipients: [],
        content: '',
        sendMethod: ['system'],
        sendTimeType: 'now',
        priority: 'medium'
      })
      expect(formRef.clearValidate).toHaveBeenCalled()
    })
  })

  describe('计算属性', () => {
    it('应该正确计算 visible 计算属性', () => {
      wrapper = createWrapper({ modelValue: true })
      expect(wrapper.vm.visible).toBe(true)
      
      wrapper = createWrapper({ modelValue: false })
      expect(wrapper.vm.visible).toBe(false)
    })

    it('应该正确计算 isEdit 计算属性', () => {
      wrapper = createWrapper()
      expect(wrapper.vm.isEdit).toBe(false)
      
      wrapper = createWrapper({
        data: {
          id: '1',
          title: '测试通知'
        }
      })
      expect(wrapper.vm.isEdit).toBe(true)
    })
  })

  describe('边界条件测试', () => {
    it('应该处理空的数据对象', () => {
      wrapper = createWrapper({ data: {} })
      
      expect(wrapper.vm.form).toEqual({
        title: '',
        type: '',
        recipients: [],
        content: '',
        sendMethod: ['system'],
        sendTimeType: 'now',
        priority: 'medium'
      })
    })

    it('应该处理部分缺失的字段', () => {
      wrapper = createWrapper({
        data: {
          title: '测试通知',
          type: 'activity_reminder'
          // 缺少其他字段
        }
      })
      
      expect(wrapper.vm.form.title).toBe('测试通知')
      expect(wrapper.vm.form.type).toBe('activity_reminder')
      expect(wrapper.vm.form.recipients).toEqual([]) // 默认值
      expect(wrapper.vm.form.content).toBe('') // 默认值
      expect(wrapper.vm.form.sendMethod).toEqual(['system']) // 默认值
      expect(wrapper.vm.form.sendTimeType).toBe('now') // 默认值
      expect(wrapper.vm.form.priority).toBe('medium') // 默认值
    })

    it('应该处理特殊字符的输入', async () => {
      wrapper = createWrapper()
      
      const specialChars = {
        title: '测试标题 & < > " \'',
        content: '测试内容 @#$%^&*()',
        type: 'activity_reminder'
      }
      
      // 设置特殊字符内容
      wrapper.vm.form = { ...wrapper.vm.form, ...specialChars }
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.form.title).toBe(specialChars.title)
      expect(wrapper.vm.form.content).toBe(specialChars.content)
    })

    it('应该处理很长的输入内容', async () => {
      wrapper = createWrapper()
      
      const longTitle = '这是一个非常长的标题，'.repeat(20)
      const longContent = '这是一个非常长的内容，'.repeat(100)
      
      wrapper.vm.form.title = longTitle
      wrapper.vm.form.content = longContent
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.form.title).toBe(longTitle)
      expect(wrapper.vm.form.content).toBe(longContent)
    })

    it('应该处理无效的日期时间', async () => {
      wrapper = createWrapper()
      
      wrapper.vm.form.sendTimeType = 'scheduled'
      wrapper.vm.form.sendTime = new Date('invalid-date')
      await wrapper.vm.$nextTick()
      
      // 应该能够处理无效日期而不崩溃
      expect(wrapper.vm.form.sendTime).toBeInstanceOf(Date)
    })
  })

  describe('样式和响应式测试', () => {
    it('应该包含必要的 CSS 类', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.el-dialog').exists()).toBe(true)
      expect(wrapper.find('.el-form').exists()).toBe(true)
      expect(wrapper.find('.el-form-item').exists()).toBe(true)
      expect(wrapper.find('.el-input').exists()).toBe(true)
      expect(wrapper.find('.el-select').exists()).toBe(true)
      expect(wrapper.find('.el-checkbox-group').exists()).toBe(true)
      expect(wrapper.find('.el-radio-group').exists()).toBe(true)
      expect(wrapper.find('.el-date-picker').exists()).toBe(true)
      expect(wrapper.find('.el-button').exists()).toBe(true)
    })

    it('应该正确应用对话框属性', () => {
      wrapper = createWrapper()
      
      const dialog = wrapper.findComponent({ name: 'ElDialog' })
      expect(dialog.props('title')).toBe('新建通知')
      expect(dialog.props('width')).toBe('600px')
    })

    it('应该根据编辑状态更新对话框标题', () => {
      wrapper = createWrapper({
        data: {
          id: '1',
          title: '测试通知'
        }
      })
      
      const dialog = wrapper.findComponent({ name: 'ElDialog' })
      expect(dialog.props('title')).toBe('编辑通知')
    })
  })

  describe('性能测试', () => {
    it('应该快速渲染组件', () => {
      const startTime = performance.now()
      
      wrapper = createWrapper()
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      expect(renderTime).toBeLessThan(50) // 渲染时间应该小于 50ms
    })

    it('应该正确处理大量接收对象', async () => {
      wrapper = createWrapper()
      
      const manyRecipients = Array.from({ length: 100 }, (_, i) => `recipient_${i}`)
      wrapper.vm.form.recipients = manyRecipients
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.form.recipients).toHaveLength(100)
      
      // 测试渲染性能
      const startTime = performance.now()
      await wrapper.vm.$nextTick()
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(50) // 重新渲染时间应该小于 50ms
    })
  })

  describe('组件集成测试', () => {
    it('应该正确处理表单重置功能', async () => {
      wrapper = createWrapper({
        data: {
          id: '1',
          title: '测试通知',
          type: 'activity_reminder',
          recipients: ['all_parents'],
          content: '测试内容',
          sendMethod: ['system'],
          sendTimeType: 'now',
          priority: 'medium'
        }
      })
      
      // Mock 表单引用
      const formRef = { clearValidate: vi.fn() }
      wrapper.vm.formRef = formRef
      
      await wrapper.vm.resetForm()
      
      expect(wrapper.vm.form).toEqual({
        title: '',
        type: '',
        recipients: [],
        content: '',
        sendMethod: ['system'],
        sendTimeType: 'now',
        priority: 'medium'
      })
      expect(formRef.clearValidate).toHaveBeenCalled()
    })

    it('应该正确处理加载状态', async () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.loading).toBe(false)
      
      wrapper.vm.loading = true
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.loading).toBe(true)
      
      const submitButton = wrapper.findAll('.el-button').find(btn => 
        btn.text() === '发送' || btn.text() === '更新'
      )
      expect(submitButton.props('loading')).toBe(true)
    })
  })
})