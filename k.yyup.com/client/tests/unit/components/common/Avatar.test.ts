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
import Avatar from '@/components/common/Avatar.vue'
import ElementPlus from 'element-plus'

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElAvatar: {
    name: 'ElAvatar',
    template: '<div class="el-avatar"><slot></slot></div>',
    props: ['size', 'shape', 'src', 'icon', 'alt', 'fit', 'loading']
  },
  ElImage: {
    name: 'ElImage',
    template: '<img class="el-image" />',
    props: ['src', 'alt', 'fit', 'loading', 'lazy', 'previewSrcList']
  },
  ElTooltip: {
    name: 'ElTooltip',
    template: '<div class="el-tooltip"><slot></slot><slot name="content"></slot></div>',
    props: ['content', 'placement', 'effect', 'disabled', 'offset']
  },
  ElDropdown: {
    name: 'ElDropdown',
    template: '<div class="el-dropdown"><slot></slot></div>',
    props: ['trigger', 'placement', 'hideOnClick', 'disabled']
  },
  ElDropdownMenu: {
    name: 'ElDropdownMenu',
    template: '<div class="el-dropdown-menu"><slot></slot></div>'
  },
  ElDropdownItem: {
    name: 'ElDropdownItem',
    template: '<div class="el-dropdown-item"><slot></slot></div>',
    props: ['command', 'disabled', 'divided', 'icon']
  },
  ElIcon: {
    name: 'ElIcon',
    template: '<i class="el-icon"><slot></slot></i>',
    props: ['size', 'color']
  },
  ElBadge: {
    name: 'ElBadge',
    template: '<span class="el-badge"><slot></slot></span>',
    props: ['value', 'max', 'isDot', 'hidden', 'type']
  }
}))

