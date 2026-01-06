import { Request, Response } from 'express';
import { AttendanceService } from '../services/attendance/attendance.service';
import { AttendanceStatus } from '../models';
import { ApiError } from '../utils/apiError';
import { Op, QueryTypes } from 'sequelize';
import { sequelize } from '../init';

/**
 * 考勤中心控制器（园长/管理员）
 * 处理园长端考勤相关的HTTP请求
 */
export class AttendanceCenterController {
  private static attendanceService = new AttendanceService();

  /**
   * 获取全园概览
   * GET /api/attendance-center/overview
   */
  public static async getOverview(req: Request, res: Response) {
    try {
      const { kindergartenId, date } = req.query;

      console.log('[考勤中心] 概览请求:', {
        kindergartenId,
        date,
        query: req.query
      });

      if (!kindergartenId) {
        console.warn('[考勤中心] 缺少 kindergartenId 参数');
        return res.status(400).json({
          success: false,
          message: '幼儿园ID不能为空',
        });
      }

      const targetDate = date ? (date as string) : new Date().toISOString().split('T')[0];

      console.log('[考勤中心] 查询参数:', {
        kindergartenId: parseInt(kindergartenId as string),
        targetDate
      });

      // 直接使用原生SQL查询避免模型关联问题
      const records = await sequelize.query(`
        SELECT * FROM attendances
        WHERE kindergarten_id = :kindergartenId
        AND attendance_date = :targetDate
      `, {
        replacements: { kindergartenId: parseInt(kindergartenId as string), targetDate },
        type: QueryTypes.SELECT
      }) as any[];

      console.log('[考勤中心] 查询结果:', {
        recordCount: records.length,
        sampleRecord: records.length > 0 ? records[0] : null
      });

      // 统计各状态数量
      const totalRecords = records.length;
      const presentCount = records.filter((r: any) => r.status === 'present').length;
      const absentCount = records.filter((r: any) => r.status === 'absent').length;
      const lateCount = records.filter((r: any) => r.status === 'late').length;
      const earlyLeaveCount = records.filter((r: any) => r.status === 'early_leave').length;
      const sickLeaveCount = records.filter((r: any) => r.status === 'sick_leave').length;
      const personalLeaveCount = records.filter((r: any) => r.status === 'personal_leave').length;

      // 计算出勤率
      const attendanceRate = totalRecords > 0 ? ((presentCount / totalRecords) * 100).toFixed(2) : '0.00';

      // 获取异常体温记录
      const abnormalTemperature = records.filter(
        (r: any) => r.temperature && parseFloat(r.temperature) >= 37.3
      ).length;

      const responseData = {
        date: targetDate,
        totalRecords,
        presentCount,
        absentCount,
        lateCount,
        earlyLeaveCount,
        sickLeaveCount,
        personalLeaveCount,
        attendanceRate: parseFloat(attendanceRate),
        abnormalTemperature,
      };

      console.log('[考勤中心] 返回数据:', responseData);

      res.json({
        success: true,
        data: responseData,
      });
    } catch (error) {
      console.error('[考勤中心] 获取全园概览失败:', error);
      res.status(500).json({
        success: false,
        message: '获取全园概览失败',
        error: error instanceof Error ? error.message : '未知错误',
      });
    }
  }

