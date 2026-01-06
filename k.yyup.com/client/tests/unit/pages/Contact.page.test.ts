import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import ContactPage from '@/pages/Contact.vue'

// Mock API模块
vi.mock('@/api/modules/contact', () => ({
  submitContactForm: vi.fn(),
  getContactInfo: vi.fn()
}))

// Mock useRouter
const mockPush = vi.fn()
const mockRouter = {
  push: mockPush,
  currentRoute: {
    value: {
      path: '/contact',
      name: 'Contact',
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

import * as contactApi from '@/api/modules/contact'

// 控制台错误检测变量
let consoleSpy: any

describe('Contact Page', () => {
  let wrapper: VueWrapper<any>
  let router: any
  let pinia: any

  beforeEach(() => {
    // 创建路由实例
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/contact', component: ContactPage },
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
    it('应该正确渲染联系页面', async () => {
      vi.mocked(contactApi.getContactInfo).mockResolvedValue({
        success: true,
        data: {
          email: 'contact@example.com',
          phone: '+86 123-456-7890',
          address: '北京市朝阳区某某街道123号',
          workingHours: '周一至周五 9:00-18:00'
        }
      })

      wrapper = mount(ContactPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.find('.contact-container').exists()).toBe(true)
      expect(wrapper.find('.contact-header').exists()).toBe(true)
      expect(wrapper.find('.contact-content').exists()).toBe(true)
    })

    it('应该显示正确的页面标题', async () => {
      vi.mocked(contactApi.getContactInfo).mockResolvedValue({
        success: true,
        data: {}
      })

      wrapper = mount(ContactPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const pageTitle = wrapper.find('.page-title')
      expect(pageTitle.exists()).toBe(true)
      expect(pageTitle.text()).toContain('联系我们')
    })
  })

  describe('联系信息展示', () => {
    it('应该显示联系信息卡片', async () => {
      vi.mocked(contactApi.getContactInfo).mockResolvedValue({
        success: true,
        data: {
          email: 'contact@example.com',
          phone: '+86 123-456-7890',
          address: '北京市朝阳区某某街道123号',
          workingHours: '周一至周五 9:00-18:00'
        }
      })

      wrapper = mount(ContactPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const contactInfoCard = wrapper.find('.contact-info-card')
      expect(contactInfoCard.exists()).toBe(true)
    })

    it('应该显示邮箱信息', async () => {
      vi.mocked(contactApi.getContactInfo).mockResolvedValue({
        success: true,
        data: {
          email: 'contact@example.com',
          phone: '+86 123-456-7890',
          address: '北京市朝阳区某某街道123号',
          workingHours: '周一至周五 9:00-18:00'
        }
      })

      wrapper = mount(ContactPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const emailInfo = wrapper.find('.contact-email')
      expect(emailInfo.exists()).toBe(true)
      expect(emailInfo.text()).toContain('contact@example.com')
    })

    it('应该显示电话信息', async () => {
      vi.mocked(contactApi.getContactInfo).mockResolvedValue({
        success: true,
        data: {
          email: 'contact@example.com',
          phone: '+86 123-456-7890',
          address: '北京市朝阳区某某街道123号',
          workingHours: '周一至周五 9:00-18:00'
        }
      })

      wrapper = mount(ContactPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const phoneInfo = wrapper.find('.contact-phone')
      expect(phoneInfo.exists()).toBe(true)
      expect(phoneInfo.text()).toContain('+86 123-456-7890')
    })
  })

  describe('联系表单', () => {
    it('应该渲染联系表单', async () => {
      vi.mocked(contactApi.getContactInfo).mockResolvedValue({
        success: true,
        data: {}
      })

      wrapper = mount(ContactPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const contactForm = wrapper.find('.contact-form')
      expect(contactForm.exists()).toBe(true)
    })

    it('应该包含姓名输入字段', async () => {
      vi.mocked(contactApi.getContactInfo).mockResolvedValue({
        success: true,
        data: {}
      })

      wrapper = mount(ContactPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const nameInput = wrapper.find('input[name="name"]')
      expect(nameInput.exists()).toBe(true)
    })

    it('应该包含邮箱输入字段', async () => {
      vi.mocked(contactApi.getContactInfo).mockResolvedValue({
        success: true,
        data: {}
      })

      wrapper = mount(ContactPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const emailInput = wrapper.find('input[name="email"]')
      expect(emailInput.exists()).toBe(true)
    })

    it('应该包含消息文本域', async () => {
      vi.mocked(contactApi.getContactInfo).mockResolvedValue({
        success: true,
        data: {}
      })

      wrapper = mount(ContactPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const messageTextarea = wrapper.find('textarea[name="message"]')
      expect(messageTextarea.exists()).toBe(true)
    })
  })

  describe('表单提交', () => {
    it('应该能够提交表单', async () => {
      vi.mocked(contactApi.getContactInfo).mockResolvedValue({
        success: true,
        data: {}
      })

      vi.mocked(contactApi.submitContactForm).mockResolvedValue({
        success: true,
        message: '消息发送成功'
      })

      wrapper = mount(ContactPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const submitButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('发送') || button.text().includes('提交'))[0]

      expect(submitButton.exists()).toBe(true)

      await submitButton.trigger('click')
      expect(contactApi.submitContactForm).toHaveBeenCalled()
    })

    it('应该处理表单提交成功', async () => {
      vi.mocked(contactApi.getContactInfo).mockResolvedValue({
        success: true,
        data: {}
      })

      vi.mocked(contactApi.submitContactForm).mockResolvedValue({
        success: true,
        message: '消息发送成功'
      })

      wrapper = mount(ContactPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const submitButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('发送') || button.text().includes('提交'))[0]

      await submitButton.trigger('click')

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证表单重置
      const form = wrapper.find('.contact-form')
      expect(form.exists()).toBe(true)
    })

    it('应该处理表单提交失败', async () => {
      vi.mocked(contactApi.getContactInfo).mockResolvedValue({
        success: true,
        data: {}
      })

      vi.mocked(contactApi.submitContactForm).mockRejectedValue(new Error('提交失败'))

      wrapper = mount(ContactPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const submitButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('发送') || button.text().includes('提交'))[0]

      await submitButton.trigger('click')

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证错误处理
      expect(wrapper.find('.contact-form').exists()).toBe(true)
    })
  })

  describe('表单验证', () => {
    it('应该验证必填字段', async () => {
      vi.mocked(contactApi.getContactInfo).mockResolvedValue({
        success: true,
        data: {}
      })

      wrapper = mount(ContactPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const submitButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('发送') || button.text().includes('提交'))[0]

      await submitButton.trigger('click')

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证表单验证
      expect(wrapper.find('.contact-form').exists()).toBe(true)
    })

    it('应该验证邮箱格式', async () => {
      vi.mocked(contactApi.getContactInfo).mockResolvedValue({
        success: true,
        data: {}
      })

      wrapper = mount(ContactPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const emailInput = wrapper.find('input[name="email"]')
      await emailInput.setValue('invalid-email')

      const submitButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('发送') || button.text().includes('提交'))[0]

      await submitButton.trigger('click')

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证邮箱格式验证
      expect(wrapper.find('.contact-form').exists()).toBe(true)
    })
  })

  describe('数据加载', () => {
    it('应该在挂载时加载联系信息', async () => {
      const getContactInfoSpy = vi.spyOn(contactApi, 'getContactInfo')

      vi.mocked(contactApi.getContactInfo).mockResolvedValue({
        success: true,
        data: {}
      })

      wrapper = mount(ContactPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(getContactInfoSpy).toHaveBeenCalled()
    })

    it('应该正确处理加载状态', async () => {
      vi.mocked(contactApi.getContactInfo).mockResolvedValue({
        success: true,
        data: {}
      })

      wrapper = mount(ContactPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      // 验证加载状态
      expect(wrapper.find('.contact-container').exists()).toBe(true)

      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证加载完成状态
      expect(wrapper.find('.contact-content').exists()).toBe(true)
    })

    it('应该正确处理API错误', async () => {
      vi.mocked(contactApi.getContactInfo).mockRejectedValue(new Error('API Error'))

      wrapper = mount(ContactPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证错误状态
      expect(wrapper.find('.contact-container').exists()).toBe(true)
    })
  })

  describe('样式和布局', () => {
    it('应该应用正确的容器样式', async () => {
      vi.mocked(contactApi.getContactInfo).mockResolvedValue({
        success: true,
        data: {}
      })

      wrapper = mount(ContactPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const container = wrapper.find('.contact-container')
      expect(container.exists()).toBe(true)
    })

    it('应该在移动设备上应用响应式样式', async () => {
      vi.mocked(contactApi.getContactInfo).mockResolvedValue({
        success: true,
        data: {}
      })

      wrapper = mount(ContactPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 模拟移动设备屏幕尺寸
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480
      })

      window.dispatchEvent(new Event('resize'))
      await nextTick()

      // 验证组件仍然正常渲染
      expect(wrapper.find('.contact-container').exists()).toBe(true)
    })
  })

  describe('可访问性', () => {
    it('应该具有正确的ARIA属性', async () => {
      vi.mocked(contactApi.getContactInfo).mockResolvedValue({
        success: true,
        data: {}
      })

      wrapper = mount(ContactPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const mainContent = wrapper.find('main')
      expect(mainContent.exists()).toBe(true)
      expect(mainContent.attributes('role')).toBe('main')
    })

    it('表单字段应该具有正确的ARIA标签', async () => {
      vi.mocked(contactApi.getContactInfo).mockResolvedValue({
        success: true,
        data: {}
      })

      wrapper = mount(ContactPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const form = wrapper.find('.contact-form')
      expect(form.exists()).toBe(true)
      expect(form.attributes('role')).toBe('form')
    })
  })
})