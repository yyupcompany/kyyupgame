import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
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

describe('AppCard.vue - 边界值和错误场景完整测试', () => {
  let router: any
  let pinia: any
  let wrapper: any

  beforeEach(() => {
    // 开始控制台错误监控
    startConsoleMonitoring()

    // 清除之前的路由实例
    if (router) => {
      router = null
    }
    pinia = null

    // Setup Router with memory history to avoid security errors
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div></div>' } }
      ]
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    vi.clearAllMocks()
  })

  afterEach(() => {
    // 清理wrapper
    if (wrapper) => {
      wrapper.unmount()
      wrapper = null
    }

    // 验证没有意外的控制台错误（忽略预期的Vue警告）
    try {
      expectNoConsoleErrors()
    } catch (error) {
      // 允许Vue Router和Pinia的预期警告
      const consoleMonitor = require('../../setup/console-monitoring').getConsoleMonitor()
      const errors = consoleMonitor.getErrorMessages()
      const hasOnlyExpectedWarnings = errors.every(error =>
        error.includes('Vue Router warn') ||
        error.includes('App already provides property') ||
        error.includes('UnifiedIcon')
      )

      if (!hasOnlyExpectedWarnings) {
        throw error
      }
    }

    stopConsoleMonitoring()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  const createWrapper = (props = {}, slots = {}) => {
    // 为每个wrapper创建新的Pinia实例
    const freshPinia = createPinia()

    return mount(AppCard, {
      props,
      slots,
      global: {
        plugins: [router, freshPinia],
        mocks: {
          $t: (key: string) => key
        },
        stubs: {
          'unified-icon': true,
          'lucide-icon': true
        }
      }
    })
  }

  describe('基本控制台错误检测', () => {
    it('应该能够正常渲染基本组件而不产生控制台错误', () => {
      wrapper = createWrapper({
        title: 'Test Card',
        subtitle: 'Test Subtitle'
      })

      expect(wrapper.find('.app-card').exists()).toBe(true)
      expect(wrapper.find('.card-title').exists()).toBe(true)
      expect(wrapper.find('.card-subtitle').exists()).toBe(true)
      expect(wrapper.find('.card-title').text()).toBe('Test Card')
      expect(wrapper.find('.card-subtitle').text()).toBe('Test Subtitle')
    })

    it('应该处理空props而不产生控制台错误', () => {
      wrapper = createWrapper({})

      expect(wrapper.find('.app-card').exists()).toBe(true)
      expect(wrapper.find('.app-card-header').exists()).toBe(false)
    })

    it('应该处理slot内容而不产生控制台错误', () => {
      wrapper = createWrapper({}, {
        default: '<div class="test-content">Test Content</div>',
        footer: '<div class="test-footer">Footer</div>'
      })

      expect(wrapper.find('.app-card').exists()).toBe(true)
      expect(wrapper.find('.test-content').exists()).toBe(true)
      expect(wrapper.find('.test-footer').exists()).toBe(true)
      expect(wrapper.find('.test-content').text()).toBe('Test Content')
      expect(wrapper.find('.test-footer').text()).toBe('Footer')
    })
  })

  describe('字符串边界测试', () => {
    it('应该处理空字符串title', () => {
      wrapper = createWrapper({ title: '' })

      expect(wrapper.find('.app-card').exists()).toBe(true)
      expect(wrapper.find('.app-card-header').exists()).toBe(false)
    })

    it('应该处理只包含空格的title', () => {
      wrapper = createWrapper({ title: '   ' })

      expect(wrapper.find('.app-card').exists()).toBe(true)
      expect(wrapper.find('.app-card-header').exists()).toBe(true)
      expect(wrapper.find('h3').text()).toBe('   ')
    })

    it('应该处理超长title', () => {
      const longTitle = 'A'.repeat(10000)
      wrapper = createWrapper({ title: longTitle })

      expect(wrapper.find('.app-card').exists()).toBe(true)
      expect(wrapper.find('h3').text()).toBe(longTitle)
    })

    it('应该处理包含特殊字符的title', () => {
      const specialTitle = '<script>alert("xss")</script>&"\'\\/'
      wrapper = createWrapper({ title: specialTitle })

      expect(wrapper.find('.app-card').exists()).toBe(true)
      expect(wrapper.find('h3').text()).toBe(specialTitle)
    })

    it('应该处理包含Unicode字符的title', () => {
      const unicodeTitle = '🎉测试卡片标题🚀 emojis and 中文'
      wrapper = createWrapper({ title: unicodeTitle })

      expect(wrapper.find('.app-card').exists()).toBe(true)
      expect(wrapper.find('h3').text()).toBe(unicodeTitle)
    })

    it('应该处理HTML实体', () => {
      const htmlTitle = '&lt;
import { vi } from 'vitest'script&gt;alert("xss")&lt;/script&gt;'
      wrapper = createWrapper({ title: htmlTitle })

      expect(wrapper.find('.app-card').exists()).toBe(true)
      expect(wrapper.find('h3').text()).toBe(htmlTitle)
    })

    it('应该处理null和undefined title', () => {
      wrapper = createWrapper({ title: null })

      expect(wrapper.find('.app-card').exists()).toBe(true)
      expect(wrapper.find('.app-card-header').exists()).toBe(false)

      wrapper = createWrapper({ title: undefined })
      expect(wrapper.find('.app-card-header').exists()).toBe(false)
    })
  })

  describe('数组边界测试', () => {
    it('应该处理空数组作为slots内容', () => {
      wrapper = createWrapper({}, {
        default: []
      })

      expect(wrapper.find('.app-card').exists()).toBe(true)
      expect(wrapper.find('.app-card-body').exists()).toBe(true)
    })

    it('应该处理超大数组模拟的大量slot内容', () => {
      const largeContent = Array(10000).fill(0).map((_, i) =>
        `<div class="item-${i}">Item ${i}</div>`
      ).join('')

      wrapper = createWrapper({}, {
        default: largeContent
      })

      expect(wrapper.find('.app-card').exists()).toBe(true)
      expect(wrapper.findAll('[class^="item-"]')).toHaveLength(10000)
    })

    it('应该处理嵌套数组结构', () => {
      const nestedContent = `
        <div class="nested">
          ${Array(100).fill(0).map((_, i) =>
            `<div class="level-1">
              ${Array(10).fill(0).map((_, j) =>
                `<div class="level-2">Item ${i}-${j}</div>`
              ).join('')}
            </div>`
          ).join('')}
        </div>
      `

      wrapper = createWrapper({}, {
        default: nestedContent
      })

      expect(wrapper.find('.app-card').exists()).toBe(true)
      expect(wrapper.find('.nested').exists()).toBe(true)
      expect(wrapper.findAll('.level-1')).toHaveLength(100)
      expect(wrapper.findAll('.level-2')).toHaveLength(1000)
    })
  })

  describe('对象边界测试', () => {
    it('应该处理复杂的props对象', () => {
      const complexProps = {
        title: 'Complex Card',
        subtitle: 'With complex props',
        iconName: 'complex-icon',
        iconSize: 24,
        iconColor: 'rgba(255, 0, 0, 0.5)',
        iconVariant: 'filled',
        hoverable: true,
        shadow: 'lg',
        padding: 'md'
      }

      wrapper = createWrapper(complexProps)

      expect(wrapper.find('.app-card').exists()).toBe(true)
      expect(wrapper.find('.card-title').text()).toBe('Complex Card')
      expect(wrapper.find('.card-subtitle').text()).toBe('With complex props')
      expect(wrapper.find('.mock-lucide-icon').exists()).toBe(true)
      expect(wrapper.classes()).toContain('app-card--hoverable')
    })

    it('应该处理循环引用对象（如果可能）', () => {
      const circularObj: any = { name: 'circular' }
      circularObj.self = circularObj

      // 这种情况在实际使用中很少见，但组件应该能够处理
      expect(() => {
        wrapper = createWrapper({ title: 'Test' })
        wrapper.vm.$props = circularObj
      }).not.toThrow()
    })
  })

  describe('性能边界测试', () => {
    it('应该处理大量快速prop更新', async () => {
      wrapper = createWrapper({ title: 'Initial' })

      const startTime = performance.now()

      for (let i = 0; i < 1000; i++) {
        await wrapper.setProps({ title: `Update ${i}` })
        if (i % 100 === 0) {
          await wrapper.vm.$nextTick()
        }
      }

      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(5000) // 应该在5秒内完成
      expect(wrapper.find('h3').text()).toBe('Update 999')
    })

    it('应该处理复杂slot内容的性能', () => {
      const complexContent = Array(1000).fill(0).map((_, i) =>
        `<div class="complex-item-${i}">
          <h5>Item ${i}</h5>
          <p>Description for item ${i} with some content</p>
          <ul>
            ${Array(10).fill(0).map((_, j) =>
              `<li>Sub-item ${i}-${j}</li>`
            ).join('')}
          </ul>
        </div>`
      ).join('')

      const startTime = performance.now()
      wrapper = createWrapper({ title: 'Performance Test' }, {
        default: complexContent
      })
      const endTime = performance.now()

      const duration = endTime - startTime
      expect(duration).toBeLessThan(1000) // 应该在1秒内渲染完成
      expect(wrapper.findAll('[class^="complex-item-"]')).toHaveLength(1000)
    })
  })

  describe('内存边界测试', () => {
    it('应该处理大量内存使用的情况', () => {
      const largeData = Array(10000).fill(0).map((_, i) =>
        `Large data chunk ${i} ${'x'.repeat(100)}`
      ).join('\n')

      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0

      wrapper = createWrapper({ title: 'Memory Test' }, {
        default: `<div class="large-data">${largeData}</div>`
      })

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0
      const memoryIncrease = finalMemory - initialMemory

      // 内存增长应该是合理的（小于50MB）
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)
      expect(wrapper.find('.large-data').exists()).toBe(true)
      expect(wrapper.find('.large-data').text().length).toBeGreaterThan(1000000)
    })
  })

  describe('事件边界测试', () => {
    it('应该处理大量快速事件触发', async () => {
      wrapper = createWrapper({
        title: 'Event Test',
        hoverable: true
      })

      const card = wrapper.find('.app-card')

      // 快速触发大量鼠标事件
      for (let i = 0; i < 1000; i++) {
        await card.trigger('mouseenter')
        await card.trigger('mouseleave')
      }

      expect(wrapper.find('.app-card').exists()).toBe(true)
    })

    it('应该处理异常事件数据', async () => {
      wrapper = createWrapper({ title: 'Event Test' })

      const card = wrapper.find('.app-card')

      // 传递异常的事件数据
      await card.trigger('click', {
        clientX: NaN,
        clientY: Infinity,
        button: -1,
        altKey: null,
        ctrlKey: undefined
      })

      expect(wrapper.find('.app-card').exists()).toBe(true)
    })
  })

  describe('DOM边界测试', () => {
    it('应该处理深度嵌套的DOM结构', () => {
      let nestedHTML = '<div class="root">'
      for (let i = 0; i < 100; i++) {
        nestedHTML += `<div class="level-${i}">`
      }
      nestedHTML += 'Deeply nested content'
      for (let i = 99; i >= 0; i--) {
        nestedHTML += '</div>'
      }
      nestedHTML += '</div>'

      wrapper = createWrapper({}, {
        default: nestedHTML
      })

      expect(wrapper.find('.root').exists()).toBe(true)
      expect(wrapper.find('[class="level-99"]').exists()).toBe(true)
    })

    it('应该处理大量DOM元素', () => {
      const manyElements = Array(5000).fill(0).map((_, i) =>
        `<div class="element-${i}" data-id="${i}">Element ${i}</div>`
      ).join('')

      wrapper = createWrapper({ title: 'Many Elements' }, {
        default: manyElements
      })

      expect(wrapper.findAll('[class^="element-"]')).toHaveLength(5000)
    })

    it('应该处理很长的class名称', () => {
      const longClassName = 'a'.repeat(1000)
      wrapper = createWrapper({}, {
        default: `<div class="${longClassName}">Long class name</div>`
      })

      expect(wrapper.find(`.${longClassName}`).exists()).toBe(true)
    })

    it('应该处理很长的id属性', () => {
      const longId = 'b'.repeat(1000)
      wrapper = createWrapper({}, {
        default: `<div id="${longId}">Long id</div>`
      })

      expect(wrapper.find(`#${longId}`).exists()).toBe(true)
    })
  })

  describe('错误恢复测试', () => {
    it('应该在slot渲染错误后继续正常工作', async () => {
      // 创建一个会导致错误的slot内容
      const errorSlot = {
        render: () => {
          throw new Error('Intentional slot rendering error')
        }
      }

      // 组件应该能够处理slot错误
      expect(() => {
        wrapper = createWrapper({ title: 'Error Recovery Test' }, {
          default: errorSlot
        })
      }).not.toThrow()

      // 即使slot出错，基本结构应该仍然存在
      expect(wrapper.find('.app-card').exists()).toBe(true)
    })

    it('应该在props更新错误后继续正常工作', async () => {
      wrapper = createWrapper({ title: 'Initial Title' })

      // 尝试设置会导致问题的props
      try {
        await wrapper.setProps({
          title: null,
          iconSize: undefined,
          hoverable: 'invalid-value' as any
        })
      } catch (error) {
        // 预期可能会有错误，但组件应该能够恢复
      }

      // 组件应该仍然可用
      expect(wrapper.find('.app-card').exists()).toBe(true)
    })
  })

  describe('并发边界测试', () => {
    it('应该处理并发prop更新', async () => {
      wrapper = createWrapper({ title: 'Concurrent Test' })

      // 并发更新多个props
      const promises = Array(100).fill(0).map((_, i) =>
        wrapper.setProps({
          title: `Concurrent ${i}`,
          iconSize: i,
          hoverable: i % 2 === 0
        })
      )

      await Promise.all(promises)

      expect(wrapper.find('.app-card').exists()).toBe(true)
    })

    it('应该处理并发slot内容更新', async () => {
      wrapper = createWrapper({ title: 'Slot Concurrent Test' })

      const slotPromises = Array(50).fill(0).map((_, i) =>
        wrapper.setProps({
          title: `Slot Update ${i}`
        })
      )

      await Promise.all(slotPromises)

      expect(wrapper.find('.app-card').exists()).toBe(true)
    })
  })

  describe('网络边界测试', () => {
    it('应该处理图片加载失败的情况', () => {
      const contentWithBrokenImages = Array(10).fill(0).map((_, i) =>
        `<img src="broken-image-${i}.jpg" alt="Broken image ${i}" onerror="console.error('Image load failed')">`
      ).join('')

      wrapper = createWrapper({ title: 'Image Error Test' }, {
        default: contentWithBrokenImages
      })

      expect(wrapper.find('.app-card').exists()).toBe(true)
      expect(wrapper.findAll('img')).toHaveLength(10)
    })
  })

  describe('时间边界测试', () => {
    it('应该处理长时间运行的渲染', async () => {
      const complexContent = Array(1000).fill(0).map((_, i) =>
        `<div class="time-test-${i}">
          ${Array(100).fill(0).map((_, j) =>
            `<span class="item">Item ${i}-${j}</span>`
          ).join('')}
        </div>`
      ).join('')

      const startTime = performance.now()

      wrapper = createWrapper({ title: 'Time Boundary Test' }, {
        default: complexContent
      })

      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(3000) // 应该在3秒内完成
      expect(wrapper.findAll('[class^="time-test-"]')).toHaveLength(1000)
    })
  })
})