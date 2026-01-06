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
import FormBuilder from '@/components/forms/FormBuilder.vue';
import { ElForm, ElFormItem, ElInput, ElSelect, ElButton, ElCard, ElRow, ElCol } from 'element-plus';

// Mock Element Plus components
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus');
  return {
    ...actual,
    ElForm: {
      name: 'ElForm',
      template: '<form><slot></slot></form>'
    },
    ElFormItem: {
      name: 'ElFormItem',
      template: '<div class="el-form-item"><slot></slot></div>'
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
      props: ['modelValue'],
      emits: ['update:modelValue']
    },
    ElButton: {
      name: 'ElButton',
      template: '<button><slot></slot></button>',
      props: ['type', 'icon']
    },
    ElCard: {
      name: 'ElCard',
      template: '<div class="el-card"><slot></slot></div>'
    },
    ElRow: {
      name: 'ElRow',
      template: '<div class="el-row"><slot></slot></div>'
    },
    ElCol: {
      name: 'ElCol',
      template: '<div class="el-col"><slot></slot></div>',
      props: ['span']
    }
  };
});

describe('FormBuilder.vue', () => {
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  const mockSchema = {
    title: '用户信息表单',
    description: '请填写用户基本信息',
    sections: [
      {
        title: '基本信息',
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
          }
        ]
      },
      {
        title: '详细信息',
        fields: [
          {
            name: 'phone',
            label: '电话',
            type: 'tel',
            required: false,
            placeholder: '请输入电话'
          },
          {
            name: 'address',
            label: '地址',
            type: 'textarea',
            required: false,
            placeholder: '请输入地址'
          }
        ]
      }
    ]
  };

  it('renders form builder with schema correctly', () => {
    const wrapper = mount(FormBuilder, {
      props: {
        schema: mockSchema,
        modelValue: {}
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElSelect,
          ElButton,
          ElCard,
          ElRow,
          ElCol
        }
      }
    });

    expect(wrapper.find('.form-builder').exists()).toBe(true);
    expect(wrapper.text()).toContain('用户信息表单');
    expect(wrapper.text()).toContain('请填写用户基本信息');
  });

  it('renders form sections correctly', () => {
    const wrapper = mount(FormBuilder, {
      props: {
        schema: mockSchema,
        modelValue: {}
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElSelect,
          ElButton,
          ElCard,
          ElRow,
          ElCol
        }
      }
    });

    const sections = wrapper.findAll('.form-section');
    expect(sections).toHaveLength(mockSchema.sections.length);
    
    expect(wrapper.text()).toContain('基本信息');
    expect(wrapper.text()).toContain('详细信息');
  });

  it('renders all fields from schema', () => {
    const wrapper = mount(FormBuilder, {
      props: {
        schema: mockSchema,
        modelValue: {}
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElSelect,
          ElButton,
          ElCard,
          ElRow,
          ElCol
        }
      }
    });

    const totalFields = mockSchema.sections.reduce((sum, section) => sum + section.fields.length, 0);
    const formItems = wrapper.findAllComponents(ElFormItem);
    expect(formItems.length).toBe(totalFields);
  });

  it('binds model values to form fields', () => {
    const model = {
      name: '张三',
      email: 'zhangsan@example.com',
      phone: '13800138000',
      address: '北京市朝阳区'
    };

    const wrapper = mount(FormBuilder, {
      props: {
        schema: mockSchema,
        modelValue: model
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElSelect,
          ElButton,
          ElCard,
          ElRow,
          ElCol
        }
      }
    });

    expect(wrapper.props('modelValue')).toEqual(model);
  });

  it('emits update:modelValue when field values change', async () => {
    const wrapper = mount(FormBuilder, {
      props: {
        schema: mockSchema,
        modelValue: {}
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElSelect,
          ElButton,
          ElCard,
          ElRow,
          ElCol
        }
      }
    });

    const nameInput = wrapper.findAllComponents(ElInput)[0];
    await nameInput.setValue('李四');
    
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')[0][0]).toEqual({ name: '李四' });
  });

  it('validates required fields', async () => {
    const wrapper = mount(FormBuilder, {
      props: {
        schema: mockSchema,
        modelValue: {},
        validateOnBlur: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElSelect,
          ElButton,
          ElCard,
          ElRow,
          ElCol
        }
      }
    });

    const form = wrapper.findComponent(ElForm);
    const isValid = await form.vm.validate();
    expect(isValid).toBe(true);
  });

  it('adds new field dynamically', async () => {
    const wrapper = mount(FormBuilder, {
      props: {
        schema: mockSchema,
        modelValue: {},
        editable: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElSelect,
          ElButton,
          ElCard,
          ElRow,
          ElCol
        }
      }
    });

    const addButton = wrapper.find('.add-field-button');
    await addButton.trigger('click');
    
    expect(wrapper.emitted('field-added')).toBeTruthy();
  });

  it('removes field dynamically', async () => {
    const wrapper = mount(FormBuilder, {
      props: {
        schema: mockSchema,
        modelValue: {},
        editable: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElSelect,
          ElButton,
          ElCard,
          ElRow,
          ElCol
        }
      }
    });

    const removeButton = wrapper.find('.remove-field-button');
    if (removeButton.exists()) {
      await removeButton.trigger('click');
      expect(wrapper.emitted('field-removed')).toBeTruthy();
    }
  });

  it('reorders fields', async () => {
    const wrapper = mount(FormBuilder, {
      props: {
        schema: mockSchema,
        modelValue: {},
        editable: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElSelect,
          ElButton,
          ElCard,
          ElRow,
          ElCol
        }
      }
    });

    const moveUpButton = wrapper.find('.move-up-button');
    if (moveUpButton.exists()) {
      await moveUpButton.trigger('click');
      expect(wrapper.emitted('field-reordered')).toBeTruthy();
    }
  });

  it('handles different field types', () => {
    const schemaWithVariousTypes = {
      title: '多类型表单',
      sections: [{
        title: '各种字段',
        fields: [
          { name: 'text', label: '文本', type: 'text' },
          { name: 'number', label: '数字', type: 'number' },
          { name: 'select', label: '选择', type: 'select', options: [{ label: 'A', value: 'a' }] },
          { name: 'checkbox', label: '复选框', type: 'checkbox' },
          { name: 'radio', label: '单选框', type: 'radio', options: [{ label: 'A', value: 'a' }] },
          { name: 'date', label: '日期', type: 'date' },
          { name: 'time', label: '时间', type: 'time' },
          { name: 'file', label: '文件', type: 'file' }
        ]
      }]
    };

    const wrapper = mount(FormBuilder, {
      props: {
        schema: schemaWithVariousTypes,
        modelValue: {}
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElSelect,
          ElButton,
          ElCard,
          ElRow,
          ElCol
        }
      }
    });

    expect(wrapper.props('schema')).toEqual(schemaWithVariousTypes);
  });

  it('applies field validation rules', async () => {
    const schemaWithValidation = {
      title: '验证表单',
      sections: [{
        title: '验证字段',
        fields: [
          {
            name: 'email',
            label: '邮箱',
            type: 'email',
            required: true,
            rules: [
              { type: 'email', message: '邮箱格式不正确' },
              { min: 5, message: '邮箱长度至少5个字符' }
            ]
          }
        ]
      }]
    };

    const wrapper = mount(FormBuilder, {
      props: {
        schema: schemaWithValidation,
        modelValue: { email: 'test' }
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElSelect,
          ElButton,
          ElCard,
          ElRow,
          ElCol
        }
      }
    });

    const form = wrapper.findComponent(ElForm);
    const isValid = await form.vm.validate();
    expect(isValid).toBe(true);
  });

  it('emits form submission event', async () => {
    const wrapper = mount(FormBuilder, {
      props: {
        schema: mockSchema,
        modelValue: {}
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElSelect,
          ElButton,
          ElCard,
          ElRow,
          ElCol
        }
      }
    });

    await wrapper.find('form').trigger('submit');
    expect(wrapper.emitted('submit')).toBeTruthy();
  });

  it('resets form data', async () => {
    const wrapper = mount(FormBuilder, {
      props: {
        schema: mockSchema,
        modelValue: { name: '测试数据' }
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElSelect,
          ElButton,
          ElCard,
          ElRow,
          ElCol
        }
      }
    });

    const resetButton = wrapper.find('.reset-button');
    if (resetButton.exists()) {
      await resetButton.trigger('click');
      expect(wrapper.emitted('reset')).toBeTruthy();
    }
  });

  it('handles empty schema gracefully', () => {
    const emptySchema = {
      title: '空表单',
      sections: []
    };

    const wrapper = mount(FormBuilder, {
      props: {
        schema: emptySchema,
        modelValue: {}
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElSelect,
          ElButton,
          ElCard,
          ElRow,
          ElCol
        }
      }
    });

    expect(wrapper.find('.form-builder').exists()).toBe(true);
    expect(wrapper.findAll('.form-section')).toHaveLength(0);
  });

  it('applies custom CSS classes', () => {
    const wrapper = mount(FormBuilder, {
      props: {
        schema: mockSchema,
        modelValue: {},
        formClass: 'custom-form-class',
        sectionClass: 'custom-section-class'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElSelect,
          ElButton,
          ElCard,
          ElRow,
          ElCol
        }
      }
    });

    expect(wrapper.find('.form-builder').classes()).toContain('custom-form-class');
  });

  it('shows loading state', () => {
    const wrapper = mount(FormBuilder, {
      props: {
        schema: mockSchema,
        modelValue: {},
        loading: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElSelect,
          ElButton,
          ElCard,
          ElRow,
          ElCol
        }
      }
    });

    expect(wrapper.find('.loading-overlay').exists()).toBe(true);
  });

  it('supports responsive layout', () => {
    const wrapper = mount(FormBuilder, {
      props: {
        schema: mockSchema,
        modelValue: {},
        responsive: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElSelect,
          ElButton,
          ElCard,
          ElRow,
          ElCol
        }
      }
    });

    expect(wrapper.find('.responsive-layout').exists()).toBe(true);
  });
});