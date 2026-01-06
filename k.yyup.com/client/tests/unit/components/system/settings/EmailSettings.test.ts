
vi.mock('@/utils/request', () => ({
  default: vi.fn(),
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))

vi.mock('../utils/request', () => ({
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))


vi.mock('@/utils/request', () => ({
  default: vi.fn(),
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))

vi.mock('../utils/request', () => ({
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))


vi.mock('@/utils/request', () => ({
  default: vi.fn(),
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))

vi.mock('../utils/request', () => ({
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
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

describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ElementPlus from 'element-plus'
import EmailSettings from '@/components/system/settings/EmailSettings.vue'

// Mock Element Plus components
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn()
    }
  }
})

// Mock API endpoints and request
vi.mock('@/utils/request', () => ({
  request: {
    post: vi.fn()
  }
}))

vi.mock('@/api/endpoints', () => ({
  SYSTEM_ENDPOINTS: {
    EMAIL_TEST: '/api/system/email/test'
  }
}))

describe('EmailSettings.vue', () => {
  let wrapper: any

  const mockSettings = [
    {
      id: '1',
      key: 'mail_driver',
      description: '邮件驱动',
      value: 'smtp'
    },
    {
      id: '2',
      key: 'mail_host',
      description: 'SMTP服务器',
      value: 'smtp.example.com'
    },
    {
      id: '3',
      key: 'mail_port',
      description: 'SMTP端口',
      value: '587'
    },
    {
      id: '4',
      key: 'mail_username',
      description: '邮箱用户名',
      value: 'noreply@example.com'
    },
    {
      id: '5',
      key: 'mail_password',
      description: '邮箱密码',
      value: 'password123'
    },
    {
      id: '6',
      key: 'admin_email',
      description: '管理员邮箱',
      value: 'admin@example.com'
    }
  ]

  const createWrapper = (props = {}) => {
    return mount(EmailSettings, {
      props: {
        settings: mockSettings,
        loading: false,
        ...props
      },
      global: {
        plugins: [ElementPlus],
        stubs: {
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-button': true,
          'el-dialog': true
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock successful API response
    const { request } = require('@/utils/request')
    request.post.mockResolvedValue({
      success: true
    })
  })

  describe('Component Rendering', () => {
    it('renders correctly with default props', () => {
      wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('renders form items for each setting', () => {
      wrapper = createWrapper()
      
      const formItems = wrapper.findAll('el-form-item-stub')
      expect(formItems.length).toBe(mockSettings.length)
    })

    it('renders password input for mail_password setting', () => {
      wrapper = createWrapper()
      
      const passwordSetting = mockSettings.find(s => s.key === 'mail_password')
      const settingIndex = mockSettings.indexOf(passwordSetting)
      const formItem = wrapper.findAll('el-form-item-stub')[settingIndex]
      const input = formItem.find('el-input-stub')
      
      expect(input.attributes('type')).toBe('password')
      expect(input.attributes('show-password')).toBeDefined()
    })

    it('renders text input for non-password settings', () => {
      wrapper = createWrapper()
      
      const nonPasswordSettings = mockSettings.filter(s => s.key !== 'mail_password')
      
      nonPasswordSettings.forEach(setting => {
        const settingIndex = mockSettings.indexOf(setting)
        const formItem = wrapper.findAll('el-form-item-stub')[settingIndex]
        const input = formItem.find('el-input-stub')
        
        expect(input.attributes('type')).toBeUndefined()
      })
    })

    it('renders save and test email buttons', () => {
      wrapper = createWrapper()
      
      const buttons = wrapper.findAll('el-button-stub')
      expect(buttons.length).toBe(2)
      
      const saveButton = buttons.find(btn => btn.attributes('type') === 'primary')
      const testButton = buttons.find(btn => btn.text() === '测试邮件发送')
      
      expect(saveButton.exists()).toBe(true)
      expect(testButton.exists()).toBe(true)
    })

    it('renders test email dialog', () => {
      wrapper = createWrapper()
      
      const dialog = wrapper.find('el-dialog-stub')
      expect(dialog.exists()).toBe(true)
      expect(dialog.attributes('append-to-body')).toBeDefined()
    })
  })

  describe('Form Data Management', () => {
    it('initializes form data correctly from settings', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.formData['mail_driver']).toBe('smtp')
      expect(wrapper.vm.formData['mail_host']).toBe('smtp.example.com')
      expect(wrapper.vm.formData['mail_port']).toBe('587')
      expect(wrapper.vm.formData['mail_username']).toBe('noreply@example.com')
      expect(wrapper.vm.formData['mail_password']).toBe('password123')
      expect(wrapper.vm.formData['admin_email']).toBe('admin@example.com')
    })

    it('updates form data when settings change', async () => {
      wrapper = createWrapper()
      
      const newSettings = [
        ...mockSettings,
        {
          id: '7',
          key: 'new_mail_setting',
          description: '新邮件设置',
          value: 'new_value'
        }
      ]
      
      await wrapper.setProps({ settings: newSettings })
      await nextTick()
      
      expect(wrapper.vm.formData['new_mail_setting']).toBe('new_value')
    })

    it('handles empty settings array', () => {
      wrapper = createWrapper({ settings: [] })
      
      expect(wrapper.vm.formData).toEqual({})
    })

    it('handles settings with undefined values', () => {
      const settingsWithUndefined = [
        {
          id: '1',
          key: 'test_mail_setting',
          description: '测试邮件设置',
          value: undefined
        }
      ]
      
      wrapper = createWrapper({ settings: settingsWithUndefined })
      
      expect(wrapper.vm.formData['test_mail_setting']).toBeUndefined()
    })
  })

  describe('Form Submission', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('emits save event with correct data', () => {
      wrapper.vm.handleSubmit()
      
      expect(wrapper.emitted('save')).toBeTruthy()
      expect(wrapper.emitted('save')[0]).toEqual(['email', mockSettings])
    })

    it('includes all settings in submission data', () => {
      wrapper.vm.handleSubmit()
      
      const emittedSettings = wrapper.emitted('save')[0][1]
      expect(emittedSettings).toHaveLength(mockSettings.length)
      expect(emittedSettings[0].key).toBe('mail_driver')
      expect(emittedSettings[0].value).toBe('smtp')
    })

    it('updates setting values with form data', async () => {
      await wrapper.setData({
        'formData.mail_host': 'new.smtp.com',
        'formData.mail_port': '25'
      })
      
      wrapper.vm.handleSubmit()
      
      const emittedSettings = wrapper.emitted('save')[0][1]
      const hostSetting = emittedSettings.find((s: any) => s.key === 'mail_host')
      const portSetting = emittedSettings.find((s: any) => s.key === 'mail_port')
      
      expect(hostSetting.value).toBe('new.smtp.com')
      expect(portSetting.value).toBe('25')
    })

    it('preserves setting structure in submission data', () => {
      wrapper.vm.handleSubmit()
      
      const emittedSettings = wrapper.emitted('save')[0][1]
      
      emittedSettings.forEach((setting: any) => {
        expect(setting).toHaveProperty('id')
        expect(setting).toHaveProperty('key')
        expect(setting).toHaveProperty('description')
        expect(setting).toHaveProperty('value')
      })
    })
  })

  describe('Test Email Functionality', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('shows test email dialog when handleTestEmail is called', async () => {
      expect(wrapper.vm.testEmailDialogVisible).toBe(false)
      
      await wrapper.vm.handleTestEmail()
      
      expect(wrapper.vm.testEmailDialogVisible).toBe(true)
    })

    it('sets default recipient from admin email setting', async () => {
      await wrapper.vm.handleTestEmail()
      
      expect(wrapper.vm.testEmailForm.recipient).toBe('admin@example.com')
    })

    it('sets default test email subject and content', async () => {
      await wrapper.vm.handleTestEmail()
      
      expect(wrapper.vm.testEmailForm.subject).toBe('测试邮件')
      expect(wrapper.vm.testEmailForm.content).toBe('这是一封测试邮件，用于验证邮件服务器配置是否正确。')
    })

    it('sends test email with correct data', async () => {
      await wrapper.vm.handleTestEmail()
      await wrapper.setData({
        'testEmailForm.recipient': 'test@example.com',
        'testEmailForm.subject': '自定义主题',
        'testEmailForm.content': '自定义内容'
      })
      
      await wrapper.vm.sendTestEmail()
      
      const { request } = require('@/utils/request')
      expect(request.post).toHaveBeenCalledWith('/api/system/email/test', {
        recipient: 'test@example.com',
        subject: '自定义主题',
        content: '自定义内容',
        mailConfig: {
          driver: 'smtp',
          host: 'smtp.example.com',
          port: '587',
          username: 'noreply@example.com',
          password: 'password123'
        }
      })
    })

    it('shows success message on successful test email', async () => {
      await wrapper.vm.handleTestEmail()
      await wrapper.vm.sendTestEmail()
      
      expect(ElMessage.success).toHaveBeenCalledWith('测试邮件发送成功')
      expect(wrapper.vm.testEmailDialogVisible).toBe(false)
    })

    it('handles test email sending errors', async () => {
      const { request } = require('@/utils/request')
      request.post.mockRejectedValue(new Error('Network error'))
      
      await wrapper.vm.handleTestEmail()
      await wrapper.vm.sendTestEmail()
      
      expect(ElMessage.error).toHaveBeenCalledWith('发送测试邮件失败')
    })

    it('does not send test email with empty recipient', async () => {
      await wrapper.vm.handleTestEmail()
      await wrapper.setData({ 'testEmailForm.recipient': '' })
      
      await wrapper.vm.sendTestEmail()
      
      const { request } = require('@/utils/request')
      expect(request.post).not.toHaveBeenCalled()
      expect(ElMessage.warning).toHaveBeenCalledWith('请输入收件人邮箱')
    })

    it('shows loading state during test email sending', async () => {
      await wrapper.vm.handleTestEmail()
      
      // Start sending
      const sendPromise = wrapper.vm.sendTestEmail()
      
      // Check loading state
      expect(wrapper.vm.sendingTestEmail).toBe(true)
      
      // Wait for sending to complete
      await sendPromise
      
      // Check loading state is reset
      expect(wrapper.vm.sendingTestEmail).toBe(false)
    })
  })

  describe('Loading State', () => {
    it('displays loading state when loading prop is true', () => {
      wrapper = createWrapper({ loading: true })
      
      const saveButton = wrapper.find('el-button-stub[type="primary"]')
      expect(saveButton.attributes('loading')).toBeDefined()
    })

    it('does not display loading state when loading prop is false', () => {
      wrapper = createWrapper({ loading: false })
      
      const saveButton = wrapper.find('el-button-stub[type="primary"]')
      expect(saveButton.attributes('loading')).toBeUndefined()
    })

    it('updates loading state when prop changes', async () => {
      wrapper = createWrapper({ loading: false })
      
      let saveButton = wrapper.find('el-button-stub[type="primary"]')
      expect(saveButton.attributes('loading')).toBeUndefined()
      
      await wrapper.setProps({ loading: true })
      
      saveButton = wrapper.find('el-button-stub[type="primary"]')
      expect(saveButton.attributes('loading')).toBeDefined()
    })
  })

  describe('Test Email Dialog', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('has correct test email form structure', async () => {
      await wrapper.vm.handleTestEmail()
      
      expect(wrapper.vm.testEmailForm).toEqual({
        recipient: 'admin@example.com',
        subject: '测试邮件',
        content: '这是一封测试邮件，用于验证邮件服务器配置是否正确。'
      })
    })

    it('updates test email form data correctly', async () => {
      await wrapper.vm.handleTestEmail()
      
      await wrapper.setData({
        'testEmailForm.recipient': 'new@example.com',
        'testEmailForm.subject': '新主题',
        'testEmailForm.content': '新内容'
      })
      
      expect(wrapper.vm.testEmailForm.recipient).toBe('new@example.com')
      expect(wrapper.vm.testEmailForm.subject).toBe('新主题')
      expect(wrapper.vm.testEmailForm.content).toBe('新内容')
    })

    it('closes dialog when test email is sent successfully', async () => {
      await wrapper.vm.handleTestEmail()
      await wrapper.vm.sendTestEmail()
      
      expect(wrapper.vm.testEmailDialogVisible).toBe(false)
    })

    it('keeps dialog open when test email fails', async () => {
      const { request } = require('@/utils/request')
      request.post.mockRejectedValue(new Error('Network error'))
      
      await wrapper.vm.handleTestEmail()
      await wrapper.vm.sendTestEmail()
      
      expect(wrapper.vm.testEmailDialogVisible).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('handles settings with null or undefined values', () => {
      const settingsWithNulls = [
        {
          id: '1',
          key: 'null_mail_setting',
          description: '空值邮件设置',
          value: null
        },
        {
          id: '2',
          key: 'undefined_mail_setting',
          description: '未定义邮件设置',
          value: undefined
        }
      ]
      
      wrapper = createWrapper({ settings: settingsWithNulls })
      
      expect(wrapper.vm.formData['null_mail_setting']).toBeNull()
      expect(wrapper.vm.formData['undefined_mail_setting']).toBeUndefined()
    })

    it('handles settings with empty string values', () => {
      const settingsWithEmpty = [
        {
          id: '1',
          key: 'empty_mail_setting',
          description: '空字符串邮件设置',
          value: ''
        }
      ]
      
      wrapper = createWrapper({ settings: settingsWithEmpty })
      
      expect(wrapper.vm.formData['empty_mail_setting']).toBe('')
    })

    it('handles missing admin email setting gracefully', async () => {
      const settingsWithoutAdminEmail = mockSettings.filter(s => s.key !== 'admin_email')
      wrapper = createWrapper({ settings: settingsWithoutAdminEmail })
      
      await wrapper.vm.handleTestEmail()
      
      expect(wrapper.vm.testEmailForm.recipient).toBe('')
    })

    it('handles rapid settings changes', async () => {
      wrapper = createWrapper()
      
      // Simulate rapid settings changes
      await Promise.all([
        wrapper.setProps({ settings: [...mockSettings] }),
        wrapper.setProps({ settings: [...mockSettings.slice(0, 3)] }),
        wrapper.setProps({ settings: [...mockSettings] })
      ])
      
      // Should handle gracefully
      expect(wrapper.vm.formData).toBeDefined()
    })

    it('handles empty settings array gracefully', () => {
      wrapper = createWrapper({ settings: [] })
      
      wrapper.vm.handleSubmit()
      
      expect(wrapper.emitted('save')).toBeTruthy()
      expect(wrapper.emitted('save')[0][1]).toEqual([])
    })

    it('handles concurrent test email attempts', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.handleTestEmail()
      
      // Start multiple test email sends
      const sendPromise1 = wrapper.vm.sendTestEmail()
      const sendPromise2 = wrapper.vm.sendTestEmail()
      
      // Wait for both to complete
      await Promise.all([sendPromise1, sendPromise2])
      
      // Should handle gracefully
      expect(wrapper.vm.sendingTestEmail).toBe(false)
    })
  })

  describe('Props Validation', () => {
    it('accepts settings array prop', () => {
      wrapper = createWrapper({ settings: mockSettings })
      
      expect(wrapper.vm.settings).toEqual(mockSettings)
    })

    it('accepts loading boolean prop', () => {
      wrapper = createWrapper({ loading: true })
      
      expect(wrapper.vm.loading).toBe(true)
    })

    it('handles missing settings prop', () => {
      wrapper = createWrapper({ settings: undefined })
      
      expect(wrapper.vm.settings).toBeUndefined()
    })

    it('handles missing loading prop', () => {
      wrapper = createWrapper({ loading: undefined })
      
      expect(wrapper.vm.loading).toBeUndefined()
    })
  })
})