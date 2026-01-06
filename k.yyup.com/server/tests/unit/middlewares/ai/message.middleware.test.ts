import { 
  aiMessageMiddleware,
  IAiMessageMiddleware
} from '../../../src/middlewares/ai/message.middleware';
import { vi } from 'vitest'
import {
  messageService as aiMessageService,
  aiConversationService
} from '../../../src/services/ai';
import { MessageType, MessageStatus, MessageRole } from '../../../src/models/ai-message.model';

// Mock dependencies
jest.mock('../../../src/services/ai');


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

describe('AiMessageMiddleware', () => {
  let middleware: IAiMessageMiddleware;

  beforeEach(() => {
    jest.clearAllMocks();
    middleware = aiMessageMiddleware;
  });

  describe('createMessage', () => {
    const userId = 1;
    const conversationId = 'conv-123';
    const content = 'Hello, AI!';
    const mockConversation = {
      id: conversationId,
      title: 'Test Conversation',
      userId: userId,
      createdAt: new Date()
    };
    const mockMessage = {
      id: 'msg-123',
      conversationId: conversationId,
      role: MessageRole.USER,
      content: content,
      messageType: MessageType.TEXT,
      createdAt: new Date()
    };

    it('should create message successfully', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);
      (aiMessageService.createMessage as jest.Mock).mockResolvedValue(mockMessage);

      const result = await middleware.createMessage({
        userId,
        conversationId,
        role: MessageRole.USER,
        content
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockMessage);
      expect(aiConversationService.getConversation).toHaveBeenCalledWith(userId, conversationId);
      expect(aiMessageService.createMessage).toHaveBeenCalledWith({
        conversationId,
        userId,
        role: MessageRole.USER,
        content
      });
    });

    it('should create message with custom parameters', async () => {
      const customMessage = {
        ...mockMessage,
        messageType: MessageType.IMAGE,
        mediaUrl: 'https://example.com/image.jpg',
        metadata: { custom: 'data' }
      };
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);
      (aiMessageService.createMessage as jest.Mock).mockResolvedValue(customMessage);

      const result = await middleware.createMessage({
        userId,
        conversationId,
        role: MessageRole.USER,
        content,
        messageType: MessageType.IMAGE,
        mediaUrl: 'https://example.com/image.jpg',
        metadata: { custom: 'data' }
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(customMessage);
      expect(aiMessageService.createMessage).toHaveBeenCalledWith({
        conversationId,
        userId,
        role: MessageRole.USER,
        content
      });
    });

    it('should validate conversation existence', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(null);

      const result = await middleware.createMessage({
        userId,
        conversationId,
        role: MessageRole.USER,
        content
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_FOUND');
      expect(result.error?.message).toBe('会话不存在或无权访问');
    });

    it('should validate conversation ID', async () => {
      const result = await middleware.createMessage({
        userId,
        conversationId: '',
        role: MessageRole.USER,
        content
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_FAILED');
      expect(result.error?.message).toBe('会话ID不能为空');
    });

    it('should validate content and media URL', async () => {
      const result = await middleware.createMessage({
        userId,
        conversationId,
        role: MessageRole.USER,
        content: '',
        mediaUrl: ''
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_FAILED');
      expect(result.error?.message).toBe('消息内容和媒体URL不能同时为空');
    });

    it('should handle service error', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);
      (aiMessageService.createMessage as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await middleware.createMessage({
        userId,
        conversationId,
        role: MessageRole.USER,
        content
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SERVICE_ERROR');
    });
  });

  describe('getConversationMessages', () => {
    const userId = 1;
    const conversationId = 'conv-123';
    const mockConversation = {
      id: conversationId,
      title: 'Test Conversation',
      userId: userId,
      createdAt: new Date()
    };
    const mockMessages = [
      {
        id: 'msg-123',
        conversationId: conversationId,
        role: MessageRole.USER,
        content: 'Hello',
        messageType: MessageType.TEXT,
        createdAt: new Date()
      },
      {
        id: 'msg-456',
        conversationId: conversationId,
        role: MessageRole.ASSISTANT,
        content: 'Hi there!',
        messageType: MessageType.TEXT,
        createdAt: new Date()
      }
    ];

    it('should return conversation messages successfully', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);
      (aiMessageService.getMessages as jest.Mock).mockResolvedValue({ messages: mockMessages });

      const result = await middleware.getConversationMessages(userId, conversationId, 50, 0);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockMessages);
      expect(aiConversationService.getConversation).toHaveBeenCalledWith(userId, conversationId);
      expect(aiMessageService.getMessages).toHaveBeenCalledWith(conversationId, userId, 1, 50);
    });

    it('should handle default parameters', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);
      (aiMessageService.getMessages as jest.Mock).mockResolvedValue({ messages: mockMessages });

      await middleware.getConversationMessages(userId, conversationId);

      expect(aiMessageService.getMessages).toHaveBeenCalledWith(conversationId, userId, 1, 50);
    });

    it('should handle conversation not found', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(null);

      const result = await middleware.getConversationMessages(userId, conversationId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_FOUND');
      expect(result.error?.message).toBe('会话不存在或无权访问');
    });

    it('should handle empty message list', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);
      (aiMessageService.getMessages as jest.Mock).mockResolvedValue({ messages: [] });

      const result = await middleware.getConversationMessages(userId, conversationId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should calculate correct page from offset', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);
      (aiMessageService.getMessages as jest.Mock).mockResolvedValue({ messages: mockMessages });

      await middleware.getConversationMessages(userId, conversationId, 20, 40);

      expect(aiMessageService.getMessages).toHaveBeenCalledWith(conversationId, userId, 3, 20);
    });
  });

  describe('getMessage', () => {
    const userId = 1;
    const messageId = 'msg-123';
    const mockMessage = {
      id: messageId,
      conversationId: 'conv-123',
      role: MessageRole.USER,
      content: 'Hello',
      messageType: MessageType.TEXT,
      status: MessageStatus.DELIVERED,
      metadata: { custom: 'data' },
      createdAt: new Date()
    };

    it('should return message details successfully', async () => {
      (aiMessageService.getMessage as jest.Mock).mockResolvedValue(mockMessage);

      const result = await middleware.getMessage(userId, messageId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockMessage);
      expect(aiMessageService.getMessage).toHaveBeenCalledWith(userId, messageId);
    });

    it('should handle message not found', async () => {
      (aiMessageService.getMessage as jest.Mock).mockResolvedValue(null);

      const result = await middleware.getMessage(userId, messageId);

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should handle service error', async () => {
      (aiMessageService.getMessage as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await middleware.getMessage(userId, messageId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SERVICE_ERROR');
    });
  });

  describe('updateMessageStatus', () => {
    const userId = 1;
    const messageId = 'msg-123';
    const mockMessage = {
      id: messageId,
      conversationId: 'conv-123',
      role: MessageRole.USER,
      content: 'Hello',
      messageType: MessageType.TEXT,
      status: MessageStatus.SENDING,
      createdAt: new Date()
    };

    it('should update message status successfully', async () => {
      (aiMessageService.getMessage as jest.Mock).mockResolvedValue(mockMessage);
      (aiMessageService.updateMessageStatus as jest.Mock).mockResolvedValue(undefined);

      const result = await middleware.updateMessageStatus(userId, messageId, MessageStatus.DELIVERED);

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
      expect(aiMessageService.getMessage).toHaveBeenCalledWith(userId, messageId);
      expect(aiMessageService.updateMessageStatus).toHaveBeenCalledWith(userId, messageId, MessageStatus.DELIVERED);
    });

    it('should handle message not found', async () => {
      (aiMessageService.getMessage as jest.Mock).mockResolvedValue(null);

      const result = await middleware.updateMessageStatus(userId, messageId, MessageStatus.DELIVERED);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_FOUND');
      expect(result.error?.message).toBe('消息不存在或无权访问');
    });

    it('should handle service error', async () => {
      (aiMessageService.getMessage as jest.Mock).mockResolvedValue(mockMessage);
      (aiMessageService.updateMessageStatus as jest.Mock).mockRejectedValue(new Error('Update failed'));

      const result = await middleware.updateMessageStatus(userId, messageId, MessageStatus.DELIVERED);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SERVICE_ERROR');
    });
  });

  describe('deleteMessage', () => {
    const userId = 1;
    const messageId = 'msg-123';
    const mockMessage = {
      id: messageId,
      conversationId: 'conv-123',
      role: MessageRole.USER,
      content: 'Hello',
      messageType: MessageType.TEXT,
      status: MessageStatus.DELIVERED,
      createdAt: new Date()
    };

    it('should return service unavailable error', async () => {
      (aiMessageService.getMessage as jest.Mock).mockResolvedValue(mockMessage);

      const result = await middleware.deleteMessage(userId, messageId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SERVICE_UNAVAILABLE');
      expect(result.error?.message).toBe('删除消息功能暂不可用');
    });

    it('should handle message not found', async () => {
      (aiMessageService.getMessage as jest.Mock).mockResolvedValue(null);

      const result = await middleware.deleteMessage(userId, messageId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_FOUND');
      expect(result.error?.message).toBe('消息不存在或无权访问');
    });
  });

  describe('generateAIResponse', () => {
    const userId = 1;
    const conversationId = 'conv-123';
    const prompt = 'Hello, AI!';
    const mockConversation = {
      id: conversationId,
      title: 'Test Conversation',
      userId: userId,
      createdAt: new Date()
    };
    const mockUserMessage = {
      id: 'msg-123',
      conversationId: conversationId,
      role: MessageRole.USER,
      content: prompt,
      messageType: MessageType.TEXT,
      createdAt: new Date()
    };
    const mockAIMessage = {
      id: 'msg-456',
      conversationId: conversationId,
      role: MessageRole.ASSISTANT,
      content: 'Hello! How can I help you today?',
      messageType: MessageType.TEXT,
      createdAt: new Date()
    };

    it('should generate AI response successfully', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);
      (aiMessageService.createMessage as jest.Mock)
        .mockResolvedValueOnce(mockUserMessage)
        .mockResolvedValueOnce(mockAIMessage);

      const result = await middleware.generateAIResponse(userId, conversationId, prompt);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAIMessage);
      expect(aiConversationService.getConversation).toHaveBeenCalledWith(userId, conversationId);
      expect(aiMessageService.createMessage).toHaveBeenCalledTimes(2);
    });

    it('should handle conversation not found', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(null);

      const result = await middleware.generateAIResponse(userId, conversationId, prompt);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_FOUND');
      expect(result.error?.message).toBe('会话不存在或无权访问');
    });

    it('should handle user message creation failure', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);
      (aiMessageService.createMessage as jest.Mock).mockRejectedValue(new Error('Failed to create message'));

      const result = await middleware.generateAIResponse(userId, conversationId, prompt);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SERVICE_ERROR');
    });

    it('should handle AI message creation failure', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);
      (aiMessageService.createMessage as jest.Mock)
        .mockResolvedValueOnce(mockUserMessage)
        .mockRejectedValueOnce(new Error('Failed to create AI message'));

      const result = await middleware.generateAIResponse(userId, conversationId, prompt);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SERVICE_ERROR');
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors consistently', async () => {
      const error = new Error('Service unavailable');
      (aiMessageService.createMessage as jest.Mock).mockRejectedValue(error);

      const result = await middleware.createMessage({
        userId: 1,
        conversationId: 'conv-123',
        role: MessageRole.USER,
        content: 'Test'
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SERVICE_ERROR');
      expect(result.error?.message).toBe('服务操作失败');
    });

    it('should handle network errors', async () => {
      const error = new Error('Network error');
      (aiMessageService.getMessages as jest.Mock).mockRejectedValue(error);

      const result = await middleware.getConversationMessages(1, 'conv-123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SERVICE_ERROR');
    });

    it('should handle validation errors from services', async () => {
      const error = new Error('Invalid parameters');
      (aiMessageService.getMessage as jest.Mock).mockRejectedValue(error);

      const result = await middleware.getMessage(1, 'msg-123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SERVICE_ERROR');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long messages', async () => {
      const longContent = 'x'.repeat(10000);
      const mockConversation = { id: 'conv-123' };
      const mockMessage = {
        id: 'msg-123',
        conversationId: 'conv-123',
        role: MessageRole.USER,
        content: longContent,
        messageType: MessageType.TEXT,
        createdAt: new Date()
      };

      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);
      (aiMessageService.createMessage as jest.Mock).mockResolvedValue(mockMessage);

      const result = await middleware.createMessage({
        userId: 1,
        conversationId: 'conv-123',
        role: MessageRole.USER,
        content: longContent
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockMessage);
    });

    it('should handle special characters in messages', async () => {
      const specialContent = 'Content with 中文 and ñ and é and 🎉';
      const mockConversation = { id: 'conv-123' };
      const mockMessage = {
        id: 'msg-123',
        conversationId: 'conv-123',
        role: MessageRole.USER,
        content: specialContent,
        messageType: MessageType.TEXT,
        createdAt: new Date()
      };

      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);
      (aiMessageService.createMessage as jest.Mock).mockResolvedValue(mockMessage);

      const result = await middleware.createMessage({
        userId: 1,
        conversationId: 'conv-123',
        role: MessageRole.USER,
        content: specialContent
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockMessage);
    });

    it('should handle different message roles', async () => {
      const mockConversation = { id: 'conv-123' };
      const mockMessage = {
        id: 'msg-123',
        conversationId: 'conv-123',
        role: MessageRole.SYSTEM,
        content: 'System message',
        messageType: MessageType.TEXT,
        createdAt: new Date()
      };

      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);
      (aiMessageService.createMessage as jest.Mock).mockResolvedValue(mockMessage);

      const result = await middleware.createMessage({
        userId: 1,
        conversationId: 'conv-123',
        role: MessageRole.SYSTEM,
        content: 'System message'
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockMessage);
    });

    it('should handle large offset values', async () => {
      const mockConversation = { id: 'conv-123' };
      const mockMessages = [
        {
          id: 'msg-123',
          conversationId: 'conv-123',
          role: MessageRole.USER,
          content: 'Hello',
          messageType: MessageType.TEXT,
          createdAt: new Date()
        }
      ];

      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);
      (aiMessageService.getMessages as jest.Mock).mockResolvedValue({ messages: mockMessages });

      const result = await middleware.getConversationMessages(1, 'conv-123', 20, 1000);

      expect(result.success).toBe(true);
      expect(aiMessageService.getMessages).toHaveBeenCalledWith('conv-123', 1, 51, 20);
    });
  });
});