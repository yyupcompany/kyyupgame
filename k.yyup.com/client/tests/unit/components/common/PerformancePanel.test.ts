import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import PerformancePanel from '@/components/common/PerformancePanel.vue'

// Mock external dependencies
vi.mock('@/utils/performance-monitor', () => ({
  performanceMonitor: {
    getPerformanceReport: vi.fn(),
    performOptimization: vi.fn()
  }
}))

vi.mock('@/utils/route-preloader', () => ({
  routePreloader: {
    clearCache: vi.fn(),
    getStats: vi.fn()
  }
}))

// Mock window.performance.memory
const mockPerformance = {
  memory: {
    usedJSHeapSize: 50 * 1024 * 1024 // 50MB
  }
}

describe('PerformancePanel', () => {
  let wrapper: any
  let mockPerformanceMonitor: any
  let mockRoutePreloader: any

  const mockReport = {
    currentScore: 85,
    averageLoadTime: 1500,
    cachePerformance: {
      hitRate: 92
    },
    alerts: [
      {
        timestamp: Date.now() - 30000,
        message: '内存使用过高',
        severity: 'high'
      },
      {
        timestamp: Date.now() - 120000,
        message: 'API响应缓慢',
        severity: 'medium'
      }
    ],
    recommendations: [
      '优化图片加载',
      '减少不必要的API调用',
      '使用缓存策略'
    ]
  }

  const mockRouteStats = {
    totalRoutes: 10,
    cachedRoutes: 8,
    averageLoadTime: 200
  }

  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks()
    
    // Setup mock implementations
    mockPerformanceMonitor = await import('@/utils/performance-monitor')
    mockPerformanceMonitor.performanceMonitor.getPerformanceReport.mockReturnValue(mockReport)
    mockPerformanceMonitor.performanceMonitor.performOptimization.mockResolvedValue({ success: true })

    mockRoutePreloader = await import('@/utils/route-preloader')
    mockRoutePreloader.routePreloader.clearCache.mockImplementation(() => {})
    mockRoutePreloader.routePreloader.getStats.mockReturnValue(mockRouteStats)

    // Mock window.performance
    Object.defineProperty(window, 'performance', {
      value: mockPerformance,
      writable: true
    })

    // Mock navigator
    Object.defineProperty(window, 'navigator', {
      value: {
        userAgent: 'Mozilla/5.0 (Test Browser)'
      },
      writable: true
    })

    // Mock URL and Blob for export functionality
    global.URL.createObjectURL = vi.fn(() => 'blob:test-url')
    global.URL.revokeObjectURL = vi.fn()
    global.Blob = vi.fn((content, options) => ({ content, options }))
    
    // Mock document.createElement
    const mockLink = {
      href: '',
      download: '',
      click: vi.fn()
    }
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        return mockLink
      }
      return {
        tagName,
        style: {},
        appendChild: vi.fn(),
        setAttribute: vi.fn()
      }
    })

    wrapper = mount(PerformancePanel, {
      props: {}
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    
    // Clean up timers
    vi.useFakeTimers()
    vi.runAllTimers()
    vi.useRealTimers()
  })

  describe('Component Rendering', () => {
    it('renders the performance panel correctly', () => {
      expect(wrapper.find('.performance-panel').exists()).toBe(true)
      expect(wrapper.find('.panel-header').exists()).toBe(true)
      expect(wrapper.find('.panel-content').exists()).toBe(true)
    })

    it('displays the correct header with title and close button', () => {
      const header = wrapper.find('.panel-header')
      expect(header.find('h3').text()).toBe('🚀 性能监控面板')
      expect(header.find('.close-btn').text()).toBe('×')
    })

    it('shows performance score section', () => {
      const scoreSection = wrapper.find('.score-section')
      expect(scoreSection.exists()).toBe(true)
      
      const scoreCircle = wrapper.find('.score-circle')
      expect(scoreCircle.classes()).toContain('good')
      expect(scoreCircle.find('.score-number').text()).toBe('85')
      expect(scoreCircle.find('.score-label').text()).toBe('分')
    })

    it('displays key metrics', () => {
      const metricsGrid = wrapper.find('.metrics-grid')
      expect(metricsGrid.exists()).toBe(true)
      
      const metrics = wrapper.findAll('.metric-item')
      expect(metrics.length).toBe(4)
      
      // Check page load time metric
      const pageLoadMetric = metrics[0]
      expect(pageLoadMetric.find('.metric-label').text()).toBe('页面加载')
      expect(pageLoadMetric.find('.metric-value').text()).toBe('1500ms')
      expect(pageLoadMetric.find('.metric-value').classes()).toContain('good')
    })

    it('shows recent alerts when available', () => {
      const alertsSection = wrapper.find('.alerts-section')
      expect(alertsSection.exists()).toBe(true)
      
      const alerts = wrapper.findAll('.alert-item')
      expect(alerts.length).toBe(2)
      
      expect(alerts[0].find('.alert-message').text()).toBe('内存使用过高')
      expect(alerts[0].classes()).toContain('alert-high')
    })

    it('displays optimization recommendations', () => {
      const recommendationsSection = wrapper.find('.recommendations-section')
      expect(recommendationsSection.exists()).toBe(true)
      
      const recommendations = wrapper.findAll('.recommendations-list li')
      expect(recommendations.length).toBe(3)
      expect(recommendations[0].text()).toBe('优化图片加载')
    })

    it('shows action buttons', () => {
      const actionsSection = wrapper.find('.actions-section')
      expect(actionsSection.exists()).toBe(true)
      
      const buttons = wrapper.findAll('.action-btn')
      expect(buttons.length).toBe(3)
      
      expect(buttons[0].text()).toBe('🔧 运行优化')
      expect(buttons[1].text()).toBe('🗑️ 清理缓存')
      expect(buttons[2].text()).toBe('📊 导出报告')
    })
  })

  describe('Computed Properties', () => {
    it('calculates score level correctly', async () => {
      // Test excellent score
      await wrapper.setData({ currentScore: 95 })
      expect(wrapper.vm.scoreLevel).toBe('excellent')
      
      // Test good score
      await wrapper.setData({ currentScore: 85 })
      expect(wrapper.vm.scoreLevel).toBe('good')
      
      // Test fair score
      await wrapper.setData({ currentScore: 60 })
      expect(wrapper.vm.scoreLevel).toBe('fair')
      
      // Test poor score
      await wrapper.setData({ currentScore: 40 })
      expect(wrapper.vm.scoreLevel).toBe('poor')
    })

    it('generates appropriate score descriptions', async () => {
      // Test excellent description
      await wrapper.setData({ currentScore: 95 })
      expect(wrapper.vm.scoreDescription).toBe('优秀 - 性能表现出色')
      
      // Test good description
      await wrapper.setData({ currentScore: 85 })
      expect(wrapper.vm.scoreDescription).toBe('良好 - 性能表现不错')
      
      // Test fair description
      await wrapper.setData({ currentScore: 60 })
      expect(wrapper.vm.scoreDescription).toBe('一般 - 有优化空间')
      
      // Test poor description
      await wrapper.setData({ currentScore: 40 })
      expect(wrapper.vm.scoreDescription).toBe('较差 - 需要立即优化')
    })

    it('evaluates metric classes correctly', () => {
      // Test lower-is-better metric (good when value <= threshold)
      expect(wrapper.vm.getMetricClass(1500, 2000)).toBe('good')
      expect(wrapper.vm.getMetricClass(2500, 2000)).toBe('poor')
      
      // Test higher-is-better metric (good when value >= threshold)
      expect(wrapper.vm.getMetricClass(85, 80, true)).toBe('good')
      expect(wrapper.vm.getMetricClass(75, 80, true)).toBe('poor')
    })
  })

  describe('Methods', () => {
    it('formats time correctly', () => {
      const now = Date.now()
      
      // Test "just now"
      expect(wrapper.vm.formatTime(now - 30000)).toBe('刚刚')
      
      // Test minutes ago
      expect(wrapper.vm.formatTime(now - 120000)).toBe('2分钟前')
      
      // Test hours ago
      expect(wrapper.vm.formatTime(now - 7200000)).toBe('2小时前')
    })

    it('updates performance data correctly', () => {
      wrapper.vm.updatePerformanceData()
      
      expect(mockPerformanceMonitor.performanceMonitor.getPerformanceReport).toHaveBeenCalled()
      expect(wrapper.vm.currentScore).toBe(85)
      expect(wrapper.vm.averageLoadTime).toBe(1500)
      expect(wrapper.vm.cacheHitRate).toBe(92)
      expect(wrapper.vm.memoryUsage).toBe(50)
      expect(wrapper.vm.recentAlerts).toEqual(mockReport.alerts)
      expect(wrapper.vm.recommendations).toEqual(mockReport.recommendations)
    })

    it('handles missing performance memory gracefully', () => {
      // Remove memory from performance object
      delete (window.performance as any).memory
      
      wrapper.vm.updatePerformanceData()
      
      expect(wrapper.vm.memoryUsage).toBe(0)
    })

    it('runs optimization successfully', async () => {
      await wrapper.vm.runOptimization()
      
      expect(wrapper.vm.isOptimizing).toBe(true)
      expect(mockPerformanceMonitor.performanceMonitor.performOptimization).toHaveBeenCalled()
      expect(mockPerformanceMonitor.performanceMonitor.getPerformanceReport).toHaveBeenCalled()
      expect(wrapper.vm.isOptimizing).toBe(false)
    })

    it('handles optimization failure', async () => {
      mockPerformanceMonitor.performanceMonitor.performOptimization.mockRejectedValue(new Error('Optimization failed'))
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      await wrapper.vm.runOptimization()
      
      expect(wrapper.vm.isOptimizing).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('❌ 性能优化失败:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })

    it('clears cache correctly', () => {
      const localStorageSpy = vi.spyOn(localStorage, 'removeItem')
      
      wrapper.vm.clearCache()
      
      expect(mockRoutePreloader.routePreloader.clearCache).toHaveBeenCalled()
      expect(localStorageSpy).toHaveBeenCalledWith('route_metrics')
      expect(localStorageSpy).toHaveBeenCalledWith('route_history')
      expect(mockPerformanceMonitor.performanceMonitor.getPerformanceReport).toHaveBeenCalled()
    })

    it('exports performance report correctly', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      wrapper.vm.exportReport()
      
      expect(mockPerformanceMonitor.performanceMonitor.getPerformanceReport).toHaveBeenCalled()
      expect(mockRoutePreloader.routePreloader.getStats).toHaveBeenCalled()
      expect(global.Blob).toHaveBeenCalledWith(expect.any(String), { type: 'application/json' })
      expect(global.URL.createObjectURL).toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalledWith('📊 性能报告已导出')
      
      consoleSpy.mockRestore()
    })
  })

  describe('Event Handling', () => {
    it('emits close event when close button is clicked', async () => {
      await wrapper.find('.close-btn').trigger('click')
      
      expect(wrapper.emitted('close')).toBeTruthy()
      expect(wrapper.emitted('close')).toHaveLength(1)
    })

    it('runs optimization when optimize button is clicked', async () => {
      const optimizeButton = wrapper.find('.action-btn.primary')
      await optimizeButton.trigger('click')
      
      expect(mockPerformanceMonitor.performanceMonitor.performOptimization).toHaveBeenCalled()
    })

    it('clears cache when clear cache button is clicked', async () => {
      const clearButton = wrapper.findAll('.action-btn.secondary')[0]
      await clearButton.trigger('click')
      
      expect(mockRoutePreloader.routePreloader.clearCache).toHaveBeenCalled()
    })

    it('exports report when export button is clicked', async () => {
      const exportButton = wrapper.findAll('.action-btn.secondary')[1]
      await exportButton.trigger('click')
      
      expect(mockPerformanceMonitor.performanceMonitor.getPerformanceReport).toHaveBeenCalled()
    })
  })

  describe('Lifecycle Hooks', () => {
    it('updates performance data on mount', () => {
      expect(mockPerformanceMonitor.performanceMonitor.getPerformanceReport).toHaveBeenCalled()
    })

    it('sets up update timer on mount', () => {
      vi.useFakeTimers()
      
      const wrapper = mount(PerformancePanel)
      
      // Check that timer is set
      vi.advanceTimersByTime(5000)
      
      expect(mockPerformanceMonitor.performanceMonitor.getPerformanceReport).toHaveBeenCalledTimes(2)
      
      wrapper.unmount()
      vi.useRealTimers()
    })

    it('clears timer on unmount', () => {
      vi.useFakeTimers()
      
      const wrapper = mount(PerformancePanel)
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
      
      wrapper.unmount()
      
      expect(clearIntervalSpy).toHaveBeenCalled()
      
      clearIntervalSpy.mockRestore()
      vi.useRealTimers()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty alerts gracefully', () => {
      mockPerformanceMonitor.performanceMonitor.getPerformanceReport.mockReturnValue({
        ...mockReport,
        alerts: []
      })
      
      wrapper.vm.updatePerformanceData()
      
      expect(wrapper.find('.alerts-section').exists()).toBe(false)
    })

    it('handles empty recommendations gracefully', () => {
      mockPerformanceMonitor.performanceMonitor.getPerformanceReport.mockReturnValue({
        ...mockReport,
        recommendations: []
      })
      
      wrapper.vm.updatePerformanceData()
      
      expect(wrapper.find('.recommendations-section').exists()).toBe(false)
    })

    it('handles missing cache performance data', () => {
      mockPerformanceMonitor.performanceMonitor.getPerformanceReport.mockReturnValue({
        ...mockReport,
        cachePerformance: undefined
      })
      
      wrapper.vm.updatePerformanceData()
      
      expect(wrapper.vm.cacheHitRate).toBe(90) // Default value
    })

    it('disables optimize button during optimization', async () => {
      // Mock long optimization
      mockPerformanceMonitor.performanceMonitor.performOptimization.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      )
      
      await wrapper.vm.runOptimization()
      
      const optimizeButton = wrapper.find('.action-btn.primary')
      expect(optimizeButton.attributes('disabled')).toBeDefined()
      expect(optimizeButton.text()).toBe('优化中...')
    })

    it('limits display of alerts and recommendations', () => {
      const manyAlerts = Array.from({ length: 10 }, (_, i) => ({
        timestamp: Date.now() - i * 60000,
        message: `Alert ${i + 1}`,
        severity: 'medium'
      }))
      
      const manyRecommendations = Array.from({ length: 10 }, (_, i) => `Recommendation ${i + 1}`)
      
      mockPerformanceMonitor.performanceMonitor.getPerformanceReport.mockReturnValue({
        ...mockReport,
        alerts: manyAlerts,
        recommendations: manyRecommendations
      })
      
      wrapper.vm.updatePerformanceData()
      
      const displayedAlerts = wrapper.findAll('.alert-item')
      const displayedRecommendations = wrapper.findAll('.recommendations-list li')
      
      expect(displayedAlerts.length).toBe(3) // Limited to 3
      expect(displayedRecommendations.length).toBe(3) // Limited to 3
    })
  })

  describe('Styling and Classes', () => {
    it('applies correct score circle classes based on score', async () => {
      const scoreCircle = wrapper.find('.score-circle')
      
      // Test excellent score
      await wrapper.setData({ currentScore: 95 })
      expect(scoreCircle.classes()).toContain('excellent')
      
      // Test good score
      await wrapper.setData({ currentScore: 85 })
      expect(scoreCircle.classes()).toContain('good')
      
      // Test fair score
      await wrapper.setData({ currentScore: 60 })
      expect(scoreCircle.classes()).toContain('fair')
      
      // Test poor score
      await wrapper.setData({ currentScore: 40 })
      expect(scoreCircle.classes()).toContain('poor')
    })

    it('applies correct alert severity classes', () => {
      const alerts = wrapper.findAll('.alert-item')
      
      expect(alerts[0].classes()).toContain('alert-high')
      expect(alerts[1].classes()).toContain('alert-medium')
    })

    it('applies metric value classes correctly', () => {
      const metricValues = wrapper.findAll('.metric-value')
      
      // Page load time (1500ms <= 2000ms threshold) should be good
      expect(metricValues[0].classes()).toContain('good')
      
      // API response time (200ms <= 500ms threshold) should be good
      expect(metricValues[3].classes()).toContain('good')
    })
  })
})