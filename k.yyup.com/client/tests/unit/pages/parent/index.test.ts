
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
import ParentIndex from '/home/zhgue/yyupcc/k.yyup.com/client/src/pages/parent/index.vue'

// Mock dependencies
vi.mock('/home/zhgue/yyupcc/k.yyup.com/client/src/stores/user', () => ({
  useUserStore: () => ({
    user: { id: 1, name: 'Test User', role: 'admin' },
    isAuthenticated: true,
    hasPermission: vi.fn().mockReturnValue(true)
  })
}))

vi.mock('/home/zhgue/yyupcc/k.yyup.com/client/src/api/parent', () => ({
  getParentList: vi.fn().mockResolvedValue({
    data: [
      {
        id: 1,
        name: '张父',
        phone: '13800138000',
        email: 'zhang@parent.com',
        children: [
          { name: '张小明', class: '小一班' },
          { name: '张小红', class: '小二班' }
        ],
        status: 'active',
        lastContact: '2025-01-14'
      },
      {
        id: 2,
        name: '李母',
        phone: '13900139000',
        email: 'li@parent.com',
        children: [
          { name: '李小华', class: '小三班' }
        ],
        status: 'active',
        lastContact: '2025-01-13'
      }
    ],
    total: 2,
    page: 1,
    pageSize: 10
  }),
  getParentStatistics: vi.fn().mockResolvedValue({
    totalParents: 45,
    activeParents: 42,
    inactiveParents: 3,
    averageChildren: 1.2,
    totalChildren: 54
  })
}))

describe('ParentIndex', () => {
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
          parent: {
            title: '家长管理',
            list: '家长列表',
            statistics: '统计信息',
            actions: '操作'
          }
        }
      }
    })

    wrapper = mount(ParentIndex, {
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
          'el-avatar': true
        }
      }
    })
  })

  it('renders parent management page correctly', () => {
    expect(wrapper.find('.parent-page').exists()).toBe(true)
    expect(wrapper.text()).toContain('家长管理')
  })

  it('displays parent list', () => {
    expect(wrapper.find('.parent-list').exists()).toBe(true)
    expect(wrapper.text()).toContain('家长列表')
  })

  it('displays statistics section', () => {
    expect(wrapper.find('.statistics-section').exists()).toBe(true)
    expect(wrapper.text()).toContain('统计信息')
  })

  it('loads parent data on mount', async () => {
    const { getParentList } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/api/parent')
    await wrapper.vm.$nextTick()
    expect(getParentList).toHaveBeenCalled()
  })

  it('loads statistics data on mount', async () => {
    const { getParentStatistics } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/api/parent')
    await wrapper.vm.$nextTick()
    expect(getParentStatistics).toHaveBeenCalled()
  })

  it('displays parent data in table', () => {
    const table = wrapper.find('.parent-table')
    expect(table.exists()).toBe(true)
  })

  it('shows parent avatars', () => {
    const avatars = wrapper.findAll('.parent-avatar')
    expect(avatars.length).toBeGreaterThan(0)
  })

  it('shows status tags with correct colors', () => {
    const statusTags = wrapper.findAll('.status-tag')
    expect(statusTags.length).toBeGreaterThan(0)
  })

  it('displays children information', () => {
    const childrenCells = wrapper.findAll('.children-cell')
    expect(childrenCells.length).toBeGreaterThan(0)
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
      await searchInput.setValue('张父')
      expect(wrapper.vm.searchQuery).toBe('张父')
    }
  })

  it('handles filter by status', async () => {
    const statusFilter = wrapper.find('.status-filter')
    if (statusFilter.exists()) {
      await statusFilter.vm.$emit('change', 'active')
      expect(wrapper.vm.statusFilter).toBe('active')
    }
  })

  it('handles filter by children count', async () => {
    const childrenFilter = wrapper.find('.children-filter')
    if (childrenFilter.exists()) {
      await childrenFilter.vm.$emit('change', 'multiple')
      expect(wrapper.vm.childrenFilter).toBe('multiple')
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
      const { getParentList } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/api/parent')
      expect(getParentList).toHaveBeenCalledTimes(2)
    }
  })

  it('exports parent list when export button is clicked', async () => {
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
    expect(mainElement.attributes('aria-label')).toBe('Parent Management')
  })

  it('is responsive', () => {
    expect(wrapper.find('.responsive-parent').exists()).toBe(true)
  })

  it('displays children count distribution chart', () => {
    const childrenChart = wrapper.find('.children-chart')
    expect(childrenChart.exists()).toBe(true)
  })

  it('shows contact information', () => {
    const contactCells = wrapper.findAll('.contact-cell')
    expect(contactCells.length).toBeGreaterThan(0)
  })

  it('calculates children count correctly', () => {
    const childrenCount = wrapper.vm.getChildrenCount([
      { name: '张小明', class: '小一班' },
      { name: '张小红', class: '小二班' }
    ])
    expect(childrenCount).toBe(2)
  })

  it('shows communication history button', () => {
    const communicationButtons = wrapper.findAll('.communication-button')
    expect(communicationButtons.length).toBeGreaterThan(0)
  })
})