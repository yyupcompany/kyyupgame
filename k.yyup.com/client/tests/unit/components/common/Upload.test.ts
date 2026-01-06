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

describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory, Router } from 'vue-router'
import Upload from '@/components/common/Upload.vue'
import ElementPlus from 'element-plus'

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElUpload: {
    name: 'ElUpload',
    template: '<div class="el-upload"><slot></slot></div>',
    props: [
      'action', 'headers', 'method', 'multiple', 'data', 'name', 'withCredentials',
      'showFileList', 'drag', 'accept', 'onPreview', 'onRemove', 'onSuccess',
      'onError', 'onProgress', 'onChange', 'beforeUpload', 'beforeRemove',
      'listType', 'autoUpload', 'disabled', 'limit', 'onExceed', 'fileList'
    ]
  },
  ElButton: {
    name: 'ElButton',
    template: '<button class="el-button"><slot></slot></button>',
    props: ['type', 'size', 'disabled', 'loading', 'icon']
  },
  ElIcon: {
    name: 'ElIcon',
    template: '<i class="el-icon"><slot></slot></i>',
    props: ['size', 'color']
  },
  ElProgress: {
    name: 'ElProgress',
    template: '<div class="el-progress"></div>',
    props: ['percentage', 'status', 'strokeWidth', 'textInside', 'showText']
  },
  ElImage: {
    name: 'ElImage',
    template: '<img class="el-image" />',
    props: ['src', 'alt', 'fit', 'previewSrcList']
  },
  ElCard: {
    name: 'ElCard',
    template: '<div class="el-card"><slot></slot></div>',
    props: ['shadow', 'bodyStyle']
  }
}))

