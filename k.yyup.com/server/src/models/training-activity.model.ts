import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

/**
 * 训练活动模型
 * 将现有游戏转化为训练活动
 */
export class TrainingActivity extends Model<
  InferAttributes<TrainingActivity>,
  InferCreationAttributes<TrainingActivity>
> {
  declare id: CreationOptional<number>;
  declare gameId: number; // 关联现有游戏ID
  declare activityName: string; // 活动名称
  declare activityType: 'cognitive' | 'motor' | 'language' | 'social'; // 活动类型
  declare targetAgeMin: number; // 最小适合年龄
  declare targetAgeMax: number; // 最大适合年龄
  declare difficultyLevel: number; // 难度等级 1-5
  declare estimatedDuration: number; // 预计完成时间(分钟)
  declare learningObjectives: string[]; // 学习目标
  declare trainingTips: string; // 训练指导要点
  declare description: string; // 活动描述
  declare materials: string[]; // 所需材料
  declare benefits: string[]; // 训练益处
  declare isActive: boolean; // 是否启用
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  static initModel(sequelize: Sequelize): void {
    TrainingActivity.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        gameId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          comment: '关联的游戏ID',
        },
        activityName: {
          type: DataTypes.STRING(200),
          allowNull: false,
          comment: '活动名称',
        },
        activityType: {
          type: DataTypes.ENUM('cognitive', 'motor', 'language', 'social'),
          allowNull: false,
          comment: '活动类型',
        },
        targetAgeMin: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 2,
          comment: '最小适合年龄',
        },
        targetAgeMax: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 6,
          comment: '最大适合年龄',
        },
        difficultyLevel: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
          comment: '难度等级 1-5',
        },
        estimatedDuration: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 15,
          comment: '预计完成时间(分钟)',
        },
        learningObjectives: {
          type: DataTypes.JSON,
          allowNull: false,
          defaultValue: [],
          comment: '学习目标',
        },
        trainingTips: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: '训练指导要点',
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: '活动描述',
        },
        materials: {
          type: DataTypes.JSON,
          allowNull: true,
          defaultValue: [],
          comment: '所需材料',
        },
        benefits: {
          type: DataTypes.JSON,
          allowNull: true,
          defaultValue: [],
          comment: '训练益处',
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
          comment: '是否启用',
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
        tableName: 'training_activities',
        modelName: 'TrainingActivity',
        indexes: [
          {
            fields: ['gameId'],
          },
          {
            fields: ['activityType'],
          },
          {
            fields: ['targetAgeMin', 'targetAgeMax'],
          },
          {
            fields: ['activityType', 'targetAgeMin', 'targetAgeMax'],
          },
          {
            fields: ['isActive'],
          },
        ],
      }
    );
  }
}

// 导出初始化函数以供init.ts使用
export const initTrainingActivityModel = (sequelize: Sequelize): void => {
  TrainingActivity.initModel(sequelize);
};