
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

describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import StudentDetailDialog from '@/components/dialogs/StudentDetailDialog.vue'
import ElementPlus from 'element-plus'

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElDialog: {
    name: 'ElDialog',
    template: '<div class="el-dialog"><slot /></div>'
  },
  ElCard: {
    name: 'ElCard',
    template: '<div class="el-card"><slot name="header" /><slot /></div>'
  },
  ElDescriptions: {
    name: 'ElDescriptions',
    template: '<div class="el-descriptions"><slot /></div>'
  },
  ElDescriptionsItem: {
    name: 'ElDescriptionsItem',
    template: '<div class="el-descriptions-item"><slot /></div>'
  },
  ElTable: {
    name: 'ElTable',
    template: '<div class="el-table"><slot /></div>'
  },
  ElTableColumn: {
    name: 'ElTableColumn',
    template: '<div class="el-table-column"><slot /></div>'
  },
  ElRate: {
    name: 'ElRate',
    template: '<div class="el-rate"><slot /></div>'
  },
  ElButton: {
    name: 'ElButton',
    template: '<button class="el-button"><slot /></button>'
  },
  ElIcon: {
    name: 'ElIcon',
    template: '<div class="el-icon"><slot /></div>'
  },
  ElMessage: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

// Mock icons
vi.mock('@element-plus/icons-vue', () => ({
  User: { name: 'User' },
  Document: { name: 'Document' },
  TrendCharts: { name: 'TrendCharts' }
}))

describe('StudentDetailDialog.vue', () => {
  let wrapper: any
  const mockStudentData = {
    id: 1,
    name: '张小明',
    studentId: 'ST202301001',
    gender: '男',
    age: 5,
    className: '大班A班',
    enrollmentDate: '2023-09-01',
    parentName: '张伟',
    phone: '13800138001',
    records: [
      {
        date: '2024-01-15',
        subject: '语言',
        content: '学习儿歌《小星星》',
        score: 5
      }
    ]
  }

  const createWrapper = (props = {}) => {
    return mount(StudentDetailDialog, {
      props: {
        modelValue: true,
        studentId: 1,
        ...props
      },
      global: {
        plugins: [ElementPlus],
        stubs: {
          'el-dialog': true,
          'el-card': true,
          'el-descriptions': true,
          'el-descriptions-item': true,
          'el-table': true,
          'el-table-column': true,
          'el-rate': true,
          'el-button': true,
          'el-icon': true
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders dialog with correct title', () => {
    wrapper = createWrapper()
    expect(wrapper.find('.el-dialog').exists()).toBe(true)
  })

  it('displays student basic information correctly', () => {
    wrapper = createWrapper()
    const studentData = wrapper.vm.studentData
    expect(studentData.name).toBe('张小明')
    expect(studentData.studentId).toBe('ST202301001')
    expect(studentData.gender).toBe('男')
    expect(studentData.age).toBe(5)
  })

  it('emits update:modelValue when dialog is closed', async () => {
    wrapper = createWrapper()
    await wrapper.vm.closeDialog()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([false])
  })

  it('emits edit-student event when edit button is clicked', async () => {
    wrapper = createWrapper()
    await wrapper.vm.editStudent()
    expect(wrapper.emitted('edit-student')).toBeTruthy()
    expect(wrapper.emitted('edit-student')[0]).toEqual([1])
  })

  it('calls ElMessage.success when printReport is called', () => {
    wrapper = createWrapper()
    const { ElMessage } = require('element-plus')
    wrapper.vm.printReport()
    expect(ElMessage.success).toHaveBeenCalledWith('报告打印功能开发中...')
  })

  it('has correct student records data structure', () => {
    wrapper = createWrapper()
    const records = wrapper.vm.studentData.records
    expect(Array.isArray(records)).toBe(true)
    expect(records.length).toBeGreaterThan(0)
    expect(records[0]).toHaveProperty('date')
    expect(records[0]).toHaveProperty('subject')
    expect(records[0]).toHaveProperty('content')
    expect(records[0]).toHaveProperty('score')
  })

  it('computes visible property correctly', async () => {
    wrapper = createWrapper({ modelValue: true })
    expect(wrapper.vm.visible).toBe(true)
    
    await wrapper.setProps({ modelValue: false })
    expect(wrapper.vm.visible).toBe(false)
  })

  it('has chartContainer ref', () => {
    wrapper = createWrapper()
    expect(wrapper.vm.chartContainer).toBeDefined()
  })

  it('draws chart when mounted and visible', async () => {
    wrapper = createWrapper({ modelValue: true })
    const drawChartSpy = vi.spyOn(wrapper.vm, 'drawChart')
    await wrapper.vm.$nextTick()
    expect(drawChartSpy).toHaveBeenCalled()
  })
})