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

describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import MenuItemComponent from '@/components/layout/MenuItemComponent.vue'

// 模拟Element Plus图标组件
const mockIcon = {
  template: '<div class="mock-icon">Icon</div>'
}

describe('MenuItemComponent.vue', () => {
  const createWrapper = (props = {}) => {
    return mount(MenuItemComponent, {
      props: {
        item: {
          index: 'test-menu',
          title: '测试菜单',
          icon: mockIcon,
          priority: 1
        },
        collapsed: false,
        ...props
      },
      global: {
        stubs: {
          'el-sub-menu': {
            template: '<div class="mock-sub-menu"><slot name="title" /></div>'
          },
          'el-menu-item': {
            template: '<div class="mock-menu-item"><slot /></div>'
          },
          'el-icon': mockIcon
        }
      }
    })
  }

  it('组件渲染正确', () => {
    const wrapper = createWrapper()
    
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.mock-menu-item').exists()).toBe(true)
  })

  it('没有子菜单时渲染为单个菜单项', () => {
    const wrapper = createWrapper({
      item: {
        index: 'single-menu',
        title: '单个菜单',
        icon: mockIcon,
        priority: 1
      }
    })
    
    expect(wrapper.find('.mock-menu-item').exists()).toBe(true)
    expect(wrapper.find('.mock-sub-menu').exists()).toBe(false)
  })

  it('有子菜单时渲染为子菜单容器', () => {
    const wrapper = createWrapper({
      item: {
        index: 'parent-menu',
        title: '父菜单',
        icon: mockIcon,
        priority: 1,
        children: [
          {
            index: 'child-menu-1',
            title: '子菜单1',
            priority: 1
          },
          {
            index: 'child-menu-2',
            title: '子菜单2',
            priority: 1
          }
        ]
      }
    })
    
    expect(wrapper.find('.mock-sub-menu').exists()).toBe(true)
    expect(wrapper.find('.mock-menu-item').exists()).toBe(false)
  })

  it('正确显示菜单项标题', () => {
    const wrapper = createWrapper({
      item: {
        index: 'test-menu',
        title: '测试菜单标题',
        icon: mockIcon,
        priority: 1
      }
    })
    
    expect(wrapper.text()).toContain('测试菜单标题')
  })

  it('正确渲染菜单项图标', () => {
    const wrapper = createWrapper()
    
    const iconComponent = wrapper.findComponent(mockIcon)
    expect(iconComponent.exists()).toBe(true)
  })

  it('正确渲染子菜单项', () => {
    const wrapper = createWrapper({
      item: {
        index: 'parent-menu',
        title: '父菜单',
        icon: mockIcon,
        priority: 1,
        children: [
          {
            index: 'child-menu-1',
            title: '子菜单1',
            priority: 1
          },
          {
            index: 'child-menu-2',
            title: '子菜单2',
            priority: 1
          }
        ]
      }
    })
    
    const childMenuItems = wrapper.findAllComponents({ name: 'el-menu-item' })
    expect(childMenuItems.length).toBe(2)
    expect(childMenuItems[0].text()).toContain('子菜单1')
    expect(childMenuItems[1].text()).toContain('子菜单2')
  })

  it('只显示可见的子菜单项', () => {
    const wrapper = createWrapper({
      item: {
        index: 'parent-menu',
        title: '父菜单',
        icon: mockIcon,
        priority: 1,
        children: [
          {
            index: 'child-menu-1',
            title: '子菜单1',
            priority: 1,
            visible: true
          },
          {
            index: 'child-menu-2',
            title: '子菜单2',
            priority: 1,
            visible: false
          },
          {
            index: 'child-menu-3',
            title: '子菜单3',
            priority: 1
          }
        ]
      }
    })
    
    const childMenuItems = wrapper.findAllComponents({ name: 'el-menu-item' })
    expect(childMenuItems.length).toBe(2) // 只显示visible为true和未设置visible的子菜单
    expect(childMenuItems[0].text()).toContain('子菜单1')
    expect(childMenuItems[1].text()).toContain('子菜单3')
  })

  it('所有子菜单项默认可见时全部显示', () => {
    const wrapper = createWrapper({
      item: {
        index: 'parent-menu',
        title: '父菜单',
        icon: mockIcon,
        priority: 1,
        children: [
          {
            index: 'child-menu-1',
            title: '子菜单1',
            priority: 1
          },
          {
            index: 'child-menu-2',
            title: '子菜单2',
            priority: 1
          },
          {
            index: 'child-menu-3',
            title: '子菜单3',
            priority: 1
          }
        ]
      }
    })
    
    const childMenuItems = wrapper.findAllComponents({ name: 'el-menu-item' })
    expect(childMenuItems.length).toBe(3)
  })

  it('鼠标悬停时触发预加载事件', async () => {
    const wrapper = createWrapper({
      item: {
        index: '/dashboard',
        title: '仪表盘',
        icon: mockIcon,
        priority: 1
      }
    })
    
    const emitSpy = vi.spyOn(wrapper.vm, 'emit')
    
    await wrapper.find('.mock-menu-item').trigger('mouseenter')
    
    expect(emitSpy).toHaveBeenCalledWith('preload', '/dashboard')
  })

  it('非路由路径时不触发预加载事件', async () => {
    const wrapper = createWrapper({
      item: {
        index: 'non-route-path',
        title: '非路由菜单',
        icon: mockIcon,
        priority: 1
      }
    })
    
    const emitSpy = vi.spyOn(wrapper.vm, 'emit')
    
    await wrapper.find('.mock-menu-item').trigger('mouseenter')
    
    expect(emitSpy).not.toHaveBeenCalled()
  })

  it('子菜单项鼠标悬停时触发预加载事件', async () => {
    const wrapper = createWrapper({
      item: {
        index: 'parent-menu',
        title: '父菜单',
        icon: mockIcon,
        priority: 1,
        children: [
          {
            index: '/users',
            title: '用户管理',
            priority: 1
          }
        ]
      }
    })
    
    const emitSpy = vi.spyOn(wrapper.vm, 'emit')
    
    const childMenuItems = wrapper.findAllComponents({ name: 'el-menu-item' })
    await childMenuItems[0].trigger('mouseenter')
    
    expect(emitSpy).toHaveBeenCalledWith('preload', '/users')
  })

  it('正确处理空子菜单数组', () => {
    const wrapper = createWrapper({
      item: {
        index: 'parent-menu',
        title: '父菜单',
        icon: mockIcon,
        priority: 1,
        children: []
      }
    })
    
    // 空子菜单数组应该渲染为单个菜单项
    expect(wrapper.find('.mock-menu-item').exists()).toBe(true)
    expect(wrapper.find('.mock-sub-menu').exists()).toBe(false)
  })

  it('正确处理undefined的children属性', () => {
    const wrapper = createWrapper({
      item: {
        index: 'single-menu',
        title: '单个菜单',
        icon: mockIcon,
        priority: 1,
        children: undefined
      }
    })
    
    // undefined的children应该渲染为单个菜单项
    expect(wrapper.find('.mock-menu-item').exists()).toBe(true)
    expect(wrapper.find('.mock-sub-menu').exists()).toBe(false)
  })

  it('正确响应collapsed属性变化', async () => {
    const wrapper = createWrapper({
      collapsed: false
    })
    
    // 初始状态
    expect(wrapper.props('collapsed')).toBe(false)
    
    // 更新collapsed属性
    await wrapper.setProps({ collapsed: true })
    
    expect(wrapper.props('collapsed')).toBe(true)
  })

  it('正确处理菜单项的优先级属性', () => {
    const wrapper = createWrapper({
      item: {
        index: 'priority-menu',
        title: '优先级菜单',
        icon: mockIcon,
        priority: 10
      }
    })
    
    expect(wrapper.props('item').priority).toBe(10)
  })

  it('正确处理没有图标的菜单项', () => {
    const wrapper = createWrapper({
      item: {
        index: 'no-icon-menu',
        title: '无图标菜单',
        priority: 1
      }
    })
    
    // 没有图标时应该仍然正常渲染
    expect(wrapper.find('.mock-menu-item').exists()).toBe(true)
    expect(wrapper.text()).toContain('无图标菜单')
  })

  it('正确计算visibleChildren计算属性', () => {
    const wrapper = createWrapper({
      item: {
        index: 'parent-menu',
        title: '父菜单',
        icon: mockIcon,
        priority: 1,
        children: [
          {
            index: 'child-1',
            title: '子菜单1',
            priority: 1,
            visible: true
          },
          {
            index: 'child-2',
            title: '子菜单2',
            priority: 1,
            visible: false
          },
          {
            index: 'child-3',
            title: '子菜单3',
            priority: 1
          }
        ]
      }
    })
    
    const vm = wrapper.vm as any
    const visibleChildren = vm.visibleChildren
    
    expect(visibleChildren.length).toBe(2)
    expect(visibleChildren[0].title).toBe('子菜单1')
    expect(visibleChildren[1].title).toBe('子菜单3')
  })

  it('组件样式应用正确', () => {
    const wrapper = createWrapper()
    
    const menuItem = wrapper.find('.mock-menu-item')
    expect(menuItem.exists()).toBe(true)
    
    // 验证组件的基本结构
    expect(wrapper.text()).toContain('测试菜单')
  })
})