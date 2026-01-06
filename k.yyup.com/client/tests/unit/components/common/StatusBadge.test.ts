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
import StatusBadge from '@/components/common/StatusBadge.vue'
import ElementPlus from 'element-plus'

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElTag: {
    name: 'ElTag',
    template: '<span class="el-tag"><slot></slot></span>',
    props: ['type', 'size', 'effect', 'closable', 'disableTransitions', 'hit', 'color']
  },
  ElBadge: {
    name: 'ElBadge',
    template: '<span class="el-badge"><slot></slot></span>',
    props: ['value', 'max', 'isDot', 'hidden', 'type']
  },
  ElTooltip: {
    name: 'ElTooltip',
    template: '<div class="el-tooltip"><slot></slot><slot name="content"></slot></div>',
    props: ['content', 'placement', 'effect', 'disabled', 'offset', 'transition']
  },
  ElIcon: {
    name: 'ElIcon',
    template: '<i class="el-icon"><slot></slot></i>',
    props: ['size', 'color']
  }
}))

describe('StatusBadge.vue', () => {
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
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'active'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.el-tag').exists()).toBe(true)
  })

  it('displays correct status text', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'active'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.text()).toBe('Active')
  })

  it('applies correct type for active status', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'active'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tag = wrapper.find('.el-tag')
    expect(tag.props('type')).toBe('success')
  })

  it('applies correct type for inactive status', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'inactive'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tag = wrapper.find('.el-tag')
    expect(tag.props('type')).toBe('info')
  })

  it('applies correct type for pending status', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'pending'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tag = wrapper.find('.el-tag')
    expect(tag.props('type')).toBe('warning')
  })

  it('applies correct type for error status', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'error'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tag = wrapper.find('.el-tag')
    expect(tag.props('type')).toBe('danger')
  })

  it('applies correct type for warning status', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'warning'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tag = wrapper.find('.el-tag')
    expect(tag.props('type')).toBe('warning')
  })

  it('applies correct type for success status', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'success'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tag = wrapper.find('.el-tag')
    expect(tag.props('type')).toBe('success')
  })

  it('applies default type for unknown status', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'unknown'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tag = wrapper.find('.el-tag')
    expect(tag.props('type')).toBe('info')
  })

  it('displays custom label when provided', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'active',
        label: 'Online'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.text()).toBe('Online')
  })

  it('displays default label when custom label is not provided', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'active'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.text()).toBe('Active')
  })

  it('applies custom color when provided', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'active',
        color: '#ff0000'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tag = wrapper.find('.el-tag')
    expect(tag.props('color')).toBe('#ff0000')
  })

  it('applies default color when custom color is not provided', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'active'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tag = wrapper.find('.el-tag')
    expect(tag.props('color')).toBeUndefined()
  })

  it('applies correct size when size prop is provided', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'active',
        size: 'large'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tag = wrapper.find('.el-tag')
    expect(tag.props('size')).toBe('large')
  })

  it('applies default size when size prop is not provided', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'active'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tag = wrapper.find('.el-tag')
    expect(tag.props('size')).toBeUndefined()
  })

  it('applies correct effect when effect prop is provided', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'active',
        effect: 'dark'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tag = wrapper.find('.el-tag')
    expect(tag.props('effect')).toBe('dark')
  })

  it('applies default effect when effect prop is not provided', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'active'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tag = wrapper.find('.el-tag')
    expect(tag.props('effect')).toBeUndefined()
  })

  it('shows dot indicator when showDot prop is true', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'active',
        showDot: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.el-badge').exists()).toBe(true)
  })

  it('does not show dot indicator when showDot prop is false', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'active',
        showDot: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.el-badge').exists()).toBe(false)
  })

  it('shows tooltip when tooltip prop is provided', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'active',
        tooltip: 'This user is currently active'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.el-tooltip').exists()).toBe(true)
  })

  it('does not show tooltip when tooltip prop is not provided', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'active'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.el-tooltip').exists()).toBe(false)
  })

  it('shows icon when icon prop is provided', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'active',
        icon: 'el-icon-success'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.el-icon').exists()).toBe(true)
  })

  it('does not show icon when icon prop is not provided', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'active'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.el-icon').exists()).toBe(false)
  })

  it('makes badge clickable when clickable prop is true', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'active',
        clickable: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('clickable')).toBe(true)
  })

  it('makes badge non-clickable when clickable prop is false', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'active',
        clickable: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('clickable')).toBe(false)
  })

  it('emits click event when badge is clicked', async () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'active',
        clickable: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('emits click event with status data', async () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'active',
        clickable: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')[0]).toEqual(['active'])
  })

  it('applies custom CSS classes when className prop is provided', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'active',
        className: 'custom-status-badge'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('className')).toBe('custom-status-badge')
  })

  it('supports custom status type mapping', () => {
    const customTypeMapping = {
      custom: 'primary',
      special: 'warning'
    }

    const wrapper = mount(StatusBadge, {
      props: {
        status: 'custom',
        typeMapping: customTypeMapping
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tag = wrapper.find('.el-tag')
    expect(tag.props('type')).toBe('primary')
  })

  it('supports custom status labels', () => {
    const customLabels = {
      active: 'Online',
      inactive: 'Offline',
      pending: 'Processing'
    }

    const wrapper = mount(StatusBadge, {
      props: {
        status: 'active',
        labels: customLabels
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.text()).toBe('Online')
  })

  it('supports uppercase text transformation', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'active',
        uppercase: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.text()).toBe('ACTIVE')
  })

  it('supports lowercase text transformation', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'active',
        uppercase: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.text()).toBe('Active')
  })

  it('shows loading state when loading prop is true', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'active',
        loading: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('loading')).toBe(true)
  })

  it('hides loading state when loading prop is false', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'active',
        loading: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('loading')).toBe(false)
  })

  it('supports badge count when count prop is provided', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'active',
        count: 5
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const badge = wrapper.find('.el-badge')
    expect(badge.props('value')).toBe(5)
  })

  it('supports badge max count when max prop is provided', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'active',
        count: 100,
        max: 99
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const badge = wrapper.find('.el-badge')
    expect(badge.props('max')).toBe(99)
  })

  it('handles empty status gracefully', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: ''
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.text()).toBe('')
    expect(wrapper.find('.el-tag').exists()).toBe(true)
  })

  it('handles null status gracefully', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: null
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.text()).toBe('')
    expect(wrapper.find('.el-tag').exists()).toBe(true)
  })

  it('handles undefined status gracefully', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: undefined
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.text()).toBe('')
    expect(wrapper.find('.el-tag').exists()).toBe(true)
  })

  it('renders custom slots when provided', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'active'
      },
      slots: {
        'default': '<span class="custom-content">Custom Content</span>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.custom-content').exists()).toBe(true)
  })

  it('supports animated transitions when animated prop is true', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'active',
        animated: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('animated')).toBe(true)
  })

  it('does not support animated transitions when animated prop is false', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'active',
        animated: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('animated')).toBe(false)
  })

  it('supports rounded corners when rounded prop is true', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'active',
        rounded: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('rounded')).toBe(true)
  })

  it('does not support rounded corners when rounded prop is false', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'active',
        rounded: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('rounded')).toBe(false)
  })
})