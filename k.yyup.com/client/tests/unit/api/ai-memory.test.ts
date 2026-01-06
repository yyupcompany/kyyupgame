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

describe, it, expect, vi, beforeEach } from 'vitest'
import request from '@/utils/request'
import { AI_ENDPOINTS } from '@/api/endpoints'
import { MemoryType } from '@/types/ai-memory'
import {
  createMemory,
  createMemoryWithEmbedding,
  findSimilarMemories,
  searchMemories,
  getConversationMemories,
  getMemory,
  updateMemory,
  deleteMemory,
  getMemoryStats,
  archiveToLongTerm,
  cleanupExpiredMemories
} from '@/api/ai-memory'

// Mock request module
vi.mock('@/utils/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    del: vi.fn()
  }
}))

// Mock endpoints
vi.mock('@/api/endpoints', () => ({
  AI_ENDPOINTS: {
    MEMORY: {
      CREATE: '/ai/memory',
      CREATE_WITH_EMBEDDING: '/ai/memory/with-embedding',
      SEARCH_SIMILAR: '/ai/memory/search-similar',
      SEARCH: (userId) => `/ai/memory/${userId}/search`,
      GET_CONVERSATION: (conversationId, userId) => `/ai/memory/conversation/${conversationId}/${userId}`,
      GET_BY_ID: (memoryId) => `/ai/memory/${memoryId}`,
      UPDATE: (memoryId) => `/ai/memory/${memoryId}`,
      DELETE: (memoryId, userId) => `/ai/memory/${memoryId}/${userId}`,
      STATS: (userId) => `/ai/memory/${userId}/stats`,
      ARCHIVE: (memoryId) => `/ai/memory/${memoryId}/archive`,
      CLEANUP_EXPIRED: '/ai/memory/cleanup-expired'
    }
  }
}))

