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
    ElProgress: {
      name: 'ElProgress',
      template: '<div class="el-progress" />'
    },
    ElDialog: {
      name: 'ElDialog',
      template: '<div class="el-dialog"><slot /></div>'
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

import AdmissionNotification from '@/components/enrollment/AdmissionNotification.vue'

describe('AdmissionNotification Component', () => {
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
      wrapper = mount(AdmissionNotification, {
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
      expect(wrapper.find('.admission-notification').exists()).toBe(true)
    })

    it('should initialize with default data', async () => {
      wrapper = mount(AdmissionNotification, {
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
      expect(wrapper.vm.notificationTemplates).toEqual([])
      expect(wrapper.vm.loading).toBe(false)
      expect(wrapper.vm.selectedTemplate).toBe('')
    })
  })

  describe('Notification Template Generation', () => {
    it('should load notification templates', async () => {
      const mockTemplates = [
        {
          id: 1,
          name: '录取通知模板',
          type: 'admission',
          content: '恭喜您的孩子被录取！',
          variables: ['studentName', 'className', 'startDate']
        },
        {
          id: 2,
          name: '面试通知模板',
          type: 'interview',
          content: '面试时间已安排',
          variables: ['studentName', 'interviewTime', 'interviewLocation']
        }
      ]

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockTemplates,
        message: 'success'
      })

      wrapper = mount(AdmissionNotification, {
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
      expect(wrapper.vm.notificationTemplates).toEqual(mockTemplates)
    })

    it('should create new notification template', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 201,
        data: { id: 3, name: '新模板' },
        message: 'success'
      })

      wrapper = mount(AdmissionNotification, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const newTemplate = {
        name: '新模板',
        type: 'admission',
        content: '模板内容',
        variables: ['studentName']
      }

      await wrapper.vm.createTemplate(newTemplate)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/enrollment/notification-templates', newTemplate)
    })

    it('should validate template variables', async () => {
      wrapper = mount(AdmissionNotification, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const template = {
        content: '恭喜{studentName}被录取到{className}，开学日期为{startDate}',
        variables: ['studentName', 'className', 'startDate']
      }

      const isValid = await wrapper.vm.validateTemplateVariables(template)
      await nextTick()

      expect(isValid).toBe(true)
    })

    it('should detect missing variables in template', async () => {
      wrapper = mount(AdmissionNotification, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const template = {
        content: '恭喜{studentName}被录取到{className}，开学日期为{startDate}',
        variables: ['studentName', 'className'] // Missing startDate
      }

      const isValid = await wrapper.vm.validateTemplateVariables(template)
      await nextTick()

      expect(isValid).toBe(false)
      expect(wrapper.vm.error).toContain('缺少变量')
    })
  })

  describe('Bulk Notification Sending', () => {
    it('should send bulk notifications to parents', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: {
          sentCount: 50,
          failedCount: 2,
          failedItems: ['parent3@example.com', 'parent5@example.com']
        },
        message: 'success'
      })

      wrapper = mount(AdmissionNotification, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const bulkData = {
        templateId: 1,
        parentIds: [1, 2, 3, 4, 5],
        sendMethod: 'email',
        scheduledTime: new Date().toISOString()
      }

      await wrapper.vm.sendBulkNotifications(bulkData)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/enrollment/notifications/bulk-send', bulkData)
      expect(wrapper.vm.bulkSendResult).toBeDefined()
      expect(wrapper.vm.bulkSendResult.sentCount).toBe(50)
    })

    it('should handle bulk send failures gracefully', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: {
          sentCount: 3,
          failedCount: 2,
          failedItems: ['parent3@example.com', 'parent5@example.com']
        },
        message: 'success'
      })

      wrapper = mount(AdmissionNotification, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const bulkData = {
        templateId: 1,
        parentIds: [1, 2, 3, 4, 5],
        sendMethod: 'email'
      }

      await wrapper.vm.sendBulkNotifications(bulkData)
      await nextTick()

      expect(wrapper.vm.bulkSendResult.failedCount).toBe(2)
      expect(wrapper.vm.bulkSendResult.failedItems.length).toBe(2)
    })

    it('should validate bulk send parameters', async () => {
      wrapper = mount(AdmissionNotification, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const invalidData = {
        templateId: 999, // Non-existent template
        parentIds: [],
        sendMethod: 'invalid_method'
      }

      await wrapper.vm.validateBulkSendParams(invalidData)
      await nextTick()

      expect(wrapper.vm.error).toContain('参数验证失败')
    })
  })

  describe('Multi-channel Delivery', () => {
    it('should send notifications via multiple channels', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: {
          emailSent: true,
          smsSent: true,
          wechatSent: true,
          inAppSent: true
        },
        message: 'success'
      })

      wrapper = mount(AdmissionNotification, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const multiChannelData = {
        templateId: 1,
        parentId: 1,
        channels: ['email', 'sms', 'wechat', 'inApp']
      }

      await wrapper.vm.sendMultiChannelNotification(multiChannelData)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/enrollment/notifications/multi-channel', multiChannelData)
      expect(wrapper.vm.multiChannelResult).toBeDefined()
      expect(wrapper.vm.multiChannelResult.emailSent).toBe(true)
    })

    it('should handle channel-specific failures', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: {
          emailSent: true,
          smsSent: false,
          wechatSent: true,
          inAppSent: false,
          failures: {
            sms: '手机号码无效',
            inApp: '用户未安装应用'
          }
        },
        message: 'success'
      })

      wrapper = mount(AdmissionNotification, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const multiChannelData = {
        templateId: 1,
        parentId: 1,
        channels: ['email', 'sms', 'wechat', 'inApp']
      }

      await wrapper.vm.sendMultiChannelNotification(multiChannelData)
      await nextTick()

      expect(wrapper.vm.multiChannelResult.smsSent).toBe(false)
      expect(wrapper.vm.multiChannelResult.inAppSent).toBe(false)
      expect(wrapper.vm.multiChannelResult.failures).toBeDefined()
    })

    it('should prioritize channels based on parent preferences', async () => {
      wrapper = mount(AdmissionNotification, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const parentPreferences = {
        parentId: 1,
        preferredChannels: ['wechat', 'email'],
        fallbackChannels: ['sms']
      }

      const prioritizedChannels = await wrapper.vm.prioritizeChannels(parentPreferences)
      await nextTick()

      expect(prioritizedChannels).toEqual(['wechat', 'email', 'sms'])
    })
  })

  describe('Parent Response Management', () => {
    it('should track parent notification responses', async () => {
      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: [
          {
            id: 1,
            parentId: 1,
            notificationId: 1,
            response: 'accepted',
            responseTime: '2024-01-15T10:30:00Z',
            comments: '感谢通知，我们会按时到校'
          },
          {
            id: 2,
            parentId: 2,
            notificationId: 1,
            response: 'declined',
            responseTime: '2024-01-15T11:45:00Z',
            comments: '因个人原因无法接受'
          }
        ],
        message: 'success'
      })

      wrapper = mount(AdmissionNotification, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadParentResponses(1)
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/enrollment/notifications/1/responses')
      expect(wrapper.vm.parentResponses).toBeDefined()
      expect(wrapper.vm.parentResponses.length).toBe(2)
    })

    it('should calculate response statistics', async () => {
      wrapper = mount(AdmissionNotification, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      wrapper.vm.parentResponses = [
        { response: 'accepted' },
        { response: 'accepted' },
        { response: 'declined' },
        { response: 'pending' },
        { response: 'accepted' }
      ]

      await wrapper.vm.calculateResponseStats()
      await nextTick()

      expect(wrapper.vm.responseStats).toBeDefined()
      expect(wrapper.vm.responseStats.accepted).toBe(3)
      expect(wrapper.vm.responseStats.declined).toBe(1)
      expect(wrapper.vm.responseStats.pending).toBe(1)
      expect(wrapper.vm.responseStats.acceptanceRate).toBe(60)
    })

    it('should send follow-up notifications to non-responders', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: {
          followUpSent: 5,
          followUpMethod: 'sms'
        },
        message: 'success'
      })

      wrapper = mount(AdmissionNotification, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const followUpData = {
        notificationId: 1,
        nonResponderIds: [3, 4, 5, 6, 7],
        followUpMethod: 'sms',
        message: '请及时回复录取通知'
      }

      await wrapper.vm.sendFollowUpNotifications(followUpData)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/enrollment/notifications/follow-up', followUpData)
      expect(wrapper.vm.followUpResult).toBeDefined()
      expect(wrapper.vm.followUpResult.followUpSent).toBe(5)
    })
  })

  describe('Notification Scheduling', () => {
    it('should schedule notifications for future delivery', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: {
          scheduledId: 1,
          scheduledTime: '2024-02-01T09:00:00Z',
          status: 'scheduled'
        },
        message: 'success'
      })

      wrapper = mount(AdmissionNotification, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const scheduleData = {
        templateId: 1,
        parentIds: [1, 2, 3],
        scheduledTime: '2024-02-01T09:00:00Z',
        timezone: 'Asia/Shanghai'
      }

      await wrapper.vm.scheduleNotification(scheduleData)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/enrollment/notifications/schedule', scheduleData)
      expect(wrapper.vm.scheduledResult).toBeDefined()
      expect(wrapper.vm.scheduledResult.status).toBe('scheduled')
    })

    it('should validate scheduled time', async () => {
      wrapper = mount(AdmissionNotification, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const invalidSchedule = {
        templateId: 1,
        parentIds: [1, 2, 3],
        scheduledTime: '2023-01-01T09:00:00Z' // Past time
      }

      const isValid = await wrapper.vm.validateScheduledTime(invalidSchedule.scheduledTime)
      await nextTick()

      expect(isValid).toBe(false)
      expect(wrapper.vm.error).toContain('预约时间必须在未来')
    })

    it('should list scheduled notifications', async () => {
      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: [
          {
            id: 1,
            templateName: '录取通知',
            scheduledTime: '2024-02-01T09:00:00Z',
            recipientCount: 50,
            status: 'scheduled'
          }
        ],
        message: 'success'
      })

      wrapper = mount(AdmissionNotification, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadScheduledNotifications()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/enrollment/notifications/scheduled')
      expect(wrapper.vm.scheduledNotifications).toBeDefined()
      expect(wrapper.vm.scheduledNotifications.length).toBe(1)
    })
  })

  describe('Notification History and Tracking', () => {
    it('should load notification history', async () => {
      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: [
          {
            id: 1,
            templateName: '录取通知',
            sentTime: '2024-01-15T10:00:00Z',
            recipientCount: 100,
            successRate: 95,
            channels: ['email', 'sms']
          }
        ],
        message: 'success'
      })

      wrapper = mount(AdmissionNotification, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadNotificationHistory()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/enrollment/notifications/history')
      expect(wrapper.vm.notificationHistory).toBeDefined()
      expect(wrapper.vm.notificationHistory.length).toBe(1)
    })

    it('should track notification delivery status', async () => {
      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: {
          notificationId: 1,
          totalRecipients: 100,
          delivered: 95,
          failed: 3,
          pending: 2,
          deliveryDetails: [
            { channel: 'email', delivered: 48, failed: 1, pending: 1 },
            { channel: 'sms', delivered: 47, failed: 2, pending: 1 }
          ]
        },
        message: 'success'
      })

      wrapper = mount(AdmissionNotification, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.trackNotificationDelivery(1)
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/enrollment/notifications/1/delivery-status')
      expect(wrapper.vm.deliveryStatus).toBeDefined()
      expect(wrapper.vm.deliveryStatus.totalRecipients).toBe(100)
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const { get } = await import('@/utils/request')
      get.mockRejectedValue(new Error('Network error'))

      wrapper = mount(AdmissionNotification, {
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

      expect(wrapper.vm.error).toBe('Network error')
      expect(wrapper.vm.loading).toBe(false)
    })

    it('should handle template validation errors', async () => {
      wrapper = mount(AdmissionNotification, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const invalidTemplate = {
        content: '',
        variables: []
      }

      await wrapper.vm.validateTemplate(invalidTemplate)
      await nextTick()

      expect(wrapper.vm.error).toContain('模板内容不能为空')
    })

    it('should handle notification send failures', async () => {
      const { post } = await import('@/utils/request')
      post.mockRejectedValue(new Error('Send failed'))

      wrapper = mount(AdmissionNotification, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const notificationData = {
        templateId: 1,
        parentId: 1
      }

      await wrapper.vm.sendNotification(notificationData)
      await nextTick()

      expect(wrapper.vm.error).toBe('Send failed')
    })
  })

  describe('User Interactions', () => {
    it('should handle template selection change', async () => {
      wrapper = mount(AdmissionNotification, {
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

      await wrapper.setData({ selectedTemplate: '1' })
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.selectedTemplate).toBe('1')
    })

    it('should trigger template preview on button click', async () => {
      wrapper = mount(AdmissionNotification, {
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

      const previewSpy = vi.spyOn(wrapper.vm, 'previewTemplate')
      await wrapper.find('.preview-btn').trigger('click')

      expect(previewSpy).toHaveBeenCalled()
    })

    it('should handle send button click', async () => {
      wrapper = mount(AdmissionNotification, {
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

      const sendSpy = vi.spyOn(wrapper.vm, 'sendNotification')
      await wrapper.find('.send-btn').trigger('click')

      expect(sendSpy).toHaveBeenCalled()
    })
  })

  describe('Performance Optimization', () => {
    it('should debounce template preview generation', async () => {
      wrapper = mount(AdmissionNotification, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const previewSpy = vi.spyOn(wrapper.vm, 'generatePreview')
      
      // Trigger multiple rapid changes
      await wrapper.setData({ templateContent: '内容1' })
      await wrapper.setData({ templateContent: '内容2' })
      await wrapper.setData({ templateContent: '内容3' })
      
      await nextTick()
      
      // Should only be called once due to debouncing
      expect(previewSpy).toHaveBeenCalledTimes(1)
    })

    it('should cache template data', async () => {
      wrapper = mount(AdmissionNotification, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const template = { id: 1, content: '测试内容' }
      
      // First call should cache
      await wrapper.vm.cacheTemplate(template)
      await nextTick()
      
      // Second call should use cache
      const cached = await wrapper.vm.getCachedTemplate(1)
      
      expect(cached).toEqual(template)
    })
  })
})