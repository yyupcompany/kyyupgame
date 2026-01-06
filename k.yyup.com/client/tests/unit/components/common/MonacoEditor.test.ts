
// 使用全局表单引用Mock
beforeEach(() => {
  // 设置表单引用Mock
  if (typeof formRef !== 'undefined' && formRef.value) {
    Object.assign(formRef.value, global.mockFormRef)
  }
  if (typeof editInput !== 'undefined' && editInput.value) {
    Object.assign(editInput.value, global.mockInputRef)
  }
})


// Element Plus Mock for form validation
const mockFormRef = {
  clearValidate: vi.fn(),
  resetFields: vi.fn(),
  validate: vi.fn(() => Promise.resolve(true)),
  validateField: vi.fn()
}

const mockInputRef = {
  focus: vi.fn(),
  blur: vi.fn(),
  select: vi.fn()
}

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElForm: {
    name: 'ElForm',
    template: '<form><slot /></form>'
  },
  ElFormItem: {
    name: 'ElFormItem',
    template: '<div><slot /></div>'
  },
  ElInput: {
    name: 'ElInput',
    template: '<input />'
  },
  ElButton: {
    name: 'ElButton',
    template: '<button><slot /></button>'
  }
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

describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import MonacoEditor from '@/components/common/MonacoEditor.vue'

// Mock document methods
const mockCreateElement = vi.fn()
const mockAppendChild = vi.fn()
const mockAddEventListener = vi.fn()
const mockRemoveEventListener = vi.fn()

