import { 
  aiMemoryMiddleware,
  IAiMemoryMiddleware
} from '../../../src/middlewares/ai/memory.middleware';
import { vi } from 'vitest'
import {
  aiMemoryService,
  aiConversationService
} from '../../../src/services/ai';
import { MemoryType } from '../../../src/models/ai-memory.model';

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

describe('AiMemoryMiddleware', () => {
  let middleware: IAiMemoryMiddleware;

  beforeEach(() => {
    jest.clearAllMocks();
    middleware = aiMemoryMiddleware;
  });

  describe('createMemory', () => {
    const userId = 1;
    const conversationId = 'conv-123';
    const content = 'Important information to remember';
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
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue({ id: conversationId });
      (aiMemoryService.createMemory as jest.Mock).mockResolvedValue(mockMemory);

      const result = await middleware.createMemory({
        userId,
        conversationId,
        content
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockMemory);
      expect(aiConversationService.getConversation).toHaveBeenCalledWith(userId, conversationId);
      expect(aiMemoryService.createMemory).toHaveBeenCalledWith({
        userId,
        conversationId,
        content,
        memoryType: 'immediate',
        importance: 0.5,
        expiresAt: null
      });
    });

    it('should create memory with custom parameters', async () => {
      const customMemory = {
        ...mockMemory,
        memoryType: 'long_term',
        importance: 0.8,
        expiresAt: new Date('2024-12-31')
      };
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue({ id: conversationId });
      (aiMemoryService.createMemory as jest.Mock).mockResolvedValue(customMemory);

      const result = await middleware.createMemory({
        userId,
        conversationId,
        content,
        memoryType: 'long_term',
        importance: 0.8,
        expiresAt: new Date('2024-12-31')
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(customMemory);
      expect(aiMemoryService.createMemory).toHaveBeenCalledWith({
        userId,
        conversationId,
        content,
        memoryType: 'long_term',
        importance: 0.8,
        expiresAt: new Date('2024-12-31')
      });
    });

    it('should validate conversation existence', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(null);

      const result = await middleware.createMemory({
        userId,
        conversationId,
        content
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_FOUND');
      expect(result.error?.message).toBe('会话不存在或无权访问');
    });

    it('should validate conversation ID', async () => {
      const result = await middleware.createMemory({
        userId,
        conversationId: '',
        content
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_FAILED');
      expect(result.error?.message).toBe('会话ID不能为空');
    });

    it('should validate content', async () => {
      const result = await middleware.createMemory({
        userId,
        conversationId,
        content: ''
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_FAILED');
      expect(result.error?.message).toBe('记忆内容不能为空');
    });

    it('should validate memory type', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue({ id: conversationId });

      const result = await middleware.createMemory({
        userId,
        conversationId,
        content,
        memoryType: 'invalid_type'
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_FAILED');
      expect(result.error?.message).toBe('无效的记忆类型: invalid_type');
    });

    it('should handle service error', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue({ id: conversationId });
      (aiMemoryService.createMemory as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await middleware.createMemory({
        userId,
        conversationId,
        content
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SERVICE_ERROR');
    });
  });

  describe('getUserMemories', () => {
    const userId = 1;
    const mockMemories = [
      {
        id: 1,
        conversationId: 'conv-123',
        content: 'Memory 1',
        importance: 0.5,
        memoryType: 'short_term',
        createdAt: new Date(),
        expiresAt: null
      },
      {
        id: 2,
        conversationId: 'conv-456',
        content: 'Memory 2',
        importance: 0.8,
        memoryType: 'long_term',
        createdAt: new Date(),
        expiresAt: null
      }
    ];

    it('should return user memories successfully', async () => {
      (aiMemoryService.searchMemories as jest.Mock).mockResolvedValue(mockMemories);

      const result = await middleware.getUserMemories(userId, 'short_term', 20, 0);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockMemories);
      expect(aiMemoryService.searchMemories).toHaveBeenCalledWith(userId, {
        memoryType: 'short_term',
        limit: 20,
        offset: 0
      });
    });

    it('should handle default parameters', async () => {
      (aiMemoryService.searchMemories as jest.Mock).mockResolvedValue(mockMemories);

      await middleware.getUserMemories(userId);

      expect(aiMemoryService.searchMemories).toHaveBeenCalledWith(userId, {
        memoryType: undefined,
        limit: 20,
        offset: 0
      });
    });

    it('should handle empty memory list', async () => {
      (aiMemoryService.searchMemories as jest.Mock).mockResolvedValue([]);

      const result = await middleware.getUserMemories(userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should validate memory type', async () => {
      const result = await middleware.getUserMemories(userId, 'invalid_type');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_FAILED');
      expect(result.error?.message).toBe('无效的记忆类型: invalid_type');
    });
  });

  describe('getConversationMemories', () => {
    const userId = 1;
    const conversationId = 'conv-123';
    const mockConversation = { id: conversationId };
    const mockMemories = [
      {
        id: 1,
        content: 'Memory 1',
        importance: 0.5,
        memoryType: 'short_term',
        createdAt: new Date(),
        expiresAt: null
      },
      {
        id: 2,
        content: 'Memory 2',
        importance: 0.8,
        memoryType: 'long_term',
        createdAt: new Date(),
        expiresAt: null
      }
    ];

    it('should return conversation memories successfully', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);
      (aiMemoryService.getConversationMemories as jest.Mock).mockResolvedValue(mockMemories);

      const result = await middleware.getConversationMemories(userId, conversationId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockMemories);
      expect(aiConversationService.getConversation).toHaveBeenCalledWith(userId, conversationId);
      expect(aiMemoryService.getConversationMemories).toHaveBeenCalledWith(userId, conversationId);
    });

    it('should handle conversation not found', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(null);

      const result = await middleware.getConversationMemories(userId, conversationId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_FOUND');
      expect(result.error?.message).toBe('会话不存在或无权访问');
    });

    it('should handle empty memory list', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);
      (aiMemoryService.getConversationMemories as jest.Mock).mockResolvedValue([]);

      const result = await middleware.getConversationMemories(userId, conversationId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe('deleteMemory', () => {
    const userId = 1;
    const memoryId = 1;

    it('should delete memory successfully', async () => {
      (aiMemoryService.deleteMemory as jest.Mock).mockResolvedValue(undefined);

      const result = await middleware.deleteMemory(userId, memoryId);

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
      expect(aiMemoryService.deleteMemory).toHaveBeenCalledWith(memoryId);
    });

    it('should handle memory not found', async () => {
      (aiMemoryService.deleteMemory as jest.Mock).mockResolvedValue(undefined);

      const result = await middleware.deleteMemory(userId, memoryId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_FOUND');
      expect(result.error?.message).toBe('记忆不存在或无权删除');
    });

    it('should handle service error', async () => {
      (aiMemoryService.deleteMemory as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await middleware.deleteMemory(userId, memoryId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SERVICE_ERROR');
    });
  });

  describe('cleanupExpiredMemories', () => {
    const mockResult = { count: 5 };

    it('should cleanup expired memories successfully', async () => {
      (aiMemoryService.cleanupExpiredMemories as jest.Mock).mockResolvedValue(mockResult);

      const result = await middleware.cleanupExpiredMemories();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(aiMemoryService.cleanupExpiredMemories).toHaveBeenCalled();
    });

    it('should handle no expired memories', async () => {
      (aiMemoryService.cleanupExpiredMemories as jest.Mock).mockResolvedValue({ count: 0 });

      const result = await middleware.cleanupExpiredMemories();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ count: 0 });
    });

    it('should handle service error', async () => {
      (aiMemoryService.cleanupExpiredMemories as jest.Mock).mockRejectedValue(new Error('Cleanup failed'));

      const result = await middleware.cleanupExpiredMemories();

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SERVICE_ERROR');
    });
  });

  describe('summarizeConversation', () => {
    const userId = 1;
    const conversationId = 'conv-123';
    const mockConversation = {
      id: conversationId,
      summary: 'This is a conversation summary'
    };
    const mockMemory = {
      id: 1,
      content: 'This is a conversation summary',
      memoryType: 'long_term',
      importance: 0.8,
      createdAt: new Date()
    };

    it('should summarize conversation and create memory successfully', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);
      (aiMemoryService.createMemory as jest.Mock).mockResolvedValue(mockMemory);

      const result = await middleware.summarizeConversation(userId, conversationId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        summary: 'This is a conversation summary',
        memoryId: 1
      });
      expect(aiConversationService.getConversation).toHaveBeenCalledWith(userId, conversationId);
      expect(aiMemoryService.createMemory).toHaveBeenCalledWith({
        userId,
        conversationId,
        content: 'This is a conversation summary',
        memoryType: 'long_term',
        importance: 0.8,
        expiresAt: null
      });
    });

    it('should handle conversation without summary', async () => {
      const conversationWithoutSummary = { ...mockConversation, summary: null };
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(conversationWithoutSummary);

      const result = await middleware.summarizeConversation(userId, conversationId);

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
      expect(aiMemoryService.createMemory).not.toHaveBeenCalled();
    });

    it('should handle conversation not found', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(null);

      const result = await middleware.summarizeConversation(userId, conversationId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_FOUND');
      expect(result.error?.message).toBe('会话不存在或无权访问');
    });
  });

  describe('createMemoryWithEmbedding', () => {
    const userId = 1;
    const conversationId = 'conv-123';
    const content = 'Important information with embedding';
    const mockConversation = { id: conversationId };
    const mockMemory = {
      id: 1,
      content: content,
      memoryType: 'immediate',
      importance: 0.5,
      createdAt: new Date()
    };

    it('should create memory with embedding successfully', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);
      (aiMemoryService.createMemoryWithEmbedding as jest.Mock).mockResolvedValue(mockMemory);

      const result = await middleware.createMemoryWithEmbedding({
        userId,
        conversationId,
        content
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockMemory);
      expect(aiMemoryService.createMemoryWithEmbedding).toHaveBeenCalledWith({
        userId,
        conversationId,
        content,
        memoryType: 'immediate',
        importance: 0.5,
        expiresAt: null
      });
    });

    it('should validate parameters', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);

      const result = await middleware.createMemoryWithEmbedding({
        userId,
        conversationId: '',
        content
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_FAILED');
      expect(result.error?.message).toBe('会话ID不能为空');
    });

    it('should handle service error', async () => {
      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);
      (aiMemoryService.createMemoryWithEmbedding as jest.Mock).mockRejectedValue(new Error('Embedding service error'));

      const result = await middleware.createMemoryWithEmbedding({
        userId,
        conversationId,
        content
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SERVICE_ERROR');
    });
  });

  describe('findSimilarMemories', () => {
    const userId = 1;
    const query = 'Find similar memories';
    const mockSimilarMemories = [
      {
        id: 1,
        content: 'Similar memory 1',
        similarity: 0.85,
        importance: 0.7,
        memoryType: 'short_term',
        createdAt: new Date()
      },
      {
        id: 2,
        content: 'Similar memory 2',
        similarity: 0.75,
        importance: 0.6,
        memoryType: 'long_term',
        createdAt: new Date()
      }
    ];

    it('should find similar memories successfully', async () => {
      (aiMemoryService.findSimilarMemories as jest.Mock).mockResolvedValue(mockSimilarMemories);

      const result = await middleware.findSimilarMemories(userId, query, 5, 0.7);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSimilarMemories);
      expect(aiMemoryService.findSimilarMemories).toHaveBeenCalledWith(query, userId, 5, 0.7);
    });

    it('should handle default parameters', async () => {
      (aiMemoryService.findSimilarMemories as jest.Mock).mockResolvedValue(mockSimilarMemories);

      await middleware.findSimilarMemories(userId, query);

      expect(aiMemoryService.findSimilarMemories).toHaveBeenCalledWith(query, userId, 5, 0.7);
    });

    it('should validate query text', async () => {
      const result = await middleware.findSimilarMemories(userId, '');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_FAILED');
      expect(result.error?.message).toBe('查询文本不能为空');
    });

    it('should handle empty result', async () => {
      (aiMemoryService.findSimilarMemories as jest.Mock).mockResolvedValue([]);

      const result = await middleware.findSimilarMemories(userId, query);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should handle service error', async () => {
      (aiMemoryService.findSimilarMemories as jest.Mock).mockRejectedValue(new Error('Search service error'));

      const result = await middleware.findSimilarMemories(userId, query);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SERVICE_ERROR');
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors consistently', async () => {
      const error = new Error('Service unavailable');
      (aiMemoryService.createMemory as jest.Mock).mockRejectedValue(error);

      const result = await middleware.createMemory({
        userId: 1,
        conversationId: 'conv-123',
        content: 'Test'
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SERVICE_ERROR');
      expect(result.error?.message).toBe('服务操作失败');
    });

    it('should handle network errors', async () => {
      const error = new Error('Network error');
      (aiMemoryService.searchMemories as jest.Mock).mockRejectedValue(error);

      const result = await middleware.getUserMemories(1);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SERVICE_ERROR');
    });

    it('should handle validation errors from services', async () => {
      const error = new Error('Invalid parameters');
      (aiMemoryService.deleteMemory as jest.Mock).mockRejectedValue(error);

      const result = await middleware.deleteMemory(1, 1);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SERVICE_ERROR');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long content', async () => {
      const longContent = 'x'.repeat(10000);
      const mockConversation = { id: 'conv-123' };
      const mockMemory = {
        id: 1,
        content: longContent,
        memoryType: 'immediate',
        importance: 0.5,
        createdAt: new Date()
      };

      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);
      (aiMemoryService.createMemory as jest.Mock).mockResolvedValue(mockMemory);

      const result = await middleware.createMemory({
        userId: 1,
        conversationId: 'conv-123',
        content: longContent
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockMemory);
    });

    it('should handle special characters in content', async () => {
      const specialContent = 'Content with 中文 and ñ and é and 🎉';
      const mockConversation = { id: 'conv-123' };
      const mockMemory = {
        id: 1,
        content: specialContent,
        memoryType: 'immediate',
        importance: 0.5,
        createdAt: new Date()
      };

      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);
      (aiMemoryService.createMemory as jest.Mock).mockResolvedValue(mockMemory);

      const result = await middleware.createMemory({
        userId: 1,
        conversationId: 'conv-123',
        content: specialContent
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockMemory);
    });

    it('should handle invalid importance values', async () => {
      const mockConversation = { id: 'conv-123' };
      const mockMemory = {
        id: 1,
        content: 'Test content',
        memoryType: 'immediate',
        importance: 1.5, // Invalid importance > 1
        createdAt: new Date()
      };

      (aiConversationService.getConversation as jest.Mock).mockResolvedValue(mockConversation);
      (aiMemoryService.createMemory as jest.Mock).mockResolvedValue(mockMemory);

      const result = await middleware.createMemory({
        userId: 1,
        conversationId: 'conv-123',
        content: 'Test content',
        importance: 1.5
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockMemory);
    });
  });
});