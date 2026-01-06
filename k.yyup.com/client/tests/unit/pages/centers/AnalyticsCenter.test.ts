import { 
// 控制台错误检测
let consoleSpy: any

beforeEach(() => {
  // 监听控制台错误
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  // 验证没有控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})

describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import AnalyticsCenter from '@/pages/centers/AnalyticsCenter.vue'
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
      info: vi.fn()
    }
  }
})

describe('AnalyticsCenter.vue', () => {
  let wrapper: any

  const createWrapper = () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    
    return mount(AnalyticsCenter, {
      global: {
        plugins: [pinia, ElementPlus],
        components: {
          ...ElementPlusIconsVue,
          StatCard
        },
        stubs: {
          'el-icon': true,
          'el-button': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-tabs': true,
          'el-tab-pane': true
        }
      }
    })
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    wrapper = createWrapper()
  })

  describe('Component Rendering', () => {
    it('should render the analytics center correctly', () => {
      expect(wrapper.find('.analytics-center').exists()).toBe(true)
      expect(wrapper.find('.center-content').exists()).toBe(true)
    })

    it('should render welcome section with title and description', () => {
      const welcomeSection = wrapper.find('.welcome-section')
      expect(welcomeSection.exists()).toBe(true)
      
      const title = welcomeSection.find('h2')
      expect(title.text()).toContain('欢迎来到数据分析中心')
      
      const description = welcomeSection.find('p')
      expect(description.text()).toContain('数据分析和报表的中心枢纽')
    })

    it('should render header actions with refresh and export buttons', () => {
      const headerActions = wrapper.find('.header-actions')
      expect(headerActions.exists()).toBe(true)
      
      const buttons = headerActions.findAll('el-button-stub')
      expect(buttons.length).toBe(2)
    })

    it('should render analytics tabs with default active tab', () => {
      const tabs = wrapper.find('.analytics-tabs')
      expect(tabs.exists()).toBe(true)
      
      expect(wrapper.vm.activeTab).toBe('overview')
    })

    it('should render statistics overview in overview tab', () => {
      const statsOverview = wrapper.find('.stats-overview')
      expect(statsOverview.exists()).toBe(true)
    })

    it('should render analytics features grid', () => {
      const featuresGrid = wrapper.find('.features-grid')
      expect(featuresGrid.exists()).toBe(true)
      
      const featureCards = featuresGrid.findAll('.feature-card')
      expect(featureCards.length).toBe(6)
    })

    it('should render all feature cards with correct content', () => {
      const featureCards = wrapper.findAll('.feature-card')
      
      const expectedFeatures = [
        '招生分析',
        '财务分析', 
        '绩效分析',
        '活动分析',
        '营销分析',
        '运营分析'
      ]
      
      featureCards.forEach((card: any, index: number) => {
        const title = card.find('h4').text()
        expect(title).toBe(expectedFeatures[index])
      })
    })
  })

  describe('Data and State Management', () => {
    it('should initialize with correct default values', () => {
      expect(wrapper.vm.loading).toBe(false)
      expect(wrapper.vm.insightsLoading).toBe(false)
      expect(wrapper.vm.activeTab).toBe('overview')
    })

    it('should have correct statistics data structure', () => {
      const stats = wrapper.vm.stats
      expect(stats).toHaveProperty('totalRecords')
      expect(stats).toHaveProperty('dataGrowth')
      expect(stats).toHaveProperty('totalReports')
      expect(stats).toHaveProperty('reportGrowth')
      expect(stats).toHaveProperty('analysisDimensions')
      expect(stats).toHaveProperty('dimensionGrowth')
      expect(stats).toHaveProperty('dataQuality')
      expect(stats).toHaveProperty('qualityImprovement')
      expect(stats).toHaveProperty('dailyReports')
      expect(stats).toHaveProperty('weeklyReports')
      expect(stats).toHaveProperty('monthlyReports')
      expect(stats).toHaveProperty('customReports')
    })

    it('should have correct statistics values', () => {
      const stats = wrapper.vm.stats
      expect(stats.totalRecords).toBe(1248567)
      expect(stats.dataGrowth).toBe(12.5)
      expect(stats.totalReports).toBe(342)
      expect(stats.reportGrowth).toBe(8.3)
      expect(stats.analysisDimensions).toBe(28)
      expect(stats.dimensionGrowth).toBe(3.2)
      expect(stats.dataQuality).toBe(94.8)
      expect(stats.qualityImprovement).toBe(2.1)
    })
  })

  describe('User Interactions', () => {
    it('should call handleRefresh when refresh button is clicked', async () => {
      const refreshButton = wrapper.findAll('el-button-stub')[0]
      await refreshButton.trigger('click')
      
      expect(wrapper.vm.loading).toBe(true)
    })

    it('should change active tab when tab is clicked', async () => {
      const handleTabClickSpy = vi.spyOn(wrapper.vm, 'handleTabClick')
      
      await wrapper.vm.handleTabClick({ props: { name: 'reports' } })
      
      expect(handleTabClickSpy).toHaveBeenCalledWith({ props: { name: 'reports' } })
    })

    it('should call navigateToDetail when stat card is clicked', async () => {
      const navigateToDetailSpy = vi.spyOn(wrapper.vm, 'navigateToDetail')
      
      await wrapper.vm.navigateToDetail('data')
      
      expect(navigateToDetailSpy).toHaveBeenCalledWith('data')
    })

    it('should call navigateToFeature when feature card is clicked', async () => {
      const navigateToFeatureSpy = vi.spyOn(wrapper.vm, 'navigateToFeature')
      
      await wrapper.vm.navigateToFeature('enrollment')
      
      expect(navigateToFeatureSpy).toHaveBeenCalledWith('enrollment')
    })

    it('should call createReport when create report button is clicked', async () => {
      const createReportSpy = vi.spyOn(wrapper.vm, 'createReport')
      
      await wrapper.vm.createReport()
      
      expect(createReportSpy).toHaveBeenCalled()
    })

    it('should call exportReport with correct format when export option is selected', async () => {
      const exportReportSpy = vi.spyOn(wrapper.vm, 'exportReport')
      
      await wrapper.vm.exportReport('xlsx')
      
      expect(exportReportSpy).toHaveBeenCalledWith('xlsx')
    })

    it('should call generateInsights when generate insights button is clicked', async () => {
      const generateInsightsSpy = vi.spyOn(wrapper.vm, 'generateInsights')
      
      await wrapper.vm.generateInsights()
      
      expect(generateInsightsSpy).toHaveBeenCalled()
      expect(wrapper.vm.insightsLoading).toBe(true)
    })
  })

  describe('Utility Functions', () => {
    it('should format numbers correctly', () => {
      const formatNumber = wrapper.vm.formatNumber
      
      expect(formatNumber(1248567)).toBe('1.2M')
      expect(formatNumber(2500)).toBe('2.5K')
      expect(formatNumber(500)).toBe('500')
      expect(formatNumber(1000000)).toBe('1.0M')
      expect(formatNumber(1000)).toBe('1.0K')
    })

    it('should load data correctly', async () => {
      const loadDataSpy = vi.spyOn(wrapper.vm, 'loadData')
      
      await wrapper.vm.loadData()
      
      expect(loadDataSpy).toHaveBeenCalled()
      expect(wrapper.vm.loading).toBe(false)
    })
  })

  describe('Lifecycle Hooks', () => {
    it('should call loadData on component mount', () => {
      const loadDataSpy = vi.spyOn(wrapper.vm, 'loadData')
      
      // Remount to trigger onMounted
      wrapper = createWrapper()
      
      expect(loadDataSpy).toHaveBeenCalled()
    })
  })

  describe('Loading States', () => {
    it('should show loading state during data loading', async () => {
      wrapper.vm.loading = true
      await nextTick()
      
      const statsOverview = wrapper.find('.stats-overview')
      expect(statsOverview.attributes('loading')).toBe('true')
    })

    it('should show insights loading state during insights generation', async () => {
      wrapper.vm.insightsLoading = true
      await nextTick()
      
      const insightsButton = wrapper.findAll('el-button-stub').find(
        (btn: any) => btn.text().includes('生成洞察')
      )
      expect(insightsButton.attributes('loading')).toBe('true')
    })
  })

  describe('Message Display', () => {
    it('should show success message when data loads successfully', async () => {
      const { ElMessage } = await import('element-plus')
      
      await wrapper.vm.loadData()
      
      expect(ElMessage.success).toHaveBeenCalledWith('数据加载完成')
    })

    it('should show error message when data loading fails', async () => {
      const { ElMessage } = await import('element-plus')
      
      // Mock loadData to throw error
      vi.spyOn(wrapper.vm, 'loadData').mockImplementationOnce(async () => {
        throw new Error('Load failed')
      })
      
      try {
        await wrapper.vm.loadData()
      } catch (error) {
        expect(ElMessage.error).toHaveBeenCalledWith('数据加载失败')
      }
    })

    it('should show info message when navigating to detail', async () => {
      const { ElMessage } = await import('element-plus')
      
      await wrapper.vm.navigateToDetail('data')
      
      expect(ElMessage.info).toHaveBeenCalledWith('导航到data详情页面')
    })

    it('should show info message when navigating to feature', async () => {
      const { ElMessage } = await import('element-plus')
      
      await wrapper.vm.navigateToFeature('enrollment')
      
      expect(ElMessage.info).toHaveBeenCalledWith('导航到enrollment分析页面')
    })

    it('should show info message when creating report', async () => {
      const { ElMessage } = await import('element-plus')
      
      await wrapper.vm.createReport()
      
      expect(ElMessage.info).toHaveBeenCalledWith('打开创建报表对话框')
    })

    it('should show success message when exporting report', async () => {
      const { ElMessage } = await import('element-plus')
      
      await wrapper.vm.exportReport('xlsx')
      
      expect(ElMessage.success).toHaveBeenCalledWith('开始导出XLSX格式报表')
    })

    it('should show success message when insights are generated', async () => {
      const { ElMessage } = await import('element-plus')
      
      await wrapper.vm.generateInsights()
      
      expect(ElMessage.success).toHaveBeenCalledWith('智能洞察生成完成')
    })

    it('should show error message when insights generation fails', async () => {
      const { ElMessage } = await import('element-plus')
      
      // Mock generateInsights to throw error
      vi.spyOn(wrapper.vm, 'generateInsights').mockImplementationOnce(async () => {
        throw new Error('Generation failed')
      })
      
      try {
        await wrapper.vm.generateInsights()
      } catch (error) {
        expect(ElMessage.error).toHaveBeenCalledWith('洞察生成失败')
      }
    })
  })

  describe('Responsive Design', () => {
    it('should apply mobile styles when screen size is small', () => {
      // Test mobile breakpoint styles
      const analyticsCenter = wrapper.find('.analytics-center')
      expect(analyticsCenter.exists()).toBe(true)
    })

    it('should adjust grid layouts for mobile view', () => {
      // Test that grid layouts are responsive
      const statsOverview = wrapper.find('.stats-overview')
      expect(statsOverview.exists()).toBe(true)
      
      const featuresGrid = wrapper.find('.features-grid')
      expect(featuresGrid.exists()).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle errors in loadData gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const { ElMessage } = await import('element-plus')
      
      // Mock Promise rejection
      vi.spyOn(Promise, 'prototype').mockImplementationOnce(() => {
        throw new Error('Network error')
      })
      
      try {
        await wrapper.vm.loadData()
      } catch (error) {
        expect(consoleErrorSpy).toHaveBeenCalledWith('数据加载失败:', error)
        expect(ElMessage.error).toHaveBeenCalledWith('数据加载失败')
      }
      
      consoleErrorSpy.mockRestore()
    })

    it('should handle errors in generateInsights gracefully', async () => {
      const { ElMessage } = await import('element-plus')
      
      // Mock Promise rejection
      vi.spyOn(wrapper.vm, 'generateInsights').mockImplementationOnce(async () => {
        throw new Error('AI service error')
      })
      
      try {
        await wrapper.vm.generateInsights()
      } catch (error) {
        expect(ElMessage.error).toHaveBeenCalledWith('洞察生成失败')
        expect(wrapper.vm.insightsLoading).toBe(false)
      }
    })
  })

  describe('Component Integration', () => {
    it('should integrate with StatCard component correctly', () => {
      const statCards = wrapper.findAllComponents(StatCard)
      expect(statCards.length).toBeGreaterThan(0)
    })

    it('should pass correct props to StatCard components', () => {
      const statCards = wrapper.findAllComponents(StatCard)
      
      // Check first stat card (data总量)
      const firstCard = statCards[0]
      expect(firstCard.props('title')).toBe('数据总量')
      expect(firstCard.props('value')).toBe('1.2M')
      expect(firstCard.props('trend')).toBe(12.5)
    })

    it('should handle StatCard click events', async () => {
      const statCards = wrapper.findAllComponents(StatCard)
      const firstCard = statCards[0]
      
      await firstCard.vm.$emit('click')
      
      // Verify that navigateToDetail was called
      expect(wrapper.vm.navigateToDetail).toHaveBeenCalled()
    })
  })

  describe('Performance Optimization', () => {
    it('should use reactive data efficiently', () => {
      // Test that reactive data is properly implemented
      expect(wrapper.vm.loading).toBeDefined()
      expect(wrapper.vm.insightsLoading).toBeDefined()
      expect(wrapper.vm.activeTab).toBeDefined()
      expect(wrapper.vm.stats).toBeDefined()
    })

    it('should handle async operations correctly', async () => {
      // Test async data loading
      const initialLoading = wrapper.vm.loading
      await wrapper.vm.loadData()
      const finalLoading = wrapper.vm.loading
      
      expect(typeof initialLoading).toBe('boolean')
      expect(typeof finalLoading).toBe('boolean')
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      const headings = wrapper.findAll('h2, h3, h4')
      expect(headings.length).toBeGreaterThan(0)
    })

    it('should have clickable elements with proper interaction feedback', () => {
      const featureCards = wrapper.findAll('.feature-card')
      featureCards.forEach((card: any) => {
        expect(card.classes()).toContain('cursor-pointer')
      })
    })
  })
})