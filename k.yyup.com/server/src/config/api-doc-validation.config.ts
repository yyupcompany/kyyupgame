/**
 * API文档验证配置
 *
 * 提供Swagger/OpenAPI文档验证和质量检查
 */

import { Request, Response, NextFunction } from 'express';

/**
 * 验证规则类型
 */
export enum ValidationRule {
  REQUIRED = 'required',
  FORMAT = 'format',
  MIN_LENGTH = 'min_length',
  MAX_LENGTH = 'max_length',
  MIN_VALUE = 'min_value',
  MAX_VALUE = 'max_value',
  PATTERN = 'pattern',
  ENUM = 'enum'
}

/**
 * 参数位置
 */
export enum ParameterLocation {
  QUERY = 'query',
  PATH = 'path',
  HEADER = 'header',
  BODY = 'body',
  FORM_DATA = 'formData'
}

/**
 * 参数类型
 */
export enum ParameterType {
  STRING = 'string',
  NUMBER = 'number',
  INTEGER = 'integer',
  BOOLEAN = 'boolean',
  ARRAY = 'array',
  OBJECT = 'object',
  FILE = 'file'
}

/**
 * API端点定义
 */
export interface ApiEndpointSpec {
  path: string;
  method: string;
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: ApiParameterSpec[];
  requestBody?: ApiRequestBodySpec;
  responses: ApiResponseSpec[];
  security?: ApiSecuritySpec[];
  deprecated?: boolean;
}

/**
 * 参数规范
 */
export interface ApiParameterSpec {
  name: string;
  in: ParameterLocation;
  type: ParameterType;
  required?: boolean;
  description?: string;
  default?: any;
  format?: string;
  enum?: any[];
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  items?: ParameterType; // 数组元素类型
  schema?: any; // 复杂对象schema
}

/**
 * 请求体规范
 */
export interface ApiRequestBodySpec {
  required?: boolean;
  description?: string;
  contentType?: string;
  schema: any;
}

/**
 * 响应规范
 */
export interface ApiResponseSpec {
  statusCode: number;
  description?: string;
  contentType?: string;
  schema?: any;
  headers?: Record<string, ApiParameterSpec>;
}

/**
 * 安全规范
 */
export interface ApiSecuritySpec {
  type: 'apiKey' | 'oauth2' | 'http' | 'openIdConnect';
  description?: string;
  name?: string;
  in?: 'header' | 'query';
  scheme?: string;
  bearerFormat?: string;
  flows?: any;
  scopes?: string[];
}

/**
 * 验证结果
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * 验证错误
 */
export interface ValidationError {
  field: string;
  rule: ValidationRule;
  message: string;
  value?: any;
}

/**
 * 验证警告
 */
export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

/**
 * API文档管理器
 */
export class ApiDocValidator {
  private endpoints: Map<string, ApiEndpointSpec> = new Map();
  private schemas: Map<string, any> = new Map();

  /**
   * 注册API端点
   */
  registerEndpoint(spec: ApiEndpointSpec): void {
    const key = `${spec.method}:${spec.path}`;
    this.endpoints.set(key, spec);
  }

  /**
   * 注册Schema定义
   */
  registerSchema(name: string, schema: any): void {
    this.schemas.set(name, schema);
  }

