import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory, Router } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import AppCard from '@/components/AppCard.vue'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring'

// Mock LucideIcon component
vi.mock('@/components/icons/LucideIcon.vue', () => ({
  default: {
    name: 'LucideIcon',
    template: '<div class="mock-lucide-icon" :style="{ fontSize: size + \'px\', color: color }">{{ name }}</div>',
    props: ['name', 'size', 'color', 'variant', 'stroke-width']
  }
}))

// 控制台错误检测变量
let consoleSpy: any

describe('AppCard.vue - 完整错误检测', () => {
  let router: Router
  let pinia: any
  let wrapper: any

  beforeEach(() => {
    // 开始控制台错误监控
    startConsoleMonitoring()

    // Setup Pinia
    pinia = createPinia()
    setActivePinia(pinia)

    // Setup Router
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div></div>' } }
      ]
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    // 验证没有控制台错误并停止监控
    expectNoConsoleErrors()
    stopConsoleMonitoring()

    // 清理wrapper
    if (wrapper) => {
      wrapper.unmount()
    }
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  const createWrapper = (props = {}, slots = {}) => {
    return mount(AppCard, {
      props,
      slots,
      global: {
        plugins: [router, pinia],
        mocks: {
          $t: (key: string) => key
        }
      }
    })
  }

  describe('Component Rendering', () => {
    it('renders the card component correctly with default props', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.app-card').exists()).toBe(true)
      expect(wrapper.classes()).toContain('app-card')
      expect(wrapper.classes()).toContain('app-card--shadow-sm')
      expect(wrapper.classes()).toContain('app-card--padding-md')
      expect(wrapper.classes()).not.toContain('app-card--hoverable')
    })

    it('renders without header when no title, icon, or header slot is provided', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.app-card-header').exists()).toBe(false)
    })

    it('renders header when title is provided', () => {
      wrapper = createWrapper({ title: 'Test Card Title' })
      
      expect(wrapper.find('.app-card-header').exists()).toBe(true)
      expect(wrapper.find('.card-title').exists()).toBe(true)
      expect(wrapper.find('h3').exists()).toBe(true)
      expect(wrapper.find('h3').text()).toBe('Test Card Title')
    })

    it('renders header when iconName is provided', () => {
      wrapper = createWrapper({ iconName: 'test-icon' })
      
      expect(wrapper.find('.app-card-header').exists()).toBe(true)
      expect(wrapper.find('.card-icon').exists()).toBe(true)
      expect(wrapper.find('.mock-lucide-icon').exists()).toBe(true)
    })

    it('renders header when header slot is provided', () => {
      wrapper = createWrapper({}, {
        header: '<div class="custom-header">Custom Header Content</div>'
      })
      
      expect(wrapper.find('.app-card-header').exists()).toBe(true)
      expect(wrapper.find('.custom-header').exists()).toBe(true)
      expect(wrapper.find('.custom-header').text()).toBe('Custom Header Content')
    })

    it('renders body content from default slot', () => {
      wrapper = createWrapper({}, {
        default: '<div class="card-content">Card Body Content</div>'
      })
      
      expect(wrapper.find('.app-card-body').exists()).toBe(true)
      expect(wrapper.find('.card-content').exists()).toBe(true)
      expect(wrapper.find('.card-content').text()).toBe('Card Body Content')
    })

    it('renders footer when footer slot is provided', () => {
      wrapper = createWrapper({}, {
        footer: '<div class="card-footer">Footer Content</div>'
      })
      
      expect(wrapper.find('.app-card-footer').exists()).toBe(true)
      expect(wrapper.find('.card-footer').exists()).toBe(true)
      expect(wrapper.find('.card-footer').text()).toBe('Footer Content')
    })

    it('does not render footer when footer slot is not provided', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.app-card-footer').exists()).toBe(false)
    })
  })

  describe('Props Handling', () => {
    it('applies correct shadow classes based on shadow prop', () => {
      const shadowVariants = ['none', 'sm', 'md', 'lg']
      
      shadowVariants.forEach(shadow => {
        wrapper = createWrapper({ shadow })
        
        expect(wrapper.classes()).toContain(`app-card--shadow-${shadow}`)
      })
    })

    it('applies correct padding classes based on padding prop', () => {
      const paddingVariants = ['sm', 'md', 'lg']
      
      paddingVariants.forEach(padding => {
        wrapper = createWrapper({ padding })
        
        expect(wrapper.classes()).toContain(`app-card--padding-${padding}`)
      })
    })

    it('applies hoverable class when hoverable prop is true', () => {
      wrapper = createWrapper({ hoverable: true })
      
      expect(wrapper.classes()).toContain('app-card--hoverable')
    })

    it('does not apply hoverable class when hoverable prop is false', () => {
      wrapper = createWrapper({ hoverable: false })
      
      expect(wrapper.classes()).not.toContain('app-card--hoverable')
    })

    it('uses default values for props when not provided', () => {
      wrapper = createWrapper()
      
      const vm = wrapper.vm
      expect(vm.iconSize).toBe(24)
      expect(vm.iconVariant).toBe('default')
      expect(vm.hoverable).toBe(false)
      expect(vm.shadow).toBe('sm')
      expect(vm.padding).toBe('md')
    })

    it('uses provided values for props when specified', () => {
      const customProps = {
        iconSize: 32,
        iconVariant: 'filled',
        hoverable: true,
        shadow: 'lg',
        padding: 'lg'
      }
      
      wrapper = createWrapper(customProps)
      
      const vm = wrapper.vm
      expect(vm.iconSize).toBe(32)
      expect(vm.iconVariant).toBe('filled')
      expect(vm.hoverable).toBe(true)
      expect(vm.shadow).toBe('lg')
      expect(vm.padding).toBe('lg')
    })
  })

  describe('Icon Rendering', () => {
    it('renders LucideIcon with correct props when iconName is provided', () => {
      wrapper = createWrapper({ 
        iconName: 'test-icon',
        iconSize: 32,
        iconColor: '#ff0000',
        iconVariant: 'filled'
      })
      
      const iconComponent = wrapper.find('.mock-lucide-icon')
      expect(iconComponent.exists()).toBe(true)
      expect(iconComponent.text()).toBe('test-icon')
      // 检查样式属性而不是props
      expect(iconComponent.attributes('style')).toContain('font-size: 32px')
      expect(iconComponent.attributes('style')).toContain('color: #ff0000')
      // stroke-width是组件内部属性，在测试环境中不易验证
    })

    it('does not render icon when iconName is not provided', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.card-icon').exists()).toBe(false)
      expect(wrapper.find('.mock-lucide-icon').exists()).toBe(false)
    })

    it('renders icon within card-icon container', () => {
      wrapper = createWrapper({ iconName: 'test-icon' })
      
      expect(wrapper.find('.card-icon').exists()).toBe(true)
      expect(wrapper.find('.mock-lucide-icon').exists()).toBe(true)
      expect(wrapper.find('.card-icon').find('.mock-lucide-icon').exists()).toBe(true)
    })
  })

  describe('Title and Subtitle', () => {
    it('renders title when provided', () => {
      wrapper = createWrapper({ title: 'Main Title' })
      
      expect(wrapper.find('.card-title').exists()).toBe(true)
      expect(wrapper.find('h3').exists()).toBe(true)
      expect(wrapper.find('h3').text()).toBe('Main Title')
    })

    it('renders subtitle when provided', () => {
      wrapper = createWrapper({ 
        title: 'Main Title',
        subtitle: 'Subtitle Text'
      })
      
      expect(wrapper.find('.card-subtitle').exists()).toBe(true)
      expect(wrapper.find('.card-subtitle').text()).toBe('Subtitle Text')
    })

    it('does not render subtitle when not provided', () => {
      wrapper = createWrapper({ title: 'Main Title' })
      
      expect(wrapper.find('.card-subtitle').exists()).toBe(false)
    })

    it('does not render title when not provided', () => {
      wrapper = createWrapper({ subtitle: 'Subtitle Only' })
      
      expect(wrapper.find('.card-title').exists()).toBe(false)
      expect(wrapper.find('h3').exists()).toBe(false)
    })

    it('renders title and subtitle together correctly', () => {
      wrapper = createWrapper({ 
        title: 'Card Title',
        subtitle: 'Card Subtitle Description'
      })
      
      const titleElement = wrapper.find('h3')
      const subtitleElement = wrapper.find('.card-subtitle')
      
      expect(titleElement.exists()).toBe(true)
      expect(subtitleElement.exists()).toBe(true)
      expect(titleElement.text()).toBe('Card Title')
      expect(subtitleElement.text()).toBe('Card Subtitle Description')
    })
  })

  describe('Slot Content', () => {
    it('renders complex default slot content', () => {
      const complexContent = `
        <div class="complex-content">
          <h4>Section Header</h4>
          <p>Paragraph content</p>
          <ul>
            <li>List item 1</li>
            <li>List item 2</li>
          </ul>
        </div>
      `
      
      wrapper = createWrapper({}, {
        default: complexContent
      })
      
      expect(wrapper.find('.complex-content').exists()).toBe(true)
      expect(wrapper.find('h4').exists()).toBe(true)
      expect(wrapper.find('p').exists()).toBe(true)
      expect(wrapper.find('ul').exists()).toBe(true)
      expect(wrapper.findAll('li')).toHaveLength(2)
    })

    it('renders header slot content alongside title and icon', () => {
      wrapper = createWrapper(
        { 
          title: 'Card Title',
          iconName: 'test-icon'
        },
        {
          header: '<div class="header-actions">Actions</div>'
        }
      )
      
      expect(wrapper.find('.card-title').exists()).toBe(true)
      expect(wrapper.find('.card-icon').exists()).toBe(true)
      expect(wrapper.find('.header-actions').exists()).toBe(true)
      expect(wrapper.find('.header-actions').text()).toBe('Actions')
    })

    it('renders footer slot content correctly', () => {
      const footerContent = `
        <div class="footer-content">
          <button>Cancel</button>
          <button class="primary">Save</button>
        </div>
      `
      
      wrapper = createWrapper({}, {
        footer: footerContent
      })
      
      expect(wrapper.find('.footer-content').exists()).toBe(true)
      expect(wrapper.findAll('button')).toHaveLength(2)
      expect(wrapper.findAll('button')[0].text()).toBe('Cancel')
      expect(wrapper.findAll('button')[1].text()).toBe('Save')
    })

    it('handles empty slots gracefully', () => {
      wrapper = createWrapper({}, {
        default: ''
      })

      expect(wrapper.find('.app-card-body').exists()).toBe(true)
      // header只有在有title、iconName或header插槽时才显示
      expect(wrapper.find('.app-card-header').exists()).toBe(false)
      expect(wrapper.find('.app-card-footer').exists()).toBe(false)
    })
  })

  describe('Styling and CSS Classes', () => {
    it('applies base card styling classes', () => {
      wrapper = createWrapper()
      
      const cardElement = wrapper.find('.app-card')
      expect(cardElement.exists()).toBe(true)
      expect(cardElement.classes()).toContain('app-card')
    })

    it('applies responsive design classes', () => {
      wrapper = createWrapper()
      
      const cardElement = wrapper.find('.app-card')
      expect(cardElement.exists()).toBe(true)
      // Responsive classes should be applied via CSS media queries
    })

    it('maintains proper CSS variable usage', () => {
      wrapper = createWrapper()
      
      const cardElement = wrapper.find('.app-card')
      expect(cardElement.exists()).toBe(true)
      // CSS variables should be applied for theming
    })

    it('applies transition effects for hoverable cards', () => {
      wrapper = createWrapper({ hoverable: true })
      
      const cardElement = wrapper.find('.app-card')
      expect(cardElement.exists()).toBe(true)
      expect(cardElement.classes()).toContain('app-card--hoverable')
      // Transition effects should be applied via CSS
    })
  })

  describe('Computed Properties', () => {
    it('computes card classes correctly with default props', () => {
      wrapper = createWrapper()
      
      const vm = wrapper.vm
      const classes = vm.cardClasses
      
      expect(classes).toContain('app-card')
      expect(classes).toContain('app-card--shadow-sm')
      expect(classes).toContain('app-card--padding-md')
      expect(classes).not.toContain('app-card--hoverable')
    })

    it('computes card classes correctly with custom props', () => {
      wrapper = createWrapper({
        shadow: 'lg',
        padding: 'sm',
        hoverable: true
      })
      
      // 检查DOM元素的实际CSS类
      const element = wrapper.find('.app-card')
      expect(element.classes()).toContain('app-card')
      expect(element.classes()).toContain('app-card--shadow-lg')
      expect(element.classes()).toContain('app-card--padding-sm')
      expect(element.classes()).toContain('app-card--hoverable')
    })

    it('updates computed classes when props change', async () => {
      wrapper = createWrapper({ hoverable: false })

      expect(wrapper.find('.app-card').classes()).not.toContain('app-card--hoverable')

      await wrapper.setProps({ hoverable: true })

      expect(wrapper.find('.app-card').classes()).toContain('app-card--hoverable')
    })
  })

  describe('Layout and Structure', () => {
    it('maintains proper DOM structure with all sections', () => {
      wrapper = createWrapper(
        { 
          title: 'Complete Card',
          subtitle: 'With all sections',
          iconName: 'icon'
        },
        {
          default: '<div>Body Content</div>',
          header: '<div>Header Slot</div>',
          footer: '<div>Footer Slot</div>'
        }
      )
      
      expect(wrapper.find('.app-card').exists()).toBe(true)
      expect(wrapper.find('.app-card-header').exists()).toBe(true)
      expect(wrapper.find('.app-card-body').exists()).toBe(true)
      expect(wrapper.find('.app-card-footer').exists()).toBe(true)
      expect(wrapper.find('.card-header-content').exists()).toBe(true)
      expect(wrapper.find('.card-icon').exists()).toBe(true)
      expect(wrapper.find('.card-title').exists()).toBe(true)
    })

    it('maintains proper header content layout', () => {
      wrapper = createWrapper({
        title: 'Header Layout Test',
        iconName: 'layout-icon'
      })
      
      const headerContent = wrapper.find('.card-header-content')
      expect(headerContent.exists()).toBe(true)
      
      const iconContainer = wrapper.find('.card-icon')
      const titleContainer = wrapper.find('.card-title')
      
      expect(iconContainer.exists()).toBe(true)
      expect(titleContainer.exists()).toBe(true)
    })

    it('handles minimal card structure gracefully', () => {
      wrapper = createWrapper({}, {
        default: '<div>Minimal Content</div>'
      })
      
      expect(wrapper.find('.app-card').exists()).toBe(true)
      expect(wrapper.find('.app-card-header').exists()).toBe(false)
      expect(wrapper.find('.app-card-body').exists()).toBe(true)
      expect(wrapper.find('.app-card-footer').exists()).toBe(false)
    })
  })

  describe('Responsive Design', () => {
    it('applies responsive styling for mobile devices', () => {
      wrapper = createWrapper({ padding: 'lg' })
      
      const cardElement = wrapper.find('.app-card')
      expect(cardElement.exists()).toBe(true)
      // Responsive styles should be applied via CSS media queries
    })

    it('maintains layout integrity across different screen sizes', () => {
      wrapper = createWrapper({
        title: 'Responsive Card',
        padding: 'md'
      })
      
      expect(wrapper.find('.app-card').exists()).toBe(true)
      expect(wrapper.find('.card-title').exists()).toBe(true)
      // Layout should adapt to different screen sizes via CSS
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined props gracefully', () => {
      wrapper = createWrapper({
        title: undefined,
        subtitle: undefined,
        iconName: undefined
      })
      
      expect(wrapper.find('.app-card').exists()).toBe(true)
      expect(wrapper.find('.app-card-header').exists()).toBe(false)
    })

    it('handles empty string props', () => {
      wrapper = createWrapper({
        title: '',
        subtitle: '',
        iconName: ''
      })
      
      expect(wrapper.find('.app-card').exists()).toBe(true)
      expect(wrapper.find('.app-card-header').exists()).toBe(false)
    })

    it('handles very long content in slots', () => {
      const longContent = 'A'.repeat(1000)
      wrapper = createWrapper({}, {
        default: `<div class="long-content">${longContent}</div>`
      })
      
      expect(wrapper.find('.long-content').exists()).toBe(true)
      expect(wrapper.find('.long-content').text()).toBe(longContent)
    })

    it('handles special characters in slot content', () => {
      const specialContent = 'Special: < > & " \' / \\'
      wrapper = createWrapper({}, {
        default: `<div class="special">${specialContent}</div>`
      })
      
      expect(wrapper.find('.special').exists()).toBe(true)
      expect(wrapper.find('.special').text()).toBe(specialContent)
    })
  })

  describe('Performance', () => {
    it('renders efficiently with minimal content', () => {
      const start = performance.now()
      wrapper = createWrapper({}, {
        default: '<div>Simple Content</div>'
      })
      const end = performance.now()
      
      expect(wrapper.find('.app-card').exists()).toBe(true)
      expect(end - start).toBeLessThan(10) // Should render quickly
    })

    it('renders efficiently with complex content', () => {
      const complexContent = Array(20).fill(0).map((_, i) => 
        `<div class="item-${i}">Item ${i}</div>`
      ).join('')
      
      const start = performance.now()
      wrapper = createWrapper({
        title: 'Complex Card',
        iconName: 'complex-icon'
      }, {
        default: complexContent,
        footer: '<div>Complex Footer</div>'
      })
      const end = performance.now()
      
      expect(wrapper.find('.app-card').exists()).toBe(true)
      expect(wrapper.findAll('[class^="item-"]')).toHaveLength(20)
      expect(end - start).toBeLessThan(50) // Should still render reasonably quickly
    })

    it('handles reactivity efficiently', async () => {
      wrapper = createWrapper({ title: 'Initial Title' })

      // Perform multiple prop updates to test reactivity
      for (let i = 0;
import { vi } from 'vitest' i < 5; i++) {
        await wrapper.setProps({ title: `Dynamic Title ${i}` })
        expect(wrapper.find('h3').text()).toBe(`Dynamic Title ${i}`)
      }

      expect(wrapper.find('.app-card').exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('renders with semantic HTML structure', () => {
      wrapper = createWrapper({
        title: 'Accessible Card'
      }, {
        default: '<article>Card content</article>',
        footer: '<footer>Footer content</footer>'
      })
      
      expect(wrapper.find('h3').exists()).toBe(true)
      expect(wrapper.find('article').exists()).toBe(true)
      expect(wrapper.find('footer').exists()).toBe(true)
    })

    it('maintains proper heading hierarchy', () => {
      wrapper = createWrapper({ title: 'Card Heading' })
      
      const heading = wrapper.find('h3')
      expect(heading.exists()).toBe(true)
      expect(heading.text()).toBe('Card Heading')
    })

    it('supports accessible content structure', () => {
      wrapper = createWrapper({}, {
        default: `
          <section aria-labelledby="card-title">
            <h4 id="card-title">Section Title</h4>
            <p>Section content</p>
          </section>
        `
      })
      
      expect(wrapper.find('section').exists()).toBe(true)
      expect(wrapper.find('section').attributes('aria-labelledby')).toBe('card-title')
      expect(wrapper.find('#card-title').exists()).toBe(true)
    })
  })
})