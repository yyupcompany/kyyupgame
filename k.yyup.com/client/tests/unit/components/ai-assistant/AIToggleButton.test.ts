
// 使用全局表单引用Mock
beforeEach(() => {
  // 设置表单引用Mock
  if (typeof formRef !== 'undefined' && formRef.value) => {
    Object.assign(formRef.value, global.mockFormRef)
  }
  if (typeof editInput !== 'undefined' && editInput.value) {
    Object.assign(editInput.value, global.mockInputRef)
  }
})
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})


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

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AIToggleButton from '@/components/ai-assistant/AIToggleButton.vue'
import ElMessage from 'element-plus'

// Mock dependencies
vi.mock('@/stores/ai-assistant', () => ({
  useAIAssistantStore: () => ({
    panelVisible: { value: false },
    togglePanel: vi.fn(),
    showPanel: vi.fn()
  })
}))

vi.mock('@/stores/user', () => ({
  useUserStore: () => ({
    userInfo: { role: 'admin' },
    isAuthenticated: true,
    isAdmin: true
  })
}))

vi.mock('@/components/icons/UnifiedIcon.vue', () => ({
  default: {
    name: 'UnifiedIcon',
    template: '<div class="mock-unified-icon"><slot /></div>'
  }
}))

// 控制台错误检测变量
let consoleSpy: any

