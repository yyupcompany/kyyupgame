/**
 * Mock真实性验证工具
 * 确保Mock数据与真实API响应结构完全一致
 */

export interface ValidationRule {
  field: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'null' | 'any'
  required?: boolean
  minLength?: number
  maxLength?: number
  enum?: any[]
  nested?: ValidationRule[]
}

export interface ApiSpec {
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  successResponse: ValidationRule[]
  errorResponse?: ValidationRule[]
  statusCode?: number
}

/**
 * 严格的验证规则
 */
export const STRICT_VALIDATION_RULES: Record<string, ApiSpec[]> = {
  // Auto Image API
  'auto-image': [
    {
      endpoint: '/auto-image/generate',
      method: 'POST',
      successResponse: [
        { field: 'success', type: 'boolean', required: true },
        { field: 'data', type: 'object', required: true,
          nested: [
            { field: 'imageUrl', type: 'string', required: true },
            { field: 'usage', type: 'object', required: false,
              nested: [
                { field: 'generated_images', type: 'number', required: true },
                { field: 'output_tokens', type: 'number', required: true },
                { field: 'total_tokens', type: 'number', required: true }
              ]
            },
            { field: 'metadata', type: 'object', required: false,
              nested: [
                { field: 'prompt', type: 'string', required: true },
                { field: 'model', type: 'string', required: true },
                { field: 'parameters', type: 'object', required: true },
                { field: 'duration', type: 'number', required: true }
              ]
            }
          ]
        },
        { field: 'message', type: 'string', required: true }
      ]
    },
    {
      endpoint: '/auto-image/activity',
      method: 'POST',
      successResponse: [
        { field: 'success', type: 'boolean', required: true },
        { field: 'data', type: 'object', required: true,
          nested: [
            { field: 'imageUrl', type: 'string', required: true },
            { field: 'usage', type: 'object', required: true,
              nested: [
                { field: 'generated_images', type: 'number', required: true },
                { field: 'output_tokens', type: 'number', required: true }
              ]
            }
          ]
        },
        { field: 'message', type: 'string', required: true }
      ]
    },
    {
      endpoint: '/auto-image/status',
      method: 'GET',
      successResponse: [
        { field: 'success', type: 'boolean', required: true },
        { field: 'data', type: 'object', required: true,
          nested: [
            { field: 'available', type: 'boolean', required: true },
            { field: 'model', type: 'string', required: false },
            { field: 'error', type: 'string', required: false }
          ]
        },
        { field: 'message', type: 'string', required: true }
      ]
    }
  ],

  // Auth API
  'auth': [
    {
      endpoint: '/auth/login',
      method: 'POST',
      successResponse: [
        { field: 'success', type: 'boolean', required: true },
        { field: 'data', type: 'object', required: true,
          nested: [
            { field: 'token', type: 'string', required: true },
            { field: 'user', type: 'object', required: true,
              nested: [
                { field: 'id', type: 'number', required: true },
                { field: 'username', type: 'string', required: true },
                { field: 'role', type: 'string', required: true },
                { field: 'email', type: 'string', required: false }
              ]
            },
            { field: 'expiresIn', type: 'number', required: true }
          ]
        },
        { field: 'message', type: 'string', required: true }
      ]
    },
    {
      endpoint: '/auth/profile',
      method: 'GET',
      successResponse: [
        { field: 'success', type: 'boolean', required: true },
        { field: 'data', type: 'object', required: true,
          nested: [
            { field: 'id', type: 'number', required: true },
            { field: 'username', type: 'string', required: true },
            { field: 'role', type: 'string', required: true },
            { field: 'email', type: 'string', required: false },
            { field: 'avatar', type: 'string', required: false }
          ]
        },
        { field: 'message', type: 'string', required: true }
      ]
    }
  ],

  // Dashboard API
  'dashboard': [
    {
      endpoint: '/dashboard/stats',
      method: 'GET',
      successResponse: [
        { field: 'success', type: 'boolean', required: true },
        { field: 'data', type: 'object', required: true,
          nested: [
            { field: 'totalStudents', type: 'number', required: true },
            { field: 'totalTeachers', type: 'number', required: true },
            { field: 'totalClasses', type: 'number', required: true },
            { field: 'activeEnrollments', type: 'number', required: true },
            { field: 'todayAttendance', type: 'number', required: true },
            { field: 'pendingTasks', type: 'number', required: true }
          ]
        },
        { field: 'message', type: 'string', required: false }
      ]
    },
    {
      endpoint: '/dashboard/todos',
      method: 'GET',
      successResponse: [
        { field: 'success', type: 'boolean', required: true },
        { field: 'data', type: 'object', required: true,
          nested: [
            { field: 'items', type: 'array', required: true },
            { field: 'total', type: 'number', required: true },
            { field: 'page', type: 'number', required: true },
            { field: 'pageSize', type: 'number', required: true }
          ]
        },
        { field: 'message', type: 'string', required: false }
      ]
    }
  ]
}

