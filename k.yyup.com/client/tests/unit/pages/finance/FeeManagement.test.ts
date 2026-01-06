
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { VueWrapper } from '@vue/test-utils'
import FeeManagement from '@/pages/finance/FeeManagement.vue'
import { createComponentWrapper, waitForUpdate, createTestCleanup } from '../../../utils/component-test-helper'

// Mock Element Plus表单验证
const mockFormRef = {
  clearValidate: vi.fn(),
  resetFields: vi.fn(),
  validate: vi.fn(() => Promise.resolve(true)),
  validateField: vi.fn(() => Promise.resolve(true))
}

// Mock API调用
vi.mock('@/api/modules/finance', () => ({
  getFeeRecords: vi.fn(() => Promise.resolve({
    success: true,
    data: {
      items: [],
      total: 0
    }
  })),
  getFeeItems: vi.fn(() => Promise.resolve({
    success: true,
    data: []
  })),
  createPayment: vi.fn(() => Promise.resolve({
    success: true,
    data: { id: 1 }
  }))
}))

// Mock Element Plus消息组件
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
      confirm: vi.fn(() => Promise.resolve('confirm'))
    }
  }
})

// Mock日期工具
vi.mock('@/utils/date', () => ({
  formatDateTime: vi.fn((date) => date ? new Date(date).toLocaleDateString() : '')
}))

