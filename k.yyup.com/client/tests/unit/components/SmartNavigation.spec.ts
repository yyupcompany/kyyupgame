import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SmartNavigation from '@/components/SmartNavigation.vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

// Mock Element Plus
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn()
    },
    ElInput: {
      name: 'ElInput',
      template: '<div class="el-input"><input @input="$emit(\'input\', $event.target.value)" @keyup.enter="$emit(\'keyup.enter\', $event)" /></div>'
    },
    ElButton: {
      name: 'ElButton',
      template: '<button class="el-button" @click="$emit(\'click\')"><slot></slot></button>'
    }
  }
})

// Mock SmartRouterService
vi.mock('@/services/smart-router.service', () => {
  class MockSmartRouterService {
    constructor(router: any) {
      this.router = router
    }
    
    getSuggestions(input: string, limit: number) {
      if (input === '活动') {
        return [
          { id: '1', title: '活动中心', route: '/centers/activity', confidence: 0.9 },
          { id: '2', title: '活动管理', route: '/activity', confidence: 0.7 }
        ]
      }
      return []
    }
    
    async smartNavigate(input: string) {
      if (input === '活动中心') {
        await this.router.push('/centers/activity')
        return true
      }
      return false
    }
  }
  
  return {
    SmartRouterService: MockSmartRouterService,
    RouteMatch: {}
  }
})

