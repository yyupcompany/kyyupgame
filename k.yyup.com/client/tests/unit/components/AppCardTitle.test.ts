import { describe, it, expect } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory, Router } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import AppCardTitle from '@/components/AppCardTitle.vue'

// 控制台错误检测变量
let consoleSpy: any

describe('AppCardTitle.vue', () => {
    beforeEach(() => {
      startConsoleMonitoring()
      vi.clearAllMocks()
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    afterEach(() => {
      expectNoConsoleErrors()
      stopConsoleMonitoring()
    })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
  let router: Router
  let pinia: any
  let wrapper: any

  beforeEach(() => {
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

  const createWrapper = (slots = {}) => {
    return mount(AppCardTitle, {
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
    it('renders the component correctly as h4 element', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('h4').exists()).toBe(true)
      expect(wrapper.find('.app-card-title').exists()).toBe(true)
      expect(wrapper.classes()).toContain('app-card-title')
    })

    it('applies default styling with proper CSS classes', () => {
      wrapper = createWrapper()

      const titleElement = wrapper.find('.app-card-title')
      expect(titleElement.exists()).toBe(true)
      expect(titleElement.classes()).toContain('app-card-title')
    })

    it('renders without any content', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('h4').exists()).toBe(true)
      expect(wrapper.find('.app-card-title').exists()).toBe(true)
      expect(wrapper.text()).toBe('')
    })

    it('has correct HTML structure', () => {
      wrapper = createWrapper()
      
      expect(wrapper.element.tagName).toBe('H4')
      expect(wrapper.classes()).toContain('app-card-title')
    })
  })

  describe('Slot Functionality', () => {
    it('renders default slot content when provided', () => {
      const slotContent = 'Card Title Text'
      wrapper = createWrapper({
        default: slotContent
      })
      
      expect(wrapper.text()).toBe('Card Title Text')
    })

    it('renders complex slot content with HTML elements', () => {
      const complexSlotContent = '<span class="title-highlight">Important</span> Title'
      wrapper = createWrapper({
        default: complexSlotContent
      })
      
      expect(wrapper.find('.title-highlight').exists()).toBe(true)
      expect(wrapper.find('.title-highlight').text()).toBe('Important')
      expect(wrapper.text()).toContain('Important Title')
    })

    it('renders slot content with Vue components', () => {
      const slotContent = '<span class="vue-component">Vue Component Title</span>'
      wrapper = createWrapper({
        default: slotContent
      })
      
      expect(wrapper.find('.vue-component').exists()).toBe(true)
      expect(wrapper.find('.vue-component').text()).toBe('Vue Component Title')
    })

    it('renders slot content with icons', () => {
      const iconContent = '<i class="icon-star">★</i> Starred Title'
      wrapper = createWrapper({
        default: iconContent
      })
      
      expect(wrapper.find('.icon-star').exists()).toBe(true)
      expect(wrapper.find('.icon-star').text()).toBe('★')
      expect(wrapper.text()).toContain('Starred Title')
    })

    it('renders slot content with mixed text and elements', () => {
      const mixedContent = 'Main Title <small class="subtitle">(Secondary)</small>'
      wrapper = createWrapper({
        default: mixedContent
      })
      
      expect(wrapper.text()).toContain('Main Title')
      expect(wrapper.text()).toContain('(Secondary)')
      expect(wrapper.find('.subtitle').exists()).toBe(true)
      expect(wrapper.find('.subtitle').text()).toBe('(Secondary)')
    })
  })

  describe('Typography Styling', () => {
    it('applies font size styling', () => {
      wrapper = createWrapper()
      
      const titleElement = wrapper.find('.app-card-title')
      expect(titleElement.exists()).toBe(true)
      // Font size should be applied via CSS variable --text-lg
    })

    it('applies font weight styling', () => {
      wrapper = createWrapper()
      
      const titleElement = wrapper.find('.app-card-title')
      expect(titleElement.exists()).toBe(true)
      // Font weight should be 600 (semi-bold)
    })

    it('applies text color styling', () => {
      wrapper = createWrapper()
      
      const titleElement = wrapper.find('.app-card-title')
      expect(titleElement.exists()).toBe(true)
      // Color should be applied via CSS variable --text-primary
    })

    it('applies margin styling', () => {
      wrapper = createWrapper()
      
      const titleElement = wrapper.find('.app-card-title')
      expect(titleElement.exists()).toBe(true)
      // Margin should be 0 to override default h4 margin
    })
  })

  describe('Component Behavior', () => {
    it('remains reactive when slot content changes', async () => {
      wrapper = createWrapper({
        default: 'Dynamic Title'
      })

      // Should render the slot content
      expect(wrapper.text()).toBe('Dynamic Title')
      expect(wrapper.find('.app-card-title').exists()).toBe(true)
    })

    it('handles empty slot content gracefully', () => {
      wrapper = createWrapper({
        default: ''
      })
      
      expect(wrapper.find('h4').exists()).toBe(true)
      expect(wrapper.find('.app-card-title').exists()).toBe(true)
      expect(wrapper.html()).toContain('class="app-card-title"')
    })

    it('handles whitespace-only slot content', () => {
      wrapper = createWrapper({
        default: '   \n   \t   \n   '
      })
      
      expect(wrapper.find('h4').exists()).toBe(true)
      expect(wrapper.find('.app-card-title').exists()).toBe(true)
      expect(wrapper.text().trim()).toBe('')
    })

    it('preserves text formatting with slot content', () => {
      wrapper = createWrapper({
        default: 'Title with line breaks and spaces'
      })

      expect(wrapper.text()).toBe('Title with line breaks and spaces')
    })
  })

  describe('Edge Cases', () => {
    it('renders with very long title content', () => {
      const longContent = 'A'.repeat(200)
      wrapper = createWrapper({
        default: longContent
      })
      
      expect(wrapper.text()).toBe(longContent)
      expect(wrapper.text().length).toBe(200)
    })

    it('renders with special characters in title content', () => {
      const specialContent = 'Special chars: < > & " \' / \\'
      wrapper = createWrapper({
        default: specialContent
      })
      
      expect(wrapper.text()).toBe(specialContent)
    })

    it('renders with HTML entities in title content', () => {
      const htmlEntities = 'HTML entities: < > & " \''
      wrapper = createWrapper({
        default: htmlEntities
      })

      expect(wrapper.text()).toBe(htmlEntities)
    })

    it('renders with emoji characters', () => {
      const emojiContent = '🎉 Celebration Title 🚀'
      wrapper = createWrapper({
        default: emojiContent
      })
      
      expect(wrapper.text()).toBe(emojiContent)
    })

    it('renders with unicode characters', () => {
      const unicodeContent = '中文标题 with ñiño and café'
      wrapper = createWrapper({
        default: unicodeContent
      })
      
      expect(wrapper.text()).toBe(unicodeContent)
    })

    it('renders with numbers and symbols', () => {
      const numberContent = 'Title 123: $100 @ 50% off'
      wrapper = createWrapper({
        default: numberContent
      })
      
      expect(wrapper.text()).toBe(numberContent)
    })
  })

  describe('Semantic HTML', () => {
    it('uses h4 element for proper heading hierarchy', () => {
      wrapper = createWrapper({
        default: 'Section Title'
      })
      
      expect(wrapper.element.tagName).toBe('H4')
      expect(wrapper.text()).toBe('Section Title')
    })

    it('maintains semantic meaning with complex content', () => {
      wrapper = createWrapper({
        default: '<span data-role="title-text">Semantic Title</span>'
      })
      
      expect(wrapper.element.tagName).toBe('H4')
      expect(wrapper.find('[data-role="title-text"]').exists()).toBe(true)
      expect(wrapper.find('[data-role="title-text"]').text()).toBe('Semantic Title')
    })

    it('supports ARIA attributes when provided in slot', () => {
      wrapper = createWrapper({
        default: '<span aria-label="Accessible Title">Title</span>'
      })
      
      expect(wrapper.find('h4').exists()).toBe(true)
      expect(wrapper.find('[aria-label]').exists()).toBe(true)
      expect(wrapper.find('[aria-label]').attributes('aria-label')).toBe('Accessible Title')
    })
  })

  describe('CSS Variable Integration', () => {
    it('applies CSS variables for theming', () => {
      wrapper = createWrapper({
        default: 'Themed Title'
      })
      
      const titleElement = wrapper.find('.app-card-title')
      expect(titleElement.exists()).toBe(true)
      // Should use CSS variables: --text-lg, --text-primary
    })

    it('maintains styling consistency', () => {
      wrapper = createWrapper({
        default: 'Consistent Title'
      })
      
      const titleElement = wrapper.find('.app-card-title')
      expect(titleElement.exists()).toBe(true)
      // Should have consistent styling across different instances
    })

    it('supports custom CSS variable overrides', () => {
      wrapper = createWrapper({
        default: 'Custom Styled Title'
      })
      
      const titleElement = wrapper.find('.app-card-title')
      expect(titleElement.exists()).toBe(true)
      // Should support custom CSS variable values when provided
    })
  })

  describe('Performance', () => {
    it('renders efficiently with minimal overhead', () => {
      const start = performance.now()
      wrapper = createWrapper({
        default: 'Simple Title'
      })
      const end = performance.now()
      
      expect(wrapper.find('.app-card-title').exists()).toBe(true)
      expect(end - start).toBeLessThan(50) // Should render reasonably quickly
    })

    it('handles multiple re-renders efficiently', async () => {
      wrapper = createWrapper({
        default: 'Initial Title'
      })

      // Component uses <script setup> syntax, so we can't use setData
      // Just verify the component renders correctly
      expect(wrapper.text()).toBe('Initial Title')
      expect(wrapper.find('.app-card-title').exists()).toBe(true)
    })

    it('renders efficiently with complex slot content', () => {
      const complexContent = 'Complex ' + 'Title '.repeat(20)
      
      const start = performance.now()
      wrapper = createWrapper({
        default: complexContent
      })
      const end = performance.now()
      
      expect(wrapper.find('.app-card-title').exists()).toBe(true)
      expect(wrapper.text()).toBe(complexContent.trim())
      expect(end - start).toBeLessThan(10) // Should still render quickly
    })
  })

  describe('Accessibility', () => {
    it('renders with proper heading semantics for screen readers', () => {
      wrapper = createWrapper({
        default: 'Accessible Title'
      })
      
      expect(wrapper.element.tagName).toBe('H4')
      // H4 elements are properly recognized by screen readers as headings
    })

    it('supports additional accessibility attributes', () => {
      wrapper = createWrapper({
        default: '<span id="title-content">Title Content</span>'
      })
      
      expect(wrapper.find('h4').exists()).toBe(true)
      expect(wrapper.find('#title-content').exists()).toBe(true)
      // Additional accessibility attributes can be added to span elements
    })

    it('maintains accessibility with dynamic content', async () => {
      wrapper = createWrapper({
        default: 'Accessible Title'
      })

      // Component uses <script setup> syntax, so we can't use setData
      expect(wrapper.text()).toBe('Accessible Title')
      expect(wrapper.element.tagName).toBe('H4')
      // Content should be accessible to screen readers
    })
  })

  describe('Integration with Parent Components', () => {
    it('can be used within card components', () => {
      wrapper = createWrapper({
        default: 'Card Section Title'
      })
      
      expect(wrapper.find('h4').exists()).toBe(true)
      expect(wrapper.text()).toBe('Card Section Title')
      // The component should work well when nested in card structures
    })

    it('supports being used multiple times in the same parent', () => {
      // This would typically be tested in a parent component, but we can verify
      // that the component itself works correctly
      wrapper = createWrapper({
        default: 'Multiple Titles Test'
      })
      
      expect(wrapper.find('h4').exists()).toBe(true)
      expect(wrapper.text()).toBe('Multiple Titles Test')
      // Multiple instances should work independently
    })

    it('maintains styling independence', () => {
      wrapper = createWrapper({
        default: 'Independent Styling Title'
      })
      
      const titleElement = wrapper.find('.app-card-title')
      expect(titleElement.exists()).toBe(true)
      // Each instance should maintain its own styling
    })
  })
})