/**
 * 验证单个字段
 */
function validateField(path: string, value: any, rule: ValidationRule): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // 检查必填字段
  if (rule.required && (value === undefined || value === null || value === '')) {
    errors.push(`${path}: 必填字段缺失`)
    return { valid: false, errors }
  }

  // 如果字段不是必填且值为空，跳过其他验证
  if (!rule.required && (value === undefined || value === null || value === '')) {
    return { valid: true, errors }
  }

  // 类型检查
  if (rule.type !== 'any') {
    const actualType = Array.isArray(value) ? 'array' : typeof value
    if (actualType !== rule.type) {
      errors.push(`${path}: 期望类型 ${rule.type}, 实际类型 ${actualType}`)
    }
  }

  // 长度检查
  if (rule.type === 'string' && typeof value === 'string') {
    if (rule.minLength && value.length < rule.minLength) {
      errors.push(`${path}: 长度不能少于 ${rule.minLength} 字符`)
    }
    if (rule.maxLength && value.length > rule.maxLength) {
      errors.push(`${path}: 长度不能超过 ${rule.maxLength} 字符`)
    }
  }

  // 枚举检查
  if (rule.enum && !rule.enum.includes(value)) {
    errors.push(`${path}: 值必须是 [${rule.enum.join(', ')}] 中的一个`)
  }

  // 嵌套对象验证
  if (rule.type === 'object' && rule.nested && typeof value === 'object') {
    rule.nested.forEach(nestedRule => {
      const nestedResult = validateField(`${path}.${nestedRule.field}`, value[nestedRule.field], nestedRule)
      errors.push(...nestedResult.errors)
    })
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 验证API响应
 */
export function validateApiResponse(endpoint: string, method: string, response: any): {
  valid: boolean;
  errors: string[];
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // 查找对应的API规范
  let apiSpec: ApiSpec | null = null
  for (const [category, specs] of Object.entries(STRICT_VALIDATION_RULES)) {
    apiSpec = specs.find(spec => spec.endpoint === endpoint && spec.method === method) || null
    if (apiSpec) break
  }

  if (!apiSpec) {
    warnings.push(`未找到API规范: ${method} ${endpoint}`)
    return { valid: true, errors, warnings }
  }

  // 验证成功响应结构
  apiSpec.successResponse.forEach(rule => {
    const result = validateField(rule.field, response[rule.field], rule)
    errors.push(...result.errors)
  })

  // 检查额外字段
  const expectedFields = apiSpec.successResponse.map(rule => rule.field)
  const actualFields = Object.keys(response)
  const extraFields = actualFields.filter(field => !expectedFields.includes(field))

  if (extraFields.length > 0) {
    warnings.push(`发现额外字段: ${extraFields.join(', ')}`)
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Mock真实性验证器
 */
export class MockRealismValidator {
  private validationResults: Map<string, any> = new Map()

  /**
   * 验证Mock响应
   */
  validateMock(endpoint: string, method: string, mockResponse: any): boolean {
    const result = validateApiResponse(endpoint, method, mockResponse)
    this.validationResults.set(`${method} ${endpoint}`, result)

    if (!result.valid || result.warnings.length > 0) {
      console.warn(`🔍 Mock验证结果 ${method} ${endpoint}:`, {
        valid: result.valid,
        errors: result.errors,
        warnings: result.warnings
      })
    }

    return result.valid
  }

  /**
   * 获取所有验证结果
   */
  getValidationResults(): Record<string, any> {
    const results: Record<string, any> = {}
    this.validationResults.forEach((value, key) => {
      results[key] = value
    })
    return results
  }

  /**
   * 生成验证报告
   */
  generateReport(): string {
    const results = this.getValidationResults()
    const report = ['📋 Mock真实性验证报告', '='.repeat(50), '']

    let totalValid = 0
    let totalInvalid = 0

    Object.entries(results).forEach(([endpoint, result]) => {
      report.push(`🔍 ${endpoint}:`)
      report.push(`   ✅ 通过: ${result.valid}`)

      if (result.errors && result.errors.length > 0) {
        result.errors.forEach((error: string) => {
          report.push(`   ❌ 错误: ${error}`)
        })
        totalInvalid++
      } else {
        totalValid++
      }

      if (result.warnings && result.warnings.length > 0) {
        result.warnings.forEach((warning: string) => {
          report.push(`   ⚠️  警告: ${warning}`)
        })
      }

      report.push('')
    })

    report.push('📊 总计:')
    report.push(`   ✅ 通过: ${totalValid}`)
    report.push(`   ❌ 失败: ${totalInvalid}`)
    report.push(`   📈 成功率: ${((totalValid / (totalValid + totalInvalid)) * 100).toFixed(1)}%`)

    return report.join('\n')
  }

  /**
   * 清除验证结果
   */
  clearResults(): void {
    this.validationResults.clear()
  }
}

// 全局验证器实例
export const globalMockValidator = new MockRealismValidator()

/**
 * 便捷的验证函数
 */
export function validateMockRealism(endpoint: string, method: string, response: any): boolean {
  return globalMockValidator.validateMock(endpoint, method, response)
}

/**
 * 严格验证工具
 * 遵循项目要求的所有验证规则
 */
export const strictValidationTools = {
  validateRequiredFields: (response: any, requiredFields: string[]): { valid: boolean; missing: string[] } => {
    const missing = requiredFields.filter(field => !(field in response) || response[field] === null || response[field] === undefined)
    return {
      valid: missing.length === 0,
      missing
    }
  },

  validateFieldTypes: (response: any, expectedTypes: Record<string, string>): { valid: boolean; typeErrors: string[] } => {
    const typeErrors: string[] = []

    Object.entries(expectedTypes).forEach(([field, expectedType]) => {
      if (field in response && response[field] !== null && response[field] !== undefined) {
        const actualType = Array.isArray(response[field]) ? 'array' : typeof response[field]
        if (actualType !== expectedType) {
          typeErrors.push(`${field}: 期望 ${expectedType}, 实际 ${actualType}`)
        }
      }
    })

    return {
      valid: typeErrors.length === 0,
      typeErrors
    }
  },

  detectConsoleErrors: (callback: Function): { hasErrors: boolean; errors: any[] } => {
    const errors: any[] = []
    const originalError = console.error
    const originalWarn = console.warn

    console.error = (...args) => errors.push({ type: 'error', args })
    console.warn = (...args) => errors.push({ type: 'warn', args })

    try {
      callback()
    } finally {
      console.error = originalError
      console.warn = originalWarn
    }

    return {
      hasErrors: errors.length > 0,
      errors
    }
  }
}

export default {
  MockRealismValidator,
  globalMockValidator,
  validateMockRealism,
  validateApiResponse,
  strictValidationTools,
  STRICT_VALIDATION_RULES
}