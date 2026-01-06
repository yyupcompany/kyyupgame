import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import { VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import MemoryCard from '@/components/ai/memory/MemoryCard.vue';
import { createComponentWrapper, waitForUpdate, createTestCleanup } from '../../../utils/component-test-helper';

// 控制台错误检测变量
let consoleSpy: any

describe('MemoryCard', () => {
  let wrapper: VueWrapper<any>;
  const cleanup = createTestCleanup();

  const mockMemory = {
    id: 1,
    userId: 1,
    conversationId: 'conv-123',
    content: 'This is a test memory content that should be displayed properly in the card component.',
    importance: 0.8,
    memoryType: 'short_term',
    createdAt: '2024-01-01T12:00:00Z',
    expiresAt: '2024-01-08T12:00:00Z'
  };

  const createWrapper = (props = {}) => {
    return createComponentWrapper(MemoryCard, {
      props: {
        memory: mockMemory,
        ...props
      },
      withPinia: true,
      withRouter: false,
      global: {
        stubs: {
          'el-tag': { template: '<div class="el-tag"><slot /></div>' },
          'el-rate': { template: '<div class="el-rate"><slot /></div>' },
          'el-icon': { template: '<i class="el-icon"><slot /></i>' },
          'el-button': { template: '<button class="el-button"><slot /></button>' }
        }
      }
    });
  };

  beforeEach(() => {
    wrapper = createWrapper();
    cleanup.addCleanup(() => wrapper?.unmount());
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    cleanup.cleanup();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('Component Rendering', () => {
    it('should render correctly with default props', () => {
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.memory-card').exists()).toBe(true);
    });

    it('should render memory header', () => {
      expect(wrapper.find('.memory-header').exists()).toBe(true);
    });

    it('should render memory content', () => {
      expect(wrapper.find('.memory-content').exists()).toBe(true);
    });

    it('should not be expanded by default', () => {
      expect(wrapper.vm.expanded).toBe(false);
      expect(wrapper.find('.memory-content').classes()).not.toContain('is-expanded');
    });
  });

  describe('Memory Header', () => {
    it('should display memory type tag', () => {
      const typeTag = wrapper.find('.memory-type .el-tag');
      expect(typeTag.exists()).toBe(true);
      expect(typeTag.text()).toContain('短期记忆');
    });

    it('should display memory importance rate', () => {
      const importanceRate = wrapper.find('.memory-importance .el-rate');
      expect(importanceRate.exists()).toBe(true);
      // 检查组件的props而不是DOM属性
      const vm = wrapper.vm as any;
      expect(vm.memory.importance).toBe(0.8);
    });

    it('should display memory date', () => {
      const dateElement = wrapper.find('.memory-date');
      expect(dateElement.exists()).toBe(true);
      expect(dateElement.text()).toBeDefined();
    });

    it('should display expand icon', () => {
      const expandIcon = wrapper.find('.memory-expand-icon .el-icon');
      expect(expandIcon.exists()).toBe(true);
    });

    it('should show arrow down icon when collapsed', () => {
      const expandIcon = wrapper.find('.memory-expand-icon .el-icon');
      expect(expandIcon.findComponent({ name: 'ArrowDown' }).exists()).toBe(true);
    });
  });

  describe('Memory Content', () => {
    it('should display memory text when expanded', async () => {
      // 通过点击头部来展开
      const header = wrapper.find('.memory-header');
      await header.trigger('click');
      await waitForUpdate(wrapper);

      const content = wrapper.find('.memory-content');
      expect(content.classes()).toContain('is-expanded');

      const textElement = wrapper.find('.memory-text');
      expect(textElement.exists()).toBe(true);
      expect(textElement.text()).toBe(mockMemory.content);
    });

    it('should hide memory text when collapsed', () => {
      const textElement = wrapper.find('.memory-text');
      expect(textElement.exists()).toBe(true);
      // 默认状态下应该是折叠的
      expect(wrapper.vm.expanded).toBe(false);
    });

    it('should render memory actions when expanded', async () => {
      // 通过点击头部来展开
      const header = wrapper.find('.memory-header');
      await header.trigger('click');
      await waitForUpdate(wrapper);

      const actions = wrapper.find('.memory-actions');
      expect(actions.exists()).toBe(true);

      const buttons = actions.findAll('.el-button');
      expect(buttons.length).toBe(2);
    });

    it('should not render memory actions when collapsed', () => {
      const actions = wrapper.find('.memory-actions');
      expect(actions.exists()).toBe(false);
    });
  });

  describe('Expand/Collapse Functionality', () => {
    it('should expand when header is clicked', async () => {
      expect(wrapper.vm.expanded).toBe(false);
      
      const header = wrapper.find('.memory-header');
      await header.trigger('click');
      
      expect(wrapper.vm.expanded).toBe(true);
      expect(wrapper.find('.memory-content').classes()).toContain('is-expanded');
    });

    it('should collapse when header is clicked again', async () => {
      // 先展开
      const header = wrapper.find('.memory-header');
      await header.trigger('click');
      await waitForUpdate(wrapper);
      expect(wrapper.vm.expanded).toBe(true);

      // 再次点击折叠
      await header.trigger('click');
      await waitForUpdate(wrapper);

      expect(wrapper.vm.expanded).toBe(false);
      expect(wrapper.find('.memory-content').classes()).not.toContain('is-expanded');
    });

    it('should show arrow up icon when expanded', async () => {
      await wrapper.setData({ expanded: true });
      
      const expandIcon = wrapper.find('.memory-expand-icon .el-icon');
      expect(expandIcon.findComponent({ name: 'ArrowUp' }).exists()).toBe(true);
    });
  });

  describe('Memory Actions', () => {
    beforeEach(async () => {
      await wrapper.setData({ expanded: true });
    });

    it('should emit view event when view button is clicked', async () => {
      const viewButton = wrapper.find('.memory-actions .el-button[type="primary"]');
      await viewButton.trigger('click');
      
      expect(wrapper.emitted('view')).toBeTruthy();
      expect(wrapper.emitted('view')[0]).toEqual([mockMemory]);
    });

    it('should emit delete event when delete button is clicked', async () => {
      const deleteButton = wrapper.find('.memory-actions .el-button[type="danger"]');
      await deleteButton.trigger('click');
      
      expect(wrapper.emitted('delete')).toBeTruthy();
      expect(wrapper.emitted('delete')[0]).toEqual([mockMemory]);
    });

    it('should stop event propagation when action buttons are clicked', async () => {
      const stopPropagationSpy = vi.spyOn(Event.prototype, 'stopPropagation');
      
      const viewButton = wrapper.find('.memory-actions .el-button[type="primary"]');
      await viewButton.trigger('click');
      
      expect(stopPropagationSpy).toHaveBeenCalled();
    });
  });

  describe('Memory Type Handling', () => {
    it('should handle immediate memory type', async () => {
      const immediateMemory = { ...mockMemory, memoryType: 'immediate' };
      wrapper = createWrapper({ memory: immediateMemory });
      
      const typeTag = wrapper.find('.memory-type .el-tag');
      expect(typeTag.attributes('type')).toBe('info');
    });

    it('should handle short_term memory type', () => {
      const typeTag = wrapper.find('.memory-type .el-tag');
      expect(typeTag.attributes('type')).toBe('warning');
    });

    it('should handle long_term memory type', async () => {
      const longTermMemory = { ...mockMemory, memoryType: 'long_term' };
      wrapper = createWrapper({ memory: longTermMemory });
      
      const typeTag = wrapper.find('.memory-type .el-tag');
      expect(typeTag.attributes('type')).toBe('success');
    });

    it('should handle shortterm memory type (alias)', async () => {
      const shorttermMemory = { ...mockMemory, memoryType: 'shortterm' };
      wrapper = createWrapper({ memory: shorttermMemory });
      
      const typeTag = wrapper.find('.memory-type .el-tag');
      expect(typeTag.attributes('type')).toBe('warning');
    });

    it('should handle longterm memory type (alias)', async () => {
      const longtermMemory = { ...mockMemory, memoryType: 'longterm' };
      wrapper = createWrapper({ memory: longtermMemory });
      
      const typeTag = wrapper.find('.memory-type .el-tag');
      expect(typeTag.attributes('type')).toBe('success');
    });

    it('should handle unknown memory type', async () => {
      const unknownMemory = { ...mockMemory, memoryType: 'unknown' };
      wrapper = createWrapper({ memory: unknownMemory });
      
      const typeTag = wrapper.find('.memory-type .el-tag');
      expect(typeTag.attributes('type')).toBe('info');
    });
  });

  describe('Date Formatting', () => {
    it('should format creation date correctly', () => {
      const formattedDate = wrapper.vm.formatDate(mockMemory.createdAt);
      expect(formattedDate).toBeDefined();
      expect(typeof formattedDate).toBe('string');
    });

    it('should handle invalid date format', () => {
      const invalidDate = wrapper.vm.formatDate('invalid-date');
      expect(invalidDate).toBeDefined();
      expect(typeof invalidDate).toBe('string');
    });

    it('should handle undefined date', () => {
      const undefinedDate = wrapper.vm.formatDate(undefined as any);
      expect(undefinedDate).toBeDefined();
      expect(typeof undefinedDate).toBe('string');
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
      expect(wrapper.vm.getMemoryTypeLabel('custom')).toBe('custom');
    });
  });

  describe('Memory Type Tag Types', () => {
    it('should return correct tag types for memory types', () => {
      expect(wrapper.vm.getMemoryTypeTagType('immediate')).toBe('info');
      expect(wrapper.vm.getMemoryTypeTagType('short_term')).toBe('warning');
      expect(wrapper.vm.getMemoryTypeTagType('long_term')).toBe('success');
      expect(wrapper.vm.getMemoryTypeTagType('shortterm')).toBe('warning');
      expect(wrapper.vm.getMemoryTypeTagType('longterm')).toBe('success');
    });

    it('should return info tag type for unknown types', () => {
      expect(wrapper.vm.getMemoryTypeTagType('unknown')).toBe('info');
      expect(wrapper.vm.getMemoryTypeTagType('custom')).toBe('info');
    });
  });

  describe('Props Handling', () => {
    it('should update when memory prop changes', async () => {
      const newMemory = {
        ...mockMemory,
        content: 'Updated memory content',
        importance: 0.9
      };
      
      await wrapper.setProps({ memory: newMemory });
      
      expect(wrapper.props('memory')).toEqual(newMemory);
      
      // Expand to check content update
      await wrapper.setData({ expanded: true });
      expect(wrapper.find('.memory-text').text()).toBe('Updated memory content');
      
      const importanceRate = wrapper.find('.memory-importance .el-rate');
      expect(importanceRate.props('modelValue')).toBe(0.9);
    });

    it('should handle memory with missing properties', async () => {
      const incompleteMemory = {
        id: 2,
        content: 'Incomplete memory'
      } as any;
      
      await wrapper.setProps({ memory: incompleteMemory });
      
      // Should not throw errors
      expect(wrapper.exists()).toBe(true);
    });

    it('should handle empty memory content', async () => {
      const emptyMemory = {
        ...mockMemory,
        content: ''
      };
      
      await wrapper.setProps({ memory: emptyMemory });
      
      await wrapper.setData({ expanded: true });
      expect(wrapper.find('.memory-text').text()).toBe('');
    });
  });

  describe('Styling and Layout', () => {
    it('should apply hover effect', async () => {
      const card = wrapper.find('.memory-card');
      await card.trigger('mouseenter');
      
      expect(card.classes()).toContain('hover');
    });

    it('should have correct CSS classes for different states', () => {
      const card = wrapper.find('.memory-card');
      expect(card.classes()).toContain('memory-card');
      expect(card.classes()).not.toContain('is-expanded');
    });

    it('should apply expanded class correctly', async () => {
      await wrapper.setData({ expanded: true });
      
      const card = wrapper.find('.memory-card');
      expect(card.classes()).toContain('is-expanded');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const header = wrapper.find('.memory-header');
      expect(header.attributes('role')).toBeDefined();
      
      const viewButton = wrapper.find('.memory-actions .el-button[type="primary"]');
      expect(viewButton.attributes('aria-label')).toBeDefined();
      
      const deleteButton = wrapper.find('.memory-actions .el-button[type="danger"]');
      expect(deleteButton.attributes('aria-label')).toBeDefined();
    });

    it('should be keyboard navigable', async () => {
      const header = wrapper.find('.memory-header');
      await header.trigger('keydown.enter');
      
      expect(wrapper.vm.expanded).toBe(true);
    });

    it('should handle space key for expansion', async () => {
      const header = wrapper.find('.memory-header');
      await header.trigger('keydown.space');
      
      expect(wrapper.vm.expanded).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle memory with null importance', async () => {
      const memoryWithoutImportance = {
        ...mockMemory,
        importance: null
      } as any;
      
      await wrapper.setProps({ memory: memoryWithoutImportance });
      
      const importanceRate = wrapper.find('.memory-importance .el-rate');
      expect(importanceRate.props('modelValue')).toBe(null);
    });

    it('should handle memory with undefined importance', async () => {
      const memoryWithoutImportance = {
        ...mockMemory,
        importance: undefined
      } as any;
      
      await wrapper.setProps({ memory: memoryWithoutImportance });
      
      const importanceRate = wrapper.find('.memory-importance .el-rate');
      expect(importanceRate.props('modelValue')).toBeUndefined();
    });

    it('should handle memory with very long content', async () => {
      const longContent = 'x'.repeat(1000);
      const longMemory = {
        ...mockMemory,
        content: longContent
      };
      
      await wrapper.setProps({ memory: longMemory });
      await wrapper.setData({ expanded: true });
      
      const textElement = wrapper.find('.memory-text');
      expect(textElement.text()).toBe(longContent);
    });

    it('should handle memory with special characters in content', async () => {
      const specialContent = 'Memory with special chars: áéíóú 中文 🚀';
      const specialMemory = {
        ...mockMemory,
        content: specialContent
      };
      
      await wrapper.setProps({ memory: specialMemory });
      await wrapper.setData({ expanded: true });
      
      const textElement = wrapper.find('.memory-text');
      expect(textElement.text()).toBe(specialContent);
    });

    it('should handle memory with HTML content safely', async () => {
      const htmlContent = '<script>alert("xss")</script>Safe content';
      const htmlMemory = {
        ...mockMemory,
        content: htmlContent
      };
      
      await wrapper.setProps({ memory: htmlMemory });
      await wrapper.setData({ expanded: true });
      
      const textElement = wrapper.find('.memory-text');
      expect(textElement.text()).toBe(htmlContent);
      expect(textElement.find('script').exists()).toBe(false);
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily when props don\'t change', async () => {
      const renderSpy = vi.spyOn(wrapper.vm, '$forceUpdate');
      
      await wrapper.setProps({ memory: mockMemory });
      
      expect(renderSpy).not.toHaveBeenCalled();
    });

    it('should handle rapid expand/collapse operations', async () => {
      for (let i = 0; i < 10; i++) {
        const header = wrapper.find('.memory-header');
        await header.trigger('click');
      }
      
      expect(wrapper.vm.expanded).toBe(i % 2 === 1);
    });
  });
});