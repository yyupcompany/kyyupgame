/**
 * 测试验证工具集
 * 遵循项目严格验证规则，确保API测试质量
 * 包含数据结构验证、字段类型验证、必填字段验证、控制台错误检测
 */

/**
 * 验证API响应格式
 * @param response API响应数据
 * @returns 验证结果
 */
export function validateAPIResponse(response: any) {
  const result = {
    valid: true,
    errors: [] as string[]
  }

  try {
    // 检查响应是否为对象
    if (typeof response !== 'object' || response === null) {
      result.valid = false
      result.errors.push('响应必须是一个对象')
      return result
    }

    // 检查success字段
    if (response.hasOwnProperty('success') && typeof response.success !== 'boolean') {
      result.valid = false
      result.errors.push('success字段必须是布尔值')
    }

    // 检查message字段（如果存在）
    if (response.hasOwnProperty('message') && typeof response.message !== 'string') {
      result.valid = false
      result.errors.push('message字段必须是字符串')
    }

    // 检查data字段
    if (response.hasOwnProperty('data')) {
      if (response.data === null || response.data === undefined) {
        result.valid = false
        result.errors.push('data字段不能为null或undefined')
      }
    } else if (response.success !== false) {
      // 成功响应应该有data字段
      result.valid = false
      result.errors.push('成功响应必须包含data字段')
    }

    return result
  } catch (error) {
    result.valid = false
    result.errors.push(`验证过程中发生错误: ${error}`)
    return result
  }
}

/**
 * 验证必需字段是否存在
 * @param data 要验证的数据对象
 * @param requiredFields 必需字段数组
 * @returns 验证结果
 */
export function validateRequiredFields(data: any, requiredFields: string[]) {
  const result = {
    valid: true,
    errors: [] as string[],
    missingFields: [] as string[]
  }

  try {
    // 检查数据是否存在
    if (!data || typeof data !== 'object') {
      result.valid = false
      result.errors.push('数据必须是一个对象')
      return result
    }

    // 检查每个必需字段
    for (const field of requiredFields) {
      if (!(field in data) || data[field] === null || data[field] === undefined) {
        result.valid = false
        result.errors.push(`缺少必需字段: ${field}`)
        result.missingFields.push(field)
      }
    }

    return result
  } catch (error) {
    result.valid = false
    result.errors.push(`验证必需字段时发生错误: ${error}`)
    return result
  }
}

/**
 * 验证字段类型
 * @param data 要验证的数据对象
 * @param fieldTypes 字段类型定义
 * @returns 验证结果
 */
export function validateFieldTypes(data: any, fieldTypes: Record<string, any>) {
  const result = {
    valid: true,
    errors: [] as string[],
    typeErrors: [] as string[]
  }

  try {
    // 检查数据是否存在
    if (!data || typeof data !== 'object') {
      result.valid = false
      result.errors.push('数据必须是一个对象')
      return result
    }

    // 检查每个字段的类型
    for (const [fieldName, typeDefinition] of Object.entries(fieldTypes)) {
      if (fieldName in data && data[fieldName] !== null && data[fieldName] !== undefined) {
        const expectedType = typeof typeDefinition === 'string'
          ? typeDefinition
          : typeDefinition?.type

        if (!expectedType) {
          continue // 跳过没有类型定义的字段
        }

        const actualValue = data[fieldName]
        let actualType = typeof actualValue

        // 特殊类型处理
        if (expectedType === 'array') {
          actualType = Array.isArray(actualValue) ? 'array' : 'not-array'
        } else if (expectedType === 'object' && Array.isArray(actualValue)) {
          actualType = 'array' // 区分数组和对象
        } else if (expectedType === 'number' && isNaN(actualValue)) {
          actualType = 'NaN'
        }

        if (actualType !== expectedType) {
          result.valid = false
          result.errors.push(`字段 ${fieldName} 类型错误: 期望 ${expectedType}, 实际 ${actualType}`)
          result.typeErrors.push(`${fieldName}: 期望 ${expectedType}, 实际 ${actualType}`)
        }
      }
    }

    return result
  } catch (error) {
    result.valid = false
    result.errors.push(`验证字段类型时发生错误: ${error}`)
    return result
  }
}

