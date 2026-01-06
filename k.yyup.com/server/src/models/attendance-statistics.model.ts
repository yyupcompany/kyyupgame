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

/**
 * 统计类型枚举
 */
export enum StatType {
  STUDENT = 'student',           // 学生维度
  CLASS = 'class',               // 班级维度
  KINDERGARTEN = 'kindergarten', // 幼儿园维度
}

/**
 * 统计周期枚举
 */
export enum StatPeriod {
  DAILY = 'daily',         // 日统计
  WEEKLY = 'weekly',       // 周统计
  MONTHLY = 'monthly',     // 月统计
  QUARTERLY = 'quarterly', // 季度统计
  YEARLY = 'yearly',       // 年度统计
}

/**
 * 考勤统计模型
 */
export class AttendanceStatistics extends Model<
  InferAttributes<AttendanceStatistics>,
  InferCreationAttributes<AttendanceStatistics>
> {
  // 主键
  declare id: CreationOptional<number>;

  // 统计维度
  declare statType: StatType;
  declare statPeriod: StatPeriod;

  // 关联字段
  declare studentId: ForeignKey<Student['id']> | null;
  declare classId: ForeignKey<Class['id']> | null;
  declare kindergartenId: ForeignKey<Kindergarten['id']>;

  // 时间字段
  declare statDate: Date;
  declare year: number;
  declare quarter: number | null;
  declare month: number | null;
  declare week: number | null;

  // 统计数据
  declare totalDays: CreationOptional<number>;
  declare presentDays: CreationOptional<number>;
  declare absentDays: CreationOptional<number>;
  declare lateCount: CreationOptional<number>;
  declare earlyLeaveCount: CreationOptional<number>;
  declare sickLeaveDays: CreationOptional<number>;
  declare personalLeaveDays: CreationOptional<number>;
  declare excusedDays: CreationOptional<number>;

  // 计算字段
  declare attendanceRate: number | null;
  declare punctualityRate: number | null;

  // 健康统计
  declare abnormalTemperatureCount: CreationOptional<number>;
  declare avgTemperature: number | null;

  // 时间戳
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  // 关联
  public readonly student?: Student;
  public readonly class?: Class;
  public readonly kindergarten?: Kindergarten;
}

/**
 * 初始化考勤统计模型
 */
export function initAttendanceStatisticsModel(
  sequelize: Sequelize
): typeof AttendanceStatistics {
  AttendanceStatistics.init(
    {
      // 主键
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '统计ID',
      },

      // 统计维度
      statType: {
        type: DataTypes.ENUM('student', 'class', 'kindergarten'),
        allowNull: false,
        field: 'stat_type',
        comment: '统计类型',
      },
      statPeriod: {
        type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly'),
        allowNull: false,
        field: 'stat_period',
        comment: '统计周期',
      },

      // 关联字段
      studentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'student_id',
        comment: '学生ID（学生维度）',
      },
      classId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'class_id',
        comment: '班级ID（班级维度）',
      },
      kindergartenId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'kindergarten_id',
        comment: '幼儿园ID',
      },

      // 时间字段
      statDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'stat_date',
        comment: '统计日期',
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '年份',
      },
      quarter: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '季度（1-4）',
      },
      month: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '月份（1-12）',
      },
      week: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '周数',
      },

      // 统计数据
      totalDays: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'total_days',
        comment: '总天数',
      },
      presentDays: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'present_days',
        comment: '出勤天数',
      },
      absentDays: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'absent_days',
        comment: '缺勤天数',
      },
      lateCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'late_count',
        comment: '迟到次数',
      },
      earlyLeaveCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'early_leave_count',
        comment: '早退次数',
      },
      sickLeaveDays: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'sick_leave_days',
        comment: '病假天数',
      },
      personalLeaveDays: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'personal_leave_days',
        comment: '事假天数',
      },
      excusedDays: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'excused_days',
        comment: '请假天数',
      },

      // 计算字段
      attendanceRate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        field: 'attendance_rate',
        comment: '出勤率（%）',
      },
      punctualityRate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        field: 'punctuality_rate',
        comment: '准时率（%）',
      },

      // 健康统计
      abnormalTemperatureCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'abnormal_temperature_count',
        comment: '体温异常次数',
      },
      avgTemperature: {
        type: DataTypes.DECIMAL(3, 1),
        allowNull: true,
        field: 'avg_temperature',
        comment: '平均体温',
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
      tableName: 'attendance_statistics',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      comment: '考勤统计表',
      indexes: [
        {
          name: 'idx_type_period',
          fields: ['stat_type', 'stat_period'],
        },
        {
          name: 'idx_student_date_stats',
          fields: ['student_id', 'stat_date'],
        },
        {
          name: 'idx_class_date_stats',
          fields: ['class_id', 'stat_date'],
        },
        {
          name: 'idx_kindergarten_date_stats',
          fields: ['kindergarten_id', 'stat_date'],
        },
        {
          name: 'idx_year_month',
          fields: ['year', 'month'],
        },
      ],
    }
  );

  return AttendanceStatistics;
}

/**
 * 定义考勤统计模型关联
 * 注意：必须在所有模型初始化完成后调用
 */
export function associateAttendanceStatistics(): void {
  // 动态导入模型实例，避免循环依赖
  const models = require('./index');

  // 学生关联
  AttendanceStatistics.belongsTo(models.Student, {
    foreignKey: 'studentId',
    as: 'student',
  });

  // 班级关联
  AttendanceStatistics.belongsTo(models.Class, {
    foreignKey: 'classId',
    as: 'class',
  });

  // 幼儿园关联
  AttendanceStatistics.belongsTo(models.Kindergarten, {
    foreignKey: 'kindergartenId',
    as: 'kindergarten',
  });
}

