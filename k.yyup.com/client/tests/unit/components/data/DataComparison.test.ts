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
import DataComparison from '@/components/data/DataComparison.vue';
import { ElCard, ElRow, ElCol, ElSelect, ElButton, ElTable, ElTableColumn, ElProgress, ElRadioGroup, ElRadioButton } from 'element-plus';

// Mock Element Plus components
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus');
  return {
    ...actual,
    ElCard: {
      name: 'ElCard',
      template: '<div class="el-card"><slot></slot></div>',
      props: ['shadow']
    },
    ElRow: {
      name: 'ElRow',
      template: '<div class="el-row"><slot></slot></div>',
      props: ['gutter']
    },
    ElCol: {
      name: 'ElCol',
      template: '<div class="el-col"><slot></slot></div>',
      props: ['span', 'offset']
    },
    ElSelect: {
      name: 'ElSelect',
      template: '<select><slot></slot></select>',
      props: ['modelValue', 'placeholder', 'multiple'],
      emits: ['update:modelValue']
    },
    ElButton: {
      name: 'ElButton',
      template: '<button><slot></slot></button>',
      props: ['type', 'size', 'icon', 'disabled']
    },
    ElTable: {
      name: 'ElTable',
      template: '<div class="el-table"><slot></slot></div>',
      props: ['data', 'height']
    },
    ElTableColumn: {
      name: 'ElTableColumn',
      template: '<div class="el-table-column"><slot></slot></div>',
      props: ['prop', 'label', 'width', 'formatter']
    },
    ElProgress: {
      name: 'ElProgress',
      template: '<div class="el-progress"></div>',
      props: ['percentage', 'status', 'type']
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

describe('DataComparison.vue', () => {
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  const mockDataset1 = [
    { id: 1, name: '产品A', value: 100, category: '类别1', date: '2023-01' },
    { id: 2, name: '产品B', value: 150, category: '类别2', date: '2023-01' },
    { id: 3, name: '产品C', value: 200, category: '类别1', date: '2023-01' }
  ];

  const mockDataset2 = [
    { id: 1, name: '产品A', value: 120, category: '类别1', date: '2023-02' },
    { id: 2, name: '产品B', value: 180, category: '类别2', date: '2023-02' },
    { id: 3, name: '产品C', value: 220, category: '类别1', date: '2023-02' }
  ];

  const mockComparisonFields = [
    { prop: 'name', label: '名称', type: 'string' },
    { prop: 'value', label: '数值', type: 'number', comparable: true },
    { prop: 'category', label: '类别', type: 'string' },
    { prop: 'date', label: '日期', type: 'date' }
  ];

  it('renders data comparison component', () => {
    const wrapper = mount(DataComparison, {
      props: {
        datasets: [mockDataset1, mockDataset2],
        fields: mockComparisonFields
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElSelect,
          ElButton,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.find('.data-comparison').exists()).toBe(true);
    expect(wrapper.findComponent(ElCard).exists()).toBe(true);
  });

  it('displays dataset selection options', () => {
    const wrapper = mount(DataComparison, {
      props: {
        datasets: [mockDataset1, mockDataset2],
        fields: mockComparisonFields,
        showDatasetSelection: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElSelect,
          ElButton,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.find('.dataset-selection').exists()).toBe(true);
    expect(wrapper.findComponent(ElSelect).exists()).toBe(true);
  });

  it('handles dataset selection changes', async () => {
    const wrapper = mount(DataComparison, {
      props: {
        datasets: [mockDataset1, mockDataset2],
        fields: mockComparisonFields,
        showDatasetSelection: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElSelect,
          ElButton,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    const datasetSelect = wrapper.findComponent(ElSelect);
    await datasetSelect.vm.$emit('update:modelValue', [0, 1]);
    
    expect(wrapper.emitted('dataset-selection-change')).toBeTruthy();
    expect(wrapper.emitted('dataset-selection-change')[0][0]).toEqual([0, 1]);
  });

  it('displays comparison field selection', () => {
    const wrapper = mount(DataComparison, {
      props: {
        datasets: [mockDataset1, mockDataset2],
        fields: mockComparisonFields,
        showFieldSelection: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElSelect,
          ElButton,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.find('.field-selection').exists()).toBe(true);
    expect(wrapper.text()).toContain('数值');
  });

  it('handles field selection changes', async () => {
    const wrapper = mount(DataComparison, {
      props: {
        datasets: [mockDataset1, mockDataset2],
        fields: mockComparisonFields,
        showFieldSelection: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElSelect,
          ElButton,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    const fieldSelect = wrapper.find('.field-select');
    if (fieldSelect.exists()) {
      await fieldSelect.setValue('value');
      expect(wrapper.emitted('field-selection-change')).toBeTruthy();
    }
  });

  it('shows comparison results in table format', () => {
    const wrapper = mount(DataComparison, {
      props: {
        datasets: [mockDataset1, mockDataset2],
        fields: mockComparisonFields,
        showTable: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElSelect,
          ElButton,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.findComponent(ElTable).exists()).toBe(true);
    expect(wrapper.findAllComponents(ElTableColumn).length).toBeGreaterThan(0);
  });

  it('displays comparison statistics', () => {
    const wrapper = mount(DataComparison, {
      props: {
        datasets: [mockDataset1, mockDataset2],
        fields: mockComparisonFields,
        showStatistics: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElSelect,
          ElButton,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.find('.comparison-statistics').exists()).toBe(true);
  });

  it('shows comparison metrics', () => {
    const wrapper = mount(DataComparison, {
      props: {
        datasets: [mockDataset1, mockDataset2],
        fields: mockComparisonFields,
        showMetrics: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElSelect,
          ElButton,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.find('.comparison-metrics').exists()).toBe(true);
    expect(wrapper.text()).toContain('差异');
    expect(wrapper.text()).toContain('变化率');
    expect(wrapper.text()).toContain('百分比变化');
  });

  it('displays visual comparison charts', () => {
    const wrapper = mount(DataComparison, {
      props: {
        datasets: [mockDataset1, mockDataset2],
        fields: mockComparisonFields,
        showCharts: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElSelect,
          ElButton,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.find('.comparison-charts').exists()).toBe(true);
  });

  it('supports different comparison types', () => {
    const wrapper = mount(DataComparison, {
      props: {
        datasets: [mockDataset1, mockDataset2],
        fields: mockComparisonFields,
        comparisonTypes: ['absolute', 'percentage', 'ratio']
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElSelect,
          ElButton,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.find('.comparison-types').exists()).toBe(true);
    expect(wrapper.text()).toContain('绝对值');
    expect(wrapper.text()).toContain('百分比');
    expect(wrapper.text()).toContain('比率');
  });

  it('handles comparison type selection', async () => {
    const wrapper = mount(DataComparison, {
      props: {
        datasets: [mockDataset1, mockDataset2],
        fields: mockComparisonFields,
        comparisonTypes: ['absolute', 'percentage']
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElSelect,
          ElButton,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    const typeRadio = wrapper.findComponent(ElRadioGroup);
    await typeRadio.vm.$emit('update:modelValue', 'percentage');
    
    expect(wrapper.emitted('comparison-type-change')).toBeTruthy();
    expect(wrapper.emitted('comparison-type-change')[0][0]).toBe('percentage');
  });

  it('shows comparison progress indicators', () => {
    const wrapper = mount(DataComparison, {
      props: {
        datasets: [mockDataset1, mockDataset2],
        fields: mockComparisonFields,
        showProgress: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElSelect,
          ElButton,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    const progressBars = wrapper.findAllComponents(ElProgress);
    expect(progressBars.length).toBeGreaterThan(0);
  });

  it('supports side-by-side comparison layout', () => {
    const wrapper = mount(DataComparison, {
      props: {
        datasets: [mockDataset1, mockDataset2],
        fields: mockComparisonFields,
        layout: 'side-by-side'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElSelect,
          ElButton,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.find('.side-by-side-layout').exists()).toBe(true);
  });

  it('supports overlay comparison layout', () => {
    const wrapper = mount(DataComparison, {
      props: {
        datasets: [mockDataset1, mockDataset2],
        fields: mockComparisonFields,
        layout: 'overlay'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElSelect,
          ElButton,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.find('.overlay-layout').exists()).toBe(true);
  });

  it('handles comparison export', async () => {
    const wrapper = mount(DataComparison, {
      props: {
        datasets: [mockDataset1, mockDataset2],
        fields: mockComparisonFields,
        exportable: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElSelect,
          ElButton,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    const exportButton = wrapper.find('.export-button');
    if (exportButton.exists()) {
      await exportButton.trigger('click');
      expect(wrapper.emitted('export')).toBeTruthy();
    }
  });

  it('shows comparison summary', () => {
    const wrapper = mount(DataComparison, {
      props: {
        datasets: [mockDataset1, mockDataset2],
        fields: mockComparisonFields,
        showSummary: true,
        summary: {
          totalRecords: 6,
          matchedRecords: 3,
          unmatchedRecords: 3,
          averageDifference: 20
        }
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElSelect,
          ElButton,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.find('.comparison-summary').exists()).toBe(true);
    expect(wrapper.text()).toContain('总计: 6');
    expect(wrapper.text()).toContain('匹配: 3');
    expect(wrapper.text()).toContain('不匹配: 3');
  });

  it('supports data matching options', () => {
    const wrapper = mount(DataComparison, {
      props: {
        datasets: [mockDataset1, mockDataset2],
        fields: mockComparisonFields,
        showMatching: true,
        matchFields: ['name', 'category']
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElSelect,
          ElButton,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.find('.data-matching').exists()).toBe(true);
  });

  it('handles match field selection', async () => {
    const wrapper = mount(DataComparison, {
      props: {
        datasets: [mockDataset1, mockDataset2],
        fields: mockComparisonFields,
        showMatching: true,
        matchFields: ['name', 'category']
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElSelect,
          ElButton,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    const matchSelect = wrapper.find('.match-field-select');
    if (matchSelect.exists()) {
      await matchSelect.setValue(['name']);
      expect(wrapper.emitted('match-field-change')).toBeTruthy();
    }
  });

  it('shows comparison filters', () => {
    const wrapper = mount(DataComparison, {
      props: {
        datasets: [mockDataset1, mockDataset2],
        fields: mockComparisonFields,
        filterable: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElSelect,
          ElButton,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.find('.comparison-filters').exists()).toBe(true);
  });

  it('handles filter changes', async () => {
    const wrapper = mount(DataComparison, {
      props: {
        datasets: [mockDataset1, mockDataset2],
        fields: mockComparisonFields,
        filterable: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElSelect,
          ElButton,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    await wrapper.vm.applyFilter({ category: '类别1' });
    expect(wrapper.emitted('filter-change')).toBeTruthy();
    expect(wrapper.emitted('filter-change')[0][0]).toEqual({ category: '类别1' });
  });

  it('supports comparison highlighting', () => {
    const wrapper = mount(DataComparison, {
      props: {
        datasets: [mockDataset1, mockDataset2],
        fields: mockComparisonFields,
        highlightDifferences: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElSelect,
          ElButton,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.find('.highlighted-differences').exists()).toBe(true);
  });

  it('handles comparison refresh', async () => {
    const wrapper = mount(DataComparison, {
      props: {
        datasets: [mockDataset1, mockDataset2],
        fields: mockComparisonFields,
        refreshable: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElSelect,
          ElButton,
          ElTable,
          ElTableColumn,
          ElProgress,
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

  it('shows loading state', () => {
    const wrapper = mount(DataComparison, {
      props: {
        datasets: [mockDataset1, mockDataset2],
        fields: mockComparisonFields,
        loading: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElSelect,
          ElButton,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.find('.loading-overlay').exists()).toBe(true);
  });

  it('handles empty datasets gracefully', () => {
    const wrapper = mount(DataComparison, {
      props: {
        datasets: [[], []],
        fields: mockComparisonFields
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElSelect,
          ElButton,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.find('.empty-data').exists()).toBe(true);
  });

  it('applies custom CSS classes', () => {
    const wrapper = mount(DataComparison, {
      props: {
        datasets: [mockDataset1, mockDataset2],
        fields: mockComparisonFields,
        comparisonClass: 'custom-comparison-class',
        cardClass: 'custom-card-class'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElSelect,
          ElButton,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.find('.custom-comparison-class').exists()).toBe(true);
    expect(wrapper.find('.custom-card-class').exists()).toBe(true);
  });

  it('supports custom comparison calculations', async () => {
    const wrapper = mount(DataComparison, {
      props: {
        datasets: [mockDataset1, mockDataset2],
        fields: mockComparisonFields,
        customCalculations: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElSelect,
          ElButton,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    await wrapper.vm.performCustomCalculation('custom-metric');
    expect(wrapper.emitted('custom-calculation')).toBeTruthy();
  });

  it('shows comparison insights', () => {
    const wrapper = mount(DataComparison, {
      props: {
        datasets: [mockDataset1, mockDataset2],
        fields: mockComparisonFields,
        showInsights: true,
        insights: [
          { type: 'positive', message: '整体数据呈上升趋势' },
          { type: 'warning', message: '部分数据差异较大，需要关注' }
        ]
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElSelect,
          ElButton,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.find('.comparison-insights').exists()).toBe(true);
    expect(wrapper.text()).toContain('整体数据呈上升趋势');
    expect(wrapper.text()).toContain('部分数据差异较大，需要关注');
  });

  it('supports responsive layout', () => {
    const wrapper = mount(DataComparison, {
      props: {
        datasets: [mockDataset1, mockDataset2],
        fields: mockComparisonFields,
        responsive: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElSelect,
          ElButton,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.find('.responsive-comparison').exists()).toBe(true);
  });
});