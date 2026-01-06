
// 使用全局表单引用Mock
beforeEach(() => {
  // 设置表单引用Mock
  if (typeof formRef !== 'undefined' && formRef.value) => {
    Object.assign(formRef.value, global.mockFormRef)
  }
  if (typeof editInput !== 'undefined' && editInput.value) {
    Object.assign(editInput.value, global.mockInputRef)
  }
})
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})


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

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import MessageInput from '@/components/ai/MessageInput.vue';
import { ElMessage } from 'element-plus';

// Mock Element Plus
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus');
  return {
    ...actual,
    ElMessage: {
      error: vi.fn(),
      success: vi.fn(),
      info: vi.fn()
    }
  };
});

// Mock navigator.mediaDevices
const mockMediaDevices = {
  getUserMedia: vi.fn()
};

Object.defineProperty(navigator, 'mediaDevices', {
  value: mockMediaDevices,
  writable: true
});

// Mock MediaRecorder
class MockMediaRecorder {
  static instances: any[] = [];
  stream: MediaStream;
  onDataAvailable: ((e: any) => void) | null;
  onStop: (() => void) | null;

  constructor(stream: MediaStream) {
    this.stream = stream;
    this.onDataAvailable = null;
    this.onStop = null;
    MockMediaRecorder.instances.push(this);
  }

  addEventListener(event: string, callback: (e: any) => void) {
    if (event === 'dataavailable') {
      this.onDataAvailable = callback;
    } else if (event === 'stop') {
      this.onStop = callback;
    }
  }

  start() {
    // Mock implementation
  }

  stop() {
    if (this.onStop) {
      this.onStop();
    }
  }
}

vi.stubGlobal('MediaRecorder', MockMediaRecorder);

// 控制台错误检测变量
let consoleSpy: any

