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

describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createWebHistory, Router } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';
import AIToggleButton from '@/components/ai/AIToggleButton.vue';

// Mock the ai store
vi.mock('@/stores/ai', () => ({
  useAiStore: () => ({
    isEnabled: false,
    isMinimized: false,
    toggleAI: vi.fn(),
    minimizeAI: vi.fn(),
    maximizeAI: vi.fn()
  })
}));

describe('AIToggleButton.vue', () => {
  let router: Router;
  let pinia: any;

  beforeEach(() => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: '/',
          name: 'home',
          component: { template: '<div>Home</div>' }
        }
      ]
    });

    pinia = createPinia();
    setActivePinia(pinia);
  });

  it('renders correctly with default props', () => {
    const wrapper = mount(AIToggleButton, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.find('.ai-toggle-button').exists()).toBe(true);
    expect(wrapper.find('.toggle-icon').exists()).toBe(true);
  });

  it('displays toggle button with correct icon when AI is disabled', () => {
    const wrapper = mount(AIToggleButton, {
      global: {
        plugins: [router, pinia]
      }
    });

    const button = wrapper.find('.ai-toggle-button');
    const icon = wrapper.find('.toggle-icon');

    expect(button.exists()).toBe(true);
    expect(icon.exists()).toBe(true);
    expect(button.classes()).toContain('ai-disabled');
  });

  it('displays toggle button with correct icon when AI is enabled', async () => {
    const wrapper = mount(AIToggleButton, {
      global: {
        plugins: [router, pinia]
      }
    });

    // Simulate AI enabled state
    await wrapper.setData({ isEnabled: true });

    const button = wrapper.find('.ai-toggle-button');
    const icon = wrapper.find('.toggle-icon');

    expect(button.exists()).toBe(true);
    expect(icon.exists()).toBe(true);
    expect(button.classes()).toContain('ai-enabled');
  });

  it('displays minimize button when AI is enabled and not minimized', async () => {
    const wrapper = mount(AIToggleButton, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ isEnabled: true, isMinimized: false });

    const minimizeButton = wrapper.find('.minimize-button');
    expect(minimizeButton.exists()).toBe(true);
  });

  it('displays maximize button when AI is enabled and minimized', async () => {
    const wrapper = mount(AIToggleButton, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ isEnabled: true, isMinimized: true });

    const maximizeButton = wrapper.find('.maximize-button');
    expect(maximizeButton.exists()).toBe(true);
  });

  it('hides minimize/maximize buttons when AI is disabled', () => {
    const wrapper = mount(AIToggleButton, {
      global: {
        plugins: [router, pinia]
      }
    });

    const minimizeButton = wrapper.find('.minimize-button');
    const maximizeButton = wrapper.find('.maximize-button');

    expect(minimizeButton.exists()).toBe(false);
    expect(maximizeButton.exists()).toBe(false);
  });

  it('handles toggle button click when AI is disabled', async () => {
    const wrapper = mount(AIToggleButton, {
      global: {
        plugins: [router, pinia]
      }
    });

    const toggleAISpy = vi.fn();
    wrapper.vm.toggleAI = toggleAISpy;

    const toggleButton = wrapper.find('.ai-toggle-button');
    await toggleButton.trigger('click');

    expect(toggleAISpy).toHaveBeenCalled();
  });

  it('handles toggle button click when AI is enabled', async () => {
    const wrapper = mount(AIToggleButton, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ isEnabled: true });

    const toggleAISpy = vi.fn();
    wrapper.vm.toggleAI = toggleAISpy;

    const toggleButton = wrapper.find('.ai-toggle-button');
    await toggleButton.trigger('click');

    expect(toggleAISpy).toHaveBeenCalled();
  });

  it('handles minimize button click', async () => {
    const wrapper = mount(AIToggleButton, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ isEnabled: true, isMinimized: false });

    const minimizeAISpy = vi.fn();
    wrapper.vm.minimizeAI = minimizeAISpy;

    const minimizeButton = wrapper.find('.minimize-button');
    await minimizeButton.trigger('click');

    expect(minimizeAISpy).toHaveBeenCalled();
  });

  it('handles maximize button click', async () => {
    const wrapper = mount(AIToggleButton, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ isEnabled: true, isMinimized: true });

    const maximizeAISpy = vi.fn();
    wrapper.vm.maximizeAI = maximizeAISpy;

    const maximizeButton = wrapper.find('.maximize-button');
    await maximizeButton.trigger('click');

    expect(maximizeAISpy).toHaveBeenCalled();
  });

  it('displays tooltip on hover', async () => {
    const wrapper = mount(AIToggleButton, {
      global: {
        plugins: [router, pinia]
      }
    });

    const toggleButton = wrapper.find('.ai-toggle-button');
    await toggleButton.trigger('mouseenter');

    expect(wrapper.vm.showTooltip).toBe(true);
    expect(wrapper.find('.tooltip').exists()).toBe(true);
  });

  it('hides tooltip on mouse leave', async () => {
    const wrapper = mount(AIToggleButton, {
      global: {
        plugins: [router, pinia]
      }
    });

    const toggleButton = wrapper.find('.ai-toggle-button');
    await toggleButton.trigger('mouseenter');
    await toggleButton.trigger('mouseleave');

    expect(wrapper.vm.showTooltip).toBe(false);
    expect(wrapper.find('.tooltip').exists()).toBe(false);
  });

  it('displays correct tooltip text when AI is disabled', async () => {
    const wrapper = mount(AIToggleButton, {
      global: {
        plugins: [router, pinia]
      }
    });

    const toggleButton = wrapper.find('.ai-toggle-button');
    await toggleButton.trigger('mouseenter');

    const tooltip = wrapper.find('.tooltip');
    expect(tooltip.text()).toBe('启用AI助手');
  });

  it('displays correct tooltip text when AI is enabled', async () => {
    const wrapper = mount(AIToggleButton, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ isEnabled: true });

    const toggleButton = wrapper.find('.ai-toggle-button');
    await toggleButton.trigger('mouseenter');

    const tooltip = wrapper.find('.tooltip');
    expect(tooltip.text()).toBe('禁用AI助手');
  });

  it('handles keyboard navigation', async () => {
    const wrapper = mount(AIToggleButton, {
      global: {
        plugins: [router, pinia]
      }
    });

    const toggleAISpy = vi.fn();
    wrapper.vm.toggleAI = toggleAISpy;

    const toggleButton = wrapper.find('.ai-toggle-button');
    await toggleButton.trigger('keydown', { key: 'Enter' });

    expect(toggleAISpy).toHaveBeenCalled();
  });

  it('handles space key for toggle', async () => {
    const wrapper = mount(AIToggleButton, {
      global: {
        plugins: [router, pinia]
      }
    });

    const toggleAISpy = vi.fn();
    wrapper.vm.toggleAI = toggleAISpy;

    const toggleButton = wrapper.find('.ai-toggle-button');
    await toggleButton.trigger('keydown', { key: ' ' });

    expect(toggleAISpy).toHaveBeenCalled();
  });

  it('applies correct CSS classes for different states', async () => {
    const wrapper = mount(AIToggleButton, {
      global: {
        plugins: [router, pinia]
      }
    });

    const button = wrapper.find('.ai-toggle-button');
    
    // Test disabled state
    expect(button.classes()).toContain('ai-disabled');
    expect(button.classes()).not.toContain('ai-enabled');

    // Test enabled state
    await wrapper.setData({ isEnabled: true });
    expect(button.classes()).toContain('ai-enabled');
    expect(button.classes()).not.toContain('ai-disabled');

    // Test minimized state
    await wrapper.setData({ isMinimized: true });
    expect(button.classes()).toContain('ai-minimized');
  });

  it('displays loading state when toggling', async () => {
    const wrapper = mount(AIToggleButton, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ isLoading: true });

    const button = wrapper.find('.ai-toggle-button');
    expect(button.classes()).toContain('loading');
    expect(wrapper.find('.loading-spinner').exists()).toBe(true);
  });

  it('disables button during loading', async () => {
    const wrapper = mount(AIToggleButton, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ isLoading: true });

    const button = wrapper.find('.ai-toggle-button');
    expect(button.attributes('disabled')).toBe('');
  });

  it('handles error state', async () => {
    const wrapper = mount(AIToggleButton, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ hasError: true });

    const button = wrapper.find('.ai-toggle-button');
    expect(button.classes()).toContain('error');
    expect(wrapper.find('.error-icon').exists()).toBe(true);
  });

  it('displays notification badge when there are unread messages', async () => {
    const wrapper = mount(AIToggleButton, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ unreadCount: 3 });

    const badge = wrapper.find('.notification-badge');
    expect(badge.exists()).toBe(true);
    expect(badge.text()).toBe('3');
  });

  it('hides notification badge when no unread messages', () => {
    const wrapper = mount(AIToggleButton, {
      global: {
        plugins: [router, pinia]
      }
    });

    const badge = wrapper.find('.notification-badge');
    expect(badge.exists()).toBe(false);
  });

  it('handles custom positioning', () => {
    const wrapper = mount(AIToggleButton, {
      global: {
        plugins: [router, pinia]
      },
      props: {
        position: 'bottom-right'
      }
    });

    const button = wrapper.find('.ai-toggle-button');
    expect(button.classes()).toContain('position-bottom-right');
  });

  it('handles custom styling', () => {
    const wrapper = mount(AIToggleButton, {
      global: {
        plugins: [router, pinia]
      },
      props: {
        size: 'large',
        variant: 'floating'
      }
    });

    const button = wrapper.find('.ai-toggle-button');
    expect(button.classes()).toContain('size-large');
    expect(button.classes()).toContain('variant-floating');
  });

  it('is a Vue instance', () => {
    const wrapper = mount(AIToggleButton, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.vm).toBeTruthy();
    expect(wrapper.findComponent(AIToggleButton).exists()).toBe(true);
  });

  it('has correct component structure', () => {
    const wrapper = mount(AIToggleButton, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.find('.ai-toggle-button').exists()).toBe(true);
    expect(wrapper.find('.toggle-icon').exists()).toBe(true);
  });

  it('applies correct CSS classes', () => {
    const wrapper = mount(AIToggleButton, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.classes()).toContain('ai-toggle-button');
  });

  it('emits events correctly', async () => {
    const wrapper = mount(AIToggleButton, {
      global: {
        plugins: [router, pinia]
      }
    });

    const toggleButton = wrapper.find('.ai-toggle-button');
    await toggleButton.trigger('click');

    expect(wrapper.emitted('toggle')).toBeTruthy();
    expect(wrapper.emitted('toggle')).toHaveLength(1);
  });

  it('handles accessibility attributes', () => {
    const wrapper = mount(AIToggleButton, {
      global: {
        plugins: [router, pinia]
      }
    });

    const button = wrapper.find('.ai-toggle-button');
    expect(button.attributes('role')).toBe('button');
    expect(button.attributes('tabindex')).toBe('0');
    expect(button.attributes('aria-label')).toBe('AI助手开关');
  });
});