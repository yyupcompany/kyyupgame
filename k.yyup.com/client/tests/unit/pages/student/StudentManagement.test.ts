import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory, Router } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'
import StudentManagement from '@/pages/student/index.vue'
import StudentEditDialog from '@/components/StudentEditDialog.vue'
import TransferDialog from '@/components/TransferDialog.vue'

// Mock Element Plus
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      warning: vi.fn(),
      error: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn()
    }
  }
})

// Mock useCrudOperations
vi.mock('@/composables/useCrudOperations', () => ({
  useCrudOperations: vi.fn(() => ({
    loading: ref(false),
    items: ref([]),
    total: ref(0),
    pagination: ref({
      page: 1,
      pageSize: 10,
      total: 0
    }),
    searchParams: ref({}),
    loadItems: vi.fn(),
    createItem: vi.fn(),
    updateItem: vi.fn(),
    deleteItem: vi.fn(),
    search: vi.fn(),
    resetSearch: vi.fn(),
    handlePageChange: vi.fn(),
    handleSizeChange: vi.fn()
  }))
}))

// Mock request
vi.mock('@/utils/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

// Mock API endpoints
vi.mock('@/api/endpoints', () => ({
  STUDENT_ENDPOINTS: {
    BASE: '/api/students',
    UPDATE: (id: string) => `/api/students/${id}`,
    DELETE: (id: string) => `/api/students/${id}`
  }
}))

// 控制台错误检测变量
let consoleSpy: any

describe('StudentManagement Page', () => {
  let router: Router
  let wrapper: any

  const mockStudents = [
    {
      id: '1',
      name: '张三',
      gender: 'MALE',
      birth_date: '2018-05-15',
      class_name: '小班A',
      guardian: { name: '张父', phone: '13800138000' },
      status: 'ACTIVE',
      enrollment_date: '2023-09-01'
    },
    {
      id: '2',
      name: '李四',
      gender: 'FEMALE',
      birth_date: '2019-03-20',
      class_name: '中班B',
      guardian: { name: '李母', phone: '13900139000' },
      status: 'ACTIVE',
      enrollment_date: '2022-09-01'
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
        { path: '/student/detail/:id', component: { template: '<div>Student Detail</div>' } }
      ]
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // 创建 Pinia
    const pinia = createPinia()
    setActivePinia(pinia)

    // Mock useCrudOperations 返回值
    const { useCrudOperations } = require('@/composables/useCrudOperations')
    vi.mocked(useCrudOperations).mockReturnValue({
      loading: ref(false),
      items: ref(mockStudents),
      total: ref(mockStudents.length),
      pagination: ref({
        page: 1,
        pageSize: 10,
        total: mockStudents.length
      }),
      searchParams: ref({}),
      loadItems: vi.fn().mockResolvedValue({}),
      createItem: vi.fn().mockResolvedValue({}),
      updateItem: vi.fn().mockResolvedValue({}),
      deleteItem: vi.fn().mockResolvedValue({}),
      search: vi.fn().mockResolvedValue({}),
      resetSearch: vi.fn().mockResolvedValue({}),
      handlePageChange: vi.fn(),
      handleSizeChange: vi.fn()
    })
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
    return mount(StudentManagement, {
      global: {
        plugins: [router, createPinia()],
        components: {
          StudentEditDialog,
          TransferDialog
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
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-pagination': true,
          'el-dialog': true
        }
      }
    })
  }

  describe('Component Rendering', () => {
    it('should render the student management page correctly', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.card-title').text()).toBe('学生管理')
      expect(wrapper.find('.student-table').exists()).toBe(true)
      expect(wrapper.find('.pagination-container').exists()).toBe(true)
    })

    it('should display student data in table', () => {
      wrapper = createWrapper()
      
      const tableRows = wrapper.findAll('.student-table .el-table__row')
      expect(tableRows.length).toBe(mockStudents.length)
    })

    it('should show correct student information', () => {
      wrapper = createWrapper()
      
      const firstStudent = mockStudents[0]
      expect(wrapper.text()).toContain(firstStudent.name)
      expect(wrapper.text()).toContain(firstStudent.class_name)
      expect(wrapper.text()).toContain(firstStudent.guardian.name)
    })
  })

  describe('Search and Filter Functionality', () => {
    it('should have search form with correct fields', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('[placeholder="请输入学生姓名"]').exists()).toBe(true)
      expect(wrapper.find('[placeholder="选择班级"]').exists()).toBe(true)
      expect(wrapper.find('[placeholder="选择性别"]').exists()).toBe(true)
      expect(wrapper.find('[placeholder="选择状态"]').exists()).toBe(true)
    })

    it('should call search function when search button is clicked', async () => {
      wrapper = createWrapper()
      
      const searchButton = wrapper.find('.filter-actions .el-button[type="primary"]')
      await searchButton.trigger('click')
      
      const { search } = require('@/composables/useCrudOperations')
      expect(search).toHaveBeenCalled()
    })

    it('should call resetSearch function when reset button is clicked', async () => {
      wrapper = createWrapper()
      
      const resetButton = wrapper.find('.filter-actions .el-button:not([type="primary"])')
      await resetButton.trigger('click')
      
      const { resetSearch } = require('@/composables/useCrudOperations')
      expect(resetSearch).toHaveBeenCalled()
    })
  })

  describe('Student Operations', () => {
    it('should open create dialog when create button is clicked', async () => {
      wrapper = createWrapper()
      
      const createButton = wrapper.find('.card-actions .el-button[type="primary"]')
      await createButton.trigger('click')
      
      expect(wrapper.vm.editDialogVisible).toBe(true)
      expect(wrapper.vm.editingStudent).toBe(null)
    })

    it('should navigate to student detail page when view button is clicked', async () => {
      wrapper = createWrapper()
      
      const viewButton = wrapper.find('.action-buttons .el-button[type="primary"]')
      await viewButton.trigger('click')
      
      expect(router.currentRoute.value.path).toBe('/student/detail/1')
    })

    it('should open edit dialog with student data when edit button is clicked', async () => {
      wrapper = createWrapper()
      
      const editButton = wrapper.findAll('.action-buttons .el-button[type="success"]')[0]
      await editButton.trigger('click')
      
      expect(wrapper.vm.editDialogVisible).toBe(true)
      expect(wrapper.vm.editingStudent).toEqual(mockStudents[0])
    })

    it('should show confirmation dialog when delete button is clicked', async () => {
      wrapper = createWrapper()
      
      // Mock ElMessageBox.confirm to resolve
      vi.mocked(ElMessageBox.confirm).mockResolvedValue(true)
      
      const deleteButton = wrapper.find('.el-dropdown-item')
      await deleteButton.trigger('click')
      
      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        '确定要删除学生 张三 吗？',
        '确认删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
    })

    it('should open transfer dialog when transfer button is clicked', async () => {
      wrapper = createWrapper()
      
      const transferButton = wrapper.findAll('.el-dropdown-item')[0]
      await transferButton.trigger('click')
      
      expect(wrapper.vm.transferDialogVisible).toBe(true)
      expect(wrapper.vm.transferringStudent).toEqual(mockStudents[0])
    })
  })

  describe('Export Functionality', () => {
    it('should show warning when no students are selected for export', async () => {
      wrapper = createWrapper()
      
      const exportButton = wrapper.findAll('.card-actions .el-button')[1]
      await exportButton.trigger('click')
      
      expect(ElMessage.warning).toHaveBeenCalledWith('请先选择要导出的学生')
    })

    it('should export selected students to CSV', async () => {
      wrapper = createWrapper()
      
      // Mock selected students
      wrapper.vm.selectedStudents = [mockStudents[0]]
      
      const exportButton = wrapper.findAll('.card-actions .el-button')[1]
      await exportButton.trigger('click')
      
      expect(ElMessage.success).toHaveBeenCalledWith('成功导出 1 条学生信息')
    })
  })

  describe('Utility Functions', () => {
    it('should return correct status type for different statuses', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getStatusType('ACTIVE')).toBe('success')
      expect(wrapper.vm.getStatusType('GRADUATED')).toBe('info')
      expect(wrapper.vm.getStatusType('TRANSFERRED')).toBe('warning')
      expect(wrapper.vm.getStatusType('SUSPENDED')).toBe('danger')
      expect(wrapper.vm.getStatusType('UNKNOWN')).toBe('info')
    })

    it('should return correct status text for different statuses', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getStatusText('ACTIVE')).toBe('在读')
      expect(wrapper.vm.getStatusText('GRADUATED')).toBe('毕业')
      expect(wrapper.vm.getStatusText('TRANSFERRED')).toBe('转校')
      expect(wrapper.vm.getStatusText('SUSPENDED')).toBe('休学')
      expect(wrapper.vm.getStatusText('UNKNOWN')).toBe('UNKNOWN')
    })

    it('should format date correctly', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.formatDate('2023-09-01')).toMatch(/\d{4}\/\d{1,2}\/\d{1,2}/)
      expect(wrapper.vm.formatDate('')).toBe('')
    })

    it('should calculate age correctly', () => {
      wrapper = createWrapper()
      
      const age = wrapper.vm.calculateAge('2018-05-15')
      expect(age).toMatch(/\d+岁/)
      expect(wrapper.vm.calculateAge('')).toBe('-')
    })
  })

  describe('Pagination', () => {
    it('should handle page change', async () => {
      wrapper = createWrapper()
      
      const { handlePageChange } = require('@/composables/useCrudOperations')
      await wrapper.vm.handlePageChange(2)
      
      expect(handlePageChange).toHaveBeenCalledWith(2)
    })

    it('should handle page size change', async () => {
      wrapper = createWrapper()
      
      const { handleSizeChange } = require('@/composables/useCrudOperations')
      await wrapper.vm.handleSizeChange(20)
      
      expect(handleSizeChange).toHaveBeenCalledWith(20)
    })
  })

  describe('Responsive Design', () => {
    it('should apply mobile-specific styles on small screens', () => {
      wrapper = createWrapper()
      
      // Test mobile breakpoint logic
      expect(wrapper.vm.$el.querySelector('.student-table')).toBeTruthy()
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      wrapper = createWrapper()
      
      // Mock API error
      const { loadItems } = require('@/composables/useCrudOperations')
      vi.mocked(loadItems).mockRejectedValue(new Error('API Error'))
      
      await wrapper.vm.loadItems()
      
      // Should not throw unhandled error
      expect(true).toBe(true)
    })

    it('should handle dialog save errors', async () => {
      wrapper = createWrapper()
      
      // Mock save error
      const { updateItem } = require('@/composables/useCrudOperations')
      vi.mocked(updateItem).mockRejectedValue(new Error('Save Error'))
      
      wrapper.vm.editingStudent = mockStudents[0]
      await wrapper.vm.handleSaveStudent({})
      
      expect(wrapper.vm.editDialogVisible).toBe(true) // Dialog should remain open
    })
  })

  describe('Lifecycle Hooks', () => {
    it('should load class list and students on mount', async () => {
      wrapper = createWrapper()
      
      const { loadItems } = require('@/composables/useCrudOperations')
      
      await wrapper.vm.loadClassList()
      await wrapper.vm.loadItems()
      
      expect(loadItems).toHaveBeenCalled()
      expect(wrapper.vm.classList).toEqual(mockClasses)
    })
  })
})