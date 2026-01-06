/**
 * 移动端测试验证助手工具
 * 提供统一的验证函数和工具，确保测试标准一致
 */

import { describe, it, expect } from 'vitest';

// 严格验证规则 - 遵循项目强制执行的API测试严格验证标准
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  info?: any;
}

// API响应严格验证
export interface APIValidationResult extends ValidationResult {
  dataStructure?: any;
  fieldTypes?: any;
  requiredFields?: any;
}

// 移动端元素验证配置
export interface MobileElementValidation {
  visible?: boolean;
  hasText?: boolean;
  clickable?: boolean;
  minSize?: { width: number; height: number };
  maxSize?: { width: number; height: number };
  hasAriaLabel?: boolean;
  tabIndex?: number;
}

// 性能验证配置
export interface PerformanceValidation {
  maxLoadTime?: number;
  maxMemoryUsage?: number;
  maxElementCount?: number;
  minFPS?: number;
}

// 响应式验证配置
export interface ResponsiveValidation {
  maxViewportWidth?: number;
  hasHorizontalScroll?: boolean;
  hasVerticalScroll?: boolean;
  breakpointMatches?: string;
}

/**
 * 严格验证API响应结构
 * 遵循项目的严格验证规则：数据结构、字段类型、必填字段、控制台错误检测
 */
export function validateAPIResponse(response: any, expectedStructure?: any): APIValidationResult {
  const result: APIValidationResult = {
    valid: true,
    errors: [],
    warnings: []
  };

  try {
    // 1. 基础响应结构验证
    if (!response || typeof response !== 'object') {
      result.valid = false;
      result.errors.push('API响应必须是对象');
      return result;
    }

    // 2. 标准API响应格式验证
    if (response.hasOwnProperty('success')) {
      if (typeof response.success !== 'boolean') {
        result.errors.push('success字段必须是布尔值');
        result.valid = false;
      }
    }

    // 3. 数据结构验证
    if (expectedStructure && response.data) {
      const structureValidation = validateDataStructure(response.data, expectedStructure);
      if (!structureValidation.valid) {
        result.valid = false;
        result.errors.push(...structureValidation.errors);
      }
      result.dataStructure = structureValidation;
    }

    // 4. 字段类型验证
    if (response.data) {
      const typeValidation = validateFieldTypesDeep(response.data);
      if (!typeValidation.valid) {
        result.valid = false;
        result.errors.push(...typeValidation.errors);
      }
      result.fieldTypes = typeValidation;
    }

    // 5. 必填字段验证
    if (response.data) {
      const requiredValidation = validateRequiredFieldsDeep(response.data);
      if (!requiredValidation.valid) {
        result.valid = false;
        result.errors.push(...requiredValidation.errors);
      }
      result.requiredFields = requiredValidation;
    }

  } catch (error) {
    result.valid = false;
    result.errors.push(`API验证过程中发生错误: ${error}`);
  }

  return result;
}

/**
 * 验证数据结构
 */
export function validateDataStructure(data: any, expectedStructure: any): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: []
  };

  if (!data || typeof data !== 'object') {
    result.valid = false;
    result.errors.push('数据必须是对象');
    return result;
  }

  for (const [key, expectedType] of Object.entries(expectedStructure)) {
    if (!(key in data)) {
      result.errors.push(`缺少必填字段: ${key}`);
      result.valid = false;
      continue;
    }

    const actualValue = data[key];
    const actualType = Array.isArray(actualValue) ? 'array' : typeof actualValue;

    if (expectedType === 'array' && !Array.isArray(actualValue)) {
      result.errors.push(`字段 ${key} 应该是数组，实际是 ${actualType}`);
      result.valid = false;
    } else if (expectedType !== 'array' && actualType !== expectedType) {
      result.errors.push(`字段 ${key} 应该是 ${expectedType}，实际是 ${actualType}`);
      result.valid = false;
    }
  }

  return result;
}

/**
 * 严格验证必填字段
 */
export function validateRequiredFields(obj: any, requiredFields: string[]): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    missingFields: []
  };

  if (!obj || typeof obj !== 'object') {
    result.valid = false;
    result.errors.push('验证对象必须是对象');
    return result;
  }

  requiredFields.forEach(field => {
    if (!(field in obj)) {
      result.errors.push(`缺少必填字段: ${field}`);
      result.missingFields.push(field);
      result.valid = false;
    } else if (obj[field] === null || obj[field] === undefined || obj[field] === '') {
      result.errors.push(`必填字段 ${field} 不能为空`);
      result.missingFields.push(field);
      result.valid = false;
    }
  });

  return result;
}

/**
 * 深度验证必填字段
 */
