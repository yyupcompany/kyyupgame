import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import OptimizedAssistant from '@/components/ai-assistant/OptimizedAssistant.vue'
import { useUserStore } from '@/stores/user'
import { aiAssistantOptimizedApi } from '@/api/ai-assistant-optimized'
import PerformanceMonitor from '@/components/ai-assistant/PerformanceMonitor.vue'
import ConfigPanel from '@/components/ai-assistant/ConfigPanel.vue'

// Mock Element Plus
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn()
    }
  }
})

// Mock user store
vi.mock('@/stores/user', () => ({
  useUserStore: vi.fn(() => ({
    userInfo: {
      id: 1,
      name: 'Test User',
      avatar: 'test-avatar.jpg'
    }
  }))
}))

// Mock AI assistant API
vi.mock('@/api/ai-assistant-optimized', () => ({
  aiAssistantOptimizedApi: {
    query: vi.fn()
  }
}))

// Mock child components
vi.mock('@/components/ai-assistant/PerformanceMonitor.vue', () => ({
  default: {
    name: 'PerformanceMonitor',
    template: '<div class="performance-monitor">Performance Monitor</div>'
  }
}))

vi.mock('@/components/ai-assistant/ConfigPanel.vue', () => ({
  default: {
    name: 'ConfigPanel',
    template: '<div class="config-panel">Config Panel</div>'
  }
}))

// Mock scroll behavior
const mockScrollTo = vi.fn()
Object.defineProperty(Element.prototype, 'scrollTo', {
  value: mockScrollTo,
  writable: true
})

// 控制台错误检测变量
let consoleSpy: any

