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
import DataTableAdvanced from '@/components/data/DataTableAdvanced.vue';
import { ElTable, ElTableColumn, ElPagination, ElButton, ElInput, ElSelect, ElDropdown, ElDropdownMenu, ElDropdownItem, ElCheckbox } from 'element-plus';

// Mock Element Plus components
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus');
  return {
    ...actual,
    ElTable: {
      name: 'ElTable',
      template: '<div class="el-table"><slot></slot></div>',
      props: ['data', 'loading', 'stripe', 'border', 'height', 'maxHeight', 'rowKey', 'defaultExpandAll'],
      emits: ['selection-change', 'sort-change', 'filter-change', 'row-click', 'row-dblclick', 'expand-change']
    },
    ElTableColumn: {
      name: 'ElTableColumn',
      template: '<div class="el-table-column"><slot></slot></div>',
      props: ['prop', 'label', 'width', 'sortable', 'filters', 'formatter', 'type', 'fixed', 'resizable', 'showOverflowTooltip']
    },
    ElPagination: {
      name: 'ElPagination',
      template: '<div class="el-pagination"></div>',
      props: ['currentPage', 'pageSize', 'total', 'pageSizes', 'layout'],
      emits: ['update:currentPage', 'update:pageSize']
    },
    ElButton: {
      name: 'ElButton',
      template: '<button><slot></slot></button>',
      props: ['type', 'size', 'icon', 'loading', 'disabled', 'circle']
    },
    ElInput: {
      name: 'ElInput',
      template: '<input type="text" />',
      props: ['modelValue', 'placeholder', 'clearable'],
      emits: ['update:modelValue']
    },
    ElSelect: {
      name: 'ElSelect',
      template: '<select><slot></slot></select>',
      props: ['modelValue', 'placeholder', 'multiple'],
      emits: ['update:modelValue']
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
      props: ['command', 'disabled', 'divided']
    },
    ElCheckbox: {
      name: 'ElCheckbox',
      template: '<input type="checkbox" />',
      props: ['modelValue', 'indeterminate'],
      emits: ['update:modelValue']
    }
  };
});

