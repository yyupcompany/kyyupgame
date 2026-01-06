import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import MemorySearch from '@/components/ai/memory/MemorySearch.vue';
import MemoryCard from '@/components/ai/memory/MemoryCard.vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// Mock Element Plus
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus');
  return {
    ...actual,
    ElMessage: {
      error: vi.fn(),
      success: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn()
    }
  };
});

// Mock request
const mockRequest = {
  get: vi.fn(),
  del: vi.fn()
};

vi.mock('@/utils/request', () => mockRequest);

// Mock AI_MEMORY_ENDPOINTS
vi.mock('@/api/endpoints', () => ({
  AI_MEMORY_ENDPOINTS: {
    SEARCH: (userId: number) => `/api/ai/memory/${userId}/search`,
    DELETE: (userId: number, memoryId: number) => `/api/ai/memory/${userId}/${memoryId}`
  }
}));

// 控制台错误检测变量
let consoleSpy: any

describe('MemorySearch', () => {
  let wrapper: any;
  const mockUserId = 1;

  const mockMemories = [
    {
      id: 1,
      userId: 1,
      conversationId: 'conv-1',
      content: 'First memory content',
      importance: 0.8,
      memoryType: 'short_term',
      createdAt: '2024-01-01T12:00:00Z'
    },
    {
      id: 2,
      userId: 1,
      conversationId: 'conv-2',
      content: 'Second memory content',
      importance: 0.6,
      memoryType: 'long_term',
      createdAt: '2024-01-02T12:00:00Z'
    }
  ];

  const mockApiResponse = {
    items: mockMemories,
    total: 2
  };

  const createWrapper = (props = {}) => {
    return mount(MemorySearch, {
      props: {
        userId: mockUserId,
        ...props
      },
      global: {
        stubs: {
          'el-input': true,
          'el-button': true,
          'el-icon': true,
          'el-select': true,
          'el-option': true,
          'el-row': true,
          'el-col': true,
          'el-form-item': true,
          'el-slider': true,
          'el-date-picker': true,
          'el-skeleton': true,
          'el-empty': true,
          'el-pagination': true,
          'el-dialog': true,
          'el-tag': true,
          'el-rate': true,
          'memory-card': MemoryCard
        },
        components: {
          MemoryCard
        }
      }
    });
  };

  beforeEach(() => {
    wrapper = createWrapper();
    vi.clearAllMocks();
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    wrapper.unmount();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('Component Rendering', () => {
    it('should render correctly with default props', () => {
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.memory-search').exists()).toBe(true);
    });

    it('should render search header', () => {
      expect(wrapper.find('.search-header').exists()).toBe(true);
    });

    it('should render search input with button', () => {
      const searchInput = wrapper.find('.search-header .el-input');
      const searchButton = wrapper.find('.search-header .el-button');
      
      expect(searchInput.exists()).toBe(true);
      expect(searchButton.exists()).toBe(true);
    });

    it('should render search filters', () => {
      expect(wrapper.find('.search-filters').exists()).toBe(true);
    });

    it('should render advanced filters section', () => {
      expect(wrapper.find('.advanced-filters').exists()).toBe(true);
    });

    it('should not show advanced filters by default', () => {
      expect(wrapper.vm.showAdvancedFilters).toBe(false);
    });
  });

  describe('Search Input', () => {
    it('should update search query on input', async () => {
      const searchInput = wrapper.find('.search-header .el-input');
      await searchInput.setValue('test query');
      
      expect(wrapper.vm.searchQuery).toBe('test query');
    });

    it('should trigger search on button click', async () => {
      mockRequest.get.mockResolvedValue(mockApiResponse);
      
      const searchInput = wrapper.find('.search-header .el-input');
      await searchInput.setValue('test query');
      
      const searchButton = wrapper.find('.search-header .el-button');
      await searchButton.trigger('click');
      
      expect(mockRequest.get).toHaveBeenCalledWith(
        `/api/ai/memory/1/search`,
        expect.objectContaining({
          params: expect.objectContaining({
            userId: 1,
            query: 'test query'
          })
        })
      );
    });

    it('should trigger search on enter key', async () => {
      mockRequest.get.mockResolvedValue(mockApiResponse);
      
      const searchInput = wrapper.find('.search-header .el-input');
      await searchInput.setValue('test query');
      await searchInput.trigger('keyup.enter');
      
      expect(mockRequest.get).toHaveBeenCalled();
    });
  });

  describe('Search Filters', () => {
    it('should update memory type filter', async () => {
      const select = wrapper.find('.search-filters .el-select');
      await select.setValue('short_term');
      
      expect(wrapper.vm.searchFilters.memoryType).toBe('short_term');
    });

    it('should update sort by filter', async () => {
      const select = wrapper.findAll('.search-filters .el-select')[1];
      await select.setValue('importance_desc');
      
      expect(wrapper.vm.searchFilters.sortBy).toBe('importance_desc');
    });

    it('should toggle advanced filters visibility', async () => {
      const toggleButton = wrapper.find('.search-filters .el-button:last-child');
      await toggleButton.trigger('click');
      
      expect(wrapper.vm.showAdvancedFilters).toBe(true);
      expect(toggleButton.text()).toContain('隐藏高级筛选');
      
      await toggleButton.trigger('click');
      
      expect(wrapper.vm.showAdvancedFilters).toBe(false);
      expect(toggleButton.text()).toContain('高级筛选');
    });
  });

  describe('Advanced Filters', () => {
    beforeEach(async () => {
      await wrapper.setData({ showAdvancedFilters: true });
    });

    it('should update minimum importance filter', async () => {
      const slider = wrapper.find('.advanced-filters .el-slider');
      await slider.setValue(0.8);
      
      expect(wrapper.vm.searchFilters.minImportance).toBe(0.8);
    });

    it('should update from date filter', async () => {
      const datePicker = wrapper.findAll('.advanced-filters .el-date-picker')[0];
      await datePicker.setValue('2024-01-01');
      
      expect(wrapper.vm.searchFilters.fromDate).toBe('2024-01-01');
    });

    it('should update to date filter', async () => {
      const datePicker = wrapper.findAll('.advanced-filters .el-date-picker')[1];
      await datePicker.setValue('2024-01-31');
      
      expect(wrapper.vm.searchFilters.toDate).toBe('2024-01-31');
    });

    it('should apply filters when apply button clicked', async () => {
      mockRequest.get.mockResolvedValue(mockApiResponse);
      
      wrapper.vm.searchFilters.minImportance = 0.7;
      wrapper.vm.searchFilters.fromDate = '2024-01-01';
      
      const applyButton = wrapper.find('.filter-actions .el-button[type="primary"]');
      await applyButton.trigger('click');
      
      expect(mockRequest.get).toHaveBeenCalledWith(
        `/api/ai/memory/1/search`,
        expect.objectContaining({
          params: expect.objectContaining({
            minImportance: 0.7,
            fromDate: '2024-01-01'
          })
        })
      );
    });

    it('should reset filters when reset button clicked', async () => {
      wrapper.vm.searchFilters.memoryType = 'short_term';
      wrapper.vm.searchFilters.minImportance = 0.7;
      
      const resetButton = wrapper.find('.filter-actions .el-button:not([type])');
      await resetButton.trigger('click');
      
      expect(wrapper.vm.searchFilters.memoryType).toBe('');
      expect(wrapper.vm.searchFilters.minImportance).toBe(0);
      expect(wrapper.vm.searchFilters.fromDate).toBe('');
      expect(wrapper.vm.searchFilters.toDate).toBe('');
      expect(wrapper.vm.searchFilters.sortBy).toBe('date_desc');
      expect(wrapper.vm.pagination.currentPage).toBe(1);
    });
  });

  describe('Search Results', () => {
    beforeEach(async () => {
      mockRequest.get.mockResolvedValue(mockApiResponse);
      
      const searchInput = wrapper.find('.search-header .el-input');
      await searchInput.setValue('test query');
      
      const searchButton = wrapper.find('.search-header .el-button');
      await searchButton.trigger('click');
      
      await nextTick();
    });

    it('should display search results', () => {
      expect(wrapper.vm.searchResults).toEqual(mockMemories);
      expect(wrapper.vm.hasSearched).toBe(true);
      expect(wrapper.find('.search-results').exists()).toBe(true);
    });

    it('should render memory cards for results', () => {
      const memoryCards = wrapper.findAllComponents(MemoryCard);
      expect(memoryCards.length).toBe(2);
      
      expect(memoryCards[0].props('memory')).toEqual(mockMemories[0]);
      expect(memoryCards[1].props('memory')).toEqual(mockMemories[1]);
    });

    it('should display pagination', () => {
      const pagination = wrapper.find('.pagination .el-pagination');
      expect(pagination.exists()).toBe(true);
      expect(pagination.props('total')).toBe(2);
    });

    it('should handle empty search results', async () => {
      mockRequest.get.mockResolvedValue({ items: [], total: 0 });
      
      const searchInput = wrapper.find('.search-header .el-input');
      await searchInput.setValue('no results');
      
      const searchButton = wrapper.find('.search-header .el-button');
      await searchButton.trigger('click');
      
      await nextTick();
      
      expect(wrapper.find('.no-results').exists()).toBe(true);
      expect(wrapper.find('.el-empty').exists()).toBe(true);
    });
  });

  describe('Loading States', () => {
    it('should show loading state during search', async () => {
      mockRequest.get.mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve(mockApiResponse), 100);
        });
      });
      
      const searchInput = wrapper.find('.search-header .el-input');
      await searchInput.setValue('test query');
      
      const searchButton = wrapper.find('.search-header .el-button');
      searchButton.trigger('click');
      
      await nextTick();
      
      expect(wrapper.vm.isSearching).toBe(true);
      expect(wrapper.find('.search-loading').exists()).toBe(true);
    });

    it('should hide loading state when search completes', async () => {
      mockRequest.get.mockResolvedValue(mockApiResponse);
      
      const searchInput = wrapper.find('.search-header .el-input');
      await searchInput.setValue('test query');
      
      const searchButton = wrapper.find('.search-header .el-button');
      await searchButton.trigger('click');
      
      await nextTick();
      
      expect(wrapper.vm.isSearching).toBe(false);
      expect(wrapper.find('.search-loading').exists()).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle search errors gracefully', async () => {
      mockRequest.get.mockRejectedValue(new Error('Search failed'));
      
      const searchInput = wrapper.find('.search-header .el-input');
      await searchInput.setValue('test query');
      
      const searchButton = wrapper.find('.search-header .el-button');
      await searchButton.trigger('click');
      
      await nextTick();
      
      expect(ElMessage.error).toHaveBeenCalledWith({
        message: '搜索记忆失败',
        type: 'error',
        duration: 3000
      });
      
      expect(wrapper.vm.searchResults).toEqual([]);
      expect(wrapper.vm.isSearching).toBe(false);
    });
  });

  describe('Memory Actions', () => {
    beforeEach(async () => {
      mockRequest.get.mockResolvedValue(mockApiResponse);
      
      const searchInput = wrapper.find('.search-header .el-input');
      await searchInput.setValue('test query');
      
      const searchButton = wrapper.find('.search-header .el-button');
      await searchButton.trigger('click');
      
      await nextTick();
    });

    it('should handle view memory action', async () => {
      const memoryCard = wrapper.findAllComponents(MemoryCard)[0];
      await memoryCard.vm.$emit('view', mockMemories[0]);
      
      expect(wrapper.vm.selectedMemory).toEqual(mockMemories[0]);
      expect(wrapper.vm.memoryDetailVisible).toBe(true);
    });

    it('should handle delete memory action', async () => {
      mockRequest.del.mockResolvedValue({});
      (ElMessageBox.confirm as any).mockResolvedValue(true);
      
      const memoryCard = wrapper.findAllComponents(MemoryCard)[0];
      await memoryCard.vm.$emit('delete', mockMemories[0]);
      
      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        '确定要删除这条记忆吗？此操作不可撤销。',
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      );
      
      expect(mockRequest.del).toHaveBeenCalledWith(`/api/ai/memory/1/1`);
      expect(ElMessage.success).toHaveBeenCalledWith({
        message: '记忆已删除',
        type: 'success',
        duration: 2000
      });
      
      expect(wrapper.vm.searchResults).not.toContain(mockMemories[0]);
    });

    it('should cancel delete operation when user cancels', async () => {
      (ElMessageBox.confirm as any).mockRejectedValue('cancel');
      
      const memoryCard = wrapper.findAllComponents(MemoryCard)[0];
      await memoryCard.vm.$emit('delete', mockMemories[0]);
      
      expect(ElMessage.success).not.toHaveBeenCalled();
      expect(wrapper.vm.searchResults).toContain(mockMemories[0]);
    });

    it('should handle delete errors', async () => {
      mockRequest.del.mockRejectedValue(new Error('Delete failed'));
      (ElMessageBox.confirm as any).mockResolvedValue(true);
      
      const memoryCard = wrapper.findAllComponents(MemoryCard)[0];
      await memoryCard.vm.$emit('delete', mockMemories[0]);
      
      expect(ElMessage.error).toHaveBeenCalledWith({
        message: '删除记忆失败',
        type: 'error',
        duration: 3000
      });
    });
  });

  describe('Memory Detail Dialog', () => {
    beforeEach(async () => {
      mockRequest.get.mockResolvedValue(mockApiResponse);
      
      const searchInput = wrapper.find('.search-header .el-input');
      await searchInput.setValue('test query');
      
      const searchButton = wrapper.find('.search-header .el-button');
      await searchButton.trigger('click');
      
      await nextTick();
      
      const memoryCard = wrapper.findAllComponents(MemoryCard)[0];
      await memoryCard.vm.$emit('view', mockMemories[0]);
    });

    it('should show memory detail dialog', () => {
      expect(wrapper.vm.memoryDetailVisible).toBe(true);
      expect(wrapper.vm.selectedMemory).toEqual(mockMemories[0]);
    });

    it('should display memory content in dialog', () => {
      const dialog = wrapper.find('.el-dialog');
      expect(dialog.exists()).toBe(true);
      
      const content = wrapper.find('.memory-content');
      expect(content.exists()).toBe(true);
      expect(content.text()).toBe(mockMemories[0].content);
    });

    it('should display memory meta information', () => {
      const metaItems = wrapper.findAll('.meta-item');
      expect(metaItems.length).toBe(4); // importance, type, createdAt, expiresAt
      
      expect(metaItems[0].find('.meta-label').text()).toBe('重要性:');
      expect(metaItems[1].find('.meta-label').text()).toBe('类型:');
      expect(metaItems[2].find('.meta-label').text()).toBe('创建时间:');
      expect(metaItems[3].find('.meta-label').text()).toBe('过期时间:');
    });
  });

  describe('Pagination', () => {
    beforeEach(async () => {
      // Mock a response with many items to test pagination
      const manyItems = Array.from({ length: 25 }, (_, i) => ({
        ...mockMemories[0],
        id: i + 1
      }));
      
      mockRequest.get.mockResolvedValue({
        items: manyItems.slice(0, 10),
        total: 25
      });
      
      const searchInput = wrapper.find('.search-header .el-input');
      await searchInput.setValue('test query');
      
      const searchButton = wrapper.find('.search-header .el-button');
      await searchButton.trigger('click');
      
      await nextTick();
    });

    it('should handle page size change', async () => {
      mockRequest.get.mockResolvedValue(mockApiResponse);
      
      const pagination = wrapper.find('.pagination .el-pagination');
      await pagination.vm.$emit('size-change', 20);
      
      expect(wrapper.vm.pagination.pageSize).toBe(20);
      expect(wrapper.vm.pagination.currentPage).toBe(1);
      expect(mockRequest.get).toHaveBeenCalled();
    });

    it('should handle page change', async () => {
      mockRequest.get.mockResolvedValue(mockApiResponse);
      
      const pagination = wrapper.find('.pagination .el-pagination');
      await pagination.vm.$emit('current-change', 2);
      
      expect(wrapper.vm.pagination.currentPage).toBe(2);
      expect(mockRequest.get).toHaveBeenCalled();
    });
  });

  describe('Search Parameters', () => {
    it('should build correct search parameters', async () => {
      mockRequest.get.mockResolvedValue(mockApiResponse);
      
      // Set up filters
      wrapper.vm.searchFilters.memoryType = 'short_term';
      wrapper.vm.searchFilters.minImportance = 0.7;
      wrapper.vm.searchFilters.fromDate = '2024-01-01';
      wrapper.vm.searchFilters.toDate = '2024-01-31';
      wrapper.vm.searchFilters.sortBy = 'importance_desc';
      
      const searchInput = wrapper.find('.search-header .el-input');
      await searchInput.setValue('test query');
      
      const searchButton = wrapper.find('.search-header .el-button');
      await searchButton.trigger('click');
      
      expect(mockRequest.get).toHaveBeenCalledWith(
        `/api/ai/memory/1/search`,
        expect.objectContaining({
          params: expect.objectContaining({
            userId: 1,
            query: 'test query',
            limit: 10,
            offset: 0,
            memoryType: 'short_term',
            minImportance: 0.7,
            fromDate: '2024-01-01',
            toDate: '2024-01-31',
            sortField: 'importance',
            sortDirection: 'DESC'
          })
        })
      );
    });

    it('should handle date sorting correctly', async () => {
      mockRequest.get.mockResolvedValue(mockApiResponse);
      
      wrapper.vm.searchFilters.sortBy = 'date_asc';
      
      const searchInput = wrapper.find('.search-header .el-input');
      await searchInput.setValue('test query');
      
      const searchButton = wrapper.find('.search-header .el-button');
      await searchButton.trigger('click');
      
      expect(mockRequest.get).toHaveBeenCalledWith(
        `/api/ai/memory/1/search`,
        expect.objectContaining({
          params: expect.objectContaining({
            sortField: 'createdAt',
            sortDirection: 'ASC'
          })
        })
      );
    });
  });

  describe('Memory Type Labels', () => {
    it('should return correct labels for memory types', () => {
      expect(wrapper.vm.getMemoryTypeLabel('immediate')).toBe('即时记忆');
      expect(wrapper.vm.getMemoryTypeLabel('short_term')).toBe('短期记忆');
      expect(wrapper.vm.getMemoryTypeLabel('long_term')).toBe('长期记忆');
      expect(wrapper.vm.getMemoryTypeLabel('shortterm')).toBe('短期记忆');
      expect(wrapper.vm.getMemoryTypeLabel('longterm')).toBe('长期记忆');
    });

    it('should return type as label for unknown types', () => {
      expect(wrapper.vm.getMemoryTypeLabel('unknown')).toBe('unknown');
    });
  });

  describe('Date Formatting', () => {
    it('should format date correctly', () => {
      const formattedDate = wrapper.vm.formatDate('2024-01-01T12:00:00Z');
      expect(formattedDate).toBeDefined();
      expect(typeof formattedDate).toBe('string');
    });

    it('should handle invalid date format', () => {
      const formattedDate = wrapper.vm.formatDate('invalid-date');
      expect(formattedDate).toBeDefined();
    });
  });

  describe('Component Lifecycle', () => {
    it('should perform initial search on mount', () => {
      expect(mockRequest.get).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle API response without items', async () => {
      mockRequest.get.mockResolvedValue({ total: 0 });
      
      const searchInput = wrapper.find('.search-header .el-input');
      await searchInput.setValue('test query');
      
      const searchButton = wrapper.find('.search-header .el-button');
      await searchButton.trigger('click');
      
      await nextTick();
      
      expect(wrapper.vm.searchResults).toEqual([]);
    });

    it('should handle API response without total', async () => {
      mockRequest.get.mockResolvedValue({ items: mockMemories });
      
      const searchInput = wrapper.find('.search-header .el-input');
      await searchInput.setValue('test query');
      
      const searchButton = wrapper.find('.search-header .el-button');
      await searchButton.trigger('click');
      
      await nextTick();
      
      expect(wrapper.vm.pagination.total).toBe(0);
    });

    it('should handle empty search query', async () => {
      mockRequest.get.mockResolvedValue(mockApiResponse);
      
      const searchInput = wrapper.find('.search-header .el-input');
      await searchInput.setValue('');
      
      const searchButton = wrapper.find('.search-header .el-button');
      await searchButton.trigger('click');
      
      await nextTick();
      
      expect(mockRequest.get).toHaveBeenCalledWith(
        `/api/ai/memory/1/search`,
        expect.objectContaining({
          params: expect.objectContaining({
            query: ''
          })
        })
      );
    });
  });
});