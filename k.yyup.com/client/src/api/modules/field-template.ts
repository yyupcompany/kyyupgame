/**
 * 字段模板API
 */

import { request } from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import { API_PREFIX } from '../endpoints/base'

// 字段模板API端点
const FIELD_TEMPLATE_ENDPOINTS = {
  BASE: `${API_PREFIX}/field-templates`,
  BY_ID: (id: number) => `${API_PREFIX}/field-templates/${id}`,
  APPLY: (id: number) => `${API_PREFIX}/field-templates/${id}/apply`,
  POPULAR: (entityType: string) => `${API_PREFIX}/field-templates/popular/${entityType}`,
  RECENT: `${API_PREFIX}/field-templates/recent`
} as const

/**
 * 字段模板接口
 */
export interface FieldTemplate {
  id: number
  name: string
  description?: string
  entity_type: string
  field_values: Record<string, any>
  user_id: number
  is_public: boolean
  usage_count: number
  created_at: string
  updated_at: string
}

/**
 * 模板列表查询参数
 */
export interface TemplateListParams {
  entityType?: string
  isPublic?: boolean
  page?: number
  pageSize?: number
  keyword?: string
}

/**
 * 创建字段模板
 */
export async function createTemplate(data: {
  name: string
  description?: string
  entityType: string
  fieldValues: Record<string, any>
  isPublic?: boolean
}): Promise<ApiResponse<FieldTemplate>> {
  return request.post(FIELD_TEMPLATE_ENDPOINTS.BASE, data)
}

/**
 * 获取模板列表
 */
export async function getTemplateList(params?: TemplateListParams): Promise<ApiResponse<{
  items: FieldTemplate[]
  total: number
  page: number
  pageSize: number
}>> {
  return request.get(FIELD_TEMPLATE_ENDPOINTS.BASE, { params })
}

/**
 * 获取模板详情
 */
export async function getTemplateById(id: number): Promise<ApiResponse<FieldTemplate>> {
  return request.get(FIELD_TEMPLATE_ENDPOINTS.BY_ID(id))
}

/**
 * 应用模板
 */
export async function applyTemplate(id: number): Promise<ApiResponse<Record<string, any>>> {
  return request.post(FIELD_TEMPLATE_ENDPOINTS.APPLY(id))
}

/**
 * 更新模板
 */
export async function updateTemplate(id: number, data: {
  name?: string
  description?: string
  fieldValues?: Record<string, any>
  isPublic?: boolean
}): Promise<ApiResponse<FieldTemplate>> {
  return request.put(FIELD_TEMPLATE_ENDPOINTS.BY_ID(id), data)
}

/**
 * 删除模板
 */
export async function deleteTemplate(id: number): Promise<ApiResponse<void>> {
  return request.delete(FIELD_TEMPLATE_ENDPOINTS.BY_ID(id))
}

/**
 * 获取热门模板
 */
export async function getPopularTemplates(entityType: string, limit?: number): Promise<ApiResponse<FieldTemplate[]>> {
  return request.get(FIELD_TEMPLATE_ENDPOINTS.POPULAR(entityType), {
    params: { limit }
  })
}

/**
 * 获取最近使用的模板
 */
export async function getRecentTemplates(entityType?: string, limit?: number): Promise<ApiResponse<FieldTemplate[]>> {
  return request.get(FIELD_TEMPLATE_ENDPOINTS.RECENT, {
    params: { entityType, limit }
  })
}

// 导出API对象
export const fieldTemplateApi = {
  createTemplate,
  getTemplateList,
  getTemplateById,
  applyTemplate,
  updateTemplate,
  deleteTemplate,
  getPopularTemplates,
  getRecentTemplates
}

