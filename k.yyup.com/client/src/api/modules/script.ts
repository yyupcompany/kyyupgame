import { request } from '@/utils/request';
import { API_PREFIX } from '../endpoints/base';

// API端点常量
export const SCRIPT_ENDPOINTS = {
  BASE: `${API_PREFIX}/scripts`,
  STATS: `${API_PREFIX}/scripts/stats`,
  CATEGORIES: `${API_PREFIX}/script-categories`,
  CATEGORIES_SORT: `${API_PREFIX}/script-categories/sort`,
  CATEGORIES_STATS: `${API_PREFIX}/script-categories/stats`,
  CATEGORIES_INIT: `${API_PREFIX}/script-categories/init-default`
} as const

/**
 * 话术类型枚举
 */
export enum ScriptType {
  ENROLLMENT = 'enrollment',    // 招生话术
  PHONE = 'phone',             // 电话话术
  RECEPTION = 'reception',     // 接待话术
  FOLLOWUP = 'followup',       // 跟进话术
  CONSULTATION = 'consultation', // 咨询话术
  OBJECTION = 'objection'      // 异议处理话术
}

/**
 * 话术状态枚举
 */
export enum ScriptStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft'
}

/**
 * 话术分类接口
 */
export interface ScriptCategory {
  id: number;
  name: string;
  description?: string;
  type: ScriptType;
  color?: string;
  icon?: string;
  sort: number;
  status: ScriptStatus;
  scriptCount?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 话术接口
 */
export interface Script {
  id: number;
  title: string;
  content: string;
  categoryId: number;
  type: ScriptType;
  tags: string[];
  keywords: string[];
  description?: string;
  usageCount: number;
  effectiveScore?: number;
  status: ScriptStatus;
  isTemplate: boolean;
  variables?: any;
  category?: ScriptCategory;
  creator?: {
    id: number;
    username: string;
    realName: string;
  };
  updater?: {
    id: number;
    username: string;
    realName: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * 话术使用记录接口
 */
export interface ScriptUsage {
  id: number;
  scriptId: number;
  userId: number;
  usageContext?: string;
  effectiveRating?: number;
  feedback?: string;
  usageDate: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 话术统计接口
 */
export interface ScriptStats {
  totalScripts: number;
  totalUsages: number;
  scriptsByType: Array<{
    type: string;
    count: number;
  }>;
  popularScripts: Array<{
    id: number;
    title: string;
    usageCount: number;
    effectiveScore?: number;
  }>;
  usageTrend: Array<{
    date: string;
    count: number;
  }>;
}

/**
 * 查询参数接口
 */
export interface ScriptQuery {
  page?: number;
  limit?: number;
  categoryId?: number;
  type?: ScriptType;
  status?: ScriptStatus;
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CategoryQuery {
  type?: ScriptType;
  status?: ScriptStatus;
  includeCount?: boolean;
}

/**
 * 创建话术参数接口
 */
export interface CreateScriptData {
  title: string;
  content: string;
  categoryId: number;
  type: ScriptType;
  tags?: string[];
  keywords?: string[];
  description?: string;
  isTemplate?: boolean;
  variables?: any;
}

/**
 * 更新话术参数接口
 */
export interface UpdateScriptData {
  title?: string;
  content?: string;
  categoryId?: number;
  type?: ScriptType;
  tags?: string[];
  keywords?: string[];
  description?: string;
  status?: ScriptStatus;
  isTemplate?: boolean;
  variables?: any;
}

/**
 * 创建分类参数接口
 */
export interface CreateCategoryData {
  name: string;
  description?: string;
  type: ScriptType;
  color?: string;
  icon?: string;
  sort?: number;
}

/**
 * 更新分类参数接口
 */
export interface UpdateCategoryData {
  name?: string;
  description?: string;
  type?: ScriptType;
  color?: string;
  icon?: string;
  sort?: number;
  status?: ScriptStatus;
}

/**
 * 使用话术参数接口
 */
export interface UseScriptData {
  usageContext?: string;
  effectiveRating?: number;
  feedback?: string;
}

/**
 * API响应接口
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

/**
 * 分页响应接口
 */
export interface PaginatedResponse<T> {
  scripts: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * 话术API类
 */
export class ScriptAPI {
  
  // ==================== 话术管理 ====================
  
  /**
   * 获取话术列表
   */
  static async getScripts(params?: ScriptQuery): Promise<ApiResponse<PaginatedResponse<Script>>> {
    const response = await request.get(SCRIPT_ENDPOINTS.BASE, { params });
    return response.data;
  }

  /**
   * 获取话术详情
   */
  static async getScriptById(id: number): Promise<ApiResponse<Script>> {
    const response = await request.get(`/scripts/${id}`);
    return response.data;
  }

  /**
   * 创建话术
   */
  static async createScript(data: CreateScriptData): Promise<ApiResponse<Script>> {
    const response = await request.post(SCRIPT_ENDPOINTS.BASE, data);
    return response.data;
  }

  /**
   * 更新话术
   */
  static async updateScript(id: number, data: UpdateScriptData): Promise<ApiResponse<Script>> {
    const response = await request.put(`/scripts/${id}`, data);
    return response.data;
  }

  /**
   * 删除话术
   */
  static async deleteScript(id: number): Promise<ApiResponse<null>> {
    const response = await request.delete(`/scripts/${id}`);
    return response.data;
  }

  /**
   * 使用话术（记录使用次数）
   */
  static async useScript(id: number, data?: UseScriptData): Promise<ApiResponse<null>> {
    const response = await request.post(`/scripts/${id}/use`, data);
    return response.data;
  }

  /**
   * 获取话术统计
   */
  static async getScriptStats(timeRange?: number): Promise<ApiResponse<ScriptStats>> {
    const response = await request.get(SCRIPT_ENDPOINTS.STATS, {
      params: { timeRange }
    });
    return response.data;
  }

  // ==================== 话术分类管理 ====================

  /**
   * 获取话术分类列表
   */
  static async getCategories(params?: CategoryQuery): Promise<ApiResponse<ScriptCategory[]>> {
    const response = await request.get(SCRIPT_ENDPOINTS.CATEGORIES, { params });
    return response.data;
  }

  /**
   * 获取话术分类详情
   */
  static async getCategoryById(id: number): Promise<ApiResponse<ScriptCategory>> {
    const response = await request.get(`/script-categories/${id}`);
    return response.data;
  }

  /**
   * 创建话术分类
   */
  static async createCategory(data: CreateCategoryData): Promise<ApiResponse<ScriptCategory>> {
    const response = await request.post(SCRIPT_ENDPOINTS.CATEGORIES, data);
    return response.data;
  }

  /**
   * 更新话术分类
   */
  static async updateCategory(id: number, data: UpdateCategoryData): Promise<ApiResponse<ScriptCategory>> {
    const response = await request.put(`/script-categories/${id}`, data);
    return response.data;
  }

  /**
   * 删除话术分类
   */
  static async deleteCategory(id: number): Promise<ApiResponse<null>> {
    const response = await request.delete(`/script-categories/${id}`);
    return response.data;
  }

  /**
   * 批量更新分类排序
   */
  static async updateCategoriesSort(categories: Array<{ id: number; sort: number }>): Promise<ApiResponse<null>> {
    const response = await request.put(SCRIPT_ENDPOINTS.CATEGORIES_SORT, { categories });
    return response.data;
  }

  /**
   * 获取分类统计信息
   */
  static async getCategoryStats(): Promise<ApiResponse<any>> {
    const response = await request.get(SCRIPT_ENDPOINTS.CATEGORIES_STATS);
    return response.data;
  }

  /**
   * 初始化默认分类
   */
  static async initDefaultCategories(): Promise<ApiResponse<ScriptCategory[]>> {
    const response = await request.post(SCRIPT_ENDPOINTS.CATEGORIES_INIT);
    return response.data;
  }
}

// 导出便捷方法
export const {
  getScripts,
  getScriptById,
  createScript,
  updateScript,
  deleteScript,
  useScript,
  getScriptStats,
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoriesSort,
  getCategoryStats,
  initDefaultCategories
} = ScriptAPI;

export default ScriptAPI;
