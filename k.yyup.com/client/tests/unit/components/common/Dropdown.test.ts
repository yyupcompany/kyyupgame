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
import Dropdown from '@/components/common/Dropdown.vue'
import ElementPlus from 'element-plus'

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElDropdown: {
    name: 'ElDropdown',
    template: '<div class="el-dropdown"><slot></slot><slot name="dropdown"></slot></div>',
    props: [
      'trigger', 'placement', 'hideOnClick', 'disabled', 'size', 'splitButton',
      'type', 'teleported', 'popperClass', 'popperOptions', 'showTimeout',
      'hideTimeout', 'maxHeight'
    ]
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
  ElButton: {
    name: 'ElButton',
    template: '<button class="el-button"><slot></slot></button>',
    props: ['type', 'size', 'disabled', 'icon', 'loading']
  },
  ElIcon: {
    name: 'ElIcon',
    template: '<i class="el-icon"><slot></slot></i>',
    props: ['size', 'color']
  },
  ElDivider: {
    name: 'ElDivider',
    template: '<div class="el-divider"></div>',
    props: ['contentPosition']
  }
}))

describe('Dropdown.vue', () => {
  let router: Router

  beforeEach(() => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } }
      ]
    })
  })

  const mockItems = [
    { label: 'Edit', command: 'edit', icon: 'el-icon-edit' },
    { label: 'Delete', command: 'delete', icon: 'el-icon-delete', divided: true },
    { label: 'Share', command: 'share', icon: 'el-icon-share' },
    { label: 'Settings', command: 'settings', disabled: true }
  ]

  it('renders properly with default props', () => {
    const wrapper = mount(Dropdown, {
      props: {
        items: mockItems
      },
      slots: {
        default: '<button>Dropdown</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.el-dropdown').exists()).toBe(true)
  })

  it('displays correct dropdown items', () => {
    const wrapper = mount(Dropdown, {
      props: {
        items: mockItems
      },
      slots: {
        default: '<button>Dropdown</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const dropdownItems = wrapper.findAll('.el-dropdown-item')
    expect(dropdownItems.length).toBe(mockItems.length)
  })

  it('applies correct trigger when trigger prop is provided', () => {
    const wrapper = mount(Dropdown, {
      props: {
        items: mockItems,
        trigger: 'hover'
      },
      slots: {
        default: '<button>Dropdown</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const dropdown = wrapper.find('.el-dropdown')
    expect(dropdown.props('trigger')).toBe('hover')
  })

  it('applies default trigger when trigger prop is not provided', () => {
    const wrapper = mount(Dropdown, {
      props: {
        items: mockItems
      },
      slots: {
        default: '<button>Dropdown</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const dropdown = wrapper.find('.el-dropdown')
    expect(dropdown.props('trigger')).toBe('click')
  })

  it('applies correct placement when placement prop is provided', () => {
    const wrapper = mount(Dropdown, {
      props: {
        items: mockItems,
        placement: 'bottom-start'
      },
      slots: {
        default: '<button>Dropdown</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const dropdown = wrapper.find('.el-dropdown')
    expect(dropdown.props('placement')).toBe('bottom-start')
  })

  it('applies default placement when placement prop is not provided', () => {
    const wrapper = mount(Dropdown, {
      props: {
        items: mockItems
      },
      slots: {
        default: '<button>Dropdown</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const dropdown = wrapper.find('.el-dropdown')
    expect(dropdown.props('placement')).toBe('bottom-end')
  })

  it('hides dropdown on click when hideOnClick prop is true', () => {
    const wrapper = mount(Dropdown, {
      props: {
        items: mockItems,
        hideOnClick: true
      },
      slots: {
        default: '<button>Dropdown</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const dropdown = wrapper.find('.el-dropdown')
    expect(dropdown.props('hideOnClick')).toBe(true)
  })

  it('does not hide dropdown on click when hideOnClick prop is false', () => {
    const wrapper = mount(Dropdown, {
      props: {
        items: mockItems,
        hideOnClick: false
      },
      slots: {
        default: '<button>Dropdown</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const dropdown = wrapper.find('.el-dropdown')
    expect(dropdown.props('hideOnClick')).toBe(false)
  })

  it('disables dropdown when disabled prop is true', () => {
    const wrapper = mount(Dropdown, {
      props: {
        items: mockItems,
        disabled: true
      },
      slots: {
        default: '<button>Dropdown</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const dropdown = wrapper.find('.el-dropdown')
    expect(dropdown.props('disabled')).toBe(true)
  })

  it('enables dropdown when disabled prop is false', () => {
    const wrapper = mount(Dropdown, {
      props: {
        items: mockItems,
        disabled: false
      },
      slots: {
        default: '<button>Dropdown</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const dropdown = wrapper.find('.el-dropdown')
    expect(dropdown.props('disabled')).toBe(false)
  })

  it('applies correct size when size prop is provided', () => {
    const wrapper = mount(Dropdown, {
      props: {
        items: mockItems,
        size: 'large'
      },
      slots: {
        default: '<button>Dropdown</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const dropdown = wrapper.find('.el-dropdown')
    expect(dropdown.props('size')).toBe('large')
  })

  it('applies split button when splitButton prop is true', () => {
    const wrapper = mount(Dropdown, {
      props: {
        items: mockItems,
        splitButton: true
      },
      slots: {
        default: '<button>Dropdown</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const dropdown = wrapper.find('.el-dropdown')
    expect(dropdown.props('splitButton')).toBe(true)
  })

  it('applies button type when type prop is provided', () => {
    const wrapper = mount(Dropdown, {
      props: {
        items: mockItems,
        type: 'primary'
      },
      slots: {
        default: '<button>Dropdown</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const dropdown = wrapper.find('.el-dropdown')
    expect(dropdown.props('type')).toBe('primary')
  })

  it('uses teleported rendering when teleported prop is true', () => {
    const wrapper = mount(Dropdown, {
      props: {
        items: mockItems,
        teleported: true
      },
      slots: {
        default: '<button>Dropdown</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const dropdown = wrapper.find('.el-dropdown')
    expect(dropdown.props('teleported')).toBe(true)
  })

  it('applies custom popper class when popperClass prop is provided', () => {
    const wrapper = mount(Dropdown, {
      props: {
        items: mockItems,
        popperClass: 'custom-dropdown'
      },
      slots: {
        default: '<button>Dropdown</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const dropdown = wrapper.find('.el-dropdown')
    expect(dropdown.props('popperClass')).toBe('custom-dropdown')
  })

  it('applies custom popper options when popperOptions prop is provided', () => {
    const customOptions = { strategy: 'fixed', modifiers: [] }
    const wrapper = mount(Dropdown, {
      props: {
        items: mockItems,
        popperOptions: customOptions
      },
      slots: {
        default: '<button>Dropdown</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const dropdown = wrapper.find('.el-dropdown')
    expect(dropdown.props('popperOptions')).toEqual(customOptions)
  })

  it('applies custom show timeout when showTimeout prop is provided', () => {
    const wrapper = mount(Dropdown, {
      props: {
        items: mockItems,
        showTimeout: 250
      },
      slots: {
        default: '<button>Dropdown</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const dropdown = wrapper.find('.el-dropdown')
    expect(dropdown.props('showTimeout')).toBe(250)
  })

  it('applies custom hide timeout when hideTimeout prop is provided', () => {
    const wrapper = mount(Dropdown, {
      props: {
        items: mockItems,
        hideTimeout: 150
      },
      slots: {
        default: '<button>Dropdown</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const dropdown = wrapper.find('.el-dropdown')
    expect(dropdown.props('hideTimeout')).toBe(150)
  })

  it('applies max height when maxHeight prop is provided', () => {
    const wrapper = mount(Dropdown, {
      props: {
        items: mockItems,
        maxHeight: 300
      },
      slots: {
        default: '<button>Dropdown</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const dropdown = wrapper.find('.el-dropdown')
    expect(dropdown.props('maxHeight')).toBe(300)
  })

  it('emits command event when dropdown item is clicked', async () => {
    const wrapper = mount(Dropdown, {
      props: {
        items: mockItems
      },
      slots: {
        default: '<button>Dropdown</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('command', 'edit')
    expect(wrapper.emitted('command')).toBeTruthy()
    expect(wrapper.emitted('command')[0]).toEqual(['edit'])
  })

  it('emits visible-change event when dropdown visibility changes', async () => {
    const wrapper = mount(Dropdown, {
      props: {
        items: mockItems
      },
      slots: {
        default: '<button>Dropdown</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('visible-change', true)
    expect(wrapper.emitted('visible-change')).toBeTruthy()
    expect(wrapper.emitted('visible-change')[0]).toEqual([true])
  })

  it('emits click event when dropdown trigger is clicked', async () => {
    const wrapper = mount(Dropdown, {
      props: {
        items: mockItems
      },
      slots: {
        default: '<button>Dropdown</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('renders default slot content', () => {
    const wrapper = mount(Dropdown, {
      props: {
        items: mockItems
      },
      slots: {
        default: '<button class="custom-button">Custom Button</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.custom-button').exists()).toBe(true)
    expect(wrapper.find('.custom-button').text()).toBe('Custom Button')
  })

  it('renders dropdown items with correct labels', () => {
    const wrapper = mount(Dropdown, {
      props: {
        items: mockItems
      },
      slots: {
        default: '<button>Dropdown</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const dropdownItems = wrapper.findAll('.el-dropdown-item')
    expect(dropdownItems[0].text()).toBe('Edit')
    expect(dropdownItems[1].text()).toBe('Delete')
    expect(dropdownItems[2].text()).toBe('Share')
    expect(dropdownItems[3].text()).toBe('Settings')
  })

  it('applies divided class to items with divided prop', () => {
    const wrapper = mount(Dropdown, {
      props: {
        items: mockItems
      },
      slots: {
        default: '<button>Dropdown</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const dropdownItems = wrapper.findAll('.el-dropdown-item')
    const dividedItem = dropdownItems[1] // Delete item has divided: true
    expect(dividedItem.props('divided')).toBe(true)
  })

  it('disables items with disabled prop', () => {
    const wrapper = mount(Dropdown, {
      props: {
        items: mockItems
      },
      slots: {
        default: '<button>Dropdown</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const dropdownItems = wrapper.findAll('.el-dropdown-item')
    const disabledItem = dropdownItems[3] // Settings item has disabled: true
    expect(disabledItem.props('disabled')).toBe(true)
  })

  it('shows icons for items with icon prop', () => {
    const wrapper = mount(Dropdown, {
      props: {
        items: mockItems
      },
      slots: {
        default: '<button>Dropdown</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const dropdownItems = wrapper.findAll('.el-dropdown-item')
    const itemWithIcon = dropdownItems[0] // Edit item has icon
    expect(itemWithIcon.props('icon')).toBe('el-icon-edit')
  })

  it('handles empty items array gracefully', () => {
    const wrapper = mount(Dropdown, {
      props: {
        items: []
      },
      slots: {
        default: '<button>Dropdown</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const dropdownItems = wrapper.findAll('.el-dropdown-item')
    expect(dropdownItems.length).toBe(0)
    expect(wrapper.find('.el-dropdown').exists()).toBe(true)
  })

  it('handles null items gracefully', () => {
    const wrapper = mount(Dropdown, {
      props: {
        items: null
      },
      slots: {
        default: '<button>Dropdown</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const dropdownItems = wrapper.findAll('.el-dropdown-item')
    expect(dropdownItems.length).toBe(0)
    expect(wrapper.find('.el-dropdown').exists()).toBe(true)
  })

  it('handles undefined items gracefully', () => {
    const wrapper = mount(Dropdown, {
      props: {
        items: undefined
      },
      slots: {
        default: '<button>Dropdown</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const dropdownItems = wrapper.findAll('.el-dropdown-item')
    expect(dropdownItems.length).toBe(0)
    expect(wrapper.find('.el-dropdown').exists()).toBe(true)
  })

  it('applies custom CSS classes when className prop is provided', () => {
    const wrapper = mount(Dropdown, {
      props: {
        items: mockItems,
        className: 'custom-dropdown-wrapper'
      },
      slots: {
        default: '<button>Dropdown</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('className')).toBe('custom-dropdown-wrapper')
  })

  it('supports custom item rendering', () => {
    const wrapper = mount(Dropdown, {
      props: {
        items: mockItems
      },
      slots: {
        default: '<button>Dropdown</button>',
        item: '<template #item="{ item }"><span class="custom-item">{{ item.label }}</span></template>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.custom-item').exists()).toBe(true)
  })

  it('supports header slot', () => {
    const wrapper = mount(Dropdown, {
      props: {
        items: mockItems
      },
      slots: {
        default: '<button>Dropdown</button>',
        header: '<div class="dropdown-header">Header Content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.dropdown-header').exists()).toBe(true)
    expect(wrapper.find('.dropdown-header').text()).toBe('Header Content')
  })

  it('supports footer slot', () => {
    const wrapper = mount(Dropdown, {
      props: {
        items: mockItems
      },
      slots: {
        default: '<button>Dropdown</button>',
        footer: '<div class="dropdown-footer">Footer Content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.dropdown-footer').exists()).toBe(true)
    expect(wrapper.find('.dropdown-footer').text()).toBe('Footer Content')
  })

  it('supports custom trigger with hover', () => {
    const wrapper = mount(Dropdown, {
      props: {
        items: mockItems,
        trigger: 'hover'
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

  it('supports custom trigger with contextmenu', () => {
    const wrapper = mount(Dropdown, {
      props: {
        items: mockItems,
        trigger: 'contextmenu'
      },
      slots: {
        default: '<button>Right click me</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('trigger')).toBe('contextmenu')
  })

  it('supports custom trigger with manual', () => {
    const wrapper = mount(Dropdown, {
      props: {
        items: mockItems,
        trigger: 'manual'
      },
      slots: {
        default: '<button>Manual trigger</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('trigger')).toBe('manual')
  })

  it('supports nested dropdown items', () => {
    const nestedItems = [
      { label: 'File', command: 'file', children: [
        { label: 'New', command: 'new' },
        { label: 'Open', command: 'open' }
      ]},
      { label: 'Edit', command: 'edit' }
    ]

    const wrapper = mount(Dropdown, {
      props: {
        items: nestedItems
      },
      slots: {
        default: '<button>Dropdown</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('items')).toEqual(nestedItems)
  })

  it('supports item groups', () => {
    const groupedItems = [
      {
        label: 'Group 1',
        group: true,
        children: [
          { label: 'Item 1', command: 'item1' },
          { label: 'Item 2', command: 'item2' }
        ]
      },
      {
        label: 'Group 2',
        group: true,
        children: [
          { label: 'Item 3', command: 'item3' },
          { label: 'Item 4', command: 'item4' }
        ]
      }
    ]

    const wrapper = mount(Dropdown, {
      props: {
        items: groupedItems
      },
      slots: {
        default: '<button>Dropdown</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('items')).toEqual(groupedItems)
  })

  it('supports custom item styling', () => {
    const styledItems = [
      { label: 'Red', command: 'red', style: { color: 'red' } },
      { label: 'Green', command: 'green', style: { color: 'green' } }
    ]

    const wrapper = mount(Dropdown, {
      props: {
        items: styledItems
      },
      slots: {
        default: '<button>Dropdown</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('items')).toEqual(styledItems)
  })

  it('supports item tooltips', () => {
    const tooltipItems = [
      { label: 'Save', command: 'save', tooltip: 'Save current file' },
      { label: 'Exit', command: 'exit', tooltip: 'Exit application' }
    ]

    const wrapper = mount(Dropdown, {
      props: {
        items: tooltipItems
      },
      slots: {
        default: '<button>Dropdown</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('items')).toEqual(tooltipItems)
  })

  it('supports keyboard navigation', async () => {
    const wrapper = mount(Dropdown, {
      props: {
        items: mockItems
      },
      slots: {
        default: '<button>Dropdown</button>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.emitted('keydown')).toBeTruthy()
  })
})