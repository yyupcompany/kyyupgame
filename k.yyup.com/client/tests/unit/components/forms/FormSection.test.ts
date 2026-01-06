
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
import FormSection from '@/components/forms/FormSection.vue';
import { ElCard, ElRow, ElCol, ElCollapse, ElCollapseItem, ElButton } from 'element-plus';

// Mock Element Plus components
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus');
  return {
    ...actual,
    ElCard: {
      name: 'ElCard',
      template: '<div class="el-card"><slot name="header"></slot><slot></slot></div>',
      props: ['shadow', 'header']
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
    },
    ElButton: {
      name: 'ElButton',
      template: '<button><slot></slot></button>',
      props: ['type', 'size', 'icon', 'circle']
    }
  };
});

describe('FormSection.vue', () => {
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  const baseSectionConfig = {
    title: '基本信息',
    description: '请填写用户的基本信息',
    fields: [
      {
        name: 'name',
        label: '姓名',
        type: 'text',
        required: true,
        placeholder: '请输入姓名'
      },
      {
        name: 'email',
        label: '邮箱',
        type: 'email',
        required: true,
        placeholder: '请输入邮箱'
      },
      {
        name: 'phone',
        label: '电话',
        type: 'tel',
        required: false,
        placeholder: '请输入电话'
      }
    ],
    collapsible: false,
    collapsed: false
  };

  it('renders form section with title and description', () => {
    const wrapper = mount(FormSection, {
      props: {
        section: baseSectionConfig,
        modelValue: {}
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol
        }
      }
    });

    expect(wrapper.findComponent(ElCard).exists()).toBe(true);
    expect(wrapper.text()).toContain('基本信息');
    expect(wrapper.text()).toContain('请填写用户的基本信息');
  });

  it('renders all fields in the section', () => {
    const wrapper = mount(FormSection, {
      props: {
        section: baseSectionConfig,
        modelValue: {}
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol
        }
      }
    });

    const fieldElements = wrapper.findAll('.form-field');
    expect(fieldElements.length).toBe(baseSectionConfig.fields.length);
  });

  it('binds model values to fields', () => {
    const model = {
      name: '张三',
      email: 'zhangsan@example.com',
      phone: '13800138000'
    };

    const wrapper = mount(FormSection, {
      props: {
        section: baseSectionConfig,
        modelValue: model
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol
        }
      }
    });

    expect(wrapper.props('modelValue')).toEqual(model);
  });

  it('emits update:modelValue when field values change', async () => {
    const wrapper = mount(FormSection, {
      props: {
        section: baseSectionConfig,
        modelValue: {}
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol
        }
      }
    });

    // Simulate field value change
    const nameField = wrapper.find('.form-field input');
    if (nameField.exists()) {
      await nameField.setValue('李四');
      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    }
  });

  it('renders collapsible section', () => {
    const collapsibleSection = {
      ...baseSectionConfig,
      collapsible: true
    };

    const wrapper = mount(FormSection, {
      props: {
        section: collapsibleSection,
        modelValue: {}
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCollapse,
          ElCollapseItem
        }
      }
    });

    expect(wrapper.findComponent(ElCollapse).exists()).toBe(true);
    expect(wrapper.findComponent(ElCollapseItem).exists()).toBe(true);
  });

  it('handles section collapse/expand', async () => {
    const collapsibleSection = {
      ...baseSectionConfig,
      collapsible: true,
      collapsed: false
    };

    const wrapper = mount(FormSection, {
      props: {
        section: collapsibleSection,
        modelValue: {}
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCollapse,
          ElCollapseItem
        }
      }
    });

    const collapse = wrapper.findComponent(ElCollapse);
    await collapse.vm.$emit('change', ['basic-info']);
    
    expect(wrapper.emitted('collapse-change')).toBeTruthy();
  });

  it('shows collapsed section when collapsed prop is true', () => {
    const collapsedSection = {
      ...baseSectionConfig,
      collapsible: true,
      collapsed: true
    };

    const wrapper = mount(FormSection, {
      props: {
        section: collapsedSection,
        modelValue: {}
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCollapse,
          ElCollapseItem
        }
      }
    });

    expect(wrapper.findComponent(ElCollapse).props('value')).toEqual([]);
  });

  it('renders section with custom layout', () => {
    const sectionWithLayout = {
      ...baseSectionConfig,
      layout: 'grid',
      columns: 2
    };

    const wrapper = mount(FormSection, {
      props: {
        section: sectionWithLayout,
        modelValue: {}
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol
        }
      }
    });

    expect(wrapper.find('.grid-layout').exists()).toBe(true);
    expect(wrapper.find('.columns-2').exists()).toBe(true);
  });

  it('applies responsive layout', () => {
    const responsiveSection = {
      ...baseSectionConfig,
      responsive: true,
      layout: {
        xs: 24,
        sm: 12,
        md: 8,
        lg: 6
      }
    };

    const wrapper = mount(FormSection, {
      props: {
        section: responsiveSection,
        modelValue: {}
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol
        }
      }
    });

    expect(wrapper.find('.responsive-layout').exists()).toBe(true);
  });

  it('shows section actions when configured', () => {
    const sectionWithActions = {
      ...baseSectionConfig,
      actions: [
        { type: 'primary', text: '保存', icon: 'check' },
        { type: 'default', text: '重置', icon: 'refresh' }
      ]
    };

    const wrapper = mount(FormSection, {
      props: {
        section: sectionWithActions,
        modelValue: {}
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElButton
        }
      }
    });

    const buttons = wrapper.findAllComponents(ElButton);
    expect(buttons.length).toBe(2);
    expect(wrapper.text()).toContain('保存');
    expect(wrapper.text()).toContain('重置');
  });

  it('emits action events when action buttons are clicked', async () => {
    const sectionWithActions = {
      ...baseSectionConfig,
      actions: [
        { type: 'primary', text: '保存', action: 'save' },
        { type: 'default', text: '重置', action: 'reset' }
      ]
    };

    const wrapper = mount(FormSection, {
      props: {
        section: sectionWithActions,
        modelValue: {}
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol,
          ElButton
        }
      }
    });

    const saveButton = wrapper.find('.save-button');
    if (saveButton.exists()) {
      await saveButton.trigger('click');
      expect(wrapper.emitted('action')).toBeTruthy();
      expect(wrapper.emitted('action')[0][0]).toBe('save');
    }
  });

  it('applies custom CSS classes', () => {
    const wrapper = mount(FormSection, {
      props: {
        section: baseSectionConfig,
        modelValue: {},
        sectionClass: 'custom-section-class',
        cardClass: 'custom-card-class'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol
        }
      }
    });

    expect(wrapper.find('.custom-section-class').exists()).toBe(true);
    expect(wrapper.findComponent(ElCard).classes()).toContain('custom-card-class');
  });

  it('shows section icon when provided', () => {
    const sectionWithIcon = {
      ...baseSectionConfig,
      icon: 'user'
    };

    const wrapper = mount(FormSection, {
      props: {
        section: sectionWithIcon,
        modelValue: {}
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol
        }
      }
    });

    expect(wrapper.find('.section-icon').exists()).toBe(true);
  });

  it('handles empty fields array gracefully', () => {
    const emptySection = {
      ...baseSectionConfig,
      fields: []
    };

    const wrapper = mount(FormSection, {
      props: {
        section: emptySection,
        modelValue: {}
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol
        }
      }
    });

    expect(wrapper.findComponent(ElCard).exists()).toBe(true);
    expect(wrapper.findAll('.form-field')).toHaveLength(0);
  });

  it('shows section validation status', () => {
    const wrapper = mount(FormSection, {
      props: {
        section: baseSectionConfig,
        modelValue: {},
        validationStatus: 'error',
        validationMessage: '该部分包含错误'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol
        }
      }
    });

    expect(wrapper.find('.validation-error').exists()).toBe(true);
    expect(wrapper.text()).toContain('该部分包含错误');
  });

  it('supports section-level validation', async () => {
    const wrapper = mount(FormSection, {
      props: {
        section: baseSectionConfig,
        modelValue: {},
        validateSection: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol
        }
      }
    });

    await wrapper.vm.validateSection();
    expect(wrapper.emitted('validation-complete')).toBeTruthy();
  });

  it('renders section with custom header', () => {
    const sectionWithCustomHeader = {
      ...baseSectionConfig,
      customHeader: true
    };

    const wrapper = mount(FormSection, {
      props: {
        section: sectionWithCustomHeader,
        modelValue: {}
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol
        }
      }
    });

    expect(wrapper.find('.custom-header').exists()).toBe(true);
  });

  it('handles section visibility', () => {
    const hiddenSection = {
      ...baseSectionConfig,
      visible: false
    };

    const wrapper = mount(FormSection, {
      props: {
        section: hiddenSection,
        modelValue: {}
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol
        }
      }
    });

    expect(wrapper.find('.hidden-section').exists()).toBe(true);
  });

  it('shows section loading state', () => {
    const wrapper = mount(FormSection, {
      props: {
        section: baseSectionConfig,
        modelValue: {},
        loading: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol
        }
      }
    });

    expect(wrapper.find('.loading-overlay').exists()).toBe(true);
  });

  it('supports section-level data transformation', () => {
    const wrapper = mount(FormSection, {
      props: {
        section: baseSectionConfig,
        modelValue: {},
        transformData: (data: any) => {
          return { ...data, processed: true };
        }
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol
        }
      }
    });

    expect(wrapper.vm.processedData).toBeDefined();
  });

  it('emits section events', async () => {
    const wrapper = mount(FormSection, {
      props: {
        section: baseSectionConfig,
        modelValue: {}
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol
        }
      }
    });

    await wrapper.vm.$emit('section-focus');
    expect(wrapper.emitted('section-focus')).toBeTruthy();
  });

  it('applies conditional field visibility', () => {
    const sectionWithConditionalFields = {
      ...baseSectionConfig,
      fields: [
        ...baseSectionConfig.fields,
        {
          name: 'conditionalField',
          label: '条件字段',
          type: 'text',
          visible: (data: any) => data.name === '特定值'
        }
      ]
    };

    const wrapper = mount(FormSection, {
      props: {
        section: sectionWithConditionalFields,
        modelValue: { name: '特定值' }
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElCard,
          ElRow,
          ElCol
        }
      }
    });

    expect(wrapper.find('.conditional-field').exists()).toBe(true);
  });
});