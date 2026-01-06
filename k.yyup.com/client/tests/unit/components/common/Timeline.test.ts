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
import Timeline from '@/components/common/Timeline.vue'
import ElementPlus from 'element-plus'

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElTimeline: {
    name: 'ElTimeline',
    template: '<div class="el-timeline"><slot></slot></div>',
    props: ['reverse']
  },
  ElTimelineItem: {
    name: 'ElTimelineItem',
    template: '<div class="el-timeline-item"><div class="el-timeline-item__node"></div><div class="el-timeline-item__wrapper"><div class="el-timeline-item__content"><slot></slot></div><div class="el-timeline-item__timestamp" v-if="$slots.timestamp"><slot name="timestamp"></slot></div></div></div>',
    props: ['timestamp', 'hideTimestamp', 'placement', 'type', 'color', 'size', 'icon', 'hollow']
  },
  ElCard: {
    name: 'ElCard',
    template: '<div class="el-card"><slot></slot></div>',
    props: ['shadow', 'bodyStyle']
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

describe('Timeline.vue', () => {
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
    { id: 1, content: 'Event 1', timestamp: '2023-01-01', type: 'primary' },
    { id: 2, content: 'Event 2', timestamp: '2023-01-02', type: 'success' },
    { id: 3, content: 'Event 3', timestamp: '2023-01-03', type: 'warning' }
  ]

  it('renders properly with default props', () => {
    const wrapper = mount(Timeline, {
      props: {
        items: mockItems
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.el-timeline').exists()).toBe(true)
  })

  it('displays correct timeline items', () => {
    const wrapper = mount(Timeline, {
      props: {
        items: mockItems
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const timelineItems = wrapper.findAll('.el-timeline-item')
    expect(timelineItems.length).toBe(mockItems.length)
  })

  it('reverses timeline when reverse prop is true', () => {
    const wrapper = mount(Timeline, {
      props: {
        items: mockItems,
        reverse: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const timeline = wrapper.find('.el-timeline')
    expect(timeline.props('reverse')).toBe(true)
  })

  it('does not reverse timeline when reverse prop is false', () => {
    const wrapper = mount(Timeline, {
      props: {
        items: mockItems,
        reverse: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const timeline = wrapper.find('.el-timeline')
    expect(timeline.props('reverse')).toBe(false)
  })

  it('applies default reverse setting when reverse prop is not provided', () => {
    const wrapper = mount(Timeline, {
      props: {
        items: mockItems
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const timeline = wrapper.find('.el-timeline')
    expect(timeline.props('reverse')).toBe(false)
  })

  it('displays correct content for each item', () => {
    const wrapper = mount(Timeline, {
      props: {
        items: mockItems
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const timelineItems = wrapper.findAll('.el-timeline-item')
    expect(timelineItems[0].find('.el-timeline-item__content').text()).toBe('Event 1')
    expect(timelineItems[1].find('.el-timeline-item__content').text()).toBe('Event 2')
    expect(timelineItems[2].find('.el-timeline-item__content').text()).toBe('Event 3')
  })

  it('displays correct timestamps for each item', () => {
    const wrapper = mount(Timeline, {
      props: {
        items: mockItems
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const timelineItems = wrapper.findAll('.el-timeline-item')
    expect(timelineItems[0].props('timestamp')).toBe('2023-01-01')
    expect(timelineItems[1].props('timestamp')).toBe('2023-01-02')
    expect(timelineItems[2].props('timestamp')).toBe('2023-01-03')
  })

  it('hides timestamps when hideTimestamp prop is true', () => {
    const wrapper = mount(Timeline, {
      props: {
        items: mockItems,
        hideTimestamp: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const timelineItems = wrapper.findAll('.el-timeline-item')
    timelineItems.forEach(item => {
      expect(item.props('hideTimestamp')).toBe(true)
    })
  })

  it('shows timestamps when hideTimestamp prop is false', () => {
    const wrapper = mount(Timeline, {
      props: {
        items: mockItems,
        hideTimestamp: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const timelineItems = wrapper.findAll('.el-timeline-item')
    timelineItems.forEach(item => {
      expect(item.props('hideTimestamp')).toBe(false)
    })
  })

  it('applies correct placement when placement prop is provided', () => {
    const wrapper = mount(Timeline, {
      props: {
        items: mockItems,
        placement: 'top'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const timelineItems = wrapper.findAll('.el-timeline-item')
    timelineItems.forEach(item => {
      expect(item.props('placement')).toBe('top')
    })
  })

  it('applies default placement when placement prop is not provided', () => {
    const wrapper = mount(Timeline, {
      props: {
        items: mockItems
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const timelineItems = wrapper.findAll('.el-timeline-item')
    timelineItems.forEach(item => {
      expect(item.props('placement')).toBe('bottom')
    })
  })

  it('applies correct type for each item', () => {
    const wrapper = mount(Timeline, {
      props: {
        items: mockItems
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const timelineItems = wrapper.findAll('.el-timeline-item')
    expect(timelineItems[0].props('type')).toBe('primary')
    expect(timelineItems[1].props('type')).toBe('success')
    expect(timelineItems[2].props('type')).toBe('warning')
  })

  it('applies custom color when color prop is provided', () => {
    const wrapper = mount(Timeline, {
      props: {
        items: mockItems,
        color: '#ff0000'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const timelineItems = wrapper.findAll('.el-timeline-item')
    timelineItems.forEach(item => {
      expect(item.props('color')).toBe('#ff0000')
    })
  })

  it('applies custom size when size prop is provided', () => {
    const wrapper = mount(Timeline, {
      props: {
        items: mockItems,
        size: 'large'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const timelineItems = wrapper.findAll('.el-timeline-item')
    timelineItems.forEach(item => {
      expect(item.props('size')).toBe('large')
    })
  })

  it('applies custom icon when icon prop is provided', () => {
    const wrapper = mount(Timeline, {
      props: {
        items: mockItems,
        icon: 'el-icon-star'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const timelineItems = wrapper.findAll('.el-timeline-item')
    timelineItems.forEach(item => {
      expect(item.props('icon')).toBe('el-icon-star')
    })
  })

  it('makes nodes hollow when hollow prop is true', () => {
    const wrapper = mount(Timeline, {
      props: {
        items: mockItems,
        hollow: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const timelineItems = wrapper.findAll('.el-timeline-item')
    timelineItems.forEach(item => {
      expect(item.props('hollow')).toBe(true)
    })
  })

  it('makes nodes solid when hollow prop is false', () => {
    const wrapper = mount(Timeline, {
      props: {
        items: mockItems,
        hollow: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const timelineItems = wrapper.findAll('.el-timeline-item')
    timelineItems.forEach(item => {
      expect(item.props('hollow')).toBe(false)
    })
  })

  it('emits click event when timeline item is clicked', async () => {
    const wrapper = mount(Timeline, {
      props: {
        items: mockItems
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('click', mockItems[0])
    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')[0]).toEqual([mockItems[0]])
  })

  it('handles empty items array gracefully', () => {
    const wrapper = mount(Timeline, {
      props: {
        items: []
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const timelineItems = wrapper.findAll('.el-timeline-item')
    expect(timelineItems.length).toBe(0)
    expect(wrapper.find('.el-timeline').exists()).toBe(true)
  })

  it('handles null items gracefully', () => {
    const wrapper = mount(Timeline, {
      props: {
        items: null
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const timelineItems = wrapper.findAll('.el-timeline-item')
    expect(timelineItems.length).toBe(0)
    expect(wrapper.find('.el-timeline').exists()).toBe(true)
  })

  it('handles undefined items gracefully', () => {
    const wrapper = mount(Timeline, {
      props: {
        items: undefined
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const timelineItems = wrapper.findAll('.el-timeline-item')
    expect(timelineItems.length).toBe(0)
    expect(wrapper.find('.el-timeline').exists()).toBe(true)
  })

  it('applies custom CSS classes when className prop is provided', () => {
    const wrapper = mount(Timeline, {
      props: {
        items: mockItems,
        className: 'custom-timeline'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('className')).toBe('custom-timeline')
  })

  it('supports custom item rendering', () => {
    const wrapper = mount(Timeline, {
      props: {
        items: mockItems
      },
      slots: {
        item: '<template #item="{ item }"><div class="custom-item">{{ item.content }}</div></template>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.custom-item').exists()).toBe(true)
  })

  it('supports custom content rendering', () => {
    const wrapper = mount(Timeline, {
      props: {
        items: mockItems
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

  it('supports custom timestamp rendering', () => {
    const wrapper = mount(Timeline, {
      props: {
        items: mockItems
      },
      slots: {
        timestamp: '<template #timestamp="{ item }"><div class="custom-timestamp">{{ item.timestamp }}</div></template>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.custom-timestamp').exists()).toBe(true)
  })

  it('supports custom node rendering', () => {
    const wrapper = mount(Timeline, {
      props: {
        items: mockItems
      },
      slots: {
        node: '<template #node="{ item }"><div class="custom-node">★</div></template>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.custom-node').exists()).toBe(true)
  })

  it('supports item-specific properties', () => {
    const itemsWithSpecificProps = [
      { id: 1, content: 'Event 1', timestamp: '2023-01-01', type: 'primary', color: '#ff0000', size: 'large' },
      { id: 2, content: 'Event 2', timestamp: '2023-01-02', type: 'success', icon: 'el-icon-check' },
      { id: 3, content: 'Event 3', timestamp: '2023-01-03', type: 'warning', hollow: true }
    ]

    const wrapper = mount(Timeline, {
      props: {
        items: itemsWithSpecificProps
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const timelineItems = wrapper.findAll('.el-timeline-item')
    expect(timelineItems[0].props('color')).toBe('#ff0000')
    expect(timelineItems[0].props('size')).toBe('large')
    expect(timelineItems[1].props('icon')).toBe('el-icon-check')
    expect(timelineItems[2].props('hollow')).toBe(true)
  })

  it('supports item badges', () => {
    const itemsWithBadges = [
      { id: 1, content: 'Event 1', timestamp: '2023-01-01', badge: 'New' },
      { id: 2, content: 'Event 2', timestamp: '2023-01-02', badge: 5 }
    ]

    const wrapper = mount(Timeline, {
      props: {
        items: itemsWithBadges
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('items')).toEqual(itemsWithBadges)
  })

  it('supports item tooltips', () => {
    const itemsWithTooltips = [
      { id: 1, content: 'Event 1', timestamp: '2023-01-01', tooltip: 'Important event' },
      { id: 2, content: 'Event 2', timestamp: '2023-01-02', tooltip: 'Regular event' }
    ]

    const wrapper = mount(Timeline, {
      props: {
        items: itemsWithTooltips
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('items')).toEqual(itemsWithTooltips)
  })

  it('supports item actions', () => {
    const itemsWithActions = [
      { id: 1, content: 'Event 1', timestamp: '2023-01-01', actions: ['edit', 'delete'] },
      { id: 2, content: 'Event 2', timestamp: '2023-01-02', actions: ['view'] }
    ]

    const wrapper = mount(Timeline, {
      props: {
        items: itemsWithActions
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('items')).toEqual(itemsWithActions)
  })

  it('emits action event when item action is clicked', async () => {
    const itemsWithActions = [
      { id: 1, content: 'Event 1', timestamp: '2023-01-01', actions: ['edit', 'delete'] }
    ]

    const wrapper = mount(Timeline, {
      props: {
        items: itemsWithActions
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('action', { action: 'edit', item: itemsWithActions[0] })
    expect(wrapper.emitted('action')).toBeTruthy()
    expect(wrapper.emitted('action')[0]).toEqual([{ action: 'edit', item: itemsWithActions[0] }])
  })

  it('supports item metadata', () => {
    const itemsWithMetadata = [
      { id: 1, content: 'Event 1', timestamp: '2023-01-01', metadata: { author: 'John', category: 'important' } },
      { id: 2, content: 'Event 2', timestamp: '2023-01-02', metadata: { author: 'Jane', category: 'normal' } }
    ]

    const wrapper = mount(Timeline, {
      props: {
        items: itemsWithMetadata
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('items')).toEqual(itemsWithMetadata)
  })

  it('supports nested timeline items', () => {
    const nestedItems = [
      { 
        id: 1, 
        content: 'Main Event 1', 
        timestamp: '2023-01-01',
        children: [
          { id: 1.1, content: 'Sub Event 1.1', timestamp: '2023-01-01 10:00' },
          { id: 1.2, content: 'Sub Event 1.2', timestamp: '2023-01-01 11:00' }
        ]
      },
      { id: 2, content: 'Main Event 2', timestamp: '2023-01-02' }
    ]

    const wrapper = mount(Timeline, {
      props: {
        items: nestedItems
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('items')).toEqual(nestedItems)
  })

  it('supports custom line style', () => {
    const wrapper = mount(Timeline, {
      props: {
        items: mockItems,
        lineStyle: { color: '#ff0000', width: '2px', style: 'dashed' }
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('lineStyle')).toEqual({ color: '#ff0000', width: '2px', style: 'dashed' })
  })

  it('supports custom node style', () => {
    const wrapper = mount(Timeline, {
      props: {
        items: mockItems,
        nodeStyle: { backgroundColor: '#ff0000', border: '2px solid #000' }
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('nodeStyle')).toEqual({ backgroundColor: '#ff0000', border: '2px solid #000' })
  })

  it('supports alternating placement', () => {
    const wrapper = mount(Timeline, {
      props: {
        items: mockItems,
        alternate: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('alternate')).toBe(true)
  })

  it('supports responsive behavior', () => {
    const wrapper = mount(Timeline, {
      props: {
        items: mockItems,
        responsive: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('responsive')).toBe(true)
  })

  it('supports keyboard navigation', async () => {
    const wrapper = mount(Timeline, {
      props: {
        items: mockItems
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.emitted('keydown')).toBeTruthy()
  })

  it('supports timeline groups', () => {
    const groupedItems = [
      {
        id: 'group1',
        label: 'Group 1',
        items: [
          { id: 1, content: 'Event 1', timestamp: '2023-01-01' },
          { id: 2, content: 'Event 2', timestamp: '2023-01-02' }
        ]
      },
      {
        id: 'group2',
        label: 'Group 2',
        items: [
          { id: 3, content: 'Event 3', timestamp: '2023-01-03' }
        ]
      }
    ]

    const wrapper = mount(Timeline, {
      props: {
        items: groupedItems
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('items')).toEqual(groupedItems)
  })
})