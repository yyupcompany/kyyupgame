import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ElementImageUploader from '@/components/common/ElementImageUploader.vue'
import ElementPlus, { ElMessage, ElMessageBox } from 'element-plus'

// Mock Element Plus icons
vi.mock('@element-plus/icons-vue', () => ({
  Plus: { template: '<div>PlusIcon</div>' }
}))

// Mock Element Plus message
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn()
    }
  }
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(() => 'mock-token'),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('ElementImageUploader.vue', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createWrapper = (props: any = {}) => {
    return mount(ElementImageUploader, {
      props: {
        modelValue: [],
        maxCount: 1,
        disabled: false,
        title: '',
        buttonText: '点击上传图片',
        tips: '支持 JPG, PNG, GIF 格式，大小不超过 2MB',
        showTips: true,
        maxSize: 2,
        accept: 'image/*',
        multiple: false,
        showFileList: true,
        listType: 'picture-card',
        autoUpload: true,
        category: 'default',
        ...props
      },
      global: {
        plugins: [ElementPlus],
        stubs: {
          'el-upload': true,
          'el-icon': true,
          'el-dialog': true,
          'el-button': true
        }
      }
    })
  }

  describe('组件渲染测试', () => {
    it('应该正确渲染图片上传组件', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.element-image-uploader').exists()).toBe(true)
      expect(wrapper.find('.image-uploader').exists()).toBe(true)
    })

    it('应该显示标题', () => {
      wrapper = createWrapper({ title: '图片上传' })
      
      expect(wrapper.find('.uploader-title').exists()).toBe(true)
      expect(wrapper.find('.uploader-title').text()).toBe('图片上传')
    })

    it('应该显示上传触发区域', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.upload-trigger').exists()).toBe(true)
      expect(wrapper.find('.upload-icon').exists()).toBe(true)
      expect(wrapper.find('.upload-text').exists()).toBe(true)
    })

    it('应该显示提示信息', () => {
      wrapper = createWrapper({ showTips: true })
      
      expect(wrapper.find('.upload-tips').exists()).toBe(true)
      expect(wrapper.find('.upload-tips').text()).toBe('支持 JPG, PNG, GIF 格式，大小不超过 2MB')
    })

    it('应该显示预览对话框', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ previewVisible: true, previewImageUrl: 'https://example.com/test.jpg' })
      
      expect(wrapper.findComponent({ name: 'ElDialog' }).exists()).toBe(true)
    })
  })

  describe('props传递测试', () => {
    it('应该正确接收modelValue prop', () => {
      const modelValue = [{ name: 'test.jpg', url: 'https://example.com/test.jpg' }]
      wrapper = createWrapper({ modelValue })
      
      expect(wrapper.props('modelValue')).toEqual(modelValue)
    })

    it('应该正确接收maxCount prop', () => {
      wrapper = createWrapper({ maxCount: 5 })
      
      expect(wrapper.props('maxCount')).toBe(5)
    })

    it('应该正确接收disabled prop', () => {
      wrapper = createWrapper({ disabled: true })
      
      expect(wrapper.props('disabled')).toBe(true)
      expect(wrapper.find('.image-uploader').classes()).toContain('is-disabled')
    })

    it('应该正确接收title prop', () => {
      wrapper = createWrapper({ title: '测试标题' })
      
      expect(wrapper.props('title')).toBe('测试标题')
    })

    it('应该正确接收buttonText prop', () => {
      wrapper = createWrapper({ buttonText: '自定义按钮文本' })
      
      expect(wrapper.props('buttonText')).toBe('自定义按钮文本')
    })

    it('应该正确接收tips prop', () => {
      wrapper = createWrapper({ tips: '自定义提示文本' })
      
      expect(wrapper.props('tips')).toBe('自定义提示文本')
    })

    it('应该正确接收showTips prop', () => {
      wrapper = createWrapper({ showTips: false })
      
      expect(wrapper.props('showTips')).toBe(false)
      expect(wrapper.find('.upload-tips').exists()).toBe(false)
    })

    it('应该正确接收maxSize prop', () => {
      wrapper = createWrapper({ maxSize: 5 })
      
      expect(wrapper.props('maxSize')).toBe(5)
    })

    it('应该正确接收accept prop', () => {
      wrapper = createWrapper({ accept: '.jpg,.png' })
      
      expect(wrapper.props('accept')).toBe('.jpg,.png')
    })

    it('应该正确接收multiple prop', () => {
      wrapper = createWrapper({ multiple: true })
      
      expect(wrapper.props('multiple')).toBe(true)
    })

    it('应该正确接收showFileList prop', () => {
      wrapper = createWrapper({ showFileList: false })
      
      expect(wrapper.props('showFileList')).toBe(false)
    })

    it('应该正确接收listType prop', () => {
      wrapper = createWrapper({ listType: 'text' })
      
      expect(wrapper.props('listType')).toBe('text')
    })

    it('应该正确接收autoUpload prop', () => {
      wrapper = createWrapper({ autoUpload: false })
      
      expect(wrapper.props('autoUpload')).toBe(false)
    })

    it('应该正确接收category prop', () => {
      wrapper = createWrapper({ category: 'avatar' })
      
      expect(wrapper.props('category')).toBe('avatar')
    })

    it('应该使用默认的props值', () => {
      wrapper = createWrapper()
      
      expect(wrapper.props('modelValue')).toEqual([])
      expect(wrapper.props('maxCount')).toBe(1)
      expect(wrapper.props('disabled')).toBe(false)
      expect(wrapper.props('title')).toBe('')
      expect(wrapper.props('buttonText')).toBe('点击上传图片')
      expect(wrapper.props('tips')).toBe('支持 JPG, PNG, GIF 格式，大小不超过 2MB')
      expect(wrapper.props('showTips')).toBe(true)
      expect(wrapper.props('maxSize')).toBe(2)
      expect(wrapper.props('accept')).toBe('image/*')
      expect(wrapper.props('multiple')).toBe(false)
      expect(wrapper.props('showFileList')).toBe(true)
      expect(wrapper.props('listType')).toBe('picture-card')
      expect(wrapper.props('autoUpload')).toBe(true)
      expect(wrapper.props('category')).toBe('default')
    })
  })

  describe('计算属性测试', () => {
    it('应该计算正确的uploadUrl', () => {
      wrapper = createWrapper({ action: '/custom/upload' })
      
      expect(wrapper.vm.uploadUrl).toBe('/custom/upload')
    })

    it('应该使用默认的uploadUrl', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.uploadUrl).toBe('/api/upload')
    })

    it('应该计算正确的uploadHeaders', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.uploadHeaders).toEqual({
        'Authorization': 'Bearer mock-token'
      })
    })

    it('应该计算正确的uploadData', () => {
      wrapper = createWrapper({ category: 'avatar' })
      
      expect(wrapper.vm.uploadData).toEqual({
        category: 'avatar'
      })
    })
  })

  describe('文件上传验证测试', () => {
    it('应该验证文件类型', () => {
      wrapper = createWrapper({ accept: 'image/jpeg' })
      
      const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const invalidFile = new File(['test'], 'test.png', { type: 'image/png' })
      
      expect(wrapper.vm.beforeUpload(validFile)).toBe(true)
      expect(wrapper.vm.beforeUpload(invalidFile)).toBe(false)
      expect(ElMessage.error).toHaveBeenCalledWith('文件格式不正确')
    })

    it('应该验证文件大小', () => {
      wrapper = createWrapper({ maxSize: 1 })
      
      const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      Object.defineProperty(validFile, 'size', { value: 500 * 1024 }) // 500KB
      
      const invalidFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      Object.defineProperty(invalidFile, 'size', { value: 2 * 1024 * 1024 }) // 2MB
      
      expect(wrapper.vm.beforeUpload(validFile)).toBe(true)
      expect(wrapper.vm.beforeUpload(invalidFile)).toBe(false)
      expect(ElMessage.error).toHaveBeenCalledWith('文件大小不能超过 1MB')
    })

    it('应该通过所有验证', () => {
      wrapper = createWrapper()
      
      const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      Object.defineProperty(validFile, 'size', { value: 500 * 1024 }) // 500KB
      
      expect(wrapper.vm.beforeUpload(validFile)).toBe(true)
    })
  })

  describe('事件处理测试', () => {
    it('应该处理上传成功事件', () => {
      wrapper = createWrapper()
      const response = { success: true, url: 'https://example.com/uploaded.jpg' }
      const file = { name: 'test.jpg' }
      
      wrapper.vm.onSuccess(response, file)
      
      expect(ElMessage.success).toHaveBeenCalledWith('上传成功')
      expect(wrapper.emitted('upload-success')).toBeTruthy()
      expect(wrapper.emitted('upload-success')[0]).toEqual([response, file])
    })

    it('应该处理上传失败事件', () => {
      wrapper = createWrapper()
      const error = new Error('Upload failed')
      const file = { name: 'test.jpg' }
      
      wrapper.vm.onError(error, file)
      
      expect(ElMessage.error).toHaveBeenCalledWith('上传失败')
      expect(wrapper.emitted('upload-error')).toBeTruthy()
    })

    it('应该处理上传进度事件', () => {
      wrapper = createWrapper()
      const event = { percent: 50 }
      const file = { name: 'test.jpg' }
      
      wrapper.vm.onProgress(event, file)
      
      expect(wrapper.emitted('upload-progress')).toBeTruthy()
      expect(wrapper.emitted('upload-progress')[0]).toEqual([50, file])
    })

    it('应该处理文件移除事件', () => {
      wrapper = createWrapper()
      const file = { name: 'test.jpg' }
      
      wrapper.vm.onRemove(file)
      
      expect(wrapper.emitted('file-remove')).toBeTruthy()
      expect(wrapper.emitted('file-remove')[0]).toEqual([file])
    })

    it('应该处理超出限制事件', () => {
      wrapper = createWrapper({ maxCount: 3 })
      const files = [{ name: 'test1.jpg' }, { name: 'test2.jpg' }, { name: 'test3.jpg' }, { name: 'test4.jpg' }]
      
      wrapper.vm.onExceed(files)
      
      expect(ElMessage.warning).toHaveBeenCalledWith('最多只能上传 3 个文件')
    })
  })

  describe('图片预览测试', () => {
    it('应该显示图片预览', () => {
      wrapper = createWrapper()
      const file = { url: 'https://example.com/test.jpg' }
      
      wrapper.vm.handlePreview(file)
      
      expect(wrapper.vm.previewVisible).toBe(true)
      expect(wrapper.vm.previewImageUrl).toBe('https://example.com/test.jpg')
    })

    it('应该关闭图片预览', () => {
      wrapper = createWrapper()
      wrapper.vm.previewVisible = true
      wrapper.vm.previewImageUrl = 'https://example.com/test.jpg'
      
      wrapper.vm.closePreview()
      
      expect(wrapper.vm.previewVisible).toBe(false)
      expect(wrapper.vm.previewImageUrl).toBe('')
    })
  })

  describe('文件列表管理测试', () => {
    it('应该监听modelValue变化', async () => {
      wrapper = createWrapper()
      const newModelValue = [{ name: 'test.jpg', url: 'https://example.com/test.jpg' }]
      
      await wrapper.setProps({ modelValue: newModelValue })
      
      expect(wrapper.vm.fileList).toEqual(newModelValue)
    })

    it('应该在fileList变化时更新modelValue', async () => {
      wrapper = createWrapper()
      const newFileList = [{ name: 'test.jpg', url: 'https://example.com/test.jpg' }]
      
      wrapper.vm.fileList = newFileList
      await nextTick()
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([newFileList])
    })
  })

  describe('暴露方法测试', () => {
    it('应该暴露clearFiles方法', () => {
      wrapper = createWrapper()
      const mockClearFiles = vi.fn()
      wrapper.vm.uploadRef = { clearFiles: mockClearFiles }
      
      wrapper.vm.clearFiles()
      
      expect(mockClearFiles).toHaveBeenCalled()
    })

    it('应该暴露submit方法', () => {
      wrapper = createWrapper()
      const mockSubmit = vi.fn()
      wrapper.vm.uploadRef = { submit: mockSubmit }
      
      wrapper.vm.submit()
      
      expect(mockSubmit).toHaveBeenCalled()
    })

    it('应该暴露handlePreview方法', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.handlePreview).toBeDefined()
      expect(typeof wrapper.vm.handlePreview).toBe('function')
    })
  })

  describe('边界条件测试', () => {
    it('应该处理空的modelValue', () => {
      wrapper = createWrapper({ modelValue: undefined })
      
      expect(wrapper.vm.fileList).toEqual([])
    })

    it('应该处理没有token的情况', () => {
      localStorageMock.getItem.mockReturnValue(null)
      wrapper = createWrapper()
      
      expect(wrapper.vm.uploadHeaders).toEqual({
        'Authorization': 'Bearer null'
      })
    })

    it('应该处理自定义action', () => {
      wrapper = createWrapper({ action: '/api/custom-upload' })
      
      expect(wrapper.vm.uploadUrl).toBe('/api/custom-upload')
    })

    it('应该处理不同的listType', () => {
      const listTypes = ['text', 'picture', 'picture-card']
      
      listTypes.forEach(listType => {
        wrapper = createWrapper({ listType })
        expect(wrapper.props('listType')).toBe(listType)
      })
    })

    it('应该处理不同的category', () => {
      const categories = ['default', 'avatar', 'banner']
      
      categories.forEach(category => {
        wrapper = createWrapper({ category })
        expect(wrapper.vm.uploadData).toEqual({ category })
      })
    })

    it('应该处理没有文件URL的预览', () => {
      wrapper = createWrapper()
      const file = { name: 'test.jpg' }
      
      wrapper.vm.handlePreview(file)
      
      expect(wrapper.vm.previewVisible).toBe(true)
      expect(wrapper.vm.previewImageUrl).toBe('')
    })
  })

  describe('样式测试', () => {
    it('应该包含正确的CSS类', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.element-image-uploader').exists()).toBe(true)
      expect(wrapper.find('.image-uploader').exists()).toBe(true)
      expect(wrapper.find('.upload-trigger').exists()).toBe(true)
      expect(wrapper.find('.upload-icon').exists()).toBe(true)
      expect(wrapper.find('.upload-text').exists()).toBe(true)
    })

    it('应该在禁用时应用正确的样式', () => {
      wrapper = createWrapper({ disabled: true })
      
      expect(wrapper.find('.image-uploader').classes()).toContain('is-disabled')
    })

    it('应该在显示提示时应用正确的样式', () => {
      wrapper = createWrapper({ showTips: true })
      
      expect(wrapper.find('.upload-tips').exists()).toBe(true)
    })

    it('应该在显示标题时应用正确的样式', () => {
      wrapper = createWrapper({ title: '测试标题' })
      
      expect(wrapper.find('.uploader-title').exists()).toBe(true)
    })
  })
})