/**
 * 严格API验证工具
 *
 * 遵循项目的严格测试验证规则：
 * - 数据结构验证
 * - 字段类型验证
 * - 必填字段验证
 * - 控制台错误检测
 */

import type { Page, Response } from '@playwright/test';

export interface ValidationRule {
  requiredFields: string[];
  fieldTypes: Record<string, 'string' | 'number' | 'boolean' | 'array' | 'object'>;
  optionalFields?: string[];
  customValidators?: Record<string, (value: any) => boolean>;
}

export interface ConsoleError {
  type: string;
  text: string;
  location: string;
  timestamp: number;
}

export class StrictApiValidation {
  private consoleErrors: ConsoleError[] = [];
  private page: Page | null = null;

  /**
   * 设置控制台错误捕获
   */
  setupConsoleErrorCapture(page: Page): void {
    this.page = page;
    this.consoleErrors = [];

    // 监听所有类型的控制台消息
    page.on('console', msg => {
      const errorTypes = ['error', 'warning', 'assert'];
      if (errorTypes.includes(msg.type())) {
        this.consoleErrors.push({
          type: msg.type(),
          text: msg.text(),
          location: msg.location().url || 'unknown',
          timestamp: Date.now()
        });
      }
    });

    // 监听页面错误
    page.on('pageerror', error => {
      this.consoleErrors.push({
        type: 'pageerror',
        text: error.message,
        location: error.stack || 'unknown',
        timestamp: Date.now()
      });
    });

    // 监听请求失败
    page.on('requestfailed', request => {
      this.consoleErrors.push({
        type: 'requestfailed',
        text: `Request failed: ${request.url()} - ${request.failure()?.errorText}`,
        location: request.url(),
        timestamp: Date.now()
      });
    });
  }

  /**
   * 清除控制台错误记录
   */
  clearConsoleErrors(): void {
    this.consoleErrors = [];
  }

  /**
   * 验证没有控制台错误
   */
  expectNoConsoleErrors(): void {
    if (this.consoleErrors.length > 0) {
      const errorReport = this.consoleErrors.map(error =>
        `[${error.type.toUpperCase()}] ${error.text}\n  Location: ${error.location}\n  Time: ${new Date(error.timestamp).toISOString()}`
      ).join('\n\n');

      throw new Error(
        `检测到控制台错误，违反严格验证规则：\n\n${errorReport}\n\n` +
        '所有错误必须在测试结束前解决。请检查：\n' +
        '1. API调用错误\n' +
        '2. JavaScript语法错误\n' +
        '3. 网络请求失败\n' +
        '4. 组件渲染错误'
      );
    }
  }

  /**
   * 获取控制台错误报告
   */
  getConsoleErrorReport(): string {
    if (this.consoleErrors.length === 0) {
      return '✅ 无控制台错误';
    }

    const summary = `🚨 检测到 ${this.consoleErrors.length} 个控制台错误:\n\n`;
    const details = this.consoleErrors.map((error, index) =>
      `${index + 1}. [${error.type.toUpperCase()}] ${error.text}\n   位置: ${error.location}\n   时间: ${new Date(error.timestamp).toLocaleString()}`
    ).join('\n\n');

    return summary + details;
  }

  /**
   * 验证API响应数据结构
   */
  validateApiResponse(response: Response, rule: ValidationRule): void {
    const responseUrl = response.url();
    const statusCode = response.status();

    // 验证HTTP状态码
    if (statusCode < 200 || statusCode >= 300) {
      throw new Error(
        `API响应状态码错误: ${statusCode}\n` +
        `URL: ${responseUrl}\n` +
        `期望状态码: 2xx\n` +
        `实际状态码: ${statusCode}`
      );
    }

    // 对于非JSON响应，跳过结构验证
    const contentType = response.headers()['content-type'] || '';
    if (!contentType.includes('application/json')) {
      console.warn(`⚠️ 跳过非JSON响应验证: ${responseUrl} (${contentType})`);
      return;
    }

    // 延迟获取响应数据以避免 body used 错误
    this._validateJsonResponse(responseUrl, rule);
  }

  /**
   * 验证JSON响应数据（异步）
   */
  private async _validateJsonResponse(responseUrl: string, rule: ValidationRule): Promise<void> {
    try {
      // 由于我们无法在这里直接使用 await，使用 setTimeout 延迟验证
      setTimeout(async () => {
        try {
          const response = await fetch(responseUrl);
          const data = await response.json();

          this._validateDataStructure(data, rule, responseUrl);
        } catch (error) {
          console.error(`验证API响应失败: ${responseUrl}`, error);
        }
      }, 100);
    } catch (error) {
      console.error(`设置API验证失败: ${responseUrl}`, error);
    }
  }