describe('MonacoEditor.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    
    // Mock document methods
    document.createElement = mockCreateElement
    mockCreateElement.mockReturnValue({
      value: '',
      style: {},
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
      scrollHeight: 100,
      scrollWidth: 200
    })
    
    Object.defineProperty(document, 'createElement', {
      value: mockCreateElement,
      writable: true
    })
  })

  const createWrapper = (props = {}) => {
    return mount(MonacoEditor, {
      props: {
        modelValue: 'test code',
        language: 'javascript',
        height: '300px',
        options: {},
        readonly: false,
        ...props
      }
    })
  }

  it('renders properly with default props', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.monaco-editor-container').exists()).toBe(true)
  })

  it('applies correct styles to container', () => {
    const wrapper = createWrapper({ height: '400px' })
    
    const container = wrapper.find('.monaco-editor-container')
    expect(container.attributes('style')).toContain('height: 400px')
    expect(container.attributes('style')).toContain('width: 100%')
  })

  it('creates textarea element for fallback editor', () => {
    createWrapper()
    
    expect(mockCreateElement).toHaveBeenCalledWith('textarea')
    expect(mockCreateElement).toHaveBeenCalledWith('div')
  })

  it('sets initial textarea value from modelValue', () => {
    const wrapper = createWrapper({ modelValue: 'const test = "hello";' })
    
    const textarea = mockCreateElement.mock.results[0].value
    expect(textarea.value).toBe('const test = "hello";')
  })

  it('applies correct styles to textarea', () => {
    createWrapper()
    
    const textarea = mockCreateElement.mock.results[0].value
    
    expect(textarea.style.width).toBe('100%')
    expect(textarea.style.height).toBe('100%')
    expect(textarea.style.border).toBe('none')
    expect(textarea.style.outline).toBe('none')
    expect(textarea.style.resize).toBe('none')
    expect(textarea.style.fontFamily).toBe('Monaco, Consolas, "Courier New", monospace')
    expect(textarea.style.fontSize).toBe('14px')
    expect(textarea.style.lineHeight).toBe('1.5')
    expect(textarea.style.padding).toBe('10px')
    expect(textarea.style.backgroundColor).toBe('#ffffff')
  })

  it('applies readonly styles when readonly is true', () => {
    createWrapper({ readonly: true })
    
    const textarea = mockCreateElement.mock.results[0].value
    
    expect(textarea.readOnly).toBe(true)
    expect(textarea.style.backgroundColor).toBe('#f8f9fa')
  })

  it('applies language-specific syntax highlighting', () => {
    createWrapper({ language: 'sql' })
    
    const textarea = mockCreateElement.mock.results[0].value
    expect(textarea.style.color).toBe('#0066cc')
  })

  it('applies JSON syntax highlighting', () => {
    createWrapper({ language: 'json' })
    
    const textarea = mockCreateElement.mock.results[0].value
    expect(textarea.style.color).toBe('#d14')
  })

  it('creates line numbers element', () => {
    createWrapper()
    
    expect(mockCreateElement).toHaveBeenCalledTimes(2) // textarea + lineNumbers
    
    const lineNumbers = mockCreateElement.mock.results[1].value
    expect(lineNumbers.style.position).toBe('absolute')
    expect(lineNumbers.style.left).toBe('0')
    expect(lineNumbers.style.top).toBe('0')
    expect(lineNumbers.style.width).toBe('40px')
    expect(lineNumbers.style.height).toBe('100%')
  })

  it('styles line numbers correctly', () => {
    createWrapper()
    
    const lineNumbers = mockCreateElement.mock.results[1].value
    
    expect(lineNumbers.style.backgroundColor).toBe('#f8f9fa')
    expect(lineNumbers.style.borderRight).toBe('1px solid #e1e4e8')
    expect(lineNumbers.style.fontSize).toBe('12px')
    expect(lineNumbers.style.lineHeight).toBe('1.5')
    expect(lineNumbers.style.color).toBe('#666')
    expect(lineNumbers.style.textAlign).toBe('right')
  })

  it('positions textarea correctly with line numbers', () => {
    createWrapper()
    
    const textarea = mockCreateElement.mock.results[0].value
    
    expect(textarea.style.position).toBe('absolute')
    expect(textarea.style.left).toBe('40px')
    expect(textarea.style.top).toBe('0')
    expect(textarea.style.width).toBe('calc(100% - 40px)')
    expect(textarea.style.paddingLeft).toBe('10px')
  })

  it('updates line numbers when content changes', () => {
    const wrapper = createWrapper()
    
    const textarea = mockCreateElement.mock.results[0].value
    const lineNumbers = mockCreateElement.mock.results[1].value
    
    // Simulate input event
    const inputEvent = new Event('input')
    textarea.value = 'line1\nline2\nline3'
    textarea.dispatchEvent(inputEvent)
    
    expect(lineNumbers.textContent).toBe('1\n2\n3')
  })

  it('syncs line numbers scroll with textarea', () => {
    const wrapper = createWrapper()
    
    const textarea = mockCreateElement.mock.results[0].value
    const lineNumbers = mockCreateElement.mock.results[1].value
    
    // Simulate scroll event
    const scrollEvent = new Event('scroll')
    textarea.scrollTop = 50
    textarea.dispatchEvent(scrollEvent)
    
    expect(lineNumbers.scrollTop).toBe(50)
  })

  it('emits update:modelValue when content changes', () => {
    const wrapper = createWrapper()
    
    const textarea = mockCreateElement.mock.results[0].value
    
    // Simulate input event
    const inputEvent = new Event('input')
    textarea.value = 'new content'
    textarea.dispatchEvent(inputEvent)
    
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['new content'])
  })

  it('emits change event when content changes', () => {
    const wrapper = createWrapper()
    
    const textarea = mockCreateElement.mock.results[0].value
    
    // Simulate input event
    const inputEvent = new Event('input')
    textarea.value = 'changed content'
    textarea.dispatchEvent(inputEvent)
    
    expect(wrapper.emitted('change')).toBeTruthy()
    expect(wrapper.emitted('change')[0]).toEqual(['changed content'])
  })

  it('emits ready event when editor is initialized', () => {
    const wrapper = createWrapper()
    
    expect(wrapper.emitted('ready')).toBeTruthy()
    
    const editor = wrapper.emitted('ready')[0][0]
    expect(editor).toBeDefined()
    expect(typeof editor.getValue).toBe('function')
    expect(typeof editor.setValue).toBe('function')
    expect(typeof editor.dispose).toBe('function')
    expect(typeof editor.focus).toBe('function')
    expect(typeof editor.getModel).toBe('function')
    expect(typeof editor.updateOptions).toBe('function')
  })

  it('watches modelValue changes and updates editor', async () => {
    const wrapper = createWrapper({ modelValue: 'initial content' })
    
    await wrapper.setProps({ modelValue: 'updated content' })
    
    const editor = wrapper.emitted('ready')[0][0]
    expect(editor.getValue()).toBe('updated content')
  })

  it('watches options changes and updates editor', async () => {
    const wrapper = createWrapper({ options: { readOnly: false } })
    
    await wrapper.setProps({ options: { readOnly: true } })
    
    const editor = wrapper.emitted('ready')[0][0]
    expect(editor.updateOptions).toHaveBeenCalledWith({ readOnly: true })
  })

  it('provides editor methods correctly', () => {
    const wrapper = createWrapper()
    
    const editor = wrapper.emitted('ready')[0][0]
    
    // Test getValue
    expect(editor.getValue()).toBe('test code')
    
    // Test setValue
    editor.setValue('new value')
    expect(editor.getValue()).toBe('new value')
    
    // Test focus
    const textarea = mockCreateElement.mock.results[0].value
    const focusSpy = vi.spyOn(textarea, 'focus')
    editor.focus()
    expect(focusSpy).toHaveBeenCalled()
  })

  it('handles editor disposal correctly', () => {
    const wrapper = createWrapper()
    
    const editor = wrapper.emitted('ready')[0][0]
    const disposeSpy = vi.spyOn(editor, 'dispose')
    
    wrapper.unmount()
    
    expect(disposeSpy).toHaveBeenCalled()
  })

  it('applies container styles correctly', () => {
    const wrapper = createWrapper()
    
    const container = wrapper.find('.monaco-editor-container')
    expect(container.classes()).toContain('monaco-editor-container')
    expect(container.classes()).toContain('font-family-monaco-consolas-courier-new-monospace')
  })

  it('handles readonly option updates', async () => {
    const wrapper = createWrapper({ readonly: false })
    
    await wrapper.setProps({ options: { readOnly: true } })
    
    const editor = wrapper.emitted('ready')[0][0]
    editor.updateOptions({ readOnly: true })
    
    const textarea = mockCreateElement.mock.results[0].value
    expect(textarea.readOnly).toBe(true)
    expect(textarea.style.backgroundColor).toBe('#f8f9fa')
  })

  it('handles different languages', () => {
    const languages = ['javascript', 'typescript', 'python', 'sql', 'json', 'html', 'css']
    
    languages.forEach(language => {
      const wrapper = createWrapper({ language })
      expect(wrapper.vm.language).toBe(language)
    })
  })

  it('handles different heights', () => {
    const heights = ['200px', '300px', '400px', '500px', '100%']
    
    heights.forEach(height => {
      const wrapper = createWrapper({ height })
      expect(wrapper.vm.height).toBe(height)
    })
  })

  it('adds and removes event listeners correctly', () => {
    createWrapper()
    
    const textarea = mockCreateElement.mock.results[0].value
    
    expect(mockAddEventListener).toHaveBeenCalledWith('input', expect.any(Function))
    expect(mockAddEventListener).toHaveBeenCalledWith('scroll', expect.any(Function))
  })

  it('cleans up event listeners on disposal', () => {
    const wrapper = createWrapper()
    
    const textarea = mockCreateElement.mock.results[0].value
    
    wrapper.unmount()
    
    expect(mockRemoveEventListener).toHaveBeenCalledWith('input', expect.any(Function))
    expect(mockRemoveEventListener).toHaveBeenCalledWith('scroll', expect.any(Function))
  })

  it('is a simplified editor component', () => {
    const wrapper = createWrapper()
    
    expect(wrapper.vm.$options.name).toBe('MonacoEditor')
    expect(wrapper.find('.monaco-editor-container').exists()).toBe(true)
  })

  it('accepts all props correctly', () => {
    const props = {
      modelValue: 'const test = "hello";',
      language: 'typescript',
      height: '500px',
      options: { readOnly: true, minimap: { enabled: false } },
      readonly: true
    }
    
    const wrapper = createWrapper(props)
    
    expect(wrapper.vm.modelValue).toBe('const test = "hello";')
    expect(wrapper.vm.language).toBe('typescript')
    expect(wrapper.vm.height).toBe('500px')
    expect(wrapper.vm.options).toEqual({ readOnly: true, minimap: { enabled: false } })
    expect(wrapper.vm.readonly).toBe(true)
  })
})