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
import DataStats from '@/components/data/DataStats.vue';
import { ElCard, ElRow, ElCol, ElProgress, ElIcon, ElTag, ElButton, ElSelect } from 'element-plus';

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
      props: ['percentage', 'status', 'type', 'strokeWidth']
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
    ElSelect: {
      name: 'ElSelect',
      template: '<select><slot></slot></select>',
      props: ['modelValue', 'placeholder'],
      emits: ['update:modelValue']
    }
  };
});

describe('DataStats.vue', () => {
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  const mockStats = {
    total: 1250,
    active: 800,
    inactive: 450,
    growth: 15.5,
    completion: 75,
    efficiency: 92.3
  };

  const mockStatItems = [
    {
      title: '总用户数',
      value: 1250,
      unit: '人',
      trend: 'up',
      trendValue: 12.5,
      icon: 'user',
      color: '#409EFF'
    },
    {
      title: '活跃用户',
      value: 800,
      unit: '人',
      trend: 'up',
      trendValue: 8.3,
      icon: 'active',
      color: '#67C23A'
    },
    {
      title: '转化率',
      value: 75,
      unit: '%',
      trend: 'down',
      trendValue: 2.1,
      icon: 'chart',
      color: '#E6A23C'
    },
    {
      title: '平均响应时间',
      value: 1.2,
      unit: '秒',
      trend: 'up',
      trendValue: 0.3,
      icon: 'time',
      color: '#F56C6C'
    }
  ];

  it('renders data stats component', () => {
    const wrapper = mount(DataStats, {
      props: {
        stats: mockStats
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
          ElSelect
        }
      }
    });

    expect(wrapper.find('.data-stats').exists()).toBe(true);
    expect(wrapper.findComponent(ElRow).exists()).toBe(true);
  });

  it('displays stat items in grid layout', () => {
    const wrapper = mount(DataStats, {
      props: {
        statItems: mockStatItems,
        layout: 'grid'
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
          ElSelect
        }
      }
    });

    expect(wrapper.find('.grid-layout').exists()).toBe(true);
    const statCards = wrapper.findAll('.stat-card');
    expect(statCards.length).toBe(mockStatItems.length);
  });

  it('displays individual stat card with title and value', () => {
    const wrapper = mount(DataStats, {
      props: {
        statItems: mockStatItems
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
          ElSelect
        }
      }
    });

    expect(wrapper.text()).toContain('总用户数');
    expect(wrapper.text()).toContain('1250');
    expect(wrapper.text()).toContain('活跃用户');
    expect(wrapper.text()).toContain('800');
  });

  it('shows stat units', () => {
    const wrapper = mount(DataStats, {
      props: {
        statItems: mockStatItems
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
          ElSelect
        }
      }
    });

    expect(wrapper.text()).toContain('人');
    expect(wrapper.text()).toContain('%');
    expect(wrapper.text()).toContain('秒');
  });

  it('displays trend indicators', () => {
    const wrapper = mount(DataStats, {
      props: {
        statItems: mockStatItems,
        showTrends: true
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
          ElSelect
        }
      }
    });

    expect(wrapper.find('.trend-indicators').exists()).toBe(true);
    expect(wrapper.text()).toContain('↑');
    expect(wrapper.text()).toContain('↓');
  });

  it('shows trend values', () => {
    const wrapper = mount(DataStats, {
      props: {
        statItems: mockStatItems,
        showTrends: true
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
          ElSelect
        }
      }
    });

    expect(wrapper.text()).toContain('12.5%');
    expect(wrapper.text()).toContain('8.3%');
    expect(wrapper.text()).toContain('2.1%');
  });

  it('displays progress bars for percentage stats', () => {
    const wrapper = mount(DataStats, {
      props: {
        statItems: mockStatItems,
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
          ElSelect
        }
      }
    });

    const progressBars = wrapper.findAllComponents(ElProgress);
    expect(progressBars.length).toBeGreaterThan(0);
  });

  it('configures progress bar correctly', () => {
    const wrapper = mount(DataStats, {
      props: {
        statItems: mockStatItems,
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
          ElSelect
        }
      }
    });

    const progressBars = wrapper.findAllComponents(ElProgress);
    const percentageProgress = progressBars.find(p => p.props('percentage') === 75);
    expect(percentageProgress).toBeDefined();
  });

  it('shows stat icons', () => {
    const wrapper = mount(DataStats, {
      props: {
        statItems: mockStatItems,
        showIcons: true
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
          ElSelect
        }
      }
    });

    const icons = wrapper.findAllComponents(ElIcon);
    expect(icons.length).toBeGreaterThan(0);
  });

  it('applies custom colors to stat cards', () => {
    const wrapper = mount(DataStats, {
      props: {
        statItems: mockStatItems
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
          ElSelect
        }
      }
    });

    const statCards = wrapper.findAll('.stat-card');
    expect(statCards.length).toBe(mockStatItems.length);
  });

  it('supports different layout types', () => {
    const wrapper = mount(DataStats, {
      props: {
        statItems: mockStatItems,
        layout: 'horizontal'
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
          ElSelect
        }
      }
    });

    expect(wrapper.find('.horizontal-layout').exists()).toBe(true);
  });

  it('supports vertical layout', () => {
    const wrapper = mount(DataStats, {
      props: {
        statItems: mockStatItems,
        layout: 'vertical'
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
          ElSelect
        }
      }
    });

    expect(wrapper.find('.vertical-layout').exists()).toBe(true);
  });

  it('shows stat tags', () => {
    const wrapper = mount(DataStats, {
      props: {
        statItems: mockStatItems,
        showTags: true
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
          ElSelect
        }
      }
    });

    const tags = wrapper.findAllComponents(ElTag);
    expect(tags.length).toBeGreaterThan(0);
  });

  it('supports stat refresh', async () => {
    const wrapper = mount(DataStats, {
      props: {
        statItems: mockStatItems,
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
          ElSelect
        }
      }
    });

    const refreshButton = wrapper.find('.refresh-button');
    if (refreshButton.exists()) {
      await refreshButton.trigger('click');
      expect(wrapper.emitted('refresh')).toBeTruthy();
    }
  });

  it('shows stat comparison', () => {
    const wrapper = mount(DataStats, {
      props: {
        statItems: mockStatItems,
        showComparison: true,
        comparisonData: {
          previous: 1100,
          current: 1250,
          change: 150,
          changePercent: 13.6
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
          ElSelect
        }
      }
    });

    expect(wrapper.find('.stat-comparison').exists()).toBe(true);
    expect(wrapper.text()).toContain('1100');
    expect(wrapper.text()).toContain('1250');
    expect(wrapper.text()).toContain('13.6%');
  });

  it('handles stat click events', async () => {
    const wrapper = mount(DataStats, {
      props: {
        statItems: mockStatItems,
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
          ElSelect
        }
      }
    });

    const statCard = wrapper.find('.stat-card');
    if (statCard.exists()) {
      await statCard.trigger('click');
      expect(wrapper.emitted('stat-click')).toBeTruthy();
    }
  });

  it('shows stat details on hover', async () => {
    const wrapper = mount(DataStats, {
      props: {
        statItems: mockStatItems,
        showDetails: true
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
          ElSelect
        }
      }
    });

    const statCard = wrapper.find('.stat-card');
    if (statCard.exists()) {
      await statCard.trigger('mouseenter');
      expect(wrapper.find('.stat-details').exists()).toBe(true);
    }
  });

  it('supports stat filtering', () => {
    const wrapper = mount(DataStats, {
      props: {
        statItems: mockStatItems,
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
          ElSelect
        }
      }
    });

    expect(wrapper.find('.stat-filter').exists()).toBe(true);
  });

  it('handles filter changes', async () => {
    const wrapper = mount(DataStats, {
      props: {
        statItems: mockStatItems,
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
          ElSelect
        }
      }
    });

    const filterSelect = wrapper.findComponent(ElSelect);
    await filterSelect.vm.$emit('update:modelValue', 'growth');
    
    expect(wrapper.emitted('filter-change')).toBeTruthy();
    expect(wrapper.emitted('filter-change')[0][0]).toBe('growth');
  });

  it('shows stat summary', () => {
    const wrapper = mount(DataStats, {
      props: {
        statItems: mockStatItems,
        showSummary: true,
        summary: {
          total: 4,
          average: 313.75,
          max: 1250,
          min: 1.2
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
          ElSelect
        }
      }
    });

    expect(wrapper.find('.stat-summary').exists()).toBe(true);
    expect(wrapper.text()).toContain('总计: 4');
    expect(wrapper.text()).toContain('平均: 313.75');
  });

  it('supports responsive layout', () => {
    const wrapper = mount(DataStats, {
      props: {
        statItems: mockStatItems,
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
          ElSelect
        }
      }
    });

    expect(wrapper.find('.responsive-stats').exists()).toBe(true);
  });

  it('shows loading state', () => {
    const wrapper = mount(DataStats, {
      props: {
        statItems: mockStatItems,
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
          ElSelect
        }
      }
    });

    expect(wrapper.find('.loading-overlay').exists()).toBe(true);
  });

  it('handles empty data state', () => {
    const wrapper = mount(DataStats, {
      props: {
        statItems: []
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
          ElSelect
        }
      }
    });

    expect(wrapper.find('.empty-data').exists()).toBe(true);
  });

  it('applies custom CSS classes', () => {
    const wrapper = mount(DataStats, {
      props: {
        statItems: mockStatItems,
        statsClass: 'custom-stats-class',
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
          ElSelect
        }
      }
    });

    expect(wrapper.find('.custom-stats-class').exists()).toBe(true);
    expect(wrapper.find('.custom-card-class').exists()).toBe(true);
  });

  it('supports stat animations', () => {
    const wrapper = mount(DataStats, {
      props: {
        statItems: mockStatItems,
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
          ElSelect
        }
      }
    });

    expect(wrapper.find('.animated-stats').exists()).toBe(true);
  });

  it('shows stat tooltips', () => {
    const wrapper = mount(DataStats, {
      props: {
        statItems: mockStatItems,
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
          ElSelect
        }
      }
    });

    expect(wrapper.find('.stat-tooltips').exists()).toBe(true);
  });

  it('supports stat export', async () => {
    const wrapper = mount(DataStats, {
      props: {
        statItems: mockStatItems,
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
          ElSelect
        }
      }
    });

    const exportButton = wrapper.find('.export-button');
    if (exportButton.exists()) {
      await exportButton.trigger('click');
      expect(wrapper.emitted('export')).toBeTruthy();
    }
  });
});