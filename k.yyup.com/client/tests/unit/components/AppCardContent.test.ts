import { describe, it, expect } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory, Router } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import AppCardContent from '@/components/AppCardContent.vue'

// 控制台错误检测变量
let consoleSpy: any

describe('AppCardContent.vue', () => {
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
  let wrapper: any

  beforeEach(() => {
    // Setup Pinia
    const pinia = createPinia()
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
    return mount(AppCardContent, {
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
    it('renders the component correctly', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.app-card-content').exists()).toBe(true)
      expect(wrapper.classes()).toContain('app-card-content')
    })

    it('applies default styling', () => {
      wrapper = createWrapper()
      
      const contentElement = wrapper.find('.app-card-content')
      expect(contentElement.attributes('style')).toBeDefined()
    })

    it('renders without any content', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.app-card-content').exists()).toBe(true)
      expect(wrapper.text()).toBe('')
    })
  })

  describe('Slot Functionality', () => {
    it('renders default slot content when provided', () => {
      const slotContent = '<div class="test-content">Test Content</div>'
      wrapper = createWrapper({
        default: slotContent
      })
      
      expect(wrapper.find('.test-content').exists()).toBe(true)
      expect(wrapper.find('.test-content').text()).toBe('Test Content')
    })

    it('renders complex slot content with multiple elements', () => {
      const complexSlotContent = `
        <div class="header">Header Content</div>
        <div class="body">Body Content</div>
        <div class="footer">Footer Content</div>
      `
      wrapper = createWrapper({
        default: complexSlotContent
      })
      
      expect(wrapper.find('.header').exists()).toBe(true)
      expect(wrapper.find('.body').exists()).toBe(true)
      expect(wrapper.find('.footer').exists()).toBe(true)
      expect(wrapper.find('.header').text()).toBe('Header Content')
      expect(wrapper.find('.body').text()).toBe('Body Content')
      expect(wrapper.find('.footer').text()).toBe('Footer Content')
    })

    it('renders slot content with Vue components', () => {
      const slotContent = '<span class="vue-component">Vue Component Content</span>'
      wrapper = createWrapper({
        default: slotContent
      })
      
      expect(wrapper.find('.vue-component').exists()).toBe(true)
      expect(wrapper.find('.vue-component').text()).toBe('Vue Component Content')
    })

    it('renders slot content with HTML structure', () => {
      const htmlContent = `
        <ul class="list">
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
        </ul>
      `
      wrapper = createWrapper({
        default: htmlContent
      })
      
      const list = wrapper.find('.list')
      expect(list.exists()).toBe(true)
      expect(list.findAll('li')).toHaveLength(3)
      expect(list.findAll('li')[0].text()).toBe('Item 1')
      expect(list.findAll('li')[1].text()).toBe('Item 2')
      expect(list.findAll('li')[2].text()).toBe('Item 3')
    })
  })

  describe('Component Structure', () => {
    it('has a single root element', () => {
      wrapper = createWrapper()
      
      expect(wrapper.element.tagName).toBe('DIV')
      expect(wrapper.classes()).toContain('app-card-content')
    })

    it('maintains proper DOM structure', () => {
      wrapper = createWrapper({
        default: '<div class="child">Child Element</div>'
      })
      
      const contentElement = wrapper.find('.app-card-content')
      const childElement = wrapper.find('.child')
      
      expect(contentElement.exists()).toBe(true)
      expect(childElement.exists()).toBe(true)
      expect(childElement.element.parentElement).toBe(contentElement.element)
    })
  })

  describe('Styling and CSS', () => {
    it('applies CSS padding from scoped styles', () => {
      wrapper = createWrapper()
      
      const contentElement = wrapper.find('.app-card-content')
      expect(contentElement.attributes('style')).toBeDefined()
    })

    it('maintains scoped styling isolation', () => {
      wrapper = createWrapper({
        default: '<div class="app-card-content">Nested Content</div>'
      })
      
      // The outer component should have the class
      expect(wrapper.find('.app-card-content').exists()).toBe(true)
      
      // Check that the component renders correctly with nested content
      expect(wrapper.text()).toBe('Nested Content')
    })
  })

  describe('Component Behavior', () => {
    it('remains reactive when slot content changes', async () => {
      wrapper = createWrapper({
        default: '<div class="dynamic">{{ message }}</div>'
      })
      
      // Initially should be empty
      expect(wrapper.find('.dynamic').text()).toBe('')
      
      // Update the component data
      await wrapper.setData({ message: 'Updated Message' })
      
      // Should reflect the change
      expect(wrapper.find('.dynamic').text()).toBe('Updated Message')
    })

    it('handles empty slot content gracefully', () => {
      wrapper = createWrapper({
        default: ''
      })
      
      expect(wrapper.find('.app-card-content').exists()).toBe(true)
      expect(wrapper.html()).toContain('<div class="app-card-content"></div>')
    })

    it('handles whitespace-only slot content', () => {
      wrapper = createWrapper({
        default: '   \n   \t   \n   '
      })
      
      expect(wrapper.find('.app-card-content').exists()).toBe(true)
      expect(wrapper.text().trim()).toBe('')
    })
  })

  describe('Edge Cases', () => {
    it('renders with very long content', () => {
      const longContent = 'A'.repeat(1000)
      wrapper = createWrapper({
        default: `<div class="long-content">${longContent}</div>`
      })
      
      expect(wrapper.find('.long-content').exists()).toBe(true)
      expect(wrapper.find('.long-content').text()).toBe(longContent)
    })

    it('renders with special characters in slot content', () => {
      const specialContent = 'Special chars: < > & " \' / \\'
      wrapper = createWrapper({
        default: `<div class="special">${specialContent}</div>`
      })
      
      expect(wrapper.find('.special').exists()).toBe(true)
      expect(wrapper.find('.special').text()).toBe(specialContent)
    })

    it('renders with HTML entities in slot content', () => {
      const htmlEntities = 'HTML entities: &lt; &gt; &amp; &quot; &apos;'
      wrapper = createWrapper({
        default: `<div class="entities">${htmlEntities}</div>`
      })
      
      expect(wrapper.find('.entities').exists()).toBe(true)
      expect(wrapper.find('.entities').text()).toBe(htmlEntities)
    })

    it('renders with mixed content types', () => {
      const mixedContent = `
        <h3>Title</h3>
        <p>Paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
        <ul>
          <li>List item 1</li>
          <li>List item 2</li>
        </ul>
        <div>Plain text content</div>
      `
      wrapper = createWrapper({
        default: mixedContent
      })
      
      expect(wrapper.find('h3').exists()).toBe(true)
      expect(wrapper.find('p').exists()).toBe(true)
      expect(wrapper.find('strong').exists()).toBe(true)
      expect(wrapper.find('em').exists()).toBe(true)
      expect(wrapper.find('ul').exists()).toBe(true)
      expect(wrapper.findAll('li')).toHaveLength(2)
      expect(wrapper.find('h3').text()).toBe('Title')
      expect(wrapper.find('p').text()).toContain('Paragraph with bold and italic text')
      expect(wrapper.findAll('li')[0].text()).toBe('List item 1')
      expect(wrapper.findAll('li')[1].text()).toBe('List item 2')
    })
  })

  describe('Accessibility', () => {
    it('renders with proper semantic structure', () => {
      wrapper = createWrapper({
        default: `
          <article>
            <h2>Article Title</h2>
            <p>Article content goes here.</p>
          </article>
        `
      })
      
      expect(wrapper.find('article').exists()).toBe(true)
      expect(wrapper.find('h2').exists()).toBe(true)
      expect(wrapper.find('p').exists()).toBe(true)
    })

    it('maintains accessibility attributes from slot content', () => {
      wrapper = createWrapper({
        default: `
          <button aria-label="Test Button" role="button">
            Click me
          </button>
        `
      })
      
      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
      expect(button.attributes('aria-label')).toBe('Test Button')
      expect(button.attributes('role')).toBe('button')
      expect(button.text()).toBe('Click me')
    })
  })

  describe('Performance', () => {
    it('renders efficiently with minimal overhead', () => {
      const start = performance.now()
      wrapper = createWrapper({
        default: '<div>Simple content</div>'
      })
      const end = performance.now()
      
      expect(wrapper.find('.app-card-content').exists()).toBe(true)
      expect(end - start).toBeLessThan(10) // Should render very quickly
    })

    it('handles multiple re-renders efficiently', async () => {
      wrapper = createWrapper({
        default: '<div class="counter">{{ count }}</div>'
      })
      
      // Perform multiple updates
      for (let i = 0; i < 10; i++) {
        await wrapper.setData({ count: i })
        expect(wrapper.find('.counter').text()).toBe(i.toString())
      }
      
      expect(wrapper.find('.app-card-content').exists()).toBe(true)
    })
  })
})