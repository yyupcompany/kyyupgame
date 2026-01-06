import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import MemoryVisualization from '@/components/ai/memory/MemoryVisualization.vue';

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElRow: {
    name: 'ElRow',
    template: '<div class="el-row"><slot /></div>',
    props: ['gutter']
  },
  ElCol: {
    name: 'ElCol',
    template: '<div class="el-col"><slot /></div>',
    props: ['xs', 'sm', 'md', 'span']
  },
  ElCard: {
    name: 'ElCard',
    template: `
      <div class="el-card">
        <div class="el-card__header" v-if="$slots.header">
          <slot name="header" />
        </div>
        <div class="el-card__body">
          <slot />
        </div>
      </div>
    `
  },
  ElIcon: {
    name: 'ElIcon',
    template: '<div class="el-icon"><component :is="$attrs.component" /></div>',
  },
  ElRadioGroup: {
    name: 'ElRadioGroup',
    template: '<div class="el-radio-group"><slot /></div>',
    props: ['modelValue', 'size'],
    emits: ['update:modelValue']
  },
  ElRadioButton: {
    name: 'ElRadioButton',
    template: `
      <label class="el-radio-button">
        <input 
          type="radio" 
          :value="value" 
          :checked="modelValue === value"
          @change="$emit('update:modelValue', value)"
        />
        <span class="el-radio-button__inner"><slot /></span>
      </label>
    `,
    props: ['value', 'modelValue'],
    emits: ['update:modelValue']
  }
}));

// Mock Element Plus icons
vi.mock('@element-plus/icons-vue', () => ({
  DataLine: { name: 'DataLine' },
  Star: { name: 'Star' },
  Calendar: { name: 'Calendar' },
  TrendCharts: { name: 'TrendCharts' }
}));

// Mock echarts
const mockECharts = {
  use: vi.fn(),
  init: vi.fn(() => ({
    setOption: vi.fn(),
    dispose: vi.fn(),
    resize: vi.fn()
  }))
};

const mockEChartsComponents = {
  TitleComponent: {},
  TooltipComponent: {},
  LegendComponent: {},
  GridComponent: {},
  PieChart: {},
  BarChart: {},
  LineChart: {},
  CanvasRenderer: {}
};

vi.mock('echarts/core', () => mockECharts);
vi.mock('echarts/charts', () => mockEChartsComponents);
vi.mock('echarts/components', () => mockEChartsComponents);
vi.mock('echarts/renderers', () => ({ CanvasRenderer: {} }));

// Mock request utility
const mockRequest = {
  get: vi.fn()
};
vi.mock('@/utils/request', () => ({
  default: mockRequest
}));

// Mock API endpoints
vi.mock('@/api/endpoints', () => ({
  AI_MEMORY_ENDPOINTS: {
    STATS: (userId: number) => `/api/ai/memory/${userId}/stats`
  }
}));

// Mock DOM APIs
const mockGetElementById = vi.fn();
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

global.document = {
  getElementById: mockGetElementById
} as any;

global.window = {
  addEventListener: mockAddEventListener,
  removeEventListener: mockRemoveEventListener
} as any;

// 控制台错误检测变量
let consoleSpy: any

