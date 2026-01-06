import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import KindergartenImageGenerator from '@/components/kindergarten/KindergartenImageGenerator.vue'

// Mock Element Plus components
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn()
    }
  }
})

// Mock API
vi.mock('@/api/auto-image', () => ({
  autoImageApi: {
    generateImage: vi.fn()
  }
}))

describe('KindergartenImageGenerator', () => {
  let wrapper: any
  let mockAutoImageApi: any

  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks()

    // Get the mocked module
    const autoImageModule = await import('@/api/auto-image')
    mockAutoImageApi = autoImageModule.autoImageApi

    // Setup default mock responses
    mockAutoImageApi.generateImage.mockResolvedValue({
      success: true,
      data: { imageUrl: 'https://example.com/generated-image.jpg' }
    })
    
    wrapper = mount(KindergartenImageGenerator, {
      props: {
        autoUse: false,
        defaultActivityType: 'activity'
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.clearAllMocks()
  })

  it('renders properly with default props', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.kindergarten-image-generator').exists()).toBe(true)
    expect(wrapper.find('.quick-generate-btn').exists()).toBe(true)
    expect(wrapper.text()).toContain('🎨 幼儿园AI配图')
  })

  it('shows quick generate button when not generating and no image', () => {
    const button = wrapper.find('.quick-generate-btn')
    expect(button.exists()).toBe(true)
    expect(button.text()).toContain('🎨 幼儿园AI配图')
  })

  it('shows generating status when isGenerating is true', async () => {
    await wrapper.setData({ isGenerating: true })
    
    expect(wrapper.find('.generating-status').exists()).toBe(true)
    expect(wrapper.find('.is-loading').exists()).toBe(true)
    expect(wrapper.text()).toContain('正在为小朋友们生成可爱的图片...')
  })

  it('shows generated image preview when image is available', async () => {
    await wrapper.setData({ 
      isGenerating: false,
      generatedImageUrl: 'https://example.com/test-image.jpg'
    })
    
    expect(wrapper.find('.generated-image-preview').exists()).toBe(true)
    expect(wrapper.find('.preview-image').exists()).toBe(true)
    expect(wrapper.find('.preview-image').attributes('src')).toBe('https://example.com/test-image.jpg')
  })

  it('opens quick options dialog when quick generate button is clicked', async () => {
    await wrapper.find('.quick-generate-btn').trigger('click')
    
    expect(wrapper.vm.showQuickOptions).toBe(true)
    expect(wrapper.find('.el-dialog').exists()).toBe(true)
    expect(wrapper.text()).toContain('🎨 幼儿园AI智能配图')
  })

  it('renders all quick templates', () => {
    wrapper.setData({ showQuickOptions: true })
    
    const templateButtons = wrapper.findAll('.template-btn')
    expect(templateButtons.length).toBe(6)
    
    const expectedTemplates = ['晨间锻炼', '美术课堂', '故事时间', '快乐用餐', '户外游戏', '音乐舞蹈']
    templateButtons.forEach((button, index) => {
      expect(button.text()).toContain(expectedTemplates[index])
    })
  })

  it('generates image from template when template button is clicked', async () => {
    wrapper.setData({ showQuickOptions: true })
    
    const templateButtons = wrapper.findAll('.template-btn')
    await templateButtons[0].trigger('click')
    
    expect(mockAutoImageApi.generateImage).toHaveBeenCalledWith({
      prompt: '3-6岁的小朋友们在幼儿园操场上做晨间锻炼，大家排成整齐的队伍，跟着老师一起做体操，阳光明媚，充满活力',
      category: 'activity',
      style: 'cartoon',
      size: '1024x768',
      quality: 'standard',
      watermark: true
    })
    
    expect(wrapper.vm.isGenerating).toBe(false)
    expect(wrapper.vm.generatedImageUrl).toBe('https://example.com/generated-image.jpg')
  })

  it('generates custom image when form is submitted', async () => {
    wrapper.setData({ showQuickOptions: true })
    
    // Fill form
    await wrapper.setData({
      generateForm: {
        prompt: '小朋友们快乐地玩耍',
        ageGroup: 'mixed',
        sceneType: 'indoor',
        style: 'cartoon',
        size: '1024x768'
      }
    })
    
    const generateButton = wrapper.find('.dialog-footer .el-button--primary')
    await generateButton.trigger('click')
    
    expect(mockAutoImageApi.generateImage).toHaveBeenCalledWith({
      prompt: '3-6岁混龄的小朋友们在室内教室环境中，小朋友们快乐地玩耍，温馨安全的幼儿园氛围，孩子们天真可爱的笑容',
      category: 'activity',
      style: 'cartoon',
      size: '1024x768',
      quality: 'standard',
      watermark: true
    })
  })

  it('validates form before generating custom image', async () => {
    wrapper.setData({ showQuickOptions: true })
    
    // Set invalid prompt
    await wrapper.setData({
      generateForm: {
        prompt: 'short',
        ageGroup: 'mixed',
        sceneType: 'indoor',
        style: 'cartoon',
        size: '1024x768'
      }
    })
    
    const generateButton = wrapper.find('.dialog-footer .el-button--primary')
    await generateButton.trigger('click')
    
    expect(mockAutoImageApi.generateImage).not.toHaveBeenCalled()
  })

  it('emits image-generated event when image is generated', async () => {
    wrapper.setData({ showQuickOptions: true })
    
    const templateButtons = wrapper.findAll('.template-btn')
    await templateButtons[0].trigger('click')
    
    await nextTick()
    expect(wrapper.emitted('image-generated')).toBeTruthy()
    expect(wrapper.emitted('image-generated')[0]).toEqual(['https://example.com/generated-image.jpg'])
  })

  it('emits image-used event when use generated image button is clicked', async () => {
    await wrapper.setData({ 
      generatedImageUrl: 'https://example.com/test-image.jpg'
    })
    
    const useButton = wrapper.find('.image-actions .el-button--primary')
    await useButton.trigger('click')
    
    expect(wrapper.emitted('image-used')).toBeTruthy()
    expect(wrapper.emitted('image-used')[0]).toEqual(['https://example.com/test-image.jpg'])
  })

  it('auto-uses generated image when autoUse prop is true', async () => {
    wrapper = mount(KindergartenImageGenerator, {
      props: {
        autoUse: true,
        defaultActivityType: 'activity'
      }
    })
    
    wrapper.setData({ showQuickOptions: true })
    
    const templateButtons = wrapper.findAll('.template-btn')
    await templateButtons[0].trigger('click')
    
    await nextTick()
    expect(wrapper.emitted('image-used')).toBeTruthy()
  })

  it('clears generated image when clear button is clicked', async () => {
    const { ElMessageBox } = require('element-plus')
    ElMessageBox.confirm.mockResolvedValue(true)
    
    await wrapper.setData({ 
      generatedImageUrl: 'https://example.com/test-image.jpg'
    })
    
    const clearButton = wrapper.find('.image-actions .el-button--danger')
    await clearButton.trigger('click')
    
    expect(ElMessageBox.confirm).toHaveBeenCalledWith(
      '确定要清除生成的图片吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    expect(wrapper.vm.generatedImageUrl).toBe('')
  })

  it('shows regenerate dialog when regenerate button is clicked', async () => {
    await wrapper.setData({ 
      generatedImageUrl: 'https://example.com/test-image.jpg'
    })
    
    const regenerateButton = wrapper.findAll('.image-actions .el-button')[1]
    await regenerateButton.trigger('click')
    
    expect(wrapper.vm.showQuickOptions).toBe(true)
  })

  it('prevents dialog close when generating is in progress', async () => {
    await wrapper.setData({ 
      showQuickOptions: true,
      isGenerating: true
    })
    
    const { ElMessage } = require('element-plus')
    
    // Simulate dialog close attempt
    await wrapper.vm.handleDialogClose(vi.fn())
    
    expect(ElMessage.warning).toHaveBeenCalledWith('图片生成中，请稍候...')
  })

  it('handles API error gracefully', async () => {
    mockAutoImageApi.generateImage.mockRejectedValue(new Error('API Error'))
    
    wrapper.setData({ showQuickOptions: true })
    
    const templateButtons = wrapper.findAll('.template-btn')
    await templateButtons[0].trigger('click')
    
    const { ElMessage } = require('element-plus')
    expect(ElMessage.error).toHaveBeenCalledWith('API Error')
    expect(wrapper.vm.isGenerating).toBe(false)
  })

  it('handles API failure response gracefully', async () => {
    mockAutoImageApi.generateImage.mockResolvedValue({
      success: false,
      message: 'Generation failed'
    })
    
    wrapper.setData({ showQuickOptions: true })
    
    const templateButtons = wrapper.findAll('.template-btn')
    await templateButtons[0].trigger('click')
    
    const { ElMessage } = require('element-plus')
    expect(ElMessage.error).toHaveBeenCalledWith('Generation failed')
  })

  it('has correct form validation rules', () => {
    const rules = wrapper.vm.generateRules
    expect(rules.prompt).toHaveLength(2)
    expect(rules.prompt[0].required).toBe(true)
    expect(rules.prompt[0].message).toBe('请输入活动描述')
    expect(rules.prompt[1].min).toBe(5)
    expect(rules.prompt[1].max).toBe(300)
  })

  it('maps age groups correctly', async () => {
    wrapper.setData({ showQuickOptions: true })
    
    const ageGroups = ['small', 'medium', 'large', 'mixed']
    const expectedLabels = ['3-4岁小班', '4-5岁中班', '5-6岁大班', '3-6岁混龄']
    
    for (let i = 0; i < ageGroups.length; i++) {
      await wrapper.setData({
        generateForm: {
          ...wrapper.vm.generateForm,
          ageGroup: ageGroups[i]
        }
      })
      
      const prompt = wrapper.vm.generateForm.prompt
      // The prompt should contain the mapped age group
      expect(prompt).toContain(expectedLabels[i])
    }
  })

  it('maps scene types correctly', async () => {
    wrapper.setData({ showQuickOptions: true })
    
    const sceneTypes = ['indoor', 'outdoor', 'dining', 'nap', 'performance', 'craft']
    const expectedLabels = [
      '室内教室环境', '户外操场环境', '餐厅用餐环境', 
      '午休室环境', '表演舞台环境', '手工制作环境'
    ]
    
    for (let i = 0; i < sceneTypes.length; i++) {
      await wrapper.setData({
        generateForm: {
          ...wrapper.vm.generateForm,
          sceneType: sceneTypes[i]
        }
      })
      
      const prompt = wrapper.vm.generateForm.prompt
      // The prompt should contain the mapped scene type
      expect(prompt).toContain(expectedLabels[i])
    }
  })

  it('exposes methods correctly', () => {
    const exposed = wrapper.vm
    expect(exposed.generateFromTemplate).toBeDefined()
    expect(exposed.generateCustomImage).toBeDefined()
    expect(exposed.clearGeneratedImage).toBeDefined()
    expect(exposed.generatedImageUrl).toBeDefined()
  })

  it('has correct default form values', () => {
    expect(wrapper.vm.generateForm.prompt).toBe('小朋友们在幼儿园里快乐地学习和游戏')
    expect(wrapper.vm.generateForm.ageGroup).toBe('mixed')
    expect(wrapper.vm.generateForm.sceneType).toBe('indoor')
    expect(wrapper.vm.generateForm.style).toBe('cartoon')
    expect(wrapper.vm.generateForm.size).toBe('1024x768')
  })

  it('has correct quick templates data', () => {
    expect(wrapper.vm.quickTemplates).toHaveLength(6)
    expect(wrapper.vm.quickTemplates[0].key).toBe('morning-exercise')
    expect(wrapper.vm.quickTemplates[0].name).toBe('晨间锻炼')
    expect(wrapper.vm.quickTemplates[0].icon).toBe('🏃‍♀️')
  })

  it('applies correct CSS classes', () => {
    expect(wrapper.find('.quick-generate-btn').classes()).toContain('quick-generate-btn')
    expect(wrapper.find('.kindergarten-image-generator').exists()).toBe(true)
  })

  it('shows correct image preview actions', async () => {
    await wrapper.setData({ 
      generatedImageUrl: 'https://example.com/test-image.jpg'
    })
    
    const actionButtons = wrapper.findAll('.image-actions .el-button')
    expect(actionButtons.length).toBe(3)
    expect(actionButtons[0].text()).toContain('✨ 使用这张图片')
    expect(actionButtons[1].text()).toContain('🔄 重新生成')
    expect(actionButtons[2].text()).toContain('🗑️ 清除')
  })
})