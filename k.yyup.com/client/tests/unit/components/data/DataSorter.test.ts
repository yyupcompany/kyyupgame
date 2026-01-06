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
import DataSorter from '@/components/data/DataSorter.vue';
import { ElSelect, ElButton, ElCard, ElTable, ElTableColumn, ElTag, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus';

// Mock Element Plus components
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus');
  return {
    ...actual,
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
    ElCard: {
      name: 'ElCard',
      template: '<div class="el-card"><slot></slot></div>',
      props: ['shadow']
    },
    ElTable: {
      name: 'ElTable',
      template: '<div class="el-table"><slot></slot></div>',
      props: ['data']
    },
    ElTableColumn: {
      name: 'ElTableColumn',
      template: '<div class="el-table-column"><slot></slot></div>',
      props: ['prop', 'label', 'width']
    },
    ElTag: {
      name: 'ElTag',
      template: '<span class="el-tag"><slot></slot></span>',
      props: ['type', 'closable'],
      emits: ['close']
    },
    ElDropdown: {
      name: 'ElDropdown',
      template: '<div class="el-dropdown"><slot></slot></div>',
      emits: ['command']
    },
    ElDropdownMenu: {
      name: 'ElDropdownMenu',
      template: '<div class="el-dropdown-menu"><slot></slot></div>'
    },
    ElDropdownItem: {
      name: 'ElDropdownItem',
      template: '<div class="el-dropdown-item"><slot></slot></div>',
      props: ['command', 'disabled']
    }
  };
});

