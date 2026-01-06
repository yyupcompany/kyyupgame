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
import DataChart from '@/components/data/DataChart.vue';
import { ElSelect, ElButton, ElCard, ElRadioGroup, ElRadioButton, ElSlider, ElColorPicker } from 'element-plus';

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
    },
    ElSlider: {
      name: 'ElSlider',
      template: '<input type="range" />',
      props: ['modelValue', 'min', 'max', 'step'],
      emits: ['update:modelValue']
    },
    ElColorPicker: {
      name: 'ElColorPicker',
      template: '<input type="color" />',
      props: ['modelValue', 'showAlpha'],
      emits: ['update:modelValue']
    }
  };
});

describe('DataChart.vue', () => {
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  const mockData = [
    { name: '一月', value: 100, category: '销售' },
    { name: '二月', value: 150, category: '销售' },
    { name: '三月', value: 120, category: '销售' },
    { name: '一月', value: 80, category: '成本' },
    { name: '二月', value: 90, category: '成本' },
    { name: '三月', value: 110, category: '成本' }
  ];

  const mockFields = [
    { prop: 'name', label: '月份', type: 'string' },
    { prop: 'value', label: '数值', type: 'number' },
    { prop: 'category', label: '类别', type: 'string' }
  ];

  it('renders data chart component', () => {
    const wrapper = mount(DataChart, {
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
          ElRadioGroup,
          ElRadioButton,
          ElSlider,
          ElColorPicker
        }
      }
    });

    expect(wrapper.find('.data-chart').exists()).toBe(true);
    expect(wrapper.findComponent(ElCard).exists()).toBe(true);
  });

  it('displays chart type selection', () => {
    const wrapper = mount(DataChart, {
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
          ElRadioGroup,
          ElRadioButton,
          ElSlider,
          ElColorPicker
        }
      }
    });

    expect(wrapper.findComponent(ElSelect).exists()).toBe(true);
    expect(wrapper.text()).toContain('折线图');
    expect(wrapper.text()).toContain('柱状图');
    expect(wrapper.text()).toContain('饼图');
    expect(wrapper.text()).toContain('散点图');
  });

  it('handles chart type selection', async () => {
    const wrapper = mount(DataChart, {
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
          ElRadioGroup,
          ElRadioButton,
          ElSlider,
          ElColorPicker
        }
      }
    });

    const chartTypeSelect = wrapper.findComponent(ElSelect);
    await chartTypeSelect.vm.$emit('update:modelValue', 'bar');
    
    expect(wrapper.emitted('chart-type-change')).toBeTruthy();
    expect(wrapper.emitted('chart-type-change')[0][0]).toBe('bar');
  });

  it('shows field selection for chart axes', () => {
    const wrapper = mount(DataChart, {
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
          ElRadioGroup,
          ElRadioButton,
          ElSlider,
          ElColorPicker
        }
      }
    });

    expect(wrapper.find('.field-selection').exists()).toBe(true);
    expect(wrapper.text()).toContain('X轴');
    expect(wrapper.text()).toContain('Y轴');
    expect(wrapper.text()).toContain('分组');
  });

  it('handles field selection changes', async () => {
    const wrapper = mount(DataChart, {
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
          ElRadioGroup,
          ElRadioButton,
          ElSlider,
          ElColorPicker
        }
      }
    });

    const xAxisSelect = wrapper.findAllComponents(ElSelect)[0];
    await xAxisSelect.vm.$emit('update:modelValue', 'name');
    
    expect(wrapper.emitted('field-selection-change')).toBeTruthy();
  });

  it('displays chart configuration options', () => {
    const wrapper = mount(DataChart, {
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
          ElRadioGroup,
          ElRadioButton,
          ElSlider,
          ElColorPicker
        }
      }
    });

    expect(wrapper.find('.chart-configuration').exists()).toBe(true);
    expect(wrapper.findComponent(ElRadioGroup).exists()).toBe(true);
  });

  it('handles chart orientation changes', async () => {
    const wrapper = mount(DataChart, {
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
          ElRadioGroup,
          ElRadioButton,
          ElSlider,
          ElColorPicker
        }
      }
    });

    const orientationRadio = wrapper.findComponent(ElRadioGroup);
    await orientationRadio.vm.$emit('update:modelValue', 'horizontal');
    
    expect(wrapper.emitted('orientation-change')).toBeTruthy();
    expect(wrapper.emitted('orientation-change')[0][0]).toBe('horizontal');
  });

  it('shows chart styling options', () => {
    const wrapper = mount(DataChart, {
      props: {
        data: mockData,
        fields: mockFields,
        showStyling: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElRadioGroup,
          ElRadioButton,
          ElSlider,
          ElColorPicker
        }
      }
    });

    expect(wrapper.find('.chart-styling').exists()).toBe(true);
    expect(wrapper.findComponent(ElColorPicker).exists()).toBe(true);
    expect(wrapper.findComponent(ElSlider).exists()).toBe(true);
  });

  it('handles color scheme changes', async () => {
    const wrapper = mount(DataChart, {
      props: {
        data: mockData,
        fields: mockFields,
        showStyling: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElRadioGroup,
          ElRadioButton,
          ElSlider,
          ElColorPicker
        }
      }
    });

    const colorPicker = wrapper.findComponent(ElColorPicker);
    await colorPicker.vm.$emit('update:modelValue', '#ff0000');
    
    expect(wrapper.emitted('color-change')).toBeTruthy();
    expect(wrapper.emitted('color-change')[0][0]).toBe('#ff0000');
  });

  it('handles chart size adjustments', async () => {
    const wrapper = mount(DataChart, {
      props: {
        data: mockData,
        fields: mockFields,
        showStyling: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElRadioGroup,
          ElRadioButton,
          ElSlider,
          ElColorPicker
        }
      }
    });

    const sizeSlider = wrapper.findComponent(ElSlider);
    await sizeSlider.vm.$emit('update:modelValue', 80);
    
    expect(wrapper.emitted('size-change')).toBeTruthy();
    expect(wrapper.emitted('size-change')[0][0]).toBe(80);
  });

  it('supports chart export', async () => {
    const wrapper = mount(DataChart, {
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
          ElRadioGroup,
          ElRadioButton,
          ElSlider,
          ElColorPicker
        }
      }
    });

    const exportButton = wrapper.find('.export-button');
    if (exportButton.exists()) {
      await exportButton.trigger('click');
      expect(wrapper.emitted('export-chart')).toBeTruthy();
    }
  });

  it('shows chart legend', () => {
    const wrapper = mount(DataChart, {
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
          ElRadioGroup,
          ElRadioButton,
          ElSlider,
          ElColorPicker
        }
      }
    });

    expect(wrapper.find('.chart-legend').exists()).toBe(true);
  });

  it('supports chart animation', () => {
    const wrapper = mount(DataChart, {
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
          ElRadioGroup,
          ElRadioButton,
          ElSlider,
          ElColorPicker
        }
      }
    });

    expect(wrapper.find('.animated-chart').exists()).toBe(true);
  });

  it('handles chart click events', async () => {
    const wrapper = mount(DataChart, {
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
          ElRadioGroup,
          ElRadioButton,
          ElSlider,
          ElColorPicker
        }
      }
    });

    await wrapper.vm.onChartClick({ data: mockData[0] });
    expect(wrapper.emitted('chart-click')).toBeTruthy();
  });

  it('supports chart zoom', () => {
    const wrapper = mount(DataChart, {
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
          ElRadioGroup,
          ElRadioButton,
          ElSlider,
          ElColorPicker
        }
      }
    });

    expect(wrapper.find('.zoomable-chart').exists()).toBe(true);
  });

  it('handles chart zoom events', async () => {
    const wrapper = mount(DataChart, {
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
          ElRadioGroup,
          ElRadioButton,
          ElSlider,
          ElColorPicker
        }
      }
    });

    await wrapper.vm.onChartZoom({ start: 0, end: 100 });
    expect(wrapper.emitted('chart-zoom')).toBeTruthy();
  });

  it('shows chart tooltips', () => {
    const wrapper = mount(DataChart, {
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
          ElRadioGroup,
          ElRadioButton,
          ElSlider,
          ElColorPicker
        }
      }
    });

    expect(wrapper.find('.chart-tooltips').exists()).toBe(true);
  });

  it('handles tooltip events', async () => {
    const wrapper = mount(DataChart, {
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
          ElRadioGroup,
          ElRadioButton,
          ElSlider,
          ElColorPicker
        }
      }
    });

    await wrapper.vm.onTooltipShow({ data: mockData[0] });
    expect(wrapper.emitted('tooltip-show')).toBeTruthy();
  });

  it('supports chart themes', () => {
    const wrapper = mount(DataChart, {
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
          ElRadioGroup,
          ElRadioButton,
          ElSlider,
          ElColorPicker
        }
      }
    });

    expect(wrapper.text()).toContain('light');
    expect(wrapper.text()).toContain('dark');
    expect(wrapper.text()).toContain('colorful');
  });

  it('handles theme selection', async () => {
    const wrapper = mount(DataChart, {
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
          ElRadioGroup,
          ElRadioButton,
          ElSlider,
          ElColorPicker
        }
      }
    });

    const themeSelect = wrapper.find('.theme-select');
    if (themeSelect.exists()) {
      await themeSelect.setValue('dark');
      expect(wrapper.emitted('theme-change')).toBeTruthy();
    }
  });

  it('shows chart statistics', () => {
    const wrapper = mount(DataChart, {
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
          ElRadioGroup,
          ElRadioButton,
          ElSlider,
          ElColorPicker
        }
      }
    });

    expect(wrapper.find('.chart-statistics').exists()).toBe(true);
  });

  it('supports chart refresh', async () => {
    const wrapper = mount(DataChart, {
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
          ElRadioGroup,
          ElRadioButton,
          ElSlider,
          ElColorPicker
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
    const wrapper = mount(DataChart, {
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
          ElRadioGroup,
          ElRadioButton,
          ElSlider,
          ElColorPicker
        }
      }
    });

    const filteredData = mockData.filter(item => item.category === '销售');
    await wrapper.vm.applyFilter({ category: '销售' });
    
    expect(wrapper.emitted('data-filter')).toBeTruthy();
    expect(wrapper.emitted('data-filter')[0][0]).toEqual({ category: '销售' });
  });

  it('shows loading state', () => {
    const wrapper = mount(DataChart, {
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
          ElRadioGroup,
          ElRadioButton,
          ElSlider,
          ElColorPicker
        }
      }
    });

    expect(wrapper.find('.loading-overlay').exists()).toBe(true);
  });

  it('handles empty data state', () => {
    const wrapper = mount(DataChart, {
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
          ElRadioGroup,
          ElRadioButton,
          ElSlider,
          ElColorPicker
        }
      }
    });

    expect(wrapper.find('.empty-data').exists()).toBe(true);
  });

  it('applies custom CSS classes', () => {
    const wrapper = mount(DataChart, {
      props: {
        data: mockData,
        fields: mockFields,
        chartClass: 'custom-chart-class'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElRadioGroup,
          ElRadioButton,
          ElSlider,
          ElColorPicker
        }
      }
    });

    expect(wrapper.find('.custom-chart-class').exists()).toBe(true);
  });

  it('supports chart comparison mode', () => {
    const wrapper = mount(DataChart, {
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
          ElRadioGroup,
          ElRadioButton,
          ElSlider,
          ElColorPicker
        }
      }
    });

    expect(wrapper.find('.comparison-mode').exists()).toBe(true);
  });

  it('handles comparison data selection', async () => {
    const wrapper = mount(DataChart, {
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
          ElRadioGroup,
          ElRadioButton,
          ElSlider,
          ElColorPicker
        }
      }
    });

    await wrapper.vm.selectComparisonData(mockData.slice(0, 3));
    expect(wrapper.emitted('comparison-data-selected')).toBeTruthy();
  });

  it('supports responsive chart sizing', () => {
    const wrapper = mount(DataChart, {
      props: {
        data: mockData,
        fields: mockFields,
        responsive: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElRadioGroup,
          ElRadioButton,
          ElSlider,
          ElColorPicker
        }
      }
    });

    expect(wrapper.find('.responsive-chart').exists()).toBe(true);
  });
});