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
import SecuritySettings from '@/components/system/settings/SecuritySettings.vue'

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

describe('SecuritySettings.vue', () => {
  let wrapper: any

  const mockSettings = [
    {
      id: '1',
      key: 'login_attempts',
      description: '最大登录尝试次数',
      value: '5'
    },
    {
      id: '2',
      key: 'password_expiry_days',
      description: '密码过期天数',
      value: '90'
    },
    {
      id: '3',
      key: 'session_timeout',
      description: '会话超时时间',
      value: '30'
    },
    {
      id: '4',
      key: 'password_policy',
      description: '密码策略',
      value: '{"rules":["uppercase","lowercase","numbers"],"minLength":8}'
    }
  ]

  const createWrapper = (props = {}) => {
    return mount(SecuritySettings, {
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
          'el-input-number': true,
          'el-checkbox-group': true,
          'el-checkbox': true,
          'el-divider': true,
          'el-button': true
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('renders correctly with default props', () => {
      wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('renders form items for numeric settings', () => {
      wrapper = createWrapper()
      
      const numericSettings = mockSettings.filter(s => s.key !== 'password_policy')
      const formItems = wrapper.findAll('el-form-item-stub')
      
      numericSettings.forEach(setting => {
        const settingIndex = mockSettings.indexOf(setting)
        const formItem = formItems[settingIndex]
        const inputNumber = formItem.find('el-input-number-stub')
        
        expect(inputNumber.exists()).toBe(true)
      })
    })

    it('renders password policy section', () => {
      wrapper = createWrapper()
      
      const divider = wrapper.find('el-divider-stub')
      expect(divider.exists()).toBe(true)
      expect(divider.attributes('content-position')).toBe('left')
    })

    it('renders password policy checkboxes', () => {
      wrapper = createWrapper()
      
      const checkboxGroup = wrapper.find('el-checkbox-group-stub')
      expect(checkboxGroup.exists()).toBe(true)
      
      const checkboxes = wrapper.findAll('el-checkbox-stub')
      expect(checkboxes.length).toBe(4) // uppercase, lowercase, numbers, special
    })

    it('renders minimum password length input', () => {
      wrapper = createWrapper()
      
      const inputNumbers = wrapper.findAll('el-input-number-stub')
      const minLengthInput = inputNumbers[inputNumbers.length - 1] // Last one should be min password length
      
      expect(minLengthInput.exists()).toBe(true)
    })

    it('renders save button', () => {
      wrapper = createWrapper()
      
      const saveButton = wrapper.find('el-button-stub[type="primary"]')
      expect(saveButton.exists()).toBe(true)
    })
  })

  describe('Form Data Management', () => {
    it('initializes form data correctly from settings', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.formData['login_attempts']).toBe(5)
      expect(wrapper.vm.formData['password_expiry_days']).toBe(90)
      expect(wrapper.vm.formData['session_timeout']).toBe(30)
    })

    it('initializes password policy from settings', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.passwordPolicy).toEqual(['uppercase', 'lowercase', 'numbers'])
      expect(wrapper.vm.minPasswordLength).toBe(8)
    })

    it('updates form data when settings change', async () => {
      wrapper = createWrapper()
      
      const newSettings = [
        ...mockSettings,
        {
          id: '5',
          key: 'new_security_setting',
          description: '新安全设置',
          value: '10'
        }
      ]
      
      await wrapper.setProps({ settings: newSettings })
      await nextTick()
      
      expect(wrapper.vm.formData['new_security_setting']).toBe(10)
    })

    it('updates password policy when settings change', async () => {
      wrapper = createWrapper()
      
      const newSettings = [
        ...mockSettings.map(s => 
          s.key === 'password_policy' 
            ? { ...s, value: '{"rules":["lowercase","numbers"],"minLength":6}' }
            : s
        )
      ]
      
      await wrapper.setProps({ settings: newSettings })
      await nextTick()
      
      expect(wrapper.vm.passwordPolicy).toEqual(['lowercase', 'numbers'])
      expect(wrapper.vm.minPasswordLength).toBe(6)
    })

    it('handles empty settings array', () => {
      wrapper = createWrapper({ settings: [] })
      
      expect(wrapper.vm.formData).toEqual({})
      expect(wrapper.vm.passwordPolicy).toEqual(['uppercase', 'lowercase', 'numbers'])
      expect(wrapper.vm.minPasswordLength).toBe(8)
    })

    it('handles invalid password policy JSON', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const settingsWithInvalidPolicy = [
        ...mockSettings.map(s => 
          s.key === 'password_policy' 
            ? { ...s, value: 'invalid-json' }
            : s
        )
      ]
      
      wrapper = createWrapper({ settings: settingsWithInvalidPolicy })
      await nextTick()
      
      expect(consoleSpy).toHaveBeenCalledWith('解析密码策略失败:', expect.any(Error))
      expect(wrapper.vm.passwordPolicy).toEqual(['uppercase', 'lowercase', 'numbers'])
      expect(wrapper.vm.minPasswordLength).toBe(8)
      
      consoleSpy.mockRestore()
    })
  })

  describe('Input Number Configuration', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('has correct min values for numeric inputs', () => {
      expect(wrapper.vm.getMinValue('login_attempts')).toBe(1)
      expect(wrapper.vm.getMinValue('password_expiry_days')).toBe(0)
      expect(wrapper.vm.getMinValue('session_timeout')).toBe(1)
    })

    it('has correct max values for numeric inputs', () => {
      expect(wrapper.vm.getMaxValue('login_attempts')).toBe(10)
      expect(wrapper.vm.getMaxValue('password_expiry_days')).toBe(365)
      expect(wrapper.vm.getMaxValue('session_timeout')).toBe(1440)
    })

    it('returns default min value for unknown keys', () => {
      expect(wrapper.vm.getMinValue('unknown_key')).toBe(0)
    })

    it('returns default max value for unknown keys', () => {
      expect(wrapper.vm.getMaxValue('unknown_key')).toBe(100)
    })

    it('has correct tip texts for numeric inputs', () => {
      expect(wrapper.vm.getSettingTip('login_attempts')).toBe('允许的最大连续登录失败次数，超过将锁定账户')
      expect(wrapper.vm.getSettingTip('password_expiry_days')).toBe('密码过期天数，0表示永不过期')
      expect(wrapper.vm.getSettingTip('session_timeout')).toBe('会话超时时间，单位：分钟')
    })

    it('returns empty tip for unknown keys', () => {
      expect(wrapper.vm.getSettingTip('unknown_key')).toBe('')
    })
  })

  describe('Password Policy Management', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('updates password policy when checkboxes change', async () => {
      await wrapper.setData({ passwordPolicy: ['uppercase', 'numbers', 'special'] })
      
      expect(wrapper.vm.passwordPolicy).toEqual(['uppercase', 'numbers', 'special'])
    })

    it('updates minimum password length when input changes', async () => {
      await wrapper.setData({ minPasswordLength: 12 })
      
      expect(wrapper.vm.minPasswordLength).toBe(12)
    })

    it('handles empty password policy', async () => {
      await wrapper.setData({ passwordPolicy: [] })
      
      expect(wrapper.vm.passwordPolicy).toEqual([])
    })

    it('handles single password policy rule', async () => {
      await wrapper.setData({ passwordPolicy: ['uppercase'] })
      
      expect(wrapper.vm.passwordPolicy).toEqual(['uppercase'])
    })

    it('handles all password policy rules', async () => {
      await wrapper.setData({ passwordPolicy: ['uppercase', 'lowercase', 'numbers', 'special'] })
      
      expect(wrapper.vm.passwordPolicy).toEqual(['uppercase', 'lowercase', 'numbers', 'special'])
    })
  })

  describe('Form Submission', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('emits save event with correct data', () => {
      wrapper.vm.handleSubmit()
      
      expect(wrapper.emitted('save')).toBeTruthy()
      expect(wrapper.emitted('save')[0]).toEqual(['security', expect.any(Array)])
    })

    it('includes all settings in submission data', () => {
      wrapper.vm.handleSubmit()
      
      const emittedSettings = wrapper.emitted('save')[0][1]
      expect(emittedSettings).toHaveLength(mockSettings.length)
    })

    it('updates numeric setting values with form data', async () => {
      await wrapper.setData({
        'formData.login_attempts': 3,
        'formData.password_expiry_days': 60,
        'formData.session_timeout': 15
      })
      
      wrapper.vm.handleSubmit()
      
      const emittedSettings = wrapper.emitted('save')[0][1]
      const loginAttemptsSetting = emittedSettings.find((s: any) => s.key === 'login_attempts')
      const passwordExpirySetting = emittedSettings.find((s: any) => s.key === 'password_expiry_days')
      const sessionTimeoutSetting = emittedSettings.find((s: any) => s.key === 'session_timeout')
      
      expect(loginAttemptsSetting.value).toBe('3')
      expect(passwordExpirySetting.value).toBe('60')
      expect(sessionTimeoutSetting.value).toBe('15')
    })

    it('includes password policy in submission data', () => {
      wrapper.vm.handleSubmit()
      
      const emittedSettings = wrapper.emitted('save')[0][1]
      const passwordPolicySetting = emittedSettings.find((s: any) => s.key === 'password_policy')
      
      expect(passwordPolicySetting.value).toBe('{"rules":["uppercase","lowercase","numbers"],"minLength":8}')
    })

    it('updates password policy in submission data', async () => {
      await wrapper.setData({
        passwordPolicy: ['lowercase', 'numbers', 'special'],
        minPasswordLength: 10
      })
      
      wrapper.vm.handleSubmit()
      
      const emittedSettings = wrapper.emitted('save')[0][1]
      const passwordPolicySetting = emittedSettings.find((s: any) => s.key === 'password_policy')
      
      expect(passwordPolicySetting.value).toBe('{"rules":["lowercase","numbers","special"],"minLength":10}')
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

  describe('Edge Cases', () => {
    it('handles settings with null or undefined values', () => {
      const settingsWithNulls = [
        {
          id: '1',
          key: 'null_security_setting',
          description: '空值安全设置',
          value: null
        },
        {
          id: '2',
          key: 'undefined_security_setting',
          description: '未定义安全设置',
          value: undefined
        }
      ]
      
      wrapper = createWrapper({ settings: settingsWithNulls })
      
      expect(wrapper.vm.formData['null_security_setting']).toBeNull()
      expect(wrapper.vm.formData['undefined_security_setting']).toBeUndefined()
    })

    it('handles settings with non-numeric values', () => {
      const settingsWithNonNumeric = [
        {
          id: '1',
          key: 'non_numeric_setting',
          description: '非数值设置',
          value: 'invalid_number'
        }
      ]
      
      wrapper = createWrapper({ settings: settingsWithNonNumeric })
      
      expect(wrapper.vm.formData['non_numeric_setting']).toBeNaN()
    })

    it('handles minimum password length at boundary values', async () => {
      await wrapper.setData({ minPasswordLength: 6 })
      expect(wrapper.vm.minPasswordLength).toBe(6)
      
      await wrapper.setData({ minPasswordLength: 16 })
      expect(wrapper.vm.minPasswordLength).toBe(16)
    })

    it('handles numeric inputs at boundary values', async () => {
      await wrapper.setData({
        'formData.login_attempts': 1,
        'formData.password_expiry_days': 0,
        'formData.session_timeout': 1
      })
      
      expect(wrapper.vm.formData['login_attempts']).toBe(1)
      expect(wrapper.vm.formData['password_expiry_days']).toBe(0)
      expect(wrapper.vm.formData['session_timeout']).toBe(1)
    })

    it('handles numeric inputs at maximum boundary values', async () => {
      await wrapper.setData({
        'formData.login_attempts': 10,
        'formData.password_expiry_days': 365,
        'formData.session_timeout': 1440
      })
      
      expect(wrapper.vm.formData['login_attempts']).toBe(10)
      expect(wrapper.vm.formData['password_expiry_days']).toBe(365)
      expect(wrapper.vm.formData['session_timeout']).toBe(1440)
    })

    it('handles rapid settings changes', async () => {
      wrapper = createWrapper()
      
      // Simulate rapid settings changes
      await Promise.all([
        wrapper.setProps({ settings: [...mockSettings] }),
        wrapper.setProps({ settings: [...mockSettings.slice(0, 2)] }),
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

    it('handles missing password policy setting', () => {
      const settingsWithoutPasswordPolicy = mockSettings.filter(s => s.key !== 'password_policy')
      wrapper = createWrapper({ settings: settingsWithoutPasswordPolicy })
      
      expect(wrapper.vm.passwordPolicy).toEqual(['uppercase', 'lowercase', 'numbers'])
      expect(wrapper.vm.minPasswordLength).toBe(8)
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