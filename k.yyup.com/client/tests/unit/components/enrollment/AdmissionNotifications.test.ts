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
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import { nextTick } from 'vue'

// Mock Element Plus
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      error: vi.fn(),
      success: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn().mockResolvedValue('confirm')
    },
    ElCard: {
      name: 'ElCard',
      template: '<div class="el-card"><slot /></div>'
    },
    ElTable: {
      name: 'ElTable',
      template: '<div class="el-table"><slot /></div>'
    },
    ElTableColumn: {
      name: 'ElTableColumn',
      template: '<div class="el-table-column"><slot /></div>'
    },
    ElButton: {
      name: 'ElButton',
      template: '<button class="el-button" @click="$emit(\'click\')"><slot /></button>',
      emits: ['click']
    },
    ElForm: {
      name: 'ElForm',
      template: '<form class="el-form"><slot /></form>'
    },
    ElFormItem: {
      name: 'ElFormItem',
      template: '<div class="el-form-item"><slot /></div>'
    },
    ElInput: {
      name: 'ElInput',
      template: '<input class="el-input" @input="$emit(\'update:modelValue\', $event.target.value)" />',
      emits: ['update:modelValue']
    },
    ElSelect: {
      name: 'ElSelect',
      template: '<div class="el-select"><slot /></div>'
    },
    ElOption: {
      name: 'ElOption',
      template: '<div class="el-option" />'
    },
    ElDatePicker: {
      name: 'ElDatePicker',
      template: '<div class="el-date-picker" />'
    },
    ElDialog: {
      name: 'ElDialog',
      template: '<div class="el-dialog"><slot /></div>'
    },
    ElTag: {
      name: 'ElTag',
      template: '<span class="el-tag"><slot /></span>'
    },
    ElProgress: {
      name: 'ElProgress',
      template: '<div class="el-progress" />'
    }
  }
})

// Mock API calls
vi.mock('@/utils/request', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))

import AdmissionNotifications from '@/components/enrollment/AdmissionNotifications.vue'

