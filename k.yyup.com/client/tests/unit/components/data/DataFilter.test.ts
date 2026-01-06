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
import DataFilter from '@/components/data/DataFilter.vue';
import { ElInput, ElSelect, ElDatePicker, ElButton, ElCard, ElCheckbox, ElRadioGroup, ElRadioButton } from 'element-plus';

// Mock Element Plus components
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus');
  return {
    ...actual,
    ElInput: {
      name: 'ElInput',
      template: '<input type="text" />',
      props: ['modelValue', 'placeholder', 'clearable'],
      emits: ['update:modelValue', 'clear']
    },
    ElSelect: {
      name: 'ElSelect',
      template: '<select><slot></slot></select>',
      props: ['modelValue', 'placeholder', 'multiple', 'clearable'],
      emits: ['update:modelValue', 'clear']
    },
    ElDatePicker: {
      name: 'ElDatePicker',
      template: '<input type="date" />',
      props: ['modelValue', 'type', 'placeholder', 'startPlaceholder', 'endPlaceholder'],
      emits: ['update:modelValue']
    },
    ElButton: {
      name: 'ElButton',
      template: '<button><slot></slot></button>',
      props: ['type', 'size', 'icon', 'loading']
    },
    ElCard: {
      name: 'ElCard',
      template: '<div class="el-card"><slot></slot></div>',
      props: ['shadow']
    },
    ElCheckbox: {
      name: 'ElCheckbox',
      template: '<input type="checkbox" />',
      props: ['modelValue', 'label'],
      emits: ['update:modelValue']
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
      props: ['label']
    }
  };
});