describe('FeeManagement Page', () => {
  let wrapper: VueWrapper<any>
  const cleanup = createTestCleanup()

  const mockFeeRecords = [
    {
      id: 1,
      studentName: '张小明',
      studentAvatar: '',
      className: '小班A',
      feeItem: '学费',
      feeItemType: 'tuition',
      amount: 2800,
      paidAmount: 2800,
      remainingAmount: 0,
      dueDate: '2024-01-31',
      status: 'paid',
      lastPaymentDate: '2024-01-15'
    },
    {
      id: 2,
      studentName: '李小红',
      studentAvatar: '',
      className: '中班B',
      feeItem: '学费',
      feeItemType: 'tuition',
      amount: 2800,
      paidAmount: 1400,
      remainingAmount: 1400,
      dueDate: '2024-01-31',
      status: 'partial',
      lastPaymentDate: '2024-01-10'
    },
    {
      id: 3,
      studentName: '王小华',
      studentAvatar: '',
      className: '大班C',
      feeItem: '餐费',
      feeItemType: 'meal',
      amount: 600,
      paidAmount: 0,
      remainingAmount: 600,
      dueDate: '2024-01-25',
      status: 'pending',
      lastPaymentDate: null
    },
    {
      id: 4,
      studentName: '赵小丽',
      studentAvatar: '',
      className: '小班A',
      feeItem: '活动费',
      feeItemType: 'activity',
      amount: 200,
      paidAmount: 0,
      remainingAmount: 200,
      dueDate: '2024-01-20',
      status: 'overdue',
      lastPaymentDate: null
    }
  ]

  const mockFeeItems = [
    {
      id: 1,
      name: '学费',
      type: 'tuition',
      amount: 2800,
      status: 'active'
    },
    {
      id: 2,
      name: '餐费',
      type: 'meal',
      amount: 600,
      status: 'active'
    }
  ]

  const createWrapper = (props = {}) => {
    return createComponentWrapper(FeeManagement, {
      props,
      withPinia: true,
      withRouter: false,
      global: {
        provide: {
          // 提供表单引用Mock
          formRef: mockFormRef
        },
        stubs: {
          'el-form': {
            template: '<form ref="formRef"><slot /></form>',
            methods: mockFormRef
          },
          'el-form-item': { template: '<div><slot /></div>' },
          'el-input': { template: '<input />' },
          'el-select': { template: '<select><slot /></select>' },
          'el-option': { template: '<option><slot /></option>' },
          'el-button': { template: '<button><slot /></button>' },
          'el-table': { template: '<div class="el-table"><slot /></div>' },
          'el-table-column': { template: '<div class="el-table-column"><slot /></div>' },
          'el-pagination': { template: '<div class="el-pagination"></div>' },
          'el-dialog': { template: '<div class="el-dialog"><slot /></div>' },
          'el-card': { template: '<div class="el-card"><slot /></div>' },
          'el-tag': { template: '<span class="el-tag"><slot /></span>' }
        }
      }
    })
  }

  beforeEach(() => {
    wrapper = createWrapper()
    cleanup.addCleanup(() => wrapper?.unmount())
  })

  afterEach(() => {
    cleanup.cleanup()
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render the fee management page correctly', () => {
      expect(wrapper.find('.fee-management').exists()).toBe(true)
    })

    it('should display page title and description', () => {
      const title = wrapper.find('h1, .page-title')
      expect(title.exists()).toBe(true)
    })

    it('should display statistics cards', () => {
      const cards = wrapper.findAll('.stat-card, .el-card')
      expect(cards.length).toBeGreaterThan(0)
    })

    it('should display fee items grid', () => {
      const grid = wrapper.find('.fee-items-grid, .fee-items')
      expect(grid.exists()).toBe(true)
    })
  })

  describe('Statistics Display', () => {
    it('should show correct statistics values', () => {
      // 检查统计数据是否正确显示
      const vm = wrapper.vm as any
      expect(vm.statistics).toBeDefined()
    })

    it('should format money correctly', () => {
      // 检查金额格式化
      const moneyElements = wrapper.findAll('.money, .amount')
      expect(moneyElements.length).toBeGreaterThan(0)
    })
  })
      type: 'material'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    
    // 创建路由
    router = createRouter({
      history: createWebHistory(),
      routes: []
    })

    // 创建 Pinia
    const pinia = createPinia()
    setActivePinia(pinia)

    // Mock ElForm.validate to resolve
    vi.mocked(ElForm.prototype.validate).mockResolvedValue(true)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  const createWrapper = () => {
    return mount(FeeManagement, {
      global: {
        plugins: [router, createPinia()],
        stubs: {
          'el-icon': true,
          'el-button': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-input-number': true,
          'el-select': true,
          'el-option': true,
          'el-checkbox-group': true,
          'el-checkbox': true,
          'el-radio-group': true,
          'el-radio': true,
          'el-table': true,
          'el-table-column': true,
          'el-tag': true,
          'el-row': true,
          'el-col': true,
          'el-card': true,
          'el-dialog': true,
          'el-avatar': true,
          'el-pagination': true
        }
      }
    })
  }

  describe('Component Rendering', () => {
    it('should render the fee management page correctly', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.fee-header').exists()).toBe(true)
      expect(wrapper.find('.fee-statistics').exists()).toBe(true)
      expect(wrapper.find('.fee-items-section').exists()).toBe(true)
      expect(wrapper.find('.filter-toolbar').exists()).toBe(true)
      expect(wrapper.find('.fee-records').exists()).toBe(true)
    })

    it('should display page title and description', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.page-title h1').text()).toBe('收费管理')
      expect(wrapper.find('.page-title p').text()).toBe('管理学费、杂费等各项收费项目')
    })

    it('should display statistics cards', () => {
      wrapper = createWrapper()
      
      const statCards = wrapper.findAll('.stat-card')
      expect(statCards.length).toBe(4)
      
      expect(statCards[0].find('.stat-value').text()).toBe('¥1,250,000')
      expect(statCards[1].find('.stat-value').text()).toBe('¥950,000')
      expect(statCards[2].find('.stat-value').text()).toBe('¥250,000')
      expect(statCards[3].find('.stat-value').text()).toBe('¥50,000')
    })

    it('should display fee items grid', () => {
      wrapper = createWrapper()
      
      const feeItems = wrapper.findAll('.fee-item')
      expect(feeItems.length).toBe(mockFeeItems.length)
      
      expect(feeItems[0].find('h4').text()).toBe('学费')
      expect(feeItems[1].find('h4').text()).toBe('餐费')
    })
  })

  describe('Statistics Display', () => {
    it('should show correct statistics values', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.statistics.totalAmount).toBe(1250000)
      expect(wrapper.vm.statistics.collectedAmount).toBe(950000)
      expect(wrapper.vm.statistics.pendingAmount).toBe(250000)
      expect(wrapper.vm.statistics.overdueAmount).toBe(50000)
    })

    it('should format money correctly', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.formatMoney(1250000)).toBe('1,250,000')
      expect(wrapper.vm.formatMoney(950000)).toBe('950,000')
      expect(wrapper.vm.formatMoney(0)).toBe('0')
    })
  })

  describe('Fee Items Display', () => {
    it('should display fee items with correct information', () => {
      wrapper = createWrapper()
      
      const firstFeeItem = wrapper.findAll('.fee-item')[0]
      expect(firstFeeItem.find('h4').text()).toBe('学费')
      expect(firstFeeItem.find('p').text()).toBe('每月学费')
      expect(firstFeeItem.find('.item-stats').text()).toContain('¥2,800/月')
      expect(firstFeeItem.find('.item-count').text()).toBe('120名学生')
    })

    it('should show correct status tags for fee items', () => {
      wrapper = createWrapper()
      
      const statusTags = wrapper.findAll('.fee-item .el-tag')
      statusTags.forEach(tag => {
        expect(tag.text()).toBe('启用')
      })
    })
  })

  describe('Filter Functionality', () => {
    it('should have filter form with correct fields', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('[placeholder="选择收费项目"]').exists()).toBe(true)
      expect(wrapper.find('[placeholder="选择班级"]').exists()).toBe(true)
      expect(wrapper.find('[placeholder="选择状态"]').exists()).toBe(true)
      expect(wrapper.find('[placeholder="搜索学生姓名"]').exists()).toBe(true)
    })

    it('should reset filter form when reset button is clicked', async () => {
      wrapper = createWrapper()
      
      // Set some filter values
      await wrapper.setData({
        filterForm: {
          feeItem: '1',
          class: 'small',
          status: 'paid',
          studentName: '张三'
        }
      })
      
      const resetButton = wrapper.findAll('.el-form .el-button').find(btn => 
        btn.text() === '重置'
      )
      await resetButton.trigger('click')
      
      expect(wrapper.vm.filterForm).toEqual({
        feeItem: '',
        class: '',
        status: '',
        studentName: ''
      })
    })

    it('should trigger search when search button is clicked', async () => {
      wrapper = createWrapper()
      
      const loadFeeRecordsSpy = vi.spyOn(wrapper.vm, 'loadFeeRecords')
      const searchButton = wrapper.find('.el-form .el-button[type="primary"]')
      await searchButton.trigger('click')
      
      expect(loadFeeRecordsSpy).toHaveBeenCalled()
    })
  })

  describe('Fee Records Table', () => {
    it('should display fee records in table', async () => {
      wrapper = createWrapper()
      
      // Wait for data to load
      await vi.waitFor(() => {
        expect(wrapper.vm.feeRecords.length).toBeGreaterThan(0)
      })
      
      expect(wrapper.vm.feeRecords.length).toBe(mockFeeRecords.length)
      expect(wrapper.vm.feeRecords[0].studentName).toBe('张小明')
    })

    it('should show correct student information in table', async () => {
      wrapper = createWrapper()
      
      await vi.waitFor(() => {
        expect(wrapper.vm.feeRecords.length).toBeGreaterThan(0)
      })
      
      const firstRecord = wrapper.vm.feeRecords[0]
      expect(firstRecord.studentName).toBe('张小明')
      expect(firstRecord.className).toBe('小班A')
      expect(firstRecord.feeItem).toBe('学费')
    })

    it('should handle table selection changes', async () => {
      wrapper = createWrapper()
      
      await vi.waitFor(() => {
        expect(wrapper.vm.feeRecords.length).toBeGreaterThan(0)
      })
      
      const selectedRecords = [mockFeeRecords[0]]
      await wrapper.vm.handleSelectionChange(selectedRecords)
      
      expect(wrapper.vm.selectedRecords).toEqual(selectedRecords)
    })
  })

  describe('Payment Operations', () => {
    it('should open payment dialog when payment button is clicked', async () => {
      wrapper = createWrapper()
      
      await vi.waitFor(() => {
        expect(wrapper.vm.feeRecords.length).toBeGreaterThan(0)
      })
      
      const paymentButton = wrapper.findAll('.el-button[type="text"]')[0]
      await paymentButton.trigger('click')
      
      expect(wrapper.vm.showPaymentDialog).toBe(true)
      expect(wrapper.vm.currentRecord).toEqual(mockFeeRecords[0])
    })

    it('should set correct payment amount in payment dialog', async () => {
      wrapper = createWrapper()
      
      await vi.waitFor(() => {
        expect(wrapper.vm.feeRecords.length).toBeGreaterThan(0)
      })
      
      await wrapper.vm.handlePayment(mockFeeRecords[1])
      
      expect(wrapper.vm.paymentForm.amount).toBe(1400) // remainingAmount
    })

    it('should confirm payment successfully', async () => {
      wrapper = createWrapper()
      
      await vi.waitFor(() => {
        expect(wrapper.vm.feeRecords.length).toBeGreaterThan(0)
      })
      
      await wrapper.vm.handlePayment(mockFeeRecords[1])
      await wrapper.vm.handleConfirmPayment()
      
      expect(ElMessage.success).toHaveBeenCalledWith('收费成功')
      expect(wrapper.vm.showPaymentDialog).toBe(false)
    })

    it('should reset payment form when dialog closes', async () => {
      wrapper = createWrapper()
      
      await vi.waitFor(() => {
        expect(wrapper.vm.feeRecords.length).toBeGreaterThan(0)
      })
      
      await wrapper.vm.handlePayment(mockFeeRecords[0])
      
      // Modify payment form
      await wrapper.setData({
        paymentForm: {
          amount: 1000,
          method: 'cash',
          remarks: '测试备注'
        }
      })
      
      await wrapper.vm.handlePaymentDialogClose()
      
      expect(wrapper.vm.paymentForm).toEqual({
        amount: 0,
        method: '',
        remarks: ''
      })
    })
  })

  describe('Fee Item Management', () => {
    it('should open create dialog when create button is clicked', async () => {
      wrapper = createWrapper()
      
      const createButton = wrapper.find('.header-actions .el-button[type="primary"]')
      await createButton.trigger('click')
      
      expect(wrapper.vm.showCreateDialog).toBe(true)
    })

    it('should create fee item successfully', async () => {
      wrapper = createWrapper()
      
      // Open create dialog
      await wrapper.setData({ showCreateDialog: true })
      
      // Fill create form
      await wrapper.setData({
        createForm: {
          name: '测试费用',
          type: 'other',
          amount: 100,
          unit: 'month',
          classes: ['small'],
          description: '测试描述',
          status: 'active'
        }
      })
      
      await wrapper.vm.handleCreateFeeItem()
      
      expect(ElMessage.success).toHaveBeenCalledWith('收费项目创建成功')
      expect(wrapper.vm.showCreateDialog).toBe(false)
    })

    it('should reset create form when dialog closes', async () => {
      wrapper = createWrapper()
      
      // Open create dialog
      await wrapper.setData({ showCreateDialog: true })
      
      // Modify create form
      await wrapper.setData({
        createForm: {
          name: '测试费用',
          type: 'other',
          amount: 100,
          unit: 'month',
          classes: ['small'],
          description: '测试描述',
          status: 'active'
        }
      })
      
      await wrapper.vm.handleCreateDialogClose()
      
      expect(wrapper.vm.createForm).toEqual({
        name: '',
        type: '',
        amount: 0,
        unit: '',
        classes: [],
        description: '',
        status: 'active'
      })
    })

    it('should handle fee item click', async () => {
      wrapper = createWrapper()
      
      const loadFeeRecordsSpy = vi.spyOn(wrapper.vm, 'loadFeeRecords')
      
      await wrapper.vm.handleItemClick(mockFeeItems[0])
      
      expect(wrapper.vm.filterForm.feeItem).toBe('1')
      expect(loadFeeRecordsSpy).toHaveBeenCalled()
    })
  })

  describe('Utility Functions', () => {
    it('should check if payment is overdue correctly', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.isOverdue('2024-01-20')).toBe(true) // Past date
      expect(wrapper.vm.isOverdue('2025-01-20')).toBe(false) // Future date
    })

    it('should return correct fee item tag type', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getFeeItemTagType('tuition')).toBe('primary')
      expect(wrapper.vm.getFeeItemTagType('meal')).toBe('success')
      expect(wrapper.vm.getFeeItemTagType('activity')).toBe('warning')
      expect(wrapper.vm.getFeeItemTagType('material')).toBe('info')
      expect(wrapper.vm.getFeeItemTagType('other')).toBe('info')
    })

    it('should return correct status text', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getStatusText('paid')).toBe('已缴费')
      expect(wrapper.vm.getStatusText('pending')).toBe('待缴费')
      expect(wrapper.vm.getStatusText('overdue')).toBe('逾期')
      expect(wrapper.vm.getStatusText('partial')).toBe('部分缴费')
    })

    it('should return correct status tag type', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getStatusTagType('paid')).toBe('success')
      expect(wrapper.vm.getStatusTagType('pending')).toBe('warning')
      expect(wrapper.vm.getStatusTagType('overdue')).toBe('danger')
      expect(wrapper.vm.getStatusTagType('partial')).toBe('info')
    })

    it('should format date correctly', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.formatDate('2024-01-15')).toMatch(/\d{4}\/\d{1,2}\/\d{1,2}/)
    })
  })

  describe('Batch Operations', () => {
    it('should show info message for batch payment', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.handleBatchPayment()
      
      expect(ElMessage.info).toHaveBeenCalledWith('批量收费功能开发中')
    })

    it('should show info message for export', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.handleExport()
      
      expect(ElMessage.info).toHaveBeenCalledWith('导出功能开发中')
    })
  })

  describe('Other Operations', () => {
    it('should show info message for view details', async () => {
      wrapper = createWrapper()
      
      await vi.waitFor(() => {
        expect(wrapper.vm.feeRecords.length).toBeGreaterThan(0)
      })
      
      await wrapper.vm.handleViewDetails(mockFeeRecords[0])
      
      expect(ElMessage.info).toHaveBeenCalledWith('查看详情功能开发中')
    })

    it('should show success message for send notice', async () => {
      wrapper = createWrapper()
      
      await vi.waitFor(() => {
        expect(wrapper.vm.feeRecords.length).toBeGreaterThan(0)
      })
      
      await wrapper.vm.handleSendNotice(mockFeeRecords[0])
      
      expect(ElMessage.success).toHaveBeenCalledWith('已向张小明家长发送催费通知')
    })

    it('should show info message for edit', async () => {
      wrapper = createWrapper()
      
      await vi.waitFor(() => {
        expect(wrapper.vm.feeRecords.length).toBeGreaterThan(0)
      })
      
      await wrapper.vm.handleEdit(mockFeeRecords[0])
      
      expect(ElMessage.info).toHaveBeenCalledWith('编辑功能开发中')
    })
  })

  describe('Pagination', () => {
    it('should handle page size change', async () => {
      wrapper = createWrapper()
      
      const loadFeeRecordsSpy = vi.spyOn(wrapper.vm, 'loadFeeRecords')
      
      await wrapper.vm.handleSizeChange(50)
      
      expect(wrapper.vm.pagination.pageSize).toBe(50)
      expect(wrapper.vm.pagination.currentPage).toBe(1)
      expect(loadFeeRecordsSpy).toHaveBeenCalled()
    })

    it('should handle current page change', async () => {
      wrapper = createWrapper()
      
      const loadFeeRecordsSpy = vi.spyOn(wrapper.vm, 'loadFeeRecords')
      
      await wrapper.vm.handleCurrentChange(2)
      
      expect(wrapper.vm.pagination.currentPage).toBe(2)
      expect(loadFeeRecordsSpy).toHaveBeenCalled()
    })
  })

  describe('Refresh Functionality', () => {
    it('should refresh data when refresh button is clicked', async () => {
      wrapper = createWrapper()
      
      const loadFeeRecordsSpy = vi.spyOn(wrapper.vm, 'loadFeeRecords')
      
      const refreshButton = wrapper.find('.header-actions .el-button:not([type="primary"])')
      await refreshButton.trigger('click')
      
      expect(loadFeeRecordsSpy).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should handle load fee records error gracefully', async () => {
      wrapper = createWrapper()
      
      // Mock console.error to suppress error output
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      await wrapper.vm.loadFeeRecords()
      
      expect(ElMessage.error).toHaveBeenCalledWith('加载收费记录失败')
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })

    it('should handle payment error gracefully', async () => {
      wrapper = createWrapper()
      
      await vi.waitFor(() => {
        expect(wrapper.vm.feeRecords.length).toBeGreaterThan(0)
      })
      
      await wrapper.vm.handlePayment(mockFeeRecords[0])
      
      // Simulate payment error by making the promise reject
      const originalSetTimeout = global.setTimeout
      global.setTimeout = vi.fn((callback) => {
        callback() // Call callback immediately to simulate error
      })
      
      await wrapper.vm.handleConfirmPayment()
      
      expect(ElMessage.error).toHaveBeenCalledWith('收费失败，请重试')
      
      global.setTimeout = originalSetTimeout
    })
  })

  describe('Lifecycle Hooks', () => {
    it('should load fee records on mount', async () => {
      const loadFeeRecordsSpy = vi.spyOn(FeeManagement.methods, 'loadFeeRecords')
      
      wrapper = createWrapper()
      
      expect(loadFeeRecordsSpy).toHaveBeenCalled()
    })
  })

  describe('Responsive Design', () => {
    it('should render correctly on mobile screens', () => {
      wrapper = createWrapper()
      
      // Test mobile-specific classes and structure
      expect(wrapper.find('.fee-management-container').exists()).toBe(true)
      expect(wrapper.find('.fee-header').exists()).toBe(true)
      expect(wrapper.find('.fee-statistics').exists()).toBe(true)
    })
  })
})