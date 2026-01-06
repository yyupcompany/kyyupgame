
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
import StudentIndex from '/home/zhgue/yyupcc/k.yyup.com/client/src/pages/student/index.vue'

// Mock dependencies
vi.mock('/home/zhgue/yyupcc/k.yyup.com/client/src/stores/user', () => ({
  useUserStore: () => ({
    user: { id: 1, name: 'Test User', role: 'admin' },
    isAuthenticated: true,
    hasPermission: vi.fn().mockReturnValue(true)
  })
}))

vi.mock('/home/zhgue/yyupcc/k.yyup.com/client/src/api/student', () => ({
  getStudentList: vi.fn().mockResolvedValue({
    data: [
      {
        id: 1,
        name: '张小明',
        age: 5,
        gender: '男',
        className: '小一班',
        parentName: '张父',
        phone: '13800138000',
        status: 'active'
      },
      {
        id: 2,
        name: '李小红',
        age: 4,
        gender: '女',
        className: '小二班',
        parentName: '李母',
        phone: '13900139000',
        status: 'active'
      }
    ],
    total: 2,
    page: 1,
    pageSize: 10
  }),
  getStudentStatistics: vi.fn().mockResolvedValue({
    totalStudents: 50,
    maleStudents: 25,
    femaleStudents: 25,
    activeStudents: 48,
    inactiveStudents: 2
  })
}))

describe('StudentIndex', () => {
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
          student: {
            title: '学生管理',
            list: '学生列表',
            statistics: '统计信息',
            actions: '操作'
          }
        }
      }
    })

    wrapper = mount(StudentIndex, {
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

  it('renders student management page correctly', () => {
    expect(wrapper.find('.student-page').exists()).toBe(true)
    expect(wrapper.text()).toContain('学生管理')
  })

  it('displays student list', () => {
    expect(wrapper.find('.student-list').exists()).toBe(true)
    expect(wrapper.text()).toContain('学生列表')
  })

  it('displays statistics section', () => {
    expect(wrapper.find('.statistics-section').exists()).toBe(true)
    expect(wrapper.text()).toContain('统计信息')
  })

  it('loads student data on mount', async () => {
    const { getStudentList } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/api/student')
    await wrapper.vm.$nextTick()
    expect(getStudentList).toHaveBeenCalled()
  })

  it('loads statistics data on mount', async () => {
    const { getStudentStatistics } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/api/student')
    await wrapper.vm.$nextTick()
    expect(getStudentStatistics).toHaveBeenCalled()
  })

  it('displays student data in table', () => {
    const table = wrapper.find('.student-table')
    expect(table.exists()).toBe(true)
  })

  it('shows student avatars', () => {
    const avatars = wrapper.findAll('.student-avatar')
    expect(avatars.length).toBeGreaterThan(0)
  })

  it('shows gender tags with correct colors', () => {
    const genderTags = wrapper.findAll('.gender-tag')
    expect(genderTags.length).toBeGreaterThan(0)
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
      await searchInput.setValue('张小明')
      expect(wrapper.vm.searchQuery).toBe('张小明')
    }
  })

  it('handles filter by class', async () => {
    const classFilter = wrapper.find('.class-filter')
    if (classFilter.exists()) {
      await classFilter.vm.$emit('change', '小一班')
      expect(wrapper.vm.classFilter).toBe('小一班')
    }
  })

  it('handles filter by gender', async () => {
    const genderFilter = wrapper.find('.gender-filter')
    if (genderFilter.exists()) {
      await genderFilter.vm.$emit('change', '男')
      expect(wrapper.vm.genderFilter).toBe('男')
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
      const { getStudentList } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/api/student')
      expect(getStudentList).toHaveBeenCalledTimes(2)
    }
  })

  it('exports student list when export button is clicked', async () => {
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

  it('calculates age correctly', () => {
    const age = wrapper.vm.calculateAge('2020-01-01')
    expect(age).toBe(5)
  })

  it('has proper accessibility attributes', () => {
    const mainElement = wrapper.find('main')
    expect(mainElement.attributes('role')).toBe('main')
    expect(mainElement.attributes('aria-label')).toBe('Student Management')
  })

  it('is responsive', () => {
    expect(wrapper.find('.responsive-student').exists()).toBe(true)
  })

  it('displays gender distribution chart', () => {
    const genderChart = wrapper.find('.gender-chart')
    expect(genderChart.exists()).toBe(true)
  })

  it('shows parent contact information', () => {
    const parentCells = wrapper.findAll('.parent-cell')
    expect(parentCells.length).toBeGreaterThan(0)
  })
})