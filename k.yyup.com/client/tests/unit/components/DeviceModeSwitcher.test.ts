import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import DeviceModeSwitcher from '@/components/DeviceModeSwitcher.vue'

// Mock device detection utilities
vi.mock('@/utils/device-detection', () => ({
  getDeviceInfo: vi.fn(),
  getDeviceType: vi.fn(),
  setForceDesktopMode: vi.fn(),
  isForceDesktopMode: vi.fn()
}))

// Mock Vue Router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

// Mock window.location.reload
const mockReload = vi.fn()
Object.defineProperty(window, 'location', {
  value: {
    reload: mockReload
  },
  writable: true
})

// 控制台错误检测变量
let consoleSpy: any

describe('DeviceModeSwitcher', () => {
    beforeEach(() => {
      startConsoleMonitoring()
      vi.clearAllMocks()
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    afterEach(() => {
      expectNoConsoleErrors()
      stopConsoleMonitoring()
    })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
  let wrapper: any
  let mockDeviceUtils: any

  const mockDeviceInfo = {
    isPc: true,
    isMobile: false,
    screenWidth: 1920,
    screenHeight: 1080,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Test Browser'
  }

  beforeEach(async () => {
    // Setup mock implementations
    mockDeviceUtils = await import('@/utils/device-detection')
    mockDeviceUtils.getDeviceInfo.mockReturnValue(mockDeviceInfo)
    mockDeviceUtils.getDeviceType.mockReturnValue('pc')
    mockDeviceUtils.isForceDesktopMode.mockReturnValue(false)
    mockDeviceUtils.setForceDesktopMode.mockImplementation(() => {})

    wrapper = mount(DeviceModeSwitcher, {
      global: {
        stubs: {
          'el-card': true,
          'el-tag': true,
          'el-button': true,
          'el-alert': true
        }
      }
    })
  })

  afterEach(() => {
    if (wrapper) => {
      wrapper.unmount()
    }
    vi.clearAllMocks()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('Component Rendering', () => {
    it('renders the device mode switcher correctly', () => {
      expect(wrapper.find('.device-mode-switcher').exists()).toBe(true)
      expect(wrapper.find('.mode-card').exists()).toBe(true)
    })

    it('displays card header with title and mode tag', () => {
      const cardHeader = wrapper.find('.card-header')
      expect(cardHeader.exists()).toBe(true)
      expect(cardHeader.find('span').text()).toBe('设备模式切换')
      
      const modeTag = cardHeader.findComponent({ name: 'ElTag' })
      expect(modeTag.exists()).toBe(true)
      expect(modeTag.attributes('type')).toBe('success')
      expect(modeTag.text()).toBe('桌面模式')
    })

    it('shows device information section', () => {
      const modeInfo = wrapper.find('.mode-info')
      expect(modeInfo.exists()).toBe(true)
      expect(modeInfo.find('strong').text()).toBe('当前设备信息：')
      
      const listItems = modeInfo.findAll('li')
      expect(listItems.length).toBe(4)
      expect(listItems[0].text()).toContain('设备类型：PC')
      expect(listItems[1].text()).toContain('屏幕尺寸：1920 x 1080')
      expect(listItems[2].text()).toContain('User Agent：Mozilla/5.0 (Windows NT 10.0; Win64; x64) Test Browser...')
      expect(listItems[3].text()).toContain('强制桌面模式：否')
    })

    it('displays mode action buttons', () => {
      const modeActions = wrapper.find('.mode-actions')
      expect(modeActions.exists()).toBe(true)
      
      const buttons = modeActions.findAllComponents({ name: 'ElButton' })
      expect(buttons.length).toBe(2)
      
      const desktopButton = buttons[0]
      expect(desktopButton.attributes('type')).toBe('primary')
      expect(desktopButton.text()).toBe('切换到桌面模式')
      expect(desktopButton.attributes('disabled')).toBeDefined() // Should be disabled since already in PC mode
      
      const mobileButton = buttons[1]
      expect(mobileButton.attributes('type')).toBe('warning')
      expect(mobileButton.text()).toBe('切换到移动模式')
      expect(mobileButton.attributes('disabled')).toBeDefined() // Should be disabled since not in force desktop mode
    })

    it('shows mode tips with alert', () => {
      const modeTips = wrapper.find('.mode-tips')
      expect(modeTips.exists()).toBe(true)
      
      const alert = modeTips.findComponent({ name: 'ElAlert' })
      expect(alert.exists()).toBe(true)
      expect(alert.attributes('type')).toBe('info')
      expect(alert.attributes('closable')).toBe('false')
      
      const tips = modeTips.findAll('p')
      expect(tips.length).toBe(3)
      expect(tips[0].text()).toContain('桌面模式：适合PC端操作，功能完整')
      expect(tips[1].text()).toContain('移动模式：适合手机/平板，界面简化')
      expect(tips[2].text()).toContain('可通过URL参数 ?forceDesktop=1 强制桌面模式')
    })
  })

  describe('Component State', () => {
    it('initializes with correct device information', () => {
      expect(wrapper.vm.deviceInfo).toEqual(mockDeviceInfo)
      expect(wrapper.vm.currentMode).toBe('pc')
      expect(wrapper.vm.isForceDesktop).toBe(false)
    })

    it('calls device detection utilities on initialization', () => {
      expect(mockDeviceUtils.getDeviceInfo).toHaveBeenCalled()
      expect(mockDeviceUtils.getDeviceType).toHaveBeenCalled()
      expect(mockDeviceUtils.isForceDesktopMode).toHaveBeenCalled()
    })
  })

  describe('Mode Switching', () => {
    it('switches to desktop mode correctly', () => {
      wrapper.vm.switchToDesktop()
      
      expect(mockDeviceUtils.setForceDesktopMode).toHaveBeenCalledWith(true)
      expect(mockReload).toHaveBeenCalled()
    })

    it('switches to mobile mode correctly', () => {
      wrapper.vm.switchToMobile()
      
      expect(mockDeviceUtils.setForceDesktopMode).toHaveBeenCalledWith(false)
      expect(mockReload).toHaveBeenCalled()
    })
  })

  describe('Device Type Variations', () => {
    it('displays mobile device information correctly', async () => {
      const mobileDeviceInfo = {
        isPc: false,
        isMobile: true,
        screenWidth: 375,
        screenHeight: 812,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) Test Mobile'
      }
      
      mockDeviceUtils.getDeviceInfo.mockReturnValue(mobileDeviceInfo)
      mockDeviceUtils.getDeviceType.mockReturnValue('mobile')
      
      await wrapper.vm.$forceUpdate()
      
      const listItems = wrapper.findAll('.mode-info li')
      expect(listItems[0].text()).toContain('设备类型：移动设备')
      expect(listItems[1].text()).toContain('屏幕尺寸：375 x 812')
      expect(listItems[2].text()).toContain('User Agent：Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) Test Mobile...')
    })

    it('displays tablet device information correctly', async () => {
      const tabletDeviceInfo = {
        isPc: false,
        isMobile: false,
        screenWidth: 768,
        screenHeight: 1024,
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) Test Tablet'
      }
      
      mockDeviceUtils.getDeviceInfo.mockReturnValue(tabletDeviceInfo)
      
      await wrapper.vm.$forceUpdate()
      
      const listItems = wrapper.findAll('.mode-info li')
      expect(listItems[0].text()).toContain('设备类型：平板')
    })

    it('shows mobile mode tag when in mobile mode', async () => {
      mockDeviceUtils.getDeviceType.mockReturnValue('mobile')
      
      await wrapper.vm.$forceUpdate()
      
      const modeTag = wrapper.findComponent({ name: 'ElTag' })
      expect(modeTag.attributes('type')).toBe('warning')
      expect(modeTag.text()).toBe('移动模式')
    })

    it('enables desktop button when in mobile mode', async () => {
      mockDeviceUtils.getDeviceType.mockReturnValue('mobile')
      
      await wrapper.vm.$forceUpdate()
      
      const desktopButton = wrapper.findAllComponents({ name: 'ElButton' })[0]
      expect(desktopButton.attributes('disabled')).toBeUndefined()
    })
  })

  describe('Force Desktop Mode', () => {
    it('displays force desktop mode information correctly', async () => {
      mockDeviceUtils.isForceDesktopMode.mockReturnValue(true)
      
      await wrapper.vm.$forceUpdate()
      
      const listItems = wrapper.findAll('.mode-info li')
      expect(listItems[3].text()).toContain('强制桌面模式：是')
    })

    it('enables mobile button when in force desktop mode', async () => {
      mockDeviceUtils.isForceDesktopMode.mockReturnValue(true)
      
      await wrapper.vm.$forceUpdate()
      
      const mobileButton = wrapper.findAllComponents({ name: 'ElButton' })[1]
      expect(mobileButton.attributes('disabled')).toBeUndefined()
    })

    it('disables mobile button when not in force desktop mode', () => {
      const mobileButton = wrapper.findAllComponents({ name: 'ElButton' })[1]
      expect(mobileButton.attributes('disabled')).toBeDefined()
    })
  })

  describe('Button State Logic', () => {
    it('disables desktop button when already in PC mode', () => {
      const desktopButton = wrapper.findAllComponents({ name: 'ElButton' })[0]
      expect(desktopButton.attributes('disabled')).toBeDefined()
    })

    it('enables desktop button when in mobile mode', async () => {
      mockDeviceUtils.getDeviceType.mockReturnValue('mobile')
      
      await wrapper.vm.$forceUpdate()
      
      const desktopButton = wrapper.findAllComponents({ name: 'ElButton' })[0]
      expect(desktopButton.attributes('disabled')).toBeUndefined()
    })

    it('disables mobile button when not in force desktop mode', () => {
      const mobileButton = wrapper.findAllComponents({ name: 'ElButton' })[1]
      expect(mobileButton.attributes('disabled')).toBeDefined()
    })

    it('enables mobile button when in force desktop mode', async () => {
      mockDeviceUtils.isForceDesktopMode.mockReturnValue(true)
      
      await wrapper.vm.$forceUpdate()
      
      const mobileButton = wrapper.findAllComponents({ name: 'ElButton' })[1]
      expect(mobileButton.attributes('disabled')).toBeUndefined()
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined device info gracefully', async () => {
      mockDeviceUtils.getDeviceInfo.mockReturnValue(undefined)
      
      await wrapper.vm.$forceUpdate()
      
      // Should not throw error
      expect(wrapper.find('.mode-info').exists()).toBe(true)
    })

    it('handles empty device info gracefully', async () => {
      mockDeviceUtils.getDeviceInfo.mockReturnValue({})
      
      await wrapper.vm.$forceUpdate()
      
      const listItems = wrapper.findAll('.mode-info li')
      expect(listItems[0].text()).toContain('设备类型：undefined')
    })

    it('handles device info with missing properties gracefully', async () => {
      const incompleteDeviceInfo = {
        isPc: true,
        // Missing other properties
      }
      
      mockDeviceUtils.getDeviceInfo.mockReturnValue(incompleteDeviceInfo)
      
      await wrapper.vm.$forceUpdate()
      
      const listItems = wrapper.findAll('.mode-info li')
      expect(listItems[0].text()).toContain('设备类型：PC')
      expect(listItems[1].text()).toContain('屏幕尺寸：undefined x undefined')
    })

    it('handles very long user agent string', async () => {
      const longUserAgent = 'Mozilla/5.0 '.repeat(20) + 'Very Long User Agent'
      const deviceInfoWithLongUA = {
        ...mockDeviceInfo,
        userAgent: longUserAgent
      }
      
      mockDeviceUtils.getDeviceInfo.mockReturnValue(deviceInfoWithLongUA)
      
      await wrapper.vm.$forceUpdate()
      
      const listItems = wrapper.findAll('.mode-info li')
      const uaText = listItems[2].text()
      expect(uaText).toContain('...')
      expect(uaText.length).toBeLessThan(longUserAgent.length)
    })

    it('handles empty user agent string', async () => {
      const deviceInfoWithEmptyUA = {
        ...mockDeviceInfo,
        userAgent: ''
      }
      
      mockDeviceUtils.getDeviceInfo.mockReturnValue(deviceInfoWithEmptyUA)
      
      await wrapper.vm.$forceUpdate()
      
      const listItems = wrapper.findAll('.mode-info li')
      expect(listItems[2].text()).toContain('User Agent：...')
    })

    it('handles null user agent string', async () => {
      const deviceInfoWithNullUA = {
        ...mockDeviceInfo,
        userAgent: null
      }
      
      mockDeviceUtils.getDeviceInfo.mockReturnValue(deviceInfoWithNullUA)
      
      await wrapper.vm.$forceUpdate()
      
      const listItems = wrapper.findAll('.mode-info li')
      expect(listItems[2].text()).toContain('User Agent：...')
    })
  })

  describe('Component Lifecycle', () => {
    it('updates device information on mount', () => {
      expect(mockDeviceUtils.getDeviceInfo).toHaveBeenCalled()
      expect(mockDeviceUtils.getDeviceType).toHaveBeenCalled()
      expect(mockDeviceUtils.isForceDesktopMode).toHaveBeenCalled()
    })

    it('calls device detection utilities multiple times if mounted multiple times', () => {
      const initialCallCount = mockDeviceUtils.getDeviceInfo.mock.calls.length
      
      wrapper.unmount()
      wrapper.mount()
      
      expect(mockDeviceUtils.getDeviceInfo.mock.calls.length).toBe(initialCallCount + 1)
    })
  })

  describe('Error Handling', () => {
    it('handles errors in device detection gracefully', async () => {
      mockDeviceUtils.getDeviceInfo.mockImplementation(() => {
        throw new Error('Device detection failed')
      })
      
      // Should not throw error during mount
      expect(() => wrapper.mount()).not.toThrow()
      
      // Component should still render
      expect(wrapper.find('.device-mode-switcher').exists()).toBe(true)
    })

    it('handles errors in mode switching gracefully', () => {
      mockDeviceUtils.setForceDesktopMode.mockImplementation(() => {
        throw new Error('Mode switching failed')
      })
      
      // Should not throw error
      expect(() => wrapper.vm.switchToDesktop()).not.toThrow()
    })
  })

  describe('Styling and Classes', () => {
    it('applies correct CSS classes to elements', () => {
      expect(wrapper.find('.device-mode-switcher').exists()).toBe(true)
      expect(wrapper.find('.mode-card').exists()).toBe(true)
      expect(wrapper.find('.card-header').exists()).toBe(true)
      expect(wrapper.find('.mode-info').exists()).toBe(true)
      expect(wrapper.find('.mode-actions').exists()).toBe(true)
      expect(wrapper.find('.mode-tips').exists()).toBe(true)
    })

    it('maintains proper component structure', () => {
      const container = wrapper.find('.device-mode-switcher')
      const card = container.find('.mode-card')
      const header = card.find('.card-header')
      const info = card.find('.mode-info')
      const actions = card.find('.mode-actions')
      const tips = card.find('.mode-tips')
      
      expect(container.contains(card)).toBe(true)
      expect(card.contains(header)).toBe(true)
      expect(card.contains(info)).toBe(true)
      expect(card.contains(actions)).toBe(true)
      expect(card.contains(tips)).toBe(true)
    })
  })

  describe('Router Integration', () => {
    it('imports and uses Vue Router correctly', () => {
      expect(mockPush).not.toHaveBeenCalled() // Router is available but not used in this component
    })
  })

  describe('Window Object Integration', () => {
    it('accesses window.location.reload correctly', () => {
      expect(mockReload).not.toHaveBeenCalled()
      
      wrapper.vm.switchToDesktop()
      
      expect(mockReload).toHaveBeenCalled()
    })

    it('handles missing window.location gracefully', () => {
      const originalLocation = window.location
      delete (window as any).location
      
      // Should not throw error
      expect(() => wrapper.vm.switchToDesktop()).not.toThrow()
      
      // Restore window.location
      window.location = originalLocation
    })
  })
})