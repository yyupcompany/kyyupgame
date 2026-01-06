import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { VueWrapper } from '@vue/test-utils'
import NotificationDetail from '@/components/centers/activity/NotificationDetail.vue'
import { createComponentWrapper, waitForUpdate, createTestCleanup } from '../../../../utils/component-test-helper'

// 控制台错误检测变量
let consoleSpy: any

describe('NotificationDetail.vue', () => {
  let wrapper: VueWrapper<any>
  const cleanup = createTestCleanup()

  const mockNotification = {
    id: '1',
    title: '活动提醒通知',
    type: 'activity_reminder',
    content: '亲爱的家长，您报名的"春季亲子活动"将于明天上午10点开始，请准时参加。',
    priority: 'high',
    status: 'draft',
    sendMethods: ['system', 'sms'],
    recipients: ['all_parents', 'registered_parents'],
    sendTime: '2024-03-01T10:00:00Z',
    createdAt: '2024-02-28T15:00:00Z',
    stats: {
      totalSent: 150,
      delivered: 145,
      failed: 5,
      read: 120
    },
    logs: [
      {
        id: '1',
        action: '创建通知',
        details: '管理员创建了通知',
        operator: '张三',
        createdAt: '2024-02-28T15:00:00Z'
      },
      {
        id: '2',
        action: '编辑通知',
        details: '管理员修改了通知内容',
        operator: '张三',
        createdAt: '2024-02-28T16:00:00Z'
      }
    ]
  }

  const createWrapper = (props = {}) => {
    return createComponentWrapper(NotificationDetail, {
      props: {
        modelValue: true,
        data: mockNotification,
        ...props
      },
      withPinia: true,
      withRouter: false,
      global: {
        stubs: {
          'el-drawer': { template: '<div class="el-drawer"><slot /><slot name="footer" /></div>' },
          'el-tag': { template: '<span class="el-tag"><slot /></span>' },
          'el-timeline': { template: '<div class="el-timeline"><slot /></div>' },
          'el-timeline-item': { template: '<div class="el-timeline-item"><slot /></div>' },
          'el-button': { template: '<button class="el-button"><slot /></button>' },
          'el-descriptions': { template: '<div class="el-descriptions"><slot /></div>' },
          'el-descriptions-item': { template: '<div class="el-descriptions-item"><slot /></div>' }
        }
      }
    })
  }

  beforeEach(() => {
    wrapper = createWrapper()
    cleanup.addCleanup(() => wrapper?.unmount())
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  afterEach(() => {
    cleanup.cleanup()
    vi.clearAllMocks()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('组件渲染', () => {
    it('应该正确渲染通知详情抽屉', () => {
      expect(wrapper.find('.notification-detail, .el-drawer').exists()).toBe(true)
    })

    it('应该渲染基本信息区域', () => {
      const basicSection = wrapper.find('.detail-section, .basic-info')
      expect(basicSection.exists()).toBe(true)
    })

    it('应该渲染通知内容', () => {
      const content = wrapper.find('.notification-content, .content')
      expect(content.exists()).toBe(true)
    })
      expect(infoGrid.findAll('.info-item').length).toBe(4)
    })

    it('应该渲染通知内容区域', () => {
      wrapper = createWrapper()
      
      const contentSection = wrapper.findAll('.detail-section')[1]
      expect(contentSection.find('h3').text()).toBe('通知内容')
      
      const contentBox = contentSection.find('.content-box')
      expect(contentBox.text()).toBe(mockNotification.content)
    })

    it('应该渲染发送信息区域', () => {
      wrapper = createWrapper()
      
      const sendSection = wrapper.findAll('.detail-section')[2]
      expect(sendSection.find('h3').text()).toBe('发送信息')
      
      const infoGrid = sendSection.find('.info-grid')
      expect(infoGrid.findAll('.info-item').length).toBe(4)
    })

    it('应该渲染发送统计区域', () => {
      wrapper = createWrapper()
      
      const statsSection = wrapper.findAll('.detail-section')[3]
      expect(statsSection.find('h3').text()).toBe('发送统计')
      
      const statsGrid = statsSection.find('.stats-grid')
      expect(statsGrid.findAll('.stat-item').length).toBe(4)
    })

    it('应该渲染操作记录区域', () => {
      wrapper = createWrapper()
      
      const logsSection = wrapper.findAll('.detail-section')[4]
      expect(logsSection.find('h3').text()).toBe('操作记录')
      
      const timeline = logsSection.find('.el-timeline')
      expect(timeline.exists()).toBe(true)
    })

    it('应该渲染底部操作按钮', () => {
      wrapper = createWrapper()
      
      const footer = wrapper.find('.drawer-footer')
      expect(footer.exists()).toBe(true)
      
      const buttons = footer.findAll('.el-button')
      expect(buttons.length).toBe(2) // 关闭和发送按钮
    })
  })

  describe('数据显示', () => {
    it('应该正确显示基本信息', () => {
      wrapper = createWrapper()
      
      const basicSection = wrapper.findAll('.detail-section')[0]
      const infoItems = basicSection.findAll('.info-item')
      
      expect(infoItems[0].find('label').text()).toBe('通知标题：')
      expect(infoItems[0].find('span').text()).toBe(mockNotification.title)
      
      expect(infoItems[1].find('label').text()).toBe('通知类型：')
      const typeTag = infoItems[1].find('.el-tag')
      expect(typeTag.exists()).toBe(true)
      expect(typeTag.text()).toBe('活动提醒')
    })

    it('应该正确显示通知内容', () => {
      wrapper = createWrapper()
      
      const contentSection = wrapper.findAll('.detail-section')[1]
      const contentBox = contentSection.find('.content-box')
      
      expect(contentBox.text()).toBe(mockNotification.content)
    })

    it('应该正确显示发送方式', () => {
      wrapper = createWrapper()
      
      const sendSection = wrapper.findAll('.detail-section')[2]
      const sendMethodsItem = sendSection.findAll('.info-item')[0]
      const sendMethods = sendMethodsItem.find('.send-methods')
      
      expect(sendMethods.findAll('.el-tag').length).toBe(mockNotification.sendMethods.length)
    })

    it('应该正确显示接收对象', () => {
      wrapper = createWrapper()
      
      const sendSection = wrapper.findAll('.detail-section')[2]
      const recipientsItem = sendSection.findAll('.info-item')[1]
      const recipients = recipientsItem.find('.recipients')
      
      expect(recipients.findAll('.el-tag').length).toBe(mockNotification.recipients.length)
    })

    it('应该正确显示发送统计', () => {
      wrapper = createWrapper()
      
      const statsSection = wrapper.findAll('.detail-section')[3]
      const statItems = statsSection.findAll('.stat-item')
      
      expect(statItems[0].find('.stat-value').text()).toBe('150')
      expect(statItems[0].find('.stat-label').text()).toBe('总发送数')
      
      expect(statItems[1].find('.stat-value').text()).toBe('145')
      expect(statItems[1].find('.stat-label').text()).toBe('成功送达')
      
      expect(statItems[2].find('.stat-value').text()).toBe('5')
      expect(statItems[2].find('.stat-label').text()).toBe('发送失败')
      
      expect(statItems[3].find('.stat-value').text()).toBe('120')
      expect(statItems[3].find('.stat-label').text()).toBe('已读数量')
    })

    it('应该正确显示操作记录', () => {
      wrapper = createWrapper()
      
      const logsSection = wrapper.findAll('.detail-section')[4]
      const timelineItems = logsSection.findAll('.el-timeline-item')
      
      expect(timelineItems.length).toBe(mockNotification.logs.length)
      
      const firstLog = timelineItems[0]
      expect(firstLog.find('.log-action').text()).toBe(mockNotification.logs[0].action)
      expect(firstLog.find('.log-details').text()).toBe(mockNotification.logs[0].details)
      expect(firstLog.find('.log-operator').text()).toBe(`操作人：${mockNotification.logs[0].operator}`)
    })
  })

  describe('工具函数', () => {
    it('应该正确获取通知类型标签', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getTypeLabel('activity_reminder')).toBe('活动提醒')
      expect(wrapper.vm.getTypeLabel('registration_notice')).toBe('报名通知')
      expect(wrapper.vm.getTypeLabel('activity_cancel')).toBe('活动取消')
      expect(wrapper.vm.getTypeLabel('activity_change')).toBe('活动变更')
      expect(wrapper.vm.getTypeLabel('system_notice')).toBe('系统通知')
      expect(wrapper.vm.getTypeLabel('unknown')).toBe('unknown')
    })

    it('应该正确获取通知类型颜色', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getTypeColor('activity_reminder')).toBe('primary')
      expect(wrapper.vm.getTypeColor('registration_notice')).toBe('success')
      expect(wrapper.vm.getTypeColor('activity_cancel')).toBe('danger')
      expect(wrapper.vm.getTypeColor('activity_change')).toBe('warning')
      expect(wrapper.vm.getTypeColor('system_notice')).toBe('info')
      expect(wrapper.vm.getTypeColor('unknown')).toBe('info')
    })

    it('应该正确获取优先级标签', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getPriorityLabel('low')).toBe('低')
      expect(wrapper.vm.getPriorityLabel('medium')).toBe('中')
      expect(wrapper.vm.getPriorityLabel('high')).toBe('高')
      expect(wrapper.vm.getPriorityLabel('urgent')).toBe('紧急')
      expect(wrapper.vm.getPriorityLabel('unknown')).toBe('unknown')
    })

    it('应该正确获取优先级颜色', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getPriorityColor('low')).toBe('info')
      expect(wrapper.vm.getPriorityColor('medium')).toBe('primary')
      expect(wrapper.vm.getPriorityColor('high')).toBe('warning')
      expect(wrapper.vm.getPriorityColor('urgent')).toBe('danger')
      expect(wrapper.vm.getPriorityColor('unknown')).toBe('info')
    })

    it('应该正确获取状态标签', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getStatusLabel('draft')).toBe('草稿')
      expect(wrapper.vm.getStatusLabel('sending')).toBe('发送中')
      expect(wrapper.vm.getStatusLabel('sent')).toBe('已发送')
      expect(wrapper.vm.getStatusLabel('failed')).toBe('发送失败')
      expect(wrapper.vm.getStatusLabel('unknown')).toBe('unknown')
    })

    it('应该正确获取状态颜色', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getStatusColor('draft')).toBe('info')
      expect(wrapper.vm.getStatusColor('sending')).toBe('warning')
      expect(wrapper.vm.getStatusColor('sent')).toBe('success')
      expect(wrapper.vm.getStatusColor('failed')).toBe('danger')
      expect(wrapper.vm.getStatusColor('unknown')).toBe('info')
    })

    it('应该正确获取发送方式标签', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getSendMethodLabel('system')).toBe('站内消息')
      expect(wrapper.vm.getSendMethodLabel('sms')).toBe('短信通知')
      expect(wrapper.vm.getSendMethodLabel('email')).toBe('邮件通知')
      expect(wrapper.vm.getSendMethodLabel('wechat')).toBe('微信通知')
      expect(wrapper.vm.getSendMethodLabel('unknown')).toBe('unknown')
    })

    it('应该正确获取接收对象标签', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getRecipientLabel('all_parents')).toBe('所有家长')
      expect(wrapper.vm.getRecipientLabel('registered_parents')).toBe('已报名家长')
      expect(wrapper.vm.getRecipientLabel('pending_parents')).toBe('待审核家长')
      expect(wrapper.vm.getRecipientLabel('all_teachers')).toBe('所有教师')
      expect(wrapper.vm.getRecipientLabel('admins')).toBe('管理员')
      expect(wrapper.vm.getRecipientLabel('unknown')).toBe('unknown')
    })

    it('应该正确格式化日期时间', () => {
      wrapper = createWrapper()
      
      const dateTime = '2024-03-01T10:00:00Z'
      const formatted = wrapper.vm.formatDateTime(dateTime)
      
      expect(formatted).toBeDefined()
      expect(typeof formatted).toBe('string')
      expect(formatted).toContain('2024')
    })
  })

  describe('用户交互', () => {
    it('应该处理发送按钮点击', async () => {
      wrapper = createWrapper()
      
      const sendButton = wrapper.findAll('.el-button').find(btn => btn.text().includes('发送通知'))
      await sendButton.trigger('click')
      
      expect(wrapper.emitted('send')).toBeTruthy()
      expect(wrapper.emitted('send')[0]).toEqual([mockNotification.id])
    })

    it('应该处理重新发送按钮点击', async () => {
      wrapper = createWrapper({
        data: {
          ...mockNotification,
          status: 'sent'
        }
      })
      
      const resendButton = wrapper.findAll('.el-button').find(btn => btn.text().includes('重新发送'))
      await resendButton.trigger('click')
      
      expect(wrapper.emitted('resend')).toBeTruthy()
      expect(wrapper.emitted('resend')[0]).toEqual([mockNotification.id])
    })

    it('应该处理关闭按钮点击', async () => {
      wrapper = createWrapper()
      
      const closeButton = wrapper.findAll('.el-button').find(btn => btn.text().includes('关闭'))
      await closeButton.trigger('click')
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false])
    })

    it('应该根据状态显示不同的操作按钮', () => {
      // 草稿状态
      wrapper = createWrapper({
        data: {
          ...mockNotification,
          status: 'draft'
        }
      })
      
      let sendButton = wrapper.findAll('.el-button').find(btn => btn.text().includes('发送通知'))
      expect(sendButton.exists()).toBe(true)
      
      let resendButton = wrapper.findAll('.el-button').find(btn => btn.text().includes('重新发送'))
      expect(resendButton.exists()).toBe(false)
      
      // 已发送状态
      wrapper = createWrapper({
        data: {
          ...mockNotification,
          status: 'sent'
        }
      })
      
      sendButton = wrapper.findAll('.el-button').find(btn => btn.text().includes('发送通知'))
      expect(sendButton.exists()).toBe(false)
      
      resendButton = wrapper.findAll('.el-button').find(btn => btn.text().includes('重新发送'))
      expect(resendButton.exists()).toBe(true)
    })
  })

  describe('Props 测试', () => {
    it('应该正确处理 modelValue 变化', async () => {
      wrapper = createWrapper({ modelValue: false })
      
      expect(wrapper.vm.visible).toBe(false)
      
      await wrapper.setProps({ modelValue: true })
      
      expect(wrapper.vm.visible).toBe(true)
    })

    it('应该正确处理 data 变化', async () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.notification).toEqual(mockNotification)
      
      const newNotification = {
        ...mockNotification,
        title: '新的通知标题'
      }
      
      await wrapper.setProps({ data: newNotification })
      
      expect(wrapper.vm.notification).toEqual(newNotification)
    })

    it('应该处理空数据', () => {
      wrapper = createWrapper({ data: null })
      
      expect(wrapper.vm.notification).toBe(null)
      
      // 应该不会崩溃，而是显示空状态
      expect(wrapper.find('.notification-detail').exists()).toBe(true)
    })
  })

  describe('边界条件测试', () => {
    it('应该处理缺失的统计数据', () => {
      const notificationWithoutStats = {
        ...mockNotification,
        stats: undefined
      }
      
      wrapper = createWrapper({ data: notificationWithoutStats })
      
      const statsSection = wrapper.findAll('.detail-section')[3]
      const statItems = statsSection.findAll('.stat-item')
      
      expect(statItems[0].find('.stat-value').text()).toBe('0')
      expect(statItems[1].find('.stat-value').text()).toBe('0')
      expect(statItems[2].find('.stat-value').text()).toBe('0')
      expect(statItems[3].find('.stat-value').text()).toBe('0')
    })

    it('应该处理空的发送方式数组', () => {
      const notificationWithoutSendMethods = {
        ...mockNotification,
        sendMethods: []
      }
      
      wrapper = createWrapper({ data: notificationWithoutSendMethods })
      
      const sendSection = wrapper.findAll('.detail-section')[2]
      const sendMethodsItem = sendSection.findAll('.info-item')[0]
      const sendMethods = sendMethodsItem.find('.send-methods')
      
      expect(sendMethods.findAll('.el-tag').length).toBe(0)
    })

    it('应该处理空的接收对象数组', () => {
      const notificationWithoutRecipients = {
        ...mockNotification,
        recipients: []
      }
      
      wrapper = createWrapper({ data: notificationWithoutRecipients })
      
      const sendSection = wrapper.findAll('.detail-section')[2]
      const recipientsItem = sendSection.findAll('.info-item')[1]
      const recipients = recipientsItem.find('.recipients')
      
      expect(recipients.findAll('.el-tag').length).toBe(0)
    })

    it('应该处理空的操作记录数组', () => {
      const notificationWithoutLogs = {
        ...mockNotification,
        logs: []
      }
      
      wrapper = createWrapper({ data: notificationWithoutLogs })
      
      const logsSection = wrapper.findAll('.detail-section')[4]
      const timelineItems = logsSection.findAll('.el-timeline-item')
      
      expect(timelineItems.length).toBe(0)
    })

    it('应该处理特殊字符的通知内容', () => {
      const notificationWithSpecialChars = {
        ...mockNotification,
        content: '通知内容包含特殊字符：& < > " \' 和表情符号 😊'
      }
      
      wrapper = createWrapper({ data: notificationWithSpecialChars })
      
      const contentSection = wrapper.findAll('.detail-section')[1]
      const contentBox = contentSection.find('.content-box')
      
      expect(contentBox.text()).toBe(notificationWithSpecialChars.content)
    })

    it('应该处理很长的通知内容', () => {
      const longContent = '这是一个非常长的通知内容，'.repeat(100)
      const notificationWithLongContent = {
        ...mockNotification,
        content: longContent
      }
      
      wrapper = createWrapper({ data: notificationWithLongContent })
      
      const contentSection = wrapper.findAll('.detail-section')[1]
      const contentBox = contentSection.find('.content-box')
      
      expect(contentBox.text()).toBe(longContent)
    })
  })

  describe('样式和响应式测试', () => {
    it('应该包含必要的 CSS 类', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.notification-detail').exists()).toBe(true)
      expect(wrapper.find('.detail-section').exists()).toBe(true)
      expect(wrapper.find('.info-grid').exists()).toBe(true)
      expect(wrapper.find('.info-item').exists()).toBe(true)
      expect(wrapper.find('.content-box').exists()).toBe(true)
      expect(wrapper.find('.stats-grid').exists()).toBe(true)
      expect(wrapper.find('.stat-item').exists()).toBe(true)
      expect(wrapper.find('.log-content').exists()).toBe(true)
      expect(wrapper.find('.drawer-footer').exists()).toBe(true)
    })

    it('应该正确应用样式到各个元素', () => {
      wrapper = createWrapper()
      
      const detailSections = wrapper.findAll('.detail-section')
      detailSections.forEach(section => {
        expect(section.find('h3').exists()).toBe(true)
      })
      
      const statItems = wrapper.findAll('.stat-item')
      statItems.forEach(item => {
        expect(item.find('.stat-value').exists()).toBe(true)
        expect(item.find('.stat-label').exists()).toBe(true)
      })
    })
  })

  describe('性能测试', () => {
    it('应该快速渲染组件', () => {
      const startTime = performance.now()
      
      wrapper = createWrapper()
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      expect(renderTime).toBeLessThan(50) // 渲染时间应该小于 50ms
    })

    it('应该正确处理大量操作记录', () => {
      const manyLogs = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        action: `操作${i}`,
        details: `操作详情${i}`,
        operator: `操作员${i % 10}`,
        createdAt: new Date().toISOString()
      }))
      
      const notificationWithManyLogs = {
        ...mockNotification,
        logs: manyLogs
      }
      
      wrapper = createWrapper({ data: notificationWithManyLogs })
      
      const logsSection = wrapper.findAll('.detail-section')[4]
      const timelineItems = logsSection.findAll('.el-timeline-item')
      
      expect(timelineItems.length).toBe(100)
      
      // 测试渲染性能
      const startTime = performance.now()
      wrapper.vm.$forceUpdate()
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(100) // 重新渲染时间应该小于 100ms
    })
  })
})