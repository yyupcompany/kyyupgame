/**
 * 批量导入API
 */

import { request } from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import { API_PREFIX } from '../endpoints/base'

// API端点常量
const BATCH_IMPORT_ENDPOINTS = {
  PREVIEW: `${API_PREFIX}/batch-import/preview`,
  EXECUTE: `${API_PREFIX}/batch-import/execute`,
  TEMPLATE: (entityType: string) => `${API_PREFIX}/batch-import/template/${entityType}`
} as const

/**
 * 预览导入数据
 */
export async function previewImport(file: File, entityType: string): Promise<ApiResponse<any>> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('entityType', entityType)

  return request.post(BATCH_IMPORT_ENDPOINTS.PREVIEW, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 执行批量导入
 */
export async function executeImport(entityType: string, data: any[]): Promise<ApiResponse<any>> {
  return request.post(BATCH_IMPORT_ENDPOINTS.EXECUTE, {
    entityType,
    data
  })
}

/**
 * 下载导入模板
 */
export async function downloadTemplate(entityType: string): Promise<void> {
  const response = await request.get(BATCH_IMPORT_ENDPOINTS.TEMPLATE(entityType), {
    responseType: 'blob'
  })

  // 创建下载链接
  const blob = new Blob([response as any], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${entityType}_import_template.xlsx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

// 导出API对象
export const batchImportApi = {
  previewImport,
  executeImport,
  downloadTemplate
}