describe('OptimizedAssistant.vue', () => {
  let wrapper: any

  const mockApiResponse = {
    success: true,
    data: {
      response: '这是一个测试回复',
      level: 'direct',
      tokensUsed: 100,
      tokensSaved: 200,
      processingTime: 500,
      savingRate: 66.7
    }
  }

  beforeEach(() => {
    vi.mocked(aiAssistantOptimizedApi.query).mockResolvedValue(mockApiResponse)
    
    wrapper = mount(OptimizedAssistant, {
      global: {
        stubs: {
          'el-icon': true,
          'el-row': true,
          'el-col': true,
          'el-button': true,
          'el-card': true,
          'el-input': true,
          'el-tag': true,
          'el-avatar': true,
          'el-collapse': true,
          'el-collapse-item': true,
          'el-progress': true,
          'el-dialog': true,
          'el-switch': true,
          PerformanceMonitor: true,
          ConfigPanel: true
        },
        directives: {
          permission: {
            beforeMount: vi.fn()
          }
        }
      }
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
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

  describe('组件渲染', () => {
    it('应该正确渲染组件', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.optimized-assistant').exists()).toBe(true)
    })

    it('应该显示页面标题', () => {
      expect(wrapper.text()).toContain('AI助手优化')
      expect(wrapper.text()).toContain('三级分层处理，智能降低Token消耗，提升响应速度')
    })

    it('应该显示操作按钮', () => {
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThan(0)
      expect(wrapper.text()).toContain('性能监控')
      expect(wrapper.text()).toContain('配置管理')
    })

    it('应该显示聊天界面', () => {
      expect(wrapper.find('.chat-section').exists()).toBe(true)
      expect(wrapper.find('.chat-card').exists()).toBe(true)
    })

    it('应该显示统计面板', () => {
      expect(wrapper.find('.stats-section').exists()).toBe(true)
      expect(wrapper.find('.stats-card').exists()).toBe(true)
    })

    it('应该显示欢迎消息', () => {
      const messages = wrapper.vm.messages
      expect(messages).toHaveLength(1)
      expect(messages[0].role).toBe('assistant')
      expect(messages[0].content).toContain('优化后的AI助手')
    })
  })

  describe('消息发送', () => {
    it('应该发送用户消息', async () => {
      await wrapper.setData({
        inputMessage: '测试消息'
      })
      
      const sendButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('发送')
      )
      await sendButton.trigger('click')
      
      expect(wrapper.vm.inputMessage).toBe('')
      expect(wrapper.vm.isLoading).toBe(true)
      expect(wrapper.vm.messages).toHaveLength(2)
      expect(wrapper.vm.messages[0].role).toBe('user')
      expect(wrapper.vm.messages[0].content).toBe('测试消息')
    })

    it('应该调用AI API', async () => {
      await wrapper.setData({
        inputMessage: '测试查询'
      })
      
      const sendButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('发送')
      )
      await sendButton.trigger('click')
      
      await nextTick()
      
      expect(aiAssistantOptimizedApi.query).toHaveBeenCalledWith({
        query: '测试查询',
        conversationId: wrapper.vm.conversationId,
        userId: 1
      })
    })

    it('应该处理AI响应', async () => {
      await wrapper.setData({
        inputMessage: '测试查询'
      })
      
      const sendButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('发送')
      )
      await sendButton.trigger('click')
      
      await nextTick()
      
      expect(wrapper.vm.messages).toHaveLength(3)
      expect(wrapper.vm.messages[2].role).toBe('assistant')
      expect(wrapper.vm.messages[2].content).toBe('这是一个测试回复')
      expect(wrapper.vm.messages[2].optimizationInfo).toEqual({
        level: 'direct',
        tokensUsed: 100,
        tokensSaved: 200,
        processingTime: 500,
        savingRate: 66.7
      })
    })

    it('应该处理API错误', async () => {
      vi.mocked(aiAssistantOptimizedApi.query).mockRejectedValue(new Error('API错误'))
      
      await wrapper.setData({
        inputMessage: '测试查询'
      })
      
      const sendButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('发送')
      )
      await sendButton.trigger('click')
      
      await nextTick()
      
      expect(wrapper.vm.messages).toHaveLength(3)
      expect(wrapper.vm.messages[2].role).toBe('assistant')
      expect(wrapper.vm.messages[2].content).toBe('抱歉，我遇到了一些问题，请稍后再试。')
      expect(ElMessage.error).toHaveBeenCalledWith('AI查询失败: API错误')
    })

    it('应该禁用发送按钮当输入为空时', () => {
      const sendButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('发送')
      )
      expect(sendButton.attributes('disabled')).toBeDefined()
    })

    it('应该在加载时禁用发送按钮', async () => {
      await wrapper.setData({
        inputMessage: '测试消息',
        isLoading: true
      })
      
      const sendButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('发送')
      )
      expect(sendButton.attributes('disabled')).toBeDefined()
    })

    it('应该支持Ctrl+Enter发送', async () => {
      await wrapper.setData({
        inputMessage: '测试消息'
      })
      
      const input = wrapper.find('el-input-stub')
      await input.vm.$emit('keydown.ctrl.enter')
      
      expect(wrapper.vm.inputMessage).toBe('')
      expect(wrapper.vm.isLoading).toBe(true)
    })
  })

  describe('快速查询', () => {
    it('应该插入快速查询文本', async () => {
      const quickButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('学生总数')
      )
      await quickButton.trigger('click')
      
      expect(wrapper.vm.inputMessage).toBe('学生总数')
    })

    it('应该提供多个快速查询选项', () => {
      const quickButtons = wrapper.findAll('.quick-actions button')
      expect(quickButtons.length).toBe(3)
      expect(wrapper.text()).toContain('学生总数')
      expect(wrapper.text()).toContain('教师总数')
      expect(wrapper.text()).toContain('今日活动')
    })
  })

  describe('统计更新', () => {
    it('应该更新统计数据', async () => {
      await wrapper.setData({
        inputMessage: '测试查询'
      })
      
      const sendButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('发送')
      )
      await sendButton.trigger('click')
      
      await nextTick()
      
      expect(wrapper.vm.stats.totalQueries).toBe(1)
      expect(wrapper.vm.stats.directQueries).toBe(1)
      expect(wrapper.vm.stats.averageTokensSaved).toBe(200)
      expect(wrapper.vm.stats.averageResponseTime).toBe(500)
    })

    it('应该计算正确的百分比', async () => {
      await wrapper.setData({
        inputMessage: '测试查询'
      })
      
      const sendButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('发送')
      )
      await sendButton.trigger('click')
      
      await nextTick()
      
      expect(wrapper.vm.stats.tokenSavingRate).toBe(7) // Math.round((200 / 3000) * 100)
      expect(wrapper.vm.stats.directQueryRate).toBe(100) // Math.round((1 / 1) * 100)
    })

    it('应该处理不同级别的查询', async () => {
      vi.mocked(aiAssistantOptimizedApi.query).mockResolvedValue({
        success: true,
        data: {
          ...mockApiResponse.data,
          level: 'semantic'
        }
      })
      
      await wrapper.setData({
        inputMessage: '语义查询'
      })
      
      const sendButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('发送')
      )
      await sendButton.trigger('click')
      
      await nextTick()
      
      expect(wrapper.vm.stats.semanticQueries).toBe(1)
      expect(wrapper.vm.stats.directQueries).toBe(0)
    })
  })

  describe('用户界面交互', () => {
    it('应该清空聊天记录', async () => {
      await wrapper.setData({
        inputMessage: '测试消息'
      })
      
      const sendButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('发送')
      )
      await sendButton.trigger('click')
      
      await nextTick()
      
      const clearButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('清空')
      )
      await clearButton.trigger('click')
      
      expect(wrapper.vm.messages).toHaveLength(1) // 只保留欢迎消息
      expect(wrapper.vm.conversationId).not.toBe(wrapper.vm.conversationId)
    })

    it('应该显示性能监控弹窗', async () => {
      const performanceButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('性能监控')
      )
      await performanceButton.trigger('click')
      
      expect(wrapper.vm.showPerformanceMonitor).toBe(true)
    })

    it('应该显示配置管理弹窗', async () => {
      const configButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('配置管理')
      )
      await configButton.trigger('click')
      
      expect(wrapper.vm.showConfigPanel).toBe(true)
    })

    it('应该关闭性能监控弹窗', async () => {
      await wrapper.setData({
        showPerformanceMonitor: true
      })
      
      await wrapper.vm.handleClosePerformanceMonitor()
      
      expect(wrapper.vm.showPerformanceMonitor).toBe(false)
    })

    it('应该关闭配置管理弹窗', async () => {
      await wrapper.setData({
        showConfigPanel: true
      })
      
      await wrapper.vm.handleCloseConfigPanel()
      
      expect(wrapper.vm.showConfigPanel).toBe(false)
    })
  })

  describe('格式化函数', () => {
    it('应该正确格式化时间', () => {
      const date = new Date('2024-01-15T10:30:00')
      expect(wrapper.vm.formatTime(date)).toMatch(/10:30/)
    })

    it('应该正确格式化消息内容', () => {
      const content = '第一行\n第二行\n第三行'
      expect(wrapper.vm.formatMessage(content)).toBe('第一行<br>第二行<br>第三行')
    })

    it('应该获取正确的状态标签类型', () => {
      expect(wrapper.vm.getStatusTagType()).toBe('success')
      wrapper.vm.isLoading = true
      expect(wrapper.vm.getStatusTagType()).toBe('warning')
    })

    it('应该获取正确的状态文本', () => {
      expect(wrapper.vm.getStatusText()).toBe('就绪')
      wrapper.vm.isLoading = true
      expect(wrapper.vm.getStatusText()).toBe('处理中')
    })

    it('应该获取正确的优化标签类型', () => {
      expect(wrapper.vm.getOptimizationTagType('direct')).toBe('success')
      expect(wrapper.vm.getOptimizationTagType('semantic')).toBe('primary')
      expect(wrapper.vm.getOptimizationTagType('complex')).toBe('warning')
      expect(wrapper.vm.getOptimizationTagType('unknown')).toBe('info')
    })

    it('应该获取正确的优化级别文本', () => {
      expect(wrapper.vm.getOptimizationLevelText('direct')).toBe('直接匹配')
      expect(wrapper.vm.getOptimizationLevelText('semantic')).toBe('语义检索')
      expect(wrapper.vm.getOptimizationLevelText('complex')).toBe('复杂分析')
      expect(wrapper.vm.getOptimizationLevelText('unknown')).toBe('unknown')
    })

    it('应该计算正确的级别百分比', () => {
      wrapper.vm.stats.totalQueries = 10
      wrapper.vm.stats.directQueries = 3
      wrapper.vm.stats.semanticQueries = 5
      wrapper.vm.stats.complexQueries = 2
      
      expect(wrapper.vm.getLevelPercentage('direct')).toBe(30)
      expect(wrapper.vm.getLevelPercentage('semantic')).toBe(50)
      expect(wrapper.vm.getLevelPercentage('complex')).toBe(20)
    })

    it('应该处理零除数', () => {
      wrapper.vm.stats.totalQueries = 0
      expect(wrapper.vm.getLevelPercentage('direct')).toBe(0)
    })

    it('应该获取正确的进度条颜色', () => {
      expect(wrapper.vm.getProgressColor(90)).toBe('#67c23a')
      expect(wrapper.vm.getProgressColor(70)).toBe('#e6a23c')
      expect(wrapper.vm.getProgressColor(50)).toBe('#f56c6c')
    })
  })

  describe('滚动行为', () => {
    it('应该滚动到底部', async () => {
      await wrapper.setData({
        inputMessage: '测试消息'
      })
      
      const sendButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('发送')
      )
      await sendButton.trigger('click')
      
      await nextTick()
      
      expect(mockScrollTo).toHaveBeenCalledWith({
        top: expect.any(Number),
        behavior: 'smooth'
      })
    })
  })

  describe('用户头像', () => {
    it('应该显示用户头像', () => {
      const userAvatar = wrapper.vm.userAvatar
      expect(userAvatar).toBe('test-avatar.jpg')
    })

    it('应该处理空头像', () => {
      vi.mocked(useUserStore).mockReturnValue({
        userInfo: {
          id: 1,
          name: 'Test User',
          avatar: ''
        }
      })
      
      const noAvatarWrapper = mount(OptimizedAssistant, {
        global: {
          stubs: {
            'el-icon': true,
            'el-row': true,
            'el-col': true,
            'el-button': true,
            'el-card': true,
            'el-input': true,
            'el-tag': true,
            'el-avatar': true,
            'el-collapse': true,
            'el-collapse-item': true,
            'el-progress': true,
            'el-dialog': true,
            'el-switch': true,
            PerformanceMonitor: true,
            ConfigPanel: true
          },
          directives: {
            permission: {
              beforeMount: vi.fn()
            }
          }
        }
      })
      
      expect(noAvatarWrapper.vm.userAvatar).toBe('')
      noAvatarWrapper.unmount()
    })
  })

  describe('错误处理', () => {
    it('应该处理网络错误', async () => {
      vi.mocked(aiAssistantOptimizedApi.query).mockRejectedValue(new Error('网络错误'))
      
      await wrapper.setData({
        inputMessage: '测试查询'
      })
      
      const sendButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('发送')
      )
      await sendButton.trigger('click')
      
      await nextTick()
      
      expect(ElMessage.error).toHaveBeenCalledWith('AI查询失败: 网络错误')
    })

    it('应该处理API响应格式错误', async () => {
      vi.mocked(aiAssistantOptimizedApi.query).mockResolvedValue({
        success: false,
        message: '响应格式错误'
      })
      
      await wrapper.setData({
        inputMessage: '测试查询'
      })
      
      const sendButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('发送')
      )
      await sendButton.trigger('click')
      
      await nextTick()
      
      expect(ElMessage.error).toHaveBeenCalledWith('AI查询失败: 响应格式错误')
    })

    it('应该处理空响应数据', async () => {
      vi.mocked(aiAssistantOptimizedApi.query).mockResolvedValue({
        success: true,
        data: null
      })
      
      await wrapper.setData({
        inputMessage: '测试查询'
      })
      
      const sendButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('发送')
      )
      await sendButton.trigger('click')
      
      await nextTick()
      
      expect(ElMessage.error).toHaveBeenCalledWith('AI查询失败: undefined')
    })
  })

  describe('边界条件', () => {
    it('应该处理长消息', async () => {
      const longMessage = 'a'.repeat(1000)
      await wrapper.setData({
        inputMessage: longMessage
      })
      
      const sendButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('发送')
      )
      await sendButton.trigger('click')
      
      expect(wrapper.vm.messages[0].content).toBe(longMessage)
    })

    it('应该处理特殊字符消息', async () => {
      const specialMessage = '测试消息\n包含\t特殊字符"'
      await wrapper.setData({
        inputMessage: specialMessage
      })
      
      const sendButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('发送')
      )
      await sendButton.trigger('click')
      
      expect(wrapper.vm.messages[0].content).toBe(specialMessage)
    })

    it('应该处理空优化信息', async () => {
      vi.mocked(aiAssistantOptimizedApi.query).mockResolvedValue({
        success: true,
        data: {
          response: '测试回复',
          level: 'direct',
          tokensUsed: 100,
          tokensSaved: 200,
          processingTime: 500,
          savingRate: 66.7
        }
      })
      
      await wrapper.setData({
        inputMessage: '测试查询'
      })
      
      const sendButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('发送')
      )
      await sendButton.trigger('click')
      
      await nextTick()
      
      expect(wrapper.vm.messages[2].optimizationInfo).toBeDefined()
    })
  })

  describe('响应式设计', () => {
    it('应该在小屏幕下正确显示', () => {
      // 模拟小屏幕
      window.innerWidth = 768
      window.dispatchEvent(new Event('resize'))
      
      expect(wrapper.exists()).toBe(true)
      // 检查响应式样式类
      expect(wrapper.html()).toContain('@media')
    })
  })
})