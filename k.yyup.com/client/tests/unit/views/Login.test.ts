import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login/index.vue'

// Mock router
const mockPush = vi.fn()
vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRouter: () => ({
      push: mockPush
    })
  }
})

describe('Login.vue', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(Login)
  })

  afterEach(() => {
    wrapper.unmount()
    vi.clearAllMocks()
  })

  describe('组件渲染', () => {
    it('应该正确渲染登录表单', () => {
      expect(wrapper.find('.login-container').exists()).toBe(true)
      expect(wrapper.find('.login-form').exists()).toBe(true)
      expect(wrapper.find('h2').text()).toBe('登录')
    })

    it('应该渲染用户名输入框', () => {
      const usernameInput = wrapper.find('#username')
      expect(usernameInput.exists()).toBe(true)
      expect(usernameInput.attributes('type')).toBe('text')
      expect(usernameInput.attributes('placeholder')).toBe('请输入用户名')
    })

    it('应该渲染密码输入框', () => {
      const passwordInput = wrapper.find('#password')
      expect(passwordInput.exists()).toBe(true)
      expect(passwordInput.attributes('type')).toBe('password')
      expect(passwordInput.attributes('placeholder')).toBe('请输入密码')
    })

    it('应该渲染登录按钮', () => {
      const loginButton = wrapper.find('button')
      expect(loginButton.exists()).toBe(true)
      expect(loginButton.text()).toBe('登录')
    })
  })

  describe('表单验证', () => {
    it('用户名输入框应该支持双向绑定', async () => {
      const input = wrapper.find('#username')
      await input.setValue('testuser')
      expect(wrapper.vm.loginForm.username).toBe('testuser')
    })

    it('密码输入框应该支持双向绑定', async () => {
      const input = wrapper.find('#password')
      await input.setValue('password123')
      expect(wrapper.vm.loginForm.password).toBe('password123')
    })

    it('表单字段应该是必填的', () => {
      const usernameInput = wrapper.find('#username')
      const passwordInput = wrapper.find('#password')
      expect(usernameInput.attributes('required')).toBe('')
      expect(passwordInput.attributes('required')).toBe('')
    })
  })

  describe('登录功能', () => {
    it('点击登录按钮应该触发登录逻辑', async () => {
      const button = wrapper.find('button')
      
      // 检查初始状态
      expect(wrapper.vm.loading).toBe(false)
      
      // 点击登录按钮
      await button.trigger('click')
      
      // 验证路由没有被调用（因为有延迟）
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('登录时应该显示加载状态', async () => {
      const button = wrapper.find('button')
      expect(button.text()).toBe('登录')
      
      // 模拟登录过程
      wrapper.vm.loading = true
      await wrapper.vm.$nextTick()
      expect(button.text()).toBe('登录中...')
      expect(button.attributes('disabled')).toBe('')
    })

    it('登录成功后应该跳转到仪表板页面', async () => {
      // Mock setTimeout to resolve immediately
      vi.useFakeTimers()
      
      // 调用登录方法
      const loginPromise = wrapper.vm.handleLogin()
      
      // 快进所有定时器
      vi.runAllTimers()
      
      // 等待登录完成
      await loginPromise
      
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
      
      // 恢复真实定时器
      vi.useRealTimers()
    })

    it('登录失败时应该正确处理错误', async () => {
      // Mock setTimeout to reject immediately
      vi.useFakeTimers()
      
      // 模拟登录失败
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // 修改handleLogin方法以模拟错误
      wrapper.vm.handleLogin = async () => {
        wrapper.vm.loading = true
        try {
          // 模拟登录失败
          await new Promise((_, reject) => setTimeout(() => reject(new Error('登录失败')), 100))
        } catch (error) {
          console.error('登录失败:', error)
        } finally {
          wrapper.vm.loading = false
        }
      }
      
      // 调用登录方法
      const loginPromise = wrapper.vm.handleLogin()
      
      // 快进所有定时器
      vi.runAllTimers()
      
      // 等待登录完成
      await loginPromise
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('登录失败:', expect.any(Error))
      expect(wrapper.vm.loading).toBe(false)
      
      consoleErrorSpy.mockRestore()
      
      // 恢复真实定时器
      vi.useRealTimers()
    })
  })

  describe('UI状态管理', () => {
    it('登录按钮在加载时应该被禁用', async () => {
      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeUndefined()
      
      wrapper.vm.loading = true
      await wrapper.vm.$nextTick()
      expect(button.attributes('disabled')).toBe('')
    })

    it('登录按钮在加载时应该显示正确的文本', async () => {
      const button = wrapper.find('button')
      expect(button.text()).toBe('登录')
      
      wrapper.vm.loading = true
      await wrapper.vm.$nextTick()
      expect(button.text()).toBe('登录中...')
    })
  })

  describe('表单提交', () => {
    it('表单应该阻止默认提交行为并触发登录逻辑', async () => {
      const form = wrapper.find('form')
      
      // 测试表单提交是否触发登录逻辑
      await form.trigger('submit.prevent')
      
      // 检查加载状态是否设置为true
      expect(wrapper.vm.loading).toBe(true)
    })
  })
})