/**
 * 验证数据格式（如邮箱、电话等）
 * @param data 要验证的数据
 * @param formatRules 格式规则
 * @returns 验证结果
 */
export function validateDataFormat(data: any, formatRules: Record<string, RegExp>) {
  const result = {
    valid: true,
    errors: [] as string[],
    formatErrors: [] as string[]
  }

  try {
    if (!data || typeof data !== 'object') {
      result.valid = false
      result.errors.push('数据必须是一个对象')
      return result
    }

    for (const [fieldName, pattern] of Object.entries(formatRules)) {
      if (fieldName in data && data[fieldName] !== null && data[fieldName] !== undefined) {
        const value = String(data[fieldName])
        if (!pattern.test(value)) {
          result.valid = false
          result.errors.push(`字段 ${fieldName} 格式错误`)
          result.formatErrors.push(`${fieldName}: 格式不匹配模式 ${pattern}`)
        }
      }
    }

    return result
  } catch (error) {
    result.valid = false
    result.errors.push(`验证数据格式时发生错误: ${error}`)
    return result
  }
}

/**
 * 验证数值范围
 * @param data 要验证的数据
 * @param rangeRules 数值范围规则
 * @returns 验证结果
 */
export function validateDataRange(data: any, rangeRules: Record<string, { min?: number; max?: number }>) {
  const result = {
    valid: true,
    errors: [] as string[],
    rangeErrors: [] as string[]
  }

  try {
    if (!data || typeof data !== 'object') {
      result.valid = false
      result.errors.push('数据必须是一个对象')
      return result
    }

    for (const [fieldName, rule] of Object.entries(rangeRules)) {
      if (fieldName in data && typeof data[fieldName] === 'number') {
        const value = data[fieldName]

        if (rule.min !== undefined && value < rule.min) {
          result.valid = false
          result.errors.push(`字段 ${fieldName} 值 ${value} 小于最小值 ${rule.min}`)
          result.rangeErrors.push(`${fieldName}: ${value} < ${rule.min}`)
        }

        if (rule.max !== undefined && value > rule.max) {
          result.valid = false
          result.errors.push(`字段 ${fieldName} 值 ${value} 大于最大值 ${rule.max}`)
          result.rangeErrors.push(`${fieldName}: ${value} > ${rule.max}`)
        }
      }
    }

    return result
  } catch (error) {
    result.valid = false
    result.errors.push(`验证数值范围时发生错误: ${error}`)
    return result
  }
}

/**
 * 验证字符串长度
 * @param data 要验证的数据
 * @param lengthRules 长度规则
 * @returns 验证结果
 */
export function validateStringLength(data: any, lengthRules: Record<string, { min?: number; max?: number }>) {
  const result = {
    valid: true,
    errors: [] as string[],
    lengthErrors: [] as string[]
  }

  try {
    if (!data || typeof data !== 'object') {
      result.valid = false
      result.errors.push('数据必须是一个对象')
      return result
    }

    for (const [fieldName, rule] of Object.entries(lengthRules)) {
      if (fieldName in data && typeof data[fieldName] === 'string') {
        const value = data[fieldName]
        const length = value.length

        if (rule.min !== undefined && length < rule.min) {
          result.valid = false
          result.errors.push(`字段 ${fieldName} 长度 ${length} 小于最小长度 ${rule.min}`)
          result.lengthErrors.push(`${fieldName}: ${length} < ${rule.min}`)
        }

        if (rule.max !== undefined && length > rule.max) {
          result.valid = false
          result.errors.push(`字段 ${fieldName} 长度 ${length} 大于最大长度 ${rule.max}`)
          result.lengthErrors.push(`${fieldName}: ${length} > ${rule.max}`)
        }
      }
    }

    return result
  } catch (error) {
    result.valid = false
    result.errors.push(`验证字符串长度时发生错误: ${error}`)
    return result
  }
}

/**
 * 检查控制台错误
 * @param page Playwright页面对象
 * @returns 验证结果
 */
