/**
 * E2E测试验证辅助工具
 * 用于严格验证标准的E2E测试
 */

import { Page } from '@playwright/test';

/**
 * 班级数据验证接口
 */
export interface ClassData {
  id?: number;
  name: string;
  code: string;
  ageGroup: string;
  maxCapacity: number;
  classroom: string;
  description?: string;
  teacherIds?: number[];
  currentStudents?: number;
  status?: string;
  createdAt?: string;
}

/**
 * API响应验证接口
 */
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: number;
}

/**
 * 验证班级数据结构
 */
export function validateClassData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('班级数据必须是一个对象');
    return { valid: false, errors };
  }

  // 验证必填字段
  const requiredFields = ['name', 'code', 'ageGroup', 'maxCapacity', 'classroom'];
  for (const field of requiredFields) {
    if (!data[field] || data[field] === '') {
      errors.push(`缺少必填字段: ${field}`);
    }
  }

  // 验证字段类型
  if (data.name && typeof data.name !== 'string') {
    errors.push('班级名称必须是字符串');
  }

  if (data.code && typeof data.code !== 'string') {
    errors.push('班级编号必须是字符串');
  }

  if (data.ageGroup && typeof data.ageGroup !== 'string') {
    errors.push('年龄段必须是字符串');
  }

  if (data.maxCapacity !== undefined) {
    if (typeof data.maxCapacity !== 'number') {
      errors.push('最大容量必须是数字');
    } else if (data.maxCapacity <= 0 || data.maxCapacity > 50) {
      errors.push('最大容量必须在1-50之间');
    }
  }

  if (data.classroom && typeof data.classroom !== 'string') {
    errors.push('教室必须是字符串');
  }

  // 验证年龄组枚举
  if (data.ageGroup) {
    const validAgeGroups = ['small', 'medium', 'large'];
    if (!validAgeGroups.includes(data.ageGroup)) {
      errors.push(`年龄段必须是以下值之一: ${validAgeGroups.join(', ')}`);
    }
  }

  // 验证状态枚举
  if (data.status) {
    const validStatuses = ['active', 'inactive', 'archived'];
    if (!validStatuses.includes(data.status)) {
      errors.push(`状态必须是以下值之一: ${validStatuses.join(', ')}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 验证API响应结构
 */
export function validateAPIResponse(response: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!response || typeof response !== 'object') {
    errors.push('API响应必须是一个对象');
    return { valid: false, errors };
  }

  // 验证success字段
  if (response.success !== undefined && typeof response.success !== 'boolean') {
    errors.push('success字段必须是布尔值');
  }

  // 验证message字段
  if (response.message !== undefined && typeof response.message !== 'string') {
    errors.push('message字段必须是字符串');
  }

  // 验证code字段
  if (response.code !== undefined && typeof response.code !== 'number') {
    errors.push('code字段必须是数字');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 验证列表分页响应
 */
export function validatePaginationResponse(response: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!response || typeof response !== 'object') {
    errors.push('响应必须是一个对象');
    return { valid: false, errors };
  }

  // 验证数据结构
  const requiredFields = ['items', 'total', 'page', 'pageSize'];
  for (const field of requiredFields) {
    if (response[field] === undefined) {
      errors.push(`缺少分页字段: ${field}`);
    }
  }

  // 验证类型
  if (response.items !== undefined && !Array.isArray(response.items)) {
    errors.push('items字段必须是数组');
  }

  if (response.total !== undefined && typeof response.total !== 'number') {
    errors.push('total字段必须是数字');
  }

  if (response.page !== undefined && typeof response.page !== 'number') {
    errors.push('page字段必须是数字');
  }

  if (response.pageSize !== undefined && typeof response.pageSize !== 'number') {
    errors.push('pageSize字段必须是数字');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 验证必填字段
 */
export function validateRequiredFields<T = any>(
  data: any,
  requiredFields: (keyof T)[]
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, missing: requiredFields as string[] };
  }

  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missing.push(String(field));
    }
  }

  return { valid: missing.length === 0, missing };
}

/**
 * 验证字段类型
 */
export function validateFieldTypes<T = any>(
  data: any,
  fieldTypes: Partial<Record<keyof T, string>>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('数据不是对象');
    return { valid: false, errors };
  }

  for (const [field, expectedType] of Object.entries(fieldTypes)) {
    const actualValue = data[field];

    if (actualValue === undefined || actualValue === null) {
      continue; // 跳过空值
    }

    let actualType = typeof actualValue;

    if (expectedType === 'array' && !Array.isArray(actualValue)) {
      errors.push(`${field}: 期望数组，实际${actualType}`);
    } else if (expectedType === 'object' && (actualType !== 'object' || Array.isArray(actualValue))) {
      errors.push(`${field}: 期望对象，实际${actualType}`);
    } else if (actualType !== expectedType && expectedType !== 'array' && expectedType !== 'object') {
      errors.push(`${field}: 期望${expectedType}，实际${actualType}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 控制台错误监听器
 */
export class ConsoleMonitor {
  private errors: string[] = [];
  private warnings: string[] = [];
  private page: Page;

  constructor(page: Page) {
    this.page = page;
    this.setupListeners();
  }

  private setupListeners() {
    this.page.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'error') {
        this.errors.push(text);
      } else if (msg.type() === 'warning') {
        this.warnings.push(text);
      }
    });

    this.page.on('pageerror', (error) => {
      this.errors.push(error.message);
    });
  }

  getErrors(): string[] {
    return this.errors;
  }

  getWarnings(): string[] {
    return this.warnings;
  }

  clear() {
    this.errors = [];
    this.warnings = [];
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  hasWarnings(): boolean {
    return this.warnings.length > 0;
  }

  expectNoErrors() {
    if (this.errors.length > 0) {
      throw new Error(`检测到控制台错误:\n${this.errors.join('\n')}`);
    }
  }

  expectNoWarnings() {
    if (this.warnings.length > 0) {
      throw new Error(`检测到控制台警告:\n${this.warnings.join('\n')}`);
    }
  }
}

/**
 * 验证页面性能指标
 */
export function validatePagePerformance(page: Page): Promise<{
  loadTime: number;
  domContentLoaded: number;
  resourceCount: number;
}> {
  return page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const resources = performance.getEntriesByType('resource');

    return {
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      resourceCount: resources.length
    };
  });
}

