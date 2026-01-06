/**
 * 验证工具函数
 * 从 AIAssistant.vue 第2528-2583行提取
 */

// 判断是否为组件结果
export const isComponentResult = (result: any): boolean => {
  if (!result) return false

  // 如果是字符串，尝试解析为JSON
  if (typeof result === 'string') {
    try {
      const parsed = JSON.parse(result)
      return parsed && typeof parsed === 'object' && parsed.type
    } catch (e) {
      return false
    }
  }

  // 修复：支持各种工具返回结果的结构
  if (result && typeof result === 'object') {
    // 1. 检查是否有 ui_instruction 字段（统计工具的返回结果）
    if (result.ui_instruction && typeof result.ui_instruction === 'object') {
      const uiInstruction = result.ui_instruction
      // 支持 render_statistics, render_chart, render_table 等类型
      if (uiInstruction.type && ['render_statistics', 'render_chart', 'render_table', 'render_component'].includes(uiInstruction.type)) {
        return true
      }
    }

    // 2. 检查是否有 component 字段（render_component 工具的返回结果）
    if (result.component && typeof result.component === 'object' && result.component.type) {
      return true
    }

    // 3. 检查是否有嵌套的 result.component 字段
    if (result.result && typeof result.result === 'object' && result.result.component && typeof result.result.component === 'object' && result.result.component.type) {
      return true
    }

    // 4. 检查是否有嵌套的 result.ui_instruction 字段
    if (result.result && typeof result.result === 'object' && result.result.ui_instruction && typeof result.result.ui_instruction === 'object') {
      const uiInstruction = result.result.ui_instruction
      if (uiInstruction.type && ['render_statistics', 'render_chart', 'render_table', 'render_component'].includes(uiInstruction.type)) {
        return true
      }
    }

    // 5. 检查是否有 type 字段（直接的组件数据）
    if (result.type) {
      return true
    }

    // 6. 检查是否有 statistics 字段和 ui_instruction（活动统计工具特殊格式）
    if (result.statistics && result.ui_instruction) {
      return true
    }
  }

  return false
}

// 判断是否可以可视化展示
export const canVisualizeResult = (result: any): boolean => {
  if (!result) return false

  // 如果是字符串，尝试解析为JSON
  let parsedResult = result
  if (typeof result === 'string') {
    try {
      parsedResult = JSON.parse(result)
    } catch (e) {
      return false
    }
  }

  // 检查是否包含可视化数据
  if (parsedResult && typeof parsedResult === 'object') {
    // 检查是否有图表数据
    if (parsedResult.chartData || parsedResult.chart_data) {
      return true
    }

    // 检查是否有表格数据
    if (parsedResult.tableData || parsedResult.table_data) {
      return true
    }

    // 检查是否有统计数据
    if (parsedResult.statistics || parsedResult.stats) {
      return true
    }

    // 检查是否有数组数据（可能是列表）
    if (Array.isArray(parsedResult) && parsedResult.length > 0) {
      return true
    }

    // 检查是否有数据字段
    if (parsedResult.data && (Array.isArray(parsedResult.data) || typeof parsedResult.data === 'object')) {
      return true
    }
  }

  return false
}

// 验证必填字段
export const validateRequiredFields = <T>(
  data: any,
  requiredFields: (keyof T)[]
): { valid: boolean; missing: string[] } => {
  const missing: string[] = []

  if (!data || typeof data !== 'object') {
    return { valid: false, missing: requiredFields.map(field => String(field)) }
  }

  for (const field of requiredFields) {
    if (!(field in data) || data[field] === undefined || data[field] === null) {
      missing.push(String(field))
    }
  }

  return {
    valid: missing.length === 0,
    missing
  }
}

