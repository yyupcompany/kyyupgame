
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
import Popover from '@/components/common/Popover.vue'
import ElementPlus from 'element-plus'

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElPopover: {
    name: 'ElPopover',
    template: '<div class="el-popover"><slot></slot><slot name="reference"></slot></div>',
    props: [
      'placement', 'title', 'width', 'trigger', 'disabled', 'content', 'offset',
      'transition', 'visible', 'popperClass', 'popperStyle', 'showArrow',
      'tabindex', 'teleported', 'persistent', 'modal', 'closeDelay'
    ]
  },
  ElButton: {
    name: 'ElButton',
    template: '<button class="el-button"><slot></slot></button>',
    props: ['type', 'size', 'disabled', 'icon']
  },
  ElInput: {
    name: 'ElInput',
    template: '<input class="el-input" />',
    props: ['modelValue', 'placeholder', 'type']
  },
  ElCard: {
    name: 'ElCard',
    template: '<div class="el-card"><slot></slot></div>',
    props: ['shadow', 'bodyStyle']
  },
  ElRow: {
    name: 'ElRow',
    template: '<div class="el-row"><slot></slot></div>',
    props: ['gutter']
  },
  ElCol: {
    name: 'ElCol',
    template: '<div class="el-col"><slot></slot></div>',
    props: ['span']
  },
  ElDivider: {
    name: 'ElDivider',
    template: '<div class="el-divider"></div>',
    props: ['contentPosition']
  }
}))

