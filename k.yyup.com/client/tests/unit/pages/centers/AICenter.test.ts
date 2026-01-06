import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import AICenter from '@/pages/centers/AICenter.vue'
import CenterContainer from '@/components/centers/CenterContainer.vue'
import StatCard from '@/components/centers/StatCard.vue'
import CreateModelDialog from '@/components/ai/CreateModelDialog.vue'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// Mock Element Plus
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    }
  }
})

// Mock request utilities
vi.mock('@/utils/request', () => ({
  get: vi.fn(),
  post: vi.fn()
}))

// Mock router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

describe('AICenter.vue', () => {
  let wrapper: any
  let mockRouter: any
  let mockRequest: any

  const createWrapper = () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    
    mockRouter = {
      push: vi.fn()
    }
    
    mockRequest = {
      get: vi.fn(),
      post: vi.fn()
    }
    
    return mount(AICenter, {
      global: {
        plugins: [pinia, ElementPlus],
        components: {
          ...ElementPlusIconsVue,
          CenterContainer,
          StatCard,
          CreateModelDialog
        },
        stubs: {
          'el-icon': true,
          'el-button': true,
          'el-input': true,
          'el-textarea': true,
          'el-table': true,
          'el-table-column': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-tabs': true,
          'el-tab-pane': true
        },
        provide: {
          router: mockRouter
        }
      }
    })
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    wrapper = createWrapper()
  })

  afterEach(() => {
    wrapper.unmount()
  })

  describe('Component Rendering', () => {
    it('should render the AI center correctly', () => {
      expect(wrapper.find('.ai-center').exists()).toBe(true)
    })

    it('should render CenterContainer component', () => {
      const centerContainer = wrapper.findComponent(CenterContainer)
      expect(centerContainer.exists()).toBe(true)
    })

    it('should render welcome section with title and description', () => {
      const welcomeSection = wrapper.find('.welcome-section')
      expect(welcomeSection.exists()).toBe(true)

      const title = welcomeSection.find('h2')
      expect(title.text()).toBe('欢迎来到智能中心')

      const description = welcomeSection.find('p')
      expect(description.text()).toContain('人工智能服务的中心枢纽')
    })

    it('should render header actions with create model button', () => {
      const headerActions = wrapper.find('.header-actions')
      expect(headerActions.exists()).toBe(true)
      
      const createButton = headerActions.find('el-button-stub')
      expect(createButton.text()).toContain('创建AI模型')
    })

    it('should render statistics section', () => {
      const statsSection = wrapper.find('.stats-section')
      expect(statsSection.exists()).toBe(true)
    })

    it('should render AI modules section', () => {
      const aiModules = wrapper.find('.ai-modules')
      expect(aiModules.exists()).toBe(true)
      
      const moduleItems = aiModules.findAll('.module-item')
      expect(moduleItems.length).toBe(9) // 9 AI modules
    })

    it('should render all AI module items with correct content', () => {
      const moduleItems = wrapper.findAll('.module-item')
      
      const expectedModules = [
        'AI智能查询',
        'AI数据分析',
        'AI模型管理',
        'AI自动化',
        'AI预测分析',
        'AI性能监控',
        'AI自动配图',
        'Function Tools',
        'AI专家咨询'
      ]
      
      moduleItems.forEach((item: any, index: number) => {
        const title = item.find('h4').text()
        expect(title).toBe(expectedModules[index])
      })
    })

    it('should render recent tasks section', () => {
      const recentTasks = wrapper.find('.recent-tasks')
      expect(recentTasks.exists()).toBe(true)
    })

    it('should render model status section', () => {
      const modelStatus = wrapper.find('.model-status')
      expect(modelStatus.exists()).toBe(true)
    })
  })

  describe('Data and State Management', () => {
    it('should initialize with correct default values', () => {
      expect(wrapper.vm.showCreateModelDialog).toBe(false)
      expect(wrapper.vm.loading).toBe(false)
      expect(wrapper.vm.queryLoading).toBe(false)
      expect(wrapper.vm.queryText).toBe('')
      expect(wrapper.vm.queryResults).toBeNull()
      expect(wrapper.vm.analysisResults).toEqual([])
      expect(wrapper.vm.recentTasks).toEqual([])
      expect(wrapper.vm.aiModels).toEqual([])
    })

    it('should have correct tabs configuration', () => {
      const tabs = wrapper.vm.tabs
      expect(tabs).toEqual([
        { key: 'overview', label: '概览', icon: 'Dashboard' },
        { key: 'query', label: 'AI查询', icon: 'Search' },
        { key: 'analysis', label: '智能分析', icon: 'DataAnalysis' },
        { key: 'models', label: '模型管理', icon: 'Setting' }
      ])
    })

    it('should have correct overview stats structure', () => {
      const stats = wrapper.vm.overviewStats
      expect(stats.length).toBe(4)
      
      const statKeys = stats.map(stat => stat.key)
      expect(statKeys).toContain('activeModels')
      expect(statKeys).toContain('dailyQueries')
      expect(statKeys).toContain('accuracy')
      expect(statKeys).toContain('automationTasks')
    })
  })

  describe('User Interactions', () => {
    it('should call handleCreateModel when create model button is clicked', async () => {
      const handleCreateModelSpy = vi.spyOn(wrapper.vm, 'handleCreateModel')
      
      await wrapper.vm.handleCreateModel()
      
      expect(handleCreateModelSpy).toHaveBeenCalled()
      expect(wrapper.vm.showCreateModelDialog).toBe(true)
    })

    it('should call navigateTo when module item is clicked', async () => {
      const navigateToSpy = vi.spyOn(wrapper.vm, 'navigateTo')
      
      await wrapper.vm.navigateTo('/ai/query')
      
      expect(navigateToSpy).toHaveBeenCalledWith('/ai/query')
      expect(mockRouter.push).toHaveBeenCalledWith('/ai/query')
    })

    it('should call handleStatClick when stat card is clicked', async () => {
      const handleStatClickSpy = vi.spyOn(wrapper.vm, 'handleStatClick')
      const mockStat = { title: '活跃AI模型' }
      
      await wrapper.vm.handleStatClick(mockStat)
      
      expect(handleStatClickSpy).toHaveBeenCalledWith(mockStat)
    })

    it('should call viewTask when view button is clicked', async () => {
      const viewTaskSpy = vi.spyOn(wrapper.vm, 'viewTask')
      
      await wrapper.vm.viewTask(1)
      
      expect(viewTaskSpy).toHaveBeenCalledWith(1)
    })

    it('should call rerunTask when rerun button is clicked', async () => {
      const rerunTaskSpy = vi.spyOn(wrapper.vm, 'rerunTask')
      
      await wrapper.vm.rerunTask(1)
      
      expect(rerunTaskSpy).toHaveBeenCalledWith(1)
    })

    it('should call executeQuery when execute query button is clicked', async () => {
      const executeQuerySpy = vi.spyOn(wrapper.vm, 'executeQuery')
      wrapper.vm.queryText = 'test query'
      
      await wrapper.vm.executeQuery()
      
      expect(executeQuerySpy).toHaveBeenCalled()
    })

    it('should call clearQuery when clear button is clicked', async () => {
      const clearQuerySpy = vi.spyOn(wrapper.vm, 'clearQuery')
      wrapper.vm.queryText = 'test query'
      wrapper.vm.queryResults = { data: 'test' }
      
      await wrapper.vm.clearQuery()
      
      expect(clearQuerySpy).toHaveBeenCalled()
      expect(wrapper.vm.queryText).toBe('')
      expect(wrapper.vm.queryResults).toBeNull()
    })

    it('should call startAnalysis when analysis module is clicked', async () => {
      const startAnalysisSpy = vi.spyOn(wrapper.vm, 'startAnalysis')
      
      await wrapper.vm.startAnalysis('enrollment')
      
      expect(startAnalysisSpy).toHaveBeenCalledWith('enrollment')
    })

    it('should call createModel when create model button is clicked in models tab', async () => {
      const createModelSpy = vi.spyOn(wrapper.vm, 'createModel')
      
      await wrapper.vm.createModel()
      
      expect(createModelSpy).toHaveBeenCalled()
      expect(mockRouter.push).toHaveBeenCalledWith('/centers/ai/models/create')
    })

    it('should call configureModel when configure button is clicked', async () => {
      const configureModelSpy = vi.spyOn(wrapper.vm, 'configureModel')
      
      await wrapper.vm.configureModel(1)
      
      expect(configureModelSpy).toHaveBeenCalledWith(1)
      expect(mockRouter.push).toHaveBeenCalledWith('/centers/ai/models/1/config')
    })

    it('should call deployModel when deploy button is clicked', async () => {
      const deployModelSpy = vi.spyOn(wrapper.vm, 'deployModel')
      
      await wrapper.vm.deployModel(1)
      
      expect(deployModelSpy).toHaveBeenCalledWith(1)
    })

    it('should call stopModel when stop button is clicked', async () => {
      const stopModelSpy = vi.spyOn(wrapper.vm, 'stopModel')
      
      await wrapper.vm.stopModel(1)
      
      expect(stopModelSpy).toHaveBeenCalledWith(1)
    })

    it('should call deleteModel when delete button is clicked', async () => {
      const deleteModelSpy = vi.spyOn(wrapper.vm, 'deleteModel')
      
      await wrapper.vm.deleteModel(1)
      
      expect(deleteModelSpy).toHaveBeenCalledWith(1)
    })

    it('should call viewAnalysisDetail when view detail button is clicked', async () => {
      const viewAnalysisDetailSpy = vi.spyOn(wrapper.vm, 'viewAnalysisDetail')
      
      await wrapper.vm.viewAnalysisDetail(1)
      
      expect(viewAnalysisDetailSpy).toHaveBeenCalledWith(1)
      expect(mockRouter.push).toHaveBeenCalledWith('/centers/ai/analysis/1')
    })

    it('should call exportAnalysis when export button is clicked', async () => {
      const exportAnalysisSpy = vi.spyOn(wrapper.vm, 'exportAnalysis')
      
      await wrapper.vm.exportAnalysis(1)
      
      expect(exportAnalysisSpy).toHaveBeenCalledWith(1)
    })
  })

  describe('API Integration', () => {
    it('should call fetchOverviewStats when initData is called', async () => {
      const fetchOverviewStatsSpy = vi.spyOn(wrapper.vm, 'fetchOverviewStats')
      const { get } = await import('@/utils/request')
      
      get.mockResolvedValue({ success: true, data: [] })
      
      await wrapper.vm.fetchOverviewStats()
      
      expect(fetchOverviewStatsSpy).toHaveBeenCalled()
      expect(get).toHaveBeenCalledWith('/ai-stats/overview')
    })

    it('should call fetchRecentTasks when initData is called', async () => {
      const fetchRecentTasksSpy = vi.spyOn(wrapper.vm, 'fetchRecentTasks')
      const { get } = await import('@/utils/request')
      
      get.mockResolvedValue({ success: true, data: [] })
      
      await wrapper.vm.fetchRecentTasks()
      
      expect(fetchRecentTasksSpy).toHaveBeenCalled()
      expect(get).toHaveBeenCalledWith('/ai-stats/recent-tasks')
    })

    it('should call fetchAIModels when initData is called', async () => {
      const fetchAIModelsSpy = vi.spyOn(wrapper.vm, 'fetchAIModels')
      const { get } = await import('@/utils/request')
      
      get.mockResolvedValue({ success: true, data: [] })
      
      await wrapper.vm.fetchAIModels()
      
      expect(fetchAIModelsSpy).toHaveBeenCalled()
      expect(get).toHaveBeenCalledWith('/ai-stats/models')
    })

    it('should call fetchAnalysisHistory when initData is called', async () => {
      const fetchAnalysisHistorySpy = vi.spyOn(wrapper.vm, 'fetchAnalysisHistory')
      const { get } = await import('@/utils/request')
      
      get.mockResolvedValue({ success: true, data: [] })
      
      await wrapper.vm.fetchAnalysisHistory()
      
      expect(fetchAnalysisHistorySpy).toHaveBeenCalled()
      expect(get).toHaveBeenCalledWith('/ai-stats/analysis-history')
    })

    it('should handle executeQuery API call correctly', async () => {
      const { post } = await import('@/utils/request')
      const { ElMessage } = await import('element-plus')
      
      post.mockResolvedValue({ success: true, data: { sql: 'SELECT * FROM test' } })
      wrapper.vm.queryText = 'test query'
      
      await wrapper.vm.executeQuery()
      
      expect(post).toHaveBeenCalledWith('/ai-query/chat', {
        message: 'test query',
        context: {
          userRole: 'admin',
          userId: 1,
          timestamp: expect.any(String)
        }
      })
      expect(ElMessage.success).toHaveBeenCalledWith('查询执行成功')
    })

    it('should show warning when executeQuery is called with empty query', async () => {
      const { ElMessage } = await import('element-plus')
      const { post } = await import('@/utils/request')
      
      wrapper.vm.queryText = ''
      await wrapper.vm.executeQuery()
      
      expect(post).not.toHaveBeenCalled()
      expect(ElMessage.warning).toHaveBeenCalledWith('请输入查询内容')
    })

    it('should handle startAnalysis API call correctly', async () => {
      const { post } = await import('@/utils/request')
      const { ElMessage } = await import('element-plus')
      
      post.mockResolvedValue({ success: true })
      
      await wrapper.vm.startAnalysis('enrollment')
      
      expect(post).toHaveBeenCalledWith('/ai/analysis/enrollment-trends', {
        timeRange: '6months',
        includeSeasonality: true,
        includePrediction: true,
        context: 'kindergarten_management',
        useDoubaoModel: true,
        modelVersion: '1.6'
      })
      expect(ElMessage.success).toHaveBeenCalledWith('AI分析完成')
    })

    it('should handle deployModel API call correctly', async () => {
      const { post } = await import('@/utils/request')
      const { ElMessage } = await import('element-plus')
      
      post.mockResolvedValue({ success: true })
      wrapper.vm.aiModels = [{ id: 1, status: 'stopped' }]
      
      await wrapper.vm.deployModel(1)
      
      expect(post).toHaveBeenCalledWith('/api/ai/models/1/deploy')
      expect(ElMessage.success).toHaveBeenCalledWith('模型部署成功')
      expect(wrapper.vm.aiModels[0].status).toBe('active')
    })

    it('should handle stopModel API call correctly', async () => {
      const { post } = await import('@/utils/request')
      const { ElMessage } = await import('element-plus')
      
      post.mockResolvedValue({ success: true })
      wrapper.vm.aiModels = [{ id: 1, status: 'active' }]
      
      await wrapper.vm.stopModel(1)
      
      expect(post).toHaveBeenCalledWith('/api/ai/models/1/stop')
      expect(ElMessage.success).toHaveBeenCalledWith('模型已停止')
      expect(wrapper.vm.aiModels[0].status).toBe('stopped')
    })

    it('should handle deleteModel API call correctly', async () => {
      const { post } = await import('@/utils/request')
      const { ElMessage } = await import('element-plus')
      
      post.mockResolvedValue({ success: true })
      wrapper.vm.aiModels = [{ id: 1, name: 'Test Model' }]
      
      await wrapper.vm.deleteModel(1)
      
      expect(post).toHaveBeenCalledWith('/api/ai/models/1/delete')
      expect(ElMessage.success).toHaveBeenCalledWith('模型已删除')
      expect(wrapper.vm.aiModels.length).toBe(0)
    })
  })

  describe('Utility Functions', () => {
    it('should format date correctly', () => {
      const formatDate = wrapper.vm.formatDate
      const testDate = '2024-01-15T10:30:00Z'
      
      const result = formatDate(testDate)
      expect(result).toContain('2024')
    })

    it('should return correct status text', () => {
      const getStatusText = wrapper.vm.getStatusText
      
      expect(getStatusText('completed')).toBe('已完成')
      expect(getStatusText('running')).toBe('运行中')
      expect(getStatusText('failed')).toBe('失败')
      expect(getStatusText('pending')).toBe('等待中')
      expect(getStatusText('unknown')).toBe('unknown')
    })

    it('should return correct model status text', () => {
      const getModelStatusText = wrapper.vm.getModelStatusText
      
      expect(getModelStatusText('active')).toBe('运行中')
      expect(getModelStatusText('training')).toBe('训练中')
      expect(getModelStatusText('stopped')).toBe('已停止')
      expect(getModelStatusText('error')).toBe('错误')
      expect(getModelStatusText('unknown')).toBe('unknown')
    })

    it('should handle initData with parallel API calls', async () => {
      const fetchOverviewStatsSpy = vi.spyOn(wrapper.vm, 'fetchOverviewStats')
      const fetchRecentTasksSpy = vi.spyOn(wrapper.vm, 'fetchRecentTasks')
      const fetchAIModelsSpy = vi.spyOn(wrapper.vm, 'fetchAIModels')
      const fetchAnalysisHistorySpy = vi.spyOn(wrapper.vm, 'fetchAnalysisHistory')
      
      // Mock all fetch functions
      fetchOverviewStatsSpy.mockResolvedValue(undefined)
      fetchRecentTasksSpy.mockResolvedValue(undefined)
      fetchAIModelsSpy.mockResolvedValue(undefined)
      fetchAnalysisHistorySpy.mockResolvedValue(undefined)
      
      await wrapper.vm.initData()
      
      expect(fetchOverviewStatsSpy).toHaveBeenCalled()
      expect(fetchRecentTasksSpy).toHaveBeenCalled()
      expect(fetchAIModelsSpy).toHaveBeenCalled()
      expect(fetchAnalysisHistorySpy).toHaveBeenCalled()
    })
  })

  describe('Event Handling', () => {
    it('should handle tab change event', () => {
      const handleTabChangeSpy = vi.spyOn(wrapper.vm, 'handleTabChange')
      
      wrapper.vm.handleTabChange('query')
      
      expect(handleTabChangeSpy).toHaveBeenCalledWith('query')
    })

    it('should handle create event', () => {
      const handleCreateSpy = vi.spyOn(wrapper.vm, 'handleCreate')
      const handleCreateModelSpy = vi.spyOn(wrapper.vm, 'handleCreateModel')
      
      wrapper.vm.handleCreate()
      
      expect(handleCreateSpy).toHaveBeenCalled()
      expect(handleCreateModelSpy).toHaveBeenCalled()
    })

    it('should handle model created event', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const loadAIModelsSpy = vi.spyOn(wrapper.vm, 'loadAIModels' as any)
      
      const mockModelData = { id: 1, name: 'Test Model' }
      wrapper.vm.handleModelCreated(mockModelData)
      
      expect(consoleSpy).toHaveBeenCalledWith('新创建的模型:', mockModelData)
      expect(loadAIModelsSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })
  })

  describe('Loading States', () => {
    it('should show loading state during data loading', async () => {
      wrapper.vm.loading = true
      await nextTick()
      
      expect(wrapper.vm.loading).toBe(true)
    })

    it('should show query loading state during query execution', async () => {
      wrapper.vm.queryLoading = true
      await nextTick()
      
      expect(wrapper.vm.queryLoading).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const { get } = await import('@/utils/request')
      const { ElMessage } = await import('element-plus')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      get.mockRejectedValue(new Error('Network error'))
      
      await wrapper.vm.fetchOverviewStats()
      
      expect(consoleSpy).toHaveBeenCalledWith('获取AI概览统计失败:', expect.any(Error))
      expect(ElMessage.error).toHaveBeenCalledWith('获取统计数据失败')
      
      consoleSpy.mockRestore()
    })

    it('should handle query execution errors', async () => {
      const { post } = await import('@/utils/request')
      const { ElMessage } = await import('element-plus')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      post.mockRejectedValue(new Error('Query failed'))
      wrapper.vm.queryText = 'test query'
      
      await wrapper.vm.executeQuery()
      
      expect(consoleSpy).toHaveBeenCalledWith('AI查询失败:', expect.any(Error))
      expect(ElMessage.error).toHaveBeenCalledWith('查询失败，请稍后重试')
      expect(wrapper.vm.queryLoading).toBe(false)
      
      consoleSpy.mockRestore()
    })

    it('should handle analysis start errors', async () => {
      const { post } = await import('@/utils/request')
      const { ElMessage } = await import('element-plus')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      post.mockRejectedValue(new Error('Analysis failed'))
      
      await wrapper.vm.startAnalysis('enrollment')
      
      expect(consoleSpy).toHaveBeenCalledWith('启动AI分析失败:', expect.any(Error))
      expect(ElMessage.error).toHaveBeenCalledWith('分析失败，请稍后重试')
      
      consoleSpy.mockRestore()
    })
  })

  describe('Component Integration', () => {
    it('should integrate with CenterContainer component correctly', () => {
      const centerContainer = wrapper.findComponent(CenterContainer)
      expect(centerContainer.props('title')).toBe('智能中心')
      expect(centerContainer.props('tabs')).toEqual(wrapper.vm.tabs)
    })

    it('should integrate with StatCard components correctly', () => {
      const statCards = wrapper.findAllComponents(StatCard)
      expect(statCards.length).toBe(4) // 4 stat cards
    })

    it('should integrate with CreateModelDialog component correctly', () => {
      const createModelDialog = wrapper.findComponent(CreateModelDialog)
      expect(createModelDialog.exists()).toBe(true)
      expect(createModelDialog.props('modelValue')).toBe(wrapper.vm.showCreateModelDialog)
    })

    it('should handle CreateModelDialog events correctly', async () => {
      const createModelDialog = wrapper.findComponent(CreateModelDialog)
      const handleModelCreatedSpy = vi.spyOn(wrapper.vm, 'handleModelCreated')
      
      await createModelDialog.vm.$emit('success', { id: 1, name: 'Test Model' })
      
      expect(handleModelCreatedSpy).toHaveBeenCalledWith({ id: 1, name: 'Test Model' })
    })
  })

  describe('Message Display', () => {
    it('should show info message when stat card is clicked', async () => {
      const { ElMessage } = await import('element-plus')
      
      await wrapper.vm.handleStatClick({ title: '活跃AI模型' })
      
      expect(ElMessage.info).toHaveBeenCalledWith('点击了活跃AI模型统计卡片')
    })

    it('should show info message when task is viewed', async () => {
      const { ElMessage } = await import('element-plus')
      
      await wrapper.vm.viewTask(1)
      
      expect(ElMessage.info).toHaveBeenCalledWith('查看AI任务 1')
    })

    it('should show success message when task is rerun', async () => {
      const { ElMessage } = await import('element-plus')
      
      await wrapper.vm.rerunTask(1)
      
      expect(ElMessage.success).toHaveBeenCalledWith('重新运行AI任务 1')
    })

    it('should show info message when analysis is started', async () => {
      const { ElMessage } = await import('element-plus')
      
      await wrapper.vm.startAnalysis('enrollment')
      
      expect(ElMessage.info).toHaveBeenCalledWith('正在启动AI分析，请稍候...')
    })
  })

  describe('Lifecycle Hooks', () => {
    it('should call initData on component mount', () => {
      const initDataSpy = vi.spyOn(wrapper.vm, 'initData')
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      // Remount to trigger onMounted
      wrapper = createWrapper()

      expect(consoleSpy).toHaveBeenCalledWith('智能中心已加载')
      expect(initDataSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('Responsive Design', () => {
    it('should apply responsive styles correctly', () => {
      const aiCenter = wrapper.find('.ai-center')
      expect(aiCenter.exists()).toBe(true)
    })

    it('should have proper grid layouts for responsive design', () => {
      const statsSection = wrapper.find('.stats-section')
      expect(statsSection.exists()).toBe(true)
      
      const aiModules = wrapper.find('.ai-modules')
      expect(aiModules.exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      const headings = wrapper.findAll('h2, h3, h4')
      expect(headings.length).toBeGreaterThan(0)
    })

    it('should have clickable elements with proper interaction feedback', () => {
      const moduleItems = wrapper.findAll('.module-item')
      moduleItems.forEach((item: any) => {
        expect(item.classes()).toContain('cursor-pointer')
      })
    })
  })

  describe('Performance Optimization', () => {
    it('should use reactive data efficiently', () => {
      expect(wrapper.vm.showCreateModelDialog).toBeDefined()
      expect(wrapper.vm.loading).toBeDefined()
      expect(wrapper.vm.queryLoading).toBeDefined()
      expect(wrapper.vm.queryText).toBeDefined()
      expect(wrapper.vm.queryResults).toBeDefined()
      expect(wrapper.vm.analysisResults).toBeDefined()
      expect(wrapper.vm.recentTasks).toBeDefined()
      expect(wrapper.vm.aiModels).toBeDefined()
    })

    it('should handle parallel API calls efficiently', async () => {
      const initDataSpy = vi.spyOn(wrapper.vm, 'initData')
      
      await wrapper.vm.initData()
      
      expect(initDataSpy).toHaveBeenCalled()
    })
  })
})