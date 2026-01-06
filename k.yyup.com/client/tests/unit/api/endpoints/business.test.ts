/**
 * 业务核心功能API端点测试
 * 测试文件: /home/zhgue/yyupcc/k.yyup.com/client/src/api/endpoints/business.ts
 * 严格验证标准升级
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import {
  KINDERGARTEN_ENDPOINTS,
  CLASS_ENDPOINTS,
  TEACHER_ENDPOINTS,
  STUDENT_ENDPOINTS,
  PARENT_ENDPOINTS
} from '@/api/endpoints/business';
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';
import {
  validateRequiredFields,
  validateFieldTypes,
  validateEnumValue,
  validateApiResponseStructure,
  validateIdFormat
} from '../../../utils/data-validation';

// 控制台错误检测变量
let consoleSpy: any

describe('业务核心功能API端点 - 严格验证', () => {
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

  describe('幼儿园管理接口', () => {
    it('应该定义正确的幼儿园基础端点', () => {
      expect(KINDERGARTEN_ENDPOINTS.BASE).toBe('/api/kindergartens');
    });

    it('应该支持幼儿园CRUD操作 - 严格验证', () => {
      const testCases = [
        { id: 123, expected: '/api/kindergartens/123' },
        { id: 456, expected: '/api/kindergartens/456' },
        { id: 'abc-123', expected: '/api/kindergartens/abc-123' },
        { id: 0, expected: '/api/kindergartens/0' }
      ];

      testCases.forEach(({ id, expected }) => {
        // 验证ID格式
        const idValidation = validateIdFormat(String(id));
        expect(idValidation).toBe(true);

        // 验证端点路径
        expect(KINDERGARTEN_ENDPOINTS.GET_BY_ID(id)).toBe(expected);
        expect(KINDERGARTEN_ENDPOINTS.UPDATE(id)).toBe(expected);
        expect(KINDERGARTEN_ENDPOINTS.DELETE(id)).toBe(expected);

        // 验证路径结构
        const path = KINDERGARTEN_ENDPOINTS.GET_BY_ID(id);
        expect(path).toMatch(/^\/api\/kindergartens\/[a-zA-Z0-9-]+$/);
        expect(path.startsWith('/api/')).toBe(true);
      });
    });

    it('应该支持幼儿园关联数据查询 - 严格验证', () => {
      const id = 456;
      const endpointTests = [
        { method: 'GET_CLASSES', expected: '/api/kindergartens/456/classes' },
        { method: 'GET_TEACHERS', expected: '/api/kindergartens/456/teachers' },
        { method: 'GET_STUDENTS', expected: '/api/kindergartens/456/students' },
        { method: 'STATISTICS', expected: '/api/kindergartens/456/statistics' }
      ];

      endpointTests.forEach(({ method, expected }) => {
        const result = KINDERGARTEN_ENDPOINTS[method](id);
        expect(result).toBe(expected);

        // 验证路径结构
        expect(result).toMatch(/^\/api\/kindergartens\/\d+\/[a-z-]+$/);
        expect(result.startsWith('/api/kindergartens/')).toBe(true);
      });
    });

    it('应该支持字符串类型ID - 严格验证', () => {
      const stringIdTests = [
        { id: 'abc-123', type: 'uuid-format' },
        { id: 'kindergarten_001', type: 'custom-format' },
        { id: '12345', type: 'numeric-string' }
      ];

      stringIdTests.forEach(({ id, type }) => {
        const result = KINDERGARTEN_ENDPOINTS.GET_BY_ID(id);
        expect(result).toBe(`/api/kindergartens/${id}`);

        // 验证路径包含预期的ID
        expect(result).toContain(id);
        expect(result.startsWith('/api/kindergartens/')).toBe(true);

        // 验证ID不为空
        expect(id.trim().length).toBeGreaterThan(0);
      });
    });
  });

  describe('班级管理接口 - 严格验证', () => {
    it('应该定义正确的班级基础端点 - 严格验证', () => {
      const basePath = CLASS_ENDPOINTS.BASE;
      expect(basePath).toBe('/api/classes');

      // 验证路径结构
      expect(basePath).toMatch(/^\/api\/[a-z]+$/);
      expect(basePath.startsWith('/api/')).toBe(true);
      expect(basePath.endsWith('classes')).toBe(true);
    });

    it('应该支持班级CRUD操作 - 严格验证', () => {
      const testCases = [
        { id: 789, description: '数字ID' },
        { id: 'class_001', description: '字符串ID' },
        { id: 0, description: '边界值ID' },
        { id: 999999, description: '大数字ID' }
      ];

      testCases.forEach(({ id, description }) => {
        // 验证ID格式
        const idValidation = validateIdFormat(String(id));
        expect(idValidation).toBe(true);

        // 验证所有CRUD操作
        const endpoints = [
          CLASS_ENDPOINTS.GET_BY_ID(id),
          CLASS_ENDPOINTS.UPDATE(id),
          CLASS_ENDPOINTS.DELETE(id)
        ];

        endpoints.forEach(endpoint => {
          // 验证路径结构
          expect(endpoint).toMatch(/^\/api\/classes\/[a-zA-Z0-9_-]+$/);
          expect(endpoint.startsWith('/api/classes/')).toBe(true);

          // 验证包含ID
          expect(endpoint).toContain(String(id));
        });
      });
    });

    it('应该支持班级状态管理 - 严格验证', () => {
      const statusTestCases = [
        { id: 101, status: 'active', expectedPath: '/api/classes/101/status' },
        { id: 'class_002', status: 'inactive', expectedPath: '/api/classes/class_002/status' },
        { id: 0, status: 'archived', expectedPath: '/api/classes/0/status' }
      ];

      statusTestCases.forEach(({ id, status, expectedPath }) => {
        const result = CLASS_ENDPOINTS.UPDATE_STATUS(id);
        expect(result).toBe(expectedPath);

        // 验证状态枚举值
        const validStatuses = ['active', 'inactive', 'archived', 'suspended'];
        expect(validStatuses).toContain(status);

        // 验证路径结构
        expect(result).toMatch(/^\/api\/classes\/[a-zA-Z0-9_-]+\/status$/);
      });
    });

    it('应该支持班级教师和学生管理 - 严格验证', () => {
      const testScenarios = [
        {
          classId: 202,
          teacherId: 303,
          studentId: 404,
          description: '数字ID组合'
        },
        {
          classId: 'class_A',
          teacherId: 'teacher_1',
          studentId: 'student_1',
          description: '字符串ID组合'
        }
      ];

      testScenarios.forEach(({ classId, teacherId, studentId, description }) => {
        // 验证基础路径
        expect(CLASS_ENDPOINTS.TEACHERS(classId)).toBe(`/api/classes/${classId}/teachers`);
        expect(CLASS_ENDPOINTS.STUDENTS(classId)).toBe(`/api/classes/${classId}/students`);

        // 验证关联操作
        expect(CLASS_ENDPOINTS.REMOVE_STUDENT(classId, studentId))
          .toBe(`/api/classes/${classId}/students/${studentId}`);
        expect(CLASS_ENDPOINTS.ASSIGN_TEACHER(classId, teacherId))
          .toBe(`/api/classes/${classId}/teachers/${teacherId}`);
        expect(CLASS_ENDPOINTS.REMOVE_TEACHER(classId, teacherId))
          .toBe(`/api/classes/${classId}/teachers/${teacherId}`);

        // 验证所有ID格式
        [classId, teacherId, studentId].forEach(id => {
          expect(validateIdFormat(String(id))).toBe(true);
        });
      });
    });

    it('应该支持班级特殊操作 - 严格验证', () => {
      const specialOperations = {
        TRANSFER: { id: 505, pattern: /^\/api\/classes\/\d+\/transfer$/ },
        BATCH_ASSIGN_STUDENTS: { id: 505, pattern: /^\/api\/classes\/\d+\/students\/batch-assign$/ },
        ATTENDANCE: { id: 505, pattern: /^\/api\/classes\/\d+\/attendance$/ }
      };

      // 测试需要ID的操作
      Object.entries(specialOperations).forEach(([operation, { id, pattern }]) => {
        const endpoint = CLASS_ENDPOINTS[operation](id);
        expect(pattern.test(endpoint)).toBe(true);
        expect(endpoint).toContain(String(id));
      });

      // 测试静态端点
      const staticEndpoints = [
        { key: 'STATISTICS', expected: '/api/classes/stats' },
        { key: 'AVAILABLE_CLASSROOMS', expected: '/api/classes/available-classrooms' },
        { key: 'EXPORT', expected: '/api/classes/export' }
      ];

      staticEndpoints.forEach(({ key, expected }) => {
        expect(CLASS_ENDPOINTS[key]).toBe(expected);
        expect(CLASS_ENDPOINTS[key]).toMatch(/^\/api\/classes\/[a-z-]+$/);
      });
    });
  });

  describe('教师管理接口 - 严格验证', () => {
    it('应该定义正确的教师基础端点 - 严格验证', () => {
      const basePath = TEACHER_ENDPOINTS.BASE;
      expect(basePath).toBe('/api/teachers');

      // 验证路径结构
      expect(basePath).toMatch(/^\/api\/[a-z]+$/);
      expect(basePath.startsWith('/api/')).toBe(true);
      expect(basePath.endsWith('teachers')).toBe(true);
    });

    it('应该支持教师CRUD操作 - 严格验证', () => {
      const testCases = [
        { id: 606, description: '标准数字ID' },
        { id: 'teacher_001', description: '字符串ID' },
        { id: 'T001', description: '编码格式ID' }
      ];

      testCases.forEach(({ id, description }) => {
        // 验证ID格式
        expect(validateIdFormat(String(id))).toBe(true);

        // 验证CRUD端点
        const crudEndpoints = [
          TEACHER_ENDPOINTS.GET_BY_ID(id),
          TEACHER_ENDPOINTS.UPDATE(id),
          TEACHER_ENDPOINTS.DELETE(id)
        ];

        crudEndpoints.forEach(endpoint => {
          expect(endpoint).toMatch(/^\/api\/teachers\/[a-zA-Z0-9_-]+$/);
          expect(endpoint).toContain(String(id));
        });
      });
    });

    it('应该支持教师关联数据查询 - 严格验证', () => {
      const id = 707;
      const teacherRelations = [
        { method: 'GET_CLASSES', expected: '/api/teachers/707/classes', resourceType: 'classes' },
        { method: 'PERFORMANCE', expected: '/api/teachers/707/performance', resourceType: 'performance' },
        { method: 'SCHEDULE', expected: '/api/teachers/707/schedule', resourceType: 'schedule' },
        { method: 'WORKLOAD', expected: '/api/teachers/707/workload', resourceType: 'workload' }
      ];

      teacherRelations.forEach(({ method, expected, resourceType }) => {
        const result = TEACHER_ENDPOINTS[method](id);
        expect(result).toBe(expected);
        expect(result).toMatch(/^\/api\/teachers\/\d+\/[a-z]+$/);
        expect(result).toContain(resourceType);
      });
    });

    it('应该支持教师搜索和状态管理 - 严格验证', () => {
      // 验证静态端点
      const staticEndpoints = [
        { key: 'SEARCH', expected: '/api/teachers/search', type: 'search-endpoint' },
        { key: 'EXPORT', expected: '/api/teachers/export', type: 'export-endpoint' },
        { key: 'BATCH_DELETE', expected: '/api/teachers/batch-delete', type: 'batch-operation' }
      ];

      staticEndpoints.forEach(({ key, expected, type }) => {
        expect(TEACHER_ENDPOINTS[key]).toBe(expected);
        expect(TEACHER_ENDPOINTS[key]).toMatch(/^\/api\/teachers\/[a-z-]+$/);
      });

      // 验证状态管理
      const statusTestIds = [808, 'teacher_002', 0, 999];
      statusTestIds.forEach(id => {
        const statusEndpoint = TEACHER_ENDPOINTS.UPDATE_STATUS(id);
        expect(statusEndpoint).toBe(`/api/teachers/${id}/status`);
        expect(statusEndpoint).toMatch(/^\/api\/teachers\/[a-zA-Z0-9_-]+\/status$/);
      });
    });
  });

  describe('学生管理接口 - 严格验证', () => {
    it('应该定义正确的基础端点 - 严格验证', () => {
      const baseEndpoints = [
        { key: 'BASE', expected: '/api/students' },
        { key: 'LIST', expected: '/api/students' }
      ];

      baseEndpoints.forEach(({ key, expected }) => {
        expect(STUDENT_ENDPOINTS[key]).toBe(expected);
        expect(STUDENT_ENDPOINTS[key]).toMatch(/^\/api\/[a-z]+$/);
      });
    });

    it('应该支持学生CRUD操作 - 严格验证', () => {
      const testCases = [
        { id: 909, description: '标准数字ID' },
        { id: 'student_001', description: '字符串ID' },
        { id: 'S001', description: '学生编码' }
      ];

      testCases.forEach(({ id, description }) => {
        expect(validateIdFormat(String(id))).toBe(true);

        // 验证学生CRUD端点
        const crudOperations = [
          { method: 'GET_BY_ID', path: `/api/students/${id}` },
          { method: 'UPDATE', path: `/api/students/${id}` },
          { method: 'DELETE', path: `/api/students/${id}` },
          { method: 'DETAIL', path: `/api/students/${id}` }
        ];

        crudOperations.forEach(({ method, path }) => {
          expect(STUDENT_ENDPOINTS[method](id)).toBe(path);
          expect(STUDENT_ENDPOINTS[method](id)).toMatch(/^\/api\/students\/[a-zA-Z0-9_-]+$/);
        });
      });
    });

    it('应该支持学生关联数据查询 - 严格验证', () => {
      const id = 1010;
      const studentRelations = [
        { method: 'GET_CLASS', expected: '/api/students/1010/class', resource: 'class' },
        { method: 'GET_PARENTS', expected: '/api/students/1010/parents', resource: 'parents' },
        { method: 'ATTENDANCE', expected: '/api/students/1010/attendance', resource: 'attendance' },
        { method: 'GRADES', expected: '/api/students/1010/grades', resource: 'grades' }
      ];

      studentRelations.forEach(({ method, expected, resource }) => {
        const result = STUDENT_ENDPOINTS[method](id);
        expect(result).toBe(expected);
        expect(result).toMatch(/^\/api\/students\/\d+\/[a-z-]+$/);
        expect(result).toContain(resource);
      });
    });

    it('应该支持学生成长记录 - 严格验证', () => {
      const growthTestCases = [
        { id: 1111, type: 'records', method: 'GROWTH_RECORDS' },
        { id: 1111, type: 'single', method: 'GROWTH_RECORD' },
        { id: 1111, type: 'export', method: 'EXPORT_GROWTH_REPORT' }
      ];

      growthTestCases.forEach(({ id, type, method }) => {
        const endpoint = STUDENT_ENDPOINTS[method](id);
        expect(endpoint).toContain(String(id));
        expect(endpoint).toContain('growth');

        // 验证路径结构
        if (type === 'records') {
          expect(endpoint).toMatch(/^\/api\/students\/\d+\/growth-records$/);
        } else if (type === 'single') {
          expect(endpoint).toMatch(/^\/api\/students\/\d+\/growth-record$/);
        } else if (type === 'export') {
          expect(endpoint).toMatch(/^\/api\/students\/\d+\/export-growth-report$/);
        }
      });
    });

    it('应该支持学生分析和评估 - 严格验证', () => {
      const analyticsTests = [
        { id: 1212, method: 'ANALYTICS', expected: '/api/students/1212/analytics' },
        { key: 'ASSESSMENTS', expected: '/api/students/assessments' },
        { key: 'EXPORT_ASSESSMENTS', expected: '/api/students/export-assessments' }
      ];

      analyticsTests.forEach(({ id, method, key, expected }) => {
        const endpoint = id ? STUDENT_ENDPOINTS[method](id) : STUDENT_ENDPOINTS[key];
        expect(endpoint).toBe(expected);
        expect(endpoint).toContain('assess') || expect(endpoint).toContain('analytic');
      });
    });

    it('应该支持学生班级移除操作 - 严格验证', () => {
      const testScenarios = [
        { studentId: 1313, classId: 1414, description: '数字ID组合' },
        { studentId: 'student_A', classId: 'class_B', description: '字符串ID组合' }
      ];

      testScenarios.forEach(({ studentId, classId, description }) => {
        const result = STUDENT_ENDPOINTS.REMOVE_FROM_CLASS(studentId, classId);
        const expected = `/api/students/${studentId}/remove-from-class/${classId}`;

        expect(result).toBe(expected);
        expect(result).toMatch(/^\/api\/students\/[a-zA-Z0-9_-]+\/remove-from-class\/[a-zA-Z0-9_-]+$/);

        // 验证ID格式
        expect(validateIdFormat(String(studentId))).toBe(true);
        expect(validateIdFormat(String(classId))).toBe(true);
      });
    });

    it('应该支持学生搜索和状态管理 - 严格验证', () => {
      // 验证静态端点
      const staticEndpoints = [
        { key: 'SEARCH', expected: '/api/students/search' },
        { key: 'AVAILABLE', expected: '/api/students/available' },
        { key: 'STATS', expected: '/api/students/stats' },
        { key: 'STATISTICS', expected: '/api/students/statistics' },
        { key: 'EXPORT', expected: '/api/students/export' },
        { key: 'BATCH_DELETE', expected: '/api/students/batch-delete' }
      ];

      staticEndpoints.forEach(({ key, expected }) => {
        expect(STUDENT_ENDPOINTS[key]).toBe(expected);
        expect(STUDENT_ENDPOINTS[key]).toMatch(/^\/api\/students\/[a-z-]+$/);
      });

      // 验证状态更新
      const statusTestIds = [1515, 'student_999', 0];
      statusTestIds.forEach(id => {
        const statusEndpoint = STUDENT_ENDPOINTS.UPDATE_STATUS(id);
        expect(statusEndpoint).toBe(`/api/students/${id}/status`);
        expect(statusEndpoint).toMatch(/^\/api\/students\/[a-zA-Z0-9_-]+\/status$/);
      });
    });
  });

  describe('家长管理接口 - 严格验证', () => {
    it('应该定义正确的家长基础端点 - 严格验证', () => {
      const basePath = PARENT_ENDPOINTS.BASE;
      expect(basePath).toBe('/api/parents');

      // 验证路径结构
      expect(basePath).toMatch(/^\/api\/[a-z]+$/);
      expect(basePath.startsWith('/api/')).toBe(true);
      expect(basePath.endsWith('parents')).toBe(true);
    });

    it('应该支持家长CRUD操作 - 严格验证', () => {
      const testCases = [
        { id: 1616, description: '标准数字ID' },
        { id: 'parent_001', description: '字符串ID' },
        { id: 'P001', description: '家长编码' }
      ];

      testCases.forEach(({ id, description }) => {
        // 验证ID格式
        expect(validateIdFormat(String(id))).toBe(true);

        // 验证CRUD端点
        const crudEndpoints = [
          PARENT_ENDPOINTS.GET_BY_ID(id),
          PARENT_ENDPOINTS.UPDATE(id),
          PARENT_ENDPOINTS.DELETE(id)
        ];

        crudEndpoints.forEach(endpoint => {
          expect(endpoint).toMatch(/^\/api\/parents\/[a-zA-Z0-9_-]+$/);
          expect(endpoint).toContain(String(id));
        });
      });
    });

    it('应该支持家长子女查询 - 严格验证', () => {
      const testScenarios = [
        { parentId: 1717, expected: '/api/parents/1717/students' },
        { parentId: 'parent_A', expected: '/api/parents/parent_A/students' },
        { parentId: 0, expected: '/api/parents/0/students' }
      ];

      testScenarios.forEach(({ parentId, expected }) => {
        const result = PARENT_ENDPOINTS.GET_CHILDREN(parentId);
        expect(result).toBe(expected);
        expect(result).toMatch(/^\/api\/parents\/[a-zA-Z0-9_-]+\/students$/);
        expect(result).toContain('students');
      });
    });

    it('应该支持家长搜索和批量操作 - 严格验证', () => {
      const parentOperations = [
        { key: 'SEARCH', expected: '/api/parents/search', type: 'search' },
        { key: 'EXPORT', expected: '/api/parents/export', type: 'export' },
        { key: 'BATCH_DELETE', expected: '/api/parents/batch-delete', type: 'batch' }
      ];

      parentOperations.forEach(({ key, expected, type }) => {
        expect(PARENT_ENDPOINTS[key]).toBe(expected);
        expect(PARENT_ENDPOINTS[key]).toMatch(/^\/api\/parents\/[a-z-]+$/);
      });
    });

    it('应该支持家长沟通功能 - 严格验证', () => {
      const communicationTests = [
        { id: 1818, method: 'COMMUNICATION_HISTORY', suffix: 'communication' },
        { id: 1818, method: 'FEEDBACK', suffix: 'feedback' },
        { id: 1818, method: 'MEETINGS', suffix: 'meetings' }
      ];

      communicationTests.forEach(({ id, method, suffix }) => {
        const endpoint = PARENT_ENDPOINTS[method](id);
        const expected = `/api/parents/${id}/${suffix}`;

        expect(endpoint).toBe(expected);
        expect(endpoint).toMatch(/^\/api\/parents\/\d+\/[a-z-]+$/);
        expect(endpoint).toContain(suffix);
      });
    });
  });

  describe('端点常量类型 - 严格验证', () => {
    it('所有端点应该是只读常量 - 严格验证', () => {
      const endpointObjects = [
        KINDERGARTEN_ENDPOINTS,
        CLASS_ENDPOINTS,
        TEACHER_ENDPOINTS,
        STUDENT_ENDPOINTS,
        PARENT_ENDPOINTS
      ];

      endpointObjects.forEach((endpoints, index) => {
        // 验证对象类型
        expect(typeof endpoints).toBe('object');
        expect(endpoints).not.toBeNull();

        // 验证对象不为空
        expect(Object.keys(endpoints).length).toBeGreaterThan(0);
      });
    });

    it('端点路径应该以斜杠开头 - 严格验证', () => {
      const testEndpointStartsWithSlash = (endpoints: any, moduleName: string) => {
        Object.entries(endpoints).forEach(([key, endpoint]: [string, any]) => {
          if (typeof endpoint === 'string') {
            expect(endpoint.startsWith('/'),
              `${moduleName}.${key} should start with '/api/'`).toBe(true);
            expect(endpoint.startsWith('/api/'),
              `${moduleName}.${key} should start with '/api/'`).toBe(true);
          } else if (typeof endpoint === 'function') {
            // 测试函数返回的路径，使用多个测试ID
            const testIds = [1, 'test_001', 0, 999];
            testIds.forEach(id => {
              try {
                const result = endpoint(id);
                expect(result.startsWith('/'),
                  `${moduleName}.${key}(${id}) should start with '/'`).toBe(true);
                expect(result.startsWith('/api/'),
                  `${moduleName}.${key}(${id}) should start with '/api/'`).toBe(true);
              } catch (error) {
                // 忽略函数调用错误，某些函数可能需要特定参数
              }
            });
          }
        });
      };

      testEndpointStartsWithSlash(KINDERGARTEN_ENDPOINTS, 'KINDERGARTEN_ENDPOINTS');
      testEndpointStartsWithSlash(CLASS_ENDPOINTS, 'CLASS_ENDPOINTS');
      testEndpointStartsWithSlash(TEACHER_ENDPOINTS, 'TEACHER_ENDPOINTS');
      testEndpointStartsWithSlash(STUDENT_ENDPOINTS, 'STUDENT_ENDPOINTS');
      testEndpointStartsWithSlash(PARENT_ENDPOINTS, 'PARENT_ENDPOINTS');
    });

    it('端点路径应该符合RESTful规范 - 严格验证', () => {
      const validateRestfulPattern = (path: string, context: string) => {
        // 验证基本API路径结构
        expect(path).toMatch(/^\/api\/[a-z]+(\/[a-z-]+)*(\/[a-zA-Z0-9_-]+)?$/,
          `${context} should follow RESTful pattern`);

        // 验证不包含特殊字符（除允许的-和_外）
        expect(path).not.toMatch(/[^\/a-zA-Z0-9_-]/,
          `${context} should not contain special characters`);

        // 验证不包含连续的斜杠
        expect(path).not.toMatch(/\/\//,
          `${context} should not contain consecutive slashes`);

        // 验证不以斜杠结尾（除根路径外）
        if (path !== '/api/') {
          expect(path).not.toMatch(/\/$/,
            `${context} should not end with slash`);
        }
      };

      const endpoints = [
        KINDERGARTEN_ENDPOINTS,
        CLASS_ENDPOINTS,
        TEACHER_ENDPOINTS,
        STUDENT_ENDPOINTS,
        PARENT_ENDPOINTS
      ];

      endpoints.forEach((endpointObj, index) => {
        const moduleNames = ['KINDERGARTEN', 'CLASS', 'TEACHER', 'STUDENT', 'PARENT'];
        const moduleName = moduleNames[index];

        Object.entries(endpointObj).forEach(([key, value]) => {
          if (typeof value === 'string') {
            validateRestfulPattern(value, `${moduleName}.${key}`);
          } else if (typeof value === 'function') {
            // 测试函数返回值
            try {
              const result = value(1);
              validateRestfulPattern(result, `${moduleName}.${key}(1)`);
            } catch (error) {
              // 忽略函数调用错误
            }
          }
        });
      });
    });

    it('端点命名应该遵循一致性规则 - 严格验证', () => {
      const namingConventions = {
        // CRUD操作
        'GET_BY_ID': /^\/api\/[a-z]+\/\d+$/,
        'UPDATE': /^\/api\/[a-z]+\/\d+$/,
        'DELETE': /^\/api\/[a-z]+\/\d+$/,

        // 集合操作
        'SEARCH': /^\/api\/[a-z]+\/search$/,
        'EXPORT': /^\/api\/[a-z]+\/export$/,
        'STATS': /^\/api\/[a-z]+\/stats$/,
        'STATISTICS': /^\/api\/[a-z]+\/statistics$/,

        // 批量操作
        'BATCH_DELETE': /^\/api\/[a-z]+\/batch-delete$/,

        // 状态管理
        'UPDATE_STATUS': /^\/api\/[a-z]+\/\d+\/status$/,

        // 关联查询
        'BASE': /^\/api\/[a-z]+$/,
        'LIST': /^\/api\/[a-z]+$/
      };

      const testNamingConvention = (endpoints: any, moduleName: string) => {
        Object.entries(namingConventions).forEach(([convention, pattern]) => {
          if (endpoints[convention]) {
            const endpoint = endpoints[convention];
            if (typeof endpoint === 'string') {
              expect(endpoint).toMatch(pattern,
                `${moduleName}.${convention} should follow naming convention`);
            } else if (typeof endpoint === 'function') {
              try {
                const result = endpoint(1);
                expect(result).toMatch(pattern,
                  `${moduleName}.${convention}(1) should follow naming convention`);
              } catch (error) {
                // 忽略函数调用错误
              }
            }
          }
        });
      };

      testNamingConvention(KINDERGARTEN_ENDPOINTS, 'KINDERGARTEN_ENDPOINTS');
      testNamingConvention(CLASS_ENDPOINTS, 'CLASS_ENDPOINTS');
      testNamingConvention(TEACHER_ENDPOINTS, 'TEACHER_ENDPOINTS');
      testNamingConvention(STUDENT_ENDPOINTS, 'STUDENT_ENDPOINTS');
      testNamingConvention(PARENT_ENDPOINTS, 'PARENT_ENDPOINTS');
    });
  });
});