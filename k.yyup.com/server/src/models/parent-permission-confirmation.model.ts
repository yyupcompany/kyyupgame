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
import { Student } from './student.model';
import { Kindergarten } from './kindergarten.model';

/**
 * 家长权限确认状态
 */
export enum ParentPermissionStatus {
  PENDING = 'pending',        // 待确认
  APPROVED = 'approved',      // 已确认
  REJECTED = 'rejected',      // 已拒绝
  SUSPENDED = 'suspended',    // 已暂停
}

/**
 * 权限范围
 */
export enum PermissionScope {
  BASIC = 'basic',            // 基础权限（个人信息等）
  ALBUM = 'album',            // 相册权限
  NOTIFICATION = 'notification', // 通知权限
  ACTIVITY = 'activity',      // 活动权限
  ACADEMIC = 'academic',      // 学业权限（成绩、表现等）
  ALL = 'all',                // 全部权限
}

export class ParentPermissionConfirmation extends Model<
  InferAttributes<ParentPermissionConfirmation>,
  InferCreationAttributes<ParentPermissionConfirmation>
> {
  declare id: CreationOptional<number>;
  declare parentId: ForeignKey<User['id']>;
  declare studentId: ForeignKey<Student['id']>;
  declare kindergartenId: ForeignKey<Kindergarten['id']>;
  declare principalId: ForeignKey<User['id']>;
  declare status: ParentPermissionStatus;
  declare permissionScope: PermissionScope;
  declare requestedAt: CreationOptional<Date>;
  declare confirmedAt: Date | null;
  declare expiryDate: Date | null;
  declare confirmNote: string | null;
  declare rejectReason: string | null;
  declare evidenceFiles: string | null; // 证明材料文件路径，JSON格式
  declare isPermanent: CreationOptional<boolean>; // 是否永久权限

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  // Associations
  public readonly parent?: User;
  public readonly student?: Student;
  public readonly kindergarten?: Kindergarten;
  public readonly principal?: User;
}

export const initParentPermissionConfirmation = (sequelize: Sequelize) => {
  ParentPermissionConfirmation.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '确认记录ID - 主键',
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
      studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '学生ID - 外键关联学生表',
        references: {
          model: 'students',
          key: 'id',
        },
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
      principalId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '园长ID - 外键关联用户表',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      status: {
        type: DataTypes.ENUM(...Object.values(ParentPermissionStatus)),
        allowNull: false,
        defaultValue: ParentPermissionStatus.PENDING,
        comment: '确认状态',
      },
      permissionScope: {
        type: DataTypes.ENUM(...Object.values(PermissionScope)),
        allowNull: false,
        defaultValue: PermissionScope.ALL,
        comment: '权限范围',
      },
      requestedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '申请时间',
      },
      confirmedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '确认时间',
      },
      expiryDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '权限过期时间（可选）',
      },
      confirmNote: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '确认备注',
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
      tableName: 'parent_permission_confirmations',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ['parent_id', 'student_id', 'kindergarten_id'],
          unique: true,
          name: 'unique_parent_student_kindergarten',
        },
        {
          fields: ['status'],
          name: 'idx_status',
        },
        {
          fields: ['principal_id'],
          name: 'idx_principal_id',
        },
        {
          fields: ['confirmed_at'],
          name: 'idx_confirmed_at',
        },
      ],
    }
  );
  return ParentPermissionConfirmation;
};

export const initParentPermissionConfirmationAssociations = () => {
  ParentPermissionConfirmation.belongsTo(User, {
    foreignKey: 'parentId',
    as: 'parent',
  });
  ParentPermissionConfirmation.belongsTo(Student, {
    foreignKey: 'studentId',
    as: 'student',
  });
  ParentPermissionConfirmation.belongsTo(Kindergarten, {
    foreignKey: 'kindergartenId',
    as: 'kindergarten',
  });
  ParentPermissionConfirmation.belongsTo(User, {
    foreignKey: 'principalId',
    as: 'principal',
  });
};