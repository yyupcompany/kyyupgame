/**
 * DataValidationService 单元测试
 * 测试数据验证服务的核心功能
 */

import { DataValidationService } from '../../../src/services/data-validation.service';
import { vi } from 'vitest'


// 控制台错误检测
let consoleSpy: any

beforeEach(() => {
  // 监听控制台错误
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  // 验证没有控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})

describe('DataValidationService', () => {
  let service: DataValidationService;

  beforeEach(() => {
    service = new DataValidationService();
  });

  describe('validateRecord', () => {
    describe('student validation', () => {
      it('should validate valid student record', () => {
        const validStudent = {
          name: '张三',
          phone: '13800138000',
          email: 'zhangsan@example.com',
          gender: 'male'
        };

        const result = service.validateRecord(validStudent, 'student');
        
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject student record with missing required name', () => {
        const invalidStudent = {
          phone: '13800138000',
          email: 'zhangsan@example.com'
        };

        const result = service.validateRecord(invalidStudent, 'student');
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'name',
              message: 'name是必填字段',
              code: 'REQUIRED_FIELD_MISSING'
            })
          ])
        );
      });

      it('should reject student record with invalid email format', () => {
        const invalidStudent = {
          name: '张三',
          email: 'invalid-email'
        };

        const result = service.validateRecord(invalidStudent, 'student');
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'email',
              message: 'email邮箱格式不正确',
              code: 'INVALID_EMAIL'
            })
          ])
        );
      });

      it('should reject student record with invalid phone format', () => {
        const invalidStudent = {
          name: '张三',
          phone: '12345'
        };

        const result = service.validateRecord(invalidStudent, 'student');
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'phone',
              message: 'phone电话号码格式不正确',
              code: 'INVALID_PHONE'
            })
          ])
        );
      });

      it('should reject student record with invalid gender enum', () => {
        const invalidStudent = {
          name: '张三',
          gender: 'invalid'
        };

        const result = service.validateRecord(invalidStudent, 'student');
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'gender',
              message: 'gender必须是以下值之一: male, female',
              code: 'INVALID_ENUM_VALUE'
            })
          ])
        );
      });

      it('should reject student record with name too long', () => {
        const invalidStudent = {
          name: 'a'.repeat(51),
          phone: '13800138000'
        };

        const result = service.validateRecord(invalidStudent, 'student');
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'name',
              message: 'name长度不能超过50个字符',
              code: 'MAX_LENGTH_VIOLATION'
            })
          ])
        );
      });

      it('should accept student record with valid studentId pattern', () => {
        const validStudent = {
          name: '张三',
          studentId: 'STU001'
        };

        const result = service.validateRecord(validStudent, 'student');
        
        expect(result.isValid).toBe(true);
      });

      it('should reject student record with invalid studentId pattern', () => {
        const invalidStudent = {
          name: '张三',
          studentId: 'STU-001' // Contains hyphen
        };

        const result = service.validateRecord(invalidStudent, 'student');
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'studentId',
              message: 'studentId格式不正确',
              code: 'PATTERN_MISMATCH'
            })
          ])
        );
      });
    });

    describe('parent validation', () => {
      it('should validate valid parent record', () => {
        const validParent = {
          name: '张父',
          phone: '13800138000',
          relationship: 'father'
        };

        const result = service.validateRecord(validParent, 'parent');
        
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject parent record with missing required phone', () => {
        const invalidParent = {
          name: '张父',
          relationship: 'father'
        };

        const result = service.validateRecord(invalidParent, 'parent');
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'phone',
              message: 'phone是必填字段',
              code: 'REQUIRED_FIELD_MISSING'
            })
          ])
        );
      });

      it('should reject parent record with invalid relationship enum', () => {
        const invalidParent = {
          name: '张父',
          phone: '13800138000',
          relationship: 'invalid'
        };

        const result = service.validateRecord(invalidParent, 'parent');
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'relationship',
              message: 'relationship必须是以下值之一: father, mother, guardian',
              code: 'INVALID_ENUM_VALUE'
            })
          ])
        );
      });
    });

    describe('teacher validation', () => {
      it('should validate valid teacher record', () => {
        const validTeacher = {
          name: '李老师',
          phone: '13800138000',
          email: 'teacher@example.com'
        };

        const result = service.validateRecord(validTeacher, 'teacher');
        
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject teacher record with missing required email', () => {
        const invalidTeacher = {
          name: '李老师',
          phone: '13800138000'
        };

        const result = service.validateRecord(invalidTeacher, 'teacher');
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'email',
              message: 'email是必填字段',
              code: 'REQUIRED_FIELD_MISSING'
            })
          ])
        );
      });
    });

    describe('invalid import type', () => {
      it('should return error for invalid import type', () => {
        const result = service.validateRecord({ name: 'test' }, 'invalid');
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'importType',
              message: '不支持的导入类型',
              code: 'INVALID_IMPORT_TYPE'
            })
          ])
        );
      });
    });
  });

  describe('validateBatch', () => {
    const validRecords = [
      { name: '张三', phone: '13800138000', relationship: 'father' },
      { name: '李四', phone: '13800138001', relationship: 'mother' }
    ];

    const invalidRecords = [
      { name: '张三', phone: '13800138000', relationship: 'father' },
      { name: '', phone: '13800138001', relationship: 'mother' },
      { name: '王五', phone: 'invalid', relationship: 'guardian' }
    ];

    it('should validate batch with all valid records', () => {
      const result = service.validateBatch(validRecords, 'parent');
      
      expect(result.validRecords).toHaveLength(2);
      expect(result.invalidRecords).toHaveLength(0);
      expect(result.summary).toEqual({
        total: 2,
        valid: 2,
        invalid: 0
      });
    });

    it('should validate batch with mixed valid and invalid records', () => {
      const result = service.validateBatch(invalidRecords, 'parent');
      
      expect(result.validRecords).toHaveLength(1);
      expect(result.invalidRecords).toHaveLength(2);
      expect(result.summary).toEqual({
        total: 3,
        valid: 1,
        invalid: 2
      });

      // Check invalid records have correct indices
      expect(result.invalidRecords[0].index).toBe(2);
      expect(result.invalidRecords[1].index).toBe(3);
    });

    it('should handle empty batch', () => {
      const result = service.validateBatch([], 'student');
      
      expect(result.validRecords).toHaveLength(0);
      expect(result.invalidRecords).toHaveLength(0);
      expect(result.summary).toEqual({
        total: 0,
        valid: 0,
        invalid: 0
      });
    });
  });

  describe('validateField', () => {
    describe('string validation', () => {
      it('should validate valid string', () => {
        const rule = {
          field: 'name',
          type: 'string' as const,
          required: true,
          minLength: 2,
          maxLength: 50
        };

        const result = (service as any).validateField('张三', rule);
        
        expect(result.isValid).toBe(true);
      });

      it('should reject string that is too short', () => {
        const rule = {
          field: 'name',
          type: 'string' as const,
          required: true,
          minLength: 2,
          maxLength: 50
        };

        const result = (service as any).validateField('A', rule);
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'name',
              message: 'name长度不能少于2个字符',
              code: 'MIN_LENGTH_VIOLATION'
            })
          ])
        );
      });

      it('should reject string that is too long', () => {
        const rule = {
          field: 'name',
          type: 'string' as const,
          required: true,
          minLength: 2,
          maxLength: 50
        };

        const result = (service as any).validateField('a'.repeat(51), rule);
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'name',
              message: 'name长度不能超过50个字符',
              code: 'MAX_LENGTH_VIOLATION'
            })
          ])
        );
      });

      it('should reject string that does not match pattern', () => {
        const rule = {
          field: 'studentId',
          type: 'string' as const,
          required: false,
          pattern: /^[A-Za-z0-9]+$/
        };

        const result = (service as any).validateField('STU-001', rule);
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'studentId',
              message: 'studentId格式不正确',
              code: 'PATTERN_MISMATCH'
            })
          ])
        );
      });
    });

    describe('number validation', () => {
      it('should validate valid number', () => {
        const rule = {
          field: 'age',
          type: 'number' as const,
          required: true,
          min: 1,
          max: 100
        };

        const result = (service as any).validateField(25, rule);
        
        expect(result.isValid).toBe(true);
      });

      it('should reject number that is too small', () => {
        const rule = {
          field: 'age',
          type: 'number' as const,
          required: true,
          min: 1,
          max: 100
        };

        const result = (service as any).validateField(0, rule);
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'age',
              message: 'age不能小于1',
              code: 'MIN_VALUE_VIOLATION'
            })
          ])
        );
      });

      it('should reject number that is too large', () => {
        const rule = {
          field: 'age',
          type: 'number' as const,
          required: true,
          min: 1,
          max: 100
        };

        const result = (service as any).validateField(101, rule);
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'age',
              message: 'age不能大于100',
              code: 'MAX_VALUE_VIOLATION'
            })
          ])
        );
      });

      it('should reject non-numeric value', () => {
        const rule = {
          field: 'age',
          type: 'number' as const,
          required: true
        };

        const result = (service as any).validateField('not a number', rule);
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'age',
              message: 'age必须是数字',
              code: 'INVALID_NUMBER'
            })
          ])
        );
      });
    });

    describe('email validation', () => {
      it('should validate valid email', () => {
        const rule = {
          field: 'email',
          type: 'email' as const,
          required: false
        };

        const result = (service as any).validateField('test@example.com', rule);
        
        expect(result.isValid).toBe(true);
      });

      it('should reject invalid email format', () => {
        const rule = {
          field: 'email',
          type: 'email' as const,
          required: false
        };

        const result = (service as any).validateField('invalid-email', rule);
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'email',
              message: 'email邮箱格式不正确',
              code: 'INVALID_EMAIL'
            })
          ])
        );
      });
    });

    describe('phone validation', () => {
      it('should validate valid Chinese mobile number', () => {
        const rule = {
          field: 'phone',
          type: 'phone' as const,
          required: true
        };

        const result = (service as any).validateField('13800138000', rule);
        
        expect(result.isValid).toBe(true);
      });

      it('should validate valid Chinese landline number', () => {
        const rule = {
          field: 'phone',
          type: 'phone' as const,
          required: true
        };

        const result = (service as any).validateField('010-12345678', rule);
        
        expect(result.isValid).toBe(true);
      });

      it('should reject invalid phone number', () => {
        const rule = {
          field: 'phone',
          type: 'phone' as const,
          required: true
        };

        const result = (service as any).validateField('12345', rule);
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'phone',
              message: 'phone电话号码格式不正确',
              code: 'INVALID_PHONE'
            })
          ])
        );
      });
    });

    describe('date validation', () => {
      it('should validate valid date', () => {
        const rule = {
          field: 'birthDate',
          type: 'date' as const,
          required: false
        };

        const result = (service as any).validateField('2020-01-01', rule);
        
        expect(result.isValid).toBe(true);
      });

      it('should reject invalid date', () => {
        const rule = {
          field: 'birthDate',
          type: 'date' as const,
          required: false
        };

        const result = (service as any).validateField('invalid-date', rule);
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'birthDate',
              message: 'birthDate日期格式不正确',
              code: 'INVALID_DATE'
            })
          ])
        );
      });
    });

    describe('enum validation', () => {
      it('should validate valid enum value', () => {
        const rule = {
          field: 'gender',
          type: 'enum' as const,
          required: false,
          enumValues: ['male', 'female']
        };

        const result = (service as any).validateField('male', rule);
        
        expect(result.isValid).toBe(true);
      });

      it('should reject invalid enum value', () => {
        const rule = {
          field: 'gender',
          type: 'enum' as const,
          required: false,
          enumValues: ['male', 'female']
        };

        const result = (service as any).validateField('other', rule);
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'gender',
              message: 'gender必须是以下值之一: male, female',
              code: 'INVALID_ENUM_VALUE'
            })
          ])
        );
      });
    });

    describe('boolean validation', () => {
      it('should validate boolean true', () => {
        const rule = {
          field: 'isActive',
          type: 'boolean' as const,
          required: false
        };

        const result = (service as any).validateField(true, rule);
        
        expect(result.isValid).toBe(true);
      });

      it('should validate boolean false', () => {
        const rule = {
          field: 'isActive',
          type: 'boolean' as const,
          required: false
        };

        const result = (service as any).validateField(false, rule);
        
        expect(result.isValid).toBe(true);
      });

      it('should validate string boolean', () => {
        const rule = {
          field: 'isActive',
          type: 'boolean' as const,
          required: false
        };

        const result1 = (service as any).validateField('true', rule);
        const result2 = (service as any).validateField('false', rule);
        
        expect(result1.isValid).toBe(true);
        expect(result2.isValid).toBe(true);
      });

      it('should validate numeric boolean', () => {
        const rule = {
          field: 'isActive',
          type: 'boolean' as const,
          required: false
        };

        const result1 = (service as any).validateField(1, rule);
        const result2 = (service as any).validateField(0, rule);
        
        expect(result1.isValid).toBe(true);
        expect(result2.isValid).toBe(true);
      });

      it('should reject invalid boolean', () => {
        const rule = {
          field: 'isActive',
          type: 'boolean' as const,
          required: false
        };

        const result = (service as any).validateField('invalid', rule);
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'isActive',
              message: 'isActive必须是布尔值',
              code: 'INVALID_BOOLEAN'
            })
          ])
        );
      });
    });

    describe('custom validator', () => {
      it('should pass custom validator', () => {
        const rule = {
          field: 'customField',
          type: 'string' as const,
          required: false,
          customValidator: (value: any) => value === 'valid'
        };

        const result = (service as any).validateField('valid', rule);
        
        expect(result.isValid).toBe(true);
      });

      it('should fail custom validator with boolean', () => {
        const rule = {
          field: 'customField',
          type: 'string' as const,
          required: false,
          customValidator: (value: any) => value === 'valid'
        };

        const result = (service as any).validateField('invalid', rule);
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'customField',
              message: 'customField自定义验证失败',
              code: 'CUSTOM_VALIDATION_FAILED'
            })
          ])
        );
      });

      it('should fail custom validator with string message', () => {
        const rule = {
          field: 'customField',
          type: 'string' as const,
          required: false,
          customValidator: (value: any) => 'Custom validation failed'
        };

        const result = (service as any).validateField('invalid', rule);
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'customField',
              message: 'Custom validation failed',
              code: 'CUSTOM_VALIDATION_FAILED'
            })
          ])
        );
      });
    });
  });

  describe('getValidationRules', () => {
    it('should return student validation rules', () => {
      const rules = service.getValidationRules('student');
      
      expect(rules).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'name',
            type: 'string',
            required: true,
            minLength: 1,
            maxLength: 50
          })
        ])
      );
    });

    it('should return parent validation rules', () => {
      const rules = service.getValidationRules('parent');
      
      expect(rules).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'phone',
            type: 'phone',
            required: true
          })
        ])
      );
    });

    it('should return empty array for invalid import type', () => {
      const rules = service.getValidationRules('invalid');
      expect(rules).toEqual([]);
    });
  });

  describe('addCustomRule', () => {
    it('should add custom validation rule', () => {
      const customRule = {
        field: 'customField',
        type: 'string' as const,
        required: false,
        minLength: 5
      };

      service.addCustomRule('student', customRule);
      
      const rules = service.getValidationRules('student');
      expect(rules).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'customField',
            type: 'string',
            required: false,
            minLength: 5
          })
        ])
      );
    });

    it('should create new import type if not exists', () => {
      const customRule = {
        field: 'customField',
        type: 'string' as const,
        required: true
      };

      service.addCustomRule('newType', customRule);
      
      const rules = service.getValidationRules('newType');
      expect(rules).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'customField',
            type: 'string',
            required: true
          })
        ])
      );
    });
  });
});