describe('MessageInput', () => {
  let wrapper: any;

  const createWrapper = (props = {}) => {
    return mount(MessageInput, {
      props: {
        placeholder: '输入消息...',
        disabled: false,
        ...props
      },
      global: {
        stubs: {
          'el-input': true,
          'el-button': true,
          'el-icon': true,
          'el-popover': true,
          'el-upload': true,
          'el-switch': true
        }
      }
    });
  };

  beforeEach(() => {
    wrapper = createWrapper();
    vi.clearAllMocks();
    MockMediaRecorder.instances = [];
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    wrapper.unmount();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('Component Rendering', () => {
    it('should render correctly with default props', () => {
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.message-input').exists()).toBe(true);
      expect(wrapper.find('.input-container').exists()).toBe(true);
    });

    it('should render input with correct placeholder', () => {
      const input = wrapper.find('.input-container .el-input');
      expect(input.exists()).toBe(true);
      expect(input.attributes('placeholder')).toBe('输入消息...');
    });

    it('should render action buttons', () => {
      const actions = wrapper.find('.input-actions');
      expect(actions.exists()).toBe(true);
      
      const leftActions = actions.find('.left-actions');
      const rightActions = actions.find('.right-actions');
      
      expect(leftActions.exists()).toBe(true);
      expect(rightActions.exists()).toBe(true);
      
      expect(rightActions.find('.el-button[type="primary"]').exists()).toBe(true);
    });

    it('should render emoji picker button', () => {
      const emojiButton = wrapper.find('.left-actions .el-button[title="表情"]');
      expect(emojiButton.exists()).toBe(true);
    });

    it('should render upload buttons', () => {
      const imageUpload = wrapper.find('.left-actions .el-button[title="上传图片"]');
      const docUpload = wrapper.find('.left-actions .el-button[title="上传文档"]');
      
      expect(imageUpload.exists()).toBe(true);
      expect(docUpload.exists()).toBe(true);
    });

    it('should render voice input button', () => {
      const voiceButton = wrapper.find('.left-actions .el-button[title="语音输入"]');
      expect(voiceButton.exists()).toBe(true);
    });

    it('should render thinking mode switch', () => {
      const thinkingSwitch = wrapper.find('.left-actions .el-switch');
      const thinkingLabel = wrapper.find('.left-actions .thinking-label');
      
      expect(thinkingSwitch.exists()).toBe(true);
      expect(thinkingLabel.exists()).toBe(true);
      expect(thinkingLabel.text()).toBe('思考');
    });
  });

  describe('Message Input', () => {
    it('should update message value on input', async () => {
      const input = wrapper.find('.input-container .el-input');
      await input.setValue('Hello, world!');
      
      expect(wrapper.vm.message).toBe('Hello, world!');
    });

    it('should adjust textarea height on input', async () => {
      const adjustHeightSpy = vi.spyOn(wrapper.vm, 'adjustTextareaHeight');
      const input = wrapper.find('.input-container .el-input');
      
      await input.setValue('Hello\nworld');
      
      expect(adjustHeightSpy).toHaveBeenCalled();
    });

    it('should send message on button click', async () => {
      const input = wrapper.find('.input-container .el-input');
      await input.setValue('Test message');
      
      const sendButton = wrapper.find('.right-actions .el-button[type="primary"]');
      await sendButton.trigger('click');
      
      expect(wrapper.emitted('send')).toBeTruthy();
      expect(wrapper.emitted('send')[0]).toEqual(['Test message']);
      expect(wrapper.vm.message).toBe('');
    });

    it('should send message on enter key', async () => {
      const input = wrapper.find('.input-container .el-input');
      await input.setValue('Test message');
      await input.trigger('keyup.enter.exact');
      
      expect(wrapper.emitted('send')).toBeTruthy();
      expect(wrapper.emitted('send')[0]).toEqual(['Test message']);
    });

    it('should not send empty message', async () => {
      const sendButton = wrapper.find('.right-actions .el-button[type="primary"]');
      await sendButton.trigger('click');
      
      expect(wrapper.emitted('send')).toBeFalsy();
    });

    it('should disable send button when message is empty', async () => {
      const sendButton = wrapper.find('.right-actions .el-button[type="primary"]');
      expect(sendButton.attributes('disabled')).toBeDefined();
    });

    it('should enable send button when message is not empty', async () => {
      const input = wrapper.find('.input-container .el-input');
      await input.setValue('Test message');
      
      const sendButton = wrapper.find('.right-actions .el-button[type="primary"]');
      expect(sendButton.attributes('disabled')).toBeUndefined();
    });

    it('should disable all controls when disabled prop is true', () => {
      wrapper = createWrapper({ disabled: true });
      
      const input = wrapper.find('.input-container .el-input');
      const sendButton = wrapper.find('.right-actions .el-button[type="primary"]');
      
      expect(input.attributes('disabled')).toBeDefined();
      expect(sendButton.attributes('disabled')).toBeDefined();
    });
  });

  describe('Emoji Picker', () => {
    it('should show emoji picker when clicked', async () => {
      const emojiButton = wrapper.find('.left-actions .el-button[title="表情"]');
      await emojiButton.trigger('click');
      
      expect(wrapper.vm.showEmojiPicker).toBe(true);
    });

    it('should insert emoji when selected', async () => {
      const emojiButton = wrapper.find('.left-actions .el-button[title="表情"]');
      await emojiButton.trigger('click');
      
      const emoji = wrapper.find('.emoji-picker .emoji');
      await emoji.trigger('click');
      
      expect(wrapper.vm.message).toBe('😊');
      expect(wrapper.vm.showEmojiPicker).toBe(false);
    });

    it('should render common emojis', () => {
      expect(wrapper.vm.commonEmojis).toContain('😊');
      expect(wrapper.vm.commonEmojis).toContain('😂');
      expect(wrapper.vm.commonEmojis).toContain('🤔');
      expect(wrapper.vm.commonEmojis.length).toBe(16);
    });
  });

  describe('File Upload', () => {
    it('should handle image upload', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const uploadComponent = wrapper.find('.left-actions .el-upload[accept="image/*"]');
      
      await uploadComponent.vm.$emit('change', { raw: mockFile });
      
      expect(wrapper.emitted('upload-image')).toBeTruthy();
      expect(wrapper.emitted('upload-image')[0]).toEqual([mockFile]);
    });

    it('should reject non-image files for image upload', async () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const uploadComponent = wrapper.find('.left-actions .el-upload[accept="image/*"]');
      
      await uploadComponent.vm.$emit('change', { raw: mockFile });
      
      expect(ElMessage.error).toHaveBeenCalledWith('请选择图片文件');
      expect(wrapper.emitted('upload-image')).toBeFalsy();
    });

    it('should reject large image files', async () => {
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      const uploadComponent = wrapper.find('.left-actions .el-upload[accept="image/*"]');
      
      await uploadComponent.vm.$emit('change', { raw: largeFile });
      
      expect(ElMessage.error).toHaveBeenCalledWith('图片大小不能超过10MB');
      expect(wrapper.emitted('upload-image')).toBeFalsy();
    });

    it('should handle document upload', async () => {
      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const uploadComponent = wrapper.find('.left-actions .el-upload[accept=".pdf,.doc,.docx,.txt,.md"]');
      
      await uploadComponent.vm.$emit('change', { raw: mockFile });
      
      expect(wrapper.emitted('upload-document')).toBeTruthy();
      expect(wrapper.emitted('upload-document')[0]).toEqual([mockFile]);
      expect(ElMessage.success).toHaveBeenCalledWith('文档 test.pdf 上传成功');
    });

    it('should reject invalid document types', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const uploadComponent = wrapper.find('.left-actions .el-upload[accept=".pdf,.doc,.docx,.txt,.md"]');
      
      await uploadComponent.vm.$emit('change', { raw: mockFile });
      
      expect(ElMessage.error).toHaveBeenCalledWith('只支持上传PDF、Word、TXT、Markdown文档');
      expect(wrapper.emitted('upload-document')).toBeFalsy();
    });

    it('should reject large document files', async () => {
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });
      const uploadComponent = wrapper.find('.left-actions .el-upload[accept=".pdf,.doc,.docx,.txt,.md"]');
      
      await uploadComponent.vm.$emit('change', { raw: largeFile });
      
      expect(ElMessage.error).toHaveBeenCalledWith('文档大小不能超过10MB');
      expect(wrapper.emitted('upload-document')).toBeFalsy();
    });
  });

  describe('Voice Input', () => {
    it('should check speech recognition support', () => {
      expect(wrapper.vm.isSpeechRecognitionSupported).toBe(true);
    });

    it('should start voice recording when clicked', async () => {
      const mockStream = new MediaStream();
      mockMediaDevices.getUserMedia.mockResolvedValue(mockStream);
      
      const voiceButton = wrapper.find('.left-actions .el-button[title="语音输入"]');
      await voiceButton.trigger('click');
      
      expect(mockMediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
      expect(wrapper.vm.isRecording).toBe(true);
    });

    it('should show recording indicator when recording', async () => {
      const mockStream = new MediaStream();
      mockMediaDevices.getUserMedia.mockResolvedValue(mockStream);
      
      const voiceButton = wrapper.find('.left-actions .el-button[title="语音输入"]');
      await voiceButton.trigger('click');
      
      expect(wrapper.find('.recording-indicator').exists()).toBe(true);
      expect(wrapper.find('.recording-indicator').text()).toContain('正在录音，请说话...');
    });

    it('should stop recording when button clicked again', async () => {
      const mockStream = new MediaStream();
      mockMediaDevices.getUserMedia.mockResolvedValue(mockStream);
      
      const voiceButton = wrapper.find('.left-actions .el-button[title="语音输入"]');
      await voiceButton.trigger('click'); // Start
      
      expect(wrapper.vm.isRecording).toBe(true);
      
      await voiceButton.trigger('click'); // Stop
      
      expect(wrapper.vm.isRecording).toBe(false);
    });

    it('should stop recording when stop button clicked', async () => {
      const mockStream = new MediaStream();
      mockMediaDevices.getUserMedia.mockResolvedValue(mockStream);
      
      const voiceButton = wrapper.find('.left-actions .el-button[title="语音输入"]');
      await voiceButton.trigger('click'); // Start
      
      const stopButton = wrapper.find('.recording-indicator .el-button');
      await stopButton.trigger('click');
      
      expect(wrapper.vm.isRecording).toBe(false);
    });

    it('should handle voice input errors', async () => {
      mockMediaDevices.getUserMedia.mockRejectedValue(new Error('Microphone access denied'));
      
      const voiceButton = wrapper.find('.left-actions .el-button[title="语音输入"]');
      await voiceButton.trigger('click');
      
      expect(ElMessage.error).toHaveBeenCalledWith('无法访问麦克风，请检查浏览器权限设置');
      expect(wrapper.vm.isRecording).toBe(false);
    });

    it('should emit voice input when recording stops', async () => {
      const mockStream = new MediaStream();
      mockMediaDevices.getUserMedia.mockResolvedValue(mockStream);
      
      const voiceButton = wrapper.find('.left-actions .el-button[title="语音输入"]');
      await voiceButton.trigger('click'); // Start
      
      // Simulate recording data
      const recorder = MockMediaRecorder.instances[0];
      if (recorder && recorder.onDataAvailable) {
        recorder.onDataAvailable({ data: new Blob(['test audio'], { type: 'audio/webm' }) });
      }
      
      await voiceButton.trigger('click'); // Stop
      
      expect(wrapper.emitted('voice-input')).toBeTruthy();
    });

    it('should auto-stop recording after 10 seconds', async () => {
      vi.useFakeTimers();
      
      const mockStream = new MediaStream();
      mockMediaDevices.getUserMedia.mockResolvedValue(mockStream);
      
      const voiceButton = wrapper.find('.left-actions .el-button[title="语音输入"]');
      await voiceButton.trigger('click'); // Start
      
      expect(wrapper.vm.isRecording).toBe(true);
      
      vi.advanceTimersByTime(10000);
      
      expect(wrapper.vm.isRecording).toBe(false);
      
      vi.useRealTimers();
    });
  });

  describe('Thinking Mode', () => {
    it('should toggle thinking mode', async () => {
      const thinkingSwitch = wrapper.find('.left-actions .el-switch');
      
      expect(wrapper.vm.thinkingMode).toBe(false);
      
      await thinkingSwitch.setValue(true);
      
      expect(wrapper.vm.thinkingMode).toBe(true);
      expect(wrapper.emitted('thinking-mode-change')).toBeTruthy();
      expect(wrapper.emitted('thinking-mode-change')[0]).toEqual([true]);
      expect(ElMessage.info).toHaveBeenCalledWith('已启用思考模式');
    });

    it('should emit thinking mode change event', async () => {
      const thinkingSwitch = wrapper.find('.left-actions .el-switch');
      
      await thinkingSwitch.setValue(false);
      
      expect(wrapper.emitted('thinking-mode-change')).toBeTruthy();
      expect(wrapper.emitted('thinking-mode-change')[0]).toEqual([false]);
      expect(ElMessage.info).toHaveBeenCalledWith('已关闭思考模式');
    });
  });

  describe('Textarea Height Adjustment', () => {
    it('should adjust textarea height based on content', async () => {
      const mockInputEl = {
        style: { height: 'auto' },
        scrollHeight: 100,
        getBoundingClientRect: () => ({ height: 20 })
      };
      
      wrapper.vm.inputEl = mockInputEl;
      
      vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        lineHeight: '20px',
        paddingTop: '8px',
        paddingBottom: '8px'
      } as any);
      
      wrapper.vm.adjustTextareaHeight();
      
      expect(wrapper.vm.rows).toBe(3);
      expect(mockInputEl.style.height).toBe('76px'); // (20 * 3) + 8 + 8
    });

    it('should respect min and max rows', async () => {
      const mockInputEl = {
        style: { height: 'auto' },
        scrollHeight: 20,
        getBoundingClientRect: () => ({ height: 20 })
      };
      
      wrapper.vm.inputEl = mockInputEl;
      
      vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        lineHeight: '20px',
        paddingTop: '8px',
        paddingBottom: '8px'
      } as any);
      
      wrapper.vm.adjustTextareaHeight();
      
      expect(wrapper.vm.rows).toBe(1); // Min rows
      
      mockInputEl.scrollHeight = 200;
      wrapper.vm.adjustTextareaHeight();
      
      expect(wrapper.vm.rows).toBe(5); // Max rows
    });
  });

  describe('Component Lifecycle', () => {
    it('should focus input on mount', () => {
      const mockInputEl = { focus: vi.fn() };
      wrapper.vm.inputEl = mockInputEl;
      
      wrapper.vm.$options.mounted?.forEach((hook: any) => hook.call(wrapper.vm));
      
      expect(mockInputEl.focus).toHaveBeenCalled();
    });

    it('should stop recording on unmount', async () => {
      const mockStream = new MediaStream();
      mockMediaDevices.getUserMedia.mockResolvedValue(mockStream);
      
      const voiceButton = wrapper.find('.left-actions .el-button[title="语音输入"]');
      await voiceButton.trigger('click'); // Start recording
      
      expect(wrapper.vm.isRecording).toBe(true);
      
      wrapper.unmount();
      
      expect(wrapper.vm.isRecording).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing file raw data', async () => {
      const uploadComponent = wrapper.find('.left-actions .el-upload[accept="image/*"]');
      await uploadComponent.vm.$emit('change', {});
      
      expect(wrapper.emitted('upload-image')).toBeFalsy();
    });

    it('should handle empty recording chunks', async () => {
      const mockStream = new MediaStream();
      mockMediaDevices.getUserMedia.mockResolvedValue(mockStream);
      
      const voiceButton = wrapper.find('.left-actions .el-button[title="语音输入"]');
      await voiceButton.trigger('click'); // Start
      
      // Don't add any data chunks
      
      await voiceButton.trigger('click'); // Stop
      
      expect(wrapper.emitted('voice-input')).toBeFalsy();
    });

    it('should handle disabled state for all actions', () => {
      wrapper = createWrapper({ disabled: true });
      
      const emojiButton = wrapper.find('.left-actions .el-button[title="表情"]');
      const voiceButton = wrapper.find('.left-actions .el-button[title="语音输入"]');
      const thinkingSwitch = wrapper.find('.left-actions .el-switch');
      
      expect(emojiButton.attributes('disabled')).toBeDefined();
      expect(voiceButton.attributes('disabled')).toBeDefined();
      expect(thinkingSwitch.attributes('disabled')).toBeDefined();
    });
  });
});