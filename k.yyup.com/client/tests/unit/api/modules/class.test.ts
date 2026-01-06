/**
 * 班级管理模块API测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import {
  getClassList,
  getClassDetail,
  createClass,
  updateClass,
  deleteClass,
  updateClassStatus,
  assignTeachers,
  getClassStudents,
  addStudentsToClass,
  removeStudentFromClass,
  transferStudents,
  getClassStatistics,
  getAvailableClassrooms,
  exportClassData,
  getStudentAttendance
} from '@/api/modules/class';
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';
import {
  validateRequiredFields,
  validateFieldTypes
} from '../../../utils/data-validation';

// Mock request instance
vi.mock('@/utils/request', () => ({
  default: {
    request: vi.fn()
  }
}));

// Mock data transform utilities
vi.mock('@/utils/dataTransform', () => ({
  transformClassData: vi.fn((data) => data),
  transformListResponse: vi.fn((response, transformFn) => {
    if (response.data && Array.isArray(response.data.items)) {
      response.data.items = response.data.items.map(transformFn);
    }
    return response;
  })
}));

// Import after mocking
import requestInstance from '@/utils/request';
const mockedRequest = vi.mocked(requestInstance.request);

// 控制台错误检测变量
let consoleSpy: any

describe('Class API', () => {
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

  describe('getClassList', () => {
    it('should get class list with query parameters', async () => {
      const mockParams = {
        page: 1,
        pageSize: 10,
        type: 'STANDARD',
        status: 'ACTIVE'
      };
      const mockResponse = {
        success: true,
        data: {
          items: [
            {
              id: '1',
              name: '小班一班',
              type: 'STANDARD',
              status: 'ACTIVE',
              capacity: 30,
              currentCount: 25
            }
          ],
          total: 1,
          page: 1,
          pageSize: 10
        }
      };

      mockedRequest.mockResolvedValue(mockResponse);
      const result = await getClassList(mockParams);

      // 验证API调用
      expect(mockedRequest).toHaveBeenCalledWith({
        url: '/classes',
        method: 'get',
        params: mockParams
      });

      // 验证响应结构
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data.items)).toBe(true);

      // 验证分页字段
      const paginationValidation = validateRequiredFields(result.data, ['items', 'total']);
      expect(paginationValidation.valid).toBe(true);

      // 验证列表项
      if (result.data.items.length > 0) {
        const itemValidation = validateRequiredFields(result.data.items[0], ['id', 'name', 'type', 'status']);
        expect(itemValidation.valid).toBe(true);

        const itemTypeValidation = validateFieldTypes(result.data.items[0], {
          id: 'string',
          name: 'string',
          type: 'string',
          status: 'string',
          capacity: 'number',
          currentCount: 'number'
        });
        expect(itemTypeValidation.valid).toBe(true);
      }
    });

    it('should get class list without parameters', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [],
          total: 0
        }
      };

      mockedRequest.mockResolvedValue(mockResponse);
      const result = await getClassList();

      expect(mockedRequest).toHaveBeenCalledWith({
        url: '/classes',
        method: 'get',
        params: undefined
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getClassDetail', () => {
    it('should get class detail by ID', async () => {
      const classId = '1';
      const mockResponse = {
        success: true,
        data: {
          id: classId,
          name: '小班一班',
          type: 'STANDARD',
          status: 'ACTIVE',
          capacity: 30,
          currentCount: 25,
          ageRange: '3-4岁',
          startDate: '2024-09-01'
        }
      };

      mockedRequest.mockResolvedValue(mockResponse);
      const result = await getClassDetail(classId);

      // 验证API调用
      expect(mockedRequest).toHaveBeenCalledWith({
        url: `/classes/${classId}`,
        method: 'get'
      });

      // 验证响应结构
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // 验证必填字段
      const validation = validateRequiredFields(result.data, ['id', 'name', 'type', 'status', 'capacity']);
      expect(validation.valid).toBe(true);

      // 验证字段类型
      const typeValidation = validateFieldTypes(result.data, {
        id: 'string',
        name: 'string',
        type: 'string',
        status: 'string',
        capacity: 'number',
        currentCount: 'number'
      });
      expect(typeValidation.valid).toBe(true);
    });
  });

  describe('createClass', () => {
    it('should create a new class', async () => {
      const classData = {
        name: '小班二班',
        type: 'STANDARD',
        capacity: 30,
        ageRange: '3-4岁',
        startDate: '2024-09-01'
      };
      const mockResponse = {
        success: true,
        data: {
          id: '2',
          ...classData
        }
      };

      mockedRequest.mockResolvedValue(mockResponse);
      const result = await createClass(classData);

      expect(mockedRequest).toHaveBeenCalledWith({
        url: '/classes',
        method: 'post',
        data: classData
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateClass', () => {
    it('should update class information', async () => {
      const classId = '1';
      const updateData = {
        name: '小班一班 (更新)',
        capacity: 35
      };
      const mockResponse = {
        success: true,
        data: {
          id: classId,
          ...updateData
        }
      };

      mockedRequest.mockResolvedValue(mockResponse);
      const result = await updateClass(classId, updateData);

      expect(mockedRequest).toHaveBeenCalledWith({
        url: `/classes/${classId}`,
        method: 'put',
        data: updateData
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteClass', () => {
    it('should delete a class', async () => {
      const classId = '1';
      const mockResponse = {
        success: true,
        data: { success: true }
      };

      mockedRequest.mockResolvedValue(mockResponse);
      const result = await deleteClass(classId);

      expect(mockedRequest).toHaveBeenCalledWith({
        url: `/classes/${classId}`,
        method: 'delete'
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateClassStatus', () => {
    it('should update class status', async () => {
      const classId = '1';
      const status = 'PAUSED';
      const mockResponse = {
        success: true,
        data: {
          id: classId,
          status: status
        }
      };

      mockedRequest.mockResolvedValue(mockResponse);
      const result = await updateClassStatus(classId, status);

      expect(mockedRequest).toHaveBeenCalledWith({
        url: `/classes/${classId}/status`,
        method: 'patch',
        data: { status }
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('assignTeachers', () => {
    it('should assign teachers to class', async () => {
      const classId = '1';
      const teacherData = {
        headTeacherId: 'teacher1',
        assistantTeacherIds: ['teacher2', 'teacher3']
      };
      const mockResponse = {
        success: true,
        data: {
          id: classId,
          ...teacherData
        }
      };

      mockedRequest.mockResolvedValue(mockResponse);
      const result = await assignTeachers(classId, teacherData);

      expect(mockedRequest).toHaveBeenCalledWith({
        url: `/classes/${classId}/teachers`,
        method: 'put',
        data: teacherData
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getClassStudents', () => {
    it('should get class students with pagination', async () => {
      const classId = '1';
      const params = {
        page: 1,
        pageSize: 20,
        status: 'ACTIVE',
        keyword: '张'
      };
      const mockResponse = {
        success: true,
        data: {
          items: [
            {
              id: 'student1',
              name: '张小明',
              gender: 'MALE',
              age: 4
            }
          ],
          total: 1
        }
      };

      mockedRequest.mockResolvedValue(mockResponse);
      const result = await getClassStudents(classId, params);

      expect(mockedRequest).toHaveBeenCalledWith({
        url: `/classes/${classId}/students`,
        method: 'get',
        params
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('addStudentsToClass', () => {
    it('should add students to class', async () => {
      const classId = '1';
      const studentData = {
        studentIds: ['student1', 'student2'],
        joinDate: '2024-09-01',
        remarks: '新学期入园'
      };
      const mockResponse = {
        success: true,
        data: {
          addedCount: 2,
          failedStudents: []
        }
      };

      mockedRequest.mockResolvedValue(mockResponse);
      const result = await addStudentsToClass(classId, studentData);

      expect(mockedRequest).toHaveBeenCalledWith({
        url: `/classes/${classId}/students`,
        method: 'post',
        data: studentData
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('removeStudentFromClass', () => {
    it('should remove student from class', async () => {
      const classId = '1';
      const studentId = 'student1';
      const mockResponse = {
        success: true,
        data: { success: true }
      };

      mockedRequest.mockResolvedValue(mockResponse);
      const result = await removeStudentFromClass(classId, studentId);

      expect(mockedRequest).toHaveBeenCalledWith({
        url: `/classes/${classId}/students/${studentId}`,
        method: 'delete'
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('transferStudents', () => {
    it('should transfer students between classes', async () => {
      const classId = '1';
      const transferData = {
        studentIds: ['student1', 'student2'],
        targetClassId: '2',
        transferDate: '2024-09-15',
        reason: '班级调整'
      };
      const mockResponse = {
        success: true,
        data: {
          transferredCount: 2,
          failedStudents: []
        }
      };

      mockedRequest.mockResolvedValue(mockResponse);
      const result = await transferStudents(classId, transferData);

      expect(mockedRequest).toHaveBeenCalledWith({
        url: `/classes/${classId}/transfer`,
        method: 'post',
        data: transferData
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getClassStatistics', () => {
    it('should get class statistics', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            className: '小班一班',
            totalStudents: 30,
            attendanceRate: 95.5,
            averageAge: 4.2
          }
        ]
      };

      mockedRequest.mockResolvedValue(mockResponse);
      const result = await getClassStatistics();

      expect(mockedRequest).toHaveBeenCalledWith({
        url: '/classes/stats',
        method: 'get'
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getAvailableClassrooms', () => {
    it('should get available classrooms', async () => {
      const params = {
        date: '2024-09-01',
        timeSlot: 'morning'
      };
      const mockResponse = {
        success: true,
        data: ['教室101', '教室102', '教室103']
      };

      mockedRequest.mockResolvedValue(mockResponse);
      const result = await getAvailableClassrooms(params);

      expect(mockedRequest).toHaveBeenCalledWith({
        url: '/classes/available-classrooms',
        method: 'get',
        params
      });
      expect(result).toEqual(mockResponse);
    });

    it('should get available classrooms without parameters', async () => {
      const mockResponse = {
        success: true,
        data: []
      };

      mockedRequest.mockResolvedValue(mockResponse);
      const result = await getAvailableClassrooms();

      expect(mockedRequest).toHaveBeenCalledWith({
        url: '/classes/available-classrooms',
        method: 'get',
        params: undefined
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('exportClassData', () => {
    it('should export class data', async () => {
      const params = {
        classIds: ['1', '2'],
        includeStudents: true,
        includeAttendance: false
      };
      const mockResponse = {
        success: true,
        data: {
          fileUrl: '/api/exports/classes-20240901.xlsx'
        }
      };

      mockedRequest.mockResolvedValue(mockResponse);
      const result = await exportClassData(params);

      expect(mockedRequest).toHaveBeenCalledWith({
        url: '/classes/export',
        method: 'get',
        params,
        responseType: 'blob'
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getStudentAttendance', () => {
    it('should get student attendance records', async () => {
      const studentId = 'student1';
      const params = {
        startDate: '2024-09-01',
        endDate: '2024-09-30',
        page: 1,
        pageSize: 30
      };
      const mockResponse = {
        success: true,
        data: {
          items: [
            {
              date: '2024-09-01',
              status: 'PRESENT',
              checkInTime: '08:30'
            }
          ],
          total: 30
        }
      };

      mockedRequest.mockResolvedValue(mockResponse);
      const result = await getStudentAttendance(studentId, params);

      expect(mockedRequest).toHaveBeenCalledWith({
        url: `/attendance/students/${studentId}`,
        method: 'get',
        params
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const errorMessage = 'Network Error';
      mockedRequest.mockRejectedValue(new Error(errorMessage));

      await expect(getClassList()).rejects.toThrow(errorMessage);
    });

    it('should handle empty responses', async () => {
      mockedRequest.mockResolvedValue({ success: false, message: 'No data found' });

      const result = await getClassList();
      expect(result.success).toBe(false);
    });
  });
});