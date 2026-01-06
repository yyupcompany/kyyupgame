import { mount } from '@vue/test-utils'
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

describe, it, expect, beforeEach, vi } from 'vitest'
import ActionToolbar from '@/components/centers/ActionToolbar.vue'
import { ElButton, ElInput, ElSelect, ElDropdown, ElDropdownMenu, ElDropdownItem, ElDivider, ElBadge, ElIcon } from 'element-plus'

// Mock Element Plus components
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElButton: {
      name: 'ElButton',
      template: '<button class="el-button"><slot></slot></button>'
    },
    ElInput: {
      name: 'ElInput',
      template: '<input class="el-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
      props: ['modelValue']
    },
    ElSelect: {
      name: 'ElSelect',
      template: '<select class="el-select"><slot></slot></select>'
    },
    ElDropdown: {
      name: 'ElDropdown',
      template: '<div class="el-dropdown"><slot></slot><slot name="dropdown"></slot></div>'
    },
    ElDropdownMenu: {
      name: 'ElDropdownMenu',
      template: '<div class="el-dropdown-menu"><slot></slot></div>'
    },
    ElDropdownItem: {
      name: 'ElDropdownItem',
      template: '<div class="el-dropdown-item" @click="$emit(\'command\', $attrs.command)"><slot></slot></div>'
    },
    ElDivider: {
      name: 'ElDivider',
      template: '<div class="el-divider"></div>'
    },
    ElBadge: {
      name: 'ElBadge',
      template: '<div class="el-badge"><slot></slot><span class="el-badge__content" v-if="value">{{ value }}</span></div>',
      props: ['value']
    },
    ElIcon: {
      name: 'ElIcon',
      template: '<i class="el-icon"><slot></slot></i>'
    }
  }
})

// Mock lodash-es debounce
vi.mock('lodash-es', () => ({
  debounce: (fn: Function, delay: number) => {
    return function (...args: any[]) {
      setTimeout(() => fn.apply(this, args), delay)
    }
  }
}))

