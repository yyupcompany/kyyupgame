import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ReportChart from '@/components/ai/ReportChart.vue';

// Mock echarts
const mockEcharts = {
  use: vi.fn(),
  init: vi.fn(() => ({
    setOption: vi.fn(),
    resize: vi.fn(),
    dispose: vi.fn()
  }))
};

vi.mock('echarts/core', () => mockEcharts);

// Mock echarts components
vi.mock('echarts/charts', () => ({
  BarChart: {},
  LineChart: {},
  PieChart: {}
}));

vi.mock('echarts/components', () => ({
  GridComponent: {},
  TooltipComponent: {},
  LegendComponent: {},
  TitleComponent: {},
  DatasetComponent: {}
}));

vi.mock('echarts/renderers', () => ({
  CanvasRenderer: {}
}));

// 控制台错误检测变量
let consoleSpy: any

describe('ReportChart', () => {
  let wrapper: any;
  let resizeObserver: any;

  const mockChartData = {
    xAxis: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    series: [
      {
        name: 'Sales',
        data: [100, 200, 150, 300, 250]
      },
      {
        name: 'Profit',
        data: [50, 100, 75, 150, 125]
      }
    ]
  };

  const createWrapper = (props = {}) => {
    return mount(ReportChart, {
      props: {
        data: mockChartData,
        type: 'bar',
        availableTypes: [
          { value: 'bar', label: '柱状图', icon: 'el-icon-data-analysis' },
          { value: 'line', label: '折线图', icon: 'el-icon-trend-charts' },
          { value: 'pie', label: '饼图', icon: 'el-icon-pie-chart' }
        ],
        allowChangeType: true,
        title: 'Sales Report',
        description: 'Monthly sales data',
        height: 400,
        showToolbar: true,
        showLegend: true,
        theme: '',
        colors: [],
        ...props
      }
    });
  };

  beforeEach(() => {
    // Mock ResizeObserver
    resizeObserver = {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    };
    
    global.ResizeObserver = vi.fn(() => resizeObserver);
    
    wrapper = createWrapper();
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    wrapper.unmount();
    vi.clearAllMocks();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('Component Rendering', () => {
    it('should render correctly with default props', () => {
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.ai-report-chart').exists()).toBe(true);
      expect(wrapper.find('.chart-container').exists()).toBe(true);
    });

    it('should render chart title section', () => {
      const titleSection = wrapper.find('.chart-title-section');
      expect(titleSection.exists()).toBe(true);
      
      const title = titleSection.find('.chart-title');
      expect(title.exists()).toBe(true);
      expect(title.text()).toBe('Sales Report');
      
      const description = titleSection.find('.chart-description');
      expect(description.exists()).toBe(true);
      expect(description.text()).toBe('Monthly sales data');
    });

    it('should render chart toolbar when showToolbar is true', () => {
      const toolbarSection = wrapper.find('.chart-toolbar-section');
      expect(toolbarSection.exists()).toBe(true);
      
      const typeSelector = toolbarSection.find('.chart-type-selector');
      expect(typeSelector.exists()).toBe(true);
    });

    it('should not render chart toolbar when showToolbar is false', async () => {
      await wrapper.setProps({ showToolbar: false });
      
      expect(wrapper.find('.chart-toolbar-section').exists()).toBe(false);
    });

    it('should render chart legend when showLegend is true', () => {
      const legend = wrapper.find('.chart-legend');
      expect(legend.exists()).toBe(true);
    });

    it('should not render chart legend when showLegend is false', async () => {
      await wrapper.setProps({ showLegend: false });
      
      expect(wrapper.find('.chart-legend').exists()).toBe(false);
    });

    it('should set correct chart height', () => {
      const chart = wrapper.find('.ai-report-chart');
      expect(chart.attributes('style')).toContain('height: 400px');
    });
  });

  describe('Chart Type Selector', () => {
    it('should render chart type buttons', () => {
      const typeButtons = wrapper.findAll('.chart-type-button');
      expect(typeButtons.length).toBe(3);
      
      expect(typeButtons[0].text()).toContain('柱状图');
      expect(typeButtons[1].text()).toContain('折线图');
      expect(typeButtons[2].text()).toContain('饼图');
    });

    it('should set active button based on current type', () => {
      const typeButtons = wrapper.findAll('.chart-type-button');
      expect(typeButtons[0].classes()).toContain('active');
      expect(typeButtons[1].classes()).not.toContain('active');
      expect(typeButtons[2].classes()).not.toContain('active');
    });

    it('should change chart type when button clicked', async () => {
      const typeButtons = wrapper.findAll('.chart-type-button');
      await typeButtons[1].trigger('click');
      
      expect(wrapper.vm.chartType).toBe('line');
      expect(wrapper.emitted('change-type')).toBeTruthy();
      expect(wrapper.emitted('change-type')[0]).toEqual(['line']);
    });

    it('should not render chart type selector when allowChangeType is false', async () => {
      await wrapper.setProps({ allowChangeType: false });
      
      expect(wrapper.find('.chart-type-selector').exists()).toBe(false);
    });
  });

  describe('Chart Initialization', () => {
    it('should initialize echarts instance on mount', () => {
      expect(mockEcharts.init).toHaveBeenCalledWith(
        wrapper.vm.chartContainer,
        ''
      );
    });

    it('should register echarts components', () => {
      expect(mockEcharts.use).toHaveBeenCalled();
    });

    it('should set up resize observer', () => {
      expect(resizeObserver.observe).toHaveBeenCalledWith(wrapper.vm.chartContainer);
    });

    it('should update chart when data changes', async () => {
      const newData = {
        xAxis: ['Jun', 'Jul', 'Aug'],
        series: [
          {
            name: 'New Sales',
            data: [400, 500, 600]
          }
        ]
      };
      
      await wrapper.setProps({ data: newData });
      
      const chartInstance = mockEcharts.init().result;
      expect(chartInstance.setOption).toHaveBeenCalled();
    });

    it('should handle chart resize', () => {
      const chartInstance = mockEcharts.init().result;
      
      // Simulate resize
      const resizeEvent = new Event('resize');
      window.dispatchEvent(resizeEvent);
      
      expect(chartInstance.resize).toHaveBeenCalled();
    });
  });

  describe('Chart Options', () => {
    let chartInstance: any;

    beforeEach(() => {
      chartInstance = mockEcharts.init().result;
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    describe('Bar Chart Options', () => {
      it('should generate correct bar chart options', () => {
        wrapper.vm.updateChartOption();
        
        const option = chartInstance.setOption.mock.calls[0][0];
        
        expect(option.tooltip).toBeDefined();
        expect(option.tooltip.trigger).toBe('axis');
        expect(option.xAxis).toBeDefined();
        expect(option.xAxis.type).toBe('category');
        expect(option.xAxis.data).toEqual(mockChartData.xAxis);
        expect(option.yAxis).toBeDefined();
        expect(option.yAxis.type).toBe('value');
        expect(option.series).toHaveLength(2);
        expect(option.series[0].type).toBe('bar');
        expect(option.series[0].name).toBe('Sales');
        expect(option.series[0].data).toEqual([100, 200, 150, 300, 250]);
      });
    });

    describe('Line Chart Options', () => {
      beforeEach(async () => {
        await wrapper.setProps({ type: 'line' });
      });

      it('should generate correct line chart options', () => {
        wrapper.vm.updateChartOption();
        
        const option = chartInstance.setOption.mock.calls[0][0];
        
        expect(option.tooltip).toBeDefined();
        expect(option.tooltip.trigger).toBe('axis');
        expect(option.xAxis).toBeDefined();
        expect(option.xAxis.boundaryGap).toBe(false);
        expect(option.series).toHaveLength(2);
        expect(option.series[0].type).toBe('line');
        expect(option.series[0].smooth).toBe(true);
      });
    });

    describe('Pie Chart Options', () => {
      beforeEach(async () => {
        await wrapper.setProps({ type: 'pie' });
      });

      it('should generate correct pie chart options', () => {
        wrapper.vm.updateChartOption();
        
        const option = chartInstance.setOption.mock.calls[0][0];
        
        expect(option.tooltip).toBeDefined();
        expect(option.tooltip.trigger).toBe('item');
        expect(option.series).toHaveLength(1);
        expect(option.series[0].type).toBe('pie');
        expect(option.series[0].radius).toBe('60%');
        expect(option.series[0].data).toHaveLength(5);
        expect(option.series[0].data[0]).toEqual({
          name: 'Jan',
          value: 100
        });
      });
    });
  });

  describe('Chart Series', () => {
    it('should compute chart series correctly', () => {
      expect(wrapper.vm.chartSeries).toEqual(mockChartData.series);
    });

    it('should handle empty series', async () => {
      await wrapper.setProps({
        data: { xAxis: [], series: [] }
      });
      
      expect(wrapper.vm.chartSeries).toEqual([]);
    });
  });

  describe('Color Management', () => {
    it('should use default colors when no custom colors provided', () => {
      const color = wrapper.vm.getSeriesColor(0);
      expect(color).toBe('#2463EB');
    });

    it('should use custom colors when provided', async () => {
      const customColors = ['#FF0000', '#00FF00', '#0000FF'];
      await wrapper.setProps({ colors: customColors });
      
      expect(wrapper.vm.getSeriesColor(0)).toBe('#FF0000');
      expect(wrapper.vm.getSeriesColor(1)).toBe('#00FF00');
      expect(wrapper.vm.getSeriesColor(2)).toBe('#0000FF');
    });

    it('should cycle through colors when index exceeds colors length', async () => {
      const customColors = ['#FF0000', '#00FF00'];
      await wrapper.setProps({ colors: customColors });
      
      expect(wrapper.vm.getSeriesColor(0)).toBe('#FF0000');
      expect(wrapper.vm.getSeriesColor(1)).toBe('#00FF00');
      expect(wrapper.vm.getSeriesColor(2)).toBe('#FF0000'); // Cycles back
    });
  });

  describe('Theme Changes', () => {
    it('should reinitialize chart when theme changes', async () => {
      const firstInstance = mockEcharts.init().result;
      
      await wrapper.setProps({ theme: 'dark' });
      
      expect(firstInstance.dispose).toHaveBeenCalled();
      expect(mockEcharts.init).toHaveBeenCalledTimes(2);
    });
  });

  describe('Legend Rendering', () => {
    it('should render legend items for each series', () => {
      const legendItems = wrapper.findAll('.legend-item');
      expect(legendItems.length).toBe(2);
      
      expect(legendItems[0].find('.legend-label').text()).toBe('Sales');
      expect(legendItems[1].find('.legend-label').text()).toBe('Profit');
    });

    it('should apply correct colors to legend items', () => {
      const legendColors = wrapper.findAll('.legend-color');
      expect(legendColors.length).toBe(2);
      
      expect(legendColors[0].attributes('style')).toContain('background-color: #2463EB');
      expect(legendColors[1].attributes('style')).toContain('background-color: #10B981');
    });
  });

  describe('Chart Type Changes', () => {
    it('should update chart when type prop changes', async () => {
      await wrapper.setProps({ type: 'line' });
      
      expect(wrapper.vm.chartType).toBe('line');
      
      const chartInstance = mockEcharts.init().result;
      expect(chartInstance.setOption).toHaveBeenCalled();
    });
  });

  describe('Component Lifecycle', () => {
    it('should dispose chart instance on unmount', () => {
      const chartInstance = mockEcharts.init().result;
      
      wrapper.unmount();
      
      expect(chartInstance.dispose).toHaveBeenCalled();
    });

    it('should remove resize observer on unmount', () => {
      wrapper.unmount();
      
      expect(resizeObserver.disconnect).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid chart type', async () => {
      await wrapper.setProps({ type: 'invalid' as any });
      
      expect(wrapper.vm.chartType).toBe('invalid');
      // Should not throw error
      wrapper.vm.updateChartOption();
    });

    it('should handle missing data', async () => {
      await wrapper.setProps({ data: {} as any });
      
      expect(wrapper.vm.chartSeries).toEqual([]);
      // Should not throw error
      wrapper.vm.updateChartOption();
    });

    it('should handle missing xAxis in data', async () => {
      const dataWithoutXAxis = {
        series: [
          {
            name: 'Sales',
            data: [100, 200, 150]
          }
        ]
      };
      
      await wrapper.setProps({ data: dataWithoutXAxis });
      
      wrapper.vm.updateChartOption();
      // Should not throw error
    });

    it('should handle missing series in data', async () => {
      const dataWithoutSeries = {
        xAxis: ['Jan', 'Feb', 'Mar']
      };
      
      await wrapper.setProps({ data: dataWithoutSeries });
      
      expect(wrapper.vm.chartSeries).toEqual([]);
      wrapper.vm.updateChartOption();
    });

    it('should handle empty availableTypes array', async () => {
      await wrapper.setProps({ availableTypes: [] });
      
      const typeButtons = wrapper.findAll('.chart-type-button');
      expect(typeButtons.length).toBe(0);
    });

    it('should handle null chart container ref', () => {
      wrapper.vm.chartContainer = null;
      
      wrapper.vm.initChart();
      // Should not throw error
    });
  });

  describe('Performance', () => {
    it('should debounce resize events', async () => {
      const chartInstance = mockEcharts.init().result;
      
      // Simulate multiple resize events
      for (let i = 0; i < 5; i++) {
        const resizeEvent = new Event('resize');
        window.dispatchEvent(resizeEvent);
      }
      
      await nextTick();
      
      // Should only call resize once due to debouncing
      expect(chartInstance.resize).toHaveBeenCalledTimes(1);
    });
  });
});