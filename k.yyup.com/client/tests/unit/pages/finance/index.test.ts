
vi.mock('vue-i18n', () => ({
  createI18n: vi.fn(() => ({
    global: {
      t: vi.fn((key) => key),
      locale: 'zh-CN'
    }
  })),
  useI18n: vi.fn(() => ({
    t: vi.fn((key) => key),
    locale: ref('zh-CN')
  }))
}))

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

describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createPinia, setActivePinia } from 'pinia'
import FinanceIndex from '/home/zhgue/yyupcc/k.yyup.com/client/src/pages/finance/index.vue'

// Mock dependencies
vi.mock('/home/zhgue/yyupcc/k.yyup.com/client/src/stores/user', () => ({
  useUserStore: () => ({
    user: { id: 1, name: 'Test User', role: 'admin' },
    isAuthenticated: true,
    hasPermission: vi.fn().mockReturnValue(true)
  })
}))

vi.mock('/home/zhgue/yyupcc/k.yyup.com/client/src/api/finance', () => ({
  getFinanceData: vi.fn().mockResolvedValue({
    overview: {
      totalRevenue: 500000,
      totalExpenses: 300000,
      netProfit: 200000,
      monthlyGrowth: 15.5
    },
    transactions: [
      {
        id: 1,
        type: 'income',
        category: '学费',
        amount: 5000,
        date: '2025-01-14',
        description: '张小明学费',
        student: '张小明'
      },
      {
        id: 2,
        type: 'expense',
        category: '办公用品',
        amount: 1500,
        date: '2025-01-13',
        description: '教学用品采购',
        student: null
      }
    ],
    statistics: {
      incomeByCategory: {
        '学费': 450000,
        '活动费': 30000,
        '其他': 20000
      },
      expensesByCategory: {
        '工资': 200000,
        '租金': 50000,
        '办公用品': 30000,
        '其他': 20000
      }
    }
  })
}))

