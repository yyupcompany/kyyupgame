import { describe, it, expect, vi, beforeEach } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'

// Mock theme utils
vi.mock('@/utils/theme', () => ({
  currentTheme: { value: 'default' },
  setTheme: vi.fn(),
  getThemeName: vi.fn((theme: string) => {
    const names = {
      default: '默认主题',
      dark: '暗黑主题',
      custom: '自定义主题',
      glassmorphism: '玻璃态主题'
    }
    return names[theme as keyof typeof names] || theme
  }),
  type: 'ThemeType'
}))

// Mock Element Plus icons
vi.mock('@element-plus/icons-vue', () => ({
  Sunny: { name: 'Sunny', template: '<div class="mock-sunny-icon">☀️</div>' },
  Moon: { name: 'Moon', template: '<div class="mock-moon-icon">🌙</div>' },
  Setting: { name: 'Setting', template: '<div class="mock-setting-icon">⚙️</div>' },
  Picture: { name: 'Picture', template: '<div class="mock-picture-icon">🖼️</div>' }
}))

// 控制台错误检测变量
let consoleSpy: any

describe('ThemeSwitcher.vue', () => {
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
  let pinia: any

  beforeEach(() => {
    // Setup Pinia
    pinia = createPinia()
    setActivePinia(pinia)
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  const createWrapper = (props = {}) => {
    return mount(ThemeSwitcher, {
      props,
      global: {
        plugins: [pinia],
        mocks: {
          $t: (key: string) => key
        }
      }
    })
  }

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.theme-switcher').exists()).toBe(true)
    })

    it('renders dropdown button', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.theme-toggle-btn').exists()).toBe(true)
    })

    it('renders dropdown menu structure', () => {
      const wrapper = createWrapper()
      // Element Plus组件被stub，检查HTML结构
      expect(wrapper.html()).toContain('el-dropdown')
    })

    it('has available themes data', () => {
      const wrapper = createWrapper()
      // 检查组件的availableThemes数据
      expect(wrapper.vm.availableThemes).toBeDefined()
      expect(wrapper.vm.availableThemes.length).toBeGreaterThan(0)
    })
  })

  describe('Theme Functionality', () => {
    it('displays current theme correctly', () => {
      const wrapper = createWrapper()
      const button = wrapper.find('.theme-toggle-btn')
      // 检查title属性存在，内容可能因为mock而不同
      expect(button.attributes('title')).toBeDefined()
      expect(button.attributes('title')).toContain('当前主题')
    })

    it('has current theme data', () => {
      const wrapper = createWrapper()
      // 检查当前主题数据
      expect(wrapper.vm.currentTheme).toBeDefined()
    })

    it('handles theme change', async () => {
      const { setTheme } = await import('@/utils/theme')
      const wrapper = createWrapper()
      
      // Simulate theme change
      await wrapper.vm.handleThemeChange('dark')
      
      expect(setTheme).toHaveBeenCalledWith('dark')
    })
  })

  describe('Theme Icons', () => {
    it('returns correct icon for default theme', () => {
      const wrapper = createWrapper()
      const icon = wrapper.vm.getThemeIcon('default')
      expect(icon).toBe('Sunny')
    })

    it('returns correct icon for dark theme', () => {
      const wrapper = createWrapper()
      const icon = wrapper.vm.getThemeIcon('dark')
      expect(icon).toBe('Moon')
    })

    it('returns correct icon for custom theme', () => {
      const wrapper = createWrapper()
      const icon = wrapper.vm.getThemeIcon('custom')
      expect(icon).toBe('Setting')
    })

    it('returns correct icon for glassmorphism theme', () => {
      const wrapper = createWrapper()
      const icon = wrapper.vm.getThemeIcon('glassmorphism')
      expect(icon).toBe('Picture')
    })
  })

  describe('Theme Names', () => {
    it('gets correct theme name', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.getThemeName('default')).toBe('默认主题')
      expect(wrapper.vm.getThemeName('dark')).toBe('暗黑主题')
    })
  })

  describe('Accessibility', () => {
    it('has proper aria-label', () => {
      const wrapper = createWrapper()
      const button = wrapper.find('.theme-toggle-btn')
      expect(button.attributes('aria-label')).toContain('当前主题')
    })

    it('has proper title attribute', () => {
      const wrapper = createWrapper()
      const button = wrapper.find('.theme-toggle-btn')
      expect(button.attributes('title')).toContain('当前主题')
    })
  })

  describe('Component Structure', () => {
    it('has correct CSS classes', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.theme-switcher').exists()).toBe(true)
      expect(wrapper.find('.theme-toggle-btn').exists()).toBe(true)
      // Element Plus组件被stub，检查HTML结构
      expect(wrapper.html()).toContain('el-dropdown')
    })

    it('has theme data structure', () => {
      const wrapper = createWrapper()
      // 检查组件数据而不是DOM结构（因为Element Plus被stub）
      expect(wrapper.vm.availableThemes).toBeDefined()
      expect(Array.isArray(wrapper.vm.availableThemes)).toBe(true)
    })

    it('has theme methods', () => {
      const wrapper = createWrapper()
      // 检查组件方法
      expect(typeof wrapper.vm.getThemeIcon).toBe('function')
      expect(typeof wrapper.vm.handleThemeChange).toBe('function')
    })

    it('has correct theme data properties', () => {
      const wrapper = createWrapper()
      const themes = wrapper.vm.availableThemes
      expect(themes.length).toBeGreaterThan(0)

      // 检查第一个主题的结构
      if (themes.length > 0) {
        expect(themes[0]).toHaveProperty('value')
        expect(themes[0]).toHaveProperty('label')
        expect(themes[0]).toHaveProperty('icon')
      }
    })
  })
})
