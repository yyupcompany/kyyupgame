/**
 * 考勤中心API单元测试
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { vi } from 'vitest'
import axios from 'axios';
import {
  getOverview,
  getDailyStatistics,
  getWeeklyStatistics,
  getMonthlyStatistics,
  getQuarterlyStatistics,
  getYearlyStatistics,
  getStatisticsByClass,
  getStatisticsByAge,
  getAllRecords,
  updateRecord,
  deleteRecord,
  resetRecord,
  getAbnormalAnalysis,
  getHealthMonitoring,
  exportAttendance,
  importAttendance,
} from '@/api/modules/attendance-center';

// Mock axios
vi.mock('axios');

// 控制台错误检测变量
let consoleSpy: any

describe('考勤中心API测试', () => {
  let mockAxios: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios = axios as any;
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    vi.restoreAllMocks();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('概览数据API', () => {
    it('应该成功获取全园概览数据', async () => {
      // Arrange
      const mockData = {
        success: true,
        data: {
          date: '2025-01-15',
          totalRecords: 150,
          presentCount: 140,
          absentCount: 10,
          lateCount: 5,
          earlyLeaveCount: 2,
          sickLeaveCount: 3,
          personalLeaveCount: 4,
          attendanceRate: 93.3,
          abnormalTemperature: 0,
        },
      };

      mockAxios.get.mockResolvedValue(mockData);

      // Act
      const result = await getOverview({
        kindergartenId: 1,
        date: '2025-01-15',
      });

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/attendance-center/overview', {
        params: { kindergartenId: 1, date: '2025-01-15' },
      });
      expect(result).toEqual(mockData);
      expect(result.data).toBeDefined();
      expect(typeof result.data.totalRecords).toBe('number');
      expect(typeof result.data.attendanceRate).toBe('number');
    });

    it('应该处理API错误', async () => {
      // Arrange
      const error = new Error('Network error');
      mockAxios.get.mockRejectedValue(error);

      // Act & Assert
      await expect(
        getOverview({ kindergartenId: 1, date: '2025-01-15' })
      ).rejects.toThrow('Network error');
    });
  });

  describe('统计分析API', () => {
    it('应该成功获取日统计数据', async () => {
      // Arrange
      const mockData = {
        success: true,
        data: {
          date: '2025-01-15',
          classes: [
            {
              classId: 1,
              className: '小一班',
              totalStudents: 25,
              presentCount: 23,
              absentCount: 2,
              attendanceRate: 92,
            },
          ],
        },
      };

      mockAxios.get.mockResolvedValue(mockData);

      // Act
      const result = await getDailyStatistics({
        kindergartenId: 1,
        date: '2025-01-15',
      });

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/api/attendance-center/statistics/daily',
        { params: { kindergartenId: 1, date: '2025-01-15' } }
      );
      expect(result.data.classes).toBeInstanceOf(Array);
      if (result.data.classes.length > 0) {
        const firstClass = result.data.classes[0];
        expect(firstClass).toHaveProperty('classId');
        expect(firstClass).toHaveProperty('className');
        expect(firstClass).toHaveProperty('totalStudents');
        expect(firstClass).toHaveProperty('presentCount');
        expect(firstClass).toHaveProperty('absentCount');
        expect(firstClass).toHaveProperty('attendanceRate');
      }
    });

    it('应该成功获取周统计数据', async () => {
      // Arrange
      const mockData = {
        success: true,
        data: {
          startDate: '2025-01-13',
          endDate: '2025-01-19',
          dailyData: [
            {
              date: '2025-01-13',
              totalRecords: 150,
              presentCount: 145,
              absentCount: 5,
              attendanceRate: 96.7,
            },
          ],
        },
      };

      mockAxios.get.mockResolvedValue(mockData);

      // Act
      const result = await getWeeklyStatistics({
        kindergartenId: 1,
        startDate: '2025-01-13',
        endDate: '2025-01-19',
      });

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/api/attendance-center/statistics/weekly',
        {
          params: {
            kindergartenId: 1,
            startDate: '2025-01-13',
            endDate: '2025-01-19',
          },
        }
      );
      expect(result.data.dailyData).toBeInstanceOf(Array);
    });

    it('应该成功获取月统计数据', async () => {
      // Arrange
      const mockData = {
        success: true,
        data: {
          year: 2025,
          month: 1,
          dailyData: [],
          totalAttendanceRate: 95.2,
        },
      };

      mockAxios.get.mockResolvedValue(mockData);

      // Act
      const result = await getMonthlyStatistics({
        kindergartenId: 1,
        year: 2025,
        month: 1,
      });

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/api/attendance-center/statistics/monthly',
        { params: { kindergartenId: 1, year: 2025, month: 1 } }
      );
      expect(typeof result.data.totalAttendanceRate).toBe('number');
    });

    it('应该成功获取季度统计数据', async () => {
      // Arrange
      const mockData = {
        success: true,
        data: {
          year: 2025,
          quarter: 1,
          monthlyData: [],
        },
      };

      mockAxios.get.mockResolvedValue(mockData);

      // Act
      const result = await getQuarterlyStatistics({
        kindergartenId: 1,
        year: 2025,
        quarter: 1,
      });

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/api/attendance-center/statistics/quarterly',
        { params: { kindergartenId: 1, year: 2025, quarter: 1 } }
      );
    });

    it('应该成功获取年度统计数据', async () => {
      // Arrange
      const mockData = {
        success: true,
        data: {
          year: 2025,
          monthlyData: [],
        },
      };

      mockAxios.get.mockResolvedValue(mockData);

      // Act
      const result = await getYearlyStatistics({
        kindergartenId: 1,
        year: 2025,
      });

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/api/attendance-center/statistics/yearly',
        { params: { kindergartenId: 1, year: 2025 } }
      );
    });

    it('应该成功获取按班级统计数据', async () => {
      // Arrange
      const mockData = {
        success: true,
        data: [
          {
            classId: 1,
            className: '小一班',
            totalRecords: 500,
            presentCount: 470,
            absentCount: 30,
            lateCount: 15,
            earlyLeaveCount: 8,
            sickLeaveCount: 10,
            personalLeaveCount: 12,
            attendanceRate: 94,
          },
        ],
      };

      mockAxios.get.mockResolvedValue(mockData);

      // Act
      const result = await getStatisticsByClass({
        kindergartenId: 1,
        startDate: '2025-01-01',
        endDate: '2025-01-31',
      });

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/api/attendance-center/statistics/by-class',
        {
          params: {
            kindergartenId: 1,
            startDate: '2025-01-01',
            endDate: '2025-01-31',
          },
        }
      );
      expect(result.data).toBeInstanceOf(Array);
      if (result.data.length > 0) {
        const firstClass = result.data[0];
        validateRequiredFields(firstClass, [
          'classId', 'className', 'totalRecords', 'presentCount',
          'absentCount', 'attendanceRate'
        ]);
        validateFieldTypes(firstClass, {
          classId: 'number',
          className: 'string',
          totalRecords: 'number',
          presentCount: 'number',
          absentCount: 'number',
          attendanceRate: 'number'
        });
      }
    });

    it('应该成功获取按年龄段统计数据', async () => {
      // Arrange
      const mockData = {
        success: true,
        data: [
          {
            ageGroup: '3-4岁',
            totalRecords: 100,
            presentCount: 95,
            absentCount: 5,
            attendanceRate: 95,
          },
        ],
      };

      mockAxios.get.mockResolvedValue(mockData);

      // Act
      const result = await getStatisticsByAge({
        kindergartenId: 1,
        startDate: '2025-01-01',
        endDate: '2025-01-31',
      });

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/api/attendance-center/statistics/by-age',
        {
          params: {
            kindergartenId: 1,
            startDate: '2025-01-01',
            endDate: '2025-01-31',
          },
        }
      );
      expect(result.data).toBeInstanceOf(Array);
    });
  });

  describe('记录管理API', () => {
    it('应该成功获取所有考勤记录', async () => {
      // Arrange
      const mockData = {
        success: true,
        data: {
          rows: [
            {
              id: 1,
              studentId: 1,
              studentName: '张三',
              className: '小一班',
              date: '2025-01-15',
              status: 'present',
              checkInTime: '08:30',
              checkOutTime: '16:30',
            },
          ],
          count: 1,
        },
      };

      mockAxios.get.mockResolvedValue(mockData);

      // Act
      const result = await getAllRecords({
        kindergartenId: 1,
        page: 1,
        pageSize: 10,
      });

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/api/attendance-center/records',
        {
          params: {
            kindergartenId: 1,
            page: 1,
            pageSize: 10,
          },
        }
      );
      expect(result.data.rows).toBeInstanceOf(Array);
      expect(typeof result.data.count).toBe('number');
    });

    it('应该成功更新考勤记录', async () => {
      // Arrange
      const mockData = {
        success: true,
        data: {
          id: 1,
          status: 'present',
          checkInTime: '08:30',
          checkOutTime: '16:30',
          notes: '正常',
        },
      };

      mockAxios.put.mockResolvedValue(mockData);

      const updateData = {
        status: 'present',
        checkInTime: '08:30',
        checkOutTime: '16:30',
        notes: '正常',
      };

      // Act
      const result = await updateRecord(1, updateData);

      // Assert
      expect(mockAxios.put).toHaveBeenCalledWith(
        '/api/attendance-center/records/1',
        updateData
      );
      expect(result.data).toBeDefined();
    });

    it('应该成功删除考勤记录', async () => {
      // Arrange
      const mockData = {
        success: true,
        data: null,
      };

      mockAxios.delete.mockResolvedValue(mockData);

      // Act
      const result = await deleteRecord(1);

      // Assert
      expect(mockAxios.delete).toHaveBeenCalledWith(
        '/api/attendance-center/records/1'
      );
      expect(result.success).toBe(true);
    });

    it('应该成功重置考勤记录', async () => {
      // Arrange
      const mockData = {
        success: true,
        data: {
          id: 1,
          status: 'unknown',
          changeReason: '重置为未知状态',
        },
      };

      mockAxios.post.mockResolvedValue(mockData);

      const resetData = {
        id: 1,
        changeReason: '重置为未知状态',
      };

      // Act
      const result = await resetRecord(resetData);

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/api/attendance-center/records/reset',
        resetData
      );
      expect(result.success).toBe(true);
    });
  });

  describe('异常分析API', () => {
    it('应该成功获取异常考勤分析', async () => {
      // Arrange
      const mockData = {
        success: true,
        data: {
          consecutiveAbsent: [
            {
              studentId: 1,
              studentName: '张三',
              className: '小一班',
              consecutiveDays: 3,
              lastAbsentDate: '2025-01-15',
            },
          ],
          frequentLate: [
            {
              studentId: 2,
              studentName: '李四',
              className: '小二班',
              lateCount: 5,
              lateDates: ['2025-01-10', '2025-01-11', '2025-01-12', '2025-01-14', '2025-01-15'],
            },
          ],
          frequentEarlyLeave: [],
        },
      };

      mockAxios.get.mockResolvedValue(mockData);

      // Act
      const result = await getAbnormalAnalysis({
        kindergartenId: 1,
        startDate: '2025-01-01',
        endDate: '2025-01-31',
      });

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/api/attendance-center/abnormal',
        {
          params: {
            kindergartenId: 1,
            startDate: '2025-01-01',
            endDate: '2025-01-31',
          },
        }
      );
      expect(result.data).toHaveProperty('consecutiveAbsent');
      expect(result.data).toHaveProperty('frequentLate');
      expect(result.data).toHaveProperty('frequentEarlyLeave');
    });

    it('应该成功获取健康监测数据', async () => {
      // Arrange
      const mockData = {
        success: true,
        data: {
          abnormalTemperature: [
            {
              studentId: 1,
              studentName: '张三',
              className: '小一班',
              temperature: 37.5,
              date: '2025-01-15',
            },
          ],
          sickLeaveStats: [
            {
              studentId: 2,
              studentName: '李四',
              className: '小二班',
              sickLeaveDays: 3,
              lastSickLeaveDate: '2025-01-14',
            },
          ],
        },
      };

      mockAxios.get.mockResolvedValue(mockData);

      // Act
      const result = await getHealthMonitoring({
        kindergartenId: 1,
        startDate: '2025-01-01',
        endDate: '2025-01-31',
      });

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/api/attendance-center/health',
        {
          params: {
            kindergartenId: 1,
            startDate: '2025-01-01',
            endDate: '2025-01-31',
          },
        }
      );
      expect(result.data).toHaveProperty('abnormalTemperature');
      expect(result.data).toHaveProperty('sickLeaveStats');
    });
  });

  describe('导入导出API', () => {
    it('应该成功导出考勤报表', async () => {
      // Arrange
      const mockData = {
        success: true,
        data: {
          url: 'http://localhost:3000/exports/attendance_20250115.xlsx',
          filename: 'attendance_20250115.xlsx',
        },
      };

      mockAxios.post.mockResolvedValue(mockData);

      const exportData = {
        kindergartenId: 1,
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        format: 'excel',
      };

      // Act
      const result = await exportAttendance(exportData);

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/api/attendance-center/export',
        exportData
      );
      expect(result.data).toHaveProperty('url');
      expect(result.data).toHaveProperty('filename');
    });

    it('应该成功批量导入考勤记录', async () => {
      // Arrange
      const mockData = {
        success: true,
        data: {
          successCount: 10,
          failureCount: 0,
          errors: [],
        },
      };

      mockAxios.post.mockResolvedValue(mockData);

      const importData = {
        records: [
          {
            studentId: 1,
            classId: 1,
            kindergartenId: 1,
            attendanceDate: '2025-01-15',
            status: 'present',
            checkInTime: '08:30',
            checkOutTime: '16:30',
          },
        ],
      };

      // Act
      const result = await importAttendance(importData);

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/api/attendance-center/import',
        importData
      );
      expect(result.data.successCount).toBeGreaterThan(0);
      expect(Array.isArray(result.data.errors)).toBe(true);
    });
  });

  describe('数据验证', () => {
    it('应该验证概览数据的字段类型', async () => {
      // Arrange
      const mockData = {
        success: true,
        data: {
          date: '2025-01-15',
          totalRecords: 150,
          presentCount: 140,
          absentCount: 10,
          lateCount: 5,
          earlyLeaveCount: 2,
          sickLeaveCount: 3,
          personalLeaveCount: 4,
          attendanceRate: 93.3,
          abnormalTemperature: 0,
        },
      };

      mockAxios.get.mockResolvedValue(mockData);

      // Act
      const result = await getOverview({
        kindergartenId: 1,
        date: '2025-01-15',
      });

      // Assert
      const overview = result.data;
      validateRequiredFields(overview, [
        'date', 'totalRecords', 'presentCount', 'absentCount',
        'lateCount', 'earlyLeaveCount', 'sickLeaveCount',
        'personalLeaveCount', 'attendanceRate', 'abnormalTemperature'
      ]);

      validateFieldTypes(overview, {
        date: 'string',
        totalRecords: 'number',
        presentCount: 'number',
        absentCount: 'number',
        lateCount: 'number',
        earlyLeaveCount: 'number',
        sickLeaveCount: 'number',
        personalLeaveCount: 'number',
        attendanceRate: 'number',
        abnormalTemperature: 'number'
      });

      // 业务逻辑验证
      expect(overview.totalRecords).toBe(overview.presentCount + overview.absentCount);
      expect(overview.attendanceRate).toBeGreaterThanOrEqual(0);
      expect(overview.attendanceRate).toBeLessThanOrEqual(100);
    });

    it('应该验证统计数据的一致性', async () => {
      // Arrange
      const mockData = {
        success: true,
        data: [
          {
            classId: 1,
            className: '小一班',
            totalRecords: 25,
            presentCount: 23,
            absentCount: 2,
            attendanceRate: 92,
          },
        ],
      };

      mockAxios.get.mockResolvedValue(mockData);

      // Act
      const result = await getStatisticsByClass({
        kindergartenId: 1,
        startDate: '2025-01-01',
        endDate: '2025-01-31',
      });

      // Assert
      if (result.data.length > 0) {
        const classStat = result.data[0];

        // 验证数据一致性
        expect(classStat.totalRecords).toBe(classStat.presentCount + classStat.absentCount);

        // 验证出勤率计算正确性
        const expectedRate = Math.round((classStat.presentCount / classStat.totalRecords) * 100);
        expect(classStat.attendanceRate).toBe(expectedRate);
      }
    });
  });
});

/**
 * 验证必填字段
 */
function validateRequiredFields(obj: any, requiredFields: string[]): void {
  requiredFields.forEach(field => {
    expect(obj).toHaveProperty(field);
    expect(obj[field]).not.toBeNull();
    expect(obj[field]).not.toBeUndefined();
  });
}

/**
 * 验证字段类型
 */
function validateFieldTypes(obj: any, fieldTypes: Record<string, string>): void {
  Object.entries(fieldTypes).forEach(([field, expectedType]) => {
    expect(typeof obj[field]).toBe(expectedType);
  });
}