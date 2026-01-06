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
import BasicSettings from '@/components/system/settings/BasicSettings.vue'

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

describe('BasicSettings.vue', () => {
  let wrapper: any

  const mockSettings = [
    {
      id: '1',
      key: 'system_name',
      description: '系统名称',
      value: '幼儿园管理系统'
    },
    {
      id: '2',
      key: 'system_description',
      description: '系统描述',
      value: '这是一个幼儿园管理系统'
    },
    {
      id: '3',
      key: 'system_logo',
      description: '系统Logo',
      value: ''
    },
    {
      id: '4',
      key: 'company_name',
      description: '公司名称',
      value: '教育科技有限公司'
    },
    {
      id: '5',
      key: 'contact_phone',
      description: '联系电话',
      value: '400-123-4567'
    }
  ]

  const createWrapper = (props = {}) => {
    return mount(BasicSettings, {
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
          'el-upload': true,
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

    it('renders form items for each setting', () => {
      wrapper = createWrapper()
      
      const formItems = wrapper.findAll('el-form-item-stub')
      expect(formItems.length).toBe(mockSettings.length)
    })

    it('renders input fields for text settings', () => {
      wrapper = createWrapper()
      
      const inputs = wrapper.findAll('el-input-stub')
      expect(inputs.length).toBeGreaterThan(0)
    })

    it('renders upload component for logo setting', () => {
      wrapper = createWrapper()
      
      const upload = wrapper.find('.logo-upload .el-upload')
      expect(upload.exists()).toBe(true)
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
      
      expect(wrapper.vm.formData['system_name']).toBe('幼儿园管理系统')
      expect(wrapper.vm.formData['system_description']).toBe('这是一个幼儿园管理系统')
      expect(wrapper.vm.formData['system_logo']).toBe('')
      expect(wrapper.vm.formData['company_name']).toBe('教育科技有限公司')
      expect(wrapper.vm.formData['contact_phone']).toBe('400-123-4567')
    })

    it('updates form data when settings change', async () => {
      wrapper = createWrapper()
      
      const newSettings = [
        ...mockSettings,
        {
          id: '6',
          key: 'new_setting',
          description: '新设置',
          value: '新值'
        }
      ]
      
      await wrapper.setProps({ settings: newSettings })
      await nextTick()
      
      expect(wrapper.vm.formData['new_setting']).toBe('新值')
    })

    it('handles empty settings array', () => {
      wrapper = createWrapper({ settings: [] })
      
      expect(wrapper.vm.formData).toEqual({})
    })

    it('handles settings with undefined values', () => {
      const settingsWithUndefined = [
        {
          id: '1',
          key: 'test_setting',
          description: '测试设置',
          value: undefined
        }
      ]
      
      wrapper = createWrapper({ settings: settingsWithUndefined })
      
      expect(wrapper.vm.formData['test_setting']).toBeUndefined()
    })
  })

  describe('Logo Upload Handling', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('validates logo file type correctly', () => {
      const validImageFile = new File(['test'], 'test.png', { type: 'image/png' })
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      
      expect(wrapper.vm.beforeLogoUpload(validImageFile)).toBe(true)
      expect(wrapper.vm.beforeLogoUpload(invalidFile)).toBe(false)
    })

    it('validates logo file size correctly', () => {
      const validSizeFile = new File(['x'.repeat(1024)], 'test.jpg', { type: 'image/jpeg' }) // 1KB
      const invalidSizeFile = new File(['x'.repeat(3 * 1024 * 1024)], 'test.jpg', { type: 'image/jpeg' }) // 3MB
      
      expect(wrapper.vm.beforeLogoUpload(validSizeFile)).toBe(true)
      expect(wrapper.vm.beforeLogoUpload(invalidSizeFile)).toBe(false)
    })

    it('handles logo upload success', async () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' })
      const res = { url: 'https://example.com/logo.png' }
      
      await wrapper.vm.handleLogoSuccess(res, { raw: file })
      
      expect(wrapper.vm.formData['system_logo']).toBeDefined()
    })

    it('handles logo upload without file', async () => {
      const res = { url: 'https://example.com/logo.png' }
      
      await wrapper.vm.handleLogoSuccess(res, { raw: null })
      
      expect(wrapper.vm.formData['system_logo']).toBeUndefined()
    })

    it('handles custom upload request', async () => {
      const options = {
        file: new File(['test'], 'test.png', { type: 'image/png' }),
        onSuccess: vi.fn()
      }
      
      await wrapper.vm.uploadLogo(options)
      
      expect(options.onSuccess).toHaveBeenCalledWith('上传成功')
      expect(ElMessage.success).toHaveBeenCalledWith('Logo上传成功')
    })
  })

  describe('Form Submission', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('emits save event with correct data', () => {
      wrapper.vm.handleSubmit()
      
      expect(wrapper.emitted('save')).toBeTruthy()
      expect(wrapper.emitted('save')[0]).toEqual(['basic', mockSettings])
    })

    it('includes all settings in submission data', () => {
      wrapper.vm.handleSubmit()
      
      const emittedSettings = wrapper.emitted('save')[0][1]
      expect(emittedSettings).toHaveLength(mockSettings.length)
      expect(emittedSettings[0].key).toBe('system_name')
      expect(emittedSettings[0].value).toBe('幼儿园管理系统')
    })

    it('updates setting values with form data', async () => {
      await wrapper.setData({
        'formData.system_name': '新系统名称',
        'formData.company_name': '新公司名称'
      })
      
      wrapper.vm.handleSubmit()
      
      const emittedSettings = wrapper.emitted('save')[0][1]
      const systemNameSetting = emittedSettings.find((s: any) => s.key === 'system_name')
      const companyNameSetting = emittedSettings.find((s: any) => s.key === 'company_name')
      
      expect(systemNameSetting.value).toBe('新系统名称')
      expect(companyNameSetting.value).toBe('新公司名称')
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

  describe('Conditional Rendering', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('renders upload component for system_logo setting', () => {
      const logoSetting = mockSettings.find(s => s.key === 'system_logo')
      const logoFormItem = wrapper.findAll('el-form-item-stub')[mockSettings.indexOf(logoSetting)]
      
      expect(logoFormItem.find('.logo-upload').exists()).toBe(true)
    })

    it('renders input component for non-logo settings', () => {
      const nonLogoSettings = mockSettings.filter(s => s.key !== 'system_logo')
      
      nonLogoSettings.forEach(setting => {
        const settingIndex = mockSettings.indexOf(setting)
        const formItem = wrapper.findAll('el-form-item-stub')[settingIndex]
        
        expect(formItem.find('el-input-stub').exists()).toBe(true)
        expect(formItem.find('.logo-upload').exists()).toBe(false)
      })
    })

    it('renders correct placeholder text for input fields', () => {
      mockSettings
        .filter(s => s.key !== 'system_logo')
        .forEach(setting => {
          const settingIndex = mockSettings.indexOf(setting)
          const formItem = wrapper.findAll('el-form-item-stub')[settingIndex]
          const input = formItem.find('el-input-stub')
          
          expect(input.attributes('placeholder')).toBe(`请输入${setting.description}`)
        })
    })
  })

  describe('Edge Cases', () => {
    it('handles settings with null or undefined values', () => {
      const settingsWithNulls = [
        {
          id: '1',
          key: 'null_setting',
          description: '空值设置',
          value: null
        },
        {
          id: '2',
          key: 'undefined_setting',
          description: '未定义设置',
          value: undefined
        }
      ]
      
      wrapper = createWrapper({ settings: settingsWithNulls })
      
      expect(wrapper.vm.formData['null_setting']).toBeNull()
      expect(wrapper.vm.formData['undefined_setting']).toBeUndefined()
    })

    it('handles settings with empty string values', () => {
      const settingsWithEmpty = [
        {
          id: '1',
          key: 'empty_setting',
          description: '空字符串设置',
          value: ''
        }
      ]
      
      wrapper = createWrapper({ settings: settingsWithEmpty })
      
      expect(wrapper.vm.formData['empty_setting']).toBe('')
    })

    it('handles logo upload with invalid file type', () => {
      const invalidFile = new File(['test'], 'test.exe', { type: 'application/x-executable' })
      
      const result = wrapper.vm.beforeLogoUpload(invalidFile)
      
      expect(result).toBe(false)
      expect(ElMessage.error).toHaveBeenCalledWith('Logo只能是JPG/PNG/GIF格式!')
    })

    it('handles logo upload with oversized file', () => {
      const oversizedFile = new File(['x'.repeat(3 * 1024 * 1024)], 'test.jpg', { type: 'image/jpeg' })
      
      const result = wrapper.vm.beforeLogoUpload(oversizedFile)
      
      expect(result).toBe(false)
      expect(ElMessage.error).toHaveBeenCalledWith('Logo大小不能超过2MB!')
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