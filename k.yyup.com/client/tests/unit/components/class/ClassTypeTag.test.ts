
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
import ClassTypeTag from '@/components/class/ClassTypeTag.vue'

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

describe('ClassTypeTag.vue', () => {
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

  it('正确渲染普通班级类型', () => {
    wrapper = mount(ClassTypeTag, {
      props: {
        type: 'normal'
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-tag': true
        }
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.vm.typeLabel).toBe('普通班级')
    expect(wrapper.vm.typeColor).toBe('#409EFF')
  })

  it('正确渲染实验班级类型', () => {
    wrapper = mount(ClassTypeTag, {
      props: {
        type: 'experimental'
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-tag': true
        }
      }
    })

    expect(wrapper.vm.typeLabel).toBe('实验班级')
    expect(wrapper.vm.typeColor).toBe('#67C23A')
  })

  it('正确渲染特长班级类型', () => {
    wrapper = mount(ClassTypeTag, {
      props: {
        type: 'special'
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-tag': true
        }
      }
    })

    expect(wrapper.vm.typeLabel).toBe('特长班级')
    expect(wrapper.vm.typeColor).toBe('#E6A23C')
  })

  it('正确渲染国际班级类型', () => {
    wrapper = mount(ClassTypeTag, {
      props: {
        type: 'international'
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-tag': true
        }
      }
    })

    expect(wrapper.vm.typeLabel).toBe('国际班级')
    expect(wrapper.vm.typeColor).toBe('#F56C6C')
  })

  it('处理未知类型', () => {
    wrapper = mount(ClassTypeTag, {
      props: {
        type: 'unknown'
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-tag': true
        }
      }
    })

    expect(wrapper.vm.typeLabel).toBe('unknown')
    expect(wrapper.vm.typeColor).toBe('#909399')
  })

  it('显示自定义大小', () => {
    wrapper = mount(ClassTypeTag, {
      props: {
        type: 'normal',
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