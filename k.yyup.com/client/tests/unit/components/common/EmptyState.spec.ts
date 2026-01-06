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
import { nextTick } from 'vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ElementPlus from 'element-plus'

// Mock Element Plus icons
vi.mock('@element-plus/icons-vue', () => ({
  House: { template: '<div>HouseIcon</div>' },
  Warning: { template: '<div>WarningIcon</div>' },
  InfoFilled: { template: '<div>InfoFilledIcon</div>' }
}))

describe('EmptyState.vue', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createWrapper = (props: any = {}, slots: any = {}) => {
    return mount(EmptyState, {
      props: {
        type: 'no-data',
        size: 'medium',
        centered: true,
        showIllustration: false,
        showSuggestions: false,
        extraActions: [],
        ...props
      },
      slots: {
        ...slots
      },
      global: {
        plugins: [ElementPlus],
        stubs: {
          'el-button': true,
          'el-icon': true
        }
      }
    })
  }

  describe('组件渲染测试', () => {
    it('应该正确渲染空状态组件', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.empty-state').exists()).toBe(true)
      expect(wrapper.find('.empty-state__content').exists()).toBe(true)
      expect(wrapper.find('.empty-state__icon').exists()).toBe(true)
    })

    it('应该显示内置图标', () => {
      wrapper = createWrapper({ type: 'no-data' })
      
      expect(wrapper.find('.built-in-icon').exists()).toBe(true)
      expect(wrapper.find('.built-in-icon--no-data').exists()).toBe(true)
    })

    it('应该显示自定义图标', () => {
      wrapper = createWrapper({ icon: 'House' })
      
      expect(wrapper.find('.custom-icon').exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'House' })).toBeTruthy()
    })

    it('应该显示标题', () => {
      wrapper = createWrapper({ title: '暂无数据' })
      
      expect(wrapper.find('.empty-state__title').exists()).toBe(true)
      expect(wrapper.find('.empty-state__title').text()).toBe('暂无数据')
    })

    it('应该显示描述', () => {
      wrapper = createWrapper({ description: '当前没有可显示的数据' })
      
      expect(wrapper.find('.empty-state__description').exists()).toBe(true)
      expect(wrapper.find('.empty-state__description').text()).toBe('当前没有可显示的数据')
    })

    it('应该显示建议列表', () => {
      const suggestions = ['检查网络连接', '刷新页面', '联系管理员']
      wrapper = createWrapper({ 
        showSuggestions: true,
        suggestions 
      })
      
      expect(wrapper.find('.empty-state__suggestions').exists()).toBe(true)
      expect(wrapper.find('.suggestions-list').exists()).toBe(true)
      expect(wrapper.findAll('.suggestion-item')).toHaveLength(3)
    })

    it('应该显示操作按钮', () => {
      wrapper = createWrapper({
        primaryAction: { text: '刷新' },
        secondaryAction: { text: '返回' }
      })
      
      expect(wrapper.find('.empty-state__actions').exists()).toBe(true)
      expect(wrapper.findAllComponents({ name: 'ElButton' })).toHaveLength(2)
    })

    it('应该显示额外内容', () => {
      wrapper = createWrapper({}, {
        extra: '<div class="extra-content">额外内容</div>'
      })
      
      expect(wrapper.find('.empty-state__extra').exists()).toBe(true)
      expect(wrapper.find('.extra-content').exists()).toBe(true)
    })
  })

  describe('props传递测试', () => {
    it('应该正确接收type prop', () => {
      const types = ['no-data', 'no-search', 'error', 'network', 'forbidden', 'loading', 'custom', 'maintenance', 'timeout']
      
      types.forEach(type => {
        wrapper = createWrapper({ type })
        expect(wrapper.props('type')).toBe(type)
        expect(wrapper.find('.empty-state').classes()).toContain(`empty-state--${type}`)
      })
    })

    it('应该正确接收size prop', () => {
      const sizes = ['small', 'medium', 'large']
      
      sizes.forEach(size => {
        wrapper = createWrapper({ size })
        expect(wrapper.props('size')).toBe(size)
        expect(wrapper.find('.empty-state').classes()).toContain(`empty-state--${size}`)
      })
    })

    it('应该正确接收centered prop', () => {
      wrapper = createWrapper({ centered: true })
      
      expect(wrapper.props('centered')).toBe(true)
      expect(wrapper.find('.empty-state').classes()).toContain('empty-state--centered')
    })

    it('应该正确接收title prop', () => {
      wrapper = createWrapper({ title: '测试标题' })
      
      expect(wrapper.props('title')).toBe('测试标题')
    })

    it('应该正确接收description prop', () => {
      wrapper = createWrapper({ description: '测试描述' })
      
      expect(wrapper.props('description')).toBe('测试描述')
    })

    it('应该正确接收icon prop', () => {
      wrapper = createWrapper({ icon: 'House' })
      
      expect(wrapper.props('icon')).toBe('House')
    })

    it('应该正确接收primaryAction prop', () => {
      const primaryAction = { text: '主要操作', type: 'primary' }
      wrapper = createWrapper({ primaryAction })
      
      expect(wrapper.props('primaryAction')).toEqual(primaryAction)
    })

    it('应该正确接收secondaryAction prop', () => {
      const secondaryAction = { text: '次要操作', type: 'default' }
      wrapper = createWrapper({ secondaryAction })
      
      expect(wrapper.props('secondaryAction')).toEqual(secondaryAction)
    })

    it('应该正确接收extraActions prop', () => {
      const extraActions = [
        { text: '额外操作1' },
        { text: '额外操作2' }
      ]
      wrapper = createWrapper({ extraActions })
      
      expect(wrapper.props('extraActions')).toEqual(extraActions)
    })

    it('应该正确接收showSuggestions prop', () => {
      wrapper = createWrapper({ showSuggestions: true })
      
      expect(wrapper.props('showSuggestions')).toBe(true)
    })

    it('应该正确接收suggestions prop', () => {
      const suggestions = ['建议1', '建议2']
      wrapper = createWrapper({ suggestions })
      
      expect(wrapper.props('suggestions')).toEqual(suggestions)
    })

    it('应该使用默认的props值', () => {
      wrapper = createWrapper()
      
      expect(wrapper.props('type')).toBe('no-data')
      expect(wrapper.props('size')).toBe('medium')
      expect(wrapper.props('centered')).toBe(true)
      expect(wrapper.props('showIllustration')).toBe(false)
      expect(wrapper.props('showSuggestions')).toBe(false)
      expect(wrapper.props('extraActions')).toEqual([])
    })
  })

  describe('插槽测试', () => {
    it('应该使用icon插槽', () => {
      wrapper = createWrapper({}, {
        icon: '<div class="custom-icon-slot">自定义图标</div>'
      })
      
      expect(wrapper.find('.custom-icon-slot').exists()).toBe(true)
      expect(wrapper.find('.custom-icon-slot').text()).toBe('自定义图标')
    })

    it('应该使用title插槽', () => {
      wrapper = createWrapper({}, {
        title: '<div class="custom-title-slot">自定义标题</div>'
      })
      
      expect(wrapper.find('.custom-title-slot').exists()).toBe(true)
      expect(wrapper.find('.custom-title-slot').text()).toBe('自定义标题')
    })

    it('应该使用description插槽', () => {
      wrapper = createWrapper({}, {
        description: '<div class="custom-description-slot">自定义描述</div>'
      })
      
      expect(wrapper.find('.custom-description-slot').exists()).toBe(true)
      expect(wrapper.find('.custom-description-slot').text()).toBe('自定义描述')
    })

    it('应该使用actions插槽', () => {
      wrapper = createWrapper({}, {
        actions: '<div class="custom-actions-slot">自定义操作</div>'
      })
      
      expect(wrapper.find('.custom-actions-slot').exists()).toBe(true)
      expect(wrapper.find('.custom-actions-slot').text()).toBe('自定义操作')
    })

    it('应该使用extra插槽', () => {
      wrapper = createWrapper({}, {
        extra: '<div class="custom-extra-slot">自定义额外内容</div>'
      })
      
      expect(wrapper.find('.custom-extra-slot').exists()).toBe(true)
      expect(wrapper.find('.custom-extra-slot').text()).toBe('自定义额外内容')
    })
  })

  describe('计算属性测试', () => {
    it('应该计算正确的图标尺寸', () => {
      // 测试small尺寸
      wrapper = createWrapper({ size: 'small' })
      expect(wrapper.vm.iconSize).toBe(48)
      
      // 测试medium尺寸
      wrapper = createWrapper({ size: 'medium' })
      expect(wrapper.vm.iconSize).toBe(64)
      
      // 测试large尺寸
      wrapper = createWrapper({ size: 'large' })
      expect(wrapper.vm.iconSize).toBe(96)
    })

    it('应该计算正确的按钮尺寸', () => {
      // 测试small尺寸
      wrapper = createWrapper({ size: 'small' })
      expect(wrapper.vm.actionSize).toBe('small')
      
      // 测试medium尺寸
      wrapper = createWrapper({ size: 'medium' })
      expect(wrapper.vm.actionSize).toBe('default')
      
      // 测试large尺寸
      wrapper = createWrapper({ size: 'large' })
      expect(wrapper.vm.actionSize).toBe('large')
    })

    it('应该正确计算是否有操作', () => {
      // 没有操作
      wrapper = createWrapper()
      expect(wrapper.vm.hasActions).toBe(false)
      
      // 有主要操作
      wrapper = createWrapper({ primaryAction: { text: '操作' } })
      expect(wrapper.vm.hasActions).toBe(true)
      
      // 有次要操作
      wrapper = createWrapper({ secondaryAction: { text: '操作' } })
      expect(wrapper.vm.hasActions).toBe(true)
      
      // 有额外操作
      wrapper = createWrapper({ extraActions: [{ text: '操作' }] })
      expect(wrapper.vm.hasActions).toBe(true)
    })
  })

  describe('事件处理测试', () => {
    it('应该处理主要操作点击', () => {
      const primaryAction = { text: '主要操作', handler: vi.fn() }
      wrapper = createWrapper({ primaryAction })
      
      wrapper.vm.handlePrimaryAction()
      
      expect(primaryAction.handler).toHaveBeenCalled()
      expect(wrapper.emitted('primaryAction')).toBeTruthy()
    })

    it('应该处理次要操作点击', () => {
      const secondaryAction = { text: '次要操作', handler: vi.fn() }
      wrapper = createWrapper({ secondaryAction })
      
      wrapper.vm.handleSecondaryAction()
      
      expect(secondaryAction.handler).toHaveBeenCalled()
      expect(wrapper.emitted('secondaryAction')).toBeTruthy()
    })

    it('应该处理额外操作点击', () => {
      const extraActions = [{ text: '额外操作', handler: vi.fn() }]
      wrapper = createWrapper({ extraActions })
      
      wrapper.vm.handleExtraAction(0, extraActions[0])
      
      expect(extraActions[0].handler).toHaveBeenCalled()
      expect(wrapper.emitted('extraAction')).toBeTruthy()
      expect(wrapper.emitted('extraAction')[0]).toEqual([0, extraActions[0]])
    })

    it('应该处理没有handler的操作', () => {
      const primaryAction = { text: '主要操作' }
      wrapper = createWrapper({ primaryAction })
      
      wrapper.vm.handlePrimaryAction()
      
      expect(wrapper.emitted('primaryAction')).toBeTruthy()
    })
  })

  describe('不同类型图标测试', () => {
    it('应该显示no-data类型图标', () => {
      wrapper = createWrapper({ type: 'no-data' })
      
      expect(wrapper.find('.built-in-icon--no-data').exists()).toBe(true)
    })

    it('应该显示no-search类型图标', () => {
      wrapper = createWrapper({ type: 'no-search' })
      
      expect(wrapper.find('.built-in-icon--no-search').exists()).toBe(true)
    })

    it('应该显示error类型图标', () => {
      wrapper = createWrapper({ type: 'error' })
      
      expect(wrapper.find('.built-in-icon--error').exists()).toBe(true)
    })

    it('应该显示network类型图标', () => {
      wrapper = createWrapper({ type: 'network' })
      
      expect(wrapper.find('.built-in-icon--network').exists()).toBe(true)
    })

    it('应该显示forbidden类型图标', () => {
      wrapper = createWrapper({ type: 'forbidden' })
      
      expect(wrapper.find('.built-in-icon--forbidden').exists()).toBe(true)
    })

    it('应该显示loading类型图标', () => {
      wrapper = createWrapper({ type: 'loading' })
      
      expect(wrapper.find('.built-in-icon--loading').exists()).toBe(true)
    })

    it('应该显示maintenance类型图标', () => {
      wrapper = createWrapper({ type: 'maintenance' })
      
      expect(wrapper.find('.built-in-icon--maintenance').exists()).toBe(true)
    })

    it('应该显示timeout类型图标', () => {
      wrapper = createWrapper({ type: 'timeout' })
      
      expect(wrapper.find('.built-in-icon--timeout').exists()).toBe(true)
    })
  })

  describe('边界条件测试', () => {
    it('应该处理空的suggestions数组', () => {
      wrapper = createWrapper({ 
        showSuggestions: true,
        suggestions: [] 
      })
      
      expect(wrapper.find('.empty-state__suggestions').exists()).toBe(false)
    })

    it('应该处理没有showSuggestions的情况', () => {
      wrapper = createWrapper({ 
        showSuggestions: false,
        suggestions: ['建议1', '建议2'] 
      })
      
      expect(wrapper.find('.empty-state__suggestions').exists()).toBe(false)
    })

    it('应该处理空的extraActions数组', () => {
      wrapper = createWrapper({ extraActions: [] })
      
      expect(wrapper.vm.hasActions).toBe(false)
    })

    it('应该处理没有title的情况', () => {
      wrapper = createWrapper({ title: '' })
      
      expect(wrapper.find('.empty-state__title').exists()).toBe(false)
    })

    it('应该处理没有description的情况', () => {
      wrapper = createWrapper({ description: '' })
      
      expect(wrapper.find('.empty-state__description').exists()).toBe(false)
    })

    it('应该处理没有icon的情况', () => {
      wrapper = createWrapper({ icon: undefined })
      
      expect(wrapper.find('.custom-icon').exists()).toBe(false)
      expect(wrapper.find('.built-in-icon').exists()).toBe(true)
    })

    it('应该处理操作按钮的loading状态', () => {
      const primaryAction = { text: '加载中', loading: true }
      wrapper = createWrapper({ primaryAction })
      
      const button = wrapper.findAllComponents({ name: 'ElButton' })[0]
      expect(button.props('loading')).toBe(true)
    })

    it('应该处理操作按钮的disabled状态', () => {
      const primaryAction = { text: '禁用', disabled: true }
      wrapper = createWrapper({ primaryAction })
      
      const button = wrapper.findAllComponents({ name: 'ElButton' })[0]
      expect(button.props('disabled')).toBe(true)
    })
  })

  describe('样式测试', () => {
    it('应该包含正确的CSS类', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.empty-state').exists()).toBe(true)
      expect(wrapper.find('.empty-state__content').exists()).toBe(true)
      expect(wrapper.find('.empty-state__icon').exists()).toBe(true)
    })

    it('应该应用centered样式', () => {
      wrapper = createWrapper({ centered: true })
      
      expect(wrapper.find('.empty-state').classes()).toContain('empty-state--centered')
    })

    it('应该应用size样式', () => {
      wrapper = createWrapper({ size: 'small' })
      
      expect(wrapper.find('.empty-state').classes()).toContain('empty-state--small')
    })

    it('应该应用type样式', () => {
      wrapper = createWrapper({ type: 'error' })
      
      expect(wrapper.find('.empty-state').classes()).toContain('empty-state--error')
    })

    it('应该应用内置图标的颜色样式', () => {
      wrapper = createWrapper({ type: 'error' })
      
      expect(wrapper.find('.built-in-icon--error').exists()).toBe(true)
    })

    it('应该显示建议列表的正确样式', () => {
      wrapper = createWrapper({
        showSuggestions: true,
        suggestions: ['建议1', '建议2']
      })
      
      expect(wrapper.find('.suggestions-title').exists()).toBe(true)
      expect(wrapper.find('.suggestions-list').exists()).toBe(true)
      expect(wrapper.findAll('.suggestion-item')).toHaveLength(2)
    })

    it('应该显示操作按钮的正确样式', () => {
      wrapper = createWrapper({
        primaryAction: { text: '主要操作' },
        secondaryAction: { text: '次要操作' }
      })
      
      expect(wrapper.find('.empty-state__actions').exists()).toBe(true)
      expect(wrapper.findAllComponents({ name: 'ElButton' })).toHaveLength(2)
    })
  })
})