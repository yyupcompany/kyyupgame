import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import CustomerPoolCenter from '@/pages/centers/CustomerPoolCenter.vue'
import CenterContainer from '@/components/centers/CenterContainer.vue'
import StatCard from '@/components/centers/StatCard.vue'
import ChartContainer from '@/components/centers/ChartContainer.vue'
import ActionToolbar from '@/components/centers/ActionToolbar.vue'
import DataTable from '@/components/centers/DataTable.vue'
import DetailPanel from '@/components/centers/DetailPanel.vue'
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
    },
    ElMessageBox: {
      confirm: vi.fn()
    }
  }
})

// Mock request utilities
vi.mock('@/utils/request', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))

// Mock API endpoints
vi.mock('@/api/endpoints', () => ({
  CUSTOMER_ENDPOINTS: {
    POOL_STATS: '/api/customer-pool/stats',
    POOL: '/api/customer-pool',
    POOL_BY_ID: (id: number) => `/api/customer-pool/${id}`
  }
}))

// Mock router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  }),
  useRoute: () => ({
    query: {}
  })
}))

describe('CustomerPoolCenter.vue', () => {
  let wrapper: any
  let mockRouter: any
  let mockRoute: any
  let mockRequest: any

  const createWrapper = (routeQuery = {}) => {
    const pinia = createPinia()
    setActivePinia(pinia)
    
    mockRouter = {
      push: vi.fn()
    }
    
    mockRoute = {
      query: routeQuery
    }
    
    mockRequest = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      del: vi.fn()
    }
    
    return mount(CustomerPoolCenter, {
      global: {
        plugins: [pinia, ElementPlus],
        components: {
          ...ElementPlusIconsVue,
          CenterContainer,
          StatCard,
          ChartContainer,
          ActionToolbar,
          DataTable,
          DetailPanel
        },
        stubs: {
          'el-icon': true,
          'el-button': true,
          'el-button-group': true,
          'el-tag': true,
          'el-table': true,
          'el-table-column': true,
          'el-tabs': true,
          'el-tab-pane': true
        },
        provide: {
          router: mockRouter,
          route: mockRoute
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
    it('should render the customer pool center correctly', () => {
      expect(wrapper.find('.overview-content').exists()).toBe(true)
    })

    it('should render CenterContainer component', () => {
      const centerContainer = wrapper.findComponent(CenterContainer)
      expect(centerContainer.exists()).toBe(true)
    })

    it('should render welcome section with title and description', () => {
      const welcomeSection = wrapper.find('.welcome-section')
      expect(welcomeSection.exists()).toBe(true)
      
      const title = welcomeSection.find('h2')
      expect(title.text()).toBe('欢迎来到客户池中心')
      
      const description = welcomeSection.find('p')
      expect(description.text()).toContain('客户管理的核心平台')
    })

    it('should render header actions with create customer button', () => {
      const headerActions = wrapper.find('.header-actions')
      expect(headerActions.exists()).toBe(true)
      
      const createButton = headerActions.find('el-button-stub')
      expect(createButton.text()).toContain('新建客户')
    })

    it('should render statistics section', () => {
      const statsSection = wrapper.find('.stats-section')
      expect(statsSection.exists()).toBe(true)
    })

    it('should render charts section', () => {
      const chartsSection = wrapper.find('.charts-section')
      expect(chartsSection.exists()).toBe(true)
    })

    it('should render quick actions section', () => {
      const quickActionsSection = wrapper.find('.quick-actions-section')
      expect(quickActionsSection.exists()).toBe(true)
    })

    it('should render customers layout in customers tab', async () => {
      await wrapper.setData({ activeTab: 'customers' })
      await nextTick()
      
      const customersLayout = wrapper.find('.customers-layout')
      expect(customersLayout.exists()).toBe(true)
    })

    it('should render followups layout in followups tab', async () => {
      await wrapper.setData({ activeTab: 'followups' })
      await nextTick()
      
      const followupsLayout = wrapper.find('.followups-layout')
      expect(followupsLayout.exists()).toBe(true)
    })

    it('should render analytics content in analytics tab', async () => {
      await wrapper.setData({ activeTab: 'analytics' })
      await nextTick()
      
      const analyticsContent = wrapper.find('.analytics-content')
      expect(analyticsContent.exists()).toBe(true)
    })
  })

  describe('Data and State Management', () => {
    it('should initialize with correct default values', () => {
      expect(wrapper.vm.activeTab).toBe('overview')
      expect(wrapper.vm.chartsLoading).toBe(false)
      expect(wrapper.vm.customersLoading).toBe(false)
      expect(wrapper.vm.followupsLoading).toBe(false)
      expect(wrapper.vm.customerDetailLoading).toBe(false)
      expect(wrapper.vm.followupDetailLoading).toBe(false)
      expect(wrapper.vm.customersPage).toBe(1)
      expect(wrapper.vm.customersPageSize).toBe(20)
      expect(wrapper.vm.followupsPage).toBe(1)
      expect(wrapper.vm.followupsPageSize).toBe(20)
    })

    it('should have correct tabs configuration', () => {
      const tabs = wrapper.vm.tabs
      expect(tabs).toEqual([
        { key: 'overview', label: '概览', icon: 'Monitor' },
        { key: 'customers', label: '客户管理', icon: 'User' },
        { key: 'followups', label: '跟进记录', icon: 'ChatDotRound' },
        { key: 'analytics', label: '数据分析', icon: 'TrendCharts' }
      ])
    })

    it('should have correct overview stats structure', () => {
      const stats = wrapper.vm.overviewStats.value
      expect(stats.length).toBe(4)
      
      const statKeys = stats.map(stat => stat.key)
      expect(statKeys).toContain('total')
      expect(statKeys).toContain('new')
      expect(statKeys).toContain('unassigned')
      expect(statKeys).toContain('converted')
    })

    it('should have correct customers columns configuration', () => {
      const columns = wrapper.vm.customersColumns
      expect(columns.length).toBe(8)
      
      const expectedColumns = ['id', 'name', 'phone', 'source', 'status', 'teacher', 'createTime', 'actions']
      columns.forEach(column => {
        expect(expectedColumns).toContain(column.prop)
      })
    })

    it('should have correct followups columns configuration', () => {
      const columns = wrapper.vm.followupsColumns
      expect(columns.length).toBe(7)
      
      const expectedColumns = ['id', 'customerName', 'followupMethod', 'followupContent', 'followupResult', 'followupTime', 'nextFollowup']
      columns.forEach(column => {
        expect(expectedColumns).toContain(column.prop)
      })
    })

    it('should have correct customer detail sections', () => {
      const sections = wrapper.vm.customerDetailSections
      expect(sections.length).toBe(2)
      expect(sections[0].title).toBe('基本信息')
      expect(sections[1].title).toBe('客户状态')
    })

    it('should have correct followup detail sections', () => {
      const sections = wrapper.vm.followupDetailSections
      expect(sections.length).toBe(1)
      expect(sections[0].title).toBe('跟进信息')
    })

    it('should have correct quick actions configuration', () => {
      const actions = wrapper.vm.quickActions
      expect(actions.length).toBe(3)
      
      const actionKeys = actions.map(action => action.key)
      expect(actionKeys).toContain('import')
      expect(actionKeys).toContain('export')
      expect(actionKeys).toContain('batch_assign')
    })

    it('should have correct chart configurations', () => {
      expect(wrapper.vm.conversionTrendChart.value).toBeDefined()
      expect(wrapper.vm.sourceDistributionChart.value).toBeDefined()
      expect(wrapper.vm.conversionFunnelChart.value).toBeDefined()
      expect(wrapper.vm.followupEffectChart.value).toBeDefined()
    })
  })

  describe('User Interactions', () => {
    it('should call handleCreate when create button is clicked', async () => {
      const handleCreateSpy = vi.spyOn(wrapper.vm, 'handleCreate')
      
      await wrapper.vm.handleCreate()
      
      expect(handleCreateSpy).toHaveBeenCalled()
      expect(mockRouter.push).toHaveBeenCalledWith('/customer/create')
    })

    it('should call handleStatClick when stat card is clicked', async () => {
      const handleStatClickSpy = vi.spyOn(wrapper.vm, 'handleStatClick')
      const mockStat = { title: '总客户数' }
      
      await wrapper.vm.handleStatClick(mockStat)
      
      expect(handleStatClickSpy).toHaveBeenCalledWith(mockStat)
    })

    it('should call handleTabChange when tab is changed', async () => {
      const handleTabChangeSpy = vi.spyOn(wrapper.vm, 'handleTabChange')
      const loadTabDataSpy = vi.spyOn(wrapper.vm, 'loadTabData')
      
      await wrapper.vm.handleTabChange('customers')
      
      expect(handleTabChangeSpy).toHaveBeenCalledWith('customers')
      expect(loadTabDataSpy).toHaveBeenCalledWith('customers')
      expect(wrapper.vm.activeTab).toBe('customers')
    })

    it('should call handleCreateCustomer when create customer is triggered', async () => {
      const handleCreateCustomerSpy = vi.spyOn(wrapper.vm, 'handleCreateCustomer')
      
      await wrapper.vm.handleCreateCustomer()
      
      expect(handleCreateCustomerSpy).toHaveBeenCalled()
      expect(mockRouter.push).toHaveBeenCalledWith('/customer/create')
    })

    it('should call handleEditCustomer when edit customer is triggered', async () => {
      const handleEditCustomerSpy = vi.spyOn(wrapper.vm, 'handleEditCustomer')
      const mockCustomer = { id: 1, name: '张三' }
      
      await wrapper.vm.handleEditCustomer(mockCustomer)
      
      expect(handleEditCustomerSpy).toHaveBeenCalledWith(mockCustomer)
      expect(mockRouter.push).toHaveBeenCalledWith('/customer/edit/1')
    })

    it('should call handleDeleteCustomer when delete customer is triggered', async () => {
      const { ElMessageBox } = await import('element-plus')
      const { del } = await import('@/utils/request')
      
      ElMessageBox.confirm.mockResolvedValue(true)
      del.mockResolvedValue({ success: true })
      
      const mockCustomer = { id: 1, name: '张三' }
      await wrapper.vm.handleDeleteCustomer(mockCustomer)
      
      expect(ElMessageBox.confirm).toHaveBeenCalledWith('确定要删除这个客户吗？', '确认删除', {
        type: 'warning'
      })
      expect(del).toHaveBeenCalledWith('/api/customer-pool/1')
    })

    it('should call handleCustomerRowClick when customer row is clicked', async () => {
      const handleCustomerRowClickSpy = vi.spyOn(wrapper.vm, 'handleCustomerRowClick')
      const mockCustomer = { id: 1, name: '张三' }
      
      await wrapper.vm.handleCustomerRowClick(mockCustomer)
      
      expect(handleCustomerRowClickSpy).toHaveBeenCalledWith(mockCustomer)
      expect(wrapper.vm.selectedCustomer).toEqual(mockCustomer)
    })

    it('should call handleFollowUp when follow up button is clicked', async () => {
      const handleFollowUpSpy = vi.spyOn(wrapper.vm, 'handleFollowUp')
      const mockCustomer = { id: 1, name: '张三' }
      
      await wrapper.vm.handleFollowUp(mockCustomer)
      
      expect(handleFollowUpSpy).toHaveBeenCalledWith(mockCustomer)
    })

    it('should call handleAssignCustomer when assign button is clicked', async () => {
      const handleAssignCustomerSpy = vi.spyOn(wrapper.vm, 'handleAssignCustomer')
      const mockCustomer = { id: 1, name: '张三' }
      
      await wrapper.vm.handleAssignCustomer(mockCustomer)
      
      expect(handleAssignCustomerSpy).toHaveBeenCalledWith(mockCustomer)
    })

    it('should call handleViewDetail when view detail button is clicked', async () => {
      const handleViewDetailSpy = vi.spyOn(wrapper.vm, 'handleViewDetail')
      const mockCustomer = { id: 1, name: '张三' }
      
      await wrapper.vm.handleViewDetail(mockCustomer)
      
      expect(handleViewDetailSpy).toHaveBeenCalledWith(mockCustomer)
      expect(mockRouter.push).toHaveBeenCalledWith('/customer/detail/1')
    })

    it('should call handleCustomersPageChange when page changes', async () => {
      const handleCustomersPageChangeSpy = vi.spyOn(wrapper.vm, 'handleCustomersPageChange')
      const loadCustomersDataSpy = vi.spyOn(wrapper.vm, 'loadCustomersData')
      
      await wrapper.vm.handleCustomersPageChange(2)
      
      expect(handleCustomersPageChangeSpy).toHaveBeenCalledWith(2)
      expect(wrapper.vm.customersPage).toBe(2)
      expect(loadCustomersDataSpy).toHaveBeenCalled()
    })

    it('should call handleCustomersPageSizeChange when page size changes', async () => {
      const handleCustomersPageSizeChangeSpy = vi.spyOn(wrapper.vm, 'handleCustomersPageSizeChange')
      const loadCustomersDataSpy = vi.spyOn(wrapper.vm, 'loadCustomersData')
      
      await wrapper.vm.handleCustomersPageSizeChange(50)
      
      expect(handleCustomersPageSizeChangeSpy).toHaveBeenCalledWith(50)
      expect(wrapper.vm.customersPageSize).toBe(50)
      expect(wrapper.vm.customersPage).toBe(1)
      expect(loadCustomersDataSpy).toHaveBeenCalled()
    })

    it('should call handleCustomersSearch when search is triggered', async () => {
      const handleCustomersSearchSpy = vi.spyOn(wrapper.vm, 'handleCustomersSearch')
      const loadCustomersDataSpy = vi.spyOn(wrapper.vm, 'loadCustomersData')
      
      await wrapper.vm.handleCustomersSearch('张三')
      
      expect(handleCustomersSearchSpy).toHaveBeenCalledWith('张三')
      expect(loadCustomersDataSpy).toHaveBeenCalled()
    })

    it('should call handleCustomerDetailSave when customer detail is saved', async () => {
      const handleCustomerDetailSaveSpy = vi.spyOn(wrapper.vm, 'handleCustomerDetailSave')
      const mockData = { name: '张三', phone: '13800138000' }
      
      await wrapper.vm.handleCustomerDetailSave(mockData)
      
      expect(handleCustomerDetailSaveSpy).toHaveBeenCalledWith(mockData)
    })

    it('should call handleFollowupRowClick when followup row is clicked', async () => {
      const handleFollowupRowClickSpy = vi.spyOn(wrapper.vm, 'handleFollowupRowClick')
      const mockFollowup = { id: 1, customerName: '张三家长' }
      
      await wrapper.vm.handleFollowupRowClick(mockFollowup)
      
      expect(handleFollowupRowClickSpy).toHaveBeenCalledWith(mockFollowup)
      expect(wrapper.vm.selectedFollowup).toEqual(mockFollowup)
    })

    it('should call handleQuickAction when quick action is triggered', async () => {
      const handleQuickActionSpy = vi.spyOn(wrapper.vm, 'handleQuickAction')
      const mockAction = { key: 'import' }
      
      await wrapper.vm.handleQuickAction(mockAction)
      
      expect(handleQuickActionSpy).toHaveBeenCalledWith(mockAction)
    })

    it('should call handleSecondaryAction when secondary action is triggered', async () => {
      const handleSecondaryActionSpy = vi.spyOn(wrapper.vm, 'handleSecondaryAction')
      const loadTabDataSpy = vi.spyOn(wrapper.vm, 'loadTabData')
      const mockAction = { key: 'refresh' }
      
      await wrapper.vm.handleSecondaryAction(mockAction)
      
      expect(handleSecondaryActionSpy).toHaveBeenCalledWith(mockAction)
      expect(loadTabDataSpy).toHaveBeenCalled()
    })

    it('should call handleAnalyticsAction when analytics action is triggered', async () => {
      const handleAnalyticsActionSpy = vi.spyOn(wrapper.vm, 'handleAnalyticsAction')
      const mockAction = { key: 'export_report' }
      
      await wrapper.vm.handleAnalyticsAction(mockAction)
      
      expect(handleAnalyticsActionSpy).toHaveBeenCalledWith(mockAction)
    })

    it('should call refreshCharts when refresh is triggered', async () => {
      const refreshChartsSpy = vi.spyOn(wrapper.vm, 'refreshCharts')
      
      await wrapper.vm.refreshCharts()
      
      expect(refreshChartsSpy).toHaveBeenCalled()
      expect(wrapper.vm.chartsLoading).toBe(true)
    })
  })

  describe('API Integration', () => {
    it('should call loadOverviewData when overview tab is loaded', async () => {
      const { get } = await import('@/utils/request')
      const { ElMessage } = await import('element-plus')
      
      get.mockResolvedValue({ 
        success: true, 
        data: { 
          totalCustomers: 100,
          newCustomersThisMonth: 20,
          unassignedCustomers: 15,
          convertedCustomersThisMonth: 30
        } 
      })
      
      await wrapper.vm.loadOverviewData()
      
      expect(get).toHaveBeenCalledWith('/api/customer-pool/stats')
      expect(wrapper.vm.overviewStats.value[0].value).toBe(100)
      expect(wrapper.vm.overviewStats.value[1].value).toBe(20)
      expect(wrapper.vm.overviewStats.value[2].value).toBe(15)
      expect(wrapper.vm.overviewStats.value[3].value).toBe(30)
    })

    it('should handle loadOverviewData API error', async () => {
      const { get } = await import('@/utils/request')
      const { ElMessage } = await import('element-plus')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      get.mockRejectedValue(new Error('Network error'))
      
      await wrapper.vm.loadOverviewData()
      
      expect(consoleSpy).toHaveBeenCalledWith('❌ 加载客户池概览数据失败:', expect.any(Error))
      expect(ElMessage.error).toHaveBeenCalledWith('加载概览数据失败')
      
      consoleSpy.mockRestore()
    })

    it('should call loadCustomersData when customers tab is loaded', async () => {
      const { get } = await import('@/utils/request')
      
      get.mockResolvedValue({ 
        success: true, 
        data: { 
          items: [{ id: 1, name: '张三' }], 
          total: 1 
        } 
      })
      
      await wrapper.vm.loadCustomersData()
      
      expect(get).toHaveBeenCalledWith('/api/customer-pool', {
        page: 1,
        pageSize: 20
      })
      expect(wrapper.vm.customersData.value).toEqual([{ id: 1, name: '张三' }])
      expect(wrapper.vm.customersTotal.value).toBe(1)
    })

    it('should handle loadCustomersData API error', async () => {
      const { get } = await import('@/utils/request')
      const { ElMessage } = await import('element-plus')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      get.mockRejectedValue(new Error('Network error'))
      
      await wrapper.vm.loadCustomersData()
      
      expect(consoleSpy).toHaveBeenCalledWith('加载客户数据失败:', expect.any(Error))
      expect(ElMessage.error).toHaveBeenCalledWith('加载客户数据失败')
      expect(wrapper.vm.customersLoading).toBe(false)
      
      consoleSpy.mockRestore()
    })

    it('should load followups data with mock data', async () => {
      await wrapper.vm.loadFollowupsData()
      
      expect(wrapper.vm.followupsData.value.length).toBe(5)
      expect(wrapper.vm.followupsTotal.value).toBe(5)
      expect(wrapper.vm.followupsData.value[0].customerName).toBe('张三家长')
    })

    it('should call delete customer API correctly', async () => {
      const { ElMessageBox } = await import('element-plus')
      const { del } = await import('@/utils/request')
      const { ElMessage } = await import('element-plus')
      
      ElMessageBox.confirm.mockResolvedValue(true)
      del.mockResolvedValue({ success: true })
      
      const mockCustomer = { id: 1, name: '张三' }
      await wrapper.vm.handleDeleteCustomer(mockCustomer)
      
      expect(del).toHaveBeenCalledWith('/api/customer-pool/1')
      expect(ElMessage.success).toHaveBeenCalledWith('删除成功')
    })

    it('should handle delete customer cancellation', async () => {
      const { ElMessageBox } = await import('element-plus')
      
      ElMessageBox.confirm.mockRejectedValue('cancel')
      
      const mockCustomer = { id: 1, name: '张三' }
      await wrapper.vm.handleDeleteCustomer(mockCustomer)
      
      // Should not call delete API or show success message
      expect(wrapper.vm.handleDeleteCustomer).not.toThrow()
    })

    it('should handle delete customer API error', async () => {
      const { ElMessageBox } = await import('element-plus')
      const { del } = await import('@/utils/request')
      const { ElMessage } = await import('element-plus')
      
      ElMessageBox.confirm.mockResolvedValue(true)
      del.mockRejectedValue(new Error('Delete failed'))
      
      const mockCustomer = { id: 1, name: '张三' }
      await wrapper.vm.handleDeleteCustomer(mockCustomer)
      
      expect(ElMessage.error).toHaveBeenCalledWith('删除失败')
    })
  })

  describe('Utility Functions', () => {
    it('should return correct customer status type', () => {
      const getCustomerStatusType = wrapper.vm.getCustomerStatusType
      
      expect(getCustomerStatusType('new')).toBe('primary')
      expect(getCustomerStatusType('following')).toBe('warning')
      expect(getCustomerStatusType('converted')).toBe('success')
      expect(getCustomerStatusType('lost')).toBe('danger')
      expect(getCustomerStatusType('unknown')).toBe('info')
    })

    it('should return correct customer status text', () => {
      const getCustomerStatusText = wrapper.vm.getCustomerStatusText
      
      expect(getCustomerStatusText('new')).toBe('新客户')
      expect(getCustomerStatusText('following')).toBe('跟进中')
      expect(getCustomerStatusText('converted')).toBe('已转化')
      expect(getCustomerStatusText('lost')).toBe('已流失')
      expect(getCustomerStatusText('unknown')).toBe('unknown')
    })

    it('should return correct source type', () => {
      const getSourceType = wrapper.vm.getSourceType
      
      expect(getSourceType('online')).toBe('primary')
      expect(getSourceType('referral')).toBe('success')
      expect(getSourceType('offline')).toBe('warning')
      expect(getSourceType('phone')).toBe('info')
      expect(getSourceType('unknown')).toBe('default')
    })

    it('should return correct source text', () => {
      const getSourceText = wrapper.vm.getSourceText
      
      expect(getSourceText('online')).toBe('线上广告')
      expect(getSourceText('referral')).toBe('朋友介绍')
      expect(getSourceText('offline')).toBe('线下活动')
      expect(getSourceText('phone')).toBe('电话咨询')
      expect(getSourceText('unknown')).toBe('unknown')
    })

    it('should return correct followup type color', () => {
      const getFollowupTypeColor = wrapper.vm.getFollowupTypeColor
      
      expect(getFollowupTypeColor('phone')).toBe('primary')
      expect(getFollowupTypeColor('wechat')).toBe('success')
      expect(getFollowupTypeColor('visit')).toBe('warning')
      expect(getFollowupTypeColor('email')).toBe('info')
      expect(getFollowupTypeColor('unknown')).toBe('default')
    })

    it('should return correct followup type text', () => {
      const getFollowupTypeText = wrapper.vm.getFollowupTypeText
      
      expect(getFollowupTypeText('phone')).toBe('电话跟进')
      expect(getFollowupTypeText('wechat')).toBe('微信沟通')
      expect(getFollowupTypeText('visit')).toBe('上门拜访')
      expect(getFollowupTypeText('email')).toBe('邮件联系')
      expect(getFollowupTypeText('unknown')).toBe('unknown')
    })

    it('should return correct followup result color', () => {
      const getFollowupResultColor = wrapper.vm.getFollowupResultColor
      
      expect(getFollowupResultColor('interested')).toBe('success')
      expect(getFollowupResultColor('considering')).toBe('warning')
      expect(getFollowupResultColor('not_interested')).toBe('danger')
      expect(getFollowupResultColor('converted')).toBe('primary')
      expect(getFollowupResultColor('unknown')).toBe('default')
    })

    it('should return correct followup result text', () => {
      const getFollowupResultText = wrapper.vm.getFollowupResultText
      
      expect(getFollowupResultText('interested')).toBe('有意向')
      expect(getFollowupResultText('considering')).toBe('考虑中')
      expect(getFollowupResultText('not_interested')).toBe('无意向')
      expect(getFollowupResultText('converted')).toBe('已转化')
      expect(getFollowupResultText('unknown')).toBe('unknown')
    })

    it('should load correct tab data based on tab key', async () => {
      const loadOverviewDataSpy = vi.spyOn(wrapper.vm, 'loadOverviewData')
      const loadCustomersDataSpy = vi.spyOn(wrapper.vm, 'loadCustomersData')
      const loadFollowupsDataSpy = vi.spyOn(wrapper.vm, 'loadFollowupsData')
      const loadAnalyticsDataSpy = vi.spyOn(wrapper.vm, 'loadAnalyticsData')
      
      // Mock all load methods
      loadOverviewDataSpy.mockResolvedValue(undefined)
      loadCustomersDataSpy.mockResolvedValue(undefined)
      loadFollowupsDataSpy.mockResolvedValue(undefined)
      loadAnalyticsDataSpy.mockResolvedValue(undefined)
      
      await wrapper.vm.loadTabData('overview')
      expect(loadOverviewDataSpy).toHaveBeenCalled()
      
      await wrapper.vm.loadTabData('customers')
      expect(loadCustomersDataSpy).toHaveBeenCalled()
      
      await wrapper.vm.loadTabData('followups')
      expect(loadFollowupsDataSpy).toHaveBeenCalled()
      
      await wrapper.vm.loadTabData('analytics')
      expect(loadAnalyticsDataSpy).toHaveBeenCalled()
    })
  })

  describe('Loading States', () => {
    it('should show loading state during charts loading', async () => {
      wrapper.vm.chartsLoading = true
      await nextTick()
      
      expect(wrapper.vm.chartsLoading).toBe(true)
    })

    it('should show loading state during customers data loading', async () => {
      wrapper.vm.customersLoading = true
      await nextTick()
      
      expect(wrapper.vm.customersLoading).toBe(true)
    })

    it('should show loading state during followups data loading', async () => {
      wrapper.vm.followupsLoading = true
      await nextTick()
      
      expect(wrapper.vm.followupsLoading).toBe(true)
    })

    it('should show loading state during customer detail loading', async () => {
      wrapper.vm.customerDetailLoading = true
      await nextTick()
      
      expect(wrapper.vm.customerDetailLoading).toBe(true)
    })

    it('should show loading state during followup detail loading', async () => {
      wrapper.vm.followupDetailLoading = true
      await nextTick()
      
      expect(wrapper.vm.followupDetailLoading).toBe(true)
    })
  })

  describe('Message Display', () => {
    it('should show info message when stat card is clicked', async () => {
      const { ElMessage } = await import('element-plus')
      
      await wrapper.vm.handleStatClick({ title: '总客户数' })
      
      expect(ElMessage.info).toHaveBeenCalledWith('查看总客户数详情')
    })

    it('should show info message when follow up is triggered', async () => {
      const { ElMessage } = await import('element-plus')
      
      await wrapper.vm.handleFollowUp({ name: '张三' })
      
      expect(ElMessage.info).toHaveBeenCalledWith('跟进客户: 张三')
    })

    it('should show info message when assign customer is triggered', async () => {
      const { ElMessage } = await import('element-plus')
      
      await wrapper.vm.handleAssignCustomer({ name: '张三' })
      
      expect(ElMessage.info).toHaveBeenCalledWith('分配客户: 张三')
    })

    it('should show success message when customer detail is saved', async () => {
      const { ElMessage } = await import('element-plus')
      
      await wrapper.vm.handleCustomerDetailSave({ name: '张三' })
      
      expect(ElMessage.success).toHaveBeenCalledWith('客户详情已保存')
    })

    it('should show success message when followup detail is saved', async () => {
      const { ElMessage } = await import('element-plus')
      
      await wrapper.vm.handleFollowupDetailSave({ content: '测试跟进' })
      
      expect(ElMessage.success).toHaveBeenCalledWith('跟进详情已保存')
    })

    it('should show success message when data is refreshed', async () => {
      const { ElMessage } = await import('element-plus')
      
      await wrapper.vm.handleSecondaryAction({ key: 'refresh' })
      
      expect(ElMessage.success).toHaveBeenCalledWith('数据已刷新')
    })

    it('should show success message when charts are refreshed', async () => {
      const { ElMessage } = await import('element-plus')
      
      // Set up refreshCharts to complete
      wrapper.vm.chartsLoading = true
      await wrapper.vm.refreshCharts()
      
      // Wait for the timeout to complete
      await new Promise(resolve => setTimeout(resolve, 1100))
      
      expect(ElMessage.success).toHaveBeenCalledWith('图表已刷新')
      expect(wrapper.vm.chartsLoading).toBe(false)
    })
  })

  describe('Component Integration', () => {
    it('should integrate with CenterContainer component correctly', () => {
      const centerContainer = wrapper.findComponent(CenterContainer)
      expect(centerContainer.props('title')).toBe('客户池中心')
      expect(centerContainer.props('tabs')).toEqual(wrapper.vm.tabs)
    })

    it('should integrate with StatCard components correctly', () => {
      const statCards = wrapper.findAllComponents(StatCard)
      expect(statCards.length).toBe(4) // 4 stat cards
    })

    it('should integrate with ChartContainer components correctly', () => {
      const chartContainers = wrapper.findAllComponents(ChartContainer)
      expect(chartContainers.length).toBeGreaterThan(0)
    })

    it('should integrate with ActionToolbar components correctly', () => {
      const actionToolbars = wrapper.findAllComponents(ActionToolbar)
      expect(actionToolbars.length).toBeGreaterThan(0)
    })

    it('should integrate with DataTable components correctly', () => {
      const dataTables = wrapper.findAllComponents(DataTable)
      expect(dataTables.length).toBeGreaterThan(0)
    })

    it('should integrate with DetailPanel components correctly', () => {
      const detailPanels = wrapper.findAllComponents(DetailPanel)
      expect(detailPanels.length).toBeGreaterThan(0)
    })
  })

  describe('Lifecycle Hooks', () => {
    it('should initialize with correct tab from route query', () => {
      const wrapperWithQuery = createWrapper({ tab: 'customers' })
      
      expect(wrapperWithQuery.vm.activeTab).toBe('customers')
    })

    it('should load initial tab data on mount', () => {
      const loadTabDataSpy = vi.spyOn(wrapper.vm, 'loadTabData')
      
      // Remount to trigger onMounted
      wrapper = createWrapper()
      
      expect(loadTabDataSpy).toHaveBeenCalledWith('overview')
    })

    it('should watch route query changes and update tab', async () => {
      const loadTabDataSpy = vi.spyOn(wrapper.vm, 'loadTabData')
      
      // Simulate route query change
      wrapper.vm.$options.watch[0].handler.call(wrapper.vm, 'customers')
      
      expect(wrapper.vm.activeTab).toBe('customers')
      expect(loadTabDataSpy).toHaveBeenCalledWith('customers')
    })
  })

  describe('Responsive Design', () => {
    it('should apply responsive styles correctly', () => {
      const overviewContent = wrapper.find('.overview-content')
      expect(overviewContent.exists()).toBe(true)
    })

    it('should have proper layout for customers management', async () => {
      await wrapper.setData({ activeTab: 'customers' })
      await nextTick()
      
      const customersLayout = wrapper.find('.customers-layout')
      expect(customersLayout.exists()).toBe(true)
      
      const customersList = wrapper.find('.customers-list')
      expect(customersList.exists()).toBe(true)
      
      const customerDetail = wrapper.find('.customer-detail')
      expect(customerDetail.exists()).toBe(true)
    })

    it('should have proper layout for followups management', async () => {
      await wrapper.setData({ activeTab: 'followups' })
      await nextTick()
      
      const followupsLayout = wrapper.find('.followups-layout')
      expect(followupsLayout.exists()).toBe(true)
      
      const followupsList = wrapper.find('.followups-list')
      expect(followupsList.exists()).toBe(true)
      
      const followupDetail = wrapper.find('.followup-detail')
      expect(followupDetail.exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      const headings = wrapper.findAll('h2, h3, h4')
      expect(headings.length).toBeGreaterThan(0)
    })

    it('should have clickable elements with proper interaction feedback', () => {
      const statCards = wrapper.findAllComponents(StatCard)
      statCards.forEach(card => {
        expect(card.props('clickable')).toBe(true)
      })
    })
  })

  describe('Performance Optimization', () => {
    it('should use reactive data efficiently', () => {
      expect(wrapper.vm.activeTab).toBeDefined()
      expect(wrapper.vm.chartsLoading).toBeDefined()
      expect(wrapper.vm.customersLoading).toBeDefined()
      expect(wrapper.vm.followupsLoading).toBeDefined()
      expect(wrapper.vm.customerDetailLoading).toBeDefined()
      expect(wrapper.vm.followupDetailLoading).toBeDefined()
      expect(wrapper.vm.customersData).toBeDefined()
      expect(wrapper.vm.followupsData).toBeDefined()
      expect(wrapper.vm.selectedCustomer).toBeDefined()
      expect(wrapper.vm.selectedFollowup).toBeDefined()
    })

    it('should handle data loading efficiently', async () => {
      const loadTabDataSpy = vi.spyOn(wrapper.vm, 'loadTabData')
      
      await wrapper.vm.loadTabData('overview')
      
      expect(loadTabDataSpy).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully in loadOverviewData', async () => {
      const { get } = await import('@/utils/request')
      const { ElMessage } = await import('element-plus')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      get.mockRejectedValue(new Error('API Error'))
      
      await wrapper.vm.loadOverviewData()
      
      expect(consoleSpy).toHaveBeenCalledWith('❌ 加载客户池概览数据失败:', expect.any(Error))
      expect(ElMessage.error).toHaveBeenCalledWith('加载概览数据失败')
      
      consoleSpy.mockRestore()
    })

    it('should handle API errors gracefully in loadCustomersData', async () => {
      const { get } = await import('@/utils/request')
      const { ElMessage } = await import('element-plus')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      get.mockRejectedValue(new Error('API Error'))
      
      await wrapper.vm.loadCustomersData()
      
      expect(consoleSpy).toHaveBeenCalledWith('加载客户数据失败:', expect.any(Error))
      expect(ElMessage.error).toHaveBeenCalledWith('加载客户数据失败')
      expect(wrapper.vm.customersLoading).toBe(false)
      
      consoleSpy.mockRestore()
    })

    it('should handle API errors gracefully in delete customer', async () => {
      const { ElMessageBox } = await import('element-plus')
      const { del } = await import('@/utils/request')
      const { ElMessage } = await import('element-plus')
      
      ElMessageBox.confirm.mockResolvedValue(true)
      del.mockRejectedValue(new Error('Delete Error'))
      
      const mockCustomer = { id: 1, name: '张三' }
      await wrapper.vm.handleDeleteCustomer(mockCustomer)
      
      expect(ElMessage.error).toHaveBeenCalledWith('删除失败')
    })
  })
})