  /**
   * 获取日统计
   * GET /api/attendance-center/statistics/daily
   */
  public static async getDailyStatistics(req: Request, res: Response) {
    try {
      const { kindergartenId, date } = req.query;

      if (!kindergartenId) {
        return res.status(400).json({
          success: false,
          message: '幼儿园ID不能为空',
        });
      }

      const targetDate = date ? (date as string) : new Date().toISOString().split('T')[0];

      const result = await AttendanceCenterController.attendanceService.queryAttendances({
        kindergartenId: parseInt(kindergartenId as string),
        startDate: targetDate,
        endDate: targetDate,
        page: 1,
        pageSize: 10000,
      });

      // 按班级统计
      const classStat: any = {};
      if (result.rows && result.rows.length > 0) {
        result.rows.forEach((record) => {
          const classId = record.classId;
          if (!classStat[classId]) {
            classStat[classId] = {
              classId,
              className: record.class?.name || '未知班级',
              total: 0,
              present: 0,
              absent: 0,
              late: 0,
              leave: 0,
            };
          }
          classStat[classId].total++;
          if (record.status === AttendanceStatus.PRESENT) classStat[classId].present++;
          if (record.status === AttendanceStatus.ABSENT) classStat[classId].absent++;
          if (record.status === AttendanceStatus.LATE) classStat[classId].late++;
          if (
            record.status === AttendanceStatus.SICK_LEAVE ||
            record.status === AttendanceStatus.PERSONAL_LEAVE
          ) {
            classStat[classId].leave++;
          }
        });
      }

      // 🔧 修复：转换为前端期望的数据格式
      const classes = Object.values(classStat).map((stat: any) => ({
        date: targetDate,
        classId: stat.classId,
        className: stat.className,
        totalRecords: stat.total,
        presentCount: stat.present,
        absentCount: stat.absent,
        lateCount: stat.late,
        earlyLeaveCount: 0, // 需要从数据中计算
        sickLeaveCount: 0, // 需要从数据中细分
        personalLeaveCount: stat.leave,
        attendanceRate: parseFloat(stat.total > 0 ? ((stat.present / stat.total) * 100).toFixed(2) : '0.00'),
      }));

      res.json({
        success: true,
        data: {
          date: targetDate,
          classes,
        },
      });
    } catch (error) {
      console.error('获取日统计失败:', error);
      res.status(500).json({
        success: false,
        message: '获取日统计失败',
        error: error instanceof Error ? error.message : '未知错误',
      });
    }
  }

  /**
   * 获取周统计
   * GET /api/attendance-center/statistics/weekly
   */
  public static async getWeeklyStatistics(req: Request, res: Response) {
    try {
      const { kindergartenId, startDate, endDate } = req.query;

      if (!kindergartenId) {
        return res.status(400).json({
          success: false,
          message: '幼儿园ID不能为空',
        });
      }

      const result = await AttendanceCenterController.attendanceService.queryAttendances({
        kindergartenId: parseInt(kindergartenId as string),
        startDate: startDate as string,
        endDate: endDate as string,
        page: 1,
        pageSize: 10000,
      });

      // 按日期统计
      const dateStat: any = {};
      if (result.rows && result.rows.length > 0) {
        result.rows.forEach((record) => {
          const date = new Date(record.attendanceDate).toISOString().split('T')[0];
          if (!dateStat[date]) {
            dateStat[date] = {
              date,
              total: 0,
              present: 0,
              absent: 0,
              late: 0,
            };
          }
          dateStat[date].total++;
          if (record.status === AttendanceStatus.PRESENT) dateStat[date].present++;
          if (record.status === AttendanceStatus.ABSENT) dateStat[date].absent++;
          if (record.status === AttendanceStatus.LATE) dateStat[date].late++;
        });
      }

      // 🔧 修复：转换为前端期望的数据格式
      const dailyData = Object.values(dateStat).map((stat: any) => ({
        date: stat.date,
        totalRecords: stat.total,
        presentCount: stat.present,
        absentCount: stat.absent,
        lateCount: stat.late,
        earlyLeaveCount: 0,
        sickLeaveCount: 0,
        personalLeaveCount: 0,
        attendanceRate: parseFloat(stat.total > 0 ? ((stat.present / stat.total) * 100).toFixed(2) : '0.00'),
      }));

      res.json({
        success: true,
        data: {
          startDate,
          endDate,
          dailyData,
        },
      });
    } catch (error) {
      console.error('获取周统计失败:', error);
      res.status(500).json({
        success: false,
        message: '获取周统计失败',
        error: error instanceof Error ? error.message : '未知错误',
      });
    }
  }

