/**
 * 考勤管理服务
 * 处理与考勤相关的业务逻辑
 */
import {
  Attendance,
  AttendanceStatus,
  HealthStatus,
  AttendanceChangeLog,
  ChangeType,
  Student,
  Class,
  Kindergarten,
  User,
} from '../../models';
import type { Attendance as AttendanceType } from '../../models/attendance.model';
import { ApiError } from '../../utils/apiError';
import { Op, Transaction } from 'sequelize';
import { sequelize } from '../../init';

/**
 * 创建考勤记录DTO
 */
export interface CreateAttendanceDto {
  studentId: number;
  classId: number;
  kindergartenId: number;
  attendanceDate: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  temperature?: number;
  healthStatus?: HealthStatus;
  notes?: string;
  leaveReason?: string;
}

/**
 * 批量创建考勤记录DTO
 */
export interface BatchCreateAttendanceDto {
  classId: number;
  kindergartenId: number;
  attendanceDate: string;
  records: Array<{
    studentId: number;
    status: AttendanceStatus;
    checkInTime?: string;
    checkOutTime?: string;
    temperature?: number;
    healthStatus?: HealthStatus;
    notes?: string;
    leaveReason?: string;
  }>;
}

/**
 * 更新考勤记录DTO
 */
export interface UpdateAttendanceDto {
  status?: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  temperature?: number;
  healthStatus?: HealthStatus;
  notes?: string;
  leaveReason?: string;
  changeReason?: string;
}

/**
 * 查询考勤记录参数
 */
export interface QueryAttendanceParams {
  classId?: number;
  studentId?: number;
  kindergartenId?: number;
  startDate?: string;
  endDate?: string;
  status?: AttendanceStatus;
  page?: number;
  pageSize?: number;
}

export class AttendanceService {
  /**
   * 创建考勤记录
   */
  public async createAttendance(
    dto: CreateAttendanceDto,
    recordedBy: number
  ): Promise<AttendanceType> {
    return sequelize.transaction(async (transaction: Transaction) => {
      // 验证学生是否存在
      const student = await Student.findByPk(dto.studentId, { transaction });
      if (!student) {
        throw ApiError.notFound('学生不存在');
      }

      // 验证班级是否存在
      const classExists = await Class.findByPk(dto.classId, { transaction });
      if (!classExists) {
        throw ApiError.notFound('班级不存在');
      }

      // 验证幼儿园是否存在
      const kindergarten = await Kindergarten.findByPk(dto.kindergartenId, {
        transaction,
      });
      if (!kindergarten) {
        throw ApiError.notFound('幼儿园不存在');
      }

      // 检查是否已存在该学生当天的考勤记录
      const existingRecord = await Attendance.findOne({
        where: {
          studentId: dto.studentId,
          attendanceDate: dto.attendanceDate,
        },
        transaction,
      });

      if (existingRecord) {
        throw ApiError.badRequest('该学生当天的考勤记录已存在');
      }

      // 创建考勤记录
      const attendance = await Attendance.create(
        {
          ...dto,
          attendanceDate: new Date(dto.attendanceDate),
          recordedBy,
          recordedAt: new Date(),
        },
        { transaction }
      );

      // 记录修改日志
      await AttendanceChangeLog.create(
        {
          attendanceId: attendance.id,
          changeType: ChangeType.CREATE,
          newStatus: dto.status,
          newData: attendance.toJSON(),
          changedBy: recordedBy,
          changedAt: new Date(),
        },
        { transaction }
      );

      return attendance;
    });
  }

  /**
   * 批量创建考勤记录
   */
  public async batchCreateAttendance(
    dto: BatchCreateAttendanceDto,
    recordedBy: number
  ): Promise<AttendanceType[]> {
    return sequelize.transaction(async (transaction: Transaction) => {
      // 验证班级是否存在
      const classExists = await Class.findByPk(dto.classId, { transaction });
      if (!classExists) {
        throw ApiError.notFound('班级不存在');
      }

      // 验证幼儿园是否存在
      const kindergarten = await Kindergarten.findByPk(dto.kindergartenId, {
        transaction,
      });
      if (!kindergarten) {
        throw ApiError.notFound('幼儿园不存在');
      }

      const attendances: AttendanceType[] = [];

      for (const record of dto.records) {
        // 验证学生是否存在
        const student = await Student.findByPk(record.studentId, {
          transaction,
        });
        if (!student) {
          throw ApiError.notFound(`学生ID ${record.studentId} 不存在`);
        }

        // 检查是否已存在该学生当天的考勤记录
        const existingRecord = await Attendance.findOne({
          where: {
            studentId: record.studentId,
            attendanceDate: dto.attendanceDate,
          },
          transaction,
        });

        if (existingRecord) {
          // 如果已存在，跳过该记录
          continue;
        }

        // 创建考勤记录
        const attendance = await Attendance.create(
          {
            studentId: record.studentId,
            classId: dto.classId,
            kindergartenId: dto.kindergartenId,
            attendanceDate: new Date(dto.attendanceDate),
            status: record.status,
            checkInTime: record.checkInTime,
            checkOutTime: record.checkOutTime,
            temperature: record.temperature,
            healthStatus: record.healthStatus || HealthStatus.NORMAL,
            notes: record.notes,
            leaveReason: record.leaveReason,
            recordedBy,
            recordedAt: new Date(),
          },
          { transaction }
        );

        // 记录修改日志
        await AttendanceChangeLog.create(
          {
            attendanceId: attendance.id,
            changeType: ChangeType.CREATE,
            newStatus: record.status,
            newData: attendance.toJSON(),
            changedBy: recordedBy,
            changedAt: new Date(),
          },
          { transaction }
        );

        attendances.push(attendance);
      }

      return attendances;
    });
  }

