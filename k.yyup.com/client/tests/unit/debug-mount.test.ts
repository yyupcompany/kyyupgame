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

describe, it, expect, beforeEach } from 'vitest'
import { mount, config } from '@vue/test-utils'
import { defineComponent, createApp, h } from 'vue'
import { createPinia } from 'pinia'

// 简单的测试组件 - 使用渲染函数
const SimpleComponent = defineComponent({
  name: 'SimpleComponent',
  render() {
    return h('div', { class: 'simple-component' }, [
      h('h1', 'Hello World'),
      h('p', 'This is a test')
    ])
  }
})

// 更复杂的组件测试 - 使用渲染函数
const ComplexComponent = defineComponent({
  name: 'ComplexComponent',
  props: {
    title: String,
    count: Number
  },
  data() {
    return {
      localCount: this.count || 0
    }
  },
  methods: {
    increment() {
      this.localCount++
      this.$emit('update:count', this.localCount)
    }
  },
  render() {
    return h('div', { class: 'complex-component' }, [
      h('h2', this.title),
      h('p', `Count: ${this.count}`),
      h('button', { onClick: this.increment }, 'Increment')
    ])
  }
})

describe('Debug Mount Test', () => {
  beforeEach(() => {
    // 确保每个测试都有干净的配置
    config.global.plugins = [createPinia()]
  })

  it('should mount a simple component', () => {
    console.log('🧪 Testing simple component mount...')

    const wrapper = mount(SimpleComponent)

    console.log('Wrapper exists:', wrapper.exists())
    console.log('Wrapper HTML:', wrapper.html())
    console.log('Find .simple-component:', wrapper.find('.simple-component').exists())
    console.log('Find h1:', wrapper.find('h1').exists())

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.simple-component').exists()).toBe(true)
    expect(wrapper.find('h1').text()).toBe('Hello World')
  })

  it('should mount a complex component with props', () => {
    console.log('🧪 Testing complex component mount...')

    const wrapper = mount(ComplexComponent, {
      props: {
        title: 'Test Title',
        count: 5
      }
    })

    console.log('Complex wrapper exists:', wrapper.exists())
    console.log('Complex wrapper HTML:', wrapper.html())
    console.log('Find .complex-component:', wrapper.find('.complex-component').exists())
    console.log('Find h2:', wrapper.find('h2').exists())
    console.log('Find button:', wrapper.find('button').exists())

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.complex-component').exists()).toBe(true)
    expect(wrapper.find('h2').text()).toBe('Test Title')
    expect(wrapper.find('p').text()).toBe('Count: 5')
  })

  it('should handle component interactions', async () => {
    console.log('🧪 Testing component interactions...')

    const wrapper = mount(ComplexComponent, {
      props: {
        title: 'Interactive Test',
        count: 0
      }
    })

    const button = wrapper.find('button')
    console.log('Button exists:', button.exists())

    if (button.exists()) {
      await button.trigger('click')
      console.log('After click - HTML:', wrapper.html())

      // 检查事件是否被触发
      expect(wrapper.emitted('update:count')).toBeTruthy()
    }
  })
})
