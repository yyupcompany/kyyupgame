import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import MemoryStatistics from '@/components/ai/memory/MemoryStatistics.vue';

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
    props: ['span']
  },
  ElIcon: {
    name: 'ElIcon',
    template: '<div class="el-icon"><component :is="$attrs.component" /></div>',
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
  ElButton: {
    name: 'ElButton',
    template: `
      <button 
        class="el-button" 
        :class="[type ? 'el-button--' + type : '', link ? 'el-button--link' : '']"
        :disabled="loading"
        @click="$emit('click', $event)"
      >
        <slot />
      </button>
    `,
    props: ['type', 'link', 'loading'],
    emits: ['click']
  },
  ElMessage: {
    success: vi.fn()
  }
}));

// Mock Element Plus icons
vi.mock('@element-plus/icons-vue', () => ({
  Document: { name: 'Document' },
  Clock: { name: 'Clock' },
  FolderOpened: { name: 'FolderOpened' },
  Cpu: { name: 'Cpu' },
  Refresh: { name: 'Refresh' },
  Download: { name: 'Download' }
}));

// Mock echarts
const mockECharts = {
  init: vi.fn(() => ({
    setOption: vi.fn(),
    dispose: vi.fn()
  }))
};
vi.mock('echarts', () => mockECharts);

// Mock DOM APIs for file download
const mockCreateElement = vi.fn();
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();

global.document = {
  createElement: mockCreateElement
} as any;

global.URL = {
  createObjectURL: mockCreateObjectURL,
  revokeObjectURL: mockRevokeObjectURL
} as any;

// 控制台错误检测变量
let consoleSpy: any

