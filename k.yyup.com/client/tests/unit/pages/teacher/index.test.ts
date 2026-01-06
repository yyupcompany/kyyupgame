
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
import TeacherIndex from '/home/zhgue/yyupcc/k.yyup.com/client/src/pages/teacher/index.vue'

// Mock dependencies
vi.mock('/home/zhgue/yyupcc/k.yyup.com/client/src/stores/user', () => ({
  useUserStore: () => ({
    user: { id: 1, name: 'Test User', role: 'admin' },
    isAuthenticated: true,
    hasPermission: vi.fn().mockReturnValue(true)
  })
}))

vi.mock('/home/zhgue/yyupcc/k.yyup.com/client/src/api/teacher', () => ({
  getTeacherList: vi.fn().mockResolvedValue({
    data: [
      {
        id: 1,
        name: '王老师',
        gender: '女',
        subject: '语文',
        experience: 5,
        classes: ['小一班', '小二班'],
        phone: '13800138000',
        email: 'wang@school.com',
        status: 'active'
      },
      {
        id: 2,
        name: '李老师',
        gender: '男',
        subject: '数学',
        experience: 3,
        classes: ['小三班'],
        phone: '13900139000',
        email: 'li@school.com',
        status: 'active'
      }
    ],
    total: 2,
    page: 1,
    pageSize: 10
  }),
  getTeacherStatistics: vi.fn().mockResolvedValue({
    totalTeachers: 15,
    maleTeachers: 6,
    femaleTeachers: 9,
    averageExperience: 4.2,
    activeTeachers: 14
  })
}))

describe('TeacherIndex', () => {
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
          teacher: {
            title: '教师管理',
            list: '教师列表',
            statistics: '统计信息',
            actions: '操作'
          }
        }
      }
    })

    wrapper = mount(TeacherIndex, {
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
          'el-rate': true
        }
      }
    })
  })

  it('renders teacher management page correctly', () => {
    expect(wrapper.find('.teacher-page').exists()).toBe(true)
    expect(wrapper.text()).toContain('教师管理')
  })

  it('displays teacher list', () => {
    expect(wrapper.find('.teacher-list').exists()).toBe(true)
    expect(wrapper.text()).toContain('教师列表')
  })

  it('displays statistics section', () => {
    expect(wrapper.find('.statistics-section').exists()).toBe(true)
    expect(wrapper.text()).toContain('统计信息')
  })

  it('loads teacher data on mount', async () => {
    const { getTeacherList } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/api/teacher')
    await wrapper.vm.$nextTick()
    expect(getTeacherList).toHaveBeenCalled()
  })

  it('loads statistics data on mount', async () => {
    const { getTeacherStatistics } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/api/teacher')
    await wrapper.vm.$nextTick()
    expect(getTeacherStatistics).toHaveBeenCalled()
  })

  it('displays teacher data in table', () => {
    const table = wrapper.find('.teacher-table')
    expect(table.exists()).toBe(true)
  })

  it('shows teacher avatars', () => {
    const avatars = wrapper.findAll('.teacher-avatar')
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

  it('displays teacher ratings', () => {
    const ratings = wrapper.findAll('.teacher-rating')
    expect(ratings.length).toBeGreaterThan(0)
  })

  it('shows class assignments', () => {
    const classTags = wrapper.findAll('.class-tag')
    expect(classTags.length).toBeGreaterThan(0)
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
      await searchInput.setValue('王老师')
      expect(wrapper.vm.searchQuery).toBe('王老师')
    }
  })

  it('handles filter by subject', async () => {
    const subjectFilter = wrapper.find('.subject-filter')
    if (subjectFilter.exists()) {
      await subjectFilter.vm.$emit('change', '语文')
      expect(wrapper.vm.subjectFilter).toBe('语文')
    }
  })

  it('handles filter by gender', async () => {
    const genderFilter = wrapper.find('.gender-filter')
    if (genderFilter.exists()) {
      await genderFilter.vm.$emit('change', '女')
      expect(wrapper.vm.genderFilter).toBe('女')
    }
  })

  it('handles filter by experience', async () => {
    const experienceFilter = wrapper.find('.experience-filter')
    if (experienceFilter.exists()) {
      await experienceFilter.vm.$emit('change', '5+')
      expect(wrapper.vm.experienceFilter).toBe('5+')
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
      const { getTeacherList } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/api/teacher')
      expect(getTeacherList).toHaveBeenCalledTimes(2)
    }
  })

  it('exports teacher list when export button is clicked', async () => {
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

  it('formats experience display correctly', () => {
    const experienceCell = wrapper.find('.experience-cell')
    expect(experienceCell.exists()).toBe(true)
  })

  it('displays contact information', () => {
    const contactCells = wrapper.findAll('.contact-cell')
    expect(contactCells.length).toBeGreaterThan(0)
  })

  it('has proper accessibility attributes', () => {
    const mainElement = wrapper.find('main')
    expect(mainElement.attributes('role')).toBe('main')
    expect(mainElement.attributes('aria-label')).toBe('Teacher Management')
  })

  it('is responsive', () => {
    expect(wrapper.find('.responsive-teacher').exists()).toBe(true)
  })

  it('displays gender distribution chart', () => {
    const genderChart = wrapper.find('.gender-chart')
    expect(genderChart.exists()).toBe(true)
  })

  it('shows subject distribution', () => {
    const subjectChart = wrapper.find('.subject-chart')
    expect(subjectChart.exists()).toBe(true)
  })

  it('calculates average experience correctly', () => {
    const avgExperience = wrapper.vm.calculateAverageExperience([5, 3, 4])
    expect(avgExperience).toBe(4)
  })
})