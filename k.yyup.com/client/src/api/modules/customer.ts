import { get, post, put, del, ApiResponse } from '@/utils/request';
import { API_PREFIX } from '@/api/endpoints';

/**
 * 客户类型
 */
export enum CustomerType {
  POTENTIAL = 'POTENTIAL',
  ENROLLED = 'ENROLLED',
  GRADUATED = 'GRADUATED'
}

/**
 * 客户状态
 */
export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLACKLISTED = 'BLACKLISTED'
}

/**
 * 客户信息接口
 */
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  type: CustomerType;
  status: CustomerStatus;
  source: string;
  notes?: string;
  children?: Array<{
    name: string;
    age: number;
    gender: 'male' | 'female';
  }>;
  createdAt: string;
  updatedAt: string;
}

/**
 * 客户查询参数
 */
export interface CustomerQueryParams {
  page?: number;
  pageSize?: number;
  name?: string;
  phone?: string;
  type?: CustomerType;
  status?: CustomerStatus;
  source?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * 创建客户请求
 */
export interface CreateCustomerRequest {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  type: CustomerType;
  source: string;
  notes?: string;
  children?: Array<{
    name: string;
    age: number;
    gender: 'male' | 'female';
  }>;
}

/**
 * 客户管理API
 */
export const customerApi = {
  /**
   * 获取客户列表
   */
  getCustomers(params?: CustomerQueryParams): Promise<ApiResponse<{
    items: Customer[];
    total: number;
    page: number;
    pageSize: number;
  }>> {
    return get(`${API_PREFIX}/customers`, { params });
  },

  /**
   * 获取客户详情
   */
  getCustomer(id: string): Promise<ApiResponse<Customer>> {
    return get(`${API_PREFIX}/customers/${id}`);
  },

  /**
   * 创建客户
   */
  createCustomer(data: CreateCustomerRequest): Promise<ApiResponse<Customer>> {
    return post(`${API_PREFIX}/customers`, data);
  },

  /**
   * 更新客户
   */
  updateCustomer(id: string, data: Partial<CreateCustomerRequest>): Promise<ApiResponse<Customer>> {
    return put(`${API_PREFIX}/customers/${id}`, data);
  },

  /**
   * 删除客户
   */
  deleteCustomer(id: string): Promise<ApiResponse> {
    return del(`${API_PREFIX}/customers/${id}`);
  },

  /**
   * 获取客户统计
   */
  getCustomerStats(): Promise<ApiResponse<{
    total: number;
    byType: Record<CustomerType, number>;
    byStatus: Record<CustomerStatus, number>;
    bySource: Record<string, number>;
  }>> {
    return get(`${API_PREFIX}/customers/stats`);
  },

  /**
   * 批量导入客户
   */
  importCustomers(file: File): Promise<ApiResponse<{
    success: number;
    failed: number;
    errors: string[];
  }>> {
    const formData = new FormData();
    formData.append('file', file);
    return post(`${API_PREFIX}/customers/import`, formData);
  }
};

// 兼容性导出
export const getCustomers = customerApi.getCustomers;
export const getCustomer = customerApi.getCustomer;
export const createCustomer = customerApi.createCustomer;
export const updateCustomer = customerApi.updateCustomer;
export const deleteCustomer = customerApi.deleteCustomer;