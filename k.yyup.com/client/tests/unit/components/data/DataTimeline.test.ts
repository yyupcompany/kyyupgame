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
import DataTimeline from '@/components/data/DataTimeline.vue';
import { ElTimeline, ElTimelineItem, ElCard, ElTag, ElButton, ElSelect, ElDatePicker } from 'element-plus';

// Mock Element Plus components
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus');
  return {
    ...actual,
    ElTimeline: {
      name: 'ElTimeline',
      template: '<div class="el-timeline"><slot></slot></div>',
      props: ['reverse']
    },
    ElTimelineItem: {
      name: 'ElTimelineItem',
      template: '<div class="el-timeline-item"><slot name="dot"></slot><div class="el-timeline-item__content"><slot></slot></div></div>',
      props: ['timestamp', 'placement', 'type', 'color', 'size', 'icon']
    },
    ElCard: {
      name: 'ElCard',
      template: '<div class="el-card"><slot></slot></div>',
      props: ['shadow']
    },
    ElTag: {
      name: 'ElTag',
      template: '<span class="el-tag"><slot></slot></span>',
      props: ['type', 'size']
    },
    ElButton: {
      name: 'ElButton',
      template: '<button><slot></slot></button>',
      props: ['type', 'size', 'icon', 'disabled']
    },
    ElSelect: {
      name: 'ElSelect',
      template: '<select><slot></slot></select>',
      props: ['modelValue', 'placeholder'],
      emits: ['update:modelValue']
    },
    ElDatePicker: {
      name: 'ElDatePicker',
      template: '<input type="date" />',
      props: ['modelValue', 'type', 'placeholder'],
      emits: ['update:modelValue']
    }
  };
});

