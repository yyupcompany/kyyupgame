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
import { Student } from './student.model';

/**
 * 家长审核状态
 */
export enum ParentApprovalStatus {
  PENDING = 'pending',        // 待审核
  APPROVED = 'approved',      // 已审核通过
  REJECTED = 'rejected',      // 已拒绝
  SUSPENDED = 'suspended',    // 已暂停
}

/**
 * 与孩子的关系类型
 */
export enum ParentRelationType {
  FATHER = 'father',
  MOTHER = 'mother',
  GRANDFATHER = 'grandfather',
  GRANDMOTHER = 'grandmother',
  OTHER = 'other',
}

export class ParentApproval extends Model<
  InferAttributes<ParentApproval>,
  InferCreationAttributes<ParentApproval>
> {
  declare id: CreationOptional<number>;
  declare parentId: ForeignKey<User['id']>;
  declare assignerId: ForeignKey<User['id']> | null;
  declare assignerType: 'principal' | 'admin' | 'teacher' | null;
  declare kindergartenId: ForeignKey<Kindergarten['id']>;
  declare classId: ForeignKey<Class['id']> | null;
  declare studentId: ForeignKey<Student['id']> | null;
  declare status: ParentApprovalStatus;
  declare relationship: ParentRelationType;
  declare childName: string | null;
  declare requestedAt: CreationOptional<Date>;
  declare approvedAt: Date | null;
  declare approveNote: string | null;
  declare rejectReason: string | null;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  // Associations
  public readonly parent?: User;
  public readonly assigner?: User;
  public readonly kindergarten?: Kindergarten;
  public readonly class?: Class;
  public readonly student?: Student;
}

export const initParentApproval = (sequelize: Sequelize) => {
  ParentApproval.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '审核记录ID - 主键',
      },
      parentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '家长ID - 外键关联用户表',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      assignerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '审核人ID - 外键关联用户表',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      assignerType: {
        type: DataTypes.ENUM('principal', 'admin', 'teacher'),
        allowNull: true,
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
      studentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '学生ID - 外键关联学生表（可后续绑定）',
        references: {
          model: 'students',
          key: 'id',
        },
      },
      status: {
        type: DataTypes.ENUM(...Object.values(ParentApprovalStatus)),
        allowNull: false,
        defaultValue: ParentApprovalStatus.PENDING,
        comment: '审核状态',
      },
      relationship: {
        type: DataTypes.ENUM(...Object.values(ParentRelationType)),
        allowNull: false,
        defaultValue: ParentRelationType.OTHER,
        comment: '与孩子的关系',
      },
      childName: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '孩子姓名（注册时填写）',
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
      tableName: 'parent_approvals',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ['parent_id', 'kindergarten_id'],
          unique: true,
          name: 'unique_parent_kindergarten',
        },
        {
          fields: ['status'],
          name: 'idx_parent_approval_status',
        },
        {
          fields: ['assigner_id'],
          name: 'idx_parent_approval_assigner_id',
        },
        {
          fields: ['class_id'],
          name: 'idx_parent_approval_class_id',
        },
        {
          fields: ['student_id'],
          name: 'idx_parent_approval_student_id',
        },
      ],
    }
  );
  return ParentApproval;
};

export const initParentApprovalAssociations = () => {
  ParentApproval.belongsTo(User, {
    foreignKey: 'parentId',
    as: 'parent',
  });
  ParentApproval.belongsTo(User, {
    foreignKey: 'assignerId',
    as: 'assigner',
  });
  ParentApproval.belongsTo(Kindergarten, {
    foreignKey: 'kindergartenId',
    as: 'kindergarten',
  });
  ParentApproval.belongsTo(Class, {
    foreignKey: 'classId',
    as: 'class',
  });
  ParentApproval.belongsTo(Student, {
    foreignKey: 'studentId',
    as: 'student',
  });
};

