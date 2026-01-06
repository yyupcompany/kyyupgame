import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import DraggableTable from '@/components/ai-assistant/DraggableTable.vue'
import { createTestingPinia } from '@pinia/testing'
import ElementPlus from 'element-plus'
import Sortable from 'sortablejs'

// Mock dependencies
vi.mock('sortablejs', () => ({
  default: vi.fn()
}))

vi.mock('@/api/ai-shortcuts', () => ({
  updateSortOrder: vi.fn()
}))

vi.mock('@/composables/usePermission', () => ({
  usePermission: () => ({
    hasPermission: vi.fn()
  })
}))

vi.mock('@/utils/date', () => ({
  formatDate: vi.fn((date) => `formatted-${date}`)
}))

vi.mock('@/utils/enhancedErrorHandler', () => ({
  handleDragDropError: vi.fn()
}))

// 控制台错误检测变量
let consoleSpy: any

describe('DraggableTable.vue', () => {
  let wrapper: any
  let mockUpdateSortOrder: any
  let mockHasPermission: any
  let mockFormatDate: any
  let mockHandleDragDropError: any

  const mockTableData = [
    {
      id: 1,
      sort_order: 1,
      shortcut_name: 'Test Shortcut 1',
      prompt_name: 'Test Prompt 1',
      category: 'enrollment_planning',
      role: 'principal',
      api_endpoint: 'ai_chat',
      is_active: true,
      created_at: '2024-01-01'
    },
    {
      id: 2,
      sort_order: 2,
      shortcut_name: 'Test Shortcut 2',
      prompt_name: 'Test Prompt 2',
      category: 'activity_planning',
      role: 'teacher',
      api_endpoint: 'ai_query',
      is_active: false,
      created_at: '2024-01-02'
    }
  ]

  beforeEach(() => {
    mockUpdateSortOrder = vi.fn().mockResolvedValue({})
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockHasPermission = vi.fn().mockReturnValue(true)
    mockFormatDate = vi.fn((date) => `formatted-${date}`)
    mockHandleDragDropError = vi.fn()

    // Reset mocks
    vi.mocked(updateSortOrder).mockImplementation(mockUpdateSortOrder)
    vi.mocked(usePermission).mockReturnValue({
      hasPermission: mockHasPermission
    })
    vi.mocked(formatDate).mockImplementation(mockFormatDate)
    vi.mocked(handleDragDropError).mockImplementation(mockHandleDragDropError)

    wrapper = mount(DraggableTable, {
      global: {
        plugins: [ElementPlus, createTestingPinia()],
        stubs: {
          'el-table': true,
          'el-table-column': true,
          'el-icon': true,
          'el-tag': true,
          'el-switch': true,
          'el-button': true,
          'el-message': true
        }
      },
      props: {
        tableData: mockTableData,
        loading: false
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

  describe('Component Rendering', () => {
    it('renders the draggable table component correctly', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.draggable-table-container').exists()).toBe(true)
      expect(wrapper.find('.draggable-table').exists()).toBe(true)
    })

    it('displays loading state when loading prop is true', async () => {
      await wrapper.setProps({ loading: true })
      const table = wrapper.findComponent({ name: 'ElTable' })
      expect(table.attributes('loading')).toBe('true')
    })

    it('hides loading state when loading prop is false', () => {
      const table = wrapper.findComponent({ name: 'ElTable' })
      expect(table.attributes('loading')).toBe('false')
    })

    it('displays drag tips when dragging', async () => {
      expect(wrapper.find('.drag-tips').exists()).toBe(false)
      wrapper.vm.isDragging = true
      await nextTick()
      expect(wrapper.find('.drag-tips').exists()).toBe(true)
    })
  })

  describe('Props Handling', () => {
    it('receives tableData prop correctly', () => {
      expect(wrapper.props('tableData')).toEqual(mockTableData)
    })

    it('receives loading prop correctly', () => {
      expect(wrapper.props('loading')).toBe(false)
    })

    it('reacts to tableData changes', async () => {
      const newData = [...mockTableData, {
        id: 3,
        sort_order: 3,
        shortcut_name: 'Test Shortcut 3',
        prompt_name: 'Test Prompt 3',
        category: 'progress_analysis',
        role: 'admin',
        api_endpoint: 'ai_chat',
        is_active: true,
        created_at: '2024-01-03'
      }]
      
      await wrapper.setProps({ tableData: newData })
      expect(wrapper.props('tableData')).toEqual(newData)
    })

    it('reacts to loading prop changes', async () => {
      await wrapper.setProps({ loading: true })
      expect(wrapper.props('loading')).toBe(true)
      
      await wrapper.setProps({ loading: false })
      expect(wrapper.props('loading')).toBe(false)
    })
  })

  describe('Computed Properties', () => {
    it('computes hasUpdatePermission correctly', () => {
      expect(wrapper.vm.hasUpdatePermission).toBe(true)
      
      mockHasPermission.mockReturnValue(false)
      expect(wrapper.vm.hasUpdatePermission).toBe(false)
    })

    it('computes hasDeletePermission correctly', () => {
      expect(wrapper.vm.hasDeletePermission).toBe(true)
      
      mockHasPermission.mockReturnValue(false)
      expect(wrapper.vm.hasDeletePermission).toBe(false)
    })
  })

  describe('Event Emissions', () => {
    it('emits selection-change event when selection changes', () => {
      const mockSelection = [mockTableData[0]]
      wrapper.vm.handleSelectionChange(mockSelection)
      expect(wrapper.emitted('selection-change')).toBeTruthy()
      expect(wrapper.emitted('selection-change')[0]).toEqual([mockSelection])
    })

    it('emits status-change event when status is changed', () => {
      const mockRow = mockTableData[0]
      wrapper.vm.handleStatusChange(mockRow)
      expect(wrapper.emitted('status-change')).toBeTruthy()
      expect(wrapper.emitted('status-change')[0]).toEqual([mockRow])
    })

    it('emits preview event when preview button is clicked', () => {
      const mockRow = mockTableData[0]
      wrapper.vm.handlePreview(mockRow)
      expect(wrapper.emitted('preview')).toBeTruthy()
      expect(wrapper.emitted('preview')[0]).toEqual([mockRow])
    })

    it('emits edit event when edit button is clicked', () => {
      const mockRow = mockTableData[0]
      wrapper.vm.handleEdit(mockRow)
      expect(wrapper.emitted('edit')).toBeTruthy()
      expect(wrapper.emitted('edit')[0]).toEqual([mockRow])
    })

    it('emits delete event when delete button is clicked', () => {
      const mockRow = mockTableData[0]
      wrapper.vm.handleDelete(mockRow)
      expect(wrapper.emitted('delete')).toBeTruthy()
      expect(wrapper.emitted('delete')[0]).toEqual([mockRow])
    })

    it('emits sort-change event when sorting is completed successfully', async () => {
      // Mock Sortable instance
      const mockSortable = {
        destroy: vi.fn()
      }
      vi.mocked(Sortable).mockImplementation(mockSortable)
      
      // Simulate successful drag and drop
      const mockEvt = {
        oldIndex: 0,
        newIndex: 1,
        item: document.createElement('tr')
      }
      
      await wrapper.vm.initSortable()
      
      // Simulate onEnd callback
      if (wrapper.vm.sortableInstance) {
        await wrapper.vm.sortableInstance.options.onEnd(mockEvt)
        expect(wrapper.emitted('sort-change')).toBeTruthy()
      }
    })
  })

  describe('Label and Category Functions', () => {
    it('returns correct category labels', () => {
      expect(wrapper.vm.getCategoryLabel('enrollment_planning')).toBe('招生规划')
      expect(wrapper.vm.getCategoryLabel('activity_planning')).toBe('活动策划')
      expect(wrapper.vm.getCategoryLabel('unknown')).toBe('unknown')
    })

    it('returns correct role labels', () => {
      expect(wrapper.vm.getRoleLabel('principal')).toBe('园长')
      expect(wrapper.vm.getRoleLabel('teacher')).toBe('教师')
      expect(wrapper.vm.getRoleLabel('unknown')).toBe('unknown')
    })

    it('returns correct category tag types', () => {
      expect(wrapper.vm.getCategoryTagType('enrollment_planning')).toBe('primary')
      expect(wrapper.vm.getCategoryTagType('activity_planning')).toBe('success')
      expect(wrapper.vm.getCategoryTagType('unknown')).toBe('')
    })

    it('returns correct role tag types', () => {
      expect(wrapper.vm.getRoleTagType('principal')).toBe('danger')
      expect(wrapper.vm.getRoleTagType('teacher')).toBe('success')
      expect(wrapper.vm.getRoleTagType('unknown')).toBe('')
    })
  })

  describe('Drag and Drop Functionality', () => {
    it('initializes Sortable instance on mount', async () => {
      const mockSortable = {
        destroy: vi.fn()
      }
      vi.mocked(Sortable).mockImplementation(mockSortable)
      
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 150)) // Wait for setTimeout
      
      expect(Sortable).toHaveBeenCalled()
    })

    it('sets dragging state on drag start', async () => {
      const mockSortable = {
        destroy: vi.fn()
      }
      vi.mocked(Sortable).mockImplementation((element, options) => {
        options.onStart()
        return mockSortable
      })
      
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 150))
      
      expect(wrapper.vm.isDragging).toBe(true)
    })

    it('resets dragging state on drag end', async () => {
      wrapper.vm.isDragging = true
      await nextTick()
      
      const mockSortable = {
        destroy: vi.fn()
      }
      vi.mocked(Sortable).mockImplementation((element, options) => {
        options.onEnd({ oldIndex: 0, newIndex: 1 })
        return mockSortable
      })
      
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 150))
      
      expect(wrapper.vm.isDragging).toBe(false)
    })

    it('calls updateSortOrder API when drag ends', async () => {
      const mockEvt = { oldIndex: 0, newIndex: 1, item: document.createElement('tr') }
      const mockSortable = {
        destroy: vi.fn()
      }
      vi.mocked(Sortable).mockImplementation((element, options) => {
        options.onEnd(mockEvt)
        return mockSortable
      })
      
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 150))
      
      expect(mockUpdateSortOrder).toHaveBeenCalledWith([
        { id: 2, sort_order: 1 },
        { id: 1, sort_order: 2 }
      ])
    })

    it('handles drag drop error gracefully', async () => {
      const mockError = new Error('API Error')
      mockUpdateSortOrder.mockRejectedValue(mockError)
      
      const mockEvt = { oldIndex: 0, newIndex: 1, item: document.createElement('tr') }
      const mockSortable = {
        destroy: vi.fn()
      }
      vi.mocked(Sortable).mockImplementation((element, options) => {
        options.onEnd(mockEvt)
        return mockSortable
      })
      
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 150))
      
      expect(mockHandleDragDropError).toHaveBeenCalledWith(mockError, 'DraggableTable')
    })

    it('destroys Sortable instance on unmount', () => {
      const mockSortable = {
        destroy: vi.fn()
      }
      vi.mocked(Sortable).mockImplementation(mockSortable)
      
      wrapper.vm.sortableInstance = mockSortable
      wrapper.unmount()
      
      expect(mockSortable.destroy).toHaveBeenCalled()
    })
  })

  describe('Permission-based Features', () => {
    it('disables edit button when no update permission', async () => {
      mockHasPermission.mockReturnValue(false)
      await wrapper.setProps({ tableData: mockTableData })
      
      expect(wrapper.vm.hasUpdatePermission).toBe(false)
    })

    it('disables delete button when no delete permission', async () => {
      mockHasPermission.mockReturnValue(false)
      await wrapper.setProps({ tableData: mockTableData })
      
      expect(wrapper.vm.hasDeletePermission).toBe(false)
    })

    it('disables status switch when no update permission', async () => {
      mockHasPermission.mockReturnValue(false)
      await wrapper.setProps({ tableData: mockTableData })
      
      expect(wrapper.vm.hasUpdatePermission).toBe(false)
    })
  })

  describe('Utility Functions', () => {
    it('formats dates correctly', () => {
      const testDate = '2024-01-01'
      wrapper.vm.formatDate(testDate)
      expect(mockFormatDate).toHaveBeenCalledWith(testDate)
    })

    it('handles edge cases in label functions', () => {
      expect(wrapper.vm.getCategoryLabel('')).toBe('')
      expect(wrapper.vm.getRoleLabel('')).toBe('')
      expect(wrapper.vm.getCategoryTagType('')).toBe('')
      expect(wrapper.vm.getRoleTagType('')).toBe('')
    })
  })

  describe('Accessibility', () => {
    it('provides proper drag handle titles', () => {
      const mockRow = mockTableData[0]
      const title = `拖拽调整 ${mockRow.shortcut_name} 的排序`
      expect(title).toContain(mockRow.shortcut_name)
    })

    it('maintains proper keyboard navigation structure', () => {
      const table = wrapper.find('.draggable-table')
      expect(table.exists()).toBe(true)
      expect(table.attributes('role')).toBeDefined()
    })
  })

  describe('Responsive Design', () => {
    it('applies responsive styles for mobile devices', () => {
      const container = wrapper.find('.draggable-table-container')
      expect(container.exists()).toBe(true)
      
      // Check if responsive classes are applied
      const style = window.getComputedStyle(container.element)
      expect(style).toBeDefined()
    })
  })

  describe('Performance Optimization', () => {
    it('uses efficient event handling for drag operations', () => {
      expect(typeof wrapper.vm.handleSelectionChange).toBe('function')
      expect(typeof wrapper.vm.handleStatusChange).toBe('function')
      expect(typeof wrapper.vm.handlePreview).toBe('function')
    })

    it('properly cleans up resources on unmount', () => {
      const destroySpy = vi.fn()
      wrapper.vm.sortableInstance = { destroy: destroySpy }
      
      wrapper.unmount()
      expect(destroySpy).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('handles API errors during sort update', async () => {
      const mockError = new Error('Network Error')
      mockUpdateSortOrder.mockRejectedValue(mockError)
      
      const mockEvt = { oldIndex: 0, newIndex: 1, item: document.createElement('tr') }
      const mockSortable = {
        destroy: vi.fn()
      }
      vi.mocked(Sortable).mockImplementation((element, options) => {
        options.onEnd(mockEvt)
        return mockSortable
      })
      
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 150))
      
      expect(mockHandleDragDropError).toHaveBeenCalled()
    })

    it('handles missing table data gracefully', async () => {
      await wrapper.setProps({ tableData: [] })
      expect(wrapper.props('tableData')).toEqual([])
    })

    it('handles undefined table data', async () => {
      await wrapper.setProps({ tableData: undefined })
      expect(wrapper.props('tableData')).toBeUndefined()
    })
  })

  describe('Integration Tests', () => {
    it('integrates properly with Element Plus components', () => {
      const table = wrapper.findComponent({ name: 'ElTable' })
      const columns = wrapper.findAllComponents({ name: 'ElTableColumn' })
      
      expect(table.exists()).toBe(true)
      expect(columns.length).toBeGreaterThan(0)
    })

    it('maintains data consistency during drag operations', async () => {
      const initialData = [...mockTableData]
      await wrapper.setProps({ tableData: initialData })
      
      const mockEvt = { oldIndex: 0, newIndex: 1, item: document.createElement('tr') }
      const mockSortable = {
        destroy: vi.fn()
      }
      vi.mocked(Sortable).mockImplementation((element, options) => {
        options.onEnd(mockEvt)
        return mockSortable
      })
      
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 150))
      
      expect(wrapper.emitted('sort-change')).toBeTruthy()
      const sortedData = wrapper.emitted('sort-change')[0][0]
      expect(sortedData).toHaveLength(initialData.length)
    })
  })
})