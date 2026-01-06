
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
import ClassDetailView from '@/components/class/ClassDetailView.vue'

// 模拟Element Plus组件
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElCard: {
      name: 'ElCard',
      template: '<div><slot></slot><slot name="header"></slot></div>'
    },
    ElDescriptions: {
      name: 'ElDescriptions',
      template: '<div><slot></slot></div>'
    },
    ElDescriptionsItem: {
      name: 'ElDescriptionsItem',
      template: '<div><slot></slot></div>'
    },
    ElTable: {
      name: 'ElTable',
      template: '<table><slot></slot></table>'
    },
    ElTableColumn: {
      name: 'ElTableColumn',
      template: '<td><slot></slot></td>'
    },
    ElTag: {
      name: 'ElTag',
      template: '<span><slot></slot></span>'
    },
    ElButton: {
      name: 'ElButton',
      template: '<button @click="$emit(\'click\')"><slot></slot></button>'
    }
  }
})

// 控制台错误检测变量
let consoleSpy: any

describe('ClassDetailView.vue', () => {
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

    wrapper = mount(ClassDetailView, {
      props: {
        classData: {
          id: 1,
          name: '一年级一班',
          grade: '一年级',
          teacher: '张老师',
          studentCount: 30,
          status: 'active',
          createdAt: '2024-01-01T00:00:00'
        }
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-card': true,
          'el-descriptions': true,
          'el-descriptions-item': true,
          'el-table': true,
          'el-table-column': true,
          'el-tag': true,
          'el-button': true
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
  })

  it('显示班级数据', () => {
    expect(wrapper.props('classData')).toEqual({
      id: 1,
      name: '一年级一班',
      grade: '一年级',
      teacher: '张老师',
      studentCount: 30,
      status: 'active',
      createdAt: '2024-01-01T00:00:00'
    })
  })

  it('显示班级基本信息', () => {
    expect(wrapper.find('.class-info').exists()).toBe(true)
  })

  it('显示学生列表', () => {
    expect(wrapper.find('.student-list').exists()).toBe(true)
  })

  it('处理编辑操作', () => {
    wrapper.vm.handleEdit()
    expect(wrapper.emitted('edit')).toBeTruthy()
    expect(wrapper.emitted('edit')[0]).toEqual([wrapper.props('classData')])
  })

  it('处理返回操作', () => {
    wrapper.vm.handleBack()
    expect(wrapper.emitted('back')).toBeTruthy()
  })

  it('处理管理学生操作', () => {
    wrapper.vm.handleManageStudents()
    expect(wrapper.emitted('manage-students')).toBeTruthy()
  })

  it('处理查看统计操作', () => {
    wrapper.vm.handleViewStats()
    expect(wrapper.emitted('view-stats')).toBeTruthy()
  })

  it('格式化班级信息', () => {
    expect(wrapper.vm.formatClassInfo()).toEqual({
      '班级名称': '一年级一班',
      '年级': '一年级',
      '班主任': '张老师',
      '学生人数': '30人',
      '状态': 'active',
      '创建时间': '2024-01-01T00:00:00'
    })
  })
})