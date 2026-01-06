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
import { Kindergarten } from './kindergarten.model';
import { Class } from './class.model';
import { ClassTeacher } from './class-teacher.model';
import { EnrollmentTask } from './enrollment-task.model';
import { ActivityEvaluation } from './activity-evaluation.model';


/**
 * 教师职位
 */
export enum TeacherPosition {
  PRINCIPAL = 1, // 园长
  VICE_PRINCIPAL = 2, // 副园长
  RESEARCH_DIRECTOR = 3, // 教研主任
  HEAD_TEACHER = 4, // 班主任
  REGULAR_TEACHER = 5, // 普通教师
  ASSISTANT_TEACHER = 6, // 助教
}

/**
 * 教师学历
 */
export enum TeacherEducation {
  HIGH_SCHOOL = 1, // 高中/中专
  COLLEGE = 2, // 大专
  BACHELOR = 3, // 本科
  MASTER = 4, // 硕士
  DOCTOR = 5, // 博士
}

/**
 * 教师状态
 */
export enum TeacherStatus {
  RESIGNED = 0, // 离职
  ACTIVE = 1, // 在职
  ON_LEAVE = 2, // 请假中
  PROBATION = 3, // 见习期
}

export class Teacher extends Model<
  InferAttributes<Teacher>,
  InferCreationAttributes<Teacher>
> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User['id']>;
  declare kindergartenId: ForeignKey<Kindergarten['id']>;
  declare groupId: ForeignKey<any['id']> | null;  // ✅ 新增：集团ID
  declare teacherNo: string;
  declare position: TeacherPosition;
  declare hireDate: Date | null;
  declare education: TeacherEducation | null;
  declare school: string | null;
  declare major: string | null;
  declare teachingAge: number | null;
  declare professionalSkills: string | null;
  declare certifications: string | null;
  declare emergencyContact: string | null;
  declare emergencyPhone: string | null;
  declare status: CreationOptional<TeacherStatus>;
  declare remark: string | null;
  declare creatorId: ForeignKey<User['id']> | null;
  declare updaterId: ForeignKey<User['id']> | null;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;

  // Associations
  public readonly user?: User;
  public readonly kindergarten?: Kindergarten;
  public readonly classes?: Class[];
  public readonly creator?: User;
  public readonly updater?: User;
  public readonly enrollmentTasks?: EnrollmentTask[];
  public readonly activityEvaluations?: ActivityEvaluation[];
}

export const initTeacher = (sequelize: Sequelize) => {
  Teacher.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '教师ID - 主键',
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
      kindergartenId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '幼儿园ID - 外键关联幼儿园表',
        references: {
          model: 'kindergartens',
          key: 'id',
        },
      },
      groupId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'group_id',
        comment: '所属集团ID - 外键关联集团表',
        references: {
          model: 'groups',
          key: 'id',
        },
      },
      teacherNo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: '教师工号',
      },
      position: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: TeacherPosition.REGULAR_TEACHER,
        comment: '职位 - 1:园长 2:副园长 3:教研主任 4:班主任 5:普通教师 6:助教',
      },
      hireDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: '入职日期',
      },
      education: {
        type: DataTypes.TINYINT,
        allowNull: true,
        comment: '学历 - 1:高中/中专 2:大专 3:本科 4:硕士 5:博士',
      },
      school: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '毕业学校',
      },
      major: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '专业',
      },
      teachingAge: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '教龄(年)',
      },
      professionalSkills: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: '专业技能',
      },
      certifications: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: '资质证书',
      },
      emergencyContact: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '紧急联系人',
      },
      emergencyPhone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: '紧急联系电话',
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: TeacherStatus.ACTIVE,
        comment: '教师状态 - 0:离职 1:在职 2:请假中 3:见习期',
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
      tableName: 'teachers',
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );
  return Teacher;
};

export const initTeacherAssociations = () => {
  // 注意：Teacher模型使用了underscored: true，所以数据库字段名是user_id
  // 但在代码中仍然使用驼峰命名userId，Sequelize会自动转换
  Teacher.belongsTo(User, {
    foreignKey: 'user_id', // ✅ 修复：使用数据库实际字段名
    as: 'user',
  });
  Teacher.belongsTo(Kindergarten, {
    foreignKey: 'kindergartenId',
    as: 'kindergarten',
  });
  Teacher.belongsToMany(Class, {
    through: ClassTeacher,
    foreignKey: 'teacherId',
    otherKey: 'classId',
    as: 'classes',
  });
  Teacher.hasMany(EnrollmentTask, {
    foreignKey: 'teacherId',
    as: 'enrollmentTasks'
  });
  Teacher.hasMany(ActivityEvaluation, {
      foreignKey: 'teacherId',
      as: 'activityEvaluations'
  });
  Teacher.belongsTo(User, {
    foreignKey: 'creatorId',
    as: 'creator'
  });
  Teacher.belongsTo(User, {
    foreignKey: 'updaterId',
    as: 'updater'
  });
};


// 为了兼容旧代码，添加默认导出
export default Teacher;