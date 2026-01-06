
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

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import RegistrationDetail from '@/components/centers/activity/RegistrationDetail.vue'
import { Document } from '@element-plus/icons-vue'

// 模拟Element Plus图标
vi.mock('@element-plus/icons-vue', () => ({
  Document: vi.fn()
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
    ElDrawer: {
      name: 'ElDrawer',
      template: '<div><slot></slot><slot name="footer"></slot></div>'
    },
    ElTag: {
      name: 'ElTag',
      template: '<span><slot></slot></span>'
    },
    ElTimeline: {
      name: 'ElTimeline',
      template: '<div><slot></slot></div>'
    },
    ElTimelineItem: {
      name: 'ElTimelineItem',
      template: '<div><slot></slot></div>'
    },
    ElButton: {
      name: 'ElButton',
      template: '<button @click="$emit(\'click\')"><slot></slot></button>'
    },
    ElIcon: {
      name: 'ElIcon',
      template: '<span><slot></slot></span>'
    }
  }
})

const mockRegistrationData = {
  id: 'REG001',
  activityName: '春季运动会',
  studentName: '张小明',
  parentName: '张爸爸',
  phone: '13800138000',
  status: 'pending',
  activityTime: '2024-03-15T10:00:00',
  location: '幼儿园操场',
  activityType: '体育活动',
  participantCount: 30,
  fee: 50,
  registrationTime: '2024-02-20T14:30:00',
  method: 'online',
  auditStatus: 'pending',
  remarks: '孩子很喜欢运动',
  auditLogs: [
    {
      id: 'LOG001',
      action: 'submit',
      content: '提交报名申请',
      operator: '张爸爸',
      createdAt: '2024-02-20T14:30:00'
    }
  ],
  attachments: [
    {
      id: 'ATT001',
      name: '健康证明.pdf',
      size: 1024000,
      url: '/api/attachments/ATT001'
    }
  ],
  paymentStatus: 'unpaid'
}

// 控制台错误检测变量
let consoleSpy: any

