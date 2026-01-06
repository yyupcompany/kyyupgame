/**
 * API验证工具
 * 提供API响应验证、数据结构检查等功能
 */

import { test, expect, Page } from '@playwright/test'
import { ApiEndpoint, getAllApiEndpoints } from '../config/api-endpoints'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  responseTime: number
  statusCode: number
  dataStructure?: any
}

export interface ApiTestOptions {
  method?: string
  headers?: Record<string, string>
  body?: any
  expectedStatus?: number
  timeout?: number
  validateSchema?: boolean
}

export class ApiValidators {
  /**
   * 验证API响应数据结构
   */
  static async validateApiResponse(
    page: Page,
    endpoint: string,
    options: ApiTestOptions = {}
  ): Promise<ValidationResult> {
    const {
      method = 'GET',
      headers = {},
      body,
      expectedStatus = 200,
      timeout = 10000,
      validateSchema = true
    } = options

    const startTime = Date.now()
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      responseTime: 0,
      statusCode: 0
    }

    try {
      // 执行API调用
      const response = await page.evaluate(async ({ endpoint, method, headers, body, timeout }) => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        try {
          const response = await fetch(endpoint, {
            method,
            headers: {
              'Content-Type': 'application/json',
              ...headers
            },
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal
          })

          clearTimeout(timeoutId)

          let data
          try {
            data = await response.json()
          } catch {
            data = await response.text()
          }

          return {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            data
          }
        } catch (error) {
          clearTimeout(timeoutId)
          throw error
        }
      }, { endpoint, method, headers, body, timeout })

      const responseTime = Date.now() - startTime
      result.responseTime = responseTime
      result.statusCode = response.status

      // 验证状态码
      if (response.status !== expectedStatus) {
        result.isValid = false
        result.errors.push(`Expected status ${expectedStatus}, got ${response.status}`)
      }

      // 验证响应时间
      if (responseTime > 5000) {
        result.warnings.push(`Slow response: ${responseTime}ms`)
      }

      // 验证响应数据结构
      if (validateSchema && response.data) {
        const schemaValidation = this.validateResponseSchema(response.data)
        if (!schemaValidation.isValid) {
          result.isValid = false
          result.errors.push(...schemaValidation.errors)
        }
        result.warnings.push(...schemaValidation.warnings)
        result.dataStructure = schemaValidation.structure
      }

