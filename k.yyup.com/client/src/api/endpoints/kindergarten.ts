import { request } from '@/utils/request';

/**
 * 幼儿园信息完整度API
 */

export interface CompletenessResult {
  score: number;
  level: string;
  levelDescription: string;
  missingRequired: string[];
  missingRequiredLabels: string[];
  missingRecommended: string[];
  missingRecommendedLabels: string[];
  canUseAdvancedFeatures: boolean;
  message: string;
}

export interface MissingField {
  name: string;
  label: string;
  type: 'required' | 'recommended';
}

export interface MissingFieldsResult {
  missingRequired: MissingField[];
  missingRecommended: MissingField[];
  totalMissing: number;
}

export interface FieldConfig {
  name: string;
  label: string;
  weight: number;
}

export interface FieldConfigResult {
  required: FieldConfig[];
  recommended: FieldConfig[];
  optional: FieldConfig[];
}

export interface BatchUpdateResult {
  updated: boolean;
  updatedFields: string[];
  completeness: {
    score: number;
    level: string;
    canUseAdvancedFeatures: boolean;
    message: string;
  };
}

/**
 * 获取信息完整度
 */
export function getCompleteness() {
  return request.get<CompletenessResult>('/kindergarten/completeness');
}

/**
 * 获取缺失字段列表
 */
export function getMissingFields() {
  return request.get<MissingFieldsResult>('/kindergarten/missing-fields');
}

/**
 * 批量更新基础信息
 */
export function batchUpdateBaseInfo(data: Record<string, any>) {
  return request.put<BatchUpdateResult>('/kindergarten/base-info/batch', data);
}

/**
 * 计算完整度
 */
export function calculateCompleteness() {
  return request.post<{ score: number; level: string; message: string }>(
    '/kindergarten/calculate-completeness'
  );
}

/**
 * 获取字段配置
 */
export function getFieldConfig() {
  return request.get<FieldConfigResult>('/kindergarten/field-config');
}

