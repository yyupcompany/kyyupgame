import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from 'sequelize';
import { User } from './user.model';
import { Class } from './class.model';
import { Kindergarten } from './kindergarten.model';

/**
 * 教师审核状态
 */
export enum TeacherApprovalStatus {
  PENDING = 'pending',        // 待审核
  APPROVED = 'approved',      // 已审核通过
  REJECTED = 'rejected',      // 已拒绝
  SUSPENDED = 'suspended',    // 已暂停
}

/**
 * 教师审核范围
 */
export enum TeacherApprovalScope {
  BASIC = 'basic',            // 基础权限（查看界面）
  STUDENT_MANAGEMENT = 'student_management',  // 学生管理
  ATTENDANCE_MANAGEMENT = 'attendance_management', // 考勤管理
  ACTIVITY_MANAGEMENT = 'activity_management',  // 活动管理
  TEACHING_MANAGEMENT = 'teaching_management',  // 教学管理
  ALL = 'all',                // 全部权限
}

export class TeacherApproval extends Model<
  InferAttributes<TeacherApproval>,
  InferCreationAttributes<TeacherApproval>
> {
  declare id: CreationOptional<number>;
  declare teacherId: ForeignKey<User['id']>;
  assignerId: ForeignKey<User['id']>;
  assignerType: 'principal' | 'admin'; // 审核人类型
  kindergartenId: ForeignKey<Kindergarten['id']>;
  classId: ForeignKey<Class['id']> | null; // 老师负责的班级
  status: TeacherApprovalStatus;
  approvalScope: TeacherApprovalScope;
  requestedAt: CreationOptional<Date>;
  approvedAt: Date | null;
  expiryDate: Date | null;
  approveNote: string | null;
  rejectReason: string | null;
  evidenceFiles: string | null; // 证明材料文件路径，JSON格式
  isPermanent: CreationOptional<boolean>; // 是否永久权限
  teacherTitle: string | null; // 教师职称
  teachingSubjects: string | null; // 教学科目，JSON格式

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  // Associations
  public readonly teacher?: User;
  public readonly assigner?: User;
  public readonly kindergarten?: Kindergarten;
  public readonly class?: Class;
}

export const initTeacherApproval = (sequelize: Sequelize) => {
  TeacherApproval.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '审核记录ID - 主键',
      },
      teacherId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '教师ID - 外键关联用户表',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      assignerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '审核人ID - 外键关联用户表',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      assignerType: {
        type: DataTypes.ENUM('principal', 'admin'),
        allowNull: false,
        defaultValue: 'principal',
        comment: '审核人类型',
      },
      kindergartenId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '幼儿园ID - 外键关联幼儿园表',
        references: {
          model: 'kindergartens',
          key: 'id',
        },
      },
      classId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '班级ID - 外键关联班级表',
        references: {
          model: 'classes',
          key: 'id',
        },
      },
      status: {
        type: DataTypes.ENUM(...Object.values(TeacherApprovalStatus)),
        allowNull: false,
        defaultValue: TeacherApprovalStatus.PENDING,
        comment: '审核状态',
      },
      approvalScope: {
        type: DataTypes.ENUM(...Object.values(TeacherApprovalScope)),
        allowNull: false,
        defaultValue: TeacherApprovalScope.BASIC,
        comment: '审核范围',
      },
      requestedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '申请时间',
      },
      approvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '审核时间',
      },
      expiryDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '权限过期时间（可选）',
      },
      approveNote: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '审核备注',
      },
      rejectReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '拒绝原因',
      },
      evidenceFiles: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: '证明材料文件路径列表',
      },
      isPermanent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '是否永久权限',
      },
      teacherTitle: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '教师职称',
      },
      teachingSubjects: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: '教学科目列表',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'teacher_approvals',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ['teacher_id', 'kindergarten_id'],
          unique: true,
          name: 'unique_teacher_kindergarten',
        },
        {
          fields: ['status'],
          name: 'idx_status',
        },
        {
          fields: ['assigner_id'],
          name: 'idx_assigner_id',
        },
        {
          fields: ['approved_at'],
          name: 'idx_approved_at',
        },
      ],
    }
  );
  return TeacherApproval;
};

export const initTeacherApprovalAssociations = () => {
  TeacherApproval.belongsTo(User, {
    foreignKey: 'teacherId',
    as: 'teacher',
  });
  TeacherApproval.belongsTo(User, {
    foreignKey: 'assignerId',
    as: 'assigner',
  });
  TeacherApproval.belongsTo(Kindergarten, {
    foreignKey: 'kindergartenId',
    as: 'kindergarten',
  });
  TeacherApproval.belongsTo(Class, {
    foreignKey: 'classId',
    as: 'class',
  });
};