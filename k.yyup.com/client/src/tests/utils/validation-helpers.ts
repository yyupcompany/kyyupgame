/**
 * 严格验证工具函数
 * 遵循项目的严格验证规则，提供数据结构、字段类型、必填字段等验证功能
 */

/**
 * 验证必填字段
 * @param data 待验证的数据对象
 * @param requiredFields 必填字段名数组
 * @returns 验证结果对象
 */
export const validateRequiredFields = (
  data: any,
  requiredFields: string[]
): { valid: boolean; missingFields: string[]; errors: string[] } => {
  const missingFields: string[] = []
  const errors: string[] = []

  for (const field of requiredFields) {
    if (!data || !Object.prototype.hasOwnProperty.call(data, field)) {
      missingFields.push(field)
      errors.push(`Missing required field: ${field}`)
      continue
    }

    const value = data[field]
    if (value === null || value === undefined || value === '') {
      missingFields.push(field)
      errors.push(`Required field ${field} is empty or null`)
    }
  }

  return {
    valid: missingFields.length === 0,
    missingFields,
    errors
  }
}

/**
 * 验证字段类型
 * @param data 待验证的数据对象
 * @param expectedTypes 期望的字段类型映射
 * @returns 验证结果对象
 */
export const validateFieldTypes = (
  data: any,
  expectedTypes: Record<string, string>
): { valid: boolean; typeErrors: string[]; errors: string[] } => {
  const typeErrors: string[] = []
  const errors: string[] = []

  for (const [field, expectedType] of Object.entries(expectedTypes)) {
    if (!data || !Object.prototype.hasOwnProperty.call(data, field)) {
      typeErrors.push(`Field ${field} is missing`)
      errors.push(`Missing field: ${field}`)
      continue
    }

    const actualType = typeof data[field]
    const value = data[field]

    // 特殊类型的验证
    switch (expectedType) {
      case 'string':
        if (actualType !== 'string') {
          typeErrors.push(`Field ${field} should be string, got ${actualType}`)
          errors.push(`Invalid type for ${field}: expected string, got ${actualType}`)
        } else if (typeof value === 'string' && value.trim() === '') {
          typeErrors.push(`Field ${field} is empty string`)
          errors.push(`Field ${field} should not be empty`)
        }
        break

      case 'number':
        if (actualType !== 'number' || isNaN(value)) {
          typeErrors.push(`Field ${field} should be number, got ${actualType}`)
          errors.push(`Invalid type for ${field}: expected number, got ${actualType}`)
        }
        break

      case 'boolean':
        if (actualType !== 'boolean') {
          typeErrors.push(`Field ${field} should be boolean, got ${actualType}`)
          errors.push(`Invalid type for ${field}: expected boolean, got ${actualType}`)
        }
        break

      case 'object':
        if (actualType !== 'object' || value === null || Array.isArray(value)) {
          typeErrors.push(`Field ${field} should be object, got ${actualType}`)
          errors.push(`Invalid type for ${field}: expected object, got ${actualType}`)
        }
        break

      case 'array':
        if (!Array.isArray(value)) {
          typeErrors.push(`Field ${field} should be array, got ${actualType}`)
          errors.push(`Invalid type for ${field}: expected array, got ${actualType}`)
        }
        break

      case 'date':
        if (!(value instanceof Date) && typeof value !== 'string') {
          typeErrors.push(`Field ${field} should be date or date string, got ${actualType}`)
          errors.push(`Invalid type for ${field}: expected date, got ${actualType}`)
        } else if (typeof value === 'string' && isNaN(Date.parse(value))) {
          typeErrors.push(`Field ${field} contains invalid date string: ${value}`)
          errors.push(`Invalid date format for ${field}: ${value}`)
        }
        break

      default:
        if (actualType !== expectedType) {
          typeErrors.push(`Field ${field} should be ${expectedType}, got ${actualType}`)
          errors.push(`Invalid type for ${field}: expected ${expectedType}, got ${actualType}`)
        }
    }
  }

  return {
    valid: typeErrors.length === 0,
    typeErrors,
    errors
  }
}

/**
 * 验证数值范围
 * @param value 待验证的数值
 * @param min 最小值
 * @param max 最大值
 * @param fieldName 字段名
 * @returns 验证结果对象
 */