describe('ActionToolbar.vue', () => {
  let wrapper: any

  const defaultProps = {
    primaryActions: [
      { key: 'create', label: '新建', type: 'primary' }
    ],
    secondaryActions: [
      { key: 'export', label: '导出', type: 'default' }
    ],
    batchActions: [
      { key: 'delete', label: '删除', type: 'danger' }
    ],
    moreActions: [
      { key: 'settings', label: '设置', type: 'default' }
    ],
    selection: [],
    searchable: true,
    searchPlaceholder: '搜索...',
    filters: [
      { key: 'status', label: '状态' }
    ],
    activeFilters: [],
    sortable: true,
    sortOptions: [
      { key: 'date', label: '日期' }
    ],
    currentSort: '',
    refreshable: true,
    refreshing: false,
    size: 'default',
    align: 'space-between'
  }

  const createWrapper = (props = {}) => {
    return mount(ActionToolbar, {
      props: {
        ...defaultProps,
        ...props
      },
      global: {
        components: {
          ElButton,
          ElInput,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElDivider,
          ElBadge,
          ElIcon
        }
      }
    })
  }

  beforeEach(() => {
    wrapper = null
    vi.clearAllMocks()
  })

  describe('组件渲染', () => {
    it('应该正确渲染工具栏基本结构', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.action-toolbar').exists()).toBe(true)
      expect(wrapper.find('.toolbar-left').exists()).toBe(true)
      expect(wrapper.find('.toolbar-right').exists()).toBe(true)
    })

    it('应该渲染主要操作按钮', () => {
      wrapper = createWrapper()
      
      const primaryActions = wrapper.findAll('.primary-actions .el-button')
      expect(primaryActions.length).toBe(1)
      expect(primaryActions[0].text()).toBe('新建')
    })

    it('应该渲染次要操作按钮', () => {
      wrapper = createWrapper()
      
      const secondaryActions = wrapper.findAll('.secondary-actions .el-button')
      expect(secondaryActions.length).toBe(1)
      expect(secondaryActions[0].text()).toBe('导出')
    })

    it('应该渲染搜索框', () => {
      wrapper = createWrapper({ searchable: true })
      
      expect(wrapper.find('.search-box').exists()).toBe(true)
      expect(wrapper.findComponent(ElInput).exists()).toBe(true)
    })

    it('searchable 为 false 时不应该渲染搜索框', () => {
      wrapper = createWrapper({ searchable: false })
      
      expect(wrapper.find('.search-box').exists()).toBe(false)
    })

    it('应该渲染筛选器下拉菜单', () => {
      wrapper = createWrapper({ filters: [{ key: 'status', label: '状态' }] })
      
      expect(wrapper.find('.filter-box').exists()).toBe(true)
      expect(wrapper.findComponent(ElDropdown).exists()).toBe(true)
    })

    it('应该渲染排序下拉菜单', () => {
      wrapper = createWrapper({ sortable: true })
      
      expect(wrapper.find('.sort-box').exists()).toBe(true)
      expect(wrapper.findComponent(ElDropdown).exists()).toBe(true)
    })

    it('应该渲染更多操作下拉菜单', () => {
      wrapper = createWrapper({ moreActions: [{ key: 'settings', label: '设置' }] })
      
      expect(wrapper.find('.more-actions').exists()).toBe(true)
      expect(wrapper.findComponent(ElDropdown).exists()).toBe(true)
    })

    it('应该渲染刷新按钮', () => {
      wrapper = createWrapper({ refreshable: true })
      
      const refreshButton = wrapper.findAll('.toolbar-right .el-button').find(
        btn => btn.text().includes('刷新')
      )
      expect(refreshButton.exists()).toBe(true)
    })
  })

  describe('批量操作功能', () => {
    it('有选中项时应该显示批量操作区域', () => {
      wrapper = createWrapper({
        selection: [{ id: 1 }, { id: 2 }],
        batchActions: [{ key: 'delete', label: '删除', type: 'danger' }]
      })
      
      expect(wrapper.find('.batch-actions').exists()).toBe(true)
      expect(wrapper.find('.selection-info').exists()).toBe(true)
      expect(wrapper.find('.selection-info').text()).toContain('已选择 2 项')
    })

    it('没有选中项时应该隐藏批量操作区域', () => {
      wrapper = createWrapper({
        selection: [],
        batchActions: [{ key: 'delete', label: '删除', type: 'danger' }]
      })
      
      expect(wrapper.find('.batch-actions').exists()).toBe(false)
    })

    it('应该正确显示选中项数量', () => {
      wrapper = createWrapper({
        selection: [{ id: 1 }, { id: 2 }, { id: 3 }],
        batchActions: [{ key: 'delete', label: '删除', type: 'danger' }]
      })
      
      expect(wrapper.find('.selection-info').text()).toContain('已选择 3 项')
    })
  })

  describe('搜索功能', () => {
    it('应该正确处理搜索输入', async () => {
      wrapper = createWrapper({ searchable: true })
      
      const searchInput = wrapper.findComponent(ElInput)
      await searchInput.setValue('测试搜索')
      
      expect(wrapper.vm.searchKeyword).toBe('测试搜索')
    })

    it('应该触发搜索事件（debounced）', async () => {
      wrapper = createWrapper({ searchable: true })
      
      const searchInput = wrapper.findComponent(ElInput)
      
      // 使用 vi.useFakeTimers 来测试 debounce
      vi.useFakeTimers()
      await searchInput.setValue('测试搜索')
      
      // 快速前进时间，触发 debounce
      vi.advanceTimersByTime(300)
      
      expect(wrapper.emitted('search')).toBeTruthy()
      expect(wrapper.emitted('search')[0]).toEqual(['测试搜索'])
      
      vi.useRealTimers()
    })

    it('应该处理搜索清除', async () => {
      wrapper = createWrapper({ searchable: true })
      
      const searchInput = wrapper.findComponent(ElInput)
      await searchInput.setValue('测试搜索')
      await searchInput.trigger('clear')
      
      expect(wrapper.vm.searchKeyword).toBe('')
      expect(wrapper.emitted('search-clear')).toBeTruthy()
    })
  })

  describe('筛选功能', () => {
    it('应该正确处理筛选命令', async () => {
      wrapper = createWrapper({
        filters: [{ key: 'status', label: '状态' }],
        activeFilters: []
      })
      
      const dropdown = wrapper.find('.filter-box .el-dropdown')
      await dropdown.vm.$emit('command', 'status')
      
      expect(wrapper.emitted('filter')).toBeTruthy()
      expect(wrapper.emitted('filter')[0]).toEqual(['status', true])
    })

    it('应该处理清除筛选命令', async () => {
      wrapper = createWrapper({
        filters: [{ key: 'status', label: '状态' }],
        activeFilters: ['status']
      })
      
      const dropdown = wrapper.find('.filter-box .el-dropdown')
      await dropdown.vm.$emit('command', 'clear')
      
      expect(wrapper.emitted('filter-clear')).toBeTruthy()
    })

    it('应该正确显示激活的筛选器数量', () => {
      wrapper = createWrapper({
        filters: [{ key: 'status', label: '状态' }],
        activeFilters: ['status', 'type']
      })
      
      const badge = wrapper.find('.filter-badge')
      expect(badge.exists()).toBe(true)
      expect(badge.attributes('value')).toBe('2')
    })
  })

  describe('排序功能', () => {
    it('应该正确处理排序命令', async () => {
      wrapper = createWrapper({
        sortable: true,
        sortOptions: [{ key: 'date', label: '日期' }],
        currentSort: ''
      })
      
      const dropdown = wrapper.find('.sort-box .el-dropdown')
      await dropdown.vm.$emit('command', 'date')
      
      expect(wrapper.emitted('sort')).toBeTruthy()
      expect(wrapper.emitted('sort')[0]).toEqual(['date'])
    })

    it('应该正确显示当前排序', () => {
      wrapper = createWrapper({
        sortable: true,
        sortOptions: [{ key: 'date', label: '日期' }],
        currentSort: 'date'
      })
      
      // 检查当前排序项是否被标记为激活状态
      const dropdownItems = wrapper.findAll('.sort-box .el-dropdown-item')
      const activeItem = dropdownItems.find(item => item.classes().includes('is-active'))
      expect(activeItem.exists()).toBe(true)
    })
  })

  describe('操作按钮交互', () => {
    it('应该正确处理主要操作按钮点击', async () => {
      const action = { key: 'create', label: '新建', type: 'primary' }
      wrapper = createWrapper({
        primaryActions: [action]
      })
      
      const button = wrapper.find('.primary-actions .el-button')
      await button.trigger('click')
      
      expect(wrapper.emitted('action-click')).toBeTruthy()
      expect(wrapper.emitted('action-click')[0]).toEqual([action])
    })

    it('应该正确处理批量操作按钮点击', async () => {
      const action = { key: 'delete', label: '删除', type: 'danger' }
      const selection = [{ id: 1 }, { id: 2 }]
      wrapper = createWrapper({
        batchActions: [action],
        selection
      })
      
      const button = wrapper.find('.batch-actions .el-button')
      await button.trigger('click')
      
      expect(wrapper.emitted('batch-action')).toBeTruthy()
      expect(wrapper.emitted('batch-action')[0]).toEqual([action, selection])
    })

    it('应该正确处理更多操作命令', async () => {
      const action = { key: 'settings', label: '设置', type: 'default' }
      wrapper = createWrapper({
        moreActions: [action]
      })
      
      const dropdown = wrapper.find('.more-actions .el-dropdown')
      await dropdown.vm.$emit('command', 'settings')
      
      expect(wrapper.emitted('action-click')).toBeTruthy()
      expect(wrapper.emitted('action-click')[0]).toEqual([action])
    })

    it('应该处理刷新按钮点击', async () => {
      wrapper = createWrapper({ refreshable: true })
      
      const refreshButton = wrapper.findAll('.toolbar-right .el-button').find(
        btn => btn.text().includes('刷新')
      )
      await refreshButton.trigger('click')
      
      expect(wrapper.emitted('refresh')).toBeTruthy()
    })

    it('应该禁用 disabled 状态的按钮', () => {
      const disabledAction = { key: 'disabled', label: '禁用', type: 'primary', disabled: true }
      wrapper = createWrapper({
        primaryActions: [disabledAction]
      })
      
      const button = wrapper.find('.primary-actions .el-button')
      expect(button.attributes('disabled')).toBeDefined()
    })

    it('应该显示 loading 状态的按钮', () => {
      const loadingAction = { key: 'loading', label: '加载中', type: 'primary', loading: true }
      wrapper = createWrapper({
        primaryActions: [loadingAction]
      })
      
      const button = wrapper.find('.primary-actions .el-button')
      expect(button.attributes('loading')).toBeDefined()
    })
  })

  describe('Props 测试', () => {
    it('应该正确处理不同的尺寸', () => {
      const sizes = ['large', 'default', 'small'] as const
      
      sizes.forEach(size => {
        wrapper = createWrapper({ size })
        expect(wrapper.find('.action-toolbar').classes()).toContain(`action-toolbar--${size}`)
      })
    })

    it('应该正确处理不同的对齐方式', () => {
      const alignments = ['left', 'center', 'right', 'space-between'] as const
      
      alignments.forEach(align => {
        wrapper = createWrapper({ align })
        expect(wrapper.find('.action-toolbar').classes()).toContain(`action-toolbar--${align}`)
      })
    })

    it('应该正确处理空数组 props', () => {
      wrapper = createWrapper({
        primaryActions: [],
        secondaryActions: [],
        batchActions: [],
        moreActions: [],
        filters: [],
        sortOptions: []
      })
      
      expect(wrapper.find('.primary-actions').exists()).toBe(true)
      expect(wrapper.find('.secondary-actions').exists()).toBe(true)
      expect(wrapper.find('.filter-box').exists()).toBe(false)
      expect(wrapper.find('.sort-box').exists()).toBe(false)
    })
  })

  describe('插槽功能测试', () => {
    it('应该正确渲染主要操作插槽', () => {
      wrapper = mount(ActionToolbar, {
        props: defaultProps,
        slots: {
          primary: '<div class="slot-primary">自定义主要操作</div>'
        },
        global: {
          components: {
            ElButton,
            ElInput,
            ElSelect,
            ElDropdown,
            ElDropdownMenu,
            ElDropdownItem,
            ElDivider,
            ElBadge,
            ElIcon
          }
        }
      })
      
      expect(wrapper.find('.slot-primary').exists()).toBe(true)
      expect(wrapper.find('.slot-primary').text()).toBe('自定义主要操作')
    })

    it('应该正确渲染次要操作插槽', () => {
      wrapper = mount(ActionToolbar, {
        props: defaultProps,
        slots: {
          secondary: '<div class="slot-secondary">自定义次要操作</div>'
        },
        global: {
          components: {
            ElButton,
            ElInput,
            ElSelect,
            ElDropdown,
            ElDropdownMenu,
            ElDropdownItem,
            ElDivider,
            ElBadge,
            ElIcon
          }
        }
      })
      
      expect(wrapper.find('.slot-secondary').exists()).toBe(true)
      expect(wrapper.find('.slot-secondary').text()).toBe('自定义次要操作')
    })

    it('应该正确渲染批量操作插槽', () => {
      wrapper = mount(ActionToolbar, {
        props: {
          ...defaultProps,
          selection: [{ id: 1 }]
        },
        slots: {
          batch: '<div class="slot-batch">自定义批量操作</div>'
        },
        global: {
          components: {
            ElButton,
            ElInput,
            ElSelect,
            ElDropdown,
            ElDropdownMenu,
            ElDropdownItem,
            ElDivider,
            ElBadge,
            ElIcon
          }
        }
      })
      
      expect(wrapper.find('.slot-batch').exists()).toBe(true)
      expect(wrapper.find('.slot-batch').text()).toBe('自定义批量操作')
    })
  })

  describe('边界条件测试', () => {
    it('应该处理大量的操作按钮', () => {
      const manyActions = Array.from({ length: 20 }, (_, i) => ({
        key: `action-${i}`,
        label: `操作 ${i}`,
        type: 'default'
      }))
      
      wrapper = createWrapper({
        primaryActions: manyActions
      })
      
      const buttons = wrapper.findAll('.primary-actions .el-button')
      expect(buttons.length).toBe(20)
    })

    it('应该处理很长的搜索占位符', () => {
      const longPlaceholder = '这是一个非常长的搜索占位符文本，用来测试组件在处理长文本时的显示效果'
      
      wrapper = createWrapper({
        searchable: true,
        searchPlaceholder: longPlaceholder
      })
      
      const input = wrapper.findComponent(ElInput)
      expect(input.attributes('placeholder')).toBe(longPlaceholder)
    })

    it('应该处理特殊字符的操作标签', () => {
      const specialAction = {
        key: 'special-action',
        label: '特殊操作 & < > " \'',
        type: 'primary'
      }
      
      wrapper = createWrapper({
        primaryActions: [specialAction]
      })
      
      const button = wrapper.find('.primary-actions .el-button')
      expect(button.text()).toBe(specialAction.label)
    })
  })

  describe('样式和响应式测试', () => {
    it('应该包含必要的 CSS 类', () => {
      wrapper = createWrapper()
      
      const toolbar = wrapper.find('.action-toolbar')
      expect(toolbar.classes()).toContain('action-toolbar')
      expect(toolbar.classes()).toContain('action-toolbar--space-between')
      expect(toolbar.classes()).toContain('action-toolbar--default')
    })

    it('应该正确应用响应式样式', () => {
      wrapper = createWrapper({ size: 'small' })
      
      const toolbar = wrapper.find('.action-toolbar')
      expect(toolbar.classes()).toContain('action-toolbar--small')
    })
  })

  describe('性能测试', () => {
    it('应该快速渲染组件', () => {
      const startTime = performance.now()
      
      wrapper = createWrapper()
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      expect(renderTime).toBeLessThan(100) // 渲染时间应该小于 100ms
    })

    it('应该正确处理大量数据', () => {
      const largeSelection = Array.from({ length: 1000 }, (_, i) => ({ id: i }))
      
      wrapper = createWrapper({
        selection: largeSelection,
        batchActions: [{ key: 'delete', label: '删除', type: 'danger' }]
      })
      
      expect(wrapper.find('.selection-info').text()).toContain('已选择 1000 项')
    })
  })
})