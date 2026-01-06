import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import AutoImageGenerator from '@/components/common/AutoImageGenerator.vue'
import ElementPlus, { ElMessage, ElMessageBox } from 'element-plus'

// Mock Element Plus icons
vi.mock('@element-plus/icons-vue', () => ({
  Picture: { template: '<div>PictureIcon</div>' },
  Loading: { template: '<div>LoadingIcon</div>' }
}))

// Mock auto-image API
vi.mock('@/api/auto-image', () => ({
  autoImageApi: {
    generateImage: vi.fn()
  }
}))

// Mock Element Plus message and messagebox
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

describe('AutoImageGenerator.vue', () => {
  let wrapper: any
  let mockGenerateImage: any

  beforeEach(() => {
    mockGenerateImage = require('@/api/auto-image').autoImageApi.generateImage
    mockGenerateImage.mockResolvedValue({
      success: true,
      data: { imageUrl: 'https://example.com/generated-image.jpg' }
    })
    
    vi.clearAllMocks()
  })

  const createWrapper = (props: any = {}) => {
    return mount(AutoImageGenerator, {
      props: {
        buttonText: '🎨 AI智能配图',
        defaultCategory: 'activity',
        defaultStyle: 'cartoon',
        defaultSize: '1024x768',
        autoUse: false,
        ...props
      },
      global: {
        plugins: [ElementPlus],
        stubs: {
          'el-button': true,
          'el-icon': true,
          'el-image': true,
          'el-dialog': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-switch': true,
          'el-tag': true
        }
      }
    })
  }

  describe('组件渲染测试', () => {
    it('应该正确渲染自动配图按钮', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.auto-image-generator').exists()).toBe(true)
      expect(wrapper.find('button').exists()).toBe(true)
      expect(wrapper.text()).toContain('🎨 AI智能配图')
    })

    it('应该显示生成中状态', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ isGenerating: true })
      
      expect(wrapper.find('.generating-status').exists()).toBe(true)
      expect(wrapper.text()).toContain('AI配图生成中...')
    })

    it('应该显示生成的图片预览', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ 
        generatedImageUrl: 'https://example.com/test.jpg',
        isGenerating: false 
      })
      
      expect(wrapper.find('.generated-image-preview').exists()).toBe(true)
      expect(wrapper.find('.preview-image').exists()).toBe(true)
    })

    it('应该显示生成配置对话框', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ showGenerateDialog: true })
      
      expect(wrapper.findComponent({ name: 'ElDialog' }).exists()).toBe(true)
    })
  })

  describe('props传递测试', () => {
    it('应该正确接收buttonText prop', () => {
      wrapper = createWrapper({ buttonText: '自定义按钮文本' })
      
      expect(wrapper.props('buttonText')).toBe('自定义按钮文本')
    })

    it('应该正确接收defaultPrompt prop', () => {
      wrapper = createWrapper({ defaultPrompt: '默认描述词' })
      
      expect(wrapper.props('defaultPrompt')).toBe('默认描述词')
    })

    it('应该正确接收defaultCategory prop', () => {
      wrapper = createWrapper({ defaultCategory: 'poster' })
      
      expect(wrapper.props('defaultCategory')).toBe('poster')
    })

    it('应该正确接收defaultStyle prop', () => {
      wrapper = createWrapper({ defaultStyle: 'natural' })
      
      expect(wrapper.props('defaultStyle')).toBe('natural')
    })

    it('应该正确接收defaultSize prop', () => {
      wrapper = createWrapper({ defaultSize: '512x512' })
      
      expect(wrapper.props('defaultSize')).toBe('512x512')
    })

    it('应该正确接收autoUse prop', () => {
      wrapper = createWrapper({ autoUse: true })
      
      expect(wrapper.props('autoUse')).toBe(true)
    })

    it('应该使用默认的props值', () => {
      wrapper = createWrapper()
      
      expect(wrapper.props('buttonText')).toBe('🎨 AI智能配图')
      expect(wrapper.props('defaultCategory')).toBe('activity')
      expect(wrapper.props('defaultStyle')).toBe('cartoon')
      expect(wrapper.props('defaultSize')).toBe('1024x768')
      expect(wrapper.props('autoUse')).toBe(false)
    })
  })

  describe('表单验证测试', () => {
    it('应该验证prompt字段', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ showGenerateDialog: true })
      
      const form = wrapper.vm.generateForm
      form.prompt = ''
      
      const isValid = await wrapper.vm.generateFormRef.value?.validate()
      expect(isValid).toBe(false)
    })

    it('应该验证category字段', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ showGenerateDialog: true })
      
      const form = wrapper.vm.generateForm
      form.category = ''
      
      const isValid = await wrapper.vm.generateFormRef.value?.validate()
      expect(isValid).toBe(false)
    })

    it('应该验证style字段', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ showGenerateDialog: true })
      
      const form = wrapper.vm.generateForm
      form.style = ''
      
      const isValid = await wrapper.vm.generateFormRef.value?.validate()
      expect(isValid).toBe(false)
    })

    it('应该验证size字段', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ showGenerateDialog: true })
      
      const form = wrapper.vm.generateForm
      form.size = ''
      
      const isValid = await wrapper.vm.generateFormRef.value?.validate()
      expect(isValid).toBe(false)
    })

    it('应该验证quality字段', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ showGenerateDialog: true })
      
      const form = wrapper.vm.generateForm
      form.quality = ''
      
      const isValid = await wrapper.vm.generateFormRef.value?.validate()
      expect(isValid).toBe(false)
    })

    it('应该通过完整的表单验证', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ showGenerateDialog: true })
      
      const form = wrapper.vm.generateForm
      form.prompt = '测试描述词'
      form.category = 'activity'
      form.style = 'cartoon'
      form.size = '1024x768'
      form.quality = 'standard'
      
      const isValid = await wrapper.vm.generateFormRef.value?.validate()
      expect(isValid).toBe(true)
    })
  })

  describe('图片生成功能测试', () => {
    it('应该成功生成图片', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ showGenerateDialog: true })
      
      // 设置表单数据
      wrapper.vm.generateForm.prompt = '测试描述词'
      wrapper.vm.generateForm.category = 'activity'
      wrapper.vm.generateForm.style = 'cartoon'
      wrapper.vm.generateForm.size = '1024x768'
      wrapper.vm.generateForm.quality = 'standard'
      
      await wrapper.vm.generateImage()
      
      expect(mockGenerateImage).toHaveBeenCalledWith({
        prompt: '测试描述词',
        category: 'activity',
        style: 'cartoon',
        size: '1024x768',
        quality: 'standard',
        watermark: true
      })
      
      expect(wrapper.vm.generatedImageUrl).toBe('https://example.com/generated-image.jpg')
      expect(wrapper.vm.showGenerateDialog).toBe(false)
      expect(ElMessage.success).toHaveBeenCalledWith('图片生成成功！')
      expect(wrapper.emitted('image-generated')).toBeTruthy()
    })

    it('应该处理图片生成失败', async () => {
      mockGenerateImage.mockRejectedValue(new Error('生成失败'))
      
      wrapper = createWrapper()
      await wrapper.setData({ showGenerateDialog: true })
      
      wrapper.vm.generateForm.prompt = '测试描述词'
      wrapper.vm.generateForm.category = 'activity'
      wrapper.vm.generateForm.style = 'cartoon'
      wrapper.vm.generateForm.size = '1024x768'
      wrapper.vm.generateForm.quality = 'standard'
      
      await wrapper.vm.generateImage()
      
      expect(wrapper.vm.isGenerating).toBe(false)
      expect(ElMessage.error).toHaveBeenCalledWith('生成失败，请稍后重试')
    })

    it('应该处理API返回失败的情况', async () => {
      mockGenerateImage.mockResolvedValue({
        success: false,
        message: 'API错误'
      })
      
      wrapper = createWrapper()
      await wrapper.setData({ showGenerateDialog: true })
      
      wrapper.vm.generateForm.prompt = '测试描述词'
      wrapper.vm.generateForm.category = 'activity'
      wrapper.vm.generateForm.style = 'cartoon'
      wrapper.vm.generateForm.size = '1024x768'
      wrapper.vm.generateForm.quality = 'standard'
      
      await wrapper.vm.generateImage()
      
      expect(ElMessage.error).toHaveBeenCalledWith('API错误')
    })

    it('应该在autoUse为true时自动使用生成的图片', async () => {
      wrapper = createWrapper({ autoUse: true })
      await wrapper.setData({ showGenerateDialog: true })
      
      wrapper.vm.generateForm.prompt = '测试描述词'
      wrapper.vm.generateForm.category = 'activity'
      wrapper.vm.generateForm.style = 'cartoon'
      wrapper.vm.generateForm.size = '1024x768'
      wrapper.vm.generateForm.quality = 'standard'
      
      await wrapper.vm.generateImage()
      
      expect(wrapper.emitted('image-used')).toBeTruthy()
    })
  })

  describe('用户交互测试', () => {
    it('应该使用生成的图片', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ generatedImageUrl: 'https://example.com/test.jpg' })
      
      await wrapper.vm.useGeneratedImage()
      
      expect(wrapper.emitted('image-used')).toBeTruthy()
      expect(ElMessage.success).toHaveBeenCalledWith('已使用生成的图片')
    })

    it('应该重新生成图片', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ generatedImageUrl: 'https://example.com/test.jpg' })
      
      await wrapper.vm.regenerateImage()
      
      expect(wrapper.vm.showGenerateDialog).toBe(true)
    })

    it('应该清除生成的图片', async () => {
      ElMessageBox.confirm.mockResolvedValue(true)
      
      wrapper = createWrapper()
      await wrapper.setData({ generatedImageUrl: 'https://example.com/test.jpg' })
      
      await wrapper.vm.clearGeneratedImage()
      
      expect(wrapper.vm.generatedImageUrl).toBe('')
      expect(ElMessage.success).toHaveBeenCalledWith('已清除生成的图片')
      expect(ElMessageBox.confirm).toHaveBeenCalledWith('确定要清除生成的图片吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
    })

    it('应该取消清除生成的图片', async () => {
      ElMessageBox.confirm.mockRejectedValue(new Error('用户取消'))
      
      wrapper = createWrapper()
      await wrapper.setData({ generatedImageUrl: 'https://example.com/test.jpg' })
      
      await wrapper.vm.clearGeneratedImage()
      
      expect(wrapper.vm.generatedImageUrl).toBe('https://example.com/test.jpg')
    })

    it('应该处理对话框关闭', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ showGenerateDialog: true, isGenerating: false })
      
      const mockDone = vi.fn()
      await wrapper.vm.handleDialogClose(mockDone)
      
      expect(mockDone).toHaveBeenCalled()
    })

    it('应该在生成中时阻止对话框关闭', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ showGenerateDialog: true, isGenerating: true })
      
      const mockDone = vi.fn()
      await wrapper.vm.handleDialogClose(mockDone)
      
      expect(mockDone).not.toHaveBeenCalled()
      expect(ElMessage.warning).toHaveBeenCalledWith('图片生成中，请稍候...')
    })
  })

  describe('事件发射测试', () => {
    it('应该发射image-generated事件', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ showGenerateDialog: true })
      
      wrapper.vm.generateForm.prompt = '测试描述词'
      wrapper.vm.generateForm.category = 'activity'
      wrapper.vm.generateForm.style = 'cartoon'
      wrapper.vm.generateForm.size = '1024x768'
      wrapper.vm.generateForm.quality = 'standard'
      
      await wrapper.vm.generateImage()
      
      expect(wrapper.emitted('image-generated')).toBeTruthy()
      expect(wrapper.emitted('image-generated')[0]).toEqual(['https://example.com/generated-image.jpg'])
    })

    it('应该发射image-used事件', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ generatedImageUrl: 'https://example.com/test.jpg' })
      
      await wrapper.vm.useGeneratedImage()
      
      expect(wrapper.emitted('image-used')).toBeTruthy()
      expect(wrapper.emitted('image-used')[0]).toEqual(['https://example.com/test.jpg'])
    })
  })

  describe('边界条件测试', () => {
    it('应该处理空的generatedImageUrl', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ generatedImageUrl: '' })
      
      await wrapper.vm.useGeneratedImage()
      
      expect(wrapper.emitted('image-used')).toBeFalsy()
    })

    it('应该处理prompt长度限制', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ showGenerateDialog: true })
      
      // 测试过长的prompt
      const longPrompt = 'a'.repeat(501)
      wrapper.vm.generateForm.prompt = longPrompt
      
      const isValid = await wrapper.vm.generateFormRef.value?.validate()
      expect(isValid).toBe(false)
    })

    it('应该处理最小的prompt长度', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ showGenerateDialog: true })
      
      // 测试空的prompt
      wrapper.vm.generateForm.prompt = ''
      
      const isValid = await wrapper.vm.generateFormRef.value?.validate()
      expect(isValid).toBe(false)
    })

    it('应该处理不同的分类选项', async () => {
      const categories = ['activity', 'poster', 'template', 'marketing', 'education']
      
      for (const category of categories) {
        wrapper = createWrapper({ defaultCategory: category })
        expect(wrapper.vm.generateForm.category).toBe(category)
      }
    })

    it('应该处理不同的风格选项', async () => {
      const styles = ['natural', 'cartoon', 'realistic', 'artistic']
      
      for (const style of styles) {
        wrapper = createWrapper({ defaultStyle: style })
        expect(wrapper.vm.generateForm.style).toBe(style)
      }
    })

    it('应该处理不同的尺寸选项', async () => {
      const sizes = ['512x512', '1024x1024', '1024x768', '768x1024']
      
      for (const size of sizes) {
        wrapper = createWrapper({ defaultSize: size })
        expect(wrapper.vm.generateForm.size).toBe(size)
      }
    })
  })

  describe('暴露方法测试', () => {
    it('应该暴露generateImage方法', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.generateImage).toBeDefined()
      expect(typeof wrapper.vm.generateImage).toBe('function')
    })

    it('应该暴露clearGeneratedImage方法', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.clearGeneratedImage).toBeDefined()
      expect(typeof wrapper.vm.clearGeneratedImage).toBe('function')
    })

    it('应该暴露generatedImageUrl计算属性', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.generatedImageUrl).toBeDefined()
    })
  })

  describe('样式测试', () => {
    it('应该包含正确的CSS类', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.auto-image-generator').exists()).toBe(true)
    })

    it('应该在生成中时显示generating-status样式', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ isGenerating: true })
      
      expect(wrapper.find('.generating-status').exists()).toBe(true)
    })

    it('应该在有生成图片时显示generated-image-preview样式', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ generatedImageUrl: 'https://example.com/test.jpg' })
      
      expect(wrapper.find('.generated-image-preview').exists()).toBe(true)
      expect(wrapper.find('.preview-image').exists()).toBe(true)
      expect(wrapper.find('.image-actions').exists()).toBe(true)
    })

    it('应该显示提示标签样式', async () => {
      wrapper = createWrapper()
      await wrapper.setData({ showGenerateDialog: true })
      
      expect(wrapper.find('.prompt-tips').exists()).toBe(true)
      expect(wrapper.find('.category-tips').exists()).toBe(true)
      expect(wrapper.find('.style-tips').exists()).toBe(true)
    })
  })
})