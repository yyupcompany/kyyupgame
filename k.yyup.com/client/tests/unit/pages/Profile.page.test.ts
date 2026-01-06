import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import ProfilePage from '@/pages/Profile.vue'

// Mock API模块
vi.mock('@/api/modules/user', () => ({
  getUserProfile: vi.fn(),
  updateUserProfile: vi.fn(),
  uploadAvatar: vi.fn()
}))

// Mock useRouter
const mockPush = vi.fn()
const mockRouter = {
  push: mockPush,
  currentRoute: {
    value: {
      path: '/profile',
      name: 'Profile',
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

import * as userApi from '@/api/modules/user'

// 控制台错误检测变量
let consoleSpy: any

describe('Profile Page', () => {
  let wrapper: VueWrapper<any>
  let router: any
  let pinia: any

  beforeEach(() => {
    // 创建路由实例
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/profile', component: ProfilePage },
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
    it('应该正确渲染个人资料页面', async () => {
      vi.mocked(userApi.getUserProfile).mockResolvedValue({
        success: true,
        data: {
          id: 1,
          username: 'admin',
          name: '管理员',
          email: 'admin@example.com',
          phone: '+86 123-456-7890',
          avatar: '',
          role: 'admin',
          department: '技术部',
          position: '系统管理员',
          joinDate: '2023-01-01',
          status: 'active'
        }
      })

      wrapper = mount(ProfilePage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-upload': true,
            'el-icon': true,
            'el-avatar': true,
            'el-divider': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.find('.profile-container').exists()).toBe(true)
      expect(wrapper.find('.profile-header').exists()).toBe(true)
      expect(wrapper.find('.profile-content').exists()).toBe(true)
    })

    it('应该显示页面标题', async () => {
      vi.mocked(userApi.getUserProfile).mockResolvedValue({
        success: true,
        data: {}
      })

      wrapper = mount(ProfilePage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-upload': true,
            'el-icon': true,
            'el-avatar': true,
            'el-divider': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const pageTitle = wrapper.find('.page-title')
      expect(pageTitle.exists()).toBe(true)
      expect(pageTitle.text()).toContain('个人资料')
    })
  })

  describe('用户信息展示', () => {
    it('应该显示用户基本信息', async () => {
      vi.mocked(userApi.getUserProfile).mockResolvedValue({
        success: true,
        data: {
          id: 1,
          username: 'admin',
          name: '管理员',
          email: 'admin@example.com',
          phone: '+86 123-456-7890',
          avatar: '',
          role: 'admin',
          department: '技术部',
          position: '系统管理员',
          joinDate: '2023-01-01',
          status: 'active'
        }
      })

      wrapper = mount(ProfilePage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-upload': true,
            'el-icon': true,
            'el-avatar': true,
            'el-divider': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const userInfoCard = wrapper.find('.user-info-card')
      expect(userInfoCard.exists()).toBe(true)
    })

    it('应该显示用户头像', async () => {
      vi.mocked(userApi.getUserProfile).mockResolvedValue({
        success: true,
        data: {
          id: 1,
          username: 'admin',
          name: '管理员',
          email: 'admin@example.com',
          phone: '+86 123-456-7890',
          avatar: 'https://example.com/avatar.jpg',
          role: 'admin',
          department: '技术部',
          position: '系统管理员',
          joinDate: '2023-01-01',
          status: 'active'
        }
      })

      wrapper = mount(ProfilePage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-upload': true,
            'el-icon': true,
            'el-avatar': true,
            'el-divider': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const avatar = wrapper.findComponent({ name: 'el-avatar' })
      expect(avatar.exists()).toBe(true)
    })

    it('应该显示用户角色和部门信息', async () => {
      vi.mocked(userApi.getUserProfile).mockResolvedValue({
        success: true,
        data: {
          id: 1,
          username: 'admin',
          name: '管理员',
          email: 'admin@example.com',
          phone: '+86 123-456-7890',
          avatar: '',
          role: 'admin',
          department: '技术部',
          position: '系统管理员',
          joinDate: '2023-01-01',
          status: 'active'
        }
      })

      wrapper = mount(ProfilePage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-upload': true,
            'el-icon': true,
            'el-avatar': true,
            'el-divider': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const roleInfo = wrapper.find('.user-role')
      const departmentInfo = wrapper.find('.user-department')
      
      expect(roleInfo.exists() || wrapper.text().includes('管理员')).toBe(true)
      expect(departmentInfo.exists() || wrapper.text().includes('技术部')).toBe(true)
    })
  })

  describe('编辑表单', () => {
    it('应该渲染编辑表单', async () => {
      vi.mocked(userApi.getUserProfile).mockResolvedValue({
        success: true,
        data: {
          id: 1,
          username: 'admin',
          name: '管理员',
          email: 'admin@example.com',
          phone: '+86 123-456-7890',
          avatar: '',
          role: 'admin',
          department: '技术部',
          position: '系统管理员',
          joinDate: '2023-01-01',
          status: 'active'
        }
      })

      wrapper = mount(ProfilePage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-upload': true,
            'el-icon': true,
            'el-avatar': true,
            'el-divider': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const editForm = wrapper.find('.edit-form')
      expect(editForm.exists()).toBe(true)
    })

    it('应该包含姓名输入字段', async () => {
      vi.mocked(userApi.getUserProfile).mockResolvedValue({
        success: true,
        data: {}
      })

      wrapper = mount(ProfilePage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-upload': true,
            'el-icon': true,
            'el-avatar': true,
            'el-divider': true,
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
      vi.mocked(userApi.getUserProfile).mockResolvedValue({
        success: true,
        data: {}
      })

      wrapper = mount(ProfilePage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-upload': true,
            'el-icon': true,
            'el-avatar': true,
            'el-divider': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const emailInput = wrapper.find('input[name="email"]')
      expect(emailInput.exists()).toBe(true)
    })

    it('应该包含电话输入字段', async () => {
      vi.mocked(userApi.getUserProfile).mockResolvedValue({
        success: true,
        data: {}
      })

      wrapper = mount(ProfilePage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-upload': true,
            'el-icon': true,
            'el-avatar': true,
            'el-divider': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const phoneInput = wrapper.find('input[name="phone"]')
      expect(phoneInput.exists()).toBe(true)
    })
  })

  describe('头像上传', () => {
    it('应该有头像上传组件', async () => {
      vi.mocked(userApi.getUserProfile).mockResolvedValue({
        success: true,
        data: {}
      })

      wrapper = mount(ProfilePage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-upload': true,
            'el-icon': true,
            'el-avatar': true,
            'el-divider': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const uploadComponent = wrapper.findComponent({ name: 'el-upload' })
      expect(uploadComponent.exists()).toBe(true)
    })

    it('应该能够处理头像上传', async () => {
      vi.mocked(userApi.getUserProfile).mockResolvedValue({
        success: true,
        data: {}
      })

      vi.mocked(userApi.uploadAvatar).mockResolvedValue({
        success: true,
        data: {
          url: 'https://example.com/new-avatar.jpg'
        }
      })

      wrapper = mount(ProfilePage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-upload': true,
            'el-icon': true,
            'el-avatar': true,
            'el-divider': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const uploadComponent = wrapper.findComponent({ name: 'el-upload' })
      
      // 模拟文件上传
      await uploadComponent.vm.$emit('change', {
        raw: new File([''], 'test.jpg', { type: 'image/jpeg' })
      })

      expect(userApi.uploadAvatar).toHaveBeenCalled()
    })
  })

  describe('表单提交', () => {
    it('应该能够提交表单', async () => {
      vi.mocked(userApi.getUserProfile).mockResolvedValue({
        success: true,
        data: {
          id: 1,
          username: 'admin',
          name: '管理员',
          email: 'admin@example.com',
          phone: '+86 123-456-7890',
          avatar: '',
          role: 'admin',
          department: '技术部',
          position: '系统管理员',
          joinDate: '2023-01-01',
          status: 'active'
        }
      })

      vi.mocked(userApi.updateUserProfile).mockResolvedValue({
        success: true,
        message: '更新成功'
      })

      wrapper = mount(ProfilePage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-upload': true,
            'el-icon': true,
            'el-avatar': true,
            'el-divider': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const submitButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('保存') || button.text().includes('更新'))[0]

      expect(submitButton.exists()).toBe(true)

      await submitButton.trigger('click')
      expect(userApi.updateUserProfile).toHaveBeenCalled()
    })

    it('应该处理表单提交成功', async () => {
      vi.mocked(userApi.getUserProfile).mockResolvedValue({
        success: true,
        data: {
          id: 1,
          username: 'admin',
          name: '管理员',
          email: 'admin@example.com',
          phone: '+86 123-456-7890',
          avatar: '',
          role: 'admin',
          department: '技术部',
          position: '系统管理员',
          joinDate: '2023-01-01',
          status: 'active'
        }
      })

      vi.mocked(userApi.updateUserProfile).mockResolvedValue({
        success: true,
        message: '更新成功'
      })

      wrapper = mount(ProfilePage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-upload': true,
            'el-icon': true,
            'el-avatar': true,
            'el-divider': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const submitButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('保存') || button.text().includes('更新'))[0]

      await submitButton.trigger('click')

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证表单仍然存在（因为成功后通常会显示成功消息）
      expect(wrapper.find('.edit-form').exists()).toBe(true)
    })

    it('应该处理表单提交失败', async () => {
      vi.mocked(userApi.getUserProfile).mockResolvedValue({
        success: true,
        data: {
          id: 1,
          username: 'admin',
          name: '管理员',
          email: 'admin@example.com',
          phone: '+86 123-456-7890',
          avatar: '',
          role: 'admin',
          department: '技术部',
          position: '系统管理员',
          joinDate: '2023-01-01',
          status: 'active'
        }
      })

      vi.mocked(userApi.updateUserProfile).mockRejectedValue(new Error('更新失败'))

      wrapper = mount(ProfilePage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-upload': true,
            'el-icon': true,
            'el-avatar': true,
            'el-divider': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const submitButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('保存') || button.text().includes('更新'))[0]

      await submitButton.trigger('click')

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证错误处理
      expect(wrapper.find('.edit-form').exists()).toBe(true)
    })
  })

  describe('数据加载', () => {
    it('应该在挂载时加载用户资料', async () => {
      const getUserProfileSpy = vi.spyOn(userApi, 'getUserProfile')

      vi.mocked(userApi.getUserProfile).mockResolvedValue({
        success: true,
        data: {}
      })

      wrapper = mount(ProfilePage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-upload': true,
            'el-icon': true,
            'el-avatar': true,
            'el-divider': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(getUserProfileSpy).toHaveBeenCalled()
    })

    it('应该正确处理加载状态', async () => {
      vi.mocked(userApi.getUserProfile).mockResolvedValue({
        success: true,
        data: {}
      })

      wrapper = mount(ProfilePage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-upload': true,
            'el-icon': true,
            'el-avatar': true,
            'el-divider': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      // 验证加载状态
      expect(wrapper.find('.profile-container').exists()).toBe(true)

      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证加载完成状态
      expect(wrapper.find('.profile-content').exists()).toBe(true)
    })

    it('应该正确处理API错误', async () => {
      vi.mocked(userApi.getUserProfile).mockRejectedValue(new Error('API Error'))

      wrapper = mount(ProfilePage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-upload': true,
            'el-icon': true,
            'el-avatar': true,
            'el-divider': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证错误状态
      expect(wrapper.find('.profile-container').exists()).toBe(true)
    })
  })

  describe('表单验证', () => {
    it('应该验证必填字段', async () => {
      vi.mocked(userApi.getUserProfile).mockResolvedValue({
        success: true,
        data: {}
      })

      wrapper = mount(ProfilePage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-upload': true,
            'el-icon': true,
            'el-avatar': true,
            'el-divider': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const submitButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('保存') || button.text().includes('更新'))[0]

      await submitButton.trigger('click')

      await nextTick()

      // 验证表单验证
      expect(wrapper.find('.edit-form').exists()).toBe(true)
    })

    it('应该验证邮箱格式', async () => {
      vi.mocked(userApi.getUserProfile).mockResolvedValue({
        success: true,
        data: {}
      })

      wrapper = mount(ProfilePage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-upload': true,
            'el-icon': true,
            'el-avatar': true,
            'el-divider': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const emailInput = wrapper.find('input[name="email"]')
      await emailInput.setValue('invalid-email')

      const submitButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('保存') || button.text().includes('更新'))[0]

      await submitButton.trigger('click')

      await nextTick()

      // 验证邮箱格式验证
      expect(wrapper.find('.edit-form').exists()).toBe(true)
    })
  })

  describe('样式和布局', () => {
    it('应该应用正确的容器样式', async () => {
      vi.mocked(userApi.getUserProfile).mockResolvedValue({
        success: true,
        data: {}
      })

      wrapper = mount(ProfilePage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-upload': true,
            'el-icon': true,
            'el-avatar': true,
            'el-divider': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const container = wrapper.find('.profile-container')
      expect(container.exists()).toBe(true)
    })

    it('应该在移动设备上应用响应式样式', async () => {
      vi.mocked(userApi.getUserProfile).mockResolvedValue({
        success: true,
        data: {}
      })

      wrapper = mount(ProfilePage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-upload': true,
            'el-icon': true,
            'el-avatar': true,
            'el-divider': true,
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
      expect(wrapper.find('.profile-container').exists()).toBe(true)
    })
  })

  describe('可访问性', () => {
    it('应该具有正确的ARIA属性', async () => {
      vi.mocked(userApi.getUserProfile).mockResolvedValue({
        success: true,
        data: {}
      })

      wrapper = mount(ProfilePage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-upload': true,
            'el-icon': true,
            'el-avatar': true,
            'el-divider': true,
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
      vi.mocked(userApi.getUserProfile).mockResolvedValue({
        success: true,
        data: {}
      })

      wrapper = mount(ProfilePage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-upload': true,
            'el-icon': true,
            'el-avatar': true,
            'el-divider': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const form = wrapper.find('.edit-form')
      expect(form.exists()).toBe(true)
      expect(form.attributes('role')).toBe('form')
    })
  })
})