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
import ElementSelector from '@/components/ai/website/ElementSelector.vue'
import { ElMessage } from 'element-plus'

// Mock Element Plus components
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    }
  }
})

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined)
  }
})

// Mock composable
const mockUseElementSelection = {
  startSelection: vi.fn(),
  stopSelection: vi.fn(),
  generateSelectors: vi.fn().mockResolvedValue([
    { type: 'id', value: '#test-id', score: 95 },
    { type: 'class', value: '.test-class', score: 80 }
  ])
}

const mockUseSmartSelection = {
  analyzeDescription: vi.fn(),
  findElementsByDescription: vi.fn().mockResolvedValue([
    { selector: '#smart-selector', description: 'Smart element match', confidence: 0.85 }
  ])
}

vi.mock('@/composables/useElementSelection', () => ({
  useElementSelection: () => mockUseElementSelection
}))

vi.mock('@/composables/useSmartSelection', () => ({
  useSmartSelection: () => mockUseSmartSelection
}))

describe('ElementSelector.vue', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()
    wrapper = mount(ElementSelector)
  })

  it('renders properly with default state', () => {
    expect(wrapper.find('.element-selector').exists()).toBe(true)
    expect(wrapper.find('.selector-modes').exists()).toBe(true)
    
    // Check default mode is visual
    const radioButtons = wrapper.findAll('.el-radio-button')
    expect(radioButtons[0].classes()).toContain('is-active') // visual mode
  })

  it('displays visual selector interface by default', () => {
    expect(wrapper.find('.visual-selector').exists()).toBe(true)
    expect(wrapper.find('.manual-selector').exists()).toBe(false)
    expect(wrapper.find('.smart-selector').exists()).toBe(false)
  })

  it('switches to manual selector mode', async () => {
    const manualRadioButton = wrapper.findAll('.el-radio-button')[1]
    await manualRadioButton.trigger('click')

    expect(wrapper.find('.visual-selector').exists()).toBe(false)
    expect(wrapper.find('.manual-selector').exists()).toBe(true)
    expect(wrapper.find('.smart-selector').exists()).toBe(false)
  })

  it('switches to smart selector mode', async () => {
    const smartRadioButton = wrapper.findAll('.el-radio-button')[2]
    await smartRadioButton.trigger('click')

    expect(wrapper.find('.visual-selector').exists()).toBe(false)
    expect(wrapper.find('.manual-selector').exists()).toBe(false)
    expect(wrapper.find('.smart-selector').exists()).toBe(true)
  })

  it('starts visual selection when button is clicked', async () => {
    const startButton = wrapper.find('.visual-controls .el-button[type="primary"]')
    await startButton.trigger('click')

    expect(mockUseElementSelection.startSelection).toHaveBeenCalledWith({
      mode: 'click',
      callback: expect.any(Function)
    })
    expect(wrapper.vm.isSelecting).toBe(true)
    expect(ElMessage.info).toHaveBeenCalledWith('请点击页面上的元素进行选择')
  })

  it('stops visual selection when button is clicked', async () => {
    await wrapper.setData({ isSelecting: true })
    
    const stopButton = wrapper.find('.visual-controls .el-button:nth-child(2)')
    await stopButton.trigger('click')

    expect(mockUseElementSelection.stopSelection).toHaveBeenCalled()
    expect(wrapper.vm.isSelecting).toBe(false)
  })

  it('displays selection indicator when selecting', async () => {
    await wrapper.setData({ isSelecting: true })
    
    expect(wrapper.find('.selection-indicator').exists()).toBe(true)
    expect(wrapper.find('.el-alert').exists()).toBe(true)
    expect(wrapper.find('.el-alert').text()).toContain('选择模式已启用')
  })

  it('displays selected element information', async () => {
    const mockElement = {
      tagName: 'BUTTON',
      id: 'test-button',
      className: 'btn primary',
      textContent: 'Click me'
    }
    
    await wrapper.setData({ selectedElement: mockElement })
    
    expect(wrapper.find('.selected-element').exists()).toBe(true)
    expect(wrapper.find('.element-preview .el-tag').text()).toBe('button')
    expect(wrapper.find('.element-text').text()).toBe('Click me')
  })

  it('generates selectors when element is selected', async () => {
    const mockElement = {
      tagName: 'DIV',
      id: 'test-id'
    }
    
    // Simulate element selection
    await wrapper.vm.handleElementSelected(mockElement)
    
    expect(mockUseElementSelection.generateSelectors).toHaveBeenCalledWith(mockElement)
    expect(wrapper.vm.generatedSelectors).toHaveLength(2)
    expect(wrapper.vm.selectedSelectorIndex).toBe(0)
  })

  it('tests manual selector correctly', async () => {
    // Switch to manual mode
    const manualRadioButton = wrapper.findAll('.el-radio-button')[1]
    await manualRadioButton.trigger('click')
    
    // Set selector value
    await wrapper.setData({ manualSelectorValue: '#test-selector' })
    
    // Mock document.querySelectorAll
    const mockElement = { tagName: 'DIV' }
    vi.spyOn(document, 'querySelectorAll').mockReturnValue([mockElement as any])
    
    const testButton = wrapper.find('.manual-controls .el-button[loading]')
    await testButton.trigger('click')
    
    expect(wrapper.vm.testing).toBe(true)
    expect(wrapper.vm.testResult).toBeTruthy()
    expect(wrapper.vm.testResult.success).toBe(true)
  })

  it('handles manual selector test errors', async () => {
    // Switch to manual mode
    const manualRadioButton = wrapper.findAll('.el-radio-button')[1]
    await manualRadioButton.trigger('click')
    
    await wrapper.setData({ manualSelectorValue: 'invalid-selector' })
    
    // Mock querySelectorAll to throw error
    vi.spyOn(document, 'querySelectorAll').mockImplementation(() => {
      throw new Error('Invalid selector')
    })
    
    const testButton = wrapper.find('.manual-controls .el-button[loading]')
    await testButton.trigger('click')
    
    expect(wrapper.vm.testResult.success).toBe(false)
    expect(wrapper.vm.testResult.message).toContain('选择器语法错误')
  })

  it('generates quick selectors correctly', async () => {
    // Switch to manual mode
    const manualRadioButton = wrapper.findAll('.el-radio-button')[1]
    await manualRadioButton.trigger('click')
    
    // Test ID selector
    await wrapper.setData({ quickId: 'test-id' })
    await wrapper.vm.generateQuickSelector('id')
    
    expect(wrapper.vm.manualSelectorValue).toBe('#test-id')
    expect(wrapper.vm.manualSelectorType).toBe('css')
    
    // Test class selector
    await wrapper.setData({ quickClass: 'test-class' })
    await wrapper.vm.generateQuickSelector('class')
    
    expect(wrapper.vm.manualSelectorValue).toBe('.test-class')
    
    // Test text selector
    await wrapper.setData({ quickText: 'test text' })
    await wrapper.vm.generateQuickSelector('text')
    
    expect(wrapper.vm.manualSelectorValue).toBe('//*[contains(text(), "test text")]')
    expect(wrapper.vm.manualSelectorType).toBe('xpath')
  })

  it('performs smart selection correctly', async () => {
    // Switch to smart mode
    const smartRadioButton = wrapper.findAll('.el-radio-button')[2]
    await smartRadioButton.trigger('click')
    
    await wrapper.setData({ smartDescription: 'login button' })
    
    const analyzeButton = wrapper.find('.smart-controls .el-button[type="primary"]')
    await analyzeButton.trigger('click')
    
    expect(wrapper.vm.smartAnalyzing).toBe(true)
    expect(mockUseSmartSelection.findElementsByDescription).toHaveBeenCalledWith('login button')
  })

  it('validates smart selection input', async () => {
    // Switch to smart mode
    const smartRadioButton = wrapper.findAll('.el-radio-button')[2]
    await smartRadioButton.trigger('click')
    
    // Try with empty description
    const analyzeButton = wrapper.find('.smart-controls .el-button[type="primary"]')
    await analyzeButton.trigger('click')
    
    expect(ElMessage.warning).toHaveBeenCalledWith('请输入元素描述')
    expect(mockUseSmartSelection.findElementsByDescription).not.toHaveBeenCalled()
  })

  it('displays smart selection results', async () => {
    // Switch to smart mode and set results
    const smartRadioButton = wrapper.findAll('.el-radio-button')[2]
    await smartRadioButton.trigger('click')
    
    await wrapper.setData({
      smartResults: [
        { selector: '#smart-1', description: 'First result', confidence: 0.9 },
        { selector: '#smart-2', description: 'Second result', confidence: 0.7 }
      ]
    })
    
    const resultItems = wrapper.findAll('.result-item')
    expect(resultItems.length).toBe(2)
    
    expect(resultItems[0].find('.result-description').text()).toBe('First result')
    expect(resultItems[0].find('.el-tag').text()).toContain('90%')
  })

  it('selects smart result correctly', async () => {
    await wrapper.setData({
      smartResults: [
        { selector: '#smart-1', description: 'First result', confidence: 0.9 }
      ]
    })
    
    const resultItem = wrapper.find('.result-item')
    await resultItem.trigger('click')
    
    expect(wrapper.vm.selectedSmartResult).toBe(0)
  })

  it('displays generated selectors correctly', async () => {
    await wrapper.setData({
      generatedSelectors: [
        { type: 'id', value: '#test-id', score: 95 },
        { type: 'class', value: '.test-class', score: 80 }
      ]
    })
    
    const selectorItems = wrapper.findAll('.selector-item')
    expect(selectorItems.length).toBe(2)
    
    expect(selectorItems[0].find('.selector-label').text()).toBe('ID')
    expect(selectorItems[0].find('.selector-value code').text()).toBe('#test-id')
    expect(selectorItems[0].find('.selector-score').text()).toBe('得分: 95/100')
  })

  it('selects generated selector correctly', async () => {
    await wrapper.setData({
      generatedSelectors: [
        { type: 'id', value: '#test-id', score: 95 }
      ]
    })
    
    const selectorItem = wrapper.find('.selector-item')
    await selectorItem.trigger('click')
    
    expect(wrapper.vm.selectedSelectorIndex).toBe(0)
  })

  it('copies selector value to clipboard', async () => {
    await wrapper.setData({
      generatedSelectors: [
        { type: 'id', value: '#test-id', score: 95 }
      ]
    })
    
    const copyButton = wrapper.find('.selector-value .el-button')
    await copyButton.trigger('click')
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('#test-id')
    expect(ElMessage.success).toHaveBeenCalledWith('选择器已复制到剪贴板')
  })

  it('tests generated selector correctly', async () => {
    await wrapper.setData({
      generatedSelectors: [
        { type: 'id', value: '#test-id', score: 95 }
      ]
    })
    
    // Mock document.querySelectorAll
    const mockElement = { tagName: 'DIV' }
    vi.spyOn(document, 'querySelectorAll').mockReturnValue([mockElement as any])
    
    const testButton = wrapper.find('.selector-value .el-button:nth-child(2)')
    await testButton.trigger('click')
    
    expect(ElMessage.success).toHaveBeenCalledWith('选择器测试成功，找到 1 个元素')
  })

  it('emits events correctly on confirm', async () => {
    await wrapper.setData({
      generatedSelectors: [
        { type: 'id', value: '#test-id', score: 95 }
      ],
      selectedSelectorIndex: 0,
      selectedElement: { tagName: 'DIV' }
    })
    
    const confirmButton = wrapper.find('.selector-footer .el-button[type="primary"]')
    await confirmButton.trigger('click')
    
    expect(wrapper.emitted('selector-generated')).toBeTruthy()
    expect(wrapper.emitted('selector-generated')[0]).toEqual(['#test-id'])
    expect(wrapper.emitted('element-selected')).toBeTruthy()
  })

  it('emits cancel event correctly', async () => {
    const cancelButton = wrapper.find('.selector-footer .el-button:first-child')
    await cancelButton.trigger('click')
    
    expect(wrapper.emitted('cancelled')).toBeTruthy()
  })

  it('disables confirm button when no selector is selected', async () => {
    const confirmButton = wrapper.find('.selector-footer .el-button[type="primary"]')
    expect(confirmButton.attributes('disabled')).toBe('')
  })

  it('enables confirm button when selector is selected', async () => {
    await wrapper.setData({
      generatedSelectors: [
        { type: 'id', value: '#test-id', score: 95 }
      ],
      selectedSelectorIndex: 0
    })
    
    const confirmButton = wrapper.find('.selector-footer .el-button[type="primary"]')
    expect(confirmButton.attributes('disabled')).toBeUndefined()
  })

  it('handles clipboard errors gracefully', async () => {
    vi.mocked(navigator.clipboard.writeText).mockRejectedValue(new Error('Clipboard error'))
    
    await wrapper.setData({
      generatedSelectors: [
        { type: 'id', value: '#test-id', score: 95 }
      ]
    })
    
    const copyButton = wrapper.find('.selector-value .el-button')
    await copyButton.trigger('click')
    
    expect(ElMessage.error).toHaveBeenCalledWith('复制失败')
  })

  it('cleans up state on mode change', async () => {
    // Set some state
    await wrapper.setData({
      selectedElement: { tagName: 'DIV' },
      generatedSelectors: [{ type: 'id', value: '#test-id', score: 95 }],
      selectedSelectorIndex: 0,
      testResult: { success: true },
      smartResults: [{ selector: '#smart', description: 'test', confidence: 0.8 }],
      selectedSmartResult: 0,
      isSelecting: true
    })
    
    // Switch mode
    const manualRadioButton = wrapper.findAll('.el-radio-button')[1]
    await manualRadioButton.trigger('click')
    
    // Check state is cleaned
    expect(wrapper.vm.selectedElement).toBeNull()
    expect(wrapper.vm.generatedSelectors).toEqual([])
    expect(wrapper.vm.selectedSelectorIndex).toBe(-1)
    expect(wrapper.vm.testResult).toBeNull()
    expect(wrapper.vm.smartResults).toEqual([])
    expect(wrapper.vm.selectedSmartResult).toBe(-1)
    expect(wrapper.vm.isSelecting).toBe(false)
  })
})