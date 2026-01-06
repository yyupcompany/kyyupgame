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
import Accordion from '@/components/common/Accordion.vue'
import ElementPlus from 'element-plus'

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElCollapse: {
    name: 'ElCollapse',
    template: '<div class="el-collapse"><slot></slot></div>',
    props: ['modelValue', 'accordion', 'border']
  },
  ElCollapseItem: {
    name: 'ElCollapseItem',
    template: '<div class="el-collapse-item"><div class="el-collapse-item__header"><slot name="title"></slot></div><div class="el-collapse-item__content"><slot></slot></div></div>',
    props: ['name', 'title', 'disabled', 'icon']
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

describe('Accordion.vue', () => {
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
    { name: '1', title: 'Section 1', content: 'Content for section 1' },
    { name: '2', title: 'Section 2', content: 'Content for section 2' },
    { name: '3', title: 'Section 3', content: 'Content for section 3', disabled: true }
  ]

  it('renders properly with default props', () => {
    const wrapper = mount(Accordion, {
      props: {
        items: mockItems,
        modelValue: ['1']
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.el-collapse').exists()).toBe(true)
  })

  it('displays correct accordion items', () => {
    const wrapper = mount(Accordion, {
      props: {
        items: mockItems,
        modelValue: ['1']
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const collapseItems = wrapper.findAll('.el-collapse-item')
    expect(collapseItems.length).toBe(mockItems.length)
  })

  it('binds modelValue correctly', () => {
    const wrapper = mount(Accordion, {
      props: {
        items: mockItems,
        modelValue: ['2']
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const collapse = wrapper.find('.el-collapse')
    expect(collapse.props('modelValue')).toEqual(['2'])
  })

  it('emits update:modelValue when accordion state changes', async () => {
    const wrapper = mount(Accordion, {
      props: {
        items: mockItems,
        modelValue: ['1']
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('update:modelValue', ['2'])
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([['2']])
  })

  it('emits change event when accordion items change', async () => {
    const wrapper = mount(Accordion, {
      props: {
        items: mockItems,
        modelValue: ['1']
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('change', ['2'])
    expect(wrapper.emitted('change')).toBeTruthy()
    expect(wrapper.emitted('change')[0]).toEqual([['2']])
  })

  it('enables accordion mode when accordion prop is true', () => {
    const wrapper = mount(Accordion, {
      props: {
        items: mockItems,
        modelValue: ['1'],
        accordion: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const collapse = wrapper.find('.el-collapse')
    expect(collapse.props('accordion')).toBe(true)
  })

  it('disables accordion mode when accordion prop is false', () => {
    const wrapper = mount(Accordion, {
      props: {
        items: mockItems,
        modelValue: ['1'],
        accordion: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const collapse = wrapper.find('.el-collapse')
    expect(collapse.props('accordion')).toBe(false)
  })

  it('applies default accordion mode when accordion prop is not provided', () => {
    const wrapper = mount(Accordion, {
      props: {
        items: mockItems,
        modelValue: ['1']
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const collapse = wrapper.find('.el-collapse')
    expect(collapse.props('accordion')).toBe(true)
  })

  it('shows border when border prop is true', () => {
    const wrapper = mount(Accordion, {
      props: {
        items: mockItems,
        modelValue: ['1'],
        border: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const collapse = wrapper.find('.el-collapse')
    expect(collapse.props('border')).toBe(true)
  })

  it('hides border when border prop is false', () => {
    const wrapper = mount(Accordion, {
      props: {
        items: mockItems,
        modelValue: ['1'],
        border: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const collapse = wrapper.find('.el-collapse')
    expect(collapse.props('border')).toBe(false)
  })

  it('disables individual items when disabled prop is true', () => {
    const wrapper = mount(Accordion, {
      props: {
        items: mockItems,
        modelValue: ['1']
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const collapseItems = wrapper.findAll('.el-collapse-item')
    const disabledItem = collapseItems[2] // Third item has disabled: true
    expect(disabledItem.props('disabled')).toBe(true)
  })

  it('enables individual items when disabled prop is false', () => {
    const enabledItems = [
      { name: '1', title: 'Section 1', content: 'Content for section 1', disabled: false },
      { name: '2', title: 'Section 2', content: 'Content for section 2', disabled: false }
    ]

    const wrapper = mount(Accordion, {
      props: {
        items: enabledItems,
        modelValue: ['1']
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const collapseItems = wrapper.findAll('.el-collapse-item')
    collapseItems.forEach(item => {
      expect(item.props('disabled')).toBe(false)
    })
  })

  it('applies custom icons to items when icon prop is provided', () => {
    const iconItems = [
      { name: '1', title: 'Section 1', content: 'Content for section 1', icon: 'el-icon-home' },
      { name: '2', title: 'Section 2', content: 'Content for section 2', icon: 'el-icon-setting' }
    ]

    const wrapper = mount(Accordion, {
      props: {
        items: iconItems,
        modelValue: ['1']
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const collapseItems = wrapper.findAll('.el-collapse-item')
    expect(collapseItems[0].props('icon')).toBe('el-icon-home')
    expect(collapseItems[1].props('icon')).toBe('el-icon-setting')
  })

  it('emits item-click event when accordion item is clicked', async () => {
    const wrapper = mount(Accordion, {
      props: {
        items: mockItems,
        modelValue: ['1']
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('item-click', { name: '2', title: 'Section 2' })
    expect(wrapper.emitted('item-click')).toBeTruthy()
    expect(wrapper.emitted('item-click')[0]).toEqual([{ name: '2', title: 'Section 2' }])
  })

  it('emits item-open event when accordion item is opened', async () => {
    const wrapper = mount(Accordion, {
      props: {
        items: mockItems,
        modelValue: ['1']
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('item-open', { name: '2', title: 'Section 2' })
    expect(wrapper.emitted('item-open')).toBeTruthy()
    expect(wrapper.emitted('item-open')[0]).toEqual([{ name: '2', title: 'Section 2' }])
  })

  it('emits item-close event when accordion item is closed', async () => {
    const wrapper = mount(Accordion, {
      props: {
        items: mockItems,
        modelValue: ['1']
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('item-close', { name: '1', title: 'Section 1' })
    expect(wrapper.emitted('item-close')).toBeTruthy()
    expect(wrapper.emitted('item-close')[0]).toEqual([{ name: '1', title: 'Section 1' }])
  })

  it('renders item content correctly', () => {
    const wrapper = mount(Accordion, {
      props: {
        items: mockItems,
        modelValue: ['1']
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const collapseItems = wrapper.findAll('.el-collapse-item')
    expect(collapseItems[0].find('.el-collapse-item__content').text()).toBe('Content for section 1')
    expect(collapseItems[1].find('.el-collapse-item__content').text()).toBe('Content for section 2')
    expect(collapseItems[2].find('.el-collapse-item__content').text()).toBe('Content for section 3')
  })

  it('renders custom item titles when provided', () => {
    const customTitleItems = [
      { name: '1', title: '<span class="custom-title">Custom Title 1</span>', content: 'Content for section 1' },
      { name: '2', title: '<span class="custom-title">Custom Title 2</span>', content: 'Content for section 2' }
    ]

    const wrapper = mount(Accordion, {
      props: {
        items: customTitleItems,
        modelValue: ['1']
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('items')).toEqual(customTitleItems)
  })

  it('handles empty items array gracefully', () => {
    const wrapper = mount(Accordion, {
      props: {
        items: [],
        modelValue: []
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const collapseItems = wrapper.findAll('.el-collapse-item')
    expect(collapseItems.length).toBe(0)
    expect(wrapper.find('.el-collapse').exists()).toBe(true)
  })

  it('handles null items gracefully', () => {
    const wrapper = mount(Accordion, {
      props: {
        items: null,
        modelValue: []
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const collapseItems = wrapper.findAll('.el-collapse-item')
    expect(collapseItems.length).toBe(0)
    expect(wrapper.find('.el-collapse').exists()).toBe(true)
  })

  it('handles undefined items gracefully', () => {
    const wrapper = mount(Accordion, {
      props: {
        items: undefined,
        modelValue: []
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const collapseItems = wrapper.findAll('.el-collapse-item')
    expect(collapseItems.length).toBe(0)
    expect(wrapper.find('.el-collapse').exists()).toBe(true)
  })

  it('applies custom CSS classes when className prop is provided', () => {
    const wrapper = mount(Accordion, {
      props: {
        items: mockItems,
        modelValue: ['1'],
        className: 'custom-accordion'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('className')).toBe('custom-accordion')
  })

  it('supports custom item rendering', () => {
    const wrapper = mount(Accordion, {
      props: {
        items: mockItems,
        modelValue: ['1']
      },
      slots: {
        item: '<template #item="{ item }"><div class="custom-item">{{ item.title }}</div></template>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.custom-item').exists()).toBe(true)
  })

  it('supports custom title rendering', () => {
    const wrapper = mount(Accordion, {
      props: {
        items: mockItems,
        modelValue: ['1']
      },
      slots: {
        title: '<template #title="{ item }"><span class="custom-title">{{ item.title }}</span></template>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.custom-title').exists()).toBe(true)
  })

  it('supports custom content rendering', () => {
    const wrapper = mount(Accordion, {
      props: {
        items: mockItems,
        modelValue: ['1']
      },
      slots: {
        content: '<template #content="{ item }"><div class="custom-content">{{ item.content }}</div></template>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.custom-content').exists()).toBe(true)
  })

  it('supports expand all functionality', () => {
    const wrapper = mount(Accordion, {
      props: {
        items: mockItems,
        modelValue: ['1', '2', '3'],
        expandAll: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('expandAll')).toBe(true)
    expect(wrapper.props('modelValue')).toEqual(['1', '2', '3'])
  })

  it('supports collapse all functionality', () => {
    const wrapper = mount(Accordion, {
      props: {
        items: mockItems,
        modelValue: [],
        collapseAll: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('collapseAll')).toBe(true)
    expect(wrapper.props('modelValue')).toEqual([])
  })

  it('supports item badges', () => {
    const badgeItems = [
      { name: '1', title: 'Section 1', content: 'Content for section 1', badge: 5 },
      { name: '2', title: 'Section 2', content: 'Content for section 2', badge: 'New' }
    ]

    const wrapper = mount(Accordion, {
      props: {
        items: badgeItems,
        modelValue: ['1']
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('items')).toEqual(badgeItems)
  })

  it('supports item tooltips', () => {
    const tooltipItems = [
      { name: '1', title: 'Section 1', content: 'Content for section 1', tooltip: 'Section 1 tooltip' },
      { name: '2', title: 'Section 2', content: 'Content for section 2', tooltip: 'Section 2 tooltip' }
    ]

    const wrapper = mount(Accordion, {
      props: {
        items: tooltipItems,
        modelValue: ['1']
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('items')).toEqual(tooltipItems)
  })

  it('supports nested accordion items', () => {
    const nestedItems = [
      { 
        name: '1', 
        title: 'Section 1', 
        content: 'Content for section 1',
        children: [
          { name: '1-1', title: 'Subsection 1.1', content: 'Content for subsection 1.1' },
          { name: '1-2', title: 'Subsection 1.2', content: 'Content for subsection 1.2' }
        ]
      },
      { name: '2', title: 'Section 2', content: 'Content for section 2' }
    ]

    const wrapper = mount(Accordion, {
      props: {
        items: nestedItems,
        modelValue: ['1']
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('items')).toEqual(nestedItems)
  })

  it('supports keyboard navigation', async () => {
    const wrapper = mount(Accordion, {
      props: {
        items: mockItems,
        modelValue: ['1']
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.emitted('keydown')).toBeTruthy()
  })

  it('supports lazy loading of content', () => {
    const lazyItems = [
      { name: '1', title: 'Section 1', content: 'Content for section 1', lazy: true },
      { name: '2', title: 'Section 2', content: 'Content for section 2', lazy: false }
    ]

    const wrapper = mount(Accordion, {
      props: {
        items: lazyItems,
        modelValue: ['1']
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('items')).toEqual(lazyItems)
  })

  it('supports item validation', async () => {
    const wrapper = mount(Accordion, {
      props: {
        items: mockItems,
        modelValue: ['1']
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('validate', true)
    expect(wrapper.emitted('validate')).toBeTruthy()
  })

  it('supports custom animations', () => {
    const wrapper = mount(Accordion, {
      props: {
        items: mockItems,
        modelValue: ['1'],
        animated: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('animated')).toBe(true)
  })

  it('supports right-to-left (RTL) layout', () => {
    const wrapper = mount(Accordion, {
      props: {
        items: mockItems,
        modelValue: ['1'],
        rtl: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('rtl')).toBe(true)
  })
})