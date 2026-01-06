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
import { ActivityArrangement } from './activity-arrangement.model';

export enum ActivityPlanStatus {
  DRAFT = 0,        // 草稿
  PENDING = 1,      // 待审批
  APPROVED = 2,     // 已审批
  IN_PROGRESS = 3,  // 进行中
  COMPLETED = 4,    // 已完成
  CANCELLED = 5     // 已取消
}

export enum ActivityPlanType {
  REGULAR = 1,      // 常规活动
  ENROLLMENT = 2,   // 招生活动
  FESTIVAL = 3,     // 节日活动
  TEACHING = 4,     // 教学活动
  OTHER = 5         // 其他
}

export enum Semester {
  SPRING = 1,       // 春季学期
  AUTUMN = 2,       // 秋季学期
  WINTER_BREAK = 3, // 寒假
  SUMMER_BREAK = 4  // 暑假
}

export class ActivityPlan extends Model<
  InferAttributes<ActivityPlan>,
  InferCreationAttributes<ActivityPlan>
> {
  declare id: CreationOptional<number>;
  declare kindergartenId: number;
  declare title: string;
  declare year: number;
  declare semester: Semester;
  declare startDate: Date;
  declare endDate: Date;
  declare planType: ActivityPlanType;
  declare targetCount: CreationOptional<number>;
  declare participationTarget: CreationOptional<number>;
  declare budget: CreationOptional<number>;
  declare objectives: string | null;
  declare description: string | null;
  declare status: CreationOptional<ActivityPlanStatus>;
  declare approvedBy: number | null;
  declare approvedAt: Date | null;
  declare remark: string | null;
  declare creatorId: ForeignKey<User['id']>;
  declare updaterId: ForeignKey<User['id']> | null;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;

  // Associations
  public readonly creator?: User;
  public readonly arrangements?: ActivityArrangement[];

  public getStatusText(): string {
    const statusMap: Record<number, string> = {
      [ActivityPlanStatus.DRAFT]: '草稿',
      [ActivityPlanStatus.PENDING]: '待审批',
      [ActivityPlanStatus.APPROVED]: '已审批',
      [ActivityPlanStatus.IN_PROGRESS]: '进行中',
      [ActivityPlanStatus.COMPLETED]: '已完成',
      [ActivityPlanStatus.CANCELLED]: '已取消',
    };
    return statusMap[this.status] || '未知状态';
  }

  public isActive(): boolean {
    const now = new Date();
    return now >= this.startDate && now <= this.endDate;
  }

  public getDuration(): number {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

export const initActivityPlan = (sequelize: Sequelize) => {
  ActivityPlan.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      kindergartenId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '幼儿园ID',
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '活动计划标题',
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '年份',
      },
      semester: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: '学期: 1-春季学期, 2-秋季学期, 3-寒假, 4-暑假',
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: '开始日期',
      },
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: '结束日期',
      },
      planType: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: '计划类型: 1-常规活动, 2-招生活动, 3-节日活动, 4-教学活动, 5-其他',
      },
      targetCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '活动数量目标',
      },
      participationTarget: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '参与人数目标',
      },
      budget: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: '预算金额',
      },
      objectives: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '计划目标',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '计划描述',
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: ActivityPlanStatus.DRAFT,
        comment: '状态：0-草稿，1-待审批，2-已审批，3-进行中，4-已完成，5-已取消',
      },
      approvedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '审批人ID',
      },
      approvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '审批时间',
      },
      remark: {
        type: DataTypes.TEXT,
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
      tableName: 'activity_plans',
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );
  return ActivityPlan;
};

export const initActivityPlanAssociations = () => {
  ActivityPlan.belongsTo(User, {
    foreignKey: 'creatorId',
    as: 'creator',
  });
  ActivityPlan.hasMany(ActivityArrangement, {
    foreignKey: 'planId',
    as: 'arrangements',
  });
};
