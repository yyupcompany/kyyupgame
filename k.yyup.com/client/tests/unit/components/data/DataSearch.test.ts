
// 使用全局表单引用Mock
beforeEach(() => {
  // 设置表单引用Mock
  if (typeof formRef !== 'undefined' && formRef.value) {
    Object.assign(formRef.value, global.mockFormRef)
  }
  if (typeof editInput !== 'undefined' && editInput.value) {
    Object.assign(editInput.value, global.mockInputRef)
  }
})


// Element Plus Mock for form validation
const mockFormRef = {
  clearValidate: vi.fn(),
  resetFields: vi.fn(),
  validate: vi.fn(() => Promise.resolve(true)),
  validateField: vi.fn()
}

const mockInputRef = {
  focus: vi.fn(),
  blur: vi.fn(),
  select: vi.fn()
}

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElForm: {
    name: 'ElForm',
    template: '<form><slot /></form>'
  },
  ElFormItem: {
    name: 'ElFormItem',
    template: '<div><slot /></div>'
  },
  ElInput: {
    name: 'ElInput',
    template: '<input />'
  },
  ElButton: {
    name: 'ElButton',
    template: '<button><slot /></button>'
  }
}))

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
import DataSearch from '@/components/data/DataSearch.vue';
import { ElInput, ElButton, ElSelect, ElCard, ElTag, ElDropdown, ElDropdownMenu, ElDropdownItem, ElAutocomplete } from 'element-plus';

// Mock Element Plus components
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus');
  return {
    ...actual,
    ElInput: {
      name: 'ElInput',
      template: '<input type="text" />',
      props: ['modelValue', 'placeholder', 'clearable', 'prefixIcon'],
      emits: ['update:modelValue', 'input', 'clear', 'focus', 'blur']
    },
    ElButton: {
      name: 'ElButton',
      template: '<button><slot></slot></button>',
      props: ['type', 'size', 'icon', 'loading', 'disabled']
    },
    ElSelect: {
      name: 'ElSelect',
      template: '<select><slot></slot></select>',
      props: ['modelValue', 'placeholder', 'multiple'],
      emits: ['update:modelValue']
    },
    ElCard: {
      name: 'ElCard',
      template: '<div class="el-card"><slot></slot></div>',
      props: ['shadow']
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
    },
    ElAutocomplete: {
      name: 'ElAutocomplete',
      template: '<input type="text" />',
      props: ['modelValue', 'placeholder', 'fetchSuggestions'],
      emits: ['update:modelValue', 'select']
    }
  };
});