describe('MemoryVisualization.vue', () => {
  let wrapper: any;
  
  const mockProps = {
    userId: 1
  };

  const mockStatsData = {
    totalCount: 150,
    averageImportance: 0.75,
    typeDistribution: {
      immediate: 30,
      shortTerm: 80,
      longTerm: 40
    },
    importanceDistribution: {
      low: 20,
      medium: 90,
      high: 40
    },
    createdToday: 5,
    createdThisWeek: 25,
    createdThisMonth: 80,
    trendData: []
  };

  const createWrapper = (props = {}) => {
    return mount(MemoryVisualization, {
      props: {
        ...mockProps,
        ...props
      },
      global: {
        stubs: {
          'el-row': true,
          'el-col': true,
          'el-card': true,
          'el-icon': true,
          'el-radio-group': true,
          'el-radio-button': true
        }
      }
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock DOM elements
    mockGetElementById.mockReturnValue({
      clientWidth: 400,
      clientHeight: 300
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock API response
    mockRequest.get.mockResolvedValue({
      data: mockStatsData
    });
  });

  afterEach(() => {
    if (wrapper) => {
      wrapper.unmount();
    }
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('Component Initialization', () => {
    it('renders properly with required props', () => {
      wrapper = createWrapper();
      expect(wrapper.find('.memory-visualization').exists()).toBe(true);
    });

    it('registers echarts components on mount', () => {
      wrapper = createWrapper();
      expect(mockECharts.use).toHaveBeenCalledWith([
        mockEChartsComponents.TitleComponent,
        mockEChartsComponents.TooltipComponent,
        mockEChartsComponents.LegendComponent,
        mockEChartsComponents.GridComponent,
        mockEChartsComponents.PieChart,
        mockEChartsComponents.BarChart,
        mockEChartsComponents.LineChart,
        mockEChartsComponents.CanvasRenderer
      ]);
    });

    it('initializes with default time range', async () => {
      wrapper = createWrapper();
      await nextTick();
      expect(wrapper.vm.timeRange).toBe('week');
    });

    it('initializes with empty stats', () => {
      wrapper = createWrapper();
      expect(wrapper.vm.stats).toEqual({
        totalCount: 0,
        averageImportance: 0,
        typeDistribution: {
          immediate: 0,
          shortTerm: 0,
          longTerm: 0
        },
        importanceDistribution: {
          low: 0,
          medium: 0,
          high: 0
        },
        createdToday: 0,
        createdThisWeek: 0,
        createdThisMonth: 0,
        trendData: []
      });
    });

    it('fetches stats data on mount', async () => {
      wrapper = createWrapper();
      await nextTick();
      
      expect(mockRequest.get).toHaveBeenCalledWith('/api/ai/memory/1/stats');
    });
  });

  describe('Statistics Cards', () => {
    beforeEach(async () => {
      wrapper = createWrapper();
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('displays correct total memories count', () => {
      const statValues = wrapper.findAll('.stat-value');
      expect(statValues[0].text()).toBe('150');
    });

    it('displays formatted average importance', () => {
      const statValues = wrapper.findAll('.stat-value');
      expect(statValues[1].text()).toBe('75%');
    });

    it('displays today\'s created count', () => {
      const statValues = wrapper.findAll('.stat-value');
      expect(statValues[2].text()).toBe('5');
    });

    it('displays this week\'s created count', () => {
      const statValues = wrapper.findAll('.stat-value');
      expect(statValues[3].text()).toBe('25');
    });

    it('displays correct stat titles', () => {
      const statTitles = wrapper.findAll('.stat-title');
      expect(statTitles[0].text()).toBe('总记忆数');
      expect(statTitles[1].text()).toBe('平均重要性');
      expect(statTitles[2].text()).toBe('今日新增');
      expect(statTitles[3].text()).toBe('本周新增');
    });

    it('displays stat icons', () => {
      const statIcons = wrapper.findAll('.stat-icon .el-icon');
      expect(statIcons.length).toBe(4);
    });

    it('handles missing stats gracefully', async () => {
      mockRequest.get.mockResolvedValueOnce({
        data: {}
      });
      
      const wrapper = createWrapper();
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const statValues = wrapper.findAll('.stat-value');
      expect(statValues[0].text()).toBe('0');
      expect(statValues[1].text()).toBe('0%');
    });
  });

  describe('Chart Initialization', () => {
    beforeEach(async () => {
      wrapper = createWrapper();
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('initializes type distribution chart', () => {
      expect(mockGetElementById).toHaveBeenCalledWith('memory-type-chart');
      expect(mockECharts.init).toHaveBeenCalledTimes(3); // type, importance, trend charts
    });

    it('initializes importance distribution chart', () => {
      expect(mockGetElementById).toHaveBeenCalledWith('memory-importance-chart');
    });

    it('initializes trend chart', () => {
      expect(mockGetElementById).toHaveBeenCalledWith('memory-trend-chart');
    });

    it('sets correct options for type distribution chart', () => {
      const setOptionCalls = mockECharts.init().setOption.mock.calls;
      const typeChartOption = setOptionCalls[0][0];
      
      expect(typeChartOption).toMatchObject({
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: ['即时记忆', '短期记忆', '长期记忆']
        },
        series: [
          {
            name: '记忆类型',
            type: 'pie',
            radius: '70%',
            center: ['50%', '50%'],
            data: [
              { value: 30, name: '即时记忆' },
              { value: 80, name: '短期记忆' },
              { value: 40, name: '长期记忆' }
            ]
          }
        ]
      });
    });

    it('sets correct options for importance distribution chart', () => {
      const setOptionCalls = mockECharts.init().setOption.mock.calls;
      const importanceChartOption = setOptionCalls[1][0];
      
      expect(importanceChartOption).toMatchObject({
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: ['低重要性', '中重要性', '高重要性']
        },
        series: [
          {
            name: '重要性分布',
            type: 'pie',
            radius: '70%',
            center: ['50%', '50%'],
            data: [
              { value: 20, name: '低重要性', itemStyle: { color: '#91cc75' } },
              { value: 90, name: '中重要性', itemStyle: { color: '#fac858' } },
              { value: 40, name: '高重要性', itemStyle: { color: '#ee6666' } }
            ]
          }
        ]
      });
    });

    it('sets correct options for trend chart', () => {
      const setOptionCalls = mockECharts.init().setOption.mock.calls;
      const trendChartOption = setOptionCalls[2][0];
      
      expect(trendChartOption).toMatchObject({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '记忆数量',
            type: 'bar',
            itemStyle: {
              color: '#409EFF'
            }
          }
        ]
      });
    });
  });

  describe('Time Range Selection', () => {
    beforeEach(async () => {
      wrapper = createWrapper();
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('changes time range when radio button is clicked', async () => {
      const radioGroup = wrapper.findComponent({ name: 'ElRadioGroup' });
      await radioGroup.setValue('month');
      
      expect(wrapper.vm.timeRange).toBe('month');
    });

    it('updates trend chart when time range changes to month', async () => {
      const radioGroup = wrapper.findComponent({ name: 'ElRadioGroup' });
      await radioGroup.setValue('month');
      
      // Should reinitialize trend chart with month data
      expect(mockECharts.init().setOption).toHaveBeenCalledTimes(4); // Initial 3 + 1 for update
    });

    it('updates trend chart when time range changes to year', async () => {
      const radioGroup = wrapper.findComponent({ name: 'ElRadioGroup' });
      await radioGroup.setValue('year');
      
      expect(wrapper.vm.timeRange).toBe('year');
      expect(mockECharts.init().setOption).toHaveBeenCalledTimes(4);
    });

    it('updates trend chart when time range changes back to week', async () => {
      const radioGroup = wrapper.findComponent({ name: 'ElRadioGroup' });
      await radioGroup.setValue('month');
      await radioGroup.setValue('week');
      
      expect(wrapper.vm.timeRange).toBe('week');
      expect(mockECharts.init().setOption).toHaveBeenCalledTimes(5);
    });
  });

  describe('Chart Data Handling', () => {
    beforeEach(async () => {
      wrapper = createWrapper();
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('handles missing chart containers gracefully', async () => {
      mockGetElementById.mockReturnValueOnce(null);
      
      await wrapper.vm.initTypeChart();
      
      expect(mockECharts.init).not.toHaveBeenCalledTimes(4); // Should not create new instance
    });

    it('handles zero-width containers with retry', async () => {
      mockGetElementById.mockReturnValueOnce({
        clientWidth: 0,
        clientHeight: 0
      });
      
      vi.useFakeTimers();
      await wrapper.vm.initTypeChart();
      
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 100);
      vi.useRealTimers();
    });

    it('handles missing distribution data gracefully', async () => {
      wrapper.vm.stats.typeDistribution = null;
      
      await wrapper.vm.initTypeChart();
      
      // Should not create chart without data
      expect(mockECharts.init).toHaveBeenCalledTimes(3); // Only initial calls
    });
  });

  describe('Data Fetching', () => {
    it('handles API errors gracefully', async () => {
      mockRequest.get.mockRejectedValueOnce(new Error('API Error'));
      
      wrapper = createWrapper();
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Should not throw error, just log it
      expect(wrapper.vm.stats.totalCount).toBe(0);
    });

    it('handles different API response structures', async () => {
      mockRequest.get.mockResolvedValueOnce({
        totalCount: 200,
        averageImportance: 0.8
      });
      
      wrapper = createWrapper();
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(wrapper.vm.stats.totalCount).toBe(200);
      expect(wrapper.vm.stats.averageImportance).toBe(0.8);
    });

    it('updates charts when new data is fetched', async () => {
      const newStats = {
        ...mockStatsData,
        totalCount: 300,
        typeDistribution: {
          immediate: 50,
          shortTerm: 150,
          longTerm: 100
        }
      };
      
      mockRequest.get.mockResolvedValueOnce({ data: newStats });
      
      await wrapper.vm.fetchStats();
      await nextTick();
      
      expect(wrapper.vm.stats.totalCount).toBe(300);
      expect(mockECharts.init().setOption).toHaveBeenCalledTimes(6); // Initial 3 + 3 updates
    });
  });

  describe('Window Resize Handling', () => {
    beforeEach(async () => {
      wrapper = createWrapper();
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('adds resize event listener on mount', () => {
      expect(mockAddEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    it('removes resize event listener on unmount', () => {
      wrapper.unmount();
      expect(mockRemoveEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    it('resizes all charts when window is resized', () => {
      const resizeHandler = mockAddEventListener.mock.calls[0][1];
      resizeHandler();
      
      expect(mockECharts.init().resize).toHaveBeenCalledTimes(3); // All three charts
    });
  });

  describe('Chart Cleanup', () => {
    beforeEach(async () => {
      wrapper = createWrapper();
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('disposes charts when component unmounts', () => {
      wrapper.unmount();
      expect(mockECharts.init().dispose).toHaveBeenCalledTimes(3); // All three charts
    });

    it('disposes charts when reinitializing', async () => {
      await wrapper.vm.initTypeChart();
      
      expect(mockECharts.init().dispose).toHaveBeenCalledTimes(1); // Type chart disposed
    });
  });

  describe('Percentage Formatting', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    it('formats percentage correctly', () => {
      expect(wrapper.vm.formatPercent(0.75)).toBe('75%');
      expect(wrapper.vm.formatPercent(0.5)).toBe('50%');
      expect(wrapper.vm.formatPercent(0)).toBe('0%');
      expect(wrapper.vm.formatPercent(1)).toBe('100%');
    });

    it('handles null/undefined values', () => {
      expect(wrapper.vm.formatPercent(null)).toBe('0%');
      expect(wrapper.vm.formatPercent(undefined)).toBe('0%');
    });

    it('rounds percentage correctly', () => {
      expect(wrapper.vm.formatPercent(0.756)).toBe('76%');
      expect(wrapper.vm.formatPercent(0.123)).toBe('12%');
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('has correct responsive column classes', () => {
      const statCols = wrapper.findAll('.stat-card').map(card => card.closest('.el-col'));
      
      statCols.forEach(col => {
        expect(col.props('xs')).toBe(24);
        expect(col.props('sm')).toBe(12);
        expect(col.props('md')).toBe(6);
      });
    });

    it('has correct chart column classes', () => {
      const chartCols = wrapper.findAll('.chart-card').map(card => card.closest('.el-col'));
      
      // Type and importance charts should be 12 on medium screens
      expect(chartCols[0].props('md')).toBe(12);
      expect(chartCols[1].props('md')).toBe(12);
      
      // Trend chart should be full width
      expect(chartCols[2].props('span')).toBe(24);
    });
  });

  describe('Props Validation', () => {
    it('accepts userId prop correctly', () => {
      wrapper = createWrapper({ userId: 123 });
      expect(wrapper.props().userId).toBe(123);
    });

    it('requires userId prop', () => {
      expect(() => {
        createWrapper({ userId: undefined });
      }).toThrow();
    });

    it('works with different userId values', () => {
      const testCases = [1, 999, 1000];
      
      testCases.forEach(userId => {
        const wrapper = createWrapper({ userId });
        expect(wrapper.props().userId).toBe(userId);
        wrapper.unmount();
      });
    });
  });

  describe('Chart Headers', () => {
    beforeEach(async () => {
      wrapper = createWrapper();
      await nextTick();
    });

    it('displays correct chart headers', () => {
      const chartHeaders = wrapper.findAll('.chart-header span');
      
      expect(chartHeaders[0].text()).toBe('记忆类型分布');
      expect(chartHeaders[1].text()).toBe('记忆重要性分布');
      expect(chartHeaders[2].text()).toBe('记忆增长趋势');
    });

    it('has time range selector in trend chart', () => {
      const trendChartCard = wrapper.findAll('.chart-card')[2];
      const radioGroup = trendChartCard.findComponent({ name: 'ElRadioGroup' });
      expect(radioGroup.exists()).toBe(true);
    });

    it('has correct radio button options', () => {
      const radioButtons = wrapper.findAllComponents({ name: 'ElRadioButton' });
      
      expect(radioButtons.length).toBe(3);
      expect(radioButtons[0].text()).toBe('本周');
      expect(radioButtons[1].text()).toBe('本月');
      expect(radioButtons[2].text()).toBe('本年');
    });
  });
});