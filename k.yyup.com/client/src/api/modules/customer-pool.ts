import { get, ApiResponse } from '@/utils/request'
import { API_PREFIX } from '@/api/endpoints'

/**
 * 客户池查询参数
 */
export interface CustomerPoolQueryParams {
  assignmentStatus?: 'unassigned' | 'mine' | 'assigned' | ''
  source?: 'online' | 'phone' | 'onsite' | 'referral' | ''
  keyword?: string
  page?: number
  pageSize?: number
}

/**
 * 客户池客户信息
 */
export interface CustomerPoolCustomer {
  id: number
  name: string
  phone: string
  source: string
  assigned_teacher_id?: number | null
  assignmentStatus: 'unassigned' | 'mine' | 'assigned'
  assignedTeacherName?: string
  createdAt: string
  updatedAt?: string
}

/**
 * 客户池统计数据
 */
export interface CustomerPoolStats {
  total: number
  unassigned: number
  mine: number
  assigned: number
}

/**
 * 客户池响应
 */
export interface CustomerPoolResponse {
  items: CustomerPoolCustomer[]
  total: number
  page: number
  pageSize: number
  stats: CustomerPoolStats
}

/**
 * 客户池API
 */
export const customerPoolApi = {
  /**
   * 获取客户池列表（包括分配状态）
   */
  getCustomers(params?: CustomerPoolQueryParams): Promise<ApiResponse<CustomerPoolResponse>> {
    return get(`${API_PREFIX}/teacher/customer-pool`, { params })
  },

  /**
   * 获取客户池统计数据
   */
  getStats(): Promise<ApiResponse<CustomerPoolStats>> {
    return get(`${API_PREFIX}/teacher/customer-pool/stats`)
  },

  /**
   * 根据ID获取客户详情
   */
  getCustomerById(id: number): Promise<ApiResponse<CustomerPoolCustomer>> {
    return get(`${API_PREFIX}/teacher/customer-pool/${id}`)
  },

  /**
   * 搜索客户
   */
  searchCustomers(keyword: string, params?: Omit<CustomerPoolQueryParams, 'keyword'>): Promise<ApiResponse<CustomerPoolResponse>> {
    return get(`${API_PREFIX}/teacher/customer-pool/search`, {
      params: { keyword, ...params }
    })
  }
}

// 兼容性导出
export const getCustomerPoolCustomers = customerPoolApi.getCustomers
export const getCustomerPoolStats = customerPoolApi.getStats
export const getCustomerPoolCustomerById = customerPoolApi.getCustomerById
export const searchCustomerPoolCustomers = customerPoolApi.searchCustomers