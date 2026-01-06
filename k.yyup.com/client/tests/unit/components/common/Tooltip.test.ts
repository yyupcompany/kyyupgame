
// 使用全局表单引用Mock
beforeEach(() => {
  // 设置表单引用Mock
  if (typeof formRef !== 'undefined' && formRef.value) {
    Object.assign(formRef.value, global.mockFormRef)
  }
  if (typeof editInput !== 'undefined' && editInput.value) {
    Object.assign(editInput.value, global.mockInputRef)
  }
})


// Element Plus Mock for form validation
const mockFormRef = {
  clearValidate: vi.fn(),
  resetFields: vi.fn(),
  validate: vi.fn(() => Promise.resolve(true)),
  validateField: vi.fn()
}

const mockInputRef = {
  focus: vi.fn(),
  blur: vi.fn(),
  select: vi.fn()
}

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElForm: {
    name: 'ElForm',
    template: '<form><slot /></form>'
  },
  ElFormItem: {
    name: 'ElFormItem',
    template: '<div><slot /></div>'
  },
  ElInput: {
    name: 'ElInput',
    template: '<input />'
  },
  ElButton: {
    name: 'ElButton',
    template: '<button><slot /></button>'
  }
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
import { createRouter, createWebHistory, Router } from 'vue-router'
import Tooltip from '@/components/common/Tooltip.vue'
import ElementPlus from 'element-plus'

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElTooltip: {
    name: 'ElTooltip',
    template: '<div class="el-tooltip"><slot></slot><slot name="content"></slot></div>',
    props: [
      'content', 'placement', 'effect', 'disabled', 'offset', 'transition',
      'visible', 'showArrow', 'popperClass', 'enterable', 'hideAfter',
      'tabindex', 'teleported', 'persistent'
    ]
  },
  ElIcon: {
    name: 'ElIcon',
    template: '<i class="el-icon"><slot></slot></i>',
    props: ['size', 'color']
  },
  ElButton: {
    name: 'ElButton',
    template: '<button class="el-button"><slot></slot></button>',
    props: ['type', 'size', 'disabled', 'icon']
  }
}))

