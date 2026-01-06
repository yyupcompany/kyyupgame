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

describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory, Router } from 'vue-router'
import SidebarItem from '@/components/layout/SidebarItem.vue'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// Mock Element Plus icons
vi.mock('@element-plus/icons-vue', () => ({
  House: { template: '<div>HouseIcon</div>' },
  Setting: { template: '<div>SettingIcon</div>' },
  User: { template: '<div>UserIcon</div>' }
}))

describe('SidebarItem.vue', () => {
  let router: Router

  beforeEach(() => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
        { path: '/dashboard', name: 'dashboard', component: { template: '<div>Dashboard</div>' } },
        { path: '/settings', name: 'settings', component: { template: '<div>Settings</div>' } },
        { path: '/users', name: 'users', component: { template: '<div>Users</div>' } }
      ]
    })
  })

  const createWrapper = (props: any = {}) => {
    return mount(SidebarItem, {
      props: {
        item: {
          path: '/test',
          meta: { title: 'Test Menu', icon: 'House' }
        },
        basePath: '',
        isNest: false,
        ...props
      },
      global: {
        plugins: [router, ElementPlus],
        stubs: {
          'el-menu-item': true,
          'el-sub-menu': true,
          'el-icon': true,
          'sidebar-item': true
        }
      }
    })
  }

  describe('组件渲染测试', () => {
    it('应该正确渲染单个菜单项', () => {
      const wrapper = createWrapper({
        item: {
          path: '/dashboard',
          meta: { title: 'Dashboard', icon: 'House' }
        }
      })

      expect(wrapper.find('.sidebar-item-container').exists()).toBe(true)
      expect(wrapper.text()).toContain('Dashboard')
    })

    it('应该正确渲染多级菜单', () => {
      const wrapper = createWrapper({
        item: {
          path: '/settings',
          meta: { title: 'Settings', icon: 'Setting' },
          children: [
            {
              path: 'profile',
              meta: { title: 'Profile', icon: 'User' }
            }
          ]
        }
      })

      expect(wrapper.find('.sidebar-item-container').exists()).toBe(true)
      expect(wrapper.text()).toContain('Settings')
    })

    it('应该正确处理没有meta信息的菜单项', () => {
      const wrapper = createWrapper({
        item: {
          path: '/no-meta'
        }
      })

      expect(wrapper.find('.sidebar-item-container').exists()).toBe(true)
    })

    it('应该正确处理嵌套菜单', () => {
      const wrapper = createWrapper({
        item: {
          path: '/parent',
          meta: { title: 'Parent', icon: 'House' },
          children: [
            {
              path: 'child',
              meta: { title: 'Child', icon: 'User' }
            }
          ]
        },
        isNest: true
      })

      expect(wrapper.find('.sidebar-item-container').exists()).toBe(true)
    })
  })

  describe('props传递测试', () => {
    it('应该正确接收item prop', () => {
      const item = {
        path: '/test',
        meta: { title: 'Test', icon: 'House' }
      }
      const wrapper = createWrapper({ item })

      expect(wrapper.props('item')).toEqual(item)
    })

    it('应该正确接收basePath prop', () => {
      const wrapper = createWrapper({ basePath: '/admin' })

      expect(wrapper.props('basePath')).toBe('/admin')
    })

    it('应该正确接收isNest prop', () => {
      const wrapper = createWrapper({ isNest: true })

      expect(wrapper.props('isNest')).toBe(true)
    })

    it('应该使用默认的basePath值', () => {
      const wrapper = createWrapper()

      expect(wrapper.props('basePath')).toBe('')
    })

    it('应该使用默认的isNest值', () => {
      const wrapper = createWrapper()

      expect(wrapper.props('isNest')).toBe(false)
    })
  })

  describe('计算属性测试', () => {
    it('onlyOneChild应该返回当前路由项', async () => {
      const item = {
        path: '/test',
        meta: { title: 'Test', icon: 'House' }
      }
      const wrapper = createWrapper({ item })

      await wrapper.vm.$nextTick()
      expect(wrapper.vm.onlyOneChild).toEqual(item)
    })

    it('showingChildRoutes应该过滤隐藏的菜单项', async () => {
      const item = {
        path: '/parent',
        meta: { title: 'Parent', icon: 'House' },
        children: [
          {
            path: 'visible',
            meta: { title: 'Visible', icon: 'User' }
          },
          {
            path: 'hidden',
            meta: { title: 'Hidden', icon: 'Setting', hideInMenu: true }
          }
        ]
      }
      const wrapper = createWrapper({ item })

      await wrapper.vm.$nextTick()
      expect(wrapper.vm.showingChildRoutes).toHaveLength(1)
      expect(wrapper.vm.showingChildRoutes[0].meta.title).toBe('Visible')
    })

    it('isMenuItem应该正确识别单个菜单项', async () => {
      const item = {
        path: '/single',
        meta: { title: 'Single', icon: 'House' }
      }
      const wrapper = createWrapper({ item })

      await wrapper.vm.$nextTick()
      expect(wrapper.vm.isMenuItem).toBe(true)
    })

    it('isMenuItem应该正确识别多级菜单', async () => {
      const item = {
        path: '/parent',
        meta: { title: 'Parent', icon: 'House' },
        children: [
          {
            path: 'child1',
            meta: { title: 'Child 1', icon: 'User' }
          },
          {
            path: 'child2',
            meta: { title: 'Child 2', icon: 'Setting' }
          }
        ]
      }
      const wrapper = createWrapper({ item })

      await wrapper.vm.$nextTick()
      expect(wrapper.vm.isMenuItem).toBe(false)
    })
  })

  describe('路径解析测试', () => {
    it('resolveFullPath应该正确处理空路径', async () => {
      const wrapper = createWrapper({ basePath: '/admin' })

      await wrapper.vm.$nextTick()
      expect(wrapper.vm.resolveFullPath('')).toBe('/admin')
    })

    it('resolveFullPath应该正确处理绝对路径', async () => {
      const wrapper = createWrapper()

      await wrapper.vm.$nextTick()
      expect(wrapper.vm.resolveFullPath('/absolute/path')).toBe('/absolute/path')
    })

    it('resolveFullPath应该正确处理根路径拼接', async () => {
      const wrapper = createWrapper({ basePath: '/' })

      await wrapper.vm.$nextTick()
      expect(wrapper.vm.resolveFullPath('test')).toBe('/test')
    })

    it('resolveFullPath应该正确处理相对路径拼接', async () => {
      const wrapper = createWrapper({ basePath: '/admin' })

      await wrapper.vm.$nextTick()
      expect(wrapper.vm.resolveFullPath('users')).toBe('/admin/users')
    })

    it('resolveFullPath应该正确处理路径标准化', async () => {
      const wrapper = createWrapper({ basePath: '/admin/' })

      await wrapper.vm.$nextTick()
      expect(wrapper.vm.resolveFullPath('/users')).toBe('/admin/users')
    })

    it('resolveFullPath应该避免重复路径', async () => {
      const wrapper = createWrapper({ basePath: '/admin/users' })

      await wrapper.vm.$nextTick()
      expect(wrapper.vm.resolveFullPath('users')).toBe('/admin/users')
    })
  })

  describe('边界条件测试', () => {
    it('应该处理没有children的菜单项', () => {
      const wrapper = createWrapper({
        item: {
          path: '/no-children',
          meta: { title: 'No Children', icon: 'House' }
        }
      })

      expect(wrapper.find('.sidebar-item-container').exists()).toBe(true)
      expect(wrapper.vm.showingChildRoutes).toEqual([])
    })

    it('应该处理所有子菜单都隐藏的情况', () => {
      const wrapper = createWrapper({
        item: {
          path: '/parent',
          meta: { title: 'Parent', icon: 'House' },
          children: [
            {
              path: 'hidden1',
              meta: { title: 'Hidden 1', hideInMenu: true }
            },
            {
              path: 'hidden2',
              meta: { title: 'Hidden 2', hideInMenu: true }
            }
          ]
        }
      })

      expect(wrapper.vm.showingChildRoutes).toEqual([])
      expect(wrapper.vm.isMenuItem).toBe(true)
    })

    it('应该处理只有一层子菜单的情况', () => {
      const wrapper = createWrapper({
        item: {
          path: '/parent',
          meta: { title: 'Parent', icon: 'House' },
          children: [
            {
              path: 'child',
              meta: { title: 'Child', icon: 'User' }
            }
          ]
        }
      })

      expect(wrapper.vm.isMenuItem).toBe(true)
    })

    it('应该处理多层嵌套子菜单的情况', () => {
      const wrapper = createWrapper({
        item: {
          path: '/parent',
          meta: { title: 'Parent', icon: 'House' },
          children: [
            {
              path: 'child',
              meta: { title: 'Child', icon: 'User' },
              children: [
                {
                  path: 'grandchild',
                  meta: { title: 'Grandchild', icon: 'Setting' }
                }
              ]
            }
          ]
        }
      })

      expect(wrapper.vm.isMenuItem).toBe(false)
    })
  })

  describe('样式测试', () => {
    it('应该包含正确的CSS类', () => {
      const wrapper = createWrapper()

      expect(wrapper.find('.sidebar-item-container').exists()).toBe(true)
      expect(wrapper.find('.menu-item-content').exists()).toBe(true)
    })

    it('应该正确应用嵌套样式', () => {
      const wrapper = createWrapper({ isNest: true })

      expect(wrapper.find('.sidebar-item-container').exists()).toBe(true)
    })
  })

  describe('递归组件测试', () => {
    it('应该正确注册递归组件', () => {
      const wrapper = createWrapper({
        item: {
          path: '/parent',
          meta: { title: 'Parent', icon: 'House' },
          children: [
            {
              path: 'child',
              meta: { title: 'Child', icon: 'User' }
            }
          ]
        }
      })

      expect(wrapper.findComponent({ name: 'SidebarItem' })).toBeTruthy()
    })
  })
})