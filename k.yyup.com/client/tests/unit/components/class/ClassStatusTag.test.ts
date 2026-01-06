
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
import ClassStatusTag from '@/components/class/ClassStatusTag.vue'

// 模拟Element Plus组件
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElTag: {
      name: 'ElTag',
      template: '<span :class="tagClass"><slot></slot></span>'
    }
  }
})

// 控制台错误检测变量
let consoleSpy: any

describe('ClassStatusTag.vue', () => {
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

  it('正确渲染活跃状态', () => {
    wrapper = mount(ClassStatusTag, {
      props: {
        status: 'active'
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-tag': true
        }
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.vm.statusLabel).toBe('活跃')
    expect(wrapper.vm.statusType).toBe('success')
  })

  it('正确渲染停用状态', () => {
    wrapper = mount(ClassStatusTag, {
      props: {
        status: 'inactive'
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-tag': true
        }
      }
    })

    expect(wrapper.vm.statusLabel).toBe('停用')
    expect(wrapper.vm.statusType).toBe('danger')
  })

  it('正确渲染待审核状态', () => {
    wrapper = mount(ClassStatusTag, {
      props: {
        status: 'pending'
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-tag': true
        }
      }
    })

    expect(wrapper.vm.statusLabel).toBe('待审核')
    expect(wrapper.vm.statusType).toBe('warning')
  })

  it('正确渲染已完成状态', () => {
    wrapper = mount(ClassStatusTag, {
      props: {
        status: 'completed'
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-tag': true
        }
      }
    })

    expect(wrapper.vm.statusLabel).toBe('已完成')
    expect(wrapper.vm.statusType).toBe('info')
  })

  it('处理未知状态', () => {
    wrapper = mount(ClassStatusTag, {
      props: {
        status: 'unknown'
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-tag': true
        }
      }
    })

    expect(wrapper.vm.statusLabel).toBe('unknown')
    expect(wrapper.vm.statusType).toBe('default')
  })

  it('显示自定义大小', () => {
    wrapper = mount(ClassStatusTag, {
      props: {
        status: 'active',
        size: 'large'
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-tag': true
        }
      }
    })

    expect(wrapper.props('size')).toBe('large')
  })
})