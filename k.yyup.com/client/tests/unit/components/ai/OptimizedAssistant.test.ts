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
import OptimizedAssistant from '@/components/ai/OptimizedAssistant.vue';

// Mock the ai store
vi.mock('@/stores/ai', () => ({
  useAiStore: () => ({
    isEnabled: false,
    isOptimized: false,
    performance: {
      responseTime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      cacheHitRate: 0
    },
    settings: {
      optimizationLevel: 'medium',
      enableCaching: true,
      enableCompression: true,
      enableLazyLoading: true,
      maxCacheSize: 1000,
      timeout: 30000
    },
    enableOptimization: vi.fn(),
    disableOptimization: vi.fn(),
    updateOptimizationSettings: vi.fn(),
    getPerformanceMetrics: vi.fn(),
    clearCache: vi.fn(),
    optimizeConversation: vi.fn()
  })
}));

describe('OptimizedAssistant.vue', () => {
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
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.find('.optimized-assistant').exists()).toBe(true);
    expect(wrapper.find('.optimization-header').exists()).toBe(true);
    expect(wrapper.find('.optimization-content').exists()).toBe(true);
  });

  it('displays header with title', () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const header = wrapper.find('.optimization-header');
    expect(header.exists()).toBe(true);
    expect(header.text()).toContain('AI优化助手');
  });

  it('displays optimization toggle', () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const toggle = wrapper.find('.optimization-toggle');
    expect(toggle.exists()).toBe(true);
  });

  it('disables optimization when turned off', async () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const disableOptimizationSpy = vi.fn();
    wrapper.vm.disableOptimization = disableOptimizationSpy;

    const toggle = wrapper.find('.optimization-toggle');
    await toggle.setValue(false);

    expect(disableOptimizationSpy).toHaveBeenCalled();
  });

  it('enables optimization when turned on', async () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const enableOptimizationSpy = vi.fn();
    wrapper.vm.enableOptimization = enableOptimizationSpy;

    const toggle = wrapper.find('.optimization-toggle');
    await toggle.setValue(true);

    expect(enableOptimizationSpy).toHaveBeenCalled();
  });

  it('displays optimization status', () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const status = wrapper.find('.optimization-status');
    expect(status.exists()).toBe(true);
    expect(status.text()).toContain('未优化');
  });

  it('displays performance metrics', () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const metrics = wrapper.find('.performance-metrics');
    expect(metrics.exists()).toBe(true);
  });

  it('displays response time metric', () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const responseTime = wrapper.find('.response-time');
    expect(responseTime.exists()).toBe(true);
    expect(responseTime.text()).toContain('响应时间');
  });

  it('displays memory usage metric', () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const memoryUsage = wrapper.find('.memory-usage');
    expect(memoryUsage.exists()).toBe(true);
    expect(memoryUsage.text()).toContain('内存使用');
  });

  it('displays CPU usage metric', () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const cpuUsage = wrapper.find('.cpu-usage');
    expect(cpuUsage.exists()).toBe(true);
    expect(cpuUsage.text()).toContain('CPU使用');
  });

  it('displays cache hit rate metric', () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const cacheHitRate = wrapper.find('.cache-hit-rate');
    expect(cacheHitRate.exists()).toBe(true);
    expect(cacheHitRate.text()).toContain('缓存命中率');
  });

  it('displays optimization settings', () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const settings = wrapper.find('.optimization-settings');
    expect(settings.exists()).toBe(true);
  });

  it('displays optimization level setting', () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const optimizationLevel = wrapper.find('.optimization-level');
    expect(optimizationLevel.exists()).toBe(true);
  });

  it('handles optimization level change', async () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const updateOptimizationSettingsSpy = vi.fn();
    wrapper.vm.updateOptimizationSettings = updateOptimizationSettingsSpy;

    const optimizationLevel = wrapper.find('.optimization-level');
    await optimizationLevel.setValue('high');

    expect(updateOptimizationSettingsSpy).toHaveBeenCalledWith({ optimizationLevel: 'high' });
  });

  it('displays caching setting', () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const cachingToggle = wrapper.find('.caching-toggle');
    expect(cachingToggle.exists()).toBe(true);
  });

  it('handles caching toggle change', async () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const updateOptimizationSettingsSpy = vi.fn();
    wrapper.vm.updateOptimizationSettings = updateOptimizationSettingsSpy;

    const cachingToggle = wrapper.find('.caching-toggle');
    await cachingToggle.setValue(false);

    expect(updateOptimizationSettingsSpy).toHaveBeenCalledWith({ enableCaching: false });
  });

  it('displays compression setting', () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const compressionToggle = wrapper.find('.compression-toggle');
    expect(compressionToggle.exists()).toBe(true);
  });

  it('handles compression toggle change', async () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const updateOptimizationSettingsSpy = vi.fn();
    wrapper.vm.updateOptimizationSettings = updateOptimizationSettingsSpy;

    const compressionToggle = wrapper.find('.compression-toggle');
    await compressionToggle.setValue(false);

    expect(updateOptimizationSettingsSpy).toHaveBeenCalledWith({ enableCompression: false });
  });

  it('displays lazy loading setting', () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const lazyLoadingToggle = wrapper.find('.lazy-loading-toggle');
    expect(lazyLoadingToggle.exists()).toBe(true);
  });

  it('handles lazy loading toggle change', async () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const updateOptimizationSettingsSpy = vi.fn();
    wrapper.vm.updateOptimizationSettings = updateOptimizationSettingsSpy;

    const lazyLoadingToggle = wrapper.find('.lazy-loading-toggle');
    await lazyLoadingToggle.setValue(false);

    expect(updateOptimizationSettingsSpy).toHaveBeenCalledWith({ enableLazyLoading: false });
  });

  it('displays max cache size setting', () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const maxCacheSize = wrapper.find('.max-cache-size');
    expect(maxCacheSize.exists()).toBe(true);
  });

  it('handles max cache size change', async () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const updateOptimizationSettingsSpy = vi.fn();
    wrapper.vm.updateOptimizationSettings = updateOptimizationSettingsSpy;

    const maxCacheSize = wrapper.find('.max-cache-size');
    await maxCacheSize.setValue(2000);

    expect(updateOptimizationSettingsSpy).toHaveBeenCalledWith({ maxCacheSize: 2000 });
  });

  it('displays timeout setting', () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const timeout = wrapper.find('.timeout-setting');
    expect(timeout.exists()).toBe(true);
  });

  it('handles timeout change', async () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const updateOptimizationSettingsSpy = vi.fn();
    wrapper.vm.updateOptimizationSettings = updateOptimizationSettingsSpy;

    const timeout = wrapper.find('.timeout-setting');
    await timeout.setValue(60000);

    expect(updateOptimizationSettingsSpy).toHaveBeenCalledWith({ timeout: 60000 });
  });

  it('displays clear cache button', () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const clearCacheButton = wrapper.find('.clear-cache-button');
    expect(clearCacheButton.exists()).toBe(true);
  });

  it('handles clear cache button click', async () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const clearCacheSpy = vi.fn();
    wrapper.vm.clearCache = clearCacheSpy;

    const clearCacheButton = wrapper.find('.clear-cache-button');
    await clearCacheButton.trigger('click');

    expect(clearCacheSpy).toHaveBeenCalled();
  });

  it('displays optimize conversation button', () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const optimizeButton = wrapper.find('.optimize-conversation-button');
    expect(optimizeButton.exists()).toBe(true);
  });

  it('handles optimize conversation button click', async () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const optimizeConversationSpy = vi.fn();
    wrapper.vm.optimizeConversation = optimizeConversationSpy;

    const optimizeButton = wrapper.find('.optimize-conversation-button');
    await optimizeButton.trigger('click');

    expect(optimizeConversationSpy).toHaveBeenCalled();
  });

  it('displays refresh metrics button', () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const refreshButton = wrapper.find('.refresh-metrics-button');
    expect(refreshButton.exists()).toBe(true);
  });

  it('handles refresh metrics button click', async () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const getPerformanceMetricsSpy = vi.fn();
    wrapper.vm.getPerformanceMetrics = getPerformanceMetricsSpy;

    const refreshButton = wrapper.find('.refresh-metrics-button');
    await refreshButton.trigger('click');

    expect(getPerformanceMetricsSpy).toHaveBeenCalled();
  });

  it('displays performance charts', () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const charts = wrapper.find('.performance-charts');
    expect(charts.exists()).toBe(true);
  });

  it('displays response time chart', () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const responseTimeChart = wrapper.find('.response-time-chart');
    expect(responseTimeChart.exists()).toBe(true);
  });

  it('displays memory usage chart', () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const memoryUsageChart = wrapper.find('.memory-usage-chart');
    expect(memoryUsageChart.exists()).toBe(true);
  });

  it('displays CPU usage chart', () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const cpuUsageChart = wrapper.find('.cpu-usage-chart');
    expect(cpuUsageChart.exists()).toBe(true);
  });

  it('displays cache hit rate chart', () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const cacheHitRateChart = wrapper.find('.cache-hit-rate-chart');
    expect(cacheHitRateChart.exists()).toBe(true);
  });

  it('handles chart tooltip display', async () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const chartPoint = wrapper.find('.chart-point');
    await chartPoint.trigger('mouseenter');

    expect(wrapper.find('.chart-tooltip').exists()).toBe(true);
  });

  it('handles chart tooltip hide', async () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const chartPoint = wrapper.find('.chart-point');
    await chartPoint.trigger('mouseenter');
    await chartPoint.trigger('mouseleave');

    expect(wrapper.find('.chart-tooltip').exists()).toBe(false);
  });

  it('displays optimization recommendations', () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const recommendations = wrapper.find('.optimization-recommendations');
    expect(recommendations.exists()).toBe(true);
  });

  it('displays optimization history', () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const history = wrapper.find('.optimization-history');
    expect(history.exists()).toBe(true);
  });

  it('handles optimization history item click', async () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const historyItem = wrapper.find('.history-item');
    await historyItem.trigger('click');

    expect(wrapper.vm.selectedHistoryItem).toBeDefined();
  });

  it('displays loading state when optimizing', async () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ isOptimizing: true });

    expect(wrapper.find('.loading-spinner').exists()).toBe(true);
  });

  it('disables controls when optimizing', async () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ isOptimizing: true });

    const toggle = wrapper.find('.optimization-toggle');
    expect(toggle.attributes('disabled')).toBe('');
  });

  it('displays error message when optimization fails', async () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ error: 'Optimization failed' });

    expect(wrapper.find('.error-message').exists()).toBe(true);
    expect(wrapper.find('.error-message').text()).toBe('Optimization failed');
  });

  it('handles error dismissal', async () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ error: 'Optimization failed' });

    const errorCloseButton = wrapper.find('.error-close-button');
    await errorCloseButton.trigger('click');

    expect(wrapper.vm.error).toBeNull();
  });

  it('displays success message when optimization succeeds', async () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ success: 'Optimization completed successfully' });

    expect(wrapper.find('.success-message').exists()).toBe(true);
    expect(wrapper.find('.success-message').text()).toBe('Optimization completed successfully');
  });

  it('handles success message dismissal', async () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ success: 'Optimization completed successfully' });

    const successCloseButton = wrapper.find('.success-close-button');
    await successCloseButton.trigger('click');

    expect(wrapper.vm.success).toBeNull();
  });

  it('displays optimization statistics', () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const statistics = wrapper.find('.optimization-statistics');
    expect(statistics.exists()).toBe(true);
  });

  it('displays optimization progress', async () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ optimizationProgress: 50 });

    const progressBar = wrapper.find('.optimization-progress');
    expect(progressBar.exists()).toBe(true);
  });

  it('handles optimization cancellation', async () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const cancelOptimizationSpy = vi.fn();
    wrapper.vm.cancelOptimization = cancelOptimizationSpy;

    const cancelButton = wrapper.find('.cancel-optimization-button');
    await cancelButton.trigger('click');

    expect(cancelOptimizationSpy).toHaveBeenCalled();
  });

  it('is a Vue instance', () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.vm).toBeTruthy();
    expect(wrapper.findComponent(OptimizedAssistant).exists()).toBe(true);
  });

  it('has correct component structure', () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.find('.optimized-assistant').exists()).toBe(true);
    expect(wrapper.find('.optimization-header').exists()).toBe(true);
    expect(wrapper.find('.optimization-content').exists()).toBe(true);
  });

  it('applies correct CSS classes', () => {
    const wrapper = mount(OptimizedAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.classes()).toContain('optimized-assistant');
  });
});