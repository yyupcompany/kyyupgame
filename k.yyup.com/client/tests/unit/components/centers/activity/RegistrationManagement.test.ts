
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

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import RegistrationManagement from '@/components/centers/activity/RegistrationManagement.vue'
import { Check, Close, Download, Refresh, ArrowDown } from '@element-plus/icons-vue'

// 模拟组件导入
vi.mock('@/components/common/DataTable.vue', () => ({
  name: 'DataTable',
  template: '<div class="data-table"><slot></slot></div>'
}))

vi.mock('./RegistrationDetail.vue', () => ({
  name: 'RegistrationDetail',
  template: '<div class="registration-detail"></div>'
}))

// 模拟API导入
vi.mock('@/api/activity-center', () => ({
  getRegistrations: vi.fn(),
  approveRegistration: vi.fn(),
  batchApproveRegistrations: vi.fn(),
  getActivities: vi.fn()
}))

// 模拟Element Plus图标
vi.mock('@element-plus/icons-vue', () => ({
  Check: vi.fn(),
  Close: vi.fn(),
  Download: vi.fn(),
  Refresh: vi.fn(),
  ArrowDown: vi.fn()
}))

// 模拟Element Plus组件
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn(),
      prompt: vi.fn()
    },
    ElButton: {
      name: 'ElButton',
      template: '<button @click="$emit(\'click\')"><slot></slot></button>'
    },
    ElInput: {
      name: 'ElInput',
      template: '<input @input="$emit(\'update:modelValue\', $event.target.value)" />'
    },
    ElSelect: {
      name: 'ElSelect',
      template: '<select @change="$emit(\'update:modelValue\', $event.target.value)"><slot></slot></select>'
    },
    ElOption: {
      name: 'ElOption',
      template: '<option :value="value"><slot></slot></option>'
    },
    ElForm: {
      name: 'ElForm',
      template: '<form><slot></slot></form>'
    },
    ElFormItem: {
      name: 'ElFormItem',
      template: '<div><slot></slot><slot name="label"></slot></div>'
    },
    ElDialog: {
      name: 'ElDialog',
      template: '<div><slot></slot><slot name="footer"></slot></div>'
    },
    ElDropdown: {
      name: 'ElDropdown',
      template: '<div><slot></slot><slot name="dropdown"></slot></div>'
    },
    ElDropdownMenu: {
      name: 'ElDropdownMenu',
      template: '<div><slot></slot></div>'
    },
    ElDropdownItem: {
      name: 'ElDropdownItem',
      template: '<div @click="$emit(\'click\')"><slot></slot></div>'
    },
    ElTag: {
      name: 'ElTag',
      template: '<span><slot></slot></span>'
    },
    ElIcon: {
      name: 'ElIcon',
      template: '<span><slot></slot></span>'
    }
  }
})

const mockRegistrationList = [
  {
    id: 'REG001',
    activityTitle: '春季运动会',
    studentName: '张小明',
    studentAge: 5,
    parentName: '张爸爸',
    parentPhone: '13800138000',
    status: 'pending',
    activityStartTime: '2024-03-15T10:00:00',
    registeredAt: '2024-02-20T14:30:00'
  },
  {
    id: 'REG002',
    activityTitle: '亲子活动',
    studentName: '李小红',
    studentAge: 4,
    parentName: '李妈妈',
    parentPhone: '13900139000',
    status: 'approved',
    activityStartTime: '2024-03-20T14:00:00',
    registeredAt: '2024-02-21T09:30:00'
  }
]

const mockActivityOptions = [
  { id: 'ACT001', title: '春季运动会' },
  { id: 'ACT002', title: '亲子活动' }
]

// 控制台错误检测变量
let consoleSpy: any