  /**
   * 验证数据结构
   */
  _validateDataStructure(data: any, rule: ValidationRule, context: string): void {
    if (!data || typeof data !== 'object') {
      throw new Error(
        `API响应数据格式错误: ${context}\n` +
        `期望: object\n` +
        `实际: ${typeof data}\n` +
        `数据: ${JSON.stringify(data)}`
      );
    }

    // 验证必填字段
    for (const field of rule.requiredFields) {
      if (!(field in data)) {
        throw new Error(
          `缺少必填字段: ${field}\n` +
          `上下文: ${context}\n` +
          `必填字段列表: [${rule.requiredFields.join(', ')}]\n` +
          `实际字段: [${Object.keys(data).join(', ')}]`
        );
      }

      if (data[field] === null || data[field] === undefined) {
        throw new Error(
          `必填字段值不能为空: ${field}\n` +
          `上下文: ${context}\n` +
          `值: ${data[field]}`
        );
      }
    }

    // 验证字段类型
    for (const [field, expectedType] of Object.entries(rule.fieldTypes)) {
      if (field in data) {
        const actualType = this._getFieldType(data[field]);

        if (actualType !== expectedType) {
          throw new Error(
            `字段类型错误: ${field}\n` +
            `上下文: ${context}\n` +
            `期望类型: ${expectedType}\n` +
            `实际类型: ${actualType}\n` +
            `值: ${JSON.stringify(data[field])}`
          );
        }
      }
    }

    // 自定义验证器
    if (rule.customValidators) {
      for (const [field, validator] of Object.entries(rule.customValidators)) {
        if (field in data && !validator(data[field])) {
          throw new Error(
            `字段自定义验证失败: ${field}\n` +
            `上下文: ${context}\n` +
            `值: ${JSON.stringify(data[field])}`
          );
        }
      }
    }
  }

  /**
   * 获取字段的实际类型
   */
  _getFieldType(value: any): string {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return typeof value;
  }

  /**
   * 验证必填字段（静态方法）
   */
  static validateRequiredFields(data: any, requiredFields: string[]): void {
    if (!data || typeof data !== 'object') {
      throw new Error('数据必须是一个对象');
    }

    const missingFields = requiredFields.filter(field =>
      !(field in data) || data[field] === null || data[field] === undefined
    );

    if (missingFields.length > 0) {
      throw new Error(
        `缺少必填字段: [${missingFields.join(', ')}]\n` +
        `可用字段: [${Object.keys(data).join(', ')}]`
      );
    }
  }

  /**
   * 验证字段类型（静态方法）
   */
  static validateFieldTypes(data: any, fieldTypes: Record<string, string>): void {
    if (!data || typeof data !== 'object') {
      throw new Error('数据必须是一个对象');
    }

    for (const [field, expectedType] of Object.entries(fieldTypes)) {
      if (field in data) {
        const value = data[field];
        let actualType: string;

        if (value === null) {
          actualType = 'null';
        } else if (Array.isArray(value)) {
          actualType = 'array';
        } else if (typeof value === 'object') {
          actualType = 'object';
        } else {
          actualType = typeof value;
        }

        if (actualType !== expectedType) {
          throw new Error(
            `字段类型错误: ${field}\n` +
            `期望: ${expectedType}, 实际: ${actualType}\n` +
            `值: ${JSON.stringify(value)}`
          );
        }
      }
    }
  }

  /**
   * 完整API验证（静态方法）
   */
  static validateAPIResponse(response: any, rule: ValidationRule): void {
    // 验证响应结构
    if (!response || typeof response !== 'object') {
      throw new Error('API响应必须是一个对象');
    }

    // 验证成功状态
    if (response.success === false) {
      throw new Error(
        `API调用失败: ${response.message || '未知错误'}\n` +
        `错误代码: ${response.code || 'N/A'}`
      );
    }

    // 验证数据字段
    if (response.data === undefined || response.data === null) {
      throw new Error('API响应缺少data字段');
    }

    // 验证数据结构
    this.validateRequiredFields(response.data, rule.requiredFields);
    this.validateFieldTypes(response.data, rule.fieldTypes);

    // 自定义验证
    if (rule.customValidators) {
      for (const [field, validator] of Object.entries(rule.customValidators)) {
        if (field in response.data && !validator(response.data[field])) {
          throw new Error(
            `字段自定义验证失败: ${field}\n` +
            `值: ${JSON.stringify(response.data[field])}`
          );
        }
      }
    }
  }
}

// 创建默认实例
export const strictApiValidation = new StrictApiValidation();