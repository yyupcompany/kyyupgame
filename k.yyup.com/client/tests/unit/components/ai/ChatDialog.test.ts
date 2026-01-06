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
import ChatDialog from '@/components/ai/ChatDialog.vue';

// Mock the ai store
vi.mock('@/stores/ai', () => ({
  useAiStore: () => ({
    currentConversation: {
      id: 1,
      title: 'Test Conversation',
      messages: [
        { id: 1, role: 'user', content: 'Hello', timestamp: new Date().toISOString() },
        { id: 2, role: 'assistant', content: 'Hi there!', timestamp: new Date().toISOString() }
      ]
    },
    isLoading: false,
    error: null,
    sendMessage: vi.fn(),
    clearConversation: vi.fn(),
    deleteMessage: vi.fn(),
    editMessage: vi.fn()
  })
}));

describe('ChatDialog.vue', () => {
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
    const wrapper = mount(ChatDialog, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.find('.chat-dialog').exists()).toBe(true);
    expect(wrapper.find('.chat-header').exists()).toBe(true);
    expect(wrapper.find('.chat-messages').exists()).toBe(true);
    expect(wrapper.find('.chat-input').exists()).toBe(true);
  });

  it('displays conversation title', () => {
    const wrapper = mount(ChatDialog, {
      global: {
        plugins: [router, pinia]
      }
    });

    const header = wrapper.find('.chat-header');
    expect(header.exists()).toBe(true);
    expect(header.text()).toContain('Test Conversation');
  });

  it('displays messages correctly', () => {
    const wrapper = mount(ChatDialog, {
      global: {
        plugins: [router, pinia]
      }
    });

    const messages = wrapper.findAll('.message');
    expect(messages.length).toBe(2);

    const userMessage = messages[0];
    const assistantMessage = messages[1];

    expect(userMessage.classes()).toContain('user-message');
    expect(userMessage.text()).toContain('Hello');

    expect(assistantMessage.classes()).toContain('assistant-message');
    expect(assistantMessage.text()).toContain('Hi there!');
  });

  it('displays message timestamps', () => {
    const wrapper = mount(ChatDialog, {
      global: {
        plugins: [router, pinia]
      }
    });

    const timestamps = wrapper.findAll('.message-timestamp');
    expect(timestamps.length).toBe(2);
  });

  it('displays input area with textarea and send button', () => {
    const wrapper = mount(ChatDialog, {
      global: {
        plugins: [router, pinia]
      }
    });

    const inputArea = wrapper.find('.chat-input');
    expect(inputArea.exists()).toBe(true);
    expect(inputArea.find('textarea').exists()).toBe(true);
    expect(inputArea.find('button').exists()).toBe(true);
  });

  it('handles send message button click', async () => {
    const wrapper = mount(ChatDialog, {
      global: {
        plugins: [router, pinia]
      }
    });

    const sendMessageSpy = vi.fn();
    wrapper.vm.sendMessage = sendMessageSpy;

    const textarea = wrapper.find('textarea');
    const sendButton = wrapper.find('.send-button');

    await textarea.setValue('Hello AI');
    await sendButton.trigger('click');

    expect(sendMessageSpy).toHaveBeenCalledWith('Hello AI');
  });

  it('handles enter key to send message', async () => {
    const wrapper = mount(ChatDialog, {
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
    const wrapper = mount(ChatDialog, {
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

  it('clears input after sending message', async () => {
    const wrapper = mount(ChatDialog, {
      global: {
        plugins: [router, pinia]
      }
    });

    const textarea = wrapper.find('textarea');
    const sendButton = wrapper.find('.send-button');

    await textarea.setValue('Hello AI');
    await sendButton.trigger('click');

    expect(textarea.element.value).toBe('');
  });

  it('disables send button when input is empty', () => {
    const wrapper = mount(ChatDialog, {
      global: {
        plugins: [router, pinia]
      }
    });

    const sendButton = wrapper.find('.send-button');
    expect(sendButton.attributes('disabled')).toBe('');
  });

  it('enables send button when input has text', async () => {
    const wrapper = mount(ChatDialog, {
      global: {
        plugins: [router, pinia]
      }
    });

    const textarea = wrapper.find('textarea');
    const sendButton = wrapper.find('.send-button');

    await textarea.setValue('Hello AI');

    expect(sendButton.attributes('disabled')).toBeUndefined();
  });

  it('displays loading state when sending message', async () => {
    const wrapper = mount(ChatDialog, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ isLoading: true });

    expect(wrapper.find('.loading-indicator').exists()).toBe(true);
    expect(wrapper.find('.send-button').attributes('disabled')).toBe('');
  });

  it('displays error message when error exists', async () => {
    const wrapper = mount(ChatDialog, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ error: 'Failed to send message' });

    expect(wrapper.find('.error-message').exists()).toBe(true);
    expect(wrapper.find('.error-message').text()).toBe('Failed to send message');
  });

  it('handles close button click', async () => {
    const wrapper = mount(ChatDialog, {
      global: {
        plugins: [router, pinia]
      }
    });

    const closeButton = wrapper.find('.close-button');
    await closeButton.trigger('click');

    expect(wrapper.emitted('close')).toBeTruthy();
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('handles clear conversation button click', async () => {
    const wrapper = mount(ChatDialog, {
      global: {
        plugins: [router, pinia]
      }
    });

    const clearConversationSpy = vi.fn();
    wrapper.vm.clearConversation = clearConversationSpy;

    const clearButton = wrapper.find('.clear-button');
    await clearButton.trigger('click');

    expect(clearConversationSpy).toHaveBeenCalled();
  });

  it('handles message edit', async () => {
    const wrapper = mount(ChatDialog, {
      global: {
        plugins: [router, pinia]
      }
    });

    const editMessageSpy = vi.fn();
    wrapper.vm.editMessage = editMessageSpy;

    const editButton = wrapper.find('.edit-message-button');
    await editButton.trigger('click');

    expect(editMessageSpy).toHaveBeenCalledWith(1);
  });

  it('handles message delete', async () => {
    const wrapper = mount(ChatDialog, {
      global: {
        plugins: [router, pinia]
      }
    });

    const deleteMessageSpy = vi.fn();
    wrapper.vm.deleteMessage = deleteMessageSpy;

    const deleteButton = wrapper.find('.delete-message-button');
    await deleteButton.trigger('click');

    expect(deleteMessageSpy).toHaveBeenCalledWith(1);
  });

  it('displays message actions on hover', async () => {
    const wrapper = mount(ChatDialog, {
      global: {
        plugins: [router, pinia]
      }
    });

    const message = wrapper.find('.message');
    await message.trigger('mouseenter');

    expect(wrapper.find('.message-actions').exists()).toBe(true);
  });

  it('hides message actions on mouse leave', async () => {
    const wrapper = mount(ChatDialog, {
      global: {
        plugins: [router, pinia]
      }
    });

    const message = wrapper.find('.message');
    await message.trigger('mouseenter');
    await message.trigger('mouseleave');

    expect(wrapper.find('.message-actions').exists()).toBe(false);
  });

  it('handles message copy', async () => {
    const wrapper = mount(ChatDialog, {
      global: {
        plugins: [router, pinia]
      }
    });

    const copySpy = vi.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: copySpy
      }
    });

    const copyButton = wrapper.find('.copy-message-button');
    await copyButton.trigger('click');

    expect(copySpy).toHaveBeenCalledWith('Hello');
  });

  it('handles message retry', async () => {
    const wrapper = mount(ChatDialog, {
      global: {
        plugins: [router, pinia]
      }
    });

    const retryMessageSpy = vi.fn();
    wrapper.vm.retryMessage = retryMessageSpy;

    const retryButton = wrapper.find('.retry-message-button');
    await retryButton.trigger('click');

    expect(retryMessageSpy).toHaveBeenCalledWith(1);
  });

  it('displays typing indicator when AI is typing', async () => {
    const wrapper = mount(ChatDialog, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ isTyping: true });

    expect(wrapper.find('.typing-indicator').exists()).toBe(true);
  });

  it('displays attachment button', () => {
    const wrapper = mount(ChatDialog, {
      global: {
        plugins: [router, pinia]
      }
    });

    const attachmentButton = wrapper.find('.attachment-button');
    expect(attachmentButton.exists()).toBe(true);
  });

  it('handles file attachment', async () => {
    const wrapper = mount(ChatDialog, {
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

    expect(wrapper.vm.attachedFiles).toHaveLength(1);
    expect(wrapper.vm.attachedFiles[0].name).toBe('test.txt');
  });

  it('displays attached files', async () => {
    const wrapper = mount(ChatDialog, {
      global: {
        plugins: [router, pinia]
      }
    });

    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    await wrapper.setData({ attachedFiles: [file] });

    const attachedFile = wrapper.find('.attached-file');
    expect(attachedFile.exists()).toBe(true);
    expect(attachedFile.text()).toContain('test.txt');
  });

  it('handles file removal', async () => {
    const wrapper = mount(ChatDialog, {
      global: {
        plugins: [router, pinia]
      }
    });

    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    await wrapper.setData({ attachedFiles: [file] });

    const removeButton = wrapper.find('.remove-file-button');
    await removeButton.trigger('click');

    expect(wrapper.vm.attachedFiles).toHaveLength(0);
  });

  it('displays voice input button', () => {
    const wrapper = mount(ChatDialog, {
      global: {
        plugins: [router, pinia]
      }
    });

    const voiceButton = wrapper.find('.voice-button');
    expect(voiceButton.exists()).toBe(true);
  });

  it('handles voice input toggle', async () => {
    const wrapper = mount(ChatDialog, {
      global: {
        plugins: [router, pinia]
      }
    });

    const voiceButton = wrapper.find('.voice-button');
    await voiceButton.trigger('click');

    expect(wrapper.vm.isVoiceInputActive).toBe(true);
  });

  it('displays voice input indicator when active', async () => {
    const wrapper = mount(ChatDialog, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ isVoiceInputActive: true });

    expect(wrapper.find('.voice-input-indicator').exists()).toBe(true);
  });

  it('handles message formatting', async () => {
    const wrapper = mount(ChatDialog, {
      global: {
        plugins: [router, pinia]
      }
    });

    const formatButton = wrapper.find('.format-button');
    await formatButton.trigger('click');

    expect(wrapper.vm.showFormattingOptions).toBe(true);
  });

  it('displays formatting options', async () => {
    const wrapper = mount(ChatDialog, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ showFormattingOptions: true });

    expect(wrapper.find('.formatting-options').exists()).toBe(true);
  });

  it('handles message search', async () => {
    const wrapper = mount(ChatDialog, {
      global: {
        plugins: [router, pinia]
      }
    });

    const searchButton = wrapper.find('.search-button');
    await searchButton.trigger('click');

    expect(wrapper.vm.showSearch).toBe(true);
  });

  it('displays search input when search is active', async () => {
    const wrapper = mount(ChatDialog, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ showSearch: true });

    expect(wrapper.find('.search-input').exists()).toBe(true);
  });

  it('handles message filtering based on search', async () => {
    const wrapper = mount(ChatDialog, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ searchQuery: 'Hello' });

    const messages = wrapper.findAll('.message');
    expect(messages.length).toBe(1); // Only user message should be visible
  });

  it('handles window resize for responsive layout', async () => {
    const wrapper = mount(ChatDialog, {
      global: {
        plugins: [router, pinia]
      }
    });

    window.dispatchEvent(new Event('resize'));
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.isMobile).toBeDefined();
  });

  it('is a Vue instance', () => {
    const wrapper = mount(ChatDialog, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.vm).toBeTruthy();
    expect(wrapper.findComponent(ChatDialog).exists()).toBe(true);
  });

  it('has correct component structure', () => {
    const wrapper = mount(ChatDialog, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.find('.chat-dialog').exists()).toBe(true);
    expect(wrapper.find('.chat-header').exists()).toBe(true);
    expect(wrapper.find('.chat-messages').exists()).toBe(true);
    expect(wrapper.find('.chat-input').exists()).toBe(true);
  });

  it('applies correct CSS classes', () => {
    const wrapper = mount(ChatDialog, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.classes()).toContain('chat-dialog');
  });
});