describe('RegistrationManagement.vue', () => {
  let wrapper: any
  let i18n: any

  beforeEach(() => {
    i18n = createI18n({
      legacy: false,
      locale: 'zh-CN',
      messages: {
        'zh-CN': {}
      }
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // 重置模拟函数
    vi.clearAllMocks()
    
    // 设置默认返回值
    const { getRegistrations, getActivities } = require('@/api/activity-center')
    getRegistrations.mockResolvedValue({
      success: true,
      data: {
        items: mockRegistrationList,
        total: 2
      }
    })
    getActivities.mockResolvedValue({
      success: true,
      data: {
        items: mockActivityOptions,
        total: 2
      }
    })

    wrapper = mount(RegistrationManagement, {
      global: {
        plugins: [i18n],
        stubs: {
          'DataTable': true,
          'RegistrationDetail': true,
          'el-button': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-form': true,
          'el-form-item': true,
          'el-dialog': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-tag': true,
          'el-icon': true
        }
      }
    })
  })

  afterEach(() => {
    if (wrapper) => {
      wrapper.unmount()
    }
    vi.clearAllMocks()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  it('正确渲染组件', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.registration-management').exists()).toBe(true)
  })

  it('显示工具栏', () => {
    const toolbar = wrapper.find('.toolbar')
    expect(toolbar.exists()).toBe(true)
    expect(toolbar.find('.toolbar-left').exists()).toBe(true)
    expect(toolbar.find('.toolbar-right').exists()).toBe(true)
  })

  it('显示筛选器', () => {
    const filters = wrapper.find('.filters')
    expect(filters.exists()).toBe(true)
  })

  it('显示表格容器', () => {
    const tableContainer = wrapper.find('.table-container')
    expect(tableContainer.exists()).toBe(true)
  })

  it('正确初始化搜索表单', () => {
    expect(wrapper.vm.searchForm).toEqual({
      activityId: '',
      studentName: '',
      parentName: '',
      status: ''
    })
  })

  it('正确初始化分页配置', () => {
    expect(wrapper.vm.pagination).toEqual({
      currentPage: 1,
      pageSize: 10,
      total: 0
    })
  })

  it('正确设置表格列配置', () => {
    const expectedColumns = [
      { type: 'selection', width: 55 },
      { prop: 'activity', label: '活动信息', slot: 'activity', minWidth: 200 },
      { prop: 'student', label: '学生信息', slot: 'student', width: 120 },
      { prop: 'parent', label: '家长信息', slot: 'parent', width: 140 },
      { prop: 'status', label: '状态', slot: 'status', width: 100 },
      { prop: 'registeredAt', label: '报名时间', slot: 'registeredAt', width: 140 },
      { prop: 'actions', label: '操作', slot: 'actions', width: 200, fixed: 'right' }
    ]
    expect(wrapper.vm.tableColumns).toEqual(expectedColumns)
  })

  it('组件挂载时加载报名列表', async () => {
    const { getRegistrations } = require('@/api/activity-center')
    await wrapper.vm.loadRegistrationList()
    expect(getRegistrations).toHaveBeenCalledWith({
      activityId: '',
      studentName: '',
      parentName: '',
      status: '',
      page: 1,
      pageSize: 10
    })
  })

  it('组件挂载时加载活动选项', async () => {
    const { getActivities } = require('@/api/activity-center')
    await wrapper.vm.loadActivityOptions()
    expect(getActivities).toHaveBeenCalledWith({ pageSize: 100 })
  })

  it('处理搜索操作', async () => {
    await wrapper.vm.handleSearch()
    expect(wrapper.vm.pagination.currentPage).toBe(1)
    const { getRegistrations } = require('@/api/activity-center')
    expect(getRegistrations).toHaveBeenCalled()
  })

  it('处理重置操作', async () => {
    wrapper.vm.searchForm = {
      activityId: 'ACT001',
      studentName: '张',
      parentName: '张爸爸',
      status: 'pending'
    }
    
    await wrapper.vm.handleReset()
    
    expect(wrapper.vm.searchForm).toEqual({
      activityId: '',
      studentName: '',
      parentName: '',
      status: ''
    })
    expect(wrapper.vm.pagination.currentPage).toBe(1)
  })

  it('处理刷新操作', async () => {
    const { getRegistrations } = require('@/api/activity-center')
    await wrapper.vm.handleRefresh()
    expect(getRegistrations).toHaveBeenCalled()
  })

  it('处理导出操作', () => {
    wrapper.vm.handleExport()
    expect(ElMessage.info).toHaveBeenCalledWith('导出功能开发中...')
  })

  it('处理选择变化', () => {
    const mockSelection = [mockRegistrationList[0]]
    wrapper.vm.handleSelectionChange(mockSelection)
    expect(wrapper.vm.selectedRegistrations).toEqual(mockSelection)
  })

  it('处理分页变化', async () => {
    await wrapper.vm.handlePageChange(2)
    expect(wrapper.vm.pagination.currentPage).toBe(2)
    const { getRegistrations } = require('@/api/activity-center')
    expect(getRegistrations).toHaveBeenCalled()
  })

  it('处理页大小变化', async () => {
    await wrapper.vm.handleSizeChange(20)
    expect(wrapper.vm.pagination.pageSize).toBe(20)
    expect(wrapper.vm.pagination.currentPage).toBe(1)
    const { getRegistrations } = require('@/api/activity-center')
    expect(getRegistrations).toHaveBeenCalled()
  })

  it('处理查看详情', () => {
    const registration = mockRegistrationList[0]
    wrapper.vm.handleView(registration)
    expect(wrapper.vm.selectedRegistration).toEqual(registration)
    expect(wrapper.vm.detailDialogVisible).toBe(true)
  })

  it('处理单个通过', async () => {
    const { approveRegistration } = require('@/api/activity-center')
    approveRegistration.mockResolvedValue({})
    
    const registration = mockRegistrationList[0]
    await wrapper.vm.handleApprove(registration)
    
    expect(approveRegistration).toHaveBeenCalledWith(registration.id, { status: 'approved' })
    expect(ElMessage.success).toHaveBeenCalledWith('审核通过')
  })

  it('处理单个拒绝', async () => {
    const { approveRegistration } = require('@/api/activity-center')
    approveRegistration.mockResolvedValue({})
    ElMessageBox.prompt.mockResolvedValue({ value: '不符合要求' })
    
    const registration = mockRegistrationList[0]
    await wrapper.vm.handleReject(registration)
    
    expect(ElMessageBox.prompt).toHaveBeenCalledWith(
      '请输入拒绝原因',
      '拒绝报名',
      { inputType: 'textarea' }
    )
    expect(approveRegistration).toHaveBeenCalledWith(registration.id, { status: 'rejected', remark: '不符合要求' })
    expect(ElMessage.success).toHaveBeenCalledWith('已拒绝报名')
  })

  it('处理批量通过', () => {
    wrapper.vm.selectedRegistrations = mockRegistrationList
    wrapper.vm.handleBatchApprove()
    expect(wrapper.vm.batchAction).toBe('approve')
    expect(wrapper.vm.batchDialogVisible).toBe(true)
  })

  it('处理批量拒绝', () => {
    wrapper.vm.selectedRegistrations = mockRegistrationList
    wrapper.vm.handleBatchReject()
    expect(wrapper.vm.batchAction).toBe('reject')
    expect(wrapper.vm.batchDialogVisible).toBe(true)
  })

  it('批量操作时检查选择', () => {
    wrapper.vm.selectedRegistrations = []
    wrapper.vm.handleBatchApprove()
    expect(ElMessage.warning).toHaveBeenCalledWith('请选择要操作的报名记录')
    expect(wrapper.vm.batchDialogVisible).toBe(false)
  })

  it('确认批量操作', async () => {
    const { batchApproveRegistrations } = require('@/api/activity-center')
    batchApproveRegistrations.mockResolvedValue({})
    
    wrapper.vm.selectedRegistrations = mockRegistrationList
    wrapper.vm.batchAction = 'approve'
    wrapper.vm.batchForm.remark = '批量通过'
    
    await wrapper.vm.handleConfirmBatch()
    
    const expectedIds = mockRegistrationList.map(item => item.id)
    expect(batchApproveRegistrations).toHaveBeenCalledWith(expectedIds, {
      status: 'approved',
      remark: '批量通过'
    })
    expect(ElMessage.success).toHaveBeenCalledWith('批量通过成功')
    expect(wrapper.vm.batchDialogVisible).toBe(false)
  })

  it('处理发送消息', () => {
    const registration = mockRegistrationList[0]
    wrapper.vm.handleSendMessage(registration)
    expect(ElMessage.info).toHaveBeenCalledWith('发送消息功能开发中...')
  })

  it('处理查看历史', () => {
    const registration = mockRegistrationList[0]
    wrapper.vm.handleViewHistory(registration)
    expect(ElMessage.info).toHaveBeenCalledWith('查看历史功能开发中...')
  })

  it('处理取消报名', async () => {
    const { approveRegistration } = require('@/api/activity-center')
    approveRegistration.mockResolvedValue({})
    ElMessageBox.confirm.mockResolvedValue(true)
    
    const registration = mockRegistrationList[0]
    await wrapper.vm.handleCancel(registration)
    
    expect(ElMessageBox.confirm).toHaveBeenCalledWith(
      `确定要取消 ${registration.studentName} 的报名吗？`,
      '取消报名确认',
      { type: 'warning' }
    )
    expect(approveRegistration).toHaveBeenCalledWith(registration.id, { status: 'cancelled' })
    expect(ElMessage.success).toHaveBeenCalledWith('已取消报名')
  })

  it('正确格式化日期时间', () => {
    const component = wrapper.vm
    const formatted = component.formatDateTime('2024-03-15T10:00:00')
    expect(formatted).toContain('2024')
    expect(formatted).toContain('03')
    expect(formatted).toContain('15')
  })

  it('正确格式化日期', () => {
    const component = wrapper.vm
    const formatted = component.formatDate('2024-03-15T10:00:00')
    expect(formatted).toContain('2024')
    expect(formatted).toContain('03')
    expect(formatted).toContain('15')
  })

  it('正确格式化时间', () => {
    const component = wrapper.vm
    const formatted = component.formatTime('2024-03-15T10:00:00')
    expect(formatted).toContain('10:00')
  })

  it('正确获取状态标签', () => {
    const component = wrapper.vm
    expect(component.getStatusLabel('pending')).toBe('待审核')
    expect(component.getStatusLabel('approved')).toBe('已通过')
    expect(component.getStatusLabel('rejected')).toBe('已拒绝')
    expect(component.getStatusLabel('cancelled')).toBe('已取消')
  })

  it('正确获取状态标签类型', () => {
    const component = wrapper.vm
    expect(component.getStatusTagType('pending')).toBe('warning')
    expect(component.getStatusTagType('approved')).toBe('success')
    expect(component.getStatusTagType('rejected')).toBe('danger')
    expect(component.getStatusTagType('cancelled')).toBe('info')
  })

  it('处理加载失败', async () => {
    const { getRegistrations } = require('@/api/activity-center')
    getRegistrations.mockRejectedValue(new Error('加载失败'))
    
    await wrapper.vm.loadRegistrationList()
    expect(ElMessage.error).toHaveBeenCalledWith('加载报名列表失败')
  })

  it('处理批量操作失败', async () => {
    const { batchApproveRegistrations } = require('@/api/activity-center')
    batchApproveRegistrations.mockRejectedValue(new Error('批量操作失败'))
    
    wrapper.vm.selectedRegistrations = mockRegistrationList
    wrapper.vm.batchAction = 'approve'
    
    await wrapper.vm.handleConfirmBatch()
    expect(ElMessage.error).toHaveBeenCalledWith('批量操作失败')
  })
})