  /**
   * 获取月统计
   * GET /api/attendance-center/statistics/monthly
   */
  public static async getMonthlyStatistics(req: Request, res: Response) {
    try {
      const { kindergartenId, year, month } = req.query;

      if (!kindergartenId || !year || !month) {
        return res.status(400).json({
          success: false,
          message: '幼儿园ID、年份和月份不能为空',
        });
      }

      // 计算月份的开始和结束日期
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = new Date(parseInt(year as string), parseInt(month as string), 0)
        .toISOString()
        .split('T')[0];

      const result = await AttendanceCenterController.attendanceService.queryAttendances({
        kindergartenId: parseInt(kindergartenId as string),
        startDate,
        endDate,
        page: 1,
        pageSize: 10000,
      });

      // 按日期统计
      const dateStat: any = {};
      if (result.rows && result.rows.length > 0) {
        result.rows.forEach((record) => {
          const date = new Date(record.attendanceDate).toISOString().split('T')[0];
          if (!dateStat[date]) {
            dateStat[date] = {
              date,
              total: 0,
              present: 0,
              absent: 0,
            };
          }
          dateStat[date].total++;
          if (record.status === AttendanceStatus.PRESENT) dateStat[date].present++;
          if (record.status === AttendanceStatus.ABSENT) dateStat[date].absent++;
        });
      }

      // 🔧 修复：转换为前端期望的数据格式
      const dailyData = Object.values(dateStat).map((stat: any) => ({
        date: stat.date,
        totalRecords: stat.total,
        presentCount: stat.present,
        absentCount: stat.absent,
        lateCount: 0,
        earlyLeaveCount: 0,
        sickLeaveCount: 0,
        personalLeaveCount: 0,
        attendanceRate: stat.total > 0 ? parseFloat(((stat.present / stat.total) * 100).toFixed(2)) : 0,
      }));

      // 计算月度总计
      const totalRecords = result.count || 0;
      const presentCount = result.rows ? result.rows.filter((r) => r.status === AttendanceStatus.PRESENT).length : 0;
      const monthlyAttendanceRate = totalRecords > 0 ? parseFloat(((presentCount / totalRecords) * 100).toFixed(2)) : 0;

      res.json({
        success: true,
        data: {
          year,
          month,
          totalRecords,
          presentCount,
          monthlyAttendanceRate,
          dailyData,
        },
      });
    } catch (error) {
      console.error('获取月统计失败:', error);
      res.status(500).json({
        success: false,
        message: '获取月统计失败',
        error: error instanceof Error ? error.message : '未知错误',
      });
    }
  }

  /**
   * 获取季度统计
   * GET /api/attendance-center/statistics/quarterly
   */
  public static async getQuarterlyStatistics(req: Request, res: Response) {
    try {
      const { kindergartenId, year, quarter } = req.query;

      if (!kindergartenId || !year || !quarter) {
        return res.status(400).json({
          success: false,
          message: '幼儿园ID、年份和季度不能为空',
        });
      }

      // 计算季度的开始和结束月份
      const quarterNum = parseInt(quarter as string);
      const startMonth = (quarterNum - 1) * 3 + 1;
      const endMonth = quarterNum * 3;

      const startDate = `${year}-${String(startMonth).padStart(2, '0')}-01`;
      const endDate = new Date(parseInt(year as string), endMonth, 0)
        .toISOString()
        .split('T')[0];

      const result = await AttendanceCenterController.attendanceService.queryAttendances({
        kindergartenId: parseInt(kindergartenId as string),
        startDate,
        endDate,
        page: 1,
        pageSize: 10000,
      });

      // 按月份统计
      const monthStat: any = {};
      if (result.rows && result.rows.length > 0) {
        result.rows.forEach((record) => {
          const month = new Date(record.attendanceDate).getMonth() + 1;
          if (!monthStat[month]) {
            monthStat[month] = {
              month,
              total: 0,
              present: 0,
              absent: 0,
            };
          }
          monthStat[month].total++;
          if (record.status === AttendanceStatus.PRESENT) monthStat[month].present++;
          if (record.status === AttendanceStatus.ABSENT) monthStat[month].absent++;
        });
      }

      const monthlyData = Object.values(monthStat).map((stat: any) => ({
        ...stat,
        attendanceRate: stat.total > 0 ? parseFloat(((stat.present / stat.total) * 100).toFixed(2)) : 0,
      }));

      // 计算季度总计
      const totalRecords = result.count || 0;
      const presentCount = result.rows ? result.rows.filter((r) => r.status === AttendanceStatus.PRESENT).length : 0;
      const quarterlyAttendanceRate = totalRecords > 0 ? parseFloat(((presentCount / totalRecords) * 100).toFixed(2)) : 0;

      res.json({
        success: true,
        data: {
          year,
          quarter,
          totalRecords,
          presentCount,
          quarterlyAttendanceRate,
          monthlyData,
        },
      });
    } catch (error) {
      console.error('获取季度统计失败:', error);
      res.status(500).json({
        success: false,
        message: '获取季度统计失败',
        error: error instanceof Error ? error.message : '未知错误',
      });
    }
  }

