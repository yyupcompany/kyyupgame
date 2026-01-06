
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
import MarkdownRenderer from '@/components/common/MarkdownRenderer.vue'
import MermaidRenderer from '@/components/common/MermaidRenderer.vue'

// Mock external dependencies
vi.mock('marked', () => ({
  marked: {
    setOptions: vi.fn(),
    parse: vi.fn()
  }
}))

vi.mock('highlight.js', () => ({
  default: {
    highlight: vi.fn(),
    highlightAuto: vi.fn(),
    getLanguage: vi.fn()
  }
}))

vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((html) => html)
  }
}))

vi.mock('highlight.js/styles/github.css', () => ({}))

describe('MarkdownRenderer.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    
    // Mock window methods
    Object.defineProperty(window, 'copyCode', {
      value: vi.fn(),
      writable: true
    })
    
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined)
      },
      writable: true
    })
  })

  const createWrapper = (props = {}) => {
    return mount(MarkdownRenderer, {
      props: {
        content: '',
        isDark: false,
        isMobile: true,
        enableCodeHighlight: true,
        enableTables: true,
        enableBreaks: true,
        ...props
      },
      global: {
        stubs: {
          'mermaid-renderer': MermaidRenderer
        }
      }
    })
  }

  it('renders properly with default props', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.markdown-renderer').exists()).toBe(true)
    expect(wrapper.classes()).toContain('dark-theme-false')
    expect(wrapper.classes()).toContain('mobile-optimized-true')
  })

  it('applies dark theme class when isDark is true', () => {
    const wrapper = createWrapper({ isDark: true })
    expect(wrapper.classes()).toContain('dark-theme-true')
  })

  it('applies mobile optimized class when isMobile is true', () => {
    const wrapper = createWrapper({ isMobile: true })
    expect(wrapper.classes()).toContain('mobile-optimized-true')
  })

  it('renders empty content when content is empty', () => {
    const wrapper = createWrapper({ content: '' })
    expect(wrapper.find('.markdown-renderer').html()).toContain('<div></div>')
  })

  it('extracts mermaid blocks correctly', () => {
    const wrapper = createWrapper()
    
    const content = `
# Test

```mermaid
graph TD
    A --> B
```

More text
    `
    
    const result = wrapper.vm.extractMermaidBlocks(content)
    
    expect(result.content).toContain('<!-- MERMAID_PLACEHOLDER_0 -->')
    expect(result.mermaidBlocks).toHaveLength(1)
    expect(result.mermaidBlocks[0]).toBe('graph TD\n    A --> B')
  })

  it('extracts multiple mermaid blocks correctly', () => {
    const wrapper = createWrapper()
    
    const content = `
```mermaid
graph TD
    A --> B
```

Text between

```mermaid
sequenceDiagram
    A->>B: Hello
```
    `
    
    const result = wrapper.vm.extractMermaidBlocks(content)
    
    expect(result.mermaidBlocks).toHaveLength(2)
    expect(result.mermaidBlocks[0]).toBe('graph TD\n    A --> B')
    expect(result.mermaidBlocks[1]).toBe('sequenceDiagram\n    A->>B: Hello')
  })

  it('handles empty mermaid blocks', () => {
    const wrapper = createWrapper()
    
    const content = `
```mermaid

```
    `
    
    const result = wrapper.vm.extractMermaidBlocks(content)
    
    expect(result.mermaidBlocks).toHaveLength(0)
  })

  it('configures marked options correctly', () => {
    const wrapper = createWrapper()
    const { marked } = require('marked')
    
    wrapper.vm.configureMarked()
    
    expect(marked.setOptions).toHaveBeenCalledWith({
      gfm: true,
      tables: true,
      breaks: true,
      highlight: expect.any(Function),
      renderer: expect.any(Object)
    })
  })

  it('creates custom renderer correctly', () => {
    const wrapper = createWrapper()
    
    const renderer = wrapper.vm.createCustomRenderer()
    
    expect(renderer).toBeDefined()
    expect(typeof renderer.heading).toBe('function')
    expect(typeof renderer.paragraph).toBe('function')
    expect(typeof renderer.list).toBe('function')
    expect(typeof renderer.listitem).toBe('function')
    expect(typeof renderer.code).toBe('function')
    expect(typeof renderer.codespan).toBe('function')
    expect(typeof renderer.table).toBe('function')
    expect(typeof renderer.link).toBe('function')
    expect(typeof renderer.strong).toBe('function')
    expect(typeof renderer.em).toBe('function')
    expect(typeof renderer.blockquote).toBe('function')
  })

  it('renders markdown content correctly', async () => {
    const wrapper = createWrapper({ content: '# Test Header\n\nThis is a test paragraph.' })
    const { marked } = require('marked')
    
    marked.parse.mockReturnValue('<h1>Test Header</h1><p>This is a test paragraph.</p>')
    
    await nextTick()
    
    expect(wrapper.vm.renderedContent).toBe('<h1>Test Header</h1><p>This is a test paragraph.</p>')
  })

  it('handles markdown rendering errors', async () => {
    const wrapper = createWrapper({ content: '# Test' })
    const { marked } = require('marked')
    
    marked.parse.mockImplementation(() => {
      throw new Error('Rendering error')
    })
    
    await nextTick()
    
    expect(wrapper.vm.renderedContent).toContain('Markdown渲染失败: Rendering error')
  })

  it('sets up copy code functionality', () => {
    const wrapper = createWrapper()
    
    wrapper.vm.setupCopyCode()
    
    expect(window.copyCode).toBeDefined()
    expect(typeof window.copyCode).toBe('function')
  })

  it('copies code using clipboard API', async () => {
    const wrapper = createWrapper()
    
    const mockButton = {
      dataset: { code: encodeURIComponent('test code') },
      textContent: '📋 复制'
    }
    
    await wrapper.vm.copyCode(mockButton)
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test code')
    expect(mockButton.textContent).toBe('✅ 已复制')
  })

  it('falls back to textarea copy method', async () => {
    const wrapper = createWrapper()
    
    // Mock clipboard API failure
    navigator.clipboard.writeText = vi.fn().mockRejectedValue(new Error('Clipboard error'))
    
    const mockButton = {
      dataset: { code: encodeURIComponent('test code') },
      textContent: '📋 复制'
    }
    
    // Mock document methods
    const mockTextArea = {
      value: '',
      focus: vi.fn(),
      select: vi.fn()
    }
    
    const mockCreateElement = vi.fn().mockReturnValue(mockTextArea)
    const mockAppendChild = vi.fn()
    const mockRemoveChild = vi.fn()
    const mockExecCommand = vi.fn().mockReturnValue(true)
    
    document.createElement = mockCreateElement
    document.body.appendChild = mockAppendChild
    document.body.removeChild = mockRemoveChild
    document.execCommand = mockExecCommand
    
    await wrapper.vm.copyCode(mockButton)
    
    expect(mockCreateElement).toHaveBeenCalledWith('textarea')
    expect(mockTextArea.value).toBe('test code')
    expect(mockTextArea.focus).toHaveBeenCalled()
    expect(mockTextArea.select).toHaveBeenCalled()
    expect(mockExecCommand).toHaveBeenCalledWith('copy')
    expect(mockRemoveChild).toHaveBeenCalledWith(mockTextArea)
  })

  it('beautifies HTML correctly', () => {
    const wrapper = createWrapper()
    
    const html = '<pre><code class="language-javascript">console.log("Hello");</code></pre>'
    const beautified = wrapper.vm.beautifyHtml(html)
    
    expect(beautified).toContain('<div class="code-block-container">')
    expect(beautified).toContain('<button class="copy-code-btn"')
    expect(beautified).toContain('console.log("Hello");')
  })

  it('wraps tables in container', () => {
    const wrapper = createWrapper()
    
    const html = '<table><tr><td>Test</td></tr></table>'
    const beautified = wrapper.vm.beautifyHtml(html)
    
    expect(beautified).toContain('<div class="table-container">')
    expect(beautified).toContain('<table>')
    expect(beautified).toContain('</table>')
    expect(beautified).toContain('</div>')
  })

  it('renders mermaid components', () => {
    const wrapper = createWrapper({
      content: `
```mermaid
graph TD
    A --> B
```
      `
    })
    
    wrapper.setData({ mermaidBlocks: ['graph TD\n    A --> B'] })
    
    const mermaidComponents = wrapper.findAllComponents(MermaidRenderer)
    expect(mermaidComponents).toHaveLength(1)
    expect(mermaidComponents[0].props('mermaidCode')).toBe('graph TD\n    A --> B')
  })

  it('passes correct props to mermaid components', () => {
    const wrapper = createWrapper({
      content: `
```mermaid
graph TD
    A --> B
```
      `,
      isDark: true,
      isMobile: false
    })
    
    wrapper.setData({ mermaidBlocks: ['graph TD\n    A --> B'] })
    
    const mermaidComponent = wrapper.findComponent(MermaidRenderer)
    expect(mermaidComponent.props('isDark')).toBe(true)
    expect(mermaidComponent.props('isMobile')).toBe(false)
  })

  it('watches content changes', async () => {
    const wrapper = createWrapper({ content: '# Initial' })
    
    await wrapper.setProps({ content: '# Updated' })
    
    expect(wrapper.vm.renderedContent).toBeDefined()
  })

  it('watches theme changes', async () => {
    const wrapper = createWrapper({ isDark: false })
    
    await wrapper.setProps({ isDark: true })
    
    expect(wrapper.vm.renderedContent).toBeDefined()
  })

  it('cleans up mermaid placeholders', async () => {
    const wrapper = createWrapper()
    const { marked } = require('marked')
    
    marked.parse.mockReturnValue('Content <!-- MERMAID_PLACEHOLDER_0 --> More content')
    
    await nextTick()
    
    expect(wrapper.vm.renderedContent).not.toContain('<!-- MERMAID_PLACEHOLDER_0 -->')
  })

  it('applies CSS classes correctly', () => {
    const wrapper = createWrapper()
    
    expect(wrapper.find('.markdown-renderer').classes()).toContain('word-wrap-break-word')
    expect(wrapper.find('.markdown-renderer').classes()).toContain('overflow-wrap-break-word')
    expect(wrapper.find('.markdown-renderer').classes()).toContain('line-height-1.6')
  })

  it('handles mobile optimization', () => {
    const wrapper = createWrapper({ isMobile: true })
    
    expect(wrapper.classes()).toContain('mobile-optimized-true')
  })

  it('handles dark theme optimization', () => {
    const wrapper = createWrapper({ isDark: true })
    
    expect(wrapper.classes()).toContain('dark-theme-true')
  })
})