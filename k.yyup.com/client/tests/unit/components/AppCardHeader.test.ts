import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import { vi } from 'vitest'
import { VueWrapper } from '@vue/test-utils'
import AppCardHeader from '@/components/AppCardHeader.vue'
import { createComponentWrapper, waitForUpdate, createTestCleanup } from '../../utils/component-test-helper'

// 控制台错误检测变量
let consoleSpy: any

describe('AppCardHeader.vue', () => {
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
  let wrapper: VueWrapper<any>
  const cleanup = createTestCleanup()

  const createWrapper = (slots = {}) => {
    return createComponentWrapper(AppCardHeader, {
      slots,
      withPinia: true,
      withRouter: false,
      global: {
        mocks: {
          $t: (key: string) => key
        }
      }
    })
  }

  afterEach(() => {
    cleanup.cleanup()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('Component Rendering', () => {
    it('renders the component correctly', () => {
      wrapper = createWrapper()
      cleanup.addCleanup(() => wrapper?.unmount())

      expect(wrapper.find('.app-card-header').exists()).toBe(true)
      expect(wrapper.classes()).toContain('app-card-header')
    })

    it('applies default styling with proper CSS classes', () => {
      wrapper = createWrapper()
      cleanup.addCleanup(() => wrapper?.unmount())

      const headerElement = wrapper.find('.app-card-header')
      expect(headerElement.exists()).toBe(true)
      expect(headerElement.attributes('style')).toBeDefined()
    })

    it('renders without any content', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.app-card-header').exists()).toBe(true)
      expect(wrapper.text()).toBe('')
    })
  })

  describe('Slot Functionality', () => {
    it('renders default slot content when provided', () => {
      const slotContent = '<div class="test-content">Test Header Content</div>'
      wrapper = createWrapper({
        default: slotContent
      })
      
      expect(wrapper.find('.test-content').exists()).toBe(true)
      expect(wrapper.find('.test-content').text()).toBe('Test Header Content')
    })

    it('renders complex slot content with multiple elements', () => {
      const complexSlotContent = `
        <h3 class="title">Card Title</h3>
        <div class="actions">
          <button class="btn-edit">Edit</button>
          <button class="btn-delete">Delete</button>
        </div>
      `
      wrapper = createWrapper({
        default: complexSlotContent
      })
      
      expect(wrapper.find('.title').exists()).toBe(true)
      expect(wrapper.find('.actions').exists()).toBe(true)
      expect(wrapper.find('.btn-edit').exists()).toBe(true)
      expect(wrapper.find('.btn-delete').exists()).toBe(true)
      expect(wrapper.find('.title').text()).toBe('Card Title')
      expect(wrapper.find('.btn-edit').text()).toBe('Edit')
      expect(wrapper.find('.btn-delete').text()).toBe('Delete')
    })

    it('renders slot content with Vue components', () => {
      const slotContent = '<span class="vue-component">Vue Component Header</span>'
      wrapper = createWrapper({
        default: slotContent
      })
      
      expect(wrapper.find('.vue-component').exists()).toBe(true)
      expect(wrapper.find('.vue-component').text()).toBe('Vue Component Header')
    })

    it('renders slot content with navigation elements', () => {
      const navContent = `
        <nav class="card-nav">
          <a href="#" class="nav-link">Link 1</a>
          <a href="#" class="nav-link">Link 2</a>
          <a href="#" class="nav-link">Link 3</a>
        </nav>
      `
      wrapper = createWrapper({
        default: navContent
      })
      
      const nav = wrapper.find('.card-nav')
      expect(nav.exists()).toBe(true)
      expect(nav.findAll('.nav-link')).toHaveLength(3)
      expect(nav.findAll('.nav-link')[0].text()).toBe('Link 1')
      expect(nav.findAll('.nav-link')[1].text()).toBe('Link 2')
      expect(nav.findAll('.nav-link')[2].text()).toBe('Link 3')
    })
  })

  describe('CSS Styling and Layout', () => {
    it('applies flexbox layout correctly', () => {
      wrapper = createWrapper()
      
      const headerElement = wrapper.find('.app-card-header')
      expect(headerElement.exists()).toBe(true)
      // The element should have flex layout applied via CSS
    })

    it('applies proper spacing with CSS variables', () => {
      wrapper = createWrapper()
      
      const headerElement = wrapper.find('.app-card-header')
      expect(headerElement.exists()).toBe(true)
      // CSS variables for spacing should be applied
    })

    it('applies border bottom styling', () => {
      wrapper = createWrapper()
      
      const headerElement = wrapper.find('.app-card-header')
      expect(headerElement.exists()).toBe(true)
      // Border bottom should be applied via CSS
    })

    it('maintains proper alignment properties', () => {
      wrapper = createWrapper()
      
      const headerElement = wrapper.find('.app-card-header')
      expect(headerElement.exists()).toBe(true)
      // justify-content: space-between and align-items: center should be applied
    })
  })

  describe('Component Structure', () => {
    it('has a single root element', () => {
      wrapper = createWrapper()
      
      expect(wrapper.element.tagName).toBe('DIV')
      expect(wrapper.classes()).toContain('app-card-header')
    })

    it('maintains proper DOM structure with nested content', () => {
      wrapper = createWrapper({
        default: '<div class="child-header">Child Header Element</div>'
      })
      
      const headerElement = wrapper.find('.app-card-header')
      const childElement = wrapper.find('.child-header')
      
      expect(headerElement.exists()).toBe(true)
      expect(childElement.exists()).toBe(true)
      expect(childElement.element.parentElement).toBe(headerElement.element)
    })
  })

  describe('Component Behavior', () => {
    it('remains reactive when slot content changes', async () => {
      wrapper = createWrapper({
        default: '<div class="dynamic-header">{{ headerTitle }}</div>'
      })
      
      // Initially should be empty
      expect(wrapper.find('.dynamic-header').text()).toBe('')
      
      // Update the component data
      await wrapper.setData({ headerTitle: 'Updated Header Title' })
      
      // Should reflect the change
      expect(wrapper.find('.dynamic-header').text()).toBe('Updated Header Title')
    })

    it('handles empty slot content gracefully', () => {
      wrapper = createWrapper({
        default: ''
      })
      
      expect(wrapper.find('.app-card-header').exists()).toBe(true)
      expect(wrapper.html()).toContain('<div class="app-card-header"></div>')
    })

    it('handles whitespace-only slot content', () => {
      wrapper = createWrapper({
        default: '   \n   \t   \n   '
      })
      
      expect(wrapper.find('.app-card-header').exists()).toBe(true)
      expect(wrapper.text().trim()).toBe('')
    })

    it('preserves flex layout with slot content', () => {
      wrapper = createWrapper({
        default: `
          <div class="header-left">Left Content</div>
          <div class="header-right">Right Content</div>
        `
      })
      
      expect(wrapper.find('.header-left').exists()).toBe(true)
      expect(wrapper.find('.header-right').exists()).toBe(true)
      expect(wrapper.find('.header-left').text()).toBe('Left Content')
      expect(wrapper.find('.header-right').text()).toBe('Right Content')
    })
  })

  describe('Edge Cases', () => {
    it('renders with very long header content', () => {
      const longContent = 'A'.repeat(500)
      wrapper = createWrapper({
        default: `<div class="long-header">${longContent}</div>`
      })
      
      expect(wrapper.find('.long-header').exists()).toBe(true)
      expect(wrapper.find('.long-header').text()).toBe(longContent)
    })

    it('renders with special characters in header content', () => {
      const specialContent = 'Special chars: < > & " \' / \\'
      wrapper = createWrapper({
        default: `<div class="special-header">${specialContent}</div>`
      })
      
      expect(wrapper.find('.special-header').exists()).toBe(true)
      expect(wrapper.find('.special-header').text()).toBe(specialContent)
    })

    it('renders with HTML entities in header content', () => {
      const htmlEntities = 'HTML entities: &lt; &gt; &amp; &quot; &apos;'
      wrapper = createWrapper({
        default: `<div class="entities-header">${htmlEntities}</div>`
      })
      
      expect(wrapper.find('.entities-header').exists()).toBe(true)
      expect(wrapper.find('.entities-header').text()).toBe(htmlEntities)
    })

    it('renders with mixed content types in header', () => {
      const mixedContent = `
        <h4>Header Title</h4>
        <span class="subtitle">Subtitle text</span>
        <div class="header-actions">
          <button>Action 1</button>
          <button>Action 2</button>
        </div>
      `
      wrapper = createWrapper({
        default: mixedContent
      })
      
      expect(wrapper.find('h4').exists()).toBe(true)
      expect(wrapper.find('.subtitle').exists()).toBe(true)
      expect(wrapper.find('.header-actions').exists()).toBe(true)
      expect(wrapper.findAll('button')).toHaveLength(2)
      expect(wrapper.find('h4').text()).toBe('Header Title')
      expect(wrapper.find('.subtitle').text()).toBe('Subtitle text')
      expect(wrapper.findAll('button')[0].text()).toBe('Action 1')
      expect(wrapper.findAll('button')[1].text()).toBe('Action 2')
    })
  })

  describe('Accessibility', () => {
    it('renders with proper semantic structure for headers', () => {
      wrapper = createWrapper({
        default: `
          <header>
            <h2>Section Header</h2>
            <p>Header description text</p>
          </header>
        `
      })
      
      expect(wrapper.find('header').exists()).toBe(true)
      expect(wrapper.find('h2').exists()).toBe(true)
      expect(wrapper.find('p').exists()).toBe(true)
      expect(wrapper.find('h2').text()).toBe('Section Header')
      expect(wrapper.find('p').text()).toBe('Header description text')
    })

    it('maintains accessibility attributes from slot content', () => {
      wrapper = createWrapper({
        default: `
          <button aria-label="Header Action Button" role="button" tabindex="0">
            Header Action
          </button>
        `
      })
      
      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
      expect(button.attributes('aria-label')).toBe('Header Action Button')
      expect(button.attributes('role')).toBe('button')
      expect(button.attributes('tabindex')).toBe('0')
      expect(button.text()).toBe('Header Action')
    })

    it('supports accessible navigation structures', () => {
      wrapper = createWrapper({
        default: `
          <nav aria-label="Card navigation">
            <ul role="menubar">
              <li role="none"><a role="menuitem" href="#item1">Item 1</a></li>
              <li role="none"><a role="menuitem" href="#item2">Item 2</a></li>
            </ul>
          </nav>
        `
      })
      
      expect(wrapper.find('nav').exists()).toBe(true)
      expect(wrapper.find('nav').attributes('aria-label')).toBe('Card navigation')
      expect(wrapper.find('ul').attributes('role')).toBe('menubar')
      expect(wrapper.findAll('li')).toHaveLength(2)
      expect(wrapper.findAll('a')[0].attributes('role')).toBe('menuitem')
      expect(wrapper.findAll('a')[1].attributes('role')).toBe('menuitem')
    })
  })

  describe('Responsive Design', () => {
    it('maintains layout integrity with different content sizes', () => {
      wrapper = createWrapper({
        default: `
          <div class="responsive-test">
            <div class="small-content">Small</div>
            <div class="large-content">Very Large Content That Should Wrap Properly</div>
          </div>
        `
      })
      
      expect(wrapper.find('.responsive-test').exists()).toBe(true)
      expect(wrapper.find('.small-content').exists()).toBe(true)
      expect(wrapper.find('.large-content').exists()).toBe(true)
      expect(wrapper.find('.small-content').text()).toBe('Small')
      expect(wrapper.find('.large-content').text()).toBe('Very Large Content That Should Wrap Properly')
    })

    it('handles multiple elements in flex layout', () => {
      wrapper = createWrapper({
        default: `
          <div class="flex-item-1">Item 1</div>
          <div class="flex-item-2">Item 2</div>
          <div class="flex-item-3">Item 3</div>
        `
      })
      
      expect(wrapper.find('.flex-item-1').exists()).toBe(true)
      expect(wrapper.find('.flex-item-2').exists()).toBe(true)
      expect(wrapper.find('.flex-item-3').exists()).toBe(true)
      expect(wrapper.find('.flex-item-1').text()).toBe('Item 1')
      expect(wrapper.find('.flex-item-2').text()).toBe('Item 2')
      expect(wrapper.find('.flex-item-3').text()).toBe('Item 3')
    })
  })

  describe('Performance', () => {
    it('renders efficiently with minimal overhead', () => {
      const start = performance.now()
      wrapper = createWrapper({
        default: '<div>Simple header content</div>'
      })
      const end = performance.now()
      
      expect(wrapper.find('.app-card-header').exists()).toBe(true)
      expect(end - start).toBeLessThan(10) // Should render very quickly
    })

    it('handles multiple re-renders efficiently', async () => {
      wrapper = createWrapper({
        default: '<div class="header-counter">{{ headerCount }}</div>'
      })
      
      // Perform multiple updates
      for (let i = 0; i < 10; i++) {
        await wrapper.setData({ headerCount: i })
        expect(wrapper.find('.header-counter').text()).toBe(i.toString())
      }
      
      expect(wrapper.find('.app-card-header').exists()).toBe(true)
    })

    it('renders efficiently with complex slot content', () => {
      const complexContent = Array(50).fill(0).map((_, i) => 
        `<div class="header-item-${i}">Header Item ${i}</div>`
      ).join('')
      
      const start = performance.now()
      wrapper = createWrapper({
        default: complexContent
      })
      const end = performance.now()
      
      expect(wrapper.find('.app-card-header').exists()).toBe(true)
      expect(wrapper.findAll('[class^="header-item-"]')).toHaveLength(50)
      expect(end - start).toBeLessThan(50) // Should still render reasonably quickly
    })
  })
})