import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from 'sequelize';
import { Kindergarten } from './kindergarten.model';
import { Class } from './class.model';
import { User } from './user.model';
import { ParentStudentRelation } from './parent-student-relation.model';
import { ActivityRegistration } from './activity-registration.model';
import { EnrollmentApplication } from './enrollment-application.model';
import { AdmissionResult } from './admission-result.model';

/**
 * 学生性别
 */
export enum StudentGender {
  MALE = 1,
  FEMALE = 2,
}

/**
 * 学生状态
 */
export enum StudentStatus {
  DROPPED_OUT = 0, // 退学
  STUDYING = 1, // 在读
  ON_LEAVE = 2, // 请假
  GRADUATED = 3, // 毕业
  PRE_ADMISSION = 4, // 预录取
}

export class Student extends Model<
  InferAttributes<Student>,
  InferCreationAttributes<Student>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare studentNo: string;
  declare kindergartenId: ForeignKey<Kindergarten['id']>;
  declare classId: ForeignKey<Class['id']> | null;
  declare gender: StudentGender;
  declare birthDate: Date;
  declare idCardNo: string | null;
  declare householdAddress: string | null;
  declare currentAddress: string | null;
  declare bloodType: string | null;
  declare nationality: string | null;
  declare enrollmentDate: Date;
  declare graduationDate: Date | null;
  declare healthCondition: string | null;
  declare allergyHistory: string | null;
  declare specialNeeds: string | null;
  declare photoUrl: string | null;
  declare interests: string | null;
  declare tags: string | null;
  declare status: CreationOptional<StudentStatus>;
  declare remark: string | null;
  declare creatorId: ForeignKey<User['id']> | null;
  declare updaterId: ForeignKey<User['id']> | null;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;

  // Associations
  public readonly kindergarten?: Kindergarten;
  public readonly class?: Class;
  public readonly creator?: User;
  public readonly updater?: User;
  public readonly parents?: ParentStudentRelation[];
  public readonly activityRegistrations?: ActivityRegistration[];
  public readonly enrollmentApplication?: EnrollmentApplication;
  public readonly admissionResult?: AdmissionResult;
}

export const initStudent = (sequelize: Sequelize) => {
  Student.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '学生ID - 主键',
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '学生姓名',
      },
      studentNo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: '学号',
      },
      kindergartenId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '幼儿园ID - 外键关联幼儿园表',
      },
      classId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '班级ID - 外键关联班级表',
      },
      gender: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: '性别 - 1:男 2:女',
      },
      birthDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: '出生日期',
      },
      idCardNo: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '身份证号',
      },
      householdAddress: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: '户籍地址',
      },
      currentAddress: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: '当前居住地址',
      },
      bloodType: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: '血型',
      },
      nationality: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '民族',
      },
      enrollmentDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: '入学日期',
      },
      graduationDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: '毕业日期',
      },
      healthCondition: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: '健康状况',
      },
      allergyHistory: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: '过敏史',
      },
      specialNeeds: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: '特殊需求',
      },
      photoUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '照片URL',
      },
      interests: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: '兴趣爱好',
      },
      tags: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: '标签，多个用逗号分隔',
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: StudentStatus.STUDYING,
        comment: '学生状态 - 0:退学 1:在读 2:请假 3:毕业 4:预录取',
      },
      remark: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: '备注',
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
      tableName: 'students',
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );
  return Student;
};

export const initStudentAssociations = () => {
  Student.belongsTo(Kindergarten, {
    foreignKey: 'kindergartenId',
    as: 'kindergarten',
  });
  Student.belongsTo(Class, {
    foreignKey: 'classId',
    as: 'class',
  });
  Student.belongsTo(User, {
    foreignKey: 'creatorId',
    as: 'creator',
  });
  Student.belongsTo(User, {
    foreignKey: 'updaterId',
    as: 'updater',
  });
  Student.hasMany(ParentStudentRelation, {
      foreignKey: 'studentId',
      as: 'parents'
  });
  Student.hasMany(ActivityRegistration, {
      foreignKey: 'studentId',
      as: 'activityRegistrations'
  });

  Student.hasOne(AdmissionResult, {
      foreignKey: 'studentId',
      as: 'admissionResult'
  });
};


// 为了兼容旧代码，添加默认导出
export default Student;