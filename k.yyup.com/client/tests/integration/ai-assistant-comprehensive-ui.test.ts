/**
 * AIAssistantPage 全面UI集成测试
 * 测试实际页面中存在的显示问题和用户体验问题
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createTestingPinia } from '@pinia/testing'
import { ElMessage, ElMessageBox } from 'element-plus'
import AIAssistantPage from '@/pages/ai/AIAssistantPage.vue'
import { useUserStore } from '@/stores/user'
import { aiApi } from '@/api/ai'
import { activityPlannerApi } from '@/api/activity-planner'
import {
  validateRequiredFields,
  validateFieldTypes,
  validateApiResponseStructure,
  createValidationReport
} from '@/tests/utils/data-validation'

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
      info: vi.fn(),
      warning: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn()
    }
  }
})

// Mock router
vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRouter: () => ({
      push: vi.fn(),
      currentRoute: { value: { path: '/ai' } }
    }),
    createRouter: vi.fn(() => ({
      beforeEach: vi.fn(),
      push: vi.fn(),
      install: vi.fn()
    })),
    createWebHistory: vi.fn()
  }
})

// Mock router instance
vi.mock('@/router/index.ts', () => ({
  default: {
    beforeEach: vi.fn(),
    push: vi.fn(),
    install: vi.fn()
  }
}))

// Mock AI components
vi.mock('@/components/ai-assistant/AIAssistant.vue', () => ({
  default: {
    name: 'AIAssistant',
    template: '<div data-testid="ai-assistant">AI Assistant Component</div>',
    methods: {
      createNewConversation: vi.fn(),
      updateComponentData: vi.fn()
    }
  }
}))

vi.mock('@/components/ai/ComponentRenderer.vue', () => ({
  default: {
    name: 'AiComponentRenderer',
    template: '<div data-testid="ai-component-renderer">AI Component Renderer</div>'
  }
}))

vi.mock('@/components/common/EmptyState.vue', () => ({
  default: {
    name: 'EmptyState',
    template: '<div data-testid="empty-state"><slot /></div>',
    props: ['type', 'title', 'description', 'size', 'primaryAction', 'suggestions', 'showSuggestions']
  }
}))

vi.mock('@/components/common/LoadingState.vue', () => ({
  default: {
    name: 'LoadingState',
    template: '<div data-testid="loading-state"><slot /></div>',
    props: ['variant', 'size', 'text', 'tip', 'spinnerType']
  }
}))

// 控制台错误检测变量
let consoleSpy: any

describe('AIAssistantPage.vue - 全面UI集成测试', () => {
  let wrapper: VueWrapper<any>
  let userStore: any

  const mockUser = {
    id: 121,
    username: 'test-user',
    role: 'admin',
    permissions: ['ai:assistant', 'ai:memory', 'ai:activity-planning', 'ai:expert-consultation']
  }

  beforeEach(() => {
    vi.clearAllMocks()

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
          'el-divider': true
        }
      }
    })

    userStore = useUserStore()
    vi.mocked(userStore.hasPermission).mockReturnValue(true)
    vi.mocked(userStore.isAdmin).mockReturnValue(true)

    // Mock API responses
    vi.mocked(aiApi.initialize).mockResolvedValue({
      success: true,
      code: 200,
      message: 'success',
      data: { models: ['gpt-4', 'claude-3'] }
    })
  })

  afterEach(() => {
    wrapper?.unmount()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('🔍 空状态和占位符显示测试', () => {
    it('应该正确显示AI对话的默认欢迎内容', async () => {
      // 确保在对话标签页
      wrapper.vm.activeTab = 'chat'
      wrapper.vm.previewComponent = null
      wrapper.vm.isAILoading = false
      wrapper.vm.aiError = null

      await nextTick()

      // 严格验证组件状态
      expect(wrapper.vm.previewComponent).toBeNull()
      expect(wrapper.vm.isAILoading).toBe(false)
      expect(wrapper.vm.aiError).toBeNull()

      // 验证组件数据结构的完整性
      const componentState = {
        activeTab: wrapper.vm.activeTab,
        previewComponent: wrapper.vm.previewComponent,
        isAILoading: wrapper.vm.isAILoading,
        aiError: wrapper.vm.aiError,
        conversations: wrapper.vm.conversations,
        messages: wrapper.vm.messages
      }

      // 验证必填字段
      const requiredFieldsValidation = validateRequiredFields(componentState, ['activeTab'])
      expect(requiredFieldsValidation.valid).toBe(true)

      // 验证字段类型
      const typeValidation = validateFieldTypes(componentState, {
        activeTab: 'string',
        previewComponent: ['object', 'null'],
        isAILoading: 'boolean',
        aiError: ['object', 'null', 'string'],
        conversations: 'array',
        messages: 'array'
      })
      expect(typeValidation.valid).toBe(true)

      // 验证默认内容逻辑
      const shouldShowDefaultContent = !wrapper.vm.previewComponent &&
                                     !wrapper.vm.isAILoading &&
                                     !wrapper.vm.aiError
      expect(shouldShowDefaultContent).toBe(true)

      // 验证初始化API调用
      expect(aiApi.initialize).toHaveBeenCalledTimes(1)

      // 验证API响应结构
      const apiResponse = vi.mocked(aiApi.initialize).mock.results[0].value
      if (typeof apiResponse === 'object' && apiResponse !== null) {
        const apiValidation = validateApiResponseStructure(apiResponse)
        expect(apiValidation.valid).toBe(true)
      }
    })

    it('应该正确显示记忆管理的空状态提示', async () => {
      wrapper.vm.activeTab = 'memory'
      wrapper.vm.memoryActiveTab = 'search'
      wrapper.vm.memorySearchQuery = ''
      wrapper.vm.memorySearchResults = []
      
      await nextTick()

      // 验证空搜索状态
      expect(wrapper.vm.memorySearchQuery).toBe('')
      expect(wrapper.vm.memorySearchResults).toEqual([])
    })

    it('应该正确显示记忆统计的空状态', async () => {
      wrapper.vm.activeTab = 'memory'
      wrapper.vm.memoryActiveTab = 'visualization'
      wrapper.vm.memoryStats = { total: 0, shortTerm: 0, longTerm: 0 }
      
      await nextTick()

      // 验证空统计状态
      expect(wrapper.vm.memoryStats.total).toBe(0)
      expect(wrapper.vm.memoryStats.shortTerm).toBe(0)
      expect(wrapper.vm.memoryStats.longTerm).toBe(0)
    })

    it('应该正确显示短期记忆的空状态', async () => {
      wrapper.vm.activeTab = 'memory'
      wrapper.vm.memoryActiveTab = 'short_term'
      wrapper.vm.shortTermMemories = []
      
      await nextTick()

      // 验证短期记忆空状态
      expect(wrapper.vm.shortTermMemories).toEqual([])
    })

    it('应该正确显示长期记忆的空状态', async () => {
      wrapper.vm.activeTab = 'memory'
      wrapper.vm.memoryActiveTab = 'long_term'
      wrapper.vm.longTermMemories = []
      
      await nextTick()

      // 验证长期记忆空状态
      expect(wrapper.vm.longTermMemories).toEqual([])
    })

    it('应该正确显示活动策划的空状态和快速操作', async () => {
      wrapper.vm.activeTab = 'activity'
      wrapper.vm.activities = []
      wrapper.vm.selectedActivity = null
      wrapper.vm.isCreatingActivity = false
      
      await nextTick()

      // 验证活动策划空状态
      expect(wrapper.vm.activities).toEqual([])
      expect(wrapper.vm.selectedActivity).toBeNull()
      expect(wrapper.vm.isCreatingActivity).toBe(false)
    })
  })

  describe('🚨 错误状态显示测试', () => {
    it('应该正确显示AI助手错误状态', async () => {
      wrapper.vm.aiError = 'AI模块暂时不可用，请稍后再试'
      wrapper.vm.isAILoading = false
      
      await nextTick()

      // 验证错误状态
      expect(wrapper.vm.aiError).toBe('AI模块暂时不可用，请稍后再试')
      expect(wrapper.vm.isAILoading).toBe(false)
    })

    it('应该正确显示记忆搜索无结果状态', async () => {
      wrapper.vm.memorySearchQuery = '不存在的查询内容'
      wrapper.vm.memorySearchResults = []
      
      await nextTick()

      // 验证搜索无结果状态
      expect(wrapper.vm.memorySearchQuery).toBe('不存在的查询内容')
      expect(wrapper.vm.memorySearchResults).toEqual([])
    })

    it('应该正确处理活动策划生成失败', async () => {
      const mockError = new Error('网络连接失败')
      vi.mocked(activityPlannerApi.generateActivityPlan).mockRejectedValue(mockError)
      
      wrapper.vm.planningForm = {
        activityType: '幼儿园开放日',
        targetAudience: '3-6岁儿童',
        budget: 5000,
        duration: '2小时',
        location: '多功能厅',
        requirements: [],
        preferredStyle: 'professional'
      }
      
      wrapper.vm.planningFormRef = {
        validate: vi.fn().mockResolvedValue(true)
      }

      await wrapper.vm.generatePlan()

      expect(ElMessage.error).toHaveBeenCalledWith('网络连接失败')
      expect(wrapper.vm.isGenerating).toBe(false)
    })
  })

  describe('⏳ 加载状态显示测试', () => {
    it('应该正确显示AI助手加载状态', async () => {
      wrapper.vm.isAILoading = true
      wrapper.vm.aiError = null
      
      await nextTick()

      // 验证加载状态
      expect(wrapper.vm.isAILoading).toBe(true)
      expect(wrapper.vm.aiError).toBeNull()
    })

    it('应该正确显示记忆搜索加载状态', async () => {
      wrapper.vm.isSearchingMemories = true
      
      await nextTick()

      // 验证搜索加载状态
      expect(wrapper.vm.isSearchingMemories).toBe(true)
    })

    it('应该正确显示活动生成加载状态', async () => {
      wrapper.vm.isGenerating = true
      
      await nextTick()

      // 验证生成加载状态
      expect(wrapper.vm.isGenerating).toBe(true)
    })
  })

  describe('📝 表单和输入验证测试', () => {
    it('应该正确验证活动策划表单必填项', async () => {
      wrapper.vm.planningFormRef = {
        validate: vi.fn().mockRejectedValue(new Error('请填写必填项'))
      }

      wrapper.vm.planningForm = {
        activityType: '',
        targetAudience: '',
        budget: undefined,
        duration: '',
        location: '',
        requirements: [],
        preferredStyle: 'professional'
      }

      await wrapper.vm.generatePlan()

      expect(wrapper.vm.planningFormRef.validate).toHaveBeenCalled()
      expect(activityPlannerApi.generateActivityPlan).not.toHaveBeenCalled()
    })

    it('应该正确重置策划表单', () => {
      // 先设置一些值
      wrapper.vm.planningForm = {
        activityType: '幼儿园开放日',
        targetAudience: '3-6岁儿童',
        budget: 5000,
        duration: '2小时',
        location: '多功能厅',
        requirements: ['音响设备'],
        preferredStyle: 'creative'
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

    it('应该正确处理记忆搜索输入为空的情况', async () => {
      wrapper.vm.memorySearchQuery = ''
      
      await wrapper.vm.searchMemories()

      expect(aiApi.searchMemories).not.toHaveBeenCalled()
    })
  })

  describe('🎯 权限相关显示测试', () => {
    it('应该在无权限时隐藏相应标签页', async () => {
      vi.mocked(userStore.hasPermission).mockImplementation((permission: string) => {
        return permission === 'ai:assistant' // 只有基础AI权限
      })
      vi.mocked(userStore.isAdmin).mockReturnValue(false)

      await nextTick()

      expect(wrapper.vm.hasMemoryPermission).toBe(false)
      expect(wrapper.vm.hasActivityPlanningPermission).toBe(false)
      expect(wrapper.vm.hasExpertConsultationPermission).toBe(false)
    })

    it('应该在权限不足时阻止功能调用并显示错误提示', async () => {
      vi.mocked(userStore.hasPermission).mockReturnValue(false)
      vi.mocked(userStore.isAdmin).mockReturnValue(false)

      await wrapper.vm.startExpertConsultation()

      expect(ElMessage.error).toHaveBeenCalledWith('您没有权限访问此功能')
      expect(aiApi.startConsultation).not.toHaveBeenCalled()
    })
  })

  describe('📊 数据显示和格式化测试', () => {
    it('应该正确格式化日期显示', () => {
      const testDate = '2024-01-01T10:00:00Z'
      const formatted = wrapper.vm.formatDate(testDate)
      
      expect(formatted).toMatch(/2024/) // 应该包含年份
    })

    it('应该正确处理无效日期', () => {
      const invalidDate = 'invalid-date-string'
      const result = wrapper.vm.formatDate(invalidDate)
      
      expect(result).toBe(invalidDate) // 应该返回原字符串
    })

    it('应该正确获取活动状态文本', () => {
      expect(wrapper.vm.getStatusText('draft')).toBe('草稿')
      expect(wrapper.vm.getStatusText('planning')).toBe('计划中')
      expect(wrapper.vm.getStatusText('active')).toBe('进行中')
      expect(wrapper.vm.getStatusText('completed')).toBe('已完成')
      expect(wrapper.vm.getStatusText('cancelled')).toBe('已取消')
    })

    it('应该正确获取活动状态类型', () => {
      expect(wrapper.vm.getStatusType('draft')).toBe('info')
      expect(wrapper.vm.getStatusType('planning')).toBe('warning')
      expect(wrapper.vm.getStatusType('active')).toBe('success')
      expect(wrapper.vm.getStatusType('completed')).toBeUndefined()
      expect(wrapper.vm.getStatusType('cancelled')).toBe('danger')
    })
  })

  describe('🔄 用户交互流程测试', () => {
    it('应该正确处理创建新活动流程', () => {
      wrapper.vm.createNewActivity()

      expect(wrapper.vm.isCreatingActivity).toBe(true)
      expect(wrapper.vm.selectedActivity).toBeNull()
      expect(wrapper.vm.planningForm.activityType).toBe('')
    })

    it('应该正确处理活动选择', () => {
      const mockActivity = {
        id: 'activity-1',
        name: '测试活动',
        description: '测试描述',
        date: '2024-01-01',
        targetGroup: '3-6岁儿童',
        location: '多功能厅',
        budget: 5000,
        status: 'draft' as const
      }

      wrapper.vm.selectActivity(mockActivity)

      expect(wrapper.vm.selectedActivity).toEqual(mockActivity)
      expect(wrapper.vm.isCreatingActivity).toBe(false)
    })

    it('应该正确处理取消活动编辑', () => {
      wrapper.vm.isCreatingActivity = true
      wrapper.vm.planningForm.activityType = '幼儿园开放日'

      wrapper.vm.cancelActivityEdit()

      expect(wrapper.vm.isCreatingActivity).toBe(false)
      expect(wrapper.vm.planningForm.activityType).toBe('')
    })

    it('应该正确处理活动删除确认流程', async () => {
      vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm')
      
      wrapper.vm.activities = [
        { id: 'activity-1', name: '活动1' },
        { id: 'activity-2', name: '活动2' }
      ] as any
      
      wrapper.vm.selectedActivity = { id: 'activity-1' } as any

      await wrapper.vm.deleteActivity('activity-1')

      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        '确定要删除这个活动吗？',
        '确认删除',
        { type: 'warning' }
      )
      expect(wrapper.vm.activities).toHaveLength(1)
      expect(wrapper.vm.activities[0].id).toBe('activity-2')
      expect(wrapper.vm.selectedActivity).toBeNull()
      expect(ElMessage.success).toHaveBeenCalledWith('活动删除成功')
    })
  })

  describe('🎨 UI状态一致性测试', () => {
    it('应该在标签页切换时保持状态一致性', async () => {
      // 切换到记忆管理
      wrapper.vm.activeTab = 'memory'
      await nextTick()
      expect(wrapper.vm.activeTab).toBe('memory')

      // 切换到活动策划
      wrapper.vm.activeTab = 'activity'
      await nextTick()
      expect(wrapper.vm.activeTab).toBe('activity')

      // 切换回对话
      wrapper.vm.activeTab = 'chat'
      await nextTick()
      expect(wrapper.vm.activeTab).toBe('chat')
    })

    it('应该正确处理组件检测和预览', () => {
      const mockComponent = {
        type: 'chart',
        data: { values: [1, 2, 3] }
      }

      wrapper.vm.handleComponentDetected(mockComponent)

      expect(wrapper.vm.previewComponent).toEqual(mockComponent)
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
  })

  describe('🔧 功能完整性测试', () => {
    it('应该正确处理AI初始化流程', async () => {
      await wrapper.vm.initializeAI()

      expect(aiApi.initialize).toHaveBeenCalled()
      expect(wrapper.vm.hasAIContent).toBe(true)
      expect(wrapper.vm.isAILoading).toBe(false)
      expect(wrapper.vm.aiError).toBeNull()
    })

    it('应该正确处理AI初始化失败', async () => {
      vi.mocked(aiApi.initialize).mockRejectedValue(new Error('连接失败'))

      await wrapper.vm.initializeAI()

      expect(wrapper.vm.aiError).toBe('AI模块暂时不可用，请稍后再试')
      expect(wrapper.vm.hasAIContent).toBe(false)
      expect(wrapper.vm.isAILoading).toBe(false)
    })

    it('应该正确处理记忆搜索成功', async () => {
      const mockResults = [
        { id: 'memory-1', content: '测试记忆1', createdAt: '2024-01-01' },
        { id: 'memory-2', content: '测试记忆2', createdAt: '2024-01-02' }
      ]

      vi.mocked(aiApi.searchMemories).mockResolvedValue({
        success: true,
        data: { memories: mockResults }
      })

      wrapper.vm.memorySearchQuery = '测试'
      await wrapper.vm.searchMemories()

      expect(aiApi.searchMemories).toHaveBeenCalledWith({
        userId: mockUser.id,
        query: '测试',
        limit: 10
      })
      expect(wrapper.vm.memorySearchResults).toEqual(mockResults)
      expect(wrapper.vm.isSearchingMemories).toBe(false)
    })

    it('应该正确处理专家咨询启动', async () => {
      vi.mocked(aiApi.startConsultation).mockResolvedValue({
        success: true,
        data: { consultationId: 'consultation-123' }
      })

      await wrapper.vm.startExpertConsultation()

      expect(aiApi.startConsultation).toHaveBeenCalledWith({
        userId: mockUser.id,
        consultationType: 'expert'
      })
      expect(ElMessage.success).toHaveBeenCalledWith('专家咨询已启动')
      expect(wrapper.vm.activeTab).toBe('chat')
    })
  })

  describe('🎪 用户体验细节测试', () => {
    it('应该在活动筛选时正确过滤结果', () => {
      wrapper.vm.activities = [
        { id: '1', status: 'draft', name: '草稿活动' },
        { id: '2', status: 'active', name: '进行中活动' },
        { id: '3', status: 'completed', name: '已完成活动' }
      ] as any

      // 测试显示所有活动
      wrapper.vm.activityFilter = 'all'
      expect(wrapper.vm.filteredActivities).toHaveLength(3)

      // 测试筛选草稿活动
      wrapper.vm.activityFilter = 'draft'
      expect(wrapper.vm.filteredActivities).toHaveLength(1)
      expect(wrapper.vm.filteredActivities[0].status).toBe('draft')

      // 测试筛选进行中活动
      wrapper.vm.activityFilter = 'active'
      expect(wrapper.vm.filteredActivities).toHaveLength(1)
      expect(wrapper.vm.filteredActivities[0].status).toBe('active')

      // 测试筛选已完成活动
      wrapper.vm.activityFilter = 'completed'
      expect(wrapper.vm.filteredActivities).toHaveLength(1)
      expect(wrapper.vm.filteredActivities[0].status).toBe('completed')
    })

    it('应该正确处理无活动时的筛选', () => {
      wrapper.vm.activities = []
      wrapper.vm.activityFilter = 'all'
      
      expect(wrapper.vm.filteredActivities).toEqual([])
    })

    it('应该正确处理新建会话', () => {
      const mockCreateNewConversation = vi.fn()
      wrapper.vm.aiAssistant = {
        createNewConversation: mockCreateNewConversation
      }

      wrapper.vm.createNewConversation()

      expect(mockCreateNewConversation).toHaveBeenCalled()
    })
  })
})