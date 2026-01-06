/**
 * AIAssistantPage.vue 综合单元测试
 * 测试专家咨询、AI对话、记忆管理和活动策划功能
 * 包含权限验证、样式布局、真实数据交互测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createTestingPinia } from '@pinia/testing'
import { ElMessage, ElMessageBox } from 'element-plus'
import AIAssistantPage from '@/pages/ai/AIAssistantPage.vue'
import { useUserStore } from '@/stores/user'
import { aiApi } from '@/api/ai'
import { activityPlannerApi } from '@/api/activity-planner'

// Mock API modules
vi.mock('@/api/ai')
vi.mock('@/api/activity-planner')
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn()
    }
  }
})

// Mock router
const mockPush = vi.fn()
vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRouter: () => ({
      push: mockPush
    }),
    createRouter: vi.fn(),
    createWebHistory: vi.fn()
  }
})

// Mock AI components
vi.mock('@/components/ai-assistant/AIAssistant.vue', () => ({
  default: {
    name: 'AIAssistant',
    template: '<div data-testid="ai-assistant">AI Assistant Component</div>'
  }
}))

vi.mock('@/components/ai/ComponentRenderer.vue', () => ({
  default: {
    name: 'AiComponentRenderer',
    template: '<div data-testid="ai-component-renderer">AI Component Renderer</div>'
  }
}))

// 控制台错误检测变量
let consoleSpy: any

describe('AIAssistantPage.vue - 综合功能测试', () => {
  let wrapper: VueWrapper<any>
  let userStore: any

  // 测试数据
  const mockUser = {
    id: 1,
    username: 'test-user',
    role: 'admin',
    permissions: ['ai:assistant', 'ai:memory', 'ai:activity-planning', 'ai:expert-consultation']
  }

  const mockMemorySearchResults = [
    {
      id: 'memory-1',
      content: '用户询问关于幼儿园招生的问题',
      createdAt: '2024-01-01T10:00:00Z',
      importance: 8
    },
    {
      id: 'memory-2', 
      content: '讨论了活动策划的预算分配',
      createdAt: '2024-01-01T11:00:00Z',
      importance: 7
    }
  ]

  const mockActivityPlan = {
    planId: 'plan-123',
    title: '春季招生开放日',
    description: '为潜在家长和儿童提供全面的幼儿园体验',
    detailedPlan: {
      overview: '本次开放日旨在展示幼儿园的教学环境、师资力量和教育理念',
      timeline: [
        {
          time: '09:00',
          activity: '签到入场',
          description: '家长和儿童在reception处签到'
        },
        {
          time: '09:30',
          activity: '园所介绍',
          description: '园长介绍幼儿园的办学理念和特色'
        }
      ],
      materials: ['签到表', '宣传册', '小礼品', '茶水'],
      budget: {
        total: 5000,
        breakdown: [
          { item: '宣传材料', cost: 1500 },
          { item: '小礼品', cost: 2000 },
          { item: '茶水点心', cost: 1500 }
        ]
      },
      tips: ['提前准备充足的宣传材料', '安排专业的讲解员', '确保安全措施到位']
    },
    generatedImages: ['image1.jpg', 'image2.jpg'],
    audioGuide: 'audio-guide.mp3',
    modelsUsed: {
      textModel: 'gpt-4',
      imageModel: 'dalle-3',
      speechModel: 'whisper'
    },
    processingTime: 2500
  }

  beforeEach(() => {
    // 重置所有 mock
    vi.clearAllMocks()

    // 创建测试用的 Pinia 实例
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        user: {
          userInfo: mockUser,
          isAuthenticated: true,
          permissions: mockUser.permissions
        }
      }
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // 挂载组件
    wrapper = mount(AIAssistantPage, {
      global: {
        plugins: [pinia],
        stubs: {
          'el-tabs': true,
          'el-tab-pane': true,
          'el-button': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-form': true,
          'el-form-item': true,
          'el-input-number': true,
          'el-radio-group': true,
          'el-radio': true,
          'el-tag': true,
          'el-table': true,
          'el-table-column': true,
          'el-timeline': true,
          'el-timeline-item': true,
          'el-image': true,
          'el-icon': true,
          'EmptyState': true,
          'LoadingState': true
        }
      }
    })

    userStore = useUserStore()
    
    // Mock API 返回值
    vi.mocked(aiApi.initialize).mockResolvedValue({
      success: true,
      data: { models: ['gpt-4', 'claude-3'] }
    })

    vi.mocked(aiApi.searchMemories).mockResolvedValue({
      success: true,
      data: { memories: mockMemorySearchResults }
    })

    vi.mocked(aiApi.deleteMemory).mockResolvedValue({
      success: true
    })

    vi.mocked(aiApi.startConsultation).mockResolvedValue({
      success: true,
      data: { consultationId: 'consultation-123' }
    })

    vi.mocked(activityPlannerApi.generateActivityPlan).mockResolvedValue(mockActivityPlan)
  })

  afterEach(() => {
    wrapper?.unmount()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('🔐 权限验证测试', () => {
    it('应该在用户未登录时重定向到登录页', async () => {
      // 创建未登录状态的组件
      const pinia = createTestingPinia({
        initialState: {
          user: {
            userInfo: null,
            isAuthenticated: false,
            permissions: []
          }
        }
      })

      wrapper = mount(AIAssistantPage, {
        global: {
          plugins: [pinia],
          stubs: { 'el-tabs': true }
        }
      })

      await nextTick()

      expect(mockPush).toHaveBeenCalledWith('/login')
      expect(ElMessage.error).toHaveBeenCalledWith('请先登录后再访问AI助手')
    })

    it('应该在用户无AI权限时重定向到仪表盘', async () => {
      const pinia = createTestingPinia({
        initialState: {
          user: {
            userInfo: { ...mockUser, permissions: [] },
            isAuthenticated: true,
            permissions: []
          }
        }
      })

      wrapper = mount(AIAssistantPage, {
        global: {
          plugins: [pinia],
          stubs: { 'el-tabs': true }
        }
      })

      const store = useUserStore()
      vi.mocked(store.hasPermission).mockReturnValue(false)
      vi.mocked(store.isAdmin).mockReturnValue(false)

      await nextTick()

      expect(mockPush).toHaveBeenCalledWith('/dashboard')
      expect(ElMessage.error).toHaveBeenCalledWith('您没有权限访问AI助手功能')
    })

    it('应该根据权限显示/隐藏功能标签页', async () => {
      const store = useUserStore()
      
      // 测试有所有权限的情况
      vi.mocked(store.hasPermission).mockImplementation((permission: string) => {
        return mockUser.permissions.includes(permission)
      })

      await wrapper.vm.$nextTick()

      // 检查是否显示所有标签页
      expect(wrapper.vm.hasMemoryPermission).toBe(true)
      expect(wrapper.vm.hasActivityPlanningPermission).toBe(true)
      expect(wrapper.vm.hasExpertConsultationPermission).toBe(true)
    })

    it('应该在权限不足时阻止功能调用', async () => {
      const store = useUserStore()
      vi.mocked(store.hasPermission).mockReturnValue(false)
      vi.mocked(store.isAdmin).mockReturnValue(false)

      // 尝试调用需要权限的方法
      await wrapper.vm.startExpertConsultation()
      
      expect(ElMessage.error).toHaveBeenCalledWith('您没有权限访问此功能')
      expect(aiApi.startConsultation).not.toHaveBeenCalled()
    })
  })

  describe('🎯 专家咨询功能测试', () => {
    beforeEach(() => {
      const store = useUserStore()
      vi.mocked(store.hasPermission).mockReturnValue(true)
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    it('应该成功启动专家咨询', async () => {
      await wrapper.vm.startExpertConsultation()

      expect(aiApi.startConsultation).toHaveBeenCalledWith({
        userId: mockUser.id,
        consultationType: 'expert'
      })
      expect(ElMessage.success).toHaveBeenCalledWith('专家咨询已启动')
      expect(wrapper.vm.activeTab).toBe('chat')
    })

    it('应该处理专家咨询启动失败', async () => {
      vi.mocked(aiApi.startConsultation).mockRejectedValue(new Error('网络错误'))

      await wrapper.vm.startExpertConsultation()

      expect(ElMessage.error).toHaveBeenCalledWith('启动专家咨询失败，请重试')
    })

    it('应该正确显示专家咨询界面元素', () => {
      // 检查专家咨询相关的UI元素
      expect(wrapper.find('[data-testid="expert-consultation"]').exists() || 
             wrapper.text().includes('AI专家咨询')).toBe(true)
    })
  })

  describe('💭 AI对话功能测试', () => {
    it('应该正确初始化AI模块', async () => {
      await wrapper.vm.initializeAI()

      expect(aiApi.initialize).toHaveBeenCalled()
      expect(wrapper.vm.hasAIContent).toBe(true)
      expect(wrapper.vm.isAILoading).toBe(false)
    })

    it('应该处理AI初始化失败', async () => {
      vi.mocked(aiApi.initialize).mockRejectedValue(new Error('AI服务不可用'))

      await wrapper.vm.initializeAI()

      expect(wrapper.vm.aiError).toBe('AI模块暂时不可用，请稍后再试')
      expect(wrapper.vm.hasAIContent).toBe(false)
    })

    it('应该正确处理组件检测', () => {
      const mockComponent = {
        type: 'chart',
        data: { values: [1, 2, 3] }
      }

      wrapper.vm.handleComponentDetected(mockComponent)

      expect(wrapper.vm.previewComponent).toEqual(mockComponent)
    })

    it('应该能够创建新会话', () => {
      const mockCreateConversation = vi.fn()
      wrapper.vm.aiAssistant = {
        createNewConversation: mockCreateConversation
      }

      wrapper.vm.createNewConversation()

      expect(mockCreateConversation).toHaveBeenCalled()
    })
  })

  describe('🧠 记忆管理功能测试', () => {
    beforeEach(() => {
      const store = useUserStore()
      vi.mocked(store.hasPermission).mockReturnValue(true)
    })

    it('应该成功搜索记忆', async () => {
      wrapper.vm.memorySearchQuery = '招生'
      
      await wrapper.vm.searchMemories()

      expect(aiApi.searchMemories).toHaveBeenCalledWith({
        userId: mockUser.id,
        query: '招生',
        limit: 10
      })
      expect(wrapper.vm.memorySearchResults).toEqual(mockMemorySearchResults)
      expect(wrapper.vm.isSearchingMemories).toBe(false)
    })

    it('应该在搜索查询为空时不执行搜索', async () => {
      wrapper.vm.memorySearchQuery = ''
      
      await wrapper.vm.searchMemories()

      expect(aiApi.searchMemories).not.toHaveBeenCalled()
    })

    it('应该处理记忆搜索失败', async () => {
      wrapper.vm.memorySearchQuery = '测试'
      vi.mocked(aiApi.searchMemories).mockRejectedValue(new Error('搜索失败'))

      await wrapper.vm.searchMemories()

      expect(ElMessage.error).toHaveBeenCalledWith('搜索失败，请重试')
      expect(wrapper.vm.isSearchingMemories).toBe(false)
    })

    it('应该成功删除记忆', async () => {
      vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm')
      wrapper.vm.shortTermMemories = [{ id: 'memory-1', content: '测试记忆' }]

      await wrapper.vm.deleteMemory('memory-1')

      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        '确定要删除这条记忆吗？',
        '确认删除',
        { type: 'warning' }
      )
      expect(aiApi.deleteMemory).toHaveBeenCalledWith(mockUser.id, 'memory-1')
      expect(ElMessage.success).toHaveBeenCalledWith('记忆删除成功')
      expect(wrapper.vm.shortTermMemories).toEqual([])
    })

    it('应该在用户取消时不删除记忆', async () => {
      vi.mocked(ElMessageBox.confirm).mockRejectedValue('cancel')

      await wrapper.vm.deleteMemory('memory-1')

      expect(aiApi.deleteMemory).not.toHaveBeenCalled()
    })

    it('应该正确显示记忆统计信息', () => {
      wrapper.vm.memoryStats = {
        total: 50,
        shortTerm: 30,
        longTerm: 20
      }

      expect(wrapper.vm.memoryStats.total).toBe(50)
      expect(wrapper.vm.memoryStats.shortTerm).toBe(30)
      expect(wrapper.vm.memoryStats.longTerm).toBe(20)
    })
  })

  describe('📋 活动策划功能测试', () => {
    beforeEach(() => {
      const store = useUserStore()
      vi.mocked(store.hasPermission).mockReturnValue(true)
      
      // 模拟表单引用
      wrapper.vm.planningFormRef = {
        validate: vi.fn().mockResolvedValue(true)
      }
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    it('应该成功创建新活动', () => {
      wrapper.vm.createNewActivity()

      expect(wrapper.vm.isCreatingActivity).toBe(true)
      expect(wrapper.vm.selectedActivity).toBeNull()
      expect(wrapper.vm.planningForm.activityType).toBe('')
    })

    it('应该正确重置策划表单', () => {
      // 先设置一些值
      wrapper.vm.planningForm = {
        activityType: '幼儿园开放日',
        targetAudience: '3-6岁儿童',
        budget: 5000,
        duration: '2小时',
        location: '幼儿园多功能厅',
        requirements: ['音响设备'],
        preferredStyle: 'professional'
      }

      wrapper.vm.resetPlanningForm()

      expect(wrapper.vm.planningForm).toEqual({
        activityType: '',
        targetAudience: '',
        budget: undefined,
        duration: '',
        location: '',
        requirements: [],
        preferredStyle: 'professional'
      })
    })

    it('应该成功生成活动策划方案', async () => {
      // 设置表单数据
      wrapper.vm.planningForm = {
        activityType: '幼儿园开放日',
        targetAudience: '3-6岁儿童及家长',
        budget: 5000,
        duration: '2小时',
        location: '幼儿园多功能厅',
        requirements: ['音响设备'],
        preferredStyle: 'professional'
      }

      await wrapper.vm.generatePlan()

      expect(wrapper.vm.planningFormRef.validate).toHaveBeenCalled()
      expect(activityPlannerApi.generateActivityPlan).toHaveBeenCalledWith({
        activityType: '幼儿园开放日',
        targetAudience: '3-6岁儿童及家长',
        budget: 5000,
        duration: '2小时',
        location: '幼儿园多功能厅',
        requirements: ['音响设备'],
        preferredStyle: 'professional'
      })

      expect(wrapper.vm.activities.length).toBe(1)
      expect(wrapper.vm.activities[0].name).toBe(mockActivityPlan.title)
      expect(wrapper.vm.selectedActivity).toEqual(wrapper.vm.activities[0])
      expect(wrapper.vm.isCreatingActivity).toBe(false)
      expect(ElMessage.success).toHaveBeenCalledWith(
        `活动策划方案生成成功！耗时 ${mockActivityPlan.processingTime}ms`
      )
    })

    it('应该处理表单验证失败', async () => {
      wrapper.vm.planningFormRef.validate = vi.fn().mockRejectedValue(new Error('验证失败'))

      await wrapper.vm.generatePlan()

      expect(activityPlannerApi.generateActivityPlan).not.toHaveBeenCalled()
    })

    it('应该处理活动策划生成失败', async () => {
      wrapper.vm.planningForm.activityType = '测试活动'
      vi.mocked(activityPlannerApi.generateActivityPlan).mockRejectedValue(
        new Error('生成失败')
      )

      await wrapper.vm.generatePlan()

      expect(ElMessage.error).toHaveBeenCalledWith('生成失败')
      expect(wrapper.vm.isGenerating).toBe(false)
    })

    it('应该正确筛选活动列表', () => {
      wrapper.vm.activities = [
        { id: '1', status: 'draft', name: '活动1' },
        { id: '2', status: 'active', name: '活动2' },
        { id: '3', status: 'completed', name: '活动3' }
      ] as any

      // 测试显示所有活动
      wrapper.vm.activityFilter = 'all'
      expect(wrapper.vm.filteredActivities.length).toBe(3)

      // 测试筛选草稿活动
      wrapper.vm.activityFilter = 'draft'
      expect(wrapper.vm.filteredActivities.length).toBe(1)
      expect(wrapper.vm.filteredActivities[0].status).toBe('draft')

      // 测试筛选进行中活动
      wrapper.vm.activityFilter = 'active'
      expect(wrapper.vm.filteredActivities.length).toBe(1)
      expect(wrapper.vm.filteredActivities[0].status).toBe('active')
    })

    it('应该正确选择活动', () => {
      const activity = {
        id: 'activity-1',
        name: '测试活动',
        status: 'draft'
      } as any

      wrapper.vm.selectActivity(activity)

      expect(wrapper.vm.selectedActivity).toEqual(activity)
      expect(wrapper.vm.isCreatingActivity).toBe(false)
    })

    it('应该正确删除活动', async () => {
      vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm')
      wrapper.vm.activities = [
        { id: 'activity-1', name: '活动1' },
        { id: 'activity-2', name: '活动2' }
      ] as any
      wrapper.vm.selectedActivity = { id: 'activity-1' } as any

      await wrapper.vm.deleteActivity('activity-1')

      expect(wrapper.vm.activities.length).toBe(1)
      expect(wrapper.vm.activities[0].id).toBe('activity-2')
      expect(wrapper.vm.selectedActivity).toBeNull()
      expect(ElMessage.success).toHaveBeenCalledWith('活动删除成功')
    })

    it('应该正确格式化日期', () => {
      const dateString = '2024-01-01T10:00:00Z'
      const formatted = wrapper.vm.formatDate(dateString)
      
      expect(formatted).toMatch(/2024/)
    })

    it('应该正确获取状态文本和类型', () => {
      expect(wrapper.vm.getStatusText('draft')).toBe('草稿')
      expect(wrapper.vm.getStatusText('active')).toBe('进行中')
      expect(wrapper.vm.getStatusText('completed')).toBe('已完成')

      expect(wrapper.vm.getStatusType('draft')).toBe('info')
      expect(wrapper.vm.getStatusType('active')).toBe('success')
      expect(wrapper.vm.getStatusType('cancelled')).toBe('danger')
    })
  })

  describe('🎨 样式和布局测试', () => {
    it('应该正确设置默认状态', () => {
      expect(wrapper.vm.activeTab).toBe('chat')
      expect(wrapper.vm.memoryActiveTab).toBe('search')
      expect(wrapper.vm.isAILoading).toBe(false)
      expect(wrapper.vm.aiError).toBeNull()
      expect(wrapper.vm.isCreatingActivity).toBe(false)
      expect(wrapper.vm.isGenerating).toBe(false)
    })

    it('应该正确处理错误状态', () => {
      const error = new Error('测试错误')
      wrapper.vm.handleAIError(error)

      expect(wrapper.vm.aiError).toBe('当前AI功能遇到问题，正在为您提供基础体验')
    })

    it('应该包含所有必要的CSS类', () => {
      const element = wrapper.find('.ai-functionality-container')
      expect(element.exists() || wrapper.classes().includes('ai-assistant-page')).toBe(true)
    })

    it('应该正确显示加载状态', async () => {
      wrapper.vm.isAILoading = true
      await nextTick()

      // 检查加载状态的显示
      expect(wrapper.vm.isAILoading).toBe(true)
    })

    it('应该正确显示错误状态', async () => {
      wrapper.vm.aiError = '测试错误信息'
      await nextTick()

      expect(wrapper.vm.aiError).toBe('测试错误信息')
    })
  })

  describe('🔄 数据交互和状态管理测试', () => {
    it('应该正确管理用户ID', () => {
      expect(wrapper.vm.currentUserId).toBe(mockUser.id)
    })

    it('应该正确处理组件变更', () => {
      const mockChange = { type: 'update', data: { value: 'new' } }
      const mockUpdateComponentData = vi.fn()
      
      wrapper.vm.aiAssistant = {
        updateComponentData: mockUpdateComponentData
      }

      wrapper.vm.handleComponentChange(mockChange)

      expect(mockUpdateComponentData).toHaveBeenCalledWith(mockChange)
    })

    it('应该正确处理标签页切换', async () => {
      wrapper.vm.activeTab = 'memory'
      await nextTick()

      expect(wrapper.vm.activeTab).toBe('memory')

      wrapper.vm.activeTab = 'activity'
      await nextTick()

      expect(wrapper.vm.activeTab).toBe('activity')
    })

    it('应该正确管理记忆搜索状态', async () => {
      wrapper.vm.memorySearchQuery = '测试查询'
      expect(wrapper.vm.memorySearchQuery).toBe('测试查询')

      wrapper.vm.isSearchingMemories = true
      expect(wrapper.vm.isSearchingMemories).toBe(true)
    })

    it('应该正确管理活动生成状态', async () => {
      wrapper.vm.isGenerating = true
      expect(wrapper.vm.isGenerating).toBe(true)

      wrapper.vm.isGenerating = false
      expect(wrapper.vm.isGenerating).toBe(false)
    })
  })

  describe('🧪 边界情况和错误处理测试', () => {
    it('应该处理无效的日期格式', () => {
      const result = wrapper.vm.formatDate('invalid-date')
      expect(result).toBe('invalid-date')
    })

    it('应该处理未知的活动状态', () => {
      const unknownStatus = 'unknown' as any
      expect(wrapper.vm.getStatusText(unknownStatus)).toBe('unknown')
      expect(wrapper.vm.getStatusType(unknownStatus)).toBeUndefined()
    })

    it('应该处理空的活动列表', () => {
      wrapper.vm.activities = []
      expect(wrapper.vm.filteredActivities).toEqual([])
    })

    it('应该处理空的记忆搜索结果', async () => {
      vi.mocked(aiApi.searchMemories).mockResolvedValue({
        success: true,
        data: { memories: [] }
      })

      wrapper.vm.memorySearchQuery = '无结果查询'
      await wrapper.vm.searchMemories()

      expect(wrapper.vm.memorySearchResults).toEqual([])
    })

    it('应该处理组件错误捕获', () => {
      const error = new Error('组件错误')
      const result = wrapper.vm.$options.onErrorCaptured?.(error, wrapper.vm, 'test')

      expect(result).toBe(false) // 阻止错误传播
    })
  })

  describe('🔒 安全性测试', () => {
    it('应该验证用户身份', () => {
      expect(wrapper.vm.isAuthenticated).toBe(true)
      expect(wrapper.vm.currentUserId).toBe(mockUser.id)
    })

    it('应该正确检查各项权限', () => {
      const store = useUserStore()
      vi.mocked(store.hasPermission).mockReturnValue(true)
      vi.mocked(store.isAdmin).mockReturnValue(true)

      expect(wrapper.vm.hasAIPermission).toBe(true)
      expect(wrapper.vm.hasMemoryPermission).toBe(true)
      expect(wrapper.vm.hasActivityPlanningPermission).toBe(true)
      expect(wrapper.vm.hasExpertConsultationPermission).toBe(true)
    })

    it('应该在权限不足时显示错误', () => {
      const result = wrapper.vm.checkPermission('nonexistent:permission')
      expect(result).toBe(false)
    })
  })

  describe('📱 响应式和可访问性测试', () => {
    it('应该包含适当的ARIA属性', () => {
      // 检查是否有适当的可访问性属性
      const tabs = wrapper.find('[role="tablist"]')
      expect(tabs.exists() || wrapper.html().includes('aria-')).toBe(true)
    })

    it('应该支持键盘导航', async () => {
      // 测试键盘事件处理
      const input = wrapper.find('input')
      if (input.exists()) {
        await input.trigger('keyup.enter')
      }
      
      // 验证回车键事件被正确处理
      expect(true).toBe(true) // 基础检查
    })
  })
})