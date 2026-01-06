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
import { ActivityRegistration } from './activity-registration.model';
import { ActivityEvaluation } from './activity-evaluation.model';
import { AdmissionResult } from './admission-result.model';
import { AdmissionNotification } from './admission-notification.model';

export class ParentStudentRelation extends Model<
  InferAttributes<ParentStudentRelation>,
  InferCreationAttributes<ParentStudentRelation>
> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User['id']>;
  declare studentId: ForeignKey<Student['id']>;
  declare relationship: string;
  declare isPrimaryContact: CreationOptional<number>;
  declare isLegalGuardian: CreationOptional<number>;
  declare idCardNo: string | null;
  declare workUnit: string | null;
  declare occupation: string | null;
  declare education: string | null;
  declare address: string | null;
  declare remark: string | null;
  declare creatorId: ForeignKey<User['id']> | null;
  declare updaterId: ForeignKey<User['id']> | null;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;

  // Associations
  public readonly user?: User;
  public readonly student?: Student;
  public readonly creator?: User;
  public readonly updater?: User;
  public readonly activityRegistrations?: ActivityRegistration[];
  public readonly activityEvaluations?: ActivityEvaluation[];
  public readonly admissionResults?: AdmissionResult[];
  public readonly admissionNotifications?: AdmissionNotification[];
}

export const initParentStudentRelation = (sequelize: Sequelize) => {
  ParentStudentRelation.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '关系ID - 主键',
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '用户ID - 外键关联用户表',
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
      relationship: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: '与学生关系 - 如：父亲、母亲、爷爷、奶奶等',
      },
      isPrimaryContact: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: '是否主要联系人 - 0:否 1:是',
      },
      isLegalGuardian: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: '是否法定监护人 - 0:否 1:是',
      },
      idCardNo: {
        type: DataTypes.STRING(18),
        allowNull: true,
        comment: '身份证号',
      },
      workUnit: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '工作单位',
      },
      occupation: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '职业',
      },
      education: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '学历',
      },
      address: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: '居住地址',
      },
      remark: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: '备注信息',
      },
      creatorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '创建人ID',
      },
      updaterId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '更新人ID',
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
      tableName: 'parent_student_relations',
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );
  return ParentStudentRelation;
};

export const initParentStudentRelationAssociations = () => {
  ParentStudentRelation.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  ParentStudentRelation.belongsTo(Student, {
    foreignKey: 'studentId',
    as: 'student',
  });
  ParentStudentRelation.belongsTo(User, {
    foreignKey: 'creatorId',
    as: 'creator',
  });
   ParentStudentRelation.belongsTo(User, {
    foreignKey: 'updaterId',
    as: 'updater',
  });
  // ParentStudentRelation.hasMany(ActivityRegistration, {
  //     foreignKey: 'parentId',
  //     as: 'activityRegistrations'
  // });
  // ParentStudentRelation.hasMany(ActivityEvaluation, {
  //     foreignKey: 'parentId',
  //     as: 'activityEvaluations'
  // });
  // ParentStudentRelation.hasMany(AdmissionResult, {
  //     foreignKey: 'parentId',
  //     as: 'admissionResults'
  // });
  // ParentStudentRelation.hasMany(AdmissionNotification, {
  //     foreignKey: 'parentId',
  //     as: 'admissionNotifications'
  // });
};


// 为了兼容旧代码，添加默认导出
export default ParentStudentRelation;