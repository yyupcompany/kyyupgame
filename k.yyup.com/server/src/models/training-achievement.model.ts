import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

/**
 * 训练成就模型
 */
export class TrainingAchievement extends Model<
  InferAttributes<TrainingAchievement>,
  InferCreationAttributes<TrainingAchievement>
> {
  declare id: CreationOptional<number>;
  declare childId: number; // 孩子ID
  declare achievementType: 'streak' | 'completion' | 'improvement' | 'mastery'; // 成就类型
  declare achievementName: string; // 成就名称
  declare achievementDescription: string; // 成就描述
  declare badgeIcon: string; // 徽章图标
  declare badgeColor: string; // 徽章颜色
  declare pointsAwarded: number; // 奖励积分
  declare level: number; // 成就等级
  declare criteria: Record<string, any>; // 达成标准
  declare progress?: number; // 当前进度
  declare maxProgress?: number; // 最大进度
  declare isEarned: boolean; // 是否已获得
  declare earnedAt?: Date; // 获得时间
  declare relatedRecordId?: number; // 关联的训练记录ID
  declare parentId?: number; // 家长ID
  declare isPublic: boolean; // 是否公开显示
  declare tags: string[]; // 标签
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  static initModel(sequelize: Sequelize): void {
    TrainingAchievement.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        childId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          comment: '孩子ID',
        },
        achievementType: {
          type: DataTypes.ENUM('streak', 'completion', 'improvement', 'mastery'),
          allowNull: false,
          comment: '成就类型',
        },
        achievementName: {
          type: DataTypes.STRING(200),
          allowNull: false,
          comment: '成就名称',
        },
        achievementDescription: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: '成就描述',
        },
        badgeIcon: {
          type: DataTypes.STRING(100),
          allowNull: true,
          defaultValue: '🏆',
          comment: '徽章图标',
        },
        badgeColor: {
          type: DataTypes.STRING(20),
          allowNull: true,
          defaultValue: '#FFD700',
          comment: '徽章颜色',
        },
        pointsAwarded: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: '奖励积分',
        },
        level: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
          comment: '成就等级',
        },
        criteria: {
          type: DataTypes.JSON,
          allowNull: true,
          defaultValue: {},
          comment: '达成标准',
        },
        progress: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: 0,
          comment: '当前进度',
        },
        maxProgress: {
          type: DataTypes.INTEGER,
          allowNull: true,
          comment: '最大进度',
        },
        isEarned: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: '是否已获得',
        },
        earnedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          comment: '获得时间',
        },
        relatedRecordId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          comment: '关联的训练记录ID',
        },
        parentId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          comment: '家长ID',
        },
        isPublic: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
          comment: '是否公开显示',
        },
        tags: {
          type: DataTypes.JSON,
          allowNull: true,
          defaultValue: [],
          comment: '标签',
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
        tableName: 'training_achievements',
        modelName: 'TrainingAchievement',
        indexes: [
          {
            fields: ['childId'],
          },
          {
            fields: ['achievementType'],
          },
          {
            fields: ['isEarned'],
          },
          {
            fields: ['earnedAt'],
          },
          {
            fields: ['level'],
          },
        ],
      }
    );
  }

  // 检查成就是否达成
  checkAchievement(currentProgress: number): boolean {
    if (this.isEarned) return true;

    switch (this.achievementType) {
      case 'streak':
        return currentProgress >= (this.criteria.minDays || 7);
      case 'completion':
        return currentProgress >= (this.criteria.requiredCount || 1);
      case 'improvement':
        return currentProgress >= (this.criteria.improvementRate || 20);
      case 'mastery':
        return currentProgress >= (this.criteria.masteryScore || 90);
      default:
        return false;
    }
  }

  // 获取进度百分比
  getProgressPercentage(): number {
    if (!this.maxProgress || this.maxProgress === 0) return 0;
    return Math.round((this.progress / this.maxProgress) * 100);
  }
}

// 导出初始化函数以供init.ts使用
export const initTrainingAchievementModel = (sequelize) => {
  TrainingAchievement.initModel(sequelize);
};