
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
import { ElMessage, ElMessageBox, ElForm } from 'element-plus'
import EnrollmentManagement from '@/pages/enrollment/index.vue'
import EmptyState from '@/components/common/EmptyState.vue'

// Mock Element Plus
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn()
    },
    ElForm: {
      validate: vi.fn()
    }
  }
})

// Mock request utility
vi.mock('@/utils/request', () => ({
  request: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

// Mock API endpoints
vi.mock('@/api/endpoints', () => ({
  ENROLLMENT_APPLICATION_ENDPOINTS: {
    BASE: '/api/enrollment/applications',
    CREATE: '/api/enrollment/applications',
    UPDATE: (id: string) => `/api/enrollment/applications/${id}`,
    DELETE: (id: string) => `/api/enrollment/applications/${id}`,
    REVIEW: (id: string) => `/api/enrollment/applications/${id}/review`,
    BATCH_APPROVE: '/api/enrollment/applications/batch-approve',
    BATCH_REJECT: '/api/enrollment/applications/batch-reject'
  },
  ENROLLMENT_ENDPOINTS: {
    STATISTICS: '/api/enrollment/statistics',
    FOLLOW_UP: '/api/enrollment/follow-up'
  }
}))

// Mock date format utility
vi.mock('@/utils/dateFormat', () => ({
  formatDateTime: vi.fn((date) => date ? new Date(date).toLocaleDateString() : '')
}))

// 控制台错误检测变量
let consoleSpy: any

describe('EnrollmentManagement Page', () => {
  let router: Router
  let wrapper: any

  const mockEnrollments = [
    {
      id: '1',
      studentName: '小明',
      gender: 'male',
      age: 4,
      ageGroup: 'small',
      parentName: '小明爸爸',
      parentPhone: '13800138001',
      status: 'consulting',
      source: 'online',
      consultant: '张老师',
      intendedClass: 'small_a',
      address: '北京市朝阳区',
      remarks: '意向强烈',
      createTime: '2023-09-01T10:00:00Z'
    },
    {
      id: '2',
      studentName: '小红',
      gender: 'female',
      age: 5,
      ageGroup: 'medium',
      parentName: '小红妈妈',
      parentPhone: '13900139002',
      status: 'trial',
      source: 'referral',
      consultant: '李老师',
      intendedClass: 'medium_a',
      address: '北京市海淀区',
      remarks: '已安排试听',
      createTime: '2023-09-02T14:30:00Z'
    }
  ]

  const mockStats = {
    totalApplications: 150,
    approvedApplications: 80,
    pendingApplications: 45,
    rejectedApplications: 25
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // 创建路由
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/enrollment/:id', component: { template: '<div>Enrollment Detail</div>' } }
      ]
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // 创建 Pinia
    const pinia = createPinia()
    setActivePinia(pinia)

    // Mock successful API responses
    const { request } = require('@/utils/request')
    
    // Mock get requests
    vi.mocked(request.get).mockImplementation((url: string, params?: any) => {
      if (url === '/api/enrollment/statistics') {
        return Promise.resolve({
          success: true,
          data: mockStats
        })
      } else if (url === '/api/enrollment/applications') {
        return Promise.resolve({
          success: true,
          data: {
            items: mockEnrollments,
            total: mockEnrollments.length
          }
        })
      }
      return Promise.resolve({ success: true, data: {} })
    })

    // Mock post requests
    vi.mocked(request.post).mockResolvedValue({ success: true })
    
    // Mock put requests
    vi.mocked(request.put).mockResolvedValue({ success: true })
    
    // Mock delete requests
    vi.mocked(request.delete).mockResolvedValue({ success: true })

    // Mock ElMessageBox.confirm to resolve
    vi.mocked(ElMessageBox.confirm).mockResolvedValue(true)
    
    // Mock ElForm.validate to resolve
    vi.mocked(ElForm.prototype.validate).mockResolvedValue(true)
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
    return mount(EnrollmentManagement, {
      global: {
        plugins: [router, createPinia()],
        components: {
          EmptyState
        },
        stubs: {
          'el-icon': true,
          'el-button': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-input-number': true,
          'el-select': true,
          'el-option': true,
          'el-radio-group': true,
          'el-radio': true,
          'el-table': true,
          'el-table-column': true,
          'el-tag': true,
          'el-row': true,
          'el-col': true,
          'el-card': true,
          'el-dialog': true,
          'el-date-picker': true,
          'el-pagination': true,
          'el-skeleton': true,
          'el-skeleton-item': true
        }
      }
    })
  }

  describe('Component Rendering', () => {
    it('should render the enrollment management page correctly', async () => {
      wrapper = createWrapper()
      
      // Wait for async operations
      await vi.waitFor(() => {
        expect(wrapper.find('.page-title').text()).toBe('招生管理')
      })
      
      expect(wrapper.find('.stats-section').exists()).toBe(true)
      expect(wrapper.find('.search-section').exists()).toBe(true)
      expect(wrapper.find('.table-section').exists()).toBe(true)
    })

    it('should display statistics cards', async () => {
      wrapper = createWrapper()
      
      await vi.waitFor(() => {
        expect(wrapper.vm.statCards[0].value).toBe('150')
        expect(wrapper.vm.statCards[1].value).toBe('080')
        expect(wrapper.vm.statCards[2].value).toBe('045')
        expect(wrapper.vm.statCards[3].value).toBe('53%')
      })
    })

    it('should display enrollment data in table', async () => {
      wrapper = createWrapper()
      
      await vi.waitFor(() => {
        expect(wrapper.vm.enrollmentList.length).toBe(mockEnrollments.length)
      })
      
      expect(wrapper.vm.enrollmentList[0].studentName).toBe('小明')
      expect(wrapper.vm.enrollmentList[1].studentName).toBe('小红')
    })
  })

  describe('Search and Filter Functionality', () => {
    it('should have search form with correct fields', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('[placeholder="请输入学生姓名"]').exists()).toBe(true)
      expect(wrapper.find('[placeholder="请输入家长姓名"]').exists()).toBe(true)
      expect(wrapper.find('[placeholder="请选择状态"]').exists()).toBe(true)
      expect(wrapper.find('[placeholder="请选择年龄段"]').exists()).toBe(true)
    })

    it('should call search API when search button is clicked', async () => {
      wrapper = createWrapper()
      
      const { request } = require('@/utils/request')
      const searchButton = wrapper.find('.el-form .el-button[type="primary"]')
      await searchButton.trigger('click')
      
      expect(request.get).toHaveBeenCalledWith('/api/enrollment/applications', expect.objectContaining({
        page: 1,
        pageSize: 20,
        studentName: '',
        status: undefined
      }))
    })

    it('should reset search form when reset button is clicked', async () => {
      wrapper = createWrapper()
      
      // Set some search values
      await wrapper.setData({
        searchForm: {
          studentName: 'test',
          parentName: 'parent',
          status: 'consulting',
          ageGroup: 'small',
          dateRange: ['2023-09-01', '2023-09-30']
        }
      })
      
      const resetButton = wrapper.findAll('.el-form .el-button').find(btn => 
        btn.text() === '重置'
      )
      await resetButton.trigger('click')
      
      expect(wrapper.vm.searchForm).toEqual({
        studentName: '',
        parentName: '',
        status: '',
        ageGroup: '',
        dateRange: []
      })
    })
  })

  describe('Enrollment Operations', () => {
    it('should open create dialog when create button is clicked', async () => {
      wrapper = createWrapper()
      
      const createButton = wrapper.find('.page-actions .el-button[type="primary"]')
      await createButton.trigger('click')
      
      expect(wrapper.vm.dialogVisible).toBe(true)
      expect(wrapper.vm.dialogTitle).toBe('新增招生信息')
      expect(wrapper.vm.isEdit).toBe(false)
    })

    it('should navigate to enrollment detail page when view button is clicked', async () => {
      wrapper = createWrapper()
      
      await vi.waitFor(() => {
        expect(wrapper.vm.enrollmentList.length).toBeGreaterThan(0)
      })
      
      const viewButton = wrapper.findAll('.action-buttons .el-button[type="primary"]')[0]
      await viewButton.trigger('click')
      
      expect(router.currentRoute.value.path).toBe('/enrollment/1')
    })

    it('should open edit dialog with enrollment data when edit button is clicked', async () => {
      wrapper = createWrapper()
      
      await vi.waitFor(() => {
        expect(wrapper.vm.enrollmentList.length).toBeGreaterThan(0)
      })
      
      const editButton = wrapper.findAll('.action-buttons .el-button[type="warning"]')[0]
      await editButton.trigger('click')
      
      expect(wrapper.vm.dialogVisible).toBe(true)
      expect(wrapper.vm.dialogTitle).toBe('编辑招生信息')
      expect(wrapper.vm.isEdit).toBe(true)
      expect(wrapper.vm.formData.studentName).toBe('小明')
    })

    it('should open follow dialog when follow button is clicked', async () => {
      wrapper = createWrapper()
      
      await vi.waitFor(() => {
        expect(wrapper.vm.enrollmentList.length).toBeGreaterThan(0)
      })
      
      const followButton = wrapper.findAll('.action-buttons .el-button[type="info"]')[0]
      await followButton.trigger('click')
      
      expect(wrapper.vm.followDialogVisible).toBe(true)
    })

    it('should show confirmation dialog when delete button is clicked', async () => {
      wrapper = createWrapper()
      
      await vi.waitFor(() => {
        expect(wrapper.vm.enrollmentList.length).toBeGreaterThan(0)
      })
      
      const deleteButton = wrapper.findAll('.action-buttons .el-button[type="danger"]')[1]
      await deleteButton.trigger('click')
      
      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        '确定要删除这条招生信息吗？',
        '确认删除',
        {
          type: 'warning'
        }
      )
    })
  })

  describe('Batch Operations', () => {
    it('should show warning when no rows selected for batch approve', async () => {
      wrapper = createWrapper()
      
      const batchApproveButton = wrapper.findAll('.page-actions .el-button[type="success"]')[0]
      await batchApproveButton.trigger('click')
      
      expect(ElMessage.warning).toHaveBeenCalledWith('请选择要审核的申请')
    })

    it('should show confirmation dialog for batch approve with selected rows', async () => {
      wrapper = createWrapper()
      
      // Select some rows
      await wrapper.setData({
        selectedRows: [mockEnrollments[0]]
      })
      
      const batchApproveButton = wrapper.findAll('.page-actions .el-button[type="success"]')[0]
      await batchApproveButton.trigger('click')
      
      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        '确定要批量通过这 1 个申请吗？',
        '确认操作',
        {
          type: 'warning'
        }
      )
    })

    it('should show warning when no rows selected for batch reject', async () => {
      wrapper = createWrapper()
      
      const batchRejectButton = wrapper.findAll('.page-actions .el-button[type="warning"]')[1]
      await batchRejectButton.trigger('click')
      
      expect(ElMessage.warning).toHaveBeenCalledWith('请选择要拒绝的申请')
    })
  })

  describe('Approval Operations', () => {
    it('should approve single application', async () => {
      wrapper = createWrapper()
      
      await vi.waitFor(() => {
        expect(wrapper.vm.enrollmentList.length).toBeGreaterThan(0)
      })
      
      const approveButton = wrapper.findAll('.action-buttons .el-button[type="success"]')[1]
      await approveButton.trigger('click')
      
      const { request } = require('@/utils/request')
      expect(request.put).toHaveBeenCalledWith('/api/enrollment/applications/1/review', {
        status: 'APPROVED',
        notes: '申请已通过审核'
      })
    })

    it('should reject single application', async () => {
      wrapper = createWrapper()
      
      await vi.waitFor(() => {
        expect(wrapper.vm.enrollmentList.length).toBeGreaterThan(0)
      })
      
      const rejectButton = wrapper.findAll('.action-buttons .el-button[type="danger"]')[0]
      await rejectButton.trigger('click')
      
      const { request } = require('@/utils/request')
      expect(request.put).toHaveBeenCalledWith('/api/enrollment/applications/1/review', {
        status: 'REJECTED',
        notes: '申请已被拒绝'
      })
    })
  })

  describe('Form Operations', () => {
    it('should submit create form successfully', async () => {
      wrapper = createWrapper()
      
      // Open create dialog
      await wrapper.vm.handleCreateEnrollment()
      
      // Fill form data
      await wrapper.setData({
        formData: {
          studentName: '测试学生',
          gender: 'male',
          age: 4,
          ageGroup: 'small',
          parentName: '测试家长',
          parentPhone: '13800138000',
          status: 'consulting',
          source: 'online',
          consultant: 'teacher_zhang',
          intendedClass: 'small_a',
          address: '测试地址',
          remarks: '测试备注'
        }
      })
      
      // Submit form
      await wrapper.vm.handleSubmit()
      
      const { request } = require('@/utils/request')
      expect(request.post).toHaveBeenCalledWith('/api/enrollment/applications', {
        studentName: '测试学生',
        parentName: '测试家长',
        parentPhone: '13800138000',
        age: 4,
        gender: 'male',
        preferredClassId: 'small_a',
        notes: '测试备注'
      })
    })

    it('should submit edit form successfully', async () => {
      wrapper = createWrapper()
      
      // Open edit dialog
      await wrapper.vm.handleEdit(mockEnrollments[0])
      
      // Submit form
      await wrapper.vm.handleSubmit()
      
      const { request } = require('@/utils/request')
      expect(request.put).toHaveBeenCalledWith('/api/enrollment/applications/1', {
        studentName: '小明',
        parentName: '小明爸爸',
        parentPhone: '13800138001',
        age: 4,
        gender: 'male',
        preferredClassId: 'small_a',
        notes: '意向强烈'
      })
    })

    it('should submit follow form successfully', async () => {
      wrapper = createWrapper()
      
      // Open follow dialog
      await wrapper.vm.handleFollow(mockEnrollments[0])
      
      // Fill follow form data
      await wrapper.setData({
        followFormData: {
          type: 'phone',
          content: '电话跟进测试',
          nextFollowTime: '2023-09-10T10:00:00Z'
        }
      })
      
      // Submit follow form
      await wrapper.vm.handleFollowSubmit()
      
      const { request } = require('@/utils/request')
      expect(request.post).toHaveBeenCalledWith('/api/enrollment/follow-up', {
        type: 'phone',
        content: '电话跟进测试',
        nextFollowTime: '2023-09-10T10:00:00Z'
      })
    })
  })

  describe('Pagination', () => {
    it('should handle page size change', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.handleSizeChange(50)
      expect(wrapper.vm.pagination.pageSize).toBe(50)
      expect(wrapper.vm.pagination.currentPage).toBe(1)
    })

    it('should handle current page change', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.handleCurrentChange(2)
      expect(wrapper.vm.pagination.currentPage).toBe(2)
    })
  })

  describe('Utility Functions', () => {
    it('should return correct status tag type for different statuses', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getStatusTagType('PENDING')).toBe('warning')
      expect(wrapper.vm.getStatusTagType('APPROVED')).toBe('success')
      expect(wrapper.vm.getStatusTagType('REJECTED')).toBe('danger')
      expect(wrapper.vm.getStatusTagType('consulting')).toBe('primary')
      expect(wrapper.vm.getStatusTagType('trial')).toBe('warning')
      expect(wrapper.vm.getStatusTagType('enrolled')).toBe('success')
    })

    it('should return correct status text for different statuses', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getStatusText('PENDING')).toBe('待审核')
      expect(wrapper.vm.getStatusText('APPROVED')).toBe('已通过')
      expect(wrapper.vm.getStatusText('REJECTED')).toBe('已拒绝')
      expect(wrapper.vm.getStatusText('consulting')).toBe('咨询中')
      expect(wrapper.vm.getStatusText('trial')).toBe('试听中')
      expect(wrapper.vm.getStatusText('enrolled')).toBe('已报名')
    })

    it('should return correct age group tag type for different age groups', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getAgeGroupTagType('small')).toBe('primary')
      expect(wrapper.vm.getAgeGroupTagType('medium')).toBe('success')
      expect(wrapper.vm.getAgeGroupTagType('large')).toBe('warning')
      expect(wrapper.vm.getAgeGroupTagType('preschool')).toBe('danger')
    })

    it('should return correct age group text for different age groups', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getAgeGroupText('small')).toBe('小班')
      expect(wrapper.vm.getAgeGroupText('medium')).toBe('中班')
      expect(wrapper.vm.getAgeGroupText('large')).toBe('大班')
      expect(wrapper.vm.getAgeGroupText('preschool')).toBe('学前班')
    })

    it('should get age group from age correctly', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getAgeGroupFromAge(3)).toBe('small')
      expect(wrapper.vm.getAgeGroupFromAge(4)).toBe('medium')
      expect(wrapper.vm.getAgeGroupFromAge(5)).toBe('large')
      expect(wrapper.vm.getAgeGroupFromAge(6)).toBe('preschool')
      expect(wrapper.vm.getAgeGroupFromAge(2)).toBe('')
    })

    it('should format date correctly', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.formatDate('2023-09-01T10:00:00Z')).toMatch(/\d{4}\/\d{1,2}\/\d{1,2}/)
      expect(wrapper.vm.formatDate('')).toBe('')
    })
  })

  describe('Table Selection', () => {
    it('should handle table selection changes', async () => {
      wrapper = createWrapper()
      
      await vi.waitFor(() => {
        expect(wrapper.vm.enrollmentList.length).toBeGreaterThan(0)
      })
      
      const selectedEnrollments = [mockEnrollments[0]]
      await wrapper.vm.handleSelectionChange(selectedEnrollments)
      
      expect(wrapper.vm.selectedRows).toEqual(selectedEnrollments)
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      wrapper = createWrapper()
      
      // Mock API error
      const { request } = require('@/utils/request')
      vi.mocked(request.get).mockRejectedValueOnce(new Error('API Error'))
      
      await wrapper.vm.loadEnrollmentList()
      
      expect(ElMessage.error).toHaveBeenCalledWith('加载招生列表失败: 未知错误')
    })

    it('should handle delete cancellation', async () => {
      wrapper = createWrapper()
      
      // Mock ElMessageBox.confirm to reject (user cancels)
      vi.mocked(ElMessageBox.confirm).mockRejectedValueOnce('cancel')
      
      await vi.waitFor(() => {
        expect(wrapper.vm.enrollmentList.length).toBeGreaterThan(0)
      })
      
      const deleteButton = wrapper.findAll('.action-buttons .el-button[type="danger"]')[1]
      await deleteButton.trigger('click')
      
      // Should not call delete API
      const { request } = require('@/utils/request')
      expect(request.delete).not.toHaveBeenCalled()
    })
  })

  describe('Lifecycle Hooks', () => {
    it('should load statistics and enrollment list on mount', async () => {
      wrapper = createWrapper()
      
      const { request } = require('@/utils/request')
      
      // Wait for mounted hook to complete
      await vi.waitFor(() => {
        expect(request.get).toHaveBeenCalledWith('/api/enrollment/statistics')
        expect(request.get).toHaveBeenCalledWith('/api/enrollment/applications', expect.any(Object))
      })
    })
  })

  describe('Dialog Management', () => {
    it('should reset form data when dialog closes', async () => {
      wrapper = createWrapper()
      
      // Open create dialog
      await wrapper.vm.handleCreateEnrollment()
      
      // Modify form data
      await wrapper.setData({
        formData: {
          studentName: 'Modified Name',
          gender: 'female',
          age: 5
        }
      })
      
      // Close dialog
      await wrapper.vm.handleDialogClose()
      
      expect(wrapper.vm.formData.studentName).toBe('')
      expect(wrapper.vm.formData.gender).toBe('male')
      expect(wrapper.vm.formData.age).toBe(3)
      expect(wrapper.vm.isEdit).toBe(false)
      expect(wrapper.vm.dialogTitle).toBe('')
    })
  })

  describe('Import/Export Features', () => {
    it('should show info message for export functionality', async () => {
      wrapper = createWrapper()
      
      const exportButton = wrapper.findAll('.page-actions .el-button[type="success"]')[1]
      await exportButton.trigger('click')
      
      expect(ElMessage.info).toHaveBeenCalledWith('导出功能开发中')
    })

    it('should show info message for import functionality', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.handleImport()
      
      expect(ElMessage.info).toHaveBeenCalledWith('导入功能开发中')
    })
  })
})