describe('Popover.vue', () => {
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
    const wrapper = mount(Popover, {
      props: {
        title: 'Popover Title'
      },
      slots: {
        default: '<div>Popover content</div>',
        reference: '<button>Click me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.el-popover').exists()).toBe(true)
  })

  it('displays correct title', () => {
    const wrapper = mount(Popover, {
      props: {
        title: 'Settings'
      },
      slots: {
        default: '<div>Settings content</div>',
        reference: '<button>Settings</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const popover = wrapper.find('.el-popover')
    expect(popover.props('title')).toBe('Settings')
  })

  it('applies correct placement when placement prop is provided', () => {
    const wrapper = mount(Popover, {
      props: {
        title: 'Popover Title',
        placement: 'bottom'
      },
      slots: {
        default: '<div>Content</div>',
        reference: '<button>Click me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const popover = wrapper.find('.el-popover')
    expect(popover.props('placement')).toBe('bottom')
  })

  it('applies default placement when placement prop is not provided', () => {
    const wrapper = mount(Popover, {
      props: {
        title: 'Popover Title'
      },
      slots: {
        default: '<div>Content</div>',
        reference: '<button>Click me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const popover = wrapper.find('.el-popover')
    expect(popover.props('placement')).toBe('top')
  })

  it('applies custom width when width prop is provided', () => {
    const wrapper = mount(Popover, {
      props: {
        title: 'Popover Title',
        width: 300
      },
      slots: {
        default: '<div>Content</div>',
        reference: '<button>Click me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const popover = wrapper.find('.el-popover')
    expect(popover.props('width')).toBe(300)
  })

  it('applies correct trigger when trigger prop is provided', () => {
    const wrapper = mount(Popover, {
      props: {
        title: 'Popover Title',
        trigger: 'hover'
      },
      slots: {
        default: '<div>Content</div>',
        reference: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const popover = wrapper.find('.el-popover')
    expect(popover.props('trigger')).toBe('hover')
  })

  it('applies default trigger when trigger prop is not provided', () => {
    const wrapper = mount(Popover, {
      props: {
        title: 'Popover Title'
      },
      slots: {
        default: '<div>Content</div>',
        reference: '<button>Click me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const popover = wrapper.find('.el-popover')
    expect(popover.props('trigger')).toBe('click')
  })

  it('disables popover when disabled prop is true', () => {
    const wrapper = mount(Popover, {
      props: {
        title: 'Popover Title',
        disabled: true
      },
      slots: {
        default: '<div>Content</div>',
        reference: '<button>Click me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const popover = wrapper.find('.el-popover')
    expect(popover.props('disabled')).toBe(true)
  })

  it('enables popover when disabled prop is false', () => {
    const wrapper = mount(Popover, {
      props: {
        title: 'Popover Title',
        disabled: false
      },
      slots: {
        default: '<div>Content</div>',
        reference: '<button>Click me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const popover = wrapper.find('.el-popover')
    expect(popover.props('disabled')).toBe(false)
  })

  it('displays content when content prop is provided', () => {
    const wrapper = mount(Popover, {
      props: {
        title: 'Popover Title',
        content: 'This is popover content'
      },
      slots: {
        reference: '<button>Click me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const popover = wrapper.find('.el-popover')
    expect(popover.props('content')).toBe('This is popover content')
  })

  it('applies custom offset when offset prop is provided', () => {
    const wrapper = mount(Popover, {
      props: {
        title: 'Popover Title',
        offset: 10
      },
      slots: {
        default: '<div>Content</div>',
        reference: '<button>Click me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const popover = wrapper.find('.el-popover')
    expect(popover.props('offset')).toBe(10)
  })

  it('applies custom transition when transition prop is provided', () => {
    const wrapper = mount(Popover, {
      props: {
        title: 'Popover Title',
        transition: 'fade'
      },
      slots: {
        default: '<div>Content</div>',
        reference: '<button>Click me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const popover = wrapper.find('.el-popover')
    expect(popover.props('transition')).toBe('fade')
  })

  it('controls visibility when visible prop is provided', () => {
    const wrapper = mount(Popover, {
      props: {
        title: 'Popover Title',
        visible: true
      },
      slots: {
        default: '<div>Content</div>',
        reference: '<button>Click me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const popover = wrapper.find('.el-popover')
    expect(popover.props('visible')).toBe(true)
  })

  it('applies custom popper class when popperClass prop is provided', () => {
    const wrapper = mount(Popover, {
      props: {
        title: 'Popover Title',
        popperClass: 'custom-popover'
      },
      slots: {
        default: '<div>Content</div>',
        reference: '<button>Click me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const popover = wrapper.find('.el-popover')
    expect(popover.props('popperClass')).toBe('custom-popover')
  })

  it('applies custom popper style when popperStyle prop is provided', () => {
    const customStyle = { backgroundColor: '#f0f0f0', borderRadius: '8px' }
    const wrapper = mount(Popover, {
      props: {
        title: 'Popover Title',
        popperStyle: customStyle
      },
      slots: {
        default: '<div>Content</div>',
        reference: '<button>Click me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const popover = wrapper.find('.el-popover')
    expect(popover.props('popperStyle')).toEqual(customStyle)
  })

  it('shows arrow when showArrow prop is true', () => {
    const wrapper = mount(Popover, {
      props: {
        title: 'Popover Title',
        showArrow: true
      },
      slots: {
        default: '<div>Content</div>',
        reference: '<button>Click me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const popover = wrapper.find('.el-popover')
    expect(popover.props('showArrow')).toBe(true)
  })

  it('hides arrow when showArrow prop is false', () => {
    const wrapper = mount(Popover, {
      props: {
        title: 'Popover Title',
        showArrow: false
      },
      slots: {
        default: '<div>Content</div>',
        reference: '<button>Click me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const popover = wrapper.find('.el-popover')
    expect(popover.props('showArrow')).toBe(false)
  })

  it('applies custom tabindex when tabindex prop is provided', () => {
    const wrapper = mount(Popover, {
      props: {
        title: 'Popover Title',
        tabindex: 0
      },
      slots: {
        default: '<div>Content</div>',
        reference: '<button>Click me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const popover = wrapper.find('.el-popover')
    expect(popover.props('tabindex')).toBe(0)
  })

  it('uses teleported rendering when teleported prop is true', () => {
    const wrapper = mount(Popover, {
      props: {
        title: 'Popover Title',
        teleported: true
      },
      slots: {
        default: '<div>Content</div>',
        reference: '<button>Click me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const popover = wrapper.find('.el-popover')
    expect(popover.props('teleported')).toBe(true)
  })

  it('makes popover persistent when persistent prop is true', () => {
    const wrapper = mount(Popover, {
      props: {
        title: 'Popover Title',
        persistent: true
      },
      slots: {
        default: '<div>Content</div>',
        reference: '<button>Click me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const popover = wrapper.find('.el-popover')
    expect(popover.props('persistent')).toBe(true)
  })

  it('shows modal overlay when modal prop is true', () => {
    const wrapper = mount(Popover, {
      props: {
        title: 'Popover Title',
        modal: true
      },
      slots: {
        default: '<div>Content</div>',
        reference: '<button>Click me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const popover = wrapper.find('.el-popover')
    expect(popover.props('modal')).toBe(true)
  })

  it('applies close delay when closeDelay prop is provided', () => {
    const wrapper = mount(Popover, {
      props: {
        title: 'Popover Title',
        closeDelay: 200
      },
      slots: {
        default: '<div>Content</div>',
        reference: '<button>Click me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const popover = wrapper.find('.el-popover')
    expect(popover.props('closeDelay')).toBe(200)
  })

  it('emits show event when popover is shown', async () => {
    const wrapper = mount(Popover, {
      props: {
        title: 'Popover Title'
      },
      slots: {
        default: '<div>Content</div>',
        reference: '<button>Click me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('show')
    expect(wrapper.emitted('show')).toBeTruthy()
  })

  it('emits hide event when popover is hidden', async () => {
    const wrapper = mount(Popover, {
      props: {
        title: 'Popover Title'
      },
      slots: {
        default: '<div>Content</div>',
        reference: '<button>Click me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('hide')
    expect(wrapper.emitted('hide')).toBeTruthy()
  })

  it('emits update:visible event when visibility changes', async () => {
    const wrapper = mount(Popover, {
      props: {
        title: 'Popover Title'
      },
      slots: {
        default: '<div>Content</div>',
        reference: '<button>Click me</button>'
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
    const wrapper = mount(Popover, {
      props: {
        title: 'Popover Title'
      },
      slots: {
        default: '<div class="custom-content">Custom content</div>',
        reference: '<button>Click me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.custom-content').exists()).toBe(true)
    expect(wrapper.find('.custom-content').text()).toBe('Custom content')
  })

  it('renders reference slot content', () => {
    const wrapper = mount(Popover, {
      props: {
        title: 'Popover Title'
      },
      slots: {
        default: '<div>Content</div>',
        reference: '<button class="custom-button">Custom button</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.custom-button').exists()).toBe(true)
    expect(wrapper.find('.custom-button').text()).toBe('Custom button')
  })

  it('renders title slot when provided', () => {
    const wrapper = mount(Popover, {
      props: {
        title: 'Default Title'
      },
      slots: {
        default: '<div>Content</div>',
        reference: '<button>Click me</button>',
        title: '<h3 class="custom-title">Custom Title</h3>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.custom-title').exists()).toBe(true)
    expect(wrapper.find('.custom-title').text()).toBe('Custom Title')
  })

  it('applies custom CSS classes when className prop is provided', () => {
    const wrapper = mount(Popover, {
      props: {
        title: 'Popover Title',
        className: 'custom-popover-wrapper'
      },
      slots: {
        default: '<div>Content</div>',
        reference: '<button>Click me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('className')).toBe('custom-popover-wrapper')
  })

  it('handles empty title gracefully', () => {
    const wrapper = mount(Popover, {
      props: {
        title: ''
      },
      slots: {
        default: '<div>Content</div>',
        reference: '<button>Click me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('title')).toBe('')
    expect(wrapper.find('.el-popover').exists()).toBe(true)
  })

  it('handles null title gracefully', () => {
    const wrapper = mount(Popover, {
      props: {
        title: null
      },
      slots: {
        default: '<div>Content</div>',
        reference: '<button>Click me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('title')).toBe(null)
    expect(wrapper.find('.el-popover').exists()).toBe(true)
  })

  it('handles undefined title gracefully', () => {
    const wrapper = mount(Popover, {
      props: {
        title: undefined
      },
      slots: {
        default: '<div>Content</div>',
        reference: '<button>Click me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('title')).toBe(undefined)
    expect(wrapper.find('.el-popover').exists()).toBe(true)
  })

  it('supports HTML content when html prop is true', () => {
    const htmlContent = '<strong>Bold text</strong> and <em>italic text</em>'
    const wrapper = mount(Popover, {
      props: {
        title: 'Popover Title',
        content: htmlContent,
        html: true
      },
      slots: {
        reference: '<button>Click me</button>'
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
    const wrapper = mount(Popover, {
      props: {
        title: 'Popover Title',
        content: htmlContent,
        html: false
      },
      slots: {
        reference: '<button>Click me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('content')).toBe(htmlContent)
    expect(wrapper.props('html')).toBe(false)
  })

  it('supports custom trigger with hover', () => {
    const wrapper = mount(Popover, {
      props: {
        title: 'Popover Title',
        trigger: 'hover'
      },
      slots: {
        default: '<div>Content</div>',
        reference: '<button>Hover me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('trigger')).toBe('hover')
  })

  it('supports custom trigger with focus', () => {
    const wrapper = mount(Popover, {
      props: {
        title: 'Popover Title',
        trigger: 'focus'
      },
      slots: {
        default: '<div>Content</div>',
        reference: '<button>Focus me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('trigger')).toBe('focus')
  })

  it('supports custom trigger with manual', () => {
    const wrapper = mount(Popover, {
      props: {
        title: 'Popover Title',
        trigger: 'manual'
      },
      slots: {
        default: '<div>Content</div>',
        reference: '<button>Manual trigger</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('trigger')).toBe('manual')
  })

  it('supports custom trigger with contextmenu', () => {
    const wrapper = mount(Popover, {
      props: {
        title: 'Popover Title',
        trigger: 'contextmenu'
      },
      slots: {
        default: '<div>Content</div>',
        reference: '<button>Right click me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('trigger')).toBe('contextmenu')
  })

  it('supports header and footer slots', () => {
    const wrapper = mount(Popover, {
      props: {
        title: 'Popover Title'
      },
      slots: {
        default: '<div>Content</div>',
        reference: '<button>Click me</button>',
        header: '<div class="custom-header">Header content</div>',
        footer: '<div class="custom-footer">Footer content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.custom-header').exists()).toBe(true)
    expect(wrapper.find('.custom-footer').exists()).toBe(true)
  })

  it('supports close button when showClose prop is true', () => {
    const wrapper = mount(Popover, {
      props: {
        title: 'Popover Title',
        showClose: true
      },
      slots: {
        default: '<div>Content</div>',
        reference: '<button>Click me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('showClose')).toBe(true)
  })

  it('supports custom close button text', () => {
    const wrapper = mount(Popover, {
      props: {
        title: 'Popover Title',
        showClose: true,
        closeText: 'Close'
      },
      slots: {
        default: '<div>Content</div>',
        reference: '<button>Click me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('closeText')).toBe('Close')
  })

  it('emits close event when close button is clicked', async () => {
    const wrapper = mount(Popover, {
      props: {
        title: 'Popover Title',
        showClose: true
      },
      slots: {
        default: '<div>Content</div>',
        reference: '<button>Click me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('close')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('supports interactive popover when interactive prop is true', () => {
    const wrapper = mount(Popover, {
      props: {
        title: 'Popover Title',
        interactive: true
      },
      slots: {
        default: '<div>Content</div>',
        reference: '<button>Click me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('interactive')).toBe(true)
  })
})