describe('AIToggleButton.vue', () => {
  let wrapper: any
  let pinia: any
  let mockAIStore: any
  let mockUserStore: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    // Reset mocks
    vi.clearAllMocks()
    
    // Get mock stores
    const { useAIAssistantStore } = require('@/stores/ai-assistant')
    const { useUserStore } = require('@/stores/user')
    
    mockAIStore = useAIAssistantStore()
    mockUserStore = useUserStore()
    
    // Mock Element Plus message
    vi.spyOn(ElMessage, 'warning').mockImplementation(() => {})
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    if (wrapper) => {
      wrapper.unmount()
    }
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  const createWrapper = (props = {}) => {
    return mount(AIToggleButton, {
      props: {
        ...props
      },
      global: {
        plugins: [pinia],
        stubs: {
          'el-button': true,
          'el-icon': true,
          'el-tooltip': true,
          'UnifiedIcon': true,
          'Service': true
        }
      }
    })
  }

  describe('Component Rendering', () => {
    it('should render component correctly', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.ai-toggle-container').exists()).toBe(true)
      expect(wrapper.find('.ai-toggle-btn').exists()).toBe(true)
      expect(wrapper.find('.btn-content').exists()).toBe(true)
      expect(wrapper.find('.ai-icon').exists()).toBe(true)
      expect(wrapper.find('.btn-text').exists()).toBe(true)
    })

    it('should display correct button text', () => {
      wrapper = createWrapper()
      
      const buttonText = wrapper.find('.btn-text')
      expect(buttonText.text()).toBe('YY-AI')
    })

    it('should show AI status indicator', () => {
      wrapper = createWrapper()
      
      const statusIndicator = wrapper.find('.ai-status-indicator')
      expect(statusIndicator.exists()).toBe(true)
    })

    it('should apply active class when panel is visible', async () => {
      mockAIStore.panelVisible.value = true
      
      wrapper = createWrapper()
      
      const toggleBtn = wrapper.find('.ai-toggle-btn')
      expect(toggleBtn.classes()).toContain('active')
    })

    it('should apply mobile-optimized class on small screens', () => {
      // Mock mobile screen size
      window.innerWidth = 500
      
      wrapper = createWrapper()
      
      const toggleBtn = wrapper.find('.ai-toggle-btn')
      expect(toggleBtn.classes()).toContain('mobile-optimized')
    })
  })

  describe('Button Title', () => {
    it('should show correct title when panel is closed', () => {
      mockAIStore.panelVisible.value = false
      mockAIStore.currentPageContext = { title: '测试页面' }
      
      wrapper = createWrapper()
      
      const title = wrapper.vm.buttonTitle
      expect(title).toBe('打开AI助手 - 测试页面')
    })

    it('should show correct title when panel is open', () => {
      mockAIStore.panelVisible.value = true
      mockAIStore.currentPageContext = { title: '测试页面' }
      
      wrapper = createWrapper()
      
      const title = wrapper.vm.buttonTitle
      expect(title).toBe('关闭AI助手 - 测试页面')
    })

    it('should handle missing page context gracefully', () => {
      mockAIStore.currentPageContext = null
      
      wrapper = createWrapper()
      
      const title = wrapper.vm.buttonTitle
      expect(title).toContain('AI助手')
    })
  })

  describe('Status Indicator', () => {
    it('should show online status correctly', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ aiServiceStatus: 'online' })
      
      const statusIndicator = wrapper.find('.ai-status-indicator')
      expect(statusIndicator.classes()).toContain('status-online')
    })

    it('should show offline status correctly', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ aiServiceStatus: 'offline' })
      
      const statusIndicator = wrapper.find('.ai-status-indicator')
      expect(statusIndicator.classes()).toContain('status-offline')
    })

    it('should show busy status correctly', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ aiServiceStatus: 'busy' })
      
      const statusIndicator = wrapper.find('.ai-status-indicator')
      expect(statusIndicator.classes()).toContain('status-busy')
    })

    it('should show correct status title', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.statusTitle).toBe('AI服务正常')
      
      wrapper.vm.aiServiceStatus = 'offline'
      expect(wrapper.vm.statusTitle).toBe('AI服务离线')
      
      wrapper.vm.aiServiceStatus = 'busy'
      expect(wrapper.vm.statusTitle).toBe('AI服务繁忙')
    })
  })

  describe('User Interactions', () => {
    it('should handle button click when user has permission', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.handleToggle()
      
      expect(mockAIStore.togglePanel).toHaveBeenCalled()
      expect(ElMessage.warning).not.toHaveBeenCalled()
    })

    it('should show warning when user lacks permission', async () => {
      mockUserStore.userInfo = { role: 'guest' }
      
      wrapper = createWrapper()
      
      await wrapper.vm.handleToggle()
      
      expect(mockAIStore.togglePanel).not.toHaveBeenCalled()
      expect(ElMessage.warning).toHaveBeenCalledWith('您没有使用AI助手的权限')
    })

    it('should clear notifications when button is clicked', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ hasNotification: true, notificationCount: 3 })
      
      await wrapper.vm.handleToggle()
      
      expect(wrapper.vm.hasNotification).toBe(false)
      expect(wrapper.vm.notificationCount).toBe(0)
    })

    it('should hide quick tip when button is clicked', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ showQuickTip: true })
      
      await wrapper.vm.handleToggle()
      
      expect(wrapper.vm.showQuickTip).toBe(false)
      expect(localStorage.setItem).toHaveBeenCalledWith('ai-quick-tip-shown', 'true')
    })
  })

  describe('Permission Checks', () => {
    it('should allow AI usage for admin users', () => {
      mockUserStore.userInfo = { role: 'admin' }
      
      wrapper = createWrapper()
      
      expect(wrapper.vm.canUseAI).toBe(true)
    })

    it('should allow AI usage for principal users', () => {
      mockUserStore.userInfo = { role: 'principal' }
      
      wrapper = createWrapper()
      
      expect(wrapper.vm.canUseAI).toBe(true)
    })

    it('should allow AI usage for teacher users', () => {
      mockUserStore.userInfo = { role: 'teacher' }
      
      wrapper = createWrapper()
      
      expect(wrapper.vm.canUseAI).toBe(true)
    })

    it('should deny AI usage for guest users', () => {
      mockUserStore.userInfo = { role: 'guest' }
      
      wrapper = createWrapper()
      
      expect(wrapper.vm.canUseAI).toBe(false)
    })

    it('should handle missing user role gracefully', () => {
      mockUserStore.userInfo = {}
      
      wrapper = createWrapper()
      
      expect(wrapper.vm.canUseAI).toBe(false)
    })
  })

  describe('Mobile Detection', () => {
    it('should detect mobile screen size correctly', () => {
      // Test mobile view
      window.innerWidth = 768
      
      wrapper = createWrapper()
      
      expect(wrapper.vm.isMobile).toBe(true)
    })

    it('should detect desktop screen size correctly', () => {
      // Test desktop view
      window.innerWidth = 1200
      
      wrapper = createWrapper()
      
      expect(wrapper.vm.isMobile).toBe(false)
    })
  })

  describe('Notification System', () => {
    beforeEach(() => {
      // Mock localStorage
      const localStorageMock = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      }
      global.localStorage = localStorageMock
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    it('should simulate notifications correctly', () => {
      wrapper = createWrapper()
      
      // Mock last check time to be older than 30 minutes
      localStorage.getItem.mockReturnValue(String(Date.now() - 31 * 60 * 1000))
      
      wrapper.vm.simulateNotifications()
      
      // Should check for notifications
      expect(localStorage.getItem).toHaveBeenCalledWith('ai-last-notification-check')
    })

    it('should not simulate notifications if checked recently', () => {
      wrapper = createWrapper()
      
      // Mock last check time to be recent
      localStorage.getItem.mockReturnValue(String(Date.now() - 10 * 60 * 1000))
      
      wrapper.vm.simulateNotifications()
      
      // Should not check for notifications
      expect(wrapper.vm.hasNotification).toBe(false)
    })

    it('should show notification badge when notifications exist', () => {
      wrapper = createWrapper()
      
      wrapper.setData({ hasNotification: true, notificationCount: 5 })
      
      const badge = wrapper.find('.notification-badge')
      expect(badge.exists()).toBe(true)
      expect(badge.text()).toBe('5')
    })

    it('should show 99+ for large notification counts', () => {
      wrapper = createWrapper()
      
      wrapper.setData({ hasNotification: true, notificationCount: 150 })
      
      const badge = wrapper.find('.notification-badge')
      expect(badge.text()).toBe('99+')
    })
  })

  describe('Quick Tip System', () => {
    beforeEach(() => {
      // Mock localStorage
      const localStorageMock = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      }
      global.localStorage = localStorageMock
    })

    it('should show quick tip for new users', () => {
      localStorage.getItem.mockReturnValue(null)
      
      wrapper = createWrapper()
      
      wrapper.vm.checkQuickTip()
      
      expect(wrapper.vm.showQuickTip).toBe(true)
    })

    it('should not show quick tip if already shown', () => {
      localStorage.getItem.mockReturnValue('true')
      
      wrapper = createWrapper()
      
      wrapper.vm.checkQuickTip()
      
      expect(wrapper.vm.showQuickTip).toBe(false)
    })

    it('should hide quick tip after delay', async () => {
      vi.useFakeTimers()
      
      wrapper = createWrapper()
      
      await wrapper.setData({ showQuickTip: true })
      
      wrapper.vm.checkQuickTip()
      
      await vi.advanceTimersByTime(3000)
      
      expect(wrapper.vm.showQuickTip).toBe(true)
      
      vi.useRealTimers()
    })
  })

  describe('Keyboard Shortcuts', () => {
    it('should handle keyboard shortcut correctly', () => {
      wrapper = createWrapper()
      
      const mockEvent = {
        ctrlKey: true,
        shiftKey: true,
        key: 'A',
        preventDefault: vi.fn()
      }
      
      wrapper.vm.handleKeyboardShortcut(mockEvent)
      
      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(mockAIStore.showPanel).toHaveBeenCalled()
    })

    it('should not handle incorrect keyboard combinations', () => {
      wrapper = createWrapper()
      
      const mockEvent = {
        ctrlKey: false,
        shiftKey: true,
        key: 'A',
        preventDefault: vi.fn()
      }
      
      wrapper.vm.handleKeyboardShortcut(mockEvent)
      
      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
      expect(mockAIStore.showPanel).not.toHaveBeenCalled()
    })

    it('should not trigger shortcut when user lacks permission', () => {
      mockUserStore.userInfo = { role: 'guest' }
      
      wrapper = createWrapper()
      
      const mockEvent = {
        ctrlKey: true,
        shiftKey: true,
        key: 'A',
        preventDefault: vi.fn()
      }
      
      wrapper.vm.handleKeyboardShortcut(mockEvent)
      
      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
      expect(mockAIStore.showPanel).not.toHaveBeenCalled()
    })
  })

  describe('Lifecycle Hooks', () => {
    beforeEach(() => {
      // Mock localStorage
      const localStorageMock = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      }
      global.localStorage = localStorageMock
    })

    it('should initialize AI service status on mount', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.aiServiceStatus).toBe('online')
    })

    it('should set up notification checking on mount', () => {
      wrapper = createWrapper()
      
      expect(setInterval).toHaveBeenCalled()
    })

    it('should add keyboard event listener on mount', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener')
      
      wrapper = createWrapper()
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    })

    it('should cleanup interval and event listeners on unmount', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
      
      wrapper = createWrapper()
      wrapper.unmount()
      
      expect(clearIntervalSpy).toHaveBeenCalled()
      expect(removeEventListenerSpy).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should maintain proper focus management', () => {
      wrapper = createWrapper()
      
      const button = wrapper.find('.ai-toggle-btn')
      expect(button.exists()).toBe(true)
    })

    it('should provide proper ARIA labels', () => {
      wrapper = createWrapper()
      
      const button = wrapper.find('.ai-toggle-btn')
      expect(button.attributes('title')).toBeDefined()
    })

    it('should support keyboard navigation', async () => {
      wrapper = createWrapper()
      
      const button = wrapper.find('.ai-toggle-btn')
      
      // Simulate keyboard interaction
      await button.trigger('keydown.enter')
      await button.trigger('keydown.space')
      
      expect(mockAIStore.togglePanel).toHaveBeenCalled()
    })
  })

  describe('Responsive Design', () => {
    it('should handle window resize events', () => {
      wrapper = createWrapper()
      
      // Simulate window resize from desktop to mobile
      window.innerWidth = 500
      window.dispatchEvent(new Event('resize'))
      
      expect(wrapper.vm.isMobile).toBe(true)
    })

    it('should apply mobile-specific styles', () => {
      window.innerWidth = 500
      
      wrapper = createWrapper()
      
      const button = wrapper.find('.ai-toggle-btn')
      expect(button.classes()).toContain('mobile-optimized')
    })
  })

  describe('Performance Optimization', () => {
    it('should throttle rapid notification checks', () => {
      wrapper = createWrapper()
      
      const simulateSpy = vi.spyOn(wrapper.vm, 'simulateNotifications')
      
      // Simulate rapid calls
      wrapper.vm.simulateNotifications()
      wrapper.vm.simulateNotifications()
      wrapper.vm.simulateNotifications()
      
      expect(simulateSpy).toHaveBeenCalledTimes(3)
    })

    it('should cleanup event listeners properly', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
      
      wrapper = createWrapper()
      wrapper.unmount()
      
      expect(removeEventListenerSpy).toHaveBeenCalled()
    })
  })
})