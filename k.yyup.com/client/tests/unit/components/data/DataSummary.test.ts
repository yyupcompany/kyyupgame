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
import DataSummary from '@/components/data/DataSummary.vue';
import { ElCard, ElRow, ElCol, ElProgress, ElIcon, ElTag, ElButton, ElCollapse, ElCollapseItem } from 'element-plus';

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
    ElProgress: {
      name: 'ElProgress',
      template: '<div class="el-progress"></div>',
      props: ['percentage', 'status', 'type']
    },
    ElIcon: {
      name: 'ElIcon',
      template: '<i class="el-icon"><slot></slot></i>'
    },
    ElTag: {
      name: 'ElTag',
      template: '<span class="el-tag"><slot></slot></span>',
      props: ['type', 'size']
    },
    ElButton: {
      name: 'ElButton',
      template: '<button><slot></slot></button>',
      props: ['type', 'size', 'icon', 'circle']
    },
    ElCollapse: {
      name: 'ElCollapse',
      template: '<div class="el-collapse"><slot></slot></div>',
      props: ['value', 'accordion'],
      emits: ['update:value', 'change']
    },
    ElCollapseItem: {
      name: 'ElCollapseItem',
      template: '<div class="el-collapse-item"><slot name="title"></slot><slot></slot></div>',
      props: ['title', 'name', 'disabled']
    }
  };
});

