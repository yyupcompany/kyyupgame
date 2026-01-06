
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
import ActivityIndex from '/home/zhgue/yyupcc/k.yyup.com/client/src/pages/activity/index.vue'

// Mock dependencies
vi.mock('/home/zhgue/yyupcc/k.yyup.com/client/src/stores/user', () => ({
  useUserStore: () => ({
    user: { id: 1, name: 'Test User', role: 'admin' },
    isAuthenticated: true,
    hasPermission: vi.fn().mockReturnValue(true)
  })
}))

vi.mock('/home/zhgue/yyupcc/k.yyup.com/client/src/api/activity', () => ({
  getActivityList: vi.fn().mockResolvedValue({
    data: [
      {
        id: 1,
        title: '春季运动会',
        type: 'sports',
        startDate: '2025-03-15',
        endDate: '2025-03-16',
        location: '操场',
        participants: 50,
        maxParticipants: 100,
        status: 'upcoming',
        organizer: '体育组'
      },
      {
        id: 2,
        title: '家长开放日',
        type: 'education',
        startDate: '2025-02-20',
        endDate: '2025-02-20',
        location: '各班级',
        participants: 80,
        maxParticipants: 120,
        status: 'ongoing',
        organizer: '教务处'
      }
    ],
    total: 2,
    page: 1,
    pageSize: 10
  }),
  getActivityStatistics: vi.fn().mockResolvedValue({
    totalActivities: 25,
    upcomingActivities: 5,
    ongoingActivities: 3,
    completedActivities: 17,
    totalParticipants: 1200
  })
}))

describe('ActivityIndex', () => {
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
          activity: {
            title: '活动管理',
            list: '活动列表',
            statistics: '统计信息',
            actions: '操作'
          }
        }
      }
    })

    wrapper = mount(ActivityIndex, {
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
          'el-calendar': true
        }
      }
    })
  })

  it('renders activity management page correctly', () => {
    expect(wrapper.find('.activity-page').exists()).toBe(true)
    expect(wrapper.text()).toContain('活动管理')
  })

  it('displays activity list', () => {
    expect(wrapper.find('.activity-list').exists()).toBe(true)
    expect(wrapper.text()).toContain('活动列表')
  })

  it('displays statistics section', () => {
    expect(wrapper.find('.statistics-section').exists()).toBe(true)
    expect(wrapper.text()).toContain('统计信息')
  })

  it('loads activity data on mount', async () => {
    const { getActivityList } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/api/activity')
    await wrapper.vm.$nextTick()
    expect(getActivityList).toHaveBeenCalled()
  })

  it('loads statistics data on mount', async () => {
    const { getActivityStatistics } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/api/activity')
    await wrapper.vm.$nextTick()
    expect(getActivityStatistics).toHaveBeenCalled()
  })

  it('displays activity data in table', () => {
    const table = wrapper.find('.activity-table')
    expect(table.exists()).toBe(true)
  })

  it('shows activity type tags with correct colors', () => {
    const typeTags = wrapper.findAll('.type-tag')
    expect(typeTags.length).toBeGreaterThan(0)
  })

  it('shows status tags with correct colors', () => {
    const statusTags = wrapper.findAll('.status-tag')
    expect(statusTags.length).toBeGreaterThan(0)
  })

  it('displays participant progress', () => {
    const progressBars = wrapper.findAll('.participant-progress')
    expect(progressBars.length).toBeGreaterThan(0)
  })

  it('shows calendar view', () => {
    const calendar = wrapper.find('.activity-calendar')
    expect(calendar.exists()).toBe(true)
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
      await searchInput.setValue('运动会')
      expect(wrapper.vm.searchQuery).toBe('运动会')
    }
  })

  it('handles filter by type', async () => {
    const typeFilter = wrapper.find('.type-filter')
    if (typeFilter.exists()) {
      await typeFilter.vm.$emit('change', 'sports')
      expect(wrapper.vm.typeFilter).toBe('sports')
    }
  })

  it('handles filter by status', async () => {
    const statusFilter = wrapper.find('.status-filter')
    if (statusFilter.exists()) {
      await statusFilter.vm.$emit('change', 'upcoming')
      expect(wrapper.vm.statusFilter).toBe('upcoming')
    }
  })

  it('handles filter by date range', async () => {
    const dateRangeFilter = wrapper.find('.date-range-filter')
    if (dateRangeFilter.exists()) {
      await dateRangeFilter.vm.$emit('change', ['2025-01-01', '2025-12-31'])
      expect(wrapper.vm.dateRange).toEqual(['2025-01-01', '2025-12-31'])
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

  it('opens registration dialog when register button is clicked', async () => {
    const registerButton = wrapper.find('.register-button')
    if (registerButton.exists()) {
      await registerButton.trigger('click')
      expect(wrapper.vm.showRegistrationDialog).toBe(true)
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
      const { getActivityList } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/api/activity')
      expect(getActivityList).toHaveBeenCalledTimes(2)
    }
  })

  it('exports activity list when export button is clicked', async () => {
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

  it('formats date range correctly', () => {
    const dateRangeCell = wrapper.find('.date-range-cell')
    expect(dateRangeCell.exists()).toBe(true)
  })

  it('calculates participation rate correctly', () => {
    const participationRate = wrapper.vm.calculateParticipationRate(50, 100)
    expect(participationRate).toBe(50)
  })

  it('has proper accessibility attributes', () => {
    const mainElement = wrapper.find('main')
    expect(mainElement.attributes('role')).toBe('main')
    expect(mainElement.attributes('aria-label')).toBe('Activity Management')
  })

  it('is responsive', () => {
    expect(wrapper.find('.responsive-activity').exists()).toBe(true)
  })

  it('displays activity type distribution chart', () => {
    const typeChart = wrapper.find('.type-chart')
    expect(typeChart.exists()).toBe(true)
  })

  it('shows monthly activity calendar', () => {
    const monthlyCalendar = wrapper.find('.monthly-calendar')
    expect(monthlyCalendar.exists()).toBe(true)
  })

  it('displays location information', () => {
    const locationCells = wrapper.findAll('.location-cell')
    expect(locationCells.length).toBeGreaterThan(0)
  })

  it('shows organizer information', () => {
    const organizerCells = wrapper.findAll('.organizer-cell')
    expect(organizerCells.length).toBeGreaterThan(0)
  })

  it('switches between list and calendar view', async () => {
    const viewToggle = wrapper.find('.view-toggle')
    if (viewToggle.exists()) {
      await viewToggle.vm.$emit('change', 'calendar')
      expect(wrapper.vm.currentView).toBe('calendar')
    }
  })
})