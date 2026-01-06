
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
import StorageSettings from '@/components/system/settings/StorageSettings.vue'

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
    STORAGE_TEST: '/api/system/storage/test'
  }
}))

describe('StorageSettings.vue', () => {
  let wrapper: any

  const mockSettings = [
    {
      id: '1',
      key: 'storage_driver',
      description: '存储驱动',
      value: 'local'
    },
    {
      id: '2',
      key: 'max_upload_size',
      description: '最大上传大小',
      value: '10'
    },
    {
      id: '3',
      key: 'allowed_file_types',
      description: '允许的文件类型',
      value: 'jpg,png,pdf,doc,docx'
    },
    {
      id: '4',
      key: 'cloud_storage_config',
      description: '云存储配置',
      value: '{"endpoint":"","region":"","accessKey":"","secretKey":"","bucket":"","domain":"","private":false}'
    }
  ]

  const createWrapper = (props = {}) => {
    return mount(StorageSettings, {
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
          'el-input-number': true,
          'el-select': true,
          'el-option': true,
          'el-option-group': true,
          'el-divider': true,
          'el-upload': true,
          'el-button': true,
          'el-switch': true
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock successful API response
    const { request } = require('@/utils/request')
    request.post.mockResolvedValue({
      success: true,
      data: { url: 'https://example.com/test-file.jpg' }
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

    it('renders storage driver select', () => {
      wrapper = createWrapper()
      
      const storageDriverSetting = mockSettings.find(s => s.key === 'storage_driver')
      const settingIndex = mockSettings.indexOf(storageDriverSetting)
      const formItem = wrapper.findAll('el-form-item-stub')[settingIndex]
      const select = formItem.find('el-select-stub')
      
      expect(select.exists()).toBe(true)
    })

    it('renders max upload size input number', () => {
      wrapper = createWrapper()
      
      const maxUploadSizeSetting = mockSettings.find(s => s.key === 'max_upload_size')
      const settingIndex = mockSettings.indexOf(maxUploadSizeSetting)
      const formItem = wrapper.findAll('el-form-item-stub')[settingIndex]
      const inputNumber = formItem.find('el-input-number-stub')
      
      expect(inputNumber.exists()).toBe(true)
    })

    it('renders allowed file types select', () => {
      wrapper = createWrapper()
      
      const allowedFileTypesSetting = mockSettings.find(s => s.key === 'allowed_file_types')
      const settingIndex = mockSettings.indexOf(allowedFileTypesSetting)
      const formItem = wrapper.findAll('el-form-item-stub')[settingIndex]
      const select = formItem.find('el-select-stub')
      
      expect(select.exists()).toBe(true)
      expect(select.attributes('multiple')).toBeDefined()
      expect(select.attributes('collapse-tags')).toBeDefined()
    })

    it('renders cloud storage config section when driver is not local', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ 'formData.storage_driver': 'aliyun' })
      
      const cloudConfig = wrapper.find('.cloud-storage-config')
      expect(cloudConfig.exists()).toBe(true)
    })

    it('does not render cloud storage config section when driver is local', () => {
      wrapper = createWrapper()
      
      const cloudConfig = wrapper.find('.cloud-storage-config')
      expect(cloudConfig.exists()).toBe(false)
    })

    it('renders test upload section', () => {
      wrapper = createWrapper()
      
      const testUpload = wrapper.find('.test-upload')
      expect(testUpload.exists()).toBe(true)
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
      
      expect(wrapper.vm.formData['storage_driver']).toBe('local')
      expect(wrapper.vm.formData['max_upload_size']).toBe(10)
      expect(wrapper.vm.formData['allowed_file_types']).toBe('jpg,png,pdf,doc,docx')
    })

    it('initializes selected file types from settings', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.selectedFileTypes).toEqual(['jpg', 'png', 'pdf', 'doc', 'docx'])
    })

    it('initializes cloud config from settings', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.cloudConfig).toEqual({
        endpoint: '',
        region: '',
        accessKey: '',
        secretKey: '',
        bucket: '',
        domain: '',
        private: false
      })
    })

    it('updates form data when settings change', async () => {
      wrapper = createWrapper()
      
      const newSettings = [
        ...mockSettings,
        {
          id: '5',
          key: 'new_storage_setting',
          description: '新存储设置',
          value: 'new_value'
        }
      ]
      
      await wrapper.setProps({ settings: newSettings })
      await nextTick()
      
      expect(wrapper.vm.formData['new_storage_setting']).toBe('new_value')
    })

    it('updates selected file types when settings change', async () => {
      wrapper = createWrapper()
      
      const newSettings = [
        ...mockSettings.map(s => 
          s.key === 'allowed_file_types' 
            ? { ...s, value: 'jpg,png' }
            : s
        )
      ]
      
      await wrapper.setProps({ settings: newSettings })
      await nextTick()
      
      expect(wrapper.vm.selectedFileTypes).toEqual(['jpg', 'png'])
    })

    it('updates cloud config when settings change', async () => {
      wrapper = createWrapper()
      
      const newSettings = [
        ...mockSettings.map(s => 
          s.key === 'cloud_storage_config' 
            ? { ...s, value: '{"endpoint":"oss.aliyun.com","accessKey":"test","secretKey":"secret","bucket":"test-bucket"}' }
            : s
        )
      ]
      
      await wrapper.setProps({ settings: newSettings })
      await nextTick()
      
      expect(wrapper.vm.cloudConfig.endpoint).toBe('oss.aliyun.com')
      expect(wrapper.vm.cloudConfig.accessKey).toBe('test')
      expect(wrapper.vm.cloudConfig.secretKey).toBe('secret')
      expect(wrapper.vm.cloudConfig.bucket).toBe('test-bucket')
    })

    it('handles invalid cloud config JSON', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const settingsWithInvalidConfig = [
        ...mockSettings.map(s => 
          s.key === 'cloud_storage_config' 
            ? { ...s, value: 'invalid-json' }
            : s
        )
      ]
      
      wrapper = createWrapper({ settings: settingsWithInvalidConfig })
      await nextTick()
      
      expect(consoleSpy).toHaveBeenCalledWith('解析云存储配置失败:', expect.any(Error))
      expect(wrapper.vm.cloudConfig).toEqual({
        endpoint: '',
        region: '',
        accessKey: '',
        secretKey: '',
        bucket: '',
        domain: '',
        private: false
      })
      
      consoleSpy.mockRestore()
    })

    it('handles empty settings array', () => {
      wrapper = createWrapper({ settings: [] })
      
      expect(wrapper.vm.formData).toEqual({})
      expect(wrapper.vm.selectedFileTypes).toEqual([])
      expect(wrapper.vm.cloudConfig).toEqual({
        endpoint: '',
        region: '',
        accessKey: '',
        secretKey: '',
        bucket: '',
        domain: '',
        private: false
      })
    })
  })

  describe('Storage Driver Selection', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('has correct storage driver options', () => {
      const storageDriverSetting = mockSettings.find(s => s.key === 'storage_driver')
      const settingIndex = mockSettings.indexOf(storageDriverSetting)
      const formItem = wrapper.findAll('el-form-item-stub')[settingIndex]
      const select = formItem.find('el-select-stub')
      const options = select.findAll('el-option-stub')
      
      expect(options.length).toBe(4)
      expect(options[0].attributes('label')).toBe('本地存储')
      expect(options[0].attributes('value')).toBe('local')
      expect(options[1].attributes('label')).toBe('阿里云OSS')
      expect(options[1].attributes('value')).toBe('aliyun')
    })

    it('shows cloud storage config for aliyun driver', async () => {
      await wrapper.setData({ 'formData.storage_driver': 'aliyun' })
      
      const cloudConfig = wrapper.find('.cloud-storage-config')
      expect(cloudConfig.exists()).toBe(true)
      
      const title = wrapper.vm.getCloudStorageTitle()
      expect(title).toBe('阿里云OSS配置')
    })

    it('shows cloud storage config for tencent driver', async () => {
      await wrapper.setData({ 'formData.storage_driver': 'tencent' })
      
      const cloudConfig = wrapper.find('.cloud-storage-config')
      expect(cloudConfig.exists()).toBe(true)
      
      const title = wrapper.vm.getCloudStorageTitle()
      expect(title).toBe('腾讯云COS配置')
    })

    it('shows cloud storage config for qiniu driver', async () => {
      await wrapper.setData({ 'formData.storage_driver': 'qiniu' })
      
      const cloudConfig = wrapper.find('.cloud-storage-config')
      expect(cloudConfig.exists()).toBe(true)
      
      const title = wrapper.vm.getCloudStorageTitle()
      expect(title).toBe('七牛云存储配置')
    })

    it('hides cloud storage config for local driver', async () => {
      await wrapper.setData({ 'formData.storage_driver': 'local' })
      
      const cloudConfig = wrapper.find('.cloud-storage-config')
      expect(cloudConfig.exists()).toBe(false)
    })

    it('shows correct cloud storage fields for aliyun', async () => {
      await wrapper.setData({ 'formData.storage_driver': 'aliyun' })
      
      const cloudConfig = wrapper.find('.cloud-storage-config')
      const formItems = cloudConfig.findAll('el-form-item-stub')
      
      const labels = formItems.map(item => item.attributes('label'))
      expect(labels).toContain('Endpoint')
      expect(labels).toContain('AccessKey')
      expect(labels).toContain('SecretKey')
      expect(labels).toContain('Bucket')
      expect(labels).toContain('域名')
      expect(labels).toContain('私有空间')
    })

    it('shows correct cloud storage fields for tencent', async () => {
      await wrapper.setData({ 'formData.storage_driver': 'tencent' })
      
      const cloudConfig = wrapper.find('.cloud-storage-config')
      const formItems = cloudConfig.findAll('el-form-item-stub')
      
      const labels = formItems.map(item => item.attributes('label'))
      expect(labels).toContain('Region')
      expect(labels).toContain('AccessKey')
      expect(labels).toContain('SecretKey')
      expect(labels).toContain('Bucket')
      expect(labels).toContain('域名')
    })

    it('shows private space option for aliyun and qiniu', async () => {
      await wrapper.setData({ 'formData.storage_driver': 'aliyun' })
      
      const cloudConfig = wrapper.find('.cloud-storage-config')
      const privateSwitch = cloudConfig.find('el-switch-stub')
      expect(privateSwitch.exists()).toBe(true)
      
      await wrapper.setData({ 'formData.storage_driver': 'qiniu' })
      
      const privateSwitch2 = cloudConfig.find('el-switch-stub')
      expect(privateSwitch2.exists()).toBe(true)
    })

    it('does not show private space option for tencent', async () => {
      await wrapper.setData({ 'formData.storage_driver': 'tencent' })
      
      const cloudConfig = wrapper.find('.cloud-storage-config')
      const privateSwitch = cloudConfig.find('el-switch-stub')
      expect(privateSwitch.exists()).toBe(false)
    })
  })

  describe('File Type Selection', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('has correct file type groups', () => {
      const allowedFileTypesSetting = mockSettings.find(s => s.key === 'allowed_file_types')
      const settingIndex = mockSettings.indexOf(allowedFileTypesSetting)
      const formItem = wrapper.findAll('el-form-item-stub')[settingIndex]
      const select = formItem.find('el-select-stub')
      const optionGroups = select.findAll('el-option-group-stub')
      
      expect(optionGroups.length).toBe(3)
      expect(optionGroups[0].attributes('label')).toBe('图片')
      expect(optionGroups[1].attributes('label')).toBe('文档')
      expect(optionGroups[2].attributes('label')).toBe('其他')
    })

    it('has correct file type options', () => {
      const allowedFileTypesSetting = mockSettings.find(s => s.key === 'allowed_file_types')
      const settingIndex = mockSettings.indexOf(allowedFileTypesSetting)
      const formItem = wrapper.findAll('el-form-item-stub')[settingIndex]
      const select = formItem.find('el-select-stub')
      const options = select.findAll('el-option-stub')
      
      const imageOptions = options.filter(opt => opt.attributes('label') === 'JPG' || opt.attributes('label') === 'PNG')
      const documentOptions = options.filter(opt => opt.attributes('label') === 'PDF' || opt.attributes('label') === 'DOC')
      
      expect(imageOptions.length).toBeGreaterThan(0)
      expect(documentOptions.length).toBeGreaterThan(0)
    })

    it('updates selected file types when selection changes', async () => {
      await wrapper.setData({ selectedFileTypes: ['jpg', 'png', 'pdf'] })
      
      expect(wrapper.vm.selectedFileTypes).toEqual(['jpg', 'png', 'pdf'])
      expect(wrapper.vm.formData['allowed_file_types']).toBe('jpg,png,pdf')
    })

    it('handles empty file type selection', async () => {
      await wrapper.setData({ selectedFileTypes: [] })
      
      expect(wrapper.vm.selectedFileTypes).toEqual([])
      expect(wrapper.vm.formData['allowed_file_types']).toBe('')
    })

    it('handles single file type selection', async () => {
      await wrapper.setData({ selectedFileTypes: ['jpg'] })
      
      expect(wrapper.vm.selectedFileTypes).toEqual(['jpg'])
      expect(wrapper.vm.formData['allowed_file_types']).toBe('jpg')
    })
  })

  describe('Test Upload Functionality', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('handles file selection correctly', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      
      wrapper.vm.handleFileChange(file)
      
      expect(wrapper.vm.testFile).toBe(file)
      expect(wrapper.vm.hasSelectedFile).toBe(true)
    })

    it('updates hasSelectedFile when file is selected', async () => {
      expect(wrapper.vm.hasSelectedFile).toBe(false)
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      wrapper.vm.handleFileChange(file)
      
      expect(wrapper.vm.hasSelectedFile).toBe(true)
    })

    it('sends test upload request with correct data', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      wrapper.vm.handleFileChange(file)
      
      await wrapper.vm.handleTestUpload()
      
      const { request } = require('@/utils/request')
      expect(request.post).toHaveBeenCalledWith('/api/system/storage/test', expect.any(FormData))
    })

    it('includes storage configuration in test upload', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      wrapper.vm.handleFileChange(file)
      
      await wrapper.setData({ 'formData.storage_driver': 'aliyun' })
      await wrapper.setData({
        'cloudConfig.accessKey': 'test_key',
        'cloudConfig.secretKey': 'test_secret'
      })
      
      await wrapper.vm.handleTestUpload()
      
      const { request } = require('@/utils/request')
      const call = request.post.mock.calls[0]
      const formData = call[1]
      
      expect(formData.get('driver')).toBe('aliyun')
      const config = JSON.parse(formData.get('config'))
      expect(config.accessKey).toBe('test_key')
      expect(config.secretKey).toBe('test_secret')
    })

    it('shows success message on successful test upload', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      wrapper.vm.handleFileChange(file)
      
      await wrapper.vm.handleTestUpload()
      
      expect(ElMessage.success).toHaveBeenCalledWith('文件上传成功，访问地址：https://example.com/test-file.jpg')
    })

    it('handles test upload errors', async () => {
      const { request } = require('@/utils/request')
      request.post.mockRejectedValue(new Error('Network error'))
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      wrapper.vm.handleFileChange(file)
      
      await wrapper.vm.handleTestUpload()
      
      expect(ElMessage.error).toHaveBeenCalledWith('测试上传失败')
    })

    it('does not send test upload when no file is selected', async () => {
      expect(wrapper.vm.hasSelectedFile).toBe(false)
      
      await wrapper.vm.handleTestUpload()
      
      const { request } = require('@/utils/request')
      expect(request.post).not.toHaveBeenCalled()
      expect(ElMessage.warning).toHaveBeenCalledWith('请先选择文件')
    })
  })

  describe('Form Submission', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('emits save event with correct data', () => {
      wrapper.vm.handleSubmit()
      
      expect(wrapper.emitted('save')).toBeTruthy()
      expect(wrapper.emitted('save')[0]).toEqual(['storage', expect.any(Array)])
    })

    it('includes all settings in submission data', () => {
      wrapper.vm.handleSubmit()
      
      const emittedSettings = wrapper.emitted('save')[0][1]
      expect(emittedSettings).toHaveLength(mockSettings.length)
    })

    it('updates setting values with form data', async () => {
      await wrapper.setData({
        'formData.storage_driver': 'aliyun',
        'formData.max_upload_size': 20,
        'formData.allowed_file_types': 'jpg,png,pdf'
      })
      
      wrapper.vm.handleSubmit()
      
      const emittedSettings = wrapper.emitted('save')[0][1]
      const driverSetting = emittedSettings.find((s: any) => s.key === 'storage_driver')
      const sizeSetting = emittedSettings.find((s: any) => s.key === 'max_upload_size')
      const typesSetting = emittedSettings.find((s: any) => s.key === 'allowed_file_types')
      
      expect(driverSetting.value).toBe('aliyun')
      expect(sizeSetting.value).toBe('20')
      expect(typesSetting.value).toBe('jpg,png,pdf')
    })

    it('includes cloud storage config in submission data for non-local drivers', async () => {
      await wrapper.setData({
        'formData.storage_driver': 'aliyun'
      })
      await wrapper.setData({
        'cloudConfig': {
          endpoint: 'oss.aliyun.com',
          accessKey: 'test_key',
          secretKey: 'test_secret',
          bucket: 'test_bucket'
        }
      })
      
      wrapper.vm.handleSubmit()
      
      const emittedSettings = wrapper.emitted('save')[0][1]
      const cloudConfigSetting = emittedSettings.find((s: any) => s.key === 'cloud_storage_config')
      
      expect(cloudConfigSetting.value).toBe(JSON.stringify({
        endpoint: 'oss.aliyun.com',
        region: '',
        accessKey: 'test_key',
        secretKey: 'test_secret',
        bucket: 'test_bucket',
        domain: '',
        private: false
      }))
    })

    it('does not include cloud storage config in submission data for local driver', async () => {
      await wrapper.setData({
        'formData.storage_driver': 'local'
      })
      
      wrapper.vm.handleSubmit()
      
      const emittedSettings = wrapper.emitted('save')[0][1]
      const cloudConfigSetting = emittedSettings.find((s: any) => s.key === 'cloud_storage_config')
      
      expect(cloudConfigSetting.value).toBe('{"endpoint":"","region":"","accessKey":"","secretKey":"","bucket":"","domain":"","private":false}')
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
          key: 'null_storage_setting',
          description: '空值存储设置',
          value: null
        },
        {
          id: '2',
          key: 'undefined_storage_setting',
          description: '未定义存储设置',
          value: undefined
        }
      ]
      
      wrapper = createWrapper({ settings: settingsWithNulls })
      
      expect(wrapper.vm.formData['null_storage_setting']).toBeNull()
      expect(wrapper.vm.formData['undefined_storage_setting']).toBeUndefined()
    })

    it('handles max upload size as string', () => {
      const settingsWithStringSize = [
        ...mockSettings.map(s => 
          s.key === 'max_upload_size' 
            ? { ...s, value: '15' }
            : s
        )
      ]
      
      wrapper = createWrapper({ settings: settingsWithStringSize })
      
      expect(wrapper.vm.formData['max_upload_size']).toBe(15)
    })

    it('handles invalid max upload size', () => {
      const settingsWithInvalidSize = [
        ...mockSettings.map(s => 
          s.key === 'max_upload_size' 
            ? { ...s, value: 'invalid_number' }
            : s
        )
      ]
      
      wrapper = createWrapper({ settings: settingsWithInvalidSize })
      
      expect(wrapper.vm.formData['max_upload_size']).toBeNaN()
    })

    it('handles empty allowed file types', () => {
      const settingsWithEmptyTypes = [
        ...mockSettings.map(s => 
          s.key === 'allowed_file_types' 
            ? { ...s, value: '' }
            : s
        )
      ]
      
      wrapper = createWrapper({ settings: settingsWithEmptyTypes })
      
      expect(wrapper.vm.selectedFileTypes).toEqual([])
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

    it('handles unknown storage driver', async () => {
      await wrapper.setData({ 'formData.storage_driver': 'unknown' })
      
      const title = wrapper.vm.getCloudStorageTitle()
      expect(title).toBe('云存储配置')
    })

    it('handles concurrent test upload attempts', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      wrapper.vm.handleFileChange(file)
      
      // Start multiple test uploads
      const uploadPromise1 = wrapper.vm.handleTestUpload()
      const uploadPromise2 = wrapper.vm.handleTestUpload()
      
      // Wait for both to complete
      await Promise.all([uploadPromise1, uploadPromise2])
      
      // Should handle gracefully
      expect(ElMessage.success).toHaveBeenCalledTimes(2)
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