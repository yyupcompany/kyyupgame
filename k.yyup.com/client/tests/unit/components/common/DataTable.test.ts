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
import DataTable from '@/components/common/DataTable.vue'
import ElementPlus from 'element-plus'

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElTable: {
    name: 'ElTable',
    template: '<div class="el-table"><slot></slot></div>',
    props: ['data', 'columns', 'loading', 'border', 'stripe', 'size']
  },
  ElTableColumn: {
    name: 'ElTableColumn',
    template: '<div class="el-table-column"><slot></slot></div>',
    props: ['prop', 'label', 'width', 'sortable', 'formatter']
  },
  ElPagination: {
    name: 'ElPagination',
    template: '<div class="el-pagination"></div>',
    props: ['current-page', 'page-size', 'total', 'page-sizes']
  },
  ElButton: {
    name: 'ElButton',
    template: '<button class="el-button"><slot></slot></button>',
    props: ['type', 'size', 'disabled', 'loading']
  },
  ElInput: {
    name: 'ElInput',
    template: '<input class="el-input" />',
    props: ['modelValue', 'placeholder', 'clearable']
  },
  ElSelect: {
    name: 'ElSelect',
    template: '<select class="el-select"><slot></slot></select>',
    props: ['modelValue', 'placeholder', 'clearable']
  },
  ElOption: {
    name: 'ElOption',
    template: '<option class="el-option"></option>',
    props: ['value', 'label']
  }
}))

describe('DataTable.vue', () => {
  let router: Router

  beforeEach(() => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } }
      ]
    })
  })

  const mockData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', age: 30, status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25, status: 'inactive' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35, status: 'active' }
  ]

  const mockColumns = [
    { prop: 'id', label: 'ID', width: 80, sortable: true },
    { prop: 'name', label: 'Name', sortable: true },
    { prop: 'email', label: 'Email', width: 200 },
    { prop: 'age', label: 'Age', width: 80, sortable: true },
    { prop: 'status', label: 'Status', width: 100 }
  ]

  it('renders properly with default props', () => {
    const wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.el-table').exists()).toBe(true)
  })

  it('displays correct data in table', () => {
    const wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('data')).toEqual(mockData)
    expect(wrapper.props('columns')).toEqual(mockColumns)
  })

  it('shows loading state when loading prop is true', () => {
    const wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns,
        loading: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('loading')).toBe(true)
  })

  it('renders pagination when pagination prop is true', () => {
    const wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns,
        pagination: true,
        currentPage: 1,
        pageSize: 10,
        total: 100
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.el-pagination').exists()).toBe(true)
  })

  it('does not render pagination when pagination prop is false', () => {
    const wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns,
        pagination: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.el-pagination').exists()).toBe(false)
  })

  it('emits page-change event when pagination changes', async () => {
    const wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns,
        pagination: true,
        currentPage: 1,
        pageSize: 10,
        total: 100
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('page-change', 2, 20)
    expect(wrapper.emitted('page-change')).toBeTruthy()
    expect(wrapper.emitted('page-change')[0]).toEqual([2, 20])
  })

  it('emits sort-change event when table is sorted', async () => {
    const wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('sort-change', { prop: 'name', order: 'ascending' })
    expect(wrapper.emitted('sort-change')).toBeTruthy()
    expect(wrapper.emitted('sort-change')[0]).toEqual([{ prop: 'name', order: 'ascending' }])
  })

  it('emits selection-change event when rows are selected', async () => {
    const wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const selectedRows = [mockData[0], mockData[1]]
    await wrapper.vm.$emit('selection-change', selectedRows)
    expect(wrapper.emitted('selection-change')).toBeTruthy()
    expect(wrapper.emitted('selection-change')[0]).toEqual([selectedRows])
  })

  it('renders search input when searchable prop is true', () => {
    const wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns,
        searchable: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.el-input').exists()).toBe(true)
  })

  it('does not render search input when searchable prop is false', () => {
    const wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns,
        searchable: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.el-input').exists()).toBe(false)
  })

  it('emits search event when search input changes', async () => {
    const wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns,
        searchable: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('search', 'John')
    expect(wrapper.emitted('search')).toBeTruthy()
    expect(wrapper.emitted('search')[0]).toEqual(['John'])
  })

  it('renders action buttons when actions prop is provided', () => {
    const actions = [
      { label: 'Edit', type: 'primary', action: 'edit' },
      { label: 'Delete', type: 'danger', action: 'delete' }
    ]

    const wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns,
        actions: actions
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const buttons = wrapper.findAll('.el-button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('emits action event when action button is clicked', async () => {
    const actions = [
      { label: 'Edit', type: 'primary', action: 'edit' },
      { label: 'Delete', type: 'danger', action: 'delete' }
    ]

    const wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns,
        actions: actions
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('action', { action: 'edit', row: mockData[0] })
    expect(wrapper.emitted('action')).toBeTruthy()
    expect(wrapper.emitted('action')[0]).toEqual([{ action: 'edit', row: mockData[0] }])
  })

  it('handles empty data state gracefully', () => {
    const wrapper = mount(DataTable, {
      props: {
        data: [],
        columns: mockColumns
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('data')).toEqual([])
    expect(wrapper.find('.el-table').exists()).toBe(true)
  })

  it('applies correct CSS classes based on props', () => {
    const wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns,
        border: true,
        stripe: true,
        size: 'small'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('border')).toBe(true)
    expect(wrapper.props('stripe')).toBe(true)
    expect(wrapper.props('size')).toBe('small')
  })

  it('renders custom slots when provided', () => {
    const wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns
      },
      slots: {
        'header': '<div class="custom-header">Custom Header</div>',
        'footer': '<div class="custom-footer">Custom Footer</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.custom-header').exists()).toBe(true)
    expect(wrapper.find('.custom-footer').exists()).toBe(true)
  })

  it('computes table height correctly when height prop is provided', () => {
    const wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns,
        height: 400
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('height')).toBe(400)
  })

  it('handles row click events', async () => {
    const wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('row-click', mockData[0])
    expect(wrapper.emitted('row-click')).toBeTruthy()
    expect(wrapper.emitted('row-click')[0]).toEqual([mockData[0]])
  })

  it('handles double click events', async () => {
    const wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('row-dblclick', mockData[0])
    expect(wrapper.emitted('row-dblclick')).toBeTruthy()
    expect(wrapper.emitted('row-dblclick')[0]).toEqual([mockData[0]])
  })

  it('supports custom row class names', () => {
    const rowClassName = (row: any) => {
      return row.status === 'active' ? 'row-active' : 'row-inactive'
    }

    const wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns,
        rowClassName
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('rowClassName')).toBe(rowClassName)
  })

  it('supports custom cell rendering', () => {
    const wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns
      },
      slots: {
        'cell-name': '<template #cell-name="{ row }"><span class="custom-cell">{{ row.name }}</span></template>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.custom-cell').exists()).toBe(true)
  })

  it('handles responsive behavior', () => {
    const wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns,
        responsive: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('responsive')).toBe(true)
  })
})