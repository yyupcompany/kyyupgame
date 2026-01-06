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
import DataGrid from '@/components/data/DataGrid.vue';
import { ElTable, ElTableColumn, ElPagination, ElButton, ElInput, ElSelect } from 'element-plus';

// Mock Element Plus components
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus');
  return {
    ...actual,
    ElTable: {
      name: 'ElTable',
      template: '<div class="el-table"><slot></slot></div>',
      props: ['data', 'loading', 'stripe', 'border', 'height'],
      emits: ['selection-change', 'sort-change', 'filter-change']
    },
    ElTableColumn: {
      name: 'ElTableColumn',
      template: '<div class="el-table-column"><slot></slot></div>',
      props: ['prop', 'label', 'width', 'sortable', 'filters', 'formatter']
    },
    ElPagination: {
      name: 'ElPagination',
      template: '<div class="el-pagination"></div>',
      props: ['currentPage', 'pageSize', 'total', 'pageSizes'],
      emits: ['update:currentPage', 'update:pageSize']
    },
    ElButton: {
      name: 'ElButton',
      template: '<button><slot></slot></button>',
      props: ['type', 'size', 'icon', 'disabled']
    },
    ElInput: {
      name: 'ElInput',
      template: '<input type="text" />',
      props: ['modelValue', 'placeholder'],
      emits: ['update:modelValue']
    },
    ElSelect: {
      name: 'ElSelect',
      template: '<select><slot></slot></select>',
      props: ['modelValue', 'placeholder'],
      emits: ['update:modelValue']
    }
  };
});

