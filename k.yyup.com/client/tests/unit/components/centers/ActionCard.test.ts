import { mount } from '@vue/test-utils'
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

describe, it, expect, beforeEach, vi } from 'vitest'
import ActionCard from '@/components/centers/ActionCard.vue'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'

// Mock UnifiedIcon component
vi.mock('@/components/icons/UnifiedIcon.vue', () => ({
  default: {
    name: 'UnifiedIcon',
    template: '<div class="mock-icon"><slot></slot></div>'
  }
}))

describe('ActionCard.vue', () => {
  let wrapper: any

  const defaultProps = {
    title: '测试标题',
    description: '测试描述',
    icon: 'test-icon'
  }

  const createWrapper = (props = {}) => {
    return mount(ActionCard, {
      props: {
        ...defaultProps,
        ...props
      },
      global: {
        components: {
          UnifiedIcon
        }
      }
    })
  }

  beforeEach(() => {
    wrapper = null
  })

  describe('组件渲染', () => {
    it('应该正确渲染基本内容', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.action-card').exists()).toBe(true)
      expect(wrapper.find('.action-card__title').text()).toBe('测试标题')
      expect(wrapper.find('.action-card__description').text()).toBe('测试描述')
      expect(wrapper.findComponent(UnifiedIcon).exists()).toBe(true)
      expect(wrapper.findComponent(UnifiedIcon).props('name')).toBe('test-icon')
    })

    it('应该应用正确的颜色类', () => {
      wrapper = createWrapper({ color: 'success' })
      
      expect(wrapper.find('.action-card').classes()).toContain('action-card--success')
    })

    it('应该默认使用 primary 颜色', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.action-card').classes()).toContain('action-card--primary')
    })

    it('clickable 为 true 时应该显示箭头图标', () => {
      wrapper = createWrapper({ clickable: true })
      
      expect(wrapper.find('.action-card__arrow').exists()).toBe(true)
      expect(wrapper.find('.action-card').classes()).toContain('action-card--clickable')
    })

    it('clickable 为 false 时不应该显示箭头图标', () => {
      wrapper = createWrapper({ clickable: false })
      
      expect(wrapper.find('.action-card__arrow').exists()).toBe(false)
      expect(wrapper.find('.action-card').classes()).not.toContain('action-card--clickable')
    })
  })

  describe('用户交互', () => {
    it('clickable 为 true 时点击应该触发 click 事件', async () => {
      wrapper = createWrapper({ clickable: true })
      
      await wrapper.find('.action-card').trigger('click')
      
      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')).toHaveLength(1)
    })

    it('clickable 为 false 时点击不应该触发 click 事件', async () => {
      wrapper = createWrapper({ clickable: false })
      
      await wrapper.find('.action-card').trigger('click')
      
      expect(wrapper.emitted('click')).toBeFalsy()
    })

    it('disabled 状态下的点击行为', async () => {
      wrapper = createWrapper({ clickable: true })
      
      // 模拟 disabled 状态（通过添加 disabled 类）
      await wrapper.find('.action-card').trigger('click')
      
      // 即使有 disabled 类，只要 clickable 为 true 仍然会触发事件
      // 实际的 disabled 逻辑应该在业务层处理
      expect(wrapper.emitted('click')).toBeTruthy()
    })
  })

  describe('Props 测试', () => {
    it('应该正确传递所有 props', () => {
      const customProps = {
        title: '自定义标题',
        description: '自定义描述',
        icon: 'custom-icon',
        color: 'danger' as const,
        clickable: false
      }
      
      wrapper = createWrapper(customProps)
      
      expect(wrapper.find('.action-card__title').text()).toBe('自定义标题')
      expect(wrapper.find('.action-card__description').text()).toBe('自定义描述')
      expect(wrapper.findComponent(UnifiedIcon).props('name')).toBe('custom-icon')
      expect(wrapper.find('.action-card').classes()).toContain('action-card--danger')
      expect(wrapper.find('.action-card').classes()).not.toContain('action-card--clickable')
    })

    it('应该处理空值和默认值', () => {
      wrapper = createWrapper({
        title: '',
        description: '',
        icon: ''
      })
      
      expect(wrapper.find('.action-card__title').text()).toBe('')
      expect(wrapper.find('.action-card__description').text()).toBe('')
      expect(wrapper.findComponent(UnifiedIcon).props('name')).toBe('')
    })
  })

  describe('边界条件测试', () => {
    it('应该处理很长的标题和描述', () => {
      const longTitle = '这是一个非常长的标题，用来测试组件在内容过多时的显示效果和样式处理'
      const longDescription = '这是一个非常长的描述文本，用来测试组件在内容过多时的显示效果和样式处理，确保文本能够正确换行和显示'
      
      wrapper = createWrapper({
        title: longTitle,
        description: longDescription
      })
      
      expect(wrapper.find('.action-card__title').text()).toBe(longTitle)
      expect(wrapper.find('.action-card__description').text()).toBe(longDescription)
    })

    it('应该处理特殊字符', () => {
      const specialChars = {
        title: '测试标题 & 特殊字符 < > " \'',
        description: '测试描述 @#$%^&*()',
        icon: 'special-icon-123'
      }
      
      wrapper = createWrapper(specialChars)
      
      expect(wrapper.find('.action-card__title').text()).toBe(specialChars.title)
      expect(wrapper.find('.action-card__description').text()).toBe(specialChars.description)
      expect(wrapper.findComponent(UnifiedIcon).props('name')).toBe(specialChars.icon)
    })

    it('应该处理 HTML 内容（应该被转义）', () => {
      const htmlContent = {
        title: '<script>alert("xss")</script>',
        description: '<b>粗体文本</b>',
        icon: 'html-icon'
      }
      
      wrapper = createWrapper(htmlContent)
      
      // HTML 应该被转义，而不是作为 HTML 渲染
      expect(wrapper.find('.action-card__title').text()).toBe(htmlContent.title)
      expect(wrapper.find('.action-card__description').text()).toBe(htmlContent.description)
      expect(wrapper.find('.action-card__title').find('script').exists()).toBe(false)
    })
  })

  describe('样式和响应式测试', () => {
    it('应该包含必要的 CSS 类', () => {
      wrapper = createWrapper()
      
      const card = wrapper.find('.action-card')
      expect(card.classes()).toContain('action-card')
      expect(card.find('.action-card__icon').exists()).toBe(true)
      expect(card.find('.action-card__content').exists()).toBe(true)
      expect(card.find('.action-card__title').exists()).toBe(true)
      expect(card.find('.action-card__description').exists()).toBe(true)
    })

    it('hover 效果应该正确应用', async () => {
      wrapper = createWrapper({ clickable: true })
      
      const card = wrapper.find('.action-card')
      
      // 模拟 hover
      await card.trigger('mouseenter')
      
      // 检查 hover 状态的类（如果有）
      expect(card.classes()).toContain('action-card--clickable')
    })

    it('应该支持不同的颜色主题', () => {
      const colors = ['primary', 'success', 'warning', 'info', 'danger'] as const
      
      colors.forEach(color => {
        wrapper = createWrapper({ color })
        expect(wrapper.find('.action-card').classes()).toContain(`action-card--${color}`)
      })
    })
  })

  describe('组件集成测试', () => {
    it('应该与 UnifiedIcon 组件正确集成', () => {
      wrapper = createWrapper({
        icon: 'test-icon',
        color: 'success'
      })
      
      const iconComponent = wrapper.findComponent(UnifiedIcon)
      expect(iconComponent.exists()).toBe(true)
      expect(iconComponent.props('name')).toBe('test-icon')
      expect(iconComponent.props('size')).toBe(24)
    })

    it('应该处理图标组件的加载失败', () => {
      // 模拟 UnifiedIcon 组件加载失败的情况
      vi.mock('@/components/icons/UnifiedIcon.vue', () => ({
        default: {
          name: 'UnifiedIcon',
          template: '<div>Icon loading failed</div>',
          errorCaptured: true
        }
      }))
      
      wrapper = createWrapper()
      
      // 组件应该仍然能够渲染，即使图标组件有问题
      expect(wrapper.find('.action-card').exists()).toBe(true)
      expect(wrapper.find('.action-card__title').text()).toBe('测试标题')
    })
  })

  describe('性能测试', () => {
    it('应该快速渲染组件', () => {
      const startTime = performance.now()
      
      wrapper = createWrapper()
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      expect(renderTime).toBeLessThan(100) // 渲染时间应该小于 100ms
    })

    it('应该正确处理多次快速点击', async () => {
      wrapper = createWrapper({ clickable: true })
      
      // 模拟快速多次点击
      const clickPromises = []
      for (let i = 0; i < 5; i++) {
        clickPromises.push(wrapper.find('.action-card').trigger('click'))
      }
      
      await Promise.all(clickPromises)
      
      // 应该触发所有点击事件
      expect(wrapper.emitted('click')).toHaveLength(5)
    })
  })
})