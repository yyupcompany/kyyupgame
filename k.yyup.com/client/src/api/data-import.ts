import request from '@/utils/request'

/**
 * 数据导入API接口
 */

export interface ImportPermissionRequest {
  importType: string
}

export interface ImportPermissionResponse {
  success: boolean
  data: {
    hasPermission: boolean
    importType: string
    userId: number
  }
  message: string
}

export interface ParseDocumentRequest {
  filePath: string
  importType: string
}

export interface ParseDocumentResponse {
  success: boolean
  data: {
    type: string
    data: any[]
    fields: string[]
    totalRecords: number
  }
  message: string
}

export interface FieldMappingRequest {
  documentFields: string[]
  importType: string
}

export interface FieldMappingResponse {
  success: boolean
  data: {
    fieldMappings: any[]
    databaseSchema: any
    documentFields: string[]
  }
  message: string
}

export interface DataPreviewRequest {
  data: any[]
  fieldMappings: any[]
  importType: string
}

export interface DataPreviewResponse {
  success: boolean
  data: {
    type: string
    totalRecords: number
    validRecords: number
    invalidRecords: number
    fieldMappings: any[]
    sampleData: any[]
    validationErrors: any[]
  }
  message: string
}

export interface ImportExecutionRequest {
  data: any[]
  fieldMappings: any[]
  importType: string
}

export interface ImportExecutionResponse {
  success: boolean
  data: {
    success: boolean
    totalRecords: number
    successCount: number
    failureCount: number
    errors: any[]
    insertedIds: number[]
  }
  message: string
}

export interface ImportHistoryQuery {
  page?: number
  pageSize?: number
  importType?: string
}

export interface SupportedTypesResponse {
  success: boolean
  data: {
    supportedTypes: Array<{
      type: string
      hasPermission: boolean
      displayName: string
    }>
    allTypes: Array<{
      type: string
      hasPermission: boolean
      displayName: string
    }>
  }
  message: string
}

export const dataImportApi = {
  /**
   * 检查数据导入权限
   */
  async checkPermission(data: ImportPermissionRequest): Promise<ImportPermissionResponse> {
    const response = await request.post('/api/data-import/check-permission', data)
    return {
      success: response.success,
      data: response.data!,
      message: response.message || ''
    }
  },

  /**
   * 解析上传的文档
   */
  async parseDocument(data: ParseDocumentRequest): Promise<ParseDocumentResponse> {
    const response = await request.post('/api/data-import/parse', data)
    return {
      success: response.success,
      data: response.data!,
      message: response.message || ''
    }
  },

  /**
   * 获取数据库表结构
   */
  getSchema(type: string): Promise<any> {
    return request.get(`/data-import/schema/${type}`)
  },

  /**
   * 生成字段映射建议
   */
  async generateMapping(data: FieldMappingRequest): Promise<FieldMappingResponse> {
    const response = await request.post('/api/data-import/mapping', data)
    return {
      success: response.success,
      data: response.data!,
      message: response.message || ''
    }
  },

  /**
   * 数据预览和验证
   */
  async previewData(data: DataPreviewRequest): Promise<DataPreviewResponse> {
    const response = await request.post('/api/data-import/preview', data)
    return {
      success: response.success,
      data: response.data!,
      message: response.message || ''
    }
  },

  /**
   * 执行数据导入
   */
  async executeImport(data: ImportExecutionRequest): Promise<ImportExecutionResponse> {
    const response = await request.post('/api/data-import/execute', data)
    return {
      success: response.success,
      data: response.data!,
      message: response.message || ''
    }
  },

  /**
   * 获取导入历史记录
   */
  getImportHistory(params: ImportHistoryQuery): Promise<any> {
    return request.get('/api/data-import/history', { params })
  },

  /**
   * 获取支持的导入类型
   */
  async getSupportedTypes(): Promise<SupportedTypesResponse> {
    const response = await request.get('/api/data-import/supported-types')
    return {
      success: response.success,
      data: response.data!,
      message: response.message || ''
    }
  }
}

export default dataImportApi
