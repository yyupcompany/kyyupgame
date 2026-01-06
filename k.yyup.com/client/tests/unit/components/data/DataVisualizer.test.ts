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
import { createPinia, setActivePinia } from 'pinia';
import DataVisualizer from '@/components/data/DataVisualizer.vue';
import { ElSelect, ElButton, ElCard, ElTabs, ElTabPane, ElRadioGroup, ElRadioButton } from 'element-plus';

// Mock Element Plus components
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus');
  return {
    ...actual,
    ElSelect: {
      name: 'ElSelect',
      template: '<select><slot></slot></select>',
      props: ['modelValue', 'placeholder'],
      emits: ['update:modelValue']
    },
    ElButton: {
      name: 'ElButton',
      template: '<button><slot></slot></button>',
      props: ['type', 'size', 'icon', 'disabled']
    },
    ElCard: {
      name: 'ElCard',
      template: '<div class="el-card"><slot></slot></div>',
      props: ['shadow']
    },
    ElTabs: {
      name: 'ElTabs',
      template: '<div class="el-tabs"><slot></slot></div>',
      props: ['value'],
      emits: ['update:value']
    },
    ElTabPane: {
      name: 'ElTabPane',
      template: '<div class="el-tab-pane"><slot></slot></div>',
      props: ['label', 'name']
    },
    ElRadioGroup: {
      name: 'ElRadioGroup',
      template: '<div class="el-radio-group"><slot></slot></div>',
      props: ['modelValue'],
      emits: ['update:modelValue']
    },
    ElRadioButton: {
      name: 'ElRadioButton',
      template: '<button><slot></slot></button>',
      props: ['label', 'disabled']
    }
  };
});

