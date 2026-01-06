import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../init';

interface ConversationScreenshotAttributes {
  id: number;
  customerId: number;
  teacherId: number;
  imageUrl: string;
  recognizedText?: string;
  analysisResult?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ConversationScreenshotCreationAttributes extends Optional<ConversationScreenshotAttributes, 'id'> {}

class ConversationScreenshot extends Model<ConversationScreenshotAttributes, ConversationScreenshotCreationAttributes>
  implements ConversationScreenshotAttributes {
  public id!: number;
  public customerId!: number;
  public teacherId!: number;
  public imageUrl!: string;
  public recognizedText?: string;
  public analysisResult?: any;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ConversationScreenshot.init(
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
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'image_url'
    },
    recognizedText: {
      type: DataTypes.TEXT,
      field: 'recognized_text'
    },
    analysisResult: {
      type: DataTypes.JSON,
      field: 'analysis_result'
    }
  },
  {
    sequelize,
    tableName: 'conversation_screenshots',
    underscored: true,
    timestamps: true
  }
);

export default ConversationScreenshot;

