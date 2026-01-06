import { Request, Response } from 'express';
import teacherAttendanceService from '../services/teacher-attendance.service';
import { LeaveType } from '../models';

/**
 * 教师打卡控制器
 * 处理教师自己的签到签退和请假
 */
export class TeacherCheckinController {
  /**
   * 签到
   * POST /api/teacher-checkin/check-in
   */
  async checkIn(req: Request, res: Response) {
    try {
      const { teacherId, userId, kindergartenId } = req.body;

      if (!teacherId || !userId || !kindergartenId) {
        return res.status(400).json({
          success: false,
          message: '缺少必要参数',
        });
      }

      const record = await teacherAttendanceService.checkIn(teacherId, userId, kindergartenId);

      res.json({
        success: true,
        message: '签到成功',
        data: record,
      });
    } catch (error: any) {
      console.error('签到失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '签到失败',
      });
    }
  }

  /**
   * 签退
   * POST /api/teacher-checkin/check-out
   */
  async checkOut(req: Request, res: Response) {
    try {
      const { teacherId } = req.body;

      if (!teacherId) {
        return res.status(400).json({
          success: false,
          message: '缺少教师ID',
        });
      }

      const record = await teacherAttendanceService.checkOut(teacherId);

      res.json({
        success: true,
        message: '签退成功',
        data: record,
      });
    } catch (error: any) {
      console.error('签退失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '签退失败',
      });
    }
  }

  /**
   * 获取今日考勤
   * GET /api/teacher-checkin/today
   */
  async getTodayAttendance(req: Request, res: Response) {
    try {
      const { teacherId } = req.query;

      if (!teacherId) {
        return res.status(400).json({
          success: false,
          message: '缺少教师ID',
        });
      }

      const record = await teacherAttendanceService.getTodayAttendance(Number(teacherId));

      res.json({
        success: true,
        data: record,
      });
    } catch (error: any) {
      console.error('获取今日考勤失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取今日考勤失败',
      });
    }
  }

  /**
   * 获取本月考勤
   * GET /api/teacher-checkin/month
   */
  async getMonthAttendance(req: Request, res: Response) {
    try {
      const { teacherId, year, month } = req.query;

      if (!teacherId || !year || !month) {
        return res.status(400).json({
          success: false,
          message: '缺少必要参数',
        });
      }

      const records = await teacherAttendanceService.getMonthAttendance(
        Number(teacherId),
        Number(year),
        Number(month)
      );

      res.json({
        success: true,
        data: records,
      });
    } catch (error: any) {
      console.error('获取本月考勤失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取本月考勤失败',
      });
    }
  }

  /**
   * 创建请假申请
   * POST /api/teacher-checkin/leave
   */
  async createLeaveRequest(req: Request, res: Response) {
    try {
      const { teacherId, userId, kindergartenId, leaveType, leaveReason, leaveStartTime, leaveEndTime } = req.body;

      if (!teacherId || !userId || !kindergartenId || !leaveType || !leaveReason || !leaveStartTime || !leaveEndTime) {
        return res.status(400).json({
          success: false,
          message: '缺少必要参数',
        });
      }

      // 验证请假类型
      if (!Object.values(LeaveType).includes(leaveType)) {
        return res.status(400).json({
          success: false,
          message: '无效的请假类型',
        });
      }

      const records = await teacherAttendanceService.createLeaveRequest({
        teacherId,
        userId,
        kindergartenId,
        leaveType,
        leaveReason,
        leaveStartTime: new Date(leaveStartTime),
        leaveEndTime: new Date(leaveEndTime),
      });

      res.json({
        success: true,
        message: '请假申请已提交',
        data: records,
      });
    } catch (error: any) {
      console.error('创建请假申请失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '创建请假申请失败',
      });
    }
  }

  /**
   * 获取教师考勤统计
   * GET /api/teacher-checkin/statistics
   */
  async getStatistics(req: Request, res: Response) {
    try {
      const { teacherId, startDate, endDate } = req.query;

      if (!teacherId || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: '缺少必要参数',
        });
      }

      const statistics = await teacherAttendanceService.getTeacherStatistics(
        Number(teacherId),
        String(startDate),
        String(endDate)
      );

      res.json({
        success: true,
        data: statistics,
      });
    } catch (error: any) {
      console.error('获取统计数据失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取统计数据失败',
      });
    }
  }

  /**
   * 获取教师考勤历史
   * GET /api/teacher-checkin/history
   */
  async getHistory(req: Request, res: Response) {
    try {
      const { teacherId, startDate, endDate, status, page = 1, pageSize = 20 } = req.query;

      if (!teacherId || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: '缺少必要参数',
        });
      }

      const result = await teacherAttendanceService.getTeacherHistory({
        teacherId: Number(teacherId),
        startDate: String(startDate),
        endDate: String(endDate),
        status: status as any,
        page: Number(page),
        pageSize: Number(pageSize),
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('获取考勤历史失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取考勤历史失败',
      });
    }
  }

  /**
   * 审核请假申请
   * POST /api/teacher-checkin/approve
   */
  async approveLeaveRequest(req: Request, res: Response) {
    try {
      const { recordId, approvedBy, isApproved, approvalNotes } = req.body;

      if (!recordId || !approvedBy || isApproved === undefined) {
        return res.status(400).json({
          success: false,
          message: '缺少必要参数',
        });
      }

      const record = await teacherAttendanceService.approveLeaveRequest(
        recordId,
        approvedBy,
        isApproved,
        approvalNotes
      );

      res.json({
        success: true,
        message: isApproved ? '请假申请已批准' : '请假申请已拒绝',
        data: record,
      });
    } catch (error: any) {
      console.error('审核请假申请失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '审核请假申请失败',
      });
    }
  }
}

export default new TeacherCheckinController();

