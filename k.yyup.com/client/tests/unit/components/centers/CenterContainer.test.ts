
vi.mock('vue-i18n', () => ({
  createI18n: vi.fn(() => ({
    global: {
      t: vi.fn((key) => key),
      locale: 'zh-CN'
    }
  })),
  useI18n: vi.fn(() => ({
    t: vi.fn((key) => key),
    locale: ref('zh-CN')
  }))
}))

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createRouter, createWebHistory, Router } from 'vue-router'
import CenterContainer from '@/components/centers/CenterContainer.vue'
import { Plus } from '@element-plus/icons-vue'

// 模拟Element Plus图标
vi.mock('@element-plus/icons-vue', () => ({
  Plus: vi.fn()
}))

// 模拟Element Plus组件
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElButton: {
      name: 'ElButton',
      template: '<button @click="$emit(\'click\')"><slot></slot></button>'
    },
    ElBreadcrumb: {
      name: 'ElBreadcrumb',
      template: '<div><slot></slot></div>'
    },
    ElBreadcrumbItem: {
      name: 'ElBreadcrumbItem',
      template: '<div><slot></slot></div>'
    },
    ElTabs: {
      name: 'ElTabs',
      template: '<div><slot></slot></div>'
    },
    ElTabPane: {
      name: 'ElTabPane',
      template: '<div><slot></slot><slot name="default"></slot></div>'
    },
    ElLoading: {
      name: 'ElLoading',
      template: '<div class="loading">加载中...</div>'
    }
  }
})

// 控制台错误检测变量
let consoleSpy: any

