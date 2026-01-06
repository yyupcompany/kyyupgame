import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { AssessmentRecord } from './assessment-record.model';
import { AssessmentQuestion } from './assessment-question.model';

/**
 * 测评答案模型
 */
export class AssessmentAnswer extends Model<
  InferAttributes<AssessmentAnswer>,
  InferCreationAttributes<AssessmentAnswer>
> {
  declare id: CreationOptional<number>;
  declare recordId: number;
  declare questionId: number;
  declare answer: any; // JSON格式
  declare score: number;
  declare timeSpent?: number;
  declare readonly createdAt: CreationOptional<Date>;

  declare readonly record?: AssessmentRecord;
  declare readonly question?: AssessmentQuestion;

  static initModel(sequelize: Sequelize): void {
    AssessmentAnswer.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        recordId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'assessment_records',
            key: 'id',
          },
        },
        questionId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'assessment_questions',
            key: 'id',
          },
        },
        answer: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        score: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        timeSpent: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: 'assessment_answers',
        timestamps: false,
      }
    );
  }

  static associate(models: {
    AssessmentRecord: typeof AssessmentRecord;
    AssessmentQuestion: typeof AssessmentQuestion;
  }): void {
    AssessmentAnswer.belongsTo(models.AssessmentRecord, {
      foreignKey: 'recordId',
      as: 'record',
    });
    AssessmentAnswer.belongsTo(models.AssessmentQuestion, {
      foreignKey: 'questionId',
      as: 'question',
    });
  }
}





