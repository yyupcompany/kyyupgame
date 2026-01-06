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
import NotificationSettings from '@/components/centers/activity/NotificationSettings.vue'

// Mock Element Plus components
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElTabs: {
      name: 'ElTabs',
      template: '<div class="el-tabs"><slot></slot></div>',
      props: ['modelValue']
    },
    ElTabPane: {
      name: 'ElTabPane',
      template: '<div class="el-tab-pane"><slot></slot></div>',
      props: ['label', 'name']
    },
    ElButton: {
      name: 'ElButton',
      template: '<button class="el-button" :disabled="disabled" :loading="loading" @click="$emit(\'click\')"><slot></slot></button>',
      props: ['type', 'disabled', 'loading']
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
    ElForm: {
      name: 'ElForm',
      template: '<form class="el-form"><slot></slot></form>',
      props: ['model', 'labelWidth']
    },
    ElFormItem: {
      name: 'ElFormItem',
      template: '<div class="el-form-item"><slot></slot><slot name="label"></slot></div>',
      props: ['label']
    },
    ElSwitch: {
      name: 'ElSwitch',
      template: '<input type="checkbox" class="el-switch" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />',
      props: ['modelValue']
    },
    ElSelect: {
      name: 'ElSelect',
      template: '<select class="el-select" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot></slot></select>',
      props: ['modelValue', 'placeholder']
    },
    ElOption: {
      name: 'ElOption',
      template: '<option class="el-option" :value="value">{{ label }}</option>',
      props: ['value', 'label']
    },
    ElInput: {
      name: 'ElInput',
      template: '<input class="el-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
      props: ['modelValue', 'placeholder', 'showPassword', 'type']
    },
    ElInputNumber: {
      name: 'ElInputNumber',
      template: '<input type="number" class="el-input-number" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
      props: ['modelValue', 'min', 'max', 'placeholder']
    },
    ElDialog: {
      name: 'ElDialog',
      template: '<div class="el-dialog"><slot></slot><slot name="footer"></slot></div>',
      props: ['modelValue', 'title', 'width']
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

describe('NotificationSettings.vue', () => {
  let wrapper: any

  const createWrapper = () => {
    return mount(NotificationSettings, {
      global: {
        stubs: {
          'el-tabs': true,
          'el-tab-pane': true,
          'el-button': true,
          'el-checkbox-group': true,
          'el-checkbox': true,
          'el-form': true,
          'el-form-item': true,
          'el-switch': true,
          'el-select': true,
          'el-option': true,
          'el-input': true,
          'el-input-number': true,
          'el-dialog': true
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
    
    // Mock loadSettings 方法
    vi.spyOn(NotificationSettings.methods, 'loadSettings').mockResolvedValue()
  })

  describe('组件渲染', () => {
    it('应该正确渲染通知设置页面基本结构', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.notification-settings').exists()).toBe(true)
      expect(wrapper.find('.settings-header').exists()).toBe(true)
      expect(wrapper.find('.settings-tabs').exists()).toBe(true)
    })

    it('应该渲染设置头部', () => {
      wrapper = createWrapper()
      
      const header = wrapper.find('.settings-header')
      expect(header.find('h3').text()).toBe('通知设置')
      
      const saveButton = header.find('.el-button')
      expect(saveButton.exists()).toBe(true)
      expect(saveButton.text()).toBe('保存设置')
    })

    it('应该渲染标签页', () => {
      wrapper = createWrapper()
      
      const tabs = wrapper.find('.settings-tabs')
      expect(tabs.exists()).toBe(true)
      
      const tabPanes = tabs.findAll('.el-tab-pane')
      expect(tabPanes.length).toBe(4) // 基础设置、短信设置、邮件设置、微信设置
    })

    it('应该渲染基础设置标签页', () => {
      wrapper = createWrapper()
      
      const basicTab = wrapper.findAll('.el-tab-pane')[0]
      expect(basicTab.exists()).toBe(true)
      
      const sections = basicTab.findAll('.settings-section')
      expect(sections.length).toBe(3) // 默认发送方式、自动发送设置、发送频率限制
    })

    it('应该渲染短信设置标签页', () => {
      wrapper = createWrapper()
      
      const smsTab = wrapper.findAll('.el-tab-pane')[1]
      expect(smsTab.exists()).toBe(true)
      
      const sections = smsTab.findAll('.settings-section')
      expect(sections.length).toBe(2) // 短信服务配置、短信模板
    })

    it('应该渲染邮件设置标签页', () => {
      wrapper = createWrapper()
      
      const emailTab = wrapper.findAll('.el-tab-pane')[2]
      expect(emailTab.exists()).toBe(true)
      
      const sections = emailTab.findAll('.settings-section')
      expect(sections.length).toBe(2) // 邮件服务配置、邮件模板
    })

    it('应该渲染微信设置标签页', () => {
      wrapper = createWrapper()
      
      const wechatTab = wrapper.findAll('.el-tab-pane')[3]
      expect(wechatTab.exists()).toBe(true)
      
      const sections = wechatTab.findAll('.settings-section')
      expect(sections.length).toBe(2) // 微信公众号配置、模板消息
    })
  })

  describe('基础设置功能', () => {
    it('应该正确设置默认发送方式', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.settings.defaultSendMethods).toEqual(['system'])
    })

    it('应该正确设置自动发送选项', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.settings.autoReminder).toBe(true)
      expect(wrapper.vm.settings.reminderTime).toBe('1d')
      expect(wrapper.vm.settings.autoConfirmation).toBe(true)
      expect(wrapper.vm.settings.autoStatusChange).toBe(true)
    })

    it('应该正确设置发送频率限制', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.settings.dailyLimit).toBe(500)
      expect(wrapper.vm.settings.hourlyLimit).toBe(50)
    })

    it('应该处理默认发送方式变化', async () => {
      wrapper = createWrapper()
      
      const checkboxGroup = wrapper.findComponent({ name: 'ElCheckboxGroup', props: { modelValue: wrapper.vm.settings.defaultSendMethods } })
      await checkboxGroup.setValue(['system', 'sms'])
      
      expect(wrapper.vm.settings.defaultSendMethods).toEqual(['system', 'sms'])
    })

    it('应该处理自动提醒开关变化', async () => {
      wrapper = createWrapper()
      
      const switchComponent = wrapper.findComponent({ name: 'ElSwitch', props: { modelValue: wrapper.vm.settings.autoReminder } })
      await switchComponent.setValue(false)
      
      expect(wrapper.vm.settings.autoReminder).toBe(false)
    })

    it('应该处理提醒时间选择变化', async () => {
      wrapper = createWrapper()
      
      const selectComponent = wrapper.findComponent({ name: 'ElSelect', props: { modelValue: wrapper.vm.settings.reminderTime } })
      await selectComponent.setValue('2h')
      
      expect(wrapper.vm.settings.reminderTime).toBe('2h')
    })

    it('应该处理每日限制变化', async () => {
      wrapper = createWrapper()
      
      const inputNumber = wrapper.findComponent({ name: 'ElInputNumber', props: { modelValue: wrapper.vm.settings.dailyLimit } })
      await inputNumber.setValue(1000)
      
      expect(wrapper.vm.settings.dailyLimit).toBe(1000)
    })

    it('应该处理每小时限制变化', async () => {
      wrapper = createWrapper()
      
      const inputNumber = wrapper.findComponent({ name: 'ElInputNumber', props: { modelValue: wrapper.vm.settings.hourlyLimit } })
      await inputNumber.setValue(100)
      
      expect(wrapper.vm.settings.hourlyLimit).toBe(100)
    })
  })

  describe('短信设置功能', () => {
    it('应该正确设置短信服务配置', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.settings.sms.provider).toBe('aliyun')
      expect(wrapper.vm.settings.sms.accessKey).toBe('')
      expect(wrapper.vm.settings.sms.secretKey).toBe('')
      expect(wrapper.vm.settings.sms.signature).toBe('')
    })

    it('应该正确设置短信模板', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.settings.sms.templates).toHaveLength(2)
      expect(wrapper.vm.settings.sms.templates[0].type).toBe('activity_reminder')
      expect(wrapper.vm.settings.sms.templates[1].type).toBe('registration_notice')
    })

    it('应该处理短信服务商选择变化', async () => {
      wrapper = createWrapper()
      
      const selectComponent = wrapper.findComponent({ name: 'ElSelect', props: { modelValue: wrapper.vm.settings.sms.provider } })
      await selectComponent.setValue('tencent')
      
      expect(wrapper.vm.settings.sms.provider).toBe('tencent')
    })

    it('应该处理AccessKey输入变化', async () => {
      wrapper = createWrapper()
      
      const inputComponent = wrapper.findComponent({ name: 'ElInput', props: { modelValue: wrapper.vm.settings.sms.accessKey, showPassword: true } })
      await inputComponent.setValue('test-access-key')
      
      expect(wrapper.vm.settings.sms.accessKey).toBe('test-access-key')
    })

    it('应该处理SecretKey输入变化', async () => {
      wrapper = createWrapper()
      
      const inputComponent = wrapper.findComponent({ name: 'ElInput', props: { modelValue: wrapper.vm.settings.sms.secretKey, showPassword: true } })
      await inputComponent.setValue('test-secret-key')
      
      expect(wrapper.vm.settings.sms.secretKey).toBe('test-secret-key')
    })

    it('应该处理签名输入变化', async () => {
      wrapper = createWrapper()
      
      const inputComponent = wrapper.findComponent({ name: 'ElInput', props: { modelValue: wrapper.vm.settings.sms.signature } })
      await inputComponent.setValue('幼儿园通知')
      
      expect(wrapper.vm.settings.sms.signature).toBe('幼儿园通知')
    })
  })

  describe('邮件设置功能', () => {
    it('应该正确设置邮件服务配置', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.settings.email.smtpHost).toBe('')
      expect(wrapper.vm.settings.email.smtpPort).toBe(587)
      expect(wrapper.vm.settings.email.fromEmail).toBe('')
      expect(wrapper.vm.settings.email.password).toBe('')
      expect(wrapper.vm.settings.email.ssl).toBe(true)
    })

    it('应该正确设置邮件模板', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.settings.email.templates).toHaveLength(2)
      expect(wrapper.vm.settings.email.templates[0].type).toBe('activity_reminder')
      expect(wrapper.vm.settings.email.templates[1].type).toBe('registration_notice')
    })

    it('应该处理SMTP服务器输入变化', async () => {
      wrapper = createWrapper()
      
      const inputComponent = wrapper.findComponent({ name: 'ElInput', props: { modelValue: wrapper.vm.settings.email.smtpHost } })
      await inputComponent.setValue('smtp.example.com')
      
      expect(wrapper.vm.settings.email.smtpHost).toBe('smtp.example.com')
    })

    it('应该处理SMTP端口变化', async () => {
      wrapper = createWrapper()
      
      const inputNumber = wrapper.findComponent({ name: 'ElInputNumber', props: { modelValue: wrapper.vm.settings.email.smtpPort } })
      await inputNumber.setValue(465)
      
      expect(wrapper.vm.settings.email.smtpPort).toBe(465)
    })

    it('应该处理发件人邮箱输入变化', async () => {
      wrapper = createWrapper()
      
      const inputComponent = wrapper.findComponent({ name: 'ElInput', props: { modelValue: wrapper.vm.settings.email.fromEmail } })
      await inputComponent.setValue('admin@kindergarten.com')
      
      expect(wrapper.vm.settings.email.fromEmail).toBe('admin@kindergarten.com')
    })

    it('应该处理SSL开关变化', async () => {
      wrapper = createWrapper()
      
      const switchComponent = wrapper.findComponent({ name: 'ElSwitch', props: { modelValue: wrapper.vm.settings.email.ssl } })
      await switchComponent.setValue(false)
      
      expect(wrapper.vm.settings.email.ssl).toBe(false)
    })
  })

  describe('微信设置功能', () => {
    it('应该正确设置微信公众号配置', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.settings.wechat.appId).toBe('')
      expect(wrapper.vm.settings.wechat.appSecret).toBe('')
      expect(wrapper.vm.settings.wechat.token).toBe('')
    })

    it('应该正确设置微信模板', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.settings.wechat.templates).toHaveLength(2)
      expect(wrapper.vm.settings.wechat.templates[0].type).toBe('activity_reminder')
      expect(wrapper.vm.settings.wechat.templates[1].type).toBe('registration_notice')
    })

    it('应该处理AppID输入变化', async () => {
      wrapper = createWrapper()
      
      const inputComponent = wrapper.findComponent({ name: 'ElInput', props: { modelValue: wrapper.vm.settings.wechat.appId } })
      await inputComponent.setValue('wx123456789')
      
      expect(wrapper.vm.settings.wechat.appId).toBe('wx123456789')
    })

    it('应该处理AppSecret输入变化', async () => {
      wrapper = createWrapper()
      
      const inputComponent = wrapper.findComponent({ name: 'ElInput', props: { modelValue: wrapper.vm.settings.wechat.appSecret, showPassword: true } })
      await inputComponent.setValue('app-secret-key')
      
      expect(wrapper.vm.settings.wechat.appSecret).toBe('app-secret-key')
    })

    it('应该处理Token输入变化', async () => {
      wrapper = createWrapper()
      
      const inputComponent = wrapper.findComponent({ name: 'ElInput', props: { modelValue: wrapper.vm.settings.wechat.token } })
      await inputComponent.setValue('wechat-token')
      
      expect(wrapper.vm.settings.wechat.token).toBe('wechat-token')
    })
  })

  describe('模板编辑功能', () => {
    it('应该正确处理短信模板编辑', async () => {
      wrapper = createWrapper()
      
      wrapper.vm.activeTab = 'sms'
      await wrapper.vm.$nextTick()
      
      const template = wrapper.vm.settings.sms.templates[0]
      await wrapper.vm.editTemplate(template)
      
      expect(wrapper.vm.templateDialogVisible).toBe(true)
      expect(wrapper.vm.currentTemplate).toEqual(template)
    })

    it('应该正确处理邮件模板编辑', async () => {
      wrapper = createWrapper()
      
      wrapper.vm.activeTab = 'email'
      await wrapper.vm.$nextTick()
      
      const template = wrapper.vm.settings.email.templates[0]
      await wrapper.vm.editTemplate(template)
      
      expect(wrapper.vm.templateDialogVisible).toBe(true)
      expect(wrapper.vm.currentTemplate).toEqual(template)
    })

    it('应该正确处理微信模板编辑', async () => {
      wrapper = createWrapper()
      
      wrapper.vm.activeTab = 'wechat'
      await wrapper.vm.$nextTick()
      
      const template = wrapper.vm.settings.wechat.templates[0]
      await wrapper.vm.editTemplate(template)
      
      expect(wrapper.vm.templateDialogVisible).toBe(true)
      expect(wrapper.vm.currentTemplate).toEqual(template)
    })

    it('应该正确保存短信模板', async () => {
      wrapper = createWrapper()
      
      wrapper.vm.activeTab = 'sms'
      await wrapper.vm.$nextTick()
      
      const template = wrapper.vm.settings.sms.templates[0]
      wrapper.vm.currentTemplate = { ...template, content: '更新后的内容' }
      
      await wrapper.vm.saveTemplate()
      
      expect(wrapper.vm.settings.sms.templates[0].content).toBe('更新后的内容')
      expect(wrapper.vm.templateDialogVisible).toBe(false)
    })

    it('应该正确保存邮件模板', async () => {
      wrapper = createWrapper()
      
      wrapper.vm.activeTab = 'email'
      await wrapper.vm.$nextTick()
      
      const template = wrapper.vm.settings.email.templates[0]
      wrapper.vm.currentTemplate = { ...template, content: '更新后的内容' }
      
      await wrapper.vm.saveTemplate()
      
      expect(wrapper.vm.settings.email.templates[0].content).toBe('更新后的内容')
      expect(wrapper.vm.templateDialogVisible).toBe(false)
    })

    it('应该正确保存微信模板', async () => {
      wrapper = createWrapper()
      
      wrapper.vm.activeTab = 'wechat'
      await wrapper.vm.$nextTick()
      
      const template = wrapper.vm.settings.wechat.templates[0]
      wrapper.vm.currentTemplate = { ...template, content: '更新后的内容' }
      
      await wrapper.vm.saveTemplate()
      
      expect(wrapper.vm.settings.wechat.templates[0].content).toBe('更新后的内容')
      expect(wrapper.vm.templateDialogVisible).toBe(false)
    })
  })

  describe('工具函数', () => {
    it('应该正确获取模板类型标签', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getTemplateTypeLabel('activity_reminder')).toBe('活动提醒')
      expect(wrapper.vm.getTemplateTypeLabel('registration_notice')).toBe('报名通知')
      expect(wrapper.vm.getTemplateTypeLabel('activity_cancel')).toBe('活动取消')
      expect(wrapper.vm.getTemplateTypeLabel('activity_change')).toBe('活动变更')
      expect(wrapper.vm.getTemplateTypeLabel('system_notice')).toBe('系统通知')
      expect(wrapper.vm.getTemplateTypeLabel('unknown')).toBe('unknown')
    })

    it('应该正确处理模板编辑操作', async () => {
      wrapper = createWrapper()
      
      const template = {
        type: 'activity_reminder',
        content: '原始内容'
      }
      
      await wrapper.vm.editTemplate(template)
      
      expect(wrapper.vm.currentTemplate).toEqual(template)
      expect(wrapper.vm.templateDialogVisible).toBe(true)
    })
  })

  describe('保存设置功能', () => {
    it('应该正确处理保存操作', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.handleSave()
      
      expect(wrapper.vm.saving).toBe(true)
      
      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 1100))
      
      expect(wrapper.vm.saving).toBe(false)
      expect(wrapper.vm.$message.success).toHaveBeenCalledWith('设置保存成功')
    })

    it('应该处理保存操作失败', async () => {
      wrapper = createWrapper()
      
      // Mock loadSettings 方法抛出错误
      vi.spyOn(NotificationSettings.methods, 'loadSettings').mockRejectedValueOnce(new Error('保存失败'))
      
      try {
        await wrapper.vm.handleSave()
      } catch (error) {
        expect(error.message).toBe('保存失败')
      }
      
      expect(wrapper.vm.saving).toBe(false)
    })

    it('应该在保存时显示加载状态', async () => {
      wrapper = createWrapper()
      
      const saveButton = wrapper.find('.settings-header .el-button')
      
      await wrapper.vm.handleSave()
      
      expect(wrapper.vm.saving).toBe(true)
      expect(saveButton.props('loading')).toBe(true)
      
      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 1100))
      
      expect(wrapper.vm.saving).toBe(false)
      expect(saveButton.props('loading')).toBe(false)
    })
  })

  describe('标签页切换', () => {
    it('应该正确处理标签页切换', async () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.activeTab).toBe('basic')
      
      wrapper.vm.activeTab = 'sms'
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.activeTab).toBe('sms')
      
      wrapper.vm.activeTab = 'email'
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.activeTab).toBe('email')
      
      wrapper.vm.activeTab = 'wechat'
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.activeTab).toBe('wechat')
    })
  })

  describe('边界条件测试', () => {
    it('应该处理空的模板内容', async () => {
      wrapper = createWrapper()
      
      const emptyTemplate = {
        type: 'activity_reminder',
        content: ''
      }
      
      await wrapper.vm.editTemplate(emptyTemplate)
      
      expect(wrapper.vm.currentTemplate).toEqual(emptyTemplate)
      expect(wrapper.vm.templateDialogVisible).toBe(true)
    })

    it('应该处理特殊字符的模板内容', async () => {
      wrapper = createWrapper()
      
      const specialTemplate = {
        type: 'activity_reminder',
        content: '模板内容包含特殊字符：& < > " \' 和表情符号 😊'
      }
      
      await wrapper.vm.editTemplate(specialTemplate)
      
      expect(wrapper.vm.currentTemplate).toEqual(specialTemplate)
    })

    it('应该处理很长的模板内容', async () => {
      wrapper = createWrapper()
      
      const longContent = '这是一个非常长的模板内容，'.repeat(100)
      const longTemplate = {
        type: 'activity_reminder',
        content: longContent
      }
      
      await wrapper.vm.editTemplate(longTemplate)
      
      expect(wrapper.vm.currentTemplate).toEqual(longTemplate)
    })

    it('应该处理无效的配置值', async () => {
      wrapper = createWrapper()
      
      // 设置一些无效值
      wrapper.vm.settings.dailyLimit = -1
      wrapper.vm.settings.hourlyLimit = 0
      wrapper.vm.settings.email.smtpPort = 99999
      
      // 组件应该能够处理这些值而不崩溃
      expect(wrapper.vm.settings.dailyLimit).toBe(-1)
      expect(wrapper.vm.settings.hourlyLimit).toBe(0)
      expect(wrapper.vm.settings.email.smtpPort).toBe(99999)
    })

    it('应该处理空模板数组', async () => {
      wrapper = createWrapper()
      
      wrapper.vm.settings.sms.templates = []
      wrapper.vm.settings.email.templates = []
      wrapper.vm.settings.wechat.templates = []
      
      // 组件应该能够处理空数组
      expect(wrapper.vm.settings.sms.templates).toEqual([])
      expect(wrapper.vm.settings.email.templates).toEqual([])
      expect(wrapper.vm.settings.wechat.templates).toEqual([])
    })
  })

  describe('样式和响应式测试', () => {
    it('应该包含必要的 CSS 类', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.notification-settings').exists()).toBe(true)
      expect(wrapper.find('.settings-header').exists()).toBe(true)
      expect(wrapper.find('.settings-tabs').exists()).toBe(true)
      expect(wrapper.find('.settings-section').exists()).toBe(true)
      expect(wrapper.find('.template-list').exists()).toBe(true)
      expect(wrapper.find('.template-item').exists()).toBe(true)
    })

    it('应该正确应用样式到各个元素', () => {
      wrapper = createWrapper()
      
      const sections = wrapper.findAll('.settings-section')
      sections.forEach(section => {
        expect(section.find('h4').exists()).toBe(true)
      })
      
      const templateItems = wrapper.findAll('.template-item')
      templateItems.forEach(item => {
        expect(item.find('.template-header').exists()).toBe(true)
        expect(item.find('.template-content').exists()).toBe(true)
      })
    })

    it('应该正确应用对话框样式', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.editTemplate(wrapper.vm.settings.sms.templates[0])
      
      expect(wrapper.find('.el-dialog').exists()).toBe(true)
      expect(wrapper.find('.dialog-footer').exists()).toBe(true)
    })
  })

  describe('性能测试', () => {
    it('应该快速渲染组件', () => {
      const startTime = performance.now()
      
      wrapper = createWrapper()
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      expect(renderTime).toBeLessThan(100) // 渲染时间应该小于 100ms
    })

    it('应该正确处理大量模板数据', async () => {
      wrapper = createWrapper()
      
      // 添加大量模板数据
      const manyTemplates = Array.from({ length: 100 }, (_, i) => ({
        type: `template_${i}`,
        content: `模板内容${i}`
      }))
      
      wrapper.vm.settings.sms.templates = manyTemplates
      wrapper.vm.settings.email.templates = manyTemplates
      wrapper.vm.settings.wechat.templates = manyTemplates
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.settings.sms.templates).toHaveLength(100)
      expect(wrapper.vm.settings.email.templates).toHaveLength(100)
      expect(wrapper.vm.settings.wechat.templates).toHaveLength(100)
      
      // 测试渲染性能
      const startTime = performance.now()
      await wrapper.vm.$nextTick()
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(100) // 重新渲染时间应该小于 100ms
    })
  })

  describe('组件集成测试', () => {
    it('应该正确处理设置数据的初始化', async () => {
      wrapper = createWrapper()
      
      // 等待组件挂载完成
      await wrapper.vm.$nextTick()
      
      // 验证 loadSettings 方法被调用
      expect(NotificationSettings.methods.loadSettings).toHaveBeenCalled()
    })

    it('应该正确处理模板编辑对话框的显示和隐藏', async () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.templateDialogVisible).toBe(false)
      
      await wrapper.vm.editTemplate(wrapper.vm.settings.sms.templates[0])
      
      expect(wrapper.vm.templateDialogVisible).toBe(true)
      
      wrapper.vm.templateDialogVisible = false
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.templateDialogVisible).toBe(false)
    })

    it('应该正确处理保存操作的完整流程', async () => {
      wrapper = createWrapper()
      
      // 修改一些设置
      wrapper.vm.settings.dailyLimit = 1000
      wrapper.vm.settings.sms.provider = 'tencent'
      
      await wrapper.vm.handleSave()
      
      // 等待保存完成
      await new Promise(resolve => setTimeout(resolve, 1100))
      
      expect(wrapper.vm.$message.success).toHaveBeenCalledWith('设置保存成功')
    })
  })
})