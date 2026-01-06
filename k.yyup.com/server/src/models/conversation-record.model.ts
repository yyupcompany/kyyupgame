import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../init';

interface ConversationRecordAttributes {
  id: number;
  customerId: number;
  teacherId: number;
  speakerType: 'teacher' | 'customer';
  content: string;
  messageType: 'text' | 'image' | 'voice' | 'video';
  sentimentScore?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ConversationRecordCreationAttributes extends Optional<ConversationRecordAttributes, 'id'> {}

class ConversationRecord extends Model<ConversationRecordAttributes, ConversationRecordCreationAttributes>
  implements ConversationRecordAttributes {
  public id!: number;
  public customerId!: number;
  public teacherId!: number;
  public speakerType!: 'teacher' | 'customer';
  public content!: string;
  public messageType!: 'text' | 'image' | 'voice' | 'video';
  public sentimentScore?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ConversationRecord.init(
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
    speakerType: {
      type: DataTypes.ENUM('teacher', 'customer'),
      allowNull: false,
      field: 'speaker_type'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    messageType: {
      type: DataTypes.ENUM('text', 'image', 'voice', 'video'),
      defaultValue: 'text',
      field: 'message_type'
    },
    sentimentScore: {
      type: DataTypes.DECIMAL(3, 2),
      field: 'sentiment_score'
    }
  },
  {
    sequelize,
    tableName: 'conversation_records',
    underscored: true,
    timestamps: true
  }
);

export default ConversationRecord;

