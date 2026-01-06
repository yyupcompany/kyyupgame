import { get, post, put, del } from '@/utils/request'
import { API_PREFIX } from '../endpoints/base'

// Permission 相关API接口

// API端点常量
export const PERMISSION_ENDPOINTS = {
  BASE: `${API_PREFIX}/permissions`,
  BY_ID: (id: number | string) => `${API_PREFIX}/permissions/${id}`,
  BATCH_DELETE: `${API_PREFIX}/permissions/batch-delete`,
  SEARCH: `${API_PREFIX}/permissions/search`,
  EXPORT: `${API_PREFIX}/permissions/export`,
  IMPORT: `${API_PREFIX}/permissions/import`
} as const

// 获取Permission列表
export const getPermissionList = (params?: any) => {
  return get(PERMISSION_ENDPOINTS.BASE, params)
}

// 获取Permission详情
export const getPermissionDetail = (id: number | string) => {
  return get(PERMISSION_ENDPOINTS.BY_ID(id))
}

// 创建Permission
export const createPermission = (data: any) => {
  return post(PERMISSION_ENDPOINTS.BASE, data)
}

// 更新Permission
export const updatePermission = (id: number | string, data: any) => {
  return put(PERMISSION_ENDPOINTS.BY_ID(id), data)
}

// 删除Permission
export const deletePermission = (id: number | string) => {
  return del(PERMISSION_ENDPOINTS.BY_ID(id))
}

// 批量删除Permission
export const batchDeletePermission = (ids: number[]) => {
  return post(PERMISSION_ENDPOINTS.BATCH_DELETE, { ids })
}

// 搜索Permission
export const searchPermission = (keyword: string) => {
  return get(PERMISSION_ENDPOINTS.SEARCH, { params: { keyword } })
}

// 导出Permission
export const exportPermission = (params?: any) => {
  return get(PERMISSION_ENDPOINTS.EXPORT, params)
}

// 导入Permission
export const importPermission = (data: any) => {
  return post(PERMISSION_ENDPOINTS.IMPORT, data)
}