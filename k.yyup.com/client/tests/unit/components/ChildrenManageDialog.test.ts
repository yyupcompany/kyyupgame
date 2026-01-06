
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
import ChildrenManageDialog from '@/components/ChildrenManageDialog.vue'

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
    ElTable: {
      name: 'ElTable',
      template: '<table><slot></slot></table>'
    },
    ElTableColumn: {
      name: 'ElTableColumn',
      template: '<td><slot></slot></td>'
    },
    ElButton: {
      name: 'ElButton',
      template: '<button @click="$emit(\'click\')"><slot></slot></button>'
    },
    ElInput: {
      name: 'ElInput',
      template: '<input @input="$emit(\'update:modelValue\', $event.target.value)" />'
    }
  }
})

// 控制台错误检测变量
let consoleSpy: any

describe('ChildrenManageDialog.vue', () => {
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

    wrapper = mount(ChildrenManageDialog, {
      props: {
        visible: true,
        title: '儿童管理'
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-dialog': true,
          'el-table': true,
          'el-table-column': true,
          'el-button': true,
          'el-input': true
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
    expect(wrapper.props('title')).toBe('儿童管理')
  })

  it('处理关闭操作', () => {
    wrapper.vm.handleClose()
    expect(wrapper.emitted('update:visible')).toBeTruthy()
    expect(wrapper.emitted('update:visible')[0]).toEqual([false])
  })

  it('处理添加儿童操作', () => {
    wrapper.vm.handleAddChild()
    expect(wrapper.emitted('add-child')).toBeTruthy()
  })

  it('处理编辑儿童操作', () => {
    const mockChild = { id: 1, name: '张三' }
    wrapper.vm.handleEditChild(mockChild)
    expect(wrapper.emitted('edit-child')).toBeTruthy()
    expect(wrapper.emitted('edit-child')[0]).toEqual([mockChild])
  })

  it('处理删除儿童操作', () => {
    const mockChild = { id: 1, name: '张三' }
    wrapper.vm.handleDeleteChild(mockChild)
    expect(wrapper.emitted('delete-child')).toBeTruthy()
    expect(wrapper.emitted('delete-child')[0]).toEqual([mockChild])
  })

  it('处理搜索操作', () => {
    wrapper.vm.handleSearch('张三')
    expect(wrapper.emitted('search')).toBeTruthy()
    expect(wrapper.emitted('search')[0]).toEqual(['张三'])
  })
})