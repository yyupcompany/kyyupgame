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
import ThinkingProcess from '@/components/ai/ThinkingProcess.vue';

// Mock the ai store
vi.mock('@/stores/ai', () => ({
  useAiStore: () => ({
    thinkingProcess: {
      steps: [
        {
          id: 1,
          title: '分析问题',
          description: '理解用户提出的问题和需求',
          status: 'completed',
          duration: 1500,
          timestamp: new Date().toISOString()
        },
        {
          id: 2,
          title: '收集信息',
          description: '收集相关数据和背景信息',
          status: 'in-progress',
          duration: 800,
          timestamp: new Date().toISOString()
        },
        {
          id: 3,
          title: '生成方案',
          description: '基于分析结果生成解决方案',
          status: 'pending',
          duration: 0,
          timestamp: new Date().toISOString()
        }
      ],
      currentStep: 2,
      totalSteps: 3,
      progress: 33,
      startTime: new Date().toISOString(),
      estimatedTime: 5000,
      actualTime: 2300
    },
    isThinking: true,
    showThinking: true,
    toggleThinking: vi.fn(),
    getThinkingProcess: vi.fn(),
    clearThinkingProcess: vi.fn(),
    exportThinkingProcess: vi.fn()
  })
}));

describe('ThinkingProcess.vue', () => {
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
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.find('.thinking-process').exists()).toBe(true);
    expect(wrapper.find('.process-header').exists()).toBe(true);
    expect(wrapper.find('.process-content').exists()).toBe(true);
  });

  it('displays header with title', () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    const header = wrapper.find('.process-header');
    expect(header.exists()).toBe(true);
    expect(header.text()).toContain('思考过程');
  });

  it('displays toggle button', () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    const toggleButton = wrapper.find('.toggle-button');
    expect(toggleButton.exists()).toBe(true);
  });

  it('handles toggle button click', async () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    const toggleThinkingSpy = vi.fn();
    wrapper.vm.toggleThinking = toggleThinkingSpy;

    const toggleButton = wrapper.find('.toggle-button');
    await toggleButton.trigger('click');

    expect(toggleThinkingSpy).toHaveBeenCalled();
  });

  it('displays progress bar', () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    const progressBar = wrapper.find('.progress-bar');
    expect(progressBar.exists()).toBe(true);
  });

  it('displays progress percentage', () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    const progressPercentage = wrapper.find('.progress-percentage');
    expect(progressPercentage.exists()).toBe(true);
    expect(progressPercentage.text()).toContain('33%');
  });

  it('displays steps list', () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    const stepsList = wrapper.find('.steps-list');
    expect(stepsList.exists()).toBe(true);
  });

  it('displays step items', () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    const stepItems = wrapper.findAll('.step-item');
    expect(stepItems.length).toBe(3);
  });

  it('displays step titles', () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    const titles = wrapper.findAll('.step-title');
    expect(titles[0].text()).toBe('分析问题');
    expect(titles[1].text()).toBe('收集信息');
    expect(titles[2].text()).toBe('生成方案');
  });

  it('displays step descriptions', () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    const descriptions = wrapper.findAll('.step-description');
    expect(descriptions[0].text()).toContain('理解用户提出的问题和需求');
    expect(descriptions[1].text()).toContain('收集相关数据和背景信息');
    expect(descriptions[2].text()).toContain('基于分析结果生成解决方案');
  });

  it('displays step statuses', () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    const statuses = wrapper.findAll('.step-status');
    expect(statuses[0].classes()).toContain('completed');
    expect(statuses[1].classes()).toContain('in-progress');
    expect(statuses[2].classes()).toContain('pending');
  });

  it('displays step durations', () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    const durations = wrapper.findAll('.step-duration');
    expect(durations[0].text()).toContain('1.5s');
    expect(durations[1].text()).toContain('0.8s');
    expect(durations[2].text()).toContain('0s');
  });

  it('displays step timestamps', () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    const timestamps = wrapper.findAll('.step-timestamp');
    expect(timestamps.length).toBe(3);
  });

  it('highlights current step', () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    const currentStep = wrapper.find('.step-item.current-step');
    expect(currentStep.exists()).toBe(true);
    expect(currentStep.text()).toContain('收集信息');
  });

  it('displays process statistics', () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    const statistics = wrapper.find('.process-statistics');
    expect(statistics.exists()).toBe(true);
  });

  it('displays total steps', () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    const totalSteps = wrapper.find('.total-steps');
    expect(totalSteps.exists()).toBe(true);
    expect(totalSteps.text()).toContain('3');
  });

  it('displays current step number', () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    const currentStepNumber = wrapper.find('.current-step-number');
    expect(currentStepNumber.exists()).toBe(true);
    expect(currentStepNumber.text()).toContain('2');
  });

  it('displays estimated time', () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    const estimatedTime = wrapper.find('.estimated-time');
    expect(estimatedTime.exists()).toBe(true);
    expect(estimatedTime.text()).toContain('5s');
  });

  it('displays actual time', () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    const actualTime = wrapper.find('.actual-time');
    expect(actualTime.exists()).toBe(true);
    expect(actualTime.text()).toContain('2.3s');
  });

  it('displays thinking status', () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    const thinkingStatus = wrapper.find('.thinking-status');
    expect(thinkingStatus.exists()).toBe(true);
    expect(thinkingStatus.text()).toContain('思考中');
  });

  it('displays loading indicator when thinking', () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    const loadingIndicator = wrapper.find('.loading-indicator');
    expect(loadingIndicator.exists()).toBe(true);
  });

  it('hides content when thinking is hidden', async () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ showThinking: false });

    expect(wrapper.find('.process-content').exists()).toBe(false);
  });

  it('displays expand/collapse button', () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    const expandButton = wrapper.find('.expand-button');
    expect(expandButton.exists()).toBe(true);
  });

  it('handles expand button click', async () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    const expandButton = wrapper.find('.expand-button');
    await expandButton.trigger('click');

    expect(wrapper.vm.isExpanded).toBe(true);
  });

  it('displays detailed view when expanded', async () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ isExpanded: true });

    expect(wrapper.find('.detailed-view').exists()).toBe(true);
  });

  it('displays step details in detailed view', async () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ isExpanded: true });

    const stepDetails = wrapper.find('.step-details');
    expect(stepDetails.exists()).toBe(true);
  });

  it('displays process timeline', () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    const timeline = wrapper.find('.process-timeline');
    expect(timeline.exists()).toBe(true);
  });

  it('displays timeline events', () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    const timelineEvents = wrapper.findAll('.timeline-event');
    expect(timelineEvents.length).toBe(3);
  });

  it('handles step click', async () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    const selectStepSpy = vi.fn();
    wrapper.vm.selectStep = selectStepSpy;

    const stepItem = wrapper.find('.step-item');
    await stepItem.trigger('click');

    expect(selectStepSpy).toHaveBeenCalledWith(1);
  });

  it('displays selected step details', async () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ selectedStep: 1 });

    const selectedStepDetails = wrapper.find('.selected-step-details');
    expect(selectedStepDetails.exists()).toBe(true);
  });

  it('displays export button', () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    const exportButton = wrapper.find('.export-button');
    expect(exportButton.exists()).toBe(true);
  });

  it('handles export button click', async () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    const exportThinkingProcessSpy = vi.fn();
    wrapper.vm.exportThinkingProcess = exportThinkingProcessSpy;

    const exportButton = wrapper.find('.export-button');
    await exportButton.trigger('click');

    expect(exportThinkingProcessSpy).toHaveBeenCalled();
  });

  it('displays clear button', () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    const clearButton = wrapper.find('.clear-button');
    expect(clearButton.exists()).toBe(true);
  });

  it('handles clear button click', async () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    const clearThinkingProcessSpy = vi.fn();
    wrapper.vm.clearThinkingProcess = clearThinkingProcessSpy;

    const clearButton = wrapper.find('.clear-button');
    await clearButton.trigger('click');

    expect(clearThinkingProcessSpy).toHaveBeenCalled();
  });

  it('displays refresh button', () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    const refreshButton = wrapper.find('.refresh-button');
    expect(refreshButton.exists()).toBe(true);
  });

  it('handles refresh button click', async () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    const getThinkingProcessSpy = vi.fn();
    wrapper.vm.getThinkingProcess = getThinkingProcessSpy;

    const refreshButton = wrapper.find('.refresh-button');
    await refreshButton.trigger('click');

    expect(getThinkingProcessSpy).toHaveBeenCalled();
  });

  it('displays settings button', () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    const settingsButton = wrapper.find('.settings-button');
    expect(settingsButton.exists()).toBe(true);
  });

  it('handles settings button click', async () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    const settingsButton = wrapper.find('.settings-button');
    await settingsButton.trigger('click');

    expect(wrapper.vm.showSettings).toBe(true);
  });

  it('displays settings panel when active', async () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ showSettings: true });

    expect(wrapper.find('.settings-panel').exists()).toBe(true);
  });

  it('handles settings change', async () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ showSettings: true });

    const autoExpandToggle = wrapper.find('.auto-expand-toggle');
    await autoExpandToggle.setValue(true);

    expect(wrapper.vm.settings.autoExpand).toBe(true);
  });

  it('displays empty state when no thinking process', async () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ thinkingProcess: null });

    expect(wrapper.find('.empty-state').exists()).toBe(true);
    expect(wrapper.find('.empty-state').text()).toContain('暂无思考过程');
  });

  it('displays error message when thinking fails', async () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ error: 'Thinking process failed' });

    expect(wrapper.find('.error-message').exists()).toBe(true);
    expect(wrapper.find('.error-message').text()).toBe('Thinking process failed');
  });

  it('handles error dismissal', async () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ error: 'Thinking process failed' });

    const errorCloseButton = wrapper.find('.error-close-button');
    await errorCloseButton.trigger('click');

    expect(wrapper.vm.error).toBeNull();
  });

  it('displays process completion message', async () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({
      thinkingProcess: {
        ...wrapper.vm.thinkingProcess,
        progress: 100,
        currentStep: 3
      }
    });

    const completionMessage = wrapper.find('.completion-message');
    expect(completionMessage.exists()).toBe(true);
    expect(completionMessage.text()).toContain('思考完成');
  });

  it('displays animation effects for steps', () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    const stepItems = wrapper.findAll('.step-item');
    expect(stepItems[0].classes()).toContain('animate-in');
    expect(stepItems[1].classes()).toContain('animate-in');
    expect(stepItems[2].classes()).toContain('animate-in');
  });

  it('handles real-time updates', async () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({
      thinkingProcess: {
        ...wrapper.vm.thinkingProcess,
        progress: 50,
        currentStep: 2
      }
    });

    const progressBar = wrapper.find('.progress-bar');
    expect(progressBar.attributes('style')).toContain('50%');
  });

  it('is a Vue instance', () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.vm).toBeTruthy();
    expect(wrapper.findComponent(ThinkingProcess).exists()).toBe(true);
  });

  it('has correct component structure', () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.find('.thinking-process').exists()).toBe(true);
    expect(wrapper.find('.process-header').exists()).toBe(true);
    expect(wrapper.find('.process-content').exists()).toBe(true);
  });

  it('applies correct CSS classes', () => {
    const wrapper = mount(ThinkingProcess, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.classes()).toContain('thinking-process');
  });
});