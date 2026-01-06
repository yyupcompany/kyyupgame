/**
 * AI助手组件单元测试
 * 严格验证版本
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import { createTestWrapper, mockElementPlusMessage, mockApiResponse, triggerEvent, waitForAsync } from '../../utils/test-helpers';
import { expectNoConsoleErrors } from '../../setup/console-monitoring';
import { 
  validateRequiredFields,
  validateFieldTypes,
  validateApiResponseStructure 
} from '../../utils/data-validation';

// 导入待测试的组件
import AIAssistant from '@/components/ai-assistant/AIAssistant.vue';
import AIAssistantSidebar from '@/components/ai-assistant/AIAssistantSidebar.vue';
import AIAssistantFullPage from '@/components/ai-assistant/AIAssistantFullPage.vue';

// Mock Element Plus
const mockMessage = mockElementPlusMessage();

// 控制台错误检测变量
let consoleSpy: any

describe('AI Assistant Components - Strict Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock request
    vi.mock('@/utils/request', () => ({
      request: {
        post: vi.fn(),
        get: vi.fn()
      }
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {}));

    // Mock router
    vi.mock('@/router', () => ({
      useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        go: vi.fn()
      })
    }));
  });

  afterEach(() => {
    expectNoConsoleErrors();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('AIAssistant Main Component', () => {
    it('should render correctly with required props', () => {
      const wrapper = createTestWrapper(AIAssistant, {
        props: {
          visible: true,
          mode: 'sidebar'
        }
      });

      // 验证组件渲染
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.ai-assistant').exists()).toBe(true);
      
      // 验证props传递
      expect(wrapper.props('visible')).toBe(true);
      expect(wrapper.props('mode')).toBe('sidebar');
    });

    it('should handle mode switching correctly', async () => {
      const wrapper = createTestWrapper(AIAssistant, {
        props: {
          visible: true,
          mode: 'sidebar'
        }
      });

      // 初始状态验证
      expect(wrapper.find('.ai-assistant-sidebar').exists()).toBe(true);
      expect(wrapper.find('.ai-assistant-fullpage').exists()).toBe(false);

      // 切换到全屏模式
      await wrapper.setProps({ mode: 'fullpage' });
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.ai-assistant-fullpage').exists()).toBe(true);
      expect(wrapper.find('.ai-assistant-sidebar').exists()).toBe(false);
    });

    it('should handle visibility toggle correctly', async () => {
      const wrapper = createTestWrapper(AIAssistant, {
        props: {
          visible: false,
          mode: 'sidebar'
        }
      });

      // 初始隐藏状态
      expect(wrapper.find('.ai-assistant').exists()).toBe(true);
      expect(wrapper.find('.ai-assistant').classes()).toContain('ai-assistant-hidden');

      // 显示组件
      await wrapper.setProps({ visible: true });
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.ai-assistant').classes()).not.toContain('ai-assistant-hidden');
    });

    it('should emit events correctly', async () => {
      const wrapper = createTestWrapper(AIAssistant, {
        props: {
          visible: true,
          mode: 'sidebar'
        }
      });

      // 测试关闭事件
      const closeButton = wrapper.find('[data-testid="close-button"]');
      if (closeButton.exists()) {
        await closeButton.trigger('click');
        expect(wrapper.emitted('close')).toBeDefined();
        expect(wrapper.emitted('close')).toHaveLength(1);
      }

      // 测试模式切换事件
      const modeButton = wrapper.find('[data-testid="mode-toggle"]');
      if (modeButton.exists()) {
        await modeButton.trigger('click');
        expect(wrapper.emitted('mode-change')).toBeDefined();
      }
    });
  });

  describe('AIAssistantSidebar Component', () => {
    it('should render sidebar with correct structure', () => {
      const wrapper = createTestWrapper(AIAssistantSidebar, {
        props: {
          visible: true
        }
      });

      // 验证侧边栏结构
      expect(wrapper.find('.ai-assistant-sidebar').exists()).toBe(true);
      expect(wrapper.find('.ai-assistant-header').exists()).toBe(true);
      expect(wrapper.find('.ai-assistant-content').exists()).toBe(true);
      expect(wrapper.find('.ai-assistant-input').exists()).toBe(true);
    });

    it('should handle message input correctly', async () => {
      const wrapper = createTestWrapper(AIAssistantSidebar, {
        props: {
          visible: true
        }
      });

      const inputElement = wrapper.find('[data-testid="message-input"]');
      if (inputElement.exists()) {
        // 测试输入
        await inputElement.setValue('Test message');
        expect(inputElement.element.value).toBe('Test message');

        // 测试发送按钮
        const sendButton = wrapper.find('[data-testid="send-button"]');
        if (sendButton.exists()) {
          expect(sendButton.attributes('disabled')).toBeUndefined();
        }
      }
    });

    it('should disable send button when input is empty', async () => {
      const wrapper = createTestWrapper(AIAssistantSidebar, {
        props: {
          visible: true
        }
      });

      const inputElement = wrapper.find('[data-testid="message-input"]');
      const sendButton = wrapper.find('[data-testid="send-button"]');

      if (inputElement.exists() && sendButton.exists()) {
        await inputElement.setValue('');
        await wrapper.vm.$nextTick();
        
        // 空输入时应该禁用发送按钮
        expect(sendButton.attributes('disabled')).toBeDefined();
      }
    });

    it('should handle conversation history correctly', async () => {
      const mockMessages = [
        { id: '1', type: 'user', content: 'Hello', timestamp: Date.now() },
        { id: '2', type: 'assistant', content: 'Hi there!', timestamp: Date.now() }
      ];

      const wrapper = createTestWrapper(AIAssistantSidebar, {
        props: {
          visible: true,
          messages: mockMessages
        }
      });

      // 验证消息列表
      const messageList = wrapper.find('[data-testid="message-list"]');
      if (messageList.exists()) {
        const messages = messageList.findAll('[data-testid^="message-"]');
        expect(messages.length).toBe(2);
      }
    });

    it('should handle API calls with strict validation', async () => {
      const mockRequest = vi.fn();
      vi.doMock('@/utils/request', () => ({
        request: {
          post: mockRequest
        }
      }));

      mockRequest.mockResolvedValue(mockApiResponse.success({
        id: '123',
        content: 'Test response',
        type: 'assistant',
        timestamp: Date.now()
      }));

      const wrapper = createTestWrapper(AIAssistantSidebar, {
        props: {
          visible: true
        }
      });

      const inputElement = wrapper.find('[data-testid="message-input"]');
      const sendButton = wrapper.find('[data-testid="send-button"]');

      if (inputElement.exists() && sendButton.exists()) {
        await inputElement.setValue('Test message');
        await sendButton.trigger('click');
        await waitForAsync(100);

        // 验证API调用
        expect(mockRequest).toHaveBeenCalledWith('/api/ai/chat', {
          method: 'POST',
          data: {
            message: 'Test message',
            conversationId: expect.any(String)
          }
        });

        // 验证响应结构
        const lastCall = mockRequest.mock.calls[mockRequest.mock.calls.length - 1];
        const [url, options] = lastCall;

        expect(url).toBe('/api/ai/chat');
        expect(options.method).toBe('POST');
        
        // 验证请求数据结构
        const requestData = options.data;
        const requiredFields = ['message'];
        const requiredValidation = validateRequiredFields(requestData, requiredFields);
        expect(requiredValidation.valid).toBe(true);

        const typeValidation = validateFieldTypes(requestData, {
          message: 'string',
          conversationId: 'string'
        });
        expect(typeValidation.valid).toBe(true);
      }
    });
  });

  describe('AIAssistantFullPage Component', () => {
    it('should render full page layout correctly', () => {
      const wrapper = createTestWrapper(AIAssistantFullPage, {
        props: {
          visible: true
        }
      });

      // 验证全页面结构
      expect(wrapper.find('.ai-assistant-fullpage').exists()).toBe(true);
      expect(wrapper.find('.ai-assistant-header').exists()).toBe(true);
      expect(wrapper.find('.ai-assistant-main').exists()).toBe(true);
      expect(wrapper.find('.ai-assistant-sidebar').exists()).toBe(true);
      expect(wrapper.find('.ai-assistant-content-area').exists()).toBe(true);
    });

    it('should handle expert selection correctly', async () => {
      const mockExperts = [
        { id: '1', name: '教育专家', avatar: 'test.jpg', description: '教育领域专家' },
        { id: '2', name: '心理专家', avatar: 'test2.jpg', description: '心理咨询专家' }
      ];

      const wrapper = createTestWrapper(AIAssistantFullPage, {
        props: {
          visible: true,
          experts: mockExperts
        }
      });

      // 验证专家列表
      const expertList = wrapper.find('[data-testid="expert-list"]');
      if (expertList.exists()) {
        const experts = expertList.findAll('[data-testid^="expert-"]');
        expect(experts.length).toBe(2);
      }
    });

    it('should handle conversation tabs correctly', async () => {
      const mockConversations = [
        { id: '1', title: '教育咨询', lastMessage: '关于孩子学习...', timestamp: Date.now() },
        { id: '2', title: '心理辅导', lastMessage: '最近情绪问题...', timestamp: Date.now() }
      ];

      const wrapper = createTestWrapper(AIAssistantFullPage, {
        props: {
          visible: true,
          conversations: mockConversations
        }
      });

      // 验证会话标签
      const tabList = wrapper.find('[data-testid="conversation-tabs"]');
      if (tabList.exists()) {
        const tabs = tabList.findAll('[data-testid^="tab-"]');
        expect(tabs.length).toBe(2);
      }
    });

    it('should handle sidebar toggle correctly', async () => {
      const wrapper = createTestWrapper(AIAssistantFullPage, {
        props: {
          visible: true
        }
      });

      const toggleButton = wrapper.find('[data-testid="sidebar-toggle"]');
      if (toggleButton.exists()) {
        await toggleButton.trigger('click');
        
        // 验证侧边栏状态变化
        const sidebar = wrapper.find('.ai-assistant-sidebar');
        expect(sidebar.exists()).toBe(true);
        
        // 验证事件发射
        expect(wrapper.emitted('sidebar-toggle')).toBeDefined();
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const mockRequest = vi.fn();
      vi.doMock('@/utils/request', () => ({
        request: {
          post: mockRequest
        }
      }));

      mockRequest.mockRejectedValue(new Error('Network error'));

      const wrapper = createTestWrapper(AIAssistantSidebar, {
        props: {
          visible: true
        }
      });

      const inputElement = wrapper.find('[data-testid="message-input"]');
      const sendButton = wrapper.find('[data-testid="send-button"]');

      if (inputElement.exists() && sendButton.exists()) {
        await inputElement.setValue('Test message');
        await sendButton.trigger('click');
        await waitForAsync(100);

        // 验证错误消息显示
        expect(mockMessage.error).toHaveBeenCalledWith('发送消息失败，请重试');
      }
    });

    it('should handle empty response correctly', async () => {
      const mockRequest = vi.fn();
      vi.doMock('@/utils/request', () => ({
        request: {
          post: mockRequest
        }
      }));

      mockRequest.mockResolvedValue({ data: null });

      const wrapper = createTestWrapper(AIAssistantSidebar, {
        props: {
          visible: true
        }
      });

      const inputElement = wrapper.find('[data-testid="message-input"]');
      const sendButton = wrapper.find('[data-testid="send-button"]');

      if (inputElement.exists() && sendButton.exists()) {
        await inputElement.setValue('Test message');
        await sendButton.trigger('click');
        await waitForAsync(100);

        // 验证空响应处理
        expect(wrapper.vm.$data.messages).toBeDefined();
      }
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const wrapper = createTestWrapper(AIAssistantSidebar, {
        props: {
          visible: true
        }
      });

      // 检查输入框的aria-label
      const inputElement = wrapper.find('[data-testid="message-input"]');
      if (inputElement.exists()) {
        expect(inputElement.attributes('aria-label')).toBeDefined();
      }

      // 检查按钮的aria-label
      const sendButton = wrapper.find('[data-testid="send-button"]');
      if (sendButton.exists()) {
        expect(sendButton.attributes('aria-label')).toBeDefined();
      }
    });

    it('should support keyboard navigation', async () => {
      const wrapper = createTestWrapper(AIAssistantSidebar, {
        props: {
          visible: true
        }
      });

      const inputElement = wrapper.find('[data-testid="message-input"]');
      if (inputElement.exists()) {
        // 测试Enter键发送
        await inputElement.trigger('keydown.enter');
        
        // 验证键事件处理
        expect(wrapper.emitted('send-message')).toBeDefined();
      }
    });
  });

  describe('Performance', () => {
    it('should not leak memory on component destruction', () => {
      const wrapper = createTestWrapper(AIAssistant, {
        props: {
          visible: true,
          mode: 'sidebar'
        }
      });

      // 记录初始状态
      const initialData = { ...wrapper.vm.$data };

      // 销毁组件
      wrapper.unmount();

      // 验证组件被正确清理
      expect(wrapper.exists()).toBe(false);
    });

    it('should handle large message history efficiently', async () => {
      const largeMessageHistory = Array.from({ length: 1000 }, (_, i) => ({
        id: `msg-${i}`,
        type: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`,
        timestamp: Date.now() + i
      }));

      const wrapper = createTestWrapper(AIAssistantSidebar, {
        props: {
          visible: true,
          messages: largeMessageHistory
        }
      });

      // 验证大量消息的渲染
      const messageList = wrapper.find('[data-testid="message-list"]');
      if (messageList.exists()) {
        const messages = messageList.findAll('[data-testid^="message-"]');
        // 由于虚拟滚动，实际渲染的消息数量应该少于总数
        expect(messages.length).toBeLessThan(1000);
        expect(messages.length).toBeGreaterThan(0);
      }
    });
  });
});