  /**
   * 获取年度统计
   * GET /api/attendance-center/statistics/yearly
   */
  public static async getYearlyStatistics(req: Request, res: Response) {
    try {
      const { kindergartenId, year } = req.query;

      if (!kindergartenId || !year) {
        return res.status(400).json({
          success: false,
          message: '幼儿园ID和年份不能为空',
        });
      }

      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      const result = await AttendanceCenterController.attendanceService.queryAttendances({
        kindergartenId: parseInt(kindergartenId as string),
        startDate,
        endDate,
        page: 1,
        pageSize: 10000,
      });

      // 按月份统计
      const monthStat: any = {};
      for (let i = 1; i <= 12; i++) {
        monthStat[i] = {
          month: i,
          total: 0,
          present: 0,
          absent: 0,
        };
      }

      if (result.rows && result.rows.length > 0) {
        result.rows.forEach((record) => {
          const month = new Date(record.attendanceDate).getMonth() + 1;
          monthStat[month].total++;
          if (record.status === AttendanceStatus.PRESENT) monthStat[month].present++;
          if (record.status === AttendanceStatus.ABSENT) monthStat[month].absent++;
        });
      }

      const monthlyData = Object.values(monthStat).map((stat: any) => ({
        ...stat,
        attendanceRate: stat.total > 0 ? parseFloat(((stat.present / stat.total) * 100).toFixed(2)) : 0,
      }));

      // 计算年度总计
      const totalRecords = result.count || 0;
      const presentCount = result.rows ? result.rows.filter((r) => r.status === AttendanceStatus.PRESENT).length : 0;
      const yearlyAttendanceRate = totalRecords > 0 ? parseFloat(((presentCount / totalRecords) * 100).toFixed(2)) : 0;

      res.json({
        success: true,
        data: {
          year,
          totalRecords,
          presentCount,
          yearlyAttendanceRate,
          monthlyData,
        },
      });
    } catch (error) {
      console.error('获取年度统计失败:', error);
      res.status(500).json({
        success: false,
        message: '获取年度统计失败',
        error: error instanceof Error ? error.message : '未知错误',
      });
    }
  }

  /**
   * 按班级统计
   * GET /api/attendance-center/statistics/by-class
   */
  public static async getStatisticsByClass(req: Request, res: Response) {
    try {
      const { kindergartenId, startDate, endDate } = req.query;

      if (!kindergartenId) {
        return res.status(400).json({
          success: false,
          message: '幼儿园ID不能为空',
        });
      }

      const result = await AttendanceCenterController.attendanceService.queryAttendances({
        kindergartenId: parseInt(kindergartenId as string),
        startDate: startDate as string,
        endDate: endDate as string,
        page: 1,
        pageSize: 10000,
      });

      // 按班级统计
      const classStat: any = {};
      if (result.rows && result.rows.length > 0) {
        result.rows.forEach((record) => {
          const classId = record.classId;
          if (!classStat[classId]) {
            classStat[classId] = {
              classId,
              className: record.class?.name || '未知班级',
              total: 0,
              present: 0,
              absent: 0,
              late: 0,
              earlyLeave: 0,
              sickLeave: 0,
              personalLeave: 0,
            };
          }
          classStat[classId].total++;
          if (record.status === AttendanceStatus.PRESENT) classStat[classId].present++;
          if (record.status === AttendanceStatus.ABSENT) classStat[classId].absent++;
          if (record.status === AttendanceStatus.LATE) classStat[classId].late++;
          if (record.status === AttendanceStatus.EARLY_LEAVE) classStat[classId].earlyLeave++;
          if (record.status === AttendanceStatus.SICK_LEAVE) classStat[classId].sickLeave++;
          if (record.status === AttendanceStatus.PERSONAL_LEAVE) classStat[classId].personalLeave++;
        });
      }

      const classStatistics = Object.values(classStat).map((stat: any) => ({
        ...stat,
        attendanceRate: stat.total > 0 ? parseFloat(((stat.present / stat.total) * 100).toFixed(2)) : 0,
      }));

      // 按出勤率排序
      classStatistics.sort((a: any, b: any) => b.attendanceRate - a.attendanceRate);

      res.json({
        success: true,
        data: {
          startDate,
          endDate,
          classStatistics,
        },
      });
    } catch (error) {
      console.error('按班级统计失败:', error);
      res.status(500).json({
        success: false,
        message: '按班级统计失败',
        error: error instanceof Error ? error.message : '未知错误',
      });
    }
  }

