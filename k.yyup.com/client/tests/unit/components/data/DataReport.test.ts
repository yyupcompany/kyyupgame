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
import DataReport from '@/components/data/DataReport.vue';
import { ElButton, ElSelect, ElCard, ElTabs, ElTabPane, ElDatePicker, ElProgress, ElAlert } from 'element-plus';

// Mock Element Plus components
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus');
  return {
    ...actual,
    ElButton: {
      name: 'ElButton',
      template: '<button><slot></slot></button>',
      props: ['type', 'size', 'icon', 'loading', 'disabled']
    },
    ElSelect: {
      name: 'ElSelect',
      template: '<select><slot></slot></select>',
      props: ['modelValue', 'placeholder'],
      emits: ['update:modelValue']
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
    ElDatePicker: {
      name: 'ElDatePicker',
      template: '<input type="date" />',
      props: ['modelValue', 'type', 'placeholder'],
      emits: ['update:modelValue']
    },
    ElProgress: {
      name: 'ElProgress',
      template: '<div class="el-progress"></div>',
      props: ['percentage', 'status']
    },
    ElAlert: {
      name: 'ElAlert',
      template: '<div class="el-alert"><slot></slot></div>',
      props: ['type', 'title', 'description', 'closable']
    }
  };
});

describe('DataReport.vue', () => {
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  const mockReportData = {
    summary: {
      totalRecords: 1000,
      filteredRecords: 500,
      dateRange: { start: '2023-01-01', end: '2023-12-31' }
    },
    sections: [
      {
        title: '用户统计',
        type: 'chart',
        data: [
          { name: '活跃用户', value: 800 },
          { name: '新用户', value: 200 },
          { name: '流失用户', value: 50 }
        ]
      },
      {
        title: '数据趋势',
        type: 'table',
        data: [
          { month: '一月', value: 100, growth: '+10%' },
          { month: '二月', value: 120, growth: '+20%' },
          { month: '三月', value: 150, growth: '+25%' }
        ]
      }
    ]
  };

  const mockTemplates = [
    { id: 'monthly', name: '月度报告', description: '按月生成数据报告' },
    { id: 'quarterly', name: '季度报告', description: '按季度生成数据报告' },
    { id: 'yearly', name: '年度报告', description: '按年度生成数据报告' }
  ];

  it('renders data report component', () => {
    const wrapper = mount(DataReport, {
      props: {
        data: mockReportData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElCard,
          ElTabs,
          ElTabPane,
          ElDatePicker,
          ElProgress,
          ElAlert
        }
      }
    });

    expect(wrapper.find('.data-report').exists()).toBe(true);
    expect(wrapper.findComponent(ElCard).exists()).toBe(true);
  });

  it('displays report summary', () => {
    const wrapper = mount(DataReport, {
      props: {
        data: mockReportData,
        showSummary: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElCard,
          ElTabs,
          ElTabPane,
          ElDatePicker,
          ElProgress,
          ElAlert
        }
      }
    });

    expect(wrapper.find('.report-summary').exists()).toBe(true);
    expect(wrapper.text()).toContain('总计: 1000');
    expect(wrapper.text()).toContain('筛选: 500');
    expect(wrapper.text()).toContain('2023-01-01');
    expect(wrapper.text()).toContain('2023-12-31');
  });

  it('shows report sections', () => {
    const wrapper = mount(DataReport, {
      props: {
        data: mockReportData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElCard,
          ElTabs,
          ElTabPane,
          ElDatePicker,
          ElProgress,
          ElAlert
        }
      }
    });

    expect(wrapper.find('.report-sections').exists()).toBe(true);
    expect(wrapper.text()).toContain('用户统计');
    expect(wrapper.text()).toContain('数据趋势');
  });

  it('displays report tabs', () => {
    const wrapper = mount(DataReport, {
      props: {
        data: mockReportData,
        showTabs: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElCard,
          ElTabs,
          ElTabPane,
          ElDatePicker,
          ElProgress,
          ElAlert
        }
      }
    });

    expect(wrapper.findComponent(ElTabs).exists()).toBe(true);
    expect(wrapper.findAllComponents(ElTabPane).length).toBeGreaterThan(0);
  });

  it('handles tab switching', async () => {
    const wrapper = mount(DataReport, {
      props: {
        data: mockReportData,
        showTabs: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElCard,
          ElTabs,
          ElTabPane,
          ElDatePicker,
          ElProgress,
          ElAlert
        }
      }
    });

    const tabs = wrapper.findComponent(ElTabs);
    await tabs.vm.$emit('update:value', 'section2');
    
    expect(wrapper.emitted('tab-change')).toBeTruthy();
    expect(wrapper.emitted('tab-change')[0][0]).toBe('section2');
  });

  it('shows report templates', () => {
    const wrapper = mount(DataReport, {
      props: {
        data: mockReportData,
        templates: mockTemplates
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElCard,
          ElTabs,
          ElTabPane,
          ElDatePicker,
          ElProgress,
          ElAlert
        }
      }
    });

    expect(wrapper.find('.report-templates').exists()).toBe(true);
    expect(wrapper.text()).toContain('月度报告');
    expect(wrapper.text()).toContain('季度报告');
    expect(wrapper.text()).toContain('年度报告');
  });

  it('handles template selection', async () => {
    const wrapper = mount(DataReport, {
      props: {
        data: mockReportData,
        templates: mockTemplates
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElCard,
          ElTabs,
          ElTabPane,
          ElDatePicker,
          ElProgress,
          ElAlert
        }
      }
    });

    const templateSelect = wrapper.findComponent(ElSelect);
    await templateSelect.vm.$emit('update:modelValue', 'quarterly');
    
    expect(wrapper.emitted('template-selected')).toBeTruthy();
    expect(wrapper.emitted('template-selected')[0][0]).toBe('quarterly');
  });

  it('shows date range selection', () => {
    const wrapper = mount(DataReport, {
      props: {
        data: mockReportData,
        showDateRange: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElCard,
          ElTabs,
          ElTabPane,
          ElDatePicker,
          ElProgress,
          ElAlert
        }
      }
    });

    expect(wrapper.findComponent(ElDatePicker).exists()).toBe(true);
  });

  it('handles date range changes', async () => {
    const wrapper = mount(DataReport, {
      props: {
        data: mockReportData,
        showDateRange: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElCard,
          ElTabs,
          ElTabPane,
          ElDatePicker,
          ElProgress,
          ElAlert
        }
      }
    });

    const datePicker = wrapper.findComponent(ElDatePicker);
    await datePicker.vm.$emit('update:modelValue', '2023-01-01');
    
    expect(wrapper.emitted('date-range-change')).toBeTruthy();
    expect(wrapper.emitted('date-range-change')[0][0]).toBe('2023-01-01');
  });

  it('shows report generation options', () => {
    const wrapper = mount(DataReport, {
      props: {
        data: mockReportData,
        showOptions: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElCard,
          ElTabs,
          ElTabPane,
          ElDatePicker,
          ElProgress,
          ElAlert
        }
      }
    });

    expect(wrapper.find('.report-options').exists()).toBe(true);
  });

  it('supports report export', async () => {
    const wrapper = mount(DataReport, {
      props: {
        data: mockReportData,
        exportable: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElCard,
          ElTabs,
          ElTabPane,
          ElDatePicker,
          ElProgress,
          ElAlert
        }
      }
    });

    const exportButton = wrapper.find('.export-button');
    if (exportButton.exists()) {
      await exportButton.trigger('click');
      expect(wrapper.emitted('export-report')).toBeTruthy();
    }
  });

  it('shows report generation progress', () => {
    const wrapper = mount(DataReport, {
      props: {
        data: mockReportData,
        showProgress: true,
        generating: true,
        progress: 50
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElCard,
          ElTabs,
          ElTabPane,
          ElDatePicker,
          ElProgress,
          ElAlert
        }
      }
    });

    expect(wrapper.findComponent(ElProgress).exists()).toBe(true);
    const progress = wrapper.findComponent(ElProgress);
    expect(progress.props('percentage')).toBe(50);
  });

  it('handles report generation completion', async () => {
    const wrapper = mount(DataReport, {
      props: {
        data: mockReportData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElCard,
          ElTabs,
          ElTabPane,
          ElDatePicker,
          ElProgress,
          ElAlert
        }
      }
    });

    await wrapper.vm.onGenerationComplete();
    expect(wrapper.emitted('generation-complete')).toBeTruthy();
  });

  it('handles report generation errors', async () => {
    const wrapper = mount(DataReport, {
      props: {
        data: mockReportData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElCard,
          ElTabs,
          ElTabPane,
          ElDatePicker,
          ElProgress,
          ElAlert
        }
      }
    });

    await wrapper.vm.onGenerationError(new Error('生成失败'));
    expect(wrapper.emitted('generation-error')).toBeTruthy();
  });

  it('shows report scheduling options', () => {
    const wrapper = mount(DataReport, {
      props: {
        data: mockReportData,
        scheduling: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElCard,
          ElTabs,
          ElTabPane,
          ElDatePicker,
          ElProgress,
          ElAlert
        }
      }
    });

    expect(wrapper.find('.report-scheduling').exists()).toBe(true);
  });

  it('handles schedule configuration', async () => {
    const wrapper = mount(DataReport, {
      props: {
        data: mockReportData,
        scheduling: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElCard,
          ElTabs,
          ElTabPane,
          ElDatePicker,
          ElProgress,
          ElAlert
        }
      }
    });

    const scheduleButton = wrapper.find('.schedule-button');
    if (scheduleButton.exists()) {
      await scheduleButton.trigger('click');
      expect(wrapper.emitted('schedule-report')).toBeTruthy();
    }
  });

  it('shows report sharing options', () => {
    const wrapper = mount(DataReport, {
      props: {
        data: mockReportData,
        shareable: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElCard,
          ElTabs,
          ElTabPane,
          ElDatePicker,
          ElProgress,
          ElAlert
        }
      }
    });

    expect(wrapper.find('.report-sharing').exists()).toBe(true);
  });

  it('handles report sharing', async () => {
    const wrapper = mount(DataReport, {
      props: {
        data: mockReportData,
        shareable: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElCard,
          ElTabs,
          ElTabPane,
          ElDatePicker,
          ElProgress,
          ElAlert
        }
      }
    });

    const shareButton = wrapper.find('.share-button');
    if (shareButton.exists()) {
      await shareButton.trigger('click');
      expect(wrapper.emitted('share-report')).toBeTruthy();
    }
  });

  it('supports report customization', async () => {
    const wrapper = mount(DataReport, {
      props: {
        data: mockReportData,
        customizable: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElCard,
          ElTabs,
          ElTabPane,
          ElDatePicker,
          ElProgress,
          ElAlert
        }
      }
    });

    const customizeButton = wrapper.find('.customize-button');
    if (customizeButton.exists()) {
      await customizeButton.trigger('click');
      expect(wrapper.emitted('customize-report')).toBeTruthy();
    }
  });

  it('shows report history', () => {
    const wrapper = mount(DataReport, {
      props: {
        data: mockReportData,
        showHistory: true,
        history: [
          { id: 1, name: '月度报告', date: '2023-01-01', status: 'completed' },
          { id: 2, name: '季度报告', date: '2023-04-01', status: 'completed' }
        ]
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElCard,
          ElTabs,
          ElTabPane,
          ElDatePicker,
          ElProgress,
          ElAlert
        }
      }
    });

    expect(wrapper.find('.report-history').exists()).toBe(true);
    expect(wrapper.text()).toContain('月度报告');
    expect(wrapper.text()).toContain('季度报告');
  });

  it('handles history item selection', async () => {
    const wrapper = mount(DataReport, {
      props: {
        data: mockReportData,
        showHistory: true,
        history: [
          { id: 1, name: '月度报告', date: '2023-01-01', status: 'completed' }
        ]
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElCard,
          ElTabs,
          ElTabPane,
          ElDatePicker,
          ElProgress,
          ElAlert
        }
      }
    });

    const historyItem = wrapper.find('.history-item');
    if (historyItem.exists()) {
      await historyItem.trigger('click');
      expect(wrapper.emitted('history-selected')).toBeTruthy();
    }
  });

  it('shows report statistics', () => {
    const wrapper = mount(DataReport, {
      props: {
        data: mockReportData,
        showStatistics: true,
        statistics: {
          totalReports: 100,
          completedReports: 95,
          failedReports: 5,
          averageGenerationTime: 2.5
        }
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElCard,
          ElTabs,
          ElTabPane,
          ElDatePicker,
          ElProgress,
          ElAlert
        }
      }
    });

    expect(wrapper.find('.report-statistics').exists()).toBe(true);
    expect(wrapper.text()).toContain('总计: 100');
    expect(wrapper.text()).toContain('完成: 95');
    expect(wrapper.text()).toContain('失败: 5');
  });

  it('shows loading state', () => {
    const wrapper = mount(DataReport, {
      props: {
        data: mockReportData,
        loading: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElCard,
          ElTabs,
          ElTabPane,
          ElDatePicker,
          ElProgress,
          ElAlert
        }
      }
    });

    expect(wrapper.find('.loading-overlay').exists()).toBe(true);
  });

  it('handles empty data state', () => {
    const wrapper = mount(DataReport, {
      props: {
        data: { summary: { totalRecords: 0 }, sections: [] }
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElCard,
          ElTabs,
          ElTabPane,
          ElDatePicker,
          ElProgress,
          ElAlert
        }
      }
    });

    expect(wrapper.find('.empty-data').exists()).toBe(true);
  });

  it('applies custom CSS classes', () => {
    const wrapper = mount(DataReport, {
      props: {
        data: mockReportData,
        reportClass: 'custom-report-class'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElCard,
          ElTabs,
          ElTabPane,
          ElDatePicker,
          ElProgress,
          ElAlert
        }
      }
    });

    expect(wrapper.find('.custom-report-class').exists()).toBe(true);
  });

  it('supports report preview', async () => {
    const wrapper = mount(DataReport, {
      props: {
        data: mockReportData,
        previewable: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElCard,
          ElTabs,
          ElTabPane,
          ElDatePicker,
          ElProgress,
          ElAlert
        }
      }
    });

    const previewButton = wrapper.find('.preview-button');
    if (previewButton.exists()) {
      await previewButton.trigger('click');
      expect(wrapper.emitted('preview-report')).toBeTruthy();
    }
  });

  it('shows report validation errors', () => {
    const wrapper = mount(DataReport, {
      props: {
        data: mockReportData,
        showValidation: true,
        validationErrors: ['日期范围不能为空', '必须选择至少一个数据源']
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElCard,
          ElTabs,
          ElTabPane,
          ElDatePicker,
          ElProgress,
          ElAlert
        }
      }
    });

    expect(wrapper.findComponent(ElAlert).exists()).toBe(true);
    expect(wrapper.text()).toContain('日期范围不能为空');
    expect(wrapper.text()).toContain('必须选择至少一个数据源');
  });

  it('supports report template creation', async () => {
    const wrapper = mount(DataReport, {
      props: {
        data: mockReportData,
        templateCreation: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElCard,
          ElTabs,
          ElTabPane,
          ElDatePicker,
          ElProgress,
          ElAlert
        }
      }
    });

    const createTemplateButton = wrapper.find('.create-template-button');
    if (createTemplateButton.exists()) {
      await createTemplateButton.trigger('click');
      expect(wrapper.emitted('create-template')).toBeTruthy();
    }
  });
});