  /**
   * 更新考勤记录
   */
  public async updateAttendance(
    id: number,
    dto: UpdateAttendanceDto,
    updatedBy: number
  ): Promise<AttendanceType> {
    return sequelize.transaction(async (transaction: Transaction) => {
      const attendance = await Attendance.findByPk(id, { transaction });
      if (!attendance) {
        throw ApiError.notFound('考勤记录不存在');
      }

      // 保存修改前的数据
      const oldData = attendance.toJSON();
      const oldStatus = attendance.status;

      // 更新考勤记录
      await attendance.update(
        {
          ...dto,
          updatedBy,
          updatedAt: new Date(),
        },
        { transaction }
      );

      // 记录修改日志
      await AttendanceChangeLog.create(
        {
          attendanceId: attendance.id,
          changeType: ChangeType.UPDATE,
          oldStatus,
          newStatus: dto.status || oldStatus,
          oldData,
          newData: attendance.toJSON(),
          changedBy: updatedBy,
          changedAt: new Date(),
          changeReason: dto.changeReason,
        },
        { transaction }
      );

      return attendance;
    });
  }

  /**
   * 删除考勤记录（软删除）
   */
  public async deleteAttendance(
    id: number,
    deletedBy: number
  ): Promise<void> {
    return sequelize.transaction(async (transaction: Transaction) => {
      const attendance = await Attendance.findByPk(id, { transaction });
      if (!attendance) {
        throw ApiError.notFound('考勤记录不存在');
      }

      // 保存删除前的数据
      const oldData = attendance.toJSON();

      // 软删除
      await attendance.destroy({ transaction });

      // 记录修改日志
      await AttendanceChangeLog.create(
        {
          attendanceId: attendance.id,
          changeType: ChangeType.DELETE,
          oldStatus: attendance.status,
          oldData,
          changedBy: deletedBy,
          changedAt: new Date(),
        },
        { transaction }
      );
    });
  }

  /**
   * 获取考勤记录详情
   */
  public async getAttendanceById(id: number): Promise<AttendanceType> {
    const attendance = await Attendance.findByPk(id, {
      include: [
        { model: Student, as: 'student' },
        { model: Class, as: 'class' },
        { model: Kindergarten, as: 'kindergarten' },
        { model: User, as: 'recorder' },
        { model: User, as: 'updater' },
      ],
    });

    if (!attendance) {
      throw ApiError.notFound('考勤记录不存在');
    }

    return attendance;
  }

  /**
   * 查询考勤记录列表
   */
  public async queryAttendances(
    params: QueryAttendanceParams
  ): Promise<{ rows: AttendanceType[]; count: number }> {
    const {
      classId,
      studentId,
      kindergartenId,
      startDate,
      endDate,
      status,
      page = 1,
      pageSize = 20,
    } = params;

    const where: any = {};

    if (classId) {
      where.classId = classId;
    }

    if (studentId) {
      where.studentId = studentId;
    }

    if (kindergartenId) {
      where.kindergartenId = kindergartenId;
    }

    // 日期过滤 - 只有当日期参数有效时才添加
    if (startDate && endDate) {
      where.attendanceDate = {
        [Op.between]: [startDate, endDate],
      };
    } else if (startDate) {
      where.attendanceDate = {
        [Op.gte]: startDate,
      };
    } else if (endDate) {
      where.attendanceDate = {
        [Op.lte]: endDate,
      };
    }

    if (status) {
      where.status = status;
    }

    const { rows, count } = await Attendance.findAndCountAll({
      where,
      include: [
        {
          model: Student,
          as: 'student',
          required: false,
          attributes: ['id', 'name']
        },
        {
          model: Class,
          as: 'class',
          required: false,
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'recorder',
          required: false,
          attributes: ['id', 'username']
        },
      ],
      order: [['attendanceDate', 'DESC'], ['createdAt', 'DESC']],
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    return { rows, count };
  }
}

