import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from 'sequelize';
import { Student } from './student.model';
import { Class } from './class.model';
import { Kindergarten } from './kindergarten.model';
import { User } from './user.model';

/**
 * 考勤状态枚举
 */
export enum AttendanceStatus {
  PRESENT = 'present',           // 出勤
  ABSENT = 'absent',             // 缺勤
  LATE = 'late',                 // 迟到
  EARLY_LEAVE = 'early_leave',   // 早退
  SICK_LEAVE = 'sick_leave',     // 病假
  PERSONAL_LEAVE = 'personal_leave', // 事假
  EXCUSED = 'excused',           // 请假（已批准）
}

/**
 * 健康状态枚举
 */
export enum HealthStatus {
  NORMAL = 'normal',       // 正常
  ABNORMAL = 'abnormal',   // 异常
  QUARANTINE = 'quarantine', // 隔离
}

/**
 * 学生考勤记录模型
 */
export class Attendance extends Model<
  InferAttributes<Attendance>,
  InferCreationAttributes<Attendance>
> {
  // 主键
  declare id: CreationOptional<number>;

  // 关联字段
  declare studentId: ForeignKey<Student['id']>;
  declare classId: ForeignKey<Class['id']>;
  declare kindergartenId: ForeignKey<Kindergarten['id']>;

  // 考勤信息
  declare attendanceDate: Date;
  declare status: AttendanceStatus;

  // 时间记录
  declare checkInTime: string | null;
  declare checkOutTime: string | null;

  // 健康信息
  declare temperature: number | null;
  declare healthStatus: CreationOptional<HealthStatus>;

  // 备注信息
  declare notes: string | null;
  declare leaveReason: string | null;

  // 操作信息
  declare recordedBy: ForeignKey<User['id']>;
  declare recordedAt: CreationOptional<Date>;
  declare updatedBy: ForeignKey<User['id']> | null;
  declare updatedAt: CreationOptional<Date>;

  // 审核信息
  declare isApproved: CreationOptional<boolean>;
  declare approvedBy: ForeignKey<User['id']> | null;
  declare approvedAt: Date | null;

  // 软删除
  declare deletedAt: CreationOptional<Date | null>;

  // 时间戳
  declare readonly createdAt: CreationOptional<Date>;

  // 关联
  public readonly student?: Student;
  public readonly class?: Class;
  public readonly kindergarten?: Kindergarten;
  public readonly recorder?: User;
  public readonly updater?: User;
  public readonly approver?: User;
}

/**
 * 初始化考勤记录模型
 */
export function initAttendanceModel(sequelize: Sequelize): typeof Attendance {
  Attendance.init(
    {
      // 主键
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '考勤记录ID',
      },

      // 关联字段
      studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'student_id',
        comment: '学生ID',
      },
      classId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'class_id',
        comment: '班级ID',
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
          'sick_leave',
          'personal_leave',
          'excused'
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

      // 健康信息
      temperature: {
        type: DataTypes.DECIMAL(3, 1),
        allowNull: true,
        comment: '体温（℃）',
      },
      healthStatus: {
        type: DataTypes.ENUM('normal', 'abnormal', 'quarantine'),
        allowNull: false,
        defaultValue: 'normal',
        field: 'health_status',
        comment: '健康状态',
      },

      // 备注信息
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '备注说明',
      },
      leaveReason: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'leave_reason',
        comment: '请假原因',
      },

      // 操作信息
      recordedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'recorded_by',
        comment: '记录人ID',
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
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
        comment: '最后修改时间',
      },

      // 审核信息
      isApproved: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_approved',
        comment: '是否已审核',
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
    },
    {
      sequelize,
      tableName: 'attendances',
      timestamps: true,
      paranoid: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      comment: '学生考勤记录表',
      indexes: [
        {
          name: 'idx_student_date',
          fields: ['student_id', 'attendance_date'],
        },
        {
          name: 'idx_class_date',
          fields: ['class_id', 'attendance_date'],
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
          name: 'uk_student_date',
          unique: true,
          fields: ['student_id', 'attendance_date'],
        },
      ],
    }
  );

  return Attendance;
}

/**
 * 定义考勤记录模型关联
 * 注意：必须在所有模型初始化完成后调用
 */
export function associateAttendance(): void {
  // 动态导入模型实例，避免循环依赖
  const models = require('./index');

  // 学生关联 (多对一)
  Attendance.belongsTo(models.Student, {
    foreignKey: 'studentId',
    as: 'student',
  });

  // 学生反向关联 (一对多) - 一个学生有多条考勤记录
  models.Student.hasMany(Attendance, {
    foreignKey: 'studentId',
    as: 'attendances',
  });

  // 班级关联
  Attendance.belongsTo(models.Class, {
    foreignKey: 'classId',
    as: 'class',
  });

  // 幼儿园关联
  Attendance.belongsTo(models.Kindergarten, {
    foreignKey: 'kindergartenId',
    as: 'kindergarten',
  });

  // 记录人关联
  Attendance.belongsTo(models.User, {
    foreignKey: 'recordedBy',
    as: 'recorder',
  });

  // 修改人关联
  Attendance.belongsTo(models.User, {
    foreignKey: 'updatedBy',
    as: 'updater',
  });

  // 审核人关联
  Attendance.belongsTo(models.User, {
    foreignKey: 'approvedBy',
    as: 'approver',
  });
}

