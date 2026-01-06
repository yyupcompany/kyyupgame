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
    },
    ElTag: {
      name: 'ElTag',
      template: '<span class="el-tag"><slot /></span>'
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

import CustomerRelationshipManagement from '@/components/marketing/CustomerRelationshipManagement.vue'

describe('CustomerRelationshipManagement Component', () => {
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
      wrapper = mount(CustomerRelationshipManagement, {
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
      expect(wrapper.find('.customer-relationship-management').exists()).toBe(true)
    })

    it('should initialize with default data', async () => {
      wrapper = mount(CustomerRelationshipManagement, {
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
      expect(wrapper.vm.customers).toEqual([])
      expect(wrapper.vm.loading).toBe(false)
      expect(wrapper.vm.activeTab).toBe('leads')
    })
  })

  describe('Lead Management', () => {
    it('should load leads list', async () => {
      const mockLeads = [
        {
          id: 1,
          name: '张三',
          phone: '13900139001',
          email: 'zhangsan@example.com',
          childName: '小明',
          childAge: 4,
          source: '官网咨询',
          status: 'new',
          priority: 'high',
          assignedTo: '李老师',
          createdAt: '2024-01-15T10:30:00Z',
          lastContact: '2024-01-15T14:20:00Z',
          nextFollowUp: '2024-01-18T10:00:00Z',
          notes: '对双语教学感兴趣，希望了解更多详情'
        },
        {
          id: 2,
          name: '李四',
          phone: '13900139002',
          email: 'lisi@example.com',
          childName: '小红',
          childAge: 5,
          source: '朋友推荐',
          status: 'contacted',
          priority: 'medium',
          assignedTo: '王老师',
          createdAt: '2024-01-16T09:15:00Z',
          lastContact: '2024-01-17T16:30:00Z',
          nextFollowUp: '2024-01-20T14:00:00Z',
          notes: '关注户外活动和艺术课程'
        }
      ]

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockLeads,
        message: 'success'
      })

      wrapper = mount(CustomerRelationshipManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadLeads()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/marketing/leads')
      expect(wrapper.vm.leads).toEqual(mockLeads)
    })

    it('should create new lead', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 201,
        data: { id: 3, status: 'new' },
        message: 'success'
      })

      wrapper = mount(CustomerRelationshipManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const leadData = {
        name: '王五',
        phone: '13900139003',
        email: 'wangwu@example.com',
        childName: '小华',
        childAge: 3,
        source: '线下活动',
        priority: 'medium',
        notes: '在开放日活动上了解到的幼儿园'
      }

      await wrapper.vm.createLead(leadData)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/marketing/leads', leadData)
    })

    it('should update lead status', async () => {
      const { put } = await import('@/utils/request')
      put.mockResolvedValue({
        code: 200,
        data: { id: 1, status: 'qualified' },
        message: 'success'
      })

      wrapper = mount(CustomerRelationshipManagement, {
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
        status: 'qualified',
        priority: 'high',
        nextFollowUp: '2024-01-19T10:00:00Z'
      }

      await wrapper.vm.updateLead(updateData)
      await nextTick()

      expect(put).toHaveBeenCalledWith('/api/marketing/leads/1', updateData)
    })

    it('should assign lead to staff', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: { assignedTo: '赵老师', assignedAt: '2024-01-17T10:00:00Z' },
        message: 'success'
      })

      wrapper = mount(CustomerRelationshipManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const assignmentData = {
        leadId: 1,
        assignedTo: '赵老师',
        assignmentReason: '该客户对双语教学特别感兴趣'
      }

      await wrapper.vm.assignLead(assignmentData)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/marketing/leads/1/assign', assignmentData)
    })

    it('should validate lead data', async () => {
      wrapper = mount(CustomerRelationshipManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const invalidLead = {
        name: '',
        phone: '',
        childAge: 0
      }

      const isValid = await wrapper.vm.validateLead(invalidLead)
      await nextTick()

      expect(isValid).toBe(false)
      expect(wrapper.vm.error).toContain('潜在客户数据验证失败')
    })
  })

  describe('Customer Journey Tracking', () => {
    it('should load customer journey data', async () => {
      const mockJourneyData = {
        customerId: 1,
        customerName: '张三',
        childName: '小明',
        journeyStages: [
          {
            stage: '初次咨询',
            date: '2024-01-15T10:30:00Z',
            channel: '官网',
            interaction: '在线咨询',
            staff: '李老师',
            notes: '询问双语教学课程安排'
          },
          {
            stage: '校园参观',
            date: '2024-01-18T14:00:00Z',
            channel: '线下',
            interaction: '参观校园',
            staff: '王老师',
            notes: '对教学环境和设施表示满意'
          },
          {
            stage: '试听课程',
            date: '2024-01-22T09:30:00Z',
            channel: '线下',
            interaction: '参与试听课',
            staff: '张老师',
            notes: '孩子对课程反应积极'
          }
        ],
        currentStage: '试听课程',
        nextStep: '发送录取通知',
        conversionProbability: 85
      }

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockJourneyData,
        message: 'success'
      })

      wrapper = mount(CustomerRelationshipManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadCustomerJourney(1)
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/marketing/customers/1/journey')
      expect(wrapper.vm.journeyData).toEqual(mockJourneyData)
    })

    it('should add journey stage', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: { stageId: 4, stage: '缴费确认' },
        message: 'success'
      })

      wrapper = mount(CustomerRelationshipManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const stageData = {
        customerId: 1,
        stage: '缴费确认',
        date: '2024-01-25T10:00:00Z',
        channel: '线下',
        interaction: '办理缴费手续',
        staff: '财务老师',
        notes: '已完成春季学期缴费'
      }

      await wrapper.vm.addJourneyStage(stageData)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/marketing/customers/1/journey', stageData)
    })

    it('should analyze journey patterns', async () => {
      wrapper = mount(CustomerRelationshipManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const journeyData = [
        {
          customerId: 1,
          stages: ['初次咨询', '校园参观', '试听课程', '缴费确认'],
          duration: 10,
          converted: true
        },
        {
          customerId: 2,
          stages: ['初次咨询', '校园参观'],
          duration: 5,
          converted: false
        }
      ]

      wrapper.vm.allJourneys = journeyData
      await wrapper.vm.analyzeJourneyPatterns()
      await nextTick()

      expect(wrapper.vm.journeyPatterns).toBeDefined()
      expect(wrapper.vm.journeyPatterns.averageDuration).toBeDefined()
      expect(wrapper.vm.journeyPatterns.conversionRate).toBeDefined()
      expect(wrapper.vm.journeyPatterns.commonPaths).toBeDefined()
    })

    it('should predict conversion probability', async () => {
      wrapper = mount(CustomerRelationshipManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const customerData = {
        currentStage: '试听课程',
        journeyDuration: 7,
        interactionsCount: 5,
        staffRating: 4,
        parentEngagement: 'high'
      }

      const probability = await wrapper.vm.predictConversionProbability(customerData)
      await nextTick()

      expect(probability).toBeDefined()
      expect(probability).toBeGreaterThan(0)
      expect(probability).toBeLessThanOrEqual(100)
    })
  })

  describe('Communication Management', () => {
    it('should load communication history', async () => {
      const mockCommunications = [
        {
          id: 1,
          customerId: 1,
          type: 'phone',
          direction: 'outbound',
          date: '2024-01-18T14:00:00Z',
          duration: 1200,
          staff: '李老师',
          summary: '确认参观时间，介绍课程特色',
          followUpRequired: true,
          followUpDate: '2024-01-20T10:00:00Z'
        },
        {
          id: 2,
          customerId: 1,
          type: 'email',
          direction: 'outbound',
          date: '2024-01-19T09:30:00Z',
          subject: '课程安排详情',
          staff: '王老师',
          summary: '发送详细的课程安排和时间表',
          followUpRequired: false
        }
      ]

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockCommunications,
        message: 'success'
      })

      wrapper = mount(CustomerRelationshipManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadCommunicationHistory(1)
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/marketing/customers/1/communications')
      expect(wrapper.vm.communications).toEqual(mockCommunications)
    })

    it('should log new communication', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: { communicationId: 3, type: 'meeting' },
        message: 'success'
      })

      wrapper = mount(CustomerRelationshipManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const communicationData = {
        customerId: 1,
        type: 'meeting',
        direction: 'outbound',
        date: '2024-01-22T10:00:00Z',
        duration: 3600,
        staff: '张老师',
        summary: '面对面详细介绍教学理念和课程设置',
        followUpRequired: true,
        followUpDate: '2024-01-25T14:00:00Z'
      }

      await wrapper.vm.logCommunication(communicationData)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/marketing/customers/1/communications', communicationData)
    })

    it('should schedule follow-up communication', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: { scheduleId: 1, scheduledTime: '2024-01-25T14:00:00Z' },
        message: 'success'
      })

      wrapper = mount(CustomerRelationshipManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const scheduleData = {
        customerId: 1,
        type: 'phone',
        scheduledTime: '2024-01-25T14:00:00Z',
        assignedTo: '李老师',
        purpose: '跟进试听课程反馈',
        priority: 'high'
      }

      await wrapper.vm.scheduleFollowUp(scheduleData)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/marketing/customers/1/schedule-followup', scheduleData)
    })

    it('should analyze communication effectiveness', async () => {
      wrapper = mount(CustomerRelationshipManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const communicationData = [
        { type: 'phone', count: 15, conversionRate: 20, avgDuration: 900 },
        { type: 'email', count: 25, conversionRate: 12, avgDuration: 0 },
        { type: 'meeting', count: 8, conversionRate: 50, avgDuration: 3600 }
      ]

      const effectiveness = await wrapper.vm.analyzeCommunicationEffectiveness(communicationData)
      await nextTick()

      expect(effectiveness).toBeDefined()
      expect(effectiveness.length).toBe(3)
      expect(effectiveness[0]).toHaveProperty('type')
      expect(effectiveness[0]).toHaveProperty('effectivenessScore')
    })
  })

  describe('Customer Segmentation', () => {
    it('should load customer segments', async () => {
      const mockSegments = [
        {
          id: 1,
          name: '高价值客户',
          description: '经济条件好，教育投入意愿强的家庭',
          size: 150,
          characteristics: ['高收入', '重视教育', '决策迅速'],
          avgConversionTime: 7,
          conversionRate: 85
        },
        {
          id: 2,
          name: '价格敏感客户',
          description: '对价格比较敏感，需要更多优惠的家庭',
          size: 200,
          characteristics: ['中等收入', '比价倾向', '决策周期长'],
          avgConversionTime: 14,
          conversionRate: 45
        }
      ]

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockSegments,
        message: 'success'
      })

      wrapper = mount(CustomerRelationshipManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadCustomerSegments()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/marketing/customer-segments')
      expect(wrapper.vm.customerSegments).toEqual(mockSegments)
    })

    it('should create customer segment', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 201,
        data: { id: 3, name: '新客户群体' },
        message: 'success'
      })

      wrapper = mount(CustomerRelationshipManagement, {
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
        name: '艺术教育重视家庭',
        description: '特别重视艺术教育的家庭群体',
        criteria: {
          interests: ['艺术', '音乐', '美术'],
          budgetLevel: 'medium_high',
          educationPriority: 'arts'
        },
        estimatedSize: 80
      }

      await wrapper.vm.createCustomerSegment(segmentData)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/marketing/customer-segments', segmentData)
    })

    it('should assign customers to segments', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: { assignedCount: 25 },
        message: 'success'
      })

      wrapper = mount(CustomerRelationshipManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const assignmentData = {
        segmentId: 1,
        customerIds: [1, 2, 3, 4, 5],
        assignmentMethod: 'automatic'
      }

      await wrapper.vm.assignCustomersToSegment(assignmentData)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/marketing/customer-segments/1/assign', assignmentData)
    })

    it('should analyze segment behavior', async () => {
      wrapper = mount(CustomerRelationshipManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const segmentBehavior = {
        segmentId: 1,
        avgJourneyDuration: 8,
        preferredChannels: ['phone', 'meeting'],
        commonConcerns: ['教学质量', '师资力量'],
        priceSensitivity: 'low',
        decisionFactors: ['口碑', '教学理念']
      }

      const analysis = await wrapper.vm.analyzeSegmentBehavior(segmentBehavior)
      await nextTick()

      expect(analysis).toBeDefined()
      expect(analysis).toHaveProperty('engagementStrategy')
      expect(analysis).toHaveProperty('communicationPreferences')
    })
  })

  describe('Customer Satisfaction and Feedback', () => {
    it('should load customer feedback', async () => {
      const mockFeedback = [
        {
          id: 1,
          customerId: 1,
          type: 'survey',
          rating: 5,
          category: '教学质量',
          comment: '老师非常专业，孩子很喜欢',
          date: '2024-01-20T15:30:00Z',
          status: 'resolved',
          response: '感谢您的反馈，我们会继续努力提升教学质量'
        },
        {
          id: 2,
          customerId: 2,
          type: 'complaint',
          rating: 2,
          category: '餐饮服务',
          comment: '午餐种类太少，孩子不太喜欢',
          date: '2024-01-21T11:20:00Z',
          status: 'pending',
          response: null
        }
      ]

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockFeedback,
        message: 'success'
      })

      wrapper = mount(CustomerRelationshipManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadCustomerFeedback()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/marketing/customer-feedback')
      expect(wrapper.vm.feedbackData).toEqual(mockFeedback)
    })

    it('should respond to feedback', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: { responseId: 1, status: 'resolved' },
        message: 'success'
      })

      wrapper = mount(CustomerRelationshipManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const responseData = {
        feedbackId: 2,
        response: '我们已经增加了午餐种类，希望孩子能喜欢',
        actionTaken: '增加午餐种类',
        assignedTo: '后勤主管',
        dueDate: '2024-01-25T17:00:00Z'
      }

      await wrapper.vm.respondToFeedback(responseData)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/marketing/customer-feedback/2/respond', responseData)
    })

    it('should calculate satisfaction metrics', async () => {
      wrapper = mount(CustomerRelationshipManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const feedbackData = [
        { rating: 5, category: '教学质量' },
        { rating: 4, category: '教学质量' },
        { rating: 5, category: '服务质量' },
        { rating: 3, category: '餐饮服务' },
        { rating: 2, category: '餐饮服务' }
      ]

      const metrics = await wrapper.vm.calculateSatisfactionMetrics(feedbackData)
      await nextTick()

      expect(metrics).toBeDefined()
      expect(metrics.overallRating).toBeGreaterThan(0)
      expect(metrics.categoryRatings).toBeDefined()
      expect(metrics.improvementAreas).toBeDefined()
    })

    it('should generate satisfaction report', async () => {
      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: {
          reportUrl: '/api/marketing/reports/satisfaction-report.pdf',
          generatedAt: '2024-01-25T16:00:00Z'
        },
        message: 'success'
      })

      wrapper = mount(CustomerRelationshipManagement, {
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
        dateRange: '2024-01-01_to_2024-01-31',
        categories: ['all'],
        format: 'pdf'
      }

      await wrapper.vm.generateSatisfactionReport(reportParams)
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/marketing/reports/satisfaction', reportParams)
      expect(wrapper.vm.reportResult).toBeDefined()
    })
  })

  describe('Analytics and Reporting', () => {
    it('should generate CRM analytics', async () => {
      const mockAnalytics = {
        summary: {
          totalLeads: 350,
          activeLeads: 120,
          convertedLeads: 85,
          conversionRate: 24.3,
          avgConversionTime: 12.5,
          customerSatisfaction: 4.2
        },
        leadSources: [
          { source: '官网', count: 120, conversionRate: 28.3 },
          { source: '推荐', count: 85, conversionRate: 35.3 },
          { source: '线下活动', count: 75, conversionRate: 22.7 },
          { source: '社交媒体', count: 70, conversionRate: 18.6 }
        ],
        staffPerformance: [
          { name: '李老师', leads: 45, conversions: 15, conversionRate: 33.3 },
          { name: '王老师', leads: 38, conversions: 12, conversionRate: 31.6 },
          { name: '张老师', leads: 37, conversions: 11, conversionRate: 29.7 }
        ],
        trends: {
          leadGrowth: 15.2,
          conversionImprovement: 8.5,
          satisfactionImprovement: 5.3
        }
      }

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockAnalytics,
        message: 'success'
      })

      wrapper = mount(CustomerRelationshipManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.generateCRMAnalytics()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/marketing/analytics/crm')
      expect(wrapper.vm.analyticsData).toEqual(mockAnalytics)
    })

    it('should analyze lead conversion funnel', async () => {
      wrapper = mount(CustomerRelationshipManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const funnelData = [
        { stage: '新线索', count: 350, percentage: 100 },
        { stage: '已联系', count: 280, percentage: 80 },
        { stage: '有意向', count: 180, percentage: 51.4 },
        { stage: '已试听', count: 120, percentage: 34.3 },
        { stage: '已转化', count: 85, percentage: 24.3 }
      ]

      wrapper.vm.funnelData = funnelData
      await wrapper.vm.analyzeConversionFunnel()
      await nextTick()

      expect(wrapper.vm.funnelAnalysis).toBeDefined()
      expect(wrapper.vm.funnelAnalysis.dropoffPoints).toBeDefined()
      expect(wrapper.vm.funnelAnalysis.conversionRates).toBeDefined()
    })

    it('should export CRM data', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: {
          downloadUrl: '/api/marketing/export/crm-data.xlsx',
          recordCount: 350,
          exportedAt: '2024-01-25T16:30:00Z'
        },
        message: 'success'
      })

      wrapper = mount(CustomerRelationshipManagement, {
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
        dataType: 'leads',
        dateRange: '2024-01',
        format: 'excel',
        includeFeedback: false
      }

      await wrapper.vm.exportCRMData(exportParams)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/marketing/export/crm', exportParams)
      expect(wrapper.vm.exportResult).toBeDefined()
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const { get } = await import('@/utils/request')
      get.mockRejectedValue(new Error('Network error'))

      wrapper = mount(CustomerRelationshipManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadLeads()
      await nextTick()

      expect(wrapper.vm.error).toBe('Network error')
      expect(wrapper.vm.loading).toBe(false)
    })

    it('should handle validation errors', async () => {
      wrapper = mount(CustomerRelationshipManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const invalidLead = {
        name: '',
        phone: 'invalid_phone',
        childAge: -1
      }

      await wrapper.vm.validateLead(invalidLead)
      await nextTick()

      expect(wrapper.vm.error).toContain('验证失败')
    })

    it('should handle scheduling conflicts', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 400,
        message: '时间冲突，该时间段已有其他安排'
      })

      wrapper = mount(CustomerRelationshipManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const scheduleData = {
        customerId: 1,
        scheduledTime: '2024-01-25T14:00:00Z'
      }

      await wrapper.vm.scheduleFollowUp(scheduleData)
      await nextTick()

      expect(wrapper.vm.error).toContain('时间冲突')
    })
  })

  describe('User Interactions', () => {
    it('should handle tab switching', async () => {
      wrapper = mount(CustomerRelationshipManagement, {
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

      await wrapper.setData({ activeTab: 'customers' })
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.activeTab).toBe('customers')
    })

    it('should trigger lead creation on button click', async () => {
      wrapper = mount(CustomerRelationshipManagement, {
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

      const createSpy = vi.spyOn(wrapper.vm, 'showCreateLeadDialog')
      await wrapper.find('.create-lead-btn').trigger('click')

      expect(createSpy).toHaveBeenCalled()
    })

    it('should handle customer selection', async () => {
      wrapper = mount(CustomerRelationshipManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.setData({ selectedCustomer: { id: 1, name: '张三' } })
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.selectedCustomer.id).toBe(1)
    })
  })

  describe('Performance Optimization', () => {
    it('should cache customer data', async () => {
      wrapper = mount(CustomerRelationshipManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const customerData = { key: 'customer_1', data: { name: '张三' } }
      
      // First call should cache
      await wrapper.vm.cacheCustomerData(customerData)
      await nextTick()
      
      // Second call should use cache
      const cached = await wrapper.vm.getCachedCustomerData('customer_1')
      
      expect(cached).toEqual(customerData.data)
    })

    it('should debounce search operations', async () => {
      wrapper = mount(CustomerRelationshipManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const searchSpy = vi.spyOn(wrapper.vm, 'searchCustomers')
      
      // Trigger multiple rapid changes
      await wrapper.setData({ searchQuery: '张' })
      await wrapper.setData({ searchQuery: '张三' })
      await wrapper.setData({ searchQuery: '张三家' })
      
      await nextTick()
      
      // Should only be called once due to debouncing
      expect(searchSpy).toHaveBeenCalledTimes(1)
    })
  })
})