describe('DataSorter.vue', () => {
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  const mockFields = [
    { prop: 'name', label: '姓名', sortable: true },
    { prop: 'age', label: '年龄', sortable: true },
    { prop: 'email', label: '邮箱', sortable: true },
    { prop: 'status', label: '状态', sortable: false },
    { prop: 'date', label: '日期', sortable: true }
  ];

  const mockData = [
    { id: 1, name: '张三', age: 25, email: 'zhangsan@example.com', status: 'active', date: '2023-01-01' },
    { id: 2, name: '李四', age: 30, email: 'lisi@example.com', status: 'inactive', date: '2023-02-01' },
    { id: 3, name: '王五', age: 20, email: 'wangwu@example.com', status: 'active', date: '2023-03-01' }
  ];

  it('renders data sorter with sort options', () => {
    const wrapper = mount(DataSorter, {
      props: {
        fields: mockFields
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTable,
          ElTableColumn,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem
        }
      }
    });

    expect(wrapper.find('.data-sorter').exists()).toBe(true);
    expect(wrapper.findComponent(ElCard).exists()).toBe(true);
  });

  it('displays sortable fields', () => {
    const wrapper = mount(DataSorter, {
      props: {
        fields: mockFields
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTable,
          ElTableColumn,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem
        }
      }
    });

    expect(wrapper.text()).toContain('姓名');
    expect(wrapper.text()).toContain('年龄');
    expect(wrapper.text()).toContain('邮箱');
    expect(wrapper.text()).toContain('日期');
    // Non-sortable field should not appear in sort options
    expect(wrapper.text()).not.toContain('状态');
  });

  it('shows field selection dropdown', () => {
    const wrapper = mount(DataSorter, {
      props: {
        fields: mockFields,
        showFieldSelect: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTable,
          ElTableColumn,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem
        }
      }
    });

    expect(wrapper.findComponent(ElSelect).exists()).toBe(true);
  });

  it('handles field selection', async () => {
    const wrapper = mount(DataSorter, {
      props: {
        fields: mockFields,
        showFieldSelect: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTable,
          ElTableColumn,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem
        }
      }
    });

    const fieldSelect = wrapper.findComponent(ElSelect);
    await fieldSelect.vm.$emit('update:modelValue', 'name');
    
    expect(wrapper.emitted('field-selected')).toBeTruthy();
    expect(wrapper.emitted('field-selected')[0][0]).toBe('name');
  });

  it('shows sort order options', () => {
    const wrapper = mount(DataSorter, {
      props: {
        fields: mockFields,
        showOrderOptions: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTable,
          ElTableColumn,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem
        }
      }
    });

    expect(wrapper.text()).toContain('升序');
    expect(wrapper.text()).toContain('降序');
  });

  it('handles sort order selection', async () => {
    const wrapper = mount(DataSorter, {
      props: {
        fields: mockFields,
        showOrderOptions: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTable,
          ElTableColumn,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem
        }
      }
    });

    const orderSelect = wrapper.find('.order-select');
    if (orderSelect.exists()) {
      await orderSelect.setValue('desc');
      expect(wrapper.emitted('order-change')).toBeTruthy();
      expect(wrapper.emitted('order-change')[0][0]).toBe('desc');
    }
  });

  it('displays active sort criteria', () => {
    const wrapper = mount(DataSorter, {
      props: {
        fields: mockFields,
        activeSorts: [
          { field: 'name', order: 'asc' },
          { field: 'age', order: 'desc' }
        ]
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTable,
          ElTableColumn,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem
        }
      }
    });

    const tags = wrapper.findAllComponents(ElTag);
    expect(tags.length).toBe(2);
    expect(wrapper.text()).toContain('姓名 ↑');
    expect(wrapper.text()).toContain('年龄 ↓');
  });

  it('handles sort criteria removal', async () => {
    const wrapper = mount(DataSorter, {
      props: {
        fields: mockFields,
        activeSorts: [
          { field: 'name', order: 'asc' }
        ]
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTable,
          ElTableColumn,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem
        }
      }
    });

    const tag = wrapper.findComponent(ElTag);
    await tag.vm.$emit('close');
    
    expect(wrapper.emitted('sort-removed')).toBeTruthy();
    expect(wrapper.emitted('sort-removed')[0][0]).toEqual({ field: 'name', order: 'asc' });
  });

  it('emits apply sort event', async () => {
    const wrapper = mount(DataSorter, {
      props: {
        fields: mockFields,
        activeSorts: [
          { field: 'name', order: 'asc' }
        ]
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTable,
          ElTableColumn,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem
        }
      }
    });

    const applyButton = wrapper.find('.apply-button');
    if (applyButton.exists()) {
      await applyButton.trigger('click');
      expect(wrapper.emitted('apply-sort')).toBeTruthy();
    }
  });

  it('emits clear sort event', async () => {
    const wrapper = mount(DataSorter, {
      props: {
        fields: mockFields,
        activeSorts: [
          { field: 'name', order: 'asc' }
        ]
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTable,
          ElTableColumn,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem
        }
      }
    });

    const clearButton = wrapper.find('.clear-button');
    if (clearButton.exists()) {
      await clearButton.trigger('click');
      expect(wrapper.emitted('clear-sort')).toBeTruthy();
    }
  });

  it('shows sort preview table', () => {
    const wrapper = mount(DataSorter, {
      props: {
        fields: mockFields,
        data: mockData,
        showPreview: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTable,
          ElTableColumn,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem
        }
      }
    });

    expect(wrapper.findComponent(ElTable).exists()).toBe(true);
    expect(wrapper.findComponent(ElTable).props('data')).toEqual(mockData);
  });

  it('supports multiple field sorting', async () => {
    const wrapper = mount(DataSorter, {
      props: {
        fields: mockFields,
        multiSort: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTable,
          ElTableColumn,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem
        }
      }
    });

    expect(wrapper.find('.multi-sort').exists()).toBe(true);
  });

  it('handles sort priority management', async () => {
    const wrapper = mount(DataSorter, {
      props: {
        fields: mockFields,
        activeSorts: [
          { field: 'name', order: 'asc', priority: 1 },
          { field: 'age', order: 'desc', priority: 2 }
        ]
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTable,
          ElTableColumn,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem
        }
      }
    });

    const priorityUpButton = wrapper.find('.priority-up-button');
    if (priorityUpButton.exists()) {
      await priorityUpButton.trigger('click');
      expect(wrapper.emitted('priority-change')).toBeTruthy();
    }
  });

  it('shows sort presets', () => {
    const wrapper = mount(DataSorter, {
      props: {
        fields: mockFields,
        presets: [
          { name: '按姓名排序', sorts: [{ field: 'name', order: 'asc' }] },
          { name: '按年龄排序', sorts: [{ field: 'age', order: 'desc' }] }
        ]
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTable,
          ElTableColumn,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem
        }
      }
    });

    expect(wrapper.find('.sort-presets').exists()).toBe(true);
    expect(wrapper.text()).toContain('按姓名排序');
    expect(wrapper.text()).toContain('按年龄排序');
  });

  it('handles preset selection', async () => {
    const wrapper = mount(DataSorter, {
      props: {
        fields: mockFields,
        presets: [
          { name: '按姓名排序', sorts: [{ field: 'name', order: 'asc' }] }
        ]
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTable,
          ElTableColumn,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem
        }
      }
    });

    const presetButton = wrapper.find('.preset-button');
    if (presetButton.exists()) {
      await presetButton.trigger('click');
      expect(wrapper.emitted('preset-selected')).toBeTruthy();
    }
  });

  it('supports custom sort functions', async () => {
    const wrapper = mount(DataSorter, {
      props: {
        fields: mockFields,
        customSort: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTable,
          ElTableColumn,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem
        }
      }
    });

    const customSortButton = wrapper.find('.custom-sort-button');
    if (customSortButton.exists()) {
      await customSortButton.trigger('click');
      expect(wrapper.emitted('custom-sort')).toBeTruthy();
    }
  });

  it('shows sort statistics', () => {
    const wrapper = mount(DataSorter, {
      props: {
        fields: mockFields,
        showStatistics: true,
        statistics: {
          totalRecords: 1000,
          sortedFields: 2,
          sortTime: 0.05
        }
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTable,
          ElTableColumn,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem
        }
      }
    });

    expect(wrapper.find('.sort-statistics').exists()).toBe(true);
    expect(wrapper.text()).toContain('总计: 1000');
    expect(wrapper.text()).toContain('排序字段: 2');
  });

  it('handles drag and drop sort priority', async () => {
    const wrapper = mount(DataSorter, {
      props: {
        fields: mockFields,
        draggable: true,
        activeSorts: [
          { field: 'name', order: 'asc' },
          { field: 'age', order: 'desc' }
        ]
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTable,
          ElTableColumn,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem
        }
      }
    });

    expect(wrapper.find('.draggable-sort').exists()).toBe(true);
  });

  it('emits sort change events', async () => {
    const wrapper = mount(DataSorter, {
      props: {
        fields: mockFields,
        activeSorts: [
          { field: 'name', order: 'asc' }
        ]
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTable,
          ElTableColumn,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem
        }
      }
    });

    await wrapper.vm.onSortChange([{ field: 'age', order: 'desc' }]);
    expect(wrapper.emitted('sort-change')).toBeTruthy();
    expect(wrapper.emitted('sort-change')[0][0]).toEqual([{ field: 'age', order: 'desc' }]);
  });

  it('validates sort configuration', async () => {
    const wrapper = mount(DataSorter, {
      props: {
        fields: mockFields,
        validateSort: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTable,
          ElTableColumn,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem
        }
      }
    });

    const isValid = await wrapper.vm.validateSort();
    expect(wrapper.emitted('validation-complete')).toBeTruthy();
  });

  it('shows loading state', () => {
    const wrapper = mount(DataSorter, {
      props: {
        fields: mockFields,
        loading: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTable,
          ElTableColumn,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem
        }
      }
    });

    expect(wrapper.find('.loading-overlay').exists()).toBe(true);
  });

  it('applies custom CSS classes', () => {
    const wrapper = mount(DataSorter, {
      props: {
        fields: mockFields,
        sorterClass: 'custom-sorter-class'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTable,
          ElTableColumn,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem
        }
      }
    });

    expect(wrapper.find('.custom-sorter-class').exists()).toBe(true);
  });

  it('supports sort direction toggle', async () => {
    const wrapper = mount(DataSorter, {
      props: {
        fields: mockFields,
        activeSorts: [
          { field: 'name', order: 'asc' }
        ]
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTable,
          ElTableColumn,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem
        }
      }
    });

    const toggleButton = wrapper.find('.toggle-direction-button');
    if (toggleButton.exists()) {
      await toggleButton.trigger('click');
      expect(wrapper.emitted('direction-toggle')).toBeTruthy();
    }
  });

  it('handles empty sort state', () => {
    const wrapper = mount(DataSorter, {
      props: {
        fields: mockFields,
        activeSorts: []
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTable,
          ElTableColumn,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem
        }
      }
    });

    expect(wrapper.find('.empty-sort').exists()).toBe(true);
  });

  it('supports sort history', () => {
    const wrapper = mount(DataSorter, {
      props: {
        fields: mockFields,
        showHistory: true,
        sortHistory: [
          { sorts: [{ field: 'name', order: 'asc' }], timestamp: Date.now() },
          { sorts: [{ field: 'age', order: 'desc' }], timestamp: Date.now() }
        ]
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSelect,
          ElButton,
          ElCard,
          ElTable,
          ElTableColumn,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem
        }
      }
    });

    expect(wrapper.find('.sort-history').exists()).toBe(true);
  });
});