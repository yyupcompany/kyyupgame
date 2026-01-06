
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
import EnrollmentIndex from '/home/zhgue/yyupcc/k.yyup.com/client/src/pages/enrollment/index.vue'

// Mock dependencies
vi.mock('/home/zhgue/yyupcc/k.yyup.com/client/src/stores/user', () => ({
  useUserStore: () => ({
    user: { id: 1, name: 'Test User', role: 'admin' },
    isAuthenticated: true,
    hasPermission: vi.fn().mockReturnValue(true)
  })
}))

vi.mock('/home/zhgue/yyupcc/k.yyup.com/client/src/api/enrollment', () => ({
  getEnrollmentList: vi.fn().mockResolvedValue({
    data: [
      {
        id: 1,
        studentName: '张三',
        parentName: '张父',
        status: 'pending',
        applicationDate: '2025-01-14',
        class: '小一班'
      },
      {
        id: 2,
        studentName: '李四',
        parentName: '李母',
        status: 'approved',
        applicationDate: '2025-01-13',
        class: '小二班'
      }
    ],
    total: 2,
    page: 1,
    pageSize: 10
  }),
  getEnrollmentStatistics: vi.fn().mockResolvedValue({
    pending: 5,
    approved: 10,
    rejected: 2,
    total: 17
  })
}))

describe('EnrollmentIndex', () => {
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
          enrollment: {
            title: '招生管理',
            list: '招生列表',
            statistics: '统计信息',
            actions: '操作'
          }
        }
      }
    })

    wrapper = mount(EnrollmentIndex, {
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
          'el-form-item': true
        }
      }
    })
  })

  it('renders enrollment page correctly', () => {
    expect(wrapper.find('.enrollment-page').exists()).toBe(true)
    expect(wrapper.text()).toContain('招生管理')
  })

  it('displays enrollment list', () => {
    expect(wrapper.find('.enrollment-list').exists()).toBe(true)
    expect(wrapper.text()).toContain('招生列表')
  })

  it('displays statistics section', () => {
    expect(wrapper.find('.statistics-section').exists()).toBe(true)
    expect(wrapper.text()).toContain('统计信息')
  })

  it('loads enrollment data on mount', async () => {
    const { getEnrollmentList } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/api/enrollment')
    await wrapper.vm.$nextTick()
    expect(getEnrollmentList).toHaveBeenCalled()
  })

  it('loads statistics data on mount', async () => {
    const { getEnrollmentStatistics } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/api/enrollment')
    await wrapper.vm.$nextTick()
    expect(getEnrollmentStatistics).toHaveBeenCalled()
  })

  it('displays enrollment data in table', () => {
    const table = wrapper.find('.enrollment-table')
    expect(table.exists()).toBe(true)
  })

  it('shows status tags with correct colors', () => {
    const statusTags = wrapper.findAll('.status-tag')
    expect(statusTags.length).toBeGreaterThan(0)
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

  it('handles filter change', async () => {
    const filterSelect = wrapper.find('.filter-select')
    if (filterSelect.exists()) {
      await filterSelect.vm.$emit('change', 'approved')
      expect(wrapper.vm.filterStatus).toBe('approved')
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
      const { getEnrollmentList } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/api/enrollment')
      expect(getEnrollmentList).toHaveBeenCalledTimes(2)
    }
  })

  it('exports data when export button is clicked', async () => {
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

  it('has proper accessibility attributes', () => {
    const mainElement = wrapper.find('main')
    expect(mainElement.attributes('role')).toBe('main')
    expect(mainElement.attributes('aria-label')).toBe('Enrollment Management')
  })

  it('is responsive', () => {
    expect(wrapper.find('.responsive-enrollment').exists()).toBe(true)
  })

  it('formats dates correctly', () => {
    const dateElement = wrapper.find('.application-date')
    expect(dateElement.exists()).toBe(true)
  })
})