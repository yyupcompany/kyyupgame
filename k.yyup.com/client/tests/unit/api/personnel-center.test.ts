/**
 * 人事中心API测试 - 严格验证版本
 * 遵循项目的严格验证规则，确保数据结构、字段类型和必填字段验证
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import personnelCenterApi, {
  type PersonnelOverview,
  type Student,
  type Parent,
  type Teacher,
  type Class,
  type QueryParams
} from '@/api/personnel-center';
import { expectNoConsoleErrors } from '../setup/console-monitoring';
import {
  validateRequiredFields,
  validateFieldTypes,
  validatePaginationStructure,
  validateApiResponseStructure,
  createValidationReport,
  validateEmailFormat,
  validatePhoneFormat
} from '../utils/data-validation';

// Mock request utility
vi.mock('@/utils/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

const mockRequest = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn()
} as any;

// 控制台错误检测变量
let consoleSpy: any

describe('Personnel Center API - Strict Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    expectNoConsoleErrors();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('Overview APIs', () => {
    describe('getOverview', () => {
      it('should get overview with strict validation', async () => {
        const mockOverview: PersonnelOverview = {
          stats: [
            {
              key: 'total_students',
              title: '总学生数',
              value: 150,
              unit: '人',
              trend: 5.2,
              trendText: '增长',
              type: 'primary',
              icon: 'users'
            }
          ]
        };

        const mockResponse = {
          success: true,
          data: mockOverview,
          message: '获取成功'
        };

        mockRequest.get.mockResolvedValue(mockResponse);

        const result = await personnelCenterApi.getOverview();

        // 1. 验证API调用
        expect(mockRequest.get).toHaveBeenCalledWith('/personnel-center/overview');

        // 2. 验证响应结构
        const responseValidation = validateApiResponseStructure(result);
        expect(responseValidation.valid).toBe(true);
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();

        // 3. 验证必填字段
        const requiredFields = ['stats'];
        const fieldValidation = validateRequiredFields(result.data, requiredFields);
        expect(fieldValidation.valid).toBe(true);

        // 4. 验证字段类型
        const typeValidation = validateFieldTypes(result.data, {
          stats: 'array'
        });
        expect(typeValidation.valid).toBe(true);

        // 5. 验证统计数据结构
        if (result.data.stats && result.data.stats.length > 0) {
          const statItemValidation = validateRequiredFields(result.data.stats[0], [
            'key', 'title', 'value', 'unit', 'trend', 'trendText', 'type', 'icon'
          ]);
          expect(statItemValidation.valid).toBe(true);

          const statTypeValidation = validateFieldTypes(result.data.stats[0], {
            key: 'string',
            title: 'string',
            value: 'number',
            unit: 'string',
            trend: 'number',
            trendText: 'string',
            type: 'string',
            icon: 'string'
          });
          expect(statTypeValidation.valid).toBe(true);
        }
      });

      it('should handle overview API errors', async () => {
        const mockError = new Error('Failed to fetch overview');

        mockRequest.get.mockRejectedValue(mockError);

        await expect(personnelCenterApi.getOverview()).rejects.toThrow('Failed to fetch overview');
      });
    });

    describe('getPersonnelDistribution', () => {
      it('should get personnel distribution with strict validation', async () => {
        const mockDistribution = {
          students: 150,
          teachers: 20,
          parents: 300,
          staff: 10
        };

        const mockResponse = {
          success: true,
          data: mockDistribution
        };

        mockRequest.get.mockResolvedValue(mockResponse);

        const result = await personnelCenterApi.getPersonnelDistribution();

        // 1. 验证API调用
        expect(mockRequest.get).toHaveBeenCalledWith('/personnel-center/distribution');

        // 2. 验证响应结构
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();

        // 3. 验证必填字段
        const requiredFields = ['students', 'teachers', 'parents', 'staff'];
        const fieldValidation = validateRequiredFields(result.data, requiredFields);
        expect(fieldValidation.valid).toBe(true);

        // 4. 验证字段类型和数值范围
        const typeValidation = validateFieldTypes(result.data, {
          students: 'number',
          teachers: 'number',
          parents: 'number',
          staff: 'number'
        });
        expect(typeValidation.valid).toBe(true);

        // 5. 验证数值范围
        Object.values(result.data).forEach(value => {
          expect(value).toBeGreaterThanOrEqual(0);
        });
      });
    });

    describe('getPersonnelTrend', () => {
      it('should get personnel trend with strict validation', async () => {
        const mockTrend = {
          labels: ['1月', '2月', '3月'],
          data: [100, 120, 150]
        };

        const mockResponse = {
          success: true,
          data: mockTrend
        };

        mockRequest.get.mockResolvedValue(mockResponse);

        const result = await personnelCenterApi.getPersonnelTrend();

        // 1. 验证API调用
        expect(mockRequest.get).toHaveBeenCalledWith('/personnel-center/trend');

        // 2. 验证响应结构
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();

        // 3. 验证必填字段
        const requiredFields = ['labels', 'data'];
        const fieldValidation = validateRequiredFields(result.data, requiredFields);
        expect(fieldValidation.valid).toBe(true);

        // 4. 验证字段类型
        const typeValidation = validateFieldTypes(result.data, {
          labels: 'array',
          data: 'array'
        });
        expect(typeValidation.valid).toBe(true);

        // 5. 验证数组长度一致
        expect(result.data.labels.length).toBe(result.data.data.length);

        // 6. 验证数组内容
        result.data.labels.forEach((label: any) => {
          expect(typeof label).toBe('string');
        });

        result.data.data.forEach((value: any) => {
          expect(typeof value).toBe('number');
          expect(value).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });

  describe('Student Management APIs', () => {
    describe('getStudents', () => {
      it('should get students with strict validation', async () => {
        const mockParams: QueryParams = {
          page: 1,
          pageSize: 10,
          keyword: 'test',
          status: 'active'
        };
        const mockResponse = {
          success: true,
          data: {
            items: [
              { id: '1', name: 'Test Student', studentId: 'STU001', age: 6, gender: 'male', status: 'active' }
            ],
            total: 1,
            page: 1,
            pageSize: 10
          }
        };

        mockRequest.get.mockResolvedValue(mockResponse);

        const result = await personnelCenterApi.getStudents(mockParams);

        // 1. 验证API调用
        expect(mockRequest.get).toHaveBeenCalledWith('/personnel-center/students', { params: mockParams });

        // 2. 验证响应结构
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();

        // 3. 验证分页结构
        const paginationValidation = validatePaginationStructure(result.data);
        expect(paginationValidation.valid).toBe(true);

        // 4. 验证学生数据结构
        if (result.data.items && result.data.items.length > 0) {
          const studentValidation = validateRequiredFields(result.data.items[0], [
            'id', 'name', 'studentId', 'age', 'gender', 'status'
          ]);
          expect(studentValidation.valid).toBe(true);

          const studentTypeValidation = validateFieldTypes(result.data.items[0], {
            id: 'string',
            name: 'string',
            studentId: 'string',
            age: 'number',
            gender: 'string',
            status: 'string'
          });
          expect(studentTypeValidation.valid).toBe(true);

          // 5. 验证枚举值
          expect(['male', 'female']).toContain(result.data.items[0].gender);
          expect(['active', 'inactive', 'graduated']).toContain(result.data.items[0].status);
        }
      });

      it('should handle empty student list with validation', async () => {
        const mockParams: QueryParams = { page: 1, pageSize: 10 };
        const mockResponse = {
          success: true,
          data: {
            items: [],
            total: 0,
            page: 1,
            pageSize: 10
          }
        };

        mockRequest.get.mockResolvedValue(mockResponse);

        const result = await personnelCenterApi.getStudents(mockParams);

        // 验证空列表结构
        const paginationValidation = validatePaginationStructure(result.data);
        expect(paginationValidation.valid).toBe(true);
        expect(result.data.items).toEqual([]);
        expect(result.data.total).toBe(0);
      });
    });

    describe('createStudent', () => {
      it('should create student with strict validation', async () => {
        const mockStudentData: Partial<Student> = {
          name: 'New Student',
          studentId: 'STU002',
          className: 'Class A',
          gender: 'male',
          age: 6,
          status: 'active',
          enrollDate: '2024-01-01'
        };
        const mockResponse = {
          success: true,
          data: { id: '2', ...mockStudentData }
        };

        mockRequest.post.mockResolvedValue(mockResponse);

        const result = await personnelCenterApi.createStudent(mockStudentData);

        // 1. 验证API调用
        expect(mockRequest.post).toHaveBeenCalledWith('/personnel-center/students', mockStudentData);

        // 2. 验证响应结构
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();

        // 3. 验证必填字段
        const requiredFields = ['id', 'name', 'studentId', 'gender', 'age', 'status'];
        const fieldValidation = validateRequiredFields(result.data, requiredFields);
        expect(fieldValidation.valid).toBe(true);

        // 4. 验证字段类型
        const typeValidation = validateFieldTypes(result.data, {
          id: 'string',
          name: 'string',
          studentId: 'string',
          className: 'string',
          gender: 'string',
          age: 'number',
          status: 'string',
          enrollDate: 'string'
        });
        expect(typeValidation.valid).toBe(true);
      });

      it('should handle student creation validation errors', async () => {
        const mockStudentData: Partial<Student> = {
          name: '' // Invalid empty name
        };
        const mockError = new Error('Validation failed');

        mockRequest.post.mockRejectedValue(mockError);

        await expect(personnelCenterApi.createStudent(mockStudentData)).rejects.toThrow('Validation failed');
      });
    });

    describe('updateStudent', () => {
      it('should update student with strict validation', async () => {
        const studentId = '1';
        const mockUpdateData: Partial<Student> = {
          name: 'Updated Student',
          phone: '1234567890'
        };
        const mockResponse = {
          success: true,
          data: { id: studentId, ...mockUpdateData }
        };

        mockRequest.put.mockResolvedValue(mockResponse);

        const result = await personnelCenterApi.updateStudent(studentId, mockUpdateData);

        // 1. 验证API调用
        expect(mockRequest.put).toHaveBeenCalledWith(`/personnel-center/students/${studentId}`, mockUpdateData);

        // 2. 验证响应结构
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();

        // 3. 验证必填字段
        const fieldValidation = validateRequiredFields(result.data, ['id']);
        expect(fieldValidation.valid).toBe(true);

        // 4. 验证字段类型
        const typeValidation = validateFieldTypes(result.data, {
          id: 'string',
          name: 'string',
          phone: 'string'
        });
        expect(typeValidation.valid).toBe(true);

        // 5. 验证手机号格式（如果提供）
        if (result.data.phone) {
          expect(validatePhoneFormat(result.data.phone)).toBe(true);
        }
      });
    });

    describe('deleteStudent', () => {
      it('should delete student with strict validation', async () => {
        const studentId = '1';
        const mockResponse = {
          success: true,
          message: '删除成功'
        };

        mockRequest.delete.mockResolvedValue(mockResponse);

        const result = await personnelCenterApi.deleteStudent(studentId);

        // 1. 验证API调用
        expect(mockRequest.delete).toHaveBeenCalledWith(`/personnel-center/students/${studentId}`);

        // 2. 验证响应结构
        expect(result.success).toBe(true);
        expect(typeof result.message).toBe('string');
      });

      it('should handle student deletion errors', async () => {
        const studentId = '1';
        const mockError = new Error('Cannot delete student');

        mockRequest.delete.mockRejectedValue(mockError);

        await expect(personnelCenterApi.deleteStudent(studentId)).rejects.toThrow('Cannot delete student');
      });
    });

    describe('getStudentDetail', () => {
      it('should get student detail with strict validation', async () => {
        const studentId = '1';
        const mockResponse = {
          success: true,
          data: {
            id: studentId,
            name: 'Test Student',
            age: 6,
            gender: 'male',
            status: 'active',
            grades: [
              { id: '1', subject: 'Math', score: 90, grade: 'A' }
            ]
          }
        };

        mockRequest.get.mockResolvedValue(mockResponse);

        const result = await personnelCenterApi.getStudentDetail(studentId);

        // 1. 验证API调用
        expect(mockRequest.get).toHaveBeenCalledWith(`/personnel-center/students/${studentId}`);

        // 2. 验证响应结构
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();

        // 3. 验证必填字段
        const requiredFields = ['id', 'name', 'age', 'gender', 'status'];
        const fieldValidation = validateRequiredFields(result.data, requiredFields);
        expect(fieldValidation.valid).toBe(true);

        // 4. 验证字段类型
        const typeValidation = validateFieldTypes(result.data, {
          id: 'string',
          name: 'string',
          age: 'number',
          gender: 'string',
          status: 'string',
          grades: 'array'
        });
        expect(typeValidation.valid).toBe(true);

        // 5. 验证成绩数据结构
        if (result.data.grades && result.data.grades.length > 0) {
          const gradeValidation = validateRequiredFields(result.data.grades[0], [
            'id', 'subject', 'score', 'grade'
          ]);
          expect(gradeValidation.valid).toBe(true);

          const gradeTypeValidation = validateFieldTypes(result.data.grades[0], {
            id: 'string',
            subject: 'string',
            score: 'number',
            grade: 'string'
          });
          expect(gradeTypeValidation.valid).toBe(true);

          // 验证分数范围
          expect(result.data.grades[0].score).toBeGreaterThanOrEqual(0);
          expect(result.data.grades[0].score).toBeLessThanOrEqual(100);
        }
      });

      it('should handle student not found', async () => {
        const studentId = '999';
        const mockError = new Error('Student not found');

        mockRequest.get.mockRejectedValue(mockError);

        await expect(personnelCenterApi.getStudentDetail(studentId)).rejects.toThrow('Student not found');
      });
    });
  });

  describe('Parent Management APIs', () => {
    describe('getParents', () => {
      it('should get parents with strict validation', async () => {
        const mockParams: QueryParams = {
          page: 1,
          pageSize: 10,
          keyword: 'parent'
        };
        const mockResponse = {
          success: true,
          data: {
            items: [
              { id: '1', name: 'Test Parent', phone: '12345678901', email: 'parent@example.com', status: 'active' }
            ],
            total: 1,
            page: 1,
            pageSize: 10
          }
        };

        mockRequest.get.mockResolvedValue(mockResponse);

        const result = await personnelCenterApi.getParents(mockParams);

        // 1. 验证API调用
        expect(mockRequest.get).toHaveBeenCalledWith('/personnel-center/parents', { params: mockParams });

        // 2. 验证分页结构
        const paginationValidation = validatePaginationStructure(result.data);
        expect(paginationValidation.valid).toBe(true);

        // 3. 验证家长数据结构
        if (result.data.items && result.data.items.length > 0) {
          const parentValidation = validateRequiredFields(result.data.items[0], [
            'id', 'name', 'status'
          ]);
          expect(parentValidation.valid).toBe(true);

          const parentTypeValidation = validateFieldTypes(result.data.items[0], {
            id: 'string',
            name: 'string',
            phone: 'string',
            email: 'string',
            status: 'string'
          });
          expect(parentTypeValidation.valid).toBe(true);

          // 4. 验证邮箱和手机号格式（如果提供）
          if (result.data.items[0].email) {
            expect(validateEmailFormat(result.data.items[0].email)).toBe(true);
          }
          if (result.data.items[0].phone) {
            expect(validatePhoneFormat(result.data.items[0].phone)).toBe(true);
          }
        }
      });
    });

    describe('createParent', () => {
      it('should create parent with strict validation', async () => {
        const mockParentData: Partial<Parent> = {
          name: 'New Parent',
          phone: '12345678901',
          email: 'parent@example.com',
          status: 'active',
          registerDate: '2024-01-01'
        };
        const mockResponse = {
          success: true,
          data: { id: '2', ...mockParentData }
        };

        mockRequest.post.mockResolvedValue(mockResponse);

        const result = await personnelCenterApi.createParent(mockParentData);

        // 1. 验证API调用
        expect(mockRequest.post).toHaveBeenCalledWith('/personnel-center/parents', mockParentData);

        // 2. 验证响应结构
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();

        // 3. 验证必填字段
        const requiredFields = ['id', 'name', 'status'];
        const fieldValidation = validateRequiredFields(result.data, requiredFields);
        expect(fieldValidation.valid).toBe(true);

        // 4. 验证字段类型和格式
        const typeValidation = validateFieldTypes(result.data, {
          id: 'string',
          name: 'string',
          phone: 'string',
          email: 'string',
          status: 'string',
          registerDate: 'string'
        });
        expect(typeValidation.valid).toBe(true);

        // 5. 验证邮箱和手机号格式
        if (result.data.email) {
          expect(validateEmailFormat(result.data.email)).toBe(true);
        }
        if (result.data.phone) {
          expect(validatePhoneFormat(result.data.phone)).toBe(true);
        }
      });
    });

    describe('updateParent', () => {
      it('should update parent with strict validation', async () => {
        const parentId = '1';
        const mockUpdateData: Partial<Parent> = {
          name: 'Updated Parent',
          email: 'updated@example.com'
        };
        const mockResponse = {
          success: true,
          data: { id: parentId, ...mockUpdateData }
        };

        mockRequest.put.mockResolvedValue(mockResponse);

        const result = await personnelCenterApi.updateParent(parentId, mockUpdateData);

        // 1. 验证API调用
        expect(mockRequest.put).toHaveBeenCalledWith(`/personnel-center/parents/${parentId}`, mockUpdateData);

        // 2. 验证响应结构和字段格式
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();

        const fieldValidation = validateRequiredFields(result.data, ['id']);
        expect(fieldValidation.valid).toBe(true);

        if (result.data.email) {
          expect(validateEmailFormat(result.data.email)).toBe(true);
        }
      });
    });

    describe('deleteParent', () => {
      it('should delete parent with strict validation', async () => {
        const parentId = '1';
        const mockResponse = {
          success: true,
          message: '删除成功'
        };

        mockRequest.delete.mockResolvedValue(mockResponse);

        const result = await personnelCenterApi.deleteParent(parentId);

        // 1. 验证API调用
        expect(mockRequest.delete).toHaveBeenCalledWith(`/personnel-center/parents/${parentId}`);

        // 2. 验证响应结构
        expect(result.success).toBe(true);
        expect(typeof result.message).toBe('string');
      });
    });

    describe('getParentDetail', () => {
      it('should get parent detail with strict validation', async () => {
        const parentId = '1';
        const mockResponse = {
          success: true,
          data: {
            id: parentId,
            name: 'Test Parent',
            phone: '12345678901',
            email: 'parent@example.com',
            status: 'active',
            children: [
              { id: '1', name: 'Child 1', age: 6, gender: 'male' }
            ]
          }
        };

        mockRequest.get.mockResolvedValue(mockResponse);

        const result = await personnelCenterApi.getParentDetail(parentId);

        // 1. 验证API调用
        expect(mockRequest.get).toHaveBeenCalledWith(`/personnel-center/parents/${parentId}`);

        // 2. 验证响应结构
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();

        // 3. 验证必填字段
        const requiredFields = ['id', 'name', 'status'];
        const fieldValidation = validateRequiredFields(result.data, requiredFields);
        expect(fieldValidation.valid).toBe(true);

        // 4. 验证字段类型
        const typeValidation = validateFieldTypes(result.data, {
          id: 'string',
          name: 'string',
          phone: 'string',
          email: 'string',
          status: 'string',
          children: 'array'
        });
        expect(typeValidation.valid).toBe(true);

        // 5. 验证子女数据结构
        if (result.data.children && result.data.children.length > 0) {
          const childValidation = validateRequiredFields(result.data.children[0], [
            'id', 'name', 'age', 'gender'
          ]);
          expect(childValidation.valid).toBe(true);
        }
      });
    });
  });

  describe('Teacher Management APIs', () => {
    describe('getTeachers', () => {
      it('should get teachers with strict validation', async () => {
        const mockParams: QueryParams = {
          page: 1,
          pageSize: 10,
          department: 'Math'
        };
        const mockResponse = {
          success: true,
          data: {
            items: [
              { id: '1', name: 'Test Teacher', employeeId: 'TCH001', department: 'Math', status: 'active' }
            ],
            total: 1,
            page: 1,
            pageSize: 10
          }
        };

        mockRequest.get.mockResolvedValue(mockResponse);

        const result = await personnelCenterApi.getTeachers(mockParams);

        // 1. 验证API调用
        expect(mockRequest.get).toHaveBeenCalledWith('/personnel-center/teachers', { params: mockParams });

        // 2. 验证分页结构
        const paginationValidation = validatePaginationStructure(result.data);
        expect(paginationValidation.valid).toBe(true);

        // 3. 验证教师数据结构
        if (result.data.items && result.data.items.length > 0) {
          const teacherValidation = validateRequiredFields(result.data.items[0], [
            'id', 'name', 'employeeId', 'status'
          ]);
          expect(teacherValidation.valid).toBe(true);

          const teacherTypeValidation = validateFieldTypes(result.data.items[0], {
            id: 'string',
            name: 'string',
            employeeId: 'string',
            department: 'string',
            status: 'string'
          });
          expect(teacherTypeValidation.valid).toBe(true);
        }
      });
    });

    describe('createTeacher', () => {
      it('should create teacher with strict validation', async () => {
        const mockTeacherData: Partial<Teacher> = {
          name: 'New Teacher',
          employeeId: 'TCH002',
          department: 'Math',
          position: 'Senior Teacher',
          phone: '12345678901',
          status: 'active',
          hireDate: '2024-01-01'
        };
        const mockResponse = {
          success: true,
          data: { id: '2', ...mockTeacherData }
        };

        mockRequest.post.mockResolvedValue(mockResponse);

        const result = await personnelCenterApi.createTeacher(mockTeacherData);

        // 1. 验证API调用
        expect(mockRequest.post).toHaveBeenCalledWith('/personnel-center/teachers', mockTeacherData);

        // 2. 验证响应结构
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();

        // 3. 验证必填字段
        const requiredFields = ['id', 'name', 'employeeId', 'status'];
        const fieldValidation = validateRequiredFields(result.data, requiredFields);
        expect(fieldValidation.valid).toBe(true);

        // 4. 验证字段类型
        const typeValidation = validateFieldTypes(result.data, {
          id: 'string',
          name: 'string',
          employeeId: 'string',
          department: 'string',
          position: 'string',
          phone: 'string',
          status: 'string',
          hireDate: 'string'
        });
        expect(typeValidation.valid).toBe(true);
      });
    });

    describe('updateTeacher', () => {
      it('should update teacher with strict validation', async () => {
        const teacherId = '1';
        const mockUpdateData: Partial<Teacher> = {
          name: 'Updated Teacher',
          position: 'Head Teacher'
        };
        const mockResponse = {
          success: true,
          data: { id: teacherId, ...mockUpdateData }
        };

        mockRequest.put.mockResolvedValue(mockResponse);

        const result = await personnelCenterApi.updateTeacher(teacherId, mockUpdateData);

        // 1. 验证API调用
        expect(mockRequest.put).toHaveBeenCalledWith(`/personnel-center/teachers/${teacherId}`, mockUpdateData);

        // 2. 验证响应结构
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();

        const fieldValidation = validateRequiredFields(result.data, ['id']);
        expect(fieldValidation.valid).toBe(true);
      });
    });

    describe('deleteTeacher', () => {
      it('should delete teacher with strict validation', async () => {
        const teacherId = '1';
        const mockResponse = {
          success: true,
          message: '删除成功'
        };

        mockRequest.delete.mockResolvedValue(mockResponse);

        const result = await personnelCenterApi.deleteTeacher(teacherId);

        // 1. 验证API调用
        expect(mockRequest.delete).toHaveBeenCalledWith(`/personnel-center/teachers/${teacherId}`);

        // 2. 验证响应结构
        expect(result.success).toBe(true);
        expect(typeof result.message).toBe('string');
      });
    });

    describe('getTeacherDetail', () => {
      it('should get teacher detail with strict validation', async () => {
        const teacherId = '1';
        const mockResponse = {
          success: true,
          data: {
            id: teacherId,
            name: 'Test Teacher',
            employeeId: 'TCH001',
            department: 'Math',
            status: 'active',
            classes: [
              { id: '1', name: 'Class A', grade: 'Grade 1', studentCount: 25 }
            ]
          }
        };

        mockRequest.get.mockResolvedValue(mockResponse);

        const result = await personnelCenterApi.getTeacherDetail(teacherId);

        // 1. 验证API调用
        expect(mockRequest.get).toHaveBeenCalledWith(`/personnel-center/teachers/${teacherId}`);

        // 2. 验证响应结构
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();

        // 3. 验证必填字段
        const requiredFields = ['id', 'name', 'employeeId', 'status'];
        const fieldValidation = validateRequiredFields(result.data, requiredFields);
        expect(fieldValidation.valid).toBe(true);

        // 4. 验证班级数据结构
        if (result.data.classes && result.data.classes.length > 0) {
          const classValidation = validateRequiredFields(result.data.classes[0], [
            'id', 'name', 'grade', 'studentCount'
          ]);
          expect(classValidation.valid).toBe(true);
        }
      });
    });
  });

  describe('Class Management APIs', () => {
    describe('getClasses', () => {
      it('should get classes with strict validation', async () => {
        const mockParams: QueryParams = {
          page: 1,
          pageSize: 10,
          status: 'active'
        };
        const mockResponse = {
          success: true,
          data: {
            items: [
              { id: '1', name: 'Class A', grade: 'Grade 1', status: 'active', studentCount: 25 }
            ],
            total: 1,
            page: 1,
            pageSize: 10
          }
        };

        mockRequest.get.mockResolvedValue(mockResponse);

        const result = await personnelCenterApi.getClasses(mockParams);

        // 1. 验证API调用
        expect(mockRequest.get).toHaveBeenCalledWith('/personnel-center/classes', { params: mockParams });

        // 2. 验证分页结构
        const paginationValidation = validatePaginationStructure(result.data);
        expect(paginationValidation.valid).toBe(true);

        // 3. 验证班级数据结构
        if (result.data.items && result.data.items.length > 0) {
          const classValidation = validateRequiredFields(result.data.items[0], [
            'id', 'name', 'grade', 'status'
          ]);
          expect(classValidation.valid).toBe(true);

          const classTypeValidation = validateFieldTypes(result.data.items[0], {
            id: 'string',
            name: 'string',
            grade: 'string',
            status: 'string',
            studentCount: 'number'
          });
          expect(classTypeValidation.valid).toBe(true);
        }
      });
    });

    describe('createClass', () => {
      it('should create class with strict validation', async () => {
        const mockClassData: Partial<Class> = {
          name: 'New Class',
          grade: 'Grade 1',
          maxCapacity: 30,
          currentStudents: 0,
          teacherName: 'Test Teacher',
          room: 'Room 101',
          status: 'active',
          createDate: '2024-01-01'
        };
        const mockResponse = {
          success: true,
          data: { id: '2', ...mockClassData }
        };

        mockRequest.post.mockResolvedValue(mockResponse);

        const result = await personnelCenterApi.createClass(mockClassData);

        // 1. 验证API调用
        expect(mockRequest.post).toHaveBeenCalledWith('/personnel-center/classes', mockClassData);

        // 2. 验证响应结构
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();

        // 3. 验证必填字段
        const requiredFields = ['id', 'name', 'grade', 'status'];
        const fieldValidation = validateRequiredFields(result.data, requiredFields);
        expect(fieldValidation.valid).toBe(true);

        // 4. 验证字段类型和数值范围
        const typeValidation = validateFieldTypes(result.data, {
          id: 'string',
          name: 'string',
          grade: 'string',
          maxCapacity: 'number',
          currentStudents: 'number',
          teacherName: 'string',
          room: 'string',
          status: 'string',
          createDate: 'string'
        });
        expect(typeValidation.valid).toBe(true);

        // 5. 验证数值范围
        if (result.data.maxCapacity) {
          expect(result.data.maxCapacity).toBeGreaterThan(0);
        }
        if (result.data.currentStudents !== undefined) {
          expect(result.data.currentStudents).toBeGreaterThanOrEqual(0);
        }
      });
    });

    describe('updateClass', () => {
      it('should update class with strict validation', async () => {
        const classId = '1';
        const mockUpdateData: Partial<Class> = {
          name: 'Updated Class',
          teacherName: 'New Teacher'
        };
        const mockResponse = {
          success: true,
          data: { id: classId, ...mockUpdateData }
        };

        mockRequest.put.mockResolvedValue(mockResponse);

        const result = await personnelCenterApi.updateClass(classId, mockUpdateData);

        // 1. 验证API调用
        expect(mockRequest.put).toHaveBeenCalledWith(`/personnel-center/classes/${classId}`, mockUpdateData);

        // 2. 验证响应结构
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();

        const fieldValidation = validateRequiredFields(result.data, ['id']);
        expect(fieldValidation.valid).toBe(true);
      });
    });

    describe('deleteClass', () => {
      it('should delete class with strict validation', async () => {
        const classId = '1';
        const mockResponse = {
          success: true,
          message: '删除成功'
        };

        mockRequest.delete.mockResolvedValue(mockResponse);

        const result = await personnelCenterApi.deleteClass(classId);

        // 1. 验证API调用
        expect(mockRequest.delete).toHaveBeenCalledWith(`/personnel-center/classes/${classId}`);

        // 2. 验证响应结构
        expect(result.success).toBe(true);
        expect(typeof result.message).toBe('string');
      });
    });

    describe('getClassDetail', () => {
      it('should get class detail with strict validation', async () => {
        const classId = '1';
        const mockResponse = {
          success: true,
          data: {
            id: classId,
            name: 'Test Class',
            grade: 'Grade 1',
            status: 'active',
            maxCapacity: 30,
            currentStudents: 25,
            students: [
              { id: '1', name: 'Student 1', age: 6, gender: 'male' }
            ]
          }
        };

        mockRequest.get.mockResolvedValue(mockResponse);

        const result = await personnelCenterApi.getClassDetail(classId);

        // 1. 验证API调用
        expect(mockRequest.get).toHaveBeenCalledWith(`/personnel-center/classes/${classId}`);

        // 2. 验证响应结构
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();

        // 3. 验证必填字段
        const requiredFields = ['id', 'name', 'grade', 'status'];
        const fieldValidation = validateRequiredFields(result.data, requiredFields);
        expect(fieldValidation.valid).toBe(true);

        // 4. 验证字段类型和数值范围
        const typeValidation = validateFieldTypes(result.data, {
          id: 'string',
          name: 'string',
          grade: 'string',
          status: 'string',
          maxCapacity: 'number',
          currentStudents: 'number',
          students: 'array'
        });
        expect(typeValidation.valid).toBe(true);

        // 5. 验证学生数据结构
        if (result.data.students && result.data.students.length > 0) {
          const studentValidation = validateRequiredFields(result.data.students[0], [
            'id', 'name', 'age', 'gender'
          ]);
          expect(studentValidation.valid).toBe(true);
        }
      });
    });
  });

  describe('Statistics APIs', () => {
    describe('getPersonnelStatistics', () => {
      it('should get personnel statistics with strict validation', async () => {
        const mockStatistics = {
          totalPersonnel: 480,
          studentTeacherRatio: 7.5,
          averageClassSize: 25
        };

        const mockResponse = {
          success: true,
          data: mockStatistics
        };

        mockRequest.get.mockResolvedValue(mockResponse);

        const result = await personnelCenterApi.getPersonnelStatistics();

        // 1. 验证API调用
        expect(mockRequest.get).toHaveBeenCalledWith('/personnel-center/statistics');

        // 2. 验证响应结构
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();

        // 3. 验证必填字段
        const requiredFields = ['totalPersonnel', 'studentTeacherRatio', 'averageClassSize'];
        const fieldValidation = validateRequiredFields(result.data, requiredFields);
        expect(fieldValidation.valid).toBe(true);

        // 4. 验证字段类型和数值范围
        const typeValidation = validateFieldTypes(result.data, {
          totalPersonnel: 'number',
          studentTeacherRatio: 'number',
          averageClassSize: 'number'
        });
        expect(typeValidation.valid).toBe(true);

        // 5. 验证数值范围
        expect(result.data.totalPersonnel).toBeGreaterThanOrEqual(0);
        expect(result.data.studentTeacherRatio).toBeGreaterThan(0);
        expect(result.data.averageClassSize).toBeGreaterThan(0);
      });
    });
  });

  describe('Export APIs', () => {
    describe('exportStudents', () => {
      it('should export students with strict validation', async () => {
        const mockParams: QueryParams = {
          page: 1,
          pageSize: 10,
          status: 'active'
        };
        const mockBlob = new Blob(['test data'], { type: 'application/vnd.ms-excel' });

        mockRequest.get.mockResolvedValue(mockBlob);

        const result = await personnelCenterApi.exportStudents(mockParams);

        // 1. 验证API调用
        expect(mockRequest.get).toHaveBeenCalledWith('/personnel-center/students/export', { params: mockParams });

        // 2. 验证返回的是Blob对象
        expect(result).toBeInstanceOf(Blob);
        expect(result.type).toBe('application/vnd.ms-excel');
      });
    });

    describe('exportParents', () => {
      it('should export parents with strict validation', async () => {
        const mockParams: QueryParams = { page: 1, pageSize: 10 };
        const mockBlob = new Blob(['test data'], { type: 'application/vnd.ms-excel' });

        mockRequest.get.mockResolvedValue(mockBlob);

        const result = await personnelCenterApi.exportParents(mockParams);

        // 1. 验证API调用
        expect(mockRequest.get).toHaveBeenCalledWith('/personnel-center/parents/export', { params: mockParams });

        // 2. 验证返回的是Blob对象
        expect(result).toBeInstanceOf(Blob);
      });
    });

    describe('exportTeachers', () => {
      it('should export teachers with strict validation', async () => {
        const mockParams: QueryParams = { page: 1, pageSize: 10 };
        const mockBlob = new Blob(['test data'], { type: 'application/vnd.ms-excel' });

        mockRequest.get.mockResolvedValue(mockBlob);

        const result = await personnelCenterApi.exportTeachers(mockParams);

        // 1. 验证API调用
        expect(mockRequest.get).toHaveBeenCalledWith('/personnel-center/teachers/export', { params: mockParams });

        // 2. 验证返回的是Blob对象
        expect(result).toBeInstanceOf(Blob);
      });
    });

    describe('exportClasses', () => {
      it('should export classes with strict validation', async () => {
        const mockParams: QueryParams = { page: 1, pageSize: 10 };
        const mockBlob = new Blob(['test data'], { type: 'application/vnd.ms-excel' });

        mockRequest.get.mockResolvedValue(mockBlob);

        const result = await personnelCenterApi.exportClasses(mockParams);

        // 1. 验证API调用
        expect(mockRequest.get).toHaveBeenCalledWith('/personnel-center/classes/export', { params: mockParams });

        // 2. 验证返回的是Blob对象
        expect(result).toBeInstanceOf(Blob);
      });
    });
  });

  describe('Batch Operations APIs', () => {
    describe('batchUpdateStudents', () => {
      it('should batch update students with strict validation', async () => {
        const studentIds = ['1', '2', '3'];
        const mockUpdateData: Partial<Student> = { status: 'inactive' };
        const mockResponse = {
          success: true,
          data: { updated: 3, failed: 0 }
        };

        mockRequest.put.mockResolvedValue(mockResponse);

        const result = await personnelCenterApi.batchUpdateStudents(studentIds, mockUpdateData);

        // 1. 验证API调用
        expect(mockRequest.put).toHaveBeenCalledWith('/personnel-center/students/batch', {
          ids: studentIds,
          data: mockUpdateData
        });

        // 2. 验证响应结构
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();

        // 3. 验证必填字段
        const fieldValidation = validateRequiredFields(result.data, ['updated', 'failed']);
        expect(fieldValidation.valid).toBe(true);

        // 4. 验证字段类型和数值范围
        const typeValidation = validateFieldTypes(result.data, {
          updated: 'number',
          failed: 'number'
        });
        expect(typeValidation.valid).toBe(true);

        expect(result.data.updated).toBeGreaterThanOrEqual(0);
        expect(result.data.failed).toBeGreaterThanOrEqual(0);
      });
    });

    describe('batchDeleteStudents', () => {
      it('should batch delete students with strict validation', async () => {
        const studentIds = ['1', '2', '3'];
        const mockResponse = {
          success: true,
          data: { deleted: 3, failed: 0 }
        };

        mockRequest.delete.mockResolvedValue(mockResponse);

        const result = await personnelCenterApi.batchDeleteStudents(studentIds);

        // 1. 验证API调用
        expect(mockRequest.delete).toHaveBeenCalledWith('/personnel-center/students/batch', {
          data: { ids: studentIds }
        });

        // 2. 验证响应结构
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();

        // 3. 验证字段类型和数值范围
        const typeValidation = validateFieldTypes(result.data, {
          deleted: 'number',
          failed: 'number'
        });
        expect(typeValidation.valid).toBe(true);
      });
    });

    describe('batchUpdateParents', () => {
      it('should batch update parents with strict validation', async () => {
        const parentIds = ['1', '2'];
        const mockUpdateData: Partial<Parent> = { status: 'active' };
        const mockResponse = {
          success: true,
          data: { updated: 2, failed: 0 }
        };

        mockRequest.put.mockResolvedValue(mockResponse);

        const result = await personnelCenterApi.batchUpdateParents(parentIds, mockUpdateData);

        // 1. 验证API调用和响应结构
        expect(mockRequest.put).toHaveBeenCalledWith('/personnel-center/parents/batch', {
          ids: parentIds,
          data: mockUpdateData
        });

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();

        // 2. 验证字段类型
        const typeValidation = validateFieldTypes(result.data, {
          updated: 'number',
          failed: 'number'
        });
        expect(typeValidation.valid).toBe(true);
      });
    });

    describe('batchDeleteParents', () => {
      it('should batch delete parents with strict validation', async () => {
        const parentIds = ['1', '2'];
        const mockResponse = {
          success: true,
          data: { deleted: 2, failed: 0 }
        };

        mockRequest.delete.mockResolvedValue(mockResponse);

        const result = await personnelCenterApi.batchDeleteParents(parentIds);

        // 1. 验证API调用和响应结构
        expect(mockRequest.delete).toHaveBeenCalledWith('/personnel-center/parents/batch', {
          data: { ids: parentIds }
        });

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
      });
    });

    describe('batchUpdateTeachers', () => {
      it('should batch update teachers with strict validation', async () => {
        const teacherIds = ['1', '2'];
        const mockUpdateData: Partial<Teacher> = { department: 'Updated Dept' };
        const mockResponse = {
          success: true,
          data: { updated: 2, failed: 0 }
        };

        mockRequest.put.mockResolvedValue(mockResponse);

        const result = await personnelCenterApi.batchUpdateTeachers(teacherIds, mockUpdateData);

        // 1. 验证API调用和响应结构
        expect(mockRequest.put).toHaveBeenCalledWith('/personnel-center/teachers/batch', {
          ids: teacherIds,
          data: mockUpdateData
        });

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
      });
    });

    describe('batchDeleteTeachers', () => {
      it('should batch delete teachers with strict validation', async () => {
        const teacherIds = ['1', '2'];
        const mockResponse = {
          success: true,
          data: { deleted: 2, failed: 0 }
        };

        mockRequest.delete.mockResolvedValue(mockResponse);

        const result = await personnelCenterApi.batchDeleteTeachers(teacherIds);

        // 1. 验证API调用和响应结构
        expect(mockRequest.delete).toHaveBeenCalledWith('/personnel-center/teachers/batch', {
          data: { ids: teacherIds }
        });

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
      });
    });

    describe('batchUpdateClasses', () => {
      it('should batch update classes with strict validation', async () => {
        const classIds = ['1', '2'];
        const mockUpdateData: Partial<Class> = { status: 'inactive' };
        const mockResponse = {
          success: true,
          data: { updated: 2, failed: 0 }
        };

        mockRequest.put.mockResolvedValue(mockResponse);

        const result = await personnelCenterApi.batchUpdateClasses(classIds, mockUpdateData);

        // 1. 验证API调用和响应结构
        expect(mockRequest.put).toHaveBeenCalledWith('/personnel-center/classes/batch', {
          ids: classIds,
          data: mockUpdateData
        });

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
      });
    });

    describe('batchDeleteClasses', () => {
      it('should batch delete classes with strict validation', async () => {
        const classIds = ['1', '2'];
        const mockResponse = {
          success: true,
          data: { deleted: 2, failed: 0 }
        };

        mockRequest.delete.mockResolvedValue(mockResponse);

        const result = await personnelCenterApi.batchDeleteClasses(classIds);

        // 1. 验证API调用和响应结构
        expect(mockRequest.delete).toHaveBeenCalledWith('/personnel-center/classes/batch', {
          data: { ids: classIds }
        });

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
      });
    });
  });
});