// 验证字段类型
export const validateFieldTypes = <T>(
  data: any,
  fieldTypes: Partial<Record<keyof T, string>>
): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Data is not an object'] }
  }

  for (const [field, expectedType] of Object.entries(fieldTypes)) {
    if (field in data) {
      const actualType = typeof data[field]
      const value = data[field]

      switch (expectedType) {
        case 'string':
          if (actualType !== 'string') {
            errors.push(`Field '${field}' should be string, got ${actualType}`)
          }
          break
        case 'number':
          if (actualType !== 'number' || isNaN(value)) {
            errors.push(`Field '${field}' should be number, got ${actualType}`)
          }
          break
        case 'boolean':
          if (actualType !== 'boolean') {
            errors.push(`Field '${field}' should be boolean, got ${actualType}`)
          }
          break
        case 'array':
          if (!Array.isArray(value)) {
            errors.push(`Field '${field}' should be array, got ${actualType}`)
          }
          break
        case 'object':
          if (actualType !== 'object' || Array.isArray(value) || value === null) {
            errors.push(`Field '${field}' should be object, got ${actualType}`)
          }
          break
        case 'date':
          if (!(value instanceof Date) && !isValidDateString(value)) {
            errors.push(`Field '${field}' should be valid date, got ${actualType}`)
          }
          break
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// 验证枚举值
export const validateEnumValue = <T>(
  value: any,
  enumObject: T
): boolean => {
  if (!enumObject || typeof enumObject !== 'object') {
    return false
  }

  const enumValues = Object.values(enumObject)
  return enumValues.includes(value)
}

// 验证日期格式
export const validateDateFormat = (dateString: string): boolean => {
  if (!dateString || typeof dateString !== 'string') {
    return false
  }

  // 尝试解析日期
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

// 验证是否为有效日期字符串
const isValidDateString = (value: any): boolean => {
  if (typeof value !== 'string') {
    return false
  }
  return validateDateFormat(value)
}

// 验证URL格式
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// 验证邮箱格式
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 验证手机号格式（中国）
export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

// 验证身份证号格式（中国）
export const validateIdCard = (idCard: string): boolean => {
  const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  return idCardRegex.test(idCard)
}

// 验证数值范围
export const validateNumberRange = (
  value: number,
  min?: number,
  max?: number
): boolean => {
  if (typeof value !== 'number' || isNaN(value)) {
    return false
  }

  if (min !== undefined && value < min) {
    return false
  }

  if (max !== undefined && value > max) {
    return false
  }

  return true
}

// 验证字符串长度
export const validateStringLength = (
  value: string,
  minLength?: number,
  maxLength?: number
): boolean => {
  if (typeof value !== 'string') {
    return false
  }

  if (minLength !== undefined && value.length < minLength) {
    return false
  }

  if (maxLength !== undefined && value.length > maxLength) {
    return false
  }

  return true
}

// 验证数组长度
export const validateArrayLength = (
  value: any[],
  minLength?: number,
  maxLength?: number
): boolean => {
  if (!Array.isArray(value)) {
    return false
  }

  if (minLength !== undefined && value.length < minLength) {
    return false
  }

  if (maxLength !== undefined && value.length > maxLength) {
    return false
  }

  return true
}

// 深度验证对象结构
export const validateObjectStructure = (
  data: any,
  schema: any
): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  const validateRecursive = (obj: any, schemaObj: any, path: string = '') => {
    if (typeof schemaObj !== 'object' || schemaObj === null) {
      return
    }

    for (const [key, expectedType] of Object.entries(schemaObj)) {
      const currentPath = path ? `${path}.${key}` : key
      
      if (!(key in obj)) {
        errors.push(`Missing required field: ${currentPath}`)
        continue
      }

      const value = obj[key]
      
      if (typeof expectedType === 'string') {
        // 简单类型验证
        const typeValidation = validateFieldTypes({ [key]: value }, { [key]: expectedType })
        if (!typeValidation.valid) {
          errors.push(...typeValidation.errors.map(error => error.replace(`'${key}'`, `'${currentPath}'`)))
        }
      } else if (typeof expectedType === 'object' && expectedType !== null) {
        // 嵌套对象验证
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          validateRecursive(value, expectedType, currentPath)
        } else {
          errors.push(`Field '${currentPath}' should be object, got ${typeof value}`)
        }
      }
    }
  }

  validateRecursive(data, schema)

  return {
    valid: errors.length === 0,
    errors
  }
}
