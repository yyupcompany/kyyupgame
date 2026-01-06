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
import AIStatistics from '@/components/ai/AIStatistics.vue';

// Mock the request module
vi.mock('@/utils/request', () => ({
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn()
}));

// Mock the ai store
vi.mock('@/stores/ai', () => ({
  useAiStore: () => ({
    statistics: {
      totalConversations: 100,
      totalMessages: 500,
      averageResponseTime: 2.5,
      userSatisfaction: 4.2,
      topTopics: ['General', 'Technical', 'Creative'],
      dailyUsage: [
        { date: '2023-01-01', count: 10 },
        { date: '2023-01-02', count: 15 },
        { date: '2023-01-03', count: 12 }
      ],
      modelUsage: {
        'gpt-3.5-turbo': 300,
        'gpt-4': 200
      },
      errorRate: 0.05,
      successRate: 0.95
    },
    isLoading: false,
    error: null,
    fetchStatistics: vi.fn(),
    refreshStatistics: vi.fn()
  })
}));

describe('AIStatistics.vue', () => {
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
    const wrapper = mount(AIStatistics, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.find('.ai-statistics').exists()).toBe(true);
    expect(wrapper.find('.statistics-header').exists()).toBe(true);
    expect(wrapper.find('.statistics-content').exists()).toBe(true);
  });

  it('displays header with title', () => {
    const wrapper = mount(AIStatistics, {
      global: {
        plugins: [router, pinia]
      }
    });

    const header = wrapper.find('.statistics-header');
    expect(header.exists()).toBe(true);
    expect(header.text()).toContain('AI统计');
  });

  it('displays total conversations', () => {
    const wrapper = mount(AIStatistics, {
      global: {
        plugins: [router, pinia]
      }
    });

    const totalConversations = wrapper.find('.total-conversations');
    expect(totalConversations.exists()).toBe(true);
    expect(totalConversations.text()).toContain('100');
  });

  it('displays total messages', () => {
    const wrapper = mount(AIStatistics, {
      global: {
        plugins: [router, pinia]
      }
    });

    const totalMessages = wrapper.find('.total-messages');
    expect(totalMessages.exists()).toBe(true);
    expect(totalMessages.text()).toContain('500');
  });

  it('displays average response time', () => {
    const wrapper = mount(AIStatistics, {
      global: {
        plugins: [router, pinia]
      }
    });

    const avgResponseTime = wrapper.find('.average-response-time');
    expect(avgResponseTime.exists()).toBe(true);
    expect(avgResponseTime.text()).toContain('2.5s');
  });

  it('displays user satisfaction', () => {
    const wrapper = mount(AIStatistics, {
      global: {
        plugins: [router, pinia]
      }
    });

    const satisfaction = wrapper.find('.user-satisfaction');
    expect(satisfaction.exists()).toBe(true);
    expect(satisfaction.text()).toContain('4.2');
  });

  it('displays top topics', () => {
    const wrapper = mount(AIStatistics, {
      global: {
        plugins: [router, pinia]
      }
    });

    const topTopics = wrapper.find('.top-topics');
    expect(topTopics.exists()).toBe(true);
    expect(topTopics.text()).toContain('General');
    expect(topTopics.text()).toContain('Technical');
    expect(topTopics.text()).toContain('Creative');
  });

  it('displays daily usage chart', () => {
    const wrapper = mount(AIStatistics, {
      global: {
        plugins: [router, pinia]
      }
    });

    const dailyUsage = wrapper.find('.daily-usage-chart');
    expect(dailyUsage.exists()).toBe(true);
  });

  it('displays model usage distribution', () => {
    const wrapper = mount(AIStatistics, {
      global: {
        plugins: [router, pinia]
      }
    });

    const modelUsage = wrapper.find('.model-usage');
    expect(modelUsage.exists()).toBe(true);
    expect(modelUsage.text()).toContain('gpt-3.5-turbo');
    expect(modelUsage.text()).toContain('gpt-4');
  });

  it('displays error rate', () => {
    const wrapper = mount(AIStatistics, {
      global: {
        plugins: [router, pinia]
      }
    });

    const errorRate = wrapper.find('.error-rate');
    expect(errorRate.exists()).toBe(true);
    expect(errorRate.text()).toContain('5%');
  });

  it('displays success rate', () => {
    const wrapper = mount(AIStatistics, {
      global: {
        plugins: [router, pinia]
      }
    });

    const successRate = wrapper.find('.success-rate');
    expect(successRate.exists()).toBe(true);
    expect(successRate.text()).toContain('95%');
  });

  it('displays loading state when loading', async () => {
    const wrapper = mount(AIStatistics, {
      global: {
        plugins: [router, pinia]
      }
    });

    // Simulate loading state
    await wrapper.setData({ isLoading: true });

    expect(wrapper.find('.loading-spinner').exists()).toBe(true);
  });

  it('displays error message when error exists', async () => {
    const wrapper = mount(AIStatistics, {
      global: {
        plugins: [router, pinia]
      }
    });

    // Simulate error state
    await wrapper.setData({ error: 'Failed to load statistics' });

    expect(wrapper.find('.error-message').exists()).toBe(true);
    expect(wrapper.find('.error-message').text()).toBe('Failed to load statistics');
  });

  it('handles refresh button click', async () => {
    const wrapper = mount(AIStatistics, {
      global: {
        plugins: [router, pinia]
      }
    });

    const refreshStatisticsSpy = vi.fn();
    wrapper.vm.refreshStatistics = refreshStatisticsSpy;

    const refreshButton = wrapper.find('.refresh-button');
    await refreshButton.trigger('click');

    expect(refreshStatisticsSpy).toHaveBeenCalled();
  });

  it('handles date range filter change', async () => {
    const wrapper = mount(AIStatistics, {
      global: {
        plugins: [router, pinia]
      }
    });

    const filterStatisticsSpy = vi.fn();
    wrapper.vm.filterStatistics = filterStatisticsSpy;

    const dateRange = wrapper.find('.date-range-filter');
    await dateRange.setValue('last-7-days');

    expect(filterStatisticsSpy).toHaveBeenCalledWith('last-7-days');
  });

  it('handles export button click', async () => {
    const wrapper = mount(AIStatistics, {
      global: {
        plugins: [router, pinia]
      }
    });

    const exportStatisticsSpy = vi.fn();
    wrapper.vm.exportStatistics = exportStatisticsSpy;

    const exportButton = wrapper.find('.export-button');
    await exportButton.trigger('click');

    expect(exportStatisticsSpy).toHaveBeenCalled();
  });

  it('handles tab switching', async () => {
    const wrapper = mount(AIStatistics, {
      global: {
        plugins: [router, pinia]
      }
    });

    const overviewTab = wrapper.find('.tab-overview');
    const detailedTab = wrapper.find('.tab-detailed');

    await overviewTab.trigger('click');
    expect(wrapper.vm.activeTab).toBe('overview');

    await detailedTab.trigger('click');
    expect(wrapper.vm.activeTab).toBe('detailed');
  });

  it('displays detailed statistics when detailed tab is active', async () => {
    const wrapper = mount(AIStatistics, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ activeTab: 'detailed' });

    expect(wrapper.find('.detailed-statistics').exists()).toBe(true);
  });

  it('handles time period selection', async () => {
    const wrapper = mount(AIStatistics, {
      global: {
        plugins: [router, pinia]
      }
    });

    const timePeriodSelect = wrapper.find('.time-period-select');
    await timePeriodSelect.setValue('monthly');

    expect(wrapper.vm.selectedTimePeriod).toBe('monthly');
  });

  it('handles metric selection', async () => {
    const wrapper = mount(AIStatistics, {
      global: {
        plugins: [router, pinia]
      }
    });

    const metricCheckbox = wrapper.find('.metric-checkbox');
    await metricCheckbox.setChecked(true);

    expect(wrapper.vm.selectedMetrics).toContain('conversations');
  });

  it('displays chart tooltips', async () => {
    const wrapper = mount(AIStatistics, {
      global: {
        plugins: [router, pinia]
      }
    });

    const chartPoint = wrapper.find('.chart-point');
    await chartPoint.trigger('mouseenter');

    expect(wrapper.find('.chart-tooltip').exists()).toBe(true);
  });

  it('handles chart point click', async () => {
    const wrapper = mount(AIStatistics, {
      global: {
        plugins: [router, pinia]
      }
    });

    const handleChartPointClickSpy = vi.fn();
    wrapper.vm.handleChartPointClick = handleChartPointClickSpy;

    const chartPoint = wrapper.find('.chart-point');
    await chartPoint.trigger('click');

    expect(handleChartPointClickSpy).toHaveBeenCalled();
  });

  it('displays comparative statistics', () => {
    const wrapper = mount(AIStatistics, {
      global: {
        plugins: [router, pinia]
      }
    });

    const comparativeStats = wrapper.find('.comparative-statistics');
    expect(comparativeStats.exists()).toBe(true);
  });

  it('handles comparison period change', async () => {
    const wrapper = mount(AIStatistics, {
      global: {
        plugins: [router, pinia]
      }
    });

    const comparisonPeriod = wrapper.find('.comparison-period');
    await comparisonPeriod.setValue('previous-month');

    expect(wrapper.vm.comparisonPeriod).toBe('previous-month');
  });

  it('displays trend indicators', () => {
    const wrapper = mount(AIStatistics, {
      global: {
        plugins: [router, pinia]
      }
    });

    const trendIndicator = wrapper.find('.trend-indicator');
    expect(trendIndicator.exists()).toBe(true);
  });

  it('handles threshold configuration', async () => {
    const wrapper = mount(AIStatistics, {
      global: {
        plugins: [router, pinia]
      }
    });

    const thresholdInput = wrapper.find('.threshold-input');
    await thresholdInput.setValue('80');

    expect(wrapper.vm.alertThreshold).toBe(80);
  });

  it('displays alert notifications', async () => {
    const wrapper = mount(AIStatistics, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ showAlerts: true });

    expect(wrapper.find('.alert-notifications').exists()).toBe(true);
  });

  it('handles alert dismissal', async () => {
    const wrapper = mount(AIStatistics, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ showAlerts: true });

    const dismissButton = wrapper.find('.dismiss-alert-button');
    await dismissButton.trigger('click');

    expect(wrapper.vm.showAlerts).toBe(false);
  });

  it('is a Vue instance', () => {
    const wrapper = mount(AIStatistics, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.vm).toBeTruthy();
    expect(wrapper.findComponent(AIStatistics).exists()).toBe(true);
  });

  it('has correct component structure', () => {
    const wrapper = mount(AIStatistics, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.find('.ai-statistics').exists()).toBe(true);
    expect(wrapper.find('.statistics-header').exists()).toBe(true);
    expect(wrapper.find('.statistics-content').exists()).toBe(true);
  });

  it('applies correct CSS classes', () => {
    const wrapper = mount(AIStatistics, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.classes()).toContain('ai-statistics');
  });
});