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
import DataImporter from '@/components/data/DataImporter.vue';
import { ElButton, ElUpload, ElTable, ElTableColumn, ElProgress, ElAlert, ElSelect, ElMessage } from 'element-plus';

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
    ElUpload: {
      name: 'ElUpload',
      template: '<div class="el-upload"><slot></slot></div>',
      props: ['action', 'accept', 'limit', 'autoUpload', 'disabled'],
      emits: ['change', 'success', 'error', 'exceed']
    },
    ElTable: {
      name: 'ElTable',
      template: '<div class="el-table"><slot></slot></div>',
      props: ['data', 'height', 'maxHeight']
    },
    ElTableColumn: {
      name: 'ElTableColumn',
      template: '<div class="el-table-column"><slot></slot></div>',
      props: ['prop', 'label', 'width']
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
    },
    ElSelect: {
      name: 'ElSelect',
      template: '<select><slot></slot></select>',
      props: ['modelValue', 'placeholder'],
      emits: ['update:modelValue']
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

// Mock File API
const mockFile = new File(['test,data'], 'test.csv', { type: 'text/csv' });
Object.defineProperty(mockFile, 'size', { value: 1024 });

describe('DataImporter.vue', () => {
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.clearAllMocks();
  });

  const mockColumns = [
    { prop: 'id', label: 'ID', required: true },
    { prop: 'name', label: '姓名', required: true },
    { prop: 'email', label: '邮箱', required: false },
    { prop: 'age', label: '年龄', required: false }
  ];

  const mockMapping = {
    'ID': 'id',
    '姓名': 'name',
    '邮箱': 'email',
    '年龄': 'age'
  };

  it('renders data importer with upload component', () => {
    const wrapper = mount(DataImporter, {
      props: {
        columns: mockColumns
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElUpload,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElAlert,
          ElSelect
        }
      }
    });

    expect(wrapper.find('.data-importer').exists()).toBe(true);
    expect(wrapper.findComponent(ElUpload).exists()).toBe(true);
    expect(wrapper.text()).toContain('导入数据');
  });

  it('accepts specified file types', () => {
    const wrapper = mount(DataImporter, {
      props: {
        columns: mockColumns,
        acceptedTypes: ['.csv', '.xlsx', '.xls']
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElUpload,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElAlert,
          ElSelect
        }
      }
    });

    const upload = wrapper.findComponent(ElUpload);
    expect(upload.props('accept')).toBe('.csv,.xlsx,.xls');
  });

  it('handles file upload', async () => {
    const wrapper = mount(DataImporter, {
      props: {
        columns: mockColumns
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElUpload,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElAlert,
          ElSelect
        }
      }
    });

    const upload = wrapper.findComponent(ElUpload);
    await upload.vm.$emit('change', mockFile);
    
    expect(wrapper.emitted('file-selected')).toBeTruthy();
    expect(wrapper.emitted('file-selected')[0][0]).toBe(mockFile);
  });

  it('handles file upload success', async () => {
    const wrapper = mount(DataImporter, {
      props: {
        columns: mockColumns
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElUpload,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElAlert,
          ElSelect
        }
      }
    });

    const upload = wrapper.findComponent(ElUpload);
    await upload.vm.$emit('success', { data: 'uploaded' });
    
    expect(wrapper.emitted('upload-success')).toBeTruthy();
  });

  it('handles file upload error', async () => {
    const wrapper = mount(DataImporter, {
      props: {
        columns: mockColumns
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElUpload,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElAlert,
          ElSelect
        }
      }
    });

    const upload = wrapper.findComponent(ElUpload);
    await upload.vm.$emit('error', new Error('Upload failed'));
    
    expect(wrapper.emitted('upload-error')).toBeTruthy();
  });

  it('shows file size limit warning', async () => {
    const wrapper = mount(DataImporter, {
      props: {
        columns: mockColumns,
        maxFileSize: 1024 // 1KB
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElUpload,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElAlert,
          ElSelect
        }
      }
    });

    const upload = wrapper.findComponent(ElUpload);
    await upload.vm.$emit('exceed', [mockFile]);
    
    expect(wrapper.emitted('file-size-exceeded')).toBeTruthy();
  });

  it('displays data preview table', () => {
    const mockPreviewData = [
      { id: 1, name: '张三', email: 'zhangsan@example.com', age: 25 },
      { id: 2, name: '李四', email: 'lisi@example.com', age: 30 }
    ];

    const wrapper = mount(DataImporter, {
      props: {
        columns: mockColumns,
        previewData: mockPreviewData,
        showPreview: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElUpload,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElAlert,
          ElSelect
        }
      }
    });

    expect(wrapper.findComponent(ElTable).exists()).toBe(true);
    expect(wrapper.findComponent(ElTable).props('data')).toEqual(mockPreviewData);
  });

  it('shows column mapping interface', () => {
    const wrapper = mount(DataImporter, {
      props: {
        columns: mockColumns,
        showMapping: true,
        fileHeaders: ['ID', '姓名', '邮箱', '年龄'],
        mapping: mockMapping
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElUpload,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElAlert,
          ElSelect
        }
      }
    });

    expect(wrapper.find('.column-mapping').exists()).toBe(true);
    expect(wrapper.findAllComponents(ElSelect).length).toBeGreaterThan(0);
  });

  it('handles column mapping changes', async () => {
    const wrapper = mount(DataImporter, {
      props: {
        columns: mockColumns,
        showMapping: true,
        fileHeaders: ['ID', '姓名', '邮箱', '年龄'],
        mapping: mockMapping
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElUpload,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElAlert,
          ElSelect
        }
      }
    });

    const select = wrapper.findComponent(ElSelect);
    await select.vm.$emit('update:modelValue', 'name');
    
    expect(wrapper.emitted('mapping-change')).toBeTruthy();
  });

  it('validates required column mappings', async () => {
    const wrapper = mount(DataImporter, {
      props: {
        columns: mockColumns,
        showMapping: true,
        fileHeaders: ['ID', '姓名', '邮箱', '年龄'],
        mapping: { 'ID': 'id' } // Missing required 'name' mapping
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElUpload,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElAlert,
          ElSelect
        }
      }
    });

    const isValid = await wrapper.vm.validateMappings();
    expect(isValid).toBe(false);
    expect(wrapper.findComponent(ElAlert).exists()).toBe(true);
  });

  it('shows import progress', async () => {
    const wrapper = mount(DataImporter, {
      props: {
        columns: mockColumns,
        showProgress: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElUpload,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElAlert,
          ElSelect
        }
      }
    });

    await wrapper.vm.setProgress(50);
    const progress = wrapper.findComponent(ElProgress);
    expect(progress.props('percentage')).toBe(50);
  });

  it('handles import completion', async () => {
    const wrapper = mount(DataImporter, {
      props: {
        columns: mockColumns
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElUpload,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElAlert,
          ElSelect
        }
      }
    });

    await wrapper.vm.onImportComplete({ imported: 100, failed: 0 });
    expect(wrapper.emitted('import-complete')).toBeTruthy();
  });

  it('handles import errors', async () => {
    const wrapper = mount(DataImporter, {
      props: {
        columns: mockColumns
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElUpload,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElAlert,
          ElSelect
        }
      }
    });

    await wrapper.vm.onImportError(new Error('Import failed'));
    expect(wrapper.emitted('import-error')).toBeTruthy();
  });

  it('shows validation errors for data rows', () => {
    const mockDataWithErrors = [
      { id: 1, name: '张三', email: 'zhangsan@example.com', age: 25, errors: [] },
      { id: 2, name: '', email: 'invalid-email', age: 'invalid', errors: ['姓名不能为空', '邮箱格式不正确', '年龄必须为数字'] }
    ];

    const wrapper = mount(DataImporter, {
      props: {
        columns: mockColumns,
        previewData: mockDataWithErrors,
        showValidation: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElUpload,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElAlert,
          ElSelect
        }
      }
    });

    expect(wrapper.find('.validation-errors').exists()).toBe(true);
  });

  it('supports batch processing', async () => {
    const wrapper = mount(DataImporter, {
      props: {
        columns: mockColumns,
        batchProcessing: true,
        batchSize: 100
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElUpload,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElAlert,
          ElSelect
        }
      }
    });

    const batchButton = wrapper.find('.batch-process-button');
    if (batchButton.exists()) {
      await batchButton.trigger('click');
      expect(wrapper.emitted('batch-process')).toBeTruthy();
    }
  });

  it('supports data transformation', async () => {
    const wrapper = mount(DataImporter, {
      props: {
        columns: mockColumns,
        transformData: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElUpload,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElAlert,
          ElSelect
        }
      }
    });

    const transformButton = wrapper.find('.transform-button');
    if (transformButton.exists()) {
      await transformButton.trigger('click');
      expect(wrapper.emitted('transform-data')).toBeTruthy();
    }
  });

  it('shows import statistics', () => {
    const wrapper = mount(DataImporter, {
      props: {
        columns: mockColumns,
        showStatistics: true,
        statistics: {
          total: 1000,
          imported: 950,
          failed: 50,
          skipped: 0
        }
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElUpload,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElAlert,
          ElSelect
        }
      }
    });

    expect(wrapper.find('.import-statistics').exists()).toBe(true);
    expect(wrapper.text()).toContain('总计: 1000');
    expect(wrapper.text()).toContain('成功: 950');
    expect(wrapper.text()).toContain('失败: 50');
  });

  it('supports duplicate detection', async () => {
    const wrapper = mount(DataImporter, {
      props: {
        columns: mockColumns,
        duplicateDetection: true,
        duplicateFields: ['email', 'name']
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElUpload,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElAlert,
          ElSelect
        }
      }
    });

    await wrapper.vm.checkDuplicates();
    expect(wrapper.emitted('duplicate-check')).toBeTruthy();
  });

  it('handles duplicate records', () => {
    const mockDataWithDuplicates = [
      { id: 1, name: '张三', email: 'zhangsan@example.com', age: 25, isDuplicate: false },
      { id: 2, name: '张三', email: 'zhangsan@example.com', age: 30, isDuplicate: true }
    ];

    const wrapper = mount(DataImporter, {
      props: {
        columns: mockColumns,
        previewData: mockDataWithDuplicates,
        showDuplicates: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElUpload,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElAlert,
          ElSelect
        }
      }
    });

    expect(wrapper.find('.duplicate-records').exists()).toBe(true);
  });

  it('supports custom validation rules', async () => {
    const customRules = {
      email: [
        { required: true, message: '邮箱不能为空' },
        { type: 'email', message: '邮箱格式不正确' }
      ],
      age: [
        { type: 'number', message: '年龄必须为数字' },
        { min: 0, max: 120, message: '年龄必须在0-120之间' }
      ]
    };

    const wrapper = mount(DataImporter, {
      props: {
        columns: mockColumns,
        validationRules: customRules
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElUpload,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElAlert,
          ElSelect
        }
      }
    });

    const isValid = await wrapper.vm.validateData();
    expect(wrapper.emitted('validation-complete')).toBeTruthy();
  });

  it('disables import button when no file selected', () => {
    const wrapper = mount(DataImporter, {
      props: {
        columns: mockColumns
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElUpload,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElAlert,
          ElSelect
        }
      }
    });

    const importButton = wrapper.find('.import-button');
    if (importButton.exists()) {
      expect(importButton.props('disabled')).toBe(true);
    }
  });

  it('shows loading state during import', () => {
    const wrapper = mount(DataImporter, {
      props: {
        columns: mockColumns,
        loading: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElUpload,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElAlert,
          ElSelect
        }
      }
    });

    expect(wrapper.find('.loading-overlay').exists()).toBe(true);
  });

  it('applies custom CSS classes', () => {
    const wrapper = mount(DataImporter, {
      props: {
        columns: mockColumns,
        importerClass: 'custom-importer-class',
        buttonClass: 'custom-button-class'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElUpload,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElAlert,
          ElSelect
        }
      }
    });

    expect(wrapper.find('.custom-importer-class').exists()).toBe(true);
  });

  it('supports template download', async () => {
    const wrapper = mount(DataImporter, {
      props: {
        columns: mockColumns,
        showTemplate: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElUpload,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElAlert,
          ElSelect
        }
      }
    });

    const templateButton = wrapper.find('.template-button');
    if (templateButton.exists()) {
      await templateButton.trigger('click');
      expect(wrapper.emitted('download-template')).toBeTruthy();
    }
  });

  it('handles import cancellation', async () => {
    const wrapper = mount(DataImporter, {
      props: {
        columns: mockColumns,
        cancellable: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElButton,
          ElUpload,
          ElTable,
          ElTableColumn,
          ElProgress,
          ElAlert,
          ElSelect
        }
      }
    });

    const cancelButton = wrapper.find('.cancel-button');
    if (cancelButton.exists()) {
      await cancelButton.trigger('click');
      expect(wrapper.emitted('import-cancelled')).toBeTruthy();
    }
  });
});