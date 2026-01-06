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
import { createRouter, createWebHistory, Router } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';
import ConfigPanel from '@/components/ai/ConfigPanel.vue';

// Mock the ai store
vi.mock('@/stores/ai', () => ({
  useAiStore: () => ({
    settings: {
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 1000,
      topP: 1.0,
      frequencyPenalty: 0,
      presencePenalty: 0,
      systemPrompt: 'You are a helpful assistant',
      enableMemory: true,
      enableWebSearch: false,
      enableCodeExecution: false,
      language: 'zh-CN',
      theme: 'light',
      fontSize: 14,
      autoSave: true,
      notifications: true
    },
    availableModels: [
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient' },
      { id: 'gpt-4', name: 'GPT-4', description: 'More powerful' },
      { id: 'claude-3', name: 'Claude 3', description: 'Anthropic model' }
    ],
    updateSettings: vi.fn(),
    resetSettings: vi.fn(),
    exportSettings: vi.fn(),
    importSettings: vi.fn()
  })
}));

describe('ConfigPanel.vue', () => {
  let router: Router;
  let pinia: any;

  beforeEach(async () => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: '/',
          name: 'home',
          component: { template: '<div>Home</div>' }
        }
      ]
    });

    pinia = createPinia();
    setActivePinia(pinia);
  });

  it('renders correctly with default props', () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.find('.config-panel').exists()).toBe(true);
    expect(wrapper.find('.config-header').exists()).toBe(true);
    expect(wrapper.find('.config-content').exists()).toBe(true);
  });

  it('displays header with title', () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    const header = wrapper.find('.config-header');
    expect(header.exists()).toBe(true);
    expect(header.text()).toContain('AI配置');
  });

  it('displays model selection dropdown', () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    const modelSelect = wrapper.find('.model-select');
    expect(modelSelect.exists()).toBe(true);
  });

  it('displays temperature slider', () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    const temperatureSlider = wrapper.find('.temperature-slider');
    expect(temperatureSlider.exists()).toBe(true);
  });

  it('displays max tokens input', () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    const maxTokensInput = wrapper.find('.max-tokens-input');
    expect(maxTokensInput.exists()).toBe(true);
  });

  it('displays topP slider', () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    const topPSlider = wrapper.find('.top-p-slider');
    expect(topPSlider.exists()).toBe(true);
  });

  it('displays frequency penalty slider', () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    const frequencyPenaltySlider = wrapper.find('.frequency-penalty-slider');
    expect(frequencyPenaltySlider.exists()).toBe(true);
  });

  it('displays presence penalty slider', () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    const presencePenaltySlider = wrapper.find('.presence-penalty-slider');
    expect(presencePenaltySlider.exists()).toBe(true);
  });

  it('displays system prompt textarea', () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    const systemPromptTextarea = wrapper.find('.system-prompt-textarea');
    expect(systemPromptTextarea.exists()).toBe(true);
  });

  it('displays feature toggles', () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    const enableMemoryToggle = wrapper.find('.enable-memory-toggle');
    const enableWebSearchToggle = wrapper.find('.enable-web-search-toggle');
    const enableCodeExecutionToggle = wrapper.find('.enable-code-execution-toggle');

    expect(enableMemoryToggle.exists()).toBe(true);
    expect(enableWebSearchToggle.exists()).toBe(true);
    expect(enableCodeExecutionToggle.exists()).toBe(true);
  });

  it('displays language selection', () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    const languageSelect = wrapper.find('.language-select');
    expect(languageSelect.exists()).toBe(true);
  });

  it('displays theme selection', () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    const themeSelect = wrapper.find('.theme-select');
    expect(themeSelect.exists()).toBe(true);
  });

  it('displays font size input', () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    const fontSizeInput = wrapper.find('.font-size-input');
    expect(fontSizeInput.exists()).toBe(true);
  });

  it('displays auto-save toggle', () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    const autoSaveToggle = wrapper.find('.auto-save-toggle');
    expect(autoSaveToggle.exists()).toBe(true);
  });

  it('displays notifications toggle', () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    const notificationsToggle = wrapper.find('.notifications-toggle');
    expect(notificationsToggle.exists()).toBe(true);
  });

  it('handles model selection change', async () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    const modelSelect = wrapper.find('.model-select');
    await modelSelect.setValue('gpt-4');

    expect(wrapper.vm.localSettings.model).toBe('gpt-4');
  });

  it('handles temperature change', async () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    const temperatureSlider = wrapper.find('.temperature-slider');
    await temperatureSlider.setValue(0.9);

    expect(wrapper.vm.localSettings.temperature).toBe(0.9);
  });

  it('handles max tokens change', async () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    const maxTokensInput = wrapper.find('.max-tokens-input');
    await maxTokensInput.setValue(2000);

    expect(wrapper.vm.localSettings.maxTokens).toBe(2000);
  });

  it('handles topP change', async () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    const topPSlider = wrapper.find('.top-p-slider');
    await topPSlider.setValue(0.8);

    expect(wrapper.vm.localSettings.topP).toBe(0.8);
  });

  it('handles frequency penalty change', async () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    const frequencyPenaltySlider = wrapper.find('.frequency-penalty-slider');
    await frequencyPenaltySlider.setValue(0.5);

    expect(wrapper.vm.localSettings.frequencyPenalty).toBe(0.5);
  });

  it('handles presence penalty change', async () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    const presencePenaltySlider = wrapper.find('.presence-penalty-slider');
    await presencePenaltySlider.setValue(0.3);

    expect(wrapper.vm.localSettings.presencePenalty).toBe(0.3);
  });

  it('handles system prompt change', async () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    const systemPromptTextarea = wrapper.find('.system-prompt-textarea');
    await systemPromptTextarea.setValue('You are a coding assistant');

    expect(wrapper.vm.localSettings.systemPrompt).toBe('You are a coding assistant');
  });

  it('handles memory toggle change', async () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    const enableMemoryToggle = wrapper.find('.enable-memory-toggle');
    await enableMemoryToggle.setValue(false);

    expect(wrapper.vm.localSettings.enableMemory).toBe(false);
  });

  it('handles web search toggle change', async () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    const enableWebSearchToggle = wrapper.find('.enable-web-search-toggle');
    await enableWebSearchToggle.setValue(true);

    expect(wrapper.vm.localSettings.enableWebSearch).toBe(true);
  });

  it('handles code execution toggle change', async () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    const enableCodeExecutionToggle = wrapper.find('.enable-code-execution-toggle');
    await enableCodeExecutionToggle.setValue(true);

    expect(wrapper.vm.localSettings.enableCodeExecution).toBe(true);
  });

  it('handles language selection change', async () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    const languageSelect = wrapper.find('.language-select');
    await languageSelect.setValue('en-US');

    expect(wrapper.vm.localSettings.language).toBe('en-US');
  });

  it('handles theme selection change', async () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    const themeSelect = wrapper.find('.theme-select');
    await themeSelect.setValue('dark');

    expect(wrapper.vm.localSettings.theme).toBe('dark');
  });

  it('handles font size change', async () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    const fontSizeInput = wrapper.find('.font-size-input');
    await fontSizeInput.setValue(16);

    expect(wrapper.vm.localSettings.fontSize).toBe(16);
  });

  it('handles auto-save toggle change', async () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    const autoSaveToggle = wrapper.find('.auto-save-toggle');
    await autoSaveToggle.setValue(false);

    expect(wrapper.vm.localSettings.autoSave).toBe(false);
  });

  it('handles notifications toggle change', async () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    const notificationsToggle = wrapper.find('.notifications-toggle');
    await notificationsToggle.setValue(false);

    expect(wrapper.vm.localSettings.notifications).toBe(false);
  });

  it('handles save button click', async () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    const updateSettingsSpy = vi.fn();
    wrapper.vm.updateSettings = updateSettingsSpy;

    const saveButton = wrapper.find('.save-button');
    await saveButton.trigger('click');

    expect(updateSettingsSpy).toHaveBeenCalledWith(wrapper.vm.localSettings);
  });

  it('handles reset button click', async () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    const resetSettingsSpy = vi.fn();
    wrapper.vm.resetSettings = resetSettingsSpy;

    const resetButton = wrapper.find('.reset-button');
    await resetButton.trigger('click');

    expect(resetSettingsSpy).toHaveBeenCalled();
  });

  it('handles export button click', async () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    const exportSettingsSpy = vi.fn();
    wrapper.vm.exportSettings = exportSettingsSpy;

    const exportButton = wrapper.find('.export-button');
    await exportButton.trigger('click');

    expect(exportSettingsSpy).toHaveBeenCalled();
  });

  it('handles import button click', async () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    const importSettingsSpy = vi.fn();
    wrapper.vm.importSettings = importSettingsSpy;

    const importButton = wrapper.find('.import-button');
    await importButton.trigger('click');

    expect(importSettingsSpy).toHaveBeenCalled();
  });

  it('displays model descriptions', () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    const modelDescriptions = wrapper.findAll('.model-description');
    expect(modelDescriptions.length).toBeGreaterThan(0);
  });

  it('displays validation errors for invalid inputs', async () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    const maxTokensInput = wrapper.find('.max-tokens-input');
    await maxTokensInput.setValue(0);

    expect(wrapper.find('.validation-error').exists()).toBe(true);
  });

  it('displays settings categories tabs', () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    const tabs = wrapper.findAll('.config-tab');
    expect(tabs.length).toBeGreaterThan(0);
  });

  it('handles tab switching', async () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    const advancedTab = wrapper.find('.tab-advanced');
    await advancedTab.trigger('click');

    expect(wrapper.vm.activeTab).toBe('advanced');
  });

  it('displays advanced settings when advanced tab is active', async () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ activeTab: 'advanced' });

    expect(wrapper.find('.advanced-settings').exists()).toBe(true);
  });

  it('handles close button click', async () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    const closeButton = wrapper.find('.close-button');
    await closeButton.trigger('click');

    expect(wrapper.emitted('close')).toBeTruthy();
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('displays unsaved changes warning', async () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ hasUnsavedChanges: true });

    expect(wrapper.find('.unsaved-changes-warning').exists()).toBe(true);
  });

  it('handles auto-save when enabled', async () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ localSettings: { ...wrapper.vm.localSettings, autoSave: true } });

    const temperatureSlider = wrapper.find('.temperature-slider');
    await temperatureSlider.setValue(0.8);

    expect(wrapper.vm.autoSaveTimer).toBeDefined();
  });

  it('is a Vue instance', () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.vm).toBeTruthy();
    expect(wrapper.findComponent(ConfigPanel).exists()).toBe(true);
  });

  it('has correct component structure', () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.find('.config-panel').exists()).toBe(true);
    expect(wrapper.find('.config-header').exists()).toBe(true);
    expect(wrapper.find('.config-content').exists()).toBe(true);
  });

  it('applies correct CSS classes', () => {
    const wrapper = mount(ConfigPanel, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.classes()).toContain('config-panel');
  });
});