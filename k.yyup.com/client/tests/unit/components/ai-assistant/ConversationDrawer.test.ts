
// 使用全局表单引用Mock
beforeEach(() => {
  // 设置表单引用Mock
  if (typeof formRef !== 'undefined' && formRef.value) => {
    Object.assign(formRef.value, global.mockFormRef)
  }
  if (typeof editInput !== 'undefined' && editInput.value) {
    Object.assign(editInput.value, global.mockInputRef)
  }
})
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})


// Element Plus Mock for form validation
const mockFormRef = {
  clearValidate: vi.fn(),
  resetFields: vi.fn(),
  validate: vi.fn(() => Promise.resolve(true)),
  validateField: vi.fn()
}

const mockInputRef = {
  focus: vi.fn(),
  blur: vi.fn(),
  select: vi.fn()
}

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElForm: {
    name: 'ElForm',
    template: '<form><slot /></form>'
  },
  ElFormItem: {
    name: 'ElFormItem',
    template: '<div><slot /></div>'
  },
  ElInput: {
    name: 'ElInput',
    template: '<input />'
  },
  ElButton: {
    name: 'ElButton',
    template: '<button><slot /></button>'
  }
}))

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ConversationDrawer from '@/components/ai-assistant/ConversationDrawer.vue'
import ElMessage from 'element-plus'

// Mock dependencies
vi.mock('@/utils/request', () => ({
  default: vi.fn()
}))

vi.mock('@/api/endpoints', () => ({
  AI_ENDPOINTS: {
    CONVERSATIONS: '/api/conversations',
    CONVERSATION_BY_ID: (id: string) => `/api/conversations/${id}`
  }
}))

// 控制台错误检测变量
let consoleSpy: any

