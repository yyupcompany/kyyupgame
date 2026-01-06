/**
 * 数据验证工具集
 * 严格测试验证规则所需的验证函数
 */

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  missing?: string[];
}

/**
 * 验证必填字段
 */
export function validateRequiredFields<T>(
  data: any,
  requiredFields: (keyof T)[]
): ValidationResult {
  const errors: string[] = [];
  const missing: string[] = [];

  requiredFields.forEach(field => {
    const value = data[field];
    if (value === undefined || value === null || value === '') {
      missing.push(String(field));
    }
  });

  const valid = missing.length === 0;
  
  if (!valid) {
    errors.push(`Missing required fields: ${missing.join(', ')}`);
  }

  return { valid, errors, missing };
}

/**
 * 验证字段类型
 */
export function validateFieldTypes<T>(
  data: any,
  fieldTypes: Partial<Record<keyof T, string>>
): ValidationResult {
  const errors: string[] = [];
  const missing: string[] = [];

  Object.entries(fieldTypes).forEach(([field, expectedType]) => {
    const value = data[field];
    const fieldName = String(field);

    if (value === undefined || value === null) {
      missing.push(fieldName);
      return;
    }

    const actualType = typeof value;
    let isValid = false;

    switch (expectedType) {
      case 'string':
        isValid = actualType === 'string';
        break;
      case 'number':
        isValid = actualType === 'number' && !isNaN(value);
        break;
      case 'boolean':
        isValid = actualType === 'boolean';
        break;
      case 'object':
        isValid = actualType === 'object' && !Array.isArray(value);
        break;
      case 'array':
        isValid = Array.isArray(value);
        break;
      case 'date':
        isValid = actualType === 'string' && !isNaN(Date.parse(value));
        break;
      default:
        // 自定义类型验证
        if (expectedType.includes('|')) {
          const unionTypes = expectedType.split('|');
          isValid = unionTypes.some(type => {
            switch (type.trim()) {
              case 'string': return typeof value === 'string';
              case 'number': return typeof value === 'number' && !isNaN(value);
              case 'boolean': return typeof value === 'boolean';
              default: return false;
            }
          });
        }
        break;
    }

    if (!isValid) {
      errors.push(`Field ${fieldName} expected type ${expectedType}, got ${actualType}`);
    }
  });

  const valid = errors.length === 0;

  return { valid, errors, missing };
}

/**
 * 验证枚举值
 */
export function validateEnumValue<T>(
  value: any,
  enumObject: T
): boolean {
  const validValues = Object.values(enumObject);
  return validValues.includes(value);
}

/**
 * 验证日期格式
 */
export function validateDateFormat(dateString: string): boolean {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }
  
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * 验证邮箱格式
 */
