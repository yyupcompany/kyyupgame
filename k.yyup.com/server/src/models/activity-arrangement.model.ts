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
import { ActivityPlan } from './activity-plan.model';
import { ActivityEvaluation } from './activity-evaluation.model';

export enum ArrangementActivityType {
  INDOOR = 1,
  OUTDOOR = 2,
  HOME_SCHOOL = 3,
  VISIT = 4,
  OTHER = 5,
}

export enum ArrangementStatus {
  NOT_STARTED = 0,
  PREPARING = 1,
  IN_PROGRESS = 2,
  COMPLETED = 3,
  CANCELLED = 4,
}

export class ActivityArrangement extends Model<
  InferAttributes<ActivityArrangement>,
  InferCreationAttributes<ActivityArrangement>
> {
  declare id: CreationOptional<number>;
  declare planId: ForeignKey<ActivityPlan['id']>;
  declare title: string;
  declare activityType: ArrangementActivityType;
  declare location: string;
  declare startTime: Date;
  declare endTime: Date;
  declare participantCount: number;
  declare targetAge: string | null;
  declare objectives: string | null;
  declare contentOutline: string | null;
  declare materials: string | null;
  declare emergencyPlan: string | null;
  declare status: CreationOptional<ArrangementStatus>;
  declare evaluationId: ForeignKey<ActivityEvaluation['id']> | null;
  declare remark: string | null;
  declare creatorId: ForeignKey<User['id']> | null;
  declare updaterId: ForeignKey<User['id']> | null;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;

  // Associations
  public readonly plan?: ActivityPlan;
  public readonly evaluation?: ActivityEvaluation;
  public readonly creator?: User;
  public readonly updater?: User;

  public isStarted(): boolean {
    return new Date() >= this.startTime;
  }

  public isEnded(): boolean {
    return new Date() > this.endTime;
  }

  public getDurationMinutes(): number {
    return Math.round((this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60));
  }

  public isEditable(): boolean {
    return this.status === ArrangementStatus.NOT_STARTED || this.status === ArrangementStatus.PREPARING;
  }
}

export const initActivityArrangement = (sequelize: Sequelize) => {
  ActivityArrangement.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '活动安排ID',
      },
      planId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '活动计划ID - 外键关联活动计划表',
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '活动标题',
      },
      activityType: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: '活动类型 - 1:室内活动 2:户外活动 3:家园共育 4:参观考察 5:其他',
      },
      location: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: '活动地点',
      },
      startTime: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '开始时间',
      },
      endTime: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '结束时间',
      },
      participantCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '参与人数',
      },
      targetAge: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '目标年龄段',
      },
      objectives: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '活动目标',
      },
      contentOutline: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '内容大纲',
      },
      materials: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '所需材料',
      },
      emergencyPlan: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '应急预案',
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: ArrangementStatus.NOT_STARTED,
        comment: '状态 - 0:未开始 1:筹备中 2:进行中 3:已完成 4:已取消',
      },
      evaluationId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '评价ID - 关联活动评价表',
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
      tableName: 'activity_arrangements',
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );
  return ActivityArrangement;
};

export const initActivityArrangementAssociations = () => {
  ActivityArrangement.belongsTo(ActivityPlan, {
    foreignKey: 'planId',
    as: 'plan',
  });
  ActivityArrangement.belongsTo(ActivityEvaluation, {
    foreignKey: 'evaluationId',
    as: 'evaluation',
  });
  ActivityArrangement.belongsTo(User, {
    foreignKey: 'creatorId',
    as: 'creator',
  });
  ActivityArrangement.belongsTo(User, {
    foreignKey: 'updaterId',
    as: 'updater',
  });
};