describe('AI Memory API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createMemory', () => {
    it('should create memory successfully', async () => {
      const mockResponse = {
        id: 1,
        userId: 1,
        content: 'Test memory content',
        memoryType: MemoryType.SHORT_TERM,
        createdAt: '2024-01-01T00:00:00Z'
      }

      vi.mocked(request.post).mockResolvedValue({ data: mockResponse })

      const result = await createMemory(
        1,
        'Test memory content',
        'conv_123',
        MemoryType.SHORT_TERM,
        5,
        new Date('2024-12-31')
      )

      expect(request.post).toHaveBeenCalledWith('/ai/memory', {
        userId: 1,
        content: 'Test memory content',
        conversationId: 'conv_123',
        memoryType: MemoryType.SHORT_TERM,
        importance: 5,
        expiresAt: '2024-12-31T00:00:00.000Z'
      })
      expect(result).toEqual(mockResponse)
    })

    it('should handle API errors', async () => {
      const error = new Error('Failed to create memory')
      vi.mocked(request.post).mockRejectedValue(error)

      await expect(createMemory(1, 'test')).rejects.toThrow('Failed to create memory')
    })
  })

  describe('createMemoryWithEmbedding', () => {
    it('should create memory with embedding successfully', async () => {
      const mockResponse = {
        id: 1,
        userId: 1,
        content: 'Test memory with embedding',
        memoryType: MemoryType.LONG_TERM,
        embedding: [0.1, 0.2, 0.3]
      }

      vi.mocked(request.post).mockResolvedValue({ data: mockResponse })

      const result = await createMemoryWithEmbedding(
        1,
        'Test memory with embedding',
        'conv_123',
        MemoryType.LONG_TERM,
        8,
        new Date('2024-12-31'),
        'openai'
      )

      expect(request.post).toHaveBeenCalledWith('/ai/memory/with-embedding', {
        userId: 1,
        content: 'Test memory with embedding',
        conversationId: 'conv_123',
        memoryType: MemoryType.LONG_TERM,
        importance: 8,
        expiresAt: '2024-12-31T00:00:00.000Z',
        provider: 'openai'
      })
      expect(result).toEqual(mockResponse)
    })

    it('should return null on API errors (silent handling)', async () => {
      const error = new Error('API not available')
      vi.mocked(request.post).mockRejectedValue(error)

      const result = await createMemoryWithEmbedding(1, 'test')
      expect(result).toBeNull()
    })
  })

  describe('findSimilarMemories', () => {
    it('should find similar memories successfully', async () => {
      const mockResponse = [
        {
          id: 1,
          content: 'Similar memory 1',
          similarity: 0.85
        },
        {
          id: 2,
          content: 'Similar memory 2',
          similarity: 0.75
        }
      ]

      vi.mocked(request.get).mockResolvedValue({ data: mockResponse })

      const result = await findSimilarMemories(
        'test query',
        1,
        5,
        0.7,
        'openai'
      )

      expect(request.get).toHaveBeenCalledWith('/ai/memory/search-similar', {
        query: 'test query',
        userId: 1,
        limit: 5,
        similarityThreshold: 0.7,
        provider: 'openai'
      })
      expect(result).toEqual(mockResponse)
    })

    it('should handle 404 errors gracefully', async () => {
      const error = { response: { status: 404 } }
      vi.mocked(request.get).mockRejectedValue(error)

      const result = await findSimilarMemories('test', 1)
      expect(result).toEqual([])
    })

    it('should handle other errors gracefully', async () => {
      const error = new Error('Network error')
      vi.mocked(request.get).mockRejectedValue(error)

      const result = await findSimilarMemories('test', 1)
      expect(result).toEqual([])
    })
  })

  describe('searchMemories', () => {
    it('should search memories successfully', async () => {
      const mockResponse = [
        {
          id: 1,
          content: 'Search result 1',
          memoryType: MemoryType.LONG_TERM
        }
      ]

      const params = {
        memoryType: 'LONG_TERM',
        minImportance: 5,
        fromDate: '2024-01-01',
        toDate: '2024-12-31',
        query: 'test query',
        limit: 10,
        offset: 0,
        sortField: 'createdAt',
        sortDirection: 'DESC'
      }

      vi.mocked(request.get).mockResolvedValue({ data: mockResponse })

      const result = await searchMemories(1, params)

      expect(request.get).toHaveBeenCalledWith('/ai/memory/1/search', {
        params: {
          memoryType: 'LONG_TERM',
          minImportance: 5,
          fromDate: '2024-01-01',
          toDate: '2024-12-31',
          query: 'test query',
          limit: 10,
          offset: 0,
          sortField: 'createdAt',
          sortDirection: 'DESC'
        }
      })
      expect(result).toEqual(mockResponse)
    })

    it('should handle 404 errors gracefully', async () => {
      const error = { response: { status: 404 } }
      vi.mocked(request.get).mockRejectedValue(error)

      const result = await searchMemories(1, {})
      expect(result).toEqual([])
    })

    it('should handle other errors gracefully', async () => {
      const error = new Error('Search failed')
      vi.mocked(request.get).mockRejectedValue(error)

      const result = await searchMemories(1, {})
      expect(result).toEqual([])
    })
  })

  describe('getConversationMemories', () => {
    it('should get conversation memories successfully', async () => {
      const mockResponse = [
        {
          id: 1,
          conversationId: 'conv_123',
          content: 'Conversation memory 1'
        }
      ]

      vi.mocked(request.get).mockResolvedValue({ data: mockResponse })

      const result = await getConversationMemories(1, 'conv_123')

      expect(request.get).toHaveBeenCalledWith('/ai/memory/conversation/conv_123/1')
      expect(result).toEqual(mockResponse)
    })

    it('should handle API errors', async () => {
      const error = new Error('Failed to get conversation memories')
      vi.mocked(request.get).mockRejectedValue(error)

      await expect(getConversationMemories(1, 'conv_123')).rejects.toThrow('Failed to get conversation memories')
    })
  })

  describe('getMemory', () => {
    it('should get memory detail successfully', async () => {
      const mockResponse = {
        id: 1,
        userId: 1,
        content: 'Memory detail',
        memoryType: MemoryType.SHORT_TERM
      }

      vi.mocked(request.get).mockResolvedValue({ data: mockResponse })

      const result = await getMemory(1, 1)

      expect(request.get).toHaveBeenCalledWith('/ai/memory/1', {
        params: { userId: 1 }
      })
      expect(result).toEqual(mockResponse)
    })

    it('should handle API errors', async () => {
      const error = new Error('Memory not found')
      vi.mocked(request.get).mockRejectedValue(error)

      await expect(getMemory(1, 1)).rejects.toThrow('Memory not found')
    })
  })

  describe('updateMemory', () => {
    it('should update memory successfully', async () => {
      const mockResponse = {
        id: 1,
        content: 'Updated memory content',
        memoryType: MemoryType.LONG_TERM
      }

      vi.mocked(request.put).mockResolvedValue({ data: mockResponse })

      const result = await updateMemory(1, 1, {
        content: 'Updated memory content',
        memoryType: MemoryType.LONG_TERM
      })

      expect(request.put).toHaveBeenCalledWith('/ai/memory/1', {
        content: 'Updated memory content',
        memoryType: MemoryType.LONG_TERM,
        userId: 1
      })
      expect(result).toEqual(mockResponse)
    })

    it('should handle partial updates', async () => {
      const mockResponse = {
        id: 1,
        content: 'Original content',
        importance: 10
      }

      vi.mocked(request.put).mockResolvedValue({ data: mockResponse })

      const result = await updateMemory(1, 1, {
        importance: 10
      })

      expect(request.put).toHaveBeenCalledWith('/ai/memory/1', {
        importance: 10,
        userId: 1
      })
      expect(result).toEqual(mockResponse)
    })

    it('should handle API errors', async () => {
      const error = new Error('Failed to update memory')
      vi.mocked(request.put).mockRejectedValue(error)

      await expect(updateMemory(1, 1, {})).rejects.toThrow('Failed to update memory')
    })
  })

  describe('deleteMemory', () => {
    it('should delete memory successfully', async () => {
      const mockResponse = { success: true }

      vi.mocked(request.del).mockResolvedValue({ data: mockResponse })

      const result = await deleteMemory(1, 1)

      expect(request.del).toHaveBeenCalledWith('/ai/memory/1/1')
      expect(result).toEqual(mockResponse)
    })

    it('should handle API errors', async () => {
      const error = new Error('Failed to delete memory')
      vi.mocked(request.del).mockRejectedValue(error)

      await expect(deleteMemory(1, 1)).rejects.toThrow('Failed to delete memory')
    })
  })

  describe('getMemoryStats', () => {
    it('should get memory statistics successfully', async () => {
      const mockResponse = {
        totalMemories: 100,
        byType: {
          SHORT_TERM: 60,
          LONG_TERM: 40
        },
        averageImportance: 7.5
      }

      vi.mocked(request.get).mockResolvedValue({ data: mockResponse })

      const result = await getMemoryStats(1)

      expect(request.get).toHaveBeenCalledWith('/ai/memory/1/stats')
      expect(result).toEqual(mockResponse)
    })

    it('should handle API errors', async () => {
      const error = new Error('Failed to get memory stats')
      vi.mocked(request.get).mockRejectedValue(error)

      await expect(getMemoryStats(1)).rejects.toThrow('Failed to get memory stats')
    })
  })

  describe('archiveToLongTerm', () => {
    it('should archive memory to long term successfully', async () => {
      const mockResponse = {
        id: 1,
        memoryType: MemoryType.LONG_TERM,
        archivedAt: '2024-01-01T00:00:00Z'
      }

      vi.mocked(request.put).mockResolvedValue({ data: mockResponse })

      const result = await archiveToLongTerm(1, {
        reason: 'Important information',
        retentionPeriod: 365
      })

      expect(request.put).toHaveBeenCalledWith('/ai/memory/1/archive', {
        reason: 'Important information',
        retentionPeriod: 365
      })
      expect(result).toEqual(mockResponse)
    })

    it('should handle API errors', async () => {
      const error = new Error('Failed to archive memory')
      vi.mocked(request.put).mockRejectedValue(error)

      await expect(archiveToLongTerm(1)).rejects.toThrow('Failed to archive memory')
    })
  })

  describe('cleanupExpiredMemories', () => {
    it('should cleanup expired memories successfully', async () => {
      const mockResponse = {
        cleanedCount: 50,
        memoryTypes: ['SHORT_TERM', 'LONG_TERM']
      }

      vi.mocked(request.del).mockResolvedValue({ data: mockResponse })

      const result = await cleanupExpiredMemories({
        daysOld: 30,
        memoryType: 'SHORT_TERM',
        dryRun: false
      })

      expect(request.del).toHaveBeenCalledWith('/ai/memory/cleanup-expired', {
        params: {
          daysOld: 30,
          memoryType: 'SHORT_TERM',
          dryRun: false
        }
      })
      expect(result).toEqual(mockResponse)
    })

    it('should handle dry run cleanup', async () => {
      const mockResponse = {
        wouldCleanCount: 25,
        dryRun: true
      }

      vi.mocked(request.del).mockResolvedValue({ data: mockResponse })

      const result = await cleanupExpiredMemories({
        daysOld: 7,
        dryRun: true
      })

      expect(request.del).toHaveBeenCalledWith('/ai/memory/cleanup-expired', {
        params: {
          daysOld: 7,
          dryRun: true
        }
      })
      expect(result).toEqual(mockResponse)
    })

    it('should handle API errors', async () => {
      const error = new Error('Failed to cleanup expired memories')
      vi.mocked(request.del).mockRejectedValue(error)

      await expect(cleanupExpiredMemories()).rejects.toThrow('Failed to cleanup expired memories')
    })
  })

  describe('MemoryType Enum', () => {
    it('should have expected memory types', () => {
      expect(MemoryType.SHORT_TERM).toBe('SHORT_TERM')
      expect(MemoryType.LONG_TERM).toBe('LONG_TERM')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty content', async () => {
      const mockResponse = { id: 1, content: '' }
      vi.mocked(request.post).mockResolvedValue({ data: mockResponse })

      const result = await createMemory(1, '')
      expect(result).toEqual(mockResponse)
    })

    it('should handle very long content', async () => {
      const longContent = 'x'.repeat(10000)
      const mockResponse = { id: 1, content: longContent }
      vi.mocked(request.post).mockResolvedValue({ data: mockResponse })

      const result = await createMemory(1, longContent)
      expect(result).toEqual(mockResponse)
    })

    it('should handle special characters in content', async () => {
      const specialContent = '测试 🎉 Special chars 中文'
      const mockResponse = { id: 1, content: specialContent }
      vi.mocked(request.post).mockResolvedValue({ data: mockResponse })

      const result = await createMemory(1, specialContent)
      expect(result).toEqual(mockResponse)
    })
  })
})