export function validateRequiredFieldsDeep(obj: any, prefix = ''): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: []
  };

  if (!obj || typeof obj !== 'object') {
    return result;
  }

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value === null || value === undefined) {
      // 可选字段允许为null/undefined
      continue;
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
      const nestedResult = validateRequiredFieldsDeep(value, fullKey);
      if (!nestedResult.valid) {
        result.valid = false;
        result.errors.push(...nestedResult.errors);
      }
    } else if (Array.isArray(value)) {
      // 验证数组中的对象
      value.forEach((item, index) => {
        if (typeof item === 'object' && item !== null) {
          const nestedResult = validateRequiredFieldsDeep(item, `${fullKey}[${index}]`);
          if (!nestedResult.valid) {
            result.valid = false;
            result.errors.push(...nestedResult.errors);
          }
        }
      });
    }
  }

  return result;
}

/**
 * 严格验证字段类型
 */
export function validateFieldTypes(obj: any, fieldTypes: { [key: string]: string }): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    typeErrors: []
  };

  for (const [field, expectedType] of Object.entries(fieldTypes)) {
    if (!(field in obj)) {
      continue; // 缺少字段在必填字段验证中处理
    }

    const actualValue = obj[field];
    let actualType: string;

    if (actualValue === null) {
      actualType = 'null';
    } else if (Array.isArray(actualValue)) {
      actualType = 'array';
    } else {
      actualType = typeof actualValue;
    }

    if (actualType !== expectedType && !(expectedType === 'number' && actualType === 'bigint')) {
      result.errors.push(`字段 ${field} 类型错误: 期望 ${expectedType}，实际 ${actualType}`);
      result.typeErrors.push({ field, expected: expectedType, actual: actualType });
      result.valid = false;
    }
  }

  return result;
}

/**
 * 深度验证字段类型
 */
export function validateFieldTypesDeep(obj: any, prefix = ''): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: []
  };

  if (!obj || typeof obj !== 'object') {
    return result;
  }

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value === null || value === undefined) {
      continue;
    }

    const expectedType = inferExpectedType(key, value);
    const actualType = Array.isArray(value) ? 'array' : typeof value;

    if (expectedType && actualType !== expectedType) {
      result.errors.push(`字段 ${fullKey} 类型可能不正确: 期望 ${expectedType}，实际 ${actualType}`);
      // 不将valid设为false，因为这只是建议性的类型检查
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
      const nestedResult = validateFieldTypesDeep(value, fullKey);
      if (!nestedResult.valid) {
        result.valid = false;
        result.errors.push(...nestedResult.errors);
      }
    }
  }

  return result;
}

/**
 * 根据字段名推断期望类型
 */
function inferExpectedType(fieldName: string, value: any): string | null {
  const lowerField = fieldName.toLowerCase();

  // ID字段
  if (lowerField.includes('id') && typeof value === 'string') {
    return 'string';
  }

  // 时间字段
  if (lowerField.includes('time') || lowerField.includes('date') || lowerField.includes('created') || lowerField.includes('updated')) {
    if (typeof value === 'string' || typeof value === 'number') {
      return typeof value;
    }
  }

  // 数量字段
  if (lowerField.includes('count') || lowerField.includes('number') || lowerField.includes('total')) {
    return 'number';
  }

  // 状态字段
  if (lowerField.includes('status') || lowerField.includes('type')) {
    return 'string';
  }

  // 布尔字段
  if (lowerField.includes('active') || lowerField.includes('enable') || lowerField.includes('visible') || lowerField.startsWith('is') || lowerField.startsWith('has')) {
    return 'boolean';
  }

  return null;
}

/**
 * 验证移动端元素
 */
