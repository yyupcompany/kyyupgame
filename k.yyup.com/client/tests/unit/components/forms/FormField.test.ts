
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
import FormField from '@/components/forms/FormField.vue';
import { ElFormItem, ElInput, ElSelect, ElDatePicker, ElSwitch, ElSlider, ElRate } from 'element-plus';

// Mock Element Plus components
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus');
  return {
    ...actual,
    ElFormItem: {
      name: 'ElFormItem',
      template: '<div class="el-form-item"><slot></slot></div>',
      props: ['label', 'required', 'error', 'rules']
    },
    ElInput: {
      name: 'ElInput',
      template: '<input type="text" />',
      props: ['modelValue', 'placeholder', 'type', 'disabled', 'readonly'],
      emits: ['update:modelValue', 'blur', 'focus']
    },
    ElSelect: {
      name: 'ElSelect',
      template: '<select><slot></slot></select>',
      props: ['modelValue', 'placeholder', 'disabled', 'multiple'],
      emits: ['update:modelValue', 'change']
    },
    ElDatePicker: {
      name: 'ElDatePicker',
      template: '<input type="date" />',
      props: ['modelValue', 'type', 'placeholder', 'disabled'],
      emits: ['update:modelValue', 'change']
    },
    ElSwitch: {
      name: 'ElSwitch',
      template: '<input type="checkbox" />',
      props: ['modelValue', 'disabled'],
      emits: ['update:modelValue', 'change']
    },
    ElSlider: {
      name: 'ElSlider',
      template: '<input type="range" />',
      props: ['modelValue', 'min', 'max', 'step', 'disabled'],
      emits: ['update:modelValue', 'change']
    },
    ElRate: {
      name: 'ElRate',
      template: '<div class="el-rate"></div>',
      props: ['modelValue', 'max', 'disabled'],
      emits: ['update:modelValue', 'change']
    }
  };
});

