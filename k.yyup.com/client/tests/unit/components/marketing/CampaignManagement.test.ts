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
    ElTabs: {
      name: 'ElTabs',
      template: '<div class="el-tabs"><slot /></div>'
    },
    ElTabPane: {
      name: 'ElTabPane',
      template: '<div class="el-tab-pane" />'
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

import CampaignManagement from '@/components/marketing/CampaignManagement.vue'

describe('CampaignManagement Component', () => {
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
      wrapper = mount(CampaignManagement, {
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
      expect(wrapper.find('.campaign-management').exists()).toBe(true)
    })

    it('should initialize with default data', async () => {
      wrapper = mount(CampaignManagement, {
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
      expect(wrapper.vm.campaigns).toEqual([])
      expect(wrapper.vm.loading).toBe(false)
      expect(wrapper.vm.activeTab).toBe('active')
    })
  })

  describe('Campaign Creation and Management', () => {
    it('should load campaign list', async () => {
      const mockCampaigns = [
        {
          id: 1,
          name: '春季招生推广',
          type: 'enrollment',
          status: 'active',
          startDate: '2024-01-01',
          endDate: '2024-03-31',
          budget: 50000,
          spent: 25000,
          targetAudience: '3-6岁儿童家长',
          channels: ['微信', '官网', '线下活动'],
          expectedLeads: 200,
          actualLeads: 150,
          conversionRate: 12.5
        },
        {
          id: 2,
          name: '暑期夏令营宣传',
          type: 'summer_camp',
          status: 'scheduled',
          startDate: '2024-04-01',
          endDate: '2024-06-30',
          budget: 30000,
          spent: 0,
          targetAudience: '5-8岁儿童家长',
          channels: ['社交媒体', '学校合作'],
          expectedLeads: 100,
          actualLeads: 0,
          conversionRate: 0
        }
      ]

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockCampaigns,
        message: 'success'
      })

      wrapper = mount(CampaignManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadCampaigns()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/marketing/campaigns')
      expect(wrapper.vm.campaigns).toEqual(mockCampaigns)
    })

    it('should create new campaign', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 201,
        data: { id: 3, status: 'draft' },
        message: 'success'
      })

      wrapper = mount(CampaignManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const campaignData = {
        name: '秋季招生推广',
        type: 'enrollment',
        startDate: '2024-07-01',
        endDate: '2024-09-30',
        budget: 60000,
        targetAudience: '3-6岁儿童家长',
        channels: ['微信', '官网', '社区活动'],
        expectedLeads: 250,
        description: '2024年秋季学期招生推广活动'
      }

      await wrapper.vm.createCampaign(campaignData)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/marketing/campaigns', campaignData)
    })

    it('should update campaign', async () => {
      const { put } = await import('@/utils/request')
      put.mockResolvedValue({
        code: 200,
        data: { id: 1, status: 'paused' },
        message: 'success'
      })

      wrapper = mount(CampaignManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const updateData = {
        id: 1,
        budget: 55000,
        status: 'paused',
        channels: ['微信', '官网', '线下活动', '社交媒体']
      }

      await wrapper.vm.updateCampaign(updateData)
      await nextTick()

      expect(put).toHaveBeenCalledWith('/api/marketing/campaigns/1', updateData)
    })

    it('should validate campaign data', async () => {
      wrapper = mount(CampaignManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const invalidCampaign = {
        name: '',
        budget: 0,
        startDate: '',
        endDate: ''
      }

      const isValid = await wrapper.vm.validateCampaign(invalidCampaign)
      await nextTick()

      expect(isValid).toBe(false)
      expect(wrapper.vm.error).toContain('活动数据验证失败')
    })
  })

  describe('Campaign Performance Tracking', () => {
    it('should load campaign performance data', async () => {
      const mockPerformanceData = {
        campaignId: 1,
        metrics: {
          impressions: 50000,
          clicks: 2500,
          ctr: 5.0,
          leads: 150,
          conversions: 19,
          conversionRate: 12.7,
          costPerClick: 10.0,
          costPerLead: 166.7,
          costPerConversion: 1315.8,
          roi: 2.5
        },
        channelPerformance: [
          {
            channel: '微信',
            impressions: 20000,
            clicks: 1200,
            leads: 80,
            conversions: 10,
            spend: 12000
          },
          {
            channel: '官网',
            impressions: 15000,
            clicks: 800,
            leads: 45,
            conversions: 6,
            spend: 8000
          },
          {
            channel: '线下活动',
            impressions: 15000,
            clicks: 500,
            leads: 25,
            conversions: 3,
            spend: 5000
          }
        ],
        dailyPerformance: [
          { date: '2024-01-15', impressions: 1500, clicks: 75, leads: 5 },
          { date: '2024-01-16', impressions: 1600, clicks: 80, leads: 6 },
          { date: '2024-01-17', impressions: 1700, clicks: 85, leads: 7 }
        ]
      }

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockPerformanceData,
        message: 'success'
      })

      wrapper = mount(CampaignManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadCampaignPerformance(1)
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/marketing/campaigns/1/performance')
      expect(wrapper.vm.performanceData).toEqual(mockPerformanceData)
    })

    it('should calculate campaign ROI', async () => {
      wrapper = mount(CampaignManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const campaignData = {
        spent: 25000,
        conversions: 19,
        averageRevenuePerConversion: 3500
      }

      const roi = await wrapper.vm.calculateROI(campaignData)
      await nextTick()

      expect(roi).toBeGreaterThan(0)
      expect(roi).toBe(1.66) // (19 * 3500 - 25000) / 25000
    })

    it('should analyze channel effectiveness', async () => {
      wrapper = mount(CampaignManagement, {
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
        { channel: '微信', spend: 12000, leads: 80, conversions: 10 },
        { channel: '官网', spend: 8000, leads: 45, conversions: 6 },
        { channel: '线下活动', spend: 5000, leads: 25, conversions: 3 }
      ]

      const effectiveness = await wrapper.vm.analyzeChannelEffectiveness(channelData)
      await nextTick()

      expect(effectiveness).toBeDefined()
      expect(effectiveness.length).toBe(3)
      expect(effectiveness[0]).toHaveProperty('channel')
      expect(effectiveness[0]).toHaveProperty('costPerLead')
      expect(effectiveness[0]).toHaveProperty('costPerConversion')
    })

    it('should generate performance insights', async () => {
      wrapper = mount(CampaignManagement, {
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
        metrics: {
          ctr: 5.0,
          conversionRate: 12.7,
          costPerConversion: 1315.8
        },
        channelPerformance: [
          { channel: '微信', conversionRate: 12.5, costPerConversion: 1200 },
          { channel: '官网', conversionRate: 13.3, costPerConversion: 1333 },
          { channel: '线下活动', conversionRate: 12.0, costPerConversion: 1667 }
        ]
      }

      wrapper.vm.performanceData = performanceData
      await wrapper.vm.generatePerformanceInsights()
      await nextTick()

      expect(wrapper.vm.insights).toBeDefined()
      expect(wrapper.vm.insights.length).toBeGreaterThan(0)
    })
  })

  describe('Campaign Targeting', () => {
    it('should load audience segments', async () => {
      const mockSegments = [
        {
          id: 1,
          name: '3-4岁儿童家长',
          description: '家有3-4岁儿童的家长群体',
          size: 5000,
          characteristics: ['关注早期教育', '经济条件较好', '重视教育质量'],
          conversionRate: 15.2
        },
        {
          id: 2,
          name: '5-6岁儿童家长',
          description: '家有5-6岁儿童的家长群体',
          size: 3500,
          characteristics: ['关注幼小衔接', '时间紧张', '重视便利性'],
          conversionRate: 18.5
        }
      ]

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockSegments,
        message: 'success'
      })

      wrapper = mount(CampaignManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadAudienceSegments()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/marketing/audience-segments')
      expect(wrapper.vm.audienceSegments).toEqual(mockSegments)
    })

    it('should create audience segment', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 201,
        data: { id: 3, name: '新家长群体' },
        message: 'success'
      })

      wrapper = mount(CampaignManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const segmentData = {
        name: '4-5岁儿童家长',
        description: '家有4-5岁儿童的家长群体',
        criteria: {
          ageRange: [4, 5],
          incomeLevel: 'medium_high',
          educationConcern: 'high'
        },
        estimatedSize: 4000
      }

      await wrapper.vm.createAudienceSegment(segmentData)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/marketing/audience-segments', segmentData)
    })

    it('should analyze segment performance', async () => {
      wrapper = mount(CampaignManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const segmentPerformance = [
        {
          segmentId: 1,
          segmentName: '3-4岁儿童家长',
          reached: 2000,
          engaged: 300,
          converted: 45,
          conversionRate: 15.0,
          costPerAcquisition: 555.6
        },
        {
          segmentId: 2,
          segmentName: '5-6岁儿童家长',
          reached: 1500,
          engaged: 280,
          converted: 52,
          conversionRate: 18.6,
          costPerAcquisition: 480.8
        }
      ]

      wrapper.vm.segmentPerformance = segmentPerformance
      await wrapper.vm.analyzeSegmentPerformance()
      await nextTick()

      expect(wrapper.vm.segmentAnalysis).toBeDefined()
      expect(wrapper.vm.segmentAnalysis.bestPerformingSegment).toBeDefined()
      expect(wrapper.vm.segmentAnalysis.improvementOpportunities).toBeDefined()
    })
  })

  describe('Campaign Budget Management', () => {
    it('should load campaign budgets', async () => {
      const mockBudgets = [
        {
          campaignId: 1,
          totalBudget: 50000,
          allocatedBudget: 50000,
          spentBudget: 25000,
          remainingBudget: 25000,
          budgetUtilization: 50.0,
          channelAllocation: [
            { channel: '微信', budget: 20000, spent: 12000 },
            { channel: '官网', budget: 15000, spent: 8000 },
            { channel: '线下活动', budget: 15000, spent: 5000 }
          ]
        }
      ]

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockBudgets,
        message: 'success'
      })

      wrapper = mount(CampaignManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadCampaignBudgets()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/marketing/campaigns/budgets')
      expect(wrapper.vm.budgetData).toEqual(mockBudgets)
    })

    it('should allocate budget to channels', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: { allocationId: 1, status: 'allocated' },
        message: 'success'
      })

      wrapper = mount(CampaignManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const allocationData = {
        campaignId: 1,
        totalBudget: 60000,
        channelAllocation: [
          { channel: '微信', budget: 25000, percentage: 41.7 },
          { channel: '官网', budget: 20000, percentage: 33.3 },
          { channel: '线下活动', budget: 10000, percentage: 16.7 },
          { channel: '社交媒体', budget: 5000, percentage: 8.3 }
        ]
      }

      await wrapper.vm.allocateBudget(allocationData)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/marketing/campaigns/1/budget-allocation', allocationData)
    })

    it('should monitor budget utilization', async () => {
      wrapper = mount(CampaignManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const budgetData = {
        totalBudget: 50000,
        spentBudget: 25000,
        remainingBudget: 25000,
        daysRemaining: 45,
        dailySpendRate: 555.6
      }

      const utilization = await wrapper.vm.monitorBudgetUtilization(budgetData)
      await nextTick()

      expect(utilization).toBeDefined()
      expect(utilization.utilizationRate).toBe(50.0)
      expect(utilization.projectedOverspend).toBeDefined()
      expect(utilization.recommendations).toBeDefined()
    })

    it('should optimize budget allocation', async () => {
      wrapper = mount(CampaignManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const performanceData = [
        { channel: '微信', spend: 12000, conversions: 10, roi: 1.92 },
        { channel: '官网', spend: 8000, conversions: 6, roi: 1.63 },
        { channel: '线下活动', spend: 5000, conversions: 3, roi: 1.10 }
      ]

      const optimization = await wrapper.vm.optimizeBudgetAllocation(performanceData, 25000)
      await nextTick()

      expect(optimization).toBeDefined()
      expect(optimization.recommendedAllocation).toBeDefined()
      expect(optimization.expectedImprovement).toBeDefined()
    })
  })

  describe('Campaign Content Management', () => {
    it('should load campaign content', async () => {
      const mockContent = [
        {
          id: 1,
          campaignId: 1,
          type: 'image',
          title: '春季招生海报',
          description: '春季学期招生宣传海报',
          contentUrl: '/uploads/campaign1_poster.jpg',
          channel: '微信',
          status: 'active',
          impressions: 5000,
          clicks: 250,
          ctr: 5.0
        },
        {
          id: 2,
          campaignId: 1,
          type: 'video',
          title: '校园环境展示',
          description: '幼儿园环境展示视频',
          contentUrl: '/uploads/campaign1_video.mp4',
          channel: '官网',
          status: 'active',
          impressions: 3000,
          clicks: 180,
          ctr: 6.0
        }
      ]

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockContent,
        message: 'success'
      })

      wrapper = mount(CampaignManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadCampaignContent(1)
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/marketing/campaigns/1/content')
      expect(wrapper.vm.campaignContent).toEqual(mockContent)
    })

    it('should upload campaign content', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: { contentId: 3, url: '/uploads/new_content.jpg' },
        message: 'success'
      })

      wrapper = mount(CampaignManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const contentData = {
        campaignId: 1,
        type: 'image',
        title: '新宣传海报',
        description: '春季招生新海报',
        file: new File([''], 'poster.jpg', { type: 'image/jpeg' }),
        channels: ['微信', '官网']
      }

      await wrapper.vm.uploadCampaignContent(contentData)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/marketing/campaigns/1/content', expect.any(FormData))
    })

    it('should analyze content performance', async () => {
      wrapper = mount(CampaignManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const contentPerformance = [
        { type: 'image', avgCtr: 5.0, avgConversions: 8 },
        { type: 'video', avgCtr: 6.5, avgConversions: 12 },
        { type: 'text', avgCtr: 3.2, avgConversions: 5 }
      ]

      const analysis = await wrapper.vm.analyzeContentPerformance(contentPerformance)
      await nextTick()

      expect(analysis).toBeDefined()
      expect(analysis.bestPerformingType).toBeDefined()
      expect(analysis.performanceInsights).toBeDefined()
    })
  })

  describe('Campaign Analytics and Reporting', () => {
    it('should generate campaign analytics report', async () => {
      const mockAnalytics = {
        summary: {
          totalCampaigns: 5,
          activeCampaigns: 3,
          totalBudget: 180000,
          totalSpent: 95000,
          totalLeads: 420,
          totalConversions: 53,
          overallROI: 2.1,
          averageCTR: 4.8
        },
        topPerformingCampaigns: [
          {
            id: 1,
            name: '春季招生推广',
            roi: 2.5,
            conversionRate: 12.7,
            budgetUtilization: 50.0
          }
        ],
        channelAnalysis: [
          {
            channel: '微信',
            totalSpend: 45000,
            totalConversions: 25,
            avgROI: 2.2,
            avgCTR: 5.2
          }
        ],
        trends: {
          leadGrowth: 15.2,
          conversionImprovement: 8.5,
          costEfficiency: 12.3
        }
      }

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockAnalytics,
        message: 'success'
      })

      wrapper = mount(CampaignManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.generateCampaignAnalytics()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/marketing/analytics/campaigns')
      expect(wrapper.vm.analyticsData).toEqual(mockAnalytics)
    })

    it('should compare campaign performance', async () => {
      wrapper = mount(CampaignManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const campaignComparison = [
        {
          id: 1,
          name: '春季招生推广',
          budget: 50000,
          spent: 25000,
          leads: 150,
          conversions: 19,
          roi: 2.5
        },
        {
          id: 2,
          name: '暑期夏令营宣传',
          budget: 30000,
          spent: 15000,
          leads: 80,
          conversions: 12,
          roi: 2.8
        }
      ]

      wrapper.vm.campaignComparison = campaignComparison
      await wrapper.vm.compareCampaignPerformance()
      await nextTick()

      expect(wrapper.vm.comparisonResults).toBeDefined()
      expect(wrapper.vm.comparisonResults.bestROI).toBeDefined()
      expect(wrapper.vm.comparisonResults.bestEfficiency).toBeDefined()
    })

    it('should export campaign report', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: {
          downloadUrl: '/api/marketing/reports/campaign-report.xlsx',
          generatedAt: '2024-01-20T10:30:00Z'
        },
        message: 'success'
      })

      wrapper = mount(CampaignManagement, {
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
        campaignIds: [1, 2],
        dateRange: '2024-01-01_to_2024-01-31',
        format: 'excel',
        includeAnalytics: true
      }

      await wrapper.vm.exportCampaignReport(exportParams)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/marketing/reports/export', exportParams)
      expect(wrapper.vm.exportResult).toBeDefined()
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const { get } = await import('@/utils/request')
      get.mockRejectedValue(new Error('Network error'))

      wrapper = mount(CampaignManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadCampaigns()
      await nextTick()

      expect(wrapper.vm.error).toBe('Network error')
      expect(wrapper.vm.loading).toBe(false)
    })

    it('should handle validation errors', async () => {
      wrapper = mount(CampaignManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const invalidCampaign = {
        name: '',
        budget: -1000,
        startDate: '2024-01-01',
        endDate: '2023-12-31' // Invalid date range
      }

      await wrapper.vm.validateCampaign(invalidCampaign)
      await nextTick()

      expect(wrapper.vm.error).toContain('验证失败')
    })

    it('should handle file upload errors', async () => {
      const { post } = await import('@/utils/request')
      post.mockRejectedValue(new Error('Upload failed'))

      wrapper = mount(CampaignManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const contentData = {
        file: new File([''], 'test.jpg', { type: 'image/jpeg' })
      }

      await wrapper.vm.uploadCampaignContent(contentData)
      await nextTick()

      expect(wrapper.vm.error).toBe('Upload failed')
    })
  })

  describe('User Interactions', () => {
    it('should handle tab switching', async () => {
      wrapper = mount(CampaignManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true,
            'el-tabs': {
              template: '<div class="el-tabs"><slot /></div>'
            },
            'el-tab-pane': {
              template: '<div class="el-tab-pane" />'
            }
          }
        }
      })

      await wrapper.setData({ activeTab: 'completed' })
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.activeTab).toBe('completed')
    })

    it('should trigger campaign creation on button click', async () => {
      wrapper = mount(CampaignManagement, {
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

      const createSpy = vi.spyOn(wrapper.vm, 'showCreateCampaignDialog')
      await wrapper.find('.create-campaign-btn').trigger('click')

      expect(createSpy).toHaveBeenCalled()
    })

    it('should handle campaign status change', async () => {
      wrapper = mount(CampaignManagement, {
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

      const statusSpy = vi.spyOn(wrapper.vm, 'changeCampaignStatus')
      await wrapper.find('.status-change-btn').trigger('click')

      expect(statusSpy).toHaveBeenCalled()
    })
  })

  describe('Performance Optimization', () => {
    it('should cache campaign data', async () => {
      wrapper = mount(CampaignManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const campaignData = { key: 'campaign_1', data: { name: '测试活动' } }
      
      // First call should cache
      await wrapper.vm.cacheCampaignData(campaignData)
      await nextTick()
      
      // Second call should use cache
      const cached = await wrapper.vm.getCachedCampaignData('campaign_1')
      
      expect(cached).toEqual(campaignData.data)
    })

    it('should debounce analytics calculations', async () => {
      wrapper = mount(CampaignManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const calculateSpy = vi.spyOn(wrapper.vm, 'calculateAnalytics')
      
      // Trigger multiple rapid changes
      await wrapper.setData({ selectedDateRange: 'last_week' })
      await wrapper.setData({ selectedDateRange: 'last_month' })
      await wrapper.setData({ selectedDateRange: 'last_quarter' })
      
      await nextTick()
      
      // Should only be called once due to debouncing
      expect(calculateSpy).toHaveBeenCalledTimes(1)
    })
  })
})