/**
 * 考勤API模块测试
 */
import { 
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

describe, it, expect, vi, beforeEach } from 'vitest';
import * as attendanceApi from '@/api/modules/attendance';
import * as attendanceCenterApi from '@/api/modules/attendance-center';

// Mock request模块
vi.mock('@/utils/request', () => ({
  request: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { request } from '@/utils/request';

describe('教师考勤API模块', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTeacherClasses', () => {
    it('应该成功获取教师负责的班级列表', async () => {
      const mockResponse = {
        success: true,
        data: [
          { id: 1, name: '小班A', studentCount: 20, kindergartenId: 1 },
          { id: 2, name: '中班B', studentCount: 25, kindergartenId: 1 },
        ],
      };

      (request.get as any).mockResolvedValue(mockResponse);

      const result = await attendanceApi.getTeacherClasses();

      expect(request.get).toHaveBeenCalledWith('/api/teacher/attendance/classes');
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });
  });

  describe('getClassStudents', () => {
    it('应该成功获取班级学生列表', async () => {
      const mockResponse = {
        success: true,
        data: [
          { id: 1, name: '张三', studentNumber: 'S001', gender: '男' },
          { id: 2, name: '李四', studentNumber: 'S002', gender: '女' },
        ],
      };

      (request.get as any).mockResolvedValue(mockResponse);

      const result = await attendanceApi.getClassStudents(1);

      expect(request.get).toHaveBeenCalledWith('/api/teacher/attendance/students/1');
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });
  });

  describe('createAttendanceRecords', () => {
    it('应该成功创建考勤记录', async () => {
      const mockResponse = {
        success: true,
        data: {
          successCount: 2,
          records: [],
        },
      };

      const requestData = {
        classId: 1,
        kindergartenId: 1,
        attendanceDate: '2025-01-09',
        records: [
          {
            studentId: 1,
            status: attendanceApi.AttendanceStatus.PRESENT,
            checkInTime: '08:00:00',
          },
          {
            studentId: 2,
            status: attendanceApi.AttendanceStatus.PRESENT,
            checkInTime: '08:05:00',
          },
        ],
      };

      (request.post as any).mockResolvedValue(mockResponse);

      const result = await attendanceApi.createAttendanceRecords(requestData);

      expect(request.post).toHaveBeenCalledWith('/api/teacher/attendance/records', requestData);
      expect(result.success).toBe(true);
      expect(result.data.successCount).toBe(2);
    });
  });

  describe('getAttendanceStatistics', () => {
    it('应该成功获取考勤统计数据', async () => {
      const mockResponse = {
        success: true,
        data: {
          totalRecords: 20,
          presentCount: 18,
          absentCount: 2,
          lateCount: 0,
          earlyLeaveCount: 0,
          sickLeaveCount: 1,
          personalLeaveCount: 1,
          attendanceRate: 90,
          abnormalTemperature: 0,
        },
      };

      (request.get as any).mockResolvedValue(mockResponse);

      const result = await attendanceApi.getAttendanceStatistics({
        classId: 1,
        startDate: '2025-01-09',
        endDate: '2025-01-09',
      });

      expect(request.get).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data.attendanceRate).toBe(90);
    });
  });
});

describe('园长考勤中心API模块', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getOverview', () => {
    it('应该成功获取全园概览', async () => {
      const mockResponse = {
        success: true,
        data: {
          date: '2025-01-09',
          totalRecords: 100,
          presentCount: 90,
          absentCount: 10,
          lateCount: 5,
          earlyLeaveCount: 2,
          sickLeaveCount: 3,
          personalLeaveCount: 7,
          attendanceRate: 90,
          abnormalTemperature: 1,
        },
      };

      (request.get as any).mockResolvedValue(mockResponse);

      const result = await attendanceCenterApi.getOverview({
        kindergartenId: 1,
        date: '2025-01-09',
      });

      expect(request.get).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data.attendanceRate).toBe(90);
    });
  });

  describe('getDailyStatistics', () => {
    it('应该成功获取日统计', async () => {
      const mockResponse = {
        success: true,
        data: {
          date: '2025-01-09',
          classes: [
            {
              classId: 1,
              className: '小班A',
              totalStudents: 20,
              presentCount: 18,
              absentCount: 2,
              lateCount: 0,
              attendanceRate: 90,
            },
          ],
        },
      };

      (request.get as any).mockResolvedValue(mockResponse);

      const result = await attendanceCenterApi.getDailyStatistics({
        kindergartenId: 1,
        date: '2025-01-09',
      });

      expect(request.get).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data.classes).toHaveLength(1);
    });
  });

  describe('getAllRecords', () => {
    it('应该成功获取所有考勤记录', async () => {
      const mockResponse = {
        success: true,
        data: {
          rows: [
            {
              id: 1,
              studentId: 1,
              studentName: '张三',
              classId: 1,
              className: '小班A',
              attendanceDate: '2025-01-09',
              status: 'PRESENT',
              checkInTime: '08:00:00',
            },
          ],
          count: 1,
        },
      };

      (request.get as any).mockResolvedValue(mockResponse);

      const result = await attendanceCenterApi.getAllRecords({
        kindergartenId: 1,
        startDate: '2025-01-09',
        endDate: '2025-01-09',
        page: 1,
        pageSize: 20,
      });

      expect(request.get).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data.rows).toHaveLength(1);
    });
  });

  describe('updateRecord', () => {
    it('应该成功更新考勤记录', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 1,
          status: 'LATE',
        },
      };

      (request.put as any).mockResolvedValue(mockResponse);

      const result = await attendanceCenterApi.updateRecord(1, {
        status: attendanceApi.AttendanceStatus.LATE,
        changeReason: '修正错误',
      });

      expect(request.put).toHaveBeenCalledWith('/api/attendance-center/records/1', {
        status: attendanceApi.AttendanceStatus.LATE,
        changeReason: '修正错误',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('deleteRecord', () => {
    it('应该成功删除考勤记录', async () => {
      const mockResponse = {
        success: true,
        data: undefined,
      };

      (request.delete as any).mockResolvedValue(mockResponse);

      const result = await attendanceCenterApi.deleteRecord(1);

      expect(request.delete).toHaveBeenCalledWith('/api/attendance-center/records/1');
      expect(result.success).toBe(true);
    });
  });

  describe('getAbnormalAnalysis', () => {
    it('应该成功获取异常考勤分析', async () => {
      const mockResponse = {
        success: true,
        data: {
          consecutiveAbsent: [
            {
              studentId: 1,
              studentName: '张三',
              className: '小班A',
              consecutiveDays: 3,
              lastAbsentDate: '2025-01-09',
            },
          ],
          frequentLate: [],
          frequentEarlyLeave: [],
        },
      };

      (request.get as any).mockResolvedValue(mockResponse);

      const result = await attendanceCenterApi.getAbnormalAnalysis({
        kindergartenId: 1,
      });

      expect(request.get).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data.consecutiveAbsent).toHaveLength(1);
    });
  });
});

