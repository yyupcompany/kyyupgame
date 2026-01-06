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

import TuitionManagement from '@/components/finance/TuitionManagement.vue'

describe('TuitionManagement Component', () => {
  let router: any
  let pinia: any
  let wrapper: any

  beforeEach(async () => {
    vi.clearAllMocks()
    
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/finance', component: { template: '<div>Finance</div>' } }
      ]
    })
    pinia = createPinia()
    
    await router.push('/')
    await router.isReady()
  })

  describe('Component Initialization', () => {
    it('should render correctly with default props', async () => {
      wrapper = mount(TuitionManagement, {
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
      expect(wrapper.find('.tuition-management').exists()).toBe(true)
    })

    it('should initialize with default data', async () => {
      wrapper = mount(TuitionManagement, {
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
      expect(wrapper.vm.tuitionPlans).toEqual([])
      expect(wrapper.vm.loading).toBe(false)
      expect(wrapper.vm.activeTab).toBe('plans')
    })
  })

  describe('Tuition Plan Management', () => {
    it('should load tuition plans', async () => {
      const mockPlans = [
        {
          id: 1,
          name: '标准学费计划',
          grade: '小班',
          baseAmount: 2500,
          semester: '春季',
          startDate: '2024-02-01',
          endDate: '2024-06-30',
          status: 'active',
          studentCount: 25
        },
        {
          id: 2,
          name: '优质学费计划',
          grade: '中班',
          baseAmount: 3500,
          semester: '春季',
          startDate: '2024-02-01',
          endDate: '2024-06-30',
          status: 'active',
          studentCount: 20
        }
      ]

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockPlans,
        message: 'success'
      })

      wrapper = mount(TuitionManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadTuitionPlans()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/finance/tuition-plans')
      expect(wrapper.vm.tuitionPlans).toEqual(mockPlans)
    })

    it('should create new tuition plan', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 201,
        data: { id: 3, name: '新学费计划' },
        message: 'success'
      })

      wrapper = mount(TuitionManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const planData = {
        name: '新学费计划',
        grade: '大班',
        baseAmount: 3000,
        semester: '秋季',
        startDate: '2024-09-01',
        endDate: '2025-01-31'
      }

      await wrapper.vm.createTuitionPlan(planData)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/finance/tuition-plans', planData)
    })

    it('should update tuition plan', async () => {
      const { put } = await import('@/utils/request')
      put.mockResolvedValue({
        code: 200,
        data: { id: 1, name: '更新的学费计划' },
        message: 'success'
      })

      wrapper = mount(TuitionManagement, {
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
        baseAmount: 2800,
        status: 'inactive'
      }

      await wrapper.vm.updateTuitionPlan(updateData)
      await nextTick()

      expect(put).toHaveBeenCalledWith('/api/finance/tuition-plans/1', updateData)
    })

    it('should validate tuition plan data', async () => {
      wrapper = mount(TuitionManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const invalidPlan = {
        name: '',
        baseAmount: 0,
        grade: ''
      }

      const isValid = await wrapper.vm.validateTuitionPlan(invalidPlan)
      await nextTick()

      expect(isValid).toBe(false)
      expect(wrapper.vm.error).toContain('学费计划数据验证失败')
    })
  })

  describe('Fee Structure Management', () => {
    it('should load fee structures', async () => {
      const mockFeeStructures = [
        {
          id: 1,
          tuitionPlanId: 1,
          feeType: 'tuition',
          amount: 2500,
          description: '基础学费',
          isRequired: true,
          paymentSchedule: 'monthly'
        },
        {
          id: 2,
          tuitionPlanId: 1,
          feeType: 'meal',
          amount: 300,
          description: '餐费',
          isRequired: false,
          paymentSchedule: 'monthly'
        }
      ]

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockFeeStructures,
        message: 'success'
      })

      wrapper = mount(TuitionManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadFeeStructures(1)
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/finance/tuition-plans/1/fee-structures')
      expect(wrapper.vm.feeStructures).toEqual(mockFeeStructures)
    })

    it('should add fee structure item', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 201,
        data: { id: 3, feeType: 'activity' },
        message: 'success'
      })

      wrapper = mount(TuitionManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const feeData = {
        tuitionPlanId: 1,
        feeType: 'activity',
        amount: 200,
        description: '活动费',
        isRequired: false,
        paymentSchedule: 'semester'
      }

      await wrapper.vm.addFeeStructure(feeData)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/finance/tuition-plans/1/fee-structures', feeData)
    })

    it('should calculate total tuition amount', async () => {
      wrapper = mount(TuitionManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const feeStructures = [
        { amount: 2500, isRequired: true },
        { amount: 300, isRequired: false },
        { amount: 200, isRequired: true }
      ]

      const total = await wrapper.vm.calculateTotalTuition(feeStructures)
      await nextTick()

      expect(total).toBe(2700) // Only required fees
    })

    it('should validate fee structure amounts', async () => {
      wrapper = mount(TuitionManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const invalidFee = {
        amount: -100,
        feeType: 'tuition'
      }

      const isValid = await wrapper.vm.validateFeeAmount(invalidFee.amount)
      await nextTick()

      expect(isValid).toBe(false)
      expect(wrapper.vm.error).toContain('费用金额必须大于0')
    })
  })

  describe('Discount Management', () => {
    it('should load discount policies', async () => {
      const mockDiscounts = [
        {
          id: 1,
          name: '早鸟优惠',
          type: 'early_bird',
          discountRate: 0.1,
          maxAmount: 500,
          validFrom: '2024-01-01',
          validTo: '2024-01-31',
          conditions: '在1月31日前缴费'
        },
        {
          id: 2,
          name: '兄弟姐妹优惠',
          type: 'sibling',
          discountRate: 0.05,
          maxAmount: 300,
          validFrom: '2024-02-01',
          validTo: '2024-12-31',
          conditions: '有兄弟姐妹在本园就读'
        }
      ]

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockDiscounts,
        message: 'success'
      })

      wrapper = mount(TuitionManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadDiscountPolicies()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/finance/discount-policies')
      expect(wrapper.vm.discountPolicies).toEqual(mockDiscounts)
    })

    it('should create discount policy', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 201,
        data: { id: 3, name: '新优惠政策' },
        message: 'success'
      })

      wrapper = mount(TuitionManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const discountData = {
        name: '新优惠政策',
        type: 'special',
        discountRate: 0.08,
        maxAmount: 400,
        validFrom: '2024-03-01',
        validTo: '2024-03-31',
        conditions: '特殊活动期间'
      }

      await wrapper.vm.createDiscountPolicy(discountData)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/finance/discount-policies', discountData)
    })

    it('should calculate discount amount', async () => {
      wrapper = mount(TuitionManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const discount = {
        type: 'percentage',
        discountRate: 0.1,
        maxAmount: 500
      }

      const amount = 3000
      const discountAmount = await wrapper.vm.calculateDiscount(amount, discount)
      await nextTick()

      expect(discountAmount).toBe(300) // 10% of 3000
    })

    it('should validate discount eligibility', async () => {
      wrapper = mount(TuitionManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const discount = {
        validFrom: '2024-01-01',
        validTo: '2024-01-31',
        conditions: '早鸟优惠'
      }

      const studentData = {
        enrollmentDate: '2024-01-15',
        hasSibling: false
      }

      const isEligible = await wrapper.vm.validateDiscountEligibility(discount, studentData)
      await nextTick()

      expect(isEligible).toBe(true)
    })
  })

  describe('Payment Schedule Management', () => {
    it('should load payment schedules', async () => {
      const mockSchedules = [
        {
          id: 1,
          tuitionPlanId: 1,
          scheduleType: 'monthly',
          installments: 5,
          firstPaymentDate: '2024-02-01',
          lastPaymentDate: '2024-06-01',
          amountPerInstallment: 500
        },
        {
          id: 2,
          tuitionPlanId: 1,
          scheduleType: 'semester',
          installments: 2,
          firstPaymentDate: '2024-02-01',
          lastPaymentDate: '2024-06-01',
          amountPerInstallment: 1250
        }
      ]

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockSchedules,
        message: 'success'
      })

      wrapper = mount(TuitionManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadPaymentSchedules(1)
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/finance/tuition-plans/1/payment-schedules')
      expect(wrapper.vm.paymentSchedules).toEqual(mockSchedules)
    })

    it('should create payment schedule', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 201,
        data: { id: 3, scheduleType: 'quarterly' },
        message: 'success'
      })

      wrapper = mount(TuitionManagement, {
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
        tuitionPlanId: 1,
        scheduleType: 'quarterly',
        installments: 4,
        firstPaymentDate: '2024-02-01',
        amountPerInstallment: 625
      }

      await wrapper.vm.createPaymentSchedule(scheduleData)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/finance/tuition-plans/1/payment-schedules', scheduleData)
    })

    it('should generate payment installments', async () => {
      wrapper = mount(TuitionManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const schedule = {
        totalAmount: 2500,
        installments: 5,
        firstPaymentDate: '2024-02-01',
        scheduleType: 'monthly'
      }

      const installments = await wrapper.vm.generateInstallments(schedule)
      await nextTick()

      expect(installments).toBeDefined()
      expect(installments.length).toBe(5)
      expect(installments[0]).toHaveProperty('dueDate')
      expect(installments[0]).toHaveProperty('amount')
    })

    it('should validate payment schedule dates', async () => {
      wrapper = mount(TuitionManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const invalidSchedule = {
        firstPaymentDate: '2024-01-01',
        lastPaymentDate: '2023-12-31' // Invalid: before first payment
      }

      const isValid = await wrapper.vm.validateScheduleDates(invalidSchedule)
      await nextTick()

      expect(isValid).toBe(false)
      expect(wrapper.vm.error).toContain('付款日期设置错误')
    })
  })

  describe('Student Tuition Assignment', () => {
    it('should assign tuition plan to student', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: { assignmentId: 1, status: 'assigned' },
        message: 'success'
      })

      wrapper = mount(TuitionManagement, {
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
        studentId: 1,
        tuitionPlanId: 1,
        effectiveDate: '2024-02-01',
        discountPolicyId: 1,
        paymentScheduleId: 1
      }

      await wrapper.vm.assignTuitionPlan(assignmentData)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/finance/student-tuition-assignments', assignmentData)
    })

    it('should calculate student tuition amount', async () => {
      wrapper = mount(TuitionManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const baseAmount = 2500
      const discount = { discountRate: 0.1, maxAmount: 500 }
      const optionalFees = [{ amount: 300, isSelected: true }]

      const totalAmount = await wrapper.vm.calculateStudentTuition(baseAmount, discount, optionalFees)
      await nextTick()

      expect(totalAmount).toBe(2700) // 2500 - 250(discount) + 300(optional fee)
    })

    it('should load student tuition assignments', async () => {
      const mockAssignments = [
        {
          id: 1,
          studentId: 1,
          studentName: '张三',
          tuitionPlanName: '标准学费计划',
          totalAmount: 2500,
          paidAmount: 1250,
          status: 'partial',
          nextPaymentDate: '2024-03-01'
        }
      ]

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockAssignments,
        message: 'success'
      })

      wrapper = mount(TuitionManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadStudentAssignments()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/finance/student-tuition-assignments')
      expect(wrapper.vm.studentAssignments).toEqual(mockAssignments)
    })
  })

  describe('Tuition Analytics', () => {
    it('should generate tuition revenue analytics', async () => {
      const mockAnalytics = {
        totalRevenue: 625000,
        collectedRevenue: 487500,
        outstandingRevenue: 137500,
        collectionRate: 78,
        monthlyRevenue: [
          { month: '2024-01', amount: 125000 },
          { month: '2024-02', amount: 150000 },
          { month: '2024-03', amount: 212500 }
        ],
        planDistribution: [
          { plan: '标准学费计划', revenue: 375000, students: 150 },
          { plan: '优质学费计划', revenue: 250000, students: 71 }
        ]
      }

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockAnalytics,
        message: 'success'
      })

      wrapper = mount(TuitionManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadTuitionAnalytics()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/finance/tuition-analytics')
      expect(wrapper.vm.tuitionAnalytics).toEqual(mockAnalytics)
    })

    it('should analyze tuition collection trends', async () => {
      wrapper = mount(TuitionManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const collectionData = [
        { month: '2024-01', expected: 125000, collected: 118750, rate: 95 },
        { month: '2024-02', expected: 150000, collected: 142500, rate: 95 },
        { month: '2024-03', expected: 212500, collected: 226250, rate: 106.5 }
      ]

      wrapper.vm.collectionData = collectionData
      await wrapper.vm.analyzeCollectionTrends()
      await nextTick()

      expect(wrapper.vm.collectionTrends).toBeDefined()
      expect(wrapper.vm.collectionTrends.averageRate).toBeGreaterThan(0)
      expect(wrapper.vm.collectionTrends.trend).toBeDefined()
    })

    it('should predict future revenue', async () => {
      wrapper = mount(TuitionManagement, {
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
        { month: '2024-01', revenue: 125000 },
        { month: '2024-02', revenue: 150000 },
        { month: '2024-03', revenue: 212500 }
      ]

      wrapper.vm.historicalRevenue = historicalData
      await wrapper.vm.predictFutureRevenue()
      await nextTick()

      expect(wrapper.vm.revenuePrediction).toBeDefined()
      expect(wrapper.vm.revenuePrediction.nextMonth).toBeGreaterThan(0)
      expect(wrapper.vm.revenuePrediction.quarterly).toBeGreaterThan(0)
    })
  })

  describe('Reporting and Export', () => {
    it('should generate tuition report', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: {
          reportUrl: '/api/finance/reports/tuition-report.pdf',
          generatedAt: '2024-03-15T10:30:00Z'
        },
        message: 'success'
      })

      wrapper = mount(TuitionManagement, {
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
        dateRange: '2024-01-01_to_2024-03-31',
        format: 'pdf',
        includeAnalytics: true
      }

      await wrapper.vm.generateTuitionReport(reportParams)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/finance/reports/tuition', reportParams)
      expect(wrapper.vm.reportResult).toBeDefined()
    })

    it('should export tuition data', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: {
          downloadUrl: '/api/finance/export/tuition-data.xlsx',
          recordCount: 221
        },
        message: 'success'
      })

      wrapper = mount(TuitionManagement, {
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
        dataType: 'tuition_assignments',
        dateRange: '2024-03',
        format: 'excel'
      }

      await wrapper.vm.exportTuitionData(exportParams)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/finance/export/tuition', exportParams)
      expect(wrapper.vm.exportResult).toBeDefined()
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const { get } = await import('@/utils/request')
      get.mockRejectedValue(new Error('Network error'))

      wrapper = mount(TuitionManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadTuitionPlans()
      await nextTick()

      expect(wrapper.vm.error).toBe('Network error')
      expect(wrapper.vm.loading).toBe(false)
    })

    it('should handle validation errors', async () => {
      wrapper = mount(TuitionManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const invalidPlan = {
        name: '',
        baseAmount: -100
      }

      await wrapper.vm.validateTuitionPlan(invalidPlan)
      await nextTick()

      expect(wrapper.vm.error).toContain('验证失败')
    })

    it('should handle calculation errors', async () => {
      wrapper = mount(TuitionManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      // Simulate calculation error
      await wrapper.vm.calculateDiscount('invalid_amount', {})
      await nextTick()

      expect(wrapper.vm.error).toContain('计算错误')
    })
  })

  describe('User Interactions', () => {
    it('should handle tab switching', async () => {
      wrapper = mount(TuitionManagement, {
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

      await wrapper.setData({ activeTab: 'discounts' })
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.activeTab).toBe('discounts')
    })

    it('should trigger plan creation on button click', async () => {
      wrapper = mount(TuitionManagement, {
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

      const createSpy = vi.spyOn(wrapper.vm, 'showCreatePlanDialog')
      await wrapper.find('.create-plan-btn').trigger('click')

      expect(createSpy).toHaveBeenCalled()
    })

    it('should handle report export', async () => {
      wrapper = mount(TuitionManagement, {
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

      const exportSpy = vi.spyOn(wrapper.vm, 'exportTuitionData')
      await wrapper.find('.export-btn').trigger('click')

      expect(exportSpy).toHaveBeenCalled()
    })
  })

  describe('Performance Optimization', () => {
    it('should cache tuition plan data', async () => {
      wrapper = mount(TuitionManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const planData = { id: 1, name: '测试计划' }
      
      // First call should cache
      await wrapper.vm.cacheTuitionPlan(planData)
      await nextTick()
      
      // Second call should use cache
      const cached = await wrapper.vm.getCachedTuitionPlan(1)
      
      expect(cached).toEqual(planData)
    })

    it('should debounce analytics calculations', async () => {
      wrapper = mount(TuitionManagement, {
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
      await wrapper.setData({ selectedDateRange: 'last_month' })
      await wrapper.setData({ selectedDateRange: 'current_month' })
      await wrapper.setData({ selectedDateRange: 'last_quarter' })
      
      await nextTick()
      
      // Should only be called once due to debouncing
      expect(calculateSpy).toHaveBeenCalledTimes(1)
    })
  })
})