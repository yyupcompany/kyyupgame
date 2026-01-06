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
import MermaidRenderer from '@/components/common/MermaidRenderer.vue'

// Mock mermaid library
const mockMermaid = {
  initialize: vi.fn(),
  render: vi.fn()
}

describe('MermaidRenderer.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    
    // Mock window.mermaid
    Object.defineProperty(window, 'mermaid', {
      value: mockMermaid,
      writable: true
    })
    
    // Mock document methods
    Object.defineProperty(document, 'createElement', {
      value: vi.fn().mockImplementation((tagName) => {
        if (tagName === 'script') {
          return {
            src: '',
            async: true,
            onload: vi.fn(),
            onerror: vi.fn()
          }
        }
        return {}
      }),
      writable: true
    })
    
    Object.defineProperty(document, 'head', {
      value: {
        appendChild: vi.fn()
      },
      writable: true
    })
    
    // Mock document fullscreen methods
    Object.defineProperty(document.documentElement, 'requestFullscreen', {
      value: vi.fn(),
      writable: true
    })
    
    Object.defineProperty(document, 'exitFullscreen', {
      value: vi.fn(),
      writable: true
    })
    
    // Mock SVG element
    const mockSvgElement = {
      getBBox: vi.fn().mockReturnValue({ width: 400, height: 300 }),
      setAttribute: vi.fn(),
      style: {}
    }
    
    vi.spyOn(document, 'querySelector').mockImplementation((selector) => {
      if (selector === 'svg') {
        return mockSvgElement
      }
      return null
    })
  })

  const createWrapper = (props = {}) => {
    return mount(MermaidRenderer, {
      props: {
        mermaidCode: 'graph TD\n    A --> B',
        isDark: false,
        isMobile: false,
        theme: 'default',
        width: '100%',
        height: 'auto',
        maxHeight: '100px',
        allowFullscreen: true,
        ...props
      }
    })
  }

  it('renders properly with default props', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.mermaid-renderer').exists()).toBe(true)
  })

  it('shows error state when error exists', () => {
    const wrapper = createWrapper()
    
    wrapper.setData({ error: 'Test error' })
    
    expect(wrapper.find('.mermaid-error').exists()).toBe(true)
    expect(wrapper.find('.error-message').text()).toBe('Test error')
  })

  it('shows mermaid wrapper when no error', () => {
    const wrapper = createWrapper()
    
    wrapper.setData({ error: '' })
    
    expect(wrapper.find('.mermaid-wrapper').exists()).toBe(true)
    expect(wrapper.find('.mermaid-error').exists()).toBe(false)
  })

  it('loads mermaid library dynamically', async () => {
    const wrapper = createWrapper()
    
    // Clear window.mermaid to test dynamic loading
    delete (window as any).mermaid
    
    await wrapper.vm.ensureMermaidLoaded()
    
    expect(document.createElement).toHaveBeenCalledWith('script')
    expect(document.head.appendChild).toHaveBeenCalled()
  })

  it('uses existing mermaid library if available', async () => {
    const wrapper = createWrapper()
    
    await wrapper.vm.ensureMermaidLoaded()
    
    expect(document.createElement).not.toHaveBeenCalled()
    expect(document.head.appendChild).not.toHaveBeenCalled()
  })

  it('initializes mermaid correctly', async () => {
    const wrapper = createWrapper()
    
    await wrapper.vm.initializeMermaid()
    
    expect(mockMermaid.initialize).toHaveBeenCalledWith({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      fontSize: 14,
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
        padding: 20
      },
      sequence: {
        useMaxWidth: true,
        wrap: true,
        width: 300
      },
      gantt: {
        useMaxWidth: true,
        fontSize: 12
      },
      pie: {
        useMaxWidth: true
      },
      journey: {
        useMaxWidth: true
      },
      timeline: {
        useMaxWidth: true
      }
    })
  })

  it('initializes mermaid with dark theme', async () => {
    const wrapper = createWrapper({ isDark: true })
    
    await wrapper.vm.initializeMermaid()
    
    expect(mockMermaid.initialize).toHaveBeenCalledWith(
      expect.objectContaining({
        theme: 'dark'
      })
    )
  })

  it('initializes mermaid with mobile settings', async () => {
    const wrapper = createWrapper({ isMobile: true })
    
    await wrapper.vm.initializeMermaid()
    
    expect(mockMermaid.initialize).toHaveBeenCalledWith(
      expect.objectContaining({
        fontSize: 12,
        flowchart: expect.objectContaining({
          padding: 10
        }),
        sequence: expect.objectContaining({
          width: 200
        }),
        gantt: expect.objectContaining({
          fontSize: 10
        })
      })
    )
  })

  it('renders mermaid diagram successfully', async () => {
    const wrapper = createWrapper()
    
    mockMermaid.render.mockResolvedValue({
      svg: '<svg>Test Diagram</svg>'
    })
    
    await wrapper.vm.renderMermaid()
    
    expect(mockMermaid.render).toHaveBeenCalledWith(
      expect.stringMatching(/mermaid-\d+-\w+/),
      'graph TD\n    A --> B'
    )
    
    expect(wrapper.vm.error).toBe('')
  })

  it('handles mermaid rendering errors', async () => {
    const wrapper = createWrapper()
    
    mockMermaid.render.mockRejectedValue(new Error('Parse error'))
    
    await wrapper.vm.renderMermaid()
    
    expect(wrapper.vm.error).toBe('Parse error')
  })

  it('handles empty mermaid code', async () => {
    const wrapper = createWrapper({ mermaidCode: '' })
    
    await wrapper.vm.renderMermaid()
    
    expect(wrapper.vm.error).toBe('Mermaid代码为空')
  })

  it('validates mermaid code format', async () => {
    const wrapper = createWrapper({ mermaidCode: '   ' })
    
    await wrapper.vm.renderMermaid()
    
    expect(wrapper.vm.error).toBe('Mermaid代码为空')
  })

  it('provides user-friendly error messages', async () => {
    const wrapper = createWrapper()
    
    mockMermaid.render.mockRejectedValue(new Error('Parse error on line 1'))
    
    await wrapper.vm.renderMermaid()
    
    expect(wrapper.vm.error).toBe('流程图语法错误，请检查代码格式')
  })

  it('handles lexical errors', async () => {
    const wrapper = createWrapper()
    
    mockMermaid.render.mockRejectedValue(new Error('Lexical error on line 1'))
    
    await wrapper.vm.renderMermaid()
    
    expect(wrapper.vm.error).toBe('流程图词法错误，请检查关键字拼写')
  })

  it('toggles code view correctly', async () => {
    const wrapper = createWrapper()
    
    expect(wrapper.vm.isCodeView).toBe(false)
    expect(wrapper.find('.code-view').exists()).toBe(false)
    
    wrapper.vm.toggleExpanded()
    await nextTick()
    
    expect(wrapper.vm.isCodeView).toBe(false)
    
    wrapper.setData({ isCodeView: true })
    await nextTick()
    
    expect(wrapper.find('.code-view').exists()).toBe(true)
  })

  it('handles zoom controls correctly', () => {
    const wrapper = createWrapper()
    
    wrapper.vm.zoomIn()
    expect(wrapper.vm.zoom).toBe(0.5)
    
    wrapper.vm.zoomOut()
    expect(wrapper.vm.zoom).toBe(0.4)
    
    wrapper.vm.fitToWidth()
    expect(wrapper.vm.zoom).toBeLessThanOrEqual(1)
  })

  it('handles zoom limits correctly', () => {
    const wrapper = createWrapper()
    
    // Test max zoom
    wrapper.setData({ zoom: 2.4 })
    wrapper.vm.zoomIn()
    expect(wrapper.vm.zoom).toBe(2.5)
    
    wrapper.vm.zoomIn()
    expect(wrapper.vm.zoom).toBe(2.5) // Should not exceed max
    
    // Test min zoom
    wrapper.setData({ zoom: 0.3 })
    wrapper.vm.zoomOut()
    expect(wrapper.vm.zoom).toBe(0.2)
    
    wrapper.vm.zoomOut()
    expect(wrapper.vm.zoom).toBe(0.2) // Should not go below min
  })

  it('handles mouse events for panning', () => {
    const wrapper = createWrapper()
    
    const mockEvent = {
      clientX: 100,
      clientY: 100,
      preventDefault: vi.fn()
    }
    
    wrapper.vm.onMouseDown(mockEvent)
    expect(wrapper.vm.isPanning).toBe(true)
    expect(wrapper.vm.lastX).toBe(100)
    expect(wrapper.vm.lastY).toBe(100)
    
    wrapper.vm.onMouseMove({ clientX: 150, clientY: 150 })
    expect(wrapper.vm.panX).toBe(50)
    expect(wrapper.vm.panY).toBe(50)
    
    wrapper.vm.onMouseUp()
    expect(wrapper.vm.isPanning).toBe(false)
  })

  it('handles wheel events for zooming', () => {
    const wrapper = createWrapper()
    
    const mockEvent = {
      deltaY: -100,
      preventDefault: vi.fn()
    }
    
    wrapper.setData({ zoom: 1 })
    wrapper.vm.onWheel(mockEvent)
    
    expect(wrapper.vm.zoom).toBeGreaterThan(1)
    expect(mockEvent.preventDefault).toHaveBeenCalled()
  })

  it('toggles fullscreen correctly', async () => {
    const wrapper = createWrapper()
    
    expect(wrapper.vm.isFullscreen).toBe(false)
    
    wrapper.vm.toggleFullscreen()
    
    expect(wrapper.vm.isFullscreen).toBe(true)
    expect(document.documentElement.requestFullscreen).toHaveBeenCalled()
  })

  it('exits fullscreen correctly', async () => {
    const wrapper = createWrapper()
    
    wrapper.setData({ isFullscreen: true })
    
    wrapper.vm.toggleFullscreen()
    
    expect(wrapper.vm.isFullscreen).toBe(false)
    expect(document.exitFullscreen).toHaveBeenCalled()
  })

  it('watches mermaid code changes', async () => {
    const wrapper = createWrapper()
    
    const renderSpy = vi.spyOn(wrapper.vm, 'renderMermaid')
    
    await wrapper.setProps({ mermaidCode: 'graph LR\n    C --> D' })
    
    expect(renderSpy).toHaveBeenCalled()
  })

  it('watches theme changes', async () => {
    const wrapper = createWrapper()
    
    await wrapper.setProps({ isDark: true })
    
    expect(wrapper.vm.isInitialized).toBe(false)
  })

  it('renders on mount', async () => {
    const renderSpy = vi.spyOn(MermaidRenderer.methods.renderMermaid as any, 'call')
    
    const wrapper = createWrapper()
    
    await nextTick()
    
    expect(renderSpy).toHaveBeenCalled()
  })

  it('applies CSS classes correctly', () => {
    const wrapper = createWrapper()
    
    expect(wrapper.find('.mermaid-renderer').classes()).toContain('width-100')
    expect(wrapper.find('.mermaid-renderer').classes()).toContain('margin-16px-0')
  })

  it('handles different themes', () => {
    const themes = ['default', 'dark', 'forest', 'neutral']
    
    themes.forEach(theme => {
      const wrapper = createWrapper({ theme })
      expect(wrapper.vm.theme).toBe(theme)
    })
  })

  it('handles different sizes', () => {
    const wrapper = createWrapper({ width: 500, height: 300 })
    
    expect(wrapper.vm.width).toBe(500)
    expect(wrapper.vm.height).toBe(300)
  })

  it('shows toolbar when allowFullscreen is true', () => {
    const wrapper = createWrapper({ allowFullscreen: true })
    
    expect(wrapper.find('.mermaid-toolbar').exists()).toBe(true)
  })

  it('hides toolbar when allowFullscreen is false', () => {
    const wrapper = createWrapper({ allowFullscreen: false })
    
    expect(wrapper.find('.mermaid-toolbar').exists()).toBe(false)
  })

  it('computes maxHeightCss correctly', () => {
    const wrapper = createWrapper({ maxHeight: '200px' })
    
    expect(wrapper.vm.maxHeightCss).toBe('200px')
    
    const wrapper2 = createWrapper({ maxHeight: 200 })
    
    expect(wrapper2.vm.maxHeightCss).toBe('200px')
  })

  it('cleans up event listeners on unmount', () => {
    const wrapper = createWrapper()
    
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
    
    wrapper.unmount()
    
    expect(removeEventListenerSpy).toHaveBeenCalled()
  })
})