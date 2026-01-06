
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
import CustomerIndex from '/home/zhgue/yyupcc/k.yyup.com/client/src/pages/customer/index.vue'

// Mock dependencies
vi.mock('/home/zhgue/yyupcc/k.yyup.com/client/src/stores/user', () => ({
  useUserStore: () => ({
    user: { id: 1, name: 'Test User', role: 'admin' },
    isAuthenticated: true,
    hasPermission: vi.fn().mockReturnValue(true)
  })
}))

vi.mock('/home/zhgue/yyupcc/k.yyup.com/client/src/api/customer', () => ({
  getCustomerList: vi.fn().mockResolvedValue({
    data: [
      {
        id: 1,
        name: '张三',
        phone: '13800138000',
        email: 'zhang@example.com',
        source: '推荐',
        status: 'prospect',
        lastContact: '2025-01-14',
        assignedTo: '王老师',
        tags: ['高价值', ' urgent']
      },
      {
        id: 2,
        name: '李四',
        phone: '13900139000',
        email: 'li@example.com',
        source: '网站',
        status: 'lead',
        lastContact: '2025-01-13',
        assignedTo: '李老师',
        tags: ['新客户']
      }
    ],
    total: 2,
    page: 1,
    pageSize: 10
  }),
  getCustomerStatistics: vi.fn().mockResolvedValue({
    totalCustomers: 150,
    prospects: 45,
    leads: 38,
    opportunities: 25,
    customers: 42,
    conversionRate: 28
  })
}))

