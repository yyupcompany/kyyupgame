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
import NotificationManagement from '@/components/centers/activity/NotificationManagement.vue'
import DataTable from '@/components/common/DataTable.vue'
import NotificationForm from './NotificationForm.vue'
import NotificationTemplates from './NotificationTemplates.vue'
import NotificationDetail from './NotificationDetail.vue'
import NotificationSettings from './NotificationSettings.vue'

// Mock 子组件
vi.mock('@/components/common/DataTable.vue', () => ({
  default: {
    name: 'DataTable',
    template: '<div class="mock-data-table"><slot></slot><slot name="type"></slot><slot name="content"></slot><slot name="activity"></slot><slot name="status"></slot><slot name="recipients"></slot><slot name="sentAt"></slot><slot name="actions"></slot></div>',
    props: ['data', 'columns', 'loading', 'pagination', 'rowKey']
  }
}))

vi.mock('./NotificationForm.vue', () => ({
  default: {
    name: 'NotificationForm',
    template: '<div class="mock-notification-form">Notification Form</div>',
    props: ['notification'],
    emits: ['submit', 'cancel']
  }
}))

vi.mock('./NotificationTemplates.vue', () => ({
  default: {
    name: 'NotificationTemplates',
    template: '<div class="mock-notification-templates">Notification Templates</div>',
    emits: ['close', 'use-template']
  }
}))

vi.mock('./NotificationDetail.vue', () => ({
  default: {
    name: 'NotificationDetail',
    template: '<div class="mock-notification-detail">Notification Detail</div>',
    props: ['notification'],
    emits: ['close']
  }
}))

