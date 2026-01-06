import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import { VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import VisualFeedback from '@/components/ai/VisualFeedback.vue';
import { createComponentWrapper, waitForUpdate, createTestCleanup } from '../../utils/component-test-helper';

// 控制台错误检测变量
let consoleSpy: any

describe('VisualFeedback', () => {
  let wrapper: VueWrapper<any>;
  const cleanup = createTestCleanup();

  const createWrapper = (props = {}) => {
    return createComponentWrapper(VisualFeedback, {
      props: {
        visible: false,
        type: 'info',
        title: 'Processing',
        description: 'Please wait...',
        showProgress: false,
        progress: 0,
        details: [],
        showAnimation: true,
        ...props
      },
      withPinia: true,
      withRouter: false,
      global: {
        stubs: {
          'el-progress': { template: '<div class="el-progress"><slot /></div>' },
          'el-icon': { template: '<i class="el-icon"><slot /></i>' }
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
      expect(wrapper.find('.visual-feedback').exists()).toBe(true);
    });

    it('should not be visible when visible prop is false', () => {
      expect(wrapper.find('.visual-feedback').isVisible()).toBe(false);
    });

    it('should be visible when visible prop is true', async () => {
      await wrapper.setProps({ visible: true });
      
      expect(wrapper.find('.visual-feedback').isVisible()).toBe(true);
    });

    it('should render feedback content', () => {
      expect(wrapper.find('.feedback-content').exists()).toBe(true);
    });

    it('should render feedback icon', () => {
      expect(wrapper.find('.feedback-icon').exists()).toBe(true);
    });

    it('should render feedback info', () => {
      expect(wrapper.find('.feedback-info').exists()).toBe(true);
    });
  });

  describe('Feedback Types', () => {
    const feedbackTypes = [
      { type: 'navigate', expectedClass: 'feedback-navigate', expectedIcon: 'el-icon-position' },
      { type: 'click', expectedClass: 'feedback-click', expectedIcon: 'el-icon-pointer' },
      { type: 'form', expectedClass: 'feedback-form', expectedIcon: 'el-icon-edit' },
      { type: 'capture', expectedClass: 'feedback-capture', expectedIcon: 'el-icon-camera' },
      { type: 'query', expectedClass: 'feedback-query', expectedIcon: 'el-icon-search' },
      { type: 'create', expectedClass: 'feedback-create', expectedIcon: 'el-icon-plus' },
      { type: 'success', expectedClass: 'feedback-success', expectedIcon: 'el-icon-success' },
      { type: 'error', expectedClass: 'feedback-error', expectedIcon: 'el-icon-error' },
      { type: 'info', expectedClass: 'feedback-info', expectedIcon: 'el-icon-info' }
    ];

    feedbackTypes.forEach(({ type, expectedClass, expectedIcon }) => {
      it(`should render ${type} feedback correctly`, async () => {
        await wrapper.setProps({ visible: true, type });
        
        const feedbackEl = wrapper.find('.visual-feedback');
        expect(feedbackEl.classes()).toContain(expectedClass);
        
        const icon = wrapper.find('.feedback-icon i');
        expect(icon.classes()).toContain(expectedIcon);
      });
    });

    it('should handle unknown feedback type', async () => {
      await wrapper.setProps({ visible: true, type: 'unknown' as any });
      
      const feedbackEl = wrapper.find('.visual-feedback');
      expect(feedbackEl.classes()).toContain('feedback-info');
      
      const icon = wrapper.find('.feedback-icon i');
      expect(icon.classes()).toContain('el-icon-loading');
    });
  });

  describe('Content Display', () => {
    it('should display title correctly', async () => {
      await wrapper.setProps({ visible: true, title: 'Custom Title' });
      
      const title = wrapper.find('.feedback-info h4');
      expect(title.exists()).toBe(true);
      expect(title.text()).toBe('Custom Title');
    });

    it('should display description correctly', async () => {
      await wrapper.setProps({ visible: true, description: 'Custom description text' });
      
      const description = wrapper.find('.feedback-info p');
      expect(description.exists()).toBe(true);
      expect(description.text()).toBe('Custom description text');
    });

    it('should not render description when not provided', async () => {
      await wrapper.setProps({ visible: true, description: undefined });
      
      const description = wrapper.find('.feedback-info p');
      expect(description.exists()).toBe(false);
    });
  });

  describe('Progress Display', () => {
    it('should render progress when showProgress is true', async () => {
      await wrapper.setProps({ 
        visible: true, 
        showProgress: true,
        progress: 50
      });
      
      const progress = wrapper.find('.feedback-info :deep(.el-progress)');
      expect(progress.exists()).toBe(true);
    });

    it('should not render progress when showProgress is false', async () => {
      await wrapper.setProps({ 
        visible: true, 
        showProgress: false,
        progress: 50
      });
      
      const progress = wrapper.find('.feedback-info :deep(.el-progress)');
      expect(progress.exists()).toBe(false);
    });

    it('should display correct progress value', async () => {
      await wrapper.setProps({ 
        visible: true, 
        showProgress: true,
        progress: 75
      });
      
      const progress = wrapper.find('.feedback-info :deep(.el-progress)');
      expect(progress.props('percentage')).toBe(75);
    });

    it('should set progress status based on value and type', async () => {
      // Test 100% progress
      await wrapper.setProps({ 
        visible: true, 
        showProgress: true,
        progress: 100
      });
      
      let progress = wrapper.find('.feedback-info :deep(.el-progress)');
      expect(progress.props('status')).toBe('success');
      
      // Test error type
      await wrapper.setProps({ 
        visible: true, 
        showProgress: true,
        progress: 50,
        type: 'error'
      });
      
      progress = wrapper.find('.feedback-info :deep(.el-progress)');
      expect(progress.props('status')).toBe('exception');
    });
  });

  describe('Details Display', () => {
    const mockDetails = [
      { label: 'Items Processed', value: 100 },
      { label: 'Time Elapsed', value: '2.5s' },
      { label: 'Success Rate', value: '98%' }
    ];

    it('should render details when provided', async () => {
      await wrapper.setProps({ 
        visible: true, 
        details: mockDetails
      });
      
      const detailsContainer = wrapper.find('.feedback-details');
      expect(detailsContainer.exists()).toBe(true);
      
      const detailItems = detailsContainer.findAll('.detail-item');
      expect(detailItems.length).toBe(3);
    });

    it('should display detail items correctly', async () => {
      await wrapper.setProps({ 
        visible: true, 
        details: mockDetails
      });
      
      const detailItems = wrapper.findAll('.detail-item');
      
      expect(detailItems[0].find('.detail-label').text()).toBe('Items Processed:');
      expect(detailItems[0].find('.detail-value').text()).toBe('100');
      
      expect(detailItems[1].find('.detail-label').text()).toBe('Time Elapsed:');
      expect(detailItems[1].find('.detail-value').text()).toBe('2.5s');
      
      expect(detailItems[2].find('.detail-label').text()).toBe('Success Rate:');
      expect(detailItems[2].find('.detail-value').text()).toBe('98%');
    });

    it('should not render details when empty', async () => {
      await wrapper.setProps({ 
        visible: true, 
        details: []
      });
      
      const detailsContainer = wrapper.find('.feedback-details');
      expect(detailsContainer.exists()).toBe(false);
    });

    it('should not render details when not provided', async () => {
      await wrapper.setProps({ 
        visible: true, 
        details: undefined
      });
      
      const detailsContainer = wrapper.find('.feedback-details');
      expect(detailsContainer.exists()).toBe(false);
    });
  });

  describe('Animation Display', () => {
    it('should render animation when showAnimation is true', async () => {
      await wrapper.setProps({ 
        visible: true, 
        showAnimation: true
      });
      
      const animation = wrapper.find('.feedback-animation');
      expect(animation.exists()).toBe(true);
      
      const pulseRings = animation.findAll('.pulse-ring');
      expect(pulseRings.length).toBe(3);
    });

    it('should not render animation when showAnimation is false', async () => {
      await wrapper.setProps({ 
        visible: true, 
        showAnimation: false
      });
      
      const animation = wrapper.find('.feedback-animation');
      expect(animation.exists()).toBe(false);
    });

    it('should apply delay classes to pulse rings', async () => {
      await wrapper.setProps({ 
        visible: true, 
        showAnimation: true
      });
      
      const pulseRings = wrapper.findAll('.pulse-ring');
      expect(pulseRings[0].classes()).not.toContain('delay-1');
      expect(pulseRings[0].classes()).not.toContain('delay-2');
      
      expect(pulseRings[1].classes()).toContain('delay-1');
      expect(pulseRings[1].classes()).not.toContain('delay-2');
      
      expect(pulseRings[2].classes()).not.toContain('delay-1');
      expect(pulseRings[2].classes()).toContain('delay-2');
    });
  });

  describe('Computed Properties', () => {
    describe('feedbackClass', () => {
      it('should return correct class for each feedback type', () => {
        const testCases = [
          { type: 'navigate', expected: 'feedback-navigate' },
          { type: 'click', expected: 'feedback-click' },
          { type: 'form', expected: 'feedback-form' },
          { type: 'capture', expected: 'feedback-capture' },
          { type: 'query', expected: 'feedback-query' },
          { type: 'create', expected: 'feedback-create' },
          { type: 'success', expected: 'feedback-success' },
          { type: 'error', expected: 'feedback-error' },
          { type: 'info', expected: 'feedback-info' }
        ];

        testCases.forEach(({ type, expected }) => {
          wrapper = createWrapper({ type });
          expect(wrapper.vm.feedbackClass).toBe(expected);
        });
      });
    });

    describe('iconClass', () => {
      it('should return correct icon class for each feedback type', () => {
        const testCases = [
          { type: 'navigate', expected: 'el-icon-position' },
          { type: 'click', expected: 'el-icon-pointer' },
          { type: 'form', expected: 'el-icon-edit' },
          { type: 'capture', expected: 'el-icon-camera' },
          { type: 'query', expected: 'el-icon-search' },
          { type: 'create', expected: 'el-icon-plus' },
          { type: 'success', expected: 'el-icon-success' },
          { type: 'error', expected: 'el-icon-error' },
          { type: 'info', expected: 'el-icon-info' }
        ];

        testCases.forEach(({ type, expected }) => {
          wrapper = createWrapper({ type });
          expect(wrapper.vm.iconClass).toBe(expected);
        });
      });

      it('should return loading icon for unknown type', () => {
        wrapper = createWrapper({ type: 'unknown' as any });
        expect(wrapper.vm.iconClass).toBe('el-icon-loading');
      });
    });

    describe('progressStatus', () => {
      it('should return success status when progress is 100', () => {
        wrapper = createWrapper({ progress: 100 });
        expect(wrapper.vm.progressStatus).toBe('success');
      });

      it('should return exception status when type is error', () => {
        wrapper = createWrapper({ type: 'error', progress: 50 });
        expect(wrapper.vm.progressStatus).toBe('exception');
      });

      it('should return undefined when progress is not 100 and type is not error', () => {
        wrapper = createWrapper({ progress: 50, type: 'info' });
        expect(wrapper.vm.progressStatus).toBeUndefined();
      });
    });
  });

  describe('Transitions', () => {
    it('should apply transition classes', async () => {
      await wrapper.setProps({ visible: true });
      
      const feedbackEl = wrapper.find('.visual-feedback');
      expect(feedbackEl.classes()).toContain('visual-feedback-enter-active');
    });

    it('should handle transition states correctly', async () => {
      // Test enter transition
      await wrapper.setProps({ visible: true });
      await nextTick();
      
      let feedbackEl = wrapper.find('.visual-feedback');
      expect(feedbackEl.classes()).toContain('visual-feedback-enter-active');
      
      // Test leave transition
      await wrapper.setProps({ visible: false });
      await nextTick();
      
      feedbackEl = wrapper.find('.visual-feedback');
      expect(feedbackEl.classes()).toContain('visual-feedback-leave-active');
    });
  });

  describe('Default Props', () => {
    it('should use default values when props not provided', () => {
      wrapper = createWrapper({});
      cleanup.addCleanup(() => wrapper?.unmount());

      expect(wrapper.props('visible')).toBe(false);
      expect(wrapper.props('type')).toBe('info');
      expect(wrapper.props('title')).toBe('Processing');
      expect(wrapper.props('showProgress')).toBe(false);
      expect(wrapper.props('progress')).toBe(0);
      expect(wrapper.props('showAnimation')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative progress values', async () => {
      await wrapper.setProps({ 
        visible: true, 
        showProgress: true,
        progress: -10
      });
      
      const progress = wrapper.find('.feedback-info :deep(.el-progress)');
      expect(progress.props('percentage')).toBe(-10);
    });

    it('should handle progress values over 100', async () => {
      await wrapper.setProps({ 
        visible: true, 
        showProgress: true,
        progress: 150
      });
      
      const progress = wrapper.find('.feedback-info :deep(.el-progress)');
      expect(progress.props('percentage')).toBe(150);
    });

    it('should handle details with missing properties', async () => {
      const incompleteDetails = [
        { label: 'Label 1' },
        { value: 'Value 2' },
        {}
      ] as any;
      
      await wrapper.setProps({ 
        visible: true, 
        details: incompleteDetails
      });
      
      const detailItems = wrapper.findAll('.detail-item');
      expect(detailItems.length).toBe(3);
    });

    it('should handle empty strings in props', async () => {
      await wrapper.setProps({ 
        visible: true, 
        title: '',
        description: ''
      });
      
      const title = wrapper.find('.feedback-info h4');
      const description = wrapper.find('.feedback-info p');
      
      expect(title.text()).toBe('');
      expect(description.exists()).toBe(false);
    });

    it('should handle null and undefined details', async () => {
      await wrapper.setProps({ 
        visible: true, 
        details: null as any
      });
      
      let detailsContainer = wrapper.find('.feedback-details');
      expect(detailsContainer.exists()).toBe(false);
      
      await wrapper.setProps({ 
        visible: true, 
        details: undefined as any
      });
      
      detailsContainer = wrapper.find('.feedback-details');
      expect(detailsContainer.exists()).toBe(false);
    });
  });

  describe('Styling and Layout', () => {
    it('should have correct CSS classes for positioning', async () => {
      await wrapper.setProps({ visible: true });
      
      const feedbackEl = wrapper.find('.visual-feedback');
      const styles = feedbackEl.attributes('style');
      
      expect(styles).toContain('position: fixed');
      expect(styles).toContain('top: 50%');
      expect(styles).toContain('left: 50%');
    });

    it('should have feedback content with correct layout', async () => {
      await wrapper.setProps({ visible: true });
      
      const content = wrapper.find('.feedback-content');
      expect(content.classes()).toContain('feedback-content');
    });

    it('should apply feedback color CSS variable based on type', async () => {
      await wrapper.setProps({ visible: true, type: 'success' });
      
      const feedbackEl = wrapper.find('.visual-feedback');
      expect(feedbackEl.classes()).toContain('feedback-success');
    });
  });

  describe('Responsiveness', () => {
    it('should maintain proper layout on different screen sizes', async () => {
      await wrapper.setProps({ visible: true });
      
      const feedbackEl = wrapper.find('.visual-feedback');
      expect(feedbackEl.attributes('style')).toContain('min-width: 320px');
      expect(feedbackEl.attributes('style')).toContain('max-width: 480px');
    });
  });
});