describe('RegistrationDetail.vue', () => {
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

    wrapper = mount(RegistrationDetail, {
      props: {
        modelValue: true,
        data: mockRegistrationData
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-drawer': true,
          'el-tag': true,
          'el-timeline': true,
          'el-timeline-item': true,
          'el-button': true,
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

  it('正确渲染报名详情信息', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.registration-detail').exists()).toBe(true)
  })

  it('显示基本信息部分', () => {
    const basicInfo = wrapper.find('.detail-section h3')
    expect(basicInfo.text()).toBe('基本信息')
  })

  it('显示活动信息部分', () => {
    const activityInfo = wrapper.findAll('.detail-section h3')[1]
    expect(activityInfo.text()).toBe('活动信息')
  })

  it('显示报名信息部分', () => {
    const registrationInfo = wrapper.findAll('.detail-section h3')[2]
    expect(registrationInfo.text()).toBe('报名信息')
  })

  it('显示备注信息', () => {
    const remarksSection = wrapper.findAll('.detail-section')[3]
    expect(remarksSection.find('h3').text()).toBe('备注信息')
    expect(remarksSection.find('.remarks-content').text()).toBe('孩子很喜欢运动')
  })

  it('显示审核记录', () => {
    const auditSection = wrapper.findAll('.detail-section')[4]
    expect(auditSection.find('h3').text()).toBe('审核记录')
  })

  it('显示附件信息', () => {
    const attachmentSection = wrapper.findAll('.detail-section')[5]
    expect(attachmentSection.find('h3').text()).toBe('附件信息')
  })

  it('显示支付信息', () => {
    const paymentSection = wrapper.findAll('.detail-section')[6]
    expect(paymentSection.find('h3').text()).toBe('支付信息')
  })

  it('正确格式化日期时间', async () => {
    const component = wrapper.vm
    const formatted = component.formatDateTime('2024-03-15T10:00:00')
    expect(formatted).toContain('2024')
    expect(formatted).toContain('03')
    expect(formatted).toContain('15')
  })

  it('正确格式化文件大小', async () => {
    const component = wrapper.vm
    expect(component.formatFileSize(500)).toBe('500B')
    expect(component.formatFileSize(2048)).toBe('2.0KB')
    expect(component.formatFileSize(2097152)).toBe('2.0MB')
  })

  it('正确获取状态标签', async () => {
    const component = wrapper.vm
    expect(component.getStatusLabel('pending')).toBe('待审核')
    expect(component.getStatusLabel('confirmed')).toBe('已确认')
    expect(component.getStatusLabel('cancelled')).toBe('已取消')
    expect(component.getStatusLabel('completed')).toBe('已完成')
    expect(component.getStatusLabel('unknown')).toBe('unknown')
  })

  it('正确获取状态颜色', async () => {
    const component = wrapper.vm
    expect(component.getStatusColor('pending')).toBe('warning')
    expect(component.getStatusColor('confirmed')).toBe('success')
    expect(component.getStatusColor('cancelled')).toBe('danger')
    expect(component.getStatusColor('completed')).toBe('info')
    expect(component.getStatusColor('unknown')).toBe('info')
  })

  it('正确获取审核状态标签', async () => {
    const component = wrapper.vm
    expect(component.getAuditStatusLabel('pending')).toBe('待审核')
    expect(component.getAuditStatusLabel('approved')).toBe('已通过')
    expect(component.getAuditStatusLabel('rejected')).toBe('已拒绝')
  })

  it('正确获取审核状态颜色', async () => {
    const component = wrapper.vm
    expect(component.getAuditStatusColor('pending')).toBe('warning')
    expect(component.getAuditStatusColor('approved')).toBe('success')
    expect(component.getAuditStatusColor('rejected')).toBe('danger')
  })

  it('正确获取报名方式标签', async () => {
    const component = wrapper.vm
    expect(component.getRegistrationMethodLabel('online')).toBe('在线报名')
    expect(component.getRegistrationMethodLabel('phone')).toBe('电话报名')
    expect(component.getRegistrationMethodLabel('offline')).toBe('现场报名')
  })

  it('正确获取审核动作标签', async () => {
    const component = wrapper.vm
    expect(component.getAuditActionLabel('submit')).toBe('提交审核')
    expect(component.getAuditActionLabel('approve')).toBe('审核通过')
    expect(component.getAuditActionLabel('reject')).toBe('审核拒绝')
    expect(component.getAuditActionLabel('modify')).toBe('修改信息')
  })

  it('正确获取审核动作颜色', async () => {
    const component = wrapper.vm
    expect(component.getAuditActionColor('submit')).toBe('info')
    expect(component.getAuditActionColor('approve')).toBe('success')
    expect(component.getAuditActionColor('reject')).toBe('danger')
    expect(component.getAuditActionColor('modify')).toBe('warning')
  })

  it('正确获取支付状态标签', async () => {
    const component = wrapper.vm
    expect(component.getPaymentStatusLabel('unpaid')).toBe('未支付')
    expect(component.getPaymentStatusLabel('paid')).toBe('已支付')
    expect(component.getPaymentStatusLabel('refunded')).toBe('已退款')
  })

  it('正确获取支付状态颜色', async () => {
    const component = wrapper.vm
    expect(component.getPaymentStatusColor('unpaid')).toBe('warning')
    expect(component.getPaymentStatusColor('paid')).toBe('success')
    expect(component.getPaymentStatusColor('refunded')).toBe('info')
  })

  it('处理通过操作', async () => {
    ElMessageBox.confirm.mockResolvedValue(true)
    
    await wrapper.vm.handleApprove()
    
    expect(ElMessageBox.confirm).toHaveBeenCalledWith(
      '确定要通过这个报名申请吗？',
      '确认操作',
      { type: 'warning' }
    )
    expect(wrapper.emitted('approve')).toBeTruthy()
    expect(wrapper.emitted('approve')[0]).toEqual(['REG001'])
  })

  it('处理拒绝操作', async () => {
    ElMessageBox.prompt.mockResolvedValue({ value: '不符合要求' })
    
    await wrapper.vm.handleReject()
    
    expect(ElMessageBox.prompt).toHaveBeenCalledWith(
      '请输入拒绝原因',
      '拒绝报名',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /.+/,
        inputErrorMessage: '请输入拒绝原因'
      }
    )
    expect(wrapper.emitted('reject')).toBeTruthy()
    expect(wrapper.emitted('reject')[0]).toEqual(['REG001'])
  })

  it('处理取消操作', async () => {
    ElMessageBox.confirm.mockResolvedValue(true)
    
    await wrapper.vm.handleCancel()
    
    expect(ElMessageBox.confirm).toHaveBeenCalledWith(
      '确定要取消这个报名吗？',
      '确认操作',
      { type: 'warning' }
    )
    expect(wrapper.emitted('cancel')).toBeTruthy()
    expect(wrapper.emitted('cancel')[0]).toEqual(['REG001'])
  })

  it('用户取消操作时不触发事件', async () => {
    ElMessageBox.confirm.mockRejectedValue(new Error('cancel'))
    
    await wrapper.vm.handleApprove()
    
    expect(wrapper.emitted('approve')).toBeFalsy()
  })

  it('下载附件时打开新窗口', () => {
    const mockWindowOpen = vi.fn()
    window.open = mockWindowOpen
    
    const attachment = {
      id: 'ATT001',
      name: '健康证明.pdf',
      size: 1024000,
      url: '/api/attachments/ATT001'
    }
    
    wrapper.vm.downloadAttachment(attachment)
    
    expect(mockWindowOpen).toHaveBeenCalledWith('/api/attachments/ATT001', '_blank')
  })

  it('当没有数据时正确处理', () => {
    const emptyWrapper = mount(RegistrationDetail, {
      props: {
        modelValue: true,
        data: null
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-drawer': true,
          'el-tag': true,
          'el-timeline': true,
          'el-timeline-item': true,
          'el-button': true,
          'el-icon': true
        }
      }
    })

    expect(emptyWrapper.find('.registration-detail').exists()).toBe(false)
  })

  it('正确响应modelValue变化', async () => {
    await wrapper.setProps({ modelValue: false })
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([false])
  })
})