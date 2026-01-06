/**
 * API响应数据格式处理工具
 * 
 * 解决后端API响应格式不一致的问题
 * 支持多种常见的API响应格式，统一处理为前端期望的格式
 */

export interface StandardListResponse<T = any> {
  data: T[]
  total: number
  page?: number
  pageSize?: number
  totalPages?: number
}

/**
 * 处理列表类型的API响应，统一格式
 * @param response API响应数据
 * @returns 标准化的列表响应格式
 */
export function handleListResponse<T = any>(response: any): StandardListResponse<T> {
  // 如果响应为空或无效
  if (!response) {
    return {
      data: [],
      total: 0
    }
  }

  // 情况1: 标准格式 { data: [], pagination: {} }
  if (Array.isArray(response.data) && response.pagination) {
    return {
      data: response.data,
      total: response.pagination.total || 0,
      page: response.pagination.page,
      pageSize: response.pagination.pageSize,
      totalPages: response.pagination.totalPages
    }
  }

  // 情况2: 嵌套格式 { data: { data: [], pagination: {} } }
  if (response.data && typeof response.data === 'object') {
    const nestedData = response.data

    // 子情况2.1: { data: { data: [], pagination: {} } }
    if (Array.isArray(nestedData.data) && nestedData.pagination) {
      return {
        data: nestedData.data,
        total: nestedData.pagination.total || 0,
        page: nestedData.pagination.page,
        pageSize: nestedData.pagination.pageSize,
        totalPages: nestedData.pagination.totalPages
      }
    }

    // 子情况2.2: { data: { items: [], total: number } }
    if (Array.isArray(nestedData.items)) {
      return {
        data: nestedData.items,
        total: nestedData.total || 0,
        page: nestedData.page,
        pageSize: nestedData.pageSize,
        totalPages: nestedData.totalPages
      }
    }

    // 子情况2.3: { data: { list: [], total: number } }
    if (Array.isArray(nestedData.list)) {
      return {
        data: nestedData.list,
        total: nestedData.total || 0,
        page: nestedData.page,
        pageSize: nestedData.pageSize,
        totalPages: nestedData.totalPages
      }
    }

    // 子情况2.4: { data: { tasks: [], pagination: {} } }
    if (Array.isArray(nestedData.tasks) && nestedData.pagination) {
      return {
        data: nestedData.tasks,
        total: nestedData.pagination.total || 0,
        page: nestedData.pagination.page,
        pageSize: nestedData.pagination.pageSize,
        totalPages: nestedData.pagination.totalPages
      }
    }

    // 子情况2.5: { data: { tasks: [], total: number } }
    if (Array.isArray(nestedData.tasks)) {
      return {
        data: nestedData.tasks,
        total: nestedData.total || nestedData.tasks.length,
        page: nestedData.page,
        pageSize: nestedData.pageSize,
        totalPages: nestedData.totalPages
      }
    }
  }

  // 情况3: 直接数组格式 []
  if (Array.isArray(response)) {
    return {
      data: response,
      total: response.length
    }
  }

  // 情况4: 直接items字段 { items: [], total: number }
  if (Array.isArray(response.items)) {
    return {
      data: response.items,
      total: response.total || response.items.length,
      page: response.page,
      pageSize: response.pageSize,
      totalPages: response.totalPages
    }
  }

  // 情况5: 直接数组在data字段 { data: [] }
  if (Array.isArray(response.data)) {
    return {
      data: response.data,
      total: response.total || response.data.length
    }
  }

  // 情况6: 其他未知格式，返回空数组
  console.warn('⚠️ 未知的API响应格式，使用空数组:', response)
  return {
    data: [],
    total: 0
  }
}

/**
 * 处理单个对象类型的API响应
 * @param response API响应数据
 * @returns 标准化的对象响应
 */
export function handleObjectResponse<T = any>(response: any): T | null {
  if (!response) {
    return null
  }

  // 如果有data字段，返回data
  if (response.data !== undefined) {
    return response.data
  }

  // 否则返回整个响应
  return response
}

/**
 * 检查API响应是否成功
 * @param response API响应数据
 * @returns 是否成功
 */
export function isApiSuccess(response: any): boolean {
  if (!response) {
    return false
  }

  // 检查success字段
  if (typeof response.success === 'boolean') {
    return response.success
  }

  // 检查code字段（通常200表示成功）
  if (typeof response.code === 'number') {
    return response.code === 200
  }

  // 检查status字段
  if (typeof response.status === 'string') {
    return response.status === 'success'
  }

  // 默认认为有数据就是成功
  return response.data !== undefined
}

/**
 * 获取API响应的错误信息
 * @param response API响应数据
 * @returns 错误信息
 */
export function getApiErrorMessage(response: any): string {
  if (!response) {
    return '未知错误'
  }

  // 检查error字段
  if (response.error) {
    if (typeof response.error === 'string') {
      return response.error
    }
    if (response.error.message) {
      return response.error.message
    }
  }

  // 检查message字段
  if (response.message) {
    return response.message
  }

  return '操作失败'
}

/**
 * 统一的API响应处理函数
 * @param response API响应数据
 * @param options 处理选项
 * @returns 处理后的数据
 */
export function handleApiResponse<T = any>(
  response: any,
  options: {
    type: 'list' | 'object'
    defaultValue?: any
    throwOnError?: boolean
  } = { type: 'object' }
): any {
  // 检查响应是否成功
  if (!isApiSuccess(response)) {
    const errorMessage = getApiErrorMessage(response)
    
    if (options.throwOnError) {
      throw new Error(errorMessage)
    }
    
    console.warn('API响应失败:', errorMessage)
    return options.defaultValue || (options.type === 'list' ? { data: [], total: 0 } : null)
  }

  // 根据类型处理响应
  if (options.type === 'list') {
    return handleListResponse<T>(response)
  } else {
    return handleObjectResponse<T>(response)
  }
}
