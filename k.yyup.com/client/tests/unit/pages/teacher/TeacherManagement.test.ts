
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

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory, Router } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'
import TeacherManagement from '@/pages/teacher/index.vue'
import TeacherEditDialog from '@/components/TeacherEditDialog.vue'
import ClassAssignDialog from '@/components/ClassAssignDialog.vue'
import PageHeader from '@/components/common/PageHeader.vue'

// Mock Element Plus
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn()
    }
  }
})

// Mock request utilities
vi.mock('@/utils/request', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))

// Mock API endpoints
vi.mock('@/api/endpoints', () => ({
  TEACHER_ENDPOINTS: {
    LIST: '/api/teachers',
    CREATE: '/api/teachers',
    UPDATE: (id: string) => `/api/teachers/${id}`,
    DELETE: (id: string) => `/api/teachers/${id}`,
    GET_CLASSES: (id: string) => `/api/teachers/${id}/classes`,
    ASSIGN_CLASSES: (id: string) => `/api/teachers/${id}/classes`,
    EXPORT: '/api/teachers/export'
  },
  CLASS_ENDPOINTS: {
    LIST: '/api/classes'
  }
}))

// Mock ErrorHandler
vi.mock('@/utils/errorHandler', () => ({
  ErrorHandler: {
    handle: vi.fn()
  }
}))

// 控制台错误检测变量
let consoleSpy: any

