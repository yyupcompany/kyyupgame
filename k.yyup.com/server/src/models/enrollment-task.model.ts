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
import { Teacher } from './teacher.model';

/**
 * 招生任务类型
 */
export enum EnrollmentTaskType {
  ONLINE_PROMOTION = 1, // 线上宣传
  OFFLINE_SEMINAR = 2, // 线下宣讲
  CONSULTATION_RECEPTION = 3, // 咨询接待
  ASSESSMENT = 4, // 考核评估
  OTHER = 5, // 其他
}

/**
 * 任务优先级
 */
export enum TaskPriority {
  URGENT = 1, // 紧急
  HIGH = 2, // 高
  MEDIUM = 3, // 中
  LOW = 4, // 低
}

/**
 * 任务状态
 */
export enum TaskStatus {
  NOT_STARTED = 0, // 未开始
  IN_PROGRESS = 1, // 进行中
  COMPLETED = 2, // 已完成
  TERMINATED = 3, // 已终止
}


export class EnrollmentTask extends Model<
  InferAttributes<EnrollmentTask>,
  InferCreationAttributes<EnrollmentTask>
> {
  declare id: CreationOptional<number>;
  declare planId: ForeignKey<EnrollmentPlan['id']>;
  declare teacherId: ForeignKey<Teacher['id']>;
  declare title: string;
  declare taskType: EnrollmentTaskType;
  declare targetCount: number;
  declare actualCount: CreationOptional<number>;
  declare startDate: Date;
  declare endDate: Date;
  declare description: string | null;
  declare requirement: string | null;
  declare priority: CreationOptional<TaskPriority>;
  declare status: CreationOptional<TaskStatus>;
  declare remark: string | null;
  declare creatorId: ForeignKey<User['id']> | null;
  declare updaterId: ForeignKey<User['id']> | null;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;

  public readonly plan?: EnrollmentPlan;
  public readonly teacher?: Teacher;
  public readonly creator?: User;
  public readonly updater?: User;
}

export const initEnrollmentTask = (sequelize: Sequelize) => {
  EnrollmentTask.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '招生任务ID',
      },
      planId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '招生计划ID',
        references: {
          model: 'enrollment_plans',
          key: 'id',
        },
      },
      teacherId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '教师ID',
        references: {
          model: 'teachers',
          key: 'id',
        },
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '任务标题',
      },
      taskType: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: '任务类型 - 1:线上宣传 2:线下宣讲 3:咨询接待 4:考核评估 5:其他',
      },
      targetCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '目标完成人数',
      },
      actualCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '实际完成人数',
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: '任务开始日期',
      },
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: '任务结束日期',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '任务描述',
      },
      requirement: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '任务要求',
      },
      priority: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: TaskPriority.MEDIUM,
        comment: '优先级 - 1:紧急 2:高 3:中 4:低',
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: TaskStatus.NOT_STARTED,
        comment: '任务状态 - 0:未开始 1:进行中 2:已完成 3:已终止',
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
      tableName: 'enrollment_tasks',
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );
  return EnrollmentTask;
};

export const initEnrollmentTaskAssociations = () => {
  EnrollmentTask.belongsTo(EnrollmentPlan, {
    foreignKey: 'planId',
    as: 'plan',
  });
  EnrollmentTask.belongsTo(Teacher, {
    foreignKey: 'teacherId',
    as: 'teacher',
  });
  EnrollmentTask.belongsTo(User, {
    foreignKey: 'creatorId',
    as: 'creator',
  });
  EnrollmentTask.belongsTo(User, {
    foreignKey: 'updaterId',
    as: 'updater',
  });
};
