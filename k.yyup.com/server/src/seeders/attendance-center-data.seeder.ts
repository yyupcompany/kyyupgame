import { Attendance, AttendanceStatus, HealthStatus } from '../models/attendance.model';
import { AttendanceStatistics, StatType, StatPeriod } from '../models/attendance-statistics.model';
import { AttendanceChangeLog, ChangeType } from '../models/attendance-change-log.model';
import { Student } from '../models/student.model';
import { Class } from '../models/class.model';
import { Kindergarten } from '../models/kindergarten.model';
import { User } from '../models/user.model';

/**
 * 考勤中心种子数据生成器
 *
 * 使用静态导入，遵循项目静态初始化原则
 *
 * 生成数据：
 * - 为每个学生生成近30天的考勤记录
 * - 生成日统计、月统计
 * - 生成部分考勤修改日志
 */
export class AttendanceCenterSeeder {

  /**
   * 生成考勤中心完整数据
   */
  public static async seed() {
    try {
      console.log('🌱 开始生成考勤中心种子数据...');

      // 获取所有必要的数据
      const students = await Student.findAll();
      const classes = await Class.findAll();
      const kindergartens = await Kindergarten.findAll();
      const teachers = await User.findAll({ where: { role: 'teacher' } });

      if (students.length === 0 || classes.length === 0) {
        console.log('⚠️ 请先创建学生和班级数据');
        return;
      }

      const teacher = teachers[0] || (await User.findOne({ where: { role: 'admin' } }));
      if (!teacher) {
        console.log('⚠️ 请先创建用户数据');
        return;
      }

      const kindergarten = kindergartens[0];

      // 1. 生成考勤记录（近30天）
      await this.seedAttendanceRecords(students, classes, kindergarten, teacher);

      // 2. 生成考勤统计
      await this.seedAttendanceStatistics(students, classes, kindergarten);

      // 3. 生成部分修改日志
      await this.seedAttendanceChangeLogs(teacher);

      console.log('✅ 考勤中心种子数据生成完成!');
    } catch (error) {
      console.error('❌ 生成考勤中心种子数据失败:', error);
      throw error;
    }
  }

  /**
   * 生成考勤记录（近30天）
   */
  private static async seedAttendanceRecords(
    students: Student[],
    classes: Class[],
    kindergarten: Kindergarten,
    teacher: User
  ) {
    const today = new Date();
    let totalRecords = 0;

    for (const student of students) {
      // 获取学生所属班级
      const studentClass = classes.find(c => c.id === student.classId);
      if (!studentClass) continue;

      // 为每个学生生成近30天的考勤记录
      for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
        const attendanceDate = new Date(today);
        attendanceDate.setDate(today.getDate() - dayOffset);
        attendanceDate.setHours(0, 0, 0, 0);

        // 跳过周末（假设周六周日不考勤）
        const dayOfWeek = attendanceDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;

        // 检查是否已存在
        const existing = await Attendance.findOne({
          where: {
            studentId: student.id,
            attendanceDate: attendanceDate
          }
        });

        if (existing) continue;

        // 随机生成考勤状态
        const status = this.generateRandomStatus();
        const { checkInTime, checkOutTime, temperature } = this.generateTimeAndTemp(status);

        await Attendance.create({
          studentId: student.id,
          classId: studentClass.id,
          kindergartenId: kindergarten.id,
          attendanceDate,
          status,
          checkInTime,
          checkOutTime,
          temperature,
          healthStatus: temperature && temperature > 37.3 ? HealthStatus.ABNORMAL : HealthStatus.NORMAL,
          notes: status !== AttendanceStatus.PRESENT ? this.generateRandomNote(status) : null,
          leaveReason: status === AttendanceStatus.SICK_LEAVE || status === AttendanceStatus.PERSONAL_LEAVE
            ? this.generateRandomLeaveReason(status)
            : null,
          recordedBy: teacher.id,
          recordedAt: new Date(),
          isApproved: Math.random() > 0.3, // 70%已审核
          approvedBy: Math.random() > 0.3 ? teacher.id : null,
          approvedAt: Math.random() > 0.3 ? new Date() : null
        } as any);

        totalRecords++;
      }
    }

