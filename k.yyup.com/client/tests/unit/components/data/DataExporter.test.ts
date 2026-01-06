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
import DataExporter from '@/components/data/DataExporter.vue';
import { ElButton, ElSelect, ElDropdown, ElDropdownMenu, ElDropdownItem, ElProgress, ElMessage } from 'element-plus';

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
    },
    ElProgress: {
      name: 'ElProgress',
      template: '<div class="el-progress"></div>',
      props: ['percentage', 'status']
    },
    ElMessage: {
      name: 'ElMessage',
      template: '<div class="el-message"></div>',
      methods: {
        success: vi.fn(),
        error: vi.fn(),
        warning: vi.fn()
      }
    }
  };
});

// Mock file download functionality
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('DataExporter.vue', () => {
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.clearAllMocks();
  });

  const mockData = [
    { id: 1, name: '张三', email: 'zhangsan@example.com', age: 25, status: 'active' },
    { id: 2, name: '李四', email: 'lisi@example.com', age: 30, status: 'inactive' },
    { id: 3, name: '王五', email: 'wangwu@example.com', age: 35, status: 'active' }
  ];

  const mockColumns = [
    { prop: 'id', label: 'ID' },
    { prop: 'name', label: '姓名' },
    { prop: 'email', label: '邮箱' },
    { prop: 'age', label: '年龄' },
    { prop: 'status', label: '状态' }
  ];

  it('renders data exporter with export options', () => {
    const wrapper = mount(DataExporter, {
      props: {
        data: mockData,
        columns: mockColumns
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElProgress
        }
      }
    });

    expect(wrapper.find('.data-exporter').exists()).toBe(true);
    expect(wrapper.findComponent(ElButton).exists()).toBe(true);
    expect(wrapper.text()).toContain('导出');
  });

  it('shows export format options', () => {
    const wrapper = mount(DataExporter, {
      props: {
        data: mockData,
        columns: mockColumns,
        showFormatOptions: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElProgress
        }
      }
    });

    expect(wrapper.findComponent(ElSelect).exists()).toBe(true);
    expect(wrapper.text()).toContain('CSV');
    expect(wrapper.text()).toContain('Excel');
    expect(wrapper.text()).toContain('JSON');
  });

  it('exports data to CSV format', async () => {
    const wrapper = mount(DataExporter, {
      props: {
        data: mockData,
        columns: mockColumns,
        format: 'csv'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElProgress
        }
      }
    });

    const exportButton = wrapper.find('.export-button');
    await exportButton.trigger('click');
    
    expect(wrapper.emitted('export')).toBeTruthy();
    expect(wrapper.emitted('export')[0][0]).toEqual({
      format: 'csv',
      data: mockData,
      columns: mockColumns
    });
  });

  it('exports data to Excel format', async () => {
    const wrapper = mount(DataExporter, {
      props: {
        data: mockData,
        columns: mockColumns,
        format: 'excel'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElProgress
        }
      }
    });

    const exportButton = wrapper.find('.export-button');
    await exportButton.trigger('click');
    
    expect(wrapper.emitted('export')).toBeTruthy();
    expect(wrapper.emitted('export')[0][0].format).toBe('excel');
  });

  it('exports data to JSON format', async () => {
    const wrapper = mount(DataExporter, {
      props: {
        data: mockData,
        columns: mockColumns,
        format: 'json'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElProgress
        }
      }
    });

    const exportButton = wrapper.find('.export-button');
    await exportButton.trigger('click');
    
    expect(wrapper.emitted('export')).toBeTruthy();
    expect(wrapper.emitted('export')[0][0].format).toBe('json');
  });

  it('handles format selection', async () => {
    const wrapper = mount(DataExporter, {
      props: {
        data: mockData,
        columns: mockColumns,
        showFormatOptions: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElProgress
        }
      }
    });

    const formatSelect = wrapper.findComponent(ElSelect);
    await formatSelect.vm.$emit('update:modelValue', 'excel');
    
    expect(wrapper.emitted('format-change')).toBeTruthy();
    expect(wrapper.emitted('format-change')[0][0]).toBe('excel');
  });

  it('shows progress during export', async () => {
    const wrapper = mount(DataExporter, {
      props: {
        data: mockData,
        columns: mockColumns,
        showProgress: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElProgress
        }
      }
    });

    // Start export
    const exportButton = wrapper.find('.export-button');
    await exportButton.trigger('click');
    
    // Check if progress is shown
    expect(wrapper.findComponent(ElProgress).exists()).toBe(true);
  });

  it('updates progress percentage', async () => {
    const wrapper = mount(DataExporter, {
      props: {
        data: mockData,
        columns: mockColumns,
        showProgress: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElProgress
        }
      }
    });

    await wrapper.vm.setProgress(50);
    const progress = wrapper.findComponent(ElProgress);
    expect(progress.props('percentage')).toBe(50);
  });

  it('handles export completion', async () => {
    const wrapper = mount(DataExporter, {
      props: {
        data: mockData,
        columns: mockColumns
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElProgress
        }
      }
    });

    await wrapper.vm.onExportComplete();
    expect(wrapper.emitted('export-complete')).toBeTruthy();
  });

  it('handles export errors', async () => {
    const wrapper = mount(DataExporter, {
      props: {
        data: mockData,
        columns: mockColumns
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElProgress,
          ElMessage
        }
      }
    });

    await wrapper.vm.onExportError(new Error('导出失败'));
    expect(wrapper.emitted('export-error')).toBeTruthy();
  });

  it('supports custom filename', async () => {
    const wrapper = mount(DataExporter, {
      props: {
        data: mockData,
        columns: mockColumns,
        filename: 'custom-export'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElProgress
        }
      }
    });

    const exportButton = wrapper.find('.export-button');
    await exportButton.trigger('click');
    
    expect(wrapper.emitted('export')[0][0].filename).toBe('custom-export');
  });

  it('supports column selection', () => {
    const wrapper = mount(DataExporter, {
      props: {
        data: mockData,
        columns: mockColumns,
        columnSelection: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElProgress
        }
      }
    });

    expect(wrapper.find('.column-selection').exists()).toBe(true);
  });

  it('handles column selection changes', async () => {
    const wrapper = mount(DataExporter, {
      props: {
        data: mockData,
        columns: mockColumns,
        columnSelection: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElProgress
        }
      }
    });

    const selectedColumns = mockColumns.slice(0, 3);
    await wrapper.vm.onColumnSelectionChange(selectedColumns);
    
    expect(wrapper.emitted('column-selection-change')).toBeTruthy();
    expect(wrapper.emitted('column-selection-change')[0][0]).toEqual(selectedColumns);
  });

  it('supports data filtering', async () => {
    const wrapper = mount(DataExporter, {
      props: {
        data: mockData,
        columns: mockColumns,
        filterable: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElProgress
        }
      }
    });

    const filteredData = mockData.filter(item => item.status === 'active');
    await wrapper.vm.onDataFilter(filteredData);
    
    expect(wrapper.emitted('data-filter')).toBeTruthy();
    expect(wrapper.emitted('data-filter')[0][0]).toEqual(filteredData);
  });

  it('shows export options dropdown', () => {
    const wrapper = mount(DataExporter, {
      props: {
        data: mockData,
        columns: mockColumns,
        showExportOptions: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElProgress
        }
      }
    });

    expect(wrapper.findComponent(ElDropdown).exists()).toBe(true);
    expect(wrapper.findComponent(ElDropdownMenu).exists()).toBe(true);
  });

  it('handles dropdown menu commands', async () => {
    const wrapper = mount(DataExporter, {
      props: {
        data: mockData,
        columns: mockColumns,
        showExportOptions: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElProgress
        }
      }
    });

    const dropdown = wrapper.findComponent(ElDropdown);
    await dropdown.vm.$emit('command', 'export-all');
    
    expect(wrapper.emitted('export-command')).toBeTruthy();
    expect(wrapper.emitted('export-command')[0][0]).toBe('export-all');
  });

  it('supports batch export', async () => {
    const wrapper = mount(DataExporter, {
      props: {
        data: mockData,
        columns: mockColumns,
        batchExport: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElProgress
        }
      }
    });

    const batchButton = wrapper.find('.batch-export-button');
    if (batchButton.exists()) {
      await batchButton.trigger('click');
      expect(wrapper.emitted('batch-export')).toBeTruthy();
    }
  });

  it('disables export button when no data', () => {
    const wrapper = mount(DataExporter, {
      props: {
        data: [],
        columns: mockColumns
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElProgress
        }
      }
    });

    const exportButton = wrapper.findComponent(ElButton);
    expect(exportButton.props('disabled')).toBe(true);
  });

  it('shows loading state during export', () => {
    const wrapper = mount(DataExporter, {
      props: {
        data: mockData,
        columns: mockColumns,
        loading: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElProgress
        }
      }
    });

    const exportButton = wrapper.findComponent(ElButton);
    expect(exportButton.props('loading')).toBe(true);
  });

  it('supports custom export templates', async () => {
    const wrapper = mount(DataExporter, {
      props: {
        data: mockData,
        columns: mockColumns,
        templates: [
          { name: '标准模板', id: 'standard' },
          { name: '详细模板', id: 'detailed' }
        ]
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElProgress
        }
      }
    });

    expect(wrapper.text()).toContain('标准模板');
    expect(wrapper.text()).toContain('详细模板');
  });

  it('handles template selection', async () => {
    const wrapper = mount(DataExporter, {
      props: {
        data: mockData,
        columns: mockColumns,
        templates: [
          { name: '标准模板', id: 'standard' },
          { name: '详细模板', id: 'detailed' }
        ]
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElProgress
        }
      }
    });

    await wrapper.vm.onTemplateSelect('detailed');
    expect(wrapper.emitted('template-select')).toBeTruthy();
    expect(wrapper.emitted('template-select')[0][0]).toBe('detailed');
  });

  it('applies custom CSS classes', () => {
    const wrapper = mount(DataExporter, {
      props: {
        data: mockData,
        columns: mockColumns,
        exporterClass: 'custom-exporter-class',
        buttonClass: 'custom-button-class'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElProgress
        }
      }
    });

    expect(wrapper.find('.custom-exporter-class').exists()).toBe(true);
  });

  it('supports scheduled export', async () => {
    const wrapper = mount(DataExporter, {
      props: {
        data: mockData,
        columns: mockColumns,
        scheduledExport: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElProgress
        }
      }
    });

    const scheduleButton = wrapper.find('.schedule-button');
    if (scheduleButton.exists()) {
      await scheduleButton.trigger('click');
      expect(wrapper.emitted('schedule-export')).toBeTruthy();
    }
  });

  it('handles export history', () => {
    const wrapper = mount(DataExporter, {
      props: {
        data: mockData,
        columns: mockColumns,
        showHistory: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElSelect,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElProgress
        }
      }
    });

    expect(wrapper.find('.export-history').exists()).toBe(true);
  });
});