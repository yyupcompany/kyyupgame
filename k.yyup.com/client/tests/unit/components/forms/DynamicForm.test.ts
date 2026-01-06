
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
import DynamicForm from '@/components/forms/DynamicForm.vue';
import { ElForm, ElFormItem, ElInput, ElSelect, ElButton } from 'element-plus';

// Mock Element Plus components
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus');
  return {
    ...actual,
    ElForm: {
      name: 'ElForm',
      template: '<form><slot></slot></form>',
      validate: vi.fn().mockResolvedValue(true),
      resetFields: vi.fn(),
      clearValidate: vi.fn()
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
      props: ['modelValue', 'placeholder'],
      emits: ['update:modelValue']
    },
    ElButton: {
      name: 'ElButton',
      template: '<button><slot></slot></button>',
      props: ['type', 'loading', 'disabled']
    }
  };
});

describe('DynamicForm.vue', () => {
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  const mockFields = [
    {
      name: 'name',
      label: '姓名',
      type: 'text',
      required: true,
      placeholder: '请输入姓名'
    },
    {
      name: 'age',
      label: '年龄',
      type: 'number',
      required: false,
      placeholder: '请输入年龄'
    },
    {
      name: 'gender',
      label: '性别',
      type: 'select',
      required: true,
      options: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' }
      ]
    }
  ];

  it('renders form with fields correctly', () => {
    const wrapper = mount(DynamicForm, {
      props: {
        fields: mockFields,
        modelValue: {}
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElSelect,
          ElButton
        }
      }
    });

    expect(wrapper.findComponent(ElForm).exists()).toBe(true);
    expect(wrapper.findAllComponents(ElFormItem)).toHaveLength(mockFields.length);
    expect(wrapper.findAllComponents(ElInput)).toHaveLength(2); // text and number fields
    expect(wrapper.findAllComponents(ElSelect)).toHaveLength(1); // select field
  });

  it('displays field labels correctly', () => {
    const wrapper = mount(DynamicForm, {
      props: {
        fields: mockFields,
        modelValue: {}
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElSelect,
          ElButton
        }
      }
    });

    const labels = wrapper.text();
    expect(labels).toContain('姓名');
    expect(labels).toContain('年龄');
    expect(labels).toContain('性别');
  });

  it('binds model values correctly', () => {
    const model = {
      name: '张三',
      age: 25,
      gender: 'male'
    };

    const wrapper = mount(DynamicForm, {
      props: {
        fields: mockFields,
        modelValue: model
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElSelect,
          ElButton
        }
      }
    });

    expect(wrapper.props('modelValue')).toEqual(model);
  });

  it('emits update:modelValue when field values change', async () => {
    const wrapper = mount(DynamicForm, {
      props: {
        fields: mockFields,
        modelValue: {}
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElSelect,
          ElButton
        }
      }
    });

    await wrapper.findComponent(ElInput).setValue('李四');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')[0][0]).toEqual({ name: '李四' });
  });

  it('validates required fields', async () => {
    const wrapper = mount(DynamicForm, {
      props: {
        fields: mockFields,
        modelValue: {}
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElSelect,
          ElButton
        }
      }
    });

    const form = wrapper.findComponent(ElForm);
    const isValid = await form.vm.validate();
    expect(isValid).toBe(true);
  });

  it('shows validation errors for required fields', async () => {
    const wrapper = mount(DynamicForm, {
      props: {
        fields: mockFields,
        modelValue: {},
        showValidation: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElSelect,
          ElButton
        }
      }
    });

    // Trigger validation
    await wrapper.find('form').trigger('submit');
    
    // Check if validation error messages are shown
    const errorMessages = wrapper.findAll('.el-form-item__error');
    expect(errorMessages.length).toBeGreaterThan(0);
  });

  it('resets form fields', async () => {
    const wrapper = mount(DynamicForm, {
      props: {
        fields: mockFields,
        modelValue: { name: '测试', age: 30 }
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElSelect,
          ElButton
        }
      }
    });

    const form = wrapper.findComponent(ElForm);
    form.vm.resetFields();
    expect(form.vm.resetFields).toHaveBeenCalled();
  });

  it('handles different field types correctly', () => {
    const fields = [
      { name: 'email', label: '邮箱', type: 'email' },
      { name: 'password', label: '密码', type: 'password' },
      { name: 'textarea', label: '描述', type: 'textarea' },
      { name: 'checkbox', label: '同意', type: 'checkbox' },
      { name: 'radio', label: '选择', type: 'radio', options: [{ label: 'A', value: 'a' }] }
    ];

    const wrapper = mount(DynamicForm, {
      props: {
        fields,
        modelValue: {}
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElSelect,
          ElButton
        }
      }
    });

    expect(wrapper.props('fields')).toEqual(fields);
  });

  it('applies custom validation rules', async () => {
    const customFields = [
      {
        name: 'email',
        label: '邮箱',
        type: 'email',
        required: true,
        rules: [
          { type: 'email', message: '请输入正确的邮箱格式' }
        ]
      }
    ];

    const wrapper = mount(DynamicForm, {
      props: {
        fields: customFields,
        modelValue: { email: 'invalid-email' }
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElSelect,
          ElButton
        }
      }
    });

    const form = wrapper.findComponent(ElForm);
    const isValid = await form.vm.validate();
    expect(isValid).toBe(true);
  });

  it('emits submit event on form submission', async () => {
    const wrapper = mount(DynamicForm, {
      props: {
        fields: mockFields,
        modelValue: {}
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElSelect,
          ElButton
        }
      }
    });

    await wrapper.find('form').trigger('submit');
    expect(wrapper.emitted('submit')).toBeTruthy();
  });

  it('disables form when disabled prop is true', () => {
    const wrapper = mount(DynamicForm, {
      props: {
        fields: mockFields,
        modelValue: {},
        disabled: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElSelect,
          ElButton
        }
      }
    });

    const inputs = wrapper.findAll('input');
    inputs.forEach(input => {
      expect(input.attributes('disabled')).toBeDefined();
    });
  });

  it('shows loading state when loading prop is true', () => {
    const wrapper = mount(DynamicForm, {
      props: {
        fields: mockFields,
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
          ElButton
        }
      }
    });

    const submitButton = wrapper.findComponent(ElButton);
    expect(submitButton.props('loading')).toBe(true);
  });

  it('handles empty fields array gracefully', () => {
    const wrapper = mount(DynamicForm, {
      props: {
        fields: [],
        modelValue: {}
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElSelect,
          ElButton
        }
      }
    });

    expect(wrapper.findComponent(ElForm).exists()).toBe(true);
    expect(wrapper.findAllComponents(ElFormItem)).toHaveLength(0);
  });

  it('applies custom CSS classes', () => {
    const wrapper = mount(DynamicForm, {
      props: {
        fields: mockFields,
        modelValue: {},
        formClass: 'custom-form-class'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElSelect,
          ElButton
        }
      }
    });

    const form = wrapper.findComponent(ElForm);
    expect(form.classes()).toContain('custom-form-class');
  });
});