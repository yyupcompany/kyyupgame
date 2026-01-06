import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import MemorySearch from '@/components/ai/memory/MemorySearch.vue';
import MemoryCard from '@/components/ai/memory/MemoryCard.vue';

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElInput: {
    name: 'ElInput',
    template: `
      <div class="el-input">
        <div class="el-input__prefix" @click="$emit('click', $event)">
          <slot name="prefix" />
        </div>
        <input 
          :value="modelValue" 
          @input="$emit('update:modelValue', $event.target.value)"
          @keyup.enter="$emit('keyup.enter', $event)"
          class="el-input__inner"
        />
        <div class="el-input__append">
          <slot name="append" />
        </div>
      </div>
    `,
    props: ['modelValue', 'placeholder', 'clearable'],
    emits: ['update:modelValue', 'keyup.enter', 'click']
  },
  ElSelect: {
    name: 'ElSelect',
    template: `
      <div class="el-select" @click="$emit('click', $event)">
        <select :value="modelValue" @change="$emit('update:modelValue', $event.target.value)">
          <slot />
        </select>
      </div>
    `,
    props: ['modelValue', 'placeholder', 'clearable'],
    emits: ['update:modelValue', 'click']
  },
  ElOption: {
    name: 'ElOption',
    template: '<option :value="value"><slot /></option>',
    props: ['value', 'label']
  },
  ElButton: {
    name: 'ElButton',
    template: '<button class="el-button" @click="$emit(\'click\', $event)"><slot /></button>',
    props: ['type'],
    emits: ['click']
  },
  ElIcon: {
    name: 'ElIcon',
    template: '<div class="el-icon"><component :is="$attrs.component" /></div>',
  },
  ElRow: {
    name: 'ElRow',
    template: '<div class="el-row"><slot /></div>',
    props: ['gutter']
  },
  ElCol: {
    name: 'ElCol',
    template: '<div class="el-col"><slot /></div>',
    props: ['span']
  },
  ElFormItem: {
    name: 'ElFormItem',
    template: '<div class="el-form-item"><div class="el-form-item__label">{{ label }}</div><div class="el-form-item__content"><slot /></div></div>',
    props: ['label']
  },
  ElSlider: {
    name: 'ElSlider',
    template: '<div class="el-slider"></div>',
    props: ['modelValue', 'min', 'max', 'step', 'showStops'],
    emits: ['update:modelValue']
  },
  ElDatePicker: {
    name: 'ElDatePicker',
    template: '<div class="el-date-picker"></div>',
    props: ['modelValue', 'type', 'placeholder', 'style'],
    emits: ['update:modelValue']
  },
  ElSkeleton: {
    name: 'ElSkeleton',
    template: '<div class="el-skeleton"><div v-for="i in rows" :key="i" class="el-skeleton__item"></div></div>',
    props: ['rows', 'animated']
  },
  ElEmpty: {
    name: 'ElEmpty',
    template: '<div class="el-empty"><div class="el-empty__description">{{ description }}</div></div>',
    props: ['description']
  },
  ElPagination: {
    name: 'ElPagination',
    template: '<div class="el-pagination"></div>',
    props: ['currentPage', 'pageSize', 'pageSizes', 'layout', 'total'],
    emits: ['update:currentPage', 'update:pageSize', 'size-change', 'current-change']
  },
  ElDialog: {
    name: 'ElDialog',
    template: `
      <div class="el-dialog" v-if="modelValue">
        <div class="el-dialog__header">{{ title }}</div>
        <div class="el-dialog__body"><slot /></div>
      </div>
    `,
    props: ['modelValue', 'title', 'width'],
    emits: ['update:modelValue']
  },
  ElRate: {
    name: 'ElRate',
    template: '<div class="el-rate"></div>',
    props: ['modelValue', 'max', 'step', 'disabled', 'showScore', 'scoreTemplate']
  },
  ElTag: {
    name: 'ElTag',
    template: '<div class="el-tag"><slot /></div>'
  },
  ElMessage: {
    success: vi.fn(),
    error: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn()
  }
}));

// Mock Element Plus icons
vi.mock('@element-plus/icons-vue', () => ({
  Search: { name: 'Search' },
  ArrowDown: { name: 'ArrowDown' },
  ArrowUp: { name: 'ArrowUp' }
}));

