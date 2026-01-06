import { mount } from '@vue/test-utils'
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
import ActivityManagement from '@/components/centers/activity/ActivityManagement.vue'
import DataTable from '@/components/common/DataTable.vue'

// Mock DataTable component
vi.mock('@/components/common/DataTable.vue', () => ({
  default: {
    name: 'DataTable',
    template: '<div class="mock-data-table"><slot></slot><slot name="coverImage"></slot><slot name="title"></slot><slot name="activityType"></slot><slot name="status"></slot><slot name="registration"></slot><slot name="actions"></slot></div>',
    props: ['data', 'columns', 'loading', 'pagination', 'rowKey']
  }
}))

// Mock Element Plus components
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElButton: {
      name: 'ElButton',
      template: '<button class="el-button"><slot></slot></button>'
    },
    ElInput: {
      name: 'ElInput',
      template: '<input class="el-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
      props: ['modelValue']
    },
    ElSelect: {
      name: 'ElSelect',
      template: '<select class="el-select"><slot></slot></select>',
      props: ['modelValue']
    },
    ElOption: {
      name: 'ElOption',
      template: '<option class="el-option" :value="value"><slot></slot></option>',
      props: ['value', 'label']
    },
    ElDatePicker: {
      name: 'ElDatePicker',
      template: '<input class="el-date-picker" type="text" />',
      props: ['modelValue']
    },
    ElForm: {
      name: 'ElForm',
      template: '<form class="el-form"><slot></slot></form>'
    },
    ElFormItem: {
      name: 'ElFormItem',
      template: '<div class="el-form-item"><slot></slot><slot name="label"></slot></div>'
    },
    ElImage: {
      name: 'ElImage',
      template: '<img class="el-image" :src="src" />',
      props: ['src']
    },
    ElIcon: {
      name: 'ElIcon',
      template: '<i class="el-icon"><slot></slot></i>'
    },
    ElTag: {
      name: 'ElTag',
      template: '<span class="el-tag"><slot></slot></span>',
      props: ['type', 'size']
    },
    ElProgress: {
      name: 'ElProgress',
      template: '<div class="el-progress"><slot></slot></div>',
      props: ['percentage', 'strokeWidth', 'showText', 'color']
    },
    ElDropdown: {
      name: 'ElDropdown',
      template: '<div class="el-dropdown"><slot></slot><slot name="dropdown"></slot></div>'
    },
    ElDropdownMenu: {
      name: 'ElDropdownMenu',
      template: '<div class="el-dropdown-menu"><slot></slot></div>'
    },
    ElDropdownItem: {
      name: 'ElDropdownItem',
      template: '<div class="el-dropdown-item" @click="$emit(\'click\')"><slot></slot></div>'
    },
    ElMessage: {
      install: (app: any) => {
        app.config.globalProperties.$message = {
          success: vi.fn(),
          error: vi.fn(),
          info: vi.fn()
        }
      }
    },
    ElMessageBox: {
      confirm: vi.fn()
    }
  }
})

// Mock Vue Router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

// Mock API functions
vi.mock('@/api/modules/activity', () => ({
  getActivityList: vi.fn(),
  deleteActivity: vi.fn()
}))

