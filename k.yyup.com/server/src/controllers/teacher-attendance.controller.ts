import { Request, Response } from 'express';
import { AttendanceService } from '../services/attendance';
import { Teacher } from '../models/teacher.model';
import { Class } from '../models/class.model';
import { ClassTeacher } from '../models/class-teacher.model';
import { Student } from '../models/student.model';
import { ApiError } from '../utils/apiError';

/**
 * 教师考勤控制器
 * 处理教师端考勤相关的HTTP请求
 */
export class TeacherAttendanceController {
  private static attendanceService = new AttendanceService();

  /**
   * 获取教师负责的班级列表
   * GET /api/teacher/attendance/classes
   */
  public static async getTeacherClasses(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证',
        });
      }

      // 通过用户ID查找教师记录
      const teacher = await Teacher.findOne({
        where: { userId },
      });

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: '教师信息不存在',
        });
      }

      // 查找教师负责的班级
      const classTeachers = await ClassTeacher.findAll({
        where: { teacherId: teacher.id },
        include: [
          {
            model: Class,
            as: 'class',
            include: [
              {
                model: Student,
                as: 'students',
                attributes: ['id', 'name', 'studentNo'],
              },
            ],
          },
        ],
      });

      const classes = classTeachers.map((ct) => ({
        id: ct.class?.id,
        name: ct.class?.name,
        grade: ct.class?.grade,
        studentCount: ct.class?.students?.length || 0,
        role: ct.role,
      }));

      res.json({
        success: true,
        data: classes,
      });
    } catch (error) {
      console.error('获取教师班级列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取班级列表失败',
        error: error instanceof Error ? error.message : '未知错误',
      });
    }
  }

  /**
   * 获取班级学生列表
   * GET /api/teacher/attendance/students/:classId
   */
  public static async getClassStudents(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { classId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证',
        });
      }

      // 通过用户ID查找教师记录
      const teacher = await Teacher.findOne({
        where: { userId },
      });

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: '教师信息不存在',
        });
      }

      // 验证教师是否负责该班级
      const classTeacher = await ClassTeacher.findOne({
        where: {
          teacherId: teacher.id,
          classId: parseInt(classId),
        },
      });

      if (!classTeacher) {
        return res.status(403).json({
          success: false,
          message: '您没有权限访问该班级',
        });
      }

      // 获取班级学生列表
      const students = await Student.findAll({
        where: { classId: parseInt(classId) },
        attributes: ['id', 'name', 'studentNo', 'gender', 'photoUrl'],
        order: [['studentNo', 'ASC']],
      });

      res.json({
        success: true,
        data: students,
      });
    } catch (error) {
      console.error('获取班级学生列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取学生列表失败',
        error: error instanceof Error ? error.message : '未知错误',
      });
    }
  }

  /**
   * 获取考勤记录
   * GET /api/teacher/attendance/records
   */
  public static async getAttendanceRecords(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { classId, studentId, startDate, endDate, status, page, pageSize } =
        req.query;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证',
        });
      }

      // 通过用户ID查找教师记录
      const teacher = await Teacher.findOne({
        where: { userId },
      });

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: '教师信息不存在',
        });
      }

      // 如果指定了班级ID，验证教师是否负责该班级
      if (classId) {
        const classTeacher = await ClassTeacher.findOne({
          where: {
            teacherId: teacher.id,
            classId: parseInt(classId as string),
          },
        });

        if (!classTeacher) {
          return res.status(403).json({
            success: false,
            message: '您没有权限访问该班级的考勤记录',
          });
        }
      }

      // 查询考勤记录
      const result = await TeacherAttendanceController.attendanceService.queryAttendances({
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
   * 创建考勤记录（批量）
   * POST /api/teacher/attendance/records
   */
  public static async createAttendanceRecords(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { classId, kindergartenId, attendanceDate, records } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证',
        });
      }

      // 通过用户ID查找教师记录
      const teacher = await Teacher.findOne({
        where: { userId },
      });

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: '教师信息不存在',
        });
      }

      // 验证教师是否负责该班级
      const classTeacher = await ClassTeacher.findOne({
        where: {
          teacherId: teacher.id,
          classId,
        },
      });

      if (!classTeacher) {
        return res.status(403).json({
          success: false,
          message: '您没有权限为该班级创建考勤记录',
        });
      }

      // 批量创建考勤记录
      const attendances = await TeacherAttendanceController.attendanceService.batchCreateAttendance(
        {
          classId,
          kindergartenId,
          attendanceDate,
          records,
        },
        userId
      );

      res.json({
        success: true,
        data: attendances,
        message: `成功创建 ${attendances.length} 条考勤记录`,
      });
    } catch (error) {
      console.error('创建考勤记录失败:', error);
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }
      res.status(500).json({
        success: false,
        message: '创建考勤记录失败',
        error: error instanceof Error ? error.message : '未知错误',
      });
    }
  }

  /**
   * 更新考勤记录（仅当天）
   * PUT /api/teacher/attendance/records/:id
   */
  public static async updateAttendanceRecord(req: Request, res: Response) {
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

      // 通过用户ID查找教师记录
      const teacher = await Teacher.findOne({
        where: { userId },
      });

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: '教师信息不存在',
        });
      }

      // 获取考勤记录
      const attendance = await TeacherAttendanceController.attendanceService.getAttendanceById(
        parseInt(id)
      );

      // 验证教师是否负责该班级
      const classTeacher = await ClassTeacher.findOne({
        where: {
          teacherId: teacher.id,
          classId: attendance.classId,
        },
      });

      if (!classTeacher) {
        return res.status(403).json({
          success: false,
          message: '您没有权限修改该考勤记录',
        });
      }

      // 验证是否是当天的记录（教师只能修改当天的记录）
      const today = new Date().toISOString().split('T')[0];
      const attendanceDate = new Date(attendance.attendanceDate)
        .toISOString()
        .split('T')[0];

      if (attendanceDate !== today) {
        return res.status(403).json({
          success: false,
          message: '教师只能修改当天的考勤记录',
        });
      }

      // 更新考勤记录
      const updatedAttendance = await TeacherAttendanceController.attendanceService.updateAttendance(
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
   * 获取本班统计数据
   * GET /api/teacher/attendance/statistics
   */
  public static async getStatistics(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { classId, startDate, endDate } = req.query;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证',
        });
      }

      // 通过用户ID查找教师记录
      const teacher = await Teacher.findOne({
        where: { userId },
      });

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: '教师信息不存在',
        });
      }

      // 如果指定了班级ID，验证教师是否负责该班级
      if (classId) {
        const classTeacher = await ClassTeacher.findOne({
          where: {
            teacherId: teacher.id,
            classId: parseInt(classId as string),
          },
        });

        if (!classTeacher) {
          return res.status(403).json({
            success: false,
            message: '您没有权限访问该班级的统计数据',
          });
        }
      }

      // 查询考勤记录进行统计
      const result = await TeacherAttendanceController.attendanceService.queryAttendances({
        classId: classId ? parseInt(classId as string) : undefined,
        startDate: startDate as string,
        endDate: endDate as string,
      });

      // 计算统计数据
      const totalRecords = result.count;
      const presentCount = result.rows.filter(
        (r) => r.status === 'present'
      ).length;
      const absentCount = result.rows.filter(
        (r) => r.status === 'absent'
      ).length;
      const lateCount = result.rows.filter((r) => r.status === 'late').length;
      const earlyLeaveCount = result.rows.filter(
        (r) => r.status === 'early_leave'
      ).length;
      const sickLeaveCount = result.rows.filter(
        (r) => r.status === 'sick_leave'
      ).length;
      const personalLeaveCount = result.rows.filter(
        (r) => r.status === 'personal_leave'
      ).length;
      const excusedCount = result.rows.filter(
        (r) => r.status === 'excused'
      ).length;

      const attendanceRate =
        totalRecords > 0
          ? ((presentCount / totalRecords) * 100).toFixed(2)
          : '0.00';

      res.json({
        success: true,
        data: {
          totalRecords,
          presentCount,
          absentCount,
          lateCount,
          earlyLeaveCount,
          sickLeaveCount,
          personalLeaveCount,
          excusedCount,
          attendanceRate: parseFloat(attendanceRate),
        },
      });
    } catch (error) {
      console.error('获取统计数据失败:', error);
      res.status(500).json({
        success: false,
        message: '获取统计数据失败',
        error: error instanceof Error ? error.message : '未知错误',
      });
    }
  }

  /**
   * 导出本班考勤报表
   * POST /api/teacher/attendance/export
   */
  public static async exportAttendance(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { classId, startDate, endDate, format = 'excel' } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证',
        });
      }

      // 通过用户ID查找教师记录
      const teacher = await Teacher.findOne({
        where: { userId },
      });

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: '教师信息不存在',
        });
      }

      // 验证教师是否负责该班级
      const classTeacher = await ClassTeacher.findOne({
        where: {
          teacherId: teacher.id,
          classId,
        },
      });

      if (!classTeacher) {
        return res.status(403).json({
          success: false,
          message: '您没有权限导出该班级的考勤报表',
        });
      }

      // 查询考勤记录
      const result = await TeacherAttendanceController.attendanceService.queryAttendances({
        classId,
        startDate,
        endDate,
        page: 1,
        pageSize: 10000, // 导出时获取所有记录
      });

      // TODO: 实现实际的导出逻辑（Excel/PDF）
      // 这里先返回数据，实际导出功能需要使用 exceljs 或 pdfkit 等库

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
}

