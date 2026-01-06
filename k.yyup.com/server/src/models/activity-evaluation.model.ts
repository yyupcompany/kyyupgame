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
import { Activity } from './activity.model';
import { ActivityRegistration } from './activity-registration.model';
import { Teacher } from './teacher.model';
import { ParentStudentRelation } from './parent-student-relation.model';

export enum EvaluatorType {
  PARENT = 1,
  TEACHER = 2,
  ADMIN = 3,
}

export enum EvaluationStatus {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2,
}

export class ActivityEvaluation extends Model<
  InferAttributes<ActivityEvaluation>,
  InferCreationAttributes<ActivityEvaluation>
> {
  declare id: CreationOptional<number>;
  declare activityId: ForeignKey<Activity['id']>;
  declare registrationId: ForeignKey<ActivityRegistration['id']> | null;
  declare parentId: ForeignKey<ParentStudentRelation['id']> | null;
  declare teacherId: ForeignKey<Teacher['id']> | null;
  declare evaluatorType: EvaluatorType;
  declare evaluatorName: string;
  declare evaluationTime: CreationOptional<Date>;
  declare overallRating: number;
  declare contentRating: number | null;
  declare organizationRating: number | null;
  declare environmentRating: number | null;
  declare serviceRating: number | null;
  declare comment: string | null;
  declare strengths: string | null;
  declare weaknesses: string | null;
  declare suggestions: string | null;
  declare images: string | null;
  declare isPublic: CreationOptional<boolean>;
  declare status: CreationOptional<EvaluationStatus>;
  declare replyContent: string | null;
  declare replyTime: Date | null;
  declare replyUserId: ForeignKey<User['id']> | null;
  declare remark: string | null;
  declare creatorId: ForeignKey<User['id']> | null;
  declare updaterId: ForeignKey<User['id']> | null;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;

  // Associations
  public readonly activity?: Activity;
  public readonly registration?: ActivityRegistration;
  public readonly parent?: ParentStudentRelation;
  public readonly teacher?: Teacher;
  public readonly replyUser?: User;
  public readonly creator?: User;
  public readonly updater?: User;

  public async reply(content: string, userId: number): Promise<void> {
    this.replyContent = content;
    this.replyTime = new Date();
    this.replyUserId = userId;
    await this.save();
  }

  public getImagesArray(): string[] {
    if (!this.images) {
      return [];
    }
    return this.images.split(',');
  }
}

export type ActivityEvaluationCreationAttributes = InferCreationAttributes<ActivityEvaluation>;
export type ActivityEvaluationAttributes = InferAttributes<ActivityEvaluation>;

export const initActivityEvaluation = (sequelize: Sequelize) => {
  ActivityEvaluation.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '评价记录ID',
      },
      activityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '活动ID',
      },
      registrationId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '报名记录ID',
      },
      parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '家长ID',
      },
      teacherId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '教师ID',
      },
      evaluatorType: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: '评价人类型 - 1:家长 2:教师 3:管理员',
      },
      evaluatorName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '评价人姓名',
      },
      evaluationTime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '评价时间',
      },
      overallRating: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: '综合评分(1-5)',
      },
      contentRating: {
        type: DataTypes.TINYINT,
        allowNull: true,
        comment: '内容评分(1-5)',
      },
      organizationRating: {
        type: DataTypes.TINYINT,
        allowNull: true,
        comment: '组织评分(1-5)',
      },
      environmentRating: {
        type: DataTypes.TINYINT,
        allowNull: true,
        comment: '环境评分(1-5)',
      },
      serviceRating: {
        type: DataTypes.TINYINT,
        allowNull: true,
        comment: '服务评分(1-5)',
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '评价内容',
      },
      strengths: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '优点',
      },
      weaknesses: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '缺点',
      },
      suggestions: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '建议',
      },
      images: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '评价图片URL, 逗号分隔',
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: '是否公开',
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: EvaluationStatus.PENDING,
        comment: '状态 - 0:待审核 1:审核通过 2:审核不通过',
      },
      replyContent: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '回复内容',
      },
      replyTime: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '回复时间',
      },
      replyUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '回复人ID',
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
      tableName: 'activity_evaluations',
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );
  return ActivityEvaluation;
};

export const initActivityEvaluationAssociations = () => {
  ActivityEvaluation.belongsTo(Activity, {
    foreignKey: 'activityId',
    as: 'activity',
  });
  ActivityEvaluation.belongsTo(ActivityRegistration, {
    foreignKey: 'registrationId',
    as: 'registration',
  });
  ActivityEvaluation.belongsTo(ParentStudentRelation, {
    foreignKey: 'parentId',
    as: 'parent',
  });
  ActivityEvaluation.belongsTo(Teacher, {
    foreignKey: 'teacherId',
    as: 'teacher',
  });
  ActivityEvaluation.belongsTo(User, {
    foreignKey: 'replyUserId',
    as: 'replyUser',
  });
  ActivityEvaluation.belongsTo(User, {
    foreignKey: 'creatorId',
    as: 'creator',
  });
  ActivityEvaluation.belongsTo(User, {
    foreignKey: 'updaterId',
    as: 'updater',
  });
};
