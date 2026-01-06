
vi.mock('@/utils/request', () => ({
  default: vi.fn(),
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))

vi.mock('../utils/request', () => ({
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))


vi.mock('@/utils/request', () => ({
  default: vi.fn(),
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))

vi.mock('../utils/request', () => ({
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))


vi.mock('@/utils/request', () => ({
  default: vi.fn(),
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))

vi.mock('../utils/request', () => ({
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
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

describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ElementPlus from 'element-plus'
import RoleList from '@/components/system/RoleList.vue'

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

// Mock API endpoints
vi.mock('@/utils/request', () => ({
  request: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

vi.mock('@/api/endpoints', () => ({
  SYSTEM_ENDPOINTS: {
    ROLES: '/api/roles',
    ROLE_STATUS: (id: string) => `/api/roles/${id}/status`,
    ROLE_DELETE: (id: string) => `/api/roles/${id}`
  }
}))

describe('RoleList.vue', () => {
  let wrapper: any

  const mockRoles = [
    {
      id: '1',
      name: '超级管理员',
      description: '系统最高权限',
      status: 'active',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: '普通管理员',
      description: '系统管理权限',
      status: 'active',
      createdAt: '2023-01-02T00:00:00Z',
      updatedAt: '2023-01-02T00:00:00Z'
    },
    {
      id: '3',
      name: '教师',
      description: '教师角色',
      status: 'inactive',
      createdAt: '2023-01-03T00:00:00Z',
      updatedAt: '2023-01-03T00:00:00Z'
    }
  ]

  const createWrapper = () => {
    return mount(RoleList, {
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
    
    // Mock successful API response
    const { request } = require('@/utils/request')
    request.get.mockResolvedValue({
      code: 200,
      success: true,
      data: mockRoles
    })
    request.put.mockResolvedValue({
      code: 200,
      success: true
    })
    request.delete.mockResolvedValue({
      code: 200,
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

    it('renders role list table', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.app-card-header').exists()).toBe(true)
      expect(wrapper.vm.roleList).toBeDefined()
    })

    it('renders pagination component', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.pagination-container').exists()).toBe(true)
    })
  })

  describe('Data Loading', () => {
    it('loads role list on mount', async () => {
      wrapper = createWrapper()
      
      // Wait for component to mount
      await nextTick()
      
      expect(request.get).toHaveBeenCalledWith('/api/roles', {
        params: {
          page: 1,
          pageSize: 10,
          name: undefined,
          status: undefined
        }
      })
    })

    it('handles successful data loading', async () => {
      wrapper = createWrapper()
      await nextTick()
      
      expect(wrapper.vm.roleList).toEqual(mockRoles)
      expect(wrapper.vm.pagination.total).toBe(mockRoles.length)
    })

    it('handles API errors gracefully', async () => {
      const { request } = require('@/utils/request')
      request.get.mockRejectedValue(new Error('Network error'))
      
      wrapper = createWrapper()
      await nextTick()
      
      expect(wrapper.vm.roleList).toEqual([])
      expect(wrapper.vm.pagination.total).toBe(0)
      expect(ElMessage.error).toHaveBeenCalledWith('加载角色列表失败')
    })

    it('handles paginated response format', async () => {
      const { request } = require('@/utils/request')
      request.get.mockResolvedValue({
        code: 200,
        success: true,
        data: {
          items: mockRoles,
          total: mockRoles.length
        }
      })
      
      wrapper = createWrapper()
      await nextTick()
      
      expect(wrapper.vm.roleList).toEqual(mockRoles)
      expect(wrapper.vm.pagination.total).toBe(mockRoles.length)
    })
  })

  describe('Search Functionality', () => {
    it('handles search with name filter', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ 'searchForm.name': '管理员' })
      await wrapper.vm.handleSearch()
      
      expect(request.get).toHaveBeenCalledWith('/api/roles', {
        params: {
          page: 1,
          pageSize: 10,
          name: '管理员',
          status: undefined
        }
      })
    })

    it('handles search with status filter', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ 'searchForm.status': 'active' })
      await wrapper.vm.handleSearch()
      
      expect(request.get).toHaveBeenCalledWith('/api/roles', {
        params: {
          page: 1,
          pageSize: 10,
          name: undefined,
          status: 'active'
        }
      })
    })

    it('resets search form correctly', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({
        'searchForm.name': '测试',
        'searchForm.status': 'active'
      })
      
      await wrapper.vm.resetSearch()
      
      expect(wrapper.vm.searchForm.name).toBe('')
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
      
      expect(request.get).toHaveBeenCalledTimes(2) // Initial load + page size change
      
      // Change current page
      await wrapper.vm.handleCurrentChange(2)
      
      expect(request.get).toHaveBeenCalledTimes(3) // + page change
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
      
      const role = mockRoles[0]
      await wrapper.vm.handleEdit(role)
      
      expect(wrapper.emitted('edit')).toBeTruthy()
      expect(wrapper.emitted('edit')[0]).toEqual([role])
    })

    it('emits permission event when permission button is clicked', async () => {
      wrapper = createWrapper()
      
      const role = mockRoles[0]
      await wrapper.vm.handlePermission(role)
      
      expect(wrapper.emitted('permission')).toBeTruthy()
      expect(wrapper.emitted('permission')[0]).toEqual([role])
    })
  })

  describe('Status Management', () => {
    it('changes role status to inactive', async () => {
      wrapper = createWrapper()
      
      const role = mockRoles[0]
      await wrapper.vm.handleStatusChange(role, 'inactive')
      
      expect(request.put).toHaveBeenCalledWith('/api/roles/1/status', {
        status: 'inactive'
      })
      expect(ElMessage.success).toHaveBeenCalledWith('角色禁用成功')
    })

    it('changes role status to active', async () => {
      wrapper = createWrapper()
      
      const role = mockRoles[2] // inactive role
      await wrapper.vm.handleStatusChange(role, 'active')
      
      expect(request.put).toHaveBeenCalledWith('/api/roles/3/status', {
        status: 'active'
      })
      expect(ElMessage.success).toHaveBeenCalledWith('角色启用成功')
    })

    it('handles status change errors', async () => {
      const { request } = require('@/utils/request')
      request.put.mockRejectedValue(new Error('Network error'))
      
      wrapper = createWrapper()
      
      const role = mockRoles[0]
      await wrapper.vm.handleStatusChange(role, 'inactive')
      
      expect(ElMessage.error).toHaveBeenCalledWith('角色禁用失败')
    })
  })

  describe('Role Deletion', () => {
    it('shows confirmation dialog before deletion', async () => {
      wrapper = createWrapper()
      
      const role = mockRoles[0]
      await wrapper.vm.handleDelete(role)
      
      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        `确定要删除角色"${role.name}"吗？删除后不可恢复。`,
        '删除确认',
        {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
    })

    it('deletes role when confirmed', async () => {
      ElMessageBox.confirm.mockResolvedValue(true)
      
      wrapper = createWrapper()
      
      const role = mockRoles[0]
      await wrapper.vm.handleDelete(role)
      
      expect(request.delete).toHaveBeenCalledWith('/api/roles/1')
      expect(ElMessage.success).toHaveBeenCalledWith('角色删除成功')
    })

    it('does not delete role when cancelled', async () => {
      ElMessageBox.confirm.mockRejectedValue(new Error('cancelled'))
      
      wrapper = createWrapper()
      
      const role = mockRoles[0]
      await wrapper.vm.handleDelete(role)
      
      expect(request.delete).not.toHaveBeenCalled()
    })

    it('handles deletion errors', async () => {
      ElMessageBox.confirm.mockResolvedValue(true)
      const { request } = require('@/utils/request')
      request.delete.mockRejectedValue(new Error('Network error'))
      
      wrapper = createWrapper()
      
      const role = mockRoles[0]
      await wrapper.vm.handleDelete(role)
      
      expect(ElMessage.error).toHaveBeenCalledWith('删除角色失败')
    })
  })

  describe('Table Display', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await nextTick()
    })

    it('displays role names correctly', () => {
      const roleNames = wrapper.vm.roleList.map((role: any) => role.name)
      expect(roleNames).toContain('超级管理员')
      expect(roleNames).toContain('普通管理员')
      expect(roleNames).toContain('教师')
    })

    it('displays status tags correctly', () => {
      const activeRoles = wrapper.vm.roleList.filter((role: any) => role.status === 'active')
      const inactiveRoles = wrapper.vm.roleList.filter((role: any) => role.status === 'inactive')
      
      expect(activeRoles.length).toBe(2)
      expect(inactiveRoles.length).toBe(1)
    })

    it('shows correct action buttons based on status', () => {
      const activeRole = wrapper.vm.roleList.find((role: any) => role.status === 'active')
      const inactiveRole = wrapper.vm.roleList.find((role: any) => role.status === 'inactive')
      
      // Active role should show disable button
      expect(activeRole).toBeDefined()
      
      // Inactive role should show enable button
      expect(inactiveRole).toBeDefined()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty API response', async () => {
      const { request } = require('@/utils/request')
      request.get.mockResolvedValue({
        code: 200,
        success: true,
        data: []
      })
      
      wrapper = createWrapper()
      await nextTick()
      
      expect(wrapper.vm.roleList).toEqual([])
      expect(wrapper.vm.pagination.total).toBe(0)
    })

    it('handles API response with missing data', async () => {
      const { request } = require('@/utils/request')
      request.get.mockResolvedValue({
        code: 200,
        success: true
        // Missing data property
      })
      
      wrapper = createWrapper()
      await nextTick()
      
      expect(wrapper.vm.roleList).toEqual([])
      expect(wrapper.vm.pagination.total).toBe(0)
    })

    it('handles API error response', async () => {
      const { request } = require('@/utils/request')
      request.get.mockResolvedValue({
        code: 400,
        success: false,
        message: 'Bad request'
      })
      
      wrapper = createWrapper()
      await nextTick()
      
      expect(ElMessage.error).toHaveBeenCalledWith('获取角色列表失败')
    })
  })
})