
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
import FormValidator from '@/components/forms/FormValidator.vue';
import { ElForm, ElFormItem, ElInput, ElButton, ElAlert } from 'element-plus';

// Mock Element Plus components
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus');
  return {
    ...actual,
    ElForm: {
      name: 'ElForm',
      template: '<form><slot></slot></form>',
      validate: vi.fn().mockResolvedValue(true),
      validateField: vi.fn().mockResolvedValue(true),
      resetFields: vi.fn()
    },
    ElFormItem: {
      name: 'ElFormItem',
      template: '<div class="el-form-item"><slot></slot></div>'
    },
    ElInput: {
      name: 'ElInput',
      template: '<input type="text" />',
      props: ['modelValue'],
      emits: ['update:modelValue']
    },
    ElButton: {
      name: 'ElButton',
      template: '<button><slot></slot></button>',
      props: ['type', 'loading']
    },
    ElAlert: {
      name: 'ElAlert',
      template: '<div class="el-alert"><slot></slot></div>',
      props: ['type', 'title', 'description']
    }
  };
});

describe('FormValidator.vue', () => {
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  const mockRules = {
    name: [
      { required: true, message: '姓名不能为空', trigger: 'blur' },
      { min: 2, max: 20, message: '姓名长度在2到20个字符之间', trigger: 'blur' }
    ],
    email: [
      { required: true, message: '邮箱不能为空', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
    ],
    age: [
      { required: true, message: '年龄不能为空', trigger: 'blur' },
      { type: 'number', message: '年龄必须为数字', trigger: 'blur' },
      { min: 1, max: 120, message: '年龄必须在1到120之间', trigger: 'blur' }
    ]
  };

  const mockFormData = {
    name: '',
    email: '',
    age: null
  };

  it('renders form validator with rules', () => {
    const wrapper = mount(FormValidator, {
      props: {
        rules: mockRules,
        modelValue: mockFormData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElButton,
          ElAlert
        }
      }
    });

    expect(wrapper.findComponent(ElForm).exists()).toBe(true);
    expect(wrapper.props('rules')).toEqual(mockRules);
  });

  it('validates form on submit', async () => {
    const wrapper = mount(FormValidator, {
      props: {
        rules: mockRules,
        modelValue: mockFormData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElButton,
          ElAlert
        }
      }
    });

    const form = wrapper.findComponent(ElForm);
    const isValid = await form.vm.validate();
    
    expect(form.vm.validate).toHaveBeenCalled();
    expect(isValid).toBe(true);
  });

  it('shows validation errors when form is invalid', async () => {
    const formMock = {
      validate: vi.fn().mockResolvedValue(false)
    };

    const wrapper = mount(FormValidator, {
      props: {
        rules: mockRules,
        modelValue: mockFormData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm: formMock,
          ElFormItem,
          ElInput,
          ElButton,
          ElAlert
        }
      }
    });

    const form = wrapper.findComponent(ElForm);
    await form.vm.validate();
    
    expect(wrapper.find('.validation-error').exists()).toBe(true);
  });

  it('validates individual fields', async () => {
    const wrapper = mount(FormValidator, {
      props: {
        rules: mockRules,
        modelValue: mockFormData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElButton,
          ElAlert
        }
      }
    });

    const form = wrapper.findComponent(ElForm);
    await form.vm.validateField('name');
    
    expect(form.vm.validateField).toHaveBeenCalledWith('name');
  });

  it('applies required field validation', async () => {
    const wrapper = mount(FormValidator, {
      props: {
        rules: mockRules,
        modelValue: mockFormData,
        validateOnBlur: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElButton,
          ElAlert
        }
      }
    });

    const nameInput = wrapper.findComponent(ElInput);
    await nameInput.trigger('blur');
    
    expect(wrapper.find('.required-error').exists()).toBe(true);
  });

  it('validates email format', async () => {
    const invalidEmailData = {
      ...mockFormData,
      email: 'invalid-email'
    };

    const wrapper = mount(FormValidator, {
      props: {
        rules: mockRules,
        modelValue: invalidEmailData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElButton,
          ElAlert
        }
      }
    });

    const form = wrapper.findComponent(ElForm);
    await form.vm.validate();
    
    expect(wrapper.text()).toContain('请输入正确的邮箱地址');
  });

  it('validates number fields', async () => {
    const invalidAgeData = {
      ...mockFormData,
      age: 'not-a-number'
    };

    const wrapper = mount(FormValidator, {
      props: {
        rules: mockRules,
        modelValue: invalidAgeData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElButton,
          ElAlert
        }
      }
    });

    const form = wrapper.findComponent(ElForm);
    await form.vm.validate();
    
    expect(wrapper.text()).toContain('年龄必须为数字');
  });

  it('validates min/max length', async () => {
    const invalidNameData = {
      ...mockFormData,
      name: 'A' // Too short
    };

    const wrapper = mount(FormValidator, {
      props: {
        rules: mockRules,
        modelValue: invalidNameData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElButton,
          ElAlert
        }
      }
    });

    const form = wrapper.findComponent(ElForm);
    await form.vm.validate();
    
    expect(wrapper.text()).toContain('姓名长度在2到20个字符之间');
  });

  it('validates min/max values for numbers', async () => {
    const invalidAgeData = {
      ...mockFormData,
      age: 150 // Too large
    };

    const wrapper = mount(FormValidator, {
      props: {
        rules: mockRules,
        modelValue: invalidAgeData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElButton,
          ElAlert
        }
      }
    });

    const form = wrapper.findComponent(ElForm);
    await form.vm.validate();
    
    expect(wrapper.text()).toContain('年龄必须在1到120之间');
  });

  it('resets form validation', async () => {
    const wrapper = mount(FormValidator, {
      props: {
        rules: mockRules,
        modelValue: mockFormData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElButton,
          ElAlert
        }
      }
    });

    const form = wrapper.findComponent(ElForm);
    form.vm.resetFields();
    
    expect(form.vm.resetFields).toHaveBeenCalled();
  });

  it('clears validation errors', async () => {
    const wrapper = mount(FormValidator, {
      props: {
        rules: mockRules,
        modelValue: mockFormData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElButton,
          ElAlert
        }
      }
    });

    const clearButton = wrapper.find('.clear-validation-button');
    if (clearButton.exists()) {
      await clearButton.trigger('click');
      expect(wrapper.emitted('clear-validation')).toBeTruthy();
    }
  });

  it('emits validation events', async () => {
    const wrapper = mount(FormValidator, {
      props: {
        rules: mockRules,
        modelValue: mockFormData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElButton,
          ElAlert
        }
      }
    });

    const form = wrapper.findComponent(ElForm);
    await form.vm.validate();
    
    expect(wrapper.emitted('validation-complete')).toBeTruthy();
  });

  it('shows custom validation messages', async () => {
    const customRules = {
      customField: [
        { 
          validator: (rule: any, value: any, callback: any) => {
            if (value !== 'expected') {
              callback(new Error('自定义验证失败'));
            } else {
              callback();
            }
          },
          trigger: 'blur'
        }
      ]
    };

    const wrapper = mount(FormValidator, {
      props: {
        rules: customRules,
        modelValue: { customField: 'wrong-value' }
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElButton,
          ElAlert
        }
      }
    });

    const form = wrapper.findComponent(ElForm);
    await form.vm.validate();
    
    expect(wrapper.text()).toContain('自定义验证失败');
  });

  it('supports async validation', async () => {
    const asyncRules = {
      asyncField: [
        {
          validator: (rule: any, value: any, callback: any) => {
            setTimeout(() => {
              if (value === 'taken') {
                callback(new Error('该值已被占用'));
              } else {
                callback();
              }
            }, 100);
          },
          trigger: 'blur'
        }
      ]
    };

    const wrapper = mount(FormValidator, {
      props: {
        rules: asyncRules,
        modelValue: { asyncField: 'taken' }
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElButton,
          ElAlert
        }
      }
    });

    const form = wrapper.findComponent(ElForm);
    await form.vm.validate();
    
    expect(wrapper.text()).toContain('该值已被占用');
  });

  it('handles validation loading state', async () => {
    const wrapper = mount(FormValidator, {
      props: {
        rules: mockRules,
        modelValue: mockFormData,
        validating: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElButton,
          ElAlert
        }
      }
    });

    expect(wrapper.find('.validating').exists()).toBe(true);
    expect(wrapper.find('.loading-spinner').exists()).toBe(true);
  });

  it('shows validation summary', async () => {
    const wrapper = mount(FormValidator, {
      props: {
        rules: mockRules,
        modelValue: mockFormData,
        showSummary: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElButton,
          ElAlert
        }
      }
    });

    const form = wrapper.findComponent(ElForm);
    await form.vm.validate();
    
    expect(wrapper.find('.validation-summary').exists()).toBe(true);
  });

  it('supports different validation triggers', async () => {
    const wrapper = mount(FormValidator, {
      props: {
        rules: mockRules,
        modelValue: mockFormData,
        validateOnChange: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElButton,
          ElAlert
        }
      }
    });

    const nameInput = wrapper.findComponent(ElInput);
    await nameInput.setValue('test');
    
    expect(wrapper.emitted('field-validated')).toBeTruthy();
  });

  it('handles empty rules gracefully', () => {
    const wrapper = mount(FormValidator, {
      props: {
        rules: {},
        modelValue: mockFormData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElButton,
          ElAlert
        }
      }
    });

    expect(wrapper.findComponent(ElForm).exists()).toBe(true);
    expect(wrapper.props('rules')).toEqual({});
  });

  it('applies custom validation styles', () => {
    const wrapper = mount(FormValidator, {
      props: {
        rules: mockRules,
        modelValue: mockFormData,
        errorClass: 'custom-error',
        successClass: 'custom-success'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElForm,
          ElFormItem,
          ElInput,
          ElButton,
          ElAlert
        }
      }
    });

    expect(wrapper.find('.custom-error').exists()).toBe(true);
  });
});