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
import { EnrollmentTask } from './enrollment-task.model';
import { Activity } from './activity.model';
import { EnrollmentApplication } from './enrollment-application.model';
import { EnrollmentPlanClass } from './enrollment-plan-class.model';
import { EnrollmentPlanAssignee } from './enrollment-plan-assignee.model';

/**
 * 招生计划状态
 */
export enum EnrollmentPlanStatus {
  DRAFT = 0, // 草稿
  PENDING = 1, // 待开始
  IN_PROGRESS = 2, // 进行中
  FINISHED = 3, // 已结束
  CANCELLED = 4, // 已取消
}

/**
 * 学期
 */
export enum Semester {
  SPRING = 1, // 春季
  AUTUMN = 2, // 秋季
}

/**
 * 招生计划模型
 */
export class EnrollmentPlan extends Model<
  InferAttributes<EnrollmentPlan>,
  InferCreationAttributes<EnrollmentPlan>
> {
  declare id: CreationOptional<number>;
  declare kindergartenId: number;
  declare title: string;
  declare year: number;
  declare semester: Semester;
  declare startDate: Date;
  declare endDate: Date;
  declare targetCount: CreationOptional<number>;
  declare targetAmount: CreationOptional<number>;
  declare ageRange: string;
  declare requirements: string | null;
  declare description: string | null;
  declare approvedBy: ForeignKey<User['id']> | null;
  declare approvedAt: Date | null;
  declare remark: string | null;
  declare status: CreationOptional<EnrollmentPlanStatus>;
  declare creatorId: ForeignKey<User['id']>;
  declare updaterId: ForeignKey<User['id']> | null;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;

  // Associations
  public readonly creator?: User;
  public readonly classes?: Class[];
  public readonly assignees?: User[];
  public readonly tasks?: EnrollmentTask[];
  public readonly activities?: Activity[];
  public readonly applications?: EnrollmentApplication[];


  /**
   * 计算招生进度百分比
   * @returns 进度百分比(0-100)
   */
  public getProgressPercentage(): number {
    if (this.targetCount === 0) {
      return 0;
    }
    // 注意：需要通过关联查询获取申请数量
    // 这里返回0，实际使用时需要在查询时包含applications关联
    return 0;
  }

  public isEditable(): boolean {
    return this.status === EnrollmentPlanStatus.DRAFT || this.status === EnrollmentPlanStatus.PENDING;
  }

  public isExpired(): boolean {
    const now = new Date();
    return now > this.endDate;
  }
}

export const initEnrollmentPlan = (sequelize: Sequelize) => {
  EnrollmentPlan.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '招生计划ID - 主键',
      },
      kindergartenId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '幼儿园ID - 外键关联幼儿园表',
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '标题 - 招生计划名称',
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '年份',
      },
      semester: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: '学期 - 1:春季 2:秋季',
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: '计划开始日期',
      },
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: '计划结束日期',
      },
      targetCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'target_count',
        comment: '招生目标人数',
      },
      targetAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'target_amount',
        comment: '招生目标金额',
      },
      ageRange: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'age_range',
        comment: '招生年龄范围',
      },
      requirements: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '招生要求',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '招生计划描述',
      },
      approvedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'approved_by',
        comment: '审批人ID',
      },
      approvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'approved_at',
        comment: '审批时间',
      },
      remark: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: '备注信息',
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: EnrollmentPlanStatus.DRAFT,
        comment: '招生状态 - 0:草稿 1:待开始 2:进行中 3:已结束 4:已取消',
      },
      creatorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'creator_id',
        comment: '创建人ID',
      },
      updaterId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'updater_id',
        comment: '更新人ID',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'enrollment_plans',
      timestamps: true,
      paranoid: true,
      underscored: true,
      comment: '招生计划表',
    }
  );
  return EnrollmentPlan;
};

export const initEnrollmentPlanAssociations = () => {
  // 招生计划属于某个幼儿园
  EnrollmentPlan.belongsTo(Kindergarten, {
    foreignKey: 'kindergartenId',
    as: 'kindergarten',
  });

  // 一个招生计划可以包含多个招生任务
  EnrollmentPlan.hasMany(EnrollmentTask, {
    foreignKey: 'planId',
    as: 'tasks',
    onDelete: 'CASCADE',
  });

  // 一个招生计划可以包含多个活动
  EnrollmentPlan.hasMany(Activity, {
    foreignKey: 'planId',
    as: 'activities',
    onDelete: 'SET NULL',
  });

  // 一个招生计划可以收到多个报名申请
  EnrollmentPlan.hasMany(EnrollmentApplication, {
    foreignKey: 'planId',
    as: 'applications',
    onDelete: 'CASCADE',
  });

  // 招生计划与班级是多对多关系
  EnrollmentPlan.belongsToMany(Class, {
    through: EnrollmentPlanClass,
    foreignKey: 'planId',
    otherKey: 'classId',
    as: 'planClasses', // <--- changed alias from 'classes' to 'planClasses' to avoid conflict
  });

  // 招生计划与负责人是多对多关系
  EnrollmentPlan.belongsToMany(User, {
    through: EnrollmentPlanAssignee,
    foreignKey: 'planId',
    otherKey: 'assigneeId',
    as: 'assignees',
  });

  // 创建人
  EnrollmentPlan.belongsTo(User, {
    foreignKey: 'creatorId',
    as: 'creator',
  });
};