  /**
   * 按年龄段统计
   * GET /api/attendance-center/statistics/by-age
   */
  public static async getStatisticsByAge(req: Request, res: Response) {
    try {
      const { kindergartenId, startDate, endDate } = req.query;

      if (!kindergartenId) {
        return res.status(400).json({
          success: false,
          message: '幼儿园ID不能为空',
        });
      }

      const result = await AttendanceCenterController.attendanceService.queryAttendances({
        kindergartenId: parseInt(kindergartenId as string),
        startDate: startDate as string,
        endDate: endDate as string,
        page: 1,
        pageSize: 10000,
      });

      // 按年龄段统计（根据班级的grade字段）
      const ageStat: any = {
        小班: { ageGroup: '小班', total: 0, present: 0, absent: 0 },
        中班: { ageGroup: '中班', total: 0, present: 0, absent: 0 },
        大班: { ageGroup: '大班', total: 0, present: 0, absent: 0 },
      };

      if (result.rows && result.rows.length > 0) {
        result.rows.forEach((record) => {
          const grade = record.class?.grade || '未知';
          if (ageStat[grade]) {
            ageStat[grade].total++;
            if (record.status === AttendanceStatus.PRESENT) ageStat[grade].present++;
            if (record.status === AttendanceStatus.ABSENT) ageStat[grade].absent++;
          }
        });
      }

      const ageStatistics = Object.values(ageStat).map((stat: any) => ({
        ...stat,
        attendanceRate: stat.total > 0 ? parseFloat(((stat.present / stat.total) * 100).toFixed(2)) : 0,
      }));

      res.json({
        success: true,
        data: {
          startDate,
          endDate,
          ageStatistics,
        },
      });
    } catch (error) {
      console.error('按年龄段统计失败:', error);
      res.status(500).json({
        success: false,
        message: '按年龄段统计失败',
        error: error instanceof Error ? error.message : '未知错误',
      });
    }
  }

  /**
   * 获取所有考勤记录
   * GET /api/attendance-center/records
   */
  public static async getAllRecords(req: Request, res: Response) {
    try {
      const {
        kindergartenId,
        classId,
        studentId,
        startDate,
        endDate,
        status,
        page,
        pageSize,
      } = req.query;

      if (!kindergartenId) {
        return res.status(400).json({
          success: false,
          message: '幼儿园ID不能为空',
        });
      }

      const result = await AttendanceCenterController.attendanceService.queryAttendances({
        kindergartenId: parseInt(kindergartenId as string),
        classId: classId ? parseInt(classId as string) : undefined,
        studentId: studentId ? parseInt(studentId as string) : undefined,
        startDate: startDate as string,
        endDate: endDate as string,
        status: status as any,
        page: page ? parseInt(page as string) : 1,
        pageSize: pageSize ? parseInt(pageSize as string) : 20,
      });

      res.json({
        success: true,
        data: {
          records: result.rows,
          total: result.count,
          page: page ? parseInt(page as string) : 1,
          pageSize: pageSize ? parseInt(pageSize as string) : 20,
        },
      });
    } catch (error) {
      console.error('获取考勤记录失败:', error);
      res.status(500).json({
        success: false,
        message: '获取考勤记录失败',
        error: error instanceof Error ? error.message : '未知错误',
      });
    }
  }

