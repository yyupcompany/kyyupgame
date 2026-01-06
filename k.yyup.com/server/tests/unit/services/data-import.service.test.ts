/**
 * DataImportService 单元测试
 * 测试数据导入服务的核心功能
 */

import { DataImportService } from '../../../src/services/data-import.service';
import { vi } from 'vitest'
import { OperationLog, OperationType, OperationResult } from '../../../src/models/operation-log.model';
import { logger } from '../../../src/utils/logger';

// Mock dependencies
jest.mock('../../../src/models/operation-log.model');
jest.mock('../../../src/utils/logger');
jest.mock('node-fetch');

const mockedOperationLog = OperationLog as jest.MockedClass<typeof OperationLog>;
const mockedLogger = logger as jest.Mocked<typeof logger>;


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

describe('DataImportService', () => {
  let service: DataImportService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DataImportService();
  });

  describe('detectImportIntent', () => {
    it('should detect student import intent', () => {
      const query = '我想导入学生数据';
      const result = service.detectImportIntent(query);
      expect(result).toBe('student');
    });

    it('should detect parent import intent', () => {
      const query = '家长信息导入';
      const result = service.detectImportIntent(query);
      expect(result).toBe('parent');
    });

    it('should detect teacher import intent', () => {
      const query = '教师数据导入';
      const result = service.detectImportIntent(query);
      expect(result).toBe('teacher');
    });

    it('should return null for no matching intent', () => {
      const query = '我想导入一些数据';
      const result = service.detectImportIntent(query);
      expect(result).toBeNull();
    });
  });

  describe('checkImportPermission', () => {
    it('should check import permission successfully', async () => {
      // Mock fetch response
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { hasPermission: true } })
      }) as jest.Mock;

      const result = await service.checkImportPermission(1, 'student');
      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        '/api/auth-permissions/check-permission',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: '/api/students', userId: 1 })
        })
      );
    });

    it('should handle permission check failure', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ success: false, data: { hasPermission: false } })
      }) as jest.Mock;

      const result = await service.checkImportPermission(1, 'student');
      expect(result).toBe(false);
    });

    it('should handle network errors', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error')) as jest.Mock;

      const result = await service.checkImportPermission(1, 'student');
      expect(result).toBe(false);
      expect(mockedLogger.error).toHaveBeenCalledWith(
        '权限检查失败',
        expect.objectContaining({ error: expect.any(Error), userId: 1, importType: 'student' })
      );
    });
  });

  describe('parseDocument', () => {
    const mockFilePath = '/path/to/document.xlsx';

    it('should parse Excel file successfully', async () => {
      const result = await service.parseDocument(mockFilePath, 'student');
      
      expect(result).toEqual({
        type: 'student',
        data: expect.arrayContaining([
          { '姓名': '张三', '电话': '13800138000', '邮箱': 'zhangsan@example.com' }
        ]),
        fields: ['姓名', '电话', '邮箱'],
        totalRecords: 2
      });
    });

    it('should parse Word file successfully', async () => {
      const result = await service.parseDocument('/path/to/document.docx', 'parent');
      
      expect(result).toEqual({
        type: 'parent',
        data: expect.arrayContaining([
          { '学生姓名': '王五', '联系电话': '13800138002', '家长姓名': '王父' }
        ]),
        fields: ['学生姓名', '联系电话', '家长姓名'],
        totalRecords: 1
      });
    });

    it('should handle unsupported file format', async () => {
      await expect(service.parseDocument('/path/to/document.txt', 'student', 'unsupported'))
        .rejects.toThrow('不支持的文件格式: .txt');
    });
  });

  describe('getDatabaseSchema', () => {
    it('should return student schema', async () => {
      const result = await service.getDatabaseSchema('student');
      
      expect(result).toEqual(
        expect.objectContaining({
          name: expect.objectContaining({ type: 'string', required: true, maxLength: 50 }),
          phone: expect.objectContaining({ type: 'string', required: false }),
          email: expect.objectContaining({ type: 'string', required: false })
        })
      );
    });

    it('should return parent schema', async () => {
      const result = await service.getDatabaseSchema('parent');
      
      expect(result).toEqual(
        expect.objectContaining({
          name: expect.objectContaining({ type: 'string', required: true, maxLength: 50 }),
          phone: expect.objectContaining({ type: 'string', required: true }),
          relationship: expect.objectContaining({ type: 'enum', required: true, values: ['father', 'mother', 'guardian'] })
        })
      );
    });

    it('should return empty object for invalid import type', async () => {
      const result = await service.getDatabaseSchema('invalid');
      expect(result).toEqual({});
    });
  });

  describe('generateFieldMapping', () => {
    const documentFields = ['姓名', '电话', '邮箱'];
    const databaseSchema = {
      name: { type: 'string', required: true, maxLength: 50 },
      phone: { type: 'string', required: true, maxLength: 20 },
      email: { type: 'string', required: false, maxLength: 100 }
    };
    const sampleData = [{ '姓名': '张三', '电话': '13800138000', '邮箱': 'zhangsan@example.com' }];

    it('should generate field mapping successfully', async () => {
      const result = await service.generateFieldMapping(documentFields, databaseSchema, 'student', sampleData);
      
      expect(result).toEqual(
        expect.objectContaining({
          mappings: expect.arrayContaining([
            expect.objectContaining({
              sourceField: '姓名',
              targetField: 'name',
              required: true,
              dataType: 'string'
            })
          ]),
          comparisonTable: expect.objectContaining({
            willImport: expect.arrayContaining([
              expect.objectContaining({
                sourceField: '姓名',
                targetField: 'name',
                confidence: expect.any(Number)
              })
            ])
          }),
          summary: expect.objectContaining({
            totalSourceFields: 3,
            canProceed: expect.any(Boolean)
          })
        })
      );
    });

    it('should handle field matching with confidence calculation', async () => {
      const result = await service.generateFieldMapping(['学生姓名'], databaseSchema, 'student', sampleData);
      
      expect(result.comparisonTable.willImport[0]).toEqual(
        expect.objectContaining({
          sourceField: '学生姓名',
          targetField: 'name',
          confidence: expect.greaterThan(0.8)
        })
      );
    });
  });

  describe('validateAndPreview', () => {
    const data = [
      { '姓名': '张三', '电话': '13800138000', '邮箱': 'zhangsan@example.com' },
      { '姓名': '', '电话': '13800138001', '邮箱': 'lisi@example.com' }
    ];
    
    const fieldMappings = [
      {
        sourceField: '姓名',
        targetField: 'name',
        required: true,
        dataType: 'string'
      },
      {
        sourceField: '电话',
        targetField: 'phone',
        required: true,
        dataType: 'string'
      }
    ];

    const databaseSchema = {
      name: { type: 'string', required: true, maxLength: 50 },
      phone: { type: 'string', required: true, maxLength: 20 }
    };

    it('should validate data and return preview', async () => {
      const result = await service.validateAndPreview(data, fieldMappings, databaseSchema);
      
      expect(result).toEqual(
        expect.objectContaining({
          type: 'preview',
          totalRecords: 2,
          validRecords: 1,
          invalidRecords: 1,
          fieldMappings,
          validationErrors: expect.arrayContaining([
            expect.objectContaining({
              rowIndex: 2,
              errors: expect.arrayContaining([
                expect.objectContaining({
                  field: '姓名',
                  message: '必填字段不能为空'
                })
              ])
            })
          ])
        })
      );
    });
  });

  describe('executeBatchInsert', () => {
    const data = [
      { name: '张三', phone: '13800138000' },
      { name: '李四', phone: '13800138001' }
    ];
    
    const fieldMappings = [
      { sourceField: 'name', targetField: 'name', required: true, dataType: 'string' },
      { sourceField: 'phone', targetField: 'phone', required: true, dataType: 'string' }
    ];

    beforeEach(() => {
      // Mock the secure API insertion method
      jest.spyOn(service as any, 'insertSingleRecord').mockResolvedValue({ id: 1 });
      jest.spyOn(service as any, 'logImportOperation').mockResolvedValue(undefined);
    });

    it('should execute batch insert successfully', async () => {
      const result = await service.executeBatchInsert(data, fieldMappings, 'student', 1);
      
      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          totalRecords: 2,
          successCount: 2,
          failureCount: 0,
          insertedIds: [1, 1]
        })
      );
    });

    it('should handle insertion failures', async () => {
      jest.spyOn(service as any, 'insertSingleRecord')
        .mockResolvedValueOnce({ id: 1 })
        .mockRejectedValueOnce(new Error('Insertion failed'));

      const result = await service.executeBatchInsert(data, fieldMappings, 'student', 1);
      
      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          totalRecords: 2,
          successCount: 1,
          failureCount: 1,
          errors: expect.arrayContaining([
            expect.objectContaining({
              rowIndex: 2,
              error: 'Insertion failed'
            })
          ])
        })
      );
    });
  });

  describe('standardizePhoneNumber', () => {
    it('should standardize Chinese mobile numbers', () => {
      const result = (service as any).standardizePhoneNumber('13800138000');
      expect(result).toBe('138-0013-8000');
    });

    it('should standardize Chinese landline numbers', () => {
      const result = (service as any).standardizePhoneNumber('01012345678');
      expect(result).toBe('01012345678');
    });

    it('should return original phone number if format is unrecognized', () => {
      const result = (service as any).standardizePhoneNumber('12345');
      expect(result).toBe('12345');
    });
  });

  describe('calculateStringSimilarity', () => {
    it('should calculate high similarity for identical strings', () => {
      const result = (service as any).calculateStringSimilarity('test', 'test');
      expect(result).toBe(1.0);
    });

    it('should calculate low similarity for different strings', () => {
      const result = (service as any).calculateStringSimilarity('test', 'completely different');
      expect(result).toBeLessThan(0.5);
    });

    it('should calculate medium similarity for similar strings', () => {
      const result = (service as any).calculateStringSimilarity('student', 'students');
      expect(result).toBeGreaterThan(0.5);
    });
  });

  describe('generateMappingSummary', () => {
    const comparisonTable = {
      willImport: [{ sourceField: '姓名', targetField: 'name' }],
      willIgnore: [{ sourceField: '备注', reason: '无对应字段' }],
      missing: [{ targetField: 'gender', canUseDefault: true }],
      conflicts: []
    };

    it('should generate mapping summary for proceeding import', () => {
      const result = (service as any).generateMappingSummary(['姓名', '备注'], comparisonTable, 'student');
      
      expect(result).toEqual(
        expect.objectContaining({
          totalSourceFields: 2,
          willImportCount: 1,
          willIgnoreCount: 1,
          canProceed: true,
          recommendation: expect.any(String)
        })
      );
    });

    it('should generate mapping summary for blocked import', () => {
      const blockedTable = {
        ...comparisonTable,
        missing: [{ targetField: 'gender', canUseDefault: false }]
      };

      const result = (service as any).generateMappingSummary(['姓名'], blockedTable, 'student');
      
      expect(result).toEqual(
        expect.objectContaining({
          canProceed: false,
          recommendation: '缺少必填字段，无法导入'
        })
      );
    });
  });
});