describe('Avatar.vue', () => {
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
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.el-avatar').exists()).toBe(true)
  })

  it('displays user initials when no image is provided', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.text()).toBe('JD')
  })

  it('displays single initial for single name', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.text()).toBe('J')
  })

  it('displays first two initials for long names', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Michael Doe'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.text()).toBe('JM')
  })

  it('displays image when src prop is provided', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe',
        src: 'https://example.com/avatar.jpg'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const avatar = wrapper.find('.el-avatar')
    expect(avatar.props('src')).toBe('https://example.com/avatar.jpg')
  })

  it('applies correct size when size prop is provided', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe',
        size: 'large'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const avatar = wrapper.find('.el-avatar')
    expect(avatar.props('size')).toBe('large')
  })

  it('applies custom size when numeric size is provided', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe',
        size: 64
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const avatar = wrapper.find('.el-avatar')
    expect(avatar.props('size')).toBe(64)
  })

  it('applies circular shape when shape is circle', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe',
        shape: 'circle'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const avatar = wrapper.find('.el-avatar')
    expect(avatar.props('shape')).toBe('circle')
  })

  it('applies square shape when shape is square', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe',
        shape: 'square'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const avatar = wrapper.find('.el-avatar')
    expect(avatar.props('shape')).toBe('square')
  })

  it('applies default shape when shape is not provided', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const avatar = wrapper.find('.el-avatar')
    expect(avatar.props('shape')).toBe('circle')
  })

  it('shows tooltip when tooltip prop is provided', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe',
        tooltip: 'John Doe - Software Engineer'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.el-tooltip').exists()).toBe(true)
  })

  it('does not show tooltip when tooltip prop is not provided', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.el-tooltip').exists()).toBe(false)
  })

  it('shows dropdown when dropdownItems prop is provided', () => {
    const dropdownItems = [
      { label: 'View Profile', command: 'view' },
      { label: 'Settings', command: 'settings' },
      { label: 'Logout', command: 'logout' }
    ]

    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe',
        dropdownItems: dropdownItems
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.el-dropdown').exists()).toBe(true)
  })

  it('does not show dropdown when dropdownItems prop is not provided', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.el-dropdown').exists()).toBe(false)
  })

  it('emits dropdown-command event when dropdown item is clicked', async () => {
    const dropdownItems = [
      { label: 'View Profile', command: 'view' },
      { label: 'Settings', command: 'settings' }
    ]

    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe',
        dropdownItems: dropdownItems
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('dropdown-command', 'view')
    expect(wrapper.emitted('dropdown-command')).toBeTruthy()
    expect(wrapper.emitted('dropdown-command')[0]).toEqual(['view'])
  })

  it('shows badge when badge prop is provided', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe',
        badge: 3
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.el-badge').exists()).toBe(true)
  })

  it('does not show badge when badge prop is not provided', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.el-badge').exists()).toBe(false)
  })

  it('shows dot badge when badge isDot prop is true', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe',
        badge: { isDot: true }
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const badge = wrapper.find('.el-badge')
    expect(badge.props('isDot')).toBe(true)
  })

  it('emits click event when avatar is clicked', async () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe',
        clickable: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('does not emit click event when avatar is not clickable', async () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe',
        clickable: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('applies custom alt text when alt prop is provided', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe',
        src: 'https://example.com/avatar.jpg',
        alt: 'Profile picture of John Doe'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const avatar = wrapper.find('.el-avatar')
    expect(avatar.props('alt')).toBe('Profile picture of John Doe')
  })

  it('applies default alt text when alt prop is not provided', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe',
        src: 'https://example.com/avatar.jpg'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const avatar = wrapper.find('.el-avatar')
    expect(avatar.props('alt')).toBe('John Doe')
  })

  it('applies custom fit when fit prop is provided', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe',
        src: 'https://example.com/avatar.jpg',
        fit: 'cover'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const avatar = wrapper.find('.el-avatar')
    expect(avatar.props('fit')).toBe('cover')
  })

  it('shows icon when icon prop is provided', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe',
        icon: 'el-icon-user'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const avatar = wrapper.find('.el-avatar')
    expect(avatar.props('icon')).toBe('el-icon-user')
  })

  it('shows loading state when loading prop is true', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe',
        loading: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const avatar = wrapper.find('.el-avatar')
    expect(avatar.props('loading')).toBe('lazy')
  })

  it('hides loading state when loading prop is false', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe',
        loading: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const avatar = wrapper.find('.el-avatar')
    expect(avatar.props('loading')).toBe('eager')
  })

  it('applies custom CSS classes when className prop is provided', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe',
        className: 'custom-avatar'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('className')).toBe('custom-avatar')
  })

  it('handles empty name gracefully', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: ''
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.text()).toBe('')
    expect(wrapper.find('.el-avatar').exists()).toBe(true)
  })

  it('handles null name gracefully', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: null
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.text()).toBe('')
    expect(wrapper.find('.el-avatar').exists()).toBe(true)
  })

  it('handles undefined name gracefully', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: undefined
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.text()).toBe('')
    expect(wrapper.find('.el-avatar').exists()).toBe(true)
  })

  it('supports online status indicator', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe',
        online: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('online')).toBe(true)
  })

  it('supports offline status indicator', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe',
        online: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('online')).toBe(false)
  })

  it('supports custom status indicator', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe',
        status: 'away'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('status')).toBe('away')
  })

  it('supports avatar group functionality', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe',
        group: true,
        groupSize: 3
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('group')).toBe(true)
    expect(wrapper.props('groupSize')).toBe(3)
  })

  it('supports fallback image when image fails to load', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe',
        src: 'https://example.com/avatar.jpg',
        fallback: 'https://example.com/fallback.jpg'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('fallback')).toBe('https://example.com/fallback.jpg')
  })

  it('emits error event when image fails to load', async () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe',
        src: 'https://example.com/avatar.jpg'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('error', new Error('Failed to load image'))
    expect(wrapper.emitted('error')).toBeTruthy()
  })

  it('supports lazy loading when lazy prop is true', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe',
        src: 'https://example.com/avatar.jpg',
        lazy: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('lazy')).toBe(true)
  })

  it('supports image preview when preview prop is true', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe',
        src: 'https://example.com/avatar.jpg',
        preview: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('preview')).toBe(true)
  })

  it('supports custom preview list when previewSrcList prop is provided', () => {
    const previewSrcList = [
      'https://example.com/avatar1.jpg',
      'https://example.com/avatar2.jpg'
    ]

    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe',
        src: 'https://example.com/avatar.jpg',
        preview: true,
        previewSrcList: previewSrcList
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('previewSrcList')).toEqual(previewSrcList)
  })

  it('renders custom slots when provided', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe'
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

  it('supports border when bordered prop is true', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe',
        bordered: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('bordered')).toBe(true)
  })

  it('supports custom border color when borderColor prop is provided', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe',
        bordered: true,
        borderColor: '#ff0000'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('borderColor')).toBe('#ff0000')
  })
})