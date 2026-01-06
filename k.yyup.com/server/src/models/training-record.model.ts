import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

/**
 * 训练记录模型
 */
export class TrainingRecord extends Model<
  InferAttributes<TrainingRecord>,
  InferCreationAttributes<TrainingRecord>
> {
  declare id: CreationOptional<number>;
  declare planId: number; // 训练计划ID
  declare activityId: number; // 训练活动ID
  declare childId: number; // 孩子ID
  declare gameRecordId?: number; // 关联的游戏记录ID
  declare completionTime: Date; // 完成时间
  declare durationSeconds: number; // 实际用时(秒)
  declare score?: number; // 得分
  declare maxScore?: number; // 满分
  declare accuracy?: number; // 准确率(0-100)
  declare performanceRating: 'excellent' | 'good' | 'average' | 'needs_improvement'; // 表现评级
  declare aiFeedback?: string; // AI生成的反馈
  declare parentNotes?: string; // 家长观察记录
  declare progressData: Record<string, any>; // 详细进度数据
  declare difficultyLevel: number; // 实际难度等级
  declare completionStatus: 'completed' | 'partial' | 'abandoned'; // 完成状态
  declare mistakes?: number; // 错误次数
  declare hints?: number; // 提示次数
  declare retryCount?: number; // 重试次数
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  static initModel(sequelize: Sequelize): void {
    TrainingRecord.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        planId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          comment: '训练计划ID',
          references: {
            model: 'training_plans',
            key: 'id',
          },
        },
        activityId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          comment: '训练活动ID',
          references: {
            model: 'training_activities',
            key: 'id',
          },
        },
        childId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          comment: '孩子ID',
        },
        gameRecordId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          comment: '关联的游戏记录ID',
        },
        completionTime: {
          type: DataTypes.DATE,
          allowNull: false,
          comment: '完成时间',
        },
        durationSeconds: {
          type: DataTypes.INTEGER,
          allowNull: false,
          comment: '实际用时(秒)',
        },
        score: {
          type: DataTypes.INTEGER,
          allowNull: true,
          comment: '得分',
        },
        maxScore: {
          type: DataTypes.INTEGER,
          allowNull: true,
          comment: '满分',
        },
        accuracy: {
          type: DataTypes.DECIMAL(5, 2),
          allowNull: true,
          comment: '准确率(0-100)',
        },
        performanceRating: {
          type: DataTypes.ENUM('excellent', 'good', 'average', 'needs_improvement'),
          allowNull: false,
          defaultValue: 'average',
          comment: '表现评级',
        },
        aiFeedback: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: 'AI生成的反馈',
        },
        parentNotes: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: '家长观察记录',
        },
        progressData: {
          type: DataTypes.JSON,
          allowNull: true,
          defaultValue: {},
          comment: '详细进度数据',
        },
        difficultyLevel: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
          comment: '实际难度等级 1-5',
        },
        completionStatus: {
          type: DataTypes.ENUM('completed', 'partial', 'abandoned'),
          allowNull: false,
          defaultValue: 'completed',
          comment: '完成状态',
        },
        mistakes: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: 0,
          comment: '错误次数',
        },
        hints: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: 0,
          comment: '提示次数',
        },
        retryCount: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: 0,
          comment: '重试次数',
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
        tableName: 'training_records',
        modelName: 'TrainingRecord',
        indexes: [
          {
            fields: ['planId', 'activityId'],
          },
          {
            fields: ['childId'],
          },
          {
            fields: ['completionTime'],
          },
          {
            fields: ['performanceRating'],
          },
          {
            fields: ['completionStatus'],
          },
        ],
      }
    );
  }

  // 计算得分百分比
  getScorePercentage(): number {
    if (!this.score || !this.maxScore || this.maxScore === 0) {
      return 0;
    }
    return Math.round((this.score / this.maxScore) * 100);
  }

  // 判断表现是否优秀
  isExcellent(): boolean {
    return this.performanceRating === 'excellent' ||
           (this.getScorePercentage() >= 90 && this.completionStatus === 'completed');
  }

  // 获取训练用时(分钟)
  getDurationMinutes(): number {
    return Math.round(this.durationSeconds / 60);
  }
}

// 导出初始化函数以供init.ts使用
export const initTrainingRecordModel = (sequelize) => {
  TrainingRecord.initModel(sequelize);
};