
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
import NotificationTemplates from '@/components/centers/activity/NotificationTemplates.vue'

// Mock Element Plus components
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElButton: {
      name: 'ElButton',
      template: '<button class="el-button" :disabled="disabled" :loading="loading" @click="$emit(\'click\')"><slot></slot></button>',
      props: ['type', 'disabled', 'loading']
    },
    ElDialog: {
      name: 'ElDialog',
      template: '<div class="el-dialog"><slot></slot><slot name="footer"></slot></div>',
      props: ['modelValue', 'title', 'width']
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
      props: ['modelValue', 'placeholder', 'type', 'rows']
    },
    ElSelect: {
      name: 'ElSelect',
      template: '<select class="el-select" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot></slot></select>',
      props: ['modelValue', 'placeholder', 'style']
    },
    ElOption: {
      name: 'ElOption',
      template: '<option class="el-option" :value="value">{{ label }}</option>',
      props: ['value', 'label']
    },
    ElDropdown: {
      name: 'ElDropdown',
      template: '<div class="el-dropdown"><slot></slot><slot name="dropdown"></slot></div>'
    },
    ElDropdownMenu: {
      name: 'ElDropdownMenu',
      template: '<div class="el-dropdown-menu"><slot></slot></div>'
    },
    ElDropdownItem: {
      name: 'ElDropdownItem',
      template: '<div class="el-dropdown-item" @click="$emit(\'command\')"><slot></slot></div>',
      props: ['divided', 'command']
    },
    ElIcon: {
      name: 'ElIcon',
      template: '<i class="el-icon"><slot></slot></i>'
    },
    ElTag: {
      name: 'ElTag',
      template: '<span class="el-tag"><slot></slot></span>',
      props: ['size']
    },
    ElMessage: {
      install: (app: any) => {
        app.config.globalProperties.$message = {
          success: vi.fn()
        }
      }
    },
    ElMessageBox: {
      confirm: vi.fn()
    }
  }
})

