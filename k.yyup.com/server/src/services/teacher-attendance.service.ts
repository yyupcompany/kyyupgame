import { Op } from 'sequelize';
import { TeacherAttendance, TeacherAttendanceStatus, LeaveType } from '../models';
import { Teacher } from '../models/teacher.model';
import { User } from '../models/user.model';
import { Kindergarten } from '../models/kindergarten.model';

/**
 * 教师考勤服务
 */
export class TeacherAttendanceService {
  /**
   * 签到
   */
  async checkIn(teacherId: number, userId: number, kindergartenId: number) {
    const todayStr = new Date().toISOString().split('T')[0];
    const today = new Date(todayStr);

    // 检查今天是否已经签到
    const existingRecord = await TeacherAttendance.findOne({
      where: {
        teacherId,
        attendanceDate: today,
      },
    });

    if (existingRecord && existingRecord.checkInTime) {
      throw new Error('今天已经签到过了');
    }

    const now = new Date();
    const checkInTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    // 判断是否迟到（假设9:00为上班时间）
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 0);
    const status = isLate ? TeacherAttendanceStatus.LATE : TeacherAttendanceStatus.PRESENT;

    if (existingRecord) {
      // 更新现有记录
      await existingRecord.update({
        checkInTime,
        status,
        recordedAt: new Date(),
      });
      return existingRecord;
    } else {
      // 创建新记录
      const record = await TeacherAttendance.create({
        teacherId,
        userId,
        kindergartenId,
        attendanceDate: today,
        checkInTime,
        status,
        isApproved: true,
        recordedAt: new Date(),
      });
      return record;
    }
  }

  /**
   * 签退
   */
  async checkOut(teacherId: number) {
    const today = new Date().toISOString().split('T')[0];
    
    // 查找今天的考勤记录
    const record = await TeacherAttendance.findOne({
      where: {
        teacherId,
        attendanceDate: today,
      },
    });

    if (!record) {
      throw new Error('请先签到');
    }

    if (record.checkOutTime) {
      throw new Error('今天已经签退过了');
    }

    const now = new Date();
    const checkOutTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    // 判断是否早退（假设18:00为下班时间）
    const isEarlyLeave = now.getHours() < 18;
    
    // 计算工作时长（分钟）
    let workDuration = null;
    if (record.checkInTime) {
      const [inHour, inMinute] = record.checkInTime.split(':').map(Number);
      const [outHour, outMinute] = checkOutTime.split(':').map(Number);
      workDuration = (outHour * 60 + outMinute) - (inHour * 60 + inMinute);
    }

    // 更新状态
    let status = record.status;
    if (isEarlyLeave && status === TeacherAttendanceStatus.PRESENT) {
      status = TeacherAttendanceStatus.EARLY_LEAVE;
    }

    await record.update({
      checkOutTime,
      workDuration,
      status,
    });

    return record;
  }

  /**
   * 获取今日考勤
   */
  async getTodayAttendance(teacherId: number) {
    const today = new Date().toISOString().split('T')[0];
    
    const record = await TeacherAttendance.findOne({
      where: {
        teacherId,
        attendanceDate: today,
      },
      include: [
        {
          model: Teacher,
          as: 'teacher',
          attributes: ['id', 'name'],
        },
      ],
    });

    return record;
  }

  /**
   * 获取本月考勤记录
   */
  async getMonthAttendance(teacherId: number, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const records = await TeacherAttendance.findAll({
      where: {
        teacherId,
        attendanceDate: {
          [Op.between]: [
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0],
          ],
        },
      },
      order: [['attendanceDate', 'ASC']],
    });

    return records;
  }

  /**
   * 创建请假申请
   */
  async createLeaveRequest(data: {
    teacherId: number;
    userId: number;
    kindergartenId: number;
    leaveType: LeaveType;
    leaveReason: string;
    leaveStartTime: Date;
    leaveEndTime: Date;
  }) {
    const { teacherId, userId, kindergartenId, leaveType, leaveReason, leaveStartTime, leaveEndTime } = data;

    // 计算请假天数
    const startDate = new Date(leaveStartTime);
    const endDate = new Date(leaveEndTime);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // 为每一天创建请假记录
    const records = [];
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      const attendanceDate = new Date(dateStr);

      // 检查是否已有记录
      const existingRecord = await TeacherAttendance.findOne({
        where: {
          teacherId,
          attendanceDate: attendanceDate,
        },
      });

      if (existingRecord) {
        // 更新现有记录
        await existingRecord.update({
          status: TeacherAttendanceStatus.LEAVE,
          leaveType,
          leaveReason,
          leaveStartTime,
          leaveEndTime,
          isApproved: false, // 请假需要审核
        });
        records.push(existingRecord);
      } else {
        // 创建新记录
        const record = await TeacherAttendance.create({
          teacherId,
          userId,
          kindergartenId,
          attendanceDate: attendanceDate,
          status: TeacherAttendanceStatus.LEAVE,
          leaveType,
          leaveReason,
          leaveStartTime,
          leaveEndTime,
          isApproved: false, // 请假需要审核
          recordedAt: new Date(),
        });
        records.push(record);
      }
    }

    return records;
  }

  /**
   * 获取教师考勤统计
   */
  async getTeacherStatistics(teacherId: number, startDate: string, endDate: string) {
    const records = await TeacherAttendance.findAll({
      where: {
        teacherId,
        attendanceDate: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    const totalDays = records.length;
    const presentCount = records.filter(r => r.status === TeacherAttendanceStatus.PRESENT).length;
    const lateCount = records.filter(r => r.status === TeacherAttendanceStatus.LATE).length;
    const earlyLeaveCount = records.filter(r => r.status === TeacherAttendanceStatus.EARLY_LEAVE).length;
    const leaveCount = records.filter(r => r.status === TeacherAttendanceStatus.LEAVE).length;
    const absentCount = records.filter(r => r.status === TeacherAttendanceStatus.ABSENT).length;

    const attendanceDays = presentCount + lateCount + earlyLeaveCount;
    const attendanceRate = totalDays > 0 ? ((attendanceDays / totalDays) * 100).toFixed(1) : '0.0';

    return {
      totalDays,
      attendanceDays,
      presentCount,
      lateCount,
      earlyLeaveCount,
      leaveCount,
      absentCount,
      attendanceRate: parseFloat(attendanceRate),
    };
  }

  /**
   * 获取教师考勤历史
   */
  async getTeacherHistory(params: {
    teacherId: number;
    startDate: string;
    endDate: string;
    status?: TeacherAttendanceStatus;
    page: number;
    pageSize: number;
  }) {
    const { teacherId, startDate, endDate, status, page, pageSize } = params;

    const where: any = {
      teacherId,
      attendanceDate: {
        [Op.between]: [startDate, endDate],
      },
    };

    if (status) {
      where.status = status;
    }

    const { count, rows } = await TeacherAttendance.findAndCountAll({
      where,
      include: [
        {
          model: Teacher,
          as: 'teacher',
          attributes: ['id', 'name'],
        },
      ],
      order: [['attendanceDate', 'DESC']],
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    return {
      count,
      rows,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    };
  }

  /**
   * 审核请假申请
   */
  async approveLeaveRequest(recordId: number, approvedBy: number, isApproved: boolean, approvalNotes?: string) {
    const record = await TeacherAttendance.findByPk(recordId);

    if (!record) {
      throw new Error('考勤记录不存在');
    }

    if (record.status !== TeacherAttendanceStatus.LEAVE) {
      throw new Error('只能审核请假记录');
    }

    await record.update({
      isApproved,
      approvedBy,
      approvedAt: new Date(),
      approvalNotes,
    });

    return record;
  }
}

export default new TeacherAttendanceService();

