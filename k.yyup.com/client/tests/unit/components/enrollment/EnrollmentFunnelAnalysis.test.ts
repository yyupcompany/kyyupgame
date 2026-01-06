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

describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import { nextTick } from 'vue'

// Mock Element Plus
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      error: vi.fn(),
      success: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn().mockResolvedValue('confirm')
    },
    ElCard: {
      name: 'ElCard',
      template: '<div class="el-card"><slot /></div>'
    },
    ElTable: {
      name: 'ElTable',
      template: '<div class="el-table"><slot /></div>'
    },
    ElTableColumn: {
      name: 'ElTableColumn',
      template: '<div class="el-table-column"><slot /></div>'
    },
    ElButton: {
      name: 'ElButton',
      template: '<button class="el-button" @click="$emit(\'click\')"><slot /></button>',
      emits: ['click']
    },
    ElSelect: {
      name: 'ElSelect',
      template: '<div class="el-select"><slot /></div>'
    },
    ElOption: {
      name: 'ElOption',
      template: '<div class="el-option" />'
    },
    ElProgress: {
      name: 'ElProgress',
      template: '<div class="el-progress" />'
    },
    ElStatistical: {
      name: 'ElStatistical',
      template: '<div class="el-statistical" />'
    }
  }
})

// Mock ECharts
vi.mock('echarts', () => ({
  default: vi.fn().mockImplementation(() => ({
    setOption: vi.fn(),
    resize: vi.fn(),
    dispose: vi.fn(),
    on: vi.fn(),
    off: vi.fn()
  }))
}))

// Mock API calls
vi.mock('@/utils/request', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))

import EnrollmentFunnelAnalysis from '@/components/enrollment/EnrollmentFunnelAnalysis.vue'

