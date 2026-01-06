/**
 * 严格的测试验证工具
 * 实施STRICT_TEST_VALIDATION.md规则
 */

import { expect } from 'vitest'

// 控制台错误收集器
class ConsoleErrorCollector {
  private errors: Array<{
    type: string
    message: string
    timestamp: number
    source?: string
  }> = []

  private originalConsole: {
    error: typeof console.error
    warn: typeof console.warn
    log: typeof console.log
  }

  constructor() {
    this.originalConsole = {
      error: console.error,
      warn: console.warn,
      log: console.log
    }
  }

  // 开始收集控制台错误
  startCollecting() {
    this.errors = []

    console.error = (...args: any[]) => {
      this.errors.push({
        type: 'error',
        message: args.join(' '),
        timestamp: Date.now(),
        source: this.getCaller()
      })
      this.originalConsole.error(...args)
    }

    console.warn = (...args: any[]) => {
      this.errors.push({
        type: 'warn',
        message: args.join(' '),
        timestamp: Date.now(),
        source: this.getCaller()
      })
      this.originalConsole.warn(...args)
    }
  }

  // 停止收集并恢复原始控制台
  stopCollecting() {
    console.error = this.originalConsole.error
    console.warn = this.originalConsole.warn
    console.log = this.originalConsole.log
  }

  // 获取调用者信息
  private getCaller(): string {
    const stack = new Error().stack
    if (!stack) return 'unknown'

    const lines = stack.split('\n')
    // 跳过当前函数和收集器函数的调用栈
    for (let i = 3; i < lines.length; i++) {
      const line = lines[i]
      if (line && !line.includes('console-error-collector') && !line.includes('node_modules')) {
        return line.trim()
      }
    }
    return 'unknown'
  }

  // 获取收集的错误
  getErrors() {
    return [...this.errors]
  }

  // 检查是否有错误
  hasErrors(): boolean {
    return this.errors.length > 0
  }

  // 清空错误记录
  clear() {
    this.errors = []
  }

  // 获取错误摘要
  getSummary(): {
    total: number
    errors: number
    warnings: number
    byType: Record<string, number>
  } {
    const summary = {
      total: this.errors.length,
      errors: 0,
      warnings: 0,
      byType: {} as Record<string, number>
    }

    this.errors.forEach(error => {
      if (error.type === 'error') summary.errors++
      if (error.type === 'warn') summary.warnings++

      summary.byType[error.type] = (summary.byType[error.type] || 0) + 1
    })

    return summary
  }
}

// 创建全局错误收集器实例
const errorCollector = new ConsoleErrorCollector()

// 严格验证工具类
export class StrictTestValidator {
  /**
   * 验证必填字段
   * @param response API响应对象
   * @param requiredFields 必填字段列表
   * @param options 验证选项
   */
  static validateRequiredFields(
    response: any,
    requiredFields: string[],
    options: {
      allowEmptyString?: boolean
      allowNull?: boolean
      allowUndefined?: boolean
      customMessage?: string
    } = {}
  ): void {
    const {
      allowEmptyString = false,
      allowNull = false,
      allowUndefined = false,
      customMessage
    } = options

    const missingFields: string[] = []
    const invalidFields: Array<{ field: string; reason: string }> = []

    requiredFields.forEach(field => {
      const value = this.getNestedValue(response, field)

      // 检查字段是否存在
      if (value === undefined && !allowUndefined) {
        missingFields.push(field)
        return
      }

      // 检查是否为null
      if (value === null && !allowNull) {
        invalidFields.push({ field, reason: 'value is null' })
        return
      }

      // 检查是否为空字符串
      if (value === '' && !allowEmptyString) {
        invalidFields.push({ field, reason: 'value is empty string' })
        return
      }
    })

    // 断言结果
    if (missingFields.length > 0 || invalidFields.length > 0) {
      const message = customMessage || this.formatValidationError(missingFields, invalidFields, response)
      expect.fail(message)
    }
  }