      result.dataStructure = response.data

    } catch (error) {
      result.isValid = false
      result.errors.push(`API call failed: ${error.message}`)
    }

    return result
  }

  /**
   * 验证标准API响应结构
   */
  private static validateResponseSchema(data: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      responseTime: 0,
      statusCode: 0
    }

    // 基本结构验证
    if (!data || typeof data !== 'object') {
      result.isValid = false
      result.errors.push('Response is not a valid object')
      return result
    }

    // 检查必要字段
    const requiredFields = ['code', 'message']
    for (const field of requiredFields) {
      if (!(field in data)) {
        result.isValid = false
        result.errors.push(`Missing required field: ${field}`)
      }
    }

    // 检查字段类型
    if ('code' in data && typeof data.code !== 'number') {
      result.errors.push('Field "code" should be a number')
    }

    if ('message' in data && typeof data.message !== 'string') {
      result.errors.push('Field "message" should be a string')
    }

    if ('data' in data && data.data !== null && typeof data.data !== 'object' && !Array.isArray(data.data)) {
      result.warnings.push('Field "data" should be an object or array or null')
    }

    // 检查时间戳
    if ('timestamp' in data) {
      const timestamp = new Date(data.timestamp)
      if (isNaN(timestamp.getTime())) {
        result.warnings.push('Field "timestamp" is not a valid date')
      }
    }

    result.structure = data
    return result
  }

  /**
   * 验证特定API端点
   */
  static async validateEndpoint(
    page: Page,
    endpoint: ApiEndpoint,
    testData?: any
  ): Promise<ValidationResult> {
    const options: ApiTestOptions = {
      method: endpoint.method,
      expectedStatus: endpoint.expectedStatus || 200
    }

    // 根据请求方法添加请求体
    if (['POST', 'PUT', 'PATCH'].includes(endpoint.method) && testData) {
      options.body = testData
    }

    return await this.validateApiResponse(page, endpoint.path, options)
  }

  /**
   * 批量验证API端点
   */
  static async validateMultipleEndpoints(
    page: Page,
    endpoints: ApiEndpoint[],
    testDataGenerator?: (endpoint: ApiEndpoint) => any
  ): Promise<Record<string, ValidationResult>> {
    const results: Record<string, ValidationResult> = {}

    for (const endpoint of endpoints) {
      const testData = testDataGenerator ? testDataGenerator(endpoint) : undefined
      results[endpoint.path] = await this.validateEndpoint(page, endpoint, testData)
    }

    return results
  }

  /**
   * 验证CRUD操作完整性
   */
  static async validateCrudOperations(
    page: Page,
    baseEndpoint: string,
    createData: any,
    updateData: any
  ): Promise<{
    create: ValidationResult
    read: ValidationResult
    update: ValidationResult
    delete: ValidationResult
  }> {
    const results = {
      create: await this.validateApiResponse(page, baseEndpoint, {
        method: 'POST',
        body: createData,
        expectedStatus: 201
      }),
      read: await this.validateApiResponse(page, `${baseEndpoint}/1`),
      update: await this.validateApiResponse(page, `${baseEndpoint}/1`, {
        method: 'PUT',
        body: updateData,
        expectedStatus: 200
      }),
      delete: await this.validateApiResponse(page, `${baseEndpoint}/1`, {
        method: 'DELETE',
        expectedStatus: 200
      })
    }

    return results
  }

  /**
   * 验证分页数据结构
   */
  static validatePaginationStructure(data: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      responseTime: 0,
      statusCode: 0
    }

    if (!data || !data.data) {
      result.isValid = false
      result.errors.push('Missing data property in paginated response')
      return result
    }

    const pagination = data.data
    const requiredFields = ['list', 'pagination']

    for (const field of requiredFields) {
      if (!(field in pagination)) {
        result.isValid = false
        result.errors.push(`Missing pagination field: ${field}`)
      }
    }

    // 验证分页信息
    if (pagination.pagination) {
      const paginationFields = ['page', 'pageSize', 'total', 'totalPages']
      for (const field of paginationFields) {
        if (!(field in pagination.pagination)) {
          result.warnings.push(`Missing pagination metadata: ${field}`)
        }
      }
    }

    // 验证列表数据
    if (pagination.list && !Array.isArray(pagination.list)) {
      result.isValid = false
      result.errors.push('List field should be an array')
    }

    return result
  }

  /**
   * 验证错误处理
   */
  static async validateErrorHandling(
    page: Page,
    endpoint: string,
    expectedError: number
  ): Promise<ValidationResult> {
    return await this.validateApiResponse(page, endpoint, {
      expectedStatus: expectedError
    })
  }

  /**
   * 性能测试
   */
  static async validatePerformance(
    page: Page,
    endpoint: string,
    maxResponseTime: number = 2000,
    iterations: number = 5
  ): Promise<{
    averageTime: number
    minTime: number
    maxTime: number
    successRate: number
  }> {
    const times: number[] = let successCount = 0

    for (let i = 0; i < iterations; i++) {
      const result = await this.validateApiResponse(page, endpoint)
      if (result.isValid) {
        successCount++
        times.push(result.responseTime)
      }
    }

    const averageTime = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0
    const minTime = times.length > 0 ? Math.min(...times) : 0
    const maxTime = times.length > 0 ? Math.max(...times) : 0
    const successRate = (successCount / iterations) * 100

    return {
      averageTime,
      minTime,
      maxTime,
      successRate
    }
  }

  /**
   * 验证数据完整性
   */
  static validateDataIntegrity(data: any, schema: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      responseTime: 0,
      statusCode: 0
    }

    const validateObject = (obj: any, schemaObj: any, path: string = '') => {
      for (const key in schemaObj) {
        const currentPath = path ? `${path}.${key}` : key
        const expectedType = schemaObj[key]
        const actualValue = obj?.[key]

        if (actualValue === undefined || actualValue === null) {
          if (expectedType.required) {
            result.errors.push(`Missing required field: ${currentPath}`)
          }
          continue
        }

        // 类型验证
        if (expectedType.type && typeof actualValue !== expectedType.type) {
          result.errors.push(`Field ${currentPath} should be ${expectedType.type}, got ${typeof actualValue}`)
        }

        // 嵌套对象验证
        if (expectedType.properties && typeof actualValue === 'object') {
          validateObject(actualValue, expectedType.properties, currentPath)
        }

        // 数组验证
        if (expectedType.items && Array.isArray(actualValue)) {
          actualValue.forEach((item, index) => {
            if (typeof expectedType.items === 'object') {
              validateObject(item, expectedType.items, `${currentPath}[${index}]`)
            }
          })
        }
      }
    }

    validateObject(data, schema)
    return result
  }

  /**
   * 生成API测试报告
   */
  static generateApiReport(results: Record<string, ValidationResult>): {
    totalEndpoints: number
    successCount: number
    failureCount: number
    averageResponseTime: number
    issues: string[]
  } {
    const endpoints = Object.values(results)
    const successCount = endpoints.filter(r => r.isValid).length
    const failureCount = endpoints.length - successCount
    const totalResponseTime = endpoints.reduce((sum, r) => sum + r.responseTime, 0)
    const averageResponseTime = endpoints.length > 0 ? totalResponseTime / endpoints.length : 0

    const issues: string[] = []
    endpoints.forEach((result, endpoint) => {
      if (!result.isValid) {
        issues.push(`${endpoint}: ${result.errors.join(', ')}`)
      }
      result.warnings.forEach(warning => {
        issues.push(`${endpoint}: WARNING - ${warning}`)
      })
    })

    return {
      totalEndpoints: endpoints.length,
      successCount,
      failureCount,
      averageResponseTime,
      issues
    }
  }
}