describe('DataSearch.vue', () => {
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  const mockFields = [
    { prop: 'name', label: '姓名', searchable: true },
    { prop: 'email', label: '邮箱', searchable: true },
    { prop: 'phone', label: '电话', searchable: true },
    { prop: 'status', label: '状态', searchable: false },
    { prop: 'address', label: '地址', searchable: true }
  ];

  const mockSuggestions = [
    { value: '张三' },
    { value: '李四' },
    { value: '王五' }
  ];

  it('renders data search component', () => {
    const wrapper = mount(DataSearch, {
      props: {
        fields: mockFields
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElButton,
          ElSelect,
          ElCard,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElAutocomplete
        }
      }
    });

    expect(wrapper.find('.data-search').exists()).toBe(true);
    expect(wrapper.findComponent(ElInput).exists()).toBe(true);
  });

  it('displays search input with placeholder', () => {
    const wrapper = mount(DataSearch, {
      props: {
        fields: mockFields,
        placeholder: '搜索姓名、邮箱、电话...'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElButton,
          ElSelect,
          ElCard,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElAutocomplete
        }
      }
    });

    const searchInput = wrapper.findComponent(ElInput);
    expect(searchInput.props('placeholder')).toBe('搜索姓名、邮箱、电话...');
  });

  it('shows search button', () => {
    const wrapper = mount(DataSearch, {
      props: {
        fields: mockFields,
        showSearchButton: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElButton,
          ElSelect,
          ElCard,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElAutocomplete
        }
      }
    });

    const searchButton = wrapper.find('.search-button');
    expect(searchButton.exists()).toBe(true);
  });

  it('handles search input', async () => {
    const wrapper = mount(DataSearch, {
      props: {
        fields: mockFields
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElButton,
          ElSelect,
          ElCard,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElAutocomplete
        }
      }
    });

    const searchInput = wrapper.findComponent(ElInput);
    await searchInput.setValue('张三');
    
    expect(wrapper.emitted('input')).toBeTruthy();
    expect(wrapper.emitted('input')[0][0]).toBe('张三');
  });

  it('emits search event on search button click', async () => {
    const wrapper = mount(DataSearch, {
      props: {
        fields: mockFields,
        showSearchButton: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElButton,
          ElSelect,
          ElCard,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElAutocomplete
        }
      }
    });

    const searchInput = wrapper.findComponent(ElInput);
    await searchInput.setValue('张三');

    const searchButton = wrapper.find('.search-button');
    if (searchButton.exists()) {
      await searchButton.trigger('click');
      expect(wrapper.emitted('search')).toBeTruthy();
      expect(wrapper.emitted('search')[0][0]).toBe('张三');
    }
  });

  it('supports real-time search', async () => {
    const wrapper = mount(DataSearch, {
      props: {
        fields: mockFields,
        realtime: true,
        debounce: 300
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElButton,
          ElSelect,
          ElCard,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElAutocomplete
        }
      }
    });

    const searchInput = wrapper.findComponent(ElInput);
    await searchInput.setValue('李四');
    
    expect(wrapper.emitted('realtime-search')).toBeTruthy();
  });

  it('shows field selection options', () => {
    const wrapper = mount(DataSearch, {
      props: {
        fields: mockFields,
        showFieldSelect: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElButton,
          ElSelect,
          ElCard,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElAutocomplete
        }
      }
    });

    expect(wrapper.findComponent(ElSelect).exists()).toBe(true);
    expect(wrapper.text()).toContain('姓名');
    expect(wrapper.text()).toContain('邮箱');
    expect(wrapper.text()).toContain('电话');
    expect(wrapper.text()).toContain('地址');
    // Non-searchable field should not appear
    expect(wrapper.text()).not.toContain('状态');
  });

  it('handles field selection changes', async () => {
    const wrapper = mount(DataSearch, {
      props: {
        fields: mockFields,
        showFieldSelect: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElButton,
          ElSelect,
          ElCard,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElAutocomplete
        }
      }
    });

    const fieldSelect = wrapper.findComponent(ElSelect);
    await fieldSelect.vm.$emit('update:modelValue', ['name', 'email']);
    
    expect(wrapper.emitted('field-change')).toBeTruthy();
    expect(wrapper.emitted('field-change')[0][0]).toEqual(['name', 'email']);
  });

  it('displays search history', () => {
    const wrapper = mount(DataSearch, {
      props: {
        fields: mockFields,
        showHistory: true,
        searchHistory: ['张三', '李四', '王五']
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElButton,
          ElSelect,
          ElCard,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElAutocomplete
        }
      }
    });

    expect(wrapper.find('.search-history').exists()).toBe(true);
    expect(wrapper.text()).toContain('张三');
    expect(wrapper.text()).toContain('李四');
    expect(wrapper.text()).toContain('王五');
  });

  it('handles history item click', async () => {
    const wrapper = mount(DataSearch, {
      props: {
        fields: mockFields,
        showHistory: true,
        searchHistory: ['张三']
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElButton,
          ElSelect,
          ElCard,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElAutocomplete
        }
      }
    });

    const historyItem = wrapper.find('.history-item');
    if (historyItem.exists()) {
      await historyItem.trigger('click');
      expect(wrapper.emitted('history-selected')).toBeTruthy();
      expect(wrapper.emitted('history-selected')[0][0]).toBe('张三');
    }
  });

  it('shows search suggestions', () => {
    const wrapper = mount(DataSearch, {
      props: {
        fields: mockFields,
        showSuggestions: true,
        suggestions: mockSuggestions
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElButton,
          ElSelect,
          ElCard,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElAutocomplete
        }
      }
    });

    expect(wrapper.findComponent(ElAutocomplete).exists()).toBe(true);
  });

  it('handles suggestion selection', async () => {
    const wrapper = mount(DataSearch, {
      props: {
        fields: mockFields,
        showSuggestions: true,
        suggestions: mockSuggestions
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElButton,
          ElSelect,
          ElCard,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElAutocomplete
        }
      }
    });

    const autocomplete = wrapper.findComponent(ElAutocomplete);
    await autocomplete.vm.$emit('select', mockSuggestions[0]);
    
    expect(wrapper.emitted('suggestion-selected')).toBeTruthy();
    expect(wrapper.emitted('suggestion-selected')[0][0]).toEqual(mockSuggestions[0]);
  });

  it('displays active search filters', () => {
    const wrapper = mount(DataSearch, {
      props: {
        fields: mockFields,
        activeFilters: [
          { field: 'name', value: '张三', operator: 'contains' },
          { field: 'email', value: 'example.com', operator: 'contains' }
        ]
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElButton,
          ElSelect,
          ElCard,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElAutocomplete
        }
      }
    });

    const tags = wrapper.findAllComponents(ElTag);
    expect(tags.length).toBe(2);
    expect(wrapper.text()).toContain('张三');
    expect(wrapper.text()).toContain('example.com');
  });

  it('handles filter removal', async () => {
    const wrapper = mount(DataSearch, {
      props: {
        fields: mockFields,
        activeFilters: [
          { field: 'name', value: '张三', operator: 'contains' }
        ]
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElButton,
          ElSelect,
          ElCard,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElAutocomplete
        }
      }
    });

    const tag = wrapper.findComponent(ElTag);
    await tag.vm.$emit('close');
    
    expect(wrapper.emitted('filter-removed')).toBeTruthy();
  });

  it('shows search options dropdown', () => {
    const wrapper = mount(DataSearch, {
      props: {
        fields: mockFields,
        showOptions: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElButton,
          ElSelect,
          ElCard,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElAutocomplete
        }
      }
    });

    expect(wrapper.findComponent(ElDropdown).exists()).toBe(true);
  });

  it('handles option selection', async () => {
    const wrapper = mount(DataSearch, {
      props: {
        fields: mockFields,
        showOptions: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElButton,
          ElSelect,
          ElCard,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElAutocomplete
        }
      }
    });

    const dropdown = wrapper.findComponent(ElDropdown);
    await dropdown.vm.$emit('command', 'case-sensitive');
    
    expect(wrapper.emitted('option-selected')).toBeTruthy();
    expect(wrapper.emitted('option-selected')[0][0]).toBe('case-sensitive');
  });

  it('supports advanced search mode', () => {
    const wrapper = mount(DataSearch, {
      props: {
        fields: mockFields,
        advancedMode: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElButton,
          ElSelect,
          ElCard,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElAutocomplete
        }
      }
    });

    expect(wrapper.find('.advanced-search').exists()).toBe(true);
  });

  it('shows search operators in advanced mode', () => {
    const wrapper = mount(DataSearch, {
      props: {
        fields: mockFields,
        advancedMode: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElButton,
          ElSelect,
          ElCard,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElAutocomplete
        }
      }
    });

    expect(wrapper.text()).toContain('AND');
    expect(wrapper.text()).toContain('OR');
    expect(wrapper.text()).toContain('NOT');
  });

  it('emits clear event', async () => {
    const wrapper = mount(DataSearch, {
      props: {
        fields: mockFields,
        showClearButton: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElButton,
          ElSelect,
          ElCard,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElAutocomplete
        }
      }
    });

    const clearButton = wrapper.find('.clear-button');
    if (clearButton.exists()) {
      await clearButton.trigger('click');
      expect(wrapper.emitted('clear')).toBeTruthy();
    }
  });

  it('shows search statistics', () => {
    const wrapper = mount(DataSearch, {
      props: {
        fields: mockFields,
        showStatistics: true,
        statistics: {
          totalResults: 100,
          searchTime: 0.05,
          searchQuery: '张三'
        }
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElButton,
          ElSelect,
          ElCard,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElAutocomplete
        }
      }
    });

    expect(wrapper.find('.search-statistics').exists()).toBe(true);
    expect(wrapper.text()).toContain('100');
    expect(wrapper.text()).toContain('0.05s');
  });

  it('supports search shortcuts', () => {
    const wrapper = mount(DataSearch, {
      props: {
        fields: mockFields,
        shortcuts: [
          { key: 'Ctrl+F', action: 'focus' },
          { key: 'Esc', action: 'clear' }
        ]
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElButton,
          ElSelect,
          ElCard,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElAutocomplete
        }
      }
    });

    expect(wrapper.find('.search-shortcuts').exists()).toBe(true);
  });

  it('handles keyboard shortcuts', async () => {
    const wrapper = mount(DataSearch, {
      props: {
        fields: mockFields
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElButton,
          ElSelect,
          ElCard,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElAutocomplete
        }
      }
    });

    await wrapper.vm.handleShortcut('Enter');
    expect(wrapper.emitted('search')).toBeTruthy();
  });

  it('shows loading state', () => {
    const wrapper = mount(DataSearch, {
      props: {
        fields: mockFields,
        loading: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElButton,
          ElSelect,
          ElCard,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElAutocomplete
        }
      }
    });

    expect(wrapper.find('.loading-overlay').exists()).toBe(true);
  });

  it('applies custom CSS classes', () => {
    const wrapper = mount(DataSearch, {
      props: {
        fields: mockFields,
        searchClass: 'custom-search-class'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElButton,
          ElSelect,
          ElCard,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElAutocomplete
        }
      }
    });

    expect(wrapper.find('.custom-search-class').exists()).toBe(true);
  });

  it('supports fuzzy search', () => {
    const wrapper = mount(DataSearch, {
      props: {
        fields: mockFields,
        fuzzySearch: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElButton,
          ElSelect,
          ElCard,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElAutocomplete
        }
      }
    });

    expect(wrapper.find('.fuzzy-search').exists()).toBe(true);
  });

  it('handles focus and blur events', async () => {
    const wrapper = mount(DataSearch, {
      props: {
        fields: mockFields
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElButton,
          ElSelect,
          ElCard,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElAutocomplete
        }
      }
    });

    const searchInput = wrapper.findComponent(ElInput);
    await searchInput.trigger('focus');
    expect(wrapper.emitted('focus')).toBeTruthy();

    await searchInput.trigger('blur');
    expect(wrapper.emitted('blur')).toBeTruthy();
  });

  it('supports search presets', () => {
    const wrapper = mount(DataSearch, {
      props: {
        fields: mockFields,
        presets: [
          { name: '活跃用户', query: 'status:active' },
          { name: '新用户', query: 'date:>2023-01-01' }
        ]
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElInput,
          ElButton,
          ElSelect,
          ElCard,
          ElTag,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElAutocomplete
        }
      }
    });

    expect(wrapper.find('.search-presets').exists()).toBe(true);
    expect(wrapper.text()).toContain('活跃用户');
    expect(wrapper.text()).toContain('新用户');
  });
});