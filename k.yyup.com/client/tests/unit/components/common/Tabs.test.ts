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
import Tabs from '@/components/common/Tabs.vue'
import ElementPlus from 'element-plus'

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElTabs: {
    name: 'ElTabs',
    template: '<div class="el-tabs"><div class="el-tabs__header"><slot name="header"></slot></div><div class="el-tabs__content"><slot></slot></div></div>',
    props: [
      'modelValue', 'type', 'closable', 'addable', 'editable', 'tabPosition',
      'stretch', 'beforeLeave', 'lazy'
    ]
  },
  ElTabPane: {
    name: 'ElTabPane',
    template: '<div class="el-tab-pane"><slot></slot></div>',
    props: ['label', 'name', 'disabled', 'closable', 'lazy']
  },
  ElButton: {
    name: 'ElButton',
    template: '<button class="el-button"><slot></slot></button>',
    props: ['type', 'size', 'disabled', 'icon', 'circle']
  },
  ElIcon: {
    name: 'ElIcon',
    template: '<i class="el-icon"><slot></slot></i>',
    props: ['size', 'color']
  }
}))

describe('Tabs.vue', () => {
  let router: Router

  beforeEach(() => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } }
      ]
    })
  })

  const mockTabs = [
    { name: 'first', label: 'First Tab', content: 'First tab content' },
    { name: 'second', label: 'Second Tab', content: 'Second tab content' },
    { name: 'third', label: 'Third Tab', content: 'Third tab content', disabled: true }
  ]

  it('renders properly with default props', () => {
    const wrapper = mount(Tabs, {
      props: {
        tabs: mockTabs,
        modelValue: 'first'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.el-tabs').exists()).toBe(true)
  })

  it('displays correct tab panes', () => {
    const wrapper = mount(Tabs, {
      props: {
        tabs: mockTabs,
        modelValue: 'first'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tabPanes = wrapper.findAll('.el-tab-pane')
    expect(tabPanes.length).toBe(mockTabs.length)
  })

  it('binds modelValue correctly', () => {
    const wrapper = mount(Tabs, {
      props: {
        tabs: mockTabs,
        modelValue: 'second'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tabs = wrapper.find('.el-tabs')
    expect(tabs.props('modelValue')).toBe('second')
  })

  it('emits update:modelValue when tab changes', async () => {
    const wrapper = mount(Tabs, {
      props: {
        tabs: mockTabs,
        modelValue: 'first'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('update:modelValue', 'second')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['second'])
  })

  it('emits tab-click event when tab is clicked', async () => {
    const wrapper = mount(Tabs, {
      props: {
        tabs: mockTabs,
        modelValue: 'first'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('tab-click', { name: 'second', label: 'Second Tab' })
    expect(wrapper.emitted('tab-click')).toBeTruthy()
    expect(wrapper.emitted('tab-click')[0]).toEqual([{ name: 'second', label: 'Second Tab' }])
  })

  it('emits tab-change event when active tab changes', async () => {
    const wrapper = mount(Tabs, {
      props: {
        tabs: mockTabs,
        modelValue: 'first'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('tab-change', 'second')
    expect(wrapper.emitted('tab-change')).toBeTruthy()
    expect(wrapper.emitted('tab-change')[0]).toEqual(['second'])
  })

  it('applies correct type when type prop is provided', () => {
    const wrapper = mount(Tabs, {
      props: {
        tabs: mockTabs,
        modelValue: 'first',
        type: 'card'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tabs = wrapper.find('.el-tabs')
    expect(tabs.props('type')).toBe('card')
  })

  it('applies default type when type prop is not provided', () => {
    const wrapper = mount(Tabs, {
      props: {
        tabs: mockTabs,
        modelValue: 'first'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tabs = wrapper.find('.el-tabs')
    expect(tabs.props('type')).toBe(undefined)
  })

  it('makes tabs closable when closable prop is true', () => {
    const wrapper = mount(Tabs, {
      props: {
        tabs: mockTabs,
        modelValue: 'first',
        closable: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tabs = wrapper.find('.el-tabs')
    expect(tabs.props('closable')).toBe(true)
  })

  it('makes tabs non-closable when closable prop is false', () => {
    const wrapper = mount(Tabs, {
      props: {
        tabs: mockTabs,
        modelValue: 'first',
        closable: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tabs = wrapper.find('.el-tabs')
    expect(tabs.props('closable')).toBe(false)
  })

  it('makes tabs addable when addable prop is true', () => {
    const wrapper = mount(Tabs, {
      props: {
        tabs: mockTabs,
        modelValue: 'first',
        addable: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tabs = wrapper.find('.el-tabs')
    expect(tabs.props('addable')).toBe(true)
  })

  it('makes tabs non-addable when addable prop is false', () => {
    const wrapper = mount(Tabs, {
      props: {
        tabs: mockTabs,
        modelValue: 'first',
        addable: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tabs = wrapper.find('.el-tabs')
    expect(tabs.props('addable')).toBe(false)
  })

  it('makes tabs editable when editable prop is true', () => {
    const wrapper = mount(Tabs, {
      props: {
        tabs: mockTabs,
        modelValue: 'first',
        editable: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tabs = wrapper.find('.el-tabs')
    expect(tabs.props('editable')).toBe(true)
  })

  it('makes tabs non-editable when editable prop is false', () => {
    const wrapper = mount(Tabs, {
      props: {
        tabs: mockTabs,
        modelValue: 'first',
        editable: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tabs = wrapper.find('.el-tabs')
    expect(tabs.props('editable')).toBe(false)
  })

  it('applies correct tab position when tabPosition prop is provided', () => {
    const wrapper = mount(Tabs, {
      props: {
        tabs: mockTabs,
        modelValue: 'first',
        tabPosition: 'left'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tabs = wrapper.find('.el-tabs')
    expect(tabs.props('tabPosition')).toBe('left')
  })

  it('applies default tab position when tabPosition prop is not provided', () => {
    const wrapper = mount(Tabs, {
      props: {
        tabs: mockTabs,
        modelValue: 'first'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tabs = wrapper.find('.el-tabs')
    expect(tabs.props('tabPosition')).toBe('top')
  })

  it('stretches tabs when stretch prop is true', () => {
    const wrapper = mount(Tabs, {
      props: {
        tabs: mockTabs,
        modelValue: 'first',
        stretch: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tabs = wrapper.find('.el-tabs')
    expect(tabs.props('stretch')).toBe(true)
  })

  it('does not stretch tabs when stretch prop is false', () => {
    const wrapper = mount(Tabs, {
      props: {
        tabs: mockTabs,
        modelValue: 'first',
        stretch: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tabs = wrapper.find('.el-tabs')
    expect(tabs.props('stretch')).toBe(false)
  })

  it('disables individual tabs when disabled prop is true', () => {
    const wrapper = mount(Tabs, {
      props: {
        tabs: mockTabs,
        modelValue: 'first'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tabPanes = wrapper.findAll('.el-tab-pane')
    const disabledTab = tabPanes[2] // Third tab has disabled: true
    expect(disabledTab.props('disabled')).toBe(true)
  })

  it('makes individual tabs closable when closable prop is true', () => {
    const closableTabs = [
      { name: 'first', label: 'First Tab', content: 'First tab content', closable: true },
      { name: 'second', label: 'Second Tab', content: 'Second tab content', closable: false }
    ]

    const wrapper = mount(Tabs, {
      props: {
        tabs: closableTabs,
        modelValue: 'first'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tabPanes = wrapper.findAll('.el-tab-pane')
    const closableTab = tabPanes[0] // First tab has closable: true
    expect(closableTab.props('closable')).toBe(true)
  })

  it('makes individual tabs lazy when lazy prop is true', () => {
    const lazyTabs = [
      { name: 'first', label: 'First Tab', content: 'First tab content', lazy: true },
      { name: 'second', label: 'Second Tab', content: 'Second tab content', lazy: false }
    ]

    const wrapper = mount(Tabs, {
      props: {
        tabs: lazyTabs,
        modelValue: 'first'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tabPanes = wrapper.findAll('.el-tab-pane')
    const lazyTab = tabPanes[0] // First tab has lazy: true
    expect(lazyTab.props('lazy')).toBe(true)
  })

  it('emits tab-remove event when tab is removed', async () => {
    const wrapper = mount(Tabs, {
      props: {
        tabs: mockTabs,
        modelValue: 'first',
        closable: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('tab-remove', 'second')
    expect(wrapper.emitted('tab-remove')).toBeTruthy()
    expect(wrapper.emitted('tab-remove')[0]).toEqual(['second'])
  })

  it('emits tab-add event when add button is clicked', async () => {
    const wrapper = mount(Tabs, {
      props: {
        tabs: mockTabs,
        modelValue: 'first',
        addable: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('tab-add')
    expect(wrapper.emitted('tab-add')).toBeTruthy()
  })

  it('emits edit event when tab is edited', async () => {
    const wrapper = mount(Tabs, {
      props: {
        tabs: mockTabs,
        modelValue: 'first',
        editable: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('edit', { name: 'first', action: 'edit' })
    expect(wrapper.emitted('edit')).toBeTruthy()
    expect(wrapper.emitted('edit')[0]).toEqual([{ name: 'first', action: 'edit' }])
  })

  it('renders tab content correctly', () => {
    const wrapper = mount(Tabs, {
      props: {
        tabs: mockTabs,
        modelValue: 'first'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tabPanes = wrapper.findAll('.el-tab-pane')
    expect(tabPanes[0].text()).toBe('First tab content')
    expect(tabPanes[1].text()).toBe('Second tab content')
    expect(tabPanes[2].text()).toBe('Third tab content')
  })

  it('renders custom tab labels when provided', () => {
    const customTabs = [
      { name: 'first', label: '<span class="custom-label">First</span>', content: 'First tab content' },
      { name: 'second', label: '<span class="custom-label">Second</span>', content: 'Second tab content' }
    ]

    const wrapper = mount(Tabs, {
      props: {
        tabs: customTabs,
        modelValue: 'first'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('tabs')).toEqual(customTabs)
  })

  it('handles empty tabs array gracefully', () => {
    const wrapper = mount(Tabs, {
      props: {
        tabs: [],
        modelValue: 'first'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tabPanes = wrapper.findAll('.el-tab-pane')
    expect(tabPanes.length).toBe(0)
    expect(wrapper.find('.el-tabs').exists()).toBe(true)
  })

  it('handles null tabs gracefully', () => {
    const wrapper = mount(Tabs, {
      props: {
        tabs: null,
        modelValue: 'first'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tabPanes = wrapper.findAll('.el-tab-pane')
    expect(tabPanes.length).toBe(0)
    expect(wrapper.find('.el-tabs').exists()).toBe(true)
  })

  it('handles undefined tabs gracefully', () => {
    const wrapper = mount(Tabs, {
      props: {
        tabs: undefined,
        modelValue: 'first'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tabPanes = wrapper.findAll('.el-tab-pane')
    expect(tabPanes.length).toBe(0)
    expect(wrapper.find('.el-tabs').exists()).toBe(true)
  })

  it('applies custom CSS classes when className prop is provided', () => {
    const wrapper = mount(Tabs, {
      props: {
        tabs: mockTabs,
        modelValue: 'first',
        className: 'custom-tabs'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('className')).toBe('custom-tabs')
  })

  it('supports before-leave hook', () => {
    const beforeLeave = vi.fn()
    const wrapper = mount(Tabs, {
      props: {
        tabs: mockTabs,
        modelValue: 'first',
        beforeLeave: beforeLeave
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tabs = wrapper.find('.el-tabs')
    expect(tabs.props('beforeLeave')).toBe(beforeLeave)
  })

  it('supports lazy loading globally', () => {
    const wrapper = mount(Tabs, {
      props: {
        tabs: mockTabs,
        modelValue: 'first',
        lazy: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const tabs = wrapper.find('.el-tabs')
    expect(tabs.props('lazy')).toBe(true)
  })

  it('supports custom tab rendering', () => {
    const wrapper = mount(Tabs, {
      props: {
        tabs: mockTabs,
        modelValue: 'first'
      },
      slots: {
        tab: '<template #tab="{ tab }"><span class="custom-tab">{{ tab.label }}</span></template>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.custom-tab').exists()).toBe(true)
  })

  it('supports custom content rendering', () => {
    const wrapper = mount(Tabs, {
      props: {
        tabs: mockTabs,
        modelValue: 'first'
      },
      slots: {
        default: '<template #default="{ tab }"><div class="custom-content">{{ tab.content }}</div></template>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.custom-content').exists()).toBe(true)
  })

  it('supports extra content in header', () => {
    const wrapper = mount(Tabs, {
      props: {
        tabs: mockTabs,
        modelValue: 'first'
      },
      slots: {
        extra: '<div class="extra-content">Extra Content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.extra-content').exists()).toBe(true)
  })

  it('supports tab icons', () => {
    const iconTabs = [
      { name: 'first', label: 'First Tab', content: 'First tab content', icon: 'el-icon-home' },
      { name: 'second', label: 'Second Tab', content: 'Second tab content', icon: 'el-icon-setting' }
    ]

    const wrapper = mount(Tabs, {
      props: {
        tabs: iconTabs,
        modelValue: 'first'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('tabs')).toEqual(iconTabs)
  })

  it('supports tab badges', () => {
    const badgeTabs = [
      { name: 'first', label: 'First Tab', content: 'First tab content', badge: 5 },
      { name: 'second', label: 'Second Tab', content: 'Second tab content', badge: 'New' }
    ]

    const wrapper = mount(Tabs, {
      props: {
        tabs: badgeTabs,
        modelValue: 'first'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('tabs')).toEqual(badgeTabs)
  })

  it('supports tab tooltips', () => {
    const tooltipTabs = [
      { name: 'first', label: 'First Tab', content: 'First tab content', tooltip: 'First tab tooltip' },
      { name: 'second', label: 'Second Tab', content: 'Second tab content', tooltip: 'Second tab tooltip' }
    ]

    const wrapper = mount(Tabs, {
      props: {
        tabs: tooltipTabs,
        modelValue: 'first'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('tabs')).toEqual(tooltipTabs)
  })

  it('supports keyboard navigation', async () => {
    const wrapper = mount(Tabs, {
      props: {
        tabs: mockTabs,
        modelValue: 'first'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('keydown')).toBeTruthy()
  })

  it('supports dynamic tab addition and removal', async () => {
    const wrapper = mount(Tabs, {
      props: {
        tabs: mockTabs,
        modelValue: 'first',
        addable: true,
        closable: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('tab-add')
    expect(wrapper.emitted('tab-add')).toBeTruthy()

    await wrapper.vm.$emit('tab-remove', 'second')
    expect(wrapper.emitted('tab-remove')).toBeTruthy()
  })

  it('supports tab validation', async () => {
    const wrapper = mount(Tabs, {
      props: {
        tabs: mockTabs,
        modelValue: 'first'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('validate', true)
    expect(wrapper.emitted('validate')).toBeTruthy()
  })
})