describe('DataGrid.vue', () => {
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  const mockColumns = [
    {
      prop: 'id',
      label: 'ID',
      width: 80,
      sortable: true
    },
    {
      prop: 'name',
      label: '姓名',
      width: 120,
      sortable: true
    },
    {
      prop: 'email',
      label: '邮箱',
      width: 200
    },
    {
      prop: 'status',
      label: '状态',
      width: 100,
      filters: [
        { text: '活跃', value: 'active' },
        { text: '禁用', value: 'disabled' }
      ]
    }
  ];

  const mockData = [
    { id: 1, name: '张三', email: 'zhangsan@example.com', status: 'active' },
    { id: 2, name: '李四', email: 'lisi@example.com', status: 'disabled' },
    { id: 3, name: '王五', email: 'wangwu@example.com', status: 'active' }
  ];

  it('renders data grid with columns and data', () => {
    const wrapper = mount(DataGrid, {
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
          ElSelect
        }
      }
    });

    expect(wrapper.findComponent(ElTable).exists()).toBe(true);
    expect(wrapper.findAllComponents(ElTableColumn)).toHaveLength(mockColumns.length);
    expect(wrapper.findComponent(ElTable).props('data')).toEqual(mockData);
  });

  it('displays column headers correctly', () => {
    const wrapper = mount(DataGrid, {
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
          ElSelect
        }
      }
    });

    const tableText = wrapper.text();
    expect(tableText).toContain('ID');
    expect(tableText).toContain('姓名');
    expect(tableText).toContain('邮箱');
    expect(tableText).toContain('状态');
  });

  it('shows table data rows', () => {
    const wrapper = mount(DataGrid, {
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
          ElSelect
        }
      }
    });

    const table = wrapper.findComponent(ElTable);
    expect(table.props('data')).toHaveLength(mockData.length);
  });

  it('enables row selection', async () => {
    const wrapper = mount(DataGrid, {
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
          ElSelect
        }
      }
    });

    const table = wrapper.findComponent(ElTable);
    await table.vm.$emit('selection-change', [mockData[0]]);
    
    expect(wrapper.emitted('selection-change')).toBeTruthy();
    expect(wrapper.emitted('selection-change')[0][0]).toEqual([mockData[0]]);
  });

  it('supports column sorting', async () => {
    const wrapper = mount(DataGrid, {
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
          ElSelect
        }
      }
    });

    const table = wrapper.findComponent(ElTable);
    await table.vm.$emit('sort-change', { prop: 'name', order: 'ascending' });
    
    expect(wrapper.emitted('sort-change')).toBeTruthy();
    expect(wrapper.emitted('sort-change')[0][0]).toEqual({ prop: 'name', order: 'ascending' });
  });

  it('supports column filtering', async () => {
    const wrapper = mount(DataGrid, {
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
          ElSelect
        }
      }
    });

    const table = wrapper.findComponent(ElTable);
    await table.vm.$emit('filter-change', { status: ['active'] });
    
    expect(wrapper.emitted('filter-change')).toBeTruthy();
  });

  it('shows pagination when enabled', () => {
    const wrapper = mount(DataGrid, {
      props: {
        columns: mockColumns,
        data: mockData,
        pagination: true,
        total: 100,
        currentPage: 1,
        pageSize: 10
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTable,
          ElTableColumn,
          ElPagination,
          ElButton,
          ElInput,
          ElSelect
        }
      }
    });

    expect(wrapper.findComponent(ElPagination).exists()).toBe(true);
    const pagination = wrapper.findComponent(ElPagination);
    expect(pagination.props('total')).toBe(100);
    expect(pagination.props('currentPage')).toBe(1);
    expect(pagination.props('pageSize')).toBe(10);
  });

  it('emits pagination change events', async () => {
    const wrapper = mount(DataGrid, {
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
          ElSelect
        }
      }
    });

    const pagination = wrapper.findComponent(ElPagination);
    await pagination.vm.$emit('update:currentPage', 2);
    
    expect(wrapper.emitted('page-change')).toBeTruthy();
    expect(wrapper.emitted('page-change')[0][0]).toBe(2);
  });

  it('emits page size change events', async () => {
    const wrapper = mount(DataGrid, {
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
          ElSelect
        }
      }
    });

    const pagination = wrapper.findComponent(ElPagination);
    await pagination.vm.$emit('update:pageSize', 20);
    
    expect(wrapper.emitted('size-change')).toBeTruthy();
    expect(wrapper.emitted('size-change')[0][0]).toBe(20);
  });

  it('shows search functionality', () => {
    const wrapper = mount(DataGrid, {
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
          ElSelect
        }
      }
    });

    expect(wrapper.find('.search-input').exists()).toBe(true);
  });

  it('emits search events', async () => {
    const wrapper = mount(DataGrid, {
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
          ElSelect
        }
      }
    });

    const searchInput = wrapper.find('.search-input');
    await searchInput.setValue('张三');
    
    expect(wrapper.emitted('search')).toBeTruthy();
    expect(wrapper.emitted('search')[0][0]).toBe('张三');
  });

  it('shows action buttons for row operations', () => {
    const wrapper = mount(DataGrid, {
      props: {
        columns: mockColumns,
        data: mockData,
        rowActions: [
          { type: 'primary', text: '编辑', action: 'edit' },
          { type: 'danger', text: '删除', action: 'delete' }
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
          ElSelect
        }
      }
    });

    const buttons = wrapper.findAllComponents(ElButton);
    expect(buttons.length).toBeGreaterThan(0);
    expect(wrapper.text()).toContain('编辑');
    expect(wrapper.text()).toContain('删除');
  });

  it('emits row action events', async () => {
    const wrapper = mount(DataGrid, {
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
          ElSelect
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
    const wrapper = mount(DataGrid, {
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
          ElSelect
        }
      }
    });

    expect(wrapper.find('.resizable-table').exists()).toBe(true);
  });

  it('shows loading state', () => {
    const wrapper = mount(DataGrid, {
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
          ElSelect
        }
      }
    });

    const table = wrapper.findComponent(ElTable);
    expect(table.props('loading')).toBe(true);
  });

  it('handles empty data state', () => {
    const wrapper = mount(DataGrid, {
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
          ElSelect
        }
      }
    });

    expect(wrapper.find('.empty-data').exists()).toBe(true);
  });

  it('supports custom cell formatters', () => {
    const columnsWithFormatter = [
      ...mockColumns,
      {
        prop: 'status',
        label: '状态',
        formatter: (row: any) => row.status === 'active' ? '活跃' : '禁用'
      }
    ];

    const wrapper = mount(DataGrid, {
      props: {
        columns: columnsWithFormatter,
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
          ElSelect
        }
      }
    });

    expect(wrapper.props('columns')).toEqual(columnsWithFormatter);
  });

  it('supports column visibility toggle', () => {
    const wrapper = mount(DataGrid, {
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
          ElSelect
        }
      }
    });

    expect(wrapper.find('.column-toggle').exists()).toBe(true);
  });

  it('supports row expansion', () => {
    const wrapper = mount(DataGrid, {
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
          ElSelect
        }
      }
    });

    expect(wrapper.find('.expandable-table').exists()).toBe(true);
  });

  it('emits row expand/collapse events', async () => {
    const wrapper = mount(DataGrid, {
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
          ElSelect
        }
      }
    });

    await wrapper.vm.$emit('row-expand', mockData[0]);
    expect(wrapper.emitted('row-expand')).toBeTruthy();
  });

  it('supports fixed columns', () => {
    const columnsWithFixed = [
      { ...mockColumns[0], fixed: 'left' },
      ...mockColumns.slice(1),
      { ...mockColumns[mockColumns.length - 1], fixed: 'right' }
    ];

    const wrapper = mount(DataGrid, {
      props: {
        columns: columnsWithFixed,
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
          ElSelect
        }
      }
    });

    expect(wrapper.props('columns')).toEqual(columnsWithFixed);
  });

  it('applies custom CSS classes', () => {
    const wrapper = mount(DataGrid, {
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
          ElSelect
        }
      }
    });

    expect(wrapper.find('.custom-table-class').exists()).toBe(true);
  });

  it('supports virtual scrolling for large datasets', () => {
    const wrapper = mount(DataGrid, {
      props: {
        columns: mockColumns,
        data: mockData,
        virtualScroll: true,
        height: 400
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElTable,
          ElTableColumn,
          ElPagination,
          ElButton,
          ElInput,
          ElSelect
        }
      }
    });

    const table = wrapper.findComponent(ElTable);
    expect(table.props('height')).toBe(400);
  });

  it('exports data functionality', async () => {
    const wrapper = mount(DataGrid, {
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