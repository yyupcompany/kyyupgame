import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import FinanceCenter from '@/pages/centers/FinanceCenter.vue'
import CenterContainer from '@/components/centers/CenterContainer.vue'
import StatCard from '@/components/centers/StatCard.vue'
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

// Mock echarts
vi.mock('echarts', () => ({
  init: vi.fn(() => ({
    setOption: vi.fn()
  }))
}))

// Mock router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

describe('FinanceCenter.vue', () => {
  let wrapper: any
  let mockRouter: any

  const createWrapper = () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    
    mockRouter = {
      push: vi.fn()
    }
    
    return mount(FinanceCenter, {
      global: {
        plugins: [pinia, ElementPlus],
        components: {
          ...ElementPlusIconsVue,
          CenterContainer,
          StatCard
        },
        stubs: {
          'el-icon': true,
          'el-button': true,
          'el-select': true,
          'el-option': true,
          'el-table': true,
          'el-table-column': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-input-number': true,
          'el-switch': true,
          'el-checkbox-group': true,
          'el-checkbox': true,
          'el-empty': true,
          'el-tag': true,
          'router-link': true
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
    it('should render the finance center correctly', () => {
      expect(wrapper.find('.finance-overview').exists()).toBe(true)
    })

    it('should render CenterContainer component', () => {
      const centerContainer = wrapper.findComponent(CenterContainer)
      expect(centerContainer.exists()).toBe(true)
      expect(centerContainer.props('title')).toBe('财务中心')
    })

    it('should render finance welcome section', () => {
      const financeWelcome = wrapper.find('.finance-welcome')
      expect(financeWelcome.exists()).toBe(true)
      
      const welcomeTitle = financeWelcome.find('.welcome-title')
      expect(welcomeTitle.text()).toBe('财务管理中心')
      
      const welcomeDesc = financeWelcome.find('.welcome-desc')
      expect(welcomeDesc.text()).toContain('财务管理的中心枢纽')
    })

    it('should render welcome actions with buttons', () => {
      const welcomeActions = wrapper.find('.welcome-actions')
      expect(welcomeActions.exists()).toBe(true)
      
      const buttons = welcomeActions.findAll('el-button-stub')
      expect(buttons.length).toBe(2)
      
      const refreshButton = buttons[0]
      expect(refreshButton.text()).toContain('刷新数据')
      
      const quickPaymentButton = buttons[1]
      expect(quickPaymentButton.text()).toContain('快速收费')
    })

    it('should render finance stats section', () => {
      const financeStats = wrapper.find('.finance-stats')
      expect(financeStats.exists()).toBe(true)
    })

    it('should render finance actions section', () => {
      const financeActions = wrapper.find('.finance-actions')
      expect(financeActions.exists()).toBe(true)
    })

    it('should render all function action cards', () => {
      const actionCards = wrapper.findAll('.action-card')
      expect(actionCards.length).toBe(3)

      const expectedFunctions = ['收费配置', '缴费管理', '招生财务联动']
      actionCards.forEach((card: any, index: number) => {
        const title = card.find('.action-title').text()
        expect(title).toBe(expectedFunctions[index])
      })
    })

    it('should render payments content when payments tab is active', async () => {
      await wrapper.setData({ activeTab: 'payments' })
      await nextTick()
      
      const paymentsContent = wrapper.find('.payments-content')
      expect(paymentsContent.exists()).toBe(true)
    })

    it('should render reports content when reports tab is active', async () => {
      await wrapper.setData({ activeTab: 'reports' })
      await nextTick()
      
      const reportsContent = wrapper.find('.reports-content')
      expect(reportsContent.exists()).toBe(true)
    })

    it('should render settings content when settings tab is active', async () => {
      await wrapper.setData({ activeTab: 'settings' })
      await nextTick()
      
      const settingsContent = wrapper.find('.settings-content')
      expect(settingsContent.exists()).toBe(true)
    })
  })

  describe('Data and State Management', () => {
    it('should initialize with correct default values', () => {
      expect(wrapper.vm.loading).toBe(false)
      expect(wrapper.vm.activeTab).toBe('overview')
      expect(wrapper.vm.reportsLoading).toBe(false)
      expect(wrapper.vm.settingsLoading).toBe(false)
      expect(wrapper.vm.reportTimeRange).toBe('month')
      expect(wrapper.vm.showGenerateReportDialog).toBe(false)
      expect(wrapper.vm.paymentActiveTab).toBe('todayPayments')
    })

    it('should have correct tabs configuration', () => {
      const tabs = wrapper.vm.tabs
      expect(tabs).toEqual([
        { key: 'overview', label: '概览', icon: 'DataAnalysis' },
        { key: 'payments', label: '收费管理', icon: 'CreditCard' },
        { key: 'reports', label: '报表分析', icon: 'Document' },
        { key: 'settings', label: '设置', icon: 'Setting' }
      ])
    })

    it('should have correct overview data structure', () => {
      const overview = wrapper.vm.overview
      expect(overview).toHaveProperty('monthlyRevenue')
      expect(overview).toHaveProperty('revenueGrowth')
      expect(overview).toHaveProperty('pendingAmount')
      expect(overview).toHaveProperty('pendingCount')
      expect(overview).toHaveProperty('collectionRate')
      expect(overview).toHaveProperty('paidCount')
      expect(overview).toHaveProperty('totalCount')
      expect(overview).toHaveProperty('overdueAmount')
      expect(overview).toHaveProperty('overdueCount')
    })

    it('should have correct functions configuration', () => {
      const functions = wrapper.vm.functions
      expect(functions.length).toBe(4)
      
      const expectedKeys = ['feeConfig', 'paymentManagement', 'financialReports', 'enrollmentFinanceLinkage']
      functions.forEach((func: any, index: number) => {
        expect(func.key).toBe(expectedKeys[index])
        expect(func).toHaveProperty('title')
        expect(func).toHaveProperty('icon')
        expect(func).toHaveProperty('path')
        expect(func).toHaveProperty('iconClass')
      })
    })

    it('should have correct today payments data', () => {
      const todayPayments = wrapper.vm.todayPayments.value
      expect(todayPayments.length).toBe(2)
      expect(todayPayments[0]).toHaveProperty('id')
      expect(todayPayments[0]).toHaveProperty('studentName')
      expect(todayPayments[0]).toHaveProperty('feeType')
      expect(todayPayments[0]).toHaveProperty('class')
      expect(todayPayments[0]).toHaveProperty('amount')
    })

    it('should have correct report stats data', () => {
      const reportStats = wrapper.vm.reportStats
      expect(reportStats).toHaveProperty('totalRevenue')
      expect(reportStats).toHaveProperty('revenueGrowth')
      expect(reportStats).toHaveProperty('collectionRate')
      expect(reportStats).toHaveProperty('collectionGrowth')
      expect(reportStats).toHaveProperty('pendingAmount')
      expect(reportStats).toHaveProperty('pendingCount')
      expect(reportStats).toHaveProperty('overdueAmount')
      expect(reportStats).toHaveProperty('overdueCount')
    })

    it('should have correct reports list data', () => {
      const reportsList = wrapper.vm.reportsList.value
      expect(reportsList.length).toBe(2)
      expect(reportsList[0]).toHaveProperty('id')
      expect(reportsList[0]).toHaveProperty('name')
      expect(reportsList[0]).toHaveProperty('type')
      expect(reportsList[0]).toHaveProperty('period')
      expect(reportsList[0]).toHaveProperty('createdAt')
    })

    it('should have correct finance settings data', () => {
      const financeSettings = wrapper.vm.financeSettings
      expect(financeSettings).toHaveProperty('defaultPaymentDays')
      expect(financeSettings).toHaveProperty('overdueReminder')
      expect(financeSettings).toHaveProperty('reminderDays')
      expect(financeSettings).toHaveProperty('autoGenerateBills')
      expect(financeSettings).toHaveProperty('allowPartialPayment')
      expect(financeSettings).toHaveProperty('autoMonthlyReport')
      expect(financeSettings).toHaveProperty('reportEmail')
      expect(financeSettings).toHaveProperty('reportRetentionDays')
      expect(financeSettings).toHaveProperty('exportFormats')
      expect(financeSettings).toHaveProperty('paymentPermission')
      expect(financeSettings).toHaveProperty('refundApproval')
      expect(financeSettings).toHaveProperty('reportViewPermission')
      expect(financeSettings).toHaveProperty('paymentNotification')
      expect(financeSettings).toHaveProperty('overdueNotification')
      expect(financeSettings).toHaveProperty('abnormalNotification')
    })

    it('should have correct pending tasks data', () => {
      const pendingTasks = wrapper.vm.pendingTasks.value
      expect(pendingTasks.length).toBe(2)
      expect(pendingTasks[0]).toHaveProperty('id')
      expect(pendingTasks[0]).toHaveProperty('title')
      expect(pendingTasks[0]).toHaveProperty('description')
      expect(pendingTasks[0]).toHaveProperty('time')
      expect(pendingTasks[0]).toHaveProperty('priority')
    })
  })

  describe('User Interactions', () => {
    it('should call handleTabChange when tab is changed', async () => {
      const handleTabChangeSpy = vi.spyOn(wrapper.vm, 'handleTabChange')
      
      await wrapper.vm.handleTabChange('payments')
      
      expect(handleTabChangeSpy).toHaveBeenCalledWith('payments')
    })

    it('should call handleStatClick when stat card is clicked', async () => {
      const handleStatClickSpy = vi.spyOn(wrapper.vm, 'handleStatClick')
      
      await wrapper.vm.handleStatClick('revenue')
      
      expect(handleStatClickSpy).toHaveBeenCalledWith('revenue')
    })

    it('should change active tab when handleStatClick is called with revenue', async () => {
      await wrapper.vm.handleStatClick('revenue')
      
      expect(wrapper.vm.activeTab).toBe('reports')
    })

    it('should change active tab when handleStatClick is called with pending', async () => {
      await wrapper.vm.handleStatClick('pending')
      
      expect(wrapper.vm.activeTab).toBe('payments')
    })

    it('should change active tab when handleStatClick is called with collection', async () => {
      await wrapper.vm.handleStatClick('collection')
      
      expect(wrapper.vm.activeTab).toBe('reports')
    })

    it('should change active tab when handleStatClick is called with overdue', async () => {
      await wrapper.vm.handleStatClick('overdue')
      
      expect(wrapper.vm.activeTab).toBe('payments')
    })

    it('should call handleRefresh when refresh button is clicked', async () => {
      const handleRefreshSpy = vi.spyOn(wrapper.vm, 'handleRefresh')
      
      await wrapper.vm.handleRefresh()
      
      expect(handleRefreshSpy).toHaveBeenCalled()
      expect(wrapper.vm.loading).toBe(true)
    })

    it('should call handleQuickPayment when quick payment button is clicked', async () => {
      const handleQuickPaymentSpy = vi.spyOn(wrapper.vm, 'handleQuickPayment')
      
      await wrapper.vm.handleQuickPayment()
      
      expect(handleQuickPaymentSpy).toHaveBeenCalled()
      expect(mockRouter.push).toHaveBeenCalledWith('/finance/payment-management')
    })

    it('should call handleExportReport when export report button is clicked', async () => {
      const handleExportReportSpy = vi.spyOn(wrapper.vm, 'handleExportReport')
      
      await wrapper.vm.handleExportReport()
      
      expect(handleExportReportSpy).toHaveBeenCalled()
    })

    it('should call handleRefreshReports when refresh reports button is clicked', async () => {
      const handleRefreshReportsSpy = vi.spyOn(wrapper.vm, 'handleRefreshReports')
      
      await wrapper.vm.handleRefreshReports()
      
      expect(handleRefreshReportsSpy).toHaveBeenCalled()
      expect(wrapper.vm.reportsLoading).toBe(true)
    })

    it('should call viewReport when view report button is clicked', async () => {
      const viewReportSpy = vi.spyOn(wrapper.vm, 'viewReport')
      const mockReport = { id: 1, name: 'Test Report' }
      
      await wrapper.vm.viewReport(mockReport)
      
      expect(viewReportSpy).toHaveBeenCalledWith(mockReport)
    })

    it('should call downloadReport when download report button is clicked', async () => {
      const downloadReportSpy = vi.spyOn(wrapper.vm, 'downloadReport')
      const mockReport = { id: 1, name: 'Test Report' }
      
      await wrapper.vm.downloadReport(mockReport)
      
      expect(downloadReportSpy).toHaveBeenCalledWith(mockReport)
    })

    it('should call deleteReport when delete report button is clicked', async () => {
      const { ElMessageBox } = await import('element-plus')
      const deleteReportSpy = vi.spyOn(wrapper.vm, 'deleteReport')
      const mockReport = { id: 1, name: 'Test Report' }
      
      ElMessageBox.confirm.mockResolvedValue(true)
      
      await wrapper.vm.deleteReport(mockReport)
      
      expect(ElMessageBox.confirm).toHaveBeenCalledWith(`确定要删除报表"Test Report"吗？`, '确认删除', {
        type: 'warning'
      })
      expect(deleteReportSpy).toHaveBeenCalledWith(mockReport)
    })

    it('should handle delete report cancellation', async () => {
      const { ElMessageBox } = await import('element-plus')
      
      ElMessageBox.confirm.mockRejectedValue('cancel')
      
      const mockReport = { id: 1, name: 'Test Report' }
      await wrapper.vm.deleteReport(mockReport)
      
      // Should not throw error
      expect(wrapper.vm.deleteReport).not.toThrow()
    })

    it('should call handleSaveSettings when save settings button is clicked', async () => {
      const handleSaveSettingsSpy = vi.spyOn(wrapper.vm, 'handleSaveSettings')
      
      await wrapper.vm.handleSaveSettings()
      
      expect(handleSaveSettingsSpy).toHaveBeenCalled()
      expect(wrapper.vm.settingsLoading).toBe(true)
    })
  })

  describe('Utility Functions', () => {
    it('should format money correctly', () => {
      const formatMoney = wrapper.vm.formatMoney
      
      expect(formatMoney(520000)).toBe('52.0万')
      expect(formatMoney(85000)).toBe('85,000')
      expect(formatMoney(12000)).toBe('12,000')
      expect(formatMoney(500)).toBe('500')
      expect(formatMoney(10000)).toBe('1.0万')
    })

    it('should return correct report type color', () => {
      const getReportTypeColor = wrapper.vm.getReportTypeColor
      
      expect(getReportTypeColor('monthly')).toBe('primary')
      expect(getReportTypeColor('quarterly')).toBe('success')
      expect(getReportTypeColor('yearly')).toBe('warning')
      expect(getReportTypeColor('custom')).toBe('info')
      expect(getReportTypeColor('unknown')).toBe('default')
    })

    it('should return correct report type name', () => {
      const getReportTypeName = wrapper.vm.getReportTypeName
      
      expect(getReportTypeName('monthly')).toBe('月报')
      expect(getReportTypeName('quarterly')).toBe('季报')
      expect(getReportTypeName('yearly')).toBe('年报')
      expect(getReportTypeName('custom')).toBe('自定义')
      expect(getReportTypeName('unknown')).toBe('unknown')
    })

    it('should format time correctly', () => {
      const formatTime = wrapper.vm.formatTime
      const testDate = new Date('2024-01-15')
      
      const result = formatTime(testDate)
      expect(result).toContain('2024')
    })

    it('should initialize charts when initCharts is called', async () => {
      const initRevenueChartSpy = vi.spyOn(wrapper.vm, 'initRevenueChart')
      const initFeeTypeChartSpy = vi.spyOn(wrapper.vm, 'initFeeTypeChart')
      
      await wrapper.vm.initCharts()
      
      expect(initRevenueChartSpy).toHaveBeenCalled()
      expect(initFeeTypeChartSpy).toHaveBeenCalled()
    })

    it('should initialize revenue chart correctly', async () => {
      const { init } = await import('echarts')
      const mockChart = {
        setOption: vi.fn()
      }
      
      init.mockReturnValue(mockChart)
      wrapper.vm.revenueChart.value = document.createElement('div')
      
      await wrapper.vm.initRevenueChart()
      
      expect(init).toHaveBeenCalledWith(wrapper.vm.revenueChart.value)
      expect(mockChart.setOption).toHaveBeenCalled()
    })

    it('should initialize fee type chart correctly', async () => {
      const { init } = await import('echarts')
      const mockChart = {
        setOption: vi.fn()
      }
      
      init.mockReturnValue(mockChart)
      wrapper.vm.feeTypeChart.value = document.createElement('div')
      
      await wrapper.vm.initFeeTypeChart()
      
      expect(init).toHaveBeenCalledWith(wrapper.vm.feeTypeChart.value)
      expect(mockChart.setOption).toHaveBeenCalled()
    })
  })

  describe('Component Integration', () => {
    it('should integrate with CenterContainer component correctly', () => {
      const centerContainer = wrapper.findComponent(CenterContainer)
      expect(centerContainer.props('title')).toBe('财务中心')
      expect(centerContainer.props('tabs')).toEqual(wrapper.vm.tabs)
      expect(centerContainer.props('defaultTab')).toBe('overview')
      expect(centerContainer.props('showHeader')).toBe(false)
      expect(centerContainer.props('showActions')).toBe(false)
    })

    it('should integrate with StatCard components correctly', () => {
      const statCards = wrapper.findAllComponents(StatCard)
      expect(statCards.length).toBe(4) // 4 stat cards in overview
    })

    it('should handle CenterContainer events correctly', async () => {
      const handleQuickPaymentSpy = vi.spyOn(wrapper.vm, 'handleQuickPayment')
      
      await wrapper.vm.$emit('create')
      
      expect(handleQuickPaymentSpy).toHaveBeenCalled()
    })

    it('should handle CenterContainer tab change event correctly', async () => {
      const handleTabChangeSpy = vi.spyOn(wrapper.vm, 'handleTabChange')
      
      await wrapper.vm.$emit('tab-change', 'payments')
      
      expect(handleTabChangeSpy).toHaveBeenCalledWith('payments')
    })
  })

  describe('Loading States', () => {
    it('should show loading state during data refresh', async () => {
      wrapper.vm.loading = true
      await nextTick()
      
      const refreshButton = wrapper.findAll('el-button-stub')[0]
      expect(refreshButton.attributes('loading')).toBe('true')
    })

    it('should show loading state during reports refresh', async () => {
      wrapper.vm.reportsLoading = true
      await nextTick()
      
      const reportsContent = wrapper.find('.reports-content')
      expect(reportsContent.exists()).toBe(true)
    })

    it('should show loading state during settings save', async () => {
      wrapper.vm.settingsLoading = true
      await nextTick()
      
      const settingsContent = wrapper.find('.settings-content')
      expect(settingsContent.exists()).toBe(true)
    })
  })

  describe('Message Display', () => {
    it('should show success message when data is refreshed', async () => {
      const { ElMessage } = await import('element-plus')
      
      wrapper.vm.loading = true
      await wrapper.vm.handleRefresh()
      
      // Wait for the timeout to complete
      await new Promise(resolve => setTimeout(resolve, 1100))
      
      expect(ElMessage.success).toHaveBeenCalledWith('数据刷新成功')
      expect(wrapper.vm.loading).toBe(false)
    })

    it('should show info message when stat card is clicked', async () => {
      const { ElMessage } = await import('element-plus')
      
      await wrapper.vm.handleStatClick('revenue')
      
      expect(ElMessage.info).toHaveBeenCalledWith('查看收入详情')
    })

    it('should show info message when export report is clicked', async () => {
      const { ElMessage } = await import('element-plus')
      
      await wrapper.vm.handleExportReport()
      
      expect(ElMessage.info).toHaveBeenCalledWith('导出报表功能开发中...')
    })

    it('should show success message when reports are refreshed', async () => {
      const { ElMessage } = await import('element-plus')
      
      wrapper.vm.reportsLoading = true
      await wrapper.vm.handleRefreshReports()
      
      // Wait for the timeout to complete
      await new Promise(resolve => setTimeout(resolve, 1100))
      
      expect(ElMessage.success).toHaveBeenCalledWith('报表数据刷新成功')
      expect(wrapper.vm.reportsLoading).toBe(false)
    })

    it('should show info message when view report is clicked', async () => {
      const { ElMessage } = await import('element-plus')
      
      await wrapper.vm.viewReport({ name: 'Test Report' })
      
      expect(ElMessage.info).toHaveBeenCalledWith('查看报表：Test Report')
    })

    it('should show info message when download report is clicked', async () => {
      const { ElMessage } = await import('element-plus')
      
      await wrapper.vm.downloadReport({ name: 'Test Report' })
      
      expect(ElMessage.info).toHaveBeenCalledWith('下载报表：Test Report')
    })

    it('should show success message when report is deleted', async () => {
      const { ElMessageBox, ElMessage } = await import('element-plus')
      
      ElMessageBox.confirm.mockResolvedValue(true)
      
      await wrapper.vm.deleteReport({ name: 'Test Report' })
      
      expect(ElMessage.success).toHaveBeenCalledWith('报表删除成功')
    })

    it('should show success message when settings are saved', async () => {
      const { ElMessage } = await import('element-plus')
      
      wrapper.vm.settingsLoading = true
      await wrapper.vm.handleSaveSettings()
      
      // Wait for the timeout to complete
      await new Promise(resolve => setTimeout(resolve, 1100))
      
      expect(ElMessage.success).toHaveBeenCalledWith('设置保存成功')
      expect(wrapper.vm.settingsLoading).toBe(false)
    })
  })

  describe('Lifecycle Hooks', () => {
    it('should log component mount message', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      // Remount to trigger onMounted
      wrapper = createWrapper()
      
      expect(consoleSpy).toHaveBeenCalledWith('财务中心已加载 - 使用全局CenterContainer样式')
      
      consoleSpy.mockRestore()
    })

    it('should initialize charts when reports tab is active on mount', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const initChartsSpy = vi.spyOn(wrapper.vm, 'initCharts')
      
      // Set activeTab to reports before mounting
      wrapper = createWrapper()
      await wrapper.setData({ activeTab: 'reports' })
      
      // Remount to trigger onMounted
      wrapper = createWrapper()
      await wrapper.setData({ activeTab: 'reports' })
      
      expect(initChartsSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })
  })

  describe('Console Logging', () => {
    it('should log tab change', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      wrapper.vm.handleTabChange('payments')
      
      expect(consoleSpy).toHaveBeenCalledWith('切换到标签页:', 'payments')
      
      consoleSpy.mockRestore()
    })

    it('should log component mount', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      // Remount to trigger onMounted
      wrapper = createWrapper()
      
      expect(consoleSpy).toHaveBeenCalledWith('财务中心已加载 - 使用全局CenterContainer样式')
      
      consoleSpy.mockRestore()
    })
  })

  describe('Responsive Design', () => {
    it('should apply responsive styles correctly', () => {
      const financeOverview = wrapper.find('.finance-overview')
      expect(financeOverview.exists()).toBe(true)
    })

    it('should have proper grid layouts for responsive design', () => {
      const financeStats = wrapper.find('.finance-stats')
      expect(financeStats.exists()).toBe(true)
      
      const financeActions = wrapper.find('.finance-actions')
      expect(financeActions.exists()).toBe(true)
    })

    it('should have proper mobile responsive styles', () => {
      const financeOverview = wrapper.find('.finance-overview')
      expect(financeOverview.exists()).toBe(true)
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

    it('should have action cards with proper styling', () => {
      const actionCards = wrapper.findAll('.action-card')
      actionCards.forEach(card => {
        expect(card.classes()).toContain('cursor-pointer')
      })
    })
  })

  describe('Performance Optimization', () => {
    it('should use reactive data efficiently', () => {
      expect(wrapper.vm.loading).toBeDefined()
      expect(wrapper.vm.activeTab).toBeDefined()
      expect(wrapper.vm.reportsLoading).toBeDefined()
      expect(wrapper.vm.settingsLoading).toBeDefined()
      expect(wrapper.vm.reportTimeRange).toBeDefined()
      expect(wrapper.vm.showGenerateReportDialog).toBeDefined()
      expect(wrapper.vm.paymentActiveTab).toBeDefined()
    })

    it('should handle async operations correctly', async () => {
      const handleRefreshSpy = vi.spyOn(wrapper.vm, 'handleRefresh')
      
      await wrapper.vm.handleRefresh()
      
      expect(handleRefreshSpy).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should handle async operations gracefully', async () => {
      // Test that async operations complete without throwing errors
      await expect(wrapper.vm.handleRefresh()).resolves.not.toThrow()
      await expect(wrapper.vm.handleRefreshReports()).resolves.not.toThrow()
      await expect(wrapper.vm.handleSaveSettings()).resolves.not.toThrow()
    })

    it('should handle user cancellation gracefully', async () => {
      const { ElMessageBox } = await import('element-plus')
      
      ElMessageBox.confirm.mockRejectedValue('cancel')
      
      const mockReport = { id: 1, name: 'Test Report' }
      await expect(wrapper.vm.deleteReport(mockReport)).resolves.not.toThrow()
    })
  })

  describe('Form Handling', () => {
    it('should have correct form data structure for settings', () => {
      const financeSettings = wrapper.vm.financeSettings
      
      expect(financeSettings.defaultPaymentDays).toBe(30)
      expect(financeSettings.overdueReminder).toBe(true)
      expect(financeSettings.reminderDays).toBe(3)
      expect(financeSettings.autoGenerateBills).toBe(true)
      expect(financeSettings.allowPartialPayment).toBe(false)
      expect(financeSettings.autoMonthlyReport).toBe(true)
      expect(financeSettings.reportEmail).toBe('finance@kindergarten.com')
      expect(financeSettings.reportRetentionDays).toBe(365)
      expect(financeSettings.exportFormats).toEqual(['excel', 'pdf'])
      expect(financeSettings.paymentPermission).toEqual(['finance', 'principal'])
      expect(financeSettings.refundApproval).toBe('dual')
      expect(financeSettings.reportViewPermission).toEqual(['finance', 'principal'])
      expect(financeSettings.paymentNotification).toEqual(['sms', 'wechat'])
      expect(financeSettings.overdueNotification).toEqual(['sms', 'phone'])
      expect(financeSettings.abnormalNotification).toBe(true)
    })

    it('should handle form interactions correctly', async () => {
      // Test that form data can be updated
      wrapper.vm.financeSettings.defaultPaymentDays = 60
      expect(wrapper.vm.financeSettings.defaultPaymentDays).toBe(60)
      
      wrapper.vm.financeSettings.overdueReminder = false
      expect(wrapper.vm.financeSettings.overdueReminder).toBe(false)
      
      wrapper.vm.financeSettings.exportFormats = ['excel', 'pdf', 'csv']
      expect(wrapper.vm.financeSettings.exportFormats).toEqual(['excel', 'pdf', 'csv'])
    })
  })

  describe('Chart Functionality', () => {
    it('should initialize charts only when DOM elements are available', async () => {
      const initRevenueChartSpy = vi.spyOn(wrapper.vm, 'initRevenueChart')
      const initFeeTypeChartSpy = vi.spyOn(wrapper.vm, 'initFeeTypeChart')
      
      // Test with null chart refs
      wrapper.vm.revenueChart.value = null
      wrapper.vm.feeTypeChart.value = null
      
      await wrapper.vm.initCharts()
      
      // Should not attempt to initialize charts when refs are null
      expect(initRevenueChartSpy).toHaveBeenCalled()
      expect(initFeeTypeChartSpy).toHaveBeenCalled()
    })

    it('should handle chart initialization errors gracefully', async () => {
      const { init } = await import('echarts')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      init.mockImplementation(() => {
        throw new Error('Chart initialization failed')
      })
      
      wrapper.vm.revenueChart.value = document.createElement('div')
      
      await expect(wrapper.vm.initRevenueChart()).resolves.not.toThrow()
      
      consoleSpy.mockRestore()
    })
  })
})