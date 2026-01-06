
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
import DataTable from '@/components/centers/DataTable.vue'
import { Plus, Search, Filter, Refresh, ArrowDown } from '@element-plus/icons-vue'

// 模拟Element Plus图标
vi.mock('@element-plus/icons-vue', () => ({
  Plus: vi.fn(),
  Search: vi.fn(),
  Filter: vi.fn(),
  Refresh: vi.fn(),
  ArrowDown: vi.fn()
}))

// 模拟lodash-es的debounce
vi.mock('lodash-es', () => ({
  debounce: (fn: Function) => fn
}))

// 模拟dayjs
vi.mock('dayjs', () => ({
  default: vi.fn().mockReturnValue({
    format: vi.fn().mockReturnValue('2024-01-01 12:00:00')
  })
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
    ElInput: {
      name: 'ElInput',
      template: '<input @input="$emit(\'update:modelValue\', $event.target.value)" />'
    },
    ElDropdown: {
      name: 'ElDropdown',
      template: '<div><slot></slot><slot name="dropdown"></slot></div>'
    },
    ElDropdownMenu: {
      name: 'ElDropdownMenu',
      template: '<div><slot></slot></div>'
    },
    ElDropdownItem: {
      name: 'ElDropdownItem',
      template: '<div @click="$emit(\'click\')"><slot></slot></div>'
    },
    ElTable: {
      name: 'ElTable',
      template: '<table><slot></slot></table>'
    },
    ElTableColumn: {
      name: 'ElTableColumn',
      template: '<td><slot></slot><slot name="default"></slot></td>'
    },
    ElPagination: {
      name: 'ElPagination',
      template: '<div class="pagination"><slot></slot></div>'
    },
    ElTag: {
      name: 'ElTag',
      template: '<span><slot></slot></span>'
    }
  }
})

const mockData = [
  {
    id: 1,
    name: '张三',
    age: 25,
    status: 'active',
    createdAt: '2024-01-01T12:00:00'
  },
  {
    id: 2,
    name: '李四',
    age: 30,
    status: 'inactive',
    createdAt: '2024-01-02T12:00:00'
  }
]

const mockColumns = [
  { prop: 'name', label: '姓名', type: 'text' },
  { prop: 'age', label: '年龄', type: 'text' },
  { prop: 'status', label: '状态', type: 'tag', tagMap: { active: 'success', inactive: 'danger' } },
  { prop: 'createdAt', label: '创建时间', type: 'date' },
  { prop: 'actions', label: '操作', type: 'actions' }
]

// 控制台错误检测变量
let consoleSpy: any

