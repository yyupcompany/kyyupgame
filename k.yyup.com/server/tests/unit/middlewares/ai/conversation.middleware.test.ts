import { 
  aiConversationMiddleware,
  IAiConversationMiddleware
} from '../../../src/middlewares/ai/conversation.middleware';
import { vi } from 'vitest'
import {
  aiConversationService,
  messageService,
  aiMemoryService
} from '../../../src/services/ai';
import { MessageRole } from '../../../src/models/ai-message.model';

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

describe('AiConversationMiddleware', () => {
  let middleware: IAiConversationMiddleware;

  beforeEach(() => {
    jest.clearAllMocks();
    middleware = aiConversationMiddleware;
  });

  describe('createConversation', () => {
    const userId = 1;
    const title = 'Test Conversation';
    const mockConversation = {
      id: 'conv-123',
      title: title,
      userId: userId,
      createdAt: new Date()
    };

    it('should create conversation successfully', async () => {
      (aiConversationService.createConversation as jest.Mock).mockResolvedValue(mockConversation);

      const result = await middleware.createConversation(userId, title);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockConversation);
      expect(aiConversationService.createConversation).toHaveBeenCalledWith(userId, title);
    });

    it('should create conversation without title', async () => {
      const conversationWithoutTitle = { ...mockConversation, title: null };
      (aiConversationService.createConversation as jest.Mock).mockResolvedValue(conversationWithoutTitle);

      const result = await middleware.createConversation(userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(conversationWithoutTitle);
      expect(aiConversationService.createConversation).toHaveBeenCalledWith(userId, undefined);
    });

    it('should handle service error', async () => {
      const error = new Error('Failed to create conversation');
      (aiConversationService.createConversation as jest.Mock).mockRejectedValue(error);

      const result = await middleware.createConversation(userId, title);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SERVICE_ERROR');
      expect(result.error?.message).toBe('服务操作失败');
    });
  });

  describe('getConversations', () => {
    const userId = 1;
    const mockConversations = [
      {
        id: 'conv-123',
        title: 'Conversation 1',
        userId: userId,
        isArchived: false,
        createdAt: new Date()
      },
      {
        id: 'conv-456',
        title: 'Conversation 2',
        userId: userId,
        isArchived: true,
        createdAt: new Date()
      }
    ];

    it('should return user conversations successfully', async () => {
      (aiConversationService.getRecentConversations as jest.Mock).mockResolvedValue(mockConversations);

      const result = await middleware.getConversations(userId, false);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockConversations);
      expect(aiConversationService.getRecentConversations).toHaveBeenCalledWith(userId, 20, false);
    });

    it('should include archived conversations when requested', async () => {
      (aiConversationService.getRecentConversations as jest.Mock).mockResolvedValue(mockConversations);

      const result = await middleware.getConversations(userId, true);

      expect(result.success).toBe(true);
      expect(aiConversationService.getRecentConversations).toHaveBeenCalledWith(userId, 20, true);
    });

    it('should handle default includeArchived parameter', async () => {
      (aiConversationService.getRecentConversations as jest.Mock).mockResolvedValue(mockConversations);

      await middleware.getConversations(userId);

      expect(aiConversationService.getRecentConversations).toHaveBeenCalledWith(userId, 20, false);
    });

    it('should handle empty conversation list', async () => {
      (aiConversationService.getRecentConversations as jest.Mock).mockResolvedValue([]);

      const result = await middleware.getConversations(userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe('getConversationDetails', () => {
    const userId = 1;
    const conversationId = 'conv-123';
    const mockConversation = {
      id: conversationId,
      title: 'Test Conversation',
      userId: userId,
      summary: 'This is a test conversation',
      createdAt: new Date()
    };
    const mockMessages = [
      {
        id: 'msg-123',
        conversationId: conversationId,
        role: MessageRole.USER,
        content: 'Hello',
        createdAt: new Date()
      },
      {
        id: 'msg-456',
        conversationId: conversationId,
        role: MessageRole.ASSISTANT,
        content: 'Hi there!',
        createdAt: new Date()
      }
    ];
    const mockMemories = [
      {
        id: 1,
        conversationId: conversationId,
        content: 'Important information',
        memoryType: 'short_term',
        createdAt: new Date()
      }
    ];

    it('should return conversation details successfully', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);
      (messageService.getConversationMessages as jest.Mock).mockResolvedValue({ messages: mockMessages });
      (aiMemoryService.getConversationMemories as jest.Mock).mockResolvedValue(mockMemories);

      const result = await middleware.getConversationDetails(userId, conversationId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(
        expect.objectContaining({
          ...mockConversation,
          messages: [],
          memories: mockMemories
        })
      );
      expect(aiConversationService.getConversation).toHaveBeenCalledWith(userId, conversationId);
      expect(messageService.getConversationMessages).toHaveBeenCalledWith(userId, conversationId, 50);
      expect(aiMemoryService.getConversationMemories).toHaveBeenCalledWith(userId, conversationId);
    });

    it('should handle conversation not found', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(null);

      const result = await middleware.getConversationDetails(userId, conversationId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_FOUND');
      expect(result.error?.message).toBe('会话不存在或无权访问');
    });

    it('should handle empty messages and memories', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);
      (messageService.getConversationMessages as jest.Mock).mockResolvedValue({ messages: [] });
      (aiMemoryService.getConversationMemories as jest.Mock).mockResolvedValue([]);

      const result = await middleware.getConversationDetails(userId, conversationId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(
        expect.objectContaining({
          ...mockConversation,
          messages: [],
          memories: []
        })
      );
    });
  });

  describe('updateConversation', () => {
    const userId = 1;
    const conversationId = 'conv-123';
    const mockConversation = {
      id: conversationId,
      title: 'Updated Conversation',
      userId: userId,
      createdAt: new Date()
    };

    it('should update conversation title successfully', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);
      (aiConversationService.updateConversationTitle as jest.Mock).mockResolvedValue(undefined);

      const result = await middleware.updateConversation(userId, conversationId, {
        title: 'Updated Conversation'
      });

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
      expect(aiConversationService.updateConversationTitle).toHaveBeenCalledWith(
        userId,
        conversationId,
        'Updated Conversation'
      );
    });

    it('should update conversation summary successfully', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);
      (aiConversationService.updateConversationSummary as jest.Mock).mockResolvedValue(undefined);

      const result = await middleware.updateConversation(userId, conversationId, {
        summary: 'Updated summary'
      });

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
      expect(aiConversationService.updateConversationSummary).toHaveBeenCalledWith(
        userId,
        conversationId,
        'Updated summary'
      );
    });

    it('should archive conversation successfully', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);
      (aiConversationService.archiveConversation as jest.Mock).mockResolvedValue(undefined);

      const result = await middleware.updateConversation(userId, conversationId, {
        isArchived: true
      });

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
      expect(aiConversationService.archiveConversation).toHaveBeenCalledWith(userId, conversationId);
    });

    it('should unarchive conversation successfully', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);
      (aiConversationService.unarchiveConversation as jest.Mock).mockResolvedValue(undefined);

      const result = await middleware.updateConversation(userId, conversationId, {
        isArchived: false
      });

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
      expect(aiConversationService.unarchiveConversation).toHaveBeenCalledWith(userId, conversationId);
    });

    it('should handle conversation not found', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(null);

      const result = await middleware.updateConversation(userId, conversationId, {
        title: 'Updated Title'
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_FOUND');
      expect(result.error?.message).toBe('会话不存在或无权访问');
    });

    it('should handle no valid update data', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);

      const result = await middleware.updateConversation(userId, conversationId, {});

      expect(result.success).toBe(true);
      expect(result.data).toBe(false);
    });
  });

  describe('deleteConversation', () => {
    const userId = 1;
    const conversationId = 'conv-123';
    const mockConversation = {
      id: conversationId,
      title: 'Test Conversation',
      userId: userId,
      createdAt: new Date()
    };

    it('should delete conversation successfully', async () => {
      (aiConversationService.deleteConversation as jest.Mock).mockResolvedValue(undefined);

      const result = await middleware.deleteConversation(userId, conversationId);

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
      expect(aiConversationService.deleteConversation).toHaveBeenCalledWith(userId, conversationId);
    });

    it('should handle conversation not found', async () => {
      (aiConversationService.deleteConversation as jest.Mock).mockResolvedValue(undefined);

      const result = await middleware.deleteConversation(userId, conversationId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_FOUND');
      expect(result.error?.message).toBe('会话不存在或无权访问');
    });

    it('should handle service error', async () => {
      const error = new Error('Failed to delete conversation');
      (aiConversationService.deleteConversation as jest.Mock).mockRejectedValue(error);

      const result = await middleware.deleteConversation(userId, conversationId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SERVICE_ERROR');
    });
  });

  describe('sendMessage', () => {
    const userId = 1;
    const conversationId = 'conv-123';
    const content = 'Hello, AI!';
    const mockConversation = {
      id: conversationId,
      title: 'Test Conversation',
      userId: userId,
      createdAt: new Date()
    };
    const mockAiMessage = {
      id: 'msg-456',
      conversationId: conversationId,
      role: MessageRole.ASSISTANT,
      content: 'Hello! How can I help you today?',
      createdAt: new Date()
    };

    it('should send message successfully', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);
      (messageService.sendMessage as jest.Mock).mockResolvedValue(mockAiMessage);
      (aiMemoryService.createMemory as jest.Mock).mockResolvedValue({ id: 1 });

      const result = await middleware.sendMessage(userId, conversationId, content);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        aiMessage: mockAiMessage
      });
      expect(messageService.sendMessage).toHaveBeenCalledWith({
        conversationId,
        userId,
        content,
        metadata: {}
      });
    });

    it('should handle conversation not found', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(null);

      const result = await middleware.sendMessage(userId, conversationId, content);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_FOUND');
      expect(result.error?.message).toBe('会话不存在或无权访问');
    });

    it('should create memory for important content', async () => {
      const longContent = 'This is a very important message that should be remembered for future reference.';
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);
      (messageService.sendMessage as jest.Mock).mockResolvedValue(mockAiMessage);
      (aiMemoryService.createMemory as jest.Mock).mockResolvedValue({ id: 1 });

      const result = await middleware.sendMessage(userId, conversationId, longContent);

      expect(result.success).toBe(true);
      expect(aiMemoryService.createMemory).toHaveBeenCalledWith({
        userId,
        conversationId,
        content: 'This is a very important message that should be...',
        memoryType: 'short_term'
      });
    });

    it('should skip memory creation for short content', async () => {
      const shortContent = 'Hi';
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);
      (messageService.sendMessage as jest.Mock).mockResolvedValue(mockAiMessage);

      const result = await middleware.sendMessage(userId, conversationId, shortContent);

      expect(result.success).toBe(true);
      expect(aiMemoryService.createMemory).not.toHaveBeenCalled();
    });
  });

  describe('getMessages', () => {
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
        createdAt: new Date()
      },
      {
        id: 'msg-456',
        conversationId: conversationId,
        role: MessageRole.ASSISTANT,
        content: 'Hi there!',
        createdAt: new Date()
      }
    ];

    it('should return messages successfully', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);
      (messageService.getMessages as jest.Mock).mockResolvedValue({ messages: mockMessages });

      const result = await middleware.getMessages(userId, conversationId, 50);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(messageService.getMessages).toHaveBeenCalledWith(conversationId, userId, 1, 50);
    });

    it('should handle default limit parameter', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);
      (messageService.getMessages as jest.Mock).mockResolvedValue({ messages: mockMessages });

      await middleware.getMessages(userId, conversationId);

      expect(messageService.getMessages).toHaveBeenCalledWith(conversationId, userId, 1, 50);
    });

    it('should handle conversation not found', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(null);

      const result = await middleware.getMessages(userId, conversationId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_FOUND');
      expect(result.error?.message).toBe('会话不存在或无权访问');
    });

    it('should handle empty message list', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);
      (messageService.getMessages as jest.Mock).mockResolvedValue({ messages: [] });

      const result = await middleware.getMessages(userId, conversationId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe('createMemory', () => {
    const userId = 1;
    const conversationId = 'conv-123';
    const content = 'Important information to remember';
    const mockConversation = {
      id: conversationId,
      title: 'Test Conversation',
      userId: userId,
      createdAt: new Date()
    };
    const mockMemory = {
      id: 1,
      userId: userId,
      conversationId: conversationId,
      content: content,
      memoryType: 'immediate',
      importance: 0.5,
      createdAt: new Date()
    };

    it('should create memory successfully', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);
      (aiMemoryService.createMemory as jest.Mock).mockResolvedValue(mockMemory);

      const result = await middleware.createMemory(userId, conversationId, content);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockMemory);
      expect(aiMemoryService.createMemory).toHaveBeenCalledWith({
        userId,
        conversationId,
        content,
        memoryType: 'immediate',
        importance: 0.5,
        expiresAt: null
      });
    });

    it('should create memory with custom type', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);
      (aiMemoryService.createMemory as jest.Mock).mockResolvedValue(mockMemory);

      const result = await middleware.createMemory(userId, conversationId, content, 'long_term');

      expect(result.success).toBe(true);
      expect(aiMemoryService.createMemory).toHaveBeenCalledWith({
        userId,
        conversationId,
        content,
        memoryType: 'long_term',
        importance: 0.5,
        expiresAt: null
      });
    });

    it('should handle conversation not found', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(null);

      const result = await middleware.createMemory(userId, conversationId, content);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_FOUND');
      expect(result.error?.message).toBe('会话不存在或无权访问');
    });

    it('should validate memory type', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);

      const result = await middleware.createMemory(userId, conversationId, content, 'invalid_type');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_FAILED');
      expect(result.error?.message).toBe('无效的记忆类型: invalid_type');
    });
  });

  describe('getMemories', () => {
    const userId = 1;
    const conversationId = 'conv-123';
    const mockConversation = {
      id: conversationId,
      title: 'Test Conversation',
      userId: userId,
      createdAt: new Date()
    };
    const mockMemories = [
      {
        id: 1,
        conversationId: conversationId,
        content: 'Memory 1',
        memoryType: 'short_term',
        importance: 0.5,
        createdAt: new Date()
      },
      {
        id: 2,
        conversationId: conversationId,
        content: 'Memory 2',
        memoryType: 'long_term',
        importance: 0.8,
        createdAt: new Date()
      }
    ];

    it('should return memories successfully', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);
      (aiMemoryService.getConversationMemories as jest.Mock).mockResolvedValue(mockMemories);

      const result = await middleware.getMemories(userId, conversationId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([
        {
          id: 1,
          content: 'Memory 1',
          importance: 0.5,
          memoryType: 'short_term',
          createdAt: mockMemories[0].createdAt,
          expiresAt: null
        },
        {
          id: 2,
          content: 'Memory 2',
          importance: 0.8,
          memoryType: 'long_term',
          createdAt: mockMemories[1].createdAt,
          expiresAt: null
        }
      ]);
    });

    it('should handle conversation not found', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(null);

      const result = await middleware.getMemories(userId, conversationId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_FOUND');
      expect(result.error?.message).toBe('会话不存在或无权访问');
    });

    it('should handle empty memory list', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);
      (aiMemoryService.getConversationMemories as jest.Mock).mockResolvedValue([]);

      const result = await middleware.getMemories(userId, conversationId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors consistently', async () => {
      const error = new Error('Service unavailable');
      (aiConversationService.createConversation as jest.Mock).mockRejectedValue(error);

      const result = await middleware.createConversation(1, 'Test');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SERVICE_ERROR');
      expect(result.error?.message).toBe('服务操作失败');
    });

    it('should handle network errors', async () => {
      const error = new Error('Network error');
      (messageService.sendMessage as jest.Mock).mockRejectedValue(error);

      const result = await middleware.sendMessage(1, 'conv-123', 'Hello');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SERVICE_ERROR');
    });

    it('should handle validation errors from services', async () => {
      const error = new Error('Invalid parameters');
      (aiMemoryService.createMemory as jest.Mock).mockRejectedValue(error);

      const result = await middleware.createMemory(1, 'conv-123', 'Test');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SERVICE_ERROR');
    });
  });
});