
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
import ClassActions from '@/components/class/ClassActions.vue'

// 模拟Element Plus组件
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElButton: {
      name: 'ElButton',
      template: '<button @click="$emit(\'click\')"><slot></slot></button>'
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
    }
  }
})

// 控制台错误检测变量
let consoleSpy: any

describe('ClassActions.vue', () => {
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

    wrapper = mount(ClassActions, {
      props: {
        classData: {
          id: 1,
          name: '一年级一班',
          status: 'active'
        }
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-button': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true
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
      status: 'active'
    })
  })

  it('处理编辑操作', () => {
    wrapper.vm.handleEdit()
    expect(wrapper.emitted('edit')).toBeTruthy()
    expect(wrapper.emitted('edit')[0]).toEqual([wrapper.props('classData')])
  })

  it('处理删除操作', () => {
    wrapper.vm.handleDelete()
    expect(wrapper.emitted('delete')).toBeTruthy()
    expect(wrapper.emitted('delete')[0]).toEqual([wrapper.props('classData')])
  })

  it('处理查看详情操作', () => {
    wrapper.vm.handleView()
    expect(wrapper.emitted('view')).toBeTruthy()
    expect(wrapper.emitted('view')[0]).toEqual([wrapper.props('classData')])
  })

  it('处理管理学生操作', () => {
    wrapper.vm.handleManageStudents()
    expect(wrapper.emitted('manage-students')).toBeTruthy()
    expect(wrapper.emitted('manage-students')[0]).toEqual([wrapper.props('classData')])
  })

  it('处理查看统计操作', () => {
    wrapper.vm.handleViewStats()
    expect(wrapper.emitted('view-stats')).toBeTruthy()
    expect(wrapper.emitted('view-stats')[0]).toEqual([wrapper.props('classData')])
  })
})