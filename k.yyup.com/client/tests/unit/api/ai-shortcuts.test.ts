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
import {
  getAIShortcuts,
  getUserShortcuts,
  getAIShortcutById,
  getShortcutConfig,
  createAIShortcut,
  updateAIShortcut,
  deleteAIShortcut,
  batchDeleteAIShortcuts,
  updateSortOrder,
  CATEGORY_OPTIONS,
  ROLE_OPTIONS,
  API_ENDPOINT_OPTIONS,
  getCategoryLabel,
  getRoleLabel,
  getApiEndpointLabel,
  validatePromptName,
  generateDefaultSortOrder,
  default as aiShortcutsApi
} from '@/api/ai-shortcuts'

// Mock request module
vi.mock('@/utils/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

describe('AI Shortcuts API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAIShortcuts', () => {
    it('should get AI shortcuts list successfully', async () => {
      const mockResponse = {
        list: [
          {
            id: 1,
            shortcut_name: 'Test Shortcut',
            prompt_name: 'test_prompt',
            category: 'enrollment_planning',
            role: 'principal',
            system_prompt: 'Test system prompt',
            api_endpoint: 'ai_chat',
            is_active: true,
            sort_order: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        ],
        pagination: {
          page: 1,
          pageSize: 10,
          total: 1,
          totalPages: 1
        }
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getAIShortcuts({ page: 1, pageSize: 10 })

      expect(request.get).toHaveBeenCalledWith('/ai-shortcuts', {
        params: { page: 1, pageSize: 10 }
      })
      expect(result).toEqual(mockResponse)
    })

    it('should handle query parameters', async () => {
      const params = {
        page: 2,
        pageSize: 20,
        role: 'teacher',
        category: 'activity_planning',
        api_endpoint: 'ai_query',
        is_active: true,
        search: 'test'
      }

      const mockResponse = {
        list: [],
        pagination: { page: 2, pageSize: 20, total: 0, totalPages: 0 }
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getAIShortcuts(params)

      expect(request.get).toHaveBeenCalledWith('/ai-shortcuts', { params })
      expect(result).toEqual(mockResponse)
    })

    it('should handle empty response', async () => {
      const mockResponse = {
        list: [],
        pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 }
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getAIShortcuts()
      expect(result.list).toEqual([])
    })
  })

  describe('getUserShortcuts', () => {
    it('should get user shortcuts successfully', async () => {
      const mockShortcuts = [
        {
          id: 1,
          shortcut_name: 'User Shortcut',
          prompt_name: 'user_prompt',
          category: 'task_management',
          role: 'teacher',
          is_active: true
        }
      ]

      vi.mocked(request.get).mockResolvedValue(mockShortcuts)

      const result = await getUserShortcuts()

      expect(request.get).toHaveBeenCalledWith('/ai-shortcuts/user')
      expect(result).toEqual(mockShortcuts)
    })

    it('should handle empty user shortcuts', async () => {
      vi.mocked(request.get).mockResolvedValue([])

      const result = await getUserShortcuts()
      expect(result).toEqual([])
    })
  })

  describe('getAIShortcutById', () => {
    it('should get AI shortcut by ID successfully', async () => {
      const mockShortcut = {
        id: 1,
        shortcut_name: 'Test Shortcut',
        prompt_name: 'test_prompt',
        category: 'enrollment_planning',
        role: 'principal',
        system_prompt: 'Test system prompt',
        api_endpoint: 'ai_chat',
        is_active: true,
        sort_order: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      vi.mocked(request.get).mockResolvedValue(mockShortcut)

      const result = await getAIShortcutById(1)

      expect(request.get).toHaveBeenCalledWith('/ai-shortcuts/1')
      expect(result).toEqual(mockShortcut)
    })

    it('should handle different shortcut IDs', async () => {
      const ids = [1, 2, 3, 100]

      for (const id of ids) {
        const mockShortcut = {
          id,
          shortcut_name: `Shortcut ${id}`,
          prompt_name: `prompt_${id}`,
          category: 'enrollment_planning'
        }

        vi.mocked(request.get).mockResolvedValue(mockShortcut)

        const result = await getAIShortcutById(id)

        expect(request.get).toHaveBeenCalledWith(`/ai-shortcuts/${id}`)
        expect(result.id).toBe(id)

        vi.clearAllMocks()
      }
    })
  })

  describe('getShortcutConfig', () => {
    it('should get shortcut configuration successfully', async () => {
      const mockConfig = {
        id: 1,
        shortcut_name: 'Test Shortcut',
        prompt_name: 'test_prompt',
        system_prompt: 'Test system prompt',
        api_endpoint: 'ai_chat',
        is_active: true
      }

      vi.mocked(request.get).mockResolvedValue(mockConfig)

      const result = await getShortcutConfig(1)

      expect(request.get).toHaveBeenCalledWith('/ai-shortcuts/1/config')
      expect(result).toEqual(mockConfig)
    })
  })

  describe('createAIShortcut', () => {
    it('should create AI shortcut successfully', async () => {
      const shortcutData = {
        shortcut_name: 'New Shortcut',
        prompt_name: 'new_prompt',
        category: 'enrollment_planning',
        role: 'principal',
        system_prompt: 'New system prompt',
        api_endpoint: 'ai_chat',
        is_active: true,
        sort_order: 1
      }

      const mockResponse = { id: 2 }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await createAIShortcut(shortcutData)

      expect(request.post).toHaveBeenCalledWith('/ai-shortcuts', shortcutData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle minimal creation data', async () => {
      const minimalData = {
        shortcut_name: 'Minimal Shortcut',
        prompt_name: 'minimal_prompt',
        category: 'enrollment_planning',
        role: 'principal',
        system_prompt: 'Minimal prompt',
        api_endpoint: 'ai_chat'
      }

      const mockResponse = { id: 3 }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await createAIShortcut(minimalData)

      expect(request.post).toHaveBeenCalledWith('/ai-shortcuts', minimalData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('updateAIShortcut', () => {
    it('should update AI shortcut successfully', async () => {
      const updateData = {
        shortcut_name: 'Updated Shortcut',
        system_prompt: 'Updated system prompt'
      }

      vi.mocked(request.put).mockResolvedValue({ success: true })

      const result = await updateAIShortcut(1, updateData)

      expect(request.put).toHaveBeenCalledWith('/ai-shortcuts/1', updateData)
      expect(result.success).toBe(true)
    })

    it('should handle partial updates', async () => {
      const partialUpdate = {
        is_active: false
      }

      vi.mocked(request.put).mockResolvedValue({ success: true })

      const result = await updateAIShortcut(1, partialUpdate)

      expect(request.put).toHaveBeenCalledWith('/ai-shortcuts/1', partialUpdate)
    })
  })

  describe('deleteAIShortcut', () => {
    it('should delete AI shortcut successfully', async () => {
      vi.mocked(request.delete).mockResolvedValue({ success: true })

      const result = await deleteAIShortcut(1)

      expect(request.delete).toHaveBeenCalledWith('/ai-shortcuts/1')
      expect(result.success).toBe(true)
    })

    it('should handle different shortcut IDs for deletion', async () => {
      const ids = [1, 2, 3]

      for (const id of ids) {
        vi.mocked(request.delete).mockResolvedValue({ success: true, deletedId: id })

        const result = await deleteAIShortcut(id)

        expect(request.delete).toHaveBeenCalledWith(`/ai-shortcuts/${id}`)
        expect(result.deletedId).toBe(id)

        vi.clearAllMocks()
      }
    })
  })

  describe('batchDeleteAIShortcuts', () => {
    it('should batch delete AI shortcuts successfully', async () => {
      const ids = [1, 2, 3]
      const mockResponse = { success: true, deleted: 3 }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await batchDeleteAIShortcuts(ids)

      expect(request.post).toHaveBeenCalledWith('/ai-shortcuts/batch/delete', { ids })
      expect(result).toEqual(mockResponse)
    })

    it('should handle empty batch delete', async () => {
      const ids: number[] = []
      const mockResponse = { success: true, deleted: 0 }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await batchDeleteAIShortcuts(ids)

      expect(request.post).toHaveBeenCalledWith('/ai-shortcuts/batch/delete', { ids: [] })
      expect(result.deleted).toBe(0)
    })
  })

  describe('updateSortOrder', () => {
    it('should update sort order successfully', async () => {
      const sortData = [
        { id: 1, sort_order: 2 },
        { id: 2, sort_order: 1 },
        { id: 3, sort_order: 3 }
      ]

      const mockResponse = { success: true }

      vi.mocked(request.put).mockResolvedValue(mockResponse)

      const result = await updateSortOrder(sortData)

      expect(request.put).toHaveBeenCalledWith('/ai-shortcuts/sort', { sortData })
      expect(result.success).toBe(true)
    })
  })

  describe('Utility Functions', () => {
    describe('getCategoryLabel', () => {
      it('should return correct category labels', () => {
        expect(getCategoryLabel('enrollment_planning')).toBe('招生规划')
        expect(getCategoryLabel('activity_planning')).toBe('活动策划')
        expect(getCategoryLabel('progress_analysis')).toBe('进展分析')
        expect(getCategoryLabel('follow_up_reminder')).toBe('跟进提醒')
        expect(getCategoryLabel('conversion_monitoring')).toBe('转化监控')
        expect(getCategoryLabel('age_reminder')).toBe('年龄提醒')
        expect(getCategoryLabel('task_management')).toBe('任务管理')
        expect(getCategoryLabel('comprehensive_analysis')).toBe('综合分析')
      })

      it('should return original value for unknown categories', () => {
        expect(getCategoryLabel('unknown')).toBe('unknown')
        expect(getCategoryLabel('')).toBe('')
      })
    })

    describe('getRoleLabel', () => {
      it('should return correct role labels', () => {
        expect(getRoleLabel('principal')).toBe('园长')
        expect(getRoleLabel('admin')).toBe('管理员')
        expect(getRoleLabel('teacher')).toBe('教师')
        expect(getRoleLabel('all')).toBe('通用')
      })

      it('should return original value for unknown roles', () => {
        expect(getRoleLabel('unknown')).toBe('unknown')
      })
    })

    describe('getApiEndpointLabel', () => {
      it('should return correct API endpoint labels', () => {
        expect(getApiEndpointLabel('ai_chat')).toBe('AI聊天')
        expect(getApiEndpointLabel('ai_query')).toBe('AI查询')
      })

      it('should return original value for unknown endpoints', () => {
        expect(getApiEndpointLabel('unknown')).toBe('unknown')
      })
    })

    describe('validatePromptName', () => {
      it('should validate correct prompt names', () => {
        expect(validatePromptName('test_prompt')).toBe(true)
        expect(validatePromptName('test123')).toBe(true)
        expect(validatePromptName('test_123')).toBe(true)
        expect(validatePromptName('TEST_PROMPT')).toBe(true)
        expect(validatePromptName('a')).toBe(true)
        expect(validatePromptName('_test')).toBe(true)
      })

      it('should reject invalid prompt names', () => {
        expect(validatePromptName('test-prompt')).toBe(false)
        expect(validatePromptName('test prompt')).toBe(false)
        expect(validatePromptName('test@prompt')).toBe(false)
        expect(validatePromptName('test#prompt')).toBe(false)
        expect(validatePromptName('')).toBe(false)
        expect(validatePromptName('测试')).toBe(false)
        expect(validatePromptName('test prompt')).toBe(false)
      })
    })

    describe('generateDefaultSortOrder', () => {
      it('should generate default sort order for empty list', () => {
        const result = generateDefaultSortOrder([])
        expect(result).toBe(1)
      })

      it('should generate next sort order based on existing', () => {
        const existingShortcuts = [
          { sort_order: 1 },
          { sort_order: 3 },
          { sort_order: 5 }
        ]

        const result = generateDefaultSortOrder(existingShortcuts)
        expect(result).toBe(6)
      })

      it('should handle negative sort orders', () => {
        const existingShortcuts = [
          { sort_order: -5 },
          { sort_order: -1 }
        ]

        const result = generateDefaultSortOrder(existingShortcuts)
        expect(result).toBe(0)
      })
    })
  })

  describe('Constants', () => {
    describe('CATEGORY_OPTIONS', () => {
      it('should have correct category options', () => {
        expect(CATEGORY_OPTIONS).toEqual([
          { label: '招生规划', value: 'enrollment_planning' },
          { label: '活动策划', value: 'activity_planning' },
          { label: '进展分析', value: 'progress_analysis' },
          { label: '跟进提醒', value: 'follow_up_reminder' },
          { label: '转化监控', value: 'conversion_monitoring' },
          { label: '年龄提醒', value: 'age_reminder' },
          { label: '任务管理', value: 'task_management' },
          { label: '综合分析', value: 'comprehensive_analysis' }
        ])
      })
    })

    describe('ROLE_OPTIONS', () => {
      it('should have correct role options', () => {
        expect(ROLE_OPTIONS).toEqual([
          { label: '园长', value: 'principal' },
          { label: '管理员', value: 'admin' },
          { label: '教师', value: 'teacher' },
          { label: '通用', value: 'all' }
        ])
      })
    })

    describe('API_ENDPOINT_OPTIONS', () => {
      it('should have correct API endpoint options', () => {
        expect(API_ENDPOINT_OPTIONS).toEqual([
          { label: 'AI聊天', value: 'ai_chat' },
          { label: 'AI查询', value: 'ai_query' }
        ])
      })
    })
  })

  describe('Default Export', () => {
    it('should export all functions correctly', () => {
      expect(aiShortcutsApi.getAIShortcuts).toBe(getAIShortcuts)
      expect(aiShortcutsApi.getUserShortcuts).toBe(getUserShortcuts)
      expect(aiShortcutsApi.getAIShortcutById).toBe(getAIShortcutById)
      expect(aiShortcutsApi.getShortcutConfig).toBe(getShortcutConfig)
      expect(aiShortcutsApi.createAIShortcut).toBe(createAIShortcut)
      expect(aiShortcutsApi.updateAIShortcut).toBe(updateAIShortcut)
      expect(aiShortcutsApi.deleteAIShortcut).toBe(deleteAIShortcut)
      expect(aiShortcutsApi.batchDeleteAIShortcuts).toBe(batchDeleteAIShortcuts)
      expect(aiShortcutsApi.updateSortOrder).toBe(updateSortOrder)
      expect(aiShortcutsApi.getCategoryLabel).toBe(getCategoryLabel)
      expect(aiShortcutsApi.getRoleLabel).toBe(getRoleLabel)
      expect(aiShortcutsApi.getApiEndpointLabel).toBe(getApiEndpointLabel)
      expect(aiShortcutsApi.validatePromptName).toBe(validatePromptName)
      expect(aiShortcutsApi.generateDefaultSortOrder).toBe(generateDefaultSortOrder)
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors for getAIShortcuts', async () => {
      const error = new Error('Failed to fetch shortcuts')
      vi.mocked(request.get).mockRejectedValue(error)

      await expect(getAIShortcuts()).rejects.toThrow('Failed to fetch shortcuts')
    })

    it('should handle API errors for createAIShortcut', async () => {
      const error = new Error('Failed to create shortcut')
      vi.mocked(request.post).mockRejectedValue(error)

      await expect(createAIShortcut({} as any)).rejects.toThrow('Failed to create shortcut')
    })

    it('should handle API errors for updateAIShortcut', async () => {
      const error = new Error('Failed to update shortcut')
      vi.mocked(request.put).mockRejectedValue(error)

      await expect(updateAIShortcut(1, {})).rejects.toThrow('Failed to update shortcut')
    })

    it('should handle API errors for deleteAIShortcut', async () => {
      const error = new Error('Failed to delete shortcut')
      vi.mocked(request.delete).mockRejectedValue(error)

      await expect(deleteAIShortcut(1)).rejects.toThrow('Failed to delete shortcut')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very large sort data', async () => {
      const largeSortData = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        sort_order: i + 1
      }))

      const mockResponse = { success: true }
      vi.mocked(request.put).mockResolvedValue(mockResponse)

      const result = await updateSortOrder(largeSortData)
      expect(result.success).toBe(true)
    })

    it('should handle special characters in shortcut names', async () => {
      const specialCharData = {
        shortcut_name: '测试快捷方式 🎉',
        prompt_name: 'test_prompt_中文',
        category: 'enrollment_planning',
        role: 'principal',
        system_prompt: '测试系统提示 🌟',
        api_endpoint: 'ai_chat'
      }

      const mockResponse = { id: 1 }
      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await createAIShortcut(specialCharData)
      expect(result).toEqual(mockResponse)
    })
  })
})