vi.mock('./NotificationSettings.vue', () => ({
  default: {
    name: 'NotificationSettings',
    template: '<div class="mock-notification-settings">Notification Settings</div>',
    emits: ['close']
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
    ElForm: {
      name: 'ElForm',
      template: '<form class="el-form"><slot></slot></form>'
    },
    ElFormItem: {
      name: 'ElFormItem',
      template: '<div class="el-form-item"><slot></slot><slot name="label"></slot></div>'
    },
    ElDialog: {
      name: 'ElDialog',
      template: '<div class="el-dialog"><slot></slot></div>',
      props: ['modelValue', 'title', 'width', 'destroyOnClose']
    },
    ElTag: {
      name: 'ElTag',
      template: '<span class="el-tag"><slot></slot></span>',
      props: ['type', 'size']
    },
    ElLink: {
      name: 'ElLink',
      template: '<a class="el-link" @click="$emit(\'click\')"><slot></slot></a>',
      props: ['type']
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
      template: '<div class="el-dropdown-item" @click="$emit(\'click\')"><slot></slot></div>',
      props: ['divided']
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
vi.mock('@/api/activity-center', () => ({
  getNotifications: vi.fn(),
  sendActivityNotification: vi.fn()
}))

describe('NotificationManagement.vue', () => {
  let wrapper: any

  const mockNotifications = [
    {
      id: '1',
      type: 'activity_reminder',
      title: '活动提醒通知',
      content: '亲爱的家长，您报名的"春季亲子活动"将于明天上午10点开始。',
      activityId: '1',
      activityTitle: '春季亲子活动',
      recipients: 150,
      sentAt: '2024-03-01T10:00:00Z',
      status: 'sent'
    },
    {
      id: '2',
      type: 'registration_confirm',
      title: '报名确认通知',
      content: '恭喜您！您的孩子已成功报名"科学实验课"。',
      activityId: '2',
      activityTitle: '科学实验课',
      recipients: 80,
      sentAt: '2024-03-02T14:00:00Z',
      status: 'pending'
    }
  ]

  const createWrapper = () => {
    return mount(NotificationManagement, {
      global: {
        components: {
          DataTable,
          NotificationForm,
          NotificationTemplates,
          NotificationDetail,
          NotificationSettings
        },
        stubs: {
          'el-button': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-form': true,
          'el-form-item': true,
          'el-dialog': true,
          'el-tag': true,
          'el-link': true,
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
    const { getNotifications, sendActivityNotification } = require('@/api/activity-center')
    getNotifications.mockResolvedValue({
      success: true,
      data: {
        items: mockNotifications,
        total: 2
      }
    })
    sendActivityNotification.mockResolvedValue({
      success: true
    })
  })

  describe('组件渲染', () => {
    it('应该正确渲染通知管理页面基本结构', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.notification-management').exists()).toBe(true)
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
      expect(leftButtons.length).toBe(3) // 发送通知、模板管理、通知设置
      
      // 检查搜索框和刷新按钮
      expect(toolbar.find('.search-box').exists()).toBe(true)
      expect(toolbar.findAll('.toolbar-right .el-button').length).toBe(1)
    })

    it('应该渲染筛选器表单', () => {
      wrapper = createWrapper()
      
      const filters = wrapper.find('.filters')
      expect(filters.find('.el-form').exists()).toBe(true)
      
      const formItems = filters.findAll('.el-form-item')
      expect(formItems.length).toBe(3) // 通知类型、发送状态、操作按钮
    })

    it('应该渲染数据表格', () => {
      wrapper = createWrapper()
      
      const tableContainer = wrapper.find('.table-container')
      expect(tableContainer.findComponent(DataTable).exists()).toBe(true)
    })

    it('应该设置正确的表格列配置', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.tableColumns).toHaveLength(7)
      
      const typeColumn = wrapper.vm.tableColumns[0]
      expect(typeColumn.prop).toBe('type')
      expect(typeColumn.slot).toBe('type')
      
      const actionsColumn = wrapper.vm.tableColumns[6]
      expect(actionsColumn.prop).toBe('actions')
      expect(actionsColumn.slot).toBe('actions')
    })

    it('应该渲染所有对话框', () => {
      wrapper = createWrapper()
      
      expect(wrapper.findComponent(NotificationForm).exists()).toBe(true)
      expect(wrapper.findComponent(NotificationTemplates).exists()).toBe(true)
      expect(wrapper.findComponent(NotificationDetail).exists()).toBe(true)
      expect(wrapper.findComponent(NotificationSettings).exists()).toBe(true)
    })
  })

  describe('数据加载', () => {
    it('应该在组件挂载时加载通知列表', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.$nextTick()
      
      const { getNotifications } = require('@/api/activity-center')
      expect(getNotifications).toHaveBeenCalledWith({
        title: '',
        type: '',
        status: '',
        page: 1,
        pageSize: 10
      })
    })

    it('应该正确显示加载状态', async () => {
      const { getNotifications } = require('@/api/activity-center')
      getNotifications.mockImplementationOnce(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              success: true,
              data: { items: mockNotifications, total: 2 }
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
      
      expect(wrapper.vm.notificationList).toEqual(mockNotifications)
      expect(wrapper.vm.pagination.total).toBe(2)
    })

    it('应该正确处理加载失败', async () => {
      const { getNotifications } = require('@/api/activity-center')
      getNotifications.mockRejectedValueOnce(new Error('加载失败'))
      
      wrapper = createWrapper()
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.$message.error).toHaveBeenCalledWith('加载通知列表失败')
    })
  })

  describe('搜索和筛选功能', () => {
    it('应该正确设置搜索表单', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.searchForm).toEqual({
        title: '',
        type: '',
        status: ''
      })
    })

    it('应该处理搜索操作', async () => {
      wrapper = createWrapper()
      
      wrapper.vm.searchForm.title = '测试'
      await wrapper.vm.handleSearch()
      
      expect(wrapper.vm.pagination.currentPage).toBe(1)
      
      const { getNotifications } = require('@/api/activity-center')
      expect(getNotifications).toHaveBeenCalledWith({
        title: '测试',
        type: '',
        status: '',
        page: 1,
        pageSize: 10
      })
    })

    it('应该处理重置操作', async () => {
      wrapper = createWrapper()
      
      // 先设置一些值
      wrapper.vm.searchForm.title = '测试'
      wrapper.vm.searchForm.type = 'activity_reminder'
      wrapper.vm.searchForm.status = 'sent'
      
      await wrapper.vm.handleReset()
      
      expect(wrapper.vm.searchForm).toEqual({
        title: '',
        type: '',
        status: ''
      })
    })

    it('应该在重置后重新加载数据', async () => {
      wrapper = createWrapper()
      
      const { getNotifications } = require('@/api/activity-center')
      
      await wrapper.vm.handleReset()
      
      expect(getNotifications).toHaveBeenCalledWith({
        title: '',
        type: '',
        status: '',
        page: 1,
        pageSize: 10
      })
    })
  })

  describe('分页功能', () => {
    it('应该正确处理页码变化', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.handlePageChange(2)
      
      expect(wrapper.vm.pagination.currentPage).toBe(2)
      
      const { getNotifications } = require('@/api/activity-center')
      expect(getNotifications).toHaveBeenCalledWith({
        title: '',
        type: '',
        status: '',
        page: 2,
        pageSize: 10
      })
    })

    it('应该正确处理页大小变化', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.handleSizeChange(20)
      
      expect(wrapper.vm.pagination.pageSize).toBe(20)
      expect(wrapper.vm.pagination.currentPage).toBe(1)
      
      const { getNotifications } = require('@/api/activity-center')
      expect(getNotifications).toHaveBeenCalledWith({
        title: '',
        type: '',
        status: '',
        page: 1,
        pageSize: 20
      })
    })
  })

  describe('对话框管理', () => {
    it('应该正确管理发送通知对话框', async () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.sendDialogVisible).toBe(false)
      
      await wrapper.vm.handleSendNotification()
      
      expect(wrapper.vm.sendDialogVisible).toBe(true)
      expect(wrapper.vm.editingNotification).toBe(null)
    })

    it('应该正确管理模板管理对话框', async () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.templateDialogVisible).toBe(false)
      
      await wrapper.vm.handleManageTemplates()
      
      expect(wrapper.vm.templateDialogVisible).toBe(true)
    })

    it('应该正确管理通知设置对话框', async () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.settingsDialogVisible).toBe(false)
      
      await wrapper.vm.handleSettings()
      
      expect(wrapper.vm.settingsDialogVisible).toBe(true)
    })

    it('应该正确管理通知详情对话框', async () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.detailDialogVisible).toBe(false)
      
      const notification = mockNotifications[0]
      await wrapper.vm.handleView(notification)
      
      expect(wrapper.vm.detailDialogVisible).toBe(true)
      expect(wrapper.vm.selectedNotification).toEqual(notification)
    })
  })

  describe('通知操作', () => {
    it('应该处理发送操作（用户确认）', async () => {
      const { ElMessageBox } = await import('element-plus')
      ElMessageBox.confirm.mockResolvedValueOnce(true)
      
      wrapper = createWrapper()
      
      const notification = mockNotifications[1] // pending 状态
      await wrapper.vm.handleSend(notification)
      
      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        `确定要发送通知 "${notification.title}" 吗？`,
        '发送确认',
        { type: 'warning' }
      )
      
      expect(wrapper.vm.$message.success).toHaveBeenCalledWith('通知发送成功')
    })

    it('应该处理发送操作（用户取消）', async () => {
      const { ElMessageBox } = await import('element-plus')
      ElMessageBox.confirm.mockRejectedValueOnce('cancel')
      
      wrapper = createWrapper()
      
      const notification = mockNotifications[1]
      await wrapper.vm.handleSend(notification)
      
      expect(ElMessageBox.confirm).toHaveBeenCalled()
      expect(wrapper.vm.$message.success).not.toHaveBeenCalled()
    })

    it('应该处理编辑操作', async () => {
      wrapper = createWrapper()
      
      const notification = mockNotifications[1]
      await wrapper.vm.handleEdit(notification)
      
      expect(wrapper.vm.sendDialogVisible).toBe(true)
      expect(wrapper.vm.editingNotification).toEqual(notification)
    })

    it('应该处理复制操作', async () => {
      wrapper = createWrapper()
      
      const notification = mockNotifications[0]
      await wrapper.vm.handleDuplicate(notification)
      
      expect(wrapper.vm.sendDialogVisible).toBe(true)
      expect(wrapper.vm.editingNotification).toEqual({
        ...notification,
        id: '',
        title: `${notification.title} - 副本`
      })
    })

    it('应该处理查看统计操作', async () => {
      wrapper = createWrapper()
      
      const notification = mockNotifications[0]
      await wrapper.vm.handleViewStats(notification)
      
      expect(wrapper.vm.$message.info).toHaveBeenCalledWith('查看统计功能开发中...')
    })

    it('应该处理删除操作（用户确认）', async () => {
      const { ElMessageBox } = await import('element-plus')
      ElMessageBox.confirm.mockResolvedValueOnce(true)
      
      wrapper = createWrapper()
      
      const notification = mockNotifications[0]
      await wrapper.vm.handleDelete(notification)
      
      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        `确定要删除通知 "${notification.title}" 吗？`,
        '删除确认',
        { type: 'warning' }
      )
      
      expect(wrapper.vm.$message.success).toHaveBeenCalledWith('删除成功')
    })

    it('应该处理删除操作（用户取消）', async () => {
      const { ElMessageBox } = await import('element-plus')
      ElMessageBox.confirm.mockRejectedValueOnce('cancel')
      
      wrapper = createWrapper()
      
      const notification = mockNotifications[0]
      await wrapper.vm.handleDelete(notification)
      
      expect(ElMessageBox.confirm).toHaveBeenCalled()
      expect(wrapper.vm.$message.success).not.toHaveBeenCalled()
    })

    it('应该处理查看活动操作', async () => {
      wrapper = createWrapper()
      
      const notification = mockNotifications[0]
      await wrapper.vm.handleViewActivity(notification.activityId)
      
      expect(mockPush).toHaveBeenCalledWith(`/activity/detail/${notification.activityId}`)
    })
  })

  describe('表单提交处理', () => {
    it('应该处理通知表单提交', async () => {
      wrapper = createWrapper()
      
      const formData = {
        title: '测试通知',
        type: 'activity_reminder',
        content: '测试内容'
      }
      
      await wrapper.vm.handleSubmitNotification(formData)
      
      const { sendActivityNotification } = require('@/api/activity-center')
      expect(sendActivityNotification).toHaveBeenCalledWith(formData)
      
      expect(wrapper.vm.$message.success).toHaveBeenCalledWith('通知创建成功')
      expect(wrapper.vm.sendDialogVisible).toBe(false)
    })

    it('应该处理表单提交失败', async () => {
      const { sendActivityNotification } = require('@/api/activity-center')
      sendActivityNotification.mockRejectedValueOnce(new Error('创建失败'))
      
      wrapper = createWrapper()
      
      const formData = {
        title: '测试通知',
        type: 'activity_reminder',
        content: '测试内容'
      }
      
      await wrapper.vm.handleSubmitNotification(formData)
      
      expect(wrapper.vm.$message.error).toHaveBeenCalledWith('创建失败')
      expect(wrapper.vm.sendDialogVisible).toBe(true) // 对话框应该保持打开
    })
  })

  describe('模板使用处理', () => {
    it('应该处理使用模板操作', async () => {
      wrapper = createWrapper()
      
      const template = {
        type: 'activity_reminder',
        title: '活动提醒模板',
        content: '模板内容'
      }
      
      await wrapper.vm.handleUseTemplate(template)
      
      expect(wrapper.vm.editingNotification).toEqual({
        id: '',
        type: template.type,
        title: template.title,
        content: template.content,
        activityId: '',
        activityTitle: '',
        recipients: 0,
        sentAt: '',
        status: 'pending'
      })
      
      expect(wrapper.vm.templateDialogVisible).toBe(false)
      expect(wrapper.vm.sendDialogVisible).toBe(true)
    })
  })

  describe('表格插槽功能', () => {
    it('应该正确渲染通知类型插槽', async () => {
      wrapper = createWrapper()
      
      wrapper.vm.notificationList = mockNotifications
      await wrapper.vm.$nextTick()
      
      const table = wrapper.findComponent(DataTable)
      const typeSlot = table.find('.notification-type')
      
      expect(typeSlot.exists()).toBe(true)
    })

    it('应该正确渲染通知内容插槽', async () => {
      wrapper = createWrapper()
      
      wrapper.vm.notificationList = mockNotifications
      await wrapper.vm.$nextTick()
      
      const table = wrapper.findComponent(DataTable)
      const contentSlot = table.find('.notification-content')
      
      expect(contentSlot.exists()).toBe(true)
    })

    it('应该正确渲染关联活动插槽', async () => {
      wrapper = createWrapper()
      
      wrapper.vm.notificationList = mockNotifications
      await wrapper.vm.$nextTick()
      
      const table = wrapper.findComponent(DataTable)
      const activitySlot = table.find('.activity-link')
      
      expect(activitySlot.exists()).toBe(true)
    })

    it('应该正确渲染发送状态插槽', async () => {
      wrapper = createWrapper()
      
      wrapper.vm.notificationList = mockNotifications
      await wrapper.vm.$nextTick()
      
      const table = wrapper.findComponent(DataTable)
      const statusSlot = table.find('.status')
      
      expect(statusSlot.exists()).toBe(true)
    })

    it('应该正确渲染接收人数插槽', async () => {
      wrapper = createWrapper()
      
      wrapper.vm.notificationList = mockNotifications
      await wrapper.vm.$nextTick()
      
      const table = wrapper.findComponent(DataTable)
      const recipientsSlot = table.find('.recipients-info')
      
      expect(recipientsSlot.exists()).toBe(true)
    })

    it('应该正确渲染发送时间插槽', async () => {
      wrapper = createWrapper()
      
      wrapper.vm.notificationList = mockNotifications
      await wrapper.vm.$nextTick()
      
      const table = wrapper.findComponent(DataTable)
      const timeSlot = table.find('.time-info')
      
      expect(timeSlot.exists()).toBe(true)
    })

    it('应该正确渲染操作插槽', async () => {
      wrapper = createWrapper()
      
      wrapper.vm.notificationList = mockNotifications
      await wrapper.vm.$nextTick()
      
      const table = wrapper.findComponent(DataTable)
      const actionsSlot = table.find('.action-buttons')
      
      expect(actionsSlot.exists()).toBe(true)
    })
  })

  describe('工具函数', () => {
    it('应该正确获取通知类型标签', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getTypeLabel('activity_reminder')).toBe('活动提醒')
      expect(wrapper.vm.getTypeLabel('registration_confirm')).toBe('报名确认')
      expect(wrapper.vm.getTypeLabel('activity_change')).toBe('活动变更')
      expect(wrapper.vm.getTypeLabel('activity_cancel')).toBe('活动取消')
      expect(wrapper.vm.getTypeLabel('system_notice')).toBe('系统通知')
      expect(wrapper.vm.getTypeLabel('unknown')).toBe('unknown')
    })

    it('应该正确获取通知类型标签类型', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getTypeTagType('activity_reminder')).toBe('primary')
      expect(wrapper.vm.getTypeTagType('registration_confirm')).toBe('success')
      expect(wrapper.vm.getTypeTagType('activity_change')).toBe('warning')
      expect(wrapper.vm.getTypeTagType('activity_cancel')).toBe('danger')
      expect(wrapper.vm.getTypeTagType('system_notice')).toBe('info')
      expect(wrapper.vm.getTypeTagType('unknown')).toBe('info')
    })

    it('应该正确获取状态标签', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getStatusLabel('pending')).toBe('待发送')
      expect(wrapper.vm.getStatusLabel('sending')).toBe('发送中')
      expect(wrapper.vm.getStatusLabel('sent')).toBe('已发送')
      expect(wrapper.vm.getStatusLabel('failed')).toBe('发送失败')
      expect(wrapper.vm.getStatusLabel('unknown')).toBe('unknown')
    })

    it('应该正确获取状态标签类型', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getStatusTagType('pending')).toBe('warning')
      expect(wrapper.vm.getStatusTagType('sending')).toBe('primary')
      expect(wrapper.vm.getStatusTagType('sent')).toBe('success')
      expect(wrapper.vm.getStatusTagType('failed')).toBe('danger')
      expect(wrapper.vm.getStatusTagType('unknown')).toBe('info')
    })

    it('应该正确获取内容预览', () => {
      wrapper = createWrapper()
      
      const shortContent = '短内容'
      expect(wrapper.vm.getContentPreview(shortContent)).toBe(shortContent)
      
      const longContent = '这是一个非常长的通知内容，用来测试预览功能是否正常工作，超过50个字符的部分应该被截断并显示省略号。'
      const preview = wrapper.vm.getContentPreview(longContent)
      expect(preview.length).toBe(53) // 50个字符 + "..."
      expect(preview.endsWith('...')).toBe(true)
    })

    it('应该正确格式化日期', () => {
      wrapper = createWrapper()
      
      const dateStr = '2024-03-01T10:00:00Z'
      const formatted = wrapper.vm.formatDate(dateStr)
      
      expect(formatted).toBeDefined()
      expect(typeof formatted).toBe('string')
      expect(formatted).toContain('2024')
    })

    it('应该正确格式化时间', () => {
      wrapper = createWrapper()
      
      const dateTime = '2024-03-01T10:30:00Z'
      const formatted = wrapper.vm.formatTime(dateTime)
      
      expect(formatted).toBeDefined()
      expect(typeof formatted).toBe('string')
    })
  })

  describe('边界条件测试', () => {
    it('应该处理空的通知列表', async () => {
      const { getNotifications } = require('@/api/activity-center')
      getNotifications.mockResolvedValueOnce({
        success: true,
        data: {
          items: [],
          total: 0
        }
      })
      
      wrapper = createWrapper()
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.notificationList).toEqual([])
      expect(wrapper.vm.pagination.total).toBe(0)
    })

    it('应该处理API错误', async () => {
      const { getNotifications } = require('@/api/activity-center')
      getNotifications.mockRejectedValueOnce(new Error('网络错误'))
      
      wrapper = createWrapper()
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.$message.error).toHaveBeenCalledWith('加载通知列表失败')
    })

    it('应该处理发送操作失败', async () => {
      const { ElMessageBox } = await import('element-plus')
      ElMessageBox.confirm.mockResolvedValueOnce(true)
      
      wrapper = createWrapper()
      
      // 模拟发送操作中的错误
      const originalConsoleError = console.error
      console.error = vi.fn()
      
      const notification = mockNotifications[1]
      await wrapper.vm.handleSend(notification)
      
      expect(console.error).toHaveBeenCalled()
      
      console.error = originalConsoleError
    })

    it('应该处理特殊字符的通知内容', () => {
      wrapper = createWrapper()
      
      const specialContent = '通知内容包含特殊字符：& < > " \' 和表情符号 😊'
      const preview = wrapper.vm.getContentPreview(specialContent)
      
      expect(preview).toBeDefined()
      expect(typeof preview).toBe('string')
    })

    it('应该处理空的内容预览', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getContentPreview('')).toBe('')
      expect(wrapper.vm.getContentPreview(undefined)).toBe('')
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

    it('应该正确处理大量通知数据', async () => {
      const largeNotificationList = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        type: ['activity_reminder', 'registration_confirm', 'system_notice'][i % 3],
        title: `通知标题${i}`,
        content: `通知内容${i}`,
        activityId: `${i}`,
        activityTitle: `活动${i}`,
        recipients: Math.floor(Math.random() * 1000),
        sentAt: new Date().toISOString(),
        status: ['pending', 'sending', 'sent', 'failed'][i % 4]
      }))
      
      const { getNotifications } = require('@/api/activity-center')
      getNotifications.mockResolvedValueOnce({
        success: true,
        data: {
          items: largeNotificationList,
          total: 100
        }
      })
      
      wrapper = createWrapper()
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.notificationList).toHaveLength(100)
      
      // 测试渲染性能
      const startTime = performance.now()
      await wrapper.vm.$nextTick()
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(50) // 重新渲染时间应该小于 50ms
    })
  })
})