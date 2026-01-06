import { get, post, put, del } from '@/utils/request'
import { API_PREFIX } from '../endpoints/base'

// Role 相关API接口

// API端点常量
export const ROLE_ENDPOINTS = {
  BASE: `${API_PREFIX}/roles`,
  BY_ID: (id: number | string) => `${API_PREFIX}/roles/${id}`,
  BATCH_DELETE: `${API_PREFIX}/roles/batch-delete`,
  SEARCH: `${API_PREFIX}/roles/search`,
  EXPORT: `${API_PREFIX}/roles/export`,
  IMPORT: `${API_PREFIX}/roles/import`
} as const

// 获取Role列表
export const getRoleList = (params?: any) => {
  return get(ROLE_ENDPOINTS.BASE, params)
}

// 获取Role详情
export const getRoleDetail = (id: number | string) => {
  return get(ROLE_ENDPOINTS.BY_ID(id))
}

// 创建Role
export const createRole = (data: any) => {
  return post(ROLE_ENDPOINTS.BASE, data)
}

// 更新Role
export const updateRole = (id: number | string, data: any) => {
  return put(ROLE_ENDPOINTS.BY_ID(id), data)
}

// 删除Role
export const deleteRole = (id: number | string) => {
  return del(ROLE_ENDPOINTS.BY_ID(id))
}

// 批量删除Role
export const batchDeleteRole = (ids: number[]) => {
  return post(ROLE_ENDPOINTS.BATCH_DELETE, { ids })
}

// 搜索Role
export const searchRole = (keyword: string) => {
  return get(ROLE_ENDPOINTS.SEARCH, { params: { keyword } })
}

// 导出Role
export const exportRole = (params?: any) => {
  return get(ROLE_ENDPOINTS.EXPORT, params)
}

// 导入Role
export const importRole = (data: any) => {
  return post(ROLE_ENDPOINTS.IMPORT, data)
}