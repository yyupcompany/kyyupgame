/**
 * API入口文件 - Main API Entry File
 * 统一导出所有API模块 - Unified export for all API modules
 */

// 认证相关API
export * from './modules/auth'

// 仪表盘API
export * from './modules/dashboard'

// 学生管理API
export * from './modules/student'

// 教师管理API  
export * from './modules/teacher'

// 家长管理API
export * from './modules/parent'

// 班级管理API
export * from './modules/class'

// 活动管理API - 使用命名空间避免冲突
export * as ActivityModule from './modules/activity'

// 招生管理API
export * from './modules/enrollment'

// 客户管理API - 使用命名空间避免冲突
export * as CustomerModule from './modules/customer'

// 统计分析API - 使用命名空间避免冲突
export * as StatisticsModule from './modules/statistics'

// 申请管理API
export * from './modules/application'

// AI功能API
export * from './modules/ai'

// 聊天系统API
export * from './modules/chat'

// 广告管理API
export * from './modules/advertisement'

// 系统配置API
export * from './modules/system'

// 通用API类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  sort?: string;
}

export interface PaginationResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// API错误处理
export class ApiError extends Error {
  code: number;
  response?: any;

  constructor(message: string, code: number, response?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.response = response;
  }
}

// API配置常量 - 修复双API前缀问题
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
  TIMEOUT: 10000,
  RETRY_COUNT: 3
} as const;