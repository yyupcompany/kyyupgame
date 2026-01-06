/**
 * 用量类型饼图组件单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import UsageTypePieChart from '../UsageTypePieChart.vue';

// Mock ECharts
vi.mock('echarts', () => ({
  default: {
    init: vi.fn(() => ({
      setOption: vi.fn(),
      resize: vi.fn(),
      dispose: vi.fn()
    }))
  },
  graphic: {
    LinearGradient: vi.fn()
  }
}));

import * as echarts from 'echarts';

describe('UsageTypePieChart', () => {
  let mockChart: any;

  beforeEach(() => {
    mockChart = {
      setOption: vi.fn(),
      resize: vi.fn(),
      dispose: vi.fn()
    };

    (echarts.init as any).mockReturnValue(mockChart);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('应该正确渲染组件', () => {
    const wrapper = mount(UsageTypePieChart, {
      props: {
        data: [
          { type: 'text', count: 10000, cost: 100.123456 },
          { type: 'image', count: 2000, cost: 30.234567 }
        ]
      }
    });

    expect(wrapper.find('.usage-type-pie-chart').exists()).toBe(true);
  });

  it('应该初始化ECharts实例', async () => {
    const wrapper = mount(UsageTypePieChart, {
      props: {
        data: [
          { type: 'text', count: 10000, cost: 100.123456 }
        ]
      }
    });

    await wrapper.vm.$nextTick();

    expect(echarts.init).toHaveBeenCalled();
  });

  it('应该设置图表选项', async () => {
    const wrapper = mount(UsageTypePieChart, {
      props: {
        data: [
          { type: 'text', count: 10000, cost: 100.123456 },
          { type: 'image', count: 2000, cost: 30.234567 }
        ]
      }
    });

    await wrapper.vm.$nextTick();

    expect(mockChart.setOption).toHaveBeenCalled();
  });

  it('应该支持showCost属性', async () => {
    const wrapper = mount(UsageTypePieChart, {
      props: {
        data: [
          { type: 'text', count: 10000, cost: 100.123456 }
        ],
        showCost: true
      }
    });

    await wrapper.vm.$nextTick();

    expect(mockChart.setOption).toHaveBeenCalled();
    const setOptionCall = mockChart.setOption.mock.calls[0][0];
    expect(setOptionCall.title.text).toBe('费用分布');
  });

  it('应该支持height属性', () => {
    const wrapper = mount(UsageTypePieChart, {
      props: {
        data: [],
        height: '500px'
      }
    });

    const chartDiv = wrapper.find('.usage-type-pie-chart');
    expect(chartDiv.exists()).toBe(true);
  });

  it('应该在数据变化时更新图表', async () => {
    const wrapper = mount(UsageTypePieChart, {
      props: {
        data: [
          { type: 'text', count: 10000, cost: 100.123456 }
        ]
      }
    });

    await wrapper.vm.$nextTick();
    vi.clearAllMocks();

    await wrapper.setProps({
      data: [
        { type: 'text', count: 15000, cost: 150.123456 },
        { type: 'image', count: 3000, cost: 40.234567 }
      ]
    });

    await wrapper.vm.$nextTick();

    expect(mockChart.setOption).toHaveBeenCalled();
  });

  it('应该在showCost变化时更新图表', async () => {
    const wrapper = mount(UsageTypePieChart, {
      props: {
        data: [
          { type: 'text', count: 10000, cost: 100.123456 }
        ],
        showCost: false
      }
    });

    await wrapper.vm.$nextTick();
    vi.clearAllMocks();

    await wrapper.setProps({ showCost: true });
    await wrapper.vm.$nextTick();

    expect(mockChart.setOption).toHaveBeenCalled();
  });

  it('应该在组件卸载时销毁图表', async () => {
    const wrapper = mount(UsageTypePieChart, {
      props: {
        data: [
          { type: 'text', count: 10000, cost: 100.123456 }
        ]
      }
    });

    await wrapper.vm.$nextTick();

    wrapper.unmount();

    expect(mockChart.dispose).toHaveBeenCalled();
  });

  it('应该处理窗口resize事件', async () => {
    const wrapper = mount(UsageTypePieChart, {
      props: {
        data: [
          { type: 'text', count: 10000, cost: 100.123456 }
        ]
      }
    });

    await wrapper.vm.$nextTick();

    // 触发resize事件
    window.dispatchEvent(new Event('resize'));
    await wrapper.vm.$nextTick();

    expect(mockChart.resize).toHaveBeenCalled();
  });

  it('应该正确映射类型名称', async () => {
    const wrapper = mount(UsageTypePieChart, {
      props: {
        data: [
          { type: 'text', count: 10000, cost: 100.123456 },
          { type: 'image', count: 2000, cost: 30.234567 },
          { type: 'audio', count: 1000, cost: 15.123456 },
          { type: 'video', count: 500, cost: 10.123456 },
          { type: 'embedding', count: 300, cost: 5.123456 }
        ]
      }
    });

    await wrapper.vm.$nextTick();

    expect(mockChart.setOption).toHaveBeenCalled();
    const setOptionCall = mockChart.setOption.mock.calls[0][0];
    const seriesData = setOptionCall.series[0].data;

    expect(seriesData[0].name).toBe('文本');
    expect(seriesData[1].name).toBe('图片');
    expect(seriesData[2].name).toBe('语音');
    expect(seriesData[3].name).toBe('视频');
    expect(seriesData[4].name).toBe('向量');
  });

  it('应该正确设置类型颜色', async () => {
    const wrapper = mount(UsageTypePieChart, {
      props: {
        data: [
          { type: 'text', count: 10000, cost: 100.123456 },
          { type: 'image', count: 2000, cost: 30.234567 }
        ]
      }
    });

    await wrapper.vm.$nextTick();

    const setOptionCall = mockChart.setOption.mock.calls[0][0];
    const seriesData = setOptionCall.series[0].data;

    expect(seriesData[0].itemStyle.color).toBe('var(--primary-color)'); // text
    expect(seriesData[1].itemStyle.color).toBe('#ec4899'); // image
  });

  it('应该处理空数据', async () => {
    const wrapper = mount(UsageTypePieChart, {
      props: {
        data: []
      }
    });

    await wrapper.vm.$nextTick();

    expect(mockChart.setOption).toHaveBeenCalled();
    const setOptionCall = mockChart.setOption.mock.calls[0][0];
    expect(setOptionCall.series[0].data).toEqual([]);
  });

  it('应该处理未知类型', async () => {
    const wrapper = mount(UsageTypePieChart, {
      props: {
        data: [
          { type: 'unknown', count: 100, cost: 10.123456 }
        ]
      }
    });

    await wrapper.vm.$nextTick();

    const setOptionCall = mockChart.setOption.mock.calls[0][0];
    const seriesData = setOptionCall.series[0].data;

    expect(seriesData[0].name).toBe('unknown');
    expect(seriesData[0].itemStyle.color).toBe('var(--text-secondary)'); // 默认颜色
  });
});

