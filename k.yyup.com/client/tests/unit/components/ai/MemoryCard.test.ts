import { describe, it, expect, vi, beforeEach } from 'vitest';
import { vi } from 'vitest'
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import MemoryCard from '@/components/ai/memory/MemoryCard.vue';
import ElementPlus from 'element-plus';

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElTag: {
    name: 'ElTag',
    template: '<div class="el-tag"><slot /></div>',
    props: ['type', 'size']
  },
  ElRate: {
    name: 'ElRate',
    template: '<div class="el-rate"></div>',
    props: ['modelValue', 'max', 'step', 'disabled', 'showScore', 'scoreTemplate']
  },
  ElIcon: {
    name: 'ElIcon',
    template: '<div class="el-icon"><component :is="$attrs.component" /></div>',
  },
  ElButton: {
    name: 'ElButton',
    template: '<button class="el-button" @click="$emit(\'click\', $event)"><slot /></button>',
    props: ['type', 'size'],
    emits: ['click']
  }
}));

// Mock Element Plus icons
vi.mock('@element-plus/icons-vue', () => ({
  ArrowDown: { name: 'ArrowDown' },
  ArrowUp: { name: 'ArrowUp' },
  View: { name: 'View' },
  Delete: { name: 'Delete' }
}));

// 控制台错误检测变量
let consoleSpy: any

