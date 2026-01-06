import { request } from '@/utils/request';

/**
 * 文档模板API
 */

export interface TemplateListParams {
  page?: number;
  pageSize?: number;
  category?: string;
  subCategory?: string;
  frequency?: string;
  priority?: string;
  keyword?: string;
  isDetailed?: boolean;
  sortBy?: string;
  sortOrder?: string;
}

export interface Template {
  id: number;
  code: string;
  name: string;
  description?: string;
  category: string;
  subCategory?: string;
  contentType: string;
  templateContent: string;
  variables?: Record<string, any>;
  defaultValues?: Record<string, any>;
  frequency?: string;
  priority: string;
  inspectionTypeIds?: number[];
  relatedTemplateIds?: number[];
  isDetailed: boolean;
  lineCount?: number;
  estimatedFillTime?: number;
  isActive: boolean;
  version: string;
  useCount: number;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateListResponse {
  items: Template[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Category {
  code: string;
  name: string;
  count: number;
}

export interface CategoriesResponse {
  categories: Category[];
  total: number;
}

export interface SearchResult {
  keyword: string;
  results: Template[];
  count: number;
}

export interface RecommendResult {
  recentUsed?: Template[];
  frequentUsed?: Template[];
  upcoming?: Template[];
}

/**
 * 获取模板列表
 */
export function getTemplates(params?: TemplateListParams) {
  return request.get<TemplateListResponse>('/api/document-templates', { params });
}

/**
 * 获取模板详情
 */
export function getTemplateById(id: number | string) {
  return request.get<Template>(`/api/document-templates/${id}`);
}

/**
 * 搜索模板
 */
export function searchTemplates(keyword: string, limit?: number) {
  return request.get<SearchResult>('/api/document-templates/search', {
    params: { keyword, limit }
  });
}

/**
 * 获取分类列表
 */
export function getCategories() {
  return request.get<CategoriesResponse>('/api/document-templates/categories');
}

/**
 * 获取推荐模板
 */
export function getRecommendTemplates(type?: 'recent' | 'frequent' | 'upcoming' | 'all', limit?: number) {
  return request.get<RecommendResult>('/api/document-templates/recommend', {
    params: { type, limit }
  });
}

