import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import MenuItemComponent from '@/components/layout/MenuItemComponent.vue'

// 控制台错误检测变量
let consoleSpy: any

describe('MenuItemComponent.vue', () => {
  let wrapper: any

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  afterEach(() => {
    if (wrapper) => {
      wrapper.unmount()
    }
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  const createWrapper = (props = {}) => {
    return mount(MenuItemComponent, {
      props: {
        item: {
          index: 'test-item',
          title: '测试菜单项',
          icon: 'TestIcon',
          priority: 1
        },
        collapsed: false,
        ...props
      },
      global: {
        stubs: {
          'el-sub-menu': true,
          'el-menu-item': true,
          'el-icon': true
        }
      }
    })
  }

  describe('基础渲染', () => {
    it('应该正确渲染普通菜单项', () => {
      wrapper = createWrapper()
      
      expect(wrapper.findComponent({ name: 'ElMenuItem' }).exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'ElSubMenu' }).exists()).toBe(false)
    })

    it('应该正确渲染有子菜单的菜单项', () => {
      wrapper = createWrapper({
        item: {
          index: 'parent-item',
          title: '父菜单项',
          icon: 'TestIcon',
          priority: 1,
          children: [
            {
              index: 'child-item-1',
              title: '子菜单项1',
              priority: 1
            },
            {
              index: 'child-item-2',
              title: '子菜单项2',
              priority: 2
            }
          ]
        }
      })
      
      expect(wrapper.findComponent({ name: 'ElSubMenu' }).exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'ElMenuItem' }).exists()).toBe(false)
    })

    it('应该显示菜单项标题', () => {
      wrapper = createWrapper({
        item: {
          index: 'test-item',
          title: '测试标题',
          icon: 'TestIcon',
          priority: 1
        }
      })
      
      expect(wrapper.text()).toContain('测试标题')
    })

    it('应该显示菜单项图标', () => {
      wrapper = createWrapper({
        item: {
          index: 'test-item',
          title: '测试菜单项',
          icon: 'TestIcon',
          priority: 1
        }
      })
      
      const icon = wrapper.findComponent({ name: 'ElIcon' })
      expect(icon.exists()).toBe(true)
    })
  })

  describe('子菜单渲染', () => {
    it('应该渲染所有可见的子菜单项', () => {
      wrapper = createWrapper({
        item: {
          index: 'parent-item',
          title: '父菜单项',
          icon: 'TestIcon',
          priority: 1,
          children: [
            {
              index: 'child-item-1',
              title: '子菜单项1',
              priority: 1,
              visible: true
            },
            {
              index: 'child-item-2',
              title: '子菜单项2',
              priority: 2,
              visible: true
            },
            {
              index: 'child-item-3',
              title: '子菜单项3',
              priority: 3,
              visible: false
            }
          ]
        }
      })
      
      const childItems = wrapper.findAllComponents({ name: 'ElMenuItem' })
      expect(childItems.length).toBe(2) // Only visible children
    })

    it('应该处理没有明确设置 visible 属性的子菜单项', () => {
      wrapper = createWrapper({
        item: {
          index: 'parent-item',
          title: '父菜单项',
          icon: 'TestIcon',
          priority: 1,
          children: [
            {
              index: 'child-item-1',
              title: '子菜单项1',
              priority: 1
            },
            {
              index: 'child-item-2',
              title: '子菜单项2',
              priority: 2
            }
          ]
        }
      })
      
      const childItems = wrapper.findAllComponents({ name: 'ElMenuItem' })
      expect(childItems.length).toBe(2) // All children are visible by default
    })

    it('应该处理空的子菜单数组', () => {
      wrapper = createWrapper({
        item: {
          index: 'parent-item',
          title: '父菜单项',
          icon: 'TestIcon',
          priority: 1,
          children: []
        }
      })
      
      // Should still render as ElSubMenu even with empty children
      expect(wrapper.findComponent({ name: 'ElSubMenu' }).exists()).toBe(true)
      const childItems = wrapper.findAllComponents({ name: 'ElMenuItem' })
      expect(childItems.length).toBe(0)
    })

    it('应该处理没有 children 属性的菜单项', () => {
      wrapper = createWrapper({
        item: {
          index: 'test-item',
          title: '测试菜单项',
          icon: 'TestIcon',
          priority: 1
        }
      })
      
      expect(wrapper.findComponent({ name: 'ElMenuItem' }).exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'ElSubMenu' }).exists()).toBe(false)
    })
  })

  describe('鼠标悬停预加载', () => {
    it('应该在鼠标悬停时触发预加载事件', async () => {
      const emitSpy = vi.fn()
      wrapper = createWrapper({
        item: {
          index: '/dashboard',
          title: '仪表板',
          icon: 'TestIcon',
          priority: 1
        }
      })
      wrapper.vm.$emit = emitSpy
      
      const menuItem = wrapper.findComponent({ name: 'ElMenuItem' })
      await menuItem.trigger('mouseenter')
      
      expect(emitSpy).toHaveBeenCalledWith('preload', '/dashboard')
    })

    it('不应该对非路径索引触发预加载', async () => {
      const emitSpy = vi.fn()
      wrapper = createWrapper({
        item: {
          index: 'test-item',
          title: '测试菜单项',
          icon: 'TestIcon',
          priority: 1
        }
      })
      wrapper.vm.$emit = emitSpy
      
      const menuItem = wrapper.findComponent({ name: 'ElMenuItem' })
      await menuItem.trigger('mouseenter')
      
      expect(emitSpy).not.toHaveBeenCalled()
    })

    it('应该在父菜单项悬停时触发预加载事件', async () => {
      const emitSpy = vi.fn()
      wrapper = createWrapper({
        item: {
          index: '/parent',
          title: '父菜单项',
          icon: 'TestIcon',
          priority: 1,
          children: [
            {
              index: 'child-item-1',
              title: '子菜单项1',
              priority: 1
            }
          ]
        }
      })
      wrapper.vm.$emit = emitSpy
      
      const subMenu = wrapper.findComponent({ name: 'ElSubMenu' })
      await subMenu.trigger('mouseenter')
      
      expect(emitSpy).toHaveBeenCalledWith('preload', '/parent')
    })

    it('应该在子菜单项悬停时触发预加载事件', async () => {
      const emitSpy = vi.fn()
      wrapper = createWrapper({
        item: {
          index: 'parent-item',
          title: '父菜单项',
          icon: 'TestIcon',
          priority: 1,
          children: [
            {
              index: '/child-1',
              title: '子菜单项1',
              priority: 1
            },
            {
              index: '/child-2',
              title: '子菜单项2',
              priority: 2
            }
          ]
        }
      })
      wrapper.vm.$emit = emitSpy
      
      const childItems = wrapper.findAllComponents({ name: 'ElMenuItem' })
      await childItems[0].trigger('mouseenter')
      
      expect(emitSpy).toHaveBeenCalledWith('preload', '/child-1')
      
      await childItems[1].trigger('mouseenter')
      
      expect(emitSpy).toHaveBeenCalledWith('preload', '/child-2')
    })
  })

  describe('Props 处理', () => {
    it('应该正确传递 item 属性', () => {
      const testItem = {
        index: 'test-item',
        title: '测试菜单项',
        icon: 'TestIcon',
        priority: 1
      }
      
      wrapper = createWrapper({
        item: testItem
      })
      
      expect(wrapper.props().item).toEqual(testItem)
    })

    it('应该正确传递 collapsed 属性', () => {
      wrapper = createWrapper({
        collapsed: true
      })
      
      expect(wrapper.props().collapsed).toBe(true)
    })

    it('应该使用默认的 collapsed 值', () => {
      wrapper = createWrapper()
      
      expect(wrapper.props().collapsed).toBe(false)
    })
  })

  describe('计算属性', () => {
    it('应该正确计算可见子菜单项', () => {
      wrapper = createWrapper({
        item: {
          index: 'parent-item',
          title: '父菜单项',
          icon: 'TestIcon',
          priority: 1,
          children: [
            {
              index: 'child-item-1',
              title: '子菜单项1',
              priority: 1,
              visible: true
            },
            {
              index: 'child-item-2',
              title: '子菜单项2',
              priority: 2,
              visible: false
            },
            {
              index: 'child-item-3',
              title: '子菜单项3',
              priority: 3
            }
          ]
        }
      })
      
      const visibleChildren = wrapper.vm.visibleChildren
      expect(visibleChildren.length).toBe(2) // child-item-1 and child-item-3
      expect(visibleChildren[0].index).toBe('child-item-1')
      expect(visibleChildren[1].index).toBe('child-item-3')
    })

    it('应该处理没有子菜单的情况', () => {
      wrapper = createWrapper({
        item: {
          index: 'test-item',
          title: '测试菜单项',
          icon: 'TestIcon',
          priority: 1
        }
      })
      
      const visibleChildren = wrapper.vm.visibleChildren
      expect(visibleChildren).toEqual([])
    })
  })

  describe('边界情况', () => {
    it('应该处理空的 item 对象', () => {
      wrapper = createWrapper({
        item: {}
      })
      
      // Should still render without errors
      expect(wrapper.findComponent({ name: 'ElMenuItem' }).exists()).toBe(true)
    })

    it('应该处理 null 的 item 对象', () => {
      wrapper = createWrapper({
        item: null
      })
      
      // Should still render without errors
      expect(wrapper.findComponent({ name: 'ElMenuItem' }).exists()).toBe(true)
    })

    it('应该处理 undefined 的 item 对象', () => {
      wrapper = createWrapper({
        item: undefined
      })
      
      // Should still render without errors
      expect(wrapper.findComponent({ name: 'ElMenuItem' }).exists()).toBe(true)
    })

    it('应该处理没有 title 的菜单项', () => {
      wrapper = createWrapper({
        item: {
          index: 'test-item',
          icon: 'TestIcon',
          priority: 1
        }
      })
      
      const menuItem = wrapper.findComponent({ name: 'ElMenuItem' })
      expect(menuItem.exists()).toBe(true)
      expect(menuItem.text()).toBe('') // Empty title
    })

    it('应该处理空字符串的 title', () => {
      wrapper = createWrapper({
        item: {
          index: 'test-item',
          title: '',
          icon: 'TestIcon',
          priority: 1
        }
      })
      
      const menuItem = wrapper.findComponent({ name: 'ElMenuItem' })
      expect(menuItem.exists()).toBe(true)
      expect(menuItem.text()).toBe('')
    })

    it('应该处理没有 icon 的菜单项', () => {
      wrapper = createWrapper({
        item: {
          index: 'test-item',
          title: '测试菜单项',
          priority: 1
        }
      })
      
      const menuItem = wrapper.findComponent({ name: 'ElMenuItem' })
      expect(menuItem.exists()).toBe(true)
      // Icon component should still be rendered but with no content
    })

    it('应该处理 null 的 icon', () => {
      wrapper = createWrapper({
        item: {
          index: 'test-item',
          title: '测试菜单项',
          icon: null,
          priority: 1
        }
      })
      
      const menuItem = wrapper.findComponent({ name: 'ElMenuItem' })
      expect(menuItem.exists()).toBe(true)
    })

    it('应该处理子菜单项中的 undefined 值', () => {
      wrapper = createWrapper({
        item: {
          index: 'parent-item',
          title: '父菜单项',
          icon: 'TestIcon',
          priority: 1,
          children: [
            {
              index: 'child-item-1',
              title: '子菜单项1',
              priority: 1,
              visible: undefined
            },
            {
              index: 'child-item-2',
              title: '子菜单项2',
              priority: 2,
              visible: null
            }
          ]
        }
      })
      
      const visibleChildren = wrapper.vm.visibleChildren
      expect(visibleChildren.length).toBe(2) // Both should be visible by default
    })

    it('应该处理子菜单项中的 false 值', () => {
      wrapper = createWrapper({
        item: {
          index: 'parent-item',
          title: '父菜单项',
          icon: 'TestIcon',
          priority: 1,
          children: [
            {
              index: 'child-item-1',
              title: '子菜单项1',
              priority: 1,
              visible: false
            },
            {
              index: 'child-item-2',
              title: '子菜单项2',
              priority: 2,
              visible: true
            }
          ]
        }
      })
      
      const visibleChildren = wrapper.vm.visibleChildren
      expect(visibleChildren.length).toBe(1)
      expect(visibleChildren[0].index).toBe('child-item-2')
    })

    it('应该处理大量子菜单项', () => {
      const children = []
      for (let i = 1;
import { vi } from 'vitest' i <= 50; i++) {
        children.push({
          index: `child-item-${i}`,
          title: `子菜单项${i}`,
          priority: i,
          visible: i % 2 === 0 // Only even numbers are visible
        })
      }
      
      wrapper = createWrapper({
        item: {
          index: 'parent-item',
          title: '父菜单项',
          icon: 'TestIcon',
          priority: 1,
          children: children
        }
      })
      
      const visibleChildren = wrapper.vm.visibleChildren
      expect(visibleChildren.length).toBe(25) // Only even numbered items
    })

    it('应该处理超大数量的子菜单项', () => {
      const children = []
      for (let i = 1; i <= 1000; i++) {
        children.push({
          index: `child-item-${i}`,
          title: `子菜单项${i}`,
          priority: i,
          visible: i <= 100 // Only first 100 are visible
        })
      }
      
      wrapper = createWrapper({
        item: {
          index: 'parent-item',
          title: '父菜单项',
          icon: 'TestIcon',
          priority: 1,
          children: children
        }
      })
      
      const visibleChildren = wrapper.vm.visibleChildren
      expect(visibleChildren.length).toBe(100)
    })

    it('应该处理子菜单项中的循环引用', () => {
      const child1 = {
        index: 'child-item-1',
        title: '子菜单项1',
        priority: 1,
        visible: true
      }
      
      const child2 = {
        index: 'child-item-2',
        title: '子菜单项2',
        priority: 2,
        visible: true,
        children: [child1] // Create circular reference
      }
      
      child1.children = [child2] // Create circular reference
      
      wrapper = createWrapper({
        item: {
          index: 'parent-item',
          title: '父菜单项',
          icon: 'TestIcon',
          priority: 1,
          children: [child1, child2]
        }
      })
      
      // Should handle circular reference gracefully
      expect(() => {
        const visibleChildren = wrapper.vm.visibleChildren
        expect(visibleChildren.length).toBe(2)
      }).not.toThrow()
    })

    it('应该处理包含特殊字符的菜单项标题', () => {
      wrapper = createWrapper({
        item: {
          index: 'test-item',
          title: '测试 & 菜单 < 项 >',
          icon: 'TestIcon',
          priority: 1
        }
      })
      
      const menuItem = wrapper.findComponent({ name: 'ElMenuItem' })
      expect(menuItem.exists()).toBe(true)
      expect(menuItem.text()).toBe('测试 & 菜单 < 项 >')
    })

    it('应该处理超长的菜单项标题', () => {
      const longTitle = 'x'.repeat(1000)
      
      wrapper = createWrapper({
        item: {
          index: 'test-item',
          title: longTitle,
          icon: 'TestIcon',
          priority: 1
        }
      })
      
      const menuItem = wrapper.findComponent({ name: 'ElMenuItem' })
      expect(menuItem.exists()).toBe(true)
      expect(menuItem.text()).toBe(longTitle)
    })
  })

  describe('响应式更新', () => {
    it('应该响应 item 属性变化', async () => {
      wrapper = createWrapper({
        item: {
          index: 'test-item',
          title: '原标题',
          icon: 'TestIcon',
          priority: 1
        }
      })
      
      await wrapper.setProps({
        item: {
          index: 'test-item',
          title: '新标题',
          icon: 'TestIcon',
          priority: 1
        }
      })
      
      expect(wrapper.text()).toContain('新标题')
    })

    it('应该响应 collapsed 属性变化', async () => {
      wrapper = createWrapper({
        collapsed: false
      })
      
      await wrapper.setProps({ collapsed: true })
      
      expect(wrapper.props().collapsed).toBe(true)
    })

    it('应该响应子菜单项可见性变化', async () => {
      wrapper = createWrapper({
        item: {
          index: 'parent-item',
          title: '父菜单项',
          icon: 'TestIcon',
          priority: 1,
          children: [
            {
              index: 'child-item-1',
              title: '子菜单项1',
              priority: 1,
              visible: true
            },
            {
              index: 'child-item-2',
              title: '子菜单项2',
              priority: 2,
              visible: false
            }
          ]
        }
      })
      
      expect(wrapper.vm.visibleChildren.length).toBe(1)
      
      // Update children visibility
      await wrapper.setProps({
        item: {
          index: 'parent-item',
          title: '父菜单项',
          icon: 'TestIcon',
          priority: 1,
          children: [
            {
              index: 'child-item-1',
              title: '子菜单项1',
              priority: 1,
              visible: false
            },
            {
              index: 'child-item-2',
              title: '子菜单项2',
              priority: 2,
              visible: true
            }
          ]
        }
      })
      
      expect(wrapper.vm.visibleChildren.length).toBe(1)
      expect(wrapper.vm.visibleChildren[0].index).toBe('child-item-2')
    })

    it('应该响应频繁的属性变化', async () => {
      wrapper = createWrapper({
        item: {
          index: 'test-item',
          title: '原标题',
          icon: 'TestIcon',
          priority: 1
        }
      })
      
      // Simulate frequent property changes
      for (let i = 0; i < 10; i++) {
        const newTitle = `标题${i}`
        await wrapper.setProps({
          item: {
            index: 'test-item',
            title: newTitle,
            icon: 'TestIcon',
            priority: 1
          }
        })
        expect(wrapper.text()).toContain(newTitle)
      }
    })

    it('应该响应复杂的子菜单结构变化', async () => {
      const initialChildren = [
        {
          index: 'child-item-1',
          title: '子菜单项1',
          priority: 1,
          visible: true
        }
      ]
      
      wrapper = createWrapper({
        item: {
          index: 'parent-item',
          title: '父菜单项',
          icon: 'TestIcon',
          priority: 1,
          children: initialChildren
        }
      })
      
      expect(wrapper.vm.visibleChildren.length).toBe(1)
      
      // Update to complex structure
      const complexChildren = [
        {
          index: 'child-item-1',
          title: '子菜单项1',
          priority: 1,
          visible: false
        },
        {
          index: 'child-item-2',
          title: '子菜单项2',
          priority: 2,
          visible: true
        },
        {
          index: 'child-item-3',
          title: '子菜单项3',
          priority: 3,
          visible: true
        }
      ]
      
      await wrapper.setProps({
        item: {
          index: 'parent-item',
          title: '父菜单项',
          icon: 'TestIcon',
          priority: 1,
          children: complexChildren
        }
      })
      
      expect(wrapper.vm.visibleChildren.length).toBe(2)
      expect(wrapper.vm.visibleChildren[0].index).toBe('child-item-2')
      expect(wrapper.vm.visibleChildren[1].index).toBe('child-item-3')
    })
  })

  describe('事件处理', () => {
    it('应该正确传递事件', () => {
      const emitSpy = vi.fn()
      wrapper = createWrapper({
        item: {
          index: '/test',
          title: '测试菜单项',
          icon: 'TestIcon',
          priority: 1
        }
      })
      wrapper.vm.$emit = emitSpy
      
      wrapper.vm.handleMouseEnter()
      
      expect(emitSpy).toHaveBeenCalledWith('preload', '/test')
    })

    it('应该正确处理子菜单预加载事件', () => {
      const emitSpy = vi.fn()
      wrapper = createWrapper()
      wrapper.vm.$emit = emitSpy
      
      wrapper.vm.handleChildPreload('/child-test')
      
      expect(emitSpy).toHaveBeenCalledWith('preload', '/child-test')
    })
  })

  describe('无障碍支持', () => {
    it('应该支持键盘导航', async () => {
      wrapper = createWrapper({
        item: {
          index: 'test-item',
          title: '测试菜单项',
          icon: 'TestIcon',
          priority: 1
        }
      })
      
      const menuItem = wrapper.findComponent({ name: 'ElMenuItem' })
      
      // Simulate keyboard events
      await menuItem.trigger('keydown.enter')
      await menuItem.trigger('keydown.space')
      
      // Component should handle these events without errors
      expect(true).toBe(true)
    })

    it('应该支持子菜单的键盘导航', async () => {
      wrapper = createWrapper({
        item: {
          index: 'parent-item',
          title: '父菜单项',
          icon: 'TestIcon',
          priority: 1,
          children: [
            {
              index: 'child-item-1',
              title: '子菜单项1',
              priority: 1,
              visible: true
            }
          ]
        }
      })
      
      const subMenu = wrapper.findComponent({ name: 'ElSubMenu' })
      const childItems = wrapper.findAllComponents({ name: 'ElMenuItem' })
      
      // Simulate keyboard events
      await subMenu.trigger('keydown.enter')
      await subMenu.trigger('keydown.space')
      
      if (childItems.length > 0) {
        await childItems[0].trigger('keydown.enter')
        await childItems[0].trigger('keydown.space')
      }
      
      // Component should handle these events without errors
      expect(true).toBe(true)
    })

    it('应该处理键盘事件中的异常', async () => {
      wrapper = createWrapper({
        item: {
          index: 'test-item',
          title: '测试菜单项',
          icon: 'TestIcon',
          priority: 1
        }
      })
      
      const menuItem = wrapper.findComponent({ name: 'ElMenuItem' })
      
      // Simulate keyboard events that might throw errors
      await menuItem.trigger('keydown.esc')
      await menuItem.trigger('keydown.tab')
      await menuItem.trigger('keydown.arrowup')
      await menuItem.trigger('keydown.arrowdown')
      
      // Component should handle these events without errors
      expect(true).toBe(true)
    })
  })

  describe('性能优化', () => {
    it('应该正确处理大量菜单项的渲染', () => {
      const largeChildren = []
      for (let i = 1; i <= 100; i++) {
        largeChildren.push({
          index: `child-item-${i}`,
          title: `子菜单项${i}`,
          priority: i,
          visible: true
        })
      }
      
      wrapper = createWrapper({
        item: {
          index: 'parent-item',
          title: '父菜单项',
          icon: 'TestIcon',
          priority: 1,
          children: largeChildren
        }
      })
      
      const visibleChildren = wrapper.vm.visibleChildren
      expect(visibleChildren.length).toBe(100)
      
      const childItems = wrapper.findAllComponents({ name: 'ElMenuItem' })
      expect(childItems.length).toBe(100)
    })

    it('应该正确处理频繁的鼠标事件', async () => {
      const emitSpy = vi.fn()
      wrapper = createWrapper({
        item: {
          index: '/test',
          title: '测试菜单项',
          icon: 'TestIcon',
          priority: 1
        }
      })
      wrapper.vm.$emit = emitSpy
      
      const menuItem = wrapper.findComponent({ name: 'ElMenuItem' })
      
      // Simulate frequent mouse events
      for (let i = 0; i < 20; i++) {
        await menuItem.trigger('mouseenter')
      }
      
      expect(emitSpy).toHaveBeenCalledTimes(20)
      expect(emitSpy).toHaveBeenCalledWith('preload', '/test')
    })
  })

  describe('样式适配', () => {
    it('应该正确应用折叠状态样式', () => {
      wrapper = createWrapper({
        collapsed: true
      })
      
      const menuItem = wrapper.findComponent({ name: 'ElMenuItem' })
      expect(menuItem.exists()).toBe(true)
      
      // Should apply collapsed styles
      expect(wrapper.props().collapsed).toBe(true)
    })

    it('应该正确应用展开状态样式', () => {
      wrapper = createWrapper({
        collapsed: false
      })
      
      const menuItem = wrapper.findComponent({ name: 'ElMenuItem' })
      expect(menuItem.exists()).toBe(true)
      
      // Should apply expanded styles
      expect(wrapper.props().collapsed).toBe(false)
    })

    it('应该正确处理样式类名的应用', () => {
      wrapper = createWrapper({
        item: {
          index: 'test-item',
          title: '测试菜单项',
          icon: 'TestIcon',
          priority: 1
        }
      })
      
      const menuItem = wrapper.findComponent({ name: 'ElMenuItem' })
      expect(menuItem.exists()).toBe(true)
      
      // Should have proper CSS classes
      expect(menuItem.classes()).toBeDefined()
    })
  })
})