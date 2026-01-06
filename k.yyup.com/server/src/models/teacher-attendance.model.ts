import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from 'sequelize';
import { Teacher } from './teacher.model';
import { User } from './user.model';
import { Kindergarten } from './kindergarten.model';

/**
 * 教师考勤状态枚举
 */
export enum TeacherAttendanceStatus {
  PRESENT = 'present',           // 出勤
  ABSENT = 'absent',             // 缺勤
  LATE = 'late',                 // 迟到
  EARLY_LEAVE = 'early_leave',   // 早退
  LEAVE = 'leave',               // 请假
}

/**
 * 请假类型枚举
 */
export enum LeaveType {
  SICK = 'sick',           // 病假
  PERSONAL = 'personal',   // 事假
  ANNUAL = 'annual',       // 年假
  MATERNITY = 'maternity', // 产假
  OTHER = 'other',         // 其他
}

/**
 * 教师考勤记录模型
 */
export class TeacherAttendance extends Model<
  InferAttributes<TeacherAttendance>,
  InferCreationAttributes<TeacherAttendance>
> {
  // 主键
  declare id: CreationOptional<number>;

  // 关联字段
  declare teacherId: ForeignKey<Teacher['id']>;
  declare userId: ForeignKey<User['id']>;
  declare kindergartenId: ForeignKey<Kindergarten['id']>;

  // 考勤信息
  declare attendanceDate: Date;
  declare status: TeacherAttendanceStatus;

  // 时间记录
  declare checkInTime: string | null;
  declare checkOutTime: string | null;
  declare workDuration: number | null; // 工作时长（分钟）

  // 请假信息
  declare leaveType: LeaveType | null;
  declare leaveReason: string | null;
  declare leaveStartTime: Date | null;
  declare leaveEndTime: Date | null;

  // 备注信息
  declare notes: string | null;

  // 操作信息
  declare recordedBy: ForeignKey<User['id']> | null;
  declare recordedAt: CreationOptional<Date>;
  declare updatedBy: ForeignKey<User['id']> | null;
  declare updatedAt: CreationOptional<Date>;

  // 审核信息
  declare isApproved: CreationOptional<boolean>;
  declare approvedBy: ForeignKey<User['id']> | null;
  declare approvedAt: Date | null;
  declare approvalNotes: string | null;

  // 软删除
  declare deletedAt: CreationOptional<Date | null>;

  // 时间戳
  declare readonly createdAt: CreationOptional<Date>;

  // 关联
  public readonly teacher?: Teacher;
  public readonly user?: User;
  public readonly kindergarten?: Kindergarten;
  public readonly recorder?: User;
  public readonly updater?: User;
  public readonly approver?: User;
}

/**
 * 初始化教师考勤记录模型
 */
export function initTeacherAttendanceModel(sequelize: Sequelize): typeof TeacherAttendance {
  TeacherAttendance.init(
    {
      // 主键
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '教师考勤记录ID',
      },

      // 关联字段
      teacherId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'teacher_id',
        comment: '教师ID',
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        comment: '用户ID',
      },
      kindergartenId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'kindergarten_id',
        comment: '幼儿园ID',
      },

      // 考勤信息
      attendanceDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'attendance_date',
        comment: '考勤日期',
      },
      status: {
        type: DataTypes.ENUM(
          'present',
          'absent',
          'late',
          'early_leave',
          'leave'
        ),
        allowNull: false,
        defaultValue: 'present',
        comment: '考勤状态',
      },

      // 时间记录
      checkInTime: {
        type: DataTypes.TIME,
        allowNull: true,
        field: 'check_in_time',
        comment: '签到时间',
      },
      checkOutTime: {
        type: DataTypes.TIME,
        allowNull: true,
        field: 'check_out_time',
        comment: '签退时间',
      },
      workDuration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'work_duration',
        comment: '工作时长（分钟）',
      },

      // 请假信息
      leaveType: {
        type: DataTypes.ENUM(
          'sick',
          'personal',
          'annual',
          'maternity',
          'other'
        ),
        allowNull: true,
        field: 'leave_type',
        comment: '请假类型',
      },
      leaveReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'leave_reason',
        comment: '请假原因',
      },
      leaveStartTime: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'leave_start_time',
        comment: '请假开始时间',
      },
      leaveEndTime: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'leave_end_time',
        comment: '请假结束时间',
      },

      // 备注信息
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '备注说明',
      },

      // 操作信息
      recordedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'recorded_by',
        comment: '记录人ID（自己打卡时为空）',
      },
      recordedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'recorded_at',
        comment: '记录时间',
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'updated_by',
        comment: '最后修改人ID',
      },

      // 审核信息
      isApproved: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_approved',
        comment: '是否已审核（打卡默认通过，请假需要审核）',
      },
      approvedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'approved_by',
        comment: '审核人ID',
      },
      approvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'approved_at',
        comment: '审核时间',
      },
      approvalNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'approval_notes',
        comment: '审核备注',
      },

      // 软删除
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'deleted_at',
        comment: '删除时间',
      },

      // 时间戳
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
        comment: '创建时间',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
        comment: '更新时间',
      },
    },
    {
      sequelize,
      tableName: 'teacher_attendances',
      timestamps: true,
      paranoid: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      comment: '教师考勤记录表',
      indexes: [
        {
          name: 'idx_teacher_date',
          fields: ['teacher_id', 'attendance_date'],
        },
        {
          name: 'idx_user_date',
          fields: ['user_id', 'attendance_date'],
        },
        {
          name: 'idx_kindergarten_date',
          fields: ['kindergarten_id', 'attendance_date'],
        },
        {
          name: 'idx_status',
          fields: ['status'],
        },
        {
          name: 'idx_date',
          fields: ['attendance_date'],
        },
        {
          name: 'uk_teacher_date',
          unique: true,
          fields: ['teacher_id', 'attendance_date'],
        },
      ],
    }
  );

  return TeacherAttendance;
}