describe('EnrollmentFunnelAnalysis Component', () => {
  let router: any
  let pinia: any
  let wrapper: any

  beforeEach(async () => {
    vi.clearAllMocks()
    
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/enrollment', component: { template: '<div>Enrollment</div>' } }
      ]
    })
    pinia = createPinia()
    
    await router.push('/')
    await router.isReady()
  })

  describe('Component Initialization', () => {
    it('should render correctly with default props', async () => {
      wrapper = mount(EnrollmentFunnelAnalysis, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await nextTick()
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.enrollment-funnel-analysis').exists()).toBe(true)
    })

    it('should initialize with default data', async () => {
      wrapper = mount(EnrollmentFunnelAnalysis, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await nextTick()
      expect(wrapper.vm.funnelData).toEqual([])
      expect(wrapper.vm.loading).toBe(false)
      expect(wrapper.vm.selectedPeriod).toBe('current_month')
    })
  })

  describe('Funnel Stage Conversion Tracking', () => {
    it('should load funnel data for all stages', async () => {
      const mockFunnelData = [
        { stage: '咨询', count: 500, percentage: 100 },
        { stage: '申请', count: 350, percentage: 70 },
        { stage: '面试', count: 280, percentage: 80 },
        { stage: '录取', count: 210, percentage: 75 },
        { stage: '缴费', count: 195, percentage: 93 }
      ]

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockFunnelData,
        message: 'success'
      })

      wrapper = mount(EnrollmentFunnelAnalysis, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadFunnelData()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/enrollment/funnel-data')
      expect(wrapper.vm.funnelData).toEqual(mockFunnelData)
    })

    it('should calculate conversion rates between stages', async () => {
      wrapper = mount(EnrollmentFunnelAnalysis, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      wrapper.vm.funnelData = [
        { stage: '咨询', count: 500 },
        { stage: '申请', count: 350 },
        { stage: '面试', count: 280 },
        { stage: '录取', count: 210 },
        { stage: '缴费', count: 195 }
      ]

      await wrapper.vm.calculateConversionRates()
      await nextTick()

      expect(wrapper.vm.conversionRates).toBeDefined()
      expect(wrapper.vm.conversionRates.length).toBe(4)
      expect(wrapper.vm.conversionRates[0]).toEqual({
        from: '咨询',
        to: '申请',
        rate: 70,
        count: 150
      })
    })

    it('should track conversion rate changes over time', async () => {
      wrapper = mount(EnrollmentFunnelAnalysis, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const mockTrendData = [
        { date: '2024-01-01', stage: '咨询', count: 100 },
        { date: '2024-01-01', stage: '申请', count: 70 },
        { date: '2024-01-02', stage: '咨询', count: 120 },
        { date: '2024-01-02', stage: '申请', count: 84 }
      ]

      wrapper.vm.trendData = mockTrendData
      await wrapper.vm.trackConversionTrends()
      await nextTick()

      expect(wrapper.vm.conversionTrends).toBeDefined()
      expect(wrapper.vm.conversionTrends.length).toBeGreaterThan(0)
    })
  })

  describe('Bottleneck Stage Identification', () => {
    it('should identify bottleneck stages with low conversion rates', async () => {
      wrapper = mount(EnrollmentFunnelAnalysis, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      wrapper.vm.conversionRates = [
        { from: '咨询', to: '申请', rate: 70, count: 150 },
        { from: '申请', to: '面试', rate: 80, count: 70 },
        { from: '面试', to: '录取', rate: 45, count: 125 }, // Bottleneck
        { from: '录取', to: '缴费', rate: 93, count: 15 }
      ]

      await wrapper.vm.identifyBottlenecks()
      await nextTick()

      expect(wrapper.vm.bottlenecks).toBeDefined()
      expect(wrapper.vm.bottlenecks.length).toBe(1)
      expect(wrapper.vm.bottlenecks[0].stage).toBe('面试')
      expect(wrapper.vm.bottlenecks[0].conversionRate).toBe(45)
    })

    it('should prioritize bottlenecks by impact', async () => {
      wrapper = mount(EnrollmentFunnelAnalysis, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      wrapper.vm.conversionRates = [
        { from: '咨询', to: '申请', rate: 60, count: 200 }, // High impact
        { from: '申请', to: '面试', rate: 80, count: 70 },
        { from: '面试', to: '录取', rate: 45, count: 125 },
        { from: '录取', to: '缴费', rate: 50, count: 105 } // High impact
      ]

      await wrapper.vm.identifyBottlenecks()
      await nextTick()

      expect(wrapper.vm.bottlenecks).toBeDefined()
      expect(wrapper.vm.bottlenecks[0].impact).toBeGreaterThan(
        wrapper.vm.bottlenecks[1].impact
      )
    })

    it('should provide bottleneck analysis insights', async () => {
      wrapper = mount(EnrollmentFunnelAnalysis, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      wrapper.vm.bottlenecks = [
        {
          stage: '面试',
          conversionRate: 45,
          dropCount: 125,
          impact: 'high',
          suggestions: ['优化面试流程', '增加面试官培训']
        }
      ]

      await wrapper.vm.generateBottleneckInsights()
      await nextTick()

      expect(wrapper.vm.bottleneckInsights).toBeDefined()
      expect(wrapper.vm.bottleneckInsights.length).toBeGreaterThan(0)
    })
  })

  describe('Funnel Visualization Data Generation', () => {
    it('should generate funnel chart data', async () => {
      wrapper = mount(EnrollmentFunnelAnalysis, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      wrapper.vm.funnelData = [
        { stage: '咨询', count: 500, percentage: 100 },
        { stage: '申请', count: 350, percentage: 70 },
        { stage: '面试', count: 280, percentage: 80 },
        { stage: '录取', count: 210, percentage: 75 },
        { stage: '缴费', count: 195, percentage: 93 }
      ]

      await wrapper.vm.generateFunnelChartData()
      await nextTick()

      expect(wrapper.vm.funnelChartData).toBeDefined()
      expect(wrapper.vm.funnelChartData.title).toBe('招生漏斗分析')
      expect(wrapper.vm.funnelChartData.series).toBeDefined()
    })

    it('should generate conversion rate trend chart', async () => {
      wrapper = mount(EnrollmentFunnelAnalysis, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      wrapper.vm.conversionTrends = [
        { date: '2024-01-01', overallRate: 39 },
        { date: '2024-01-02', overallRate: 40 },
        { date: '2024-01-03', overallRate: 38 }
      ]

      await wrapper.vm.generateTrendChartData()
      await nextTick()

      expect(wrapper.vm.trendChartData).toBeDefined()
      expect(wrapper.vm.trendChartData.xAxis).toBeDefined()
      expect(wrapper.vm.trendChartData.series).toBeDefined()
    })

    it('should generate bottleneck visualization', async () => {
      wrapper = mount(EnrollmentFunnelAnalysis, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      wrapper.vm.bottlenecks = [
        { stage: '面试', conversionRate: 45, dropCount: 125 },
        { stage: '录取', conversionRate: 75, dropCount: 70 }
      ]

      await wrapper.vm.generateBottleneckChart()
      await nextTick()

      expect(wrapper.vm.bottleneckChartData).toBeDefined()
      expect(wrapper.vm.bottleneckChartData.series).toBeDefined()
    })
  })

  describe('Conversion Rate Optimization Suggestions', () => {
    it('should provide optimization suggestions for low conversion stages', async () => {
      wrapper = mount(EnrollmentFunnelAnalysis, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      wrapper.vm.conversionRates = [
        { from: '咨询', to: '申请', rate: 60, count: 200 },
        { from: '申请', to: '面试', rate: 80, count: 70 },
        { from: '面试', to: '录取', rate: 45, count: 125 },
        { from: '录取', to: '缴费', rate: 50, count: 105 }
      ]

      await wrapper.vm.generateOptimizationSuggestions()
      await nextTick()

      expect(wrapper.vm.optimizationSuggestions).toBeDefined()
      expect(wrapper.vm.optimizationSuggestions.length).toBeGreaterThan(0)
      expect(wrapper.vm.optimizationSuggestions[0]).toHaveProperty('stage')
      expect(wrapper.vm.optimizationSuggestions[0]).toHaveProperty('suggestion')
      expect(wrapper.vm.optimizationSuggestions[0]).toHaveProperty('priority')
    })

    it('should calculate potential improvement impact', async () => {
      wrapper = mount(EnrollmentFunnelAnalysis, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      wrapper.vm.funnelData = [
        { stage: '咨询', count: 500 },
        { stage: '申请', count: 350 },
        { stage: '面试', count: 280 },
        { stage: '录取', count: 210 },
        { stage: '缴费', count: 195 }
      ]

      await wrapper.vm.calculateImprovementImpact()
      await nextTick()

      expect(wrapper.vm.improvementImpact).toBeDefined()
      expect(wrapper.vm.improvementImpact).toHaveProperty('currentOverallRate')
      expect(wrapper.vm.improvementImpact).toHaveProperty('potentialOverallRate')
      expect(wrapper.vm.improvementImpact).toHaveProperty('additionalEnrollments')
    })

    it('should provide actionable recommendations', async () => {
      wrapper = mount(EnrollmentFunnelAnalysis, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      wrapper.vm.optimizationSuggestions = [
        {
          stage: '咨询',
          currentRate: 60,
          targetRate: 75,
          suggestion: '优化咨询流程',
          priority: 'high'
        }
      ]

      await wrapper.vm.generateActionableRecommendations()
      await nextTick()

      expect(wrapper.vm.actionableRecommendations).toBeDefined()
      expect(wrapper.vm.actionableRecommendations.length).toBeGreaterThan(0)
    })
  })

  describe('Data Filtering and Period Selection', () => {
    it('should filter funnel data by date range', async () => {
      wrapper = mount(EnrollmentFunnelAnalysis, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.setData({
        dateRange: {
          start: '2024-01-01',
          end: '2024-01-31'
        }
      })

      await wrapper.vm.filterDataByDateRange()
      await nextTick()

      expect(wrapper.vm.filteredData).toBeDefined()
    })

    it('should handle different time period selections', async () => {
      wrapper = mount(EnrollmentFunnelAnalysis, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true,
            'el-select': {
              template: '<select @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
              emits: ['update:modelValue']
            }
          }
        }
      })

      await wrapper.setData({ selectedPeriod: 'last_month' })
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.selectedPeriod).toBe('last_month')
    })

    it('should compare funnel performance across periods', async () => {
      wrapper = mount(EnrollmentFunnelAnalysis, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const currentData = [
        { stage: '咨询', count: 500 },
        { stage: '申请', count: 350 }
      ]

      const previousData = [
        { stage: '咨询', count: 450 },
        { stage: '申请', count: 315 }
      ]

      wrapper.vm.currentPeriodData = currentData
      wrapper.vm.previousPeriodData = previousData

      await wrapper.vm.comparePeriodPerformance()
      await nextTick()

      expect(wrapper.vm.periodComparison).toBeDefined()
      expect(wrapper.vm.periodComparison).toHaveProperty('growth')
      expect(wrapper.vm.periodComparison).toHaveProperty('improvement')
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const { get } = await import('@/utils/request')
      get.mockRejectedValue(new Error('Network error'))

      wrapper = mount(EnrollmentFunnelAnalysis, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadFunnelData()
      await nextTick()

      expect(wrapper.vm.error).toBe('Network error')
      expect(wrapper.vm.loading).toBe(false)
    })

    it('should handle empty funnel data', async () => {
      wrapper = mount(EnrollmentFunnelAnalysis, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      wrapper.vm.funnelData = []
      await wrapper.vm.calculateConversionRates()
      await nextTick()

      expect(wrapper.vm.error).toContain('漏斗数据为空')
    })

    it('should validate funnel data integrity', async () => {
      wrapper = mount(EnrollmentFunnelAnalysis, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const invalidData = [
        { stage: '咨询', count: 500 },
        { stage: '申请', count: 600 } // Invalid: count > previous stage
      ]

      wrapper.vm.funnelData = invalidData
      await wrapper.vm.validateFunnelData()
      await nextTick()

      expect(wrapper.vm.error).toContain('数据异常')
    })
  })

  describe('User Interactions', () => {
    it('should handle export functionality', async () => {
      wrapper = mount(EnrollmentFunnelAnalysis, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': {
              template: '<button class="el-button" @click="$emit(\'click\')"><slot /></button>',
              emits: ['click']
            }
          }
        }
      })

      const exportSpy = vi.spyOn(wrapper.vm, 'exportReport')
      await wrapper.find('.export-btn').trigger('click')

      expect(exportSpy).toHaveBeenCalled()
    })

    it('should handle refresh functionality', async () => {
      wrapper = mount(EnrollmentFunnelAnalysis, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': {
              template: '<button class="el-button" @click="$emit(\'click\')"><slot /></button>',
              emits: ['click']
            }
          }
        }
      })

      const refreshSpy = vi.spyOn(wrapper.vm, 'refreshData')
      await wrapper.find('.refresh-btn').trigger('click')

      expect(refreshSpy).toHaveBeenCalled()
    })
  })

  describe('Performance Monitoring', () => {
    it('should track data loading performance', async () => {
      wrapper = mount(EnrollmentFunnelAnalysis, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const startTime = Date.now()
      await wrapper.vm.loadFunnelData()
      const endTime = Date.now()

      expect(wrapper.vm.loadingTime).toBeDefined()
      expect(wrapper.vm.loadingTime).toBeGreaterThan(0)
    })

    it('should monitor chart rendering performance', async () => {
      wrapper = mount(EnrollmentFunnelAnalysis, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const startTime = Date.now()
      await wrapper.vm.renderFunnelChart()
      const endTime = Date.now()

      expect(wrapper.vm.renderTime).toBeDefined()
      expect(wrapper.vm.renderTime).toBeGreaterThan(0)
    })
  })
})