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
import PerformanceMonitor from '@/components/ai/PerformanceMonitor.vue';

// Mock the ai store
vi.mock('@/stores/ai', () => ({
  useAiStore: () => ({
    performanceData: {
      responseTime: 150,
      memoryUsage: 65,
      cpuUsage: 30,
      cacheHitRate: 85,
      errorRate: 2,
      throughput: 100,
      latency: 50,
      availability: 99.5
    },
    historicalData: [
      { timestamp: new Date().toISOString(), responseTime: 140, memoryUsage: 60 },
      { timestamp: new Date().toISOString(), responseTime: 160, memoryUsage: 70 }
    ],
    alerts: [
      { id: 1, type: 'warning', message: 'High memory usage', timestamp: new Date().toISOString() },
      { id: 2, type: 'error', message: 'Service unavailable', timestamp: new Date().toISOString() }
    ],
    thresholds: {
      responseTime: 200,
      memoryUsage: 80,
      cpuUsage: 70,
      errorRate: 5
    },
    isMonitoring: true,
    monitoringInterval: 5000,
    startMonitoring: vi.fn(),
    stopMonitoring: vi.fn(),
    updateThresholds: vi.fn(),
    getPerformanceData: vi.fn(),
    clearAlerts: vi.fn(),
    exportPerformanceData: vi.fn()
  })
}));

