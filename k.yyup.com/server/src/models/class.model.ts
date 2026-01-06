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
import { Teacher } from './teacher.model';
import { Student } from './student.model';
import { User } from './user.model';
import { EnrollmentPlan } from './enrollment-plan.model';
import { ClassTeacher } from './class-teacher.model';
import { EnrollmentPlanClass } from './enrollment-plan-class.model';
import OutdoorTrainingRecord from './outdoor-training-record.model';
import ExternalDisplayRecord from './external-display-record.model';

/**
 * 班级类型
 */
export enum ClassType {
  SMALL = 1, // 小班
  MIDDLE = 2, // 中班
  LARGE = 3, // 大班
  MIXED = 4, // 混龄班
}

/**
 * 班级状态
 */
export enum ClassStatus {
  DISABLED = 0, // 禁用
  NORMAL = 1, // 正常
  GRADUATED = 2, // 已毕业
}

export class Class extends Model<
  InferAttributes<Class>,
  InferCreationAttributes<Class>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare code: string;
  declare kindergartenId: ForeignKey<Kindergarten['id']>;
  declare type: ClassType;
  declare grade: string | null;
  declare headTeacherId: ForeignKey<Teacher['id']> | null;
  declare assistantTeacherId: ForeignKey<Teacher['id']> | null;
  declare capacity: CreationOptional<number>;
  declare currentStudentCount: CreationOptional<number>;
  declare classroom: string | null;
  declare description: string | null;
  declare imageUrl: string | null;
  declare status: CreationOptional<ClassStatus>;
  declare isSystem: CreationOptional<number>;
  declare creatorId: ForeignKey<User['id']> | null;
  declare updaterId: ForeignKey<User['id']> | null;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;

  // Associations
  public readonly kindergarten?: Kindergarten;
  public readonly headTeacher?: Teacher;
  public readonly assistantTeacher?: Teacher;
  public readonly students?: Student[];
  public readonly teachers?: Teacher[];
  public readonly creator?: User;
  public readonly updater?: User;
  public readonly enrollmentPlans?: EnrollmentPlan[];
}

export const initClass = (sequelize: Sequelize) => {
  Class.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '主键ID',
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '班级名称',
      },
      code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: '班级编码 - 用于唯一标识',
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
      type: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: '班级类型 - 1:小班 2:中班 3:大班 4:混龄班',
      },
      grade: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '年级',
      },
      headTeacherId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '班主任ID - 关联教师表',
      },
      assistantTeacherId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '助教ID - 关联教师表',
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30,
        comment: '班级容量 - 最大学生数',
      },
      currentStudentCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '当前学生数',
      },
      classroom: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '班级教室',
      },
      description: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: '班级描述',
      },
      imageUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '班级图片URL',
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: ClassStatus.NORMAL,
        comment: '班级状态 - 0:禁用 1:正常 2:已毕业',
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
      isSystem: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: '是否系统数据 - 0:否 1:是',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '创建时间',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '更新时间',
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '删除时间（软删除）',
      },
    },
    {
      sequelize,
      tableName: 'classes',
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );
  return Class;
};

export const initClassAssociations = () => {
  Class.belongsTo(Kindergarten, {
    foreignKey: 'kindergartenId',
    as: 'kindergarten',
  });
  Class.belongsTo(Teacher, {
    foreignKey: 'headTeacherId',
    as: 'headTeacher',
  });
  Class.belongsTo(Teacher, {
    foreignKey: 'assistantTeacherId',
    as: 'assistantTeacher',
  });
  Class.hasMany(Student, {
    foreignKey: 'classId',
    as: 'students',
  });
  Class.belongsToMany(Teacher, {
    through: ClassTeacher,
    foreignKey: 'classId',
    otherKey: 'teacherId',
    as: 'teachers',
  });
  Class.belongsTo(User, {
    foreignKey: 'creatorId',
    as: 'creator'
  });
  Class.belongsTo(User, {
    foreignKey: 'updaterId',
    as: 'updater'
  });

  // 教学中心关联
  Class.hasMany(OutdoorTrainingRecord, {
    foreignKey: 'class_id',  // 使用 snake_case 数据库列名
    as: 'outdoorTrainingRecords'
  });
  Class.hasMany(ExternalDisplayRecord, {
    foreignKey: 'class_id',  // 使用 snake_case 数据库列名
    as: 'externalDisplayRecords'
  });
};


// 为了兼容旧代码，添加默认导出
export default Class;