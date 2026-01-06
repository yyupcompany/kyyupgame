import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import MemorySearchComponent from '@/components/ai/MemorySearchComponent.vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// Mock Element Plus components
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus');
  return {
    ...actual,
    ElMessage: {
      warning: vi.fn(),
      error: vi.fn(),
      success: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn()
    }
  };
});

// 控制台错误检测变量
let consoleSpy: any

describe('MemorySearchComponent', () => {
  let wrapper: any;
  const mockUserId = 1;

  const mockMemoryData = {
    data: [
      {
        id: 1,
        userId: 1,
        conversationId: 'conv-1',
        content: 'Test memory content',
        importance: 0.8,
        memoryType: 'short_term',
        createdAt: '2024-01-01T00:00:00Z',
        similarity: 0.85
      },
      {
        id: 2,
        userId: 1,
        conversationId: 'conv-2',
        content: 'Another memory',
        importance: 0.6,
        memoryType: 'long_term',
        createdAt: '2024-01-02T00:00:00Z',
        similarity: 0.75
      }
    ]
  };

  beforeEach(() => {
    wrapper = mount(MemorySearchComponent, {
      props: {
        userId: mockUserId
      },
      global: {
        stubs: {
          'el-input': {
            template: '<div class="el-input-stub"><input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" @keyup.enter="$emit(\'keyup.enter\', $event)" /></div>',
            props: ['modelValue', 'placeholder', 'clearable', 'disabled']
          },
          'el-button': {
            template: '<button class="el-button-stub" @click="$emit(\'click\')"><slot /></button>',
            props: ['type', 'loading', 'disabled']
          },
          'el-icon': {
            template: '<i class="el-icon-stub"><slot /></i>'
          },
          'el-tooltip': {
            template: '<div class="el-tooltip-stub"><slot /></div>',
            props: ['content', 'placement']
          },
          'el-select': {
            template: '<select class="el-select-stub" @change="$emit(\'change\', $event.target.value)"><slot /></select>',
            props: ['modelValue', 'placeholder']
          },
          'el-option': {
            template: '<option class="el-option-stub" :value="value"><slot /></option>',
            props: ['value', 'label']
          },
          'el-slider': {
            template: '<input type="range" class="el-slider-stub" :min="min" :max="max" :step="step" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'min', 'max', 'step']
          },
          'el-input-number': {
            template: '<input type="number" class="el-input-number-stub" :min="min" :max="max" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'min', 'max']
          },
          'el-skeleton': {
            template: '<div class="el-skeleton-stub">Loading...</div>',
            props: ['rows', 'animated']
          },
          'el-card': {
            template: '<div class="el-card-stub"><slot name="header" /><slot /></div>'
          },
          'el-tag': {
            template: '<span class="el-tag-stub"><slot /></span>',
            props: ['type', 'size']
          }
        }
      }
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    wrapper.unmount();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('Component Rendering', () => {
    it('should render correctly with default props', () => {
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.memory-search-container').exists()).toBe(true);
      expect(wrapper.find('.search-header').exists()).toBe(true);
      expect(wrapper.find('.search-form').exists()).toBe(true);
    });

    it('should display correct title and tooltip', () => {
      const header = wrapper.find('.search-header');
      expect(header.find('h3').text()).toBe('记忆搜索');
      expect(header.find('.el-tooltip').exists()).toBe(true);
    });

    it('should render search input with button', () => {
      const searchForm = wrapper.find('.search-form');
      expect(searchForm.find('.el-input').exists()).toBe(true);
      expect(searchForm.find('.el-button').exists()).toBe(true);
    });

    it('should render search options', () => {
      const searchOptions = wrapper.find('.search-options');
      expect(searchOptions.exists()).toBe(true);
      expect(searchOptions.findAll('.el-select').length).toBe(1);
      expect(searchOptions.find('.el-slider').exists()).toBe(true);
      expect(searchOptions.find('.el-input-number').exists()).toBe(true);
    });
  });

  describe('Search Functionality', () => {
    it('should handle search with valid query', async () => {
      const mockFindSimilarMemories = vi.fn().mockResolvedValue(mockMemoryData);
      
      // Mock the findSimilarMemories function
      wrapper.vm.findSimilarMemories = mockFindSimilarMemories;
      
      const searchInput = wrapper.find('.search-form .el-input');
      await searchInput.setValue('test query');
      
      const searchButton = wrapper.find('.search-form .el-button');
      await searchButton.trigger('click');
      
      expect(mockFindSimilarMemories).toHaveBeenCalledWith(
        'test query',
        mockUserId,
        5,
        0.7,
        'openai'
      );
    });

    it('should show warning for empty search query', async () => {
      const searchButton = wrapper.find('.search-form .el-button');
      await searchButton.trigger('click');
      
      expect(ElMessage.warning).toHaveBeenCalledWith('请输入搜索内容');
    });

    it('should handle search on enter key', async () => {
      const mockFindSimilarMemories = vi.fn().mockResolvedValue(mockMemoryData);
      wrapper.vm.findSimilarMemories = mockFindSimilarMemories;
      
      const searchInput = wrapper.find('.search-form .el-input');
      await searchInput.setValue('test query');
      await searchInput.trigger('keyup.enter');
      
      expect(mockFindSimilarMemories).toHaveBeenCalled();
    });

    it('should show loading state during search', async () => {
      const mockFindSimilarMemories = vi.fn().mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve(mockMemoryData), 100);
        });
      });
      
      wrapper.vm.findSimilarMemories = mockFindSimilarMemories;
      
      const searchInput = wrapper.find('.search-form .el-input');
      await searchInput.setValue('test query');
      
      const searchButton = wrapper.find('.search-form .el-button');
      searchButton.trigger('click');
      
      await nextTick();
      expect(wrapper.vm.loading).toBe(true);
      expect(wrapper.find('.search-loading').exists()).toBe(true);
    });

    it('should handle search error', async () => {
      const mockFindSimilarMemories = vi.fn().mockRejectedValue(new Error('Search failed'));
      wrapper.vm.findSimilarMemories = mockFindSimilarMemories;
      
      const searchInput = wrapper.find('.search-form .el-input');
      await searchInput.setValue('test query');
      
      const searchButton = wrapper.find('.search-form .el-button');
      await searchButton.trigger('click');
      
      expect(ElMessage.error).toHaveBeenCalledWith('搜索记忆失败');
    });
  });

  describe('Search Parameters', () => {
    it('should update provider selection', async () => {
      const select = wrapper.find('.search-options .el-select');
      await select.setValue('deepseek');
      
      expect(wrapper.vm.provider).toBe('deepseek');
    });

    it('should update similarity threshold', async () => {
      const slider = wrapper.find('.search-options .el-slider');
      await slider.setValue(0.8);
      
      expect(wrapper.vm.similarityThreshold).toBe(0.8);
    });

    it('should update result limit', async () => {
      const inputNumber = wrapper.find('.search-options .el-input-number');
      await inputNumber.setValue(10);
      
      expect(wrapper.vm.limit).toBe(10);
    });

    it('should use correct parameters in search', async () => {
      const mockFindSimilarMemories = vi.fn().mockResolvedValue(mockMemoryData);
      wrapper.vm.findSimilarMemories = mockFindSimilarMemories;
      
      // Update parameters
      wrapper.vm.provider = 'deepseek';
      wrapper.vm.similarityThreshold = 0.8;
      wrapper.vm.limit = 10;
      
      const searchInput = wrapper.find('.search-form .el-input');
      await searchInput.setValue('test query');
      
      const searchButton = wrapper.find('.search-form .el-button');
      await searchButton.trigger('click');
      
      expect(mockFindSimilarMemories).toHaveBeenCalledWith(
        'test query',
        mockUserId,
        10,
        0.8,
        'deepseek'
      );
    });
  });

  describe('Search Results', () => {
    it('should display search results', async () => {
      const mockFindSimilarMemories = vi.fn().mockResolvedValue(mockMemoryData);
      wrapper.vm.findSimilarMemories = mockFindSimilarMemories;
      
      const searchInput = wrapper.find('.search-form .el-input');
      await searchInput.setValue('test query');
      
      const searchButton = wrapper.find('.search-form .el-button');
      await searchButton.trigger('click');
      
      await nextTick();
      
      expect(wrapper.vm.searchResults).toEqual(mockMemoryData.data);
      expect(wrapper.vm.searched).toBe(true);
      expect(wrapper.find('.search-results').exists()).toBe(true);
    });

    it('should display empty state when no results', async () => {
      const mockFindSimilarMemories = vi.fn().mockResolvedValue({ data: [] });
      wrapper.vm.findSimilarMemories = mockFindSimilarMemories;
      
      const searchInput = wrapper.find('.search-form .el-input');
      await searchInput.setValue('test query');
      
      const searchButton = wrapper.find('.search-form .el-button');
      await searchButton.trigger('click');
      
      await nextTick();
      
      expect(wrapper.find('.search-empty').exists()).toBe(true);
    });

    it('should format memory data correctly', () => {
      const memory = mockMemoryData.data[0];
      
      expect(wrapper.vm.formatSimilarity(memory.similarity)).toBe('85%');
      expect(wrapper.vm.formatImportance(memory.importance)).toBe('80%');
      expect(wrapper.vm.formatDate(memory.createdAt)).toBeDefined();
      expect(wrapper.vm.getMemoryTypeLabel(memory.memoryType)).toBe('短期记忆');
    });

    it('should handle different memory types', () => {
      expect(wrapper.vm.getMemoryTypeLabel('immediate')).toBe('即时记忆');
      expect(wrapper.vm.getMemoryTypeLabel('short_term')).toBe('短期记忆');
      expect(wrapper.vm.getMemoryTypeLabel('long_term')).toBe('长期记忆');
      expect(wrapper.vm.getMemoryTypeLabel('unknown')).toBe('未知类型');
    });
  });

  describe('Memory Actions', () => {
    beforeEach(async () => {
      const mockFindSimilarMemories = vi.fn().mockResolvedValue(mockMemoryData);
      wrapper.vm.findSimilarMemories = mockFindSimilarMemories;
      
      const searchInput = wrapper.find('.search-form .el-input');
      await searchInput.setValue('test query');
      
      const searchButton = wrapper.find('.search-form .el-button');
      await searchButton.trigger('click');
      
      await nextTick();
    });

    it('should emit use-memory event when using memory', async () => {
      const memory = wrapper.vm.searchResults[0];
      wrapper.vm.handleUseMemory(memory);
      
      expect(wrapper.emitted('use-memory')).toBeTruthy();
      expect(wrapper.emitted('use-memory')[0]).toEqual([memory]);
    });

    it('should handle memory archive', async () => {
      const mockArchiveToLongTerm = vi.fn().mockResolvedValue({
        data: {
          id: 1,
          memoryType: 'long_term'
        }
      });
      
      wrapper.vm.archiveToLongTerm = mockArchiveToLongTerm;
      (ElMessageBox.confirm as any).mockResolvedValue(true);
      
      const memory = wrapper.vm.searchResults[0];
      await wrapper.vm.handleArchiveMemory(memory.id);
      
      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        '确定要将此记忆归档为长期记忆吗？',
        '归档确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      );
      
      expect(mockArchiveToLongTerm).toHaveBeenCalledWith(memory.id);
      expect(ElMessage.success).toHaveBeenCalledWith('记忆归档成功');
    });

    it('should handle memory deletion', async () => {
      const mockDeleteMemory = vi.fn().mockResolvedValue({ success: true });
      wrapper.vm.deleteMemory = mockDeleteMemory;
      (ElMessageBox.confirm as any).mockResolvedValue(true);
      
      const memory = wrapper.vm.searchResults[0];
      await wrapper.vm.handleDeleteMemory(memory.id);
      
      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        '确定要删除此记忆吗？此操作不可恢复。',
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      );
      
      expect(mockDeleteMemory).toHaveBeenCalledWith(memory.id);
      expect(ElMessage.success).toHaveBeenCalledWith('记忆删除成功');
      
      // Check if memory is removed from list
      expect(wrapper.vm.searchResults.find(m => m.id === memory.id)).toBeUndefined();
    });

    it('should cancel archive operation when user cancels', async () => {
      (ElMessageBox.confirm as any).mockRejectedValue('cancel');
      
      const memory = wrapper.vm.searchResults[0];
      await wrapper.vm.handleArchiveMemory(memory.id);
      
      expect(ElMessage.success).not.toHaveBeenCalled();
    });

    it('should cancel delete operation when user cancels', async () => {
      (ElMessageBox.confirm as any).mockRejectedValue('cancel');
      
      const memory = wrapper.vm.searchResults[0];
      await wrapper.vm.handleDeleteMemory(memory.id);
      
      expect(ElMessage.success).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle API errors gracefully', async () => {
      const mockFindSimilarMemories = vi.fn().mockRejectedValue(new Error('API Error'));
      wrapper.vm.findSimilarMemories = mockFindSimilarMemories;
      
      const searchInput = wrapper.find('.search-form .el-input');
      await searchInput.setValue('test query');
      
      const searchButton = wrapper.find('.search-form .el-button');
      await searchButton.trigger('click');
      
      await nextTick();
      
      expect(ElMessage.error).toHaveBeenCalledWith('搜索记忆失败');
      expect(wrapper.vm.loading).toBe(false);
    });

    it('should handle archive errors', async () => {
      const mockArchiveToLongTerm = vi.fn().mockRejectedValue(new Error('Archive Error'));
      wrapper.vm.archiveToLongTerm = mockArchiveToLongTerm;
      (ElMessageBox.confirm as any).mockResolvedValue(true);
      
      const memory = wrapper.vm.searchResults[0];
      await wrapper.vm.handleArchiveMemory(memory.id);
      
      expect(ElMessage.error).toHaveBeenCalledWith('归档记忆失败');
    });

    it('should handle delete errors', async () => {
      const mockDeleteMemory = vi.fn().mockRejectedValue(new Error('Delete Error'));
      wrapper.vm.deleteMemory = mockDeleteMemory;
      (ElMessageBox.confirm as any).mockResolvedValue(true);
      
      const memory = wrapper.vm.searchResults[0];
      await wrapper.vm.handleDeleteMemory(memory.id);
      
      expect(ElMessage.error).toHaveBeenCalledWith('删除记忆失败');
    });
  });
});