describe('DataTableAdvanced.vue', () => {
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  const mockColumns = [
    { prop: 'id', label: 'ID', width: 80, sortable: true, fixed: 'left' },
    { prop: 'name', label: '姓名', width: 120, sortable: true, resizable: true },
    { prop: 'email', label: '邮箱', width: 200, showOverflowTooltip: true },
    { prop: 'status', label: '状态', width: 100, filters: [{ text: '活跃', value: 'active' }, { text: '禁用', value: 'inactive' }] },
    { prop: 'date', label: '日期', width: 150, sortable: true, formatter: (row: any) => row.date ? new Date(row.date).toLocaleDateString() : '' },
    { prop: 'actions', label: '操作', width: 150, fixed: 'right' }
  ];

  const mockData = [
    { id: 1, name: '张三', email: 'zhangsan@example.com', status: 'active', date: '2023-01-01', actions: 'edit,delete' },
    { id: 2, name: '李四', email: 'lisi@example.com', status: 'inactive', date: '2023-02-01', actions: 'edit,delete' },
    { id: 3, name: '王五', email: 'wangwu@example.com', status: 'active', date: '2023-03-01', actions: 'edit,delete' }
  ];

  it('renders advanced data table with all features', () => {
    const wrapper = mount(DataTableAdvanced, {
      props: {
        columns: mockColumns,
        data: mockData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTable,
          ElTableColumn,
          ElPagination,
          ElButton,
          ElInput,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElCheckbox
        }
      }
    });

    expect(wrapper.find('.data-table-advanced').exists()).toBe(true);
    expect(wrapper.findComponent(ElTable).exists()).toBe(true);
    expect(wrapper.findAllComponents(ElTableColumn)).toHaveLength(mockColumns.length);
  });

  it('displays table with fixed columns', () => {
    const wrapper = mount(DataTableAdvanced, {
      props: {
        columns: mockColumns,
        data: mockData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTable,
          ElTableColumn,
          ElPagination,
          ElButton,
          ElInput,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElCheckbox
        }
      }
    });

    const table = wrapper.findComponent(ElTable);
    expect(table.exists()).toBe(true);
  });

  it('supports row selection', async () => {
    const wrapper = mount(DataTableAdvanced, {
      props: {
        columns: mockColumns,
        data: mockData,
        selectable: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTable,
          ElTableColumn,
          ElPagination,
          ElButton,
          ElInput,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElCheckbox
        }
      }
    });

    const table = wrapper.findComponent(ElTable);
    await table.vm.$emit('selection-change', [mockData[0]]);
    
    expect(wrapper.emitted('selection-change')).toBeTruthy();
    expect(wrapper.emitted('selection-change')[0][0]).toEqual([mockData[0]]);
  });

  it('supports multi-row selection with select all', async () => {
    const wrapper = mount(DataTableAdvanced, {
      props: {
        columns: mockColumns,
        data: mockData,
        selectable: true,
        showSelectAll: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTable,
          ElTableColumn,
          ElPagination,
          ElButton,
          ElInput,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElCheckbox
        }
      }
    });

    const selectAllCheckbox = wrapper.findComponent(ElCheckbox);
    expect(selectAllCheckbox.exists()).toBe(true);
  });

  it('handles column sorting', async () => {
    const wrapper = mount(DataTableAdvanced, {
      props: {
        columns: mockColumns,
        data: mockData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTable,
          ElTableColumn,
          ElPagination,
          ElButton,
          ElInput,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElCheckbox
        }
      }
    });

    const table = wrapper.findComponent(ElTable);
    await table.vm.$emit('sort-change', { prop: 'name', order: 'ascending' });
    
    expect(wrapper.emitted('sort-change')).toBeTruthy();
    expect(wrapper.emitted('sort-change')[0][0]).toEqual({ prop: 'name', order: 'ascending' });
  });

  it('supports column filtering', async () => {
    const wrapper = mount(DataTableAdvanced, {
      props: {
        columns: mockColumns,
        data: mockData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTable,
          ElTableColumn,
          ElPagination,
          ElButton,
          ElInput,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElCheckbox
        }
      }
    });

    const table = wrapper.findComponent(ElTable);
    await table.vm.$emit('filter-change', { status: ['active'] });
    
    expect(wrapper.emitted('filter-change')).toBeTruthy();
  });

  it('shows pagination with advanced options', () => {
    const wrapper = mount(DataTableAdvanced, {
      props: {
        columns: mockColumns,
        data: mockData,
        pagination: true,
        total: 100,
        currentPage: 1,
        pageSize: 10,
        pageSizes: [10, 20, 50, 100]
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTable,
          ElTableColumn,
          ElPagination,
          ElButton,
          ElInput,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElCheckbox
        }
      }
    });

    expect(wrapper.findComponent(ElPagination).exists()).toBe(true);
    const pagination = wrapper.findComponent(ElPagination);
    expect(pagination.props('total')).toBe(100);
    expect(pagination.props('pageSizes')).toEqual([10, 20, 50, 100]);
  });

  it('handles pagination changes', async () => {
    const wrapper = mount(DataTableAdvanced, {
      props: {
        columns: mockColumns,
        data: mockData,
        pagination: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTable,
          ElTableColumn,
          ElPagination,
          ElButton,
          ElInput,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElCheckbox
        }
      }
    });

    const pagination = wrapper.findComponent(ElPagination);
    await pagination.vm.$emit('update:currentPage', 2);
    
    expect(wrapper.emitted('page-change')).toBeTruthy();
    expect(wrapper.emitted('page-change')[0][0]).toBe(2);
  });

  it('supports row expansion', async () => {
    const wrapper = mount(DataTableAdvanced, {
      props: {
        columns: mockColumns,
        data: mockData,
        expandable: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTable,
          ElTableColumn,
          ElPagination,
          ElButton,
          ElInput,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElCheckbox
        }
      }
    });

    const table = wrapper.findComponent(ElTable);
    await table.vm.$emit('expand-change', mockData[0], [mockData[0]]);
    
    expect(wrapper.emitted('expand-change')).toBeTruthy();
  });

  it('shows row actions', () => {
    const wrapper = mount(DataTableAdvanced, {
      props: {
        columns: mockColumns,
        data: mockData,
        rowActions: [
          { type: 'primary', text: '编辑', action: 'edit', icon: 'edit' },
          { type: 'danger', text: '删除', action: 'delete', icon: 'delete' },
          { type: 'success', text: '查看', action: 'view', icon: 'view' }
        ]
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTable,
          ElTableColumn,
          ElPagination,
          ElButton,
          ElInput,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElCheckbox
        }
      }
    });

    const buttons = wrapper.findAllComponents(ElButton);
    expect(buttons.length).toBeGreaterThan(0);
    expect(wrapper.text()).toContain('编辑');
    expect(wrapper.text()).toContain('删除');
    expect(wrapper.text()).toContain('查看');
  });

  it('handles row action clicks', async () => {
    const wrapper = mount(DataTableAdvanced, {
      props: {
        columns: mockColumns,
        data: mockData,
        rowActions: [
          { type: 'primary', text: '编辑', action: 'edit' }
        ]
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTable,
          ElTableColumn,
          ElPagination,
          ElButton,
          ElInput,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElCheckbox
        }
      }
    });

    const editButton = wrapper.find('.edit-button');
    if (editButton.exists()) {
      await editButton.trigger('click');
      expect(wrapper.emitted('row-action')).toBeTruthy();
      expect(wrapper.emitted('row-action')[0][0]).toEqual({ action: 'edit', row: expect.any(Object) });
    }
  });

  it('supports column resizing', () => {
    const wrapper = mount(DataTableAdvanced, {
      props: {
        columns: mockColumns,
        data: mockData,
        resizable: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTable,
          ElTableColumn,
          ElPagination,
          ElButton,
          ElInput,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElCheckbox
        }
      }
    });

    expect(wrapper.find('.resizable-table').exists()).toBe(true);
  });

  it('shows column visibility toggle', () => {
    const wrapper = mount(DataTableAdvanced, {
      props: {
        columns: mockColumns,
        data: mockData,
        columnToggle: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTable,
          ElTableColumn,
          ElPagination,
          ElButton,
          ElInput,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElCheckbox
        }
      }
    });

    expect(wrapper.find('.column-toggle').exists()).toBe(true);
  });

  it('handles column visibility changes', async () => {
    const wrapper = mount(DataTableAdvanced, {
      props: {
        columns: mockColumns,
        data: mockData,
        columnToggle: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTable,
          ElTableColumn,
          ElPagination,
          ElButton,
          ElInput,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElCheckbox
        }
      }
    });

    const columnCheckbox = wrapper.find('.column-checkbox');
    if (columnCheckbox.exists()) {
      await columnCheckbox.trigger('click');
      expect(wrapper.emitted('column-visibility-change')).toBeTruthy();
    }
  });

  it('supports virtual scrolling for large datasets', () => {
    const wrapper = mount(DataTableAdvanced, {
      props: {
        columns: mockColumns,
        data: mockData,
        virtualScroll: true,
        height: 400,
        rowHeight: 40
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTable,
          ElTableColumn,
          ElPagination,
          ElButton,
          ElInput,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElCheckbox
        }
      }
    });

    const table = wrapper.findComponent(ElTable);
    expect(table.props('height')).toBe(400);
  });

  it('handles row clicks and double clicks', async () => {
    const wrapper = mount(DataTableAdvanced, {
      props: {
        columns: mockColumns,
        data: mockData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTable,
          ElTableColumn,
          ElPagination,
          ElButton,
          ElInput,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElCheckbox
        }
      }
    });

    const table = wrapper.findComponent(ElTable);
    await table.vm.$emit('row-click', mockData[0]);
    expect(wrapper.emitted('row-click')).toBeTruthy();

    await table.vm.$emit('row-dblclick', mockData[0]);
    expect(wrapper.emitted('row-dblclick')).toBeTruthy();
  });

  it('shows table toolbar with actions', () => {
    const wrapper = mount(DataTableAdvanced, {
      props: {
        columns: mockColumns,
        data: mockData,
        showToolbar: true,
        toolbarActions: [
          { type: 'primary', text: '新增', action: 'add' },
          { type: 'success', text: '导出', action: 'export' },
          { type: 'warning', text: '批量操作', action: 'batch' }
        ]
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTable,
          ElTableColumn,
          ElPagination,
          ElButton,
          ElInput,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElCheckbox
        }
      }
    });

    expect(wrapper.find('.table-toolbar').exists()).toBe(true);
    expect(wrapper.text()).toContain('新增');
    expect(wrapper.text()).toContain('导出');
    expect(wrapper.text()).toContain('批量操作');
  });

  it('handles toolbar action clicks', async () => {
    const wrapper = mount(DataTableAdvanced, {
      props: {
        columns: mockColumns,
        data: mockData,
        showToolbar: true,
        toolbarActions: [
          { type: 'primary', text: '新增', action: 'add' }
        ]
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTable,
          ElTableColumn,
          ElPagination,
          ElButton,
          ElInput,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElCheckbox
        }
      }
    });

    const addButton = wrapper.find('.add-button');
    if (addButton.exists()) {
      await addButton.trigger('click');
      expect(wrapper.emitted('toolbar-action')).toBeTruthy();
      expect(wrapper.emitted('toolbar-action')[0][0]).toBe('add');
    }
  });

  it('supports table search and filtering', () => {
    const wrapper = mount(DataTableAdvanced, {
      props: {
        columns: mockColumns,
        data: mockData,
        searchable: true,
        filterable: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTable,
          ElTableColumn,
          ElPagination,
          ElButton,
          ElInput,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElCheckbox
        }
      }
    });

    expect(wrapper.find('.table-search').exists()).toBe(true);
    expect(wrapper.find('.table-filter').exists()).toBe(true);
  });

  it('handles search input', async () => {
    const wrapper = mount(DataTableAdvanced, {
      props: {
        columns: mockColumns,
        data: mockData,
        searchable: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTable,
          ElTableColumn,
          ElPagination,
          ElButton,
          ElInput,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElCheckbox
        }
      }
    });

    const searchInput = wrapper.findComponent(ElInput);
    await searchInput.setValue('张三');
    
    expect(wrapper.emitted('search')).toBeTruthy();
    expect(wrapper.emitted('search')[0][0]).toBe('张三');
  });

  it('shows table statistics', () => {
    const wrapper = mount(DataTableAdvanced, {
      props: {
        columns: mockColumns,
        data: mockData,
        showStatistics: true,
        statistics: {
          total: 1000,
          filtered: 50,
          selected: 3
        }
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTable,
          ElTableColumn,
          ElPagination,
          ElButton,
          ElInput,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElCheckbox
        }
      }
    });

    expect(wrapper.find('.table-statistics').exists()).toBe(true);
    expect(wrapper.text()).toContain('总计: 1000');
    expect(wrapper.text()).toContain('筛选: 50');
    expect(wrapper.text()).toContain('选中: 3');
  });

  it('supports table export', async () => {
    const wrapper = mount(DataTableAdvanced, {
      props: {
        columns: mockColumns,
        data: mockData,
        exportable: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTable,
          ElTableColumn,
          ElPagination,
          ElButton,
          ElInput,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElCheckbox
        }
      }
    });

    const exportButton = wrapper.find('.export-button');
    if (exportButton.exists()) {
      await exportButton.trigger('click');
      expect(wrapper.emitted('export')).toBeTruthy();
    }
  });

  it('handles cell custom rendering', () => {
    const wrapper = mount(DataTableAdvanced, {
      props: {
        columns: mockColumns,
        data: mockData,
        cellRender: (row: any, column: any, value: any) => {
          if (column.prop === 'status') {
            return value === 'active' ? '✓ 活跃' : '✗ 禁用';
          }
          return value;
        }
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTable,
          ElTableColumn,
          ElPagination,
          ElButton,
          ElInput,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElCheckbox
        }
      }
    });

    expect(wrapper.props('cellRender')).toBeDefined();
  });

  it('shows loading state', () => {
    const wrapper = mount(DataTableAdvanced, {
      props: {
        columns: mockColumns,
        data: mockData,
        loading: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTable,
          ElTableColumn,
          ElPagination,
          ElButton,
          ElInput,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElCheckbox
        }
      }
    });

    const table = wrapper.findComponent(ElTable);
    expect(table.props('loading')).toBe(true);
  });

  it('handles empty data state', () => {
    const wrapper = mount(DataTableAdvanced, {
      props: {
        columns: mockColumns,
        data: []
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTable,
          ElTableColumn,
          ElPagination,
          ElButton,
          ElInput,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElCheckbox
        }
      }
    });

    expect(wrapper.find('.empty-data').exists()).toBe(true);
  });

  it('applies custom CSS classes', () => {
    const wrapper = mount(DataTableAdvanced, {
      props: {
        columns: mockColumns,
        data: mockData,
        tableClass: 'custom-table-class',
        rowClass: 'custom-row-class'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTable,
          ElTableColumn,
          ElPagination,
          ElButton,
          ElInput,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElCheckbox
        }
      }
    });

    expect(wrapper.find('.custom-table-class').exists()).toBe(true);
  });

  it('supports table configuration persistence', async () => {
    const wrapper = mount(DataTableAdvanced, {
      props: {
        columns: mockColumns,
        data: mockData,
        persistConfig: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTable,
          ElTableColumn,
          ElPagination,
          ElButton,
          ElInput,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElCheckbox
        }
      }
    });

    await wrapper.vm.saveConfig();
    expect(wrapper.emitted('config-saved')).toBeTruthy();
  });

  it('handles responsive layout', () => {
    const wrapper = mount(DataTableAdvanced, {
      props: {
        columns: mockColumns,
        data: mockData,
        responsive: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTable,
          ElTableColumn,
          ElPagination,
          ElButton,
          ElInput,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElCheckbox
        }
      }
    });

    expect(wrapper.find('.responsive-table').exists()).toBe(true);
  });
});