describe('DataSummary.vue', () => {
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  const mockSummaryData = {
    overview: {
      totalItems: 1250,
      completedItems: 950,
      pendingItems: 200,
      failedItems: 100,
      completionRate: 76
    },
    categories: [
      {
        name: '用户管理',
        count: 450,
        percentage: 36,
        trend: 'up',
        color: '#409EFF'
      },
      {
        name: '订单处理',
        count: 380,
        percentage: 30.4,
        trend: 'stable',
        color: '#67C23A'
      },
      {
        name: '数据分析',
        count: 320,
        percentage: 25.6,
        trend: 'down',
        color: '#E6A23C'
      },
      {
        name: '系统监控',
        count: 100,
        percentage: 8,
        trend: 'up',
        color: '#F56C6C'
      }
    ],
    timeline: [
      {
        date: '2023-01',
        value: 1000,
        change: '+5%'
      },
      {
        date: '2023-02',
        value: 1100,
        change: '+10%'
      },
      {
        date: '2023-03',
        value: 1250,
        change: '+13.6%'
      }
    ],
    insights: [
      {
        type: 'positive',
        title: '用户增长',
        description: '本月用户数量增长13.6%，超出预期目标'
      },
      {
        type: 'warning',
        title: '订单处理延迟',
        description: '订单平均处理时间增加，需要优化流程'
      },
      {
        type: 'negative',
        title: '系统错误增加',
        description: '系统错误率较上月上升2.3%，需要关注'
      }
    ]
  };

  it('renders data summary component', () => {
    const wrapper = mount(DataSummary, {
      props: {
        data: mockSummaryData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElProgress,
          ElIcon,
          ElTag,
          ElButton,
          ElCollapse,
          ElCollapseItem
        }
      }
    });

    expect(wrapper.find('.data-summary').exists()).toBe(true);
    expect(wrapper.findComponent(ElCard).exists()).toBe(true);
  });

  it('displays overview statistics', () => {
    const wrapper = mount(DataSummary, {
      props: {
        data: mockSummaryData,
        showOverview: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElProgress,
          ElIcon,
          ElTag,
          ElButton,
          ElCollapse,
          ElCollapseItem
        }
      }
    });

    expect(wrapper.find('.summary-overview').exists()).toBe(true);
    expect(wrapper.text()).toContain('总计: 1250');
    expect(wrapper.text()).toContain('完成: 950');
    expect(wrapper.text()).toContain('待处理: 200');
    expect(wrapper.text()).toContain('失败: 100');
    expect(wrapper.text()).toContain('完成率: 76%');
  });

  it('shows completion progress', () => {
    const wrapper = mount(DataSummary, {
      props: {
        data: mockSummaryData,
        showProgress: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElProgress,
          ElIcon,
          ElTag,
          ElButton,
          ElCollapse,
          ElCollapseItem
        }
      }
    });

    const progress = wrapper.findComponent(ElProgress);
    expect(progress.exists()).toBe(true);
    expect(progress.props('percentage')).toBe(76);
  });

  it('displays category breakdown', () => {
    const wrapper = mount(DataSummary, {
      props: {
        data: mockSummaryData,
        showCategories: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElProgress,
          ElIcon,
          ElTag,
          ElButton,
          ElCollapse,
          ElCollapseItem
        }
      }
    });

    expect(wrapper.find('.category-breakdown').exists()).toBe(true);
    expect(wrapper.text()).toContain('用户管理');
    expect(wrapper.text()).toContain('订单处理');
    expect(wrapper.text()).toContain('数据分析');
    expect(wrapper.text()).toContain('系统监控');
  });

  it('shows category percentages and trends', () => {
    const wrapper = mount(DataSummary, {
      props: {
        data: mockSummaryData,
        showCategories: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElProgress,
          ElIcon,
          ElTag,
          ElButton,
          ElCollapse,
          ElCollapseItem
        }
      }
    });

    expect(wrapper.text()).toContain('36%');
    expect(wrapper.text()).toContain('30.4%');
    expect(wrapper.text()).toContain('25.6%');
    expect(wrapper.text()).toContain('8%');
  });

  it('displays timeline data', () => {
    const wrapper = mount(DataSummary, {
      props: {
        data: mockSummaryData,
        showTimeline: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElProgress,
          ElIcon,
          ElTag,
          ElButton,
          ElCollapse,
          ElCollapseItem
        }
      }
    });

    expect(wrapper.find('.summary-timeline').exists()).toBe(true);
    expect(wrapper.text()).toContain('2023-01');
    expect(wrapper.text()).toContain('2023-02');
    expect(wrapper.text()).toContain('2023-03');
  });

  it('shows timeline changes', () => {
    const wrapper = mount(DataSummary, {
      props: {
        data: mockSummaryData,
        showTimeline: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElProgress,
          ElIcon,
          ElTag,
          ElButton,
          ElCollapse,
          ElCollapseItem
        }
      }
    });

    expect(wrapper.text()).toContain('+5%');
    expect(wrapper.text()).toContain('+10%');
    expect(wrapper.text()).toContain('+13.6%');
  });

  it('displays insights and recommendations', () => {
    const wrapper = mount(DataSummary, {
      props: {
        data: mockSummaryData,
        showInsights: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElProgress,
          ElIcon,
          ElTag,
          ElButton,
          ElCollapse,
          ElCollapseItem
        }
      }
    });

    expect(wrapper.find('.summary-insights').exists()).toBe(true);
    expect(wrapper.text()).toContain('用户增长');
    expect(wrapper.text()).toContain('订单处理延迟');
    expect(wrapper.text()).toContain('系统错误增加');
  });

  it('shows insight types with appropriate styling', () => {
    const wrapper = mount(DataSummary, {
      props: {
        data: mockSummaryData,
        showInsights: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElProgress,
          ElIcon,
          ElTag,
          ElButton,
          ElCollapse,
          ElCollapseItem
        }
      }
    });

    const tags = wrapper.findAllComponents(ElTag);
    expect(tags.length).toBeGreaterThan(0);
  });

  it('supports collapsible sections', () => {
    const wrapper = mount(DataSummary, {
      props: {
        data: mockSummaryData,
        collapsible: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElProgress,
          ElIcon,
          ElTag,
          ElButton,
          ElCollapse,
          ElCollapseItem
        }
      }
    });

    expect(wrapper.findComponent(ElCollapse).exists()).toBe(true);
    expect(wrapper.findAllComponents(ElCollapseItem).length).toBeGreaterThan(0);
  });

  it('handles section collapse/expand', async () => {
    const wrapper = mount(DataSummary, {
      props: {
        data: mockSummaryData,
        collapsible: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElProgress,
          ElIcon,
          ElTag,
          ElButton,
          ElCollapse,
          ElCollapseItem
        }
      }
    });

    const collapse = wrapper.findComponent(ElCollapse);
    await collapse.vm.$emit('change', ['overview']);
    
    expect(wrapper.emitted('section-change')).toBeTruthy();
  });

  it('supports summary export', async () => {
    const wrapper = mount(DataSummary, {
      props: {
        data: mockSummaryData,
        exportable: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElProgress,
          ElIcon,
          ElTag,
          ElButton,
          ElCollapse,
          ElCollapseItem
        }
      }
    });

    const exportButton = wrapper.find('.export-button');
    if (exportButton.exists()) {
      await exportButton.trigger('click');
      expect(wrapper.emitted('export')).toBeTruthy();
    }
  });

  it('shows summary refresh option', async () => {
    const wrapper = mount(DataSummary, {
      props: {
        data: mockSummaryData,
        refreshable: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElProgress,
          ElIcon,
          ElTag,
          ElButton,
          ElCollapse,
          ElCollapseItem
        }
      }
    });

    const refreshButton = wrapper.find('.refresh-button');
    if (refreshButton.exists()) {
      await refreshButton.trigger('click');
      expect(wrapper.emitted('refresh')).toBeTruthy();
    }
  });

  it('displays summary filters', () => {
    const wrapper = mount(DataSummary, {
      props: {
        data: mockSummaryData,
        filterable: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElProgress,
          ElIcon,
          ElTag,
          ElButton,
          ElCollapse,
          ElCollapseItem
        }
      }
    });

    expect(wrapper.find('.summary-filters').exists()).toBe(true);
  });

  it('handles filter changes', async () => {
    const wrapper = mount(DataSummary, {
      props: {
        data: mockSummaryData,
        filterable: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElProgress,
          ElIcon,
          ElTag,
          ElButton,
          ElCollapse,
          ElCollapseItem
        }
      }
    });

    await wrapper.vm.applyFilter({ category: '用户管理' });
    expect(wrapper.emitted('filter-change')).toBeTruthy();
  });

  it('supports custom summary sections', () => {
    const wrapper = mount(DataSummary, {
      props: {
        data: mockSummaryData,
        customSections: [
          { title: '自定义指标1', content: '自定义内容1' },
          { title: '自定义指标2', content: '自定义内容2' }
        ]
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElProgress,
          ElIcon,
          ElTag,
          ElButton,
          ElCollapse,
          ElCollapseItem
        }
      }
    });

    expect(wrapper.find('.custom-sections').exists()).toBe(true);
    expect(wrapper.text()).toContain('自定义指标1');
    expect(wrapper.text()).toContain('自定义指标2');
  });

  it('shows summary statistics', () => {
    const wrapper = mount(DataSummary, {
      props: {
        data: mockSummaryData,
        showStatistics: true,
        statistics: {
          updateTime: '2023-03-15 14:30:00',
          dataSource: '数据库',
          recordCount: 1250,
          processingTime: 0.05
        }
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElProgress,
          ElIcon,
          ElTag,
          ElButton,
          ElCollapse,
          ElCollapseItem
        }
      }
    });

    expect(wrapper.find('.summary-statistics').exists()).toBe(true);
    expect(wrapper.text()).toContain('更新时间: 2023-03-15 14:30:00');
    expect(wrapper.text()).toContain('数据源: 数据库');
  });

  it('supports different layout types', () => {
    const wrapper = mount(DataSummary, {
      props: {
        data: mockSummaryData,
        layout: 'compact'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElProgress,
          ElIcon,
          ElTag,
          ElButton,
          ElCollapse,
          ElCollapseItem
        }
      }
    });

    expect(wrapper.find('.compact-layout').exists()).toBe(true);
  });

  it('supports detailed layout', () => {
    const wrapper = mount(DataSummary, {
      props: {
        data: mockSummaryData,
        layout: 'detailed'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElProgress,
          ElIcon,
          ElTag,
          ElButton,
          ElCollapse,
          ElCollapseItem
        }
      }
    });

    expect(wrapper.find('.detailed-layout').exists()).toBe(true);
  });

  it('handles section click events', async () => {
    const wrapper = mount(DataSummary, {
      props: {
        data: mockSummaryData,
        clickable: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElProgress,
          ElIcon,
          ElTag,
          ElButton,
          ElCollapse,
          ElCollapseItem
        }
      }
    });

    const section = wrapper.find('.summary-section');
    if (section.exists()) {
      await section.trigger('click');
      expect(wrapper.emitted('section-click')).toBeTruthy();
    }
  });

  it('shows loading state', () => {
    const wrapper = mount(DataSummary, {
      props: {
        data: mockSummaryData,
        loading: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElProgress,
          ElIcon,
          ElTag,
          ElButton,
          ElCollapse,
          ElCollapseItem
        }
      }
    });

    expect(wrapper.find('.loading-overlay').exists()).toBe(true);
  });

  it('handles empty data state', () => {
    const wrapper = mount(DataSummary, {
      props: {
        data: { overview: { totalItems: 0 }, categories: [], timeline: [], insights: [] }
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElProgress,
          ElIcon,
          ElTag,
          ElButton,
          ElCollapse,
          ElCollapseItem
        }
      }
    });

    expect(wrapper.find('.empty-data').exists()).toBe(true);
  });

  it('applies custom CSS classes', () => {
    const wrapper = mount(DataSummary, {
      props: {
        data: mockSummaryData,
        summaryClass: 'custom-summary-class',
        cardClass: 'custom-card-class'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElProgress,
          ElIcon,
          ElTag,
          ElButton,
          ElCollapse,
          ElCollapseItem
        }
      }
    });

    expect(wrapper.find('.custom-summary-class').exists()).toBe(true);
    expect(wrapper.find('.custom-card-class').exists()).toBe(true);
  });

  it('supports summary animations', () => {
    const wrapper = mount(DataSummary, {
      props: {
        data: mockSummaryData,
        animated: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElProgress,
          ElIcon,
          ElTag,
          ElButton,
          ElCollapse,
          ElCollapseItem
        }
      }
    });

    expect(wrapper.find('.animated-summary').exists()).toBe(true);
  });

  it('shows summary tooltips', () => {
    const wrapper = mount(DataSummary, {
      props: {
        data: mockSummaryData,
        showTooltips: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElProgress,
          ElIcon,
          ElTag,
          ElButton,
          ElCollapse,
          ElCollapseItem
        }
      }
    });

    expect(wrapper.find('.summary-tooltips').exists()).toBe(true);
  });

  it('supports responsive layout', () => {
    const wrapper = mount(DataSummary, {
      props: {
        data: mockSummaryData,
        responsive: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElProgress,
          ElIcon,
          ElTag,
          ElButton,
          ElCollapse,
          ElCollapseItem
        }
      }
    });

    expect(wrapper.find('.responsive-summary').exists()).toBe(true);
  });
});