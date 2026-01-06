
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
import AsyncComponentWrapper from '@/components/common/AsyncComponentWrapper.vue'

// 模拟Element Plus组件
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElSkeleton: {
      name: 'ElSkeleton',
      template: '<div class="skeleton"><slot></slot></div>'
    },
    ElEmpty: {
      name: 'ElEmpty',
      template: '<div class="empty"><slot></slot></div>'
    },
    ElButton: {
      name: 'ElButton',
      template: '<button @click="$emit(\'click\')"><slot></slot></button>'
    }
  }
})

// 控制台错误检测变量
let consoleSpy: any

describe('AsyncComponentWrapper.vue', () => {
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

  it('正确渲染组件', () => {
    wrapper = mount(AsyncComponentWrapper, {
      props: {
        loading: false,
        error: null
      },
      slots: {
        default: '<div class="content">默认内容</div>'
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-skeleton': true,
          'el-empty': true,
          'el-button': true
        }
      }
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('显示加载状态', () => {
    wrapper = mount(AsyncComponentWrapper, {
      props: {
        loading: true,
        error: null
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-skeleton': true,
          'el-empty': true,
          'el-button': true
        }
      }
    })

    expect(wrapper.find('.skeleton').exists()).toBe(true)
  })

  it('显示错误状态', () => {
    wrapper = mount(AsyncComponentWrapper, {
      props: {
        loading: false,
        error: '加载失败'
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-skeleton': true,
          'el-empty': true,
          'el-button': true
        }
      }
    })

    expect(wrapper.find('.empty').exists()).toBe(true)
  })

  it('显示默认内容', () => {
    wrapper = mount(AsyncComponentWrapper, {
      props: {
        loading: false,
        error: null
      },
      slots: {
        default: '<div class="content">默认内容</div>'
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-skeleton': true,
          'el-empty': true,
          'el-button': true
        }
      }
    })

    expect(wrapper.find('.content').exists()).toBe(true)
  })

  it('处理重试操作', () => {
    wrapper = mount(AsyncComponentWrapper, {
      props: {
        loading: false,
        error: '加载失败'
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-skeleton': true,
          'el-empty': true,
          'el-button': true
        }
      }
    })

    wrapper.vm.handleRetry()
    expect(wrapper.emitted('retry')).toBeTruthy()
  })

  it('显示自定义加载内容', () => {
    wrapper = mount(AsyncComponentWrapper, {
      props: {
        loading: true,
        error: null
      },
      slots: {
        loading: '<div class="custom-loading">自定义加载中...</div>'
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-skeleton': true,
          'el-empty': true,
          'el-button': true
        }
      }
    })

    expect(wrapper.find('.custom-loading').exists()).toBe(true)
  })

  it('显示自定义错误内容', () => {
    wrapper = mount(AsyncComponentWrapper, {
      props: {
        loading: false,
        error: '加载失败'
      },
      slots: {
        error: '<div class="custom-error">自定义错误信息</div>'
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-skeleton': true,
          'el-empty': true,
          'el-button': true
        }
      }
    })

    expect(wrapper.find('.custom-error').exists()).toBe(true)
  })

  it('显示自定义空内容', () => {
    wrapper = mount(AsyncComponentWrapper, {
      props: {
        loading: false,
        error: null,
        empty: true
      },
      slots: {
        empty: '<div class="custom-empty">自定义空内容</div>'
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-skeleton': true,
          'el-empty': true,
          'el-button': true
        }
      }
    })

    expect(wrapper.find('.custom-empty').exists()).toBe(true)
  })
})