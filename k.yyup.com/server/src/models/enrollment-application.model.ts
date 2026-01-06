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
import { EnrollmentPlan } from './enrollment-plan.model';
import { Student } from './student.model';
import { Parent } from './parent.model';
import { ParentStudentRelation } from './parent-student-relation.model';
import { EnrollmentApplicationMaterial } from './enrollment-application-material.model';
import { AdmissionResult } from './admission-result.model';

/**
 * 报名申请状态
 */
export enum ApplicationStatus {
  PENDING = 0, // 待审核
  APPROVED = 1, // 已通过
  REJECTED = 2, // 已拒绝
}

export class EnrollmentApplication extends Model<
  InferAttributes<EnrollmentApplication>,
  InferCreationAttributes<EnrollmentApplication>
> {
  declare id: CreationOptional<number>;
  declare planId: ForeignKey<EnrollmentPlan['id']>;
  declare parentId: ForeignKey<Parent['id']> | null;

  declare studentName: string;
  declare gender: string;
  declare birthDate: Date;
  declare status: CreationOptional<ApplicationStatus>;
  declare applyDate: Date;
  declare contactPhone: string;
  declare applicationSource: string | null;
  declare createdBy: ForeignKey<User['id']>;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  // Associations
  public readonly creator?: User;
  public readonly reviewer?: User;
  public readonly plan?: EnrollmentPlan;
  public readonly student?: Student;
  public readonly parent?: ParentStudentRelation;
  public readonly materials?: EnrollmentApplicationMaterial[];
  public readonly admissionResult?: AdmissionResult;
}

export const initEnrollmentApplication = (sequelize: Sequelize) => {
  EnrollmentApplication.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      planId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'plan_id',
        comment: '招生计划ID',
      },
      parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'parent_id',
        comment: '家长ID',
      },
      studentName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'student_name',
        comment: '学生姓名',
      },
      gender: {
        type: DataTypes.STRING(10),
        allowNull: false,
        comment: '性别',
      },
      birthDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'birth_date',
        comment: '出生日期',
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: ApplicationStatus.PENDING,
        comment: '状态：0-待审核，1-已通过，2-已拒绝',
      },
      applyDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'apply_date',
        comment: '申请日期',
      },
      contactPhone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: 'contact_phone',
        comment: '联系电话',
      },
      applicationSource: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'application_source',
        comment: '申请来源',
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'created_by',
        comment: '创建人ID',
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
      tableName: 'enrollment_applications',
      timestamps: true,
      underscored: true,
    }
  );
  return EnrollmentApplication;
};

export const initEnrollmentApplicationAssociations = () => {
  EnrollmentApplication.belongsTo(User, {
    foreignKey: 'creatorId',
    as: 'creator',
  });
  EnrollmentApplication.belongsTo(User, {
    foreignKey: 'reviewerId',
    as: 'reviewer',
  });
  EnrollmentApplication.belongsTo(EnrollmentPlan, {
      foreignKey: 'planId',
      as: 'plan'
  });
  EnrollmentApplication.belongsTo(Student, {
      foreignKey: 'studentId',
      as: 'student'
  });
  EnrollmentApplication.belongsTo(ParentStudentRelation, {
      foreignKey: 'parentId',
      as: 'parent'
  });
  EnrollmentApplication.hasMany(EnrollmentApplicationMaterial, {
      foreignKey: 'applicationId',
      as: 'materials'
  });
  EnrollmentApplication.hasOne(AdmissionResult, {
      foreignKey: 'applicationId',
      as: 'admissionResult'
  });
};