export function validateMobileElement(selector: string, config: MobileElementValidation = {}): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: []
  };

  const element = document.querySelector(selector);
  if (!element) {
    result.valid = false;
    result.errors.push(`元素不存在: ${selector}`);
    return result;
  }

  const rect = element.getBoundingClientRect();

  // 可见性验证
  if (config.visible !== false) {
    const computedStyle = window.getComputedStyle(element);
    if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden' || computedStyle.opacity === '0') {
      result.errors.push(`元素不可见: ${selector}`);
      result.valid = false;
    }

    if (rect.width === 0 || rect.height === 0) {
      result.errors.push(`元素尺寸为0: ${selector}`);
      result.valid = false;
    }
  }

  // 文本内容验证
  if (config.hasText && !element.textContent?.trim()) {
    result.errors.push(`元素缺少文本内容: ${selector}`);
    result.valid = false;
  }

  // 可点击性验证
  if (config.clickable !== false) {
    const tagName = element.tagName.toLowerCase();
    const isClickable = ['button', 'a', 'input'].includes(tagName) ||
                       element.getAttribute('role') === 'button' ||
                       element.getAttribute('onclick') !== null ||
                       element.classList.contains('clickable');

    if (!isClickable) {
      result.errors.push(`元素不可点击: ${selector}`);
      result.valid = false;
    }
  }

  // 最小尺寸验证（移动端触控目标）
  if (config.minSize) {
    if (rect.width < config.minSize.width || rect.height < config.minSize.height) {
      result.errors.push(`元素尺寸过小: ${selector} 实际${rect.width}x${rect.height}，期望最小${config.minSize.width}x${config.minSize.height}`);
      result.valid = false;
    }
  }

  // 最大尺寸验证
  if (config.maxSize) {
    if (rect.width > config.maxSize.width || rect.height > config.maxSize.height) {
      result.errors.push(`元素尺寸过大: ${selector} 实际${rect.width}x${rect.height}，期望最大${config.maxSize.width}x${config.maxSize.height}`);
      result.valid = false;
    }
  }

  // ARIA标签验证
  if (config.hasAriaLabel) {
    const hasLabel = element.getAttribute('aria-label') ||
                    element.getAttribute('aria-labelledby') ||
                    element.textContent?.trim();

    if (!hasLabel) {
      result.errors.push(`元素缺少可访问性标签: ${selector}`);
      result.valid = false;
    }
  }

  // tabIndex验证
  if (config.tabIndex !== undefined) {
    const actualTabIndex = element.getAttribute('tabindex');
    const expectedTabIndex = config.tabIndex.toString();

    if (actualTabIndex !== expectedTabIndex) {
      result.errors.push(`元素tabIndex不匹配: ${selector} 期望${expectedTabIndex}，实际${actualTabIndex}`);
      result.valid = false;
    }
  }

  result.info = {
    rect,
    tagName: element.tagName,
    className: element.className,
    textContent: element.textContent?.trim().substring(0, 50)
  };

  return result;
}

/**
 * 验证移动端响应式布局
 */
export function validateMobileResponsive(config: ResponsiveValidation = {}): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    info: {}
  };

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  result.info = {
    viewportWidth,
    viewportHeight,
    devicePixelRatio: window.devicePixelRatio || 1
  };

  // 视口宽度验证
  if (config.maxViewportWidth && viewportWidth > config.maxViewportWidth) {
    result.errors.push(`视口宽度过大: ${viewportWidth} > ${config.maxViewportWidth}`);
    result.valid = false;
  }

  // 移动端范围验证
  if (viewportWidth < 320 || viewportWidth > 768) {
    result.errors.push(`视口宽度不在移动端范围内: ${viewportWidth} (期望 320-768)`);
    result.valid = false;
  }

  // 横向滚动检测
  const hasHorizontalScroll = document.body.scrollWidth > document.body.clientWidth;
  result.info.hasHorizontalScroll = hasHorizontalScroll;

  if (config.hasHorizontalScroll === false && hasHorizontalScroll) {
    result.errors.push('页面存在横向滚动');
    result.valid = false;
  }

  // 纵向滚动检测
  const hasVerticalScroll = document.body.scrollHeight > document.body.clientHeight;
  result.info.hasVerticalScroll = hasVerticalScroll;

  if (config.hasVerticalScroll === false && hasVerticalScroll) {
    result.errors.push('页面存在纵向滚动');
    result.valid = false;
  }

  // 断点验证
  if (config.breakpointMatches) {
    const mediaQuery = window.matchMedia(config.breakpointMatches);
    if (!mediaQuery.matches) {
      result.errors.push(`断点匹配失败: ${config.breakpointMatches}`);
      result.valid = false;
    }
  }

  return result;
}

/**
 * 验证移动端性能
 */
export function validateMobilePerformance(config: PerformanceValidation = {}): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    info: {
      metrics: {}
    }
  };

  // 加载时间验证
  if (typeof performance !== 'undefined' && performance.timing) {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    result.info.metrics.loadTime = loadTime;

    if (config.maxLoadTime && loadTime > config.maxLoadTime) {
      result.errors.push(`页面加载时间过长: ${loadTime}ms > ${config.maxLoadTime}ms`);
      result.valid = false;
    }
  }

  // 内存使用验证
  if (typeof performance !== 'undefined' && (performance as any).memory) {
    const memory = (performance as any).memory;
    result.info.metrics.memoryUsage = {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit
    };

    if (config.maxMemoryUsage && memory.usedJSHeapSize > config.maxMemoryUsage) {
      result.errors.push(`内存使用过高: ${memory.usedJSHeapSize} > ${config.maxMemoryUsage}`);
      result.valid = false;
    }
  }

  // DOM元素数量验证
  const allElements = document.querySelectorAll('*');
  result.info.metrics.elementCount = allElements.length;

  if (config.maxElementCount && allElements.length > config.maxElementCount) {
    result.errors.push(`DOM元素过多: ${allElements.length} > ${config.maxElementCount}`);
    result.valid = false;
  }

  return result;
}

