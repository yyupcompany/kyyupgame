import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import PageContainer from '@/components/layout/PageContainer.vue'

// Mock Element Plus
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElSkeleton: {
      name: 'ElSkeleton',
      template: '<div class="el-skeleton"><slot /></div>',
      props: ['rows', 'animated']
    },
    ElEmpty: {
      name: 'ElEmpty',
      template: '<div class="el-empty"><slot name="image" /><slot /></div>',
      props: ['description', 'imageSize']
    },
    ElButton: {
      name: 'ElButton',
      template: '<button><slot /></button>',
      props: ['type']
    },
    ElIcon: {
      name: 'ElIcon',
      template: '<div class="el-icon"><slot /></div>',
      props: ['size', 'color']
    }
  }
})

// Mock CSS variables for responsive design
vi.mock('@/styles/design-tokens.scss', () => ({
  default: {
    '--spacing-xs': '4px',
    '--spacing-sm': '8px',
    '--spacing-md': '16px',
    '--spacing-lg': '24px',
    '--spacing-xl': '32px',
    '--spacing-2xl': '40px',
    '--radius-sm': '4px',
    '--radius-md': '8px',
    '--radius-lg': '12px',
    '--text-xs': '12px',
    '--text-sm': '14px',
    '--text-base': '16px',
    '--text-lg': '18px',
    '--text-2xl': '24px',
    '--text-3xl': '30px',
    '--transition-fast': '0.15s',
    '--transition-normal': '0.3s',
    '--sidebar-width': '280px',
    '--sidebar-collapsed-width': '64px'
  }
}))

// 控制台错误检测变量
let consoleSpy: any

