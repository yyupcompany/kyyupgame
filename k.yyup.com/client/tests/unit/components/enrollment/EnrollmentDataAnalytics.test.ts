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
    ElForm: {
      name: 'ElForm',
      template: '<form class="el-form"><slot /></form>'
    },
    ElFormItem: {
      name: 'ElFormItem',
      template: '<div class="el-form-item"><slot /></div>'
    },
    ElInput: {
      name: 'ElInput',
      template: '<input class="el-input" @input="$emit(\'update:modelValue\', $event.target.value)" />',
      emits: ['update:modelValue']
    },
    ElSelect: {
      name: 'ElSelect',
      template: '<div class="el-select"><slot /></div>'
    },
    ElOption: {
      name: 'ElOption',
      template: '<div class="el-option" />'
    },
    ElDatePicker: {
      name: 'ElDatePicker',
      template: '<div class="el-date-picker" />'
    },
    ElDialog: {
      name: 'ElDialog',
      template: '<div class="el-dialog"><slot /></div>'
    },
    ElTag: {
      name: 'ElTag',
      template: '<span class="el-tag"><slot /></span>'
    },
    ElProgress: {
      name: 'ElProgress',
      template: '<div class="el-progress" />'
    },
    ElRadio: {
      name: 'ElRadio',
      template: '<label class="el-radio"><input type="radio" @change="$emit(\'change\', $event.target.value)" /><slot /></label>',
      emits: ['change']
    },
    ElRadioGroup: {
      name: 'ElRadioGroup',
      template: '<div class="el-radio-group"><slot /></div>'
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

import EnrollmentDataAnalytics from '@/components/enrollment/EnrollmentDataAnalytics.vue'

describe('EnrollmentDataAnalytics Component', () => {
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
      wrapper = mount(EnrollmentDataAnalytics, {
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
      expect(wrapper.find('.enrollment-data-analytics').exists()).toBe(true)
    })

    it('should initialize with default data', async () => {
      wrapper = mount(EnrollmentDataAnalytics, {
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
      expect(wrapper.vm.analyticsData).toEqual({})
      expect(wrapper.vm.loading).toBe(false)
      expect(wrapper.vm.selectedTimeRange).toBe('current_month')
    })
  })

  describe('Analytics Data Loading', () => {
    it('should load enrollment analytics data', async () => {
      const mockAnalyticsData = {
        overview: {
          totalApplications: 450,
          approvedApplications: 380,
          pendingApplications: 45,
          rejectedApplications: 25,
          enrollmentRate: 0.84,
          averageProcessingTime: 3.2
        },
        trends: {
          monthly: [
            { month: '2024-01', applications: 85, enrollments: 72 },
            { month: '2024-02', applications: 92, enrollments: 78 },
            { month: '2024-03', applications: 110, enrollments: 95 }
          ],
          weekly: [
            { week: '2024-W01', applications: 20, enrollments: 17 },
            { week: '2024-W02', applications: 23, enrollments: 19 }
          ]
        },
        demographics: {
          ageGroups: [
            { age: '3岁', count: 120, percentage: 26.7 },
            { age: '4岁', count: 150, percentage: 33.3 },
            { age: '5岁', count: 130, percentage: 28.9 },
            { age: '6岁', count: 50, percentage: 11.1 }
          ],
          genderDistribution: {
            male: 245,
            female: 205,
            ratio: 1.2
          },
          geographicDistribution: [
            { district: '朝阳区', count: 120, percentage: 26.7 },
            { district: '海淀区', count: 95, percentage: 21.1 },
            { district: '西城区', count: 85, percentage: 18.9 }
          ]
        },
        conversion: {
          funnel: [
            { stage: '咨询', count: 600, percentage: 100 },
            { stage: '申请', count: 450, percentage: 75 },
            { stage: '面试', count: 400, percentage: 89 },
            { stage: '录取', count: 380, percentage: 95 },
            { stage: '缴费', count: 350, percentage: 92 }
          ],
          conversionRates: [
            { from: '咨询', to: '申请', rate: 75 },
            { from: '申请', to: '面试', rate: 89 },
            { from: '面试', to: '录取', rate: 95 },
            { from: '录取', to: '缴费', rate: 92 }
          ]
        },
        performance: {
          bySource: [
            { source: '官网', applications: 180, enrollments: 150, rate: 83.3 },
            { source: '推荐', applications: 120, enrollments: 108, rate: 90.0 },
            { source: '广告', applications: 90, enrollments: 72, rate: 80.0 },
            { source: '其他', applications: 60, enrollments: 20, rate: 33.3 }
          ],
          byChannel: [
            { channel: '线上', applications: 350, enrollments: 300, rate: 85.7 },
            { channel: '线下', applications: 100, enrollments: 50, rate: 50.0 }
          ]
        }
      }

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockAnalyticsData,
        message: 'success'
      })

      wrapper = mount(EnrollmentDataAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadAnalyticsData()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/enrollment/analytics')
      expect(wrapper.vm.analyticsData).toEqual(mockAnalyticsData)
    })

    it('should load data with time range filter', async () => {
      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: {},
        message: 'success'
      })

      wrapper = mount(EnrollmentDataAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.setData({ selectedTimeRange: 'last_quarter' })
      await wrapper.vm.loadAnalyticsData()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/enrollment/analytics?timeRange=last_quarter')
    })

    it('should load comparative data', async () => {
      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: {
          current: { applications: 450, enrollments: 380 },
          previous: { applications: 420, enrollments: 350 },
          growth: { applications: 7.1, enrollments: 8.6 }
        },
        message: 'success'
      })

      wrapper = mount(EnrollmentDataAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadComparativeData()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/enrollment/analytics/comparative')
      expect(wrapper.vm.comparativeData).toBeDefined()
    })
  })

  describe('Data Visualization', () => {
    it('should generate enrollment trend chart', async () => {
      wrapper = mount(EnrollmentDataAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      wrapper.vm.analyticsData = {
        trends: {
          monthly: [
            { month: '2024-01', applications: 85, enrollments: 72 },
            { month: '2024-02', applications: 92, enrollments: 78 },
            { month: '2024-03', applications: 110, enrollments: 95 }
          ]
        }
      }

      await wrapper.vm.generateTrendChart()
      await nextTick()

      expect(wrapper.vm.trendChartOptions).toBeDefined()
      expect(wrapper.vm.trendChartOptions.title).toBe('招生趋势分析')
      expect(wrapper.vm.trendChartOptions.xAxis).toBeDefined()
      expect(wrapper.vm.trendChartOptions.series).toBeDefined()
    })

    it('should generate demographic distribution chart', async () => {
      wrapper = mount(EnrollmentDataAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      wrapper.vm.analyticsData = {
        demographics: {
          ageGroups: [
            { age: '3岁', count: 120, percentage: 26.7 },
            { age: '4岁', count: 150, percentage: 33.3 },
            { age: '5岁', count: 130, percentage: 28.9 },
            { age: '6岁', count: 50, percentage: 11.1 }
          ]
        }
      }

      await wrapper.vm.generateDemographicChart()
      await nextTick()

      expect(wrapper.vm.demographicChartOptions).toBeDefined()
      expect(wrapper.vm.demographicChartOptions.title).toBe('年龄分布')
      expect(wrapper.vm.demographicChartOptions.series).toBeDefined()
    })

    it('should generate conversion funnel chart', async () => {
      wrapper = mount(EnrollmentDataAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      wrapper.vm.analyticsData = {
        conversion: {
          funnel: [
            { stage: '咨询', count: 600, percentage: 100 },
            { stage: '申请', count: 450, percentage: 75 },
            { stage: '面试', count: 400, percentage: 89 },
            { stage: '录取', count: 380, percentage: 95 },
            { stage: '缴费', count: 350, percentage: 92 }
          ]
        }
      }

      await wrapper.vm.generateFunnelChart()
      await nextTick()

      expect(wrapper.vm.funnelChartOptions).toBeDefined()
      expect(wrapper.vm.funnelChartOptions.title).toBe('转化漏斗')
    })

    it('should generate geographic distribution chart', async () => {
      wrapper = mount(EnrollmentDataAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      wrapper.vm.analyticsData = {
        demographics: {
          geographicDistribution: [
            { district: '朝阳区', count: 120, percentage: 26.7 },
            { district: '海淀区', count: 95, percentage: 21.1 },
            { district: '西城区', count: 85, percentage: 18.9 }
          ]
        }
      }

      await wrapper.vm.generateGeographicChart()
      await nextTick()

      expect(wrapper.vm.geographicChartOptions).toBeDefined()
      expect(wrapper.vm.geographicChartOptions.title).toBe('地区分布')
    })
  })

  describe('Statistical Analysis', () => {
    it('should calculate key metrics', async () => {
      wrapper = mount(EnrollmentDataAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      wrapper.vm.analyticsData = {
        overview: {
          totalApplications: 450,
          approvedApplications: 380,
          pendingApplications: 45,
          rejectedApplications: 25
        }
      }

      await wrapper.vm.calculateKeyMetrics()
      await nextTick()

      expect(wrapper.vm.keyMetrics).toBeDefined()
      expect(wrapper.vm.keyMetrics.approvalRate).toBeCloseTo(84.44, 2)
      expect(wrapper.vm.keyMetrics.rejectionRate).toBeCloseTo(5.56, 2)
      expect(wrapper.vm.keyMetrics.pendingRate).toBeCloseTo(10.0, 2)
    })

    it('should perform correlation analysis', async () => {
      wrapper = mount(EnrollmentDataAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      wrapper.vm.analyticsData = {
        performance: {
          bySource: [
            { source: '官网', applications: 180, enrollments: 150 },
            { source: '推荐', applications: 120, enrollments: 108 },
            { source: '广告', applications: 90, enrollments: 72 }
          ]
        }
      }

      await wrapper.vm.performCorrelationAnalysis()
      await nextTick()

      expect(wrapper.vm.correlationAnalysis).toBeDefined()
      expect(wrapper.vm.correlationAnalysis.sourcePerformance).toBeDefined()
    })

    it('should identify patterns and trends', async () => {
      wrapper = mount(EnrollmentDataAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      wrapper.vm.analyticsData = {
        trends: {
          monthly: [
            { month: '2024-01', applications: 85, enrollments: 72 },
            { month: '2024-02', applications: 92, enrollments: 78 },
            { month: '2024-03', applications: 110, enrollments: 95 },
            { month: '2024-04', applications: 125, enrollments: 108 }
          ]
        }
      }

      await wrapper.vm.identifyPatterns()
      await nextTick()

      expect(wrapper.vm.patterns).toBeDefined()
      expect(wrapper.vm.patterns.growthTrend).toBeDefined()
      expect(wrapper.vm.patterns.seasonalPatterns).toBeDefined()
    })
  })

  describe('Data Export', () => {
    it('should export analytics report', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: {
          downloadUrl: '/reports/enrollment-analytics-2024-01.pdf',
          generatedAt: '2024-01-16T10:30:00Z'
        },
        message: 'success'
      })

      wrapper = mount(EnrollmentDataAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.exportReport('pdf')
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/enrollment/analytics/export', {
        format: 'pdf',
        timeRange: wrapper.vm.selectedTimeRange
      })
    })

    it('should export raw data', async () => {
      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: new Blob(['csv data'], { type: 'text/csv' }),
        message: 'success'
      })

      wrapper = mount(EnrollmentDataAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.exportData('csv')
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/enrollment/analytics/data/export?format=csv')
    })

    it('should generate custom report', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: {
          reportId: 'RPT2024001',
          sections: ['overview', 'trends', 'demographics'],
          generatedAt: '2024-01-16T10:30:00Z'
        },
        message: 'success'
      })

      wrapper = mount(EnrollmentDataAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const customConfig = {
        sections: ['overview', 'trends', 'demographics'],
        timeRange: 'current_year',
        includeCharts: true,
        format: 'pdf'
      }

      await wrapper.vm.generateCustomReport(customConfig)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/enrollment/analytics/custom-report', customConfig)
    })
  })

  describe('Real-time Data Updates', () => {
    it('should handle real-time data updates', async () => {
      wrapper = mount(EnrollmentDataAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      // Simulate real-time update
      const updateData = {
        type: 'new_application',
        data: {
          timestamp: '2024-01-16T11:00:00Z',
          applicationId: 451,
          studentName: '新报名学生'
        }
      }

      await wrapper.vm.handleRealtimeUpdate(updateData)
      await nextTick()

      expect(wrapper.vm.realtimeUpdates).toContain(updateData)
      expect(wrapper.vm.lastUpdateTime).toBe(updateData.data.timestamp)
    })

    it('should refresh data automatically', async () => {
      wrapper = mount(EnrollmentDataAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const refreshSpy = vi.spyOn(wrapper.vm, 'loadAnalyticsData')
      
      // Simulate auto-refresh
      await wrapper.vm.startAutoRefresh()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(refreshSpy).toHaveBeenCalled()
    })
  })

  describe('Data Filtering and Segmentation', () => {
    it('should filter data by multiple criteria', async () => {
      wrapper = mount(EnrollmentDataAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const filters = {
        ageRange: ['3岁', '4岁'],
        districts: ['朝阳区', '海淀区'],
        sources: ['官网', '推荐'],
        dateRange: {
          start: '2024-01-01',
          end: '2024-01-31'
        }
      }

      await wrapper.vm.applyFilters(filters)
      await nextTick()

      expect(wrapper.vm.activeFilters).toEqual(filters)
      expect(wrapper.vm.filteredData).toBeDefined()
    })

    it('should segment data by custom criteria', async () => {
      wrapper = mount(EnrollmentDataAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const segmentation = {
        by: 'age_group',
        groups: ['3岁', '4岁', '5岁', '6岁'],
        metrics: ['applications', 'enrollments', 'conversion_rate']
      }

      await wrapper.vm.segmentData(segmentation)
      await nextTick()

      expect(wrapper.vm.segmentationResult).toBeDefined()
      expect(wrapper.vm.segmentationResult.by).toBe('age_group')
    })
  })

  describe('Predictive Analytics', () => {
    it('should generate enrollment predictions', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: {
          predictions: [
            { month: '2024-04', predicted: 135, confidence: 0.85 },
            { month: '2024-05', predicted: 142, confidence: 0.82 },
            { month: '2024-06', predicted: 128, confidence: 0.79 }
          ],
          modelAccuracy: 0.87,
          factors: ['seasonal_trends', 'historical_data', 'market_conditions']
        },
        message: 'success'
      })

      wrapper = mount(EnrollmentDataAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.generatePredictions()
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/enrollment/analytics/predict')
      expect(wrapper.vm.predictions).toBeDefined()
      expect(wrapper.vm.predictions.predictions).toBeDefined()
    })

    it('should analyze enrollment drivers', async () => {
      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: {
          drivers: [
            { factor: '教学质量', impact: 0.35, trend: 'increasing' },
            { factor: '地理位置', impact: 0.28, trend: 'stable' },
            { factor: '价格因素', impact: 0.22, trend: 'decreasing' },
            { factor: '口碑推荐', impact: 0.15, trend: 'increasing' }
          ],
          recommendations: [
            '加强教学质量宣传',
            '优化地理位置展示',
            '调整价格策略'
          ]
        },
        message: 'success'
      })

      wrapper = mount(EnrollmentDataAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.analyzeDrivers()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/enrollment/analytics/drivers')
      expect(wrapper.vm.driversAnalysis).toBeDefined()
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const { get } = await import('@/utils/request')
      get.mockRejectedValue(new Error('Network error'))

      wrapper = mount(EnrollmentDataAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadAnalyticsData()
      await nextTick()

      expect(wrapper.vm.error).toBe('Network error')
      expect(wrapper.vm.loading).toBe(false)
    })

    it('should handle empty data gracefully', async () => {
      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: {},
        message: 'success'
      })

      wrapper = mount(EnrollmentDataAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadAnalyticsData()
      await nextTick()

      expect(wrapper.vm.analyticsData).toEqual({})
      expect(wrapper.vm.hasData).toBe(false)
    })
  })

  describe('User Interactions', () => {
    it('should handle time range selection', async () => {
      wrapper = mount(EnrollmentDataAnalytics, {
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

      await wrapper.setData({ selectedTimeRange: 'current_year' })
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.selectedTimeRange).toBe('current_year')
    })

    it('should handle chart type switching', async () => {
      wrapper = mount(EnrollmentDataAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true,
            'el-radio-group': {
              template: '<div @change="$emit(\'change\', $event)"><slot /></div>',
              emits: ['change']
            }
          }
        }
      })

      await wrapper.setData({ selectedChartType: 'bar' })
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.selectedChartType).toBe('bar')
    })

    it('should handle refresh functionality', async () => {
      wrapper = mount(EnrollmentDataAnalytics, {
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

      const refreshSpy = vi.spyOn(wrapper.vm, 'loadAnalyticsData')
      await wrapper.find('.refresh-btn').trigger('click')

      expect(refreshSpy).toHaveBeenCalled()
    })
  })

  describe('Performance Monitoring', () => {
    it('should track data loading performance', async () => {
      wrapper = mount(EnrollmentDataAnalytics, {
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
      await wrapper.vm.loadAnalyticsData()
      const endTime = Date.now()

      expect(wrapper.vm.loadingTime).toBeDefined()
      expect(wrapper.vm.loadingTime).toBeGreaterThan(0)
    })

    it('should monitor chart rendering performance', async () => {
      wrapper = mount(EnrollmentDataAnalytics, {
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
      await wrapper.vm.generateTrendChart()
      const endTime = Date.now()

      expect(wrapper.vm.renderTime).toBeDefined()
      expect(wrapper.vm.renderTime).toBeGreaterThan(0)
    })
  })
})