describe('DataTable.vue', () => {
  let wrapper: any
  let i18n: any

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

    wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns,
        loading: false,
        total: 2,
        currentPage: 1,
        pageSize: 10,
        showPagination: true,
        selectable: true,
        showIndex: true,
        searchable: true,
        filters: [{ key: 'status', label: '状态' }],
        showToolbar: true
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-button': true,
          'el-input': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-table': true,
          'el-table-column': true,
          'el-pagination': true,
          'el-tag': true
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
    expect(wrapper.find('.data-table').exists()).toBe(true)
  })

  it('显示表格工具栏', () => {
    const toolbar = wrapper.find('.table-toolbar')
    expect(toolbar.exists()).toBe(true)
    expect(toolbar.find('.toolbar-left').exists()).toBe(true)
    expect(toolbar.find('.toolbar-right').exists()).toBe(true)
  })

  it('显示表格容器', () => {
    const container = wrapper.find('.table-container')
    expect(container.exists()).toBe(true)
  })

  it('显示分页器', () => {
    const pagination = wrapper.find('.table-pagination')
    expect(pagination.exists()).toBe(true)
  })

  it('正确初始化搜索关键字', () => {
    expect(wrapper.vm.searchKeyword).toBe('')
  })

  it('正确初始化选择数据', () => {
    expect(wrapper.vm.selection).toEqual([])
  })

  it('正确计算表格数据', () => {
    expect(wrapper.vm.tableData).toEqual(mockData)
  })

  it('处理搜索操作', () => {
    wrapper.vm.handleSearch('张三')
    expect(wrapper.emitted('search')).toBeTruthy()
    expect(wrapper.emitted('search')[0]).toEqual(['张三'])
  })

  it('处理筛选操作', () => {
    wrapper.vm.handleFilterCommand('status')
    expect(wrapper.emitted('filter')).toBeTruthy()
    expect(wrapper.emitted('filter')[0]).toEqual(['status'])
  })

  it('处理选择变化', () => {
    const mockSelection = [mockData[0]]
    wrapper.vm.handleSelectionChange(mockSelection)
    expect(wrapper.vm.selection).toEqual(mockSelection)
    expect(wrapper.emitted('selection-change')).toBeTruthy()
    expect(wrapper.emitted('selection-change')[0]).toEqual([mockSelection])
  })

  it('处理排序变化', () => {
    const mockSort = { prop: 'name', order: 'ascending' }
    wrapper.vm.handleSortChange(mockSort)
    expect(wrapper.emitted('sort-change')).toBeTruthy()
    expect(wrapper.emitted('sort-change')[0]).toEqual([mockSort])
  })

  it('处理行点击', () => {
    const mockRow = mockData[0]
    const mockColumn = { prop: 'name' }
    const mockEvent = new Event('click')
    wrapper.vm.handleRowClick(mockRow, mockColumn, mockEvent)
    expect(wrapper.emitted('row-click')).toBeTruthy()
    expect(wrapper.emitted('row-click')[0]).toEqual([mockRow, mockColumn, mockEvent])
  })

  it('处理行双击', () => {
    const mockRow = mockData[0]
    const mockColumn = { prop: 'name' }
    const mockEvent = new Event('dblclick')
    wrapper.vm.handleRowDblClick(mockRow, mockColumn, mockEvent)
    expect(wrapper.emitted('row-dblclick')).toBeTruthy()
    expect(wrapper.emitted('row-dblclick')[0]).toEqual([mockRow, mockColumn, mockEvent])
  })

  it('正确计算序号', () => {
    expect(wrapper.vm.getIndex(0)).toBe(1)
    expect(wrapper.vm.getIndex(1)).toBe(2)
  })

  it('处理分页大小变化', () => {
    wrapper.vm.handleSizeChange(20)
    expect(wrapper.emitted('size-change')).toBeTruthy()
    expect(wrapper.emitted('size-change')[0]).toEqual([20])
  })

  it('处理当前页变化', () => {
    wrapper.vm.handleCurrentChange(2)
    expect(wrapper.emitted('current-change')).toBeTruthy()
    expect(wrapper.emitted('current-change')[0]).toEqual([2])
  })

  it('正确格式化值', () => {
    const column = mockColumns[0]
    expect(wrapper.vm.formatValue('张三', column)).toBe('张三')
    expect(wrapper.vm.formatValue(null, column)).toBe('-')
    expect(wrapper.vm.formatValue(undefined, column)).toBe('-')
  })

  it('使用自定义格式化函数', () => {
    const customColumn = {
      prop: 'name',
      label: '姓名',
      formatter: (value: any) => `姓名: ${value}`
    }
    expect(wrapper.vm.formatValue('张三', customColumn)).toBe('姓名: 张三')
  })

  it('正确格式化日期', () => {
    expect(wrapper.vm.formatDate('2024-01-01T12:00:00')).toBe('2024-01-01 12:00:00')
    expect(wrapper.vm.formatDate(null)).toBe('-')
    expect(wrapper.vm.formatDate(undefined)).toBe('-')
  })

  it('使用自定义日期格式', () => {
    expect(wrapper.vm.formatDate('2024-01-01T12:00:00', 'YYYY-MM-DD')).toBe('2024-01-01 12:00:00')
  })

  it('正确获取标签类型', () => {
    const column = mockColumns[2]
    expect(wrapper.vm.getTagType('active', column)).toBe('success')
    expect(wrapper.vm.getTagType('inactive', column)).toBe('danger')
    expect(wrapper.vm.getTagType('unknown', column)).toBe('default')
  })

  it('显示批量操作按钮', () => {
    wrapper.vm.selection = [mockData[0]]
    const batchActions = wrapper.find('.batch-actions')
    expect(batchActions.exists()).toBe(true)
    expect(batchActions.find('.selection-info').text()).toBe('已选择 1 项')
  })

  it('显示普通操作按钮', () => {
    const normalActions = wrapper.find('.normal-actions')
    expect(normalActions.exists()).toBe(true)
  })

  it('触发创建事件', () => {
    wrapper.find('.toolbar-left button').trigger('click')
    expect(wrapper.emitted('create')).toBeTruthy()
  })

  it('触发刷新事件', () => {
    const refreshButton = wrapper.findAll('.toolbar-right button')[1]
    refreshButton.trigger('click')
    expect(wrapper.emitted('refresh')).toBeTruthy()
  })

  it('暴露公共方法', () => {
    expect(wrapper.vm.clearSelection).toBeDefined()
    expect(wrapper.vm.toggleRowSelection).toBeDefined()
    expect(wrapper.vm.toggleAllSelection).toBeDefined()
    expect(wrapper.vm.setCurrentRow).toBeDefined()
    expect(wrapper.vm.clearSort).toBeDefined()
    expect(wrapper.vm.clearFilter).toBeDefined()
    expect(wrapper.vm.doLayout).toBeDefined()
    expect(wrapper.vm.sort).toBeDefined()
    expect(wrapper.vm.recalculateColumnWidths).toBeDefined()
  })

  it('处理响应式列宽计算', () => {
    const column = { prop: 'name', label: '姓名', width: 100 }
    expect(wrapper.vm.getColumnWidth(column)).toBe(100)
    
    const autoColumn = { prop: 'name', label: '姓名' }
    expect(wrapper.vm.getColumnWidth(autoColumn)).toBeUndefined()
  })

  it('处理空数据', () => {
    const emptyWrapper = mount(DataTable, {
      props: {
        data: [],
        columns: mockColumns,
        loading: false
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-button': true,
          'el-input': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-table': true,
          'el-table-column': true,
          'el-pagination': true,
          'el-tag': true
        }
      }
    })

    expect(emptyWrapper.vm.tableData).toEqual([])
    emptyWrapper.unmount()
  })

  it('处理加载状态', () => {
    const loadingWrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns,
        loading: true
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-button': true,
          'el-input': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-table': true,
          'el-table-column': true,
          'el-pagination': true,
          'el-tag': true
        }
      }
    })

    expect(loadingWrapper.vm.loading).toBe(true)
    loadingWrapper.unmount()
  })

  it('处理隐藏工具栏', () => {
    const noToolbarWrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns,
        showToolbar: false
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-button': true,
          'el-input': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-table': true,
          'el-table-column': true,
          'el-pagination': true,
          'el-tag': true
        }
      }
    })

    expect(noToolbarWrapper.find('.table-toolbar').exists()).toBe(false)
    noToolbarWrapper.unmount()
  })

  it('处理隐藏分页器', () => {
    const noPaginationWrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns,
        showPagination: false
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-button': true,
          'el-input': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-table': true,
          'el-table-column': true,
          'el-pagination': true,
          'el-tag': true
        }
      }
    })

    expect(noPaginationWrapper.find('.table-pagination').exists()).toBe(false)
    noPaginationWrapper.unmount()
  })

  it('处理隐藏选择列', () => {
    const noSelectableWrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns,
        selectable: false
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-button': true,
          'el-input': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-table': true,
          'el-table-column': true,
          'el-pagination': true,
          'el-tag': true
        }
      }
    })

    expect(noSelectableWrapper.vm.selectable).toBe(false)
    noSelectableWrapper.unmount()
  })

  it('处理隐藏序号列', () => {
    const noIndexWrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns,
        showIndex: false
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-button': true,
          'el-input': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-table': true,
          'el-table-column': true,
          'el-pagination': true,
          'el-tag': true
        }
      }
    })

    expect(noIndexWrapper.vm.showIndex).toBe(false)
    noIndexWrapper.unmount()
  })

  it('处理隐藏搜索功能', () => {
    const noSearchWrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns,
        searchable: false
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-button': true,
          'el-input': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-table': true,
          'el-table-column': true,
          'el-pagination': true,
          'el-tag': true
        }
      }
    })

    expect(noSearchWrapper.vm.searchable).toBe(false)
    noSearchWrapper.unmount()
  })
})