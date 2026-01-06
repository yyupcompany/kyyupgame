import { logger } from '../utils/logger';

/**
 * 数据验证服务
 * 提供数据字段映射和验证逻辑，确保导入数据符合数据库约束
 */

export interface ValidationRule {
  field: string;
  type: 'string' | 'number' | 'email' | 'phone' | 'date' | 'enum' | 'boolean';
  required: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enumValues?: string[];
  customValidator?: (value: any) => boolean | string;
}

export interface ValidationError {
  field: string;
  value: any;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

export class DataValidationService {
  // 预定义的验证规则
  private readonly validationRules = {
    student: [
      { field: 'name', type: 'string' as const, required: true, minLength: 1, maxLength: 50 },
      { field: 'studentId', type: 'string' as const, required: false, maxLength: 20, pattern: /^[A-Za-z0-9]+$/ },
      { field: 'phone', type: 'phone' as const, required: false },
      { field: 'email', type: 'email' as const, required: false },
      { field: 'birthDate', type: 'date' as const, required: false },
      { field: 'gender', type: 'enum' as const, required: false, enumValues: ['male', 'female'] },
      { field: 'address', type: 'string' as const, required: false, maxLength: 200 }
    ],
    parent: [
      { field: 'name', type: 'string' as const, required: true, minLength: 1, maxLength: 50 },
      { field: 'phone', type: 'phone' as const, required: true },
      { field: 'email', type: 'email' as const, required: false },
      { field: 'relationship', type: 'enum' as const, required: true, enumValues: ['father', 'mother', 'guardian'] },
      { field: 'occupation', type: 'string' as const, required: false, maxLength: 100 },
      { field: 'address', type: 'string' as const, required: false, maxLength: 200 }
    ],
    teacher: [
      { field: 'name', type: 'string' as const, required: true, minLength: 1, maxLength: 50 },
      { field: 'employeeId', type: 'string' as const, required: false, maxLength: 20, pattern: /^[A-Za-z0-9]+$/ },
      { field: 'phone', type: 'phone' as const, required: true },
      { field: 'email', type: 'email' as const, required: true },
      { field: 'subject', type: 'string' as const, required: false, maxLength: 50 },
      { field: 'department', type: 'string' as const, required: false, maxLength: 50 },
      { field: 'hireDate', type: 'date' as const, required: false }
    ]
  };

  /**
   * 验证单条记录
   */
  validateRecord(record: any, importType: string): ValidationResult {
    const rules = this.validationRules[importType as keyof typeof this.validationRules];
    if (!rules) {
      return {
        isValid: false,
        errors: [{ field: 'importType', value: importType, message: '不支持的导入类型', code: 'INVALID_IMPORT_TYPE' }],
        warnings: []
      };
    }

    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    for (const rule of rules) {
      const value = record[rule.field];
      const fieldValidation = this.validateField(value, rule);
      
      if (!fieldValidation.isValid) {
        errors.push(...fieldValidation.errors);
      }
      
      warnings.push(...fieldValidation.warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 批量验证记录
   */
  validateBatch(records: any[], importType: string): {
    validRecords: any[];
    invalidRecords: { record: any; errors: ValidationError[]; index: number }[];
    summary: { total: number; valid: number; invalid: number };
  } {
    const validRecords: any[] = [];
    const invalidRecords: { record: any; errors: ValidationError[]; index: number }[] = [];

    records.forEach((record, index) => {
      const validation = this.validateRecord(record, importType);
      
      if (validation.isValid) {
        validRecords.push(record);
      } else {
        invalidRecords.push({
          record,
          errors: validation.errors,
          index: index + 1
        });
      }
    });

    return {
      validRecords,
      invalidRecords,
      summary: {
        total: records.length,
        valid: validRecords.length,
        invalid: invalidRecords.length
      }
    };
  }

  /**
   * 验证单个字段
   */
  private validateField(value: any, rule: ValidationRule): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    // 检查必填字段
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field: rule.field,
        value,
        message: `${rule.field}是必填字段`,
        code: 'REQUIRED_FIELD_MISSING'
      });
      return { isValid: false, errors, warnings };
    }

    // 如果值为空且非必填，跳过其他验证
    if (value === undefined || value === null || value === '') {
      return { isValid: true, errors, warnings };
    }