export function validateEmailFormat(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证手机号格式（中国大陆）
 */
export function validatePhoneFormat(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * 验证JWT令牌格式
 */
export function validateJWTFormat(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  const parts = token.split('.');
  return parts.length === 3;
}

/**
 * 验证分页参数
 */
export function validatePaginationParams(params: {
  page?: number;
  pageSize?: number;
}): ValidationResult {
  const errors: string[] = [];

  if (params.page !== undefined) {
    if (typeof params.page !== 'number' || params.page < 1) {
      errors.push('Page must be a positive number');
    }
  }

  if (params.pageSize !== undefined) {
    if (typeof params.pageSize !== 'number' || params.pageSize < 1 || params.pageSize > 100) {
      errors.push('PageSize must be a number between 1 and 100');
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * 验证数组大小
 */
export function validateArraySize(
  array: any[],
  minSize?: number,
  maxSize?: number
): ValidationResult {
  const errors: string[] = [];

  if (!Array.isArray(array)) {
    errors.push('Value must be an array');
    return { valid: false, errors };
  }

  if (minSize !== undefined && array.length < minSize) {
    errors.push(`Array must have at least ${minSize} elements`);
  }

  if (maxSize !== undefined && array.length > maxSize) {
    errors.push(`Array must have at most ${maxSize} elements`);
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * 验证数值范围
 */
export function validateNumberRange(
  value: number,
  min?: number,
  max?: number
): ValidationResult {
  const errors: string[] = [];

  if (typeof value !== 'number' || isNaN(value)) {
    errors.push('Value must be a valid number');
    return { valid: false, errors };
  }

  if (min !== undefined && value < min) {
    errors.push(`Value must be at least ${min}`);
  }

  if (max !== undefined && value > max) {
    errors.push(`Value must be at most ${max}`);
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * 验证字符串长度
 */
export function validateStringLength(
  value: string,
  minLength?: number,
  maxLength?: number
): ValidationResult {
  const errors: string[] = [];

  if (typeof value !== 'string') {
    errors.push('Value must be a string');
    return { valid: false, errors };
  }

  if (minLength !== undefined && value.length < minLength) {
    errors.push(`String must have at least ${minLength} characters`);
  }

  if (maxLength !== undefined && value.length > maxLength) {
    errors.push(`String must have at most ${maxLength} characters`);
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * 综合验证函数
 */
export function validateData<T>(
  data: any,
  rules: {
    required?: (keyof T)[];
    types?: Partial<Record<keyof T, string>>;
    enums?: Partial<Record<keyof T, any[]>>;
    ranges?: Partial<Record<keyof T, { min?: number; max?: number }>>;
    lengths?: Partial<Record<keyof T, { min?: number; max?: number }>>;
  }
): ValidationResult {
  const allErrors: string[] = [];
  let allMissing: string[] = [];

  // 验证必填字段
  if (rules.required) {
    const requiredResult = validateRequiredFields<T>(data, rules.required);
    if (!requiredResult.valid) {
      allErrors.push(...(requiredResult.errors || []));
      allMissing.push(...(requiredResult.missing || []));
    }
  }

  // 验证字段类型
  if (rules.types) {
    const typeResult = validateFieldTypes<T>(data, rules.types);
    if (!typeResult.valid) {
      allErrors.push(...(typeResult.errors || []));
    }
  }

  // 验证枚举值
  if (rules.enums) {
    Object.entries(rules.enums).forEach(([field, validValues]) => {
      const value = data[field];
      if (value !== undefined && !validValues.includes(value)) {
        allErrors.push(`Field ${field} must be one of: ${validValues.join(', ')}`);
      }
    });
  }

  // 验证数值范围
  if (rules.ranges) {
    Object.entries(rules.ranges).forEach(([field, range]) => {
      const value = data[field];
      if (value !== undefined) {
        const rangeResult = validateNumberRange(value, range.min, range.max);
        if (!rangeResult.valid) {
          allErrors.push(`Field ${field}: ${(rangeResult.errors || []).join(', ')}`);
        }
      }
    });
  }

  // 验证字符串长度
  if (rules.lengths) {
    Object.entries(rules.lengths).forEach(([field, length]) => {
      const value = data[field];
      if (value !== undefined) {
        const lengthResult = validateStringLength(value, length.min, length.max);
        if (!lengthResult.valid) {
          allErrors.push(`Field ${field}: ${(lengthResult.errors || []).join(', ')}`);
        }
      }
    });
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors.length > 0 ? allErrors : undefined,
    missing: allMissing.length > 0 ? allMissing : undefined
  };
}

/**
 * 控制台错误监控
 */
export interface ConsoleError {
  type: 'error' | 'warn';
  message: string;
  source?: string;
  timestamp?: Date;
}

class ConsoleMonitor {
  private errors: ConsoleError[] = [];
  private originalConsole: typeof console;
  private intercepting = false;

  start(): void {
    if (this.intercepting) return;
    
    this.originalConsole = { ...console };
    this.intercepting = true;
    this.errors = [];

    console.error = (message: string, ...args: any[]) => {
      this.errors.push({
        type: 'error',
        message: message || 'Unknown error',
        source: this.getSourceFromStack(),
        timestamp: new Date()
      });
      this.originalConsole.error(message, ...args);
    };

    console.warn = (message: string, ...args: any[]) => {
      this.errors.push({
        type: 'warn',
        message: message || 'Unknown warning',
        source: this.getSourceFromStack(),
        timestamp: new Date()
      });
      this.originalConsole.warn(message, ...args);
    };
  }

  stop(): void {
    if (!this.intercepting) return;
    
    console.error = this.originalConsole.error;
    console.warn = this.originalConsole.warn;
    this.intercepting = false;
  }

  getErrors(): ConsoleError[] {
    return [...this.errors];
  }

  clearErrors(): void {
    this.errors = [];
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  private getSourceFromStack(): string {
    const stack = new Error().stack;
    if (stack) {
      const lines = stack.split('\n');
      // 跳过前几行堆栈栈帧，找到实际的调用源
      for (let i = 3; i < lines.length; i++) {
        const line = lines[i];
        if (line && !line.includes('console-monitor.ts')) {
          const match = line.match(/\(([^)]+)\)/);
          return match ? match[1] : line;
        }
      }
    }
    return 'unknown';
  }
}

// 全局控制台监控实例
const consoleMonitor = new ConsoleMonitor();

/**
 * 检查控制台错误
 */
export function expectNoConsoleErrors(): void {
  const errors = consoleMonitor.getErrors();
  if (errors.length > 0) {
    const errorMessages = errors.map(e => `[${e.type.toUpperCase()}] ${e.message}`).join('\n');
    throw new Error(`Console errors detected:\n${errorMessages}`);
  }
}

/**
 * 开始监控控制台错误
 */
export function startConsoleMonitoring(): void {
  consoleMonitor.start();
}

/**
 * 停止监控控制台错误
 */
export function stopConsoleMonitoring(): void {
  consoleMonitor.stop();
}

/**
 * 清除控制台错误记录
 */
export function clearConsoleErrors(): void {
  consoleMonitor.clearErrors();
}

/**
 * 获取控制台错误列表
 */
export function getConsoleErrors(): ConsoleError[] {
  return consoleMonitor.getErrors();
}

export { consoleMonitor };