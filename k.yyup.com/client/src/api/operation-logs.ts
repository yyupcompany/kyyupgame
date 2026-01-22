import request from '@/utils/request'

/**
 * 操作日志API接口
 */

export interface OperationLogQuery {
  page?: number
  pageSize?: number
  module?: string
  operationType?: string
  startTime?: string
  endTime?: string
  userId?: number
  keyword?: string
}

export interface OperationLog {
  id: number
  userId: number | null
  module: string
  action: string
  operationType: string
  resourceType: string | null
  resourceId: string | null
  description: string | null
  requestMethod: string | null
  requestUrl: string | null
  requestParams: string | null
  requestIp: string | null
  userAgent: string | null
  deviceInfo: string | null
  operationResult: string
  resultMessage: string | null
  executionTime: number | null
  createdAt: string
  updatedAt: string
}

export interface OperationLogResponse {
  success: boolean
  data: {
    items: OperationLog[]
    total: number
    page: number
    pageSize: number
  }
  message: string
}

export interface OperationLogStatsResponse {
  success: boolean
  data: {
    totalLogs: number
    successLogs: number
    failureLogs: number
    todayLogs: number
    moduleStats: Array<{
      module: string
      count: number
    }>
    operationTypeStats: Array<{
      operationType: string
      count: number
    }>
  }
  message: string
}

/**
 * 获取操作日志列表
 */
export const getOperationLogs = (params: OperationLogQuery): Promise<OperationLogResponse> => {
  return request.get('/api/operation-logs', { params })
}

/**
 * 获取操作日志详情
 */
export const getOperationLogDetail = (id: number): Promise<any> => {
  return request.get(`/operation-logs/${id}`)
}

/**
 * 获取操作日志统计
 */
export const getOperationLogStats = (): Promise<OperationLogStatsResponse> => {
  return request.get('/api/operation-logs/stats')
}

/**
 * 导出操作日志
 */
export const exportOperationLogs = async (params: OperationLogQuery): Promise<Blob> => {
  const response: any = await request.get('/api/operation-logs/export', { 
    params,
    responseType: 'blob'
  })
  return response.data || response
}

/**
 * 删除操作日志
 */
export const deleteOperationLog = (id: number): Promise<any> => {
  return request.delete(`/operation-logs/${id}`)
}

/**
 * 批量删除操作日志
 */
export const batchDeleteOperationLogs = (ids: number[]): Promise<any> => {
  return request.post('/api/operation-logs/batch-delete', { ids })
}

/**
 * 清理过期日志
 */
export const cleanExpiredLogs = (days: number): Promise<any> => {
  return request.post('/api/operation-logs/clean', { days })
}

export default {
  getOperationLogs,
  getOperationLogDetail,
  getOperationLogStats,
  exportOperationLogs,
  deleteOperationLog,
  batchDeleteOperationLogs,
  cleanExpiredLogs
}