describe('AdmissionNotifications Component', () => {
  let router: any
  let pinia: any
  let wrapper: any

  beforeEach(async () => {
    vi.clearAllMocks()
    
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/enrollment', component: { template: '<div>Enrollment</div>' } }
      ]
    })
    pinia = createPinia()
    
    await router.push('/')
    await router.isReady()
  })

  describe('Component Initialization', () => {
    it('should render correctly with default props', async () => {
      wrapper = mount(AdmissionNotifications, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await nextTick()
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.admission-notifications').exists()).toBe(true)
    })

    it('should initialize with default data', async () => {
      wrapper = mount(AdmissionNotifications, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await nextTick()
      expect(wrapper.vm.notifications).toEqual([])
      expect(wrapper.vm.loading).toBe(false)
      expect(wrapper.vm.selectedStatus).toBe('all')
    })
  })

  describe('Notification Loading', () => {
    it('should load admission notifications', async () => {
      const mockNotifications = [
        {
          id: 1,
          studentName: '张小明',
          applicationId: 1001,
          status: '已发送',
          sentAt: '2024-01-15T10:30:00Z',
          deliveryMethod: 'email',
          parentEmail: 'zhang@example.com',
          parentPhone: '13900139001',
          admissionDate: '2024-02-01',
          assignedClass: '小班A班',
          templateUsed: 'standard_admission',
          trackingNumber: 'ADM2024001'
        },
        {
          id: 2,
          studentName: '李小红',
          applicationId: 1002,
          status: '待发送',
          sentAt: null,
          deliveryMethod: 'sms',
          parentEmail: 'li@example.com',
          parentPhone: '13900139002',
          admissionDate: '2024-02-01',
          assignedClass: '中班B班',
          templateUsed: 'standard_admission',
          trackingNumber: 'ADM2024002'
        }
      ]

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockNotifications,
        message: 'success'
      })

      wrapper = mount(AdmissionNotifications, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadNotifications()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/enrollment/notifications')
      expect(wrapper.vm.notifications).toEqual(mockNotifications)
    })

    it('should load notifications with filters', async () => {
      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: [],
        message: 'success'
      })

      wrapper = mount(AdmissionNotifications, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.setData({ selectedStatus: '已发送' })
      await wrapper.vm.loadNotifications()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/enrollment/notifications?status=已发送')
    })
  })

  describe('Notification Sending', () => {
    it('should send admission notification', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: { notificationId: 3, status: '已发送' },
        message: 'success'
      })

      wrapper = mount(AdmissionNotifications, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.sendNotification(2)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/enrollment/notifications/2/send')
      expect(wrapper.vm.notifications[1].status).toBe('已发送')
    })

    it('should send batch notifications', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: { sentCount: 5, failedCount: 0 },
        message: 'success'
      })

      wrapper = mount(AdmissionNotifications, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.sendBatchNotifications([1, 2, 3])
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/enrollment/notifications/batch-send', {
        notificationIds: [1, 2, 3]
      })
    })

    it('should validate notification before sending', async () => {
      wrapper = mount(AdmissionNotifications, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      wrapper.vm.notifications = [
        {
          id: 1,
          studentName: '测试学生',
          parentEmail: '', // Missing email
          parentPhone: '', // Missing phone
          status: '待发送'
        }
      ]

      await wrapper.vm.sendNotification(1)
      await nextTick()

      expect(wrapper.vm.error).toContain('联系信息不完整')
    })
  })

  describe('Notification Templates', () => {
    it('should load notification templates', async () => {
      const mockTemplates = [
        {
          id: 1,
          name: '标准录取通知',
          type: 'standard_admission',
          subject: '恭喜您的孩子被录取！',
          content: '尊敬的家长，我们很高兴通知您...',
          variables: ['studentName', 'className', 'admissionDate'],
          isDefault: true
        },
        {
          id: 2,
          name: '等待名单通知',
          type: 'waitlist',
          subject: '您的孩子已被列入等待名单',
          content: '尊敬的家长，感谢您的申请...',
          variables: ['studentName', 'position', 'estimatedTime'],
          isDefault: false
        }
      ]

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockTemplates,
        message: 'success'
      })

      wrapper = mount(AdmissionNotifications, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadTemplates()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/enrollment/notification-templates')
      expect(wrapper.vm.templates).toEqual(mockTemplates)
    })

    it('should preview notification with template', async () => {
      wrapper = mount(AdmissionNotifications, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const notification = {
        studentName: '张小明',
        className: '小班A班',
        admissionDate: '2024-02-01'
      }

      const template = {
        subject: '恭喜{studentName}被录取！',
        content: '尊敬的家长，{studentName}已被{className}录取，入学日期：{admissionDate}'
      }

      await wrapper.vm.previewNotification(notification, template)
      await nextTick()

      expect(wrapper.vm.previewData.subject).toBe('恭喜张小明被录取！')
      expect(wrapper.vm.previewData.content).toContain('张小明')
      expect(wrapper.vm.previewData.content).toContain('小班A班')
    })
  })

  describe('Notification Tracking', () => {
    it('should track notification delivery status', async () => {
      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: {
          delivered: true,
          openedAt: '2024-01-15T11:00:00Z',
          clickedAt: '2024-01-15T11:30:00Z',
          deliveryMethod: 'email'
        },
        message: 'success'
      })

      wrapper = mount(AdmissionNotifications, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.trackNotification(1)
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/enrollment/notifications/1/tracking')
      expect(wrapper.vm.trackingData).toBeDefined()
      expect(wrapper.vm.trackingData.delivered).toBe(true)
    })

    it('should handle notification bounce events', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: { status: 'bounce', reason: 'invalid_email' },
        message: 'success'
      })

      wrapper = mount(AdmissionNotifications, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.handleBounceEvent(1, 'invalid_email')
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/enrollment/notifications/1/bounce', {
        reason: 'invalid_email'
      })
    })
  })

  describe('Notification Statistics', () => {
    it('should calculate notification statistics', async () => {
      wrapper = mount(AdmissionNotifications, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      wrapper.vm.notifications = [
        { status: '已发送', deliveryMethod: 'email' },
        { status: '已发送', deliveryMethod: 'sms' },
        { status: '待发送', deliveryMethod: 'email' },
        { status: '已退回', deliveryMethod: 'email' },
        { status: '已送达', deliveryMethod: 'sms' }
      ]

      await wrapper.vm.calculateStatistics()
      await nextTick()

      expect(wrapper.vm.statistics).toBeDefined()
      expect(wrapper.vm.statistics.total).toBe(5)
      expect(wrapper.vm.statistics.sent).toBe(2)
      expect(wrapper.vm.statistics.pending).toBe(1)
      expect(wrapper.vm.statistics.bounced).toBe(1)
      expect(wrapper.vm.statistics.delivered).toBe(1)
    })

    it('should generate notification report', async () => {
      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: {
          totalNotifications: 100,
          sentNotifications: 85,
          deliveredNotifications: 80,
          openedNotifications: 75,
          clickRate: 0.6,
          bounceRate: 0.05,
          byMethod: {
            email: { total: 60, delivered: 55, opened: 50 },
            sms: { total: 40, delivered: 38, opened: 25 }
          }
        },
        message: 'success'
      })

      wrapper = mount(AdmissionNotifications, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.generateReport()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/enrollment/notifications/report')
      expect(wrapper.vm.reportData).toBeDefined()
      expect(wrapper.vm.reportData.totalNotifications).toBe(100)
    })
  })

  describe('Notification Resend', () => {
    it('should resend failed notifications', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: { status: 'resent', newTrackingNumber: 'ADM2024001-RESEND' },
        message: 'success'
      })

      wrapper = mount(AdmissionNotifications, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.resendNotification(1)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/enrollment/notifications/1/resend')
      expect(wrapper.vm.notifications[0].status).toBe('已发送')
    })

    it('should validate resend conditions', async () => {
      wrapper = mount(AdmissionNotifications, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      wrapper.vm.notifications = [
        { id: 1, status: '已发送' }, // Already sent
        { id: 2, status: '已送达' }  // Already delivered
      ]

      await wrapper.vm.resendNotification(1)
      await nextTick()

      expect(wrapper.vm.error).toContain('无法重发已成功发送的通知')
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const { get } = await import('@/utils/request')
      get.mockRejectedValue(new Error('Network error'))

      wrapper = mount(AdmissionNotifications, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadNotifications()
      await nextTick()

      expect(wrapper.vm.error).toBe('Network error')
      expect(wrapper.vm.loading).toBe(false)
    })

    it('should handle empty notification list', async () => {
      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: [],
        message: 'success'
      })

      wrapper = mount(AdmissionNotifications, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadNotifications()
      await nextTick()

      expect(wrapper.vm.notifications).toEqual([])
      expect(wrapper.vm.statistics.total).toBe(0)
    })
  })

  describe('User Interactions', () => {
    it('should handle status filter change', async () => {
      wrapper = mount(AdmissionNotifications, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true,
            'el-select': {
              template: '<select @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
              emits: ['update:modelValue']
            }
          }
        }
      })

      await wrapper.setData({ selectedStatus: '已退回' })
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.selectedStatus).toBe('已退回')
    })

    it('should handle refresh functionality', async () => {
      wrapper = mount(AdmissionNotifications, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': {
              template: '<button class="el-button" @click="$emit(\'click\')"><slot /></button>',
              emits: ['click']
            }
          }
        }
      })

      const refreshSpy = vi.spyOn(wrapper.vm, 'loadNotifications')
      await wrapper.find('.refresh-btn').trigger('click')

      expect(refreshSpy).toHaveBeenCalled()
    })
  })

  describe('Performance Monitoring', () => {
    it('should track data loading performance', async () => {
      wrapper = mount(AdmissionNotifications, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const startTime = Date.now()
      await wrapper.vm.loadNotifications()
      const endTime = Date.now()

      expect(wrapper.vm.loadingTime).toBeDefined()
      expect(wrapper.vm.loadingTime).toBeGreaterThan(0)
    })

    it('should monitor batch send performance', async () => {
      wrapper = mount(AdmissionNotifications, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const startTime = Date.now()
      await wrapper.vm.sendBatchNotifications([1, 2, 3])
      const endTime = Date.now()

      expect(wrapper.vm.batchSendTime).toBeDefined()
      expect(wrapper.vm.batchSendTime).toBeGreaterThan(0)
    })
  })
})