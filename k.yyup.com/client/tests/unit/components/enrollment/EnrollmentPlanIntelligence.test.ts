import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import EnrollmentPlanIntelligence from '@/components/enrollment/EnrollmentPlanIntelligence.vue'
import { useEnrollmentStore } from '@/stores/enrollment'

// Mock the enrollment store
vi.mock('@/stores/enrollment', () => ({
  useEnrollmentStore: vi.fn(() => ({
    enrollmentPlans: [],
    historicalData: [],
    predictions: [],
    generatePredictions: vi.fn(),
    optimizeClassCapacity: vi.fn(),
    predictSeasonalTrends: vi.fn(),
    loading: false,
    error: null
  }))
}))

// 控制台错误检测变量
let consoleSpy: any

describe('EnrollmentPlanIntelligence', () => {
  let wrapper: any
  let enrollmentStore: any

  beforeEach(() => {
    enrollmentStore = useEnrollmentStore()
    wrapper = mount(EnrollmentPlanIntelligence)
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
    it('should render enrollment intelligence component correctly', () => {
      expect(wrapper.find('[data-testid="enrollment-intelligence"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="prediction-controls"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="capacity-optimization"]').exists()).toBe(true)
    })

    it('should display loading state when generating predictions', async () => {
      enrollmentStore.loading = true
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('[data-testid="loading-spinner"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="prediction-results"]').exists()).toBe(false)
    })

    it('should display error message when prediction fails', async () => {
      enrollmentStore.error = 'Failed to generate predictions'
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('[data-testid="error-message"]').text()).toContain('Failed to generate predictions')
    })
  })

  describe('Enrollment Predictions', () => {
    it('should generate enrollment predictions based on historical data', async () => {
      const mockHistoricalData = [
        { year: 2022, semester: 'spring', enrollment: 120 },
        { year: 2022, semester: 'fall', enrollment: 150 },
        { year: 2023, semester: 'spring', enrollment: 135 },
        { year: 2023, semester: 'fall', enrollment: 165 }
      ]
      
      const mockPredictions = [
        { year: 2024, semester: 'spring', predicted: 140, confidence: 0.85 },
        { year: 2024, semester: 'fall', predicted: 175, confidence: 0.82 }
      ]

      enrollmentStore.historicalData = mockHistoricalData
      enrollmentStore.predictions = mockPredictions

      await wrapper.vm.$nextTick()

      const predictionButton = wrapper.find('[data-testid="generate-predictions-btn"]')
      await predictionButton.trigger('click')

      expect(enrollmentStore.generatePredictions).toHaveBeenCalledWith(mockHistoricalData)
      
      // Check if predictions are displayed
      const predictionResults = wrapper.find('[data-testid="prediction-results"]')
      expect(predictionResults.exists()).toBe(true)
      
      const predictionItems = wrapper.findAll('[data-testid="prediction-item"]')
      expect(predictionItems.length).toBe(2)
      
      expect(predictionItems[0].text()).toContain('2024 Spring')
      expect(predictionItems[0].text()).toContain('140')
      expect(predictionItems[0].text()).toContain('85%')
    })

    it('should validate prediction parameters before generation', async () => {
      const emptyHistoricalData = []
      enrollmentStore.historicalData = emptyHistoricalData

      const predictionButton = wrapper.find('[data-testid="generate-predictions-btn"]')
      await predictionButton.trigger('click')

      expect(enrollmentStore.generatePredictions).not.toHaveBeenCalled()
      
      const errorMessage = wrapper.find('[data-testid="validation-error"]')
      expect(errorMessage.exists()).toBe(true)
      expect(errorMessage.text()).toContain('Historical data is required')
    })
  })

  describe('Class Capacity Optimization', () => {
    it('should optimize class capacity allocation', async () => {
      const mockClasses = [
        { id: 1, name: 'Class A', capacity: 25, currentEnrollment: 20 },
        { id: 2, name: 'Class B', capacity: 30, currentEnrollment: 15 },
        { id: 3, name: 'Class C', capacity: 20, currentEnrollment: 18 }
      ]

      const mockOptimization = {
        recommendations: [
          { classId: 1, action: 'increase', newCapacity: 30, reason: 'High demand expected' },
          { classId: 2, action: 'decrease', newCapacity: 25, reason: 'Underutilized capacity' },
          { classId: 3, action: 'maintain', newCapacity: 20, reason: 'Optimal capacity' }
        ]
      }

      enrollmentStore.classes = mockClasses
      vi.mocked(enrollmentStore.optimizeClassCapacity).mockResolvedValue(mockOptimization)

      const optimizeButton = wrapper.find('[data-testid="optimize-capacity-btn"]')
      await optimizeButton.trigger('click')

      expect(enrollmentStore.optimizeClassCapacity).toHaveBeenCalledWith(mockClasses)
      
      await wrapper.vm.$nextTick()
      
      const recommendations = wrapper.findAll('[data-testid="capacity-recommendation"]')
      expect(recommendations.length).toBe(3)
      
      expect(recommendations[0].text()).toContain('Class A')
      expect(recommendations[0].text()).toContain('increase to 30')
      expect(recommendations[0].text()).toContain('High demand expected')
    })

    it('should handle capacity optimization errors gracefully', async () => {
      vi.mocked(enrollmentStore.optimizeClassCapacity).mockRejectedValue(new Error('Optimization failed'))

      const optimizeButton = wrapper.find('[data-testid="optimize-capacity-btn"]')
      await optimizeButton.trigger('click')

      await wrapper.vm.$nextTick()
      
      const errorMessage = wrapper.find('[data-testid="optimization-error"]')
      expect(errorMessage.exists()).toBe(true)
      expect(errorMessage.text()).toContain('Failed to optimize class capacity')
    })
  })

  describe('Seasonal Trend Analysis', () => {
    it('should predict enrollment trends by season', async () => {
      const mockSeasonalData = {
        spring: { trend: 'increasing', rate: 0.15, confidence: 0.88 },
        summer: { trend: 'stable', rate: 0.05, confidence: 0.75 },
        fall: { trend: 'increasing', rate: 0.20, confidence: 0.92 },
        winter: { trend: 'decreasing', rate: -0.10, confidence: 0.70 }
      }

      vi.mocked(enrollmentStore.predictSeasonalTrends).mockResolvedValue(mockSeasonalData)

      const trendButton = wrapper.find('[data-testid="analyze-trends-btn"]')
      await trendButton.trigger('click')

      expect(enrollmentStore.predictSeasonalTrends).toHaveBeenCalled()
      
      await wrapper.vm.$nextTick()
      
      const trendChart = wrapper.find('[data-testid="seasonal-trends-chart"]')
      expect(trendChart.exists()).toBe(true)
      
      const springTrend = wrapper.find('[data-testid="trend-spring"]')
      expect(springTrend.text()).toContain('Spring')
      expect(springTrend.text()).toContain('increasing')
      expect(springTrend.text()).toContain('15%')
    })

    it('should display seasonal trend confidence intervals', async () => {
      const mockSeasonalData = {
        spring: { trend: 'increasing', rate: 0.15, confidence: 0.88, confidenceInterval: [0.12, 0.18] },
        fall: { trend: 'increasing', rate: 0.20, confidence: 0.92, confidenceInterval: [0.17, 0.23] }
      }

      vi.mocked(enrollmentStore.predictSeasonalTrends).mockResolvedValue(mockSeasonalData)

      const trendButton = wrapper.find('[data-testid="analyze-trends-btn"]')
      await trendButton.trigger('click')

      await wrapper.vm.$nextTick()
      
      const confidenceIntervals = wrapper.findAll('[data-testid="confidence-interval"]')
      expect(confidenceIntervals.length).toBe(2)
      
      expect(confidenceIntervals[0].text()).toContain('88% confidence')
      expect(confidenceIntervals[0].text()).toContain('12% - 18%')
    })
  })

  describe('Data Validation', () => {
    it('should validate historical data completeness', async () => {
      const incompleteData = [
        { year: 2022, semester: 'spring', enrollment: 120 },
        { year: 2022, semester: 'fall', enrollment: 150 },
        // Missing 2023 data
      ]

      enrollmentStore.historicalData = incompleteData

      const predictionButton = wrapper.find('[data-testid="generate-predictions-btn"]')
      await predictionButton.trigger('click')

      const validationError = wrapper.find('[data-testid="data-validation-error"]')
      expect(validationError.exists()).toBe(true)
      expect(validationError.text()).toContain('Incomplete historical data')
    })

    it('should validate numerical data ranges', async () => {
      const invalidData = [
        { year: 2022, semester: 'spring', enrollment: -10 }, // Negative enrollment
        { year: 2022, semester: 'fall', enrollment: 9999 }, // Unrealistically high
      ]

      enrollmentStore.historicalData = invalidData

      const predictionButton = wrapper.find('[data-testid="generate-predictions-btn"]')
      await predictionButton.trigger('click')

      const validationError = wrapper.find('[data-testid="data-range-error"]')
      expect(validationError.exists()).toBe(true)
      expect(validationError.text()).toContain('Invalid enrollment numbers')
    })
  })

  describe('Performance Optimization', () => {
    it('should handle large datasets efficiently', async () => {
      // Create large dataset
      const largeHistoricalData = Array.from({ length: 1000 }, (_, i) => ({
        year: 2000 + Math.floor(i / 2),
        semester: i % 2 === 0 ? 'spring' : 'fall',
        enrollment: Math.floor(Math.random() * 200) + 50
      }))

      enrollmentStore.historicalData = largeHistoricalData

      const startTime = performance.now()
      
      const predictionButton = wrapper.find('[data-testid="generate-predictions-btn"]')
      await predictionButton.trigger('click')

      const endTime = performance.now()
      const processingTime = endTime - startTime

      expect(processingTime).toBeLessThan(5000) // Should process within 5 seconds
      expect(enrollmentStore.generatePredictions).toHaveBeenCalledWith(largeHistoricalData)
    })

    it('should implement data caching for repeated predictions', async () => {
      const mockHistoricalData = [
        { year: 2022, semester: 'spring', enrollment: 120 },
        { year: 2022, semester: 'fall', enrollment: 150 }
      ]

      enrollmentStore.historicalData = mockHistoricalData

      // First prediction
      const predictionButton = wrapper.find('[data-testid="generate-predictions-btn"]')
      await predictionButton.trigger('click')

      expect(enrollmentStore.generatePredictions).toHaveBeenCalledTimes(1)

      // Second prediction with same data
      await predictionButton.trigger('click')

      // Should use cached result, not call the function again
      expect(enrollmentStore.generatePredictions).toHaveBeenCalledTimes(1)
    })
  })

  describe('User Interface Interactions', () => {
    it('should allow users to adjust prediction parameters', async () => {
      const parametersButton = wrapper.find('[data-testid="prediction-parameters-btn"]')
      await parametersButton.trigger('click')

      const parametersModal = wrapper.find('[data-testid="prediction-parameters-modal"]')
      expect(parametersModal.exists()).toBe(true)

      const confidenceSlider = wrapper.find('[data-testid="confidence-slider"]')
      await confidenceSlider.setValue(0.90)

      const yearRangeInput = wrapper.find('[data-testid="year-range-input"]')
      await yearRangeInput.setValue('2020-2025')

      const applyButton = wrapper.find('[data-testid="apply-parameters-btn"]')
      await applyButton.trigger('click')

      expect(wrapper.vm.predictionParameters.confidence).toBe(0.90)
      expect(wrapper.vm.predictionParameters.yearRange).toBe('2020-2025')
    })

    it('should export prediction results to different formats', async () => {
      const mockPredictions = [
        { year: 2024, semester: 'spring', predicted: 140, confidence: 0.85 },
        { year: 2024, semester: 'fall', predicted: 175, confidence: 0.82 }
      ]

      enrollmentStore.predictions = mockPredictions

      const exportButton = wrapper.find('[data-testid="export-predictions-btn"]')
      await exportButton.trigger('click')

      const exportOptions = wrapper.find('[data-testid="export-options"]')
      expect(exportOptions.exists()).toBe(true)

      const csvOption = wrapper.find('[data-testid="export-csv"]')
      await csvOption.trigger('click')

      expect(wrapper.vm.exportFormat).toBe('csv')
      // In a real test, we would check if the export function was called
    })
  })
})