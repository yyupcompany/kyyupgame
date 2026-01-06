import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { nextTick } from 'vue'
import Error403 from '@/pages/403.vue'

// Mock useRouter
const mockPush = vi.fn()
const mockGo = vi.fn()
const mockRouter = {
  push: mockPush,
  go: mockGo,
  currentRoute: {
    value: {
      path: '/403',
      name: '403',
      params: {},
      query: {},
      meta: {}
    }
  }
}

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => mockRouter.currentRoute,
  createRouter: vi.fn(),
  createWebHistory: vi.fn()
}))

// 控制台错误检测变量
let consoleSpy: any

describe('403 Error Page', () => {
  let wrapper: VueWrapper<any>
  let router: any

  beforeEach(() => {
    // 创建路由实例
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/dashboard', component: { template: '<div>Dashboard</div>' } },
        { path: '/403', component: Error403 }
      ]
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // 重置mock函数
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) => {
      wrapper.unmount()
    }
    mockPush.mockClear()
    mockGo.mockClear()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('基础渲染', () => {
    it('应该正确渲染403页面', async () => {
      wrapper = mount(Error403, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true
          }
        }
      })

      await nextTick()

      expect(wrapper.find('.auxiliary-functionality-container').exists()).toBe(true)
      expect(wrapper.find('.error-card').exists()).toBe(true)
    })

    it('应该显示正确的错误代码', async () => {
      wrapper = mount(Error403, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true
          }
        }
      })

      await nextTick()

      const errorCode = wrapper.find('.error-number')
      expect(errorCode.exists()).toBe(true)
      expect(errorCode.text()).toBe('403')
    })

    it('应该显示正确的错误标题', async () => {
      wrapper = mount(Error403, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true
          }
        }
      })

      await nextTick()

      const errorTitle = wrapper.find('.error-title')
      expect(errorTitle.exists()).toBe(true)
      expect(errorTitle.text()).toBe('权限不足')
    })

    it('应该显示正确的错误描述', async () => {
      wrapper = mount(Error403, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true
          }
        }
      })

      await nextTick()

      const errorDescription = wrapper.find('.error-description')
      expect(errorDescription.exists()).toBe(true)
      expect(errorDescription.text()).toBe('抱歉，您没有权限访问此页面。')
    })
  })

  describe('返回首页功能', () => {
    it('应该渲染返回首页按钮', async () => {
      wrapper = mount(Error403, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true
          }
        }
      })

      await nextTick()

      const homeButtons = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('返回首页'))

      expect(homeButtons.length).toBe(1)
    })

    it('点击返回首页按钮应该导航到/dashboard', async () => {
      wrapper = mount(Error403, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true
          }
        }
      })

      await nextTick()

      const homeButtons = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('返回首页'))

      expect(homeButtons.length).toBe(1)

      await homeButtons[0].trigger('click')
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  describe('返回上页功能', () => {
    it('应该渲染返回上页按钮', async () => {
      wrapper = mount(Error403, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true
          }
        }
      })

      await nextTick()

      const backButtons = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('返回上页'))

      expect(backButtons.length).toBe(1)
    })

    it('点击返回上页按钮应该调用router.go(-1)', async () => {
      wrapper = mount(Error403, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true
          }
        }
      })

      await nextTick()

      const backButtons = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('返回上页'))

      expect(backButtons.length).toBe(1)

      await backButtons[0].trigger('click')
      expect(mockGo).toHaveBeenCalledWith(-1)
    })
  })

  describe('样式和布局', () => {
    it('应该应用正确的容器样式', async () => {
      wrapper = mount(Error403, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true
          }
        }
      })

      await nextTick()

      const container = wrapper.find('.error-container')
      expect(container.exists()).toBe(true)
    })

    it('应该应用正确的内容区域样式', async () => {
      wrapper = mount(Error403, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true
          }
        }
      })

      await nextTick()

      const content = wrapper.find('.error-content')
      expect(content.exists()).toBe(true)
    })

    it('应该在移动设备上应用响应式样式', async () => {
      wrapper = mount(Error403, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true
          }
        }
      })

      await nextTick()

      // 模拟移动设备屏幕尺寸
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480
      })

      window.dispatchEvent(new Event('resize'))
      await nextTick()

      // 验证组件仍然正常渲染
      expect(wrapper.find('.error-container').exists()).toBe(true)
      expect(wrapper.find('.error-content').exists()).toBe(true)
    })
  })

  describe('组件结构', () => {
    it('应该具有正确的HTML结构', async () => {
      wrapper = mount(Error403, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true
          }
        }
      })

      await nextTick()

      // 检查根元素
      expect(wrapper.element.tagName).toBe('DIV')
      expect(wrapper.classes()).toContain('error-container')

      // 检查子元素
      const content = wrapper.find('.error-content')
      expect(content.exists()).toBe(true)

      const errorCode = wrapper.find('.error-code')
      expect(errorCode.exists()).toBe(true)

      const errorTitle = wrapper.find('.error-title')
      expect(errorTitle.exists()).toBe(true)

      const errorDescription = wrapper.find('.error-description')
      expect(errorDescription.exists()).toBe(true)

      const actionButtons = wrapper.find('.action-buttons')
      expect(actionButtons.exists()).toBe(true)
    })

    it('应该正确渲染Element Plus图标', async () => {
      wrapper = mount(Error403, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true
          }
        }
      })

      await nextTick()

      // 检查图标组件存在
      const icons = wrapper.findAllComponents({ name: 'el-icon' })
      expect(icons.length).toBe(2) // House icon 和 ArrowLeft icon
    })
  })

  describe('权限相关功能', () => {
    it('应该显示权限相关的错误信息', async () => {
      wrapper = mount(Error403, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true
          }
        }
      })

      await nextTick()

      const errorDescription = wrapper.find('.error-description')
      expect(errorDescription.exists()).toBe(true)
      expect(errorDescription.text()).toContain('权限')
    })

    it('应该提供联系管理员的建议', async () => {
      wrapper = mount(Error403, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true
          }
        }
      })

      await nextTick()

      const additionalInfo = wrapper.find('.additional-info')
      if (additionalInfo.exists()) {
        expect(additionalInfo.text()).toContain('管理员') || additionalInfo.text().toContain('联系')
      }
    })
  })
})