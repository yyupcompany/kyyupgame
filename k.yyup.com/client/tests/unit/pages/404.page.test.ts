import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { nextTick } from 'vue'
import Error404 from '@/pages/404.vue'

// Mock useRouter
const mockPush = vi.fn()
const mockGo = vi.fn()
const mockRouter = {
  push: mockPush,
  go: mockGo,
  currentRoute: {
    value: {
      path: '/404',
      name: '404',
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

describe('404 Error Page', () => {
  let wrapper: VueWrapper<any>
  let router: any

  beforeEach(() => {
    // 创建路由实例
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/dashboard', component: { template: '<div>Dashboard</div>' } },
        { path: '/404', component: Error404 }
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
    it('应该正确渲染404页面', async () => {
      wrapper = mount(Error404, {
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

      expect(wrapper.find('.error-container').exists()).toBe(true)
      expect(wrapper.find('.error-content').exists()).toBe(true)
    })

    it('应该显示正确的错误代码', async () => {
      wrapper = mount(Error404, {
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

      const errorCode = wrapper.find('.error-code')
      expect(errorCode.exists()).toBe(true)
      expect(errorCode.text()).toBe('404')
    })

    it('应该显示正确的错误标题', async () => {
      wrapper = mount(Error404, {
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
      expect(errorTitle.text()).toBe('页面未找到')
    })

    it('应该显示正确的错误描述', async () => {
      wrapper = mount(Error404, {
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
      expect(errorDescription.text()).toBe('抱歉，您访问的页面不存在或已被移动。')
    })
  })

  describe('返回首页功能', () => {
    it('应该渲染返回首页按钮', async () => {
      wrapper = mount(Error404, {
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
      wrapper = mount(Error404, {
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
      wrapper = mount(Error404, {
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
      wrapper = mount(Error404, {
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
      wrapper = mount(Error404, {
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
      wrapper = mount(Error404, {
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
      wrapper = mount(Error404, {
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
      wrapper = mount(Error404, {
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
      wrapper = mount(Error404, {
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

  describe('路由参数处理', () => {
    it('应该能够处理动态路由参数', async () => {
      mockRouter.currentRoute.value.params = {
        pathMatch: ['non-existent-page']
      }

      wrapper = mount(Error404, {
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

      // 验证组件仍然正常渲染
      expect(wrapper.find('.error-container').exists()).toBe(true)
      expect(wrapper.find('.error-content').exists()).toBe(true)
    })

    it('应该能够处理查询参数', async () => {
      mockRouter.currentRoute.value.query = {
        from: '/dashboard',
        reason: 'not_found'
      }

      wrapper = mount(Error404, {
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

      // 验证组件仍然正常渲染
      expect(wrapper.find('.error-container').exists()).toBe(true)
      expect(wrapper.find('.error-content').exists()).toBe(true)
    })
  })

  describe('可访问性', () => {
    it('应该具有正确的ARIA属性', async () => {
      wrapper = mount(Error404, {
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
      expect(container.attributes('role')).toBe('alert')
      expect(container.attributes('aria-live')).toBe('polite')
    })

    it('按钮应该具有正确的ARIA标签', async () => {
      wrapper = mount(Error404, {
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

      const buttons = wrapper.findAllComponents({ name: 'el-button' })
      buttons.forEach(button => {
        expect(button.attributes('aria-label')).toBeDefined()
      })
    })
  })
})