  /**
   * 验证字段类型
   * @param response API响应对象
   * @param fieldTypes 字段类型定义
   * @param options 验证选项
   */
  static validateFieldTypes(
    response: any,
    fieldTypes: Record<string, 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function'>,
    options: {
      allowNull?: boolean
      allowUndefined?: boolean
      customMessage?: string
    } = {}
  ): void {
    const {
      allowNull = true,
      allowUndefined = true,
      customMessage
    } = options

    const typeErrors: Array<{ field: string; expectedType: string; actualType: string; value: any }> = []

    Object.entries(fieldTypes).forEach(([field, expectedType]) => {
      const value = this.getNestedValue(response, field)

      // 检查字段是否存在
      if (value === undefined) {
        if (!allowUndefined) {
          typeErrors.push({
            field,
            expectedType,
            actualType: 'undefined',
            value
          })
        }
        return
      }

      // 检查是否为null
      if (value === null) {
        if (!allowNull) {
          typeErrors.push({
            field,
            expectedType,
            actualType: 'null',
            value
          })
        }
        return
      }

      // 检查实际类型
      const actualType = this.getValueType(value)
      if (actualType !== expectedType) {
        typeErrors.push({
          field,
          expectedType,
          actualType,
          value
        })
      }
    })

    // 断言结果
    if (typeErrors.length > 0) {
      const message = customMessage || this.formatTypeValidationError(typeErrors, response)
      expect.fail(message)
    }
  }

  /**
   * 验证API响应结构
   * @param response API响应
   * @param expectedStructure 期望的结构定义
   */
  static validateApiResponseStructure(
    response: any,
    expectedStructure: {
      hasSuccess?: boolean
      hasData?: boolean
      hasMessage?: boolean
      hasCode?: boolean
      customFields?: string[]
    }
  ): void {
    const {
      hasSuccess = true,
      hasData = true,
      hasMessage = true,
      hasCode = false,
      customFields = []
    } = expectedStructure

    const requiredFields = []

    if (hasSuccess) requiredFields.push('success')
    if (hasData) requiredFields.push('data')
    if (hasMessage) requiredFields.push('message')
    if (hasCode) requiredFields.push('code')

    requiredFields.push(...customFields)

    this.validateRequiredFields(response, requiredFields, {
      customMessage: `API响应结构验证失败。期望包含字段: ${requiredFields.join(', ')}`
    })

    // 验证success字段类型
    if (hasSuccess && response.success !== undefined) {
      this.validateFieldTypes(response, {
        success: 'boolean'
      }, {
        customMessage: 'API响应中success字段必须是boolean类型'
      })
    }
  }

  /**
   * 验证没有控制台错误
   * @param customMessage 自定义错误消息
   */
  static expectNoConsoleErrors(customMessage?: string): void {
    const errors = errorCollector.getErrors()
    const errorSummary = errorCollector.getSummary()

    if (errorSummary.errors > 0) {
      const errorDetails = errors
        .filter(e => e.type === 'error')
        .map(e => `  [${e.type}] ${e.message}${e.source ? ` (${e.source})` : ''}`)
        .join('\n')

      const message = customMessage ||
        `检测到控制台错误 (${errorSummary.errors}个):\n${errorDetails}`

      expect.fail(message)
    }

    // 如果有警告，也记录但不失败测试
    if (errorSummary.warnings > 0) {
      const warningDetails = errors
        .filter(e => e.type === 'warn')
        .map(e => `  [${e.type}] ${e.message}${e.source ? ` (${e.source})` : ''}`)
        .join('\n')

      console.warn(`检测到控制台警告 (${errorSummary.warnings}个):\n${warningDetails}`)
    }
  }

