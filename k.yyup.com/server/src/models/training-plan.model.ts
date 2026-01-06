import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { User } from './user.model';

/**
 * 训练计划模型
 */
export class TrainingPlan extends Model<
  InferAttributes<TrainingPlan>,
  InferCreationAttributes<TrainingPlan>
> {
  declare id: CreationOptional<number>;
  declare userId: number; // 用户ID
  declare childId: number; // 孩子ID
  declare assessmentReportId?: number; // 关联的测评报告ID
  declare title: string; // 计划标题
  declare description: string; // 计划描述
  declare targetAbilities: string[]; // 目标能力维度
  declare activityIds: number[]; // 关联的训练活动ID
  declare durationDays: number; // 训练周期(天)
  declare difficulty: 'easy' | 'medium' | 'hard'; // 难度等级
  declare status: 'active' | 'completed' | 'paused'; // 状态
  declare startDate?: Date; // 开始日期
  declare endDate?: Date; // 结束日期
  declare progress?: number; // 完成进度百分比
  declare preferences: Record<string, any>; // 用户偏好设置
  declare aiRecommendations?: string; // AI推荐理由
  declare completedActivities: number; // 已完成活动数
  declare totalActivities: number; // 总活动数
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  // 关联
  declare user?: User;

  static initModel(sequelize: Sequelize): void {
    TrainingPlan.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          comment: '用户ID',
          references: {
            model: 'users',
            key: 'id',
          },
        },
        childId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          comment: '孩子ID',
        },
        assessmentReportId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          comment: '关联的测评报告ID',
          references: {
            model: 'assessment_reports',
            key: 'id',
          },
        },
        title: {
          type: DataTypes.STRING(200),
          allowNull: false,
          comment: '计划标题',
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: '计划描述',
        },
        targetAbilities: {
          type: DataTypes.JSON,
          allowNull: false,
          defaultValue: [],
          comment: '目标能力维度',
        },
        activityIds: {
          type: DataTypes.JSON,
          allowNull: false,
          defaultValue: [],
          comment: '关联的训练活动ID',
        },
        durationDays: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 30,
          comment: '训练周期(天)',
        },
        difficulty: {
          type: DataTypes.ENUM('easy', 'medium', 'hard'),
          allowNull: false,
          defaultValue: 'medium',
          comment: '难度等级',
        },
        status: {
          type: DataTypes.ENUM('active', 'completed', 'paused'),
          allowNull: false,
          defaultValue: 'active',
          comment: '状态',
        },
        startDate: {
          type: DataTypes.DATE,
          allowNull: true,
          comment: '开始日期',
        },
        endDate: {
          type: DataTypes.DATE,
          allowNull: true,
          comment: '结束日期',
        },
        progress: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: 0,
          comment: '完成进度百分比',
        },
        preferences: {
          type: DataTypes.JSON,
          allowNull: true,
          defaultValue: {},
          comment: '用户偏好设置',
        },
        aiRecommendations: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: 'AI推荐理由',
        },
        completedActivities: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: '已完成活动数',
        },
        totalActivities: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: '总活动数',
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
      },
      {
        sequelize,
        tableName: 'training_plans',
        modelName: 'TrainingPlan',
        indexes: [
          {
            fields: ['userId', 'childId'],
          },
          {
            fields: ['assessmentReportId'],
          },
          {
            fields: ['status'],
          },
          {
            fields: ['difficulty'],
          },
          {
            fields: ['createdAt'],
          },
        ],
      }
    );
  }
}

// 导出初始化函数以供init.ts使用
export const initTrainingPlanModel = (sequelize) => {
  TrainingPlan.initModel(sequelize);
};