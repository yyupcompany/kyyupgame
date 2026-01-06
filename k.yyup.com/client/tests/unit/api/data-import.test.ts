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
import dataImportApi, {
  ImportPermissionRequest,
  ImportPermissionResponse,
  ParseDocumentRequest,
  ParseDocumentResponse,
  FieldMappingRequest,
  FieldMappingResponse,
  DataPreviewRequest,
  DataPreviewResponse,
  ImportExecutionRequest,
  ImportExecutionResponse,
  ImportHistoryQuery,
  SupportedTypesResponse
} from '@/api/data-import'

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

describe('Data Import API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('checkPermission', () => {
    it('should check import permission successfully', async () => {
      const requestData: ImportPermissionRequest = {
        importType: 'students'
      }

      const mockResponse: ImportPermissionResponse = {
        success: true,
        data: {
          hasPermission: true,
          importType: 'students',
          userId: 1
        },
        message: 'Permission check successful'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await dataImportApi.checkPermission(requestData)

      expect(request.post).toHaveBeenCalledWith('/data-import/check-permission', requestData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle permission check failure', async () => {
      const requestData: ImportPermissionRequest = {
        importType: 'invalid_type'
      }

      const mockResponse: ImportPermissionResponse = {
        success: false,
        data: {
          hasPermission: false,
          importType: 'invalid_type',
          userId: 1
        },
        message: 'Invalid import type'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await dataImportApi.checkPermission(requestData)

      expect(request.post).toHaveBeenCalledWith('/data-import/check-permission', requestData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle API errors during permission check', async () => {
      const requestData: ImportPermissionRequest = {
        importType: 'students'
      }

      const error = new Error('API Error')
      vi.mocked(request.post).mockRejectedValue(error)

      await expect(dataImportApi.checkPermission(requestData)).rejects.toThrow('API Error')
    })
  })

  describe('parseDocument', () => {
    it('should parse document successfully', async () => {
      const requestData: ParseDocumentRequest = {
        filePath: '/uploads/test.xlsx',
        importType: 'students'
      }

      const mockResponse: ParseDocumentResponse = {
        success: true,
        data: {
          type: 'excel',
          data: [
            { name: 'John Doe', age: 5, class: 'A' },
            { name: 'Jane Smith', age: 6, class: 'B' }
          ],
          fields: ['name', 'age', 'class'],
          totalRecords: 2
        },
        message: 'Document parsed successfully'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await dataImportApi.parseDocument(requestData)

      expect(request.post).toHaveBeenCalledWith('/data-import/parse', requestData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle document parsing errors', async () => {
      const requestData: ParseDocumentRequest = {
        filePath: '/uploads/invalid.xlsx',
        importType: 'students'
      }

      const mockResponse: ParseDocumentResponse = {
        success: false,
        data: {
          type: 'error',
          data: [],
          fields: [],
          totalRecords: 0
        },
        message: 'Invalid file format'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await dataImportApi.parseDocument(requestData)

      expect(request.post).toHaveBeenCalledWith('/data-import/parse', requestData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getSchema', () => {
    it('should get database schema successfully', async () => {
      const type = 'students'
      const mockSchema = {
        tables: {
          students: {
            fields: [
              { name: 'id', type: 'integer', required: true },
              { name: 'name', type: 'string', required: true },
              { name: 'age', type: 'integer', required: false }
            ]
          }
        }
      }

      vi.mocked(request.get).mockResolvedValue({ data: mockSchema })

      const result = await dataImportApi.getSchema(type)

      expect(request.get).toHaveBeenCalledWith(`/data-import/schema/${type}`)
      expect(result).toEqual({ data: mockSchema })
    })

    it('should handle schema retrieval errors', async () => {
      const type = 'invalid_type'
      const error = new Error('Schema not found')
      vi.mocked(request.get).mockRejectedValue(error)

      await expect(dataImportApi.getSchema(type)).rejects.toThrow('Schema not found')
    })
  })

  describe('generateMapping', () => {
    it('should generate field mapping successfully', async () => {
      const requestData: FieldMappingRequest = {
        documentFields: ['name', 'age', 'class'],
        importType: 'students'
      }

      const mockResponse: FieldMappingResponse = {
        success: true,
        data: {
          fieldMappings: [
            { documentField: 'name', databaseField: 'name', confidence: 0.95 },
            { documentField: 'age', databaseField: 'age', confidence: 0.90 },
            { documentField: 'class', databaseField: 'class_name', confidence: 0.85 }
          ],
          databaseSchema: {
            fields: ['name', 'age', 'class_name']
          },
          documentFields: ['name', 'age', 'class']
        },
        message: 'Field mapping generated successfully'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await dataImportApi.generateMapping(requestData)

      expect(request.post).toHaveBeenCalledWith('/data-import/mapping', requestData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle mapping generation with low confidence', async () => {
      const requestData: FieldMappingRequest = {
        documentFields: ['unknown_field'],
        importType: 'students'
      }

      const mockResponse: FieldMappingResponse = {
        success: true,
        data: {
          fieldMappings: [
            { documentField: 'unknown_field', databaseField: null, confidence: 0.1 }
          ],
          databaseSchema: {
            fields: ['name', 'age', 'class_name']
          },
          documentFields: ['unknown_field']
        },
        message: 'Field mapping generated with low confidence'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await dataImportApi.generateMapping(requestData)

      expect(request.post).toHaveBeenCalledWith('/data-import/mapping', requestData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('previewData', () => {
    it('should preview data successfully with all valid records', async () => {
      const requestData: DataPreviewRequest = {
        data: [
          { name: 'John Doe', age: 5, class: 'A' },
          { name: 'Jane Smith', age: 6, class: 'B' }
        ],
        fieldMappings: [
          { documentField: 'name', databaseField: 'name' },
          { documentField: 'age', databaseField: 'age' },
          { documentField: 'class', databaseField: 'class_name' }
        ],
        importType: 'students'
      }

      const mockResponse: DataPreviewResponse = {
        success: true,
        data: {
          type: 'students',
          totalRecords: 2,
          validRecords: 2,
          invalidRecords: 0,
          fieldMappings: requestData.fieldMappings,
          sampleData: requestData.data,
          validationErrors: []
        },
        message: 'Data preview successful'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await dataImportApi.previewData(requestData)

      expect(request.post).toHaveBeenCalledWith('/data-import/preview', requestData)
      expect(result).toEqual(mockResponse)
    })

    it('should preview data with validation errors', async () => {
      const requestData: DataPreviewRequest = {
        data: [
          { name: 'John Doe', age: 'invalid', class: 'A' },
          { name: '', age: 6, class: 'B' }
        ],
        fieldMappings: [
          { documentField: 'name', databaseField: 'name' },
          { documentField: 'age', databaseField: 'age' },
          { documentField: 'class', databaseField: 'class_name' }
        ],
        importType: 'students'
      }

      const mockResponse: DataPreviewResponse = {
        success: true,
        data: {
          type: 'students',
          totalRecords: 2,
          validRecords: 0,
          invalidRecords: 2,
          fieldMappings: requestData.fieldMappings,
          sampleData: requestData.data,
          validationErrors: [
            { row: 1, field: 'age', error: 'Invalid age format' },
            { row: 2, field: 'name', error: 'Name is required' }
          ]
        },
        message: 'Data validation completed with errors'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await dataImportApi.previewData(requestData)

      expect(request.post).toHaveBeenCalledWith('/data-import/preview', requestData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('executeImport', () => {
    it('should execute import successfully', async () => {
      const requestData: ImportExecutionRequest = {
        data: [
          { name: 'John Doe', age: 5, class: 'A' },
          { name: 'Jane Smith', age: 6, class: 'B' }
        ],
        fieldMappings: [
          { documentField: 'name', databaseField: 'name' },
          { documentField: 'age', databaseField: 'age' },
          { documentField: 'class', databaseField: 'class_name' }
        ],
        importType: 'students'
      }

      const mockResponse: ImportExecutionResponse = {
        success: true,
        data: {
          success: true,
          totalRecords: 2,
          successCount: 2,
          failureCount: 0,
          errors: [],
          insertedIds: [101, 102]
        },
        message: 'Data imported successfully'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await dataImportApi.executeImport(requestData)

      expect(request.post).toHaveBeenCalledWith('/data-import/execute', requestData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle import with partial failures', async () => {
      const requestData: ImportExecutionRequest = {
        data: [
          { name: 'John Doe', age: 5, class: 'A' },
          { name: 'Duplicate Name', age: 6, class: 'B' }
        ],
        fieldMappings: [
          { documentField: 'name', databaseField: 'name' },
          { documentField: 'age', databaseField: 'age' },
          { documentField: 'class', databaseField: 'class_name' }
        ],
        importType: 'students'
      }

      const mockResponse: ImportExecutionResponse = {
        success: true,
        data: {
          success: false,
          totalRecords: 2,
          successCount: 1,
          failureCount: 1,
          errors: [
            { row: 2, error: 'Duplicate name entry' }
          ],
          insertedIds: [101]
        },
        message: 'Data imported with partial failures'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await dataImportApi.executeImport(requestData)

      expect(request.post).toHaveBeenCalledWith('/data-import/execute', requestData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle complete import failure', async () => {
      const requestData: ImportExecutionRequest = {
        data: [{ name: 'Invalid Data', age: 'invalid', class: 'A' }],
        fieldMappings: [
          { documentField: 'name', databaseField: 'name' },
          { documentField: 'age', databaseField: 'age' },
          { documentField: 'class', databaseField: 'class_name' }
        ],
        importType: 'students'
      }

      const mockResponse: ImportExecutionResponse = {
        success: false,
        data: {
          success: false,
          totalRecords: 1,
          successCount: 0,
          failureCount: 1,
          errors: [
            { row: 1, error: 'Invalid data format' }
          ],
          insertedIds: []
        },
        message: 'Import failed'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await dataImportApi.executeImport(requestData)

      expect(request.post).toHaveBeenCalledWith('/data-import/execute', requestData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getImportHistory', () => {
    it('should get import history without filters', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [
            {
              id: 1,
              importType: 'students',
              fileName: 'students.xlsx',
              totalRecords: 100,
              successCount: 95,
              failureCount: 5,
              status: 'completed',
              createdAt: '2024-01-01T10:00:00Z'
            }
          ],
          total: 1,
          page: 1,
          pageSize: 10
        },
        message: 'Import history retrieved successfully'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await dataImportApi.getImportHistory({})

      expect(request.get).toHaveBeenCalledWith('/data-import/history', { params: {} })
      expect(result).toEqual(mockResponse)
    })

    it('should get import history with filters', async () => {
      const params: ImportHistoryQuery = {
        page: 2,
        pageSize: 20,
        importType: 'teachers'
      }

      const mockResponse = {
        success: true,
        data: {
          items: [],
          total: 0,
          page: 2,
          pageSize: 20
        },
        message: 'No import history found'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await dataImportApi.getImportHistory(params)

      expect(request.get).toHaveBeenCalledWith('/data-import/history', { params })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getSupportedTypes', () => {
    it('should get supported import types successfully', async () => {
      const mockResponse: SupportedTypesResponse = {
        success: true,
        data: {
          supportedTypes: [
            { type: 'students', hasPermission: true, displayName: '学生信息' },
            { type: 'teachers', hasPermission: true, displayName: '教师信息' },
            { type: 'classes', hasPermission: false, displayName: '班级信息' }
          ],
          allTypes: [
            { type: 'students', hasPermission: true, displayName: '学生信息' },
            { type: 'teachers', hasPermission: true, displayName: '教师信息' },
            { type: 'classes', hasPermission: false, displayName: '班级信息' },
            { type: 'parents', hasPermission: false, displayName: '家长信息' }
          ]
        },
        message: 'Supported types retrieved successfully'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await dataImportApi.getSupportedTypes()

      expect(request.get).toHaveBeenCalledWith('/data-import/supported-types')
      expect(result).toEqual(mockResponse)
    })

    it('should handle empty supported types', async () => {
      const mockResponse: SupportedTypesResponse = {
        success: true,
        data: {
          supportedTypes: [],
          allTypes: []
        },
        message: 'No supported types available'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await dataImportApi.getSupportedTypes()

      expect(request.get).toHaveBeenCalledWith('/data-import/supported-types')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const error = new Error('Network Error')
      vi.mocked(request.post).mockRejectedValue(error)

      await expect(dataImportApi.checkPermission({ importType: 'students' })).rejects.toThrow('Network Error')
    })

    it('should handle timeout errors', async () => {
      const error = new Error('Request timeout')
      vi.mocked(request.get).mockRejectedValue(error)

      await expect(dataImportApi.getSchema('students')).rejects.toThrow('Request timeout')
    })

    it('should handle server errors gracefully', async () => {
      const error = new Error('Internal Server Error')
      vi.mocked(request.post).mockRejectedValue(error)

      await expect(dataImportApi.executeImport({
        data: [],
        fieldMappings: [],
        importType: 'students'
      })).rejects.toThrow('Internal Server Error')
    })
  })

  describe('Type Safety', () => {
    it('should enforce correct request types', () => {
      const permissionRequest: ImportPermissionRequest = {
        importType: 'students'
      }
      expect(permissionRequest.importType).toBe('students')

      const parseRequest: ParseDocumentRequest = {
        filePath: '/test.xlsx',
        importType: 'students'
      }
      expect(parseRequest.filePath).toBe('/test.xlsx')
      expect(parseRequest.importType).toBe('students')
    })

    it('should handle correct response types', async () => {
      const mockResponse: ImportPermissionResponse = {
        success: true,
        data: {
          hasPermission: true,
          importType: 'students',
          userId: 1
        },
        message: 'Success'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await dataImportApi.checkPermission({ importType: 'students' })
      
      expect(result.success).toBe(true)
      expect(result.data.hasPermission).toBe(true)
      expect(result.data.importType).toBe('students')
      expect(result.data.userId).toBe(1)
      expect(result.message).toBe('Success')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty data arrays', async () => {
      const requestData: DataPreviewRequest = {
        data: [],
        fieldMappings: [],
        importType: 'students'
      }

      const mockResponse: DataPreviewResponse = {
        success: true,
        data: {
          type: 'students',
          totalRecords: 0,
          validRecords: 0,
          invalidRecords: 0,
          fieldMappings: [],
          sampleData: [],
          validationErrors: []
        },
        message: 'Empty data processed'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await dataImportApi.previewData(requestData)

      expect(result.data.totalRecords).toBe(0)
      expect(result.data.validRecords).toBe(0)
      expect(result.data.invalidRecords).toBe(0)
    })

    it('should handle malformed responses', async () => {
      vi.mocked(request.get).mockResolvedValue({ data: 'invalid response' })

      const result = await dataImportApi.getSchema('students')
      expect(result).toEqual({ data: 'invalid response' })
    })

    it('should handle null responses', async () => {
      vi.mocked(request.get).mockResolvedValue({ data: null })

      const result = await dataImportApi.getSchema('students')
      expect(result).toEqual({ data: null })
    })
  })
})