// Mock MemoryCard component
vi.mock('@/components/ai/memory/MemoryCard.vue', () => ({
  name: 'MemoryCard',
  template: '<div class="memory-card-mock"><slot /></div>',
  props: ['memory'],
  emits: ['view', 'delete']
}));

// Mock request utility
const mockRequest = {
  get: vi.fn(),
  del: vi.fn()
};
vi.mock('@/utils/request', () => ({
  default: mockRequest
}));

// Mock API endpoints
vi.mock('@/api/endpoints', () => ({
  AI_MEMORY_ENDPOINTS: {
    SEARCH: (userId: number) => `/api/ai/memory/${userId}/search`,
    DELETE: (userId: number, memoryId: number) => `/api/ai/memory/${userId}/${memoryId}`
  }
}));

// 控制台错误检测变量
let consoleSpy: any

describe('MemorySearch.vue', () => {
  let wrapper: any;
  
  const mockProps = {
    userId: 1
  };

  const mockSearchResults = [
    {
      id: 1,
      userId: 1,
      conversationId: 'test-1',
      content: 'Test memory 1',
      importance: 0.8,
      memoryType: 'short_term',
      createdAt: '2024-01-01T10:00:00Z'
    },
    {
      id: 2,
      userId: 1,
      conversationId: 'test-2',
      content: 'Test memory 2',
      importance: 0.6,
      memoryType: 'long_term',
      createdAt: '2024-01-02T10:00:00Z'
    }
  ];

  const createWrapper = (props = {}) => {
    return mount(MemorySearch, {
      props: {
        ...mockProps,
        ...props
      },
      global: {
        stubs: {
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-button': true,
          'el-icon': true,
          'el-row': true,
          'el-col': true,
          'el-form-item': true,
          'el-slider': true,
          'el-date-picker': true,
          'el-skeleton': true,
          'el-empty': true,
          'el-pagination': true,
          'el-dialog': true,
          'el-rate': true,
          'el-tag': true,
          'memory-card': true
        }
      }
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequest.get.mockResolvedValue({
      items: mockSearchResults,
      total: 2
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockRequest.del.mockResolvedValue({});
    vi.mocked(ElMessageBox.confirm).mockResolvedValue(true);
  });

  afterEach(() => {
    if (wrapper) => {
      wrapper.unmount();
    }
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('Component Initialization', () => {
    it('renders properly with required props', () => {
      wrapper = createWrapper();
      expect(wrapper.find('.memory-search').exists()).toBe(true);
      expect(wrapper.find('.search-header').exists()).toBe(true);
    });

    it('initializes with default search filters', () => {
      wrapper = createWrapper();
      expect(wrapper.vm.searchFilters.memoryType).toBe('');
      expect(wrapper.vm.searchFilters.minImportance).toBe(0);
      expect(wrapper.vm.searchFilters.sortBy).toBe('date_desc');
    });

    it('initializes with default pagination', () => {
      wrapper = createWrapper();
      expect(wrapper.vm.pagination.currentPage).toBe(1);
      expect(wrapper.vm.pagination.pageSize).toBe(10);
      expect(wrapper.vm.pagination.total).toBe(0);
    });

    it('starts with advanced filters hidden', () => {
      wrapper = createWrapper();
      expect(wrapper.vm.showAdvancedFilters).toBe(false);
    });

    it('performs initial search on mount', async () => {
      wrapper = createWrapper();
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(mockRequest.get).toHaveBeenCalledWith(
        '/api/ai/memory/1/search',
        expect.objectContaining({
          params: expect.objectContaining({
            userId: 1,
            limit: 10,
            offset: 0
          })
        })
      );
    });
  });

  describe('Search Functionality', () => {
    beforeEach(async () => {
      wrapper = createWrapper();
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('handles search input change', async () => {
      const input = wrapper.find('.el-input .el-input__inner');
      await input.setValue('test query');
      
      expect(wrapper.vm.searchQuery).toBe('test query');
    });

    it('triggers search on enter key', async () => {
      const input = wrapper.find('.el-input .el-input__inner');
      await input.trigger('keyup.enter');
      
      expect(mockRequest.get).toHaveBeenCalledTimes(2); // Initial + search
    });

    it('triggers search on search button click', async () => {
      const searchButton = wrapper.find('.el-input__append .el-button');
      await searchButton.trigger('click');
      
      expect(mockRequest.get).toHaveBeenCalledTimes(2); // Initial + search
    });

    it('shows loading state during search', async () => {
      mockRequest.get.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      wrapper = createWrapper();
      await nextTick();
      
      expect(wrapper.find('.search-loading').exists()).toBe(true);
      expect(wrapper.find('.el-skeleton').exists()).toBe(true);
    });

    it('displays search results when data is available', async () => {
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(wrapper.find('.search-results').exists()).toBe(true);
      expect(wrapper.findAllComponents({ name: 'MemoryCard' }).length).toBe(2);
    });

    it('displays no results message when search returns empty', async () => {
      mockRequest.get.mockResolvedValueOnce({ items: [], total: 0 });
      
      wrapper = createWrapper();
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(wrapper.find('.no-results').exists()).toBe(true);
      expect(wrapper.find('.el-empty').exists()).toBe(true);
      expect(wrapper.vm.hasSearched).toBe(true);
    });

    it('handles search error gracefully', async () => {
      mockRequest.get.mockRejectedValueOnce(new Error('Search failed'));
      
      wrapper = createWrapper();
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(wrapper.vm.searchResults).toEqual([]);
      expect(ElMessage.error).toHaveBeenCalledWith({
        message: '搜索记忆失败',
        type: 'error',
        duration: 3000
      });
    });
  });

  describe('Advanced Filters', () => {
    beforeEach(async () => {
      wrapper = createWrapper();
      await nextTick();
    });

    it('toggles advanced filters visibility', async () => {
      expect(wrapper.vm.showAdvancedFilters).toBe(false);
      expect(wrapper.find('.advanced-filters').exists()).toBe(false);
      
      const toggleButton = wrapper.find('.search-filters .el-button:last-child');
      await toggleButton.trigger('click');
      
      expect(wrapper.vm.showAdvancedFilters).toBe(true);
      expect(wrapper.find('.advanced-filters').exists()).toBe(true);
    });

    it('updates memory type filter', async () => {
      const select = wrapper.find('.search-filters .el-select:first-child');
      await select.setValue('short_term');
      
      expect(wrapper.vm.searchFilters.memoryType).toBe('short_term');
    });

    it('updates sort filter', async () => {
      const select = wrapper.find('.search-filters .el-select:nth-child(2)');
      await select.setValue('importance_desc');
      
      expect(wrapper.vm.searchFilters.sortBy).toBe('importance_desc');
    });

    it('updates min importance slider', async () => {
      const toggleButton = wrapper.find('.search-filters .el-button:last-child');
      await toggleButton.trigger('click');
      
      const slider = wrapper.find('.el-slider');
      await slider.setValue(0.5);
      
      expect(wrapper.vm.searchFilters.minImportance).toBe(0.5);
    });

    it('updates date range filters', async () => {
      const toggleButton = wrapper.find('.search-filters .el-button:last-child');
      await toggleButton.trigger('click');
      
      const fromDate = wrapper.findAll('.el-date-picker')[0];
      const toDate = wrapper.findAll('.el-date-picker')[1];
      
      await fromDate.setValue('2024-01-01');
      await toDate.setValue('2024-12-31');
      
      expect(wrapper.vm.searchFilters.fromDate).toBe('2024-01-01');
      expect(wrapper.vm.searchFilters.toDate).toBe('2024-12-31');
    });

    it('applies filters when apply button is clicked', async () => {
      const toggleButton = wrapper.find('.search-filters .el-button:last-child');
      await toggleButton.trigger('click');
      
      const applyButton = wrapper.find('.filter-actions .el-button[type="primary"]');
      await applyButton.trigger('click');
      
      expect(mockRequest.get).toHaveBeenCalledTimes(2); // Initial + apply
    });

    it('resets all filters when reset button is clicked', async () => {
      const toggleButton = wrapper.find('.search-filters .el-button:last-child');
      await toggleButton.trigger('click');
      
      // Set some filter values
      wrapper.vm.searchFilters.memoryType = 'short_term';
      wrapper.vm.searchFilters.minImportance = 0.5;
      wrapper.vm.searchFilters.sortBy = 'importance_desc';
      
      const resetButton = wrapper.find('.filter-actions .el-button:not([type="primary"])');
      await resetButton.trigger('click');
      
      expect(wrapper.vm.searchFilters.memoryType).toBe('');
      expect(wrapper.vm.searchFilters.minImportance).toBe(0);
      expect(wrapper.vm.searchFilters.fromDate).toBe('');
      expect(wrapper.vm.searchFilters.toDate).toBe('');
      expect(wrapper.vm.searchFilters.sortBy).toBe('date_desc');
      expect(wrapper.vm.pagination.currentPage).toBe(1);
    });
  });

  describe('Pagination', () => {
    beforeEach(async () => {
      wrapper = createWrapper();
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('handles page size change', async () => {
      const pagination = wrapper.findComponent({ name: 'ElPagination' });
      await pagination.vm.$emit('size-change', 20);
      
      expect(wrapper.vm.pagination.pageSize).toBe(20);
      expect(wrapper.vm.pagination.currentPage).toBe(1);
      expect(mockRequest.get).toHaveBeenCalledTimes(2); // Initial + size change
    });

    it('handles current page change', async () => {
      const pagination = wrapper.findComponent({ name: 'ElPagination' });
      await pagination.vm.$emit('current-change', 2);
      
      expect(wrapper.vm.pagination.currentPage).toBe(2);
      expect(mockRequest.get).toHaveBeenCalledTimes(2); // Initial + page change
    });

    it('displays correct pagination info', async () => {
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const pagination = wrapper.findComponent({ name: 'ElPagination' });
      expect(pagination.props('total')).toBe(2);
      expect(pagination.props('currentPage')).toBe(1);
      expect(pagination.props('pageSize')).toBe(10);
    });
  });

  describe('Memory Actions', () => {
    beforeEach(async () => {
      wrapper = createWrapper();
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('opens memory detail dialog when view is clicked', async () => {
      const memoryCard = wrapper.findAllComponents({ name: 'MemoryCard' })[0];
      await memoryCard.vm.$emit('view', mockSearchResults[0]);
      
      expect(wrapper.vm.selectedMemory).toEqual(mockSearchResults[0]);
      expect(wrapper.vm.memoryDetailVisible).toBe(true);
    });

    it('displays memory details correctly in dialog', async () => {
      wrapper.vm.selectedMemory = mockSearchResults[0];
      wrapper.vm.memoryDetailVisible = true;
      await nextTick();
      
      const dialog = wrapper.findComponent({ name: 'ElDialog' });
      expect(dialog.props('modelValue')).toBe(true);
      expect(dialog.props('title')).toBe('记忆详情');
      
      expect(wrapper.find('.memory-content').text()).toBe(mockSearchResults[0].content);
    });

    it('handles memory deletion with confirmation', async () => {
      const memoryCard = wrapper.findAllComponents({ name: 'MemoryCard' })[0];
      await memoryCard.vm.$emit('delete', mockSearchResults[0]);
      
      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        '确定要删除这条记忆吗？此操作不可撤销。',
        '删除确认',
        expect.objectContaining({
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
      );
      
      expect(mockRequest.del).toHaveBeenCalledWith('/api/ai/memory/1/1');
      expect(ElMessage.success).toHaveBeenCalledWith({
        message: '记忆已删除',
        type: 'success',
        duration: 2000
      });
    });

    it('removes deleted memory from results', async () => {
      const memoryCard = wrapper.findAllComponents({ name: 'MemoryCard' })[0];
      await memoryCard.vm.$emit('delete', mockSearchResults[0]);
      
      expect(wrapper.vm.searchResults.length).toBe(1);
      expect(wrapper.vm.searchResults[0].id).toBe(2);
      expect(wrapper.vm.pagination.total).toBe(1);
    });

    it('handles deletion cancellation gracefully', async () => {
      vi.mocked(ElMessageBox.confirm).mockRejectedValueOnce('cancel');
      
      const memoryCard = wrapper.findAllComponents({ name: 'MemoryCard' })[0];
      await memoryCard.vm.$emit('delete', mockSearchResults[0]);
      
      expect(mockRequest.del).not.toHaveBeenCalled();
      expect(ElMessage.error).not.toHaveBeenCalled();
    });

    it('handles deletion error gracefully', async () => {
      mockRequest.del.mockRejectedValueOnce(new Error('Delete failed'));
      
      const memoryCard = wrapper.findAllComponents({ name: 'MemoryCard' })[0];
      await memoryCard.vm.$emit('delete', mockSearchResults[0]);
      
      expect(ElMessage.error).toHaveBeenCalledWith({
        message: '删除记忆失败',
        type: 'error',
        duration: 3000
      });
    });
  });

  describe('Search Parameters', () => {
    beforeEach(async () => {
      wrapper = createWrapper();
      await nextTick();
    });

    it('builds correct search parameters with basic query', async () => {
      wrapper.vm.searchQuery = 'test query';
      await wrapper.vm.handleSearch();
      
      const lastCall = mockRequest.get.mock.calls[mockRequest.get.mock.calls.length - 1];
      const params = lastCall[1].params;
      
      expect(params.userId).toBe(1);
      expect(params.query).toBe('test query');
      expect(params.limit).toBe(10);
      expect(params.offset).toBe(0);
    });

    it('builds correct search parameters with filters', async () => {
      wrapper.vm.searchQuery = 'test query';
      wrapper.vm.searchFilters.memoryType = 'short_term';
      wrapper.vm.searchFilters.minImportance = 0.5;
      wrapper.vm.searchFilters.fromDate = '2024-01-01';
      wrapper.vm.searchFilters.toDate = '2024-12-31';
      wrapper.vm.searchFilters.sortBy = 'importance_desc';
      
      await wrapper.vm.handleSearch();
      
      const lastCall = mockRequest.get.mock.calls[mockRequest.get.mock.calls.length - 1];
      const params = lastCall[1].params;
      
      expect(params.memoryType).toBe('short_term');
      expect(params.minImportance).toBe(0.5);
      expect(params.fromDate).toBe('2024-01-01');
      expect(params.toDate).toBe('2024-12-31');
      expect(params.sortField).toBe('importance');
      expect(params.sortDirection).toBe('DESC');
    });

    it('handles date-based sorting correctly', async () => {
      wrapper.vm.searchFilters.sortBy = 'date_asc';
      await wrapper.vm.handleSearch();
      
      const lastCall = mockRequest.get.mock.calls[mockRequest.get.mock.calls.length - 1];
      const params = lastCall[1].params;
      
      expect(params.sortField).toBe('createdAt');
      expect(params.sortDirection).toBe('ASC');
    });
  });

  describe('Memory Type Labels', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    it('returns correct label for immediate memory', () => {
      expect(wrapper.vm.getMemoryTypeLabel('immediate')).toBe('即时记忆');
    });

    it('returns correct label for short_term memory', () => {
      expect(wrapper.vm.getMemoryTypeLabel('short_term')).toBe('短期记忆');
    });

    it('returns correct label for long_term memory', () => {
      expect(wrapper.vm.getMemoryTypeLabel('long_term')).toBe('长期记忆');
    });

    it('returns correct label for shortterm memory', () => {
      expect(wrapper.vm.getMemoryTypeLabel('shortterm')).toBe('短期记忆');
    });

    it('returns correct label for longterm memory', () => {
      expect(wrapper.vm.getMemoryTypeLabel('longterm')).toBe('长期记忆');
    });

    it('returns raw type for unknown memory type', () => {
      expect(wrapper.vm.getMemoryTypeLabel('unknown')).toBe('unknown');
    });
  });

  describe('Date Formatting', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('formats date string correctly', () => {
      const formatted = wrapper.vm.formatDate('2024-01-01T10:00:00Z');
      expect(formatted).toContain('2024');
      expect(formatted).toContain('1');
    });

    it('handles different date formats', () => {
      const formatted = wrapper.vm.formatDate('2024-12-25T15:30:45Z');
      expect(formatted).toContain('2024');
      expect(formatted).toContain('12');
      expect(formatted).toContain('25');
    });
  });
});