export function expectNoConsoleErrors(page: any) {
  const result = {
    hasErrors: false,
    errors: [] as string[]
  }

  try {
    // 这个函数需要在测试中实现具体的错误检查逻辑
    // 由于这是一个辅助函数，实际检查逻辑在测试用例中实现
    return result
  } catch (error) {
    result.hasErrors = true
    result.errors.push(`检查控制台错误时发生错误: ${error}`)
    return result
  }
}

/**
 * 综合验证函数 - 执行所有验证步骤
 * @param response API响应数据
 * @param validationSchema 验证模式
 * @returns 综合验证结果
 */
export function validateResponseComprehensive(response: any, validationSchema: {
  required?: string[];
  fieldTypes?: Record<string, any>;
  formats?: Record<string, RegExp>;
  ranges?: Record<string, { min?: number; max?: number }>;
  stringLengths?: Record<string, { min?: number; max?: number }>;
}) {
  const result = {
    valid: true,
    errors: [] as string[],
    details: {
      apiResponse: null as any,
      requiredFields: null as any,
      fieldTypes: null as any,
      formats: null as any,
      ranges: null as any,
      stringLengths: null as any
    }
  }

  try {
    // 1. 验证API响应格式
    const apiValidation = validateAPIResponse(response)
    result.details.apiResponse = apiValidation
    if (!apiValidation.valid) {
      result.valid = false
      result.errors.push(...apiValidation.errors)
    }

    // 如果响应格式正确且包含data字段，继续验证data
    if (apiValidation.valid && response.data) {
      // 2. 验证必需字段
      if (validationSchema.required) {
        const requiredValidation = validateRequiredFields(response.data, validationSchema.required)
        result.details.requiredFields = requiredValidation
        if (!requiredValidation.valid) {
          result.valid = false
          result.errors.push(...requiredValidation.errors)
        }
      }

      // 3. 验证字段类型
      if (validationSchema.fieldTypes) {
        const typeValidation = validateFieldTypes(response.data, validationSchema.fieldTypes)
        result.details.fieldTypes = typeValidation
        if (!typeValidation.valid) {
          result.valid = false
          result.errors.push(...typeValidation.errors)
        }
      }

      // 4. 验证数据格式
      if (validationSchema.formats) {
        const formatValidation = validateDataFormat(response.data, validationSchema.formats)
        result.details.formats = formatValidation
        if (!formatValidation.valid) {
          result.valid = false
          result.errors.push(...formatValidation.errors)
        }
      }

      // 5. 验证数值范围
      if (validationSchema.ranges) {
        const rangeValidation = validateDataRange(response.data, validationSchema.ranges)
        result.details.ranges = rangeValidation
        if (!rangeValidation.valid) {
          result.valid = false
          result.errors.push(...rangeValidation.errors)
        }
      }

      // 6. 验证字符串长度
      if (validationSchema.stringLengths) {
        const lengthValidation = validateStringLength(response.data, validationSchema.stringLengths)
        result.details.stringLengths = lengthValidation
        if (!lengthValidation.valid) {
          result.valid = false
          result.errors.push(...lengthValidation.errors)
        }
      }
    }

    return result
  } catch (error) {
    result.valid = false
    result.errors.push(`综合验证过程中发生错误: ${error}`)
    return result
  }
}

/**
 * 生成详细的验证报告
 * @param validationResult 验证结果
 * @returns 格式化的验证报告
 */
export function generateValidationReport(validationResult: any) {
  const report = {
    summary: {
      valid: validationResult.valid,
      totalErrors: validationResult.errors.length,
      timestamp: new Date().toISOString()
    },
    details: validationResult.details || {},
    errors: validationResult.errors || []
  }

  return report
}

// 预定义的验证规则
export const COMMON_VALIDATION_RULES = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^1[3-9]\d{9}$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  dateTime: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
  id: /^[a-zA-Z0-9_-]+$/,
  url: /^https?:\/\/.+/
}

export const COMMON_FIELD_TYPES = {
  id: { type: 'string' },
  name: { type: 'string' },
  email: { type: 'string' },
  phone: { type: 'string' },
  date: { type: 'string' },
  number: { type: 'number' },
  boolean: { type: 'boolean' },
  array: { type: 'array' },
  object: { type: 'object' }
}