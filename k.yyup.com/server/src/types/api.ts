/**
 * API响应类型定义
 */

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export class ApiResponse<T = any> {
  static success<T>(data?: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message: message || '操作成功'
    }
  }

  static error(message: string, data?: any): ApiResponse {
    return {
      success: false,
      message,
      error: message,
      data
    }
  }
}