    // 类型验证
    switch (rule.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push({
            field: rule.field,
            value,
            message: `${rule.field}必须是字符串类型`,
            code: 'INVALID_TYPE'
          });
        } else {
          // 长度验证
          if (rule.minLength && value.length < rule.minLength) {
            errors.push({
              field: rule.field,
              value,
              message: `${rule.field}长度不能少于${rule.minLength}个字符`,
              code: 'MIN_LENGTH_VIOLATION'
            });
          }
          if (rule.maxLength && value.length > rule.maxLength) {
            errors.push({
              field: rule.field,
              value,
              message: `${rule.field}长度不能超过${rule.maxLength}个字符`,
              code: 'MAX_LENGTH_VIOLATION'
            });
          }
          // 正则验证
          if (rule.pattern && !rule.pattern.test(value)) {
            errors.push({
              field: rule.field,
              value,
              message: `${rule.field}格式不正确`,
              code: 'PATTERN_MISMATCH'
            });
          }
        }
        break;

      case 'number':
        const numValue = Number(value);
        if (isNaN(numValue)) {
          errors.push({
            field: rule.field,
            value,
            message: `${rule.field}必须是数字`,
            code: 'INVALID_NUMBER'
          });
        } else {
          if (rule.min !== undefined && numValue < rule.min) {
            errors.push({
              field: rule.field,
              value,
              message: `${rule.field}不能小于${rule.min}`,
              code: 'MIN_VALUE_VIOLATION'
            });
          }
          if (rule.max !== undefined && numValue > rule.max) {
            errors.push({
              field: rule.field,
              value,
              message: `${rule.field}不能大于${rule.max}`,
              code: 'MAX_VALUE_VIOLATION'
            });
          }
        }
        break;

      case 'email':
        if (!this.isValidEmail(value)) {
          errors.push({
            field: rule.field,
            value,
            message: `${rule.field}邮箱格式不正确`,
            code: 'INVALID_EMAIL'
          });
        }
        break;

      case 'phone':
        if (!this.isValidPhone(value)) {
          errors.push({
            field: rule.field,
            value,
            message: `${rule.field}电话号码格式不正确`,
            code: 'INVALID_PHONE'
          });
        }
        break;

      case 'date':
        if (!this.isValidDate(value)) {
          errors.push({
            field: rule.field,
            value,
            message: `${rule.field}日期格式不正确`,
            code: 'INVALID_DATE'
          });
        }
        break;

      case 'enum':
        if (rule.enumValues && !rule.enumValues.includes(value)) {
          errors.push({
            field: rule.field,
            value,
            message: `${rule.field}必须是以下值之一: ${rule.enumValues.join(', ')}`,
            code: 'INVALID_ENUM_VALUE'
          });
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean' && value !== 'true' && value !== 'false' && value !== 0 && value !== 1) {
          errors.push({
            field: rule.field,
            value,
            message: `${rule.field}必须是布尔值`,
            code: 'INVALID_BOOLEAN'
          });
        }
        break;
    }

    // 自定义验证器
    if (rule.customValidator) {
      const customResult = rule.customValidator(value);
      if (customResult !== true) {
        errors.push({
          field: rule.field,
          value,
          message: typeof customResult === 'string' ? customResult : `${rule.field}自定义验证失败`,
          code: 'CUSTOM_VALIDATION_FAILED'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 验证邮箱格式
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 验证电话号码格式
   */
  private isValidPhone(phone: string): boolean {
    // 支持中国大陆手机号和固定电话
    const mobileRegex = /^1[3-9]\d{9}$/;
    const landlineRegex = /^0\d{2,3}-?\d{7,8}$/;
    const cleanPhone = phone.replace(/[-\s]/g, '');
    
    return mobileRegex.test(cleanPhone) || landlineRegex.test(phone);
  }

  /**
   * 验证日期格式
   */
  private isValidDate(date: string): boolean {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }

  /**
   * 获取验证规则
   */
  getValidationRules(importType: string): ValidationRule[] {
    return this.validationRules[importType as keyof typeof this.validationRules] || [];
  }

  /**
   * 添加自定义验证规则
   */
  addCustomRule(importType: string, rule: ValidationRule): void {
    if (!this.validationRules[importType as keyof typeof this.validationRules]) {
      (this.validationRules as any)[importType] = [];
    }
    (this.validationRules as any)[importType].push(rule);
  }
}
