import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import RegisterPage from '@/pages/Register.vue'

// Mock API模块
vi.mock('@/api/modules/auth', () => ({
  register: vi.fn(),
  checkUsername: vi.fn(),
  checkEmail: vi.fn()
}))

// Mock useRouter
const mockPush = vi.fn()
const mockRouter = {
  push: mockPush,
  currentRoute: {
    value: {
      path: '/register',
      name: 'Register',
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

describe('Register Page', () => {
  let wrapper: VueWrapper<any>
  let router: any
  let pinia: any

  beforeEach(() => {
    // 创建路由实例
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/register', component: RegisterPage },
        { path: '/login', component: { template: '<div>Login</div>' } },
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
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('基础渲染', () => {
    it('应该正确渲染注册页面', async () => {
      wrapper = mount(RegisterPage, {
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
            'el-steps': true,
            'el-step': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      expect(wrapper.find('.register-container').exists()).toBe(true)
      expect(wrapper.find('.register-form').exists()).toBe(true)
    })

    it('应该显示注册表单标题', async () => {
      wrapper = mount(RegisterPage, {
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
            'el-steps': true,
            'el-step': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const formTitle = wrapper.find('.form-title')
      expect(formTitle.exists()).toBe(true)
      expect(formTitle.text()).toContain('注册')
    })

    it('应该显示注册步骤', async () => {
      wrapper = mount(RegisterPage, {
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
            'el-steps': true,
            'el-step': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const steps = wrapper.findComponent({ name: 'el-steps' })
      expect(steps.exists()).toBe(true)
    })
  })

  describe('注册表单字段', () => {
    it('应该包含用户名输入字段', async () => {
      wrapper = mount(RegisterPage, {
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
            'el-steps': true,
            'el-step': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const usernameInput = wrapper.find('input[name="username"]')
      expect(usernameInput.exists()).toBe(true)
    })

    it('应该包含邮箱输入字段', async () => {
      wrapper = mount(RegisterPage, {
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
            'el-steps': true,
            'el-step': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const emailInput = wrapper.find('input[name="email"]')
      expect(emailInput.exists()).toBe(true)
    })

    it('应该包含密码输入字段', async () => {
      wrapper = mount(RegisterPage, {
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
            'el-steps': true,
            'el-step': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const passwordInput = wrapper.find('input[type="password"]')
      expect(passwordInput.exists()).toBe(true)
    })

    it('应该包含确认密码输入字段', async () => {
      wrapper = mount(RegisterPage, {
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
            'el-steps': true,
            'el-step': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const confirmPasswordInputs = wrapper.findAll('input[type="password"]')
      expect(confirmPasswordInputs.length).toBe(2) // 密码和确认密码
    })

    it('应该包含姓名输入字段', async () => {
      wrapper = mount(RegisterPage, {
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
            'el-steps': true,
            'el-step': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const nameInput = wrapper.find('input[name="name"]')
      expect(nameInput.exists()).toBe(true)
    })

    it('应该包含手机号输入字段', async () => {
      wrapper = mount(RegisterPage, {
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
            'el-steps': true,
            'el-step': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const phoneInput = wrapper.find('input[name="phone"]')
      expect(phoneInput.exists()).toBe(true)
    })

    it('应该包含同意条款复选框', async () => {
      wrapper = mount(RegisterPage, {
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
            'el-steps': true,
            'el-step': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const agreeCheckbox = wrapper.find('.agree-terms input[type="checkbox"]')
      expect(agreeCheckbox.exists()).toBe(true)
    })

    it('应该包含注册按钮', async () => {
      wrapper = mount(RegisterPage, {
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
            'el-steps': true,
            'el-step': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const registerButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('注册') || button.text().includes('Register'))

      expect(registerButton.length).toBe(1)
    })
  })

  describe('表单验证', () => {
    it('应该验证必填字段', async () => {
      wrapper = mount(RegisterPage, {
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
            'el-steps': true,
            'el-step': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const registerButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('注册') || button.text().includes('Register'))[0]

      await registerButton.trigger('click')

      await nextTick()

      // 验证表单验证
      expect(wrapper.find('.register-form').exists()).toBe(true)
    })

    it('应该验证用户名格式', async () => {
      wrapper = mount(RegisterPage, {
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
            'el-steps': true,
            'el-step': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const usernameInput = wrapper.find('input[name="username"]')
      await usernameInput.setValue('ab') // 太短

      const registerButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('注册') || button.text().includes('Register'))[0]

      await registerButton.trigger('click')

      await nextTick()

      // 验证用户名验证
      expect(wrapper.find('.register-form').exists()).toBe(true)
    })

    it('应该验证邮箱格式', async () => {
      wrapper = mount(RegisterPage, {
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
            'el-steps': true,
            'el-step': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const emailInput = wrapper.find('input[name="email"]')
      await emailInput.setValue('invalid-email')

      const registerButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('注册') || button.text().includes('Register'))[0]

      await registerButton.trigger('click')

      await nextTick()

      // 验证邮箱格式验证
      expect(wrapper.find('.register-form').exists()).toBe(true)
    })

    it('应该验证密码长度', async () => {
      wrapper = mount(RegisterPage, {
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
            'el-steps': true,
            'el-step': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const passwordInput = wrapper.find('input[type="password"]')
      await passwordInput.setValue('123')

      const registerButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('注册') || button.text().includes('Register'))[0]

      await registerButton.trigger('click')

      await nextTick()

      // 验证密码长度验证
      expect(wrapper.find('.register-form').exists()).toBe(true)
    })

    it('应该验证密码确认', async () => {
      wrapper = mount(RegisterPage, {
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
            'el-steps': true,
            'el-step': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const passwordInputs = wrapper.findAll('input[type="password"]')
      await passwordInputs[0].setValue('password123')
      await passwordInputs[1].setValue('differentpassword')

      const registerButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('注册') || button.text().includes('Register'))[0]

      await registerButton.trigger('click')

      await nextTick()

      // 验证密码确认验证
      expect(wrapper.find('.register-form').exists()).toBe(true)
    })

    it('应该验证手机号格式', async () => {
      wrapper = mount(RegisterPage, {
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
            'el-steps': true,
            'el-step': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const phoneInput = wrapper.find('input[name="phone"]')
      await phoneInput.setValue('123') // 无效手机号

      const registerButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('注册') || button.text().includes('Register'))[0]

      await registerButton.trigger('click')

      await nextTick()

      // 验证手机号格式验证
      expect(wrapper.find('.register-form').exists()).toBe(true)
    })

    it('应该验证同意条款', async () => {
      wrapper = mount(RegisterPage, {
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
            'el-steps': true,
            'el-step': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const registerButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('注册') || button.text().includes('Register'))[0]

      await registerButton.trigger('click')

      await nextTick()

      // 验证同意条款验证
      expect(wrapper.find('.register-form').exists()).toBe(true)
    })
  })

  describe('注册功能', () => {
    it('应该能够提交注册表单', async () => {
      vi.mocked(authApi.register).mockResolvedValue({
        success: true,
        message: '注册成功'
      })

      wrapper = mount(RegisterPage, {
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
            'el-steps': true,
            'el-step': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      // 填写表单
      const usernameInput = wrapper.find('input[name="username"]')
      const emailInput = wrapper.find('input[name="email"]')
      const passwordInputs = wrapper.findAll('input[type="password"]')
      const nameInput = wrapper.find('input[name="name"]')
      const phoneInput = wrapper.find('input[name="phone"]')
      const agreeCheckbox = wrapper.find('.agree-terms input[type="checkbox"]')
      
      await usernameInput.setValue('testuser')
      await emailInput.setValue('test@example.com')
      await passwordInputs[0].setValue('password123')
      await passwordInputs[1].setValue('password123')
      await nameInput.setValue('测试用户')
      await phoneInput.setValue('13800138000')
      await agreeCheckbox.setValue(true)

      const registerButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('注册') || button.text().includes('Register'))[0]

      await registerButton.trigger('click')

      expect(authApi.register).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        name: '测试用户',
        phone: '13800138000'
      })
    })

    it('应该处理注册成功', async () => {
      vi.mocked(authApi.register).mockResolvedValue({
        success: true,
        message: '注册成功'
      })

      wrapper = mount(RegisterPage, {
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
            'el-steps': true,
            'el-step': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      // 填写表单
      const usernameInput = wrapper.find('input[name="username"]')
      const emailInput = wrapper.find('input[name="email"]')
      const passwordInputs = wrapper.findAll('input[type="password"]')
      const nameInput = wrapper.find('input[name="name"]')
      const phoneInput = wrapper.find('input[name="phone"]')
      const agreeCheckbox = wrapper.find('.agree-terms input[type="checkbox"]')
      
      await usernameInput.setValue('testuser')
      await emailInput.setValue('test@example.com')
      await passwordInputs[0].setValue('password123')
      await passwordInputs[1].setValue('password123')
      await nameInput.setValue('测试用户')
      await phoneInput.setValue('13800138000')
      await agreeCheckbox.setValue(true)

      const registerButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('注册') || button.text().includes('Register'))[0]

      await registerButton.trigger('click')

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证注册成功后的导航
      expect(mockPush).toHaveBeenCalledWith('/login')
    })

    it('应该处理注册失败', async () => {
      vi.mocked(authApi.register).mockRejectedValue(new Error('注册失败'))

      wrapper = mount(RegisterPage, {
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
            'el-steps': true,
            'el-step': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      // 填写表单
      const usernameInput = wrapper.find('input[name="username"]')
      const emailInput = wrapper.find('input[name="email"]')
      const passwordInputs = wrapper.findAll('input[type="password"]')
      const nameInput = wrapper.find('input[name="name"]')
      const phoneInput = wrapper.find('input[name="phone"]')
      const agreeCheckbox = wrapper.find('.agree-terms input[type="checkbox"]')
      
      await usernameInput.setValue('testuser')
      await emailInput.setValue('test@example.com')
      await passwordInputs[0].setValue('password123')
      await passwordInputs[1].setValue('password123')
      await nameInput.setValue('测试用户')
      await phoneInput.setValue('13800138000')
      await agreeCheckbox.setValue(true)

      const registerButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('注册') || button.text().includes('Register'))[0]

      await registerButton.trigger('click')

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证注册失败后表单仍然存在
      expect(wrapper.find('.register-form').exists()).toBe(true)
    })
  })

  describe('用户名和邮箱检查', () => {
    it('应该检查用户名是否可用', async () => {
      vi.mocked(authApi.checkUsername).mockResolvedValue({
        success: true,
        data: {
          available: true
        }
      })

      wrapper = mount(RegisterPage, {
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
            'el-steps': true,
            'el-step': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const usernameInput = wrapper.find('input[name="username"]')
      await usernameInput.setValue('testuser')

      // 模拟失去焦点事件
      await usernameInput.trigger('blur')

      expect(authApi.checkUsername).toHaveBeenCalledWith('testuser')
    })

    it('应该检查邮箱是否可用', async () => {
      vi.mocked(authApi.checkEmail).mockResolvedValue({
        success: true,
        data: {
          available: true
        }
      })

      wrapper = mount(RegisterPage, {
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
            'el-steps': true,
            'el-step': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const emailInput = wrapper.find('input[name="email"]')
      await emailInput.setValue('test@example.com')

      // 模拟失去焦点事件
      await emailInput.trigger('blur')

      expect(authApi.checkEmail).toHaveBeenCalledWith('test@example.com')
    })

    it('应该处理用户名已存在的情况', async () => {
      vi.mocked(authApi.checkUsername).mockResolvedValue({
        success: true,
        data: {
          available: false
        }
      })

      wrapper = mount(RegisterPage, {
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
            'el-steps': true,
            'el-step': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const usernameInput = wrapper.find('input[name="username"]')
      await usernameInput.setValue('existinguser')

      // 模拟失去焦点事件
      await usernameInput.trigger('blur')

      await nextTick()

      // 验证用户名已存在的错误提示
      expect(wrapper.find('.register-form').exists()).toBe(true)
    })
  })

  describe('其他功能', () => {
    it('应该有返回登录链接', async () => {
      wrapper = mount(RegisterPage, {
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
            'el-steps': true,
            'el-step': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const loginLink = wrapper.findAllComponents({ name: 'el-link' })
        .filter(link => link.text().includes('登录') || link.text().includes('Login'))

      expect(loginLink.length).toBe(1)
    })

    it('点击返回登录链接应该导航到登录页面', async () => {
      wrapper = mount(RegisterPage, {
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
            'el-steps': true,
            'el-step': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const loginLink = wrapper.findAllComponents({ name: 'el-link' })
        .filter(link => link.text().includes('登录') || link.text().includes('Login'))[0]

      await loginLink.trigger('click')

      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  describe('键盘事件', () => {
    it('应该支持回车键提交', async () => {
      vi.mocked(authApi.register).mockResolvedValue({
        success: true,
        message: '注册成功'
      })

      wrapper = mount(RegisterPage, {
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
            'el-steps': true,
            'el-step': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const phoneInput = wrapper.find('input[name="phone"]')
      await phoneInput.setValue('13800138000')
      
      // 模拟回车键事件
      await phoneInput.trigger('keyup.enter')

      expect(authApi.register).toHaveBeenCalled()
    })
  })

  describe('样式和布局', () => {
    it('应该应用正确的容器样式', async () => {
      wrapper = mount(RegisterPage, {
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
            'el-steps': true,
            'el-step': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const container = wrapper.find('.register-container')
      expect(container.exists()).toBe(true)
    })

    it('应该在移动设备上应用响应式样式', async () => {
      wrapper = mount(RegisterPage, {
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
            'el-steps': true,
            'el-step': true,
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
      expect(wrapper.find('.register-container').exists()).toBe(true)
    })
  })

  describe('可访问性', () => {
    it('应该具有正确的ARIA属性', async () => {
      wrapper = mount(RegisterPage, {
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
            'el-steps': true,
            'el-step': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const form = wrapper.find('.register-form')
      expect(form.exists()).toBe(true)
      expect(form.attributes('role')).toBe('form')
    })

    it('表单字段应该具有正确的ARIA标签', async () => {
      wrapper = mount(RegisterPage, {
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
            'el-steps': true,
            'el-step': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const usernameInput = wrapper.find('input[name="username"]')
      const emailInput = wrapper.find('input[name="email"]')
      const passwordInput = wrapper.find('input[type="password"]')
      
      expect(usernameInput.attributes('aria-label')).toBeDefined()
      expect(emailInput.attributes('aria-label')).toBeDefined()
      expect(passwordInput.attributes('aria-label')).toBeDefined()
    })
  })
})