import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { AssessmentConfig } from './assessment-config.model';

export type QuestionDimension = 'attention' | 'memory' | 'logic' | 'language' | 'motor' | 'social';
export type QuestionType = 'qa' | 'game' | 'interactive';

/**
 * 测评题目模型
 */
export class AssessmentQuestion extends Model<
  InferAttributes<AssessmentQuestion>,
  InferCreationAttributes<AssessmentQuestion>
> {
  declare id: CreationOptional<number>;
  declare configId: number;
  declare dimension: QuestionDimension;
  declare ageGroup: string;
  declare questionType: QuestionType;
  declare title: string;
  declare content: any; // JSON格式
  declare gameConfig?: any; // JSON格式
  declare imageUrl?: string; // 题目配图URL
  declare imagePrompt?: string; // AI生成图片的提示词
  declare audioUrl?: string; // 题目语音播报URL
  declare audioText?: string; // 语音播报文本内容
  declare difficulty: number;
  declare score: number;
  declare sortOrder: number;
  declare status: 'active' | 'inactive';
  declare creatorId?: number;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  declare readonly config?: AssessmentConfig;

  static initModel(sequelize: Sequelize): void {
    AssessmentQuestion.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        configId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'assessment_configs',
            key: 'id',
          },
        },
        dimension: {
          type: DataTypes.ENUM('attention', 'memory', 'logic', 'language', 'motor', 'social'),
          allowNull: false,
        },
        ageGroup: {
          type: DataTypes.STRING(20),
          allowNull: false,
        },
        questionType: {
          type: DataTypes.ENUM('qa', 'game', 'interactive'),
          allowNull: false,
        },
        title: {
          type: DataTypes.STRING(200),
          allowNull: false,
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        gameConfig: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        imageUrl: {
          type: DataTypes.STRING(500),
          allowNull: true,
        },
        imagePrompt: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        audioUrl: {
          type: DataTypes.STRING(500),
          allowNull: true,
        },
        audioText: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        difficulty: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
        score: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 10,
        },
        sortOrder: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        status: {
          type: DataTypes.ENUM('active', 'inactive'),
          allowNull: false,
          defaultValue: 'active',
        },
        creatorId: {
          type: DataTypes.INTEGER,
          allowNull: true,
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
        tableName: 'assessment_questions',
        timestamps: true,
        underscored: true, // 使用驼峰命名，与数据库列名一致
      }
    );
  }

  static associate(): void {
    AssessmentQuestion.belongsTo(AssessmentConfig, {
      foreignKey: 'configId',
      as: 'config',
    });
  }
}

