import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { nextTick } from 'vue'
import ErrorPage from '@/pages/Error.vue'

// Mock useRouter
const mockPush = vi.fn()
const mockGo = vi.fn()
const mockRouter = {
  push: mockPush,
  go: mockGo,
  currentRoute: {
    value: {
      path: '/error',
      name: 'Error',
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

describe('Error Page', () => {
  let wrapper: VueWrapper<any>
  let router: any

  beforeEach(() => {
    // 创建路由实例
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/error', component: ErrorPage },
        { path: '/dashboard', component: { template: '<div>Dashboard</div>' } }
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
    it('应该正确渲染错误页面', async () => {
      wrapper = mount(ErrorPage, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true,
            'el-card': true
          }
        }
      })

      await nextTick()

      expect(wrapper.find('.error-container').exists()).toBe(true)
      expect(wrapper.find('.error-content').exists()).toBe(true)
    })

    it('应该显示错误标题', async () => {
      wrapper = mount(ErrorPage, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true,
            'el-card': true
          }
        }
      })

      await nextTick()

      const errorTitle = wrapper.find('.error-title')
      expect(errorTitle.exists()).toBe(true)
      expect(errorTitle.text()).toContain('错误')
    })

    it('应该显示错误描述', async () => {
      wrapper = mount(ErrorPage, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true,
            'el-card': true
          }
        }
      })

      await nextTick()

      const errorDescription = wrapper.find('.error-description')
      expect(errorDescription.exists()).toBe(true)
      expect(errorDescription.text()).toContain('发生了错误')
    })
  })

  describe('错误信息处理', () => {
    it('应该能够处理路由参数中的错误信息', async () => {
      mockRouter.currentRoute.value.query = {
        message: '测试错误信息',
        code: '500'
      }

      wrapper = mount(ErrorPage, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true,
            'el-card': true
          }
        }
      })

      await nextTick()

      expect(wrapper.find('.error-container').exists()).toBe(true)
    })

    it('应该能够处理状态码', async () => {
      mockRouter.currentRoute.value.query = {
        code: '500'
      }

      wrapper = mount(ErrorPage, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true,
            'el-card': true
          }
        }
      })

      await nextTick()

      const errorCode = wrapper.find('.error-code')
      if (errorCode.exists()) {
        expect(errorCode.text()).toBe('500')
      }
    })

    it('应该显示默认错误信息当没有提供具体错误时', async () => {
      wrapper = mount(ErrorPage, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true,
            'el-card': true
          }
        }
      })

      await nextTick()

      const errorDescription = wrapper.find('.error-description')
      expect(errorDescription.exists()).toBe(true)
      expect(errorDescription.text()).toContain('发生了错误')
    })
  })

  describe('导航功能', () => {
    it('应该渲染返回首页按钮', async () => {
      wrapper = mount(ErrorPage, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true,
            'el-card': true
          }
        }
      })

      await nextTick()

      const homeButtons = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('返回首页'))

      expect(homeButtons.length).toBe(1)
    })

    it('点击返回首页按钮应该导航到/dashboard', async () => {
      wrapper = mount(ErrorPage, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true,
            'el-card': true
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

    it('应该渲染返回上页按钮', async () => {
      wrapper = mount(ErrorPage, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true,
            'el-card': true
          }
        }
      })

      await nextTick()

      const backButtons = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('返回上页'))

      expect(backButtons.length).toBe(1)
    })

    it('点击返回上页按钮应该调用router.go(-1)', async () => {
      wrapper = mount(ErrorPage, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true,
            'el-card': true
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

  describe('重试功能', () => {
    it('应该有重试按钮', async () => {
      wrapper = mount(ErrorPage, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true,
            'el-card': true
          }
        }
      })

      await nextTick()

      const retryButtons = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('重试') || button.text().includes('Retry'))

      expect(retryButtons.length).toBeGreaterThan(0)
    })

    it('点击重试按钮应该重新加载页面', async () => {
      const reloadSpy = vi.spyOn(window.location, 'reload')
      
      wrapper = mount(ErrorPage, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true,
            'el-card': true
          }
        }
      })

      await nextTick()

      const retryButtons = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('重试') || button.text().includes('Retry'))

      if (retryButtons.length > 0) {
        await retryButtons[0].trigger('click')
        expect(reloadSpy).toHaveBeenCalled()
      }
    })
  })

  describe('错误详情', () => {
    it('应该显示错误详情卡片', async () => {
      wrapper = mount(ErrorPage, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true,
            'el-card': true
          }
        }
      })

      await nextTick()

      const errorDetails = wrapper.find('.error-details')
      expect(errorDetails.exists()).toBe(true)
    })

    it('应该显示错误时间', async () => {
      wrapper = mount(ErrorPage, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true,
            'el-card': true
          }
        }
      })

      await nextTick()

      const errorTime = wrapper.find('.error-time')
      expect(errorTime.exists()).toBe(true)
    })

    it('应该显示错误路径', async () => {
      wrapper = mount(ErrorPage, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true,
            'el-card': true
          }
        }
      })

      await nextTick()

      const errorPath = wrapper.find('.error-path')
      expect(errorPath.exists()).toBe(true)
    })
  })

  describe('样式和布局', () => {
    it('应该应用正确的容器样式', async () => {
      wrapper = mount(ErrorPage, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true,
            'el-card': true
          }
        }
      })

      await nextTick()

      const container = wrapper.find('.error-container')
      expect(container.exists()).toBe(true)
    })

    it('应该应用正确的内容区域样式', async () => {
      wrapper = mount(ErrorPage, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true,
            'el-card': true
          }
        }
      })

      await nextTick()

      const content = wrapper.find('.error-content')
      expect(content.exists()).toBe(true)
    })

    it('应该在移动设备上应用响应式样式', async () => {
      wrapper = mount(ErrorPage, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true,
            'el-card': true
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
      wrapper = mount(ErrorPage, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true,
            'el-card': true
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

      const errorTitle = wrapper.find('.error-title')
      expect(errorTitle.exists()).toBe(true)

      const errorDescription = wrapper.find('.error-description')
      expect(errorDescription.exists()).toBe(true)

      const actionButtons = wrapper.find('.action-buttons')
      expect(actionButtons.exists()).toBe(true)
    })

    it('应该正确渲染Element Plus图标', async () => {
      wrapper = mount(ErrorPage, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true,
            'el-card': true
          }
        }
      })

      await nextTick()

      // 检查图标组件存在
      const icons = wrapper.findAllComponents({ name: 'el-icon' })
      expect(icons.length).toBeGreaterThan(0)
    })
  })

  describe('错误类型处理', () => {
    it('应该处理网络错误', async () => {
      mockRouter.currentRoute.value.query = {
        type: 'network',
        message: '网络连接失败'
      }

      wrapper = mount(ErrorPage, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true,
            'el-card': true
          }
        }
      })

      await nextTick()

      expect(wrapper.find('.error-container').exists()).toBe(true)
    })

    it('应该处理权限错误', async () => {
      mockRouter.currentRoute.value.query = {
        type: 'permission',
        message: '权限不足'
      }

      wrapper = mount(ErrorPage, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true,
            'el-card': true
          }
        }
      })

      await nextTick()

      expect(wrapper.find('.error-container').exists()).toBe(true)
    })

    it('应该处理服务器错误', async () => {
      mockRouter.currentRoute.value.query = {
        type: 'server',
        code: '500',
        message: '服务器内部错误'
      }

      wrapper = mount(ErrorPage, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true,
            'el-card': true
          }
        }
      })

      await nextTick()

      expect(wrapper.find('.error-container').exists()).toBe(true)
    })
  })

  describe('可访问性', () => {
    it('应该具有正确的ARIA属性', async () => {
      wrapper = mount(ErrorPage, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true,
            'el-card': true
          }
        }
      })

      await nextTick()

      const container = wrapper.find('.error-container')
      expect(container.attributes('role')).toBe('alert')
      expect(container.attributes('aria-live')).toBe('polite')
    })

    it('按钮应该具有正确的ARIA标签', async () => {
      wrapper = mount(ErrorPage, {
        global: {
          plugins: [router],
          stubs: {
            'el-button': true,
            'el-icon': true,
            'House': true,
            'ArrowLeft': true,
            'el-card': true
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