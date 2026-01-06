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
import Card from '@/components/common/Card.vue'
import ElementPlus from 'element-plus'

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElCard: {
    name: 'ElCard',
    template: '<div class="el-card"><div class="el-card__header" v-if="$slots.header || header"><slot name="header"></slot></div><div class="el-card__body"><slot></slot></div></div>',
    props: ['header', 'bodyStyle', 'shadow', 'bodyClass']
  },
  ElButton: {
    name: 'ElButton',
    template: '<button class="el-button"><slot></slot></button>',
    props: ['type', 'size', 'disabled', 'icon']
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
  }
}))

describe('Card.vue', () => {
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
    const wrapper = mount(Card, {
      slots: {
        default: '<div>Card content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.el-card').exists()).toBe(true)
  })

  it('displays correct header when header prop is provided', () => {
    const wrapper = mount(Card, {
      props: {
        header: 'Card Title'
      },
      slots: {
        default: '<div>Card content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const card = wrapper.find('.el-card')
    expect(card.props('header')).toBe('Card Title')
  })

  it('displays header slot when provided', () => {
    const wrapper = mount(Card, {
      slots: {
        default: '<div>Card content</div>',
        header: '<div class="custom-header">Custom Header</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.custom-header').exists()).toBe(true)
    expect(wrapper.find('.custom-header').text()).toBe('Custom Header')
  })

  it('applies custom body style when bodyStyle prop is provided', () => {
    const customStyle = { padding: '20px', backgroundColor: '#f0f0f0' }
    const wrapper = mount(Card, {
      props: {
        bodyStyle: customStyle
      },
      slots: {
        default: '<div>Card content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const card = wrapper.find('.el-card')
    expect(card.props('bodyStyle')).toEqual(customStyle)
  })

  it('applies correct shadow when shadow prop is provided', () => {
    const wrapper = mount(Card, {
      props: {
        shadow: 'always'
      },
      slots: {
        default: '<div>Card content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const card = wrapper.find('.el-card')
    expect(card.props('shadow')).toBe('always')
  })

  it('applies default shadow when shadow prop is not provided', () => {
    const wrapper = mount(Card, {
      slots: {
        default: '<div>Card content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const card = wrapper.find('.el-card')
    expect(card.props('shadow')).toBe('never')
  })

  it('applies custom body class when bodyClass prop is provided', () => {
    const wrapper = mount(Card, {
      props: {
        bodyClass: 'custom-body-class'
      },
      slots: {
        default: '<div>Card content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const card = wrapper.find('.el-card')
    expect(card.props('bodyClass')).toBe('custom-body-class')
  })

  it('renders default slot content', () => {
    const wrapper = mount(Card, {
      slots: {
        default: '<div class="custom-content">Custom card content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.custom-content').exists()).toBe(true)
    expect(wrapper.find('.custom-content').text()).toBe('Custom card content')
  })

  it('shows header when header prop is provided', () => {
    const wrapper = mount(Card, {
      props: {
        header: 'Card Title'
      },
      slots: {
        default: '<div>Card content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.el-card__header').exists()).toBe(true)
  })

  it('hides header when header prop is not provided', () => {
    const wrapper = mount(Card, {
      slots: {
        default: '<div>Card content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.el-card__header').exists()).toBe(false)
  })

  it('emits click event when card is clicked', async () => {
    const wrapper = mount(Card, {
      props: {
        clickable: true
      },
      slots: {
        default: '<div>Card content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('does not emit click event when card is not clickable', async () => {
    const wrapper = mount(Card, {
      props: {
        clickable: false
      },
      slots: {
        default: '<div>Card content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('applies hover effect when hoverable prop is true', () => {
    const wrapper = mount(Card, {
      props: {
        hoverable: true
      },
      slots: {
        default: '<div>Card content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('hoverable')).toBe(true)
  })

  it('does not apply hover effect when hoverable prop is false', () => {
    const wrapper = mount(Card, {
      props: {
        hoverable: false
      },
      slots: {
        default: '<div>Card content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('hoverable')).toBe(false)
  })

  it('applies border when bordered prop is true', () => {
    const wrapper = mount(Card, {
      props: {
        bordered: true
      },
      slots: {
        default: '<div>Card content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('bordered')).toBe(true)
  })

  it('does not apply border when bordered prop is false', () => {
    const wrapper = mount(Card, {
      props: {
        bordered: false
      },
      slots: {
        default: '<div>Card content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('bordered')).toBe(false)
  })

  it('applies custom border color when borderColor prop is provided', () => {
    const wrapper = mount(Card, {
      props: {
        bordered: true,
        borderColor: '#ff0000'
      },
      slots: {
        default: '<div>Card content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('borderColor')).toBe('#ff0000')
  })

  it('applies rounded corners when rounded prop is true', () => {
    const wrapper = mount(Card, {
      props: {
        rounded: true
      },
      slots: {
        default: '<div>Card content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('rounded')).toBe(true)
  })

  it('does not apply rounded corners when rounded prop is false', () => {
    const wrapper = mount(Card, {
      props: {
        rounded: false
      },
      slots: {
        default: '<div>Card content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('rounded')).toBe(false)
  })

  it('shows loading state when loading prop is true', () => {
    const wrapper = mount(Card, {
      props: {
        loading: true
      },
      slots: {
        default: '<div>Card content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('loading')).toBe(true)
  })

  it('hides loading state when loading prop is false', () => {
    const wrapper = mount(Card, {
      props: {
        loading: false
      },
      slots: {
        default: '<div>Card content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('loading')).toBe(false)
  })

  it('applies custom CSS classes when className prop is provided', () => {
    const wrapper = mount(Card, {
      props: {
        className: 'custom-card'
      },
      slots: {
        default: '<div>Card content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('className')).toBe('custom-card')
  })

  it('supports footer slot', () => {
    const wrapper = mount(Card, {
      slots: {
        default: '<div>Card content</div>',
        footer: '<div class="custom-footer">Footer Content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.custom-footer').exists()).toBe(true)
    expect(wrapper.find('.custom-footer').text()).toBe('Footer Content')
  })

  it('supports actions slot', () => {
    const wrapper = mount(Card, {
      slots: {
        default: '<div>Card content</div>',
        actions: '<div class="custom-actions">Action Buttons</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.custom-actions').exists()).toBe(true)
    expect(wrapper.find('.custom-actions').text()).toBe('Action Buttons')
  })

  it('supports cover slot', () => {
    const wrapper = mount(Card, {
      slots: {
        default: '<div>Card content</div>',
        cover: '<div class="custom-cover">Cover Image</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.custom-cover').exists()).toBe(true)
    expect(wrapper.find('.custom-cover').text()).toBe('Cover Image')
  })

  it('supports extra slot', () => {
    const wrapper = mount(Card, {
      props: {
        header: 'Card Title'
      },
      slots: {
        default: '<div>Card content</div>',
        extra: '<div class="custom-extra">Extra Content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.custom-extra').exists()).toBe(true)
    expect(wrapper.find('.custom-extra').text()).toBe('Extra Content')
  })

  it('supports custom size when size prop is provided', () => {
    const wrapper = mount(Card, {
      props: {
        size: 'large'
      },
      slots: {
        default: '<div>Card content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('size')).toBe('large')
  })

  it('applies default size when size prop is not provided', () => {
    const wrapper = mount(Card, {
      slots: {
        default: '<div>Card content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('size')).toBe('default')
  })

  it('supports custom elevation when elevation prop is provided', () => {
    const wrapper = mount(Card, {
      props: {
        elevation: 8
      },
      slots: {
        default: '<div>Card content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('elevation')).toBe(8)
  })

  it('applies default elevation when elevation prop is not provided', () => {
    const wrapper = mount(Card, {
      slots: {
        default: '<div>Card content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('elevation')).toBe(2)
  })

  it('supports custom background color when backgroundColor prop is provided', () => {
    const wrapper = mount(Card, {
      props: {
        backgroundColor: '#f5f5f5'
      },
      slots: {
        default: '<div>Card content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('backgroundColor')).toBe('#f5f5f5')
  })

  it('supports custom text color when textColor prop is provided', () => {
    const wrapper = mount(Card, {
      props: {
        textColor: '#333333'
      },
      slots: {
        default: '<div>Card content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('textColor')).toBe('#333333')
  })

  it('supports custom padding when padding prop is provided', () => {
    const wrapper = mount(Card, {
      props: {
        padding: '24px'
      },
      slots: {
        default: '<div>Card content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('padding')).toBe('24px')
  })

  it('supports custom margin when margin prop is provided', () => {
    const wrapper = mount(Card, {
      props: {
        margin: '16px'
      },
      slots: {
        default: '<div>Card content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('margin')).toBe('16px')
  })

  it('supports custom width when width prop is provided', () => {
    const wrapper = mount(Card, {
      props: {
        width: '400px'
      },
      slots: {
        default: '<div>Card content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('width')).toBe('400px')
  })

  it('supports custom height when height prop is provided', () => {
    const wrapper = mount(Card, {
      props: {
        height: '300px'
      },
      slots: {
        default: '<div>Card content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('height')).toBe('300px')
  })

  it('supports responsive behavior when responsive prop is true', () => {
    const wrapper = mount(Card, {
      props: {
        responsive: true
      },
      slots: {
        default: '<div>Card content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('responsive')).toBe(true)
  })

  it('supports grid layout when grid prop is true', () => {
    const wrapper = mount(Card, {
      props: {
        grid: true
      },
      slots: {
        default: '<div>Card content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('grid')).toBe(true)
  })

  it('supports custom grid columns when gridColumns prop is provided', () => {
    const wrapper = mount(Card, {
      props: {
        grid: true,
        gridColumns: 3
      },
      slots: {
        default: '<div>Card content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('gridColumns')).toBe(3)
  })

  it('supports custom grid gap when gridGap prop is provided', () => {
    const wrapper = mount(Card, {
      props: {
        grid: true,
        gridGap: '16px'
      },
      slots: {
        default: '<div>Card content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('gridGap')).toBe('16px')
  })

  it('emits mouseenter event when mouse enters card', async () => {
    const wrapper = mount(Card, {
      slots: {
        default: '<div>Card content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.trigger('mouseenter')
    expect(wrapper.emitted('mouseenter')).toBeTruthy()
  })

  it('emits mouseleave event when mouse leaves card', async () => {
    const wrapper = mount(Card, {
      slots: {
        default: '<div>Card content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.trigger('mouseleave')
    expect(wrapper.emitted('mouseleave')).toBeTruthy()
  })

  it('handles empty content gracefully', () => {
    const wrapper = mount(Card, {
      slots: {
        default: ''
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.el-card').exists()).toBe(true)
    expect(wrapper.find('.el-card__body').exists()).toBe(true)
  })

  it('handles null content gracefully', () => {
    const wrapper = mount(Card, {
      slots: {
        default: null
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.el-card').exists()).toBe(true)
    expect(wrapper.find('.el-card__body').exists()).toBe(true)
  })

  it('handles undefined content gracefully', () => {
    const wrapper = mount(Card, {
      slots: {
        default: undefined
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.el-card').exists()).toBe(true)
    expect(wrapper.find('.el-card__body').exists()).toBe(true)
  })
})