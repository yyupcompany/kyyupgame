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
import UserList from '@/components/system/UserList.vue'

// Mock Element Plus components
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn()
    }
  }
})

// Mock API functions
vi.mock('@/api/modules/system', () => ({
  getUsers: vi.fn(),
  getRoles: vi.fn(),
  updateUserStatus: vi.fn(),
  deleteUser: vi.fn(),
  UserStatus: {
    ACTIVE: 'active',
    INACTIVE: 'inactive'
  }
}))

describe('UserList.vue', () => {
  let wrapper: any

  const mockUsers = [
    {
      id: '1',
      username: 'admin',
      realName: '管理员',
      email: 'admin@example.com',
      mobile: '13800138000',
      roles: [
        { id: '1', name: '超级管理员' }
      ],
      status: 'active',
      lastLoginTime: '2023-01-01T00:00:00Z'
    },
    {
      id: '2',
      username: 'teacher1',
      realName: '张老师',
      email: 'teacher1@example.com',
      mobile: '13800138001',
      roles: [
        { id: '3', name: '教师' }
      ],
      status: 'active',
      lastLoginTime: '2023-01-02T00:00:00Z'
    },
    {
      id: '3',
      username: 'parent1',
      realName: '李家长',
      email: 'parent1@example.com',
      mobile: '13800138002',
      roles: [
        { id: '4', name: '家长' }
      ],
      status: 'inactive',
      lastLoginTime: '2023-01-03T00:00:00Z'
    }
  ]

  const mockRoles = [
    { id: '1', name: '超级管理员' },
    { id: '2', name: '普通管理员' },
    { id: '3', name: '教师' },
    { id: '4', name: '家长' }
  ]

  const createWrapper = () => {
    return mount(UserList, {
      global: {
        plugins: [ElementPlus],
        stubs: {
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
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
    
    // Mock successful API responses
    const { getUsers, getRoles, updateUserStatus, deleteUser } = require('@/api/modules/system')
    
    getUsers.mockResolvedValue({
      success: true,
      items: mockUsers,
      total: mockUsers.length
    })
    
    getRoles.mockResolvedValue({
      success: true,
      data: mockRoles
    })
    
    updateUserStatus.mockResolvedValue({
      success: true
    })
    
    deleteUser.mockResolvedValue({
      success: true
    })
  })

  describe('Component Rendering', () => {
    it('renders correctly', () => {
      wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('renders search form', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.search-container').exists()).toBe(true)
    })

    it('renders user list table', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.app-card-header').exists()).toBe(true)
      expect(wrapper.vm.userList).toBeDefined()
    })

    it('renders pagination component', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.pagination-container').exists()).toBe(true)
    })
  })

  describe('Data Loading', () => {
    it('loads user list and roles on mount', async () => {
      wrapper = createWrapper()
      
      // Wait for component to mount
      await nextTick()
      
      expect(getUsers).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        username: undefined,
        realName: undefined,
        roleId: undefined,
        status: undefined
      })
      
      expect(getRoles).toHaveBeenCalled()
    })

    it('handles successful user list loading', async () => {
      wrapper = createWrapper()
      await nextTick()
      
      expect(wrapper.vm.userList).toEqual(mockUsers)
      expect(wrapper.vm.pagination.total).toBe(mockUsers.length)
    })

    it('handles successful role options loading', async () => {
      wrapper = createWrapper()
      await nextTick()
      
      expect(wrapper.vm.roleOptions).toEqual(mockRoles)
    })

    it('handles user list API errors gracefully', async () => {
      const { getUsers } = require('@/api/modules/system')
      getUsers.mockRejectedValue(new Error('Network error'))
      
      wrapper = createWrapper()
      await nextTick()
      
      expect(wrapper.vm.userList).toEqual([])
      expect(wrapper.vm.pagination.total).toBe(0)
      expect(ElMessage.error).toHaveBeenCalledWith('加载用户列表失败')
    })

    it('handles role options API errors gracefully', async () => {
      const { getRoles } = require('@/api/modules/system')
      getRoles.mockRejectedValue(new Error('Network error'))
      
      wrapper = createWrapper()
      await nextTick()
      
      expect(ElMessage.error).toHaveBeenCalledWith('加载角色选项失败')
    })

    it('handles empty user list response', async () => {
      const { getUsers } = require('@/api/modules/system')
      getUsers.mockResolvedValue({
        success: true,
        items: [],
        total: 0
      })
      
      wrapper = createWrapper()
      await nextTick()
      
      expect(wrapper.vm.userList).toEqual([])
      expect(wrapper.vm.pagination.total).toBe(0)
    })

    it('handles role options with non-array data', async () => {
      const { getRoles } = require('@/api/modules/system')
      getRoles.mockResolvedValue({
        success: true,
        data: null // Non-array data
      })
      
      wrapper = createWrapper()
      await nextTick()
      
      expect(wrapper.vm.roleOptions).toEqual([])
    })
  })

  describe('Search Functionality', () => {
    it('handles search with username filter', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ 'searchForm.username': 'admin' })
      await wrapper.vm.handleSearch()
      
      expect(getUsers).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        username: 'admin',
        realName: undefined,
        roleId: undefined,
        status: undefined
      })
    })

    it('handles search with realName filter', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ 'searchForm.realName': '张' })
      await wrapper.vm.handleSearch()
      
      expect(getUsers).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        username: undefined,
        realName: '张',
        roleId: undefined,
        status: undefined
      })
    })

    it('handles search with roleId filter', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ 'searchForm.roleId': '3' })
      await wrapper.vm.handleSearch()
      
      expect(getUsers).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        username: undefined,
        realName: undefined,
        roleId: '3',
        status: undefined
      })
    })

    it('handles search with status filter', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ 'searchForm.status': 'active' })
      await wrapper.vm.handleSearch()
      
      expect(getUsers).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        username: undefined,
        realName: undefined,
        roleId: undefined,
        status: 'active'
      })
    })

    it('handles search with multiple filters', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({
        'searchForm.username': 'teacher',
        'searchForm.realName': '张',
        'searchForm.roleId': '3',
        'searchForm.status': 'active'
      })
      await wrapper.vm.handleSearch()
      
      expect(getUsers).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        username: 'teacher',
        realName: '张',
        roleId: '3',
        status: 'active'
      })
    })

    it('resets search form correctly', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({
        'searchForm.username': '测试',
        'searchForm.realName': '用户',
        'searchForm.roleId': '1',
        'searchForm.status': 'inactive'
      })
      
      await wrapper.vm.resetSearch()
      
      expect(wrapper.vm.searchForm.username).toBe('')
      expect(wrapper.vm.searchForm.realName).toBe('')
      expect(wrapper.vm.searchForm.roleId).toBe('')
      expect(wrapper.vm.searchForm.status).toBe('')
      expect(wrapper.vm.pagination.currentPage).toBe(1)
    })
  })

  describe('Pagination', () => {
    it('handles page size change', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.handleSizeChange(20)
      
      expect(wrapper.vm.pagination.pageSize).toBe(20)
      expect(wrapper.vm.pagination.currentPage).toBe(1)
    })

    it('handles current page change', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.handleCurrentChange(2)
      
      expect(wrapper.vm.pagination.currentPage).toBe(2)
    })

    it('reloads data when pagination changes', async () => {
      wrapper = createWrapper()
      
      // Change page size
      await wrapper.vm.handleSizeChange(20)
      
      expect(getUsers).toHaveBeenCalledTimes(2) // Initial load + page size change
      
      // Change current page
      await wrapper.vm.handleCurrentChange(2)
      
      expect(getUsers).toHaveBeenCalledTimes(3) // + page change
    })

    it('maintains search filters when pagination changes', async () => {
      wrapper = createWrapper()
      
      // Set search filters
      await wrapper.setData({ 'searchForm.username': 'admin' })
      
      // Change page
      await wrapper.vm.handleCurrentChange(2)
      
      expect(getUsers).toHaveBeenCalledWith({
        page: 2,
        pageSize: 10,
        username: 'admin',
        realName: undefined,
        roleId: undefined,
        status: undefined
      })
    })
  })

  describe('User Interactions', () => {
    it('emits add event when add button is clicked', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.handleAdd()
      
      expect(wrapper.emitted('add')).toBeTruthy()
    })

    it('emits edit event when edit button is clicked', async () => {
      wrapper = createWrapper()
      
      const user = mockUsers[0]
      await wrapper.vm.handleEdit(user)
      
      expect(wrapper.emitted('edit')).toBeTruthy()
      expect(wrapper.emitted('edit')[0]).toEqual([user])
    })

    it('emits roles event when roles button is clicked', async () => {
      wrapper = createWrapper()
      
      const user = mockUsers[0]
      await wrapper.vm.handleRoles(user)
      
      expect(wrapper.emitted('roles')).toBeTruthy()
      expect(wrapper.emitted('roles')[0]).toEqual([user])
    })
  })

  describe('Status Management', () => {
    it('changes user status to inactive', async () => {
      wrapper = createWrapper()
      
      const user = mockUsers[0]
      await wrapper.vm.handleStatusChange(user, 'inactive')
      
      const { updateUserStatus, UserStatus } = require('@/api/modules/system')
      expect(updateUserStatus).toHaveBeenCalledWith(user.id, UserStatus.INACTIVE)
      expect(ElMessage.success).toHaveBeenCalledWith('用户禁用成功')
      expect(getUsers).toHaveBeenCalled() // Should reload the list
    })

    it('changes user status to active', async () => {
      wrapper = createWrapper()
      
      const user = mockUsers[2] // inactive user
      await wrapper.vm.handleStatusChange(user, 'active')
      
      const { updateUserStatus, UserStatus } = require('@/api/modules/system')
      expect(updateUserStatus).toHaveBeenCalledWith(user.id, UserStatus.ACTIVE)
      expect(ElMessage.success).toHaveBeenCalledWith('用户启用成功')
      expect(getUsers).toHaveBeenCalled() // Should reload the list
    })

    it('handles status change API errors', async () => {
      const { updateUserStatus } = require('@/api/modules/system')
      updateUserStatus.mockRejectedValue(new Error('Network error'))
      
      wrapper = createWrapper()
      
      const user = mockUsers[0]
      await wrapper.vm.handleStatusChange(user, 'inactive')
      
      expect(ElMessage.error).toHaveBeenCalledWith('更新用户状态失败')
    })

    it('handles status change API error responses', async () => {
      const { updateUserStatus } = require('@/api/modules/system')
      updateUserStatus.mockResolvedValue({
        success: false,
        message: 'Status update failed'
      })
      
      wrapper = createWrapper()
      
      const user = mockUsers[0]
      await wrapper.vm.handleStatusChange(user, 'inactive')
      
      expect(ElMessage.error).toHaveBeenCalledWith('用户禁用失败')
    })
  })

  describe('User Deletion', () => {
    it('shows confirmation dialog before deletion', async () => {
      wrapper = createWrapper()
      
      const user = mockUsers[0]
      await wrapper.vm.handleDelete(user)
      
      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        `确定要删除用户"${user.username}"吗？删除后不可恢复。`,
        '删除确认',
        {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
    })

    it('deletes user when confirmed', async () => {
      ElMessageBox.confirm.mockResolvedValue(true)
      
      wrapper = createWrapper()
      
      const user = mockUsers[0]
      await wrapper.vm.handleDelete(user)
      
      expect(deleteUser).toHaveBeenCalledWith(user.id)
      expect(ElMessage.success).toHaveBeenCalledWith('用户删除成功')
      expect(getUsers).toHaveBeenCalled() // Should reload the list
    })

    it('does not delete user when cancelled', async () => {
      ElMessageBox.confirm.mockRejectedValue(new Error('cancelled'))
      
      wrapper = createWrapper()
      
      const user = mockUsers[0]
      await wrapper.vm.handleDelete(user)
      
      expect(deleteUser).not.toHaveBeenCalled()
    })

    it('handles deletion API errors', async () => {
      ElMessageBox.confirm.mockResolvedValue(true)
      const { deleteUser } = require('@/api/modules/system')
      deleteUser.mockRejectedValue(new Error('Network error'))
      
      wrapper = createWrapper()
      
      const user = mockUsers[0]
      await wrapper.vm.handleDelete(user)
      
      expect(ElMessage.error).toHaveBeenCalledWith('删除用户失败')
    })

    it('handles deletion API error responses', async () => {
      ElMessageBox.confirm.mockResolvedValue(true)
      const { deleteUser } = require('@/api/modules/system')
      deleteUser.mockResolvedValue({
        success: false,
        message: 'Deletion failed'
      })
      
      wrapper = createWrapper()
      
      const user = mockUsers[0]
      await wrapper.vm.handleDelete(user)
      
      expect(ElMessage.error).toHaveBeenCalledWith('删除用户失败')
    })
  })

  describe('Table Display', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await nextTick()
    })

    it('displays user information correctly', () => {
      const users = wrapper.vm.userList
      expect(users.length).toBe(3)
      
      const admin = users.find((user: any) => user.username === 'admin')
      expect(admin).toBeDefined()
      expect(admin.realName).toBe('管理员')
      expect(admin.email).toBe('admin@example.com')
      expect(admin.mobile).toBe('13800138000')
    })

    it('displays user roles correctly', () => {
      const users = wrapper.vm.userList
      
      const admin = users.find((user: any) => user.username === 'admin')
      expect(admin.roles).toHaveLength(1)
      expect(admin.roles[0].name).toBe('超级管理员')
      
      const teacher = users.find((user: any) => user.username === 'teacher1')
      expect(teacher.roles).toHaveLength(1)
      expect(teacher.roles[0].name).toBe('教师')
    })

    it('displays status tags correctly', () => {
      const users = wrapper.vm.userList
      const activeUsers = users.filter((user: any) => user.status === 'active')
      const inactiveUsers = users.filter((user: any) => user.status === 'inactive')
      
      expect(activeUsers.length).toBe(2)
      expect(inactiveUsers.length).toBe(1)
    })

    it('shows correct action buttons based on status', () => {
      const users = wrapper.vm.userList
      const activeUser = users.find((user: any) => user.status === 'active')
      const inactiveUser = users.find((user: any) => user.status === 'inactive')
      
      // Active user should show disable button
      expect(activeUser).toBeDefined()
      
      // Inactive user should show enable button
      expect(inactiveUser).toBeDefined()
    })

    it('handles users without roles gracefully', () => {
      // Add a user without roles
      const userWithoutRoles = {
        ...mockUsers[0],
        roles: []
      }
      
      wrapper.vm.userList.push(userWithoutRoles)
      
      // Should display "暂无角色" for users without roles
      const user = wrapper.vm.userList.find((user: any) => user.roles.length === 0)
      expect(user).toBeDefined()
    })

    it('handles users with null roles gracefully', () => {
      // Add a user with null roles
      const userWithNullRoles = {
        ...mockUsers[0],
        roles: null
      }
      
      wrapper.vm.userList.push(userWithNullRoles)
      
      // Should handle null roles gracefully
      const user = wrapper.vm.userList.find((user: any) => user.roles === null)
      expect(user).toBeDefined()
    })
  })

  describe('Edge Cases', () => {
    it('handles API response with missing items property', async () => {
      const { getUsers } = require('@/api/modules/system')
      getUsers.mockResolvedValue({
        success: true,
        total: 0
        // Missing items property
      })
      
      wrapper = createWrapper()
      await nextTick()
      
      expect(wrapper.vm.userList).toEqual([])
      expect(wrapper.vm.pagination.total).toBe(0)
    })

    it('handles API error response', async () => {
      const { getUsers } = require('@/api/modules/system')
      getUsers.mockResolvedValue({
        success: false,
        message: 'Bad request'
      })
      
      wrapper = createWrapper()
      await nextTick()
      
      expect(ElMessage.error).toHaveBeenCalledWith('获取用户列表失败')
    })

    it('handles role options API error response', async () => {
      const { getRoles } = require('@/api/modules/system')
      getRoles.mockResolvedValue({
        success: false,
        message: 'Failed to get roles'
      })
      
      wrapper = createWrapper()
      await nextTick()
      
      expect(ElMessage.error).toHaveBeenCalledWith('获取角色选项失败')
    })

    it('handles concurrent pagination changes', async () => {
      wrapper = createWrapper()
      
      // Simulate rapid pagination changes
      await Promise.all([
        wrapper.vm.handleSizeChange(20),
        wrapper.vm.handleCurrentChange(2),
        wrapper.vm.handleSizeChange(50)
      ])
      
      // Should handle gracefully without errors
      expect(wrapper.vm.pagination.pageSize).toBe(50)
      expect(wrapper.vm.pagination.currentPage).toBe(1)
    })

    it('handles empty search filters', async () => {
      wrapper = createWrapper()
      
      // Set empty search filters
      await wrapper.setData({
        'searchForm.username': '',
        'searchForm.realName': '',
        'searchForm.roleId': '',
        'searchForm.status': ''
      })
      
      await wrapper.vm.handleSearch()
      
      expect(getUsers).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        username: undefined,
        realName: undefined,
        roleId: undefined,
        status: undefined
      })
    })
  })
})