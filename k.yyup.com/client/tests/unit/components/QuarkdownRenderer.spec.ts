import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import QuarkdownRenderer from '@/components/QuarkdownRenderer.vue'

// Mock marked library
vi.mock('marked', () => ({
  marked: {
    parse: vi.fn((content) => `<p>${content}</p>`),
    setOptions: vi.fn()
  }
}))

describe('QuarkdownRenderer.vue', () => {
  let wrapper: any
  let pinia: any

  const mockContent = `
# Hello World

.center {This is centered text}

.highlight {Important text}

.card {Card Title}
Card content

.alert {warning} {This is a warning}
  `

  const mockVariables = {
    title: 'Test Document',
    author: 'Test Author'
  }

  const mockFunctions = {
    customFunction: vi.fn((content) => `<custom>${content}</custom>`)
  }

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    wrapper = mount(QuarkdownRenderer, {
      props: {
        content: mockContent,
        isDark: false,
        variables: mockVariables,
        functions: mockFunctions
      },
      global: {
        plugins: [pinia]
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.clearAllMocks()
  })

  it('renders correctly with default props', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.quarkdown-renderer').exists()).toBe(true)
    expect(wrapper.find('.quarkdown-content').exists()).toBe(true)
  })

  it('applies dark mode class when isDark is true', async () => {
    await wrapper.setProps({ isDark: true })
    expect(wrapper.find('.quarkdown-renderer').classes()).toContain('dark-mode')
  })

  it('removes dark mode class when isDark is false', async () => {
    await wrapper.setProps({ isDark: true })
    await wrapper.setProps({ isDark: false })
    expect(wrapper.find('.quarkdown-renderer').classes()).not.toContain('dark-mode')
  })

  it('has correct builtin variables', () => {
    expect(wrapper.vm.builtinVariables.value).toEqual({
      author: 'Quarkdown User',
      date: expect.any(String),
      version: '1.0.0',
      title: 'Quarkdown Document'
    })
  })

  it('has correct builtin functions', () => {
    const functions = wrapper.vm.builtinFunctions.value
    expect(functions.center).toBeDefined()
    expect(functions.row).toBeDefined()
    expect(functions.column).toBeDefined()
    expect(functions.highlight).toBeDefined()
    expect(functions.badge).toBeDefined()
    expect(functions.alert).toBeDefined()
    expect(functions.card).toBeDefined()
    expect(functions.grid).toBeDefined()
    expect(functions.timeline).toBeDefined()
  })

  it('centers content correctly', () => {
    const result = wrapper.vm.builtinFunctions.value.center('Test Content')
    expect(result).toBe('<div class="qd-center">Test Content</div>')
  })

  it('creates row layout with default alignment', () => {
    const result = wrapper.vm.builtinFunctions.value.row('Content')
    expect(result).toBe('<div class="qd-row qd-align-start">Content</div>')
  })

  it('creates row layout with custom alignment', () => {
    const result = wrapper.vm.builtinFunctions.value.row('Content', 'center')
    expect(result).toBe('<div class="qd-row qd-align-center">Content</div>')
  })

  it('creates column layout', () => {
    const result = wrapper.vm.builtinFunctions.value.column('Content')
    expect(result).toBe('<div class="qd-column">Content</div>')
  })

  it('highlights text with default color', () => {
    const result = wrapper.vm.builtinFunctions.value.highlight('Text')
    expect(result).toBe('<span class="qd-highlight qd-highlight-yellow">Text</span>')
  })

  it('highlights text with custom color', () => {
    const result = wrapper.vm.builtinFunctions.value.highlight('Text', 'blue')
    expect(result).toBe('<span class="qd-highlight qd-highlight-blue">Text</span>')
  })

  it('creates badge with default type', () => {
    const result = wrapper.vm.builtinFunctions.value.badge('Label')
    expect(result).toBe('<span class="qd-badge qd-badge-info">Label</span>')
  })

  it('creates badge with custom type', () => {
    const result = wrapper.vm.builtinFunctions.value.badge('Label', 'success')
    expect(result).toBe('<span class="qd-badge qd-badge-success">Label</span>')
  })

  it('creates alert with default type', () => {
    const result = wrapper.vm.builtinFunctions.value.alert('Content')
    expect(result).toContain('<div class="qd-alert qd-alert-info">')
    expect(result).toContain('<div class="qd-alert-icon">💡</div>')
    expect(result).toContain('<div class="qd-alert-content">Content</div>')
  })

  it('creates alert with custom type', () => {
    const result = wrapper.vm.builtinFunctions.value.alert('Content', 'error')
    expect(result).toContain('<div class="qd-alert qd-alert-error">')
    expect(result).toContain('<div class="qd-alert-icon">❌</div>')
  })

  it('creates card without title', () => {
    const result = wrapper.vm.builtinFunctions.value.card('Content')
    expect(result).toBe('<div class="qd-card"><div class="qd-card-body">Content</div></div>')
  })

  it('creates card with title', () => {
    const result = wrapper.vm.builtinFunctions.value.card('Content', 'Title')
    expect(result).toContain('<div class="qd-card">')
    expect(result).toContain('<div class="qd-card-header">Title</div>')
    expect(result).toContain('<div class="qd-card-body">Content</div>')
  })

  it('creates grid with default columns', () => {
    const result = wrapper.vm.builtinFunctions.value.grid('Content')
    expect(result).toBe('<div class="qd-grid qd-grid-2">Content</div>')
  })

  it('creates grid with custom columns', () => {
    const result = wrapper.vm.builtinFunctions.value.grid('Content', 3)
    expect(result).toBe('<div class="qd-grid qd-grid-3">Content</div>')
  })

  it('creates timeline from items', () => {
    const items = ['Item 1', 'Item 2', 'Item 3']
    const result = wrapper.vm.builtinFunctions.value.timeline(items)
    expect(result).toContain('<div class="qd-timeline">')
    expect(result).toContain('<div class="qd-timeline-item">')
    expect(result).toContain('<div class="qd-timeline-marker"></div>')
    expect(result).toContain('<div class="qd-timeline-content">Item 1</div>')
  })

  it('returns correct alert icons', () => {
    expect(wrapper.vm.getAlertIcon('info')).toBe('💡')
    expect(wrapper.vm.getAlertIcon('warning')).toBe('⚠️')
    expect(wrapper.vm.getAlertIcon('error')).toBe('❌')
    expect(wrapper.vm.getAlertIcon('success')).toBe('✅')
    expect(wrapper.vm.getAlertIcon('unknown')).toBe('💡') // default
  })

  it('parses quarkdown functions correctly', () => {
    const content = '.center {Centered Text}'
    const result = wrapper.vm.parseQuarkdownFunctions(content)
    expect(result).toBe('<div class="qd-center">Centered Text</div>')
  })

  it('parses quarkdown functions with multiple arguments', () => {
    const content = '.highlight {Text} {blue}'
    const result = wrapper.vm.parseQuarkdownFunctions(content)
    expect(result).toBe('<span class="qd-highlight qd-highlight-blue">Text</span>')
  })

  it('handles unknown functions gracefully', () => {
    const content = '.unknown {Text}'
    const result = wrapper.vm.parseQuarkdownFunctions(content)
    expect(result).toBe(content) // returns original content
  })

  it('handles function errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    // Mock a function that throws error
    wrapper.vm.builtinFunctions.value.errorFunction = vi.fn(() => {
      throw new Error('Function error')
    })
    
    const content = '.errorFunction {Text}'
    const result = wrapper.vm.parseQuarkdownFunctions(content)
    
    expect(result).toBe('<span class="qd-error">Function error: errorFunction</span>')
    expect(consoleSpy).toHaveBeenCalledWith('Quarkdown function error: errorFunction', expect.any(Error))
    
    consoleSpy.mockRestore()
  })

  it('parses variables correctly', () => {
    const content = 'Title: .title'
    const result = wrapper.vm.parseVariables(content)
    expect(result).toBe('Title: Quarkdown Document')
  })

  it('parses custom variables correctly', () => {
    const content = 'Author: .author'
    const result = wrapper.vm.parseVariables(content)
    expect(result).toBe('Author: Test Author')
  })

  it('handles unknown variables gracefully', () => {
    const content = 'Unknown: .unknown'
    const result = wrapper.vm.parseVariables(content)
    expect(result).toBe(content) // returns original content
  })

  it('parses block functions correctly', () => {
    const content = `.card {Title}
Card content`
    const result = wrapper.vm.parseBlockFunctions(content)
    expect(result).toContain('<div class="qd-card">')
    expect(result).toContain('<div class="qd-card-header">Title</div>')
    expect(result).toContain('<div class="qd-card-body">Card content</div>')
  })

  it('handles block function errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    // Mock a function that throws error
    wrapper.vm.builtinFunctions.value.errorFunction = vi.fn(() => {
      throw new Error('Block function error')
    })
    
    const content = `.errorFunction {Title}
Error content`
    const result = wrapper.vm.parseBlockFunctions(content)
    
    expect(result).toBe('<span class="qd-error">Block function error: errorFunction</span>')
    expect(consoleSpy).toHaveBeenCalledWith('Quarkdown block function error: errorFunction', expect.any(Error))
    
    consoleSpy.mockRestore()
  })

  it('renders content using marked', () => {
    const { marked } = require('marked')
    wrapper.vm.renderedContent.value
    
    expect(marked.parse).toHaveBeenCalled()
    expect(marked.setOptions).toHaveBeenCalledWith({
      gfm: true,
      breaks: true,
      headerIds: false,
      mangle: false
    })
  })

  it('handles rendering errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Mock marked to throw error
    const { marked } = require('marked')
    marked.parse.mockImplementationOnce(() => {
      throw new Error('Rendering error')
    })
    
    const result = wrapper.vm.renderedContent.value
    expect(result).toBe('<p class="qd-error">Rendering error: Rendering error</p>')
    expect(consoleSpy).toHaveBeenCalledWith('Quarkdown rendering error:', expect.any(Error))
    
    consoleSpy.mockRestore()
  })

  it('returns empty string for empty content', () => {
    wrapper = mount(QuarkdownRenderer, {
      props: {
        content: '',
        isDark: false
      },
      global: {
        plugins: [pinia]
      }
    })
    
    expect(wrapper.vm.renderedContent.value).toBe('')
  })

  it('processes content in correct order', () => {
    const content = `
.title
.center {.title}
.highlight {Important}
    `
    
    const result = wrapper.vm.renderedContent.value
    
    // The result should be processed in order:
    // 1. Block functions
    // 2. Inline functions  
    // 3. Variables
    // 4. Markdown
    
    expect(result).toContain('Quarkdown Document') // variable replacement
    expect(result).toContain('qd-center') // center function
    expect(result).toContain('qd-highlight') // highlight function
  })

  it('combines builtin and custom functions', () => {
    const content = '.customFunction {Custom Content}'
    const result = wrapper.vm.parseQuarkdownFunctions(content)
    expect(result).toBe('<custom>Custom Content</custom>')
    expect(mockFunctions.customFunction).toHaveBeenCalledWith('Custom Content')
  })

  it('combines builtin and custom variables', () => {
    const content = 'Author: .author'
    const result = wrapper.vm.parseVariables(content)
    expect(result).toBe('Author: Test Author')
  })

  it('updates rendered content when content prop changes', async () => {
    const newContent = '# New Content'
    await wrapper.setProps({ content: newContent })
    
    const { marked } = require('marked')
    expect(marked.parse).toHaveBeenCalledWith(newContent)
  })

  it('updates rendered content when variables prop changes', async () => {
    const newVariables = { title: 'New Title' }
    await wrapper.setProps({ variables: newVariables })
    
    const content = '.title'
    const result = wrapper.vm.parseVariables(content)
    expect(result).toBe('New Title')
  })

  it('updates rendered content when functions prop changes', async () => {
    const newFunctions = { newFunction: vi.fn((content) => `<new>${content}</new>`) }
    await wrapper.setProps({ functions: newFunctions })
    
    const content = '.newFunction {Test}'
    const result = wrapper.vm.parseQuarkdownFunctions(content)
    expect(result).toBe('<new>Test</new>')
  })

  it('has correct CSS classes applied', () => {
    const renderer = wrapper.find('.quarkdown-renderer')
    expect(renderer.classes()).not.toContain('dark-mode')
    
    const content = wrapper.find('.quarkdown-content')
    expect(content.exists()).toBe(true)
  })
})