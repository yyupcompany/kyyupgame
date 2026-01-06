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
import AsyncDataExample from '@/components/examples/AsyncDataExample.vue'
import ElementPlus from 'element-plus'

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElCard: {
    name: 'ElCard',
    template: '<div class="el-card"><slot name="header" /><slot /></div>'
  },
  ElButton: {
    name: 'ElButton',
    template: '<button class="el-button"><slot /></button>'
  },
  ElSpace: {
    name: 'ElSpace',
    template: '<div class="el-space"><slot /></div>'
  },
  ElProgress: {
    name: 'ElProgress',
    template: '<div class="el-progress" />'
  },
  ElRow: {
    name: 'ElRow',
    template: '<div class="el-row"><slot /></div>'
  },
  ElCol: {
    name: 'ElCol',
    template: '<div class="el-col"><slot /></div>'
  },
  ElTable: {
    name: 'ElTable',
    template: '<div class="el-table"><slot /></div>'
  },
  ElTableColumn: {
    name: 'ElTableColumn',
    template: '<div class="el-table-column" />'
  },
  ElEmpty: {
    name: 'ElEmpty',
    template: '<div class="el-empty"><slot /></div>'
  },
  ElAlert: {
    name: 'ElAlert',
    template: '<div class="el-alert"><slot /></div>'
  },
  ElStatistic: {
    name: 'ElStatistic',
    template: '<div class="el-statistic" />'
  },
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }
}))

// Mock composables and utilities
vi.mock('@/composables/useAsyncOperation', () => ({
  useAsyncOperation: vi.fn(),
  useBatchAsyncOperation: vi.fn()
}))

vi.mock('@/components/common/LoadingState.vue', () => ({
  name: 'LoadingState',
  template: '<div class="loading-state">Loading...</div>'
}))

