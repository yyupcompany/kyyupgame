import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import type { ApiResponse } from '@/utils/request';
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';
import {
  validateRequiredFields,
  validateFieldTypes
} from '../../../utils/data-validation';

// Mock dependencies
vi.mock('@/utils/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn()
  },
  request: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn()
  },
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn()
}));

vi.mock('@/api/endpoints', () => ({
  ATTENDANCE_ENDPOINTS: {
    STUDENT: (id: string | number) => `/attendance/student/${id}`,
    CLASS: (id: string | number) => `/attendance/class/${id}`,
    RECORD: '/attendance/record',
    UPDATE: (id: string | number) => `/attendance/${id}`,
    STATISTICS: '/attendance/statistics'
  }
}));

// Import after mocks
import * as attendanceApi from '@/api/modules/attendance';
import { request as mockedRequest } from '@/utils/request';

// 控制台错误检测变量
let consoleSpy: any

describe('Attendance API', () => {
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

  describe('getStudentAttendance', () => {
    it('should get student attendance with date range parameters', async () => {
      const studentId = '123';
      const mockParams = {
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      };
      const mockResponse: ApiResponse = {
        success: true,
        data: [
          {
            id: 1,
            studentId: '123',
            date: '2024-01-01',
            status: 'present',
            checkInTime: '08:30:00',
            checkOutTime: '16:30:00'
          },
          {
            id: 2,
            studentId: '123',
            date: '2024-01-02',
            status: 'absent',
            reason: 'sick'
          }
        ]
      };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await attendanceApi.getStudentAttendance(studentId, mockParams);

      // 验证API调用
      expect(mockedRequest.get).toHaveBeenCalledWith('/attendance/student/123', mockParams);

      // 验证响应结构
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);

      // 验证列表项
      if (result.data.length > 0) {
        const itemValidation = validateRequiredFields(result.data[0], ['id', 'studentId', 'date', 'status']);
        expect(itemValidation.valid).toBe(true);

        const itemTypeValidation = validateFieldTypes(result.data[0], {
          id: 'number',
          studentId: 'string',
          date: 'string',
          status: 'string'
        });
        expect(itemTypeValidation.valid).toBe(true);
      }
    });

    it('should get student attendance without parameters', async () => {
      const studentId = 123;
      const mockResponse: ApiResponse = {
        success: true,
        data: []
      };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await attendanceApi.getStudentAttendance(studentId);

      expect(mockedRequest.get).toHaveBeenCalledWith('/attendance/student/123', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should handle different student ID types', async () => {
      const stringId = '123';
      const numberId = 123;
      const mockResponse: ApiResponse = { success: true, data: [] };

      mockedRequest.get.mockResolvedValue(mockResponse);

      await attendanceApi.getStudentAttendance(stringId);
      expect(mockedRequest.get).toHaveBeenCalledWith('/attendance/student/123', undefined);

      await attendanceApi.getStudentAttendance(numberId);
      expect(mockedRequest.get).toHaveBeenCalledWith('/attendance/student/123', undefined);
    });
  });

  describe('getClassAttendance', () => {
    it('should get class attendance with date and status parameters', async () => {
      const classId = 'class-123';
      const mockParams = {
        date: '2024-01-01',
        status: 'present'
      };
      const mockResponse: ApiResponse = {
        success: true,
        data: [
          {
            id: 1,
            classId: 'class-123',
            studentId: 'student-1',
            studentName: 'John Doe',
            date: '2024-01-01',
            status: 'present'
          },
          {
            id: 2,
            classId: 'class-123',
            studentId: 'student-2',
            studentName: 'Jane Smith',
            date: '2024-01-01',
            status: 'late'
          }
        ]
      };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await attendanceApi.getClassAttendance(classId, mockParams);

      expect(mockedRequest.get).toHaveBeenCalledWith('/attendance/class/class-123', mockParams);
      expect(result).toEqual(mockResponse);
    });

    it('should get class attendance without parameters', async () => {
      const classId = 123;
      const mockResponse: ApiResponse = {
        success: true,
        data: []
      };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await attendanceApi.getClassAttendance(classId);

      expect(mockedRequest.get).toHaveBeenCalledWith('/attendance/class/123', undefined);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createAttendanceRecord', () => {
    it('should create attendance record with complete data', async () => {
      const mockData = {
        studentId: 'student-123',
        classId: 'class-123',
        date: '2024-01-01',
        status: 'present',
        checkInTime: '08:30:00',
        checkOutTime: '16:30:00',
        notes: 'On time'
      };
      const mockResponse: ApiResponse = {
        success: true,
        data: {
          id: 1,
          ...mockData,
          createdAt: '2024-01-01T08:30:00Z',
          updatedAt: '2024-01-01T08:30:00Z'
        }
      };

      mockedRequest.post.mockResolvedValue(mockResponse);

      const result = await attendanceApi.createAttendanceRecord(mockData);

      expect(mockedRequest.post).toHaveBeenCalledWith('/attendance/record', mockData);
      expect(result).toEqual(mockResponse);
    });

    it('should create attendance record with minimal data', async () => {
      const mockData = {
        studentId: 'student-123',
        classId: 'class-123',
        date: '2024-01-01',
        status: 'present'
      };
      const mockResponse: ApiResponse = {
        success: true,
        data: { id: 1, ...mockData }
      };

      mockedRequest.post.mockResolvedValue(mockResponse);

      const result = await attendanceApi.createAttendanceRecord(mockData);

      expect(mockedRequest.post).toHaveBeenCalledWith('/attendance/record', mockData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateAttendanceRecord', () => {
    it('should update attendance record with partial data', async () => {
      const attendanceId = 1;
      const mockData = {
        status: 'late',
        checkInTime: '09:00:00',
        notes: 'Arrived late'
      };
      const mockResponse: ApiResponse = {
        success: true,
        data: {
          id: 1,
          studentId: 'student-123',
          classId: 'class-123',
          date: '2024-01-01',
          status: 'late',
          checkInTime: '09:00:00',
          notes: 'Arrived late',
          updatedAt: '2024-01-01T09:00:00Z'
        }
      };

      mockedRequest.put.mockResolvedValue(mockResponse);

      const result = await attendanceApi.updateAttendanceRecord(attendanceId, mockData);

      expect(mockedRequest.put).toHaveBeenCalledWith('/attendance/1', mockData);
      expect(result).toEqual(mockResponse);
    });

    it('should update attendance record with different ID types', async () => {
      const mockData = { status: 'present' };
      const mockResponse: ApiResponse = { success: true, data: {} };

      mockedRequest.put.mockResolvedValue(mockResponse);

      await attendanceApi.updateAttendanceRecord('1', mockData);
      expect(mockedRequest.put).toHaveBeenCalledWith('/attendance/1', mockData);

      await attendanceApi.updateAttendanceRecord(1, mockData);
      expect(mockedRequest.put).toHaveBeenCalledWith('/attendance/1', mockData);
    });
  });

  describe('getAttendanceStatistics', () => {
    it('should get attendance statistics with all parameters', async () => {
      const mockParams = {
        classId: 'class-123',
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      };
      const mockResponse: ApiResponse = {
        success: true,
        data: {
          totalStudents: 25,
          presentDays: 120,
          absentDays: 5,
          lateDays: 3,
          attendanceRate: 95.2,
          classBreakdown: [
            {
              classId: 'class-123',
              className: 'Preschool A',
              attendanceRate: 96.0
            }
          ]
        }
      };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await attendanceApi.getAttendanceStatistics(mockParams);

      expect(mockedRequest.get).toHaveBeenCalledWith('/attendance/statistics', mockParams);
      expect(result).toEqual(mockResponse);
    });

    it('should get attendance statistics without parameters', async () => {
      const mockResponse: ApiResponse = {
        success: true,
        data: {
          totalStudents: 100,
          presentDays: 480,
          absentDays: 20,
          lateDays: 10,
          attendanceRate: 94.0
        }
      };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await attendanceApi.getAttendanceStatistics();

      expect(mockedRequest.get).toHaveBeenCalledWith('/attendance/statistics', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should get attendance statistics with single parameter', async () => {
      const mockParams = { classId: 'class-123' };
      const mockResponse: ApiResponse = { success: true, data: {} };

      mockedRequest.get.mockResolvedValue(mockResponse);

      await attendanceApi.getAttendanceStatistics(mockParams);

      expect(mockedRequest.get).toHaveBeenCalledWith('/attendance/statistics', mockParams);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const mockError = new Error('Network error');
      mockedRequest.get.mockRejectedValue(mockError);

      await expect(attendanceApi.getStudentAttendance('123'))
        .rejects.toThrow('Network error');
    });

    it('should handle API response errors', async () => {
      const mockErrorResponse: ApiResponse = {
        success: false,
        data: null,
        message: 'Student not found'
      };

      mockedRequest.get.mockResolvedValue(mockErrorResponse);

      const result = await attendanceApi.getStudentAttendance('invalid-id');
      expect(result.success).toBe(false);
    });

    it('should handle validation errors', async () => {
      const mockData = {
        studentId: '',
        classId: 'class-123',
        date: 'invalid-date',
        status: 'invalid-status'
      };
      const mockErrorResponse: ApiResponse = {
        success: false,
        data: null,
        message: 'Invalid attendance data'
      };

      mockedRequest.post.mockResolvedValue(mockErrorResponse);

      const result = await attendanceApi.createAttendanceRecord(mockData);
      expect(result.success).toBe(false);
    });
  });

  describe('Data Validation', () => {
    it('should handle empty attendance data', async () => {
      const mockResponse: ApiResponse = {
        success: true,
        data: []
      };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await attendanceApi.getStudentAttendance('123');
      expect(result.data).toEqual([]);
    });

    it('should handle malformed attendance records', async () => {
      const mockResponse: ApiResponse = {
        success: true,
        data: [
          {
            // Missing required fields
            id: 1,
            studentId: 'student-123'
            // Missing other required fields
          }
        ]
      };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await attendanceApi.getStudentAttendance('123');
      expect(result.data).toBeDefined();
      expect(result.data[0].id).toBe(1);
    });

    it('should handle different attendance status values', async () => {
      const validStatuses = ['present', 'absent', 'late', 'early_leave'];
      const mockResponse: ApiResponse = {
        success: true,
        data: validStatuses.map((status, index) => ({
          id: index + 1,
          studentId: `student-${index + 1}`,
          status
        }))
      };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await attendanceApi.getStudentAttendance('123');
      expect(result.data).toHaveLength(validStatuses.length);
      result.data.forEach((record, index) => {
        expect(record.status).toBe(validStatuses[index]);
      });
    });
  });

  describe('Parameter Validation', () => {
    it('should handle invalid date formats', async () => {
      const mockParams = {
        startDate: 'invalid-date',
        endDate: '2024-13-32'
      };
      const mockResponse: ApiResponse = { success: true, data: [] };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await attendanceApi.getStudentAttendance('123', mockParams);
      expect(result.data).toEqual([]);
    });

    it('should handle empty IDs', async () => {
      const mockResponse: ApiResponse = { success: true, data: [] };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await attendanceApi.getStudentAttendance('');
      expect(result.data).toEqual([]);
    });

    it('should handle special characters in IDs', async () => {
      const specialId = 'student-123@#$%';
      const mockResponse: ApiResponse = { success: true, data: [] };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await attendanceApi.getStudentAttendance(specialId);
      expect(result.data).toEqual([]);
    });
  });

  describe('API Response Structure', () => {
    it('should handle different response structures', async () => {
      const differentResponses = [
        { success: true, data: [] },
        { success: true, data: null },
        { success: true, data: {} },
        { success: false, message: 'Error' },
        { data: [] }, // Missing success field
        {} // Empty response
      ];

      for (const response of differentResponses) {
        mockedRequest.get.mockResolvedValue(response);

        const result = await attendanceApi.getStudentAttendance('123');
        expect(result).toBeDefined();
      }
    });

    it('should handle nested data structures', async () => {
      const mockResponse: ApiResponse = {
        success: true,
        data: {
          attendance: [
            { id: 1, status: 'present' },
            { id: 2, status: 'absent' }
          ],
          summary: {
            total: 2,
            present: 1,
            absent: 1
          }
        }
      };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await attendanceApi.getStudentAttendance('123');
      expect(result.data).toBeDefined();
      expect(result.data.attendance).toBeDefined();
      expect(result.data.summary).toBeDefined();
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle large datasets', async () => {
      const largeDataSet = Array.from({ length: 1000 }, (_, index) => ({
        id: index + 1,
        studentId: `student-${index + 1}`,
        date: '2024-01-01',
        status: 'present'
      }));

      const mockResponse: ApiResponse = {
        success: true,
        data: largeDataSet
      };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await attendanceApi.getStudentAttendance('123');
      expect(result.data).toHaveLength(1000);
    });

    it('should handle concurrent API calls', async () => {
      const mockResponse: ApiResponse = { success: true, data: [] };
      mockedRequest.get.mockResolvedValue(mockResponse);

      const promises = [
        attendanceApi.getStudentAttendance('123'),
        attendanceApi.getClassAttendance('class-123'),
        attendanceApi.getAttendanceStatistics()
      ];

      const results = await Promise.all(promises);
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });

    it('should handle rate limiting scenarios', async () => {
      const mockError = new Error('Rate limit exceeded');
      mockedRequest.get.mockRejectedValue(mockError);

      await expect(attendanceApi.getStudentAttendance('123'))
        .rejects.toThrow('Rate limit exceeded');
    });
  });
});