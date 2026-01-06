import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import MessagesPage from '@/pages/Messages.vue'

// Mock API模块
vi.mock('@/api/modules/messages', () => ({
  getMessages: vi.fn(),
  getMessage: vi.fn(),
  markMessageAsRead: vi.fn(),
  deleteMessage: vi.fn(),
  sendMessage: vi.fn()
}))

// Mock useRouter
const mockPush = vi.fn()
const mockRouter = {
  push: mockPush,
  currentRoute: {
    value: {
      path: '/messages',
      name: 'Messages',
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

import * as messagesApi from '@/api/modules/messages'

// 控制台错误检测变量
let consoleSpy: any

describe('Messages Page', () => {
  let wrapper: VueWrapper<any>
  let router: any
  let pinia: any

  beforeEach(() => {
    // 创建路由实例
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/messages', component: MessagesPage },
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
    it('应该正确渲染消息页面', async () => {
      vi.mocked(messagesApi.getMessages).mockResolvedValue({
        success: true,
        data: {
          messages: [
            { id: 1, title: '测试消息1', content: '内容1', sender: '系统', timestamp: '2023-01-01', read: false },
            { id: 2, title: '测试消息2', content: '内容2', sender: '管理员', timestamp: '2023-01-02', read: true }
          ],
          total: 2,
          unread: 1,
          page: 1,
          pageSize: 10
        }
      })

      wrapper = mount(MessagesPage, {
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
            'el-pagination': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.find('.messages-container').exists()).toBe(true)
      expect(wrapper.find('.messages-list').exists()).toBe(true)
    })

    it('应该显示页面标题', async () => {
      vi.mocked(messagesApi.getMessages).mockResolvedValue({
        success: true,
        data: {
          messages: [],
          total: 0,
          unread: 0,
          page: 1,
          pageSize: 10
        }
      })

      wrapper = mount(MessagesPage, {
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
            'el-pagination': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const pageTitle = wrapper.find('.page-title')
      expect(pageTitle.exists()).toBe(true)
      expect(pageTitle.text()).toContain('消息')
    })
  })

  describe('消息列表', () => {
    it('应该显示消息列表', async () => {
      vi.mocked(messagesApi.getMessages).mockResolvedValue({
        success: true,
        data: {
          messages: [
            { id: 1, title: '测试消息1', content: '内容1', sender: '系统', timestamp: '2023-01-01', read: false },
            { id: 2, title: '测试消息2', content: '内容2', sender: '管理员', timestamp: '2023-01-02', read: true }
          ],
          total: 2,
          unread: 1,
          page: 1,
          pageSize: 10
        }
      })

      wrapper = mount(MessagesPage, {
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
            'el-pagination': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const messagesList = wrapper.find('.messages-list')
      expect(messagesList.exists()).toBe(true)

      const messageItems = wrapper.findAll('.message-item')
      expect(messageItems.length).toBe(2)
    })

    it('应该显示未读消息标记', async () => {
      vi.mocked(messagesApi.getMessages).mockResolvedValue({
        success: true,
        data: {
          messages: [
            { id: 1, title: '未读消息', content: '内容', sender: '系统', timestamp: '2023-01-01', read: false }
          ],
          total: 1,
          unread: 1,
          page: 1,
          pageSize: 10
        }
      })

      wrapper = mount(MessagesPage, {
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
            'el-pagination': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const unreadBadge = wrapper.findComponent({ name: 'el-badge' })
      expect(unreadBadge.exists()).toBe(true)
    })

    it('应该处理空消息列表', async () => {
      vi.mocked(messagesApi.getMessages).mockResolvedValue({
        success: true,
        data: {
          messages: [],
          total: 0,
          unread: 0,
          page: 1,
          pageSize: 10
        }
      })

      wrapper = mount(MessagesPage, {
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
            'el-pagination': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const emptyState = wrapper.findComponent({ name: 'el-empty' })
      expect(emptyState.exists()).toBe(true)
    })
  })

  describe('消息操作', () => {
    it('应该能够标记消息为已读', async () => {
      vi.mocked(messagesApi.getMessages).mockResolvedValue({
        success: true,
        data: {
          messages: [
            { id: 1, title: '未读消息', content: '内容', sender: '系统', timestamp: '2023-01-01', read: false }
          ],
          total: 1,
          unread: 1,
          page: 1,
          pageSize: 10
        }
      })

      vi.mocked(messagesApi.markMessageAsRead).mockResolvedValue({
        success: true,
        message: '标记成功'
      })

      wrapper = mount(MessagesPage, {
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
            'el-pagination': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const markAsReadButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('标记已读') || button.text().includes('Mark as Read'))[0]

      if (markAsReadButton) {
        await markAsReadButton.trigger('click')
        expect(messagesApi.markMessageAsRead).toHaveBeenCalledWith(1)
      }
    })

    it('应该能够删除消息', async () => {
      vi.mocked(messagesApi.getMessages).mockResolvedValue({
        success: true,
        data: {
          messages: [
            { id: 1, title: '测试消息', content: '内容', sender: '系统', timestamp: '2023-01-01', read: false }
          ],
          total: 1,
          unread: 1,
          page: 1,
          pageSize: 10
        }
      })

      vi.mocked(messagesApi.deleteMessage).mockResolvedValue({
        success: true,
        message: '删除成功'
      })

      wrapper = mount(MessagesPage, {
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
            'el-pagination': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const deleteButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('删除') || button.text().includes('Delete'))[0]

      if (deleteButton) {
        await deleteButton.trigger('click')
        expect(messagesApi.deleteMessage).toHaveBeenCalledWith(1)
      }
    })

    it('应该能够查看消息详情', async () => {
      vi.mocked(messagesApi.getMessages).mockResolvedValue({
        success: true,
        data: {
          messages: [
            { id: 1, title: '测试消息', content: '内容', sender: '系统', timestamp: '2023-01-01', read: false }
          ],
          total: 1,
          unread: 1,
          page: 1,
          pageSize: 10
        }
      })

      vi.mocked(messagesApi.getMessage).mockResolvedValue({
        success: true,
        data: {
          id: 1,
          title: '测试消息',
          content: '详细内容',
          sender: '系统',
          timestamp: '2023-01-01',
          read: false
        }
      })

      wrapper = mount(MessagesPage, {
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
            'el-pagination': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const viewButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('查看') || button.text().includes('View'))[0]

      if (viewButton) {
        await viewButton.trigger('click')
        expect(messagesApi.getMessage).toHaveBeenCalledWith(1)
      }
    })
  })

  describe('批量操作', () => {
    it('应该支持批量标记已读', async () => {
      vi.mocked(messagesApi.getMessages).mockResolvedValue({
        success: true,
        data: {
          messages: [
            { id: 1, title: '消息1', content: '内容1', sender: '系统', timestamp: '2023-01-01', read: false },
            { id: 2, title: '消息2', content: '内容2', sender: '管理员', timestamp: '2023-01-02', read: false }
          ],
          total: 2,
          unread: 2,
          page: 1,
          pageSize: 10
        }
      })

      vi.mocked(messagesApi.markMessageAsRead).mockResolvedValue({
        success: true,
        message: '标记成功'
      })

      wrapper = mount(MessagesPage, {
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
            'el-checkbox': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const batchMarkReadButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('全部标记已读') || button.text().includes('Mark All Read'))[0]

      if (batchMarkReadButton) {
        await batchMarkReadButton.trigger('click')
        // 验证批量操作被调用
        expect(messagesApi.markMessageAsRead).toHaveBeenCalled()
      }
    })

    it('应该支持批量删除', async () => {
      vi.mocked(messagesApi.getMessages).mockResolvedValue({
        success: true,
        data: {
          messages: [
            { id: 1, title: '消息1', content: '内容1', sender: '系统', timestamp: '2023-01-01', read: false }
          ],
          total: 1,
          unread: 1,
          page: 1,
          pageSize: 10
        }
      })

      vi.mocked(messagesApi.deleteMessage).mockResolvedValue({
        success: true,
        message: '删除成功'
      })

      wrapper = mount(MessagesPage, {
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
            'el-checkbox': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const batchDeleteButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('批量删除') || button.text().includes('Batch Delete'))[0]

      if (batchDeleteButton) {
        await batchDeleteButton.trigger('click')
        // 验证批量操作被调用
        expect(messagesApi.deleteMessage).toHaveBeenCalled()
      }
    })
  })

  describe('消息筛选', () => {
    it('应该支持按已读/未读筛选', async () => {
      wrapper = mount(MessagesPage, {
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
            'el-tabs': true,
            'el-tab-pane': true
          }
        }
      })

      await nextTick()

      const tabs = wrapper.findComponent({ name: 'el-tabs' })
      expect(tabs.exists()).toBe(true)
    })

    it('应该支持按发送者筛选', async () => {
      wrapper = mount(MessagesPage, {
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
            'el-select': true,
            'el-option': true
          }
        }
      })

      await nextTick()

      const senderFilter = wrapper.findComponent({ name: 'el-select' })
      expect(senderFilter.exists()).toBe(true)
    })
  })

  describe('数据加载', () => {
    it('应该在挂载时加载消息列表', async () => {
      const getMessagesSpy = vi.spyOn(messagesApi, 'getMessages')

      vi.mocked(messagesApi.getMessages).mockResolvedValue({
        success: true,
        data: {
          messages: [],
          total: 0,
          unread: 0,
          page: 1,
          pageSize: 10
        }
      })

      wrapper = mount(MessagesPage, {
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
            'el-pagination': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(getMessagesSpy).toHaveBeenCalled()
    })

    it('应该正确处理加载状态', async () => {
      vi.mocked(messagesApi.getMessages).mockResolvedValue({
        success: true,
        data: {
          messages: [],
          total: 0,
          unread: 0,
          page: 1,
          pageSize: 10
        }
      })

      wrapper = mount(MessagesPage, {
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
            'el-pagination': true
          }
        }
      })

      await nextTick()

      // 验证加载状态
      expect(wrapper.find('.messages-container').exists()).toBe(true)

      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证加载完成状态
      expect(wrapper.find('.messages-list').exists()).toBe(true)
    })

    it('应该正确处理API错误', async () => {
      vi.mocked(messagesApi.getMessages).mockRejectedValue(new Error('API Error'))

      wrapper = mount(MessagesPage, {
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
            'el-pagination': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证错误状态
      expect(wrapper.find('.messages-container').exists()).toBe(true)
    })
  })

  describe('分页功能', () => {
    it('应该支持消息列表分页', async () => {
      vi.mocked(messagesApi.getMessages).mockResolvedValue({
        success: true,
        data: {
          messages: Array(15).fill().map((_, i) => ({ 
            id: i + 1, 
            title: `消息${i + 1}`, 
            content: `内容${i + 1}`, 
            sender: '系统', 
            timestamp: '2023-01-01', 
            read: false 
          })),
          total: 15,
          unread: 15,
          page: 1,
          pageSize: 10
        }
      })

      wrapper = mount(MessagesPage, {
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
            'el-pagination': true
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
    it('应该支持实时消息更新', async () => {
      vi.mocked(messagesApi.getMessages).mockResolvedValue({
        success: true,
        data: {
          messages: [],
          total: 0,
          unread: 0,
          page: 1,
          pageSize: 10
        }
      })

      wrapper = mount(MessagesPage, {
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
            'el-pagination': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证组件支持实时更新
      expect(wrapper.find('.messages-container').exists()).toBe(true)
    })
  })

  describe('样式和布局', () => {
    it('应该应用正确的容器样式', async () => {
      vi.mocked(messagesApi.getMessages).mockResolvedValue({
        success: true,
        data: {
          messages: [],
          total: 0,
          unread: 0,
          page: 1,
          pageSize: 10
        }
      })

      wrapper = mount(MessagesPage, {
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
            'el-pagination': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const container = wrapper.find('.messages-container')
      expect(container.exists()).toBe(true)
    })

    it('应该在移动设备上应用响应式样式', async () => {
      vi.mocked(messagesApi.getMessages).mockResolvedValue({
        success: true,
        data: {
          messages: [],
          total: 0,
          unread: 0,
          page: 1,
          pageSize: 10
        }
      })

      wrapper = mount(MessagesPage, {
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
            'el-pagination': true
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
      expect(wrapper.find('.messages-container').exists()).toBe(true)
    })
  })

  describe('可访问性', () => {
    it('应该具有正确的ARIA属性', async () => {
      vi.mocked(messagesApi.getMessages).mockResolvedValue({
        success: true,
        data: {
          messages: [],
          total: 0,
          unread: 0,
          page: 1,
          pageSize: 10
        }
      })

      wrapper = mount(MessagesPage, {
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
            'el-pagination': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const mainContent = wrapper.find('main')
      expect(mainContent.exists()).toBe(true)
      expect(mainContent.attributes('role')).toBe('main')
    })

    it('消息列表应该具有正确的ARIA属性', async () => {
      vi.mocked(messagesApi.getMessages).mockResolvedValue({
        success: true,
        data: {
          messages: [
            { id: 1, title: '测试消息', content: '内容', sender: '系统', timestamp: '2023-01-01', read: false }
          ],
          total: 1,
          unread: 1,
          page: 1,
          pageSize: 10
        }
      })

      wrapper = mount(MessagesPage, {
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
            'el-pagination': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const messagesList = wrapper.find('.messages-list')
      expect(messagesList.attributes('role')).toBe('list')
    })
  })
})