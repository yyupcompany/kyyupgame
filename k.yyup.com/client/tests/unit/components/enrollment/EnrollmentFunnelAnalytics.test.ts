import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import EnrollmentFunnelAnalytics from '@/components/enrollment/EnrollmentFunnelAnalytics.vue'
import { useEnrollmentStore } from '@/stores/enrollment'

// Mock the enrollment store
vi.mock('@/stores/enrollment', () => ({
  useEnrollmentStore: vi.fn(() => ({
    funnelData: [],
    conversionRates: {},
    bottlenecks: [],
    trackConversionRates: vi.fn(),
    identifyBottlenecks: vi.fn(),
    generateFunnelVisualization: vi.fn(),
    loading: false,
    error: null
  }))
}))

// 控制台错误检测变量
let consoleSpy: any

describe('EnrollmentFunnelAnalytics', () => {
  let wrapper: any
  let enrollmentStore: any

  beforeEach(() => {
    enrollmentStore = useEnrollmentStore()
    wrapper = mount(EnrollmentFunnelAnalytics)
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  afterEach(() => {
    wrapper.unmount()
    vi.clearAllMocks()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('Component Rendering', () => {
    it('should render enrollment funnel analytics component correctly', () => {
      expect(wrapper.find('[data-testid="funnel-analytics"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="funnel-chart"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="conversion-rates"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="bottleneck-analysis"]').exists()).toBe(true)
    })

    it('should display loading state during data processing', async () => {
      enrollmentStore.loading = true
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('[data-testid="loading-spinner"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="funnel-chart"]').exists()).toBe(false)
    })

    it('should display error message when analytics fail', async () => {
      enrollmentStore.error = 'Failed to load funnel data'
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('[data-testid="error-message"]').text()).toContain('Failed to load funnel data')
    })
  })

  describe('Funnel Data Processing', () => {
    it('should track conversion rates at each stage', async () => {
      const mockFunnelData = [
        { stage: 'Inquiry', count: 1000, percentage: 100 },
        { stage: 'Application', count: 750, percentage: 75 },
        { stage: 'Interview', count: 500, percentage: 50 },
        { stage: 'Acceptance', count: 350, percentage: 35 },
        { stage: 'Enrollment', count: 300, percentage: 30 }
      ]

      const mockConversionRates = {
        'Inquiry to Application': 75,
        'Application to Interview': 66.7,
        'Interview to Acceptance': 70,
        'Acceptance to Enrollment': 85.7
      }

      enrollmentStore.funnelData = mockFunnelData
      enrollmentStore.conversionRates = mockConversionRates

      await wrapper.vm.$nextTick()

      const analyzeButton = wrapper.find('[data-testid="analyze-conversion-btn"]')
      await analyzeButton.trigger('click')

      expect(enrollmentStore.trackConversionRates).toHaveBeenCalledWith(mockFunnelData)
      
      // Check if conversion rates are displayed
      const conversionItems = wrapper.findAll('[data-testid="conversion-rate-item"]')
      expect(conversionItems.length).toBe(4)
      
      expect(conversionItems[0].text()).toContain('Inquiry to Application')
      expect(conversionItems[0].text()).toContain('75%')
    })

    it('should identify bottleneck stages in the funnel', async () => {
      const mockBottlenecks = [
        { 
          stage: 'Application to Interview', 
          conversionRate: 66.7, 
          threshold: 70, 
          severity: 'medium',
          recommendations: [
            'Simplify application process',
            'Provide clearer instructions',
            'Offer application assistance'
          ]
        },
        {
          stage: 'Interview to Acceptance',
          conversionRate: 70,
          threshold: 75,
          severity: 'low',
          recommendations: [
            'Improve interview process',
            'Reduce decision time'
          ]
        }
      ]

      vi.mocked(enrollmentStore.identifyBottlenecks).mockResolvedValue(mockBottlenecks)

      const bottleneckButton = wrapper.find('[data-testid="identify-bottlenecks-btn"]')
      await bottleneckButton.trigger('click')

      expect(enrollmentStore.identifyBottlenecks).toHaveBeenCalled()
      
      await wrapper.vm.$nextTick()
      
      const bottleneckItems = wrapper.findAll('[data-testid="bottleneck-item"]')
      expect(bottleneckItems.length).toBe(2)
      
      expect(bottleneckItems[0].text()).toContain('Application to Interview')
      expect(bottleneckItems[0].text()).toContain('66.7%')
      expect(bottleneckItems[0].text()).toContain('medium severity')
    })

    it('should generate funnel visualization data', async () => {
      const mockVisualizationData = {
        chartData: [
          { stage: 'Inquiry', value: 1000, color: '#4CAF50' },
          { stage: 'Application', value: 750, color: '#2196F3' },
          { stage: 'Interview', value: 500, color: '#FF9800' },
          { stage: 'Acceptance', value: 350, color: '#9C27B0' },
          { stage: 'Enrollment', value: 300, color: '#F44336' }
        ],
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      }

      vi.mocked(enrollmentStore.generateFunnelVisualization).mockResolvedValue(mockVisualizationData)

      const visualizeButton = wrapper.find('[data-testid="generate-visualization-btn"]')
      await visualizeButton.trigger('click')

      expect(enrollmentStore.generateFunnelVisualization).toHaveBeenCalled()
      
      await wrapper.vm.$nextTick()
      
      const funnelChart = wrapper.find('[data-testid="funnel-chart"]')
      expect(funnelChart.exists()).toBe(true)
      
      // Check if chart data is properly set
      expect(wrapper.vm.chartData).toEqual(mockVisualizationData.chartData)
      expect(wrapper.vm.chartOptions).toEqual(mockVisualizationData.options)
    })
  })

  describe('Data Validation', () => {
    it('should validate funnel data completeness', async () => {
      const incompleteFunnelData = [
        { stage: 'Inquiry', count: 1000, percentage: 100 },
        { stage: 'Application', count: 750, percentage: 75 },
        // Missing stages
      ]

      enrollmentStore.funnelData = incompleteFunnelData

      const analyzeButton = wrapper.find('[data-testid="analyze-conversion-btn"]')
      await analyzeButton.trigger('click')

      const validationError = wrapper.find('[data-testid="data-validation-error"]')
      expect(validationError.exists()).toBe(true)
      expect(validationError.text()).toContain('Incomplete funnel data')
    })

    it('should validate percentage calculations', async () => {
      const invalidFunnelData = [
        { stage: 'Inquiry', count: 1000, percentage: 100 },
        { stage: 'Application', count: 750, percentage: 75 },
        { stage: 'Interview', count: 500, percentage: 60 }, // Wrong percentage
        { stage: 'Acceptance', count: 350, percentage: 35 },
        { stage: 'Enrollment', count: 300, percentage: 30 }
      ]

      enrollmentStore.funnelData = invalidFunnelData

      const analyzeButton = wrapper.find('[data-testid="analyze-conversion-btn"]')
      await analyzeButton.trigger('click')

      const validationError = wrapper.find('[data-testid="percentage-error"]')
      expect(validationError.exists()).toBe(true)
      expect(validationError.text()).toContain('Invalid percentage calculation')
    })

    it('should handle empty funnel data gracefully', async () => {
      enrollmentStore.funnelData = []

      const analyzeButton = wrapper.find('[data-testid="analyze-conversion-btn"]')
      await analyzeButton.trigger('click')

      const emptyState = wrapper.find('[data-testid="empty-funnel-state"]')
      expect(emptyState.exists()).toBe(true)
      expect(emptyState.text()).toContain('No funnel data available')
    })
  })

  describe('Bottleneck Analysis', () => {
    it('should categorize bottlenecks by severity', async () => {
      const mockBottlenecks = [
        { stage: 'Stage 1', conversionRate: 30, threshold: 70, severity: 'high' },
        { stage: 'Stage 2', conversionRate: 60, threshold: 70, severity: 'medium' },
        { stage: 'Stage 3', conversionRate: 68, threshold: 70, severity: 'low' }
      ]

      vi.mocked(enrollmentStore.identifyBottlenecks).mockResolvedValue(mockBottlenecks)

      const bottleneckButton = wrapper.find('[data-testid="identify-bottlenecks-btn"]')
      await bottleneckButton.trigger('click')

      await wrapper.vm.$nextTick()
      
      const highSeverityBottleneck = wrapper.find('[data-testid="bottleneck-high"]')
      const mediumSeverityBottleneck = wrapper.find('[data-testid="bottleneck-medium"]')
      const lowSeverityBottleneck = wrapper.find('[data-testid="bottleneck-low"]')
      
      expect(highSeverityBottleneck.exists()).toBe(true)
      expect(mediumSeverityBottleneck.exists()).toBe(true)
      expect(lowSeverityBottleneck.exists()).toBe(true)
      
      expect(highSeverityBottleneck.text()).toContain('Stage 1')
      expect(highSeverityBottleneck.text()).toContain('30%')
    })

    it('should provide actionable recommendations for bottlenecks', async () => {
      const mockBottlenecks = [
        {
          stage: 'Application to Interview',
          conversionRate: 50,
          threshold: 70,
          severity: 'high',
          recommendations: [
            'Streamline application process',
            'Reduce required documentation',
            'Implement application assistance program'
          ]
        }
      ]

      vi.mocked(enrollmentStore.identifyBottlenecks).mockResolvedValue(mockBottlenecks)

      const bottleneckButton = wrapper.find('[data-testid="identify-bottlenecks-btn"]')
      await bottleneckButton.trigger('click')

      await wrapper.vm.$nextTick()
      
      const recommendations = wrapper.findAll('[data-testid="recommendation-item"]')
      expect(recommendations.length).toBe(3)
      
      expect(recommendations[0].text()).toContain('Streamline application process')
      expect(recommendations[1].text()).toContain('Reduce required documentation')
      expect(recommendations[2].text()).toContain('Implement application assistance program')
    })
  })

  describe('Time-based Analysis', () => {
    it('should analyze funnel trends over time', async () => {
      const mockTimeSeriesData = {
        periods: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        funnelData: [
          {
            period: 'Jan',
            stages: [
              { stage: 'Inquiry', count: 200 },
              { stage: 'Application', count: 150 },
              { stage: 'Interview', count: 100 },
              { stage: 'Acceptance', count: 70 },
              { stage: 'Enrollment', count: 60 }
            ]
          },
          {
            period: 'Feb',
            stages: [
              { stage: 'Inquiry', count: 220 },
              { stage: 'Application', count: 165 },
              { stage: 'Interview', count: 110 },
              { stage: 'Acceptance', count: 77 },
              { stage: 'Enrollment', count: 66 }
            ]
          }
        ]
      }

      enrollmentStore.timeSeriesData = mockTimeSeriesData

      const timeAnalysisButton = wrapper.find('[data-testid="time-analysis-btn"]')
      await timeAnalysisButton.trigger('click')

      await wrapper.vm.$nextTick()
      
      const timeChart = wrapper.find('[data-testid="time-trends-chart"]')
      expect(timeChart.exists()).toBe(true)
      
      const trendIndicators = wrapper.findAll('[data-testid="trend-indicator"]')
      expect(trendIndicators.length).toBeGreaterThan(0)
    })

    it('should compare funnel performance across different periods', async () => {
      const mockComparisonData = {
        currentPeriod: {
          totalInquiries: 1000,
          conversionRate: 30,
          avgProcessTime: 15
        },
        previousPeriod: {
          totalInquiries: 900,
          conversionRate: 28,
          avgProcessTime: 18
        },
        yearAgo: {
          totalInquiries: 800,
          conversionRate: 25,
          avgProcessTime: 20
        }
      }

      enrollmentStore.comparisonData = mockComparisonData

      const comparisonButton = wrapper.find('[data-testid="period-comparison-btn"]')
      await comparisonButton.trigger('click')

      await wrapper.vm.$nextTick()
      
      const comparisonTable = wrapper.find('[data-testid="period-comparison-table"]')
      expect(comparisonTable.exists()).toBe(true)
      
      const inquiryGrowth = wrapper.find('[data-testid="inquiry-growth"]')
      expect(inquiryGrowth.text()).toContain('+11.1%') // (1000-900)/900
      
      const conversionImprovement = wrapper.find('[data-testid="conversion-improvement"]')
      expect(conversionImprovement.text()).toContain('+2%') // 30-28
    })
  })

  describe('Export and Reporting', () => {
    it('should export funnel analysis results to PDF', async () => {
      const mockFunnelData = [
        { stage: 'Inquiry', count: 1000, percentage: 100 },
        { stage: 'Application', count: 750, percentage: 75 },
        { stage: 'Interview', count: 500, percentage: 50 },
        { stage: 'Acceptance', count: 350, percentage: 35 },
        { stage: 'Enrollment', count: 300, percentage: 30 }
      ]

      enrollmentStore.funnelData = mockFunnelData

      const exportPdfButton = wrapper.find('[data-testid="export-pdf-btn"]')
      await exportPdfButton.trigger('click')

      expect(wrapper.vm.exporting).toBe(true)
      
      // Simulate export completion
      setTimeout(() => {
        expect(wrapper.vm.exporting).toBe(false)
      }, 1000)
    })

    it('should generate comprehensive funnel analysis report', async () => {
      const generateReportButton = wrapper.find('[data-testid="generate-report-btn"]')
      await generateReportButton.trigger('click')

      const reportModal = wrapper.find('[data-testid="report-modal"]')
      expect(reportModal.exists()).toBe(true)

      const reportOptions = wrapper.find('[data-testid="report-options"]')
      expect(reportOptions.exists()).toBe(true)

      const includeChartsCheckbox = wrapper.find('[data-testid="include-charts"]')
      await includeChartsCheckbox.setChecked(true)

      const includeRecommendationsCheckbox = wrapper.find('[data-testid="include-recommendations"]')
      await includeRecommendationsCheckbox.setChecked(true)

      const generateButton = wrapper.find('[data-testid="generate-report-final-btn"]')
      await generateButton.trigger('click')

      expect(wrapper.vm.reportConfig.includeCharts).toBe(true)
      expect(wrapper.vm.reportConfig.includeRecommendations).toBe(true)
    })
  })

  describe('User Interface Interactions', () => {
    it('should allow users to filter funnel data by date range', async () => {
      const dateRangeButton = wrapper.find('[data-testid="date-range-filter-btn"]')
      await dateRangeButton.trigger('click')

      const dateRangeModal = wrapper.find('[data-testid="date-range-modal"]')
      expect(dateRangeModal.exists()).toBe(true)

      const startDateInput = wrapper.find('[data-testid="start-date-input"]')
      await startDateInput.setValue('2024-01-01')

      const endDateInput = wrapper.find('[data-testid="end-date-input"]')
      await endDateInput.setValue('2024-12-31')

      const applyButton = wrapper.find('[data-testid="apply-date-filter-btn"]')
      await applyButton.trigger('click')

      expect(wrapper.vm.dateRange.startDate).toBe('2024-01-01')
      expect(wrapper.vm.dateRange.endDate).toBe('2024-12-31')
    })

    it('should allow users to customize funnel stages', async () => {
      const customizeButton = wrapper.find('[data-testid="customize-stages-btn"]')
      await customizeButton.trigger('click')

      const customizeModal = wrapper.find('[data-testid="customize-stages-modal"]')
      expect(customizeModal.exists()).toBe(true)

      const stageInputs = wrapper.findAll('[data-testid="stage-input"]')
      expect(stageInputs.length).toBeGreaterThan(0)

      // Add a new stage
      const addStageButton = wrapper.find('[data-testid="add-stage-btn"]')
      await addStageButton.trigger('click')

      const newStageInput = wrapper.find('[data-testid="new-stage-input"]')
      await newStageInput.setValue('Pre-Application')

      const saveButton = wrapper.find('[data-testid="save-stages-btn"]')
      await saveButton.trigger('click')

      expect(wrapper.vm.customStages).toContain('Pre-Application')
    })

    it('should provide interactive funnel chart tooltips', async () => {
      const mockFunnelData = [
        { stage: 'Inquiry', count: 1000, percentage: 100 },
        { stage: 'Application', count: 750, percentage: 75 }
      ]

      enrollmentStore.funnelData = mockFunnelData

      await wrapper.vm.$nextTick()

      const funnelChart = wrapper.find('[data-testid="funnel-chart"]')
      expect(funnelChart.exists()).toBe(true)

      // Simulate hover over chart element
      const chartElement = wrapper.find('[data-testid="chart-element-inquiry"]')
      await chartElement.trigger('mouseenter')

      const tooltip = wrapper.find('[data-testid="chart-tooltip"]')
      expect(tooltip.exists()).toBe(true)
      expect(tooltip.text()).toContain('Inquiry: 1000 (100%)')
    })
  })

  describe('Performance Optimization', () => {
    it('should implement efficient data processing for large datasets', async () => {
      // Create large funnel dataset
      const largeFunnelData = Array.from({ length: 10000 }, (_, i) => ({
        stage: `Stage ${i % 10}`,
        count: Math.floor(Math.random() * 1000) + 100,
        percentage: Math.random() * 100
      }))

      enrollmentStore.funnelData = largeFunnelData

      const startTime = performance.now()
      
      const analyzeButton = wrapper.find('[data-testid="analyze-conversion-btn"]')
      await analyzeButton.trigger('click')

      const endTime = performance.now()
      const processingTime = endTime - startTime

      expect(processingTime).toBeLessThan(3000) // Should process within 3 seconds
    })

    it('should cache analysis results for repeated requests', async () => {
      const mockFunnelData = [
        { stage: 'Inquiry', count: 1000, percentage: 100 },
        { stage: 'Application', count: 750, percentage: 75 }
      ]

      enrollmentStore.funnelData = mockFunnelData

      // First analysis
      const analyzeButton = wrapper.find('[data-testid="analyze-conversion-btn"]')
      await analyzeButton.trigger('click')

      expect(enrollmentStore.trackConversionRates).toHaveBeenCalledTimes(1)

      // Second analysis with same data
      await analyzeButton.trigger('click')

      // Should use cached result
      expect(enrollmentStore.trackConversionRates).toHaveBeenCalledTimes(1)
    })
  })
})