describe('CenterContainer.vue', () => {
  let wrapper: any
  let i18n: any
  let router: Router

  const mockTabs = [
    { key: 'overview', label: '概览' },
    { key: 'details', label: '详情' },
    { key: 'settings', label: '设置' }
  ]

  beforeEach(() => {
    i18n = createI18n({
      legacy: false,
      locale: 'zh-CN',
      messages: {
        'zh-CN': {}
      }
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/test', component: { template: '<div>Test</div>' } }
      ]
    })

    wrapper = mount(CenterContainer, {
      props: {
        title: '测试中心',
        tabs: mockTabs,
        showHeader: true,
        showTitle: true,
        showActions: true
      },
      global: {
        plugins: [i18n, router],
        stubs: {
          'el-button': true,
          'el-breadcrumb': true,
          'el-breadcrumb-item': true,
          'el-tabs': true,
          'el-tab-pane': true,
          'el-loading': true
        }
      }
    })
  })

  afterEach(() => {
    if (wrapper) => {
      wrapper.unmount()
    }
    vi.clearAllMocks()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  it('正确渲染组件', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.center-container').exists()).toBe(true)
    expect(wrapper.find('.scaled-card').exists()).toBe(true)
  })

  it('显示标题', () => {
    const title = wrapper.find('.center-title')
    expect(title.exists()).toBe(true)
    expect(title.text()).toBe('测试中心')
  })

  it('显示面包屑导航', () => {
    const breadcrumb = wrapper.find('.center-breadcrumb')
    expect(breadcrumb.exists()).toBe(true)
  })

  it('显示标签页', () => {
    const tabs = wrapper.find('.center-tabs')
    expect(tabs.exists()).toBe(true)
  })

  it('显示内容区域', () => {
    const content = wrapper.find('.center-content')
    expect(content.exists()).toBe(true)
  })

  it('正确初始化激活标签页', async () => {
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.activeTab).toBe('overview')
  })

  it('使用defaultTab属性设置激活标签页', async () => {
    const wrapperWithDefaultTab = mount(CenterContainer, {
      props: {
        title: '测试中心',
        tabs: mockTabs,
        defaultTab: 'details',
        showHeader: true
      },
      global: {
        plugins: [i18n, router],
        stubs: {
          'el-button': true,
          'el-breadcrumb': true,
          'el-breadcrumb-item': true,
          'el-tabs': true,
          'el-tab-pane': true,
          'el-loading': true
        }
      }
    })

    await wrapperWithDefaultTab.vm.$nextTick()
    expect(wrapperWithDefaultTab.vm.activeTab).toBe('details')
    wrapperWithDefaultTab.unmount()
  })

  it('使用activeTab属性设置激活标签页', async () => {
    const wrapperWithActiveTab = mount(CenterContainer, {
      props: {
        title: '测试中心',
        tabs: mockTabs,
        activeTab: 'settings',
        showHeader: true
      },
      global: {
        plugins: [i18n, router],
        stubs: {
          'el-button': true,
          'el-breadcrumb': true,
          'el-breadcrumb-item': true,
          'el-tabs': true,
          'el-tab-pane': true,
          'el-loading': true
        }
      }
    })

    await wrapperWithActiveTab.vm.$nextTick()
    expect(wrapperWithActiveTab.vm.activeTab).toBe('settings')
    wrapperWithActiveTab.unmount()
  })

  it('处理标签页切换', async () => {
    await wrapper.vm.$nextTick()
    await wrapper.vm.handleTabChange('details')
    
    expect(wrapper.vm.activeTab).toBe('details')
    expect(wrapper.emitted('tabChange')).toBeTruthy()
    expect(wrapper.emitted('tabChange')[0]).toEqual(['details'])
    expect(wrapper.emitted('update:activeTab')).toBeTruthy()
    expect(wrapper.emitted('update:activeTab')[0]).toEqual(['details'])
  })

  it('从URL参数获取标签页（syncUrl=true）', async () => {
    router.currentRoute.value.query.tab = 'settings'
    
    const wrapperWithSync = mount(CenterContainer, {
      props: {
        title: '测试中心',
        tabs: mockTabs,
        syncUrl: true,
        showHeader: true
      },
      global: {
        plugins: [i18n, router],
        stubs: {
          'el-button': true,
          'el-breadcrumb': true,
          'el-breadcrumb-item': true,
          'el-tabs': true,
          'el-tab-pane': true,
          'el-loading': true
        }
      }
    })

    await wrapperWithSync.vm.$nextTick()
    expect(wrapperWithSync.vm.activeTab).toBe('settings')
    wrapperWithSync.unmount()
  })

  it('不从URL参数获取标签页（syncUrl=false）', async () => {
    router.currentRoute.value.query.tab = 'settings'
    
    const wrapperWithoutSync = mount(CenterContainer, {
      props: {
        title: '测试中心',
        tabs: mockTabs,
        syncUrl: false,
        showHeader: true
      },
      global: {
        plugins: [i18n, router],
        stubs: {
          'el-button': true,
          'el-breadcrumb': true,
          'el-breadcrumb-item': true,
          'el-tabs': true,
          'el-tab-pane': true,
          'el-loading': true
        }
      }
    })

    await wrapperWithoutSync.vm.$nextTick()
    expect(wrapperWithoutSync.vm.activeTab).toBe('overview')
    wrapperWithoutSync.unmount()
  })

  it('标签页切换时更新URL（syncUrl=true）', async () => {
    await wrapper.vm.$nextTick()
    await wrapper.vm.handleTabChange('details')
    
    expect(router.currentRoute.value.query.tab).toBe('details')
  })

  it('标签页切换时不更新URL（syncUrl=false）', async () => {
    const wrapperWithoutSync = mount(CenterContainer, {
      props: {
        title: '测试中心',
        tabs: mockTabs,
        syncUrl: false,
        showHeader: true
      },
      global: {
        plugins: [i18n, router],
        stubs: {
          'el-button': true,
          'el-breadcrumb': true,
          'el-breadcrumb-item': true,
          'el-tabs': true,
          'el-tab-pane': true,
          'el-loading': true
        }
      }
    })

    await wrapperWithoutSync.vm.$nextTick()
    await wrapperWithoutSync.vm.handleTabChange('details')
    
    expect(router.currentRoute.value.query.tab).toBeUndefined()
    wrapperWithoutSync.unmount()
  })

  it('监听activeTab prop变化', async () => {
    await wrapper.vm.$nextTick()
    await wrapper.setProps({ activeTab: 'settings' })
    
    expect(wrapper.vm.activeTab).toBe('settings')
  })

  it('监听路由变化（syncUrl=true）', async () => {
    await wrapper.vm.$nextTick()
    router.currentRoute.value.query.tab = 'details'
    
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.activeTab).toBe('details')
  })

  it('不监听路由变化（syncUrl=false）', async () => {
    const wrapperWithoutSync = mount(CenterContainer, {
      props: {
        title: '测试中心',
        tabs: mockTabs,
        syncUrl: false,
        showHeader: true
      },
      global: {
        plugins: [i18n, router],
        stubs: {
          'el-button': true,
          'el-breadcrumb': true,
          'el-breadcrumb-item': true,
          'el-tabs': true,
          'el-tab-pane': true,
          'el-loading': true
        }
      }
    })

    await wrapperWithoutSync.vm.$nextTick()
    router.currentRoute.value.query.tab = 'details'
    
    await wrapperWithoutSync.vm.$nextTick()
    expect(wrapperWithoutSync.vm.activeTab).toBe('overview')
    wrapperWithoutSync.unmount()
  })

  it('监听tabs变化', async () => {
    const newTabs = [
      { key: 'new', label: '新标签' },
      { key: 'other', label: '其他标签' }
    ]
    
    await wrapper.setProps({ tabs: newTabs })
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.activeTab).toBe('new')
  })

  it('显示骨架屏', () => {
    const skeletonWrapper = mount(CenterContainer, {
      props: {
        title: '测试中心',
        showSkeleton: true,
        showHeader: true
      },
      global: {
        plugins: [i18n, router],
        stubs: {
          'el-button': true,
          'el-breadcrumb': true,
          'el-breadcrumb-item': true,
          'el-tabs': true,
          'el-tab-pane': true,
          'el-loading': true
        }
      }
    })

    expect(skeletonWrapper.vm.isSkeletonVisible).toBe(true)
    expect(skeletonWrapper.find('.center-skeleton').exists()).toBe(true)
    skeletonWrapper.unmount()
  })

  it('延迟显示骨架屏', async () => {
    vi.useFakeTimers()
    
    const delayedSkeletonWrapper = mount(CenterContainer, {
      props: {
        title: '测试中心',
        showSkeleton: true,
        skeletonDelay: 1000,
        showHeader: true
      },
      global: {
        plugins: [i18n, router],
        stubs: {
          'el-button': true,
          'el-breadcrumb': true,
          'el-breadcrumb-item': true,
          'el-tabs': true,
          'el-tab-pane': true,
          'el-loading': true
        }
      }
    })

    expect(delayedSkeletonWrapper.vm.isSkeletonVisible).toBe(false)
    
    vi.advanceTimersByTime(1000)
    await delayedSkeletonWrapper.vm.$nextTick()
    
    expect(delayedSkeletonWrapper.vm.isSkeletonVisible).toBe(true)
    
    vi.useRealTimers()
    delayedSkeletonWrapper.unmount()
  })

  it('隐藏骨架屏', async () => {
    const skeletonWrapper = mount(CenterContainer, {
      props: {
        title: '测试中心',
        showSkeleton: true,
        showHeader: true
      },
      global: {
        plugins: [i18n, router],
        stubs: {
          'el-button': true,
          'el-breadcrumb': true,
          'el-breadcrumb-item': true,
          'el-tabs': true,
          'el-tab-pane': true,
          'el-loading': true
        }
      }
    })

    expect(skeletonWrapper.vm.isSkeletonVisible).toBe(true)
    
    await skeletonWrapper.setProps({ showSkeleton: false })
    await skeletonWrapper.vm.$nextTick()
    
    expect(skeletonWrapper.vm.isSkeletonVisible).toBe(false)
    skeletonWrapper.unmount()
  })

  it('显示加载状态', () => {
    const loadingWrapper = mount(CenterContainer, {
      props: {
        title: '测试中心',
        loading: true,
        showHeader: true
      },
      global: {
        plugins: [i18n, router],
        stubs: {
          'el-button': true,
          'el-breadcrumb': true,
          'el-breadcrumb-item': true,
          'el-tabs': true,
          'el-tab-pane': true,
          'el-loading': true
        }
      }
    })

    expect(loadingWrapper.find('.center-loading').exists()).toBe(true)
    loadingWrapper.unmount()
  })

  it('显示简化操作栏', () => {
    const actionsWrapper = mount(CenterContainer, {
      props: {
        title: '测试中心',
        showHeader: false,
        showActions: true
      },
      global: {
        plugins: [i18n, router],
        stubs: {
          'el-button': true,
          'el-breadcrumb': true,
          'el-breadcrumb-item': true,
          'el-tabs': true,
          'el-tab-pane': true,
          'el-loading': true
        }
      }
    })

    expect(actionsWrapper.find('.center-actions').exists()).toBe(true)
    expect(actionsWrapper.find('.center-actions-right').exists()).toBe(true)
    actionsWrapper.unmount()
  })

  it('显示底部区域', () => {
    const footerWrapper = mount(CenterContainer, {
      props: {
        title: '测试中心',
        showHeader: true
      },
      slots: {
        footer: '<div class="footer-content">底部内容</div>'
      },
      global: {
        plugins: [i18n, router],
        stubs: {
          'el-button': true,
          'el-breadcrumb': true,
          'el-breadcrumb-item': true,
          'el-tabs': true,
          'el-tab-pane': true,
          'el-loading': true
        }
      }
    })

    expect(footerWrapper.find('.center-footer').exists()).toBe(true)
    expect(footerWrapper.find('.footer-content').exists()).toBe(true)
    footerWrapper.unmount()
  })

  it('触发创建事件', async () => {
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('create')).toBeTruthy()
  })

  it('处理空标签页数组', async () => {
    const emptyTabsWrapper = mount(CenterContainer, {
      props: {
        title: '测试中心',
        tabs: [],
        showHeader: true
      },
      global: {
        plugins: [i18n, router],
        stubs: {
          'el-button': true,
          'el-breadcrumb': true,
          'el-breadcrumb-item': true,
          'el-tabs': true,
          'el-tab-pane': true,
          'el-loading': true
        }
      }
    })

    expect(emptyTabsWrapper.vm.activeTab).toBe('')
    expect(emptyTabsWrapper.find('.center-tabs').exists()).toBe(false)
    emptyTabsWrapper.unmount()
  })

  it('处理无效的标签页键', async () => {
    const invalidTabsWrapper = mount(CenterContainer, {
      props: {
        title: '测试中心',
        tabs: mockTabs,
        defaultTab: 'invalid',
        showHeader: true
      },
      global: {
        plugins: [i18n, router],
        stubs: {
          'el-button': true,
          'el-breadcrumb': true,
          'el-breadcrumb-item': true,
          'el-tabs': true,
          'el-tab-pane': true,
          'el-loading': true
        }
      }
    })

    await invalidTabsWrapper.vm.$nextTick()
    expect(invalidTabsWrapper.vm.activeTab).toBe('overview')
    invalidTabsWrapper.unmount()
  })
})