/**
 * 等待并验证API调用
 */
export async function waitForAPICall(
  page: Page,
  urlPattern: string,
  timeout: number = 10000
): Promise<{ url: string; status: number; response: any }> {
  const [response] = await Promise.all([
    page.waitForResponse(resp => resp.url().includes(urlPattern), { timeout }),
    // 这里可以添加触发API调用的操作
  ]);

  return {
    url: response.url(),
    status: response.status(),
    response: await response.json()
  };
}

/**
 * 验证表单数据
 */
export function validateFormData(formData: any, requiredFields: string[]): {
  valid: boolean;
  missing: string[];
  invalid: string[];
} {
  const missing: string[] = [];
  const invalid: string[] = [];

  for (const field of requiredFields) {
    if (!formData[field] || formData[field] === '') {
      missing.push(field);
    } else if (typeof formData[field] !== 'string' && typeof formData[field] !== 'number') {
      invalid.push(`${field}: 无效的数据类型`);
    }
  }

  return {
    valid: missing.length === 0 && invalid.length === 0,
    missing,
    invalid
  };
}

/**
 * 验证表格数据
 */
export function validateTableData(tableRows: any[], requiredColumns: string[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!Array.isArray(tableRows)) {
    errors.push('表格数据必须是数组');
    return { valid: false, errors };
  }

  for (let i = 0; i < tableRows.length; i++) {
    const row = tableRows[i];
    if (!row || typeof row !== 'object') {
      errors.push(`第${i + 1}行数据不是有效对象`);
      continue;
    }

    for (const column of requiredColumns) {
      if (row[column] === undefined || row[column] === null) {
        errors.push(`第${i + 1}行缺少列: ${column}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}