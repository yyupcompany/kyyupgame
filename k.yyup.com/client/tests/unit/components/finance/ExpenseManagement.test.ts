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
    ElUpload: {
      name: 'ElUpload',
      template: '<div class="el-upload" />'
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

import ExpenseManagement from '@/components/finance/ExpenseManagement.vue'

describe('ExpenseManagement Component', () => {
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
      wrapper = mount(ExpenseManagement, {
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
      expect(wrapper.find('.expense-management').exists()).toBe(true)
    })

    it('should initialize with default data', async () => {
      wrapper = mount(ExpenseManagement, {
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
      expect(wrapper.vm.expenses).toEqual([])
      expect(wrapper.vm.loading).toBe(false)
      expect(wrapper.vm.selectedCategory).toBe('all')
    })
  })

  describe('Expense Tracking', () => {
    it('should load expense records', async () => {
      const mockExpenses = [
        {
          id: 1,
          category: '教学用品',
          subcategory: '文具',
          amount: 2500,
          date: '2024-01-15',
          description: '购买春季学期文具',
          status: 'approved',
          approver: '李老师',
          receiptUrl: '/uploads/receipt_001.jpg'
        },
        {
          id: 2,
          category: '设备维护',
          subcategory: '空调维修',
          amount: 1800,
          date: '2024-01-20',
          description: '教室空调维护费用',
          status: 'pending',
          approver: null,
          receiptUrl: '/uploads/receipt_002.jpg'
        }
      ]

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockExpenses,
        message: 'success'
      })

      wrapper = mount(ExpenseManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadExpenses()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/finance/expenses')
      expect(wrapper.vm.expenses).toEqual(mockExpenses)
    })

    it('should create new expense record', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 201,
        data: { id: 3, status: 'pending' },
        message: 'success'
      })

      wrapper = mount(ExpenseManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const expenseData = {
        category: '教学用品',
        subcategory: '图书',
        amount: 1500,
        date: '2024-01-25',
        description: '购买儿童绘本',
        receiptFile: 'receipt_003.jpg'
      }

      await wrapper.vm.createExpense(expenseData)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/finance/expenses', expenseData)
    })

    it('should update expense record', async () => {
      const { put } = await import('@/utils/request')
      put.mockResolvedValue({
        code: 200,
        data: { id: 1, status: 'approved' },
        message: 'success'
      })

      wrapper = mount(ExpenseManagement, {
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
        amount: 2600,
        description: '更新后的文具购买费用'
      }

      await wrapper.vm.updateExpense(updateData)
      await nextTick()

      expect(put).toHaveBeenCalledWith('/api/finance/expenses/1', updateData)
    })

    it('should validate expense data', async () => {
      wrapper = mount(ExpenseManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const invalidExpense = {
        category: '',
        amount: 0,
        date: ''
      }

      const isValid = await wrapper.vm.validateExpense(invalidExpense)
      await nextTick()

      expect(isValid).toBe(false)
      expect(wrapper.vm.error).toContain('费用数据验证失败')
    })
  })

  describe('Expense Approval Workflow', () => {
    it('should approve expense', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: { status: 'approved', approvedBy: 'admin' },
        message: 'success'
      })

      wrapper = mount(ExpenseManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const approvalData = {
        expenseId: 1,
        action: 'approve',
        comments: '费用合理，批准通过'
      }

      await wrapper.vm.processApproval(approvalData)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/finance/expenses/1/approve', approvalData)
    })

    it('should reject expense', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: { status: 'rejected', rejectedBy: 'admin' },
        message: 'success'
      })

      wrapper = mount(ExpenseManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const rejectionData = {
        expenseId: 1,
        action: 'reject',
        comments: '费用超出预算，拒绝通过'
      }

      await wrapper.vm.processApproval(rejectionData)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/finance/expenses/1/reject', rejectionData)
    })

    it('should load approval history', async () => {
      const mockHistory = [
        {
          id: 1,
          expenseId: 1,
          action: 'approve',
          approver: '李老师',
          comments: '教学必需用品',
          timestamp: '2024-01-15T14:30:00Z'
        }
      ]

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockHistory,
        message: 'success'
      })

      wrapper = mount(ExpenseManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadApprovalHistory(1)
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/finance/expenses/1/approval-history')
      expect(wrapper.vm.approvalHistory).toEqual(mockHistory)
    })

    it('should check approval permissions', async () => {
      wrapper = mount(ExpenseManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const userRole = 'teacher'
      const expenseAmount = 5000

      const hasPermission = await wrapper.vm.checkApprovalPermission(userRole, expenseAmount)
      await nextTick()

      expect(hasPermission).toBe(false) // Teacher may not have permission for large amounts
    })
  })

  describe('Budget Management', () => {
    it('should load budget categories', async () => {
      const mockCategories = [
        {
          id: 1,
          name: '教学用品',
          budgetAmount: 50000,
          spentAmount: 25000,
          remainingAmount: 25000,
          percentage: 50
        },
        {
          id: 2,
          name: '设备维护',
          budgetAmount: 30000,
          spentAmount: 18000,
          remainingAmount: 12000,
          percentage: 60
        }
      ]

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockCategories,
        message: 'success'
      })

      wrapper = mount(ExpenseManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadBudgetCategories()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/finance/budget-categories')
      expect(wrapper.vm.budgetCategories).toEqual(mockCategories)
    })

    it('should check budget availability', async () => {
      wrapper = mount(ExpenseManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const categoryData = {
        budgetAmount: 50000,
        spentAmount: 45000
      }

      const expenseAmount = 3000
      const isAvailable = await wrapper.vm.checkBudgetAvailability(categoryData, expenseAmount)
      await nextTick()

      expect(isAvailable).toBe(true)
    })

    it('should warn about budget overage', async () => {
      wrapper = mount(ExpenseManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const categoryData = {
        budgetAmount: 50000,
        spentAmount: 48000
      }

      const expenseAmount = 3000
      const willExceed = await wrapper.vm.willExceedBudget(categoryData, expenseAmount)
      await nextTick()

      expect(willExceed).toBe(true)
      expect(wrapper.vm.budgetWarning).toContain('预算超支警告')
    })

    it('should update budget allocation', async () => {
      const { put } = await import('@/utils/request')
      put.mockResolvedValue({
        code: 200,
        data: { budgetAmount: 60000 },
        message: 'success'
      })

      wrapper = mount(ExpenseManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const budgetUpdate = {
        categoryId: 1,
        budgetAmount: 60000,
        reason: '春季学期教学需求增加'
      }

      await wrapper.vm.updateBudgetAllocation(budgetUpdate)
      await nextTick()

      expect(put).toHaveBeenCalledWith('/api/finance/budget-categories/1', budgetUpdate)
    })
  })

  describe('Expense Analytics', () => {
    it('should generate expense analytics', async () => {
      const mockAnalytics = {
        totalExpenses: 125000,
        monthlyExpenses: [
          { month: '2024-01', amount: 45000 },
          { month: '2024-02', amount: 38000 },
          { month: '2024-03', amount: 42000 }
        ],
        categoryBreakdown: [
          { category: '教学用品', amount: 50000, percentage: 40 },
          { category: '设备维护', amount: 35000, percentage: 28 },
          { category: '人员工资', amount: 40000, percentage: 32 }
        ],
        trendAnalysis: {
          growthRate: 5.2,
          forecast: 132500
        }
      }

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockAnalytics,
        message: 'success'
      })

      wrapper = mount(ExpenseManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadExpenseAnalytics()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/finance/expense-analytics')
      expect(wrapper.vm.expenseAnalytics).toEqual(mockAnalytics)
    })

    it('should analyze spending patterns', async () => {
      wrapper = mount(ExpenseManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const spendingData = [
        { category: '教学用品', amounts: [5000, 6000, 4500, 7000] },
        { category: '设备维护', amounts: [3000, 2800, 3500, 3200] }
      ]

      const patterns = await wrapper.vm.analyzeSpendingPatterns(spendingData)
      await nextTick()

      expect(patterns).toBeDefined()
      expect(patterns.length).toBe(2)
      expect(patterns[0]).toHaveProperty('average')
      expect(patterns[0]).toHaveProperty('trend')
    })

    it('should identify unusual expenses', async () => {
      wrapper = mount(ExpenseManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const expenses = [
        { amount: 2500, category: '教学用品', date: '2024-01-15' },
        { amount: 15000, category: '教学用品', date: '2024-01-20' }, // Unusual
        { amount: 1800, category: '设备维护', date: '2024-01-25' }
      ]

      const unusualExpenses = await wrapper.vm.identifyUnusualExpenses(expenses)
      await nextTick()

      expect(unusualExpenses).toBeDefined()
      expect(unusualExpenses.length).toBe(1)
      expect(unusualExpenses[0].amount).toBe(15000)
    })

    it('should generate expense forecast', async () => {
      wrapper = mount(ExpenseManagement, {
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
        { month: '2024-01', amount: 45000 },
        { month: '2024-02', amount: 38000 },
        { month: '2024-03', amount: 42000 }
      ]

      wrapper.vm.historicalExpenses = historicalData
      await wrapper.vm.generateExpenseForecast()
      await nextTick()

      expect(wrapper.vm.expenseForecast).toBeDefined()
      expect(wrapper.vm.expenseForecast.nextMonth).toBeGreaterThan(0)
      expect(wrapper.vm.expenseForecast.confidence).toBeDefined()
    })
  })

  describe('Receipt Management', () => {
    it('should upload receipt', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: {
          receiptUrl: '/uploads/receipt_004.jpg',
          fileSize: 1024000,
          uploadedAt: '2024-01-25T10:30:00Z'
        },
        message: 'success'
      })

      wrapper = mount(ExpenseManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const uploadData = {
        file: new File([''], 'receipt.jpg', { type: 'image/jpeg' }),
        expenseId: 1
      }

      await wrapper.vm.uploadReceipt(uploadData)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/finance/receipts/upload', expect.any(FormData))
    })

    it('should validate receipt file', async () => {
      wrapper = mount(ExpenseManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const invalidFile = {
        size: 11000000, // 11MB - too large
        type: 'text/plain' // Invalid type
      }

      const isValid = await wrapper.vm.validateReceiptFile(invalidFile)
      await nextTick()

      expect(isValid).toBe(false)
      expect(wrapper.vm.error).toContain('文件验证失败')
    })

    it('should extract receipt data using OCR', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: {
          extractedAmount: 2580.50,
          extractedDate: '2024-01-15',
          extractedMerchant: '文具批发店',
          confidence: 0.95
        },
        message: 'success'
      })

      wrapper = mount(ExpenseManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const receiptData = {
        receiptUrl: '/uploads/receipt_004.jpg',
        expenseId: 1
      }

      await wrapper.vm.extractReceiptData(receiptData)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/finance/receipts/extract-data', receiptData)
      expect(wrapper.vm.extractedData).toBeDefined()
      expect(wrapper.vm.extractedData.extractedAmount).toBe(2580.50)
    })
  })

  describe('Reporting and Export', () => {
    it('should generate expense report', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: {
          reportUrl: '/api/finance/reports/expense-report.pdf',
          generatedAt: '2024-03-25T14:30:00Z'
        },
        message: 'success'
      })

      wrapper = mount(ExpenseManagement, {
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
        categories: ['教学用品', '设备维护'],
        format: 'pdf'
      }

      await wrapper.vm.generateExpenseReport(reportParams)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/finance/reports/expenses', reportParams)
      expect(wrapper.vm.reportResult).toBeDefined()
    })

    it('should export expense data', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: {
          downloadUrl: '/api/finance/export/expense-data.xlsx',
          recordCount: 156
        },
        message: 'success'
      })

      wrapper = mount(ExpenseManagement, {
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
        dateRange: '2024-03',
        format: 'excel',
        includeReceipts: false
      }

      await wrapper.vm.exportExpenseData(exportParams)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/finance/export/expenses', exportParams)
      expect(wrapper.vm.exportResult).toBeDefined()
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const { get } = await import('@/utils/request')
      get.mockRejectedValue(new Error('Network error'))

      wrapper = mount(ExpenseManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadExpenses()
      await nextTick()

      expect(wrapper.vm.error).toBe('Network error')
      expect(wrapper.vm.loading).toBe(false)
    })

    it('should handle validation errors', async () => {
      wrapper = mount(ExpenseManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const invalidExpense = {
        amount: -100,
        category: ''
      }

      await wrapper.vm.validateExpense(invalidExpense)
      await nextTick()

      expect(wrapper.vm.error).toContain('验证失败')
    })

    it('should handle file upload errors', async () => {
      const { post } = await import('@/utils/request')
      post.mockRejectedValue(new Error('Upload failed'))

      wrapper = mount(ExpenseManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const uploadData = {
        file: new File([''], 'test.jpg', { type: 'image/jpeg' })
      }

      await wrapper.vm.uploadReceipt(uploadData)
      await nextTick()

      expect(wrapper.vm.error).toBe('Upload failed')
    })
  })

  describe('User Interactions', () => {
    it('should handle category filtering', async () => {
      wrapper = mount(ExpenseManagement, {
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

      await wrapper.setData({ selectedCategory: '教学用品' })
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.selectedCategory).toBe('教学用品')
    })

    it('should trigger expense creation on button click', async () => {
      wrapper = mount(ExpenseManagement, {
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

      const createSpy = vi.spyOn(wrapper.vm, 'showCreateExpenseDialog')
      await wrapper.find('.create-expense-btn').trigger('click')

      expect(createSpy).toHaveBeenCalled()
    })

    it('should handle receipt upload', async () => {
      wrapper = mount(ExpenseManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': {
              template: '<button class="el-button" @click="$emit(\'click\')"><slot /></button>',
              emits: ['click']
            },
            'el-upload': {
              template: '<div class="el-upload" @change="$emit(\'change\', $event)"><slot /></div>',
              emits: ['change']
            }
          }
        }
      })

      const uploadSpy = vi.spyOn(wrapper.vm, 'handleReceiptUpload')
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
      
      await wrapper.find('.el-upload').trigger('change', {
        target: { files: [mockFile] }
      })

      expect(uploadSpy).toHaveBeenCalled()
    })
  })

  describe('Performance Optimization', () => {
    it('should cache expense analytics data', async () => {
      wrapper = mount(ExpenseManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const analyticsData = { key: 'march_2024', data: { total: 42000 } }
      
      // First call should cache
      await wrapper.vm.cacheAnalyticsData(analyticsData)
      await nextTick()
      
      // Second call should use cache
      const cached = await wrapper.vm.getCachedAnalyticsData('march_2024')
      
      expect(cached).toEqual(analyticsData.data)
    })

    it('should debounce expense filtering', async () => {
      wrapper = mount(ExpenseManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const filterSpy = vi.spyOn(wrapper.vm, 'filterExpenses')
      
      // Trigger multiple rapid changes
      await wrapper.setData({ selectedCategory: '教学用品' })
      await wrapper.setData({ selectedCategory: '设备维护' })
      await wrapper.setData({ selectedCategory: '人员工资' })
      
      await nextTick()
      
      // Should only be called once due to debouncing
      expect(filterSpy).toHaveBeenCalledTimes(1)
    })
  })
})