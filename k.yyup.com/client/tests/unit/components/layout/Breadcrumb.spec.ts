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
import Breadcrumb from '@/components/layout/Breadcrumb.vue'

// 模拟路由配置
const routes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    meta: { title: '首页' }
  },
  {
    path: '/students',
    name: 'Students',
    meta: { title: '学生管理' }
  },
  {
    path: '/students/:id',
    name: 'StudentDetail',
    meta: { title: '学生详情' }
  },
  {
    path: '/settings',
    name: 'Settings',
    meta: { title: '系统设置' },
    children: [
      {
        path: 'profile',
        name: 'Profile',
        meta: { title: '个人资料' }
      }
    ]
  }
]

describe('Breadcrumb.vue', () => {
  let router: Router

  beforeEach(() => {
    router = createRouter({
      history: createWebHistory(),
      routes
    })
  })

  it('组件渲染正确', () => {
    const wrapper = mount(Breadcrumb, {
      global: {
        plugins: [router],
        stubs: ['el-breadcrumb', 'el-breadcrumb-item']
      }
    })
    
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.app-breadcrumb').exists()).toBe(true)
  })

  it('在首页路径时显示正确的面包屑', async () => {
    await router.push('/dashboard')
    const wrapper = mount(Breadcrumb, {
      global: {
        plugins: [router],
        stubs: ['el-breadcrumb', 'el-breadcrumb-item']
      }
    })
    
    await wrapper.vm.$nextTick()
    
    const breadcrumbItems = wrapper.findAllComponents({ name: 'el-breadcrumb-item' })
    expect(breadcrumbItems.length).toBe(1)
    expect(breadcrumbItems[0].text()).toBe('首页')
  })

  it('在非首页路径时自动添加首页面包屑', async () => {
    await router.push('/students')
    const wrapper = mount(Breadcrumb, {
      global: {
        plugins: [router],
        stubs: ['el-breadcrumb', 'el-breadcrumb-item']
      }
    })
    
    await wrapper.vm.$nextTick()
    
    const breadcrumbItems = wrapper.findAllComponents({ name: 'el-breadcrumb-item' })
    expect(breadcrumbItems.length).toBe(2)
    expect(breadcrumbItems[0].text()).toBe('首页')
    expect(breadcrumbItems[1].text()).toBe('学生管理')
  })

  it('正确显示当前路径的最后一项为不可点击状态', async () => {
    await router.push('/students')
    const wrapper = mount(Breadcrumb, {
      global: {
        plugins: [router],
        stubs: ['el-breadcrumb', 'el-breadcrumb-item']
      }
    })
    
    await wrapper.vm.$nextTick()
    
    const breadcrumbItems = wrapper.findAllComponents({ name: 'el-breadcrumb-item' })
    const lastItem = breadcrumbItems[breadcrumbItems.length - 1]
    
    expect(lastItem.find('.no-redirect').exists()).toBe(true)
    expect(lastItem.find('a').exists()).toBe(false)
  })

  it('正确显示可点击的历史路径项', async () => {
    await router.push('/students')
    const wrapper = mount(Breadcrumb, {
      global: {
        plugins: [router],
        stubs: ['el-breadcrumb', 'el-breadcrumb-item']
      }
    })
    
    await wrapper.vm.$nextTick()
    
    const breadcrumbItems = wrapper.findAllComponents({ name: 'el-breadcrumb-item' })
    const firstItem = breadcrumbItems[0]
    
    expect(firstItem.find('.no-redirect').exists()).toBe(false)
    expect(firstItem.find('a').exists()).toBe(true)
    expect(firstItem.find('a').text()).toBe('首页')
  })

  it('点击可点击项时触发路由跳转', async () => {
    await router.push('/students')
    const wrapper = mount(Breadcrumb, {
      global: {
        plugins: [router],
        stubs: ['el-breadcrumb', 'el-breadcrumb-item']
      }
    })
    
    await wrapper.vm.$nextTick()
    
    const pushSpy = vi.spyOn(router, 'push')
    const breadcrumbItems = wrapper.findAllComponents({ name: 'el-breadcrumb-item' })
    const firstItem = breadcrumbItems[0]
    
    await firstItem.find('a').trigger('click.prevent')
    
    expect(pushSpy).toHaveBeenCalledWith('/dashboard')
  })

  it('路径变化时自动更新面包屑', async () => {
    const wrapper = mount(Breadcrumb, {
      global: {
        plugins: [router],
        stubs: ['el-breadcrumb', 'el-breadcrumb-item']
      }
    })
    
    // 初始在首页
    await router.push('/dashboard')
    await wrapper.vm.$nextTick()
    
    let breadcrumbItems = wrapper.findAllComponents({ name: 'el-breadcrumb-item' })
    expect(breadcrumbItems.length).toBe(1)
    expect(breadcrumbItems[0].text()).toBe('首页')
    
    // 切换到学生管理页面
    await router.push('/students')
    await wrapper.vm.$nextTick()
    
    breadcrumbItems = wrapper.findAllComponents({ name: 'el-breadcrumb-item' })
    expect(breadcrumbItems.length).toBe(2)
    expect(breadcrumbItems[0].text()).toBe('首页')
    expect(breadcrumbItems[1].text()).toBe('学生管理')
  })

  it('处理带有redirect属性的路由项', async () => {
    // 临时修改路由配置，添加redirect属性
    const routeWithRedirect = {
      path: '/redirect-test',
      name: 'RedirectTest',
      meta: { title: '重定向测试', redirect: '/dashboard' }
    }
    
    router.addRoute(routeWithRedirect)
    
    await router.push('/redirect-test')
    const wrapper = mount(Breadcrumb, {
      global: {
        plugins: [router],
        stubs: ['el-breadcrumb', 'el-breadcrumb-item']
      }
    })
    
    await wrapper.vm.$nextTick()
    
    const breadcrumbItems = wrapper.findAllComponents({ name: 'el-breadcrumb-item' })
    const lastItem = breadcrumbItems[breadcrumbItems.length - 1]
    
    expect(lastItem.text()).toBe('重定向测试')
  })

  it('正确处理没有meta.title的路由项', async () => {
    // 添加没有meta.title的路由
    const routeWithoutTitle = {
      path: '/no-title',
      name: 'NoTitle'
    }
    
    router.addRoute(routeWithoutTitle)
    
    await router.push('/no-title')
    const wrapper = mount(Breadcrumb, {
      global: {
        plugins: [router],
        stubs: ['el-breadcrumb', 'el-breadcrumb-item']
      }
    })
    
    await wrapper.vm.$nextTick()
    
    // 应该过滤掉没有title的路由项
    const breadcrumbItems = wrapper.findAllComponents({ name: 'el-breadcrumb-item' })
    expect(breadcrumbItems.length).toBe(1) // 只有首页
  })

  it('组件样式应用正确', () => {
    const wrapper = mount(Breadcrumb, {
      global: {
        plugins: [router],
        stubs: ['el-breadcrumb', 'el-breadcrumb-item']
      }
    })
    
    const breadcrumb = wrapper.find('.app-breadcrumb')
    expect(breadcrumb.classes()).toContain('app-breadcrumb')
    
    const noRedirectSpan = wrapper.find('.no-redirect')
    if (noRedirectSpan.exists()) {
      expect(noRedirectSpan.classes()).toContain('no-redirect')
    }
  })
})