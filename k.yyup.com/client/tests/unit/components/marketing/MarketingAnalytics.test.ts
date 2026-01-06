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
    ElProgress: {
      name: 'ElProgress',
      template: '<div class="el-progress" />'
    },
    ElDialog: {
      name: 'ElDialog',
      template: '<div class="el-dialog"><slot /></div>'
    },
    ElRadioGroup: {
      name: 'ElRadioGroup',
      template: '<div class="el-radio-group"><slot /></div>'
    },
    ElRadioButton: {
      name: 'ElRadioButton',
      template: '<div class="el-radio-button" />'
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

import MarketingAnalytics from '@/components/marketing/MarketingAnalytics.vue'

describe('MarketingAnalytics Component', () => {
  let router: any
  let pinia: any
  let wrapper: any

  beforeEach(async () => {
    vi.clearAllMocks()
    
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/marketing', component: { template: '<div>Marketing</div>' } }
      ]
    })
    pinia = createPinia()
    
    await router.push('/')
    await router.isReady()
  })

  describe('Component Initialization', () => {
    it('should render correctly with default props', async () => {
      wrapper = mount(MarketingAnalytics, {
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
      expect(wrapper.find('.marketing-analytics').exists()).toBe(true)
    })

    it('should initialize with default data', async () => {
      wrapper = mount(MarketingAnalytics, {
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

  describe('Marketing Performance Overview', () => {
    it('should load marketing performance data', async () => {
      const mockPerformanceData = {
        overview: {
          totalCampaigns: 8,
          activeCampaigns: 5,
          totalBudget: 280000,
          totalSpent: 145000,
          totalLeads: 680,
          totalConversions: 85,
          overallROI: 2.3,
          averageCTR: 4.8,
          averageConversionRate: 12.5
        },
        channelPerformance: [
          {
            channel: '微信',
            budget: 80000,
            spent: 42000,
            impressions: 120000,
            clicks: 6240,
            leads: 280,
            conversions: 35,
            ctr: 5.2,
            conversionRate: 12.5,
            costPerLead: 150,
            costPerConversion: 1200,
            roi: 2.5
          },
          {
            channel: '官网',
            budget: 60000,
            spent: 35000,
            impressions: 90000,
            clicks: 3960,
            leads: 180,
            conversions: 22,
            ctr: 4.4,
            conversionRate: 12.2,
            costPerLead: 194,
            costPerConversion: 1591,
            roi: 1.9
          },
          {
            channel: '线下活动',
            budget: 70000,
            spent: 32000,
            impressions: 45000,
            clicks: 1800,
            leads: 120,
            conversions: 16,
            ctr: 4.0,
            conversionRate: 13.3,
            costPerLead: 267,
            costPerConversion: 2000,
            roi: 2.1
          },
          {
            channel: '社交媒体',
            budget: 40000,
            spent: 20000,
            impressions: 80000,
            clicks: 3200,
            leads: 100,
            conversions: 12,
            ctr: 4.0,
            conversionRate: 12.0,
            costPerLead: 200,
            costPerConversion: 1667,
            roi: 2.0
          }
        ],
        campaignPerformance: [
          {
            id: 1,
            name: '春季招生推广',
            type: 'enrollment',
            budget: 100000,
            spent: 52000,
            leads: 250,
            conversions: 32,
            roi: 2.4,
            status: 'active'
          },
          {
            id: 2,
            name: '暑期夏令营宣传',
            type: 'summer_camp',
            budget: 80000,
            spent: 38000,
            leads: 180,
            conversions: 24,
            roi: 2.6,
            status: 'active'
          }
        ]
      }

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockPerformanceData,
        message: 'success'
      })

      wrapper = mount(MarketingAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadMarketingPerformance()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/marketing/analytics/performance')
      expect(wrapper.vm.performanceData).toEqual(mockPerformanceData)
    })

    it('should calculate key performance indicators', async () => {
      wrapper = mount(MarketingAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const performanceData = {
        totalBudget: 280000,
        totalSpent: 145000,
        totalLeads: 680,
        totalConversions: 85
      }

      const kpis = await wrapper.vm.calculateKPIs(performanceData)
      await nextTick()

      expect(kpis).toBeDefined()
      expect(kpis.budgetUtilization).toBeGreaterThan(0)
      expect(kpis.costPerLead).toBeGreaterThan(0)
      expect(kpis.costPerConversion).toBeGreaterThan(0)
      expect(kpis.leadToConversionRate).toBeGreaterThan(0)
    })

    it('should identify top performing channels', async () => {
      wrapper = mount(MarketingAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const channelData = [
        { channel: '微信', roi: 2.5, conversions: 35 },
        { channel: '官网', roi: 1.9, conversions: 22 },
        { channel: '线下活动', roi: 2.1, conversions: 16 },
        { channel: '社交媒体', roi: 2.0, conversions: 12 }
      ]

      const topChannels = await wrapper.vm.identifyTopPerformingChannels(channelData)
      await nextTick()

      expect(topChannels).toBeDefined()
      expect(topChannels.byROI).toBeDefined()
      expect(topChannels.byConversions).toBeDefined()
      expect(topChannels.byROI[0].channel).toBe('微信')
    })
  })

  describe('Audience Analysis', () => {
    it('should load audience analytics data', async () => {
      const mockAudienceData = {
        demographics: {
          ageDistribution: [
            { age: '25-30', percentage: 15 },
            { age: '31-35', percentage: 35 },
            { age: '36-40', percentage: 30 },
            { age: '41-45', percentage: 15 },
            { age: '46+', percentage: 5 }
          ],
          incomeDistribution: [
            { level: 'low', percentage: 20 },
            { level: 'medium', percentage: 45 },
            { level: 'high', percentage: 35 }
          ],
          educationDistribution: [
            { level: 'high_school', percentage: 10 },
            { level: 'bachelor', percentage: 60 },
            { level: 'master', percentage: 25 },
            { level: 'phd', percentage: 5 }
          ]
        },
        geographicDistribution: [
          { region: '朝阳区', count: 180, percentage: 26.5 },
          { region: '海淀区', count: 150, percentage: 22.1 },
          { region: '西城区', count: 120, percentage: 17.6 },
          { region: '东城区', count: 100, percentage: 14.7 },
          { region: '其他', count: 130, percentage: 19.1 }
        ],
        behaviorAnalysis: {
          preferredContactMethods: [
            { method: 'phone', percentage: 45 },
            { method: 'wechat', percentage: 35 },
            { method: 'email', percentage: 15 },
            { method: 'in_person', percentage: 5 }
          ],
          decisionFactors: [
            { factor: '教学质量', percentage: 85 },
            { factor: '地理位置', percentage: 70 },
            { factor: '价格', percentage: 65 },
            { factor: '口碑', percentage: 90 },
            { factor: '设施环境', percentage: 75 }
          ],
          informationSources: [
            { source: '朋友推荐', percentage: 40 },
            { source: '官网', percentage: 25 },
            { source: '社交媒体', percentage: 20 },
            { source: '线下活动', percentage: 15 }
          ]
        },
        segmentPerformance: [
          {
            segment: '高价值家庭',
            size: 150,
            conversionRate: 28.5,
            avgBudgetSensitivity: 'low',
            preferredChannels: ['线下活动', '官网']
          },
          {
            segment: '价格敏感家庭',
            size: 200,
            conversionRate: 18.2,
            avgBudgetSensitivity: 'high',
            preferredChannels: ['社交媒体', '微信']
          }
        ]
      }

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockAudienceData,
        message: 'success'
      })

      wrapper = mount(MarketingAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadAudienceAnalytics()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/marketing/analytics/audience')
      expect(wrapper.vm.audienceData).toEqual(mockAudienceData)
    })

    it('should analyze audience demographics', async () => {
      wrapper = mount(MarketingAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const demographicData = {
        ageDistribution: [
          { age: '25-30', percentage: 15 },
          { age: '31-35', percentage: 35 },
          { age: '36-40', percentage: 30 }
        ],
        incomeDistribution: [
          { level: 'low', percentage: 20 },
          { level: 'medium', percentage: 45 },
          { level: 'high', percentage: 35 }
        ]
      }

      const analysis = await wrapper.vm.analyzeDemographics(demographicData)
      await nextTick()

      expect(analysis).toBeDefined()
      expect(analysis.primaryAgeGroup).toBeDefined()
      expect(analysis.primaryIncomeLevel).toBeDefined()
      expect(analysis.targetingInsights).toBeDefined()
    })

    it('should identify audience behavior patterns', async () => {
      wrapper = mount(MarketingAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const behaviorData = {
        preferredContactMethods: [
          { method: 'phone', percentage: 45 },
          { method: 'wechat', percentage: 35 },
          { method: 'email', percentage: 15 },
          { method: 'in_person', percentage: 5 }
        ],
        decisionFactors: [
          { factor: '教学质量', percentage: 85 },
          { factor: '地理位置', percentage: 70 },
          { factor: '价格', percentage: 65 }
        ]
      }

      const patterns = await wrapper.vm.identifyBehaviorPatterns(behaviorData)
      await nextTick()

      expect(patterns).toBeDefined()
      expect(patterns.preferredContact).toBeDefined()
      expect(patterns.keyDecisionFactors).toBeDefined()
      expect(patterns.communicationStrategy).toBeDefined()
    })
  })

  describe('Campaign Effectiveness Analysis', () => {
    it('should load campaign effectiveness data', async () => {
      const mockEffectivenessData = {
        campaignComparison: [
          {
            id: 1,
            name: '春季招生推广',
            type: 'enrollment',
            startDate: '2024-01-01',
            endDate: '2024-03-31',
            budget: 100000,
            spent: 52000,
            leads: 250,
            conversions: 32,
            roi: 2.4,
            efficiency: 85,
            targetAchievement: 92
          },
          {
            id: 2,
            name: '暑期夏令营宣传',
            type: 'summer_camp',
            startDate: '2024-04-01',
            endDate: '2024-06-30',
            budget: 80000,
            spent: 38000,
            leads: 180,
            conversions: 24,
            roi: 2.6,
            efficiency: 78,
            targetAchievement: 88
          }
        ],
        channelEffectiveness: [
          {
            channel: '微信',
            totalCampaigns: 5,
            avgROI: 2.3,
            avgConversionRate: 12.8,
            costEfficiency: 82,
            audienceReach: 75
          },
          {
            channel: '官网',
            totalCampaigns: 4,
            avgROI: 1.9,
            avgConversionRate: 11.5,
            costEfficiency: 70,
            audienceReach: 60
          }
        ],
        contentPerformance: [
          {
            contentType: 'image',
            avgCTR: 4.2,
            avgEngagement: 3.5,
            avgConversionRate: 11.8,
            costEffectiveness: 75
          },
          {
            contentType: 'video',
            avgCTR: 5.8,
            avgEngagement: 4.2,
            avgConversionRate: 13.5,
            costEffectiveness: 85
          },
          {
            contentType: 'text',
            avgCTR: 3.1,
            avgEngagement: 2.8,
            avgConversionRate: 9.2,
            costEffectiveness: 65
          }
        ],
        timingAnalysis: {
          bestDays: ['周六', '周日'],
          bestTimes: ['10:00-12:00', '14:00-16:00'],
          seasonalTrends: [
            { month: '1-3', campaignType: 'enrollment', effectiveness: 'high' },
            { month: '4-6', campaignType: 'summer_camp', effectiveness: 'high' },
            { month: '7-8', campaignType: 'summer_camp', effectiveness: 'medium' },
            { month: '9-12', campaignType: 'enrollment', effectiveness: 'high' }
          ]
        }
      }

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockEffectivenessData,
        message: 'success'
      })

      wrapper = mount(MarketingAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadCampaignEffectiveness()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/marketing/analytics/campaign-effectiveness')
      expect(wrapper.vm.effectivenessData).toEqual(mockEffectivenessData)
    })

    it('should compare campaign performance', async () => {
      wrapper = mount(MarketingAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const campaignData = [
        {
          id: 1,
          name: '春季招生推广',
          roi: 2.4,
          conversionRate: 12.8,
          costPerConversion: 1625,
          efficiency: 85
        },
        {
          id: 2,
          name: '暑期夏令营宣传',
          roi: 2.6,
          conversionRate: 13.3,
          costPerConversion: 1583,
          efficiency: 78
        }
      ]

      const comparison = await wrapper.vm.compareCampaignPerformance(campaignData)
      await nextTick()

      expect(comparison).toBeDefined()
      expect(comparison.bestROI).toBeDefined()
      expect(comparison.mostEfficient).toBeDefined()
      expect(comparison.bestValue).toBeDefined()
    })

    it('should analyze optimal timing', async () => {
      wrapper = mount(MarketingAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const timingData = {
        dailyPerformance: [
          { day: '周一', avgCTR: 3.8, avgConversions: 8 },
          { day: '周二', avgCTR: 4.2, avgConversions: 10 },
          { day: '周三', avgCTR: 4.5, avgConversions: 12 },
          { day: '周四', avgCTR: 4.3, avgConversions: 11 },
          { day: '周五', avgCTR: 4.0, avgConversions: 9 },
          { day: '周六', avgCTR: 5.2, avgConversions: 18 },
          { day: '周日', avgCTR: 5.5, avgConversions: 20 }
        ],
        hourlyPerformance: [
          { hour: '9-10', avgCTR: 3.5, avgConversions: 5 },
          { hour: '10-11', avgCTR: 4.8, avgConversions: 12 },
          { hour: '11-12', avgCTR: 5.2, avgConversions: 15 },
          { hour: '14-15', avgCTR: 4.9, avgConversions: 13 },
          { hour: '15-16', avgCTR: 4.6, avgConversions: 11 }
        ]
      }

      const optimalTiming = await wrapper.vm.analyzeOptimalTiming(timingData)
      await nextTick()

      expect(optimalTiming).toBeDefined()
      expect(optimalTiming.bestDays).toBeDefined()
      expect(optimalTiming.bestTimes).toBeDefined()
      expect(optimalTiming.recommendations).toBeDefined()
    })
  })

  describe('ROI and Cost Analysis', () => {
    it('should load ROI analysis data', async () => {
      const mockROIData = {
        overallROI: {
          totalInvestment: 280000,
          totalRevenue: 644000,
          totalROI: 2.3,
          netProfit: 364000,
          profitMargin: 56.5
        },
        channelROI: [
          {
            channel: '微信',
            investment: 80000,
            revenue: 200000,
            roi: 2.5,
            netProfit: 120000,
            profitMargin: 60.0
          },
          {
            channel: '官网',
            investment: 60000,
            revenue: 114000,
            roi: 1.9,
            netProfit: 54000,
            profitMargin: 47.4
          },
          {
            channel: '线下活动',
            investment: 70000,
            revenue: 147000,
            roi: 2.1,
            netProfit: 77000,
            profitMargin: 52.4
          },
          {
            channel: '社交媒体',
            investment: 40000,
            revenue: 80000,
            roi: 2.0,
            netProfit: 40000,
            profitMargin: 50.0
          }
        ],
        campaignROI: [
          {
            campaignId: 1,
            campaignName: '春季招生推广',
            investment: 100000,
            revenue: 240000,
            roi: 2.4,
            paybackPeriod: 2.1,
            breakEvenPoint: 0.42
          },
          {
            campaignId: 2,
            campaignName: '暑期夏令营宣传',
            investment: 80000,
            revenue: 208000,
            roi: 2.6,
            paybackPeriod: 1.9,
            breakEvenPoint: 0.38
          }
        ],
        costOptimization: {
          currentAvgCostPerLead: 213,
          potentialSavings: 32000,
          optimizationOpportunities: [
            { area: '广告投放优化', potentialSaving: 15000 },
            { area: '渠道组合优化', potentialSaving: 10000 },
            { area: '内容优化', potentialSaving: 7000 }
          ]
        }
      }

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockROIData,
        message: 'success'
      })

      wrapper = mount(MarketingAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadROIAnalysis()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/marketing/analytics/roi')
      expect(wrapper.vm.roiData).toEqual(mockROIData)
    })

    it('should calculate ROI metrics', async () => {
      wrapper = mount(MarketingAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const investmentData = {
        investment: 100000,
        revenue: 240000,
        conversions: 32,
        avgRevenuePerConversion: 7500
      }

      const metrics = await wrapper.vm.calculateROIMetrics(investmentData)
      await nextTick()

      expect(metrics).toBeDefined()
      expect(metrics.roi).toBe(1.4) // (240000 - 100000) / 100000
      expect(metrics.profitMargin).toBeGreaterThan(0)
      expect(metrics.paybackPeriod).toBeDefined()
    })

    it('should identify cost optimization opportunities', async () => {
      wrapper = mount(MarketingAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const costData = {
        channels: [
          { channel: '微信', costPerLead: 150, industryAvg: 180 },
          { channel: '官网', costPerLead: 194, industryAvg: 160 },
          { channel: '线下活动', costPerLead: 267, industryAvg: 220 },
          { channel: '社交媒体', costPerLead: 200, industryAvg: 170 }
        ],
        campaigns: [
          { campaign: '春季招生', costPerConversion: 1625, budget: 100000 },
          { campaign: '暑期夏令营', costPerConversion: 1583, budget: 80000 }
        ]
      }

      const opportunities = await wrapper.vm.identifyCostOptimizationOpportunities(costData)
      await nextTick()

      expect(opportunities).toBeDefined()
      expect(opportunities.overperformingChannels).toBeDefined()
      expect(opportunities.underperformingChannels).toBeDefined()
      expect(opportunities.recommendations).toBeDefined()
    })
  })

  describe('Predictive Analytics', () => {
    it('should load predictive analytics data', async () => {
      const mockPredictiveData = {
        leadPrediction: {
          nextMonth: {
            predictedLeads: 220,
            confidence: 85,
            factors: ['季节性趋势', '历史数据', '市场活动']
          },
          nextQuarter: {
            predictedLeads: 650,
            confidence: 80,
            factors: ['招生季节', '经济环境', '竞争情况']
          },
          yearlyForecast: {
            predictedLeads: 2800,
            confidence: 75,
            factors: ['人口趋势', '教育政策', '经济发展']
          }
        },
        conversionPrediction: {
          currentRate: 12.5,
          predictedRate: 13.2,
          improvementFactors: ['优化销售流程', '改进跟进策略', '提升内容质量'],
          confidence: 78
        },
        budgetOptimization: {
          recommendedAllocation: [
            { channel: '微信', percentage: 35, reason: '高ROI表现' },
            { channel: '官网', percentage: 25, reason: '稳定转化' },
            { channel: '线下活动', percentage: 25, reason: '高质量线索' },
            { channel: '社交媒体', percentage: 15, reason: '品牌建设' }
          ],
          expectedImprovement: 15,
          confidence: 82
        },
        marketTrends: {
          emergingChannels: ['短视频平台', '教育直播'],
          changingPreferences: ['更多关注教育质量', '重视个性化服务'],
          competitiveLandscape: ['竞争加剧', '差异化需求增加']
        }
      }

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockPredictiveData,
        message: 'success'
      })

      wrapper = mount(MarketingAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadPredictiveAnalytics()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/marketing/analytics/predictive')
      expect(wrapper.vm.predictiveData).toEqual(mockPredictiveData)
    })

    it('should generate lead forecast', async () => {
      wrapper = mount(MarketingAnalytics, {
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
        { month: '2024-01', leads: 180 },
        { month: '2024-02', leads: 220 },
        { month: '2024-03', leads: 280 }
      ]

      const forecast = await wrapper.vm.generateLeadForecast(historicalData)
      await nextTick()

      expect(forecast).toBeDefined()
      expect(forecast.nextMonth).toBeGreaterThan(0)
      expect(forecast.trend).toBeDefined()
      expect(forecast.seasonality).toBeDefined()
    })

    it('should predict conversion trends', async () => {
      wrapper = mount(MarketingAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const conversionData = {
        historicalRates: [11.5, 12.0, 12.5, 12.2, 12.8],
        currentFactors: {
          salesProcess: 'optimized',
          contentQuality: 'improved',
          followUpStrategy: 'enhanced'
        }
      }

      const prediction = await wrapper.vm.predictConversionTrends(conversionData)
      await nextTick()

      expect(prediction).toBeDefined()
      expect(prediction.predictedRate).toBeGreaterThan(0)
      expect(prediction.confidence).toBeDefined()
      expect(prediction.improvementPotential).toBeDefined()
    })
  })

  describe('Reporting and Export', () => {
    it('should generate comprehensive marketing report', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: {
          reportUrl: '/api/marketing/reports/comprehensive-marketing-report.pdf',
          generatedAt: '2024-03-31T16:30:00Z',
          pages: 35
        },
        message: 'success'
      })

      wrapper = mount(MarketingAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const reportParams = {
        reportType: 'comprehensive',
        dateRange: '2024-01-01_to_2024-03-31',
        includeSections: ['performance', 'audience', 'roi', 'predictions'],
        format: 'pdf'
      }

      await wrapper.vm.generateMarketingReport(reportParams)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/marketing/reports/generate', reportParams)
      expect(wrapper.vm.reportResult).toBeDefined()
    })

    it('should export analytics data', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: {
          downloadUrl: '/api/marketing/export/analytics-data.xlsx',
          recordCount: 1250,
          exportedAt: '2024-03-31T16:35:00Z'
        },
        message: 'success'
      })

      wrapper = mount(MarketingAnalytics, {
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
        dataType: 'all',
        dateRange: '2024-Q1',
        format: 'excel',
        includePredictions: true
      }

      await wrapper.vm.exportAnalyticsData(exportParams)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/marketing/export/analytics', exportParams)
      expect(wrapper.vm.exportResult).toBeDefined()
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const { get } = await import('@/utils/request')
      get.mockRejectedValue(new Error('Network error'))

      wrapper = mount(MarketingAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadMarketingPerformance()
      await nextTick()

      expect(wrapper.vm.error).toBe('Network error')
      expect(wrapper.vm.loading).toBe(false)
    })

    it('should handle data validation errors', async () => {
      wrapper = mount(MarketingAnalytics, {
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
        totalBudget: -1000,
        totalSpent: 2000
      }

      await wrapper.vm.validateAnalyticsData(invalidData)
      await nextTick()

      expect(wrapper.vm.error).toContain('数据验证失败')
    })

    it('should handle prediction calculation errors', async () => {
      wrapper = mount(MarketingAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const insufficientData = []

      await wrapper.vm.generateLeadForecast(insufficientData)
      await nextTick()

      expect(wrapper.vm.error).toContain('数据不足')
    })
  })

  describe('User Interactions', () => {
    it('should handle time range selection', async () => {
      wrapper = mount(MarketingAnalytics, {
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

    it('should handle analytics type selection', async () => {
      wrapper = mount(MarketingAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true,
            'el-radio-group': {
              template: '<div class="el-radio-group" @change="$emit(\'change\', $event)"><slot /></div>',
              emits: ['change']
            }
          }
        }
      })

      await wrapper.setData({ selectedAnalyticsType: 'roi' })
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.selectedAnalyticsType).toBe('roi')
    })

    it('should trigger report generation on button click', async () => {
      wrapper = mount(MarketingAnalytics, {
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

      const generateSpy = vi.spyOn(wrapper.vm, 'generateMarketingReport')
      await wrapper.find('.generate-report-btn').trigger('click')

      expect(generateSpy).toHaveBeenCalled()
    })
  })

  describe('Performance Optimization', () => {
    it('should cache analytics data', async () => {
      wrapper = mount(MarketingAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const analyticsData = { key: 'performance_q1_2024', data: { roi: 2.3 } }
      
      // First call should cache
      await wrapper.vm.cacheAnalyticsData(analyticsData)
      await nextTick()
      
      // Second call should use cache
      const cached = await wrapper.vm.getCachedAnalyticsData('performance_q1_2024')
      
      expect(cached).toEqual(analyticsData.data)
    })

    it('should debounce parameter changes', async () => {
      wrapper = mount(MarketingAnalytics, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const updateSpy = vi.spyOn(wrapper.vm, 'updateAnalyticsParameters')
      
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