describe('TeacherManagement Page', () => {
  let router: Router
  let wrapper: any

  const mockTeachers = [
    {
      id: '1',
      employeeId: 'T001',
      name: '王老师',
      gender: 'FEMALE',
      position: 'HEAD_TEACHER',
      department: '教学部',
      type: 'FULL_TIME',
      phone: '13800138001',
      status: 'ACTIVE',
      hireDate: '2020-09-01',
      classNames: ['小班A']
    },
    {
      id: '2',
      employeeId: 'T002',
      name: '李老师',
      gender: 'MALE',
      position: 'REGULAR_TEACHER',
      department: '教学部',
      type: 'PART_TIME',
      phone: '13900139002',
      status: 'ACTIVE',
      hireDate: '2021-03-15',
      classNames: ['中班B']
    }
  ]

  const mockClasses = [
    { id: '1', name: '小班A' },
    { id: '2', name: '中班B' },
    { id: '3', name: '大班C' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    
    // 创建路由
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/teacher/detail/:id', component: { template: '<div>Teacher Detail</div>' } }
      ]
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // 创建 Pinia
    const pinia = createPinia()
    setActivePinia(pinia)

    // Mock successful API responses
    const { get, post, put, del } = require('@/utils/request')
    
    // Mock get requests
    vi.mocked(get).mockImplementation((url: string) => {
      if (url === '/api/teachers') {
        return Promise.resolve({
          success: true,
          data: {
            list: mockTeachers,
            total: mockTeachers.length
          }
        })
      } else if (url === '/api/classes') {
        return Promise.resolve({
          success: true,
          data: {
            list: mockClasses,
            total: mockClasses.length
          }
        })
      } else if (url.includes('/api/teachers/') && url.includes('/classes')) {
        return Promise.resolve({
          success: true,
          data: mockClasses.slice(0, 1)
        })
      }
      return Promise.resolve({ success: true, data: {} })
    })

    // Mock post requests
    vi.mocked(post).mockResolvedValue({ success: true })
    
    // Mock put requests
    vi.mocked(put).mockResolvedValue({ success: true })
    
    // Mock delete requests
    vi.mocked(del).mockResolvedValue({ success: true })

    // Mock ElMessageBox.confirm to resolve
    vi.mocked(ElMessageBox.confirm).mockResolvedValue(true)
  })

  afterEach(() => {
    if (wrapper) => {
      wrapper.unmount()
    }
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  const createWrapper = () => {
    return mount(TeacherManagement, {
      global: {
        plugins: [router, createPinia()],
        components: {
          TeacherEditDialog,
          ClassAssignDialog,
          PageHeader
        },
        stubs: {
          'el-icon': true,
          'el-button': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-table': true,
          'el-table-column': true,
          'el-tag': true,
          'el-pagination': true,
          'el-dialog': true
        }
      }
    })
  }

  describe('Component Rendering', () => {
    it('should render the teacher management page correctly', async () => {
      wrapper = createWrapper()
      
      // Wait for async operations
      await vi.waitFor(() => {
        expect(wrapper.find('h1').exists()).toBe(true)
      })
      
      expect(wrapper.find('.card-title').exists()).toBe(true)
      expect(wrapper.find('.table-card').exists()).toBe(true)
    })

    it('should display teacher data in table', async () => {
      wrapper = createWrapper()
      
      // Wait for data to load
      await vi.waitFor(() => {
        expect(wrapper.vm.items).toEqual(mockTeachers)
      })
      
      expect(wrapper.vm.items.length).toBe(mockTeachers.length)
    })

    it('should show correct teacher information', async () => {
      wrapper = createWrapper()
      
      await vi.waitFor(() => {
        expect(wrapper.vm.items.length).toBeGreaterThan(0)
      })
      
      const firstTeacher = mockTeachers[0]
      expect(wrapper.text()).toContain(firstTeacher.name)
      expect(wrapper.text()).toContain(firstTeacher.employeeId)
      expect(wrapper.text()).toContain(firstTeacher.department)
    })
  })

  describe('Search and Filter Functionality', () => {
    it('should have search form with correct fields', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('[placeholder="请输入教师姓名"]').exists()).toBe(true)
      expect(wrapper.find('[placeholder="选择类型"]').exists()).toBe(true)
      expect(wrapper.find('[placeholder="选择部门"]').exists()).toBe(true)
      expect(wrapper.find('[placeholder="选择状态"]').exists()).toBe(true)
    })

    it('should call search API when search button is clicked', async () => {
      wrapper = createWrapper()
      
      const { get } = require('@/utils/request')
      const searchButton = wrapper.find('.filter-actions .el-button[type="primary"]')
      await searchButton.trigger('click')
      
      expect(get).toHaveBeenCalledWith('/api/teachers', expect.objectContaining({
        page: 1,
        pageSize: 20,
        keyword: '',
        type: undefined,
        department: '',
        status: undefined
      }))
    })

    it('should reset search form when reset button is clicked', async () => {
      wrapper = createWrapper()
      
      // Set some search values
      await wrapper.setData({
        searchForm: {
          keyword: 'test',
          type: 'FULL_TIME',
          department: '教学部',
          status: 'ACTIVE'
        }
      })
      
      const resetButton = wrapper.find('.filter-actions .el-button:not([type="primary"])')
      await resetButton.trigger('click')
      
      expect(wrapper.vm.searchForm).toEqual({
        keyword: '',
        type: undefined,
        department: '',
        status: undefined
      })
    })
  })

  describe('Teacher Operations', () => {
    it('should open create dialog when create button is clicked', async () => {
      wrapper = createWrapper()
      
      const createButton = wrapper.find('.card-actions .el-button[type="primary"]')
      await createButton.trigger('click')
      
      expect(wrapper.vm.editDialogVisible).toBe(true)
      expect(wrapper.vm.editingTeacher).toBe(null)
    })

    it('should navigate to teacher detail page when view button is clicked', async () => {
      wrapper = createWrapper()
      
      await vi.waitFor(() => {
        expect(wrapper.vm.items.length).toBeGreaterThan(0)
      })
      
      const viewButton = wrapper.findAll('.el-button[type="primary"]')[2] // View button
      await viewButton.trigger('click')
      
      expect(router.currentRoute.value.path).toBe('/teacher/detail/1')
    })

    it('should open edit dialog with teacher data when edit button is clicked', async () => {
      wrapper = createWrapper()
      
      await vi.waitFor(() => {
        expect(wrapper.vm.items.length).toBeGreaterThan(0)
      })
      
      const editButton = wrapper.findAll('.el-button[type="primary"]')[3] // Edit button
      await editButton.trigger('click')
      
      expect(wrapper.vm.editDialogVisible).toBe(true)
      expect(wrapper.vm.editingTeacher).toEqual(mockTeachers[0])
    })

    it('should show confirmation dialog when delete button is clicked', async () => {
      wrapper = createWrapper()
      
      await vi.waitFor(() => {
        expect(wrapper.vm.items.length).toBeGreaterThan(0)
      })
      
      const deleteButton = wrapper.findAll('.el-button[type="danger"]')[0]
      await deleteButton.trigger('click')
      
      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        '确定要删除教师 王老师 吗？',
        '确认删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
    })

    it('should open class assignment dialog when assign button is clicked', async () => {
      wrapper = createWrapper()
      
      await vi.waitFor(() => {
        expect(wrapper.vm.items.length).toBeGreaterThan(0)
      })
      
      const assignButton = wrapper.findAll('.el-button[type="warning"]')[0]
      await assignButton.trigger('click')
      
      expect(wrapper.vm.assignDialogVisible).toBe(true)
      expect(wrapper.vm.assigningTeacher).not.toBeNull()
    })
  })

  describe('Export Functionality', () => {
    it('should call export API when export button is clicked', async () => {
      wrapper = createWrapper()
      
      const { post } = require('@/utils/request')
      const exportButton = wrapper.findAll('.card-actions .el-button')[1]
      await exportButton.trigger('click')
      
      expect(post).toHaveBeenCalledWith('/api/teachers/export', expect.objectContaining({
        format: 'excel'
      }))
    })

    it('should show loading state during export', async () => {
      wrapper = createWrapper()
      
      const exportButton = wrapper.findAll('.card-actions .el-button')[1]
      
      // Start export
      await exportButton.trigger('click')
      expect(wrapper.vm.exporting).toBe(true)
      
      // Export completes (mocked)
      await vi.waitFor(() => {
        expect(wrapper.vm.exporting).toBe(false)
      })
    })
  })

  describe('Data Refresh', () => {
    it('should refresh data when refresh button is clicked', async () => {
      wrapper = createWrapper()
      
      const { get } = require('@/utils/request')
      const refreshButton = wrapper.findAll('.card-actions .el-button')[2]
      await refreshButton.trigger('click')
      
      expect(get).toHaveBeenCalledWith('/api/teachers', expect.any(Object))
      expect(get).toHaveBeenCalledWith('/api/classes')
      expect(ElMessage.success).toHaveBeenCalledWith('数据刷新成功')
    })
  })

  describe('Utility Functions', () => {
    it('should return correct status type for different statuses', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getStatusType('ACTIVE')).toBe('success')
      expect(wrapper.vm.getStatusType('ON_LEAVE')).toBe('warning')
      expect(wrapper.vm.getStatusType('RESIGNED')).toBe('danger')
      expect(wrapper.vm.getStatusType('PROBATION')).toBe('info')
    })

    it('should return correct status text for different statuses', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getStatusText('ACTIVE')).toBe('在职')
      expect(wrapper.vm.getStatusText('ON_LEAVE')).toBe('请假中')
      expect(wrapper.vm.getStatusText('RESIGNED')).toBe('离职')
      expect(wrapper.vm.getStatusText('PROBATION')).toBe('见习期')
    })

    it('should return correct type tag type for different teacher types', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getTypeTagType('FULL_TIME')).toBe('success')
      expect(wrapper.vm.getTypeTagType('PART_TIME')).toBe('warning')
      expect(wrapper.vm.getTypeTagType('CONTRACT')).toBe('info')
      expect(wrapper.vm.getTypeTagType('INTERN')).toBe('primary')
    })

    it('should return correct type text for different teacher types', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getTypeText('FULL_TIME')).toBe('全职')
      expect(wrapper.vm.getTypeText('PART_TIME')).toBe('兼职')
      expect(wrapper.vm.getTypeText('CONTRACT')).toBe('合同工')
      expect(wrapper.vm.getTypeText('INTERN')).toBe('实习生')
    })

    it('should return correct position text for different positions', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getPositionText('PRINCIPAL')).toBe('园长')
      expect(wrapper.vm.getPositionText('VICE_PRINCIPAL')).toBe('副园长')
      expect(wrapper.vm.getPositionText('HEAD_TEACHER')).toBe('班主任')
      expect(wrapper.vm.getPositionText('REGULAR_TEACHER')).toBe('普通教师')
    })

    it('should format date correctly', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.formatDate('2020-09-01')).toMatch(/\d{4}\/\d{1,2}\/\d{1,2}/)
      expect(wrapper.vm.formatDate('')).toBe('')
    })
  })

  describe('Pagination', () => {
    it('should handle page change', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.handlePageChange(2)
      expect(wrapper.vm.pagination.page).toBe(2)
    })

    it('should handle page size change', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.handleSizeChange(50)
      expect(wrapper.vm.pagination.pageSize).toBe(50)
      expect(wrapper.vm.pagination.page).toBe(1)
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      wrapper = createWrapper()
      
      // Mock API error
      const { get } = require('@/utils/request')
      vi.mocked(get).mockRejectedValueOnce(new Error('API Error'))
      
      const { ErrorHandler } = require('@/utils/errorHandler')
      
      await wrapper.vm.loadTeachers()
      
      expect(ErrorHandler.handle).toHaveBeenCalledWith(expect.any(Error), true)
    })

    it('should handle delete cancellation', async () => {
      wrapper = createWrapper()
      
      // Mock ElMessageBox.confirm to reject (user cancels)
      vi.mocked(ElMessageBox.confirm).mockRejectedValueOnce('cancel')
      
      await vi.waitFor(() => {
        expect(wrapper.vm.items.length).toBeGreaterThan(0)
      })
      
      const deleteButton = wrapper.findAll('.el-button[type="danger"]')[0]
      await deleteButton.trigger('click')
      
      // Should not call delete API
      const { del } = require('@/utils/request')
      expect(del).not.toHaveBeenCalled()
    })
  })

  describe('Lifecycle Hooks', () => {
    it('should load teachers and classes on mount', async () => {
      wrapper = createWrapper()
      
      const { get } = require('@/utils/request')
      
      // Wait for mounted hook to complete
      await vi.waitFor(() => {
        expect(get).toHaveBeenCalledWith('/api/teachers', expect.any(Object))
        expect(get).toHaveBeenCalledWith('/api/classes')
      })
    })
  })

  describe('Form Validation', () => {
    it('should validate teacher ID before navigation', async () => {
      wrapper = createWrapper()
      
      // Test with invalid teacher ID
      const invalidTeacher = { ...mockTeachers[0], id: 'undefined' }
      await wrapper.vm.viewTeacherDetail(invalidTeacher)
      
      expect(ElMessage.error).toHaveBeenCalledWith('教师ID无效，无法查看详情')
      expect(router.currentRoute.value.path).toBe('/')
    })
  })

  describe('Table Selection', () => {
    it('should handle table selection changes', async () => {
      wrapper = createWrapper()
      
      await vi.waitFor(() => {
        expect(wrapper.vm.items.length).toBeGreaterThan(0)
      })
      
      const selectedTeachers = [mockTeachers[0]]
      await wrapper.vm.handleSelectionChange(selectedTeachers)
      
      expect(wrapper.vm.selectedTeachers).toEqual(selectedTeachers)
    })
  })
})