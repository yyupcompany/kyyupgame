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
    ElDatePicker: {
      name: 'ElDatePicker',
      template: '<div class="el-date-picker" />'
    },
    ElProgress: {
      name: 'ElProgress',
      template: '<div class="el-progress" />'
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

import EnrollmentAnalytics from '@/components/enrollment/EnrollmentAnalytics.vue'

describe('EnrollmentAnalytics Component', () => {
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
      wrapper = mount(EnrollmentAnalytics, {
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
      expect(wrapper.find('.enrollment-analytics').exists()).toBe(true)
    })

    it('should initialize with default data', async () => {
      wrapper = mount(EnrollmentAnalytics, {
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

  describe('Enrollment Trend Analysis', () => {
    it('should load enrollment trend data', async () => {
      const mockTrendData = {
        daily: [
          { date: '2024-01-01', applications: 5, enrollments: 3 },
          { date: '2024-01-02', applications: 8, enrollments: 6 },
          { date: '2024-01-03', applications: 12, enrollments: 9 }
        ],
        weekly: [
          { week: '2024-W01', applications: 35, enrollments: 28 },
          { week: '2024-W02', applications: 42, enrollments: 35 }
        ],
        monthly: [
          { month: '2024-01', applications: 150, enrollments: 120 },
          { month: '2024-02', applications: 180, enrollments: 145 }
        ]
      }

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockTrendData,
        message: 'success'
      })

      wrapper = mount(EnrollmentAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadEnrollmentTrends()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/enrollment/analytics/trends')
      expect(wrapper.vm.trendData).toEqual(mockTrendData)
    })

    it('should calculate growth rates', async () => {
      wrapper = mount(EnrollmentAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const monthlyData = [
        { month: '2024-01', applications: 150, enrollments: 120 },
        { month: '2024-02', applications: 180, enrollments: 145 },
        { month: '2024-03', applications: 210, enrollments: 170 }
      ]

      wrapper.vm.monthlyData = monthlyData
      await wrapper.vm.calculateGrowthRates()
      await nextTick()

      expect(wrapper.vm.growthRates).toBeDefined()
      expect(wrapper.vm.growthRates.applicationGrowth).toBeGreaterThan(0)
      expect(wrapper.vm.growthRates.enrollmentGrowth).toBeGreaterThan(0)
    })

    it('should identify seasonal patterns', async () => {
      wrapper = mount(EnrollmentAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const yearlyData = [
        { year: '2022', spring: 80, summer: 20, fall: 90, winter: 10 },
        { year: '2023', spring: 85, summer: 22, fall: 95, winter: 12 },
        { year: '2024', spring: 88, summer: 25, fall: 98, winter: 15 }
      ]

      wrapper.vm.yearlyData = yearlyData
      await wrapper.vm.identifySeasonalPatterns()
      await nextTick()

      expect(wrapper.vm.seasonalPatterns).toBeDefined()
      expect(wrapper.vm.seasonalPatterns.peakSeasons).toContain('fall')
      expect(wrapper.vm.seasonalPatterns.lowSeasons).toContain('winter')
    })

    it('should generate trend predictions', async () => {
      wrapper = mount(EnrollmentAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const historicalData = [
        { month: '2024-01', applications: 150, enrollments: 120 },
        { month: '2024-02', applications: 180, enrollments: 145 },
        { month: '2024-03', applications: 210, enrollments: 170 }
      ]

      wrapper.vm.historicalData = historicalData
      await wrapper.vm.generateTrendPredictions()
      await nextTick()

      expect(wrapper.vm.predictions).toBeDefined()
      expect(wrapper.vm.predictions.length).toBeGreaterThan(0)
      expect(wrapper.vm.predictions[0]).toHaveProperty('predictedApplications')
      expect(wrapper.vm.predictions[0]).toHaveProperty('predictedEnrollments')
    })
  })

  describe('Demographic Analysis', () => {
    it('should analyze age distribution', async () => {
      const mockAgeData = {
        '3-4岁': 45,
        '4-5岁': 78,
        '5-6岁': 92,
        '6-7岁': 35
      }

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockAgeData,
        message: 'success'
      })

      wrapper = mount(EnrollmentAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadAgeDistribution()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/enrollment/analytics/age-distribution')
      expect(wrapper.vm.ageDistribution).toEqual(mockAgeData)
    })

    it('should analyze gender distribution', async () => {
      const mockGenderData = {
        male: 125,
        female: 130
      }

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockGenderData,
        message: 'success'
      })

      wrapper = mount(EnrollmentAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadGenderDistribution()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/enrollment/analytics/gender-distribution')
      expect(wrapper.vm.genderDistribution).toEqual(mockGenderData)
    })

    it('should analyze regional distribution', async () => {
      const mockRegionalData = [
        { region: '朝阳区', count: 85, percentage: 33 },
        { region: '海淀区', count: 72, percentage: 28 },
        { region: '西城区', count: 52, percentage: 20 },
        { region: '东城区', count: 48, percentage: 19 }
      ]

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockRegionalData,
        message: 'success'
      })

      wrapper = mount(EnrollmentAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadRegionalDistribution()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/enrollment/analytics/regional-distribution')
      expect(wrapper.vm.regionalDistribution).toEqual(mockRegionalData)
    })

    it('should analyze family background', async () => {
      const mockFamilyData = {
        parentalEducation: {
          '本科及以上': 180,
          '专科': 45,
          '高中及以下': 30
        },
        familyIncome: {
          '10万以上': 120,
          '5-10万': 85,
          '5万以下': 50
        },
        occupation: {
          '企业职员': 95,
          '公务员': 65,
          '教师': 45,
          '其他': 50
        }
      }

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockFamilyData,
        message: 'success'
      })

      wrapper = mount(EnrollmentAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadFamilyBackground()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/enrollment/analytics/family-background')
      expect(wrapper.vm.familyBackground).toEqual(mockFamilyData)
    })
  })

  describe('Conversion Rate Analysis', () => {
    it('should analyze application to enrollment conversion', async () => {
      const mockConversionData = {
        totalApplications: 500,
        totalEnrollments: 255,
        conversionRate: 51,
        stageBreakdown: [
          { stage: '申请提交', count: 500, percentage: 100 },
          { stage: '材料审核', count: 480, percentage: 96 },
          { stage: '面试安排', count: 350, percentage: 70 },
          { stage: '录取通知', count: 280, percentage: 56 },
          { stage: '缴费确认', count: 255, percentage: 51 }
        ]
      }

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockConversionData,
        message: 'success'
      })

      wrapper = mount(EnrollmentAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadConversionRates()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/enrollment/analytics/conversion-rates')
      expect(wrapper.vm.conversionData).toEqual(mockConversionData)
    })

    it('should identify conversion bottlenecks', async () => {
      wrapper = mount(EnrollmentAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const conversionStages = [
        { stage: '申请提交', count: 500, percentage: 100 },
        { stage: '材料审核', count: 480, percentage: 96 },
        { stage: '面试安排', count: 350, percentage: 70 }, // Bottleneck
        { stage: '录取通知', count: 280, percentage: 56 },
        { stage: '缴费确认', count: 255, percentage: 51 }
      ]

      wrapper.vm.conversionStages = conversionStages
      await wrapper.vm.identifyConversionBottlenecks()
      await nextTick()

      expect(wrapper.vm.bottlenecks).toBeDefined()
      expect(wrapper.vm.bottlenecks.length).toBeGreaterThan(0)
      expect(wrapper.vm.bottlenecks[0].stage).toBe('面试安排')
    })

    it('should calculate conversion improvement potential', async () => {
      wrapper = mount(EnrollmentAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const currentRate = 51
      const targetRate = 65
      const totalApplications = 500

      const potential = await wrapper.vm.calculateImprovementPotential(currentRate, targetRate, totalApplications)
      await nextTick()

      expect(potential).toBeDefined()
      expect(potential.additionalEnrollments).toBe(70)
      expect(potential.improvementNeeded).toBe(14)
    })
  })

  describe('Source Analysis', () => {
    it('should analyze enrollment sources', async () => {
      const mockSourceData = [
        { source: '官网', count: 120, percentage: 47 },
        { source: '推荐', count: 65, percentage: 25 },
        { source: '社交媒体', count: 35, percentage: 14 },
        { source: '线下活动', count: 20, percentage: 8 },
        { source: '其他', count: 15, percentage: 6 }
      ]

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockSourceData,
        message: 'success'
      })

      wrapper = mount(EnrollmentAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadEnrollmentSources()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/enrollment/analytics/sources')
      expect(wrapper.vm.sourceData).toEqual(mockSourceData)
    })

    it('should analyze source effectiveness', async () => {
      wrapper = mount(EnrollmentAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const sourceEffectiveness = [
        { source: '官网', applications: 120, enrollments: 65, cost: 5000 },
        { source: '推荐', applications: 65, enrollments: 45, cost: 0 },
        { source: '社交媒体', applications: 35, enrollments: 20, cost: 2000 }
      ]

      wrapper.vm.sourceEffectiveness = sourceEffectiveness
      await wrapper.vm.analyzeSourceEffectiveness()
      await nextTick()

      expect(wrapper.vm.sourceROI).toBeDefined()
      expect(wrapper.vm.sourceROI.length).toBe(3)
      expect(wrapper.vm.sourceROI[0]).toHaveProperty('roi')
      expect(wrapper.vm.sourceROI[0]).toHaveProperty('costPerEnrollment')
    })

    it('should track source trends over time', async () => {
      const mockTrendData = [
        { month: '2024-01', official: 25, referral: 15, social: 8, offline: 5 },
        { month: '2024-02', official: 30, referral: 18, social: 10, offline: 7 },
        { month: '2024-03', official: 35, referral: 20, social: 12, offline: 8 }
      ]

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockTrendData,
        message: 'success'
      })

      wrapper = mount(EnrollmentAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadSourceTrends()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/enrollment/analytics/source-trends')
      expect(wrapper.vm.sourceTrends).toEqual(mockTrendData)
    })
  })

  describe('Performance Metrics', () => {
    it('should calculate key performance indicators', async () => {
      wrapper = mount(EnrollmentAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const metricsData = {
        totalApplications: 500,
        totalEnrollments: 255,
        averageProcessingTime: 7.5,
        customerSatisfaction: 4.2,
        targetEnrollment: 300
      }

      wrapper.vm.metricsData = metricsData
      await wrapper.vm.calculateKPIs()
      await nextTick()

      expect(wrapper.vm.kpis).toBeDefined()
      expect(wrapper.vm.kpis.enrollmentRate).toBe(51)
      expect(wrapper.vm.kpis.targetAchievementRate).toBe(85)
      expect(wrapper.vm.kpis.efficiencyScore).toBeDefined()
    })

    it('should generate performance scorecard', async () => {
      wrapper = mount(EnrollmentAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const scorecardData = {
        enrollmentRate: 51,
        targetAchievement: 85,
        processingEfficiency: 88,
        customerSatisfaction: 84,
        costEffectiveness: 92
      }

      wrapper.vm.scorecardData = scorecardData
      await wrapper.vm.generateScorecard()
      await nextTick()

      expect(wrapper.vm.scorecard).toBeDefined()
      expect(wrapper.vm.scorecard.overallScore).toBeGreaterThan(0)
      expect(wrapper.vm.scorecard.rating).toBeDefined()
    })

    it('should benchmark against industry standards', async () => {
      wrapper = mount(EnrollmentAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const benchmarkData = {
        current: { enrollmentRate: 51, satisfaction: 4.2, processingTime: 7.5 },
        industry: { enrollmentRate: 55, satisfaction: 4.0, processingTime: 8.0 },
        topPerformer: { enrollmentRate: 65, satisfaction: 4.5, processingTime: 5.0 }
      }

      wrapper.vm.benchmarkData = benchmarkData
      await wrapper.vm.generateBenchmarkReport()
      await nextTick()

      expect(wrapper.vm.benchmarkReport).toBeDefined()
      expect(wrapper.vm.benchmarkReport.comparisons).toBeDefined()
      expect(wrapper.vm.benchmarkReport.recommendations).toBeDefined()
    })
  })

  describe('Data Visualization', () => {
    it('should render trend charts', async () => {
      wrapper = mount(EnrollmentAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      wrapper.vm.trendData = {
        monthly: [
          { month: '2024-01', applications: 150, enrollments: 120 },
          { month: '2024-02', applications: 180, enrollments: 145 }
        ]
      }

      await wrapper.vm.renderTrendChart()
      await nextTick()

      expect(wrapper.vm.trendChart).toBeDefined()
    })

    it('should render demographic charts', async () => {
      wrapper = mount(EnrollmentAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      wrapper.vm.demographicData = {
        ageDistribution: { '3-4岁': 45, '4-5岁': 78, '5-6岁': 92 },
        genderDistribution: { male: 125, female: 130 }
      }

      await wrapper.vm.renderDemographicCharts()
      await nextTick()

      expect(wrapper.vm.demographicCharts).toBeDefined()
      expect(wrapper.vm.demographicCharts.length).toBe(2)
    })

    it('should render conversion funnel chart', async () => {
      wrapper = mount(EnrollmentAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      wrapper.vm.conversionData = {
        stageBreakdown: [
          { stage: '申请提交', count: 500 },
          { stage: '材料审核', count: 480 },
          { stage: '面试安排', count: 350 },
          { stage: '录取通知', count: 280 },
          { stage: '缴费确认', count: 255 }
        ]
      }

      await wrapper.vm.renderConversionFunnel()
      await nextTick()

      expect(wrapper.vm.conversionFunnelChart).toBeDefined()
    })
  })

  describe('Data Export', () => {
    it('should export analytics report', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: {
          downloadUrl: '/api/enrollment/analytics/export/report.pdf',
          generatedAt: '2024-01-15T10:30:00Z'
        },
        message: 'success'
      })

      wrapper = mount(EnrollmentAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const exportParams = {
        timeRange: '2024-01-01_to_2024-01-31',
        format: 'pdf',
        includeCharts: true,
        includeRecommendations: true
      }

      await wrapper.vm.exportAnalyticsReport(exportParams)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/enrollment/analytics/export', exportParams)
      expect(wrapper.vm.exportResult).toBeDefined()
      expect(wrapper.vm.exportResult.downloadUrl).toBeDefined()
    })

    it('should export raw data', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: {
          downloadUrl: '/api/enrollment/analytics/export/data.csv',
          recordCount: 500
        },
        message: 'success'
      })

      wrapper = mount(EnrollmentAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const exportParams = {
        dataType: 'enrollments',
        timeRange: '2024-01',
        format: 'csv'
      }

      await wrapper.vm.exportRawData(exportParams)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/enrollment/analytics/export/raw-data', exportParams)
      expect(wrapper.vm.rawDataExportResult).toBeDefined()
      expect(wrapper.vm.rawDataExportResult.recordCount).toBe(500)
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const { get } = await import('@/utils/request')
      get.mockRejectedValue(new Error('Network error'))

      wrapper = mount(EnrollmentAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadEnrollmentTrends()
      await nextTick()

      expect(wrapper.vm.error).toBe('Network error')
      expect(wrapper.vm.loading).toBe(false)
    })

    it('should handle data validation errors', async () => {
      wrapper = mount(EnrollmentAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const invalidData = {
        monthly: [
          { month: '2024-01', applications: -50, enrollments: 120 } // Invalid negative applications
        ]
      }

      wrapper.vm.trendData = invalidData
      await wrapper.vm.validateTrendData()
      await nextTick()

      expect(wrapper.vm.error).toContain('数据异常')
    })

    it('should handle chart rendering errors', async () => {
      wrapper = mount(EnrollmentAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      // Mock chart rendering failure
      const mockChart = {
        setOption: vi.fn().mockImplementation(() => {
          throw new Error('Chart rendering failed')
        })
      }

      wrapper.vm.trendChart = mockChart
      wrapper.vm.trendData = {
        monthly: [
          { month: '2024-01', applications: 150, enrollments: 120 }
        ]
      }

      await wrapper.vm.renderTrendChart()
      await nextTick()

      expect(wrapper.vm.error).toBe('Chart rendering failed')
    })
  })

  describe('User Interactions', () => {
    it('should handle time range selection', async () => {
      wrapper = mount(EnrollmentAnalytics, {
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

      await wrapper.setData({ selectedTimeRange: 'last_quarter' })
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.selectedTimeRange).toBe('last_quarter')
    })

    it('should handle chart type selection', async () => {
      wrapper = mount(EnrollmentAnalytics, {
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

      await wrapper.setData({ selectedChartType: 'bar' })
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.selectedChartType).toBe('bar')
    })

    it('should trigger data refresh on button click', async () => {
      wrapper = mount(EnrollmentAnalytics, {
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

  describe('Performance Optimization', () => {
    it('should cache analytics data', async () => {
      wrapper = mount(EnrollmentAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const analyticsData = { key: 'trends', data: { monthly: [] } }
      
      // First call should cache
      await wrapper.vm.cacheAnalyticsData(analyticsData)
      await nextTick()
      
      // Second call should use cache
      const cached = await wrapper.vm.getCachedAnalyticsData('trends')
      
      expect(cached).toEqual(analyticsData.data)
    })

    it('should debounce chart updates', async () => {
      wrapper = mount(EnrollmentAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const updateSpy = vi.spyOn(wrapper.vm, 'updateCharts')
      
      // Trigger multiple rapid changes
      await wrapper.setData({ selectedTimeRange: 'last_month' })
      await wrapper.setData({ selectedTimeRange: 'current_month' })
      await wrapper.setData({ selectedTimeRange: 'last_quarter' })
      
      await nextTick()
      
      // Should only be called once due to debouncing
      expect(updateSpy).toHaveBeenCalledTimes(1)
    })
  })
})