describe('SmartNavigation.vue', () => {
  let wrapper: any
  let pinia: any
  let mockRouter: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    mockRouter = {
      push: vi.fn()
    }
    
    // Override the mocked router
    vi.mocked(useRouter).mockReturnValue(mockRouter)
    
    wrapper = mount(SmartNavigation, {
      props: {
        showQuickAccess: true,
        quickAccessCount: 6
      },
      global: {
        plugins: [pinia],
        stubs: {
          'el-input': true,
          'el-button': true
        }
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
    expect(wrapper.find('.smart-navigation').exists()).toBe(true)
    expect(wrapper.find('.navigation-input-wrapper').exists()).toBe(true)
  })

  it('shows quick access section when showQuickAccess is true', () => {
    expect(wrapper.find('.quick-access').exists()).toBe(true)
    expect(wrapper.find('.quick-access-title').exists()).toBe(true)
  })

  it('hides quick access section when showQuickAccess is false', async () => {
    await wrapper.setProps({ showQuickAccess: false })
    expect(wrapper.find('.quick-access').exists()).toBe(false)
  })

  it('has correct quick access pages configuration', () => {
    const quickPages = wrapper.vm.quickAccessPages.value
    expect(quickPages).toHaveLength(6)
    expect(quickPages[0]).toEqual({
      id: 'dashboard',
      title: '工作台',
      route: '/dashboard',
      icon: 'dashboard'
    })
    expect(quickPages[1]).toEqual({
      id: 'activity-center',
      title: '活动中心',
      route: '/centers/activity',
      icon: 'activity'
    })
  })

  it('computes canNavigate correctly', () => {
    expect(wrapper.vm.canNavigate.value).toBe(false) // empty input
    
    wrapper.vm.navigationInput.value = 'test'
    expect(wrapper.vm.canNavigate.value).toBe(true) // has input, not navigating
    
    wrapper.vm.navigating.value = true
    expect(wrapper.vm.canNavigate.value).toBe(false) // navigating
  })

  it('shows suggestions when input has content and suggestions exist', async () => {
    wrapper.vm.navigationInput.value = '活动'
    await wrapper.vm.handleInputChange()
    
    expect(wrapper.vm.showSuggestions.value).toBe(true)
    expect(wrapper.vm.suggestions.value).toHaveLength(2)
    expect(wrapper.vm.suggestions.value[0].title).toBe('活动中心')
  })

  it('hides suggestions when input is empty', async () => {
    wrapper.vm.navigationInput.value = '活动'
    await wrapper.vm.handleInputChange()
    
    wrapper.vm.navigationInput.value = ''
    await wrapper.vm.handleInputChange()
    
    expect(wrapper.vm.showSuggestions.value).toBe(false)
    expect(wrapper.vm.suggestions.value).toHaveLength(0)
  })

  it('limits suggestions to 5 items', async () => {
    // Mock more than 5 suggestions
    const mockSuggestions = Array.from({ length: 8 }, (_, i) => ({
      id: String(i),
      title: `Suggestion ${i}`,
      route: `/route/${i}`,
      confidence: 0.8
    }))
    
    wrapper.vm.smartRouter.getSuggestions = vi.fn().mockReturnValue(mockSuggestions)
    
    wrapper.vm.navigationInput.value = 'test'
    await wrapper.vm.handleInputChange()
    
    expect(wrapper.vm.suggestions.value).toHaveLength(5)
  })

  it('handles navigation when handleNavigate is called', async () => {
    wrapper.vm.navigationInput.value = '活动中心'
    
    await wrapper.vm.handleNavigate()
    
    expect(wrapper.vm.navigating.value).toBe(false)
    expect(wrapper.vm.navigationInput.value).toBe('')
    expect(wrapper.vm.showSuggestions.value).toBe(false)
    expect(wrapper.vm.suggestions.value).toHaveLength(0)
  })

  it('handles navigation failure gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    wrapper.vm.navigationInput.value = 'invalid'
    
    await wrapper.vm.handleNavigate()
    
    expect(wrapper.vm.navigating.value).toBe(false)
    expect(ElMessage.error).toHaveBeenCalledWith('页面跳转失败')
    expect(consoleSpy).toHaveBeenCalledWith('导航失败:', expect.any(Error))
    
    consoleSpy.mockRestore()
  })

  it('navigates to suggestion when clicked', async () => {
    const suggestion = {
      id: '1',
      title: '活动中心',
      route: '/centers/activity',
      confidence: 0.9
    }
    
    await wrapper.vm.navigateToSuggestion(suggestion)
    
    expect(mockRouter.push).toHaveBeenCalledWith('/centers/activity')
    expect(ElMessage.success).toHaveBeenCalledWith('已跳转到：活动中心')
    expect(wrapper.vm.navigationInput.value).toBe('')
    expect(wrapper.vm.showSuggestions.value).toBe(false)
  })

  it('handles suggestion navigation failure', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    mockRouter.push.mockRejectedValueOnce(new Error('Navigation failed'))
    
    const suggestion = {
      id: '1',
      title: '活动中心',
      route: '/centers/activity',
      confidence: 0.9
    }
    
    await wrapper.vm.navigateToSuggestion(suggestion)
    
    expect(wrapper.vm.navigating.value).toBe(false)
    expect(ElMessage.error).toHaveBeenCalledWith('页面跳转失败')
    expect(consoleSpy).toHaveBeenCalledWith('导航失败:', expect.any(Error))
    
    consoleSpy.mockRestore()
  })

  it('performs quick navigation when quick button is clicked', async () => {
    const page = {
      id: 'dashboard',
      title: '工作台',
      route: '/dashboard',
      icon: 'dashboard'
    }
    
    await wrapper.vm.quickNavigate(page)
    
    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
    expect(ElMessage.success).toHaveBeenCalledWith('已跳转到：工作台')
  })

  it('handles quick navigation failure', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    mockRouter.push.mockRejectedValueOnce(new Error('Navigation failed'))
    
    const page = {
      id: 'dashboard',
      title: '工作台',
      route: '/dashboard',
      icon: 'dashboard'
    }
    
    await wrapper.vm.quickNavigate(page)
    
    expect(wrapper.vm.navigating.value).toBe(false)
    expect(ElMessage.error).toHaveBeenCalledWith('页面跳转失败')
    expect(consoleSpy).toHaveBeenCalledWith('快速导航失败:', expect.any(Error))
    
    consoleSpy.mockRestore()
  })

  it('returns correct page icons', () => {
    expect(wrapper.vm.getPageIcon('dashboard')).toBeDefined()
    expect(wrapper.vm.getPageIcon('activity')).toBeDefined()
    expect(wrapper.vm.getPageIcon('unknown')).toBeDefined() // fallback to Search
  })

  it('hides suggestions when clicking outside', () => {
    wrapper.vm.showSuggestions.value = true
    
    const mockEvent = {
      target: {
        closest: vi.fn().mockReturnValue(null)
      }
    }
    
    wrapper.vm.handleClickOutside(mockEvent)
    
    expect(wrapper.vm.showSuggestions.value).toBe(false)
  })

  it('does not hide suggestions when clicking inside component', () => {
    wrapper.vm.showSuggestions.value = true
    
    const mockEvent = {
      target: {
        closest: vi.fn().mockReturnValue({ className: 'smart-navigation' })
      }
    }
    
    wrapper.vm.handleClickOutside(mockEvent)
    
    expect(wrapper.vm.showSuggestions.value).toBe(true)
  })

  it('adds click event listener on mount', () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener')
    
    wrapper = mount(SmartNavigation, {
      props: {
        showQuickAccess: true,
        quickAccessCount: 6
      },
      global: {
        plugins: [pinia],
        stubs: {
          'el-input': true,
          'el-button': true
        }
      }
    })
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function))
  })

  it('sets navigating state during navigation', async () => {
    wrapper.vm.navigationInput.value = '活动中心'
    
    const navigatePromise = wrapper.vm.handleNavigate()
    expect(wrapper.vm.navigating.value).toBe(true)
    
    await navigatePromise
    expect(wrapper.vm.navigating.value).toBe(false)
  })

  it('does not navigate when input is empty', async () => {
    wrapper.vm.navigationInput.value = ''
    
    await wrapper.vm.handleNavigate()
    
    expect(mockRouter.push).not.toHaveBeenCalled()
  })

  it('does not navigate when already navigating', async () => {
    wrapper.vm.navigating.value = true
    wrapper.vm.navigationInput.value = '活动中心'
    
    await wrapper.vm.handleNavigate()
    
    expect(mockRouter.push).not.toHaveBeenCalled()
  })

  it('updates suggestions when input changes', async () => {
    wrapper.vm.navigationInput.value = '活动'
    await wrapper.vm.handleInputChange()
    
    expect(wrapper.vm.suggestions.value).toHaveLength(2)
    
    wrapper.vm.navigationInput.value = '测试'
    await wrapper.vm.handleInputChange()
    
    expect(wrapper.vm.suggestions.value).toHaveLength(0)
  })

  it('has correct default props', () => {
    expect(wrapper.props().showQuickAccess).toBe(true)
    expect(wrapper.props().quickAccessCount).toBe(6)
  })

  it('handles custom quickAccessCount prop', async () => {
    await wrapper.setProps({ quickAccessCount: 3 })
    
    expect(wrapper.props().quickAccessCount).toBe(3)
    // The component should still show all quick access pages
    expect(wrapper.vm.quickAccessPages.value).toHaveLength(6)
  })

  it('renders confidence bars correctly in suggestions', async () => {
    wrapper.vm.navigationInput.value = '活动'
    await wrapper.vm.handleInputChange()
    
    // The suggestion should have confidence data
    const suggestion = wrapper.vm.suggestions.value[0]
    expect(suggestion.confidence).toBe(0.9)
  })

  it('has correct CSS classes and styling', () => {
    expect(wrapper.find('.smart-navigation').exists()).toBe(true)
    expect(wrapper.find('.navigation-input-wrapper').exists()).toBe(true)
    expect(wrapper.find('.quick-access').exists()).toBe(true)
    expect(wrapper.find('.quick-access-title').exists()).toBe(true)
    expect(wrapper.find('.quick-buttons').exists()).toBe(true)
  })

  it('disables navigation button when input is empty', () => {
    wrapper.vm.navigationInput.value = ''
    
    const button = wrapper.find('.el-button')
    // In actual implementation, the button should be disabled
    expect(wrapper.vm.canNavigate.value).toBe(false)
  })

  it('enables navigation button when input has content', () => {
    wrapper.vm.navigationInput.value = 'test'
    
    expect(wrapper.vm.canNavigate.value).toBe(true)
  })

  it('shows loading state on button during navigation', async () => {
    wrapper.vm.navigationInput.value = '活动中心'
    
    const navigatePromise = wrapper.vm.handleNavigate()
    expect(wrapper.vm.navigating.value).toBe(true)
    
    await navigatePromise
    expect(wrapper.vm.navigating.value).toBe(false)
  })
})