  /**
   * 验证Vue组件状态
   * @param wrapper Vue组件wrapper
   * @param expectedStates 期望的状态
   */
  static validateVueComponentState(
    wrapper: any,
    expectedStates: {
      shouldExist?: string[]
      shouldNotExist?: string[]
      shouldBeVisible?: string[]
      shouldBeHidden?: string[]
      shouldBeDisabled?: string[]
      shouldBeEnabled?: string[]
    }
  ): void {
    const {
      shouldExist = [],
      shouldNotExist = [],
      shouldBeVisible = [],
      shouldBeHidden = [],
      shouldBeDisabled = [],
      shouldBeEnabled = []
    } = expectedStates

    const errors: string[] = []

    // 验证元素存在性
    shouldExist.forEach(selector => {
      const element = wrapper.find(selector)
      if (!element.exists()) {
        errors.push(`期望元素存在但未找到: ${selector}`)
      }
    })

    shouldNotExist.forEach(selector => {
      const element = wrapper.find(selector)
      if (element.exists()) {
        errors.push(`期望元素不存在但找到了: ${selector}`)
      }
    })

    // 验证元素可见性
    shouldBeVisible.forEach(selector => {
      const element = wrapper.find(selector)
      if (!element.exists()) {
        errors.push(`期望元素可见但不存在: ${selector}`)
      } else if (!element.isVisible()) {
        errors.push(`期望元素可见但被隐藏: ${selector}`)
      }
    })

    shouldBeHidden.forEach(selector => {
      const element = wrapper.find(selector)
      if (element.exists() && element.isVisible()) {
        errors.push(`期望元素隐藏但可见: ${selector}`)
      }
    })

    // 验证元素状态
    shouldBeDisabled.forEach(selector => {
      const element = wrapper.find(selector)
      if (element.exists() && !element.attributes('disabled')) {
        errors.push(`期望元素禁用但可用: ${selector}`)
      }
    })

    shouldBeEnabled.forEach(selector => {
      const element = wrapper.find(selector)
      if (element.exists() && element.attributes('disabled')) {
        errors.push(`期望元素可用但被禁用: ${selector}`)
      }
    })

    if (errors.length > 0) {
      expect.fail(`Vue组件状态验证失败:\n${errors.join('\n')}`)
    }
  }

  /**
   * 获取嵌套对象的值
   */
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined
    }, obj)
  }

  /**
   * 获取值的实际类型
   */
  private static getValueType(value: any): string {
    if (Array.isArray(value)) return 'array'
    if (value === null) return 'null'
    return typeof value
  }

  /**
   * 格式化验证错误消息
   */
  private static formatValidationError(
    missingFields: string[],
    invalidFields: Array<{ field: string; reason: string }>,
    response: any
  ): string {
    const errors: string[] = []

    if (missingFields.length > 0) {
      errors.push(`缺少必填字段: ${missingFields.join(', ')}`)
    }

    if (invalidFields.length > 0) {
      errors.push(
        `字段验证失败:\n${invalidFields
          .map(f => `  - ${f.field}: ${f.reason}`)
          .join('\n')}`
      )
    }

    errors.push(`响应对象: ${JSON.stringify(response, null, 2)}`)

    return errors.join('\n')
  }

  /**
   * 格式化类型验证错误消息
   */
  private static formatTypeValidationError(
    typeErrors: Array<{
      field: string
      expectedType: string
      actualType: string
      value: any
    }>,
    response: any
  ): string {
    const errors = [
      '字段类型验证失败:',
      ...typeErrors.map(error =>
        `  - ${error.field}: 期望 ${error.expectedType}, 实际 ${error.actualType}, 值: ${JSON.stringify(error.value)}`
      )
    ]

    errors.push(`响应对象: ${JSON.stringify(response, null, 2)}`)

    return errors.join('\n')
  }
}

// 导出便捷方法
export const validateRequiredFields = StrictTestValidator.validateRequiredFields.bind(StrictTestValidator)
export const validateFieldTypes = StrictTestValidator.validateFieldTypes.bind(StrictTestValidator)
export const validateApiResponseStructure = StrictTestValidator.validateApiResponseStructure.bind(StrictTestValidator)
export const expectNoConsoleErrors = StrictTestValidator.expectNoConsoleErrors.bind(StrictTestValidator)
export const validateVueComponentState = StrictTestValidator.validateVueComponentState.bind(StrictTestValidator)
export const startErrorCollection = () => errorCollector.startCollecting()
export const stopErrorCollection = () => errorCollector.stopCollecting()
export const getConsoleErrors = () => errorCollector.getErrors()

// 全局测试助手
export const createStrictTest = (testName: string, testFn: () => void | Promise<void>) => {
  return {
    [testName]: async () => {
      // 开始收集控制台错误
      startErrorCollection()

      try {
        await testFn()

        // 检查控制台错误
        expectNoConsoleErrors()

      } catch (error) {
        // 停止错误收集
        stopErrorCollection()
        throw error
      } finally {
        // 停止错误收集
        stopErrorCollection()
      }
    }
  }
}

export default {
  StrictTestValidator,
  validateRequiredFields,
  validateFieldTypes,
  validateApiResponseStructure,
  expectNoConsoleErrors,
  validateVueComponentState,
  createStrictTest,
  startErrorCollection,
  stopErrorCollection,
  getConsoleErrors
}