
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
import ChatSettings from '@/components/ai/ChatSettings.vue';
import ElementPlus from 'element-plus';

// Mock the store
const mockStore = {
  ai: {
    getModelList: vi.fn()
  }
};

vi.mock('../../store', () => ({
  useStore: () => mockStore
}));

describe('ChatSettings.vue', () => {
  let wrapper;

  const mockModelConfig = {
    modelId: 1,
    modelName: 'Default Model',
    contextWindow: 4096,
    maxTokens: 2048,
    temperature: 0.7,
    topP: 0.9
  };

  const mockModels = [
    {
      id: 1,
      modelName: 'gpt-4',
      displayName: 'GPT-4',
      maxContextWindow: 8192,
      maxOutputTokens: 4096
    },
    {
      id: 2,
      modelName: 'claude-3',
      displayName: 'Claude-3',
      maxContextWindow: 100000,
      maxOutputTokens: 4096
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock responses
    mockStore.ai.getModelList.mockResolvedValue(mockModels);

    wrapper = mount(ChatSettings, {
      global: {
        plugins: [ElementPlus],
        stubs: ['el-dialog', 'el-form', 'el-form-item', 'el-select', 'el-option', 'el-slider', 'el-collapse', 'el-collapse-item', 'el-button']
      },
      props: {
        modelConfig: mockModelConfig
      }
    });
  });

  it('renders properly with props', () => {
    expect(wrapper.find('.chat-settings').exists()).toBe(true);
    expect(wrapper.find('.settings-panel').exists()).toBe(true);
    expect(wrapper.find('h3').text()).toBe('AI助手设置');
  });

  it('loads models on mount', async () => {
    expect(mockStore.ai.getModelList).toHaveBeenCalled();
    
    await nextTick();
    
    expect(wrapper.vm.availableModels).toEqual(mockModels.map(model => ({
      id: model.id,
      modelName: model.modelName,
      displayName: model.displayName,
      maxContextWindow: model.maxContextWindow,
      maxOutputTokens: model.maxOutputTokens
    })));
  });

  it('initializes form with model config', () => {
    expect(wrapper.vm.form.modelId).toBe(mockModelConfig.modelId);
    expect(wrapper.vm.form.contextWindow).toBe(mockModelConfig.contextWindow);
    expect(wrapper.vm.form.maxTokens).toBe(mockModelConfig.maxTokens);
    expect(wrapper.vm.form.temperature).toBe(0.7); // default value
    expect(wrapper.vm.form.topP).toBe(0.9); // default value
  });

  it('computes selected model correctly', () => {
    wrapper.setData({
      availableModels: mockModels.map(model => ({
        id: model.id,
        modelName: model.modelName,
        displayName: model.displayName,
        maxContextWindow: model.maxContextWindow,
        maxOutputTokens: model.maxOutputTokens
      }))
    });

    expect(wrapper.vm.selectedModel).toEqual(mockModels[0]);
    
    wrapper.setData({
      'form.modelId': 2
    });
    
    expect(wrapper.vm.selectedModel).toEqual(mockModels[1]);
  });

  it('adjusts context window and max tokens when model changes', async () => {
    wrapper.setData({
      availableModels: mockModels.map(model => ({
        id: model.id,
        modelName: model.modelName,
        displayName: model.displayName,
        maxContextWindow: model.maxContextWindow,
        maxOutputTokens: model.maxOutputTokens
      })),
      'form.modelId': 1,
      'form.contextWindow': 8192, // Higher than model max
      'form.maxTokens': 8192 // Higher than model max
    });

    // Change to model with lower limits
    await wrapper.setData({
      'form.modelId': 2
    });

    expect(wrapper.vm.form.contextWindow).toBe(4096); // Should be capped
    expect(wrapper.vm.form.maxTokens).toBe(2048); // Should be capped
  });

  it('restores default values', () => {
    wrapper.setData({
      'form.modelId': 2,
      'form.contextWindow': 1024,
      'form.maxTokens': 512,
      'form.temperature': 0.5,
      'form.topP': 0.8
    });

    wrapper.vm.restoreDefaults();

    expect(wrapper.vm.form.modelId).toBe(mockModels[0]?.id || 1);
    expect(wrapper.vm.form.contextWindow).toBe(4096);
    expect(wrapper.vm.form.maxTokens).toBe(2048);
    expect(wrapper.vm.form.temperature).toBe(0.7);
    expect(wrapper.vm.form.topP).toBe(0.9);
  });

  it('saves settings and emits event', async () => {
    wrapper.setData({
      availableModels: mockModels.map(model => ({
        id: model.id,
        modelName: model.modelName,
        displayName: model.displayName,
        maxContextWindow: model.maxContextWindow,
        maxOutputTokens: model.maxOutputTokens
      }))
    });

    const newConfig = {
      modelId: 2,
      modelName: 'claude-3',
      contextWindow: 8192,
      maxTokens: 4096,
      temperature: 0.8,
      topP: 0.95
    };

    wrapper.setData({
      form: newConfig
    });

    await wrapper.vm.saveSettings();

    expect(wrapper.emitted('settings-changed')).toBeTruthy();
    expect(wrapper.emitted('settings-changed')[0][0]).toEqual(newConfig);
  });

  it('does not save settings without selected model', async () => {
    wrapper.setData({
      availableModels: [],
      selectedModel: null
    });

    await wrapper.vm.saveSettings();

    expect(wrapper.emitted('settings-changed')).toBeFalsy();
  });

  it('handles model loading error', async () => {
    mockStore.ai.getModelList.mockRejectedValue(new Error('Failed to load models'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await nextTick();

    expect(consoleSpy).toHaveBeenCalledWith('加载模型列表失败:', expect.any(Error));
    expect(wrapper.vm.availableModels).toEqual([
      {
        id: 1,
        modelName: 'default-ai',
        displayName: '默认AI模型',
        maxContextWindow: 4096,
        maxOutputTokens: 2048
      }
    ]);

    consoleSpy.mockRestore();
  });

  it('emits close event when overlay is clicked', async () => {
    const overlay = wrapper.find('.settings-overlay');
    await overlay.trigger('click');

    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('emits close event when close button is clicked', async () => {
    const closeButton = wrapper.find('.el-button');
    await closeButton.trigger('click');

    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('validates form before saving', async () => {
    // Mock form validation
    const formRef = {
      validate: vi.fn().mockImplementation((callback) => callback(false))
    };
    
    wrapper.setData({
      formRef: formRef
    });

    await wrapper.vm.saveSettings();

    expect(formRef.validate).toHaveBeenCalled();
    expect(wrapper.emitted('settings-changed')).toBeFalsy();
  });

  it('shows correct temperature and topP slider values', () => {
    expect(wrapper.vm.form.temperature).toBe(0.7);
    expect(wrapper.vm.form.topP).toBe(0.9);

    // Test slider display formatting
    const tempDisplay = wrapper.vm.form.temperature.toFixed(1);
    const topPDisplay = wrapper.vm.form.topP.toFixed(1);

    expect(tempDisplay).toBe('0.7');
    expect(topPDisplay).toBe('0.9');
  });
});