describe('NotificationTemplates.vue', () => {
  let wrapper: any

  const createWrapper = () => {
    return mount(NotificationTemplates, {
      global: {
        stubs: {
          'el-button': true,
          'el-dialog': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-icon': true,
          'el-tag': true
        },
        mocks: {
          $message: {
            success: vi.fn()
          }
        }
      }
    })
  }

  beforeEach(async () => {
    wrapper = null
    vi.clearAllMocks()
  })

  describe('组件渲染', () => {
    it('应该正确渲染通知模板页面基本结构', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.notification-templates').exists()).toBe(true)
      expect(wrapper.find('.templates-header').exists()).toBe(true)
      expect(wrapper.find('.templates-grid').exists()).toBe(true)
    })

    it('应该渲染模板头部', () => {
      wrapper = createWrapper()
      
      const header = wrapper.find('.templates-header')
      expect(header.find('h3').text()).toBe('通知模板')
      
      const createButton = header.find('.el-button')
      expect(createButton.exists()).toBe(true)
      expect(createButton.text()).toContain('新建模板')
    })

    it('应该渲染模板网格', () => {
      wrapper = createWrapper()
      
      const grid = wrapper.find('.templates-grid')
      expect(grid.exists()).toBe(true)
      
      const templateCards = grid.findAll('.template-card')
      expect(templateCards.length).toBe(3) // 默认有3个模板
    })

    it('应该渲染模板卡片', () => {
      wrapper = createWrapper()
      
      const templateCards = wrapper.findAll('.template-card')
      const firstCard = templateCards[0]
      
      expect(firstCard.find('.template-header').exists()).toBe(true)
      expect(firstCard.find('.template-type').exists()).toBe(true)
      expect(firstCard.find('.template-content').exists()).toBe(true)
      expect(firstCard.find('.template-footer').exists()).toBe(true)
    })

    it('应该渲染模板编辑对话框', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.el-dialog').exists()).toBe(true)
    })
  })

  describe('模板数据显示', () => {
    it('应该正确显示模板列表', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.templates).toHaveLength(3)
      
      const templates = wrapper.vm.templates
      expect(templates[0].name).toBe('活动报名成功通知')
      expect(templates[1].name).toBe('活动提醒通知')
      expect(templates[2].name).toBe('活动取消通知')
    })

    it('应该正确显示模板卡片内容', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.$nextTick()
      
      const templateCards = wrapper.findAll('.template-card')
      const firstCard = templateCards[0]
      
      expect(firstCard.find('.template-header h4').text()).toBe('活动报名成功通知')
      expect(firstCard.find('.template-content').text()).toContain('亲爱的{parentName}家长')
      expect(firstCard.find('.usage-count').text()).toBe('使用次数: 25')
      expect(firstCard.find('.update-time').text()).toBeDefined()
    })

    it('应该正确显示模板类型标签', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.$nextTick()
      
      const templateCards = wrapper.findAll('.template-card')
      const firstCard = templateCards[0]
      
      const typeTag = firstCard.find('.template-type .el-tag')
      expect(typeTag.exists()).toBe(true)
      expect(typeTag.text()).toBe('报名通知')
    })

    it('应该正确显示更多操作图标', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.$nextTick()
      
      const templateCards = wrapper.findAll('.template-card')
      const firstCard = templateCards[0]
      
      const moreIcon = firstCard.find('.more-icon')
      expect(moreIcon.exists()).toBe(true)
    })
  })

  describe('模板选择功能', () => {
    it('应该正确处理模板选择', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.$nextTick()
      
      const templateCards = wrapper.findAll('.template-card')
      const firstCard = templateCards[0]
      const template = wrapper.vm.templates[0]
      
      await firstCard.trigger('click')
      
      expect(wrapper.emitted('select')).toBeTruthy()
      expect(wrapper.emitted('select')[0]).toEqual([template])
    })

    it('应该正确发射选择事件', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.$nextTick()
      
      const template = wrapper.vm.templates[0]
      await wrapper.vm.handleSelectTemplate(template)
      
      expect(wrapper.emitted('select')).toBeTruthy()
      expect(wrapper.emitted('select')[0]).toEqual([template])
    })
  })

  describe('模板操作功能', () => {
    it('应该正确处理模板编辑操作', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.$nextTick()
      
      const template = wrapper.vm.templates[0]
      await wrapper.vm.handleTemplateAction({ action: 'edit', template })
      
      expect(wrapper.vm.isEdit).toBe(true)
      expect(wrapper.vm.dialogVisible).toBe(true)
      expect(wrapper.vm.templateForm).toEqual(template)
    })

    it('应该正确处理模板复制操作', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.$nextTick()
      
      const template = wrapper.vm.templates[0]
      await wrapper.vm.handleTemplateAction({ action: 'copy', template })
      
      expect(wrapper.vm.isEdit).toBe(false)
      expect(wrapper.vm.dialogVisible).toBe(true)
      expect(wrapper.vm.templateForm.id).toBe('')
      expect(wrapper.vm.templateForm.name).toBe(`${template.name} - 副本`)
      expect(wrapper.vm.templateForm.type).toBe(template.type)
      expect(wrapper.vm.templateForm.content).toBe(template.content)
    })

    it('应该正确处理模板删除操作（用户确认）', async () => {
      const { ElMessageBox } = await import('element-plus')
      ElMessageBox.confirm.mockResolvedValueOnce(true)
      
      wrapper = createWrapper()
      
      await wrapper.vm.$nextTick()
      
      const template = wrapper.vm.templates[0]
      await wrapper.vm.handleTemplateAction({ action: 'delete', template })
      
      expect(ElMessageBox.confirm).toHaveBeenCalledWith('确定要删除这个模板吗？', '确认删除', {
        type: 'warning'
      })
      
      expect(wrapper.vm.$message.success).toHaveBeenCalledWith('模板删除成功')
    })

    it('应该正确处理模板删除操作（用户取消）', async () => {
      const { ElMessageBox } = await import('element-plus')
      ElMessageBox.confirm.mockRejectedValueOnce('cancel')
      
      wrapper = createWrapper()
      
      await wrapper.vm.$nextTick()
      
      const template = wrapper.vm.templates[0]
      await wrapper.vm.handleTemplateAction({ action: 'delete', template })
      
      expect(ElMessageBox.confirm).toHaveBeenCalled()
      expect(wrapper.vm.$message.success).not.toHaveBeenCalled()
    })
  })

  describe('模板表单功能', () => {
    it('应该正确初始化表单数据', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.templateForm).toEqual({
        id: '',
        name: '',
        type: '',
        content: ''
      })
    })

    it('应该正确设置表单验证规则', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.rules.name).toHaveLength(1)
      expect(wrapper.vm.rules.name[0].required).toBe(true)
      expect(wrapper.vm.rules.name[0].message).toBe('请输入模板名称')
      expect(wrapper.vm.rules.name[0].trigger).toBe('blur')
      
      expect(wrapper.vm.rules.type).toHaveLength(1)
      expect(wrapper.vm.rules.type[0].required).toBe(true)
      expect(wrapper.vm.rules.type[0].message).toBe('请选择模板类型')
      expect(wrapper.vm.rules.type[0].trigger).toBe('change')
      
      expect(wrapper.vm.rules.content).toHaveLength(1)
      expect(wrapper.vm.rules.content[0].required).toBe(true)
      expect(wrapper.vm.rules.content[0].message).toBe('请输入模板内容')
      expect(wrapper.vm.rules.content[0].trigger).toBe('blur')
    })

    it('应该正确处理新建模板操作', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.handleCreateTemplate()
      
      expect(wrapper.vm.isEdit).toBe(false)
      expect(wrapper.vm.dialogVisible).toBe(true)
      expect(wrapper.vm.templateForm).toEqual({
        id: '',
        name: '',
        type: '',
        content: ''
      })
    })

    it('应该正确处理表单输入', async () => {
      wrapper = createWrapper()
      
      // 测试模板名称输入
      const nameInput = wrapper.findComponent({ name: 'ElInput', props: { modelValue: wrapper.vm.templateForm.name } })
      await nameInput.setValue('测试模板名称')
      expect(wrapper.vm.templateForm.name).toBe('测试模板名称')
      
      // 测试模板类型选择
      const typeSelect = wrapper.findComponent({ name: 'ElSelect', props: { modelValue: wrapper.vm.templateForm.type } })
      await typeSelect.setValue('activity_reminder')
      expect(wrapper.vm.templateForm.type).toBe('activity_reminder')
      
      // 测试模板内容输入
      const contentInput = wrapper.findComponent({ name: 'ElInput', props: { modelValue: wrapper.vm.templateForm.content, type: 'textarea' } })
      await contentInput.setValue('测试模板内容')
      expect(wrapper.vm.templateForm.content).toBe('测试模板内容')
    })

    it('应该正确处理表单提交（新建）', async () => {
      wrapper = createWrapper()
      
      // 设置表单数据
      wrapper.vm.templateForm = {
        id: '',
        name: '新模板',
        type: 'activity_reminder',
        content: '新模板内容'
      }
      
      // Mock 表单验证
      const formRef = { validate: vi.fn().mockResolvedValue(true) }
      wrapper.vm.formRef = formRef
      
      await wrapper.vm.handleSaveTemplate()
      
      expect(formRef.validate).toHaveBeenCalled()
      expect(wrapper.vm.saving).toBe(true)
      
      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 1100))
      
      expect(wrapper.vm.saving).toBe(false)
      expect(wrapper.vm.dialogVisible).toBe(false)
      expect(wrapper.vm.$message.success).toHaveBeenCalledWith('模板创建成功')
    })

    it('应该正确处理表单提交（编辑）', async () => {
      wrapper = createWrapper()
      
      wrapper.vm.isEdit = true
      wrapper.vm.templateForm = {
        id: '1',
        name: '编辑模板',
        type: 'activity_reminder',
        content: '编辑模板内容'
      }
      
      // Mock 表单验证
      const formRef = { validate: vi.fn().mockResolvedValue(true) }
      wrapper.vm.formRef = formRef
      
      await wrapper.vm.handleSaveTemplate()
      
      expect(formRef.validate).toHaveBeenCalled()
      expect(wrapper.vm.saving).toBe(true)
      
      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 1100))
      
      expect(wrapper.vm.saving).toBe(false)
      expect(wrapper.vm.dialogVisible).toBe(false)
      expect(wrapper.vm.$message.success).toHaveBeenCalledWith('模板更新成功')
    })

    it('应该正确处理表单验证失败', async () => {
      wrapper = createWrapper()
      
      // Mock 表单验证失败
      const formRef = { validate: vi.fn().mockRejectedValue(new Error('验证失败')) }
      wrapper.vm.formRef = formRef
      
      await wrapper.vm.handleSaveTemplate()
      
      expect(formRef.validate).toHaveBeenCalled()
      expect(wrapper.vm.saving).toBe(false)
      expect(wrapper.vm.dialogVisible).toBe(true)
    })

    it('应该正确处理表单重置', async () => {
      wrapper = createWrapper()
      
      // 设置一些表单数据
      wrapper.vm.templateForm = {
        id: '1',
        name: '测试模板',
        type: 'activity_reminder',
        content: '测试内容'
      }
      
      // Mock 表单引用
      const formRef = { clearValidate: vi.fn() }
      wrapper.vm.formRef = formRef
      
      await wrapper.vm.resetForm()
      
      expect(wrapper.vm.templateForm).toEqual({
        id: '',
        name: '',
        type: '',
        content: ''
      })
      expect(formRef.clearValidate).toHaveBeenCalled()
    })
  })

  describe('工具函数', () => {
    it('应该正确获取模板类型标签', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getTypeLabel('activity_reminder')).toBe('活动提醒')
      expect(wrapper.vm.getTypeLabel('registration_notice')).toBe('报名通知')
      expect(wrapper.vm.getTypeLabel('activity_cancel')).toBe('活动取消')
      expect(wrapper.vm.getTypeLabel('activity_change')).toBe('活动变更')
      expect(wrapper.vm.getTypeLabel('system_notice')).toBe('系统通知')
      expect(wrapper.vm.getTypeLabel('unknown')).toBe('unknown')
    })

    it('应该正确获取模板类型颜色', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getTypeColor('activity_reminder')).toBe('primary')
      expect(wrapper.vm.getTypeColor('registration_notice')).toBe('success')
      expect(wrapper.vm.getTypeColor('activity_cancel')).toBe('danger')
      expect(wrapper.vm.getTypeColor('activity_change')).toBe('warning')
      expect(wrapper.vm.getTypeColor('system_notice')).toBe('info')
      expect(wrapper.vm.getTypeColor('unknown')).toBe('info')
    })

    it('应该正确格式化日期', () => {
      wrapper = createWrapper()
      
      const dateStr = '2024-01-15'
      const formatted = wrapper.vm.formatDate(dateStr)
      
      expect(formatted).toBeDefined()
      expect(typeof formatted).toBe('string')
      expect(formatted).toContain('2024')
    })
  })

  describe('变量帮助功能', () => {
    it('应该正确显示可用变量', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.availableVariables).toHaveLength(7)
      
      const variables = wrapper.vm.availableVariables
      expect(variables[0].key).toBe('{activityName}')
      expect(variables[0].description).toBe('活动名称')
      expect(variables[1].key).toBe('{startTime}')
      expect(variables[1].description).toBe('开始时间')
    })

    it('应该在表单中显示变量帮助', () => {
      wrapper = createWrapper()
      
      const variablesHelp = wrapper.find('.variables-help')
      expect(variablesHelp.exists()).toBe(true)
      
      const tags = variablesHelp.findAll('.el-tag')
      expect(tags.length).toBe(7)
    })
  })

  describe('边界条件测试', () => {
    it('应该处理空的模板列表', async () => {
      wrapper = createWrapper()
      
      // 设置空的模板列表
      wrapper.vm.templates = []
      await wrapper.vm.$nextTick()
      
      const templateCards = wrapper.findAll('.template-card')
      expect(templateCards.length).toBe(0)
    })

    it('应该处理特殊字符的模板内容', async () => {
      wrapper = createWrapper()
      
      const specialTemplate = {
        id: '1',
        name: '特殊字符模板',
        type: 'activity_reminder',
        content: '模板内容包含特殊字符：& < > " \' 和表情符号 😊',
        usageCount: 1,
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
      }
      
      wrapper.vm.templates = [specialTemplate]
      await wrapper.vm.$nextTick()
      
      const templateCards = wrapper.findAll('.template-card')
      const firstCard = templateCards[0]
      
      expect(firstCard.find('.template-header h4').text()).toBe('特殊字符模板')
      expect(firstCard.find('.template-content').text()).toContain('特殊字符')
    })

    it('应该处理很长的模板内容', async () => {
      wrapper = createWrapper()
      
      const longContent = '这是一个非常长的模板内容，'.repeat(50)
      const longTemplate = {
        id: '1',
        name: '长内容模板',
        type: 'activity_reminder',
        content: longContent,
        usageCount: 1,
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
      }
      
      wrapper.vm.templates = [longTemplate]
      await wrapper.vm.$nextTick()
      
      const templateCards = wrapper.findAll('.template-card')
      const firstCard = templateCards[0]
      
      expect(firstCard.find('.template-content').text()).toBe(longContent)
    })

    it('应该处理空的使用次数', async () => {
      wrapper = createWrapper()
      
      const noUsageTemplate = {
        id: '1',
        name: '未使用模板',
        type: 'activity_reminder',
        content: '模板内容',
        usageCount: 0,
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
      }
      
      wrapper.vm.templates = [noUsageTemplate]
      await wrapper.vm.$nextTick()
      
      const templateCards = wrapper.findAll('.template-card')
      const firstCard = templateCards[0]
      
      expect(firstCard.find('.usage-count').text()).toBe('使用次数: 0')
    })

    it('应该处理无效的日期格式', () => {
      wrapper = createWrapper()
      
      const invalidDate = 'invalid-date'
      const formatted = wrapper.vm.formatDate(invalidDate)
      
      expect(formatted).toBeDefined()
      expect(typeof formatted).toBe('string')
    })
  })

  describe('样式和响应式测试', () => {
    it('应该包含必要的 CSS 类', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.notification-templates').exists()).toBe(true)
      expect(wrapper.find('.templates-header').exists()).toBe(true)
      expect(wrapper.find('.templates-grid').exists()).toBe(true)
      expect(wrapper.find('.template-card').exists()).toBe(true)
      expect(wrapper.find('.template-header').exists()).toBe(true)
      expect(wrapper.find('.template-type').exists()).toBe(true)
      expect(wrapper.find('.template-content').exists()).toBe(true)
      expect(wrapper.find('.template-footer').exists()).toBe(true)
      expect(wrapper.find('.variables-help').exists()).toBe(true)
      expect(wrapper.find('.dialog-footer').exists()).toBe(true)
    })

    it('应该正确应用卡片样式', () => {
      wrapper = createWrapper()
      
      const templateCards = wrapper.findAll('.template-card')
      templateCards.forEach(card => {
        expect(card.classes()).toContain('template-card')
        expect(card.find('.template-header').exists()).toBe(true)
        expect(card.find('.template-content').exists()).toBe(true)
        expect(card.find('.template-footer').exists()).toBe(true)
      })
    })

    it('应该正确应用对话框样式', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.handleCreateTemplate()
      
      const dialog = wrapper.find('.el-dialog')
      expect(dialog.exists()).toBe(true)
      expect(dialog.props('title')).toBe('新建模板')
      expect(dialog.props('width')).toBe('600px')
    })

    it('应该正确应用编辑模式对话框标题', async () => {
      wrapper = createWrapper()
      
      wrapper.vm.isEdit = true
      await wrapper.vm.handleCreateTemplate()
      
      const dialog = wrapper.find('.el-dialog')
      expect(dialog.props('title')).toBe('编辑模板')
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

    it('应该正确处理大量模板数据', async () => {
      wrapper = createWrapper()
      
      // 创建大量模板数据
      const manyTemplates = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        name: `模板${i}`,
        type: ['activity_reminder', 'registration_notice', 'activity_cancel'][i % 3],
        content: `模板内容${i}`,
        usageCount: Math.floor(Math.random() * 100),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }))
      
      wrapper.vm.templates = manyTemplates
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.templates).toHaveLength(100)
      
      const templateCards = wrapper.findAll('.template-card')
      expect(templateCards.length).toBe(100)
      
      // 测试渲染性能
      const startTime = performance.now()
      await wrapper.vm.$nextTick()
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(100) // 重新渲染时间应该小于 100ms
    })
  })

  describe('组件集成测试', () => {
    it('应该正确处理模板选择的完整流程', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.$nextTick()
      
      const template = wrapper.vm.templates[0]
      const templateCards = wrapper.findAll('.template-card')
      const firstCard = templateCards[0]
      
      await firstCard.trigger('click')
      
      expect(wrapper.emitted('select')).toBeTruthy()
      expect(wrapper.emitted('select')[0]).toEqual([template])
    })

    it('应该正确处理模板编辑的完整流程', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.$nextTick()
      
      const template = wrapper.vm.templates[0]
      
      // 开始编辑
      await wrapper.vm.handleTemplateAction({ action: 'edit', template })
      
      expect(wrapper.vm.isEdit).toBe(true)
      expect(wrapper.vm.dialogVisible).toBe(true)
      expect(wrapper.vm.templateForm).toEqual(template)
      
      // 修改表单数据
      wrapper.vm.templateForm.name = '修改后的模板名称'
      await wrapper.vm.$nextTick()
      
      // 保存表单
      const formRef = { validate: vi.fn().mockResolvedValue(true) }
      wrapper.vm.formRef = formRef
      
      await wrapper.vm.handleSaveTemplate()
      
      // 等待保存完成
      await new Promise(resolve => setTimeout(resolve, 1100))
      
      expect(wrapper.vm.dialogVisible).toBe(false)
      expect(wrapper.vm.$message.success).toHaveBeenCalledWith('模板更新成功')
    })

    it('应该正确处理模板创建的完整流程', async () => {
      wrapper = createWrapper()
      
      // 创建新模板
      await wrapper.vm.handleCreateTemplate()
      
      expect(wrapper.vm.isEdit).toBe(false)
      expect(wrapper.vm.dialogVisible).toBe(true)
      
      // 填写表单
      wrapper.vm.templateForm = {
        id: '',
        name: '新创建的模板',
        type: 'activity_reminder',
        content: '新模板内容'
      }
      
      // 保存表单
      const formRef = { validate: vi.fn().mockResolvedValue(true) }
      wrapper.vm.formRef = formRef
      
      await wrapper.vm.handleSaveTemplate()
      
      // 等待保存完成
      await new Promise(resolve => setTimeout(resolve, 1100))
      
      expect(wrapper.vm.dialogVisible).toBe(false)
      expect(wrapper.vm.$message.success).toHaveBeenCalledWith('模板创建成功')
    })
  })
})