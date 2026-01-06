/**
 * 数据验证工具
 * 用于API测试的严格数据验证
 */

/**
 * 验证必填字段
 * @param data 待验证的数据对象
 * @param requiredFields 必填字段列表
 * @returns 验证结果
 */
export function validateRequiredFields<T = any>(
  data: any,
  requiredFields: (keyof T)[]
): { valid: boolean; missing: string[] } {
  if (!data || typeof data !== 'object') {
    return { valid: false, missing: requiredFields as string[] };
  }

  const missing: string[] = [];
  
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missing.push(String(field));
    }
  }

  return { valid: missing.length === 0, missing };
}

/**
 * 验证字段类型
 * @param data 待验证的数据对象
 * @param fieldTypes 字段类型映射
 * @returns 验证结果
 */
export function validateFieldTypes<T = any>(
  data: any,
  fieldTypes: Partial<Record<keyof T, string>>
): { valid: boolean; errors: string[] } {
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Data is not an object'] };
  }

  const errors: string[] = [];

  for (const [field, expectedType] of Object.entries(fieldTypes)) {
    const actualValue = data[field];
    
    if (actualValue === undefined || actualValue === null) {
      // 如果字段为空，跳过类型验证（除非是必填字段）
      continue;
    }

    let actualType = typeof actualValue;
    
    // 特殊类型处理
    if (expectedType === 'array') {
      if (!Array.isArray(actualValue)) {
        errors.push(`${field}: Expected array, got ${actualType}`);
      }
    } else if (expectedType === 'object') {
      if (actualType !== 'object' || Array.isArray(actualValue)) {
        errors.push(`${field}: Expected object, got ${actualType}`);
      }
    } else if (expectedType === 'date') {
      if (!(actualValue instanceof Date) && !isValidDateString(String(actualValue))) {
        errors.push(`${field}: Expected date, got ${actualType}`);
      }
    } else if (actualType !== expectedType) {
      errors.push(`${field}: Expected ${expectedType}, got ${actualType}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 验证枚举值
 * @param value 待验证的值
 * @param enumObject 枚举对象
 * @returns 是否有效
 */
export function validateEnumValue<T extends Record<string, string | number>>(
  value: any,
  enumObject: T
): boolean {
  return Object.values(enumObject).includes(value);
}

/**
 * 验证日期格式
 * @param dateString 日期字符串
 * @returns 是否有效
 */
export function validateDateFormat(dateString: string): boolean {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString.match(/^\d{4}-\d{2}-\d{2}/) !== null;
}

/**
 * 验证邮箱格式
 * @param email 邮箱地址
 * @returns 是否有效
 */
export function validateEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证手机号格式（中国大陆）
 * @param phone 手机号
 * @returns 是否有效
 */
export function validatePhoneFormat(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * 验证ID格式（通常是UUID或数字ID）
 * @param id ID字符串
 * @returns 是否有效
 */
export function validateIdFormat(id: string): boolean {
  // 检查是否为数字ID
  if (/^\d+$/.test(id)) return true;
  
  // 检查是否为UUID格式
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) return true;
  
  // 检查是否为其他常见ID格式（如ObjectId）
  const objectIdRegex = /^[a-f\d]{24}$/i;
  return objectIdRegex.test(id);
}

/**
 * 验证分页数据结构
 * @param data 分页数据
 * @returns 验证结果
 */
export function validatePaginationStructure(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Pagination data is not an object'] };
  }

  const requiredFields = ['items', 'total', 'page', 'pageSize'];
  const fieldValidation = validateRequiredFields(data, requiredFields);
  if (!fieldValidation.valid) {
    errors.push(`Missing pagination fields: ${fieldValidation.missing.join(', ')}`);
  }

  const typeValidation = validateFieldTypes(data, {
    items: 'array',
    total: 'number',
    page: 'number',
    pageSize: 'number'
  });
  if (!typeValidation.valid) {
    errors.push(...typeValidation.errors);
  }

  if (data.total !== undefined && data.total < 0) {
    errors.push('Total must be >= 0');
  }
  
  if (data.page !== undefined && data.page < 1) {
    errors.push('Page must be >= 1');
  }
  
  if (data.pageSize !== undefined && data.pageSize < 1) {
    errors.push('PageSize must be >= 1');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 验证API响应结构
 * @param response API响应
 * @returns 验证结果
 */
export function validateApiResponseStructure(response: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!response || typeof response !== 'object') {
    return { valid: false, errors: ['Response is not an object'] };
  }

  // 检查基本结构
  if (response.success !== undefined && typeof response.success !== 'boolean') {
    errors.push('success field must be boolean');
  }

  if (response.message !== undefined && typeof response.message !== 'string') {
    errors.push('message field must be string');
  }

  if (response.code !== undefined && typeof response.code !== 'number') {
    errors.push('code field must be number');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 验证统计数据范围
 * @param data 统计数据
 * @param fieldRanges 字段范围配置
 * @returns 验证结果
 */
export function validateStatisticalRanges(
  data: any,
  fieldRanges: Record<string, { min?: number; max?: number }>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const [field, range] of Object.entries(fieldRanges)) {
    const value = data[field];
    
    if (value === undefined || value === null) {
      continue;
    }

    if (typeof value !== 'number') {
      errors.push(`${field}: Expected number, got ${typeof value}`);
      continue;
    }

    if (range.min !== undefined && value < range.min) {
      errors.push(`${field}: Value ${value} is below minimum ${range.min}`);
    }

    if (range.max !== undefined && value > range.max) {
      errors.push(`${field}: Value ${value} is above maximum ${range.max}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 内部函数：检查是否为有效日期字符串
 */
function isValidDateString(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString.length > 0;
}

/**
 * 创建完整的验证报告
 * @param data 待验证的数据
 * @param config 验证配置
 * @returns 验证报告
 */
export function createValidationReport(
  data: any,
  config: {
    requiredFields?: string[];
    fieldTypes?: Record<string, string>;
    fieldRanges?: Record<string, { min?: number; max?: number }>;
    enumFields?: Record<string, any[]>;
  }
): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 验证必填字段
  if (config.requiredFields) {
    const requiredValidation = validateRequiredFields(data, config.requiredFields);
    if (!requiredValidation.valid) {
      errors.push(`Missing required fields: ${requiredValidation.missing.join(', ')}`);
    }
  }

  // 验证字段类型
  if (config.fieldTypes) {
    const typeValidation = validateFieldTypes(data, config.fieldTypes);
    if (!typeValidation.valid) {
      errors.push(`Type validation errors: ${typeValidation.errors.join(', ')}`);
    }
  }

  // 验证数值范围
  if (config.fieldRanges) {
    const rangeValidation = validateStatisticalRanges(data, config.fieldRanges);
    if (!rangeValidation.valid) {
      errors.push(`Range validation errors: ${rangeValidation.errors.join(', ')}`);
    }
  }

  // 验证枚举字段
  if (config.enumFields) {
    for (const [field, enumValues] of Object.entries(config.enumFields)) {
      const value = data[field];
      if (value !== undefined && value !== null && !enumValues.includes(value)) {
        errors.push(`${field}: Invalid value "${value}", expected one of: ${enumValues.join(', ')}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}