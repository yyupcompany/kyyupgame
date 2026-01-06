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
import GlobalLoading from '@/components/common/GlobalLoading.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

// Mock loading manager
vi.mock('@/utils/loadingManager', () => ({
  loadingManager: {
    getVisibleItems: vi.fn()
  }
}))

describe('GlobalLoading.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const createWrapper = () => {
    return mount(GlobalLoading, {
      global: {
        stubs: {
          'loading-spinner': LoadingSpinner,
          'teleport': {
            template: '<div><slot /></div>'
          }
        }
      }
    })
  }

  it('renders properly', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.global-loading-container').exists()).toBe(true)
  })

  it('does not show loading when no visible items', () => {
    const { loadingManager } = require('@/utils/loadingManager')
    loadingManager.getVisibleItems.mockReturnValue([])
    
    const wrapper = createWrapper()
    
    expect(wrapper.vm.hasVisibleLoading).toBe(false)
    expect(wrapper.find('.global-loading-item').exists()).toBe(false)
  })

  it('shows loading when there are visible items', () => {
    const { loadingManager } = require('@/utils/loadingManager')
    loadingManager.getVisibleItems.mockReturnValue([
      {
        id: '1',
        config: { overlay: true, zIndex: 1000 },
        startTime: Date.now()
      }
    ])
    
    const wrapper = createWrapper()
    
    expect(wrapper.vm.hasVisibleLoading).toBe(true)
    expect(wrapper.find('.global-loading-item').exists()).toBe(true)
  })

  it('computes visible loading items correctly', () => {
    const { loadingManager } = require('@/utils/loadingManager')
    const mockItems = [
      {
        id: '1',
        config: { overlay: true, zIndex: 1000 },
        startTime: Date.now()
      },
      {
        id: '2',
        config: { overlay: false, zIndex: 999 },
        startTime: Date.now()
      }
    ]
    
    loadingManager.getVisibleItems.mockReturnValue(mockItems)
    
    const wrapper = createWrapper()
    
    expect(wrapper.vm.visibleLoadingItems).toHaveLength(2)
    expect(wrapper.vm.visibleLoadingItems[0]).toEqual({
      ...mockItems[0],
      progress: expect.any(Number)
    })
    expect(wrapper.vm.visibleLoadingItems[1]).toEqual({
      ...mockItems[1],
      progress: expect.any(Number)
    })
  })

  it('computes progress for progress type items', () => {
    const { loadingManager } = require('@/utils/loadingManager')
    const startTime = Date.now()
    const mockItem = {
      id: '1',
      config: { type: 'progress', timeout: 5000 },
      startTime
    }
    
    loadingManager.getVisibleItems.mockReturnValue([mockItem])
    
    const wrapper = createWrapper()
    
    const elapsed = Date.now() - startTime
    const expectedProgress = Math.min((elapsed / 5000) * 100, 100)
    
    expect(wrapper.vm.visibleLoadingItems[0].progress).toBeCloseTo(expectedProgress, 0)
  })

  it('does not compute progress for non-progress type items', () => {
    const { loadingManager } = require('@/utils/loadingManager')
    const mockItem = {
      id: '1',
      config: { type: 'spinner', timeout: 5000 },
      startTime: Date.now()
    }
    
    loadingManager.getVisibleItems.mockReturnValue([mockItem])
    
    const wrapper = createWrapper()
    
    expect(wrapper.vm.visibleLoadingItems[0].progress).toBe(0)
  })

  it('applies overlay class when overlay is true', () => {
    const { loadingManager } = require('@/utils/loadingManager')
    loadingManager.getVisibleItems.mockReturnValue([
      {
        id: '1',
        config: { overlay: true },
        startTime: Date.now()
      }
    ])
    
    const wrapper = createWrapper()
    
    expect(wrapper.find('.global-loading-item--overlay').exists()).toBe(true)
  })

  it('does not apply overlay class when overlay is false', () => {
    const { loadingManager } = require('@/utils/loadingManager')
    loadingManager.getVisibleItems.mockReturnValue([
      {
        id: '1',
        config: { overlay: false },
        startTime: Date.now()
      }
    ])
    
    const wrapper = createWrapper()
    
    expect(wrapper.find('.global-loading-item--overlay').exists()).toBe(false)
  })

  it('applies correct styles to loading items', () => {
    const { loadingManager } = require('@/utils/loadingManager')
    loadingManager.getVisibleItems.mockReturnValue([
      {
        id: '1',
        config: { overlay: true, zIndex: 1000, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
        startTime: Date.now()
      }
    ])
    
    const wrapper = createWrapper()
    
    const style = wrapper.vm.getItemStyle({
      config: { overlay: true, zIndex: 1000, backgroundColor: 'rgba(0, 0, 0, 0.5)' }
    })
    
    expect(style).toEqual({
      zIndex: 1000,
      backgroundColor: 'rgba(0, 0, 0, 0.5)'
    })
  })

  it('handles keyboard events for ESC key', () => {
    const { loadingManager } = require('@/utils/loadingManager')
    const mockItem = {
      id: '1',
      config: { overlay: true, cancelable: true, onCancel: vi.fn() },
      startTime: Date.now()
    }
    
    loadingManager.getVisibleItems.mockReturnValue([mockItem])
    
    const wrapper = createWrapper()
    
    // Simulate ESC key press
    const event = new KeyboardEvent('keydown', { key: 'Escape' })
    wrapper.vm.handleKeydown(event)
    
    expect(mockItem.config.onCancel).toHaveBeenCalled()
  })

  it('does not handle ESC key when no cancelable items', () => {
    const { loadingManager } = require('@/utils/loadingManager')
    const mockItem = {
      id: '1',
      config: { overlay: true, cancelable: false },
      startTime: Date.now()
    }
    
    loadingManager.getVisibleItems.mockReturnValue([mockItem])
    
    const wrapper = createWrapper()
    
    // Simulate ESC key press
    const event = new KeyboardEvent('keydown', { key: 'Escape' })
    wrapper.vm.handleKeydown(event)
    
    // Should not throw error
    expect(() => wrapper.vm.handleKeydown(event)).not.toThrow()
  })

  it('adds and removes keyboard event listeners', () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener')
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
    
    const wrapper = createWrapper()
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    
    wrapper.unmount()
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
  })

  it('renders LoadingSpinner components correctly', () => {
    const { loadingManager } = require('@/utils/loadingManager')
    const mockItems = [
      {
        id: '1',
        config: { type: 'spinner', size: 'large', text: 'Loading...' },
        startTime: Date.now()
      }
    ]
    
    loadingManager.getVisibleItems.mockReturnValue(mockItems)
    
    const wrapper = createWrapper()
    
    const spinner = wrapper.findComponent(LoadingSpinner)
    expect(spinner.exists()).toBe(true)
    expect(spinner.props('type')).toBe('spinner')
    expect(spinner.props('size')).toBe('large')
    expect(spinner.props('text')).toBe('Loading...')
  })

  it('handles multiple loading items', () => {
    const { loadingManager } = require('@/utils/loadingManager')
    const mockItems = [
      {
        id: '1',
        config: { type: 'spinner', overlay: true },
        startTime: Date.now()
      },
      {
        id: '2',
        config: { type: 'dots', overlay: false },
        startTime: Date.now()
      }
    ]
    
    loadingManager.getVisibleItems.mockReturnValue(mockItems)
    
    const wrapper = createWrapper()
    
    const items = wrapper.findAll('.global-loading-item')
    expect(items.length).toBe(2)
    
    expect(items[0].classes()).toContain('global-loading-item--overlay')
    expect(items[1].classes()).not.toContain('global-loading-item--overlay')
  })

  it('applies fade animation classes', () => {
    const wrapper = createWrapper()
    
    expect(wrapper.find('.loading-fade-enter-active').exists()).toBe(false)
    expect(wrapper.find('.loading-fade-leave-active').exists()).toBe(false)
  })

  it('has correct container positioning', () => {
    const wrapper = createWrapper()
    const container = wrapper.find('.global-loading-container')
    
    expect(container.classes()).toContain('position-fixed')
    expect(container.classes()).toContain('top-0')
    expect(container.classes()).toContain('left-0')
    expect(container.classes()).toContain('right-0')
    expect(container.classes()).toContain('bottom-0')
    expect(container.classes()).toContain('pointer-events-none')
  })
})