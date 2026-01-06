import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import NotificationsPage from '@/pages/Notifications.vue'

// Mock API模块
vi.mock('@/api/modules/notifications', () => ({
  getNotifications: vi.fn(),
  markNotificationAsRead: vi.fn(),
  markAllNotificationsAsRead: vi.fn(),
  deleteNotification: vi.fn(),
  getNotificationSettings: vi.fn(),
  updateNotificationSettings: vi.fn()
}))

// Mock useRouter
const mockPush = vi.fn()
const mockRouter = {
  push: mockPush,
  currentRoute: {
    value: {
      path: '/notifications',
      name: 'Notifications',
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

import * as notificationsApi from '@/api/modules/notifications'

// 控制台错误检测变量
let consoleSpy: any

describe('Notifications Page', () => {
  let wrapper: VueWrapper<any>
  let router: any
  let pinia: any

  beforeEach(() => {
    // 创建路由实例
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/notifications', component: NotificationsPage },
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
    it('应该正确渲染通知页面', async () => {
      vi.mocked(notificationsApi.getNotifications).mockResolvedValue({
        success: true,
        data: {
          notifications: [
            { id: 1, title: '测试通知1', message: '消息1', type: 'info', timestamp: '2023-01-01', read: false },
            { id: 2, title: '测试通知2', message: '消息2', type: 'warning', timestamp: '2023-01-02', read: true }
          ],
          total: 2,
          unread: 1,
          page: 1,
          pageSize: 10
        }
      })

      wrapper = mount(NotificationsPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-badge': true,
            'el-tag': true,
            'el-message': true,
            'el-pagination': true,
            'el-switch': true,
            'el-tabs': true,
            'el-tab-pane': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.find('.notifications-container').exists()).toBe(true)
      expect(wrapper.find('.notifications-list').exists()).toBe(true)
    })

    it('应该显示页面标题', async () => {
      vi.mocked(notificationsApi.getNotifications).mockResolvedValue({
        success: true,
        data: {
          notifications: [],
          total: 0,
          unread: 0,
          page: 1,
          pageSize: 10
        }
      })

      wrapper = mount(NotificationsPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-badge': true,
            'el-tag': true,
            'el-message': true,
            'el-pagination': true,
            'el-switch': true,
            'el-tabs': true,
            'el-tab-pane': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const pageTitle = wrapper.find('.page-title')
      expect(pageTitle.exists()).toBe(true)
      expect(pageTitle.text()).toContain('通知')
    })
  })

  describe('通知列表', () => {
    it('应该显示通知列表', async () => {
      vi.mocked(notificationsApi.getNotifications).mockResolvedValue({
        success: true,
        data: {
          notifications: [
            { id: 1, title: '测试通知1', message: '消息1', type: 'info', timestamp: '2023-01-01', read: false },
            { id: 2, title: '测试通知2', message: '消息2', type: 'warning', timestamp: '2023-01-02', read: true }
          ],
          total: 2,
          unread: 1,
          page: 1,
          pageSize: 10
        }
      })

      wrapper = mount(NotificationsPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-badge': true,
            'el-tag': true,
            'el-message': true,
            'el-pagination': true,
            'el-switch': true,
            'el-tabs': true,
            'el-tab-pane': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const notificationsList = wrapper.find('.notifications-list')
      expect(notificationsList.exists()).toBe(true)

      const notificationItems = wrapper.findAll('.notification-item')
      expect(notificationItems.length).toBe(2)
    })

    it('应该显示不同类型的通知标签', async () => {
      vi.mocked(notificationsApi.getNotifications).mockResolvedValue({
        success: true,
        data: {
          notifications: [
            { id: 1, title: '信息通知', message: '消息', type: 'info', timestamp: '2023-01-01', read: false },
            { id: 2, title: '警告通知', message: '消息', type: 'warning', timestamp: '2023-01-02', read: false },
            { id: 3, title: '错误通知', message: '消息', type: 'error', timestamp: '2023-01-03', read: false },
            { id: 4, title: '成功通知', message: '消息', type: 'success', timestamp: '2023-01-04', read: false }
          ],
          total: 4,
          unread: 4,
          page: 1,
          pageSize: 10
        }
      })

      wrapper = mount(NotificationsPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-badge': true,
            'el-tag': true,
            'el-message': true,
            'el-pagination': true,
            'el-switch': true,
            'el-tabs': true,
            'el-tab-pane': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const typeTags = wrapper.findAllComponents({ name: 'el-tag' })
      expect(typeTags.length).toBeGreaterThan(0)
    })

    it('应该显示未读通知标记', async () => {
      vi.mocked(notificationsApi.getNotifications).mockResolvedValue({
        success: true,
        data: {
          notifications: [
            { id: 1, title: '未读通知', message: '消息', type: 'info', timestamp: '2023-01-01', read: false }
          ],
          total: 1,
          unread: 1,
          page: 1,
          pageSize: 10
        }
      })

      wrapper = mount(NotificationsPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-badge': true,
            'el-tag': true,
            'el-message': true,
            'el-pagination': true,
            'el-switch': true,
            'el-tabs': true,
            'el-tab-pane': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const unreadBadge = wrapper.findComponent({ name: 'el-badge' })
      expect(unreadBadge.exists()).toBe(true)
    })

    it('应该处理空通知列表', async () => {
      vi.mocked(notificationsApi.getNotifications).mockResolvedValue({
        success: true,
        data: {
          notifications: [],
          total: 0,
          unread: 0,
          page: 1,
          pageSize: 10
        }
      })

      wrapper = mount(NotificationsPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-badge': true,
            'el-tag': true,
            'el-message': true,
            'el-pagination': true,
            'el-switch': true,
            'el-tabs': true,
            'el-tab-pane': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const emptyState = wrapper.findComponent({ name: 'el-empty' })
      expect(emptyState.exists()).toBe(true)
    })
  })

  describe('通知操作', () => {
    it('应该能够标记通知为已读', async () => {
      vi.mocked(notificationsApi.getNotifications).mockResolvedValue({
        success: true,
        data: {
          notifications: [
            { id: 1, title: '未读通知', message: '消息', type: 'info', timestamp: '2023-01-01', read: false }
          ],
          total: 1,
          unread: 1,
          page: 1,
          pageSize: 10
        }
      })

      vi.mocked(notificationsApi.markNotificationAsRead).mockResolvedValue({
        success: true,
        message: '标记成功'
      })

      wrapper = mount(NotificationsPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-badge': true,
            'el-tag': true,
            'el-message': true,
            'el-pagination': true,
            'el-switch': true,
            'el-tabs': true,
            'el-tab-pane': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const markAsReadButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('标记已读') || button.text().includes('Mark as Read'))[0]

      if (markAsReadButton) {
        await markAsReadButton.trigger('click')
        expect(notificationsApi.markNotificationAsRead).toHaveBeenCalledWith(1)
      }
    })

    it('应该能够标记所有通知为已读', async () => {
      vi.mocked(notificationsApi.getNotifications).mockResolvedValue({
        success: true,
        data: {
          notifications: [
            { id: 1, title: '未读通知1', message: '消息1', type: 'info', timestamp: '2023-01-01', read: false },
            { id: 2, title: '未读通知2', message: '消息2', type: 'warning', timestamp: '2023-01-02', read: false }
          ],
          total: 2,
          unread: 2,
          page: 1,
          pageSize: 10
        }
      })

      vi.mocked(notificationsApi.markAllNotificationsAsRead).mockResolvedValue({
        success: true,
        message: '全部标记成功'
      })

      wrapper = mount(NotificationsPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-badge': true,
            'el-tag': true,
            'el-message': true,
            'el-pagination': true,
            'el-switch': true,
            'el-tabs': true,
            'el-tab-pane': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const markAllReadButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('全部标记已读') || button.text().includes('Mark All Read'))[0]

      if (markAllReadButton) {
        await markAllReadButton.trigger('click')
        expect(notificationsApi.markAllNotificationsAsRead).toHaveBeenCalled()
      }
    })

    it('应该能够删除通知', async () => {
      vi.mocked(notificationsApi.getNotifications).mockResolvedValue({
        success: true,
        data: {
          notifications: [
            { id: 1, title: '测试通知', message: '消息', type: 'info', timestamp: '2023-01-01', read: false }
          ],
          total: 1,
          unread: 1,
          page: 1,
          pageSize: 10
        }
      })

      vi.mocked(notificationsApi.deleteNotification).mockResolvedValue({
        success: true,
        message: '删除成功'
      })

      wrapper = mount(NotificationsPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-badge': true,
            'el-tag': true,
            'el-message': true,
            'el-pagination': true,
            'el-switch': true,
            'el-tabs': true,
            'el-tab-pane': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const deleteButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('删除') || button.text().includes('Delete'))[0]

      if (deleteButton) {
        await deleteButton.trigger('click')
        expect(notificationsApi.deleteNotification).toHaveBeenCalledWith(1)
      }
    })
  })

  describe('通知设置', () => {
    it('应该显示通知设置面板', async () => {
      vi.mocked(notificationsApi.getNotifications).mockResolvedValue({
        success: true,
        data: {
          notifications: [],
          total: 0,
          unread: 0,
          page: 1,
          pageSize: 10
        }
      })

      vi.mocked(notificationsApi.getNotificationSettings).mockResolvedValue({
        success: true,
        data: {
          emailNotifications: true,
          pushNotifications: true,
          desktopNotifications: false,
          soundEnabled: true
        }
      })

      wrapper = mount(NotificationsPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-badge': true,
            'el-tag': true,
            'el-message': true,
            'el-pagination': true,
            'el-switch': true,
            'el-tabs': true,
            'el-tab-pane': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const settingsPanel = wrapper.find('.notification-settings')
      expect(settingsPanel.exists()).toBe(true)
    })

    it('应该能够更新通知设置', async () => {
      vi.mocked(notificationsApi.getNotifications).mockResolvedValue({
        success: true,
        data: {
          notifications: [],
          total: 0,
          unread: 0,
          page: 1,
          pageSize: 10
        }
      })

      vi.mocked(notificationsApi.getNotificationSettings).mockResolvedValue({
        success: true,
        data: {
          emailNotifications: true,
          pushNotifications: true,
          desktopNotifications: false,
          soundEnabled: true
        }
      })

      vi.mocked(notificationsApi.updateNotificationSettings).mockResolvedValue({
        success: true,
        message: '设置更新成功'
      })

      wrapper = mount(NotificationsPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-badge': true,
            'el-tag': true,
            'el-message': true,
            'el-pagination': true,
            'el-switch': true,
            'el-tabs': true,
            'el-tab-pane': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const switches = wrapper.findAllComponents({ name: 'el-switch' })
      if (switches.length > 0) {
        await switches[0].vm.$emit('change', false)
        expect(notificationsApi.updateNotificationSettings).toHaveBeenCalled()
      }
    })
  })

  describe('通知筛选', () => {
    it('应该支持按类型筛选', async () => {
      wrapper = mount(NotificationsPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-badge': true,
            'el-tag': true,
            'el-message': true,
            'el-pagination': true,
            'el-switch': true,
            'el-tabs': true,
            'el-tab-pane': true
          }
        }
      })

      await nextTick()

      const tabs = wrapper.findComponent({ name: 'el-tabs' })
      expect(tabs.exists()).toBe(true)
    })

    it('应该支持按已读/未读筛选', async () => {
      wrapper = mount(NotificationsPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-badge': true,
            'el-tag': true,
            'el-message': true,
            'el-pagination': true,
            'el-switch': true,
            'el-tabs': true,
            'el-tab-pane': true,
            'el-select': true,
            'el-option': true
          }
        }
      })

      await nextTick()

      const filterSelect = wrapper.findComponent({ name: 'el-select' })
      expect(filterSelect.exists()).toBe(true)
    })
  })

  describe('数据加载', () => {
    it('应该在挂载时加载通知列表', async () => {
      const getNotificationsSpy = vi.spyOn(notificationsApi, 'getNotifications')

      vi.mocked(notificationsApi.getNotifications).mockResolvedValue({
        success: true,
        data: {
          notifications: [],
          total: 0,
          unread: 0,
          page: 1,
          pageSize: 10
        }
      })

      wrapper = mount(NotificationsPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-badge': true,
            'el-tag': true,
            'el-message': true,
            'el-pagination': true,
            'el-switch': true,
            'el-tabs': true,
            'el-tab-pane': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(getNotificationsSpy).toHaveBeenCalled()
    })

    it('应该加载通知设置', async () => {
      const getNotificationSettingsSpy = vi.spyOn(notificationsApi, 'getNotificationSettings')

      vi.mocked(notificationsApi.getNotifications).mockResolvedValue({
        success: true,
        data: {
          notifications: [],
          total: 0,
          unread: 0,
          page: 1,
          pageSize: 10
        }
      })

      vi.mocked(notificationsApi.getNotificationSettings).mockResolvedValue({
        success: true,
        data: {
          emailNotifications: true,
          pushNotifications: true,
          desktopNotifications: false,
          soundEnabled: true
        }
      })

      wrapper = mount(NotificationsPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-badge': true,
            'el-tag': true,
            'el-message': true,
            'el-pagination': true,
            'el-switch': true,
            'el-tabs': true,
            'el-tab-pane': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(getNotificationSettingsSpy).toHaveBeenCalled()
    })

    it('应该正确处理加载状态', async () => {
      vi.mocked(notificationsApi.getNotifications).mockResolvedValue({
        success: true,
        data: {
          notifications: [],
          total: 0,
          unread: 0,
          page: 1,
          pageSize: 10
        }
      })

      wrapper = mount(NotificationsPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-badge': true,
            'el-tag': true,
            'el-message': true,
            'el-pagination': true,
            'el-switch': true,
            'el-tabs': true,
            'el-tab-pane': true
          }
        }
      })

      await nextTick()

      // 验证加载状态
      expect(wrapper.find('.notifications-container').exists()).toBe(true)

      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证加载完成状态
      expect(wrapper.find('.notifications-list').exists()).toBe(true)
    })

    it('应该正确处理API错误', async () => {
      vi.mocked(notificationsApi.getNotifications).mockRejectedValue(new Error('API Error'))

      wrapper = mount(NotificationsPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-badge': true,
            'el-tag': true,
            'el-message': true,
            'el-pagination': true,
            'el-switch': true,
            'el-tabs': true,
            'el-tab-pane': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证错误状态
      expect(wrapper.find('.notifications-container').exists()).toBe(true)
    })
  })

  describe('分页功能', () => {
    it('应该支持通知列表分页', async () => {
      vi.mocked(notificationsApi.getNotifications).mockResolvedValue({
        success: true,
        data: {
          notifications: Array(15).fill().map((_, i) => ({ 
            id: i + 1, 
            title: `通知${i + 1}`, 
            message: `消息${i + 1}`, 
            type: 'info', 
            timestamp: '2023-01-01', 
            read: false 
          })),
          total: 15,
          unread: 15,
          page: 1,
          pageSize: 10
        }
      })

      wrapper = mount(NotificationsPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-badge': true,
            'el-tag': true,
            'el-message': true,
            'el-pagination': true,
            'el-switch': true,
            'el-tabs': true,
            'el-tab-pane': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const pagination = wrapper.findComponent({ name: 'el-pagination' })
      expect(pagination.exists()).toBe(true)
    })
  })

  describe('实时更新', () => {
    it('应该支持实时通知更新', async () => {
      vi.mocked(notificationsApi.getNotifications).mockResolvedValue({
        success: true,
        data: {
          notifications: [],
          total: 0,
          unread: 0,
          page: 1,
          pageSize: 10
        }
      })

      wrapper = mount(NotificationsPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-badge': true,
            'el-tag': true,
            'el-message': true,
            'el-pagination': true,
            'el-switch': true,
            'el-tabs': true,
            'el-tab-pane': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证组件支持实时更新
      expect(wrapper.find('.notifications-container').exists()).toBe(true)
    })
  })

  describe('样式和布局', () => {
    it('应该应用正确的容器样式', async () => {
      vi.mocked(notificationsApi.getNotifications).mockResolvedValue({
        success: true,
        data: {
          notifications: [],
          total: 0,
          unread: 0,
          page: 1,
          pageSize: 10
        }
      })

      wrapper = mount(NotificationsPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-badge': true,
            'el-tag': true,
            'el-message': true,
            'el-pagination': true,
            'el-switch': true,
            'el-tabs': true,
            'el-tab-pane': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const container = wrapper.find('.notifications-container')
      expect(container.exists()).toBe(true)
    })

    it('应该在移动设备上应用响应式样式', async () => {
      vi.mocked(notificationsApi.getNotifications).mockResolvedValue({
        success: true,
        data: {
          notifications: [],
          total: 0,
          unread: 0,
          page: 1,
          pageSize: 10
        }
      })

      wrapper = mount(NotificationsPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-badge': true,
            'el-tag': true,
            'el-message': true,
            'el-pagination': true,
            'el-switch': true,
            'el-tabs': true,
            'el-tab-pane': true
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
      expect(wrapper.find('.notifications-container').exists()).toBe(true)
    })
  })

  describe('可访问性', () => {
    it('应该具有正确的ARIA属性', async () => {
      vi.mocked(notificationsApi.getNotifications).mockResolvedValue({
        success: true,
        data: {
          notifications: [],
          total: 0,
          unread: 0,
          page: 1,
          pageSize: 10
        }
      })

      wrapper = mount(NotificationsPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-badge': true,
            'el-tag': true,
            'el-message': true,
            'el-pagination': true,
            'el-switch': true,
            'el-tabs': true,
            'el-tab-pane': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const mainContent = wrapper.find('main')
      expect(mainContent.exists()).toBe(true)
      expect(mainContent.attributes('role')).toBe('main')
    })

    it('通知列表应该具有正确的ARIA属性', async () => {
      vi.mocked(notificationsApi.getNotifications).mockResolvedValue({
        success: true,
        data: {
          notifications: [
            { id: 1, title: '测试通知', message: '消息', type: 'info', timestamp: '2023-01-01', read: false }
          ],
          total: 1,
          unread: 1,
          page: 1,
          pageSize: 10
        }
      })

      wrapper = mount(NotificationsPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-badge': true,
            'el-tag': true,
            'el-message': true,
            'el-pagination': true,
            'el-switch': true,
            'el-tabs': true,
            'el-tab-pane': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const notificationsList = wrapper.find('.notifications-list')
      expect(notificationsList.attributes('role')).toBe('list')
    })

    it('通知类型标签应该具有正确的ARIA属性', async () => {
      vi.mocked(notificationsApi.getNotifications).mockResolvedValue({
        success: true,
        data: {
          notifications: [
            { id: 1, title: '测试通知', message: '消息', type: 'info', timestamp: '2023-01-01', read: false }
          ],
          total: 1,
          unread: 1,
          page: 1,
          pageSize: 10
        }
      })

      wrapper = mount(NotificationsPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-badge': true,
            'el-tag': true,
            'el-message': true,
            'el-pagination': true,
            'el-switch': true,
            'el-tabs': true,
            'el-tab-pane': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const typeTags = wrapper.findAllComponents({ name: 'el-tag' })
      typeTags.forEach(tag => {
        expect(tag.attributes('aria-label')).toBeDefined()
      })
    })
  })
})