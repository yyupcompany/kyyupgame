
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
import { createRouter, createWebHistory, Router } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';
import InputArea from '@/components/ai/InputArea.vue';

// Mock the ai store
vi.mock('@/stores/ai', () => ({
  useAiStore: () => ({
    isTyping: false,
    isLoading: false,
    error: null,
    sendMessage: vi.fn(),
    clearInput: vi.fn(),
    setInputValue: vi.fn(),
    attachFile: vi.fn(),
    removeFile: vi.fn(),
    startVoiceInput: vi.fn(),
    stopVoiceInput: vi.fn(),
    insertText: vi.fn()
  })
}));

describe('InputArea.vue', () => {
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
    const wrapper = mount(InputArea, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.find('.input-area').exists()).toBe(true);
    expect(wrapper.find('.input-container').exists()).toBe(true);
    expect(wrapper.find('textarea').exists()).toBe(true);
    expect(wrapper.find('.send-button').exists()).toBe(true);
  });

  it('disables send button when input is empty', () => {
    const wrapper = mount(InputArea, {
      global: {
        plugins: [router, pinia]
      }
    });

    const sendButton = wrapper.find('.send-button');
    expect(sendButton.attributes('disabled')).toBe('');
  });

  it('enables send button when input has text', async () => {
    const wrapper = mount(InputArea, {
      global: {
        plugins: [router, pinia]
      }
    });

    const textarea = wrapper.find('textarea');
    const sendButton = wrapper.find('.send-button');

    await textarea.setValue('Hello AI');

    expect(sendButton.attributes('disabled')).toBeUndefined();
  });

  it('handles send button click', async () => {
    const wrapper = mount(InputArea, {
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
    const wrapper = mount(InputArea, {
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
    const wrapper = mount(InputArea, {
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
    const wrapper = mount(InputArea, {
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

  it('handles input value changes', async () => {
    const wrapper = mount(InputArea, {
      global: {
        plugins: [router, pinia]
      }
    });

    const setInputValueSpy = vi.fn();
    wrapper.vm.setInputValue = setInputValueSpy;

    const textarea = wrapper.find('textarea');
    await textarea.setValue('Hello AI');

    expect(setInputValueSpy).toHaveBeenCalledWith('Hello AI');
  });

  it('displays placeholder text', () => {
    const wrapper = mount(InputArea, {
      global: {
        plugins: [router, pinia]
      }
    });

    const textarea = wrapper.find('textarea');
    expect(textarea.attributes('placeholder')).toBe('输入消息...');
  });

  it('handles textarea focus', async () => {
    const wrapper = mount(InputArea, {
      global: {
        plugins: [router, pinia]
      }
    });

    const textarea = wrapper.find('textarea');
    await textarea.trigger('focus');

    expect(wrapper.vm.isFocused).toBe(true);
  });

  it('handles textarea blur', async () => {
    const wrapper = mount(InputArea, {
      global: {
        plugins: [router, pinia]
      }
    });

    const textarea = wrapper.find('textarea');
    await textarea.trigger('blur');

    expect(wrapper.vm.isFocused).toBe(false);
  });

  it('disables input when loading', async () => {
    const wrapper = mount(InputArea, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ isLoading: true });

    const textarea = wrapper.find('textarea');
    const sendButton = wrapper.find('.send-button');

    expect(textarea.attributes('disabled')).toBe('');
    expect(sendButton.attributes('disabled')).toBe('');
  });

  it('disables input when typing', async () => {
    const wrapper = mount(InputArea, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ isTyping: true });

    const textarea = wrapper.find('textarea');
    const sendButton = wrapper.find('.send-button');

    expect(textarea.attributes('disabled')).toBe('');
    expect(sendButton.attributes('disabled')).toBe('');
  });

  it('displays loading indicator', async () => {
    const wrapper = mount(InputArea, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ isLoading: true });

    expect(wrapper.find('.loading-indicator').exists()).toBe(true);
  });

  it('displays typing indicator', async () => {
    const wrapper = mount(InputArea, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ isTyping: true });

    expect(wrapper.find('.typing-indicator').exists()).toBe(true);
  });

  it('displays error message', async () => {
    const wrapper = mount(InputArea, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ error: 'Failed to send message' });

    expect(wrapper.find('.error-message').exists()).toBe(true);
    expect(wrapper.find('.error-message').text()).toBe('Failed to send message');
  });

  it('handles error dismissal', async () => {
    const wrapper = mount(InputArea, {
      global: {
        plugins: [router, pinia]
      }
    });

    const clearErrorSpy = vi.fn();
    wrapper.vm.clearError = clearErrorSpy;

    await wrapper.setData({ error: 'Failed to send message' });

    const errorCloseButton = wrapper.find('.error-close-button');
    await errorCloseButton.trigger('click');

    expect(clearErrorSpy).toHaveBeenCalled();
  });

  it('displays attachment button', () => {
    const wrapper = mount(InputArea, {
      global: {
        plugins: [router, pinia]
      }
    });

    const attachmentButton = wrapper.find('.attachment-button');
    expect(attachmentButton.exists()).toBe(true);
  });

  it('handles file attachment', async () => {
    const wrapper = mount(InputArea, {
      global: {
        plugins: [router, pinia]
      }
    });

    const attachFileSpy = vi.fn();
    wrapper.vm.attachFile = attachFileSpy;

    const fileInput = wrapper.find('.file-input');
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });

    await fileInput.trigger('change', {
      target: {
        files: [file]
      }
    });

    expect(attachFileSpy).toHaveBeenCalledWith(file);
  });

  it('displays attached files', async () => {
    const wrapper = mount(InputArea, {
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
    const wrapper = mount(InputArea, {
      global: {
        plugins: [router, pinia]
      }
    });

    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    await wrapper.setData({ attachedFiles: [file] });

    const removeFileSpy = vi.fn();
    wrapper.vm.removeFile = removeFileSpy;

    const removeButton = wrapper.find('.remove-file-button');
    await removeButton.trigger('click');

    expect(removeFileSpy).toHaveBeenCalledWith(0);
  });

  it('displays voice input button', () => {
    const wrapper = mount(InputArea, {
      global: {
        plugins: [router, pinia]
      }
    });

    const voiceButton = wrapper.find('.voice-button');
    expect(voiceButton.exists()).toBe(true);
  });

  it('handles voice input start', async () => {
    const wrapper = mount(InputArea, {
      global: {
        plugins: [router, pinia]
      }
    });

    const startVoiceInputSpy = vi.fn();
    wrapper.vm.startVoiceInput = startVoiceInputSpy;

    const voiceButton = wrapper.find('.voice-button');
    await voiceButton.trigger('click');

    expect(startVoiceInputSpy).toHaveBeenCalled();
  });

  it('handles voice input stop', async () => {
    const wrapper = mount(InputArea, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ isVoiceInputActive: true });

    const stopVoiceInputSpy = vi.fn();
    wrapper.vm.stopVoiceInput = stopVoiceInputSpy;

    const voiceButton = wrapper.find('.voice-button');
    await voiceButton.trigger('click');

    expect(stopVoiceInputSpy).toHaveBeenCalled();
  });

  it('displays voice input indicator when active', async () => {
    const wrapper = mount(InputArea, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ isVoiceInputActive: true });

    expect(wrapper.find('.voice-input-indicator').exists()).toBe(true);
  });

  it('displays emoji button', () => {
    const wrapper = mount(InputArea, {
      global: {
        plugins: [router, pinia]
      }
    });

    const emojiButton = wrapper.find('.emoji-button');
    expect(emojiButton.exists()).toBe(true);
  });

  it('handles emoji picker toggle', async () => {
    const wrapper = mount(InputArea, {
      global: {
        plugins: [router, pinia]
      }
    });

    const emojiButton = wrapper.find('.emoji-button');
    await emojiButton.trigger('click');

    expect(wrapper.vm.showEmojiPicker).toBe(true);
  });

  it('displays emoji picker when active', async () => {
    const wrapper = mount(InputArea, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ showEmojiPicker: true });

    expect(wrapper.find('.emoji-picker').exists()).toBe(true);
  });

  it('handles emoji selection', async () => {
    const wrapper = mount(InputArea, {
      global: {
        plugins: [router, pinia]
      }
    });

    const insertTextSpy = vi.fn();
    wrapper.vm.insertText = insertTextSpy;

    await wrapper.setData({ showEmojiPicker: true });

    const emoji = wrapper.find('.emoji');
    await emoji.trigger('click');

    expect(insertTextSpy).toHaveBeenCalledWith('😊');
    expect(wrapper.vm.showEmojiPicker).toBe(false);
  });

  it('displays formatting options', () => {
    const wrapper = mount(InputArea, {
      global: {
        plugins: [router, pinia]
      }
    });

    const formatButton = wrapper.find('.format-button');
    expect(formatButton.exists()).toBe(true);
  });

  it('handles formatting options toggle', async () => {
    const wrapper = mount(InputArea, {
      global: {
        plugins: [router, pinia]
      }
    });

    const formatButton = wrapper.find('.format-button');
    await formatButton.trigger('click');

    expect(wrapper.vm.showFormattingOptions).toBe(true);
  });

  it('displays formatting options when active', async () => {
    const wrapper = mount(InputArea, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ showFormattingOptions: true });

    expect(wrapper.find('.formatting-options').exists()).toBe(true);
  });

  it('handles text formatting', async () => {
    const wrapper = mount(InputArea, {
      global: {
        plugins: [router, pinia]
      }
    });

    const formatTextSpy = vi.fn();
    wrapper.vm.formatText = formatTextSpy;

    await wrapper.setData({ showFormattingOptions: true });

    const boldButton = wrapper.find('.format-bold');
    await boldButton.trigger('click');

    expect(formatTextSpy).toHaveBeenCalledWith('bold');
  });

  it('handles textarea auto-resize', async () => {
    const wrapper = mount(InputArea, {
      global: {
        plugins: [router, pinia]
      }
    });

    const textarea = wrapper.find('textarea');
    await textarea.setValue('Line 1\nLine 2\nLine 3');

    expect(textarea.attributes('rows')).toBeDefined();
  });

  it('handles keyboard shortcuts', async () => {
    const wrapper = mount(InputArea, {
      global: {
        plugins: [router, pinia]
      }
    });

    const textarea = wrapper.find('textarea');

    // Test Ctrl+B for bold
    await textarea.trigger('keydown', { key: 'b', ctrlKey: true });
    expect(wrapper.vm.showFormattingOptions).toBe(true);

    // Test Ctrl+K for link
    await textarea.trigger('keydown', { key: 'k', ctrlKey: true });
    expect(wrapper.vm.showFormattingOptions).toBe(true);
  });

  it('handles input validation', async () => {
    const wrapper = mount(InputArea, {
      global: {
        plugins: [router, pinia]
      }
    });

    const textarea = wrapper.find('textarea');
    
    // Test max length
    const longText = 'a'.repeat(10000);
    await textarea.setValue(longText);

    expect(wrapper.vm.inputValue.length).toBeLessThanOrEqual(4000);
  });

  it('handles character count display', async () => {
    const wrapper = mount(InputArea, {
      global: {
        plugins: [router, pinia]
      }
    });

    const textarea = wrapper.find('textarea');
    await textarea.setValue('Hello');

    const charCount = wrapper.find('.character-count');
    expect(charCount.exists()).toBe(true);
    expect(charCount.text()).toContain('5/4000');
  });

  it('handles suggested actions', () => {
    const wrapper = mount(InputArea, {
      global: {
        plugins: [router, pinia]
      },
      props: {
        suggestions: ['Hello', 'How are you?', 'Help']
      }
    });

    const suggestions = wrapper.findAll('.suggestion');
    expect(suggestions.length).toBe(3);
  });

  it('handles suggestion click', async () => {
    const wrapper = mount(InputArea, {
      global: {
        plugins: [router, pinia]
      },
      props: {
        suggestions: ['Hello', 'How are you?', 'Help']
      }
    });

    const suggestion = wrapper.find('.suggestion');
    await suggestion.trigger('click');

    expect(wrapper.vm.inputValue).toBe('Hello');
  });

  it('is a Vue instance', () => {
    const wrapper = mount(InputArea, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.vm).toBeTruthy();
    expect(wrapper.findComponent(InputArea).exists()).toBe(true);
  });

  it('has correct component structure', () => {
    const wrapper = mount(InputArea, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.find('.input-area').exists()).toBe(true);
    expect(wrapper.find('.input-container').exists()).toBe(true);
    expect(wrapper.find('textarea').exists()).toBe(true);
    expect(wrapper.find('.send-button').exists()).toBe(true);
  });

  it('applies correct CSS classes', () => {
    const wrapper = mount(InputArea, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.classes()).toContain('input-area');
  });
});