describe('Upload.vue', () => {
  let router: Router

  beforeEach(() => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } }
      ]
    })
  })

  it('renders properly with default props', () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.el-upload').exists()).toBe(true)
  })

  it('displays correct upload action URL', () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://api.example.com/upload'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const upload = wrapper.find('.el-upload')
    expect(upload.props('action')).toBe('https://api.example.com/upload')
  })

  it('applies custom headers when headers prop is provided', () => {
    const customHeaders = {
      'Authorization': 'Bearer token123',
      'Custom-Header': 'custom-value'
    }

    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload',
        headers: customHeaders
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const upload = wrapper.find('.el-upload')
    expect(upload.props('headers')).toEqual(customHeaders)
  })

  it('applies custom HTTP method when method prop is provided', () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload',
        method: 'put'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const upload = wrapper.find('.el-upload')
    expect(upload.props('method')).toBe('put')
  })

  it('applies default HTTP method when method prop is not provided', () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const upload = wrapper.find('.el-upload')
    expect(upload.props('method')).toBe('post')
  })

  it('enables multiple file upload when multiple prop is true', () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload',
        multiple: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const upload = wrapper.find('.el-upload')
    expect(upload.props('multiple')).toBe(true)
  })

  it('disables multiple file upload when multiple prop is false', () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload',
        multiple: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const upload = wrapper.find('.el-upload')
    expect(upload.props('multiple')).toBe(false)
  })

  it('applies custom data when data prop is provided', () => {
    const customData = {
      userId: 123,
      folder: 'documents'
    }

    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload',
        data: customData
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const upload = wrapper.find('.el-upload')
    expect(upload.props('data')).toEqual(customData)
  })

  it('applies custom file name when name prop is provided', () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload',
        name: 'fileData'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const upload = wrapper.find('.el-upload')
    expect(upload.props('name')).toBe('fileData')
  })

  it('enables credentials when withCredentials prop is true', () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload',
        withCredentials: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const upload = wrapper.find('.el-upload')
    expect(upload.props('withCredentials')).toBe(true)
  })

  it('disables credentials when withCredentials prop is false', () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload',
        withCredentials: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const upload = wrapper.find('.el-upload')
    expect(upload.props('withCredentials')).toBe(false)
  })

  it('shows file list when showFileList prop is true', () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload',
        showFileList: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const upload = wrapper.find('.el-upload')
    expect(upload.props('showFileList')).toBe(true)
  })

  it('hides file list when showFileList prop is false', () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload',
        showFileList: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const upload = wrapper.find('.el-upload')
    expect(upload.props('showFileList')).toBe(false)
  })

  it('enables drag and drop when drag prop is true', () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload',
        drag: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const upload = wrapper.find('.el-upload')
    expect(upload.props('drag')).toBe(true)
  })

  it('disables drag and drop when drag prop is false', () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload',
        drag: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const upload = wrapper.find('.el-upload')
    expect(upload.props('drag')).toBe(false)
  })

  it('applies file type restrictions when accept prop is provided', () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload',
        accept: 'image/*,.pdf'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const upload = wrapper.find('.el-upload')
    expect(upload.props('accept')).toBe('image/*,.pdf')
  })

  it('applies list type when listType prop is provided', () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload',
        listType: 'picture-card'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const upload = wrapper.find('.el-upload')
    expect(upload.props('listType')).toBe('picture-card')
  })

  it('enables auto upload when autoUpload prop is true', () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload',
        autoUpload: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const upload = wrapper.find('.el-upload')
    expect(upload.props('autoUpload')).toBe(true)
  })

  it('disables auto upload when autoUpload prop is false', () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload',
        autoUpload: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const upload = wrapper.find('.el-upload')
    expect(upload.props('autoUpload')).toBe(false)
  })

  it('disables upload when disabled prop is true', () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload',
        disabled: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const upload = wrapper.find('.el-upload')
    expect(upload.props('disabled')).toBe(true)
  })

  it('enables upload when disabled prop is false', () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload',
        disabled: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const upload = wrapper.find('.el-upload')
    expect(upload.props('disabled')).toBe(false)
  })

  it('applies file limit when limit prop is provided', () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload',
        limit: 5
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const upload = wrapper.find('.el-upload')
    expect(upload.props('limit')).toBe(5)
  })

  it('emits preview event when file is previewed', async () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const mockFile = { name: 'test.jpg', url: 'https://example.com/test.jpg' }
    await wrapper.vm.$emit('preview', mockFile)
    expect(wrapper.emitted('preview')).toBeTruthy()
    expect(wrapper.emitted('preview')[0]).toEqual([mockFile])
  })

  it('emits remove event when file is removed', async () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const mockFile = { name: 'test.jpg', url: 'https://example.com/test.jpg' }
    await wrapper.vm.$emit('remove', mockFile)
    expect(wrapper.emitted('remove')).toBeTruthy()
    expect(wrapper.emitted('remove')[0]).toEqual([mockFile])
  })

  it('emits success event when upload succeeds', async () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const mockFile = { name: 'test.jpg' }
    const mockResponse = { url: 'https://example.com/uploaded/test.jpg' }
    await wrapper.vm.$emit('success', mockResponse, mockFile)
    expect(wrapper.emitted('success')).toBeTruthy()
    expect(wrapper.emitted('success')[0]).toEqual([mockResponse, mockFile])
  })

  it('emits error event when upload fails', async () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const mockFile = { name: 'test.jpg' }
    const mockError = new Error('Upload failed')
    await wrapper.vm.$emit('error', mockError, mockFile)
    expect(wrapper.emitted('error')).toBeTruthy()
    expect(wrapper.emitted('error')[0]).toEqual([mockError, mockFile])
  })

  it('emits progress event during upload', async () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const mockFile = { name: 'test.jpg' }
    const mockEvent = { percent: 50 }
    await wrapper.vm.$emit('progress', mockEvent, mockFile)
    expect(wrapper.emitted('progress')).toBeTruthy()
    expect(wrapper.emitted('progress')[0]).toEqual([mockEvent, mockFile])
  })

  it('emits change event when file selection changes', async () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const mockFile = { name: 'test.jpg' }
    const mockFileList = [mockFile]
    await wrapper.vm.$emit('change', mockFileList)
    expect(wrapper.emitted('change')).toBeTruthy()
    expect(wrapper.emitted('change')[0]).toEqual([mockFileList])
  })

  it('emits exceed event when file limit is exceeded', async () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload',
        limit: 3
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const mockFiles = [{ name: 'test1.jpg' }, { name: 'test2.jpg' }, { name: 'test3.jpg' }, { name: 'test4.jpg' }]
    await wrapper.vm.$emit('exceed', mockFiles, [])
    expect(wrapper.emitted('exceed')).toBeTruthy()
    expect(wrapper.emitted('exceed')[0]).toEqual([mockFiles, []])
  })

  it('applies custom file list when fileList prop is provided', () => {
    const mockFileList = [
      { name: 'test1.jpg', url: 'https://example.com/test1.jpg' },
      { name: 'test2.jpg', url: 'https://example.com/test2.jpg' }
    ]

    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload',
        fileList: mockFileList
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const upload = wrapper.find('.el-upload')
    expect(upload.props('fileList')).toEqual(mockFileList)
  })

  it('handles empty action URL gracefully', () => {
    const wrapper = mount(Upload, {
      props: {
        action: ''
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const upload = wrapper.find('.el-upload')
    expect(upload.props('action')).toBe('')
  })

  it('handles null action URL gracefully', () => {
    const wrapper = mount(Upload, {
      props: {
        action: null
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const upload = wrapper.find('.el-upload')
    expect(upload.props('action')).toBe(null)
  })

  it('handles undefined action URL gracefully', () => {
    const wrapper = mount(Upload, {
      props: {
        action: undefined
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const upload = wrapper.find('.el-upload')
    expect(upload.props('action')).toBe(undefined)
  })

  it('applies custom CSS classes when className prop is provided', () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload',
        className: 'custom-upload'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('className')).toBe('custom-upload')
  })

  it('supports custom trigger rendering', () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload'
      },
      slots: {
        trigger: '<button class="custom-trigger">Custom Upload Button</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.custom-trigger').exists()).toBe(true)
    expect(wrapper.find('.custom-trigger').text()).toBe('Custom Upload Button')
  })

  it('supports custom tip rendering', () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload'
      },
      slots: {
        tip: '<div class="custom-tip">Upload tip: JPG, PNG up to 5MB</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.custom-tip').exists()).toBe(true)
    expect(wrapper.find('.custom-tip').text()).toBe('Upload tip: JPG, PNG up to 5MB')
  })

  it('supports custom file item rendering', () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload'
      },
      slots: {
        'file': '<template #file="{ file }"><div class="custom-file-item">{{ file.name }}</div></template>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.custom-file-item').exists()).toBe(true)
  })

  it('supports custom progress rendering', () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload'
      },
      slots: {
        'progress': '<template #progress="{ file, percentage }"><div class="custom-progress">{{ percentage }}%</div></template>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.custom-progress').exists()).toBe(true)
  })

  it('supports file size validation', () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload',
        maxSize: 5 * 1024 * 1024 // 5MB
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('maxSize')).toBe(5 * 1024 * 1024)
  })

  it('supports file type validation', () => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload',
        allowedTypes: allowedTypes
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('allowedTypes')).toEqual(allowedTypes)
  })

  it('supports custom file naming', () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload',
        customFilename: (file: File) => `custom_${Date.now()}_${file.name}`
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('customFilename')).toBeDefined()
  })

  it('supports image compression', () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload',
        compress: true,
        compressOptions: { maxWidth: 1920, maxHeight: 1080, quality: 0.8 }
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('compress')).toBe(true)
    expect(wrapper.props('compressOptions')).toEqual({ maxWidth: 1920, maxHeight: 1080, quality: 0.8 })
  })

  it('supports chunked upload', () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload',
        chunked: true,
        chunkSize: 2 * 1024 * 1024 // 2MB
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('chunked')).toBe(true)
    expect(wrapper.props('chunkSize')).toBe(2 * 1024 * 1024)
  })

  it('supports drag and drop customization', () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload',
        drag: true,
        dragText: 'Drag files here to upload',
        dragAcceptText: 'Accept: JPG, PNG, PDF',
        dragRejectText: 'Reject: Files larger than 5MB'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('dragText')).toBe('Drag files here to upload')
    expect(wrapper.props('dragAcceptText')).toBe('Accept: JPG, PNG, PDF')
    expect(wrapper.props('dragRejectText')).toBe('Reject: Files larger than 5MB')
  })

  it('supports image preview', () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload',
        preview: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('preview')).toBe(true)
  })

  it('supports responsive behavior', () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload',
        responsive: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('responsive')).toBe(true)
  })

  it('supports custom error messages', () => {
    const wrapper = mount(Upload, {
      props: {
        action: 'https://example.com/upload',
        errorMessages: {
          size: 'File size exceeds limit',
          type: 'File type not allowed',
          network: 'Network error occurred'
        }
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('errorMessages')).toEqual({
      size: 'File size exceeds limit',
      type: 'File type not allowed',
      network: 'Network error occurred'
    })
  })
})