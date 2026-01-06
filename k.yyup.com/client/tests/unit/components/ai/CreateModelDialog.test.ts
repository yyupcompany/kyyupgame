
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
import { nextTick } from 'vue';
import CreateModelDialog from '@/components/ai/CreateModelDialog.vue';
import ElementPlus from 'element-plus';

// Mock the API
vi.mock('@/api/ai-model', () => ({
  createModel: vi.fn()
}));

// Mock Element Plus message
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus');
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn()
    }
  };
});

describe('CreateModelDialog.vue', () => {
  let wrapper;

  const mockProps = {
    modelValue: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock response
    const { createModel } = require('@/api/ai-model');
    createModel.mockResolvedValue({
      id: 1,
      name: 'Test Model',
      displayName: 'Test Model Display',
      provider: 'openai',
      modelType: 'text-generation',
      isActive: true,
      isDefault: false
    });

    wrapper = mount(CreateModelDialog, {
      global: {
        plugins: [ElementPlus],
        stubs: {
          'el-dialog': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-button': true,
          'el-switch': true,
          'el-slider': true
        }
      },
      props: mockProps
    });
  });

  it('renders properly when visible', () => {
    expect(wrapper.find('.el-dialog').exists()).toBe(true);
    expect(wrapper.vm.visible).toBe(true);
  });

  it('is hidden when modelValue is false', async () => {
    await wrapper.setProps({ modelValue: false });
    
    expect(wrapper.vm.visible).toBe(false);
  });

  it('emits update:modelValue when dialog closes', async () => {
    const dialog = wrapper.findComponent({ name: 'el-dialog' });
    await dialog.vm.$emit('update:modelValue', false);
    
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')[0][0]).toBe(false);
  });

  it('resets form when dialog closes', async () => {
    // Fill form with some data
    await wrapper.setData({
      'form.name': 'Test Model',
      'form.displayName': 'Test Display',
      'form.type': 'text-generation'
    });

    const dialog = wrapper.findComponent({ name: 'el-dialog' });
    await dialog.vm.$emit('close');
    
    expect(wrapper.vm.form.name).toBe('');
    expect(wrapper.vm.form.displayName).toBe('');
    expect(wrapper.vm.form.type).toBe('');
  });

  it('has correct form validation rules', () => {
    const rules = wrapper.vm.rules;
    
    expect(rules.name).toHaveLength(2);
    expect(rules.name[0].required).toBe(true);
    expect(rules.name[0].message).toBe('请输入模型名称');
    expect(rules.name[1].min).toBe(2);
    expect(rules.name[1].max).toBe(50);
    
    expect(rules.type).toHaveLength(1);
    expect(rules.type[0].required).toBe(true);
    expect(rules.type[0].message).toBe('请选择模型类型');
    
    expect(rules.version).toHaveLength(2);
    expect(rules.version[0].required).toBe(true);
    expect(rules.version[1].pattern).toBe(/^v\d+\.\d+\.\d+$/);
    
    expect(rules.endpoint).toHaveLength(2);
    expect(rules.endpoint[0].required).toBe(true);
    expect(rules.endpoint[1].type).toBe('url');
    
    expect(rules.apiKey).toHaveLength(2);
    expect(rules.apiKey[0].required).toBe(true);
    expect(rules.apiKey[1].min).toBe(10);
  });

  it('submits form with valid data', async () => {
    const { createModel } = require('@/api/ai-model');
    const { ElMessage } = require('element-plus');

    // Fill form with valid data
    await wrapper.setData({
      'form.name': 'Test Model',
      'form.displayName': 'Test Display',
      'form.type': 'text-generation',
      'form.provider': 'openai',
      'form.version': 'v1.0.0',
      'form.endpoint': 'https://api.openai.com/v1/chat/completions',
      'form.apiKey': 'sk-test123456789',
      'form.description': 'Test model description',
      'form.enabled': true,
      'form.priority': 5
    });

    // Mock form validation
    const formRef = {
      validate: vi.fn().mockImplementation((callback) => callback(true))
    };
    wrapper.setData({ formRef });

    await wrapper.vm.handleSubmit();

    expect(createModel).toHaveBeenCalledWith({
      name: 'Test Model',
      displayName: 'Test Display',
      provider: 'openai',
      modelType: 'text-generation',
      apiVersion: 'v1.0.0',
      endpointUrl: 'https://api.openai.com/v1/chat/completions',
      apiKey: 'sk-test123456789',
      modelParameters: {},
      isActive: true,
      isDefault: false
    });

    expect(ElMessage.success).toHaveBeenCalledWith('AI模型创建成功');
    expect(wrapper.emitted('success')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.vm.visible).toBe(false);
  });

  it('does not submit form with invalid data', async () => {
    const { createModel } = require('@/api/ai-model');

    // Mock form validation failure
    const formRef = {
      validate: vi.fn().mockImplementation((callback) => callback(false))
    };
    wrapper.setData({ formRef });

    await wrapper.vm.handleSubmit();

    expect(createModel).not.toHaveBeenCalled();
    expect(wrapper.emitted('success')).toBeFalsy();
  });

  it('handles API error during submission', async () => {
    const { createModel } = require('@/api/ai-model');
    const { ElMessage } = require('element-plus');

    createModel.mockRejectedValue(new Error('API Error'));

    // Mock form validation
    const formRef = {
      validate: vi.fn().mockImplementation((callback) => callback(true))
    };
    wrapper.setData({ formRef });

    // Fill form with valid data
    await wrapper.setData({
      'form.name': 'Test Model',
      'form.type': 'text-generation',
      'form.version': 'v1.0.0',
      'form.endpoint': 'https://api.openai.com/v1/chat/completions',
      'form.apiKey': 'sk-test123456789'
    });

    await wrapper.vm.handleSubmit();

    expect(ElMessage.error).toHaveBeenCalledWith('创建失败，请重试');
    expect(wrapper.emitted('success')).toBeFalsy();
    expect(wrapper.vm.loading).toBe(false);
  });

  it('cancels form submission', async () => {
    await wrapper.vm.handleCancel();

    expect(wrapper.vm.visible).toBe(false);
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
  });

  it('has correct default form values', () => {
    expect(wrapper.vm.form.name).toBe('');
    expect(wrapper.vm.form.displayName).toBe('');
    expect(wrapper.vm.form.type).toBe('');
    expect(wrapper.vm.form.provider).toBe('');
    expect(wrapper.vm.form.version).toBe('');
    expect(wrapper.vm.form.endpoint).toBe('');
    expect(wrapper.vm.form.apiKey).toBe('');
    expect(wrapper.vm.form.description).toBe('');
    expect(wrapper.vm.form.enabled).toBe(true);
    expect(wrapper.vm.form.priority).toBe(5);
    expect(wrapper.vm.form.modelParameters).toEqual({});
  });

  it('watches modelValue prop changes', async () => {
    expect(wrapper.vm.visible).toBe(true);
    
    await wrapper.setProps({ modelValue: false });
    expect(wrapper.vm.visible).toBe(false);
    
    await wrapper.setProps({ modelValue: true });
    expect(wrapper.vm.visible).toBe(true);
  });

  it('shows loading state during submission', async () => {
    const { createModel } = require('@/api/ai-model');
    
    // Create a promise that doesn't resolve immediately
    let resolvePromise;
    const testPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    createModel.mockReturnValue(testPromise);

    // Mock form validation
    const formRef = {
      validate: vi.fn().mockImplementation((callback) => callback(true))
    };
    wrapper.setData({ formRef });

    // Fill form with valid data
    await wrapper.setData({
      'form.name': 'Test Model',
      'form.type': 'text-generation',
      'form.version': 'v1.0.0',
      'form.endpoint': 'https://api.openai.com/v1/chat/completions',
      'form.apiKey': 'sk-test123456789'
    });

    // Start submission
    wrapper.vm.handleSubmit();
    
    expect(wrapper.vm.loading).toBe(true);

    // Resolve the promise
    resolvePromise({ id: 1, name: 'Test Model' });
    await nextTick();

    expect(wrapper.vm.loading).toBe(false);
  });

  it('resets form after successful submission', async () => {
    const { createModel } = require('@/api/ai-model');

    createModel.mockResolvedValue({ id: 1, name: 'Test Model' });

    // Mock form validation
    const formRef = {
      validate: vi.fn().mockImplementation((callback) => callback(true))
    };
    wrapper.setData({ formRef });

    // Fill form with data
    await wrapper.setData({
      'form.name': 'Test Model',
      'form.displayName': 'Test Display',
      'form.type': 'text-generation'
    });

    await wrapper.vm.handleSubmit();

    expect(wrapper.vm.form.name).toBe('');
    expect(wrapper.vm.form.displayName).toBe('');
    expect(wrapper.vm.form.type).toBe('');
  });

  it('clears form validation after reset', async () => {
    const formRef = {
      validate: vi.fn().mockImplementation((callback) => callback(true)),
      clearValidate: vi.fn()
    };
    wrapper.setData({ formRef });

    await wrapper.vm.resetForm();

    expect(formRef.clearValidate).toHaveBeenCalled();
  });
});