describe('MemoryCard.vue', () => {
  let wrapper: any;
  
  const mockMemory = {
    id: 1,
    userId: 1,
    conversationId: 'test-conversation',
    content: 'This is a test memory content',
    importance: 0.8,
    memoryType: 'short_term',
    createdAt: '2024-01-01T10:00:00Z',
    expiresAt: '2024-12-31T23:59:59Z'
  };

  const createWrapper = (props = {}) => {
    return mount(MemoryCard, {
      props: {
        memory: mockMemory,
        ...props
      },
      global: {
        plugins: [ElementPlus],
        stubs: {
          'el-tag': true,
          'el-rate': true,
          'el-icon': true,
          'el-button': true
        }
      }
    });
  };

  beforeEach(() => {
    wrapper = createWrapper();
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    if (wrapper) => {
      wrapper.unmount();
    }
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('Rendering', () => {
    it('renders properly with memory props', () => {
      expect(wrapper.find('.memory-card').exists()).toBe(true);
      expect(wrapper.find('.memory-header').exists()).toBe(true);
      expect(wrapper.find('.memory-content').exists()).toBe(true);
    });

    it('displays memory type tag', () => {
      const typeTag = wrapper.find('.memory-type .el-tag');
      expect(typeTag.exists()).toBe(true);
      expect(typeTag.text()).toBe('短期记忆');
    });

    it('displays memory importance rate', () => {
      const rate = wrapper.find('.memory-importance .el-rate');
      expect(rate.exists()).toBe(true);
      expect(rate.attributes('modelvalue')).toBe('0.8');
    });

    it('displays formatted date', () => {
      const dateElement = wrapper.find('.memory-date');
      expect(dateElement.exists()).toBe(true);
      expect(dateElement.text()).toContain('2024');
    });

    it('displays memory content', () => {
      expect(wrapper.find('.memory-text').text()).toBe(mockMemory.content);
    });

    it('shows expand icon initially as ArrowDown', () => {
      const expandIcon = wrapper.find('.memory-expand-icon .el-icon');
      expect(expandIcon.exists()).toBe(true);
    });
  });

  describe('Memory Type Handling', () => {
    it('displays correct label for immediate memory', () => {
      const wrapper = createWrapper({
        memory: { ...mockMemory, memoryType: 'immediate' }
      });
      const typeTag = wrapper.find('.memory-type .el-tag');
      expect(typeTag.text()).toBe('即时记忆');
    });

    it('displays correct label for long_term memory', () => {
      const wrapper = createWrapper({
        memory: { ...mockMemory, memoryType: 'long_term' }
      });
      const typeTag = wrapper.find('.memory-type .el-tag');
      expect(typeTag.text()).toBe('长期记忆');
    });

    it('displays correct label for shortterm memory', () => {
      const wrapper = createWrapper({
        memory: { ...mockMemory, memoryType: 'shortterm' }
      });
      const typeTag = wrapper.find('.memory-type .el-tag');
      expect(typeTag.text()).toBe('短期记忆');
    });

    it('displays correct label for longterm memory', () => {
      const wrapper = createWrapper({
        memory: { ...mockMemory, memoryType: 'longterm' }
      });
      const typeTag = wrapper.find('.memory-type .el-tag');
      expect(typeTag.text()).toBe('长期记忆');
    });

    it('displays raw type for unknown memory type', () => {
      const wrapper = createWrapper({
        memory: { ...mockMemory, memoryType: 'unknown' }
      });
      const typeTag = wrapper.find('.memory-type .el-tag');
      expect(typeTag.text()).toBe('unknown');
    });
  });

  describe('Memory Type Tag Styling', () => {
    it('assigns correct tag type for immediate memory', async () => {
      const wrapper = createWrapper({
        memory: { ...mockMemory, memoryType: 'immediate' }
      });
      await nextTick();
      const typeTag = wrapper.find('.memory-type .el-tag');
      expect(typeTag.attributes('type')).toBe('info');
    });

    it('assigns correct tag type for short_term memory', async () => {
      await nextTick();
      const typeTag = wrapper.find('.memory-type .el-tag');
      expect(typeTag.attributes('type')).toBe('warning');
    });

    it('assigns correct tag type for long_term memory', async () => {
      const wrapper = createWrapper({
        memory: { ...mockMemory, memoryType: 'long_term' }
      });
      await nextTick();
      const typeTag = wrapper.find('.memory-type .el-tag');
      expect(typeTag.attributes('type')).toBe('success');
    });

    it('assigns default tag type for unknown memory type', async () => {
      const wrapper = createWrapper({
        memory: { ...mockMemory, memoryType: 'unknown' }
      });
      await nextTick();
      const typeTag = wrapper.find('.memory-type .el-tag');
      expect(typeTag.attributes('type')).toBe('info');
    });
  });

  describe('Expand/Collapse Functionality', () => {
    it('starts collapsed by default', () => {
      expect(wrapper.vm.expanded).toBe(false);
      expect(wrapper.find('.memory-content').classes()).not.toContain('is-expanded');
    });

    it('expands when header is clicked', async () => {
      const header = wrapper.find('.memory-header');
      await header.trigger('click');
      
      expect(wrapper.vm.expanded).toBe(true);
      expect(wrapper.find('.memory-content').classes()).toContain('is-expanded');
    });

    it('collapses when header is clicked again', async () => {
      // First expand
      let header = wrapper.find('.memory-header');
      await header.trigger('click');
      expect(wrapper.vm.expanded).toBe(true);
      
      // Then collapse
      header = wrapper.find('.memory-header');
      await header.trigger('click');
      expect(wrapper.vm.expanded).toBe(false);
      expect(wrapper.find('.memory-content').classes()).not.toContain('is-expanded');
    });

    it('shows action buttons when expanded', async () => {
      const header = wrapper.find('.memory-header');
      await header.trigger('click');
      
      const actionButtons = wrapper.findAll('.memory-actions .el-button');
      expect(actionButtons.length).toBe(2);
      expect(actionButtons[0].text()).toContain('查看详情');
      expect(actionButtons[1].text()).toContain('删除');
    });

    it('hides action buttons when collapsed', () => {
      const actionButtons = wrapper.find('.memory-actions');
      expect(actionButtons.exists()).toBe(false);
    });
  });

  describe('Event Handling', () => {
    it('emits view event when view button is clicked', async () => {
      // Expand first to show buttons
      const header = wrapper.find('.memory-header');
      await header.trigger('click');
      
      const viewButton = wrapper.find('.memory-actions .el-button[type="primary"]');
      await viewButton.trigger('click');
      
      expect(wrapper.emitted('view')).toBeTruthy();
      expect(wrapper.emitted('view')[0]).toEqual([mockMemory]);
    });

    it('emits delete event when delete button is clicked', async () => {
      // Expand first to show buttons
      const header = wrapper.find('.memory-header');
      await header.trigger('click');
      
      const deleteButton = wrapper.find('.memory-actions .el-button[type="danger"]');
      await deleteButton.trigger('click');
      
      expect(wrapper.emitted('delete')).toBeTruthy();
      expect(wrapper.emitted('delete')[0]).toEqual([mockMemory]);
    });

    it('prevents event propagation when action buttons are clicked', async () => {
      // Expand first to show buttons
      const header = wrapper.find('.memory-header');
      await header.trigger('click');
      
      const viewButton = wrapper.find('.memory-actions .el-button[type="primary"]');
      const stopPropagationSpy = vi.fn();
      const mockEvent = { stopPropagation: stopPropagationSpy };
      
      await viewButton.trigger('click', mockEvent);
      
      expect(stopPropagationSpy).toHaveBeenCalled();
      expect(wrapper.vm.expanded).toBe(true); // Should remain expanded
    });
  });

  describe('Date Formatting', () => {
    it('formats date correctly', () => {
      const dateElement = wrapper.find('.memory-date');
      const dateText = dateElement.text();
      
      // Should contain date components
      expect(dateText).toContain('2024');
      expect(dateText).toContain('1');
      expect(dateText).toContain('10');
    });

    it('handles different date formats', () => {
      const wrapper = createWrapper({
        memory: { ...mockMemory, createdAt: '2024-12-25T15:30:45Z' }
      });
      const dateElement = wrapper.find('.memory-date');
      const dateText = dateElement.text();
      
      expect(dateText).toContain('2024');
      expect(dateText).toContain('12');
      expect(dateText).toContain('25');
    });
  });

  describe('Props Validation', () => {
    it('accepts memory with all required properties', () => {
      expect(() => {
        createWrapper({
          memory: {
            id: 1,
            userId: 1,
            conversationId: 'test',
            content: 'test',
            importance: 0.5,
            memoryType: 'short_term',
            createdAt: '2024-01-01T00:00:00Z'
          }
        });
      }).not.toThrow();
    });

    it('handles memory without expiresAt property', () => {
      expect(() => {
        createWrapper({
          memory: {
            id: 1,
            userId: 1,
            conversationId: 'test',
            content: 'test',
            importance: 0.5,
            memoryType: 'short_term',
            createdAt: '2024-01-01T00:00:00Z'
          }
        });
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('has clickable header with cursor pointer', () => {
      const header = wrapper.find('.memory-header');
      expect(header.classes()).toContain('cursor-pointer');
    });

    it('has proper button types for actions', async () => {
      // Expand first to show buttons
      const header = wrapper.find('.memory-header');
      await header.trigger('click');
      
      const viewButton = wrapper.find('.memory-actions .el-button[type="primary"]');
      const deleteButton = wrapper.find('.memory-actions .el-button[type="danger"]');
      
      expect(viewButton.exists()).toBe(true);
      expect(deleteButton.exists()).toBe(true);
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive classes for mobile view', () => {
      // This would require testing CSS media queries, which is difficult in unit tests
      // We can at least verify the structure exists
      expect(wrapper.find('.memory-header').exists()).toBe(true);
      expect(wrapper.find('.memory-importance').exists()).toBe(true);
      expect(wrapper.find('.memory-date').exists()).toBe(true);
    });
  });
});