  /**
   * 验证请求数据
   */
  validateRequest(path: string, method: string, data: any): ValidationResult {
    const key = `${method}:${path}`;
    const endpoint = this.endpoints.get(key);

    if (!endpoint) {
      return {
        valid: true,
        errors: [],
        warnings: [{ field: 'endpoint', message: '未找到API文档定义' }]
      };
    }

    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 验证路径参数
    if (endpoint.parameters) {
      const pathParams = endpoint.parameters.filter(p => p.in === ParameterLocation.PATH);
      for (const param of pathParams) {
        const value = data.params?.[param.name];
        const result = this.validateParameter(param, value);
        errors.push(...result.errors);
        warnings.push(...result.warnings);
      }
    }

    // 验证查询参数
    if (endpoint.parameters) {
      const queryParams = endpoint.parameters.filter(p => p.in === ParameterLocation.QUERY);
      for (const param of queryParams) {
        const value = data.query?.[param.name];
        const result = this.validateParameter(param, value);
        errors.push(...result.errors);
        warnings.push(...result.warnings);
      }
    }

    // 验证请求头
    if (endpoint.parameters) {
      const headerParams = endpoint.parameters.filter(p => p.in === ParameterLocation.HEADER);
      for (const param of headerParams) {
        const value = data.headers?.[param.name.toLowerCase()];
        const result = this.validateParameter(param, value);
        errors.push(...result.errors);
        warnings.push(...result.warnings);
      }
    }

    // 验证请求体
    if (endpoint.requestBody && data.body) {
      const result = this.validateRequestBody(endpoint.requestBody, data.body);
      errors.push(...result.errors);
      warnings.push(...result.warnings);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 验证响应数据
   */
  validateResponse(path: string, method: string, statusCode: number, data: any): ValidationResult {
    const key = `${method}:${path}`;
    const endpoint = this.endpoints.get(key);

    if (!endpoint) {
      return {
        valid: true,
        errors: [],
        warnings: []
      };
    }

    const responseSpec = endpoint.responses.find(r => r.statusCode === statusCode);

    if (!responseSpec) {
      return {
        valid: true,
        errors: [],
        warnings: [{
          field: 'response',
          message: `未定义状态码 ${statusCode} 的响应`
        }]
      };
    }

    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 验证响应结构
    if (responseSpec.schema) {
      const result = this.validateSchema(responseSpec.schema, data);
      errors.push(...result.errors);
      warnings.push(...result.warnings);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 验证参数
   */
  private validateParameter(param: ApiParameterSpec, value: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 检查必填
    if (param.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field: param.name,
        rule: ValidationRule.REQUIRED,
        message: `参数 ${param.name} 是必填的`
      });
      return { valid: false, errors, warnings };
    }

    // 如果值为空且非必填，跳过其他验证
    if (value === undefined || value === null || value === '') {
      return { valid: true, errors, warnings };
    }

    // 类型验证
    const typeErrors = this.validateType(param.name, value, param.type, param.items);
    errors.push(...typeErrors);

    // 格式验证
    if (param.format) {
      const formatErrors = this.validateFormat(param.name, value, param.format);
      errors.push(...formatErrors);
    }

    // 长度验证
    if (param.minLength !== undefined && String(value).length < param.minLength) {
      errors.push({
        field: param.name,
        rule: ValidationRule.MIN_LENGTH,
        message: `参数 ${param.name} 长度不能小于 ${param.minLength}`,
        value
      });
    }

    if (param.maxLength !== undefined && String(value).length > param.maxLength) {
      errors.push({
        field: param.name,
        rule: ValidationRule.MAX_LENGTH,
        message: `参数 ${param.name} 长度不能大于 ${param.maxLength}`,
        value
      });
    }

    // 数值范围验证
    if (param.minimum !== undefined && Number(value) < param.minimum) {
      errors.push({
        field: param.name,
        rule: ValidationRule.MIN_VALUE,
        message: `参数 ${param.name} 不能小于 ${param.minimum}`,
        value
      });
    }

    if (param.maximum !== undefined && Number(value) > param.maximum) {
      errors.push({
        field: param.name,
        rule: ValidationRule.MAX_VALUE,
        message: `参数 ${param.name} 不能大于 ${param.maximum}`,
        value
      });
    }

    // 正则验证
    if (param.pattern) {
      const regex = new RegExp(param.pattern);
      if (!regex.test(String(value))) {
        errors.push({
          field: param.name,
          rule: ValidationRule.PATTERN,
          message: `参数 ${param.name} 格式不正确`,
          value
        });
      }
    }

    // 枚举验证
    if (param.enum && !param.enum.includes(value)) {
      errors.push({
        field: param.name,
        rule: ValidationRule.ENUM,
        message: `参数 ${param.name} 必须是以下值之一: ${param.enum.join(', ')}`,
        value
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 验证请求体
   */
  private validateRequestBody(bodySpec: ApiRequestBodySpec, body: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!bodySpec.schema) {
      return { valid: true, errors, warnings };
    }

    return this.validateSchema(bodySpec.schema, body);
  }

  /**
   * 验证Schema
   */
  private validateSchema(schema: any, data: any, fieldPrefix = ''): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (schema.type === 'object' && schema.properties) {
      for (const [propName, propSpec] of Object.entries(schema.properties)) {
        const field = fieldPrefix ? `${fieldPrefix}.${propName}` : propName;
        const value = data?.[propName];

        // 检查必填字段
        if (schema.required?.includes(propName) && (value === undefined || value === null)) {
          errors.push({
            field,
            rule: ValidationRule.REQUIRED,
            message: `字段 ${field} 是必填的`
          });
          continue;
        }

        // 递归验证嵌套对象
        if (value !== undefined && value !== null) {
          const result = this.validateSchema(propSpec, value, field);
          errors.push(...result.errors);
          warnings.push(...result.warnings);
        }
      }
    } else if (schema.type === 'array' && schema.items && Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        const field = `${fieldPrefix}[${i}]`;
        const result = this.validateSchema(schema.items, data[i], field);
        errors.push(...result.errors);
        warnings.push(...result.warnings);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 类型验证
   */
  private validateType(field: string, value: any, type: ParameterType, itemType?: ParameterType): ValidationError[] {
    const errors: ValidationError[] = [];

    switch (type) {
      case ParameterType.STRING:
        if (typeof value !== 'string') {
          errors.push({
            field,
            rule: ValidationRule.FORMAT,
            message: `字段 ${field} 必须是字符串类型`,
            value
          });
        }
        break;

      case ParameterType.NUMBER:
        if (typeof value !== 'number' || isNaN(value)) {
          errors.push({
            field,
            rule: ValidationRule.FORMAT,
            message: `字段 ${field} 必须是数字类型`,
            value
          });
        }
        break;

      case ParameterType.INTEGER:
        if (!Number.isInteger(Number(value))) {
          errors.push({
            field,
            rule: ValidationRule.FORMAT,
            message: `字段 ${field} 必须是整数类型`,
            value
          });
        }
        break;

      case ParameterType.BOOLEAN:
        if (typeof value !== 'boolean') {
          errors.push({
            field,
            rule: ValidationRule.FORMAT,
            message: `字段 ${field} 必须是布尔类型`,
            value
          });
        }
        break;

      case ParameterType.ARRAY:
        if (!Array.isArray(value)) {
          errors.push({
            field,
            rule: ValidationRule.FORMAT,
            message: `字段 ${field} 必须是数组类型`,
            value
          });
        } else if (itemType && value.length > 0) {
          // 验证数组元素类型
          for (let i = 0; i < value.length; i++) {
            const itemErrors = this.validateType(`${field}[${i}]`, value[i], itemType);
            errors.push(...itemErrors);
          }
        }
        break;
    }

    return errors;
  }

  /**
   * 格式验证
   */
  private validateFormat(field: string, value: any, format: string): ValidationError[] {
    const errors: ValidationError[] = [];

    const patterns: Record<string, RegExp> = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      date: /^\d{4}-\d{2}-\d{2}$/,
      'date-time': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
      uri: /^https?:\/\/.+/,
      uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    };

    if (patterns[format] && !patterns[format].test(String(value))) {
      errors.push({
        field,
        rule: ValidationRule.FORMAT,
        message: `字段 ${field} 格式必须为 ${format}`,
        value
      });
    }

    return errors;
  }

  /**
   * 生成OpenAPI文档
   */
  generateOpenAPISpec(): any {
    const paths: any = {};

    for (const [key, endpoint] of this.endpoints) {
      const [method, path] = key.split(':');

      if (!paths[path]) {
        paths[path] = {};
      }

      paths[path][method.toLowerCase()] = {
        summary: endpoint.summary,
        description: endpoint.description,
        tags: endpoint.tags,
        parameters: endpoint.parameters,
        requestBody: endpoint.requestBody,
        responses: endpoint.responses.reduce((acc, r) => {
          acc[r.statusCode] = {
            description: r.description,
            content: r.contentType ? {
              [r.contentType]: {
                schema: r.schema
              }
            } : undefined
          };
          return acc;
        }, {} as any),
        deprecated: endpoint.deprecated,
        security: endpoint.security
      };
    }

    return {
      openapi: '3.0.0',
      info: {
        title: 'API Documentation',
        version: '1.0.0'
      },
      paths,
      components: {
        schemas: Object.fromEntries(this.schemas)
      }
    };
  }
}

/**
 * 创建API文档验证器实例
 */
export const apiDocValidator = new ApiDocValidator();

/**
 * 请求验证中间件
 */
export function validateRequestMiddleware(spec: ApiEndpointSpec) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = apiDocValidator.validateRequest(
      req.path,
      req.method.toLowerCase(),
      {
        params: req.params,
        query: req.query,
        headers: req.headers,
        body: req.body
      }
    );

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        error: {
          message: '请求参数验证失败',
          details: result.errors
        }
      });
    }

    // 将验证结果附加到请求对象
    (req as any).validationResult = result;
    next();
  };
}

/**
 * 导出配置
 */
export default {
  ApiDocValidator,
  apiDocValidator,
  validateRequestMiddleware,
  ValidationRule,
  ParameterLocation,
  ParameterType
};
