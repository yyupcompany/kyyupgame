/**
 * 话术模板API接口
 */

import { request } from '@/utils/request';

// 话术模板接口类型
export interface ScriptTemplate {
  id: number;
  title: string;
  category: 'greeting' | 'introduction' | 'qa' | 'invitation' | 'closing' | 'other';
  keywords: string;
  content: string;
  priority: number;
  status: 'active' | 'inactive';
  usageCount: number;
  successRate: number;
  createdBy?: number;
  updatedBy?: number;
  createdAt?: string;
  updatedAt?: string;
}

// 话术模板列表查询参数
export interface ScriptTemplateQuery {
  page?: number;
  pageSize?: number;
  category?: string;
  status?: string;
  keyword?: string;
}

// 话术模板创建/更新参数
export interface ScriptTemplateForm {
  title: string;
  category: string;
  keywords: string;
  content: string;
  priority?: number;
  status?: string;
}

// 话术匹配参数
export interface ScriptMatchParams {
  userInput: string;
  category?: string;
}

// 话术匹配结果
export interface ScriptMatchResult {
  template: ScriptTemplate | null;
  score: number;
  matchedKeywords: string[];
}

/**
 * 获取话术模板列表
 */
export function getScriptTemplates(params?: ScriptTemplateQuery) {
  return request.get<{
    items: ScriptTemplate[];
    total: number;
    page: number;
    pageSize: number;
  }>('/script-templates', { params });
}

/**
 * 获取单个话术模板
 */
export function getScriptTemplate(id: number) {
  return request.get<ScriptTemplate>(`/api/script-templates/${id}`);
}

/**
 * 创建话术模板
 */
export function createScriptTemplate(data: ScriptTemplateForm) {
  return request.post<ScriptTemplate>('/api/script-templates', data);
}

/**
 * 更新话术模板
 */
export function updateScriptTemplate(id: number, data: ScriptTemplateForm) {
  return request.put<ScriptTemplate>(`/api/script-templates/${id}`, data);
}

/**
 * 删除话术模板
 */
export function deleteScriptTemplate(id: number) {
  return request.delete(`/api/script-templates/${id}`);
}

/**
 * 批量删除话术模板
 */
export function batchDeleteScriptTemplates(ids: number[]) {
  return request.post('/api/script-templates/batch/delete', { ids });
}

/**
 * 匹配话术模板（测试用）
 */
export function matchScriptTemplate(params: ScriptMatchParams) {
  return request.post<ScriptMatchResult>('/api/script-templates/match', params);
}

/**
 * 获取话术分类统计
 */
export function getScriptCategoryStats() {
  return request.get<Array<{
    category: string;
    count: number;
    avgSuccessRate: number;
    totalUsage: number;
  }>>('/script-templates/stats/category');
}