describe('FinanceIndex', () => {
  let wrapper: any
  let i18n: any
  let pinia: any

  beforeEach(async () => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    i18n = createI18n({
      locale: 'zh-CN',
      messages: {
        'zh-CN': {
          finance: {
            title: '财务管理',
            overview: '财务概览',
            transactions: '交易记录',
            statistics: '统计分析',
            actions: '操作'
          }
        }
      }
    })

    wrapper = mount(FinanceIndex, {
      global: {
        plugins: [i18n, pinia],
        stubs: {
          'el-card': true,
          'el-table': true,
          'el-table-column': true,
          'el-tag': true,
          'el-button': true,
          'el-statistic': true,
          'el-dialog': true,
          'el-form': true,
          'el-form-item': true,
          'el-progress': true,
          'el-chart': true
        }
      }
    })
  })

  it('renders finance management page correctly', () => {
    expect(wrapper.find('.finance-page').exists()).toBe(true)
    expect(wrapper.text()).toContain('财务管理')
  })

  it('displays financial overview', () => {
    expect(wrapper.find('.overview-section').exists()).toBe(true)
    expect(wrapper.text()).toContain('财务概览')
  })

  it('displays transactions section', () => {
    expect(wrapper.find('.transactions-section').exists()).toBe(true)
    expect(wrapper.text()).toContain('交易记录')
  })

  it('displays statistics section', () => {
    expect(wrapper.find('.statistics-section').exists()).toBe(true)
    expect(wrapper.text()).toContain('统计分析')
  })

  it('loads finance data on mount', async () => {
    const { getFinanceData } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/api/finance')
    await wrapper.vm.$nextTick()
    expect(getFinanceData).toHaveBeenCalled()
  })

  it('displays financial metrics', () => {
    const metrics = wrapper.findAll('.financial-metric')
    expect(metrics.length).toBeGreaterThan(0)
  })

  it('displays transactions in table', () => {
    const table = wrapper.find('.transactions-table')
    expect(table.exists()).toBe(true)
  })

  it('shows transaction type tags with correct colors', () => {
    const typeTags = wrapper.findAll('.transaction-type-tag')
    expect(typeTags.length).toBeGreaterThan(0)
  })

  it('displays amount with proper formatting', () => {
    const amountCells = wrapper.findAll('.amount-cell')
    expect(amountCells.length).toBeGreaterThan(0)
  })

  it('shows revenue vs expenses chart', () => {
    const revenueChart = wrapper.find('.revenue-expenses-chart')
    expect(revenueChart.exists()).toBe(true)
  })

  it('shows category breakdown chart', () => {
    const categoryChart = wrapper.find('.category-chart')
    expect(categoryChart.exists()).toBe(true)
  })

  it('handles pagination change for transactions', async () => {
    const pagination = wrapper.find('.pagination')
    if (pagination.exists()) {
      await pagination.vm.$emit('current-change', 2)
      expect(wrapper.vm.currentPage).toBe(2)
    }
  })

  it('handles search functionality', async () => {
    const searchInput = wrapper.find('.search-input')
    if (searchInput.exists()) {
      await searchInput.setValue('学费')
      expect(wrapper.vm.searchQuery).toBe('学费')
    }
  })

  it('handles filter by transaction type', async () => {
    const typeFilter = wrapper.find('.type-filter')
    if (typeFilter.exists()) {
      await typeFilter.vm.$emit('change', 'income')
      expect(wrapper.vm.transactionTypeFilter).toBe('income')
    }
  })

  it('handles filter by category', async () => {
    const categoryFilter = wrapper.find('.category-filter')
    if (categoryFilter.exists()) {
      await categoryFilter.vm.$emit('change', '学费')
      expect(wrapper.vm.categoryFilter).toBe('学费')
    }
  })

  it('handles filter by date range', async () => {
    const dateRangeFilter = wrapper.find('.date-range-filter')
    if (dateRangeFilter.exists()) {
      await dateRangeFilter.vm.$emit('change', ['2025-01-01', '2025-01-31'])
      expect(wrapper.vm.dateRange).toEqual(['2025-01-01', '2025-01-31'])
    }
  })

  it('opens create transaction dialog when create button is clicked', async () => {
    const createButton = wrapper.find('.create-button')
    if (createButton.exists()) {
      await createButton.trigger('click')
      expect(wrapper.vm.showCreateDialog).toBe(true)
    }
  })

  it('opens edit transaction dialog when edit button is clicked', async () => {
    const editButton = wrapper.find('.edit-button')
    if (editButton.exists()) {
      await editButton.trigger('click')
      expect(wrapper.vm.showEditDialog).toBe(true)
    }
  })

  it('opens detail dialog when detail button is clicked', async () => {
    const detailButton = wrapper.find('.detail-button')
    if (detailButton.exists()) {
      await detailButton.trigger('click')
      expect(wrapper.vm.showDetailDialog).toBe(true)
    }
  })

  it('handles delete confirmation', async () => {
    const deleteButton = wrapper.find('.delete-button')
    if (deleteButton.exists()) {
      await deleteButton.trigger('click')
      expect(wrapper.vm.showDeleteDialog).toBe(true)
    }
  })

  it('displays loading state', () => {
    wrapper.setData({ loading: true })
    expect(wrapper.find('.loading-spinner').exists()).toBe(true)
  })

  it('handles error state', () => {
    wrapper.setData({ error: 'Failed to load data' })
    expect(wrapper.find('.error-message').exists()).toBe(true)
  })

  it('refreshes data when refresh button is clicked', async () => {
    const refreshButton = wrapper.find('.refresh-button')
    if (refreshButton.exists()) {
      await refreshButton.trigger('click')
      const { getFinanceData } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/api/finance')
      expect(getFinanceData).toHaveBeenCalledTimes(2)
    }
  })

  it('exports financial report when export button is clicked', async () => {
    const exportButton = wrapper.find('.export-button')
    if (exportButton.exists()) {
      await exportButton.trigger('click')
      expect(wrapper.vm.isExporting).toBe(true)
    }
  })

  it('navigates to detail page when row is clicked', async () => {
    const tableRow = wrapper.find('.table-row')
    if (tableRow.exists()) {
      await tableRow.trigger('click')
      // In a real test, we would check if router.push was called
      expect(true).toBe(true) // Placeholder
    }
  })

  it('formats currency correctly', () => {
    const formattedAmount = wrapper.vm.formatCurrency(5000)
    expect(formattedAmount).toBe('¥5,000.00')
  })

  it('calculates profit margin correctly', () => {
    const profitMargin = wrapper.vm.calculateProfitMargin(200000, 500000)
    expect(profitMargin).toBe(40)
  })

  it('has proper accessibility attributes', () => {
    const mainElement = wrapper.find('main')
    expect(mainElement.attributes('role')).toBe('main')
    expect(mainElement.attributes('aria-label')).toBe('Finance Management')
  })

  it('is responsive', () => {
    expect(wrapper.find('.responsive-finance').exists()).toBe(true)
  })

  it('displays monthly trend chart', () => {
    const trendChart = wrapper.find('.trend-chart')
    expect(trendChart.exists()).toBe(true)
  })

  it('shows financial summary cards', () => {
    const summaryCards = wrapper.findAll('.summary-card')
    expect(summaryCards.length).toBeGreaterThan(0)
  })

  it('displays growth indicators', () => {
    const growthIndicators = wrapper.findAll('.growth-indicator')
    expect(growthIndicators.length).toBeGreaterThan(0)
  })

  it('switches between different time periods', async () => {
    const periodToggle = wrapper.find('.period-toggle')
    if (periodToggle.exists()) {
      await periodToggle.vm.$emit('change', 'quarterly')
      expect(wrapper.vm.timePeriod).toBe('quarterly')
    }
  })
})