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
import { get, post, put, del } from '@/utils/request'
import { API_PREFIX } from '@/api/endpoints'
import { advertisementApi } from '@/api/advertisement'

// Mock request module
vi.mock('@/utils/request', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))

// Mock endpoints
vi.mock('@/api/endpoints', () => ({
  API_PREFIX: '/api/v1'
}))

describe('Advertisement API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAdvertisements', () => {
    it('should get advertisements list with default parameters', async () => {
      const mockResponse = {
        advertisements: [
          {
            id: 1,
            title: 'Test Advertisement',
            content: 'Test Content',
            status: 'active'
          }
        ],
        total: 1
      }

      vi.mocked(get).mockResolvedValue(mockResponse)

      const result = await advertisementApi.getAdvertisements({})
      
      expect(get).toHaveBeenCalledWith(`${API_PREFIX}/advertisements`, { params: {} })
      expect(result).toEqual(mockResponse)
    })

    it('should get advertisements with all parameters', async () => {
      const params = {
        page: 2,
        pageSize: 20,
        status: 'active' as const,
        keyword: 'test',
        sortBy: 'createdAt',
        sortOrder: 'desc' as const
      }

      const mockResponse = {
        advertisements: [
          {
            id: 1,
            title: 'Test Advertisement',
            content: 'Test Content',
            status: 'active'
          }
        ],
        total: 1
      }

      vi.mocked(get).mockResolvedValue(mockResponse)

      const result = await advertisementApi.getAdvertisements(params)
      
      expect(get).toHaveBeenCalledWith(`${API_PREFIX}/advertisements`, { params })
      expect(result).toEqual(mockResponse)
    })

    it('should handle pagination parameters correctly', async () => {
      const params = {
        page: 1,
        pageSize: 10
      }

      await advertisementApi.getAdvertisements(params)
      
      expect(get).toHaveBeenCalledWith(`${API_PREFIX}/advertisements`, { params })
    })
  })

  describe('getAdvertisementById', () => {
    it('should get advertisement by id successfully', async () => {
      const mockAdvertisement = {
        id: 1,
        title: 'Test Advertisement',
        content: 'Test Content',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }

      vi.mocked(get).mockResolvedValue(mockAdvertisement)

      const result = await advertisementApi.getAdvertisementById(1)
      
      expect(get).toHaveBeenCalledWith(`${API_PREFIX}/advertisements/1`)
      expect(result).toEqual(mockAdvertisement)
    })

    it('should handle different advertisement ids', async () => {
      const ids = [1, 2, 3, 100]

      for (const id of ids) {
        const mockAdvertisement = {
          id,
          title: `Advertisement ${id}`,
          content: `Content ${id}`,
          status: 'active'
        }

        vi.mocked(get).mockResolvedValue(mockAdvertisement)

        const result = await advertisementApi.getAdvertisementById(id)
        
        expect(get).toHaveBeenCalledWith(`${API_PREFIX}/advertisements/${id}`)
        expect(result.id).toBe(id)
        
        vi.clearAllMocks()
      }
    })
  })

  describe('createAdvertisement', () => {
    it('should create advertisement successfully', async () => {
      const createData = {
        title: 'New Advertisement',
        content: 'New Content',
        status: 'draft' as const
      }

      const mockResponse = {
        id: 1,
        ...createData,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }

      vi.mocked(post).mockResolvedValue(mockResponse)

      const result = await advertisementApi.createAdvertisement(createData)
      
      expect(post).toHaveBeenCalledWith(`${API_PREFIX}/advertisements`, createData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle minimal create data', async () => {
      const minimalData = {
        title: 'Minimal Ad'
      }

      const mockResponse = {
        id: 1,
        ...minimalData,
        status: 'draft',
        createdAt: '2024-01-01T00:00:00Z'
      }

      vi.mocked(post).mockResolvedValue(mockResponse)

      const result = await advertisementApi.createAdvertisement(minimalData)
      
      expect(post).toHaveBeenCalledWith(`${API_PREFIX}/advertisements`, minimalData)
      expect(result.title).toBe('Minimal Ad')
    })
  })

  describe('updateAdvertisement', () => {
    it('should update advertisement successfully', async () => {
      const updateData = {
        title: 'Updated Advertisement',
        content: 'Updated Content'
      }

      const mockResponse = {
        id: 1,
        ...updateData,
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }

      vi.mocked(put).mockResolvedValue(mockResponse)

      const result = await advertisementApi.updateAdvertisement(1, updateData)
      
      expect(put).toHaveBeenCalledWith(`${API_PREFIX}/advertisements/1`, updateData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle partial updates', async () => {
      const partialUpdate = {
        title: 'Title Only Update'
      }

      const mockResponse = {
        id: 1,
        title: 'Title Only Update',
        content: 'Original Content',
        status: 'active'
      }

      vi.mocked(put).mockResolvedValue(mockResponse)

      const result = await advertisementApi.updateAdvertisement(1, partialUpdate)
      
      expect(put).toHaveBeenCalledWith(`${API_PREFIX}/advertisements/1`, partialUpdate)
      expect(result.title).toBe('Title Only Update')
      expect(result.content).toBe('Original Content')
    })
  })

  describe('deleteAdvertisement', () => {
    it('should delete advertisement successfully', async () => {
      const mockResponse = { success: true }

      vi.mocked(del).mockResolvedValue(mockResponse)

      const result = await advertisementApi.deleteAdvertisement(1)
      
      expect(del).toHaveBeenCalledWith(`${API_PREFIX}/advertisements/1`)
      expect(result).toEqual(mockResponse)
    })

    it('should handle different advertisement ids for deletion', async () => {
      const ids = [1, 2, 3]

      for (const id of ids) {
        const mockResponse = { success: true, deletedId: id }
        vi.mocked(del).mockResolvedValue(mockResponse)

        const result = await advertisementApi.deleteAdvertisement(id)
        
        expect(del).toHaveBeenCalledWith(`${API_PREFIX}/advertisements/${id}`)
        expect(result.deletedId).toBe(id)
        
        vi.clearAllMocks()
      }
    })
  })

  describe('getAdvertisementStatistics', () => {
    it('should get advertisement statistics successfully', async () => {
      const params = {
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      }

      const mockResponse = {
        views: 1000,
        clicks: 100,
        ctr: 0.1,
        conversions: 10,
        spend: 500
      }

      vi.mocked(get).mockResolvedValue(mockResponse)

      const result = await advertisementApi.getAdvertisementStatistics(1, params)
      
      expect(get).toHaveBeenCalledWith(`${API_PREFIX}/advertisements/1/statistics`, { params })
      expect(result).toEqual(mockResponse)
    })

    it('should handle statistics without date parameters', async () => {
      const mockResponse = {
        views: 500,
        clicks: 50,
        ctr: 0.1
      }

      vi.mocked(get).mockResolvedValue(mockResponse)

      const result = await advertisementApi.getAdvertisementStatistics(1, {})
      
      expect(get).toHaveBeenCalledWith(`${API_PREFIX}/advertisements/1/statistics`, { params: {} })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('duplicateAdvertisement', () => {
    it('should duplicate advertisement successfully', async () => {
      const mockResponse = {
        id: 2,
        title: 'Test Advertisement (Copy)',
        content: 'Test Content',
        status: 'draft',
        originalId: 1
      }

      vi.mocked(post).mockResolvedValue(mockResponse)

      const result = await advertisementApi.duplicateAdvertisement(1)
      
      expect(post).toHaveBeenCalledWith(`${API_PREFIX}/advertisements/1/duplicate`)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('uploadAdvertisementMaterial', () => {
    it('should upload advertisement material successfully', async () => {
      const formData = new FormData()
      formData.append('file', new Blob(['test content'], { type: 'image/jpeg' }), 'test.jpg')
      
      const mockResponse = {
        id: 1,
        filename: 'test.jpg',
        url: 'https://example.com/test.jpg',
        type: 'image',
        size: 1024
      }

      vi.mocked(post).mockResolvedValue(mockResponse)

      const result = await advertisementApi.uploadAdvertisementMaterial(formData)
      
      expect(post).toHaveBeenCalledWith(`${API_PREFIX}/advertisements/materials/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getAdvertisementMaterials', () => {
    it('should get advertisement materials successfully', async () => {
      const params = {
        page: 1,
        pageSize: 10,
        type: 'image'
      }

      const mockResponse = {
        materials: [
          {
            id: 1,
            filename: 'test.jpg',
            type: 'image'
          }
        ],
        total: 1
      }

      vi.mocked(get).mockResolvedValue(mockResponse)

      const result = await advertisementApi.getAdvertisementMaterials(params)
      
      expect(get).toHaveBeenCalledWith(`${API_PREFIX}/advertisements/materials`, { params })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('deleteAdvertisementMaterial', () => {
    it('should delete advertisement material successfully', async () => {
      const mockResponse = { success: true }

      vi.mocked(del).mockResolvedValue(mockResponse)

      const result = await advertisementApi.deleteAdvertisementMaterial(1)
      
      expect(del).toHaveBeenCalledWith(`${API_PREFIX}/advertisements/materials/1`)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('updateAdvertisementStatus', () => {
    it('should update advertisement status successfully', async () => {
      const mockResponse = {
        id: 1,
        status: 'active',
        updatedAt: '2024-01-01T00:00:00Z'
      }

      vi.mocked(put).mockResolvedValue(mockResponse)

      const result = await advertisementApi.updateAdvertisementStatus(1, 'active')
      
      expect(put).toHaveBeenCalledWith(`${API_PREFIX}/advertisements/1/status`, { status: 'active' })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('batchDeleteAdvertisements', () => {
    it('should batch delete advertisements successfully', async () => {
      const ids = [1, 2, 3]
      const mockResponse = { success: true, deleted: 3 }

      vi.mocked(del).mockResolvedValue(mockResponse)

      const result = await advertisementApi.batchDeleteAdvertisements(ids)
      
      expect(del).toHaveBeenCalledWith(`${API_PREFIX}/advertisements/batch-delete`, { data: { ids } })
      expect(result).toEqual(mockResponse)
    })

    it('should handle empty batch delete', async () => {
      const ids: number[] = []
      const mockResponse = { success: true, deleted: 0 }

      vi.mocked(del).mockResolvedValue(mockResponse)

      const result = await advertisementApi.batchDeleteAdvertisements(ids)
      
      expect(del).toHaveBeenCalledWith(`${API_PREFIX}/advertisements/batch-delete`, { data: { ids: [] } })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('batchUpdateAdvertisementStatus', () => {
    it('should batch update advertisement status successfully', async () => {
      const ids = [1, 2, 3]
      const status = 'active'
      const mockResponse = { success: true, updated: 3 }

      vi.mocked(put).mockResolvedValue(mockResponse)

      const result = await advertisementApi.batchUpdateAdvertisementStatus(ids, status)
      
      expect(put).toHaveBeenCalledWith(`${API_PREFIX}/advertisements/batch-status-update`, { 
        ids, 
        status 
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors for getAdvertisements', async () => {
      const error = new Error('Network error')
      vi.mocked(get).mockRejectedValue(error)

      await expect(advertisementApi.getAdvertisements({})).rejects.toThrow('Network error')
    })

    it('should handle API errors for createAdvertisement', async () => {
      const error = new Error('Failed to create advertisement')
      vi.mocked(post).mockRejectedValue(error)

      await expect(advertisementApi.createAdvertisement({ title: 'Test' })).rejects.toThrow('Failed to create advertisement')
    })

    it('should handle API errors for updateAdvertisement', async () => {
      const error = new Error('Failed to update advertisement')
      vi.mocked(put).mockRejectedValue(error)

      await expect(advertisementApi.updateAdvertisement(1, { title: 'Test' })).rejects.toThrow('Failed to update advertisement')
    })

    it('should handle API errors for deleteAdvertisement', async () => {
      const error = new Error('Failed to delete advertisement')
      vi.mocked(del).mockRejectedValue(error)

      await expect(advertisementApi.deleteAdvertisement(1)).rejects.toThrow('Failed to delete advertisement')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty responses', async () => {
      vi.mocked(get).mockResolvedValue({ advertisements: [], total: 0 })

      const result = await advertisementApi.getAdvertisements({})
      expect(result.advertisements).toEqual([])
      expect(result.total).toBe(0)
    })

    it('should handle large batch operations', async () => {
      const ids = Array.from({ length: 100 }, (_, i) => i + 1)
      const mockResponse = { success: true, deleted: 100 }

      vi.mocked(del).mockResolvedValue(mockResponse)

      const result = await advertisementApi.batchDeleteAdvertisements(ids)
      expect(result.deleted).toBe(100)
    })
  })
})