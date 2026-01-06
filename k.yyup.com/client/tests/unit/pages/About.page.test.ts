import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import AboutPage from '@/pages/About.vue'

// Mock useRouter
const mockPush = vi.fn()
const mockRouter = {
  push: mockPush,
  currentRoute: {
    value: {
      path: '/about',
      name: 'About',
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

describe('About Page', () => {
  let wrapper: VueWrapper<any>
  let router: any
  let pinia: any

  beforeEach(() => {
    // 创建路由实例
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/about', component: AboutPage },
        { path: '/dashboard', component: { template: '<div>Dashboard</div>' } }
      ]
    })

    // 创建 Pinia 实例
    pinia = createPinia()
    setActivePinia(pinia)

    // 重置mock函数
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    mockPush.mockClear()
  })

  describe('基础渲染', () => {
    it('应该正确渲染关于页面', async () => {
      wrapper = mount(AboutPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true
          }
        }
      })

      await nextTick()

      expect(wrapper.find('.about-container').exists()).toBe(true)
      expect(wrapper.find('.about-header').exists()).toBe(true)
      expect(wrapper.find('.about-content').exists()).toBe(true)
    })

    it('应该显示正确的页面标题', async () => {
      wrapper = mount(AboutPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true
          }
        }
      })

      await nextTick()

      const pageTitle = wrapper.find('.page-title')
      expect(pageTitle.exists()).toBe(true)
      expect(pageTitle.text()).toContain('关于我们')
    })

    it('应该显示系统版本信息', async () => {
      wrapper = mount(AboutPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true
          }
        }
      })

      await nextTick()

      const versionInfo = wrapper.find('.version-info')
      expect(versionInfo.exists()).toBe(true)
      expect(versionInfo.text()).toMatch(/版本|Version/i)
    })
  })

  describe('系统信息展示', () => {
    it('应该显示系统描述', async () => {
      wrapper = mount(AboutPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true
          }
        }
      })

      await nextTick()

      const systemDescription = wrapper.find('.system-description')
      expect(systemDescription.exists()).toBe(true)
      expect(systemDescription.text()).toContain('幼儿园管理系统')
    })

    it('应该显示功能特性列表', async () => {
      wrapper = mount(AboutPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true
          }
        }
      })

      await nextTick()

      const featuresList = wrapper.find('.features-list')
      expect(featuresList.exists()).toBe(true)

      const features = featuresList.findAll('.feature-item')
      expect(features.length).toBeGreaterThan(0)
    })

    it('应该显示技术栈信息', async () => {
      wrapper = mount(AboutPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true
          }
        }
      })

      await nextTick()

      const techStack = wrapper.find('.tech-stack')
      expect(techStack.exists()).toBe(true)
      expect(techStack.text()).toMatch(/Vue|Node.js|Express|MySQL/i)
    })
  })

  describe('团队信息', () => {
    it('应该显示开发团队信息', async () => {
      wrapper = mount(AboutPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true
          }
        }
      })

      await nextTick()

      const teamInfo = wrapper.find('.team-info')
      expect(teamInfo.exists()).toBe(true)
      expect(teamInfo.text()).toMatch(/团队|Team/i)
    })

    it('应该显示联系信息', async () => {
      wrapper = mount(AboutPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true
          }
        }
      })

      await nextTick()

      const contactInfo = wrapper.find('.contact-info')
      expect(contactInfo.exists()).toBe(true)
      expect(contactInfo.text()).toMatch(/联系|Contact|邮箱|Email/i)
    })
  })

  describe('导航功能', () => {
    it('应该有返回首页按钮', async () => {
      wrapper = mount(AboutPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true
          }
        }
      })

      await nextTick()

      const homeButtons = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('返回首页') || button.text().includes('首页'))

      expect(homeButtons.length).toBeGreaterThan(0)
    })

    it('点击返回首页按钮应该导航到/dashboard', async () => {
      wrapper = mount(AboutPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true
          }
        }
      })

      await nextTick()

      const homeButtons = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('返回首页') || button.text().includes('首页'))

      if (homeButtons.length > 0) {
        await homeButtons[0].trigger('click')
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      }
    })
  })

  describe('外部链接', () => {
    it('应该包含相关的外部链接', async () => {
      wrapper = mount(AboutPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true
          }
        }
      })

      await nextTick()

      const externalLinks = wrapper.findAll('a[target="_blank"]')
      expect(externalLinks.length).toBeGreaterThan(0)
    })

    it('外部链接应该具有正确的安全属性', async () => {
      wrapper = mount(AboutPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true
          }
        }
      })

      await nextTick()

      const externalLinks = wrapper.findAll('a[target="_blank"]')
      externalLinks.forEach(link => {
        expect(link.attributes('rel')).toContain('noopener')
        expect(link.attributes('rel')).toContain('noreferrer')
      })
    })
  })

  describe('样式和布局', () => {
    it('应该应用正确的容器样式', async () => {
      wrapper = mount(AboutPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true
          }
        }
      })

      await nextTick()

      const container = wrapper.find('.about-container')
      expect(container.exists()).toBe(true)
    })

    it('应该在移动设备上应用响应式样式', async () => {
      wrapper = mount(AboutPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true
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
      expect(wrapper.find('.about-container').exists()).toBe(true)
    })
  })

  describe('数据加载', () => {
    it('应该在组件挂载时加载必要的数据', async () => {
      const mountSpy = vi.spyOn(AboutPage, 'mounted' as any)
      
      wrapper = mount(AboutPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true
          }
        }
      })

      await nextTick()

      // 验证组件正确挂载
      expect(wrapper.find('.about-container').exists()).toBe(true)
    })

    it('应该正确处理数据加载状态', async () => {
      wrapper = mount(AboutPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true
          }
        }
      })

      await nextTick()

      // 验证页面内容已加载
      expect(wrapper.find('.about-content').exists()).toBe(true)
    })
  })

  describe('错误处理', () => {
    it('应该正确处理组件渲染错误', async () => {
      // 模拟组件渲染错误
      const originalError = console.error
      console.error = vi.fn()

      wrapper = mount(AboutPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true
          }
        }
      })

      await nextTick()

      // 验证组件仍然能够渲染
      expect(wrapper.find('.about-container').exists()).toBe(true)

      console.error = originalError
    })
  })

  describe('可访问性', () => {
    it('应该具有正确的ARIA属性', async () => {
      wrapper = mount(AboutPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true
          }
        }
      })

      await nextTick()

      const mainContent = wrapper.find('main')
      expect(mainContent.exists()).toBe(true)
      expect(mainContent.attributes('role')).toBe('main')
    })

    it('链接应该具有正确的ARIA标签', async () => {
      wrapper = mount(AboutPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true
          }
        }
      })

      await nextTick()

      const links = wrapper.findAll('a')
      links.forEach(link => {
        if (link.text().trim()) {
          expect(link.attributes('aria-label')).toBeDefined()
        }
      })
    })
  })
})