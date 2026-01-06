import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from 'sequelize';
import { Class } from './class.model';
import { Teacher } from './teacher.model';
import { User } from './user.model';

/**
 * 班级内教师角色
 */
export enum ClassTeacherRole {
  HEAD_TEACHER = 1, // 班主任
  DEPUTY_HEAD_TEACHER = 2, // 副班主任
  SUPPORT_TEACHER = 3, // 配班老师
  SUBJECT_TEACHER = 4, // 专科老师
}

/**
 * 班级教师关系状态
 */
export enum ClassTeacherStatus {
  INACTIVE = 0, // 停用
  ACTIVE = 1, // 正常
}

export class ClassTeacher extends Model<
  InferAttributes<ClassTeacher>,
  InferCreationAttributes<ClassTeacher>
> {
  declare id: CreationOptional<number>;
  declare classId: ForeignKey<Class['id']>;
  declare teacherId: ForeignKey<Teacher['id']>;
  declare role: ClassTeacherRole;
  declare startDate: Date | null;
  declare endDate: Date | null;
  declare status: CreationOptional<ClassTeacherStatus>;
  declare creatorId: ForeignKey<User['id']> | null;
  declare updaterId: ForeignKey<User['id']> | null;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;

  // Associations
  public readonly class?: Class;
  public readonly teacher?: Teacher;
  public readonly creator?: User;
  public readonly updater?: User;
}

export const initClassTeacher = (sequelize: Sequelize) => {
  console.log('初始化 ClassTeacher 模型...');
  ClassTeacher.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '主键ID',
      },
      classId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '班级ID - 外键关联班级表',
      },
      teacherId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '教师ID - 外键关联教师表',
      },
      role: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: '教师角色 - 1:班主任 2:副班主任 3:配班老师 4:专科老师',
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: '开始日期',
      },
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: '结束日期',
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: ClassTeacherStatus.ACTIVE,
        comment: '状态 - 0:停用 1:正常',
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
      tableName: 'class_teachers',
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );
  return ClassTeacher;
};

export const initClassTeacherAssociations = () => {
  ClassTeacher.belongsTo(Class, {
    foreignKey: 'classId',
    as: 'class',
  });
  ClassTeacher.belongsTo(Teacher, {
    foreignKey: 'teacherId',
    as: 'teacher',
  });
   ClassTeacher.belongsTo(User, {
    foreignKey: 'creatorId',
    as: 'creator',
  });
   ClassTeacher.belongsTo(User, {
    foreignKey: 'updaterId',
    as: 'updater',
  });
};


// 为了兼容旧代码，添加默认导出
export default ClassTeacher;