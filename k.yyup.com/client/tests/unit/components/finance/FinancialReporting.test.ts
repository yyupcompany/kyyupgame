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

import FinancialReporting from '@/components/finance/FinancialReporting.vue'

describe('FinancialReporting Component', () => {
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
      wrapper = mount(FinancialReporting, {
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
      expect(wrapper.find('.financial-reporting').exists()).toBe(true)
    })

    it('should initialize with default data', async () => {
      wrapper = mount(FinancialReporting, {
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
      expect(wrapper.vm.reportData).toEqual({})
      expect(wrapper.vm.loading).toBe(false)
      expect(wrapper.vm.selectedReportType).toBe('monthly')
    })
  })

  describe('Revenue Reporting', () => {
    it('should load revenue report data', async () => {
      const mockRevenueData = {
        totalRevenue: 1250000,
        tuitionRevenue: 750000,
        otherRevenue: 500000,
        monthlyBreakdown: [
          { month: '2024-01', tuition: 125000, other: 45000, total: 170000 },
          { month: '2024-02', tuition: 150000, other: 50000, total: 200000 },
          { month: '2024-03', tuition: 175000, other: 55000, total: 230000 }
        ],
        growthRate: 12.5,
        forecast: 1400000
      }

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockRevenueData,
        message: 'success'
      })

      wrapper = mount(FinancialReporting, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadRevenueReport()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/finance/reports/revenue')
      expect(wrapper.vm.revenueData).toEqual(mockRevenueData)
    })

    it('should analyze revenue trends', async () => {
      wrapper = mount(FinancialReporting, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const revenueData = [
        { month: '2024-01', amount: 170000 },
        { month: '2024-02', amount: 200000 },
        { month: '2024-03', amount: 230000 }
      ]

      wrapper.vm.revenueData = { monthlyBreakdown: revenueData }
      await wrapper.vm.analyzeRevenueTrends()
      await nextTick()

      expect(wrapper.vm.revenueTrends).toBeDefined()
      expect(wrapper.vm.revenueTrends.growthRate).toBeGreaterThan(0)
      expect(wrapper.vm.revenueTrends.averageRevenue).toBeGreaterThan(0)
    })

    it('should generate revenue forecast', async () => {
      wrapper = mount(FinancialReporting, {
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
        { month: '2024-01', revenue: 170000 },
        { month: '2024-02', revenue: 200000 },
        { month: '2024-03', revenue: 230000 }
      ]

      wrapper.vm.historicalRevenue = historicalData
      await wrapper.vm.generateRevenueForecast()
      await nextTick()

      expect(wrapper.vm.revenueForecast).toBeDefined()
      expect(wrapper.vm.revenueForecast.nextQuarter).toBeGreaterThan(0)
      expect(wrapper.vm.revenueForecast.confidence).toBeDefined()
    })
  })

  describe('Expense Reporting', () => {
    it('should load expense report data', async () => {
      const mockExpenseData = {
        totalExpenses: 850000,
        operatingExpenses: 600000,
        capitalExpenses: 250000,
        categoryBreakdown: [
          { category: '人员工资', amount: 400000, percentage: 47 },
          { category: '教学用品', amount: 150000, percentage: 18 },
          { category: '设备维护', amount: 100000, percentage: 12 },
          { category: '其他', amount: 200000, percentage: 23 }
        ],
        monthlyBreakdown: [
          { month: '2024-01', operating: 180000, capital: 50000, total: 230000 },
          { month: '2024-02', operating: 200000, capital: 80000, total: 280000 },
          { month: '2024-03', operating: 220000, capital: 120000, total: 340000 }
        ]
      }

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockExpenseData,
        message: 'success'
      })

      wrapper = mount(FinancialReporting, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadExpenseReport()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/finance/reports/expenses')
      expect(wrapper.vm.expenseData).toEqual(mockExpenseData)
    })

    it('should analyze expense patterns', async () => {
      wrapper = mount(FinancialReporting, {
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
        categoryBreakdown: [
          { category: '人员工资', amount: 400000 },
          { category: '教学用品', amount: 150000 },
          { category: '设备维护', amount: 100000 }
        ]
      }

      wrapper.vm.expenseData = expenseData
      await wrapper.vm.analyzeExpensePatterns()
      await nextTick()

      expect(wrapper.vm.expensePatterns).toBeDefined()
      expect(wrapper.vm.expensePatterns.majorCategories).toBeDefined()
      expect(wrapper.vm.expensePatterns.costDistribution).toBeDefined()
    })

    it('should identify cost optimization opportunities', async () => {
      wrapper = mount(FinancialReporting, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const expenseAnalysis = {
        categories: [
          { name: '设备维护', amount: 100000, trend: 'increasing', efficiency: 'low' },
          { name: '教学用品', amount: 150000, trend: 'stable', efficiency: 'high' }
        ]
      }

      wrapper.vm.expenseAnalysis = expenseAnalysis
      await wrapper.vm.identifyOptimizationOpportunities()
      await nextTick()

      expect(wrapper.vm.optimizationOpportunities).toBeDefined()
      expect(wrapper.vm.optimizationOpportunities.length).toBeGreaterThan(0)
    })
  })

  describe('Profitability Analysis', () => {
    it('should load profitability data', async () => {
      const mockProfitabilityData = {
        totalRevenue: 1250000,
        totalExpenses: 850000,
        netProfit: 400000,
        profitMargin: 32,
        monthlyBreakdown: [
          { month: '2024-01', revenue: 170000, expenses: 230000, profit: -60000, margin: -35.3 },
          { month: '2024-02', revenue: 200000, expenses: 280000, profit: -80000, margin: -40 },
          { month: '2024-03', revenue: 230000, expenses: 340000, profit: -110000, margin: -47.8 }
        ],
        departmentBreakdown: [
          { department: '教学部', revenue: 750000, expenses: 400000, profit: 350000, margin: 46.7 },
          { department: '行政部', revenue: 0, expenses: 250000, profit: -250000, margin: 0 },
          { department: '后勤部', revenue: 500000, expenses: 200000, profit: 300000, margin: 60 }
        ]
      }

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockProfitabilityData,
        message: 'success'
      })

      wrapper = mount(FinancialReporting, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table', 
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadProfitabilityReport()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/finance/reports/profitability')
      expect(wrapper.vm.profitabilityData).toEqual(mockProfitabilityData)
    })

    it('should calculate profit metrics', async () => {
      wrapper = mount(FinancialReporting, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table', 
            'el-button': true
          }
        }
      })

      const financialData = {
        revenue: 1250000,
        expenses: 850000,
        assets: 2000000,
        equity: 1200000
      }

      const metrics = await wrapper.vm.calculateProfitMetrics(financialData)
      await nextTick()

      expect(metrics).toBeDefined()
      expect(metrics.netProfit).toBe(400000)
      expect(metrics.profitMargin).toBe(32)
      expect(metrics.returnOnAssets).toBeDefined()
      expect(metrics.returnOnEquity).toBeDefined()
    })

    it('should analyze department profitability', async () => {
      wrapper = mount(FinancialReporting, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table',
            'el-button': true
          }
        }
      })

      const departmentData = [
        { name: '教学部', revenue: 750000, expenses: 400000 },
        { name: '行政部', revenue: 0, expenses: 250000 },
        { name: '后勤部', revenue: 500000, expenses: 200000 }
      ]

      wrapper.vm.departmentData = departmentData
      await wrapper.vm.analyzeDepartmentProfitability()
      await nextTick()

      expect(wrapper.vm.departmentAnalysis).toBeDefined()
      expect(wrapper.vm.departmentAnalysis.length).toBe(3)
      expect(wrapper.vm.departmentAnalysis[0]).toHaveProperty('profit')
      expect(wrapper.vm.departmentAnalysis[0]).toHaveProperty('margin')
    })
  })

  describe('Cash Flow Analysis', () => {
    it('should load cash flow data', async () => {
      const mockCashFlowData = {
        openingBalance: 500000,
        closingBalance: 650000,
        netCashFlow: 150000,
        operatingCashFlow: 200000,
        investingCashFlow: -80000,
        financingCashFlow: 30000,
        monthlyBreakdown: [
          { month: '2024-01', operating: 60000, investing: -20000, financing: 10000, net: 50000 },
          { month: '2024-02', operating: 70000, investing: -30000, financing: 10000, net: 50000 },
          { month: '2024-03', operating: 70000, investing: -30000, financing: 10000, net: 50000 }
        ]
      }

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockCashFlowData,
        message: 'success'
      })

      wrapper = mount(FinancialReporting, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table',
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadCashFlowReport()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/finance/reports/cash-flow')
      expect(wrapper.vm.cashFlowData).toEqual(mockCashFlowData)
    })

    it('should analyze cash flow patterns', async () => {
      wrapper = mount(FinancialReporting, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table',
            'el-button': true
          }
        }
      })

      const cashFlowData = {
        monthlyBreakdown: [
          { month: '2024-01', operating: 60000, investing: -20000, financing: 10000 },
          { month: '2024-02', operating: 70000, investing: -30000, financing: 10000 },
          { month: '2024-03', operating: 70000, investing: -30000, financing: 10000 }
        ]
      }

      wrapper.vm.cashFlowData = cashFlowData
      await wrapper.vm.analyzeCashFlowPatterns()
      await nextTick()

      expect(wrapper.vm.cashFlowPatterns).toBeDefined()
      expect(wrapper.vm.cashFlowPatterns.operatingTrend).toBeDefined()
      expect(wrapper.vm.cashFlowPatterns.investingTrend).toBeDefined()
    })

    it('should forecast cash flow', async () => {
      wrapper = mount(FinancialReporting, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table',
            'el-button': true
          }
        }
      })

      const historicalData = [
        { month: '2024-01', netCashFlow: 50000 },
        { month: '2024-02', netCashFlow: 50000 },
        { month: '2024-03', netCashFlow: 50000 }
      ]

      wrapper.vm.historicalCashFlow = historicalData
      await wrapper.vm.forecastCashFlow()
      await nextTick()

      expect(wrapper.vm.cashFlowForecast).toBeDefined()
      expect(wrapper.vm.cashFlowForecast.nextMonth).toBeGreaterThan(0)
      expect(wrapper.vm.cashFlowForecast.quarterly).toBeGreaterThan(0)
    })
  })

  describe('Budget vs Actual Analysis', () => {
    it('should load budget comparison data', async () => {
      const mockBudgetData = {
        categories: [
          {
            category: '人员工资',
            budgeted: 450000,
            actual: 400000,
            variance: 50000,
            variancePercentage: 11.1
          },
          {
            category: '教学用品',
            budgeted: 180000,
            actual: 150000,
            variance: 30000,
            variancePercentage: 16.7
          },
          {
            category: '设备维护',
            budgeted: 120000,
            actual: 100000,
            variance: 20000,
            variancePercentage: 16.7
          }
        ],
        totalBudgeted: 750000,
        totalActual: 650000,
        totalVariance: 100000,
        totalVariancePercentage: 13.3
      }

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockBudgetData,
        message: 'success'
      })

      wrapper = mount(FinancialReporting, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table',
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadBudgetComparison()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/finance/reports/budget-comparison')
      expect(wrapper.vm.budgetData).toEqual(mockBudgetData)
    })

    it('should analyze budget variances', async () => {
      wrapper = mount(FinancialReporting, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table',
            'el-button': true
          }
        }
      })

      const budgetData = {
        categories: [
          { category: '人员工资', budgeted: 450000, actual: 400000, variance: 50000 },
          { category: '教学用品', budgeted: 180000, actual: 200000, variance: -20000 }
        ]
      }

      wrapper.vm.budgetData = budgetData
      await wrapper.vm.analyzeBudgetVariances()
      await nextTick()

      expect(wrapper.vm.varianceAnalysis).toBeDefined()
      expect(wrapper.vm.varianceAnalysis.favorableVariances).toBeDefined()
      expect(wrapper.vm.varianceAnalysis.unfavorableVariances).toBeDefined()
    })

    it('should generate budget recommendations', async () => {
      wrapper = mount(FinancialReporting, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table',
            'el-button': true
          }
        }
      })

      const analysisData = {
        underBudgetCategories: ['人员工资', '设备维护'],
        overBudgetCategories: ['教学用品'],
        significantVariances: ['教学用品']
      }

      wrapper.vm.varianceAnalysis = analysisData
      await wrapper.vm.generateBudgetRecommendations()
      await nextTick()

      expect(wrapper.vm.budgetRecommendations).toBeDefined()
      expect(wrapper.vm.budgetRecommendations.length).toBeGreaterThan(0)
    })
  })

  describe('Financial Ratios Analysis', () => {
    it('should load financial ratios data', async () => {
      const mockRatiosData = {
        liquidity: {
          currentRatio: 2.5,
          quickRatio: 2.1,
          cashRatio: 1.8
        },
        profitability: {
          grossMargin: 32,
          operatingMargin: 25,
          netMargin: 20,
          returnOnAssets: 15,
          returnOnEquity: 25
        },
        efficiency: {
          assetTurnover: 1.2,
          inventoryTurnover: 8.5,
          receivablesTurnover: 12.0
        },
        solvency: {
          debtToEquity: 0.4,
          debtToAssets: 0.3,
          interestCoverage: 8.5
        }
      }

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockRatiosData,
        message: 'success'
      })

      wrapper = mount(FinancialReporting, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table',
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadFinancialRatios()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/finance/reports/financial-ratios')
      expect(wrapper.vm.ratiosData).toEqual(mockRatiosData)
    })

    it('should analyze ratio trends', async () => {
      wrapper = mount(FinancialReporting, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table',
            'el-button': true
          }
        }
      })

      const ratioHistory = [
        { period: '2024-Q1', currentRatio: 2.3, netMargin: 18 },
        { period: '2024-Q2', currentRatio: 2.4, netMargin: 19 },
        { period: '2024-Q3', currentRatio: 2.5, netMargin: 20 }
      ]

      wrapper.vm.ratioHistory = ratioHistory
      await wrapper.vm.analyzeRatioTrends()
      await nextTick()

      expect(wrapper.vm.ratioTrends).toBeDefined()
      expect(wrapper.vm.ratioTrends.improvingRatios).toBeDefined()
      expect(wrapper.vm.ratioTrends.decliningRatios).toBeDefined()
    })

    it('should benchmark against industry standards', async () => {
      wrapper = mount(FinancialReporting, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table',
            'el-button': true
          }
        }
      })

      const benchmarkData = {
        current: { currentRatio: 2.5, netMargin: 20 },
        industry: { currentRatio: 2.0, netMargin: 15 },
        topPerformer: { currentRatio: 3.0, netMargin: 25 }
      }

      wrapper.vm.benchmarkData = benchmarkData
      await wrapper.vm.generateBenchmarkReport()
      await nextTick()

      expect(wrapper.vm.benchmarkReport).toBeDefined()
      expect(wrapper.vm.benchmarkReport.comparisons).toBeDefined()
      expect(wrapper.vm.benchmarkReport.recommendations).toBeDefined()
    })
  })

  describe('Report Generation and Export', () => {
    it('should generate comprehensive financial report', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: {
          reportUrl: '/api/finance/reports/comprehensive-financial-report.pdf',
          generatedAt: '2024-03-31T16:30:00Z',
          pages: 25
        },
        message: 'success'
      })

      wrapper = mount(FinancialReporting, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table',
            'el-button': true
          }
        }
      })

      const reportParams = {
        reportType: 'comprehensive',
        dateRange: '2024-01-01_to_2024-03-31',
        includeCharts: true,
        includeRecommendations: true,
        format: 'pdf'
      }

      await wrapper.vm.generateFinancialReport(reportParams)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/finance/reports/generate', reportParams)
      expect(wrapper.vm.reportResult).toBeDefined()
    })

    it('should export financial data', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: {
          downloadUrl: '/api/finance/export/financial-data.xlsx',
          recordCount: 1250,
          exportedAt: '2024-03-31T16:35:00Z'
        },
        message: 'success'
      })

      wrapper = mount(FinancialReporting, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table',
            'el-button': true
          }
        }
      })

      const exportParams = {
        dataType: 'all',
        dateRange: '2024-Q1',
        format: 'excel',
        includeRatios: true
      }

      await wrapper.vm.exportFinancialData(exportParams)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/finance/export/financial-data', exportParams)
      expect(wrapper.vm.exportResult).toBeDefined()
    })

    it('should schedule automated reports', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: {
          scheduleId: 'SCH20240331001',
          nextRunDate: '2024-04-01T09:00:00Z',
          frequency: 'monthly'
        },
        message: 'success'
      })

      wrapper = mount(FinancialReporting, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table',
            'el-button': true
          }
        }
      })

      const scheduleParams = {
        reportType: 'monthly-financial',
        recipients: ['admin@kindergarten.com', 'finance@kindergarten.com'],
        frequency: 'monthly',
        format: 'pdf'
      }

      await wrapper.vm.scheduleAutomatedReport(scheduleParams)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/finance/reports/schedule', scheduleParams)
      expect(wrapper.vm.scheduleResult).toBeDefined()
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const { get } = await import('@/utils/request')
      get.mockRejectedValue(new Error('Network error'))

      wrapper = mount(FinancialReporting, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table',
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadRevenueReport()
      await nextTick()

      expect(wrapper.vm.error).toBe('Network error')
      expect(wrapper.vm.loading).toBe(false)
    })

    it('should handle data validation errors', async () => {
      wrapper = mount(FinancialReporting, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table',
            'el-button': true
          }
        }
      })

      const invalidData = {
        revenue: -1000,
        expenses: 2000
      }

      await wrapper.vm.validateFinancialData(invalidData)
      await nextTick()

      expect(wrapper.vm.error).toContain('数据验证失败')
    })

    it('should handle report generation errors', async () => {
      const { post } = await import('@/utils/request')
      post.mockRejectedValue(new Error('Report generation failed'))

      wrapper = mount(FinancialReporting, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table',
            'el-button': true
          }
        }
      })

      const reportParams = {
        reportType: 'comprehensive',
        dateRange: '2024-Q1'
      }

      await wrapper.vm.generateFinancialReport(reportParams)
      await nextTick()

      expect(wrapper.vm.error).toBe('Report generation failed')
    })
  })

  describe('User Interactions', () => {
    it('should handle report type selection', async () => {
      wrapper = mount(FinancialReporting, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table',
            'el-button': true,
            'el-radio-group': {
              template: '<div class="el-radio-group" @change="$emit(\'change\', $event)"><slot /></div>',
              emits: ['change']
            }
          }
        }
      })

      await wrapper.setData({ selectedReportType: 'quarterly' })
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.selectedReportType).toBe('quarterly')
    })

    it('should handle date range selection', async () => {
      wrapper = mount(FinancialReporting, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table',
            'el-button': true,
            'el-date-picker': {
              template: '<div class="el-date-picker" @change="$emit(\'change\', $event)" />',
              emits: ['change']
            }
          }
        }
      })

      await wrapper.setData({ dateRange: { start: '2024-01-01', end: '2024-03-31' } })
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.dateRange.start).toBe('2024-01-01')
    })

    it('should trigger report generation on button click', async () => {
      wrapper = mount(FinancialReporting, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table',
            'el-button': {
              template: '<button class="el-button" @click="$emit(\'click\')"><slot /></button>',
              emits: ['click']
            }
          }
        }
      })

      const generateSpy = vi.spyOn(wrapper.vm, 'generateFinancialReport')
      await wrapper.find('.generate-report-btn').trigger('click')

      expect(generateSpy).toHaveBeenCalled()
    })
  })

  describe('Performance Optimization', () => {
    it('should cache report data', async () => {
      wrapper = mount(FinancialReporting, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table',
            'el-button': true
          }
        }
      })

      const reportData = { key: 'revenue_q1_2024', data: { total: 600000 } }
      
      // First call should cache
      await wrapper.vm.cacheReportData(reportData)
      await nextTick()
      
      // Second call should use cache
      const cached = await wrapper.vm.getCachedReportData('revenue_q1_2024')
      
      expect(cached).toEqual(reportData.data)
    })

    it('should debounce report parameter changes', async () => {
      wrapper = mount(FinancialReporting, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table',
            'el-button': true
          }
        }
      })

      const updateSpy = vi.spyOn(wrapper.vm, 'updateReportParameters')
      
      // Trigger multiple rapid changes
      await wrapper.setData({ selectedReportType: 'monthly' })
      await wrapper.setData({ selectedReportType: 'quarterly' })
      await wrapper.setData({ selectedReportType: 'yearly' })
      
      await nextTick()
      
      // Should only be called once due to debouncing
      expect(updateSpy).toHaveBeenCalledTimes(1)
    })
  })
})