    console.log(`  ✅ 已生成 ${totalRecords} 条考勤记录`);
  }

  /**
   * 生成考勤统计
   */
  private static async seedAttendanceStatistics(
    students: Student[],
    classes: Class[],
    kindergarten: Kindergarten
  ) {
    const today = new Date();

    // 1. 生成日统计（近30天）
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const statDate = new Date(today);
      statDate.setDate(today.getDate() - dayOffset);
      statDate.setHours(0, 0, 0, 0);

      const dayOfWeek = statDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      // 幼儿园维度日统计
      await this.generateDailyStatForKindergarten(kindergarten.id, statDate);
    }

    // 2. 生成班级维度月统计（当前月）
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    for (const classItem of classes) {
      const existing = await AttendanceStatistics.findOne({
        where: {
          statType: StatType.CLASS,
          statPeriod: StatPeriod.MONTHLY,
          classId: classItem.id,
          year: currentYear,
          month: currentMonth + 1
        }
      });

      if (existing) continue;

      const stats = await this.calculateClassStats(classItem.id, currentYear, currentMonth + 1);

      await AttendanceStatistics.create({
        statType: StatType.CLASS,
        statPeriod: StatPeriod.MONTHLY,
        classId: classItem.id,
        kindergartenId: kindergarten.id,
        statDate: new Date(currentYear, currentMonth, 1),
        year: currentYear,
        month: currentMonth + 1,
        totalDays: 22, // 假设每月22个工作日
        ...stats,
        attendanceRate: stats.presentDays > 0
          ? Number(((stats.presentDays / 22) * 100).toFixed(2))
          : 0,
        punctualityRate: stats.presentDays > 0
          ? Number((((stats.presentDays - stats.lateCount) / stats.presentDays) * 100).toFixed(2))
          : 0
      } as any);
    }

    // 3. 生成学生维度月统计（为部分学生生成）
    for (const student of students.slice(0, Math.min(students.length, 20))) {
      const existing = await AttendanceStatistics.findOne({
        where: {
          statType: StatType.STUDENT,
          statPeriod: StatPeriod.MONTHLY,
          studentId: student.id,
          year: currentYear,
          month: currentMonth + 1
        }
      });

      if (existing) continue;

      const stats = await this.calculateStudentStats(student.id, currentYear, currentMonth + 1);

      await AttendanceStatistics.create({
        statType: StatType.STUDENT,
        statPeriod: StatPeriod.MONTHLY,
        studentId: student.id,
        classId: student.classId,
        kindergartenId: kindergarten.id,
        statDate: new Date(currentYear, currentMonth, 1),
        year: currentYear,
        month: currentMonth + 1,
        totalDays: 22,
        ...stats,
        attendanceRate: stats.presentDays > 0
          ? Number(((stats.presentDays / 22) * 100).toFixed(2))
          : 0,
        punctualityRate: stats.presentDays > 0
          ? Number((((stats.presentDays - stats.lateCount) / stats.presentDays) * 100).toFixed(2))
          : 0
      } as any);
    }

    console.log('  ✅ 已生成考勤统计数据');
  }

  /**
   * 生成考勤修改日志
   */
  private static async seedAttendanceChangeLogs(teacher: User) {
    // 获取一些考勤记录
    const attendances = await Attendance.findAll({ limit: 20 });

    let logCount = 0;
    for (const attendance of attendances) {
      // 30%的记录有修改日志
      if (Math.random() > 0.7) {
        const changeType = Math.random() > 0.5 ? ChangeType.UPDATE : ChangeType.CREATE;
        const oldStatus = changeType === ChangeType.UPDATE
          ? Object.values(AttendanceStatus)[Math.floor(Math.random() * 3)]
          : null;
        const newStatus = attendance.status;

        await AttendanceChangeLog.create({
          attendanceId: attendance.id,
          changeType,
          oldStatus,
          newStatus,
          oldData: oldStatus ? { status: oldStatus } : null,
          newData: { status: newStatus },
          changedBy: teacher.id,
          changedAt: new Date(),
          changeReason: this.generateRandomChangeReason(changeType),
          requiresApproval: Math.random() > 0.5,
          isApproved: Math.random() > 0.3,
          approvedBy: Math.random() > 0.3 ? teacher.id : null,
          approvedAt: Math.random() > 0.3 ? new Date() : null
        } as any);

        logCount++;
      }
    }

    console.log(`  ✅ 已生成 ${logCount} 条考勤修改日志`);
  }

  /**
   * 随机生成考勤状态
   */
  private static generateRandomStatus(): AttendanceStatus {
    const rand = Math.random();
    if (rand < 0.75) return AttendanceStatus.PRESENT; // 75%出勤
    if (rand < 0.80) return AttendanceStatus.LATE; // 5%迟到
    if (rand < 0.85) return AttendanceStatus.EARLY_LEAVE; // 5%早退
    if (rand < 0.90) return AttendanceStatus.SICK_LEAVE; // 5%病假
    if (rand < 0.95) return AttendanceStatus.PERSONAL_LEAVE; // 5%事假
    return AttendanceStatus.ABSENT; // 5%缺勤
  }

  /**
   * 生成时间和体温
   */
  private static generateTimeAndTemp(status: AttendanceStatus): {
    checkInTime: string | null;
    checkOutTime: string | null;
    temperature: number | null;
  } {
    const checkInTime = status === AttendanceStatus.PRESENT || status === AttendanceStatus.LATE
      ? `${String(Math.floor(Math.random() * 2) + 7).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`
      : null;

    const checkOutTime = status === AttendanceStatus.PRESENT || status === AttendanceStatus.EARLY_LEAVE
      ? `${String(Math.floor(Math.random() * 2) + 16).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`
      : null;

    const temperature = (status === AttendanceStatus.PRESENT || status === AttendanceStatus.LATE)
      ? Number((36.0 + Math.random() * 1.8).toFixed(1))
      : null;

    return { checkInTime, checkOutTime, temperature };
  }

  /**
   * 生成随机备注
   */
  private static generateRandomNote(status: AttendanceStatus): string {
    const notes = {
      [AttendanceStatus.ABSENT]: ['未到校', '联系家长', '情况不明'],
      [AttendanceStatus.LATE]: ['迟到5分钟', '迟到10分钟', '交通拥堵'],
      [AttendanceStatus.EARLY_LEAVE]: ['有事提前离校', '身体不适', '家长接走'],
      [AttendanceStatus.SICK_LEAVE]: ['感冒发烧', '在家休息', '医院就诊'],
      [AttendanceStatus.PERSONAL_LEAVE]: ['家庭事务', '特殊情况', '已获批准']
    };

    const statusNotes = notes[status] || [''];
    return statusNotes[Math.floor(Math.random() * statusNotes.length)];
  }

  /**
   * 生成随机请假原因
   */
  private static generateRandomLeaveReason(status: AttendanceStatus): string {
    if (status === AttendanceStatus.SICK_LEAVE) {
      return ['感冒发烧', '肠胃不适', '头痛', '牙痛', '身体检查'][Math.floor(Math.random() * 5)];
    } else if (status === AttendanceStatus.PERSONAL_LEAVE) {
      return ['家庭事务', '外出旅游', '参加活动', '特殊情况', '探亲访友'][Math.floor(Math.random() * 5)];
    }
    return '';
  }

  /**
   * 生成随机修改原因
   */
  private static generateRandomChangeReason(changeType: ChangeType): string {
    if (changeType === ChangeType.CREATE) {
      return ['补录考勤', '忘记打卡后补充', '系统延迟补录'][Math.floor(Math.random() * 3)];
    } else {
      return ['信息更正', '家长反馈', '审核不通过重新提交'][Math.floor(Math.random() * 3)];
    }
  }

  /**
   * 为幼儿园生成日统计
   */
  private static async generateDailyStatForKindergarten(kindergartenId: number, statDate: Date) {
    const existing = await AttendanceStatistics.findOne({
      where: {
        statType: StatType.KINDERGARTEN,
        statPeriod: StatPeriod.DAILY,
        kindergartenId,
        statDate
      }
    });

    if (existing) return;

    // 查询当天的所有考勤记录
    const attendances = await Attendance.findAll({
      where: { attendanceDate: statDate }
    });

    const totalDays = 1;
    const presentDays = attendances.filter(a => a.status === AttendanceStatus.PRESENT).length;
    const absentDays = attendances.filter(a => a.status === AttendanceStatus.ABSENT).length;
    const lateCount = attendances.filter(a => a.status === AttendanceStatus.LATE).length;
    const earlyLeaveCount = attendances.filter(a => a.status === AttendanceStatus.EARLY_LEAVE).length;
    const sickLeaveDays = attendances.filter(a => a.status === AttendanceStatus.SICK_LEAVE).length;
    const personalLeaveDays = attendances.filter(a => a.status === AttendanceStatus.PERSONAL_LEAVE).length;
    const excusedDays = attendances.filter(a => a.status === AttendanceStatus.EXCUSED).length;

    const temperatures = attendances
      .map(a => a.temperature)
      .filter((t): t is number => t !== null);
    const abnormalTemperatureCount = temperatures.filter(t => t > 37.3).length;
    const avgTemperature = temperatures.length > 0
      ? Number((temperatures.reduce((sum, t) => sum + t, 0) / temperatures.length).toFixed(1))
      : null;

    await AttendanceStatistics.create({
      statType: StatType.KINDERGARTEN,
      statPeriod: StatPeriod.DAILY,
      kindergartenId,
      statDate,
      year: statDate.getFullYear(),
      month: statDate.getMonth() + 1,
      day: statDate.getDate(),
      totalDays,
      presentDays,
      absentDays,
      lateCount,
      earlyLeaveCount,
      sickLeaveDays,
      personalLeaveDays,
      excusedDays,
      attendanceRate: attendances.length > 0
        ? Number(((presentDays / attendances.length) * 100).toFixed(2))
        : 0,
      punctualityRate: presentDays > 0
        ? Number((((presentDays - lateCount) / presentDays) * 100).toFixed(2))
        : 0,
      abnormalTemperatureCount,
      avgTemperature
    } as any);
  }

  /**
   * 计算班级统计
   */
  private static async calculateClassStats(classId: number, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendances = await Attendance.findAll({
      where: {
        classId,
        attendanceDate: {
          $between: [startDate, endDate]
        }
      } as any
    });

    const presentDays = attendances.filter(a => a.status === AttendanceStatus.PRESENT).length;
    const absentDays = attendances.filter(a => a.status === AttendanceStatus.ABSENT).length;
    const lateCount = attendances.filter(a => a.status === AttendanceStatus.LATE).length;
    const earlyLeaveCount = attendances.filter(a => a.status === AttendanceStatus.EARLY_LEAVE).length;
    const sickLeaveDays = attendances.filter(a => a.status === AttendanceStatus.SICK_LEAVE).length;
    const personalLeaveDays = attendances.filter(a => a.status === AttendanceStatus.PERSONAL_LEAVE).length;
    const excusedDays = attendances.filter(a => a.status === AttendanceStatus.EXCUSED).length;

    const temperatures = attendances
      .map(a => a.temperature)
      .filter((t): t is number => t !== null);
    const abnormalTemperatureCount = temperatures.filter(t => t > 37.3).length;
    const avgTemperature = temperatures.length > 0
      ? Number((temperatures.reduce((sum, t) => sum + t, 0) / temperatures.length).toFixed(1))
      : null;

    return {
      presentDays,
      absentDays,
      lateCount,
      earlyLeaveCount,
      sickLeaveDays,
      personalLeaveDays,
      excusedDays,
      abnormalTemperatureCount,
      avgTemperature
    };
  }

  /**
   * 计算学生统计
   */
  private static async calculateStudentStats(studentId: number, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendances = await Attendance.findAll({
      where: {
        studentId,
        attendanceDate: {
          $between: [startDate, endDate]
        }
      } as any
    });

    const presentDays = attendances.filter(a => a.status === AttendanceStatus.PRESENT).length;
    const absentDays = attendances.filter(a => a.status === AttendanceStatus.ABSENT).length;
    const lateCount = attendances.filter(a => a.status === AttendanceStatus.LATE).length;
    const earlyLeaveCount = attendances.filter(a => a.status === AttendanceStatus.EARLY_LEAVE).length;
    const sickLeaveDays = attendances.filter(a => a.status === AttendanceStatus.SICK_LEAVE).length;
    const personalLeaveDays = attendances.filter(a => a.status === AttendanceStatus.PERSONAL_LEAVE).length;
    const excusedDays = attendances.filter(a => a.status === AttendanceStatus.EXCUSED).length;

    const temperatures = attendances
      .map(a => a.temperature)
      .filter((t): t is number => t !== null);
    const abnormalTemperatureCount = temperatures.filter(t => t > 37.3).length;
    const avgTemperature = temperatures.length > 0
      ? Number((temperatures.reduce((sum, t) => sum + t, 0) / temperatures.length).toFixed(1))
      : null;

    return {
      presentDays,
      absentDays,
      lateCount,
      earlyLeaveCount,
      sickLeaveDays,
      personalLeaveDays,
      excusedDays,
      abnormalTemperatureCount,
      avgTemperature
    };
  }

  /**
   * 清空考勤中心数据
   */
  public static async clear() {
    try {
      console.log('🗑️  开始清空考勤中心数据...');

      await AttendanceChangeLog.destroy({ where: {}, truncate: true });
      await AttendanceStatistics.destroy({ where: {}, truncate: true });
      await Attendance.destroy({ where: {}, truncate: true });

      console.log('✅ 考勤中心数据已清空');
    } catch (error) {
      console.error('❌ 清空考勤中心数据失败:', error);
      throw error;
    }
  }
}

// 如果直接运行此文件
if (require.main === module) {
  (async () => {
    try {
      // 使用init.ts中已经初始化的数据库连接
      await require('../init').default;
      console.log('✅ 数据库连接成功');
      await AttendanceCenterSeeder.seed();
      console.log('✅ 考勤中心种子数据生成完成');
      process.exit(0);
    } catch (error) {
      console.error('❌ 错误:', error);
      process.exit(1);
    }
  })();
}
