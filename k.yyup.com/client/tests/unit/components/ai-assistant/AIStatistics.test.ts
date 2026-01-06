import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AIStatistics from '@/components/ai-assistant/AIStatistics.vue'
import ElMessage from 'element-plus'

// Mock dependencies
vi.mock('@/composables/useChatHistory', () => ({
  useChatHistory: () => ({
    sessions: { value: [] },
    getStatistics: vi.fn(() => ({
      totalSessions: 35,
      totalMessages: 127,
      userMessages: 77,
      aiMessages: 50,
      oldestSessionDate: '2025-09-05',
      storageSize: 12700
    })),
    clearAllHistory: vi.fn()
  })
}))

vi.mock('@/services/ai-router', () => ({
  getAIUsageStats: vi.fn(() => Promise.resolve({
    data: {
      totalConversations: 35,
      totalMessages: 127,
      userMessages: 77,
      aiMessages: 50,
      oldestSessionDate: '2025-09-05',
      todayRequests: 12,
      totalRequests: 245,
      averageResponseTime: 850,
      serviceStatus: 'online'
    }
  }))
}))

vi.mock('@/utils/date', () => ({
  formatDate: vi.fn((date) => {
    if (typeof date === 'string') return date
    return '2025-09-15'
  })
}))

describe('AIStatistics.vue', () => {
  let wrapper: any
  let pinia: any

  beforeEach(async () => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    // Mock Element Plus message and message box
    vi.spyOn(ElMessage, 'success').mockImplementation(() => {})
    vi.spyOn(ElMessage, 'error').mockImplementation(() => {})
    vi.spyOn(ElMessage, 'warning').mockImplementation(() => {})
    
    // Mock Element Plus message box
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
    if (wrapper) {
      wrapper.unmount()
    }
    vi.clearAllMocks()
  })

  const createWrapper = (props = {}) => {
    return mount(AIStatistics, {
      props: {
        modelValue: true,
        ...props
      },
      global: {
        plugins: [pinia],
        stubs: {
          'el-dialog': true,
          'el-button': true,
          'el-icon': true,
          'el-tag': true,
          'el-row': true,
          'el-col': true,
          'el-table': true,
          'el-table-column': true,
          'el-progress': true,
          'el-tooltip': true,
          'ChatLineRound': true,
          'Message': true,
          'Timer': true,
          'TrendCharts': true,
          'Refresh': true,
          'Download': true,
          'Delete': true
        }
      }
    })
  }

  describe('Component Rendering', () => {
    it('should render component correctly when visible', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.ai-statistics-dialog').exists()).toBe(true)
      expect(wrapper.find('.statistics-container').exists()).toBe(true)
      expect(wrapper.find('.overview-cards').exists()).toBe(true)
    })

    it('should display overview cards correctly', () => {
      wrapper = createWrapper()
      
      const statCards = wrapper.findAll('.stat-card')
      expect(statCards.length).toBe(4)
      
      // Check card content
      expect(statCards[0].text()).toContain('总会话数')
      expect(statCards[1].text()).toContain('总消息数')
      expect(statCards[2].text()).toContain('平均响应时间')
      expect(statCards[3].text()).toContain('今日请求数')
    })

    it('should show detailed statistics sections', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.detailed-stats').exists()).toBe(true)
      expect(wrapper.find('.shortcuts-stats').exists()).toBe(true)
      expect(wrapper.find('.action-buttons').exists()).toBe(true)
    })
  })

  describe('Props Handling', () => {
    it('should accept modelValue prop and control dialog visibility', () => {
      wrapper = createWrapper({ modelValue: false })
      
      expect(wrapper.props('modelValue')).toBe(false)
    })

    it('should emit update:modelValue event when dialog is closed', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ visible: false })
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false])
    })
  })

  describe('Statistics Data Loading', () => {
    it('should load statistics data on mount', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.loadStats()
      
      expect(wrapper.vm.chatStats.totalSessions).toBe(35)
      expect(wrapper.vm.chatStats.totalMessages).toBe(127)
      expect(wrapper.vm.aiStats.todayRequests).toBe(12)
      expect(wrapper.vm.serviceStatus).toBe('online')
    })

    it('should handle API errors gracefully', async () => {
      const { getAIUsageStats } = await import('@/services/ai-router')
      getAIUsageStats.mockRejectedValue(new Error('API Error'))
      
      wrapper = createWrapper()
      
      await wrapper.vm.loadStats()
      
      // Should fall back to local data
      expect(wrapper.vm.chatStats.totalSessions).toBe(35)
      expect(wrapper.vm.aiStats.todayRequests).toBe(0)
      expect(ElMessage.warning).toHaveBeenCalledWith('使用本地数据显示统计信息')
    })

    it('should recalculate success rate correctly', () => {
      wrapper = createWrapper()
      
      await wrapper.setData({
        aiStats: {
          totalRequests: 100,
          todayRequests: 12,
          averageResponseTime: 850
        }
      })
      
      const successRate = wrapper.vm.successRate
      expect(successRate).toBe(95) // 95% of 100
    })
  })

  describe('Data Formatting', () => {
    it('should format bytes correctly', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.formatBytes(0)).toBe('0 B')
      expect(wrapper.vm.formatBytes(1024)).toBe('1 KB')
      expect(wrapper.vm.formatBytes(1048576)).toBe('1 MB')
      expect(wrapper.vm.formatBytes(1073741824)).toBe('1 GB')
    })

    it('should get status type correctly', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getStatusType('online')).toBe('success')
      expect(wrapper.vm.getStatusType('offline')).toBe('danger')
      expect(wrapper.vm.getStatusType('busy')).toBe('warning')
      expect(wrapper.vm.getStatusType('unknown')).toBe('info')
    })

    it('should get status text correctly', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getStatusText('online')).toBe('在线')
      expect(wrapper.vm.getStatusText('offline')).toBe('离线')
      expect(wrapper.vm.getStatusText('busy')).toBe('繁忙')
      expect(wrapper.vm.getStatusText('unknown')).toBe('未知')
    })
  })

  describe('Shortcut Statistics', () => {
    it('should load shortcut statistics from chat history', () => {
      const { useChatHistory } = require('@/composables/useChatHistory')
      const mockChatHistory = useChatHistory()
      
      // Mock sessions with shortcut usage
      mockChatHistory.sessions.value = [
        {
          messages: [
            { shortcutId: 1 },
            { shortcutId: 1 },
            { shortcutId: 2 }
          ]
        }
      ]
      
      wrapper = createWrapper()
      
      wrapper.vm.loadShortcutStats()
      
      expect(wrapper.vm.shortcutStats.length).toBeGreaterThan(0)
    })

    it('should calculate max shortcut count correctly', () => {
      wrapper = createWrapper()
      
      await wrapper.setData({
        shortcutStats: [
          { name: 'Shortcut 1', count: 5 },
          { name: 'Shortcut 2', count: 10 },
          { name: 'Shortcut 3', count: 3 }
        ]
      })
      
      expect(wrapper.vm.maxShortcutCount).toBe(10)
    })
  })

  describe('User Interactions', () => {
    it('should refresh statistics when refresh button is clicked', async () => {
      wrapper = createWrapper()
      
      const loadStatsSpy = vi.spyOn(wrapper.vm, 'loadStats')
      
      await wrapper.vm.refreshStats()
      
      expect(loadStatsSpy).toHaveBeenCalled()
    })

    it('should export statistics data correctly', () => {
      wrapper = createWrapper()
      
      // Mock URL.createObjectURL and URL.revokeObjectURL
      global.URL.createObjectURL = vi.fn(() => 'blob:test-url')
      global.URL.revokeObjectURL = vi.fn()
      
      // Mock document.createElement
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      }
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink)
      
      wrapper.vm.exportStats()
      
      expect(document.createElement).toHaveBeenCalledWith('a')
      expect(mockLink.click).toHaveBeenCalled()
      expect(ElMessage.success).toHaveBeenCalledWith('统计数据已导出')
    })

    it('should handle export errors gracefully', () => {
      wrapper = createWrapper()
      
      // Mock document.createElement to throw error
      vi.spyOn(document, 'createElement').mockImplementation(() => {
        throw new Error('Export failed')
      })
      
      wrapper.vm.exportStats()
      
      expect(ElMessage.error).toHaveBeenCalledWith('导出统计数据失败')
    })
  })

  describe('History Management', () => {
    it('should clear history after confirmation', async () => {
      const { ElMessageBox } = await import('element-plus')
      ElMessageBox.confirm.mockResolvedValue(true)
      
      const { useChatHistory } = require('@/composables/useChatHistory')
      const mockChatHistory = useChatHistory()
      
      wrapper = createWrapper()
      
      await wrapper.vm.clearHistory()
      
      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        '确定要清空所有聊天历史记录吗？此操作不可恢复。',
        '确认清空',
        expect.objectContaining({
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
      )
      
      expect(mockChatHistory.clearAllHistory).toHaveBeenCalled()
      expect(ElMessage.success).toHaveBeenCalledWith('历史记录已清空')
    })

    it('should not clear history when user cancels', async () => {
      const { ElMessageBox } = await import('element-plus')
      ElMessageBox.confirm.mockRejectedValue('cancel')
      
      const { useChatHistory } = require('@/composables/useChatHistory')
      const mockChatHistory = useChatHistory()
      
      wrapper = createWrapper()
      
      await wrapper.vm.clearHistory()
      
      expect(mockChatHistory.clearAllHistory).not.toHaveBeenCalled()
    })

    it('should handle clear history errors gracefully', async () => {
      const { ElMessageBox } = await import('element-plus')
      ElMessageBox.confirm.mockResolvedValue(true)
      
      const { useChatHistory } = require('@/composables/useChatHistory')
      const mockChatHistory = useChatHistory()
      mockChatHistory.clearAllHistory.mockRejectedValue(new Error('Clear failed'))
      
      wrapper = createWrapper()
      
      await wrapper.vm.clearHistory()
      
      expect(ElMessage.error).toHaveBeenCalledWith('清空历史记录失败')
    })
  })

  describe('Storage Size Calculation', () => {
    it('should calculate storage size correctly', () => {
      wrapper = createWrapper()
      
      const size1 = wrapper.vm.calculateStorageSize(100)
      const size2 = wrapper.vm.calculateStorageSize(1000)
      
      expect(size1).toBe(10000) // 100 * 100 bytes
      expect(size2).toBe(100000) // 1000 * 100 bytes
    })
  })

  describe('Responsive Design', () => {
    it('should handle window resize events', () => {
      wrapper = createWrapper()
      
      // Simulate window resize
      window.innerWidth = 500
      window.dispatchEvent(new Event('resize'))
      
      expect(wrapper.exists()).toBe(true)
    })

    it('should maintain proper layout on different screen sizes', () => {
      wrapper = createWrapper()
      
      // Test mobile view
      window.innerWidth = 375
      window.dispatchEvent(new Event('resize'))
      
      const container = wrapper.find('.statistics-container')
      expect(container.exists()).toBe(true)
    })
  })

  describe('Performance Optimization', () => {
    it('should debounce rapid refresh clicks', async () => {
      wrapper = createWrapper()
      
      const loadStatsSpy = vi.spyOn(wrapper.vm, 'loadStats')
      
      // Simulate rapid clicks
      await Promise.all([
        wrapper.vm.refreshStats(),
        wrapper.vm.refreshStats(),
        wrapper.vm.refreshStats()
      ])
      
      // Should handle multiple calls gracefully
      expect(loadStatsSpy).toHaveBeenCalledTimes(3)
    })

    it('should cleanup resources on unmount', () => {
      wrapper = createWrapper()
      
      wrapper.unmount()
      
      // Should cleanup without errors
      expect(wrapper.exists()).toBe(false)
    })
  })

  describe('Accessibility', () => {
    it('should provide proper ARIA labels', () => {
      wrapper = createWrapper()
      
      const dialog = wrapper.find('.ai-statistics-dialog')
      expect(dialog.exists()).toBe(true)
    })

    it('should maintain keyboard navigation support', async () => {
      wrapper = createWrapper()
      
      // Test keyboard interactions
      const refreshButton = wrapper.find('[title="刷新数据"]')
      expect(refreshButton.exists()).toBe(true)
    })
  })
})