describe('DataVisualizer.vue', () => {
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  const mockData = [
    { date: '2023-01', value: 100, category: 'A' },
    { date: '2023-02', value: 150, category: 'A' },
    { date: '2023-03', value: 120, category: 'A' },
    { date: '2023-01', value: 80, category: 'B' },
    { date: '2023-02', value: 90, category: 'B' },
    { date: '2023-03', value: 110, category: 'B' }
  ];

  const mockFields = [
    { prop: 'date', label: '日期', type: 'date' },
    { prop: 'value', label: '数值', type: 'number' },
    { prop: 'category', label: '类别', type: 'string' }
  ];

  it('renders data visualizer with chart options', () => {
    const wrapper = mount(DataVisualizer, {
      props: {
        data: mockData,
        fields: mockFields
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTabs,
          ElTabPane,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.find('.data-visualizer').exists()).toBe(true);
    expect(wrapper.findComponent(ElSelect).exists()).toBe(true);
    expect(wrapper.text()).toContain('图表类型');
  });

  it('displays available chart types', () => {
    const wrapper = mount(DataVisualizer, {
      props: {
        data: mockData,
        fields: mockFields
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTabs,
          ElTabPane,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.text()).toContain('折线图');
    expect(wrapper.text()).toContain('柱状图');
    expect(wrapper.text()).toContain('饼图');
    expect(wrapper.text()).toContain('散点图');
  });

  it('handles chart type selection', async () => {
    const wrapper = mount(DataVisualizer, {
      props: {
        data: mockData,
        fields: mockFields
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTabs,
          ElTabPane,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    const chartTypeSelect = wrapper.findComponent(ElSelect);
    await chartTypeSelect.vm.$emit('update:modelValue', 'bar');
    
    expect(wrapper.emitted('chart-type-change')).toBeTruthy();
    expect(wrapper.emitted('chart-type-change')[0][0]).toBe('bar');
  });

  it('shows field selection options', () => {
    const wrapper = mount(DataVisualizer, {
      props: {
        data: mockData,
        fields: mockFields,
        showFieldSelection: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTabs,
          ElTabPane,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.find('.field-selection').exists()).toBe(true);
    expect(wrapper.text()).toContain('X轴');
    expect(wrapper.text()).toContain('Y轴');
    expect(wrapper.text()).toContain('分组');
  });

  it('handles field selection changes', async () => {
    const wrapper = mount(DataVisualizer, {
      props: {
        data: mockData,
        fields: mockFields,
        showFieldSelection: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTabs,
          ElTabPane,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    const xAxisSelect = wrapper.findAllComponents(ElSelect)[0];
    await xAxisSelect.vm.$emit('update:modelValue', 'date');
    
    expect(wrapper.emitted('field-selection-change')).toBeTruthy();
  });

  it('displays chart tabs', () => {
    const wrapper = mount(DataVisualizer, {
      props: {
        data: mockData,
        fields: mockFields,
        showTabs: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTabs,
          ElTabPane,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.findComponent(ElTabs).exists()).toBe(true);
    expect(wrapper.findAllComponents(ElTabPane).length).toBeGreaterThan(0);
  });

  it('handles tab switching', async () => {
    const wrapper = mount(DataVisualizer, {
      props: {
        data: mockData,
        fields: mockFields,
        showTabs: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTabs,
          ElTabPane,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    const tabs = wrapper.findComponent(ElTabs);
    await tabs.vm.$emit('update:value', 'chart2');
    
    expect(wrapper.emitted('tab-change')).toBeTruthy();
    expect(wrapper.emitted('tab-change')[0][0]).toBe('chart2');
  });

  it('shows chart configuration options', () => {
    const wrapper = mount(DataVisualizer, {
      props: {
        data: mockData,
        fields: mockFields,
        showConfiguration: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTabs,
          ElTabPane,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.find('.chart-configuration').exists()).toBe(true);
    expect(wrapper.text()).toContain('图表配置');
  });

  it('handles chart configuration changes', async () => {
    const wrapper = mount(DataVisualizer, {
      props: {
        data: mockData,
        fields: mockFields,
        showConfiguration: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTabs,
          ElTabPane,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    const colorSchemeSelect = wrapper.find('.color-scheme-select');
    if (colorSchemeSelect.exists()) {
      await colorSchemeSelect.setValue('dark');
      expect(wrapper.emitted('config-change')).toBeTruthy();
    }
  });

  it('supports chart export', async () => {
    const wrapper = mount(DataVisualizer, {
      props: {
        data: mockData,
        fields: mockFields,
        exportable: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTabs,
          ElTabPane,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    const exportButton = wrapper.find('.export-button');
    if (exportButton.exists()) {
      await exportButton.trigger('click');
      expect(wrapper.emitted('export-chart')).toBeTruthy();
    }
  });

  it('shows chart statistics', () => {
    const wrapper = mount(DataVisualizer, {
      props: {
        data: mockData,
        fields: mockFields,
        showStatistics: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTabs,
          ElTabPane,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.find('.chart-statistics').exists()).toBe(true);
  });

  it('supports chart refresh', async () => {
    const wrapper = mount(DataVisualizer, {
      props: {
        data: mockData,
        fields: mockFields
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTabs,
          ElTabPane,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    const refreshButton = wrapper.find('.refresh-button');
    if (refreshButton.exists()) {
      await refreshButton.trigger('click');
      expect(wrapper.emitted('refresh')).toBeTruthy();
    }
  });

  it('handles data filtering', async () => {
    const wrapper = mount(DataVisualizer, {
      props: {
        data: mockData,
        fields: mockFields,
        filterable: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTabs,
          ElTabPane,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    const filteredData = mockData.filter(item => item.category === 'A');
    await wrapper.vm.applyFilter({ category: 'A' });
    
    expect(wrapper.emitted('data-filter')).toBeTruthy();
    expect(wrapper.emitted('data-filter')[0][0]).toEqual({ category: 'A' });
  });

  it('supports chart themes', () => {
    const wrapper = mount(DataVisualizer, {
      props: {
        data: mockData,
        fields: mockFields,
        themes: ['light', 'dark', 'colorful']
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTabs,
          ElTabPane,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.text()).toContain('light');
    expect(wrapper.text()).toContain('dark');
    expect(wrapper.text()).toContain('colorful');
  });

  it('handles theme selection', async () => {
    const wrapper = mount(DataVisualizer, {
      props: {
        data: mockData,
        fields: mockFields,
        themes: ['light', 'dark']
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTabs,
          ElTabPane,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    const themeSelect = wrapper.find('.theme-select');
    if (themeSelect.exists()) {
      await themeSelect.setValue('dark');
      expect(wrapper.emitted('theme-change')).toBeTruthy();
    }
  });

  it('shows loading state', () => {
    const wrapper = mount(DataVisualizer, {
      props: {
        data: mockData,
        fields: mockFields,
        loading: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTabs,
          ElTabPane,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.find('.loading-overlay').exists()).toBe(true);
  });

  it('handles empty data state', () => {
    const wrapper = mount(DataVisualizer, {
      props: {
        data: [],
        fields: mockFields
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTabs,
          ElTabPane,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.find('.empty-data').exists()).toBe(true);
  });

  it('supports chart animation', () => {
    const wrapper = mount(DataVisualizer, {
      props: {
        data: mockData,
        fields: mockFields,
        animated: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTabs,
          ElTabPane,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.find('.animated-chart').exists()).toBe(true);
  });

  it('shows chart legend', () => {
    const wrapper = mount(DataVisualizer, {
      props: {
        data: mockData,
        fields: mockFields,
        showLegend: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTabs,
          ElTabPane,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.find('.chart-legend').exists()).toBe(true);
  });

  it('handles chart click events', async () => {
    const wrapper = mount(DataVisualizer, {
      props: {
        data: mockData,
        fields: mockFields
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTabs,
          ElTabPane,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    await wrapper.vm.onChartClick({ data: mockData[0] });
    expect(wrapper.emitted('chart-click')).toBeTruthy();
  });

  it('supports chart zoom', () => {
    const wrapper = mount(DataVisualizer, {
      props: {
        data: mockData,
        fields: mockFields,
        zoomable: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTabs,
          ElTabPane,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.find('.zoomable-chart').exists()).toBe(true);
  });

  it('handles chart zoom events', async () => {
    const wrapper = mount(DataVisualizer, {
      props: {
        data: mockData,
        fields: mockFields,
        zoomable: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTabs,
          ElTabPane,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    await wrapper.vm.onChartZoom({ start: 0, end: 100 });
    expect(wrapper.emitted('chart-zoom')).toBeTruthy();
  });

  it('applies custom CSS classes', () => {
    const wrapper = mount(DataVisualizer, {
      props: {
        data: mockData,
        fields: mockFields,
        visualizerClass: 'custom-visualizer-class'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTabs,
          ElTabPane,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.find('.custom-visualizer-class').exists()).toBe(true);
  });

  it('supports chart comparison mode', () => {
    const wrapper = mount(DataVisualizer, {
      props: {
        data: mockData,
        fields: mockFields,
        comparisonMode: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTabs,
          ElTabPane,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.find('.comparison-mode').exists()).toBe(true);
  });

  it('handles comparison data selection', async () => {
    const wrapper = mount(DataVisualizer, {
      props: {
        data: mockData,
        fields: mockFields,
        comparisonMode: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTabs,
          ElTabPane,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    await wrapper.vm.selectComparisonData(mockData.slice(0, 3));
    expect(wrapper.emitted('comparison-data-selected')).toBeTruthy();
  });

  it('supports chart tooltips', () => {
    const wrapper = mount(DataVisualizer, {
      props: {
        data: mockData,
        fields: mockFields,
        showTooltips: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTabs,
          ElTabPane,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.find('.chart-tooltips').exists()).toBe(true);
  });

  it('handles tooltip events', async () => {
    const wrapper = mount(DataVisualizer, {
      props: {
        data: mockData,
        fields: mockFields,
        showTooltips: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTabs,
          ElTabPane,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    await wrapper.vm.onTooltipShow({ data: mockData[0] });
    expect(wrapper.emitted('tooltip-show')).toBeTruthy();
  });
});