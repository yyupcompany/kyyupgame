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
import { createPinia, setActivePinia } from 'pinia'
import { ElMessage } from 'element-plus'
import LazyDataTable from '@/components/common/LazyDataTable.vue'
import AsyncComponentWrapper from '@/components/common/AsyncComponentWrapper.vue'

// Mock Element Plus
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn()
    },
    ElButton: {
      name: 'ElButton',
      template: '<button @click="$emit(\'click\')"><slot /></button>'
    },
    ElSpace: {
      name: 'ElSpace',
      template: '<div><slot /></div>'
    },
    ElSelect: {
      name: 'ElSelect',
      template: '<select @change="$emit(\'change\', $event)"><slot /></select>'
    },
    ElOption: {
      name: 'ElOption',
      template: '<option :value="$attrs.value"><slot /></option>'
    },
    ElTag: {
      name: 'ElTag',
      template: '<span><slot /></span>'
    }
  }
})

// Mock fetch API
global.fetch = vi.fn()

describe('LazyDataTable.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    
    // Mock successful fetch response
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          data: [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' }
          ],
          total: 2
        })
      })
    )
  })

  const createWrapper = (props = {}) => {
    return mount(LazyDataTable, {
      props: {
        apiUrl: '/api/data',
        columns: [
          { prop: 'id', label: 'ID' },
          { prop: 'name', label: 'Name' }
        ],
        pagination: true,
        defaultPageSize: 20,
        showToolbar: true,
        showStats: true,
        useSuspense: false,
        cacheDuration: 5 * 60 * 1000,
        preload: false,
        ...props
      },
      global: {
        stubs: {
          'async-component-wrapper': AsyncComponentWrapper,
          'el-button': true,
          'el-space': true,
          'el-select': true,
          'el-option': true,
          'el-tag': true
        }
      }
    })
  }

  it('renders properly with default props', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.lazy-data-table').exists()).toBe(true)
  })

  it('shows toolbar when showToolbar is true', () => {
    const wrapper = createWrapper({ showToolbar: true })
    expect(wrapper.find('.table-toolbar').exists()).toBe(true)
  })

  it('hides toolbar when showToolbar is false', () => {
    const wrapper = createWrapper({ showToolbar: false })
    expect(wrapper.find('.table-toolbar').exists()).toBe(false)
  })

  it('shows stats when showStats is true', () => {
    const wrapper = createWrapper({ showStats: true })
    expect(wrapper.find('.table-stats').exists()).toBe(true)
  })

  it('hides stats when showStats is false', () => {
    const wrapper = createWrapper({ showStats: false })
    expect(wrapper.find('.table-stats').exists()).toBe(false)
  })

  it('computes dataCount correctly', () => {
    const wrapper = createWrapper()
    expect(wrapper.vm.dataCount).toBe(0)
    
    wrapper.setData({ tableData: [{ id: 1 }, { id: 2 }] })
    expect(wrapper.vm.dataCount).toBe(2)
  })

  it('configures table component correctly', () => {
    const wrapper = createWrapper()
    
    const config = wrapper.vm.tableComponentConfig
    expect(config.loader).toBeDefined()
    expect(config.delay).toBe(100)
    expect(config.timeout).toBe(10000)
    expect(config.cache).toBe(true)
    expect(config.retryLimit).toBe(2)
    expect(config.minLoadTime).toBe(300)
  })

  it('configures data loader correctly', () => {
    const wrapper = createWrapper()
    
    const config = wrapper.vm.tableDataConfig
    expect(config.loader).toBeDefined()
    expect(config.cacheDuration).toBe(5 * 60 * 1000)
    expect(config.timeout).toBe(15000)
    expect(config.retry).toEqual({
      times: 2,
      delay: 1000,
      backoff: 2
    })
  })

  it('computes table props correctly', () => {
    const wrapper = createWrapper()
    wrapper.setData({ tableData: [{ id: 1, name: 'Test' }] })
    
    const props = wrapper.vm.tableProps
    expect(props.data).toEqual([{ id: 1, name: 'Test' }])
    expect(props.columns).toEqual([
      { prop: 'id', label: 'ID' },
      { prop: 'name', label: 'Name' }
    ])
    expect(props.border).toBe(true)
    expect(props.stripe).toBe(true)
    expect(props['highlight-current-row']).toBe(true)
  })

  it('handles loading events', () => {
    const wrapper = createWrapper()
    
    wrapper.vm.handleComponentLoading(true)
    expect(wrapper.vm.isLoading).toBe(true)
    
    wrapper.vm.handleComponentLoading(false)
    expect(wrapper.vm.isLoading).toBe(false)
  })

  it('handles error events', () => {
    const wrapper = createWrapper()
    const mockError = new Error('Test error')
    
    wrapper.vm.handleError(mockError)
    
    expect(wrapper.vm.hasError).toBe(true)
    expect(ElMessage.error).toHaveBeenCalledWith('加载失败: Test error')
    expect(wrapper.emitted('error')).toBeTruthy()
    expect(wrapper.emitted('error')[0]).toEqual([mockError])
  })

  it('handles component loaded event', () => {
    const wrapper = createWrapper()
    const consoleSpy = vi.spyOn(console, 'log')
    
    wrapper.vm.handleComponentLoaded()
    
    expect(consoleSpy).toHaveBeenCalledWith('表格组件加载完成')
  })

  it('handles data loaded event', () => {
    const wrapper = createWrapper()
    const mockData = { data: [{ id: 1, name: 'Test' }], total: 1 }
    
    wrapper.vm.handleDataLoaded(mockData)
    
    expect(wrapper.vm.hasData).toBe(true)
    expect(wrapper.vm.hasError).toBe(false)
    expect(wrapper.vm.tableData).toEqual([{ id: 1, name: 'Test' }])
    expect(wrapper.vm.totalCount).toBe(1)
    expect(wrapper.emitted('dataLoaded')).toBeTruthy()
    expect(wrapper.emitted('dataLoaded')[0]).toEqual([[{ id: 1, name: 'Test' }]])
  })

  it('handles cancelled event', () => {
    const wrapper = createWrapper()
    
    wrapper.vm.handleCancelled()
    
    expect(ElMessage.info).toHaveBeenCalledWith('数据加载已取消')
  })

  it('refreshes data successfully', async () => {
    const wrapper = createWrapper()
    const asyncWrapper = { refresh: vi.fn().mockResolvedValue({}) }
    
    wrapper.vm.asyncWrapper = asyncWrapper
    
    await wrapper.vm.refreshData()
    
    expect(asyncWrapper.refresh).toHaveBeenCalled()
    expect(ElMessage.success).toHaveBeenCalledWith('数据刷新成功')
    expect(wrapper.vm.refreshing).toBe(false)
  })

  it('handles refresh data error', async () => {
    const wrapper = createWrapper()
    const asyncWrapper = { refresh: vi.fn().mockRejectedValue(new Error('Refresh failed')) }
    
    wrapper.vm.asyncWrapper = asyncWrapper
    
    await wrapper.vm.refreshData()
    
    expect(ElMessage.error).toHaveBeenCalledWith('数据刷新失败')
    expect(wrapper.vm.refreshing).toBe(false)
  })

  it('exports data correctly', () => {
    const wrapper = createWrapper()
    wrapper.setData({
      tableData: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ]
    })
    
    const mockCreateElement = vi.fn()
    const mockCreateObjectURL = vi.fn()
    const mockRevokeObjectURL = vi.fn()
    
    document.createElement = mockCreateElement
    URL.createObjectURL = mockCreateObjectURL
    URL.revokeObjectURL = mockRevokeObjectURL
    
    // Mock link element
    const mockLink = {
      href: '',
      download: '',
      click: vi.fn()
    }
    mockCreateElement.mockReturnValue(mockLink)
    
    wrapper.vm.exportData()
    
    expect(mockCreateElement).toHaveBeenCalledWith('a')
    expect(mockLink.download).toMatch(/table-data-\d+\.csv/)
    expect(mockLink.click).toHaveBeenCalled()
    expect(ElMessage.success).toHaveBeenCalledWith('数据导出成功')
  })

  it('handles page size change', () => {
    const wrapper = createWrapper()
    
    wrapper.vm.handlePageSizeChange(50)
    
    expect(wrapper.vm.pageSize).toBe(50)
    expect(wrapper.vm.currentPage).toBe(1)
    expect(wrapper.emitted('sizeChange')).toBeTruthy()
    expect(wrapper.emitted('sizeChange')[0]).toEqual([50])
  })

  it('handles page change', () => {
    const wrapper = createWrapper()
    
    wrapper.vm.handlePageChange(2)
    
    expect(wrapper.vm.currentPage).toBe(2)
    expect(wrapper.emitted('pageChange')).toBeTruthy()
    expect(wrapper.emitted('pageChange')[0]).toEqual([2])
  })

  it('watches page and size changes', async () => {
    const wrapper = createWrapper()
    const refreshSpy = vi.spyOn(wrapper.vm, 'refreshData')
    
    await wrapper.setData({ currentPage: 2, pageSize: 50 })
    
    expect(refreshSpy).toHaveBeenCalled()
  })

  it('exposes methods correctly', () => {
    const wrapper = createWrapper()
    
    expect(wrapper.vm.refresh).toBeDefined()
    expect(wrapper.vm.getData).toBeDefined()
    expect(wrapper.vm.getTotal).toBeDefined()
    expect(wrapper.vm.changePage).toBeDefined()
    expect(wrapper.vm.changeSize).toBeDefined()
    
    wrapper.setData({ tableData: [{ id: 1 }], totalCount: 1 })
    
    expect(wrapper.vm.getData()).toEqual([{ id: 1 }])
    expect(wrapper.vm.getTotal()).toBe(1)
  })

  it('handles empty data state', () => {
    const wrapper = createWrapper({
      columns: [{ prop: 'id', label: 'ID' }]
    })
    
    const props = wrapper.vm.tableProps
    expect(props['empty-text']).toBe('暂无数据')
  })

  it('applies correct API parameters', () => {
    const wrapper = createWrapper({
      apiUrl: '/api/users',
      apiParams: { status: 'active', role: 'admin' }
    })
    
    const config = wrapper.vm.tableDataConfig
    expect(config.dependencies).toEqual([1, 20, { status: 'active', role: 'admin' }])
  })

  it('handles fetch errors correctly', async () => {
    const wrapper = createWrapper()
    
    // Mock fetch error
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        statusText: 'Not Found'
      })
    )
    
    const config = wrapper.vm.tableDataConfig
    
    await expect(config.loader()).rejects.toThrow('HTTP 404: Not Found')
  })
})