describe('FormField.vue', () => {
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  const baseFieldConfig = {
    name: 'testField',
    label: '测试字段',
    type: 'text',
    required: false,
    disabled: false,
    placeholder: '请输入测试字段'
  };

  it('renders form field with basic configuration', () => {
    const wrapper = mount(FormField, {
      props: {
        field: baseFieldConfig,
        modelValue: ''
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElFormItem,
          ElInput
        }
      }
    });

    expect(wrapper.findComponent(ElFormItem).exists()).toBe(true);
    expect(wrapper.findComponent(ElInput).exists()).toBe(true);
    expect(wrapper.text()).toContain('测试字段');
  });

  it('renders text input field', () => {
    const textFieldConfig = {
      ...baseFieldConfig,
      type: 'text'
    };

    const wrapper = mount(FormField, {
      props: {
        field: textFieldConfig,
        modelValue: 'test value'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElFormItem,
          ElInput
        }
      }
    });

    const input = wrapper.findComponent(ElInput);
    expect(input.props('type')).toBe('text');
    expect(input.props('modelValue')).toBe('test value');
  });

  it('renders password input field', () => {
    const passwordFieldConfig = {
      ...baseFieldConfig,
      type: 'password'
    };

    const wrapper = mount(FormField, {
      props: {
        field: passwordFieldConfig,
        modelValue: 'secret'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElFormItem,
          ElInput
        }
      }
    });

    const input = wrapper.findComponent(ElInput);
    expect(input.props('type')).toBe('password');
  });

  it('renders email input field', () => {
    const emailFieldConfig = {
      ...baseFieldConfig,
      type: 'email'
    };

    const wrapper = mount(FormField, {
      props: {
        field: emailFieldConfig,
        modelValue: 'test@example.com'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElFormItem,
          ElInput
        }
      }
    });

    const input = wrapper.findComponent(ElInput);
    expect(input.props('type')).toBe('email');
  });

  it('renders number input field', () => {
    const numberFieldConfig = {
      ...baseFieldConfig,
      type: 'number'
    };

    const wrapper = mount(FormField, {
      props: {
        field: numberFieldConfig,
        modelValue: 42
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElFormItem,
          ElInput
        }
      }
    });

    const input = wrapper.findComponent(ElInput);
    expect(input.props('type')).toBe('number');
  });

  it('renders textarea field', () => {
    const textareaFieldConfig = {
      ...baseFieldConfig,
      type: 'textarea'
    };

    const wrapper = mount(FormField, {
      props: {
        field: textareaFieldConfig,
        modelValue: 'Long text content'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElFormItem,
          ElInput
        }
      }
    });

    const input = wrapper.findComponent(ElInput);
    expect(input.props('type')).toBe('textarea');
  });

  it('renders select field with options', () => {
    const selectFieldConfig = {
      ...baseFieldConfig,
      type: 'select',
      options: [
        { label: '选项1', value: 'option1' },
        { label: '选项2', value: 'option2' },
        { label: '选项3', value: 'option3' }
      ]
    };

    const wrapper = mount(FormField, {
      props: {
        field: selectFieldConfig,
        modelValue: 'option1'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElFormItem,
          ElSelect
        }
      }
    });

    const select = wrapper.findComponent(ElSelect);
    expect(select.exists()).toBe(true);
    expect(select.props('modelValue')).toBe('option1');
  });

  it('renders date picker field', () => {
    const dateFieldConfig = {
      ...baseFieldConfig,
      type: 'date'
    };

    const wrapper = mount(FormField, {
      props: {
        field: dateFieldConfig,
        modelValue: '2023-01-01'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElFormItem,
          ElDatePicker
        }
      }
    });

    const datePicker = wrapper.findComponent(ElDatePicker);
    expect(datePicker.exists()).toBe(true);
    expect(datePicker.props('type')).toBe('date');
  });

  it('renders datetime picker field', () => {
    const datetimeFieldConfig = {
      ...baseFieldConfig,
      type: 'datetime'
    };

    const wrapper = mount(FormField, {
      props: {
        field: datetimeFieldConfig,
        modelValue: '2023-01-01 12:00:00'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElFormItem,
          ElDatePicker
        }
      }
    });

    const datePicker = wrapper.findComponent(ElDatePicker);
    expect(datePicker.props('type')).toBe('datetime');
  });

  it('renders switch field', () => {
    const switchFieldConfig = {
      ...baseFieldConfig,
      type: 'switch'
    };

    const wrapper = mount(FormField, {
      props: {
        field: switchFieldConfig,
        modelValue: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElFormItem,
          ElSwitch
        }
      }
    });

    const switchComponent = wrapper.findComponent(ElSwitch);
    expect(switchComponent.exists()).toBe(true);
    expect(switchComponent.props('modelValue')).toBe(true);
  });

  it('renders slider field', () => {
    const sliderFieldConfig = {
      ...baseFieldConfig,
      type: 'slider',
      min: 0,
      max: 100,
      step: 1
    };

    const wrapper = mount(FormField, {
      props: {
        field: sliderFieldConfig,
        modelValue: 50
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElFormItem,
          ElSlider
        }
      }
    });

    const slider = wrapper.findComponent(ElSlider);
    expect(slider.exists()).toBe(true);
    expect(slider.props('min')).toBe(0);
    expect(slider.props('max')).toBe(100);
    expect(slider.props('step')).toBe(1);
  });

  it('renders rate field', () => {
    const rateFieldConfig = {
      ...baseFieldConfig,
      type: 'rate',
      max: 5
    };

    const wrapper = mount(FormField, {
      props: {
        field: rateFieldConfig,
        modelValue: 3
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElFormItem,
          ElRate
        }
      }
    });

    const rate = wrapper.findComponent(ElRate);
    expect(rate.exists()).toBe(true);
    expect(rate.props('max')).toBe(5);
  });

  it('emits update:modelValue when field value changes', async () => {
    const wrapper = mount(FormField, {
      props: {
        field: baseFieldConfig,
        modelValue: ''
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElFormItem,
          ElInput
        }
      }
    });

    const input = wrapper.findComponent(ElInput);
    await input.setValue('new value');
    
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')[0][0]).toBe('new value');
  });

  it('shows required indicator for required fields', () => {
    const requiredFieldConfig = {
      ...baseFieldConfig,
      required: true
    };

    const wrapper = mount(FormField, {
      props: {
        field: requiredFieldConfig,
        modelValue: ''
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElFormItem,
          ElInput
        }
      }
    });

    const formItem = wrapper.findComponent(ElFormItem);
    expect(formItem.props('required')).toBe(true);
  });

  it('disables field when disabled prop is true', () => {
    const disabledFieldConfig = {
      ...baseFieldConfig,
      disabled: true
    };

    const wrapper = mount(FormField, {
      props: {
        field: disabledFieldConfig,
        modelValue: 'test'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElFormItem,
          ElInput
        }
      }
    });

    const input = wrapper.findComponent(ElInput);
    expect(input.props('disabled')).toBe(true);
  });

  it('shows placeholder text', () => {
    const wrapper = mount(FormField, {
      props: {
        field: baseFieldConfig,
        modelValue: ''
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElFormItem,
          ElInput
        }
      }
    });

    const input = wrapper.findComponent(ElInput);
    expect(input.props('placeholder')).toBe('请输入测试字段');
  });

  it('emits focus event when field is focused', async () => {
    const wrapper = mount(FormField, {
      props: {
        field: baseFieldConfig,
        modelValue: ''
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElFormItem,
          ElInput
        }
      }
    });

    const input = wrapper.findComponent(ElInput);
    await input.trigger('focus');
    
    expect(wrapper.emitted('focus')).toBeTruthy();
  });

  it('emits blur event when field loses focus', async () => {
    const wrapper = mount(FormField, {
      props: {
        field: baseFieldConfig,
        modelValue: ''
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElFormItem,
          ElInput
        }
      }
    });

    const input = wrapper.findComponent(ElInput);
    await input.trigger('blur');
    
    expect(wrapper.emitted('blur')).toBeTruthy();
  });

  it('applies custom CSS classes', () => {
    const wrapper = mount(FormField, {
      props: {
        field: baseFieldConfig,
        modelValue: '',
        fieldClass: 'custom-field-class'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElFormItem,
          ElInput
        }
      }
    });

    expect(wrapper.find('.custom-field-class').exists()).toBe(true);
  });

  it('shows field description when provided', () => {
    const fieldWithDescription = {
      ...baseFieldConfig,
      description: '这是一个测试字段的描述信息'
    };

    const wrapper = mount(FormField, {
      props: {
        field: fieldWithDescription,
        modelValue: ''
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElFormItem,
          ElInput
        }
      }
    });

    expect(wrapper.text()).toContain('这是一个测试字段的描述信息');
  });

  it('handles field validation errors', () => {
    const wrapper = mount(FormField, {
      props: {
        field: baseFieldConfig,
        modelValue: '',
        error: '字段验证失败'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElFormItem,
          ElInput
        }
      }
    });

    const formItem = wrapper.findComponent(ElFormItem);
    expect(formItem.props('error')).toBe('字段验证失败');
  });

  it('supports multiple select', () => {
    const multiSelectFieldConfig = {
      ...baseFieldConfig,
      type: 'select',
      multiple: true,
      options: [
        { label: '选项1', value: 'option1' },
        { label: '选项2', value: 'option2' }
      ]
    };

    const wrapper = mount(FormField, {
      props: {
        field: multiSelectFieldConfig,
        modelValue: ['option1', 'option2']
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElFormItem,
          ElSelect
        }
      }
    });

    const select = wrapper.findComponent(ElSelect);
    expect(select.props('multiple')).toBe(true);
  });

  it('renders checkbox field', () => {
    const checkboxFieldConfig = {
      ...baseFieldConfig,
      type: 'checkbox'
    };

    const wrapper = mount(FormField, {
      props: {
        field: checkboxFieldConfig,
        modelValue: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElFormItem,
          ElInput
        }
      }
    });

    const input = wrapper.findComponent(ElInput);
    expect(input.props('type')).toBe('checkbox');
  });

  it('renders radio field', () => {
    const radioFieldConfig = {
      ...baseFieldConfig,
      type: 'radio',
      options: [
        { label: '是', value: 'yes' },
        { label: '否', value: 'no' }
      ]
    };

    const wrapper = mount(FormField, {
      props: {
        field: radioFieldConfig,
        modelValue: 'yes'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElFormItem,
          ElInput
        }
      }
    });

    expect(wrapper.text()).toContain('是');
    expect(wrapper.text()).toContain('否');
  });

  it('handles file upload field', () => {
    const fileFieldConfig = {
      ...baseFieldConfig,
      type: 'file'
    };

    const wrapper = mount(FormField, {
      props: {
        field: fileFieldConfig,
        modelValue: null
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElFormItem,
          ElInput
        }
      }
    });

    const input = wrapper.findComponent(ElInput);
    expect(input.props('type')).toBe('file');
  });

  it('applies field-specific attributes', () => {
    const fieldWithAttributes = {
      ...baseFieldConfig,
      type: 'text',
      maxlength: 50,
      minlength: 5,
      pattern: '[a-zA-Z0-9]+'
    };

    const wrapper = mount(FormField, {
      props: {
        field: fieldWithAttributes,
        modelValue: ''
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElFormItem,
          ElInput
        }
      }
    });

    const input = wrapper.find('input');
    expect(input.attributes('maxlength')).toBe('50');
    expect(input.attributes('minlength')).toBe('5');
    expect(input.attributes('pattern')).toBe('[a-zA-Z0-9]+');
  });
});