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
import { EnrollmentApplication } from './enrollment-application.model';
import { Student } from './student.model';
import { Kindergarten } from './kindergarten.model';
import { Class } from './class.model';
import { EnrollmentPlan } from './enrollment-plan.model';
import { ParentStudentRelation } from './parent-student-relation.model';

export enum AdmissionStatus {
  PENDING = 'pending',
  ADMITTED = 'admitted',
  REJECTED = 'rejected',
  WAITLISTED = 'waitlisted',
  CONFIRMED = 'confirmed',
  CANCELED = 'canceled',
}

export enum AdmissionType {
  REGULAR = 'regular',
  SPECIAL = 'special',
  PRIORITY = 'priority',
  TRANSFER = 'transfer',
}

export enum ResultType {
    ADMITTED = 1,
    WAITLISTED = 2,
    REJECTED = 3,
}

export enum PaymentStatus {
    UNPAID = 0,
    PARTIAL = 1,
    PAID = 2,
}


export class AdmissionResult extends Model<
  InferAttributes<AdmissionResult>,
  InferCreationAttributes<AdmissionResult>
> {
  declare id: CreationOptional<number>;
  declare applicationId: ForeignKey<EnrollmentApplication['id']>;
  declare studentId: ForeignKey<Student['id']>;
  declare kindergartenId: ForeignKey<Kindergarten['id']>;
  declare parentId: ForeignKey<ParentStudentRelation['id']>;
  declare planId: ForeignKey<EnrollmentPlan['id']>;
  declare classId: ForeignKey<Class['id']> | null;
  
  declare resultType: ResultType;
  declare type: AdmissionType;
  declare status: AdmissionStatus;
  
  declare admissionDate: Date | null;
  declare confirmationDate: Date | null;
  declare notificationDate: Date | null;
  declare notificationMethod: string | null;
  
  declare tuitionFee: number | null;
  declare tuitionStatus: PaymentStatus | null;
  
  declare comments: string | null;

  declare createdBy: ForeignKey<User['id']>;
  declare updatedBy: ForeignKey<User['id']>;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;
}

export const initAdmissionResult = (sequelize: Sequelize) => {
  AdmissionResult.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      applicationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '申请ID - 外键关联申请表',
        references: { model: 'enrollment_applications', key: 'id' }
      },
      studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '学生ID - 外键关联学生表',
        references: { model: 'students', key: 'id' }
      },
      kindergartenId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '幼儿园ID - 外键关联幼儿园表',
        references: { model: 'kindergartens', key: 'id' }
      },
      parentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '家长ID',
        references: { model: 'parent_student_relations', key: 'id' }
      },
      planId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '招生计划ID',
        references: { model: 'enrollment_plans', key: 'id' }
      },
      classId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '班级ID - 外键关联班级表',
        references: { model: 'classes', key: 'id' }
      },
      resultType: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: '结果类型 - 1:录取 2:等待 3:拒绝'
      },
      type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: AdmissionType.REGULAR,
        comment: '录取类型 - regular:常规录取 special:特殊录取 priority:优先录取 transfer:转学录取'
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: AdmissionStatus.PENDING,
        comment: '录取状态 - pending:待录取 admitted:已录取 rejected:已拒绝 waitlisted:候补 confirmed:已确认入学 canceled:已取消'
      },
      admissionDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '录取日期'
      },
      confirmationDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '确认日期'
      },
      notificationDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '通知日期'
      },
      notificationMethod: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: '通知方式'
      },
      tuitionFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: '学费'
      },
      tuitionStatus: {
        type: DataTypes.TINYINT,
        allowNull: true,
        comment: '学费状态 - 0:未缴费 1:部分缴费 2:已缴费'
      },
      comments: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '备注信息'
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '创建人ID',
        references: { model: 'users', key: 'id' }
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '更新人ID',
        references: { model: 'users', key: 'id' }
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'admission_results',
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );
  return AdmissionResult;
};

export const initAdmissionResultAssociations = () => {
    AdmissionResult.belongsTo(EnrollmentApplication, { foreignKey: 'applicationId', as: 'application' });
    AdmissionResult.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
    AdmissionResult.belongsTo(Kindergarten, { foreignKey: 'kindergartenId', as: 'kindergarten' });
    AdmissionResult.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
    AdmissionResult.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
    AdmissionResult.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });
    AdmissionResult.belongsTo(EnrollmentPlan, { foreignKey: 'planId', as: 'plan' });
    AdmissionResult.belongsTo(ParentStudentRelation, { foreignKey: 'parentId', as: 'parent' });
};