describe('PerformanceMonitor.vue', () => {
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
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.find('.performance-monitor').exists()).toBe(true);
    expect(wrapper.find('.monitor-header').exists()).toBe(true);
    expect(wrapper.find('.monitor-content').exists()).toBe(true);
  });

  it('displays header with title', () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const header = wrapper.find('.monitor-header');
    expect(header.exists()).toBe(true);
    expect(header.text()).toContain('性能监控');
  });

  it('displays monitoring toggle', () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const toggle = wrapper.find('.monitoring-toggle');
    expect(toggle.exists()).toBe(true);
  });

  it('handles monitoring start', async () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const startMonitoringSpy = vi.fn();
    wrapper.vm.startMonitoring = startMonitoringSpy;

    const toggle = wrapper.find('.monitoring-toggle');
    await toggle.setValue(true);

    expect(startMonitoringSpy).toHaveBeenCalled();
  });

  it('handles monitoring stop', async () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const stopMonitoringSpy = vi.fn();
    wrapper.vm.stopMonitoring = stopMonitoringSpy;

    const toggle = wrapper.find('.monitoring-toggle');
    await toggle.setValue(false);

    expect(stopMonitoringSpy).toHaveBeenCalled();
  });

  it('displays real-time metrics', () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const metrics = wrapper.find('.real-time-metrics');
    expect(metrics.exists()).toBe(true);
  });

  it('displays response time metric', () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const responseTime = wrapper.find('.response-time-metric');
    expect(responseTime.exists()).toBe(true);
    expect(responseTime.text()).toContain('150ms');
  });

  it('displays memory usage metric', () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const memoryUsage = wrapper.find('.memory-usage-metric');
    expect(memoryUsage.exists()).toBe(true);
    expect(memoryUsage.text()).toContain('65%');
  });

  it('displays CPU usage metric', () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const cpuUsage = wrapper.find('.cpu-usage-metric');
    expect(cpuUsage.exists()).toBe(true);
    expect(cpuUsage.text()).toContain('30%');
  });

  it('displays cache hit rate metric', () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const cacheHitRate = wrapper.find('.cache-hit-rate-metric');
    expect(cacheHitRate.exists()).toBe(true);
    expect(cacheHitRate.text()).toContain('85%');
  });

  it('displays error rate metric', () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const errorRate = wrapper.find('.error-rate-metric');
    expect(errorRate.exists()).toBe(true);
    expect(errorRate.text()).toContain('2%');
  });

  it('displays throughput metric', () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const throughput = wrapper.find('.throughput-metric');
    expect(throughput.exists()).toBe(true);
    expect(throughput.text()).toContain('100');
  });

  it('displays latency metric', () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const latency = wrapper.find('.latency-metric');
    expect(latency.exists()).toBe(true);
    expect(latency.text()).toContain('50ms');
  });

  it('displays availability metric', () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const availability = wrapper.find('.availability-metric');
    expect(availability.exists()).toBe(true);
    expect(availability.text()).toContain('99.5%');
  });

  it('displays performance charts', () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const charts = wrapper.find('.performance-charts');
    expect(charts.exists()).toBe(true);
  });

  it('displays response time chart', () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const responseTimeChart = wrapper.find('.response-time-chart');
    expect(responseTimeChart.exists()).toBe(true);
  });

  it('displays memory usage chart', () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const memoryUsageChart = wrapper.find('.memory-usage-chart');
    expect(memoryUsageChart.exists()).toBe(true);
  });

  it('displays CPU usage chart', () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const cpuUsageChart = wrapper.find('.cpu-usage-chart');
    expect(cpuUsageChart.exists()).toBe(true);
  });

  it('displays error rate chart', () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const errorRateChart = wrapper.find('.error-rate-chart');
    expect(errorRateChart.exists()).toBe(true);
  });

  it('displays alerts section', () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const alerts = wrapper.find('.alerts-section');
    expect(alerts.exists()).toBe(true);
  });

  it('displays alert items', () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const alertItems = wrapper.findAll('.alert-item');
    expect(alertItems.length).toBe(2);
  });

  it('displays warning alert', () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const warningAlert = wrapper.find('.alert-warning');
    expect(warningAlert.exists()).toBe(true);
    expect(warningAlert.text()).toContain('High memory usage');
  });

  it('displays error alert', () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const errorAlert = wrapper.find('.alert-error');
    expect(errorAlert.exists()).toBe(true);
    expect(errorAlert.text()).toContain('Service unavailable');
  });

  it('handles alert dismissal', async () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const dismissButton = wrapper.find('.dismiss-alert-button');
    await dismissButton.trigger('click');

    expect(wrapper.vm.alerts.length).toBe(1);
  });

  it('displays thresholds configuration', () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const thresholds = wrapper.find('.thresholds-configuration');
    expect(thresholds.exists()).toBe(true);
  });

  it('displays response time threshold', () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const responseTimeThreshold = wrapper.find('.response-time-threshold');
    expect(responseTimeThreshold.exists()).toBe(true);
  });

  it('handles response time threshold change', async () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const updateThresholdsSpy = vi.fn();
    wrapper.vm.updateThresholds = updateThresholdsSpy;

    const responseTimeThreshold = wrapper.find('.response-time-threshold');
    await responseTimeThreshold.setValue(300);

    expect(updateThresholdsSpy).toHaveBeenCalledWith({ responseTime: 300 });
  });

  it('displays memory usage threshold', () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const memoryUsageThreshold = wrapper.find('.memory-usage-threshold');
    expect(memoryUsageThreshold.exists()).toBe(true);
  });

  it('handles memory usage threshold change', async () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const updateThresholdsSpy = vi.fn();
    wrapper.vm.updateThresholds = updateThresholdsSpy;

    const memoryUsageThreshold = wrapper.find('.memory-usage-threshold');
    await memoryUsageThreshold.setValue(90);

    expect(updateThresholdsSpy).toHaveBeenCalledWith({ memoryUsage: 90 });
  });

  it('displays CPU usage threshold', () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const cpuUsageThreshold = wrapper.find('.cpu-usage-threshold');
    expect(cpuUsageThreshold.exists()).toBe(true);
  });

  it('handles CPU usage threshold change', async () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const updateThresholdsSpy = vi.fn();
    wrapper.vm.updateThresholds = updateThresholdsSpy;

    const cpuUsageThreshold = wrapper.find('.cpu-usage-threshold');
    await cpuUsageThreshold.setValue(80);

    expect(updateThresholdsSpy).toHaveBeenCalledWith({ cpuUsage: 80 });
  });

  it('displays error rate threshold', () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const errorRateThreshold = wrapper.find('.error-rate-threshold');
    expect(errorRateThreshold.exists()).toBe(true);
  });

  it('handles error rate threshold change', async () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const updateThresholdsSpy = vi.fn();
    wrapper.vm.updateThresholds = updateThresholdsSpy;

    const errorRateThreshold = wrapper.find('.error-rate-threshold');
    await errorRateThreshold.setValue(10);

    expect(updateThresholdsSpy).toHaveBeenCalledWith({ errorRate: 10 });
  });

  it('displays monitoring interval setting', () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const intervalSetting = wrapper.find('.monitoring-interval');
    expect(intervalSetting.exists()).toBe(true);
  });

  it('handles monitoring interval change', async () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const intervalSetting = wrapper.find('.monitoring-interval');
    await intervalSetting.setValue(10000);

    expect(wrapper.vm.monitoringInterval).toBe(10000);
  });

  it('displays refresh button', () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const refreshButton = wrapper.find('.refresh-button');
    expect(refreshButton.exists()).toBe(true);
  });

  it('handles refresh button click', async () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const getPerformanceDataSpy = vi.fn();
    wrapper.vm.getPerformanceData = getPerformanceDataSpy;

    const refreshButton = wrapper.find('.refresh-button');
    await refreshButton.trigger('click');

    expect(getPerformanceDataSpy).toHaveBeenCalled();
  });

  it('displays clear alerts button', () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const clearAlertsButton = wrapper.find('.clear-alerts-button');
    expect(clearAlertsButton.exists()).toBe(true);
  });

  it('handles clear alerts button click', async () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const clearAlertsSpy = vi.fn();
    wrapper.vm.clearAlerts = clearAlertsSpy;

    const clearAlertsButton = wrapper.find('.clear-alerts-button');
    await clearAlertsButton.trigger('click');

    expect(clearAlertsSpy).toHaveBeenCalled();
  });

  it('displays export button', () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const exportButton = wrapper.find('.export-button');
    expect(exportButton.exists()).toBe(true);
  });

  it('handles export button click', async () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const exportPerformanceDataSpy = vi.fn();
    wrapper.vm.exportPerformanceData = exportPerformanceDataSpy;

    const exportButton = wrapper.find('.export-button');
    await exportButton.trigger('click');

    expect(exportPerformanceDataSpy).toHaveBeenCalled();
  });

  it('displays chart time range selector', () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const timeRangeSelector = wrapper.find('.time-range-selector');
    expect(timeRangeSelector.exists()).toBe(true);
  });

  it('handles time range change', async () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const timeRangeSelector = wrapper.find('.time-range-selector');
    await timeRangeSelector.setValue('1h');

    expect(wrapper.vm.selectedTimeRange).toBe('1h');
  });

  it('displays metric status indicators', () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const statusIndicators = wrapper.find('.status-indicators');
    expect(statusIndicators.exists()).toBe(true);
  });

  it('displays healthy status for normal metrics', () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const statusIndicator = wrapper.find('.status-healthy');
    expect(statusIndicator.exists()).toBe(true);
  });

  it('displays warning status for metrics near threshold', async () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({
      performanceData: {
        ...wrapper.vm.performanceData,
        memoryUsage: 75
      }
    });

    const statusIndicator = wrapper.find('.status-warning');
    expect(statusIndicator.exists()).toBe(true);
  });

  it('displays critical status for metrics exceeding threshold', async () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({
      performanceData: {
        ...wrapper.vm.performanceData,
        memoryUsage: 85
      }
    });

    const statusIndicator = wrapper.find('.status-critical');
    expect(statusIndicator.exists()).toBe(true);
  });

  it('handles real-time data updates', async () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({
      performanceData: {
        ...wrapper.vm.performanceData,
        responseTime: 200
      }
    });

    const responseTimeMetric = wrapper.find('.response-time-metric');
    expect(responseTimeMetric.text()).toContain('200ms');
  });

  it('displays loading state when fetching data', async () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ isLoading: true });

    expect(wrapper.find('.loading-spinner').exists()).toBe(true);
  });

  it('displays error message when data fetch fails', async () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ error: 'Failed to fetch performance data' });

    expect(wrapper.find('.error-message').exists()).toBe(true);
    expect(wrapper.find('.error-message').text()).toBe('Failed to fetch performance data');
  });

  it('handles error dismissal', async () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ error: 'Failed to fetch performance data' });

    const errorCloseButton = wrapper.find('.error-close-button');
    await errorCloseButton.trigger('click');

    expect(wrapper.vm.error).toBeNull();
  });

  it('displays performance summary', () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const summary = wrapper.find('.performance-summary');
    expect(summary.exists()).toBe(true);
  });

  it('displays uptime information', () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const uptime = wrapper.find('.uptime-info');
    expect(uptime.exists()).toBe(true);
  });

  it('handles chart zoom functionality', async () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const chart = wrapper.find('.performance-chart');
    await chart.trigger('wheel', { deltaY: -100 });

    expect(wrapper.vm.chartZoom).toBeDefined();
  });

  it('handles chart pan functionality', async () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    const chart = wrapper.find('.performance-chart');
    await chart.trigger('mousedown');
    await chart.trigger('mousemove', { clientX: 100, clientY: 100 });
    await chart.trigger('mouseup');

    expect(wrapper.vm.chartPan).toBeDefined();
  });

  it('is a Vue instance', () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.vm).toBeTruthy();
    expect(wrapper.findComponent(PerformanceMonitor).exists()).toBe(true);
  });

  it('has correct component structure', () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.find('.performance-monitor').exists()).toBe(true);
    expect(wrapper.find('.monitor-header').exists()).toBe(true);
    expect(wrapper.find('.monitor-content').exists()).toBe(true);
  });

  it('applies correct CSS classes', () => {
    const wrapper = mount(PerformanceMonitor, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.classes()).toContain('performance-monitor');
  });
});