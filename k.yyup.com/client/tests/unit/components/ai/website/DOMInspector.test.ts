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
import DOMInspector from '@/components/ai/website/DOMInspector.vue'
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

describe('DOMInspector.vue', () => {
  let wrapper: any

  const mockElement = {
    tagName: 'DIV',
    id: 'test-id',
    className: 'test-class another-class',
    textContent: 'Test content',
    getBoundingClientRect: vi.fn().mockReturnValue({
      left: 100,
      top: 200,
      width: 300,
      height: 400
    }),
    attributes: [
      { name: 'id', value: 'test-id' },
      { name: 'class', value: 'test-class another-class' },
      { name: 'data-test', value: 'test-value' }
    ],
    setAttribute: vi.fn(),
    style: {}
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock window.getComputedStyle
    Object.defineProperty(window, 'getComputedStyle', {
      value: vi.fn().mockReturnValue({
        length: 3,
        item: vi.fn((index: number) => ['color', 'font-size', 'background-color'][index]),
        getPropertyValue: vi.fn((property: string) => {
          const styles: Record<string, string> = {
            color: 'rgb(0, 0, 0)',
            'font-size': '16px',
            'background-color': 'rgb(255, 255, 255)'
          }
          return styles[property] || ''
        })
      })
    })

    wrapper = mount(DOMInspector, {
      props: {
        element: mockElement
      }
    })
  })

  it('renders properly with element data', () => {
    expect(wrapper.find('.dom-inspector').exists()).toBe(true)
    expect(wrapper.find('.inspector-header h4').text()).toBe('DOM检查器')
    expect(wrapper.find('.inspector-content').exists()).toBe(true)
  })

  it('displays empty state when no element is provided', async () => {
    await wrapper.setProps({ element: null })
    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.find('.el-empty').exists()).toBe(true)
  })

  it('displays basic element information correctly', () => {
    const tagElement = wrapper.find('.tag-name')
    const idElement = wrapper.find('.element-id')
    const classElement = wrapper.find('.element-classes')

    expect(tagElement.text()).toBe('div')
    expect(idElement.text()).toBe('test-id')
    expect(classElement.text()).toBe('test-class another-class')
  })

  it('displays text content correctly', () => {
    const textDisplay = wrapper.find('.text-display')
    expect(textDisplay.exists()).toBe(true)
    expect(textDisplay.find('textarea').element.value).toBe('Test content')
  })

  it('displays element attributes correctly', () => {
    const attributeItems = wrapper.findAll('.attribute-item')
    expect(attributeItems.length).toBe(3) // id, class, and data-test

    const idAttribute = attributeItems[0]
    expect(idAttribute.find('.attribute-key').text()).toBe('id')
    expect(idAttribute.find('.attribute-value input').element.value).toBe('test-id')
  })

  it('handles attribute changes', async () => {
    const attributeInput = wrapper.find('.attribute-value input')
    await attributeInput.setValue('new-value')
    await attributeInput.trigger('change')

    expect(mockElement.setAttribute).toHaveBeenCalledWith('id', 'new-value')
    expect(ElMessage.success).toHaveBeenCalledWith('属性 id 已更新')
  })

  it('adds new attributes correctly', async () => {
    await wrapper.setData({
      newAttributeKey: 'new-attr',
      newAttributeValue: 'new-value'
    })

    const addButton = wrapper.find('.add-attribute .el-button')
    await addButton.trigger('click')

    expect(mockElement.setAttribute).toHaveBeenCalledWith('new-attr', 'new-value')
    expect(ElMessage.success).toHaveBeenCalledWith('属性已添加')
  })

  it('validates attribute addition', async () => {
    // Try to add attribute without key and value
    const addButton = wrapper.find('.add-attribute .el-button')
    await addButton.trigger('click')

    expect(ElMessage.warning).toHaveBeenCalledWith('请输入属性名和属性值')
    expect(mockElement.setAttribute).not.toHaveBeenCalled()
  })

  it('copies attribute values to clipboard', async () => {
    const copyButton = wrapper.find('.attribute-value .el-button')
    await copyButton.trigger('click')

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test-id')
    expect(ElMessage.success).toHaveBeenCalledWith('属性值已复制')
  })

  it('filters computed styles', async () => {
    await wrapper.setData({ styleFilter: 'color' })
    
    const styleItems = wrapper.findAll('.style-item')
    expect(styleItems.length).toBe(1)
    expect(styleItems[0].find('.style-property').text()).toBe('color')
  })

  it('displays element position information', () => {
    const positionItems = wrapper.findAll('.position-item')
    expect(positionItems.length).toBe(4)

    const xPosition = positionItems[0]
    expect(xPosition.find('label').text()).toBe('X坐标:')
    expect(xPosition.find('span').text()).toBe('100px')
  })

  it('generates DOM path correctly', () => {
    const pathItems = wrapper.findAll('.path-item')
    expect(pathItems.length).toBeGreaterThan(0)
  })

  it('generates selectors based on selected types', async () => {
    await wrapper.setData({
      selectorTypes: ['id', 'class']
    })

    const generateButton = wrapper.find('.generator-actions .el-button[type="primary"]')
    await generateButton.trigger('click')

    expect(ElMessage.success).toHaveBeenCalledWith('生成了 2 个选择器')
  })

  it('copies generated selectors to clipboard', async () => {
    // First generate selectors
    await wrapper.setData({ selectorTypes: ['id'] })
    const generateButton = wrapper.find('.generator-actions .el-button[type="primary"]')
    await generateButton.trigger('click')

    // Then copy selector
    const copyButton = wrapper.find('.selector-value .el-button')
    await copyButton.trigger('click')

    expect(navigator.clipboard.writeText).toHaveBeenCalled()
    expect(ElMessage.success).toHaveBeenCalledWith('选择器已复制')
  })

  it('highlights element correctly', async () => {
    const highlightButton = wrapper.find('.action-buttons .el-button[type="primary"]')
    await highlightButton.trigger('click')

    expect(mockElement.style.outline).toBe('3px solid #409eff')
    expect(ElMessage.success).toHaveBeenCalledWith('元素已高亮')
  })

  it('scrolls to element correctly', async () => {
    mockElement.scrollIntoView = vi.fn()
    
    const scrollButton = wrapper.find('.action-buttons .el-button:nth-child(2)')
    await scrollButton.trigger('click')

    expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center'
    })
    expect(ElMessage.success).toHaveBeenCalledWith('已滚动到元素')
  })

  it('simulates click on element', async () => {
    mockElement.click = vi.fn()
    
    const clickButton = wrapper.find('.action-buttons .el-button:nth-child(3)')
    await clickButton.trigger('click')

    expect(mockElement.click).toHaveBeenCalled()
    expect(ElMessage.success).toHaveBeenCalledWith('已模拟点击')
  })

  it('simulates hover on element', async () => {
    const hoverButton = wrapper.find('.action-buttons .el-button:nth-child(4)')
    await hoverButton.trigger('click')

    expect(ElMessage.success).toHaveBeenCalledWith('已模拟悬停')
  })

  it('exports element data correctly', async () => {
    // Mock URL and Blob APIs
    const mockURL = 'blob:test-url'
    const mockBlob = new Blob(['test'], { type: 'application/json' })
    
    global.URL.createObjectURL = vi.fn().mockReturnValue(mockURL)
    global.Blob = vi.fn().mockImplementation((_, options) => mockBlob)
    
    const createElementSpy = vi.spyOn(document, 'createElement')
    const mockAnchor = {
      href: '',
      download: '',
      click: vi.fn()
    }
    createElementSpy.mockReturnValue(mockAnchor)

    const exportButton = wrapper.find('.inspector-actions .el-button:nth-child(2)')
    await exportButton.trigger('click')

    expect(ElMessage.success).toHaveBeenCalledWith('元素数据已导出')
    
    // Restore
    createElementSpy.mockRestore()
  })

  it('emits close event when close button is clicked', async () => {
    const closeButton = wrapper.find('.inspector-actions .el-button:nth-child(3)')
    await closeButton.trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('updates element data when element prop changes', async () => {
    const newElement = {
      ...mockElement,
      tagName: 'BUTTON',
      textContent: 'New content'
    }

    await wrapper.setProps({ element: newElement })

    expect(wrapper.find('.tag-name').text()).toBe('button')
    expect(wrapper.find('.text-display textarea').element.value).toBe('New content')
  })

  it('handles clipboard errors gracefully', async () => {
    // Mock clipboard error
    vi.mocked(navigator.clipboard.writeText).mockRejectedValue(new Error('Clipboard error'))

    const copyButton = wrapper.find('.attribute-value .el-button')
    await copyButton.trigger('click')

    expect(ElMessage.error).toHaveBeenCalledWith('复制失败')
  })

  it('handles attribute change errors gracefully', async () => {
    // Mock setAttribute error
    mockElement.setAttribute = vi.fn().mockImplementation(() => {
      throw new Error('Attribute error')
    })

    const attributeInput = wrapper.find('.attribute-value input')
    await attributeInput.setValue('error-value')
    await attributeInput.trigger('change')

    expect(ElMessage.error).toHaveBeenCalledWith('更新属性失败: Attribute error')
  })
})