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
import AIAssistant from '@/components/ai/AIAssistant.vue';

// Mock the request module
vi.mock('@/utils/request', () => ({
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn()
}));

// Mock the ai store
vi.mock('@/stores/ai', () => ({
  useAiStore: () => ({
    conversations: [],
    currentConversation: null,
    isLoading: false,
    error: null,
    settings: {
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 1000
    },
    fetchConversations: vi.fn(),
    createConversation: vi.fn(),
    deleteConversation: vi.fn(),
    sendMessage: vi.fn(),
    updateSettings: vi.fn(),
    clearError: vi.fn()
  })
}));

describe('AIAssistant.vue', () => {
  let router: Router;
  let pinia: any;

  beforeEach(() => {
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
    const wrapper = mount(AIAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.find('.ai-assistant').exists()).toBe(true);
    expect(wrapper.find('.ai-header').exists()).toBe(true);
    expect(wrapper.find('.ai-chat-container').exists()).toBe(true);
    expect(wrapper.find('.ai-input-area').exists()).toBe(true);
  });

  it('displays header with title', () => {
    const wrapper = mount(AIAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const header = wrapper.find('.ai-header');
    expect(header.exists()).toBe(true);
    expect(header.text()).toContain('AI助手');
  });

  it('displays chat input area', () => {
    const wrapper = mount(AIAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const inputArea = wrapper.find('.ai-input-area');
    expect(inputArea.exists()).toBe(true);
    expect(inputArea.find('textarea').exists()).toBe(true);
    expect(inputArea.find('button').exists()).toBe(true);
  });

  it('displays loading state when loading', async () => {
    const wrapper = mount(AIAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    // Simulate loading state
    await wrapper.setData({ isLoading: true });

    expect(wrapper.find('.loading-indicator').exists()).toBe(true);
    expect(wrapper.find('.ai-input-area button').attributes('disabled')).toBe('');
  });

  it('displays error message when error exists', async () => {
    const wrapper = mount(AIAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    // Simulate error state
    await wrapper.setData({ error: 'Test error message' });

    expect(wrapper.find('.error-message').exists()).toBe(true);
    expect(wrapper.find('.error-message').text()).toBe('Test error message');
  });

  it('handles send message click', async () => {
    const wrapper = mount(AIAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const sendMessageSpy = vi.fn();
    wrapper.vm.sendMessage = sendMessageSpy;

    const inputArea = wrapper.find('.ai-input-area');
    const textarea = inputArea.find('textarea');
    const button = inputArea.find('button');

    await textarea.setValue('Hello AI');
    await button.trigger('click');

    expect(sendMessageSpy).toHaveBeenCalledWith('Hello AI');
  });

  it('handles enter key to send message', async () => {
    const wrapper = mount(AIAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const sendMessageSpy = vi.fn();
    wrapper.vm.sendMessage = sendMessageSpy;

    const textarea = wrapper.find('textarea');

    await textarea.setValue('Hello AI');
    await textarea.trigger('keydown', { key: 'Enter', shiftKey: false });

    expect(sendMessageSpy).toHaveBeenCalledWith('Hello AI');
  });

  it('does not send message on shift+enter', async () => {
    const wrapper = mount(AIAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const sendMessageSpy = vi.fn();
    wrapper.vm.sendMessage = sendMessageSpy;

    const textarea = wrapper.find('textarea');

    await textarea.setValue('Hello AI');
    await textarea.trigger('keydown', { key: 'Enter', shiftKey: true });

    expect(sendMessageSpy).not.toHaveBeenCalled();
  });

  it('disables send button when input is empty', () => {
    const wrapper = mount(AIAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const button = wrapper.find('.ai-input-area button');
    expect(button.attributes('disabled')).toBe('');
  });

  it('enables send button when input has text', async () => {
    const wrapper = mount(AIAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const textarea = wrapper.find('textarea');
    const button = wrapper.find('.ai-input-area button');

    await textarea.setValue('Hello AI');

    expect(button.attributes('disabled')).toBeUndefined();
  });

  it('clears input after sending message', async () => {
    const wrapper = mount(AIAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const textarea = wrapper.find('textarea');
    const button = wrapper.find('.ai-input-area button');

    await textarea.setValue('Hello AI');
    await button.trigger('click');

    expect(textarea.element.value).toBe('');
  });

  it('displays conversation messages', async () => {
    const wrapper = mount(AIAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const messages = [
      { id: 1, role: 'user', content: 'Hello', timestamp: new Date().toISOString() },
      { id: 2, role: 'assistant', content: 'Hi there!', timestamp: new Date().toISOString() }
    ];

    await wrapper.setData({ messages });

    const messageElements = wrapper.findAll('.message');
    expect(messageElements.length).toBe(2);
    
    const userMessage = messageElements[0];
    const assistantMessage = messageElements[1];
    
    expect(userMessage.classes()).toContain('user-message');
    expect(userMessage.text()).toContain('Hello');
    
    expect(assistantMessage.classes()).toContain('assistant-message');
    expect(assistantMessage.text()).toContain('Hi there!');
  });

  it('handles empty conversation', () => {
    const wrapper = mount(AIAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const messages = wrapper.findAll('.message');
    expect(messages.length).toBe(0);
    
    const emptyState = wrapper.find('.empty-state');
    expect(emptyState.exists()).toBe(true);
    expect(emptyState.text()).toContain('开始对话');
  });

  it('displays settings panel', async () => {
    const wrapper = mount(AIAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const settingsButton = wrapper.find('.settings-button');
    await settingsButton.trigger('click');

    expect(wrapper.find('.settings-panel').exists()).toBe(true);
  });

  it('handles settings change', async () => {
    const wrapper = mount(AIAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const updateSettingsSpy = vi.fn();
    wrapper.vm.updateSettings = updateSettingsSpy;

    const settingsButton = wrapper.find('.settings-button');
    await settingsButton.trigger('click');

    const modelSelect = wrapper.find('.model-select');
    await modelSelect.setValue('gpt-4');

    expect(updateSettingsSpy).toHaveBeenCalledWith({ model: 'gpt-4' });
  });

  it('handles conversation history', async () => {
    const wrapper = mount(AIAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const historyButton = wrapper.find('.history-button');
    await historyButton.trigger('click');

    expect(wrapper.find('.conversation-history').exists()).toBe(true);
  });

  it('handles conversation selection', async () => {
    const wrapper = mount(AIAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const loadConversationSpy = vi.fn();
    wrapper.vm.loadConversation = loadConversationSpy;

    const historyButton = wrapper.find('.history-button');
    await historyButton.trigger('click');

    const conversationItem = wrapper.find('.conversation-item');
    await conversationItem.trigger('click');

    expect(loadConversationSpy).toHaveBeenCalledWith(1);
  });

  it('handles new conversation creation', async () => {
    const wrapper = mount(AIAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const newConversationSpy = vi.fn();
    wrapper.vm.newConversation = newConversationSpy;

    const newButton = wrapper.find('.new-conversation-button');
    await newButton.trigger('click');

    expect(newConversationSpy).toHaveBeenCalled();
  });

  it('handles conversation deletion', async () => {
    const wrapper = mount(AIAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const deleteConversationSpy = vi.fn();
    wrapper.vm.deleteConversation = deleteConversationSpy;

    const historyButton = wrapper.find('.history-button');
    await historyButton.trigger('click');

    const deleteButton = wrapper.find('.delete-conversation-button');
    await deleteButton.trigger('click');

    expect(deleteConversationSpy).toHaveBeenCalledWith(1);
  });

  it('handles error clearing', async () => {
    const wrapper = mount(AIAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ error: 'Test error' });

    const clearErrorSpy = vi.fn();
    wrapper.vm.clearError = clearErrorSpy;

    const errorCloseButton = wrapper.find('.error-close-button');
    await errorCloseButton.trigger('click');

    expect(clearErrorSpy).toHaveBeenCalled();
  });

  it('handles theme switching', async () => {
    const wrapper = mount(AIAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const themeButton = wrapper.find('.theme-button');
    await themeButton.trigger('click');

    expect(wrapper.vm.currentTheme).toBe('dark');
    expect(wrapper.classes()).toContain('dark-theme');
  });

  it('handles fullscreen mode', async () => {
    const wrapper = mount(AIAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const fullscreenButton = wrapper.find('.fullscreen-button');
    await fullscreenButton.trigger('click');

    expect(wrapper.vm.isFullscreen).toBe(true);
    expect(wrapper.classes()).toContain('fullscreen');
  });

  it('handles message streaming', async () => {
    const wrapper = mount(AIAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const simulateStreaming = async () => {
      await wrapper.setData({ isStreaming: true });
      await new Promise(resolve => setTimeout(resolve, 100));
      await wrapper.setData({ isStreaming: false });
    };

    await simulateStreaming();

    expect(wrapper.vm.isStreaming).toBe(false);
  });

  it('handles voice input', async () => {
    const wrapper = mount(AIAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const voiceButton = wrapper.find('.voice-button');
    await voiceButton.trigger('click');

    expect(wrapper.vm.isVoiceInputActive).toBe(true);
  });

  it('handles file upload', async () => {
    const wrapper = mount(AIAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    const fileInput = wrapper.find('.file-input');
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });

    await fileInput.trigger('change', {
      target: {
        files: [file]
      }
    });

    expect(wrapper.vm.uploadedFiles).toHaveLength(1);
    expect(wrapper.vm.uploadedFiles[0].name).toBe('test.txt');
  });

  it('is a Vue instance', () => {
    const wrapper = mount(AIAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.vm).toBeTruthy();
    expect(wrapper.findComponent(AIAssistant).exists()).toBe(true);
  });

  it('has correct component structure', () => {
    const wrapper = mount(AIAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.find('.ai-assistant').exists()).toBe(true);
    expect(wrapper.find('.ai-header').exists()).toBe(true);
    expect(wrapper.find('.ai-chat-container').exists()).toBe(true);
    expect(wrapper.find('.ai-input-area').exists()).toBe(true);
  });

  it('applies correct CSS classes', () => {
    const wrapper = mount(AIAssistant, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.classes()).toContain('ai-assistant');
  });
});