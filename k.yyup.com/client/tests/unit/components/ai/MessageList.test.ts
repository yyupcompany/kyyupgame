import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import MessageList from '@/components/ai/MessageList.vue';
import ComponentRenderer from '@/components/ai/ComponentRenderer.vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// Mock Element Plus
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus');
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn()
    },
    ElMessageBox: {
      alert: vi.fn()
    }
  };
});

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((date, formatStr) => '2024-01-01 12:00')
}));

// Mock marked
vi.mock('marked', () => ({
  setOptions: vi.fn(),
  default: vi.fn((content) => `<p>${content}</p>`)
}));

// Mock DOMPurify
vi.mock('dompurify', () => ({
  sanitize: vi.fn((html) => html)
}));

// Mock ComponentRenderer
vi.mock('@/components/ai/ComponentRenderer.vue', () => ({
  default: {
    name: 'ComponentRenderer',
    template: '<div class="component-renderer"></div>',
    props: ['component'],
    emits: ['action']
  }
}));

describe('MessageList', () => {
  let wrapper: any;

  const mockMessages = [
    {
      id: '1',
      role: 'user',
      content: 'Hello, AI!',
      timestamp: '2024-01-01T12:00:00Z',
      status: 'sent',
      attachments: []
    },
    {
      id: '2',
      role: 'assistant',
      content: 'Hello! How can I help you today?',
      timestamp: '2024-01-01T12:01:00Z',
      status: 'received',
      attachments: []
    },
    {
      id: '3',
      role: 'system',
      content: 'System notification',
      timestamp: '2024-01-01T12:02:00Z',
      status: 'received',
      attachments: []
    }
  ];

  const createWrapper = (props = {}) => {
    return mount(MessageList, {
      props: {
        messages: [],
        loading: false,
        ...props
      },
      global: {
        stubs: {
          'el-avatar': true,
          'el-icon': true,
          'el-empty': true,
          'el-button': true,
          'component-renderer': ComponentRenderer
        },
        components: {
          ComponentRenderer
        }
      }
    });
  };

  beforeEach(async () => {
    wrapper = createWrapper();
    vi.clearAllMocks();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  describe('Component Rendering', () => {
    it('should render correctly with default props', () => {
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.message-list').exists()).toBe(true);
    });

    it('should display empty state when no messages', () => {
      expect(wrapper.find('.empty-state').exists()).toBe(true);
      expect(wrapper.find('.el-empty').exists()).toBe(true);
    });

    it('should display messages when provided', async () => {
      await wrapper.setProps({ messages: mockMessages });
      
      const messageItems = wrapper.findAll('.message-item');
      expect(messageItems.length).toBe(3);
    });

    it('should show loading indicator when loading', async () => {
      await wrapper.setProps({ loading: true });
      
      expect(wrapper.find('.loading-indicator').exists()).toBe(true);
      expect(wrapper.find('.loading-indicator').text()).toContain('AI正在思考...');
    });
  });

  describe('Message Types', () => {
    beforeEach(async () => {
      await wrapper.setProps({ messages: mockMessages });
    });

    it('should render user message correctly', () => {
      const userMessage = wrapper.find('.message-user');
      expect(userMessage.exists()).toBe(true);
      
      const avatar = userMessage.find('.avatar-user');
      expect(avatar.exists()).toBe(true);
      
      const content = userMessage.find('.message-body');
      expect(content.exists()).toBe(true);
    });

    it('should render assistant message correctly', () => {
      const assistantMessage = wrapper.find('.message-assistant');
      expect(assistantMessage.exists()).toBe(true);
      
      const avatar = assistantMessage.find('.avatar-assistant');
      expect(avatar.exists()).toBe(true);
      
      const content = assistantMessage.find('.message-body');
      expect(content.exists()).toBe(true);
    });

    it('should render system message correctly', () => {
      const systemMessage = wrapper.find('.message-system');
      expect(systemMessage.exists()).toBe(true);
      
      const content = systemMessage.find('.message-body');
      expect(content.exists()).toBe(true);
    });

    it('should display correct sender names', () => {
      const userMessage = wrapper.find('.message-user');
      const assistantMessage = wrapper.find('.message-assistant');
      
      expect(userMessage.find('.message-sender').text()).toBe('您');
      expect(assistantMessage.find('.message-sender').text()).toBe('AI助手');
    });
  });

  describe('Message Content', () => {
    beforeEach(async () => {
      await wrapper.setProps({ messages: mockMessages });
    });

    it('should render message text with markdown', () => {
      const messageText = wrapper.find('.message-assistant .message-text');
      expect(messageText.exists()).toBe(true);
      expect(messageText.html()).toContain('<p>Hello! How can I help you today?</p>');
    });

    it('should format message timestamps', () => {
      const timeElements = wrapper.findAll('.message-time');
      expect(timeElements.length).toBe(3);
      
      timeElements.forEach(timeEl => {
        expect(timeEl.text()).toBe('2024-01-01 12:00');
      });
    });

    it('should handle message status display', () => {
      const sendingMessage = {
        id: '4',
        role: 'user',
        content: 'Sending...',
        timestamp: '2024-01-01T12:03:00Z',
        status: 'sending',
        attachments: []
      };
      
      wrapper.setProps({ messages: [...mockMessages, sendingMessage] });
      
      const loadingElement = wrapper.find('.message-loading');
      expect(loadingElement.exists()).toBe(true);
      expect(loadingElement.text()).toContain('正在发送...');
    });

    it('should handle message error display', () => {
      const errorMessage = {
        id: '5',
        role: 'user',
        content: 'Failed message',
        timestamp: '2024-01-01T12:04:00Z',
        status: 'error',
        attachments: []
      };
      
      wrapper.setProps({ messages: [...mockMessages, errorMessage] });
      
      const errorElement = wrapper.find('.message-error');
      expect(errorElement.exists()).toBe(true);
      expect(errorElement.text()).toContain('发送失败');
    });
  });

  describe('Message Attachments', () => {
    it('should render image attachments', async () => {
      const messageWithImage = {
        id: '6',
        role: 'user',
        content: 'Check this image',
        timestamp: '2024-01-01T12:05:00Z',
        status: 'sent',
        attachments: [
          {
            type: 'image',
            url: 'https://example.com/image.jpg',
            name: 'test.jpg'
          }
        ]
      };
      
      await wrapper.setProps({ messages: [messageWithImage] });
      
      const attachmentImage = wrapper.find('.attachment-image');
      expect(attachmentImage.exists()).toBe(true);
      expect(attachmentImage.attributes('src')).toBe('https://example.com/image.jpg');
    });

    it('should render file attachments', async () => {
      const messageWithFile = {
        id: '7',
        role: 'user',
        content: 'Check this file',
        timestamp: '2024-01-01T12:06:00Z',
        status: 'sent',
        attachments: [
          {
            type: 'file',
            url: 'https://example.com/document.pdf',
            name: 'document.pdf'
          }
        ]
      };
      
      await wrapper.setProps({ messages: [messageWithFile] });
      
      const attachmentFile = wrapper.find('.attachment-file');
      expect(attachmentFile.exists()).toBe(true);
      expect(attachmentFile.text()).toContain('document.pdf');
    });

    it('should handle multiple attachments', async () => {
      const messageWithMultipleAttachments = {
        id: '8',
        role: 'user',
        content: 'Multiple files',
        timestamp: '2024-01-01T12:07:00Z',
        status: 'sent',
        attachments: [
          {
            type: 'image',
            url: 'https://example.com/image1.jpg',
            name: 'image1.jpg'
          },
          {
            type: 'file',
            url: 'https://example.com/doc1.pdf',
            name: 'doc1.pdf'
          }
        ]
      };
      
      await wrapper.setProps({ messages: [messageWithMultipleAttachments] });
      
      const attachments = wrapper.findAll('.attachment-item');
      expect(attachments.length).toBe(2);
    });
  });

  describe('Image Preview', () => {
    it('should open image preview when clicked', async () => {
      const messageWithImage = {
        id: '6',
        role: 'user',
        content: 'Check this image',
        timestamp: '2024-01-01T12:05:00Z',
        status: 'sent',
        attachments: [
          {
            type: 'image',
            url: 'https://example.com/image.jpg',
            name: 'test.jpg'
          }
        ]
      };
      
      await wrapper.setProps({ messages: [messageWithImage] });
      
      const attachmentImage = wrapper.find('.attachment-image');
      await attachmentImage.trigger('click');
      
      expect(ElMessageBox.alert).toHaveBeenCalledWith(
        '<div class="image-preview"><img src="https://example.com/image.jpg" /></div>',
        '图片预览',
        {
          dangerouslyUseHTMLString: true,
          showClose: true,
          showCancelButton: false,
          confirmButtonText: '关闭',
          callback: expect.any(Function)
        }
      );
    });
  });

  describe('Message Components', () => {
    it('should render components from message data', async () => {
      const messageWithComponents = {
        id: '9',
        role: 'assistant',
        content: 'Here are some components',
        timestamp: '2024-01-01T12:08:00Z',
        status: 'received',
        components: [
          { type: 'button', text: 'Click me' },
          { type: 'card', title: 'Card Title' }
        ]
      };
      
      await wrapper.setProps({ messages: [messageWithComponents] });
      
      const componentRenderers = wrapper.findAll('.component-renderer');
      expect(componentRenderers.length).toBe(2);
    });

    it('should parse components from content', () => {
      const messageWithComponentContent = {
        id: '10',
        role: 'assistant',
        content: 'Here is a component [COMPONENTS][{"type": "button", "text": "Click me"}][/COMPONENTS]',
        timestamp: '2024-01-01T12:09:00Z',
        status: 'received'
      };
      
      wrapper.setProps({ messages: [messageWithComponentContent] });
      
      const components = wrapper.vm.getMessageComponents(messageWithComponentContent);
      expect(components).toEqual([{ type: 'button', text: 'Click me' }]);
    });

    it('should handle invalid component JSON', () => {
      const messageWithInvalidComponents = {
        id: '11',
        role: 'assistant',
        content: 'Invalid component [COMPONENTS]invalid json[/COMPONENTS]',
        timestamp: '2024-01-01T12:10:00Z',
        status: 'received'
      };
      
      wrapper.setProps({ messages: [messageWithInvalidComponents] });
      
      const components = wrapper.vm.getMessageComponents(messageWithInvalidComponents);
      expect(components).toEqual([]);
    });

    it('should handle component actions', async () => {
      const messageWithComponents = {
        id: '9',
        role: 'assistant',
        content: 'Here are some components',
        timestamp: '2024-01-01T12:08:00Z',
        status: 'received',
        components: [
          { type: 'button', text: 'Click me' }
        ]
      };
      
      await wrapper.setProps({ messages: [messageWithComponents] });
      
      const componentRenderer = wrapper.findComponent(ComponentRenderer);
      await componentRenderer.vm.$emit('action', { type: 'copy', text: 'Test text' });
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Test text');
    });
  });

  describe('Message Actions', () => {
    it('should emit retry event when retry button clicked', async () => {
      const errorMessage = {
        id: '5',
        role: 'user',
        content: 'Failed message',
        timestamp: '2024-01-01T12:04:00Z',
        status: 'error',
        attachments: []
      };
      
      await wrapper.setProps({ messages: [errorMessage] });
      
      const retryButton = wrapper.find('.message-error .el-button');
      await retryButton.trigger('click');
      
      expect(wrapper.emitted('retry')).toBeTruthy();
      expect(wrapper.emitted('retry')[0]).toEqual(['5']);
    });
  });

  describe('Auto-scroll', () => {
    it('should scroll to bottom when messages change', async () => {
      const scrollToBottomSpy = vi.spyOn(wrapper.vm, 'scrollToBottom');
      
      await wrapper.setProps({ messages: mockMessages });
      
      expect(scrollToBottomSpy).toHaveBeenCalled();
    });

    it('should scroll to bottom on mount', () => {
      const scrollToBottomSpy = vi.spyOn(wrapper.vm, 'scrollToBottom');
      
      wrapper.vm.$options.mounted?.forEach((hook: any) => hook.call(wrapper.vm));
      
      expect(scrollToBottomSpy).toHaveBeenCalled();
    });

    it('should scroll to bottom on update', () => {
      const scrollToBottomSpy = vi.spyOn(wrapper.vm, 'scrollToBottom');
      
      wrapper.vm.$options.updated?.forEach((hook: any) => hook.call(wrapper.vm));
      
      expect(scrollToBottomSpy).toHaveBeenCalled();
    });
  });

  describe('Markdown Rendering', () => {
    it('should render markdown content', () => {
      const markdownMessage = {
        id: '12',
        role: 'assistant',
        content: '# Heading\n\nThis is **bold** text.',
        timestamp: '2024-01-01T12:11:00Z',
        status: 'received'
      };
      
      wrapper.setProps({ messages: [markdownMessage] });
      
      const renderedHtml = wrapper.vm.renderMarkdown(markdownMessage.content);
      expect(renderedHtml).toContain('<h1>Heading</h1>');
      expect(renderedHtml).toContain('<strong>bold</strong>');
    });

    it('should sanitize HTML content', () => {
      const dangerousMessage = {
        id: '13',
        role: 'assistant',
        content: 'Safe text <script>alert("xss")</script>',
        timestamp: '2024-01-01T12:12:00Z',
        status: 'received'
      };
      
      wrapper.setProps({ messages: [dangerousMessage] });
      
      const renderedHtml = wrapper.vm.renderMarkdown(dangerousMessage.content);
      expect(renderedHtml).not.toContain('<script>');
    });

    it('should handle markdown rendering errors', () => {
      const errorMessage = {
        id: '14',
        role: 'assistant',
        content: 'Test content',
        timestamp: '2024-01-01T12:13:00Z',
        status: 'received'
      };
      
      // Mock marked to throw error
      const { default: mockedMarked } = await import('marked');
      mockedMarked.mockImplementation(() => {
        throw new Error('Markdown error');
      });
      
      wrapper.setProps({ messages: [errorMessage] });
      
      const renderedHtml = wrapper.vm.renderMarkdown(errorMessage.content);
      expect(renderedHtml).toContain('Test content');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty message content', () => {
      const emptyMessage = {
        id: '15',
        role: 'assistant',
        content: '',
        timestamp: '2024-01-01T12:14:00Z',
        status: 'received'
      };
      
      wrapper.setProps({ messages: [emptyMessage] });
      
      const messageText = wrapper.find('.message-text');
      expect(messageText.exists()).toBe(true);
    });

    it('should handle invalid timestamp format', () => {
      const invalidTimestampMessage = {
        id: '16',
        role: 'user',
        content: 'Invalid timestamp',
        timestamp: 'invalid-date',
        status: 'sent'
      };
      
      wrapper.setProps({ messages: [invalidTimestampMessage] });
      
      const timeElement = wrapper.find('.message-time');
      expect(timeElement.text()).toBe('invalid-date');
    });

    it('should handle message without status', () => {
      const noStatusMessage = {
        id: '17',
        role: 'user',
        content: 'No status',
        timestamp: '2024-01-01T12:15:00Z'
      };
      
      wrapper.setProps({ messages: [noStatusMessage] });
      
      const messageItem = wrapper.find('.message-item');
      expect(messageItem.exists()).toBe(true);
    });

    it('should handle copy action failure', async () => {
      const messageWithComponents = {
        id: '18',
        role: 'assistant',
        content: 'Component with copy',
        timestamp: '2024-01-01T12:16:00Z',
        status: 'received',
        components: [
          { type: 'button', text: 'Copy me' }
        ]
      };
      
      await wrapper.setProps({ messages: [messageWithComponents] });
      
      // Mock clipboard failure
      vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('Copy failed'));
      
      const componentRenderer = wrapper.findComponent(ComponentRenderer);
      await componentRenderer.vm.$emit('action', { type: 'copy', text: 'Test text' });
      
      expect(ElMessage.error).toHaveBeenCalledWith('复制失败');
    });
  });
});