describe('AsyncDataExample.vue', () => {
  let wrapper: any
  let mockUseAsyncOperation: any
  let mockUseBatchAsyncOperation: any

  const createMockAsyncOperation = (overrides = {}) => ({
    loading: false,
    error: null,
    data: null,
    hasError: false,
    hasData: false,
    execute: vi.fn(),
    refresh: vi.fn(),
    cancel: vi.fn(),
    ...overrides
  })

  const createMockBatchOperation = (overrides = {}) => ({
    loading: false,
    errors: [],
    results: [],
    progress: 0,
    execute: vi.fn(),
    ...overrides
  })

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockUseAsyncOperation = vi.fn()
    mockUseBatchAsyncOperation = vi.fn()
    
    // @ts-ignore
    const { useAsyncOperation, useBatchAsyncOperation } = require('@/composables/useAsyncOperation')
    useAsyncOperation.mockImplementation(mockUseAsyncOperation)
    useBatchAsyncOperation.mockImplementation(mockUseBatchAsyncOperation)
  })

  const createWrapper = () => {
    return mount(AsyncDataExample, {
      global: {
        plugins: [ElementPlus],
        stubs: {
          'el-card': true,
          'el-button': true,
          'el-space': true,
          'el-progress': true,
          'el-row': true,
          'el-col': true,
          'el-table': true,
          'el-table-column': true,
          'el-empty': true,
          'el-alert': true,
          'el-statistic': true,
          'loading-state': true
        }
      }
    })
  }

  it('renders correctly', () => {
    mockUseAsyncOperation.mockReturnValue(createMockAsyncOperation())
    mockUseBatchAsyncOperation.mockReturnValue(createMockBatchOperation())
    
    wrapper = createWrapper()
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.el-card').exists()).toBe(true)
  })

  it('initializes with default statistics', () => {
    mockUseAsyncOperation.mockReturnValue(createMockAsyncOperation())
    mockUseBatchAsyncOperation.mockReturnValue(createMockBatchOperation())
    
    wrapper = createWrapper()
    
    expect(wrapper.vm.successCount).toBe(0)
    expect(wrapper.vm.errorCount).toBe(0)
    expect(wrapper.vm.operationTimes).toEqual([])
    expect(wrapper.vm.cacheHitCount).toBe(0)
  })

  it('computes average time correctly', () => {
    mockUseAsyncOperation.mockReturnValue(createMockAsyncOperation())
    mockUseBatchAsyncOperation.mockReturnValue(createMockBatchOperation())
    
    wrapper = createWrapper()
    wrapper.vm.operationTimes = [100, 200, 300]
    
    expect(wrapper.vm.averageTime).toBe(200)
  })

  it('returns 0 for average time when no operations', () => {
    mockUseAsyncOperation.mockReturnValue(createMockAsyncOperation())
    mockUseBatchAsyncOperation.mockReturnValue(createMockBatchOperation())
    
    wrapper = createWrapper()
    wrapper.vm.operationTimes = []
    
    expect(wrapper.vm.averageTime).toBe(0)
  })

  it('sets up students async operation correctly', () => {
    const studentsOperation = createMockAsyncOperation({
      execute: vi.fn().mockName('loadStudents'),
      refresh: vi.fn().mockName('refreshStudents')
    })
    
    mockUseAsyncOperation.mockReturnValueOnce(studentsOperation)
    mockUseAsyncOperation.mockReturnValue(createMockAsyncOperation())
    mockUseBatchAsyncOperation.mockReturnValue(createMockBatchOperation())
    
    wrapper = createWrapper()
    
    expect(mockUseAsyncOperation).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: expect.any(Function),
        cache: expect.objectContaining({
          key: 'students-data',
          duration: 2 * 60 * 1000
        }),
        retry: expect.objectContaining({
          times: 2,
          delay: 1000,
          backoff: 2
        }),
        timeout: 10000,
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
        errorMessage: expect.objectContaining({
          show: true,
          custom: expect.any(Function)
        })
      })
    )
  })

  it('sets up teachers async operation correctly', () => {
    const studentsOperation = createMockAsyncOperation()
    const teachersOperation = createMockAsyncOperation({
      execute: vi.fn().mockName('loadTeachers'),
      refresh: vi.fn().mockName('refreshTeachers'),
      cancel: vi.fn().mockName('cancelTeachers')
    })
    
    mockUseAsyncOperation.mockReturnValueOnce(studentsOperation)
    mockUseAsyncOperation.mockReturnValueOnce(teachersOperation)
    mockUseBatchAsyncOperation.mockReturnValue(createMockBatchOperation())
    
    wrapper = createWrapper()
    
    expect(mockUseAsyncOperation).toHaveBeenCalledTimes(2)
    expect(mockUseAsyncOperation).toHaveBeenNthCalledWith(2,
      expect.objectContaining({
        cache: expect.objectContaining({
          key: 'teachers-data',
          duration: 3 * 60 * 1000
        }),
        retry: expect.objectContaining({
          times: 3,
          delay: 800,
          backoff: 1.5
        }),
        debounce: expect.objectContaining({
          delay: 500
        })
      })
    )
  })

  it('sets up batch async operation correctly', () => {
    mockUseAsyncOperation.mockReturnValue(createMockAsyncOperation())
    mockUseAsyncOperation.mockReturnValue(createMockAsyncOperation())
    mockUseBatchAsyncOperation.mockReturnValue(createMockBatchOperation())
    
    wrapper = createWrapper()
    
    expect(mockUseBatchAsyncOperation).toHaveBeenCalledWith(
      expect.arrayContaining([expect.any(Function), expect.any(Function), expect.any(Function)]),
      expect.objectContaining({
        concurrency: 2,
        failFast: false,
        onProgress: expect.any(Function)
      })
    )
  })

  it('calls loadStudents when students button is clicked', async () => {
    const studentsOperation = createMockAsyncOperation({
      execute: vi.fn()
    })
    
    mockUseAsyncOperation.mockReturnValueOnce(studentsOperation)
    mockUseAsyncOperation.mockReturnValue(createMockAsyncOperation())
    mockUseBatchAsyncOperation.mockReturnValue(createMockBatchOperation())
    
    wrapper = createWrapper()
    
    const loadStudentsButton = wrapper.findAllComponents({ name: 'ElButton' })[0]
    await loadStudentsButton.trigger('click')
    
    expect(studentsOperation.execute).toHaveBeenCalled()
  })

  it('calls loadTeachers when teachers button is clicked', async () => {
    const studentsOperation = createMockAsyncOperation()
    const teachersOperation = createMockAsyncOperation({
      execute: vi.fn()
    })
    
    mockUseAsyncOperation.mockReturnValueOnce(studentsOperation)
    mockUseAsyncOperation.mockReturnValueOnce(teachersOperation)
    mockUseBatchAsyncOperation.mockReturnValue(createMockBatchOperation())
    
    wrapper = createWrapper()
    
    const loadTeachersButton = wrapper.findAllComponents({ name: 'ElButton' })[1]
    await loadTeachersButton.trigger('click')
    
    expect(teachersOperation.execute).toHaveBeenCalled()
  })

  it('calls loadBatchData when batch button is clicked', async () => {
    const batchOperation = createMockBatchOperation({
      execute: vi.fn()
    })
    
    mockUseAsyncOperation.mockReturnValue(createMockAsyncOperation())
    mockUseAsyncOperation.mockReturnValue(createMockAsyncOperation())
    mockUseBatchAsyncOperation.mockReturnValueOnce(batchOperation)
    
    wrapper = createWrapper()
    
    const loadBatchButton = wrapper.findAllComponents({ name: 'ElButton' })[2]
    await loadBatchButton.trigger('click')
    
    expect(batchOperation.execute).toHaveBeenCalled()
  })

  it('shows loading state for students when studentsLoading is true', () => {
    const studentsOperation = createMockAsyncOperation({
      loading: true,
      hasData: false,
      hasError: false
    })
    
    mockUseAsyncOperation.mockReturnValueOnce(studentsOperation)
    mockUseAsyncOperation.mockReturnValue(createMockAsyncOperation())
    mockUseBatchAsyncOperation.mockReturnValue(createMockBatchOperation())
    
    wrapper = createWrapper()
    
    const studentsSection = wrapper.findAll('.el-col')[0]
    expect(studentsSection.text()).toContain('加载中')
  })

  it('shows error state for students when studentsHasError is true', () => {
    const studentsOperation = createMockAsyncOperation({
      loading: false,
      hasData: false,
      hasError: true,
      error: { message: 'Test error' }
    })
    
    mockUseAsyncOperation.mockReturnValueOnce(studentsOperation)
    mockUseAsyncOperation.mockReturnValue(createMockAsyncOperation())
    mockUseBatchAsyncOperation.mockReturnValue(createMockBatchOperation())
    
    wrapper = createWrapper()
    
    const studentsSection = wrapper.findAll('.el-col')[0]
    expect(studentsSection.text()).toContain('加载失败')
  })

  it('shows data table for students when studentsHasData is true', () => {
    const mockStudentsData = [
      { id: 1, name: '张小明', age: 6, class: '大班A' }
    ]
    
    const studentsOperation = createMockAsyncOperation({
      loading: false,
      hasData: true,
      data: mockStudentsData
    })
    
    mockUseAsyncOperation.mockReturnValueOnce(studentsOperation)
    mockUseAsyncOperation.mockReturnValue(createMockAsyncOperation())
    mockUseBatchAsyncOperation.mockReturnValue(createMockBatchOperation())
    
    wrapper = createWrapper()
    
    const studentsSection = wrapper.findAll('.el-col')[0]
    expect(studentsSection.find('.el-table').exists()).toBe(true)
  })

  it('shows empty state for students when no data', () => {
    const studentsOperation = createMockAsyncOperation({
      loading: false,
      hasData: false,
      hasError: false
    })
    
    mockUseAsyncOperation.mockReturnValueOnce(studentsOperation)
    mockUseAsyncOperation.mockReturnValue(createMockAsyncOperation())
    mockUseBatchAsyncOperation.mockReturnValue(createMockBatchOperation())
    
    wrapper = createWrapper()
    
    const studentsSection = wrapper.findAll('.el-col')[0]
    expect(studentsSection.find('.el-empty').exists()).toBe(true)
  })

  it('calls refreshAll when refresh button is clicked', async () => {
    const studentsOperation = createMockAsyncOperation({
      refresh: vi.fn()
    })
    const teachersOperation = createMockAsyncOperation({
      refresh: vi.fn()
    })
    
    mockUseAsyncOperation.mockReturnValueOnce(studentsOperation)
    mockUseAsyncOperation.mockReturnValueOnce(teachersOperation)
    mockUseBatchAsyncOperation.mockReturnValue(createMockBatchOperation())
    
    wrapper = createWrapper()
    
    const refreshButton = wrapper.findAllComponents({ name: 'ElButton' })[3]
    await refreshButton.trigger('click')
    
    expect(studentsOperation.refresh).toHaveBeenCalled()
    expect(teachersOperation.refresh).toHaveBeenCalled()
  })

  it('calls cancelAll when cancel button is clicked', async () => {
    const teachersOperation = createMockAsyncOperation({
      cancel: vi.fn()
    })
    
    mockUseAsyncOperation.mockReturnValue(createMockAsyncOperation())
    mockUseAsyncOperation.mockReturnValueOnce(teachersOperation)
    mockUseBatchAsyncOperation.mockReturnValue(createMockBatchOperation())
    
    wrapper = createWrapper()
    
    const cancelButton = wrapper.findAllComponents({ name: 'ElButton' })[4]
    await cancelButton.trigger('click')
    
    expect(teachersOperation.cancel).toHaveBeenCalled()
  })

  it('exports students data as CSV', () => {
    const mockStudentsData = [
      { id: 1, name: '张小明', age: 6, class: '大班A' }
    ]
    
    const studentsOperation = createMockAsyncOperation({
      data: mockStudentsData
    })
    
    mockUseAsyncOperation.mockReturnValueOnce(studentsOperation)
    mockUseAsyncOperation.mockReturnValue(createMockAsyncOperation())
    mockUseBatchAsyncOperation.mockReturnValue(createMockBatchOperation())
    
    wrapper = createWrapper()
    
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL')
    const clickSpy = vi.fn()
    
    // Mock document.createElement
    const originalCreateElement = document.createElement
    document.createElement = vi.fn().mockImplementation((tagName) => {
      if (tagName === 'a') {
        return {
          href: '',
          download: '',
          click: clickSpy
        }
      }
      return originalCreateElement(tagName)
    })
    
    wrapper.vm.exportStudents()
    
    expect(createObjectURLSpy).toHaveBeenCalled()
    document.createElement = originalCreateElement
  })

  it('updates batch progress correctly', () => {
    const batchOperation = createMockBatchOperation({
      execute: vi.fn()
    })
    
    mockUseAsyncOperation.mockReturnValue(createMockAsyncOperation())
    mockUseAsyncOperation.mockReturnValue(createMockAsyncOperation())
    mockUseBatchAsyncOperation.mockReturnValueOnce(batchOperation)
    
    wrapper = createWrapper()
    
    // Simulate progress callback
    const onProgressCallback = mockUseBatchAsyncOperation.mock.calls[0][1].onProgress
    onProgressCallback(5, 10)
    
    expect(wrapper.vm.batchCompleted).toBe(5)
    expect(wrapper.vm.batchTotal).toBe(10)
  })
})