
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
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import ClassAssignDialog from '@/components/ClassAssignDialog.vue'

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
    ElDialog: {
      name: 'ElDialog',
      template: '<div><slot></slot><slot name="footer"></slot></div>'
    },
    ElTransfer: {
      name: 'ElTransfer',
      template: '<div><slot></slot></div>'
    },
    ElButton: {
      name: 'ElButton',
      template: '<button @click="$emit(\'click\')"><slot></slot></button>'
    }
  }
})

// 控制台错误检测变量
let consoleSpy: any

describe('ClassAssignDialog.vue', () => {
    beforeEach(() => {
      startConsoleMonitoring()
      vi.clearAllMocks()
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    afterEach(() => {
      expectNoConsoleErrors()
      stopConsoleMonitoring()
    })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
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

    wrapper = mount(ClassAssignDialog, {
      props: {
        visible: true,
        title: '班级分配'
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-dialog': true,
          'el-transfer': true,
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

  it('显示对话框标题', () => {
    expect(wrapper.props('title')).toBe('班级分配')
  })

  it('处理关闭操作', () => {
    wrapper.vm.handleClose()
    expect(wrapper.emitted('update:visible')).toBeTruthy()
    expect(wrapper.emitted('update:visible')[0]).toEqual([false])
  })

  it('处理保存操作', () => {
    const mockAssignments = [{ studentId: 1, classId: 1 }]
    wrapper.vm.handleSave(mockAssignments)
    expect(wrapper.emitted('save')).toBeTruthy()
    expect(wrapper.emitted('save')[0]).toEqual([mockAssignments])
  })

  it('处理穿梭框数据变化', () => {
    const mockData = [{ key: 1, label: '张三' }]
    wrapper.vm.handleTransferChange(mockData)
    expect(wrapper.vm.selectedData).toEqual(mockData)
  })
})