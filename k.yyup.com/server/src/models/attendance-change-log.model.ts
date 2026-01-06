import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from 'sequelize';
import { Attendance } from './attendance.model';
import { User } from './user.model';

/**
 * 修改类型枚举
 */
export enum ChangeType {
  CREATE = 'create', // 创建
  UPDATE = 'update', // 更新
  DELETE = 'delete', // 删除
  RESET = 'reset',   // 重置
}

/**
 * 考勤修改日志模型
 */
export class AttendanceChangeLog extends Model<
  InferAttributes<AttendanceChangeLog>,
  InferCreationAttributes<AttendanceChangeLog>
> {
  // 主键
  declare id: CreationOptional<number>;

  // 关联字段
  declare attendanceId: ForeignKey<Attendance['id']>;

  // 修改信息
  declare changeType: ChangeType;
  declare oldStatus: string | null;
  declare newStatus: string | null;
  declare oldData: object | null;
  declare newData: object | null;

  // 操作信息
  declare changedBy: ForeignKey<User['id']>;
  declare changedAt: CreationOptional<Date>;
  declare changeReason: string | null;

  // 审核信息
  declare requiresApproval: CreationOptional<boolean>;
  declare isApproved: boolean | null;
  declare approvedBy: ForeignKey<User['id']> | null;
  declare approvedAt: Date | null;

  // 时间戳
  declare readonly createdAt: CreationOptional<Date>;

  // 关联
  public readonly attendance?: Attendance;
  public readonly changer?: User;
  public readonly approver?: User;
}

/**
 * 初始化考勤修改日志模型
 */
export function initAttendanceChangeLogModel(
  sequelize: Sequelize
): typeof AttendanceChangeLog {
  AttendanceChangeLog.init(
    {
      // 主键
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '日志ID',
      },

      // 关联字段
      attendanceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'attendance_id',
        comment: '考勤记录ID',
      },

      // 修改信息
      changeType: {
        type: DataTypes.ENUM('create', 'update', 'delete', 'reset'),
        allowNull: false,
        field: 'change_type',
        comment: '修改类型',
      },
      oldStatus: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'old_status',
        comment: '修改前状态',
      },
      newStatus: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'new_status',
        comment: '修改后状态',
      },
      oldData: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'old_data',
        comment: '修改前完整数据',
      },
      newData: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'new_data',
        comment: '修改后完整数据',
      },

      // 操作信息
      changedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'changed_by',
        comment: '修改人ID',
      },
      changedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'changed_at',
        comment: '修改时间',
      },
      changeReason: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'change_reason',
        comment: '修改原因',
      },

      // 审核信息
      requiresApproval: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'requires_approval',
        comment: '是否需要审核',
      },
      isApproved: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
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
      tableName: 'attendance_change_logs',
      timestamps: false,
      underscored: true,
      comment: '考勤修改日志表',
      indexes: [
        {
          name: 'idx_attendance',
          fields: ['attendance_id'],
        },
        {
          name: 'idx_changed_by',
          fields: ['changed_by'],
        },
        {
          name: 'idx_changed_at',
          fields: ['changed_at'],
        },
      ],
    }
  );

  return AttendanceChangeLog;
}

/**
 * 定义考勤修改日志模型关联
 * 注意：必须在所有模型初始化完成后调用
 */
export function associateAttendanceChangeLog(): void {
  // 动态导入模型实例，避免循环依赖
  const models = require('./index');

  // 考勤记录关联
  AttendanceChangeLog.belongsTo(models.Attendance, {
    foreignKey: 'attendanceId',
    as: 'attendance',
  });

  // 修改人关联
  AttendanceChangeLog.belongsTo(models.User, {
    foreignKey: 'changedBy',
    as: 'changer',
  });

  // 审核人关联
  AttendanceChangeLog.belongsTo(models.User, {
    foreignKey: 'approvedBy',
    as: 'approver',
  });
}