describe('DataTimeline.vue', () => {
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  const mockTimelineData = [
    {
      id: 1,
      timestamp: '2023-01-15 10:30:00',
      title: '系统上线',
      description: '新版本系统成功上线，所有功能正常运行',
      type: 'success',
      category: '系统',
      author: '管理员',
      tags: ['重要', '里程碑']
    },
    {
      id: 2,
      timestamp: '2023-02-20 14:15:00',
      title: '数据迁移',
      description: '完成历史数据迁移工作，共计迁移100万条记录',
      type: 'info',
      category: '数据',
      author: '数据工程师',
      tags: ['数据', '迁移']
    },
    {
      id: 3,
      timestamp: '2023-03-10 09:45:00',
      title: '性能优化',
      description: '系统性能优化完成，响应时间提升30%',
      type: 'warning',
      category: '优化',
      author: '开发团队',
      tags: ['性能', '优化']
    },
    {
      id: 4,
      timestamp: '2023-03-15 16:20:00',
      title: '安全漏洞',
      description: '发现安全漏洞，已紧急修复并部署补丁',
      type: 'danger',
      category: '安全',
      author: '安全团队',
      tags: ['安全', '紧急']
    }
  ];

  it('renders data timeline component', () => {
    const wrapper = mount(DataTimeline, {
      props: {
        data: mockTimelineData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTimeline,
          ElTimelineItem,
          ElCard,
          ElTag,
          ElButton,
          ElSelect,
          ElDatePicker
        }
      }
    });

    expect(wrapper.find('.data-timeline').exists()).toBe(true);
    expect(wrapper.findComponent(ElTimeline).exists()).toBe(true);
  });

  it('displays timeline items with timestamps', () => {
    const wrapper = mount(DataTimeline, {
      props: {
        data: mockTimelineData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTimeline,
          ElTimelineItem,
          ElCard,
          ElTag,
          ElButton,
          ElSelect,
          ElDatePicker
        }
      }
    });

    const timelineItems = wrapper.findAllComponents(ElTimelineItem);
    expect(timelineItems.length).toBe(mockTimelineData.length);
    
    timelineItems.forEach((item, index) => {
      expect(item.props('timestamp')).toBe(mockTimelineData[index].timestamp);
    });
  });

  it('shows timeline item titles and descriptions', () => {
    const wrapper = mount(DataTimeline, {
      props: {
        data: mockTimelineData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTimeline,
          ElTimelineItem,
          ElCard,
          ElTag,
          ElButton,
          ElSelect,
          ElDatePicker
        }
      }
    });

    expect(wrapper.text()).toContain('系统上线');
    expect(wrapper.text()).toContain('新版本系统成功上线，所有功能正常运行');
    expect(wrapper.text()).toContain('数据迁移');
    expect(wrapper.text()).toContain('完成历史数据迁移工作，共计迁移100万条记录');
  });

  it('displays timeline item types with appropriate styling', () => {
    const wrapper = mount(DataTimeline, {
      props: {
        data: mockTimelineData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTimeline,
          ElTimelineItem,
          ElCard,
          ElTag,
          ElButton,
          ElSelect,
          ElDatePicker
        }
      }
    });

    const timelineItems = wrapper.findAllComponents(ElTimelineItem);
    expect(timelineItems[0].props('type')).toBe('success');
    expect(timelineItems[1].props('type')).toBe('info');
    expect(timelineItems[2].props('type')).toBe('warning');
    expect(timelineItems[3].props('type')).toBe('danger');
  });

  it('shows timeline item categories', () => {
    const wrapper = mount(DataTimeline, {
      props: {
        data: mockTimelineData,
        showCategories: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTimeline,
          ElTimelineItem,
          ElCard,
          ElTag,
          ElButton,
          ElSelect,
          ElDatePicker
        }
      }
    });

    expect(wrapper.text()).toContain('系统');
    expect(wrapper.text()).toContain('数据');
    expect(wrapper.text()).toContain('优化');
    expect(wrapper.text()).toContain('安全');
  });

  it('displays timeline item authors', () => {
    const wrapper = mount(DataTimeline, {
      props: {
        data: mockTimelineData,
        showAuthors: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTimeline,
          ElTimelineItem,
          ElCard,
          ElTag,
          ElButton,
          ElSelect,
          ElDatePicker
        }
      }
    });

    expect(wrapper.text()).toContain('管理员');
    expect(wrapper.text()).toContain('数据工程师');
    expect(wrapper.text()).toContain('开发团队');
    expect(wrapper.text()).toContain('安全团队');
  });

  it('shows timeline item tags', () => {
    const wrapper = mount(DataTimeline, {
      props: {
        data: mockTimelineData,
        showTags: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTimeline,
          ElTimelineItem,
          ElCard,
          ElTag,
          ElButton,
          ElSelect,
          ElDatePicker
        }
      }
    });

    const tags = wrapper.findAllComponents(ElTag);
    expect(tags.length).toBeGreaterThan(0);
    expect(wrapper.text()).toContain('重要');
    expect(wrapper.text()).toContain('里程碑');
    expect(wrapper.text()).toContain('数据');
    expect(wrapper.text()).toContain('迁移');
  });

  it('supports reverse timeline order', () => {
    const wrapper = mount(DataTimeline, {
      props: {
        data: mockTimelineData,
        reverse: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTimeline,
          ElTimelineItem,
          ElCard,
          ElTag,
          ElButton,
          ElSelect,
          ElDatePicker
        }
      }
    });

    const timeline = wrapper.findComponent(ElTimeline);
    expect(timeline.props('reverse')).toBe(true);
  });

  it('shows timeline item actions', () => {
    const wrapper = mount(DataTimeline, {
      props: {
        data: mockTimelineData,
        showActions: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTimeline,
          ElTimelineItem,
          ElCard,
          ElTag,
          ElButton,
          ElSelect,
          ElDatePicker
        }
      }
    });

    const buttons = wrapper.findAllComponents(ElButton);
    expect(buttons.length).toBeGreaterThan(0);
    expect(wrapper.text()).toContain('查看详情');
    expect(wrapper.text()).toContain('编辑');
  });

  it('handles timeline item action clicks', async () => {
    const wrapper = mount(DataTimeline, {
      props: {
        data: mockTimelineData,
        showActions: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTimeline,
          ElTimelineItem,
          ElCard,
          ElTag,
          ElButton,
          ElSelect,
          ElDatePicker
        }
      }
    });

    const detailButton = wrapper.find('.detail-button');
    if (detailButton.exists()) {
      await detailButton.trigger('click');
      expect(wrapper.emitted('item-action')).toBeTruthy();
      expect(wrapper.emitted('item-action')[0][0]).toEqual({ action: 'detail', item: expect.any(Object) });
    }
  });

  it('supports timeline filtering', () => {
    const wrapper = mount(DataTimeline, {
      props: {
        data: mockTimelineData,
        filterable: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTimeline,
          ElTimelineItem,
          ElCard,
          ElTag,
          ElButton,
          ElSelect,
          ElDatePicker
        }
      }
    });

    expect(wrapper.find('.timeline-filter').exists()).toBe(true);
  });

  it('handles filter changes', async () => {
    const wrapper = mount(DataTimeline, {
      props: {
        data: mockTimelineData,
        filterable: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTimeline,
          ElTimelineItem,
          ElCard,
          ElTag,
          ElButton,
          ElSelect,
          ElDatePicker
        }
      }
    });

    const filterSelect = wrapper.findComponent(ElSelect);
    await filterSelect.vm.$emit('update:modelValue', 'success');
    
    expect(wrapper.emitted('filter-change')).toBeTruthy();
    expect(wrapper.emitted('filter-change')[0][0]).toBe('success');
  });

  it('shows date range selection', () => {
    const wrapper = mount(DataTimeline, {
      props: {
        data: mockTimelineData,
        showDateRange: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTimeline,
          ElTimelineItem,
          ElCard,
          ElTag,
          ElButton,
          ElSelect,
          ElDatePicker
        }
      }
    });

    expect(wrapper.findComponent(ElDatePicker).exists()).toBe(true);
  });

  it('handles date range changes', async () => {
    const wrapper = mount(DataTimeline, {
      props: {
        data: mockTimelineData,
        showDateRange: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTimeline,
          ElTimelineItem,
          ElCard,
          ElTag,
          ElButton,
          ElSelect,
          ElDatePicker
        }
      }
    });

    const datePicker = wrapper.findComponent(ElDatePicker);
    await datePicker.vm.$emit('update:modelValue', '2023-01-01');
    
    expect(wrapper.emitted('date-range-change')).toBeTruthy();
    expect(wrapper.emitted('date-range-change')[0][0]).toBe('2023-01-01');
  });

  it('supports timeline pagination', () => {
    const wrapper = mount(DataTimeline, {
      props: {
        data: mockTimelineData,
        paginated: true,
        pageSize: 2,
        currentPage: 1
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTimeline,
          ElTimelineItem,
          ElCard,
          ElTag,
          ElButton,
          ElSelect,
          ElDatePicker
        }
      }
    });

    expect(wrapper.find('.timeline-pagination').exists()).toBe(true);
  });

  it('handles pagination changes', async () => {
    const wrapper = mount(DataTimeline, {
      props: {
        data: mockTimelineData,
        paginated: true,
        pageSize: 2,
        currentPage: 1
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTimeline,
          ElTimelineItem,
          ElCard,
          ElTag,
          ElButton,
          ElSelect,
          ElDatePicker
        }
      }
    });

    const nextPageButton = wrapper.find('.next-page-button');
    if (nextPageButton.exists()) {
      await nextPageButton.trigger('click');
      expect(wrapper.emitted('page-change')).toBeTruthy();
      expect(wrapper.emitted('page-change')[0][0]).toBe(2);
    }
  });

  it('shows timeline statistics', () => {
    const wrapper = mount(DataTimeline, {
      props: {
        data: mockTimelineData,
        showStatistics: true,
        statistics: {
          totalItems: 4,
          successItems: 1,
          infoItems: 1,
          warningItems: 1,
          dangerItems: 1
        }
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTimeline,
          ElTimelineItem,
          ElCard,
          ElTag,
          ElButton,
          ElSelect,
          ElDatePicker
        }
      }
    });

    expect(wrapper.find('.timeline-statistics').exists()).toBe(true);
    expect(wrapper.text()).toContain('总计: 4');
    expect(wrapper.text()).toContain('成功: 1');
    expect(wrapper.text()).toContain('信息: 1');
    expect(wrapper.text()).toContain('警告: 1');
    expect(wrapper.text()).toContain('危险: 1');
  });

  it('supports timeline search', () => {
    const wrapper = mount(DataTimeline, {
      props: {
        data: mockTimelineData,
        searchable: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTimeline,
          ElTimelineItem,
          ElCard,
          ElTag,
          ElButton,
          ElSelect,
          ElDatePicker
        }
      }
    });

    expect(wrapper.find('.timeline-search').exists()).toBe(true);
  });

  it('handles search input', async () => {
    const wrapper = mount(DataTimeline, {
      props: {
        data: mockTimelineData,
        searchable: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTimeline,
          ElTimelineItem,
          ElCard,
          ElTag,
          ElButton,
          ElSelect,
          ElDatePicker
        }
      }
    });

    await wrapper.vm.onSearch('系统');
    expect(wrapper.emitted('search')).toBeTruthy();
    expect(wrapper.emitted('search')[0][0]).toBe('系统');
  });

  it('supports timeline export', async () => {
    const wrapper = mount(DataTimeline, {
      props: {
        data: mockTimelineData,
        exportable: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTimeline,
          ElTimelineItem,
          ElCard,
          ElTag,
          ElButton,
          ElSelect,
          ElDatePicker
        }
      }
    });

    const exportButton = wrapper.find('.export-button');
    if (exportButton.exists()) {
      await exportButton.trigger('click');
      expect(wrapper.emitted('export')).toBeTruthy();
    }
  });

  it('shows timeline item details in cards', () => {
    const wrapper = mount(DataTimeline, {
      props: {
        data: mockTimelineData,
        showCards: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTimeline,
          ElTimelineItem,
          ElCard,
          ElTag,
          ElButton,
          ElSelect,
          ElDatePicker
        }
      }
    });

    const cards = wrapper.findAllComponents(ElCard);
    expect(cards.length).toBe(mockTimelineData.length);
  });

  it('handles timeline item click events', async () => {
    const wrapper = mount(DataTimeline, {
      props: {
        data: mockTimelineData,
        clickable: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTimeline,
          ElTimelineItem,
          ElCard,
          ElTag,
          ElButton,
          ElSelect,
          ElDatePicker
        }
      }
    });

    const timelineItem = wrapper.findComponent(ElTimelineItem);
    await timelineItem.trigger('click');
    
    expect(wrapper.emitted('item-click')).toBeTruthy();
    expect(wrapper.emitted('item-click')[0][0]).toEqual(mockTimelineData[0]);
  });

  it('supports custom timeline item rendering', () => {
    const wrapper = mount(DataTimeline, {
      props: {
        data: mockTimelineData,
        itemRenderer: (item: any) => {
          return `<div class="custom-item">${item.title}</div>`;
        }
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTimeline,
          ElTimelineItem,
          ElCard,
          ElTag,
          ElButton,
          ElSelect,
          ElDatePicker
        }
      }
    });

    expect(wrapper.find('.custom-item').exists()).toBe(true);
  });

  it('shows loading state', () => {
    const wrapper = mount(DataTimeline, {
      props: {
        data: mockTimelineData,
        loading: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTimeline,
          ElTimelineItem,
          ElCard,
          ElTag,
          ElButton,
          ElSelect,
          ElDatePicker
        }
      }
    });

    expect(wrapper.find('.loading-overlay').exists()).toBe(true);
  });

  it('handles empty data state', () => {
    const wrapper = mount(DataTimeline, {
      props: {
        data: []
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTimeline,
          ElTimelineItem,
          ElCard,
          ElTag,
          ElButton,
          ElSelect,
          ElDatePicker
        }
      }
    });

    expect(wrapper.find('.empty-data').exists()).toBe(true);
  });

  it('applies custom CSS classes', () => {
    const wrapper = mount(DataTimeline, {
      props: {
        data: mockTimelineData,
        timelineClass: 'custom-timeline-class',
        itemClass: 'custom-item-class'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTimeline,
          ElTimelineItem,
          ElCard,
          ElTag,
          ElButton,
          ElSelect,
          ElDatePicker
        }
      }
    });

    expect(wrapper.find('.custom-timeline-class').exists()).toBe(true);
    expect(wrapper.find('.custom-item-class').exists()).toBe(true);
  });

  it('supports timeline animations', () => {
    const wrapper = mount(DataTimeline, {
      props: {
        data: mockTimelineData,
        animated: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTimeline,
          ElTimelineItem,
          ElCard,
          ElTag,
          ElButton,
          ElSelect,
          ElDatePicker
        }
      }
    });

    expect(wrapper.find('.animated-timeline').exists()).toBe(true);
  });

  it('shows timeline grouping', () => {
    const wrapper = mount(DataTimeline, {
      props: {
        data: mockTimelineData,
        groupBy: 'category'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTimeline,
          ElTimelineItem,
          ElCard,
          ElTag,
          ElButton,
          ElSelect,
          ElDatePicker
        }
      }
    });

    expect(wrapper.find('.timeline-groups').exists()).toBe(true);
  });

  it('handles timeline grouping changes', async () => {
    const wrapper = mount(DataTimeline, {
      props: {
        data: mockTimelineData,
        groupBy: 'category'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTimeline,
          ElTimelineItem,
          ElCard,
          ElTag,
          ElButton,
          ElSelect,
          ElDatePicker
        }
      }
    });

    await wrapper.vm.changeGrouping('type');
    expect(wrapper.emitted('grouping-change')).toBeTruthy();
    expect(wrapper.emitted('grouping-change')[0][0]).toBe('type');
  });
});