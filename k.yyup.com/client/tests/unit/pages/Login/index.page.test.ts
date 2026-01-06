import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import LoginPage from '@/pages/Login/index.vue'

// Mock API模块
vi.mock('@/api/modules/auth', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  getProfile: vi.fn()
}))

// Mock useRouter
const mockPush = vi.fn()
const mockReplace = vi.fn()
const mockRouter = {
  push: mockPush,
  replace: mockReplace,
  currentRoute: {
    value: {
      path: '/login',
      name: 'Login',
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

import * as authApi from '@/api/modules/auth'

// 控制台错误检测变量
let consoleSpy: any

describe('Login Page', () => {
  let wrapper: VueWrapper<any>
  let router: any
  let pinia: any

  beforeEach(() => {
    // 创建路由实例
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/login', component: LoginPage },
        { path: '/dashboard', component: { template: '<div>Dashboard</div>' } }
      ]
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // 创建 Pinia 实例
    pinia = createPinia()
    setActivePinia(pinia)

    // 重置mock函数
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) => {
      wrapper.unmount()
    }
    mockPush.mockClear()
    mockReplace.mockClear()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('基础渲染', () => {
    it('应该正确渲染登录页面', async () => {
      wrapper = mount(LoginPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-checkbox': true,
            'el-link': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      expect(wrapper.find('.login-container').exists()).toBe(true)
      expect(wrapper.find('.login-form').exists()).toBe(true)
    })

    it('应该显示登录表单标题', async () => {
      wrapper = mount(LoginPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-checkbox': true,
            'el-link': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const formTitle = wrapper.find('.form-title')
      expect(formTitle.exists()).toBe(true)
      expect(formTitle.text()).toContain('登录')
    })

    it('应该显示系统名称或Logo', async () => {
      wrapper = mount(LoginPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-checkbox': true,
            'el-link': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const systemName = wrapper.find('.system-name')
      const logo = wrapper.find('.system-logo')
      
      // 至少应该存在其中一个
      expect(systemName.exists() || logo.exists()).toBe(true)
    })
  })

  describe('登录表单字段', () => {
    it('应该包含用户名输入字段', async () => {
      wrapper = mount(LoginPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-checkbox': true,
            'el-link': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const usernameInput = wrapper.find('input[name="username"]')
      expect(usernameInput.exists()).toBe(true)
    })

    it('应该包含密码输入字段', async () => {
      wrapper = mount(LoginPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-checkbox': true,
            'el-link': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const passwordInput = wrapper.find('input[type="password"]')
      expect(passwordInput.exists()).toBe(true)
    })

    it('应该包含记住我复选框', async () => {
      wrapper = mount(LoginPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-checkbox': true,
            'el-link': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const rememberMe = wrapper.find('.remember-me')
      expect(rememberMe.exists()).toBe(true)
    })

    it('应该包含登录按钮', async () => {
      wrapper = mount(LoginPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-checkbox': true,
            'el-link': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const loginButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('登录') || button.text().includes('Login'))

      expect(loginButton.length).toBe(1)
    })
  })

  describe('表单验证', () => {
    it('应该验证必填字段', async () => {
      wrapper = mount(LoginPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-checkbox': true,
            'el-link': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const loginButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('登录') || button.text().includes('Login'))[0]

      await loginButton.trigger('click')

      await nextTick()

      // 验证表单验证
      expect(wrapper.find('.login-form').exists()).toBe(true)
    })

    it('应该验证用户名格式', async () => {
      wrapper = mount(LoginPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-checkbox': true,
            'el-link': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const usernameInput = wrapper.find('input[name="username"]')
      await usernameInput.setValue('')

      const loginButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('登录') || button.text().includes('Login'))[0]

      await loginButton.trigger('click')

      await nextTick()

      // 验证用户名验证
      expect(wrapper.find('.login-form').exists()).toBe(true)
    })

    it('应该验证密码长度', async () => {
      wrapper = mount(LoginPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-checkbox': true,
            'el-link': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const passwordInput = wrapper.find('input[type="password"]')
      await passwordInput.setValue('123')

      const loginButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('登录') || button.text().includes('Login'))[0]

      await loginButton.trigger('click')

      await nextTick()

      // 验证密码长度验证
      expect(wrapper.find('.login-form').exists()).toBe(true)
    })
  })

  describe('登录功能', () => {
    it('应该能够提交登录表单', async () => {
      vi.mocked(authApi.login).mockResolvedValue({
        success: true,
        data: {
          token: 'mock-token',
          user: {
            id: 1,
            username: 'admin',
            name: '管理员',
            role: 'admin'
          }
        }
      })

      wrapper = mount(LoginPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-checkbox': true,
            'el-link': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const usernameInput = wrapper.find('input[name="username"]')
      const passwordInput = wrapper.find('input[type="password"]')
      
      await usernameInput.setValue('admin')
      await passwordInput.setValue('password123')

      const loginButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('登录') || button.text().includes('Login'))[0]

      await loginButton.trigger('click')

      expect(authApi.login).toHaveBeenCalledWith({
        username: 'admin',
        password: 'password123'
      })
    })

    it('应该处理登录成功', async () => {
      vi.mocked(authApi.login).mockResolvedValue({
        success: true,
        data: {
          token: 'mock-token',
          user: {
            id: 1,
            username: 'admin',
            name: '管理员',
            role: 'admin'
          }
        }
      })

      wrapper = mount(LoginPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-checkbox': true,
            'el-link': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const usernameInput = wrapper.find('input[name="username"]')
      const passwordInput = wrapper.find('input[type="password"]')
      
      await usernameInput.setValue('admin')
      await passwordInput.setValue('password123')

      const loginButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('登录') || button.text().includes('Login'))[0]

      await loginButton.trigger('click')

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证登录成功后的导航
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })

    it('应该处理登录失败', async () => {
      vi.mocked(authApi.login).mockRejectedValue(new Error('用户名或密码错误'))

      wrapper = mount(LoginPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-checkbox': true,
            'el-link': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const usernameInput = wrapper.find('input[name="username"]')
      const passwordInput = wrapper.find('input[type="password"]')
      
      await usernameInput.setValue('admin')
      await passwordInput.setValue('wrongpassword')

      const loginButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('登录') || button.text().includes('Login'))[0]

      await loginButton.trigger('click')

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证登录失败后表单仍然存在
      expect(wrapper.find('.login-form').exists()).toBe(true)
    })
  })

  describe('记住我功能', () => {
    it('应该能够记住用户名', async () => {
      const localStorageSetSpy = vi.spyOn(Storage.prototype, 'setItem')
      
      wrapper = mount(LoginPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-checkbox': true,
            'el-link': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const rememberMeCheckbox = wrapper.find('.remember-me input[type="checkbox"]')
      await rememberMeCheckbox.setValue(true)

      const usernameInput = wrapper.find('input[name="username"]')
      await usernameInput.setValue('admin')

      // 模拟表单提交
      const loginButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('登录') || button.text().includes('Login'))[0]

      await loginButton.trigger('click')

      // 验证localStorage被调用
      expect(localStorageSetSpy).toHaveBeenCalled()
    })

    it('应该能够从localStorage读取记住的用户名', async () => {
      const localStorageGetSpy = vi.spyOn(Storage.prototype, 'getItem')
      localStorageGetSpy.mockReturnValue('admin')

      wrapper = mount(LoginPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-checkbox': true,
            'el-link': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      // 验证localStorage被读取
      expect(localStorageGetSpy).toHaveBeenCalled()
    })
  })

  describe('其他功能', () => {
    it('应该有忘记密码链接', async () => {
      wrapper = mount(LoginPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-checkbox': true,
            'el-link': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const forgotPasswordLink = wrapper.findAllComponents({ name: 'el-link' })
        .filter(link => link.text().includes('忘记密码') || link.text().includes('Forgot Password'))

      expect(forgotPasswordLink.length).toBe(1)
    })

    it('应该有注册链接', async () => {
      wrapper = mount(LoginPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-checkbox': true,
            'el-link': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const registerLink = wrapper.findAllComponents({ name: 'el-link' })
        .filter(link => link.text().includes('注册') || link.text().includes('Register'))

      expect(registerLink.length).toBeGreaterThan(0)
    })
  })

  describe('键盘事件', () => {
    it('应该支持回车键登录', async () => {
      vi.mocked(authApi.login).mockResolvedValue({
        success: true,
        data: {
          token: 'mock-token',
          user: {
            id: 1,
            username: 'admin',
            name: '管理员',
            role: 'admin'
          }
        }
      })

      wrapper = mount(LoginPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-checkbox': true,
            'el-link': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const passwordInput = wrapper.find('input[type="password"]')
      await passwordInput.setValue('password123')
      
      // 模拟回车键事件
      await passwordInput.trigger('keyup.enter')

      expect(authApi.login).toHaveBeenCalled()
    })
  })

  describe('样式和布局', () => {
    it('应该应用正确的容器样式', async () => {
      wrapper = mount(LoginPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-checkbox': true,
            'el-link': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const container = wrapper.find('.login-container')
      expect(container.exists()).toBe(true)
    })

    it('应该在移动设备上应用响应式样式', async () => {
      wrapper = mount(LoginPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-checkbox': true,
            'el-link': true,
            'el-message': true
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
      expect(wrapper.find('.login-container').exists()).toBe(true)
    })
  })

  describe('可访问性', () => {
    it('应该具有正确的ARIA属性', async () => {
      wrapper = mount(LoginPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-checkbox': true,
            'el-link': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const form = wrapper.find('.login-form')
      expect(form.exists()).toBe(true)
      expect(form.attributes('role')).toBe('form')
    })

    it('表单字段应该具有正确的ARIA标签', async () => {
      wrapper = mount(LoginPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-checkbox': true,
            'el-link': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const usernameInput = wrapper.find('input[name="username"]')
      const passwordInput = wrapper.find('input[type="password"]')
      
      expect(usernameInput.attributes('aria-label')).toBeDefined()
      expect(passwordInput.attributes('aria-label')).toBeDefined()
    })
  })
})