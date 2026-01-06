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
import PageContainer from '@/components/layout/PageContainer.vue'

// 模拟Element Plus组件
const mockComponents = {
  'el-skeleton': {
    template: '<div class="mock-skeleton">Skeleton Loading</div>',
    props: ['rows', 'animated']
  },
  'el-empty': {
    template: '<div class="mock-empty"><slot name="image" /><slot /></div>',
    props: ['description', 'imageSize']
  },
  'el-icon': {
    template: '<div class="mock-icon"><slot /></div>'
  },
  'el-button': {
    template: '<button class="mock-button"><slot /></button>',
    props: ['type']
  }
}

describe('PageContainer.vue', () => {
  const createWrapper = (props = {}, slots = {}) => {
    return mount(PageContainer, {
      props: {
        ...props
      },
      slots: {
        ...slots
      },
      global: {
        stubs: mockComponents,
        components: {
          WarningFilled: {
            template: '<div class="warning-icon">Warning</div>'
          }
        }
      }
    })
  }

  it('组件渲染正确', () => {
    const wrapper = createWrapper()
    
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.page-container').exists()).toBe(true)
  })

  it('正确显示页面头部插槽内容', () => {
    const wrapper = createWrapper({}, {
      header: '<div class="test-header">页面头部</div>'
    })
    
    const header = wrapper.find('.page-header')
    expect(header.exists()).toBe(true)
    expect(header.find('.test-header').exists()).toBe(true)
    expect(header.find('.test-header').text()).toBe('页面头部')
  })

  it('正确显示侧边栏插槽内容', () => {
    const wrapper = createWrapper({
      hasSidebar: true
    }, {
      sidebar: '<div class="test-sidebar">侧边栏内容</div>'
    })
    
    const sidebar = wrapper.find('.page-sidebar')
    expect(sidebar.exists()).toBe(true)
    expect(sidebar.find('.test-sidebar').exists()).toBe(true)
    expect(sidebar.find('.test-sidebar').text()).toBe('侧边栏内容')
  })

  it('正确显示面包屑插槽内容', () => {
    const wrapper = createWrapper({}, {
      breadcrumb: '<div class="test-breadcrumb">面包屑导航</div>'
    })
    
    const breadcrumb = wrapper.find('.page-breadcrumb')
    expect(breadcrumb.exists()).toBe(true)
    expect(breadcrumb.find('.test-breadcrumb').exists()).toBe(true)
    expect(breadcrumb.find('.test-breadcrumb').text()).toBe('面包屑导航')
  })

  it('正确显示页面标题', () => {
    const wrapper = createWrapper({
      title: '测试页面标题'
    })
    
    const title = wrapper.find('.page-title')
    expect(title.exists()).toBe(true)
    expect(title.text()).toBe('测试页面标题')
  })

  it('优先使用标题插槽而非props标题', () => {
    const wrapper = createWrapper({
      title: 'Props标题'
    }, {
      title: '<div class="slot-title">插槽标题</div>'
    })
    
    const titleSection = wrapper.find('.page-title-section')
    expect(titleSection.find('.page-title').exists()).toBe(false)
    expect(titleSection.find('.slot-title').exists()).toBe(true)
    expect(titleSection.find('.slot-title').text()).toBe('插槽标题')
  })

  it('正确显示页面描述', () => {
    const wrapper = createWrapper({
      description: '这是页面描述内容'
    })
    
    const description = wrapper.find('.page-description')
    expect(description.exists()).toBe(true)
    expect(description.find('p').text()).toBe('这是页面描述内容')
  })

  it('优先使用描述插槽而非props描述', () => {
    const wrapper = createWrapper({
      description: 'Props描述'
    }, {
      description: '<div class="slot-description">插槽描述</div>'
    })
    
    const description = wrapper.find('.page-description')
    expect(description.find('p').exists()).toBe(false)
    expect(description.find('.slot-description').exists()).toBe(true)
    expect(description.find('.slot-description').text()).toBe('插槽描述')
  })

  it('正确显示操作按钮插槽内容', () => {
    const wrapper = createWrapper({}, {
      actions: '<button class="test-action">操作按钮</button>'
    })
    
    const actions = wrapper.find('.page-actions')
    expect(actions.exists()).toBe(true)
    expect(actions.find('.test-action').exists()).toBe(true)
    expect(actions.find('.test-action').text()).toBe('操作按钮')
  })

  it('正确显示工具栏插槽内容', () => {
    const wrapper = createWrapper({}, {
      toolbar: '<div class="test-toolbar">工具栏</div>'
    })
    
    const toolbar = wrapper.find('.page-toolbar')
    expect(toolbar.exists()).toBe(true)
    expect(toolbar.find('.test-toolbar').exists()).toBe(true)
    expect(toolbar.find('.test-toolbar').text()).toBe('工具栏')
  })

  it('正确显示页面底部插槽内容', () => {
    const wrapper = createWrapper({}, {
      footer: '<div class="test-footer">页面底部</div>'
    })
    
    const footer = wrapper.find('.page-footer')
    expect(footer.exists()).toBe(true)
    expect(footer.find('.test-footer').exists()).toBe(true)
    expect(footer.find('.test-footer').text()).toBe('页面底部')
  })

  it('正确显示浮动操作按钮插槽内容', () => {
    const wrapper = createWrapper({}, {
      fab: '<button class="test-fab">浮动按钮</button>'
    })
    
    const fab = wrapper.find('.page-fab')
    expect(fab.exists()).toBe(true)
    expect(fab.find('.test-fab').exists()).toBe(true)
    expect(fab.find('.test-fab').text()).toBe('浮动按钮')
  })

  it('正确显示默认插槽内容', () => {
    const wrapper = createWrapper({}, {
      default: '<div class="test-content">主要页面内容</div>'
    })
    
    const content = wrapper.find('.page-content-wrapper')
    expect(content.exists()).toBe(true)
    expect(content.find('.test-content').exists()).toBe(true)
    expect(content.find('.test-content').text()).toBe('主要页面内容')
  })

  it('加载状态时显示骨架屏', () => {
    const wrapper = createWrapper({
      loading: true
    }, {
      default: '<div class="test-content">页面内容</div>'
    })
    
    const loading = wrapper.find('.page-loading')
    expect(loading.exists()).toBe(true)
    expect(loading.find('.mock-skeleton').exists()).toBe(true)
    
    const content = wrapper.find('.page-content-wrapper')
    expect(content.exists()).toBe(false)
  })

  it('错误状态时显示错误提示', () => {
    const wrapper = createWrapper({
      error: '加载失败，请重试'
    }, {
      default: '<div class="test-content">页面内容</div>'
    })
    
    const error = wrapper.find('.page-error')
    expect(error.exists()).toBe(true)
    expect(error.find('.mock-empty').exists()).toBe(true)
    expect(error.text()).toContain('加载失败，请重试')
    
    const content = wrapper.find('.page-content-wrapper')
    expect(content.exists()).toBe(false)
  })

  it('错误状态时显示重试按钮', () => {
    const onRetry = vi.fn()
    const wrapper = createWrapper({
      error: '加载失败',
      onRetry
    })
    
    const retryButton = wrapper.find('.mock-button')
    expect(retryButton.exists()).toBe(true)
    expect(retryButton.text()).toBe('重试')
    
    retryButton.trigger('click')
    expect(onRetry).toHaveBeenCalled()
  })

  it('没有错误时不显示重试按钮', () => {
    const wrapper = createWrapper({
      error: '加载失败'
      // 不提供onRetry
    })
    
    const retryButton = wrapper.find('.mock-button')
    expect(retryButton.exists()).toBe(false)
  })

  it('正确应用容器类名', () => {
    const wrapper = createWrapper({
      containerClass: 'custom-container-class'
    })
    
    const container = wrapper.find('.page-container')
    expect(container.classes()).toContain('custom-container-class')
  })

  it('正确应用数组形式的容器类名', () => {
    const wrapper = createWrapper({
      containerClass: ['class1', 'class2']
    })
    
    const container = wrapper.find('.page-container')
    expect(container.classes()).toContain('class1')
    expect(container.classes()).toContain('class2')
  })

  it('加载状态时应用is-loading类', () => {
    const wrapper = createWrapper({
      loading: true
    })
    
    const container = wrapper.find('.page-container')
    expect(container.classes()).toContain('is-loading')
  })

  it('有侧边栏时应用has-sidebar类', () => {
    const wrapper = createWrapper({
      hasSidebar: true
    })
    
    const container = wrapper.find('.page-container')
    expect(container.classes()).toContain('has-sidebar')
  })

  it('流式布局时应用is-fluid类', () => {
    const wrapper = createWrapper({
      fluid: true
    })
    
    const container = wrapper.find('.page-container')
    expect(container.classes()).toContain('is-fluid')
  })

  it('居中布局时应用is-centered类', () => {
    const wrapper = createWrapper({
      centered: true
    })
    
    const container = wrapper.find('.page-container')
    expect(container.classes()).toContain('is-centered')
  })

  it('显示内边距时应用with-padding类', () => {
    const wrapper = createWrapper({
      padding: true
    })
    
    const main = wrapper.find('.page-main')
    expect(main.classes()).toContain('with-padding')
  })

  it('不显示内边距时不应用with-padding类', () => {
    const wrapper = createWrapper({
      padding: false
    })
    
    const main = wrapper.find('.page-main')
    expect(main.classes()).not.toContain('with-padding')
  })

  it('正确设置骨架屏行数', () => {
    const wrapper = createWrapper({
      loading: true,
      skeletonRows: 5
    })
    
    const skeleton = wrapper.findComponent({ name: 'el-skeleton' })
    expect(skeleton.props('rows')).toBe(5)
  })

  it('使用默认骨架屏行数', () => {
    const wrapper = createWrapper({
      loading: true
    })
    
    const skeleton = wrapper.findComponent({ name: 'el-skeleton' })
    expect(skeleton.props('rows')).toBe(10) // 默认值
  })

  it('正确处理默认props值', () => {
    const wrapper = createWrapper()
    
    expect(wrapper.props('loading')).toBe(false)
    expect(wrapper.props('hasSidebar')).toBe(false)
    expect(wrapper.props('fluid')).toBe(false)
    expect(wrapper.props('centered')).toBe(false)
    expect(wrapper.props('padding')).toBe(true)
    expect(wrapper.props('skeletonRows')).toBe(10)
  })

  it('组件样式应用正确', () => {
    const wrapper = createWrapper()
    
    const container = wrapper.find('.page-container')
    expect(container.classes()).toContain('page-container')
    
    const main = wrapper.find('.page-main')
    expect(main.classes()).toContain('page-main')
    
    const content = wrapper.find('.page-content')
    expect(content.classes()).toContain('page-content')
  })

  it('正确显示警告图标', () => {
    const wrapper = createWrapper({
      error: '错误信息'
    })
    
    const warningIcon = wrapper.findComponent({ name: 'WarningFilled' })
    expect(warningIcon.exists()).toBe(true)
  })

  it('页面内容区域结构正确', () => {
    const wrapper = createWrapper({}, {
      default: '<div class="test-content">内容</div>'
    })
    
    const main = wrapper.find('.page-main')
    const content = wrapper.find('.page-content')
    const body = wrapper.find('.page-body')
    const contentWrapper = wrapper.find('.page-content-wrapper')
    
    expect(main.exists()).toBe(true)
    expect(content.exists()).toBe(true)
    expect(body.exists()).toBe(true)
    expect(contentWrapper.exists()).toBe(true)
    
    expect(contentWrapper.find('.test-content').exists()).toBe(true)
  })
})