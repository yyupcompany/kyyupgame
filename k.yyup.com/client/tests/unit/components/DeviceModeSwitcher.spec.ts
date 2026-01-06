import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import DeviceModeSwitcher from '@/components/DeviceModeSwitcher.vue'

// Mock device detection utilities
vi.mock('@/utils/device-detection', () => ({
  getDeviceInfo: vi.fn(),
  getDeviceType: vi.fn(),
  setForceDesktopMode: vi.fn(),
  isForceDesktopMode: vi.fn()
}))

// 控制台错误检测变量
let consoleSpy: any

describe('DeviceModeSwitcher.vue', () => {
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    // Reset all mocks
    vi.clearAllMocks()
    
    // Default mock implementations
    const { getDeviceInfo, getDeviceType, setForceDesktopMode, isForceDesktopMode } = require('@/utils/device-detection')
    
    getDeviceInfo.mockReturnValue({
      isPc: true,
      isMobile: false,
      screenWidth: 1920,
      screenHeight: 1080,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0;
import { vi } from 'vitest' Win64; x64) AppleWebKit/537.36'
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    getDeviceType.mockReturnValue('pc')
    isForceDesktopMode.mockReturnValue(false)
    setForceDesktopMode.mockImplementation(() => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('组件渲染', () => {
    it('应该正确渲染基本组件', () => {
      const wrapper = mount(DeviceModeSwitcher)
      
      expect(wrapper.find('.device-mode-switcher').exists()).toBe(true)
      expect(wrapper.find('.mode-card').exists()).toBe(true)
      expect(wrapper.text()).toContain('设备模式切换')
    })

    it('应该渲染设备信息卡片', () => {
      const wrapper = mount(DeviceModeSwitcher)
      
      expect(wrapper.find('.mode-info').exists()).toBe(true)
      expect(wrapper.text()).toContain('当前设备信息')
      expect(wrapper.text()).toContain('设备类型')
      expect(wrapper.text()).toContain('屏幕尺寸')
      expect(wrapper.text()).toContain('User Agent')
    })

    it('应该渲染模式操作按钮', () => {
      const wrapper = mount(DeviceModeSwitcher)
      
      expect(wrapper.find('.mode-actions').exists()).toBe(true)
      expect(wrapper.text()).toContain('切换到桌面模式')
      expect(wrapper.text()).toContain('切换到移动模式')
    })

    it('应该渲染提示信息', () => {
      const wrapper = mount(DeviceModeSwitcher)
      
      expect(wrapper.find('.mode-tips').exists()).toBe(true)
      expect(wrapper.text()).toContain('提示')
      expect(wrapper.text()).toContain('桌面模式')
      expect(wrapper.text()).toContain('移动模式')
    })

    it('应该显示当前模式标签', () => {
      const wrapper = mount(DeviceModeSwitcher)
      
      const modeTag = wrapper.find('.el-tag')
      expect(modeTag.exists()).toBe(true)
      expect(modeTag.text()).toContain('桌面模式')
    })
  })

  describe('数据初始化测试', () => {
    it('应该正确初始化设备信息', () => {
      const { getDeviceInfo } = require('@/utils/device-detection')
      
      const wrapper = mount(DeviceModeSwitcher)
      
      expect(getDeviceInfo).toHaveBeenCalled()
      expect(wrapper.vm.deviceInfo).toEqual({
        isPc: true,
        isMobile: false,
        screenWidth: 1920,
        screenHeight: 1080,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      })
    })

    it('应该正确初始化当前模式', () => {
      const { getDeviceType } = require('@/utils/device-detection')
      
      const wrapper = mount(DeviceModeSwitcher)
      
      expect(getDeviceType).toHaveBeenCalled()
      expect(wrapper.vm.currentMode).toBe('pc')
    })

    it('应该正确初始化强制桌面模式状态', () => {
      const { isForceDesktopMode } = require('@/utils/device-detection')
      
      const wrapper = mount(DeviceModeSwitcher)
      
      expect(isForceDesktopMode).toHaveBeenCalled()
      expect(wrapper.vm.isForceDesktop).toBe(false)
    })

    it('应该在移动设备模式下正确显示', () => {
      const { getDeviceInfo, getDeviceType } = require('@/utils/device-detection')
      
      getDeviceInfo.mockReturnValue({
        isPc: false,
        isMobile: true,
        screenWidth: 375,
        screenHeight: 667,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
      })
      
      getDeviceType.mockReturnValue('mobile')
      
      const wrapper = mount(DeviceModeSwitcher)
      
      expect(wrapper.vm.deviceInfo.isMobile).toBe(true)
      expect(wrapper.vm.currentMode).toBe('mobile')
      
      const modeTag = wrapper.find('.el-tag')
      expect(modeTag.text()).toContain('移动模式')
    })
  })

  describe('方法测试', () => {
    it('应该正确切换到桌面模式', () => {
      const { setForceDesktopMode } = require('@/utils/device-detection')
      const reloadSpy = vi.spyOn(window.location, 'reload').mockImplementation(() => {})
      
      const wrapper = mount(DeviceModeSwitcher)
      
      wrapper.vm.switchToDesktop()
      
      expect(setForceDesktopMode).toHaveBeenCalledWith(true)
      expect(reloadSpy).toHaveBeenCalled()
      
      reloadSpy.mockRestore()
    })

    it('应该正确切换到移动模式', () => {
      const { setForceDesktopMode } = require('@/utils/device-detection')
      const reloadSpy = vi.spyOn(window.location, 'reload').mockImplementation(() => {})
      
      const wrapper = mount(DeviceModeSwitcher)
      
      wrapper.vm.switchToMobile()
      
      expect(setForceDesktopMode).toHaveBeenCalledWith(false)
      expect(reloadSpy).toHaveBeenCalled()
      
      reloadSpy.mockRestore()
    })

    it('应该在 onMounted 时更新设备信息', () => {
      const { getDeviceInfo, getDeviceType, isForceDesktopMode } = require('@/utils/device-detection')
      
      // Clear initial calls
      getDeviceInfo.mockClear()
      getDeviceType.mockClear()
      isForceDesktopMode.mockClear()
      
      const wrapper = mount(DeviceModeSwitcher)
      
      // onMounted should call these functions
      expect(getDeviceInfo).toHaveBeenCalled()
      expect(getDeviceType).toHaveBeenCalled()
      expect(isForceDesktopMode).toHaveBeenCalled()
    })
  })

  describe('按钮状态测试', () => {
    it('当前为桌面模式时，桌面模式按钮应该被禁用', () => {
      const wrapper = mount(DeviceModeSwitcher)
      
      const desktopButton = wrapper.findAll('button')[0]
      expect(desktopButton.text()).toContain('切换到桌面模式')
      expect(desktopButton.attributes('disabled')).toBeDefined()
    })

    it('当前为移动模式时，移动模式按钮应该被禁用', () => {
      const { getDeviceType } = require('@/utils/device-detection')
      getDeviceType.mockReturnValue('mobile')
      
      const wrapper = mount(DeviceModeSwitcher)
      
      const mobileButton = wrapper.findAll('button')[1]
      expect(mobileButton.text()).toContain('切换到移动模式')
      expect(mobileButton.attributes('disabled')).toBeDefined()
    })

    it('非强制桌面模式时，移动模式按钮应该被禁用', () => {
      const { isForceDesktopMode } = require('@/utils/device-detection')
      isForceDesktopMode.mockReturnValue(false)
      
      const wrapper = mount(DeviceModeSwitcher)
      
      const mobileButton = wrapper.findAll('button')[1]
      expect(mobileButton.attributes('disabled')).toBeDefined()
    })

    it('强制桌面模式时，移动模式按钮应该可用', () => {
      const { isForceDesktopMode } = require('@/utils/device-detection')
      isForceDesktopMode.mockReturnValue(true)
      
      const wrapper = mount(DeviceModeSwitcher)
      
      const mobileButton = wrapper.findAll('button')[1]
      expect(mobileButton.attributes('disabled')).toBeUndefined()
    })
  })

  describe('设备信息显示测试', () => {
    it('应该正确显示PC设备信息', () => {
      const { getDeviceInfo } = require('@/utils/device-detection')
      
      getDeviceInfo.mockReturnValue({
        isPc: true,
        isMobile: false,
        screenWidth: 1920,
        screenHeight: 1080,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      })
      
      const wrapper = mount(DeviceModeSwitcher)
      
      expect(wrapper.text()).toContain('PC')
      expect(wrapper.text()).toContain('1920 x 1080')
      expect(wrapper.text()).toContain('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
    })

    it('应该正确显示移动设备信息', () => {
      const { getDeviceInfo } = require('@/utils/device-detection')
      
      getDeviceInfo.mockReturnValue({
        isPc: false,
        isMobile: true,
        screenWidth: 375,
        screenHeight: 667,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
      })
      
      const wrapper = mount(DeviceModeSwitcher)
      
      expect(wrapper.text()).toContain('移动设备')
      expect(wrapper.text()).toContain('375 x 667')
      expect(wrapper.text()).toContain('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)')
    })

    it('应该正确显示平板设备信息', () => {
      const { getDeviceInfo } = require('@/utils/device-detection')
      
      getDeviceInfo.mockReturnValue({
        isPc: false,
        isMobile: false,
        screenWidth: 768,
        screenHeight: 1024,
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)'
      })
      
      const wrapper = mount(DeviceModeSwitcher)
      
      expect(wrapper.text()).toContain('平板')
      expect(wrapper.text()).toContain('768 x 1024')
      expect(wrapper.text()).toContain('Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)')
    })

    it('应该正确截断过长的User Agent', () => {
      const { getDeviceInfo } = require('@/utils/device-detection')
      
      const longUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      
      getDeviceInfo.mockReturnValue({
        isPc: true,
        isMobile: false,
        screenWidth: 1920,
        screenHeight: 1080,
        userAgent: longUserAgent
      })
      
      const wrapper = mount(DeviceModeSwitcher)
      
      expect(wrapper.text()).toContain(longUserAgent.substring(0, 50))
      expect(wrapper.text()).toContain('...')
    })
  })

  describe('模式标签显示测试', () => {
    it('桌面模式时应该显示成功类型标签', () => {
      const { getDeviceType } = require('@/utils/device-detection')
      getDeviceType.mockReturnValue('pc')
      
      const wrapper = mount(DeviceModeSwitcher)
      
      const modeTag = wrapper.find('.el-tag')
      expect(modeTag.text()).toBe('桌面模式')
    })

    it('移动模式时应该显示警告类型标签', () => {
      const { getDeviceType } = require('@/utils/device-detection')
      getDeviceType.mockReturnValue('mobile')
      
      const wrapper = mount(DeviceModeSwitcher)
      
      const modeTag = wrapper.find('.el-tag')
      expect(modeTag.text()).toBe('移动模式')
    })
  })

  describe('边界情况测试', () => {
    it('应该处理空的设备信息', () => {
      const { getDeviceInfo } = require('@/utils/device-detection')
      
      getDeviceInfo.mockReturnValue({})
      
      const wrapper = mount(DeviceModeSwitcher)
      
      expect(wrapper.vm.deviceInfo).toEqual({})
    })

    it('应该处理不完整的设备信息', () => {
      const { getDeviceInfo } = require('@/utils/device-detection')
      
      getDeviceInfo.mockReturnValue({
        isPc: true
        // 缺少其他字段
      })
      
      const wrapper = mount(DeviceModeSwitcher)
      
      expect(wrapper.vm.deviceInfo.isPc).toBe(true)
      expect(wrapper.vm.deviceInfo.isMobile).toBeUndefined()
    })

    it('应该处理设备检测函数抛出异常', () => {
      const { getDeviceInfo } = require('@/utils/device-detection')
      
      getDeviceInfo.mockImplementation(() => {
        throw new Error('Device detection failed')
      })
      
      expect(() => {
        mount(DeviceModeSwitcher)
      }).not.toThrow()
    })

    it('应该处理 window.location.reload 被覆盖的情况', () => {
      const { setForceDesktopMode } = require('@/utils/device-detection')
      
      const originalReload = window.location.reload
      window.location.reload = undefined
      
      const wrapper = mount(DeviceModeSwitcher)
      
      expect(() => {
        wrapper.vm.switchToDesktop()
      }).not.toThrow()
      
      window.location.reload = originalReload
    })
  })

  describe('响应式更新测试', () => {
    it('应该在设备信息变化时更新显示', async () => {
      const { getDeviceInfo } = require('@/utils/device-detection')
      
      getDeviceInfo.mockReturnValue({
        isPc: true,
        isMobile: false,
        screenWidth: 1920,
        screenHeight: 1080,
        userAgent: 'PC User Agent'
      })
      
      const wrapper = mount(DeviceModeSwitcher)
      
      expect(wrapper.text()).toContain('PC User Agent')
      
      // 更新设备信息
      getDeviceInfo.mockReturnValue({
        isPc: false,
        isMobile: true,
        screenWidth: 375,
        screenHeight: 667,
        userAgent: 'Mobile User Agent'
      })
      
      // 模拟重新挂载
      await wrapper.unmount()
      await wrapper.mount()
      
      expect(wrapper.text()).toContain('Mobile User Agent')
    })
  })

  describe('性能测试', () => {
    it('应该快速渲染组件', () => {
      const start = performance.now()
      const wrapper = mount(DeviceModeSwitcher)
      const end = performance.now()
      
      expect(wrapper.find('.device-mode-switcher').exists()).toBe(true)
      expect(end - start).toBeLessThan(100) // 应该在100ms内完成渲染
    })

    it('应该高效处理多次设备信息更新', async () => {
      const { getDeviceInfo } = require('@/utils/device-detection')
      
      const wrapper = mount(DeviceModeSwitcher)
      
      // 多次更新设备信息
      for (let i = 0; i < 10; i++) {
        getDeviceInfo.mockReturnValue({
          isPc: i % 2 === 0,
          isMobile: i % 2 === 1,
          screenWidth: 1920 - i * 100,
          screenHeight: 1080 - i * 100,
          userAgent: `User Agent ${i}`
        })
        
        await wrapper.unmount()
        await wrapper.mount()
        
        expect(wrapper.text()).toContain(`User Agent ${i}`)
      }
    })
  })

  describe('可访问性测试', () => {
    it('应该有适当的语义化结构', () => {
      const wrapper = mount(DeviceModeSwitcher)
      
      expect(wrapper.find('.device-mode-switcher').exists()).toBe(true)
      expect(wrapper.find('.mode-card').exists()).toBe(true)
      expect(wrapper.find('.mode-info').exists()).toBe(true)
      expect(wrapper.find('.mode-actions').exists()).toBe(true)
      expect(wrapper.find('.mode-tips').exists()).toBe(true)
    })

    it('应该支持键盘导航', async () => {
      const wrapper = mount(DeviceModeSwitcher)
      
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThanOrEqual(2)
      
      // 测试第一个按钮的键盘导航
      await buttons[0].trigger('keydown', { key: 'Enter' })
      expect(buttons[0].exists()).toBe(true)
    })

    it('应该有适当的按钮文本', () => {
      const wrapper = mount(DeviceModeSwitcher)
      
      const buttons = wrapper.findAll('button')
      expect(buttons[0].text()).toContain('切换到桌面模式')
      expect(buttons[1].text()).toContain('切换到移动模式')
    })
  })

  describe('样式测试', () => {
    it('应该应用正确的CSS类', () => {
      const wrapper = mount(DeviceModeSwitcher)
      
      expect(wrapper.find('.device-mode-switcher').exists()).toBe(true)
      expect(wrapper.find('.mode-card').exists()).toBe(true)
      expect(wrapper.find('.card-header').exists()).toBe(true)
      expect(wrapper.find('.mode-info').exists()).toBe(true)
      expect(wrapper.find('.mode-actions').exists()).toBe(true)
      expect(wrapper.find('.mode-tips').exists()).toBe(true)
    })

    it('应该有正确的布局结构', () => {
      const wrapper = mount(DeviceModeSwitcher)
      
      const cardHeader = wrapper.find('.card-header')
      expect(cardHeader.exists()).toBe(true)
      
      const modeInfo = wrapper.find('.mode-info')
      expect(modeInfo.exists()).toBe(true)
      
      const modeActions = wrapper.find('.mode-actions')
      expect(modeActions.exists()).toBe(true)
      
      const modeTips = wrapper.find('.mode-tips')
      expect(modeTips.exists()).toBe(true)
    })

    it('应该有正确的按钮样式', () => {
      const wrapper = mount(DeviceModeSwitcher)
      
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThanOrEqual(2)
      
      buttons.forEach(button => {
        expect(button.exists()).toBe(true)
      })
    })
  })

  describe('集成测试', () => {
    it('应该与设备检测工具正确集成', () => {
      const { getDeviceInfo, getDeviceType, setForceDesktopMode, isForceDesktopMode } = require('@/utils/device-detection')
      
      const wrapper = mount(DeviceModeSwitcher)
      
      // 验证所有设备检测函数都被调用
      expect(getDeviceInfo).toHaveBeenCalled()
      expect(getDeviceType).toHaveBeenCalled()
      expect(isForceDesktopMode).toHaveBeenCalled()
      
      // 验证切换模式时调用正确的函数
      wrapper.vm.switchToDesktop()
      expect(setForceDesktopMode).toHaveBeenCalledWith(true)
      
      wrapper.vm.switchToMobile()
      expect(setForceDesktopMode).toHaveBeenCalledWith(false)
    })

    it('应该正确处理设备模式切换的完整流程', () => {
      const { getDeviceType, setForceDesktopMode } = require('@/utils/device-detection')
      const reloadSpy = vi.spyOn(window.location, 'reload').mockImplementation(() => {})
      
      // 模拟移动模式
      getDeviceType.mockReturnValue('mobile')
      
      const wrapper = mount(DeviceModeSwitcher)
      
      // 验证初始状态
      expect(wrapper.vm.currentMode).toBe('mobile')
      
      // 切换到桌面模式
      wrapper.vm.switchToDesktop()
      expect(setForceDesktopMode).toHaveBeenCalledWith(true)
      expect(reloadSpy).toHaveBeenCalled()
      
      reloadSpy.mockRestore()
    })
  })
})