describe('ActivityManagement.vue', () => {
  let wrapper: any

  const mockActivities = [
    {
      id: '1',
      title: '春季亲子活动',
      activityType: 1,
      status: 'registration',
      startTime: '2024-03-01T10:00:00Z',
      endTime: '2024-03-01T12:00:00Z',
      location: '多功能厅',
      registeredCount: 25,
      capacity: 30,
      fee: 0,
      coverImage: 'https://example.com/image1.jpg',
      isHot: true
    },
    {
      id: '2',
      title: '科学实验课',
      activityType: 2,
      status: 'ongoing',
      startTime: '2024-03-02T14:00:00Z',
      endTime: '2024-03-02T16:00:00Z',
      location: '实验室',
      registeredCount: 15,
      capacity: 20,
      fee: 50,
      coverImage: '',
      isHot: false
    }
  ]

  const createWrapper = () => {
    return mount(ActivityManagement, {
      global: {
        components: {
          DataTable
        },
        stubs: {
          'el-button': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true,
          'el-form': true,
          'el-form-item': true,
          'el-image': true,
          'el-icon': true,
          'el-tag': true,
          'el-progress': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true
        },
        mocks: {
          $message: {
            success: vi.fn(),
            error: vi.fn(),
            info: vi.fn()
          }
        }
      }
    })
  }

  beforeEach(async () => {
    wrapper = null
    vi.clearAllMocks()
    mockPush.mockClear()
    
    // Mock API responses
    const { getActivityList, deleteActivity } = require('@/api/modules/activity')
    getActivityList.mockResolvedValue({
      success: true,
      data: {
        items: mockActivities,
        total: 2
      }
    })
    deleteActivity.mockResolvedValue({
      success: true
    })
  })

  describe('组件渲染', () => {
    it('应该正确渲染活动管理页面基本结构', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.activity-management').exists()).toBe(true)
      expect(wrapper.find('.toolbar').exists()).toBe(true)
      expect(wrapper.find('.filters').exists()).toBe(true)
      expect(wrapper.find('.table-container').exists()).toBe(true)
    })

    it('应该渲染工具栏', () => {
      wrapper = createWrapper()
      
      const toolbar = wrapper.find('.toolbar')
      expect(toolbar.find('.toolbar-left').exists()).toBe(true)
      expect(toolbar.find('.toolbar-right').exists()).toBe(true)
      
      // 检查主要操作按钮
      const leftButtons = toolbar.findAll('.toolbar-left .el-button')
      expect(leftButtons.length).toBeGreaterThan(0)
      
      // 检查搜索框
      expect(toolbar.find('.search-box').exists()).toBe(true)
    })

    it('应该渲染筛选器表单', () => {
      wrapper = createWrapper()
      
      const filters = wrapper.find('.filters')
      expect(filters.find('.el-form').exists()).toBe(true)
      
      const formItems = filters.findAll('.el-form-item')
      expect(formItems.length).toBeGreaterThan(0)
    })

    it('应该渲染数据表格', () => {
      wrapper = createWrapper()
      
      const tableContainer = wrapper.find('.table-container')
      expect(tableContainer.findComponent(DataTable).exists()).toBe(true)
    })

    it('应该设置正确的表格列配置', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.tableColumns).toHaveLength(11)
      
      const selectionColumn = wrapper.vm.tableColumns[0]
      expect(selectionColumn.type).toBe('selection')
      
      const actionsColumn = wrapper.vm.tableColumns[10]
      expect(actionsColumn.prop).toBe('actions')
      expect(actionsColumn.slot).toBe('actions')
    })
  })

  describe('数据加载', () => {
    it('应该在组件挂载时加载活动列表', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.$nextTick()
      
      const { getActivityList } = require('@/api/modules/activity')
      expect(getActivityList).toHaveBeenCalledWith({
        title: '',
        type: '',
        status: '',
        startDate: '',
        endDate: '',
        page: 1,
        pageSize: 10
      })
    })

    it('应该正确显示加载状态', async () => {
      const { getActivityList } = require('@/api/modules/activity')
      getActivityList.mockImplementationOnce(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              success: true,
              data: { items: mockActivities, total: 2 }
            })
          }, 1000)
        })
      })
      
      wrapper = createWrapper()
      
      expect(wrapper.vm.loading).toBe(true)
      
      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 1100))
      
      expect(wrapper.vm.loading).toBe(false)
    })

    it('应该正确处理加载成功', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.activityList).toEqual(mockActivities)
      expect(wrapper.vm.pagination.total).toBe(2)
    })

    it('应该正确处理加载失败', async () => {
      const { getActivityList } = require('@/api/modules/activity')
      getActivityList.mockRejectedValueOnce(new Error('加载失败'))
      
      wrapper = createWrapper()
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.$message.error).toHaveBeenCalledWith('加载活动列表失败')
    })
  })

  describe('搜索和筛选功能', () => {
    it('应该正确设置搜索表单', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.searchForm).toEqual({
        title: '',
        type: '',
        status: '',
        startDate: '',
        endDate: ''
      })
    })

    it('应该处理搜索操作', async () => {
      wrapper = createWrapper()
      
      wrapper.vm.searchForm.title = '测试'
      await wrapper.vm.handleSearch()
      
      expect(wrapper.vm.pagination.currentPage).toBe(1)
      
      const { getActivityList } = require('@/api/modules/activity')
      expect(getActivityList).toHaveBeenCalledWith({
        title: '测试',
        type: '',
        status: '',
        startDate: '',
        endDate: '',
        page: 1,
        pageSize: 10
      })
    })

    it('应该处理重置操作', async () => {
      wrapper = createWrapper()
      
      // 先设置一些值
      wrapper.vm.searchForm.title = '测试'
      wrapper.vm.searchForm.type = 'trial'
      wrapper.vm.dateRange = ['2024-01-01', '2024-01-31']
      
      await wrapper.vm.handleReset()
      
      expect(wrapper.vm.searchForm).toEqual({
        title: '',
        type: '',
        status: '',
        startDate: '',
        endDate: ''
      })
      expect(wrapper.vm.dateRange).toBe(null)
    })

    it('应该处理日期范围变化', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.handleDateRangeChange(['2024-01-01', '2024-01-31'])
      
      expect(wrapper.vm.searchForm.startDate).toBe('2024-01-01')
      expect(wrapper.vm.searchForm.endDate).toBe('2024-01-31')
    })

    it('应该处理空日期范围', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.handleDateRangeChange(null)
      
      expect(wrapper.vm.searchForm.startDate).toBe('')
      expect(wrapper.vm.searchForm.endDate).toBe('')
    })
  })

  describe('分页功能', () => {
    it('应该正确处理页码变化', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.handlePageChange(2)
      
      expect(wrapper.vm.pagination.currentPage).toBe(2)
      
      const { getActivityList } = require('@/api/modules/activity')
      expect(getActivityList).toHaveBeenCalledWith({
        title: '',
        type: '',
        status: '',
        startDate: '',
        endDate: '',
        page: 2,
        pageSize: 10
      })
    })

    it('应该正确处理页大小变化', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.handleSizeChange(20)
      
      expect(wrapper.vm.pagination.pageSize).toBe(20)
      expect(wrapper.vm.pagination.currentPage).toBe(1)
      
      const { getActivityList } = require('@/api/modules/activity')
      expect(getActivityList).toHaveBeenCalledWith({
        title: '',
        type: '',
        status: '',
        startDate: '',
        endDate: '',
        page: 1,
        pageSize: 20
      })
    })
  })

  describe('用户交互', () => {
    it('应该处理新建活动操作', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.handleCreate()
      
      expect(mockPush).toHaveBeenCalledWith('/activity/create')
    })

    it('应该处理导出操作', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.handleExport()
      
      expect(wrapper.vm.$message.info).toHaveBeenCalledWith('导出功能开发中...')
    })

    it('应该处理刷新操作', async () => {
      wrapper = createWrapper()
      
      const { getActivityList } = require('@/api/modules/activity')
      
      await wrapper.vm.handleRefresh()
      
      expect(getActivityList).toHaveBeenCalled()
    })

    it('应该处理查看操作', async () => {
      wrapper = createWrapper()
      
      const activity = mockActivities[0]
      await wrapper.vm.handleView(activity)
      
      expect(mockPush).toHaveBeenCalledWith(`/activity/detail/${activity.id}`)
    })

    it('应该处理编辑操作', async () => {
      wrapper = createWrapper()
      
      const activity = mockActivities[0]
      await wrapper.vm.handleEdit(activity)
      
      expect(mockPush).toHaveBeenCalledWith(`/activity/edit/${activity.id}`)
    })

    it('应该处理报名管理操作', async () => {
      wrapper = createWrapper()
      
      const activity = mockActivities[0]
      await wrapper.vm.handleManageRegistrations(activity)
      
      expect(mockPush).toHaveBeenCalledWith(`/activity/registrations/${activity.id}`)
    })

    it('应该处理复制操作', async () => {
      wrapper = createWrapper()
      
      const activity = mockActivities[0]
      await wrapper.vm.handleDuplicate(activity)
      
      expect(mockPush).toHaveBeenCalledWith(`/activity/create?template=${activity.id}`)
    })

    it('应该处理发送通知操作', async () => {
      wrapper = createWrapper()
      
      const activity = mockActivities[0]
      await wrapper.vm.handleSendNotification(activity)
      
      expect(wrapper.vm.$message.info).toHaveBeenCalledWith('发送通知功能开发中...')
    })

    it('应该处理删除操作（用户确认）', async () => {
      const { ElMessageBox } = await import('element-plus')
      ElMessageBox.confirm.mockResolvedValueOnce(true)
      
      wrapper = createWrapper()
      
      const activity = mockActivities[0]
      await wrapper.vm.handleDelete(activity)
      
      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        `确定要删除活动 "${activity.title}" 吗？`,
        '删除确认',
        { type: 'warning' }
      )
      
      const { deleteActivity } = require('@/api/modules/activity')
      expect(deleteActivity).toHaveBeenCalledWith(activity.id.toString())
      
      expect(wrapper.vm.$message.success).toHaveBeenCalledWith('删除成功')
    })

    it('应该处理删除操作（用户取消）', async () => {
      const { ElMessageBox } = await import('element-plus')
      ElMessageBox.confirm.mockRejectedValueOnce('cancel')
      
      wrapper = createWrapper()
      
      const activity = mockActivities[0]
      await wrapper.vm.handleDelete(activity)
      
      expect(ElMessageBox.confirm).toHaveBeenCalled()
      
      const { deleteActivity } = require('@/api/modules/activity')
      expect(deleteActivity).not.toHaveBeenCalled()
    })
  })

  describe('表格插槽功能', () => {
    it('应该正确渲染封面图片插槽', async () => {
      wrapper = createWrapper()
      
      wrapper.vm.activityList = mockActivities
      await wrapper.vm.$nextTick()
      
      const table = wrapper.findComponent(DataTable)
      const coverImageSlot = table.find('.cover-image')
      
      expect(coverImageSlot.exists()).toBe(true)
    })

    it('应该正确渲染活动标题插槽', async () => {
      wrapper = createWrapper()
      
      wrapper.vm.activityList = mockActivities
      await wrapper.vm.$nextTick()
      
      const table = wrapper.findComponent(DataTable)
      const titleSlot = table.find('.activity-title')
      
      expect(titleSlot.exists()).toBe(true)
    })

    it('应该正确渲染活动类型插槽', async () => {
      wrapper = createWrapper()
      
      wrapper.vm.activityList = mockActivities
      await wrapper.vm.$nextTick()
      
      const table = wrapper.findComponent(DataTable)
      const typeSlot = table.find('.activity-type')
      
      expect(typeSlot.exists()).toBe(true)
    })

    it('应该正确渲染状态插槽', async () => {
      wrapper = createWrapper()
      
      wrapper.vm.activityList = mockActivities
      await wrapper.vm.$nextTick()
      
      const table = wrapper.findComponent(DataTable)
      const statusSlot = table.find('.status')
      
      expect(statusSlot.exists()).toBe(true)
    })

    it('应该正确渲染报名情况插槽', async () => {
      wrapper = createWrapper()
      
      wrapper.vm.activityList = mockActivities
      await wrapper.vm.$nextTick()
      
      const table = wrapper.findComponent(DataTable)
      const registrationSlot = table.find('.registration-info')
      
      expect(registrationSlot.exists()).toBe(true)
    })

    it('应该正确渲染操作插槽', async () => {
      wrapper = createWrapper()
      
      wrapper.vm.activityList = mockActivities
      await wrapper.vm.$nextTick()
      
      const table = wrapper.findComponent(DataTable)
      const actionsSlot = table.find('.action-buttons')
      
      expect(actionsSlot.exists()).toBe(true)
    })
  })

  describe('工具函数', () => {
    it('应该正确格式化日期时间', () => {
      wrapper = createWrapper()
      
      const dateTime = '2024-03-01T10:00:00Z'
      const formatted = wrapper.vm.formatDateTime({}, {}, dateTime)
      
      expect(formatted).toBeDefined()
      expect(typeof formatted).toBe('string')
    })

    it('应该正确格式化价格', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.formatPrice({}, {}, 0)).toBe('免费')
      expect(wrapper.vm.formatPrice({}, {}, 50)).toBe('¥50')
    })

    it('应该正确获取活动类型标签', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getActivityTypeLabel(1)).toBe('开放日')
      expect(wrapper.vm.getActivityTypeLabel(2)).toBe('家长会')
      expect(wrapper.vm.getActivityTypeLabel(6)).toBe('其他')
    })

    it('应该正确获取活动类型标签类型', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getActivityTypeTagType(1)).toBe('success')
      expect(wrapper.vm.getActivityTypeTagType(2)).toBe('warning')
      expect(wrapper.vm.getActivityTypeTagType(6)).toBe('default')
    })

    it('应该正确获取状态标签', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getStatusLabel('draft')).toBe('草稿')
      expect(wrapper.vm.getStatusLabel('registration')).toBe('报名中')
      expect(wrapper.vm.getStatusLabel('ended')).toBe('已结束')
    })

    it('应该正确获取状态标签类型', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getStatusTagType('draft')).toBe('info')
      expect(wrapper.vm.getStatusTagType('registration')).toBe('warning')
      expect(wrapper.vm.getStatusTagType('ended')).toBe('info')
    })

    it('应该正确获取进度条颜色', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getProgressColor(0.3)).toBe('#67c23a')
      expect(wrapper.vm.getProgressColor(0.6)).toBe('#e6a23c')
      expect(wrapper.vm.getProgressColor(0.9)).toBe('#f56c6c')
    })
  })

  describe('选择功能', () => {
    it('应该正确处理选择变化', async () => {
      wrapper = createWrapper()
      
      const selectedActivities = [mockActivities[0]]
      await wrapper.vm.handleSelectionChange(selectedActivities)
      
      expect(wrapper.vm.selectedActivities).toEqual(selectedActivities)
    })

    it('应该正确处理批量删除操作', async () => {
      const { ElMessageBox } = await import('element-plus')
      ElMessageBox.confirm.mockResolvedValueOnce(true)
      
      wrapper = createWrapper()
      
      wrapper.vm.selectedActivities = mockActivities
      await wrapper.vm.handleBatchDelete()
      
      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        `确定要删除选中的 ${mockActivities.length} 个活动吗？`,
        '批量删除确认',
        { type: 'warning' }
      )
    })
  })

  describe('边界条件测试', () => {
    it('应该处理空的活动列表', async () => {
      const { getActivityList } = require('@/api/modules/activity')
      getActivityList.mockResolvedValueOnce({
        success: true,
        data: {
          items: [],
          total: 0
        }
      })
      
      wrapper = createWrapper()
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.activityList).toEqual([])
      expect(wrapper.vm.pagination.total).toBe(0)
    })

    it('应该处理API错误', async () => {
      const { getActivityList } = require('@/api/modules/activity')
      getActivityList.mockRejectedValueOnce(new Error('网络错误'))
      
      wrapper = createWrapper()
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.$message.error).toHaveBeenCalledWith('加载活动列表失败')
    })

    it('应该处理删除操作失败', async () => {
      const { ElMessageBox } = await import('element-plus')
      ElMessageBox.confirm.mockResolvedValueOnce(true)
      
      const { deleteActivity } = require('@/api/modules/activity')
      deleteActivity.mockRejectedValueOnce(new Error('删除失败'))
      
      wrapper = createWrapper()
      
      const activity = mockActivities[0]
      await wrapper.vm.handleDelete(activity)
      
      expect(wrapper.vm.$message.error).toHaveBeenCalledWith('删除失败')
    })
  })

  describe('性能测试', () => {
    it('应该快速渲染组件', () => {
      const startTime = performance.now()
      
      wrapper = createWrapper()
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      expect(renderTime).toBeLessThan(100) // 渲染时间应该小于 100ms
    })

    it('应该正确处理大量数据', async () => {
      const largeActivityList = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        title: `活动${i}`,
        activityType: (i % 6) + 1,
        status: ['draft', 'registration', 'ongoing', 'ended'][i % 4],
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        location: `地点${i}`,
        registeredCount: Math.floor(Math.random() * 100),
        capacity: 100,
        fee: i * 10,
        coverImage: '',
        isHot: i % 3 === 0
      }))
      
      const { getActivityList } = require('@/api/modules/activity')
      getActivityList.mockResolvedValueOnce({
        success: true,
        data: {
          items: largeActivityList,
          total: 100
        }
      })
      
      wrapper = createWrapper()
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.activityList).toHaveLength(100)
      
      // 测试渲染性能
      const startTime = performance.now()
      await wrapper.vm.$nextTick()
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(50) // 重新渲染时间应该小于 50ms
    })
  })
})