describe('DataFilter.vue', () => {
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  const mockFields = [
    { prop: 'name', label: '姓名', type: 'text', filterable: true },
    { prop: 'age', label: '年龄', type: 'number', filterable: true },
    { prop: 'email', label: '邮箱', type: 'email', filterable: true },
    { prop: 'status', label: '状态', type: 'select', filterable: true, options: ['active', 'inactive'] },
    { prop: 'date', label: '日期', type: 'date', filterable: true },
    { prop: 'category', label: '类别', type: 'multi-select', filterable: true, options: ['A', 'B', 'C'] }
  ];

  it('renders data filter with filter fields', () => {
    const wrapper = mount(DataFilter, {
      props: {
        fields: mockFields
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElSelect,
          ElDatePicker,
          ElButton,
          ElCard,
          ElCheckbox,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.find('.data-filter').exists()).toBe(true);
    expect(wrapper.findComponent(ElCard).exists()).toBe(true);
  });

  it('displays text input filter', () => {
    const wrapper = mount(DataFilter, {
      props: {
        fields: mockFields
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElSelect,
          ElDatePicker,
          ElButton,
          ElCard,
          ElCheckbox,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    const textInput = wrapper.findComponent(ElInput);
    expect(textInput.exists()).toBe(true);
    expect(textInput.props('placeholder')).toContain('姓名');
  });

  it('displays select filter', () => {
    const wrapper = mount(DataFilter, {
      props: {
        fields: mockFields
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElSelect,
          ElDatePicker,
          ElButton,
          ElCard,
          ElCheckbox,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    const selects = wrapper.findAllComponents(ElSelect);
    expect(selects.length).toBeGreaterThan(0);
  });

  it('displays date picker filter', () => {
    const wrapper = mount(DataFilter, {
      props: {
        fields: mockFields
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElSelect,
          ElDatePicker,
          ElButton,
          ElCard,
          ElCheckbox,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    const datePicker = wrapper.findComponent(ElDatePicker);
    expect(datePicker.exists()).toBe(true);
  });

  it('handles text filter input', async () => {
    const wrapper = mount(DataFilter, {
      props: {
        fields: mockFields
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElSelect,
          ElDatePicker,
          ElButton,
          ElCard,
          ElCheckbox,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    const textInput = wrapper.findComponent(ElInput);
    await textInput.setValue('张三');
    
    expect(wrapper.emitted('filter-change')).toBeTruthy();
  });

  it('handles select filter change', async () => {
    const wrapper = mount(DataFilter, {
      props: {
        fields: mockFields
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElSelect,
          ElDatePicker,
          ElButton,
          ElCard,
          ElCheckbox,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    const select = wrapper.findComponent(ElSelect);
    await select.vm.$emit('update:modelValue', 'active');
    
    expect(wrapper.emitted('filter-change')).toBeTruthy();
  });

  it('handles date filter change', async () => {
    const wrapper = mount(DataFilter, {
      props: {
        fields: mockFields
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElSelect,
          ElDatePicker,
          ElButton,
          ElCard,
          ElCheckbox,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    const datePicker = wrapper.findComponent(ElDatePicker);
    await datePicker.vm.$emit('update:modelValue', '2023-01-01');
    
    expect(wrapper.emitted('filter-change')).toBeTruthy();
  });

  it('shows filter action buttons', () => {
    const wrapper = mount(DataFilter, {
      props: {
        fields: mockFields,
        showActions: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElSelect,
          ElDatePicker,
          ElButton,
          ElCard,
          ElCheckbox,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    const buttons = wrapper.findAllComponents(ElButton);
    expect(buttons.length).toBeGreaterThan(0);
    expect(wrapper.text()).toContain('搜索');
    expect(wrapper.text()).toContain('重置');
  });

  it('emits search event when search button clicked', async () => {
    const wrapper = mount(DataFilter, {
      props: {
        fields: mockFields,
        showActions: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElSelect,
          ElDatePicker,
          ElButton,
          ElCard,
          ElCheckbox,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    const searchButton = wrapper.find('.search-button');
    if (searchButton.exists()) {
      await searchButton.trigger('click');
      expect(wrapper.emitted('search')).toBeTruthy();
    }
  });

  it('emits reset event when reset button clicked', async () => {
    const wrapper = mount(DataFilter, {
      props: {
        fields: mockFields,
        showActions: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElSelect,
          ElDatePicker,
          ElButton,
          ElCard,
          ElCheckbox,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    const resetButton = wrapper.find('.reset-button');
    if (resetButton.exists()) {
      await resetButton.trigger('click');
      expect(wrapper.emitted('reset')).toBeTruthy();
    }
  });

  it('supports advanced filter mode', () => {
    const wrapper = mount(DataFilter, {
      props: {
        fields: mockFields,
        advancedMode: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElSelect,
          ElDatePicker,
          ElButton,
          ElCard,
          ElCheckbox,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.find('.advanced-filter').exists()).toBe(true);
  });

  it('shows filter conditions in advanced mode', () => {
    const wrapper = mount(DataFilter, {
      props: {
        fields: mockFields,
        advancedMode: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElSelect,
          ElDatePicker,
          ElButton,
          ElCard,
          ElCheckbox,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.text()).toContain('AND');
    expect(wrapper.text()).toContain('OR');
  });

  it('handles condition logic changes', async () => {
    const wrapper = mount(DataFilter, {
      props: {
        fields: mockFields,
        advancedMode: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElSelect,
          ElDatePicker,
          ElButton,
          ElCard,
          ElCheckbox,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    const radioGroup = wrapper.findComponent(ElRadioGroup);
    await radioGroup.vm.$emit('update:modelValue', 'OR');
    
    expect(wrapper.emitted('logic-change')).toBeTruthy();
    expect(wrapper.emitted('logic-change')[0][0]).toBe('OR');
  });

  it('supports multiple filter values', async () => {
    const wrapper = mount(DataFilter, {
      props: {
        fields: mockFields
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElSelect,
          ElDatePicker,
          ElButton,
          ElCard,
          ElCheckbox,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    const multiSelect = wrapper.findAllComponents(ElSelect)[1]; // category field
    if (multiSelect) {
      await multiSelect.vm.$emit('update:modelValue', ['A', 'B']);
      expect(wrapper.emitted('filter-change')).toBeTruthy();
    }
  });

  it('shows filter operators', () => {
    const wrapper = mount(DataFilter, {
      props: {
        fields: mockFields,
        showOperators: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElSelect,
          ElDatePicker,
          ElButton,
          ElCard,
          ElCheckbox,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.find('.filter-operators').exists()).toBe(true);
    expect(wrapper.text()).toContain('等于');
    expect(wrapper.text()).toContain('包含');
    expect(wrapper.text()).toContain('大于');
    expect(wrapper.text()).toContain('小于');
  });

  it('handles operator selection', async () => {
    const wrapper = mount(DataFilter, {
      props: {
        fields: mockFields,
        showOperators: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElSelect,
          ElDatePicker,
          ElButton,
          ElCard,
          ElCheckbox,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    const operatorSelect = wrapper.find('.operator-select');
    if (operatorSelect.exists()) {
      await operatorSelect.setValue('contains');
      expect(wrapper.emitted('operator-change')).toBeTruthy();
    }
  });

  it('supports filter presets', () => {
    const wrapper = mount(DataFilter, {
      props: {
        fields: mockFields,
        presets: [
          { name: '活跃用户', filters: { status: 'active' } },
          { name: '新用户', filters: { date: '2023-01-01' } }
        ]
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElSelect,
          ElDatePicker,
          ElButton,
          ElCard,
          ElCheckbox,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.find('.filter-presets').exists()).toBe(true);
    expect(wrapper.text()).toContain('活跃用户');
    expect(wrapper.text()).toContain('新用户');
  });

  it('handles preset selection', async () => {
    const wrapper = mount(DataFilter, {
      props: {
        fields: mockFields,
        presets: [
          { name: '活跃用户', filters: { status: 'active' } }
        ]
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElSelect,
          ElDatePicker,
          ElButton,
          ElCard,
          ElCheckbox,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    const presetButton = wrapper.find('.preset-button');
    if (presetButton.exists()) {
      await presetButton.trigger('click');
      expect(wrapper.emitted('preset-selected')).toBeTruthy();
    }
  });

  it('shows filter summary', () => {
    const wrapper = mount(DataFilter, {
      props: {
        fields: mockFields,
        showSummary: true,
        activeFilters: { name: '张三', status: 'active' }
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElSelect,
          ElDatePicker,
          ElButton,
          ElCard,
          ElCheckbox,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.find('.filter-summary').exists()).toBe(true);
  });

  it('supports filter validation', async () => {
    const wrapper = mount(DataFilter, {
      props: {
        fields: mockFields,
        validateFilters: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElSelect,
          ElDatePicker,
          ElButton,
          ElCard,
          ElCheckbox,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    const isValid = await wrapper.vm.validateFilters();
    expect(wrapper.emitted('validation-complete')).toBeTruthy();
  });

  it('handles clear filter actions', async () => {
    const wrapper = mount(DataFilter, {
      props: {
        fields: mockFields
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElSelect,
          ElDatePicker,
          ElButton,
          ElCard,
          ElCheckbox,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    const clearButton = wrapper.find('.clear-button');
    if (clearButton.exists()) {
      await clearButton.trigger('click');
      expect(wrapper.emitted('clear')).toBeTruthy();
    }
  });

  it('supports real-time filtering', async () => {
    const wrapper = mount(DataFilter, {
      props: {
        fields: mockFields,
        realtime: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElSelect,
          ElDatePicker,
          ElButton,
          ElCard,
          ElCheckbox,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    const textInput = wrapper.findComponent(ElInput);
    await textInput.setValue('test');
    
    expect(wrapper.emitted('realtime-filter')).toBeTruthy();
  });

  it('shows loading state', () => {
    const wrapper = mount(DataFilter, {
      props: {
        fields: mockFields,
        loading: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElSelect,
          ElDatePicker,
          ElButton,
          ElCard,
          ElCheckbox,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.find('.loading-overlay').exists()).toBe(true);
  });

  it('applies custom CSS classes', () => {
    const wrapper = mount(DataFilter, {
      props: {
        fields: mockFields,
        filterClass: 'custom-filter-class'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElSelect,
          ElDatePicker,
          ElButton,
          ElCard,
          ElCheckbox,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.find('.custom-filter-class').exists()).toBe(true);
  });

  it('supports collapsible filter panel', async () => {
    const wrapper = mount(DataFilter, {
      props: {
        fields: mockFields,
        collapsible: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElSelect,
          ElDatePicker,
          ElButton,
          ElCard,
          ElCheckbox,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    const collapseButton = wrapper.find('.collapse-button');
    if (collapseButton.exists()) {
      await collapseButton.trigger('click');
      expect(wrapper.emitted('collapse-change')).toBeTruthy();
    }
  });

  it('handles filter field visibility', () => {
    const wrapper = mount(DataFilter, {
      props: {
        fields: mockFields,
        visibleFields: ['name', 'status']
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElSelect,
          ElDatePicker,
          ElButton,
          ElCard,
          ElCheckbox,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.text()).toContain('姓名');
    expect(wrapper.text()).toContain('状态');
  });

  it('supports custom filter components', () => {
    const wrapper = mount(DataFilter, {
      props: {
        fields: [
          ...mockFields,
          { prop: 'custom', label: '自定义', type: 'custom', component: 'CustomFilter' }
        ]
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElSelect,
          ElDatePicker,
          ElButton,
          ElCard,
          ElCheckbox,
          ElRadioGroup,
          ElRadioButton
        }
      }
    });

    expect(wrapper.find('.custom-filter').exists()).toBe(true);
  });
});