describe('MemoryStatistics.vue', () => {
  let wrapper: any;
  
  const mockProps = {
    userId: 1,
    stats: {
      totalMemories: 150,
      shortTermCount: 80,
      longTermCount: 50,
      workingCount: 20,
      averageImportance: 0.75,
      latestMemory: '2024-01-01T10:00:00Z'
    },
    loading: false
  };

  const createWrapper = (props = {}) => {
    return mount(MemoryStatistics, {
      props: {
        ...mockProps,
        ...props
      },
      global: {
        stubs: {
          'el-row': true,
          'el-col': true,
          'el-icon': true,
          'el-card': true,
          'el-button': true
        }
      }
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateElement.mockReturnValue({
      href: '',
      download: '',
      click: vi.fn()
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockCreateObjectURL.mockReturnValue('blob:url');
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
      expect(wrapper.find('.memory-statistics').exists()).toBe(true);
      expect(wrapper.find('.stats-cards').exists()).toBe(true);
      expect(wrapper.find('.charts-section').exists()).toBe(true);
      expect(wrapper.find('.actions').exists()).toBe(true);
    });

    it('displays correct statistics values', () => {
      wrapper = createWrapper();
      
      expect(wrapper.find('.stat-value').text()).toContain('150');
      expect(wrapper.findAll('.stat-value')[1].text()).toContain('80');
      expect(wrapper.findAll('.stat-value')[2].text()).toContain('50');
      expect(wrapper.findAll('.stat-value')[3].text()).toContain('20');
    });

    it('displays correct statistics labels', () => {
      wrapper = createWrapper();
      
      const labels = wrapper.findAll('.stat-label');
      expect(labels[0].text()).toBe('总记忆数');
      expect(labels[1].text()).toBe('短期记忆');
      expect(labels[2].text()).toBe('长期记忆');
      expect(labels[3].text()).toBe('工作记忆');
    });

    it('displays average importance correctly', () => {
      wrapper = createWrapper();
      
      const importanceValue = wrapper.find('.importance-value');
      expect(importanceValue.text()).toContain('75.0%');
    });

    it('displays formatted latest memory date', () => {
      wrapper = createWrapper();
      
      const latestMemory = wrapper.find('.detail-item .value');
      expect(latestMemory.text()).toContain('2024');
    });

    it('shows loading state when loading prop is true', () => {
      wrapper = createWrapper({ loading: true });
      expect(wrapper.find('[v-loading]').exists()).toBe(true);
    });

    it('hides loading state when loading prop is false', () => {
      wrapper = createWrapper({ loading: false });
      expect(wrapper.find('[v-loading]').exists()).toBe(false);
    });
  });

  describe('Stat Cards', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    it('has correct number of stat cards', () => {
      const statCards = wrapper.findAll('.stat-card');
      expect(statCards.length).toBe(4);
    });

    it('displays correct icons for each card type', () => {
      const icons = wrapper.findAll('.stat-icon .el-icon');
      expect(icons.length).toBe(4);
    });

    it('applies correct background colors for different memory types', () => {
      const statIcons = wrapper.findAll('.stat-icon');
      
      // Total memories icon (default)
      expect(statIcons[0].classes()).not.toContain('short-term');
      expect(statIcons[0].classes()).not.toContain('long-term');
      expect(statIcons[0].classes()).not.toContain('working');
      
      // Short term icon
      expect(statIcons[1].classes()).toContain('short-term');
      
      // Long term icon
      expect(statIcons[2].classes()).toContain('long-term');
      
      // Working memory icon
      expect(statIcons[3].classes()).toContain('working');
    });
  });

  describe('Charts', () => {
    beforeEach(async () => {
      wrapper = createWrapper();
      await nextTick();
    });

    it('initializes pie chart on mount', () => {
      expect(mockECharts.init).toHaveBeenCalled();
    });

    it('creates pie chart with correct container', () => {
      const chartContainer = wrapper.find('.chart-container');
      expect(chartContainer.exists()).toBe(true);
    });

    it('sets correct chart options', () => {
      expect(mockECharts.init().setOption).toHaveBeenCalledWith(
        expect.objectContaining({
          tooltip: expect.objectContaining({
            trigger: 'item',
            formatter: expect.any(String)
          }),
          legend: expect.objectContaining({
            orient: 'vertical',
            left: 'left'
          }),
          series: expect.arrayContaining([
            expect.objectContaining({
              name: '记忆类型',
              type: 'pie',
              radius: '50%',
              data: expect.arrayContaining([
                expect.objectContaining({
                  value: 80,
                  name: '短期记忆'
                }),
                expect.objectContaining({
                  value: 50,
                  name: '长期记忆'
                }),
                expect.objectContaining({
                  value: 20,
                  name: '工作记忆'
                })
              ])
            })
          ])
        })
      );
    });

    it('updates chart when stats change', async () => {
      const newStats = {
        ...mockProps.stats,
        shortTermCount: 100,
        longTermCount: 30,
        workingCount: 20
      };
      
      await wrapper.setProps({ stats: newStats });
      await nextTick();
      
      expect(mockECharts.init().setOption).toHaveBeenCalledTimes(2);
    });

    it('disposes chart on unmount', () => {
      wrapper.unmount();
      expect(mockECharts.init().dispose).toHaveBeenCalled();
    });
  });

  describe('Importance Analysis', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('displays importance bar with correct width', () => {
      const importanceFill = wrapper.find('.importance-fill');
      const widthStyle = importanceFill.attributes('style');
      expect(widthStyle).toContain('width: 75%');
    });

    it('updates importance bar when average importance changes', async () => {
      const newStats = {
        ...mockProps.stats,
        averageImportance: 0.5
      };
      
      await wrapper.setProps({ stats: newStats });
      await nextTick();
      
      const importanceFill = wrapper.find('.importance-fill');
      const widthStyle = importanceFill.attributes('style');
      expect(widthStyle).toContain('width: 50%');
    });

    it('displays importance details correctly', () => {
      const detailItem = wrapper.find('.detail-item');
      expect(detailItem.find('.label').text()).toBe('最新记忆:');
      expect(detailItem.find('.value').text()).toContain('2024');
    });

    it('handles null latest memory date', () => {
      const wrapper = createWrapper({
        stats: {
          ...mockProps.stats,
          latestMemory: null
        }
      });
      
      const detailItem = wrapper.find('.detail-item .value');
      expect(detailItem.text()).toBe('暂无');
    });
  });

  describe('Actions', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('emits refresh event when refresh button is clicked', async () => {
      const refreshButton = wrapper.findAll('.el-button')[0];
      await refreshButton.trigger('click');
      
      expect(wrapper.emitted('refresh')).toBeTruthy();
    });

    it('emits refresh event when chart refresh button is clicked', async () => {
      const chartRefreshButton = wrapper.find('.chart-card .el-button');
      await chartRefreshButton.trigger('click');
      
      expect(wrapper.emitted('refresh')).toBeTruthy();
    });

    it('shows loading state on refresh button when loading', () => {
      const wrapper = createWrapper({ loading: true });
      const refreshButton = wrapper.findAll('.el-button')[0];
      expect(refreshButton.props('loading')).toBe(true);
    });

    it('exports statistics data when export button is clicked', async () => {
      const exportButton = wrapper.findAll('.el-button')[1];
      await exportButton.trigger('click');
      
      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(ElMessage.success).toHaveBeenCalledWith('统计数据已导出');
    });

    it('creates correct export data structure', async () => {
      const exportButton = wrapper.findAll('.el-button')[1];
      await exportButton.trigger('click');
      
      const mockElement = mockCreateElement.mock.results[0].value;
      expect(mockElement.download).toMatch(/^memory-stats-1-\d+\.json$/);
    });
  });

  describe('Date Formatting', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('formats date string correctly', () => {
      const formatted = wrapper.vm.formatDate('2024-01-01T10:00:00Z');
      expect(formatted).toContain('2024');
      expect(formatted).toContain('1');
    });

    it('handles different date formats', () => {
      const formatted = wrapper.vm.formatDate('2024-12-25T15:30:45Z');
      expect(formatted).toContain('2024');
      expect(formatted).toContain('12');
      expect(formatted).toContain('25');
    });

    it('returns "暂无" for null date', () => {
      const formatted = wrapper.vm.formatDate(null);
      expect(formatted).toBe('暂无');
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('has correct structure for mobile responsiveness', () => {
      const rows = wrapper.findAll('.el-row');
      const cols = wrapper.findAll('.el-col');
      
      expect(rows.length).toBeGreaterThan(0);
      expect(cols.length).toBeGreaterThan(0);
    });

    it('applies correct grid layout', () => {
      const statCols = wrapper.findAll('.stats-cards .el-col');
      statCols.forEach(col => {
        expect(col.props('span')).toBe(6);
      });
      
      const chartCols = wrapper.findAll('.charts-section .el-col');
      chartCols.forEach(col => {
        expect(col.props('span')).toBe(12);
      });
    });
  });

  describe('Props Validation', () => {
    it('accepts userId prop correctly', () => {
      wrapper = createWrapper({ userId: 123 });
      expect(wrapper.props().userId).toBe(123);
    });

    it('accepts stats prop with different values', () => {
      const differentStats = {
        totalMemories: 0,
        shortTermCount: 0,
        longTermCount: 0,
        workingCount: 0,
        averageImportance: 0,
        latestMemory: null
      };
      
      wrapper = createWrapper({ stats: differentStats });
      expect(wrapper.props().stats).toEqual(differentStats);
    });

    it('accepts loading prop correctly', () => {
      wrapper = createWrapper({ loading: true });
      expect(wrapper.props().loading).toBe(true);
    });

    it('handles edge case values in stats', () => {
      const edgeCaseStats = {
        totalMemories: 999999,
        shortTermCount: 999999,
        longTermCount: 999999,
        workingCount: 999999,
        averageImportance: 1,
        latestMemory: '2099-12-31T23:59:59Z'
      };
      
      expect(() => {
        createWrapper({ stats: edgeCaseStats });
      }).not.toThrow();
    });
  });

  describe('Chart Data Transformation', () => {
    beforeEach(async () => {
      wrapper = createWrapper();
      await nextTick();
    });

    it('transforms stats data to chart format correctly', () => {
      const setOptionCall = mockECharts.init().setOption.mock.calls[0];
      const chartData = setOptionCall[0].series[0].data;
      
      expect(chartData).toEqual([
        expect.objectContaining({
          value: 80,
          name: '短期记忆',
          itemStyle: { color: 'var(--primary-color)' }
        }),
        expect.objectContaining({
          value: 50,
          name: '长期记忆',
          itemStyle: { color: 'var(--success-color)' }
        }),
        expect.objectContaining({
          value: 20,
          name: '工作记忆',
          itemStyle: { color: 'var(--warning-color)' }
        })
      ]);
    });

    it('handles zero values in chart data', async () => {
      const zeroStats = {
        ...mockProps.stats,
        shortTermCount: 0,
        longTermCount: 0,
        workingCount: 0
      };
      
      await wrapper.setProps({ stats: zeroStats });
      await nextTick();
      
      const setOptionCall = mockECharts.init().setOption.mock.calls[1];
      const chartData = setOptionCall[0].series[0].data;
      
      expect(chartData).toEqual([
        expect.objectContaining({ value: 0, name: '短期记忆' }),
        expect.objectContaining({ value: 0, name: '长期记忆' }),
        expect.objectContaining({ value: 0, name: '工作记忆' })
      ]);
    });
  });

  describe('Card Headers', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('displays correct chart card headers', () => {
      const cardHeaders = wrapper.findAll('.card-header');
      
      expect(cardHeaders[0].text()).toContain('记忆类型分布');
      expect(cardHeaders[1].text()).toContain('重要性分析');
    });

    it('has refresh button in pie chart card', () => {
      const pieChartCard = wrapper.findAll('.chart-card')[0];
      const refreshButton = pieChartCard.find('.el-button');
      expect(refreshButton.exists()).toBe(true);
      expect(refreshButton.props('link')).toBe(true);
    });

    it('has importance value in importance analysis card', () => {
      const importanceCard = wrapper.findAll('.chart-card')[1];
      const importanceValue = importanceCard.find('.importance-value');
      expect(importanceValue.exists()).toBe(true);
      expect(importanceValue.text()).toContain('75.0%');
    });
  });
});