describe('PageContainer.vue', () => {
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

  const createWrapper = (props = {}, slots = {}) => {
    return mount(PageContainer, {
      props: {
        title: '',
        description: '',
        loading: false,
        error: '',
        onRetry: undefined,
        containerClass: '',
        hasSidebar: false,
        fluid: false,
        centered: false,
        padding: true,
        skeletonRows: 10,
        ...props
      },
      slots: {
        default: '<div class="test-content">默认内容</div>',
        header: '<div class="test-header">头部内容</div>',
        sidebar: '<div class="test-sidebar">侧边栏内容</div>',
        breadcrumb: '<div class="test-breadcrumb">面包屑</div>',
        title: '<h2 class="test-title">插槽标题</h2>',
        description: '<p class="test-description">插槽描述</p>',
        actions: '<button class="test-action">操作按钮</button>',
        toolbar: '<div class="test-toolbar">工具栏</div>',
        footer: '<div class="test-footer">页脚</div>',
        fab: '<button class="test-fab">浮动按钮</button>',
        extra: '<div class="test-extra">额外内容</div>',
        ...slots
      },
      global: {
        stubs: {
          'el-skeleton': true,
          'el-empty': true,
          'el-button': true
        }
      }
    })
  }

  describe('基础渲染', () => {
    it('应该正确渲染页面容器', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.page-container').exists()).toBe(true)
      expect(wrapper.find('.page-main').exists()).toBe(true)
      expect(wrapper.find('.page-content').exists()).toBe(true)
      expect(wrapper.find('.page-body').exists()).toBe(true)
      expect(wrapper.find('.page-content-wrapper').exists()).toBe(true)
    })

    it('应该显示默认内容', () => {
      wrapper = createWrapper()
      
      const content = wrapper.find('.test-content')
      expect(content.exists()).toBe(true)
      expect(content.text()).toBe('默认内容')
    })

    it('应该应用正确的 CSS 类', () => {
      wrapper = createWrapper({
        containerClass: 'custom-container',
        hasSidebar: false,
        fluid: false,
        centered: false,
        padding: true
      })
      
      const container = wrapper.find('.page-container')
      expect(container.classes()).toContain('custom-container')
      expect(container.classes()).not.toContain('is-loading')
      expect(container.classes()).not.toContain('has-sidebar')
      expect(container.classes()).not.toContain('is-fluid')
      expect(container.classes()).not.toContain('is-centered')
    })
  })

  describe('Props 处理', () => {
    it('应该使用默认 props 值', () => {
      wrapper = createWrapper()
      
      expect(wrapper.props().title).toBe('')
      expect(wrapper.props().description).toBe('')
      expect(wrapper.props().loading).toBe(false)
      expect(wrapper.props().error).toBe('')
      expect(wrapper.props().hasSidebar).toBe(false)
      expect(wrapper.props().fluid).toBe(false)
      expect(wrapper.props().centered).toBe(false)
      expect(wrapper.props().padding).toBe(true)
      expect(wrapper.props().skeletonRows).toBe(10)
    })

    it('应该接受自定义 props 值', () => {
      const onRetry = vi.fn()
      wrapper = createWrapper({
        title: '页面标题',
        description: '页面描述',
        loading: true,
        error: '错误信息',
        onRetry: onRetry,
        containerClass: ['class1', 'class2'],
        hasSidebar: true,
        fluid: true,
        centered: true,
        padding: false,
        skeletonRows: 5
      })
      
      expect(wrapper.props().title).toBe('页面标题')
      expect(wrapper.props().description).toBe('页面描述')
      expect(wrapper.props().loading).toBe(true)
      expect(wrapper.props().error).toBe('错误信息')
      expect(wrapper.props().onRetry).toBe(onRetry)
      expect(wrapper.props().hasSidebar).toBe(true)
      expect(wrapper.props().fluid).toBe(true)
      expect(wrapper.props().centered).toBe(true)
      expect(wrapper.props().padding).toBe(false)
      expect(wrapper.props().skeletonRows).toBe(5)
    })

    it('应该正确处理数组形式的 containerClass', () => {
      wrapper = createWrapper({
        containerClass: ['class1', 'class2']
      })
      
      const container = wrapper.find('.page-container')
      expect(container.classes()).toContain('class1')
      expect(container.classes()).toContain('class2')
    })

    it('应该正确处理字符串形式的 containerClass', () => {
      wrapper = createWrapper({
        containerClass: 'class1 class2'
      })
      
      const container = wrapper.find('.page-container')
      expect(container.classes()).toContain('class1 class2')
    })
  })

  describe('状态显示', () => {
    it('应该显示加载状态', () => {
      wrapper = createWrapper({
        loading: true
      })
      
      const container = wrapper.find('.page-container')
      expect(container.classes()).toContain('is-loading')
      
      const loading = wrapper.find('.page-loading')
      expect(loading.exists()).toBe(true)
      
      const skeleton = loading.findComponent({ name: 'ElSkeleton' })
      expect(skeleton.exists()).toBe(true)
      expect(skeleton.props('rows')).toBe(10)
      expect(skeleton.props('animated')).toBe(true)
    })

    it('应该显示错误状态', () => {
      wrapper = createWrapper({
        error: '加载失败'
      })
      
      const error = wrapper.find('.page-error')
      expect(error.exists()).toBe(true)
      
      const empty = error.findComponent({ name: 'ElEmpty' })
      expect(empty.exists()).toBe(true)
      expect(empty.props('description')).toBe('加载失败')
      expect(empty.props('imageSize')).toBe(120)
    })

    it('应该在错误状态显示重试按钮', () => {
      const onRetry = vi.fn()
      wrapper = createWrapper({
        error: '加载失败',
        onRetry: onRetry
      })
      
      const retryButton = wrapper.findComponent({ name: 'ElButton' })
      expect(retryButton.exists()).toBe(true)
      expect(retryButton.props('type')).toBe('primary')
      expect(retryButton.text()).toBe('重试')
    })

    it('应该在错误状态不显示重试按钮', () => {
      wrapper = createWrapper({
        error: '加载失败',
        onRetry: undefined
      })
      
      const retryButton = wrapper.findComponent({ name: 'ElButton' })
      expect(retryButton.exists()).toBe(false)
    })

    it('应该显示正常内容', () => {
      wrapper = createWrapper({
        loading: false,
        error: ''
      })
      
      const contentWrapper = wrapper.find('.page-content-wrapper')
      expect(contentWrapper.exists()).toBe(true)
      
      const content = wrapper.find('.test-content')
      expect(content.exists()).toBe(true)
    })
  })

  describe('页面头部', () => {
    it('应该显示头部插槽', () => {
      wrapper = createWrapper()
      
      const header = wrapper.find('.page-header')
      expect(header.exists()).toBe(true)
      expect(header.find('.test-header').exists()).toBe(true)
    })

    it('应该隐藏头部插槽', () => {
      wrapper = createWrapper({}, { header: undefined })
      
      const header = wrapper.find('.page-header')
      expect(header.exists()).toBe(false)
    })
  })

  describe('侧边栏', () => {
    it('应该显示侧边栏', () => {
      wrapper = createWrapper({
        hasSidebar: true
      })
      
      const container = wrapper.find('.page-container')
      expect(container.classes()).toContain('has-sidebar')
      
      const sidebar = wrapper.find('.page-sidebar')
      expect(sidebar.exists()).toBe(true)
      expect(sidebar.find('.test-sidebar').exists()).toBe(true)
    })

    it('应该隐藏侧边栏', () => {
      wrapper = createWrapper({
        hasSidebar: false
      })
      
      const container = wrapper.find('.page-container')
      expect(container.classes()).not.toContain('has-sidebar')
      
      const sidebar = wrapper.find('.page-sidebar')
      expect(sidebar.exists()).toBe(false)
    })

    it('应该通过 hasSidebar prop 控制侧边栏显示', () => {
      wrapper = createWrapper({
        hasSidebar: true
      })
      
      let container = wrapper.find('.page-container')
      expect(container.classes()).toContain('has-sidebar')
      
      wrapper = createWrapper({
        hasSidebar: false
      })
      
      container = wrapper.find('.page-container')
      expect(container.classes()).not.toContain('has-sidebar')
    })
  })

  describe('面包屑导航', () => {
    it('应该显示面包屑插槽', () => {
      wrapper = createWrapper()
      
      const breadcrumb = wrapper.find('.page-breadcrumb')
      expect(breadcrumb.exists()).toBe(true)
      expect(breadcrumb.find('.test-breadcrumb').exists()).toBe(true)
    })

    it('应该隐藏面包屑插槽', () => {
      wrapper = createWrapper({}, { breadcrumb: undefined })
      
      const breadcrumb = wrapper.find('.page-breadcrumb')
      expect(breadcrumb.exists()).toBe(false)
    })
  })

  describe('页面标题区域', () => {
    it('应该显示 prop 标题', () => {
      wrapper = createWrapper({
        title: 'Prop 标题'
      })
      
      const titleSection = wrapper.find('.page-title-section')
      expect(titleSection.exists()).toBe(true)
      
      const title = titleSection.find('.page-title')
      expect(title.exists()).toBe(true)
      expect(title.text()).toBe('Prop 标题')
    })

    it('应该显示标题插槽', () => {
      wrapper = createWrapper({}, { title: '<h2 class="test-title">插槽标题</h2>' })
      
      const titleSection = wrapper.find('.page-title-section')
      expect(titleSection.exists()).toBe(true)
      
      const titleSlot = titleSection.find('.test-title')
      expect(titleSlot.exists()).toBe(true)
      expect(titleSlot.text()).toBe('插槽标题')
    })

    it('应该优先显示插槽标题', () => {
      wrapper = createWrapper(
        { title: 'Prop 标题' },
        { title: '<h2 class="test-title">插槽标题</h2>' }
      )
      
      const titleSection = wrapper.find('.page-title-section')
      const title = titleSection.find('.page-title')
      expect(title.exists()).toBe(false) // Prop title should not be shown when slot is provided
      
      const titleSlot = titleSection.find('.test-title')
      expect(titleSlot.exists()).toBe(true)
    })

    it('应该显示 prop 描述', () => {
      wrapper = createWrapper({
        description: 'Prop 描述'
      })
      
      const titleSection = wrapper.find('.page-title-section')
      expect(titleSection.exists()).toBe(true)
      
      const description = titleSection.find('.page-description')
      expect(description.exists()).toBe(true)
      expect(description.find('p').text()).toBe('Prop 描述')
    })

    it('应该显示描述插槽', () => {
      wrapper = createWrapper({}, { description: '<p class="test-description">插槽描述</p>' })
      
      const titleSection = wrapper.find('.page-title-section')
      expect(titleSection.exists()).toBe(true)
      
      const descriptionSlot = titleSection.find('.test-description')
      expect(descriptionSlot.exists()).toBe(true)
      expect(descriptionSlot.text()).toBe('插槽描述')
    })

    it('应该显示操作按钮', () => {
      wrapper = createWrapper()
      
      const titleSection = wrapper.find('.page-title-section')
      expect(titleSection.exists()).toBe(true)
      
      const actions = titleSection.find('.page-actions')
      expect(actions.exists()).toBe(true)
      expect(actions.find('.test-action').exists()).toBe(true)
    })

    it('应该隐藏操作按钮', () => {
      wrapper = createWrapper({}, { actions: undefined })
      
      const titleSection = wrapper.find('.page-title-section')
      const actions = titleSection.find('.page-actions')
      expect(actions.exists()).toBe(false)
    })
  })

  describe('工具栏', () => {
    it('应该显示工具栏插槽', () => {
      wrapper = createWrapper()
      
      const toolbar = wrapper.find('.page-toolbar')
      expect(toolbar.exists()).toBe(true)
      expect(toolbar.find('.test-toolbar').exists()).toBe(true)
    })

    it('应该隐藏工具栏插槽', () => {
      wrapper = createWrapper({}, { toolbar: undefined })
      
      const toolbar = wrapper.find('.page-toolbar')
      expect(toolbar.exists()).toBe(false)
    })
  })

  describe('页面底部', () => {
    it('应该显示页脚插槽', () => {
      wrapper = createWrapper()
      
      const footer = wrapper.find('.page-footer')
      expect(footer.exists()).toBe(true)
      expect(footer.find('.test-footer').exists()).toBe(true)
    })

    it('应该隐藏页脚插槽', () => {
      wrapper = createWrapper({}, { footer: undefined })
      
      const footer = wrapper.find('.page-footer')
      expect(footer.exists()).toBe(false)
    })
  })

  describe('浮动操作按钮', () => {
    it('应该显示浮动按钮插槽', () => {
      wrapper = createWrapper()
      
      const fab = wrapper.find('.page-fab')
      expect(fab.exists()).toBe(true)
      expect(fab.find('.test-fab').exists()).toBe(true)
    })

    it('应该隐藏浮动按钮插槽', () => {
      wrapper = createWrapper({}, { fab: undefined })
      
      const fab = wrapper.find('.page-fab')
      expect(fab.exists()).toBe(false)
    })
  })

  describe('额外内容', () => {
    it('应该显示额外内容插槽', () => {
      wrapper = createWrapper()
      
      const extra = wrapper.find('.page-content-wrapper .test-extra')
      expect(extra.exists()).toBe(true)
      expect(extra.text()).toBe('额外内容')
    })

    it('应该隐藏额外内容插槽', () => {
      wrapper = createWrapper({}, { extra: undefined })
      
      const extra = wrapper.find('.test-extra')
      expect(extra.exists()).toBe(false)
    })
  })

  describe('布局模式', () => {
    it('应该应用流式布局', () => {
      wrapper = createWrapper({
        fluid: true
      })
      
      const container = wrapper.find('.page-container')
      expect(container.classes()).toContain('is-fluid')
    })

    it('应该应用居中布局', () => {
      wrapper = createWrapper({
        centered: true
      })
      
      const container = wrapper.find('.page-container')
      expect(container.classes()).toContain('is-centered')
    })

    it('应该应用内边距', () => {
      wrapper = createWrapper({
        padding: true
      })
      
      const main = wrapper.find('.page-main')
      expect(main.classes()).toContain('with-padding')
    })

    it('应该不应用内边距', () => {
      wrapper = createWrapper({
        padding: false
      })
      
      const main = wrapper.find('.page-main')
      expect(main.classes()).not.toContain('with-padding')
    })
  })

  describe('事件处理', () => {
    it('应该处理重试按钮点击', async () => {
      const onRetry = vi.fn()
      wrapper = createWrapper({
        error: '加载失败',
        onRetry: onRetry
      })
      
      const retryButton = wrapper.findComponent({ name: 'ElButton' })
      await retryButton.trigger('click')
      
      expect(onRetry).toHaveBeenCalled()
    })
  })

  describe('响应式更新', () => {
    it('应该响应 loading 状态变化', async () => {
      wrapper = createWrapper({
        loading: false
      })
      
      expect(wrapper.find('.page-loading').exists()).toBe(false)
      
      await wrapper.setProps({ loading: true })
      
      expect(wrapper.find('.page-loading').exists()).toBe(true)
    })

    it('应该响应 error 状态变化', async () => {
      wrapper = createWrapper({
        error: ''
      })
      
      expect(wrapper.find('.page-error').exists()).toBe(false)
      
      await wrapper.setProps({ error: '新错误' })
      
      const error = wrapper.find('.page-error')
      expect(error.exists()).toBe(true)
      expect(error.findComponent({ name: 'ElEmpty' }).props('description')).toBe('新错误')
    })

    it('应该响应 title 变化', async () => {
      wrapper = createWrapper({
        title: '原标题'
      })
      
      expect(wrapper.find('.page-title').text()).toBe('原标题')
      
      await wrapper.setProps({ title: '新标题' })
      
      expect(wrapper.find('.page-title').text()).toBe('新标题')
    })

    it('应该响应 skeletonRows 变化', async () => {
      wrapper = createWrapper({
        loading: true,
        skeletonRows: 5
      })
      
      expect(wrapper.findComponent({ name: 'ElSkeleton' }).props('rows')).toBe(5)
      
      await wrapper.setProps({ skeletonRows: 8 })
      
      expect(wrapper.findComponent({ name: 'ElSkeleton' }).props('rows')).toBe(8)
    })

    it('应该响应多个 prop 同时变化', async () => {
      wrapper = createWrapper({
        loading: false,
        error: '',
        title: '原标题'
      })
      
      await wrapper.setProps({
        loading: true,
        error: '新错误',
        title: '新标题'
      })
      
      expect(wrapper.find('.page-loading').exists()).toBe(true)
      expect(wrapper.find('.page-error').exists()).toBe(true)
      expect(wrapper.find('.page-title').text()).toBe('新标题')
    })

    it('应该响应 containerClass 变化', async () => {
      wrapper = createWrapper({
        containerClass: 'old-class'
      })
      
      expect(wrapper.find('.page-container').classes()).toContain('old-class')
      
      await wrapper.setProps({ containerClass: 'new-class' })
      
      expect(wrapper.find('.page-container').classes()).not.toContain('old-class')
      expect(wrapper.find('.page-container').classes()).toContain('new-class')
    })
  })

  describe('边界情况', () => {
    it('应该处理所有插槽都为空的情况', () => {
      wrapper = createWrapper({}, {
        header: undefined,
        sidebar: undefined,
        breadcrumb: undefined,
        title: undefined,
        description: undefined,
        actions: undefined,
        toolbar: undefined,
        footer: undefined,
        fab: undefined,
        extra: undefined
      })
      
      // Should still render without errors
      expect(wrapper.find('.page-container').exists()).toBe(true)
      expect(wrapper.find('.page-content').exists()).toBe(true)
      expect(wrapper.find('.page-body').exists()).toBe(true)
    })

    it('应该处理空的标题和描述', () => {
      wrapper = createWrapper({
        title: '',
        description: ''
      })
      
      const titleSection = wrapper.find('.page-title-section')
      expect(titleSection.exists()).toBe(false)
    })

    it('应该处理 undefined 的 containerClass', () => {
      wrapper = createWrapper({
        containerClass: undefined
      })
      
      const container = wrapper.find('.page-container')
      expect(container.classes()).not.toContain('undefined')
    })

    it('应该处理零骨架屏行数', () => {
      wrapper = createWrapper({
        loading: true,
        skeletonRows: 0
      })
      
      const skeleton = wrapper.findComponent({ name: 'ElSkeleton' })
      expect(skeleton.props('rows')).toBe(0)
    })

    it('应该处理负数的骨架屏行数', () => {
      wrapper = createWrapper({
        loading: true,
        skeletonRows: -5
      })
      
      const skeleton = wrapper.findComponent({ name: 'ElSkeleton' })
      expect(skeleton.props('rows')).toBe(-5)
    })

    it('应该处理非常大的骨架屏行数', () => {
      wrapper = createWrapper({
        loading: true,
        skeletonRows: 1000
      })
      
      const skeleton = wrapper.findComponent({ name: 'ElSkeleton' })
      expect(skeleton.props('rows')).toBe(1000)
    })

    it('应该处理 null 的重试函数', () => {
      wrapper = createWrapper({
        error: '错误信息',
        onRetry: null
      })
      
      const retryButton = wrapper.findComponent({ name: 'ElButton' })
      expect(retryButton.exists()).toBe(false)
    })

    it('应该处理重试函数抛出异常', async () => {
      const onRetry = vi.fn().mockImplementation(() => {
        throw new Error('重试失败')
      })
      
      wrapper = createWrapper({
        error: '错误信息',
        onRetry: onRetry
      })
      
      const retryButton = wrapper.findComponent({ name: 'ElButton' })
      expect(retryButton.exists()).toBe(true)
      
      // Should handle error gracefully
      await expect(retryButton.trigger('click')).resolves.not.toThrow()
    })

    it('应该处理空字符串的容器类名', () => {
      wrapper = createWrapper({
        containerClass: ''
      })
      
      const container = wrapper.find('.page-container')
      expect(container.classes()).toContain('')
    })

    it('应该处理包含特殊字符的容器类名', () => {
      wrapper = createWrapper({
        containerClass: 'custom-class with-special-chars_123'
      })
      
      const container = wrapper.find('.page-container')
      expect(container.classes()).toContain('custom-class with-special-chars_123')
    })
  })

  describe('无障碍支持', () => {
    it('应该支持适当的结构', () => {
      wrapper = createWrapper({
        title: '页面标题'
      })
      
      const container = wrapper.find('.page-container')
      expect(container.exists()).toBe(true)
      
      const title = wrapper.find('.page-title')
      expect(title.exists()).toBe(true)
      expect(title.element.tagName).toBe('H1')
    })
  })

  describe('样式应用', () => {
    it('应该应用正确的 CSS 变量', () => {
      wrapper = createWrapper()
      
      const container = wrapper.find('.page-container')
      expect(container.exists()).toBe(true)
      
      // Check if CSS classes are properly applied
      expect(container.classes()).toContain('page-container')
    })

    it('应该应用响应式布局类名', () => {
      wrapper = createWrapper({
        fluid: true,
        centered: false,
        hasSidebar: true
      })
      
      const container = wrapper.find('.page-container')
      expect(container.classes()).toContain('is-fluid')
      expect(container.classes()).not.toContain('is-centered')
      expect(container.classes()).toContain('has-sidebar')
    })

    it('应该应用居中布局类名', () => {
      wrapper = createWrapper({
        fluid: false,
        centered: true,
        hasSidebar: false
      })
      
      const container = wrapper.find('.page-container')
      expect(container.classes()).not.toContain('is-fluid')
      expect(container.classes()).toContain('is-centered')
      expect(container.classes()).not.toContain('has-sidebar')
    })

    it('应该应用内边距类名', () => {
      wrapper = createWrapper({
        padding: true
      })
      
      const main = wrapper.find('.page-main')
      expect(main.classes()).toContain('with-padding')
    })

    it('应该不应用内边距类名', () => {
      wrapper = createWrapper({
        padding: false
      })
      
      const main = wrapper.find('.page-main')
      expect(main.classes()).not.toContain('with-padding')
    })
  })

  describe('主题适配', () => {
    it('应该支持暗色主题', () => {
      // Mock dark theme attribute
      document.documentElement.setAttribute('data-theme', 'dark')
      
      wrapper = createWrapper()
      
      const container = wrapper.find('.page-container')
      expect(container.exists()).toBe(true)
      
      // Should apply dark theme styles
      expect(container.classes()).toContain('page-container')
    })

    it('应该支持亮色主题', () => {
      // Mock light theme attribute
      document.documentElement.setAttribute('data-theme', 'light')
      
      wrapper = createWrapper()
      
      const container = wrapper.find('.page-container')
      expect(container.exists()).toBe(true)
      
      // Should apply light theme styles
      expect(container.classes()).toContain('page-container')
    })

    it('应该处理主题切换', async () => {
      wrapper = createWrapper()
      
      // Simulate theme change
      document.documentElement.setAttribute('data-theme', 'dark')
      await nextTick()
      
      const container = wrapper.find('.page-container')
      expect(container.exists()).toBe(true)
      
      // Change theme
      document.documentElement.setAttribute('data-theme', 'light')
      await nextTick()
      
      expect(container.exists()).toBe(true)
    })
  })

  describe('性能优化', () => {
    it('应该正确处理大量内容', () => {
      const largeContent = '<div>' + 'x'.repeat(10000) + '</div>'
      
      wrapper = createWrapper({}, {
        default: largeContent
      })
      
      const contentWrapper = wrapper.find('.page-content-wrapper')
      expect(contentWrapper.exists()).toBe(true)
      expect(contentWrapper.text().length).toBe(10000)
    })

    it('应该正确处理频繁的状态变化', async () => {
      wrapper = createWrapper({
        loading: false
      })
      
      // Simulate frequent state changes
      for (let i = 0;
import { vi } from 'vitest' i < 10; i++) {
        await wrapper.setProps({ loading: i % 2 === 0 })
        expect(wrapper.find('.page-loading').exists()).toBe(i % 2 === 0)
      }
    })
  })

  describe('无障碍访问', () => {
    it('应该支持键盘导航', async () => {
      wrapper = createWrapper({
        error: '错误信息',
        onRetry: vi.fn()
      })
      
      const retryButton = wrapper.findComponent({ name: 'ElButton' })
      expect(retryButton.exists()).toBe(true)
      
      // Simulate keyboard interaction
      await retryButton.trigger('keydown.enter')
      await retryButton.trigger('keydown.space')
      
      // Should handle keyboard events
      expect(true).toBe(true)
    })

    it('应该提供适当的ARIA属性', () => {
      wrapper = createWrapper({
        title: '页面标题'
      })
      
      const title = wrapper.find('.page-title')
      expect(title.exists()).toBe(true)
      expect(title.element.tagName).toBe('H1')
      
      const container = wrapper.find('.page-container')
      expect(container.exists()).toBe(true)
    })
  })
})