import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../init';

interface AISuggestionHistoryAttributes {
  id: number;
  customerId: number;
  teacherId: number;
  taskId?: number;
  suggestionType?: string;
  inputContext?: any;
  aiResponse?: {
    strategy?: {
      title: string;
      description: string;
      keyPoints: string[];
    };
    scripts?: {
      opening: string;
      core: string[];
      objections: Array<{
        question: string;
        answer: string;
      }>;
    };
    nextActions?: Array<{
      title: string;
      description: string;
      timing: string;
      tips: string[];
    }>;
    successProbability?: number;
    factors?: Array<{
      name: string;
      score: number;
    }>;
  };
  isApplied: boolean;
  feedbackScore?: number;
  createdAt?: Date;
}

interface AISuggestionHistoryCreationAttributes extends Optional<AISuggestionHistoryAttributes, 'id'> {}

class AISuggestionHistory extends Model<AISuggestionHistoryAttributes, AISuggestionHistoryCreationAttributes> 
  implements AISuggestionHistoryAttributes {
  public id!: number;
  public customerId!: number;
  public teacherId!: number;
  public taskId?: number;
  public suggestionType?: string;
  public inputContext?: any;
  public aiResponse?: any;
  public isApplied!: boolean;
  public feedbackScore?: number;
  public readonly createdAt!: Date;
}

AISuggestionHistory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'customer_id'
    },
    teacherId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'teacher_id'
    },
    taskId: {
      type: DataTypes.INTEGER,
      field: 'task_id'
    },
    suggestionType: {
      type: DataTypes.STRING(50),
      field: 'suggestion_type'
    },
    inputContext: {
      type: DataTypes.JSON,
      field: 'input_context'
    },
    aiResponse: {
      type: DataTypes.JSON,
      field: 'ai_response'
    },
    isApplied: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_applied'
    },
    feedbackScore: {
      type: DataTypes.INTEGER,
      field: 'feedback_score'
    }
  },
  {
    sequelize,
    tableName: 'ai_suggestions_history',
    underscored: true,
    timestamps: true,
    updatedAt: false
  }
);

export default AISuggestionHistory;