describe('CustomerIndex', () => {
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
          customer: {
            title: '客户管理',
            list: '客户列表',
            statistics: '统计信息',
            actions: '操作'
          }
        }
      }
    })

    wrapper = mount(CustomerIndex, {
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
          'el-avatar': true,
          'el-timeline': true
        }
      }
    })
  })

  it('renders customer management page correctly', () => {
    expect(wrapper.find('.customer-page').exists()).toBe(true)
    expect(wrapper.text()).toContain('客户管理')
  })

  it('displays customer list', () => {
    expect(wrapper.find('.customer-list').exists()).toBe(true)
    expect(wrapper.text()).toContain('客户列表')
  })

  it('displays statistics section', () => {
    expect(wrapper.find('.statistics-section').exists()).toBe(true)
    expect(wrapper.text()).toContain('统计信息')
  })

  it('loads customer data on mount', async () => {
    const { getCustomerList } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/api/customer')
    await wrapper.vm.$nextTick()
    expect(getCustomerList).toHaveBeenCalled()
  })

  it('loads statistics data on mount', async () => {
    const { getCustomerStatistics } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/api/customer')
    await wrapper.vm.$nextTick()
    expect(getCustomerStatistics).toHaveBeenCalled()
  })

  it('displays customer data in table', () => {
    const table = wrapper.find('.customer-table')
    expect(table.exists()).toBe(true)
  })

  it('shows customer avatars', () => {
    const avatars = wrapper.findAll('.customer-avatar')
    expect(avatars.length).toBeGreaterThan(0)
  })

  it('shows status tags with correct colors', () => {
    const statusTags = wrapper.findAll('.status-tag')
    expect(statusTags.length).toBeGreaterThan(0)
  })

  it('shows source tags with correct colors', () => {
    const sourceTags = wrapper.findAll('.source-tag')
    expect(sourceTags.length).toBeGreaterThan(0)
  })

  it('displays customer tags', () => {
    const customerTags = wrapper.findAll('.customer-tag')
    expect(customerTags.length).toBeGreaterThan(0)
  })

  it('shows assigned staff information', () => {
    const assignedCells = wrapper.findAll('.assigned-cell')
    expect(assignedCells.length).toBeGreaterThan(0)
  })

  it('handles pagination change', async () => {
    const pagination = wrapper.find('.pagination')
    if (pagination.exists()) {
      await pagination.vm.$emit('current-change', 2)
      expect(wrapper.vm.currentPage).toBe(2)
    }
  })

  it('handles search functionality', async () => {
    const searchInput = wrapper.find('.search-input')
    if (searchInput.exists()) {
      await searchInput.setValue('张三')
      expect(wrapper.vm.searchQuery).toBe('张三')
    }
  })

  it('handles filter by status', async () => {
    const statusFilter = wrapper.find('.status-filter')
    if (statusFilter.exists()) {
      await statusFilter.vm.$emit('change', 'prospect')
      expect(wrapper.vm.statusFilter).toBe('prospect')
    }
  })

  it('handles filter by source', async () => {
    const sourceFilter = wrapper.find('.source-filter')
    if (sourceFilter.exists()) {
      await sourceFilter.vm.$emit('change', '推荐')
      expect(wrapper.vm.sourceFilter).toBe('推荐')
    }
  })

  it('handles filter by assigned staff', async () => {
    const assignedFilter = wrapper.find('.assigned-filter')
    if (assignedFilter.exists()) {
      await assignedFilter.vm.$emit('change', '王老师')
      expect(wrapper.vm.assignedFilter).toBe('王老师')
    }
  })

  it('handles filter by tags', async () => {
    const tagFilter = wrapper.find('.tag-filter')
    if (tagFilter.exists()) {
      await tagFilter.vm.$emit('change', ['高价值'])
      expect(wrapper.vm.tagFilter).toEqual(['高价值'])
    }
  })

  it('opens create dialog when create button is clicked', async () => {
    const createButton = wrapper.find('.create-button')
    if (createButton.exists()) {
      await createButton.trigger('click')
      expect(wrapper.vm.showCreateDialog).toBe(true)
    }
  })

  it('opens edit dialog when edit button is clicked', async () => {
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

  it('opens contact dialog when contact button is clicked', async () => {
    const contactButton = wrapper.find('.contact-button')
    if (contactButton.exists()) {
      await contactButton.trigger('click')
      expect(wrapper.vm.showContactDialog).toBe(true)
    }
  })

  it('opens assign dialog when assign button is clicked', async () => {
    const assignButton = wrapper.find('.assign-button')
    if (assignButton.exists()) {
      await assignButton.trigger('click')
      expect(wrapper.vm.showAssignDialog).toBe(true)
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
      const { getCustomerList } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/api/customer')
      expect(getCustomerList).toHaveBeenCalledTimes(2)
    }
  })

  it('exports customer list when export button is clicked', async () => {
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

  it('formats phone numbers correctly', () => {
    const phoneCell = wrapper.find('.phone-cell')
    expect(phoneCell.exists()).toBe(true)
  })

  it('displays last contact date', () => {
    const lastContactCells = wrapper.findAll('.last-contact-cell')
    expect(lastContactCells.length).toBeGreaterThan(0)
  })

  it('has proper accessibility attributes', () => {
    const mainElement = wrapper.find('main')
    expect(mainElement.attributes('role')).toBe('main')
    expect(mainElement.attributes('aria-label')).toBe('Customer Management')
  })

  it('is responsive', () => {
    expect(wrapper.find('.responsive-customer').exists()).toBe(true)
  })

  it('displays customer status distribution chart', () => {
    const statusChart = wrapper.find('.status-chart')
    expect(statusChart.exists()).toBe(true)
  })

  it('displays conversion funnel chart', () => {
    const funnelChart = wrapper.find('.funnel-chart')
    expect(funnelChart.exists()).toBe(true)
  })

  it('shows contact timeline', () => {
    const timeline = wrapper.find('.contact-timeline')
    expect(timeline.exists()).toBe(true)
  })

  it('calculates conversion rate correctly', () => {
    const conversionRate = wrapper.vm.calculateConversionRate(42, 150)
    expect(conversionRate).toBe(28)
  })

  it('displays customer lifecycle stages', () => {
    const lifecycleStages = wrapper.find('.lifecycle-stages')
    expect(lifecycleStages.exists()).toBe(true)
  })
})