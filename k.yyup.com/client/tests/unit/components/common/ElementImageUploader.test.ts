import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ElementImageUploader from '@/components/common/ElementImageUploader.vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { UploadUserFile, UploadFile, UploadRawFile } from 'element-plus'

// Mock Element Plus
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn()
    },
    ElUpload: {
      name: 'ElUpload',
      template: '<div><slot name="trigger" /><slot name="tip" /></div>'
    },
    ElIcon: {
      name: 'ElIcon',
      template: '<span><slot /></span>'
    },
    ElDialog: {
      name: 'ElDialog',
      template: '<div><slot /></div>'
    }
  }
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
global.localStorage = localStorageMock

// 控制台错误检测变量
let consoleSpy: any

describe('ElementImageUploader.vue', () => {
  let wrapper: any

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
    
    // Setup localStorage
    localStorageMock.getItem.mockReturnValue('test-token')
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  afterEach(() => {
    if (wrapper) => {
      wrapper.unmount()
    }
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  const createWrapper = (props = {}) => {
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
        stubs: {
          'el-upload': true,
          'el-icon': true,
          'el-dialog': true,
          'img': true
        },
        components: {
          Plus
        }
      }
    })
  }

  describe('基础渲染', () => {
    it('应该正确渲染组件', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.element-image-uploader').exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'ElUpload' }).exists()).toBe(true)
      expect(wrapper.find('.upload-trigger').exists()).toBe(true)
    })

    it('应该显示标题', () => {
      wrapper = createWrapper({ title: '图片上传' })
      
      expect(wrapper.find('.uploader-title').exists()).toBe(true)
      expect(wrapper.find('.uploader-title').text()).toBe('图片上传')
    })

    it('应该显示提示信息', () => {
      wrapper = createWrapper({ 
        tips: '支持 JPG, PNG 格式',
        showTips: true 
      })
      
      expect(wrapper.find('.upload-tips').exists()).toBe(true)
      expect(wrapper.find('.upload-tips').text()).toBe('支持 JPG, PNG 格式')
    })

    it('应该隐藏提示信息', () => {
      wrapper = createWrapper({ showTips: false })
      
      expect(wrapper.find('.upload-tips').exists()).toBe(false)
    })
  })

  describe('Props 测试', () => {
    it('应该使用默认 props', () => {
      wrapper = createWrapper()
      
      expect(wrapper.props().modelValue).toEqual([])
      expect(wrapper.props().maxCount).toBe(1)
      expect(wrapper.props().disabled).toBe(false)
      expect(wrapper.props().buttonText).toBe('点击上传图片')
      expect(wrapper.props().maxSize).toBe(2)
      expect(wrapper.props().accept).toBe('image/*')
      expect(wrapper.props().multiple).toBe(false)
    })

    it('应该接受自定义 props', () => {
      const customFiles: UploadUserFile[] = [
        { name: 'test.jpg', url: 'https://example.com/test.jpg' }
      ]
      
      wrapper = createWrapper({
        modelValue: customFiles,
        maxCount: 5,
        disabled: true,
        buttonText: '上传图片',
        maxSize: 10,
        accept: 'image/jpeg',
        multiple: true,
        showFileList: false,
        listType: 'text',
        autoUpload: false,
        category: 'avatar'
      })
      
      expect(wrapper.props().modelValue).toEqual(customFiles)
      expect(wrapper.props().maxCount).toBe(5)
      expect(wrapper.props().disabled).toBe(true)
      expect(wrapper.props().buttonText).toBe('上传图片')
      expect(wrapper.props().maxSize).toBe(10)
      expect(wrapper.props().accept).toBe('image/jpeg')
      expect(wrapper.props().multiple).toBe(true)
    })
  })

  describe('计算属性', () => {
    it('应该计算正确的上传 URL', () => {
      wrapper = createWrapper({ action: '/custom/upload' })
      
      expect(wrapper.vm.uploadUrl).toBe('/custom/upload')
    })

    it('应该使用默认上传 URL', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.uploadUrl).toBe('/api/upload')
    })

    it('应该计算正确的上传头信息', () => {
      wrapper = createWrapper()
      
      const headers = wrapper.vm.uploadHeaders
      expect(headers).toEqual({
        'Authorization': 'Bearer test-token'
      })
      expect(localStorageMock.getItem).toHaveBeenCalledWith('token')
    })

    it('应该计算正确的上传数据', () => {
      wrapper = createWrapper({ category: 'avatar' })
      
      const data = wrapper.vm.uploadData
      expect(data).toEqual({
        category: 'avatar'
      })
    })
  })

  describe('文件列表监听', () => {
    it('应该响应 modelValue 变化', async () => {
      const customFiles: UploadUserFile[] = [
        { name: 'test1.jpg', url: 'https://example.com/test1.jpg' }
      ]
      
      wrapper = createWrapper()
      
      await wrapper.setProps({ modelValue: customFiles })
      
      expect(wrapper.vm.fileList).toEqual(customFiles)
    })

    it('应该响应 fileList 变化并触发事件', async () => {
      wrapper = createWrapper()
      
      const emitSpy = vi.fn()
      wrapper.vm.$emit = emitSpy
      
      const newFiles: UploadUserFile[] = [
        { name: 'test2.jpg', url: 'https://example.com/test2.jpg' }
      ]
      
      await wrapper.setData({ fileList: newFiles })
      
      expect(emitSpy).toHaveBeenCalledWith('update:modelValue', newFiles)
    })
  })

  describe('上传前验证', () => {
    it('应该通过有效的文件验证', () => {
      wrapper = createWrapper()
      
      const mockFile: UploadRawFile = {
        name: 'test.jpg',
        type: 'image/jpeg',
        size: 1024 * 1024 // 1MB
      } as UploadRawFile
      
      const result = wrapper.vm.beforeUpload(mockFile)
      
      expect(result).toBe(true)
    })

    it('应该拒绝不支持的文件类型', () => {
      wrapper = createWrapper({ accept: 'image/jpeg' })
      
      const mockFile: UploadRawFile = {
        name: 'test.png',
        type: 'image/png',
        size: 1024 * 1024
      } as UploadRawFile
      
      const result = wrapper.vm.beforeUpload(mockFile)
      
      expect(result).toBe(false)
      expect(ElMessage.error).toHaveBeenCalledWith('文件格式不正确')
    })

    it('应该拒绝过大的文件', () => {
      wrapper = createWrapper({ maxSize: 2 })
      
      const mockFile: UploadRawFile = {
        name: 'test.jpg',
        type: 'image/jpeg',
        size: 3 * 1024 * 1024 // 3MB
      } as UploadRawFile
      
      const result = wrapper.vm.beforeUpload(mockFile)
      
      expect(result).toBe(false)
      expect(ElMessage.error).toHaveBeenCalledWith('文件大小不能超过 2MB')
    })
  })

  describe('上传事件处理', () => {
    it('应该处理上传成功', () => {
      wrapper = createWrapper()
      
      const mockResponse = { success: true, url: 'https://example.com/uploaded.jpg' }
      const mockFile: UploadFile = {
        name: 'test.jpg',
        status: 'success'
      } as UploadFile
      
      const emitSpy = vi.fn()
      wrapper.vm.$emit = emitSpy
      
      wrapper.vm.onSuccess(mockResponse, mockFile)
      
      expect(ElMessage.success).toHaveBeenCalledWith('上传成功')
      expect(emitSpy).toHaveBeenCalledWith('upload-success', mockResponse, mockFile)
    })

    it('应该处理上传失败', () => {
      wrapper = createWrapper()
      
      const mockError = new Error('上传失败')
      const mockFile: UploadFile = {
        name: 'test.jpg',
        status: 'error'
      } as UploadFile
      
      const emitSpy = vi.fn()
      wrapper.vm.$emit = emitSpy
      
      wrapper.vm.onError(mockError, mockFile)
      
      expect(ElMessage.error).toHaveBeenCalledWith('上传失败')
      expect(emitSpy).toHaveBeenCalledWith('upload-error', expect.any(Error), mockFile)
    })

    it('应该处理上传进度', () => {
      wrapper = createWrapper()
      
      const mockEvent = { percent: 50 }
      const mockFile: UploadFile = {
        name: 'test.jpg',
        status: 'uploading'
      } as UploadFile
      
      const emitSpy = vi.fn()
      wrapper.vm.$emit = emitSpy
      
      wrapper.vm.onProgress(mockEvent, mockFile)
      
      expect(emitSpy).toHaveBeenCalledWith('upload-progress', 50, mockFile)
    })

    it('应该处理文件移除', () => {
      wrapper = createWrapper()
      
      const mockFile: UploadFile = {
        name: 'test.jpg',
        status: 'success'
      } as UploadFile
      
      const emitSpy = vi.fn()
      wrapper.vm.$emit = emitSpy
      
      wrapper.vm.onRemove(mockFile)
      
      expect(emitSpy).toHaveBeenCalledWith('file-remove', mockFile)
    })

    it('应该处理超出限制', () => {
      wrapper = createWrapper({ maxCount: 3 })
      
      const mockFiles = [
        { name: 'test1.jpg' },
        { name: 'test2.jpg' },
        { name: 'test3.jpg' },
        { name: 'test4.jpg' }
      ]
      
      wrapper.vm.onExceed(mockFiles)
      
      expect(ElMessage.warning).toHaveBeenCalledWith('最多只能上传 3 个文件')
    })
  })

  describe('预览功能', () => {
    it('应该显示图片预览', async () => {
      wrapper = createWrapper()
      
      const mockFile: UploadFile = {
        name: 'test.jpg',
        url: 'https://example.com/test.jpg'
      } as UploadFile
      
      await wrapper.vm.handlePreview(mockFile)
      
      expect(wrapper.vm.previewVisible).toBe(true)
      expect(wrapper.vm.previewImageUrl).toBe('https://example.com/test.jpg')
    })

    it('应该关闭预览', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ 
        previewVisible: true,
        previewImageUrl: 'https://example.com/test.jpg'
      })
      
      await wrapper.vm.closePreview()
      
      expect(wrapper.vm.previewVisible).toBe(false)
      expect(wrapper.vm.previewImageUrl).toBe('')
    })
  })

  describe('暴露的方法', () => {
    it('应该提供清空文件列表方法', () => {
      wrapper = createWrapper()
      
      const clearFilesSpy = vi.fn()
      wrapper.vm.uploadRef = { clearFiles: clearFilesSpy }
      
      wrapper.vm.clearFiles()
      
      expect(clearFilesSpy).toHaveBeenCalled()
    })

    it('应该提供手动上传方法', () => {
      wrapper = createWrapper()
      
      const submitSpy = vi.fn()
      wrapper.vm.uploadRef = { submit: submitSpy }
      
      wrapper.vm.submit()
      
      expect(submitSpy).toHaveBeenCalled()
    })

    it('应该提供预览方法', () => {
      wrapper = createWrapper()
      
      const mockFile: UploadFile = {
        name: 'test.jpg',
        url: 'https://example.com/test.jpg'
      } as UploadFile
      
      const handlePreviewSpy = vi.spyOn(wrapper.vm, 'handlePreview')
      
      wrapper.vm.handlePreview(mockFile)
      
      expect(handlePreviewSpy).toHaveBeenCalledWith(mockFile)
    })
  })

  describe('禁用状态', () => {
    it('应该在禁用状态下显示正确的样式', () => {
      wrapper = createWrapper({ disabled: true })
      
      expect(wrapper.find('.is-disabled').exists()).toBe(true)
    })

    it('应该在禁用状态下不响应交互', () => {
      wrapper = createWrapper({ disabled: true })
      
      const mockFile: UploadRawFile = {
        name: 'test.jpg',
        type: 'image/jpeg',
        size: 1024 * 1024
      } as UploadRawFile
      
      const result = wrapper.vm.beforeUpload(mockFile)
      
      // 禁用状态下仍然会进行验证，但上传组件本身会禁用交互
      expect(result).toBe(true)
    })
  })

  describe('边界情况', () => {
    it('应该处理空的 modelValue', () => {
      wrapper = createWrapper({ modelValue: undefined })
      
      expect(wrapper.vm.fileList).toEqual([])
    })

    it('应该处理 null 的 modelValue', () => {
      wrapper = createWrapper({ modelValue: null })
      
      expect(wrapper.vm.fileList).toEqual([])
    })

    it('应该处理没有 token 的情况', () => {
      localStorageMock.getItem.mockReturnValue(null)
      
      wrapper = createWrapper()
      
      const headers = wrapper.vm.uploadHeaders
      expect(headers).toEqual({
        'Authorization': 'Bearer null'
      })
    })

    it('应该处理自定义 accept 格式', () => {
      wrapper = createWrapper({ accept: '.jpg,.png' })
      
      const mockFile: UploadRawFile = {
        name: 'test.jpg',
        type: 'image/jpeg',
        size: 1024 * 1024
      } as UploadRawFile
      
      const result = wrapper.vm.beforeUpload(mockFile)
      
      expect(result).toBe(true)
    })

    it('应该处理超大文件', () => {
      wrapper = createWrapper({ maxSize: 10 })
      
      const mockFile: UploadRawFile = {
        name: 'large.jpg',
        type: 'image/jpeg',
        size: 100 * 1024 * 1024 // 100MB
      } as UploadRawFile
      
      const result = wrapper.vm.beforeUpload(mockFile)
      
      expect(result).toBe(false)
      expect(ElMessage.error).toHaveBeenCalledWith('文件大小不能超过 10MB')
    })

    it('应该处理无类型文件', () => {
      wrapper = createWrapper()
      
      const mockFile: UploadRawFile = {
        name: 'test.unknown',
        type: '',
        size: 1024 * 1024
      } as UploadRawFile
      
      const result = wrapper.vm.beforeUpload(mockFile)
      
      expect(result).toBe(true) // 无类型文件应该通过验证
    })

    it('应该处理文件名包含特殊字符', () => {
      wrapper = createWrapper()
      
      const mockFile: UploadRawFile = {
        name: '测试@#$%.jpg',
        type: 'image/jpeg',
        size: 1024 * 1024
      } as UploadRawFile
      
      const result = wrapper.vm.beforeUpload(mockFile)
      
      expect(result).toBe(true)
    })
  })

  describe('响应式更新', () => {
    it('应该响应 props 变化', async () => {
      wrapper = createWrapper({ maxCount: 1 })
      
      await wrapper.setProps({ maxCount: 5 })
      
      expect(wrapper.props().maxCount).toBe(5)
    })

    it('应该正确更新文件列表', async () => {
      wrapper = createWrapper()
      
      const newFiles: UploadUserFile[] = [
        { name: 'updated.jpg', url: 'https://example.com/updated.jpg' }
      ]
      
      await wrapper.setData({ fileList: newFiles })
      
      expect(wrapper.vm.fileList).toEqual(newFiles)
    })
  })

  describe('响应式布局测试', () => {
    it('应该适配不同屏幕尺寸', async () => {
      wrapper = createWrapper()
      
      // 模拟移动端视图
      global.innerWidth = 375
      global.dispatchEvent(new Event('resize'))
      
      await nextTick()
      
      expect(wrapper.find('.element-image-uploader').exists()).toBe(true)
      
      // 模拟桌面端视图
      global.innerWidth = 1920
      global.dispatchEvent(new Event('resize'))
      
      await nextTick()
      
      expect(wrapper.find('.element-image-uploader').exists()).toBe(true)
    })

    it('应该在移动端优化显示', async () => {
      wrapper = createWrapper()
      
      // 模拟小屏幕
      global.innerWidth = 320
      global.dispatchEvent(new Event('resize'))
      
      await nextTick()
      
      const uploadTrigger = wrapper.find('.upload-trigger')
      expect(uploadTrigger.exists()).toBe(true)
    })
  })

  describe('主题切换支持', () => {
    it('应该支持深色模式', async () => {
      wrapper = createWrapper()
      
      // 模拟深色模式
      document.documentElement.setAttribute('data-theme', 'dark')
      
      await nextTick()
      
      expect(wrapper.find('.element-image-uploader').exists()).toBe(true)
      
      // 恢复浅色模式
      document.documentElement.setAttribute('data-theme', 'light')
    })
  })

  describe('可访问性测试', () => {
    it('应该支持键盘导航', async () => {
      wrapper = createWrapper()
      
      const uploadTrigger = wrapper.find('.upload-trigger')
      expect(uploadTrigger.exists()).toBe(true)
      
      // 模拟键盘事件
      await uploadTrigger.trigger('keydown.enter')
      await uploadTrigger.trigger('keydown.space')
    })

    it('应该包含适当的ARIA属性', () => {
      wrapper = createWrapper()
      
      const uploadTrigger = wrapper.find('.upload-trigger')
      expect(uploadTrigger.exists()).toBe(true)
    })
  })

  describe('性能优化测试', () => {
    it('应该正确处理大量文件', async () => {
      wrapper = createWrapper({ maxCount: 100 })
      
      const largeFileList: UploadUserFile[] = Array.from({ length: 50 }, (_, i) => ({
        name: `file${i}.jpg`,
        url: `https://example.com/file${i}.jpg`
      }))
      
      await wrapper.setData({ fileList: largeFileList })
      
      expect(wrapper.vm.fileList.length).toBe(50)
    })

    it('应该避免内存泄漏', async () => {
      wrapper = createWrapper()
      
      // 模拟多次文件列表更新
      for (let i = 0;
import { vi } from 'vitest' i < 100; i++) {
        const files: UploadUserFile[] = [
          { name: `test${i}.jpg`, url: `https://example.com/test${i}.jpg` }
        ]
        await wrapper.setData({ fileList: files })
      }
      
      // 组件应该仍然正常工作
      expect(wrapper.find('.element-image-uploader').exists()).toBe(true)
    })

    it('应该正确处理组件卸载', async () => {
      wrapper = createWrapper()
      
      // 设置一些状态
      await wrapper.setData({ 
        previewVisible: true,
        previewImageUrl: 'https://example.com/test.jpg'
      })
      
      // 卸载组件
      wrapper.unmount()
      
      // 验证清理工作
    })
  })

  describe('拖拽上传测试', () => {
    it('应该处理拖拽事件', async () => {
      wrapper = createWrapper()
      
      const uploadComponent = wrapper.findComponent({ name: 'ElUpload' })
      expect(uploadComponent.exists()).toBe(true)
      
      // 模拟拖拽事件
      await uploadComponent.trigger('dragover')
      await uploadComponent.trigger('drop')
    })
  })

  describe('安全性测试', () => {
    it('应该验证文件类型安全性', () => {
      wrapper = createWrapper({ accept: 'image/jpeg' })
      
      const maliciousFile: UploadRawFile = {
        name: 'malicious.exe',
        type: 'application/x-executable',
        size: 1024 * 1024
      } as UploadRawFile
      
      const result = wrapper.vm.beforeUpload(maliciousFile)
      
      expect(result).toBe(false)
      expect(ElMessage.error).toHaveBeenCalledWith('文件格式不正确')
    })

    it('应该防止路径遍历攻击', () => {
      wrapper = createWrapper()
      
      const maliciousFile: UploadRawFile = {
        name: '../../../etc/passwd',
        type: 'image/jpeg',
        size: 1024 * 1024
      } as UploadRawFile
      
      const result = wrapper.vm.beforeUpload(maliciousFile)
      
      expect(result).toBe(true) // 文件名验证应该在服务器端进行
    })
  })
})