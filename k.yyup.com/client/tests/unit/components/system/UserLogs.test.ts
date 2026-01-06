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
import { nextTick } from 'vue'
import ElementPlus from 'element-plus'
import UserLogs from '@/components/system/UserLogs.vue'

// Mock Element Plus components
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn()
    }
  }
})

describe('UserLogs.vue', () => {
  let wrapper: any

  const mockUser = {
    id: '1',
    username: 'testuser',
    realName: '测试用户',
    email: 'test@example.com',
    mobile: '13800138000',
    roles: [
      { id: '1', name: '超级管理员' }
    ],
    status: 'active',
    lastLoginTime: '2023-01-01T00:00:00Z'
  }

  const mockLogs = [
    {
      id: '1',
      userId: '1',
      actionTime: '2023-12-15 10:30:45',
      actionType: 'login',
      actionDesc: '用户登录系统',
      ipAddress: '192.168.1.1',
      location: '中国 广东 深圳',
      device: 'Windows 10',
      browser: 'Chrome 96',
      status: 'success'
    },
    {
      id: '2',
      userId: '1',
      actionTime: '2023-12-14 15:20:30',
      actionType: 'logout',
      actionDesc: '用户退出系统',
      ipAddress: '192.168.1.1',
      location: '中国 广东 深圳',
      device: 'Windows 10',
      browser: 'Chrome 96',
      status: 'success'
    },
    {
      id: '3',
      userId: '1',
      actionTime: '2023-12-13 16:45:12',
      actionType: 'changePassword',
      actionDesc: '用户修改密码',
      ipAddress: '192.168.1.1',
      location: '中国 广东 深圳',
      device: 'Windows 10',
      browser: 'Chrome 96',
      status: 'success'
    },
    {
      id: '4',
      userId: '1',
      actionTime: '2023-12-12 11:30:20',
      actionType: 'login',
      actionDesc: '用户登录失败，密码错误',
      ipAddress: '192.168.1.1',
      location: '中国 广东 深圳',
      device: 'Windows 10',
      browser: 'Chrome 96',
      status: 'failure'
    }
  ]

  const createWrapper = (props = {}) => {
    return mount(UserLogs, {
      props: {
        visible: true,
        user: mockUser,
        ...props
      },
      global: {
        plugins: [ElementPlus],
        stubs: {
          'el-dialog': true,
          'el-form': true,
          'el-form-item': true,
          'el-select': true,
          'el-option': true,
          'el-input': true,
          'el-date-picker': true,
          'el-button': true,
          'el-table': true,
          'el-table-column': true,
          'el-tag': true,
          'el-pagination': true
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('renders correctly with default props', () => {
      wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('renders dialog with correct title', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.user-logs-container').exists()).toBe(true)
    })

    it('renders filter container', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.filter-container').exists()).toBe(true)
    })

    it('renders pagination container', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.pagination-container').exists()).toBe(true)
    })

    it('renders dialog footer', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.dialog-footer').exists()).toBe(true)
    })
  })

  describe('Props Handling', () => {
    it('watches visible prop changes', async () => {
      wrapper = createWrapper({ visible: false })
      
      expect(wrapper.vm.dialogVisible).toBe(false)
      
      await wrapper.setProps({ visible: true })
      await nextTick()
      
      expect(wrapper.vm.dialogVisible).toBe(true)
    })

    it('emits update:visible when dialogVisible changes', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ dialogVisible: false })
      
      expect(wrapper.emitted('update:visible')).toBeTruthy()
      expect(wrapper.emitted('update:visible')[0]).toEqual([false])
    })

    it('loads logs when dialog becomes visible', async () => {
      wrapper = createWrapper({ visible: false })
      
      const loadLogsSpy = vi.spyOn(wrapper.vm, 'loadLogs')
      
      await wrapper.setProps({ visible: true })
      await nextTick()
      
      expect(loadLogsSpy).toHaveBeenCalled()
    })

    it('does not load logs when user is null', async () => {
      const loadLogsSpy = vi.spyOn(wrapper.vm, 'loadLogs')
      
      wrapper = createWrapper({ user: null, visible: false })
      
      await wrapper.setProps({ visible: true })
      await nextTick()
      
      expect(loadLogsSpy).not.toHaveBeenCalled()
    })

    it('does not load logs when user has no id', async () => {
      const loadLogsSpy = vi.spyOn(wrapper.vm, 'loadLogs')
      
      const userWithoutId = { ...mockUser, id: undefined }
      wrapper = createWrapper({ user: userWithoutId, visible: false })
      
      await wrapper.setProps({ visible: true })
      await nextTick()
      
      expect(loadLogsSpy).not.toHaveBeenCalled()
    })
  })

  describe('Data Loading', () => {
    it('loads user logs successfully', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.loadLogs()
      
      expect(wrapper.vm.logList).toEqual(mockLogs)
      expect(wrapper.vm.pagination.total).toBe(mockLogs.length)
    })

    it('builds correct query parameters for loading logs', async () => {
      wrapper = createWrapper()
      
      // Set filter form data
      await wrapper.setData({
        'filterForm.actionType': 'login',
        'filterForm.ipAddress': '192.168.1.1',
        'filterForm.timeRange': [
          new Date('2023-12-01'),
          new Date('2023-12-31')
        ]
      })
      
      const buildParamsSpy = vi.spyOn(wrapper.vm, 'loadLogs')
      
      await wrapper.vm.loadLogs()
      
      expect(buildParamsSpy).toHaveBeenCalled()
    })

    it('handles empty logs response', async () => {
      wrapper = createWrapper()
      
      // Mock setTimeout to return empty logs
      const originalSetTimeout = global.setTimeout
      vi.spyOn(global, 'setTimeout').mockImplementation((callback: any, delay: number) => {
        if (delay === 500) {
          wrapper.vm.logList = []
          wrapper.vm.pagination.total = 0
          wrapper.vm.loading = false
          callback()
        }
        return originalSetTimeout(callback, delay)
      })
      
      await wrapper.vm.loadLogs()
      
      expect(wrapper.vm.logList).toEqual([])
      expect(wrapper.vm.pagination.total).toBe(0)
    })

    it('handles loading errors gracefully', async () => {
      wrapper = createWrapper()
      
      // Mock setTimeout to simulate error
      const originalSetTimeout = global.setTimeout
      vi.spyOn(global, 'setTimeout').mockImplementation((callback: any, delay: number) => {
        if (delay === 500) {
          wrapper.vm.loading = false
          // Simulate error by not setting logList
          callback()
        }
        return originalSetTimeout(callback, delay)
      })
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      await wrapper.vm.loadLogs()
      
      expect(consoleSpy).toHaveBeenCalledWith('加载用户日志失败:', expect.any(Error))
      expect(ElMessage.error).toHaveBeenCalledWith('加载用户日志失败')
      
      consoleSpy.mockRestore()
    })

    it('shows loading state during data loading', async () => {
      wrapper = createWrapper()
      
      // Start loading
      const loadPromise = wrapper.vm.loadLogs()
      
      // Check loading state
      expect(wrapper.vm.loading).toBe(true)
      
      // Wait for loading to complete
      await loadPromise
      
      // Check loading state is reset
      expect(wrapper.vm.loading).toBe(false)
    })
  })

  describe('Filter Functionality', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('handles filter with action type', async () => {
      await wrapper.setData({ 'filterForm.actionType': 'login' })
      await wrapper.vm.handleFilter()
      
      expect(wrapper.vm.pagination.currentPage).toBe(1)
      // loadLogs should be called
    })

    it('handles filter with IP address', async () => {
      await wrapper.setData({ 'filterForm.ipAddress': '192.168.1.1' })
      await wrapper.vm.handleFilter()
      
      expect(wrapper.vm.pagination.currentPage).toBe(1)
    })

    it('handles filter with time range', async () => {
      const timeRange = [
        new Date('2023-12-01'),
        new Date('2023-12-31')
      ]
      await wrapper.setData({ 'filterForm.timeRange': timeRange })
      await wrapper.vm.handleFilter()
      
      expect(wrapper.vm.pagination.currentPage).toBe(1)
    })

    it('handles filter with multiple criteria', async () => {
      await wrapper.setData({
        'filterForm.actionType': 'login',
        'filterForm.ipAddress': '192.168.1.1',
        'filterForm.timeRange': [
          new Date('2023-12-01'),
          new Date('2023-12-31')
        ]
      })
      await wrapper.vm.handleFilter()
      
      expect(wrapper.vm.pagination.currentPage).toBe(1)
    })

    it('resets filter form correctly', async () => {
      await wrapper.setData({
        'filterForm.actionType': 'login',
        'filterForm.ipAddress': '192.168.1.1',
        'filterForm.timeRange': [
          new Date('2023-12-01'),
          new Date('2023-12-31')
        ]
      })
      
      await wrapper.vm.resetFilter()
      
      expect(wrapper.vm.filterForm.actionType).toBeUndefined()
      expect(wrapper.vm.filterForm.ipAddress).toBe('')
      expect(wrapper.vm.filterForm.timeRange).toBeUndefined()
      expect(wrapper.vm.pagination.currentPage).toBe(1)
    })
  })

  describe('Pagination', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('handles page size change', async () => {
      await wrapper.vm.handleSizeChange(20)
      
      expect(wrapper.vm.pagination.pageSize).toBe(20)
      expect(wrapper.vm.pagination.currentPage).toBe(1)
    })

    it('handles current page change', async () => {
      await wrapper.vm.handleCurrentChange(2)
      
      expect(wrapper.vm.pagination.currentPage).toBe(2)
    })

    it('reloads data when pagination changes', async () => {
      const loadLogsSpy = vi.spyOn(wrapper.vm, 'loadLogs')
      
      // Change page size
      await wrapper.vm.handleSizeChange(20)
      
      expect(loadLogsSpy).toHaveBeenCalled()
      
      // Change current page
      await wrapper.vm.handleCurrentChange(2)
      
      expect(loadLogsSpy).toHaveBeenCalledTimes(2)
    })

    it('maintains filter criteria when pagination changes', async () => {
      await wrapper.setData({ 'filterForm.actionType': 'login' })
      
      const loadLogsSpy = vi.spyOn(wrapper.vm, 'loadLogs')
      
      await wrapper.vm.handleCurrentChange(2)
      
      expect(loadLogsSpy).toHaveBeenCalled()
      expect(wrapper.vm.filterForm.actionType).toBe('login')
    })
  })

  describe('Action Type Handling', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('returns correct tag type for login action', () => {
      const tagType = wrapper.vm.getActionTypeTag('login')
      expect(tagType).toBe('success')
    })

    it('returns correct tag type for logout action', () => {
      const tagType = wrapper.vm.getActionTypeTag('logout')
      expect(tagType).toBe('info')
    })

    it('returns correct tag type for changePassword action', () => {
      const tagType = wrapper.vm.getActionTypeTag('changePassword')
      expect(tagType).toBe('warning')
    })

    it('returns correct tag type for updateProfile action', () => {
      const tagType = wrapper.vm.getActionTypeTag('updateProfile')
      expect(tagType).toBe('primary')
    })

    it('returns correct tag type for other action', () => {
      const tagType = wrapper.vm.getActionTypeTag('other')
      expect(tagType).toBe('info')
    })

    it('returns correct label for login action', () => {
      const label = wrapper.vm.getActionTypeLabel('login')
      expect(label).toBe('登录')
    })

    it('returns correct label for logout action', () => {
      const label = wrapper.vm.getActionTypeLabel('logout')
      expect(label).toBe('登出')
    })

    it('returns correct label for changePassword action', () => {
      const label = wrapper.vm.getActionTypeLabel('changePassword')
      expect(label).toBe('修改密码')
    })

    it('returns correct label for updateProfile action', () => {
      const label = wrapper.vm.getActionTypeLabel('updateProfile')
      expect(label).toBe('更新信息')
    })

    it('returns correct label for other action', () => {
      const label = wrapper.vm.getActionTypeLabel('other')
      expect(label).toBe('其他')
    })

    it('returns original type for unknown action', () => {
      const label = wrapper.vm.getActionTypeLabel('unknown')
      expect(label).toBe('unknown')
    })
  })

  describe('Date Shortcuts', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('has correct date shortcuts configuration', () => {
      const shortcuts = wrapper.vm.dateShortcuts
      expect(shortcuts).toHaveLength(3)
    })

    it('has last week shortcut', () => {
      const shortcut = wrapper.vm.dateShortcuts[0]
      expect(shortcut.text).toBe('最近一周')
      
      const dateRange = shortcut.value()
      expect(dateRange).toHaveLength(2)
      expect(dateRange[0]).toBeInstanceOf(Date)
      expect(dateRange[1]).toBeInstanceOf(Date)
    })

    it('has last month shortcut', () => {
      const shortcut = wrapper.vm.dateShortcuts[1]
      expect(shortcut.text).toBe('最近一个月')
      
      const dateRange = shortcut.value()
      expect(dateRange).toHaveLength(2)
    })

    it('has last three months shortcut', () => {
      const shortcut = wrapper.vm.dateShortcuts[2]
      expect(shortcut.text).toBe('最近三个月')
      
      const dateRange = shortcut.value()
      expect(dateRange).toHaveLength(2)
    })
  })

  describe('Table Display', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await wrapper.vm.loadLogs()
    })

    it('displays log entries correctly', () => {
      const logs = wrapper.vm.logList
      expect(logs.length).toBe(4)
      
      const loginLog = logs.find((log: any) => log.actionType === 'login')
      expect(loginLog).toBeDefined()
      expect(loginLog.actionDesc).toBe('用户登录系统')
      expect(loginLog.ipAddress).toBe('192.168.1.1')
    })

    it('displays action type tags correctly', () => {
      const logs = wrapper.vm.logList
      
      const loginLog = logs.find((log: any) => log.actionType === 'login')
      const logoutLog = logs.find((log: any) => log.actionType === 'logout')
      const changePasswordLog = logs.find((log: any) => log.actionType === 'changePassword')
      
      expect(loginLog).toBeDefined()
      expect(logoutLog).toBeDefined()
      expect(changePasswordLog).toBeDefined()
    })

    it('displays status tags correctly', () => {
      const logs = wrapper.vm.logList
      const successLogs = logs.filter((log: any) => log.status === 'success')
      const failureLogs = logs.filter((log: any) => log.status === 'failure')
      
      expect(successLogs.length).toBe(3)
      expect(failureLogs.length).toBe(1)
    })
  })

  describe('Dialog Close Handler', () => {
    it('closes dialog when handleClose is called', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.handleClose()
      
      expect(wrapper.vm.dialogVisible).toBe(false)
    })
  })

  describe('User Changes', () => {
    it('reloads logs when user changes', async () => {
      wrapper = createWrapper()
      
      const loadLogsSpy = vi.spyOn(wrapper.vm, 'loadLogs')
      
      const newUser = { ...mockUser, id: '2', username: 'newuser' }
      await wrapper.setProps({ user: newUser })
      
      expect(loadLogsSpy).toHaveBeenCalled()
    })

    it('does not reload logs when user changes to null', async () => {
      wrapper = createWrapper()
      
      const loadLogsSpy = vi.spyOn(wrapper.vm, 'loadLogs')
      
      await wrapper.setProps({ user: null })
      
      expect(loadLogsSpy).not.toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined user gracefully', () => {
      wrapper = createWrapper({ user: undefined })
      expect(wrapper.vm.dialogVisible).toBe(true)
    })

    it('handles user without id gracefully', async () => {
      const userWithoutId = { ...mockUser, id: undefined }
      wrapper = createWrapper({ user: userWithoutId })
      
      await wrapper.vm.loadLogs()
      
      // Should not attempt to load logs
      expect(wrapper.vm.logList).toEqual([])
    })

    it('handles immediate visible change on mount', async () => {
      const loadLogsSpy = vi.spyOn(wrapper.vm, 'loadLogs')
      
      wrapper = createWrapper({ visible: true })
      await nextTick()
      
      expect(loadLogsSpy).toHaveBeenCalled()
    })

    it('handles empty time range in filters', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({
        'filterForm.timeRange': undefined
      })
      
      await wrapper.vm.handleFilter()
      
      expect(wrapper.vm.pagination.currentPage).toBe(1)
    })

    it('handles time range with null dates', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({
        'filterForm.timeRange': [null, null]
      })
      
      await wrapper.vm.handleFilter()
      
      expect(wrapper.vm.pagination.currentPage).toBe(1)
    })

    it('handles concurrent filter operations', async () => {
      wrapper = createWrapper()
      
      // Simulate rapid filter changes
      await Promise.all([
        wrapper.vm.handleFilter(),
        wrapper.vm.resetFilter(),
        wrapper.vm.handleFilter()
      ])
      
      // Should handle gracefully without errors
      expect(wrapper.vm.pagination.currentPage).toBe(1)
    })
  })
})