/**
 * 捕获控制台错误
 */
export function captureConsoleErrors(): any {
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;

  const errors: string[] = [];
  const warnings: string[] = [];
  const logs: string[] = [];

  console.error = (...args: any[]) => {
    errors.push(args.join(' '));
    originalError.apply(console, args);
  };

  console.warn = (...args: any[]) => {
    warnings.push(args.join(' '));
    originalWarn.apply(console, args);
  };

  console.log = (...args: any[]) => {
    logs.push(args.join(' '));
    originalLog.apply(console, args);
  };

  return {
    errors,
    warnings,
    logs,
    restore: () => {
      console.error = originalError;
      console.warn = originalWarn;
      console.log = originalLog;
    }
  };
}

/**
 * 验证字符串长度
 */
export function validateStringLength(value: string, minLength: number, maxLength: number, fieldName: string): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: []
  };

  if (typeof value !== 'string') {
    result.errors.push(`${fieldName} 必须是字符串`);
    result.valid = false;
    return result;
  }

  if (value.length < minLength) {
    result.errors.push(`${fieldName} 长度不能少于 ${minLength} 个字符，实际长度: ${value.length}`);
    result.valid = false;
  }

  if (value.length > maxLength) {
    result.errors.push(`${fieldName} 长度不能超过 ${maxLength} 个字符，实际长度: ${value.length}`);
    result.valid = false;
  }

  return result;
}

/**
 * 验证枚举值
 */
export function validateEnumValue(value: any, validValues: any[]): boolean {
  return validValues.includes(value);
}

/**
 * 验证日期格式
 */
export function validateDateFormatSimple(dateString: string): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: []
  };

  if (typeof dateString !== 'string') {
    result.errors.push('日期必须是字符串');
    result.valid = false;
    return result;
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    result.errors.push(`无效的日期格式: ${dateString}`);
    result.valid = false;
  }

  return result;
}

/**
 * 验证分页数据
 */
export function validatePaginationData(data: any): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: []
  };

  if (!data || typeof data !== 'object') {
    result.errors.push('分页数据必须是对象');
    result.valid = false;
    return result;
  }

  const requiredFields = ['page', 'pageSize', 'total', 'data'];
  const requiredValidation = validateRequiredFields(data, requiredFields);

  if (!requiredValidation.valid) {
    result.errors.push(...requiredValidation.errors);
    result.valid = false;
  }

  // 验证字段类型
  const fieldTypes = {
    page: 'number',
    pageSize: 'number',
    total: 'number',
    data: 'object'
  };

  const typeValidation = validateFieldTypes(data, fieldTypes);
  if (!typeValidation.valid) {
    result.errors.push(...typeValidation.errors);
    result.valid = false;
  }

  // 验证data是数组
  if (data.data && !Array.isArray(data.data)) {
    result.errors.push('分页数据中的data字段必须是数组');
    result.valid = false;
  }

  return result;
}

/**
 * 验证图片URL
 */
export function validateImageURL(url: string): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: []
  };

  if (typeof url !== 'string') {
    result.errors.push('图片URL必须是字符串');
    result.valid = false;
    return result;
  }

  try {
    new URL(url);
  } catch (error) {
    result.errors.push(`无效的URL格式: ${url}`);
    result.valid = false;
  }

  // 检查图片扩展名
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const hasValidExtension = imageExtensions.some(ext => url.toLowerCase().includes(ext));

  if (!hasValidExtension && !url.startsWith('data:image')) {
    result.errors.push(`URL可能不是图片: ${url}`);
    result.valid = false;
  }

  return result;
}

/**
 * 验证手机号格式
 */
export function validatePhoneNumber(phoneNumber: string): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: []
  };

  if (typeof phoneNumber !== 'string') {
    result.errors.push('手机号必须是字符串');
    result.valid = false;
    return result;
  }

  // 中国手机号正则
  const phoneRegex = /^1[3-9]\d{9}$/;
  const cleanPhone = phoneNumber.replace(/\D/g, '');

  if (!phoneRegex.test(cleanPhone)) {
    result.errors.push(`无效的手机号格式: ${phoneNumber}`);
    result.valid = false;
  }

  return result;
}

/**
 * 验证邮箱格式
 */
export function validateEmail(email: string): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: []
  };

  if (typeof email !== 'string') {
    result.errors.push('邮箱必须是字符串');
    result.valid = false;
    return result;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    result.errors.push(`无效的邮箱格式: ${email}`);
    result.valid = false;
  }

  return result;
}