export const validateNumberRange = (
  value: number,
  min: number,
  max: number,
  fieldName: string = 'value'
): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (typeof value !== 'number' || isNaN(value)) {
    errors.push(`${fieldName} must be a valid number`)
    return { valid: false, errors }
  }

  if (value < min) {
    errors.push(`${fieldName} ${value} is below minimum ${min}`)
  }

  if (value > max) {
    errors.push(`${fieldName} ${value} is above maximum ${max}`)
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 验证日期格式
 * @param dateString 日期字符串
 * @param format 期望的格式 ('ISO', 'YYYY-MM-DD', 'DD/MM/YYYY')
 * @param fieldName 字段名
 * @returns 验证结果对象
 */
export const validateDateFormat = (
  dateString: string,
  format: string = 'ISO',
  fieldName: string = 'date'
): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (typeof dateString !== 'string') {
    errors.push(`${fieldName} must be a string`)
    return { valid: false, errors }
  }

  let date: Date

  switch (format) {
    case 'ISO':
      date = new Date(dateString)
      if (isNaN(date.getTime()) || dateString !== date.toISOString()) {
        errors.push(`${fieldName} must be a valid ISO date string`)
      }
      break

    case 'YYYY-MM-DD':
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(dateString)) {
        errors.push(`${fieldName} must be in YYYY-MM-DD format`)
        break
      }
      date = new Date(dateString)
      if (isNaN(date.getTime())) {
        errors.push(`${fieldName} contains invalid date: ${dateString}`)
      }
      break

    case 'DD/MM/YYYY':
      const ukDateRegex = /^\d{2}\/\d{2}\/\d{4}$/
      if (!ukDateRegex.test(dateString)) {
        errors.push(`${fieldName} must be in DD/MM/YYYY format`)
        break
      }
      const [day, month, year] = dateString.split('/').map(Number)
      date = new Date(year, month - 1, day)
      if (isNaN(date.getTime())) {
        errors.push(`${fieldName} contains invalid date: ${dateString}`)
      }
      break

    default:
      errors.push(`Unsupported date format: ${format}`)
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 验证枚举值
 * @param value 待验证的值
 * @param validValues 有效值数组
 * @param fieldName 字段名
 * @returns 验证结果对象
 */
export const validateEnum = (
  value: any,
  validValues: any[],
  fieldName: string = 'value'
): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!validValues.includes(value)) {
    errors.push(`${fieldName} value "${value}" is not valid. Valid values: ${validValues.join(', ')}`)
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 验证字符串长度
 * @param value 待验证的字符串
 * @param minLength 最小长度
 * @param maxLength 最大长度
 * @param fieldName 字段名
 * @returns 验证结果对象
 */
export const validateStringLength = (
  value: string,
  minLength: number,
  maxLength: number,
  fieldName: string = 'value'
): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (typeof value !== 'string') {
    errors.push(`${fieldName} must be a string`)
    return { valid: false, errors }
  }

  if (value.length < minLength) {
    errors.push(`${fieldName} length ${value.length} is below minimum ${minLength}`)
  }

  if (value.length > maxLength) {
    errors.push(`${fieldName} length ${value.length} exceeds maximum ${maxLength}`)
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 验证邮箱格式
 * @param email 邮箱字符串
 * @param fieldName 字段名
 * @returns 验证结果对象
 */
export const validateEmail = (
  email: string,
  fieldName: string = 'email'
): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (typeof email !== 'string') {
    errors.push(`${fieldName} must be a string`)
    return { valid: false, errors }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    errors.push(`${fieldName} "${email}" is not a valid email address`)
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 验证手机号格式
 * @param phone 手机号字符串
 * @param fieldName 字段名
 * @returns 验证结果对象
 */
export const validatePhone = (
  phone: string,
  fieldName: string = 'phone'
): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (typeof phone !== 'string') {
    errors.push(`${fieldName} must be a string`)
    return { valid: false, errors }
  }

  // 简单的手机号验证（可根据需要调整）
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(phone.replace(/[\s-]/g, ''))) {
    errors.push(`${fieldName} "${phone}" is not a valid phone number`)
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 验证URL格式
 * @param url URL字符串
 * @param fieldName 字段名
 * @returns 验证结果对象
 */
export const validateURL = (
  url: string,
  fieldName: string = 'url'
): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (typeof url !== 'string') {
    errors.push(`${fieldName} must be a string`)
    return { valid: false, errors }
  }

  try {
    new URL(url)
  } catch {
    errors.push(`${fieldName} "${url}" is not a valid URL`)
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 严格验证包装器
 * 包装测试函数，提供严格的验证和错误处理
 * @param testFn 测试函数
 * @param options 验证选项
 * @returns 包装后的测试函数
 */
export const strictValidationWrapper = async (
  testFn: () => Promise<any> | any,
  options: {
    timeout?: number;
    allowConsoleErrors?: boolean;
    allowConsoleWarnings?: boolean;
    customValidations?: Array<(result: any) => { valid: boolean; errors: string[] }>;
  } = {}
): Promise<any> => {
  const {
    timeout = 5000,
    allowConsoleErrors = false,
    allowConsoleWarnings = false,
    customValidations = []
  } = options

  // 捕获控制台错误和警告
  const consoleErrors: string[] = []
  const consoleWarnings: string[] = []

  const originalConsoleError = console.error
  const originalConsoleWarn = console.warn

  if (!allowConsoleErrors) {
    console.error = (...args: any[]) => {
      consoleErrors.push(args.join(' '))
      originalConsoleError(...args)
    }
  }

  if (!allowConsoleWarnings) {
    console.warn = (...args: any[]) => {
      consoleWarnings.push(args.join(' '))
      originalConsoleWarn(...args)
    }
  }

  try {
    // 设置超时
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Test timeout after ${timeout}ms`)), timeout)
    })

    const testPromise = Promise.resolve(testFn())

    const result = await Promise.race([testPromise, timeoutPromise]) as any

    // 恢复原始console方法
    console.error = originalConsoleError
    console.warn = originalConsoleWarn

    // 检查控制台错误
    if (!allowConsoleErrors && consoleErrors.length > 0) {
      throw new Error(`Console errors detected: ${consoleErrors.join('; ')}`)
    }

    if (!allowConsoleWarnings && consoleWarnings.length > 0) {
      throw new Error(`Console warnings detected: ${consoleWarnings.join('; ')}`)
    }

    // 执行自定义验证
    for (const validation of customValidations) {
      const validation_result = validation(result)
      if (!validation_result.valid) {
        throw new Error(`Custom validation failed: ${validation_result.errors.join('; ')}`)
      }
    }

    return result
  } catch (error) {
    // 恢复原始console方法
    console.error = originalConsoleError
    console.warn = originalConsoleWarn
    throw error
  }
}

/**
 * 组合多个验证结果
 * @param validationResults 验证结果数组
 * @returns 组合后的验证结果
 */
export const combineValidationResults = (
  validationResults: Array<{ valid: boolean; errors: string[] }>
): { valid: boolean; allErrors: string[] } => {
  const allErrors: string[] = []
  let valid = true

  for (const result of validationResults) {
    if (!result.valid) {
      valid = false
    }
    allErrors.push(...result.errors)
  }

  return {
    valid,
    allErrors
  }
}

/**
 * 验证API响应结构
 * @param response API响应对象
 * @returns 验证结果
 */
export const validateAPIResponse = (response: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!response || typeof response !== 'object') {
    errors.push('Response must be an object')
    return { valid: false, errors }
  }

  // 验证基本结构
  if (response.success !== undefined && typeof response.success !== 'boolean') {
    errors.push('success field must be boolean')
  }

  if (response.data !== undefined) {
    if (typeof response.data !== 'object' && !Array.isArray(response.data)) {
      errors.push('data field must be object or array')
    }
  }

  return { valid: errors.length === 0, errors }
}

/**
 * 验证分页数据结构
 * @param data 分页数据
 * @returns 验证结果
 */
export const validatePaginationData = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!data || typeof data !== 'object') {
    errors.push('Pagination data must be an object')
    return { valid: false, errors }
  }

  const requiredFields = ['items', 'total', 'page', 'pageSize']
  for (const field of requiredFields) {
    if (!(field in data)) {
      errors.push(`Missing pagination field: ${field}`)
    }
  }

  if (data.items && !Array.isArray(data.items)) {
    errors.push('items field must be an array')
  }

  return { valid: errors.length === 0, errors }
}

/**
 * 验证移动端元素可见性
 * @param selector CSS选择器
 * @param options 验证选项
 * @returns 验证结果
 */
export const validateMobileElement = (
  selector: string,
  options: {
    visible?: boolean;
    hasText?: boolean;
    clickable?: boolean;
    minSize?: { width: number; height: number };
  } = {}
): { valid: boolean; errors: string[] } => {
  const errors: string[] = []
  const { visible = true, hasText = false, clickable = false, minSize } = options

  try {
    const element = document.querySelector(selector)
    if (!element) {
      errors.push(`Element not found: ${selector}`)
      return { valid: false, errors }
    }

    if (visible) {
      const style = window.getComputedStyle(element)
      if (style.display === 'none' || style.visibility === 'hidden') {
        errors.push(`Element is not visible: ${selector}`)
      }
    }

    if (hasText && element.textContent?.trim() === '') {
      errors.push(`Element has no text content: ${selector}`)
    }

    if (clickable) {
      const tagName = element.tagName.toLowerCase()
      if (!['button', 'a', 'input'].includes(tagName)) {
        // 检查是否有onclick事件或role属性
        if (!element.onclick && element.getAttribute('role') !== 'button') {
          errors.push(`Element is not clickable: ${selector}`)
        }
      }
    }

    if (minSize) {
      const rect = element.getBoundingClientRect()
      if (rect.width < minSize.width) {
        errors.push(`Element width ${rect.width} is below minimum ${minSize.width}: ${selector}`)
      }
      if (rect.height < minSize.height) {
        errors.push(`Element height ${rect.height} is below minimum ${minSize.height}: ${selector}`)
      }
    }
  } catch (error) {
    errors.push(`Error validating element ${selector}: ${error}`)
  }

  return { valid: errors.length === 0, errors }
}

/**
 * 验证移动端响应式布局
 * @returns 验证结果
 */
export const validateMobileResponsive = (): {
  valid: boolean;
  errors: string[];
  info: {
    viewportWidth: number;
    viewportHeight: number;
    hasHorizontalScroll: boolean;
    hasVerticalScroll: boolean;
  };
} => {
  const errors: string[] = []
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  // 检查是否有水平滚动（移动端不应该有）
  const hasHorizontalScroll = document.documentElement.scrollWidth > viewportWidth
  const hasVerticalScroll = document.documentElement.scrollHeight > viewportHeight

  if (hasHorizontalScroll) {
    errors.push('Page has horizontal scroll on mobile')
  }

  // 检查viewport大小
  if (viewportWidth > 768) {
    errors.push('Viewport width is not mobile-friendly (>768px)')
  }

  return {
    valid: errors.length === 0,
    errors,
    info: {
      viewportWidth,
      viewportHeight,
      hasHorizontalScroll,
      hasVerticalScroll
    }
  }
}

/**
 * 验证移动端性能指标
 * @returns 验证结果
 */
export const validateMobilePerformance = (): {
  valid: boolean;
  errors: string[];
  metrics: {
    loadTime?: number;
    domComplete?: number;
    resourceCount: number;
    memoryUsage?: {
      used?: number;
      total?: number;
    };
  };
} => {
  const errors: string[] = []
  const metrics: any = {
    resourceCount: 0,
    memoryUsage: {}
  }

  try {
    // 获取性能指标
    if (performance.timing) {
      const navigation = performance.timing
      metrics.loadTime = navigation.loadEventEnd - navigation.loadEventStart
      metrics.domComplete = navigation.domComplete - navigation.navigationStart

      if (metrics.loadTime > 5000) {
        errors.push(`Page load time ${metrics.loadTime}ms exceeds mobile threshold (5000ms)`)
      }

      if (metrics.domComplete > 3000) {
        errors.push(`DOM completion time ${metrics.domComplete}ms exceeds mobile threshold (3000ms)`)
      }
    }

    // 获取资源数量
    metrics.resourceCount = performance.getEntriesByType('resource').length

    // 获取内存使用（如果可用）
    if ('memory' in performance) {
      const memory = (performance as any).memory
      metrics.memoryUsage.used = memory.usedJSHeapSize
      metrics.memoryUsage.total = memory.totalJSHeapSize

      if (memory.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
        errors.push(`Memory usage ${memory.usedJSHeapSize} bytes exceeds mobile threshold (50MB)`)
      }
    }
  } catch (error) {
    errors.push(`Error getting performance metrics: ${error}`)
  }

  return {
    valid: errors.length === 0,
    errors,
    metrics
  }
}

/**
 * 捕获控制台错误
 * @returns 控制台监控器对象
 */
export const captureConsoleErrors = () => {
  const consoleMonitor = {
    errors: [] as string[],
    warnings: [] as string[],

    restore: () => {
      // 恢复console方法在afterEach中处理
    }
  }

  const originalError = console.error
  const originalWarn = console.warn

  console.error = (...args: any[]) => {
    consoleMonitor.errors.push(args.join(' '))
    originalError(...args)
  }

  console.warn = (...args: any[]) => {
    consoleMonitor.warnings.push(args.join(' '))
    originalWarn(...args)
  }

  return consoleMonitor
}

/**
 * 简化的枚举值验证
 */
export const validateEnumValue = (value: any, validValues: any[]): boolean => {
  return validValues.includes(value)
}

/**
 * 简化的日期格式验证
 */
export const validateDateFormatSimple = (dateString: string): boolean => {
  if (!dateString) return false
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

export default {
  validateRequiredFields,
  validateFieldTypes,
  validateNumberRange,
  validateDateFormat,
  validateEnum,
  validateStringLength,
  validateEmail,
  validatePhone,
  validateURL,
  validateAPIResponse,
  validatePaginationData,
  validateMobileElement,
  validateMobileResponsive,
  validateMobilePerformance,
  captureConsoleErrors,
  validateEnumValue,
  validateDateFormatSimple,
  strictValidationWrapper,
  combineValidationResults
}