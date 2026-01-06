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
import operationLogsApi, {
  OperationLogQuery,
  OperationLog,
  OperationLogResponse,
  OperationLogStatsResponse
} from '@/api/operation-logs'

// Mock request module
vi.mock('@/utils/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    request: vi.fn()
  }
}))

describe('Operation Logs API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getOperationLogs', () => {
    it('should get operation logs without filters', async () => {
      const mockLogs: OperationLog[] = [
        {
          id: 1,
          userId: 1,
          module: 'students',
          action: 'create',
          operationType: 'CREATE',
          resourceType: 'Student',
          resourceId: '1',
          description: 'Created new student record',
          requestMethod: 'POST',
          requestUrl: '/api/students',
          requestParams: '{"name":"John Doe","age":5}',
          requestIp: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          deviceInfo: 'Desktop',
          operationResult: 'SUCCESS',
          resultMessage: 'Student created successfully',
          executionTime: 150,
          createdAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-01-01T10:00:00Z'
        }
      ]

      const mockResponse: OperationLogResponse = {
        success: true,
        data: {
          items: mockLogs,
          total: 1,
          page: 1,
          pageSize: 10
        },
        message: 'Operation logs retrieved successfully'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await operationLogsApi.getOperationLogs({})

      expect(request.get).toHaveBeenCalledWith('/operation-logs', { params: {} })
      expect(result).toEqual(mockResponse)
    })

    it('should get operation logs with all filters', async () => {
      const params: OperationLogQuery = {
        page: 2,
        pageSize: 20,
        module: 'students',
        operationType: 'CREATE',
        startTime: '2024-01-01T00:00:00Z',
        endTime: '2024-12-31T23:59:59Z',
        userId: 1,
        keyword: 'John'
      }

      const mockResponse: OperationLogResponse = {
        success: true,
        data: {
          items: [],
          total: 0,
          page: 2,
          pageSize: 20
        },
        message: 'No operation logs found'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await operationLogsApi.getOperationLogs(params)

      expect(request.get).toHaveBeenCalledWith('/operation-logs', { params })
      expect(result).toEqual(mockResponse)
    })

    it('should handle operation logs API errors', async () => {
      const error = new Error('Failed to fetch operation logs')
      vi.mocked(request.get).mockRejectedValue(error)

      await expect(operationLogsApi.getOperationLogs({})).rejects.toThrow('Failed to fetch operation logs')
    })

    it('should handle empty operation logs response', async () => {
      const mockResponse: OperationLogResponse = {
        success: true,
        data: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 10
        },
        message: 'No operation logs found'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await operationLogsApi.getOperationLogs({})

      expect(result.data.items).toHaveLength(0)
      expect(result.data.total).toBe(0)
    })
  })

  describe('getOperationLogDetail', () => {
    it('should get operation log detail successfully', async () => {
      const logId = 1
      const mockLogDetail = {
        id: 1,
        userId: 1,
        module: 'students',
        action: 'create',
        operationType: 'CREATE',
        resourceType: 'Student',
        resourceId: '1',
        description: 'Created new student record',
        requestMethod: 'POST',
        requestUrl: '/api/students',
        requestParams: '{"name":"John Doe","age":5}',
        requestIp: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        deviceInfo: 'Desktop',
        operationResult: 'SUCCESS',
        resultMessage: 'Student created successfully',
        executionTime: 150,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
        user: {
          id: 1,
          name: 'Admin User',
          email: 'admin@example.com'
        }
      }

      const mockResponse = {
        success: true,
        data: mockLogDetail,
        message: 'Operation log detail retrieved successfully'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await operationLogsApi.getOperationLogDetail(logId)

      expect(request.get).toHaveBeenCalledWith(`/operation-logs/${logId}`)
      expect(result).toEqual(mockResponse)
    })

    it('should handle non-existent operation log', async () => {
      const logId = 999
      const mockResponse = {
        success: false,
        data: null,
        message: 'Operation log not found'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await operationLogsApi.getOperationLogDetail(logId)

      expect(request.get).toHaveBeenCalledWith(`/operation-logs/${logId}`)
      expect(result.data).toBeNull()
    })

    it('should handle operation log detail API errors', async () => {
      const error = new Error('Failed to fetch operation log detail')
      vi.mocked(request.get).mockRejectedValue(error)

      await expect(operationLogsApi.getOperationLogDetail(1)).rejects.toThrow('Failed to fetch operation log detail')
    })
  })

  describe('getOperationLogStats', () => {
    it('should get operation log statistics successfully', async () => {
      const mockStats: OperationLogStatsResponse = {
        success: true,
        data: {
          totalLogs: 1000,
          successLogs: 950,
          failureLogs: 50,
          todayLogs: 25,
          moduleStats: [
            { module: 'students', count: 300 },
            { module: 'teachers', count: 200 },
            { module: 'classes', count: 150 }
          ],
          operationTypeStats: [
            { operationType: 'CREATE', count: 400 },
            { operationType: 'UPDATE', count: 350 },
            { operationType: 'DELETE', count: 100 },
            { operationType: 'READ', count: 150 }
          ]
        },
        message: 'Operation log statistics retrieved successfully'
      }

      vi.mocked(request.get).mockResolvedValue(mockStats)

      const result = await operationLogsApi.getOperationLogStats()

      expect(request.get).toHaveBeenCalledWith('/operation-logs/stats')
      expect(result).toEqual(mockStats)
    })

    it('should handle empty statistics', async () => {
      const mockStats: OperationLogStatsResponse = {
        success: true,
        data: {
          totalLogs: 0,
          successLogs: 0,
          failureLogs: 0,
          todayLogs: 0,
          moduleStats: [],
          operationTypeStats: []
        },
        message: 'No operation log statistics available'
      }

      vi.mocked(request.get).mockResolvedValue(mockStats)

      const result = await operationLogsApi.getOperationLogStats()

      expect(result.data.totalLogs).toBe(0)
      expect(result.data.moduleStats).toHaveLength(0)
      expect(result.data.operationTypeStats).toHaveLength(0)
    })

    it('should handle statistics API errors', async () => {
      const error = new Error('Failed to fetch operation log statistics')
      vi.mocked(request.get).mockRejectedValue(error)

      await expect(operationLogsApi.getOperationLogStats()).rejects.toThrow('Failed to fetch operation log statistics')
    })
  })

  describe('exportOperationLogs', () => {
    it('should export operation logs without filters', async () => {
      const mockBlob = new Blob(['log data'], { type: 'text/csv' })
      
      vi.mocked(request.get).mockResolvedValue({ data: mockBlob })

      const result = await operationLogsApi.exportOperationLogs({})

      expect(request.get).toHaveBeenCalledWith('/operation-logs/export', { 
        params: {},
        responseType: 'blob'
      })
      expect(result).toBe(mockBlob)
    })

    it('should export operation logs with filters', async () => {
      const params: OperationLogQuery = {
        module: 'students',
        operationType: 'CREATE',
        startTime: '2024-01-01T00:00:00Z',
        endTime: '2024-12-31T23:59:59Z'
      }

      const mockBlob = new Blob(['filtered log data'], { type: 'text/csv' })
      
      vi.mocked(request.get).mockResolvedValue({ data: mockBlob })

      const result = await operationLogsApi.exportOperationLogs(params)

      expect(request.get).toHaveBeenCalledWith('/operation-logs/export', { 
        params,
        responseType: 'blob'
      })
      expect(result).toBe(mockBlob)
    })

    it('should handle export API errors', async () => {
      const error = new Error('Failed to export operation logs')
      vi.mocked(request.get).mockRejectedValue(error)

      await expect(operationLogsApi.exportOperationLogs({})).rejects.toThrow('Failed to export operation logs')
    })

    it('should handle empty export data', async () => {
      const mockBlob = new Blob([], { type: 'text/csv' })
      
      vi.mocked(request.get).mockResolvedValue({ data: mockBlob })

      const result = await operationLogsApi.exportOperationLogs({})

      expect(result.size).toBe(0)
    })
  })

  describe('deleteOperationLog', () => {
    it('should delete operation log successfully', async () => {
      const logId = 1
      const mockResponse = {
        success: true,
        data: { id: logId },
        message: 'Operation log deleted successfully'
      }

      vi.mocked(request.delete).mockResolvedValue(mockResponse)

      const result = await operationLogsApi.deleteOperationLog(logId)

      expect(request.delete).toHaveBeenCalledWith(`/operation-logs/${logId}`)
      expect(result).toEqual(mockResponse)
    })

    it('should handle deletion of non-existent log', async () => {
      const logId = 999
      const mockResponse = {
        success: false,
        data: null,
        message: 'Operation log not found'
      }

      vi.mocked(request.delete).mockResolvedValue(mockResponse)

      const result = await operationLogsApi.deleteOperationLog(logId)

      expect(request.delete).toHaveBeenCalledWith(`/operation-logs/${logId}`)
      expect(result.success).toBe(false)
    })

    it('should handle delete API errors', async () => {
      const error = new Error('Failed to delete operation log')
      vi.mocked(request.delete).mockRejectedValue(error)

      await expect(operationLogsApi.deleteOperationLog(1)).rejects.toThrow('Failed to delete operation log')
    })
  })

  describe('batchDeleteOperationLogs', () => {
    it('should batch delete operation logs successfully', async () => {
      const logIds = [1, 2, 3]
      const mockResponse = {
        success: true,
        data: { deletedCount: 3 },
        message: 'Operation logs batch deleted successfully'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await operationLogsApi.batchDeleteOperationLogs(logIds)

      expect(request.post).toHaveBeenCalledWith('/operation-logs/batch-delete', { ids: logIds })
      expect(result).toEqual(mockResponse)
    })

    it('should handle batch delete with single ID', async () => {
      const logIds = [1]
      const mockResponse = {
        success: true,
        data: { deletedCount: 1 },
        message: 'Operation log deleted successfully'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await operationLogsApi.batchDeleteOperationLogs(logIds)

      expect(request.post).toHaveBeenCalledWith('/operation-logs/batch-delete', { ids: logIds })
      expect(result.data.deletedCount).toBe(1)
    })

    it('should handle batch delete with empty IDs array', async () => {
      const logIds: number[] = []
      const mockResponse = {
        success: false,
        data: { deletedCount: 0 },
        message: 'No operation log IDs provided'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await operationLogsApi.batchDeleteOperationLogs(logIds)

      expect(request.post).toHaveBeenCalledWith('/operation-logs/batch-delete', { ids: logIds })
      expect(result.data.deletedCount).toBe(0)
    })

    it('should handle batch delete API errors', async () => {
      const error = new Error('Failed to batch delete operation logs')
      vi.mocked(request.post).mockRejectedValue(error)

      await expect(operationLogsApi.batchDeleteOperationLogs([1, 2, 3])).rejects.toThrow('Failed to batch delete operation logs')
    })
  })

  describe('cleanExpiredLogs', () => {
    it('should clean expired logs successfully', async () => {
      const days = 30
      const mockResponse = {
        success: true,
        data: { cleanedCount: 100 },
        message: 'Expired operation logs cleaned successfully'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await operationLogsApi.cleanExpiredLogs(days)

      expect(request.post).toHaveBeenCalledWith('/operation-logs/clean', { days })
      expect(result).toEqual(mockResponse)
    })

    it('should handle cleaning with minimum days', async () => {
      const days = 1
      const mockResponse = {
        success: true,
        data: { cleanedCount: 5 },
        message: 'Expired operation logs cleaned successfully'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await operationLogsApi.cleanExpiredLogs(days)

      expect(request.post).toHaveBeenCalledWith('/operation-logs/clean', { days })
      expect(result.data.cleanedCount).toBe(5)
    })

    it('should handle cleaning with large days value', async () => {
      const days = 365
      const mockResponse = {
        success: true,
        data: { cleanedCount: 0 },
        message: 'No expired operation logs found'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await operationLogsApi.cleanExpiredLogs(days)

      expect(request.post).toHaveBeenCalledWith('/operation-logs/clean', { days })
      expect(result.data.cleanedCount).toBe(0)
    })

    it('should handle clean API errors', async () => {
      const error = new Error('Failed to clean expired logs')
      vi.mocked(request.post).mockRejectedValue(error)

      await expect(operationLogsApi.cleanExpiredLogs(30)).rejects.toThrow('Failed to clean expired logs')
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const error = new Error('Network Error')
      vi.mocked(request.get).mockRejectedValue(error)

      await expect(operationLogsApi.getOperationLogs({})).rejects.toThrow('Network Error')
    })

    it('should handle timeout errors gracefully', async () => {
      const error = new Error('Request timeout')
      vi.mocked(request.get).mockRejectedValue(error)

      await expect(operationLogsApi.getOperationLogStats()).rejects.toThrow('Request timeout')
    })

    it('should handle server errors gracefully', async () => {
      const error = new Error('Internal Server Error')
      vi.mocked(request.post).mockRejectedValue(error)

      await expect(operationLogsApi.batchDeleteOperationLogs([1, 2, 3])).rejects.toThrow('Internal Server Error')
    })

    it('should handle malformed responses gracefully', async () => {
      vi.mocked(request.get).mockResolvedValue({ data: 'invalid response' })

      const result = await operationLogsApi.getOperationLogs({})
      expect(result).toEqual({ data: 'invalid response' })
    })

    it('should handle null responses gracefully', async () => {
      vi.mocked(request.get).mockResolvedValue({ data: null })

      const result = await operationLogsApi.getOperationLogs({})
      expect(result.data).toBeNull()
    })
  })

  describe('Type Safety', () => {
    it('should enforce correct query parameter types', () => {
      const params: OperationLogQuery = {
        page: 1,
        pageSize: 10,
        module: 'students',
        operationType: 'CREATE',
        startTime: '2024-01-01T00:00:00Z',
        endTime: '2024-12-31T23:59:59Z',
        userId: 1,
        keyword: 'test'
      }

      expect(typeof params.page).toBe('number')
      expect(typeof params.pageSize).toBe('number')
      expect(typeof params.module).toBe('string')
      expect(typeof params.operationType).toBe('string')
      expect(typeof params.startTime).toBe('string')
      expect(typeof params.endTime).toBe('string')
      expect(typeof params.userId).toBe('number')
      expect(typeof params.keyword).toBe('string')
    })

    it('should handle correct response types for logs', async () => {
      const mockLogs: OperationLog[] = [
        {
          id: 1,
          userId: 1,
          module: 'students',
          action: 'create',
          operationType: 'CREATE',
          resourceType: 'Student',
          resourceId: '1',
          description: 'Test log',
          requestMethod: 'POST',
          requestUrl: '/api/students',
          requestParams: '{}',
          requestIp: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          deviceInfo: 'Desktop',
          operationResult: 'SUCCESS',
          resultMessage: 'Success',
          executionTime: 100,
          createdAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-01-01T10:00:00Z'
        }
      ]

      const mockResponse: OperationLogResponse = {
        success: true,
        data: {
          items: mockLogs,
          total: 1,
          page: 1,
          pageSize: 10
        },
        message: 'Success'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await operationLogsApi.getOperationLogs({})
      
      expect(result.success).toBe(true)
      expect(Array.isArray(result.data.items)).toBe(true)
      expect(result.data.items[0].id).toBe(1)
      expect(result.data.items[0].module).toBe('students')
      expect(result.data.total).toBe(1)
      expect(result.data.page).toBe(1)
      expect(result.data.pageSize).toBe(10)
    })

    it('should handle correct response types for statistics', async () => {
      const mockResponse: OperationLogStatsResponse = {
        success: true,
        data: {
          totalLogs: 100,
          successLogs: 90,
          failureLogs: 10,
          todayLogs: 5,
          moduleStats: [
            { module: 'students', count: 50 }
          ],
          operationTypeStats: [
            { operationType: 'CREATE', count: 30 }
          ]
        },
        message: 'Success'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await operationLogsApi.getOperationLogStats()
      
      expect(result.success).toBe(true)
      expect(result.data.totalLogs).toBe(100)
      expect(result.data.successLogs).toBe(90)
      expect(result.data.failureLogs).toBe(10)
      expect(result.data.todayLogs).toBe(5)
      expect(Array.isArray(result.data.moduleStats)).toBe(true)
      expect(Array.isArray(result.data.operationTypeStats)).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle very large page numbers', async () => {
      const params: OperationLogQuery = {
        page: 999999,
        pageSize: 100
      }

      const mockResponse: OperationLogResponse = {
        success: true,
        data: {
          items: [],
          total: 0,
          page: 999999,
          pageSize: 100
        },
        message: 'No operation logs found'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await operationLogsApi.getOperationLogs(params)

      expect(result.data.page).toBe(999999)
      expect(result.data.items).toHaveLength(0)
    })

    it('should handle very large batch delete operations', async () => {
      const logIds = Array.from({ length: 1000 }, (_, i) => i + 1)
      const mockResponse = {
        success: true,
        data: { deletedCount: 1000 },
        message: 'Large batch delete completed successfully'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await operationLogsApi.batchDeleteOperationLogs(logIds)

      expect(result.data.deletedCount).toBe(1000)
    })

    it('should handle invalid date ranges', async () => {
      const params: OperationLogQuery = {
        startTime: '2024-12-31T23:59:59Z',
        endTime: '2024-01-01T00:00:00Z' // End date before start date
      }

      const mockResponse: OperationLogResponse = {
        success: true,
        data: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 10
        },
        message: 'No operation logs found for the specified date range'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await operationLogsApi.getOperationLogs(params)

      expect(result.data.items).toHaveLength(0)
    })

    it('should handle special characters in search keywords', async () => {
      const params: OperationLogQuery = {
        keyword: 'test@#$%^&*()'
      }

      const mockResponse: OperationLogResponse = {
        success: true,
        data: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 10
        },
        message: 'No operation logs found'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await operationLogsApi.getOperationLogs(params)

      expect(result.data.items).toHaveLength(0)
    })

    it('should handle zero and negative days for cleanup', async () => {
      const mockResponse = {
        success: false,
        data: { cleanedCount: 0 },
        message: 'Invalid days parameter'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await operationLogsApi.cleanExpiredLogs(0)

      expect(result.data.cleanedCount).toBe(0)
    })
  })

  describe('Integration Scenarios', () => {
    it('should work with typical log management workflow', async () => {
      // 1. Get logs with filters
      const params: OperationLogQuery = {
        module: 'students',
        operationType: 'CREATE',
        page: 1,
        pageSize: 10
      }

      const mockLogsResponse: OperationLogResponse = {
        success: true,
        data: {
          items: [
            {
              id: 1,
              userId: 1,
              module: 'students',
              action: 'create',
              operationType: 'CREATE',
              resourceType: 'Student',
              resourceId: '1',
              description: 'Created student',
              requestMethod: 'POST',
              requestUrl: '/api/students',
              requestParams: '{}',
              requestIp: '192.168.1.1',
              userAgent: 'Mozilla/5.0',
              deviceInfo: 'Desktop',
              operationResult: 'SUCCESS',
              resultMessage: 'Success',
              executionTime: 100,
              createdAt: '2024-01-01T10:00:00Z',
              updatedAt: '2024-01-01T10:00:00Z'
            }
          ],
          total: 1,
          page: 1,
          pageSize: 10
        },
        message: 'Logs retrieved'
      }

      vi.mocked(request.get).mockResolvedValue(mockLogsResponse)

      const logsResult = await operationLogsApi.getOperationLogs(params)
      expect(logsResult.data.items).toHaveLength(1)

      // 2. Get statistics
      const mockStatsResponse: OperationLogStatsResponse = {
        success: true,
        data: {
          totalLogs: 100,
          successLogs: 95,
          failureLogs: 5,
          todayLogs: 10,
          moduleStats: [
            { module: 'students', count: 50 }
          ],
          operationTypeStats: [
            { operationType: 'CREATE', count: 30 }
          ]
        },
        message: 'Stats retrieved'
      }

      vi.mocked(request.get).mockResolvedValue(mockStatsResponse)

      const statsResult = await operationLogsApi.getOperationLogStats()
      expect(statsResult.data.totalLogs).toBe(100)

      // 3. Export logs
      const mockBlob = new Blob(['export data'], { type: 'text/csv' })
      vi.mocked(request.get).mockResolvedValue({ data: mockBlob })

      const exportResult = await operationLogsApi.exportOperationLogs(params)
      expect(exportResult).toBe(mockBlob)

      // 4. Batch delete logs
      const mockDeleteResponse = {
        success: true,
        data: { deletedCount: 1 },
        message: 'Logs deleted'
      }

      vi.mocked(request.post).mockResolvedValue(mockDeleteResponse)

      const deleteResult = await operationLogsApi.batchDeleteOperationLogs([1])
      expect(deleteResult.data.deletedCount).toBe(1)
    })
  })
})