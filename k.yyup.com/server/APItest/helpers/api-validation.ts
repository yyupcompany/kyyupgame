/**
 * API格式一致性验证工具
 * 用于确保所有API响应都遵循统一的格式标准
 */

import { jest } from '@jest/globals';

export interface StandardAPIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface StandardPaginatedResponse<T = any> {
  success: boolean;
  data: {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages?: number;
  };
  message?: string;
}

export interface StandardAuthResponse {
  success: boolean;
  data: {
    token: string;
    refreshToken?: string;
    user: {
      id: string | number;
      username: string;
      role: string;
      email?: string;
      phone?: string;
      permissions?: string[];
    };
  };
  message?: string;
}

/**
 * 验证必填字段是否存在
 */
export function validateRequiredFields(
  data: any,
  requiredFields: string[]
): { valid: boolean; missing: string[] } {
  const missing = requiredFields.filter(field => {
    const value = getNestedValue(data, field);
    return value === undefined || value === null;
  });

  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * 验证字段类型是否正确
 */
export function validateFieldTypes(
  data: any,
  fieldTypes: Record<string, string>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  Object.entries(fieldTypes).forEach(([field, expectedType]) => {
    const value = getNestedValue(data, field);

    if (value !== undefined && value !== null) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== expectedType) {
        errors.push(`${field}: 期望类型 ${expectedType}, 实际类型 ${actualType}`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 验证API响应格式是否标准
 */
export function validateStandardAPIFormat(
  response: any
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 检查基本结构
  if (!response || typeof response !== 'object') {
    errors.push('响应必须是对象类型');
    return { valid: false, errors };
  }

  // 检查success字段
  if (typeof response.success !== 'boolean') {
    errors.push('success字段必须是布尔类型');
  }

  // 成功响应必须有data字段
  if (response.success && response.data === undefined) {
    errors.push('成功响应必须有data字段');
  }

  // 失败响应必须有error字段
  if (!response.success && !response.error) {
    errors.push('失败响应必须有error字段');
  }

  // 检查错误字段格式
  if (response.error && typeof response.error !== 'object') {
    errors.push('error字段必须是对象类型');
  } else if (response.error) {
    if (!response.error.code || typeof response.error.code !== 'string') {
      errors.push('error.code字段是必需的字符串类型');
    }
    if (!response.error.message || typeof response.error.message !== 'string') {
      errors.push('error.message字段是必需的字符串类型');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 验证分页响应格式
 */
export function validatePaginatedResponse(
  response: any
): { valid: boolean; errors: string[] } {
  const basicValidation = validateStandardAPIFormat(response);
  if (!basicValidation.valid) {
    return basicValidation;
  }

  const errors: string[] = [];

  if (!response.data || typeof response.data !== 'object') {
    errors.push('分页响应的data字段必须是对象类型');
    return { valid: false, errors };
  }

  const paginationFields = {
    'items': 'array',
    'total': 'number',
    'page': 'number',
    'pageSize': 'number'
  };

  const fieldValidation = validateFieldTypes(response.data, paginationFields);
  errors.push(...fieldValidation.errors);

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 验证认证响应格式
 */
export function validateAuthResponse(
  response: any
): { valid: boolean; errors: string[] } {
  const basicValidation = validateStandardAPIFormat(response);
  if (!basicValidation.valid) {
    return basicValidation;
  }

  const errors: string[] = [];

  // 检查data字段结构
  if (!response.data || typeof response.data !== 'object') {
    errors.push('认证响应的data字段必须是对象类型');
    return { valid: false, errors };
  }

  const authFields = {
    'token': 'string',
    'user': 'object'
  };

  const fieldValidation = validateFieldTypes(response.data, authFields);
  errors.push(...fieldValidation.errors);

  // 检查user字段结构
  if (response.data.user && typeof response.data.user === 'object') {
    const userFields = {
      'id': ['string', 'number'],
      'username': 'string',
      'role': 'string'
    };

    Object.entries(userFields).forEach(([field, expectedTypes]) => {
      const value = response.data.user[field];
      if (value === undefined || value === null) {
        errors.push(`user.${field}字段是必需的`);
      } else {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (!Array.isArray(expectedTypes)) {
          expectedTypes = [expectedTypes];
        }
        if (!expectedTypes.includes(actualType)) {
          errors.push(`user.${field}: 期望类型 ${expectedTypes.join(' 或 ')}, 实际类型 ${actualType}`);
        }
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 获取嵌套对象的值
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

/**
 * 期望控制台无错误的Jest匹配器
 */
export function expectNoConsoleErrors() {
  const originalConsoleError = console.error;
  const errors: string[] = [];

  console.error = (...args: any[]) => {
    errors.push(args.join(' '));
    originalConsoleError(...args);
  };

  return {
    getErrors: () => errors,
    restore: () => {
      console.error = originalConsoleError;
    },
    expectNoErrors: () => {
      expect(errors).toHaveLength(0);
    }
  };
}

/**
 * Jest匹配器扩展
 */
expect.extend({
  toBeStandardAPIFormat(received: any) {
    const validation = validateStandardAPIFormat(received);

    return {
      message: () =>
        validation.errors.length > 0
          ? `API响应格式不符合标准:\n${validation.errors.join('\n')}`
          : 'API响应格式符合标准',
      pass: validation.valid
    };
  },

  toBePaginatedResponse(received: any) {
    const validation = validatePaginatedResponse(received);

    return {
      message: () =>
        validation.errors.length > 0
          ? `分页响应格式不符合标准:\n${validation.errors.join('\n')}`
          : '分页响应格式符合标准',
      pass: validation.valid
    };
  },

  toBeAuthResponse(received: any) {
    const validation = validateAuthResponse(received);

    return {
      message: () =>
        validation.errors.length > 0
          ? `认证响应格式不符合标准:\n${validation.errors.join('\n')}`
          : '认证响应格式符合标准',
      pass: validation.valid
    };
  }
});

// 类型声明
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeStandardAPIFormat(): R;
      toBePaginatedResponse(): R;
      toBeAuthResponse(): R;
    }
  }
}