  /**
   * 修改任意考勤记录（园长权限）
   * PUT /api/attendance-center/records/:id
   */
  public static async updateRecord(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const updateData = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证',
        });
      }

      // 园长可以修改任意时间的考勤记录
      const updatedAttendance = await AttendanceCenterController.attendanceService.updateAttendance(
        parseInt(id),
        updateData,
        userId
      );

      res.json({
        success: true,
        data: updatedAttendance,
        message: '考勤记录更新成功',
      });
    } catch (error) {
      console.error('更新考勤记录失败:', error);
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }
      res.status(500).json({
        success: false,
        message: '更新考勤记录失败',
        error: error instanceof Error ? error.message : '未知错误',
      });
    }
  }

  /**
   * 删除考勤记录（园长权限）
   * DELETE /api/attendance-center/records/:id
   */
  public static async deleteRecord(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证',
        });
      }

      await AttendanceCenterController.attendanceService.deleteAttendance(
        parseInt(id),
        userId
      );

      res.json({
        success: true,
        message: '考勤记录删除成功',
      });
    } catch (error) {
      console.error('删除考勤记录失败:', error);
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }
      res.status(500).json({
        success: false,
        message: '删除考勤记录失败',
        error: error instanceof Error ? error.message : '未知错误',
      });
    }
  }

  /**
   * 重置考勤记录（园长权限）
   * POST /api/attendance-center/records/reset
   */
  public static async resetRecord(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { id, changeReason } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证',
        });
      }

      // 重置考勤记录（将状态重置为默认值）
      const updatedAttendance = await AttendanceCenterController.attendanceService.updateAttendance(
        id,
        {
          status: AttendanceStatus.PRESENT,
          checkInTime: undefined,
          checkOutTime: undefined,
          temperature: undefined,
          notes: undefined,
          leaveReason: undefined,
          changeReason: changeReason || '园长重置',
        },
        userId
      );

      res.json({
        success: true,
        data: updatedAttendance,
        message: '考勤记录重置成功',
      });
    } catch (error) {
      console.error('重置考勤记录失败:', error);
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }
      res.status(500).json({
        success: false,
        message: '重置考勤记录失败',
        error: error instanceof Error ? error.message : '未知错误',
      });
    }
  }

  /**
   * 获取异常考勤分析
   * GET /api/attendance-center/abnormal
   */
  public static async getAbnormalAnalysis(req: Request, res: Response) {
    try {
      const { kindergartenId, startDate, endDate } = req.query;

      if (!kindergartenId) {
        return res.status(400).json({
          success: false,
          message: '幼儿园ID不能为空',
        });
      }

      const result = await AttendanceCenterController.attendanceService.queryAttendances({
        kindergartenId: parseInt(kindergartenId as string),
        startDate: startDate as string,
        endDate: endDate as string,
        page: 1,
        pageSize: 10000,
      });

      // 统计连续缺勤的学生
      const studentAbsence: any = {};
      if (result.rows && result.rows.length > 0) {
        result.rows
          .filter((r) => r.status === AttendanceStatus.ABSENT)
          .forEach((record) => {
            const studentId = record.studentId;
            if (!studentAbsence[studentId]) {
              studentAbsence[studentId] = {
                studentId,
                studentName: record.student?.name || '未知学生',
                className: record.class?.name || '未知班级',
                absenceDays: 0,
                dates: [],
              };
            }
            studentAbsence[studentId].absenceDays++;
            studentAbsence[studentId].dates.push(
              new Date(record.attendanceDate).toISOString().split('T')[0]
            );
          });
      }

      const continuousAbsence = Object.values(studentAbsence)
        .filter((s: any) => s.absenceDays >= 3)
        .sort((a: any, b: any) => b.absenceDays - a.absenceDays);

      // 统计频繁迟到的学生
      const studentLate: any = {};
      if (result.rows && result.rows.length > 0) {
        result.rows
          .filter((r) => r.status === AttendanceStatus.LATE)
          .forEach((record) => {
            const studentId = record.studentId;
            if (!studentLate[studentId]) {
              studentLate[studentId] = {
                studentId,
                studentName: record.student?.name || '未知学生',
                className: record.class?.name || '未知班级',
                lateDays: 0,
              };
            }
            studentLate[studentId].lateDays++;
          });
      }

      const frequentLate = Object.values(studentLate)
        .filter((s: any) => s.lateDays >= 3)
        .sort((a: any, b: any) => b.lateDays - a.lateDays);

      // 统计早退的学生
      const earlyLeaveCount = result.rows && result.rows.length > 0
        ? result.rows.filter((r) => r.status === AttendanceStatus.EARLY_LEAVE).length
        : 0;

      res.json({
        success: true,
        data: {
          continuousAbsence,
          frequentLate,
          earlyLeaveCount,
        },
      });
    } catch (error) {
      console.error('获取异常考勤分析失败:', error);
      res.status(500).json({
        success: false,
        message: '获取异常考勤分析失败',
        error: error instanceof Error ? error.message : '未知错误',
      });
    }
  }

  /**
   * 获取健康监测数据
   * GET /api/attendance-center/health
   */
  public static async getHealthMonitoring(req: Request, res: Response) {
    try {
      const { kindergartenId, startDate, endDate } = req.query;

      if (!kindergartenId) {
        return res.status(400).json({
          success: false,
          message: '幼儿园ID不能为空',
        });
      }

      const result = await AttendanceCenterController.attendanceService.queryAttendances({
        kindergartenId: parseInt(kindergartenId as string),
        startDate: startDate as string,
        endDate: endDate as string,
        page: 1,
        pageSize: 10000,
      });

      // 统计体温异常
      const abnormalTemperature = result.rows && result.rows.length > 0
        ? result.rows.filter((r) => r.temperature && r.temperature >= 37.3)
        : [];

      // 统计病假
      const sickLeave = result.rows && result.rows.length > 0
        ? result.rows.filter((r) => r.status === AttendanceStatus.SICK_LEAVE)
        : [];

      // 按日期统计体温异常趋势
      const temperatureTrend: any = {};
      if (abnormalTemperature.length > 0) {
        abnormalTemperature.forEach((record) => {
          const date = new Date(record.attendanceDate).toISOString().split('T')[0];
          if (!temperatureTrend[date]) {
            temperatureTrend[date] = {
              date,
              count: 0,
            };
          }
          temperatureTrend[date].count++;
        });
      }

      const temperatureTrendData = Object.values(temperatureTrend);

      res.json({
        success: true,
        data: {
          abnormalTemperatureCount: abnormalTemperature.length,
          sickLeaveCount: sickLeave.length,
          temperatureTrend: temperatureTrendData,
          abnormalTemperatureRecords: abnormalTemperature.slice(0, 10), // 最近10条
        },
      });
    } catch (error) {
      console.error('获取健康监测数据失败:', error);
      res.status(500).json({
        success: false,
        message: '获取健康监测数据失败',
        error: error instanceof Error ? error.message : '未知错误',
      });
    }
  }

  /**
   * 导出考勤报表（园长权限）
   * POST /api/attendance-center/export
   */
  public static async exportAttendance(req: Request, res: Response) {
    try {
      const { kindergartenId, startDate, endDate, format = 'excel' } = req.body;

      if (!kindergartenId) {
        return res.status(400).json({
          success: false,
          message: '幼儿园ID不能为空',
        });
      }

      const result = await AttendanceCenterController.attendanceService.queryAttendances({
        kindergartenId,
        startDate,
        endDate,
        page: 1,
        pageSize: 10000,
      });

      // TODO: 实现实际的导出逻辑（Excel/PDF）
      res.json({
        success: true,
        data: {
          records: result.rows,
          total: result.count,
          format,
        },
        message: '导出数据准备完成',
      });
    } catch (error) {
      console.error('导出考勤报表失败:', error);
      res.status(500).json({
        success: false,
        message: '导出考勤报表失败',
        error: error instanceof Error ? error.message : '未知错误',
      });
    }
  }

  /**
   * 批量导入考勤（园长权限）
   * POST /api/attendance-center/import
   */
  public static async importAttendance(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { records } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证',
        });
      }

      if (!Array.isArray(records) || records.length === 0) {
        return res.status(400).json({
          success: false,
          message: '导入数据不能为空',
        });
      }

      // TODO: 实现批量导入逻辑
      // 这里需要验证数据格式、学生ID、班级ID等
      // 然后调用 batchCreateAttendance 方法

      res.json({
        success: true,
        data: {
          total: records.length,
          success: 0,
          failed: 0,
        },
        message: '批量导入功能待实现',
      });
    } catch (error) {
      console.error('批量导入考勤失败:', error);
      res.status(500).json({
        success: false,
        message: '批量导入考勤失败',
        error: error instanceof Error ? error.message : '未知错误',
      });
    }
  }
}