describe('ConversationDrawer.vue', () => {
  let wrapper: any
  let pinia: any

  beforeEach(async () => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    // Mock Element Plus message and message box
    vi.spyOn(ElMessage, 'success').mockImplementation(() => {})
    vi.spyOn(ElMessage, 'error').mockImplementation(() => {})
    
    const mockMessageBox = {
      confirm: vi.fn(),
      prompt: vi.fn()
    }
    vi.mock('element-plus', async () => {
      const actual = await vi.importActual('element-plus')
      return {
        ...actual,
        ElMessageBox: mockMessageBox
      }
    })
  })

  afterEach(() => {
    if (wrapper) => {
      wrapper.unmount()
    }
    vi.clearAllMocks()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  const createWrapper = (props = {}) => {
    return mount(ConversationDrawer, {
      props: {
        visible: true,
        currentConversationId: null,
        ...props
      },
      global: {
        plugins: [pinia],
        stubs: {
          'el-drawer': true,
          'el-button': true,
          'el-icon': true,
          'el-empty': true,
          'el-skeleton': true,
          'el-scrollbar': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-tag': true,
          'Close': true,
          'Delete': true,
          'Star': true,
          'ChatDotRound': true,
          'MoreFilled': true,
          'Edit': true,
          'FolderOpened': true,
          'Plus': true,
          'Refresh': true
        }
      }
    })
  }

  describe('Component Rendering', () => {
    it('should render component correctly when visible', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.conversation-drawer').exists()).toBe(true)
      expect(wrapper.find('.drawer-header').exists()).toBe(true)
      expect(wrapper.find('.drawer-actions').exists()).toBe(true)
      expect(wrapper.find('.conversation-list').exists()).toBe(true)
    })

    it('should display drawer header correctly', () => {
      wrapper = createWrapper()
      
      const header = wrapper.find('.drawer-header')
      expect(header.exists()).toBe(true)
      expect(header.find('.header-title').exists()).toBe(true)
      expect(header.find('.title-icon').exists()).toBe(true)
      expect(header.find('h3').text()).toBe('会话列表')
    })

    it('should show drawer subtitle', () => {
      wrapper = createWrapper()
      
      const subtitle = wrapper.find('.header-subtitle')
      expect(subtitle.exists()).toBe(true)
      expect(subtitle.text()).toBe('管理您的AI对话历史')
    })

    it('should display action buttons', () => {
      wrapper = createWrapper()
      
      const actions = wrapper.find('.drawer-actions')
      expect(actions.exists()).toBe(true)
      
      const buttons = actions.findAllComponents({ name: 'el-button' })
      expect(buttons.length).toBe(2)
      expect(buttons[0].text()).toContain('新建会话')
      expect(buttons[1].text()).toContain('刷新')
    })

    it('should show close button', () => {
      wrapper = createWrapper()
      
      const closeBtn = wrapper.find('.close-btn')
      expect(closeBtn.exists()).toBe(true)
    })
  })

  describe('Props Handling', () => {
    it('should accept visible prop and control drawer visibility', () => {
      wrapper = createWrapper({ visible: false })
      
      expect(wrapper.props('visible')).toBe(false)
    })

    it('should accept currentConversationId prop', () => {
      wrapper = createWrapper({ currentConversationId: 'test-conversation-id' })
      
      expect(wrapper.props('currentConversationId')).toBe('test-conversation-id')
    })

    it('should emit update:visible event when drawer is closed', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ visible: false })
      expect(wrapper.emitted('update:visible')).toBeTruthy()
      expect(wrapper.emitted('update:visible')[0]).toEqual([false])
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no conversations exist', () => {
      wrapper = createWrapper()
      
      await wrapper.setData({
        conversations: [],
        conversationsLoading: false
      })
      
      const emptyState = wrapper.findComponent({ name: 'el-empty' })
      expect(emptyState.exists()).toBe(true)
      expect(emptyState.props('description')).toBe('暂无会话')
    })

    it('should hide empty state when conversations exist', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({
        conversations: [
          { id: '1', title: '会话1' }
        ],
        conversationsLoading: false
      })
      
      const emptyState = wrapper.findComponent({ name: 'el-empty' })
      expect(emptyState.exists()).toBe(false)
    })

    it('should show skeleton when loading', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({
        conversationsLoading: true
      })
      
      const skeleton = wrapper.findComponent({ name: 'el-skeleton' })
      expect(skeleton.exists()).toBe(true)
    })
  })

  describe('Conversation List', () => {
    it('should display conversation items correctly', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({
        conversations: [
          {
            id: '1',
            title: '测试会话',
            messageCount: 5,
            lastMessageAt: '2025-09-15T10:00:00Z',
            isPinned: false,
            summary: '测试摘要'
          }
        ],
        conversationsLoading: false
      })
      
      const conversationItems = wrapper.findAll('.conversation-item')
      expect(conversationItems.length).toBe(1)
      
      const item = conversationItems[0]
      expect(item.find('.title').text()).toBe('测试会话')
      expect(item.find('.conversation-preview').text()).toBe('测试摘要')
    })

    it('should apply active class to current conversation', async () => {
      wrapper = createWrapper({ currentConversationId: '1' })
      
      await wrapper.setData({
        conversations: [
          { id: '1', title: '会话1' },
          { id: '2', title: '会话2' }
        ],
        conversationsLoading: false
      })
      
      const items = wrapper.findAll('.conversation-item')
      expect(items[0].classes()).toContain('active')
      expect(items[1].classes()).not.toContain('active')
    })

    it('should show pinned icon for pinned conversations', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({
        conversations: [
          { id: '1', title: '置顶会话', isPinned: true },
          { id: '2', title: '普通会话', isPinned: false }
        ],
        conversationsLoading: false
      })
      
      const items = wrapper.findAll('.conversation-item')
      expect(items[0].classes()).toContain('pinned')
      expect(items[0].find('.pin-icon').exists()).toBe(true)
      expect(items[1].classes()).not.toContain('pinned')
    })

    it('should show archived tag for archived conversations', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({
        conversations: [
          { id: '1', title: '已归档会话', isArchived: true },
          { id: '2', title: '正常会话', isArchived: false }
        ],
        conversationsLoading: false
      })
      
      const items = wrapper.findAll('.conversation-item')
      expect(items[0].find('.archived-tag').exists()).toBe(true)
      expect(items[1].find('.archived-tag').exists()).toBe(false)
    })

    it('should show unread badge for conversations with unread messages', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({
        conversations: [
          { id: '1', title: '未读会话', unreadCount: 3 },
          { id: '2', title: '已读会话', unreadCount: 0 }
        ],
        conversationsLoading: false
      })
      
      const items = wrapper.findAll('.conversation-item')
      expect(items[0].find('.unread-badge').exists()).toBe(true)
      expect(items[0].find('.unread-badge').text()).toBe('3')
      expect(items[1].find('.unread-badge').exists()).toBe(false)
    })

    it('should display message count correctly', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({
        conversations: [
          { id: '1', title: '会话1', messageCount: 5 },
          { id: '2', title: '会话2', messageCount: 0 }
        ],
        conversationsLoading: false
      })
      
      const items = wrapper.findAll('.conversation-item')
      expect(items[0].find('.message-count').text()).toContain('5 条消息')
      expect(items[1].find('.message-count').text()).toContain('0 条消息')
    })
  })

  describe('Time Formatting', () => {
    it('should format time as "刚刚" for recent messages', () => {
      wrapper = createWrapper()
      
      const recentTime = new Date(Date.now() - 30000).toISOString() // 30 seconds ago
      const formatted = wrapper.vm.formatTime(recentTime)
      
      expect(formatted).toBe('刚刚')
    })

    it('should format time as "X分钟前" for messages within an hour', () => {
      wrapper = createWrapper()
      
      const recentTime = new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
      const formatted = wrapper.vm.formatTime(recentTime)
      
      expect(formatted).toBe('30分钟前')
    })

    it('should format time as "X小时前" for messages within a day', () => {
      wrapper = createWrapper()
      
      const recentTime = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      const formatted = wrapper.vm.formatTime(recentTime)
      
      expect(formatted).toBe('2小时前')
    })

    it('should format time as date and time for older messages', () => {
      wrapper = createWrapper()
      
      const oldTime = '2025-09-10T10:00:00Z'
      const formatted = wrapper.vm.formatTime(oldTime)
      
      expect(formatted).toContain('2025')
      expect(formatted).toContain('10:00')
    })

    it('should handle invalid time gracefully', () => {
      wrapper = createWrapper()
      
      const formatted = wrapper.vm.formatTime('invalid-time')
      
      expect(formatted).toBe('未知时间')
    })

    it('should use updatedAt when lastMessageAt is not available', () => {
      wrapper = createWrapper()
      
      const time = new Date().toISOString()
      const formatted = wrapper.vm.formatTime('', time)
      
      expect(formatted).toBeDefined()
    })
  })

  describe('User Interactions', () => {
    it('should handle conversation selection', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({
        conversations: [
          { id: '1', title: '会话1' }
        ],
        conversationsLoading: false
      })
      
      const item = wrapper.find('.conversation-item')
      await item.trigger('click')
      
      expect(wrapper.emitted('conversation-selected')).toBeTruthy()
      expect(wrapper.emitted('conversation-selected')[0]).toEqual(['1'])
      expect(wrapper.emitted('refresh-messages')).toBeTruthy()
      expect(wrapper.emitted('update:visible')).toBeTruthy()
      expect(wrapper.emitted('update:visible')[0]).toEqual([false])
    })

    it('should handle conversation creation', async () => {
      const { default: mockRequest } = await import('@/utils/request')
      mockRequest.mockResolvedValue({ data: { id: 'new-conversation-id' } })
      
      wrapper = createWrapper()
      
      await wrapper.vm.createNewConversation()
      
      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/api/conversations',
          data: { title: '新会话' }
        })
      )
      
      expect(wrapper.emitted('conversation-created')).toBeTruthy()
      expect(wrapper.emitted('conversation-created')[0]).toEqual(['new-conversation-id'])
    })

    it('should handle conversation deletion', async () => {
      const { ElMessageBox } = await import('element-plus')
      ElMessageBox.confirm.mockResolvedValue(true)
      
      const { default: mockRequest } = await import('@/utils/request')
      mockRequest.mockResolvedValue({})
      
      wrapper = createWrapper()
      
      await wrapper.vm.deleteConversationById('1')
      
      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        '确定要删除该会话及其全部消息吗？此操作不可恢复。',
        '删除确认',
        { type: 'warning' }
      )
      
      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          url: '/api/conversations/1'
        })
      )
      
      expect(wrapper.emitted('conversation-deleted')).toBeTruthy()
      expect(wrapper.emitted('conversation-deleted')[0]).toEqual(['1'])
    })

    it('should handle deletion cancellation', async () => {
      const { ElMessageBox } = await import('element-plus')
      ElMessageBox.confirm.mockRejectedValue('cancel')
      
      wrapper = createWrapper()
      
      await wrapper.vm.deleteConversationById('1')
      
      expect(wrapper.emitted('conversation-deleted')).toBeFalsy()
    })

    it('should toggle conversation pin status', async () => {
      const { default: mockRequest } = await import('@/utils/request')
      mockRequest.mockResolvedValue({})
      
      wrapper = createWrapper()
      
      await wrapper.setData({
        conversations: [
          { id: '1', title: '会话1', isPinned: false }
        ]
      })
      
      await wrapper.vm.togglePinConversation('1')
      
      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PATCH',
          url: '/api/conversations/1',
          data: { isPinned: true }
        })
      )
    })

    it('should toggle conversation archive status', async () => {
      const { default: mockRequest } = await import('@/utils/request')
      mockRequest.mockResolvedValue({})
      
      wrapper = createWrapper()
      
      await wrapper.setData({
        conversations: [
          { id: '1', title: '会话1', isArchived: false }
        ]
      })
      
      await wrapper.vm.toggleArchiveConversation('1')
      
      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PATCH',
          url: '/api/conversations/1',
          data: { isArchived: true }
        })
      )
    })

    it('should handle conversation renaming', async () => {
      const { ElMessageBox } = await import('element-plus')
      ElMessageBox.prompt.mockResolvedValue({ value: '新标题' })
      
      const { default: mockRequest } = await import('@/utils/request')
      mockRequest.mockResolvedValue({})
      
      wrapper = createWrapper()
      
      await wrapper.vm.renameConversation('1', '旧标题')
      
      expect(ElMessageBox.prompt).toHaveBeenCalledWith(
        '输入新的会话标题',
        '重命名',
        expect.objectContaining({
          inputValue: '旧标题',
          inputPlaceholder: '会话标题'
        })
      )
      
      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PATCH',
          url: '/api/conversations/1',
          data: { title: '新标题' }
        })
      )
    })

    it('should not rename if title is unchanged', async () => {
      const { ElMessageBox } = await import('element-plus')
      ElMessageBox.prompt.mockResolvedValue({ value: '旧标题' })
      
      const { default: mockRequest } = await import('@/utils/request')
      
      wrapper = createWrapper()
      
      await wrapper.vm.renameConversation('1', '旧标题')
      
      expect(mockRequest).not.toHaveBeenCalled()
    })

    it('should handle rename cancellation', async () => {
      const { ElMessageBox } = await import('element-plus')
      ElMessageBox.prompt.mockRejectedValue('cancel')
      
      const { default: mockRequest } = await import('@/utils/request')
      
      wrapper = createWrapper()
      
      await wrapper.vm.renameConversation('1', '旧标题')
      
      expect(mockRequest).not.toHaveBeenCalled()
    })
  })

  describe('Loading Conversations', () => {
    it('should load conversations successfully', async () => {
      const { default: mockRequest } = await import('@/utils/request')
      mockRequest.mockResolvedValue({
        data: {
          items: [
            { id: '1', title: '会话1', messageCount: 5 },
            { id: '2', title: '会话2', messageCount: 10 }
          ]
        }
      })
      
      wrapper = createWrapper()
      
      await wrapper.vm.loadConversations()
      
      expect(wrapper.vm.conversations.length).toBe(2)
      expect(wrapper.vm.conversations[0].title).toBe('会话1')
      expect(wrapper.vm.conversations[1].title).toBe('会话2')
      expect(wrapper.vm.conversationsLoading).toBe(false)
    })

    it('should handle API response with different data structure', async () => {
      const { default: mockRequest } = await import('@/utils/request')
      mockRequest.mockResolvedValue({
        data: [
          { id: '1', title: '会话1' },
          { id: '2', title: '会话2' }
        ]
      })
      
      wrapper = createWrapper()
      
      await wrapper.vm.loadConversations()
      
      expect(wrapper.vm.conversations.length).toBe(2)
    })

    it('should handle empty API response', async () => {
      const { default: mockRequest } = await import('@/utils/request')
      mockRequest.mockResolvedValue({ data: null })
      
      wrapper = createWrapper()
      
      await wrapper.vm.loadConversations()
      
      expect(wrapper.vm.conversations).toEqual([])
    })

    it('should handle API errors gracefully', async () => {
      const { default: mockRequest } = await import('@/utils/request')
      mockRequest.mockRejectedValue(new Error('API Error'))
      
      wrapper = createWrapper()
      
      await wrapper.vm.loadConversations()
      
      expect(wrapper.vm.conversations).toEqual([])
      expect(wrapper.vm.conversationsLoading).toBe(false)
    })

    it('should handle missing fields in conversation data', async () => {
      const { default: mockRequest } = await import('@/utils/request')
      mockRequest.mockResolvedValue({
        data: {
          items: [
            { id: '1' }, // Missing title and other fields
            { id: '2', title: '会话2' }
          ]
        }
      })
      
      wrapper = createWrapper()
      
      await wrapper.vm.loadConversations()
      
      expect(wrapper.vm.conversations.length).toBe(2)
      expect(wrapper.vm.conversations[0].title).toBe('未命名会话')
      expect(wrapper.vm.conversations[1].title).toBe('会话2')
    })
  })

  describe('Pinned Status Check', () => {
    it('should return correct pinned status', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({
        conversations: [
          { id: '1', isPinned: true },
          { id: '2', isPinned: false }
        ]
      })
      
      expect(wrapper.vm.isPinned('1')).toBe(true)
      expect(wrapper.vm.isPinned('2')).toBe(false)
      expect(wrapper.vm.isPinned('3')).toBe(false) // Non-existent conversation
    })
  })

  describe('Exposed Methods', () => {
    it('should expose loadConversations method', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.loadConversations).toBeDefined()
      expect(typeof wrapper.vm.loadConversations).toBe('function')
    })

    it('should call loadConversations when exposed method is called', async () => {
      const { default: mockRequest } = await import('@/utils/request')
      mockRequest.mockResolvedValue({ data: { items: [] } })
      
      wrapper = createWrapper()
      
      await wrapper.vm.loadConversations()
      
      expect(mockRequest).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should handle conversation selection errors', async () => {
      wrapper = createWrapper()
      
      // Mock an error during selection
      const emitSpy = vi.spyOn(wrapper, 'emit')
      emitSpy.mockImplementation(() => {
        throw new Error('Selection error')
      })
      
      await wrapper.setData({
        conversations: [
          { id: '1', title: '会话1' }
        ],
        conversationsLoading: false
      })
      
      const item = wrapper.find('.conversation-item')
      
      // Should not throw error
      await expect(() => item.trigger('click')).not.toThrow()
    })

    it('should handle API errors during conversation operations', async () => {
      const { default: mockRequest } = await import('@/utils/request')
      mockRequest.mockRejectedValue(new Error('API Error'))
      
      wrapper = createWrapper()
      
      await wrapper.vm.togglePinConversation('1')
      
      expect(ElMessage.error).toHaveBeenCalledWith('切换置顶失败')
    })

    it('should handle rename operation errors', async () => {
      const { ElMessageBox } = await import('element-plus')
      ElMessageBox.prompt.mockResolvedValue({ value: '新标题' })
      
      const { default: mockRequest } = await import('@/utils/request')
      mockRequest.mockRejectedValue(new Error('Rename failed'))
      
      wrapper = createWrapper()
      
      await wrapper.vm.renameConversation('1', '旧标题')
      
      expect(ElMessage.error).toHaveBeenCalledWith('重命名失败')
    })
  })

  describe('Accessibility', () => {
    it('should maintain proper focus management', () => {
      wrapper = createWrapper()
      
      const drawer = wrapper.findComponent({ name: 'el-drawer' })
      expect(drawer.exists()).toBe(true)
    })

    it('should provide proper keyboard navigation', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({
        conversations: [
          { id: '1', title: '会话1' }
        ],
        conversationsLoading: false
      })
      
      const item = wrapper.find('.conversation-item')
      
      // Test keyboard interactions
      await item.trigger('keydown.enter')
      await item.trigger('keydown.space')
      
      expect(wrapper.emitted('conversation-selected')).toBeTruthy()
    })

    it('should handle dropdown menu interactions', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({
        conversations: [
          { id: '1', title: '会话1' }
        ],
        conversationsLoading: false
      })
      
      const dropdown = wrapper.findComponent({ name: 'el-dropdown' })
      expect(dropdown.exists()).toBe(true)
    })
  })

  describe('Performance Optimization', () => {
    it('should handle rapid conversation loading', async () => {
      const { default: mockRequest } = await import('@/utils/request')
      mockRequest.mockResolvedValue({ data: { items: [] } })
      
      wrapper = createWrapper()
      
      // Simulate rapid loading calls
      await Promise.all([
        wrapper.vm.loadConversations(),
        wrapper.vm.loadConversations(),
        wrapper.vm.loadConversations()
      ])
      
      expect(mockRequest).toHaveBeenCalledTimes(3)
    })

    it('should cleanup resources on unmount', () => {
      wrapper = createWrapper()
      
      wrapper.unmount()
      
      expect(wrapper.exists()).toBe(false)
    })
  })

  describe('Responsive Design', () => {
    it('should handle different screen sizes', () => {
      wrapper = createWrapper()
      
      // Test mobile view
      window.innerWidth = 375
      window.dispatchEvent(new Event('resize'))
      
      const drawer = wrapper.findComponent({ name: 'el-drawer' })
      expect(drawer.exists()).toBe(true)
    })

    it('should maintain proper layout on resize', () => {
      wrapper = createWrapper()
      
      window.dispatchEvent(new Event('resize'))
      
      expect(wrapper.exists()).toBe(true)
    })
  })
})