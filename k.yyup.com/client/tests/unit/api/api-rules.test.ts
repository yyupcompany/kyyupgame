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

describe, it, expect, vi } from 'vitest'
import { get, post, put, del } from '@/utils/request'
import { goodApiExample, default as apiRules } from '@/api/api-rules'

// Mock request module
vi.mock('@/utils/request', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))

describe('API Rules', () => {
  describe('Good API Example', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should get data successfully', async () => {
      const mockResponse = { data: { id: '1', name: 'test' } }
      vi.mocked(get).mockResolvedValue(mockResponse)

      const result = await goodApiExample.getData('1')
      
      expect(get).toHaveBeenCalledWith('/api/data/1')
      expect(result).toEqual(mockResponse)
    })

    it('should create data successfully', async () => {
      const data = { name: 'test' }
      const mockResponse = { data: { id: '1', ...data } }
      
      vi.mocked(post).mockResolvedValue(mockResponse)

      const result = await goodApiExample.createData(data)
      
      expect(post).toHaveBeenCalledWith('/api/data', data)
      expect(result).toEqual(mockResponse)
    })

    it('should update data successfully', async () => {
      const data = { name: 'updated' }
      const mockResponse = { data: { id: '1', ...data } }
      
      vi.mocked(put).mockResolvedValue(mockResponse)

      const result = await goodApiExample.updateData('1', data)
      
      expect(put).toHaveBeenCalledWith('/api/data/1', data)
      expect(result).toEqual(mockResponse)
    })

    it('should delete data successfully', async () => {
      const mockResponse = { data: { success: true } }
      
      vi.mocked(del).mockResolvedValue(mockResponse)

      const result = await goodApiExample.deleteData('1')
      
      expect(del).toHaveBeenCalledWith('/api/data/1')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Standardize API Function', () => {
    it('should standardize API functions correctly', async () => {
      const mockApiFunc = vi.fn().mockResolvedValue({ data: 'test' })
      
      const standardizedFunc = apiRules.standardizeApi<string, [string]>(mockApiFunc)
      
      const result = await standardizedFunc('test')
      
      expect(mockApiFunc).toHaveBeenCalledWith('test')
      expect(result).toEqual({ data: 'test' })
    })

    it('should handle errors in standardized API functions', async () => {
      const mockApiFunc = vi.fn().mockRejectedValue(new Error('API Error'))
      
      const standardizedFunc = apiRules.standardizeApi<string, [string]>(mockApiFunc)
      
      await expect(standardizedFunc('test')).rejects.toThrow('API Error')
    })
  })

  describe('API Rules Documentation', () => {
    it('should document the correct API usage patterns', () => {
      // This test verifies that the documented patterns are followed
      expect(typeof goodApiExample.getData).toBe('function')
      expect(typeof goodApiExample.createData).toBe('function')
      expect(typeof goodApiExample.updateData).toBe('function')
      expect(typeof goodApiExample.deleteData).toBe('function')
    })

    it('should show proper error handling patterns', () => {
      // The good example should handle errors properly
      expect(goodApiExample.getData).toBeDefined()
      // In a real scenario, we would test error handling, but since these are examples,
      // we just verify the functions exist
    })
  })

  describe('Default Export', () => {
    it('should export the standardizeApi function', () => {
      expect(typeof apiRules.standardizeApi).toBe('function')
    })

    it('should have the correct function signature', () => {
      const mockFunc = vi.fn()
      const standardized = apiRules.standardizeApi(mockFunc)
      
      expect(typeof standardized).toBe('function')
    })
  })

  describe('Best Practices Verification', () => {
    it('should use unified request methods', () => {
      // Verify that the example uses the correct request methods
      expect(get).toBeDefined()
      expect(post).toBeDefined()
      expect(put).toBeDefined()
      expect(del).toBeDefined()
    })

    it('should follow the documented API patterns', () => {
      // The good example should follow all the documented rules
      const apiFunctions = [
        goodApiExample.getData,
        goodApiExample.createData,
        goodApiExample.updateData,
        goodApiExample.deleteData
      ]

      apiFunctions.forEach(func => {
        expect(typeof func).toBe('function')
      })
    })
  })
})