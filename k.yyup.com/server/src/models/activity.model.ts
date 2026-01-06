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
import { EnrollmentPlan } from './enrollment-plan.model';
import { ActivityRegistration } from './activity-registration.model';
import { ActivityEvaluation } from './activity-evaluation.model';

export enum ActivityType {
  OPEN_DAY = 1, // 开放日
  PARENT_MEETING = 2, // 家长会
  FAMILY_ACTIVITY = 3, // 亲子活动
  RECRUITMENT_SEMINAR = 4, // 招生宣讲
  CAMPUS_TOUR = 5, // 园区参观
  OTHER = 6, // 其他
}

export enum ActivityStatus {
  PLANNED = 0, // 计划中
  REGISTRATION_OPEN = 1, // 报名中
  FULL = 2, // 已满员
  IN_PROGRESS = 3, // 进行中
  FINISHED = 4, // 已结束
  CANCELLED = 5, // 已取消
}

export class Activity extends Model<
  InferAttributes<Activity>,
  InferCreationAttributes<Activity>
> {
  declare id: CreationOptional<number>;
  declare kindergartenId: ForeignKey<Kindergarten['id']>;
  declare planId: ForeignKey<EnrollmentPlan['id']> | null;
  declare title: string;
  declare activityType: ActivityType;
  declare coverImage: string | null;
  declare startTime: Date;
  declare endTime: Date;
  declare location: string;
  declare capacity: number;
  declare registeredCount: CreationOptional<number>;
  declare checkedInCount: CreationOptional<number>;
  declare fee: CreationOptional<number>;
  declare description: string | null;
  declare agenda: string | null;
  declare registrationStartTime: Date;
  declare registrationEndTime: Date;
  declare needsApproval: CreationOptional<boolean>;
  declare status: CreationOptional<ActivityStatus>;
  declare remark: string | null;
  declare creatorId: ForeignKey<User['id']> | null;
  declare updaterId: ForeignKey<User['id']> | null;

  // 新增海报和营销相关字段
  declare posterId: number | null;
  declare posterUrl: string | null;
  declare sharePosterUrl: string | null;
  declare marketingConfig: any | null;
  declare publishStatus: CreationOptional<number>;
  declare shareCount: CreationOptional<number>;
  declare viewCount: CreationOptional<number>;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;

  // Associations
  public readonly kindergarten?: Kindergarten;
  public readonly plan?: EnrollmentPlan;
  public readonly creator?: User;
  public readonly updater?: User;
  public readonly registrations?: ActivityRegistration[];
  public readonly evaluations?: ActivityEvaluation[];

  public isFull(): boolean {
    return this.registeredCount >= this.capacity;
  }
}

export const initActivity = (sequelize: Sequelize) => {
  Activity.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '活动ID',
      },
      kindergartenId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '幼儿园ID',
      },
      planId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '招生计划ID',
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '活动标题',
      },
      activityType: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: '活动类型 - 1:开放日 2:家长会 3:亲子活动 4:招生宣讲 5:园区参观 6:其他',
      },
      coverImage: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '封面图片URL',
      },
      startTime: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '活动开始时间',
      },
      endTime: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '活动结束时间',
      },
      location: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: '活动地点',
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '活动容量/名额',
      },
      registeredCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '已报名人数',
      },
      checkedInCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '已签到人数',
      },
      fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
        comment: '活动费用',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '活动描述',
      },
      agenda: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '活动议程',
      },
      registrationStartTime: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '报名开始时间',
      },
      registrationEndTime: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '报名结束时间',
      },
      needsApproval: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '报名是否需要审核',
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: ActivityStatus.PLANNED,
        comment: '状态 - 0:计划中 1:报名中 2:已满员 3:进行中 4:已结束 5:已取消',
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
      // 新增海报和营销相关字段
      posterId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '关联的主海报ID',
      },
      posterUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: '主海报URL',
      },
      sharePosterUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: '分享海报URL',
      },
      marketingConfig: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: '营销配置信息(团购、积分、分享等)',
      },
      publishStatus: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: '发布状态 - 0:草稿 1:已发布 2:已暂停',
      },
      shareCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '分享次数',
      },
      viewCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '浏览次数',
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
      tableName: 'activities',
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );
  return Activity;
};

export const initActivityAssociations = () => {
  Activity.belongsTo(Kindergarten, {
    foreignKey: 'kindergartenId',
    as: 'kindergarten',
  });
  Activity.belongsTo(EnrollmentPlan, {
    foreignKey: 'planId',
    as: 'plan',
  });
  Activity.belongsTo(User, {
    foreignKey: 'creatorId',
    as: 'creator',
  });
  Activity.belongsTo(User, {
    foreignKey: 'updaterId',
    as: 'updater',
  });
  Activity.hasMany(ActivityRegistration, {
    foreignKey: 'activityId',
    as: 'registrations',
  });
  Activity.hasMany(ActivityEvaluation, {
    foreignKey: 'activityId',
    as: 'evaluations',
  });
};
