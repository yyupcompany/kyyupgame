import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AppCard from '@/components/AppCard.vue'
import LucideIcon from '@/components/icons/LucideIcon.vue'

// Mock LucideIcon component
vi.mock('@/components/icons/LucideIcon.vue', () => ({
  default: {
    name: 'LucideIcon',
    template: '<div class="mock-lucide-icon"></div>',
    props: ['name', 'size', 'color', 'variant', 'strokeWidth']
  }
}))

// 控制台错误检测变量
let consoleSpy: any

describe('AppCard.vue', () => {
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  afterEach(() => {
    vi.clearAllMocks()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('组件渲染', () => {
    it('应该正确渲染基本卡片', () => {
      const wrapper = mount(AppCard)
      expect(wrapper.find('.app-card').exists()).toBe(true)
      expect(wrapper.classes()).toContain('app-card')
    })

    it('应该渲染带有标题的卡片', () => {
      const wrapper = mount(AppCard, {
        props: {
          title: '测试标题'
        }
      })
      expect(wrapper.find('.app-card-header').exists()).toBe(true)
      expect(wrapper.find('h3').text()).toBe('测试标题')
    })

    it('应该渲染带有副标题的卡片', () => {
      const wrapper = mount(AppCard, {
        props: {
          title: '主标题',
          subtitle: '副标题'
        }
      })
      expect(wrapper.find('.card-subtitle').text()).toBe('副标题')
    })

    it('应该渲染带有图标的卡片', () => {
      const wrapper = mount(AppCard, {
        props: {
          title: '测试标题',
          iconName: 'home'
        }
      })
      expect(wrapper.find('.card-icon').exists()).toBe(true)
      expect(wrapper.findComponent(LucideIcon).exists()).toBe(true)
    })

    it('应该渲染默认插槽内容', () => {
      const wrapper = mount(AppCard, {
        slots: {
          default: '<div class="test-content">测试内容</div>'
        }
      })
      expect(wrapper.find('.test-content').exists()).toBe(true)
      expect(wrapper.find('.test-content').text()).toBe('测试内容')
    })

    it('应该渲染头部插槽内容', () => {
      const wrapper = mount(AppCard, {
        slots: {
          header: '<div class="test-header">头部内容</div>'
        }
      })
      expect(wrapper.find('.test-header').exists()).toBe(true)
      expect(wrapper.find('.test-header').text()).toBe('头部内容')
    })

    it('应该渲染底部插槽内容', () => {
      const wrapper = mount(AppCard, {
        slots: {
          footer: '<div class="test-footer">底部内容</div>'
        }
      })
      expect(wrapper.find('.app-card-footer').exists()).toBe(true)
      expect(wrapper.find('.test-footer').exists()).toBe(true)
    })
  })

  describe('Props 测试', () => {
    it('应该正确接收和处理所有 props', () => {
      const props = {
        title: '测试标题',
        subtitle: '测试副标题',
        iconName: 'home',
        iconSize: 32,
        iconColor: '#ff0000',
        iconVariant: 'filled' as const,
        hoverable: true,
        shadow: 'lg' as const,
        padding: 'lg' as const
      }

      const wrapper = mount(AppCard, { props })

      expect(wrapper.props()).toEqual(props)
      expect(wrapper.classes()).toContain('app-card--shadow-lg')
      expect(wrapper.classes()).toContain('app-card--padding-lg')
      expect(wrapper.classes()).toContain('app-card--hoverable')
    })

    it('应该使用默认 props 值', () => {
      const wrapper = mount(AppCard)
      expect(wrapper.props('iconSize')).toBe(24)
      expect(wrapper.props('iconVariant')).toBe('default')
      expect(wrapper.props('hoverable')).toBe(false)
      expect(wrapper.props('shadow')).toBe('sm')
      expect(wrapper.props('padding')).toBe('md')
    })

    it('应该正确传递图标 props 给 LucideIcon 组件', () => {
      const wrapper = mount(AppCard, {
        props: {
          title: '测试',
          iconName: 'home',
          iconSize: 32,
          iconColor: '#ff0000',
          iconVariant: 'filled'
        }
      })

      const iconComponent = wrapper.findComponent(LucideIcon)
      expect(iconComponent.props('name')).toBe('home')
      expect(iconComponent.props('size')).toBe(32)
      expect(iconComponent.props('color')).toBe('#ff0000')
      expect(iconComponent.props('variant')).toBe('filled')
    })
  })

  describe('计算属性测试', () => {
    it('应该正确计算卡片类名', () => {
      const wrapper = mount(AppCard, {
        props: {
          hoverable: true,
          shadow: 'lg',
          padding: 'sm'
        }
      })

      const classes = wrapper.vm.cardClasses
      expect(classes).toEqual([
        'app-card',
        'app-card--shadow-lg',
        'app-card--padding-sm',
        {
          'app-card--hoverable': true
        }
      ])
    })

    it('应该根据不同 shadow 值添加对应类名', () => {
      const shadowValues = ['sm', 'md', 'lg', 'none']
      
      shadowValues.forEach(shadow => {
        const wrapper = mount(AppCard, {
          props: { shadow: shadow as any }
        })
        expect(wrapper.classes()).toContain(`app-card--shadow-${shadow}`)
      })
    })

    it('应该根据不同 padding 值添加对应类名', () => {
      const paddingValues = ['sm', 'md', 'lg']
      
      paddingValues.forEach(padding => {
        const wrapper = mount(AppCard, {
          props: { padding: padding as any }
        })
        expect(wrapper.classes()).toContain(`app-card--padding-${padding}`)
      })
    })

    it('应该根据 hoverable 值添加对应类名', () => {
      const wrapper = mount(AppCard, {
        props: { hoverable: true }
      })
      expect(wrapper.classes()).toContain('app-card--hoverable')

      const wrapper2 = mount(AppCard, {
        props: { hoverable: false }
      })
      expect(wrapper2.classes()).not.toContain('app-card--hoverable')
    })
  })

  describe('样式测试', () => {
    it('应该应用正确的 CSS 类', () => {
      const wrapper = mount(AppCard, {
        props: {
          hoverable: true,
          shadow: 'lg'
        }
      })

      const card = wrapper.find('.app-card')
      expect(card.classes()).toContain('app-card')
      expect(card.classes()).toContain('app-card--shadow-lg')
      expect(card.classes()).toContain('app-card--hoverable')
    })

    it('应该有正确的卡片结构', () => {
      const wrapper = mount(AppCard, {
        props: {
          title: '测试标题'
        },
        slots: {
          default: '主要内容',
          footer: '底部内容'
        }
      })

      expect(wrapper.find('.app-card-header').exists()).toBe(true)
      expect(wrapper.find('.app-card-body').exists()).toBe(true)
      expect(wrapper.find('.app-card-footer').exists()).toBe(true)
    })
  })

  describe('条件渲染测试', () => {
    it('当没有标题和图标时，不应该渲染头部', () => {
      const wrapper = mount(AppCard)
      expect(wrapper.find('.app-card-header').exists()).toBe(false)
    })

    it('当有标题时，应该渲染头部', () => {
      const wrapper = mount(AppCard, {
        props: { title: '测试标题' }
      })
      expect(wrapper.find('.app-card-header').exists()).toBe(true)
    })

    it('当有图标时，应该渲染头部', () => {
      const wrapper = mount(AppCard, {
        props: { iconName: 'home' }
      })
      expect(wrapper.find('.app-card-header').exists()).toBe(true)
    })

    it('当有头部插槽时，应该渲染头部', () => {
      const wrapper = mount(AppCard, {
        slots: { header: '头部内容' }
      })
      expect(wrapper.find('.app-card-header').exists()).toBe(true)
    })

    it('当没有底部插槽时，不应该渲染底部', () => {
      const wrapper = mount(AppCard)
      expect(wrapper.find('.app-card-footer').exists()).toBe(false)
    })

    it('当有底部插槽时，应该渲染底部', () => {
      const wrapper = mount(AppCard, {
        slots: { footer: '底部内容' }
      })
      expect(wrapper.find('.app-card-footer').exists()).toBe(true)
    })
  })

  describe('响应式设计测试', () => {
    it('应该在小屏幕下应用响应式样式', () => {
      // 模拟小屏幕
      window.innerWidth = 768
      window.dispatchEvent(new Event('resize'))

      const wrapper = mount(AppCard, {
        props: {
          title: '测试标题',
          padding: 'md'
        }
      })

      // 由于是 scoped CSS，我们主要测试组件是否正确渲染
      expect(wrapper.find('.app-card').exists()).toBe(true)
      expect(wrapper.find('.app-card-header').exists()).toBe(true)
    })
  })

  describe('可访问性测试', () => {
    it('应该有适当的语义化结构', () => {
      const wrapper = mount(AppCard, {
        props: { title: '测试标题' }
      })

      const header = wrapper.find('.app-card-header')
      const title = wrapper.find('h3')
      
      expect(header.exists()).toBe(true)
      expect(title.exists()).toBe(true)
      expect(title.text()).toBe('测试标题')
    })
  })
})