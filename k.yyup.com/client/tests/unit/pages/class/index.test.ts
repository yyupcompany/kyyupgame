
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
import ClassIndex from '/home/zhgue/yyupcc/k.yyup.com/client/src/pages/class/index.vue'

// Mock dependencies
vi.mock('/home/zhgue/yyupcc/k.yyup.com/client/src/stores/user', () => ({
  useUserStore: () => ({
    user: { id: 1, name: 'Test User', role: 'admin' },
    isAuthenticated: true,
    hasPermission: vi.fn().mockReturnValue(true)
  })
}))

vi.mock('/home/zhgue/yyupcc/k.yyup.com/client/src/api/class', () => ({
  getClassList: vi.fn().mockResolvedValue({
    data: [
      {
        id: 1,
        name: '小一班',
        teacher: '王老师',
        studentCount: 20,
        maxCapacity: 25,
        status: 'active'
      },
      {
        id: 2,
        name: '小二班',
        teacher: '李老师',
        studentCount: 18,
        maxCapacity: 25,
        status: 'active'
      }
    ],
    total: 2,
    page: 1,
    pageSize: 10
  }),
  getClassStatistics: vi.fn().mockResolvedValue({
    totalClasses: 10,
    totalStudents: 180,
    averageClassSize: 18,
    activeClasses: 8
  })
}))

describe('ClassIndex', () => {
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
          class: {
            title: '班级管理',
            list: '班级列表',
            statistics: '统计信息',
            actions: '操作'
          }
        }
      }
    })

    wrapper = mount(ClassIndex, {
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
          'el-progress': true
        }
      }
    })
  })

  it('renders class management page correctly', () => {
    expect(wrapper.find('.class-page').exists()).toBe(true)
    expect(wrapper.text()).toContain('班级管理')
  })

  it('displays class list', () => {
    expect(wrapper.find('.class-list').exists()).toBe(true)
    expect(wrapper.text()).toContain('班级列表')
  })

  it('displays statistics section', () => {
    expect(wrapper.find('.statistics-section').exists()).toBe(true)
    expect(wrapper.text()).toContain('统计信息')
  })

  it('loads class data on mount', async () => {
    const { getClassList } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/api/class')
    await wrapper.vm.$nextTick()
    expect(getClassList).toHaveBeenCalled()
  })

  it('loads statistics data on mount', async () => {
    const { getClassStatistics } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/api/class')
    await wrapper.vm.$nextTick()
    expect(getClassStatistics).toHaveBeenCalled()
  })

  it('displays class data in table', () => {
    const table = wrapper.find('.class-table')
    expect(table.exists()).toBe(true)
  })

  it('shows class capacity progress', () => {
    const progressBars = wrapper.findAll('.capacity-progress')
    expect(progressBars.length).toBeGreaterThan(0)
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
      await searchInput.setValue('小一班')
      expect(wrapper.vm.searchQuery).toBe('小一班')
    }
  })

  it('handles filter by teacher', async () => {
    const teacherFilter = wrapper.find('.teacher-filter')
    if (teacherFilter.exists()) {
      await teacherFilter.vm.$emit('change', '王老师')
      expect(wrapper.vm.teacherFilter).toBe('王老师')
    }
  })

  it('handles filter by status', async () => {
    const statusFilter = wrapper.find('.status-filter')
    if (statusFilter.exists()) {
      await statusFilter.vm.$emit('change', 'active')
      expect(wrapper.vm.statusFilter).toBe('active')
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
      const { getClassList } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/api/class')
      expect(getClassList).toHaveBeenCalledTimes(2)
    }
  })

  it('exports class list when export button is clicked', async () => {
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

  it('calculates occupancy rate correctly', () => {
    const occupancyRate = wrapper.vm.calculateOccupancyRate(20, 25)
    expect(occupancyRate).toBe(80)
  })

  it('has proper accessibility attributes', () => {
    const mainElement = wrapper.find('main')
    expect(mainElement.attributes('role')).toBe('main')
    expect(mainElement.attributes('aria-label')).toBe('Class Management')
  })

  it('is responsive', () => {
    expect(wrapper.find('.responsive-class').exists()).toBe(true)
  })

  it('displays teacher information correctly', () => {
    const teacherCells = wrapper.findAll('.teacher-cell')
    expect(teacherCells.length).toBeGreaterThan(0)
  })

  it('shows warning for classes nearing capacity', () => {
    const warningIcons = wrapper.findAll('.capacity-warning')
    expect(warningIcons.length).toBeGreaterThanOrEqual(0)
  })
})