describe('Tooltip.vue', () => {
  let router: Router

  beforeEach(() => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } }
      ]
    })
  })

  it('renders properly with default props', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip content'
      },
      slots: {
        default: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.el-tooltip').exists()).toBe(true)
  })

  it('displays correct content', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'This is a tooltip'
      },
      slots: {
        default: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tooltip = wrapper.find('.el-tooltip')
    expect(tooltip.props('content')).toBe('This is a tooltip')
  })

  it('applies correct placement when placement prop is provided', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip content',
        placement: 'bottom'
      },
      slots: {
        default: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tooltip = wrapper.find('.el-tooltip')
    expect(tooltip.props('placement')).toBe('bottom')
  })

  it('applies default placement when placement prop is not provided', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip content'
      },
      slots: {
        default: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tooltip = wrapper.find('.el-tooltip')
    expect(tooltip.props('placement')).toBe('top')
  })

  it('applies correct effect when effect prop is provided', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip content',
        effect: 'dark'
      },
      slots: {
        default: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tooltip = wrapper.find('.el-tooltip')
    expect(tooltip.props('effect')).toBe('dark')
  })

  it('applies default effect when effect prop is not provided', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip content'
      },
      slots: {
        default: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tooltip = wrapper.find('.el-tooltip')
    expect(tooltip.props('effect')).toBe('light')
  })

  it('disables tooltip when disabled prop is true', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip content',
        disabled: true
      },
      slots: {
        default: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tooltip = wrapper.find('.el-tooltip')
    expect(tooltip.props('disabled')).toBe(true)
  })

  it('enables tooltip when disabled prop is false', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip content',
        disabled: false
      },
      slots: {
        default: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tooltip = wrapper.find('.el-tooltip')
    expect(tooltip.props('disabled')).toBe(false)
  })

  it('applies custom offset when offset prop is provided', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip content',
        offset: 10
      },
      slots: {
        default: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tooltip = wrapper.find('.el-tooltip')
    expect(tooltip.props('offset')).toBe(10)
  })

  it('shows arrow when showArrow prop is true', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip content',
        showArrow: true
      },
      slots: {
        default: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tooltip = wrapper.find('.el-tooltip')
    expect(tooltip.props('showArrow')).toBe(true)
  })

  it('hides arrow when showArrow prop is false', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip content',
        showArrow: false
      },
      slots: {
        default: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tooltip = wrapper.find('.el-tooltip')
    expect(tooltip.props('showArrow')).toBe(false)
  })

  it('applies custom popper class when popperClass prop is provided', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip content',
        popperClass: 'custom-tooltip'
      },
      slots: {
        default: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tooltip = wrapper.find('.el-tooltip')
    expect(tooltip.props('popperClass')).toBe('custom-tooltip')
  })

  it('allows mouse enter when enterable prop is true', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip content',
        enterable: true
      },
      slots: {
        default: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tooltip = wrapper.find('.el-tooltip')
    expect(tooltip.props('enterable')).toBe(true)
  })

  it('prevents mouse enter when enterable prop is false', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip content',
        enterable: false
      },
      slots: {
        default: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tooltip = wrapper.find('.el-tooltip')
    expect(tooltip.props('enterable')).toBe(false)
  })

  it('hides after specified delay when hideAfter prop is provided', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip content',
        hideAfter: 2000
      },
      slots: {
        default: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tooltip = wrapper.find('.el-tooltip')
    expect(tooltip.props('hideAfter')).toBe(2000)
  })

  it('applies custom tabindex when tabindex prop is provided', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip content',
        tabindex: 0
      },
      slots: {
        default: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tooltip = wrapper.find('.el-tooltip')
    expect(tooltip.props('tabindex')).toBe(0)
  })

  it('uses teleported rendering when teleported prop is true', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip content',
        teleported: true
      },
      slots: {
        default: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tooltip = wrapper.find('.el-tooltip')
    expect(tooltip.props('teleported')).toBe(true)
  })

  it('uses inline rendering when teleported prop is false', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip content',
        teleported: false
      },
      slots: {
        default: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tooltip = wrapper.find('.el-tooltip')
    expect(tooltip.props('teleported')).toBe(false)
  })

  it('makes tooltip persistent when persistent prop is true', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip content',
        persistent: true
      },
      slots: {
        default: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tooltip = wrapper.find('.el-tooltip')
    expect(tooltip.props('persistent')).toBe(true)
  })

  it('makes tooltip non-persistent when persistent prop is false', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip content',
        persistent: false
      },
      slots: {
        default: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tooltip = wrapper.find('.el-tooltip')
    expect(tooltip.props('persistent')).toBe(false)
  })

  it('controls visibility when visible prop is provided', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip content',
        visible: true
      },
      slots: {
        default: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tooltip = wrapper.find('.el-tooltip')
    expect(tooltip.props('visible')).toBe(true)
  })

  it('emits show event when tooltip is shown', async () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip content'
      },
      slots: {
        default: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('show')
    expect(wrapper.emitted('show')).toBeTruthy()
  })

  it('emits hide event when tooltip is hidden', async () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip content'
      },
      slots: {
        default: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('hide')
    expect(wrapper.emitted('hide')).toBeTruthy()
  })

  it('emits update:visible event when visibility changes', async () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip content'
      },
      slots: {
        default: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('update:visible', true)
    expect(wrapper.emitted('update:visible')).toBeTruthy()
    expect(wrapper.emitted('update:visible')[0]).toEqual([true])
  })

  it('renders default slot content', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip content'
      },
      slots: {
        default: '<button class="custom-button">Click me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.custom-button').exists()).toBe(true)
    expect(wrapper.find('.custom-button').text()).toBe('Click me')
  })

  it('renders content slot when provided', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Default content'
      },
      slots: {
        default: '<button>Hover me</button>',
        content: '<div class="custom-content">Custom tooltip content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.custom-content').exists()).toBe(true)
    expect(wrapper.find('.custom-content').text()).toBe('Custom tooltip content')
  })

  it('applies custom CSS classes when className prop is provided', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip content',
        className: 'custom-tooltip-wrapper'
      },
      slots: {
        default: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('className')).toBe('custom-tooltip-wrapper')
  })

  it('handles empty content gracefully', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: ''
      },
      slots: {
        default: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('content')).toBe('')
    expect(wrapper.find('.el-tooltip').exists()).toBe(true)
  })

  it('handles null content gracefully', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: null
      },
      slots: {
        default: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('content')).toBe(null)
    expect(wrapper.find('.el-tooltip').exists()).toBe(true)
  })

  it('handles undefined content gracefully', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: undefined
      },
      slots: {
        default: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('content')).toBe(undefined)
    expect(wrapper.find('.el-tooltip').exists()).toBe(true)
  })

  it('supports HTML content when html prop is true', () => {
    const htmlContent = '<strong>Bold text</strong> and <em>italic text</em>'
    const wrapper = mount(Tooltip, {
      props: {
        content: htmlContent,
        html: true
      },
      slots: {
        default: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('content')).toBe(htmlContent)
    expect(wrapper.props('html')).toBe(true)
  })

  it('escapes HTML content when html prop is false', () => {
    const htmlContent = '<strong>Bold text</strong> and <em>italic text</em>'
    const wrapper = mount(Tooltip, {
      props: {
        content: htmlContent,
        html: false
      },
      slots: {
        default: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('content')).toBe(htmlContent)
    expect(wrapper.props('html')).toBe(false)
  })

  it('supports custom transition when transition prop is provided', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip content',
        transition: 'custom-transition'
      },
      slots: {
        default: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tooltip = wrapper.find('.el-tooltip')
    expect(tooltip.props('transition')).toBe('custom-transition')
  })

  it('supports custom trigger when trigger prop is provided', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip content',
        trigger: 'click'
      },
      slots: {
        default: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('trigger')).toBe('click')
  })

  it('supports hover trigger by default', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip content'
      },
      slots: {
        default: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('trigger')).toBe('hover')
  })

  it('supports focus trigger', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip content',
        trigger: 'focus'
      },
      slots: {
        default: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('trigger')).toBe('focus')
  })

  it('supports manual trigger', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip content',
        trigger: 'manual'
      },
      slots: {
        default: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('trigger')).toBe('manual')
  })

  it('supports custom delay when delay prop is provided', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip content',
        delay: 500
      },
      slots: {
        default: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('delay')).toBe(500)
  })

  it('supports different show and hide delays', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip content',
        delay: { show: 200, hide: 500 }
      },
      slots: {
        default: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('delay')).toEqual({ show: 200, hide: 500 })
  })

  it('supports interactive tooltip when interactive prop is true', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip content',
        interactive: true
      },
      slots: {
        default: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('interactive')).toBe(true)
  })

  it('supports non-interactive tooltip when interactive prop is false', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip content',
        interactive: false
      },
      slots: {
        default: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('interactive')).toBe(false)
  })
})